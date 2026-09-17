import test from 'node:test';
import assert from 'node:assert/strict';
import {kernel,command} from './system-helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';

test('native context copy isolates all heap/workspace data and preserves common controller state',()=>{
  const m=kernel.create();
  command(m,'123 0 ! 456 4095 ! 789 0 w! 987 24575 w! 77 0 p!');
  const start=performance.now();
  command(m,'0 1 context-copy 1 3 context-copy');
  command(m,'5 0 ! 6 4095 ! 7 0 w! 8 24575 w! 88 0 p! 0 2 context-copy');
  assert.equal(command(m,'3 0 context-copy 0 @ . 4095 @ . 0 w@ . 24575 w@ . 0 p@ .'),'123 456 789 987 88 ');
  assert.equal(command(m,'2 0 context-copy 0 @ . 4095 @ . 0 w@ . 24575 w@ .'),'5 6 7 8 ');
  assert.equal(command(m,'0 0 context-copy 0 @ .'),'5 ');
  for(const source of ['4 0 context-copy','0 4 context-copy','65535 0 context-copy'])
    assert.match(command(m,source,{allowError:true}),/!E3/);
  assert.equal(command(m,'0 @ . 0 w@ .'),'5 7 ');
  command(m,'1 context-zero 3 context-zero');
  for(const name of ['heap','workspace']){
    const a=kernel.map.arrays[name];
    for(let i=0;i<a.size;i++)for(const bank of [1,3])
      assert.equal(m.tape[a.base+i*a.stride+2+bank*a.bank_stride],0);
  }
  assert.equal(command(m,'0 @ . 0 w@ .'),'5 7 ');
  console.log(JSON.stringify({contextCopiesMs:performance.now()-start,kernel:kernel.programHash}));
});

test('opaque image resumes interruption inside a native context copy exactly',async()=>{
  const m=kernel.create();command(m,'65535 4095 ! 34567 24575 w!');
  m.feed(new TextEncoder().encode('0 1 context-copy 9 24575 w! 1 0 context-copy 24575 w@ .\n'));
  assert.equal(m.run({fuel:2e8,blocks:100000}),'budget');
  const restored=await decodeImage(await encodeImage(m,kernel.programHash),{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  for(const machine of [m,restored])assert.equal(machine.run({fuel:1e14,blocks:1e10}),'input');
  assert.deepEqual(restored.tape,m.tape);assert.equal(restored.pointer,m.pointer);assert.equal(restored.pc,m.pc);
  assert.deepEqual(restored.drain(),m.drain());
  assert.equal(command(restored,'24575 w@ . 4095 @ .'),'34567 65535 ');
});
