# S02: independent first-BOM verification

Owner: t8 / parts. Independent reviewer: lead. Assignment: [#15](https://github.com/afewell-hh/hh-aid/issues/15#issuecomment-6787025716). Build authority: [first-bom-build.md](../first-bom-build.md) at `6a91fd1`. Status: harness preparation; no runnable application checkpoint reviewed yet. No production or hardware qualification claim.

Inputs pinned: D03 `ce4b8e6b03f79b8aa4ff796e8b4460ebc67312a8`; D04 `25d642363a477e2b04a06e74421da0b15e991412`; D05 `75ba52328699c036c368d6700325011556d38615`. Expected fixtures stay independent of generator output. All substantive execution evidence and checkpoint commits are recorded in #15 and summarized here as available.

## Prepared interface

`spikes/first-bom/verification/verify.py` materializes exact pinned oracle bytes, runs strict count projection checks and byte roundtrip checks. `measure.py` captures five actual process samples plus OS RSS, exact input/config hashes and stdout/stderr. These utilities have no engine imports. Export-to-projection and occurrence/history checks await the actual export schema from arch; no guessed schema or copied expected values substitute for actual data.

## Acceptance ledger

| Criterion | Status / evidence required |
| --- | --- |
| Exact source/oracle materialization and strict JSON/type comparison | Harness self-tests available; no app result yet |
| Two classes, DPU/count, owned components and bundle coverage | Pending exported per-occurrence records; compare known, included and unresolved quantities separately |
| Shared modules/assemblies and group conservation | Pending actual identity/end map; duplicate owner references cannot become purchases; parked tails are not active links |
| Configured/selected/assigned resources and sizing | Pending AC1, unknown unused mode, aliases, parent collision, exhaustion, same-rail pairing and retained lock conflicts |
| Persistence/export history | Pending fresh-process save/reopen and export/import with older output+review+diff+partial/stage roots; verify all referenced digests and no missing/unreachable documents |
| Determinism/refinement/catalog | Pending same semantic config replay, change/stale scope, historical immutability and synthetic evidence refresh |
| Unsafe inputs/bounded expansion | Harness parser tests are not app import tests; app must reject unsafe tokens and bound huge compact-input expansion/checked arithmetic |
| Limits/cancellation/cache/concurrency | Pending separate caps/deadline/user-cancel with barrier synchronization; completed stages preserved; no valid-plan claims for unfinished assignments; verify content before cache reuse and serialized root updates |
| Scale and memory | Pending actual D05 named scale config, five samples, independent member conservation and integrity gates; investigation targets are not measured claims |
| Screen demonstration | Pending actual local route and review; no static screenshot substitutes for runtime |

No upstream validator is required for this BOM-only experiment; no wiring emitted/validated is claimed. Broad topology, hardware reach/qualification, production security/hosting and live deployment remain outside coverage. Lead accepts/rejects the final evidence; author does not self-close #15.

## Executed harness-only preparation checks

- `python3 -I spikes/first-bom/verification/verify.py self-test`: unsafe/duplicate JSON rejection; exact oracle materialization; both accepted D04 checkers (5 AC1 and2 FB01 corruption probes); refusal to overwrite altered oracle bytes. Passed.
- `measure.py` invoked on a trivial Python subprocess in a temporary directory: five samples, each with positive OS RSS and exit0. This validates recorder plumbing only; no application latency/RSS evidence.
- `git diff --cached --check`: documentation/code whitespace check at handoff.

No runnable checkpoint or published export schema was present in #14 at the latest check. The pending rows above remain pending; this preparation commit is available for arch to integrate exactly.
