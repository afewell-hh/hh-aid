// Regression tests for lead's #14 correction review (B1 lost concurrent edit, B2 invalid export head).
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { canonicalize, sha256 } from '../src/contracts/canonical.ts';
import { edit, newProject, refresh, SPIKE_ROOT } from '../src/app/project.ts';
import { ProjectStore, StaleWriteError } from '../src/store/store.ts';
import { seededProject, tmp } from './helpers.ts';

const REVISION = join(SPIKE_ROOT, 'fixtures/evidence-revisions/ds5000-local-pipeline6.json');
const hasDpuSplit = (s: any) => !s.classes.find((c: any) => c.id === 'A').components.some((c: any) => c.item === 'frontend_dual_dpu_200');
const servers = (s: any) => s.populations.reduce((n: number, p: any) => n + p.occurrences.list.length, 0);

// ---------------------------------------------------------------- B1
test('B1 edit/edit: two concurrent edits both apply in turn; neither is acknowledged and lost (lead repro)', async () => {
  const store = ProjectStore.open(seededProject()); try {
    const before = store.index().inputHead!;
    const [a, b] = await Promise.all([edit(store, 'lead', { mutation: 'FB-DPU' }), edit(store, 'lead', { mutation: 'FB-COUNT' })]);
    const ra = store.get(a.id), rb = store.get(b.id), head = store.get(store.index().inputHead!);
    assert.equal(ra.parent, before); assert.equal(ra.revision, 2);
    assert.equal(rb.parent, a.id, 'second edit derived from the first edit, not from the stale head'); assert.equal(rb.revision, 3);
    assert.equal(store.index().inputHead, b.id);
    assert.ok(hasDpuSplit(head), 'DPU split survives in current state'); assert.equal(servers(head), 5, 'FB-COUNT server added');
  } finally { store.close(); }
});

test('B1 edit/refresh: concurrent edit and evidence refresh both survive in the head', async () => {
  const store = ProjectStore.open(seededProject()); try {
    const before = store.index().inputHead!; const oldEv = store.get(before).evidence[0];
    const [e, r] = await Promise.all([edit(store, 'lead', { mutation: 'FB-DPU' }), refresh(store, 'lead', REVISION)]);
    const head = store.get(store.index().inputHead!);
    assert.equal(store.index().inputHead, r.id); assert.equal(head.parent, e.id);
    assert.ok(hasDpuSplit(head), 'edit retained after refresh'); assert.ok(!head.evidence.includes(oldEv) && head.evidence.includes(r.evidence), 'refresh applied');
  } finally { store.close(); }
});

test('B1 stale write from an out-of-date view is rejected visibly and writes nothing', async () => {
  const store = ProjectStore.open(seededProject()); try {
    const base = store.index().inputHead!;
    await edit(store, 'tab-1', { mutation: 'FB-DPU', baseInput: base });
    const headAfterFirst = store.headId(); const docsAfterFirst = readdirSync(join(store.dir, 'docs')).length;
    // tab 2 still shows `base` and patches by array index
    await assert.rejects(edit(store, 'tab-2', { patch: [{ op: 'replace', path: '/populations/0/occurrences/list', value: ['A01'] }], baseInput: base }), StaleWriteError);
    await assert.rejects(refresh(store, 'tab-2', REVISION, base), StaleWriteError);
    assert.equal(store.headId(), headAfterFirst, 'HEAD unchanged'); assert.equal(readdirSync(join(store.dir, 'docs')).length, docsAfterFirst, 'no documents written');
    assert.ok(hasDpuSplit(store.get(store.index().inputHead!)));
    // the same change based on the current head succeeds
    const ok = await edit(store, 'tab-2', { patch: [{ op: 'replace', path: '/populations/0/occurrences/list', value: ['A01'] }], baseInput: store.index().inputHead! });
    assert.equal(ok.unchanged, false);
  } finally { store.close(); }
});

test('B1 store guard: a commit that moves inputHead must name its base, and a mismatched base is refused', async () => {
  const store = ProjectStore.open(seededProject()); try {
    const head = store.index().inputHead!; const h0 = store.headId();
    await assert.rejects(store.commit('t', 'x', () => ({ inputHead: head })), /must state the input head/);
    await assert.rejects(store.commit('t', 'x', () => ({ inputHead: head, expectInputHead: 'f'.repeat(64) })), StaleWriteError);
    assert.equal(store.headId(), h0);
  } finally { store.close(); }
});

// ---------------------------------------------------------------- B2
function cleanTarget() { return join(tmp(), 'target'); }
function assertUninitialized(dir: string) { assert.ok(!existsSync(dir) || readdirSync(dir).length === 0, `${dir} must be left uninitialized`); }
const envelope = (head: unknown, documents: unknown[]) => JSON.stringify({ format: 'hhaid-export/1', head, documents });
const entry = (content: any) => ({ id: sha256(canonicalize(content)), content });
const emptyIndex = (over: any = {}) => ({ kind: 'ProjectIndex', format: 'hhaid/1', projectId: 'P', name: 'n', previous: null, inputHead: null, roots: { inputs: [], outputs: [], evidence: [], stageResults: [], partialCandidates: [], diffs: [], reviews: [] }, ...over });

test('B2 envelope: empty, null, non-digest and missing heads are rejected before any file is written (lead repro)', () => {
  for (const head of ['', null, 0, 'abc', undefined]) {
    const dir = cleanTarget();
    assert.throws(() => ProjectStore.importText(JSON.stringify({ format: 'hhaid-export/1', head, documents: [] }), dir), /head|unknown export members/);
    assertUninitialized(dir);
  }
  for (const bad of [JSON.stringify({ format: 'hhaid-export/1', head: 'a'.repeat(64), documents: {} }), JSON.stringify({ format: 'hhaid-export/1', head: 'a'.repeat(64), documents: [], audit: [1] }), '[]', 'null']) {
    const dir = cleanTarget(); assert.throws(() => ProjectStore.importText(bad, dir)); assertUninitialized(dir);
  }
});

test('B2 head must be a listed ProjectIndex; inputHead must resolve to a listed InputRevision of the project', () => {
  const store = ProjectStore.open(seededProject()); let good: any; try { good = JSON.parse(store.exportText()); } finally { store.close(); }
  const byKind = (k: string) => good.documents.find((d: any) => d.content.kind === k);
  const cases: [string, string, RegExp][] = [
    ['head not among documents', envelope('a'.repeat(64), good.documents), /not among the exported documents/],
    ['head is an InputRevision', envelope(byKind('InputRevision').id, good.documents), /not a ProjectIndex/],
  ];
  // index whose inputHead is a listed evidence document (wrong kind)
  const ev = byKind('EvidenceSnapshot');
  const wrongKind = entry(emptyIndex({ inputHead: ev.id, roots: { ...emptyIndex().roots, evidence: [ev.id] } }));
  cases.push(['inputHead wrong kind', envelope(wrongKind.id, [wrongKind, ev]), /inputHead is a EvidenceSnapshot/]);
  // index whose inputHead resolves but is not listed in roots.inputs (reachable only through evidence? no: carry it as unreachable)
  const inp = byKind('InputRevision');
  const unlisted = entry(emptyIndex({ projectId: inp.content.projectId, inputHead: inp.id, roots: { ...emptyIndex().roots, evidence: [...inp.content.evidence] } }));
  cases.push(['inputHead unlisted', envelope(unlisted.id, [unlisted, inp, ...good.documents.filter((d: any) => inp.content.evidence.includes(d.id))]), /not listed in its input roots|unreachable/]);
  const missing = entry(emptyIndex({ inputHead: 'b'.repeat(64) }));
  cases.push(['inputHead missing', envelope(missing.id, [missing]), /unresolved reference/]);
  const orphanInputs = entry(emptyIndex({ projectId: inp.content.projectId, roots: { ...emptyIndex().roots, inputs: [inp.id] } }));
  cases.push(['inputs listed, no inputHead', envelope(orphanInputs.id, [orphanInputs, inp, ...good.documents.filter((d: any) => inp.content.evidence.includes(d.id))]), /no inputHead/]);
  const foreign = entry(emptyIndex({ projectId: 'OTHER', inputHead: inp.id, roots: { ...emptyIndex().roots, inputs: [inp.id], evidence: [...inp.content.evidence] } }));
  cases.push(['inputHead from another project', envelope(foreign.id, [foreign, inp, ...good.documents.filter((d: any) => inp.content.evidence.includes(d.id))]), /belongs to project/]);
  for (const [name, text, re] of cases) { const dir = cleanTarget(); assert.throws(() => ProjectStore.importText(text, dir), re, name); assertUninitialized(dir); }
});

test('B2 index chain: dropped roots and mixed projects are rejected', () => {
  const g = entry(emptyIndex()); const ev = { kind: 'EvidenceSnapshot', origin: 'synthetic', profile: { name: 'x', spec: { ports: {}, portProfiles: {} } }, source: {}, note: 'n' };
  const e = entry(ev);
  const mid = entry(emptyIndex({ previous: g.id, roots: { ...emptyIndex().roots, evidence: [e.id] } }));
  const dropped = entry(emptyIndex({ previous: mid.id }));
  let dir = cleanTarget(); assert.throws(() => ProjectStore.importText(envelope(dropped.id, [g, e, mid, dropped]), dir), /append-only/); assertUninitialized(dir);
  const mixed = entry(emptyIndex({ projectId: 'Q', previous: g.id }));
  dir = cleanTarget(); assert.throws(() => ProjectStore.importText(envelope(mixed.id, [g, mixed]), dir), /different project/); assertUninitialized(dir);
});

test('B2 a valid empty unseeded project round-trips byte-identically and reopens', () => {
  const src = join(tmp(), 'empty'); const s = newProject(src, 'Empty', 'lead', 'proj-empty'); let text = ''; try { text = s.exportText(); } finally { s.close(); }
  const dir = cleanTarget(); const t = ProjectStore.importText(text, dir); try { assert.equal(t.exportText(), text); assert.equal(t.index().inputHead, null); } finally { t.close(); }
  const r = ProjectStore.open(dir); try { assert.deepEqual(r.fsck(), { reachable: 1, orphans: [], problems: [] }); } finally { r.close(); }
});

test('B2 a non-empty existing target is refused and left untouched', () => {
  const src = join(tmp(), 'e2'); const s = newProject(src, 'E', 'lead', 'proj-e'); let text = ''; try { text = s.exportText(); } finally { s.close(); }
  const before = readFileSync(join(src, 'HEAD'), 'utf8');
  assert.throws(() => ProjectStore.importText(text, src), /not empty/); assert.equal(readFileSync(join(src, 'HEAD'), 'utf8'), before);
});

// ---------------------------------------------------------------- B3
import { assessProject, generate, review, diff } from '../src/app/project.ts';
const OPT = ['cage', 'connector', 'pmd', 'reach', 'fiber'], ASM = ['cage', 'connector', 'media', 'length', 'hostFit'];
const isUnk = (v: any) => v && typeof v === 'object' && v.state === 'unknown';
async function out(store: ProjectStore) { const r = await generate(store, 'lead').result; assert.equal(r.outcome, 'complete'); return { id: r.outputId!, o: store.get(r.outputId!) }; }
const consIndex = (store: ProjectStore, id: string) => store.get(store.index().inputHead!).constructions.findIndex((c: any) => c.id === id);
const setEnd = (ci: number, side: string, values: Record<string, string>) => Object.entries(values).map(([f, v]) => ({ op: 'replace' as const, path: `/constructions/${ci}/ends/${side}/${f}`, value: v }));

test('B3 baseline: every review row carries independent side-A and side-B physical attributes, all typed unknown', async () => {
  const store = ProjectStore.open(seededProject()); try {
    const { o } = await out(store);
    assert.equal(o.reviewRows.length, 3);
    for (const r of o.reviewRows) {
      const want = r.signature.construction.kind === 'parent-module' ? OPT : ASM;
      for (const side of ['sideA', 'sideB']) {
        assert.deepEqual(Object.keys(r.signature[side].physical).sort(), [...want].sort(), `${r.id} ${side} fields`);
        for (const f of want) { assert.ok(isUnk(r.signature[side].physical[f]), `${r.id} ${side}.${f} stays unknown`); assert.ok(r.unknownFields.includes(`${side}.${f}`)); assert.ok(r.inspectableFields.includes(`${side}.${f}`)); }
      }
      assert.match(r.editShortcuts.physicalA, /^construction\/.+#server$/); assert.match(r.editShortcuts.physicalB, /^construction\/.+#switch$/);
    }
    const fe = store.get(store.index().inputHead!).constructions.find((c: any) => c.id === 'FE-OPT');
    assert.equal(fe.ends.server.pmd.provenance, 'manifest:constructions.FE-OPT.pmd', 'unknown carries its source field');
    assert.equal(fe.ends.server.cage.reason, 'not-in-source', 'cage is not in the manifest and is not invented');
  } finally { store.close(); }
});

test('B3 synthetic values: two ends differ despite identical item descriptions; counts unchanged; grouping, staleness and diff follow', async () => {
  const store = ProjectStore.open(seededProject()); try {
    const { id: o1, o: out1 } = await out(store);
    const feA = out1.reviewRows.find((r: any) => r.signature.network === 'NET-FE' && r.signature.sideA.classId === 'A');
    const beRow = out1.reviewRows.find((r: any) => r.signature.network === 'NET-BE');
    await review(store, 'lead', o1, beRow.id, ['sideB.mode'], 'BE checked');
    const fi = consIndex(store, 'FE-OPT');
    // clearly synthetic values; not vendor data and not qualification
    await edit(store, 'lead', { patch: [
      ...setEnd(fi, 'server', { cage: 'SYNTH-CAGE-X', connector: 'SYNTH-CONN-1', pmd: 'SYNTH-PMD-P', reach: 'SYNTH-REACH-50', fiber: 'SYNTH-FIBER-MM' }),
      ...setEnd(fi, 'switch', { cage: 'SYNTH-CAGE-Y', connector: 'SYNTH-CONN-2', pmd: 'SYNTH-PMD-P' }),
    ], note: 'B3 synthetic end attributes (test only)' });
    const { id: o2, o: out2 } = await out(store);
    const row = out2.reviewRows.find((r: any) => r.signature.network === 'NET-FE' && r.signature.sideA.classId === 'A');
    assert.equal(row.signature.sideA.item, feA.signature.sideA.item, 'same item description');
    assert.equal(row.signature.sideA.physical.connector, 'SYNTH-CONN-1'); assert.equal(row.signature.sideB.physical.connector, 'SYNTH-CONN-2');
    assert.notEqual(row.signature.sideA.physical.cage, row.signature.sideB.physical.cage, 'ends differ independently');
    assert.ok(isUnk(row.signature.sideB.physical.reach) && isUnk(row.signature.sideB.physical.fiber), 'unstated switch-end fields remain unknown');
    assert.deepEqual(row.unknownFields, ['sideB.reach', 'sideB.fiber']);
    assert.deepEqual(out2.purchaseLines, out1.purchaseLines, 'physical attributes do not change BOM lines or quantities');
    assert.notEqual(row.id, feA.id, 'material change gives a new row signature');
    assert.equal(row.memberDigest, feA.memberDigest, 'same members');
    // diff reports the field-level material change
    const d = (await diff(store, 'lead', o1, o2)).changes;
    const mc = d.reviewRows.materialChanges.find((m: any) => m.from === feA.id);
    assert.ok(mc && mc.sameMembers); assert.ok(mc.fields.some((f: any) => f.field === 'sideB.connector' && isUnk(f.from) && f.to === 'SYNTH-CONN-2'));
    // inspection: a stated field can be recorded; a still-unknown one cannot
    const rv = await review(store, 'lead', o2, row.id, ['sideA.connector', 'sideB.connector'], 'both connectors inspected manually');
    await assert.rejects(review(store, 'lead', o2, row.id, ['sideB.reach'], 'x'), /unknown is not known/);
    // BE inspection retained: FE-only physical edit is outside its scope
    let a = assessProject(store);
    assert.equal(a.reviews.find((r: any) => store.get(r.id).note === 'BE checked').status, 'retained within unchanged scope');
    assert.equal(a.reviews.find((r: any) => r.id === rv).status, 'retained within unchanged scope');
    // change one switch-end attribute -> that inspection needs review (row signature changed)
    await edit(store, 'lead', { patch: setEnd(consIndex(store, 'FE-OPT'), 'switch', { connector: 'SYNTH-CONN-3' }) });
    await out(store);
    a = assessProject(store);
    const st = a.reviews.find((r: any) => r.id === rv); assert.notEqual(st.status, 'retained within unchanged scope'); assert.match(st.reason, /members moved|signature/);
    assert.equal(a.reviews.find((r: any) => store.get(r.id).note === 'BE checked').status, 'retained within unchanged scope');
  } finally { store.close(); }
});

test('B3 end attributes are validated per construction kind and persist through export/import', async () => {
  const store = ProjectStore.open(seededProject()); try {
    const bi = consIndex(store, 'BE-SPLIT'), fi = consIndex(store, 'FE-OPT');
    await assert.rejects(edit(store, 'lead', { patch: [{ op: 'add', path: `/constructions/${bi}/ends/server/pmd`, value: 'X' }] }), /schema|must NOT|additional/i, 'assembly ends have no PMD');
    await assert.rejects(edit(store, 'lead', { patch: [{ op: 'remove', path: `/constructions/${fi}/ends/switch/cage` }] }), /schema|required/i, 'cannot drop a field');
    await assert.rejects(edit(store, 'lead', { patch: [{ op: 'replace', path: `/constructions/${fi}/ends/switch/cage`, value: '' }] }), /schema|fewer|minLength|must/i, 'empty is not a value; use typed unknown');
    await edit(store, 'lead', { patch: setEnd(bi, 'server', { connector: 'SYNTH-TAIL-END', length: 'SYNTH-2M' }) });
    const text = store.exportText(); const dir = join(tmp(), 'imp'); const t = ProjectStore.importText(text, dir);
    try { const be = t.get(t.index().inputHead!).constructions.find((c: any) => c.id === 'BE-SPLIT'); assert.equal(be.ends.server.length, 'SYNTH-2M'); assert.ok(isUnk(be.ends.switch.length)); } finally { t.close(); }
  } finally { store.close(); }
});
