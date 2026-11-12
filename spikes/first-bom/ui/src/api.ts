// Thin client for the local API. The session token comes from the URL fragment (never sent to the server
// in a URL) and is kept in sessionStorage for reloads.
const token = (() => {
  const m = /token=([0-9a-f]+)/.exec(location.hash);
  try { if (m) sessionStorage.setItem('hhaid-token', m[1]!); return m?.[1] ?? sessionStorage.getItem('hhaid-token') ?? ''; } catch { return m?.[1] ?? ''; }
})();
async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`/api/${path}`, { method, headers: { 'x-hhaid-token': token, ...(body !== undefined ? { 'content-type': 'application/json' } : {}) }, body: body !== undefined ? JSON.stringify(body) : undefined });
  const data = await r.json(); if (!r.ok) throw new Error(data.error ?? r.statusText); return data as T;
}
// The input revision this tab last loaded. Every input mutation carries it, so a change computed from an
// out-of-date view (another tab or request moved the head) is rejected by the server with 409, never applied.
let baseInput: string | null = null;
export const setBaseInput = (id: string | null) => { baseInput = id; };
const based = (b: object) => (baseInput ? { ...b, baseInput } : b);
export const api = {
  project: () => call<any>('GET', 'project'),
  doc: (id: string) => call<any>('GET', `doc/${id}`),
  edit: (b: object) => call<any>('POST', 'edit', based(b)),
  generate: (config: string) => call<{ run: string }>('POST', 'generate', { config }),
  run: (id: string) => call<any>('GET', `runs/${id}`),
  cancel: (id: string) => call<any>('POST', `runs/${id}/cancel`, {}),
  review: (b: unknown) => call<any>('POST', 'review', b),
  diff: (from: string, to: string) => call<any>('POST', 'diff', { from, to }),
  refresh: (file: string) => call<any>('POST', 'refresh', based({ file })),
  exportUrl: () => `/api/export`, token,
};
export const isUnknown = (q: any) => q && typeof q === 'object' && q.state === 'unknown';
export const fmtQ = (q: any) => isUnknown(q) ? `unknown (${q.reason})` : String(q);
