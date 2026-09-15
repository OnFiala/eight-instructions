import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {kernel,command} from './system-helpers.mjs';
import {loadLibraries,execute} from '../runtime/system.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';
export {kernel};
let image;
export async function industry() {
  if(!image) {
    const m=kernel.create(),start=performance.now();
    execute(m,(await loadLibraries('industry-system.json'))+'\n',{fuel:5e14,blocks:5e10});
    assert.equal(m.state,'input');
    const output=new TextDecoder().decode(m.drain());assert.doesNotMatch(output,/!E\d|WS-ERROR/);
    assert.match(output,/INDUSTRY-READY 12 4 16 46/);
    image=await encodeImage(m,kernel.programHash);
    console.log(JSON.stringify({coldBootMs:performance.now()-start,bfInstructions:m.steps,kernel:kernel.programHash}));
  }
  return decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
}
export const run=(m,s)=>command(m,s,{fuel:5e14,blocks:5e10});
export function account(m) {
  const a=run(m,'industry-account').trim().split(/\s+/).slice(1).map(Number);
  assert.deepEqual(a.slice(-2),[96,1]);return a;
}
