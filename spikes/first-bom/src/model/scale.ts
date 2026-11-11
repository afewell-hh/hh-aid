// Deterministic scale derivative of FB-01 (verification-strategy.md @25d6423, `fb01-scale-1000`): N disjoint
// replicas, each with its own populations, networks, leaf contexts and constructions, unchanged local
// pairing/rail constraints and unique IDs. Replica 1 carries one per-instance exception: its A01 server is
// split into its own population whose class takes the FB-DPU variation (A02 keeps the base class).
import { MUTATIONS } from './mutations.ts';
import type { ProjectState } from './types.ts';

export function replicate(base: ProjectState, n: number): ProjectState {
  if (!Number.isSafeInteger(n) || n < 1 || n > 100_000) throw new Error('replica count out of range');
  const out: ProjectState = { ...structuredClone(base), change: `scale derivative: ${n} disjoint FB-01 replicas`, populations: [], networks: [], leafContexts: [], constructions: [] };
  const dpu = MUTATIONS['FB-DPU']!(base).classes.find(c => c.id === 'A')!;
  out.classes = [...base.classes, { ...dpu, id: 'A-x', label: `${dpu.label} (per-instance DPU split)` }];
  for (let g = 1; g <= n; g++) {
    const t = `g${String(g).padStart(5, '0')}`; const sfx = (id: string) => `${id}-${t}`;
    for (const c of base.constructions) out.constructions.push({ ...structuredClone(c), id: sfx(c.id), network: sfx(c.network) });
    for (const x of base.networks) out.networks.push({ ...structuredClone(x), id: sfx(x.id), leafContext: sfx(x.leafContext), construction: sfx(x.construction) });
    for (const lc of base.leafContexts) out.leafContexts.push({ ...structuredClone(lc), id: sfx(lc.id), serverGroup: { ...structuredClone(lc.serverGroup), id: sfx(lc.serverGroup.id) }, reservations: lc.reservations.map(r => ({ ...r, id: sfx(r.id) })) });
    for (const p of base.populations) {
      const occ = ('list' in p.occurrences ? p.occurrences.list : []).map(o => `${o}-${t}`);
      const dest = Object.fromEntries(Object.entries(p.destinations).map(([k, v]) => [k, sfx(v)]));
      if (g === 1 && p.classId === 'A') {
        out.populations.push({ ...p, id: sfx(p.id), occurrences: { list: occ.slice(1) }, destinations: dest });
        out.populations.push({ id: sfx(`${p.id}-x`), classId: 'A-x', classRevision: dpu.revision, occurrences: { list: occ.slice(0, 1) }, destinations: dest });
      } else out.populations.push({ ...p, id: sfx(p.id), occurrences: { list: occ }, destinations: dest });
    }
  }
  return out;
}
