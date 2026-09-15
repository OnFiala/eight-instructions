import test from 'node:test';
import assert from 'node:assert/strict';
import {session,output,send,reg} from './helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';
import {kernel} from './system-helpers.mjs';

test('native bounded workspace output matches individual reads across pages and tape edges',()=>{
  const m=session('1 62 w! 65535 63 w! 7 64 w! 4096 65 w! 11 24575 w! ');output(m);
  assert.equal(send(m,'62 4 w. '),'1 65535 7 4096 ');
  assert.equal(send(m,'62 w@ . 63 w@ . 64 w@ . 65 w@ . '),'1 65535 7 4096 ');
  assert.equal(send(m,'24575 1 w. 24576 0 w. '),'11 ');
  assert.equal(send(m,'0 256 w. ').trim().split(/\s+/).length,256);
  for(const source of ['0 257 w.','24575 2 w.','24577 0 w.','65535 1 w.']){
    assert.match(send(m,source+' '),/^!E3 /);assert.equal(send(m,'24575 w@ . '),'11 ');
  }
  assert.equal(reg(m,'err'),0);
});
test('an image resumes midway through the native one-hot dispatch and bulk output',async()=>{
  const m=kernel.create();m.feed(new TextEncoder().encode('60000 70 w! 64 32 w. '));
  assert.equal(m.run({fuel:1e14,blocks:21000}),'budget');
  const n=await decodeImage(await encodeImage(m,kernel.programHash),{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  for(const machine of [m,n])assert.equal(machine.run({fuel:1e14,blocks:1e10}),'input');
  assert.deepEqual(m.tape,n.tape);assert.deepEqual(m.output,n.output);assert.equal(m.totalSteps,n.totalSteps);
});
test('BF-owned instruction-page validation cache is discarded on compilation rollback',()=>{
  const m=session(': cache-probe '+('1 drop '.repeat(90))+'; cache-probe ');output(m);
  assert.ok([0,1,2,3].some(i=>reg(m,`fetch_cache_${i}_valid`)===1));
  const before=reg(m,'cp');assert.match(send(m,': rejected '+('1 drop '.repeat(60))+'if ; '),/!E6/);
  assert.equal(reg(m,'cp'),before);
  assert.ok([0,1,2,3].every(i=>reg(m,`fetch_cache_${i}_valid`)===0));
  assert.equal(send(m,'cache-probe 17 . '),'17 ');
});
