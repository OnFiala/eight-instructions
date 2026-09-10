import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,command,kernel} from './system-helpers.mjs';

test('native unsigned division matches integer arithmetic across all bit widths and overflow guards',async()=>{
  const cases=[[0,1],[65535,1],[65535,2],[65535,32768],[65535,65535],[32768,32767],[32767,32768]];
  for(let bit=0;bit<16;bit++){
    const d=2**bit;cases.push([65535,d],[Math.max(0,d-1),d],[d,d]);
  }
  let seed=4123;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed>>>16;};
  for(let i=0;i<64;i++)cases.push([rand(),rand()||1]);
  const m=await fresh(),base=2000;
  command(m,cases.map(([n,d],i)=>`${n} ${d} /mod ${base+i*2+1} ! ${base+i*2} !`).join(' '));
  const region=kernel.map.arrays.heap;
  const value=address=>m.tape[region.base+address*region.stride+region.value_lane];
  cases.forEach(([n,d],i)=>{
    assert.equal(value(base+i*2),n%d,`remainder ${n}/${d}`);
    assert.equal(value(base+i*2+1),Math.floor(n/d),`quotient ${n}/${d}`);
  });
  assert.match(command(m,'65535 0 /mod',{allowError:true}),/!E4/);
  assert.equal(command(m,'6 7 * .'),'42 ');
});
