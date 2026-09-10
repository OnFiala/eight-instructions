import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,command,word,kernel} from './system-helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';
import {execute} from '../runtime/system.mjs';

test('transactional insert, update, missing keys, zero values and deletion',async()=>{
  const m=await fresh();
  assert.equal(command(m,'db-count . 0 db-get . .'),'0 0 0 ');
  command(m,'tx-begin 0 0 db-put assert 65535 65535 db-put assert 17 42 db-put assert tx-commit');
  assert.equal(command(m,'db-count . 0 db-get . . 65535 db-get . . 42 db-get . . db-generation .'),'3 1 0 1 65535 1 17 1 ');
  command(m,'tx-begin 88 42 db-put assert 65535 db-delete assert 7 db-delete 0= assert tx-commit');
  assert.equal(command(m,'db-count . 42 db-get . . 65535 db-get . . db-generation .'),'2 1 88 0 0 2 ');
  assert.equal(word(m,'sp'),0);
});
test('abort restores the committed view; writes require an explicit transaction',async()=>{
  const m=await fresh();command(m,'tx-begin 22 4 db-put assert tx-commit');
  assert.match(command(m,'3 8 db-put',{allowError:true}),/!E8/);
  command(m,'tx-begin 91 4 db-put assert 55 9 db-put assert');
  assert.equal(command(m,'4 db-get . . 9 db-get . .'),'1 91 1 55 ');
  command(m,'tx-abort');
  assert.equal(command(m,'4 db-get . . 9 db-get . . db-generation .'),'1 22 0 0 1 ');
  assert.match(command(m,'tx-abort',{allowError:true}),/!E8/);
  command(m,'tx-begin');assert.match(command(m,'tx-begin',{allowError:true}),/!E8/);command(m,'tx-abort');
});
test('full store refuses record 129, updates existing keys, reuses deleted slots',async()=>{
  const m=await fresh();
  command(m,': fill-db 0 begin dup 128 < while dup 3 * 1 + over db-put assert 1 + repeat drop ; tx-begin fill-db tx-commit');
  assert.equal(command(m,'db-count . db-sum . 127 db-get . .'),'128 24512 1 382 ');
  assert.equal(command(m,'tx-begin 9 128 db-put .'),'0 ');
  command(m,'99 127 db-put assert 3 db-delete assert 7 128 db-put assert tx-commit');
  assert.equal(command(m,'db-count . 127 db-get . . 128 db-get . . 3 db-get . .'),'128 1 99 1 7 0 0 ');
});
test('deterministic mixed operations agree with an independent map oracle',async()=>{
  const m=await fresh(),map=new Map();let seed=121;
  const rand=n=>{seed=(Math.imul(seed,1103515245)+12345)>>>0;return seed%n;};
  const lines=['tx-begin'];
  for(let i=0;i<48;i++){
    const key=rand(31),value=rand(900);
    if(i%5===0){const removed=map.delete(key);lines.push(`${key} db-delete ${removed?'':'0= '}assert`);}
    else {map.set(key,value);lines.push(`${value} ${key} db-put assert`);}
  }
  lines.push('tx-commit');command(m,lines.join('\n'));
  const actual=command(m,'db-list').trim().split('\n').filter(Boolean).map(line=>line.trim().split(/\s+/).map(Number));
  assert.deepEqual(new Map(actual),map);
  assert.equal(command(m,'db-count . db-sum .'),`${map.size} ${[...map.values()].reduce((a,b)=>a+b,0)%65536} `);
});
test('full kernel image retains definitions, committed records and an open transaction',async()=>{
  const m=await fresh();command(m,': durable-word 321 ; tx-begin 22 10 db-put assert tx-commit tx-begin 99 10 db-put assert');
  const n=await decodeImage(await encodeImage(m,kernel.programHash),{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  assert.equal(command(n,'durable-word . tx? . 10 db-get . .'),'321 1 1 99 ');
  assert.equal(command(n,'tx-abort 10 db-get . . db-generation .'),'1 22 1 ');
});
test('collisions survive tombstones without duplicate keys or broken lookup chains',async()=>{
  const m=await fresh();
  command(m,'tx-begin 10 0 db-put assert 20 128 db-put assert 30 256 db-put assert tx-commit');
  command(m,'tx-begin 0 db-delete assert 88 256 db-put assert 40 384 db-put assert tx-commit db-check');
  assert.equal(command(m,'db-count . 128 db-get . . 256 db-get . . 384 db-get . . 0 db-get . .'),'3 1 20 1 88 1 40 0 0 ');
});
test('native format and index integrity checks reject invalid store state',async()=>{
  const m=await fresh();
  command(m,'db-check');assert.match(command(m,'99 770 p! db-check',{allowError:true}),/!E8/);
  command(m,'2 770 p!');assert.match(command(m,'3 0 p! db-check',{allowError:true}),/!E8/);
  command(m,'0 0 p! db-check');
});
test('adversarial full-table collisions finish through bounded image-resumable execution',async t=>{
  let m=await fresh();const started=performance.now(),initial=m.steps;
  execute(m,': collide 0 begin dup 128 < while dup 1 + over 512 * db-put assert 1 + repeat drop ; tx-begin collide tx-commit db-check\n',{fuel:5e12,blocks:1e10});
  assert.equal(m.state,'budget');
  m=await decodeImage(await encodeImage(m,kernel.programHash),{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  let chunks=1;
  while(m.state==='budget'&&chunks<16){
    const before=m.steps;m.run({fuel:1e14,blocks:1e10});assert.ok(m.steps>before);chunks++;
  }
  assert.equal(m.state,'input');assert.doesNotMatch(new TextDecoder().decode(m.drain()),/!E\d+ /);
  assert.equal(command(m,'db-count . 0 db-get . . 65024 db-get . .'),'128 1 1 1 128 ');
  command(m,'tx-begin 0 db-delete assert 777 65024 db-put assert 42 65535 db-put assert tx-commit');
  assert.equal(command(m,'db-count . 65024 db-get . . 65535 db-get . .'),'128 1 777 1 42 ');
  t.diagnostic(JSON.stringify({stress:'128 keys in one initial bucket',elapsedMs:performance.now()-started,brainfuckInstructions:m.steps-initial,boundedRuns:chunks}));
});
