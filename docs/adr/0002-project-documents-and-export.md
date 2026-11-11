# ADR-0002: Immutable project documents, canonical digests and single-file export

- **Status:** Accepted **for the experiment basis** by lead ([6786859007](https://github.com/afewell-hh/hh-aid/issues/12#issuecomment-6786859007)), subject to gates G-A to G-D in [architecture-options.md §13](../design/architecture-options.md). Not production adoption.
- **Decision owner:** lead, for the experiment. model/D01 is consulted if the revision manifest of D01 §5 is affected.
- **Context:** [architecture-options.md](../design/architecture-options.md) §4 and §5. The following contracts apply:
  - D01 `3d313fe`: §3 answer states, §5 identity, regeneration and revision manifest.
  - #29 `d97a2ef`: §4 determinism.
  - #28 `31779de`: RC-2 to RC-7.
  - parts #11 `3261186`: adapter boundary.

## Options

1. **Immutable full-snapshot documents, content-addressed (chosen).** Each save writes a complete input revision. Outputs are immutable. Export is one canonical JSON file.
2. **Event log with replay.** It records finer history, but replay semantics become part of determinism, which is more to verify in an experiment.
3. **A mutable database (SQLite) as the source of truth.** It handles large scale better, but export, digest and determinism layers are needed on top of it anyway.

## Decision (experiment basis)

Use option 1 for the experiment:

- **Canonical form.** Canonical JSON following RFC 8785, with no floats (integers or `{num, den}`), explicit units, and typed unknown that is never `0`, `null` or omission.
- **Safe integers.** Quantities and ratio terms are JavaScript safe integers. The import check runs on the source token text, before `JSON.parse` can round anything, and engine arithmetic overflow yields a typed `unresolved` result.
- **Roots and history.** An immutable `ProjectIndex` chain lists every root: inputs, outputs, diffs, reviews, evidence, stage results and partial candidates. An atomically replaced `HEAD` is the only mutable pointer and the single commit point. Staleness and review applicability are derived on read and never stored in hashed documents.
- **Ordering.** Arrays are sorted by stable ID using code-unit comparison, unless they are semantically ordered.
- **Digests.** A semantic digest per output revision, and a byte digest per rendered artifact. Audit metadata is excluded from both.
- **Import.** A size cap, strict schema validation, digest verification, closure from `head`, rejection of unreachable extra documents, consistency checks, and rejection of unknown fields and versions. Migration is a separate, copy-based operation.
- **Round trip.** `export(import(export(P))) == export(P)` byte for byte, for a project that retains an older output, a diff and a review.

## Consequences

- Full snapshots grow linearly with revisions. That is acceptable at experiment scale. Storage thresholds come from parts' measurements, and option 3 or chunking is the escape path.
- The oracle reads only the export, which decouples verification from storage.
- Revisions are not tamper-evident against the file owner, so a shared or approval context needs signing (architecture §8 Q6).

## Experiment criteria

`experiment-check lifecycle` and `npm run determinism` pass, and parts' V09 (persistence) and V11 (catalog) cases pass.
