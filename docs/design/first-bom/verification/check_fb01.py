#!/usr/bin/env python3
"""Read pinned source inputs, independently enumerate counts, compare frozen oracle.
No generator imports and no use of manifest author_expected/expected deltas.
Resource mapping follows accepted pinned DS5000 evidence, not a live profile fetch.
"""
import argparse
from collections import Counter
import copy
import hashlib
import json
from pathlib import Path
import subprocess


def quantities(classes):
    separate, included, unknown = Counter(), Counter(), Counter()
    servers, frontend, backend, management = set(), [], [], 0
    rail_servers = {}
    for cls in classes:
        for server in cls['occurrences']:
            if server in servers:
                raise ValueError('duplicate physical server')
            servers.add(server)
            for counter, key in [(separate, 'separate_per_server'),
                                 (included, 'included_per_server'),
                                 (unknown, 'unresolved_inclusion_per_server')]:
                counter.update(cls[key])
            management += cls['management_interfaces_per_server']
            frontend.extend((server, p) for p in cls['frontend_ports'])
            if len(cls['backend_ports']) != len(cls['backend_rails']):
                raise ValueError('port/rail map length mismatch')
            for port, rail in zip(cls['backend_ports'], cls['backend_rails']):
                backend.append((server, port))
                rail_servers.setdefault(rail, []).append(server)
    fe_parents = [frontend[i:i+4] for i in range(0,len(frontend),4)]
    be_groups = [(rail, members[i:i+2]) for rail, members in rail_servers.items()
                 for i in range(0,len(members),2)]
    return dict(servers=len(servers), fe_links=len(frontend), be_links=len(backend),
                fe_server_modules=len(frontend), fe_switch_modules=len(fe_parents),
                be_assemblies=len(be_groups), be_parked_tails=sum(2-len(m) for _,m in be_groups),
                fe_reserved_children=sum(4-len(m) for m in fe_parents), management=management,
                separate=dict(separate), included=dict(included), unknown_purchase=dict(unknown))


def resources(context, required_parents):
    children = {'4x200G':4,'2x400G':2}[context['server_mode']]
    mode_count = {p:children for p in range(1,33)} | {p:1 for p in range(33,65)}
    # Independent four-cage block grouping: positions 1/4 and 2/3 share budgets.
    loads = [sum(mode_count[p] for p in pair) for start in range(1,65,4)
             for pair in ((start,start+3),(start+1,start+2))]
    selected = [(p,c) for p in range(1,32) for c in range(children)]
    return dict(configured=sum(mode_count.values())+2, selected=len(selected),
                uplinks=32, unused=children, max_pipeline=max(loads), lower_bound=(required_parents+30)//31)


def compare(expected, actual, path='$'):
    """Validate exact JSON shape/types before values (bool is not an integer)."""
    if type(actual) is not type(expected):
        raise ValueError(f'{path}: expected {type(expected).__name__}, got {type(actual).__name__}')
    if type(expected) is dict:
        if expected.keys() != actual.keys():
            raise ValueError(f'{path}: missing or extra keys')
        for key in expected:
            compare(expected[key], actual[key], f'{path}.{key}')
    elif type(expected) is list:
        if len(expected) != len(actual):
            raise ValueError(f'{path}: different list length')
        for index, (left, right) in enumerate(zip(expected, actual)):
            compare(left, right, f'{path}[{index}]')
    elif actual != expected:
        raise ValueError(f'{path}: value differs from frozen expectation')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--actual',type=Path,help='future normalized output projection; baseline and count_A3 only')
    args=parser.parse_args()
    expected=json.loads(Path(__file__).with_name('fb01-expected.json').read_text())
    raw=subprocess.check_output(['git','show',expected['manifest_commit']+':'+expected['manifest_path']])
    if hashlib.sha256(raw).hexdigest()!=expected['manifest_sha256']:
        raise ValueError('source manifest hash changed')
    manifest=json.loads(raw)
    # These are deliberately fixture-specific checks, not general profile parsing.
    for context in manifest['leaf_contexts']:
        assert context['configured_server_labels_inclusive']==[1,32]
        assert context['server_labels_inclusive']==[1,31]
        assert context['uplink_labels_inclusive']==[33,64]
        assert context['unused_labels']==[32]
    base=quantities(manifest['classes'])
    base['resources']={c['id']:resources(c, base['fe_switch_modules'] if c['id']=='LC-FE' else base['be_assemblies']) for c in manifest['leaf_contexts']}
    base['missing']={row['id']:row['quantity'] for row in manifest['missing_infrastructure']}
    changed=copy.deepcopy(manifest['classes'])
    changed[0]['occurrences'].append('A03')
    actual={'baseline':base,'count_A3':quantities(changed)}
    oracle={k:expected[k] for k in actual}
    compare(oracle, actual)
    for field, value in [('be_parked_tails', False), ('servers', 4.0)]:
        bad = copy.deepcopy(oracle)
        bad['baseline'][field] = value
        try:
            compare(oracle, bad)
        except ValueError:
            continue
        raise AssertionError('corrupted FB01 projection accepted')
    # Independent hand-derived mutation obligations; no author expected fields read.
    assert 31*4+32+2==expected['unknown_mode']['known_configured']
    assert expected['unknown_mode']['configured_total'] is None
    assert 8-4==expected['exhaust']['unmet']
    assert 2*2-2==expected['dpu_delta']['physical_dpus']
    assert expected['catalog_limit6']['FE_max']>6
    if args.actual:
        compare(oracle, json.loads(args.actual.read_text()))
        print('FB01 external count projection matched; lifecycle/resource identity still needs separate evidence')
    else:
        print('FB01 pinned-input independent baseline/count derivation and 2 type corruption probes passed; no application tested')


if __name__=='__main__':
    main()
