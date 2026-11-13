#!/usr/bin/env bash
# Download the pinned Node.js LTS into .toolchain/ and verify it against nodejs.org SHASUMS256.txt.
# Usage: scripts/bootstrap-node.sh   then: export PATH="$PWD/.toolchain/node/bin:$PATH"
set -euo pipefail
NODE_VERSION="$(cat "$(dirname "$0")/../.nvmrc")"
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) PLAT=darwin-arm64 ;; Darwin-x86_64) PLAT=darwin-x64 ;;
  Linux-x86_64) PLAT=linux-x64 ;; Linux-aarch64) PLAT=linux-arm64 ;;
  *) echo "unsupported platform $(uname -s)-$(uname -m)" >&2; exit 1 ;;
esac
DIR="$(cd "$(dirname "$0")/.." && pwd)/.toolchain"; mkdir -p "$DIR"; cd "$DIR"
TARBALL="node-${NODE_VERSION}-${PLAT}.tar.gz"
BASE="https://nodejs.org/dist/${NODE_VERSION}"
curl -fsSLO "$BASE/$TARBALL"; curl -fsSLO "$BASE/SHASUMS256.txt"
grep " ${TARBALL}\$" SHASUMS256.txt | shasum -a 256 -c -
rm -rf node && mkdir node && tar -xzf "$TARBALL" -C node --strip-components 1
echo "node $(node/bin/node --version) at $DIR/node/bin (sha256 verified against $BASE/SHASUMS256.txt)"
