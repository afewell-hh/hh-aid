// Runner: hosts the engine in a worker_threads worker (architecture-options.md §9.1 @75ba523).
// Deadlines and user cancels are main-thread timers acting through worker.terminate(); the main event
// loop stays responsive. Stage results are persisted as they arrive; outcomes:
//   complete | limit-reached -> OutputRevision (deterministic)
//   interrupted (deadline | user-cancel | error) -> PartialCandidate (never an output, no semantic digest)
import { EventEmitter } from 'node:events';
import { Worker } from 'node:worker_threads';
import { digestOf } from '../contracts/canonical.ts';
import { assembleOutput, STAGE_IDS, type StageId, stageDoc, stageKey } from '../engine/generate.ts';
import { ENGINE_VERSION, type RunConfig } from '../engine/stages.ts';
import type { ProjectStore } from '../store/store.ts';

export interface RunOptions { actor: string; config: RunConfig; deadlineMs?: number; stepMode?: boolean }
export interface RunResult { outcome: 'complete' | 'limit-reached' | 'interrupted'; outputId?: string; partialId?: string; reason?: string; completedStages: StageId[]; reusedStages: StageId[]; message: string }

export class RunHandle extends EventEmitter {
  readonly result: Promise<RunResult>;
  private worker: Worker | null = null;
  private finish!: (r: RunResult) => void;
  private settled = false;
  private cancelReason: 'deadline' | 'user-cancel' | null = null;
  private store: ProjectStore; private opts: RunOptions; private done = false;
  constructor(store: ProjectStore, opts: RunOptions) {
    super(); this.store = store; this.opts = opts; this.result = new Promise(res => { this.finish = res; });
  }
  /** Step-mode barrier release (tests). */
  go() { this.worker?.postMessage('go'); }
  cancel(reason: 'deadline' | 'user-cancel' = 'user-cancel') {
    if (this.settled || this.done || this.cancelReason) return;
    this.cancelReason = reason;
    void this.worker?.terminate();
  }

  start() {
    const s = this.store; const idx = s.index();
    if (!idx.inputHead) throw new Error('project has no input revision');
    const inputId = idx.inputHead; const state = s.get(inputId);
    const evidence = Object.fromEntries(state.evidence.map((e: string) => [e, s.get(e)]));
    const { config } = this.opts;
    // stage cache: key = semantic inputs; reuse only a rooted, verified, complete StageResult with that key
    const keys: Record<string, string> = {}; const chain: string[] = [];
    for (const st of STAGE_IDS) { keys[st] = stageKey(st, inputId, state.evidence, config, chain); chain.push(keys[st]!); }
    const cached = new Map<string, string>();
    for (const id of idx.roots.stageResults) { const d = s.get(id); if (d.kind === 'StageResult' && d.complete === true && d.engine === ENGINE_VERSION) cached.set(d.key, id); }
    const prior: Record<string, any> = {}; const ids: Record<string, string> = {}; const reused: StageId[] = []; const completed: StageId[] = [];
    let k = 0;
    for (; k < STAGE_IDS.length; k++) {
      const st = STAGE_IDS[k]!; const hit = cached.get(keys[st]!);
      if (!hit) break;
      const d = s.get(hit); if (d.key !== keys[st] || d.stage !== st) break;
      prior[st] = d.result; ids[st] = hit; reused.push(st); completed.push(st);
    }
    const remaining = STAGE_IDS.slice(k);
    const t0 = performance.now(); const durations: Record<string, number> = {};
    let last = t0;
    const end = async (r: Omit<RunResult, 'completedStages' | 'reusedStages'>) => {
      if (this.settled) return; this.settled = true; clearTimeout(timer);
      const res: RunResult = { ...r, completedStages: completed, reusedStages: reused };
      s.audit(this.opts.actor, 'generate', [inputId, ...(r.outputId ? [r.outputId] : []), ...(r.partialId ? [r.partialId] : [])], { outcome: r.outcome, reason: r.reason, config: config.id, deadlineMs: this.opts.deadlineMs ?? null, durationsMs: durations, totalMs: Math.round(performance.now() - t0), reused });
      this.emit('end', res); this.finish(res);
    };
    const interrupted = async (reason: 'deadline' | 'user-cancel' | 'error', detail: string) => {
      const completedStages = completed.map(st => ({ stage: st, id: ids[st]!, key: keys[st]! }));
      const partial = { kind: 'PartialCandidate', input: inputId, evidence: [...state.evidence].sort(), config, engine: ENGINE_VERSION, completedStages, outcome: 'interrupted', reason,
        claim: completed.includes('S1') ? 'partial: generation interrupted; completed stage results only; no allocation or sizing claim' : 'partial: generation interrupted before S1 completed; no new component result exists; previous outputs unchanged' };
      const pid = s.put(partial);
      await s.commit(this.opts.actor, 'interrupted', () => ({ add: { partialCandidates: [pid], stageResults: completedStages.map(c => c.id) } }));
      await end({ outcome: 'interrupted', partialId: pid, reason, message: detail });
    };
    const timer = this.opts.deadlineMs !== undefined ? setTimeout(() => this.cancel('deadline'), this.opts.deadlineMs) : undefined;
    if (!remaining.length) {
      queueMicrotask(async () => {
        const out = assembleOutput(inputId, state, state.evidence, config, ids, prior); const oid = s.put(out);
        await s.commit(this.opts.actor, 'generate', () => ({ add: { outputs: [oid] } }));
        await end({ outcome: out.outcome as any, outputId: oid, message: 'all stages reused from verified cache' });
      });
      return this;
    }
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { workerData: { state, evidence, config, stages: remaining, prior, stepMode: !!this.opts.stepMode } });
    this.worker.on('message', (m: any) => {
      if (m.type === 'started') { this.emit('started'); return; }
      if (m.type === 'stage') {
        const now = performance.now(); durations[m.stage] = Math.round(now - last); last = now;
        prior[m.stage] = m.result; const doc = stageDoc(m.stage, keys[m.stage]!, m.result); ids[m.stage] = s.put(doc); completed.push(m.stage);
        this.emit('stage', m.stage); return;
      }
      if (m.type === 'done') {
        this.done = true; clearTimeout(timer);
        void (async () => {
          const out = assembleOutput(inputId, state, state.evidence, config, ids, prior); const oid = s.put(out);
          await s.commit(this.opts.actor, 'generate', () => ({ add: { outputs: [oid], stageResults: completed.map(st => ids[st]!) } }));
          await this.worker?.terminate();
          await end({ outcome: out.outcome as any, outputId: oid, message: out.outcome });
        })();
      }
    });
    this.worker.on('error', (e: any) => { if (!this.done) void interrupted('error', String(e?.message ?? e)); });
    this.worker.on('exit', () => { if (this.done) return; if (!this.settled && this.cancelReason) void interrupted(this.cancelReason, `terminated: ${this.cancelReason}`); else if (!this.settled) void interrupted('error', 'worker exited unexpectedly'); });
    return this;
  }
}

export function startRun(store: ProjectStore, opts: RunOptions): RunHandle { return new RunHandle(store, opts).start(); }
export const digestOfOutput = (o: unknown) => digestOf(o);
