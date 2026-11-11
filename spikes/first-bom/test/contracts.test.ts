import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canonicalize } from '../src/contracts/canonical.ts';
import { parseStrictJson } from '../src/contracts/json.ts';
import { checkedMul, checkedAdd, isKnown } from '../src/contracts/quantity.ts';

test('canonical JSON sorts keys by code unit and is whitespace free', () => {
  assert.equal(canonicalize({ b: 1, a: [true, null, 'é'], A: { z: 0, 'é': 2 } }), '{"A":{"z":0,"é":2},"a":[true,null,"é"],"b":1}');
  assert.equal(canonicalize({ '😀': 1, '￿': 2 }), '{"😀":1,"￿":2}'); // UTF-16 code-unit order
});
test('canonical JSON rejects floats, -0, NaN, undefined members and non-plain objects', () => {
  for (const v of [1.5, -0, NaN, Infinity, 2 ** 53, { a: undefined }, new Date(0), new Map()]) assert.throws(() => canonicalize(v as any));
});
test('strict parser rejects unsafe or non-integer tokens on the source text (no silent rounding)', () => {
  for (const t of ['9007199254740993', '1e3', '1.0', '-0', '{"a":1,"a":2}', '[1,]', '{"a":1}x', '"\u0001"']) assert.throws(() => parseStrictJson(t), t);
  assert.equal(parseStrictJson('9007199254740991'), 9007199254740991);
  assert.equal(parseStrictJson('-9007199254740991'), -9007199254740991);
  assert.deepEqual(parseStrictJson('{"q":{"state":"unknown"}}'), { q: { state: 'unknown' } });
});
test('ratio with zero denominator and overflowing products are typed unresolved, never rounded', () => {
  const r = checkedMul(2 ** 52, 4, 'test'); assert.equal(isKnown(r), false); assert.equal((r as any).reason, 'quantity-overflow');
  assert.equal(isKnown(checkedAdd(Number.MAX_SAFE_INTEGER, 1, 't')), false);
  assert.equal(checkedMul(100, 8, 't'), 800);
});
