#!/usr/bin/env python3
import argparse,json,subprocess
from pathlib import Path
from exports import *
p=argparse.ArgumentParser();p.add_argument('app',type=Path);p.add_argument('baseline',type=Path);p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True);project=a.out/'project';records=[]
def run(*args):
 r=subprocess.run([str(a.app.resolve()/'bin/hhaid'),*map(str,args),'--json'],capture_output=True,text=True);records.append(dict(args=list(map(str,args)),code=r.returncode,stdout=r.stdout,stderr=r.stderr));return r
id,old,i,e,ds=output(a.baseline);assert run('import',a.baseline,project).returncode==0
row=next(r for r in old['reviewRows'] if r['signature']['construction']['id']=='FE-OPT')
assert run('review',project,'--output',id,'--row',row['id'],'--fields','sideA.cage').returncode!=0
index=next(n for n,c in enumerate(i['constructions']) if c['id']=='FE-OPT')
patch=a.out/'patch.json';patch.write_text(json.dumps([{'op':'replace','path':f'/constructions/{index}/ends/server/cage','value':'SYNTH-A-CAGE'},{'op':'replace','path':f'/constructions/{index}/ends/switch/connector','value':'SYNTH-B-CONNECTOR'}]))
assert run('edit',project,'--patch',patch).returncode==0
assessment=json.loads(run('assess',project).stdout);assert next(x for x in assessment['outputs'] if x['id']==id)['status']=='stale'
assert run('generate',project).returncode==0
export=a.out/'export.json';assert run('export',project,'-o',export).returncode==0
newid,new,ni,ne,nd=output(export);assert all(nd[k]==v for k,v in ds.items());assert new['purchaseLines']==old['purchaseLines'];assert occurrence_check(new,ni)
for row in new['reviewRows']:
 if row['signature']['construction']['id']=='FE-OPT':
  assert row['signature']['sideA']['physical']['cage']=='SYNTH-A-CAGE';assert row['signature']['sideB']['physical']['connector']=='SYNTH-B-CONNECTOR';assert row['id'] not in {r['id'] for r in old['reviewRows']}
 else:assert row in old['reviewRows']
(a.out/'results.json').write_text(json.dumps({'old':id,'new':newid,'records':records,'checks':'unknown inspection rejected; per-end edits/stale/regroup/history/BOM invariance passed'},indent=2));print('Independent physical semantics checks passed')
