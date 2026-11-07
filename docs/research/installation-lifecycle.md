# R06: Installation artifacts and lifecycle handoff

| Field | Value |
| --- | --- |
| Issue | [#7 R06](https://github.com/afewell-hh/hh-aid/issues/7) (coordination [#1](https://github.com/afewell-hh/hh-aid/issues/1)) |
| Author | t9 / **ops**, Deployment and fabric operations specialist (AI agent, Claude Opus 5.5, session of 2026-11-07) |
| Independent reviewers | t2 / scout reviewed journey and ownership ([6713916896](https://github.com/afewell-hh/hh-aid/issues/7#issuecomment-6713916896)). t3 / compat reviewed upstream, provenance and lifecycle at sponsor direction ([6713925233](https://github.com/afewell-hh/hh-aid/issues/7#issuecomment-6713925233)). Both requested changes. Lead consolidated them ([6714087915](https://github.com/afewell-hh/hh-aid/issues/7#issuecomment-6714087915)). Delta reviews are pending. |
| Status | **Revision 2**: the single consolidated correction of revision 1 (`d877175`). Finding IDs (scout S1–S13, compat U1–U6) are cited inline as `[S#]`/`[U#]`. This is a bounded research draft. It is not an approved workflow, procedure, ADR, product policy or support statement, and the author has not approved it. |
| Method | Desk research only: pinned upstream source and docs, plus the R01–R05 research branches. **No installer or operator interviews took place. Nothing was run against a controller, VLAB or hardware, and neither `hhfab` nor upstream tests were run.** |

## 1. Question, scope and evidence labels

**Question.** How does an approved hh-aid design become a set of procurement packages, an installation package, a physical installation, recorded acceptance evidence and a lifecycle baseline? Who hands what to whom? Which identities, hashes, labels and records are needed? How do deviations and later changes invalidate outputs without destroying the approved baseline? Where are the boundaries between hh-aid, Hedgehog Fabric/`hhfab`, the operator and the site?

**In scope:**
- the actor/artifact journey;
- export and import artifacts;
- identity, revision and provenance conventions;
- desired, applied, installed and observed state;
- change and deviation impact;
- control, OOB and service dependencies;
- proposed custody and authority boundaries;
- acceptance evidence;
- a neutral installer/operator question set;
- decisions and authority questions.

**Out of scope:**
- hardware SKU qualification, reach and assembly catalogs (R05, #6);
- topology mathematics (R04, #5);
- the support matrix (R02, #3);
- generator internals (R03, #4);
- UX flows (D02) and the data model (D01);
- any implementation.

| Label | Meaning |
| --- | --- |
| **F** | Observed in pinned source code, cited by path and line. Read, not executed. |
| **D** | Documented in the pinned Hedgehog docs. |
| **I** | Inferred maintainer intent, or an inference from source. Unconfirmed. |
| **H** | A proposal or hypothesis from this research. Not validated with users or maintainers. |
| **Q** | An open question. |

**The one non-negotiable constraint.** Customer topology, serials, addresses, credentials and as-built data are never committed to this public repository ([AGENTS.md](../../AGENTS.md)). Everything else in §8 about custody, live writes and service scope is a **proposal** that needs the decisions in §12. [S10]

### Source baseline

| Source | Pin |
| --- | --- |
| Fabric | `v0.144.1` = [`4bde508`](https://github.com/githedgehog/fabric/tree/4bde50829fd7cfebac69332982abd1dee504a8a3) |
| Fabricator / `hhfab` | `v0.51.4` = [`d2316ac`](https://github.com/githedgehog/fabricator/tree/d2316aca666eb278541276a11a5f8dae372bf629) |
| Docs | [`1be6894`](https://github.com/githedgehog/docs/tree/1be68948e177dcc031e91659ab5293ba19893ccf), matching release 26.05 per R02 |
| hh-aid research | R01 [`75fe3ed`](https://github.com/afewell-hh/hh-aid/blob/75fe3edccafc756c6b92ad44dff9b71af73d3138/docs/research/product-discovery.md); R02 [`bf7437c`](https://github.com/afewell-hh/hh-aid/blob/bf7437c3fc852cfe06663073edc36a08de75efbc/docs/research/hedgehog-support-contract.md); R03 [`2b54790`](https://github.com/afewell-hh/hh-aid/blob/2b547901413c00fb8d7ce3eeff7d6669f2b78135/docs/research/upstream-reuse.md); R04 [`49e6079`](https://github.com/afewell-hh/hh-aid/blob/49e6079a077d1d819d12485de3896a93e8371f74/docs/research/topology-scenarios.md); R05 [`00bfe3e`](https://github.com/afewell-hh/hh-aid/blob/00bfe3e5e71b2592a869872171a06ed6e2e5fb84/docs/research/hardware-and-bom.md) and the ops review of it ([#6 6713916867](https://github.com/afewell-hh/hh-aid/issues/6#issuecomment-6713916867)). These are research inputs, not accepted product decisions. |

## 2. Executive summary

1. **Installation readiness is a site and operator state, not a design state.**
   - At this pin, the switch NOS bootstrap matches a switch by normalized `boot.serial` **or** `boot.mac`, and rejects matches that are ambiguous (F, O5).
   - Those identities usually exist only once the hardware arrives.
   - The real installer config must contain password hashes and an admin switch user (F, O4).
   - Working proposal (H): hh-aid issues design and installation packages. The operator binds identities through a recorded, field-scoped transformation, validates with the real config, and builds. Binding gates *bring-up*, not cabling. [S3, U1, U5]
2. **R01's S3/S4/S5 ladder needs refining, not replacing (§4.3).**
   - Procurement readiness is per declared package, with exact orderable SKU, length and branch geometry (R05 §6).
   - S5 splits into S5-design, a site binding, and the operator's receipt.
   - Acceptance is a separate record.
   - Each change re-runs every global gate.

   These are proposals for the sponsor (D-OPS-1). [S1, S2, S4, S9]
3. **Upstream LLDP inspection compares observed neighbors with the wiring, but its strict mode is narrower than revision 1 claimed.**
   - `--strict` reports an error only when a port with an expected neighbor has no matching neighbor among those observed.
   - It ignores external connections and ports with no expectation.
   - It passes a port that has the expected neighbor plus extra ones (F, O8).
   - Matching uses an *effective* port: the LLDP PortID, or PortDescription when the PortID is a MAC.

   This can expose a cabling swap only where the wiring holds distinct expectations and the host advertises matching identities. It proves logical adjacency only. It does not prove lane mapping, polarity, loss, reach or GPU↔NIC rail semantics. [U3]
4. **A live growth change needs live allocation.**
   - A new switch must carry ASN, IP and protocol IP. Leaves also need a VTEP IP in spine-leaf mode, and spines must not have one (F, O13).
   - The docs describe choosing these by hand.
   - hh-aid change packages leave them as operator-allocated placeholders (H). [U5]
5. **Several in-place edits are refused after install** (F, O11):
   - a switch's ASN, Fabric or domains;
   - a Connection's type or Fabric;
   - a change to `portBreakouts` if RoCE is enabled in either the old **or** the new spec. This means disabling RoCE in the same update is not a workaround.

   Fabric domains and ASNs already populated are protected, with exceptions only for filling in legacy unset fields (F, O12). The §7 change table classifies events without promising any migration procedure. [U5]
6. **Custody and authority are separated (§8).** hh-aid *records and produces* artifacts. People decide: designer, customer, support authority, operator, installer. The proposed custody boundary (hh-aid holds no real site config, no credentials and no live write path) is a sponsor decision (D-OPS-3, D-OPS-7), not a settled requirement. [S6, S10]

## 3. Upstream facts this design depends on

The prefixes `FB` (Fabric), `FZ` (Fabricator) and `DOCS` resolve to the pinned commits above.

| ID | Fact | Evidence | Label |
| --- | --- | --- | --- |
| O1 | An OOB management network is required. It is not managed by the fabric, and it is exclusive to the control node, switches and gateways. The control node expects L2 reachability and to be the only DHCP server on it. A 10GbE control-node port is *recommended*. | [requirements.md L3-8](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/requirements.md#L3-L8); [install.md L124-135](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/install.md#L124-L135); [agent.md L41-46](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/troubleshooting/agent.md#L41-L46) | D |
| O2 | Control node: a single node; HA is listed as "future". UEFI without Secure Boot. BMC/IPMI or USB media. An external NIC and a management NIC. Sizing tiers by switch count. The ControlNode name cannot change after install. | [requirements.md L19-44](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/requirements.md#L19-L44); [config.md L95](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/config.md#L95); [install.md L66-75](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/install.md#L66-L75) | D |
| O3 | Gateway nodes need IOMMU and a specific NIC class, and are managed over the same management network. | [requirements.md L48-76](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/requirements.md#L48-L76); [install.md L149-155](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/install.md#L149-L155) | D |
| O4 | `fab.yaml` holds users, password hashes, authorized keys, NTP, TLS SANs, observability targets and control-node disk and NIC names. `hhfab build` produces an ISO or IMG installer from it. **Fabricator validation requires** a non-empty control-user password hash with prefix `$5$`, at least one switch user named `admin` with role `admin`, and a `$5$` hash for every switch user. With `noPassAuth`, authorized keys are also required. `GetFabAndNodes` runs this validation for both import and validate. `--dev` uses known default credentials. A preview flag stores registry credentials in plain text. | [config.md L39-120](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/config.md#L39-L120); [FZ fabricator_types.go L847-886](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/api/fabricator/v1beta1/fabricator_types.go#L847-L886); [FZ fabutil.go L25-52](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/pkg/fab/fabutil.go#L25-L52); [FZ main.go L806-849](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/cmd/hhfab/main.go#L806-L849) | D/F |
| O5 | During NOS bootstrap, the boot server finds the SwitchBoot by normalized serial **or** management MAC, and **rejects a request that matches two switches**. SwitchBoot status records the last attempt (`served`, `agent-not-cached` or `error`). `served` does not mean the install succeeded. This scope covers switch provisioning only, not servers or other design objects. | [FB switch_types.go L109-115](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L109-L115); [FB switchboots.go L139-170](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/boot/server/switchboots.go#L139-L170); [FB switchboot_types.go L14-67](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/fcint/v1alpha1/switchboot_types.go#L14-L67) | F |
| O6 | Wiring port names are SwitchProfile API names, not NOS names. Profiles also name the management port (for example DS5000 `M1` → `Management0`, ONIE `eth0`). | [build-wiring.md L9-12](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/build-wiring.md#L9-L12); [FB switchprofile_types.go L89-91](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switchprofile_types.go#L89-L91); [FB p_bcm_celestica_ds5000.go L34](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switchprofile/p_bcm_celestica_ds5000.go#L34) | D/F |
| O7 | The fabric does not validate server port names; they are metadata. However, LLDP inspection compares them. `Server.spec.inspect.expectedSysName` declares the expected system name. Matching is case-insensitive and can strip configured name prefixes and suffixes. For server neighbors, the compared port is the **effective** port: the BCM collector uses PortDescription when the PortID is a MAC and a description exists, and the raw PortID otherwise. Fabric neighbors are mapped from NOS to API names, and their descriptions may also be checked. | [build-wiring.md L89](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/build-wiring.md#L89); [FB server_types.go L31-45](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/server_types.go#L31-L45); [FB apiutil/lldp.go L41-51](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/util/apiutil/lldp.go#L41-L51), [L303-343](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/util/apiutil/lldp.go#L303-L343); [FB bcm/state.go L808-838](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/agent/dozer/bcm/state.go#L808-L838); [lldp.md L35-50](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/troubleshooting/lldp.md#L35-L50) | F/D |
| O8 | **What LLDP `--strict` checks** (`lldpStrictErrs`): <ul><li>No error for external connections, or for ports with no expected name.</li><li>No error when any observed neighbor exactly matches the expectation, even if extra neighbors are present.</li><li>Otherwise it reports a port or description mismatch from the expected-name neighbor, or "expected neighbor not found".</li></ul> Coverage depends on the selected switches and the connection-type filters. Strict mode does **not** check freshness and does **not** produce a "no extra devices" inventory. Existing tests cover the expected-plus-extra and no-expectation cases (read only, not run). `bgp` and `bfd` have their own strict modes. `inspect switch --ports/--transceivers/--lasers` reports oper state and transceiver vendor, part, serial and CMIS state. | [FB inspect/lldp.go L113-155](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/hhfctl/inspect/lldp.go#L113-L155); [lldp_test.go L192-280](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/hhfctl/inspect/lldp_test.go#L192-L280); [FB hhfctl main.go L1364-1436](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/cmd/hhfctl/main.go#L1364-L1436); [physical_links.md L6-23](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/troubleshooting/physical_links.md#L6-L23) | F/D |
| O9 | `kubectl fabric wiring export` prints VLANNamespace, SwitchGroup, Switch, Server, Connection and ServerProfile. Depending on flags it adds SwitchProfiles and the VPC and External families. It never prints `Fabric` or the Gateway family. It strips fabric-prefixed labels and the last-applied annotation, and keeps other labels and annotations. It is not a complete snapshot. | [FB hhfctl/wiring.go L22-96](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/hhfctl/wiring.go#L22-L96); [FB kubeutil/print.go L66-104](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/util/kubeutil/print.go#L66-L104) | F |
| O10 | `hhfab diagram --live` renders from the running API. | [FZ main.go L1012-1013](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/cmd/hhfab/main.go#L1012-L1013) | F |
| O11 | Update and delete webhooks, all checks on the live API: <ul><li>Switch `topology.fabric`, `asn` and `topology.domains` are immutable.</li><li>`portBreakouts` cannot change if `oldSw.Spec.RoCE \|\| newSw.Spec.RoCE`.</li><li>Connection type and Fabric are immutable, and `StaticExternal.WithinVPC` is frozen.</li><li>A Connection with VPC attachments cannot be deleted, nor can a Server with connections.</li><li>The server-facing spec immutability check is commented out.</li></ul> A webhook allowing an edit is not a guarantee that the edit is operationally safe. | [FB switch_wh.go L72-94](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switch_wh.go#L72-L94); [FB connection_wh.go L72-111](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/connection_wh.go#L72-L111); [FB server_wh.go L85](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/server_wh.go#L85) | F |
| O12 | The docs say a Fabric's domains, leaf ASN range and domain ASNs are fixed at creation, and that moving objects between Fabrics or domains means delete and recreate. In the source, `FabricWebhook.ValidateUpdate` protects nonzero leaf ASN bounds, populated domains and their nonzero ASNs, and forbids adding domains to a non-empty map. Legacy unset values may be filled in. Shared leaves cannot have gateway or external connections. Domains of one Fabric cannot reach each other through an external. | [multi-fabric.md L263-267, L302, L340, L368](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L263-L267); [FB fabric_wh.go L101-143](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/fabric_wh.go#L101-L143); R02 addendum; R04 S05 | D/F |
| O13 | Expansion: a live Switch create needs ASN, IP and protocol IP; leaves need a VTEP IP when the fabric mode is spine-leaf; spines must not have one. The docs describe choosing values by incrementing existing ones. Replacement: edit `boot.mac`/`serial`, then reinstall via ONIE. Removal order: VPC attachments, then External attachments, then Connections, then Switch and Agent. | [FB switch_types.go L649-665](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L649-L665); [shrink-expand.md L11-108](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/shrink-expand.md#L11-L108) | D/F |
| O14 | Upgrade: config export, then `init -f`, then `build --mode=manual`, then `hhfab-recipe upgrade`. The controller refuses API changes until it has initialized. A SONiC upgrade (`switch reinstall`) is manual and disruptive. Gateway traffic can be interrupted. | [upgrade.md L8-43, L104-116](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/upgrade.md#L8-L43); [FB lock.go L24-30](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/lock.go#L24-L30) | D/F |
| O15 | Agent generations (`APPLIEDG` vs `CURRENTG`), heartbeats, NTP from the control node, and `rebootRequired` (shown as `REBOOTREQ`). | [agent.md L8-17, L82-120](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/troubleshooting/agent.md#L8-L17); [FB agent_types.go L177-178](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/agent/v1beta1/agent_types.go#L177-L178) | D/F |
| O16 | A port-locator LED can be set per switch or per port, including breakout sub-ports, where the profile supports it. | [FB switch_types.go L189-194](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L189-L194); [hhfctl main.go L902-917](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/cmd/hhfctl/main.go#L902-L917) | F |
| O17 | DS5000 CMIS/breakout limitation. Breaking out a cage with no transceiver present and inserting one later may leave CMIS modules uninitialized. Documented mitigation: the agent applies a patch automatically; **a reboot after agent deployment is needed for the patch to take effect**, shown by `REBOOTREQ`; existing failures may also need a cold power cycle. Guidance: prefer inserting transceivers before breaking out. This is not a general restart recipe. | [known-limitations.md L58-81](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/known-limitations/known-limitations.md#L58-L81) | D |
| O18 | `Switch.spec.description` is free text (the docs example is "rack 5, aisle 3, RU 22"). Nothing validates placement. | [build-wiring.md L37](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/build-wiring.md#L37) | D |
| O19 | Transceiver inspect lists integrated DAC assemblies per cage with vendor, part and serial. The example shows serials with `-1`/`-2` suffixes. A healthy transmitter with all receive lanes near −40 dBm indicates an unplugged or cut path, or a polarity problem. | [physical_links.md L14-20, L157-175](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/troubleshooting/physical_links.md#L14-L20) | D |

Carried from R03 §3.1:
- `hhfab init -c/-w` renders Go templates, so `{{` in any text field is unsafe.
- Generation is deterministic.
- Validation reports only the first error, and which error comes first varies between runs.
- The U-gate is a create-from-scratch snapshot check with gaps G1–G7.

## 4. Journey: actors, artifacts and handoffs

### 4.1 Actors

| Actor | Source | Label |
| --- | --- | --- |
| P1 solutions engineer; P2 designer; P3 installer/integrator; P4 lifecycle operator; P5 Hedgehog support; P7 procurement | R01 §4 | H (R01) |
| **OPS**: the person who runs `hhfab`/`kubectl` and holds the site config | New in R06 | H. **Q:** is OPS usually the same person as P4? |
| **AUTH**: the designated Hedgehog support authority for support claims | New in R06 | H |
| **CUST**: the customer approver of design and acceptance | New in R06 | H |
| CTRL: the Fabric controller and agents | System, not a person | — |

### 4.2 Stages

Stage IDs use the **I** prefix so they don't collide with R01's J0–J7 [S4]. I4–I10 refine R01 J4–J7, which R01 §5 assigns to R06.

| Stage | R01 stage | Actor → recipient | Artifacts in | Artifacts out (§5) | Exit gate (proposal **H**) |
| --- | --- | --- | --- | --- | --- |
| I1 Provisional estimate | J1 | P1 → customer | Intent, named defaults | Estimate | R01 S1 |
| I2 Candidate design | J2 | P1/P2 | Profiles, rails, planes, policies | Candidate | R01 S2 |
| I3 Validated design and approval | J3 | P2 → AUTH, CUST | I2 output | A1 baseline, A2 unbound wiring, A3 synthetic receipt, A5 budgetary BOM | S3 with the scoped label (§4.3). A named approval of the exact design hash. |
| I4 Procurement packages (one or more) | J4 | P2 → P7 | Approved A1; A6 placement/route for the lines in scope | **A5 package** per declared scope: exact orderable SKU, quantity, length and branch geometry per line; included and excluded items; dependency risks; revision; approver [S1, S2] | Per package, not global (§4.3) |
| I5 Installation design package | J5 | P2 → OPS, P3 | Approved A1, A5, A6 | A7 cable schedule, A8 labels, A9 port maps, A10 prerequisite checklist, A11 binding template | **S5-design** (scoped per package) |
| I6 Physical installation | J6 (install part) | P3 | A7/A8/A9, hardware | A13 as-built record | Every A7 row is installed, deviated, parked or not installed. **Runs in parallel with I7.** It needs neither `fab.yaml` nor serials [S3]. |
| I7 Site binding and operator snapshot check | (new) | OPS, with P3 supplying serials and the server owner supplying host LLDP identities | A11 inputs; unbound manifest; real `fab.yaml` (held by OPS) | Bound manifest + transformation record; A12 operator receipt (§6.3) | Binding complete for the devices being brought up; A12 pass. **Gates I8, not I6.** [S3, U1] |
| I8 Bring-up | (new) | OPS, CTRL | `hhfab build` image, A12 | Applied desired state; observed state | AE3–AE4 (§9) |
| I9 Acceptance | J6 (acceptance part) | OPS, P3, CUST (+ AUTH if a support claim is involved) | A13, observed exports | **A14 acceptance record**, separate from design state | §9 verdict |
| I10 Lifecycle baseline | J7 | OPS → P4, P5 | A1 + A14 | As-built baseline (§6.5) | A14 names its revision and binding version |
| I11 Change | J7 | P4 → P2 → OPS | Baseline, A15 operator export, change intent | A16 change package | §7 changed-scope rule [S9] |

**Loops (H).**
- An I6 deviation returns to I3 or I4 according to its class (§7.2).
- An I4 package that is already ordered becomes a locked input to later revisions (§6.4).
- I11 repeats I3–I9 over the **changed scope**: the changed objects, plus every object sharing a port, cage, assembly, failure set, domain, VPC or reservation with them, plus a re-run of every global gate. Global gates include the whole-snapshot U-gate (R03), R04's domain and VPC rules, R05's shared-failure and accounting checks, and support policy. Unchanged rows keep their acceptance evidence only when their row hashes are unchanged, and that coverage is listed explicitly. [S9]

### 4.3 Refinements to R01 S3/S4/S5 (proposals; R01's wording is refined, not superseded by a sponsor decision)

| # | R01 position | Refinement (H) |
| --- | --- | --- |
| C1 | S3 requires the "pinned CLI gate passes" | Keep the gate. The S3 label must name the config used: "logical checks passed; pinned CLI gate passed under **public synthetic validation config** V<hash>; physical compatibility unverified; budgetary BOM" (R05 §6 badge). The synthetic receipt (A3) is not the operator receipt (A12) (§6.3). [U4] |
| C2 | S5 lists "serials or MACs if required" | Switch serial or MAC is required for the **switch NOS bootstrap workflow** (O5): at least one of them must be present and must match unambiguously. It is not needed by procurement, cabling or compatibility. Server-side LLDP identities are needed only for the AE6 evidence. Binding is a separately versioned step (§6.3). It gates bring-up and is never shown as unresolved compatibility (R05 §6). [S3, U5] |
| C3 | S5: every critical unknown is closed | Add A10, attested site prerequisites. Each item names its attestor, evidence type and date. hh-aid shows them as "attested by X", not as verified. |
| C4 | S4: per-link length or **reach class** | Following R05 §6 (scout S1): procurement readiness belongs to a **declared package**. Each line needs an exact orderable SKU, quantity, length and branch geometry. A reach class can be enough for a qualified optic whose cabling plant is fixed, but not automatically for a fixed-length cable or shuffle. Partial packages state what is included and excluded, dependency risks, revision and approver. There is no global ready flag. [S1, S2] |
| C5 | Acceptance appears inside J6 | A14 is separate evidence about a site. Its statuses: `not-started`, `in-progress`, `accepted`, `accepted-with-deviations`, `blocked`. |
| C6 | Lifecycle "regenerated packages" (R01 §8.2, Lifecycle row) | For a live fabric, a change package is a *delta against an operator-supplied export*. It lists required live allocations, refused transitions and the removal order, and is labelled "operator must validate against the live API". A snapshot receipt does not prove update legality (R03 G5). [S12] |

## 5. Export and import artifacts

All rows are **H** proposals for D01, D02 and D05. Artifact **type codes** (A1…A16) are separate from unique **instance IDs** (`<type>.<name>`, for example `A2.wiring.switches`). A **bundle** is a named set of instances. [U2]

| Type | Artifact | Producer → consumer | Format | Sensitive? / credential-bearing? | Hashing |
| --- | --- | --- | --- | --- | --- |
| A1 | Design baseline record: intent, answers with provenance, policies, rule/catalog/generator versions, upstream pins, approvals (*referenced by* hash, outside the digest) | hh-aid → all | JSON | Sensitive; no credentials | In the design hash |
| A2 | **Unbound** wiring bundle (`include/*.yaml`). Wiring group by default (§5.1). | hh-aid → OPS | Canonical YAML | No credentials | In the design hash |
| A3 | Synthetic-config validation receipt | hh-aid → AUTH, OPS | JSON (R03 provenance fields) | No | Covers exact A2 instances + A4 |
| A4 | **Public synthetic validation config** (§6.6). Validation only; never an installation config. | hh-aid | YAML | Contains public, non-site placeholder credential values that Fabricator validation requires | Hashed; referenced by A3 |
| A5 | BOM: one per declared procurement package, plus a budgetary whole-design view | hh-aid → P7 | CSV + JSON | Sensitive | Per package |
| A6 | Placement and route records: device → site/row/rack/RU/orientation; assembly → route/tray ID and routed length with its source | hh-aid ↔ site | CSV/JSON | Sensitive | In the design hash |
| A7 | Cable schedule: one row per **connector end**, grouped by assembly and link (fixture §6.7) | hh-aid → P3 | CSV + JSON | Sensitive | In the design hash |
| A8 | Labels: per connector end, per port, per device | hh-aid → P3 | CSV | — | In the design hash |
| A9 | Per-device port maps: cage → mode → lanes → link, role, rail, plane | hh-aid → P3, OPS | CSV + rendered | — | In the design hash |
| A10 | Site-prerequisite checklist (§8.1) | hh-aid template → OPS attests | JSON | Sensitive when filled in | Hashed separately |
| A11 | Binding inputs: device planning ID → serial/MAC; server planning port → host-advertised LLDP identity and sysName | OPS/P3/server owner → transformation | CSV | Sensitive | Hashed as binding input |
| A12 | Operator snapshot receipt (§6.3) | OPS → hh-aid | JSON | No credentials; the config *digest* only | Covers the bound/imported bytes |
| A13 | As-built record | P3 → hh-aid | CSV/JSON | Sensitive | Hashed |
| A14 | Acceptance record | OPS/CUST → hh-aid, P5 | JSON + attachments | Sensitive | References A1, binding, A12, A13 |
| A15 | Operator-chosen exports (`wiring export`, `kubectl get fabric,gateway…`, `inspect … -o json`) | OPS → hh-aid (files) | As emitted | Should not hold credentials; screened on import | Hashed on import, with the command and capture time |
| A16 | Change package (delta, impact, live allocations needed, refused transitions, removal order) | hh-aid → OPS | YAML + report | Sensitive | Hashed |

### 5.1 Wiring and service scope (H, decision D-OPS-2)

Default proposal: A2 contains the wiring group:
- Fabric, VLANNamespace, SwitchGroup, Switch, Server, Connection;
- Gateway objects only where the design requires gateway connections.

VPC, External and peering objects express tenant and service policy. Whether hh-aid emits them is a sponsor decision. Who owns them on real sites is an interview question (§11), not an established fact [S10]. Whatever is decided:
- the R04 same-Fabric rules still constrain the topology whenever planes map to domains (R04 T09, N13);
- gateway-bearing bundles carry the R03 G2 label "not admission-checked".

## 6. Identity, revision, naming and provenance

### 6.1 Stable identities (H)

| Entity | Identity | Rule |
| --- | --- | --- |
| Project | UUID | Never derived from a customer name |
| Design revision | Integer N + design hash | Approvals target the hash |
| Binding version | `N.b<k>` + bound manifest hash | Binding changes only permitted fields (§6.3). It is not a design revision. |
| Device | Planning ID (role/group/plane/rail/slot, per R04), mapped to wiring `metadata.name` | Lowercase RFC 1123, at most 62 characters, namespace `default` (R02 K01). The ControlNode name is permanent (O2). |
| Logical link | `L-<hash(planning ID A, planning slot A, planning ID B, planning slot B)>` | **Derived from planning identities, not from wiring port text** [U1]. A recorded map links each link to its wiring ports. Binding a placeholder server port updates the map, not the ID. |
| Physical assembly | `X-<seq>` | One per purchased unit instance (R05 §4) |
| Connector end | `X-<seq>.<end>` (e.g. `.P`, `.A`, `.B`) | Per end, not per link (ops review R5-4). A link references its two end/group pairs. |
| Component instance | `C-<seq>`: module, jumper, kit child | Counted by distinct instance (R05 invariants) |
| Lane | `<device>/E1/<cage>/<lane>` | The wiring API name. Lane 1 aliases the base port (R02 K03). |

Connection names: `GenerateName()` is a convenience only (R02). hh-aid computes names, checks the length limit, and keeps the planning ID → name map in A1.

### 6.2 Port and label conventions (H)

- **Switch side:** API port names only (O6). The NOS name can appear as an extra column.
- **Server side:** wiring port strings become LLDP expectations (O7). Proposal: use the **effective comparison port the host will present**. That is the advertised PortID, or the PortDescription if the PortID is a MAC and a description exists.
  - Which one an agent advertises depends on the host's LLDP agent and its settings (**Q**, Q-OPS-6). The common case of an OS interface name is an assumption (**H**), not a fact.
  - Use a placeholder (`nic3-p0`) until binding. Binding replaces it through the link map (§6.1).
  - Record the raw PortID, PortDescription and effective port when evidence is captured.
- **Server name:** `expectedSysName` is set during binding when the host name differs from the object name. Record which prefixes and suffixes were ignored in matching (O7).
- **Cable label** (customer standards override the layout but must keep the IDs):
  - Line 1: `<link-id> <assembly.end>`
  - Line 2: `A: <rack>-<RU> <device> <port>`
  - Line 3: `B: …`
  - A rail/plane tag such as `R3 P-A`.
- **Breakout:** one label at the parent end and one per child end. The A7 rows record the parent cage, mode and lane per child.
- **Parked ends:** unused legs are labelled `PARKED <assembly.end>` and their logical slot stays reserved (R05 §4 C). The parking method follows the site standard (**Q**).
- **Device label:** the wiring name plus planning ID. `Switch.description` may carry a human placement string (O18), but A6 is authoritative.

### 6.3 Binding and receipt chain (working proposal H; alternative in D-OPS-1) [U1, S5]

**Producer (S5): the operator produces the bound wiring**, optionally using a versioned offline hh-aid helper (whether to offer one is **Q**). It is not hh-aid's live action. Each step records its actor, tool and version, and the hashes of its inputs and outputs.

```text
M_u   unbound manifest (design hash D, revision N)            -- hh-aid
B_in  A11 binding inputs (hash)                               -- OPS/P3/server owner
T     transformation record: tool+version, permitted fields only:
        Switch.spec.boot.serial | Switch.spec.boot.mac
        Server.spec.inspect.expectedSysName
        server-side Connection port strings, via the link map (§6.1)
      every changed (object, field, old, new) listed
M_b   bound manifest (hash), binding version N.b<k>           -- OPS
I     imported bytes after `hhfab init -c <real> -w ...`, verified against M_b per R03
      import controls (reject `{{`, isolated workdir, complete file manifest)
A12   receipt: release tag, source commit, asset name + SHA-256, executable SHA-256,
      platform, command, hydration mode, exit code, raw output hash,
      covers = exact paths+digests of I, real-config digest (not content),
      scope = "snapshot check at pin P under this config" (R03 G1-G7 still open)
```

Rules:
- A12 never claims that bound bytes equal A2. A3 covers A2 + A4 only.
- A change to any field outside the permitted list is **not binding**. It goes through the design-change path (§7).
- Three receipt kinds are kept separate: **synthetic snapshot** (A3), **bound snapshot** (A12), and **live change** (operator-run webhook outcome for A16, recorded with its own provenance). None of them proves update legality, convergence or hardware support.

### 6.4 Revisions, hashes and approvals (H; alternatives in D-OPS-6)

1. **Canonical bytes.** UTF-8, LF line endings, fixed key and object order, no timestamps inside hashed content.
2. **Hash definitions.** For each artifact instance, `sha256(file bytes)`.
   - `design_hash = sha256( concat over instances with in_design_hash, sorted by path, of "<path>\0<sha256>\n" )`.
   - `bound_hash` uses the same rule over M_b's instances plus the A11 hash.
   - Approvals, receipts and signatures are stored **outside** the digested set and refer to the hash. That keeps the scheme non-circular. [U2]
3. **Immutability.** An approved revision is never edited. Design-hashed content changes produce N+1 with `supersedes: N` and a semantic diff.
4. **Approval classes** (proposal for the "N+1 with lightweight approval" option, D-OPS-6): `full` for constraint- or support-touching changes, `lightweight` for physical-only changes within tolerance (§7.2). Identity-only binding is versioned as `N.b<k>` and needs no design approval.
5. **Ordered lines are locked.** A package line in state `ordered`, `delivered` or `installed` is a locked input to later revisions. A regenerated design that disagrees with it raises a conflict. It is not silently re-optimized. Surplus becomes reusable stock under R05 §6's purchase formula (ops review R5-8).
6. **In-object provenance (H/Q).** Optionally, one stable annotation per object: the planning ID. Live export keeps non-fabric annotations (O9). The revision is never stamped per object, and `{{` is rejected. Maintainers have not confirmed this use (Q-OPS-4).

### 6.5 Desired, applied, installed and observed state

| State | Meaning | System of record | hh-aid input |
| --- | --- | --- | --- |
| Approved design | Revision N | hh-aid (records approvals made by people) | Native |
| Bound package | `N.b<k>` | OPS (produces); hh-aid records M_b and A12 | Returned files |
| Applied desired | Objects in the controller API, hydrated and possibly operator-edited | Controller | A15 (O9 omissions: Fabric and Gateway fetched separately) |
| Installed | The physical record | Site/P3 (A13) | A13 import |
| Observed | Agents: LLDP, ports, transceivers, BGP/BFD, generations | Agents → controller | A15 inspect outputs |
| **Accepted applied baseline** | The applied-state export captured at acceptance, *with* hydrated values | A14 attachment | Captured once |

**Comparisons (H)** [U5]:
- **Bound package vs applied.** Run at initial acceptance (AE5). The expected hydration differences (asn, ip, protocolIP, vtepIP) are suppressed **by an explicit, recorded normalization**. The raw values are kept and become the accepted applied baseline.
- **Accepted applied baseline vs later exports.** The lifecycle check. Here allocation values are **compared, not suppressed**, so ASN, IP or VTEP drift is visible.
- **Approved/bound vs installed.** Reports as-built deviations.
- **Applied vs observed.** Reports operational or cabling faults, using upstream strict checks under their stated limits (O8).
- **Coverage.** Missing kinds (O9), unavailable exports or filtered switches are reported as **coverage incomplete**, never as equality.

### 6.6 Public synthetic validation config (H) [U4]

Fabricator validation needs credential-shaped values (O4). A3 therefore uses a **versioned public synthetic validation config**. Its contents:
- a control user and an `admin` switch user;
- `$5$` password hashes of a documented public throwaway value;
- no real authorized keys;
- placeholder interface and disk names, NTP and TLS SANs;
- a header label `VALIDATION-ONLY — NOT AN INSTALLATION CONFIG`.

It contains no site data. Whether the release binary accepts it end to end is **untested**. If no compatible synthetic config can be agreed, A3 is reported as `blocked: no synthetic config` rather than passed. The operator's real config never enters hh-aid under the working proposal (D-OPS-3). Imports are screened for credential fields.

### 6.7 Physical schedule rules (H; incorporates R05 interface and ops review R5-1–R5-10) [U6]

- **Rows and keys.** A7 has one row per connector end, keyed by assembly, end, link and parent termination. A logical lane is an attribute of the parent end, never an invented connector.
- **Integrated assembly with one cage at each end.** Model it as native-mode (`1x…`) on both sides, unless a parent assembly is modelled explicitly. Two independent assemblies may not occupy one parent cage.
- **Breakout or shuffle.**
  - One assembly ID with every end listed, including parked ends.
  - A per-end channel-group reference.
  - A **replacement unit**: the whole assembly or module, plus the set of links it takes down. That set can span planes.
  - Branch geometry ties endpoint placement to breakout pairing. Moving one leg can invalidate the SKU.
- **Each row records:**
  - connector type and polarity method;
  - route ID;
  - routed length and its source (`user-supplied` or `derived:<method>`);
  - slack;
  - selected SKU length, with `orderable_length` = the smallest qualified SKU length ≥ routed length + slack (never rounded down; never the vendor's maximum reach);
  - package line state (`planned`, `ordered`, `delivered`, `installed`, `parked`, `deviated`).
- **Physical-only link classes.** These have no Connection object but belong in A7 and A5:
  - switch management ports (`M1`, O6);
  - gateway and control-node management interfaces;
  - the control-node uplink to the OOB switch;
  - optional console ports.
- **Electronic identity.** Pluggable modules and integrated cable ends can be identified electronically at acceptance (O19). Passive jumpers, trunks and harnesses can only be identified by label and record. Whether a breakout child end reports its own serial is **Q**.
- **Fixtures.** [example-cable-schedule.csv](installation-lifecycle/example-cable-schedule.csv) and [example-package-manifest.json](installation-lifecycle/example-package-manifest.json) are synthetic and unqualified.

## 7. Deviations and changes

### 7.1 What each event invalidates

Columns:
- **Wiring**: A2 changes.
- **Phys**: A5/A7/A8 change.
- **Class**: the deviation class (§7.2).
- **Acc**: which acceptance evidence is invalidated.
- **Upstream**: what the live API allows (F/D).

All other content is H.

| Event | Wiring | Phys | Class | Acc | Upstream / note |
| --- | --- | --- | --- | --- | --- |
| Same SKU, different unit (serial) | No | No | T0 | That row's identity only | — |
| Same assembly type, different length within the qualified tuple | No | A5/A7 line | T1 | Row | Ordered lines are locked (§6.4) |
| Different media class (DAC → AOC/optic) | Possibly (FEC/speed) | A5/A7/A8 | T1 if inside an already qualified tuple, otherwise T3 | Row + link health | Removing `portFECs` doesn't reset the FEC setting ([FB switch_types.go L185-188](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L185-L188)) |
| Route change that alters length beyond the SKU, or a shared path/failure set | No | A6/A7 | T2 | Row(s) | — |
| Port moved, same switch and mode | Connection port | A7/A8/A9 | T1, or T2 if it consumes a reserved or locked slot | Row + LLDP | Update allowed by the webhook if `Validate` passes. Not an operational safety guarantee. |
| Breakout mode change, or straight ↔ breakout substitution | Switch `portBreakouts` + Connections | A5/A7/A9 | T2 | Cage ports | **Refused if RoCE is set in the old or new spec** (O11), so disabling RoCE in the same update doesn't help. DS5000 CMIS caveat (O17). No workaround procedure is implied. |
| Link landed on a different leaf | Connection | A7/A8 | T2 (rail/plane/redundancy, R04 T03/T04) | Row; rail/domain checks | May cross domains; VPC rules apply (O12) |
| Server NIC ports swapped | No | No | Fix on site | AE6 may show a port mismatch if the expectations are distinct and bound (O8) | Not detectable by LLDP when the expectations are placeholders or ambiguous |
| Switch RMA, same profile | Binding only | Label | T0 (binding `N.b<k+1>`) | Full AE4–AE7 for that switch | Edit identity, then ONIE reinstall (O13) |
| Switch replaced by a different profile | Switch + Connections | Many | T2/T3 | Switch + neighbors | Port names may differ; ASN immutable (O11) |
| Add servers on reserved ports | New Server + Connection | New rows | T2 (growth) | New rows | Create only |
| Add switches in an existing declared domain | New Switch + Connections | New rows | T2 | New + neighbor rows | **ASN, IP and protocol IP from live allocation; VTEP IP only for leaves in spine-leaf mode** (O13). hh-aid leaves them as placeholders. Allocation across multiple domains needs operator and authority input (Q-OPS-2). |
| Add a domain or plane to a populated Fabric | — | — | — | — | **Refused** (O12). The options (create-time predeclaration, a separate Fabric, a separately designed migration) are not equivalent. **No in-place migration is promised.** |
| Change a switch's ASN, Fabric or domain | — | — | — | — | Refused (O11). Delete and recreate is not a safe default. |
| Remove a switch | Deletes | Rows | T2 | Neighbors | Reference-guarded order (O13) |
| Release upgrade | Possibly | No | T3 | Re-run AE3–AE8 | Re-pin; API locked until initialized (O14) |

### 7.2 Deviation classes and proposed approvers (H; decision D-OPS-5) [S7]

| Class | Definition | Proposed approver (roles, not tools) | Revision effect (working proposal; see D-OPS-6) |
| --- | --- | --- | --- |
| T0 identity/tolerance | No change to design-hashed content (unit swap, binding) | OPS records; P3 attests | Binding version `N.b<k>`; no design revision |
| T1 physical-only | Design-hashed physical content changes inside the qualified tuple and inside policy (length, label, same-switch port within allocation) | P2 designer + OPS (lightweight) | N+1, `lightweight` approval |
| T2 constraint-touching | Changes rails, planes, redundancy, failure sets, reservations or locks, breakout mode, or exceeds the qualified length | P2 + the owner of the failure/growth policy (CUST or sponsor) | N+1, `full` approval |
| T3 support-touching | New capability, profile, NOS, optic tuple or release | As T2 + AUTH | N+1, `full` approval + support evidence |

Every A14 states which rows were accepted against N and which against N+1, along with the binding version. [S8]

## 8. Dependencies, custody and authority

### 8.1 Hedgehog control, OOB and service dependencies (A10)

| Item | Attestor | Evidence supplied | hh-aid role |
| --- | --- | --- | --- |
| OOB management switch(es): exclusive L2, no other DHCP server, ports for every switch `M1` and every gateway/control management interface; control-node uplink (10GbE recommended, O1) | OPS / site network | Port plan; DHCP exclusivity confirmation | Count and place the management ports and the physical-only links (§6.7) |
| Control node: size tier, UEFI without Secure Boot, NVMe class, external/management NICs, BMC access, permanent hostname | OPS | Spec; NIC names | Flag the size tier from switch count |
| Gateway nodes: IOMMU, NIC class | OPS | Spec | Count gateway connections |
| External network for control-node SSH/API; TLS SANs | Customer IT | Addressing | None |
| NTP; artifact delivery (internet or airgap) | Customer IT / OPS | Method | None |
| Switch ONIE and platform/NOS support | OPS + AUTH | Supported-device evidence (R02) | Support policy |
| Observability targets | OPS | URLs | None |
| Power, cooling, rack space | Site | Facility sign-off | Placement only |
| Host LLDP on servers (for AE6) | Server owner | Agent and settings; advertised sysName and effective ports | Recorded in A11; otherwise the link is an evidence gap |
| DS5000 sequencing, if used | OPS | Plan: insert optics before breakout, or reboot after population; `REBOOTREQ` checked (O17) | Adds AE4 item |

### 8.2 Custody and live-write boundaries (proposals for D-OPS-3 and D-OPS-7) [S10, U4]

**Working proposal:**
- hh-aid does not receive the operator's real `fab.yaml`, installer images, kubeconfigs, or switch/BMC/PDU/registry credentials.
- hh-aid uses only the public synthetic validation config (§6.6).
- Imports are operator-chosen files, screened for credential fields and recorded by hash.
- In early slices hh-aid has no live write path: no `kubectl apply`, `hhfab build`, `switch reinstall` or `locate`. It may print suggested commands for the operator.

**Alternatives** are recorded in D-OPS-3 and D-OPS-7: a vault-held real config; an operator-approved write path later; never. The public-repo data rule (§1) is the only part of this section that is not a proposal.

### 8.3 Custody versus authority [S6]

"hh-aid" here means the tool, which records and produces. The decision-makers are people.

| Concern | hh-aid (records/produces) | P2 designer | CUST | AUTH | OPS / P4 | P3 installer | CTRL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Design intent and revisions | Produces, versions | Authors | Approves design | Approves support claims | Requests changes | — | — |
| Procurement packages | Produces | Declares scope | Approves spend (Q) | — | — | — | — |
| Unbound wiring, A3 | Produces | Reviews | — | — | — | — | — |
| Binding, real config, A12 | Records returned hashes | — | — | — | **Produces and holds** | Supplies serials | — |
| Applied desired state | Reads exports | — | — | — | **Writes** | — | **Holds** |
| Observed state | Reads exports | — | — | — | Reads | — | **Reports** |
| As-built record | Records | Reviews | — | — | Reviews | **Produces** | — |
| Deviation approval | Records (§7.2) | T1–T3 | T2–T3 | T3 | T0–T1 | Attests | — |
| Acceptance (A14) | Records | — | Signs (Q, D-OPS-4) | Signs if a support claim | Signs | Signs workmanship | Supplies evidence |
| Change execution, sequencing, downtime | Impact + order proposal | — | Approves window (Q) | Migration safety | **Owns** | Physical work | Enforces webhooks |

## 9. Installation acceptance evidence

The commands below are documented or observed in source (F/D). Using them as an acceptance suite is a proposal (H), and none were executed here.

| ID | Check | Evidence (operator-run, captured in A14 with time and command) | Pass condition (H) | Does not prove |
| --- | --- | --- | --- | --- |
| AE1 | Package chain | M_u, T, M_b, A12 coverage (§6.3) | Every hash links; A12 covers the imported bytes of M_b | Correctness |
| AE2 | Bound snapshot check | A12 | Exit 0 at pin with real config | R03 G1–G7; update legality |
| AE3 | Control plane | "Control Node installation complete"; `fabriccontrollers` Ready; `fab/default` versions | Ready; versions = pin | Data plane |
| AE4 | Switches provisioned | `get agents -o wide` (heartbeat, `APPLIEDG == CURRENTG`, version, `REBOOTREQ`); `inspect fabric` serials; SwitchBoot last attempt | Every designed switch present, serial/MAC matches the binding, no ambiguity errors, no pending reboot. A separate inventory comparison (not strict LLDP) looks for unexpected devices. | Cabling |
| AE5 | Applied = bound | `wiring export` + `get fabric,gateway…`; explicit hydration normalization with raw values kept (§6.5) | No unexplained difference; coverage complete or listed | Physical state |
| AE6 | Logical adjacency | `inspect lldp --strict -o json` with fabric, server and gateway connection types; switches enumerated; capture time and TTL/age recorded | Zero strict errors. Each LLDP-unavailable or placeholder link is listed as an **evidence gap** (accepted deviation or blocker), not a pass. Extra neighbors are reported from non-strict output. | Lane mapping, polarity, loss, reach; GPU↔NIC rail semantics; absence of extra devices |
| AE7 | Link and optic health | `inspect switch --ports/--transceivers/--lasers` | Designed ports up/up at the designed speed. Module and cable-end vendor/part are within the qualified tuple (R05). Per-lane readings show no gross fault (O19). | Loss margin or certification (site method, Q); long-term error rate |
| AE8 | Routing adjacency | `inspect bgp --strict`, `bfd --strict` | Zero strict errors (scope as listed) | Workload paths |
| AE9 | Labels and placement | Sampled audit; **sampling pattern adapted from R01 SM6** (SM6 measures schedule comprehension, not physical installation) [S12] | Every sampled end correct; a miss triggers a full audit of that pattern | Unsampled ends |
| AE10 | Deviation closure | A13 vs A7 | Every row installed, parked or deviated, with its class approved (§7.2) | — |
| AE11 | Service smoke test (optional, operator-owned) | Operator's own test | Customer-defined | RoCE performance |
| AE12 | Failure tests (optional) | Controlled removal in a maintenance window, with operator authority | Customer-defined, using R04 failure states | Anything untested |

The JSON output shapes are not a published stable contract (Q-OPS-1), so parsers are versioned to the pin. VLAB success is not site acceptance.

## 10. Questions for sponsor relay to the Hedgehog authority (no outreach made)

| ID | Priority | Question | Evidence | Interim handling |
| --- | --- | --- | --- | --- |
| Q-OPS-1 | High | Are `inspect lldp/bgp/bfd --strict` and their `-o json` intended for scripted acceptance? Is the JSON shape stable? Is a "no unexpected neighbors" mode intended? | O8 | Captured evidence; versioned parsers; no extra-device claims |
| Q-OPS-2 | High | What is the supported allocation of ASN, IP, protocol IP and VTEP for switches added to a live fabric, including multi-domain? Can `hhfab` hydrate a delta? | O13 | Operator-allocated placeholders |
| Q-OPS-3 | High | Is `wiring export` meant to be a complete, re-importable snapshot, given it omits Fabric and Gateway? | O9 | Fetch them separately; coverage reported |
| Q-OPS-4 | Medium | Are custom annotations on wiring objects acceptable and durable provenance? | O9 | Optional planning ID only |
| Q-OPS-5 | High | What is the supported procedure and expected downtime for breakout changes on a RoCE switch, given the old-or-new guard? | O11, O17 | "Requires operator procedure" |
| Q-OPS-6 | Medium | What should server port strings contain: PortID, PortDescription or interface name? Which host LLDP agents and settings does support expect? Do DPU ports advertise separately? | O7 | Effective comparison port; placeholders until binding |
| Q-OPS-7 | Medium | Is replacing a server-side port string on an attached Connection operationally safe? | O11 | Treat as a change needing operator validation |
| Q-OPS-8 | Medium | Who is the acceptance authority on customer installs? What does Hedgehog support want in a design handoff? | — | Named signatories in A14 |
| Q-OPS-9 | Medium | Is a predeclared, initially unused domain recommended for growth, and what does it cost? | O12 | Option with open risks |
| Q-OPS-10 | Low | Do artifacts or naming change when HA control nodes arrive? | O2 | Single-node assumption |
| Q-OPS-11 | Medium | Is a public synthetic validation config (§6.6) an acceptable way to run offline validation? Is there a supported config-free validation entry point? | O4 | A3 blocked if neither is available |

## 11. Neutral installer and operator question set

**Nothing has been asked yet.** Use the R01 §9 conventions for format, screening, past-behaviour framing and the bias note. Items marked → R01 ask the same thing as an R01 question; ask them once. [S11]

**Installers / integrators (P3)**

1. (→ R01 Q-I1) For your most recent install, which documents did you receive, and which did you rebuild yourself?
2. How were cable lengths decided on your last job? Who decided, and when?
3. On your last job with multi-leg cables, how were the legs labelled and recorded? What happened to unused legs?
4. (→ R01 Q-I3) Tell me about the last time a planned port, cable or optic didn't fit. What happened, and who approved the change?
5. On your last job, when did you get switch serial numbers and MACs, and who recorded them?
6. How did you show that the links were cabled correctly before handover? (Ask openly first, then probe for the methods used.)
7. Which customer labelling or DCIM standards have you had to follow?
8. At your last handover, who signed acceptance, and what evidence did they ask for?

**Operators (P4/OPS)**

9. In your last expansion or switch replacement, which values did you have to look up or allocate by hand?
10. Has fabric configuration, or any credential, ever been shared with a vendor, integrator or tool? What happened, and who decided?
11. Which checks did you run after your last bring-up before you considered the fabric accepted?
12. Last time the running fabric differed from the design document, which did you trust, and how did you reconcile them?
13. Have you ever had to change domains, ASNs or breakouts on a running fabric? What did you do?
14. Last time, who confirmed the OOB network, DHCP and control-node prerequisites, and how?
15. On your sites, who creates VPCs and externals, and when?

## 12. Decisions requested (sponsor or lead; alternatives listed, proposal marked) [S13]

| ID | Decision | Alternatives | Proposal (H) |
| --- | --- | --- | --- |
| D-OPS-1 | S5 and binding model | (a) S5-design + operator-produced binding `N.b<k>` + A12 receipt; (b) hh-aid applies A11 and issues the bound bundle; (c) a single S5 with serials/MACs in the design revision | (a) |
| D-OPS-2 | Default wiring/service scope | (a) wiring group by default, VPC/External opt-in; (b) always emit service objects; (c) never emit them | (a), pending Q15 interviews |
| D-OPS-3 | Real site config and credential custody | (a) hh-aid never holds them and uses the public synthetic config; (b) an optional vault designed by D05; (c) operator-side helper only | (a) for early slices |
| D-OPS-4 | Acceptance signatories and tolerated evidence gaps | Customer / Hedgehog field / partner / combinations; which AE gaps can be accepted | Undecided; needs interviews and Q-OPS-8 |
| D-OPS-5 | Deviation approval authority per class (§7.2) | The proposed T0–T3 roles; or every deviation designer-approved; or site-only for T0–T1 | T0–T3 as in §7.2 |
| D-OPS-6 | As-built revision rule | (a) N+1 with a lightweight approval class for T1, full for T2/T3; (b) baseline = N + accepted deviation set without a new revision for T1 | (a) |
| D-OPS-7 | Live-write boundary (relates to R01 D3/D5) | (a) none in early slices; (b) a later operator-approved write path; (c) never | (a), revisit at D05 |

## 13. Assumptions and limitations

- **No execution.** No `hhfab`, `kubectl`, VLAB, hardware or upstream tests were run. Command behavior comes from pinned source and docs. The acceptance suite and the synthetic config have not been run.
- **No human evidence.** No interviews or measurements were made. Every actor, artifact, gate and approval class is **H**.
- Docs are pinned at a commit, not a release tag (R02 caveat).
- `kubectl fabric` is inferred to be the shipped `hhfctl` from the installed-tools list ([install.md L140](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/install.md#L140)) (**I**).
- Migration sequencing, rollback and live-traffic impact were not designed.
- Physical examples are unqualified. Exact SKU, mode, length and optical qualification remain R05 inputs.

## 14. Acceptance criteria mapping (#7)

| Criterion | Evidence | Status |
| --- | --- | --- |
| Journey with actors and handoffs | §4 (I1–I11, actors, refinements C1–C6) | Revised for S1–S4, S9 and U1 |
| Artifacts, identities, revisions, naming, provenance; state separation | §5, §6, fixtures | Revised for S5, S8, U1, U2, U5 and U6 |
| Acceptance evidence; deviations and baselines | §7, §9 | Revised for S7, S8, U3 and U5 |
| Questions; boundaries | §8, §10, §11 | Revised for S6, S10, S11 and U4. Interviews not held. |
| Facts, hypotheses, inference, questions; versions | Labels, §3, §15 | Revised for S12 |
| Independent review; decisions | Reviews by scout and compat (changes requested); delta reviews pending; decisions in §12 | **Not met until the delta reviews are dispositioned and the sponsor decides** |

## 15. Reproduction

```sh
for r in fabric:4bde50829fd7cfebac69332982abd1dee504a8a3 \
         fabricator:d2316aca666eb278541276a11a5f8dae372bf629 \
         docs:1be68948e177dcc031e91659ab5293ba19893ccf; do
  n=${r%%:*}; s=${r##*:}
  git init -q "$n" && git -C "$n" fetch -q --depth 1 "https://github.com/githedgehog/$n" "$s" \
    && git -C "$n" checkout -q FETCH_HEAD
done
sed -n 113,155p fabric/pkg/hhfctl/inspect/lldp.go                       # O8 strict semantics
sed -n 808,838p fabric/pkg/agent/dozer/bcm/state.go                     # O7 effective port
sed -n 139,170p fabric/pkg/boot/server/switchboots.go                   # O5 serial-or-MAC, ambiguity
sed -n 72,94p   fabric/pkg/ctrl/switch_wh.go                            # O11 old-or-new RoCE guard
sed -n 649,665p fabric/api/wiring/v1beta1/switch_types.go               # O13 role/mode fields
sed -n 22,96p   fabric/pkg/hhfctl/wiring.go                             # O9 export coverage
sed -n 847,886p fabricator/api/fabricator/v1beta1/fabricator_types.go   # O4 user/hash prerequisites
sed -n 58,81p   docs/docs/known-limitations/known-limitations.md        # O17
```

The fixtures are hand-written, synthetic and unqualified. They use placeholder hashes and contain no customer data. They are not generator output and not a package anyone could install from.
