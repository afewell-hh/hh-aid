# Design checkpoint — 2026-11-10

This is a coordination checkpoint, not final inception approval or an instruction to build production software. GitHub issues retain detailed acceptance scopes and reviewer evidence.

## Current baseline

| Input | Exact revision | Disposition |
| --- | --- | --- |
| Server-profile, allocation-group, BOM and manual connection-review screens (#27) | `d1fd01fba10ba6cbb27a5bd06c7165473a1baf6b` | Lead correction review complete; sponsor likes the screens. Static design direction, not implemented behavior or measured usability. |
| Server-class identity/composition contract (#25) | `365a0c363a942b02881eb5a911a40f189107cf73` | Accepted working design input with qualified upstream mappings. |
| Server-unit BOM contract (#26) | `0230cd8690c3eb43454424a70d95611e44ada35d` | Independently reviewed conditional accounting, not qualified SKUs. |
| Fabric/profile and dated release evidence (#28) | `31779ded356b4db0c6e582d4cb209dddbc005bf2` | Independently reviewed source evidence; authority questions and date-specific currency limits remain. |
| Port allocation and grouped-review contract (#29) | `d97a2efa77a5b4e98a0c9198a7af9cd05ae008ff` | Independent reviews plus lead's final AC1 check complete within the bounded contract scope. |
| Allocation patterns (#30) | `a60134f1b937c98b631963ea4c59d7703098b210` | Independently reviewed selectors, historical source counts and conditional assembly examples. |

The original research and D01/D02 drafts remain prerequisite context. New addenda supersede only the subjects they explicitly revise. Different numerical fixtures remain separate examples. Artifacts currently live in their PR branches/worktrees; this table does not claim they are merged to main. Parent issue acceptance criteria extend beyond these bounded deliverables.

## Agreed interaction direction

Start with server families/classes and configurable multi-network hardware profiles. A server population is counted once across fabrics. Destinations include fabric context, leaf configuration/deployment context and planning-only port allocation groups. Preserve incomplete intent, repeat editing and regeneration, shared starter-library views, explicit source revisions and manual engineering judgment.

BOM summaries expand into per-unit/component details without changing quantities or duplicating included parts/shared assemblies. Connection-class tables expose both ends independently, represented link counts, exceptions and source-edit shortcuts; detailed compatibility evidence is optional depth. Manual inspection records what was inspected and does not confer hardware qualification.

Configured switch-resource usage, selected/free candidates and assigned links are separate. Reserved or unused configured ports still consume applicable budgets. Unknown configuration does not mean zero usage. This closes AC1 without selecting an allocation algorithm.

## Next planning gate

Lead owns the next synthesis in [D06 #13](https://github.com/afewell-hh/hh-aid/issues/13). Begin with a bounded first-experiment proposal, not another general screen critique:

1. Define a conditional BOM-first vertical experiment: choose/customize two server classes, retain several fabric attachments, select leaf allocation groups, inspect per-unit and assembly quantities, review connection classes, edit and regenerate with traceable changes. This is a proposed experiment shape, not an approved hardware tuple or first-release scope.
2. Separate the useful partial BOM from exact switch sizing/allocation and later wiring export. List what requires D03 allocation, D04 verification and D05 architecture evidence before implementation.
3. Set observable acceptance examples from the accepted fixtures: one population across networks, one purchase per shared assembly, conserved quantities across BOM expansion, group/resource conflicts, coherent per-alternative outputs and stale review after edits. Keep placeholder parts visible.
4. Resolve only decisions needed to run that experiment: readiness level, representative supported scenario, execution/deployment setting, saved-project behavior and versioned catalog boundary. Preserve future topology coverage and latest-installation policy; do not turn synthetic B200 examples into fixed scope.
5. Prepare bounded specialist assignments from those remaining risks and independent review criteria. No new sessions or production implementation are dispatched by this checkpoint.

Full D06 acceptance still depends on D03/D04/D05 evidence. Current positive screen feedback does not automatically close D01/D02, merge all draft PRs, establish an implementation stack or complete accessibility/usability testing.
