#!/usr/bin/env bash
# R03 reproduction: build hhfab at a pinned tag and exercise `hhfab vlab gen`.
# Usage: repro.sh <empty-work-dir>
# Needs: git, Go >= 1.21 with GOTOOLCHAIN auto-download (fetches go1.27.3), network access to GitHub/proxy.golang.org.
# Does NOT need Docker, zot, a GitHub token, or KVM: only `init --dev`, `vlab gen*` and `validate` are run.
set -euo pipefail
W=$(cd "${1:?work dir}" && pwd)
FABRICATOR_TAG=v0.51.4   # d2316aca666eb278541276a11a5f8dae372bf629; go.mod pins fabric v0.144.1 (4bde50829fd7cfebac69332982abd1dee504a8a3)
export GOTOOLCHAIN=go1.27.3 CGO_ENABLED=0 GOPATH="$W/gopath" GOCACHE="$W/gocache"

git clone -q --branch "$FABRICATOR_TAG" https://github.com/githedgehog/fabricator "$W/fabricator"
# Mirrors justfile `_touch_embed` (placeholder embeds; enough for init/gen/validate, NOT for `hhfab build`/VLAB up).
touch "$W/fabricator/pkg/embed/recipebin/hhfab-recipe.gz" "$W/fabricator/pkg/embed/flatcaroem/oem.cpio.gz" "$W/fabricator/pkg/embed/flatcaroem/hhfab-flatcar-install"
(cd "$W/fabricator" && go build --tags containers_image_openpgp,containers_image_storage_stub,containers_image_docker_daemon_stub \
  -ldflags "-X go.githedgehog.com/fabricator/pkg/version.Version=${FABRICATOR_TAG}-local" -o "$W/hhfab" ./cmd/hhfab)
H="$W/hhfab"

run() { # name, vlab subcommand args...
  local name=$1; shift; local d="$W/runs/$name"; mkdir -p "$d"; cd "$d"
  "$H" init --dev >/dev/null 2>&1
  echo "=== $name: hhfab vlab $*"
  if HHFAB_PREVIEW=true "$H" vlab "$@" > gen.log 2>&1; then echo "gen: exit 0"; else echo "gen: exit $?"; fi
  grep -E ' (ERR|WRN) ' gen.log | sort | uniq -c | sed 's/^/  /' || true
  if [ -f include/vlab.generated.yaml ]; then
    echo "  objects: $(grep -c '^kind:' include/vlab.generated.yaml), servers: $(grep -c '^kind: Server$' include/vlab.generated.yaml), sha1: $(shasum include/vlab.generated.yaml | cut -c1-12)"
    local t0=$(date +%s)
    if "$H" validate > validate.log 2>&1; then echo "  validate: OK ($(( $(date +%s) - t0 ))s)"; else echo "  validate: FAIL: $(grep ERR validate.log | sed 's/.*validating wiring after hydrate: //')"; fi
  fi
}

run default            gen
run default-repeat     gen                                   # determinism: sha1 must equal `default`
run gpu-rail           gen-gpu-rail --units 1                # preview builder, default flags
run gpu-rail-p2p       gen-gpu-rail --units 1 --p2p
run gpu-rail-p2p-su3   gen-gpu-rail --units 3 --p2p --servers 8
run gpu-rail-p2p-su4   gen-gpu-rail --units 4 --p2p --servers 8   # exceeds VS spine ports
run unbundled-40       gen --unbundled-servers 40
run unbundled-60       gen --unbundled-servers 60            # exceeds VS leaf ports
run unbundled-300      gen --unbundled-servers 300           # uint8 truncation: 300 -> 44
run real-profile       gen --sp celestica-ds5000             # only virtual profiles accepted
