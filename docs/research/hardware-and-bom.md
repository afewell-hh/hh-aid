# R05: hardware profiles and physical connection BOM semantics

Author: **t8 / parts**. Research date: 2026-11-07. Assignment: [#6](https://github.com/afewell-hh/hh-aid/issues/6), [lead dispatch](https://github.com/afewell-hh/hh-aid/issues/6#issuecomment-6713220959).
Status: bounded research ready for independent review; no hardware qualification, product policy, architecture or implementation approved.
Independent reviewers: **existing t6 / topo** for allocation/accounting; **t9 / ops once instantiated by sponsor** for installation/reach. Lead coordinates review. Author cannot satisfy the independent-review criterion.

## 1. Scope, evidence and result

The catalog must identify both **logical connectivity and the physical units that implement it**. One Connection can contain several links; one cage can expose several logical ports; one purchased assembly can carry several links. None of those counts can substitute for another. This report proposes catalog requirements and four bounded accounting witnesses, not an exhaustive SKU catalog or a deployment BOM.

Labels: **F** = observed pinned code; **D** = vendor/upstream documentation; **P** = proposed hh-aid requirement or synthetic fixture; **Q** = unresolved. Calculations are explicitly derived. No inferred maintainer intent is needed for these conclusions. Source inspection is not hardware execution.

| Baseline | Exact version and use |
| --- | --- |
| Fabric | v0.144.1 / `4bde50829fd7cfebac69332982abd1dee504a8a3`: profiles, API mappings and validation [F-profile], [F-switch], [F-server] |
| Fabricator | v0.51.4 / `d2316aca666eb278541276a11a5f8dae372bf629`: working integration baseline inherited from R03; no CLI run in R05 |
| Hedgehog docs | `1be68948e177dcc031e91659ab5293ba19893ccf`: supported roles and DS5000 operational caveats [D-devices], [D-limits]; working release 26.05, not an approved support window |
| R01 | [75fe3edccafc756c6b92ad44dff9b71af73d3138][R01]: S3/S4/S5 proposals, challenged in §6 |
| R02 | [bf7437c3fc852cfe06663073edc36a08de75efbc][R02]: support contract, especially C18/C21, K03/K04/K09 |
| R03 | [2b547901413c00fb8d7ce3eeff7d6669f2b78135][R03]: profile reuse and CLI limitations |
| R04 | [49e6079a077d1d819d12485de3896a93e8371f74][R04]: H400/H800/H200 and S01–S06; quantities remain conditional |

Primary vendor evidence was accessed on 2026-11-07. These URLs are mutable, **not immutable catalog qualifications**. Record publication/revision where shown; production ingestion needs retained, permitted evidence and a content digest, which this pass does not supply. No vendor documents are copied into this public repository.

| ID | Document/version and bounded observation (D) |
| --- | --- |
| V1 | [Celestica DS5000 product page][V-ds]: 2U, 64×800G OSFP. This corroborates chassis scale, not Hedgehog optics or performance qualification. |
| V2 | [NVIDIA HGX AI Factory networking hardware][V-hgx], updated May 18, 2026: CX8 reference supports 2×400G twin-port optics for dual-plane use; 1×400G single-port OSFP for single-plane use. B3240 reference has two 400GbE ports. It does not establish the sponsor's 2×200G BF3 mode on a selected OEM system. |
| V3 | [DGX GB rack hardware][V-gb], updated September 17, 2026: compute tray has four GPUs; cluster entries distinguish four single-port 400G OSFP CX7 NICs for GB200 from four single-port 800G OSFP CX8 NICs for GB300. OEM NVL72 arrangements still require separate evidence. |
| V4 | [Cisco QSFP-100G data sheet][V-cisco], updated November 6, 2026: QSFP-100G-LR4-S uses duplex LC and single-mode fiber up to 10 km; QSFP-100G-CU1M is a 1 m passive copper assembly. These are component examples, not Cisco-optics-on-Hedgehog approvals. |
| V5 | [NVIDIA MCA7J60 specification][V-acc], document history revision 1.3, September 2024, PDF pp. 2–5, 18–19: 800G twin-port OSFP to two 400G OSFP ACC, 4/5 m options; Ethernet and InfiniBand described. Finned switch end and flat adapter ends are application-specific. This is not DS5000 compatibility evidence. |
| V6 | [NVIDIA transceivers/fiber guide][V-optics], revision not exposed in retrieved page: twin-port optical engines and paired fiber choices; selected switch/module combinations require the same straight/splitter choice on both optical ports. Thus a logical breakout option does not imply arbitrary per-branch optical modes. |

The Celestica documentation portal's breakout page redirected to an unsupported-browser page during direct access. Search excerpts were insufficient for qualification and were not used as an approved cable list. V1 and the pinned profile remain the positive DS5000 sources. No maintainer, supplier or installer was contacted.

## 2. Catalog and upstream boundary

### What upstream encodes

| Layer | Observed fields/behavior (F unless D) | Missing physical/planning evidence |
| --- | --- | --- |
| `SwitchProfileSpec` [F-profile] | NOS type/platform/silicon, feature flags, named ports/labels, management indication, port groups, supported/default speeds or breakout modes, NOS offsets, autoneg permissions/defaults, pipeline and total logical-port limits | No structured transceiver/cable inventory, qualified pair matrix, route length, polarity, loss budget, rack/RU, rail or plane. Notes can contain physical facts: DCS240 has upper/lower-row power limits, so do not claim profiles contain no physical information at all. |
| `SwitchSpec` [F-switch] | Profile selection; port/group speeds, breakouts, autoneg and FEC settings; role and topology metadata. `Validate` counts configured breakout ports including unused lanes, then checks total/pipeline budgets | An accepted FEC configuration key is not an end-to-end FEC/firmware qualification. Removing a FEC override does not reset hardware defaults according to the field comment; operational reconfiguration belongs to ops. |
| Mapping helpers [F-profile] | `GetAPI2NOSPortsFor`, `GetAvailableAPIPorts`, `NormalizePortName`; parent base and first breakout subport can alias. `GetFECConfigurablePorts` restricts multi-lane FEC keys to subports | NOS offset is an indexing/mapping datum, not a vendor electrical pinout or optical polarity map. Preserve both independently. |
| `ServerProfileSpec` [F-server] | NIC names and nested port names only; explicitly unused/unimplemented. `Validate` checks metadata | Cannot prove NIC existence, supported mode, GPU relation, medium, firmware, or OEM external-cage wiring. A Server still represents any non-switch endpoint. |
| Connection / deployment | R02/R03 govern topology semantics and additional Fabric/VPC/installation resources | A physical BOM is a companion to the wiring bundle, not a replacement for required resources or proof of controller acceptance. |

Relevant existing tests, **read but not run**: `TestGetAPI2NOSPortsFor`, `TestGetNOS2APIPortsFor`, `TestGetAvailableAPIPorts` in [mapping tests][F-map-tests]; `TestDellFECConfigurablePorts` in [F-FEC-tests] covers base versus broken-out names; `TestDefaultSwitchProfiles` and `TestDefaultSwitchProfilesEnforcement` in [F-catalog-tests] cover catalog validity/enforcement. They do not test R05 assemblies or qualify optics.

### Proposed records (P; domain-model requirements, not chosen implementation)

Each immutable profile revision needs manufacturer, exact orderable SKU/variant, hardware revision, profile ID/revision, applicable controller/NOS release and digest, firmware/driver/CMIS requirements, source URL+section+revision+retrieval date+content hash, evidence owner, review disposition, validity scope and superseded revision. An alias such as “B300” or “800G switch” is insufficient. Preserve user-supplied values separately from derived/default values and their provenance.

| Record | Required distinctions |
| --- | --- |
| Endpoint system | OEM/model/tray revision; host/Server identity; NIC/DPU SKU and physical location; exposed cage IDs and internal routing; logical ports, supported Ethernet modes, speed/lane signaling/FEC; GPU-to-NIC/rail relation; BMC interfaces; supported firmware/driver; fabric/plane assignment and failure sets. Never derive host count from GPU count. |
| Switch | Imported upstream profile identity and exact configured modes; canonical API IDs plus physical labels; cage and electrical-lane groups; pipeline/bank/shared-speed limits; thermal/power/airflow limits; endpoint/uplink/control/growth reservations; role/service capability and supported NOS. Missing bank restrictions mean unknown, not unrestricted. |
| Module | SKU/revision, host form factor and electrical interface, Ethernet PMD/line rate, optical connector/polish/gender/keying, wavelength/fiber type, channel map, Tx/Rx budget, supported reach, power/cooling, firmware and supported host combinations. A twin optical engine module is one replaceable module. |
| Assembly | Unique instance ID, purchasable SKU or explicit symbolic class, revision, passive/ACC/AEC/AOC/DAC/fiber/RJ45 type; inseparable versus detachable pieces; connector ends and branch lengths; full bidirectional channel map; route and replacement unit; included components; qualified configurations. Active copper technologies remain distinct, not synonyms. |
| Qualification tuple | Both device+port+mode+firmware identities, module/cable SKUs, FEC/autoneg settings, topology role, NOS/controller pin, route bounds and evidence of interoperability. Record the scope: vendor documented, static checked, laboratory measured, authority confirmed. One approved part on one host does not qualify another host or a whole path. |
| Price/inventory | Separate dated offer, currency, geography, quantity tier, packaging/order unit, validity/availability and inventory ownership; not part of compatibility truth. |

Use **two independent state axes**: answer provenance (`unknown`, `supplied`, `assumed`, `derived`, `conflicting`, `stale`) and compatibility (`documented compatible within scope`, `documented incompatible`, `unverified`, `disputed`). A supplied override cannot change incompatible to compatible. An obsolete evidence revision becomes stale and invalidates dependent approvals; retain old values and explain the delta. Do not silently select the cheapest near-match.

Reuse alternatives: (a) consume a versioned export of upstream profiles plus a physical companion catalog (recommended research direction, aligned with R03); (b) hand-maintain both, with higher drift risk; (c) add physical fields upstream, requiring actual maintainer agreement. Fabric source bears Apache-2.0 notices; any future exporter must retain applicable notices and review dependencies. Vendor document redistribution rights are separate. None of these alternatives authorizes a new spike or upstream schema change.

## 3. Candidate realization of R04 scenarios

The following is **static source-derived resource analysis**, not upstream execution or hardware support approval. Every candidate still needs a selected OEM endpoint, module/cable combination, firmware, actual configuration and independent checks. Link rate units are decimal Gb/s per direction.

| R04 fixture | Candidate and explicit mapping | Resource result and remaining boundary |
| --- | --- | --- |
| H400, S01–S03 / 400G S06 | `celestica-ds5000` [F-ds5000]: cages E1/1–32 at `2x400G`, E1/33–64 at `1x800G`; slot q → E1/(1+floor(q/2))/(1+q mod 2) | 64 endpoint +32 uplink logical ports =96 on OSFPs. Profile also counts two auxiliary SFP28 ports, giving **98** configured data ports ≤320. Pipelines 1–16 have four ports each, 17–32 two each, all ≤10. Static mode/budget match only; DS5000 leaf is L3-only, ESLAG=false. |
| H800, S05-B / 800G S06 | DS5000, all 64 OSFPs at `1x800G`; first 32 endpoints and last 32 uplinks | 64+2=**66** configured data ports; two per pipeline. Endpoint capacity differs from H400; 400G-only NICs do not become 800G by changing the switch mode. |
| H200, S04 | `edgecore-dcs240` [F-dcs240] is a candidate **logical** 64×200G realization: all 32 main cages at `2x200G`; virtual H200 port p=1…64 → E1/(1+floor((p−1)/2))/(1+(p−1) mod 2). First 16 cages endpoints; last 16 inter-switch | 64+2 auxiliary=**66** configured ports; four cages/pipeline ×2=8 ≤18. Profile ESLAG=true, documented leaf/spine role [D-devices]. This replaces 64 hypothetical native ports with 32 shared cages: sibling links share failures and need revised physical BOM. QSFP56DD-400G host side is not the same signaling assumption as an OSFP-800G split. Exact 200G NIC/assembly compatibility unknown. |
| Tempting H200 substitute | `celestica-ds4000` has 32×400G and `2x200G` modes [F-ds4000] | Capacity is insufficient evidence: documented **spine-only** role, ESLAG=false. Reject as an S04 leaf substitution at this baseline. DS5000 also cannot satisfy S04 ESLAG merely by offering 200G modes. |

DS5000 counterexample: E1/1 and E1/4 both at `8x100G` create 16 logical ports on pipeline 1, exceeding 10, even if only one cable is attached to each. Conversely `8x100G` plus `2x400G` creates ten there; other pipelines and total still need checking. A second global boundary: all 64 cages at `8x100G` gives 512+2=514 >320. Per-cage mode support does not prove simultaneous feasibility.

DCS240's profile notes upper 16 ports allow 24 W and lower 16 allow 14 W [F-dcs240]. Preserve that qualification and obtain the physical row-to-label map before module selection; do not infer upper/lower from numeric port order. H200 conversion must not quietly replace the user's native-port requirement if that requirement is hard.

### Endpoint evidence still required

- **HGX B200/B300 (Q):** exact OEM baseboard/NIC option and externally accessible cages, NIC firmware, driver and supported port split mode; GPU/rail map, PCIe/internal-cable mapping, connector cooling and host software behavior. V2 strengthens R04 S05-A as a vendor reference mode, but does not certify arbitrary HGX systems or guarantee independent failure of its two attachments.
- **DGX GB200/GB300 (D/Q):** V3's single-port entries are consistent with the need to qualify logical splitting of one GB300 cage for S06-4/5. Do not turn a single-port entry into two independent physical NICs, or extrapolate GB300's rate to GB200. HGX and DGX documents have different scopes.
- **Frontend/storage/BMC (Q):** sponsor BF3 2×200G is a scenario; V2's B3240 2×400G is not evidence for that exact mode. Verify SKU, configured speed, supported electrical lanes and service type. Management NICs and non-NVIDIA storage/gateways use the same catalog rules. Integrated RJ45 PHYs are not pluggable optics.
- **Performance (Q):** raw speed balance does not prove nonblocking forwarding, lossless RoCE behavior, application failover or convergence. Shared NIC/PCIe/power/cage/module/assembly failures must be enumerated even with leaf-disjoint planes. Keep R04 same-Fabric domain/VPC restrictions intact.

## 4. Four exact accounting witnesses

These are **synthetic mapping/accounting fixtures**. Named parts illustrate a documented component category only; no end-to-end qualification or procurement recommendation is made. Switch/NIC instances are not additional BOM components in the per-link totals below; they belong to the device BOM. Electrical channel numbering in the fixtures is abstract and must not be mistaken for a vendor pinout.

### A. Separate optics and fiber (P, component basis V4)

One logical 100G link: device A cage a → module O-A → fiber F-1 → module O-B → device B cage b. Candidate module class: QSFP-100G-LR4-S at each end; one duplex LC single-mode jumper, illustrative ordered length 10 m, no patch panels. The length is a fixture input, not a site measurement.

Bidirectional mapping: O-A Tx → F-1 strand 1 → O-B Rx; O-B Tx → F-1 strand 2 → O-A Rx. LR4 wavelength multiplexing is internal to the modules; four wavelengths are not four Ethernet links or four jumpers. Counts: **one logical link, two occupied cages, two replaceable optical modules, one fiber assembly, zero integrated cables**. Failure of either module or F-1 removes the link.

Negative A-N: equal 100G rates with LR4 at A and an incompatible optical PMD at B are not accepted by rate matching; unknown receiver/PMD evidence blocks readiness. Unknown patch panels/polarity/loss also block installation. Adding a trunk and two patch cords changes the fiber BOM to three separate assemblies plus shared panel allocations; retain component IDs rather than keeping the old one-jumper count.

### B. Integrated cable (P, component basis V4)

One logical 100G link: A cage a ↔ integrated cable C-1 end A/body/end B ↔ B cage b. Candidate class QSFP-100G-CU1M, with 1 m ordered length. End housings are inseparable parts of C-1. Counts: **one link, two cages, one DAC assembly, zero separately ordered modules, zero separate fiber**. Four host electrical channels carry one logical link; they do not imply four cables. Whole-assembly replacement removes the link.

Negative B-N: a qualified 1 m assembly cannot meet an illustrative 1.2 m routed requirement including slack. Adjacent racks do not prove reach. Substituting AEC, ACC or AOC requires a new qualification tuple, not a class rename. For any truly integrated AOC the counting rule remains one assembly and zero extra detachable optics; it still needs its own module/firmware/reach evidence.

RJ45 analogue: two integrated compatible RJ45 Ethernet PHYs plus one patch cord require **one copper cord and zero added transceivers**. A pluggable RJ45 adapter is instead a separate module with its own speed, thermal and reach evidence. Console RJ45 and BMC/data RJ45 are different interfaces; connector shape cannot establish compatibility.

### C. Breakout assembly (P; V5 is a product precedent)

Synthetic parent S cage c configured `2x400G`, exposing logical ports c/1 and c/2. Integrated assembly C-2 has parent end P and child ends X/Y:

| Logical edge | Abstract electrical mapping (bidirectional) | Termination |
| --- | --- | --- |
| e1, 400G | P channels 0–3 ↔ X channels 0–3 | S c/1 ↔ NIC N1 port n1 |
| e2, 400G | P channels 4–7 ↔ Y channels 0–3 | S c/2 ↔ NIC N2 port n2 |

Counts: **two logical links, three physical cages, four logical port terminations, one integrated split assembly, zero detachable modules/fibers**. Do not buy “one cable per link” or three extra modules. Vendor MCA7J60-N004 is a documented 4 m ACC precedent, but the source does not qualify this mapping on DS5000; production leg identity and channel mapping require the actual drawing/labels.

The common parent cage, parent electronics and cable body form shared failure sets for e1/e2. If tails feed two planes from one NIC cage, strict assembly/NIC-independent planes fail even with different leaves. A single tail fault may affect only one edge; model both component-level and whole-replacement impact.

Negative C-N: assigning c and c/1 independently duplicates an effective port; assigning two children to c/1 is not a valid split. Leaving e2 unused still occupies the parent mode and full assembly; retain the unused tail, its protection/parking instructions and reserved logical slot. Do not halve the cable count.

Alternative **optical** construction (V6 precedent): one twin-port parent module, two child modules and two separate straight fiber assemblies gives **three modules + two fibers**, not C-2's one integrated cable and not four modules. One detached branch does not free half the parent module for a second BOM charge. Mixed branch modes must obey the qualified module/host restrictions.

### D. Multi-ended shuffle (P, explicitly unqualified)

**SH-1 is a symbolic passive fiber harness, not a purchasable SKU or a claimed NVIDIA assembly.** Four external optical connector ends connect two twin-engine source modules A/B to two twin-engine destination modules X/Y. Each engine is a separate 400G logical channel group. All four cages use qualified `2x400G` only as a fixture assumption. Each external end has two abstract groups g0/g1, each with Tx/Rx channels i=0…3; no MPO pin numbering is asserted.

| Link | Source group | Destination group | Full-duplex map for each i |
| --- | --- | --- | --- |
| s1 | A.g0 | X.g0 | A.g0.Tx[i] → X.g0.Rx[i]; X.g0.Tx[i] → A.g0.Rx[i] |
| s2 | A.g1 | Y.g0 | A.g1.Tx[i] → Y.g0.Rx[i]; Y.g0.Tx[i] → A.g1.Rx[i] |
| s3 | B.g0 | X.g1 | B.g0.Tx[i] → X.g1.Rx[i]; X.g1.Tx[i] → B.g0.Rx[i] |
| s4 | B.g1 | Y.g1 | B.g1.Tx[i] → Y.g1.Rx[i]; Y.g1.Tx[i] → B.g1.Rx[i] |

Counts for this hypothetical physical packaging: **four logical links, four cages, eight logical port terminations, four detachable twin-engine modules, one passive shuffle assembly, zero additional patch cords**. If the actual product exposes two separate connectors per engine pair, record those connector ends individually; this abstract four-end drawing is not permission to plug it into V6 modules. An actual vendor assembly could have eight MPO ends or require additional cords, which changes the orderable schedule. Its product drawing must replace this abstract connector/group map before any procurement claim.

SH-1 replacement affects all four links; A module/cage failure affects s1/s2, B affects s3/s4, X affects s1/s3 and Y affects s2/s4. Plane labels cannot erase these shared failure sets. Unused paths remain owned by SH-1. A connected optical path is a permutation, not an optical splitter that duplicates signal or bandwidth.

Negative D-N1: route B.g0 to X.g0 instead of X.g1: duplicate destination and omitted X.g1, despite unchanged total link count. D-N2: all endpoints unique but connect a plane-A source to a plane-B destination contrary to intent: reject. D-N3: vendor supplies no pinout, polish/gender, length, loss or compatible module evidence: mapping may be useful for estimation, **procurement and installation blocked**.

### Accounting invariants (P)

Let each link reference its ordered path of component instances and channel groups. Count installed quantities by **distinct component instance IDs grouped by exact SKU/revision/length**, not by link incidence. A kit can be a purchasing parent with children for maintenance, but only the selected order-unit level enters the purchase sum; do not buy both the kit and its included modules again. Different units of the same SKU remain distinct instances. Retain separate totals for device count, cages, configured logical ports, active links, physical assemblies, detachable modules and spare stock.

Assembly ownership is a relation spanning multiple links, not an assumption that every link owns a unique cable. Verify forward and reverse channel continuity, endpoint uniqueness and plane/rail intent; reject duplicate consumption even across different Connection objects. For partial plans, give exact conditional counts under each explicit assumption and unresolved categories, never zero for unknown components. None of A–D is an installation-ready link.

## 5. Constraints and physical evidence gates

All rules below are proposals unless explicitly anchored to pinned behavior. They are hard for the stated readiness scope; preferences may only rank already feasible alternatives. Owner means accountable role, not an independently spawned agent.

| ID | Applicability, units, hard/soft | Rule, source/version and validation | Example / counterexample | Owner |
| --- | --- | --- | --- | --- |
| P01 | All configured ports; ports/lanes; hard | Canonicalize aliases and check complete parent mode, pipeline/bank/group limits using baseline profile and Switch validation (§2–3); compare configured slots, not only cables | H400 98 / DS5000 paired 8+8 >10 | parts + compat; topo review |
| P02 | Every link; Gb/s, lane rate/count, FEC/autoneg; hard | Match complete electrical and optical PMD chain plus firmware/driver/host mode evidence; equal aggregate rate alone fails (§2, V2/V5/V6) | approved tuple / 200G with wrong host lane signaling | parts; designated domain authority |
| P03 | Every connector; connector identity/pin map; hard | Verify form factor, cooling, keying, gender, polish and Tx→Rx continuity including patch panels; no generic OSFP or MPO equivalence (§4) | validated end map / two Tx ends or incompatible keyed ends | parts + ops |
| P04 | Optical paths; m/dB; hard at installation | Required route including slack/service loops within approved assembly length and optical loss budget; minimum receive power and overload bounds, connector/splice losses and margin must all pass selected data sheet | supplied route/budget / straight-line rack distance only | ops; parts compatibility |
| P05 | Copper/integrated and shuffle; m/branch geometry; hard at procurement | Select exact length SKU and branch placement with bend radius/pull/strain/thermal limits; no inferred reach from rack proximity | 1 m cord for bounded route / B-N's 1.2 m demand | ops + parts |
| P06 | Allocation and BOM; instance count; hard | Component identity, inclusive kit accounting and whole-assembly replacement; retain unused lanes/branches (§4) | C-2 counted once / twice because two links | parts; topo reviewer |
| P07 | Rail/plane/redundancy; failure sets; hard when policy requires | Evaluate shared NIC, cage, assembly, module, switch, route, rack and power failures against explicit intent; synchronize with R04 T04 | disclose s1/s2 common module / assert independence from leaf labels | topo + sponsor; ops routes |
| P08 | Release/export; evidence revision; hard | Bind qualifications to exact snapshot; conflicts/stale critical evidence block dependent output, overrides remain visible (§2/6) | new revision requalified / silently inherit old verdict | lead + parts + ops |
| P09 | Growth/spares; units; hard for locked reservations, otherwise soft | Keep unused physical resources distinct from spare inventory; apply explicit SKU-based spare policy (§6) | one spare full harness / fractional spare tail | sponsor policy; ops |
| P10 | Selection; currency/m/units; soft | Minimize cost/length/part diversity only after compatibility and hard placement/rail constraints; declared objective priority | compare qualified options / cheapest unverified cable | sponsor; future solver assignment |

Reach is an end-to-end condition. A transceiver's nominal distance is not permission to ignore connector losses, dirty end faces, patch-panel polarity, route geometry or minimum receiver limits. No universal dB margin, cable bend radius, maximum RJ45 reach or spare percentage is invented here; each needs the selected equipment/installation evidence. Detailed facility engineering remains outside this bounded pass.

DS5000 installation/change caveat (D): [D-limits] describes CMIS initialization failures when breakout is changed without the transceiver present and insertion occurs later; the documented patch still requires a reboot and existing failures may require a power cycle. Static planning cannot certify safe hot reconfiguration. Ops must specify the current approved sequence and disruption/rollback evidence. FEC override removal similarly requires actual lifecycle handling [F-switch].

## 6. BOM, prices and progressive readiness

**Proposal to lead/scout/ops:** retain R01's useful separation of logical design, procurement and installation, but refine what each state certifies. R01 S3/S4/S5 are not settled policy. Record independent verdicts for schema, pinned upstream semantics, supported combination, physical readiness and requirement/performance suitability. A physical success cannot erase a failed topology/service gate.

| Missing fact | Useful output still permitted (P) | Blocked claim |
| --- | --- | --- |
| OEM/NIC/mode or assembly choice | Alternative conditional link/cage/part-class counts with explicit assumptions | Qualified physical BOM, orderable package and installation |
| Module compatibility, lane/FEC or polarity | Flagged mapping and budget estimate; upstream verdict separately scoped | Physical validation; procurement/installation of affected links |
| Route unknown but bounded approved reach and exact module SKU known | Component-specific optics procurement may be reviewed separately; fiber remains unresolved | Entire cable package being S4; installation |
| Only “within 5 m” known for an integrated cable | Candidate class and count; request routed bound/slack and exact length SKU | Ordering a fixed length solely from a reach class |
| Exact length known, placement/labels or access route unknown | Potential procurement package if geometry/compatibility approvals truly sufficient | S5 installation until actual termination/route schedule reconciles |
| Price missing/stale, compatible quantities verified | Exact physical quantities with cost unknown or stale | Current priced quote, not physical readiness itself |
| Serial/MAC unknown | Planning/BOM; installer requirements resolved per R06 workflow | Only the workflow stages that actually require identity; do not conflate missing serials with incompatible optics |
| Unresolved strict plane independence | Explicit shared-failure alternative for review | Claim of meeting the disjointness requirement, even with compatible parts |

A blanket S3 badge saying only “lengths unspecified” can hide unknown NIC mode or incompatible optics. Prefer scoped text such as “logical checks passed; physical compatibility unverified; budgetary BOM.” S4 requires exact orderable SKUs and quantities for its declared package, including assembly lengths and branch geometry. A reach class may suffice for a qualified optic but not automatically for a cable. Partial procurement packages must state included and excluded components, dependency risks, revision and approver; no global ready flag. S5 additionally requires resolved physical-port labels, placement/routes, relevant installation identities, verification/acceptance procedures and version-bound approvals as R06 defines. This report approves neither early purchasing nor a first-slice terminal state.

### Quantities and spares (P)

Installed requirement, growth reservation, spare stock, existing reusable inventory and new purchase quantity are separate columns. Example policy for review only: `spares(k)=ceil(installed(k)*0.05)` per compatible SKU/length/replacement unit. For 32 installed integrated harnesses this yields two **whole harnesses**, total 34 required before existing stock. An unused tail is not a spare harness. Grouping/redundant stock-location/minimum rules must be sponsor/ops choices, not defaults silently added to totals.

For exact unit k: `new_purchase(k)=max(0, installed_required(k)+approved_spares(k)−approved_reusable_stock(k))`, then apply vendor pack-size rounding in a separately disclosed order quantity. Existing stock must be compatible, usable and not already allocated elsewhere. Growth-reserved cages produce no automatic spare cable purchase. Factory-included modules/cables are reconciled through kit inclusions; replacement spares can still be explicit separate orders.

### Pricing and change impact (P)

An exact conditional component count is not an exact price. Price records need source/quote date, expiry, currency, quantity tier, region, unit/pack basis, discounts, tax/shipping exclusions and availability. Never insert zero for missing prices. Show known subtotal, unpriced quantities and assumptions; budget ranges are labeled estimates, not procurement authority. An expired price need not invalidate a verified cable map; a changed SKU does.

Regeneration uses stable instance IDs, immutable catalog/rule revisions and deterministic allocation inputs. Report added/removed/retained links and parts, changed length/SKU/spares/cost, changed shared-failure sets and invalidated approvals. Retain locks and overrides; a new incompatible override yields a visible conflict. Re-run affected qualifications after mode, firmware, route, module or assembly substitutions. Installation deviations produce an as-built revision, not an overwrite of the approved baseline.

## 7. Verification, questions and handoff

### Reproduction and actual verification scope

Pinned source files were read through the GitHub connector at the full commits above; vendor pages/PDF were opened on the access date. The arithmetic below is a documentation check using Python standard library, not an application solver or upstream test. Copy the code block into Python 3; it encodes the source-derived pipeline grouping for the named candidates and the exact symbolic shuffle tuples. An independent reviewer should also compare these expectations with the cited source and tables.

```python
from collections import Counter
from math import ceil
# DS5000: every group of four cages assigns pipelines [odd, even, even, odd].
def ds_counts(modes):
    pipelines = Counter()
    for cage in range(1, 65):
        group, offset = divmod(cage - 1, 4)
        pipeline = group * 2 + (1 if offset in (0, 3) else 2)
        pipelines[pipeline] += modes.get(cage, 1)
    return sum(pipelines.values()) + 2, max(pipelines.values())
assert ds_counts({c: 2 for c in range(1, 33)}) == (98, 4)
assert ds_counts({}) == (66, 2)
assert ds_counts({1: 8, 4: 8}) == (80, 16)  # pipeline fails despite total <320
assert ds_counts({1: 8, 4: 2}) == (74, 10)
assert ds_counts({c: 8 for c in range(1, 65)}) == (514, 16)
# H200 logical slot-to-cage conversion for DCS240.
slots = [(1 + (p-1)//2, 1 + (p-1)%2) for p in range(1, 65)]
assert len(set(slots)) == 64 and len({c for c, _ in slots}) == 32
assert 32*2+2 == 66 and 4*2 == 8 and 8 <= 18
# Shuffle groups must be bijective; each row expands to four Tx/Rx pairs.
mapping = [('A0','X0'), ('A1','Y0'), ('B0','X1'), ('B1','Y1')]
def bijective(rows):
    return len({a for a,b in rows}) == len(rows) == len({b for a,b in rows})
assert bijective(mapping)
assert not bijective([('A0','X0'), ('A1','Y0'), ('B0','X0'), ('B1','Y1')])
assert len(mapping)*4*2 == 32  # directed optical channels, not Ethernet links
assert 1.2 > 1.0 and ceil(32*0.05) == 2
print('R05 arithmetic and mapping assertions passed')
```

Expected output: `R05 arithmetic and mapping assertions passed`. Counts do not establish electrical pinout, fiber loss, admission, actual FEC behavior or availability. No upstream build/test suite, `hhfab validate`, CRD admission, VLAB, device lab, optics interoperability, optical loss or throughput test was run. No deployment, purchasing, live-controller write or application implementation occurred. Documentation verification is recorded with the exact final commit in the issue handoff.

### Open questions and decisions

| ID | Question / alternatives | Owner and safe interim handling |
| --- | --- | --- |
| Q1 | Select one OEM endpoint/NIC/firmware and supported switch/NOS pair for first physical qualification; HGX B300 2×400G, DGX GB300 split or simpler frontend? | Sponsor priority; parts/compat and designated domain authority qualify. All remain candidate scenarios. |
| Q2 | Obtain actual supported module/cable matrix and explicit lane/polarity/FEC map for that pair; can the chosen single NIC port run the required split under its OEM firmware? | Sponsor relays to vendor/domain authority; no direct outreach. Keep exact compatibility unverified. |
| Q3 | Does “two planes” require surviving NIC, module, assembly, switch, route, rack or power failures? Which shared sets are acceptable? | Sponsor with topo/ops; retain shared failures, do not silently enforce only switch disjointness. |
| Q4 | Who approves route/length/slack, patch loss/polarity, branch parking, replacement scope and as-built deviations? Which serial/MAC inputs are mandatory when? | ops; [cross-ticket request](https://github.com/afewell-hh/hh-aid/issues/7#issuecomment-6713316860). Do not wait for full R06 to review this bounded result. |
| Q5 | Approve refined S3/S4/S5 wording, partial-package policy, spare policy and price expiry handling, or keep first slice budget-only? | Lead coordinates scout/ops; sponsor decides. No default spare percentage or terminal state adopted. |
| Q6 | What approved DS5000 breakout/CMIS and FEC-change procedure applies to selected module/firmware? | ops + authority, using D-limits/F-switch; no safe live-change claim from static profile. |

### Acceptance evidence

| Issue #6 criterion | Evidence / status |
| --- | --- |
| Version/provenance and upstream versus missing fields | §1–2, exact code/docs pins, two-axis evidence states and qualification tuple; ready for review |
| Four examples, exact counts and end-to-end mappings | §4 A–D; negative cases, inactive branches and shared failures; shuffle explicitly symbolic/unqualified |
| Speed/media/connector/reach/polarity, placement/spares/unknowns | §2, §3 endpoint requirements, P01–P10, §6; physical facts unresolved are disclosed |
| Quantities/prices/double counting/install blockers | §4 invariants and §6 gates, kit/spares/stock/price/change accounting |
| Facts/hypotheses/intent/questions, versions/reproduction | Labels, source register, §7 arithmetic and execution limits; no invented maintainer intent |
| Independent disposition and required decisions | **Pending t6 / topo and t9 / ops through lead; sponsor/domain questions Q1–Q6 open. Not self-approved or closed.** |

Recommended next assignment: lead coordinates the named reviewers against these criteria, then sponsor selects one exact qualification tuple for a separately authorized evidence pass. D01/D03/D04 may reference the proposed requirements only under their dependency gates. Do not expand to an exhaustive catalog or implement a production model from this report.

[R01]: https://github.com/afewell-hh/hh-aid/blob/75fe3edccafc756c6b92ad44dff9b71af73d3138/docs/research/product-discovery.md
[R02]: https://github.com/afewell-hh/hh-aid/blob/bf7437c3fc852cfe06663073edc36a08de75efbc/docs/research/hedgehog-support-contract.md
[R03]: https://github.com/afewell-hh/hh-aid/blob/2b547901413c00fb8d7ce3eeff7d6669f2b78135/docs/research/upstream-reuse.md
[R04]: https://github.com/afewell-hh/hh-aid/blob/49e6079a077d1d819d12485de3896a93e8371f74/docs/research/topology-scenarios.md
[F-profile]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switchprofile_types.go
[F-switch]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go
[F-server]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/serverprofile_types.go
[F-ds5000]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/p_bcm_celestica_ds5000.go
[F-ds4000]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/p_bcm_celestica_ds4000.go
[F-dcs240]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/p_bcm_edgecore_dcs240.go
[F-map-tests]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switchprofile_types_test.go
[F-FEC-tests]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/fec_breakout_test.go
[F-catalog-tests]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/catalog_test.go
[D-devices]: https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/supported-devices.md.gen
[D-limits]: https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/known-limitations/known-limitations.md
[V-ds]: https://cls.celestica.com/hardware-platforms/ds5000/
[V-hgx]: https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory/latest/networking-hardware.html
[V-gb]: https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html
[V-cisco]: https://www.cisco.com/c/en/us/products/collateral/interfaces-modules/transceiver-modules/datasheet-c78-736282.html
[V-acc]: https://docs.nvidia.com/networking/display/mca7j60-nxxx-800gbs-twin-port-osfp-to-2x400gbs-osfp-acc-splitter-product-specifications.pdf
[V-optics]: https://docs.nvidia.com/networking/display/400g100gpam4ovdev/Transceivers-and-Fiber-Details-100G-PAM4
