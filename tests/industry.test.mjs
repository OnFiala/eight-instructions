import test from 'node:test';
import assert from 'node:assert/strict';
import {industry,run,account,kernel} from './industry-helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';

test('twelve native processes create real orders and preserve the material ledger',async()=>{
  const m=await industry();account(m);
  let output='';
  for(let i=0;i<18;i++) {output+=run(m,'process-step');account(m);}
  assert.doesNotMatch(output,/PROCESS-FAULT|!E\d|WS-ERROR/);
  assert.match(output,/ORDER/);assert.match(output,/SEND/);assert.match(output,/AUTHORIZE/);assert.match(output,/ASSIGN/);
  assert.match(output,/LOAD|I-ROUTE/);
  console.log(output);
});

test('unfinished messages, native frames and route phases survive a new machine image',async()=>{
  const m=await industry();run(m,'process-step '.repeat(5));
  const image=await encodeImage(m,kernel.programHash);
  const n=await decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  for(let i=0;i<4;i++) assert.equal(run(n,'process-step industry-account'),run(m,'process-step industry-account'));
  assert.equal(run(n,'industry-state'),run(m,'industry-state'));
});

test('ownership rejects removing stock or executing a foreign industrial operation',async()=>{
  const m=await industry();assert.match(run(m,'1 process-stop'),/WS-ERROR 37/);
  assert.match(run(m,'1 industry-retire'),/WS-ERROR 37/);
  account(m);
  const source=': van.thread 1 signal ;';
  run(m,`${source.length} 3 source-write ${source} 3 module-compile`);
  const output=run(m,'process-step '.repeat(6));
  assert.match(output,/PROCESS-FAULT 7 33/);account(m);
  assert.equal(run(m,'10 11 pf w@ .')==='0 ',false);
});
