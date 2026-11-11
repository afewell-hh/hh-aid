# First-BOM verification packet

Author: t8 / parts. Assignment: [D04 #11](https://github.com/afewell-hh/hh-aid/issues/11#issuecomment-6786444311). Independent reviewer: lead. Status: draft with independent FB-01 expectations; full D03 design review accepted within scope (see below). This does not complete #11 or authorize production implementation.

## Evidence and independence

Start from [delivery brief](../first-bom-experiment.md) and [checkpoint](../design-checkpoint.md) at main `4c71aa5`. The checkpoint pins accepted server-class, parts, profile, allocation and screen evidence separately. Current source baseline is historical Fabric v0.144.1 `4bde50829fd7cfebac69332982abd1dee504a8a3`; no current-release qualification is asserted. Reuse exact source evidence through D03's manifest, not a guessed latest component composition.

Facts: the brief requires two classes, simultaneous attachments, partial BOMs, independent expected results, configured-resource accounting and saved revisions. All interface choices, targets and future checks below are proposals. No maintainer intent is inferred. Previously authored parts examples are design inputs, not independent proof of new application behavior.

D03 owns `docs/design/first-bom/` scenario inputs; this packet owns only its `verification/` subtree. At kickoff #10 had no manifest. The early FB-01 manifest is now pinned below; no SU/SCX populations were silently combined. Final application identity/allocation projections still require D03/arch reconciliation and lead review. AC1 below is an explicitly separate accepted synthetic counterexample, not the scenario's switch profile.

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
| V01 population/nesting | Expand each physical population once, then immediate-parent multiplicities; dual DPU alternative replaces rather than adds | Same FE link count, extra physical DPU and its management interface; no inventory copy per network; exact FB-01 counts below |
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

`ac1.json` fixes four explicit input/result cases. The independent helper enumerates configured footprints, not selected counts. Five corrupted projections must be rejected, including false-for-zero and float-for-integer. Expected stdout: `AC1 fixture derivation and 5 corruption probes passed; no application tested`.

Future experiment adapter writes a JSON object keyed by these case IDs, each value containing exactly the expected result fields, from actual engine results. Then run:

```sh
python3 -I docs/design/first-bom/verification/check_ac1.py --actual /tmp/hh-aid-ac1-actual.json
```

Exit nonzero on differences. Matching JSON alone does not prove its producer is an application: capture producer command, app commit, input digests and raw outputs. The helper is a narrow resource oracle, not the final BOM comparator or allocator.

Proposed commands for #14 (NOT implemented or executed): `experiment-check generate --manifest PATH --export DIR`, `experiment-check lifecycle --manifest PATH --workdir DIR`, `experiment-check verify --expected PATH --actual DIR`, and `experiment-check measure --manifest PATH --repeats 5`. Arch owns the runnable app/adapter command and persistence teardown; parts owns frozen expectations and independent comparison. The #12 export-only adapter and command ownership are confirmed for this interface: arch owns `hhaid validate-input|new|seed|edit|generate|diff|export|import|refresh`, app persistence/teardown and the thin generate/lifecycle drivers; parts owns independent verify/measure expectations and checks. `spikes/first-bom/tests/adapter/` reads only exported `.hhaid.json`, never engine code or expected fixtures, and translates typed unknowns to null only in the oracle projection. It must reject missing records rather than filling them from expected data. The manifest importer ignores `author_expected` and all mutation expected fields. Pinned compiled profile extraction, not the verifier's hand grouping, supplies the engine's profile snapshot. Lead accepted this basis in #12 comment6786859007; arch's runner/export-closure correction remains a separate build gate. The count projection below is now executable; full application identity/lifecycle comparison remains future harness work, without prescribing app storage.

Both projection comparators recursively validate exact JSON types and keys before values. Integers reject bool and float (including 0.0); null is distinct from zero/false and missing fields. Objects require the complete expected key set and arrays retain length/order. Each checker includes targeted false-for-zero and float-for-integer rejection probes; valid projections still pass. This is strict fixture-projection validation, not a general application schema. Import safe-integer/range validation remains an additional architecture obligation.

## Minimal performance evidence

Measure the actual generation, export, save/reopen and grouped-review rendering separately, not the oracle arithmetic. Record machine/OS/runtime, app+manifest hashes, exact counts, cold/warm state and five individual wall-time samples; use monotonic elapsed time, report median and max, and OS peak resident memory (include child processes; state measurement tool/units). Python tracemalloc alone is not process memory. Capture semantic digests on every run. Report serialized export bytes separately from runtime memory.

Use the agreed small manifest plus one deterministic scale derivative targeting 20,000–50,000 attachment demands. Replicate complete disjoint scenario groups with unique IDs and unchanged local pairing/rail constraints; do not simply raise counts past fixed leaf capacity and call infeasibility a performance success. Preserve an explicit infrastructure-unknown result if the source scenario lacks a feasible witness. Add one per-instance exception and independently verify member conservation; few class rows alone do not prove every link was represented.

Run configuration reconciliation (lead #10 comment6786858330): keep D03's lower defaults as a separate cap test; use a sufficiently provisioned named scale configuration for successful processing. Arch records final runner configuration/digest and implements cancellation outside deterministic domain steps. The following concrete scale proposal is supplied for that boundary; it is not an executed benchmark or a new default:

| Name | Input / caps | Expected use |
| --- | --- | --- |
| `fb01-default` | max10,000 demand terminations,256 candidate switches,2,000,000 candidate inspections,5s safety deadline | Small fixture acceptance; deliberately exceed each cap separately and verify `limit-reached` without silent relaxation |
| `fb01-scale-1000` | 1,000 disjoint FB-01 groups:24,000 fabric demands,6,000 management dependencies,4,000 servers;2,000 local conditional witness candidates. Proposed caps50,000 demands,4,096 candidates,200,000,000 inspections,60s safety deadline | Five successful complete partial-BOM samples, preserving unresolved infrastructure. Cap/timeout outcomes are not successful throughput samples |

Prefix every context, server, requirement, assembly and witness ID with the disjoint group identity; pin input/rules/evidence and include one path exception. Reuse evidence content safely but never merge contexts or shared assembly identities across groups. Counts above are arithmetic planning values, not timings. Default cap rejection and scale processing are separate tests. Record actual operation counts; if caps are exceeded, report incomplete results and explicitly revise the run configuration before attempting a new named measurement set. Do not infer infeasibility. The 60s safety deadline is not the 10s investigation target. A worker/cooperative runner must demonstrate responsive cancellation; neither a signal passed to synchronous work nor a timeout label alone proves it. Existing outputs/history survive; persist only explicitly scoped complete independent lines and incomplete diagnostics under the architecture's publication rule, never a half-finished assignment as valid.

Proposed experiment investigation thresholds (not sponsor SLOs): small scenario generation <=2s; scale generation+machine export <=10s and peak RSS <=1GiB on the recorded development machine; small save/reopen <=2s; grouped summary first render <=2s after data arrival. Record misses and repeat once to diagnose noise; never waive accounting failures to meet timing. If machine or implementation makes targets unsuitable, lead approves a revised target with evidence. No broad topology/performance benchmark or hardware throughput claim.

## Gates and coverage ledger

Critical integrity failures (duplicate supply/resource, erased unknown, corrupt persistence, lost lock/history, nondeterminism with identical semantic inputs) fail experiment acceptance. Known allocation conflicts must be correctly diagnosed; a diagnostic test passes when the intended conflict is shown, not when an impossible case is allocated. Useful conditional estimates may retain explicit missing facts; exact/procurement/installation claims remain blocked by dependent unknowns. Manual compatibility inspection is primary; exhaustive automatic optics certification is not a gate for this experiment.

Schema, upstream admission, runtime behavior, hardware qualification and performance are separate evidence axes. If D03 actually emits wiring, use the version-pinned upstream validator and record exact command/environment/outcome. Do not invent wiring as a prerequisite to a BOM. VLAB can show software integration, not optics reach, RoCE losslessness, hardware independence or production performance.

| Original #11 criterion | This packet / remaining scope |
| --- | --- |
| Port/coverage/lane/rail/redundancy/compatibility/uplink/BOM checks | V01–V07/V12 obligations defined; FB-01 count expectations below; complete D03 design review accepted within its conditional scope; physical tuple qualification deferred |
| Golden/manual, property, metamorphic and invalid cases | AC1 executable; V01–V12 and mutations specified; FB-01 count oracle executable; full app identity/lifecycle harness pending |
| Evidence layers, topology coverage, upgrades | Layers above; V11 controlled revision; exhaustive supported-topology/NOS coverage and live upgrade regressions deferred |
| Performance/reproducibility/gates | Measurement protocol and proposed thresholds; actual application measurements pending #14 |
| Versions, facts and reproducibility | Exact checkpoint pins, independent AC1 source and runnable helper; no fresh release assertion |
| Independent acceptance/domain decisions | Lead review pending; no self-approval; domain authority only for disputed support claims |

D03 review checklist, to post in #10 by criterion after its exact handoff: coherent manifest and provenance; independent owned/shared quantities; sizing proof versus bound; all configured budgets including unused mode; reservation/parent-child/exhaustion diagnostics; deterministic inputs/outputs; retained missing infrastructure; deferred topology coverage. Record accepted/changes requested/blocked per criterion with source-line evidence. Do not accept the packet merely because its author assertions pass.

## FB-01 independent results (early manifest r1)

Input: [scenario.json at 9aa448a32deb62f57629ac0e5f3480ba95faab7d](https://github.com/afewell-hh/hh-aid/blob/9aa448a32deb62f57629ac0e5f3480ba95faab7d/docs/design/first-bom/scenario.json), SHA-256 `9200061edb0571a58a46fe04c7921898783db6601c615169792963667900d723`. Expected data: `first-bom/verification/fb01-expected.json`. Its helper reads pinned inputs with `git show`, checks the hash, enumerates occurrences/paths, and never reads `author_expected` or mutation expected fields. Ensure this input commit is fetched when reproducing in a new clone. Python 3.9+ standard library; no network during checking.

```sh
python3 -I docs/design/first-bom/verification/check_fb01.py
```

Optional `--actual /tmp/hh-aid-fb01-actual.json` compares exactly the baseline/count_A3 projection against the frozen values. This is a count checker, not a substitute for occurrence-level allocation or lifecycle tests. The source hash protects its deliberately fixture-specific mode/pairing assumptions.

Hand derivation: A has two occurrences, each with 1 chassis+8 BE NICs+1 FE DPU+2 cords; B has two occurrences, each with 1 chassis+2 FE NICs+2 cords. The separate component vector is A chassis2, B chassis2, BE NIC16, FE DPU2, B FE NIC4, cords8. Included vector is accelerators16, PSUs8, rail kits4, BMC4, disks8; four accessory requirements have unknown purchasing inclusion. These are per-line quantities, not a homogeneous physical-item KPI.

FE: four servers ×2 links =8 server modules; four independent paths per hypothetical parent module means2 switch modules, hence10 modules, not16. BE: eight rails ×two servers =16 links; one two-tail assembly per rail gives8 assemblies. Four physical servers and6 management interfaces remain single populations across attachments. All six INF-* lines keep unknown quantity, including leaves (conditional bound only), spine, uplink media, control/gateway, OOB and ancillaries.

FE configuration:32 parents×4+32 uplinks×1+2 auxiliaries=162 configured;31×4=124 selected;4 configured children on unused32; maximum paired pipeline usage8. BE:32×2+32+2=98;31×2=62 selected;unused2; maximum pipeline4. Required parent modules/assemblies are2 FE and8 BE;31 selected parents/context yield capacity lower bounds1 FE and1 BE. This is not an exact topology or a feasibility proof: placement, peers, service, host/assembly qualification and infrastructure remain unresolved. Auxiliary modes remain configured despite exclusion from allocation.

A03 mutation: components A chassis3, B chassis2, BE NIC24, FE DPU3, B FE NIC4, cords10;5 accessories unresolved. FE10 links requires10 server+3 switch modules with2 reserved parent children. BE three servers per rail needs two assemblies per rail:16 assemblies for24 active links with8 parked tails, not12 assemblies from unrestricted global pairing. Management8. Installed includes accelerators24, PSUs10, kits5, BMC5, disks8. DPU replacement adds2 adapters and2 management interfaces at base population without changing FE links or server counts.

Unused FE32 unknown:31×4+32+2=158 known configured, total unknown; pipeline15 retains known contribution4 from parent29 and unknown contribution from32. Selected124 remains known but feasibility unresolved. Restrict FE selection to one four-child parent:8 demands exceed one switch's4 candidates by4; conditional switch lower bound2, no borrowing uplinks. Catalog limit10→6 makes FE maximum8 conflict while BE4 is only within-budget, not qualified. Locked-binding and stale-inspection changes need actual state-transition tests; no assertion of implemented behavior.

## Final D03 review and remaining implementation gates

[Final criterion-by-criterion review in #10](https://github.com/afewell-hh/hh-aid/issues/10#issuecomment-6786925499) accepts `ce4b8e6b03f79b8aa4ff796e8b4460ebc67312a8` as bounded experiment design. Manifest bytes match the pinned early input hash. Reviewed coherent inputs/partial BOM, conditional sizing, method alternatives, ordered allocation/locks, stable identities/regrouping, diagnostics, limits and the original covered/deferred ledger. No new topo domain correction requested. This is not acceptance of an executable allocator, hardware or exact topology.

The acceptance probe must later remove a locked member and retain the old assignment as conflict; preserve unaffected occurrence identities under A03 while showing shared-parent replacement lineage; replay unordered inputs without changing semantic output; and distinguish cap exhaustion from hard resource contradiction. Architecture owns responsive cancellation, incomplete-result publication, export roots/history closure, atomic updates and safe-integer import. Its corrected document is reviewed by lead separately; D04 confirms the interface without pre-approving unseen implementation. Preserve older outputs and reviews through export/import and derive staleness as current assessment, not mutations to hashed history.

## Current handoff state

Completed now: bounded strategy, independent AC1/FB-01 count expectations, strict projection comparison, final D03 design review, export-only adapter/ownership confirmation and default-versus-scale reconciliation. Pending: lead review of this correction; architecture runner/export gates; future #14 application occurrence/identity/lifecycle harness and measurements. No current application behavior, upstream execution, hardware, user study or application timing/memory run is claimed. See #11 for actual commands/results and exact draft commit. No new specialist session or application implementation is requested by this packet.
