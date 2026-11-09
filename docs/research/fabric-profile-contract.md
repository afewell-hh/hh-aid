# R02b: Fabric/domain semantics, switch-profile catalog and manual-model boundary

| Field | Value |
| --- | --- |
| Issue | [#3](https://github.com/afewell-hh/hh-aid/issues/3), follow-up assignments [6726545894](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6726545894) and [6715064634](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6715064634) |
| Author | t4 / **bridge** (AI agent, Claude Opus 5.5), reassigned as author by the sponsor ([kickoff 6726619466](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6726619466)). Not self-approved. |
| Companion | [release-currency.md](release-currency.md): 26.05 was corroborated as current at the dated observation. These pins match the target corroborated at topo’s 2026-11-08 22:53:50 UTC observation; they are not a perpetual currentness claim. Installation-currentness requires fresh evidence. |
| Pins | Fabric `v0.144.1` = [`4bde508`](https://github.com/githedgehog/fabric/tree/4bde50829fd7cfebac69332982abd1dee504a8a3); Fabricator/`hhfab` `v0.51.4` = [`d2316ac`](https://github.com/githedgehog/fabricator/tree/d2316aca666eb278541276a11a5f8dae372bf629); docs [`1be6894`](https://github.com/githedgehog/docs/tree/1be68948e177dcc031e91659ab5293ba19893ccf) (= `release/26.05`) |
| Inputs | R02 [`bf7437c`](https://github.com/afewell-hh/hh-aid/blob/bf7437c3fc852cfe06663073edc36a08de75efbc/docs/research/hedgehog-support-contract.md) (accepted research), R03 [`2b54790`](https://github.com/afewell-hh/hh-aid/blob/2b547901413c00fb8d7ce3eeff7d6669f2b78135/docs/research/upstream-reuse.md), sponsor direction in [product-context.md @ 4449d14](https://github.com/afewell-hh/hh-aid/blob/4449d14bb9019310da476ed2608ddc4850a8c376/docs/product-context.md) |
| Method | Pinned source and docs read. The original author ran fixtures through a restricted local `hhfab` build using pinned validation source (R03 §10), not an official release binary. No API server, admission, VLAB, NOS, hardware, outreach or implementation. |

**Correction status:** revision 2 addresses [topo C1–C7](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6728308610) and [lead’s disposition](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6728367087). Original author: bridge; correction author: compat at the user’s direct instruction. Named independent correction reviewer: **t6 / topo**, delta review pending; lead retains acceptance. No self-approval. Topo independently corroborated all nine offline outcomes with the same restricted executable (reported SHA-256 `3defbe7debf128b6e47119f124676b8fa7f1f9548d19e832c0499e0e6e1bffdb`, `v0.51.4-local`); this correction preserves those results and adds no upstream execution.

**Labels.**
- **F**: read in pinned source.
- **X**: historical offline wiring validation using the restricted local `hhfab` build at the pin; not CRD schema/admission or official-release parity.
- **D**: pinned docs.
- **I**: inference.
- **H**: proposal for hh-aid.
- **Q**: open question for the Hedgehog authority (relayed by the sponsor; no outreach was made).

## 1. Summary for model (D01) and ux (D02)

1. **"Fabric" means three different things, and they must be kept apart.**
   - The upstream **Fabric object** is one spine-leaf topology *inside* one controller installation (F, D).
   - An **installation** (Hedgehog Fabric deployment) is one controller plus its `fab.yaml`, and can hold several Fabric objects since 26.05 (D).
   - The sponsor's product "fabric" is the network a server port is meant to join.
   - These three only line up for the default single-Fabric case. Before 26.05, the docs said each separate network needed "a separate Hedgehog Fabric, each with its own controller" ([multi-fabric.md L13-17](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L13-L17)). Older material uses "fabric" for an installation.
2. **A domain is a spine set within one Fabric, and a plane is a product term that *may* map to a domain.**
   - Domains are entries in `Fabric.spec.domains` and are not separate objects.
   - A spine is in exactly one domain; a leaf is in one or more (F, X).
   - The documented multi-plane backend uses one domain per plane, with dedicated spines and optional shared leaves (D).
   - A rail is not an upstream domain. Rails preserve explicit server/NIC/GPU attachment intent and first-hop grouping; R03 §6.1 already showed that first-hop rail groups are not domains.
3. **One physical server is one `Server` object, and it can have Connections into several Fabrics of the same installation.**
   - `Server` has no fabric or domain field (F). The docs say so explicitly: "a server can be connected to more than one" ([L33-34](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L33-L34)).
   - Executed: one server with ports on rail leaves in two planes, a shared leaf, and an ESLAG pair in a second Fabric **passes** `hhfab validate` (X, §3).
   - **Each Connection belongs to exactly one Fabric**, and every switch it touches must be in that Fabric. So one bundle (ESLAG or bundled) cannot span Fabrics (F, X N1/N2).
   - Ports of one physical server that attach to **separate installations** need one `Server` object in each installation's wiring, with no upstream link between them (I). hh-aid must therefore own the physical-server identity itself.
4. **A leaf class is an hh-aid concept with no upstream object.**
   - Each deployed Switch has exactly one `topology.fabric` (F). That does not restrict a reusable leaf-class template to one Fabric or domain set. The fixture demonstrates different leaf placements in one Fabric, not validation of an upstream class object (X).
   - Proposed UI mapping (H): choose a reusable leaf-class template, then a deployment group with an explicit Fabric/domain assignment. Selecting that placed group could resolve a server port’s destination. Whether classes themselves are scoped or templates are reusable across placements remains D01/D02’s decision; service reachability also depends on VPC rules.
   - `SwitchGroup` is a different thing: a redundancy/group label that must be in the switch's Fabric. It is not a leaf class.
5. **The switch catalog is compiled into each Fabric release.**
   - 16 default `SwitchProfile`s are registered, plus 6 SONiC+ profiles (5 Celestica hardware, 1 virtual) and 1 Cumulus VX profile, each set behind a config flag. Non-default profiles are **deleted/rejected** unless the operator sets `allowExtraSwitchProfiles` (F, X N6/P2).
   - Profiles have no version field of their own. Name plus Fabric release identifies compiled-default provenance; imported/manual content also needs a content hash and revision (§4.1).
   - They carry ports, NOS names, speeds, breakout modes with lane offsets, pipelines and max-port budgets, and feature flags.
   - They carry no dedicated structured BOM/SKU, power or optic/transceiver/media/reach compatibility fields. Free-text `notes` can still contain useful hardware evidence (for example DCS240 power limits, §4.2). Cage form factor appears only as a port-profile *name* convention (`OSFP-800G`).
6. **Support status is documented, not enforced.**
   - The docs' "Supported Roles" column is a generated *hint* (marked `TODO` in source). The wiring API accepted a documented spine-only model as a server-leaf (X B1).
   - Feature flags are enforced only where source checks them: RoCE, QPN, ESLAG and port locator on the Switch; L2VNI/L3VNI on VPC attachment.
   - A manual model can pass wiring validation only after an operator opt-in. That demonstrates only the offline wiring checks exercised, including profile/port consistency; it does not prove complete CRD schema validity or admission. It is never deployment permission or Hedgehog support (§5).

## 2. Resource and field map (26.05)

| Concern | Upstream resource / field | Owner & validation (F unless noted) | API capability vs documented support |
| --- | --- | --- | --- |
| Installation | One controller + `fab.yaml` (`Fabricator` object, singleton `fab/default`) | Operator. `GetFabAndNodes` requires exactly one Fabricator (R06 O4) | One installation manages several Fabric objects and up to 500 switches (D, [release notes L19-24](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/release-notes/index.md#L19-L24)) |
| Fabric | `wiring/Fabric`: `leafASNStart/End`, `disableBFD`, `domains{name: {spineASN, gatewayASN}}` ([fabric_types.go L25-43, L51-54](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/fabric_types.go#L25-L54)) | At least one domain; DNS-label names; ASNs unique within and across Fabrics, outside every leaf range ([L180-247](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/fabric_types.go#L180-L247)). Update protection is pin-specific: nonzero leaf ASN bounds and domain ASNs cannot change; populated domain entries cannot be removed/renamed; new domain names are forbidden when the old map is nonempty. Legacy unset values may be filled and empty entries retain exceptions, subject to full validation; this is not general domain migration ([fabric_wh.go L109-143](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/fabric_wh.go#L109-L143)) | Source comment: "Fabrics are not cabled to each other and reach each other by peering as external systems" ([L53-54](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/fabric_types.go#L53-L54)) |
| Domain | Key of `Fabric.spec.domains`; no object | Spine: exactly one domain ([switch_types.go L636-638](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L636-L638)); every switch domain must exist in its Fabric ([L728-732](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L728-L732)) | EVPN route isolation via spine AS-path filtering; a shared leaf is "never a path between the domains" (D, [L308-321](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L308-L321)) |
| Switch placement | `Switch.spec.topology.{fabric, domains[]}`, defaulting to `default`/`[default]` ([L143-150, L354-360](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L143-L150)) | Fabric must exist; ESLAG group members must share domains ([L733-747](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L733-L747)); immutable on update (R06 O11) | Docs require non-default Fabrics to set `topology.fabric` on every object, which is not inferred (D, [L269-279](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L269-L279)) |
| Switch role | `role`: `spine`, `server-leaf`, `border-leaf`, `mixed-leaf` ([L60-82](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L60-L82)) | The source distinguishes **only spine vs leaf** (`IsLeaf` covers all three leaf roles): ASN placement, VTEP rules and domain count. No other use of the leaf sub-roles was found in the Fabric repo (F, by grep) | Leaf sub-roles are descriptive at this pin (I). External connections need a single-domain switch, not a `border-leaf` role (F, [connection_types.go L763-778](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/connection_types.go#L763-L778)) |
| Switch model | `Switch.spec.profile` → `SwitchProfile` (required, [L665-667](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L665-L667)) | Port, speed, group and breakout keys checked against the profile ([L770-830](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L770-L830)); RoCE/QPN/ESLAG/locator feature gates ([L874-905](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L874-L905)); switch and pipeline max-port budgets ([L907-965](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L907-L965)) | The field comment says the profile is "currently not used by the Fabric" ([L159](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L159)), but validation clearly uses it. The comment is stale (I) |
| Server | `Server.spec.{description, profile, inspect.expectedSysName}` ([server_types.go L31-45](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/server_types.go#L31-L45)) | Metadata only ([L110-116](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/server_types.go#L110-L116)); **no fabric or domain field** | "a server can be connected to more than one" Fabric (D). `ServerProfile` (NIC→port names) "is currently not used/implemented" ([serverprofile_types.go L30-57](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/serverprofile_types.go#L30-L57)) |
| Server port | String `server/port` inside a Connection | Not validated against any server model (R06 O7); used as the LLDP expectation | The NIC, speed, cage, optic and rail/plane meaning of a server port exists **only in hh-aid** (I) |
| Connection | `Connection.spec.topology.fabric` ([connection_types.go L247-252](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/connection_types.go#L247-L252)) plus one variant (R02 K02) | Every switch in the Connection must be in that Fabric ([L883-899](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/connection_types.go#L883-L899)). `ValidateDomains` ([L708-779](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/connection_types.go#L708-L779)): leaf must be in every domain of its spine; mesh leaves in the same single domain; gateway and external switches in exactly one domain. `ValidateDomains` has no direct server-facing Connection branch; that does not waive associated Switch/ESLAG peer-domain matching or VPC attachment/service rules | Naming hazard: `topology.fabric` (the Fabric object) is "unrelated to the fabric connection type" (spine–leaf link) ([L249-250](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/connection_types.go#L249-L250)) |
| Service scope | VPC `topology.domains`; attachments, peerings, externals, gateways | A VPC attaches only to switches in all its domains; peering needs a common domain (D [L333-353](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L333-L353); R04 C2). L2VNI/L3VNI profile gates at attachment ([vpcattachment_types.go L296-312](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/vpc/v1beta1/vpcattachment_types.go#L296-L312)) | VPC emission is still a sponsor decision (R06 D-OPS-2). Not executed here |

### 2.1 Mapping a server port to its intended network

| Product intent (H) | Resolves to (upstream) | Constraint | Evidence |
| --- | --- | --- | --- |
| Port → **leaf class / placed group** | Proposed template plus explicit placement group; emitted Switch instances have `profile`, `role`, `topology.fabric` and domains | Template reuse across Fabrics/domains is not prohibited by an upstream class rule. A placement group scoped to one Fabric/domain set is H, pending D01/D02 adoption | H mapping; F per-Switch fields; X instance placements only |
| Placed leaf group → **Fabric** | `Switch.topology.fabric` | In the proposed scoped-group mapping, selecting a placed group resolves Fabric; selecting a reusable template alone does not. Partial intent stays in hh-aid until placement is specified | H mapping; F Switch field |
| Port group → **bundle** (ESLAG/bundled) | One Connection, one Fabric | All legs land in the same Fabric; ESLAG peers share domains and need `features.eslag` | F, X N2 |
| Port → **plane** | Domain set of the destination leaf | A single-domain leaf pins the port to one plane. A shared leaf is reachable from both planes' VPCs, but **never as transit** | D; R04 C2 |
| Port → **separate installation** | A separate `Server` object in that installation's wiring | No cross-installation identity upstream | I (Q-FP-1) |
| Port → **bootstrap/OOB management** | Unmanaged bootstrap links to switch/control/gateway management interfaces are outside the `hhfab` wiring model | This does not prohibit a BMC or other server Ethernet port from attaching as a Server to a separately verified managed Fabric. Its profile, physical and service support must be qualified separately | D unmanaged installation network (R06 O1); managed BMC scenario remains conditional, not demonstrated here |

## 3. Executed evidence (pinned `hhfab validate`)

[positive-multi-fabric-server.yaml](fabric-profile-contract/positive-multi-fabric-server.yaml) is the positive fixture:
- Fabrics `backend` (`plane-a` and `plane-b`) and `frontend` (`default`);
- synthetic template labels `rail-leaf` (instances placed separately in plane-a and plane-b) and `shared-leaf` (one both-plane placement) in `backend`; these labels are comments, not upstream class objects;
- an ESLAG pair in `frontend`;
- server `gpu-01` with ports `be-rail0` (plane-a rail leaf), `be-rail1` (plane-b rail leaf), `storage0` (shared leaf) and `fe0`/`fe1` (ESLAG, frontend);
- profile `vs` only.

[negative-cases.yaml](fabric-profile-contract/negative-cases.yaml) holds single-mutation cases. I wrote each case's expected outcome from source before running it. [run-fixtures.sh](fabric-profile-contract/run-fixtures.sh) applies the mutations and records results. The raw run output is in [run-output.txt](fabric-profile-contract/run-output.txt).

| Case | Mutation | Expected | Actual (X) |
| --- | --- | --- | --- |
| positive | — | accept | **OK** |
| N1 | server Connection labelled `backend` lands on a `frontend` leaf | reject | `connection is in fabric backend but switch fe-leaf-1 is in fabric frontend` |
| N2 | ESLAG legs on leaves of two Fabrics | reject | `connection is in fabric frontend but switch rail-leaf-a1 is in fabric backend` |
| N3 | plane-a spine uplinks a plane-b-only leaf | reject | `spine spine-a1 is in domain plane-a but leaf rail-leaf-b1 is in domains [plane-b]` |
| N4 | spine in both planes | reject | `spine must be in exactly one domain, found 2` |
| N5 | leaf names undeclared `plane-c` | reject | `domain plane-c not found in fabric backend` |
| N6 | manual SwitchProfile, default config | reject | `switch profile manual-example-64x400 does not exist`: Enforce deleted it ([include.go L31-38](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/pkg/util/apiutil/include.go#L31-L38)) |
| P2 | same profile + `fab.yaml` `allowExtraSwitchProfiles: true` | accept at wiring level | **OK**. Offline wiring/profile/port checks only; no complete CRD schema, admission, NOS, platform or support claim |
| B1 | documented spine-only `celestica-ds4000` used as `server-leaf` | accept at wiring level | **OK**. The API does not enforce the documented role hint |

**Disclosure.**
- The first B1 run failed with `port rail-leaf-b1/E1/40 is not allowed`, because DS4000 has 32 ports. That was a fixture artefact, not the property under test. I moved all leaf uplinks to E1/30–31 and re-ran everything; no expectation changed.
- These results come from offline in-memory validation. They are not API-server admission (R03 G1–G7) and are not deployment evidence.
- VPC-level plane rules (attachment, peering) are cited from docs and source and were not executed here.

## 4. Switch-profile catalog trace

### 4.1 Where profiles come from

| Path | Content | Use for hh-aid |
| --- | --- | --- |
| Compiled Go catalog, [switchprofile/catalog.go L31-128](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/catalog.go#L31-L128) | `defaultSwitchProfiles`: 16 profiles, 15 hardware plus `vs`. `sonicCLSPlusSwitchProfiles`: 6 (5 Celestica `-clsp` hardware profiles plus a SONiC+ `vs`), only when `includeSONiCCLSPlus`. `cumulusSwitchProfiles`: `cumulus-vx`, only when `includeCumulus` ([meta/types.go L107-112](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/meta/types.go#L107-L112)). `NewDefaultSwitchProfiles().RegisterAll(ctx, nil, cfg)` validates without a cluster, as the docs generator does ([profilesref.go L69-70](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/gen/profilesref.go#L69-L70)) | **Primary machine source** (H): import or extract at the release's Fabric tag (Apache-2.0). One extraction per supported release |
| Generated docs, [reference/profiles.md](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/reference/profiles.md) and [supported-devices.md.gen](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/supported-devices.md.gen) | 15 hardware models (no `vs`, CLS+ or Cumulus), "Supported Roles" and a feature matrix; the docs say to "use the version of documentation that matches your environment" | **Documented-support evidence** per release (D). Not machine-authoritative |
| Live cluster | `kubectl get switchprofiles` ([type printcolumns L177-186](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switchprofile_types.go#L177-L186)) | The installed release's catalog, plus extras if opted in | Lifecycle/import evidence only (R06 A15) |

**Versioning (F).**
- `SwitchProfile` has no version or revision field. For a compiled default, `metadata.name` plus the exact Fabric release/commit identifies its compiled provenance; it is not sufficient identity for arbitrary imported/manual content.
- Default profiles are immutable in the API and cannot be deleted ([switchprofile_wh.go L65-101](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile_wh.go#L65-L101)). They are reconciled from the compiled catalog on start ([catalog.go L114-147](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/catalog.go#L114-L147)).
- Extra profiles can be updated within the same release when they pass `SwitchProfileWebhook.ValidateUpdate`; the compiled-default immutability check does not freeze them. Creation still needs the extra-profile opt-in. hh-aid must snapshot/hash each profile’s exact content, record origin plus import/manual revision, and compare same-release extra-profile edits as well as release changes (H).

### 4.2 What a profile provides and what it lacks

[SwitchProfileSpec fields, switchprofile_types.go L49-172](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switchprofile_types.go#L49-L172):

| Provided (F) | Planning use | Missing structured BOM/optics data (F; free-text notes may supplement) |
| --- | --- | --- |
| `displayName`, `otherNames` (≤5), `switchSilicon`, `platform` (ONIE), `nosType`, `notes` | Model identity; NOS family | Orderable SKU/part number, airflow/PSU variants, licence, price, lifecycle (EOL) |
| `ports{name: nos, baseNOSName, label, profile/group, management, oniePortName, pipeline}` | API port names, front-panel labels, management port | Physical position or row layout; cage count by type except via naming |
| `portProfiles{speed{default, supported[]}}` or `{breakout{default, supported{mode: offsets[]}}}`, `autoNeg*` | Speeds and logical breakout subports/NOS offsets, not electrical lane count or physical lane mapping. DS5000 `1x800G` has one offset (§4.2 note), which is not one electrical lane | **Cage form factor** (only as a profile-name convention such as `OSFP-800G` or `QSFP28-100G`, which the docs summary counts, [L1102-1146](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switchprofile_types.go#L1102-L1146)). Lane rate/modulation, supported optic types, reach, media, power class, DAC/AEC/AOC compatibility, FEC defaults per optic |
| `portGroups{nos, profile}` | Shared-speed constraints (e.g. 4×SFP28 groups) | — |
| `pipelines{maxPorts}`, `maxPorts` | Breakout budget per pipeline and per switch (enforced, [switch_types.go L907-965](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L907-L965)) | — |
| `features{subinterfaces, acls, l2vni, l3vni, roce, mclag, eslag, ecmpRoCEQPN, portLocator}` | Gating of RoCE, QPN, ESLAG and locator (Switch) and VPC modes (attachment) | Role eligibility as data. Roles are a docs hint derived from features plus a hard-coded EPS203 exception ([getRolesHint L240-262](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/gen/profilesref.go#L240-L262), `TODO replace with a proper roles handling`) |

Pinned examples: [DS5000 `1x800G`](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/p_bcm_celestica_ds5000.go#L111-L124) supplies one logical NOS offset; electrical lanes, modulation and physical mapping remain unverified without hardware evidence. [DCS240 notes](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/p_bcm_edgecore_dcs240.go#L28) state upper/lower port power limits (24W/14W). Preserve such source-attributed notes as qualification inputs, not a complete machine-readable optic compatibility catalog.

R05’s hardware/assembly catalog remains a separate source joined to profile provenance and exact content hash. Profile fields and notes contribute evidence but cannot supply complete physical qualification.

### 4.3 Support eligibility (what "supported" can mean)

| Status (H vocabulary) | Evidence required | Example at 26.05 |
| --- | --- | --- |
| `documented-supported` | Hardware profile listed in the release's generated Supported Devices docs, with the documented role hint and feature matrix | 15 models, e.g. `celestica-ds5000` = spine + leaf (l3-only) |
| `catalog-gated` | Compiled profile behind a non-default config flag, with no Supported Devices entry | 5 Celestica `*-clsp` hardware profiles; `cumulus-vx` and the SONiC+ `vs` are virtual (Q-FP-3) |
| `virtual-only` | `vs`, described as "for testing/demo purpose only" ([profilesref.go L142](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/gen/profilesref.go#L142)) | `vs` (VLAB) |
| `api-accepted, not documented` | A role or feature combination the API accepts but the docs do not list | B1: DS4000 as `server-leaf` |
| `manual / extra profile` | A user-described model. Upstream needs operator `allowExtraSwitchProfiles`; still no support | P2 |
| `placeholder` | Generic capacity stand-in with no profile | hh-aid only |

A profile's presence proves only representability. Support requires documented-support evidence for the specific release, role and features used. Qualified hardware tuples (optics, NOS build, firmware) remain R05/authority evidence.

## 5. Manual switch-model boundary

**Offline profile validation (F, [SwitchProfile.Validate](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switchprofile_types.go#L240-L576)) distinguishes unconditional and conditional checks:**
- Top-level metadata, `displayName`, `switchSilicon`, `platform`, and a valid `nosType` are required. This is a source summary, not a complete CRD schema.
- For each supplied management port: `M<n>`, `Management<n>` and an `eth<n>` ONIE name are checked. The loop does not establish a universal requirement to supply management ports.
- Supplied data ports need valid API/NOS names and unique labels, referencing exactly one existing profile or group. Breakout ports have additional base-NOS-name and offset requirements; these do not apply to ordinary speed ports.
- Supplied groups/profiles must be referenced and internally consistent. A speed profile uses ordinary speed strings (for example `400G`) validated by `ValidatePortSpeed`; a breakout profile uses modes (for example `2x400G`) validated by `ValidatePortBreakoutMode`. Defaults must belong to supported values. These are distinct formats, not a universal `NxSPEEDG` rule.
- Supplied pipelines need a name and nonzero `maxPorts`; a port referencing a pipeline must reference an existing one and satisfy the breakout condition. Pipelines are **not mandatory** in this validator: P2 omits them and passed offline wiring validation.

**Beyond these offline checks, complete schema/admission, physical qualification and support remain separate; planning entry is not permission to deploy:**
1. **Admission/opt-in.** The installation must set `allowExtraSwitchProfiles` ([fabricator_types.go L294](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/api/fabricator/v1beta1/fabricator_types.go#L294)). Otherwise create is refused ([switchprofile_wh.go L84-90](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile_wh.go#L84-L90)) and existing extras are deleted (F, X N6).
2. **NOS and platform.** A NOS build must exist for `platform`, installable via ONIE through the release's installers (`includeBCM`/`includeCLSP`/`includeCumulus`). Not checked offline.
3. **Profile truth.** NOS names, offsets, pipelines and groups must match the real device. The upstream README describes discovering them on a running switch (`show interface breakout modes`, `breakout resources`) ([README.md](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/README.md)).
4. **Qualification.** The upstream README test list (breakouts incl. the last port, iperf, CPU-path check, leaf VPC and peering tests) is the closest documented qualification practice. It is a contributor checklist, not a support policy (D/I).
5. **Support.** Only the Hedgehog support authority can make a manual model supported (Q-FP-2). hh-aid must show `manual` with `support: unverified` in every output, and must not emit it into an installation package without an explicit, recorded authority decision (H, consistent with sponsor direction and R05).

## 6. Glossary for model and ux (H unless marked)

| Term | Meaning in hh-aid | Upstream anchor | Do not confuse with |
| --- | --- | --- | --- |
| **Installation** | One Hedgehog controller deployment and its `fab.yaml`; the unit of software release, upgrade and credentials | Fabricator `fab/default` (F) | Fabric object; product "network" |
| **Fabric** | The upstream Fabric object: one spine-leaf topology inside an installation | `wiring/Fabric` (F) | Installation (older docs); spine–leaf "fabric" Connection type |
| **Network** (product) | The purpose a server port serves (backend, frontend, storage…) | No object; realised as Fabric + leaf class (+ domains, VPCs) | Fabric (one network may be a domain of a shared Fabric) |
| **Domain** | A spine set inside a Fabric with its own spine and gateway ASN | `Fabric.spec.domains` key (F) | Rail; redundancy group; VPC |
| **Plane** | A product/topology term for parallel spine sets; maps to one domain in the documented multi-plane backend | Domain (D) | Rail; first-hop rail domain (R03 §6.1) |
| **Shared leaf** | A leaf in more than one domain of one Fabric; attachment point for VPCs of each, never transit | `topology.domains` length > 1 (F, D) | Mesh or border transit |
| **Leaf class** | Proposed reusable model/role template. A separate placed group can constrain Fabric/domain assignment; whether to scope the class itself is an open D01/D02 choice | None (hh-aid only) | `SwitchGroup` (redundancy/group label) |
| **Rail** | Explicit server/NIC/GPU attachment intent and first-hop grouping. Port *k* is only a synthetic naming/index convention, never sufficient evidence of rail identity | None (Connection pattern; R03, R04) | Plane, domain |
| **Server** | Any non-switch endpoint; one physical device per installation | `wiring/Server` (F) | Server class |
| **Server class / profile** | hh-aid's reusable NIC/DPU/port/optic/BOM description | None in use (`ServerProfile` unused, F) | Upstream `ServerProfile` |
| **Switch model** | hh-aid catalog entry joining exact SwitchProfile content/provenance (release for defaults; hash and revision for extras) to BOM/assembly data | `SwitchProfile` (F) + R05 | Switch (an instance) |
| **Support status** | Per release and use: §4.3 vocabulary | Docs Supported Devices (D) | API acceptance |

## 7. Open questions (for sponsor relay; no outreach)

| ID | Question | Interim handling |
| --- | --- | --- |
| Q-FP-1 | For one physical server attached to two **installations**, is two `Server` objects (one per wiring) the intended model? Is any cross-installation identity expected? | hh-aid owns the physical identity and emits one Server per installation |
| Q-FP-2 | Is there a supported path for customer-requested switch models (manual profiles) beyond `allowExtraSwitchProfiles`, and who approves one? | `manual` = unverified; never installation-ready |
| Q-FP-3 | Are the `*-clsp` and Cumulus profiles supported for customer installs in 26.05, given they are absent from Supported Devices? | `catalog-gated`; not offered by default |
| Q-FP-4 | Will roles become profile data (the `TODO` in `getRolesHint`)? Until then, is the docs role hint the authority? | Treat docs hint as support; API acceptance as representability |
| Q-FP-5 | Do `border-leaf` / `mixed-leaf` carry operational meaning (agent, upgrade, docs) beyond being leaves? | Record the role; don't derive constraints from it |
| Q-FP-6 | Is several Fabrics per installation intended for separate networks (frontend/backend/storage), versus separate installations? What are the criteria? | Model both; default choice is a design decision (D01/D02), not assumed |

Carried forward from R02 (still open): Q2 ESLAG cardinalities, Q4 variant/role admission, and Q3 three-tier support **UNKNOWN**, pending authority confirmation (R02 C15). This follow-up supplies no new support determination.

## 8. Limitations

- **Executed scope.** Historical runs used the restricted local `hhfab` build with pinned validation source, in-memory, on synthetic fixtures (positive uses `vs`; P2/manual and B1/DS4000 are profile probes). Official release-binary parity was not established. No fixtures were rerun for this documentation correction. No CRD schema, API-server admission, update/delete webhooks (R03 G1–G7), NOS, VLAB or hardware.
- **Absence claims.** "No use of leaf sub-roles" and "no role/profile check" are grep- and read-based over the Fabric repo at the pin. The agent and NOS configuration may still behave differently by role through paths not read.
- **Profile counts** come from `catalog.go` at the pin; docs list 15 hardware models.
- **Fixtures** are synthetic; ASNs and MACs are placeholders, and no customer data is included.
