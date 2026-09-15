import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {kernel,command} from './system-helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';
import {loadLibraries} from '../runtime/system.mjs';
export {kernel,command};
export {build,save} from './workspace-helpers.mjs';
let image;
export async function processes() {
  if(!image) {
    const m=kernel.create();
    const source=await loadLibraries('processes.json');
    assert.equal(command(m,source),'Thread / 8 Instructions\n');
    image=await encodeImage(m,kernel.programHash);
  }
  return decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
}
export const create=(m,name)=>command(m,`${name.length} process-module ${name}`);
export function state(m) {
  const lines=command(m,'process-state').trim().split('\n').map(l=>l.trim().split(/\s+/));
  return {summary:lines.find(l=>l[0]==='PROCESSES').slice(1).map(Number),
    processes:lines.filter(l=>l[0]==='PROCESS').map(l=>l.slice(1).map(Number)),
    private:lines.filter(l=>l[0]==='PRIVATE').map(l=>l.slice(1).map(Number))};
}
