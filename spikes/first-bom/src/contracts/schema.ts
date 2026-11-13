// Ajv (draft 2020-12) validation of every document written or imported.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const schema = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', 'schemas', 'documents.schema.json'), 'utf8'));
const ajv = new (Ajv2020 as any)({ allErrors: false, strict: true, strictRequired: false, allowUnionTypes: true });
const validate = ajv.compile(schema);

export class SchemaError extends Error {}
export function validateDocument(doc: unknown): void {
  if (!validate(doc)) {
    const e = validate.errors?.[0];
    throw new SchemaError(`schema: ${(doc as any)?.kind ?? '?'} ${e?.instancePath || '/'} ${e?.message}${e?.params ? ' ' + JSON.stringify(e.params) : ''}`);
  }
}
