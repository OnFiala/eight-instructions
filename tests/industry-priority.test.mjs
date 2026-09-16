import test from 'node:test';
import assert from 'node:assert/strict';
import {industry,run,account} from './industry-helpers.mjs';
import {readIndustry} from '../dist/industry-presentation.mjs';

async function arbitrationFixture(loop){
  const m=await industry();
  run(m,'1 process-pause 2 process-pause 3 process-pause 4 process-pause 5 process-pause 6 process-pause 8 industry-retire');
  run(m,'15 process-module priority.thread');
  const source=loop?': priority.thread schema# 1 8 priority begin 0 until ;':': priority.thread schema# 1 8 priority recv if swap 2 = if claim else drop drop then else drop drop drop then 1 drive service ;';
  assert.match(run(m,`${source.length} 6 source-write ${source} 6 module-compile`),/MODULE-PUBLISHED/);
  run(m,'3 12 6 industry-create process-step');
  assert.equal(run(m,'6 18 ef w@ . 7 18 ef w@ .'),'1 8 ');
  // Explicit native arbitration fixture, not a routing/delivery oracle: two
  // existing empty vans want the same actual edge33. Programs make the attempts.
  run(m,': passage-fixture pr ! 1 227 pcurr w! 8 pr @ 7 ef w! 4 149 pcurr w! 33 157 pcurr w! ptick @ 158 pcurr w! ; 6 passage-fixture 7 passage-fixture');
  return m;
}

test('a user van program gets higher native passage priority over an earlier scheduler slot',async()=>{
  const m=await arbitrationFixture(false);run(m,'process-step');
  const w=readIndustry(run(m,'industry-state')).world,low=w.vehicles.find(v=>v.id===7),high=w.vehicles.find(v=>v.id===13);
  assert.equal(low.status,9);assert.equal(low.edge,null);assert.equal(low.waitingFor,13);
  assert.equal(high.edge,33);assert.equal(high.priority,8);
  assert.equal(w.roads.find(r=>r.id===32).occupancy,1);account(m);
});

test('an infinite high-priority program cannot retain a free road through a stale intent',async()=>{
  const m=await arbitrationFixture(true);run(m,'process-step');
  let w=readIndustry(run(m,'industry-state')).world;
  assert.equal(w.vehicles.find(v=>v.id===7).status,9);
  run(m,'process-step');w=readIndustry(run(m,'industry-state')).world;
  assert.equal(w.vehicles.find(v=>v.id===7).edge,33);
  assert.equal(w.processes.find(p=>p.handle===13).status,1);
  assert.ok(w.processes.find(p=>p.handle===13).operations>=96);
  account(m);
});

test('paused priority claim is ineligible; invalid priority faults locally without changing its value',async()=>{
  const m=await arbitrationFixture(true);run(m,'13 process-pause process-step');
  assert.equal(readIndustry(run(m,'industry-state')).world.vehicles.find(v=>v.id===7).edge,33);
  const bad=': priority.thread schema# 1 10 priority ;';
  run(m,`${bad.length} 6 source-write ${bad} 6 module-compile 13 industry-repair process-step`);
  const w=readIndustry(run(m,'industry-state')).world;
  assert.equal(w.processes.find(p=>p.handle===13).fault,34);
  assert.equal(w.vehicles.find(v=>v.id===13).priority,8);account(m);
});
