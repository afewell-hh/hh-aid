# hh-aid product context

## Intended outcome

hh-aid should help an engineer move from an early request such as “eight NVL72 racks” or “512 B300 HGX servers” to a complete, verified topology, component BOM, and installation artifacts for Hedgehog. It should retain the design's intent and provenance for later lifecycle handoff. The sponsor works at Hedgehog; this document preserves their initial requirements so agents do not repeatedly ask for the same context.

The application must eventually cover exactly the topology space supported by a specified Hedgehog Fabric release and its compatible hardware/software. A capability inventory and a coverage ledger are required before anyone claims completeness. A limited first release is a delivery sequence, not a redefinition of the ultimate scope.

## Sponsor decisions: audience, delivery order and release currency

Confirmed by the sponsor in this conversation after the R01–R06 research reviews:

- **Initial audience:** Hedgehog SEs, with possible access for selected partner SEs. Public self-service is not the initial target.
- **Primary outputs and delivery order:** a BOM first, then a connection map. Both are required ultimately. BOM generation is useful in its own right and is the first delivery priority; a complete connection-map export must not be a prerequisite for the first useful BOM.
- **Installation target:** Hedgehog installs the latest release. hh-aid must be optimized to keep design assets current with that release, rather than keeping a project indefinitely on its original software version. The sponsor reports that changes between releases are usually modest and that 26.05 was unusually extensive; this is operating context, not a guarantee about future compatibility.

Design implications to carry into D01–D06: retain exact release, source, rule and catalog versions for reproducibility of each generated revision, while separately tracking the current installation target. Offer release-change detection, impact review, revalidation and regeneration into a new revision; preserve previous approvals, user overrides, ordered parts and meaningful diffs. A version recorded in an artifact is evidence provenance, not a policy to install that old version. If latest-release evidence is missing or validation fails, show the affected assets as needing review rather than claiming they are current. Research pins for 26.05 remain historical evidence; verify the actual latest supported release composition before a current-release claim. Decide release-channel selection and update mechanics through design, not by assuming latest component tags form a supported bundle.

The first BOM still needs enough topology/rail/plane/port/assembly reasoning to justify its quantities and detect impossible requests. Detailed port-to-port assignment may follow later. Clearly distinguish conditional estimates, exact qualified quantities and procurement-ready packages; BOM-first does not itself decide which readiness level ships first. The sponsor has not selected a first hardware tuple or the previously proposed 32–64-node HGX scenario. Keep those as candidate examples, not accepted scope.

## Authoritative starting points

| Source | Why agents should inspect it |
| --- | --- |
| [Hedgehog](https://hedgehog.cloud) | Product positioning and links to official documentation |
| [Source organization](https://github.com/githedgehog) | Related components and integration boundaries |
| [Fabric](https://github.com/githedgehog/fabric) | Core APIs, validation, controller semantics, switch profiles, tests |
| [Fabricator](https://github.com/githedgehog/fabricator) | Installation, wiring handling, VLAB, and `hhfab vlab gen` |
| [Documentation](https://docs.hedgehog.cloud) | Supported deployments and operating workflows |

Bootstrap inspection of the upstream READMEs on 2026-11-07 confirmed Fabric/Fabricator responsibilities. Detailed support and reuse research remains assigned work. Pin upstream commits before producing technical conclusions; these moving links are entry points, not a version baseline.

## Planning and output model

The sponsor describes a conceptual “grand questionnaire”: the total set of inputs needed over a project's life. Users initially know little, answer more questions over time, and regenerate outputs at any stage. This is a conceptual information model, not a requirement to build one enormous form.

### Sponsor walkthrough feedback: persistent planning workspace

After reviewing the D02 walkthrough (PR #24 at 5a20827), the sponsor said it looked good overall but was too closely fitted to B200 and felt like a wizard users were expected to finish. This is actual sponsor feedback, not a completed usability study or acceptance of the design.

The primary interaction is a persistent project workspace with an editable questionnaire/details panel. A short starter wizard is acceptable only for the minimum inputs needed to produce something useful. The minimum depends on the requested output and scenario; it is not the full universe of design questions. After that, users add information in any useful order, generate assets, return later, add more information and regenerate refreshed assets repeatedly throughout planning. Incomplete information is an expected saved state, not an unfinished wizard or a failed task. Do not require all questions to be answered before the first useful BOM.

Keep the details panel and generated assets accessible together. Suggested next questions are optional assistance, not a mandatory sequence. Show which output revision reflects which input revision, what changed, and what remains assumed or unknown. Generating, saving and resuming must not imply finishing the design. Readiness is specific to an output or package, not percent completion of the entire questionnaire.

Use B200 as one replaceable scenario fixture, not as the application's fixed vocabulary, topology, default network or input schema. Demonstrate the same workspace across structurally different supported or explicitly conditional scenarios: server-count/rail-based planning, rack-based placement, and ordinary redundant endpoint mesh/leaf-spine planning. Keep arbitrary endpoint profiles, mixed network roles and non-NVIDIA equipment representable within Hedgehog's supported scope. A small prototype need not implement every topology; it must reveal where scenario-specific policies/data plug into the common interaction model. Choosing a first implementation slice must not hard-code the overall product around B200.

Investigate unknown, explicitly supplied, assumed, derived, conflicting, and stale answers; dependencies between answers; configurable defaults with provenance; overrides and locks; scenario branches; approvals; and change impact. An early estimate and an installation-ready export need different completeness gates. A later input change must explain which connections, quantities, costs, and previous approvals became invalid.

Hedgehog wiring objects are the deployment target. Server objects represent all kinds of non-switch Ethernet endpoints, Switch objects represent switches, and Connection objects represent relationships. Research additional required objects and semantics. The wiring API bounds deployable outputs, but may not express all planning intent, BOM detail, rack placement, or lifecycle evidence. Do not force all questionnaire information into upstream schemas.

### Sponsor feedback: independent questions and starter-design library

After reviewing D02 revision 2, the sponsor liked the overall direction but rejected the single-response “What do you know now?” question. “Servers by count, rail-based” combines independent information: endpoint quantities and a topology preference. The sponsor wants several well-chosen questions that elicit the minimum useful information while encouraging optional detail. A server-count field and separate rail-optimization checkbox were illustrative suggestions, not approved controls. Research established UX practices before choosing the interaction; a checkbox must not accidentally turn “not known” into “no”. Preserve the persistent workspace and partial-information workflow.

The sponsor explicitly likes the server-count, rack-count and similar home-screen entry categories. Keep them as perspectives for discovering a shared library of prebuilt starter designs. One topology may appear in several perspectives; categories must not impose mutually exclusive project types or different calculation semantics. Distinguish choosing a starter from answering independent questions when building from scratch.

Use clearly labelled library placeholders while the from-scratch tooling is designed. Once that tooling works, use the same tooling to build common reusable topologies; engineers then start from one and customize it for their unique real-world design. Do not build a separate template-only authoring path or mistake the current synthetic fixtures for a supported catalog. Library curation, release compatibility, provenance and customization/update behavior need explicit design contracts, but populating a production catalog is not the next task. Retain the useful home-screen categories instead of deleting them to fix the starter form.

## Topology and component requirements

Server classes describe ports, fabric membership, speed, medium, rails, planes, redundancy relationships, and physical termination. Switch models describe native ports, supported speed and breakout modes, shared lane/bank restrictions, endpoint/uplink reservations, and other required connections. Designs must consider growth, placement, failure domains, bandwidth policies, and operational support rather than only minimizing switch count.

Distinguish frontend, storage, in-band management, out-of-band/BMC, and backend RoCE/scale-out fabrics. Determine which are Hedgehog-managed, modeled external dependencies, or unsupported; never imply an unmanaged network is a deployable Hedgehog fabric. Non-GPU management, storage, gateway, and auxiliary endpoints also matter.

Physical planning should account for compatible transceivers and separate fiber, integrated DAC/AEC/AOC assemblies, RJ45/copper, logical breakout lanes, and shuffle assemblies. Do not conflate a physical cage with a usable logical port, or a multi-ended assembly with several independent cables. Cable reach and placement may be needed even though this is primarily a logical design tool. Exact environmental engineering, procurement transactions, and live controller writes require separate scope decisions.

## Sponsor scenarios to preserve and validate

These are requirements/examples supplied by the sponsor, not externally verified hardware reference designs. Specialists must establish authoritative SKU details and Hedgehog support before treating them as production fixtures.

| Scenario | Required reasoning |
| --- | --- |
| 32 B200 HGX nodes | Illustrative per-node profile: frontend BF3 2×200G to redundant leaves; optional separate storage BF3 2×200G; 2×10GBASE-T in-band management; server BMC plus one 1G BMC per BF3; eight CX7 1×400G scale-out links associated with eight GPU/NIC rails. Validate exact variants. |
| Frontend capacity example | 32 nodes × 2×200G = 64 endpoint links. A hypothetical 64×200G switch with 32 endpoint and 32 uplink ports requires two leaves by capacity. Redundancy, mesh support, spine ports, failure behavior, and future growth determine the actual fabric. Compare a two-switch mesh with a two-leaf/two-spine alternative only if the selected Hedgehog version supports each. |
| 32-node rail packing | Hypothetical 64×800G switch: 32 uplink cages and 32 endpoint cages broken into 64×400G ports. Four leaves could each host two complete 32-node rails. This demonstrates permissible packing to investigate, not a universal rule. |
| 64-node rail placement | Same hypothetical switch: eight leaves, one leaf per rail, each collecting that rail's NIC from all 64 servers. |
| 128-node rail domains | Two first-hop domains of 64 servers, each with eight rail leaves, under a common spine layer. Prove uplink/spine feasibility and domain membership; do not infer spine count from endpoint totals alone. |
| B300 HGX | Sponsor expects doubled scale-out bandwidth and two distinct planes. Validate SKU, NIC/port arrangement, rail mapping, and plane isolation rather than extrapolating B200 automatically. |
| NVL72 | Sponsor describes 18 compute trays × 4 GPUs/rails = 72 GPUs, with four 64×800G-form-factor leaf switches per rack despite spare ports. Investigate per-rack placement policies, two-rack interconnection variants, single/multiple planes, and shuffle mappings. Do not treat 72 GPUs as 72 servers or assume all rack variants are identical. |
| Sparse and large requests | Eight NVL72 racks and 512 B300 HGX nodes with few other answers; tens of thousands of links at full detail. Produce useful provisional outputs and explicit unresolved choices. |

Preserve distinctions between server, GPU, tray, rack, rail, first-hop rail domain, plane, fabric, and failure domain. A rail associates a GPU with its nearby NIC in the sponsor's examples; the application must model the relationship, not infer it from a port number. Unused ports can be intentional.

## Unresolved product decisions

The initial audience, BOM-before-connection-map delivery order and latest-release installation direction are settled above. Design must establish detailed workflows, first BOM readiness/scenario, deployment model, import/export and round-trip needs, release-update mechanics, topology family coverage, algorithm objectives, collaboration/security needs, performance targets, and lifecycle ownership. Confirm how existing Hedgehog planning tools overlap before proposing duplicate functionality. No application stack or solver has been selected.
