// Evidence only: actual BF execution generates every expected output. Production
// never imports these transcripts. Packaging is a separate file-I/O tool.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {loadKernel,loadLibraries,execute} from '../runtime/system.mjs';
import {decodeImage,sha256} from '../dist/images.mjs';
import {readIndustry} from '../dist/industry-presentation.mjs';
const kernel=await loadKernel(),image=await readFile('dist/initial-industry.8i','utf8');
const receipt=JSON.parse(await readFile('records/003/initial-image.json','utf8'));
if(await sha256(image)!==receipt.imageSha256||await sha256(await loadLibraries('industry-system.json'))!==receipt.sourceSha256)throw new Error('Initial native source/image identity differs');
const call=(m,input)=>{
  execute(m,input+'\n',{fuel:5e14,blocks:5e10});
  if(m.state!=='input')throw new Error('Native replay input did not complete');
  const out=new TextDecoder().decode(m.drain()),view=readIndustry(out);
  if(view.nativeError||view.events.some(e=>e.kind==='WS-ERROR'))throw new Error(`Native replay refused input: ${out}`);
  return out;
};
const fresh=()=>decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
const probe=await fresh(),source=readIndustry(call(probe,'1 source-read')).sources.get(1);
const variants=[{label:'Original factory batch3',source},{label:'Factory batch5',source:source.replace('batch# 3','batch# 5')}];
const count=64,runs=[],results=[];
for(const variant of variants){
  const m=await fresh(),inputs=[`${variant.source.length} 1 source-write ${variant.source}`,'1 module-compile',...Array(count).fill('process-step'),'industry-state'],expectedOutputs=[];
  for(const [index,input] of inputs.entries()){
    expectedOutputs.push(call(m,input));
    if(index%16===0)console.log(`${variant.label}: native input ${index+1}/${inputs.length}`);
  }
  const w=readIndustry(expectedOutputs.at(-1)).world;
  if(w.account[4]!==96||w.account[5]!==1)throw new Error('Native material invariant failed');
  results.push({label:variant.label,round:w.tick,deliveries:w.deliveries,production:w.productions,stations:w.entities.filter(e=>e.role===4).map(e=>({id:e.id,installed:e.consumed})),account:w.account});
  runs.push({label:variant.label,inputs,expectedOutputs});
}
const manifest=JSON.parse(await readFile('programs/industry-system.json','utf8'));
const paths=['kernel.bf.gz','kernel-map.json','executor.wasm','engine.mjs','wasm-engine.mjs','worker.mjs','images.mjs','programs/industry-system.json',...manifest.libraries.map(n=>'programs/'+n)];
const artifactSha256=Object.fromEntries(await Promise.all(paths.map(async p=>[p,await sha256(await readFile('dist/'+p))])));
const sourceVariants=await Promise.all(variants.map(async v=>({...v,sha256:await sha256(v.source)})));
const bundle={schema:'8i-replay-1',build:'003',kernelSha256:kernel.programHash,artifactSha256,initialImage:image,runs,sourceVariants,instructions:'Extract build-003.zip and run node tools/replay.mjs dist/reproduction/build-003.json with Node.js22+. Two fresh BF machines start from the same image and identical external inputs/roads, including an open toll bridge. Only one factory source differs. Both run64logical rounds. Expected output is a recorded comparison, never part of live simulation. This does not claim a complete industrial run or an execution-time speedup.'};
await mkdir('dist/reproduction',{recursive:true});
await writeFile('dist/reproduction/build-003.json',JSON.stringify(bundle,null,2)+'\n');
await writeFile('records/003/reproduction-results.json',JSON.stringify({kernel:kernel.programHash,sourceHash:receipt.sourceSha256,initialImageSha256:receipt.imageSha256,logicalRounds:count,results},null,2)+'\n');
execFileSync(process.execPath,['tools/package-reproduction.mjs'],{stdio:'inherit'});
console.log(JSON.stringify({results}));
