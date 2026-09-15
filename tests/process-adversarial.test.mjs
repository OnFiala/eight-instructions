import test from 'node:test';
import assert from 'node:assert/strict';
import {processes,create,build,command,state} from './process-helpers.mjs';

test('a paused mailbox waiter wakes on resume when mail arrived during its pause',async()=>{
  const m=await processes();create(m,'waiter.thread');
  build(m,0,': waiter.thread wait recv if drop drop 0 state! else drop drop drop then ;');
  command(m,'0 process-create drop process-step 1 process-pause');
  assert.equal(state(m).processes[0][1],4);
  assert.match(command(m,'71 9 1 process-post .'),/1 $/);
  assert.equal(state(m).processes[0][1],4);
  command(m,'1 process-resume process-step process-step');
  assert.equal(state(m).private[0][1],71);
  assert.equal(state(m).processes[0][14],0);
});

test('declared incompatible schema refuses publication with live continuation and queued message',async()=>{
  const m=await processes();command(m,'workspace-large');create(m,'schema.thread');
  const original=': schema.thread schema# 7 41 3 sleep 0 state! ;';
  assert.match(build(m,0,original),/MODULE-PUBLISHED/);
  command(m,'0 process-create drop process-step 23 8 1 process-post drop');
  const before=state(m),memory=command(m,'workspace-state');
  for(let i=0;i<12;i++)assert.match(build(m,0,': schema.thread schema# 8 99 0 state! ;'),/WS-ERROR 39/);
  assert.deepEqual(state(m),before);
  const after=command(m,'workspace-state');
  assert.equal(after.match(/MEMORY .*\n/)[0].split(' ').slice(0,7).join(' '),memory.match(/MEMORY .*\n/)[0].split(' ').slice(0,7).join(' '));
  assert.match(command(m,'0 3 mf w@ serial-of version-source'),/schema# 7/);
  command(m,'process-step '.repeat(3));assert.equal(state(m).private[0][1],41);
  assert.match(build(m,0,': schema.thread schema# 7 83 0 state! ;'),/MODULE-PUBLISHED/);
  command(m,'process-step');assert.equal(state(m).private[0][1],83);
  assert.match(command(m,'0 module-delete'),/WS-ERROR 10/);
  command(m,'0 module-rollback process-step');assert.equal(state(m).processes[0][1],3);
});

test('configured quantum is bounded; sleeping, looping and failing programs stay independent',async()=>{
  const m=await processes();create(m,'loop.thread');create(m,'clock.thread');create(m,'bad.thread');
  build(m,0,': loop.thread begin 0 until ;');
  build(m,1,': clock.thread 2 sleep 0 state@ 1 + 0 state! ;');
  build(m,2,': bad.thread 17 fail ;');
  assert.match(command(m,'0 process-slice! 33 process-slice!'),/WS-ERROR 34/);
  command(m,'32 process-slice! 0 process-create drop 1 process-create drop 2 process-create drop process-step');
  let s=state(m);assert.equal(s.processes[0][12],32);assert.equal(s.processes[1][1],3);assert.equal(s.processes[2][10],17);
  command(m,'process-step process-step');s=state(m);
  assert.equal(s.processes[0][12],96);assert.equal(s.private[1][1],1);
  assert.equal(command(m,'5 1 3 process-post .'),'2 ');
  command(m,'65535 pmsgseq !');assert.equal(command(m,'5 1 2 process-post .'),'3 ');
  command(m,'65535 ptick !');const frozen=state(m);
  assert.match(command(m,'process-step'),/WS-ERROR 36/);assert.deepEqual(state(m),frozen);
});

test('nested exact-version stack exhaustion stays local and preserves queued mail',async()=>{
  const m=await processes();command(m,'workspace-large');create(m,'stack-a.thread');create(m,'stack-b.thread');create(m,'ok.thread');
  // Immutable dependencies form a DAG. New A/B versions bind the previous
  // opposite version; each keeps eight values while calling the next frame.
  assert.match(build(m,0,': stack-a.thread ;'),/MODULE-PUBLISHED/);
  for(let i=0;i<9;i++) {
    const id=i%2?0:1,name=id?'stack-b.thread':'stack-a.thread',callee=id?'stack-a.thread':'stack-b.thread';
    assert.match(build(m,id,`: ${name} 1 2 3 4 5 6 7 8 ${callee} drop drop drop drop drop drop drop drop ;`),/MODULE-PUBLISHED/);
  }
  build(m,2,': ok.thread 0 state@ 1 + 0 state! ;');
  command(m,'1 process-create drop 2 process-create drop 99 6 1 process-post drop');
  command(m,'process-step '.repeat(12));const s=state(m);
  assert.equal(s.processes[0][1],5);assert.equal(s.processes[0][10],7);
  assert.equal(s.processes[0][14],1);assert.ok(s.private[1][1]>0);
  command(m,'1 process-stop');assert.equal(command(m,'99 6 1 process-post .'),'2 ');
});
