// Build EvidenceSnapshot documents from committed evidence files (extracted profile + provenance),
// or from a controlled local revision file. Content is validated structurally; nothing is fetched.
import { readFileSync } from 'node:fs';
import { parseStrictJson } from '../contracts/json.ts';
import type { EvidenceSnapshot } from '../model/types.ts';

export function evidenceFromExtraction(profilePath: string, provenancePath: string): EvidenceSnapshot {
  const profile = parseStrictJson(readFileSync(profilePath, 'utf8')) as any;
  const prov = parseStrictJson(readFileSync(provenancePath, 'utf8')) as any;
  if (prov.origin !== 'extracted' || prov.profile !== profile.name) throw new Error('provenance does not describe this profile');
  return { kind: 'EvidenceSnapshot', origin: 'extracted', profile: { name: profile.name, spec: profile.spec }, source: prov, note: 'Compiled Fabric switch profile; representability evidence only, not hardware qualification or current-release currency.' };
}

/** A controlled local evidence revision file: {kind:"EvidenceRevision", origin:"local-modified"|"synthetic", base, note, patch:{pipelines?, maxPorts?}}. */
export function evidenceRevision(base: EvidenceSnapshot, baseId: string, file: any): EvidenceSnapshot {
  if (file.kind !== 'EvidenceRevision' || !['local-modified', 'synthetic'].includes(file.origin)) throw new Error('not an EvidenceRevision file');
  const spec = structuredClone(base.profile.spec);
  if (file.patch.pipelineMaxPorts !== undefined) for (const k of Object.keys(spec.pipelines ?? {})) spec.pipelines![k] = { maxPorts: file.patch.pipelineMaxPorts };
  if (file.patch.maxPorts !== undefined) spec.maxPorts = file.patch.maxPorts;
  return { kind: 'EvidenceSnapshot', origin: file.origin, profile: { name: base.profile.name, spec }, source: { revisionFile: file.id, note: file.note }, parentEvidence: baseId, note: `${file.origin} revision of ${base.profile.name}: ${file.note}. Not a Hedgehog release.` };
}
