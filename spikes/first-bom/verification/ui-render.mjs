// Actual UI timing, separately from generation. No engine imports.
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const [app,project,out]=process.argv.slice(2);
const {chromium}=await import(pathToFileURL(`${app}/node_modules/playwright/index.mjs`));
const server=spawn(`${app}/.toolchain/node/bin/node`,[`${app}/src/server/main.ts`,project,'--port','0'],{cwd:app,stdio:['ignore','pipe','inherit']});
const url=await new Promise(resolve=>server.stdout.on('data',b=>{const m=b.toString().match(/http:\/\/127.0.0.1:\d+\/#token=[a-f0-9]+/);if(m)resolve(m[0]);}));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.addInitScript(()=>{window.arrivals=[];const f=window.fetch;window.fetch=async(...args)=>{const r=await f(...args);const j=r.json.bind(r);r.json=async()=>{const d=await j();window.arrivals.push({url:String(args[0]),at:performance.now()});return d;};return r;};});
 let release;const gate=new Promise(r=>release=r);
 await page.route('**/api/doc/*',async route=>{const response=await route.fetch();const data=await response.json();if(data.kind==='OutputRevision')await gate;await route.fulfill({response});});
 await page.goto(url);await page.getByRole('tab',{name:'Connection review'}).click();release();
 await page.getByTestId('review-rows').locator('tbody tr').first().waitFor();
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const firstRender=await page.evaluate(()=>({afterDataMs:performance.now()-window.arrivals.at(-1).at,rows:document.querySelectorAll('[data-testid="review-rows"] tbody tr').length}));
 const samples=[];
 for(let n=0;n<5;n++){
  await page.getByRole('tab',{name:'BOM',exact:true}).click();
  const start=await page.evaluate(()=>performance.now());
  await page.getByRole('tab',{name:'Connection review'}).click();
  await page.getByTestId('review-rows').locator('tbody tr').first().waitFor();
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  samples.push(await page.evaluate(start=>({clickToPaintMs:performance.now()-start,rows:document.querySelectorAll('[data-testid="review-rows"] tbody tr').length,latestData:window.arrivals.at(-1)}),start));
 }
 await page.screenshot({path:out+'.png'});writeFileSync(out+'.json',JSON.stringify({url:url.split('#')[0],firstRender,samples},null,2));console.log(JSON.stringify(samples));
}finally{await browser.close();server.kill();}
