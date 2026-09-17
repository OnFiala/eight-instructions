import test from 'node:test';
import assert from 'node:assert/strict';
import {district,run,kernel} from './synthesis-helpers.mjs';

test('material-built workshop adds a working process and an actually used connection, with branch isolation',async()=>{
  const m=await district({raw:18,goal:3});
  run(m,'4 2 3 process-create industry-add 2 4 20 ef w! 30 0 3 ef w! 48 world-supply ! 64 0 16 ef w! 3 0 2 process-create industry-add');
  assert.match(run(m,'3 4 1 1 2 1 district-plan'),/DISTRICT-PLANNED 3 4 1 2 1/);
  // A completed branch can build a real actor/road without importing that future.
  run(m,'0 1 context-copy 3 3 13 ef w! 3 world-used ! 12 1 3 ef w! district-step');
  assert.match(run(m,'district-state'),/DISTRICT 1 3 4 1 1 2 1 3 7 0/);
  assert.equal(Number(run(m,'world-roads @ .')),4);
  run(m,'1 0 context-copy 1 context-zero');
  assert.equal(Number(run(m,'pserial @ . world-roads @ .').trim().split(/\s+/)[0]),6);
  assert.match(run(m,'industry-account'),/48 48 0 0 48 1/);
  // Run actual supply, production, delivery and construction from that live state.
  let events='';
  for(let i=0;i<180;i++)events+=run(m,'process-step');
  assert.match(events,/DISTRICT-BUILT 3 7 1 1 2 2 3 /);
  assert.match(events,/PRODUCE 7 /,'new workshop executes its real production program');
  assert.match(events,/I-DEPART \d+ [23] /,'a real journey uses the constructed connection');
  assert.equal(Number(run(m,'4 13 ef w@ .')),2);
  assert.match(run(m,'industry-account'),/48 1/);
  assert.equal(Number(run(m,'pserial @ .')),7,'activation is exactly once');
  const tapeBefore=m.tape.slice();run(m,'district-step');
  assert.equal(Number(run(m,'pserial @ .')),7);
  assert.equal(kernel.programHash.length,64);
});

test('construction rejects bad placement and refuses capacity exhaustion without partial actor or road allocation',async()=>{
  const m=await district({raw:18,goal:3});
  run(m,'4 2 3 process-create industry-add 2 4 20 ef w!');
  assert.match(run(m,'3 4 1 0 2 1 district-plan'),/DISTRICT-BLOCKED 2/);
  assert.equal(Number(run(m,'0 d@ .')),0);
  run(m,'3 4 1 1 2 1 district-plan 3 3 13 ef w! 3 world-used ! 12 1 3 ef w!');
  run(m,'46 world-roads ! 65535 pserial !');
  assert.match(run(m,'district-step'),/DISTRICT-BLOCKED 3/);
  assert.equal(Number(run(m,'world-roads @ .')),46);
  assert.equal(Number(run(m,'8 d@ .')),0);
  assert.match(run(m,'industry-account'),/18 1/);
});
