import test from 'node:test';
import assert from 'node:assert/strict';
import {processes,create,build,command,state,kernel} from './process-helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';

test('BF scheduler preempts an infinite process and preserves each continuation',async()=>{
  const m=await processes();
  create(m,'spin.thread');create(m,'count.thread');
  assert.match(build(m,0,': spin.thread begin 0 until ;'),/MODULE-PUBLISHED/);
  assert.match(build(m,1,': count.thread 0 state@ 1 + 0 state! ;'),/MODULE-PUBLISHED/);
  command(m,'0 process-create drop 1 process-create drop');
  command(m,'process-step '.repeat(6));
  const s=state(m);
  assert.equal(s.summary[0],6);
  assert.equal(s.processes[0][1],1);
  assert.equal(s.processes[0][12],48);
  assert.ok(s.private[1][1]>0);
  command(m,'1 process-pause');const pc=state(m).processes[0].slice(4,9);
  command(m,'process-step '.repeat(2));assert.deepEqual(state(m).processes[0].slice(4,9),pc);
  command(m,'1 process-resume process-step');assert.equal(state(m).processes[0][1],1);
});

test('native FIFO wait, full mailbox refusal, stale handle and slot reclamation',async()=>{
  const m=await processes();create(m,'sink.thread');
  build(m,0,': sink.thread wait recv if drop drop 0 state! else drop drop drop then ;');
  command(m,'0 process-create drop process-step');
  assert.equal(state(m).processes[0][1],2);
  assert.match(command(m,'11 7 1 process-post .'),/SEND 1 0 1 7 11.*\n1 /);
  command(m,'22 8 1 process-post drop 33 9 1 process-post drop 44 10 1 process-post drop');
  assert.equal(command(m,'55 11 1 process-post .'),'0 ');
  command(m,'process-step '.repeat(4));assert.ok(state(m).summary[5]>0);
  command(m,'1 process-stop 0 process-create drop');
  assert.equal(state(m).processes[0][2],2);
  assert.equal(command(m,'77 1 1 process-post .'),'2 ');
  assert.equal(state(m).summary[2],2);assert.equal(state(m).summary[3],1);
});

test('private bounds fault stays local; actor words are rejected in pure modules',async()=>{
  const m=await processes();create(m,'bad.thread');create(m,'ok.thread');
  build(m,0,': bad.thread 16 state@ drop ;');build(m,1,': ok.thread 1 0 state! ;');
  command(m,'0 process-create drop 1 process-create drop process-step');
  assert.equal(state(m).processes[0][1],5);assert.equal(state(m).private[1][1],1);
  command(m,'0 0 11 module-create pure.thread');
  assert.match(build(m,2,': pure.thread 0 state@ drop ;'),/WS-ERROR 6/);
  for(const word of ['p@','w!','process-step','!','module-delete'])
    assert.match(build(m,0,`: bad.thread ${word} ;`),/WS-ERROR 6/);
});

test('suspended old frame retains its version, next invocation adopts publication, images retain both',async()=>{
  const m=await processes();create(m,'work.thread');
  build(m,0,': work.thread 7 1 sleep 0 state! ;');command(m,'0 process-create drop process-step');
  assert.equal(state(m).processes[0][1],3);
  build(m,0,': work.thread 9 0 state! ;');
  const image=await encodeImage(m,kernel.programHash);
  const n=await decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  assert.deepEqual(state(n),state(m));
  command(n,'process-step');assert.equal(state(n).private[0][1],7);
  command(n,'process-step');assert.equal(state(n).private[0][1],9);
  command(n,'0 module-rollback process-step');assert.equal(state(n).processes[0][1],3);
});

test('three user programs exchange messages, wait, and compute without kernel regeneration',async()=>{
  const m=await processes();
  create(m,'sink.thread');create(m,'source.thread');create(m,'audit.thread');
  build(m,0,': sink.thread wait recv if drop drop 7 * 0 state! else drop drop drop then ;');
  build(m,1,': source.thread 13 6 1 send drop 2 sleep ;');
  build(m,2,': audit.thread 0 state@ 3 + 0 state! ;');
  command(m,'0 process-create drop 1 process-create drop 2 process-create drop');
  const output=command(m,'process-step '.repeat(8));
  assert.match(output,/SEND .*2 1 6 13/);assert.match(output,/RECEIVE/);
  const s=state(m);assert.equal(s.private[0][1],91);assert.ok(s.private[2][1]>0);
  assert.equal(s.processes.every(p=>p[1]!==5),true);
});

test('450 create/stop cycles reuse fixed slots and leave no version refs or resident allocation',async()=>{
  const m=await processes();create(m,'cycle.thread');build(m,0,': cycle.thread yield ;');
  command(m,': churn 0 begin dup 50 < while 0 process-create process-stop 1+ repeat drop ;');
  const before=[m.tape[kernel.map.registers.cp],m.tape[kernel.map.registers.dp]];
  // Nine input batches keep each host fuel budget bounded. The same machine,
  // capacity, allocation counters and code remain live across all450cycles.
  for(let batch=0;batch<9;batch++)command(m,'churn',{fuel:5e14,blocks:5e10});
  const s=state(m);assert.deepEqual(s.summary.slice(1,4),[450,450,450]);assert.equal(s.processes.length,0);
  assert.deepEqual([m.tape[kernel.map.registers.cp],m.tape[kernel.map.registers.dp]],before);
  assert.match(command(m,'workspace-state'),/VERSION 1 2 0 1 1 0 /);
  command(m,'0 module-delete');assert.doesNotMatch(command(m,'workspace-state'),/VERSION \d+ 2 /);
  console.log(JSON.stringify({processCycles:450,capacity:16,liveProcesses:0,liveVersionsAfterDelete:0,residentCodeAndDictionary:before}));
});

test('creation binds versions immediately; full slots, serial exhaustion, and explicit loop repair',async()=>{
  const m=await processes();create(m,'spin.thread');build(m,0,': spin.thread begin 0 until ;');
  command(m,'0 process-create drop');assert.match(command(m,'0 module-delete'),/WS-ERROR 10/);
  command(m,'0 process-create drop '.repeat(15));
  assert.match(command(m,'0 process-create .'),/WS-ERROR 32.*\n0 /);
  command(m,'process-step 1 process-pause');
  build(m,0,': spin.thread 29 0 state! ;');
  command(m,'1 process-repair process-step');assert.equal(state(m).private[0][1],29);
  command(m,'2 process-stop 65535 pserial !');
  assert.match(command(m,'0 process-create .'),/WS-ERROR 36.*\n0 /);
});

test('large native workspace and source parameter edit preserve custom drafts and rejected versions',async()=>{
  const m=await processes();command(m,'workspace-large');
  create(m,'factory.thread');
  const source=': factory.thread batch# 3 0 state! ;';
  assert.match(build(m,0,source),/MODULE-PUBLISHED/);
  assert.equal(command(m,'0 module-parameter'),'PARAMETER 0 1 3 1 6 1 \n');
  assert.match(command(m,'6 0 parameter!'),/SOURCE-STORED.*\nMODULE-PUBLISHED/);
  assert.match(command(m,'0 source-read'),/: factory.thread batch# 6 0 state! ;/);
  command(m,'0 process-create drop process-step');assert.equal(state(m).private[0][1],6);
  assert.match(command(m,'7 0 parameter!'),/WS-ERROR 34/);
  build(m,0,': factory.thread 11 0 state! ;');
  assert.match(command(m,'3 0 parameter!'),/WS-ERROR 38/);
  assert.match(command(m,'0 source-read'),/11 0 state!/);
  assert.match(command(m,'workspace-large'),/WS-ERROR 14/);
  create(m,'custom.thread');assert.match(build(m,1,': custom.thread '+' '.repeat(300)+'yield ;'),/MODULE-PUBLISHED/);
});
