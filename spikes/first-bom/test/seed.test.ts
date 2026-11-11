import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { digestOf } from '../src/contracts/canonical.ts';
import { ROOT, cli, gen, manifest, state, tmp } from './helpers.ts';

test('seed ignores author_expected and every expected field (changing them changes nothing)', () => {
  const m = manifest(); const poisoned = structuredClone(m);
  poisoned.author_expected = { physical_servers: 999, FE: { configured_ports: 1 } };
  for (const x of poisoned.mutations) { if (x.expected) x.expected = 'POISON'; if (x.expected_delta) x.expected_delta = { physical_servers: 999 }; }
  for (const x of poisoned.missing_infrastructure) { if ('conditional_lower_bound' in x) x.conditional_lower_bound = 999; if ('known_server_interfaces' in x) x.known_server_interfaces = 999; }
  assert.equal(digestOf(state([], poisoned).s), digestOf(state([], m).s));
  assert.equal(digestOf(gen([], 'interactive', poisoned)), digestOf(gen([], 'interactive', m)));
});
test('manifest null becomes typed unknown with provenance, never 0', () => {
  const { s } = state();
  for (const c of s.leafContexts) assert.deepEqual(c.instanceQuantity, { state: 'unknown', reason: 'instance-quantity-not-supplied', provenance: `manifest:leaf_contexts.${c.id}.instance_quantity` });
  for (const m of s.missingInfrastructure) assert.equal((m.quantity as any).state, 'unknown');
});
test('application source never reads the oracle tree or manifest answer fields', () => {
  const files: string[] = []; const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
  walk(join(ROOT, 'src'));
  for (const f of files) {
    const code = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n'); // code only, comments stripped
    for (const bad of ['materialized/oracle', 'fb01-expected', 'check_fb01', 'ac1.json', 'author_expected', 'expected_delta', '.expected']) assert.ok(!code.includes(bad), `${f} references ${bad}`);
  }
});
test('seed refuses manifest bytes that do not match the source lock', () => {
  const dir = join(tmp(), 'p'); cli('new', dir);
  const bad = join(tmp(), 'scenario.json'); writeFileSync(bad, readFileSync(join(ROOT, 'fixtures/materialized/generation/ce4b8e6/docs/design/first-bom/scenario.json'), 'utf8').replace('"r1"', '"r2"'));
  assert.throws(() => cli('seed', dir, '--manifest', bad, '--manifest-commit', 'ce4b8e6'), /do not match a locked generation input/);
});
