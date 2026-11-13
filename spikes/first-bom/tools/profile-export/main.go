// Command profile-export writes the compiled celestica-ds5000 SwitchProfile from the pinned
// Fabric module as JSON, plus a provenance record. Build-time tool for the #14 experiment only;
// the application never links or runs Go. Usage: go run . <out.json> <provenance.json>
package main

import (
	"crypto/sha1" //nolint:gosec // git blob id, not a security digest
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	"go.githedgehog.com/fabric/pkg/ctrl/switchprofile"
)

const modulePath = "go.githedgehog.com/fabric"
const sourceFile = "pkg/ctrl/switchprofile/p_bcm_celestica_ds5000.go"

func must(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func main() {
	if len(os.Args) != 3 {
		must(fmt.Errorf("usage: profile-export <out.json> <provenance.json>"))
	}
	p := switchprofile.CelesticaDS5000
	doc := map[string]any{"name": p.Name, "spec": p.Spec}
	out, err := json.MarshalIndent(doc, "", "  ")
	must(err)
	out = append(out, '\n')
	must(os.WriteFile(os.Args[1], out, 0o644))

	var mod struct{ Version, Dir, Sum, GoModSum string }
	raw, err := exec.Command("go", "list", "-m", "-json", modulePath).Output()
	must(err)
	must(json.Unmarshal(raw, &mod))
	src, err := os.ReadFile(filepath.Join(mod.Dir, sourceFile))
	must(err)
	blob := sha1.Sum(append([]byte(fmt.Sprintf("blob %d\x00", len(src))), src...)) //nolint:gosec
	srcSHA := sha256.Sum256(src)
	outSHA := sha256.Sum256(out)
	prov := map[string]any{
		"schema":           "hhaid-extraction-provenance/1",
		"origin":           "extracted",
		"profile":          p.Name,
		"module":           modulePath,
		"module_version":   mod.Version,
		"module_sum":       mod.Sum,
		"expected_commit":  "4bde50829fd7cfebac69332982abd1dee504a8a3",
		"source_file":      sourceFile,
		"source_git_blob":  hex.EncodeToString(blob[:]),
		"source_sha256":    hex.EncodeToString(srcSHA[:]),
		"output_file":      filepath.Base(os.Args[1]),
		"output_sha256":    hex.EncodeToString(outSHA[:]),
		"go_toolchain":     runtime.Version(),
		"command":          "GOTOOLCHAIN=" + strings.TrimSpace(os.Getenv("GOTOOLCHAIN")) + " go run . " + filepath.Base(os.Args[1]) + " " + filepath.Base(os.Args[2]),
	}
	pj, err := json.MarshalIndent(prov, "", "  ")
	must(err)
	must(os.WriteFile(os.Args[2], append(pj, '\n'), 0o644))
	fmt.Printf("wrote %s (sha256 %s) from %s@%s\n", os.Args[1], prov["output_sha256"], modulePath, mod.Version)
}
