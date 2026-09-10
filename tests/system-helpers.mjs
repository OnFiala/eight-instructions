import assert from 'node:assert/strict';
import {loadKernel,execute} from '../runtime/system.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';
export const kernel=await loadKernel();
let bootImage;
export async function fresh() {
  if(!bootImage) {
    const m=kernel.create();execute(m,kernel.libraries);
    assert.equal(m.state,'input');assert.equal(new TextDecoder().decode(m.drain()),'Thread / 8 Instructions\n');
    bootImage=await encodeImage(m,kernel.programHash);
  }
  return decodeImage(bootImage,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
}
export function command(m,source,{allowError=false,blocks=1e10,fuel=1e14}={}) {
  execute(m,source+'\n',{blocks,fuel});
  const output=new TextDecoder().decode(m.drain());
  assert.equal(m.state,'input',JSON.stringify(m.inspect()));
  if(!allowError)assert.doesNotMatch(output,/!E\d+ /);
  return output;
}
export const word=(m,name)=>m.tape[kernel.map.registers[name]];
