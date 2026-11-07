# hh-aid discovery and design process

## Approach

Use collaborative product discovery and a short inception to agree outcomes and a thin first delivery, then continue research alongside iterative delivery. This adapts [Paulo Caroli's Lean Inception](https://martinfowler.com/articles/lean-inception/): shared product direction and MVP learning goals. That method explicitly does not replace user research or architectural review; hh-aid needs both, plus rigorous network verification. This is our proposed process, not a claim that Thoughtworks has reviewed the project.

The lead coordinates evidence, sequencing, tradeoffs, and acceptance. The sponsor supplies domain context and makes product decisions. A messenger service relays alerts; issue comments contain the actual agent messages. Specialist agents investigate bounded questions and independently review one another. Actual maintainers, engineers, installers, and operators are human validation sources; simulated personas cannot substitute for their feedback.

## Stages and exit gates

| Milestone | Work | Exit evidence |
| --- | --- | --- |
| M1 Evidence and scope | Product discovery, upstream support/reuse research, network scenarios, physical catalogs, installation/lifecycle needs | Version baseline; supported/unsupported/unknown matrix; scenario inventory; source-backed principles; prioritized risks; sponsor agreement on product outcomes |
| M2 Inception and design | Joint domain modeling, progressive-input UX, algorithm/validation design, system options, first-slice selection | Reviewed glossary and contracts; alternatives and ADR proposals; prototype feedback; explicit provisional/export gates; first-slice success measures |
| M3 Feasibility and delivery readiness | Executable risk spikes, independent verification, architecture synthesis, delivery backlog | Reproducible end-to-end evidence; no unresolved critical correctness question for the chosen slice; accepted ADRs; estimable stories and explicit deferred coverage |

Suggested cadence: begin with one short research pass per M1 ticket (roughly one to two focused workdays for a human team), review findings, then extend only the highest-risk gaps. Use a three-to-five-session inception, followed by one or two short spike iterations. These are planning timeboxes, not completion promises for AI agents. Reassess at every gate; do not spend weeks completing a catalog before testing a risky assumption.

Inception sessions: (1) vision, users, outcomes and scope; (2) journey/story mapping and examples; (3) event storming/domain language and constraint conflicts; (4) UX, technical, and operational tradeoffs; (5) first-slice canvas, demonstration criteria, and ordered release hypotheses. The sponsor relays role contributions asynchronously if a shared session is impractical.

## Work coordination

GitHub issues hold assignments, acceptance criteria, dependency links, artifact links, questions, review outcomes, and final disposition. Milestones define gates. The Project board tracks status; labels supply a repository-visible fallback. Role names are not GitHub accounts: leave assignees unset until a real agent/user identity is available.

Workflow: Backlog → Ready → In progress → In review → Done, with Blocked when an external answer is required. Only mark Ready after prerequisite outputs are accepted; drafts may start earlier when their assumptions are explicit. Initially the independent M1 investigations are Ready. The tracking epic remains In progress. Keep one implementation/research ticket active per agent; launch a few independent assignments at a time and review them before expanding work.

At kickoff, an agent records its role, artifact paths, plan, and source baseline in its issue. During work it posts concise evidence and questions, not streams of speculative discussion. At handoff, the agent posts the full result in the issue, addressed by lasting role nickname, and the messenger relays a short alert. Lead/reviewer reads the ticket and responds there. All important findings, blockers, decisions requested, corrections and reviews must be issue comments, not chat-only messages. Link and summarize PR reviews in the issue. A reviewer records accepted, changes requested, or blocked against each criterion. The lead updates dependencies and board status; the sponsor adjudicates product tradeoffs. Escalate contradictory upstream evidence to an actual maintainer/designated Hedgehog authority through the sponsor, with precise links and a minimal example.

Do not contact external people automatically. The user has authorized project planning issues; interviews and maintainer outreach are prepared as questions for the user to relay.

## Required evidence and artifacts

Each research document states its question, scope, exact source versions, findings, alternatives, confidence, unresolved questions, and recommendations. Code claims cite commit permalinks, file paths, symbols, and relevant tests. Maintainer intent is labeled as documented, inferred, or awaiting confirmation. No agent may claim to speak for Hedgehog's creators.

Each constraint records an ID, source/version, applicability, hard/soft classification, units, validation strategy, example, counterexample, and owner. Each capability row connects an upstream rule to scenario fixtures, hh-aid coverage, and evidence status. Each requirement links to its issue, proposed contract, verification method, and release slice. Maintain this traceability through implementation.

ADRs record context, options, evidence, decision/status, consequences, and revisit triggers. A draft ADR is not an accepted decision. Keep research under `docs/research/`, design under `docs/design/`, decisions under `docs/adr/`, and executable experiments under `spikes/`; create these when an assignment produces actual content.

## Quality gates

Definition of ready: clear question/outcome, owner role and reviewer, inputs available, bounded output, and testable acceptance criteria. Definition of done: artifacts linked, criteria demonstrated, evidence pinned, limitations and unresolved questions explicit, independent review recorded, dependencies updated, and sponsor/domain approval recorded where needed. An author must not close an issue merely because a report exists.

Separate four propositions: schema-valid, accepted by upstream semantic validation, supported by the selected hardware/software combination, and suitable for the user's performance/failure requirements. No single check proves all four. Unresolved critical topology or component compatibility questions block installation-ready output, but need not block a clearly labeled estimate.

Planned verification includes independent arithmetic, golden fixtures, upstream validation, property-based constraint checks, adversarial impossible inputs, determinism/regeneration checks, and scale measurements. Check port uniqueness, complete endpoint coverage, breakout lane exclusivity, speed/media compatibility, redundancy separation, rail/domain/plane rules, spine capacity, and component accounting. VLAB success is useful integration evidence, not proof of physical reach, optics compatibility, RoCE performance, or real hardware support.

## Initial risk register

| Risk | Owner role | Evidence needed |
| --- | --- | --- |
| Schema permits a topology that runtime/hardware cannot support | Upstream compatibility | Versioned matrix and validator/controller/profile evidence |
| Port arithmetic passes but rail, plane, redundancy, or cut bandwidth fails | Network topology + independent QA | Positive and negative graph fixtures and independent oracle |
| Generator silently commits provisional answers | Domain modeling + UX | Answer-state transitions, provenance, export gates, user review |
| Cable/breakout/shuffle BOM is electrically or physically wrong | Physical connectivity | End-to-end assembly mapping and vendor evidence |
| Reuse couples hh-aid to unstable upstream internals | Integration + architecture | Versioned adapter experiment, upgrade and license assessment |
| Huge designs become slow or incomprehensible | Architecture + UX + QA | Measured generation, validation, storage and navigation targets |
| Discovery produces documents but no validated delivery path | Lead + product | Timeboxed spikes and an accepted end-to-end first slice |

## Delivery planning boundary

The final design gate creates implementation epics and small vertical stories. A candidate slice takes a verified server/switch profile and a few inputs through allocation, independent checks, upstream validation, and wiring/BOM export, then regenerates after a change. Choose the actual scenario only after research. Carry all deferred supported topology families in the coverage ledger; never claim the candidate slice satisfies the full product scope.
