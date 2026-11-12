# Independent actual-export verification

Owner t8 / parts; reviewer lead; issue #15, PR #34. Results for app
`e663856dfde0a0a1247d9812759164d617a000ee` are in `evidence/e663856/`.
**Changes requested:** scale purchase undercount and same-input corrupt-cache
regeneration crash. Successful commands are not blanket acceptance.

No engine imports and no generated expected fixtures. `exports.py` reads actual
export documents, verifies canonical digests/reference closure, expands exported
input occurrences independently, checks component/bundle coverage, construction
membership, selected physical assignments and grouped-review conservation, and
projects actual fields into the unchanged hash-pinned D04 oracle contracts.
Only explicit typed unknown quantities normalize to null; absent fields fail.
Fixture-specific quantity projections are for FB01; use `scale-check.py` for
replicas. Python checks must run without `-O` (assertions are intentional gates).

## Reproduce

Use Python3.9+ and arch's documented pinned Node/browser setup. Set `APP` to the
app's `spikes/first-bom` directory, `VERIFY` to this directory, and `RUN` to a new
scratch directory. Run generation commands from `$APP`:

```sh
./experiment-check generate --export "$RUN/baseline"
./experiment-check generate --mutation FB-COUNT --export "$RUN/count"
./experiment-check generate --mutation FB-DPU --export "$RUN/dpu"
./experiment-check generate --mutation FB-UNKNOWN-MODE --export "$RUN/unknown"
./experiment-check generate --mutation FB-EXHAUST --export "$RUN/exhaust"
./experiment-check generate --mutation FB-LOCK --export "$RUN/lock"
for variant in over-budget reserve-selected reserve-unselected unused-mode-unknown; do
  ./experiment-check generate --synthetic FB-AC1 --variant "$variant" --export "$RUN/$variant"
done
./experiment-check lifecycle --workdir "$RUN/lifecycle"
python3 "$VERIFY/exports.py" "$RUN" --out "$RUN/results"
python3 "$VERIFY/verify.py" projection --kind fb01 --actual "$RUN/results/fb01.json" --oracles "$RUN/oracles"
python3 "$VERIFY/verify.py" projection --kind ac1 --actual "$RUN/results/ac1.json" --oracles "$RUN/oracles"
```

`verify.py` materializes accepted files from git at exact locked commits; its
`self-test` tests only harness plumbing. `roundtrip` compares bytes, while export
closure checks separately cover all historical indexes and roots. Both require
the relevant git objects, not a sibling research worktree.

```sh
MANIFEST="$APP/fixtures/materialized/generation/ce4b8e6/docs/design/first-bom/scenario.json"
python3 "$VERIFY/interfaces.py" "$APP" --manifest "$MANIFEST" --out "$RUN/interfaces"
python3 "$VERIFY/negative-probes.py" "$APP" "$RUN/baseline/project.hhaid.json" --out "$RUN/negative"
python3 "$VERIFY/physical-check.py" "$APP" "$RUN/baseline/project.hhaid.json" --out "$RUN/physical"
"$APP/.toolchain/node/bin/node" "$VERIFY/runner-probes.mjs" "$APP" "$RUN/runner" "$MANIFEST"
python3 "$VERIFY/lifecycle-check.py" "$RUN" "$RUN/runner" --out "$RUN/results/lifecycle.json"
```

The runner probe uses application/store/runner APIs solely to control actual
workers at explicit barriers, including a three-inspection operation budget.
It writes exports before testing corrupt cache recovery. On e663856 the last
probe intentionally reproduces an uncaught failure (exit1); the preceding
results/exports remain available for `lifecycle-check.py`. It does not import
engine functions. Deadline is2s while the worker waits after S1; user cancels
occur at started/S1 barriers, never a racing sleep. Resume uses the same semantic
config. The old B1 reproduction uses `Promise.all` of the two application edits
exactly as the runner probe does; separate HTTP requests did not reproduce the
race in this run, which is recorded rather than claimed otherwise.

```sh
python3 "$VERIFY/measure.py" --config handoff/runs/scale-config.json \
  --manifest "$MANIFEST" --app-commit e663856dfde0a0a1247d9812759164d617a000ee \
  --harness-commit 10b0cdc84b563257d68c3322c283279c99673799 --out "$RUN/scale" \
  -- ./experiment-check generate --scale 1000 --config scale --export '{out}/export'
python3 "$VERIFY/scale-check.py" "$RUN/scale" --out "$RUN/results/scale.json"
```

The recorder is unchanged from10b0cdc. Scale checker writes all five actual
results and exits nonzero for the undercount. The scale fixture has one actual
per-instance DPU exception:6001 management interfaces, not the unmodified6000;
this follows input occurrence expansion and is disclosed, not copied from an
expected output. Optics/assemblies still must be8000/2000/8000.

For UI timing pass the generated project directory from generate-log.json:

```sh
PLAYWRIGHT_BROWSERS_PATH="$APP/.toolchain/playwright" \
  "$APP/.toolchain/node/bin/node" "$VERIFY/ui-render.mjs" "$APP" PROJECT_DIR "$RUN/ui"
```

The browser gates output delivery until Connection review is selected, measures
parsed-data arrival to two animation frames, then five warm tab activations.
This is an observed browser paint proxy, not hardware scanout or interaction
SLO. Server is terminated afterward; recorded local URLs are not hosted demos.

Large exports stay in scratch storage; committed evidence contains exact hashes,
output identities, projections, raw timing, negative outcomes and screenshot.
Recreate exports with the commands above. Known failure evidence is not an
approval of unsupported hardware, deployability, production security or broad
scale. See `docs/design/feasibility-review.md` for criterion-level dispositions.
