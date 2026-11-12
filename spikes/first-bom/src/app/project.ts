// Application operations shared by the CLI and the local server. The UI never computes quantities.
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { byId, digestOf, sha256 } from '../contracts/canonical.ts';
import { parseStrictJson } from '../contracts/json.ts';
import { assess, diffOutputs, editImpact } from '../engine/diff.ts';
import { RUN_CONFIGS } from '../engine/stages.ts';
import { evidenceFromExtraction, evidenceRevision } from '../evidence/load.ts';
import { MUTATIONS } from '../model/mutations.ts';
import { seedFromManifest } from '../model/seed.ts';
import { replicate } from '../model/scale.ts';
import { AC1_VARIANTS, type Ac1Variant, ac1Evidence, ac1State } from '../model/synthetic.ts';
import type { ProjectState } from '../model/types.ts';
import { startRun, type RunHandle } from '../runner/runner.ts';
import { ProjectStore, StaleWriteError } from '../store/store.ts';

export const SPIKE_ROOT = join(import.meta.dirname, '..', '..');
export const DEFAULT_EVIDENCE = { profile: join(SPIKE_ROOT, 'evidence', 'celestica-ds5000.fabric-v0.144.1.json'), provenance: join(SPIKE_ROOT, 'evidence', 'celestica-ds5000.fabric-v0.144.1.provenance.json') };
export const DEFAULT_DEADLINE_MS: Record<string, number> = { interactive: 5_000, scale: 120_000 };

export function newProject(dir: string, name: string, actor: string, projectId: string = `proj-${randomUUID()}`) {
  return ProjectStore.create(dir, projectId, name, actor);
}

/** Seed from the FB-01 manifest. Verifies the manifest bytes against the source lock when a commit is given. */
export function seed(store: ProjectStore, manifestPath: string, manifestCommit: string, actor: string, replicas = 0) {
  return store.withInputLock(async () => {
  const bytes = readFileSync(manifestPath); const sha = sha256(bytes);
  const lock = JSON.parse(readFileSync(join(SPIKE_ROOT, 'sources.lock.json'), 'utf8'));
  const entry = lock.entries.find((e: any) => e.role === 'generation-input' && e.commit.startsWith(manifestCommit));
  if (!entry || entry.sha256 !== sha) throw new Error(`manifest bytes (sha256 ${sha.slice(0, 12)}) do not match a locked generation input for commit ${manifestCommit}`);
  const manifest = parseStrictJson(bytes.toString('utf8')) as any;
  const ev = evidenceFromExtraction(DEFAULT_EVIDENCE.profile, DEFAULT_EVIDENCE.provenance);
  const evId = store.put(ev);
  if (store.index().inputHead) throw new Error('project already seeded');
  const base = seedFromManifest(manifest, { commit: entry.commit, path: entry.path, sha256: sha }, store.index().projectId, evId, ev);
  const state = replicas ? replicate(base, replicas) : base;
  const id = store.put(state);
  await store.commit(actor, 'seed', () => ({ add: { inputs: [id], evidence: [evId] }, inputHead: id, expectInputHead: null }));
  return id;
  });
}

/** Synthetic AC1 project from the locked manifest's FB-AC1 entry plus a contract variant. */
export function seedSynthetic(store: ProjectStore, manifestPath: string, manifestCommit: string, variant: string, actor: string) {
  return store.withInputLock(async () => {
  if (!(AC1_VARIANTS as readonly string[]).includes(variant)) throw new Error(`unknown AC1 variant ${variant}; one of ${AC1_VARIANTS.join(', ')}`);
  const bytes = readFileSync(manifestPath); const sha = sha256(bytes);
  const lock = JSON.parse(readFileSync(join(SPIKE_ROOT, 'sources.lock.json'), 'utf8'));
  if (!lock.entries.some((e: any) => e.role === 'generation-input' && e.commit.startsWith(manifestCommit) && e.sha256 === sha)) throw new Error('manifest bytes do not match a locked generation input');
  if (store.index().inputHead) throw new Error('project already seeded');
  const m = parseStrictJson(bytes.toString('utf8')) as any;
  const ev = ac1Evidence(m); const evId = store.put(ev);
  const id = store.put(ac1State(m, variant as Ac1Variant, store.index().projectId, evId));
  await store.commit(actor, 'seed-synthetic', () => ({ add: { inputs: [id], evidence: [evId] }, inputHead: id, expectInputHead: null }));
  return id;
  });
}

export type PatchOp = { op: 'replace' | 'add' | 'remove'; path: string; value?: unknown };
function applyPatch(state: any, ops: PatchOp[]) {
  const s = structuredClone(state);
  for (const o of ops) {
    const parts = o.path.split('/').slice(1).map(p => p.replaceAll('~1', '/').replaceAll('~0', '~'));
    if (!parts.length) throw new Error('patch cannot replace the root');
    if (['kind', 'format', 'projectId', 'revision', 'parent', 'seed'].includes(parts[0]!)) throw new Error(`field /${parts[0]} is managed by the store`);
    let t = s; for (const p of parts.slice(0, -1)) { t = Array.isArray(t) ? t[Number(p)] : t[p]; if (t === undefined) throw new Error(`patch path ${o.path} not found`); }
    const last = parts.at(-1)!;
    if (Array.isArray(t)) { const i = last === '-' ? t.length : Number(last); if (!Number.isInteger(i) || i < 0 || i > t.length) throw new Error(`bad index in ${o.path}`); if (o.op === 'add') t.splice(i, 0, o.value); else if (o.op === 'remove') t.splice(i, 1); else t[i] = o.value; }
    else { if (o.op === 'remove') delete t[last]; else { if (o.op === 'replace' && !(last in t)) throw new Error(`patch path ${o.path} not found`); t[last] = o.value; } }
  }
  return s;
}

/** A class whose composition changed gets a new revision; every population pinning it is updated and
 * reported (edit scope preview), never silently re-pinned elsewhere. */
function bumpChangedClasses(oldS: ProjectState, newS: ProjectState) {
  const affected: { classId: string; from: string; to: string; populations: string[] }[] = [];
  for (const c of newS.classes) {
    const o = oldS.classes.find(x => x.id === c.id); if (!o) continue;
    const comp = (x: any) => digestOf({ components: x.components, attachments: x.attachments });
    if (comp(o) !== comp(c) && o.revision === c.revision) {
      const to = `${o.revision.split('~')[0]}~rev${newS.revision}`; c.revision = to;
      const pops = newS.populations.filter(p => p.classId === c.id); for (const p of pops) p.classRevision = to;
      affected.push({ classId: c.id, from: o.revision, to, populations: pops.map(p => p.id) });
    }
  }
  return affected;
}

/** The most recently committed output (what the user last generated), whatever input it was built from;
 * edit impact is previewed against it, so consecutive edits keep reporting what that output no longer covers. */
function latestOutput(store: ProjectStore): any | null {
  const outs = new Set(store.index().roots.outputs); const id = chainOrder(store).filter(x => outs.has(x)).at(-1);
  return id ? store.get(id) : null;
}

/** One input mutation: the whole read-modify-write runs under the store's input lock, so concurrent edits in
 * this process apply in turn (each sees the previous one's result). A caller that derived its change from a
 * specific input (a UI tab's patch with array indexes) passes baseInput; if the head has moved since, the
 * edit is rejected with StaleWriteError and nothing is written. */
export function edit(store: ProjectStore, actor: string, change: { mutation?: string; patch?: PatchOp[]; note?: string; baseInput?: string }) {
  return store.withInputLock(() => editLocked(store, actor, change));
}
async function editLocked(store: ProjectStore, actor: string, change: { mutation?: string; patch?: PatchOp[]; note?: string; baseInput?: string }) {
  const idx = store.index(); if (!idx.inputHead) throw new Error('project has no input revision');
  if (change.baseInput !== undefined && change.baseInput !== idx.inputHead) throw new StaleWriteError(change.baseInput, idx.inputHead);
  const oldS: ProjectState = store.get(idx.inputHead);
  let next: any;
  if (change.mutation) { const f = MUTATIONS[change.mutation]; if (!f) throw new Error(`unknown mutation ${change.mutation}`); next = f(oldS); }
  else if (change.patch) { next = applyPatch(oldS, change.patch); next.change = change.note ?? `patch: ${change.patch.map(p => `${p.op} ${p.path}`).join('; ')}`; }
  else throw new Error('edit needs a mutation or a patch');
  next.revision = oldS.revision + 1; next.parent = idx.inputHead;
  const classScope = bumpChangedClasses(oldS, next);
  const id = store.put(next);
  if (id === idx.inputHead) return { id, unchanged: true, classScope, impact: null };
  const last = latestOutput(store);
  await store.commit(actor, `edit:${change.mutation ?? 'patch'}`, () => ({ add: { inputs: [id] }, inputHead: id, expectInputHead: idx.inputHead }));
  return { id, unchanged: false, classScope, impact: last ? editImpact(store.get(last.input), next, last) : null };
}

export function generate(store: ProjectStore, actor: string, opts: { config?: string; deadlineMs?: number; stepMode?: boolean } = {}): RunHandle {
  const config = RUN_CONFIGS[opts.config ?? 'interactive']; if (!config) throw new Error(`unknown run configuration ${opts.config}`);
  return startRun(store, { actor, config, deadlineMs: opts.deadlineMs ?? DEFAULT_DEADLINE_MS[config.id], stepMode: !!opts.stepMode });
}

/** Controlled evidence refresh: new evidence document + new input revision referencing it. Old outputs untouched. */
export function refresh(store: ProjectStore, actor: string, revisionFile: string, baseInput?: string) {
  return store.withInputLock(async () => {
  const idx = store.index(); if (!idx.inputHead) throw new Error('project has no input revision');
  if (baseInput !== undefined && baseInput !== idx.inputHead) throw new StaleWriteError(baseInput, idx.inputHead);
  const s: ProjectState = store.get(idx.inputHead);
  const file = parseStrictJson(readFileSync(revisionFile, 'utf8')) as any;
  const baseId = s.leafContexts.find(c => c.profile.name === file.profile)?.profile.evidenceId; if (!baseId) throw new Error(`no context uses profile ${file.profile}`);
  const ev = evidenceRevision(store.get(baseId), baseId, file); const evId = store.put(ev);
  const next: ProjectState = structuredClone(s);
  next.evidence = [...new Set(next.evidence.map(e => (e === baseId ? evId : e)))].sort(byId);
  for (const c of next.leafContexts) if (c.profile.evidenceId === baseId) c.profile.evidenceId = evId;
  next.revision = s.revision + 1; next.parent = idx.inputHead; next.change = `evidence refresh: ${file.id} (${file.origin}; not a Hedgehog release)`;
  const id = store.put(next);
  const last = latestOutput(store);
  await store.commit(actor, 'refresh', () => ({ add: { inputs: [id], evidence: [evId] }, inputHead: id, expectInputHead: idx.inputHead }));
  return { id, evidence: evId, impact: last ? editImpact(store.get(last.input), next, last) : null };
  });
}

export async function review(store: ProjectStore, actor: string, outputId: string, rowId: string, fields: string[], note: string, excluded: string[] = []) {
  const o = store.get(outputId); if (o.kind !== 'OutputRevision') throw new Error('not an output');
  const row = o.reviewRows.find((r: any) => r.id === rowId); if (!row) throw new Error(`row ${rowId} not in output`);
  const notInRow = fields.filter(f => !row.inspectableFields.includes(f));
  if (notInRow.length) throw new Error(`not inspectable fields of row ${rowId}: ${notInRow.join(', ')}`);
  const unknownInspected = fields.filter(f => row.unknownFields.includes(f));
  if (unknownInspected.length) throw new Error(`cannot record inspection of unknown fields: ${unknownInspected.join(', ')} (unknown is not known)`);
  const rec = { kind: 'ReviewRecord', output: outputId, row: rowId, rowSignature: digestOf(row.signature), memberDigest: row.memberDigest, members: row.links, fields: [...fields].sort(byId), excluded: [...new Set([...excluded, ...row.unknownFields])].sort(byId), note, actor, revision: o.inputRevision };
  const id = store.put(rec);
  await store.commit(actor, 'review', () => ({ add: { reviews: [id] } }));
  return id;
}

export async function diff(store: ProjectStore, actor: string, from: string, to: string) {
  const rec = { kind: 'DiffRecord', from, to, changes: diffOutputs(store.get(from), store.get(to)) };
  const id = store.put(rec); await store.commit(actor, 'diff', () => ({ add: { diffs: [id] } }));
  return { id, changes: rec.changes };
}

/** Index chain from oldest to newest, flattened to the order roots first appeared. */
export function chainOrder(store: ProjectStore): string[] {
  const chain: any[] = []; let id: string | null = store.headId();
  while (id) { const idx: any = store.get(id); chain.push(idx); id = idx.previous; }
  const seen = new Set<string>(); const order: string[] = [];
  for (const idx of chain.reverse()) for (const list of Object.values(idx.roots) as string[][]) for (const r of list) if (!seen.has(r)) { seen.add(r); order.push(r); }
  return order;
}
export function assessProject(store: ProjectStore) { return assess(store.index(), id => store.get(id), chainOrder(store)); }
