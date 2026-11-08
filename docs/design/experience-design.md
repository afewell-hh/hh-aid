# D02: BOM-first planning workspace (low-fidelity design draft)

| Field | Value |
| --- | --- |
| Issue | [#9 D02](https://github.com/afewell-hh/hh-aid/issues/9). Assignments: [6715064986](https://github.com/afewell-hh/hh-aid/issues/9#issuecomment-6715064986) (BOM-first design), [6717783503](https://github.com/afewell-hh/hh-aid/issues/9#issuecomment-6717783503) (sponsor-feedback revision) |
| Author | **t5 / ux** (AI agent). Not self-approved. |
| Reviewers | t2 / scout, t9 / ops, sponsor, once lead dispatches them. Vocabulary reconciliation with D01 (t10 / model) is required before acceptance (§16). |
| Status | **Revision 2.** It responds to actual sponsor feedback on revision 1 (§2). The sponsor gave feedback on the revision 1 walkthrough. **No SE usability testing has taken place**, and revision 2 has not been shown to the sponsor. |
| Companion artifacts | [walkthrough.html](experience-design/walkthrough.html): a self-contained, clickable, low-fidelity workspace prototype on synthetic data. [fixture-check.py](experience-design/fixture-check.py): an independent check of the fixture arithmetic. [prototype-check.html](experience-design/prototype-check.html): an automated interaction check of the prototype. |

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
| **S** | Sponsor decision or actual sponsor feedback (main `5c64850`, `9f6194b`) |
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

### 6.1 Minimal starter

One screen, used only to create a project:
- project name;
- "What do you know now?": rail-based servers / rack-based placement / redundant endpoints / **not sure yet** (an empty workspace);
- the customer request text, kept as written;
- the minimum for that approach: the endpoint count (or rack count) and the endpoint profile; a custom profile adds link count and rate.

Every input may be left blank. Buttons: "Create workspace and generate first BOM" and "Create workspace without generating". The starter says: *"This is the only guided step… Finishing the starter does not finish the project."* The minimum is per approach and per requested output, not the questionnaire's universe (S).

### 6.2 Workspace layout

| Region | Content |
| --- | --- |
| Project header | Name, visibility, session number, saved state, **Save and close**, "Installing on" and "Shown output built from evidence", currentness banner |
| Resume banner (on return) | "Welcome back — session N. Latest output: BOM revision R (details rX). K detail edits not yet in an output. Pick up anywhere; nothing needs finishing." It can be dismissed. |
| Details panel (left; stacked first on narrow screens, with skip links) | Details recorded, Find a detail, optional suggested questions, detail sections |
| Outputs (right) | Output status and **Generate**, then tabs: BOM · Changes · Revisions and history · Links · Release · Later stages |

On wide screens the details panel scrolls independently, so details and outputs stay visible together (S).

### 6.3 Details panel

- **Sections are disclosures**, opened in any order. Each summary shows its own supplied/assumed/unknown counts. Proposed sections: Request and scope; Endpoint profile; Quantity; Rails and planes; Racks and placement; Redundancy and topology; Switch profiles; Failure and oversubscription; Cabling; Installation target and evidence.
- **Applicability-driven.** A section or field appears only when its applicability predicate holds for the approach (D01 §3 "applicability predicates"). Inapplicable sections are listed with the reason ("used only by rack-scale placement planning"). Answers in them are kept if the approach changes.
- **Every field shows its origin.** Fields can be supplied, assumed (with its source), unknown or conflicting. Assumed values offer **Confirm** (creates a supplied answer) and **Don't assume** (an explicit unknown). Supplied values offer **Use default**.
- **Find a detail.** One search box covers every field label, help text and section. It lists matches, including inapplicable ones marked as such, and jumps to the field, so users never step through unrelated questions.
- **Edits save immediately** and create a new details revision. They reach outputs only when the user generates. The UI says so.
- **Network scope is an explicit field.** The approach's network is the default (`assumed`). Added networks appear as "Not estimated" lines. Removed ones are listed as "Out of scope", never as 0.

### 6.4 Generated outputs

- **Generate** is always available once an approach is chosen. It shows "Generate revision N+1 from current details" or "Up to date". Generation computes every line it can. Lines whose required inputs are unknown say what they need. Lines blocked by a conflict are suspended; the others keep their values.
- Each output revision records its **session, details revision, evidence snapshot and target**. Older revisions stay read-only and can be compared.
- **Later stages** (connection map, procurement package, installation package) are shown as their own outputs with their prerequisites. They are never prerequisites for the BOM.

### 6.5 Suggested questions (optional)

A small, hideable list of up to four detail links, each with a reason: "blocks 3 lines", "7 lines rest on this assumption", "not yet checked by 2 lines". There is also "Copy open questions for the customer". The proposed product ranks by **quantity swing and claim unblocking** (D01 §3 H). The prototype approximates this: it weights the number of affected lines by a hand-set swing estimate per question. That approximation is not a validated ranking (T3/UG4). Suggestions never block anything, and nothing is re-asked.

### 6.6 Sessions, revisions and staleness

| Concept | Behaviour (H) |
| --- | --- |
| Details revision (`r12`) | Increments on every answer, lock or target change. History keeps who, when (session) and before/after. **Undo** creates a new details revision; nothing is erased. |
| Output revision (`revision 3`) | Immutable. It cites its details revision, session, evidence and target. |
| Stale | After an edit, each line of the latest output whose dependencies include the changed detail is marked "stale — changed: <detail>". Unaffected lines say nothing. The status bar summarises: "2 edits since this output: spine-failure policy — 4 lines marked stale; the other lines are unaffected." |
| Session | Save and close ends a session. Resume starts the next one and shows the resume banner. Sessions carry no completion state. |
| Diff (Changes tab) | Pick any two revisions. It shows a summary of quantity deltas and changed/unchanged counts; detail changes between their details revisions; the evidence change; changed lines with reasons ("suspended by conflict", "rests on 8 → 7 assumptions"); and unchanged lines collapsed. |

### 6.7 Scenario plug-in model

The interaction is common; the scenario-specific parts are data and policies:

| Plug-in | Examples in the prototype | Supplies |
| --- | --- | --- |
| **Approach** (planning policy) | rail-based servers (R04 S02/S03); rack-local placement (R04 S06-1/S06-2); redundant endpoints with ESLAG pairs on mesh or leaf-spine (R02 C03/C07) | Applicable sections, required inputs per line, derivations, conflicts, link patterns |
| **Endpoint profile** | B200 HGX-class (sponsor); NVL72-style tray; general 2 × 25G server; **custom** (any vendor) | Default link count and rate, with source |
| **Switch profiles** | Hypothetical H400 / 64 × 800G; hypothetical 48 × 25G / 32 × 100G; "other (needs catalog evidence)" | Port modes and capacities; "other" makes dependent lines "Not estimated" |
| **Network roles** | backend, frontend, storage, in-band management | Scope; the approach's role is the default |

A first implementation slice can ship one approach without changing the workspace, sections model, readiness language or revision model (S: "must not hard-code the overall product around B200").

## 7. Three fixtures through the same workspace

All counts are checked by `fixture-check.py` and reproduced by the prototype (`prototype-check.html`).

### 7.1 F1: rail-based servers (B200 is one profile)

Starter: "128 B200 HGX servers", profile B200 (8 × 400G). First output (revision 1):

| Line | Quantity | Rests on (examples) |
| --- | --- | --- |
| Endpoint-to-leaf links (400G) | **1,024** | links per endpoint, link rate (from profile) |
| Leaf switches | **16** | + plane count, leaf-per-rail policy, leaf profile |
| Leaf endpoint cages (2 × 400G) | **512** | as above |
| Endpoint cable construction | **either** 512 split assemblies **or** 512 2-port modules + 1,024 endpoint modules + 1,024 fibers | not checked: construction, reach |
| Spine switches | **8** | + spine profile, D/U limit, spine-failure policy |
| Leaf-to-spine links (800G) | **512** (4 per pair) | as above |
| Leaf-to-spine cable construction | **either** 512 integrated **or** 1,024 modules + 512 fibers | not checked: construction, reach |
| Switch OOB management ports | **24** (external dependency) | as spines |

### 7.2 F2: rack-based placement

Starter: "eight NVL72 racks", profile NVL72-style tray (4 × 400G, 18 trays per rack assumed; tray generation unverified per R04 §S06). Sections "Racks and placement" appear and "Rails and planes" do not.

| Line | Quantity | Note |
| --- | --- | --- |
| Tray-to-leaf links | **576** | 8 racks × 18 trays × 4 |
| Rack-local leaves | **32** | 4 per rack; placement overrides port minimisation (R04 S06-1) |
| Leaf endpoint cages | **288** | 9 per leaf; **736 growth-reserved** (23 per leaf), shown as an intentional exception |
| Spines | **5** (2 links per pair) | 10 active uplinks per leaf assumed (R04 S06-2); normal D/U 9/10 |
| Leaf-to-spine links | **320** | — |
| OOB ports | **37** | — |

The same "full bandwidth after one spine failure" answer that is impossible for F1 is feasible here with **10 spines**, because the leaves are underfilled. The policy decides; the UI just explains.

### 7.3 F3: redundant endpoints on mesh or leaf-spine

Starter: "40 general-purpose servers, dual-homed, 2 × 25G", profile general server. "Redundancy and topology" appears. The topology is unknown, so outputs show **separate alternatives**:

| Line | Quantity |
| --- | --- |
| Endpoint-to-leaf links (25G) | **80** |
| Leaf switches | **2** (one ESLAG pair). Flag: "ESLAG on this leaf profile: unverified (R02 C03, K09)" |
| Leaf endpoint ports | **80** (16 unused) |
| Spines | **Mesh: 0** · **Leaf-spine: 2** |
| Inter-switch links (100G) | **Mesh: 8** · **Leaf-spine: 16** |
| Inter-switch cables | four separate totals (topology × construction) |
| OOB ports | **Mesh: 2** · **Leaf-spine: 4** |

There is no D/U limit by default (`unknown`), so lines say "Not checked: D/U limit"; the trace shows normal D/U 5/4. Setting the limit to 1 produces a conflict on both alternatives. Mesh is "conditional (R02 C07); no performance or failure guarantee". At 60 servers: 4 leaves; mesh 12 links (2 per leaf pair) versus leaf-spine 2 spines.

### 7.4 Gating without invention

- With the count blank, links, leaves and spines all say "Not estimated — needs: endpoint count".
- A custom profile without a link count is not estimated.
- "Two planes" with a one-link-per-rail profile is not modelled. The line says why and cites R04 S05/S06-4; no number is produced.
- "Other leaf profile" makes leaf-dependent lines need catalog evidence.

## 8. "Why this number?" (quantity trace)

**Every** quantity is a button that opens its own derivation (revision 1 only had the spine trace; HW3/HW11 fixed). Example for 8 spines:

```
8 spines [exact under stated assumptions · conditional estimate]
- 8 spines = smallest S that divides 32 uplinks per leaf evenly, with 64·S ≥ 512 leaf uplinks
  (spine profile: assumed · spine-failure policy: assumed)
  - 16 leaves = 2 groups × 8 rails (one leaf per rail per group)
    - 2 first-hop groups = ceil(128 endpoints ÷ 64 endpoint slots per leaf) (endpoint count: supplied)
      - 64 slots per leaf = 32 cages × 2 per cage at 400 Gb/s (leaf profile: assumed)
  - 64 ports per spine
  - normal D/U on the busiest leaf = 1 (D/U limit: assumed)
Counts: requirement dem:spines (stable aggregate demand ID; not yet expanded to instances)
What would change it: links per endpoint · link rate · plane count · … · spine-failure policy
```

Requirements (H):
- Each node shows input origins, with a **Change** action that opens that field.
- The trace names the stable demand ID counted (D01 §4–§5), so the later connection map can reconcile line by line.
- It can be copied as plain text with its assumptions, revision and evidence.
- A "Not estimated" line's explanation lists the missing inputs and says hh-aid does not invent quantities.

## 9. Infeasible requests and conflicts

Session 2 of the demo sets "after one spine failure: full bandwidth" on F1:

```
Cannot satisfy: D/U ≤ 1 after one spine failure   [demonstrated infeasible under these inputs]
Because: each full leaf has D = 25,600 Gb/s and U = 25,600 Gb/s. Losing 1 of S spines leaves U·(S−1)/S,
  so D/U after the loss exceeds 1 for every S. Routing cannot add missing cut capacity (R04 T06, N04).
Conflicting inputs: spine-failure policy (supplied) · leaf profile (assumed)
Candidate relaxations (nothing relaxed automatically; not checked for minimality):
  1. Accept D/U ≤ 8/7 after a spine loss          [Preview] [Use as my answer]
  2. No spine-failure requirement                  [Preview] [Use as my answer]
  3. Fewer endpoint cages per leaf — not modelled in this prototype
  4. A leaf profile with more uplink capacity (needs catalog evidence)   [Go to detail]
Suspended lines: spine switches, leaf-to-spine links, leaf-to-spine cables, OOB ports (now a lower bound). Every other line keeps its value.
```

- **Preview** computes the effect without changing anything, for example "spines — suspended → 8 · leaf-to-spine links — suspended → 512 · OOB ≥ 16 → 24 · no conflicts".
- **Use as my answer** records a supplied answer only. The conflict remains until the user generates.
- The headline distinguishes **demonstrated infeasible** from **not proven feasible** (for example, when no even spine allocation was found but non-uniform ones were not searched).
- OOB becomes a labelled **lower bound** (≥ 16) while the spine count is open.
- Fields that feed the conflict show a "conflicting" chip in the details panel.

## 10. Multi-session refinement, commitments and regeneration

Demo for the moderated walkthrough (the order is a facilitator script, not product navigation):

| Session | User action | System response |
| --- | --- | --- |
| 1 | Starter → first BOM (revision 1). Opens a trace. Save and close. | Project listed with "latest output revision 1". |
| 2 | Resume. Opens **Failure and oversubscription** directly (or finds "spine"). Sets full bandwidth. | Resume banner. Spine-dependent lines turn stale; links and leaves do not. |
| 2 | Generate (revision 2). | Conflict (§9). Other lines kept. Diff: spines → suspended. |
| 2 | Previews and uses 8/7. Generate (revision 3). | Conflict resolved. Diff with revision 2: spines suspended → 8. Compared with revision 1, the spine count is unchanged and rests on one fewer assumption. |
| 3 | Records orders: 16 leaves, 8 spines. Save and close; resume. In **Quantity**, sets 128 → 136. | 3 edits since the output. 8 lines marked stale. |
| 3 | Generate (revision 4). | Endpoint links 1,088 (+64); leaves **24 = 16 ordered + 8 proposed**; cages 544 (+32). **Conflict:** "8 ordered spines × 64 = 512 ports, all needed; 16 leaves × 32 + 8 leaves × 4 = 544 uplink ports: 32 more than the locked spines have." |

Rules (H):
- Ordered quantities are never re-optimised or removed. Surplus or shortfall needs an explicit disposition.
- Removing an order record requires a confirmation naming the affected lines, and stays undoable in history.
- An override that conflicts with a rule is stored as `supplied`. It survives regeneration, and its conflict re-appears until resolved.
- Candidate relaxations for the locked-spine conflict:
  - add spine capacity and rebalance — an approved-cabling change (R06 class T2);
  - take uplinks from existing leaves, giving D/U 16/15, which breaks the supplied policy;
  - a different packing policy.

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
| "Where is endpoint X?" | Search by ID, rail, group, rack, cage | Rail locator: "endpoint 77 rail 5 → leaf-B-r5 cage 7 lane 2". The locator is rail-approach only. |
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
| Heuristic walkthrough | An agent or reviewer, against Nielsen heuristics and §13 | Design-defect findings only | Author passes on revisions 1 and 2 (§15.4). Independent pass requested. |
| Sponsor walkthrough | Sponsor | Domain-fit feedback, not usability evidence | **Revision 1: actual feedback recorded** (§2, main `9f6194b`). Revision 2 not yet reviewed. |
| Task-based usability test | Real SEs (R01 §9 screening) | Usability evidence, qualitative at n≈3–4 | **Not done.** No recruitment has taken place. |
| Automated prototype checks | Scripts | That the prototype computes and behaves as specified; not usability | `fixture-check.py`, `prototype-check.html` (§19) |

### 15.2 Task scripts (rewritten for the workspace)

**Before any session,** someone other than the facilitator writes the expected answers (topo or check; R01 §7). Participants start from the project list. Tasks T1 and T3 may be split across two sittings, or simulated with the resume presets.

| ID | Task (participant instructions) | Expected answer source | Records |
| --- | --- | --- | --- |
| T1 | "A customer emailed '128 B200 HGX servers'. Get something you could discuss on a call, then stop." | §7.1 | Time to first output; whether they stop without trying to complete other sections; assumptions noticed |
| T2 | "Why 8 spines? What would change it?" | §8 | Explanation correctness; path |
| T3 | "It's a week later. Reopen the project. What's changed since you left, and what is still assumed?" | Resume banner, history | Finds the project and latest output; states the assumptions |
| T4 | "The customer now says the fabric must keep full bandwidth if a spine fails. Record that and update the BOM." | §9 | Goes **directly** to the relevant detail (search or section) without stepping through unrelated sections; regenerates; recognises infeasibility; picks a way forward |
| T5 | "What changed between the last two versions, and why?" | Changes tab | Explains the diff, including "quantity unchanged, fewer assumptions" |
| T6 | "For each line, could you put this number in a quote? Order it? Install from it?" | §5.1 | Readiness comprehension (SM9); critical misreads |
| T7 | "16 leaves and 8 spines are already ordered. The customer now wants 136 servers. Refresh the BOM." | §10 | Finds the conflict; does not assume ordered parts change |
| T8 | "Plan a different customer: eight NVL72-style racks" (or "40 dual-homed general servers"). | §7.2 / §7.3 | Uses the same workspace without help; notices which sections apply; reads alternatives as separate totals |
| T9 | "A new Hedgehog release is out. Is this design still good to install on it?" | §11 placeholders | Distinguishes the evidence version from the target; finds changed and unknown items |
| T10 | "Find which leaf endpoint 77's rail-5 link uses." | F1 allocation | Time; search/filter path; correctness |

### 15.3 Usability goals (H; per participant; small samples are learning evidence only)

| Goal | Measure | Target for proceeding |
| --- | --- | --- |
| UG1 Readiness comprehension (SM9) | T6 answers | **No critical misread**: treating a conditional estimate as orderable, the BOM as installable, or "details recorded" as readiness |
| UG2 Stop and resume | T1 and T3 | Participant stops after the first useful output without believing the project is incomplete or failed; on resume, finds the latest output and pending edits unaided |
| UG3 Direct access | T4 | Reaches the relevant detail without opening unrelated sections; record the path (search, section, suggestion or trace "Change") |
| UG4 Refresh and diff | T4, T5, T7 | Regenerates and explains what changed and why |
| UG5 Trace usefulness | T2 | Correct explanation without help |
| UG6 Infeasibility and commitments | T4, T7 | No participant believes hh-aid relaxed a constraint or changed an order |
| UG7 Scenario breadth | T8 | Completes a first output in a second scenario without facilitator help; no comment that the tool "is for B200" |
| UG8 Release distinction | T9 | Never reads the evidence version as the target, or the design as current while review is pending |
| UG9 Same-scenario time (SM1) | T1 against the incumbent path | Target set after the baseline |
| UG10 Scale navigation | T10 | Time and path reported |
| UG11 Suggestion usefulness | Whether suggestions were used, ignored or hidden, and why | Reported; informs the ranking design (T3/UG4 in revision 1) |

A critical misread under UG1, UG2, UG6 or UG8 is a **trust failure**. It must be resolved and retested before the affected flow is accepted.

### 15.4 Author heuristic walkthroughs (not user testing)

**Method.** The same author built and reviewed the prototype against Nielsen's heuristics and §13. Rendering checks: headless Chrome at 1,300 px, and in a 320 px iframe, measured for horizontal overflow on every tab, the project list and the starter. Results are design-defect findings only.

Revision 1 findings HW1–HW11 are kept in git history at `5a20827`. HW1–HW8 were fixed there. HW11 (only one quantity was traceable) is **fixed** in revision 2: every quantity opens its own trace. HW9 and HW10 remain open.

Revision 2 findings:

| # | Finding | Heuristic / requirement | Severity | Disposition |
| --- | --- | --- | --- | --- |
| HW12 | The first ranking of suggested questions surfaced profile-derived inputs (links per endpoint, link rate) before the spine-failure policy and cable construction, because it only counted affected lines | Match with real world; help | Major (usefulness) | Weighted by a hand-set swing estimate per question. Still unvalidated: UG11 and T4. |
| HW13 | "Rests on 7–8 assumptions" on spine lines counts every transitive input, so the number can feel like noise | Aesthetic and minimalist design | Open risk | Kept for honesty. Candidate: group by source ("profile: 2 · policy: 3"). Test in T6. |
| HW14 | After a count change, every line is correctly stale and the whole table turns amber, so the signal weakens | Visibility of status | Minor | The status line names the changed detail and counts lines. Keep, and observe in T7. |
| HW15 | A switch profile answered under one approach displayed as "Unknown" after changing approach, although the answer was kept | Visibility of status; error prevention | Major | Fixed. The value stays selected, labelled "not offered for this approach". The dependent lines explain why. |
| HW16 | Number fields save on blur or Enter, not per keystroke; users may not notice the save point | Visibility of status | Minor | Each save is announced ("Saved; not yet in an output"), and the status bar counts edits. Observe. |
| HW17 | On narrow screens the outputs are far below the details panel | Flexibility | Minor | Skip links added. A tabbed "Details / Outputs" toggle on narrow screens is a candidate. |
| HW18 | The disabled "Revalidate" button does not itself say what is missing | Help users recognise | Minor | The note below the table explains it. Product: an inline reason on the button. Open. |
| HW19 | Removing an order record uses a browser `confirm()` | Error prevention | Minor (mock) | The text names the affected lines. Product: an accessible dialog. |
| HW9 | Evidence/target banner on every screen (banner blindness) | Minimalist design | Open risk | Kept (S). T9/UG8. |
| HW10 | "Exact" beside "conditional estimate" may read as a contradiction | Match with real world | Open risk (critical if misread) | T6/UG1 |

**Critical trust/comprehension failures (criterion 4).** None can be rated critical without users. Open risks: HW10, HW9, HW13. An independent heuristic pass and a sponsor review of revision 2 are requested.

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

**Possible contract gaps (questions for t10 / model, posted on #8; not conflicts):**
1. **Details revision.** The workspace cites "output revision N from details rX". Does D01 identify an answer-set revision (a snapshot of current AnswerRecords) that each generated revision references, or should it be derived from supersession links?
2. **Partial generation.** One generation run yields estimated, not-estimated and conflict-suspended lines together. Is that one candidate revision with per-line results, as D02 assumes?
3. **Presentation grouping.** Is question-to-section grouping presentation metadata (D02-owned), or part of the question definition?

D02 does not ask for a D01 rewrite. Model indicated persistent partial state may already cover this.

## 17. Decisions and questions

| ID | Question | Owner | Safe interim treatment |
| --- | --- | --- | --- |
| Q-UX-1 | What may partner SEs see or edit? | Sponsor | Show scope; confirm before sharing |
| Q-UX-2 | Which claim must the first slice reach? | Sponsor + D06 | Design supports all; nothing implies orderable |
| Q-UX-3 | Which scenario anchors the first evaluation (now: one of three fixtures plus breadth task T8)? | Sponsor | Rail fixture for T1–T7; T8 for breadth |
| Q-UX-4 | May the sponsor review revision 2 and introduce 3–4 SEs (R01 §9 screening)? | Sponsor | Heuristic evidence only until then |
| Q-UX-5 | Does release review need an approver when every item is unchanged with evidence? | Sponsor + ops | Show review pending; no auto-approval |
| Q-UX-6 | May customers receive trace text directly? | Sponsor | Copyable text with assumptions |
| Q-UX-7 | What is the minimum starter per approach (count + profile proposed), and should "Not sure yet" exist? | Sponsor | As proposed |

## 18. Acceptance criteria and evidence (#9)

| Criterion | Evidence | Status |
| --- | --- | --- |
| Persistent, non-linear BOM-first workspace: minimal starter, editable details panel, save/resume/refine/regenerate across sessions; three scenario types; B200 not a fixed schema; estimate, next question, traceability, infeasibility, input-change impact, latest-release refresh; map and installation as later stages | §2, §6, §7, §8–§11; walkthrough; `prototype-check.html` | Draft complete; **untested with users** |
| Assumptions, unknowns, stale outputs, confidence and completeness visible; table/search/filter/summary beyond a giant graph | §5, §6.6, §12 | Draft complete. Per-link rows and CSV not built. |
| Accessibility, error recovery, task scripts, measurable goals | §13, §14, §15.2–§15.3 | Draft complete |
| Real sponsor/user feedback; heuristic vs testing distinguished; critical trust failures resolved | §2 (actual sponsor feedback on revision 1), §15.1, §15.4 | Sponsor feedback recorded and addressed. **No SE feedback.** HW9, HW10, HW13 open. |
| Facts, hypotheses, intent and questions separated; versions; reproduction | §1, §19 | Draft complete |
| Independent disposition; sponsor/domain decisions | — | **Pending** |

## 19. Reproduction and limitations

```sh
python3 -I docs/design/experience-design/fixture-check.py   # prints: D02 fixture arithmetic passed
open docs/design/experience-design/walkthrough.html          # any modern browser; no network or backend
# Facilitator deep links: walkthrough.html#demo-s1, #demo-s2, #demo-s3, #example-rail, #example-rack, #example-mesh
# Automated interaction check (Chrome; file iframes need this flag):
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --allow-file-access-from-files \
  --virtual-time-budget=8000 --dump-dom docs/design/experience-design/prototype-check.html | grep -E 'ALL PASS|FAIL'
```

**What is real in the prototype:**
- the starter, saved projects, sessions and resume summary;
- the details panel, with origins, Confirm, Don't assume and Use default;
- applicability and Find a detail;
- generation by three small planning policies;
- Not-estimated gating, alternatives and staleness;
- a trace for every quantity, with copy;
- conflicts with Preview and Use as my answer;
- order records and the locked-spine conflict;
- revision diffs, and history with undo;
- link patterns with filter and the rail locator;
- the placeholder release review and revalidation.

**What is mock:**
- the planning policies are illustrative, on hypothetical hardware;
- release rows are examples;
- no approvals, packages, per-link rows, CSV, connection map or customer export (copy only);
- storage is per-browser `localStorage`, and the prototype says when it is unavailable.

**Limitations:**
- **No SE interviews or usability tests.** Sponsor feedback exists for revision 1 only.
- No screen-reader testing.
- The 320 px check is an overflow measurement in an iframe, not a device test.
- No upstream, hardware or solver execution.
- Question ranking and display rules are proposals, not specified algorithms.
