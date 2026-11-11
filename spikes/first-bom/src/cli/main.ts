// hhaid CLI (experiment). Commands print a short human summary, or JSON with --json.
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { canonicalize } from '../contracts/canonical.ts';
import { parseStrictJson } from '../contracts/json.ts';
import { assessProject, diff, edit, generate, newProject, refresh, review, seed, seedSynthetic } from '../app/project.ts';
import { ProjectStore } from '../store/store.ts';

const [cmd, ...rest] = process.argv.slice(2);
const { values: o, positionals: pos } = parseArgs({ args: rest, allowPositionals: true, options: {
  name: { type: 'string' }, manifest: { type: 'string' }, 'manifest-commit': { type: 'string' }, mutation: { type: 'string' }, patch: { type: 'string' }, note: { type: 'string' },
  config: { type: 'string' }, 'deadline-ms': { type: 'string' }, evidence: { type: 'string' }, output: { type: 'string' }, row: { type: 'string' }, fields: { type: 'string' },
  from: { type: 'string' }, synthetic: { type: 'string' }, variant: { type: 'string' }, to: { type: 'string' }, o: { type: 'string', short: 'o' }, 'include-audit': { type: 'boolean' }, json: { type: 'boolean' }, actor: { type: 'string' }, 'project-id': { type: 'string' },
} });
const actor = o.actor ?? process.env.HHAID_ACTOR ?? 'local-user';
const out = (human: string, data: unknown) => console.log(o.json ? JSON.stringify(data, null, 1) : human);
const need = (v: string | undefined, what: string) => { if (!v) { console.error(`missing ${what}`); process.exit(2); } return v; };
const withStore = async <T>(dir: string, f: (s: ProjectStore) => Promise<T> | T) => { const s = ProjectStore.open(dir); try { return await f(s); } finally { s.close(); } };

try {
  switch (cmd) {
    case 'new': { const s = newProject(need(pos[0], 'projectDir'), o.name ?? 'untitled', actor, o['project-id']); out(`created ${pos[0]}`, { head: s.headId() }); s.close(); break; }
    case 'seed': await withStore(need(pos[0], 'projectDir'), async s => { const id = o.synthetic === 'FB-AC1' ? await seedSynthetic(s, need(o.manifest, '--manifest'), need(o['manifest-commit'], '--manifest-commit'), need(o.variant, '--variant'), actor) : await seed(s, need(o.manifest, '--manifest'), need(o['manifest-commit'], '--manifest-commit'), actor); out(`seeded input ${id}`, { input: id }); }); break;
    case 'edit': await withStore(need(pos[0], 'projectDir'), async s => {
      const patch = o.patch ? parseStrictJson(readFileSync(o.patch, 'utf8')) as any : undefined;
      const r = await edit(s, actor, { mutation: o.mutation, patch, note: o.note });
      out(r.unchanged ? 'no change' : `input revision ${r.id}${r.classScope.length ? `; class scope ${JSON.stringify(r.classScope)}` : ''}${r.impact ? `; affects ${r.impact.affectedPurchaseLines.length} line(s), ${r.impact.affectedReviewRows.length} review row(s)` : ''}`, r);
    }); break;
    case 'generate': await withStore(need(pos[0], 'projectDir'), async s => {
      const h = generate(s, actor, { config: o.config, deadlineMs: o['deadline-ms'] ? Number(o['deadline-ms']) : undefined });
      const onInt = () => h.cancel('user-cancel'); process.once('SIGINT', onInt);
      const r = await h.result; process.off('SIGINT', onInt);
      out(`${r.outcome}${r.outputId ? ` output ${r.outputId}` : ''}${r.partialId ? ` partial ${r.partialId} (${r.reason})` : ''}; stages ${r.completedStages.join(',') || 'none'}${r.reusedStages.length ? ` (reused ${r.reusedStages.join(',')})` : ''}`, r);
      if (r.outcome === 'interrupted') process.exitCode = 3;
    }); break;
    case 'show': await withStore(need(pos[0], 'projectDir'), s => { const id = o.output ?? s.index().roots.outputs.at(-1); const doc = s.get(need(id, 'output')); out(canonicalize(doc), doc); }); break;
    case 'refresh': await withStore(need(pos[0], 'projectDir'), async s => { const r = await refresh(s, actor, need(o.evidence, '--evidence')); out(`input revision ${r.id} with evidence ${r.evidence}`, r); }); break;
    case 'review': await withStore(need(pos[0], 'projectDir'), async s => { const id = await review(s, actor, need(o.output, '--output'), need(o.row, '--row'), need(o.fields, '--fields').split(','), o.note ?? ''); out(`review ${id}`, { review: id }); }); break;
    case 'diff': await withStore(need(pos[0], 'projectDir'), async s => { const r = await diff(s, actor, need(o.from, '--from'), need(o.to, '--to')); out(`diff ${r.id}`, r); }); break;
    case 'assess': await withStore(need(pos[0], 'projectDir'), s => { const a = assessProject(s); out(a.outputs.map(x => `${x.id.slice(0, 12)} rev${x.inputRevision} ${x.status}${x.reasons.length ? ` (${x.reasons.join('; ')})` : ''}`).concat(a.reviews.map((r: any) => `review ${r.id.slice(0, 12)} ${r.status}: ${r.reason}`)).join('\n'), a); }); break;
    case 'export': await withStore(need(pos[0], 'projectDir'), s => { const text = s.exportText(!!o['include-audit']); writeFileSync(need(o.o, '-o'), text); out(`exported ${text.length} bytes`, { bytes: text.length }); }); break;
    case 'import': { const s = ProjectStore.importText(readFileSync(need(pos[0], 'file'), 'utf8'), need(pos[1], 'projectDir'), actor); out(`imported into ${pos[1]}`, { head: s.headId() }); s.close(); break; }
    case 'fsck': await withStore(need(pos[0], 'projectDir'), s => { const r = s.fsck(); out(`${r.reachable} reachable, ${r.orphans.length} orphan(s), ${r.problems.length} problem(s)`, r); if (r.problems.length) process.exitCode = 1; }); break;
    default: console.error('usage: hhaid new|seed|edit|generate|show|refresh|review|diff|assess|export|import|fsck ...'); process.exit(2);
  }
} catch (e) { console.error(`hhaid ${cmd}: ${(e as Error).message}`); process.exit(1); }
