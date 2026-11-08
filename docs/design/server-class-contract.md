# Server-class identity, attachments and BOM composition

Author: **t10 / model**, 2026-11-08. Assignment: [#8 dispatch](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6726546059). Status: proposed bounded D01 addendum. **Existing t8 / parts** accepted composition/counting at `fb06179` in its [independent review](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6728284468); this reconciliation delta and overall acceptance remain pending, coordinated by lead. **Existing t6 / topo** reviews bridge’s source evidence separately. No production schema, catalog, solver or implementation selected.

## 1. Authority and evidence boundaries

**S — accepted sponsor direction:** [main 4449d14 product context](https://github.com/afewell-hh/hh-aid/blob/4449d14bb9019310da476ed2608ddc4850a8c376/docs/product-context.md), dated server-class section: use **server** for all non-switch devices, including appliances; nested customizable hardware and simultaneous networks replace scalar links-per-endpoint as the product model. Include arbitrary unit BOM items, transceivers and integrated DAC/AEC/AOC assemblies. External structured/fiber cabling specification is excluded. Canvas versus editor/table remains an open UX choice.

**P — proposal:** all contracts and synthetic fixtures below, unless identified as inherited research. They extend [D01 at 3d313fe][D01] without rewriting it. The earlier word “endpoint” in D01 describes a connection termination; user-facing non-switch inventory is now “server.” Product terminology does not change upstream resource kinds: a controller/gateway's API representation still follows the applicable upstream contract.

**R — inherited bounded evidence:**

| Source | Exact artifact / issue finding | Use and limit |
| --- | --- | --- |
| R05 | [8a8fccac6b6d560ef17889c4819dce3b8bf19a8c][R05]; [lead acceptance](https://github.com/afewell-hh/hh-aid/issues/6#issuecomment-6714714230); [ops independent delta](https://github.com/afewell-hh/hh-aid/issues/6#issuecomment-6714451987) | Distinct component/assembly identities, kit inclusion, configured lanes, shared failures, compatibility versus override. Separate-fiber counts in that report are context, not this deliverable's scope. |
| R02 | [bf7437c3fc852cfe06663073edc36a08de75efbc][R02]; [lead acceptance](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6712493946) | Server is not Fabric-owned; fabric/domain/port/profile rules and extra resources. No automatic correspondence between product fabrics, upstream domains and planes. |
| New parts pass | [SU fixtures at 0230cd8][SU]; [model independent review](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6728297958) | Conditional identity/composition/counting review accepted by model; vendor qualification and overall lead acceptance are separate. See §6 for deliberate SCX/SU differences. |
| New source pass | Bridge [fabric/profile mapping][FP] and [currency screen][RC] at b4329a5; [lead reconciliation dispatch](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6727963417) | Draft source evidence, independent review pending from existing t6 / topo. §4 reconciles its bounded observations; model does not independently certify its execution or release claims. |

Historical evidence: Fabric v0.144.1 `4bde50829fd7cfebac69332982abd1dee504a8a3`, Fabricator v0.51.4 `d2316aca666eb278541276a11a5f8dae372bf629`, docs `1be68948e177dcc031e91659ab5293ba19893ccf`, associated with research release 26.05. These are provenance, not a policy to install an old release. No fresh vendor qualification or upstream execution was performed for this addendum. No inferred maintainer intent is used.

Prior accepted working clarifications remain: [DetailsSnapshot and mixed results](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6718071380), [starter/independent-input contract acknowledgment](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6718550737), [elicitation and alternatives](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6718872762). They are working contracts, not final independent D01 approval.

## 2. Identity and edit scope

| Concept | Identity and meaning | Edit/reuse behavior |
| --- | --- | --- |
| Family / form factor | Classification labels such as rack server, tray or appliance; vendor family can be unknown | Changing a discovery label does not change quantities or hardware. Family is not a deployable configuration or physical instance. |
| Reusable server class | Stable class ID, independently versioned profile revisions | A revision pins nested composition, optional choices, attachment roles and provenance. Reuse references an exact revision. Minor permutations need not become new global catalog entries. |
| Project customization | Local ID, base class/revision reference, explicit field/component deltas and resolved choice selections | Default edit scope is declared to the user: this customization and named populations only. Overrides preserve old values/source. They do not mutate the reusable base or unrelated projects. |
| Population | Stable population ID, physical quantity, customization revision, occurrence membership | Count the physical servers once. One population can serve several networks. Counts may be unknown. Rack capacity alone does not establish occupancy. |
| Physical server occurrence | Stable ID per counted unit, with nested component occurrence IDs | Instances may be represented by deterministic ranges before materialization. Expansion preserves occurrence keys. Serials/site bindings are later facts, not identity seeds. |
| Component slot / occurrence | Stable slot identity in a profile; distinct occurrences when quantity exceeds one | Display labels and tree order are not IDs. Replacing one DPU by two gets explicit replacement lineage and port-role remapping; it is not a silent rename. |

**Supported author actions:** reuse a class revision; customize a local copy; create a new reusable revision explicitly; duplicate a configuration with fresh local identity and source lineage; or split a population so only selected servers take a variation. A configuration duplicate has no added physical quantity until the user explicitly adds or allocates population members. Duplicating a populated scenario is an alternative, not additive procurement inventory. A split of 100 into 60/40 preserves the 100 occurrence IDs and commitments, while changing which customization applies. Reject overlapping membership or an unexplained count increase.

A reusable revision update is offered as a comparison, never pushed silently into projects. An adopted update creates a new DetailsSnapshot with a three-way base/new-base/local-delta comparison; conflicting removals of a locally edited slot or attachment stay unresolved. Reuse of exactly the same customization by several populations is explicit; an edit shows every affected population and summed physical quantity. “Only these servers” forks the customization or splits membership. Existing output revisions continue to reference their old snapshots. Approval and ordered stock do not transfer merely because the class name is unchanged.

A profile may offer orthogonal options (storage DPU present/absent; one dual-port or two single-port frontend DPUs) with declared compatibility constraints. Unselected options remain unknown/conditional, never all installed together. Do not claim every combination works. An optional component removed in a candidate invalidates its dependent ports, attachment demands and BOM; retain the prior revision and report affected locks. No hidden orphan attachments or reuse of removed slot IDs for unrelated hardware.

## 3. Nested hardware and simultaneous attachments

The containment tree describes physical ownership. Cross-references describe connectivity and purchasing; neither is implemented as extra physical children solely to get a convenient UI tree.

| Record / relation | Minimum conceptual fields; unknown allowed | What it establishes |
| --- | --- | --- |
| Component requirement | Slot ID, parent, kind/class or exact model/revision, quantity per parent, applicability/option, source, installed versus purchase inclusion | Nested installed quantities; arbitrary items (disks, power cords, licenses, rails, accessories) may have no network ports. Units distinguish each, kit, pair and license. |
| NIC/DPU | Owning server/component occurrence, hardware model and revision, firmware/driver evidence, physical slots/cages, management function | Two NIC devices are not one device with two ports. DPU management adds a port/function, not a second top-level server purchase. |
| Port/cage/mode | Physical cage identity; capabilities versus selected mode; logical port and electrical channel groups; rates in Gb/s per direction; FEC/autoneg; shared bank/pipeline/power restrictions | Counts and compatible mappings. A logical lane is not a connector; configured unused lanes still consume applicable budgets. |
| Optic / assembly termination | Module instance or shared assembly ID, physical end ID and channel group, host interface, PMD, connector/fiber/polarity, reach/branch requirements | Two-ended engineering comparison. Unknowns retain status; matching names or rates alone do not prove interoperability. |
| Attachment demand | Stable ID, local server/component/logical-port references, fabric-intent ID (or unresolved choices), destination leaf-class ID (optional), role/service, rail/plane references and redundancy/placement policy | Network participation without new server inventory. Destination exact switch/port may remain deferred. |
| Physical realization | Demand → actual logical link(s), unique terminations, shared component path and validation coverage | Checks alias/lane ownership, coverage, capacity and shared failures. A Connection can contain several links; its count is not the server or cable count. |

A port-group assignment expands through an explicit member set. A port appearing in overlapping groups cannot be allocated twice. Shared services on one physical link require an explicit service/multiplexing design, not duplicate physical links for each fabric label. A rail relationship references accelerator and NIC functions even if GPU BOM inclusion is unresolved. Plane membership and independence policy remain distinct; sharing a NIC, cage or assembly is visible even when destination leaves differ.

For absent facts, keep unknown supported modes, selected mode, optic SKU, quantity or destination independently. A selected generic class permits a conditional count under its stated assumptions; it supplies no fabricated SKU or qualification. A deliberate engineer override records the conflicting evidence and chosen value but never changes incompatible/unverified to supported/qualified.

## 4. Fabric intent, leaf classes and switch model provenance

A product **fabric intent** has a stable project-scoped ID, network purpose, management boundary and service/failure requirements. It can precede all hardware selection. A **leaf class** has exactly one fabric-intent reference and a leaf configuration/model selection that may be unknown. Multiple leaf classes may reference one fabric. A reusable leaf configuration can be instantiated into several project leaf classes; that does not give one leaf class ambiguous fabric ownership.

Selecting LC1 for a port can resolve its previously unknown fabric to LC1's fabric. If an explicit existing fabric differs, preserve both and show a conflict with choices to select another class, change the attachment intentionally, or create a class in the intended fabric. Never silently move an existing shared leaf class and all its consumers to another fabric. Redundant destinations can be an explicit list of leaf classes; each reference must be compatible with the intended fabric/service policy. Selecting a class does not fix switch instance count or prove a feasible topology.

**In-context creation/reuse contract:** retain unsaved server-profile edits; allow a provisional fabric with a stable ID; create a leaf class referencing it; then attach the server's port-group demand. Commit a consistent set of references in the next saved snapshot. Canceling creation leaves the original edits and an explicit unresolved selection, not a dangling class ID. Reusing an existing entity is an explicit identity selection, not name-based automatic merging. Repeated submission of the same create operation must not create duplicate entities. Renames preserve IDs; deletion of a referenced fabric/class requires resolving references or retaining a tombstone/unresolved reference in history. A partially configured entity is valid saved planning state, distinguishable from a reference to an entity that never existed.

| Switch model origin | Identity/provenance | Support and edit boundary |
| --- | --- | --- |
| Source-derived | Source repository commit, upstream profile name, content digest/extraction revision, applicable product composition | Read-only evidence snapshot. R02/R05 resource limits are useful; presence does not prove every role/NOS/physical combination supported. |
| Locally modified | New local revision with source base and precise capability diff | Never masquerades as original built-in profile. Recheck every affected constraint and support claim. Configuration of an allowed breakout is a configuration choice, not editing profile capability. |
| Manual | Local identity, author/evidence; explicit capability fields | Unknown fields are unknown, not unlimited. Needed fields include cage/logical mappings, modes, group/bank/pipeline budgets, role/NOS eligibility, feature support, physical restrictions and BOM associations. No deployment permission from entry alone. |
| Placeholder | Explicit generic identity and stated hypothetical capacities | Conditional estimates only. Replacing it with a real model triggers quantity/port/assembly and support revalidation. |

### Bounded upstream mapping reconciliation

The following inherits bridge's **draft** [mapping report][FP] at `b4329a5f8107ef8bf64ede045992187461f552da`, using the exact upstream pins in §1. Independent source review is assigned to **t6 / topo**; this is a proposed product contract reconciliation, not acceptance of that report or support certification.

| Product identity / intent | Upstream representation at the reported pin | Boundary retained in hh-aid |
| --- | --- | --- |
| Physical server occurrence | `Server.spec` has no Fabric/domain owner. Distinct ports of one Server can participate in distinct Connections to multiple Fabrics within one installation. | One physical population and nested component inventory, several attachment demands; do not clone the Server per fabric in that installation. Do not allocate the same physical port twice. |
| Installation export | Resource identity is scoped by the target installation/API context. Separate installations require separately scoped resource representations. | Maintain `physical occurrence ID → installation scope → resource kind/name`. Cross-installation use is bridge's explicitly open inference Q-FP-1, not proven deployment/service support; resource copies do not add purchases. |
| Connection | Each Connection has exactly one `spec.topology.fabric`; its referenced switches must belong to that Fabric. One Connection can contain multiple links. | There may be many Connections per Fabric. Do not interpret this as “one Connection per Fabric,” or use a bundled/ESLAG Connection across Fabrics. |
| Switch and leaf class | Each Switch has one `spec.topology.fabric`; leaf membership can include multiple domains, whereas spine membership is constrained to one. | A product leaf class is configuration intent, not an upstream kind or `SwitchGroup`. Group/redundancy labels do not encode the class's composition or substitute for explicit Fabric mapping. Several product leaf classes may map to one Fabric. |
| Fabric purpose, domain, plane and rail | Fabric/domain fields and service resources have their own source-defined constraints. Shared leaves across domains do not alone establish transit or service connectivity. | Keep separate IDs and an explicit mapping decision. Selecting a product leaf class resolves its product fabric reference, not automatically an upstream Fabric/domain/service arrangement. A rail index is not a domain or a proven failure plane. |
| Switch capability model | Built-in profile evidence is pinned by upstream release/commit, profile name and content digest; no internal profile revision field is assumed. Extra profiles require the source-defined `allowExtraSwitchProfiles` gate. | Entry of a manual capability or enabling the gate is not NOS/platform/hardware support. Preserve origin, local capability diff, configured modes and separate qualification evidence. Profile notes and structured capability fields are distinct evidence. |

**Example:** physical server `P-A/001` has frontend and backend ports. In installation `I-1`, its export maps to one Server `srv-001`; frontend Connection `c-fe` maps to upstream Fabric `UF-FE`, backend Connection `c-be` to `UF-BE`, with each switch belonging to the corresponding Fabric. Both export references point to the same physical occurrence and purchase requirements. If a candidate instead uses installations `I-1` and `I-2`, the two resource keys are separate mappings to that occurrence; the candidate retains the cross-installation support question. Neither candidate duplicates the server, DPU, NIC or shared assembly in the BOM. All names here are illustrative; equal display names never create mapping equivalence.

Bridge reports a positive virtual/synthetic fixture using its restricted local pinned `hhfab` build, not a published release binary, full admission path or hardware test. This addendum did not execute it. Associated resources beyond Server/Switch/Connection still follow R02 and the selected service contract; upstream ServerProfile is not this nested server-class hardware model.

Bridge's [currency screen][RC] reports a dated 2026-11-08 observation of release 26.05 with the same evidence composition. That draft observation remains pending independent review and does not permanently freeze installation targets. Keep original snapshot pins for reproduction and resolve the latest eligible installation target when preparing an installation. Unchanged source SHAs can avoid duplicate source-delta work; they do not eliminate a later currency check. Do not promote disputed topology classifications or open authority questions from the draft into approved support. Unresolved mappings block the relevant export claims while allowing conditional BOM work.

## 5. Composition and counting rules

1. Expand owned component occurrences by products of parent quantities: population × units/component × nested items/component. Reject cycles, fractional “each” quantities and ambiguous units. A shared item is referenced, not expanded independently under every owner.
2. Distinguish installed composition from acquisition. An included child is present and counted for engineering/maintenance, but its requirement is fulfilled by its purchased bundle, so it is not ordered again. An inclusion relationship names the exact child requirement and covered quantity; an “included” badge on a SKU does not cover unlimited occurrences or a different variant. Missing bundle evidence makes purchase quantities conditional.
3. Choose non-overlapping order units: kit or covered children, not both for the same requirement. Additional explicit spares are separate demands. Existing stock, commitments, pack rounding and exclusions follow D01; source includes do not imply spares or price zero.
4. One integrated DAC/AEC/AOC is a shared physical assembly with ends referencing both owners; no extra detachable optics for its inseparable end housings. An optics-based native link normally has a module at each end, but twin-engine/shared modules follow actual component identity, not an unconditional two-per-link rule.
5. Per-unit assembly requirements use a pairing/ownership rule to create unique connection assembly IDs. They are not two independent per-owner cable purchases. In a breakout with one parent and two tails, two links share one assembly; parked tails remain reserved. Module/assembly removal impacts all referenced links.
6. Switch ancillary items use the same composition/inclusion rules and multiply by **actual or conditional switch-instance count**, not by leaf-class count or number of server references. A power supply can be installed, included in a switch bundle, and still appear in maintenance inventory without a separate purchase line.
7. “Complete within declared scope” names covered populations, alternatives, networks, ancillary categories, physical components, unresolved quantities/SKUs and exclusions. Exact conditional quantity is not procurement readiness. External fiber/structured cabling is excluded explicitly, not zero or unnecessary. Keep both-end optical interface/plant requirements and their unknown compatibility impact; excluded fiber supply never implies a physically complete link or installation readiness. For this fixture, external management patch cabling is separately excluded too; that additional fixture choice is not a universal product exclusion.

## 6. Shared synthetic fixture for UX and reviewers

All IDs below are **SCX** synthetic design fixtures, not vendor SKUs, verified BF3 specifications, supported switch models or a recommended first slice. NIC modes/rates/independence are conditional givens. Units are each unless stated; population P-A or P-B has N physical servers, not N per network. Use N=1 and N=100 below. SC-A and SC-B are two classes, not mutually exclusive project types.

### SCX-CLASS: profile composition

| Class/revision or option | Per-server installed composition | Purchase treatment / unresolved details |
| --- | --- | --- |
| SC-A r1, base compute | 1 chassis bundle with 8 accelerator components, 2 PSUs, 1 rail kit and 1 integrated BMC; frontend: 1 DPU with 2×200G cages plus 1 management port; backend: 8 NICs each 1×400G cage; in-band: 1 NIC with 2×10G integrated ports; 2 arbitrary power cords; 1 license | Accelerators/PSUs/rail kit/BMC included in chassis only as explicit fixture assumption. All NICs/DPUs, cords/license separate. Exact chassis, NIC, optic and license models unknown. No GPU-to-NIC correspondence inferred merely from matching counts. |
| SC-A option FE-2S | Replace frontend DPU by 2 DPUs, each 1×200G cage and 1 management port | Same two frontend data links but two DPUs/management ports; no automatic independence guarantee. Do not also retain FE-1D's DPU. |
| SC-A option ST-on | Add 1 storage DPU with 2×200G cages and 1 management port | Separate purchase; absent in base. Unknown option is not assumed off. |
| SC-B r1, storage appliance | 1 chassis bundle including 2 PSUs, 1 rail kit, 1 BMC and 4 disks; 2 NICs each 1×100G cage; 2 power cords; 1 license | NICs/cords/license separate. No rail demand. Exact models unknown. |
| SC-B option DISK-8 | 8 disks installed instead of 4; base bundle still covers only 4 | Four extra disks per server purchased; do not double-count the included four or assume a new bundle silently. |

Each row uses slot IDs (e.g. `A/fe-dpu`, `A/be-nic`, `B/disk`), with numbered occurrence keys for repeated hardware. P-A/001 retains identity when choosing ST-on; its new storage DPU gets a new occurrence. FE-2S records replacement lineage and maps the two frontend demand roles to the new cages. Old frontend DPU orders remain commitments needing disposition; they are not deleted from stock accounting.

### SCX-ATT: several attachments from the same population

| Demand role | Port/member references per server | Fabric intent / destination | Media requirement and scope |
| --- | --- | --- | --- |
| A-FE | FE-1D cages 1,2 or FE-2S cage 1 on each of two DPUs | F-FE / LC-FE; separate leaf instances required by chosen redundancy intent | Two native optical links at assumed 200G; four detachable module requirements per server across both ends, no module sharing assumed; external fiber excluded |
| A-BE | 8 backend NIC cages, explicit rail relations r0…r7 | F-BE / LC-BE unknown model; plane undecided | Eight integrated straight 400G assembly requirements per server, each counted once with server and switch ends; SKU/type DAC vs AEC vs AOC/length unselected, no three-way sum |
| A-ST | ST-on DPU cages 1,2 only | New F-ST / new LC-ST, model unknown | Two native optical 200G links, four module requirements per server; fiber excluded |
| A-IB | in-band NIC ports 1,2 | F-IB, management ownership unresolved / leaf class unknown | Integrated PHYs: no added optic by fixture assumption; patch cabling excluded in this fixture |
| A-MGMT | server BMC plus each DPU management port | external F-OOB / no invented Hedgehog leaf or Connection family | 2 ports base FE-1D, 3 with FE-2S, add 1 with ST-on; patch cabling excluded |
| B-DATA | each of two NIC cages | F-FE / LC-FE-B (same fabric as LC-FE) | Two straight integrated 100G assembly requirements, one per link; exact SKU/length unknown |
| B-MGMT | integrated BMC | external F-OOB | One management port, patch cabling excluded |

F-FE is shared **by explicit selection** between the populations; unknown network memberships are not silently coalesced. LC-FE and LC-FE-B can have different model/configuration revisions; their existence supplies no switch count. F-ST may be saved before LC-ST exists. Create LC-ST in the server editor using F-ST's identity, then assign A-ST; canceling model selection leaves LC-ST's model unknown and preserves the rest of SC-A's edits. F-BE is not automatically an upstream Fabric/domain/plane.

### SCX-Q: 1 and 100 units

Parenthetical quantities are installed children covered by a bundle, not extra orders. “Module” totals include both server and switch sides; switch modules must not be added again in a switch view.

| Configuration | Servers | Frontend/storage DPUs | Backend / in-band NICs | Native optical links / detachable modules | Integrated assemblies | Management + in-band ports | Other quantities |
| --- | ---: | --- | --- | --- | ---: | --- | --- |
| A base, N=1 | 1 | 1 / 0 | 8 / 1 | 2 / 4 | 8 | 2 + 2 | (8 accelerators, 2 PSUs, 1 rail kit), 2 cords, 1 license |
| A base, N=100 | 100 | 100 / 0 | 800 / 100 | 200 / 400 | 800 | 200 + 200 | (800 accelerators, 200 PSUs, 100 rail kits), 200 cords, 100 licenses |
| A FE-2S + ST-on, N=1 | 1 | 2 / 1 | 8 / 1 | 4 / 8 | 8 | 4 + 2 | same base inclusions, 2 cords, 1 license |
| A FE-2S + ST-on, N=100 | 100 | 200 / 100 | 800 / 100 | 400 / 800 | 800 | 400 + 200 | same scaled base inclusions, 200 cords, 100 licenses |
| B base, N=1 | 1 | 0 / 0 | 2 data NICs / 0 | 0 / 0 | 2 | 1 + 0 | (4 disks, 2 PSUs, 1 rail kit), 2 cords, 1 license |
| B base, N=100 | 100 | 0 / 0 | 200 data NICs / 0 | 0 / 0 | 200 | 100 + 0 | (400 disks, 200 PSUs, 100 rail kits), 200 cords, 100 licenses |

An independent mixed-population view with 60 A base plus 40 B base yields **100 physical servers**, 60 frontend DPUs, 480 backend NICs, 60 in-band NICs, 80 B data NICs; 120 optical links/240 modules and 560 integrated assemblies. Distinct data links = 60×10 + 40×2 = 680. Management ports = 60×2 + 40 = 160; in-band =120. Included quantities: 480 accelerators, 160 disks, 200 PSUs, 100 rail kits; separate cords=200, licenses=100. Unknown SKU lines remain unknown, not omitted. Add ST-on to just ten A occurrences: +10 DPUs, +20 optical links, +40 modules, +10 management ports, **zero additional servers**.

**SCX-TRACE examples:** `P-A/001/be-nic/3` derives from P-A quantity and customization → SC-A r1 slot `be-nic` quantity 8. `P-A/001/A-BE/3` references that cage and assembly `ASM-A-001-3`; the switch-side schedule references the same assembly. The 100-unit aggregate has 800 unique assembly IDs, not 1,600 end records counted as cables. Module requirements for A-FE are distinct `.../FE/1/server-module` and `.../FE/1/switch-module`; profile slots define requirements, later exact instances discharge them. Trace each aggregate line to snapshot, class revision, customization/option, slot quantities, inclusion evidence and occurrence set.

**SCX-SW ancillary extension:** given an explicitly conditional eight-switch population (not inferred from eight NICs or one class), each bundle includes two PSUs and one fan tray; add two power cords and one license per switch. Result: eight switch bundles, 16 installed included PSUs, eight included fan trays, 16 separately ordered cords and eight licenses. The 400 A-base optical modules and 800 assemblies remain connection-owned requirements; do not add them again from switch incidence. Switch quantities/port budgets and actual models remain unproved.

**SCX-SPLIT accounting-only substitution:** for 100 A base, pair the 800 backend server cages into 400 two-tail assemblies with distinct switch parent cages configured 2×400G. This is an explicit alternative construction: 800 links, 400 assemblies, 1,200 occupied physical cages (800 server +400 switch), 1,600 logical terminations, no extra detachable optics. Parent budgets, pairing, reach and shared rail/plane failures are unverified; do not replace the straight construction automatically. Park one tail: keep one whole assembly and the reserved lane. Both ends naming `ASM-X` do not create two units.

### Comparison to parts evidence and unresolved scope

Cross-ticket fixture correspondence (proposal, not equality of datasets): SCX-CLASS SC-A/SC-B → parts SU-A/SU-B; FE-1D/FE-2S → FE-DUAL/FE-SPLIT; §3 fields → SU-FIELDS; SCX-Q/TRACE/SW/SPLIT → SU-COUNT. Parts’ SU-COMPARE supplies the engineer-facing comparison evidence; this addendum supplies identity/ownership. The posted [SU tables at 0230cd8][SU] permit the following explicit reconciliation; they do not make the datasets identical. Keep both fixture IDs/revisions in any comparison.

R05 §4 A independently specifies one native optical link as two modules; SCX A-base gives 2N links →4N modules. Its external jumper is disclosed as excluded here, not subtracted from required optical continuity. R05 §4 B specifies one integrated cable and no detachable modules per straight link; SCX gives 8N or 2N assemblies. R05 §4 C specifies two links/three cages/one integrated split assembly; SCX-SPLIT scales by 400. R05 §4 D warns that a real shuffle drawing can change ends and component counts: no generic shuffle configuration is added here. R05's kit/inclusion and stock invariants remain applicable.

| Fixture difference | SCX in this addendum | Parts SU at 0230cd8 | Counting consequence |
| --- | --- | --- | --- |
| A-base high-speed media | Two frontend optical links; eight backend integrated assemblies | Eight backend optical links; two frontend DACs | Per server: SCX four modules/eight assemblies; SU 16 modules/two assemblies. Both have ten high-speed links. |
| A-base adapter inclusion | Eight backend NICs and frontend DPU separately acquired; in-band is a separate two-port NIC | Base backend NICs/frontend DPUs covered by the bundle; two in-band ports integrated on board | Same selected attachment multiplicity does not imply the same acquired adapter lines. |
| A storage option | One two-port DPU plus management; four optical modules | One two-port DPU plus management; two AECs | Same extra device/port demands, different media purchases. Both retain one physical population. |
| B composition | Two single-port 100G NICs; no in-band port; four drives included | One dual-port 25G NIC; one in-band port; four drives separate | Two data links in both, but different devices, total attachments and bundle residuals. |
| Split substitution | Hypothetical replacement of all eight backend rails, pairing not qualified | Only r0 replaced; pairing explicitly confined to groups 64+36 | SCX 400 assemblies versus SU 50 split assemblies at N=100 is not a discrepancy. Neither establishes physical feasibility. |

Model's [independent review of SU](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6728297958) reconstructed occurrence sets at N=1/100 across all frontend/storage variants, unique shared requirements, covered adapters and split grouping/parked tails. It accepted conditional identity/composition/counting only. That review does not independently approve this authored SCX addendum, nor verify parts' vendor evidence. None of the configurations is qualified or orderable: exact parts, modes, firmware, switch counts/capacity, branch/length geometry, service mapping and current-target evidence remain open. A line may have exact conditional quantity while its SKU/compatibility remains unknown. Estimates of transceivers do not certify excluded plant; external dependencies remain blockers to relevant physical/installation claims.

## 7. Negative cases, verification and handoff

| Check ID | Positive / negative expectation | Source/owner |
| --- | --- | --- |
| SC-C1 physical identity | A has all six attachment roles when selected, still N servers / reject summing N for each fabric | S; model, parts review |
| SC-C2 nested/included quantity | 100 B DISK-8: 800 installed disks, 400 included, 400 extra / reject 800 extra or 400 installed | P §5; parts review |
| SC-C3 assembly uniqueness | 800 straight assemblies referenced by 1,600 ends / reject end-count purchasing | R05 §4; parts |
| SC-C4 mode ownership | two distinct parent lane groups / reject base-plus-lane alias or duplicate tail | R02 K03/R05 P01; compat |
| SC-C5 relationships | F-ST unknown model remains useful / conflicting F-FE selection plus LC-ST cannot silently move either fabric | P §4; model, compat |
| SC-C6 snapshots/options | edit ten existing A servers changes components, not population / deletion of ordered DPU needs disposition | D01 §3/5; model, parts |
| SC-C7 evidence | manual switch may support a conditional witness / reject “imported” label after changing source capability or override as qualification | R02/R05; compat |
| SC-C8 scope | modules included; external fiber excluded and unknown plant flagged / reject full installation or full-cabling claim | S 4449d14; parts |

Reproduce the arithmetic with Python 3; this is a document check, not a topology engine:

```python
for n in (1, 100):
    assert 2*n*2 == 4*n  # A base optical modules, both ends
    assert (2*n + 2*n)*2 == 8*n  # A with separate storage
    assert (2+1+1)*n == 4*n  # FE-2S, storage DPU, server BMC
assert 60+40 == 100
assert 60*8+40*2 == 560
assert 60*2*2 == 240 and 60*10+40*2 == 680
assert 60*2+40 == 160
assert 100*8-100*4 == 400  # B extra disks
assemblies = {f'ASM-A-{s}-{p}' for s in range(100) for p in range(8)}
end_rows = [(a,e) for a in assemblies for e in ('server','switch')]
assert len(end_rows) == 1600 and len({a for a,e in end_rows}) == 800
assert 400*2 == 800 and 400*3 == 1200 and 800*2 == 1600
assert 8*2 == 16  # explicit conditional switch population's cords
print('SCX conditional arithmetic and assembly identity checks passed')
```

Document checks performed: embedded Python arithmetic/assembly identity assertions passed; pinned hh-aid artifact paths resolved with `git cat-file -e`; reference definitions, Markdown table widths and code fences checked; staged `git diff --check` passed. These are author checks, not independent acceptance. No upstream tests, hardware qualification, user evaluation or production regeneration/migration tests are claimed. Required future tests also include repeated-create duplicate prevention, cancellation with unsaved edits, three-way profile conflict, population splitting with preserved IDs, shared module allocation and cross-package supply uniqueness.

**Unresolved fields for parts/compat, without blocking this draft:** exact family/OEM variants and DPU port arrangements; component SKU/revision and bundle inclusion coverage; electrical/optical mode, firmware/FEC and channel map; integrated assembly type/length/branch geometry; switch profile/role/configured budgets and ancillary inclusion; project-specific product-fabric to upstream installation/Fabric/domain/service mappings (the within-installation shape is now reconciled in §4); cross-installation support authority; current supported composition and qualification scope. Actual failure guarantees, optical plant and authority-approved overrides remain site/domain inputs. No inventory, capacity, or supported mapping is invented to fill these fields.

Acceptance mapping: server identity/edit/reuse → §2; nested simultaneous attachments → §3 and SCX-ATT; arbitrary BOM/bundles/shared assembly/100 units → §5 and SCX-Q/TRACE/SW/SPLIT; in-context fabric/leaf classes → §4 and SCX-ATT; source/manual switch provenance → §4; small UX fixture/partial completeness → §6; snapshots/history/negative cases → §2/7. **Overall disposition and this reconciliation delta remain pending.** Parts accepted the prior `fb06179` composition/counting scope; this delta preserves those fixture quantities. Topo is the designated independent reviewer of bridge’s source report. Lead coordinates acceptance of the reconciled mapping in this addendum separately; UX can use the synthetic table IDs with the stated unknowns. Do not close #8 or treat this draft as support certification. No broad D01 rewrite or library population is proposed.

[D01]: https://github.com/afewell-hh/hh-aid/blob/3d313fe53bf8d3060751694e6c7185803c316a66/docs/design/domain-model.md
[R05]: https://github.com/afewell-hh/hh-aid/blob/8a8fccac6b6d560ef17889c4819dce3b8bf19a8c/docs/research/hardware-and-bom.md
[R02]: https://github.com/afewell-hh/hh-aid/blob/bf7437c3fc852cfe06663073edc36a08de75efbc/docs/research/hedgehog-support-contract.md

[SU]: https://github.com/afewell-hh/hh-aid/blob/0230cd8690c3eb43454424a70d95611e44ada35d/docs/research/server-unit-bom.md
[FP]: https://github.com/afewell-hh/hh-aid/blob/b4329a5f8107ef8bf64ede045992187461f552da/docs/research/fabric-profile-contract.md
[RC]: https://github.com/afewell-hh/hh-aid/blob/b4329a5f8107ef8bf64ede045992187461f552da/docs/research/release-currency.md
