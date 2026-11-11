# ADR-0002: Immutable project documents, canonical digests and single-file export

- **Status:** Proposed.
- **Decision owner:** lead, for the experiment. model/D01 is consulted if the revision manifest of D01 §5 is affected.
- **Context:** [architecture-options.md](../design/architecture-options.md) §4 and §5. The following contracts apply:
  - D01 `3d313fe`: §3 answer states, §5 identity, regeneration and revision manifest.
  - #29 `d97a2ef`: §4 determinism.
  - #28 `31779de`: RC-2 to RC-7.
  - parts #11 `3261186`: adapter boundary.

## Options

1. **Immutable full-snapshot documents, content-addressed (proposed).** Each save writes a complete input revision. Outputs are immutable. Export is one canonical JSON file.
2. **Event log with replay.** It records finer history, but replay semantics become part of determinism, which is more to verify in an experiment.
3. **A mutable database (SQLite) as the source of truth.** It handles large scale better, but export, digest and determinism layers are needed on top of it anyway.

## Decision (proposed)

Use option 1 for the experiment:

- **Canonical form.** Canonical JSON following RFC 8785, with no floats (integers or `{num, den}`), explicit units, and typed unknown that is never `0`, `null` or omission.
- **Ordering.** Arrays are sorted by stable ID using code-unit comparison, unless they are semantically ordered.
- **Digests.** A semantic digest per output revision, and a byte digest per rendered artifact. Audit metadata is excluded from both.
- **Import.** A size cap, strict schema validation, digest and closure verification, and rejection of unknown fields and versions. Migration is a separate, copy-based operation.
- **Round trip.** `export(import(export(P))) == export(P)` byte for byte.

## Consequences

- Full snapshots grow linearly with revisions. That is acceptable at experiment scale. Storage thresholds come from parts' measurements, and option 3 or chunking is the escape path.
- The oracle reads only the export, which decouples verification from storage.
- Revisions are not tamper-evident against the file owner, so a shared or approval context needs signing (architecture §8 Q6).

## Experiment criteria

`experiment-check lifecycle` and `npm run determinism` pass, and parts' V09 (persistence) and V11 (catalog) cases pass.
