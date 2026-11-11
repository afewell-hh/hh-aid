// Pure semantic diff, edit-impact preview and derived assessment (no stored staleness).
import { byId, digestOf } from '../contracts/canonical.ts';

const keyed = (xs: any[] | null | undefined, k = 'id') => new Map((xs ?? []).map(x => [x[k], x]));
const same = (a: unknown, b: unknown) => digestOf(a ?? null) === digestOf(b ?? null);

function mapDiff(a: Map<string, any>, b: Map<string, any>, pick: (x: any) => unknown) {
  const added = [...b.keys()].filter(k => !a.has(k)).sort(byId);
  const removed = [...a.keys()].filter(k => !b.has(k)).sort(byId);
  const changed = [...a.keys()].filter(k => b.has(k) && !same(pick(a.get(k)), pick(b.get(k)))).sort(byId).map(k => ({ id: k, from: pick(a.get(k)), to: pick(b.get(k)) }));
  return { added, removed, changed };
}

/** Semantic diff between two OutputRevision contents. Reordering is not a change; identical totals can
 * still hide regrouped constructions or moved assignments, which are reported separately. */
export function diffOutputs(from: any, to: any) {
  const units = mapDiff(keyed(from.constructions), keyed(to.constructions), u => ({ links: u.links, reservedChildren: u.reservedChildren }));
  const fromUnitOfLink = new Map<string, string>(); for (const u of from.constructions ?? []) for (const l of u.links) fromUnitOfLink.set(l, u.id);
  const regrouped = units.added.map(id => { const u = keyed(to.constructions).get(id); const prev = [...new Set<string>(u.links.map((l: string) => fromUnitOfLink.get(l)).filter(Boolean))].sort(byId); return prev.length ? { to: id, from: prev, links: u.links } : null; }).filter(Boolean);
  const rowsA = keyed(from.reviewRows), rowsB = keyed(to.reviewRows);
  return {
    input: { from: from.input, to: to.input }, evidence: { from: from.evidence, to: to.evidence }, config: { from: from.config?.id, to: to.config?.id },
    outcome: { from: from.outcome, to: to.outcome },
    purchaseLines: mapDiff(keyed(from.purchaseLines), keyed(to.purchaseLines), l => ({ quantity: l.quantity, installed: l.installed })),
    requirements: mapDiff(keyed(from.requirements), keyed(to.requirements), r => ({ installed: r.installed, purchaseNeed: r.purchaseNeed, classRevision: r.classRevision })),
    constructions: { ...units, regrouped },
    assignments: mapDiff(keyed(from.assignments, 'demand'), keyed(to.assignments, 'demand'), a => ({ occurrence: a.occurrence, label: a.label, child: a.child, unit: a.unit })),
    ledgers: mapDiff(keyed(from.ledgers), keyed(to.ledgers), l => ({ known: l.knownConfigured, total: l.configuredTotal, limit: l.limit, status: l.status })),
    sizing: mapDiff(keyed(from.sizing, 'context'), keyed(to.sizing, 'context'), s => ({ status: s.status, lowerBound: s.lowerBound, unmet: s.unmetDemands, witnessIds: s.witnessIds })),
    reviewRows: { ...mapDiff(rowsA, rowsB, r => r.memberDigest) },
    missingInfrastructure: mapDiff(keyed(from.missingInfrastructure), keyed(to.missingInfrastructure), m => m),
    diagnostics: { added: [...new Set<string>((to.diagnostics ?? []).map((d: any) => d.code))].filter(c => !(from.diagnostics ?? []).some((d: any) => d.code === c)).sort(), removed: [...new Set<string>((from.diagnostics ?? []).map((d: any) => d.code))].filter(c => !(to.diagnostics ?? []).some((d: any) => d.code === c)).sort() },
  };
}

/** Which parts of an existing output depend on what changed between two input revisions (preview before
 * regeneration). Conservative: anything touching a changed class, population, context, network,
 * construction, lock or evidence is reported as affected. */
export function editImpact(oldIn: any, newIn: any, output: any) {
  const ch = (xs: string) => { const a = keyed(oldIn[xs]), b = keyed(newIn[xs]); return new Set([...a.keys(), ...b.keys()].filter(k => !same(a.get(k), b.get(k)))); };
  const classes = ch('classes'), pops = ch('populations'), contexts = ch('leafContexts'), nets = ch('networks'), cons = ch('constructions');
  const lockCtx = new Set<string>([...oldIn.locks, ...newIn.locks].filter((l: any) => !same(oldIn.locks.find((x: any) => x.id === l.id), newIn.locks.find((x: any) => x.id === l.id))).map((l: any) => l.context));
  const evidenceChanged = !same(oldIn.evidence, newIn.evidence);
  for (const c of lockCtx) contexts.add(c);
  for (const n of [...oldIn.networks, ...newIn.networks]) { if (nets.has(n.id) || cons.has(n.construction)) contexts.add(n.leafContext); }
  if (evidenceChanged) for (const c of newIn.leafContexts) contexts.add(c.id);
  const popsOfClass = (cid: string) => newIn.populations.concat(oldIn.populations).filter((p: any) => p.classId === cid).map((p: any) => p.id);
  for (const c of classes) for (const p of popsOfClass(c)) pops.add(p);
  const reqs = new Set((output.requirements ?? []).filter((r: any) => pops.has(r.population) || classes.has(r.classId)).map((r: any) => r.id));
  const ctxOfCons = new Map((output.constructions ?? []).map((u: any) => [u.id, u.context]));
  const affectedCtx = new Set(contexts); if (pops.size) for (const n of newIn.networks) affectedCtx.add(n.leafContext); // population changes alter demands
  const lines = (output.purchaseLines ?? []).filter((l: any) => l.requirementIds.some((r: string) => reqs.has(r) || affectedCtx.has(ctxOfCons.get(r) as string))).map((l: any) => l.id).sort(byId);
  const classesOfPops = new Set(newIn.populations.concat(oldIn.populations).filter((p: any) => pops.has(p.id)).map((p: any) => p.classId));
  const rows = (output.reviewRows ?? []).filter((r: any) => classes.has(r.signature.sideA.classId) || classesOfPops.has(r.signature.sideA.classId) || affectedCtx.has(r.signature.sideB.context)).map((r: any) => r.id).sort(byId);
  return { changed: { classes: [...classes].sort(byId), populations: [...pops].sort(byId), contexts: [...contexts].sort(byId), networks: [...nets].sort(byId), constructions: [...cons].sort(byId), evidence: evidenceChanged }, affectedPurchaseLines: lines, affectedReviewRows: rows, affectedLedgers: (output.ledgers ?? []).filter((l: any) => affectedCtx.has(l.context)).map((l: any) => l.id).sort(byId) };
}

/** Derived assessment of every output and review against the current index (pure function of documents). */
export function assess(index: any, get: (id: string) => any, chainOrder: string[]) {
  const head = index.inputHead; const headIn = head ? get(head) : null;
  const ordered = chainOrder.filter(id => index.roots.outputs.includes(id));
  const current = [...ordered].reverse().find(id => get(id).input === head) ?? null;
  const outputs = ordered.map(id => {
    const o = get(id); const reasons: string[] = [];
    if (o.input !== head) reasons.push(`input revision ${o.inputRevision} is not the current head (revision ${headIn?.revision ?? '?'})`);
    if (headIn && !same([...o.evidence].sort(byId), [...headIn.evidence].sort(byId))) reasons.push('evidence superseded');
    return { id, inputRevision: o.inputRevision, outcome: o.outcome, config: o.config.id, status: reasons.length ? 'stale' : 'current', reasons, isCurrent: id === current };
  });
  const cur = current ? get(current) : null;
  const reviews = index.roots.reviews.map((id: string) => {
    const r = get(id); let status = 'needs review', reason = 'no current output to compare (regenerate)';
    if (cur) {
      const row = (cur.reviewRows ?? []).find((x: any) => x.id === r.row);
      if (row && digestOf(row.signature) === r.rowSignature && row.memberDigest === r.memberDigest) { status = 'retained within unchanged scope'; reason = 'same row signature and member set'; }
      else if (row) { status = 'needs review'; reason = row.memberDigest !== r.memberDigest ? 'member set changed' : 'row signature changed'; }
      else {
        const overlap = (cur.reviewRows ?? []).filter((x: any) => x.links.some((l: string) => r.members.includes(l)));
        status = overlap.length ? 'needs review' : 'invalidated'; reason = overlap.length ? `members moved to ${overlap.map((x: any) => x.id).join(', ')}` : 'row and members no longer exist';
      }
    }
    return { id, output: r.output, row: r.row, fields: r.fields, status, reason };
  });
  return { head, currentOutput: current, outputs, reviews };
}
