# Release currency: current supported Hedgehog release and bounded delta screen

| Field | Value |
| --- | --- |
| Issue | [#3](https://github.com/afewell-hh/hh-aid/issues/3), assignment [6715064634](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6715064634), consolidated in [6726545894](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6726545894) item 3 |
| Author | t4 / **bridge** (sponsor-reassigned author; not self-approved) |
| Evidence accessed | **2026-11-08**, GitHub REST API (`gh api`) and local clones at the commits below |
| Result | **26.05 is still the current supported release.** Its composition is identical to the R02 research pins. There is no migration and no delta to apply. |

Labels: **F** (read in source or git metadata), **D** (official docs), **I** (inference), **H** (proposal).

## 1. Current supported release composition

**How "current" was determined (D, F).**

The published docs version index, [`versions.json` on the `publish` branch](https://github.com/githedgehog/docs/blob/publish/versions.json), lists `26.05` with alias **`latest`**. The other entries are `dev` (alias `master`) and older releases. That branch is a moving ref; I read it on 2026-11-08 and saw:

```json
{"version": "dev", "aliases": ["master"]}, {"version": "26.05", "aliases": ["latest"]}, {"version": "26.04"}, …
```

The docs branches `release/26.05` and `master` both point to [`1be68948e177dcc031e91659ab5293ba19893ccf`](https://github.com/githedgehog/docs/commit/1be68948e177dcc031e91659ab5293ba19893ccf) (committed 2026-11-05T09:19:56Z, "Update docs from fabricator@v0.51.4"). No `release/26.06` branch exists.

**Bundle.** The bundle is taken from the release notes' own "Software versions" list ([release-notes/index.md L49-60](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/release-notes/index.md#L49-L60), dated November 5, 2026), not by combining tags:

| Component | 26.05 version | Cross-check (F) | Matches R02 pin |
| --- | --- | --- | --- |
| fabricator / `hhfab` | v0.51.4 | GitHub release, non-prerelease, published 2026-11-05T09:19:09Z; tag → `d2316aca666eb278541276a11a5f8dae372bf629` | yes |
| fabric | v0.144.1 | Fabricator v0.51.4 `go.mod` requires `go.githedgehog.com/fabric v0.144.1`; tag → `4bde50829fd7cfebac69332982abd1dee504a8a3` | yes |
| Broadcom SONiC (NOS) | v4.5.2 | Release notes only. The NOS artefact was not inspected (I) | n/a (new field) |
| gateway dataplane / FRR | v0.38.2 / v0.38.2 (FRR 10.7.1, patched) | Release notes only | n/a |
| Flatcar / k3s | v4757.2.3 / v1.36.4-k3s1 | Release notes only | n/a |
| **Switch profiles** | The catalog compiled into fabric v0.144.1 (16 default + gated SONiC+/Cumulus, [fabric-profile-contract.md §4](fabric-profile-contract.md)) | Profiles have no version of their own; the release is the version | yes |
| Upgrade path into 26.05 | from 26.03.x and 26.04.x | [L43](https://github.com/githedgehog/docs/blob/1be68948e177dcc031e91659ab5293ba19893ccf/docs/release-notes/index.md#L43) | — (lifecycle input for R06) |

## 2. Newer component tags that are NOT a supported bundle

| Item | Evidence (F, accessed 2026-11-08) | Status |
| --- | --- | --- |
| fabric **v0.145.0** | Published 2026-11-06T19:01:17Z (`9864717a…`) | **Component tag only.** No Fabricator release depends on it: both Fabricator v0.51.4 and `master` (`fe9167a…`, 2026-11-06) still require fabric v0.144.1. It appears in the docs only on the unmerged auto PR [githedgehog/docs#378](https://github.com/githedgehog/docs/pull/378) "Update docs from fabric@v0.145.0" (branch `pr/auto/fabric-bump`, `faa1f0e…`). |

**Early-warning screen.** This is not a migration and these are not release claims: `git log v0.144.1..v0.145.0` shows changes that would matter *if* a future release carries them.
- **MCLAG removed.** Connections, redundancy type, profile flag and session subnet (`0b0efc2f`, `b9418b58`, `5027e5bd`, `8415ebeb`). hh-aid already treats MCLAG as unsupported (R02), so the expected impact is none, but the rule ID should cite the removal once it is released.
- **Fabric ASNs/domains strictly immutable.** The legacy fill-in exception is gone (`9ee0633a`), and the fabric-config ASNs/BFD are ignored in favour of the Fabric object (`a039d36d`). This affects R06 O12 wording and the config contract (A4 synthetic config).
- **Fields deprecated until 26.05 dropped.** Agent version override, DHCP discover flag, gateway FRR/toolbox refs, boot agent version (`7e37c3cf`). None of these are wiring fields hh-aid emits (I).
- **CRD ASN fields marked int64** (`3e61be15`): a schema-only change.

These are recorded so a release-impact review starts from evidence. They are **not** used for any current design asset.

## 3. Bounded delta screen: researched baseline → current target

The current target equals the researched baseline (26.05, the same three commits), so every row has **no change**. The checked evidence is listed so the no-change result can be audited.

| Area | What could have changed | Checked evidence (same commit on both sides) | Result |
| --- | --- | --- | --- |
| Connection/domain semantics | Variants, `ValidateDomains`, Fabric/domain rules | fabric `4bde508` connection_types.go, fabric_types.go; docs multi-fabric.md | No change. R02 K02–K07 and the new fabric-profile contract §2 apply |
| Switch roles/modes/profile budgets | Roles, profile catalog, breakouts, pipelines, features | fabric `4bde508` switch_types.go, switchprofile catalog | No change. Catalog per contract §4 |
| Validation/config/import contract | `hhfab init/validate`, Fabricator.Validate, import rendering | fabricator `d2316ac` (R03, R06 U4/E1) | No change |
| Operational constraints | Upgrade path, known limitations, webhooks | docs `1be6894`; fabric webhooks | No change (R06 O11–O17) |
| BOM quantities/eligibility | Supported devices list, features | docs supported-devices.md.gen at `1be6894` | No change. 15 documented hardware models |

**Affected report/rule/catalog/fixture IDs:** none. **Minimal rechecks:** none required. When a release other than 26.05 is marked `latest`, rerun §1 and then this table, starting from the §2 early-warning items.

## 4. Proposed requirements (H: for D01/D03/D05, not adopted)

**New-installation target vs installed-fabric lifecycle.** A **new installation** targets the release currently marked `latest`, per sponsor direction. An **installed fabric** stays on its installed release until its operator upgrades; its design assets must keep validating against that release (R06). They are not silently re-targeted.

| ID | Requirement | Source fact it rests on |
| --- | --- | --- |
| RC-1 Current-target discovery | Determine `latest` from the docs version index (`versions.json` alias `latest`), then take the bundle from that release's "Software versions" section. Never from the newest component tags. Record the access time and the commit of each source. | §1, §2 (F/D) |
| RC-2 Immutable evidence snapshot | Per release, snapshot and hash: release-notes composition; Fabric/Fabricator commits; the switch-profile catalog (extracted at the Fabric tag); Supported Devices table; docs commit. A generated revision references a snapshot ID, never "latest". | Profiles are unversioned (contract §4.1) |
| RC-3 Release-impact review | On a new `latest`, diff snapshots: profile content per name; Supported Devices rows; wiring CRD/validation diffs in the contract §2 areas; the hhfab config contract. Then map each diff to affected rule, catalog and fixture IDs. | §2 shows such diffs exist between tags |
| RC-4 Stale/blocked results | Designs generated against a non-latest snapshot show `needs review against <release>` for new-installation outputs. Missing or failed evidence shows `blocked`, never "current". | Sponsor direction (product-context 2026-11-08) |
| RC-5 Regeneration | Revalidating and regenerating against a new snapshot creates design revision N+1 with a semantic diff (R06 §6.4). The old revision and its evidence stay reproducible. | R06 |
| RC-6 Preservation | Regeneration keeps ordered/delivered parts as locked inputs (R06 §6.4 item 5), user overrides and manual switch models. A conflict with a new release (for example a profile change or a removed feature) is raised as a conflict, never silently re-optimised. | R06; contract §5 |
| RC-7 No automatic update | Snapshots are pulled and reviewed deliberately. No background auto-update of catalogs or rules is implied. | Assignment scope |

## 5. Tests and checks run / not run

**Run (2026-11-08):**
- `gh api` reads: Fabricator and Fabric releases, docs branches and commits, `versions.json`, open docs PRs, Fabricator `master` `go.mod`.
- `git log`/`git diff --stat v0.144.1..v0.145.0` on the local fabric clone.

**Not run:** building or running v0.145.0, upgrade tests, NOS/gateway artefact inspection, and maintainer outreach.

The `versions.json` and branch readings are moving refs and were correct at access time only. A reviewer should re-read them.
