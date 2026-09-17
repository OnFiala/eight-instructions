// Measurement harness only, absent from production imports. Every timed guest
// operation executes in actual BF. Privileged component probes are labelled;
// end-to-end acceptance is measured separately through ordinary autonomy-step.
import os from 'node:os';
import {readFile,writeFile} from 'node:fs/promises';
import {loadKernel,loadLibraries,execute} from '../runtime/system.mjs';
import {encodeImage,decodeImage,sha256} from '../dist/images.mjs';
const loadStart=performance.now(),kernel=await loadKernel(),artifactLoadMs=performance.now()-loadStart;
const image=await readFile('dist/initial-industry.8i','utf8'),source=await loadLibraries('autonomous-system.json');
const restore=()=>decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
const samples=[];
for(let sample=1;sample<=3;sample++){
  let m=kernel.create();const operations=[];
  const measure=(label,input)=>{
    const start=performance.now(),steps=m.totalSteps,blocks=m.totalBlocks;
    execute(m,input+'\n',{fuel:2e14,blocks:3e10});
    const elapsedMs=performance.now()-start,output=new TextDecoder().decode(m.drain());
    if(m.state!=='input'||/!E\d|WS-ERROR/.test(output))throw Error(`Unfinished measurement ${label}: ${output}`);
    operations.push({label,elapsedMs,bfInstructions:String(m.totalSteps-steps),executorBlocks:String(m.totalBlocks-blocks),output,hostRssBytes:process.memoryUsage().rss});return output;
  };
  measure('coldNativeBoot',source);
  measure('liveRound','process-step');
  measure('completeNativePresentation','synthesis-state district-state industry-state');
  measure('sourceRead','1 source-read');
  measure('worldCopy','0 1 context-copy');
  measure('worldZero','1 context-zero');
  measure('nativeSearchInitialize','1 1 32 search-start');
  measure('componentSourceGeneration','5 5 s! generate-source');
  measure('componentTrialEnter','trial-enter');
  measure('componentCandidateCompile','generated-store 1 module-compile');
  measure('componentFourTrialRounds','process-step process-step process-step process-step');
  measure('componentScore','4 8 s! trial-score');
  measure('componentTrialLeave','trial-leave');
  measure('componentRejectAndReclaim','0 16 s! search-publish');
  const exportStart=performance.now(),exported=await encodeImage(m,kernel.programHash),exportMs=performance.now()-exportStart;
  const importStart=performance.now();await decodeImage(exported,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});const importMs=performance.now()-importStart;
  m=await restore();let transcript='';
  for(let i=1;i<=26;i++)transcript+=measure(`autonomousRound${i}`,'autonomy-step');
  if(!/SEARCH-DECISION 1 1 /.test(transcript))throw Error('Real native automatic publication was not observed');
  const publicationStep=operations.find(o=>/SEARCH-DECISION 1 1 /.test(o.output));
  samples.push({sample,operations,publicationStep:publicationStep.label,exportMs,importMs,imageBytes:Buffer.byteLength(exported)});
  console.log(JSON.stringify({sample,publicationStep:publicationStep.label,publicationCallMs:publicationStep.elapsedMs,exportMs,importMs}));
}
const summary={};
for(const key of samples[0].operations.map(o=>o.label)){
  const v=samples.map(s=>s.operations.find(o=>o.label===key).elapsedMs).sort((a,b)=>a-b);
  summary[key]={samples:3,minMs:v[0],medianMs:v[1],maxMs:v[2]};
}
const receipt={measuredAt:new Date().toISOString(),method:'Three sequential cold boots and fresh round-zero images in one Node/Wasm process. Component probes use privileged raw Thread inputs in a disposable machine and are not acceptance evidence. Each independent end-to-end run uses only autonomy-step and must actually publish. The publication call includes its live round, final trial work, scoring, publication and cleanup; it is not an isolated compiler-only timing. Run with all other native tests and browser advancement stopped. Limits2e14BF instructions/3e10generic blocks per input.',environment:{host:os.hostname(),cpu:os.cpus()[0].model,logicalCpus:os.cpus().length,ramBytes:os.totalmem(),platform:os.platform(),architecture:os.arch(),node:process.version},kernelSha256:kernel.programHash,sourceSha256:await sha256(source),imageSha256:await sha256(image),tapeBytes:kernel.map.dialect.tape_cells*2,artifactLoadMs,hostPeakRssKiB:process.resourceUsage().maxRSS,summary,samples};
await writeFile('records/004/metrics.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({artifactLoadMs,summary,hostPeakRssKiB:receipt.hostPeakRssKiB}));
