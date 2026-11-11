// Strict JSON parser for untrusted imports. Unlike JSON.parse it checks every number on its
// source token text: only safe integers are accepted (no fraction, exponent, -0 or |n| > 2^53-1),
// so 9007199254740993 cannot be silently rounded. Duplicate object keys are rejected.
export class JsonInputError extends Error {
  readonly path: string;
  constructor(message: string, path: string) { super(`${path}: ${message}`); this.path = path; }
}

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export function parseStrictJson(text: string, maxBytes = 64 * 1024 * 1024): Json {
  if (Buffer.byteLength(text, 'utf8') > maxBytes) throw new JsonInputError(`input exceeds ${maxBytes} bytes`, '$');
  let i = 0;
  const ws = () => { while (i < text.length && ' \t\n\r'.includes(text[i]!)) i++; };
  const fail = (m: string, path: string): never => { throw new JsonInputError(`${m} at offset ${i}`, path); };
  const value = (path: string, depth: number): Json => {
    if (depth > 256) fail('nesting too deep', path);
    ws();
    const c = text[i];
    if (c === '{') {
      i++; const out: { [k: string]: Json } = Object.create(null); ws();
      if (text[i] === '}') { i++; return out; }
      for (;;) {
        ws(); if (text[i] !== '"') fail('expected key', path);
        const k = str(path);
        if (Object.prototype.hasOwnProperty.call(out, k)) fail(`duplicate key ${JSON.stringify(k)}`, path);
        ws(); if (text[i] !== ':') fail('expected :', path); i++;
        out[k] = value(`${path}.${k}`, depth + 1); ws();
        if (text[i] === ',') { i++; continue; }
        if (text[i] === '}') { i++; return { ...out }; }
        fail('expected , or }', path);
      }
    }
    if (c === '[') {
      i++; const out: Json[] = []; ws();
      if (text[i] === ']') { i++; return out; }
      for (;;) {
        out.push(value(`${path}[${out.length}]`, depth + 1)); ws();
        if (text[i] === ',') { i++; continue; }
        if (text[i] === ']') { i++; return out; }
        fail('expected , or ]', path);
      }
    }
    if (c === '"') return str(path);
    if (text.startsWith('true', i)) { i += 4; return true; }
    if (text.startsWith('false', i)) { i += 5; return false; }
    if (text.startsWith('null', i)) { i += 4; return null; }
    const m = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?/.exec(text.slice(i, i + 400));
    if (!m) return fail('unexpected token', path);
    const tok = m[0];
    i += tok.length;
    if (m[2] || m[3]) fail(`non-integer number ${tok}`, path);
    if (tok === '-0') fail('negative zero', path);
    const n = Number(tok);
    if (!Number.isSafeInteger(n) || String(n) !== tok) fail(`unsafe integer ${tok}`, path);
    return n;
  };
  const str = (path: string): string => {
    const start = i; i++;
    for (; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if (ch === 0x22) { i++; return JSON.parse(text.slice(start, i)) as string; }
      if (ch === 0x5c) { i++; continue; }
      if (ch < 0x20) fail('control character in string', path);
    }
    return fail('unterminated string', path);
  };
  const v = value('$', 0); ws();
  if (i !== text.length) fail('trailing content', '$');
  return v;
}
