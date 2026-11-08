# hh-aid agent instructions

## Purpose and organization

Hedgehog builds Ethernet fabric controller software for GPU clusters and other Ethernet endpoints. hh-aid is a new application for progressively designing, calculating, verifying, and preparing Hedgehog-supported fabrics, from early exploration through installation and handoff to lifecycle management.

- Company: https://hedgehog.cloud
- GitHub organization: https://github.com/githedgehog
- Core controller, wiring APIs, validation, switch profiles: https://github.com/githedgehog/fabric
- Fabric installation tooling and `hhfab vlab gen`: https://github.com/githedgehog/fabricator
- Documentation: https://docs.hedgehog.cloud (Fabric also references https://docs.githedgehog.com)
- This application: https://github.com/afewell-hh/hh-aid

Read `docs/product-context.md`, `docs/design-process.md`, and `docs/agent-assignments.md` before starting an assignment. GitHub issues are the work and acceptance record; repository documents hold durable evidence and decisions.

## Scope and correctness

The eventual topology scope is exactly the topologies supported by Hedgehog Fabric: no more and no less. Establish a versioned, evidence-backed capability matrix; an initial delivery slice may cover a subset but must disclose it. Schema representability alone does not prove controller, NOS, hardware, or deployment support.

The wiring diagram includes Server (any non-switch Ethernet endpoint), Switch, and Connection objects, plus whatever associated resources the selected Hedgehog version requires. Do not assume these three kinds alone suffice. Planning intent also contains inputs the wiring API may not encode: rack placement, rails, planes, growth, physical components, preferences, and unknowns.

Treat the sponsor's B200, B300, NVL72, switch, and cabling examples as design scenarios, not verified product specifications or blanket statements of Hedgehog support. Spectrum-X reference architectures inform terminology and scenarios; they do not define hh-aid support. Do not restrict the application to NVIDIA devices.

Preserve rails, first-hop rail domains, planes, redundancy/failure domains, rack constraints, breakout parent/lane allocation, and physical link compatibility explicitly. Port totals alone are insufficient. Distinguish raw bandwidth balance from proven nonblocking behavior. Count cable assemblies and transceivers without duplication.

Incomplete plans must remain useful but visibly provisional. Never silently invent an answer, erase a user override, or label an unverified plan deployable. Regeneration must be deterministic, explainable, and traceable to versioned inputs, rules, and catalogs.

## Working practice

Sponsor UX direction: use a short minimum-input starter only if needed, then a persistent editable details panel and repeated generate/refine/regenerate workspace. Do not frame the full questionnaire as a wizard to finish or hard-code the product around B200. See docs/product-context.md for the actual walkthrough feedback. Ask independent planning questions rather than a bundled single-choice project classification. Research starter UX before choosing controls. Preserve server/rack/topology discovery categories as views of a shared starter-design library, using placeholders until the same from-scratch authoring tooling can build reusable designs.

Current stage: discovery and application design. No implementation stack, solver, or application architecture is approved yet. Sponsor direction: initial users are Hedgehog SEs and possibly selected partner SEs; deliver BOM first, then connection map. Optimize design assets for latest-release installation. Keep exact per-revision evidence versions for reproducibility, but do not treat old release pins as a permanent installation target. See docs/product-context.md for the decision boundaries. Do not start production implementation merely because a research ticket suggests one.

The coordinator nickname is `lead` (initial session t1). Active specialist aliases: t2 = `scout` (product discovery), t3 = `compat` (Hedgehog support), t4 = `bridge` (upstream reuse), t5 = `ux` (user experience), t6 = `topo` (network topology), t7 = `arch` (integration architecture). Nicknames identify lasting roles, not model instances; replacements inherit the role name and read the issue history. Also established: t8 = `parts` (hardware/BOM) and t9 = `ops` (installation/lifecycle), with kickoff confirmed in #6 and #7. Also established: t10 = `model` (domain modeling), with kickoff confirmed in #8. The complete roster is in `docs/agent-assignments.md`. Every dispatch must name the recipient as `tN / nickname` and explicitly distinguish an existing agent from a new session the sponsor must create. Future role names in the plan do not mean those agents already exist.

The user instantiates specialist agents. A messenger service relays alerts that a GitHub issue has a new message; it is not the record of the message. Put **all important messages to lead in comments on the assigned GitHub issue**: kickoff, material findings, blockers, questions, decisions requested, PR/commit links, review findings, corrections, and final handoff. PR reviews may contain line-level detail, but summarize and link them in the issue. Address comments with `From: nickname` and `To: lead` (or the intended reviewer), and include the action needed. Never leave important information only in terminal/chat output or rely on the sponsor copying it. After posting, the messenger/chat alert can simply say `nickname: #N updated — handoff ready` with a comment link.

When notified, lead reads the corresponding issue comments and linked artifacts; an alert of “done” means ready for review, not automatically accepted. No background polling or notification service is assumed to exist. Lead records responses, decisions and next assignments in issue comments. Do not spawn other agents or contact maintainers on your own. Never impersonate a Hedgehog maintainer or invent interviews, measurements, approvals, or consensus.

For source research, pin repository commit/release and cite paths, symbols, tests, and permanent links. Separate observed behavior, documented support, inferred intent, and open questions. Read upstream contribution/build instructions before running upstream checks; record commands and outcomes accurately. Prefer upstream validators and profiles where suitable; evaluate coupling, licensing, version drift, and missing semantics before recommending reuse.

Use a branch/worktree per assignment when multiple agents work concurrently. Keep edits inside the assignment's artifact paths; coordinate shared changes through the lead. Preserve unrelated local changes. Do not commit customer topology data, credentials, or proprietary documents to this public repository.

Every deliverable needs acceptance-criterion evidence, limitations, unresolved questions, a named independent reviewer, and a short handoff. An author cannot self-approve a design. The sponsor decides product priorities; a real Hedgehog maintainer or designated domain authority confirms disputed support claims. A research hypothesis is not an approval.

## Verification and completion

There is no application build/test suite yet. For documentation, check links, dependencies, terminology, and consistency. For executable spikes, provide reproducible commands, fixtures, expected results, negative cases, and environment limitations. Do not claim tests ran when they did not.

Keep `CLAUDE.md` aligned with this file. Record architectural choices in ADRs only after alternatives and evidence have been reviewed. Follow the workflow and definition of done in `docs/design-process.md`.
