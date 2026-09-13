#!/usr/bin/env node
// Generic offline replay: restore an opaque BF image, feed raw bytes, compare raw
// output. This verifier is never imported by the production renderer or worker.
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,sep} from 'node:path';
import {loadKernel,execute} from '../runtime/system.mjs';
import {decodeImage,sha256} from '../dist/images.mjs';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
export async function replay(bundle,{verifyArtifacts=true}={}) {
  if(bundle.schema!=='8i-replay-1'||!Array.isArray(bundle.runs)||!bundle.runs.length||bundle.runs.length>8)throw new Error('Unsupported replay bundle');
  const kernel=await loadKernel();if(bundle.kernelSha256!==kernel.programHash)throw new Error('Replay kernel does not match this checkout');
  if(verifyArtifacts) {
    if(!bundle.artifactSha256||Object.keys(bundle.artifactSha256).length>100)throw new Error('Invalid artifact manifest');
    for(const [path,expected] of Object.entries(bundle.artifactSha256)) {
      if(!/^[a-zA-Z0-9_./-]+$/.test(path)||!/^[a-f0-9]{64}$/.test(expected))throw new Error('Invalid artifact identity');
      const full=resolve(root,path);if(!full.startsWith(root+sep)&&!full.startsWith(root))throw new Error('Artifact escapes public directory');
      // Explicit segment check also works with a trailing slash in the root URL.
      if(path.split('/').includes('..')||path.startsWith('/'))throw new Error('Artifact escapes public directory');
      if(await sha256(await readFile(full))!==expected)throw new Error(`Artifact differs: ${path}`);
    }
  }
  const receipts=[];
  for(const run of bundle.runs) {
    if(!Array.isArray(run.inputs)||!Array.isArray(run.expectedOutputs)||run.inputs.length!==run.expectedOutputs.length||run.inputs.length>2000)throw new Error('Invalid transcript');
    const machine=await decodeImage(bundle.initialImage,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
    if(machine.state!=='input')throw new Error('Replay initial image is not waiting for raw input');
    const start=performance.now(),outputs=[];
    for(let i=0;i<run.inputs.length;i++) {
      if(typeof run.inputs[i]!=='string'||run.inputs[i].length>100000||typeof run.expectedOutputs[i]!=='string')throw new Error('Invalid raw transcript entry');
      execute(machine,run.inputs[i]+'\n',{fuel:2e14,blocks:3e10});
      if(machine.state!=='input')throw new Error(`Run ${run.label}, input ${i}: work limit or incomplete operation`);
      const output=new TextDecoder().decode(machine.drain());
      if(output!==run.expectedOutputs[i])throw new Error(`Run ${run.label}, input ${i}: native output differs`);
      outputs.push(output);
    }
    receipts.push({label:run.label,inputs:run.inputs.length,outputSha256:await sha256(outputs.join('')),elapsedMs:performance.now()-start,state:machine.state,steps:machine.steps});
  }
  return {status:'PASS',kernelSha256:kernel.programHash,runs:receipts};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const path=process.argv[2];if(!path)throw new Error('Usage: node tools/replay.mjs REPRODUCTION.json');
    if((await stat(path)).size>32e6)throw new Error('Replay bundle exceeds 32 MB');
    console.log(JSON.stringify(await replay(JSON.parse(await readFile(path,'utf8'))),null,2));
  }catch(error){console.error(error.message);process.exitCode=1;}
}
