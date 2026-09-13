import test from 'node:test';
import assert from 'node:assert/strict';
import {workspace,create,save,build,command,state,kernel} from './workspace-helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';

test('source is stored, compiled and executed in BF; arbitrary expressions and typed control',async()=>{
  const m=await workspace();create(m,'rule.thread');
  const examples=[
    [': rule.thread + ;',4,5,9],
    [': rule.thread 11 * + ;',7,3,40],
    [': rule.thread dup 0 > if 17 * then + ;',9,5,94],
    [': rule.thread dup 3 < if drop drop 42 else + then ;',9,5,14],
    [': rule.thread begin dup 0 > while 1 - repeat + ;',9,5,9],
    [': rule.thread begin 1 - dup 0= until + ;',9,5,9],
    [': rule.thread / ;',53,7,7],
    [': rule.thread mod ;',53,7,4],
  ];
  for(const [source,a,b,want] of examples) {
    assert.match(build(m,0,source),/MODULE-PUBLISHED/);
    assert.equal(command(m,`${a} ${b} 0 module-run . .`),`1 ${want} `);
    assert.equal(command(m,'0 source-read'),`SOURCE 0 ${source.length} \n${source}\n`);
  }
});

test('invalid syntax, effects, source size and code exhaustion leave previous version and no arena leak',async()=>{
  const m=await workspace();create(m,'rule.thread');build(m,0,': rule.thread + ;');
  const before=state(m).filter(v=>v[1]===2);
  for(const source of [': rule.thread not-a-word ;',': rule.thread +',': rule.thread drop drop ;',
    ': rule.thread if + then ;',': rule.thread if 2 else 3 4 then ;',
    ': rule.thread 4 ; 7 .',': rule.thread '+'0 '.repeat(64)+';',
    ': rule.thread '+'0 + '.repeat(56)+'+ ;']) {
    for(let i=0;i<3;i++)assert.match(build(m,0,source),/WS-ERROR/);
    assert.equal(command(m,'7 8 0 module-run . .'),'1 15 ');
    assert.deepEqual(state(m).filter(v=>v[1]===2),before);
  }
  assert.match(save(m,0,'x'.repeat(257)),/WS-ERROR 4/);
  assert.equal(command(m,'2 3 0 module-run . .'),'1 5 ');
});

test('exact dependency binding, pins, rollback, deletion refusal and stale handles',async()=>{
  const m=await workspace();create(m,'base.thread');create(m,'caller.thread');
  build(m,0,': base.thread + ;');
  assert.equal(command(m,'0 module-pin .'),'1 ');
  build(m,1,': caller.thread base.thread 2 * ;');
  build(m,0,': base.thread * ;');
  assert.equal(command(m,'3 4 0 module-run . .'),'1 12 ');
  assert.equal(command(m,'3 4 1 module-run . .'),'1 14 ');
  assert.equal(command(m,'3 4 1 version-run . .'),'1 7 ');
  assert.match(command(m,'0 module-delete'),/WS-ERROR 10/);
  assert.match(command(m,'0 module-rollback'),/ROLLBACK 0 1/);
  assert.equal(command(m,'3 4 0 module-run . .'),'1 7 ');
  assert.match(command(m,'1 module-delete'),/MODULE-DELETED 1/);
  assert.equal(command(m,'1 version-release .'),'1 ');
  assert.match(command(m,'0 module-delete'),/MODULE-DELETED 0/);
  assert.equal(state(m).filter(v=>v[1]!==0).length,0);
  assert.match(command(m,'1 version-release .'),/WS-ERROR 11/);
});

test('all six fixed arenas can be pinned, refuse overflow, then reclaim and reuse',async()=>{
  const m=await workspace();create(m,'rule.thread');
  for(let n=1;n<=6;n++) {
    assert.match(build(m,0,`: rule.thread + ${n} + ;`),/MODULE-PUBLISHED/);
    assert.equal(command(m,'0 module-pin .'),`${n} `);
  }
  assert.equal(state(m).filter(v=>v[1]===2).length,6);
  assert.match(build(m,0,': rule.thread * ;'),/WS-ERROR 2/);
  assert.equal(command(m,'2 3 0 module-run . .'),'1 11 ');
  assert.equal(command(m,'1 version-release .'),'1 ');
  assert.match(command(m,'0 module-compile'),/MODULE-PUBLISHED 0 7/);
  assert.equal(command(m,'2 3 0 module-run . .'),'1 6 ');
  assert.match(command(m,'1 version-release .'),/WS-ERROR 11/);
});

test('bounded evaluation rejects divide by zero and nontermination; image retains native sources and pins',async()=>{
  const m=await workspace();create(m,'rule.thread');
  build(m,0,': rule.thread + ;');command(m,'0 module-pin drop');
  build(m,0,': rule.thread drop 0 / ;');
  assert.match(command(m,'4 5 0 module-run . .'),/WS-ERROR 13.*\n0 0 /);
  command(m,'0 module-rollback');
  const bytes=await encodeImage(m,kernel.programHash);
  const n=await decodeImage(bytes,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  assert.deepEqual(state(n),state(m));
  assert.equal(command(n,'4 5 1 version-run . .'),'1 9 ');
  assert.match(command(n,'1 version-source'),/: rule.thread \+ ;/);
  assert.match(build(n,0,': rule.thread begin dup 0= until + ;'),/MODULE-PUBLISHED/);
  assert.match(command(n,'4 5 0 module-run . .'),/WS-ERROR 12/);
  command(n,'0 module-rollback');assert.equal(command(n,'4 5 0 module-run . .'),'1 9 ');
});
