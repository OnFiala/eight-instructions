import test from 'node:test';
import assert from 'node:assert/strict';
import {city,command,build,rows,snapshot,restore,tollFree} from './city-helpers.mjs';
import {state} from './workspace-helpers.mjs';

test('two programs from one initial image change routes with the same open toll bridge',async()=>{
  const a=await city(),bytes=await snapshot(a),b=await restore(bytes);
  const before=command(b,'city-state');assert.match(build(b,0,tollFree),/MODULE-PUBLISHED/);
  const after=command(b,'city-state');
  for(const label of ['NODE','ROAD','VEHICLE'])assert.deepEqual(rows(after,label),rows(before,label));
  const outputA=command(a,'city-step'),outputB=command(b,'city-step');
  const routeA=rows(outputA,'ROUTE')[0],routeB=rows(outputB,'ROUTE')[0];
  assert.deepEqual(routeA.slice(1,5),routeB.slice(1,5));
  assert.equal(routeA[6],15);assert.equal(routeB[6],22);
  const pairs=route=>route.slice(8).slice(1).map((n,i)=>[route[8+i],n]);
  assert.ok(pairs(routeA).some(([a,b])=>a===9&&b===10));
  assert.ok(pairs(routeB).some(([a,b])=>a===1&&b===2));
  assert.ok(!pairs(routeB).some(([a,b])=>a===9&&b===10));
  assert.equal(rows(before,'ROAD').find(r=>r[0]===42)[5],1);
  assert.equal(rows(command(b,'city-state'),'ROAD').find(r=>r[0]===42)[5],1);
  const again=await restore(bytes);build(again,0,tollFree);
  assert.equal(command(again,'city-step'),outputB);
});

test('in-flight cars retain their edge and old version across swaps, then release it at arrival',async()=>{
  const m=await city();command(m,'city-step');
  const before=rows(command(m,'city-state'),'VEHICLE');
  build(m,0,tollFree);build(m,0,': delivery-rule.thread 9 * + ;');
  assert.deepEqual(rows(command(m,'city-state'),'VEHICLE'),before);
  const old=state(m).find(v=>v[3]===1);assert.equal(old[1],2);assert.equal(old[5],3);
  command(m,'city-step');
  const moving=rows(command(m,'city-state'),'VEHICLE');
  for(let i=0;i<3;i++){assert.equal(moving[i][2],before[i][2]);assert.equal(moving[i][3],1);}
  assert.equal(rows(command(m,'city-step'),'ARRIVE').length,3);
  assert.ok(!state(m).some(v=>v[1]===2&&v[3]===1));
  const next=rows(command(m,'city-step'),'ROUTE');assert.ok(next.every(r=>r[5]===3));
});

test('paused full workspace image preserves partial travel, drafts, pins and deterministic continuation',async()=>{
  const a=await city();command(a,'city-step city-step');build(a,0,tollFree);
  const b=await restore(await snapshot(a));
  assert.equal(command(a,'city-state workspace-state'),command(b,'city-state workspace-state'));
  for(let i=0;i<5;i++)assert.equal(command(a,'city-step'),command(b,'city-step'));
  assert.equal(command(a,'city-state'),command(b,'city-state'));
});

test('closure is a separate native data experiment and cannot teleport an in-flight vehicle',async()=>{
  const m=await city();command(m,'city-step');
  const before=rows(command(m,'city-state'),'VEHICLE');
  const edge=before[0][2]-1;command(m,`0 ${edge} road-state 0 bridge-state`);
  assert.deepEqual(rows(command(m,'city-state'),'VEHICLE'),before);
  command(m,'city-step city-step');
  const after=rows(command(m,'city-state'),'VEHICLE');
  assert.equal(after[0][1],8);assert.equal(after[0][2],0);
  const route=rows(command(m,'city-step'),'ROUTE')[0];
  assert.equal(route[5],1);
  assert.ok(!route.slice(8).some((n,i,p)=>n===9&&p[i+1]===10));
});

test('changing road duration preserves the duration already committed to an in-flight vehicle',async()=>{
  const m=await city();command(m,'city-step city-step');
  const cars=rows(command(m,'city-state'),'VEHICLE'),edge=cars[0][2]-1;
  command(m,`30 9 ${edge} road-update`);
  assert.deepEqual(rows(command(m,'city-state'),'VEHICLE'),cars);
  const arrived=rows(command(m,'city-step'),'ARRIVE');
  assert.ok(arrived.some(r=>r[1]===0&&r[2]===8));
  command(m,'city-init');
  assert.equal(state(m).filter(v=>v[1]===2).reduce((s,v)=>s+v[5],0),0);
});
