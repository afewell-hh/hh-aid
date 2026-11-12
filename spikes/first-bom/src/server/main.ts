// Local single-user server: 127.0.0.1 only, per-session token, Host check (DNS rebinding), JSON API + static UI.
// Usage: node src/server/main.ts <projectDir> [--port N]
import { randomBytes } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { parseStrictJson } from '../contracts/json.ts';
import { SPIKE_ROOT, assessProject, diff, edit, generate, refresh, review } from '../app/project.ts';
import { RUN_CONFIGS } from '../engine/stages.ts';
import type { RunHandle, RunResult } from '../runner/runner.ts';
import { ProjectStore, StaleWriteError } from '../store/store.ts';

const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith('--')) ?? (console.error('usage: main.ts <projectDir> [--port N]'), process.exit(2));
const port = Number(args[args.indexOf('--port') + 1] ?? 0) || 0;
const token = process.env.HHAID_TOKEN ?? randomBytes(24).toString('hex');
const actor = process.env.HHAID_ACTOR ?? 'local-user';
const store = ProjectStore.open(dir);
const UI = resolve(SPIKE_ROOT, 'ui', 'dist');
const FIXTURE_REVISIONS = resolve(SPIKE_ROOT, 'fixtures', 'evidence-revisions');
const runs = new Map<string, { handle: RunHandle; result: RunResult | null; events: string[] }>();
let runSeq = 0;
const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

const send = (res: ServerResponse, code: number, body: unknown, type = 'application/json') => {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'" });
  res.end(type === 'application/json' ? JSON.stringify(body) : body as string);
};
async function body(req: IncomingMessage): Promise<any> {
  let n = 0; const chunks: Buffer[] = [];
  for await (const c of req) { n += c.length; if (n > 1 << 20) throw new Error('request too large'); chunks.push(c); }
  return chunks.length ? parseStrictJson(Buffer.concat(chunks).toString('utf8')) : {};
}
function project() {
  const idx = store.index(); const head = idx.inputHead ? store.get(idx.inputHead) : null;
  const a = assessProject(store);
  const inputs = idx.roots.inputs.map((id: string) => { const s = store.get(id); return { id, revision: s.revision, parent: s.parent, change: s.change }; }).sort((x: any, y: any) => x.revision - y.revision);
  const evidence = idx.roots.evidence.map((id: string) => { const e = store.get(id); return { id, origin: e.origin, profile: e.profile.name, note: e.note, parent: e.parentEvidence ?? null }; });
  const reviews = idx.roots.reviews.map((id: string) => ({ id, ...store.get(id) }));
  const diffs = idx.roots.diffs.map((id: string) => { const d = store.get(id); return { id, from: d.from, to: d.to }; });
  const partials = idx.roots.partialCandidates.map((id: string) => { const p = store.get(id); return { id, reason: p.reason, claim: p.claim, completedStages: p.completedStages.map((s: any) => s.stage) }; });
  return { name: idx.name, projectId: idx.projectId, head: idx.inputHead, state: head, inputs, assessment: a, evidence, reviews, diffs, partials, configs: Object.keys(RUN_CONFIGS), evidenceRevisions: existsSync(FIXTURE_REVISIONS) ? readdirSync(FIXTURE_REVISIONS).filter(f => f.endsWith('.json')).sort() : [] };
}

const server = createServer(async (req, res) => {
  try {
    const host = req.headers.host ?? ''; const addr = server.address(); const p = typeof addr === 'object' && addr ? addr.port : 0;
    if (host !== `127.0.0.1:${p}` && host !== `localhost:${p}`) return send(res, 421, { error: 'unexpected Host header' });
    const url = new URL(req.url ?? '/', `http://${host}`);
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname === '/api/health') return send(res, 200, { ok: true });
      if (req.headers['x-hhaid-token'] !== token) return send(res, 403, { error: 'missing or wrong session token' });
      if (req.method !== 'GET' && req.headers['content-type'] !== 'application/json') return send(res, 415, { error: 'JSON only' });
      const r = url.pathname.slice(5).split('/');
      if (req.method === 'GET' && r[0] === 'project') return send(res, 200, project());
      if (req.method === 'GET' && r[0] === 'doc' && r[1]) return send(res, 200, store.get(r[1]));
      if (req.method === 'POST' && r[0] === 'edit') { const b = await body(req); return send(res, 200, await edit(store, actor, b)); }
      if (req.method === 'POST' && r[0] === 'generate') {
        const b = await body(req); const id = `run-${++runSeq}`; const h = generate(store, actor, { config: b.config ?? 'interactive' });
        const rec = { handle: h, result: null as RunResult | null, events: [] as string[] }; runs.set(id, rec);
        h.on('started', () => rec.events.push('started')); h.on('stage', (s: string) => rec.events.push(s)); void h.result.then(x => { rec.result = x; });
        return send(res, 202, { run: id });
      }
      if (req.method === 'GET' && r[0] === 'runs' && r[1]) { const x = runs.get(r[1]); return x ? send(res, 200, { events: x.events, result: x.result }) : send(res, 404, { error: 'no such run' }); }
      if (req.method === 'POST' && r[0] === 'runs' && r[1] && r[2] === 'cancel') { const x = runs.get(r[1]); x?.handle.cancel('user-cancel'); return send(res, 200, { cancelled: !!x }); }
      if (req.method === 'POST' && r[0] === 'review') { const b = await body(req); return send(res, 200, { review: await review(store, actor, b.output, b.row, b.fields, b.note ?? '', b.excluded ?? []) }); }
      if (req.method === 'POST' && r[0] === 'diff') { const b = await body(req); return send(res, 200, await diff(store, actor, b.from, b.to)); }
      if (req.method === 'POST' && r[0] === 'refresh') { const b = await body(req); const f = resolve(FIXTURE_REVISIONS, String(b.file)); if (!f.startsWith(FIXTURE_REVISIONS + sep)) return send(res, 400, { error: 'bad file' }); return send(res, 200, await refresh(store, actor, f, b.baseInput)); }
      if (req.method === 'GET' && r[0] === 'export') { res.writeHead(200, { 'content-type': 'application/json', 'content-disposition': `attachment; filename="${store.index().name.replace(/[^\w.-]/g, '_')}.hhaid.json"` }); return res.end(store.exportText()); }
      return send(res, 404, { error: 'unknown endpoint' });
    }
    // static UI, confined to ui/dist
    const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '') || 'index.html';
    let file = resolve(UI, rel); if (!file.startsWith(UI + sep)) return send(res, 403, 'forbidden', 'text/plain');
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(UI, 'index.html');
    if (!existsSync(file)) return send(res, 503, 'UI not built: run npm run ui:build', 'text/plain');
    return send(res, 200, readFileSync(file, 'utf8'), TYPES[extname(file)] ?? 'application/octet-stream');
  } catch (e) { return send(res, e instanceof StaleWriteError ? 409 : 400, { error: (e as Error).message, ...(e instanceof StaleWriteError ? { stale: true, currentInput: e.actual } : {}) }); }
});
server.listen(port, '127.0.0.1', () => {
  const a = server.address(); const p = typeof a === 'object' && a ? a.port : port;
  console.log(`hh-aid experiment UI: http://127.0.0.1:${p}/#token=${token}`);
});
const stop = () => { server.close(); store.close(); process.exit(0); };
process.on('SIGINT', stop); process.on('SIGTERM', stop);
