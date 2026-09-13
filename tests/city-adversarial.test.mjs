import test from 'node:test';
import assert from 'node:assert/strict';
import {city,command,build,rows,snapshot,restore} from './city-helpers.mjs';
import {workspace,create,save,state} from './workspace-helpers.mjs';
import {readPresentation} from '../dist/presentation.mjs';

test('new conditional module and unprepared directed road costs agree with an independent Bellman-Ford oracle',async()=>{
  const m=await city(),source=': delivery-rule.thread dup 2 > if 7 * else 3 * then swap 2 * + 1 + ;';
  assert.match(build(m,0,source),/MODULE-PUBLISHED/);
  let seed=0x219e;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  const updates=[];for(let n=0;n<7;n++){const edge=random(44),duration=random(6)+1,toll=random(5);updates.push(`${duration} ${toll} ${edge} road-update`);}
  command(m,updates.join('\n'));
  const initial=await snapshot(m),roads=rows(command(m,'city-state'),'ROAD');
  const cost=r=>2*r[3]+r[4]*(r[4]>2?7:3)+1;
  function oracle(from,to){const d=Array(16).fill(Infinity);d[from]=0;for(let n=0;n<15;n++)for(const r of roads)if(r[5])d[r[2]]=Math.min(d[r[2]],d[r[1]]+cost(r));return d[to];}
  for(const [sourceNode,target] of [[12,15],[6,8],[3,13]]) {
    const n=await restore(initial);command(n,`${sourceNode} 0 0 car ! ${target} 0 city-job`);
    const output=command(n,'city-cost-cache assert 0 city-plan assert'),route=rows(output,'ROUTE')[0];
    assert.equal(route[6],oracle(sourceNode,target));assert.equal(route[8],sourceNode);assert.equal(route.at(-1),target);
    let total=0;for(let i=9;i<route.length;i++){const r=roads.find(r=>r[1]===route[i-1]&&r[2]===route[i]&&r[5]);assert.ok(r);total+=cost(r);}assert.equal(total,route[6]);
    const again=await restore(initial);command(again,`${sourceNode} 0 0 car ! ${target} 0 city-job`);assert.equal(command(again,'city-cost-cache assert 0 city-plan assert'),output);
  }
});

test('native deliveries complete, idle is emitted, and a new job resumes from the actual destination',async()=>{
  const m=await city();let output='';
  for(let i=0;i<24;i++)output+=command(m,'city-step');
  const before=readPresentation(command(m,'city-state'));assert.equal(before.city.idle,true);
  assert.deepEqual(before.city.vehicles.map(v=>v.delivered),[1,1,1]);
  assert.equal(rows(output,'DELIVERED').length,3);
  const oldNode=before.city.vehicles[0].node;command(m,'6 0 city-job');
  assert.equal(readPresentation(command(m,'city-state')).city.vehicles[0].node,oldNode);
  const next=rows(command(m,'city-step'),'ROUTE')[0];assert.equal(next[3],oldNode);assert.equal(next[4],6);
});

test('a refused road pair at fixed capacity preserves all road data',async()=>{
  const m=await city();command(m,'3 0 0 5 city-road 3 0 5 10 city-road 3 0 10 15 city-road');
  const before=rows(command(m,'city-state'),'ROAD');assert.equal(before.length,47);
  assert.match(command(m,'4 1 1 6 city-street',{allowError:true}),/!E/);
  assert.deepEqual(rows(command(m,'city-state'),'ROAD'),before);
});

test('safe-point, serial and pin refusals preserve the active version and bounded references',async()=>{
  const m=await workspace();create(m,'limit.thread');build(m,0,': limit.thread + ;');save(m,0,': limit.thread * ;');
  const before=state(m);
  for(const operation of ['0 module-compile','0 module-rollback','0 module-delete'])assert.match(command(m,`1 ws-busy ! ${operation} 0 ws-busy !`),/WS-ERROR 14|WS-ERROR 11/);
  assert.deepEqual(state(m),before);
  assert.match(command(m,'65535 ws-serial ! 0 module-compile'),/WS-ERROR 15/);assert.deepEqual(state(m),before);
  command(m,'60000 1 14 vf w! 60001 1 3 vf w!');
  const pinned=state(m);assert.match(command(m,'0 module-pin .'),/WS-ERROR 15/);assert.deepEqual(state(m),pinned);
  // These synthetic counter boundaries use trusted test-only guest writes. No
  // production shortcut sets counters or bypasses actual lifetime operations.
});

test('presentation retains serial identity after arena reuse; source framing cannot forge active state',async()=>{
  const m=await workspace();create(m,'view.thread');
  for(let n=1;n<=7;n++) {
    build(m,0,`: view.thread + ${n} + ;`);
    const view=readPresentation(command(m,'workspace-state'));
    assert.equal(view.workspace.modules[0].activeSerial,n);
    assert.equal(view.workspace.versions.find(v=>v.serial===n&&v.state===2).uses,Math.ceil(n/3));
  }
  const v=readPresentation(command(m,'workspace-state')).workspace;
  assert.equal(v.memory.liveVersions,2);assert.ok(v.versions.some(s=>s.uses>1));
});

test('removing an unpinned city rule blocks departures without a stack leak; a replacement resumes the same city',async()=>{
  const m=await city(),before=rows(command(m,'city-state'),'VEHICLE');
  assert.match(command(m,'0 module-delete'),/MODULE-DELETED/);
  for(let n=0;n<6;n++)assert.match(command(m,'city-step'),/RULE-REJECTED/);
  assert.deepEqual(rows(command(m,'city-state'),'VEHICLE'),before);
  create(m,'new-route.thread');build(m,0,': new-route.thread + ;');
  assert.equal(rows(command(m,'city-step'),'ROUTE').length,3);
});

test('road edits invalidate the native cost cache even when the 16-bit generation wraps',async()=>{
  const m=await city();command(m,'city-cost-cache assert 65535 city-generation ! 9 0 0 road-update');
  const output=command(m,'city-cost-cache assert');
  assert.deepEqual(rows(output,'EDGE-COST').find(r=>r[0]===0),[0,9,0,9]);
});
