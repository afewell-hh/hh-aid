# R03: hhfab generation, reuse seams, and maintainer design principles

| | |
| --- | --- |
| Issue | [afewell-hh/hh-aid#4](https://github.com/afewell-hh/hh-aid/issues/4) (R03, milestone M1) |
| Author role | Hedgehog integration and code archaeology specialist (AI agent) |
| Independent reviewer | Upstream compatibility researcher and architecture lead. **Not yet reviewed.** |
| Status | Draft for review. This is a research hypothesis, not an approved decision or an ADR. |
| Research date | 2026-11-07 |
| Timebox | One focused initial pass, as the issue's working agreement asks |

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
| Product docs | [Build Wiring Diagram](https://docs.hedgehog.cloud/latest/install-upgrade/build-wiring/), fetched 2026-11-07 | | | |

The product docs page does not state a release number, and it showed a "not the latest version" banner even under `/latest/`. Treat the docs evidence as unpinned. R02 should establish how docs versions map to releases.

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

## 4. VLAB-specific assumptions and scale limits

| # | Observation [F] | Evidence | Impact on hh-aid |
| --- | --- | --- | --- |
| V1 | Only virtual switch profiles are accepted (`vs`, …). `--sp celestica-ds5000` exits with "unsupported default switch profile". | `FZ/pkg/hhfab/vlabbuilder.go#L143`; repro `real-profile` | The generator cannot produce real-hardware wiring. |
| V2 | The VS profile is the S5248F port map with every breakout-capable port removed. That leaves E1/1–E1/48 and no breakouts. | `FB/pkg/ctrl/switchprofile/p_bcm_vs.go#L32` | VLAB cannot exercise breakouts, lane allocation, speeds, or pipelines. |
| V3 | The port allocator is a positional counter: E1/1…48, then steps of 4. When it passes 76 it logs `Too many interfaces` but **keeps going and exits 0**. The allocator knows nothing about the profile, so ports above 48 fail later in validation. | `vlabbuilder.go#L1304-L1321`; repro `unbundled-60`, `gpu-rail-p2p-su4` | There is no profile-aware port allocation to reuse. |
| V4 | Counts are narrowed to `uint8`, and the narrowing is silent. `--unbundled-servers 300` produced 44 unbundled servers per leaf (300 mod 256) with no warning. | `cmd/hhfab/main.go#L1180-L1211`; repro `unbundled-300` (92 servers) | Values are not safe inputs above 255. The CLI is unsuitable as a general-purpose generator. |
| V5 | Fixed VLAB conventions: fake boot MACs; server NIC names `enp2sN`; VLAN 1000-2999; IPv4 `10.0.0.0/16`; hard-coded external IPs and ASNs; NAT pool limit of 9 externals each; `ExtStaticCount ≤ 1`; multiple external connections refused on virtual switches unless `--yes`. | `vlabbuilder.go#L327-L329` and the external section | These are lab topology choices, not deployment rules. hh-aid must not copy them as constraints. |
| V6 | The topology families come from the flags: spine-leaf with 2-4 member ESLAG groups, orphan leaves, mesh (no spines), an optional second domain with shared leaves, an optional second fabric with an interconnect, and gateways. | `vlabbuilder.go#L98-L330` | This is a useful observed sample of *exercised* features. It is not proof of the complete supported set (that is R02). |
| V7 | Validation time grows roughly quadratically. Single machine (Apple Silicon laptop), one run each: 291 objects 0.74 s, 575 objects 2.66 s, 859 objects 5.74 s. | repro `gpu-rail-p2p-su3`. Likely cause [I]: `Connection.Validate` lists the other connections on each endpoint switch, plus fake-client copy costs (`FB/api/wiring/v1beta1/connection_types.go#L983`) | Naive extrapolation to ~20k objects is about 50 min [I]. Upstream validation is fine as a final gate but too slow as an interactive oracle at sponsor scale (tens of thousands of links). This needs a real benchmark (D04, D05). |
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
- **What Fabric names:** non-test Fabric Go code has no identifier or comment for rail, rack, or plane, other than control-plane and data-plane wording. **Tests are different.** They name Fabric domains `plane-a`, `plane-b`, and `plane-c` throughout, in about 15 test files (for example `FB/api/vpc/v1beta1/domains_test.go#L75-L150`). Domains are recent: Fabric [`37b20228`](https://github.com/githedgehog/fabric/commit/37b20228) (2026-09-30), "let a fabric have several domains and a switch declare its own". The commit message says a switch's domains are **immutable** ("moving it means deleting and recreating it"), and that the agent only gets the first domain's spine and gateway ASN.
- `Server.spec` has only `description`, `profile`, and inspection fields. `ServerProfile` exists, but its own doc comment says it "is currently not used/implemented" (`FB/api/wiring/v1beta1/serverprofile_types.go#L51`). There is no NIC-to-GPU association, NIC model, port speed, or medium on the server side.
- Speed, breakout, FEC, and auto-negotiation live on `Switch.spec` (`portSpeeds`, `portBreakouts`, …) and are validated against the profile. The VS profile has no breakouts, so none of this is exercised in VLAB.
- There are no cable, transceiver, shuffle, or rack-position objects. `PortLocators` and the `PortLocator` feature exist for switch ports only (meaning not investigated [Q]).
- `SwitchTopology.Domains` is a **spine-layer** domain ("a leaf to several if it uplinks to the spines of several", `switch_types.go#L149`). Two readings are possible:

- **Planes.** The `plane-*` test names suggest maintainers may have isolated spine planes in mind [I, weak; test naming is not documentation].
- **First-hop domains.** It could carry the sponsor's "128-node, two first-hop domains under a common spine". But a domain *is* a spine layer, so "a common spine across domains" may contradict the model. The VLAB extra-domain builder gives each domain its own spines (`totalSpines *= 2`).

Neither reading is the same thing as a *rail*. Which reading is intended, and whether it is supported in deployment, is a question for maintainers [Q].

**Where real designs go beyond generation semantics [I, grounded in the facts above]:**

1. **Hardware:** only the virtual profile is accepted (V1). A real profile needs profile-aware port selection, speed and breakout planning, lane offsets, and pipeline budgets.
2. **Racks and placement:** there is no representation upstream. This must live in hh-aid's planning model and BOM, never in wiring annotations without a maintainer agreement.
3. **Rails:** the rail → leaf mapping exists only as a builder loop. hh-aid must model the GPU↔NIC↔rail↔leaf relationship explicitly and treat Connection names as a derived, cosmetic output.
4. **Planes (B300):** there is no field named "plane". Candidate encodings are separate `Fabric` objects (multi-fabric exists, see V6), multiple domains (suggested by the `plane-*` test naming), or naming only. Each needs maintainer confirmation, and so does deployment support for the recent domain feature.
5. **Scale:** `uint8` and the 48-port limits are VLAB-only, but quadratic validation (V7) affects any upstream-validated output.
6. **Physical BOM:** completely outside the wiring API.

## 7. Maintainer intent: documented, observed, and inferred

### Documented [D] (quoted or closely paraphrased from repository or product text)

- D-1. "Whatever passes hhfab validation has to pass the webhooks too, otherwise the installation fails half way. A check that only lives in a webhook isn't run by hhfab and breaks that." Every check belongs in the object's `Validate()`. (`FB/pkg/ctrl/README.md#L7-L24`)
- D-2. `Validate()` may look up other objects, but must not require objects that the installer creates later or of the same kind. Objects are created one by one in a fixed order of kinds. (same file)
- D-3. Extra validators are mandatory, and a missing one is "never skipped silently". (`FB/api/valid/README.md`)
- D-4. `Default()` "only depends on the object itself and is idempotent". (`FB/pkg/ctrl/README.md`)
- D-5. The switch-profile catalog is "enforced by the Fabric to ensure the consistency of the switch usages and configurations". Adding profiles requires `allowExtraSwitchProfiles: true`. (`FB/pkg/ctrl/switchprofile/README.md`)
- D-6. Only profile-defined port names are valid. NOS names "aren't supported". Starting a wiring diagram "with the switch profiles" is recommended. A Fabric is mandatory. ASNs cannot change after creation. (Build Wiring Diagram docs, unpinned)
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
| A. Wrap the CLI | hh-aid emits wiring YAML plus a minimal `fab.yaml`, then runs a pinned `hhfab` binary: `init -c fab.yaml -w wiring.yaml` and `validate` | Exactly the upstream path the installer uses (D-1). Language-neutral. Versioned by binary. No Go dependency in hh-aid. | First error only, text output, unstable error order. ~95 MB per supported version. Process start per call. Quadratic time (V7). Needs a `fab.yaml` hh-aid must synthesize. |
| B. Import Go libraries | hh-aid (or a component of it) imports Fabric API, `switchprofile`, `valid`, and optionally Fabricator `apiutil` | Structured errors; can collect all errors; profile catalog available directly; faster iteration | Ties that component to Go 1.27.x and to Fabric's whole module graph. Breaks on `v1beta1` changes. Fabricator internals are not a promised library API. |
| C. Adapt the VLAB builders | Fork or extend `VLABBuilder*` | Ready-made object recipes | VLAB-only assumptions (V1–V5), demo status (D-7), observed drift (V9). **Reject.** |
| D. Independent re-implementation | hh-aid ports the rules and catalog into its own language | Full control and speed at scale | Silent divergence from upstream semantics (the R02 risk). Still needs an upstream oracle to prove it. |
| **E. Versioned adapter (recommended hypothesis)** | hh-aid's own planning model (rails, planes, racks, media, provenance) → a per-Fabricator-release **emitter** that writes unhydrated wiring YAML → pinned upstream validation as the release gate (A). Plus a thin, versioned **validator and catalog shim** in Go (B, scoped tightly) that exports profiles as data and returns *all* validation findings as JSON. | Keeps planning semantics out of upstream schemas. Upstream decides deployability. Version boundaries are explicit. Catalog data comes from code rather than hand transcription. Lets hh-aid's own fast checks be compared differentially against upstream. | Two artifacts to maintain per supported release. The shim still inherits the Go and module coupling, but in an isolated component. Performance at scale is still unmeasured. |

**Recommendation (for review, not a decision):**

- Pursue **E**.
- Treat the pinned `hhfab validate` result as the authoritative "accepted by upstream semantic validation" check (proposition 2 in `design-process.md`). It is necessary, but it is not sufficient for hardware support or performance.
- Do not reuse the VLAB builders.
- Do not encode rails, planes, or racks into wiring annotations without maintainer agreement.
- Next spike (S01 or a new assignment):
  1. Export the profile catalog as JSON at `v0.144.1`.
  2. Round-trip the fixtures in this directory through a minimal emitter and `hhfab validate`.
  3. Benchmark validation at 5k, 20k, and 50k objects.
  4. Prototype collecting all errors in the shim.

**Revisit triggers:** maintainers publish a stable library or validation API; Fabric gains rail, plane, or server-profile semantics; validation performance is fixed upstream; or the product decides on a non-Go stack where even a shim is unacceptable.

## 9. Questions for maintainers (for the sponsor to relay)

Each question comes with a minimal example from this directory.

1. **Supported library surface:** Is importing `go.githedgehog.com/fabric/api/...` together with `Default()`/`Validate()`, `api/valid`, and `pkg/ctrl/switchprofile` an acceptable external dependency? Or is `hhfab validate` the only supported contract? Is there a plan for structured (JSON, all-errors) validation output?
2. **Planes and rails:** Fabric tests name domains `plane-a` and `plane-b`. Are Fabric domains the intended way to represent isolated scale-out planes (B300 scenario), or should those be separate `Fabric` objects? Is there an intended home for rail identity, or should it stay outside wiring entirely?
3. **Domains:** A domain is a spine layer. Can it also represent "multiple first-hop domains under a common spine layer", or does that topology need a single domain? Which releases support multi-domain in deployment (not only in the API), and what limits apply (number of domains, shared leaves, spine count)?
4. **ServerProfile:** Is the unimplemented `ServerProfile` (NICs and ports) planned? Should hh-aid wait for it or ignore it?
5. **Scale:** What is the largest wiring set validated or deployed in practice? Is the roughly quadratic `Connection.Validate` cost known (V7)?
6. **GPU-rail preview (V9):** Is the default (`--p2p` off) failure a known regression from `8abe42e1`? Is the 8-rail / 4-leaf / `r % 4` layout a reference design or only a demo?
7. **Profile data:** Is there, or will there be, a machine-readable export of the switch-profile catalog per release, and an authoritative source for supported optics or cables?

## 10. Limitations

- **Tested:**
  - Built `hhfab` locally from `v0.51.4` with placeholder embeds. That is enough for `init`, `gen`, and `validate`, but not for `build` or `vlab up`.
  - Ran `init --dev`, both generators, `validate`, and negative cases on macOS arm64 with Go 1.27.3.
  - Validation timings are single runs on one laptop, not a benchmark.
- **Not tested:**
  - Upstream unit tests (`just test`), linters, `hhfab build`, VLAB, and real switches.
  - Real-hardware profiles in a wiring file, breakouts, and pipeline limits. The relevant code was read but not run.
  - Product-docs version alignment.
  - Fabric PR review discussions. Only commit messages and in-repo READMEs were examined.
  - Licence audit of vendored dependencies.
- The design-principle inferences come from code and READMEs, not from conversations with maintainers. No maintainer was contacted.

## 11. Reproduce

```sh
docs/research/upstream-reuse/repro.sh "$(mktemp -d)"
```

The script needs git, a Go toolchain that can auto-download `go1.27.3`, and network access. It does **not** need Docker, zot, a GitHub token, or KVM. The recorded output is in [`upstream-reuse/repro-output.txt`](upstream-reuse/repro-output.txt).

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
| Independent reviewer disposition; sponsor and domain decisions | **Pending.** Reviewer: upstream compatibility researcher and architecture lead. Sponsor decisions requested: whether option E is the reuse direction to spike, and whether to relay the §9 questions and the V9 bug report. |
