// Canonical JSON (RFC 8785 rules restricted to this project's value space): object members sorted
// by UTF-16 code units, no whitespace, strings escaped as JSON.stringify does (which matches
// RFC 8785 for strings), and numbers restricted to safe integers. Floats, -0, NaN, undefined
// members and non-plain values are rejected rather than coerced.
import { createHash } from 'node:crypto';

export function canonicalize(value: unknown, path = '$'): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || Object.is(value, -0)) throw new Error(`${path}: non-canonical number ${value}`);
    return String(value);
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v, k) => canonicalize(v, `${path}[${k}]`)).join(',')}]`;
  if (typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) throw new Error(`${path}: non-plain object`);
    const entries = Object.entries(value as Record<string, unknown>);
    for (const [k, v] of entries) if (v === undefined) throw new Error(`${path}.${k}: undefined member`);
    entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)); // code-unit order, never localeCompare
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v, `${path}.${k}`)}`).join(',')}}`;
  }
  throw new Error(`${path}: unsupported ${typeof value}`);
}

export const sha256 = (s: string | Uint8Array) => createHash('sha256').update(s).digest('hex');
export const digestOf = (value: unknown) => sha256(canonicalize(value));

/** Stable code-unit comparison for IDs (never locale dependent). */
export const byId = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
