// Thin experiment UI over the local API. It displays engine output; it never computes quantities.
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { api, fmtQ, isUnknown } from './api.ts';

type Tab = 'servers' | 'destinations' | 'bom' | 'review' | 'history';
const TABS: [Tab, string][] = [['servers', 'Server classes'], ['destinations', 'Destinations'], ['bom', 'BOM'], ['review', 'Connection review'], ['history', 'History & evidence']];

export function App() {
  const [p, setP] = useState<any>(null);
  const [out, setOut] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('servers');
  const [msg, setMsg] = useState<string>('');
  const [err, setErr] = useState<string>('');
  const [focus, setFocus] = useState<string>('');
  const load = useCallback(async () => {
    const proj = await api.project(); setP(proj);
    const cur = proj.assessment.currentOutput ?? proj.assessment.outputs.at(-1)?.id;
    setOut(cur ? { ...(await api.doc(cur)), id: cur } : null);
  }, []);
  useEffect(() => { load().catch(e => setErr(String(e.message))); }, [load]);
  const act = async (f: () => Promise<any>, ok: (r: any) => string) => { setErr(''); try { const r = await f(); setMsg(ok(r)); await load(); } catch (e: any) { setErr(e.message); } };
  if (err && !p) return <main className="wrap"><p className="error" role="alert">{err}</p></main>;
  if (!p) return <main className="wrap"><p>Loading…</p></main>;
  const outAssess = out ? p.assessment.outputs.find((o: any) => o.id === out.id) : null;
  const goTo = (shortcut: string) => { const [kind, rest] = shortcut.split('/'); setFocus(rest ?? ''); setTab(kind === 'class' ? 'servers' : 'destinations'); };
  return (
    <main className="wrap">
      <header className="top">
        <div><h1>{p.name}</h1><p className="sub">Input revision {p.state?.revision ?? '—'} · {p.state?.change}</p></div>
        <p className="badge warn">Conditional engineering estimate · not orderable · no wiring emitted</p>
      </header>
      <nav className="tabs" role="tablist">{TABS.map(([t, l]) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{l}</button>)}</nav>
      {msg && <p className="note" role="status">{msg}</p>}
      {err && <p className="error" role="alert">{err}</p>}
      {tab === 'servers' && <Servers p={p} focus={focus} act={act} />}
      {tab === 'destinations' && <Destinations p={p} out={out} focus={focus} act={act} />}
      {tab === 'bom' && <Bom p={p} out={out} outAssess={outAssess} act={act} />}
      {tab === 'review' && <Review p={p} out={out} outAssess={outAssess} act={act} goTo={goTo} />}
      {tab === 'history' && <History p={p} act={act} openOutput={async (id: string) => { setOut({ ...(await api.doc(id)), id }); setTab('bom'); }} />}
    </main>
  );
}

type Act = (f: () => Promise<any>, ok: (r: any) => string) => Promise<void>;
const scopeText = (r: any) => r.unchanged ? 'No change.' : `Saved input revision. ${r.classScope?.map((c: any) => `Class ${c.classId} ${c.from} → ${c.to} (populations ${c.populations.join(', ')})`).join('; ') ?? ''}${r.impact ? ` Affects ${r.impact.affectedPurchaseLines.length} BOM line(s) and ${r.impact.affectedReviewRows.length} review row(s); regenerate to update.` : ''}`;

function Servers({ p, focus, act }: { p: any; focus: string; act: Act }) {
  const s = p.state; const [item, setItem] = useState({ item: '', qty: 1, acquisition: 'separate' });
  return (
    <section aria-label="Server classes">
      {s.classes.map((c: any, ci: number) => {
        const pops = s.populations.map((x: any, pi: number) => ({ ...x, pi })).filter((x: any) => x.classId === c.id);
        return (
          <article key={c.id} className={`card ${focus.startsWith(c.id) ? 'focus' : ''}`} data-testid={`class-${c.id}`}>
            <h2>{c.label} <span className="muted">class {c.id} · revision {c.revision}</span></h2>
            <p className="muted">Edit scope: this project's customization of class {c.id}; populations {pops.map((x: any) => x.id).join(', ')} are re-pinned and shown before regeneration.</p>
            <h3>Per-unit components</h3>
            <table><thead><tr><th>Slot</th><th>Item (generic)</th><th>Per server</th><th>Acquisition</th><th>Mgmt IF</th></tr></thead><tbody>
              {c.components.map((k: any, ki: number) => (
                <tr key={k.slot} className={focus.endsWith(k.slot) ? 'focus' : ''}>
                  <td><code>{k.slot}</code>{k.replaces && <div className="muted">replaces {k.replaces.join(', ')}</div>}</td><td>{k.item}</td>
                  <td><input aria-label={`${k.item} per unit`} type="number" min={0} defaultValue={k.qtyPerUnit} onBlur={e => { const v = Number(e.target.value); if (v !== k.qtyPerUnit && Number.isSafeInteger(v) && v >= 0) void act(() => api.edit({ patch: [{ op: 'replace', path: `/classes/${ci}/components/${ki}/qtyPerUnit`, value: v }], note: `class ${c.id}: ${k.item} per unit ${k.qtyPerUnit} → ${v}` }), scopeText); }} /></td>
                  <td>{k.acquisition}{k.coveredBy ? <div className="muted">covered by {k.coveredBy.split('/').pop()}</div> : null}</td><td>{k.managementInterfaces ?? ''}</td>
                </tr>))}
            </tbody></table>
            <form className="row" onSubmit={e => { e.preventDefault(); if (!/^[a-z0-9_]+$/.test(item.item)) return; void act(() => api.edit({ patch: [{ op: 'add', path: `/classes/${ci}/components/-`, value: { slot: `${c.id}/${item.acquisition}/${item.item}`, item: item.item, label: item.item.replaceAll('_', ' '), qtyPerUnit: item.qty, acquisition: item.acquisition } }], note: `class ${c.id}: add per-unit item ${item.item}` }), scopeText); }}>
              <label>Add arbitrary per-unit item <input aria-label="new item key" placeholder="e.g. cable_management_arm" value={item.item} onChange={e => setItem({ ...item, item: e.target.value })} /></label>
              <input aria-label="new item quantity" type="number" min={0} value={item.qty} onChange={e => setItem({ ...item, qty: Number(e.target.value) })} />
              <select aria-label="new item acquisition" value={item.acquisition} onChange={e => setItem({ ...item, acquisition: e.target.value })}><option>separate</option><option>included</option><option>inclusion-unknown</option></select>
              <button type="submit">Add item</button>
            </form>
            <h3>Network attachments</h3>
            <table><thead><tr><th>Port</th><th>Owning slot</th><th>Role</th><th>Rate</th><th>Rail</th></tr></thead><tbody>
              {c.attachments.map((a: any) => <tr key={a.port}><td>{a.port}</td><td><code>{a.slot}</code></td><td>{a.role}</td><td>{a.rate}G</td><td>{a.rail ?? '—'}</td></tr>)}
            </tbody></table>
            {c.components.some((k: any) => k.item === 'frontend_dual_dpu_200') && <button onClick={() => act(() => api.edit({ mutation: 'FB-DPU' }), scopeText)}>Replace dual-port DPU with two single-port DPUs</button>}
            <h3>Populations</h3>
            {pops.map((x: any) => {
              const list: string[] = x.occurrences.list ?? [];
              const next = () => { const n = list.length + 1; let id = `${c.id}${String(n).padStart(2, '0')}`; let k = n; while (s.populations.some((q: any) => (q.occurrences.list ?? []).includes(id))) id = `${c.id}${String(++k).padStart(2, '0')}`; return id; };
              return (<div key={x.id} className="row" data-testid={`pop-${x.id}`}>
                <span><strong>{x.id}</strong>: {list.length} physical server(s) — {list.join(', ')}</span>
                <button onClick={() => act(() => api.edit({ patch: [{ op: 'replace', path: `/populations/${x.pi}/occurrences/list`, value: [...list, next()] }], note: `${x.id}: add occurrence ${next()}` }), scopeText)}>Add server</button>
                <button disabled={list.length === 0} onClick={() => act(() => api.edit({ patch: [{ op: 'replace', path: `/populations/${x.pi}/occurrences/list`, value: list.slice(0, -1) }], note: `${x.id}: remove occurrence ${list.at(-1)}` }), scopeText)}>Remove last</button>
              </div>);
            })}
          </article>);
      })}
    </section>
  );
}

function Destinations({ p, out, focus, act }: { p: any; out: any; focus: string; act: Act }) {
  const s = p.state;
  return (
    <section aria-label="Destinations">
      <article className="card"><h2>Fabric context → leaf context → allocation group</h2>
        <table><thead><tr><th>Population</th><th>Role</th><th>Fabric context (network)</th><th>Leaf context</th><th>Allocation group</th></tr></thead><tbody>
          {s.populations.flatMap((x: any, pi: number) => Object.entries(x.destinations).map(([role, net]: any) => {
            const n = s.networks.find((y: any) => y.id === net); const lc = s.leafContexts.find((y: any) => y.id === n?.leafContext);
            return <tr key={`${x.id}-${role}`}><td>{x.id}</td><td>{role}</td>
              <td><select aria-label={`${x.id} ${role} network`} value={net} onChange={e => act(() => api.edit({ patch: [{ op: 'replace', path: `/populations/${pi}/destinations/${role}`, value: e.target.value }], note: `${x.id} ${role} → ${e.target.value}` }), scopeText)}>{s.networks.map((y: any) => <option key={y.id} value={y.id}>{y.id} ({y.proposedFabric})</option>)}</select></td>
              <td>{lc?.id}</td><td>{lc?.serverGroup.id}</td></tr>;
          }))}
        </tbody></table>
        <p className="muted">Picking a destination binds intent only; no switch instance is chosen.</p>
      </article>
      {s.leafContexts.map((lc: any, li: number) => {
        const g = out?.groups.find((x: any) => x.context === lc.id); const sz = out?.sizing.find((x: any) => x.context === lc.id); const led = out?.contextLedgers.find((x: any) => x.context === lc.id);
        return (
          <article key={lc.id} className={`card ${focus.startsWith(lc.id) ? 'focus' : ''}`} data-testid={`ctx-${lc.id}`}>
            <h2>{lc.label} <span className="muted">{lc.id} · profile {lc.profile.name} · evidence {lc.profile.evidenceId.slice(0, 10)}</span></h2>
            <SelectorEditor lc={lc} li={li} act={act} />
            <div className="row"><label>Fixed switch occurrences <input aria-label={`${lc.id} instance quantity`} placeholder="unknown" defaultValue={isUnknown(lc.instanceQuantity) ? '' : lc.instanceQuantity} onBlur={e => { const v = e.target.value.trim(); const value = v === '' ? { state: 'unknown', reason: 'instance-quantity-not-supplied', provenance: 'ui' } : Number(v); if (v === '' && isUnknown(lc.instanceQuantity)) return; if (v !== '' && (!Number.isSafeInteger(value) || (value as number) < 0)) return; void act(() => api.edit({ patch: [{ op: 'replace', path: `/leafContexts/${li}/instanceQuantity`, value }], note: `${lc.id}: fixed occurrences ${v || 'unknown'}` }), scopeText); }} /></label></div>
            {g ? <dl className="grid" aria-label={`${lc.id} accounts`}>
              <dt>Configured usage (whole switch)</dt><dd data-testid={`configured-${lc.id}`}>{fmtQ(led.configured)} · {led.status}</dd>
              <dt>Selected members</dt><dd>{g.selected}</dd><dt>Available after reservations</dt><dd>{g.availableSelected}</dd>
              <dt>Reserved uplink members</dt><dd>{g.uplinkReserved}</dd><dt>Unused configured</dt><dd>{fmtQ(g.unusedConfigured)}</dd>
              <dt>Assigned links</dt><dd>{out.assignments.filter((a: any) => a.context === lc.id).length}</dd>
              <dt>Leaf occurrences</dt><dd data-testid={`bound-${lc.id}`}>{sz ? `${sz.status}: lower bound ${fmtQ(sz.lowerBound)}; ${sz.witnessIds.length} witness(es); unmet ${sz.unmetDemands}` : 'not sized'}</dd>
            </dl> : <p className="muted">Generate to see selector expansion and accounts.</p>}
            {g && <details><summary>Selector expansion ({g.sourceSelector})</summary><p>Explicit order: {g.selector.labels.join(', ')}{g.selector.children ? `; children ${g.selector.children.join(', ')}` : ''}. Usable parents: {g.usableParents.map((u: any) => u.port).join(', ') || 'none'}.</p></details>}
          </article>);
      })}
    </section>
  );
}

function SelectorEditor({ lc, li, act }: { lc: any; li: number; act: Act }) {
  const [text, setText] = useState(lc.serverGroup.selector.labels.join(','));
  useEffect(() => setText(lc.serverGroup.selector.labels.join(',')), [lc]);
  const parse = (t: string) => t.split(',').flatMap(part => { const m = /^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(part); if (m) { const a = Number(m[1]), b = Number(m[2]); return Array.from({ length: b - a + 1 }, (_, k) => a + k); } return part.trim() ? [Number(part)] : []; });
  return (
    <form className="row" onSubmit={e => { e.preventDefault(); const labels = parse(text); if (labels.some(n => !Number.isSafeInteger(n))) return; void act(() => api.edit({ patch: [{ op: 'replace', path: `/leafContexts/${li}/serverGroup/selector`, value: { ...lc.serverGroup.selector, labels } }, { op: 'replace', path: `/leafContexts/${li}/serverGroup/sourceSelector`, value: `printed ${text}` }], note: `${lc.id} ${lc.serverGroup.id}: selector ${text}` }), scopeText); }}>
      <label>Allocation group {lc.serverGroup.id} members (printed labels, ordered; ranges allowed) <input aria-label={`${lc.id} selector`} value={text} onChange={e => setText(e.target.value)} /></label>
      <button type="submit">Save selector</button>
    </form>
  );
}

function Bom({ p, out, outAssess, act }: { p: any; out: any; outAssess: any; act: Act }) {
  const [open, setOpen] = useState<Record<string, boolean>>({}); const [config, setConfig] = useState('interactive'); const [run, setRun] = useState<any>(null);
  const start = async () => { const r = await api.generate(config); setRun({ id: r.run, events: [] }); const poll = async () => { const s = await api.run(r.run); setRun({ id: r.run, ...s }); if (!s.result) setTimeout(poll, 150); else await act(async () => s.result, x => `Generation ${x.outcome}${x.reason ? ` (${x.reason})` : ''}.`); }; void poll(); };
  const reqs = useMemo(() => new Map((out?.requirements ?? []).map((r: any) => [r.id, r])), [out]);
  return (
    <section aria-label="BOM">
      <div className="row"><select aria-label="run configuration" value={config} onChange={e => setConfig(e.target.value)}>{p.configs.map((c: string) => <option key={c}>{c}</option>)}</select>
        <button onClick={start} disabled={!!run && !run.result}>Generate</button>
        {run && !run.result && <><span role="status">Running… {run.events?.join(' → ')}</span><button onClick={() => api.cancel(run.id)}>Cancel</button></>}
      </div>
      {!out ? <p>No output yet. Generate a conditional BOM.</p> : <>
        <p className={`badge ${outAssess?.status === 'stale' ? 'stale' : ''}`} data-testid="output-status">Output {out.id?.slice?.(0, 10) ?? ''} · input revision {out.inputRevision} · {out.outcome} · {outAssess?.status}{outAssess?.reasons?.length ? `: ${outAssess.reasons.join('; ')}` : ''}</p>
        <table className="bom" data-testid="bom"><thead><tr><th></th><th>Line</th><th>Category</th><th>Installed</th><th>Purchase</th><th>Basis / state</th></tr></thead><tbody>
          {out.purchaseLines.map((l: any) => <Fragment key={l.id}>
            <tr data-testid={`line-${l.item}`}><td><button aria-expanded={!!open[l.id]} aria-label={`expand ${l.item}`} onClick={() => setOpen({ ...open, [l.id]: !open[l.id] })}>{open[l.id] ? '−' : '+'}</button></td>
              <td>{l.item}</td><td>{l.category}</td><td>{fmtQ(l.installed)}</td><td className={isUnknown(l.quantity) ? 'unk' : ''}>{fmtQ(l.quantity)}</td><td>{l.purchaseNote ?? l.basis ?? l.acquisition}{l.qualification ? ' · qualification unknown' : ''}</td></tr>
            {open[l.id] && l.requirementIds.map((rid: string) => { const r: any = reqs.get(rid); const u = out.constructions.find((x: any) => x.id === rid);
              return <tr key={rid} className="child"><td></td><td colSpan={2}><code>{rid}</code></td>
                <td>{r ? `${fmtQ(r.units)} × ${r.perUnit} = ${fmtQ(r.installed)}` : u ? `${u.links.length} link(s)` : ''}</td><td>{r ? fmtQ(r.purchaseNeed) : u ? '1 unit' : ''}</td><td>{r ? `${r.classId}@${r.classRevision}${r.coveredBy ? ` · covered by ${r.coveredBy.split('/').pop()}` : ''}` : u ? `${u.reservedChildren} reserved/parked child(ren)` : ''}</td></tr>; })}
          </Fragment>)}
        </tbody></table>
        <p>Known generic purchase units (mixed-unit checksum, not a price): <strong data-testid="known-units">{out.summary.knownGenericPurchaseUnits}</strong>; unresolved: {out.summary.unresolvedPurchaseLines.join(', ') || 'none'}.</p>
        <h3>Missing infrastructure (never zero)</h3>
        <ul>{out.missingInfrastructure.map((m: any) => <li key={m.id} data-testid={`missing-${m.id}`}><strong>{m.id}</strong>: {fmtQ(m.quantity)} — {m.reason}{m.conditionalLowerBound !== undefined ? ` · conditional lower bound ${fmtQ(m.conditionalLowerBound)}` : ''}{m.knownServerInterfaces !== undefined ? ` · known server interfaces ${fmtQ(m.knownServerInterfaces)}` : ''}</li>)}</ul>
        <h3>Diagnostics</h3>
        {out.diagnostics.length ? <ul data-testid="diagnostics">{out.diagnostics.map((d: any, i: number) => <li key={i} className={d.severity}><strong>{d.code}</strong> ({d.severity}): {d.cause}{d.remedies ? ` Options: ${d.remedies.join('; ')}.` : ''}</li>)}</ul> : <p>None.</p>}
        <p className="muted">Excluded from scope: {out.excluded.join('; ')}.</p>
      </>}
    </section>
  );
}

function Review({ p, out, outAssess, act, goTo }: { p: any; out: any; outAssess: any; act: Act; goTo: (s: string) => void }) {
  const [sel, setSel] = useState<string>(''); const [note, setNote] = useState(''); const [fields, setFields] = useState<string[]>([]);
  if (!out) return <p>Generate first.</p>;
  const reviewsByRow = (id: string) => p.assessment.reviews.filter((r: any) => r.row === id);
  const row = out.reviewRows.find((r: any) => r.id === sel);
  const FIELDS = ['sideA.classRevision', 'sideA.item', 'sideA.rate', 'sideB.mode', 'sideB.group', 'construction.kind', 'construction.linksPerUnit'];
  return (
    <section aria-label="Connection review">
      {outAssess?.status === 'stale' && <p className="badge stale">This output is stale; inspection rows reflect input revision {out.inputRevision}.</p>}
      <table data-testid="review-rows"><thead><tr><th>Side A (server)</th><th>Side B (leaf)</th><th>Construction</th><th>Links</th><th>Units</th><th>Reserved/parked</th><th>Exceptions</th><th>Unknown</th><th>Inspection</th></tr></thead><tbody>
        {out.reviewRows.map((r: any) => { const rv = reviewsByRow(r.id); return (
          <tr key={r.id} className={sel === r.id ? 'focus' : ''} onClick={() => setSel(r.id)}>
            <td>{r.signature.sideA.classId}@{r.signature.sideA.classRevision} · {r.signature.sideA.item} · {r.signature.sideA.rate}G <button className="link" onClick={e => { e.stopPropagation(); goTo(r.editShortcuts.sideA); }}>edit</button></td>
            <td>{r.signature.sideB.context}/{r.signature.sideB.group} · {r.signature.sideB.mode} <button className="link" onClick={e => { e.stopPropagation(); goTo(r.editShortcuts.sideB); }}>edit</button></td>
            <td>{r.signature.construction.id} ({r.signature.construction.kind})</td><td>{r.counts.links}</td><td>{r.counts.units}</td><td>{r.counts.reservedOrParkedChildren}</td>
            <td>{[r.exceptions.unassigned.length && `${r.exceptions.unassigned.length} unassigned`, r.exceptions.heldByLock.length && `${r.exceptions.heldByLock.length} held by lock`].filter(Boolean).join(', ') || '—'}</td>
            <td>{r.unknownFields.join(', ')}</td><td>{rv.length ? rv.map((x: any) => x.status).join('; ') : 'not inspected'}</td>
          </tr>); })}
      </tbody></table>
      {row && <form className="card" onSubmit={e => { e.preventDefault(); if (!fields.length) return; void act(() => api.review({ output: out.id, row: row.id, fields, note }), () => 'Inspection recorded for this row, member set and revision.'); }}>
        <h3>Record manual inspection — {row.id}</h3>
        <p className="muted">Scope: {row.counts.links} member link(s) in input revision {out.inputRevision}. Unknown fields ({row.unknownFields.join(', ')}) are excluded automatically; inspection does not confer qualification.</p>
        <details><summary>Members</summary><p>{row.links.join(', ')}</p></details>
        <fieldset><legend>Inspected fields</legend>{FIELDS.map(f => <label key={f} className="chk"><input type="checkbox" checked={fields.includes(f)} onChange={e => setFields(e.target.checked ? [...fields, f] : fields.filter(x => x !== f))} />{f}</label>)}</fieldset>
        <label>Note <input aria-label="review note" value={note} onChange={e => setNote(e.target.value)} /></label>
        <button type="submit" disabled={!fields.length}>Save inspection</button>
      </form>}
    </section>
  );
}

function History({ p, act, openOutput }: { p: any; act: Act; openOutput: (id: string) => void }) {
  const outs = p.assessment.outputs; const [a, setA] = useState(''); const [b, setB] = useState(''); const [d, setD] = useState<any>(null);
  return (
    <section aria-label="History">
      <article className="card"><h2>Input revisions</h2><ol>{p.inputs.map((i: any) => <li key={i.id}>r{i.revision} — {i.change} <code>{i.id.slice(0, 10)}</code>{i.id === p.head ? ' (head)' : ''}</li>)}</ol></article>
      <article className="card"><h2>Outputs (immutable; status derived)</h2>
        <table data-testid="outputs"><thead><tr><th>Output</th><th>Input</th><th>Config</th><th>Outcome</th><th>Status</th><th></th></tr></thead><tbody>
          {outs.map((o: any) => <tr key={o.id}><td><code>{o.id.slice(0, 10)}</code></td><td>r{o.inputRevision}</td><td>{o.config}</td><td>{o.outcome}</td><td className={o.status}>{o.status}{o.reasons.length ? `: ${o.reasons.join('; ')}` : ''}</td><td><button onClick={() => openOutput(o.id)}>Open</button></td></tr>)}
        </tbody></table>
        {p.partials.length > 0 && <p>Interrupted runs: {p.partials.map((x: any) => `${x.reason} (${x.completedStages.join(',') || 'no stages'})`).join('; ')}</p>}
        <form className="row" onSubmit={async e => { e.preventDefault(); if (a && b) { try { setD((await api.diff(a, b)).changes); } catch (x: any) { setD({ error: x.message }); } } }}>
          <select aria-label="diff from" value={a} onChange={e => setA(e.target.value)}><option value="">from…</option>{outs.map((o: any) => <option key={o.id} value={o.id}>r{o.inputRevision} {o.id.slice(0, 8)}</option>)}</select>
          <select aria-label="diff to" value={b} onChange={e => setB(e.target.value)}><option value="">to…</option>{outs.map((o: any) => <option key={o.id} value={o.id}>r{o.inputRevision} {o.id.slice(0, 8)}</option>)}</select>
          <button type="submit">Diff</button>
        </form>
        {d && <DiffView d={d} />}
      </article>
      <article className="card"><h2>Inspections</h2><ul>{p.assessment.reviews.map((r: any) => <li key={r.id}>{r.row} [{r.fields.join(', ')}] — <strong>{r.status}</strong>: {r.reason}</li>)}</ul></article>
      <article className="card"><h2>Evidence</h2>
        <ul>{p.evidence.map((e: any) => <li key={e.id}><code>{e.id.slice(0, 10)}</code> {e.origin} {e.profile}{e.parent ? ` (revision of ${e.parent.slice(0, 10)})` : ''} — {e.note}</li>)}</ul>
        {p.evidenceRevisions.map((f: string) => <button key={f} onClick={() => act(() => api.refresh(f), r => `Evidence refreshed into a new input revision; ${r.impact?.affectedLedgers?.length ?? 0} ledger(s) affected. Historical outputs unchanged.`)}>Apply controlled revision {f}</button>)}
        <p><a href={api.exportUrl()} onClick={async e => { e.preventDefault(); const r = await fetch(api.exportUrl(), { headers: { 'x-hhaid-token': api.token } }); const blob = await r.blob(); const u = URL.createObjectURL(blob); const x = document.createElement('a'); x.href = u; x.download = `${p.name}.hhaid.json`; x.click(); URL.revokeObjectURL(u); }}>Export project (.hhaid.json)</a></p>
      </article>
    </section>
  );
}

function DiffView({ d }: { d: any }) {
  if (d.error) return <p className="error">{d.error}</p>;
  const sec = (name: string, x: any) => (x.added?.length || x.removed?.length || x.changed?.length || x.regrouped?.length) ? <li key={name}><strong>{name}</strong>: +{x.added?.length ?? 0} −{x.removed?.length ?? 0} ~{x.changed?.length ?? 0}{x.regrouped?.length ? ` · regrouped ${x.regrouped.length}` : ''}
    {x.changed?.length ? <ul>{x.changed.slice(0, 20).map((c: any) => <li key={c.id}><code>{c.id}</code>: {JSON.stringify(c.from)} → {JSON.stringify(c.to)}</li>)}</ul> : null}</li> : null;
  return <ul data-testid="diff">{['purchaseLines', 'requirements', 'constructions', 'assignments', 'ledgers', 'sizing', 'reviewRows', 'missingInfrastructure'].map(k => sec(k, d[k]))}<li>diagnostics: +{d.diagnostics.added.join(', ') || '∅'} −{d.diagnostics.removed.join(', ') || '∅'}</li></ul>;
}
