#!/usr/bin/env python3
"""Independent history, mutation, and interrupted-run export checks."""
import argparse,json
from pathlib import Path
from exports import *
p=argparse.ArgumentParser();p.add_argument('run',type=Path);p.add_argument('runner',type=Path);p.add_argument('--out',type=Path,required=True);a=p.parse_args();report={};previous={}
for path in sorted((a.run/'lifecycle').glob('*.hhaid.json')):
 id,o,i,e,ds=output(path)
 assert all(ds[k]==v for k,v in previous.items());previous=ds
 report[path.name]={'output':id,'documents':len(ds),'checks':occurrence_check(o,i)}
 assert supplies(o,i)['pass']
assert (a.run/'lifecycle/05-final.hhaid.json').read_bytes()==(a.run/'lifecycle/06-reexport.hhaid.json').read_bytes()
ledger={c['context']:c for c in o['contextLedgers']};assert ledger['LC-FE']['status']=='conflict' and ledger['LC-FE']['maxPipelineKnown']==8;assert ledger['LC-BE']['status']=='within-budget' and ledger['LC-BE']['maxPipelineKnown']==4
base=output(a.run/'baseline/project.hhaid.json')[1];dpu=output(a.run/'dpu/project.hhaid.json')[1]
assert dpu['summary']['managementInterfaces']-base['summary']['managementInterfaces']==2
assert dpu['summary']['servers']==base['summary']['servers'] and len(dpu['demands'])==len(base['demands'])
assert sum(b['quantity'] for b in dpu['purchaseLines'] if b['item']=='frontend_single_dpu_200')==4
unknown=output(a.run/'unknown/project.hhaid.json')[1]
for scope,known in [('switch',158),('pipeline:15',4)]:
 l=only(l for l in unknown['ledgers'] if l['context']=='LC-FE' and l['scope']==scope);assert l['knownConfigured']==known and scalar(l['configuredTotal']) is None and l['status']=='unresolved'
exhaust=output(a.run/'exhaust/project.hhaid.json')[1];s=only(s for s in exhaust['sizing'] if s['context']=='LC-FE');assert (s['suppliedOccurrences'],s['lowerBound'],s['unmetDemands'])==(1,2,4)
lock=output(a.run/'lock/project.hhaid.json');assert any(d['code']=='lock-target-unavailable' for d in lock[1]['diagnostics']);locked=lock[2]['locks'][0];assert not any(x['demand']==locked['demand'] for x in lock[1]['assignments'])
results=read_json(a.runner/'results.json')
for name in ['before','after','deadline']:
 r=results[name];inter=r['interrupted'];assert inter['completedStages']==([] if name=='before' else ['S1']);assert inter['reason']==('deadline' if name=='deadline' else 'user-cancel');assert r['resume']['outputId']==results['uninterrupted']['outputId']
 e,ds=load(a.runner/(name+'-partial.json'));idx=ds[e['head']];assert idx['roots']['outputs']==[r['prior']['outputId']];part=ds[inter['partialId']];assert all(s['id'] in idx['roots']['stageResults'] for s in part['completedStages'])
 load(a.runner/(name+'-resumed.json'))
e,ds=load(a.runner/'concurrent.json');h=ds[ds[e['head']]['inputHead']];assert h['revision']==3;assert any(c['revision']=='r1+dpu-split' for c in h['classes']);assert len(h['populations'][0]['occurrences']['list'])==3
_,op,_,_,_=output(a.runner/'operation.json');assert op['outcome']=='limit-reached' and op['assignments']==[];assert op['limits'][0]['limit']=='maxCandidateInspections';assert op['summary']['knownGenericPurchaseUnits']==52
report['runner']=results;report['mutations']='DPU/unknown/exhaust/lock/evidence checks passed';a.out.write_text(json.dumps(report,indent=2)+'\n');print('Independent lifecycle, mutation, concurrency and interrupted export checks passed')
