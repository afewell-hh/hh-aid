// FB-01 manifest -> typed ProjectState. Rules (D05 §4, lead 6786859007):
//  * manifest null  -> typed Unknown with provenance "manifest:<field>", never 0;
//  * author_expected and every expected/expected_delta field are never read;
//  * only fields listed here are consumed; anything unrecognised is ignored, not inferred.
import { unknown } from '../contracts/quantity.ts';
import { END_FIELDS, type Component, type EndField, type EvidenceSnapshot, type LeafContext, type PhysicalEnd, type ProjectState, type ServerClass } from './types.ts';

type Manifest = Record<string, any>;
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, k) => a + k);
const prov = (field: string) => `manifest:${field}`;

export function labelToPort(ev: EvidenceSnapshot): Map<number, string> {
  const m = new Map<number, string>();
  for (const [name, p] of Object.entries(ev.profile.spec.ports)) if (p.label && !p.management) m.set(Number(p.label), name);
  return m;
}

/** Management interfaces: FB-01 derivation says class A has "BMC + DPU management", class B "BMC management"
 * (topology-engine.md @ce4b8e6, scenario table). The BMC carries one; any remainder is attributed to the
 * frontend adapter slot. */
function classFrom(c: Manifest, bundleItem: string): ServerClass {
  const comps: Component[] = [];
  const slot = (kind: string, item: string) => `${c.id}/${kind}/${item}`;
  const bundleSlot = slot('separate', bundleItem);
  for (const [item, q] of Object.entries<number>(c.separate_per_server)) comps.push({ slot: slot('separate', item), item, label: item.replaceAll('_', ' '), qtyPerUnit: q, acquisition: 'separate' });
  for (const [item, q] of Object.entries<number>(c.included_per_server)) comps.push({ slot: slot('included', item), item, label: item.replaceAll('_', ' '), qtyPerUnit: q, acquisition: 'included', coveredBy: bundleSlot });
  for (const [item, q] of Object.entries<number>(c.unresolved_inclusion_per_server)) comps.push({ slot: slot('inclusion-unknown', item), item, label: item.replaceAll('_', ' '), qtyPerUnit: q, acquisition: 'inclusion-unknown' });
  const bmc = comps.find(x => x.item === 'bmc');
  const frontendItem = Object.keys(c.separate_per_server).find(k => k.startsWith('frontend_'));
  if (!bmc || !frontendItem) throw new Error(`class ${c.id}: expected a bmc and a frontend adapter`);
  bmc.managementInterfaces = 1;
  const rest = c.management_interfaces_per_server - 1;
  if (rest > 0) {
    const fe = comps.find(x => x.item === frontendItem)!;
    fe.managementInterfaces = rest / fe.qtyPerUnit;
    if (!Number.isSafeInteger(fe.managementInterfaces)) throw new Error(`class ${c.id}: management interfaces not divisible`);
  }
  const attachments = [
    ...c.frontend_ports.map((port: string) => ({ port, slot: slot('separate', frontendItem), role: 'frontend', rate: c.frontend_rate })),
    ...c.backend_ports.map((port: string, k: number) => ({ port, slot: slot('separate', Object.keys(c.separate_per_server).find(i => i.startsWith('backend_'))!), role: 'backend', rate: c.backend_rate, rail: c.backend_rails[k] })),
  ];
  return { id: c.id, revision: c.revision, label: c.id === 'A' ? 'Generic accelerator server' : 'Generic storage server', family: c.id === 'A' ? 'accelerator' : 'storage', components: comps, attachments };
}

export function seedFromManifest(manifest: Manifest, source: { commit: string; path: string; sha256: string }, projectId: string, evidenceId: string, evidence: EvidenceSnapshot): ProjectState {
  const l2p = labelToPort(evidence);
  const port = (label: number) => { const p = l2p.get(label); if (!p) throw new Error(`label ${label} not in profile`); return p; };
  const classes = manifest.classes.map((c: Manifest) => classFrom(c, Object.keys(c.separate_per_server).find(k => k.startsWith('chassis_bundle'))!));
  const networks = manifest.network_intents.map((n: Manifest) => ({
    id: n.id, purpose: n.purpose, leafContext: n.leaf_context,
    construction: manifest.constructions.find((c: Manifest) => c.network === n.id).id,
    proposedInstallation: n.proposed_installation, proposedFabric: n.proposed_fabric, proposedDomain: n.proposed_domain, service: n.service,
    ...(n.first_hop_rail_domain ? { railDomain: n.first_hop_rail_domain } : {}), ...(n.plane_intent ? { planeIntent: n.plane_intent } : {}),
  }));
  const leafContexts: LeafContext[] = manifest.leaf_contexts.map((lc: Manifest): LeafContext => {
    const modes: LeafContext['modes'] = {};
    const [cs, ce] = lc.configured_server_labels_inclusive; for (const l of range(cs, ce)) modes[port(l)] = lc.server_mode ?? unknown('mode-not-supplied', prov(`leaf_contexts.${lc.id}.server_mode`));
    const [us, ue] = lc.uplink_labels_inclusive; for (const l of range(us, ue)) modes[port(l)] = lc.uplink_mode ?? unknown('mode-not-supplied', prov(`leaf_contexts.${lc.id}.uplink_mode`));
    for (const [p, m] of Object.entries<string | null>(lc.auxiliary_modes)) modes[p] = m ?? unknown('mode-not-supplied', prov(`leaf_contexts.${lc.id}.auxiliary_modes.${p}`));
    const [ss, se] = lc.server_labels_inclusive;
    return {
      id: lc.id, label: lc.id === 'LC-FE' ? 'Frontend leaf' : 'Backend leaf',
      profile: { evidenceId, name: lc.profile },
      instanceQuantity: lc.instance_quantity ?? unknown('instance-quantity-not-supplied', prov(`leaf_contexts.${lc.id}.instance_quantity`)),
      modes,
      serverGroup: { id: lc.server_group, purpose: 'server attachments with equal capability', selector: { labels: range(ss, se) }, sourceSelector: `printed ${ss}..${se}` },
      reservations: [{ id: `${lc.id}/RES-UPLINK`, owner: 'uplink', reason: 'reserved uplinks (not cabled uplinks)', labels: range(us, ue) }],
      unusedLabels: [...lc.unused_labels],
      excludedPorts: lc.auxiliary_allocation === 'excluded' ? Object.keys(lc.auxiliary_modes) : [],
    };
  });
  // Per-end physical attributes. The manifest states construction-level fields (null = not supplied); a stated
  // value applies to both ends, and fields it does not carry at all stay typed unknown. Nothing is derived from
  // the assembly name or the item key.
  const endsFor = (c: Manifest, fields: EndField[]) => {
    const MANIFEST_KEY: Partial<Record<EndField, string>> = { pmd: 'pmd', connector: 'connector', fiber: 'fiber_type', reach: 'reach', length: 'length' };
    const end = (side: 'server' | 'switch'): PhysicalEnd => Object.fromEntries(fields.map(f => {
      const k = MANIFEST_KEY[f];
      if (k && typeof c[k] === 'string') return [f, c[k]];
      return [f, k && k in c ? unknown('not-supplied', prov(`constructions.${c.id}.${k}`)) : unknown('not-in-source', prov(`constructions.${c.id} has no ${side}-end ${f} field`))];
    })) as unknown as PhysicalEnd;
    return { server: end('server'), switch: end('switch') };
  };
  const constructions = manifest.constructions.map((c: Manifest) => {
    if (c.assembly_type === 'separate-optics') return {
      id: c.id, network: c.network, kind: 'parent-module', linksPerUnit: c.logical_links_per_switch_parent,
      serverModulePerLink: c.server_module_per_link, switchModulePerUnit: c.switch_module_per_parent, pairing: 'ordered',
      item: { serverModule: 'fe_server_optic_200G', switchModule: 'fe_switch_optic_4x200G' }, ends: endsFor(c, END_FIELDS['parent-module']), qualification: 'unknown',
      externalFiber: c.external_fiber_bom,
    };
    return {
      id: c.id, network: c.network, kind: 'split-assembly', linksPerUnit: c.logical_links_per_assembly,
      serverModulePerLink: 0, switchModulePerUnit: c.separate_modules, pairing: c.cross_rail_pairing === false ? 'same-rail' : 'ordered',
      item: { assembly: 'be_split_dac_2x400G' }, ends: endsFor(c, END_FIELDS['split-assembly']), qualification: 'unknown',
    };
  });
  const roleNet = (role: string) => manifest.network_intents.find((n: Manifest) => (role === 'frontend' ? n.purpose !== 'backend' : n.purpose === 'backend')).id;
  return {
    kind: 'InputRevision', format: 'hhaid/1', projectId, revision: 1, parent: null,
    change: `seeded from ${manifest.scenario_id}/${manifest.revision}`,
    seed: { manifestCommit: source.commit, manifestPath: source.path, manifestSha256: source.sha256, scenarioId: manifest.scenario_id, scenarioRevision: manifest.revision },
    evidence: [evidenceId],
    classes,
    populations: manifest.classes.map((c: Manifest) => ({ id: `POP-${c.id}`, classId: c.id, classRevision: c.revision, occurrences: { list: [...c.occurrences] }, destinations: { frontend: roleNet('frontend'), ...(c.backend_ports.length ? { backend: roleNet('backend') } : {}) } })),
    networks, leafContexts, constructions,
    demandOrder: [...manifest.selection_policy.order],
    locks: [],
    missingInfrastructure: manifest.missing_infrastructure.map((m: Manifest) => ({
      id: m.id, reason: m.reason,
      quantity: m.quantity ?? unknown(m.reason, prov(`missing_infrastructure.${m.id}.quantity`)),
      ...(m.id === 'INF-OOB' ? { knownServerInterfaces: 'derived' as const } : {}),
    })),
    unresolved: [...manifest.unresolved],
  };
}
