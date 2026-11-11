// Synthetic AC1 projects (no population demands). Base shape from the manifest's FB-AC1 entry
// (configured_children_per_parent [4,4], shared_budget 6, selected child 1 of each parent, assigned 0;
// scenario.json @ce4b8e6). The reservation and unknown-mode variants follow the AC1 text of the accepted
// allocation contract (port-allocation-contract.md @d97a2ef §3). The manifest's `expected` text is not read.
import { unknown } from '../contracts/quantity.ts';
import type { EvidenceSnapshot, ProjectState } from './types.ts';

export const AC1_VARIANTS = ['over-budget', 'reserve-selected', 'reserve-unselected', 'unused-mode-unknown'] as const;
export type Ac1Variant = typeof AC1_VARIANTS[number];

export function ac1Evidence(m: any): EvidenceSnapshot {
  const a = m.mutations.find((x: any) => x.id === 'FB-AC1'); if (!a?.synthetic_only) throw new Error('manifest has no synthetic FB-AC1 entry');
  const children = a.configured_children_per_parent as number[];
  const modes = Object.fromEntries([...new Set(children)].map(n => [`${n}x100G`, { offsets: Array.from({ length: n }, (_, k) => String(k)) }]));
  return {
    kind: 'EvidenceSnapshot', origin: 'synthetic',
    profile: { name: 'synthetic-ac1', spec: { ports: Object.fromEntries(children.map((_, k) => [`P${k + 1}`, { label: String(k + 1), profile: 'SYN', pipeline: 'S' }])), portProfiles: { SYN: { breakout: { default: `${children[0]}x100G`, supported: modes } } }, pipelines: { S: { maxPorts: a.shared_budget } } } },
    source: { manifestMutation: 'FB-AC1', contract: 'port-allocation-contract.md@d97a2ef §3' },
    note: 'Synthetic shared resource for AC1; planning arithmetic, not a hardware claim.',
  };
}

export function ac1State(m: any, variant: Ac1Variant, projectId: string, evidenceId: string): ProjectState {
  const a = m.mutations.find((x: any) => x.id === 'FB-AC1');
  const children = a.configured_children_per_parent as number[]; const sel = a.selected_children_per_parent as number[];
  const modes: Record<string, any> = Object.fromEntries(children.map((n, k) => [`P${k + 1}`, `${n}x100G`]));
  let labels = children.map((_, k) => k + 1); const reservations: any[] = [];
  if (variant === 'reserve-selected') reservations.push({ id: 'RES-1', owner: 'engineer', reason: 'reserve a selected child', labels: [1], children: [1] });
  if (variant === 'reserve-unselected') reservations.push({ id: 'RES-1', owner: 'engineer', reason: 'reserve a child outside the selection', labels: [1], children: [children[0]!] });
  if (variant === 'unused-mode-unknown') { modes.P2 = unknown('configured-mode-unknown', 'synthetic:AC1 unused parent'); labels = [1]; }
  if (new Set(sel).size !== 1) throw new Error('AC1 selector expects the same child on each parent');
  return {
    kind: 'InputRevision', format: 'hhaid/1', projectId, revision: 1, parent: null, change: `synthetic AC1 ${variant}`, seed: null, evidence: [evidenceId],
    classes: [], populations: [], networks: [], constructions: [], demandOrder: [], locks: [], missingInfrastructure: [], unresolved: ['synthetic shared resource; no hardware meaning'],
    leafContexts: [{ id: 'AC1', label: 'AC1 synthetic shared resource', profile: { evidenceId, name: 'synthetic-ac1' }, instanceQuantity: 1, modes,
      serverGroup: { id: 'AC1-SEL', purpose: 'selected children', selector: { labels, children: [sel[0]!] }, sourceSelector: `parents ${labels.join(',')} child ${sel[0]}` },
      reservations, unusedLabels: [], excludedPorts: [] }],
  };
}
