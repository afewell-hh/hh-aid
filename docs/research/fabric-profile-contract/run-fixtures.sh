#!/usr/bin/env bash
# Runs the R02b fixtures through an unmodified pinned hhfab (v0.51.4 = d2316ac, fabric v0.144.1).
# Usage: run-fixtures.sh <path-to-hhfab> <empty-work-dir>
# Build hhfab exactly as docs/research/upstream-reuse/repro.sh (R03) does. Needs python3 (stdlib + PyYAML-free).
set -euo pipefail
H=$(cd "$(dirname "$1")" && pwd)/$(basename "$1"); W=$(cd "${2:?work dir}" && pwd)
F=$(cd "$(dirname "$0")" && pwd)
"$H" --version
run() { # name, wiring-file, [fab_patch]
  local d="$W/$1"; rm -rf "$d"; mkdir -p "$d"; cd "$d"
  "$H" init --dev -w "$2" > init.log 2>&1 || { echo "$1: init FAIL: $(grep -E 'ERR' init.log | tail -1)"; return; }
  if [ "${3:-}" = allowExtraSwitchProfiles ]; then   # documented Fabricator field spec.config.fabric.allowExtraSwitchProfiles
    sed -i.bak 's/^      includeBCM: true/      includeBCM: true\n      allowExtraSwitchProfiles: true/' fab.yaml
    grep -q '^      allowExtraSwitchProfiles: true' fab.yaml || { echo "$1: fab.yaml patch FAIL"; return; }
  fi
  if "$H" validate > validate.log 2>&1; then echo "$1: validate OK"; else echo "$1: validate FAIL: $(grep ERR validate.log | tail -1 | sed 's/.*msg=//')"; fi
}
run positive "$F/positive-multi-fabric-server.yaml"
python3 -I - "$F" "$W" <<'PY' | while IFS=$'\t' read -r id file patch; do run "$id" "$file" "$patch"; done
import sys, json, re, pathlib
F, W = map(pathlib.Path, sys.argv[1:3])
base = (F / "positive-multi-fabric-server.yaml").read_text()
# minimal parser for the cases file: block scalars and double-quoted strings only (no PyYAML dependency)
text = (F / "negative-cases.yaml").read_text()
cases, cur, key, block = [], None, None, None
for line in text.splitlines():
    if block is not None:
        if line.startswith("    ") or line == "":
            block.append(line[4:]); continue
        cur[key] = "\n".join(block).rstrip("\n") + "\n"; block = None
    m = re.match(r"^- id: (\S+)", line)
    if m: cur = {"id": m.group(1)}; cases.append(cur); continue
    m = re.match(r"^  (\w+): (.*)$", line)
    if m and cur is not None:
        key, val = m.groups()
        if val == "|": block = []
        elif val.startswith('"'): cur[key] = json.loads(val)
        else: cur[key] = val
if block is not None: cur[key] = "\n".join(block).rstrip("\n") + "\n"
for c in cases:
    assert base.count(c["find"]) == 1, (c["id"], base.count(c["find"]))
    out = base.replace(c["find"], c["replace"])
    if "append" in c: out += "\n---\n" + c["append"]
    p = W / f'{c["id"]}.yaml'; p.write_text(out)
    print(f'{c["id"]}\t{p}\t{c.get("fab_patch", "")}')
PY
