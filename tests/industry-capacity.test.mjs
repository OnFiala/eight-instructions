import test from 'node:test';
import assert from 'node:assert/strict';
import {industry,run,account} from './industry-helpers.mjs';
import {readIndustry} from '../dist/industry-presentation.mjs';

test('native road capacity queues a second van; closure preserves an existing reservation',async()=>{
  const m=await industry();
  run(m,'1 process-pause 2 process-pause 3 process-pause 4 process-pause 5 process-pause 6 process-pause');
  // Explicit native unit fixture: two empty vans at their actual initial node12
  // have the same next edge33 (12 -> 8). Routing itself is tested separately.
  run(m,': edge-fixture pr ! 1 227 pcurr w! 8 pr @ 7 ef w! 4 149 pcurr w! 33 157 pcurr w! road-enter ; 6 edge-fixture 7 edge-fixture');
  let w=readIndustry(run(m,'industry-state')).world;
  assert.equal(w.vehicles.find(v=>v.id===7).edge,33);
  assert.equal(w.vehicles.find(v=>v.id===8).edge,null);
  assert.equal(w.vehicles.find(v=>v.id===8).status,3);
  assert.equal(w.roads.find(r=>r.id===32).occupancy,1);
  run(m,'0 33 industry-open');
  w=readIndustry(run(m,'industry-state')).world;
  assert.equal(w.vehicles.find(v=>v.id===7).edge,33);
  assert.equal(w.vehicles.find(v=>v.id===7).duration,2);
  run(m,'process-step process-step');
  w=readIndustry(run(m,'industry-state')).world;
  assert.equal(w.vehicles.find(v=>v.id===7).node,8);
  assert.equal(w.vehicles.find(v=>v.id===7).edge,null);
  assert.equal(w.roads.find(r=>r.id===32).occupancy,0);
  assert.equal(w.roads.find(r=>r.id===32).open,false);
  account(m);
});

test('all sixteen job slots refuse overflow, reclaim450lifetimes and reject a stale job identity',async()=>{
  const m=await industry();
  assert.equal(run(m,'job-new . '.repeat(17)),Array(16).fill('1 ').join('')+'0 ');
  assert.equal(run(m,'world-created @ . world-reclaimed @ .'),'16 0 ');
  run(m,': clear-jobs 0 begin dup 16 < while dup jx ! job-free 1+ repeat drop ; clear-jobs');
  run(m,': recycle-jobs 0 begin dup 50 < while job-new assert job-free 1+ repeat drop ;');
  for(let i=0;i<9;i++)run(m,'recycle-jobs');
  assert.equal(run(m,'world-created @ . world-reclaimed @ .'),'466 466 ');
  assert.equal(run(m,'1 job-find .'),'0 ');
  assert.equal(run(m,'job-new . jx @ 1 jf w@ .'),'1 467 ');
  run(m,'job-free 65535 world-serial !');
  assert.equal(run(m,'job-new . world-created @ . world-reclaimed @ .'),'0 467 467 ');
  account(m);
  console.log(JSON.stringify({jobCapacity:16,reclaimedLifetimes:467,staleIdentityRefused:1,liveJobs:0}));
});

test('publishing, refusing schema change and rolling back preserve a paused carried load and route version',async()=>{
  const m=await industry();let w,van;
  for(let i=0;i<30;i++){
    run(m,'process-step');w=readIndustry(run(m,'industry-state')).world;
    van=w.vehicles.find(v=>v.cargo&&v.edge!==null);if(van)break;
  }
  assert.ok(van,'a real job must load and start driving');
  run(m,`${van.id} process-pause`);
  const before=readIndustry(run(m,'industry-state')).world;
  const source=readIndustry(run(m,'3 source-read')).sources.get(3);
  const bad=source.replace('schema# 1','schema# 2');
  assert.match(run(m,`${bad.length} 3 source-write ${bad} 3 module-compile`),/WS-ERROR 39/);
  const next=source.replace('1 drive','2 drive');
  assert.match(run(m,`${next.length} 3 source-write ${next} 3 module-compile`),/MODULE-PUBLISHED/);
  const after=readIndustry(run(m,'industry-state')).world;
  assert.deepEqual(after,before);
  const versions=run(m,'workspace-state');
  assert.match(versions,new RegExp(`VERSION \\d+ 2 3 ${van.routeVersion} [1-9]`));
  run(m,'3 module-rollback');
  assert.deepEqual(readIndustry(run(m,'industry-state')).world,before);
  run(m,`${van.id} process-resume process-step process-step process-step`);
  account(m);
});
