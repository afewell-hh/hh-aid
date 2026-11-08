# D02: BOM-first experience design (low-fidelity draft)

| Field | Value |
| --- | --- |
| Issue | [#9 D02](https://github.com/afewell-hh/hh-aid/issues/9); lead's assignment [6715064986](https://github.com/afewell-hh/hh-aid/issues/9#issuecomment-6715064986) |
| Author | **t5 / ux** (AI agent). Not self-approved. |
| Reviewers | t2 / scout, t9 / ops, sponsor. D01 vocabulary reconciliation with t10 / model is required before acceptance (§11). |
| Status | Revision 1, low-fidelity design draft. **No user or sponsor testing has taken place.** The only evaluation so far is an author heuristic walkthrough (§10.4). |
| Companion artifacts | [walkthrough.html](experience-design/walkthrough.html), a self-contained clickable low-fidelity walkthrough on synthetic data. Open it locally in a browser. [fixture-check.py](experience-design/fixture-check.py) independently checks the fixture arithmetic. |

## 1. Scope, inputs and labels

**Question.** How does a Hedgehog SE get from a sparse request to a useful, honest BOM? How do they refine it, understand every quantity, recover from impossible requests and changes, and keep the design current with the latest Hedgehog release? Connection-map and installation handoffs come later.

**In scope:**
- task flows and screen structures;
- the readiness and state language users see;
- review patterns for large designs;
- accessibility and error-recovery requirements;
- evaluation scripts and usability goals.

**Out of scope:**
- production UI, stack or visual design;
- a solver;
- release-update mechanics (compat's #3 and the design gate decide those);
- the exact first-slice scenario or readiness level (sponsor and D06 decide).

### Inputs (exact revisions)

| Input | Revision | Used for |
| --- | --- | --- |
| Sponsor direction | main [`5c64850`](https://github.com/afewell-hh/hh-aid/blob/5c648506d0ff258f030da85741835e09dc25165b/docs/product-context.md) | Audience, BOM first, latest-release target. Overrides older proposals where they conflict. |
| R01 product discovery | [`75fe3ed`](https://github.com/afewell-hh/hh-aid/blob/75fe3edccafc756c6b92ad44dff9b71af73d3138/docs/research/product-discovery.md) | Personas P1/P2, failure modes, measures SM1–SM9, interview guide |
| R02 support contract | [`bf7437c`](https://github.com/afewell-hh/hh-aid/blob/bf7437c3fc852cfe06663073edc36a08de75efbc/docs/research/hedgehog-support-contract.md) | Capability rows C01–C21, constraints K01–K10 |
| R03 upstream reuse | [`2b54790`](https://github.com/afewell-hh/hh-aid/blob/2b547901413c00fb8d7ce3eeff7d6669f2b78135/docs/research/upstream-reuse.md) | U-gate meaning, gaps G1–G7, first-error-only diagnostics |
| R04 topology scenarios | [`49e6079`](https://github.com/afewell-hh/hh-aid/blob/49e6079a077d1d819d12485de3896a93e8371f74/docs/research/topology-scenarios.md) | S01–S06 witnesses, T01–T12, P01–P04/N01–N13 fixtures |
| R05 hardware and BOM | [`8a8fcca`](https://github.com/afewell-hh/hh-aid/blob/8a8fccac6b6d560ef17889c4819dce3b8bf19a8c/docs/research/hardware-and-bom.md) | Counting invariants, two state axes, §6 progressive readiness |
| R06 installation and lifecycle | [`5a502b2`](https://github.com/afewell-hh/hh-aid/blob/5a502b20fb5f6acdaa36512da78cb419d653470c/docs/research/installation-lifecycle.md) | Stages I1–I11, package readiness C4, identities, locked lines, change classes |

Labels used in this document:

| Label | Meaning |
| --- | --- |
| **F** | Fact stated in a cited input |
| **S** | Sponsor decision (main `5c64850`) |
| **H** | Design hypothesis or proposal from this draft. It needs user evidence. |
| **I** | Inferred intent. None about maintainers is used here. |
| **Q** | Open question |

All hardware in the fixtures is **hypothetical**: R04's H400 leaf and a 64-port 800G spine. No support, SKU or compatibility claim is made.

## 2. Design principles (H, derived from S/F)

1. **A useful BOM first, never a false one.** The first screen after a sparse request is a BOM: a short list of quantities with ranges and assumptions. It is not a form or a graph. Quantities still rest on enough topology reasoning to be traceable and to catch impossible requests (S; product-context "first BOM still needs…").
2. **Readiness is a claim about a scope, not a badge on the project.** Each BOM line, and each declared package, states what has been established and what has not (R05 §6, R06 C4). There is no global "ready" flag.
3. **Every number answers "why?"** Each quantity opens a derivation: inputs and their state, rule IDs, catalog revision, and the planning identities being counted (R05 accounting invariants; R06 §6.1).
4. **The next question is chosen by impact.** hh-aid ranks unanswered questions by how much they could move quantities or block a claim. It does not run through questions in form order (R01 FM5, A-04).
5. **Nothing changes silently.** Regeneration, release updates and overrides produce a visible diff. Locked and ordered lines are never re-optimised; a disagreement is shown as a conflict (R06 §6.4.5, R05 §6).
6. **Two versions, always visible.** Every revision shows **"Built from evidence: <snapshot>"**. The project shows **"Installing on: <target release>"**. They are allowed to differ, and that difference is always visible (S; product-context release-currency paragraph).
7. **Exceptions first at scale.** For thousands of links, the default view is summaries and exceptions, with search and filters. The full graph is never the primary review surface (R01 FM9; #9 criterion 2).

## 3. Users and context

- **Primary user: Hedgehog SE (S).** Possible access for **selected partner SEs (S)**. Persona P1/P2 from R01 (H; still unvalidated by interviews).
- **Situation (H, R01 §4):** a prospect sends one or two facts ("128 B200 HGX servers", "eight NVL72 racks"). The SE needs a credible estimate quickly, then refines it over days or weeks as answers arrive.
- **Partner access implication (H):** partner SEs may see projects, catalogs and pricing that are scoped differently from Hedgehog's. The UI must show the viewer's scope ("Visible to: Hedgehog + Partner X") on each project. Q-UX-1: what may a partner see or edit?
- **Later consumers:** designer and approver (J3/I3), procurement (P7), installer (P3), OPS (R06). They see later stages, not first-BOM prerequisites.

## 4. Readiness and state language (proposal H; input to D01)

The sponsor separates **conditional estimates**, **exact qualified quantities** and **procurement-ready packages** (S). This draft does **not** reuse R01's S3 label, and it does not put a full installation gate on the first output. Following R05 §6, each BOM line carries a scoped readiness level. Package readiness follows R06 C4.

### 4.1 Line readiness (what the quantity on this line is good for)

| Level (working name) | Established | Not established | Permitted use | Line label shown |
| --- | --- | --- | --- | --- |
| **L0 Not estimated** | The category is relevant, but there are no inputs | Everything | Prompts a question | "Not estimated — answer Q…" (never "0") |
| **L1 Conditional estimate** | Count derived under named assumptions; part *class* only | Answers marked assumed; topology choices; hardware | Early sizing; range-style conversation with assumptions listed | "Estimate: 16 (if 1 plane; 32 if 2)" |
| **L2 Exact quantity** | Topology, rail/plane/group, port and cage allocation and assembly *construction class* fixed by supplied answers. Hard-constraint checks pass at the logical layer (R04 T01–T07). | Part qualification, reach and length, support for the exact hardware | Budgetary BOM; design review | "Exact quantity · parts unqualified" |
| **L3 Qualified** | L2 plus exact SKU/revision and a recorded compatibility tuple within scope (R05 qualification tuple) | Length or route (for cables), package approval | Line can join a procurement package | "Qualified SKU · length/route open" when applicable |
| **Orderable** (package level) | All lines in a declared package exact and qualified, with lengths and branch geometry, and approved on the package hash (R06 C4) | Installation state, site binding | Hand to procurement | Package status `procurement-approved` |

Rules (H):
- A line's level is the **weakest** of its inputs, rules and evidence. The UI names what is holding it back: "Held at L1 by: plane count (assumed)".
- **Approval does not raise a level.** Approval is a separate record on an exact revision hash (R01 §5.1; R06 §6.4).
- **Package readiness** (`not-ready` / `blocked` / `procurement-candidate` / `procurement-approved`, R06 C4) is computed from its lines. It lists included and excluded lines and the blockers (`blocked_by`).
- A level can **fall**: a changed input, a release update or stale evidence moves dependent lines down, with the reason shown.
- Wiring and connection-map readiness, and installation (I5–I9), are **separate later tracks**. They are not prerequisites for L1–L3 or for procurement of a package that does not depend on them.

### 4.2 Answer and evidence states shown in the UI

These are two independent axes (R05 §2). The UI shows both as text plus an icon, never colour alone (§8).

| Axis | Values | Shown as |
| --- | --- | --- |
| Answer provenance | `unknown`, `supplied`, `assumed` (named default + version), `derived`, `conflicting`, `stale` | Chip beside each input and in each trace |
| Compatibility | `documented compatible within scope`, `documented incompatible`, `unverified`, `disputed` | Chip on part lines and qualification tuples |
| Lock / commitment | `editable`, `locked` (user), `ordered`, `delivered`, `installed` | Padlock + text; ordered or later means a locked input (R06 §6.4.5) |
| Release-impact item | `unchanged (rechecked)`, `changed`, `unknown (not checked)`, `blocked` | Release review list (§6) |

These are placeholder names until D01 settles them (§11).

## 5. Primary flow: sparse request to scoped BOM

The walkthrough uses one synthetic fixture, **F1**, with the R04 S03 assumptions. All counts are checked by `fixture-check.py`.

**F1 request (S scenario):** "128 B200 HGX servers". The sponsor's B200 profile has eight 1×400G scale-out links on eight rails (product-context). Exact OEM and NIC qualification is unknown (R05 §3).

### 5.1 Step 1: capture intent (J0/I1)

- **Single input field plus structured extraction (H).** The SE types or pastes the request. hh-aid proposes structured answers: endpoint class "B200 HGX" and count 128. Each is marked `supplied`. The source text is kept.
- hh-aid shows which **named defaults** it will apply, each `assumed`, with a version: 8 rails × 400G (sponsor B200 profile); backend scale-out only; 1 plane; one leaf per rail per first-hop group (R04 S02/S03 witness); hypothetical H400 leaf and 64-port spine; D/U ≤ 1 in normal state; uniform leaf–spine links.
- **Nothing is hidden.** "Show defaults" lists every assumption before the first BOM appears. A one-click "Change" sits on each.

### 5.2 Step 2: first useful BOM (conditional)

The BOM appears within the same screen. Lines are grouped by **network** (backend, frontend, storage, management) and then by **part role**.

| Line | Quantity | Level | Held at this level by |
| --- | --- | --- | --- |
| Backend rail leaf switches (H400-class) | **16** (32 if 2 planes) | L1 | plane count, server profile (assumed) |
| Backend spine switches (64×800G class) | **8** | L1 | spine failure policy, spine port count (assumed) |
| Server→leaf logical links (400G) | **1,024** | L1 | rails × rate (assumed) |
| Leaf endpoint cages in 2×400G mode | **512** | L1 | as above |
| Leaf→spine logical links (800G) | **512** (4 per leaf–spine pair) | L1 | spine policy |
| Endpoint cable construction | **either** 512 integrated 2×400G split assemblies **or** 512 twin-port modules + 1,024 single modules + 1,024 fibers | L1 | construction class unknown; R05 §4 C |
| Leaf–spine cable construction | **either** 512 integrated cables **or** 1,024 modules + 512 fibers | L1 | reach/construction unknown |
| Switch OOB management ports | **24** needed (16 + 8) | L1, external dependency | OOB design is external (R06 O1; R05 §2) |
| Frontend, storage, in-band management, BMC | **Not estimated** | L0 | not asked yet (never shown as 0) |
| Control node, gateways | **Not estimated** | L0 | not asked yet |

Design notes (H):
- **Alternatives, not averages.** When the construction is unknown, the line shows both constructions with exact conditional counts (R05 invariants). It never shows "~1,000 cables".
- A **summary strip** sits above the table: "10 lines · 0 exact · 0 qualified · 4 networks not estimated · 7 assumptions · 0 conflicts". It shows "Built from evidence: research snapshot 26.05 (fabric v0.144.1 / fabricator v0.51.4)" and "Installing on: latest release — **not yet verified** (#3 pending)" (S).
- The whole BOM carries the scoped label "Conditional estimate — assumptions listed — not a design, not orderable".

### 5.3 Step 3: "why this number?" (quantity trace)

Selecting any quantity opens a trace panel. Example for **8 spines**:

```
8 spines  [L1 · conditional]
= smallest S where 64·S ≥ 512 leaf uplinks AND S divides 32   (rule R04 T07 + uniform-links policy, assumed)
  512 leaf uplinks = 16 leaves × 32 uplink cages              (H400 mode, assumed)
    16 leaves = 2 first-hop groups × 8 rails                   (one leaf per rail per group, assumed)
      2 groups = ceil(128 servers / 64 endpoint slots per leaf) (128 supplied; 64 from H400, assumed)
  64 ports per spine                                           (hypothetical spine, assumed)
Counts planning identities: spine role/plane/slot IDs SP-0…SP-7 (stable, R06 §6.1)
Catalog: hypothetical-H400@fixture-1 · Rules: R04@49e6079
What would change it: spine failure policy (Q3) · spine port count · leaf uplink split
```

Requirements (H):
- The trace is a **tree** with the state of every input. Every assumed leaf node has an inline "Change" action.
- The trace names the **planning identities** counted, or "N links of class K in group G" when per-link IDs do not exist yet (Q for D01, #8 item 7). This lets the later connection map reconcile with the BOM line by line.
- "What would change it" lists the unanswered inputs that feed the number. This is the bridge to the next question.
- Copyable as text, for pasting into an email to the customer, with its assumptions included.

### 5.4 Step 4: next useful question

A ranked question queue sits beside the BOM (H). The rank is the estimated **quantity swing** plus whether the answer **unblocks a level**. Example for F1:

| Rank | Question | Why now (shown to user) | Effect if answered |
| --- | --- | --- | --- |
| 1 | Exact server and NIC configuration? (B200 1×400G vs B300-style 2×400G) | Could double backend leaves (16 ↔ 32) and links | Fixes rails, rate and plane basis |
| 2 | One plane or two? | Same; also sets failure-set policy (R04 S05) | Leaves/spines ×2 or ×1 |
| 3 | What must survive one spine failure? | Sets spine count; may be impossible (§5.6) | Fixes spine line |
| 4 | Include frontend, storage, management networks? | Four networks currently "not estimated" | Adds lines L0 → L1 |
| 5 | Cable construction and placement | Decides part classes; needed for qualified/orderable lines | Moves cable lines toward L2/L3 |

- Answering is **inline**. Each answer shows a preview diff before it is applied: "Leaves 16 → 16, spines 8 → 16, links 512 → 512". The SE can apply or discard it.
- "Skip" and "I don't know" are first-class. A skipped question keeps its default and its rank, and is not re-asked until something it depends on changes.
- Customer-facing question list: a one-click export of the open questions in plain language, for the SE to send.

### 5.5 Step 5: refined, scoped BOM

The SE supplies: B200 per sponsor profile, 1 plane, accept D/U ≤ 8/7 after one spine loss. The backend switch and link lines move to **L2 Exact quantity**. Cable lines stay at L1 until construction is chosen. Part lines remain "parts unqualified", because H400 is hypothetical. R05 §3 shows `celestica-ds5000` as a **static** mode and budget match; the UI shows it as "candidate profile — static match only, not qualified".

Scoped label (H): "Backend switch and link quantities exact for this revision · parts unqualified · cables by construction class · 4 networks not estimated".

### 5.6 Step 6: impossible request explained

The SE instead answers Q3 with "full remote bandwidth after any one spine failure". The answer is recorded as `supplied`, and the BOM shows a **conflict panel** instead of numbers for the affected lines:

```
Cannot satisfy: "keep D/U ≤ 1 after one spine failure"   [hard, supplied]
Because: each leaf has D = 64 × 400G = 25.6 Tb/s and U = 32 × 800G = 25.6 Tb/s (H400 32/32 split, assumed).
  Losing 1 of S spines leaves U·(S−1)/S < D for every S. Routing cannot add missing cut capacity (R04 T06, N04).
Conflicting inputs: failure policy (supplied) · H400 cage split (assumed) · 64 endpoints per leaf (derived)
Ways forward (each shows its own preview):
  A. Accept D/U ≤ S/(S−1) after a spine loss: 8 spines → 8/7; 16 spines → 16/15 (2 links per pair)
  B. Fewer endpoint cages per leaf (changes group size and leaf count — recompute)
  C. A leaf profile with more uplink capacity (needs catalog evidence)
Nothing has been relaxed automatically.
```

On screen, D/U is defined inline: a leaf's server-facing bandwidth divided by its working uplink bandwidth. Suspended lines (spines, leaf→spine links) appear beside the kept lines.

Requirements (H):
- Show **which hard constraints conflict**, with IDs and the inputs feeding them. Distinguish supplied answers from assumed defaults: an assumed default is the first suggested thing to change.
- Offer **minimal ways forward**, each with a preview. Never relax silently (R04 constraint register; AGENTS.md).
- Unaffected lines keep their values, so the BOM stays useful while the conflict is open.
- The same pattern covers R04 N01 (33 nodes, two rails per leaf, four leaves) and N08 (NVL72 four leaves with two disjoint planes).

### 5.7 Step 7: overrides, committed parts and regeneration

**Committed lines.** The SE records that 16 leaves and 8 spines are **ordered**: package line state `ordered` with an order reference (R05 §6). These lines become locked inputs (R06 §6.4.5).

**Input change.** The customer raises the count to **136** servers. Regeneration produces revision N+1 with a **semantic diff**:

| Change | Before → after | Detail |
| --- | --- | --- |
| Servers | 128 → 136 | supplied |
| First-hop groups | 2 → 3 | third group has 8 servers (R04 P02 full-rail-per-group policy) |
| Rail leaves | 16 → 24 (+8) | new leaves carry 8 endpoints each; 28 of their 32 endpoint cages unused (intentional) |
| Server→leaf links | 1,024 → 1,088 (+64) | existing 1,024 links keep their planning IDs |
| New leaf endpoint cages | +32 | 4 per new leaf |
| **Conflict: spine ports** | locked 8 spines = 512 ports, all used by the existing 16 leaves | the 8 new leaves need ≥ 32 spine ports for D/U ≤ 1 (4 × 800G each). No free locked ports. |

Conflict ways forward (each with preview and impact):
- **A.** Add spine capacity and rebalance existing leaf–spine links. This changes approved and possibly installed cabling: R06 class T2.
- **B.** Take 2 uplinks from each existing leaf. Their normal D/U becomes 16/15, which breaks the supplied D/U ≤ 1 policy.
- **C.** A different packing policy for the small group. This changes failure domains (R04 P02 note).

The ordered spines are **never** removed or re-optimised. Surplus would become reusable stock only through an explicit decision (R05 §6).

**Override.** If the SE pins a value that conflicts with a rule (for example "use 12 spines"), it is stored as `supplied`. It survives every regeneration, and any conflict it causes is shown on each regeneration until the SE resolves it (AGENTS.md; R01 FM6).

Diff presentation (H):
- Summary first: "+8 leaves, +64 links, +32 cages, 1 conflict".
- Then a table of changed lines, with an "only changed" filter.
- Then per-identity detail: which planning IDs were added, removed, retained, or changed attributes.
- Previous revisions stay read-only and can be compared or restored as a new revision. They are never overwritten.
- Approvals on revision N are shown as **"applies to N, not N+1"** (R06 §6.4).

## 6. Latest-release workflow

**Sponsor direction (S):** installations use the latest release, and design assets must stay current. Each revision keeps its exact evidence versions for reproducibility; that record is provenance, not a policy to install the old release. Compat is verifying the current release in [#3](https://github.com/afewell-hh/hh-aid/issues/3#issuecomment-6715064634). This draft uses **placeholders** and makes no claim about which release is current.

### 6.1 What the user always sees

- Project header: **"Installing on: <TARGET release, from #3>"**, or **"latest release — not yet verified"** when the evidence is missing.
- Revision header: **"Built from evidence: <snapshot ID> — release <X>, fabric <ver>, fabricator <ver>, rules <rev>, catalog <rev>"**.
- When they differ: a persistent banner, **"This revision was built from older evidence than the installation target. Review release impact."** It must never read "current" without evidence (S).

### 6.2 Release-impact review (H)

When a new target is recorded, hh-aid offers a review instead of a restart:

1. **Impact summary**, grouped by compat's screen areas (#3): connection and domain semantics; switch roles, modes and profile budgets; validation, config and import contract; operational constraints; plus hh-aid catalog and compatibility evidence. Each item is `unchanged (rechecked)`, `changed`, `unknown (not checked)` or `blocked`, with the affected BOM lines and planning IDs listed.
2. **Unchanged-rechecked items** are carried forward with a single acknowledgement. They are listed for inspection, not hidden.
3. **Changed and unknown items** need individual review. Each one shows the affected lines and whether their level falls (for example, "L3 → L2: compatibility evidence not re-qualified for <target>").
4. **Revalidate** runs the checks against the target evidence and produces **revision N+1**. The diff (§5.7) shows quantity changes, level changes and invalidated approvals.
5. **Locked and ordered lines** are carried as-is. If the target makes one incompatible or unsupported, that is a **conflict**, not a substitution.
6. Revision N stays available and reproducible. The project's target is N+1's target.

**Avoiding the burden (H):**
- Releases are reviewed as **deltas**. Work already accepted is not repeated.
- Rechecks run in the background. The user sees one summary ("3 changed, 41 unchanged, 2 unknown").
- A project can stay on "review pending" without blocking other work. Its BOM levels are honestly reduced where evidence is missing.

Placeholders used until #3 reports: `<TARGET>`, `<snapshot-target>`, and illustrative impact rows marked "example only — not a real release finding".

## 7. Large-topology review (beyond a giant graph)

The R04 scale fixtures are 1,024 links for F1 and 8,192 endpoint edges for B300-A at 512 nodes. Tens of thousands of links are expected at full detail (S). Proposals (H):

| Need | Pattern |
| --- | --- |
| "Is it right overall?" | **Summary cards** per network, group and plane: counts, D/U normal and after failure, conflicts, level distribution |
| "What's wrong?" | **Exceptions first**: conflicts, unknown or stale inputs, unqualified lines, unused intentional ports (labelled, not hidden) |
| "Where is server X / leaf Y?" | **Search** by planning ID, name, rail, group, plane, cage; results deep-link into the trace |
| "Show me a slice" | **Facets**: network, group, rail, plane, switch, readiness level, answer state, changed-in-revision |
| Reviewing links | **Pattern rows**: one row per link *pattern* ("group A, rail r → leaf A-r, 64 links, cages 1–32 lanes 1–2") that expands to per-link rows on demand. Virtualised tables. CSV export of any filtered view. |
| Structure | A **small schematic** per pattern (groups → rail leaves → spines), not a full graph. The full connection map comes later (S). |
| Changes | Diff views filtered to "changed only", with counts per pattern |

The BOM line, link pattern and planning identities form one hierarchy. Every BOM quantity opens the patterns it counts, and every pattern opens its links. This is how the later connection map reconciles to the first BOM.

## 8. Accessibility requirements (H; target WCAG 2.2 AA)

1. **State is never colour alone.** Every level, answer state, lock and impact state has a text label and a distinct icon shape. Contrast is ≥ 4.5:1 for text and ≥ 3:1 for icons and focus rings.
2. **Full keyboard operation.** BOM table, trace, question queue, diff and conflict panels all work by keyboard, with a visible focus indicator. The trace uses native disclosure (`details`/`summary`) or a fully implemented ARIA tree pattern. Never put a partial `role="tree"` or interactive controls inside `summary`.
3. **Real tables.** Data tables use native table markup with header associations. Sortable columns announce their sort state. Virtualised tables keep row and column counts (`aria-rowcount`) and a reachable "export this view" alternative.
4. **Announcements.** Regeneration, release-review results and conflicts are announced through a polite live region in one sentence ("Revision 4 created: 3 lines changed, 1 conflict").
5. **No graph-only information.** Every schematic has an equivalent table or text.
6. **Zoom and reflow.** Usable at 200% zoom and 320 CSS px width without losing functions. Wide tables scroll inside their own container.
7. **Plain language.** Numbers are spelled out with units ("400 Gb/s per direction"), and abbreviations (D/U, ESLAG) have expansions on first use and in a glossary. Labels avoid implying deployability.
8. **Motion and timing.** No time limits on review tasks. Reduced motion is respected.
9. **Exports.** CSV, plain text and print views carry the same scoped labels and assumptions as the screen.

## 9. Error recovery requirements (H)

| Situation | Required behaviour |
| --- | --- |
| Wrong answer entered | Undo per answer. History shows every answer change with its time. Preview before apply. |
| Regeneration fails or times out | Keep the last good revision visible and labelled. Show the failure with a retry. Never show partial numbers as complete. |
| Impossible constraints | Conflict panel (§5.6): affected lines suspended, others kept, ways forward previewed, nothing relaxed automatically |
| Upstream validation fails (later tracks) | Show it as a blocked check. Diagnostics may be first-error-only and in unstable order (R03 §3.1), so label any "all problems" list advisory. |
| Stale evidence or release change | Lines fall in level with reasons. Project shows "review pending" and is never shown as current. |
| Conflict with a locked or ordered line | Never auto-resolve. Show the options with procurement impact. Record the chosen disposition and approver. |
| Accidental unlock or override removal | Requires confirmation naming the affected lines. Reversible through history. |
| Lost work | Draft answers auto-save per project. Revisions are immutable. |
| Scope mistake (partner visibility) | Show the visibility scope before export or share. Confirm before sharing outside Hedgehog. |

## 10. Evaluation plan

### 10.1 Evidence types (do not mix them)

| Type | Who | Counts as | Status |
| --- | --- | --- | --- |
| Heuristic walkthrough | An AI agent or reviewer, against Nielsen heuristics and §8 | Design-defect finding only | Author pass done (§10.4). Independent pass by scout or ops requested. |
| Sponsor walkthrough | Sponsor, moderated | Domain-fit feedback, not usability evidence | **Not done** — requested (§12) |
| Task-based usability test | Real SEs (R01 §9 screening) | Usability evidence, qualitative at n≈3–4 | **Not done** |

### 10.2 Task scripts (same scenario for every participant)

**Before any session,** someone other than the facilitator writes the expected answers from the fixture's construction (topo or check; R01 §7 rules).

| ID | Task (participant instructions) | Pre-written expected answer source | Records |
| --- | --- | --- | --- |
| T1 | "A customer emailed '128 B200 HGX servers'. Get a first estimate you could discuss on a call." | F1 §5.2 table | Time; whether every assumption is noticed |
| T2 | "Why 8 spines? What would make it change?" | §5.3 trace | Correctness of explanation; what was opened |
| T3 | "What would you ask the customer next, and why?" | §5.4 ranks 1–3 | Chosen question vs expected set |
| T4 | "For each line, can you put this number in a quote? Order it? Install from it?" | §4.1 levels | Readiness comprehension (SM9); critical misreads |
| T5 | "The customer insists the fabric keeps full bandwidth if a spine fails." | §5.6 | Recognises infeasibility; picks a way forward without blaming routing |
| T6 | "16 leaves and 8 spines are already ordered. The customer now wants 136 servers." | §5.7 | Finds the conflict; does not assume ordered parts change |
| T7 | "A new Hedgehog release is out. Is this design still good to install on it?" | §6 placeholders | Distinguishes evidence version from target; finds changed and unknown items |
| T8 | "Find which leaf server 77's rail-5 link uses, and list unused ports on the new leaves." | F1 allocation (R04 S03 formulas) | Time; search/filter path; correctness |

### 10.3 Usability goals (H; per participant; small samples are learning evidence only)

| Goal | Measure | Target for proceeding |
| --- | --- | --- |
| UG1 Readiness comprehension (R01 SM9) | T4 per-line answers vs expected | **No critical misread**: treating L1/L2 as orderable, or the BOM as installable |
| UG2 Assumption visibility (R01 SM2) | Share of displayed quantities whose source is classified correctly | Reported per participant; ≥ 90% is a heuristic, not a pass mark |
| UG3 Trace usefulness | T2 explanation correct without facilitator help | Every participant, or analysed |
| UG4 Next-question fit | T3 choice within the pre-written top-3 | Reported per participant with reasons |
| UG5 Infeasibility recovery | T5 and T6 completed with a valid way forward; ordered parts left intact | No participant believes hh-aid relaxed a constraint or changed an order |
| UG6 Release distinction | T7 states both versions correctly | No participant reads the evidence version as the install target, or the design as current when review is pending |
| UG7 Same-scenario time (R01 SM1) | T1 time vs the incumbent path on the same scenario, plus correctness | Target set after the baseline |
| UG8 Scale navigation | T8 completed through search/filter | Time and path reported; failure analysed |

A critical misread (UG1, UG5, UG6) is a **trust failure**. It must be resolved in design and retested before acceptance of the flow it affects (#9 criterion 4).

### 10.4 Author heuristic walkthrough (not user testing)

**Method.** I reviewed `walkthrough.html` against Nielsen's ten heuristics and the §8 requirements. I rendered it in headless Chrome at 1200 px and 500 px wide, and syntax-checked its script. The mock was built and reviewed by the same author, so these are design-defect findings only. They are not evidence of usability.

Findings and their disposition in this revision:

| # | Finding | Heuristic / requirement | Severity | Disposition |
| --- | --- | --- | --- | --- |
| HW1 | The trace used `role="tree"` without tree items: invalid ARIA that would mislead screen readers | §8.2 | Major | Fixed. Native `details`/`summary` disclosure instead. |
| HW2 | "Change" buttons sat inside `summary` elements (nested interactive controls) | §8.2 | Major | Fixed. Moved after each summary, with specific accessible names. |
| HW3 | The "16 leaves" quantity opened the explanation for 8 spines | Match between system and real world | Major (trust) | Fixed. Only the spine trace exists in the mock. **Design requirement:** every quantity opens its own trace (§5.3). |
| HW4 | "D/U" appeared on the conflict screen without explanation | §8.7 plain language | Major (comprehension) | Fixed. Defined inline. |
| HW5 | The conflict screen claimed unaffected lines stay visible but did not show them | Visibility of system status | Major | Fixed. Suspended and kept lines shown together. |
| HW6 | The scale view listed 16 identical unchanged patterns before the 8 new ones and did not show the open conflict, contradicting principle 7 | Recognition over recall; principle 7 | Major | Fixed. Exceptions strip, changed patterns first, unchanged collapsed with counts. |
| HW7 | "Class T2" in a way-forward option was unexplained jargon | §8.7 | Minor | Fixed. Plain-language consequence plus the reference. |
| HW8 | Long version identifiers overflowed at narrow widths | §8.6 reflow | Minor | Fixed. Text wraps; checked at 500 px. 320 px **not verified**, because headless Chrome would not render below about 500 px. |
| HW9 | The evidence/target banner appears on every screen | Aesthetic and minimalist design | Open risk | Kept deliberately (S requirement). Banner blindness is tested by T7 / UG6. |
| HW10 | Readiness wording ("estimate", "exact quantity", "qualified") is untested with SEs. The doc-only codes L0–L3 are not shown in the UI. | Match with real world | Open risk (critical if misread) | Tested by T4 / UG1. A critical misread blocks acceptance of the readiness design. |
| HW11 | Only the spine quantity is clickable in the mock, so traceability looks optional | Consistency | Minor (mock limitation) | Inert in the mock. The requirement is stated in §5.3. |

**Critical trust/comprehension failures (criterion 4).** This pass found no failure that it could rate critical against real users, because it involved no users. The two highest risks remain open until real SEs test them: HW10 (readiness misread) and HW9 (version confusion). An independent heuristic pass by t2 / scout or t9 / ops, and the sponsor walkthrough (Q-UX-4), are requested.

## 11. Vocabulary reconciliation with D01 (required before acceptance)

Questions were posted to model at [#8 comment 6715125093](https://github.com/afewell-hh/hh-aid/issues/8#issuecomment-6715125093). Status: **awaiting D01**. D02 terms are placeholders.

| D02 placeholder | Meaning here | D01 term | Status |
| --- | --- | --- | --- |
| Line readiness L0–L3 | §4.1 | ? | Pending |
| Package readiness | R06 C4 values | ? | Pending |
| Answer provenance states | R05 axis | ? | Pending |
| Compatibility states | R05 axis | ? | Pending |
| Lock / commitment states | `locked`, `ordered`, `delivered`, `installed` | ? | Pending |
| Evidence snapshot vs installation target | §6.1 | ? | Pending |
| Release-impact item states | §6.2 | ? | Pending |
| Quantity trace and planning identity | §5.3; R06 §6.1 | ? | Pending (#8 item 7) |
| Conflict / way forward | §5.6 | ? | Pending |
| Scenario branch | side-by-side alternatives | ? | Pending (#8 item 9) |

## 12. Decisions and questions

| ID | Question | Owner | Safe interim treatment |
| --- | --- | --- | --- |
| Q-UX-1 | What may partner SEs see or edit (catalog, pricing, other projects)? | Sponsor | Show scope; confirm before share |
| Q-UX-2 | Which readiness level must the first slice reach for its BOM lines: L1, L2 or L3, or orderable packages? | Sponsor + D06 (product-context leaves this open) | Design supports all; nothing implies orderable |
| Q-UX-3 | Which scenario anchors the first evaluation sessions (F1 B200 128, NVL72 eight racks, other)? | Sponsor | F1 used as a synthetic fixture only |
| Q-UX-4 | May the sponsor do a moderated walkthrough of `walkthrough.html` (about 30 minutes) and introduce 3–4 SEs per R01 §9 screening? | Sponsor | Heuristic evidence only until then |
| Q-UX-5 | Does release review need an explicit approver, or is revalidation enough when only `unchanged (rechecked)` items exist? | Sponsor + ops | Show review pending; do not auto-approve |
| Q-UX-6 | Should customers ever receive the trace text directly, or only the SE's summary? | Sponsor | Copyable text with assumptions included |

## 13. Acceptance criteria and evidence (#9)

| Criterion | Evidence | Status |
| --- | --- | --- |
| BOM-first SE workflow: estimate, next question, traceability, infeasibility, input-change impact, latest-release refresh; connection map and installation later | §5.1–§5.7, §6, §4.1 (later tracks); walkthrough screens 1–9 | Draft complete; untested with users |
| Assumptions, unknowns, stale outputs, confidence, completeness visible; table, search, filter and summary beyond a giant graph | §4, §5.2–§5.3, §6.1, §7 | Draft complete |
| Accessibility, error recovery, task scripts, measurable goals | §8, §9, §10.2–§10.3 | Draft complete |
| Real sponsor/user feedback; heuristic vs testing distinguished; critical trust failures resolved | §10.1, §10.4 (author heuristic only; HW1–HW8 fixed; HW9–HW10 open risks for testing) | **No real feedback yet**. Q-UX-4 requested. |
| Facts, hypotheses, intent, questions separated; versions and reproduction | §1 labels and inputs, §14 | Draft complete |
| Independent disposition; sponsor/domain decisions | — | **Pending** (scout, ops, sponsor; D01 reconciliation §11) |

## 14. Reproduction and limitations

```sh
python3 -I docs/design/experience-design/fixture-check.py   # prints: D02 fixture arithmetic passed
open docs/design/experience-design/walkthrough.html          # or any browser; no network or backend
# Facilitators can open a step directly: walkthrough.html#step-6
```

`fixture-check.py` independently checks every F1 count in §5 and the F2 and N01 references. It checks logical arithmetic under hypothetical profiles only. It is not hardware, support or upstream evidence.

Limitations:
- **No interviews, sponsor sessions or usability tests have taken place.**
- Hardware is hypothetical.
- Release rows are placeholders until #3 reports.
- Vocabulary is unreconciled with D01.
- The walkthrough is static, with no real generation. It was rendered in headless Chrome at 1200 and 500 px only. It has not been tested with a screen reader or at 320 px.
- The question-ranking and level rules are design proposals for D01/D03, not specified algorithms.
