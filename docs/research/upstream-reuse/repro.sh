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
FABRICATOR_COMMIT=d2316aca666eb278541276a11a5f8dae372bf629
actual_commit=$(git -C "$W/fabricator" rev-parse HEAD)
if [[ "$actual_commit" != "$FABRICATOR_COMMIT" ]]; then
  echo "Fabricator source mismatch: expected $FABRICATOR_COMMIT, got $actual_commit" >&2
  exit 1
fi
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

# Revision 2 parity probe (G1): offline validation vs CRD schema. Remove the second link of the first ESLAG
# connection in the default wiring; the pinned CRD declares eslag.links minItems: 2, so a real API server is
# expected to reject it (NOT executed here: no cluster). Offline `hhfab validate` result is recorded.
d="$W/runs/parity-eslag-1link"; mkdir -p "$d"; cd "$d"
"$H" init --dev >/dev/null 2>&1; "$H" vlab gen >/dev/null 2>&1
awk '
  /name: server-01--eslag--leaf-01--leaf-02$/ {inconn=1}
  inconn && /^    - server:$/ {nlink++}
  inconn && nlink==2 && /^    - server:$/ {skip=4}
  skip>0 {skip--; next}
  /^---$/ {inconn=0; nlink=0}
  {print}' include/vlab.generated.yaml > include/tmp && mv include/tmp include/vlab.generated.yaml
echo "=== parity-eslag-1link: ESLAG connection with 1 link (CRD minItems: 2)"
echo "  links in server-01 eslag: $(awk '/name: server-01--eslag/{f=1} f&&/^---$/{exit} f&&/- server:/{n++} END{print n+0}' include/vlab.generated.yaml)"
if "$H" validate > validate.log 2>&1; then echo "  validate: OK (offline accepts; CRD schema would reject — not executed)"; else echo "  validate: FAIL: $(grep ERR validate.log)"; fi
