# R03: hhfab generation, reuse seams, and maintainer design principles

| | |
| --- | --- |
| Issue | [afewell-hh/hh-aid#4](https://github.com/afewell-hh/hh-aid/issues/4) (R03, milestone M1) |
| Author role | Hedgehog integration and code archaeology specialist (AI agent) |
| Independent reviewer | Upstream compatibility researcher and architecture lead. **Not yet reviewed.** |
| Status | Draft, in review (revision 2). This is a research hypothesis, not an approved decision or an ADR. Option E is a candidate for a bounded spike, not an adopted architecture. |
| Research date | 2026-11-07 |
| Timebox | One focused initial pass, plus one correction pass requested by lead on #4 |

**Revision 2 corrections (lead review on #4):**

1. Validation/admission parity is now treated as documented *intent*. §3.1 defines the exact gate and lists the gaps, including a reproduced case where offline validation accepts an object the CRD schema forbids.
2. Plane and domain wording is reconciled with the pinned public docs and R02 (§6.1). Domains used as planes is **documented**, not a "weak naming signal".
3. The timing section (V7) keeps raw observations and the code-complexity hypothesis separate, and no longer presents an extrapolation as a result.
4. §10 states exactly what was built and what was not, and lists deviations from the upstream build recipe.
5. All-errors validation is described as an unproven proposal, with its constraints (§8.1).

## 1. Question and scope

How does `hhfab vlab gen` turn flags into Hedgehog wiring objects? Which upstream pieces could hh-aid reuse, and at what coupling cost? Where do real GPU-cluster designs (hardware, racks, rails, planes) go beyond what the generator and wiring API express? And what design principles do the maintainers actually document, as opposed to ones we infer?

**In scope:** the Fabricator generation path; the Fabric wiring API, validation, and switch-profile catalog it relies on; one reproducible worked trace; and reuse options.

**Out of scope:** the full support matrix (that is R02, #3), hardware and BOM catalogs (R05, #6), VLAB runtime (`vlab up`), controller and agent behavior on real switches, and any production code.

## 2. Source baseline

| Component | Pin | Commit | Date | Licence |
| --- | --- | --- | --- | --- |
| Fabricator (`hhfab`) | tag `v0.51.4` (latest tag on 2026-11-07) | [`d2316ac`](https://github.com/githedgehog/fabricator/tree/d2316aca666eb278541276a11a5f8dae372bf629) | 2026-11-04 | Apache-2.0 |
| Fabric (pinned by Fabricator `go.mod`: `go.githedgehog.com/fabric v0.144.1`) | tag `v0.144.1` | [`4bde508`](https://github.com/githedgehog/fabric/tree/4bde50829fd7cfebac69332982abd1dee504a8a3) | 2026-11-03 | Apache-2.0 |
| Go toolchain required by both `go.mod` files | `go 1.27.3` | | | |
| Product docs source (same pin as R02, #3) | `githedgehog/docs`, release **26.05** (release notes dated 2026-11-05) | [`1be6894`](https://github.com/githedgehog/docs/tree/1be68948e177dcc031e91659ab5293ba19893ccf) | 2026-11-05 | |
| Product docs site (revision 1 only) | [Build Wiring Diagram](https://docs.hedgehog.cloud/latest/install-upgrade/build-wiring/), fetched 2026-11-07, unpinned | | | |

Revision 1 cited the rendered docs site, which states no release number. Revision 2 cites the docs source repository at the commit R02 uses, with prefix `DOCS` = `https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf`. R02 maps release 26.05 to Fabricator `v0.51.4` / Fabric `v0.144.1`. Lead adopted this pair as the **working research baseline**, which is not an approval of a product support window.

Fabric `main` had already moved to `v0.145.0` (`9864717`). Every conclusion below is for the compatible pair above. Permalink prefixes used in this document:

- `FZ` = `https://github.com/githedgehog/fabricator/blob/d2316aca666eb278541276a11a5f8dae372bf629`
- `FB` = `https://github.com/githedgehog/fabric/blob/4bde50829fd7cfebac69332982abd1dee504a8a3`

**Evidence labels:**

- **[F]** observed fact, either code read at the pin or a command run in this pass.
- **[D]** documented maintainer statement.
- **[I]** inference by this author.
- **[Q]** open question.

## 3. Generation call graph

```text
hhfab vlab generate|gen  [cmd/hhfab/main.go:1148]
  flags → VLABBuilderDefault{...}  (flag values narrowed to uint8 at main.go:1180-1211)
hhfab vlab generate-gpu-rail|gen-gpu-rail  [main.go:1222; hidden unless HHFAB_PREVIEW=true, main.go:174]
  flags → VLABBuilderGPURail{ScalableUnits, VPCs, ServersPerVPCPerUnit, P2P}
        │
        ▼
hhfab.VLABGenerate(ctx, workDir, cacheDir, builder, "vlab.generated.yaml")   [pkg/hhfab/cmdvlab.go:24]
  ├─ load(..., wiringAndHydration=false, HydrateModeNever)  # reads fab.yaml only: Fabricator, control and fab nodes
  ├─ includeL := apiutil.NewLoader()        # in-memory controller-runtime *fake* client  [pkg/util/apiutil/loader.go:30]
  ├─ builder.Build(ctx, includeL, cfg.Fab, cfg.Nodes)
  │    ├─ parameter checks and defaults (mode spine-leaf only; virtual switch profiles only; ESLAG groups of 2-4 …)
  │    ├─ createDefaultFabric → wiringapi.DefaultFabricSpec(fabric config)  # ASN ranges, domains
  │    ├─ VLANNamespace "default" 1000-2999; IPv4Namespace "default"
  │    ├─ GatewayGroup and Gateway objects (from fab.yaml nodes with the gateway role)
  │    ├─ SwitchGroups, then leaves (ESLAG groups first, then orphans) with servers attached in creation order
  │    ├─ spines, fabric links, and gateway links (or mesh links)
  │    ├─ Externals and ExternalAttachments; optional extra domain, extra fabric, interconnect
  │    └─ ports: nextSwitchPort() / nextServerPort() sequential counters  [vlabbuilder.go:1304,1323]
  │       names: Connection name = ConnectionSpec.GenerateName()  (Fabric API helper)
  └─ apiutil.PrintInclude(...)  # lists fixed kinds in fixed order, strips status and labels, YAML  [include.go:162,182; printer.go]
     → include/vlab.generated.yaml   (warns if include/ holds other YAML files)

# Generation does NOT hydrate or validate. That happens later, in every load with wiringAndHydration=true:
hhfab validate | build | vlab up → load(..., true, mode) → Config.loadHydrateValidate  [hydrate.go:58]
  ├─ loadWiring: every include/*.yaml → Loader.LoadAddWiring → Default() on each object (mirrors webhooks)
  ├─ ensureHydrated: getHydration (none/partial/full) → hydrate() allocates switch mgmt and protocol IPs,
  │    VTEP IPs, leaf ASNs from Fabric range, spine and gateway ASNs, gateway neighbours  [hydrate.go:242,780]
  ├─ fabricCfg.Init(ExtraValidators{valid.Peering, valid.Connection})
  └─ apiutil.ValidateFabricGateway [include.go:19]
       ├─ register and enforce the built-in SwitchProfile catalog (Fabric pkg/ctrl/switchprofile)
       └─ per kind, in a fixed order: obj.Default(); obj.Validate(ctx, kube, fabricCfg)  # Fabric API methods
```

**Notes on the call graph [F]:**

- Hydration during `validate` runs **in memory only**. The YAML on disk keeps no IPs or ASNs (the file is unchanged and `grep` finds no `ip:` or `asn:`). The docs say the same: IPs and ASNs come from `hhfab build`, not from the wiring file. hh-aid output can therefore be unhydrated wiring, which matches what `hhfab vlab gen` emits.
- Generation is byte-for-byte deterministic for identical inputs. Two runs gave the same SHA-1 (`c3464751cdf9`).
- **Validation error reporting is not stable between runs.** On the same inputs, the first error reported was `E1/49` in one run and `E1/53` in another. Only the first error is returned. The likely cause is map or list iteration order [I]. This matters for hh-aid UX and golden tests.
- Loading is strict: the decoder uses `serializer.EnableStrict` (`FZ/pkg/util/apiutil/scheme.go#L65`), so unknown fields are rejected [F, code read].

### 3.1 What a pinned `hhfab validate` pass proves, and what it does not

**Documented intent [D]:** "Whatever passes hhfab validation has to pass the webhooks too" (`FB/pkg/ctrl/README.md#L11`). This is a design rule maintainers aim for. It is **not** demonstrated parity for every resource and check. The same README documents an exception, and this pass reproduced a schema-level gap.

**Exact gate proposed for hh-aid** (a proposal, not adopted):

> **U-gate (upstream semantic acceptance at pin P).** The unmodified `hhfab` binary for Fabricator release P runs `init -c <fab.yaml> -w <wiring>`, then `validate --hydrate-mode if-not-present`, on hh-aid's unhydrated export, and exits 0.

**A U-gate pass establishes [F, at this pin]:**

- The objects decode strictly into allowed kinds, with RFC 1123 names.
- `Default()` is applied as the webhooks would apply it.
- In-memory hydration succeeds.
- Built-in switch profiles are registered and enforced.
- Every object's `Default()` + `Validate()` passes against the *complete* object set, in `ValidateFabricGateway`'s fixed order of kinds, with both extra validators set.

**A U-gate pass does NOT establish:**

| Gap | Status of evidence | hh-aid consequence |
| --- | --- | --- |
| G1. CRD OpenAPI schema admission. The in-memory fake client does not apply CRD schemas. | **Reproduced offline [F]:** an ESLAG Connection with 1 link passes `hhfab validate`, while the pinned CRD declares `eslag.links` `minItems: 2` (`FB/config/crd/bases/wiring.githedgehog.com_connections.yaml#L145`). Rejection by a real API server is **expected from the schema but not executed** (no cluster). Repro case `parity-eslag-1link`. R02 also notes that the ESLAG code itself allows 1-4 switches. | Validate exports against the pinned CRD schemas separately (proposition 1 in `design-process.md`). |
| G2. Gateway and GatewayPeering create webhooks also build the gateway agent config and run the dataplane validator. | **[D]** the "Known exception" in `FB/pkg/ctrl/README.md#L31-L34`. Webhook code `FB/pkg/ctrl/gateway_wh.go#L57-L68` [F, code read]. | Gateway-bearing exports need extra validation, or must be labelled "not admission-checked" (R02 Q6). |
| G3. Warnings are discarded. `defaultAndValidate` drops `admission.Warnings`. | [F, code read] `FZ/pkg/util/apiutil/include.go#L154`. R02 shows that MCLAG and MCLAG domain return warnings, not errors. | hh-aid must reject unsupported families itself and capture warnings separately. |
| G4. Creation-order dependence. The installer creates objects one by one in a fixed order of kinds (D-2). Offline validation sees the whole set. | [D] intent, plus inference. A `Validate()` that breaks D-2 would pass offline and fail on install. Not tested. | Only an install (VLAB or real) proves it. |
| G5. Update and delete webhooks: immutability of type, Fabric, and domain references, and lifecycle changes. | [F] per R02 (`connection_wh.go`, `fabric_wh.go`). Not exercised here. | The U-gate is a *create-from-scratch* check. Change impact on a live fabric is a separate check. |
| G6. Connection-variant exclusivity (several variant fields set at once). | R02 static finding (R02-K02), **not reproduced** by either agent. | Enforce exclusivity in hh-aid until reproduced or explained. |
| G7. NOS, agent, and controller convergence; hardware or optics support; RoCE or failure behavior; planning intent (rails, racks, BOM). | Out of scope of `Validate()` by design. | Separate checks (R02 propositions 3-4, R04, R05, D04). |

The gate therefore supports the claim "accepted by upstream semantic validation at pin P, excluding G1-G6". It does not support "admissible", "supported", or "deployable".

## 4. VLAB-specific assumptions and scale limits

| # | Observation [F] | Evidence | Impact on hh-aid |
| --- | --- | --- | --- |
| V1 | Only virtual switch profiles are accepted (`vs`, …). `--sp celestica-ds5000` exits with "unsupported default switch profile". | `FZ/pkg/hhfab/vlabbuilder.go#L143`; repro `real-profile` | The generator cannot produce real-hardware wiring. |
| V2 | The VS profile is the S5248F port map with every breakout-capable port removed. That leaves E1/1–E1/48 and no breakouts. | `FB/pkg/ctrl/switchprofile/p_bcm_vs.go#L32` | VLAB cannot exercise breakouts, lane allocation, speeds, or pipelines. |
| V3 | The port allocator is a positional counter: E1/1…48, then steps of 4. When it passes 76 it logs `Too many interfaces` but **keeps going and exits 0**. The allocator knows nothing about the profile, so ports above 48 fail later in validation. | `vlabbuilder.go#L1304-L1321`; repro `unbundled-60`, `gpu-rail-p2p-su4` | There is no profile-aware port allocation to reuse. |
| V4 | Counts are narrowed to `uint8`, and the narrowing is silent. `--unbundled-servers 300` produced 44 unbundled servers per leaf (300 mod 256) with no warning. | `cmd/hhfab/main.go#L1180-L1211`; repro `unbundled-300` (92 servers) | Values are not safe inputs above 255. The CLI is unsuitable as a general-purpose generator. |
| V5 | Fixed VLAB conventions: fake boot MACs; server NIC names `enp2sN`; VLAN 1000-2999; IPv4 `10.0.0.0/16`; hard-coded external IPs and ASNs; NAT pool limit of 9 externals each; `ExtStaticCount ≤ 1`; multiple external connections refused on virtual switches unless `--yes`. | `vlabbuilder.go#L327-L329` and the external section | These are lab topology choices, not deployment rules. hh-aid must not copy them as constraints. |
| V6 | The topology families come from the flags: spine-leaf with 2-4 member ESLAG groups, orphan leaves, mesh (no spines), an optional second domain with shared leaves, an optional second fabric with an interconnect, and gateways. | `vlabbuilder.go#L98-L330` | This is a useful observed sample of *exercised* features. It is not proof of the complete supported set (that is R02). |
| V7 | **Raw observations [F]:** `hhfab validate` wall time, one run each on one Apple Silicon laptop, GPU-rail `--p2p --servers 8` wiring: 291 objects 0.74 s; 575 objects 2.66 s; 859 objects 5.74 s (repro: 6 s for 859). The growth is superlinear over these three points. **Separate code hypothesis [I]:** for each Connection, `Connection.Validate` lists the connections on every endpoint switch, plus all fabric, mesh, and gateway connections for fabric-type links (`FB/api/wiring/v1beta1/connection_types.go#L975-L1000`), through a fake client that copies objects. That points to roughly O(connections × connections per switch) work, but it has not been profiled. **Not measured:** anything at 5k-50k objects. | repro `time-*` and `gpu-rail-p2p-su3`; code read | No conclusion about large-scale behavior yet. Three single runs are not a benchmark, and the earlier ~50 min extrapolation is withdrawn. The release notes say the controller was "validated with up to 500 switches, 60k Connections and 50k VPCAttachments per Hedgehog Fabric deployment" (`DOCS/docs/release-notes/index.md#L24`). That is a documented controller-scale claim, not an offline `hhfab validate` timing; how the two relate is unknown [Q]. Measurement plan: §8, spike item 3. |
| V8 | The GPU-rail builder is a hidden **preview** command, described in its commit as "for demos". It has fixed values: 8 rails, 4 leaves per scalable unit, 2 spines, 4 links per leaf-spine pair, 1 NIC port per rail, rail r → leaf `r % 4`. | `vlabbuilder.go#L1109-L1286`; commit [`8ecacee4`](https://github.com/githedgehog/fabricator/commit/8ecacee4e2d517aadde064e84407b38dcc60b725) | Evidence that maintainers have prototyped rail-optimized wiring. It is not a supported topology rule. |
| V9 | **At this pin, the GPU-rail preview's default output fails upstream validation**: `empty p2p link annotation subnet`. Generation started always writing the annotation (empty without `--p2p`) in [`8abe42e1`](https://github.com/githedgehog/fabricator/commit/8abe42e1) (2026-03-13). Fabric rejects an empty value since [`cb6487b3`](https://github.com/githedgehog/fabric/commit/cb6487b3929f8046571c8f2012c2d27cbdedd442) (Fabric `v0.110.0`). The builder's unit test validates only the `Fabric` object, and CI only runs the default generator. | `vlabbuilder.go#L1253`; `FB/api/vpc/v1beta1/vpcattachment_types.go#L198-L201`; `FZ/pkg/hhfab/vlabbuilder_test.go#L21`; `FZ/.github/workflows/ci.yaml#L113`; repro `gpu-rail` vs `gpu-rail-p2p` | Two lessons. Preview generator code drifts without detection, and hh-aid must validate its output against the pinned upstream validators. Candidate upstream bug report, for the sponsor to relay. |

## 5. Reusable upstream inventory

| Asset | Where | What it offers | Coupling and upgrade notes |
| --- | --- | --- | --- |
| Wiring, VPC, and Gateway Go types plus `Default()` / `Validate()` | Fabric `api/wiring/v1beta1`, `api/vpc/v1beta1`, `api/gateway/v1alpha1`, `api/meta` | Authoritative object model and semantic validation: port allowed by profile, port reuse including breakout aliases (`E1/4` ≡ `E1/4/1`), ESLAG group consistency, domain membership, pipeline port budgets (`switch_types.go#L942`), fabric IP uniqueness | Lives in the single large `go.githedgehog.com/fabric` module (≈157-line `go.mod`: k8s 0.36, controller-runtime 0.24, ygot fork via `replace`). Pulling in the API pulls in the module graph. Requires Go 1.27.3. APIs are `v1beta1` / `v1alpha1`, so they can change. |
| Extra validators | Fabric `api/valid` (`valid.Connection`, `valid.Peering`) | Cross-package checks wired through `FabricConfig.Init` | **[D]** All are mandatory, and `Init` fails without them (`FB/api/valid/README.md`). A new validator needs a matching Fabricator change, so an hh-aid adapter has the same obligation. |
| Switch-profile catalog | Fabric `pkg/ctrl/switchprofile` (16 default + 6 SONiC CLS+ + 1 Cumulus VX profiles) | Port names, NOS names, labels, port groups, speed and breakout modes with lane offsets, pipeline max ports, feature flags (RoCE, ESLAG, MCLAG, L2VNI…), notes such as DS5000 "L3 VPC only" | Defined as Go values, not data. `pkg/gen/profilesref.go` renders `docs/profiles.md` and `docs/supported-devices.md`, which shows a generation seam. **There is no media, transceiver, cable, reach, or power data** (`SwitchProfilePortProfile` holds only speed, breakout, and auto-negotiation fields). |
| CRD OpenAPI schemas | Fabric and Fabricator `config/crd/bases/*.yaml` | Language-neutral structural ("schema-valid") checks | Covers the first of the four propositions in `design-process.md` only, not semantic validation. |
| Naming helpers | `ConnectionSpec.GenerateName()`, `Endpoints()`, `LinkSummary()`, `BasePortName`, `SortPortNames`, `NormalizePortName` | The upstream connection naming convention (`spine-01--fabric--leaf-01`) and port parsing | Small and pure. Easy to mirror, but mirrored copies drift. |
| `apiutil.Loader`, `PrintInclude`, `ValidateFabricGateway` | Fabricator `pkg/util/apiutil` | Multi-document YAML load, allowed-kind filtering, RFC 1123 name checks, defaulting, ordered and clean serialization, the full validation sequence | Under `pkg/` (importable) but not documented as a public library. It depends on Fabricator's module graph. |
| Hydration | Fabricator `pkg/hhfab/hydrate.go` | IP and ASN allocation and checks for partial hydration | Deployment-time concern. hh-aid can leave it to `hhfab build`. |
| VLAB builders | Fabricator `pkg/hhfab/vlabbuilder.go` | Example construction order and object recipes | **Not recommended for reuse** (V1–V5, V8–V9): VLAB-only, `uint8`, positional ports, unexported fields. |
| `hhfab init -c/-w`, `hhfab validate` | Fabricator CLI | Imports and validates a wiring set against a `fab.yaml`, with Go-template rendering at import time | Stable user-facing surface. Single ~95 MB static binary (darwin/arm64 build). Text logs; first error only. |
| `hhfab diagram` (drawio, dot, mermaid) | Fabricator `pkg/hhfab/diagram` | Topology visualization from wiring | Possible handoff artifact. Not evaluated in depth. |

**Licensing [F]:** Both repositories are Apache-2.0 with SPDX headers. Any reuse or vendoring must keep the NOTICE and licence text. Vendored third-party licences were not audited in this pass [Q].

**Maintenance signals [F]:** Both repositories have CODEOWNERS teams (`@githedgehog/fab-core`, `@githedgehog/fabric-core`, `fabric-profiles`, `fab-diagram`, …), release tags roughly weekly, and commits within the last week. A Fabric patch release is bumped into a Fabricator release (for example `v0.51.4` → Fabric `v0.144.1`), so **a Fabricator tag is the natural unit of version compatibility** [I].

**Possible overlap [Q]:** The `githedgehog/ai-cloud-business-planning-playbook` repository ("web tool for AI cloud builders to plan their infrastructure strategy") was found but not inspected. R01 should check whether it overlaps hh-aid's scope.

## 6. Worked trace: simplified input to wiring

**Input:** `hhfab init --dev`, then `HHFAB_PREVIEW=true hhfab vlab gen-gpu-rail --units 1 --p2p`. That gives 1 scalable unit, 2 VPCs, and 2 servers per VPC.

**Fixture:** [`upstream-reuse/fixtures/vlab-gpu-rail-su1-p2p.generated.yaml`](upstream-reuse/fixtures/vlab-gpu-rail-su1-p2p.generated.yaml), which passes `hhfab validate`.

| Step | Code | Output |
| --- | --- | --- |
| 1 | `createDefaultFabric` | `Fabric/default`: leaf ASN range and default domain spine and gateway ASNs |
| 2 | Namespaces | `VLANNamespace/default` 1000-2999; `IPv4Namespace/default` `10.0.0.0/8` |
| 3 | Spine loop (2 spines × 4 leaves × 4 links) | 8 `fabric` Connections. Spine ports E1/1-16; leaf ports E1/1-8 |
| 4 | VPC loop | `vpc-0` `10.0.0.0/13` VLAN 1000; `vpc-1` `10.8.0.0/13` VLAN 1001 |
| 5 | Server loop (4 servers × 8 rails) | 4 `Server` objects with an empty spec, and 32 `unbundled` Connections. For example `server-su00-n00-r0-leaf-su00-r0`: `server-su00-n00/enp2s1` ↔ `leaf-su00-r0/E1/9`. Rails 0 and 4 land on leaf `r0`, rails 1 and 5 on `r1`, and so on. |
| 6 | Attachment loop | 32 `VPCAttachment` objects with `fabric.githedgehog.com/p2p-link: 10.<8·vpc+rail>.<su>.<2n>/31` |
| 7 | Leaf creation (after the servers, so annotations are known) | 4 leaves with `fabric.githedgehog.com/route-summ: vpc-0=10.0.0.0/24,vpc-0=10.4.0.0/24,…` |

Total: 87 objects. Each leaf uses 16 ports: 8 uplinks and 8 server ports.

**What the output does *not* carry [F]:**

- **Rail identity** appears only in the *connection name* (`-r0-`). Even there it is ambiguous: `leaf-su00-r0` is the leaf index and also hosts rail 4.
- **What the wiring API names:** no wiring object or field is a rail, rack, or plane, and non-test Fabric Go code has no identifier for rail, rack, or plane outside control-plane and data-plane wording [F]. The docs do use both words elsewhere: **planes** are documented as a use of domains (§6.1). **"Rail IP"** is a host-side HostBGP concept, a per-interface /32 advertised over one link for RoCE (`DOCS/docs/user-guide/host-settings.md#L150-L160`, `vpcs.md#L227-L232`) [D]. It is configured on the host, not as a wiring object.
- `Server.spec` has only `description`, `profile`, and inspection fields. `ServerProfile` exists, but its own doc comment says it "is currently not used/implemented" (`FB/api/wiring/v1beta1/serverprofile_types.go#L51`). There is no NIC-to-GPU association, NIC model, port speed, or medium on the server side.
- Speed, breakout, FEC, and auto-negotiation live on `Switch.spec` (`portSpeeds`, `portBreakouts`, …) and are validated against the profile. The VS profile has no breakouts, so none of this is exercised in VLAB.
- There are no cable, transceiver, shuffle, or rack-position objects. `PortLocators` and the `PortLocator` feature exist for switch ports only (meaning not investigated [Q]).
- `SwitchTopology.Domains` is a **spine-layer** domain (`switch_types.go#L149`). §6.1 reconciles it with planes and with the sponsor's rail domains.

### 6.1 Upstream domains, planes, and first-hop rail domains (reconciled with R02 and the pinned docs)

Revision 1 called domains-as-planes a "weak signal" from test names. **That was wrong.** The pinned docs document it.

**Documented [D], `DOCS/docs/user-guide/multi-fabric.md` (domain definition L36-L40; immutability L77-L78 and L302-L303; isolation L314-L317) and `DOCS/docs/release-notes/index.md#L19-L23` (26.05):**

- "A **domain** is one spine set within a fabric, with its own spine ASN and gateway ASN … A spine is in exactly one domain; a leaf can be in several". Such leaves are called *shared leaves*.
- Release 26.05: multiple domains "enables multi-plane backends with dedicated spines per plane and shared leaves, e.g. for heterogeneous XPU fabrics".
- The docs motivate planes as scaling GPU-host bandwidth "without moving to a three-tier CLOS topology". Nodes that cannot use separate planes (a single egress, or NICs that cannot be broken out) attach to shared leaves. A host-settings section covers single-cage NICs split into two physical functions for multi-domain fabrics (`host-settings.md#L387-L393`).
- **Isolation mechanism:** "each spine drops EVPN routes whose AS path contains the spine ASN of another domain". "A shared leaf is therefore a place where VPCs of both domains can be attached, never a path between the domains."
- **API-enforced rules** stop the known leak cases: mesh, gateway, external, and static-external connections need a switch in exactly one domain; redundancy groups must share domains; a leaf must be in the domain of every spine it connects to; and VPC attachment and peering domain rules apply. The docs give the reason: "a mistake in a multi-domain topology does not cause an error … The API catches these mistakes when the object is created instead."
- **Immutability, exactly as documented:** "Fabric and domain references can not be changed, and neither can the ASN of a switch. To move an object to another fabric or domain, delete it and create it again." "Like any other fabric, its domains can not be changed once it is created, so after an upgrade, more domains need a new Fabric." Code agrees [F]: Fabric `37b20228` (2026-09-30) and `fabric_wh.go`, per R02.

**What this supports, and what it does not:**

| Claim | Evidence status |
| --- | --- |
| Multi-plane backends as separate domains (dedicated spines per plane, optional shared leaves) are a *documented use* at 26.05 | [D] |
| EVPN routes are kept between domains by spine AS-path filtering, with API rules for known leak paths | [D] mechanism, [F] code per R02. **Not executed** on VLAB or hardware. |
| Full plane isolation (underlay routing, failure independence, capacity separation, shared-leaf hardware and power) | **Not established.** Shared leaves share physical failure exposure and capacity (R02). The docs describe EVPN overlay route separation, not physical or failure isolation [I]. Hardware and NOS combinations that validate multi-domain are R02 Q5. |
| "Adding a plane means rebuilding the fabric" | **Not established as a universal rule.** Documented: a Fabric's domain set and an object's domain references are fixed, and more domains after an upgrade need a *new Fabric*. Not documented here: whether planned spare domains, a second Fabric beside the first, or other staged migrations are acceptable; their cost; and controller or traffic impact. These are open [Q]. |
| An upstream domain is the sponsor's **first-hop rail domain** | **No.** R02 agrees. The sponsor's first-hop domain is a group of servers whose rail NICs share a set of rail leaves. An upstream domain is a spine set. For the sponsor's "two first-hop domains under a common spine layer", common spines imply **one** upstream domain, with the first-hop grouping held only in hh-aid's planning model [I]. A two-domain encoding would give each its own spines, as the VLAB extra-domain builder does (`totalSpines *= 2`) [F]. Maintainers should confirm (§9 Q3). |
| A *rail* maps to any upstream object | **No.** Rails remain hh-aid planning semantics. The host "rail IP" is a HostBGP address, not a rail assignment. |

**Where real designs go beyond generation semantics [I, grounded in the facts above]:**

1. **Hardware:** only the virtual profile is accepted (V1). A real profile needs profile-aware port selection, speed and breakout planning, lane offsets, and pipeline budgets.
2. **Racks and placement:** there is no representation upstream. This must live in hh-aid's planning model and BOM, never in wiring annotations without a maintainer agreement.
3. **Rails:** the rail → leaf mapping exists only as a builder loop. hh-aid must model the GPU↔NIC↔rail↔leaf relationship explicitly and treat Connection names as a derived, cosmetic output.
4. **Planes (B300):** the documented 26.05 mechanism is multiple domains with dedicated spines per plane (§6.1). Whether a specific B300 plane design (NIC split, per-plane leaf sets, shared-leaf use, isolation requirements) is supported on selected hardware is unverified. That belongs to R02, R04, and R05. Separate `Fabric` objects are the documented alternative when networks are not cabled to each other.
5. **Scale:** `uint8` and the 48-port limits are VLAB-only. Offline validation time beyond about 900 objects is unmeasured (V7).
6. **Physical BOM:** completely outside the wiring API.

## 7. Maintainer intent: documented, observed, and inferred

### Documented [D] (quoted or closely paraphrased from repository or product text)

- D-1. "Whatever passes hhfab validation has to pass the webhooks too, otherwise the installation fails half way. A check that only lives in a webhook isn't run by hhfab and breaks that." Every check belongs in the object's `Validate()`. (`FB/pkg/ctrl/README.md#L7-L24`) **This is a design rule, not proven parity.** The same file documents a Gateway/GatewayPeering exception (L31-L34), and §3.1 lists the gaps (G1-G6).
- D-1b. Multi-plane backends with dedicated spines per plane, and shared leaves, are a documented use of domains. Domain membership and Fabric domain sets are immutable. (`DOCS` multi-fabric and release notes; §6.1)
- D-2. `Validate()` may look up other objects, but must not require objects that the installer creates later or of the same kind. Objects are created one by one in a fixed order of kinds. (same file)
- D-3. Extra validators are mandatory, and a missing one is "never skipped silently". (`FB/api/valid/README.md`)
- D-4. `Default()` "only depends on the object itself and is idempotent". (`FB/pkg/ctrl/README.md`)
- D-5. The switch-profile catalog is "enforced by the Fabric to ensure the consistency of the switch usages and configurations". Adding profiles requires `allowExtraSwitchProfiles: true`. (`FB/pkg/ctrl/switchprofile/README.md`)
- D-6. Only profile-defined port names are valid. NOS names "aren't supported". Starting a wiring diagram "with the switch profiles" is recommended. A Fabric is mandatory. ASNs cannot change after creation. (Build Wiring Diagram docs: the rendered site was read in revision 1; the corresponding source is `DOCS/docs/install-upgrade/build-wiring.md`, whose wording was not re-diffed in revision 2.)
- D-7. The GPU-rail generator is "for demos" and is labelled `[PREVIEW]`. (commit `8ecacee4`; `main.go#L1224`)
- D-8. `ServerProfile` "is currently not used/implemented". (`serverprofile_types.go#L51`)

### Observed conventions [F]

- Names follow RFC 1123 (enforced by the loader). Switches are `leaf-NN`/`spine-NN`, servers `server-NN`. Connection names come from `GenerateName()` as `<a>--<type>--<b>`. Ports are `<device>/E1/<n>[/<lane>]`, and management ports `M…`.
- Serialization uses a fixed order of kinds, with labels stripped (they are derived by `Default()`), status omitted, and each kind preceded by a comment header.
- Hydration-derived values (IPs, ASNs) are kept out of authored wiring, and partial hydration is an error.
- Builders fail fast on inconsistent parameters, with explicit error strings, but only warn on port exhaustion (V3).
- Generation is deterministic. Validation returns the first error only.

### Inferred preferences [I] (hypotheses for maintainers to confirm)

- I-1. The Fabric API objects plus `Default()`/`Validate()` are meant to be the single source of truth. Downstream tools should call them, not re-implement them (strongly suggested by D-1 to D-3).
- I-2. Hardware truth is curated centrally in Go profiles, not supplied by users (D-5).
- I-3. The wiring API intentionally excludes planning, physical, and inventory concerns. hh-aid's richer model is complementary, not a competing schema.
- I-4. VLAB generators are test and demo scaffolding, not a planning engine (D-7, V1–V5).

**Do not cite I-1 to I-4 as Hedgehog positions.**

## 8. Reuse alternatives

| Option | Description | Strengths | Weaknesses |
| --- | --- | --- | --- |
| A. Wrap the CLI | hh-aid emits wiring YAML plus a minimal `fab.yaml`, then runs a pinned `hhfab` binary: `init -c fab.yaml -w wiring.yaml` and `validate` | The same offline path the installer's tooling runs (D-1, with the §3.1 gaps). Language-neutral. Versioned by binary. No Go dependency in hh-aid. | First error only, text output, unstable error order. ~95 MB per supported version. Process start per call. Superlinear in three small runs, large-scale behavior unmeasured (V7). Needs a `fab.yaml` hh-aid must synthesize. Does not cover G1-G6. |
| B. Import Go libraries | hh-aid (or a component of it) imports Fabric API, `switchprofile`, `valid`, and optionally Fabricator `apiutil` | Structured errors; can collect all errors; profile catalog available directly; faster iteration | Ties that component to Go 1.27.x and to Fabric's whole module graph. Breaks on `v1beta1` changes. Fabricator internals are not a promised library API. |
| C. Adapt the VLAB builders | Fork or extend `VLABBuilder*` | Ready-made object recipes | VLAB-only assumptions (V1–V5), demo status (D-7), observed drift (V9). **Reject.** |
| D. Independent re-implementation | hh-aid ports the rules and catalog into its own language | Full control and speed at scale | Silent divergence from upstream semantics (the R02 risk). Still needs an upstream oracle to prove it. |
| **E. Versioned adapter (candidate for a bounded spike)** | hh-aid's own planning model (rails, planes, racks, media, provenance) → a per-Fabricator-release **emitter** that writes unhydrated wiring YAML → the **U-gate** (§3.1: unmodified pinned `hhfab validate`) as the verdict, plus separate CRD-schema, warning, and unsupported-family checks for G1-G3. Optionally, a versioned Go **catalog exporter** (profiles as data), and a **diagnostics shim** that reports more findings than the first error. The shim is advisory only (§8.1). | Keeps planning semantics out of upstream schemas. The verdict comes from unmodified upstream code. Version boundaries are explicit. Catalog data comes from code rather than hand transcription. Allows differential testing of hh-aid's own fast checks against upstream. | Several artifacts to maintain per supported release. The shim inherits Go and module coupling, and duplicates upstream's validation sequence, which can drift. Performance at scale is unmeasured. Not adopted. |

### 8.1 All-errors diagnostics: proposal and constraints

Revision 1 called this a "thin" shim that returns *all* findings. That overstated it. What the pinned code allows [F, code read]:

- **Within one object**, `Validate()` returns its first error and stops. Without changing upstream, a shim can get **at most one error per object**, not all errors.
- **Across objects**, `ValidateFabricGateway` stops at the first failing object, in a fixed order of kinds. Those kinds are profiles, Fabric, namespaces, groups, switches, servers, connections, server profiles, IPv4 namespaces, VPCs, attachments, peerings, externals, then the gateway kinds (`FZ/pkg/util/apiutil/include.go#L19-L147`). A shim could continue past failures, but:
  - later objects are validated against a set that contains invalid earlier objects, so findings can **cascade** (one bad switch yields many connection errors) or be **masked**;
  - hydration, profile registration, and `FabricConfig.Init` happen *before* any object check, so a failure there still blocks everything;
  - `Default()` is applied to list copies during validation and is not persisted. The shim must reproduce that exactly.
- **Equivalence:** if the shim calls the same functions on the same snapshot in the same order, "zero findings" should match an upstream pass [I]. This holds only while the shim's copied sequence matches the pinned release, and it must be **tested differentially** against the U-gate on every supported release, using positive and negative fixtures. Upstream's first-error choice is not stable between runs (§3), so golden tests must compare the *set* of failing objects, not message order.

**Proposed rule:** the U-gate verdict stays authoritative. Shim output is labelled advisory diagnostics, with cascades marked "may be a consequence of an earlier finding". If the diagnostics and the gate ever disagree, the gate wins and the shim is treated as broken for that release.

**Recommendation (for review, not a decision):**

- Use **E** as the scope of a *bounded spike*, not as adopted architecture. Lead has asked that the larger benchmark and shim spike wait until this review closes.
- Treat a U-gate pass as "accepted by upstream semantic validation at pin P, excluding G1-G6" (proposition 2 in `design-process.md`). It is necessary, not sufficient, for schema admission, hardware support, or performance.
- Do not reuse the VLAB builders.
- Do not encode rails, first-hop domains, or racks into wiring annotations without maintainer agreement. Encode planes as domains only after R02, R04, and R05 confirm support for the specific scenario.
- Candidate spike scope, once the review closes:
  1. Export the profile catalog as JSON at `v0.144.1`.
  2. Round-trip the fixtures through a minimal emitter and the U-gate. Add a CRD-schema check, and turn the `parity-eslag-1link` case into a regression fixture.
  3. **Measurement plan:** run `hhfab validate` at about 1k, 5k, 20k, and 50k objects, with at least 5 runs each. Record the machine, Go version, and object mix (connection-heavy versus attachment-heavy), and profile CPU to test the V7 code hypothesis. Report measured medians only; no extrapolated figures.
  4. A per-object diagnostics prototype under §8.1's equivalence test.

**Revisit triggers:** maintainers publish a stable library or structured validation API; Fabric gains rail or server-profile semantics, or changes domain mutability; upstream closes the G1-G3 gaps; large-scale measurements contradict the gate's use; or the product decides on a non-Go stack where even a shim is unacceptable.

## 9. Questions for maintainers (for the sponsor to relay)

Each question comes with a minimal example from this directory.

1. **Supported library surface:** Is importing `go.githedgehog.com/fabric/api/...` together with `Default()`/`Validate()`, `api/valid`, and `pkg/ctrl/switchprofile` an acceptable external dependency? Or is `hhfab validate` the only supported contract? Is there a plan for structured (JSON, all-errors) validation output?
2. **Planes and isolation:** 26.05 documents multi-plane backends as domains with dedicated spines and shared leaves. Beyond EVPN route filtering, what isolation is intended: underlay routes, failure independence, shared-leaf capacity? Which switch and NOS combinations have been validated with multiple domains? Is there an intended home for rail identity, or should it stay outside wiring?
3. **First-hop rail domains under common spines:** We read this as one upstream domain, with the first-hop grouping kept outside wiring. Is that correct? What limits apply (number of domains, shared leaves, spines per domain)?
3b. **Adding planes later:** A Fabric's domain set is immutable, and the docs say more domains after an upgrade need a new Fabric. Which migration patterns are supported or recommended: pre-declared spare domains, a second Fabric, or others?
4. **ServerProfile:** Is the unimplemented `ServerProfile` (NICs and ports) planned? Should hh-aid wait for it or ignore it?
5. **Scale:** The 26.05 notes cite controller validation at 500 switches, 60k Connections, and 50k VPCAttachments. How long does offline `hhfab validate` take at that size, and is the per-connection lookup cost known (V7)?
5b. **Parity gaps:** Are CRD schema rules that `Validate()` does not repeat (example: 1-link ESLAG, G1) and discarded warnings (G3) known and accepted gaps in the hhfab-equals-webhook rule?
6. **GPU-rail preview (V9):** Is the default (`--p2p` off) failure a known regression from `8abe42e1`? Is the 8-rail / 4-leaf / `r % 4` layout a reference design or only a demo?
7. **Profile data:** Is there, or will there be, a machine-readable export of the switch-profile catalog per release, and an authoritative source for supported optics or cables?

## 10. Limitations

- **What was built [F]:** one restricted `hhfab` CLI binary for the host (darwin/arm64), compiled with `go build ./cmd/hhfab` from tag `v0.51.4`. Revision 1's issue comment said "no build ran". That was imprecise: no *upstream build target* ran, but this CLI binary was compiled. Deviations from the pinned upstream recipe (`FZ/justfile` targets `hhfab-build` and `build`):
  - **Placeholder embeds.** The embedded artifacts are empty files created as in the justfile's `_touch_embed` (`hhfab-recipe.gz`, `flatcaroem/oem.cpio.gz`, `hhfab-flatcar-install`). `_hhfab_embed` was skipped, so no Linux recipe binary, Flatcar OEM image, or butane config was built. The binary is therefore expected to be unusable for `hhfab build`, installer media, and `vlab up` [I, not tried].
  - **Skipped prerequisites.** `_license_headers`, `_gotools`, `_kube_gen` (controller-gen object/CRD/RBAC generation) and `gen` were not run. The binary relies on the generated code committed at the tag.
  - **Flags.** The same build tags were used (`containers_image_openpgp,containers_image_storage_stub,containers_image_docker_daemon_stub`) with `CGO_ENABLED=0`. The `-w -s` strip flags were omitted, and the version was set to `v0.51.4-local` instead of the justfile's `git describe` value.
  - **Toolchain.** Go `1.27.3` auto-downloaded through `GOTOOLCHAIN`, with module dependencies from the committed `vendor/`.
- **What ran:** `init --dev`, `vlab gen`, `vlab gen-gpu-rail` (preview), `validate`, the negative and scale cases, and one parity probe (`parity-eslag-1link`). Validation timings are single runs on one laptop, not a benchmark.
- **Not run:**
  - Upstream build targets (`just build`, `just hhfab-build`, `just all`), `just gen`, `just lint`, and `just test` in either repository.
  - `hhfab build` (installer build), `hhfab vlab up`, a Kubernetes API server or CRD admission, webhooks, VLAB, and real switches or hardware.
  - Real-hardware profiles in a wiring file, breakouts, and pipeline limits. The relevant code was read but not run.
  - Fabric PR review discussions. Only commit messages and in-repo READMEs were examined.
  - Licence audit of vendored dependencies.
- The design-principle inferences come from code and READMEs, not from conversations with maintainers. No maintainer was contacted.

## 11. Reproduce

```sh
docs/research/upstream-reuse/repro.sh "$(mktemp -d)"
```

The script needs git, a Go toolchain that can auto-download `go1.27.3`, and network access. It does **not** need Docker, zot, a GitHub token, or KVM. The recorded output is in [`upstream-reuse/repro-output.txt`](upstream-reuse/repro-output.txt). The script builds a **restricted** CLI binary with placeholder embeds (§10), not an upstream release build. Revision 2 adds the `parity-eslag-1link` case: the default wiring with one link removed from an ESLAG connection, which offline `validate` accepts (G1).

Fixtures are synthetic VLAB data, not customer data:

- [`fixtures/vlab-default.generated.yaml`](upstream-reuse/fixtures/vlab-default.generated.yaml): `hhfab vlab gen` defaults, 28 objects.
- [`fixtures/vlab-gpu-rail-su1-p2p.generated.yaml`](upstream-reuse/fixtures/vlab-gpu-rail-su1-p2p.generated.yaml): the section 6 trace, 87 objects.

## 12. Acceptance-criteria mapping (for the reviewer)

| Criterion | Evidence |
| --- | --- |
| Pin versions; map the call graph; VLAB assumptions and scale limits | §2, §3, §4 |
| Inventory reusable APIs, profiles, validators, naming, and export helpers, with dependency, licence, maintenance, and upgrade implications | §5 |
| Small worked trace; where hardware, racks, rails, and planes exceed generation semantics | §6, fixtures, repro |
| Separate documented intent, observed conventions, and inferred preferences; questions; recommendation with alternatives | §7, §8, §9 |
| Separate facts, hypotheses, inferred intent, and open questions; source versions; reproducible evidence | Labels [F]/[D]/[I]/[Q]; §2; §11 |
| Independent reviewer disposition; sponsor and domain decisions | **Pending.** Reviewers: compat (support and validator claims) and arch (integration). Lead review on #4 has been addressed in revision 2 (§1 header). Decisions remain with lead and sponsor: the scope of a bounded option-E spike once the review closes, and whether to relay the §9 questions, the V9 report, and the G1 report. |
