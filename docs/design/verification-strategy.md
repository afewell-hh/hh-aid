# First-BOM verification packet

Author: t8 / parts. Assignment: [D04 #11](https://github.com/afewell-hh/hh-aid/issues/11#issuecomment-6786444311). Independent reviewer: lead. Status: early draft; D03 manifest and sizing review pending. This does not complete #11 or authorize production implementation.

## Evidence and independence

Start from [delivery brief](../first-bom-experiment.md) and [checkpoint](../design-checkpoint.md) at main `4c71aa5`. The checkpoint pins accepted server-class, parts, profile, allocation and screen evidence separately. Current source baseline is historical Fabric v0.144.1 `4bde50829fd7cfebac69332982abd1dee504a8a3`; no current-release qualification is asserted. Reuse exact source evidence through D03's manifest, not a guessed latest component composition.

Facts: the brief requires two classes, simultaneous attachments, partial BOMs, independent expected results, configured-resource accounting and saved revisions. All interface choices, targets and future checks below are proposals. No maintainer intent is inferred. Previously authored parts examples are design inputs, not independent proof of new application behavior.

D03 owns `docs/design/first-bom/` scenario inputs; this packet owns only its `verification/` subtree. At kickoff #10 had no manifest. Do not substitute SU/SCX numbers or create a competing population manifest. Final expected BOM/allocation files must wait for the exact D03 input commit, then be reviewed by lead. AC1 below is an explicitly separate accepted synthetic counterexample, not the scenario's switch profile.

For each frozen expected result record: case ID, exact source manifest path/commit and SHA-256 bytes, explicit input mutations, handwritten derivation, expected quantities/states/diagnostics and coverage exclusions. Enumerate owned occurrences and shared requirement IDs from source inputs; never import the engine, copy generated output or bless a failing actual as a new golden. The verifier may normalize export fields, but must not reconstruct missing actual values from expected data. A changed oracle needs a source change or corrected derivation, a diff and independent disposition.

## Proposed adapter boundary

Architecture may choose storage/API formats. A test adapter exposes these projections from actual saved/generated state, without adding facts:

| Projection | Required evidence |
| --- | --- |
| Input identity | manifest digest, project/snapshot ID, class/customization/population identities, source profile/catalog/rule versions and explicit alternatives |
| BOM line | stable requirement ID, part/revision or generic ID, unit, installed quantity/state, purchase-unit references, coverage IDs and quantities, inclusion state; scope and source occurrence paths |
| Purchase unit | unique acquisition ID, unit/quantity/state, covered requirements; no per-owner duplicate assembly purchases |
| Physical construction | link/member IDs, module/assembly IDs, physical ends, active/parked status, parent/group mapping, unresolved per-instance fields |
| Allocation | physical switch occurrence, canonical parent/child and configured footprints, selected/free candidates, reservations/owners and assignments as separate ledgers |
| Sizing | exact-conditional, lower-bound or unresolved; derivation, assumptions, unmet demands, shared budgets and missing infrastructure |
| Inspection | member set, field set, signature/source revision, reviewer/time/notes, stale exclusions; never qualification |
| Lifecycle | immutable revisions, semantic digest, adopted catalog version, preserved commitments/overrides, source-to-output trace and diff |

Quantities are typed known/conditional/unknown; omitted is not zero. Unknown SKU differs from unknown quantity and unknown inclusion. Comparison is per identity and unit, not a sum of servers, modules, kits and licenses. Compare alternatives separately. Reject duplicate IDs before set deduplication; views may repeat references, but inventory records may not duplicate identities. Diagnostics must identify the implicated requirement/resource and reason, not just fail with a generic message.

## Expected-result obligations

| ID | Independent oracle and deliberate counterexample | Required result |
| --- | --- | --- |
| V01 population/nesting | Expand each physical population once, then immediate-parent multiplicities; dual DPU alternative replaces rather than adds | Same FE link count, extra physical DPU and its management interface; no inventory copy per network; exact counts pending D03 |
| V02 inclusion | Installed need minus explicit occurrence coverage; unknown inclusion separate; spare is a new requirement | Included child remains installed, zero additional purchase only for covered quantity; partial coverage leaves residual; unknown never silently suppressed |
| V03 assembly/optic | Enumerate unique modules/assemblies from actual construction map, including remote optics | Native separate modules normally two per link, shared modules by identity; integrated assembly once, no invented end optics; parked tail has no active link/remote cage |
| V04 presentation | Keyed installed/purchase line maps before/after collapse or alternate owner views | Identical identities, quantities, units, states and coverage; no scalar mixed-item KPI; reject duplicate supply across packages |
| V05 resource | Independently enumerate all configured parent footprints, including unused and reserved | AC1 8 configured >6 while selected2 and assigned0; unknown unused mode means unresolved total, not zero |
| V06 assignment | Demand-to-resource incidence with rail/domain/plane/role constraints and reservations | No duplicate port/base-child occupancy, no silent relocation of locks; uncovered demand diagnostic; unknown topology prevents exact feasibility claim |
| V07 sizing/scope | Independently derive bound and any constructive witness from D03 inputs | Capacity lower bound is not exact supported topology; named switch/spine/uplink/OOB/ancillary requirements remain unresolved when absent; excluded external plant still a dependency |
| V08 determinism | Repeat generation in fresh process; reorder only semantically unordered input maps | Same normalized semantic output and trace; explicit selector/demand order changes are semantic changes, not an invariant |
| V09 persistence | Save, stop process, reopen/export, import into clean store, regenerate | IDs, unknowns, overrides, versions, inspection and commitments survive; no duplicate identities on retried creation; historical revision unchanged |
| V10 refinement | Change count, group membership and one instance length; remove locked assignment | Prior output preserved; dependent result/inspection stale with precise member/field scope; unchanged member coverage can remain; conflict visible, no silent unlock |
| V11 catalog | Controlled local catalog revision changes a capability, then adopt explicitly | Old snapshot bytes/semantic digest remain; affected counts/conflicts re-evaluated; no synthetic claim of a real new release; unrelated presentation change not blanket invalidation |
| V12 manual review | Same vague label, different A/B PMD or assembly mapping; independent unknown paths | Separate construction or visible exception; inspection cannot cover unknown installation conditions or turn mismatch into support |

Minimal metamorphic checks: adding an attachment does not multiply servers; adding independent identical servers scales owned components, but shared assembly rounding uses explicit pairing; splitting population membership preserves total/IDs; alias groups preserve union capacity; adding reservations cannot increase free candidates or reduce configured usage; reversing display sort cannot change allocations; collapsing a row preserves its keyed map. Pairing constraints are not assumed linear under arbitrary population growth.

Generate bounded seeded mutations from the frozen manifest (duplicate resource, removed child, missing mode, known-over-budget+unknown parent, partial inclusion, repeated owner reference, stale catalog, one changed path). Print the seed and minimal changed IDs. Positive and negative expectations must be reviewed before invoking the engine. Failures in unknown cases should preserve useful independent BOM lines; they need not make the whole project unsaveable.

## Runnable boundary now and proposed experiment commands

Run now from repository root (Python standard library):

```sh
python3 -I docs/design/first-bom/verification/check_ac1.py
```

`ac1.json` fixes four explicit input/result cases. The independent helper enumerates configured footprints, not selected counts. Three corrupted projections must be rejected. Expected stdout: `AC1 fixture derivation and 3 corruption probes passed; no application tested`.

Future experiment adapter writes a JSON object keyed by these case IDs, each value containing exactly the expected result fields, from actual engine results. Then run:

```sh
python3 -I docs/design/first-bom/verification/check_ac1.py --actual /tmp/hh-aid-ac1-actual.json
```

Exit nonzero on differences. Matching JSON alone does not prove its producer is an application: capture producer command, app commit, input digests and raw outputs. The helper is a narrow resource oracle, not the final BOM comparator or allocator.

Proposed commands for #14 (NOT implemented or executed): `experiment-check generate --manifest PATH --export DIR`, `experiment-check lifecycle --manifest PATH --workdir DIR`, `experiment-check verify --expected PATH --actual DIR`, and `experiment-check measure --manifest PATH --repeats 5`. Arch owns the runnable app/adapter command and persistence teardown; parts owns frozen expectations and independent comparison. Lead must reconcile these names and export shape before build dispatch. Final manifest cases and comparator will be added here after D03 handoff, without changing app storage requirements.

## Minimal performance evidence

Measure the actual generation, export, save/reopen and grouped-review rendering separately, not the oracle arithmetic. Record machine/OS/runtime, app+manifest hashes, exact counts, cold/warm state and five individual wall-time samples; use monotonic elapsed time, report median and max, and OS peak resident memory (include child processes; state measurement tool/units). Python tracemalloc alone is not process memory. Capture semantic digests on every run. Report serialized export bytes separately from runtime memory.

Use the agreed small manifest plus one deterministic scale derivative targeting 20,000–50,000 attachment demands. Replicate complete disjoint scenario groups with unique IDs and unchanged local pairing/rail constraints; do not simply raise counts past fixed leaf capacity and call infeasibility a performance success. Preserve an explicit infrastructure-unknown result if the source scenario lacks a feasible witness. Add one per-instance exception and independently verify member conservation; few class rows alone do not prove every link was represented.

Proposed experiment investigation thresholds (not sponsor SLOs): small scenario generation <=2s; scale generation+machine export <=10s and peak RSS <=1GiB on the recorded development machine; small save/reopen <=2s; grouped summary first render <=2s after data arrival. Record misses and repeat once to diagnose noise; never waive accounting failures to meet timing. If machine or implementation makes targets unsuitable, lead approves a revised target with evidence. No broad topology/performance benchmark or hardware throughput claim.

## Gates and coverage ledger

Critical integrity failures (duplicate supply/resource, erased unknown, corrupt persistence, lost lock/history, nondeterminism with identical semantic inputs) fail experiment acceptance. Known allocation conflicts must be correctly diagnosed; a diagnostic test passes when the intended conflict is shown, not when an impossible case is allocated. Useful conditional estimates may retain explicit missing facts; exact/procurement/installation claims remain blocked by dependent unknowns. Manual compatibility inspection is primary; exhaustive automatic optics certification is not a gate for this experiment.

Schema, upstream admission, runtime behavior, hardware qualification and performance are separate evidence axes. If D03 actually emits wiring, use the version-pinned upstream validator and record exact command/environment/outcome. Do not invent wiring as a prerequisite to a BOM. VLAB can show software integration, not optics reach, RoCE losslessness, hardware independence or production performance.

| Original #11 criterion | This packet / remaining scope |
| --- | --- |
| Port/coverage/lane/rail/redundancy/compatibility/uplink/BOM checks | V01–V07/V12 obligations defined; scenario-specific expected counts and D03 sizing review pending; physical tuple qualification deferred |
| Golden/manual, property, metamorphic and invalid cases | AC1 executable; V01–V12 and mutations specified; full manifest goldens and app harness pending |
| Evidence layers, topology coverage, upgrades | Layers above; V11 controlled revision; exhaustive supported-topology/NOS coverage and live upgrade regressions deferred |
| Performance/reproducibility/gates | Measurement protocol and proposed thresholds; actual application measurements pending #14 |
| Versions, facts and reproducibility | Exact checkpoint pins, independent AC1 source and runnable helper; no fresh release assertion |
| Independent acceptance/domain decisions | Lead review pending; no self-approval; domain authority only for disputed support claims |

D03 review checklist, to post in #10 by criterion after its exact handoff: coherent manifest and provenance; independent owned/shared quantities; sizing proof versus bound; all configured budgets including unused mode; reservation/parent-child/exhaustion diagnostics; deterministic inputs/outputs; retained missing infrastructure; deferred topology coverage. Record accepted/changes requested/blocked per criterion with source-line evidence. Do not accept the packet merely because its author assertions pass.

## Current handoff state

Completed now: bounded strategy, adapter proposal, independent AC1 inputs/expected projections and corruption detection. Pending: exact #10 manifest, final scenario oracle and D03 review; arch interface reconciliation; lead acceptance. No current application behavior, upstream execution, hardware, user study or application timing/memory run is claimed. See #11 for actual commands/results and exact draft commit. Continue dependent work when #10 posts; no new specialist session requested.
