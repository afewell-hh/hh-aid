// Pure, synchronous engine stages S1–S5 (architecture-options.md §9.1 @75ba523; staged constructive
// method, topology-engine.md @ce4b8e6). No I/O, clock, randomness, await or signal checks. Every stage is
// a function of (input state, evidence, run configuration, engine version, earlier stage results).
import { byId, digestOf } from '../contracts/canonical.ts';
import { type Q, ceilDiv, checkedAdd, checkedMul, isKnown, sumQ, unknown } from '../contracts/quantity.ts';
import type { Construction, EvidenceSnapshot, LeafContext, ProjectState } from '../model/types.ts';

export const ENGINE_VERSION = 'hhaid-engine/0.1.0';
export const RULE_REVISION = 'FB-constructive-v1-proposed';

export interface RunConfig {
  id: string;
  maxMaterializedOccurrences: number;
  maxDemandTerminations: number;
  maxCandidateSwitches: number;
  maxCandidateInspections: number;
}
// Provisional, unmeasured values (architecture-options.md §9.2). Deadlines live in the runner, not here.
export const RUN_CONFIGS: Record<string, RunConfig> = {
  interactive: { id: 'interactive', maxMaterializedOccurrences: 10_000, maxDemandTerminations: 10_000, maxCandidateSwitches: 256, maxCandidateInspections: 2_000_000 },
  scale: { id: 'scale', maxMaterializedOccurrences: 100_000, maxDemandTerminations: 100_000, maxCandidateSwitches: 8_192, maxCandidateInspections: 250_000_000 },
};

export type Diagnostic = { code: string; severity: 'conflict' | 'unresolved' | 'limit' | 'info'; affected: string[]; observed?: unknown; required?: unknown; cause: string; remedies?: string[] };
export interface StageCtx { state: ProjectState; evidence: Record<string, EvidenceSnapshot>; config: RunConfig; prior: Record<string, any> }
export type LimitHit = { limit: keyof RunConfig; observed: number; allowed: number; stage: string };

const bad = (cause: string): never => { throw new Error(`invalid input: ${cause}`); };

// ---------------------------------------------------------------- S1: identity, expansion, accounting
export interface Demand { id: string; occurrence: string; population: string; classId: string; classRevision: string; port: string; slot: string; item: string; role: string; network: string; context: string; rate: number; rail?: string; portIndex: number }

function occurrenceCount(p: ProjectState['populations'][number]): Q {
  return 'list' in p.occurrences ? p.occurrences.list.length : p.occurrences.range.count;
}
function occurrenceIds(p: ProjectState['populations'][number]): string[] {
  if ('list' in p.occurrences) return p.occurrences.list;
  const r = p.occurrences.range; const n = r.count as number;
  return Array.from({ length: n }, (_, k) => `${r.prefix}${String(r.start + k).padStart(r.width, '0')}`);
}

export function s1(ctx: StageCtx) {
  const { state, config } = ctx;
  const diagnostics: Diagnostic[] = [];
  const classes = new Map(state.classes.map(c => [c.id, c]));
  const networks = new Map(state.networks.map(n => [n.id, n]));
  const contexts = new Set(state.leafContexts.map(c => c.id));
  // reference and identity validation
  const seenOcc = new Set<string>();
  for (const n of state.networks) if (!contexts.has(n.leafContext)) bad(`network ${n.id} references missing context ${n.leafContext}`);
  for (const p of state.populations) {
    const c = classes.get(p.classId) ?? bad(`population ${p.id} references missing class ${p.classId}`);
    if (c.revision !== p.classRevision) bad(`population ${p.id} pins ${p.classId}@${p.classRevision}, class is @${c.revision}`);
    for (const a of c.attachments) if (!p.destinations[a.role] || !networks.has(p.destinations[a.role]!)) bad(`population ${p.id} has no network for role ${a.role}`);
    if ('list' in p.occurrences) for (const o of p.occurrences.list) { if (seenOcc.has(o)) bad(`duplicate physical server ${o}`); seenOcc.add(o); }
  }
  // requirements: checked aggregate arithmetic, no materialization needed
  const requirements: any[] = [];
  let management: Q = 0;
  for (const p of [...state.populations].sort((a, b) => byId(a.id, b.id))) {
    const c = classes.get(p.classId)!; const units = occurrenceCount(p);
    for (const comp of [...c.components].sort((a, b) => byId(a.slot, b.slot))) {
      const installed = checkedMul(units, comp.qtyPerUnit, `REQ/${p.id}/${comp.slot}`);
      const purchaseNeed: Q = comp.acquisition === 'separate' ? installed : comp.acquisition === 'included' ? 0 : unknown('bundle-inclusion-unknown', `class:${c.id}@${c.revision}/${comp.slot}`);
      requirements.push({ id: `REQ/${p.id}/${comp.slot}`, population: p.id, classId: c.id, classRevision: c.revision, slot: comp.slot, item: comp.item, perUnit: comp.qtyPerUnit, units, installed, acquisition: comp.acquisition, ...(comp.coveredBy ? { coveredBy: `REQ/${p.id}/${comp.coveredBy}` } : {}), purchaseNeed, ...(comp.replaces ? { replaces: comp.replaces } : {}) });
      if (comp.managementInterfaces) management = checkedAdd(management, checkedMul(installed, comp.managementInterfaces, `MGMT/${p.id}/${comp.slot}`), 'management');
    }
  }
  const servers = sumQ(state.populations.map(occurrenceCount), 'servers');
  // demand materialization, bounded by the run configuration (lead clarification 2)
  const demandCount = sumQ(state.populations.map(p => checkedMul(occurrenceCount(p), classes.get(p.classId)!.attachments.length, `demands/${p.id}`)), 'demands');
  let limit: LimitHit | null = null;
  if (!isKnown(servers) || !isKnown(demandCount)) {
    diagnostics.push({ code: 'population-count-unknown', severity: 'unresolved', affected: state.populations.filter(p => !isKnown(occurrenceCount(p))).map(p => p.id), cause: 'an unknown population count leaves demands unmaterialized' });
  } else if (servers > config.maxMaterializedOccurrences) {
    limit = { limit: 'maxMaterializedOccurrences', observed: servers, allowed: config.maxMaterializedOccurrences, stage: 'S1' };
  } else if (demandCount > config.maxDemandTerminations) {
    limit = { limit: 'maxDemandTerminations', observed: demandCount, allowed: config.maxDemandTerminations, stage: 'S1' };
  }
  let demands: Demand[] | null = null;
  if (!limit && isKnown(demandCount)) {
    demands = [];
    for (const p of state.populations) {
      const c = classes.get(p.classId)!;
      for (const o of occurrenceIds(p)) c.attachments.forEach((a, portIndex) => {
        const net = networks.get(p.destinations[a.role]!)!;
        const item = c.components.find(x => x.slot === a.slot)?.item ?? bad(`attachment ${a.port} references missing slot ${a.slot}`);
        demands!.push({ id: `DEM/${o}/${a.port}`, occurrence: o, population: p.id, classId: c.id, classRevision: c.revision, port: a.port, slot: a.slot, item, role: a.role, network: net.id, context: net.leafContext, rate: a.rate, ...(a.rail ? { rail: a.rail } : {}), portIndex });
      });
    }
    const keyOf = (d: Demand) => [d.network, d.classId, d.occurrence, String(d.portIndex).padStart(6, '0')];
    demands.sort((x, y) => { const a = keyOf(x), b = keyOf(y); for (let k = 0; k < a.length; k++) { const c = byId(a[k]!, b[k]!); if (c) return c; } return 0; });
  }
  if (limit) diagnostics.push({ code: 'limit-reached', severity: 'limit', affected: [], observed: limit.observed, required: limit.allowed, cause: `${limit.limit} exceeded in S1; component lines are complete, demand-level detail is unresolved`, remedies: ['run with a larger named configuration', 'reduce the population'] });
  return { servers, managementInterfaces: management, demandCount, requirements, demands, limit, diagnostics };
}

// ---------------------------------------------------------------- S2: whole-switch configured ledger
function modeChildren(ev: EvidenceSnapshot, port: string, mode: string): number | 'invalid' {
  const p = ev.profile.spec.ports[port]; const prof = p?.profile ? ev.profile.spec.portProfiles[p.profile] : undefined;
  if (!prof) return 'invalid';
  if (prof.breakout) { if (!prof.breakout.supported[mode]) return 'invalid'; return prof.breakout.supported[mode]!.offsets.length; }
  if (prof.speed) return prof.speed.supported.includes(mode) ? 1 : 'invalid';
  return 'invalid';
}
export const childRate = (mode: string) => { const m = /^(\d+)x(\d+)G$/.exec(mode); return m ? Number(m[2]) : null; };

export function s2(ctx: StageCtx) {
  const ledgers: any[] = []; const diagnostics: Diagnostic[] = []; const contexts: any[] = [];
  for (const lc of [...ctx.state.leafContexts].sort((a, b) => byId(a.id, b.id))) {
    const ev = ctx.evidence[lc.profile.evidenceId] ?? bad(`context ${lc.id} references missing evidence`);
    if (ev.profile.name !== lc.profile.name) bad(`context ${lc.id} profile ${lc.profile.name} != evidence ${ev.profile.name}`);
    const scopes = new Map<string, { known: number; unknownPorts: string[]; limit: number | null }>();
    const scope = (id: string, limit: number | null) => { if (!scopes.has(id)) scopes.set(id, { known: 0, unknownPorts: [], limit }); return scopes.get(id)!; };
    const sw = scope('switch', ev.profile.spec.maxPorts ?? null);
    for (const port of Object.keys(ev.profile.spec.ports).sort(byId)) {
      const pp = ev.profile.spec.ports[port]!; if (pp.management) continue;
      const mode = lc.modes[port];
      const targets = [sw, ...(pp.pipeline ? [scope(`pipeline:${pp.pipeline}`, ev.profile.spec.pipelines?.[pp.pipeline]?.maxPorts ?? null)] : [])];
      if (mode === undefined || typeof mode !== 'string') { for (const t of targets) t.unknownPorts.push(port); continue; }
      const n = modeChildren(ev, port, mode);
      if (n === 'invalid') { diagnostics.push({ code: 'mode-not-supported', severity: 'conflict', affected: [`${lc.id}/${port}`], observed: mode, cause: `mode ${mode} is not supported by profile port ${port}` }); for (const t of targets) t.unknownPorts.push(port); continue; }
      for (const t of targets) t.known += n;
    }
    const order = (a: string, b: string) => { if (a === 'switch' || b === 'switch') return a === b ? 0 : a === 'switch' ? -1 : 1; const x = a.split(':')[1]!, y = b.split(':')[1]!; const nx = /^\d+$/.test(x), ny = /^\d+$/.test(y); return nx && ny ? Number(x) - Number(y) : nx ? -1 : ny ? 1 : byId(x, y); };
    for (const id of [...scopes.keys()].sort(order)) {
      const s = scopes.get(id)!;
      const status = s.limit !== null && s.known > s.limit ? 'conflict' : s.unknownPorts.length ? 'unresolved' : 'within-budget';
      const diagnostic = status === 'conflict' ? 'configured-budget-exceeded' : status === 'unresolved' ? 'configured-mode-unknown' : null;
      const total: Q = s.unknownPorts.length ? unknown('configured-mode-unknown', `${lc.id}:${s.unknownPorts.join(',')}`) : s.known;
      ledgers.push({ id: `LEDGER/${lc.id}/${id}`, context: lc.id, scope: id, knownConfigured: s.known, configuredTotal: total, limit: s.limit, unknownPorts: s.unknownPorts, status, diagnostic, evidence: lc.profile.evidenceId });
      if (status !== 'within-budget') diagnostics.push({ code: diagnostic!, severity: status === 'conflict' ? 'conflict' : 'unresolved', affected: [`${lc.id}/${id}`], observed: s.known, required: s.limit, cause: status === 'conflict' ? `configured usage ${s.known} exceeds ${id} limit ${s.limit} regardless of selection` : `configured mode unknown for ${s.unknownPorts.join(', ')}; known contribution ${s.known} retained, total unresolved`, remedies: status === 'conflict' ? ['change configured modes (new revision)', 'choose another profile'] : ['supply the configured mode'] });
    }
    const pipelines = ledgers.filter(l => l.context === lc.id && l.scope !== 'switch');
    const worst = pipelines.some(l => l.status === 'conflict') || ledgers.find(l => l.context === lc.id && l.scope === 'switch').status === 'conflict' ? 'conflict' : ledgers.some(l => l.context === lc.id && l.status === 'unresolved') ? 'unresolved' : 'within-budget';
    const knownMax = pipelines.reduce((m, l) => Math.max(m, l.knownConfigured), 0);
    contexts.push({ context: lc.id, status: worst, configured: ledgers.find(l => l.context === lc.id && l.scope === 'switch').configuredTotal, maxPipelineKnown: knownMax });
  }
  return { ledgers, contexts, diagnostics };
}

// ---------------------------------------------------------------- S3: selection and reservation
export function s3(ctx: StageCtx) {
  const groups: any[] = []; const diagnostics: Diagnostic[] = [];
  for (const lc of [...ctx.state.leafContexts].sort((a, b) => byId(a.id, b.id))) {
    const ev = ctx.evidence[lc.profile.evidenceId]!;
    const l2p = new Map(Object.entries(ev.profile.spec.ports).filter(([, p]) => p.label && !p.management).map(([n, p]) => [Number(p.label), n]));
    const childrenOf = (label: number): number | null => { const port = l2p.get(label); const m = port ? lc.modes[port] : undefined; if (!port || typeof m !== 'string') return null; const n = modeChildren(ev, port, m); return n === 'invalid' ? null : n; };
    const childSel = lc.serverGroup.selector.children;
    const reservedMembers = new Set<string>();
    let uplinkReserved = 0;
    for (const r of lc.reservations) for (const l of r.labels) { const n = childrenOf(l); if (n === null) continue; for (let k = 1; k <= n; k++) if (!r.children || r.children.includes(k)) { reservedMembers.add(`${l}/${k}`); if (r.owner === 'uplink') uplinkReserved++; } }
    const seen = new Set<number>(); let selected = 0, reservedSelected = 0; const unresolvedLabels: number[] = []; const usableParents: { label: number; port: string; children: number }[] = [];
    for (const l of lc.serverGroup.selector.labels) {
      if (seen.has(l)) { diagnostics.push({ code: 'duplicate-selector-member', severity: 'conflict', affected: [`${lc.id}/${lc.serverGroup.id}/${l}`], cause: `label ${l} repeated in the selector; an alias never adds capacity, the repeat is ignored`, remedies: ['remove the duplicate'] }); continue; } seen.add(l);
      const n = childrenOf(l); if (n === null) { unresolvedLabels.push(l); continue; }
      let anyReserved = false;
      for (let k = 1; k <= n; k++) { if (childSel && !childSel.includes(k)) continue; selected++; if (reservedMembers.has(`${l}/${k}`)) { reservedSelected++; anyReserved = true; } }
      if (!anyReserved && !lc.unusedLabels.includes(l) && !childSel) usableParents.push({ label: l, port: l2p.get(l)!, children: n });
    }
    let unusedConfigured: Q = 0;
    for (const l of lc.unusedLabels) { const n = childrenOf(l); unusedConfigured = n === null ? unknown('configured-mode-unknown', `${lc.id}:label ${l}`) : checkedAdd(unusedConfigured, n, 'unused'); }
    if (unresolvedLabels.length) diagnostics.push({ code: 'selection-member-unresolved', severity: 'unresolved', affected: unresolvedLabels.map(l => `${lc.id}/${l}`), cause: 'selected parent has no known configured mode' });
    groups.push({ id: lc.serverGroup.id, context: lc.id, sourceSelector: lc.serverGroup.sourceSelector, selector: lc.serverGroup.selector, selected, reservedSelected, availableSelected: selected - reservedSelected, uplinkReserved, unusedConfigured, unresolvedLabels, usableParents });
  }
  return { groups, diagnostics };
}

// ---------------------------------------------------------------- S4: constructions, bounds, witnesses
export function s4(ctx: StageCtx) {
  const { state, config } = ctx; const S1 = ctx.prior.S1, S2 = ctx.prior.S2, S3 = ctx.prior.S3;
  const diagnostics: Diagnostic[] = []; const units: any[] = []; const assignments: any[] = []; const sizing: any[] = [];
  let inspections = 0, candidates = 0; let limit: LimitHit | null = null;
  const demands: Demand[] = S1.demands;
  const byNet = new Map<string, Demand[]>(); for (const d of demands) { if (!byNet.has(d.network)) byNet.set(d.network, []); byNet.get(d.network)!.push(d); }
  for (const net of [...state.networks].sort((a, b) => byId(a.id, b.id))) {
    const lc = state.leafContexts.find(c => c.id === net.leafContext)!; const group = S3.groups.find((g: any) => g.context === lc.id);
    const cons: Construction = state.constructions.find(c => c.id === net.construction) ?? bad(`network ${net.id} has no construction ${net.construction}`);
    const parentMode = (() => { const p = group.usableParents[0]; const m = p ? lc.modes[p.port] : undefined; return typeof m === 'string' ? m : null; })();
    const rate = parentMode ? childRate(parentMode) : null;
    const eligible: Demand[] = [];
    for (const d of byNet.get(net.id) ?? []) {
      if (rate !== null && d.rate !== rate) diagnostics.push({ code: 'ineligible-context', severity: 'conflict', affected: [d.id], observed: d.rate, required: rate, cause: `demand rate ${d.rate}G does not match ${lc.id} member rate ${rate}G; demand kept visible, not placed`, remedies: ['bind the role to a compatible network'] });
      else if (cons.pairing === 'same-rail' && !d.rail) diagnostics.push({ code: 'rail-missing', severity: 'conflict', affected: [d.id], cause: 'same-rail construction needs a rail identity' });
      else eligible.push(d);
    }
    // construction units
    const netUnits: any[] = [];
    if (cons.pairing === 'ordered') {
      for (let k = 0; k < eligible.length; k += cons.linksPerUnit) { const ds = eligible.slice(k, k + cons.linksPerUnit); netUnits.push({ id: `${cons.id}/${ds.map(d => d.id.slice(4)).join('+')}`, construction: cons.id, network: net.id, context: lc.id, links: ds.map(d => d.id), reservedChildren: cons.linksPerUnit - ds.length }); }
    } else {
      const rails: string[] = []; const byRail = new Map<string, Demand[]>();
      for (const d of eligible) { if (!byRail.has(d.rail!)) { byRail.set(d.rail!, []); rails.push(d.rail!); } byRail.get(d.rail!)!.push(d); }
      for (const r of rails) { const ds = byRail.get(r)!; for (let k = 0; k < ds.length; k += cons.linksPerUnit) { const part = ds.slice(k, k + cons.linksPerUnit); netUnits.push({ id: `${cons.id}/${r}/${part.map(d => d.occurrence).join('+')}`, construction: cons.id, network: net.id, context: lc.id, rail: r, links: part.map(d => d.id), reservedChildren: cons.linksPerUnit - part.length }); } }
    }
    units.push(...netUnits);
    // sizing: conditional lower bound from usable parent footprints
    const usable = group.usableParents.filter((p: any) => p.children === cons.linksPerUnit);
    const lowerBound: Q = netUnits.length === 0 ? 0 : usable.length === 0 ? unknown('no-usable-parent', `${lc.id}/${group.id}`) : ceilDiv(netUnits.length, usable.length, `${lc.id}`);
    const ledger = S2.contexts.find((c: any) => c.context === lc.id);
    const fixed = isKnown(lc.instanceQuantity) ? lc.instanceQuantity : null;
    let status: string = ledger.status === 'conflict' ? 'conflict' : ledger.status === 'unresolved' ? 'unresolved' : !isKnown(lowerBound) ? 'unresolved' : 'conditional-witness';
    if (netUnits.length && usable.length === 0) diagnostics.push({ code: 'no-usable-parent', severity: 'conflict', affected: [`${lc.id}/${group.id}`], cause: `no selected parent in ${group.id} has a free ${cons.linksPerUnit}-child footprint` });
    const witnessIds: string[] = []; let unmet: string[] = [];
    if (limit) status = 'limit-reached';
    if (status === 'conditional-witness') {
      const count = fixed ?? (lowerBound as number);
      candidates += count;
      if (candidates > config.maxCandidateSwitches) { limit = { limit: 'maxCandidateSwitches', observed: candidates, allowed: config.maxCandidateSwitches, stage: 'S4' }; status = 'limit-reached'; }
    }
    if (status === 'conditional-witness') {
      const count = fixed ?? (lowerBound as number);
      for (let w = 1; w <= count; w++) witnessIds.push(`${lc.id}/${fixed !== null ? 'SW' : 'W'}${w}`);
      // slots in stable order: occurrence, then selector order
      const slots: { occ: string; label: number; used: boolean }[] = [];
      for (const occ of witnessIds) for (const p of usable) slots.push({ occ, label: p.label, used: false });
      const placed = new Set<string>();
      const place = (u: any, slot: { occ: string; label: number }, childOf: (d: string, k: number) => number) => {
        u.links.forEach((d: string, k: number) => assignments.push({ demand: d, unit: u.id, context: lc.id, occurrence: slot.occ, label: slot.label, child: childOf(d, k), basis: fixed !== null ? 'supplied-inventory' : 'conditional-witness' }));
        u.placement = { occurrence: slot.occ, label: slot.label }; placed.add(u.id);
      };
      // locks first
      for (const lock of state.locks.filter(l => l.context === lc.id)) {
        const u = netUnits.find(x => x.links.includes(lock.demand));
        if (!u) { diagnostics.push({ code: 'lock-demand-missing', severity: 'conflict', affected: [lock.id, lock.demand], cause: 'locked demand no longer exists' }); continue; }
        const slot = slots.find(s => !s.used && s.label === lock.label);
        if (!slot) { diagnostics.push({ code: 'lock-target-unavailable', severity: 'conflict', affected: [lock.id, lock.demand, u.id], observed: { label: lock.label, child: lock.child }, cause: `locked target label ${lock.label} is no longer a usable selected member of ${group.id}; the binding is retained as a conflict and not relocated`, remedies: ['restore the label to the selection', 'explicitly release the lock (new revision)'] }); u.heldByLock = lock.id; placed.add(u.id); continue; }
        slot.used = true;
        const others = u.links.filter((d: string) => d !== lock.demand); const free = Array.from({ length: cons.linksPerUnit }, (_, k) => k + 1).filter(c => c !== lock.child);
        place(u, slot, d => d === lock.demand ? lock.child : free[others.indexOf(d)]!);
      }
      for (const u of netUnits) {
        if (placed.has(u.id)) continue;
        let found: typeof slots[number] | undefined;
        for (const s of slots) { inspections++; if (!s.used) { found = s; break; } }
        if (inspections > config.maxCandidateInspections) { limit = { limit: 'maxCandidateInspections', observed: inspections, allowed: config.maxCandidateInspections, stage: 'S4' }; status = 'limit-reached'; break; }
        if (!found) { unmet.push(...u.links); continue; }
        found.used = true; place(u, found, (_d, k) => k + 1);
      }
      if (limit) { witnessIds.length = 0; unmet = []; }
      if (unmet.length) diagnostics.push({ code: 'capacity-exhausted', severity: 'conflict', affected: unmet, observed: { fixedOccurrences: fixed, usableParentsPerOccurrence: usable.length }, required: { lowerBound }, cause: `${unmet.length} demand(s) unmet in ${lc.id}; reserved uplinks are never borrowed`, remedies: ['add switch occurrences', 'widen the allocation group', 'release a reservation explicitly'] });
    }
    sizing.push({ context: lc.id, network: net.id, group: group.id, construction: cons.id, status, lowerBound, operands: { units: netUnits.length, usableParentsPerOccurrence: usable.length, linksPerUnit: cons.linksPerUnit }, suppliedOccurrences: lc.instanceQuantity, witnessIds, unmetDemands: unmet.length, ledgerStatus: ledger.status, claim: 'conditional local packing only; not an exact supported topology' });
  }
  if (limit) diagnostics.push({ code: 'limit-reached', severity: 'limit', affected: [], observed: limit.observed, required: limit.allowed, cause: `${limit.limit} exceeded in S4; no partial assignments are reported`, remedies: ['run with a larger named configuration'] });
  return limit ? { units, assignments: [], sizing: [], limit, inspections, candidates, diagnostics } : { units, assignments, sizing, limit: null, inspections, candidates, diagnostics };
}

// ---------------------------------------------------------------- S5: acquisition, missing infrastructure, review rows
export function s5(ctx: StageCtx) {
  const { state } = ctx; const S1 = ctx.prior.S1, S3 = ctx.prior.S3, S4 = ctx.prior.S4;
  const diagnostics: Diagnostic[] = [];
  const unitsByCons = new Map<string, any[]>(); for (const u of S4?.units ?? []) { if (!unitsByCons.has(u.construction)) unitsByCons.set(u.construction, []); unitsByCons.get(u.construction)!.push(u); }
  const constructionLines: any[] = [];
  const demandsKnown = S1.demands !== null;
  for (const c of [...state.constructions].sort((a, b) => byId(a.id, b.id))) {
    const us = unitsByCons.get(c.id) ?? []; const links = us.reduce((n, u) => n + u.links.length, 0);
    const q = (n: number): Q => demandsKnown ? n : unknown('demands-unmaterialized', `S1 limit or unknown population`);
    if (c.item.serverModule) constructionLines.push({ item: c.item.serverModule, construction: c.id, quantity: q(links * c.serverModulePerLink), basis: 'one detachable module per server-end link', requirementIds: us.map(u => u.id) });
    if (c.item.switchModule) constructionLines.push({ item: c.item.switchModule, construction: c.id, quantity: q(us.length * c.switchModulePerUnit), basis: `one parent module per ${c.linksPerUnit} ordered links`, requirementIds: us.map(u => u.id) });
    if (c.item.assembly) constructionLines.push({ item: c.item.assembly, construction: c.id, quantity: q(us.length), basis: `one shared ${c.linksPerUnit}-tail assembly per ${c.pairing} unit`, requirementIds: us.map(u => u.id) });
  }
  // purchase lines: one identity per item; included children never add purchases
  const lines = new Map<string, any>();
  for (const r of S1.requirements) {
    const key = r.item; const l = lines.get(key) ?? { id: `BUY/${key}`, item: key, category: 'server-component', quantity: 0 as Q, installed: 0 as Q, acquisition: r.acquisition, requirementIds: [] as string[], readiness: 'conditional-estimate' };
    if (l.acquisition !== r.acquisition) l.acquisition = 'mixed';
    l.installed = checkedAdd(l.installed, r.installed, l.id);
    l.quantity = r.acquisition === 'included' ? l.quantity : checkedAdd(l.quantity, r.purchaseNeed, l.id);
    l.requirementIds.push(r.id); lines.set(key, l);
  }
  for (const c of constructionLines) lines.set(c.item, { id: `BUY/${c.item}`, item: c.item, category: c.item.includes('optic') ? 'optical-module' : 'assembly', quantity: c.quantity, installed: c.quantity, acquisition: 'separate', construction: c.construction, basis: c.basis, requirementIds: c.requirementIds, readiness: 'conditional-estimate', qualification: 'unknown' });
  const purchaseLines = [...lines.values()].sort((a, b) => byId(a.id, b.id)).map(l => l.acquisition === 'included' ? { ...l, quantity: 0, purchaseNote: 'covered by its bundle; installed inventory only' } : l);
  const knownGenericPurchaseUnits: Q = sumQ(purchaseLines.filter(l => l.acquisition === 'separate' && isKnown(l.quantity)).map(l => l.quantity), 'knownGenericPurchaseUnits');
  const unresolvedPurchase = purchaseLines.filter(l => !isKnown(l.quantity)).map(l => l.id);
  // missing infrastructure: never zeroed or omitted
  const bounds = (S4?.sizing ?? []).map((s: any) => s.lowerBound);
  const leafBound: Q = S4?.sizing?.length ? sumQ(bounds, 'INF-LEAF') : unknown('sizing-unavailable', 'S4');
  const missingInfrastructure = state.missingInfrastructure.map(m => ({ ...m, ...(m.id === 'INF-LEAF' ? { conditionalLowerBound: leafBound } : {}), ...(m.id === 'INF-OOB' ? { knownServerInterfaces: S1.managementInterfaces } : {}) }));
  // review rows: presentation partition of physical link occurrences (one row per link)
  const demandById = new Map<string, Demand>((S1.demands ?? []).map((d: Demand) => [d.id, d]));
  const assignByDemand = new Map<string, any>((S4?.assignments ?? []).map((a: any) => [a.demand, a]));
  const rows = new Map<string, any>(); const consById = new Map(state.constructions.map(c => [c.id, c])); const ctxById = new Map(state.leafContexts.map(c => [c.id, c])); const groupByCtx = new Map(S3.groups.map((g: any) => [g.context, g]));
  for (const u of S4?.units ?? []) {
    let unitRow: any = null;
    const cons = consById.get(u.construction)!; const lc = ctxById.get(u.context)!;
    const group: any = groupByCtx.get(lc.id);
    for (const did of u.links) {
      const d = demandById.get(did)!; const a = assignByDemand.get(did);
      const port = a ? group.usableParents.find((p: any) => p.label === a.label)?.port : group.usableParents[0]?.port;
      const mode = port ? lc.modes[port] : undefined;
      const signature = { network: u.network, construction: { id: cons.id, kind: cons.kind, linksPerUnit: cons.linksPerUnit, qualification: cons.qualification, unknownFields: cons.unknownFields }, sideA: { classId: d.classId, classRevision: d.classRevision, slot: d.slot, item: d.item, rate: d.rate }, sideB: { context: lc.id, group: group.id, selector: group.sourceSelector, mode: typeof mode === 'string' ? mode : 'unknown', evidence: lc.profile.evidenceId } };
      const rowId = `ROW/${digestOf(signature).slice(0, 16)}`;
      const row = rows.get(rowId) ?? { id: rowId, signature, links: [] as string[], units: new Set<string>(), unassigned: [] as string[], heldByLock: [] as string[], reservedChildren: 0, editShortcuts: { sideA: `class/${d.classId}#${d.slot}`, sideB: `context/${lc.id}#${group.id}` } };
      row.links.push(`LINK/${did.slice(4)}`); row.units.add(u.id);
      if (!a) (u.heldByLock ? row.heldByLock : row.unassigned).push(`LINK/${did.slice(4)}`);
      rows.set(rowId, row); unitRow ??= row;
    }
    if (unitRow) unitRow.reservedChildren += u.reservedChildren;
  }
  const reviewRows = [...rows.values()].map(r => ({ id: r.id, signature: r.signature, memberDigest: digestOf([...r.links].sort(byId)), counts: { links: r.links.length, units: r.units.size, physicalServerEnds: r.links.length, reservedOrParkedChildren: r.reservedChildren }, links: [...r.links].sort(byId), units: [...r.units].sort(byId), exceptions: { unassigned: r.unassigned.sort(byId), heldByLock: r.heldByLock.sort(byId) }, unknownFields: r.signature.construction.unknownFields, editShortcuts: r.editShortcuts, inspection: 'manual review required; inspection does not confer qualification' })).sort((a, b) => byId(a.id, b.id));
  const placedLinks = new Set((S4?.units ?? []).flatMap((u: any) => u.links));
  const unplacedDemands = (S1.demands ?? []).filter((d: Demand) => !placedLinks.has(d.id)).map((d: Demand) => ({ demand: d.id, network: d.network, context: d.context, reason: S4?.skipped ? 'S4 skipped' : 'not eligible for any construction unit (see diagnostics)' }));
  return { purchaseLines, knownGenericPurchaseUnits, unresolvedPurchase, missingInfrastructure, reviewRows, unplacedDemands, diagnostics };
}

export const STAGES = [
  { id: 'S1', run: s1 }, { id: 'S2', run: s2 }, { id: 'S3', run: s3 }, { id: 'S4', run: s4 }, { id: 'S5', run: s5 },
] as const;
