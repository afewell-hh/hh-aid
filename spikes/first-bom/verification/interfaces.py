#!/usr/bin/env python3
"""Black-box CLI/HTTP concurrency and malformed import probes, old and corrected builds."""
import argparse,concurrent.futures,json,os,re,subprocess,tempfile,urllib.request,urllib.error
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('app',type=Path);p.add_argument('--manifest',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.app=a.app.resolve();a.out.mkdir(parents=True,exist_ok=True)
manifest=a.manifest.resolve()
def cli(*args):
 r=subprocess.run([str(a.app/'bin/hhaid'),*map(str,args),'--json'],capture_output=True,text=True,cwd=a.app);return {'code':r.returncode,'stdout':r.stdout,'stderr':r.stderr}
results={}
for name,raw in [('empty','{"format":"hhaid-export/1","head":"","documents":[]}'),('null','{"format":"hhaid-export/1","head":null,"documents":[]}'),('unsafe','{"format":"hhaid-export/1","head":9007199254740993,"documents":[]}'),('duplicate','{"format":"hhaid-export/1","head":null,"head":"","documents":[]}')]:
 f=a.out/(name+'.json');f.write_text(raw);results[name]=cli('import',f,a.out/(name+'-project'))
project=a.out/'concurrent';assert cli('new',project,'--project-id','s02-concurrency')['code']==0
assert cli('seed',project,'--manifest',manifest,'--manifest-commit','ce4b8e6')['code']==0
server=subprocess.Popen([str(a.app/'.toolchain/node/bin/node'),'src/server/main.ts',str(project),'--port','0'],cwd=a.app,env={**os.environ,'HHAID_TOKEN':'s02-test'},stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
try:
 while True:
  line=server.stdout.readline();match=re.search(r'http://127.0.0.1:\d+',line)
  if match:break
  if server.poll() is not None:raise RuntimeError(server.stderr.read())
 base=match.group()
 def api(path,data=None):
  req=urllib.request.Request(base+'/api/'+path,data=json.dumps(data).encode() if data is not None else None,headers={'x-hhaid-token':'s02-test','content-type':'application/json'})
  try:
   with urllib.request.urlopen(req) as r:return r.status,json.load(r)
  except urllib.error.HTTPError as e:return e.code,json.load(e)
 before=api('project')[1]
 with concurrent.futures.ThreadPoolExecutor(2) as pool:edits=list(pool.map(lambda m:api('edit',{'mutation':m}),['FB-DPU','FB-COUNT']))
 after=api('project')[1];results['concurrent']={'edits':edits,'before':before,'after':after}
 results['stale']=api('edit',{'mutation':'FB-UNKNOWN-MODE','baseInput':before['head']})
 results['after_stale']=api('project')[1]
 (a.out/'concurrent-export.json').write_text(json.dumps(api('export')[1]))
finally:server.terminate();server.wait(timeout=10)
(a.out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps({'imports':{k:v['code'] for k,v in results.items() if isinstance(v,dict) and 'code'in v},'revisions':[x['revision'] for x in after['inputs']],'stale_status':results['stale'][0]}))
