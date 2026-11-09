# Port allocation groups, grouped inspection and BOM presentation

Author: **t10 / model**. Status: bounded proposal for [#8 assignment](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6730314856), independent review pending. Lead dispatches **t6 / topo** for allocation and **t8 / parts** for accounting/physical grouping. No production schema, allocation algorithm, compatibility engine or new qualification gate is selected.

## 1. Authority and dependencies

Sponsor direction is [product context at 2ee0e7d][S]: planning allocation groups, a simpler destination picker, compact manual connection inspection and expandable BOM summaries. The contracts below are **proposals**, not additional sponsor decisions. Preserve the [server-class contract at 365a0c3][SC], accepted as working input in [lead's disposition](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6728366666): one physical population across networks, immutable snapshots, explicit edits, installed versus acquired composition and unique shared assemblies.

Use corrected [R02b at 31779de][FP], not superseded b4329a5 claims. Fabric v0.144.1 `4bde50829fd7cfebac69332982abd1dee504a8a3`, Fabricator v0.51.4 `d2316aca666eb278541276a11a5f8dae372bf629`, docs `1be68948e177dcc031e91659ab5293ba19893ccf` are historical evidence pins, not permanent installation targets. Lead's assignment reports completed topo correction review. Inherited boundaries: reusable leaf configuration is not an upstream object; SwitchGroup is not a product leaf class; logical NOS offsets are not physical lanes; server-facing connections still depend on switch/peer/service rules. No new upstream execution or hardware claim is made here.

Topo's [allocation-pattern assignment](https://github.com/afewell-hh/hh-aid/issues/5#issuecomment-6730315057) owns source-derived naming, DS5000 facts and physical constraints. The sponsor's 64×800G, 4×200G and even-uplink example is a requested pattern, not qualification. The eight-cage fixtures here are synthetic. [Early entity table](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6730484917), [topo coordination](https://github.com/afewell-hh/hh-aid/issues/5#issuecomment-6730485103) and [UX coordination](https://github.com/afewell-hh/hh-aid/issues/9#issuecomment-6730485363) record the alias/exclusive proposal; topo concurrence remains pending. Useful provisional intent can be saved before these dependencies resolve.

## 2. Entity and destination contract

| Concept | Identity and scope | Contract |
| --- | --- | --- |
| PortAllocationGroup definition | Stable group ID + immutable revision, owned by reusable leaf configuration revision | Purpose, selector source, numbering namespace, mode assumptions and member order. Purpose can simply mean equal capabilities; it does not create LACP, service or switch configuration. |
| Project group binding | Local ID/revision + definition reference + project leaf deployment context | Pins the definition or records local customization. Context supplies product fabric reference, eligible switch occurrences (possibly unknown), profile and configured-mode dependencies. A definition may have several bindings. |
| Expanded selection | Derived revision pinned to binding, selector, profile digest, mode map and numbering map | Ordered canonical physical/logical members, displayed labels, exclusions, resource footprints and unresolved entries. Preserve source selector separately; expansion is not allocation. |
| Destination demand | Existing server/component/port occurrence + fabric context, leaf context and group binding reference | Switch instance may remain unassigned. Unknown group/profile/mode remains unresolved, not an empty group or zero capacity. More attachments never create another server population. |
| Exact assignment | Demand occurrence → specific switch occurrence/configured logical termination, with provenance/output revision | Consumes resources. Distinguish explicit user binding, generated candidate and class-level preference. |
| Reservation | Stable ID, owner intent, scope, footprint, quantity and reason | Class reservation repeats per applicable switch; instance reservation names one occurrence. Intentional unused capacity persists; release is explicit. |
| Manual review record | Reviewer/time, output/signature revision, represented member set, inspected fields, exclusions and notes | Records actual inspection, not qualification, an automatic verdict or uninspected installation conditions. |

Basic picker: **fabric context → leaf context → allocation group**. Create/reuse preserves unsaved server edits. Reuse selects identity, never merges equal labels. Retry creates one entity; cancel leaves prior edits and an unresolved selection, not a dangling ID. Upstream installation/Fabric/domain mapping stays an advanced separate concern. Conflicting fabric/leaf references stay visible. Reusable leaf configuration can be used across contexts; the project binding identifies which context a demand means.

A class-level singleton `printed:3` on a class used by SW-A and SW-B offers one candidate on **each** switch. It does not choose SW-A or provide one project-wide slot. Exact binding `server-17/nic-1/port-1 → SW-B/C03/N` does. If switch count is unknown, show one member per switch and unknown aggregate capacity. Do not multiply capacity by the number of demands referencing the group.

## 3. Selector source, expansion and capacity

Fixture numbering: `printed` labels are **1-based 1–8, inclusive**. Canonical physical keys are C01–C08. Native logical members are Cnn/N; hypothetical four-way mode children are Cnn/B1…B4, with explicit 1-based child ordinals. These are illustrative keys, not upstream names or physical lane numbers. Real expansion needs a sourced printed-label → profile-name → configured-logical-member → cage mapping. Missing/ambiguous mapping stays unresolved. Never derive physical lanes from NOS offsets.

Ranges declare inclusive bounds and positive stride. Odd/even refers to the declared numeric namespace. Explicit lists preserve declared order; duplicate canonical members are rejected, not extra capacity. Alternatively, order can reference a pinned canonical ordering rule. Renaming labels preserves IDs. Non-numeric labels need an explicit mapping, not guessed parity.

| Fixture | Source selector / mode | Ordered expansion | Available terminations per switch |
| --- | --- | --- | --- |
| PA-HALF | Uplink 1..4, server 5..8; native | U: C01/N,C02/N,C03/N,C04/N; S: C05/N,C06/N,C07/N,C08/N | Reserve C08/N unused: U=4, S=3; unused uplinks do not transfer automatically |
| PA-STRIDE | U even 2..8 step 2, S odd 1..7 step 2; native | U: C02/N,C04/N,C06/N,C08/N; S: C01/N,C03/N,C05/N,C07/N | Four each before reservations; project policy, not hardware restriction |
| PA-LIST | Printed [7,1,5]; native | C07/N,C01/N,C05/N | Three; source order intentionally differs from numeric order |
| PA-SINGLE | Printed [3]; native | C03/N | One per eligible switch, not an exact instance binding |
| PA-CHILD | Printed 1 in four-way mode; child list [1,3] | C01/B1,C01/B3 | Reserve B3 for parked tail: one available, one reserved; B2/B4 outside this pool are not silently assigned |

These are separate alternatives, not five additive pools on one switch. A logical termination is not a cable, cage, bandwidth guarantee or proof of feasibility. Shared parent/bank/pipeline limits and topology/rail/plane/failure constraints apply beyond member cardinality. Unknown budgets prevent a feasibility claim but preserve the selector preview.

### Configured usage, selected/free terminations and assigned links (AC1)

Keep three separate accounts per physical switch occurrence and applicable shared resource; none can substitute for another:

| Account | Count basis | Meaning and limit |
| --- | --- | --- |
| Configured switch-resource usage | All logical members exposed by the configured modes across the switch and each applicable profile/bank/pipeline scope | Includes members outside the selected group, reserved members, parked channels and intentionally unused or disconnected members. Compare this full usage with each applicable configured-resource budget, counting canonical resources once across aliases. |
| Selected and eligible/free terminations | The group's expanded members, then the remaining candidates after assignments, exclusions, reservations and physical constraints | Show selected count separately from eligible/free count. Small selections do not reduce configured usage or prove budget feasibility; an unresolved or exceeded shared budget must remain visible even if the local member selection fits. |
| Assigned links | Explicit link records with both ends and applicable topology/service eligibility, physical construction and resource constraints | A selected/free termination alone is not a link. A candidate with an unresolved or conflicting budget cannot be reported as a valid feasible assignment. Existing assignments/commitments remain recorded as stale/conflicting where appropriate. |

Reserve, exclude, park or disconnect is **not a configuration change**. Such actions can reduce free choices or active links but do not reduce configured-resource usage. Unknown mode on an intentionally unused cage leaves its contribution and applicable switch/shared-resource totals unknown, not zero; retain known contributions without claiming a complete total. Changing a configured mode requires a new snapshot and impact check under §4, including dependent assignments and locks.

**AC1 negative fixture:** two parents on one synthetic shared resource each configure four children; its budget is six configured logical ports. Select only child 1 of each parent: selected=2, but configured=8>6, so the resource conflicts before any valid link assignment. Reserving a selected child reduces the unreserved selection to one; reserving an outside-group child leaves it at two. Neither changes configured=8 or resolves the conflict. There are zero assigned links in this fixture; two selected terminations must not be presented as two links. If one unused parent's mode becomes unknown in a new candidate snapshot, its contribution and total configured usage become unresolved rather than falling to four. This is planning arithmetic, not a hardware claim or allocator.

**Overlap proposal, awaiting topo review:**

- **Alias views** expose the same capacity. Two groups containing C03/N do not create two slots. Reservations/assignments appear through every alias; union capacity uses canonical identities.
- **Exclusive pools** require disjoint consumption. Intersections are planning conflicts requiring an edit or explicit alias relationship. Uplink/server labels alone do not decide the relationship.
- Unspecified overlap remains unresolved; no silent priority or assumed disjointness. Ordering within a pool does not confer ownership against another pool.
- Whole-parent native allocation/reservation excludes all breakout children. Distinct children may coexist only under the same configured mode, disjoint source-backed consumption footprints and allowed shared budgets. Selecting a cage in breakout mode must explicitly mean configured children or whole-cage reservation, never an additional native termination.
- A parked tail reserves its channel and retains assembly identity without creating an active link or occupying an unattached remote cage. Other channels' availability depends on the assembly/mode map. No two demands consume the same exclusive resource.

Capacity ledger scope is **physical switch occurrence**, not group, display label or upstream export copy. A reservation and its permitted consuming assignment reference the same footprint rather than subtracting twice. Other intents cannot consume that reservation. Removing an alias view alone does not release reservations or assignments. Class reservations and exact-port reservations both remain inspectable.

## 4. Determinism, edits and retained commitments

The eventual allocator must consume a versioned snapshot containing demand occurrence order; eligible switch occurrence order; ordered expanded members; exact bindings; reservations/owners; current assignments/locks; resource footprints/shared constraints; and rule/tie-break revision. Stable canonical IDs break otherwise equal ordering. Display sort or container iteration order cannot be a hidden tie-breaker. Same semantic snapshot/rules must produce the same assignment or explained unresolved result. This defines the boundary, not a greedy strategy or solver. Changing order is a semantic edit with an impact preview.

Retain valid explicit bindings/commitments in a candidate. Exhaustion or reservation conflict reports affected demands and unmet count while preserving assignments. Offer explicit alternatives (another group, additional switches, released reservation, changed placement); never silently choose one. Port totals alone do not prove physical or rail/domain/failure feasibility.

| Edit | Scope preview / new revision | Existing output and review |
| --- | --- | --- |
| Reusable server NIC/port definition | Show affected customizations and server occurrences; explicit adoption or project fork | Dependent demand/construction rows stale; old snapshots, orders and inspection retained |
| Switch profile/mode/group membership | Show bindings, switches, connections; added/removed/reordered/unresolved members | Removed or mode-invalid exact binding becomes conflict; ordered/approved connection remains in history with disposition needed, never silently relocated |
| One instance exception | Override the named occurrence or split selected population membership, preserving IDs | Only affected construction moves to exception row; physical population unchanged |
| Reservation/order change | Preview footprint and assignments across aliases | Recompute candidate; incompatible locks need resolution, not deletion |

Row shortcuts link actual source revision/path. Side A may target class → customization → NIC slot → port/media; Side B may target leaf configuration → project binding → group/mode/member/media. Instance overrides are distinct targets. Show affected member IDs/counts before saving. Return preserves output and row context and links old rows to replacements after split/merge. Navigation alone is not a change. Source revision changes make dependent rows stale until regeneration/diff establishes impact. A pure rename may retain review through recorded equivalence, not label equality. No new mandatory approval workflow is imposed.

## 5. Unique connection classes and manual coverage

A connection class is a **presentation partition of physical link occurrences** in one output revision, not an upstream Connection kind, LACP group, allocation group or SKU. Every represented link belongs to exactly one leaf review row in that view. One upstream Connection may cover multiple constructions. Active logical links, unique assemblies, physical ends and reserved tails have distinct counts.

The versioned grouping signature includes:

1. Both end definition/customization revisions and property states: model/evidence, cage, configured speed/mode, host interface, connector, exact optical PMD/reach, fiber type (MMF/SMF/unknown plus derivation source), relevant electrical/FEC properties. Integrated assemblies instead expose end host interfaces, assembly type, length/reach/branches; do not fabricate optical-module properties. Compact columns show key properties, not merely descriptions/SKUs; full signature is in drill-down.
2. Assembly construction/revision and end-to-channel mapping, parent/tail roles, shared modules, occupied/reserved tails, allocation group binding/expansion revisions at both ends. Separate optical ends retain individual module references. Multi-ended mapping remains reconstructable even across review rows.
3. Material instance exceptions: length/path, override, mode, connector/PMD, evidence/known conflict, rail/plane or shared-resource conditions relevant to inspection. Unknowns retain state and provenance: unknown is not known, and unrelated unknown sources do not become equivalent facts.

Member occurrence IDs are retained with the row, not used instead of reusable construction properties. Repetition from the same unresolved definition may share an explicitly **incomplete** row with unknown fields excluded from review coverage. Independent or instance-specific unknowns (e.g. actual path/length) remain visible unresolved member exceptions; the row cannot claim equivalence/inspection for those fields. Matching labels or SKUs alone never justify merging. Preserve Side A/Side B orientation and parent/tail roles.

### Compact fixture for two server classes and leaf groups

A and B are synthetic server classes. Modes and interfaces are accounting assumptions, not product qualifications. The product fabric is shared; L1/G-opt, L2/G-data and L1/G-child are distinct project bindings.

| Row / link members | Key Side A → Side B display | Mapping and counts | Inspection limit |
| --- | --- | --- | --- |
| RC-OPT: A1/o,A2/o | QSFP-class, native 200G, connector/PMD/reach/fiber unknown → same given cage/rate, independently unknown optical details | Two optical links, four module requirements; A → L1/G-opt r1 | Common source unknowns stay explicit; no optical plant/PMD coverage |
| RC-DAC: B1/d,B2/d | QSFP-class 200G → QSFP-class 200G; DAC, length unknown, end e1→e2 | Two links, two straight assemblies D1/D2; B → L2/G-data r1 | No detachable optics; instance lengths remain unresolved |
| RC-SPLIT: A1/b,B1/b | Each tail QSFP-class 200G → parent OSFP-class configured 4×200G | Two links, one assembly X1, three physical ends; t1→child 1, t2→child 3 at L1/G-child r1 | Hypothetical unequal form factors; explicit shared parent; parent groups 2/4 reserved unused |

Totals: six links, three integrated assemblies D1/D2/X1 and four separate modules. RC-SPLIT may summarize repeated tail construction across A/B only if end definition/property revisions are equivalent. Otherwise use two rows referencing X1; totals remain unchanged. Unused parent groups do not add links/assemblies. In a parked-tail variant, X1 remains one assembly, one tail has no active link, and its configured group stays reserved; no invented remote termination.

Example exception: B2/d changes to a different evidenced length or known host-fit conflict. Split RC-DAC into ordinary and exception rows (1+1), retaining D2 identity and conflict even if the engineer chooses to proceed. Original two-member review is historical. Unchanged B1 may retain recorded field coverage; affected B2 fields need new inspection. Adding B3 later is not covered by the prior member set. Switch-parent mode changes affect every sharing tail, not just the selected row.

Record actual scope, e.g. “inspected cages/modes and end mapping for these members; length/plant not checked.” Row states can be uninspected, inspected with unknowns/notes, or stale. Known conflicts remain alongside manual review. Class inspection never implies hardware support, automatic compatibility, procurement readiness or review of unknown per-instance installation conditions.

## 6. BOM presentation invariant

Presentation nodes hold labels, quantities, expansion state and requirement/purchase references; they do not create procurement quantities by being parents. Requirements, coverage and acquisition units keep their identities. A bundle may have installed children and still be the only purchase satisfying those exact child requirements. Included, separate, unknown-inclusion and shared-reference states are visible in details.

Separate synthetic accounting fixture (not added to §5):

| Collapsed row | Purchase identities / quantity | Expanded detail |
| --- | --- | --- |
| Server bundles | S1,S2: 2 each | Two installed NICs and four disks included; zero additional purchases for those covered requirements |
| Power cords | P1…P8: 8 each | Four per server separately acquired |
| Optical modules | O1…O3: 3 each | Two server modules and one shared switch module covering two groups; both links reference O3 |
| Integrated assemblies | D1,X1: 2 each | One straight and one two-tail assembly; X1 referenced from parent and both tails |
| Accessory, inclusion unresolved | One installed requirement U1 | Separate purchase quantity unknown, neither zero nor a confirmed extra order |

Collapsed known purchases = **2+8+3+2 = 15 each**, plus unresolved U1. Expanded known purchases = **15 each**, plus the same U1. Included NIC/disks and repeated O3/X1 references add zero. Shared module/assembly feasibility is assumed for identity arithmetic only.

A summary row contributes either its acquisition-unit quantity (bundle) or a view-only aggregate of children; never count the same aggregate and its children in the total. Do not sum unlike units (kits/licenses/metres) into a purchase total: this homogeneous each checksum only illustrates conservation. Unknown inclusion, pack rounding, stock and orders remain distinct states. Expand/collapse cannot change requirements, reservations, cost, scope or readiness. External fiber/structured cabling remains excluded, with interface dependencies visible.

## 7. Constraints, negative cases and verification

These are proposed hard **planning integrity** rules in their applicable records, not new support gates. Counts use each/links and canonical identity sets. Physical uncertainty remains unknown. Model owns semantics; topo reviews resource/selection behavior; parts reviews physical grouping/accounting; UX reviews presentation. Purpose, reservation and ordering choices are explicit user policies, not universal hard topology constraints.

| ID / applicability | Positive evidence | Negative case and required result |
| --- | --- | --- |
| PA1 selector expansion | §3 ordered previews/numbering | Duplicate canonical member or absent numbering map: reject duplicate capacity / mark unresolved |
| PA2 overlap/reservation | Alias union and occurrence ledger | Same C03 through two groups: no double allocation; unspecified relation unresolved |
| PA3 configured resource | PA-CHILD footprint and §3 AC1 three-way accounting | Parent plus child or inconsistent modes conflict. Two four-child parents exceed shared budget six despite only two selected; reservation leaves configured eight. Unknown unused mode leaves applicable usage unresolved, not zero |
| PA4 destination | Singleton on SW-A/SW-B | Class singleton silently binds instance or new network clones server inventory: reject |
| PA5 regeneration | §4 ordered inputs/retained bindings | Exhaustion, removed locked port or iteration-order change: no silent movement; same semantic snapshot gives same result |
| RC1 grouping | §5 signature and six-link fixture | Same SKU with different PMD, revision, length, connector or unknown provenance: split/expose exception |
| RC2 coverage | Member/field/revision-bound record | New/edited member inherits blanket inspection: reject; stale affected coverage, retain history |
| RC3 multi-end identity | X1 shared by two tails | X1 purchased twice or parked tail counted active: reject |
| BH1 presentation | §6 15 each + U1 before/after | Included child or O3/X1 references counted twice; unknown becomes zero: reject |

Reproduce the identity/tally oracle with Python 3; this is not an allocator:

```python
half_u, half_s = list(range(1,5)), list(range(5,9))
even, odd = list(range(2,9,2)), list(range(1,8,2))
assert len(half_u) == 4 and len(set(half_s)-{8}) == 3
assert set(even).isdisjoint(odd) and set(even+odd) == set(range(1,9))
assert [7,1,5] != sorted([7,1,5])  # source order is semantic
alias_a, alias_b = {1,3}, {3,5}
assert len(alias_a | alias_b) == 3 and len(alias_a)+len(alias_b) == 4
parent, child1, child3 = {1,2,3,4}, {1}, {3}  # synthetic footprints
assert parent & child1 and not child1 & child3
assert len({1,3}-{3}) == 1  # reserved child unavailable
assert len({(sw,3) for sw in ('SW-A','SW-B')}) == 2
# AC1: configured usage is independent of selection/reservation/link count.
configured_members = {(p,c) for p in ('P1','P2') for c in range(1,5)}
selected_members = {('P1',1), ('P2',1)}
shared_budget = 6
assigned_links = set()  # no paired, eligible link assignments in this fixture
assert selected_members <= configured_members
assert len(selected_members) == 2 and len(configured_members) == 8 > shared_budget
assert len(assigned_links) == 0
for reserved_members, unreserved_count in [({('P1',1)},1), ({('P1',4)},2)]:
    assert len(selected_members-reserved_members) == unreserved_count
    assert len(configured_members) == 8 > shared_budget  # reservation is not reconfiguration
# New candidate snapshot: unused P2 has unknown mode, not zero configured use.
configured_contributions = {'P1': 4, 'P2': None}
known_usage = sum(n for n in configured_contributions.values() if n is not None)
total_usage = (sum(configured_contributions.values())
               if all(n is not None for n in configured_contributions.values()) else None)
assert known_usage == 4 and total_usage is None
print('AC1 passed: selected=2, configured=8>6, assigned=0; reservation preserves 8; unused unknown mode leaves total unresolved')
rows = {'opt': {'A1/o','A2/o'}, 'dac': {'B1/d','B2/d'},
        'split': {'A1/b','B1/b'}}
assert len(set.union(*rows.values())) == sum(map(len,rows.values())) == 6
rows['dac'], rows['exception'] = {'B1/d'}, {'B2/d'}
assert sum(map(len,rows.values())) == 6
assert len(set(['D1','D2','X1','X1'])) == 3
purchases = {f'{kind}{i}' for kind,n in [('S',2),('P',8),('O',3),('A',2)]
             for i in range(1,n+1)}
expanded_refs = list(purchases)+['O3','A2','A2']
assert len(purchases) == len(set(expanded_refs)) == 15
unknown_inclusion = {'U1': None}
assert unknown_inclusion['U1'] is None
print('PA/RC/BH synthetic identity and tally checks passed')
```

Author verification: embedded oracle executed; pinned hh-aid paths, Markdown references/table widths/fences and whitespace checked. These validate document consistency/arithmetic only. No upstream validator, actual allocation, hardware/optical qualification, scale rendering, participant study or executable edit workflow is claimed.

Open questions: topo to reconcile alias/exclusive policy, consumption footprints and ordering with its pending source fixtures; parts to review grouping-key sufficiency and shared module/end accounting; UX to assess compactness/source-edit scope. DS5000 physical mapping remains topo/parts evidence work. Lead owns acceptance and dispatch. No self-approval or broader model rewrite is requested.

[S]: https://github.com/afewell-hh/hh-aid/blob/2ee0e7d32c46ebed03e914b64b848651061cbd42/docs/product-context.md
[SC]: https://github.com/afewell-hh/hh-aid/blob/365a0c363a942b02881eb5a911a40f189107cf73/docs/design/server-class-contract.md
[FP]: https://github.com/afewell-hh/hh-aid/blob/31779ded356b4db0c6e582d4cb209dddbc005bf2/docs/research/fabric-profile-contract.md
