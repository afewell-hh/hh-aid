# D02 addendum: server-class-first profile experience

**Status:** draft for review (issue #9, lead assignment [6726546239](https://github.com/afewell-hh/hh-aid/issues/9#issuecomment-6726546239)). It is not approved and not a production design. No SE sessions or interviews have taken place, and none are claimed.
**Author:** t5 / ux. **Baseline:** main `4449d14` (sponsor feedback dated 2026-11-08).
**Previous checkpoint:** D02 revision 3.1 (PR #24 at `7da2b0c`) is unchanged. It remains the reference for the persistent workspace, regeneration, stale/diff, conditional alternatives and starter-library views. This addendum replaces only its from-scratch *endpoint/links-per-endpoint* interaction.

**Artifacts in this pass:**
- [`server-profile-experience/screens.html`](server-profile-experience/screens.html): static low-fidelity screens. It has no script and no calculator.
- [`server-profile-experience/bom-arithmetic.py`](server-profile-experience/bom-arithmetic.py): a standard-library check of every quantity on the screens.

**Fixture honesty.** Every part is a generic placeholder or unverified sponsor shorthand; none is vendor-qualified.
- "BF3" and "HGX 8-GPU (B200-class)" are labels for the sponsor's illustrative configurations, not verified SKUs.
- Port counts, speeds and cages are fixture inputs.
- Switch counts are deliberately **not estimated**.

**Coordination.** Field names are provisional until these land:
- parts' field/fixture matrix (#6, `docs/research/server-unit-bom.md`);
- model's contract fixture (#8, `docs/design/server-class-contract.md`).

Product words such as *fabric* and *leaf class* are product language. How they map to upstream Fabric, domain and plane objects is owned by compat (#3, `docs/research/fabric-profile-contract.md`). No such mapping is assumed here.

## 1. What the sponsor asked for, and what this pass changes

| Sponsor point (main 4449d14) | Change from revision 3.1 | Where |
| --- | --- | --- |
| Use "server" for every non-switch device, explained once | Endpoint vocabulary is replaced by *server*, with one note on F1 | §3, F1 |
| Start from recognizable server families with common default profiles; no flat catalog of permutations | First action is "What kind of server?" → family → 2–3 common configurations. Variants are fields inside the profile, not catalog entries | §6 F1, F3 |
| Family, reusable class revision and project customization have distinct identities | Four identities: family, class revision, project copy with customizations, population | §8 |
| One server has several concurrent attachments; keep rails and planes | One population per class. Attachments are properties of ports, not separate inventories | §6 F2, F4, F7 |
| Nested NIC/DPU → port → cage/mode → optic or assembly | Treegrid hardware table | §7 |
| Arbitrary per-unit lines; ×N expansion; bundled versus separate; shared assemblies counted once | Per-unit lines table; BOM shows per unit × units = total; purchase column; assemblies counted per link | §6 F2, F8 |
| Physical detail at both ends; explainable filters; unknowns and overrides visible | Both-ends comparison (E1) | §7.3 |
| Port → fabric and leaf class; leaf class resolves fabric; partial intent valid; create in context without duplicates | Batch assignment, a non-modal create panel, reuse-first menus | §6 F4, F5, F9 |
| Source-derived, manual and placeholder switch models with support status | Model picker in F5, with source and support as separate columns | §6 F5 |
| External cabling excluded and disclosed; transceivers and integrated assemblies included | A disclosed "outside scope" block in the BOM, with its quantity basis | §6 F8 |
| UX open: compare editor, tables, canvas and hybrid; canvas optional | Three alternatives compared against six task criteria | §4, §5 |

Revision 3.1 behaviour that stays:
- the persistent workspace, with no wizard and no completion requirement;
- generate and regenerate with output revisions, stale dependent lines and diffs;
- unknowns preserved and "Not decided yet";
- conditional alternatives (model 6718567853);
- starter-library views of one shared library (sponsor c018fa9).

## 2. Evidence (focused; prior appendix A is reused, not repeated)

| ID | Source | What it supports here | Limits |
| --- | --- | --- | --- |
| P1 | Microsoft, [List/details pattern](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/list-details) (Windows app design guidance, accessed 2026-11-08) | A list pane plus a details pane fits working "back-and-forth between contexts". Side-by-side at wider widths; stacked at 320–640 epx | Platform guidance, not a usability study |
| P2 | Laubheimer, [Data Tables: Four Major User Tasks](https://www.nngroup.com/articles/data-tables/), NN/g, 2022-04-03 | Tables serve find, compare, view/edit one row and act on records. A **nonmodal side panel** keeps the table visible while one record is edited; modal editing hides neighbouring records. Edit-in-place "works only if the table is narrow" | General enterprise tables, not network hardware |
| P3 | W3C WAI-ARIA APG, [Treegrid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/) | A keyboard model for hierarchical editable rows: ←/→ collapse or expand, ↑/↓ move between rows, Enter acts, Tab leaves | Authoring practice, not a conformance requirement |
| P4 | W3C, [Understanding WCAG 2.2 SC 2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) (Level AA) | Any drag operation must also be possible "by a single pointer without dragging" | Applies to the canvas only if one is built |
| P5 | Sherugar & Budiu, [Direct Manipulation: Definition](https://www.nngroup.com/articles/direct-manipulation/), NN/g, 2016 (reviewed 2024) | Benefits: visible status, learnability, reversibility. Drawbacks: accessibility, **precision**, **scale** (only visible objects; slow for bulk work, where experts switch to keyboard) | Definitional article, not a comparative test |
| P6 | Fessenden, [Modal & Nonmodal Dialogs](https://www.nngroup.com/articles/modal-nonmodal-dialog/), NN/g, 2017 | Avoid modals when the task needs information from the main page or "complex research"; nonmodal dialogs let users continue | General guidance |
| P7 | Carbon Design System, [Data table usage](https://carbondesignsystem.com/components/data-table/usage/) | Expandable rows put large detail in small space; **batch actions** after multi-select; expand-all is not the default; if expanded content is cramped, use a side panel | Design-system convention |
| P8 | Figma Help, [Guide to components](https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma) and [Apply overrides to instances](https://help.figma.com/hc/en-us/articles/360039150733-Apply-overrides-to-instances) | An analogue for class versus project copy: instances link to a main component, overrides are kept and can be reset, and changes can be pushed to the main component | **Contrast:** Figma instances receive main-component updates automatically. hh-aid must not, because class revisions are immutable and adoption is explicit (model 6718326881). This is used as an analogue only |

Reused from appendix A: GOV.UK Check answers (review before regenerating) and NN/g progressive disclosure (optional depth inside one workspace).

No new survey was done. These sources inform layout and keyboard choices only. They do not establish which alternative SEs will perform best with. That is what the review tasks in §10 are for.

## 3. Vocabulary (product language; upstream mapping pending compat #3)

| Term | Meaning in this design | Not the same as |
| --- | --- | --- |
| **Server** | Any non-switch device attached to a fabric: GPU or CPU server, storage, appliance, gateway host. Aligned with Hedgehog's Server concept (R02) | A rack, a GPU, or one network's worth of ports |
| **Server family** | A recognizable form factor with 2–3 common configurations. Library metadata used for discovery | An orderable SKU |
| **Server class (revision rN)** | An immutable, reusable network and hardware profile. A project pins one revision | A count of servers |
| **Project copy** | The pinned class revision plus project-only **customizations**, each marked | A new class |
| **Population** | The count (or range) of physical servers of one project copy | A per-fabric endpoint count |
| **Hardware item** | A NIC, DPU, storage controller or onboard interface, with a quantity per server | — |
| **Port** | A logical port on a hardware item, with cage, configured mode and server-end medium | A link |
| **Attachment** | The port's fabric and leaf class, plus its rail and plane tags | An upstream Connection object |
| **Fabric** (product) | A named network the engineer is designing, such as backend, frontend or storage | Upstream `Fabric`, domain or plane (pending #3) |
| **Leaf class** | A switch role and model choice inside one fabric. The model may be "not chosen yet" | A switch instance |
| **Per-unit line** | Any BOM item with quantity per server (or per switch), including items outside the topology | — |
| **Assembly** | DAC/AEC/AOC/breakout: one item spanning two or more ends, counted once per instance (R05 §4) | Two transceivers |

## 4. Tasks and criteria used to compare interactions

Lead's six criteria, each made concrete:
- **K1 Keyboard access.** Every create, assign and edit is possible without a pointer or drag, with a predictable focus order (P3, P4).
- **K2 Dense port inspection.** Cage, mode, lanes, medium, PMD/reach, rail, plane, fabric and leaf class can be seen for every port of one server without opening items one by one (P2).
- **K3 Repeated hardware patterns.** 8 identical backend NICs are edited once, can be expanded to per-port detail, and one can be split out to differ.
- **K4 Mixed fabrics.** Seeing that one server attaches to backend, frontend, storage and management simultaneously, and spotting a port with no fabric.
- **K5 Novice discovery.** A first-time SE gets from scratch to a first BOM without knowing the vocabulary.
- **K6 Expert editing.** Batch changes, both-ends comparison, scope choice (project versus class) and fast regeneration.

## 5. Alternatives compared (screens A, B, C)

| | A Master/detail editor | B Canvas | C Hybrid (table-primary + attachment map) |
| --- | --- | --- | --- |
| Structure | Project tree · nested hardware/port treegrid · non-modal details panel | Server node with NIC blocks, wired to fabric and leaf-class nodes; palette; inspector | A's structure plus a compact one-server map: hardware rows × fabric columns, with click-to-select that syncs to the table |
| K1 Keyboard | **Strong**: treegrid model (P3), batch bar (P7) | **Weak by default**: needs a full non-drag alternative (P4) and a spatial focus model; costly to build and test | **Strong**: all actions live in the table; the map is a view that also accepts single-pointer selection |
| K2 Dense ports | **Strong**: columns, sort and filter (P2) | **Weak**: attributes sit in an inspector one item at a time; a 12-port server is crowded (P5 precision and scale) | **Strong**: same as A |
| K3 Repeated patterns | **Strong**: one row with ×8, expandable; batch edit | Medium: one block per pattern hides per-port detail; eight blocks cause clutter | **Strong**: same as A; the map shows ×8 |
| K4 Mixed fabrics | Medium: attachments are a column, so the "one server, many networks" picture must be read row by row | **Strong**: the picture is the point | **Strong (hypothesis)**: the map gives the picture; hollow dots flag partial intent |
| K5 Novice | Medium: tables can intimidate, but defaults reduce typing | Medium-strong: engaging and learnable (P5), but empty-canvas start and a hidden palette are risks | Medium-strong: defaults plus the map for orientation |
| K6 Expert | **Strong** | Weak for bulk and precision (P5) | **Strong** |
| Population of 100 | Natural: a count on the class | Awkward: draw one server and annotate ×100; 1,200 links can only be aggregates | Natural, as in A |
| Build/test cost | Lowest | Highest (graph layout, a11y alternative, zoom) | A plus one read-mostly SVG component |

**Fairness notes.**
- B is shown at its best realistic level: grouped NIC blocks, not 1,200 wires.
- A's weakness on K4 is real, not invented: in A the frontend/storage/backend relationship is in one column.
- C is not "A plus everything". It adds only the map. If review shows the map does not speed up K4 or K5, C collapses to A.

### Recommendation (hypothesis)

**C, a table-primary hybrid.** The table and details panel carry every edit; the attachment map is a synchronized, non-drag overview for K4/K5.

- Rationale: A and C tie on K1/K2/K3/K6, which is where SE accuracy matters most. C adds the multi-network picture that B is good at, without B's accessibility, precision and scale costs (P4, P5). Contextual creation uses a non-modal side panel in both, per P2 and P6.
- **Decision rule for review:** if RT2 (explain every network one server attaches to) shows no benefit from the map, ship A.
- Canvas remains possible later as an optional *view* (for example a rack or plane drawing), never as the only editing path.

## 6. Recommended flow (screens F1–F9)

Each step is optional except where noted. There is no forced sequence: the project tree gives direct access to any class, fabric, leaf class or the BOM at any time.

1. **F1 Choose a server family.** "What kind of server?" offers family cards plus "Describe my own" (empty profile) and the starter-library link. The one-line "server" note lives here.
   - Selecting a family offers 2–3 common configurations, including "Not sure yet: start from default and mark undecided parts".
   - The sponsor's HGX variants appear as **configurations or fields**, not separate catalog rows: optional separate storage, and one dual-port versus two single-port DPUs.
2. **F2 Inspect the default profile.** The whole network profile of one server is visible at desktop width:
   - a summary strip (12 fabric ports in 3 attachments, 3 management ports, 4 unknowns);
   - the attachment map;
   - the hardware treegrid;
   - per-unit lines;
   - the details panel.
   Values are tagged by origin (K legend). Rails stay on ports (rail = NIC index, a class assumption). Plane is "unknown" until supplied.
3. **F3 Customize a variant.** On the DPU row, "Change variant" offers 1 × dual-port, 2 × single-port or Not decided yet.
   - A preview shows the deltas. DPUs per server go from 1 to 2 (×100 = 200), and so do **DPU management ports**, because each physical DPU has one (parts SU-A-PORTS, model SCX-ATT): out-of-band demands go from 300 to 400. Frontend data ports, links and DACs are unchanged.
   - It also shows what is **not evaluated**: failure independence and PCIe/slot fit.
   - Apply asks for scope (§8): **this project only** (default) or a new class revision.
   - "Not decided yet" produces conditional alternatives in the BOM, per the D01 contract.
4. **F4 Assign ports to fabric and leaf class.** Multi-select (Shift+↓ or checkboxes) opens a batch bar (P7).
   - The leaf-class menu lists *not chosen (valid)*, the existing leaf classes in that fabric, and "+ Create leaf class…".
   - Choosing a leaf class sets its fabric. Fabric-only intent stays valid and is drawn hollow on the map.
   - Rails are never renumbered by a batch action.
5. **F5 Create a leaf class in context.** A non-modal side panel (P2, P6) keeps the table and any unsaved edits (the F3 customization) intact.
   - Duplicate prevention: an existing fabric "backend" is reused, and the name check stops a second "backend-leaf".
   - Switch model may be **Not chosen yet**, a source-derived profile (status pending compat #3), a manual model or a placeholder. Source and support are separate columns: a profile's presence in the source is not support proof, and manual entry does not establish deployability.
   - The leaf class can carry its own per-unit lines.
   - Create assigns the leaf class to the selected ports and returns focus to the originating cell. Closing the panel keeps it as a draft until it is discarded.
6. **F6 Return with edits intact.** A strip lists the changes since the last generate (customization, assignment, new leaf class), with undo. The customized row shows both values: "2 × single-port (class: 1 × dual-port)".
7. **F7 Enter the population.** "How many servers of this class?" is answered once, on the class: 100 (ranges allowed).
   - There is no per-fabric server count.
   - Racks and placement remain optional details from revision 3.1.
8. **F8 Expanded BOM.** Lines are grouped by owner: servers, per-server components, connection media, switches, and outside scope. The columns are **per unit × units = total**, purchase (included, separate or unknown) and identity (generic, unverified or real).
   - Trace example: "800 = 8 per server (class r1) × 100 (supplied)".
   - Optical links show **two** modules (server end and leaf end).
   - DAC assemblies are counted **once per link**.
   - Storage links with an undecided medium show "200 links; media not counted; not zero".
   - Switch lines say "not estimated: leaf model not chosen" and state the requirement (≥ 800 server-facing ports in fabric backend).
   - External fiber and RJ45 cords are disclosed with their basis (800 optical links; 400 management links in the two-DPU variant shown).
   - An **Installed / Purchase** view switch follows parts SF03 and model §5. Installed counts everything present. Purchase suppresses only children an explicit bundle covers, and unknown inclusion leaves the purchase total unresolved rather than zero.
9. **F9 Add a second server class.** Add server class → Storage 2U (generic) × 12.
   - Its fabric menu lists **existing fabrics first**, and typing "storage" offers the existing fabric instead of creating "storage-2".
   - After regenerating, storage-fabric links are 200 + 24 = 224, drives are 24 × 12 = 288, and servers are 112 in two populations.

### Worked arithmetic (checked by `bom-arithmetic.py`; synthetic)

| Quantity | 1 server (default) | 100 servers (default) | 100, two single-port DPUs | 100, no storage NIC |
| --- | ---: | ---: | ---: | ---: |
| Servers (one population) | 1 | 100 | 100 | 100 |
| Backend NICs (8/server) | 8 | 800 | 800 | 800 |
| DPUs | 1 | 100 | **200** | 100 |
| Storage NICs | 1 | 100 | 100 | 0 |
| Fabric links (8 backend + 2 frontend + 2 storage) | 12 | 1,200 | 1,200 | 1,000 |
| Optics, both ends of backend links | 16 | 1,600 | 1,600 | 1,600 |
| DAC assemblies (frontend, one per link) | 2 | 200 | 200 | 200 |
| Storage links, medium undecided | 2 | 200 | 200 | 0 |
| RJ45 management links: in-band, host BMC, one per physical DPU (cords out of scope) | 3 | 300 | **400** | 300 |
| Power cords (4/server, bundling unknown) | 4 | 400 | 400 | 400 |

Adding the storage class (12 servers × 2 storage ports) gives 224 storage-fabric links. The script also asserts that the number of attachments never changes the server count.

### 6.1 Reconciliation with parts (#6) and model (#8) fixtures

Parts posted [server-unit-bom.md at 0230cd8](https://github.com/afewell-hh/hh-aid/blob/0230cd8690c3eb43454424a70d95611e44ada35d/docs/research/server-unit-bom.md) (PR #26). Model posted [server-class-contract.md at fb06179](https://github.com/afewell-hh/hh-aid/blob/fb06179f3a0ce6515256eb28ec30d4084e3c7ec0/docs/design/server-class-contract.md) (PR #25). Both were read after this pass's first commit.

**Screen fixture IDs mapped to theirs.** The three fixtures are illustrative and deliberately not identical; this mapping is correspondence, not numeric equality.

| This pass (screens) | Parts | Model | Difference kept on purpose |
| --- | --- | --- | --- |
| HGX 8-GPU (B200-class) class r1 | SU-A (`F-ACC8`, `C-A@1`, `PC-A@1`, `POP-A`) | SC-A r1, P-A | — |
| DPU 1 × dual-port / 2 × single-port / Not decided yet | FE=DUAL / FE=SPLIT | FE-1D / FE-2S | The screens add "Not decided yet" to show conditional alternatives |
| Storage NIC (dual-port), medium **undecided** | S=0/1 storage DPU, AEC | ST-on DPU, optical | The screens keep one undecided medium, to show "links counted, media not counted, not zero" |
| Backend 8 × 1-port NIC, optic each end | SU-A backend, optic each end | SC-A backend, integrated assemblies | Model uses assemblies; parts and screens use optics. The two-axis count rule is the same |
| Frontend 2 × DAC per server | 2 × DAC | 2 optical links | — |
| In-band 1 + host BMC 1 + 1 per DPU | in-band 2 + BMC 1 + 1 per DPU | in-band 2 + BMC + 1 per DPU | The screens show one in-band port in use |
| Storage 2U × 12 (second class) | SU-B appliance (25G AOC) | SC-B storage appliance | Each shows a different second class |
| Per-unit lines: power cord, rail kit, support contract | A05–A07 | cords, licence, rail kit | — |

**Rules adopted from their drafts into the screens:**
- One management port per physical DPU (F2, F3, F8, arithmetic).
- Installed versus purchase views; unknown bundle inclusion leaves the purchase total unresolved (F8).
- A leaf class whose fabric conflicts with the port's existing fabric is a visible conflict, never a silent move (F4).
- Reuse is an explicit identity choice, never a name merge. A repeated Create does not duplicate. Cancel leaves an unresolved selection, not a dangling ID (F5).
- An edit can be scoped to split a population ("only some servers", with occurrence IDs kept). An edit to a shared customization lists every affected population (L1).
- Known mismatches are hidden from the compatible list but stay inspectable; the filter rules follow CF1–CF7. SU-COMPARE-1 (DR4 versus FR4) is the reference mismatch (E1).

**UX questions back to them** (not blockers):
- Parts and model differ on whether NICs and DPUs are bundled in the server. Should the UI's default for an unknown inclusion be "unresolved" (as in the screens), or should a family default be allowed to assume it?
- Should the server-end and far-end optic of one link show as one requirement row with two ends, or as two rows that reference one requirement? The screens use two rows under connection media.

## 7. Nested hardware, ports and both ends

### 7.1 Hardware/port treegrid (F2), with provisional columns

| Column | Level | Notes / owner of the field definition |
| --- | --- | --- |
| Item / port | item → port (→ breakout child) | Collapsed repeated items show "be1 … be8"; "expand all 8" shows per-port rows. Breakout children are a third level (R05 §4 C) |
| Qty per server | item | Integer. Origin tag (class, customized, supplied) |
| Identity | item | A real model (with source) or an explicit generic placeholder; parts #6 |
| Cage · configured mode | port | Form factor and mode; lanes are a separate field in E1. The mode name alone is not lane-signalling evidence (parts #6) |
| Medium (server end) | port | Optic (PMD class), DAC/AEC/AOC, integrated RJ45, or unknown |
| Fabric · leaf class | port | Product terms; fabric-only is valid |
| Rail · plane | port | Rail from the GPU↔NIC relationship (class assumption); plane optional or unknown. Never inferred from fabric name |
| Per-unit lines | separate table | Line, qty/unit, purchase (included in SKU, separate, unknown), affects topology yes/no. Also available on leaf classes |

**Splitting a repeated pattern.** "Make be3 different" turns ×8 into ×7 + ×1 and preserves rails.

### 7.2 Represented versus missing (legend K)

The tags are: supplied, from class rN, customized, generic, unknown, out of scope. Compatibility is a separate axis (unverified, documented, mismatch, override), following R05's two-axis rule.

Generic parts contribute quantity but are never shown as orderable. Unknown never counts as zero.

### 7.3 Both-ends comparison (E1)

The view has one row per attribute: cage, mode and lanes, medium, PMD and reach, connector/fiber/polarity, and assembly ends. It has an End A column, an End B column, a status and an evidence/action column.

**Filters:**
- same cage family;
- same lane rate × lanes;
- documented pairs only (off by default);
- show unknown (on by default).

Each filter states its source, and the count of hidden options is always visible ("Hidden: 3 options with a different cage family from end A (source: class r1)").

**Other rules:**
- Matching names (for example DR4 at both ends) is never shown as compatibility evidence.
- A mismatch keeps both values and is never auto-corrected.
- An override records the engineer, a reason and the time. Its compatibility stays "unverified", never "documented" or "supported".
- Connector and polarity requirements stay visible even though external fiber is out of scope. They are the interface requirements the sponsor asked us to keep.

## 8. Lifecycle: class revision versus project customization (L1–L3)

| Identity | Created by | Edit effect |
| --- | --- | --- |
| Family | Library | Discovery only |
| Class revision rN | Library or engineer, with the same tools (sponsor c018fa9) | Immutable. An edit creates r(N+1) or a fork. Existing projects are unaffected |
| Project copy + customizations | Engineer | Project-only. Each override is marked and shows the class value; it can be reset |
| Population | Engineer | A count or range; part of the project, not of the class |

- **L1 Edit scope.** Editing an inherited value shows an inline scope choice. *This project only* is the default; the alternatives are *Save as class r2* and *Save as a new class (fork)*. Publishing to the shared library follows library rules, which are deferred by the sponsor.
- **L2 New revision available.** A notice on the class header leads to a diff table: r1, r2, the project's value and the result after adopting. Nothing changes until the engineer adopts.
  - Customizations survive adoption.
  - If r2 changes a field the project overrides, both values are shown for the engineer to choose; nothing is resolved silently.
  - This deliberately differs from the auto-propagation in P8.
- **L3 Stale and regenerate.** Only dependent BOM lines become stale (for example power cords 400 → 200 after adopting r2). Generate creates a new output revision with a diff, as in revision 3.1, and ordered or locked lines follow 3.1's lock rules.

## 9. Scope and represented versus missing data

- **In scope:** server and switch lines, per-unit lines, NIC/DPU quantities, transceivers at each end of an optical link, and integrated DAC/AEC/AOC and breakout assemblies (counted per assembly instance).
- **Outside scope, disclosed:** external structured or fiber cabling (jumpers, trunks, panels, polarity components) and RJ45 patch cords. Each is shown with its quantity basis and with the interface requirements kept.
- **Not estimated in these screens:** leaf and spine counts, which need a chosen leaf model and the planning engine. No solver was built, per lead's instruction.
- **Unverified throughout:** every NIC/DPU cage, mode and port count; the sponsor's "BF3" variants; the HGX B200-class profile; bundling (included in server SKU or not). The screens label these, and parts' primary-source evidence would replace them.

## 10. Review tasks and feedback-to-screen map

Screen M lists RT1–RT10, with the screens and what to look for in each:
- RT1 first BOM from scratch;
- RT2 explain one server's networks (the C-versus-A decision);
- RT3 DPU variant change;
- RT4 create a leaf class in context with edits preserved;
- RT5 undecided storage medium;
- RT6 trace 800 NICs;
- RT7 second class reusing the storage fabric;
- RT8 both-ends comparison and override;
- RT9 project versus class scope and adopting r2;
- RT10 what the BOM excludes.

Screen M also maps every sponsor feedback point to its screens.

Suggested reviewers:
- lead and sponsor for interaction (RT1–RT5, RT7, RT9);
- parts for RT6, RT8 and RT10 field semantics;
- model for RT3, RT4 and RT9 identity and count rules.

## 11. Open items by owner

| Owner | Needed from them | Used in |
| --- | --- | --- |
| parts #6 | Drafted (SU-FIELDS, SU-COMPARE, CF1–CF7; §6.1). Still open: evidence for real NIC/DPU cages and modes; bundle contents; the two UX questions in §6.1 | F2, E1, F8 columns |
| model #8 | Drafted (identity, edit scope, in-context creation, counting; §6.1). Still open: final IDs after parts/compat review; the presentation rule for population split | F3, F6, L1–L3, F8 |
| compat #3 | How the product terms fabric and leaf class map to upstream Fabric, domain and plane; whether one Server may attach to multiple Fabrics or domains; source switch-profile discovery and support status; the manual-model boundary | F4, F5 model picker, glossary |
| sponsor / lead | Whether to keep the map (C) or ship A; whether project-only is the right default scope; the family list for a first library | §5, L1, F1 |

## 12. Acceptance self-check (to be verified by reviewers, not self-approved)

| Lead criterion | Evidence in this pass |
| --- | --- |
| Enough space to inspect a whole server network profile | F2: tree, summary, map, treegrid, per-unit lines and details panel on one desktop screen |
| No duplicate population per fabric | F7 and the script assertion: 100 servers regardless of attachments; F9 shows two populations, 112 servers |
| Per-unit BOM multiplication visible | F8 columns and trace; worked arithmetic table |
| Contextual fabric creation preserves work | F5 non-modal panel, draft kept, focus return; F6 change strip |
| Alternatives compared fairly | §5 table, fairness notes and decision rule; screens A/B/C |

### Checks run

- `python3 -I docs/design/server-profile-experience/bom-arithmetic.py` prints "server-profile BOM arithmetic passed".
- Headless Chrome iframe measurement of `screens.html` at 1,400, 390 and 320 px found no page-level horizontal overflow. Wide tables scroll inside their own pane at 320 px.
- A 1,400 px screenshot was inspected visually.

These are document checks, not usability evidence, and not hardware or topology validation.
