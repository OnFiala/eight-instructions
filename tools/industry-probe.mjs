// Diagnostic CLI workload. This is not part of the live computation path.
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {loadLibraries} from '../runtime/system.mjs';
import {industry,run,account,kernel} from '../tests/industry-helpers.mjs';
import {encodeImage,decodeImage,sha256} from '../dist/images.mjs';
const source=await loadLibraries('industry-system.json');
let m;
if(process.argv.includes('--initial-image')) {
  const image=await readFile('dist/initial-industry.8i','utf8'),receipt=JSON.parse(await readFile('records/003/initial-image.json','utf8'));
  assert.equal(await sha256(image),receipt.imageSha256);assert.equal(await sha256(source),receipt.sourceSha256);
  m=await decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
}else m=await industry();
const limit=Number(process.argv[2]??600);
const checkpoints=`.local/probes/${Date.now()}-${process.pid}`;await mkdir(checkpoints,{recursive:true});
console.log(JSON.stringify({kernel:kernel.programHash,sourceHash:createHash('sha256').update(source).digest('hex'),checkpoints}));
await writeFile(`${checkpoints}/initial.8i`,await encodeImage(m,kernel.programHash));
let completed=false;
for(let i=1;i<=limit;i++) {
  const start=performance.now(),before=m.totalSteps;
  const output=run(m,'process-step industry-account');
  assert.doesNotMatch(output,/PROCESS-FAULT|WS-ERROR|!E\d/);
  assert.match(output,/ACCOUNT 96 \d+ \d+ \d+ 96 1/);
  console.log(output.trim());
  console.log(JSON.stringify({round:i,ms:performance.now()-start,instructions:String(m.totalSteps-before)}));
  if(i%50===0)await writeFile(`${checkpoints}/running.8i`,await encodeImage(m,kernel.programHash));
  if(/BUILD [56] 8 8/.test(output)) {
    const consumed=run(m,'4 13 ef w@ . 5 13 ef w@ .').trim();
    if(consumed==='8 8'){completed=true;break;}
  }
}
account(m);console.log(run(m,'industry-state'));
await writeFile(`${checkpoints}/running.8i`,await encodeImage(m,kernel.programHash));
console.log(JSON.stringify({completed,steps:String(m.totalSteps)}));
