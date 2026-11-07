# R02: Versioned Hedgehog topology support contract

Research date: 2026-11-07. Assignment: [issue #3](https://github.com/afewell-hh/hh-aid/issues/3).
Author: Hedgehog upstream compatibility researcher (R02).
Status: initial research pass ready for independent review; **not an approved design or deployment certification**.
Independent reviewer: **Network topology specialist** (assigned role; individual not yet supplied). Disputed support claims require the **sponsor-designated Hedgehog authority**. Neither review nor authority approval has occurred.

## Result and scope

Use release **26.05** as the proposed research baseline: Fabricator v0.51.4, Fabric v0.144.1, Broadcom SONiC v4.5.2. This is a matched release, not independently selected repository heads. The pinned release notes identify these versions and date the release November 5, 2026 [D-release]. Fabricator's `go.mod` and `pkg/fab/versions.go` agree [B-mod], [B-versions]. Sponsor acceptance of this baseline remains pending.

The inventory finds ten Connection schema variants: eight active families and two retained, unsupported MCLAG variants. The single current fabric mode is `spine-leaf`; this mode includes mesh links. Multiple Fabric objects and spine-layer domains are real upstream concepts in this baseline. A rail and a first-hop rail domain remain planning semantics; do not equate either with an upstream domain. Hardware roles and features substantially narrow schema representability: for example DS5000 supports L3-only leaf use and its profile disables ESLAG [D-devices], [F-ds5000].

This pass inventories the topology-facing API surface exhaustively at the selected commits, traces the main admission/controller/Broadcom planner paths, and identifies documentation and validator discrepancies. It does **not** establish exhaustive operational support for every graph, overlay combination, switch/NOS pair, physical medium or failure requirement. Those stay conditional or unknown. No hh-aid capability is implemented or accepted by this report.

## Baseline and pinned source map

| Repository/component | Pin | Reason and boundary |
| --- | --- | --- |
| Fabricator | `v0.51.4`, `d2316aca666eb278541276a11a5f8dae372bf629` | Tagged release; `Release = "26.05.0"`; pins Fabric both as Go dependency and deployed component. |
| Fabric | `v0.144.1`, `4bde50829fd7cfebac69332982abd1dee504a8a3` | Exact dependency above; APIs, CRDs, validators, controller, planner, profiles, tests. |
| Official docs | `1be68948e177dcc031e91659ab5293ba19893ccf` | Snapshot of docs HEAD, independently pinned; release notes explicitly match the code versions. Not a release tag or proof every page is release-specific. |
| NOS and gateway | Broadcom SONiC `v4.5.2`; gateway dataplane `v0.38.2` | Release manifest evidence only; proprietary NOS and gateway dataplane implementation were not independently audited. |
| Optional NOS | Celestica SONiC+ `v5.0.0`; Cumulus VX `v5.16.5`, MLX `v5.18.1` | Manifest entries do not establish feature parity or production support. Catalog registration is separately gated [B-versions], [F-catalog]. |

All technical source links below resolve to these SHAs. The moving docs site was used only to locate the official documentation repository. Do not silently carry this contract to a different release. Re-run the inventory and review schema, validator, defaults, planner, catalog, release-notes and dependency diffs on every upgrade. Backward/forward version ranges are unknown unless explicitly noted below.

### Exhaustive inventory method

1. Enumerate every `ConnectionSpec` JSON member and connection constant, then compare `Type()`, `Endpoints()`, `Validate()`, generated CRD properties and planner dispatch. Do not count `topology` as a connection variant [F-conn], [F-crd]. Result: `unbundled`, `bundled`, `mclag`, `eslag`, `mclagDomain`, `fabric`, `mesh`, `gateway`, `external`, `staticExternal`.
2. Enumerate registered root objects in all `api/*/*/*_types.go`, generated CRD kinds, and Fabricator's accepted GVKs, validation lists and print lists. This detects objects absent from the README summary, notably `Fabric` [F-fabric], [B-scheme], [B-include].
3. Follow each object from `Default()` and `Validate()` through its webhook, cross-package `api/valid` checks, `AgentReconciler`, catalog allocation, NOS planner and profile gates. Inspect update/delete webhooks separately; create validation is not a round-trip/update guarantee [F-webhook], [F-ctrl], [F-agent], [F-plan].
4. Cross-check test tables, fixtures, release notes and user documentation. Distinguish generator restrictions from API/runtime restrictions. Read every built-in profile registration and inspect relevant feature flags; use the generated supported-device table for documented roles [F-catalog], [D-devices].
5. Record missing graph, physical, runtime and deployment evidence as unknown. Presence in a schema, generator or test fixture is not sufficient for a supported hardware claim.

Reproduction commands and results are at the end. The fixture references below are existing upstream fixtures or explicit proposed tests, not newly executed hh-aid tests.

## Capability matrix and coverage ledger

Status describes the specified proposition: **supported** = documented and/or implemented behavior with stated bounds; **conditional** = supported family requiring additional gates; **unsupported** = explicitly removed or rejected; **unknown** = insufficient evidence. Confidence H = direct matching source/docs/tests; M = partial trace or source discrepancy; L = unverified hypothesis. All rows apply only to the baseline above. All hh-aid generation/validation coverage remains **unimplemented**; the Fixture column is the verification handoff, not a product coverage claim.

| ID / capability | Status, confidence | Admission, runtime and hardware boundary | Evidence / fixture |
| --- | --- | --- | --- |
| C01 unbundled | Conditional, H | One server, one switch, one link. Switch API port must exist; server port identity is not a hardware capability check. Host configuration and VPC attachment remain separate. | `ConnUnbundled`, `Endpoints`, `Validate` [F-conn]; [D-conn]; planner `planServerConnections` [F-plan]. Proposed U1: valid link; duplicate port negative. |
| C02 bundled | Conditional, H | Single server/switch LAG; multiple unique endpoints; host 802.3ad LACP. Fallback is explicit. Endpoint validation does not itself enforce a two-link minimum. | `ConnBundled`, `Endpoints` [F-conn]; [D-conn]; `planServerConnections` [F-plan]. Proposed B1: two-link LAG; mixed-server negative. |
| C03 ESLAG | Conditional, M | Documented EVPN multihoming over 2–4 switches, same redundancy group/type, same domain set; host LACP and profile ESLAG support. No MCLAG peer-link requirement. Endpoint implementation permits 1–4 switches; schema has MinItems=2 links. Single-switch/single-link exceptions need reconciliation. | [F-conn], [F-switch], [D-conn]; `planESLAG`, `planServerConnections` [F-plan]; `TestPlan/reg-leaf-3`, `mesh-leaf-01` [F-plan-tests]. |
| C04 mclag | Unsupported, H | Retained schema accepts with warning; endpoints return empty and `Type()` is invalid. Must not export as a supported design. | `Connection.Validate` and `Endpoints` [F-conn]; switch warning [F-switch]; docs removal in 26.03, deprecation since 26.01 [D-release]. |
| C05 mclagDomain | Unsupported, H | Historical peer/session links remain in schema but no longer constitute a supported redundancy mechanism. Same early warning/return as C04. | `ConnMCLAGDomain`, `Validate` [F-conn]; [D-release]. Proposed M1: ensure hh-aid blocks both even if upstream returns no error. |
| C06 fabric links / two-layer Clos | Conditional, H | One spine/leaf pair, unique ports; same Fabric; leaf includes spine domain. Both IPs absent means BGP unnumbered; otherwise matching /31 inside fabric subnet, unique addresses. Role labels alone do not prove complete Clos or performance. | `ValidateDomains`, `Validate` [F-conn]; `planFabricConnections` [F-plan]; `TestConnectionValidation/unnumbered-fabric`, `half-numbered-fabric`, `fabric-conn-shared-leaf` [F-conn-tests]; `TestPlan/reg-spine-1`, `unnum-reg-spine-1` [F-plan-tests]. |
| C07 mesh | Conditional, H | Direct leaf pair in same single domain; numbered or unnumbered. Documented small meshes and border-leaf expansion. TH5 runtime requires allocated workaround VLAN per port. Arbitrary partial meshes have no performance/failure guarantee. | [D-conn]; `ValidateDomains` [F-conn]; `planMeshConnections` [F-plan]; tests `mesh-conn-same-domain`, `mesh-conn-across-domains`, `mesh-conn-shared-leaf` [F-conn-tests], `mesh-*`, `unnum-mesh-leaf-01` [F-plan-tests]. |
| C08 gateway | Conditional, H | Switch to Gateway links; gateway resource, same Fabric and exact single domain; numbered /31s required. Docs cover spine attachment and leaf attachment in mesh. Gateway group/peering and separate dataplane validation needed for services. | [F-extra], [D-conn]; [F-conn-tests] `unnumbered-gateway-rejected`; [F-plan] `planGatewayConnections`; [F-ctrl] gateway validation exception. |
| C09 external | Conditional, H | Connection names only switch-side port. External + ExternalAttachment define BGP or static routing; ExternalPeering or GatewayPeering grants VPC access. Remote topology is not managed by this object. Same-domain and ASN rules apply. | [D-conn], [D-domains]; [F-ext], [F-extattach], [F-extra-peering]; `TestPlan/mixedext-leaf-01`, `unnumext-leaf-03` [F-plan-tests]. |
| C10 staticExternal | Conditional, H; deprecated | Runtime remains implemented. IP/next-hop/subnet consistency and reserved ranges checked; optional WithinVPC must reference same-fabric VPC and compatible switch domains. Prefer static External objects for new designs per docs. | [D-conn]; [F-conn], [F-extra]; `planStaticExternals` [F-plan]; `TestConnectionValidation/static-ext-default-route`, `static-ext-overlap-route` [F-conn-tests]. |
| C11 multiple Fabrics | Supported model, H | Separate switch ownership and ASN ranges; cross-fabric Connection rejected; external-system interconnection documented. Servers and VLAN namespaces are not Fabric-owned. No implication of separate Kubernetes namespaces. | [F-fabric], [D-domains]; `TestFabricValidation` [F-fabric-tests]; `fabric-conn-crossing-fabrics` [F-conn-tests]. |
| C12 multiple domains / shared leaves | Conditional, H | Domains are spine sets with distinct ASNs, not extra Clos tiers. Spine in exactly one; leaf in one or more. Shared leaves cannot use mesh/gateway/external/staticExternal connections; redundancy peers share domains. VPC must attach only to leaves in every VPC domain. | [F-fabric], [F-switch], [F-conn], [D-domains]; `TestPlan/domains-*` [F-plan-tests]; [F-domain-tests]. |
| C13 sparse graphs / islands | Conditional model, M | Docs explicitly permit removed edges/disjoint islands, but explain two-layer Clos/EVPN assumptions. Connectivity and availability must be proved separately; an admitted disconnected plan is not deployable for a connected-service requirement. | [D-domains]; proposed G1: disconnected endpoint negative for hh-aid requirement gate. |
| C14 mixed mesh and fabric links | Conditional documented use, M | Border-leaf expansion is documented. Default VLAB generator rejects simultaneous mesh/fabric counts and mesh with spines; this is a generator boundary, not a blanket controller prohibition. Specific mixed graph/hardware still needs review. | [D-conn], `VLABBuilderDefault.Build` [B-builder], separate planner paths [F-plan]. Proposed G2: two-tier fabric with mesh border leaf. |
| C15 three-tier Clos / super-spine / arbitrary graph | Unknown, L | No distinct super-spine role or tier contract found; docs explain two-layer assumptions. Do not infer support by assigning spine/leaf names to arbitrary links. | [F-switch], [D-domains]; authority question Q3. |
| C16 GPU rails / first-hop rail domains | Supported generator example; general policy unknown, M | No dedicated rail fields found in wiring APIs. GPURail generator uses 8 rails, 4 leaves/unit, 2 spines, rail modulo leaf allocation, ordinary unbundled/fabric objects. Not a universal supported hardware design. | `VLABBuilderGPURail.Build` [B-builder]; sponsor scenario fixtures pending R04. |
| C17 plane isolation | Conditional, M | Upstream domains implement EVPN route boundaries; shared VPCs/leaves and physical shared switches affect isolation. Separate Fabric objects are another option. Neither proves independent power/rack/NIC/failure domains. | [D-domains], [F-domain-tests], [F-plan-tests]. Proposed P1: cross-domain mesh rejection; P2: shared leaf loses both plane paths. |
| C18 B200/B300/NVL72, arbitrary 800G switches | Unknown, L | Sponsor examples are requirements only. DS5000 profile is specific evidence, not an equivalence class for every 64×800G switch or GPU system. | [F-ds5000], [D-devices]; R04/R05 verification required. |
| C19 other Kubernetes namespaces | Unsupported, H | Metadata validator permits only `default`, even though CRDs are Namespaced. | `ValidateObjectMetadata` [F-meta]; proposed N1: namespace `tenant-a` rejected. |
| C20 old fabric modes / unnumbered gateway | Unsupported, H | Only `spine-leaf` in `FabricModes`; no current collapsed-core mode. Gateway addresses cannot both be absent. Historical release support is not inherited. | [F-config], [F-conn]; `unnumbered-gateway-rejected` [F-conn-tests]. |
| C21 physical/RoCE/nonblocking certification | Unknown until separately proved, H | Profile speed, breakout, RoCE/QPN flags are necessary gates, not cable reach, NIC firmware, lossless tuning, workload throughput, or failure performance proof. | [F-profile], [F-switch], [F-ds5000]; R04/R05 and independent verification required. |

## Associated resources, ownership and namespaces

The complete wiring group at this pin is `Fabric`, `Switch`, `Server`, `Connection`, `SwitchGroup`, `SwitchProfile`, `ServerProfile`, `VLANNamespace`. The VPC group is `IPv4Namespace`, `VPC`, `VPCAttachment`, `VPCPeering`, `External`, `ExternalAttachment`, `ExternalPeering`. Gateway adds `Gateway`, `GatewayGroup`, `GatewayPeering`, `VPCInfo`. Fabricator explicitly accepts the wiring/VPC/gateway groups and validates these lists [B-scheme], [B-include]. Their existence does not make every kind mandatory in every export.

| Resource set | When needed / contract |
| --- | --- |
| Fabric | Referenced by connections, switches and other owned resources. Defaulting fills `default`; it does not excuse an absent referenced Fabric. Fabricator seeds/hydrates the default, and upgrade initialization handles older deployments [F-fabric], [B-hydrate], [D-domains]. |
| SwitchProfile | Required by each Switch and resolved in connection port validation. Built-ins enforced from catalog. Extra profiles need explicit configuration; existence alone is not hardware certification [F-catalog]. |
| VLANNamespace | Switch requires at least one; VPCs reference VLAN namespace; VLAN ranges exclude reserved fabric VLANs. Shared across Fabrics, unlike IPv4Namespace [F-switch], [F-vlanns], [D-domains]. |
| SwitchGroup | Referenced groups must exist in same Fabric. Redundancy defaulting adds its group to Switch groups; arbitrary group labels do not enforce physical failure separation [F-switch]. |
| Server / ServerProfile | Server represents endpoint identity. ServerProfile contains NIC/port names but is explicitly not implemented/used; Server.Validate checks metadata only. Do not delegate endpoint hardware compatibility to it [F-server], [F-serverprofile]. |
| IPv4Namespace, VPC, VPCAttachment | Address allocation/isolation and actual endpoint service attachment; a Connection alone is not end-to-end service. VPC topology/domain and profile L2/L3 features constrain service modes [F-vpc], [F-vpcattach], [F-domain-tests]. |
| VPCPeering / External family | Explicit service connectivity and policy. Static External and deprecated staticExternal Connection are distinct representations [F-ext], [F-extattach], [F-extra-peering]. |
| Gateway family | Separate device/group/service policy. VPCInfo is accepted by loader but is not a universal topology input requirement. Gateway dataplane admission exception prevents assuming offline checks are complete [F-ctrl], [B-include]. |
| Controller-owned state | Agent and Catalog, GatewayAgent, DHCPSubnet and FabricController are operational/internal resources, not a substitute for planning intent. AgentReconciler and catalog allocator produce derived runtime state [F-agent], [F-ctrl]. |
| Installation resources | Fabricator configuration, ControlNode/FabNode and management/boot addressing remain installation prerequisites outside the three wiring primitives. R06 must specify the exact bundle [B-hydrate], [B-vlabconfig]. |

Names: metadata names must be lowercase RFC1123 subdomains, at most **62 characters**, in namespace `default` [F-meta]. Fabric domain names use DNS-label validation and the same length cap [F-fabric]. `GenerateName()` is convenience, not a uniqueness or length guarantee. Connection references split at the first slash (`device/port`), so `leaf-01/E1/1/2` identifies a breakout lane. Resolve API port names through the selected SwitchProfile and Switch breakout configuration; do not export raw SONiC `Ethernet*` names. The old BasePortName comment saying SONiC names is contradicted by mapping code and current docs [F-conn], [F-profile], [D-conn]. Server port strings require independent catalog validation.

Kubernetes namespace, VLANNamespace, IPv4Namespace, Fabric, upstream domain, redundancy group and physical failure domain are distinct concepts. Preserve all in the planning model and use explicit mappings.

## Constraints to carry into design

All rows are hard for installation export unless described as planning policy. Owner is R02 for upstream interpretation; implementation ownership passes to D01/D03/D04. Source versions are the baseline table. These are the high-value global constraints, not a replacement for invoking all upstream validators.

| ID | Applicability / units | Rule and validation strategy | Positive example / counterexample | Owner |
| --- | --- | --- | --- | --- |
| R02-K01 | All objects; characters | Metadata rules above; Default then Validate [F-meta]. | `leaf-01/default` / uppercase name or other namespace. | R02 |
| R02-K02 | Connections; endpoints | Exactly one intended variant; valid unique endpoint IDs and required referenced objects. Add independent exclusive-variant check because current `Endpoints` uses else-if counting [F-conn]. | unbundled only / unbundled plus bundled. | R02 + D04 |
| R02-K03 | Switch ports; lanes | Resolve effective profile mapping; reserve logical lanes and aliases across every connection. `E1/4` aliases lane `/1` in breakout collision checks [F-conn], [F-profile]. | distinct `/1`, `/2` / base alias and `/1` in different connections. | R02 + R05 |
| R02-K04 | Switch configuration; Gbit/s, logical-port count | Validate group speeds, breakout modes, FEC/autoneg, total and pipeline limits; actual configured lanes consume resources even if unused [F-switch]. | supported mode within pipeline cap / supported per-port modes jointly exceeding cap. | R02 + R05 |
| R02-K05 | Fabric ownership/domain; set membership | Same Fabric references, domain membership rules, equal redundancy-domain sets [F-fabric], [F-conn], [F-switch], [F-extra]. | shared leaf to spine in each domain / cross-domain mesh. | R02 |
| R02-K06 | ASN; integer/ranges | Nonzero ordered leaf range; distinct domain spine/gateway ASNs outside all fabrics' leaf ranges; no cross-fabric collisions. Hydrated switch ASN/loopback/mgmt addresses checked [F-fabric], [F-switch], [B-hydrate]. | disjoint ranges / overlapping ranges. | R02 |
| R02-K07 | Underlay IP; IPv4 /31 | Both absent for unnumbered fabric/mesh; both present matching /31 for numbered; gateway always numbered; no duplicate addresses and within configured subnet [F-conn]. | paired /31 / half-numbered link. | R02 |
| R02-K08 | VPC/VLAN/IP namespace | Validate attachment domains, subnet/range conflicts, reserved resources and profile feature compatibility using entire object set [F-vpc], [F-vpcattach], [F-vlanns], [F-extra-peering]. | attachment on leaf in all VPC domains / VPC spanning two domains attached to single-domain leaf. | R02 |
| R02-K09 | Hardware feature; boolean/role | Enforce documented role plus exact profile/NOS capabilities; no inference from switch capacity [D-devices], [F-switch], [F-catalog]. | DS5000 L3 leaf / DS5000 ESLAG. | R02 + R05 |
| R02-K10 | Planning; links, Gbit/s, metres, failure sets | Independent endpoint coverage, rail/domain/plane intent, redundancy, cut capacity and physical assembly checks; hard/soft according to explicit user requirement. Upstream acceptance supplies no proof of these. | preserved rail assignment / cross-rail substitution with identical port totals. | R04/R05 + D04 |

R02-K02 discrepancy is a **static finding to reproduce**, not an executed exploit or maintainer-confirmed bug: the code increments `nonNills` only in an `if/else if` chain; generated Connection CRD contains no `oneOf`/ExactlyOneOf guard found in this pass. Multiple fields therefore need a negative admission fixture before trusting upstream exclusivity. MCLAG's early return is another reason to inspect warnings and reject unsupported families independently.

## Topology, redundancy and physical boundary

Leaf-spine means a two-layer routed underlay with EVPN service semantics, not a promise of equal-cost paths for every requested workload. Mesh is a separate Connection family in the same fabric mode. A two-leaf mesh versus two-leaf/two-spine frontend comparison is valid research scope; neither option is automatically more available or nonblocking. Count paths, shared components, capacity and behavior after failures. Partial meshes/islands may be representable while failing user requirements [D-domains].

ESLAG uses EVPN Ethernet segments with per-leaf port channels and allocated identities; `ConnectionReconciler` allocates IDs and the Broadcom planner builds ESI/MAC state. It does not require MCLAG peer/session cables [F-connctrl], [F-plan]. Redundant server links as independent unbundled connections are another representable design; host routing/bonding and application behavior determine whether it is useful. Do not silently convert rail links into a LAG.

A Fabric domain is a **spine layer**, with EVPN route filtering by other domains' spine ASNs [D-domains], [F-plan]. It can encode some plane boundaries. It is not the sponsor's first-hop group of servers sharing rail leaves. Shared leaves also share physical failure exposure. A plane named `plane-b` in tests is not a universal GPU NIC/plane mapping. GPURail VLAB generation is useful implementation precedent, but its fixed eight-rail/four-leaf-unit layout cannot establish B300 or NVL72 support [B-builder].

Frontend, storage and in-band management are workload/service classifications; they can be planned on supported fabric resources if their service and hardware constraints pass. OOB/control management is separate boot/control connectivity: Switch management IP/boot fields and VLAB management bridges exist, but no `management` Connection variant exists [F-switch], [B-vlabconfig]. Represent an independently managed BMC/access network as an external dependency unless separately verified as a Hedgehog-managed fabric. Ethernet endpoints need not be NVIDIA devices. Gateway objects are explicit appliance resources and should not be collapsed into Server when upstream requires them.

### Hardware/NOS coverage

The pinned documented catalog lists 15 physical models [D-devices]. Roles summarized without treating ports as sufficient support evidence:

| Documented roles | Models |
| --- | --- |
| Spine and leaf | Celestica DS2000, DS3000; Dell S5232F-ON, S5248F-ON; Edgecore DCS203, DCS204, DCS240; Supermicro SSE-C4632SB |
| Spine | Celestica DS4000, DS4101; Dell Z9332F-ON; Edgecore DCS501 |
| Spine and L3-only leaf | Celestica DS5000 |
| Spine and limited leaf | Edgecore EPS202 |
| Limited leaf | Edgecore EPS203 |

`defaultSwitchProfiles` includes these models plus VS. Additional six Celestica SONiC+ profiles and Cumulus VX are gated by config flags. The README calls alternative processors work in progress [F-readme], [F-catalog]. Do not interpret a Cumulus MLX manifest version as a listed physical NVIDIA switch profile. Custom-profile allowance is an extensibility mechanism, not a support endorsement.

DS5000 is a concrete caution: profile `RoCE=true`, `ECMPRoCEQPN=true`, `ESLAG=false`; pipeline limits and breakout mappings constrain logical ports [F-ds5000]. Mesh planning adds a TH5-specific VLAN workaround [F-plan]. The pinned limitations document also describes CMIS/breakout initialization and reboot/cold-boot implications, PortChannel reconfiguration convergence issues, VNI reuse races and L3VNI host-IP-change blackholing [D-limits]. These operational caveats are distinct from static compatibility and need R06 lifecycle review.

## Reusable validation and gaps

Recommended research direction (not approved architecture): wrap the exact upstream release in an adapter and retain hh-aid intent and physical rules separately.

1. Load strict typed objects using Fabricator `apiutil.Loader.LoadAddWiring`, which defaults objects before storing them so reference checks and label-filtered collision scans see normalized objects [B-loader], [B-scheme]. Retain raw inputs/overrides and record defaulted/derived values separately.
2. Build/init the matching `FabricConfig` with **both** `valid.Peering` and `valid.Connection`; use the complete object snapshot, built-in profiles and required Fabric/namespaces/groups. `Validate(ctx, nil, cfg)` skips cross-object checks and is not full validation [F-valid-readme], [B-hydrate].
3. Reuse `ValidateFabricGateway` and Switch `ValidateHydration`/Fabricator hydration workflow where appropriate. Hydration mutates allocations, so clone inputs and record changes before recommending export. Bare object validation requires hydrated switch IP/ASN fields [F-switch], [B-hydrate], [B-include].
4. Capture warnings directly. Fabricator `defaultAndValidate` discards returned warnings; a successful helper call must not hide MCLAG's unsupported warning [B-include], [F-conn].
5. Test CRD schema admission separately from Go validation, and update/delete webhook restrictions separately from create. Connection type, Fabric membership and staticExternal WithinVPC changes are immutable; Fabric domain/ASN changes also require lifecycle handling [F-webhook], [F-fabric-wh], [D-domains].
6. Planner/agent convergence and selected hardware validation follow. Gateway/GatewayPeering create webhooks still invoke dataplane checks beyond offline validation: documented exception [F-ctrl]. No VLAB or planner success proves optics/reach or production RoCE performance.

Reuse costs: both repositories identify Apache-2.0 licensing, but inspect dependencies and preserve notices before redistribution; NOS binaries/access are separate. Fabricator imports Kubernetes clients, scheme/defaulting machinery, profile enforcement and release configuration. An isolated adapter can contain this coupling; copying a subset of validation will drift. Alternatives for R03: subprocess against pinned hhfab versus an in-process Go wrapper. This report chooses neither implementation stack nor solver.

Explicit gaps: complete graph reachability, two-layer role pairing beyond field names, every connection variant's exclusivity, physical server-port capabilities, link-end speed/media matching, parent/lane assembly accounting, rack/power failure domains, plane isolation under shared hardware, capacity/performance and operational convergence. The code path inspected does not justify treating these as automatically proved. Hardware-specific runtime evidence is deepest for Broadcom; optional processors and gateway dataplane need separate review.

## Questions for sponsor relay

No maintainers contacted. These questions request authority disposition, not inferred intent.

| ID / priority | Precise question and evidence | Proposed handling pending answer |
| --- | --- | --- |
| Q1 / high | Confirm 26.05 baseline for hh-aid and required supported release window. Matched versions in [D-release], [B-versions]. | Research baseline only; no approval inferred. |
| Q2 / high | What is supported ESLAG minimum: documented 2–4 switches, endpoint validator 1–4, CRD minimum two links, older release notes mention single-port creation [D-conn], [F-conn], [D-release]? | Use documented 2–4 for candidate designs; preserve imported deviations as unresolved. |
| Q3 / high | Confirm supported mixed mesh/Clos, sparse/disjoint graphs and maximum scale; is any three-tier topology supported? [D-conn], [D-domains] vs VLAB restrictions [B-builder]. | Keep documented use conditional; arbitrary graph/three-tier unknown. |
| Q4 / high | Please reproduce multiple simultaneous Connection variants and wrong spine/leaf role pairing against real admission; are checks missing or intentionally deferred? [F-conn], [F-crd]. | Independent hh-aid exclusivity and role policy needed; no upstream bug assertion without reproduction. |
| Q5 / high | Which physical/NOS combinations validate multi-domain isolation, TH5 mesh workaround, RoCE and ESLAG? Optional NOS catalog flags are not a support matrix [F-catalog], [F-ds5000], [F-plan]. | No unverified hardware deployment claims. |
| Q6 / medium | What exact gateway dataplane validation must an offline exporter run, and which API/version is supported? [F-ctrl]. | Gate gateway installation export on complete validation. |
| Q7 / medium | Confirm policy for deprecated staticExternal export and imported MCLAG migration; should warning-only MCLAG be a hard exporter error? [D-release], [D-conn], [B-include]. | Reject new MCLAG; flag staticExternal deprecation and preserve import intent. |
| Q8 / medium | Confirm scope of endpoint/management support, and qualification evidence for sponsor B200/B300/NVL72 scenarios. | Relay to R04/R05/R06; no hardware equivalence assumptions. |

## Reproduction, verification and limitations

Commands actually used: `git ls-remote --tags --sort=-v:refname`, shallow clones/fetches of the tags above, `git rev-parse HEAD`, `rg`, `sed`, and `cat` over the listed source files. An initial lexical tag listing led to a temporary v0.9.1 checkout; it was replaced with v0.51.4 before technical analysis. No findings use the old checkout. The official docs were shallow-cloned and pinned at the listed SHA. Sources reside outside the hh-aid worktree under `/tmp/hh-aid-r02-upstream/` and are not deliverable dependencies.

Reproduce source selection in fresh directories:

```sh
git clone --depth 1 --branch v0.51.4 https://github.com/githedgehog/fabricator.git fabricator
git clone --depth 1 --branch v0.144.1 https://github.com/githedgehog/fabric.git fabric
git clone https://github.com/githedgehog/docs.git upstream-docs
git -C upstream-docs checkout --detach 1be68948e177dcc031e91659ab5293ba19893ccf
git -C fabricator rev-parse HEAD
git -C fabric rev-parse HEAD
rg 'ConnectionType|type ConnectionSpec|func .*Endpoints|func .*Validate' fabric/api/wiring/v1beta1/connection_types.go
rg 'AddKnownTypes|Kind.*=' fabric/api/{wiring/v1beta1,vpc/v1beta1,gateway/v1alpha1}
rg 'scope:|kind:' fabric/config/crd/bases/wiring.githedgehog.com_*.yaml
rg 'func Test|name:' fabric/api/wiring/v1beta1/connection_types_test.go
```

Expected pins are in the baseline table; expected inventory is ten variants and eight wiring resource kinds. Source/fixture inspection is **not test execution**. Read Fabric README and Fabricator README/build recipes before any execution [F-readme], [B-readme]. Fabric explicitly requires `just`, codegen and Docker for tests; raw `go test` is not an equivalent workaround.

Environment checked: macOS arm64; `go version` = `go1.27.3 darwin/arm64`; `just --version` = `1.39.0`. `docker info --format '{{.ServerVersion}}'` reported that it cannot connect to the Docker daemon. No upstream tests, CRD admission, VLAB, switch checks or throughput experiments were run. Do not start a live deployment to fill this gap.

Reviewer commands once Docker and upstream prerequisites are available (not run here): in Fabric, `just test ./api/...`, `just test ./pkg/ctrl/switchprofile/...`, `just test ./pkg/agent/dozer/bcm/...`; in Fabricator, `just test ./pkg/util/apiutil/...` and `just test ./pkg/hhfab/...`. Existing negative fixtures include port/IP collisions, half-numbered links, unnumbered gateway, cross-Fabric and cross-domain links, missing referenced objects and unsupported profile features. Add proposed cases U1/B1/M1/G1/G2/P1/P2/N1 plus multi-variant and wrong-role tests before exporter acceptance. Run actual admission checks for schema/defaulting differences.

Documentation verification: all pinned source paths and line anchors in this artifact are checked against the local pinned clones; inventory compared to ConnectionSpec and registered root kinds; Markdown reference definitions checked; `git diff --check` run before handoff. This proves citation integrity and bounded inventory consistency, not upstream behavior execution.

## Acceptance evidence and handoff

| Issue #3 criterion | Artifact evidence | Disposition |
| --- | --- | --- |
| Pinned source map and exhaustive inventory method | Baseline, method, ten variants, resource list, naming and global constraints | Delivered for review |
| Supported/unsupported/conditional/unknown matrix | C01–C21 with version scope, sources, symbols/fixtures and confidence | Delivered for review |
| Mesh/leaf-spine, redundancy, rail/plane/domain, management/external boundaries | Matrix and topology/physical-boundary sections | Delivered for review |
| Reusable validators/gaps and maintainer questions | Validation adapter analysis and Q1–Q8 | Delivered for review |
| Facts/hypotheses/inferred intent and reproducibility | Explicit evidence levels, commands, environment and limitations | Delivered for review |
| Independent reviewer disposition and sponsor/domain decisions | Reviewer roles named; no review or approval yet | **Pending; issue must remain open** |

Observed facts are attributed to source; documented support is attributed to docs; proposals are labeled as recommendations or proposed fixtures. No undocumented maintainer intent is claimed. Hypotheses needing tests include multi-variant admission behavior and completeness of role-pairing validation. Product choices (baseline, first slice, supported release window) remain sponsor decisions.

Handoff: branch `research/r02-support-contract`, artifact `docs/research/hedgehog-support-contract.md`. Relay to Network topology specialist for criterion-by-criterion independent review and sponsor-designated Hedgehog authority for Q2–Q5 disputed support/implementation boundaries. Lead should reconcile R03/R04/R05/R06 pins before accepting any dependent design. Highest-value next work: R03 validation-wrapper feasibility proposal and R04 scenario reconciliation using this baseline, followed by D04 negative-fixture design when dependencies are accepted. Keep #3 open for review; do not self-approve or treat a research report as acceptance.

## Permanent source references

[F-conn]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/connection_types.go

[F-crd]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/config/crd/bases/wiring.githedgehog.com_connections.yaml

[F-fabric]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/fabric_types.go

[F-switch]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go

[F-profile]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switchprofile_types.go

[F-meta]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/meta/validation.go

[F-config]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/meta/types.go

[F-server]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/server_types.go

[F-serverprofile]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/serverprofile_types.go

[F-vlanns]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/vlannamespace_types.go

[F-vpc]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/vpc/v1beta1/vpc_types.go

[F-vpcattach]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/vpc/v1beta1/vpcattachment_types.go

[F-ext]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/vpc/v1beta1/external_types.go

[F-extattach]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/vpc/v1beta1/externalattachment_types.go

[F-extra]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/valid/connection.go

[F-extra-peering]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/valid/peering.go

[F-valid-readme]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/valid/README.md

[F-webhook]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/connection_wh.go

[F-fabric-wh]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/fabric_wh.go

[F-ctrl]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/README.md

[F-agent]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/agent_ctrl.go

[F-connctrl]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/connection_ctrl.go

[F-plan]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/agent/dozer/bcm/plan.go

[F-catalog]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/catalog.go

[F-ds5000]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/p_bcm_celestica_ds5000.go

[F-conn-tests]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/connection_types_test.go

[F-fabric-tests]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/fabric_types_test.go

[F-plan-tests]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/agent/dozer/bcm/plan_test.go

[F-domain-tests]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/vpc/v1beta1/domains_test.go

[F-readme]: https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/README.md

[B-mod]: https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/go.mod

[B-versions]: https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/pkg/fab/versions.go

[B-include]: https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/pkg/util/apiutil/include.go

[B-scheme]: https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/pkg/util/apiutil/scheme.go

[B-loader]: https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/pkg/util/apiutil/loader.go

[B-hydrate]: https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/pkg/hhfab/hydrate.go

[B-builder]: https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/pkg/hhfab/vlabbuilder.go

[B-vlabconfig]: https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/pkg/hhfab/vlabconfig.go

[B-readme]: https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/README.md

[D-release]: https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/release-notes/index.md

[D-conn]: https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/connections.md

[D-domains]: https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md

[D-devices]: https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/supported-devices.md.gen

[D-limits]: https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/known-limitations/known-limitations.md
