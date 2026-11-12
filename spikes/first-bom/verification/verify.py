#!/usr/bin/env python3
"""Independent acceptance utilities. No application/engine imports.

materialize: exact accepted D04 oracle files from git, hash locked.
projection: run the accepted oracle on an actual normalized JSON projection.
roundtrip: strict byte comparison of actual exports (not proof of closure).
self-test: synthetic harness tests only, never application acceptance.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
MAX_SAFE = 2**53 - 1


def pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise ValueError('duplicate JSON key: ' + key)
        result[key] = value
    return result


def integer(token):
    if token == '-0' or abs(int(token)) > MAX_SAFE:
        raise ValueError('unsafe integer token: ' + token)
    return int(token)


def reject_number(token):
    raise ValueError('non-integer JSON number: ' + token)


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'), object_pairs_hook=pairs,
                      parse_int=integer, parse_float=reject_number,
                      parse_constant=reject_number)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def materialize(destination):
    lock = read_json(ROOT / 'oracle.lock.json')
    destination.mkdir(parents=True, exist_ok=True)
    for item in lock['files']:
        data = subprocess.check_output(['git', 'show', item['commit'] + ':' + item['path']])
        if digest(data) != item['sha256']:
            raise ValueError('pinned oracle source hash mismatch: ' + item['path'])
        target = destination / item['name']
        if target.exists() and target.read_bytes() != data:
            raise ValueError('refusing to overwrite different oracle: ' + str(target))
        target.write_bytes(data)
    return lock


def self_test():
    import tempfile
    with tempfile.TemporaryDirectory(prefix='hhaid-verify-') as temp:
        path = Path(temp)/'value.json'
        for token in ('9007199254740993','1e3','1.0','-0','NaN','Infinity','{"a":1,"a":2}'):
            path.write_text(token)
            try:
                read_json(path)
            except ValueError:
                pass
            else:
                raise AssertionError('unsafe JSON accepted: '+token)
        path.write_text('{"quantity":0,"unknown":null,"flag":false}')
        value=read_json(path)
        assert type(value['quantity']) is int and value['unknown'] is None and type(value['flag']) is bool
        dest=Path(temp)/'oracles'
        materialize(dest)
        for checker in ('check_ac1.py','check_fb01.py'):
            subprocess.run([sys.executable,'-I',str(dest/checker)],check=True)
        original=(dest/'ac1.json').read_bytes()
        (dest/'ac1.json').write_bytes(original+b' ')
        try:
            materialize(dest)
        except ValueError:
            pass
        else:
            raise AssertionError('altered oracle was silently overwritten')
    print('Harness self-test passed; no application tested')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    commands=parser.add_subparsers(dest='command',required=True)
    p=commands.add_parser('materialize');p.add_argument('--out',type=Path,required=True)
    p=commands.add_parser('projection');p.add_argument('--kind',choices=('ac1','fb01'),required=True);p.add_argument('--actual',type=Path,required=True);p.add_argument('--oracles',type=Path,required=True)
    p=commands.add_parser('roundtrip');p.add_argument('before',type=Path);p.add_argument('after',type=Path)
    commands.add_parser('self-test')
    args=parser.parse_args()
    if args.command=='materialize':
        materialize(args.out);print('Pinned oracle bytes materialized and verified')
    elif args.command=='projection':
        read_json(args.actual)  # reject lexical numeric loss/duplicate keys before oracle
        materialize(args.oracles)
        script=args.oracles/('check_ac1.py' if args.kind=='ac1' else 'check_fb01.py')
        subprocess.run([sys.executable,'-I',str(script),'--actual',str(args.actual)],check=True)
    elif args.command=='roundtrip':
        read_json(args.before);read_json(args.after)
        if args.before.read_bytes()!=args.after.read_bytes():
            raise ValueError('export bytes changed through roundtrip')
        print('Roundtrip bytes preserved; history closure must be checked separately')
    else:
        self_test()


if __name__=='__main__':
    main()
