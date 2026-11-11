# First BOM experiment: synthesis and delivery gate

Owner: t1 / lead, [#13](https://github.com/afewell-hh/hh-aid/issues/13). Review date: 2026-11-10. This records bounded experiment decisions, not completed inception or production approval.

## Decisions

Use the [BOM-first brief](../first-bom-experiment.md) and accepted [design checkpoint](../design-checkpoint.md). The next outcome is a runnable, saved, editable conditional BOM project. No further general screen iteration or topology survey is needed for this experiment.

- Use FB-01/r1: two generic accelerator and two storage servers, simultaneous frontend/backend attachments, conditional optical and shared-assembly constructions. The manifest is fixture input, not an approved equipment configuration or production schema.
- Use staged constructive allocation, explicit configured-resource accounting and conditional sizing bounds. Final switch/spine and missing infrastructure quantities remain visibly unresolved when their requirements are unknown. Do not present a capacity bound as an exact topology.
- Use a local single-user TypeScript application, React UI, CLI and filesystem project store as the experiment basis. Hosting, partner access and production stack decisions remain deferred. Exact supported runtime/package pins must be verified during scaffold preparation; this review does not certify the packet's claimed version availability.
- Use immutable canonical JSON documents and a self-contained project export. Keep complete input/output/evidence/review history reachable on export; derive staleness without editing historical documents. Validate quantities as safe integers, with typed unknowns.
- Approve the bounded one-shot compiled DS5000 profile extractor. Pin upstream source/toolchain, record the generated snapshot digest, and keep Go outside the application runtime. A manual fallback requires an explicit evidence downgrade and independent comparison; never silently substitute it.
- The seed importer must exclude author answers. The independent acceptance adapter reads exported actual state only. Confirm the proposed application CLI and separate verification harness ownership.

## Reviewed inputs and evidence

| Packet | Exact reviewed commit | Disposition |
| --- | --- | --- |
| D03 #10 / PR #32 | `ce4b8e6b03f79b8aa4ff796e8b4460ebc67312a8` | Lead accepts the bounded scenario/method direction; parts' final packet review remains due. Manifest unchanged from `9aa448a32deb62f57629ac0e5f3480ba95faab7d`. |
| D04 #11 / PR #31 | `32611864af40ee6bd7ef671622d534d3bc7b2d65` | Independent baseline/count and AC1 derivations reproduced. Correct projection type validation; finish D03 review. |
| D05 #12 / PR #33 | `9190a0a2bde0c27cc7c7fd9085e13134312e245f` | Experiment basis accepted; reconcile execution limits, cancellation/persistence and export roots before build dispatch. |

Lead ran both Python standard-library checkers successfully and checked all three diffs for whitespace errors. A separate corruption probe demonstrated that AC1 currently accepts boolean `false` for integer `assigned=0` because Python equality equates them. These are fixture/oracle checks, not application tests. No application, extraction, UI, performance or hardware execution is claimed.

## One consolidated completion pass

**t8 / parts, #11:** enforce type-correct numeric comparison in both actual projections, with corruption probes; finish the full D03 decision-packet review in #10; confirm architecture adapter ownership and the following measurement policy. Preserve independence from the engine.

**t7 / arch, #12:** reconcile the packet and ADRs with the decisions above. Specify an actually interruptible runner outside deterministic domain computation; define safe incomplete-result persistence without valid-plan claims. Add explicit export roots for outputs/reviews as well as inputs, and validation of digest/reference closure. Remove contradictory text that defers the selected one-shot extractor. Distinguish the typed project schema from the fixture's nullable shorthand.

For measurement, retain a bounded small/default run and a separate named scale configuration for 20,000–50,000 demands. Record demand and candidate limits, operation budget and deadline for each; the existing 10,000-demand/256-candidate defaults cannot qualify a larger scale run. Test limit handling separately from successful scale processing. Five samples and proposed investigation thresholds from D04 are measurements to attempt, not product SLOs. Do not weaken integrity checks for speed.

No new agent sessions. Topo has no rewrite assignment unless the independent review identifies a concrete domain error. Lead reviews only these deltas, then dispatches #14. Wider parent acceptance criteria and draft PRs stay open.

## Ordered executable work under #14

1. Reproducible scaffold and source lock; bounded profile extraction; shared schemas, safe canonicalization and export roots. Pin runnable dependencies from primary evidence.
2. Saved project and first useful BOM: seed/customize two server classes, per-unit accounting, installed/purchase distinctions, missing infrastructure, CLI/export/reimport and thin UI. Demonstrate fresh-process persistence and independent counts.
3. Allocation groups and physical constructions: configured/selected/assigned ledgers, conditional bounds, negative cases, optical/shared assembly ownership, expandable BOM and both-end connection-class review.
4. Revision behavior: count/DPU/group edits, locks, precise inspection staleness, immutable history, deterministic regeneration, diff and controlled evidence refresh.
5. Independent challenge and performance evidence: exported actual projections, occurrence-level conservation, lifecycle/UI checks, deliberate failures and the separately configured scale probe. Record commands, exact commits and limitations.

Each step must leave a runnable checkpoint. The first useful BOM is the first demo; complete wiring export is deferred. Build acceptance requires all rows in the delivery brief, not just count snapshots. The eventual exact Hedgehog-supported topology scope remains in the coverage ledger.

## Correction review and build release

Lead accepted D04 `25d642363a477e2b04a06e74421da0b15e991412` and D05 `75ba52328699c036c368d6700325011556d38615` after delta review. Parts independently accepted D03 `ce4b8e6b03f79b8aa4ff796e8b4460ebc67312a8` in #10 comment 6786925499. Both corrected oracle scripts pass; direct bool/float/null corruption probes reject invalid projections. The original type bug is closed. Architecture now specifies a worker runner, explicit history/export roots, safe integers, separate scale limits and source extraction provenance.

The bounded design gate is complete. Release #14 to existing t7 / arch and #15 harness preparation to existing t8 / parts. The [build assignment](../first-bom-build.md) supplies execution clarifications and ownership; no further document correction round is required. This supersedes pending-pass language above. It does not close broader parent criteria or claim any application tests have passed.
