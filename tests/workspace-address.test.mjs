import test from 'node:test';
import assert from 'node:assert/strict';
import {session,output,send,reg} from './helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';
import {kernel} from './system-helpers.mjs';

test('native workspace page hints and cache eviction preserve arbitrary values and bounds',()=>{
  // The oracle is test-only; production translates every address inside BF.
  const pages=[0,1,63,127,255,281,294,319,320,351,382,383];
  const values=pages.map((p,i)=>(i*3911+17)&65535);
  const source=pages.map((p,i)=>`${values[i]} ${p} 63 waddr w!`).join(' ');
  const m=session(source+' ',{fuel:1e14,blocks:1e10});
  assert.equal(output(m),'Thread / 8 Instructions\n');
  for(const i of [11,0,6,3,8,1,9,5,2,10,4,7]) {
    assert.equal(send(m,`${pages[i]*64+63} w@ . `,{fuel:1e14,blocks:1e10}),`${values[i]} `);
    assert.equal(send(m,`${pages[i]} 63 waddr . `),`${pages[i]*64+63} `);
  }
  for(const source of ['384 0 waddr','383 64 waddr','65535 0 waddr','0 65535 waddr','24576 w@','8 65535 w!']) {
    assert.match(send(m,source+' ',{fuel:1e14,blocks:1e10}),/!E3/);
    assert.equal(send(m,'383 63 waddr w@ . '),`${values.at(-1)} `);
  }
  assert.equal(reg(m,'err'),0);
});

test('workspace address-cache state survives a whole-machine image',async()=>{
  const m=kernel.create();
  m.feed(new TextEncoder().encode('31 383 7 waddr w! 19 0 1 waddr w! '));
  m.run({fuel:1e14,blocks:1e10});m.drain();assert.equal(m.state,'input');
  const image=await encodeImage(m,kernel.programHash);
  const n=await decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  const source='24519 w@ . 1 w@ . 383 7 waddr w@ . ';
  for(const machine of [m,n]){machine.feed(new TextEncoder().encode(source));machine.run({fuel:1e14,blocks:1e10});}
  assert.equal(new TextDecoder().decode(n.drain()),'31 19 31 ');
  assert.equal(new TextDecoder().decode(m.drain()),'31 19 31 ');
  assert.deepEqual(n.tape,m.tape);
});
