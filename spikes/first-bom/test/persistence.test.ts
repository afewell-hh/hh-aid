import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { canonicalize, sha256 } from '../src/contracts/canonical.ts';
import { ProjectStore } from '../src/store/store.ts';
import { cli, cliJson, seededProject, tmp } from './helpers.ts';

test('fresh-process persistence: every step is a separate OS process; reopen preserves inputs and outputs', () => {
  const dir = seededProject();
  const g1 = cliJson('generate', dir);
  cli('edit', dir, '--mutation', 'FB-DPU');
  const s = ProjectStore.open(dir); try {
    const idx = s.index(); const head = s.get(idx.inputHead!);
    assert.equal(head.revision, 2); assert.equal(head.parent, idx.roots.inputs.find((i: string) => s.get(i).revision === 1));
    assert.equal(s.get(g1.outputId).inputRevision, 1, 'historical output retained unchanged');
    assert.equal(s.get(head.parent).classes.find((c: any) => c.id === 'A').components.some((c: any) => c.item === 'frontend_dual_dpu_200'), true, 'revision 1 still has the dual-port DPU');
  } finally { s.close(); }
});

function historyProject() {
  const dir = seededProject();
  const o1 = cliJson('generate', dir).outputId;
  const out1 = JSON.parse(cli('show', dir, '--output', o1, '--json'));
  const row = out1.reviewRows.find((r: any) => r.signature.network === 'NET-FE' && r.signature.sideA.classId === 'A');
  cli('review', dir, '--output', o1, '--row', row.id, '--fields', 'sideA.classRevision,sideB.mode', '--note', 'checked both ends');
  cli('edit', dir, '--mutation', 'FB-COUNT');
  const o2 = cliJson('generate', dir).outputId;
  cli('diff', dir, '--from', o1, '--to', o2);
  return { dir, o1, o2, row: row.id };
}

test('export/reimport round trip keeps an older output, a diff and a review; bytes identical; assessment derived', () => {
  const { dir, o1, o2 } = historyProject();
  const x = join(tmp(), 'x.hhaid.json'), y = join(tmp(), 'y.hhaid.json'), q = join(tmp(), 'q');
  cli('export', dir, '-o', x); cli('import', x, q); cli('export', q, '-o', y);
  assert.equal(readFileSync(x, 'utf8'), readFileSync(y, 'utf8'));
  const data = JSON.parse(readFileSync(x, 'utf8'));
  const kinds = data.documents.map((d: any) => d.content.kind);
  for (const k of ['ProjectIndex', 'InputRevision', 'EvidenceSnapshot', 'OutputRevision', 'StageResult', 'DiffRecord', 'ReviewRecord']) assert.ok(kinds.includes(k), k);
  const a = cliJson('assess', q);
  assert.equal(a.outputs.find((o: any) => o.id === o1).status, 'stale');
  assert.equal(a.outputs.find((o: any) => o.id === o2).status, 'current');
  assert.notEqual(a.reviews[0].status, 'retained within unchanged scope', 'FE A row membership changed after A03 was added');
  // regenerating the head in the imported store reproduces o2 exactly
  assert.equal(cliJson('generate', q).outputId, o2);
});

test('reimport rejects tampering, unreachable extras, dangling references, unknown fields and unsafe integers', () => {
  const { dir } = historyProject();
  const x = join(tmp(), 'x.hhaid.json'); cli('export', dir, '-o', x);
  const base = JSON.parse(readFileSync(x, 'utf8'));
  const tryImport = (doc: any, raw?: string) => { const f = join(tmp(), 'bad.hhaid.json'); writeFileSync(f, raw ?? canonicalize(doc)); return () => cli('import', f, join(tmp(), 'q')); };
  const out = base.documents.findIndex((d: any) => d.content.kind === 'OutputRevision');
  const t1 = structuredClone(base); t1.documents[out].content.summary.servers = 5; assert.throws(tryImport(t1), /digest mismatch/);
  const t2 = structuredClone(base); const extra = { kind: 'DiffRecord', from: base.documents[out].id, to: base.documents[out].id, changes: {} }; t2.documents.push({ id: sha256(canonicalize(extra)), content: extra }); t2.documents.sort((a: any, b: any) => (a.id < b.id ? -1 : 1)); assert.throws(tryImport(t2), /unreachable/);
  const t3 = structuredClone(base); t3.documents = t3.documents.filter((d: any) => d.content.kind !== 'ReviewRecord'); assert.throws(tryImport(t3), /unresolved reference/);
  const t4 = structuredClone(base); t4.documents[out].content.surprise = 1; t4.documents[out].id = sha256(canonicalize(t4.documents[out].content)); assert.throws(tryImport(t4), /schema|must NOT have additional/);
  assert.throws(tryImport(null, readFileSync(x, 'utf8').replace('"servers":4', '"servers":9007199254740993')), /unsafe integer/);
  const t5 = structuredClone(base); t5.format = 'hhaid-export/2'; assert.throws(tryImport(t5), /unsupported export format/);
});

test('a crash before HEAD is replaced leaves the project unchanged; fsck reports the orphan', () => {
  const dir = seededProject();
  const s = ProjectStore.open(dir); const before = s.headId();
  const orphan = s.put({ ...s.get(s.index().inputHead!), change: 'never committed', revision: 99 });
  s.close();
  const r = cliJson('fsck', dir); assert.ok(r.orphans.includes(orphan)); assert.equal(r.problems.length, 0);
  const s2 = ProjectStore.open(dir); assert.equal(s2.headId(), before); s2.close();
});

test('a second writer is refused while the project is open', () => {
  const dir = seededProject(); const s = ProjectStore.open(dir);
  try { assert.throws(() => cli('generate', dir), /locked by running process/); } finally { s.close(); }
});
