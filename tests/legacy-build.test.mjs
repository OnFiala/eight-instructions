import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compile} from '../dist/engine.mjs';
import {WasmMachine} from '../dist/wasm-engine.mjs';
import {sha256,encodeImage,decodeImage} from '../dist/images.mjs';
import {kernel,command} from './system-helpers.mjs';

test('preserved Build001 kernel runs and restores its images; current kernel rejects the old identity',async()=>{
  const base=new URL('../dist/build-001/',import.meta.url);
  const source=gunzipSync(readFileSync(new URL('kernel.bf.gz',base))).toString();
  const map=JSON.parse(readFileSync(new URL('kernel-map.json',base),'utf8'));
  const hash=await sha256(source);assert.equal(hash,'de6c26450f7aa1398fc0f5d08995e653f355badea9f1df08a0b203db35c37d87');
  assert.equal(hash,map.sha256);
  const program=compile(source),module=new WebAssembly.Module(readFileSync(new URL('executor.wasm',base)));
  const create=()=>new WasmMachine(program,module,{cells:map.dialect.tape_cells});
  const m=create();assert.equal(command(m,': old-square dup * ; 9 old-square .'),'Thread / 8 Instructions\n81 ');
  const image=await encodeImage(m,hash);
  await assert.rejects(decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create}),/kernel|program/i);
  const restored=await decodeImage(image,{program,programHash:hash,create});
  assert.equal(command(restored,'7 old-square .'),'49 ');
});

test('preserved Build002 executor and kernel resume their own image; Build003 refuses that identity',async()=>{
  const base=new URL('../dist/build-002/',import.meta.url);
  const oldEngine=await import('../dist/build-002/engine.mjs');
  const oldWasm=await import('../dist/build-002/wasm-engine.mjs');
  const oldImages=await import('../dist/build-002/images.mjs');
  const source=gunzipSync(readFileSync(new URL('kernel.bf.gz',base))).toString();
  const map=JSON.parse(readFileSync(new URL('kernel-map.json',base),'utf8'));
  const hash=await sha256(source);assert.equal(hash,map.sha256);assert.notEqual(hash,kernel.programHash);
  const program=oldEngine.compile(source),wasm=new WebAssembly.Module(readFileSync(new URL('executor.wasm',base)));
  const create=()=>new oldWasm.WasmMachine(program,wasm,{cells:map.dialect.tape_cells});
  const m=create();assert.equal(command(m,': prior-cube dup dup * * ; 5 prior-cube .'),'Thread / 8 Instructions\n125 ');
  const image=await oldImages.encodeImage(m,hash);
  await assert.rejects(decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create}),/kernel|program/i);
  const n=await oldImages.decodeImage(image,{program,programHash:hash,create});
  assert.equal(command(n,'6 prior-cube .'),'216 ');
});
