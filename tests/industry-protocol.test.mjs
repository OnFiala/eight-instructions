import test from 'node:test';
import assert from 'node:assert/strict';
import {industry,run,account,kernel} from './industry-helpers.mjs';
import {readIndustry} from '../dist/industry-presentation.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';

test('repeated delivery notifications, local receive failure and repair never repeat material transfer',async()=>{
  const m=await industry(),original=readIndustry(run(m,'1 source-read')).sources.get(1);
  run(m,'process-step 3 process-pause');
  let events='',delivery;
  for(let i=0;i<40&&!delivery;i++){
    events+=run(m,'process-step');account(m);delivery=events.match(/UNLOAD \d+ (\d+) 3 6/);
  }
  assert.ok(delivery,'paused factory must receive physical cargo');
  assert.equal(run(m,'2 3 ef w@ .'),'6 ');
  run(m,'3 industry-retry 3 industry-retry');
  const bad=': factory-west.thread schema# 1 recv if drop drop drop 77 fail else drop drop drop then ;';
  assert.match(run(m,`${bad.length} 1 source-write ${bad} 1 module-compile`),/MODULE-PUBLISHED/);
  run(m,'3 industry-repair');
  events=run(m,'process-step process-step');assert.match(events,/PROCESS-FAULT 3 77/);
  assert.equal(run(m,'2 3 ef w@ .'),'6 ');account(m);
  const faulted=readIndustry(run(m,'industry-state')).world;
  assert.equal(faulted.processes.find(p=>p.handle===3).status,5);
  const otherTurns=faulted.processes.find(p=>p.handle===4).quanta;
  const image=await encodeImage(m,kernel.programHash);
  const n=await decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  const inputs=[`${original.length} 1 source-write ${original} 1 module-compile`,'3 industry-repair',...Array(10).fill('process-step industry-account')];
  let repaired='';
  for(const input of inputs){const out=run(m,input);assert.equal(run(n,input),out);repaired+=out;}
  assert.equal([...repaired.matchAll(new RegExp(`ACK ${delivery[1]} 3 `,'g'))].length,1);
  account(m);account(n);
  assert.equal(run(m,'industry-state'),run(n,'industry-state'));
  const after=readIndustry(run(m,'industry-state')).world;
  assert.equal(after.processes.find(p=>p.handle===3).status,1);
  assert.ok(after.processes.find(p=>p.handle===4).quanta>otherTurns);
  assert.equal(after.account[5],1);
});

test('native transport/production and an unfinished BF instruction stream survive an exact image',async()=>{
  const m=await industry();let world;
  for(let i=0;i<40;i++){
    run(m,'process-step');
    world=readIndustry(run(m,'industry-state')).world;
    if(world.entities.some(e=>e.escrow)&&world.vehicles.some(v=>v.cargo&&v.job))break;
  }
  assert.ok(world.entities.some(e=>e.escrow),'production must hold native escrow');
  assert.ok(world.vehicles.some(v=>v.cargo&&v.job),'another native job must own carried material');
  m.feed(new TextEncoder().encode('process-step industry-state\n'));
  assert.equal(m.run({fuel:2e14,blocks:1000000}),'budget');
  const n=await decodeImage(await encodeImage(m,kernel.programHash),{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  for(const machine of [m,n])assert.equal(machine.run({fuel:5e14,blocks:5e10}),'input');
  assert.deepEqual(n.tape,m.tape);assert.deepEqual(n.output,m.output);assert.equal(n.totalSteps,m.totalSteps);
  m.drain();n.drain();assert.equal(run(m,'process-step industry-state'),run(n,'process-step industry-state'));
  account(n);
});
