#!/usr/bin/env python3
"""Actual CLI import validation and bounded compact-input generation."""
import argparse,json,subprocess,time
from pathlib import Path
from exports import load
p=argparse.ArgumentParser();p.add_argument('app',type=Path);p.add_argument('baseline',type=Path);p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);cli=str(a.app.resolve()/'bin/hhaid');results={}
def run(*args):
 t=time.monotonic();r=subprocess.run([cli,*map(str,args),'--json'],capture_output=True,text=True,timeout=30);return dict(code=r.returncode,seconds=time.monotonic()-t,stdout=r.stdout,stderr=r.stderr)
e,docs=load(a.baseline);evidence=next(k for k,v in docs.items() if v['kind']=='EvidenceSnapshot')
for name,mutate in [('missing-reference',lambda x:x.update(documents=[d for d in x['documents'] if d['id']!=evidence])),('duplicate-document',lambda x:x['documents'].append(x['documents'][0])),('bad-digest',lambda x:x['documents'][0]['content'].update(note='tampered'))]:
 x=json.loads(json.dumps(e));mutate(x);f=a.out/(name+'.json');f.write_text(json.dumps(x));results[name]=run('import',f,a.out/(name+'-project'));assert results[name]['code']!=0
for name,token in [('unsafe','9007199254740993'),('fraction','1.0'),('exponent','1e3'),('negative-zero','-0')]:
 f=a.out/(name+'.json');f.write_text('{"format":"hhaid-export/1","head":'+token+',"documents":[]}');results[name]=run('import',f,a.out/(name+'-project'));assert results[name]['code']!=0
for name,count in [('huge',10**12),('overflow',2**53-1)]:
 project=a.out/(name+'-project');assert run('import',a.baseline,project)['code']==0
 patch=a.out/(name+'-patch.json');patch.write_text(json.dumps([{'op':'replace','path':'/populations/0/occurrences','value':{'range':{'prefix':'A','start':1,'count':count,'width':16}}}]))
 assert run('edit',project,'--patch',patch)['code']==0
 results[name]=run('generate',project,'--config','scale');assert results[name]['code']==0
 assert json.loads(results[name]['stdout'])['outcome']==('limit-reached' if name=='huge' else 'complete')
 export=a.out/(name+'-export.json');assert run('export',project,'-o',export)['code']==0
 _,ds=load(export);o=max((d for d in ds.values() if d['kind']=='OutputRevision'),key=lambda d:d['inputRevision']);b=next(b for b in o['purchaseLines'] if b['item']=='backend_nic_400')
 assert o['assignments']==[] and o['demands'] is None
 if name=='huge':assert b['quantity']==8*count
 else:assert b['quantity']['reason']=='quantity-overflow'
 results[name]['quantity']=b['quantity'];results[name]['limits']=o['limits']
(a.out/'results.json').write_text(json.dumps(results,indent=2));print('negative import and compact population checks passed')
