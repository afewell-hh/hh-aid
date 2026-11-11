# Independent acceptance harness (parts)

Owned by t8 / parts under #15. This subtree never imports application/engine code. Lead reviews the harness; fixture-only self-tests do not accept the app. Exact app export schema and runnable checkpoint are pending #14; the export-to-count adapter will be added against that contract, without filling omitted values from oracle files.

Python 3.9+ standard library, run from repository root:

```sh
python3 -I spikes/first-bom/verification/verify.py self-test
python3 -I spikes/first-bom/verification/verify.py materialize --out /tmp/hhaid-oracles
```

The lock pins D04's corrected checks and expected values by full commit/path/SHA-256. Materialization uses `git show`, never sibling worktrees. A clean clone must fetch the recorded commits (for example `git fetch origin 25d642363a477e2b04a06e74421da0b15e991412 9aa448a32deb62f57629ac0e5f3480ba95faab7d`) before running. Existing differing destinations are rejected. Generated files belong in a temporary directory, not the source tree.

After the export-only adapter produces an actual projection:

```sh
python3 -I spikes/first-bom/verification/verify.py projection --kind fb01 --actual /tmp/fb01-actual.json --oracles /tmp/hhaid-oracles
python3 -I spikes/first-bom/verification/verify.py projection --kind ac1 --actual /tmp/ac1-actual.json --oracles /tmp/hhaid-oracles
python3 -I spikes/first-bom/verification/verify.py roundtrip /tmp/before.hhaid.json /tmp/after.hhaid.json
```

Projection parsing rejects unsafe integers, float/exponent tokens, negative zero, non-finite constants and duplicate keys. The pinned oracle recursively rejects wrong types/keys/null states. Roundtrip compares complete export bytes; it does not alone prove that required history was originally included. Per-occurrence coverage, closure/root integrity, locked changes and grouped-member conservation need separate export checks; currently pending the schema, not marked passed.

`measure.py` records five fresh actual commands with `/usr/bin/time` peak RSS and monotonic wall time, preserving stdout/stderr/timing per run and exact config/manifest hashes. Pass immutable app/harness commits, actual config and input; use `{out}` in command tokens for a unique run directory. It never runs through a shell. Name a new output directory for each measurement set. Process exit success is not result correctness: each output must be independently verified and stage/result status must be complete within the conditional scope, not limit-reached. RSS is OS-reported process-tree maximum, not total simultaneous process memory; report that limitation. UI rendering is a separate measurement.

```sh
python3 -I spikes/first-bom/verification/measure.py --config /tmp/scale.json --manifest /tmp/scale-input.json --app-commit APP_SHA --harness-commit HARNESS_SHA --out /tmp/scale-run -- ACTUAL_CLI generate --config /tmp/scale.json --export '{out}/project.hhaid.json'
```

This command is a usage template, not an executable app claim. D05's actual named scale config must be used (not silently substituted D04 suggested limits). Preserve the disjoint 1,000-replica invariant and five samples. Default-cap tests, deadline tests and user cancellation are separate, synchronized at worker-start/S1 barriers per build assignment. Before S1 completes, no new component result is required; after completion, preserve completed independent stage results with incomplete assignment status. Stage cache key and content digest are distinct, and incomplete fragments are never reusable.
