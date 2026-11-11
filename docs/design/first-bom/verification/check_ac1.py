#!/usr/bin/env python3
"""Independent synthetic resource oracle, not an allocator or app test.

No paired demands are supplied: assigned=0 is a fixture fact.
--actual compares a future adapter's exact case-result projection, not raw app JSON.
"""
import argparse
import json
from pathlib import Path


def derive(case):
    data = case['input']
    # Enumerate configured logical footprints, independently of selected ports.
    configured = {(parent, child) for parent, count in data['parents'].items()
                  if count is not None for child in range(1, count + 1)}
    unknown = any(v is None for v in data['parents'].values())
    known = len(configured)
    # Known usage alone can already prove a violation even with other unknowns.
    status = 'conflict' if known > data['budget'] else ('unresolved' if unknown else 'within-budget')
    diagnostic = {'conflict': 'configured-budget-exceeded',
                  'unresolved': 'configured-mode-unknown',
                  'within-budget': None}[status]
    selected = set(data['selected'])
    return dict(known_configured=known, configured_total=None if unknown else known,
                selected=len(selected), available_selected=len(selected-set(data['reserved'])),
                assigned=0, status=status, diagnostic=diagnostic)


def compare(expected, actual):
    # Exact projection: missing/extra cases/keys and null-to-zero changes fail.
    if expected != actual:
        raise ValueError('AC1 result projection differs from independently frozen expectations')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--actual', type=Path)
    args = parser.parse_args()
    fixture = json.loads(Path(__file__).with_name('ac1.json').read_text())
    expected = {c['id']: c['expected'] for c in fixture['cases']}
    if len(expected) != len(fixture['cases']):
        raise ValueError('duplicate case ID')
    compare(expected, {c['id']: derive(c) for c in fixture['cases']})
    # Deliberate corruption probes: this harness must detect these mistakes.
    for case_id, field, value in [('AC1-over-budget', 'configured_total', 2),
                                 ('AC1-unused-mode-unknown', 'configured_total', 0),
                                 ('AC1-reserve-selected', 'known_configured', 7)]:
        bad = json.loads(json.dumps(expected))
        bad[case_id][field] = value
        try:
            compare(expected, bad)
        except ValueError:
            continue
        raise AssertionError('corrupted projection accepted')
    if args.actual:
        compare(expected, json.loads(args.actual.read_text()))
        print('AC1 external projection matched; producer evidence required separately')
    else:
        print('AC1 fixture derivation and 3 corruption probes passed; no application tested')


if __name__ == '__main__':
    main()
