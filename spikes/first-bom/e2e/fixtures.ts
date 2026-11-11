import { test as base, expect } from '@playwright/test';
import { type ChildProcess, execFileSync, spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const ROOT = join(import.meta.dirname, '..');
const NODE = join(ROOT, '.toolchain/node/bin/node');
export const cli = (...a: string[]) => execFileSync(join(ROOT, 'bin/hhaid'), a, { encoding: 'utf8' });

export function startServer(dir: string): Promise<{ url: string; proc: ChildProcess }> {
  const proc = spawn(NODE, [join(ROOT, 'src/server/main.ts'), dir, '--port', '0'], { stdio: ['ignore', 'pipe', 'inherit'] });
  return new Promise((res, rej) => { proc.stdout!.on('data', (b: Buffer) => { const m = /(http:\/\/127\.0\.0\.1:\d+\/#token=[0-9a-f]+)/.exec(b.toString()); if (m) res({ url: m[1]!, proc }); }); proc.on('exit', c => rej(new Error(`server exited ${c}`))); });
}
export const stopServer = (proc: ChildProcess) => new Promise<void>(r => { proc.once('exit', () => r()); proc.kill('SIGTERM'); });

export const test = base.extend<{ project: { dir: string; url: string; restart: () => Promise<string> } }>({
  project: async ({}, use) => {
    const dir = join(mkdtempSync(join(tmpdir(), 'hhaid-e2e-')), 'p');
    cli('new', dir, '--name', 'FB-01 demo'); cli('seed', dir, '--manifest', join(ROOT, 'fixtures/materialized/generation/ce4b8e6/docs/design/first-bom/scenario.json'), '--manifest-commit', 'ce4b8e6');
    let s = await startServer(dir);
    await use({ dir, url: s.url, restart: async () => { await stopServer(s.proc); s = await startServer(dir); return s.url; } });
    await stopServer(s.proc);
  },
});
export { expect };
