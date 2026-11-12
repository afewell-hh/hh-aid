# #14 build handoff: evidence and results

These are author evidence (t7 / arch). They are not acceptance. Independent verification is t8 / parts (#15), and lead reviews.

- **Experiment scope:** the FB-01 conditional estimate.
- **Not covered:** no wiring is emitted, no upstream validation was run, and nothing about hardware or qualification is claimed.

## Correction pass: lead's B1–B3 (#14 comment 6802266475)

This section supersedes the earlier figures where they differ. The final correction commit is named in the #14 comment.

| Item | Change | Evidence |
| --- | --- | --- |
| **B1: lost concurrent edit** | `seed`, `edit` and `refresh` each run their full read-modify-write under `ProjectStore.withInputLock`. A commit that moves `inputHead` must name its base (`expectInputHead`), and a mismatch throws `StaleWriteError`. The UI sends its loaded head as `baseInput` (the CLI takes `--base-input`). A stale write gets HTTP 409, nothing is written, and the tab reloads. | `test/corrections.test.ts`: lead's `Promise.all` repro (edit/edit), edit/refresh, a stale patch and refresh (HEAD and the document count unchanged), and the store guard. `e2e/corrections.spec.ts` B1 runs two tabs: the second gets a visible "stale write" message, then a retry succeeds on top of the first tab's edit ([screens/b1-stale-tab.png](screens/b1-stale-tab.png)). |
| **B2: invalid export head** | Import validates the envelope types and a 64-hex head that is a listed `ProjectIndex`. It checks the index chain: one project, append-only roots, and an `inputHead` that resolves to a listed `InputRevision` of the project (or is null with no inputs). All of this happens before any file is written; if writing fails partway, the import removes what it created. | `test/corrections.test.ts` covers `''`, `null`, `0`, non-digest and absent heads, a malformed envelope, a missing head, a wrong-kind head, wrong-kind, missing, unlisted and foreign `inputHead`s, inputs without a head, dropped roots and a mixed chain. Each leaves the target uninitialized. A valid empty unseeded project round-trips byte-identically with a clean `fsck`, and a non-empty target is refused. |
| **B3: per-end physical fields** | `Construction.ends.server` (side A) and `.switch` (side B) are independent. Separate optics carry `cage, connector, pmd, reach, fiber`; an integrated assembly carries `cage, connector, media, length, hostFit`. Each value is a string or a typed unknown, and the schema enforces the fields for each kind. They are seeded from the manifest's construction fields (`null` becomes `not-supplied`; an absent field becomes `not-in-source`), with nothing derived from item names. Row signatures include both ends. Rows expose `inspectableFields`, a derived `unknownFields`, and the shortcuts `physicalA` / `physicalB`. The diff reports `reviewRows.materialChanges` field by field. An ends-only edit previews 0 BOM lines and only the affected rows. The Destinations tab has a construction end editor that the review shortcuts open. | `test/corrections.test.ts`: the baseline keeps all fields unknown on every row. A synthetic `SYNTH-*` case shows the ends differing under identical item descriptions, with purchase lines byte-identical, the same members, a new row, the diff, inspection rules, the BE inspection retained, and the FE inspection needing review after a switch-end change. Kind validation and export/import persistence are also tested. `e2e/corrections.spec.ts` B3: [screens/b3-connection-review.png](screens/b3-connection-review.png), [screens/b3-construction-ends.png](screens/b3-construction-ends.png), [screens/b3-diff.png](screens/b3-diff.png). [screens/cp3-connection-review.png](screens/cp3-connection-review.png) is regenerated with the per-end columns. |

**Format change.** `InputRevision.constructions[].unknownFields` is replaced by `ends`, and the engine is now `hhaid-engine/0.2.0`, so exports from `0b21b90` do not import into this build. BOM, ledger, group, sizing and assignment fields are unchanged: FB-01 numbers and AC1 results are identical (`bom`, `allocation` tests). Output digests differ from `0b21b90` (for example, the scale output is no longer `bede7f8a…`) because review rows changed.

**Performance (lead decision).** About 1.35 GiB peak RSS at scale is kept as a visible experiment limitation. It **exceeds** the 1 GiB investigation threshold and is not a pass. No export redesign was made in this cycle; lead tracks optimization in #16, and parts measures independently.
- **Not re-run:** the five-sample measurement below is from `0b21b90` and was not repeated for this pass.
- **One unbenchmarked observation on this build:** a `generate --config scale` on the 1,000-replica fixture completed in 3.76 s with a 1.11 GB maximum RSS (generation only, no export).
- **Not measured:** UI rendering time, which remains for the independent run.

**Regression commands for this pass:** `npm run typecheck`, `npm test` (51/51), `PLAYWRIGHT_BROWSERS_PATH=$PWD/.toolchain/playwright npm run e2e` (5/5), `npm run determinism` (7/7), `./experiment-check lifecycle --workdir W`, and `python3 -I verification/verify.py self-test`.

## Commands actually run at `0b21b90` (original handoff)

Run from `spikes/first-bom`, with the pinned Node on `PATH`.

| Command | Result |
| --- | --- |
| `scripts/bootstrap-node.sh` | `node-v26.13.0-darwin-arm64.tar.gz: OK` against nodejs.org SHASUMS256.txt |
| `npm ci` | 0 vulnerabilities; install scripts disabled |
| `npm run sources:materialize` | 18 sources verified |
| `npm run typecheck` | clean (TypeScript 7.0.2) |
| `npm test` | `tests 39, pass 39, fail 0` (contracts, seed, BOM, allocation, lifecycle, persistence, runner and limits, scale) |
| `npm run e2e` | `3 passed` (Playwright, Chromium headless shell 156) |
| `npm run determinism` | 7 cases deterministic across 3 separate processes. Each case had two natural-order processes and one with reversed classes, populations, networks, contexts, constructions and evidence load order. |
| `./experiment-check lifecycle --workdir W` | Re-export byte-identical; the regenerated head equals the original head output; `fsck` 0 orphans, 0 problems. Summary: [runs/lifecycle-summary.json](runs/lifecycle-summary.json) |
| `python3 -I verification/verify.py self-test` | Parts' harness `10b0cdc`, integrated unchanged: "Harness self-test passed; no application tested" |
| `verification/measure.py … -- experiment-check generate --config scale --scale 1000` | 5 samples, all `complete`, all with output `bede7f8a8106…`. See the scale table below. |

## Demonstration rows from the brief, with executable evidence

| Row | Evidence (test or flow) |
| --- | --- |
| **Create and save** | `e2e/checkpoint2.spec.ts` covers two class populations and a server restart in a fresh process. `test/persistence.test.ts` runs each step as a separate CLI process. |
| **Customize (DPU)** | `bom.test.ts` "FB-DPU keeps two frontend links…" and the e2e DPU split: +2 adapters, +2 management interfaces, frontend links unchanged, `replaces` lineage recorded |
| **Define destination** | The Destinations tab (network → leaf context → allocation group, selector editor, explicit order) and `e2e/checkpoint34.spec.ts` exhaustion flow. Switch-instance binding is not required. |
| **Generate** | `bom.test.ts`: installed vs purchase lines, included items covered and not purchased, unknown inclusion typed, one purchase per shared assembly or parent module, each link in exactly one unit. Missing infrastructure is never zero (also checked in e2e). |
| **Inspect** | e2e expansion leaves totals unchanged. Connection review shows both ends, counts, exceptions, unknowns, edit shortcuts, and a manual note scoped to field, member set and revision (`lifecycle.test.ts`, `checkpoint34.spec.ts`). Inspecting an unknown field is refused. |
| **Explain failure** | `allocation.test.ts` AC1 (8 > 6 with 2 selected and 0 assigned; reservations change neither; unknown mode is unresolved, not 4), FB-UNKNOWN-MODE, FB-EXHAUST (4 unmet, no borrowed uplinks), FB-LOCK (retained conflict, no relocation), invalid context, duplicate selector |
| **Refine and regenerate** | `lifecycle.test.ts`: scoped staleness (the B-frontend inspection is retained and the A-frontend inspection needs review after FB-COUNT), and a diff showing regrouped FE modules and 8 added assemblies. `determinism` covers replay. Historical outputs are byte-unchanged. |
| **Refresh evidence** | `lifecycle.test.ts` and e2e: a controlled `local-modified` revision makes FE conflict (8 > 6) while BE stays within budget. The old output bytes are unchanged and assessed "evidence superseded". This is not presented as a Hedgehog release. |
| **Persistence/history** | `persistence.test.ts`: round trip retaining an older output, a diff and a review. Import rejects a tampered digest, an unreachable extra document, a dangling reference, an unknown field, an unsafe integer and an unknown format. A crash before `HEAD` leaves the project unchanged. A second writer is refused. |
| **Runner** | `runner.test.ts`, synchronized with barriers: cancel before S1 (no new component result), cancel after S1 (S1 preserved and rooted, then reused on resume; the resumed output equals the uninterrupted one), deadline while held, event loop responsive during the scale run, corrupted cache entry treated as a miss, concurrent save plus generate with no lost roots |
| **Limits** | Interactive-configuration cap on the scale fixture: deterministic `limit-reached` at S1, component lines kept, construction lines typed unknown. Tiny S4 budget: deterministic, no partial assignments, 52 units preserved. A compact population of 10¹² gives aggregate lines without materialization, and a count of 2⁵³−1 gives a typed overflow. |
| **Scale success** | 1,000 disjoint replicas under `scale`: 4,000 servers, 24,000 demands, each link in exactly one unit, 24,000 distinct assignments, one per-instance DPU exception (6,001 management interfaces), every INF line unknown |

## Scale measurement (5 fresh processes; parts' `measure.py`, `/usr/bin/time` process-tree peak RSS)

- **Machine:** macOS 26.5 arm64 (the author's laptop).
- **Configuration:** `scale`, from [runs/scale-config.json](runs/scale-config.json).
- **Each sample** runs `new`, `seed --scale 1000`, `generate` and `export` as separate CLI processes.

| Sample | Wall time (s) | Peak RSS (bytes) | `generate` (ms) | `export` (ms) |
| --- | --- | --- | --- | --- |
| 1 | 8.340 | 1,446,248,448 | 3,266 | 4,437 |
| 2 | 8.180 | 1,442,250,752 | 3,227 | 4,353 |
| 3 | 8.153 | 1,444,200,448 | 3,211 | 4,331 |
| 4 | 8.119 | 1,446,576,128 | 3,148 | 4,366 |
| 5 | 8.136 | 1,442,119,680 | 3,225 | 4,319 |

**Median 8.153 s, maximum 8.340 s.** The per-step milliseconds come from the driver's own log (`runs/scale-sample-*.generate-log.json`). Raw files: `runs/scale-measure-report.json` and `runs/scale-sample-*.time.txt`.

**Reported honestly against D04's proposed investigation thresholds** (these are not SLOs):

- Generation plus machine export at about 8.2 s is **within** the 10 s threshold.
- Peak RSS of about 1.35 GiB **exceeds** the 1 GiB threshold.

Export dominates. The export file is 100.7 MB, because each `OutputRevision` embeds every section and its `StageResult`s duplicate them, and the store canonicalizes the whole closure in memory. Candidate fixes, none of them done: stream the export, and reference stage results instead of duplicating them. This is the experiment's main known performance limit at scale.

The interactive small run (FB-01) generates in about 0.2 s from the CLI. That figure was observed once and is not a benchmark.

## Explicitly unresolved or not done

- **Independent projections from actual exports.** Running parts' `fb01` and `ac1` checkers on application exports needs parts' export-to-projection adapter (owned by #15, not yet published). The fields it needs are in the export (see `schemas/documents.schema.json`). I did not write that adapter, to keep it independent.
- **UI rendering time** was not measured.
- **Screenshots** from the e2e run are in [screens/](screens/); the `b1-*` and `b3-*` screenshots come from the correction pass. The demonstration route is `npm run app -- <projectDir>`.
- **Not run:** wiring emission, the upstream `hhfab` validation gate, VLAB and hardware. Optics and assembly qualification remain unknown by design.
- **Scope ledger.** Spine, uplink media, control/gateway, OOB and ancillary sizing stay unresolved. So do arbitrary redundancy and two-plane coverage, broad catalogs, shared hosting and procurement.
