import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {kernel,command} from './system-helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';
export {kernel,command};
const source=['core','workspace'].map(x=>readFileSync(new URL(`../programs/${x}.thread`,import.meta.url),'utf8')).join('\n');
let image;
export async function workspace() {
  if(!image) {
    const m=kernel.create();assert.equal(command(m,source),'Thread / 8 Instructions\n');
    image=await encodeImage(m,kernel.programHash);
  }
  return decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
}
export const create=(m,name,inputs=2,outputs=1)=>command(m,`${inputs} ${outputs} ${name.length} module-create ${name}`);
export const save=(m,id,source)=>command(m,`${source.length} ${id} source-write ${source}`);
export const build=(m,id,source)=>save(m,id,source)+command(m,`${id} module-compile`);
export const state=m=>command(m,'workspace-state').trim().split('\n').filter(l=>l.startsWith('VERSION ')).map(l=>l.trim().split(/\s+/).slice(1).map(Number));
