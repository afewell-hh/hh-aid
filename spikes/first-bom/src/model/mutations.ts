// Named edits from the FB-01 manifest `mutations[].change` text (scenario.json @ce4b8e6). Each returns a
// new state (the caller makes it a new revision). Expected deltas in the manifest are never read.
import { unknown } from '../contracts/quantity.ts';
import type { ProjectState } from './types.ts';

const clone = <T>(x: T): T => structuredClone(x);
const ctx = (s: ProjectState, id: string) => { const c = s.leafContexts.find(x => x.id === id); if (!c) throw new Error(`no context ${id}`); return c; };

export const MUTATIONS: Record<string, (s: ProjectState) => ProjectState> = {
  /** "A dual-port DPU -> two single-port DPUs per server": replacement lineage, ports remapped, frontend links kept. */
  'FB-DPU'(s) {
    const n = clone(s); const a = n.classes.find(c => c.id === 'A')!;
    const old = a.components.find(c => c.item === 'frontend_dual_dpu_200')!;
    const slot = 'A/separate/frontend_single_dpu_200';
    a.components = a.components.filter(c => c !== old);
    a.components.push({ slot, item: 'frontend_single_dpu_200', label: 'frontend single dpu 200', qtyPerUnit: 2, acquisition: 'separate', managementInterfaces: old.managementInterfaces ?? 0, replaces: [old.slot] });
    a.attachments = a.attachments.map(at => at.slot !== old.slot ? at : { ...at, slot, port: at.port === 'dpu1/p2' ? 'dpu2/p1' : at.port });
    a.revision = `${a.revision}+dpu-split`;
    for (const p of n.populations) if (p.classId === 'A') p.classRevision = a.revision;
    n.change = 'FB-DPU: A dual-port DPU replaced by two single-port DPUs';
    return n;
  },
  /** "A occurrences become A01,A02,A03": existing occurrence IDs preserved, one appended. */
  'FB-COUNT'(s) {
    const n = clone(s); const p = n.populations.find(x => x.classId === 'A')!;
    if (!('list' in p.occurrences)) throw new Error('FB-COUNT expects an explicit list');
    p.occurrences.list = [...p.occurrences.list, 'A03'];
    n.change = 'FB-COUNT: add A03'; return n;
  },
  /** "LC-FE unused label32 mode null". */
  'FB-UNKNOWN-MODE'(s) {
    const n = clone(s); const c = ctx(n, 'LC-FE');
    c.modes['E1/32'] = unknown('mode-removed-by-edit', 'mutation:FB-UNKNOWN-MODE');
    n.change = 'FB-UNKNOWN-MODE: LC-FE unused label 32 mode unknown'; return n;
  },
  /** "FE-SERVER selection only label1 for eight demands"; "fixed one occurrence". */
  'FB-EXHAUST'(s) {
    const n = clone(s); const c = ctx(n, 'LC-FE');
    c.serverGroup.selector = { labels: [1] }; c.serverGroup.sourceSelector = 'printed [1]'; c.instanceQuantity = 1;
    n.change = 'FB-EXHAUST: FE selection label 1 only, one fixed FE leaf occurrence'; return n;
  },
  /** "retain explicit FE demand at label1 child1 then remove label1 from selection". */
  'FB-LOCK'(s) {
    const n = clone(s); const c = ctx(n, 'LC-FE');
    n.locks = [...n.locks, { id: 'LOCK-FE-1', demand: 'DEM/A01/dpu1/p1', context: 'LC-FE', label: 1, child: 1, reason: 'explicit engineer binding' }];
    c.serverGroup.selector = { labels: c.serverGroup.selector.labels.filter(l => l !== 1) };
    c.serverGroup.sourceSelector = `${c.serverGroup.sourceSelector} minus [1]`;
    n.change = 'FB-LOCK: lock A01 dpu1/p1 at label 1 child 1, then remove label 1 from FE selection'; return n;
  },
  /** Lock only (no removal): used to show a valid lock is consumed first. */
  'FB-LOCK-VALID'(s) {
    const n = clone(s);
    n.locks = [...n.locks, { id: 'LOCK-FE-1', demand: 'DEM/A01/dpu1/p1', context: 'LC-FE', label: 1, child: 1, reason: 'explicit engineer binding' }];
    n.change = 'lock A01 dpu1/p1 at LC-FE label 1 child 1'; return n;
  },
  /** Invalid-context case (topology-engine.md negative table): bind B's frontend to the backend network. */
  'FB-INVALID-CONTEXT'(s) {
    const n = clone(s); const p = n.populations.find(x => x.classId === 'B')!;
    p.destinations = { ...p.destinations, frontend: 'NET-BE' };
    n.change = 'invalid: B frontend bound to NET-BE'; return n;
  },
};
