// Runner and limit tests (lead clarifications 1–5). Cancellation is synchronized on worker-start and
// stage-complete barriers (step mode), never on timing races.
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { digestOf } from '../src/contracts/canonical.ts';
import { edit, generate, seed } from '../src/app/project.ts';
import { generateSync } from '../src/engine/generate.ts';
import { RUN_CONFIGS } from '../src/engine/stages.ts';
import { ProjectStore } from '../src/store/store.ts';
import { MANIFEST, state, tmp } from './helpers.ts';

async function project(id = 'proj-runner', replicas = 0) {
  const s = ProjectStore.create(join(tmp(), 'p'), id, 'runner', 'test'); await seed(s, MANIFEST, 'ce4b8e6', 'test', replicas); return s;
}
const docsBytes = (s: ProjectStore) => Object.fromEntries(readdirSync(join(s.dir, 'docs')).map(f => [f, readFileSync(join(s.dir, 'docs', f), 'utf8')]));

test('cancel before S1 completes: no new component result, previous outputs untouched, partial recorded', async () => {
  const s = await project(); try {
    const prev = await generate(s, 'test').result;
    await edit(s, 'test', { mutation: 'FB-DPU' }); // new input, so no stage is served from the cache and a worker starts
    const before = docsBytes(s);
    const h = generate(s, 'test', { stepMode: true }); await once(h, 'started'); h.cancel('user-cancel');
    const r = await h.result;
    assert.equal(r.outcome, 'interrupted'); assert.equal(r.reason, 'user-cancel'); assert.deepEqual(r.completedStages, []);
    const p = s.get(r.partialId!); assert.match(p.claim, /no new component result exists/); assert.deepEqual(p.completedStages, []);
    assert.deepEqual(s.index().roots.outputs, [prev.outputId]);
    for (const [f, b] of Object.entries(before)) assert.equal(readFileSync(join(s.dir, 'docs', f), 'utf8'), b, `${f} unchanged`);
  } finally { s.close(); }
});

test('cancel after S1: S1 result preserved and rooted; no output, no allocation claim; resume reuses it', async () => {
  const s = await project(); try {
    const h = generate(s, 'test', { stepMode: true }); await once(h, 'started'); h.go();
    const [st] = await once(h, 'stage'); assert.equal(st, 'S1'); h.cancel('user-cancel');
    const r = await h.result; assert.deepEqual(r.completedStages, ['S1']);
    const p = s.get(r.partialId!); assert.match(p.claim, /no allocation or sizing claim/);
    assert.ok(s.index().roots.stageResults.includes(p.completedStages[0].id)); assert.equal(s.index().roots.outputs.length, 0);
    const r2 = await generate(s, 'test').result; assert.equal(r2.outcome, 'complete'); assert.deepEqual(r2.reusedStages, ['S1']);
    // T4/T5: interrupted stage bytes equal a complete run's; resumed output equals an uninterrupted run with the same inputs
    const fresh = await project(); try {
      const r3 = await generate(fresh, 'test').result;
      assert.equal(fresh.get(r3.outputId!).stageResults.S1, p.completedStages[0].id);
      assert.equal(r3.outputId, r2.outputId);
    } finally { fresh.close(); }
  } finally { s.close(); }
});

test('deadline fires while the worker is held at a barrier: interrupted (deadline), deterministic', async () => {
  const s = await project(); try {
    const h = generate(s, 'test', { stepMode: true, deadlineMs: 50 }); await once(h, 'started'); h.go(); await once(h, 'stage');
    const r = await h.result; assert.equal(r.outcome, 'interrupted'); assert.equal(r.reason, 'deadline'); assert.deepEqual(r.completedStages, ['S1']);
  } finally { s.close(); }
});

test('main event loop stays responsive while the worker computes the scale fixture', async () => {
  const s = await project('proj-scale', 1000); try {
    let ticks = 0; const iv = setInterval(() => ticks++, 10);
    const r = await generate(s, 'test', { config: 'scale' }).result; clearInterval(iv);
    assert.equal(r.outcome, 'complete'); assert.ok(ticks >= 20, `timer fired ${ticks} times during generation`);
  } finally { s.close(); }
});

test('a corrupted cached stage is a cache miss, never reused', async () => {
  const s = await project(); try {
    const r1 = await generate(s, 'test').result; const s1 = s.get(r1.outputId!).stageResults.S1;
    const f = join(s.dir, 'docs', `${s1}.json`); writeFileSync(f, readFileSync(f, 'utf8').replace('"servers":4', '"servers":5'));
    await edit(s, 'test', { mutation: 'FB-DPU' }); await edit(s, 'test', { patch: [{ op: 'replace', path: '/change', value: 'x' }] });
    const r2 = await generate(s, 'test').result; assert.equal(r2.outcome, 'complete'); assert.deepEqual(r2.reusedStages, []);
  } finally { s.close(); }
});

test('concurrent save and generate completion never lose roots (serialized index commits)', async () => {
  const s = await project(); try {
    const h = generate(s, 'test');
    const [r, e] = await Promise.all([h.result, edit(s, 'test', { mutation: 'FB-COUNT' })]);
    const idx = s.index(); assert.ok(idx.roots.outputs.includes(r.outputId!)); assert.ok(idx.roots.inputs.includes(e.id)); assert.equal(idx.inputHead, e.id);
    assert.equal(s.fsck().problems.length, 0);
  } finally { s.close(); }
});

test('cap rejection (interactive on the scale fixture) is deterministic and keeps component lines', () => {
  const { s: base, ev, id } = state(); const big = (globalThis as any).structuredClone(base);
  const { replicate } = awaitImport(); const st = replicate(big, 1000);
  const a: any = generateSync(digestOf(st), st, { [id]: ev }, RUN_CONFIGS.interactive!).output; const b: any = generateSync(digestOf(st), st, { [id]: ev }, RUN_CONFIGS.interactive!).output;
  assert.equal(a.outcome, 'limit-reached'); assert.equal(a.limits[0].limit, 'maxDemandTerminations'); assert.equal(digestOf(a), digestOf(b));
  assert.equal(a.purchaseLines.find((l: any) => l.item === 'backend_nic_400').quantity, 16_000);
  assert.equal(a.demands, null); assert.equal(a.assignments.length, 0);
  assert.equal(a.purchaseLines.find((l: any) => l.item === 'be_split_dac_2x400G').quantity.state, 'unknown', 'construction lines unresolved, not zero');
});
let replicateMod: any; const awaitImport = () => replicateMod;
test.before(async () => { replicateMod = await import('../src/model/scale.ts'); });

test('operation budget limit in S4 is deterministic and reports no partial assignments', () => {
  const { s, ev, id } = state(); const cfg = { ...RUN_CONFIGS.interactive!, id: 'tiny-budget', maxCandidateInspections: 3 };
  const a: any = generateSync(digestOf(s), s, { [id]: ev }, cfg).output, b: any = generateSync(digestOf(s), s, { [id]: ev }, cfg).output;
  assert.equal(a.outcome, 'limit-reached'); assert.equal(a.limits[0].stage, 'S4'); assert.equal(a.assignments.length, 0); assert.equal(digestOf(a), digestOf(b));
  assert.equal(a.summary.knownGenericPurchaseUnits, 52, 'completed component and construction lines preserved');
});

test('compact huge population: aggregate lines by checked arithmetic, no unbounded materialization', () => {
  const { s, ev, id } = state();
  s.populations[0]!.occurrences = { range: { prefix: 'A', start: 1, count: 1_000_000_000_000, width: 13 } };
  const t0 = performance.now(); const o: any = generateSync(digestOf(s), s, { [id]: ev }, RUN_CONFIGS.scale!).output; const ms = performance.now() - t0;
  assert.ok(ms < 2000, `bounded time (${Math.round(ms)} ms)`); assert.equal(o.outcome, 'limit-reached'); assert.equal(o.limits[0].limit, 'maxMaterializedOccurrences');
  assert.equal(o.purchaseLines.find((l: any) => l.item === 'backend_nic_400').quantity, 8_000_000_000_000);
  s.populations[0]!.occurrences = { range: { prefix: 'A', start: 1, count: Number.MAX_SAFE_INTEGER, width: 16 } };
  const o2: any = generateSync(digestOf(s), s, { [id]: ev }, RUN_CONFIGS.scale!).output;
  assert.equal(o2.purchaseLines.find((l: any) => l.item === 'backend_nic_400').quantity.reason, 'quantity-overflow');
});

test('scale success: 1,000 disjoint replicas complete under the scale configuration with member conservation', () => {
  const { s: base, ev, id } = state(); const st = replicateMod.replicate(base, 1000);
  const o: any = generateSync(digestOf(st), st, { [id]: ev }, RUN_CONFIGS.scale!).output;
  assert.equal(o.outcome, 'complete'); assert.equal(o.summary.servers, 4000); assert.equal(o.demands.length, 24_000);
  const seen = new Map<string, number>(); for (const u of o.constructions) for (const l of u.links) seen.set(l, (seen.get(l) ?? 0) + 1);
  assert.equal(seen.size, 24_000); assert.ok([...seen.values()].every(n => n === 1));
  assert.equal(new Set(o.assignments.map((a: any) => a.demand)).size, 24_000);
  assert.equal(o.summary.managementInterfaces, 6_001, 'per-instance DPU split adds one management interface');
  assert.equal(o.missingInfrastructure.every((m: any) => m.quantity.state === 'unknown'), true);
});
