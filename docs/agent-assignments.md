# hh-aid specialist assignments

## Project and dispatch

- [GitHub Project](https://github.com/users/afewell-hh/projects/6)
- [Coordination epic](https://github.com/afewell-hh/hh-aid/issues/1)
- [Milestones](https://github.com/afewell-hh/hh-aid/milestones)

The sponsor creates agent sessions; a messenger service relays short alerts. All important messages and handoffs live in GitHub issue comments, which lead reads when notified. Start with R01, R02, and R03; these establish product priorities, support boundaries, and reuse opportunities. R04, R05, and R06 are also ready and can run concurrently if review capacity permits. All design/spike assignments wait for accepted prerequisite evidence. Do not dispatch the entire backlog at once.

The same agent may fill different roles sequentially, but an artifact's independent reviewer must be a different agent/person from its author. Upstream research agents should prepare by studying pinned code and tests, not by role-playing undocumented maintainer beliefs. Algorithms specialists should prepare in graph constraints/optimization; verification specialists must derive independent expectations. UX/product specialists must distinguish real interviews from hypotheses. Hardware and operations specialists need primary equipment documentation and practical installation evidence.

## Lasting role nicknames

Names belong to roles; an ephemeral replacement resumes the same nickname. Seven sessions are established: t1–t7 below. Next dispatch reserves t8 / parts and t9 / ops for NEW sessions; they are not instantiated until the sponsor starts them. Roles with a dash have not been instantiated; do not send the sponsor instructions as though they already exist. Always address dispatch messages to `tN / nickname` and state explicitly if a new agent session is needed. A role's review assignment may begin before its downstream design ticket is Ready; that does not unlock dependent design work.

| Nickname | Session alias | Purpose | Assignments |
| --- | --- | --- | --- |
| lead | t1 | Coordination, product synthesis and delivery planning | #1, D06, S03 |
| scout | t2 | Product discovery and user needs | R01 |
| compat | t3 | Hedgehog support and compatibility | R02 |
| bridge | t4 | Upstream reuse and integration research | R03 |
| topo | t6 | Network topology and rail/domain constraints | Review R02 (#3); R04 (#5) |
| parts | t8 (new session requested) | Hardware profiles, physical links and BOM | R05 |
| ops | t9 (new session requested) | Installation and lifecycle handoff | R06 |
| model | — | Domain model and progressive input contracts | D01 |
| ux | t5 | User research and interaction design | Review R01 (#2); D02 (#9) |
| solver | — | Allocation and constraint algorithms | D03 |
| check | — | Independent correctness verification | D04, S02 |
| arch | t7 | Application architecture, deployment and security | Review R03 (#4); D05 (#12) |
| spike | — | Bounded executable feasibility work | S01 |

## Issue comment protocol

All important communications go in the assigned issue's comments: kickoff, findings, blockers, questions, decisions requested, PR/commit links, reviews, corrections and handoff. Start with `From: nickname` and `To: lead` or the intended reviewer. Say what action is needed and link exact evidence. Summarize PR review findings in the issue even when detailed inline review lives on the PR.

The messenger service only alerts the recipient. After posting, send `nickname: #N updated — handoff ready` and optionally the comment URL. The sponsor need not paste the message. Lead reads issue comments on notification and posts the response there; no always-running monitor is promised. “Done” alerts never replace recorded acceptance. New sessions read the full issue history before acting. Never post private-source details into this public repository merely because a summary omits names.

## Assignment index

| ID | Issue | Owner role | Reviewer | Depends on |
| --- | --- | --- | --- | --- |
| R01 | [#2](https://github.com/afewell-hh/hh-aid/issues/2) | **scout** — Product discovery lead | UX researcher and sponsor | Ready now |
| R02 | [#3](https://github.com/afewell-hh/hh-aid/issues/3) | **compat** — Hedgehog upstream compatibility researcher | Network topology specialist; sponsor-designated Hedgehog authority for disputed claims | Ready now |
| R03 | [#4](https://github.com/afewell-hh/hh-aid/issues/4) | **bridge** — Hedgehog integration and code archaeology specialist | Upstream compatibility researcher and architecture lead | Ready now |
| R04 | [#5](https://github.com/afewell-hh/hh-aid/issues/5) | **topo** — GPU Ethernet topology architect | Independent verification specialist and upstream compatibility researcher | Ready now |
| R05 | [#6](https://github.com/afewell-hh/hh-aid/issues/6) | **parts** — Hardware connectivity and BOM specialist | Network topology architect and installation specialist | Ready now |
| R06 | [#7](https://github.com/afewell-hh/hh-aid/issues/7) | **ops** — Deployment and fabric operations specialist | Product discovery lead and upstream integration specialist | Ready now |
| D01 | [#8](https://github.com/afewell-hh/hh-aid/issues/8) | **model** — Domain modeling and data architecture specialist | Upstream compatibility researcher, topology architect, and UX designer | R01, R02, R03, R04, R05, R06 |
| D02 | [#9](https://github.com/afewell-hh/hh-aid/issues/9) | **ux** — UX researcher and interaction designer | Product discovery lead, installation specialist, and sponsor | R01, R04, R06 |
| D03 | [#10](https://github.com/afewell-hh/hh-aid/issues/10) | **solver** — Graph algorithms and constraint optimization specialist | Topology architect and independent verification specialist | R02, R03, R04, R05, D01 |
| D04 | [#11](https://github.com/afewell-hh/hh-aid/issues/11) | **check** — Independent verification and test architect | Upstream compatibility researcher and topology architect | R02, R04, R05, D01 |
| D05 | [#12](https://github.com/afewell-hh/hh-aid/issues/12) | **arch** — Application architect with platform and security perspective | Domain modeler, integration specialist, and independent verification specialist | R01, R03, R06, D01 |
| D06 | [#13](https://github.com/afewell-hh/hh-aid/issues/13) | **lead** — Lead coordinator and product strategist | Sponsor plus topology, UX and integration representatives | R01, R02, R03, R04, R05, R06, D01, D02, D03, D04, D05 |
| S01 | [#14](https://github.com/afewell-hh/hh-aid/issues/14) | **spike** — Integration prototyper | Independent verification specialist and upstream compatibility researcher | D03, D04, D05, D06 |
| S02 | [#15](https://github.com/afewell-hh/hh-aid/issues/15) | **check** — Independent verification specialist | Topology architect, hardware specialist, and sponsor | S01 |
| S03 | [#16](https://github.com/afewell-hh/hh-aid/issues/16) | **lead** — Lead coordinator and delivery planner | Sponsor and specialist reviewers | S02, D02, D06 |

## Common kickoff instructions

Give each agent access to this checkout or publish/share the bootstrap files first. Read AGENTS.md, CLAUDE.md, docs/product-context.md and docs/design-process.md. Read the complete assigned issue and accepted prerequisite artifacts. Record role, source baseline, brief approach and artifact paths in the issue. Work on a separate branch/worktree if agents share files. Do not spawn agents or contact maintainers. Post evidence and questions in the assigned issue for independent review. Send only a brief messenger alert after the comment is saved.

## Copyable role assignments

### R01 scout — Product discovery lead

> Act as the Product discovery lead for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/2 as `scout`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/research/product-discovery.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for UX researcher and sponsor. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### R02 compat — Hedgehog upstream compatibility researcher

> Act as the Hedgehog upstream compatibility researcher for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/3 as `compat`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/research/hedgehog-support-contract.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Network topology specialist; sponsor-designated Hedgehog authority for disputed claims. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### R03 bridge — Hedgehog integration and code archaeology specialist

> Act as the Hedgehog integration and code archaeology specialist for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/4 as `bridge`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/research/upstream-reuse.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Upstream compatibility researcher and architecture lead. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### R04 topo — GPU Ethernet topology architect

> Act as the GPU Ethernet topology architect for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/5 as `topo`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/research/topology-scenarios.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Independent verification specialist and upstream compatibility researcher. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### R05 parts — Hardware connectivity and BOM specialist

> Act as the Hardware connectivity and BOM specialist for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/6 as `parts`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/research/hardware-and-bom.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Network topology architect and installation specialist. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### R06 ops — Deployment and fabric operations specialist

> Act as the Deployment and fabric operations specialist for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/7 as `ops`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/research/installation-lifecycle.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Product discovery lead and upstream integration specialist. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### D01 model — Domain modeling and data architecture specialist

> Act as the Domain modeling and data architecture specialist for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/8 as `model`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/design/domain-model.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Upstream compatibility researcher, topology architect, and UX designer. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### D02 ux — UX researcher and interaction designer

> Act as the UX researcher and interaction designer for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/9 as `ux`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/design/experience-design.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Product discovery lead, installation specialist, and sponsor. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### D03 solver — Graph algorithms and constraint optimization specialist

> Act as the Graph algorithms and constraint optimization specialist for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/10 as `solver`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/design/topology-engine.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Topology architect and independent verification specialist. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### D04 check — Independent verification and test architect

> Act as the Independent verification and test architect for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/11 as `check`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/design/verification-strategy.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Upstream compatibility researcher and topology architect. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### D05 arch — Application architect with platform and security perspective

> Act as the Application architect with platform and security perspective for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/12 as `arch`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/design/architecture-options.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Domain modeler, integration specialist, and independent verification specialist. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### D06 lead — Lead coordinator and product strategist

> Act as the Lead coordinator and product strategist for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/13 as `lead`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/design/inception-outcome.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Sponsor plus topology, UX and integration representatives. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### S01 spike — Integration prototyper

> Act as the Integration prototyper for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/14 as `spike`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: spikes/topology-feasibility/README.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Independent verification specialist and upstream compatibility researcher. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### S02 check — Independent verification specialist

> Act as the Independent verification specialist for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/15 as `check`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/design/feasibility-review.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Topology architect, hardware specialist, and sponsor. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

### S03 lead — Lead coordinator and delivery planner

> Act as the Lead coordinator and delivery planner for hh-aid. Read the local AGENTS.md and linked project context, then take https://github.com/afewell-hh/hh-aid/issues/16 as `lead`. Follow its dependency gates, deliverables, and acceptance criteria. Primary artifact: docs/design/delivery-plan.md. Separate verified facts from assumptions and inferred maintainer intent. Return findings, source evidence, artifacts, blockers/questions, and a handoff for Sponsor and specialist reviewers. Post all important messages and the full handoff as issue comments addressed to lead. The messenger service relays only an alert; do not self-approve or close the issue.

## Handoff format

```text
From (nickname) and To:
Issue and action requested:
Branch/PR and artifact paths:
Source releases/commits:
Key findings:
Acceptance criteria with evidence:
Assumptions and unresolved questions:
Decisions requested (with alternatives):
Independent reviewer and review status:
Recommended next assignment:
```

## Review assignment

> Independently review ISSUE_URL and its artifacts against every acceptance criterion. Reproduce important calculations/checks rather than relying on the author's conclusion. Identify unsupported claims, missing cases, and conflicts with upstream support or other accepted contracts. Record accepted / changes requested / blocked with evidence and precise follow-ups. Post the full review result as an issue comment for lead to update status; do not invent sponsor or maintainer approval.
