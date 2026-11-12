#!/usr/bin/env python3
"""Five fresh process runs with wall time and OS peak RSS; no engine imports.

Pass the actual recorded runner config and explicit app/harness revisions.
Command tokens may contain {run} and {out}; outputs must later pass independent
verification. A successful process exit alone is NOT acceptance evidence.
"""
import argparse
import hashlib
import json
from pathlib import Path
import platform
import re
import subprocess
import time
import statistics


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config',type=Path,required=True)
    parser.add_argument('--manifest',type=Path,required=True)
    parser.add_argument('--app-commit',required=True)
    parser.add_argument('--harness-commit',required=True)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('command',nargs=argparse.REMAINDER)
    args=parser.parse_args()
    command=args.command[1:] if args.command[:1]==['--'] else args.command
    if not command: parser.error('actual command is required after --')
    if args.out.exists(): parser.error('--out must be new; preserve previous measurements')
    system=platform.system()
    if system not in ('Darwin','Linux'): parser.error('RSS capture supported on Darwin/Linux only')
    args.out.mkdir(parents=True)
    report={'app_commit':args.app_commit,'harness_commit':args.harness_commit,
            'platform':platform.platform(),'processor':platform.processor(),
            'config_sha256':hashlib.sha256(args.config.read_bytes()).hexdigest(),
            'manifest_sha256':hashlib.sha256(args.manifest.read_bytes()).hexdigest(),
            'measurement':'/usr/bin/time process-tree peak RSS; not sum of concurrent process peaks',
            'verification':'pending: run independent member/history checks on each export',
            'samples':[]}
    for run in range(1,6):
        output=(args.out/str(run)).resolve();output.mkdir()
        cmd=[x.replace('{run}',str(run)).replace('{out}',str(output)) for x in command]
        timing=output/'time.txt'
        timed=['/usr/bin/time','-l' if system=='Darwin' else '-v','-o',str(timing)]+cmd
        started=time.perf_counter()
        with (output/'stdout.txt').open('wb') as stdout,(output/'stderr.txt').open('wb') as stderr:
            result=subprocess.run(timed,stdout=stdout,stderr=stderr)
        elapsed=time.perf_counter()-started
        text=timing.read_text()
        pattern=r'(\d+)\s+maximum resident set size' if system=='Darwin' else r'Maximum resident set size \(kbytes\):\s*(\d+)'
        match=re.search(pattern,text)
        rss=int(match.group(1))*(1 if system=='Darwin' else 1024) if match else None
        report['samples'].append(dict(run=run,command=cmd,wall_seconds=elapsed,peak_rss_bytes=rss,exit_code=result.returncode))
        (args.out/'report.json').write_text(json.dumps(report,indent=2)+'\n')
    walls=[x['wall_seconds'] for x in report['samples']]
    report.update(median_seconds=statistics.median(walls),max_seconds=max(walls))
    (args.out/'report.json').write_text(json.dumps(report,indent=2)+'\n')
    if any(x['exit_code']!=0 or x['peak_rss_bytes'] is None for x in report['samples']):
        raise SystemExit('one or more samples failed or lacked RSS; not successful scale evidence')
    print('Five process samples recorded; independent result verification still required')


if __name__=='__main__':main()
