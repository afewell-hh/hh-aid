// Worker host for the pure engine stages. Async waiting happens only here (between stages, in step
// mode, for test barriers); the stages themselves are synchronous and never see time or signals.
import { parentPort, workerData } from 'node:worker_threads';
import { runStage, type StageId } from '../engine/generate.ts';

const { state, evidence, config, stages, prior, stepMode } = workerData as { state: any; evidence: any; config: any; stages: StageId[]; prior: Record<string, any>; stepMode: boolean };
const gate = () => new Promise<void>(resolve => parentPort!.once('message', (m) => { if (m === 'go') resolve(); }));

parentPort!.postMessage({ type: 'started' });
if (stepMode) await gate();
for (const stage of stages) {
  prior[stage] = runStage(stage, { state, evidence, config, prior });
  parentPort!.postMessage({ type: 'stage', stage, result: prior[stage] });
  if (stepMode) await gate();
}
parentPort!.postMessage({ type: 'done' });
