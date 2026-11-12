#!/usr/bin/env python3
"""Export-only acceptance adapter. No engine imports or expected-value inputs.
Fixture names identify paths/fields only; absent actual fields raise errors.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from verify import read_json


def canonical(x):
    # Fixtures use integer-only JSON; UTF-16 key ordering matches JCS/JS.
    if isinstance(x, dict):
        return '{'+','.join(json.dumps(k,ensure_ascii=False)+':'+canonical(x[k]) for k in sorted(x,key=lambda k:k.encode('utf-16be')))+'}'
    if isinstance(x,list): return '['+','.join(map(canonical,x))+']'
    return json.dumps(x,ensure_ascii=False,separators=(',',':'))


def sha(x): return hashlib.sha256(canonical(x).encode()).hexdigest()
def scalar(x):
    if type(x) is int or x is None:return x
    assert x['state']=='unknown' and x['reason'] and x['provenance']
    return None

def only(xs):
    xs=list(xs);assert len(xs)==1,len(xs)
    return xs[0]


def load(path):
    e=read_json(path);assert e['format']=='hhaid-export/1'
    docs={d['id']:d['content'] for d in e['documents']}
    assert len(docs)==len(e['documents'])
    for id,c in docs.items():assert sha(c)==id,('digest',id)
    assert docs[e['head']]['kind']=='ProjectIndex'
    seen=set();pending=[e['head']]
    kinds={'inputs':'InputRevision','outputs':'OutputRevision','reviews':'ReviewRecord','diffs':'DiffRecord','evidence':'EvidenceSnapshot','stageResults':'StageResult','partialCandidates':'PartialCandidate'}
    while pending:
        id=pending.pop()
        if id in seen:continue
        seen.add(id);c=docs[id];k=c['kind'];refs=[]
        if k=='ProjectIndex':
            for bucket,expected in kinds.items():
                for r in c['roots'][bucket]:assert docs[r]['kind']==expected;refs.append(r)
            if c['inputHead'] is not None:
                assert c['inputHead'] in c['roots']['inputs']
                assert docs[c['inputHead']]['projectId']==c['projectId']
            else:assert not c['roots']['inputs']
            if c['previous']:
                refs.append(c['previous']);older=docs[c['previous']]
                assert older['projectId']==c['projectId']
                for bucket in kinds:assert set(older['roots'][bucket])<=set(c['roots'][bucket])
        elif k=='InputRevision':
            refs+=c['evidence']
            if c['parent']:refs.append(c['parent']);assert docs[c['parent']]['revision']+1==c['revision']
        elif k=='EvidenceSnapshot':
            if 'parentEvidence' in c:refs.append(c['parentEvidence'])
        elif k=='OutputRevision':refs=[c['input']]+c['evidence']+list(c['stageResults'].values())
        elif k=='PartialCandidate':refs=[c['input']]+c['evidence']+[s['id'] for s in c['completedStages']]
        elif k=='DiffRecord':refs=[c['from'],c['to']]
        elif k=='ReviewRecord':refs=[c['output']]
        else:assert k=='StageResult'
        pending+=refs
    assert seen==set(docs),('unreachable',set(docs)-seen)
    return e,docs


def output(path):
    e,docs=load(path)
    outs=[(id,docs[id]) for id in docs[e['head']]['roots']['outputs']]
    id,o=max(outs,key=lambda t:t[1]['inputRevision'])
    return id,o,docs[o['input']],e,docs


def quantities(o):
    buy=o['purchaseLines'];by={b['item']:b for b in buy}
    fe=[u for u in o['constructions'] if u['construction']=='FE-OPT'];be=[u for u in o['constructions'] if u['construction']=='BE-SPLIT']
    return dict(servers=o['summary']['servers'],fe_links=sum(d['role']=='frontend' for d in o['demands']),be_links=sum(d['role']=='backend' for d in o['demands']),fe_server_modules=by['fe_server_optic_200G']['quantity'],fe_switch_modules=by['fe_switch_optic_4x200G']['quantity'],be_assemblies=by['be_split_dac_2x400G']['quantity'],be_parked_tails=sum(u['reservedChildren'] for u in be),fe_reserved_children=sum(u['reservedChildren'] for u in fe),management=o['summary']['managementInterfaces'],separate={b['item']:b['quantity'] for b in buy if b['category']=='server-component' and b['acquisition']=='separate'},included={b['item']:b['installed'] for b in buy if b['acquisition']=='included'},unknown_purchase={b['item']:b['installed'] for b in buy if b['acquisition']=='inclusion-unknown'})


def occurrence_check(o,i):
    classes={(c['id'],c['revision']):c for c in i['classes']};servers=set();demands={};requirements={};mgmt=0
    for pop in i['populations']:
        c=classes[pop['classId'],pop['classRevision']];occ=pop['occurrences']
        if 'list' in occ:members=occ['list']
        else:
            r=occ['range'];members=[r['prefix']+str(n).zfill(r['width']) for n in range(r['start'],r['start']+r['count'])]
        for member in members:
            assert member not in servers;servers.add(member)
            for a in c['attachments']:
                demands['DEM/'+member+'/'+a['port']]=(member,a['port'],a['slot'],a.get('rail'),pop['destinations'][a['role']])
        for comp in c['components']:
            requirements[pop['id'],comp['slot']]=(len(members),comp)
            mgmt+=len(members)*comp['qtyPerUnit']*comp.get('managementInterfaces',0)
    assert o['summary']['servers']==len(servers)
    assert o['summary']['managementInterfaces']==mgmt
    assert {d['id']:(d['occurrence'],d['port'],d['slot'],d.get('rail'),d['network']) for d in o['demands']}==demands
    assert len(o['demands'])==len(demands)
    assert len(o['requirements'])==len(requirements)
    reqs={r['id']:r for r in o['requirements']}
    for r in o['requirements']:
        n,c=requirements[r['population'],r['slot']]
        assert (r['units'],r['perUnit'],r['installed'])==(n,c['qtyPerUnit'],n*c['qtyPerUnit'])
        assert r['acquisition']==c['acquisition']
        if c['acquisition']=='included':
            assert r['purchaseNeed']==0
            parent=reqs[r['coveredBy']];assert parent['slot']==c['coveredBy'] and parent['population']==r['population']
        elif c['acquisition']=='separate':assert r['purchaseNeed']==r['installed']
        else:assert scalar(r['purchaseNeed']) is None
    for b in o['purchaseLines']:
        if b['category']=='server-component':
            rs=[reqs[r] for r in b['requirementIds']]
            assert b['installed']==sum(r['installed'] for r in rs)
            assert len(rs)==len(set(b['requirementIds']))
            if b['acquisition']=='included':assert b['quantity']==0
            elif b['acquisition']=='separate':assert b['quantity']==b['installed']
            else:assert scalar(b['quantity']) is None
    units={u['id']:u for u in o['constructions']};assert len(units)==len(o['constructions'])
    construction={c['id']:c for c in i['constructions']};covered=[]
    for u in units.values():
        c=construction[u['construction']];covered+=u['links']
        assert len(u['links'])+u['reservedChildren']==c['linksPerUnit']
        if c['pairing']=='same-rail':assert len({demands[d][3] for d in u['links']})==1
    assert Counter(covered)==Counter(demands.keys())
    assigned=o['assignments'];assert len({a['demand'] for a in assigned})==len(assigned)
    assert len({(a['context'],a['occurrence'],a['label'],a['child']) for a in assigned})==len(assigned)
    groups={g['context']:g for g in o['groups']}
    for a in assigned:
        assert a['demand'] in units[a['unit']]['links']
        parent=only(p for p in groups[a['context']]['usableParents'] if p['label']==a['label'])
        assert 1<=a['child']<=parent['children']
        u=units[a['unit']];assert u['placement']=={'label':a['label'],'occurrence':a['occurrence']}
        assert a['context']==u['context']
    links=[]
    for r in o['reviewRows']:
        links+=r['links'];assert r['counts']['links']==len(r['links'])
        assert r['counts']['units']==len(set(r['units']))
        assert r['memberDigest']==sha(r['links'])
        c=construction[r['signature']['construction']['id']]
        for side,end in [('sideA','server'),('sideB','switch')]:assert r['signature'][side]['physical']==c['ends'][end]
    assert Counter(links)==Counter('LINK/'+d[4:] for d in demands)
    return dict(servers=len(servers),demands=len(demands),requirements=len(reqs),units=len(units),reviewRows=len(o['reviewRows']),assigned=len(assigned))


def supplies(o,i):
    expected=Counter()
    constructors={c['id']:c for c in i['constructions']}
    for unit in o['constructions']:
        c=constructors[unit['construction']]
        if c['kind']=='parent-module':
            expected[c['item']['serverModule']]+=len(unit['links'])*c['serverModulePerLink']
            expected[c['item']['switchModule']]+=c['switchModulePerUnit']
        else:expected[c['item']['assembly']]+=1
    actual=Counter()
    for b in o['purchaseLines']:
        if b['category']!='server-component':actual[b['item']]+=b['quantity']
    return {'expected':dict(expected),'actual':dict(actual),'pass':expected==actual}


def main():
    p=argparse.ArgumentParser();p.add_argument('run',type=Path);p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
    fb={};ac={};evidence={}
    for name in ['baseline','count','dpu','unknown','exhaust','lock','over-budget','reserve-selected','reserve-unselected','unused-mode-unknown']:
        path=a.run/name/'project.hhaid.json';id,o,i,e,ds=output(path)
        assert supplies(o,i)['pass'],('physical supply mismatch',name,supplies(o,i))
        evidence[name]={'output':id,'export_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'documents':len(ds),'checks':occurrence_check(o,i)}
        if name in ['baseline','count']:
            q=quantities(o)
            if name=='baseline':
                q['resources']={g['context']:dict(configured=only(c for c in o['contextLedgers'] if c['context']==g['context'])['configured'],selected=g['selected'],uplinks=g['uplinkReserved'],unused=g['unusedConfigured'],max_pipeline=only(c for c in o['contextLedgers'] if c['context']==g['context'])['maxPipelineKnown'],lower_bound=only(s for s in o['sizing'] if s['context']==g['context'])['lowerBound']) for g in o['groups']}
                q['missing']={m['id']:scalar(m['quantity']) for m in o['missingInfrastructure']}
            fb['baseline' if name=='baseline' else 'count_A3']=q
        if name in ['over-budget','reserve-selected','reserve-unselected','unused-mode-unknown']:
            l=only(l for l in o['ledgers'] if l['scope']=='pipeline:S');g=only(o['groups'])
            ac['AC1-'+name]=dict(known_configured=l['knownConfigured'],configured_total=scalar(l['configuredTotal']),selected=g['selected'],available_selected=g['availableSelected'],assigned=len(o['assignments']),status=l['status'],diagnostic=l['diagnostic'])
    for name,data in [('fb01',fb),('ac1',ac),('exports',evidence)]: (a.out/(name+'.json')).write_text(json.dumps(data,indent=2)+'\n')
    print('Actual export projections and independent identity checks written')

if __name__=='__main__':main()
