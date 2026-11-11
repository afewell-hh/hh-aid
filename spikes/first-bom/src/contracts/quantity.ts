// Quantities: a safe integer, or a typed unknown that carries its reason and provenance.
// Unknown is never 0, null or omission. All arithmetic is checked; overflow yields a typed
// unknown with reason "quantity-overflow" rather than a rounded number.
export type Unknown = { state: 'unknown'; reason: string; provenance: string };
export type Q = number | Unknown;

export const unknown = (reason: string, provenance: string): Unknown => ({ state: 'unknown', reason, provenance });
export const isKnown = (q: Q): q is number => typeof q === 'number';

export function checkedMul(a: Q, b: Q, provenance: string): Q {
  if (!isKnown(a)) return a;
  if (!isKnown(b)) return b;
  const r = a * b;
  return Number.isSafeInteger(r) ? r : unknown('quantity-overflow', provenance);
}
export function checkedAdd(a: Q, b: Q, provenance: string): Q {
  if (!isKnown(a)) return a;
  if (!isKnown(b)) return b;
  const r = a + b;
  return Number.isSafeInteger(r) ? r : unknown('quantity-overflow', provenance);
}
export function sumQ(values: Q[], provenance: string): Q {
  let acc: Q = 0;
  for (const v of values) acc = checkedAdd(acc, v, provenance);
  return acc;
}
export function ceilDiv(a: Q, b: number, provenance: string): Q {
  if (!isKnown(a)) return a;
  if (b <= 0) return unknown('division-by-zero-capacity', provenance);
  return Math.ceil(a / b);
}
