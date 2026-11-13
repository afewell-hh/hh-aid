// Application behavior against the accepted contracts (author tests; the independent oracle is parts').
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gen } from './helpers.ts';

const line = (o: any, item: string) => o.purchaseLines.find((l: any) => l.item === item);
test('one physical server identity across every attachment; demands reference the same occurrence', () => {
  const o = gen();
  assert.equal(o.summary.servers, 4);
  const a01 = o.demands.filter((d: any) => d.occurrence === 'A01');
  assert.deepEqual([...new Set(a01.map((d: any) => d.network))].sort(), ['NET-BE', 'NET-FE']);
  assert.equal(a01.length, 10);
  assert.equal(new Set(o.demands.map((d: any) => d.id)).size, o.demands.length, 'no duplicate demand identities');
});
test('per-unit quantities expand into installed and purchase lines; included children never purchased; unknown inclusion is not zero', () => {
  const o = gen();
  assert.deepEqual([line(o, 'backend_nic_400').installed, line(o, 'backend_nic_400').quantity], [16, 16]);
  assert.deepEqual([line(o, 'accelerator').installed, line(o, 'accelerator').quantity], [16, 0]);
  const acc = line(o, 'accessory'); assert.equal(acc.installed, 4); assert.equal(acc.quantity.state, 'unknown');
  for (const r of o.requirements.filter((r: any) => r.acquisition === 'included')) assert.ok(o.requirements.some((b: any) => b.id === r.coveredBy && b.acquisition === 'separate'), `${r.id} covered by an existing bundle requirement`);
  assert.equal(o.summary.knownGenericPurchaseUnits, 52);
});
test('shared constructions: each link in exactly one unit; one purchase per shared assembly/parent module', () => {
  const o = gen();
  const linkUse = new Map<string, number>(); for (const u of o.constructions) for (const l of u.links) linkUse.set(l, (linkUse.get(l) ?? 0) + 1);
  assert.equal(linkUse.size, o.demands.length); assert.ok([...linkUse.values()].every(n => n === 1));
  const be = o.constructions.filter((u: any) => u.construction === 'BE-SPLIT');
  assert.equal(line(o, 'be_split_dac_2x400G').quantity, be.length);
  for (const u of be) { const ds = u.links.map((l: string) => o.demands.find((d: any) => d.id === l)); assert.equal(new Set(ds.map((d: any) => d.rail)).size, 1, `${u.id} pairs one rail`); }
  assert.equal(line(o, 'fe_switch_optic_4x200G').quantity, o.constructions.filter((u: any) => u.construction === 'FE-OPT').length);
  assert.equal(line(o, 'fe_server_optic_200G').quantity, o.demands.filter((d: any) => d.network === 'NET-FE').length);
});
test('missing infrastructure stays explicit and unknown, never zeroed or omitted', () => {
  const o = gen();
  assert.deepEqual(o.missingInfrastructure.map((m: any) => m.id), ['INF-LEAF', 'INF-SPINE', 'INF-UPLINK-MEDIA', 'INF-CONTROL-GATEWAY', 'INF-OOB', 'INF-ANCILLARY']);
  for (const m of o.missingInfrastructure) assert.equal(m.quantity.state, 'unknown');
  assert.equal(o.missingInfrastructure.find((m: any) => m.id === 'INF-OOB').knownServerInterfaces, 6);
});
test('FB-DPU keeps two frontend links per A server, exposes the extra adapter and management interface', () => {
  const b = gen(), d = gen(['FB-DPU']);
  assert.equal(d.demands.filter((x: any) => x.network === 'NET-FE').length, b.demands.filter((x: any) => x.network === 'NET-FE').length);
  assert.equal(line(d, 'frontend_single_dpu_200').quantity, 4); assert.equal(line(d, 'frontend_dual_dpu_200'), undefined);
  assert.equal(d.summary.managementInterfaces - b.summary.managementInterfaces, 2);
  assert.equal(d.summary.servers, b.summary.servers);
  const req = d.requirements.find((r: any) => r.slot === 'A/separate/frontend_single_dpu_200'); assert.deepEqual(req.replaces, ['A/separate/frontend_dual_dpu_200']);
});
test('FB-COUNT appends an occurrence, regroups FE modules with explicit identities, parks BE tails', () => {
  const o = gen(['FB-COUNT']);
  assert.equal(o.summary.servers, 5); assert.equal(line(o, 'be_split_dac_2x400G').quantity, 16);
  const parked = o.constructions.filter((u: any) => u.construction === 'BE-SPLIT').reduce((n: number, u: any) => n + u.reservedChildren, 0); assert.equal(parked, 8);
  assert.equal(o.summary.knownGenericPurchaseUnits, 75);
});
test('determinism: identical inputs give identical semantic output', () => {
  assert.deepEqual(gen(['FB-COUNT']), gen(['FB-COUNT']));
});
