import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { ProjectStore } from '../src/store/store.ts';
import { ROOT, cli, cliJson, seededProject } from './helpers.ts';

const show = (dir: string, id: string) => JSON.parse(cli('show', dir, '--output', id, '--json'));
const rowOf = (o: any, net: string, cls: string) => o.reviewRows.find((r: any) => r.signature.network === net && r.signature.sideA.classId === cls);

test('scoped staleness: after FB-COUNT a B-frontend inspection is retained, an A-frontend inspection needs review', () => {
  const dir = seededProject(); const o1 = cliJson('generate', dir).outputId; const out1 = show(dir, o1);
  cli('review', dir, '--output', o1, '--row', rowOf(out1, 'NET-FE', 'B').id, '--fields', 'sideB.mode', '--note', 'B frontend checked');
  cli('review', dir, '--output', o1, '--row', rowOf(out1, 'NET-FE', 'A').id, '--fields', 'sideB.mode', '--note', 'A frontend checked');
  const edit = cliJson('edit', dir, '--mutation', 'FB-COUNT');
  assert.ok(edit.impact.affectedReviewRows.length >= 1, 'edit previews affected review rows before regeneration');
  cliJson('generate', dir);
  const a = cliJson('assess', dir); const byNote = (n: string) => a.reviews.find((r: any) => { const s = ProjectStore.open(dir); try { return s.get(r.id).note === n; } finally { s.close(); } });
  assert.equal(byNote('B frontend checked').status, 'retained within unchanged scope');
  assert.equal(byNote('A frontend checked').status, 'needs review');
  assert.throws(() => cli('review', dir, '--output', o1, '--row', rowOf(out1, 'NET-FE', 'A').id, '--fields', 'sideA.pmd'), /unknown is not known/);
  assert.throws(() => cli('review', dir, '--output', o1, '--row', rowOf(out1, 'NET-FE', 'A').id, '--fields', 'pmd'), /not inspectable/);
});
test('diff after FB-COUNT reports regrouped FE modules and added assemblies, not only totals', () => {
  const dir = seededProject(); const o1 = cliJson('generate', dir).outputId; cli('edit', dir, '--mutation', 'FB-COUNT'); const o2 = cliJson('generate', dir).outputId;
  const d = cliJson('diff', dir, '--from', o1, '--to', o2).changes;
  assert.ok(d.constructions.regrouped.some((r: any) => r.to.startsWith('FE-OPT/A03')));
  assert.equal(d.constructions.added.filter((u: string) => u.startsWith('BE-SPLIT/')).length, 8);
  assert.deepEqual(d.purchaseLines.changed.find((c: any) => c.id === 'BUY/be_split_dac_2x400G').to, { quantity: 16, installed: 16 });
});
test('controlled evidence refresh: new candidate conflicts, historical output and evidence immutable', () => {
  const dir = seededProject(); const o1 = cliJson('generate', dir).outputId;
  const before = ProjectStore.open(dir); const bytes = readFileSync(join(dir, 'docs', `${o1}.json`), 'utf8'); before.close();
  const r = cliJson('refresh', dir, '--evidence', join(ROOT, 'fixtures/evidence-revisions/ds5000-local-pipeline6.json'));
  assert.ok(r.impact.affectedLedgers.length > 0);
  const o2 = cliJson('generate', dir).outputId; const out2 = show(dir, o2);
  const fe = out2.contextLedgers.find((c: any) => c.context === 'LC-FE'), be = out2.contextLedgers.find((c: any) => c.context === 'LC-BE');
  assert.deepEqual([fe.status, fe.maxPipelineKnown, be.status, be.maxPipelineKnown], ['conflict', 8, 'within-budget', 4]);
  assert.equal(out2.sizing.find((z: any) => z.context === 'LC-FE').status, 'conflict');
  assert.equal(readFileSync(join(dir, 'docs', `${o1}.json`), 'utf8'), bytes, 'historical output bytes unchanged');
  const a = cliJson('assess', dir); assert.ok(a.outputs.find((x: any) => x.id === o1).reasons.includes('evidence superseded'));
  const s = ProjectStore.open(dir); try { const ev = s.get(r.evidence); assert.equal(ev.origin, 'local-modified'); assert.match(ev.note, /Not a Hedgehog release/); } finally { s.close(); }
});
