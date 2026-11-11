# First BOM experiment — executable assignment

Lead released the bounded design gate on 2026-11-10. Build owner: existing **t7 / arch**, [#14](https://github.com/afewell-hh/hh-aid/issues/14). Independent harness/reviewer: existing **t8 / parts**, [#15](https://github.com/afewell-hh/hh-aid/issues/15). No new sessions. Read the [brief](first-bom-experiment.md), [synthesis](design/inception-outcome.md) and [checkpoint](design-checkpoint.md).

## Exact inputs

- D03 scenario and algorithm: `ce4b8e6b03f79b8aa4ff796e8b4460ebc67312a8` (PR #32). Scenario bytes match early `9aa448a32deb62f57629ac0e5f3480ba95faab7d`.
- D04 independent expectations/checkers: `25d642363a477e2b04a06e74421da0b15e991412` (PR #31).
- D05 architecture and ADRs: `75ba52328699c036c368d6700325011556d38615` (PR #33).
- Earlier domain, hardware, profile and screen inputs: exact commits in the checkpoint. Do not consume moving branch heads silently.

Accepted input artifacts remain on their branches. Record path, commit and blob/content digests in a source lock. Provide a reproducible fetch/materialize command for a clean clone; do not require the author's sibling worktrees. Materialize only needed fixture/oracle files with provenance, never hand-copy expected outputs into generation. No bulk PR merge is needed to begin.

## Ownership and delivery

Arch owns `spikes/first-bom/` application code, schemas, source lock, one-profile extraction, CLI, store, runner, UI, application tests and generate/lifecycle drivers, excluding the independent subtree below. Parts owns `spikes/first-bom/verification/` (export-only projections, verify/measure drivers, independent tests) and `docs/design/feasibility-review.md`. This specific path replaces the earlier proposed adapter path to avoid shared edits. Agree filenames/CLI interfaces in issue comments early. Each uses an isolated worktree; arch integrates the reviewed harness commit without changing its assertions to fit application output.

Arch should proceed through the five ordered checkpoints in the synthesis without waiting for approval between routine implementation steps. Publish the first runnable checkpoint (create/edit/save/reopen and useful BOM) promptly with commands and exact commit so parts can test it. Continue through allocation, grouped review, refinement and independent evidence. Each checkpoint must run; do not stop with a scaffold or another design document. Parts can prepare the harness immediately, then test exact application commits as available. Final acceptance remains dependent on the completed application.

Keep the accepted spacious server profile, allocation-group picker, expandable BOM and compact both-end connection review. Populate generic fixtures, not a fictional qualified catalog. Preserve incomplete projects and arbitrary per-unit items. A conditional partial BOM is the first output; final wiring, broad catalogs, shared hosting and procurement are deferred.

## Implementation clarifications from lead

These settle concrete test/runner details in D05 without another design round:

1. Cancellation tests must synchronize with a worker-start or stage-complete barrier. Do not depend on a 50 ms race in which the scale fixture might hit its interactive demand cap first. Exercise deadline, user cancellation and operation-cap outcomes separately, and test cancellation before and after S1 completes. Preserve all completed stage results; if S1 has not completed, retain inputs/previous outputs and explicitly report that no new component result exists. Never fabricate lines to satisfy an unconditional preservation assertion.
2. An import byte limit and safe integer bound do not bound expanded population size. Use checked aggregate arithmetic for simple per-unit lines and a documented deterministic expansion budget where occurrences must be materialized. Large compact inputs must not trigger unbounded loops/memory. An early limit can leave component detail unresolved while preserving completed lines and the saved input. Document the counter in run configuration and test it.
3. Distinguish a stage cache key (input/dependency digests) from a document content digest. Verify stage content before reuse, and ignore incomplete stage fragments. Include all roots, including partial candidates and stages, in history/export closure. Serialise index/HEAD commits so simultaneous save/cancel/generate completion cannot lose roots.
4. Resume equality compares the same semantic inputs and deterministic limits. Keep externally overridden deadlines in runner/audit metadata or compare runs with identical recorded configuration; a changed semantic configuration must not be expected to have an identical digest.
5. Adopt D05's named scale configuration as a provisional test configuration. Use D04's disjoint 1,000-replica fixture (24k fabric demands plus management dependencies), five samples and independent member conservation. Report slow results honestly. Default-cap tests are not scale throughput evidence.

## Acceptance and handoff

All demonstration rows in the brief must have runnable evidence: two-class customization; DPU/count mutations; destinations/groups; installed/purchase and shared-assembly accounting; grouped manual review with edit shortcuts; AC1/unknown/exhaustion/lock diagnostics; fresh-process persistence; historical export/reimport; deterministic replay; scoped staleness/diff and controlled catalog refresh. Include allocation occurrence checks, not only aggregate totals. Verify unsafe integer rejection, interrupted runs and malformed/missing history references. Run the independent checkers on actual exported application state.

Verify supported/downloadable runtime and dependency pins from primary sources during scaffold work; do not trust dated version names in the design packet. Record extraction command/source/toolchain/hash. Go is a build-time extraction tool, not an application runtime dependency. Any manual snapshot fallback needs the independent field review described in D05 before use.

Handoff in #14/#15: exact branch/commit/PR, run/demo commands, source lock, checks actually run, captured outcomes, screenshots or a local demonstration route, measured limits and explicit unresolved scope. No hardware/upstream wiring validation is claimed when none ran. Parts gives criterion-level acceptance/changes requested; lead reviews the implementation and acceptance evidence. No self-approval or automatic issue closure.
