// Filesystem project store (architecture-options.md §4 @75ba523; ADR-0002).
//   <dir>/HEAD            current ProjectIndex id (atomically replaced: the single commit point)
//   <dir>/docs/<id>.json  immutable canonical documents; id = sha256(canonical content)
//   <dir>/audit.log       append-only, excluded from digests and from export by default
//   <dir>/LOCK            single-writer lock (pid); in-process commits are serialized by a queue
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { byId, canonicalize, sha256 } from '../contracts/canonical.ts';
import { parseStrictJson } from '../contracts/json.ts';
import { validateDocument } from '../contracts/schema.ts';

export type Kind = 'ProjectIndex' | 'InputRevision' | 'EvidenceSnapshot' | 'OutputRevision' | 'StageResult' | 'PartialCandidate' | 'DiffRecord' | 'ReviewRecord';
export const ROOT_LISTS = ['inputs', 'outputs', 'evidence', 'stageResults', 'partialCandidates', 'diffs', 'reviews'] as const;
export type RootList = typeof ROOT_LISTS[number];
const ROOT_KIND: Record<RootList, Kind> = { inputs: 'InputRevision', outputs: 'OutputRevision', evidence: 'EvidenceSnapshot', stageResults: 'StageResult', partialCandidates: 'PartialCandidate', diffs: 'DiffRecord', reviews: 'ReviewRecord' };
export interface ProjectIndex { kind: 'ProjectIndex'; format: 'hhaid/1'; projectId: string; name: string; previous: string | null; inputHead: string | null; roots: Record<RootList, string[]> }

export const EXPORT_FORMAT = 'hhaid-export/1';
const DIGEST = /^[0-9a-f]{64}$/;

/** A write computed from an input head that is no longer current. Never acknowledged; the caller must reload. */
export class StaleWriteError extends Error {
  readonly base: string | null; readonly actual: string | null;
  constructor(expected: string | null, actual: string | null) {
    super(`stale write: change was based on input ${expected?.slice(0, 12) ?? '(none)'} but the current input is ${actual?.slice(0, 12) ?? '(none)'}; reload and reapply`);
    this.name = 'StaleWriteError'; this.base = expected; this.actual = actual;
  }
}
export type CommitDelta = { add?: Partial<Record<RootList, string[]>>; inputHead?: string; expectInputHead?: string | null };
export const IMPORT_MAX_BYTES = 256 * 1024 * 1024;

function writeAtomic(path: string, data: string) {
  const tmp = `${path}.tmp-${process.pid}`;
  const fd = openSync(tmp, 'w'); try { writeFileSync(fd, data); fsyncSync(fd); } finally { closeSync(fd); }
  renameSync(tmp, path);
}

export class ProjectStore {
  readonly dir: string;
  private queue: Promise<unknown> = Promise.resolve();
  private inputQueue: Promise<unknown> = Promise.resolve();
  private locked = false;
  private constructor(dir: string) { this.dir = dir; }

  static create(dir: string, projectId: string, name: string, actor = 'local-user'): ProjectStore {
    if (existsSync(join(dir, 'HEAD'))) throw new Error(`${dir} already contains a project`);
    mkdirSync(join(dir, 'docs'), { recursive: true });
    const s = new ProjectStore(dir); s.acquire();
    const index: ProjectIndex = { kind: 'ProjectIndex', format: 'hhaid/1', projectId, name, previous: null, inputHead: null, roots: Object.fromEntries(ROOT_LISTS.map(r => [r, []])) as any };
    const id = s.put(index); writeAtomic(join(dir, 'HEAD'), id + '\n');
    s.audit(actor, 'create', [id]);
    return s;
  }
  static open(dir: string): ProjectStore {
    if (!existsSync(join(dir, 'HEAD'))) throw new Error(`${dir} is not a project`);
    const s = new ProjectStore(dir); s.acquire(); s.verifyChain(); return s;
  }
  private acquire() {
    const lock = join(this.dir, 'LOCK');
    try { writeFileSync(lock, String(process.pid), { flag: 'wx' }); }
    catch {
      const pid = Number(readFileSync(lock, 'utf8'));
      let alive = false; try { process.kill(pid, 0); alive = pid !== process.pid; } catch { alive = false; }
      if (alive) throw new Error(`project locked by running process ${pid}`);
      writeFileSync(lock, String(process.pid));
    }
    this.locked = true;
  }
  close() { if (this.locked) { rmSync(join(this.dir, 'LOCK'), { force: true }); this.locked = false; } }

  /** Write an immutable document (idempotent); returns its id. Content is schema-validated first. */
  put(content: any): string {
    validateDocument(content);
    const text = canonicalize(content); const id = sha256(text);
    const path = join(this.dir, 'docs', `${id}.json`);
    if (!existsSync(path)) writeAtomic(path, text);
    return id;
  }
  get<T = any>(id: string): T {
    if (!/^[0-9a-f]{64}$/.test(id)) throw new Error(`bad document id ${id}`);
    const text = readFileSync(join(this.dir, 'docs', `${id}.json`), 'utf8');
    if (sha256(text) !== id) throw new Error(`document ${id} digest mismatch`);
    const v = parseStrictJson(text) as any; if (canonicalize(v) !== text) throw new Error(`document ${id} not canonical`);
    return v as T;
  }
  has(id: string) { return existsSync(join(this.dir, 'docs', `${id}.json`)); }
  headId(): string { return readFileSync(join(this.dir, 'HEAD'), 'utf8').trim(); }
  index(): ProjectIndex { return this.get<ProjectIndex>(this.headId()); }

  /** Serialized commit: documents first, then a new index, then HEAD. Concurrent callers queue. */
  commit(actor: string, action: string, f: (idx: ProjectIndex) => CommitDelta | null): Promise<string> {
    const run = async () => {
      const prevId = this.headId(); const prev = this.get<ProjectIndex>(prevId);
      const delta = f(prev); if (!delta) return prevId;
      // Compare-and-set on the input head: a write derived from an older input is rejected, never applied.
      if (delta.expectInputHead !== undefined && delta.expectInputHead !== prev.inputHead) throw new StaleWriteError(delta.expectInputHead, prev.inputHead);
      if (delta.inputHead !== undefined && delta.expectInputHead === undefined) throw new Error('an input-head change must state the input head it was derived from');
      const roots = structuredClone(prev.roots);
      for (const [k, ids] of Object.entries(delta.add ?? {}) as [RootList, string[]][]) {
        for (const id of ids) { if (!this.has(id)) throw new Error(`commit references missing document ${id}`); const kind = this.get(id).kind; if (kind !== ROOT_KIND[k]) throw new Error(`${id} is ${kind}, not ${ROOT_KIND[k]}`); }
        roots[k] = [...new Set([...roots[k], ...ids])].sort(byId);
      }
      const next: ProjectIndex = { ...prev, previous: prevId, inputHead: delta.inputHead ?? prev.inputHead, roots };
      const id = this.put(next);
      writeAtomic(join(this.dir, 'HEAD'), id + '\n');
      this.audit(actor, action, [id, ...Object.values(delta.add ?? {}).flat()]);
      return id;
    };
    const p = this.queue.then(run, run); this.queue = p.catch(() => undefined); return p;
  }
  /** Serialize a complete read-modify-write of the input head (read state, derive, put, commit). Every
   * operation that moves inputHead runs inside this, so concurrent requests in one process apply in turn
   * against the latest head; the commit's expectInputHead check backs this up. */
  withInputLock<T>(f: () => Promise<T>): Promise<T> {
    const p = this.inputQueue.then(f, f); this.inputQueue = p.catch(() => undefined); return p;
  }
  audit(actor: string, action: string, ids: string[], extra: Record<string, unknown> = {}) {
    appendFileSync(join(this.dir, 'audit.log'), JSON.stringify({ at: new Date().toISOString(), actor, action, ids, ...extra }) + '\n');
  }

  verifyChain() {
    const seen = new Set<string>(); let id: string | null = this.headId();
    while (id) { if (seen.has(id)) throw new Error('index chain cycle'); seen.add(id); const idx: ProjectIndex = this.get(id); if (idx.kind !== 'ProjectIndex') throw new Error('HEAD is not an index'); id = idx.previous; }
  }
  /** Every document reachable from HEAD: the index chain, all roots, and all references. */
  closure(): Set<string> {
    const out = new Set<string>(); const stack: string[] = [];
    let id: string | null = this.headId();
    while (id) { out.add(id); const idx: ProjectIndex = this.get(id); for (const r of ROOT_LISTS) stack.push(...idx.roots[r]); id = idx.previous; }
    while (stack.length) { const d = stack.pop()!; if (out.has(d)) continue; out.add(d); stack.push(...referencesOf(this.get(d))); }
    return out;
  }
  fsck(): { reachable: number; orphans: string[]; problems: string[] } {
    const problems: string[] = []; let reach = new Set<string>();
    try { this.verifyChain(); reach = this.closure(); } catch (e) { problems.push(String((e as Error).message)); }
    const all = readdirSync(join(this.dir, 'docs')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
    for (const id of reach) if (!this.has(id)) problems.push(`missing ${id}`);
    for (const f of readdirSync(join(this.dir, 'docs'))) if (f.includes('.tmp-')) problems.push(`incomplete write ${f} (ignored)`);
    return { reachable: reach.size, orphans: all.filter(id => !reach.has(id)).sort(byId), problems };
  }

  exportText(includeAudit = false): string {
    const ids = [...this.closure()].sort(byId);
    const doc: any = { format: EXPORT_FORMAT, head: this.headId(), documents: ids.map(id => ({ id, content: this.get(id) })) };
    if (includeAudit && existsSync(join(this.dir, 'audit.log'))) doc.audit = readFileSync(join(this.dir, 'audit.log'), 'utf8').split('\n').filter(Boolean);
    return canonicalize(doc);
  }

  /** Strict import into a clean directory (architecture-options.md §4 reimport steps 1–8). Everything is
   * validated before any file is written; a failure while writing removes what this import created. */
  static importText(text: string, dir: string, actor = 'local-user'): ProjectStore {
    const data = parseStrictJson(text, IMPORT_MAX_BYTES) as any;                                   // 1–2
    if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new Error('export is not an object');
    const keys = Object.keys(data).sort(byId).join(',');
    if (keys !== 'documents,format,head' && keys !== 'audit,documents,format,head') throw new Error(`unknown export members: ${keys}`);
    if (data.format !== EXPORT_FORMAT) throw new Error(`unsupported export format ${JSON.stringify(data.format)}`);   // 8
    if (typeof data.head !== 'string' || !DIGEST.test(data.head)) throw new Error(`export head must be a document digest, got ${JSON.stringify(data.head)}`);
    if (!Array.isArray(data.documents)) throw new Error('export documents must be an array');
    if ('audit' in data && (!Array.isArray(data.audit) || data.audit.some((l: unknown) => typeof l !== 'string'))) throw new Error('export audit must be an array of strings');
    const docs = new Map<string, any>();
    for (const d of data.documents) {
      if (d === null || typeof d !== 'object' || Array.isArray(d) || Object.keys(d).sort(byId).join(',') !== 'content,id') throw new Error('malformed document entry');
      if (typeof d.id !== 'string' || !DIGEST.test(d.id)) throw new Error('document id must be a digest');
      validateDocument(d.content);                                                                   // 3 (+8 unknown fields)
      if (sha256(canonicalize(d.content)) !== d.id) throw new Error(`digest mismatch for ${d.id}`);  // 4
      if (docs.has(d.id)) throw new Error(`duplicate document ${d.id}`); docs.set(d.id, d.content);
    }
    if (!docs.has(data.head)) throw new Error(`export head ${data.head.slice(0, 12)} is not among the exported documents`);
    if (docs.get(data.head).kind !== 'ProjectIndex') throw new Error(`export head ${data.head.slice(0, 12)} is a ${docs.get(data.head).kind}, not a ProjectIndex`);
    const get = (id: string) => { const c = docs.get(id); if (!c) throw new Error(`unresolved reference ${id}`); return c; };
    // 5: closure from head, acyclic chain; 6: no unreachable extras; 7: consistency
    const reach = new Set<string>(); const stack: string[] = []; const chain: string[] = [];
    let id: string | null = data.head;
    while (id !== null) { if (chain.includes(id)) throw new Error('index chain cycle'); chain.push(id); const idx = get(id); if (idx.kind !== 'ProjectIndex') throw new Error('head chain contains a non-index'); reach.add(id); for (const r of ROOT_LISTS) for (const x of idx.roots[r]) { if (get(x).kind !== ROOT_KIND[r]) throw new Error(`root ${x} has wrong kind`); stack.push(x); } id = idx.previous; }
    while (stack.length) { const d = stack.pop()!; if (reach.has(d)) continue; reach.add(d); stack.push(...referencesOf(get(d))); }
    const extras = [...docs.keys()].filter(k => !reach.has(k)); if (extras.length) throw new Error(`export carries ${extras.length} unreachable document(s)`);
    checkIndexChain(chain.map(c => [c, get(c)]), get);
    for (const [k, c] of docs) checkConsistency(k, c, get);
    if (existsSync(dir) && readdirSync(dir).length) throw new Error(`${dir} is not empty`);
    const created = !existsSync(dir);
    mkdirSync(join(dir, 'docs'), { recursive: true });
    let s: ProjectStore | null = null;
    try {
      s = new ProjectStore(dir); s.acquire();
      for (const c of docs.values()) s.put(c);
      writeAtomic(join(dir, 'HEAD'), data.head + '\n');
      s.audit(actor, 'import', [data.head], { documents: docs.size });
      return s;
    } catch (e) {
      s?.close();
      if (created) rmSync(dir, { recursive: true, force: true }); else for (const f of readdirSync(dir)) rmSync(join(dir, f), { recursive: true, force: true });
      throw e;
    }
  }
}

/** Outgoing references of a document (closure edges). */
export function referencesOf(c: any): string[] {
  switch (c.kind) {
    case 'InputRevision': return [...(c.parent ? [c.parent] : []), ...c.evidence];
    case 'EvidenceSnapshot': return c.parentEvidence ? [c.parentEvidence] : [];
    case 'OutputRevision': return [c.input, ...c.evidence, ...Object.values(c.stageResults as Record<string, string>)];
    case 'StageResult': return [];
    case 'PartialCandidate': return [c.input, ...c.evidence, ...c.completedStages.map((s: any) => s.id)];
    case 'DiffRecord': return [c.from, c.to];
    case 'ReviewRecord': return [c.output];
    case 'ProjectIndex': return [...(c.previous ? [c.previous] : [])];
    default: throw new Error(`unknown kind ${c.kind}`);
  }
}
/** Index chain consistency (newest first): one project, append-only roots, and an input head that resolves to
 * a listed InputRevision of the same project (or null only before seeding). */
function checkIndexChain(chain: [string, ProjectIndex][], get: (id: string) => any) {
  const [, head] = chain[0]!;
  chain.forEach(([id, idx], i) => {
    if (idx.projectId !== head.projectId || idx.format !== head.format) throw new Error(`index ${id.slice(0, 12)} belongs to a different project`);
    if (idx.inputHead !== null) {
      const inp = get(idx.inputHead);
      if (inp.kind !== 'InputRevision') throw new Error(`index ${id.slice(0, 12)} inputHead is a ${inp.kind}, not an InputRevision`);
      if (!idx.roots.inputs.includes(idx.inputHead)) throw new Error(`index ${id.slice(0, 12)} inputHead is not listed in its input roots`);
      if (inp.projectId !== idx.projectId) throw new Error(`index ${id.slice(0, 12)} inputHead belongs to project ${inp.projectId}`);
    } else if (idx.roots.inputs.length) throw new Error(`index ${id.slice(0, 12)} lists inputs but has no inputHead`);
    const older = chain[i + 1]?.[1];
    if (older) for (const r of ROOT_LISTS) for (const x of older.roots[r]) if (!idx.roots[r].includes(x)) throw new Error(`index ${id.slice(0, 12)} drops root ${x.slice(0, 12)} (roots are append-only)`);
  });
}
function checkConsistency(id: string, c: any, get: (id: string) => any) {
  const want = (ref: string, kind: string) => { if (get(ref).kind !== kind) throw new Error(`${id} references ${ref} as ${kind}`); };
  if (c.kind === 'InputRevision') { if (c.parent) want(c.parent, 'InputRevision'); c.evidence.forEach((e: string) => want(e, 'EvidenceSnapshot')); }
  if (c.kind === 'OutputRevision') { want(c.input, 'InputRevision'); Object.values(c.stageResults).forEach((s: any) => want(s, 'StageResult')); }
  if (c.kind === 'PartialCandidate') { want(c.input, 'InputRevision'); c.completedStages.forEach((s: any) => want(s.id, 'StageResult')); }
  if (c.kind === 'DiffRecord') { want(c.from, 'OutputRevision'); want(c.to, 'OutputRevision'); }
  if (c.kind === 'ReviewRecord') want(c.output, 'OutputRevision');
}
