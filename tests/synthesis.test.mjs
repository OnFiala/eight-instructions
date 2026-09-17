import test from 'node:test';
import assert from 'node:assert/strict';
import {district,run,field,kernel} from './synthesis-helpers.mjs';

test('BF constructs different source structures and its actual compiler publishes each in an isolated world',async()=>{
  const m=await district({raw:22,goal:3,duration:2,batch:2});
  run(m,'1 4 s! 1 3 s! 0 1 context-copy');
  const first=run(m,'5 5 s! generate-source generated-store 1 module-compile 1 source-read');
  assert.match(first,/2 stock 1 < if 2 request make then offer dispatch ;/);
  assert.match(first,/MODULE-PUBLISHED 1/);assert.doesNotMatch(first,/WS-ERROR/);
  const second=run(m,'10 5 s! generate-source generated-store 1 module-compile 1 source-read');
  assert.match(second,/2 request 2 stock 2 < if make then offer dispatch ;/);
  assert.doesNotMatch(second,/WS-ERROR/);
  const restored=run(m,'1 0 context-copy 1 source-read');
  assert.doesNotMatch(restored,/stock/);assert.match(restored,/2 request work dispatch/);
});

test('native baseline/candidate trials interleave with useful live work and retain real-world inventory',async()=>{
  const m=await district({goal:3});
  let output=run(m,'1 1 32 search-start');
  for(let i=0;i<64;i++){
    output+=run(m,'autonomy-step');
    if(!field(m,1))break;
  }
  assert.match(output,/SEARCH-BEGIN/);assert.match(output,/GENERATED/);
  assert.match(output,/TRIAL-RESULT/);assert.match(output,/SEARCH-DECISION/);
  assert.match(output,/SEARCH-DECISION 1 1 5 /);
  assert.equal(field(m,19),1);
  assert.match(run(m,'1 source-read'),/stock 1 < if 1 request make then offer dispatch/);
  assert.doesNotMatch(output,/WS-ERROR|PROCESS-FAULT|!E/);
  assert.match(run(m,'industry-account'),/18 1/);
  assert.ok(Number(run(m,'ptick @ .').trim())>0);
  // All three abandoned contexts must be reclaimed, including version arenas.
  for(const name of ['heap','workspace']){
    const a=kernel.map.arrays[name];
    for(let i=0;i<a.size;i++)for(let bank=1;bank<4;bank++)
      assert.equal(m.tape[a.base+i*a.stride+2+bank*a.bank_stride],0);
  }
  const inventory=run(m,'1 3 ef w@ . 1 4 ef w@ . 1 11 ef w@ . world-used @ .');
  // Explicit local fault injection during the protected observation period.
  // It changes process fault metadata, never inventory or the acceptance score.
  const rollback=run(m,'77 1 9 pf w! 5 1 0 pf w! observation-step');
  assert.match(rollback,/NATIVE-ROLLBACK 1 1 /);
  assert.equal(run(m,'1 3 mf w@ serial-of .').trim(),String(field(m,11)));
  assert.equal(run(m,'1 3 ef w@ . 1 4 ef w@ . 1 11 ef w@ . world-used @ .'),inventory);
  assert.equal(field(m,36),0);assert.equal(field(m,27),0);
  assert.match(run(m,'industry-account'),/18 1/);
  output+=rollback;
  console.log(output);
});

test('goal selection derives useful work and respects manual ownership and completed goals',async()=>{
  const m=await district({raw:16,goal:5,duration:3,batch:2});
  assert.match(run(m,'goal-select'),/GOAL 1 1 3 5 0/);
  assert.match(run(m,'0 1 autonomy-module goal-select'),/GOAL 3 /);
  run(m,'1 1 autonomy-module 1 autonomy-enabled');
  assert.match(run(m,'autonomy-step'),/SEARCH-BEGIN/);
  assert.equal(field(m,4),1);assert.equal(field(m,29),3);
  assert.equal(field(m,6),1);assert.equal(field(m,7),32);
  // An explicitly empty-goal fixture needs no solver or canned winning program.
  const finished=await district({raw:10,goal:0});
  assert.match(run(finished,'goal-select'),/GOAL 2 /);
});
