// Evidence production only: recorded raw inputs run in the actual BF machine.
// No expected answer or test oracle is imported by production runtime code.
import {readFile,writeFile} from 'node:fs/promises';
import {loadKernel,execute} from '../runtime/system.mjs';
import {decodeImage,sha256} from '../dist/images.mjs';
const kernel=await loadKernel(),initialImage=await readFile('dist/initial-industry.8i','utf8');
const manifest=JSON.parse(await readFile('programs/autonomous-system.json','utf8'));
const paths=['kernel.bf.gz','kernel-map.json','executor.wasm','engine.mjs','wasm-engine.mjs','worker.mjs','images.mjs','programs/autonomous-system.json',...manifest.libraries.map(n=>'programs/'+n)];
const artifactSha256=Object.fromEntries(await Promise.all(paths.map(async p=>[p,await sha256(await readFile('dist/'+p))])));
const bad=': factory-west.thread schema# 1 begin 0 until ;';
const runs=[];
for(const [label,inputs] of [
  ['Automatic search, publication and real construction',[...Array(60).fill('autonomy-step'),'synthesis-state district-state industry-state 1 source-read']],
  ['Looping candidate is rejected while live work continues',['0 autonomy-enabled',`${bad.length} 1 16 search-custom ${bad}`,...Array(10).fill('autonomy-step'),'synthesis-state industry-account 1 source-read']],
]){
  const machine=await decodeImage(initialImage,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  const expectedOutputs=[];let elapsedMs=0;
  for(const input of inputs){const start=performance.now();execute(machine,input+'\n',{fuel:2e14,blocks:3e10});elapsedMs+=performance.now()-start;
    const output=new TextDecoder().decode(machine.drain());if(machine.state!=='input'||/!E\d|WS-ERROR/.test(output))throw Error(`Incomplete reproduction input: ${output}`);expectedOutputs.push(output);}
  const all=expectedOutputs.join('');
  if(label.startsWith('Automatic')&&(!/SEARCH-DECISION 1 1 /.test(all)||!/DISTRICT-BUILT/.test(all)))throw Error('Automatic acceptance/construction was not observed');
  if(label.startsWith('Looping')&&(!/MODULE-PUBLISHED 1 /.test(all)||!/SEARCH-DECISION 1 2 /.test(all)||/SEARCH-DECISION 1 1 /.test(all)))throw Error('A compiled looping candidate and its native rejection were not observed');
  runs.push({label,inputs,expectedOutputs,elapsedMs});console.log(JSON.stringify({label,inputs:inputs.length,elapsedMs}));
}
const bundle={schema:'8i-replay-1',build:'004',kernelSha256:kernel.programHash,artifactSha256,initialImage,runs,
  provenance:'Actual raw output from fresh BF machines. The live browser never loads expected output. Grammar ordering and all decisions are native. First run includes search, held-out validation, publication and subsequent real construction; second includes native loop rejection.',
  instructions:'Node.js22+: node tools/replay.mjs dist/reproduction/build-004.json. No dependencies, network or API key required.'};
await writeFile('dist/reproduction/build-004.json',JSON.stringify(bundle,null,2)+'\n');
await writeFile('records/004/reproduction-build.json',JSON.stringify({kernel:kernel.programHash,artifactSha256,initialImageSha256:await sha256(initialImage),runs:await Promise.all(runs.map(async({expectedOutputs,...r})=>({...r,outputSha256:await sha256(expectedOutputs.join(''))})))},null,2)+'\n');
