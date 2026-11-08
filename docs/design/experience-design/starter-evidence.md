# D02 appendix A: starting a project — evidence, question protocol and alternatives

| Field | Value |
| --- | --- |
| Parent | [D02 experience design](../experience-design.md) §6.1 and §6.8; issue [#9](https://github.com/afewell-hh/hh-aid/issues/9), assignment [6718215963](https://github.com/afewell-hh/hh-aid/issues/9#issuecomment-6718215963) |
| Author | t5 / ux (AI agent). Not self-approved. |
| Trigger | Actual sponsor feedback on revision 2 (main [`c018fa9`](https://github.com/afewell-hh/hh-aid/blob/c018fa9c8f3ce1b696bd6c3741c10a5ae77faf6c/docs/product-context.md)): the single-choice question “What do you know now?” bundled independent facts. The sponsor likes the home-screen example categories and wants them kept as views of a shared starter library. |
| Scope | A bounded research-to-design pass: six sources, one question protocol, two alternatives, one recommendation. This is not a literature survey, and **no users were studied**. |

Labels: **E** = what a source states or found; **I** = my inference for hh-aid; **H** = a design proposal that needs user evidence.

## A1. Evidence-to-decision table

| # | Source (date; evidence type) | What it says or found (E) | Applicability to iterative SE planning (I) | Limits | Decision (H) | Task that would challenge it |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | GOV.UK Service Manual, [Structuring forms](https://www.gov.uk/service-manual/design/form-structure) (first published 2016-12-07, updated 2018-08-07; practitioner guidance from a public-service design team, with no study data on the page) | Keep a **question protocol**: ask a question only once you know why you need it and what you will do with the answer. Default to one thing per page. “User research will tell you when you can merge pages”; merging may suit internal services whose users repeat and switch between tasks quickly. Use branching so people answer only relevant questions. | SEs are repeat, expert, task-switching users; that is exactly the case where the guidance allows grouping. The protocol idea transfers directly. | Written for one-off public transactions by non-experts. The page gives no expert-user data. | Write the protocol (§A2) before choosing controls. Group an endpoint group's questions on one surface. Use applicability, not page branching, to hide questions that do not apply. | T1 (first output) and T4 (direct access): if SEs miss the essentials on a grouped surface, revisit alternative B. |
| E2 | GOV.UK Design System, [Radios](https://design-system.service.gov.uk/components/radios/) (living page, accessed 2026-11-08; design-system guidance with team research notes, no published data) | Use radios only when users can select one option. Do not pre-select radios. Include “None of the above” or “I do not know” where valid; once selected, a radio cannot be cleared. Users “did get confused when complicated questions were conditionally revealed”, and conditional reveals have a known screen-reader issue (WCAG 2.2 SC 4.1.2). | The revision 2 radio (“Servers by count, rail-based”) violated the one-concept rule: it bundled a quantity, a topology preference and a planning style. | Public-sector users and flat option lists. | No bundled classification. Each independent dimension gets its own question. Yes/no questions use radios **with no default**, plus a distinct “Customer hasn't decided (asked)” option and a **Clear answer** action. Follow-up questions are not conditionally revealed; inapplicable ones show a short “not applicable because…” line. | T7 (recognise assumptions): do participants read an unanswered question as “no”? |
| E3 | GOV.UK Design System, [Check answers](https://design-system.service.gov.uk/patterns/check-answers/) (living pattern; guidance, no findings on the page) | A summary of answers with a **Change** link per item. After a change, return users to the summary with their earlier answers pre-populated, and don't make them repeat the transaction. | The workspace is a permanent check-and-change surface. Outputs cite answers, and every trace node and “Rests on” item links back to its field. | It describes an end-of-transaction step, not a repeated planning loop. | Edits never clear other answers. Every output line links to the answers it rests on. Generation is separate from saving. | T3 (resume) and T5 (explain a diff). |
| E4 | Nielsen, [Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) (NN/g, 2006-12-03; expert synthesis of NN/g studies, no data on the page) | “Initially, show users only a few of the most important options.” Choose them by task analysis or usage data. **Staged disclosure** (wizards) works when steps are distinct, but is “problematic when the steps are interdependent and users must alternate between them”. Designs with more than two disclosure levels typically have low usability. | Our inputs are interdependent: rack count cross-checks the endpoint count, and rail preference interacts with redundancy. SEs alternate between them across sessions, so a staged sequence fits poorly. | 2006, and general software. We have no task data yet. | Put the essentials first inside each endpoint group, with optional sub-groups below on the **same level**. No staged wizard. At most two levels: section, then sub-heading. | T1, and T6 (extra known information): do participants find where to put it? |
| E5 | Krosnick et al., “The impact of ‘no opinion’ response options on data quality”, *Public Opinion Quarterly* 66(3):371–403, 2002, [doi:10.1086/341394](https://doi.org/10.1086/341394) (peer-reviewed; nine experiments in three household surveys) | No-opinion options were chosen most by respondents putting in little effort and on later questions. Leaving them out did not reduce data quality, so offering them may invite satisficing rather than improve answers. | An explicit “don't know” choice can become a low-effort default. In hh-aid, though, “the customer hasn't decided” is a real fact the SE must follow up, not an opinion. | These were attitude questions in household surveys. Ours are factual planning inputs held by a third party (the customer), answered by experts. | Unanswered is the default state and needs no click. The explicit “Customer hasn't decided (asked)” option exists only to record that the question was asked. It is never pre-selected. Both states compute alternatives, and both appear on the customer question list. | T6: when the brief contains the answer, do participants still pick “hasn't decided”? |
| E6 | Whitenton, [Filters vs. facets](https://www.nngroup.com/articles/filters-vs-facets/) (NN/g, 2014-03-16; definitional article, no data) | Faceted navigation provides “multiple filters, one for each different aspect of the content”. Facets are more expensive to build and maintain. Check that users need them; “a simple filter can often be easier to understand”. | The sponsor's home categories (server count, rack count, topology, network purpose) are aspects of one starter collection: a starter belongs in several views at once. | Written for large content sets; ours is tiny and placeholder. | One starter identity (ID + version). Views are derived from the starter's own answers, so no category is stored twice. Start with simple single-view tabs and add multi-facet filtering only when the library grows. | T8 (choose a starter by different views). |

**Evidence limits overall.** Five sources are guidance or syntheses, and one is peer-reviewed research in a different domain. None studied SEs planning fabrics. Guideline authority or popularity is not proof that a design is optimal for our users. Every decision above is H until T1–T11 run with real SEs.

## A2. Question protocol (before controls)

Quantities, endpoint profile, rack information, network purpose, rail preference, redundancy and placement are **separate dimensions**. None is a project “kind”. **Unknown is not false:** unanswered means not answered, and it is never treated as “no”.

| # | Question (per endpoint group unless noted) | Unlocks: BOM lines / uncertainty removed | Who can answer | Depends on | Needed for which output | Unknown, range and mixed-inventory handling | Later edits |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Q1 | How many endpoints? | Endpoint links and ports, then every switch count | Customer request; SE | — (or derived: racks × endpoints per rack) | **Link and port counts** and everything downstream | Blank → “Not estimated — needs endpoint count”. A range (`120-136`) gives bounded lines (`16–24`). Mixed inventory uses one endpoint group per kind. | Dependent lines go stale. A contradiction with rack capacity is shown with both answers kept. |
| Q2 | What kind of endpoint? | Default links per endpoint and link rate (as assumptions with their source) | Customer; SE; profile library | — | **Link and port counts** (or a custom profile with links and rate) | Unknown → not estimated. “Custom” covers any vendor or endpoint type. | Defaults are re-derived; supplied overrides are kept. |
| Q3 | Fabric links per endpoint; link rate | Exact link counts, port modes, leaf profile | SE; vendor documents | Q2 | Defaults suffice for a first BOM | Assumed until confirmed | Stale marking |
| Q4 | Which network do these links serve? | Which fabric the lines belong to; separate networks get separate switches | Customer | — | Optional; lines say “network not decided” | Undecided groups are pooled under “network not decided”. Mixed inventory uses one group per network. | Moves lines between networks; history kept |
| Q5 | Networks in scope (project) | Which network lines appear | Customer | Derived “in scope” from groups | Optional | Unanswered → listed “scope not decided”, never 0. Out of scope but still used by a group → contradiction. | Stale marking |
| Q6 | Should the links be rail-optimized? | Leaf packing | Customer architect; SE | Q3 (applies only with ≥ 2 links) | Optional; leaf counts are available without it | Unanswered or undecided → **separate alternatives**, collapsed when every alternative gives the same number. Not applicable for single-link endpoints. | Alternatives resolve; the diff explains it |
| Q7 | Should each endpoint be dual-homed (ESLAG)? | Leaf pairs | Customer | Q3 | Optional | As Q6. Rail-optimized together with dual-homing for the same links is a contradiction, explained and never resolved silently. ESLAG is flagged “unverified” (R02 C03). | As Q6 |
| Q8 | How many racks hold these endpoints? | Rack-aware placement; a cross-check on Q1 | Customer; site plans | — | **Rack-aware placement** only | Unknown → “placement not considered” (labelled). Racks × capacity < count → contradiction. > count → unused positions shown. | Stale marking |
| Q9 | Endpoints per rack (capacity) | A derived count when Q1 is unknown; rack fill | Customer; rack-scale profile default | Q8 | Optional | Profile default as an assumption | — |
| Q10 | Where should the leaves sit? | Rack-local versus shared leaves | SE; customer | Q8 | Optional | With racks known but this unanswered → alternatives | — |
| Q11 | Leaf and spine profiles; active uplinks; minimum spines (project) | Capacities | SE; catalog | Q3 | Defaults suffice for a conditional estimate | Assumed, with source | — |
| Q12 | Topology, D/U limit, spine-failure policy (project) | Checks and spine count | Customer; SE | Leaf counts | Optional | “Not checked” until answered. Infeasible combinations → conflict. | — |
| Q13 | Cable construction; reach (project) | Cable totals | SE; site | Link counts | Optional | Separate totals until decided | — |

### Minimum per attainable output

| Output | Minimum inputs | Otherwise |
| --- | --- | --- |
| Endpoint link and port counts | Q1 (or Q8 + Q9) and Q2 (or Q3) | Not estimated, naming what is needed |
| Leaf switch counts | The above; Q6, Q7 and Q10 optional | Alternatives for undecided choices |
| Spine and inter-switch counts | Leaf counts; Q11 defaults | Assumptions listed |
| Cable construction totals | Link counts | Totals per construction |
| Rack-aware placement | Q8 | Placement not considered |
| Procurement package, connection map | Later stages (qualified parts, port assignment) | Not a prerequisite for the BOM |

## A3. Two from-scratch alternatives

| Criterion | **A. Grouped essentials in the workspace** (recommended) | **B. Progressively revealed question groups** |
| --- | --- | --- |
| Shape | “Start from scratch” opens the workspace. Each endpoint group shows *What and how many* first (essentials marked “needed for a first BOM”), then *How they connect*, *Where they sit* and *Leaf switch* as optional sub-groups on the same level. Generate is available as soon as the essentials exist. | A short sequence: endpoints first; then “connect” questions revealed; then “where”; it ends in the workspace. |
| Speed to first output | Two answers, then Generate | Same minimum, but optional groups sit in the path unless skipped |
| Encouraging optional detail | Optional questions are visible next to their effect (“Affects: …”), with no extra step | Each group is presented in turn; this encourages detail but adds steps |
| Interdependent inputs (E4) | Count, racks and packing are visible together and editable in any order | Interdependence forces back-and-forth between stages, the case E4 calls problematic |
| Return and edit (E3) | The same surface used every session | The sequence only helps the first time; afterwards users need the workspace anyway, so there are two models to learn |
| Accessibility (E2) | No conditional reveal; inapplicable questions show a reason | Reveals carry the known screen-reader issue unless built carefully |
| Completion pressure (sponsor) | No sequence to finish | The sequence implies an end |
| Main risk | A long form may hide the two essentials (HW27) | Feels like a wizard again (revision 2 feedback) |

**Recommendation: A (H).** It matches the persistent workspace, keeps interdependent answers side by side, and has no completion cue. The protocol gives a principled minimum: two answers per output, not an arbitrary field count. Mitigations for its risk: “needed for a first BOM” chips, a getting-started note, focus on the first essential field, and “What each output needs” in the outputs area. **What would make us switch to B:** in T1, several SEs fail to find or recognise the essentials, or ask “what do I fill in?”

## A4. Starter library (discovery is separate from calculation)

- **One identity.** A starter is an ID + version + a set of answers + provenance (who built it, when, and with which evidence). It is a placeholder until the from-scratch tooling can author real ones.
- **Views are derived facets.** Endpoint count, rack count, topology and network purpose are computed from the starter's own answers. A starter therefore appears once in every view, and the views can never disagree about it.
- **No separate calculation semantics.** Choosing a starter copies its answers into a new project as **assumptions** marked “from starter S2 v0”. The same planning policies used from scratch then compute everything, and the user customises in the same details panel.
- **Authoring later (S `c018fa9`):** curators build starters with the same workspace and promote a project's answers to a library entry. There is no template-only editor.
- **Open contracts (Q, for sponsor + model):**
  - curation authority;
  - release compatibility of a starter;
  - versioning;
  - whether an updated starter is offered to projects that started from it. Proposed: offered as a reviewable diff, like release review, and never applied silently.
