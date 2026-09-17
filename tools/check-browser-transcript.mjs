// Verification only. Re-execute captured, single-line UI inputs in a fresh BF
// instance and compare every output byte. Never imported by the live application.
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {loadKernel,execute} from '../runtime/system.mjs';
import {decodeImage,sha256} from '../dist/images.mjs';
const transcriptPath=process.argv[2],receiptPath=process.argv[3],imagePath=process.argv[4]??'dist/initial-industry.8i';
if(!transcriptPath||!receiptPath)throw new Error('Usage: node tools/check-browser-transcript.mjs CAPTURE.txt RECEIPT.json [INITIAL.8i]');
const raw=await readFile(transcriptPath,'utf8'),image=await readFile(imagePath,'utf8');
if(!raw.startsWith('\n> industry-state\n')&&!raw.startsWith('\n> synthesis-state district-state industry-state\n'))throw new Error('Capture must start at the initial image and must not be truncated');
const inputs=raw.split('\n> ').slice(1).map(record=>{
  const end=record.indexOf('\n');
  if(end<0)throw new Error('Incomplete input record');
  return {input:record.slice(0,end),expected:record.slice(end+1)};
});
const kernel=await loadKernel(),m=await decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
let resumedPendingOperation=false,resumeOutputSha256=null;
if(m.state==='budget'){
  // The real browser importer resumes an exact paused operation before it asks
  // for a fresh readable frame. It does not reconstruct the missing earlier log.
  m.run({fuel:5e14,blocks:5e10});assert.equal(m.state,'input','Imported continuation did not reach an input boundary');
  resumedPendingOperation=true;resumeOutputSha256=await sha256(m.drain());
}
const start=performance.now(),results=[];
for(const [index,{input,expected}] of inputs.entries()){
  execute(m,input+'\n',{fuel:5e14,blocks:5e10});
  assert.equal(m.state,'input',`Input${index} did not complete`);
  const output=new TextDecoder().decode(m.drain());
  assert.equal(output,expected,`Input${index}: ${input}`);
  results.push({input,outputSha256:await sha256(output)});
}
const receipt={status:'PASS',purpose:'Actual browser output replayed byte-for-byte in a new CLI BF instance; captured commands are single-line inputs without embedded transcript delimiters.',kernel:kernel.programHash,initialImageSha256:await sha256(image),resumedPendingOperation,resumeOutputSha256,transcript:transcriptPath,transcriptSha256:await sha256(raw),inputs:results,elapsedMs:performance.now()-start};
await writeFile(receiptPath,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({status:receipt.status,inputs:results.length,kernel:kernel.programHash}));
