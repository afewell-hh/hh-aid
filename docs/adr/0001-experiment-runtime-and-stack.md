# ADR-0001: Runtime and stack for the first BOM experiment

- **Status:** Proposed. Not accepted; no production decision.
- **Decision owner:** lead, for the experiment scope (#13 synthesis, #14 dispatch). The sponsor owns any deployment, hosting or data-custody policy.
- **Context:** [architecture-options.md](../design/architecture-options.md) §1, §3 and §8, and the [BOM-first brief](https://github.com/afewell-hh/hh-aid/blob/4c71aa5/docs/first-bom-experiment.md). The brief prefers a single-user runnable setup as an experiment simplification. It also asks for a comparison with a shared service.

## Options

- **L: local single-user.** A TypeScript workspace containing a pure engine, a filesystem store, a CLI, and a local React UI on `127.0.0.1`.
- **S: shared service.** The same engine and documents on a hosted service, with OIDC, Postgres, workers and a sandboxed U-gate.

Rejected variants:
- Browser-only storage: eviction risk, uneven browser support, and headless acceptance would still need another runtime.
- Go everywhere: the UI still needs JavaScript, and R03 advises keeping Fabric module coupling inside an adapter.
- Python application: two languages in the application, and it removes the language diversity from parts' Python oracle.

## Decision (proposed)

Use **L** for the experiment. Pin Node.js to the LTS line; 26.x was observed as LTS on 2026-11-10. Use JSON Schema with Ajv for contracts, and Vitest, fast-check and Playwright for tests. Pin exact dependency versions with a lockfile, a minimum package age of 14 days, and install scripts disabled by default. Go appears only in the one-shot profile extractor (architecture §5). It is never a runtime dependency.

## Consequences

- No collaboration, central audit or shared starter library in the experiment. These are already deferred by the brief.
- The export format becomes the compatibility contract for a later S, so it must carry a format version from the first commit.
- Customer data stays on SE machines. Leakage then depends on how SEs handle export files. Sponsor guidance on classification is needed before any real customer project (architecture §8 Q1).

## Experiment criteria to confirm or revisit

Revisit this ADR if any of the following happens:
- the acceptance commands in architecture §6 cannot be made deterministic on two machines;
- parts' scale probe exceeds the agreed thresholds because of the runtime rather than the algorithm;
- the sponsor requires multi-user use within the experiment.
