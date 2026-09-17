import test from 'node:test';
import assert from 'node:assert/strict';
import {district,run,field,kernel} from './synthesis-helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';

async function finish(m){
  let output='';
  for(let i=0;i<80&&field(m,1);i++)output+=run(m,'autonomy-step');
  assert.equal(field(m,1),0,'bounded search must finish');
  return output;
}

test('native input validation preserves a running search, rejects manual ownership and tracks peer/road freshness',async()=>{
  const m=await district({raw:20,goal:4});
  assert.match(run(m,'0 1 autonomy-module 1 1 2 search-start'),/SEARCH-REFUSED 6/);
  run(m,'1 1 autonomy-module 1 1 2 search-start');
  assert.equal(run(m,'search-fresh? .').trim(),'1');
  const before=[field(m,4),field(m,6),field(m,7),field(m,2)];
  assert.match(run(m,'15 16 64 search-start'),/SEARCH-REFUSED 1/);
  assert.deepEqual([field(m,4),field(m,6),field(m,7),field(m,2)],before);
  run(m,'0 0 industry-open');
  assert.equal(run(m,'search-fresh? .').trim(),'0');
  run(m,'1 0 industry-open');
  assert.equal(run(m,'search-fresh? .').trim(),'0','reopening does not erase the changed epoch');
  await finish(m);
  const draft=': factory.thread schema# 1 1 0 /mod drop drop ;';
  run(m,`${draft.length} 1 source-write ${draft}`);
  assert.equal(run(m,'1 10 mf w@ .').trim(),'1');
  assert.match(run(m,'1 1 2 search-start'),/SEARCH-REFUSED 6/);
  assert.match(run(m,'1 source-read'),/1 0 \/mod/);
  assert.match(run(m,'industry-account'),/20 1/);
});

test('unprepared looping trial cannot starve live production and resumes identically from an exported pending search',async()=>{
  const m=await district({raw:24,goal:4});
  const source=': factory.thread schema# 1 begin 13 7 + drop 0 until ;';
  run(m,`${source.length} 1 8 search-custom ${source}`);
  run(m,'autonomy-step autonomy-step');
  assert.equal(field(m,5),17);
  const restored=await decodeImage(await encodeImage(m,kernel.programHash),{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  const left=await finish(m),right=await finish(restored);
  assert.equal(right,left);assert.deepEqual(restored.tape,m.tape);
  assert.match(left,/TRIAL-RESULT 1 17 /);
  assert.match(left,/SEARCH-DECISION 1 2 /);
  assert.equal(field(m,19),0);
  assert.ok(Number(run(m,'world-productions @ .').trim())>0,'live factory advanced during looping trial');
  assert.match(run(m,'industry-account'),/24 1/);
});

test('invalid syntax, forbidden capabilities and runtime division faults are rejected natively with full branch cleanup',async()=>{
  const m=await district({raw:26,goal:4});
  for(const body of ['schema# 1 0 1 context-copy','schema# 2 yield','schema# 1 1 0 /mod drop drop']){
    const source=`: factory.thread ${body} ;`;
    let output=run(m,`${source.length} 1 2 search-custom ${source}`);
    output+=await finish(m);
    assert.match(output,/SEARCH-DECISION \d+ 2 /);
    assert.match(output,/WS-ERROR|PROCESS-FAULT/);
    assert.equal(field(m,19),0);
    for(const name of ['heap','workspace']){
      const a=kernel.map.arrays[name];
      for(let i=0;i<a.size;i++)for(let bank=1;bank<4;bank++)
        assert.equal(m.tape[a.base+i*a.stride+2+bank*a.bank_stride],0);
    }
  }
  assert.match(run(m,'industry-account'),/26 1/);
});

test('a trial message and material operation cannot affect the parked live world',async()=>{
  const m=await district({raw:14,goal:3});
  run(m,'1 1 8 search-start');
  const before=run(m,'0 13 pf w@ . 1 3 ef w@ . world-used @ . pmsgseq @ .');
  const trial=run(m,'trial-enter 88 7 1 process-post . 77 1 3 ef w! 65535 process-post .', {allowError:true});
  // The last deliberately malformed privileged test input is not a candidate
  // escape; its local stack error must still leave the live value context safe.
  assert.match(trial,/WORLD 1/);
  run(m,'trial-leave');
  assert.equal(run(m,'0 13 pf w@ . 1 3 ef w@ . world-used @ . pmsgseq @ .'),before);
  assert.match(run(m,'industry-account'),/14 1/);
});
