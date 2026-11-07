# hh-aid

Progressive topology planning, verification, wiring generation, and component accounting for Hedgehog Ethernet fabrics.

This repository is in discovery and application design. The intended journey spans early GPU-cluster exploration through installation and lifecycle handoff. The eventual scope is exactly the topology families supported by the selected Hedgehog Fabric versions; the first delivery slice will be chosen from reviewed evidence.

## Start here

- [Project context and topology scenarios](docs/product-context.md)
- [Discovery process, stage gates, and working agreements](docs/design-process.md)
- [Specialist roles and copyable assignments](docs/agent-assignments.md)
- [Agent instructions](AGENTS.md) and [Claude entry point](CLAUDE.md)
- [GitHub Project](https://github.com/users/afewell-hh/projects/6), [coordination epic](https://github.com/afewell-hh/hh-aid/issues/1), and [milestones](https://github.com/afewell-hh/hh-aid/milestones)

## Hedgehog sources

[Hedgehog](https://hedgehog.cloud) builds Ethernet fabric software. [githedgehog/fabric](https://github.com/githedgehog/fabric) contains the core APIs/controller and [githedgehog/fabricator](https://github.com/githedgehog/fabricator) contains hhfab and VLAB tooling. See the [organization](https://github.com/githedgehog) and [official documentation](https://docs.hedgehog.cloud).

No application stack or build/test commands have been selected yet. Research and design artifacts will establish those choices before production implementation.
