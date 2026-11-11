// Arch-owned drivers. generate: fresh project -> seed -> optional edits -> generate -> export.
// lifecycle: the brief's lifecycle in separate CLI processes, writing every export and a JSON log.
// Both only drive the application CLI; they compute no expected values.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = join(import.meta.dirname, '..');
const [cmd, ...rest] = process.argv.slice(2);
const { values: o } = parseArgs({ args: rest, options: { manifest: { type: 'string' }, 'manifest-commit': { type: 'string', default: 'ce4b8e6' }, export: { type: 'string' }, workdir: { type: 'string' }, config: { type: 'string', default: 'interactive' }, scale: { type: 'string' }, mutation: { type: 'string', multiple: true }, synthetic: { type: 'string' }, variant: { type: 'string' } } });
const log: any[] = [];
const hh = (...a: string[]) => { const t0 = performance.now(); const out = execFileSync(join(ROOT, 'bin/hhaid'), [...a, '--json'], { encoding: 'utf8', maxBuffer: 1 << 28 }); const r = JSON.parse(out); log.push({ command: ['hhaid', ...a], ms: Math.round(performance.now() - t0), result: r }); return r; };
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
const manifest = resolve(o.manifest ?? join(ROOT, 'fixtures/materialized/generation/ce4b8e6/docs/design/first-bom/scenario.json'));
const fail = (m: string) => { console.error(m); process.exit(1); };

if (cmd === 'generate') {
  const out = resolve(o.export ?? fail('--export DIR required') as string); mkdirSync(out, { recursive: true });
  const dir = join(mkdtempSync(join(tmpdir(), 'hhaid-gen-')), 'p');
  hh('new', dir, '--name', 'experiment-check', '--project-id', 'proj-experiment-check');
  if (o.synthetic) hh('seed', dir, '--synthetic', o.synthetic, '--variant', o.variant ?? fail('--variant required') as string, '--manifest', manifest, '--manifest-commit', o['manifest-commit']!);
  else hh('seed', dir, '--manifest', manifest, '--manifest-commit', o['manifest-commit']!, ...(o.scale ? ['--scale', o.scale] : []));
  for (const m of o.mutation ?? []) hh('edit', dir, '--mutation', m);
  const g = hh('generate', dir, '--config', o.config!);
  const file = join(out, 'project.hhaid.json'); hh('export', dir, '-o', file);
  const summary = { appCommit: commit, manifest, project: dir, export: file, outcome: g.outcome, outputId: g.outputId ?? null, partialId: g.partialId ?? null, log };
  writeFileSync(join(out, 'generate-log.json'), JSON.stringify(summary, null, 1)); console.log(JSON.stringify({ export: file, outcome: g.outcome, outputId: g.outputId }));
} else if (cmd === 'lifecycle') {
  const w = resolve(o.workdir ?? fail('--workdir DIR required') as string); mkdirSync(w, { recursive: true });
  const dir = join(w, 'project'); const steps: Record<string, string> = {};
  const exp = (name: string) => { const f = join(w, `${name}.hhaid.json`); hh('export', dir, '-o', f); steps[name] = f; };
  hh('new', dir, '--name', 'lifecycle', '--project-id', 'proj-lifecycle'); hh('seed', dir, '--manifest', manifest, '--manifest-commit', o['manifest-commit']!);
  const o1 = hh('generate', dir).outputId; exp('01-baseline');
  const row = JSON.parse(execFileSync(join(ROOT, 'bin/hhaid'), ['show', dir, '--output', o1, '--json'], { encoding: 'utf8', maxBuffer: 1 << 28 })).reviewRows.find((r: any) => r.signature.network === 'NET-FE' && r.signature.sideA.classId === 'B');
  hh('review', dir, '--output', o1, '--row', row.id, '--fields', 'sideB.mode', '--note', 'lifecycle inspection');
  for (const [i, m] of ['FB-DPU', 'FB-COUNT'].entries()) { hh('edit', dir, '--mutation', m); hh('generate', dir); exp(`0${i + 2}-${m}`); }
  hh('refresh', dir, '--evidence', join(ROOT, 'fixtures/evidence-revisions/ds5000-local-pipeline6.json')); const oe = hh('generate', dir).outputId; exp('04-evidence-refresh');
  hh('diff', dir, '--from', o1, '--to', oe); hh('assess', dir); exp('05-final');
  const copy = join(w, 'reimported'); hh('import', steps['05-final']!, copy);
  const re = join(w, '06-reexport.hhaid.json'); execFileSync(join(ROOT, 'bin/hhaid'), ['export', copy, '-o', re]);
  const identical = readFileSync(re, 'utf8') === readFileSync(steps['05-final']!, 'utf8');
  const regen = JSON.parse(execFileSync(join(ROOT, 'bin/hhaid'), ['generate', copy, '--json'], { encoding: 'utf8' }));
  const fsck = hh('fsck', copy);
  const result = { appCommit: commit, exports: steps, reexportIdentical: identical, regeneratedHeadOutput: regen.outputId, headOutput: oe, regenerationMatches: regen.outputId === oe, fsck, log };
  writeFileSync(join(w, 'lifecycle-log.json'), JSON.stringify(result, null, 1));
  console.log(JSON.stringify({ workdir: w, reexportIdentical: identical, regenerationMatches: regen.outputId === oe, orphans: fsck.orphans.length, problems: fsck.problems.length }));
  if (!identical || regen.outputId !== oe || fsck.problems.length) process.exit(1);
} else fail('usage: experiment-check generate|lifecycle ...');
