import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { digestOf } from '../src/contracts/canonical.ts';
import { parseStrictJson } from '../src/contracts/json.ts';
import { generateSync } from '../src/engine/generate.ts';
import { RUN_CONFIGS } from '../src/engine/stages.ts';
import { evidenceFromExtraction } from '../src/evidence/load.ts';
import { MUTATIONS } from '../src/model/mutations.ts';
import { seedFromManifest } from '../src/model/seed.ts';

export const ROOT = join(import.meta.dirname, '..');
export const MANIFEST = join(ROOT, 'fixtures/materialized/generation/ce4b8e6/docs/design/first-bom/scenario.json');
export const tmp = (p = 'hhaid-') => mkdtempSync(join(tmpdir(), p));
export const cli = (...args: string[]) => execFileSync(join(ROOT, 'bin/hhaid'), args, { encoding: 'utf8' });
export const cliJson = (...args: string[]) => JSON.parse(cli(...args, '--json'));
export const manifest = () => parseStrictJson(readFileSync(MANIFEST, 'utf8')) as any;
export const evidence = () => evidenceFromExtraction(join(ROOT, 'evidence/celestica-ds5000.fabric-v0.144.1.json'), join(ROOT, 'evidence/celestica-ds5000.fabric-v0.144.1.provenance.json'));
export function state(muts: string[] = [], m = manifest()) {
  const ev = evidence(); const id = digestOf(ev);
  let s = seedFromManifest(m, { commit: 'c', path: 'p', sha256: 's' }, 'P', id, ev);
  for (const x of muts) s = MUTATIONS[x]!(s);
  return { s, ev, id };
}
export function gen(muts: string[] = [], config = 'interactive', m = manifest()) {
  const { s, ev, id } = state(muts, m);
  return generateSync(digestOf(s), s, { [id]: ev }, RUN_CONFIGS[config]!).output as any;
}
export function seededProject() {
  const dir = join(tmp(), 'p');
  cli('new', dir, '--name', 'FB-01', '--project-id', 'proj-test');
  cli('seed', dir, '--manifest', MANIFEST, '--manifest-commit', 'ce4b8e6');
  return dir;
}
