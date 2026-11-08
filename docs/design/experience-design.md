# D02: BOM-first planning workspace (low-fidelity design draft)

| Field | Value |
| --- | --- |
| Issue | [#9 D02](https://github.com/afewell-hh/hh-aid/issues/9). Assignments: [6715064986](https://github.com/afewell-hh/hh-aid/issues/9#issuecomment-6715064986) (BOM-first design), [6717783503](https://github.com/afewell-hh/hh-aid/issues/9#issuecomment-6717783503) (workspace revision), [6718215963](https://github.com/afewell-hh/hh-aid/issues/9#issuecomment-6718215963) (starter research and library) |
| Author | **t5 / ux** (AI agent). Not self-approved. |
| Reviewers | t2 / scout, t9 / ops, sponsor, once lead dispatches them. Vocabulary reconciliation with D01 (t10 / model) is required before acceptance (§16). |
| Status | **Revision 3.1** applies lead's bounded corrections [6718550559](https://github.com/afewell-hh/hh-aid/issues/9#issuecomment-6718550559) (§2.1) to revision 3. Revision 3 responded to actual sponsor feedback on revisions 1 and 2 (§2). Revision 3 adds a bounded starter-UX evidence pass, a question protocol and a comparison of two alternatives ([appendix A](experience-design/starter-evidence.md)). It replaces the single-choice starter with independent questions and keeps the home categories as views of a starter library. **No SE usability testing has taken place**, and revision 3 has not been shown to the sponsor. |
| Companion artifacts | [walkthrough.html](experience-design/walkthrough.html): a self-contained, clickable, low-fidelity workspace prototype on synthetic data. [fixture-check.py](experience-design/fixture-check.py): an independent check of the fixture arithmetic. [prototype-check.html](experience-design/prototype-check.html): an automated interaction check of the prototype. [starter-evidence.md](experience-design/starter-evidence.md): appendix A (evidence-to-decision table, question protocol, alternatives, library). |

## 1. Scope, inputs and labels

**Question.** How does a Hedgehog SE plan a fabric over weeks with partial information? They need a useful, honest BOM early, can add detail in any order, and regenerate repeatedly. Every output must state what it rests on, and designs must stay current with the latest Hedgehog release. Connection-map and installation handoffs come later.

**In scope:**
- workspace information architecture and interaction model;
- readiness and state language;
- multi-session refinement and regeneration;
- review patterns for large designs;
- accessibility and error-recovery requirements;
- evaluation scripts and usability goals.

**Out of scope:**
- production UI, stack or visual design;
- a solver;
- release-update mechanics (compat's #3 and the design gate decide those);
- the first-slice scenario or readiness level (sponsor and D06 decide).

### Inputs (exact revisions)

| Input | Revision | Used for |
| --- | --- | --- |
| Sponsor direction | main [`5c64850`](https://github.com/afewell-hh/hh-aid/blob/5c648506d0ff258f030da85741835e09dc25165b/docs/product-context.md) | Audience, BOM first, latest-release target |
| Sponsor walkthrough feedback | main [`9f6194b`](https://github.com/afewell-hh/hh-aid/blob/9f6194b61d728f4b8cb60ffcb0c2fded2fae0110/docs/product-context.md) | Persistent workspace, no completion pressure, B200 as one fixture (§2) |
| Sponsor feedback on revision 2 | main [`c018fa9`](https://github.com/afewell-hh/hh-aid/blob/c018fa9c8f3ce1b696bd6c3741c10a5ae77faf6c/docs/product-context.md) | Independent questions instead of a bundled classification; home categories as views of one starter library; placeholders now (§2) |
| Starter UX sources | Six sources; dates and evidence types in [appendix A §A1](experience-design/starter-evidence.md#a1-evidence-to-decision-table) | Question protocol, control choice, library views |
| R01 product discovery | [`75fe3ed`](https://github.com/afewell-hh/hh-aid/blob/75fe3edccafc756c6b92ad44dff9b71af73d3138/docs/research/product-discovery.md) | Personas, failure modes, measures SM1–SM9, interview guide |
| R02 support contract | [`bf7437c`](https://github.com/afewell-hh/hh-aid/blob/bf7437c3fc852cfe06663073edc36a08de75efbc/docs/research/hedgehog-support-contract.md) | C03 ESLAG and C07 mesh (conditional), K09 profile features |
| R03 upstream reuse | [`2b54790`](https://github.com/afewell-hh/hh-aid/blob/2b547901413c00fb8d7ce3eeff7d6669f2b78135/docs/research/upstream-reuse.md) | U-gate meaning, first-error-only diagnostics |
| R04 topology scenarios | [`49e6079`](https://github.com/afewell-hh/hh-aid/blob/49e6079a077d1d819d12485de3896a93e8371f74/docs/research/topology-scenarios.md) | S02/S03 rail witness, S06-1/S06-2 rack fixtures, T06/T07, N01/N04/N08 |
| R05 hardware and BOM | [`8a8fcca`](https://github.com/afewell-hh/hh-aid/blob/8a8fccac6b6d560ef17889c4819dce3b8bf19a8c/docs/research/hardware-and-bom.md) | Counting invariants, construction alternatives, §6 progressive readiness |
| R06 installation and lifecycle | [`5a502b2`](https://github.com/afewell-hh/hh-aid/blob/5a502b20fb5f6acdaa36512da78cb419d653470c/docs/research/installation-lifecycle.md) | Stages I1–I11, package readiness, locked lines, change classes |
| D01 domain model (draft) | [PR #23 @ `3d313fe`](https://github.com/afewell-hh/hh-aid/blob/3d313fe53bf8d3060751694e6c7185803c316a66/docs/design/domain-model.md) | Claim scope, precision, origin and flags, invalidation, applicability predicates |

Labels used in this document:

| Label | Meaning |
| --- | --- |
| **F** | Fact stated in a cited input |
| **S** | Sponsor decision or actual sponsor feedback (main `5c64850`, `9f6194b`, `c018fa9`) |
| **H** | Design hypothesis or proposal from this draft. It needs user evidence. |
| **I** | Inferred intent. None about maintainers is used here. |
| **Q** | Open question |

All hardware in the fixtures is **hypothetical**: R04's H400 leaf, a 64-port 800G spine, a 48 × 25G + 8 × 100G leaf and a 32 × 100G spine. No support, SKU or compatibility claim is made.

## 2. Sponsor feedback and what changed

**Actual feedback (S, recorded on main `9f6194b`; not a usability study and not design acceptance).** After reviewing revision 1 at `5a20827`, the sponsor said it looked good overall. It was too closely fitted to B200, though, and it felt like a wizard users were expected to finish. The sponsor wants:
- a short starter only for the minimum inputs;
- then a persistent, editable details panel beside the generated assets;
- partial input in any order, with generate, return and regenerate repeated throughout planning;
- B200 as one replaceable fixture;
- readiness stated per output, not as questionnaire completion.

| Feedback | Revision 1 | Revision 2 change | Where |
| --- | --- | --- | --- |
| Felt like a wizard to finish | 9 numbered steps with Previous/Next | No global step sequence, numbered journey or finish button. A persistent workspace: the details panel and generated outputs sit side by side. The facilitator script is a separate, optional panel. | §6; walkthrough |
| Starter only for the minimum | Step 1 captured intent, then a linear path | A one-screen starter asks for the approach plus at most two inputs (with the profile's link count and rate for a custom profile). "Create without generating" and "Not sure yet" are allowed. It states that finishing it does not finish the project. | §6.1 |
| Repeated partial input, generate, return, regenerate | One synthetic session | Saved projects; Save and close; resume increments the session and summarises what changed. Every output revision records its details revision. Edits since the latest output mark only the dependent lines stale. Generate is always available. | §6.6, §10 |
| Any order; next question optional | Ranked question queue as step 4 | Detail sections open in any order. "Find a detail" searches every field. Suggested questions are optional and can be hidden. | §6.3, §6.5 |
| Too fitted to B200 | Single F1 fixture and B200 vocabulary | Approach, endpoint profile and switch profiles are replaceable data. Sections appear by applicability. The same starter and workspace run three fixtures: rail-based servers, rack-based placement, and redundant endpoints on mesh or leaf-spine. A custom profile covers any vendor. Network scope is an explicit choice. | §6.7, §7 |
| Readiness is not questionnaire completion | Summary strip only | "Details recorded" (supplied/assumed/unknown) is explicitly labelled as not a readiness score. Output readiness is stated per output: BOM lines, package, connection map. | §5.3 |
| Keep good evidence controls | — | Kept: claim/precision/rests-on, traces for **every** quantity, separate alternative totals, conflicts with candidate relaxations, locks, release review, scale review. | §8–§12 |

**Actual feedback on revision 2 (S, main `c018fa9`; not a usability study and not design acceptance).** The sponsor liked the overall workspace direction but rejected the single-choice “What do you know now?”. For example, “Servers by count, rail-based” bundles a quantity with a topology preference. The sponsor wants:
- several focused questions that elicit the minimum and encourage optional detail;
- research before choosing controls, and no checkbox that turns “not known” into “no”;
- the home categories (server count, rack count and similar) **kept** as overlapping views of one library of starter designs;
- placeholders until the same from-scratch tooling can build real starters.

| Feedback (revision 2) | Revision 3 change | Where |
| --- | --- | --- |
| Single-choice classification bundles independent facts | Removed. Each dimension is its own question per endpoint group: count, endpoint type, network, rail preference, redundancy, racks, endpoints per rack and leaf placement. Planning policy follows from the answers, not from an entry category. | §6.1, §6.7; appendix A §A2 |
| Research first; compare alternatives | Six sources in an evidence-to-decision table. Grouped essentials in the workspace (A) compared with progressively revealed groups (B); **A recommended**, with a stated switch condition. | Appendix A §A1, §A3 |
| Minimum useful input, encourage detail | The minimum is defined per attainable output: an endpoint count and type give link counts, leaf counts and a first BOM. Optional questions sit beside their effect (“Affects: …”). | §6.1; appendix A §A2 |
| Unknown is not false | Yes/no questions have no default. Unanswered stays “not answered”. a neutral “Not decided yet” is distinct, and a **Clear answer** action exists. Undecided choices produce labelled **alternatives**, collapsed when every alternative gives the same number. Count ranges produce bounded lines. | §6.3, §7 |
| Keep and value the home categories | “Start from a design” keeps endpoint count, rack count, topology and network purpose as **views** over one placeholder library. A starter appears once per view with “also listed under …”, and the selection survives view changes. | §6.8 |
| Starters customised in the same tooling | Choosing a starter copies its answers into a new project as **assumptions from starter S2 v0**, computed by the same planning policies and edited in the same details panel. | §6.8 |
| Placeholders, not a catalog | Every starter is labelled “placeholder v0 — synthetic, not supported”. The earlier rail/rack/mesh fixtures now live as placeholders S1–S4 and test fixtures. | §6.8, §7 |

### 2.1 Lead's corrections to revision 3 (revision 3.1)

| Finding (lead, [6718550559](https://github.com/afewell-hh/hh-aid/issues/9#issuecomment-6718550559)) | Change | Where |
| --- | --- | --- |
| 1. Count and endpoint type were not visible together on first entry | The essentials now sit together in one block at the top of the first endpoint group, and the guidance is cut to one line. The group name moves to an optional sub-group, and the “details recorded” tally and search move below the groups. If the essentials would fall below the fold (narrow screens), first entry scrolls to the details heading. Checked at 1,400 × 1,000 (no scroll needed; header, hint and both essentials visible) and 390 × 844 (hint and both essentials visible). On return, the outputs heading and Generate are in view at both sizes. | §6.1; walkthrough |
| 2. Alternative B was a wizard, not progressive disclosure; E2 and E5 were over-applied | B is now “optional groups collapsed to headings” **in the same workspace**, with no sequence. Both A and B are implemented behind a view switch for a fair comparison. A stays the default as a **hypothesis**. E2 is limited to radio conditional reveals; E5 no longer justifies discouraging unknowns. The wording is now “Not decided yet” and “Not answered yet”. | Appendix A §A1, §A3; §6.3 |
| 3. Capacity was treated as occupancy | Separate questions: **populated endpoints per rack** (actual; derives a count) and **maximum endpoints per rack** (capacity; profile default). A count from racks × capacity appears only as an explicit assumption (“assumes every rack is full”), flagged on the output line and listed in its “rests on”. Partly filled racks show unused positions. A count that disagrees with racks × populated, beyond a partly filled last rack, is a mismatch with both answers kept. | Appendix A Q9a/Q9b; §7.1 |
| 4. Undecided networks were pooled | Two or more groups with undecided networks are never combined silently. “Kept separate” and “sharing switches (conditional)” are shown as alternatives, and lines that exist only under one say “not applicable under this alternative”. Negative case tested: 8 + 4 spines separate versus 16 shared. | Appendix A Q4; §6.7; §7.1 |
| 5. Scope language | Rail plus dual-homing is **not modelled**, not a contradiction. Identical results are “the same under every alternative this prototype evaluated”. The two-answer minimum yields a **conditional estimate** under the named profile and default assumptions. | Appendix A Q7, §A2; §6.1, §6.7, §7 |
| D01 coordination | Model's answers ([6718064248](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6718064248), [6718326881](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6718326881)), acknowledged by lead, are incorporated; they are no longer reported as open. | §16 |

## 3. Design principles (H, derived from S/F)

1. **A workspace, not a wizard.** The project is a persistent place. Users add whatever they know, in any order, and regenerate whenever they want. Incomplete is a normal saved state, not an unfinished task (S `9f6194b`).
2. **A useful BOM first, never a false one.** The first output appears as soon as the minimum inputs exist. Unknown inputs produce "Not estimated — needs X" or separate alternatives, never invented quantities (S; D01 §4).
3. **Readiness is a claim about an output, not a project percentage.** Each BOM line and each package states what is established. How much of the questionnaire is answered is shown separately and labelled as not readiness.
4. **Every number answers "why?"** Each quantity opens its own derivation, with inputs, origins and "what would change it".
5. **Help, not a path.** Suggested questions rank by impact. They are optional and never block generation.
6. **Nothing changes silently.** Every output revision cites its details revision. Edits mark only the dependent lines stale, and regeneration shows a diff. Ordered lines are never re-optimised; a disagreement becomes a conflict.
7. **Scenario-neutral core.** Approaches, profiles and planning policies plug in as data. B200, NVL72 and general servers are fixtures of one model, not product identity.
8. **Two versions, always visible.** "Installing on: <target>" and "Built from evidence: <snapshot>" are always shown separately.
9. **Exceptions first at scale.** Summaries, exceptions, search and filters come first, never a giant graph.

## 4. Users and context

- **Primary user: Hedgehog SE (S).** Possible access for **selected partner SEs (S)**. Personas P1/P2 from R01 are unvalidated by interviews.
- **Situation (H, R01 §4; S `9f6194b`):** a prospect sends one or two facts. The SE wants a credible estimate for a call. Over days or weeks, answers arrive in no particular order, so the SE comes back many times and regenerates.
- **Partner access (H):** each project shows its visibility scope ("Visible to: Hedgehog only"). Q-UX-1 asks what partners may see or edit.
- **Later consumers:** designer and approver, procurement, installer and operations see later stages. They are not prerequisites for the first BOM.

## 5. Readiness and state language (H; reconciled with D01 draft)

Terms follow D01's draft ([PR #23 @ `3d313fe`](https://github.com/afewell-hh/hh-aid/blob/3d313fe53bf8d3060751694e6c7185803c316a66/docs/design/domain-model.md) §3–§4). Both drafts are under review.

### 5.1 What each BOM line shows

| Column | Values | Source |
| --- | --- | --- |
| **Quantity** | A count; separate alternative totals (never summed); a labelled **lower bound**; **"Not estimated"** (never 0); or "suspended" by a conflict | D01 §4 |
| **Precision** | `exact under stated assumptions` / `exact per alternative` / `bounded` / `unresolved` | D01 §4 |
| **Claim** | `conditional estimate` or `qualified quantity scope` | D01 §4 |
| **Rests on / needs** | The `assumed` inputs the line depends on; inputs it has **not checked** because they are unknown; for unestimated lines, what is **needed**; plus stale, blocked and unverified flags | D02 (H), from D01 AnswerRecord |

A count can be exact under stated assumptions and still be a conditional estimate. "Rests on" makes that visible. The risk that SEs misread "exact" beside "estimate" remains open (HW10).

| Claim | Established | Permitted use | Never shown as |
| --- | --- | --- | --- |
| **Conditional estimate** | Counts or expressions under explicit assumptions; failures and exclusions listed | Sizing conversation; budgetary BOM with assumptions | Qualified, orderable or installable |
| **Qualified quantity scope** | Exact requirement units, qualification evidence, complete witness, target applicability | Basis for a procurement package | Orderable on its own |
| **Procurement-candidate** (package) | Qualified quantities plus SKUs, lengths, stock and commitment reconciliation | Approver review | Approved |
| **Procurement-approved** (package) | A named approver's disposition on the package hash | Hand to procurement under agreed policy (Q) | Proof of installation readiness |

Later, separate predicates: connection-map realization, site binding and installation acceptance (D01 §4; R06 I5–I9).

Rules (H, consistent with D01):
- Approval never changes a claim. It is a separate record on an exact hash. On a new revision it becomes `retained within unchanged scope`, `needs review` or `invalidated`.
- A package is not the minimum of its line badges.
- A changed input, target change or stale evidence sets **stale** on dependent results only, with the reason.

### 5.2 Answer and evidence states

| Axis | Values (D01) | Shown as |
| --- | --- | --- |
| Origin | `unknown`, `assumed` (named default with source), `user` (shown as "supplied"), `derived`, plus `not applicable` with a reason | Chip on each field and in each trace |
| Flags (independent) | `conflicting`, `stale` | Extra chips. A field that feeds an open conflict shows "conflicting". |
| Lock and commitment | Order record (ordered / delivered quantities); unlocking needs a named change and stays in history | Padlock with "16 ordered · 0 delivered" |
| Compatibility | `compatible within stated scope`, `incompatible`, `unverified`, `disputed` | For example "ESLAG on this leaf profile: unverified (R02 C03, K09)" |
| Release impact | `changed`, `unchanged with evidence`, `unknown/uncovered`, plus independent **blocked** | Release review (§11) |
| Installation target | A verified target, or `unknown-currentness` | Project header |

### 5.3 Output readiness versus details recorded (S `9f6194b`)

The workspace shows these two things in different places, with different words:
- **Details recorded** (details panel): "3 supplied · 9 assumed · 2 unknown — this records what hh-aid knows. It is not a readiness score." There is no percentage, progress bar or "complete" state.
- **Output readiness** (outputs area, per output): "BOM — 8 lines conditional estimate · 0 qualified quantity scope · 0 not estimated · 0 suspended. Procurement package — none declared. Connection map — later stage, not started."

Answering more questions can leave readiness unchanged. Answering one decisive question can change it a lot. The UI must never imply "answer everything to be ready".

## 6. Workspace information architecture (H)

### 6.1 Starting a project (revision 3)

The home screen offers two distinct paths:
- **Start from scratch** answers independent questions.
- **Start from a design** chooses a placeholder starter from the library (§6.8).

They lead to the same workspace and the same details. The evidence, question protocol and alternatives are in [appendix A](experience-design/starter-evidence.md).

**From scratch (alternative A by default, as a hypothesis; appendix A §A3).** There is no separate starter screen.
- “Start from scratch” opens the workspace with focus on **How many endpoints?** and a one-line hint: *“First BOM: enter how many endpoints and what kind. Everything else is optional; leave anything you don't know.”*
- The first endpoint group is expanded and shows:
  - the **essentials together at the top**: count (a number or a range) and endpoint type;
  - links and rate (defaults from the type);
  - **How they connect** (optional): network, rail preference, redundancy;
  - **Where they sit** (optional): racks, populated endpoints per rack, rack capacity, leaf placement;
  - **Group name and leaf switch** (optional).
- A view switch, “Optional questions: Show all / Collapse to headings”, offers alternative B in the same workspace.
- Each question shows **what it affects**.
- The outputs area lists **what each output needs** and which outputs are available now.

**Minimum per attainable output** (appendix A §A2):
- an endpoint count (or racks × populated endpoints per rack; or racks × capacity as an explicit full-rack assumption) plus an endpoint type gives a **conditional estimate** under the named profile and default assumptions: link and port counts, leaf counts (with alternatives for undecided choices), spine counts and cable totals;
- rack-aware placement additionally needs a rack count;
- packages and the connection map are later stages.

**Not used:** a single-choice “kind of project” question (S `c018fa9`; appendix A E2); a staged sequence (E4); checkboxes for yes/no/unknown dimensions (S).

### 6.2 Workspace layout

| Region | Content |
| --- | --- |
| Project header | Name, visibility, session number, saved state, **Save and close**, "Installing on" and "Shown output built from evidence", currentness banner |
| Resume banner (on return) | "Welcome back — session N. Latest output: BOM revision R (details rX). K detail edits not yet in an output. Pick up anywhere; nothing needs finishing." It can be dismissed. |
| Details panel (left; stacked first on narrow screens, with skip links) | Details recorded, Find a detail, optional suggested questions, detail sections |
| Outputs (right) | Output status and **Generate**, then tabs: BOM · Changes · Revisions and history · Links · Release · Later stages |

On wide screens the details panel scrolls independently, so details and outputs stay visible together (S).

### 6.3 Details panel

- **Sections are disclosures**, opened in any order. Each summary shows its own supplied/assumed/derived/open counts. Sections:
  - Project and request;
  - **one section per endpoint group** (mixed inventory: up to three in the prototype), with the four sub-groups above;
  - Networks in scope;
  - Spine and uplink profiles;
  - Topology, failure and oversubscription;
  - Cabling;
  - Installation target and evidence.

  There are at most two disclosure levels (appendix A E4).
- **Yes/no dimensions are radios with no default** (appendix A E2):
  - options plus a neutral “Not decided yet”;
  - unanswered stays “not answered yet” and is never treated as “no”; unknown is easy and legitimate;
  - **Clear answer** returns to not answered.
- **Applicability-driven.** A field that does not apply shows a one-line reason instead of controls; for example, rail preference for single-link endpoints. Inapplicable questions are not hidden and revealed (appendix A E2). Earlier answers are kept and return when the field applies again (D01 §3 applicability predicates).
- **Every field shows its origin.** Fields can be supplied, assumed (with its source), unknown or conflicting. Assumed values offer **Confirm** (creates a supplied answer) and **Don't assume** (an explicit unknown). Supplied and “not decided yet” values offer **Clear answer**.
- **Find a detail.** One search box covers every field label, help text and section. It lists matches, including inapplicable ones marked as such, and jumps to the field, so users never step through unrelated questions.
- **Edits save immediately** and create a new details revision. They reach outputs only when the user generates. The UI says so.
- **Network purpose is two separate questions.** Each endpoint group says which network it serves. Project scope is a yes/no/undecided per network, derived as “in scope” when a group uses it. Unanswered networks are listed “scope not decided”. A network in scope without a group shows “Not estimated”. A group serving an out-of-scope network is a contradiction. None is ever shown as 0.

### 6.4 Generated outputs

- **Generate** is always available. It shows "Generate revision N+1 from current details" or "Up to date". Generation computes every line it can. Lines whose required inputs are unknown say what they need. Lines blocked by a conflict are suspended; the others keep their values.
- Each output revision records its **session, details revision, evidence snapshot and target**. Older revisions stay read-only and can be compared.
- **Later stages** (connection map, procurement package, installation package) are shown as their own outputs with their prerequisites. They are never prerequisites for the BOM.

### 6.5 Suggested questions (optional)

A small, hideable list of up to four detail links. Each has a reason computed from the current state:
- “needed by endpoint links”;
- “deciding could change leaf-to-spine links (544 to 768)”, from the actual spread across the current alternatives;
- “a narrower count would narrow leaf switches (16–24)”;
- “feeds an open conflict”.

There is also “Copy open questions for the customer”, which lists unanswered, undecided and assumed questions in plain language. This follows the D01 hypothesis of ranking by quantity swing and claim unblocking (D01 §3). It is a prototype heuristic, not a validated ranking (UG11). Suggestions never block anything, and nothing is re-asked.

### 6.6 Sessions, revisions and staleness

| Concept | Behaviour (H) |
| --- | --- |
| Details revision (`r12`) | Increments on every answer, lock or target change. History keeps who, when (session) and before/after. **Undo** creates a new details revision; nothing is erased. |
| Output revision (`revision 3`) | Immutable. It cites its details revision, session, evidence and target. |
| Stale | After an edit, each line of the latest output whose dependencies include the changed detail is marked "stale — changed: <detail>". Unaffected lines say nothing. The status bar summarises: "2 edits since this output: spine-failure policy — 4 lines marked stale; the other lines are unaffected." |
| Session | Save and close ends a session. Resume starts the next one and shows the resume banner. Sessions carry no completion state. |
| Diff (Changes tab) | Pick any two revisions. It shows a summary of quantity deltas and changed/unchanged counts; detail changes between their details revisions; the evidence change; changed lines with reasons ("suspended by conflict", "rests on 8 → 7 assumptions"); and unchanged lines collapsed. |

### 6.7 Planning policies follow answers, not entry categories

Discovery navigation (home categories, library views) never selects a calculation. The planning policy for each endpoint group is derived from its answers:

| Answers | Leaf packing (prototype policy) | Evidence |
| --- | --- | --- |
| Rail-optimized = yes | One leaf per rail for each block of up to *slots* endpoints | R04 S02/S03 |
| Dual-homed = yes, rail-optimized = no | ESLAG leaf pairs; links split evenly across the pair | R02 C03 (conditional) |
| Both = no | All of an endpoint's links on one leaf | — |
| Rail and/or redundancy undecided | **Every packing this prototype models** is computed and shown as labelled alternatives; results identical across them collapse to one number. These are not all possible designs. | D01 §4 (alternatives never summed) |
| Rail = yes and dual-homed = yes | **Not modelled** here: no quantity, and no claim that it is impossible | — |
| Two or more groups with undecided network | “Kept separate” and “sharing switches (conditional)” shown as alternatives; never pooled silently | Model overlap rule (#8 6718326881) |
| Racks known, placement = in each rack | Packing applied per rack (rack-local leaves) | R04 S06-1 |
| Racks known, placement undecided | Rack-local and shared shown as alternatives | — |
| No racks | Placement not considered (labelled in the trace) | — |

Each **network** (backend, frontend, storage, management, or “not decided”) then gets its own spine layer per uplink family; mixed inventory therefore yields separate switch sets per network. Replaceable data:
- endpoint profiles (B200 HGX-class, NVL72-style tray, general 2 × 25G, **custom**);
- hypothetical leaf and spine profiles;
- per-family uplink counts.

A first implementation slice can ship one policy without changing the workspace, readiness language, revision model or library (S).

### 6.8 Starter-design library (placeholders)

- **Paths stay distinct.** “Start from a design” is a browsing task; “Start from scratch” is an answering task. Both end in the same workspace.
- **Views:** By endpoint count · By rack count · By topology · By network purpose. These are the sponsor's home categories kept as tabs (S). Buckets are **derived from each starter's answers**, so a starter has one identity and appears exactly once in every view, with “also listed under …” for the others (appendix A E6). The selected starter survives view changes.
- **Preview** lists the answers the starter will set and a computed summary, using the same planning policies.
- **Customise in workspace** copies the answers into a new project as **assumptions** (“from starter S2 v0 (placeholder)”). The project header shows “Started from: S2 v0”. Every value can be confirmed, changed or cleared like any other answer.
- **Placeholders:**
  - S1: rail-optimized GPU backend, 128 servers;
  - S2: rack-scale backend, 8 racks, rack-local leaves;
  - S3: small dual-homed frontend pair (mesh);
  - S4: dual-homed storage leaf-spine.

  All are synthetic, labelled “placeholder v0 — not supported or qualified”, and are not a catalog.
- **Later (S):** real starters are authored with the same workspace and promoted to the library. Curation, release compatibility, versioning and update offers are open contracts (appendix A §A4; Q-UX-8).

## 7. Mixed knowledge from scratch, and the placeholders

All counts are checked by `fixture-check.py` and reproduced by the prototype (`prototype-check.html`). Hardware is hypothetical.

### 7.1 From scratch: two answers, then more as they arrive

| Details answered | Output (selected lines) | What the UI says |
| --- | --- | --- |
| Count 128, type B200 (8 × 400G). Rail preference, redundancy, racks and network **not answered** | Links **1,024**; leaves **16**; cages **512**; spines **8**; leaf-to-spine links **512**; OOB **24** | “Undecided choices shown as alternatives: rail preference / redundancy”. All three packings give the same numbers here, so each line shows one number. Lines are labelled “Network not decided”. |
| Count → **136** | Links 1,088 and cages 544 under every evaluated alternative. **Leaves: rail-optimized 24 · dual-homed pairs 18 · all links on one leaf 17** (separate totals for the three packings this prototype models). Leaf-to-spine links 768 · 576 · 544. Spines 16 under all. | Top suggestion: “Should the links be rail-optimized? — deciding could change leaf-to-spine links (544 to 768)”. |
| Racks **8**, **16 populated** per rack | **Mismatch:** “136 endpoints, but 8 racks × 16 populated per rack = 128. Both answers are kept; nothing was changed.” Leaf lines suspended; links kept. | Ways forward with Preview: “the racks are right: use 128 endpoints” or “the count is right: use 9 racks”. |
| Racks **9** | Consistent: “last rack partly populated: 8 of 16”. **Placement undecided** adds alternatives: rail-optimized, rack-local → **72 leaves**, whose 2,304 uplinks exceed one spine layer (conflict **only under that alternative**). | Placement shown to matter, not silently chosen |
| Rail-optimized = yes, placement = shared | Leaves **24**, spines **16** | Alternatives resolve; the diff explains it |
| Count `120-136` (range) instead | Leaves **16–24**, links **960–1,088**, precision “bounded (range)” | A narrower count is suggested |
| Second endpoint group: 40 general servers (2 × 25G), storage network, dual-homed | Storage: 2 leaves, 2 spines (100G family); backend unchanged; OOB **28** | Separate switches per network. Storage scope is derived as “in”; other networks are listed “scope not decided”. |
| Racks only (4 NVL72-style racks; capacity 18 by profile default; populated not answered) | Count 72 as an **explicit assumption**; tray links **288** | “assumes every rack is full (racks × capacity) — confirm, or enter populated endpoints per rack”. The links line carries the flag and lists the count under “rests on”. |
| Same, with **10 populated** per rack | Count **derived** = 40; links 160 | “32 rack positions unused (40 populated of 72 capacity)” |
| Supplied count 60 in those 4 racks; then 80 | 60: partly filled, “12 rack positions unused”. 80: “More endpoints than rack positions” (over capacity) | Both answers kept |
| Two groups (128 and 64 rail-optimized B200), **both networks not answered** | Alternatives: kept separate, 8 + 4 spines; or sharing switches (conditional), 16 spines | Neither pooled nor split silently; each line says “not applicable under this alternative” where it does not exist |

### 7.2 Placeholder starters (same policies, same workspace)

| Starter | Answers it sets (as assumptions) | Output |
| --- | --- | --- |
| S1 · Rail-optimized GPU backend, 128 servers | count 128, B200, backend, rail yes, single-homed | 16 leaves, 8 spines, 512 leaf-to-spine links |
| S2 · Rack-scale backend, 8 racks | NVL72-style, 8 racks × 18, rack-local, rail yes, 10 active uplinks per leaf | 576 tray links, **32** rack-local leaves, 288 cages (736 growth-reserved), **5** spines, 320 links, OOB 37 (R04 S06-1/S06-2) |
| S3 · Small dual-homed frontend pair | 40 × 2 × 25G, dual-homed, mesh, 2 racks × 20 | 2 leaves, **0** spines (mesh), 8 mesh links, OOB 2; ESLAG flagged unverified; mesh conditional (R02 C07) |
| S4 · Dual-homed storage leaf-spine | 96 × 2 × 25G, dual-homed, storage | 4 leaves, 2 spines, 32 links, OOB 6 |

Views: S1 is under “65–256 endpoints”, “No rack information”, “Leaf-spine, rail-optimized” and “Backend scale-out”. S2 is under “65–256 endpoints” (144 derived), “5–16 racks”, “Leaf-spine, rail-optimized” and “Backend scale-out”.

### 7.3 Gating without invention

- With the count blank, links, leaves and spines say “Not estimated — needs endpoint count”.
- A custom endpoint without a link count is not estimated.
- “Other leaf profile” makes dependent lines need catalog evidence.
- Rail-optimized plus dual-homed for the same links is marked “not modelled here”: no quantity, and no claim that it is impossible.

## 8. "Why this number?" (quantity trace)

**Every** quantity is a button that opens its own derivation (revision 1 only had the spine trace; HW3/HW11 fixed). Example for 8 spines:

```
8 spines [exact under stated assumptions · conditional estimate]
- 8 spines = smallest S ≥ 2 that divides 32 uplinks per leaf evenly, with 64·S ≥ 512 leaf uplinks
  (800G spine profile: assumed · uplinks per 800G leaf: assumed · minimum spines: assumed · spine-failure policy: not answered)
  - 16 leaves in this network (from the endpoint groups above) (endpoint count: supplied · rail preference: not answered · …)
  - normal D/U on the busiest leaf = 1 (D/U limit: not answered)
Counts: requirement dem:n.undecided.800.spines (stable aggregate demand ID; not yet expanded to instances)
What would change it: rail preference · redundancy · links per endpoint · … · spine-failure policy
```

Requirements (H):
- Each node shows input origins, with a **Change** action that opens that field.
- The trace names the stable demand ID counted (D01 §4–§5), so the later connection map can reconcile line by line.
- It can be copied as plain text with its assumptions, revision and evidence.
- A "Not estimated" line's explanation lists the missing inputs and says hh-aid does not invent quantities.

## 9. Infeasible requests and conflicts

With the §7.1 project at 128 endpoints, setting "after one spine failure: full bandwidth" gives:

```
Network not decided: cannot satisfy D/U ≤ 1 after one spine failure   [demonstrated: these answers cannot all hold]
Because: each full leaf has D = 25,600 Gb/s and U = 25,600 Gb/s. Losing 1 of S spines leaves U·(S−1)/S,
  so D/U after the loss exceeds 1 for every S. Routing cannot add missing cut capacity (R04 T06, N04).
Inputs involved: spine-failure policy (supplied) · uplinks per 800G leaf (assumed) · 800G spine profile (assumed)
Ways forward (nothing is changed automatically; not checked for minimality):
  1. Accept D/U ≤ 8/7 after a spine loss          [Preview] [Use as my answer]
  2. No spine-failure requirement                  [Preview] [Use as my answer]
  3. Fewer endpoints per leaf or a leaf with more uplink capacity (needs catalog evidence)   [Go to detail]
Suspended: spines, links, cables, OOB. Every other line keeps its value.
```

- **Preview** computes the effect without changing anything, for example "spines — suspended → 8 · leaf-to-spine links — suspended → 512 · OOB ≥ 16 → 24 · no conflicts".
- **Use as my answer** records a supplied answer only. The conflict remains until the user generates.
- The headline distinguishes **demonstrated** (these answers cannot all hold), **contradictory answers** (for example a network marked out of scope but used) and **not proven feasible** (not modelled or not searched).
- Contradictions between answers (count versus rack capacity, rail versus dual-homing) use the same panel. Both answers are kept and shown with their origins.
- When alternatives are shown, a conflict that holds under only some of them says “Only under: rail-optimized · rack-local leaves”.
- OOB becomes a labelled **lower bound** (≥ 16) while the spine count is open.
- Fields that feed the conflict show a "conflicting" chip in the details panel.

## 10. Multi-session refinement, commitments and regeneration

Demo for the moderated walkthrough (the order is a facilitator script, not product navigation; presets `#demo-s1` to `#demo-s3`):

| Session | User action | System response |
| --- | --- | --- |
| 1 | Start from scratch. Count 128, type B200; nothing else. Generate (revision 1). Opens a trace. Save and close. | First BOM (§7.1, row 1). Project listed with “latest output revision 1”. |
| 2 | Resume. Count → 136; racks 8 × 16 (the “Where they sit” sub-group of the same section). Generate (revision 2). | Resume banner. The edits mark only dependent lines stale. Revision 2: the count / racks × populated mismatch is shown with both answers kept; links kept. |
| 2 | Chooses “the count is right: use 9 racks”; decides rail-optimized, shared placement, backend. Generate (revision 3). | 24 leaves, 16 spines. Changes tab: alternatives resolved, mismatch resolved, detail changes listed. |
| 3 | Records orders: 24 leaves, 16 spines. Save and close; resume. Count → 260, racks → 17. | “4 edits since this output … lines marked stale”. |
| 3 | Generate (revision 4). | Leaves **40 = 24 ordered + 16 proposed**. **Conflict:** “16 ordered spines × 64 = 1,024 ports. With no D/U limit set, every leaf keeps all 32 uplinks: 40 leaves × 32 = 1,280 uplink ports, 256 more than the ordered spines have.” One way forward is “Set a D/U limit: partly filled leaves may then need fewer uplinks” (with D/U ≤ 1 the need is 1,040: still 16 short). |

Rules (H):
- Ordered quantities are never re-optimised or removed. Surplus or shortfall needs an explicit disposition.
- Removing an order record requires a confirmation naming the affected lines, and stays undoable in history.
- An override that conflicts with a rule is stored as `supplied`. It survives regeneration, and its conflict re-appears until resolved.
- Candidate relaxations for the locked-spine conflict:
  - add spine capacity and rebalance — an approved-cabling change (R06 class T2);
  - set a D/U limit so partly filled leaves need fewer uplinks (offered only when no limit is set);
  - take uplinks from existing leaves, raising their D/U (not modelled).

  Only the first leads to an action in the prototype; the others are labelled "not modelled".
- Approvals on an earlier revision apply to that revision's hash only (D01 §3). The prototype records no approvals and says so.

## 11. Latest-release workflow

**Sponsor direction (S):** installations use the latest release. Each revision keeps its exact evidence for reproducibility. Compat is verifying the current release in [#3](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6715064634). This draft uses **placeholders** and does not claim which release is current.

- **Always visible:**
  - project header: "Installing on: <target> — currentness <state>";
  - each revision: "Built from evidence: <snapshot>";
  - a banner when the shown output was built for a different target, or from a research snapshot while currentness is unknown.
- **Release review (Release tab, H).** "Record a new target observation (placeholder)" marks outputs "release review pending" and opens an impact table grouped by compat's #3 areas. Each item is `changed`, `unchanged with evidence` or `unknown/uncovered`, with an independent `blocked` flag:
  - unchanged items are acknowledged together but stay listed;
  - changed and unknown items are reviewed individually;
  - **Revalidate** creates a new revision against `<snapshot-target>` and flags only the dependent claims, for example cable lines "blocked for qualification on <TARGET>: compatibility evidence unknown (example)";
  - ordered lines carry forward; an incompatibility would be a conflict, never a substitution;
  - prior revisions stay reproducible.
- All rows are labelled "example only — not a real release finding". Q-UX-5 (approver for all-unchanged reviews) remains open.

## 12. Large-topology review

| Need | Pattern (H) | Prototype |
| --- | --- | --- |
| "Is it right overall?" | Summary per network, group and plane | Output status and BOM summary strip |
| "What's wrong?" | **Exceptions first**: conflicts, stale lines, changed patterns, intentional unused ports, unverified compatibility | Links tab exceptions strip |
| "Where is endpoint X?" | Search by ID, rail, group, rack, cage | Rail locator: "endpoint 77 rail 5 → leaf G1-B-r5 cage 7 lane 2". Only for one rail-optimized group with shared placement. |
| "Show me a slice" | Facets and text filter | Text filter over patterns; "changed since previous only" |
| Reviewing links | **Pattern rows** that expand to per-link rows; virtualised tables; CSV export of filtered views | Pattern rows with unchanged patterns collapsed. Per-link rows and CSV are **not built**. |
| Structure | Small schematic per pattern, with a table equivalent | Not built |

Each BOM line, its link patterns and the planning identities form one hierarchy. Every quantity opens the patterns it counts, which is how the later connection map reconciles to the BOM.

## 13. Accessibility requirements (H; target WCAG 2.2 AA)

1. **State is never colour alone.** Every origin, flag, claim and impact state has a text label and a distinct glyph. Contrast is ≥ 4.5:1 for text and ≥ 3:1 for icons and focus.
2. **Keyboard.**
   - Detail sections use native `details`/`summary`, with no controls inside `summary`.
   - Output tabs implement the ARIA tabs pattern: roving `tabindex`, arrow keys and Home/End.
   - After a re-render, focus returns to the control that was used.
   - Opening a trace moves focus to it, and Close returns focus to its quantity.
3. **Real tables** with captions and header scopes. Wide tables scroll inside their container.
4. **Announcements.** One polite live region announces edits ("Saved; not yet in an output"), generation ("Revision 4 generated from details r9: 6 lines changed, 1 conflict"), previews and session close.
5. **No graph-only information.**
6. **Reflow.** Usable at 320 CSS px and at 200% zoom. The two columns stack, with skip links to Details and Outputs.
7. **Plain language.** D/U is defined in the field help. Abbreviations are expanded. Labels avoid implying deployability.
8. **No time limits.** Sessions never expire work.
9. **Exports** carry the same scoped labels and assumptions.

## 14. Error recovery requirements (H)

| Situation | Required behaviour | Prototype |
| --- | --- | --- |
| Wrong answer | Undo per change; history with session; Use default / Don't assume | Yes |
| Invalid number | Inline error, nothing saved | Yes |
| Unknown input | Dependent lines "Not estimated — needs X"; never invented | Yes |
| Regeneration fails | Keep the last good revision labelled; retry; never show partial numbers as complete | Not modelled |
| Impossible constraints | Conflict panel; affected lines suspended, others kept; preview; nothing relaxed automatically | Yes |
| Conflict with ordered lines | Never auto-resolve; options with procurement impact; record the disposition and approver | Conflict shown; disposition not modelled |
| Accidental unlock | Confirmation naming affected lines; undo in history | Browser confirm; product needs a named-lines dialog |
| Lost work | Auto-save every edit; revisions immutable; if storage fails, say so | Yes. The prototype says when browser storage is blocked. |
| Approach changed by mistake | Answers in inapplicable sections are kept; changing back restores them | Yes |
| Release change | Dependent claims flagged; project never shown as current without evidence | Placeholder flow |
| Partner scope mistake | Show visibility before export or share; confirm sharing outside Hedgehog | Header only |

## 15. Evaluation plan

### 15.1 Evidence types (do not mix them)

| Type | Who | Counts as | Status |
| --- | --- | --- | --- |
| Heuristic walkthrough | An agent or reviewer, against Nielsen heuristics and §13 | Design-defect findings only | Author passes on revisions 1–3 (§15.4). Independent pass requested. |
| Published guidance and research | Design systems, NN/g, survey methodology | Inputs to design decisions, not evidence about our users | Six sources in [appendix A](experience-design/starter-evidence.md) |
| Sponsor walkthrough | Sponsor | Domain-fit feedback, not usability evidence | **Actual feedback recorded** on revision 1 (main `9f6194b`) and revision 2 (main `c018fa9`); §2. Revision 3 not yet reviewed. |
| Task-based usability test | Real SEs (R01 §9 screening) | Usability evidence, qualitative at n≈3–4 | **Not done.** No recruitment has taken place. |
| Automated prototype checks | Scripts | That the prototype computes and behaves as specified; not usability | `fixture-check.py`, `prototype-check.html` (§19) |

### 15.2 Task scripts (revision 3)

**Before any session,** someone other than the facilitator writes the expected answers (topo or check; R01 §7). Participants start from the project list. Multi-session tasks may be split across sittings or simulated with the resume presets. Participant briefs are **customer emails written in the customer's words**, so tasks test whether SEs map facts to the right questions.

| ID | Task (participant instructions) | Expected answer source | Records |
| --- | --- | --- | --- |
| T1 | “A customer emailed ‘about 128 B200 HGX servers for training; rest TBD’. Get something you could discuss on a call, then stop.” | §7.1 row 1 | Path chosen (scratch or library); time to first output; **whether they stop** without filling optional questions; essentials found without help (switch condition for alternative B) |
| T2 | “A week later the customer adds: ‘136 servers, eight racks of sixteen, and we want rail-optimized backend.’ Bring the BOM up to date.” | §7.1 rows 2–5 | **Provides the extra information in the right places** (count, racks, rail) without stepping through unrelated questions; notices and resolves the contradiction; regenerates |
| T3 | “Reopen the project. What changed since you left, and what is still assumed or undecided?” | Resume banner, history, BOM | Finds the latest output and pending edits; **lists assumptions and undecided choices correctly** (no unanswered item read as “no”) |
| T4 | “The customer says the fabric must keep full bandwidth if a spine fails. Record that and update the BOM.” | §9 | Direct access (search, section, suggestion or trace “Change”); recognises infeasibility; picks a way forward |
| T5 | “What changed between the last two versions, and why?” | Changes tab | Explains the diff, including resolved alternatives |
| T6 | “The leaf count shows three numbers. What decides between them, and what would you ask the customer?” | §6.7, §7.1 row 2 | Reads alternatives as separate options, never a sum or an average; names rail preference and redundancy; uses or ignores the suggestion |
| T7 | “For each line, could you put this number in a quote? Order it? Install from it?” | §5.1 | Readiness comprehension (SM9) |
| T8 | “Another customer has rack-scale NVL72-style systems. Find a starting design using the library, look at it from a different view, and adapt it to 10 racks.” | §6.8, §7.2 | **Chooses a starter via at least two views**; recognises it is the same starter; understands placeholder status; customises in the same details panel; recognises starter values as assumptions |
| T9 | “24 leaves and 16 spines are ordered. The customer now wants 260 servers in 17 racks. Refresh the BOM.” | §10 | Finds the conflict; does not assume ordered parts change |
| T10 | “A new Hedgehog release is out. Is this design still good to install on it?” | §11 placeholders | Distinguishes evidence from target |
| T11 | “Find which leaf endpoint 77's rail-5 link uses.” | Rail allocation | Time; path; correctness |

### 15.3 Usability goals (H; per participant; small samples are learning evidence only)

| Goal | Measure | Target for proceeding |
| --- | --- | --- |
| UG1 Readiness comprehension (SM9) | T7 | **No critical misread**: a conditional estimate treated as orderable, the BOM as installable, or “details recorded” as readiness |
| UG2 Stop and resume | T1, T3 | Stops after the first useful output without believing the project is incomplete; on resume finds the latest output and pending edits unaided |
| UG3 Extra information placed directly | T2, T4 | Enters each new fact in its own question without opening unrelated sections; record the path |
| UG4 Unknown is not false | T3, T6 | No participant reads an unanswered rail/redundancy/scope question as “no”, or treats alternatives as a total. Record which states participants use (not answered, not decided yet) and why; there is no target to minimise them. |
| UG5 Refresh and diff | T2, T5, T9 | Regenerates and explains what changed |
| UG6 Infeasibility, contradictions and commitments | T2, T4, T9 | No participant believes hh-aid changed an answer, relaxed a constraint or changed an order |
| UG7 Library discovery | T8 | Finds a fitting starter through at least two views; states it is a placeholder; identifies starter values as assumptions |
| UG8 Release distinction | T10 | Never reads the evidence version as the target |
| UG9 Same-scenario time (SM1) | T1 against the incumbent path | Target set after the baseline |
| UG10 Trace and scale | T4, T11 | Correct explanation; time and path reported |
| UG11 Suggestion usefulness | Suggestions used, ignored or hidden, and why | Reported |
| UG12 Essentials and optional detail (A versus B) | T1–T3, half the participants in each view | Every participant finds both essentials unaided in either view. Compare how many optional facts from the brief are recorded in A and in B, and any reports of being overwhelmed. Choose the default view from this (appendix A §A3). |

A critical misread under UG1, UG2, UG4, UG6 or UG8 is a **trust failure**. It must be resolved and retested before the affected flow is accepted.

### 15.4 Author heuristic walkthroughs (not user testing)

**Method.** The same author built and reviewed the prototype against Nielsen's heuristics, §13 and appendix A. Rendering checks: screenshots in headless Chrome at 1,300 px; in a 320 px iframe, horizontal overflow was measured on every output tab, the project list, all four library views, the starter preview, a from-scratch workspace and a two-group workspace. Results are design-defect findings only.

Revision 1 findings HW1–HW11 are kept in git history at `5a20827`. HW1–HW8 were fixed there. HW11 (only one quantity was traceable) is **fixed** in revision 2: every quantity opens its own trace. HW9 and HW10 remain open.

Revision 2 findings (dispositions updated for revision 3):

| # | Finding | Heuristic / requirement | Severity | Disposition |
| --- | --- | --- | --- | --- |
| HW12 | The first ranking of suggested questions surfaced profile-derived inputs before decisive ones | Match with real world; help | Major (usefulness) | Revision 3 ranks by what an answer unblocks and the **actual quantity swing across current alternatives and ranges** (“deciding could change leaf-to-spine links (544 to 768)”). Still unvalidated: UG11. |
| HW13 | "Rests on 7–8 assumptions" on spine lines counts every transitive input, so the number can feel like noise | Aesthetic and minimalist design | Open risk | Kept for honesty. Candidate: group by source ("profile: 2 · policy: 3"). Test in T6. |
| HW14 | After a count change, every line is correctly stale and the whole table turns amber, so the signal weakens | Visibility of status | Minor | The status line names the changed detail and counts lines. Keep, and observe in T7. |
| HW15 | An answer kept across a change displayed as “Unknown” | Visibility of status; error prevention | Major | Fixed in revision 2. Revision 3 has no approach switch; inapplicable fields show a reason and keep their answer. |
| HW16 | Number fields save on blur or Enter, not per keystroke; users may not notice the save point | Visibility of status | Minor | Each save is announced ("Saved; not yet in an output"), and the status bar counts edits. Observe. |
| HW17 | On narrow screens the outputs are far below the details panel | Flexibility | Minor | Skip links added. A tabbed "Details / Outputs" toggle on narrow screens is a candidate. |
| HW18 | The disabled “Revalidate” button did not say what is missing | Help users recognise | Minor | Fixed in revision 3: an inline reason appears beside it. |
| HW19 | Removing an order record uses a browser `confirm()` | Error prevention | Minor (mock) | The text names the affected lines. Product: an accessible dialog. |
| HW9 | Evidence/target banner on every screen (banner blindness) | Minimalist design | Open risk | Kept (S). T10/UG8. |
| HW10 | "Exact" beside "conditional estimate" may read as a contradiction | Match with real world | Open risk (critical if misread) | T7/UG1 |

Revision 3 and 3.1 findings:

| # | Finding | Heuristic / requirement | Severity | Disposition |
| --- | --- | --- | --- | --- |
| HW20 | A from-scratch project shows “6 assumed” before the user answers anything (project-level spine and uplink defaults), which may read as hh-aid having guessed | Visibility of status; match with real world | Minor | Open. Candidate: count project defaults only once an output uses them. Observe in T1/T3. |
| HW21 | Library buckets appeared in first-seen order (“65–256” before “Up to 64”) | Consistency | Minor | Fixed: defined bucket order per view. |
| HW22 | Wrapped link-style buttons in the suggestion list were centre-aligned | Aesthetic | Minor | Fixed. |
| HW23 | With undecided choices that do not change any number (128 servers), the “alternatives” note still appears | Minimalist design | Open | Kept: it explains why lines are single numbers. Observe in T1. |
| HW24 | With two undecided dimensions, alternative labels get long (“dual-homed pairs · rack-local leaves / dual-homed pairs · shared leaves”) | Recognition; minimalism | Open risk | Candidate: a small matrix view. T6/UG4. |
| HW25 | The Links tab shows patterns for the first alternative only | Visibility of status | Minor | Labelled on screen; open. |
| HW26 | “Not checked: redundancy” remains when rail-optimized is chosen | Match with real world | Minor | Accurate (redundancy still unanswered) but possibly confusing; observe in T3. |
| HW28 | (Lead review) On a 1,400 × 1,000 first entry, count and endpoint type were not visible together beneath the guidance, counters and group metadata | Recognition; visibility | Major | Fixed in revision 3.1 (§2.1, row 1). Measured: both visible with the hint and project header, no scroll at 1,400 × 1,000; at 390 × 844 after an automatic scroll to the details heading. |
| HW29 | Lines whose numbers were identical across the evaluated alternatives listed rail preference and redundancy as “Not checked” | Match with real world | Minor | Fixed: “Undecided: … (same result under every alternative evaluated here)”. |
| HW27 | An endpoint-group section has 12 questions, although only two are needed for a first BOM | Progressive disclosure (appendix A E4) | Open risk | Revision 3.1: essentials together at the top, a one-line hint, the tally moved down, conditional first-entry scroll, and alternative B (collapsed optional groups) available in the same workspace. UG12 compares them. |

**Critical trust/comprehension failures (criterion 4).** None can be rated critical without users. Open risks: HW10, HW9, HW13, HW24, HW27. An independent heuristic pass and a sponsor review of revision 3.1 are requested when lead lifts the hold.

## 16. Vocabulary and contracts with D01

Terms adopted in revision 1 are unchanged (D01 [PR #23 @ `3d313fe`](https://github.com/afewell-hh/hh-aid/blob/3d313fe53bf8d3060751694e6c7185803c316a66/docs/design/domain-model.md); [#8 6715165096](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6715165096)). Both drafts are under review.

| D02 concept | D01 term | Note |
| --- | --- | --- |
| Line readiness | Claim scope plus precision | §5.1 |
| Package readiness | `procurement-candidate` / `procurement-approved` | §5.1 |
| Answer state | Origin `unknown`/`assumed`/`user`/`derived`; `conflicting`/`stale` flags; not-applicable with reason | §5.2 |
| Sections and fields | Questions with applicability predicates, dependencies and default proposals (D01 §3) | §6.3 relies on these directly |
| Stale lines | Invalidation procedure: transitive dependents marked stale, candidate regenerated, before/after shown (D01 §3) | §6.6 |
| Evidence vs target | `EvidenceSnapshot` vs `TargetObservation`; `unknown-currentness` | §11 |
| Release impact | changed / unchanged with evidence / unknown-uncovered, plus blocked | §11 |
| Trace | Stable aggregate demand IDs | §8 |
| Conflict | `ConflictRecord`, candidate relaxations, demonstrated infeasible vs not proven | §9 |

**Answered by model and acknowledged by lead (working clarifications, not final D01 approval):**
1. **DetailsSnapshot** ([6718064248](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6718064248), lead [6718071380](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6718071380)). The “details rX” label is an immutable, separately identified snapshot that can be partial and saved without generating. Each output binds to its snapshot ID and digest, and a run started on r7 finishes against r7. The prototype's details revision follows this.
2. **One candidate with mixed per-scope results** (same comment). Estimated, not-estimated and conflict-suspended scopes coexist. Partial subtotals must not look like complete totals, and old outputs stay tied to their revision. D02's BOM summary counts each state separately.
3. **Presentation grouping is D02-owned metadata** keyed by stable question IDs (same comment). Collapsing or moving sections, including alternative B's collapsed groups, must not erase answers or change applicability or calculation. The prototype's view switch changes presentation only.
4. **Independent scoped answers, overlap and starters** ([6718326881](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6718326881), lead [6718550737](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6718550737)):
   - counts name their scope, and rack information describes the same inventory rather than adding to it;
   - a profile disagreeing with a supplied answer creates a ConflictRecord;
   - starters have a stable identity and immutable revisions, with views as many-to-many discovery metadata;
   - copied starter facts are **inherited assumptions pending confirmation**, with source lineage, never relabelled as supplied;
   - source approvals and evidence are not inherited.

   D02 §6.8 and appendix A §A4 follow this.

**Still with model** (lead asked for a short clarification in [6718550737](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6718550737)):
- where “not decided yet” (asked) provenance belongs while the value stays unknown;
- how conditional alternatives in one output keep their own assumptions and validation status without becoming silently selected branches.

D02's current behaviour is presentation-only for both and will follow model's answer.

## 17. Decisions and questions

| ID | Question | Owner | Safe interim treatment |
| --- | --- | --- | --- |
| Q-UX-1 | What may partner SEs see or edit? | Sponsor | Show scope; confirm before sharing |
| Q-UX-2 | Which claim must the first slice reach? | Sponsor + D06 | Design supports all; nothing implies orderable |
| Q-UX-3 | Which scenario anchors the first evaluation? | Sponsor | From-scratch rail story for T1–T6; library task T8 for breadth |
| Q-UX-4 | May the sponsor review revision 3 and introduce 3–4 SEs (R01 §9 screening)? | Sponsor | Heuristic evidence only until then |
| Q-UX-5 | Does release review need an approver when every item is unchanged with evidence? | Sponsor + ops | Show review pending; no auto-approval |
| Q-UX-6 | May customers receive trace text directly? | Sponsor | Copyable text with assumptions |
| Q-UX-7 | Optional groups shown (A) or collapsed to headings (B)? Both are in the same workspace; decide with SE sessions (UG12). | Sponsor, after sessions | A by default as a hypothesis; B available behind the view switch |
| Q-UX-8 | Library curation, publishing and update mechanics | Deferred (sponsor decided placeholders now, same-tool authoring later) | Placeholders only; no updates propagate |
| Q-UX-9 | Which views should the library keep beyond the four current categories (for example vendor, budget band), and when should it move from tabs to multi-select facets? | Sponsor | The four sponsor categories as tabs |

## 18. Acceptance criteria and evidence (#9)

| Criterion | Evidence | Status |
| --- | --- | --- |
| Persistent, non-linear BOM-first workspace: minimal starter, editable details panel, save/resume/refine/regenerate across sessions; three scenario types; B200 not a fixed schema; estimate, next question, traceability, infeasibility, input-change impact, latest-release refresh; map and installation as later stages | §2, §6 (including §6.1 independent questions and §6.8 library), §7, §8–§11; appendix A; walkthrough; `prototype-check.html` | Draft complete; **untested with users** |
| Assumptions, unknowns, stale outputs, confidence and completeness visible; table/search/filter/summary beyond a giant graph | §5, §6.6, §12 | Draft complete. Per-link rows and CSV not built. |
| Accessibility, error recovery, task scripts, measurable goals | §13, §14, §15.2–§15.3 | Draft complete |
| Real sponsor/user feedback; heuristic vs testing distinguished; critical trust failures resolved | §2 (actual sponsor feedback on revisions 1 and 2), §15.1, §15.4 | Sponsor feedback recorded and addressed. **No SE feedback.** HW9, HW10, HW13, HW24, HW27 open. |
| Facts, hypotheses, intent and questions separated; versions; reproduction | §1, §19 | Draft complete |
| Independent disposition; sponsor/domain decisions | — | **Pending** |

## 19. Reproduction and limitations

```sh
python3 -I docs/design/experience-design/fixture-check.py   # prints: D02 fixture arithmetic passed
open docs/design/experience-design/walkthrough.html          # any modern browser; no network or backend
# Facilitator deep links: walkthrough.html#demo-s1, #demo-s2, #demo-s3, #scratch, #library
# Automated interaction check (Chrome; file iframes need this flag):
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --allow-file-access-from-files \
  --virtual-time-budget=8000 --dump-dom docs/design/experience-design/prototype-check.html | grep -E 'ALL PASS|FAIL'
```

**What is real in the prototype:**
- from-scratch entry (alternative A), saved projects, sessions and the resume summary;
- the starter library: four views over four placeholder starters, preview, and customise as assumptions;
- endpoint groups (mixed inventory, up to three), with independent questions; radios with no default, “Not decided yet”, and Clear answer;
- the essentials block, and the A/B view switch for optional groups;
- the details panel with origins, Confirm and Don't assume; applicability reasons; Find a detail;
- generation by answer-driven packing and placement policies, with alternatives for undecided choices and ranges for count ranges;
- populated-versus-capacity handling (derived count, explicit full-rack assumption, unused positions, mismatch, over-capacity);
- network-membership alternatives for groups with undecided networks;
- contradictions (count versus racks, scope versus use) and “not modelled” combinations (rail with dual-homing);
- Not-estimated gating and staleness;
- a trace for every quantity, with copy;
- conflicts with Preview and Use as my answer;
- order records and the locked-spine conflict;
- revision diffs, and history with undo;
- link patterns with filter and the rail locator;
- the placeholder release review and revalidation.

**What is mock:**
- the planning policies are illustrative, on hypothetical hardware;
- library starters are placeholders; there is no curation, versioning or update flow;
- release rows are examples;
- no approvals, packages, per-link rows, CSV, connection map or customer export (copy only);
- storage is per-browser `localStorage`, and the prototype says when it is unavailable.

**Limitations:**
- **No SE interviews or usability tests.** Sponsor feedback exists for revisions 1 and 2 only; revisions 3 and 3.1 are unreviewed.
- The six sources are guidance and adjacent-domain research, not evidence about SEs (appendix A).
- No screen-reader testing.
- The 320 px check is an overflow measurement in an iframe, not a device test.
- No upstream, hardware or solver execution.
- Question ranking and display rules are proposals, not specified algorithms.
