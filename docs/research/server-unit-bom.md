# Server-unit BOM and physical comparison contract

Author: t8 / parts. Date: 2026-11-08. Assignment: [#6 follow-up](https://github.com/afewell-hh/hh-aid/issues/6#issuecomment-6726545710). Status: bounded proposal for independent review by **existing t10 / model**, then lead; not a production schema, UI, catalog or hardware qualification.

## 1. Boundary and evidence

**S (sponsor direction):** [product context at main 4449d14](https://github.com/afewell-hh/hh-aid/blob/4449d14bb9019310da476ed2608ddc4850a8c376/docs/product-context.md) establishes server classes, concurrent networks, arbitrary per-unit items, BOM-first delivery and the new cabling boundary. A Server means every non-switch device, including appliances. Family, reusable class/profile revision and project customization remain distinct; network membership does not create additional populations of the same server.

**P (proposal/synthetic arithmetic):** all field requirements, fixture values, filtering and presentation below are proposed contracts. **D:** vendor-documented facts are confined to SU-EVIDENCE. **Q:** unknowns remain explicit. No maintainer intent or interview is inferred.

Retain [accepted R05 at 8a8fccac6b6d560ef17889c4819dce3b8bf19a8c][R05] for identity, bundle, maintenance and qualification reasoning. Its separate-fiber counts are historical examples, **not a requirement to deliver external cabling BOMs**. This addendum includes server/component line items, detachable transceivers and integrated DAC/AEC/AOC (and explicitly selected ACC) assemblies. External fiber jumpers, trunks, panels, shuffle-fiber specification, route construction and passive management patch leads are excluded from this example package. Retain their interface/dependency assumptions without selecting quantities/SKUs for those external purchases. Excluded is not zero and does not mean unnecessary. An integrated AOC remains in scope even though its internal medium is fiber.

Here “complete” means **complete for the declared server-and-attachment package under the selected assumptions**, not a complete fabric/project BOM or an installable system. Remote attachment optics/assemblies are included; leaf/spine/control/OOB switch chassis, their unrelated accessories, inter-switch links, external plant and site work are explicitly separate packages. Unknown device/model/capacity requirements for those packages stay unresolved. Do not hide them under a global ready badge.

Historical upstream basis remains Fabric v0.144.1 `4bde50829fd7cfebac69332982abd1dee504a8a3`, Fabricator v0.51.4 `d2316aca666eb278541276a11a5f8dae372bf629`, docs `1be68948e177dcc031e91659ab5293ba19893ccf`, via R05. Those pins do not assert today's installation target. Latest supported release composition and tuple applicability must be checked separately before claiming current support. No such claim or new upstream execution is made here. D01 [3d313fe][D01] is a coordination input for requirement/instance reconciliation, not independently approved here.

### SU-EVIDENCE — bounded real examples

Primary pages opened 2026-11-08; these are mutable URLs. Record document revision/access date and source section, and obtain permitted retained evidence/digest before a frozen qualified catalog claim. Search snippets alone were not used to qualify a device.

| ID | Real model and directly documented property | What it does not prove |
| --- | --- | --- |
| E1 | [Cisco 100G module sheet][C100], updated Nov 6 2026, portfolio: `QSFP-100G-SR4-S`, 100G SR4, MPO-12, 100 m over OM4; `QSFP-100G-LR4-S`, 100G LR4, duplex LC, 10 km SMF. Same rate, different optical interfaces. | Host compatibility, interchangeability between PMDs, or any Hedgehog pairing. |
| E2 | [NVIDIA MMA1Z00-NS400 specification][N400], introduction/key features, revision not displayed in retrieved six-page PDF: single-port QSFP112, 400G SR4, four 100G-PAM4 channels, MPO-12/APC, OM4 maximum 50 m (OM3 30 m), 9 W maximum in four-channel mode. | Same “SR4” suffix as a 100G optic does not establish compatibility; channel facts do not qualify a chosen OEM/NOS. |
| E3 | [Cisco 400G sheet][C400], updated Mar 3 2026, portfolio: `QDD-400G-DR4-S` uses parallel SMF/MPO-12 APC, 500 m; `QDD-400G-FR4-S` uses duplex SMF/LC PC/UPC, 2 km. | “4” does not mean four separate Ethernet links or the same external fiber arrangement. |
| E4 | Same [400G sheet][C400]: `QDD-2Q200-CU3M` is a 400G QSFP-DD to two QSFP56 200GBASE-CR4 copper assembly, 3 m. `QDD-400-AOCxM` is an integrated AOC family. | A device cage must support the actual mode/host interface; splitter children are not independent parent cables. No suggested host tuple is qualified. |
| E5 | [NVIDIA MCA7J60 specification][NACC], revision history 1.3 Sep 2024, overview/order table: `MCA7J60-N004` is 800G twin-port OSFP to two 400G OSFP ACC, 4 m. Its described switch/adapter-end cooling differs. | ACC is not automatically AEC, DAC or a qualified DS5000 product; names/rates do not remove mechanical/firmware checks. |

These are representative real parts for comparison, not selections in SU-A/SU-B. QSFP28/56/112, OSFP and QSFP-DD labels are form/interface-family inputs, not universal speed or backward-compatibility rules. Store exact electrical modes separately. Likewise SR/DR/FR/ZR and SR2/SR4/DR2/DR4 shorthand must be expanded to the exact rate, PMD/standard revision, channels/wavelengths and supplier evidence. SR2/DR2/ZR combinations not verified here remain unknown; do not complete a product catalog by analogy. Electrical lane bit rate and symbol rate are separate quantities; record whether a rate is nominal or encoded. Ethernet Gb/s is not GB/s or double-counted full duplex.

## 2. SU-FIELDS — minimal reusable matrix

`R` means needed for the stated claim, not required to save an incomplete project. Unknown values carry reason/owner and affected result; zero and not-applicable are different. Every fact has source URL/section/version/access date or actor/input revision, units, evidence scope, and assumed/supplied/derived status. Conflicting/stale flags and compatibility/support verdicts remain independent. Evidence is attached per field, not just to an entire model name.

B = affects quantity/identity, C = capacity or feasibility calculation, F = comparison/filter. These are conceptual fields, not a prescribed storage format.

| Stable field group | Values and units | Required versus unknown | Effect |
| --- | --- | --- | --- |
| SF01 identity | family ID; class/profile revision; project customization ID; population ID/count (integer servers); occurrence keys | R for exact expansion; count can remain expression while saving | B,C |
| SF02 component | line ID, parent component path, part ref (real SKU/revision or generic ID), quantity **per immediate parent** (unit/kit/license etc), activation predicate | R for counted line; generic class allowed, SKU unknown blocks ordering | B; C only when topology-participating |
| SF03 accounting | quantity basis (`per-parent`, `shared-requirement`, `fixed-project`), scope, included-by bundle/line, separately purchased, unresolved inclusion, pack/order unit | R for purchase totals; unclear bundle inclusion yields alternative/unresolved total, not suppression | B |
| SF04 NIC/DPU/port | component multiplicity, logical port ID, parent cage ID, GPU/rail relation, configured/supported mode, reserved/active groups | R for attachment counts/feasibility; NIC model may be generic in estimate | B,C,F |
| SF05 host interface | cage/form factor, electrical lane count, nominal/encoded Gb/s per lane, signaling, baud where known, FEC/autoneg, power W/cooling, firmware/driver | R for tuple qualification; partial facts permit explicit unknown comparison | C,F |
| SF06 optical interface | exact PMD/rate/standard, optical channels and wavelengths, parallel/WDM arrangement, fiber type, reach m and applicable loss bounds dB | R for optical compatibility; not-applicable for integrated copper; unknown is not generic “SR compatible” | C,F; B when changing construction |
| SF07 connector | optical connector, polish, gender/keying, fiber positions used and bidirectional map/polarity; separate host plug and optical connector | R for qualified optical path; external cable SKU remains outside scope | F,C |
| SF08 module/assembly | detachable module instance/requirement ID or integrated assembly ID; end IDs, end→owner/cage/group map, internal channel map, whole replacement unit, route/length/branch bounds m | R for exact construction count; generic lengths/geometry may be unknown in estimates | B,C,F |
| SF09 attachment intent | network role; product fabric ref or unresolved intent; destination leaf-class ref or unknown; plane, rail/domain, redundancy/failure constraints | R only to the detail needed by witness; never conflate upstream Fabric/domain/plane | C,F |
| SF10 governance | qualification tuple/version, support source/target, unknowns, deliberate selection/override rationale+actor+time, committed quantity, price currency/date | R for applicable readiness/current price claim; no price needed for quantities | B,F |

Ancillary line SF02 may have `topology_participating=false`; quantity still expands. Switches and other owners use the same association rule. A rack-kit quantity in **kits** must not be confused with individual rails or mounting screws. No implicit disassembly of a kit into purchase lines.

Shared requirement IDs exist before exact printed switch ports. A capacity/construction witness can allocate to a compatible interchangeable cage group; if cage power/pipeline/geometry changes the answer, keep counts conditional until that assignment is resolved. A complete wiring export is not a prerequisite to the first useful BOM.

## 3. SU-A — configurable family and simultaneous network profile

**Entire fixture P, generic and unqualified.** Family `F-ACC8` is an eight-accelerator server concept inspired by sponsor HGX examples, not a verified HGX/DGX/OEM SKU. Reusable class `C-A@1` has project customization `PC-A@1`, population `POP-A=N`. One server identity owns all interfaces below.

Two independent choices: `FE=DUAL` (one generic dual-port DPU) versus `FE=SPLIT` (two generic single-port DPUs), and `S=0/1` for a separate storage DPU. BF3 shorthand does not certify either actual product arrangement. Changing these choices creates a new profile/customization revision, preserves edits, and does not alter N. Alternative profiles are not summed.

### SU-A-PORTS (per server)

| Role and stable paths | Nested devices / active ports | Physical fixture inputs | Destination and accounting |
| --- | --- | --- | --- |
| Frontend `fe.dpu[k].p[j]` | DUAL: 1 DPU ×2 ports; SPLIT: 2 DPUs ×1 port =2 links either way | Each port has its own generic QSFP56 cage at 1×200G; four nominal 50G electrical lanes assumed, FEC/firmware unknown | `FAB-FE`, `LEAF-FE` class, distinct leaf-instance intent; 2 independent generic integrated DAC requirements/server |
| Optional storage `st.dpu0.p[0..1]` | S ×1 dual-port DPU ×2 ports | Same **assumed** 200G cage class; no product equivalence claim | `FAB-ST`, `LEAF-ST` unresolved model; 2S integrated AEC requirements/server |
| Backend `be.nic[r].p0`, r=0…7 | 8 NICs ×1 port each; one explicit GPU/NIC rail r | Each has a generic QSFP112 cage at 1×400G, four nominal 100G electrical lanes assumed; one detachable generic 400G optical module/cage | `FAB-BE`, `LEAF-BE`, plane P0; baseline remote native 400G cage and one separate optic per link, 8 server +8 remote optics/server |
| In-band `board.ib[0..1]` | Integrated board interfaces ×2 | 10GBASE-T, integrated RJ45 PHY, no pluggable module assumed | `NET-IB`, management leaf class unresolved; passive patch leads excluded |
| Host BMC `board.bmc0` | 1 interface | 1G Ethernet integrated RJ45 assumed | `NET-OOB`, unmanaged external inventory |
| DPU BMC `fe/st.dpu[k].bmc0` | One per **physical DPU**, D=`f+S`, f=1 DUAL or 2 SPLIT | 1G Ethernet integrated RJ45 assumed; not a new Server population | `NET-OOB`; D interfaces and external connection requirements |

Backend optic PMD, reach, connector and polarity are **unknown generic fields** here; the QSFP112 cage assumption alone does not resolve them. FE/storage DAC/AEC end form factors at remote leaf and lengths remain unknown; two native matching remote cages per role are the assumed quantity witness, not a chosen switch model. Distinct frontend leaves do not prove host/DPU/assembly independence. Plane P0 is fixture intent, not an upstream domain mapping.

Data links per server = `8+2+2S+2 = 12+2S`; OOB links = `1+f+S`; total = `13+f+3S`. Optical/pluggable or integrated high-speed attachments = `10+2S` per server; integrated RJ45 terminations = `3+f+S`. User can retain fabric intent without choosing a leaf model. Multiple leaf classes may reference the same fabric; selecting a leaf class resolves its fabric only from its explicit association, never by copying the population. In-context creation/reuse must preserve entity IDs and existing edits.

### SU-A-ITEMS / SU-COUNT-A — baseline DUAL, S=0

All part IDs starting `G-` are unresolved generic requirements. Inclusion is a **fixture assumption**, not a manufacturer's bundle promise. No spare, stock, outstanding order, pack rounding or price assumption is hidden in these numbers.

| Line ID / item (unit) | Derivation | Installed/included view: 1 / 100 servers | Additional purchase view: 1 / 100 |
| --- | --- | --- | --- |
| A00 `G-SERVER-A` base bundle (server) | N | 1 / 100 | 1 / 100 bundle requirements |
| A01 FE DPU (device) | N×1 | 1 / 100, included by A00 | 0 / 0 additional; retain child visibility |
| A02 BE NIC (device) | N×8 | 8 / 800, included by A00 | 0 / 0 additional |
| A03 board IB/BMC interfaces (port) | N×(2+1) | 3 / 300, board included by A00 | 0 / 0; interfaces are not modules |
| A04 accelerators (device) | N×8 | 8 / 800, included by A00 | 0 / 0 additional |
| A05 mounting kit (kit) | N×1 | 1 / 100, included by A00 | 0 / 0 additional |
| A06 data SSD (drive) | N×2 | 2 / 200 | 2 / 200 separate generic drives |
| A07 arbitrary accessory (unit) | N×3, topology=false | 3 / 300 | 3 / 300 separate generic items |
| A08 server BE optic (module) | N×8 NICs×1 optic | 8 / 800 | 8 / 800; not included in A02/A00 |
| A09 remote BE optic (module) | 8N optical links×1 remote module | 8 / 800 | 8 / 800, connection-owned requirement, not per-switch default |
| A10 FE DAC (assembly) | 2N unique link constructions | 2 / 200 | 2 / 200, two ends each; zero added optics |

Base chassis, compute/memory/PSU internals not enumerated above are covered by the declared base bundle, with exact SKU/content still unknown. “Included” suppression is valid only for that fixture coverage. If bundle inclusion becomes unknown, show purchase total unresolved; do not silently keep zero additional parts.

For 1 / 100 baseline servers: physical NIC/DPU devices =9 / 900; total Ethernet links =14 / 1,400, composed of 12 / 1,200 data and 2 / 200 OOB. BE optical links =8 / 800, detachable optics across both ends =16 / 1,600; integrated FE assemblies =2 / 200. These totals are **exact conditional counts**, not qualified SKUs. Management patch leads remain excluded and visible as external dependencies for 4 / 400 RJ45 attachment demands. Do not add the same remote optic again to a leaf BOM; it is the same requirement ID viewed from another owner.

### SU-A-OPTIONS — independent variant deltas and totals

| Variant | Physical DPUs 1 /100 | Total links 1 /100 | RJ45 demands 1 /100 | Delta purchase requirements versus baseline |
| --- | --- | --- | --- | --- |
| DUAL, S=0 | 1 /100 | 14 /1,400 | 4 /400 | Baseline above |
| SPLIT, S=0 | 2 /200 | 15 /1,500 | 5 /500 | Base bundle variant includes 2 FE DPUs; same 2 FE DACs, no additional separate FE DPU purchase under this fixture inclusion |
| DUAL, S=1 | 2 /200 | 17 /1,700 | 5 /500 | +1 /100 separately purchased storage DPU; +2 /200 AEC assemblies; BE optics and FE DACs unchanged |
| SPLIT, S=1 | 3 /300 | 18 /1,800 | 6 /600 | Both preceding choices; same storage delta, FE bundle changes |

Optional storage's DPU is separate from the base bundle, while its BMC interface is included within that DPU. Its two AECs are distinct shared connection units, not DPU children to purchase twice. Disabling storage removes only storage demands/requirements from the new revision; retained commitments and overrides require explicit disposition. SPLIT changes the number of DPU management interfaces and common-device failures, not the frontend link count. No synthetic variant is designated the first production slice.

## 4. SU-B — distinct appliance server class

**P:** `F-APPLIANCE` / `C-B@1` / `PC-B@1`, independent population `POP-B=M`. Generic storage/utility appliance, no GPU/rail fields required. One dual-port 25G NIC, two independent SFP28 cages/ports at 1×25G (one nominal 25G electrical lane assumed), one board in-band 1G RJ45 and one BMC 1G RJ45. Two data ports attach to distinct intended leaf instances of `LEAF-B` in `FAB-B`; generic integrated 25G AOCs selected as a construction assumption, exact models/reach/host support unknown. OOB remains external; in-band network distinct.

### SU-COUNT-B

| Line | Quantity rule | Installed: 1 /100 | Purchase: 1 /100 |
| --- | --- | --- | --- |
| B00 base appliance (server bundle) | M | 1 /100 | 1 /100 |
| B01 dual-port NIC (device) | M×1, included B00 | 1 /100 | 0 /0 additional |
| B02 integrated board mgmt interfaces (port) | M×2, included B00 | 2 /200 | 0 /0 |
| B03 mounting kit (kit) | M×1, included B00 | 1 /100 | 0 /0 additional |
| B04 drive (drive) | M×4, topology=false | 4 /400 | 4 /400 |
| B05 license entitlement (license) | M×1, topology=false | 1 /100 | 1 /100; actual license terms unresolved |
| B06 integrated AOC (assembly) | 2M unique connection requirements | 2 /200 | 2 /200; zero separately purchased end optics |

Four links/server: 2 data, 1 in-band, 1 BMC. External passive management leads are excluded for 2 /200 demands. AOC internal optoelectronics must not generate a second “two optics per link” line. Two server classes coexisting with N=M=100 give **200 servers**, not a server count for every network: baseline A+B have 1,800 total attachment demands, 1,600 detachable BE optics, 200 FE DACs and 200 B AOCs. Components aggregate only by identical part/class revision, units and construction; do not merge all “cables” into an orderable SKU. Switch-associated ancillary items use the same per-parent rule: K switches with 2 separately bought generic PSU spares per switch require 2K units, conditional on explicit policy and no factory-inclusion overlap; K is unresolved here, never zero.

## 5. SU-SHARED — assembly and bundle ownership rules

Every count-bearing requirement has exactly one identity and one purchase owner/scope. Server/leaf/rail views reference it; ownership does not mean only one end benefits. Shared quantities are derived from the selected connection construction and never independently multiplied under both server and switch. Each requirement records which port demand and component occurrences discharge it. The per-unit convenience view may show “participates in assembly H”; it must not bill H again. Ancillary items that do not calculate topology still have counted identities and units.

### SU-SPLIT — 1 and 100 units, changing only SU-A rail r0 construction

Replace baseline r0's two detachable optics per server with generic integrated `G-800-to-2x400` split assemblies. All other seven rails and FE choices stay baseline. One switch parent cage exposes two 400G groups; physical ends P/X/Y; X serves a server r0, Y a second server r0. **Assume** geometry and rail-domain pairing feasible for arithmetic only. For 100 servers, groups of 64 and 36 preserve pairs within groups: 32+18=50 assemblies. No cross-domain pairing is silently used.

| Quantity | 1 server | 100 servers |
| --- | ---: | ---: |
| Active r0 links / server cages | 1 /1 | 100 /100 |
| Integrated split assemblies / parent cages | 1 /1 | 50 /50 |
| Physical assembly ends | 3 (one child parked) | 150 |
| Configured parent logical groups | 2 (one reserved) | 100 |
| Remaining detachable optics, other seven rails | 14 | 1,400 |
| FE DAC assemblies, unchanged | 2 | 200 |

Rule is ceil(N/2) **only for this pairing witness**, not universal ceil(link count/branches). One server still needs the whole three-ended assembly; parked Y is not stock. Two server views referencing the same H count one H. The parent/assembly is a shared failure and maintenance unit for both links; assigning separate plane labels cannot make it independent. Two independent cables cannot occupy the parent cage. Duplicating group 0 or pairing outside qualified geometry creates a conflict even with correct totals.

Optical alternative for two active links: one twin-engine parent module plus two child modules gives **three**, not four, detachable modules; external fiber requirements are disclosed but not emitted as BOM items. This replaces the integrated construction, not an addition. A passive shuffle is similarly an excluded external-plant dependency under this delivery boundary; preserve end/group interface and shared-failure information. If a genuine integrated multi-ended AOC is selected instead, one assembly is counted, with actual vendor end/channel map and zero extra detachable modules. No such purchasable shuffle is invented here.

Bundles apply at every depth. Example: a NIC kit contains its two detachable modules; installed view shows NIC +2 modules, purchasing view shows one kit and zero additional modules for those occurrences. Suppress children only when the purchased ancestor explicitly covers those IDs and quantities; “same SKU” is not enough. A separately purchased spare of the same SKU is a different occurrence. An installed optic and a port's requested optic must reconcile to the same occurrence when coverage is satisfied, not become two components. Insufficient included quantity produces a separate residual requirement. Ordered/delivered units, stock allocations and package exclusions follow accepted R05; locks cannot erase compatibility conflicts.

## 6. SU-COMPARE — engineer review and explainable filters

Proposed view: persistent server-profile editor with expandable NICs, physical cages, logical groups and installed/planned components; adjacent comparison of the selected server termination, construction and remote leaf termination. Per-server BOM, population-expanded BOM and shared-unit references remain available without leaving the profile. This is task content for ux, not a choice between canvas and tables. Show missing remote models/fabric intent rather than forcing final switch selection.

### SU-COMPARE-1: same-rate optical mismatch (real components, hypothetical hosts)

| Field | End A | End B | Judgment |
| --- | --- | --- | --- |
| Owner/cage | Server A, generic host cage unknown | Leaf B, generic host cage unknown | Host/module tuple unverified; no Hedgehog support assertion |
| Selected module | Cisco QDD-400G-DR4-S (E3) | Cisco QDD-400G-FR4-S (E3) | Real models, not a qualified pair |
| Ethernet rate | 400G | 400G | Rate matches only |
| Optical arrangement | DR4 parallel SMF, MPO-12 APC | FR4 duplex SMF, LC PC/UPC | Mismatch for proposed direct matching-PMD construction; connector adapter alone does not convert PMD |
| Nominal reach class | 500 m | 2 km | Longer reach does not resolve PMD mismatch; site path unknown |
| Host electrical/FEC/firmware | Required values unknown | Required values unknown | Unverified, not inferred from form factor |
| Purchase effect | 1 detachable module | 1 detachable module | Two modules conditional; external plant excluded, incompatibility visible |

Resolution options: choose a documented matching-PMD pair with qualified hosts/plant, or retain the mismatched design as an explicitly unresolved engineering alternative. Neither “same 400G” nor manual override makes this link qualified.

### SU-COMPARE-2: partially specified candidate

Server port selects real E2 `MMA1Z00-NS400`; remote port selects generic `G-400G-SR4` with unknown cage, power and PMD evidence. Display E2's documented facts from SU-EVIDENCE beside every unknown remote field. Verdict: **unverified candidate**, not match. Engineer may retain it while investigating; quantity estimate remains two generic/real module requirements only if separate-module construction is selected. Selecting an integrated AOC instead replaces those two requirements through a recorded construction delta.

### SU-FILTER rules (P; owner parts/model, independent review pending)

| Rule ID | Applicability / strength | Behavior and reason shown; positive / negative example |
| --- | --- | --- |
| CF1 | Hard structural count, all constructions | One occupancy per cage/group; integrated parent unique; assembly ownership reconciled. SU-SPLIT's P with groups 0/1 passes accounting; two parent cables in that cage fail. |
| CF2 | Evidence-backed incompatibility, both-end comparison | Check full host electrical, module PMD and connector/medium path, firmware/FEC, power and supported mode; cite conflicting fields. Known mismatches excluded from compatible-results list, inspectable in explicit “show mismatches” view. COMPARE-1 is not rescued by equal speed. |
| CF3 | Unknown evidence, any missing relevant fact | Keep candidate under “needs evidence”, list missing fact and what claim it blocks; never treat absent field as wildcard-compatible. COMPARE-2 retained for estimate, not qualification. |
| CF4 | Form factor/rate/PMD search, advisory narrowing | Filter on supplied exact values with source; distinguish physical fit from host support. E1 100G SR4 and E2 400G SR4 cannot match solely on SR4; numerical suffixes alone do not identify fiber topology or Ethernet port count. |
| CF5 | Reach/geometry, hard for qualified assembly | Check approved route/branch bounds and vendor length definition where applicable. Missing plant can block qualified optics despite excluded fiber purchasing. No arbitrary default cable length or automatic round-up across branches. |
| CF6 | Engineer selection/override, retained history | Record original warning, chosen value, rationale, actor, revision and affected outputs. Preference override can resolve preference; evidence mismatch remains mismatch, unknown remains unknown. Known-invalid proposal can be saved but never silently exported as qualified/procurement-ready. |
| CF7 | Hardware/software support, separate gate | Source-derived switch profile, locally modified, manual and placeholder entries have distinct origins and explicit support states. Manual capabilities inform comparisons but do not grant Hedgehog support. Changing target release marks dependent evidence for review; an old pin is provenance only. |

A filtered list must explain “why visible/hidden”, whether values were supplied or assumed, evidence dates and remaining unknowns. Compatibility views cover selected facts, not comprehensive prevention/certification. User customizations remain visible; a new catalog revision offers a diff rather than overwriting them. No filter may hide a locked/ordered incompatible item from the conflict view.

## 7. Shared fixture IDs, checks and handoff

Stable table IDs: **SU-FIELDS**, **SU-EVIDENCE/E1–E5**, **SU-A-PORTS**, **SU-A-ITEMS/SU-COUNT-A**, **SU-A-OPTIONS**, **SU-COUNT-B**, **SU-SPLIT**, **SU-COMPARE-1/2**, **CF1–CF7**. Consumers should bind to this report commit plus table/line ID. A00–A10 and B00–B06 are line identities, not real SKUs. Occurrence key proposal: `(population ID, server occurrence, component path, occurrence index)`; link/construction requirements reference these keys. Do not infer a new server occurrence from each fabric membership. Family revision updates must not replace project customization without reviewed lineage/diff. Tables are the shared fixture data for this bounded pass; no new implementation format is adopted.

Independent reconstruction: use N/M, f and S above, expand immediate-parent multiplicities once, retain included child counts, then deduplicate shared requirement IDs and suppress only covered purchase occurrences. Compare disjoint variants separately. Verification can execute the following arithmetic only; this is not a compatibility engine or upstream test.

```python
from math import ceil
for n in (1, 100):
    assert 8*n + 8*n == 16*n  # baseline BE optics at both ends
    for f in (1, 2):
        for storage in (0, 1):
            dpus = (f + storage)*n
            data = (12 + 2*storage)*n
            oob = (1 + f + storage)*n
            assert data + oob == (13 + f + 3*storage)*n
            assert (3 + f + storage)*n == 2*n + oob
            assert dpus + 8*n == (8 + f + storage)*n
    groups = (n,) if n <= 64 else (64, n-64)
    split = sum(ceil(g/2) for g in groups)
    assert split == {1: 1, 100: 50}[n]
    assert 2*split-n == {1: 1, 100: 0}[n]  # parked/reserved group
    assert 16*n-2*n == 14*n
# Two owner views of H1 must not produce two purchases.
owner_refs = [('srv1', 'H1'), ('srv2', 'H1'), ('leaf1', 'H1')]
assert len({assembly for owner, assembly in owner_refs}) == 1
assert 1400 + 400 == 1800 and 100 + 100 == 200
print('SU count and shared-identity checks passed')
```

Expected output: `SU count and shared-identity checks passed`. Negative expectations for reviewer: multiply POP-A per fabric → duplicate servers; bill A08 plus the identical installed optic occurrence → duplicate coverage; count integrated AOC ends as additional modules → duplicate purchase; replace unknown bundle inclusion with zero → unsupported quantity; infer assembly count before branch witness → conditional not qualified; change FE to SPLIT but retain baseline BMC count → missing management interface. These are independent review prompts, not claims of executed application tests.

Verification performed: the Python block above executed successfully on 2026-11-08; Markdown reference definitions and table column consistency were checked, and staged `git diff --check` passed. Primary vendor sources were opened for the bounded facts in SU-EVIDENCE. No application, upstream validator or hardware tests were run.

Acceptance mapping: field/provenance boundary → §2; configurable simultaneous networks and second class → §3–4; reproducible 1/100 quantities and bundles/shared units → §3–5/7; real evidence and engineer comparison/filter behavior → §1/6; shared fixture IDs → §7. Latest release and exact SKU qualification are deliberately unresolved, not acceptance claims. Scope labels identify every excluded package/dependency; unknown in-scope SKUs remain line items, never omitted.

Open decisions: exact OEM/DPU/NIC/host tuple and bundle contents; actual electrical/FEC/PMD/firmware evidence; branch pairing feasibility; destination leaf-class/fabric semantics and target-release support; plant/interface assumptions provided externally; intended first-BOM readiness; permitted engineering override/approval workflow. The sponsor's examples do not settle them. No full catalog, solver, production UI, external purchasing, deployment, outreach or hardware certification is delivered.

Next: lead dispatches existing t10 / model to reconstruct counts and ownership against these IDs, then lead reconciles with ux and current contract work. Independent disposition is pending; author does not close #6 or self-approve. No new sessions requested.

[R05]: https://github.com/afewell-hh/hh-aid/blob/8a8fccac6b6d560ef17889c4819dce3b8bf19a8c/docs/research/hardware-and-bom.md
[D01]: https://github.com/afewell-hh/hh-aid/blob/3d313fe53bf8d3060751694e6c7185803c316a66/docs/design/domain-model.md
[C100]: https://www.cisco.com/c/en/us/products/collateral/interfaces-modules/transceiver-modules/datasheet-c78-736282.html
[N400]: https://docs.nvidia.com/networking/display/nvidia-mma1z00-ns400-400gb-s-single-port-qsfp112-multimode-sr4-transceivers-product-specifications.pdf
[C400]: https://www.cisco.com/c/en/us/products/collateral/interfaces-modules/transceiver-modules/datasheet-c78-743172.html
[NACC]: https://docs.nvidia.com/networking/display/mca7j60-nxxx-800gbs-twin-port-osfp-to-2x400gbs-osfp-acc-splitter-product-specifications.pdf
