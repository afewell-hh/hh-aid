# R06: Installation artifacts and lifecycle handoff

| Field | Value |
| --- | --- |
| Issue | [#7 R06](https://github.com/afewell-hh/hh-aid/issues/7) (coordination [#1](https://github.com/afewell-hh/hh-aid/issues/1)) |
| Author | t9 / **ops**, Deployment and fabric operations specialist (AI agent, Claude Opus 5.5, session of 2026-11-07) |
| Independent reviewers | t2 / scout (journey and ownership) and t4 / bridge (upstream integration). Lead dispatches them; **no review has happened yet**. |
| Status | Revision 1. A bounded research draft. It is not an approved workflow, procedure, ADR or support statement, and the author has not approved it. |
| Method | Desk research only, using pinned upstream source and docs and the R01–R04 research branches. **No installer or operator interviews took place, nothing was run against a controller, VLAB or hardware, and `hhfab` was not executed.** |

## 1. Question, scope and evidence labels

**Question.** How does an approved hh-aid design become a usable installation package, a physical installation, recorded acceptance evidence and a lifecycle baseline? Who hands what to whom? Which identities, hashes, labels and records are needed? How do deviations and later changes invalidate outputs without destroying the approved baseline? Where does hh-aid stop and Hedgehog Fabric, `hhfab`, the operator and the site begin?

**In scope.** The actor/artifact journey; export and import artifacts; identity, revision and provenance conventions; separating desired, applied, installed and observed state; change and deviation impact; control, OOB and service dependencies; credential and ownership boundaries; acceptance evidence; a neutral installer/operator question set; and authority questions.

**Out of scope.** Hardware SKU qualification, reach and assembly catalogs (R05, #6). The topology mathematics (R04, #5). The support matrix (R02, #3). Generator internals (R03, #4). UX flows (D02). The data model (D01). Any implementation.

| Label | Meaning |
| --- | --- |
| **F** | Observed in pinned source code (path and line cited). Read, not executed. |
| **D** | Documented in the pinned Hedgehog docs. |
| **I** | Inferred maintainer intent. Unconfirmed. |
| **H** | A proposal or hypothesis from this research, not validated with users or maintainers. |
| **Q** | An open question. |

### Source baseline

| Source | Pin |
| --- | --- |
| Fabric | `v0.144.1` = [`4bde508`](https://github.com/githedgehog/fabric/tree/4bde50829fd7cfebac69332982abd1dee504a8a3), prefix `FB` |
| Fabricator / `hhfab` | `v0.51.4` = [`d2316ac`](https://github.com/githedgehog/fabricator/tree/d2316aca666eb278541276a11a5f8dae372bf629), prefix `FZ` |
| Docs | [`1be6894`](https://github.com/githedgehog/docs/tree/1be68948e177dcc031e91659ab5293ba19893ccf), prefix `DOCS`; matches release 26.05 per R02 |
| hh-aid research | R01 [`75fe3ed`](https://github.com/afewell-hh/hh-aid/blob/75fe3edccafc756c6b92ad44dff9b71af73d3138/docs/research/product-discovery.md) (PR #19), R02 [`bf7437c`](https://github.com/afewell-hh/hh-aid/blob/bf7437c3fc852cfe06663073edc36a08de75efbc/docs/research/hedgehog-support-contract.md) (PR #17), R03 [`2b54790`](https://github.com/afewell-hh/hh-aid/blob/2b547901413c00fb8d7ce3eeff7d6669f2b78135/docs/research/upstream-reuse.md) (PR #18), R04 [`49e6079`](https://github.com/afewell-hh/hh-aid/blob/49e6079a077d1d819d12485de3896a93e8371f74/docs/research/topology-scenarios.md) (PR #20). These are research inputs, not accepted product decisions. |

Prefixes: `FB` = `https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3`, `FZ` = `https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629`, `DOCS` = `https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf`.

## 2. Executive summary

1. **Installation readiness is a site-and-operator state, not a design state.** At this pin, a switch is provisioned by matching its serial or management MAC from the wiring during ONIE/DHCP boot ([DOCS install.md L39](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/install.md#L39); [FB switch_types.go L109-115](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L109-L115)) **F/D**. Those identities usually exist only once hardware arrives. The installer image also embeds the site's credentials from `fab.yaml` ([DOCS config.md L54-72](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/config.md#L54-L72)) **D**. hh-aid can issue an *installation design package*. The installable `hhfab` input, and the binding of that package to real devices, belong to the operator. **H**
2. **R01's S3/S4/S5 ladder needs three corrections (§4.2).**
   - Split S5 into a design-side "installation package issued" state and a site-binding step.
   - Bind any `hhfab validate` verdict to the `fab.yaml` it actually ran with. hh-aid's synthetic config is not the operator's.
   - Model acceptance as a separate installation record, not as a higher design state.
3. **Upstream already compares observed cabling with the wiring.** `kubectl fabric inspect lldp --strict` fails on any missing or unexpected neighbor ([FB hhfctl main.go L1436](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/cmd/hhfctl/main.go#L1436)). It matches neighbor *name and port* case-insensitively ([FB apiutil/lldp.go L41-51](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/util/apiutil/lldp.go#L41-L51)) **F**. So the server port strings hh-aid writes become installation expectations. If they equal what the host advertises over LLDP, a rail-swapped NIC shows up as a port mismatch rather than a silent performance fault (R01 FM4). That is the strongest acceptance lever found. It depends on host LLDP, which hh-aid does not control. **F/H**
4. **A live growth change is not just "regenerate the wiring".** On a running fabric, a new Switch must carry ASN, IP, protocol IP and (for leaves) a VTEP IP ([FB switch_types.go L649-659](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L649-L659)). The docs tell operators to pick these by incrementing existing values ([DOCS shrink-expand.md L14-18](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/shrink-expand.md#L14-L18)) **F/D**. hh-aid's unhydrated design cannot supply them. A change package therefore needs operator-supplied applied state, and must be labelled as needing live allocation. **H**
5. **Several in-place edits are forbidden after install:**
   - a switch's ASN, Fabric and domain membership;
   - a Connection's type and Fabric;
   - breakouts on a RoCE-enabled switch ([FB switch_wh.go L72-94](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switch_wh.go#L72-L94); [FB connection_wh.go L72-100](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/connection_wh.go#L72-L100)) **F**.

   Deletes are reference-guarded: a Connection with VPC attachments ([L103-111](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/connection_wh.go#L103-L111)) and a Server with connections ([server_wh.go L85](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/server_wh.go#L85)) cannot be deleted **F**. The R03 U-gate (a snapshot check) catches none of this. hh-aid's change-impact table (§7) must classify these transitions without promising a migration procedure.
6. **Ownership proposal (H):**
   - **hh-aid** owns the approved intent, the package, and diffs against operator-supplied exports.
   - **The operator** owns `fab.yaml`, credentials, installer images, live writes and service objects.
   - **The controller** owns applied desired state.
   - **Agents** report observed state.
   - **The site/installer** owns the as-built physical record.

   hh-aid holds no switch, control-node or registry credentials and never writes to a controller.

## 3. Upstream facts this design depends on

| ID | Fact | Evidence | Label |
| --- | --- | --- | --- |
| O1 | The OOB management network is required. It is not managed by the fabric and is exclusive to the control node, switches and gateways. The control node expects L2 reachability and to be the only DHCP server on it. | [DOCS requirements.md L3-8](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/requirements.md#L3-L8); [install.md L124-135](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/install.md#L124-L135); [troubleshooting/agent.md L41-46](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/troubleshooting/agent.md#L41-L46) | D |
| O2 | The control node needs a single node (HA is "future"), UEFI without Secure Boot, BMC/IPMI or USB media, an external NIC and a management NIC. Sizing depends on switch count; the largest documented tier is "up to 500" switches. The ControlNode name cannot be changed after install. | [requirements.md L19-44](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/requirements.md#L19-L44); [config.md L95](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/config.md#L95); [install.md L66-75](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/install.md#L66-L75) | D |
| O3 | Gateway nodes need IOMMU and a specific NIC class (ConnectX-7 2×200G), and are managed through the control node over the same management network. | [requirements.md L48-76](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/requirements.md#L48-L76); [install.md L149-155](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/install.md#L149-L155) | D |
| O4 | `fab.yaml` holds the user password hashes and SSH authorized keys for the control node and switches, plus NTP, TLS SANs, observability targets, and control-node disk and NIC names. `hhfab build` turns it plus the wiring into an installer ISO or IMG. `--dev` sets known default passwords. A preview flag stores registry credentials in plain text. | [config.md L39-120](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/config.md#L39-L120); [install.md L118](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/install.md#L118); [FZ main.go L806-808, L846-849](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/cmd/hhfab/main.go#L806-L849) | D/F |
| O5 | Switch identity for provisioning is `spec.boot.serial` (case-insensitive) or `spec.boot.mac` (the management port). The controller derives a SwitchBoot object per switch whose status records the last boot attempt (`served`, `agent-not-cached`, `error`). `served` does not mean the install succeeded. | [FB switch_types.go L109-115](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L109-L115); [fcint switchboot_types.go L14-67](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/fcint/v1alpha1/switchboot_types.go#L14-L67) | F |
| O6 | Wiring port names must be SwitchProfile API names (`E1/N`, `E1/N/L`), not NOS names. `inspect` shows both columns. | [DOCS build-wiring.md L9-12](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/build-wiring.md#L9-L12); [physical_links.md L112-116](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/troubleshooting/physical_links.md#L112-L116); R02 | D |
| O7 | Server port names are not validated by the fabric and are "used as metadata". However, LLDP inspection compares them with the advertised neighbor port. `Server.spec.inspect.expectedSysName` declares the expected LLDP system name. | [build-wiring.md L89](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/build-wiring.md#L89); [FB server_types.go L31-45](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/server_types.go#L31-L45); [lldp.md L35-50](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/troubleshooting/lldp.md#L35-L50) | F/D |
| O8 | `kubectl fabric inspect lldp`, `bgp` and `bfd` have `--strict` modes that fail on missing or unexpected neighbors. LLDP and transceiver state are also exported as metrics. `inspect switch --ports/--transceivers/--lasers` reports admin/oper state and transceiver vendor, part, serial and CMIS state. | [FB hhfctl main.go L1364, L1403, L1436](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/cmd/hhfctl/main.go#L1364); [lldp.md L52-60](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/troubleshooting/lldp.md#L52-L60); [physical_links.md L6-23](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/troubleshooting/physical_links.md#L6-L23) | F/D |
| O9 | `kubectl fabric wiring export` prints VLANNamespace, SwitchGroup, Switch, Server, Connection, ServerProfile and optionally the VPC/External families. It does **not** list `Fabric` or the Gateway family. It strips fabric-prefixed labels and the last-applied annotation, and **keeps other labels and annotations**. | [FB pkg/hhfctl/wiring.go L22-96](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/hhfctl/wiring.go#L22-L96); [kubeutil/print.go L66-90](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/util/kubeutil/print.go#L66-L90) | F |
| O10 | `hhfab diagram --live` renders from the running API instead of local files. | [FZ main.go L1012-1013](https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629/cmd/hhfab/main.go#L1012-L1013) | F |
| O11 | Update and delete restrictions: Switch `topology.fabric`, ASN and domains are immutable; breakouts cannot change while RoCE is enabled; Connection type and Fabric are immutable; a Connection with VPC attachments, and a Server with connections, cannot be deleted. The "server-facing Connection spec is immutable" check is commented out. | [FB switch_wh.go L72-94](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/switch_wh.go#L72-L94); [connection_wh.go L72-111](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/connection_wh.go#L72-L111); [server_wh.go L85](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/server_wh.go#L85) | F |
| O12 | Fabric domains, leaf ASN range and domain ASNs are fixed at creation. Moving an object between Fabrics or domains means delete and recreate. Shared leaves cannot have gateway or external connections. Domains of one Fabric cannot reach each other through an external system. | [multi-fabric.md L263-267, L302, L340, L368](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/multi-fabric.md#L263-L267); R02 addendum; R04 S05 | D/F |
| O13 | Expansion: a live Switch create needs a hand-supplied ASN and IPs, and Switch validation requires them. Replacement: edit `boot.mac`/`serial` and re-run ONIE install. Removal: delete VPC attachments, then External attachments, then Connections, then Switch and Agent. | [shrink-expand.md L11-108](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/user-guide/shrink-expand.md#L11-L108); [FB switch_types.go L649-659](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L649-L659) | D/F |
| O14 | Upgrades: `kubectl hhfab config export`, then `hhfab init -c ... -f`, `hhfab build --mode=manual` and `hhfab-recipe upgrade`. After an upgrade the controller refuses API changes until it is initialized. SONiC upgrades are manual and disruptive (`kubectl fabric switch reinstall`). The gateway can be interrupted. | [upgrade.md L8-43, L104-116](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/upgrade.md#L8-L43); [FB pkg/ctrl/lock.go L24-30](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/pkg/ctrl/lock.go#L24-L30) | D/F |
| O15 | Agent generations: `APPLIEDG` versus `CURRENTG`, heartbeats, and NTP served by the control node. | [agent.md L8-17, L82-120](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/troubleshooting/agent.md#L8-L17) | D |
| O16 | A port-locator LED can be set per switch or per port, including breakout sub-ports, if the profile supports it. | [FB switch_types.go L189-194](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L189-L194); [hhfctl main.go L902-917](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/cmd/hhfctl/main.go#L902-L917) | F |
| O17 | DS5000 known limitation: breaking out a cage with no transceiver present and inserting one later can leave CMIS modules uninitialized. A reboot, or a cold power cycle, may be required, and `REBOOTREQ` flags it. | [known-limitations.md L58-75](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/known-limitations/known-limitations.md#L58-L75) | D |
| O18 | `Switch.spec.description` is free text. The docs use it for "rack 5, aisle 3, RU 22", but nothing validates placement. | [build-wiring.md L37](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/build-wiring.md#L37) | D |

Carried from R03 (see its §3.1): `hhfab init -c/-w` renders Go templates, so `{{` in any text field is unsafe. Generation is deterministic. Validation reports only the first error, and which error comes first is unstable between runs. The U-gate is a create-from-scratch snapshot check with gaps G1–G7.

## 4. Journey: actors, artifacts and handoffs

### 4.1 Stage table

Actors (hypotheses from R01 §4):
- **P1/P2**: solutions engineer or designer.
- **AUTH**: designated Hedgehog support authority.
- **CUST**: customer approver.
- **P7**: procurement.
- **OPS**: the operator who runs `hhfab` and holds the site config.
- **P3**: installer or integrator.
- **CTRL**: Fabric controller and agents.
- **P4**: lifecycle operator.
- **P5**: Hedgehog support.

| Stage | Actor → recipient | Artifacts in | Artifacts out (§5) | Exit gate (proposal **H**) |
| --- | --- | --- | --- | --- |
| J1 Provisional estimate | P1 → customer | Intent, named defaults | Estimate (R01 S1) | R01 S1 |
| J2 Candidate design | P1/P2 | Profiles, rails, planes, policies | Candidate design (S2) | R01 S2 |
| J3 Validated design and approval | P2 → AUTH, CUST | S2 | **A1 baseline record**, A2 wiring bundle, A3 validation receipt (synthetic config), budgetary A5 BOM | S3, plus a named approval of the exact A1 hash |
| J4 Procurement package | P2 → P7 | A1 approved, placement and length inputs | A5 BOM (orderable part classes, lengths), A6 placement | R01 S4 |
| J5a Installation design package issued | P2 → OPS, P3 | A1/A5/A6 | A7 cable schedule, A8 labels, A9 port maps, A10 site-prerequisite checklist, A11 site-binding template | **S5-design**: everything except site identities and the operator-side gate |
| J5b Site binding and operator gate | OPS (with P3 for serials/MACs) | A11 filled in; real `fab.yaml` (never given to hh-aid) | A12 operator validation receipt; bound wiring (operator-side) | **Binding complete**: every Switch has a serial or MAC; the operator's U-gate passed with the real `fab.yaml`; receipt hashes match A2. hh-aid records the receipt and does not run the check. |
| J6 Physical installation | P3 | A7/A8/A9, hardware | A13 as-built record (deviations, transceiver and assembly serials, photos as the site requires) | All A7 rows marked installed or deviated |
| J7 Bring-up | OPS, CTRL | `hhfab build` image, A12 | Applied desired state (controller); observed state (agents) | O2/O15 health (§9 AE3–AE4) |
| J8 Acceptance | OPS, P3, CUST (+ AUTH if a support claim is involved) | A13 and observed exports | **A14 acceptance record**: accepted / accepted with recorded deviations / blocked | §9 |
| J9 Lifecycle baseline | OPS → P4, P5 | A1 + A14 | **As-built baseline** = approved revision N plus accepted deviations (revision N+1 if any) | The baseline is the accepted revision and its evidence hashes |
| J10 Change | P4 → P2 → OPS | Baseline, operator export (A15), change intent | A16 change package and impact report | Approval of the new revision; operator-run update checks; acceptance of the changed subset |

Loops (H): J6 deviations go back to J3 for re-approval of revision N+1 when a deviation touches a hard constraint (§7). J10 runs J3–J8 over the changed subset only.

### 4.2 Challenges to R01 S3/S4/S5

| # | R01 position | Challenge (ops) | Proposal (H) |
| --- | --- | --- | --- |
| C1 | S3 requires "pinned CLI gate passes" | The R03 U-gate verdict is bound to the `fab.yaml` it ran with (R03 §3.1). hh-aid would use a synthetic, secret-free config. The real `fab.yaml` carries credentials and site interfaces (O4), and hh-aid should not hold it. | Keep the hh-aid U-gate in S3, but label it "synthetic config C<hash>". Require a separate **operator validation receipt** (A12) before installation. CLI success is one check, not installation readiness. |
| C2 | S5 lists "serials or MACs if required" | They are always required at this pin, because the boot server matches one of them (O5). They arrive with the hardware, usually after S4. Filling them into design YAML would change the design hash for a non-design fact. | Split S5. **S5-design** = package issued. **Site binding** = a separate operator artifact that maps planning device IDs to serial/MAC. Binding does not create a new design revision; it produces a bound package hash. |
| C3 | S5 = "every critical unknown closed by its resolver" | Many installation prerequisites are outside any Hedgehog object: OOB switch, control node hardware, DHCP exclusivity, NTP, image delivery or airgap, BMC access, gateway IOMMU (O1–O3). hh-aid cannot verify them. | Add A10, a site-prerequisite checklist. Each item records an attestor, the evidence type and the date. hh-aid shows each item as "attested by X", never "verified". |
| C4 | S4 needs per-link length or reach class | Length needs placement (rack/RU, cable path) and slack policy. These are site facts and differ by cabling standard. | S4 needs A6 placement with the source of each position. A derived length is labelled with its method (R05 owns reach rules; §11 asks parts). |
| C5 | Acceptance appears as J6 output | Acceptance is evidence about the physical and observed state of a site. It is not a property of the design. A design can be valid while an installation is unaccepted, and the reverse. | Record A14 separately. Statuses: `not-started`, `in-progress`, `accepted`, `accepted-with-deviations`, `blocked`. It references the design revision and bound package hashes. |
| C6 | J7 lifecycle: "regenerated packages" | For a live fabric, regeneration from unhydrated intent cannot produce the required ASN/IP fields (O13) or prove update legality (O11, R03 G5). | A change package is a *delta proposal against an operator-supplied applied-state export*. It lists required live allocations and forbidden transitions, and is labelled "operator must validate against live API". |

## 5. Export and import artifacts

All are **H** proposals for D01, D02 and D05. "Sensitive" means customer-confidential: never stored in this public repo (AGENTS.md).

| ID | Artifact | Producer → consumer | Proposed format | Contains secrets? | Hashed in manifest |
| --- | --- | --- | --- | --- | --- |
| A1 | Design baseline record: intent, answers with provenance, policies, rule, catalog and generator versions, upstream pins, scenario choice, approvals | hh-aid → all | JSON + rendered summary | No (sensitive) | Root of the manifest |
| A2 | Wiring bundle (`include/*.yaml`), unhydrated, wiring group only by default | hh-aid → OPS (`hhfab init -w`) | Canonical YAML, one file per kind or per Fabric | No | Yes, per file |
| A3 | hh-aid validation receipt: U-gate with synthetic config; support-policy and D04 checks | hh-aid → AUTH, OPS | JSON (R03 provenance fields) | No | Yes |
| A4 | Synthetic validation config (`fab.yaml` without users or keys) | hh-aid internal; shown to OPS | YAML | **Must not contain secrets** | Yes |
| A5 | BOM: part classes, quantities, compatibility evidence, spares policy, pricing labelled as estimate | hh-aid → P7 | CSV + JSON | No | Yes |
| A6 | Placement: device → site/row/rack/RU/orientation, with source per position | hh-aid ↔ site | CSV/JSON | No (sensitive) | Yes |
| A7 | Cable schedule: one row per **physical termination pair**, keyed by logical-link and assembly IDs (fixture: [example-cable-schedule.csv](installation-lifecycle/example-cable-schedule.csv)) | hh-aid → P3 | CSV + JSON | No | Yes |
| A8 | Label set: cable-end, port and device labels | hh-aid → P3 | CSV for a label printer | No | Yes |
| A9 | Per-device port maps: cage → mode → lanes → link/role/rail/plane | hh-aid → P3, OPS | PDF/HTML + CSV | No | Yes |
| A10 | Site-prerequisite checklist (§8) | hh-aid template → OPS attests | JSON/Markdown | No | Yes |
| A11 | Site-binding sheet: planning device ID → wiring name → serial / mgmt MAC (switches); host LLDP sysName and NIC port IDs (servers) | OPS/P3 fills in → hh-aid records | CSV | No (sensitive) | Yes, as a separate binding hash |
| A12 | Operator validation receipt: `hhfab` version and binary hash, command, exit code, wiring hashes, a `fab.yaml` *hash only* | OPS → hh-aid | JSON or a pasted template | No; the config hash only | Yes |
| A13 | As-built record: per A7 row installed / deviated / not installed, the actual port or assembly, transceiver vendor/part/serial, installer, time | P3 → hh-aid | CSV/JSON | No (sensitive) | Yes |
| A14 | Acceptance record: §9 evidence, verdict, signatories, references to A1/A12/A13 hashes | OPS/CUST → hh-aid, P5 | JSON + attachments | No; attachments may include IPs and serials (sensitive) | Yes |
| A15 | Imported operator exports: `kubectl fabric wiring export`, `kubectl get fabric,gateway... -o yaml`, `inspect ... -o json` | OPS → hh-aid (file upload; no cluster access) | YAML/JSON as emitted | Should not; hh-aid rejects files containing credential fields | Hash recorded on import |
| A16 | Change package: delta, impact report, required live allocations, forbidden transitions, removal order | hh-aid → OPS | YAML + report | No | Yes |

**Wiring scope (H).** By default A2 should contain the wiring group: Fabric, VLANNamespace, SwitchGroup, Switch, Server, Connection, plus Gateway objects only where the design requires gateway connections. VPC, External and peering objects express tenant and service policy that operators usually own as day-1/day-2 work. hh-aid should emit them only on explicit request, labelled "service intent, operator-owned". The R04 same-Fabric rules (VPC attachment leaves must carry all of the VPC's domains, peered VPCs must share a domain, no cross-domain external transit, no gateway or external on shared leaves) still constrain the *topology*. hh-aid must check them whenever planes map to domains, even if it emits no VPCs (R04 T09, N13). Gateway-bearing bundles carry the R03 G2 label "not admission-checked".

## 6. Identity, revision, naming and provenance

### 6.1 Stable identities (H)

| Entity | Identity | Why |
| --- | --- | --- |
| Project | UUID | Never derived from a customer name |
| Design revision | Monotonic integer N plus the content hash of A1 | Approval targets the hash; N is for people |
| Device | Planning ID derived from role/group/plane/rail/slot (R04 §"Partial groups"), mapped to a wiring `metadata.name` | The wiring name must stay stable across regeneration (R01 FM6). ≤62 chars, lowercase RFC 1123, namespace `default` (R02 K01). The ControlNode name is immutable after install (O2). |
| Logical link | `L-<hash(device A, port A, device B, port B)>` plus a human sequence | One per R04 multigraph edge; a Connection can hold several |
| Physical assembly | `X-<seq>` with a leg index (`X-0042.a`, `.b`) | A breakout or shuffle is one assembly with several legs (R05). Never count it as N cables. |
| Lane | `<device>/E1/<cage>/<lane>` | Wiring API name (O6); lane 1 is aliased by the base port (R02 K03) |
| Site binding | Serial / MAC per device ID | Kept outside the design hash (C2) |

Connection names: upstream `GenerateName()` is a convenience, not a uniqueness or length guarantee (R02). hh-aid should compute names itself, check them against the 62-character limit, and keep a planning-ID → name map in A1.

### 6.2 Port and label conventions (H)

- **Switch side:** only API port names (`E1/5`, `E1/5/2`). The NOS name may be printed as a secondary column for site staff (O6).
- **Server side:** wiring port strings are verification expectations (O7). The default proposal is the **LLDP port ID the host will advertise**, usually the OS interface name. If that is unknown at design time, use a stable placeholder (`nic3-p0`) and plan to replace it during site binding (A11). Replacing it changes wiring bytes: treat it like serial/MAC binding (bound package hash, no new design revision). **Q**: whether replacing a Server port string on a live, attached Connection is an allowed update in practice. The immutability check is commented out (O11), but agent and VPC effects are unverified.
- **Cable label (proposal):** line 1 `<link-id> <assembly-id.leg>`, line 2 `A: <rack>-<RU> <device> <port>`, line 3 `B: <rack>-<RU> <device> <port>`. Rail and plane are printed as a tag (`R3 P-A`) so rail mis-mapping is visible on site (R01 FM4). A customer labelling standard overrides the layout but must keep the link and assembly IDs (R01 Q-I4).
- **Device label:** the wiring name plus planning ID. `Switch.description` carries a human placement string (O18), but A6 is authoritative.
- **Breakout:** one label per leg at the split end and one at the parent end. The A7 row records parent cage, mode (`2x400G`) and lane.

### 6.3 Revisions, hashes and provenance (H)

1. **Canonical bytes.** UTF-8, LF line endings, fixed key and object order (R03 shows upstream generation is deterministic; hh-aid needs its own canonical emitter), no timestamps inside hashed content.
2. **Manifest.** `manifest.json` lists every artifact path, its SHA-256, and its role. It also lists the generator version, rule and catalog versions, support-policy version, upstream pins (Fabric, Fabricator, docs), and the synthetic config hash (fixture: [example-package-manifest.json](installation-lifecycle/example-package-manifest.json)). The **design hash** covers A1, A2 (unbound), A5, A6, A7, A8 and A9. The **bound package hash** adds A11 and the bound wiring.
3. **Immutability.** An approved revision is never edited. Any change, including accepting an as-built deviation, creates N+1 with `supersedes: N` and a semantic diff. N stays retrievable together with its approval and acceptance evidence.
4. **In-object provenance (H/Q).** Live wiring export keeps non-fabric annotations (O9). hh-aid could put one *stable* annotation on each object, the planning ID (key namespace to be decided, e.g. `hh-aid.<domain>/id`), so an operator export can be correlated without relying on names. The revision should **not** go into every object: that would change every object on each revision and flood diffs. Before relying on this: annotation text must not contain `{{` (R03 import boundary), and maintainers should confirm annotations are an acceptable, durable place for it (§10 Q-OPS-4).
5. **Receipts.** Every validation or acceptance result names the exact hashes it covers. A result over different bytes is not evidence for this revision.

### 6.4 Desired, applied, installed and observed state

| State | Meaning | System of record | How hh-aid gets it |
| --- | --- | --- | --- |
| Approved design | Intended topology, physical plan and policies at revision N | hh-aid (A1 + approval) | Native |
| Issued / bound package | Bytes handed to OPS, plus site binding | hh-aid (manifest) | Native, plus A11/A12 |
| **Applied desired** | Objects in the controller API, hydrated (ASN, IPs) and possibly operator-edited | Fabric controller | A15 `wiring export` + `kubectl get fabric` (O9 omits Fabric and Gateway) |
| **Installed** | What was physically cabled and inserted | Installer / site (A13), possibly customer DCIM | A13 import |
| **Observed** | What agents see: LLDP neighbors, port oper state, transceivers, BGP/BFD, agent generations | Agents → controller status and metrics | A15 `inspect ... -o json` |

Comparisons hh-aid can make (H):
- approved vs applied → **config drift**, ignoring hydrated fields;
- approved vs installed → **as-built deviation**;
- applied vs observed → **operational fault or cabling error**, detected by upstream's LLDP and BGP strict checks.

hh-aid never treats observed state as the design. It proposes a revision that the designer accepts or rejects.

## 7. Deviations and changes: what each invalidates

Columns:
- **Wiring**: A2 changes.
- **Phys**: the BOM, cable schedule and labels change.
- **Re-approve**: a new design revision needs approval.
- **Acc**: acceptance evidence for the affected rows is invalidated.
- **Upstream constraint**: what the live API allows (O11–O13).

All rows are proposals **H**; the upstream constraints are **F/D**.

| Event | Wiring | Phys | Re-approve | Acc | Upstream constraint / note |
| --- | --- | --- | --- | --- | --- |
| Same-type assembly, different length | No | A5/A7 row | Only if reach or slack policy is violated (R05) | Row | None |
| Different media class (DAC → AOC/optic) | Possibly (FEC/speed) | A5/A7/A8 | Yes if compatibility evidence changes | Row + link health | `portFECs` removal does not reset FEC; it is a last resort ([FB switch_types.go L185-188](https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3/api/wiring/v1beta1/switch_types.go#L185-L188)) |
| Port moved on the same switch, same breakout mode | Connection port | A7/A8/A9 | If it consumes a growth-reserved or locked slot (R04 T07/T12) | Row + LLDP | Connection update with the same type is allowed by the webhook, if `Validate` passes |
| Breakout mode changed | Switch `portBreakouts` + Connections | A5/A7/A9 | Yes | Ports on that cage | **Forbidden on update while RoCE is enabled** (O11). DS5000 may need a reboot or cold boot (O17). |
| Link landed on a different leaf | Connection | A7/A8 | **Yes**: rail/plane/redundancy membership (R04 T03/T04) | Row; rail-domain checks | May cross a domain: VPC attachment rules (O12, R04 T09) |
| Server NIC ports swapped (rail swap) | No, if wiring is unchanged | No | n/a: fix the cabling | LLDP shows `(want pX)` if server port strings are LLDP IDs (§6.2) | Detectable only through O7/O8 |
| Switch RMA, same profile | `boot.serial`/`mac` only (binding) | Device label | No | That switch's full AE4–AE7 | Documented replacement: edit identity, ONIE reinstall (O13) |
| Switch replaced by a different profile | Switch profile, ports, Connections | Many | Yes | Switch and neighbors | Port names and modes may differ; ASN immutable; may need delete/recreate (O11) |
| Add servers to existing leaves (reserved ports) | New Server + Connection | New rows | Yes (growth revision) | New rows | Create only; no hydration needed for these kinds |
| Add leaves/spines in an **already declared** domain | New Switch + Connections | New rows | Yes | New and neighbor rows | **Needs live-allocated ASN, IP, protocol IP and VTEP** (O13). hh-aid emits placeholders marked "operator allocates" and does not invent addresses. Spine ports must have been reserved. |
| Add a domain or plane to a populated Fabric | n/a | n/a | n/a | n/a | **Forbidden** (O12). The alternatives (initial predeclaration, separate Fabric, separately designed migration) are not equivalent (R01 §13.2, R02 addendum). hh-aid lists them; it **does not promise in-place domain migration**. |
| Change a switch's ASN, Fabric or domain | n/a | n/a | n/a | n/a | Forbidden; delete and recreate is not a safe procedure by default (O11, R01 §13.2) |
| Remove a switch | Deletes | Rows | Yes | Neighbor rows | Order: VPC attachments → External attachments → Connections → Switch/Agent (O13); deletes are guarded (O11) |
| Move a rack or device | No | A6/A7 lengths | If a reach limit is crossed | Moved rows | None |
| Upgrade the Hedgehog release | Possibly (schema/defaults) | No | Re-run support contract and U-gate at the new pin | Re-run AE3–AE8 | Re-pin; R02 says not to carry a contract across releases silently. API writes are refused until the controller initializes (O14). |

**Baseline preservation rule (H).** A deviation never edits revision N. The installer records it in A13. hh-aid proposes revision N+1 that reproduces the as-built facts, along with the impact report and a list of hard-constraint violations. Then either:
- the designer and approver accept N+1, and the baseline becomes N+1 with A14 referencing both revisions; or
- the site fixes the cabling, and the A13 row is closed against N.

hh-aid never "accepts" by silently regenerating.

## 8. Dependencies, credentials and ownership boundaries

### 8.1 Hedgehog control, OOB and service dependencies (site-prerequisite checklist A10)

| Item | Owner / attestor | Evidence the attestor supplies | hh-aid role |
| --- | --- | --- | --- |
| OOB management switch(es): exclusive L2, no other DHCP server, a port per switch/gateway management interface, an uplink to the control node (10G recommended) | OPS / site network | Port plan and VLAN; confirmation that no other DHCP server exists | Count and place the management ports and links (R04 S04: external dependency; no `management` Connection variant exists, R02) |
| Control node(s): sized for the switch count; UEFI without Secure Boot; NVMe class; external and management NICs; BMC access; permanent hostname | OPS | Hardware spec; NIC names (from the discovery ISO) | Flag a size tier from the switch count; never hold the BMC credentials |
| Gateway nodes, if any: IOMMU, the specific NIC | OPS | Spec | Count gateway connections |
| Customer external network for control-node SSH/API; TLS SANs | Customer IT | Addressing | None |
| NTP reachability (or an internal source) | Customer IT | Server list | None |
| Artifact delivery: internet or airgap registry | OPS | Method | None |
| Switch ONIE availability; platform and NOS support | OPS + AUTH | Supported-device evidence (R02) | Enforce support policy |
| Observability targets (Loki/Prometheus) | OPS | URLs (sensitive) | None |
| Power, cooling, rack space | Site | Facility sign-off | Out of scope (R01 §8.1) except placement |
| Host OS LLDP agent on servers (needed for AE6 server-link verification) | Server owner | Confirmation that LLDP is enabled, plus the advertised sysName and port IDs | Records them in A11; marks links "unverifiable by LLDP" otherwise |

### 8.2 Credentials and live writes (H)

- hh-aid **never** receives, generates or stores: control-node or switch user password hashes, authorized keys, registry credentials, BMC, PDU or switch credentials, the kubeconfig, the real `fab.yaml`, installer images, or support dumps. All of these are O4 territory and OPS owns them. hh-aid's A4 synthetic config must fail closed if a user or key field is populated.
- hh-aid issues no `kubectl apply`, `hhfab build`, `vlab`, `switch reinstall` or `locate` commands against a live system. It may *print* suggested commands (for example a locate per link for installers, O16) for the operator to run.
- Imports (A15) are files the operator chooses to give. hh-aid rejects or redacts any file containing credential fields, and records only its hash and source.
- Customer topology, serials, IPs and as-built data are sensitive (R01 FM10). The storage and tenancy decision belongs to D05. None of it goes in this repository.

### 8.3 Ownership (refines R01 §8.2, H)

| Concern | hh-aid | Operator (OPS/P4) | Controller / agents | Installer / site | Hedgehog authority |
| --- | --- | --- | --- | --- | --- |
| Design intent, approvals, revisions | **Owns** | Approves changes they request | — | — | Support claims |
| Wiring bytes for initial install | Produces A2 | Binds, validates with real config, builds | — | — | — |
| `fab.yaml`, credentials, images | Never | **Owns** | — | — | — |
| Applied desired state | Reads exports | **Writes** (`kubectl`, `hhfab`) | **Holds** | — | — |
| Observed state | Reads exports | Reads | **Reports** | — | — |
| As-built physical record | Records A13 | Approves deviations | — | **Produces** | — |
| Acceptance | Records A14 | Signs | Supplies evidence | Signs workmanship | Signs if a support claim is involved |
| Change execution, sequencing, downtime | Impact and order proposal | **Owns** | Enforces webhooks | Physical work | Migration safety |

## 9. Installation acceptance evidence

Each check names its evidence source and what it does **not** prove. The commands are documented or source-observed (**F/D**). Using them as an acceptance suite is a proposal (**H**), and was not executed here.

| ID | Check | Evidence (operator-run, captured into A14) | Pass condition (H) | Does not prove |
| --- | --- | --- | --- | --- |
| AE1 | Package integrity | Manifest hashes; A12 wiring hashes | A12 hashes equal the issued bound package | Correctness |
| AE2 | Operator U-gate | A12: `hhfab` version and binary hash, `init -c <real> -w ...`, `validate`, exit 0 | Pass at the pinned release with the real config | R03 G1–G7 |
| AE3 | Control plane up | "Control Node installation complete"; `kubectl get fabriccontrollers -A` Ready; `fab/default` versions match the release notes (O14) | All Ready; versions = pin | Data plane |
| AE4 | Every switch provisioned | `kubectl get agents -o wide`: heartbeat < 1 min, `APPLIEDG == CURRENTG`, software version; `inspect fabric` serials; SwitchBoot last attempt (O5, O15) | Every designed switch present; serials match A11; no extra or unknown devices | Cabling |
| AE5 | Applied = issued | A15 `wiring export` normalized against A2, ignoring hydrated fields (asn, ip, protocolIP, vtepIP) and fabric labels; Fabric and Gateway compared via `kubectl get` (O9) | No unexplained difference | Physical state |
| AE6 | Cabling adjacency | `kubectl fabric inspect lldp --strict -o json` with fabric, server and gateway connections (O8) | Zero strict errors, or each error matched to an accepted A13 deviation or to a documented "host LLDP unavailable" exception | Lane-level correctness of a shuffle or breakout beyond what LLDP reports per port (**Q** for parts); performance |
| AE7 | Link and optic health | `inspect switch --ports/--transceivers/--lasers` per switch | Every designed port up/up at its designed speed; transceiver class and part consistent with the A5 part class; no lane below the vendor threshold (O8) | Long-term BER; reach margin |
| AE8 | Routing adjacency | `inspect bgp --strict`, `inspect bfd --strict` | Zero strict errors | Workload paths, ECMP balance |
| AE9 | Placement and labels | Sampled visual audit (R01 SM6 method): link ID, ends, rail/plane tag, assembly leg | Every sampled link correct; any miss → full audit of that pattern | Unsampled links |
| AE10 | Deviation closure | A13 against A7 | Every row installed, or deviated with a fix or an approved N+1 | — |
| AE11 | Service smoke test (optional, operator-owned) | Operator's VPC attach/ping per plane | Defined by the customer | RoCE performance (R04) |
| AE12 | Failure-behaviour tests (optional) | Controlled link or leaf removal in a maintenance window, only with operator authority | Customer-defined, using R04 failure states | Anything beyond the tested case |

Evidence handling: raw outputs are kept with hashes and the time and source of capture. JSON output shape is not a published stable contract (**Q-OPS-1**), so parsers must be versioned to the pin and fall back to "unknown". VLAB success is not acceptance evidence for a physical site (design-process.md).

## 10. Questions for sponsor relay to the Hedgehog authority (no outreach made)

| ID | Priority | Question | Evidence | Safe handling until answered |
| --- | --- | --- | --- | --- |
| Q-OPS-1 | High | Are `inspect lldp/bgp/bfd --strict` and their `-o json` output meant for scripted installation acceptance? Is the JSON shape stable across releases? | O8 | Use them as captured evidence; version the parsers; treat unknown fields as unknown |
| Q-OPS-2 | High | What is the supported way to compute ASN, IP, protocol IP and VTEP IP for switches added to a live fabric? Docs say increment by hand; can `hhfab` hydrate a delta against live state? | O13 | hh-aid emits placeholders marked "operator allocates" |
| Q-OPS-3 | High | Is `kubectl fabric wiring export` intended as a complete, re-importable snapshot? It omits `Fabric` and the Gateway family at this pin. | O9 | Compare those kinds separately; do not round-trip blindly |
| Q-OPS-4 | Medium | May tools put custom annotations on wiring objects for provenance? Are they preserved through upgrade and export? | O9 | Optional; only a stable planning ID; reject `{{` |
| Q-OPS-5 | High | What is the supported procedure, and the downtime, for changing breakouts on a RoCE-enabled switch, given the update webhook forbids it? | O11, O17 | Classify as "requires operator procedure"; no in-place promise |
| Q-OPS-6 | Medium | Should server port strings equal the host's LLDP port ID? Which host LLDP agents and settings does support expect? Are DPU/BF3 ports expected to advertise separately? | O7, lldp.md L37-50 | Recommend LLDP IDs; allow placeholders until binding |
| Q-OPS-7 | Medium | Is replacing a Server-side port string on an attached Connection safe in a live fabric? | O11 (check commented out) | Treat as a change needing operator validation |
| Q-OPS-8 | Medium | Who is the acceptance authority on customer installs (Hedgehog field, partner, customer)? What does Hedgehog support want in a design handoff for later cases (P5)? | R01 §4 | A14 records named signatories; hh-aid does not decide |
| Q-OPS-9 | Medium | Is a predeclared, initially unused domain an operationally recommended way to keep plane growth open? What are its costs? | O12, R02 addendum | Show it as an option with open risks |
| Q-OPS-10 | Low | When HA control nodes arrive, do installation artifacts or naming change? | O2 "future" | Single-node assumption, labelled |

## 11. Neutral installer and operator question set

These are for real people, relayed by the sponsor. Nothing here has been asked yet. They extend R01 Q-I1–Q-I4 and Q-O1–Q-O3 without repeating them. Ask about past events, not opinions about hh-aid.

**Installers / integrators (P3)**
1. For your most recent fabric install, which documents did you receive, and which did you rebuild yourself before starting? (format, granularity, per rack or per device)
2. How are cable lengths decided on your jobs: from the design, by a site survey, or on the day? What slack policy do you use?
3. When a breakout or multi-leg cable is used, how do you label and record each leg today?
4. When did you last find that a planned port, cable or optic didn't fit? What happened next, and who approved the change?
5. When do you get switch serial numbers and management MACs, and who records them?
6. How do you prove a link is cabled correctly before handover? Do you use LLDP, labels, photos, a scanner, or something else?
7. Which customer labelling or DCIM standards have you had to follow?

**Operators (P4)**
8. In your last expansion or switch replacement, which values did you have to look up or allocate by hand?
9. Who holds the fabric credentials and `fab.yaml`, and where are they kept? Would you hand any of it to a design tool? (Expect "no" and record the reasons.)
10. Which checks do you run after bring-up before you consider the fabric accepted?
11. When the running fabric differs from the design document, which one do you trust, and how do you reconcile them?
12. Have you ever needed to change domains, ASNs or breakouts on a running fabric? What did you do?

## 12. Coordination with t8 / parts (#6)

Posted to #6 as questions, without waiting on full hardware qualification:

1. How should one physical assembly with several legs (breakout or shuffle) be identified for A7/A8: an assembly ID plus leg index, one label per leg?
2. Which reach and length rules (slack, bend, pathway factor) can R05 state, and which inputs does it need from placement (A6)?
3. Which transceiver fields from `inspect switch --transceivers` (class, connector, vendor, part, serial, CMIS) can be compared with BOM part classes in AE7? Which mismatches are acceptable substitutions?
4. Per-lane verification of a shuffle or breakout: LLDP reports per logical port. Is that enough to prove the lane mapping, or does a shuffle need a separate physical test?
5. Any optics or assemblies where breakout before insertion is a known problem (O17) that the installation sequence should avoid?

## 13. Assumptions and limitations

- **No execution.** Nothing in this report was run: no `hhfab`, `kubectl`, VLAB or hardware. Command behavior is taken from pinned source and docs. The acceptance suite is unexecuted.
- **No human evidence.** No interviews or measurements. Every actor, artifact and gate is a proposal (**H**).
- Docs are pinned at the docs commit, not at a release tag (R02 caveat).
- The `wiring export` contents are a source reading of one function. Whether `kubectl fabric` is the binary actually shipped at this pin is inferred from the installed tooling list ([install.md L140](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/install-upgrade/install.md#L140)) **I**.
- Migration sequencing, rollback, and live-traffic impact of any change were not designed. They stay with the operator and authority (R01 §13.2).
- These are bounded findings, not an exhaustive operational procedure.

## 14. Acceptance criteria mapping (#7)

| Criterion | Evidence in this document | Status |
| --- | --- | --- |
| Journey with actors and handoffs | §4.1 (J1–J10), §4.2 (C1–C6) | Drafted |
| Artifacts, stable identities, revision/checksum, port naming, provenance; desired/installed/observed | §5, §6.1–6.4, fixtures | Drafted |
| Acceptance evidence; deviations invalidate and regenerate while preserving baselines | §7, §9 | Drafted |
| Operator/installer questions; boundaries for live writes, secrets, credentials, ownership | §8, §10, §11 | Drafted; interviews not held |
| Facts / hypotheses / inferred intent / open questions; versions; reproducible evidence | Labels throughout, §3, §15 | Drafted |
| Independent review and sponsor/domain decisions | Pending: t2 / scout, t4 / bridge; sponsor decisions in the handoff | **Not met yet** |

## 15. Reproduction

```sh
# Pinned sources (read-only)
for r in fabric:4bde50829fd7cfebac69332982abd1dee504a8a3 \
         fabricator:d2316aca666eb278541276a11a5f8dae372bf629 \
         docs:1be68948e177dcc031e91659ab5293ba19893ccf; do
  n=${r%%:*}; s=${r##*:}
  git init -q "$n" && git -C "$n" fetch -q --depth 1 "https://github.com/githedgehog/$n" "$s" \
    && git -C "$n" checkout -q FETCH_HEAD
done
# Key facts
sed -n 72,94p   fabric/pkg/ctrl/switch_wh.go            # O11
sed -n 72,111p  fabric/pkg/ctrl/connection_wh.go        # O11
sed -n 22,96p   fabric/pkg/hhfctl/wiring.go             # O9: no Fabric/Gateway lists
sed -n 41,51p   fabric/pkg/util/apiutil/lldp.go         # O7/O8: name+port match
sed -n 649,659p fabric/api/wiring/v1beta1/switch_types.go  # O13: hydrated fields required
grep -n 'strict' fabric/cmd/hhfctl/main.go              # O8
sed -n 11,108p  docs/docs/user-guide/shrink-expand.md   # O13
```

The fixtures under `installation-lifecycle/` are synthetic, hand-written illustrations. They contain no customer data, do not come from any generator, and carry placeholder hashes.
