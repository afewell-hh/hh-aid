# Port allocation patterns: bounded planning fixtures

Author: t6 / topo. Baseline: main `2ee0e7d`. Prepared 2026-11-08 Pacific / 2026-11-09 UTC.
Assignment: [lead, #5](https://github.com/afewell-hh/hh-aid/issues/5#issuecomment-6730315057).
Status: proposed fixtures for independent review, not an allocator, equipment qualification or deployment approval.
Independent reviewer: t10 / model for identity/selection; t8 / parts for physical evidence as dispatched by lead. Lead retains acceptance.

## 1. Evidence and boundaries

**Given** means sponsor/example input; **source** means observed pinned code or primary documentation; **derived** means arithmetic; **proposed** means an hh-aid contract awaiting review. Unknowns remain unknown, not zero capacity or an implicit permission.

| Evidence | Pin and permitted use |
| --- | --- |
| Sponsor | [main 2ee0e7d product context](https://github.com/afewell-hh/hh-aid/blob/2ee0e7d/docs/product-context.md): planning selections, arbitrary placement, reserved/unused ports, manual grouped review. Even uplinks are a requested example, not a hardware restriction. |
| R04 | [49e6079 topology scenarios](https://github.com/afewell-hh/hh-aid/blob/49e6079a077d1d819d12485de3896a93e8371f74/docs/research/topology-scenarios.md), accepted by [lead](https://github.com/afewell-hh/hh-aid/issues/5#issuecomment-6713220753): rail/plane/instance identity and raw balance versus performance. |
| Corrected R02b | [31779de contract](https://github.com/afewell-hh/hh-aid/blob/31779ded356b4db0c6e582d4cb209dddbc005bf2/docs/research/fabric-profile-contract.md), [topo correction review](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6729413145): template versus placement; logical offsets versus physical lanes; exact profile content identity. |
| R05 | [8a8fcca hardware/BOM](https://github.com/afewell-hh/hh-aid/blob/8a8fcca/docs/research/hardware-and-bom.md), especially §§3–4 and lifecycle limits: configured pipeline budgets and assembly identity. |
| Fabric source | v0.144.1, `4bde50829fd7cfebac69332982abd1dee504a8a3`; [DS5000 profile][profile], [port expansion][expand], [budget validation][budget], [RoCE update guard][update]. Source read; no upstream execution in this assignment. |
| Hardware source | [Celestica DS5000 product page][vendor], accessed 2026-11-09 UTC (2026-11-08 Pacific). It identifies a 2U device with 64 800G OSFP ports. Mutable page, no revision date established. This only corroborates chassis scale/form factor, not assembly, firmware, electrical lane or Hedgehog qualification. |
| Model coordination | [early table](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6730484917) and [overlap proposal](https://github.com/afewell-hh/hh-aid/issues/5#issuecomment-6730485103). These are draft contracts, not independent approval. |

This reuses historical 26.05 evidence, not a new latest-release observation. No broad topology survey, CLI/admission/VLAB/hardware test, maintainer outreach or production solver/schema is included. External fiber/structured cabling is outside the BOM scope; its interface requirements still matter.

## 2. Identity, selection and capacity vocabulary

A **port allocation group** is an ordered planning selection. It is neither LACP nor an upstream SwitchGroup, PortGroup or configuration command. Its purpose can be absent: two groups may describe identical physical capability with no protocol distinction. A purpose such as server-facing/uplink is intent, not a property of an even number.

Proposed identity chain: reusable leaf configuration revision → group definition ID/revision → project binding in a leaf deployment context → per-switch-occurrence expansion. A reusable template alone need not fix an upstream Fabric/domain. Each placed switch still has its own Fabric/domain assignment. A demand can name context + leaf class + group while instance placement is unresolved.

Persist selector **source**, numbering namespace, explicit order, profile content hash/revision, configured modes and expanded members separately. For fixtures below the expanded member key is `(switch occurrence, cage key, mode revision, child ordinal)`. Child ordinals denote logical terminations, never physical electrical lanes. A mode revision prevents an old child label from silently becoming a different termination after regeneration.

Three distinct quantities must be visible:

1. **Configured logical ports**: all configured members, including disconnected, reserved and deliberately unused ones. These consume source profile/pipeline budgets.
2. **Eligible free terminations**: selected canonical members after existing assignments, reservations, exclusions and capability constraints; counted once across alias views. Rate sum is nominal per-direction line rate, not connected throughput.
3. **Actually assigned links**: each needs both endpoints, compatible physical construction, topology/service membership and assembly mapping. Group capacity alone does not establish this count or fabric feasibility.

Proposed overlap policy, aligned with model: **alias** views share one ledger; **exclusive** pools cannot intersect consumable termination footprints; **unspecified** overlap stays unresolved before allocation. Distinct children of one configured parent may coexist. Sharing a pipeline invokes an aggregate constraint, not blanket mutual exclusion. A whole-cage claim excludes all children; a child claim excludes whole-cage consumption but not compatible siblings. Reserving a whole cage reserves every child without deleting its configured pipeline usage. User changes to locks/reservations must be explicit, never an allocator fallback.

## 3. Small preview data (synthetic, independent snapshots)

These six fixtures use a **synthetic eight-cage template T8/r1**. `C1`–`C8` are keys; the supplied display/printed-label convention is 1-based decimal 1–8, not zero-based array indices. This is not a DS5000 miniature or a hardware catalog entry. Mode `1x800G` exposes `Ci.1`; `4x200G` exposes `Ci.1`…`Ci.4`. Unspecified cages use 1x800G. All members start free except explicit exclusions. Real support, media and shared-resource limits are unknown; numerical capacities are conditional preview arithmetic.

Notation `{C1,C2}.{1,2}` means the Cartesian expansion in numeric cage order, then child order. Ranges are inclusive. Each row is a separate snapshot, **not additive pools in one design**. The exact source selector and canonical ordered preview both remain inspectable.

| Fixture / group | Physical selector / mode | Ordered logical preview | Free capacity per occurrence | Constraint/purpose |
| --- | --- | --- | --- | --- |
| PA-HALF / H-server, H-up | Labels 1–4 / 5–8; all 1x800G | C1.1,C2.1,C3.1,C4.1 / C5.1,C6.1,C7.1,C8.1 | 4×800G each; 3.2 Tb/s each | Exclusive halves; equal raw rate only, no nonblocking claim |
| PA-STRIDE / O-server, E-up | Odd 1–7 step 2 / even 2–8 step 2; all 1x800G | C1.1,C3.1,C5.1,C7.1 / C2.1,C4.1,C6.1,C8.1 | 4×800G each | Parity is on display labels, never NOS offsets or child indices; same-capability pools |
| PA-LIST / L-free | Explicit source list [6,1,4]; numeric-order policy; all 1x800G | C1.1,C4.1,C6.1 | 3×800G = 2.4 Tb/s | No protocol purpose; preserve source list even though preview order differs |
| PA-SINGLE / S-one | Label 3, child 1 at 1x800G | C3.1 | 1×800G **per eligible switch occurrence** | Not an exact switch-instance binding |
| PA-CHILD / B-sub | Physical label 7; configured 4x200G; choose child ordinals [1,3] | C7.1,C7.3 | 2×200G = 0.4 Tb/s | Four children configured, two selected; C7.2/C7.4 remain free outside this group. Parent consumption forbidden |
| PA-RESERVE / R-free | Labels 1–8; C7 at 4x200G, others 1x800G; reserve C7.2 for future named demand; C8 intentionally unused | C1.1,C2.1,C3.1,C4.1,C5.1,C6.1,C7.1,C7.3,C7.4 | 9 free members, 6×800G + 3×200G = 5.4 Tb/s | 11 configured; one reserved child and one excluded parent member. Do not count the mixed-rate set as nine equal-speed links |

PA-CHILD is a preview of logical selection only. A selected assembly may also occupy unselected sibling resources or impose fixed end-group mappings; then reduce availability using that assembly's verified footprint. No general right to connect independent cables to arbitrary logical children is inferred.

## 4. DS-EVEN: pinned naming and sponsor pattern

Source [profile][profile] defines labels `1`–`64` → `E1/1`–`E1/64`, with BaseNOSName `Ethernet(8×(label−1))`. This is **profile label mapping**, not a newly inspected chassis photograph or wiring drawing. The primary vendor page corroborates 64 OSFP cages; physical label/position correspondence on the chosen unit still needs inspection. Additional E1/65 and E1/66 are SFP28 speed ports and excluded from the OSFP selector; M1 is management. Never use `even(all profile keys)` without that namespace/scope.

At this pin, OSFP mode 4x200G has offsets `[0,2,4,6]`. [GetAvailableAPIPorts](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switchprofile_types.go#L1014-L1063) expands it to child names `/1`…`/4`; `GetAPI2NOSPortsFor` adds offsets to the base. Its base-name alias must not create extra capacity. Use explicit child names for these previews, including `/1` in 1x800G mode. Neither offset count nor stride establishes electrical lane count, pinout, connector grouping or permitted transceiver construction.

| Profile label | Parent key / pipeline | 4x200G logical names → NOS names | 1x800G logical name → NOS name |
| --- | --- | --- | --- |
| 1 | E1/1 / 1 | E1/1/1,/2,/3,/4 → Ethernet0,2,4,6 | E1/1/1 → Ethernet0 |
| 2 | E1/2 / 2 | E1/2/1,/2,/3,/4 → Ethernet8,10,12,14 | E1/2/1 → Ethernet8 |
| 3 | E1/3 / 2 | E1/3/1,/2,/3,/4 → Ethernet16,18,20,22 | E1/3/1 → Ethernet16 |
| 4 | E1/4 / 1 | E1/4/1,/2,/3,/4 → Ethernet24,26,28,30 | E1/4/1 → Ethernet24 |

Abbreviated `/2` etc. inherit the row's parent key. This distinction prevents displaying E1/2 as though it were child 2 of E1/1.

The sponsor did not unambiguously specify whether **uplink** cages also use 4x200G. Preserve both explicit alternatives rather than invent an answer:

| Snapshot | Full OSFP mode assignment | Expanded server / uplink groups | Nominal free rate sum (no reservations) | Configured budget result (derived from source) |
| --- | --- | --- | --- | --- |
| DS-EVEN-A | Every label 1–64 at 4x200G | Odd labels: 32×4 =128 children / even labels: 32×4 =128 children | 25.6 / 25.6 Tb/s | 256 OSFP +2 auxiliary =258 ≤320; every pipeline 4+4=8 ≤10 |
| DS-EVEN-B | Odd labels 4x200G; even labels 1x800G | Odd labels:128 children / even labels:32 children | 25.6 / 25.6 Tb/s | 128+32+2=162 ≤320; every pipeline 4+1=5 ≤10 |
| DS-HALF | Labels 1–32 at 4x200G; 33–64 at 1x800G | First half:128 children / second half:32 children | 25.6 / 25.6 Tb/s | 162 ≤320; pipelines 1–16:8 each; 17–32:2 each |

Ordered expansion for DS-EVEN-A server is `(E1/p/c for p=1,3,…,63; c=1,2,3,4)` and uplink uses `p=2,4,…,64`. DS-EVEN-B uplink uses `c=1` only. The reproduction block enumerates these sets, not just their counts. These groups are exclusive within each snapshot; snapshots are alternatives, not simultaneous allocations. Reserving all of odd cage 63 removes four server choices but leaves its four configured pipeline ports. Excluding even cage 64 similarly removes four choices in A or one in B. No reason for the sponsor's parity choice is inferred.

Pipeline membership follows the profile: cages 1/4 share pipeline 1, 2/3 share 2, continuing in four-cage blocks. Every pipeline allows ten configured logical ports; the switch allows 320. Source validation counts unused configured ports too. Two source-selectable modes can still fail together: E1/1 at 8x100G and E1/4 at 4x200G use 12>10 in pipeline 1, despite only 76 total configured ports (others default, auxiliary included). All 64 at 8x100G would use 514>320 and 16>10 per pipeline. Passing these budget calculations proves neither admission nor performance/physical support.

DS5000's pinned profile lacks ESLAG and L2VNI support. Do not reuse it for a redundant ESLAG or L2 service merely because port counts fit. Uplink placement still needs same-Fabric/domain-compatible spines, peer capacity and the intended rail/plane/failure policy. Equal per-direction sums are raw balance, not nonblocking proof. A group selection cannot override any of these rules.

## 5. Demand, exact binding and regeneration examples

Synthetic example: server class `SC-compute/r1`, occurrence `srv-001`, NIC `nic-a`, port `p1`, explicit rail intent `rail-a`, destination `network-backend / leaf-context-A / T8/r1 / S-one/r1`. Candidate switches in that context are `leaf-01` and `leaf-02`, both with PA-SINGLE. The unresolved demand has **two candidate physical terminations**, one on each switch, not two ports on either switch and not an assigned link. Profile/mode/capability unknowns stay visible.

An exact binding is `srv-001/nic-a/p1 → leaf-02/C3.1 @ mode-r1`. It consumes that one occurrence's resource. `leaf-01/C3.1` remains free; a second demand cannot consume `leaf-02/C3.1`. A singleton applied across a class cannot identify the intended leaf by itself. Another server class `SC-storage/r1`, occurrence `storage-001`, can use the same-capability L-free selection without that group acquiring a storage protocol or VPC meaning.

Proposed deterministic replay boundary: pin input revision, profile content, mode/group revisions, reservations/locks, ordered demand IDs, ordered eligible switch occurrence IDs, numeric cage ordinal and numeric child ordinal, plus allocation-rule revision. For this fixture use demand order `[srv-001/p1,srv-002/p1]`, switch order `[leaf-01,leaf-02]`, then numeric member order; the **illustrative** free-choice result is leaf-01/C3.1 then leaf-02/C3.1. An explicit first binding to leaf-02 instead consumes it before remaining choices; no allocator algorithm is selected by this example. Input map/hash iteration or string sorting (`10` before `2`) is not a deterministic numeric order contract. Replaying the same ordered snapshot must preserve the same result; changing order is a traceable new revision.

If S-one/r2 removes label 3, or C3 changes to 4x200G, preserve the old exact assignment and its provenance as **conflicting/stale**, not silently reinterpret `/1` at a new speed. Show affected demands, assemblies, connection-class rows and quantities; engineer choices produce a new revision. Ordered/approved hardware stays locked unless explicitly changed. The [RoCE update guard][update] rejects changing PortBreakouts when old **or** new RoCE is enabled; static planning revisions do not authorize a live change. Existing R05 lifecycle/CMIS caveats remain applicable.

## 6. Bounded negative cases and expected explanations

These are manually specified expectations, not executed upstream negative fixtures. Owners identify who resolves the input/rule, not an extra approval workflow for every edit.

| ID | Minimal counterexample | Expected result / owner |
| --- | --- | --- |
| PN01 exhaustion | PA-SINGLE, leaf-01 only, two distinct demands | At most one assignment; second demand unmet. Explain occurrence/member, not automatic new switch purchase. topo/model |
| PN02 exclusive overlap | H-server and L-free declared exclusive; both contain C1.1 and C4.1 | Conflict showing intersection. If deliberately aliases instead, union is five members, not 4+3=7; consuming C1.1 appears used in both views. Unspecified relation unresolved. model |
| PN03 parent/child | Whole C7 claimed plus PA-CHILD C7.1/C7.3 | Reject double use. Different child names do not make whole-parent capacity additional. Two distinct children alone may coexist subject to mode/assembly constraints. topo/parts |
| PN04 mode change | Bound C7.3 at 4x200G → parent 1x800G | Old member absent; retain conflict. Even C7.1 surviving textually changes rate/resource signature and needs revalidation, not silent reuse. model/ops |
| PN05 reservation | Demand requests reserved C7.2 or intentionally unused C8.1 in PA-RESERVE | Explain excluded resource/reason. Explicit engineer edit may release it; solver cannot steal it. Configured budget remains 11. model |
| PN06 shared pipeline | DS E1/1=8x100G + E1/4=4x200G; others 1x800G | Source-derived pipeline 1 demand 12>10 while total 76≤320. Count configured ports even if only two cables connected. topo/parts |
| PN07 missing shared-bank rule | Manual profile declares C1/C2 share bank B but does not give simultaneous-mode constraints | Available capacity is conditional/unresolved, not additive and not “unlimited.” Obtain rule or keep provisional. No invented DS5000 bank behavior. parts |
| PN08 unstable ordering | PA-LIST source [6,1,4], shuffled retrieval; same pinned numeric-order policy | Preview stays [1,4,6]. Changing explicit ordering policy creates a new revision and impact preview; preserve exact locks. model |
| PN09 namespace/unknown | Treat zero-based index 2 as label 2, or expand unknown mode into four children | Reject ambiguous namespace/leave expansion unresolved. Do not silently select label 3 or produce zero capacity. model |
| PN10 topology mismatch | Uplink group has capacity but chosen spine is outside leaf's Fabric/domain eligibility; or demand's explicit rail/plane targets wrong leaf context | No valid link assignment. Group purpose/parity cannot erase topology or failure intent; retained as conflicting intent. topo |
| PN11 assembly footprint | PA-CHILD selects C7.1/C7.3 but proposed assembly drawing maps only children {1,2} | Incompatible mapping or unknown until drawing supplied; no inference from equal aggregate speeds. Reserve all physical resources actually occupied, including unused branches when applicable. parts |
| PN12 misleading grouped review | Two connections share a display label but one has a different assembly revision/length/end map, or one has unknown PMD | Split signatures or show explicit unreviewed exception; never inherit qualification/review merely from the label. model/parts/ux |

## 7. Compact connection-class preview data

This is **synthetic presentation data**, not purchasable tuples. Physical values below are supplied illustrative inputs, not claims that a particular module/NIC supports them. Unknown PMD/reach, electrical mapping and qualification are deliberately explicit. Two server classes (SC-compute/r1 and SC-storage/r1) and groups H-server, L-free and a separate whole-C7 breakout group X-all/r1 are represented. Rows are independent small examples, not the DS-EVEN population or a combined inventory.

| Row / represented links | Side A source and key properties | Side B source and key properties | Construction / group mapping | Review/edit behavior |
| --- | --- | --- | --- | --- |
| RC-OPT / 2 | SC-storage/r1, ports on storage-001/002; QSFP-DD, 1x400G; module OPT-A/r1; connector, exact PMD/reach, MMF/SMF unknown | T8 optical-preview variant/r1, leaf-opt/C1.1 and C2.1 in H-server; OSFP, 1x400G; module OPT-B/r1; same fields unknown | Two point links; four detachable modules, individually owned once; external fiber omitted from BOM scope | Edit A → server NIC/media; Edit B → leaf/group/media. Unknown PMDs cannot be grouped as if compatible; display separate endpoint unknown records and manual coverage. |
| RC-DAC / 2 | SC-storage/r1, storage-003/004; QSFP-DD, 1x400G; assembly end A | T8 cable-preview variant/r1, leaf-dac/C1.1 and C4.1 in L-free; OSFP, 1x400G; end B | Two separate integrated copper DAC assemblies D1/D2, each 2 m (given), no detachable modules; optical PMD/MMF/SMF not applicable | Both-end definition edits affect two instances; length/part-revision exceptions split the row. Placement reach and equipment qualification remain unverified. |
| RC-SPLIT / 4 logical links | Four SC-compute/r1 instances c01–c04, each one 200G port; QSFP56 (given), assembly remote ends B1–B4 | T8 split-preview variant/r1, leaf-split/C7 at 4x200G, OSFP (given), X-all includes children 1–4; assembly common end A | One hypothetical integrated split DAC X1/r1; 3 m each branch (given); four logical paths share one parent cage/assembly | Edit A shows four server occurrences; Edit B shows entire parent/assembly group. End map below is required, not inferred from 4x200G mode. |

The optical-preview and cable-preview variants deliberately configure the selected parent cages at 1x400G; they are not PA-HALF/PA-LIST's unchanged 800G snapshot. Exact source/mode revision is part of the row signature. Group names alone must not hide this difference.

RC-SPLIT explicit **hypothetical** end map (physical channel/pin mapping unknown; requires a real assembly drawing before qualification):

| Path ID | Shared end A logical group | Remote assembly end | Server occurrence/port | Allocation resource |
| --- | --- | --- | --- | --- |
| X1-path1 | A.group1 | B1 | c01/nic-a/p1 | leaf-split/C7.1 |
| X1-path2 | A.group2 | B2 | c02/nic-a/p1 | leaf-split/C7.2 |
| X1-path3 | A.group3 | B3 | c03/nic-a/p1 | leaf-split/C7.3 |
| X1-path4 | A.group4 | B4 | c04/nic-a/p1 | leaf-split/C7.4 |

X1 accounts for **one assembly, five occupied physical cages (one switch + four server), four links and eight logical terminations**. It contributes zero separate transceiver purchases. Reference X1 from all five owners, but purchase it once. Parent cage/common assembly failure correlates four links; it is not four independent failure paths. Selecting only two children does not cut the assembly in half or free its occupied end resources automatically. This hypothetical 800G-to-four-200G shape is **not a verified DS5000 cable option**; parts must supply exact drawings/compatibility for a real tuple.

Proposed grouping signature includes both endpoint source revisions/overrides, cage/form factor, configured rate/mode, media part revision, connector, exact optical PMD/reach/fiber type or integrated medium/length/end types, assembly end/group map and relevant placement exceptions. Retain all represented member/assembly IDs. Unknown values carry their scope/provenance; “unknown equals unknown” is not qualification evidence. Engineers may inspect common structure together, but review coverage records which members/unknowns were actually inspected. Same label with different revisions or a one-instance 5 m DAC stays a separate row or visible exception.

Source edits must distinguish changing the shared definition from an instance override, preview impacted links, preserve the navigation anchor and invalidate affected review signatures. Mapping class is a presentation aggregation; no extra purchase or topology object is created. For the three independent rows above the demonstration purchase-unit sum is 4 optical modules +2 straight assemblies +1 split assembly = **7**; expanding owner/detail views does not change 7. These are mixed item units, not cost or a complete project BOM.

## 8. Reproducible arithmetic and invariants

Run the Python block below with Python 3 (stdlib only). It checks fixture expansion/arithmetic and resource counterexamples; it does not implement allocation or execute upstream validators. Expected output: `allocation preview checks passed`. DS pipeline membership is a deliberately small transcription of the cited source; reviewers should compare it independently to that source.

```python
from collections import Counter

def members(cages, children=(1,)):
    return [(p, c) for p in sorted(cages) for c in sorted(children)]

half = members(range(1, 5)); uplink = members(range(5, 9))
odd = members(range(1, 9, 2)); even = members(range(2, 9, 2))
listed = members([6, 1, 4]); single = members([3])
child = members([7], [1, 3])
assert (len(half), len(uplink), len(odd), len(even), len(listed), len(single), len(child)) == (4,4,4,4,3,1,2)
assert listed == [(1,1),(4,1),(6,1)]
assert set(half) & set(listed) == {(1,1),(4,1)}
assert len(set(half) | set(listed)) == 5  # alias capacity, not seven
configured = members(range(1,7)) + members([7],range(1,5)) + members([8])
free = [m for m in configured if m not in {(7,2),(8,1)}]
assert len(configured) == 11 and len(free) == 9
assert sum(200 if p == 7 else 800 for p,c in free) == 5400
assert (7,3) not in members([7])  # mode change drops child 3
assert len(single) < 2  # two demands exhaust one occurrence's singleton

pipeline = {p: 2*((p-1)//4) + (1 if (p-1)%4 in (0,3) else 2) for p in range(1,65)}
def configured_budget(counts):
    loads = Counter()
    for p,n in counts.items(): loads[pipeline[p]] += n
    return sum(counts.values()) + 2, loads  # auxiliary SFP28s, not management
all4 = {p:4 for p in range(1,65)}
mixed = {p:4 if p%2 else 1 for p in range(1,65)}
halves = {p:4 if p<=32 else 1 for p in range(1,65)}
assert configured_budget(all4)[0] == 258
assert set(configured_budget(all4)[1].values()) == {8}
assert configured_budget(mixed)[0] == 162
assert set(configured_budget(mixed)[1].values()) == {5}
assert configured_budget(halves)[0] == 162
assert set(configured_budget(halves)[1].values()) == {2,8}
ds_server = members(range(1,65,2), range(1,5))
ds_up_a = members(range(2,65,2), range(1,5))
ds_up_b = members(range(2,65,2))
assert (len(ds_server),len(ds_up_a),len(ds_up_b)) == (128,128,32)
assert len(set(ds_server) & set(ds_up_a)) == 0
assert 128*200 == 32*800 == 25600
assert len([m for m in ds_server if m[0] != 63]) == 124
assert [8*(2-1)+offset for offset in (0,2,4,6)] == [8,10,12,14]
bad = {p:1 for p in range(1,65)}; bad[1]=8; bad[4]=4
total, loads = configured_budget(bad)
assert total == 76 and total <= 320 and loads[1] == 12 and loads[1] > 10
total, loads = configured_budget({p:8 for p in range(1,65)})
assert total == 514 and max(loads.values()) == 16
# Parent/child exclusivity is about footprints, not spelling.
parent_claim = set(members([7],range(1,5)))
assert parent_claim & set(child) == set(child)
# Four split paths share one assembly, not four purchases.
paths = [(f'X1-path{i}', 'X1', f'B{i}', f'c{i:02d}', (7,i)) for i in range(1,5)]
assert len(paths)==4 and len({p[1] for p in paths})==1
assert 1+len({p[3] for p in paths})==5 and 2*len(paths)==8
assert 4+2+len({p[1] for p in paths}) == 7
print('allocation preview checks passed')
```

## 9. Handoff and remaining decisions

Acceptance map: assignment item 1 → §3; item 2 → §4 and pinned sources; item 3 → §§2,5,6; item 4 → §§2,4; item 5 → §7. Reproduction is §8. Proposed alias/exclusive semantics agree with model's early table; fixture IDs align but these exact snapshots should be referenced by revision, not assumed identical to model's separately authored examples.

Checks performed for this handoff: source-only reread of profile/naming/budget/update paths at the pinned Fabric commit; bounded vendor page read; Python reproduction block; Markdown local/reference checks and git diff whitespace check. No hardware, source build, CLI/admission, live change or rendering benchmark. Test output and exact commit/PR are recorded in the issue handoff.

Open decisions: sponsor/UX chooses whether DS-EVEN-A or B illustrates their intended uplink mode; either can remain explicitly conditional. Model/topo review the alias/exclusive defaults and revision/ordering boundary. Parts supplies actual assembly end maps, physical qualification and missing shared-bank constraints; unknowns do not block useful previews but prohibit claiming a qualified tuple. Product group ownership and advanced upstream mapping remain proposals. Manual class review is not hardware certification. Lead dispatches independent review and records acceptance; the author does not self-approve.

[profile]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/p_bcm_celestica_ds5000.go
[expand]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switchprofile_types.go#L622-L682
[budget]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L907-L965
[update]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switch_wh.go#L90-L92
[vendor]: https://cls.celestica.com/hardware-platforms/ds5000/
