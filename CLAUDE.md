# hh-aid project context for Claude

Read and follow [AGENTS.md](AGENTS.md), which is the canonical agent instruction file for this repository, followed by [product context](docs/product-context.md), [design process](docs/design-process.md), and [agent assignments](docs/agent-assignments.md).

Hedgehog makes Ethernet fabric controller software. hh-aid will help engineers progressively design and verify GPU-cluster fabrics, produce accurate Hedgehog wiring objects and bills of materials, and carry designs through installation and lifecycle handoff.

- Hedgehog website: https://hedgehog.cloud
- Source organization: https://github.com/githedgehog
- Main Fabric source and wiring API: https://github.com/githedgehog/fabric
- `hhfab`, VLAB, and `hhfab vlab gen`: https://github.com/githedgehog/fabricator
- Product docs: https://docs.hedgehog.cloud
- hh-aid repository: https://github.com/afewell-hh/hh-aid

Support exactly Hedgehog-supported topologies, with explicit version boundaries. NVIDIA/Spectrum-X-like examples are context, not the support authority. Server objects represent any non-switch Ethernet endpoint. Planning must account for rails, planes, domains, redundancy, placement, breakouts, media, component counts, and incomplete inputs; a port-count calculator alone is insufficient.

The bounded BOM-first experiment is ready for implementation: existing t7 / arch owns #14 and t8 / parts owns independent #15 verification. Read docs/first-bom-build.md and docs/design/inception-outcome.md. The local TypeScript/React architecture is accepted for this experiment only, not production. Role nicknames persist across sessions: lead=t1, scout=t2, compat=t3, bridge=t4, ux=t5, topo=t6, arch=t7. Also established: parts=t8 and ops=t9, with kickoff confirmed in #6 and #7. See docs/agent-assignments.md for the full roster. All important messages to lead must be comments on the assigned GitHub issue. A messenger service relays only an alert; the lead reads the ticket for the actual message. Post decisions, blockers, review findings and final handoffs there, including artifact/PR links. Do not independently spawn agents or assume design choices, hardware specifications, or maintainer intent have been validated. Use your assigned GitHub issue, cite pinned source evidence, and request independent review before completion.

## Confirmed product direction

Latest screen feedback: preserve F2; introduce planning-only port allocation groups within leaf destinations, simplify F5b, use expandable top-level BOM rows and a compact connection-class review table with both ends' key media attributes and edit shortcuts. Manual engineering inspection is the initial priority; full automated compatibility checking is not required. See docs/product-context.md for selector, breakout, binding and counting distinctions.

Sponsor update 2026-11-08: use servers for all non-switch devices; start with server classes and full customizable multi-network profiles, nested NICs/DPUs/ports and arbitrary per-unit BOM items. Replace the scalar links-per-endpoint product abstraction. Consider in-context fabric/leaf-class creation and source-derived/manual switch models with explicit support status. Include transceivers and DAC/AEC/AOC assemblies; external structured/fiber cabling specification is outside scope. Read the dated section in docs/product-context.md; the interaction style remains open for design evaluation.

Initial audience: Hedgehog SEs and possibly selected partner SEs. Deliver a BOM first, then a connection map; both are eventual primary outputs. Optimize design assets for installation on the latest Hedgehog release. Preserve exact revision/evidence versions while enabling release-impact review and revalidation; 26.05 is a research baseline, not a permanent delivery restriction. The first experiment produces a conditional BOM using generic FB-01 fixtures; production readiness and qualified hardware remain undecided. Read docs/product-context.md. Also established: t10 / model, with kickoff confirmed in #8.

Sponsor walkthrough feedback: B200 is one scenario, not the product template. Use a minimal starter flow only if needed, then a persistent questionnaire/details panel supporting repeated partial input, asset generation, later refinement and regeneration. No full-questionnaire completion requirement. See docs/product-context.md.

Further sponsor direction: research effective minimum-input elicitation; do not bundle server count and rail policy in one radio option. Retain the example-entry categories as overlapping views of one starter-design library. Use placeholders now, then create reusable starters with the same from-scratch authoring tools. Independent questions and library browsing are distinct concerns.
