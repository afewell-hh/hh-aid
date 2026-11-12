// Application/store APIs provide test barriers; no engine imports or expected generation.
import {pathToFileURL} from 'node:url';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {once} from 'node:events';
const [app,out,manifest]=process.argv.slice(2);
const api=await import(pathToFileURL(`${app}/src/app/project.ts`));
mkdirSync(out,{recursive:true});const results={};
async function fresh(name){const s=api.newProject(`${out}/${name}`,'independent','parts','s02-runner');await api.seed(s,manifest,'ce4b8e6','parts');return s;}
function save(s,name){writeFileSync(`${out}/${name}.json`,s.exportText());}
let s=await fresh('concurrent');
results.concurrent=await Promise.all([api.edit(s,'parts',{mutation:'FB-DPU'}),api.edit(s,'parts',{mutation:'FB-COUNT'})]);save(s,'concurrent');s.close();
for(const boundary of ['before','after','deadline']){
 s=await fresh(boundary);const prior=await api.generate(s,'parts').result;await api.edit(s,'parts',{mutation:'FB-DPU'});
 const h=api.generate(s,'parts',{stepMode:true,...(boundary==='deadline'?{deadlineMs:2000}:{})});await once(h,'started');
 if(boundary!=='before'){h.go();await once(h,'stage');}
 if(boundary!=='deadline')h.cancel('user-cancel');
 results[boundary]={prior,interrupted:await h.result};save(s,boundary+'-partial');
 results[boundary].resume=await api.generate(s,'parts').result;save(s,boundary+'-resumed');s.close();
}
s=await fresh('uninterrupted');await api.edit(s,'parts',{mutation:'FB-DPU'});results.uninterrupted=await api.generate(s,'parts').result;save(s,'uninterrupted');s.close();
writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
const {startRun}=await import(pathToFileURL(`${app}/src/runner/runner.ts`));
s=await fresh('operation');
const cfg={id:'independent-tiny',maxMaterializedOccurrences:10000,maxDemandTerminations:10000,maxCandidateSwitches:256,maxCandidateInspections:3};
results.operation=await startRun(s,{actor:'parts',config:cfg}).result;save(s,'operation');s.close();
writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
s=await fresh('cache');const first=await api.generate(s,'parts').result;const id=s.get(first.outputId).stageResults.S1;
const f=`${s.dir}/docs/${id}.json`;const original=readFileSync(f,'utf8');writeFileSync(f,original.replace('"servers":4','"servers":5'));
results.cache=await api.generate(s,'parts').result;save(s,'cache');s.close();
writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
