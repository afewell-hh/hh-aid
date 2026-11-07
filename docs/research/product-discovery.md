# R01 Product discovery: users, outcomes, scope, and first learning goals

| Field | Value |
| --- | --- |
| Issue | [#2 R01](https://github.com/afewell-hh/hh-aid/issues/2) (coordination [#1](https://github.com/afewell-hh/hh-aid/issues/1)) |
| Role / author | **scout**, Product discovery lead (AI agent, Claude Opus 5.5, session of 2026-11-07) |
| Independent reviewers | UX researcher (`ux`, D02 owner) and sponsor. **Not yet reviewed.** |
| Status | Revision 3: public-source-only draft for review. §13 consolidated with compat's review and bridge revision 2, per lead's [#2 comment 6712216941](https://github.com/afewell-hh/hh-aid/issues/2#issuecomment-6712216941). Not self-approved. Every user, target, release policy and slice recommendation here is a **proposal**. |
| Evidence date | 2026-11-07 |

## 1. Question and scope

**Question.** Who will use hh-aid, for which jobs, and across which journey from first enquiry to lifecycle handoff? Which failures are costly enough to shape the product? Where are its boundaries, and what overlaps with what Hedgehog and the sponsor already have? Which measurable learning goals and thin vertical slices should come first?

**In scope.** A product opportunity map, personas and jobs, journeys, failure modes, success measures, boundaries, an assumptions register, an interview guide, learning goals and candidate slices. Also an inventory of existing planning offerings that overlap with hh-aid.

**Out of scope.** The topology support matrix (R02, #3), hhfab generation internals (R03, #4), topology mathematics (R04, #5), hardware and BOM semantics (R05, #6), and the detailed installation and lifecycle artifacts (R06, #7). This document points to those tickets and does not pre-empt them.

**Method.** Desk research only. I read the bootstrap documents, the pinned public Hedgehog sources, Hedgehog's public website, and the sponsor's *public* repositories and issue records. **This document uses public sources only.** Private repositories were excluded from it; any working notes derived from them are kept outside this repository's Git history. **No human interviews took place.** Personas and jobs are hypotheses built from the sponsor brief and from observed artifacts. Section 9 holds the interview guide that will test them.

### Evidence labels

Every claim below carries one of these labels.

| Label | Meaning |
| --- | --- |
| **F** | Verified fact. I observed it in a pinned source, which is cited. |
| **S** | Sponsor-reported requirement, from `docs/product-context.md`. Not externally verified. |
| **H** | Hypothesis from this research. Not yet validated by users. |
| **I** | Inferred maintainer or organisational intent. Unconfirmed; do not treat it as Hedgehog's position. |
| **Q** | Open question. |

### Source baseline

| Source | Pin | Notes |
| --- | --- | --- |
| Hedgehog product release | **26.05** (5 Nov 2026), per [release notes](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/release-notes/index.md) lines 7–60 | Composition: fabricator/hhfab v0.51.4, fabric v0.144.1. **F** |
| githedgehog/fabric | tag `v0.144.1` = `4bde50829fd7cfebac69332982abd1dee504a8a3` | Release-composition version, not the newer `v0.145.0`. |
| githedgehog/fabricator | tag `v0.51.4` = `d2316aca666eb278541276a11a5f8dae372bf629` | |
| githedgehog/docs | `master` @ `1be68948e177dcc031e91659ab5293ba19893ccf` (2026-11-05) | The docs site is versioned with mike. Master may run slightly ahead of 26.05; R02 should confirm against the published 26.05 docs. |
| hedgehog.cloud, its ROI page, plan.hedgehog.cloud | Fetched 2026-11-07 (live pages, not pinnable) | Marketing and ROI context only. |
| Sponsor-owned public repos | [afewell-hh/aid](https://github.com/afewell-hh/aid) @ `134fe442` (2026-08-22); [afewell-hh/hh-netbox-plugin](https://github.com/afewell-hh/hh-netbox-plugin) @ `5e0a2cfa` (2026-11-02); [afewell-hh/OCP-OCDAI-training-fabric](https://github.com/afewell-hh/OCP-OCDAI-training-fabric) @ `d4178b5e` | READMEs and public issue records only. I did not inspect their code. |
| Sibling hh-aid reports (under review) | compat R02 [PR #17](https://github.com/afewell-hh/hh-aid/pull/17) @ `2adcb6eb` and compat's [#4 review 6711820797](https://github.com/afewell-hh/hh-aid/issues/4#issuecomment-6711820797); bridge R03 [PR #18](https://github.com/afewell-hh/hh-aid/pull/18) revision 2 @ `7459463` | Cited only to reconcile wording (§13). Their claims are **not** treated as accepted hh-aid facts. |

The Fabric commit `4bde5082…` equals the "public Fabric master snapshot" pinned in the sponsor's earlier HNP research reset (for example [hh-netbox-plugin#761](https://github.com/afewell-hh/hh-netbox-plugin/issues/761)). That snapshot is therefore exactly Fabric v0.144.1, the 26.05 Fabric version. **F**

## 2. Executive summary

1. **hh-aid is not starting from zero, so its first product decision is how it relates to existing tools.** Public sources show several adjacent tools (§3): hand-authored wiring plus `hhfab validate`/`diagram`, VLAB generators including a hidden preview GPU-rail generator, an earlier sponsor "AI Infrastructure Designer" (AID), a NetBox plugin (HNP) with a long research-reset history, and published OCP reference-design repositories with BOMs and wiring. Whatever workflow pre-sales uses *today* is not documented publicly. It is a hypothesis to establish in interviews (§3.3). Decision D1 asks whether hh-aid replaces, absorbs, integrates with or ignores each tool. **F/H**
2. **Proposal: the primary users are Hedgehog pre-sales/solutions engineers and fabric designers, possibly the same people.** Installers and operators consume hh-aid's outputs, and executive buyers appear to be the audience of the public ROI page. This needs interview validation. **H**
3. **The costliest failures are probably physical and contractual, not arithmetic.** Examples: ordering the wrong optics or cables, under-sizing spines, wiring rails incorrectly, presenting an unsupported design as deployable, and renaming objects on regeneration. Another is choosing fabric or domain structure without considering growth. In 26.05 a Fabric's leaf ASN range, domains and their ASNs are fixed once it is created, and domains cannot be added, removed or renamed ([multi-fabric.md L265](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L265)). Several alternatives are not forbidden, but they are not proven equivalent (§13.2). **F/H**
4. **The sponsor's earlier effort is a process warning.** It produced many gated research records. The final comparison ticket stopped "unaccepted at finite cap" and recommended ending desk comparison ([hh-netbox-plugin#763](https://github.com/afewell-hh/hh-netbox-plugin/issues/763)). hh-aid's own risk register already names "documents but no validated delivery path." I propose timeboxed learning goals that produce executable evidence early (§10). **F/H**
5. **Proposed first-slice direction (D06 decides):** a progressive, rail-aware backend design for 32–64 HGX-class servers on one plane, exported to wiring that passes pinned upstream validation, plus a reconciled BOM, with a sparse-input provisional front end. The fallback is a lower-risk single-fabric frontend leaf-spine slice. The full supported-topology coverage ledger stays open (§10.3). **H**

## 3. Existing offerings and overlap

### 3.1 Public Hedgehog tooling (pinned)

| Offering | What it does | Overlap with hh-aid | Evidence |
| --- | --- | --- | --- |
| Hand-authored wiring YAML, documented in *Build Wiring Diagram* | Users write Fabric, VLANNamespace, IPv4Namespace, Switch, Server and Connection objects. Every wiring diagram needs at least one `Fabric`. | This is today's primary path from design to deployment, and the format hh-aid must produce. It offers no planning help. | [build-wiring.md L15](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/build-wiring.md#L15) **F** |
| `hhfab validate` / `hhfab build` | Validates wiring and Fabricator configuration, and builds installers | Downstream validator and consumer of hh-aid exports. A pass at the pinned version is a **necessary versioned check, not proof** of full admission, lifecycle legality, support, hardware compatibility or fitness for purpose. Peer reports list gaps: CRD schema, gateway dataplane, discarded warnings, update webhooks, variant exclusivity, and first-error-only reporting. See §13.1. | docs as above; compat [#4 review](https://github.com/afewell-hh/hh-aid/issues/4#issuecomment-6711820797), bridge [7459463](https://github.com/afewell-hh/hh-aid/commit/7459463688a35f1fb8c1d4b0093c241a1f23c149) (peer reports under review) **F/Q** |
| `hhfab diagram` | Renders wiring, or the live API with `--live`, as drawio, dot or mermaid | Reuse it for visualisation instead of rebuilding. | [main.go L963](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/cmd/hhfab/main.go#L963) **F** |
| `hhfab vlab generate` | Generates VLAB topologies from counts: spines, ESLAG groups, orphan leaves, server types, extra domain, shared leaves, extra fabric, externals and gateways | A generator for test topologies with abstract counts. It has no rails, physical BOM or progressive input. | [main.go L1148](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/cmd/hhfab/main.go#L1148) **F** |
| `hhfab vlab generate-gpu-rail` (**PREVIEW**, hidden unless `HHFAB_PREVIEW=true`) | "GPU rail-optimized fabric with 8 rails, 4 leafs per scalable unit." Hard-coded to 2 spines, 4 links per spine–leaf pair and 8 rails. Rail *r* goes to leaf *r mod 4*, so each leaf carries two rails. Default switch profile is `vs` (virtual). Ports are allocated sequentially. Past port 76 the allocator only logs an error. bridge reports, unreviewed, that its default output fails `hhfab validate` at this pin. | **Direct conceptual overlap** with the sponsor's rail-packing scenario. It may indicate maintainer interest in rail-optimised designs (**I**, unconfirmed: Q-M1). It is VLAB-only, fixed-shape, has no physical profiles, and is not a support statement. | [main.go L174](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/cmd/hhfab/main.go#L174), [L1222](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/cmd/hhfab/main.go#L1222); [vlabbuilder.go L1098–L1119, L1231](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/pkg/hhfab/vlabbuilder.go#L1098), [L1304–L1314](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/pkg/hhfab/vlabbuilder.go#L1304) **F** (R03 owns the full trace) |
| AI Network Planner ([plan.hedgehog.cloud](https://plan.hedgehog.cloud/)) and the ROI page | The public ROI page links it as "Calculate your AI Network Value" and the "Hedgehog ROI Calculator". It promises to "calculate your savings and revenue impact" and addresses AI cloud providers, DevOps teams and executives weighing CapEx, OpEx and revenue. The planner page is client-rendered; I did not operate it. Public material describes **no topology sizing or wiring output**. | Apparently a different persona and job (**H**). Possible hand-off: cluster size and architecture choice there become the opening intent in hh-aid. Avoid naming collisions ("planner"). | Fetched [hedgehog.cloud](https://hedgehog.cloud), the [ROI page](https://hedgehog.cloud/ai-network-planning-roi) and [plan.hedgehog.cloud](https://plan.hedgehog.cloud/) (page title only), 2026-11-07 **F/H** |
| Free consultation; NVIDIA and OCP reference-architecture pages on hedgehog.cloud | Human design service and marketing references | The consultation is presumably delivered today by the persona hh-aid serves. **H** | hedgehog.cloud fetch **F** |
| 26.05 multi-fabric and multi-domain | One controller manages several fabrics. A fabric can have several domains (spine sets). This explicitly enables "multi-plane backends with dedicated spines per plane and shared leaves." | Documented *use* of domains for multi-plane backends. A domain is an upstream spine set with EVPN route boundaries. It is **not** a first-hop rail domain, and documented use does not establish arbitrary plane-isolation or physical failure-domain guarantees (§13.3). This affects R02, R04 and D01. | [release notes L19–L22](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/release-notes/index.md#L19); [multi-fabric.md L19, L29, L308](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L29) **F** |

### 3.2 Sponsor-owned public prior work

| Asset | Observed purpose (README level) | Product implication |
| --- | --- | --- |
| [afewell-hh/aid](https://github.com/afewell-hh/aid), "AI Infrastructure Designer", about 151 commits, last pushed 2026-08-22 | Calculates switch infrastructure from server inventory, validates mesh/Clos/dual-plane constraints, derives a hierarchical BOM, exports hhfab-validated wiring, and optionally publishes to NetBox. Stack: MoonBit kernel with formally proved arithmetic cores, Rust/Go adapters, WASM components. | The **same product thesis**. Its history and results are the most relevant discovery input. Its current status is an open question (Q-SP1); the commit dates alone show nothing either way. The sponsor's HNP R4 record calls AID's "current implementation … uninspected, historical only" ([hh-netbox-plugin#758](https://github.com/afewell-hh/hh-netbox-plugin/issues/758)). **F** |
| [afewell-hh/hh-netbox-plugin](https://github.com/afewell-hh/hh-netbox-plugin) (HNP), about 624 commits | A NetBox plugin for Hedgehog CRDs with a self-service catalogue and Kubernetes sync. Issues #754–#764 record a "research reset" covering salvage, a blank-sheet designer, a progressive questionnaire (R6, accepted as source research) and a repair-versus-rebuild comparison. | It contains source research accepted *within that project, with qualifications*, on progressive questionnaires (#760) and salvage (#758). Proposal: hh-aid uses those conclusions as **inputs to evaluate**, not as accepted hh-aid decisions, and avoids repeating them. The record shows heavy review overhead, and #763 stopped "unaccepted"; that is a process lesson. **F** |
| [afewell-hh/OCP-OCDAI-training-fabric](https://github.com/afewell-hh/OCP-OCDAI-training-fabric) and the inference counterpart | Hedgehog and Celestica OCP reference-architecture assets: connectivity maps, topology-map YAML, per-fabric wiring, draw.io diagrams and NetBox inventory for OPG-64…512 and XOC-256…1024, in rail-optimised and single-homed variants. Some large compositions are "partially populated where scale pushes against current port budgets." | **Candidate golden-fixture source** (CC0-1.0 licence observed via the GitHub API) and a public, non-customer scenario set. Each asset still needs verification against the 26.05 support contract. **F/H** |
| [afewell-hh/hh-validator](https://github.com/afewell-hh/hh-validator) (2025-07) | `hhfab validate` as a web service and CLI | An earlier answer to "validate without installing hhfab." Relevant to D05. **F** |
| [afewell-hh/metal](https://github.com/afewell-hh/metal) (2025-01) | "NOT FUNCTIONAL" early spine-leaf configuration generator | Historical only. **F** |

### 3.3 Current pre-sales workflow: a hypothesis to validate

Public sources do not describe how Hedgehog pre-sales and design staff produce customer designs today. Hypothesis **H-W1**: the incumbent path is mostly manual or semi-automated. A plausible shape is requirements captured in spreadsheets or documents, then hand-authored or script-generated wiring YAML, then `hhfab validate` and `hhfab diagram`, then slides or documents for the customer. It may also include internal tools that are not public. This is the workflow to interview against (Q-S2, Q-S3), measure against (time, error rate: SM1, LG1) and, if it has a reviewed handoff format, keep compatible with (A-08, D1).

Policy for this document: details of any non-public tool or design stay out of this repository until the sponsor decides D5. Synthetic or public fixtures (for example the OCP repositories in §3.2) keep work moving meanwhile.

## 4. Personas and jobs

All personas are **H** until interviews confirm them. "Evidence basis" says where each hypothesis comes from.

| ID | Persona | Primary jobs (when…, I want…, so that…) | Evidence basis | Priority |
| --- | --- | --- | --- | --- |
| P1 | **Pre-sales / solutions engineer (SE)**, Hedgehog or partner | When a prospect says "eight NVL72 racks" or "512 B300 nodes", I want a credible switch, link and component estimate with explicit assumptions within hours, so that I can respond, price it and move the deal on without committing to an unverified design. | Sponsor scenarios (**S**); "Free consultation" offer on hedgehog.cloud (**F**); H-W1 (§3.3) | Primary |
| P2 | **Fabric designer / network architect**, Hedgehog field engineer or customer architect | When requirements firm up, I want to choose profiles, rails, planes, domains, redundancy and placement, see which are supported by a named Hedgehog release, and get validated wiring, so that the design can be approved and installed without rework. | Sponsor brief (**S**); wiring-authoring docs (**F**) | Primary. Probably often the same human as P1 (**H**, test A-02). |
| P3 | **Installer / DC technician / integrator** | When cabling the hall, I want a per-rack, per-port cable schedule with labels, assembly types and a pick list, and a way to record deviations, so that I cable correctly once and can prove it. | R06 scope; sponsor lifecycle requirement (**S**) | Secondary consumer. R06 owns the detail. |
| P4 | **Fabric operator / customer NetOps** | When the fabric grows, shrinks or a part is replaced, I want the approved design and its intent, a diff against what is installed, and an updated wiring package, so that changes don't break rails, domains or redundancy. | Shrink/expand docs; immutable-domain rules (**F**); sponsor "lifecycle handoff" (**S**) | Secondary. Probably later slices. |
| P5 | **Hedgehog support / maintainers** | When a customer reports a problem, I want to see the intended design and which supported capability it relies on, so that I can reproduce it and confirm support quickly. | Inferred (**I**) | Tertiary. Also the authority for support disputes. |
| P6 | **Executive buyer** | Business case and ROI | Served by plan.hedgehog.cloud (**F**) | Out of scope apart from a possible hand-off. |
| P7 | **Procurement** (customer or integrator) | Turn a BOM into orders | Sponsor boundary note (**S**) | External consumer of the BOM export only. |

**Persona questions (Q).** Do customers ever run hh-aid themselves (self-service), or only Hedgehog staff and partners? The answer drives hosting, data sensitivity and support burden (D3). Is the installer usually a third-party integrator with its own tooling, such as DCIM, NetBox or a spreadsheet?

## 5. Journeys: exploration to lifecycle

This is the product-level journey. R06 will refine stages J4–J7 into artifacts and acceptance evidence, and D02 will turn them into flows. Each stage has a **completeness gate**: an early estimate and an installation-ready export are different products (**S**).

| Stage | Actor | Inputs typically known | Output | Gate to leave the stage (proposal **H**) |
| --- | --- | --- | --- | --- |
| J0 Enquiry | P1 | Endpoint class and count ("512 B300 HGX"), maybe a rack count | A captured intent; nothing derived yet | Intent recorded with its source |
| J1 Provisional estimate | P1 | J0 plus defaults (named, versioned, visible) | Switch/link/optic order-of-magnitude, fabric list (frontend/backend/storage/management), unresolved questions ranked by impact | Every number traces to inputs, defaults or assumptions. Output watermarked "PROVISIONAL – not deployable". |
| J2 Refined design | P1/P2 | Server and switch profiles, rails/planes, redundancy, placement, growth | A candidate topology per fabric, its constraint status, alternative scenarios | No hard-constraint violations. Remaining unknowns are explicitly listed. |
| J3 Design review and approval | P2 plus customer; Hedgehog authority for support claims | J2 | An approved, versioned baseline with a support-evidence statement for a named release | Support matrix rows cited (R02); independent checks pass; named approver recorded |
| J4 Procurement package | P2 → P7 | J3 | BOM quantities by part class, with compatibility evidence and spares policy | Counting is reconciled (assemblies vs transceivers, R05); pricing marked as an estimate and dated |
| J5 Installation package | P2 → P3 | J3 plus serials/MACs when known | Wiring YAML for hhfab, cable schedule, labels, rack elevations as needed | `hhfab validate` passes at the pinned version; critical unknowns resolved (installation-ready gate) |
| J6 Installation and acceptance | P3, operator | J5 and the physical reality | As-built deviations; acceptance evidence | Deviations either accepted into a new revision or fixed |
| J7 Lifecycle | P4 | Approved baseline, observed state | Expand/shrink/replace revisions; drift reports | Each change produces a diff showing invalidated connections, quantities and approvals (**S**) |

**Lifecycle constraint worth surfacing early.** The 26.05 docs say "the leaf ASN range, the domains and their ASNs are fixed once the fabric is created. Domains can not be added, removed or renamed." They also say fabric and domain references cannot be changed, so moving an object to another fabric or domain means deleting and recreating it ([multi-fabric.md L265](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L265)). **F**

The docs also mention that after an upgrade "more domains need a new Fabric". That suggests at least one alternative, a separate Fabric, but I have not established its consequences for an existing design. **F/Q**

Proposal (**H**): ask growth questions (planes, domains, ASN ranges) before J3 approval, and warn when a requested change touches an immutable field. This document does **not** claim that a new plane always requires a rebuild. Forbidden transitions and the non-forbidden but unproven alternatives are summarised in §13.2.

## 6. Costly failure modes

Ranked by my estimate of cost × likelihood (**H**; to be validated in interviews, guide §9 Q-S5 and Q-I3).

| # | Failure | Who pays | Why costly | Detection hh-aid should provide |
| --- | --- | --- | --- | --- |
| FM1 | Wrong or incompatible optics, cables or breakout assemblies ordered | Customer, integrator, Hedgehog reputation | Long lead times, money, site delays | Compatibility evidence per link; unknown compatibility blocks the procurement gate (R05) |
| FM2 | Design presented as deployable but unsupported by the target release. Examples from the 26.05 docs: a shared leaf with a gateway or external connection, a mesh link in a multi-domain leaf, ESLAG across domains. | Hedgehog support and the customer | Discovered during or after install; erodes trust in Hedgehog | Release-pinned support matrix check (R02), separate from schema validity. The examples are **F** from the [multi-fabric constraints](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L308) |
| FM3 | Spine or uplink capacity under-sized, or bandwidth balance mistaken for nonblocking | Customer (re-purchase), deal credibility | Late discovery means a new BOM and re-cabling | Independent capacity oracle (D04); explicit oversubscription definition (R04) |
| FM4 | Rail or plane mis-mapping (a NIC on the wrong rail leaf, planes crossed) | Customer (silent collective-communication performance loss) | Hard to diagnose; looks like a performance problem, not a wiring fault | Rail/plane membership checks; installer cable schedule names rails explicitly |
| FM5 | Silent assumptions: defaults presented as facts | SE and customer | The quote or design is wrong and nobody knows why | Provenance per value; provisional watermark; "next useful question" |
| FM6 | Non-deterministic regeneration: names or ports reshuffle after a small change | Installer, operator | Cabling rework, invalid labels, broken as-built records | Stable identity and semantic diff (D01); regeneration test in the slice |
| FM7 | Lifecycle-hostile structure (domains/ASNs chosen without considering growth) | Operator | A later change may touch fields fixed at creation (**F**). Alternatives exist but are unproven, and migration safety is unresolved (§13.2). | Growth questions before J3; an explicit "immutable after creation" warning |
| FM8 | Double counting, or missing components such as a multi-ended shuffle counted as several cables, or management/BMC links forgotten | Procurement | Over- or under-ordering | BOM reconciliation checks (R05/D04) |
| FM9 | Too slow or too laborious for the pre-sales turnaround, so users go back to the spreadsheet | Product adoption | hh-aid becomes another unused tool (cf. §3.2) | Time-to-estimate success measure (§7) |
| FM10 | Customer data committed to a public repo or sent to the wrong party | Hedgehog legal and reputational | Contractual breach | Data-handling boundary (D3/D5); no customer fixtures in this repo (**S**, AGENTS.md) |
| FM11 | Tool and effort fragmentation: hh-aid duplicates AID/HNP or current internal-workflow capabilities without a migration story | Sponsor's team | Several half-maintained tools | Decision D1; overlap ledger (§3) |
| FM12 | Process overhead outweighs delivery | Sponsor | Months of gated documents, no usable slice (precedent in §3.2) | Timeboxed learning goals with executable exit evidence (§10) |

## 7. Success measures

These are proposed targets for the sponsor to accept or adjust (**H**). Baselines must come from interviews or timing the incumbent workflow. Where a baseline is "TBD", the first learning goal is to measure it.

| Measure | Definition | Proposed target for the first slice | Baseline |
| --- | --- | --- | --- |
| SM1 Time to first provisional estimate | Minutes from a sparse request (≤3 answers) to a reviewed estimate with ranked unknowns | ≤15 min for a slice-supported scenario | TBD: time the incumbent path, whatever it proves to be (H-W1, Q-S2) |
| SM2 Assumption visibility | In a task test, the share of displayed quantities whose source (input, default or derived) users identify correctly | ≥90% | n/a |
| SM3 Pinned upstream validation | Share of installation-gate exports that pass `hhfab validate` at the pinned version, with warnings captured | 100% (any failure blocks release). Necessary, not sufficient: support, hardware and requirement checks are separate (SM4, R02). | n/a |
| SM4 Independent agreement | Agreement between generator and independent oracle (D04) on ports, endpoints, rails, capacity and BOM, across golden and mutation fixtures | 100% on golden fixtures; every seeded mutation detected | n/a |
| SM5 Determinism | Identical inputs give byte-identical canonical output. A one-field change gives a diff limited to its explained impact set. | 100% | n/a |
| SM6 Installer clarity | In a tabletop walk-through, clarification questions an installer needs per 100 links of the cable schedule | ≤1 | TBD (Q-I2) |
| SM7 Adoption intent | SEs and designers who would use hh-aid instead of the incumbent workflow for the slice's scenario after a demo | ≥3 of 4 interviewed | n/a |
| SM8 Coverage honesty | Share of supported topology families (R02) that are either covered or visibly listed as deferred in the ledger | 100% listed; covered share reported, not targeted | n/a |

## 8. Product boundaries and ownership

### 8.1 Product boundaries (proposal, H; sponsor to confirm)

| Category | Boundary |
| --- | --- |
| **In** | Progressive capture of design intent, including sparse and conflicting inputs. Topology allocation and verification for **Hedgehog-managed** fabrics within a named release's support contract. Wiring objects and associated resources for hhfab. Component quantities (BOM) with compatibility evidence. Installation handoff artifacts. Design baselines, revisions and diffs. |
| **Modelled, not managed** | Networks Hedgehog does not manage but the design depends on: out-of-band/BMC (subject to R02's finding on Hedgehog's management boundary), external and upstream networks, scale-up domains (for example NVLink inside an NVL72 rack), and non-Hedgehog switches. These appear as dependencies or ports consumed, **never as deployable Hedgehog fabrics** (**S**). |
| **Out (now)** | Live controller writes and fabric operation (owned by Fabric/hhfab and operator GUIs); procurement transactions, pricing authority and quotes; power, cooling and weight engineering; ROI/business modelling (plan.hedgehog.cloud); support claims beyond what a Hedgehog authority has confirmed. |
| **Deferred, needs a decision** | Self-service customer access; import of existing wiring or spreadsheets (round-trip); drift import from a live fabric; cable-reach and rack-elevation detail; multi-site designs. |

### 8.2 Ownership boundaries for procurement, live deployment and lifecycle

This is a proposal for **sponsor review**, which the acceptance criterion requires. R06 refines the artifacts.

| Concern | hh-aid owns | Others own | Interface |
| --- | --- | --- | --- |
| **Procurement** | Quantities by part class; compatibility evidence; spares-policy application; dated, labelled price *estimates* if a catalogue exists | Customer/integrator procurement: SKU selection where alternatives exist, quotes, orders, lead times. Hedgehog sales: commercial terms (**H**). | BOM export (CSV/JSON) carrying the design revision and catalogue version |
| **Live deployment** | Generating an installation package for a pinned hhfab/Fabric version and pre-validating it | **hhfab and Fabric**: validate, build, install, and the controller's desired state. **Operator**: runs installation, holds credentials and secrets. | Wiring YAML and include files that hhfab consumes. hh-aid never holds switch credentials and never writes to a live controller in early slices. |
| **Lifecycle** | The *intended* design: rationale, approvals, revisions, change-impact analysis, and regenerated packages for expand/shrink/replace | **Fabric controller**: the authoritative applied and observed state. **Operator GUIs/kubectl**: day-2 operations. **Customer DCIM/NetBox** (if any): asset records. | Read-only import of observed state or as-built deviations (deferred), producing a drift report; changes leave hh-aid as a new revision |

**Q:** should hh-aid export to NetBox, given that AID, HNP and the OCP repositories all did (§3.2)? Proposal: treat NetBox as an optional downstream export, not a system of record, until D05 evaluates it.

## 9. Interview guide

**Status: prepared, not conducted.** The sponsor relays these questions, and answers must be recorded as real interviews with the date, role and consent. Do not commit names, customer identifiers or customer topologies to this repository; keep raw notes privately and record only sanitised findings here.

**Order of priority.** Run the sponsor session first (it unblocks decisions). Then SEs and designers, who are the primary personas and validate the riskiest assumptions A-01 to A-05. Installers and operators follow. Hedgehog maintainers or the support authority are consulted through the sponsor for support disputes only, not product taste.

**Session format (H).** 45 minutes. Open with a recent-story prompt ("walk me through the last cluster you sized") rather than hypotheticals. Collect any sanitised artifact the participant can share, and close with a ranking exercise.

### 9.0 Sponsor (decision session; maps to §12)

| ID | Question | Tests |
| --- | --- | --- |
| Q-SP1 | Which existing tools should hh-aid replace, absorb, integrate with or leave alone (AID, HNP, the OCP repositories, the gpu-rail preview generator, and any current internal design or operations tools)? What is AID's current status, and what did it teach? | A-08, A-13, D1 |
| Q-SP2 | Who runs hh-aid in its first year: Hedgehog SEs only, partners, or customers? | A-02, A-10, D3 |
| Q-SP3 | Which Hedgehog releases must be supported: latest only (26.05), or N-1 too? | A-11, D4 |
| Q-SP4 | May sanitised real designs be used as private fixtures? Where may they live? | D5 |
| Q-SP5 | Which outcome would make the first slice a success worth continuing? (Pick one or two measures from §7.) | §7 |
| Q-SP6 | What review weight do you want per ticket (number of reviewers, caps), given the earlier research reset? | D6 |
| Q-SP7 | Can you introduce 2–4 SEs/designers, 1–2 installers and 1–2 operators for interviews? | Evidence gap |

### 9.1 Solutions engineers and fabric designers (P1/P2), highest priority

| ID | Question | Tests |
| --- | --- | --- |
| Q-S1 | Tell me about the last GPU-cluster request you sized. What did the customer actually tell you at first, and what did you have to assume? | A-01, A-03 |
| Q-S2 | How long did the first estimate take, and the installable wiring? Which steps took longest? | SM1 baseline |
| Q-S3 | Which tools did you use (spreadsheets, scripts, hhfab, diagrams, slides, anything internal)? Where did you copy data by hand? Is there a reviewed handoff format? | A-08 |
| Q-S4 | Which questions do you ask every customer, and in what order? Which answers most often change later? | A-04, D01 input |
| Q-S5 | Tell me about a design that went wrong after it was handed off. What was the cost? | §6 ranking |
| Q-S6 | How do you decide whether a topology is supported by Hedgehog today? Whom do you ask? | A-06, R02 |
| Q-S7 | When you present an estimate, how do you show what is still uncertain? Has a customer ever treated an estimate as a commitment? | A-05 |
| Q-S8 | How do you handle rails, planes and NVL72-style racks today? Which variants have you actually seen? | R04 scenarios, A-07 |
| Q-S9 | What BOM detail does the customer expect from you (optics, cables, spares, prices)? | R05, A-09 |
| Q-S10 | If one tool did this end to end, what would make you distrust its output? | SM2, trust |

### 9.2 Installers and integrators (P3)

| ID | Question | Tests |
| --- | --- | --- |
| Q-I1 | What documents do you receive before cabling, and in which format? What do you have to re-create? | R06 artifacts |
| Q-I2 | What causes most of your questions or rework on site? | SM6 baseline, FM1/FM4 |
| Q-I3 | How are deviations (a substituted cable, a moved port) recorded, and who approves them? | J6, R06 |
| Q-I4 | How do you label cables and ports? Is there a customer standard? | R06 |

### 9.3 Operators (P4)

| ID | Question | Tests |
| --- | --- | --- |
| Q-O1 | After installation, where does the design rationale live? Have you needed it later? | A-12, J7 |
| Q-O2 | Describe your last expansion or replacement. What had to be re-planned? | FM6, FM7 |
| Q-O3 | Would you trust a tool that compares the intended design with what is running? What would it have to show? | Drift (deferred) |

### 9.4 Hedgehog maintainers or support authority (through the sponsor, evidence only)

| ID | Question | Tests |
| --- | --- | --- |
| Q-M1 | Is the `generate-gpu-rail` preview meant as a test fixture only, or as a seed of supported rail-optimised designs? Should hh-aid align with its conventions? | I-claims in §3.1, R03 |
| Q-M2 | Which designs do customers most often get wrong in wiring diagrams submitted to support? | §6 |

## 10. Learning goals and candidate vertical slices

### 10.1 Measurable learning goals

Each goal is timeboxed. "Exit evidence" must be an artifact, not an opinion.

| ID | We believe… | We will learn by… | Exit evidence / threshold | Timebox (planning, not a promise) | Owner |
| --- | --- | --- | --- | --- | --- |
| LG1 | SEs and designers are the primary users and the incumbent workflow is too slow or error-prone (A-01, A-02) | Interviews Q-S1 to Q-S5 with ≥3 participants; timing one sanitised incumbent run | Recorded interviews; SM1 baseline measured; top 3 failure modes ranked by participants | 1–2 weeks of calendar time, depending on sponsor introductions | R01, sponsor |
| LG2 | A sparse request can produce a *useful* provisional output without false precision (A-03, A-05) | D02 paper prototype of J1 for "512 B300 HGX" and "8 NVL72 racks", tested with ≥3 SEs | ≥3 of 3 identify assumptions correctly (SM2 ≥90%); each names at least one next question as the right one | One D02 iteration | D02 |
| LG3 | The rail-aware allocation for 32/64 nodes can be expressed within the 26.05 support contract and exported to wiring that `hhfab validate` accepts (A-06, A-07) | R02 matrix rows plus R04 worked cases, then S01 spike | `hhfab validate` passes at v0.51.4; independent oracle agrees; a negative case is rejected with an explanation | M3 spike | R02/R04 → S01 |
| LG4 | Regeneration can be deterministic with stable identities (FM6) | S01 regeneration after a one-field change | SM5 met; the diff names its impacted connections | Same spike | S01/S02 |
| LG5 | The incumbent workflow's handoff, if one exists (H-W1), can be a compatibility target instead of a competitor (A-08) | Reproduce one already reviewed design in the slice and compare outputs. Use a public OCP composition until D5 permits a sanitised real one. | Equivalence report with explained differences, or a documented reason it cannot be reproduced | After S01 | Sponsor decision D1, then a spike |
| LG6 | Installers can work from the generated cable schedule (A-09) | Tabletop walk-through with one installer | SM6 ≤1 clarification per 100 links | After R06 artifacts exist | R06/D02 |

### 10.2 Candidate vertical slices

Each slice runs the full chain: inputs, allocation, independent checks, upstream validation, wiring/BOM export, and regeneration after a change (per `docs/design-process.md`). **D06 chooses; this table only frames the options.**

| Slice | Scenario | Value | Risk tested | Main dependencies | Assessment (H) |
| --- | --- | --- | --- | --- | --- |
| **VS-A** Frontend leaf-spine | N servers dual-homed to a redundant leaf pair (or ESLAG) plus spines; one fabric, one domain; one verified switch profile | Medium: common, but it is the least differentiated from hand-authored YAML | End-to-end pipeline, stable identity, BOM counting | R02 (ESLAG/unbundled support rows), R05 | Safest. A good fallback if hardware evidence for the backend is late. |
| **VS-B** Rail-optimised backend, one plane | 32 and 64 HGX-class servers × 8 rails onto rail leaves (with packing variants per sponsor scenario), 800G cage → 2×400G breakout, spines sized by an explicit policy | **High**: the core GPU differentiator and the sponsor's main scenarios | Rails as an hh-aid concept over upstream objects, breakout lane exclusivity, spine capacity, the comparison with the `gen-gpu-rail` preview | R02, R04, R05; switch profile with verified breakout | **Recommended core.** |
| **VS-C** Sparse provisional estimate (no export) | "512 B300 HGX" or "8 NVL72 racks" with ≤3 answers, giving an estimate plus ranked unknowns | High for SEs (J1), and a scale test | Answer states, provenance, the provisional gate, scale of derived counts | D01, D02, R04 | **Recommended as the front of VS-B**, sharing one domain model. It must never produce an installation export. |
| **VS-D** Reference reproduction | Re-create one published OCP composition (public), or later a sanitised real design under D5, and compare | High for the migration and fidelity story | Real-world fidelity; fixture verification against 26.05 | D1, D5 decisions; R04 check of the fixture | A follow-on to VS-B, not first |

In the table above, "Recommended" means proposed for D06; nothing is decided.

**Proposal (H):** VS-C as the front of VS-B for a single plane, with VS-A held as a fallback. Two-plane B300 and NVL72 shuffle variants are explicitly deferred to the next slice, because 26.05's multi-domain rules (shared leaves, no gateway or external connections on shared leaves) add support risk that R02 must settle first.

### 10.3 Coverage commitment preserved

The first slice is a delivery sequence, not the product scope (**S**). Topology and connection families visible in the 26.05 docs that the slice will **not** cover must appear as deferred rows in the coverage ledger. R02 owns the authoritative list. Families seen so far (**F**, docs and `hhfab vlab generate` flags):

- spine-leaf and mesh
- unbundled, bundled, ESLAG and multi-homed server connections
- gateways
- BGP, static and static-proxy externals
- multiple domains with shared leaves
- multiple fabrics interconnected through externals
- numbered vs unnumbered fabric links

hh-aid must not claim a family until it has an R02 row, fixtures and verification evidence.

## 11. Assumptions register

Priority = impact if wrong × uncertainty. "Test" names the interview question or experiment.

| ID | Assumption | Label | Confidence | If wrong | Test | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| A-01 | The main pain is turning sparse requests into credible estimates and designs quickly | S/H | Medium | The product focus shifts, for example towards install or lifecycle | Q-S1, Q-S2, LG1 | P0 |
| A-02 | SEs and designers are the same small group of Hedgehog staff and partners in year one | H | Medium | Hosting, security and UX change (D3) | Q-SP2, Q-S3 | P0 |
| A-03 | Users accept provisional outputs if the assumptions are visible | H | Medium | The progressive model fails; users want only final answers | Q-S7, LG2 | P0 |
| A-04 | A dependency-aware question set (not a giant form) covers what SEs ask | S/H | Medium | Data-model rework | Q-S4, D01 | P1 |
| A-05 | Customers treat estimates as commitments unless they are clearly marked | H | Low-medium | Watermark/gate design matters less | Q-S7 | P1 |
| A-06 | 26.05 supports enough of the rail-optimised backend shape for a first slice | H/I | Medium | The slice moves to VS-A | R02, LG3 | P0 |
| A-07 | Rails, planes and domains are hh-aid planning concepts mapped onto upstream objects. 26.05 domains cover *planes* only partially. | H/F | Medium | Domain-model mapping changes | R02, R04 | P0 |
| A-08 | Whatever workflow pre-sales uses today (H-W1) should be superseded *compatibly*, not replaced abruptly | H | Medium | Migration and adoption risk (FM11) | Q-SP1, LG5 | P0 |
| A-09 | Installers need per-port cable schedules and labels from the design tool rather than from their own DCIM | H | Low | The J5 export scope shrinks or changes | Q-I1, LG6 | P1 |
| A-10 | Customer topology data is sensitive enough to rule out public hosting in early slices | H/S | High | Architecture choices (D05) | Q-SP2, Q-SP4 | P1 |
| A-11 | Supporting only the latest release (26.05) is acceptable at first | H | Medium | Multi-version adapter needed early | Q-SP3 | P1 |
| A-12 | Operators value stored design rationale at lifecycle time | H | Low | Lifecycle features deprioritised | Q-O1 | P2 |
| A-13 | Prior AID/HNP work contains reusable research and fixtures, but not necessarily code to continue | I | Low-medium | Duplicated effort, or sunk-cost continuation | Q-SP1, R03 | P1 |
| A-14 | The OCP reference-design repositories are suitable public golden-fixture candidates | H | Medium | Fixtures must be built from scratch | R04/D04 verification against 26.05 | P2 |
| A-15 | The `generate-gpu-rail` preview reflects maintainer interest in rail designs but is not a support statement | I | Medium | hh-aid misreads support (FM2) | Q-M1 | P1 |
| A-16 | SM1's target of ≤15 minutes is meaningful against the incumbent | H | Low | Wrong success bar | LG1 timing | P2 |

## 12. Decisions requested from the sponsor

All recommendations below are scout's proposals for the sponsor. None is a decision.

| ID | Decision | Options | Proposal (H) |
| --- | --- | --- | --- |
| D1 | hh-aid's relationship to AID, HNP, the OCP repositories, `gen-gpu-rail`, and any current internal design or operations tools | (a) Clean product that reuses prior *research and fixtures* only. (b) Continue AID or HNP. (c) Integrate as a new producer behind an existing handoff format, if one exists. (d) Leave them all alone. | (a), plus (c) if interviews confirm such a handoff. Evaluate prior HNP research (#758, #760, #761, #762) as input, not as accepted hh-aid decisions. Use the public OCP assets as candidate fixtures. Let R03 judge code reuse on evidence. Continuing code (b) needs separate evidence. |
| D2 | Primary persona for the first slice | P1 SE / P2 designer / both | Both, treated as one user group, until interviews show otherwise |
| D3 | Who may use hh-aid in year one | Internal only / internal plus partners / customer self-service | Internal plus selected partners, offline-capable, so customer data stays out of shared services |
| D4 | Supported release policy | Latest only / N and N-1 / pinned per project | Pinned per design project, starting with 26.05 only |
| D5 | Private-data policy for real designs | None / sanitised in a private repo / raw in a private repo | Sanitised fixtures in a private location, referenced by hash from this public repo |
| D6 | Process weight | Current gates / lighter caps | One author, one independent reviewer, one correction round per M1 ticket. Escalate only on a factual dispute. |
| D7 | Accept or adjust the success measures (§7) and learning goals (§10.1) | — | Accept SM1–SM5 for the first slice |

## 13. Cross-ticket reconciliation

Revision 1 of this draft said `hhfab validate` "proves admission" and that a later plane or domain is "a disruptive change, not an edit". Lead flagged both as over-strong, and they are corrected above. Revision 3 brings in two sibling documents:

- compat's independent review of R03 ([#4 comment 6711820797](https://github.com/afewell-hh/hh-aid/issues/4#issuecomment-6711820797), with the [#3 reconciliation 6711823329](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6711823329));
- bridge's R03 revision 2 ([commit 7459463](https://github.com/afewell-hh/hh-aid/blob/7459463688a35f1fb8c1d4b0093c241a1f23c149/docs/research/upstream-reuse.md)).

Both are **peer research reports under review**, not accepted hh-aid facts. Neither one executed admission, runtime or hardware checks. Lead independently source-checked the validation and immutability points ([#3 comment 6712217138](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6712217138)). R01 uses the wording below and will follow later corrections.

### 13.1 What a pinned `hhfab validate` pass means

**compat's proposition ([#4](https://github.com/afewell-hh/hh-aid/issues/4#issuecomment-6711820797)).** A successful pinned run establishes only one thing: this input, configuration, defaulted and hydrated in-memory snapshot, and the registered profiles completed the checks that CLI executes, without a returned error. It does **not** establish any of the following:

- full Kubernetes structural (CRD schema) admission;
- gateway dataplane acceptance;
- update/delete legality against an installed fabric;
- controller or NOS convergence;
- physical compatibility;
- performance;
- support for warning-only deprecated features.

bridge's revision 2 defines this as the **U-gate**. It reads a pass as "accepted by upstream semantic validation at pin P, excluding G1–G6" and lists the gaps G1–G7 ([§3.1](https://github.com/afewell-hh/hh-aid/blob/7459463688a35f1fb8c1d4b0093c241a1f23c149/docs/research/upstream-reuse.md#L101)).

| Gap | Evidence status |
| --- | --- |
| Fabric's design rule that hhfab validation match webhooks (`pkg/ctrl/README.md`) | Documented **intent**, not demonstrated parity. The same README lists a Gateway/GatewayPeering exception ([README](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/README.md)). |
| G1 CRD schema admission not applied offline | bridge reports a 1-link ESLAG Connection passing `hhfab validate` although the CRD has `minItems: 2`. This is **author-reported execution**, not independently reproduced. Real API-server rejection was not executed. |
| G2 gateway dataplane checks in create webhooks | Source-read by compat and bridge ([gateway_wh.go L57](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/gateway_wh.go#L57)) |
| G3 warnings discarded (`defaultAndValidate`), for example MCLAG's "unsupported" warning | Source-read by compat and bridge |
| G4 creation-order dependence; G5 update/delete webhooks; G6 Connection-variant exclusivity | Inference, or static findings not executed |
| G7 NOS/controller convergence, hardware, optics, RoCE, planning intent | Out of scope of `Validate()` |
| First error only; which error comes first varies between runs | bridge observation (single runs). compat: "all errors" cannot simply be collected from early-return validators. |

**Product consequence (H).** A pinned validation pass is one necessary gate (SM3). The installation-ready gate also needs:

- R02 support-matrix rows for every capability used;
- hh-aid's own rejection of unsupported or warning-only families;
- a CRD-schema check;
- extra handling, or an explicit label, for gateway-bearing exports;
- D04's independent checks for rails, planes, capacity and BOM;
- explicit statements of what hardware and runtime facts remain unproven.

UX implication for D02: validation messages may be one-at-a-time and order-unstable. Any user-facing "all problems" list is advisory diagnostics, and the gate's verdict is authoritative.

### 13.2 Immutable Fabric fields and growth

**Documented and source-read (F):** the docs say a Fabric's leaf ASN range, domains and ASNs are fixed at creation ([multi-fabric.md L265](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L265)). compat's narrower reading of [FabricWebhook.ValidateUpdate](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/fabric_wh.go#L115) is that an update to an existing Fabric may not:

- change already-nonzero leaf ASN bounds;
- remove or rename a populated domain;
- change a domain's already-nonzero spine or gateway ASNs;
- add domain names when the old domain map is non-empty.

Legacy unset values can be filled, subject to validation. `disableBFD` is not frozen by these checks. [SwitchWebhook.ValidateUpdate](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switch_wh.go#L72) freezes a switch's ASN, Fabric membership and normalised domain membership. Reordering the list is not a membership change.

**Alternatives that are not forbidden (compat, unexecuted):**

- a new installation that declares several domains from the start;
- adding switches to an already-declared domain;
- a separate new Fabric with disjoint ASNs and explicit interconnection through externals;
- a separately designed replacement or migration.

These are **not proven equivalent** in availability, physical isolation, addressing or interruption. Migration sequencing, disruption and rollback need ops (R06) and domain-authority review. Delete-and-recreate is not a safe procedure just because an error message mentions it.

**Product consequence (H):** growth intent (future planes or domains, ASN ranges) is a high-value question to ask before J3 approval. hh-aid should show which planned changes would hit a forbidden transition, and should list alternatives as options with open risks, not as a rebuild rule.

### 13.3 Planes, domains and rail domains

- **Documented use (F):** the pinned 26.05 docs describe multiple domains (spine sets) within one Fabric for "multi-plane backends with dedicated spines per plane and shared leaves" ([release notes L19](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/release-notes/index.md#L19), [multi-fabric.md L19](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L19)). compat calls this "documented support within stated constraints". bridge's revision 2 withdraws its earlier "weak naming signal" reading ([§6.1](https://github.com/afewell-hh/hh-aid/blob/7459463688a35f1fb8c1d4b0093c241a1f23c149/docs/research/upstream-reuse.md#L187)).
- **Separate concept:** a first-hop rail domain (servers whose rail NICs share a set of rail leaves) is an hh-aid planning concept. A spine belongs to exactly one upstream domain, so the sponsor's "two first-hop domains under a common spine layer" reads as **one** upstream domain, with the first-hop grouping held only in hh-aid (bridge §6.1; maintainer question pending).
- **Not established:** rail identity and GPU–NIC association; full plane isolation (underlay, failure independence, capacity, shared-leaf hardware); support for specific B300 plane designs on selected hardware. Shared leaves share physical failure exposure. Separate Fabric objects are another documented separation model, but they are not interchangeable with domains.
- **Working position (H):** "plane" and "first-hop rail domain" stay hh-aid planning concepts. A plane may map to an upstream domain, or to a separate Fabric, only where R02/R04/R05 confirm the scenario.

## 14. Acceptance criteria and evidence (#2)

| Criterion | Evidence in this document | Status |
| --- | --- | --- |
| Personas/jobs, journeys, costly failure modes, success measures, explicit product boundaries | §4, §5, §6, §7, §8.1 | Draft complete; personas and jobs unvalidated (no interviews) |
| Prioritised interview guide and assumptions register; missing stakeholder evidence recorded without blocking synthesis | §9 (prioritised, mapped to assumptions), §11; the gap is stated in §1 and LG1 | Draft complete; interviews not conducted |
| Measurable learning goals and candidate vertical slices that preserve full coverage | §10.1, §10.2, §10.3 | Draft complete |
| Ownership boundaries for procurement, live deployment and lifecycle, with sponsor review | §8.2 | **Awaiting sponsor review** |
| Facts, hypotheses, inferred maintainer intent and open questions separated; source versions and reproducible evidence | Labels throughout; §1 baseline; §15 commands; public sources only (§1, §3.3) | Done, pending reviewer check. Cross-ticket wording consolidated (§13); peer reports remain under review. |
| Independent reviewer disposition; sponsor/domain decisions recorded | — | **Not started.** Reviewers: ux and sponsor. Decisions D1–D7 pending. ux review assigned by lead. |

## 15. Reproducible evidence

```sh
# Pinned upstream sources (26.05 composition)
git clone --depth 1 --branch v0.144.1 https://github.com/githedgehog/fabric      # 4bde5082...
git clone --depth 1 --branch v0.51.4  https://github.com/githedgehog/fabricator  # d2316aca...
git clone https://github.com/githedgehog/docs && git -C docs checkout 1be68948e177dcc031e91659ab5293ba19893ccf

# Release composition
sed -n '7,60p' docs/docs/release-notes/index.md

# Existing generators and diagram command
grep -n 'HHFAB_PREVIEW\|"generate-gpu-rail"\|Name:  "diagram"' fabricator/cmd/hhfab/main.go
sed -n '1098,1300p' fabricator/pkg/hhfab/vlabbuilder.go

# Multi-domain immutability and constraints
grep -n 'fixed once the fabric is created\|^## Constraints' docs/docs/user-guide/multi-fabric.md

# Sponsor-owned public prior work (README and issue records)
gh api repos/afewell-hh/aid/readme --jq .content | base64 -d
gh issue view 760 -R afewell-hh/hh-netbox-plugin
gh issue view 763 -R afewell-hh/hh-netbox-plugin
```

No builds, tests or hhfab commands were run. All findings come from reading sources.

## 16. Limitations

- **No user evidence.** Every persona, job, ranking and target is a hypothesis.
- Public sources only. Non-public tools or workflows that may exist are not represented except as hypothesis H-W1, so the overlap inventory in §3 may be incomplete.
- Claims taken from sibling drafts (PR #17, #4/PR #18) are unreviewed and are labelled as reported.
- AID and HNP code was not inspected. Their histories are summarised from READMEs and issue records, and those records state their own qualifications.
- The docs are read at `master`, not the published 26.05 docs tag.
- The plan.hedgehog.cloud page is client-rendered. Its function is taken from the public ROI page and the page title, not from using it.
- Support-related remarks (§6 FM2, §10.2) quote the docs but are not support determinations. R02 and a Hedgehog authority own those.

## 17. Handoff

```text
Issue and role: https://github.com/afewell-hh/hh-aid/issues/2 — scout, R01 Product discovery lead
Branch/PR and artifact paths: branch r01-product-discovery, draft PR (see #2 comment) — docs/research/product-discovery.md
Source releases/commits: Hedgehog 26.05; fabric v0.144.1 4bde5082; fabricator v0.51.4 d2316aca; docs master 1be68948
Key findings: §2 (overlap with existing public tools; SE/designer proposed primary; physical/support failures probably costliest; immutable Fabric fields affect growth planning; process-overhead precedent; VS-C→VS-B proposed)
Acceptance criteria with evidence: §14
Cross-ticket reconciliation: §13 consolidated from compat #4 review 6711820797 and bridge 7459463
Assumptions and unresolved questions: §11, §9, §13, §16
Decisions requested (with alternatives): §12 D1–D7
Independent reviewer and review status: ux + sponsor — not yet reviewed
Recommended next assignment: sponsor decision session (Q-SP1–7), then interviews (LG1); R02/R04/R05 to confirm VS-B feasibility
```
