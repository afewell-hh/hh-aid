# D03: first-BOM scenario and allocation/sizing decision packet

Author: t6 / topo. Date: 2026-11-10. Assignment: [lead #10](https://github.com/afewell-hh/hh-aid/issues/10#issuecomment-6786444107). Status: proposal, independent review pending by **t8 / parts** through #11; lead consolidates. No production implementation or solver/library selection.

## Decision and evidence

Recommend a **staged constructive method with explicit integrity checks and conditional bounds**, without optimization search, for FB-01. Expand known component requirements first; evaluate configuration and selection independently; produce a conditional placement witness only when its stated inputs permit it. Missing topology or qualification keeps infrastructure quantities unresolved while useful server/component lines remain available. This is the smallest experiment that tests the accepted contracts without claiming an exact supported topology from port totals.

The shared input is [scenario.json](first-bom/scenario.json), `FB-01/r1`, manifest version 0.1. It is fixture data, not a production schema. `author_expected` is an author reference, never the source of truth for generation or parts' independent oracle. Use [the brief and checkpoint at 4c71aa5](https://github.com/afewell-hh/hh-aid/blob/4c71aa5/docs/first-bom-experiment.md); accepted pins are recorded in the manifest. In particular, [allocation contract d97a2ef](https://github.com/afewell-hh/hh-aid/blob/d97a2efa77a5b4e98a0c9198a7af9cd05ae008ff/docs/design/port-allocation-contract.md) closes AC1. Do not reopen its screens or vocabulary.

Historical source profile: Fabric v0.144.1 at `4bde50829fd7cfebac69332982abd1dee504a8a3`, [celestica-ds5000 source](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/p_bcm_celestica_ds5000.go). Reuse [accepted PA evidence a60134f](https://github.com/afewell-hh/hh-aid/blob/a60134f1b937c98b631963ea4c59d7703098b210/docs/research/port-allocation-patterns.md) for naming and pipeline arithmetic, rather than repeating research. No latest-release claim or new upstream execution. Pin/profile content and imported local modifications need distinct digests at ingestion; a version name alone cannot identify a modified profile.

## One coherent scenario

FB-01 is a new, small conditional fixture, explicitly adapted from accepted SCX/SU and PA contracts. It is not a merger of their example inventories or the UX 100+12 population. Every change from the source examples is listed in `derivation`.

| Population | Per-server separate purchases (generic placeholders) | Included in chassis by fixture assumption | Attachments |
| --- | --- | --- | --- |
| A01,A02 accelerator class | 1 chassis bundle, 8 backend NICs, 1 dual-port frontend DPU, 2 cords | 8 accelerators, 2 PSUs, rail kit, BMC | Two 200G frontend; eight 400G backend with explicit rail r0–r7; BMC +DPU management |
| B01,B02 storage class | 1 chassis bundle, 2 frontend NICs, 2 cords | 4 disks, 2 PSUs, rail kit, BMC | Two 200G frontend; BMC management |

Each server also has one accessory requirement with unknown bundle inclusion: four requirements, unknown additional purchases. The example omits A's in-band NIC and optional separate storage attachments and changes B's generic NIC rate from SCX 100G to assumed 200G. This is an intentional new fixture, not verified equipment information. One physical server identity persists across networks. Site/OOB dependencies remain visible despite omitted in-band configuration.

NET-FE combines frontend/storage service by explicit scenario choice. NET-BE is single-plane backend with one first-hop rail domain RD-1, where the same rail from A01/A02 may share a leaf. Pairing different rails is forbidden in this fixture; rail identity comes from the manifest relation, not port numbering. Each network has its own leaf context and proposed Fabric in INST-1. L3-only intent is compatible with the historical DS5000 role boundary, but full service resources/validation remain unresolved. No ESLAG, independent-leaf redundancy or proven rail failure isolation is requested. Group purpose never configures a protocol. These restrictions describe experiment coverage, not eventual product limits.

### Physical construction assumptions

NET-FE has eight logical 200G paths. A hypothetical breakout optical switch module supplies four independent 200G paths at one parent cage; each remote server has its own module. Thus **8 server modules +2 switch modules**, not 16 modules. Map A01/p1,p2,A02/p1,p2 to parent1 children1–4 and B01/p1,p2,B02/p1,p2 to parent2 children1–4. Exact PMD, connector, fiber, reach and channel map are unknown. The parent module is counted once despite four links. External fiber is excluded from purchase scope but not from interface dependencies.

NET-BE has sixteen 400G links. For each rail r, one hypothetical integrated two-tail DAC has parent child1 → A01/nic[r]/p1 and child2 → A02/nic[r]/p1. This is eight assemblies, **zero detachable optics**, eight parent cages and sixteen server cages. A common parent/assembly failure affects both links. This shape is conditional, not an approved DS5000 cable. A partial pair still buys one whole assembly and parks its unused tail; it does not create a link or a remote occupied cage.

The base author tally is 34 separate server-component units +10 optical modules +8 assemblies = **52 known generic each**, plus four unresolved accessory inclusions and the missing infrastructure ledger. This mixed component-unit checksum is not a monetary total, purchase-ready package or whole-project BOM. Included inventory expands without adding purchases. Final parts/SKUs, counts justified by real physical construction, stock and pack rounding remain separate.

## Sizing trace and allocation boundary

Both contexts use the pinned DS5000 profile. Labels1–32 have server mode: FE 4x200G, BE 2x400G. Labels33–64 are 1x800G reserved uplinks. Label32 is intentionally unused but **keeps its mode**. Auxiliary E1/65,66 stay 25G and are excluded from allocation; M1 management is excluded from configured data-port budgets. Explicit child names `/1…/4` or `/1…/2` follow source evidence. Profile labels are not proof of chassis layout or electrical lane mapping.

| Account per occurrence | LC-FE | LC-BE |
| --- | --- | --- |
| Configured ports (including auxiliary) | 32×4 +32 +2 =162 | 32×2 +32 +2 =98 |
| Configured pipeline load | First16 pipelines:8 each; last16:2 each | First16:4 each; last16:2 each |
| Selected server members | 31×4=124 | 31×2=62 |
| Unused but configured server members | 4 | 2 |
| Reserved uplink members | 32 | 32 |
| Base demands / occupied server parents | 8 links /2 parents | 16 links /8 same-rail parents |
| Conditional leaf lower bound | ceil(2 optical parents /31)=1 | ceil(8 rail-pair parents /31)=1 |

The source limits are 320 total and ten per pipeline. Whole-switch configuration passes these **source-derived arithmetic** checks, not upstream admission. Small selected groups cannot waive those checks. Unknown mode at unused parent32 makes pipeline15 and the total unresolved while preserving known contributions; it is never a zero contribution.

The arithmetic yields **at least two leaf occurrences under these distinct-context and construction assumptions**. No real switch quantity is committed: manifest `instance_quantity` and INF-LEAF quantity stay null. A witness candidate FE-01 and BE-01 can accommodate the fixture demands locally if placement/assembly/topology assumptions hold. That proves only local conditional packing, not two switches as an exact supported design. Candidate IDs are derived witnesses; do not turn them into purchased occurrences automatically.

Reserved uplink capacity is not an actual uplink connection. Neither 32×800G nor a bandwidth ratio determines spine count, opposite-end ports, redundancy or nonblocking behavior. INF-SPINE, INF-UPLINK-MEDIA, INF-CONTROL-GATEWAY, INF-OOB and INF-ANCILLARY remain explicit unknown lines. INF-OOB includes six known server management interfaces, not a complete management-switch/cable count; switch/control infrastructure adds interfaces. No zero-quantity placeholder may erase these categories.

For population A=nA, B=nB with unchanged construction policy: frontend demand =2(nA+nB), required optical parents =ceil(frontend demand/4). Backend demand =8nA, required parent assemblies =8 ceil(nA/2); pairing is per rail, with one parked tail per rail when nA is odd. Conditional context bounds are ceil(required parents/31). Any stronger placement/failure policy can increase or invalidate these bounds. Group capacity edits use the resulting **parent and child footprints**, not simply ceil(total links/total ports). A context with no applicable demand needs no occurrence from this rule; existing locked inventory remains separate.

## Method comparison and recommendation

| Candidate | Cost/complexity and explainability | Extension/dependencies | Decision |
| --- | --- | --- | --- |
| Constructive stable packing | Expansion O(D+C), sorting O(D log D+C log C); naive candidate checking O(D×C). Each decision can cite demand, group, reservation and constraint. No general optimum or infeasibility proof | Small core; no solver-specific dependency. Future interacting rack/rail policies may require backtracking | Sufficient to build local witnesses for this bounded fixture after checks |
| General constraint programming/MIP | Expresses coupled placement/capacity and optional optimization; combinatorial search can be exponential. Diagnostics require explicit conflict mapping; timeout is not infeasible | Third-party runtime, license/distribution and maintenance review depends on a chosen package; none chosen or evaluated here | Defer concrete library/benchmark selection until a scenario needs it |
| Hybrid prechecks + constructive witness + bounded search fallback | Cheap hard checks first, constructive explainable common path; search only on residual ambiguity | More moving parts and two diagnostic paths; solver licensing still unresolved if added | Use prechecks + constructive stages now; do not implement search fallback in this experiment |

Reuse profile data/rules through a pinned adapter with provenance, not a broad dependency on a cluster/controller runtime. Profile extraction/schema validation integration belongs with arch. Existing hhfab validation is useful if later emitting real wiring, but not a substitute for planning identity, BOM ownership or physical qualification. Do not fabricate wiring to gate an earlier useful BOM. New solver dependency/license/size claims require evidence before adoption; this packet does not make them.

## Deterministic interface and stages

Inputs: manifest revision, server-class/customization and profile content revisions, network/rail/plane intent, full configured modes, group selectors/order/overlap policy, occurrence placement or unresolved context, locks/reservations, existing assignments, physical construction maps, inclusion/coverage and relevant evidence snapshot. Unknown, explicitly absent and excluded are distinct states; JSON null in this fixture means unresolved, with reason in its record. The compact manifest is not a full project serialization format; arch defines transport/persistence around this domain interface.

Proposed ordered stages:

1. Validate identity and references; expand per-unit installed/separate/inclusion-unknown requirements without duplicating population. Derive stable IDs from `(scenario, occurrence, component slot)`; edits retain slot IDs or explicit replacement lineage.
2. Expand the **entire configured switch** independently of groups; compute shared scopes from profile mappings, including unselected/unused ports. Return known subtotals plus unresolved/conflict diagnostics before any feasible-allocation claim.
3. Expand selectors under explicit numeric cage/child ordering. Canonical aliases share one occurrence ledger. Apply group exclusions and reservation ownership; never subtract reservation and its permitted consumer twice. Preserve source selectors and expanded revisions.
4. Build typed demand/construction units: optical parent groups of four ordered FE demands; same-rail BE pairs. Record all occupied and parked resources. Partition by context, rail/failure constraints and exact commitments before deriving bounds. Unknown construction remains a conditional assumption, not an invented compatibility pass.
5. Calculate traceable lower bounds. If exact occurrence inventory is supplied, consume valid locks first then stable remaining demand order, occurrence ID, cage and child. Otherwise propose only conditional witness occurrences. On exhaustion report unmet IDs/counts; never borrow reserved uplinks, change mode, merge contexts or add bought switches silently.
6. Produce requirement/acquisition references and missing-infrastructure lines, grouped review signatures and diagnostics; retain previous revision untouched. Changed source/member/assembly parent invalidates all dependent rows across classes, with explicit split/merge lineage and field/member-scoped inspection.

Output contract (fields required for each relevant record):

| Record | Required meaning |
| --- | --- |
| Result envelope | input/evidence/rule digest, revision, coverage, deterministic semantic payload; timestamps/run IDs excluded from semantic equality |
| Requirement | stable ID, occurrence/component/connection provenance, installed quantity, coverage/inclusion state, unit and assumptions |
| Acquisition line | unique purchase identity, quantity or null, contributing requirement IDs, bundled/shared coverage, readiness and scope; presentation parent never adds purchases |
| Sizing result | context ID, lower bound or null, calculation operands, assumptions, conditional witness IDs, unresolved requirements; no global feasible flag from local packing |
| Resource accounts | configured load/limit per switch/shared scope, selected/free members, assigned candidate links and actual/parked footprints as separate records |
| Diagnostic | stable code, affected IDs, observed/required values, evidence/rule IDs, cause, possible explicit remedies; scope of invalidated outputs |
| Connection review | both-end revisions/properties, end/group map, member IDs, shared assembly IDs, unknowns, manual coverage and stale dependencies |
| Revision diff | created/removed/changed requirement and assignment IDs, quantity/assumption differences, retained locks and conflicts; unaffected identities preserved |

For this fixture, construction IDs are `FE-OPT/<ordered-parent-demand-key>` and `BE-SPLIT/<rail>/<paired-occurrence-IDs>`, with an explicit replacement map if regrouping changes those keys. Do not rely solely on ordinal row numbers or rendered labels. Adding A03 may regroup FE modules; expose affected module IDs/review staleness, not a silent total-only edit. No claim that a new identity is the same ordered physical part: existing commitments constrain regrouping and may make the new candidate conflicting.

Proposed bounded-run policy for #14: max10,000 demand terminations and max256 candidate switches; max2,000,000 candidate inspections and a 5-second cancellable safety guard on the reference machine. These are unmeasured experiment proposals for parts/arch review, not SLAs. Stable operation limits give reproducible `limit-reached`; wall-clock cancellation gives `interrupted`, never “infeasible.” Preserve exact independent component lines and diagnostic/incomplete output; do not publish unfinished assignments as a valid plan. Hard contradictions in explicit finite inputs can be `conflict`; unknowns, heuristic failure and exhausted search budget cannot prove global infeasibility. No silent constraint relaxation or automatic second strategy.

## Negative/edit cases and executable experiment plan

| Manifest case | Expected behavior for future implementation |
| --- | --- |
| FB-DPU | Replace each A dual-port adapter with two single-port adapters: +2 total adapters, +2 management interfaces, zero new servers/frontend links. Known generic checksum54; service/media still conditional |
| FB-COUNT | Add A03: 5 servers; FE10 links, 10 server +3 switch modules; BE24 links,16 assemblies,8 parked tails; 8 management interfaces; server components46, total known generic75. Unknown accessory requirements5; old revision retained |
| FB-AC1 | Synthetic two four-child parents share budget6. Configured8>6 conflicts despite selected2 and assigned0. Reservation outside selection does not repair it |
| FB-UNKNOWN-MODE | Remove FE unused-parent32 mode: selected124 remains known; configured total/pipeline15 unresolved; block valid-witness claim, preserve component BOM and missing lines |
| FB-EXHAUST | Restrict FE group to parent1: only four members; conditional leaf bound2. With exact one occurrence fixed, report four unmet demands; do not steal uplinks |
| FB-LOCK | Remove group membership underlying explicit bound demand: retain old assignment as conflict; no silent relocation or deleted commitment |
| FB-EVIDENCE | Controlled local evidence revision lowers shared limit10→6: FE load8 conflicts. Mark source synthetic/local, not a new release; old evidence/results immutable |
| Invalid context/rail | Bind BE demand to NET-FE or pair different rails: reject eligibility even if counts fit. Keep demands/intent visible |
| Parent/alias collision | Whole-parent claim plus child claim conflicts; alias repetition does not add capacity; distinct valid siblings can coexist subject to assembly footprint |
| Unavailable spine supply | If user fixes uplink demand8 and eligible spine free ports4, report ≥4 unmet; do not label selected local leaves a complete topology. Actual spine sizing remains deferred |

After lead synthesis, #14 can implement domain stages plus persistence/UI adapters with commands proposed as `validate-input`, `generate`, `diff` and `export/reimport`; arch chooses actual entrypoints/format. Parts independently supplies expected results and failure checks from the manifest, not by copying generator formulas. Required demonstration: save/reopen identity; base partial BOM; DPU/count changes; AC1/unknown modes; identical semantic replay; immutable historical output after evidence refresh; shared assembly ownership across expanded views. If wiring is actually emitted, validate that output with the pinned upstream tool and disclose its scope; no wiring required here.

Performance proposal: record wall time, peak memory and candidate inspections for base FB-01 and synthetic demand expansions up to1,000 and10,000, with machine/runtime versions and two runs to expose cache effects. Scaling cases do not change supported topology coverage or manufacture qualified hardware. Compare bounded-work behavior and explainability before any optimization library choice; no benchmark executed in this planning pass.

## Covered/deferred ledger and handoff

| Original #10 criterion | This packet | Deferred / next evidence |
| --- | --- | --- |
| I/O, ordered constraints, invariants, rails sharing leaves | Shared manifest and staged interface; same-rail pairs, multiple rails allowed on one leaf explicitly conditional | Full domains spanning many leaves, arbitrary topologies and growth/failure constraints need future supported-family cases |
| Method comparison | Three methods compared; smallest sufficient staged constructive recommendation | Concrete solver library/license/benchmark review only if needed; upstream reuse implementation by arch/spike |
| Unknown/infeasible/limits/no relaxation | Diagnostic scope, partial BOM, finite work/interruption, preserved locks | Independent oracle/threshold review by parts; executable evidence in #14 |
| Packing, rack underfill, two planes, contention, spine shortage | Conditional parent packing, unused capacity, AC1 contention and shortage counterexample | Per-rack underfill and two-plane isolation remain covered by linked R04 research but unimplemented here; full spine allocation deferred |
| Versioned facts/hypotheses/reproducibility | Exact historical pins in manifest; conditional construction assumptions explicit; author arithmetic below | Latest-supported install proof and physical qualification not supplied |
| Independent review / sponsor decisions | Parts named; lead owns synthesis | Pending review and concrete first-slice approval; do not close #10 |

No blocker to preparing this packet: missing infrastructure/qualification is intentional partial-result input. Decisions for lead: accept FB-01 as experiment fixture and constructive approach; parts reviews expected results and proposed limits; arch defines minimal saved-project/export format and catalog adapter. Interface changes must update the shared revision and notify #11/#12. No production implementation, new hardware survey, upstream execution, participant test or self-approval occurred.

### Reproduce author arithmetic (not the independent oracle)

From repository root, run this Python3 stdlib block. It checks the small manifest's internal arithmetic; it does not establish application behavior or upstream validity.

```python
import json, math
from pathlib import Path
m = json.loads(Path('docs/design/first-bom/scenario.json').read_text())
a,b = m['classes']; nA,nB = len(a['occurrences']),len(b['occurrences'])
def tally(na,nb):
    server = na*sum(a['separate_per_server'].values()) + nb*sum(b['separate_per_server'].values())
    fe = 2*(na+nb); modules = fe+math.ceil(fe/4)
    assemblies = 8*math.ceil(na/2)
    return server,fe,8*na,modules,assemblies,server+modules+assemblies
assert tally(nA,nB) == (34,8,16,10,8,52)
assert tally(3,2) == (46,10,24,13,16,75)
assert 8*(2*math.ceil(3/2)-3)==8  # parked tails
assert nA*2+nB == 6 and 3*2+nB == 8
for c in m['leaf_contexts']:
    children = int(c['server_mode'].split('x')[0])
    counts = {p:children if p<=32 else 1 for p in range(1,65)}
    pipeline = {}
    for p,n in counts.items():
        key=2*((p-1)//4)+(1 if (p-1)%4 in (0,3) else 2)
        pipeline[key]=pipeline.get(key,0)+n
    expected=m['author_expected']['FE' if c['id']=='LC-FE' else 'BE']
    assert sum(counts.values())+2 == expected['configured_ports']
    assert max(pipeline.values()) == expected['max_pipeline_usage'] <= 10
    assert 31*children == expected['selected_server_members']
assert sum([4,4])>6 and sum([1,1])==2
assert 124+32 != 162  # selected members omit unused configuration and auxiliary ports
assert all(x['quantity'] is None for x in m['missing_infrastructure'])
assert len({i for c in m['classes'] for i in c['occurrences']}) == 4
print('FB-01 author arithmetic passed; independent review pending')
```
