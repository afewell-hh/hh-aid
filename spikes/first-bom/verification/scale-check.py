#!/usr/bin/env python3
import argparse,json,hashlib
from pathlib import Path
from exports import output,occurrence_check
p=argparse.ArgumentParser();p.add_argument('runs',type=Path);p.add_argument('--out',type=Path,required=True);a=p.parse_args();results=[]
for n in range(1,6):
 path=a.runs/str(n)/'export/project.hhaid.json';id,o,i,e,ds=output(path);checks=occurrence_check(o,i)
 assert checks['servers']==4000 and checks['demands']==24000 and checks['assigned']==24000
 sums={item:sum(b['quantity'] for b in o['purchaseLines'] if b['item']==item) for item in ['fe_server_optic_200G','fe_switch_optic_4x200G','be_split_dac_2x400G']}
 accounting_pass=list(sums.values())==[8000,2000,8000]
 # Exported per-instance exception: exactly one A server has two single-port DPUs.
 pops=[p for p in i['populations'] if p['classId']=='A-x'];assert len(pops)==1 and len(pops[0]['occurrences']['list'])==1
 assert o['summary']['managementInterfaces']==6001
 for u in o['constructions']:
  group=u['network'].rsplit('-',1)[-1]
  assert all(group in d.split('/')[1] for d in u['links'])
 results.append(dict(run=n,output=id,export_sha256=hashlib.sha256(path.read_bytes()).hexdigest(),checks=checks,modules_and_assemblies=sums,accounting_pass=accounting_pass,management=6001))
 print(n,id,flush=True)
assert len({r['output'] for r in results})==1
a.out.write_text(json.dumps(results,indent=2)+'\n')
if not all(r['accounting_pass'] for r in results):raise SystemExit('FAIL: scale purchase lines do not conserve physical supplies')
