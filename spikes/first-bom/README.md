# hh-aid first-BOM experiment (#14)

**Experiment, not production software.** A local, single-user application that saves editable projects and generates a traceable *conditional* BOM for the FB-01 scenario. It emits no Hedgehog wiring, makes no hardware-qualification claim, and keeps unknown quantities explicit.

The architecture is described in [D05 architecture-options.md @75ba523](https://github.com/afewell-hh/hh-aid/blob/75ba52328699c036c368d6700325011556d38615/docs/design/architecture-options.md). The scope and acceptance criteria are in [docs/first-bom-build.md @6a91fd1](https://github.com/afewell-hh/hh-aid/blob/6a91fd117a5b144edb83835a85021d9f57748069/docs/first-bom-build.md). The `verification/` subtree belongs to t8 / parts (#15).

## Set up from a clean clone

```sh
cd spikes/first-bom
scripts/bootstrap-node.sh                      # Node v26.13.0 into .toolchain/, sha256-checked against nodejs.org SHASUMS256.txt
export PATH="$PWD/.toolchain/node/bin:$PATH"
npm ci                                         # exact pins; install scripts disabled (.npmrc)
npm run sources:materialize                    # git-fetches and verifies the 18 locked inputs (sources.lock.json)
npm run ui:build
PLAYWRIGHT_BROWSERS_PATH=$PWD/.toolchain/playwright npx playwright install chromium   # only needed for e2e
```

## Run

```sh
bin/hhaid new /tmp/fb01 --name FB-01
bin/hhaid seed /tmp/fb01 --manifest fixtures/materialized/generation/ce4b8e6/docs/design/first-bom/scenario.json --manifest-commit ce4b8e6
bin/hhaid generate /tmp/fb01                   # [--config interactive|scale] [--deadline-ms N]
bin/hhaid edit /tmp/fb01 --mutation FB-DPU     # FB-COUNT | FB-UNKNOWN-MODE | FB-EXHAUST | FB-LOCK | --patch ops.json
bin/hhaid assess /tmp/fb01                     # derived stale/current view; history is never rewritten
bin/hhaid export /tmp/fb01 -o /tmp/fb01.hhaid.json && bin/hhaid import /tmp/fb01.hhaid.json /tmp/fb01-copy
npm run app -- /tmp/fb01                       # local UI; open the printed http://127.0.0.1:PORT/#token=... URL
```

## Test

```sh
npm run typecheck && npm test                  # node:test unit, behavior, persistence, runner tests
PLAYWRIGHT_BROWSERS_PATH=$PWD/.toolchain/playwright npm run e2e
```

## Layout

| Path | Purpose |
| --- | --- |
| `src/contracts/` | Strict JSON parser (safe integers checked on the source text, duplicate keys rejected), canonical JSON, digests, checked quantities, schema validation |
| `src/model/` | Typed project state; the FB-01 seed importer, which never reads author answers; named mutations |
| `src/engine/` | Pure stages S1–S5, orchestration, diff, impact and assess |
| `src/runner/` | Worker-thread runner with deadline and cancellation; stage-result persistence |
| `src/store/` | Immutable content-addressed documents, `ProjectIndex` chain, atomic `HEAD`, closure-checked export and import |
| `src/cli/`, `src/server/`, `ui/` | CLI, the loopback-only server (session token and Host check), and the React UI |
| `evidence/` | `celestica-ds5000` extracted from Fabric v0.144.1 by `tools/profile-export` (Go, build-time only) |
| `schemas/` | JSON Schema for every exported document kind |
| `fixtures/evidence-revisions/` | Controlled local evidence revision (FB-EVIDENCE); synthetic, not a Hedgehog release |
