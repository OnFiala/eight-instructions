#!/usr/bin/env node
// Measurement harness only; every measured computation executes the actual BF.
import os from 'node:os';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {loadKernel,loadLibraries,execute} from '../runtime/system.mjs';
import {sha256} from '../dist/images.mjs';
const artifactStarted=performance.now(),kernel=await loadKernel(),artifactLoadMs=performance.now()-artifactStarted;
const libraries=await loadLibraries('city-system.json'),samples=[];
for(let run=0;run<3;run++) {
  const m=kernel.create(),measurements=[];
  function measure(label,source) {
    const start=performance.now(),steps=m.steps,blocks=m.blocks;
    execute(m,source+'\n',{fuel:2e14,blocks:3e10});
    const elapsedMs=performance.now()-start,output=new TextDecoder().decode(m.drain());
    if(m.state!=='input'||/!E\d+|WS-ERROR/.test(output))throw new Error(`Measurement failed: ${label}: ${output}`);
    measurements.push({label,elapsedMs,bfInstructions:m.steps-steps,executorBlocks:m.blocks-blocks,output,hostRssBytes:process.memoryUsage().rss,guestTapeBytes:m.tape.byteLength});
  }
  measure('nativeBoot',libraries);
  const source=': delivery-rule.thread 8 * + ;';
  measure('storeSource',`${source.length} 0 source-write ${source}`);
  measure('compileAndPublish','0 module-compile');
  measure('coldLogicalStepThreeRoutes','city-step');
  measure('inFlightLogicalStep','city-step');
  measure('arrivalLogicalStep','city-step');
  measure('warmSingleRoute','0 city-plan assert');
  const cycles=[];for(let n=0;n<20;n++){const code=`: delivery-rule.thread ${`${n%2+1} + `.repeat(6)}+ ;`;cycles.push(`${code.length} 0 source-write ${code}\n0 module-compile`);}
  measure('twentyReclaimCycles',cycles.join('\n'));
  measure('nativeEndState','city-state workspace-state');
  samples.push({run:run+1,measurements});
}
const files=['dist/kernel.bf.gz','dist/executor.wasm','dist/engine.mjs','dist/wasm-engine.mjs','programs/core.thread','programs/city-state.thread','programs/workspace.thread','programs/city.thread','programs/city-boot.thread'];
const hashes=Object.fromEntries(await Promise.all(files.map(async file=>[file,await sha256(await readFile(new URL('../'+file,import.meta.url)))])));
const summary={};for(const label of samples[0].measurements.map(m=>m.label)){const values=samples.map(s=>s.measurements.find(m=>m.label===label).elapsedMs).sort((a,b)=>a-b);summary[label]={samples:3,minMs:values[0],medianMs:values[1],maxMs:values[2]};}
const data={measuredAt:new Date().toISOString(),method:'Three sequential fresh native boots in one Node process. Each named sample uses the generic Wasm BF executor, 2e14 BF-instruction / 3e10 block limit, raw source input and drained native output. Native boot includes Thread compilation; artifact load is separate and performed once. No other project test or browser command intentionally runs during these samples. This is an observed local process benchmark, not a browser/frame-rate or server claim.',environment:{host:os.hostname(),platform:os.platform(),release:os.release(),architecture:os.arch(),cpu:os.cpus()[0].model,logicalCpus:os.cpus().length,ramBytes:os.totalmem(),node:process.version},kernelSha256:kernel.programHash,guestTapeCells:kernel.map.dialect.tape_cells,guestTapeBytes:kernel.map.dialect.tape_cells*2,hostPeakRssKiB:process.resourceUsage().maxRSS,artifactLoadMs,artifactSha256:hashes,summary,samples};
await writeFile(new URL('../records/002/metrics.json',import.meta.url),JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({environment:data.environment,artifactLoadMs,summary,hostPeakRssKiB:data.hostPeakRssKiB}));
