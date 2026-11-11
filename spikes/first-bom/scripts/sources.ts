// verify | materialize the exact inputs listed in sources.lock.json.
// verify: every entry's commit is fetchable and its blob id and sha256 match.
// materialize: write generation inputs to fixtures/materialized/generation/ and oracle files to
// fixtures/materialized/oracle/ (separate trees: src/ reads only the generation tree).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = join(import.meta.dirname, '..');
const lock = JSON.parse(readFileSync(join(root, 'sources.lock.json'), 'utf8'));
const mode = process.argv[2];
if (mode !== 'verify' && mode !== 'materialize') throw new Error('usage: sources.ts verify|materialize');
const git = (...args: string[]) => execFileSync('git', args, { cwd: root, maxBuffer: 64 << 20 });
const have = (c: string) => { try { git('cat-file', '-e', `${c}^{commit}`); return true; } catch { return false; } };
let failures = 0;
for (const e of lock.entries) {
  if (!have(e.commit)) git('fetch', '--quiet', 'origin', e.commit);
  const blob = git('rev-parse', `${e.commit}:${e.path}`).toString().trim();
  const bytes = git('cat-file', 'blob', blob);
  const sha = createHash('sha256').update(bytes).digest('hex');
  const ok = blob === e.blob && sha === e.sha256;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${e.role.padEnd(16)} ${e.commit.slice(0, 7)} ${e.path}`);
  if (ok && mode === 'materialize' && e.role !== 'provenance') {
    const tree = e.role === 'oracle' ? 'oracle' : 'generation';
    const out = join(root, 'fixtures', 'materialized', tree, e.commit.slice(0, 7), e.path);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, bytes);
  }
}
if (failures) { console.error(`${failures} source(s) failed verification`); process.exit(1); }
console.log(`${lock.entries.length} sources verified${mode === 'materialize' ? ' and generation/oracle inputs materialized' : ''}`);
