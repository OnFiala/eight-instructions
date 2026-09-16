import {writeFile,readFile,stat} from 'node:fs/promises';
import os from 'node:os';
import {loadKernel,execute} from '../runtime/system.mjs';
const loading=performance.now(),kernel=await loadKernel(),loadMs=performance.now()-loading;
if(kernel.programHash!=='de6c26450f7aa1398fc0f5d08995e653f355badea9f1df08a0b203db35c37d87')throw new Error('Historical Build001 evidence tool: use the matching build-001 checkout. Current artifacts must not overwrite that record.');
const workloads=[['boot',kernel.libraries],['sample','sample network'],['route','0 11 route'],
  ['changeAndRoute','100 1 7 stage-road tx-commit 0 11 route'],
  ['fullStore',': fill-db 0 begin dup 128 < while dup 3 * 1 + over db-put assert 1 + repeat drop ; tx-begin db-clear fill-db tx-commit db-count . db-check']];
const samples=[];let executorLinearMemoryBytes;
for(let repeat=0;repeat<3;repeat++){
  const m=kernel.create(),runs=[];
  for(const [name,source]of workloads){
    const start=performance.now(),steps=m.totalSteps,blocks=m.totalBlocks;
    execute(m,source+'\n',{fuel:2e14,blocks:3e10});
    const elapsedMs=performance.now()-start,output=new TextDecoder().decode(m.drain());
    if(m.state!=='input'||/!E\d+ /.test(output))throw new Error(`Incomplete benchmark ${name}: ${JSON.stringify(m.inspect())} ${output}`);
    runs.push({name,elapsedMs,brainfuckInstructions:Number(m.totalSteps-steps),executorBlocks:Number(m.totalBlocks-blocks),output});
  }
  samples.push(runs);
  executorLinearMemoryBytes=m.inspect().executorMemoryBytes;
}
const summary=Object.fromEntries(workloads.map(([name])=>{
  const runs=samples.map(s=>s.find(r=>r.name===name)),times=runs.map(r=>r.elapsedMs).sort((a,b)=>a-b);
  return [name,{medianMs:times[1],minMs:times[0],maxMs:times[2],brainfuckInstructions:runs[0].brainfuckInstructions,
    deterministicInstructionCount:runs.every(r=>r.brainfuckInstructions===runs[0].brainfuckInstructions)}];
}));
const manifest=JSON.parse(await readFile(new URL('../boundary.json',import.meta.url))),sourceBytesByLayer={};
for(const c of manifest.components){const n=(await stat(new URL('../'+c.path,import.meta.url))).size;sourceBytesByLayer[c.layer]=(sourceBytesByLayer[c.layer]??0)+n;}
const result={schemaVersion:1,measuredAt:new Date().toISOString(),environment:{platform:os.platform(),arch:os.arch(),cpu:os.cpus()[0].model,node:process.version,backend:'generic WebAssembly'},
  methodology:'Three sequential fresh machines in one process; kernel host loading measured separately once. Every boot compiles raw native libraries. Warm OS/filesystem; no startup image. Wall times are local observations, not speed guarantees. Concurrent host activity is uncontrolled.',
  hostKernelLoadMs:loadMs,summary,samples,memory:{guestTapeCells:kernel.map.dialect.tape_cells,guestTapeBytes:kernel.map.dialect.tape_cells*2,executorLinearMemoryBytes,processRSSAfterWorkloads:process.memoryUsage().rss,scope:'Wasm linear memory includes tape and packed generic operations. RSS includes process, JIT and kernel/runtime allocations after three sequential machines; it is not guest memory or a peak measurement.'},
  kernelSha256:kernel.programHash,sourceBytesByLayer,buildDependencies:manifest.buildDependencies,hostRuntimeDependencies:[],
  responsibilityMetric:'Named responsibilities in boundary.json; no percentage-native metric.'};
await writeFile(new URL('../records/001/metrics.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({hostKernelLoadMs:loadMs,summary,memory:result.memory},null,2));
