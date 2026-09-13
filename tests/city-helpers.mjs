import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {kernel,command,create,build} from './workspace-helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';
export {kernel,command,build};
export const original=': delivery-rule.thread + ;';
export const tollFree=': delivery-rule.thread 8 * + ;';
export const boot=['core','city-state','workspace','city'].map(n=>readFileSync(new URL(`../programs/${n}.thread`,import.meta.url),'utf8')).join('\n');
let image;
export async function city() {
  if(!image) {
    const m=kernel.create();assert.equal(command(m,boot),'Thread / 8 Instructions\n');
    create(m,'delivery-rule.thread');assert.match(build(m,0,original),/MODULE-PUBLISHED/);
    command(m,'city-init');image=await encodeImage(m,kernel.programHash);
  }
  return restore(image);
}
export const restore=bytes=>decodeImage(bytes,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
export const rows=(text,name)=>text.split('\n').filter(l=>l.startsWith(name+' ')).map(l=>l.trim().split(/\s+/).slice(1).map(Number));
export const snapshot=m=>encodeImage(m,kernel.programHash);
