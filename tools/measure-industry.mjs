// Measurement tool only. All guest work is executed by the actual BF artifact.
import os from 'node:os';
import {readFile,writeFile} from 'node:fs/promises';
import {loadKernel,loadLibraries,execute} from '../runtime/system.mjs';
import {encodeImage,decodeImage,sha256} from '../dist/images.mjs';
import {readIndustry} from '../dist/industry-presentation.mjs';
const artifactStart=performance.now(),kernel=await loadKernel(),artifactLoadMs=performance.now()-artifactStart;
const source=await loadLibraries('industry-system.json'),samples=[];
for(let sample=1;sample<=3;sample++){
  const m=kernel.create(),measurements=[];
  const measure=(label,input)=>{
    const start=performance.now(),steps=m.totalSteps,blocks=m.totalBlocks;
    execute(m,input+'\n',{fuel:5e14,blocks:5e10});
    const elapsedMs=performance.now()-start,output=new TextDecoder().decode(m.drain());
    const view=readIndustry(output);
    if(m.state!=='input'||view.nativeError||view.events.some(e=>e.kind==='WS-ERROR'))throw new Error(`Incomplete/refused measurement ${label}: ${output}`);
    measurements.push({label,elapsedMs,bfInstructions:String(m.totalSteps-steps),executorBlocks:String(m.totalBlocks-blocks),output,hostRssBytes:process.memoryUsage().rss,guestTapeBytes:m.tape.byteLength});
    return output;
  };
  measure('coldNativeBoot',source);
  measure('externalMessage','77 9 3 process-post .');
  measure('schedulerRound1','process-step');
  measure('fullPresentationFrame','industry-state');
  measure('storedSourceRead','1 source-read');
  measure('nativeSourceEditCompilePublish','4 1 parameter!');
  measure('rollback','1 module-rollback');
  let routes='',production='';
  for(let i=0;i<24;i++){
    const out=measure(`industrialRound${i+2}`,'process-step');
    if(out.includes('I-ROUTE'))routes+=out;if(out.includes('PRODUCE'))production+=out;
  }
  if(!routes||!production)throw new Error('Route and production workloads were not actually observed');
  measure('materialAccount','industry-account');
  const imgStart=performance.now(),image=await encodeImage(m,kernel.programHash),exportMs=performance.now()-imgStart;
  const restoreStart=performance.now(),restored=await decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create}),importMs=performance.now()-restoreStart;
  execute(restored,'industry-account\n',{fuel:5e14,blocks:5e10});
  const resumed=new TextDecoder().decode(restored.drain());
  if(resumed!==measure('afterImportAccount','industry-account'))throw new Error('Restored account differs');
  const program=': measure.thread recv if drop drop 0 state! else drop drop drop then ;';
  measure('cycleModuleSetup',`14 process-module measure.thread ${program.length} 6 source-write ${program} 6 module-compile`);
  // Pause industrial participants before timing this separate lifetime workload.
  measure('pauseIndustrialParticipants',Array.from({length:12},(_,i)=>`${i+1} process-pause`).join(' '));
  measure('cycleHarnessDefinition',': measured-cycle 0 begin dup 20 < while 6 process-create dup 19 4 rot process-post drop process-step process-stop 1+ repeat drop ;');
  measure('twentyWorkMessageReclaimCycles','measured-cycle');
  measure('releaseCycleModule','6 module-delete');
  samples.push({sample,measurements,exportMs,importMs,imageBytes:Buffer.byteLength(image),imageSha256:await sha256(image)});
  console.log(`Sample${sample}: native routes, production, image and reclaim measured.`);
}
const summary={};
for(const key of samples[0].measurements.map(m=>m.label)){
  const values=samples.map(s=>s.measurements.find(m=>m.label===key).elapsedMs).sort((a,b)=>a-b);
  summary[key]={samples:3,minMs:values[0],medianMs:values[1],maxMs:values[2]};
}
for(const key of ['exportMs','importMs']){const v=samples.map(s=>s[key]).sort((a,b)=>a-b);summary[key]={samples:3,minMs:v[0],medianMs:v[1],maxMs:v[2]};}
const result={measuredAt:new Date().toISOString(),method:'Three sequential fresh BF cold boots in one Node process using the generic Wasm executor. Limits5e14literal BF instructions/5e10executor blocks per input. No other project test, native browser run or probe is intentionally active during this measurement. Full-frame rendering output is timed separately from scheduler execution. Twenty-four subsequent rounds include actual native route phases and production; they are not isolated route-only/production-only function timings. The final20lifetime cycles run with industrial participants paused. Timings are observed samples, not deadlines or browser/frame-rate claims.',environment:{host:os.hostname(),platform:os.platform(),release:os.release(),architecture:os.arch(),cpu:os.cpus()[0].model,logicalCpus:os.cpus().length,ramBytes:os.totalmem(),node:process.version},kernelSha256:kernel.programHash,sourceSha256:await sha256(source),guestTapeCells:kernel.map.dialect.tape_cells,guestTapeBytes:kernel.map.dialect.tape_cells*2,hostPeakRssKiB:process.resourceUsage().maxRSS,artifactLoadMs,summary,samples};
await writeFile('records/003/metrics.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({environment:result.environment,summary,artifactLoadMs,hostPeakRssKiB:result.hostPeakRssKiB}));
