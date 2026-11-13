// Typed project state (InputRevision.content). This is the application's own schema; the FB-01
// manifest is only a seed source (see seed.ts). Unknown is always a typed Unknown, never null/0.
import type { Q, Unknown } from '../contracts/quantity.ts';

export type Acquisition = 'separate' | 'included' | 'inclusion-unknown';

export interface Component {
  slot: string;              // stable slot ID within the class revision (not a display label)
  item: string;              // generic placeholder part key (not a qualified SKU)
  label: string;
  qtyPerUnit: number;        // per server unit, safe integer >= 0
  acquisition: Acquisition;
  coveredBy?: string;        // for 'included': slot of the bundle that covers it
  managementInterfaces?: number; // per component unit
  replaces?: string[];       // explicit replacement lineage (slot IDs this slot replaced)
}

export interface Attachment {
  port: string;              // server port name, e.g. dpu1/p1
  slot: string;              // component slot that owns the port
  role: string;              // destination role bound per population, e.g. 'frontend'
  rate: number;              // Gb/s per direction
  rail?: string;
}

export interface ServerClass {
  id: string; revision: string; label: string; family: string;
  components: Component[];
  attachments: Attachment[];
  notes?: string;
}

export type Occurrences = { list: string[] } | { range: { prefix: string; start: number; count: Q; width: number } };

export interface Population {
  id: string; classId: string; classRevision: string;
  occurrences: Occurrences;
  destinations: Record<string, string>; // attachment role -> network ID
}

export interface Network {
  id: string; purpose: string; leafContext: string; construction: string;
  proposedInstallation: string; proposedFabric: string; proposedDomain: string;
  service: string; railDomain?: string; planeIntent?: string;
}

export interface Selector { labels: number[]; children?: number[] }  // ordered printed labels; optional 1-based child filter (PA-CHILD)

export interface LeafContext {
  id: string; label: string;
  profile: { evidenceId: string; name: string };
  instanceQuantity: Q;
  modes: Record<string, string | Unknown>;   // profile port name -> configured mode/speed
  serverGroup: { id: string; purpose: string; selector: Selector; sourceSelector: string };
  reservations: { id: string; owner: string; reason: string; labels: number[]; children?: number[] }[];
  unusedLabels: number[];
  excludedPorts: string[];                  // e.g. auxiliary ports excluded from allocation
}

/** A physical attribute value at one end of a connection: a stated value, or a typed unknown. Values are
 * engineering descriptors entered or sourced for manual inspection; none implies qualification. */
export type Attr = string | Unknown;
/** Independent attributes of one physical end (server end = side A, switch end = side B). Separate optics
 * describe the module at that end; an integrated assembly describes that end of the assembly. */
export interface PhysicalEnd { cage: Attr; connector: Attr; pmd?: Attr; reach?: Attr; fiber?: Attr; media?: Attr; length?: Attr; hostFit?: Attr }
export type EndField = keyof PhysicalEnd;
export const END_FIELDS: Record<'parent-module' | 'split-assembly', EndField[]> = {
  'parent-module': ['cage', 'connector', 'pmd', 'reach', 'fiber'],
  'split-assembly': ['cage', 'connector', 'media', 'length', 'hostFit'],
};

export interface Construction {
  id: string; network: string;
  kind: 'parent-module' | 'split-assembly';
  linksPerUnit: number;                    // links per parent module / per assembly
  serverModulePerLink: number;             // detachable modules at the server end
  switchModulePerUnit: number;             // detachable modules at the switch end
  pairing: 'ordered' | 'same-rail';
  item: { serverModule?: string; switchModule?: string; assembly?: string };
  ends: { server: PhysicalEnd; switch: PhysicalEnd };  // side A / side B physical attributes (END_FIELDS[kind])
  qualification: 'unknown';
  externalFiber?: string;
}

export interface Lock { id: string; demand: string; context: string; label: number; child: number; reason: string }

export interface MissingInfra { id: string; quantity: Q; reason: string; knownServerInterfaces?: 'derived' }

export interface ProjectState {
  kind: 'InputRevision';
  format: 'hhaid/1';
  projectId: string;
  revision: number;
  parent: string | null;
  change: string;
  seed: { manifestCommit: string; manifestPath: string; manifestSha256: string; scenarioId: string; scenarioRevision: string } | null;
  evidence: string[];                       // EvidenceSnapshot IDs in use
  classes: ServerClass[];
  populations: Population[];
  networks: Network[];
  leafContexts: LeafContext[];
  constructions: Construction[];
  demandOrder: string[];
  locks: Lock[];
  missingInfrastructure: MissingInfra[];
  unresolved: string[];
}

export interface EvidenceSnapshot {
  kind: 'EvidenceSnapshot';
  origin: 'extracted' | 'manual-transcription' | 'local-modified' | 'synthetic';
  profile: { name: string; spec: ProfileSpec };
  source: Record<string, string>;
  parentEvidence?: string;
  note: string;
}

export interface ProfileSpec {
  maxPorts?: number;
  ports: Record<string, { label?: string; profile?: string; pipeline?: string; management?: boolean; nos?: string }>;
  portProfiles: Record<string, { speed?: { default: string; supported: string[] }; breakout?: { default: string; supported: Record<string, { offsets: string[] }> } }>;
  pipelines?: Record<string, { maxPorts: number }>;
}
