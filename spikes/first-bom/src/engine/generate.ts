// Orchestration of the pure stages: dependency handling, stage cache keys, output assembly.
// Still pure: the runner (src/runner) hosts this in a worker and owns time and cancellation.
import { byId, digestOf } from '../contracts/canonical.ts';
import type { EvidenceSnapshot, ProjectState } from '../model/types.ts';
import { ENGINE_VERSION, RULE_REVISION, type RunConfig, STAGES, type StageCtx } from './stages.ts';

export type StageId = typeof STAGES[number]['id'];
export const STAGE_IDS: StageId[] = STAGES.map(s => s.id);

/** Cache key: digests of every semantic input of a stage (distinct from the StageResult content digest). */
export function stageKey(stage: StageId, inputId: string, evidenceIds: string[], config: RunConfig, priorKeys: string[]): string {
  return digestOf({ stage, engine: ENGINE_VERSION, rule: RULE_REVISION, input: inputId, evidence: [...evidenceIds].sort(byId), config, prior: priorKeys });
}

export function runStage(stage: StageId, ctx: StageCtx): any {
  const S1 = ctx.prior.S1;
  if (stage === 'S4' && S1 && S1.demands === null) {
    return { skipped: 'S1 demands unmaterialized (limit or unknown population)', units: [], assignments: [], sizing: [], limit: null, inspections: 0, candidates: 0, diagnostics: [{ code: 'unresolved-dependency', severity: 'unresolved', affected: ['S4'], cause: 'allocation and sizing need materialized demands' }] };
  }
  return STAGES.find(s => s.id === stage)!.run(ctx);
}

export function stageDoc(stage: StageId, key: string, result: unknown) {
  return { kind: 'StageResult' as const, stage, key, engine: ENGINE_VERSION, complete: true, result };
}

export function assembleOutput(inputId: string, state: ProjectState, evidenceIds: string[], config: RunConfig, stageIds: Record<string, string>, r: Record<string, any>) {
  const limits = STAGE_IDS.map(s => r[s]?.limit).filter(Boolean);
  const diagnostics = STAGE_IDS.flatMap(s => r[s]?.diagnostics ?? []);
  return {
    kind: 'OutputRevision' as const, format: 'hhaid/1', engine: ENGINE_VERSION, rule: RULE_REVISION,
    input: inputId, inputRevision: state.revision, evidence: [...evidenceIds].sort(byId), config,
    outcome: limits.length ? 'limit-reached' : 'complete', limits,
    stageResults: stageIds,
    readiness: 'conditional-estimate',
    summary: {
      servers: r.S1.servers, managementInterfaces: r.S1.managementInterfaces, demands: r.S1.demandCount,
      knownGenericPurchaseUnits: r.S5.knownGenericPurchaseUnits, unresolvedPurchaseLines: r.S5.unresolvedPurchase,
      diagnostics: { conflict: diagnostics.filter(d => d.severity === 'conflict').length, unresolved: diagnostics.filter(d => d.severity === 'unresolved').length, limit: diagnostics.filter(d => d.severity === 'limit').length },
    },
    requirements: r.S1.requirements, demands: r.S1.demands, purchaseLines: r.S5.purchaseLines,
    ledgers: r.S2.ledgers, contextLedgers: r.S2.contexts, groups: r.S3.groups,
    constructions: r.S4.units, assignments: r.S4.assignments, sizing: r.S4.sizing,
    missingInfrastructure: r.S5.missingInfrastructure, reviewRows: r.S5.reviewRows, unplacedDemands: r.S5.unplacedDemands, diagnostics,
    excluded: ['external fiber/structured cabling', 'external management patch cabling (fixture choice)', 'wiring export (not emitted in this slice)'],
  };
}

/** Synchronous convenience for tests and small runs; production path goes through the runner. */
export function generateSync(inputId: string, state: ProjectState, evidence: Record<string, EvidenceSnapshot>, config: RunConfig) {
  const evidenceIds = state.evidence; const prior: Record<string, any> = {}; const keys: string[] = []; const ids: Record<string, string> = {}; const docs: any[] = [];
  for (const s of STAGE_IDS) {
    const key = stageKey(s, inputId, evidenceIds, config, keys); keys.push(key);
    prior[s] = runStage(s, { state, evidence, config, prior });
    const doc = stageDoc(s, key, prior[s]); docs.push(doc); ids[s] = digestOf(doc);
  }
  return { stages: docs, output: assembleOutput(inputId, state, evidenceIds, config, ids, prior) };
}
