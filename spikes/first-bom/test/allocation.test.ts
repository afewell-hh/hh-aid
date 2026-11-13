import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cli, cliJson, gen, MANIFEST, state, tmp } from './helpers.ts';
import { digestOf } from '../src/contracts/canonical.ts';
import { generateSync } from '../src/engine/generate.ts';
import { RUN_CONFIGS } from '../src/engine/stages.ts';
import { join } from 'node:path';

/** Occurrence-level integrity of every assignment in an output (not just aggregate totals). */
function checkAssignments(o: any, s: any) {
  const occupied = new Set<string>();
  const demand = new Map(o.demands.map((d: any) => [d.id, d]));
  const unit = new Map(o.constructions.map((u: any) => [u.id, u]));
  for (const a of o.assignments) {
    const d: any = demand.get(a.demand); assert.ok(d, `${a.demand} is a real demand`);
    assert.equal(d.context, a.context, `${a.demand} placed in its own network's leaf context`);
    const lc = s.leafContexts.find((c: any) => c.id === a.context);
    assert.ok(lc.serverGroup.selector.labels.includes(a.label), `${a.demand} label ${a.label} is a selected member`);
    assert.ok(!lc.reservations.some((r: any) => r.labels.includes(a.label)), `${a.demand} never uses a reserved (uplink) label`);
    const children = Number(String(lc.modes[`E1/${a.label}`]).split('x')[0]); assert.ok(a.child >= 1 && a.child <= children, 'child within configured mode');
    const key = `${a.occurrence}|${a.label}|${a.child}`; assert.ok(!occupied.has(key), `no double occupancy at ${key}`); occupied.add(key);
    const u: any = unit.get(a.unit); assert.ok(u.links.includes(a.demand), 'assignment unit contains the demand');
  }
  for (const u of o.constructions) { const as = o.assignments.filter((a: any) => a.unit === u.id); assert.equal(new Set(as.map((a: any) => `${a.occurrence}|${a.label}`)).size <= 1, true, `${u.id} occupies one parent`); }
  return occupied.size;
}

test('baseline: every demand assigned exactly once to a valid, unreserved, in-mode member; rails paired', () => {
  const { s } = state(); const o = gen();
  assert.equal(checkAssignments(o, s), 24);
  assert.equal(new Set(o.assignments.map((a: any) => a.demand)).size, o.demands.length);
  for (const a of o.assignments) assert.equal(a.basis, 'conditional-witness');
  const sizing = Object.fromEntries(o.sizing.map((z: any) => [z.context, z]));
  assert.equal(sizing['LC-FE'].lowerBound, 1); assert.equal(sizing['LC-BE'].lowerBound, 1);
  assert.match(sizing['LC-FE'].claim, /not an exact supported topology/);
});
test('FB-COUNT, FB-EXHAUST and FB-LOCK keep occurrence integrity; locks never relocate', () => {
  for (const m of [['FB-COUNT'], ['FB-EXHAUST'], ['FB-LOCK'], ['FB-LOCK-VALID']]) { const { s } = state(m); checkAssignments(gen(m), s); }
  const ex = gen(['FB-EXHAUST']); const fe = ex.sizing.find((z: any) => z.context === 'LC-FE');
  assert.deepEqual([fe.lowerBound, fe.unmetDemands, ex.assignments.filter((a: any) => a.context === 'LC-FE').length], [2, 4, 4]);
  assert.equal(ex.assignments.filter((a: any) => a.context === 'LC-FE').every((a: any) => a.label === 1), true, 'no borrowed uplinks');
  const lk = gen(['FB-LOCK']); const d = lk.diagnostics.find((x: any) => x.code === 'lock-target-unavailable');
  assert.ok(d && d.affected.includes('DEM/A01/dpu1/p1'));
  assert.equal(lk.assignments.find((a: any) => a.demand === 'DEM/A01/dpu1/p1'), undefined, 'locked demand not silently relocated');
  const row = lk.reviewRows.find((r: any) => r.exceptions.heldByLock.length); assert.ok(row, 'held-by-lock exception visible in review');
  const ok = gen(['FB-LOCK-VALID']); assert.deepEqual(ok.assignments.filter((a: any) => a.demand === 'DEM/A01/dpu1/p1').map((a: any) => [a.label, a.child]), [[1, 1]]);
});
test('FB-UNKNOWN-MODE: unresolved ledger blocks any witness, component BOM preserved', () => {
  const o = gen(['FB-UNKNOWN-MODE']); const fe = o.sizing.find((z: any) => z.context === 'LC-FE');
  assert.equal(fe.status, 'unresolved'); assert.equal(o.assignments.filter((a: any) => a.context === 'LC-FE').length, 0);
  assert.equal(o.summary.knownGenericPurchaseUnits, 52);
});
test('invalid context: demands stay visible as unplaced with an ineligible diagnostic, never squeezed in', () => {
  const o = gen(['FB-INVALID-CONTEXT']);
  const bad = o.diagnostics.filter((d: any) => d.code === 'ineligible-context'); assert.equal(bad.length, 4);
  assert.equal(o.unplacedDemands.length, 4); assert.ok(o.unplacedDemands.every((u: any) => u.demand.startsWith('DEM/B0')));
  assert.equal(o.assignments.some((a: any) => a.demand.startsWith('DEM/B0')), false);
});
test('duplicate selector member: an alias never adds capacity; conflict reported', () => {
  const { s, ev, id } = state(); s.leafContexts[1]!.serverGroup.selector.labels.push(5);
  const o: any = generateSync(digestOf(s), s, { [id]: ev }, RUN_CONFIGS.interactive!).output;
  assert.ok(o.diagnostics.some((d: any) => d.code === 'duplicate-selector-member'));
  assert.equal(o.groups.find((g: any) => g.context === 'LC-FE').selected, 124);
});
test('AC1 synthetic: configured usage is independent of selection, reservation and links', () => {
  const results: Record<string, any> = {};
  for (const v of ['over-budget', 'reserve-selected', 'reserve-unselected', 'unused-mode-unknown']) {
    const dir = join(tmp(), 'p'); cli('new', dir); cli('seed', dir, '--synthetic', 'FB-AC1', '--variant', v, '--manifest', MANIFEST, '--manifest-commit', 'ce4b8e6');
    const o = JSON.parse(cli('show', dir, '--output', cliJson('generate', dir).outputId, '--json'));
    const l = o.ledgers.find((x: any) => x.scope === 'pipeline:S'); results[v] = [l.knownConfigured, l.configuredTotal, o.groups[0].selected, o.groups[0].availableSelected, o.assignments.length, l.status];
  }
  assert.deepEqual(results['over-budget'], [8, 8, 2, 2, 0, 'conflict']);
  assert.deepEqual(results['reserve-selected'], [8, 8, 2, 1, 0, 'conflict']);
  assert.deepEqual(results['reserve-unselected'], [8, 8, 2, 2, 0, 'conflict']);
  assert.equal(results['unused-mode-unknown'][1].state, 'unknown'); assert.deepEqual([results['unused-mode-unknown'][0], results['unused-mode-unknown'][5]], [4, 'unresolved']);
});
