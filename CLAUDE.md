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

This is the research/design phase. Role nicknames persist across sessions: lead=t1, scout=t2, compat=t3, bridge=t4, ux=t5, topo=t6, arch=t7. Also established: parts=t8 and ops=t9, with kickoff confirmed in #6 and #7. See docs/agent-assignments.md for the full roster. All important messages to lead must be comments on the assigned GitHub issue. A messenger service relays only an alert; the lead reads the ticket for the actual message. Post decisions, blockers, review findings and final handoffs there, including artifact/PR links. Do not independently spawn agents or assume design choices, hardware specifications, or maintainer intent have been validated. Use your assigned GitHub issue, cite pinned source evidence, and request independent review before completion.

## Confirmed product direction

Initial audience: Hedgehog SEs and possibly selected partner SEs. Deliver a BOM first, then a connection map; both are eventual primary outputs. Optimize design assets for installation on the latest Hedgehog release. Preserve exact revision/evidence versions while enabling release-impact review and revalidation; 26.05 is a research baseline, not a permanent delivery restriction. First BOM readiness and hardware scenario remain undecided. Read docs/product-context.md. New session requested: t10 / model; do not assume it has started.
