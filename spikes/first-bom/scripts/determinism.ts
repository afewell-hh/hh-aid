// Determinism check (architecture §4.1): the same semantic inputs produce identical output in separate
// processes, and reversing semantically unordered collections (classes, populations, networks, leaf
// contexts, constructions, evidence load order) does not change any output section. Exit 1 on mismatch.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { digestOf } from '../src/contracts/canonical.ts';
import { parseStrictJson } from '../src/contracts/json.ts';
import { generateSync } from '../src/engine/generate.ts';
import { RUN_CONFIGS } from '../src/engine/stages.ts';
import { evidenceFromExtraction } from '../src/evidence/load.ts';
import { MUTATIONS } from '../src/model/mutations.ts';
import { seedFromManifest } from '../src/model/seed.ts';

const ROOT = join(import.meta.dirname, '..');
const CASES = [[], ['FB-DPU'], ['FB-COUNT'], ['FB-UNKNOWN-MODE'], ['FB-EXHAUST'], ['FB-LOCK'], ['FB-INVALID-CONTEXT']];
function run(muts: string[], shuffled: boolean) {
  const ev = evidenceFromExtraction(join(ROOT, 'evidence/celestica-ds5000.fabric-v0.144.1.json'), join(ROOT, 'evidence/celestica-ds5000.fabric-v0.144.1.provenance.json'));
  const evId = digestOf(ev);
  const m = parseStrictJson(readFileSync(join(ROOT, 'fixtures/materialized/generation/ce4b8e6/docs/design/first-bom/scenario.json'), 'utf8')) as any;
  let s = seedFromManifest(m, { commit: 'ce4b8e6', path: 'scenario.json', sha256: '-' }, 'proj-determinism', evId, ev);
  for (const x of muts) s = MUTATIONS[x]!(s);
  if (shuffled) for (const k of ['classes', 'populations', 'networks', 'leafContexts', 'constructions'] as const) (s as any)[k] = [...(s as any)[k]].reverse();
  const evidence = shuffled ? Object.fromEntries(Object.entries({ [evId]: ev, zzz: null }).reverse().filter(([, v]) => v)) : { [evId]: ev };
  const o: any = generateSync(digestOf(s), s, evidence as any, RUN_CONFIGS.interactive!).output;
  const { input, stageResults, ...semantic } = o; void input; void stageResults;
  return { full: digestOf(o), semantic: digestOf(semantic) };
}
if (process.argv[2] === '--child') { console.log(JSON.stringify(CASES.map(c => run(c, process.argv[3] === 'shuffled')))); process.exit(0); }
const child = (mode: string) => JSON.parse(execFileSync(process.execPath, [import.meta.filename, '--child', mode], { encoding: 'utf8', maxBuffer: 1 << 26 }));
const [a, b, c] = [child('natural'), child('natural'), child('shuffled')];
let bad = 0;
CASES.forEach((cs, k) => {
  const sameProc = a[k].full === b[k].full, sameShuf = a[k].semantic === c[k].semantic;
  if (!sameProc || !sameShuf) bad++;
  console.log(`${sameProc && sameShuf ? 'ok  ' : 'FAIL'} [${cs.join(',') || 'baseline'}] two processes ${sameProc ? 'identical' : 'DIFFER'}; reversed collections ${sameShuf ? 'identical semantic sections' : 'DIFFER'} (${a[k].semantic.slice(0, 12)})`);
});
if (bad) { console.error(`${bad} case(s) not deterministic`); process.exit(1); }
console.log(`${CASES.length} cases deterministic across 3 separate processes`);
