import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {sha256} from '../dist/images.mjs';

function connection() {
  const worker=new Worker(new URL('./browser-worker-harness.mjs',import.meta.url)),pending=new Map();let id=0;
  worker.on('message',data=>{
    if(data.progress)return;
    const p=pending.get(data.id);if(!p)return;
    pending.delete(data.id);data.error?p.reject(new Error(data.error)):p.resolve(data.result);
  });
  worker.on('error',e=>{for(const p of pending.values())p.reject(e);pending.clear();});
  return {close:()=>worker.terminate(),request:(type,body={})=>new Promise((resolve,reject)=>{
    const current=++id;pending.set(current,{resolve,reject});worker.postMessage({...body,type,id:current});
  })};
}
test('browser worker: real native execution, pause, busy refusal, step and image across worker lifetimes',async t=>{
  let c=connection();t.after(()=>c.close());
  assert.deepEqual(await c.request('inspect'),{state:'off'});
  await assert.rejects(c.request('execute',{source:'1 .'}),/Start/);
  const boot=await c.request('boot');assert.equal(boot.state,'input');assert.equal(boot.output,'Thread / 8 Instructions\n');
  const before=await c.request('inspect');
  await assert.rejects(c.request('execute',{source:[]}),/Source/);
  await assert.rejects(c.request('inspect',{start:-1}),/range/);
  assert.deepEqual(await c.request('inspect'),before);
  assert.equal((await c.request('execute',{source:': square dup * ; 13 square . cr'})).output,'169 \n');
  const run=c.request('execute',{source:': spin begin again ; spin'});
  await assert.rejects(c.request('execute',{source:'1 .'}),/busy/);
  await c.request('pause');const paused=await run;assert.equal(paused.state,'budget');assert.equal(paused.reason,'paused');
  const step=await c.request('step',{blocks:1000});assert.equal(step.executedBlocks,1000);assert.equal(step.state,'budget');
  const image=(await c.request('save')).image,saved=await c.request('inspect');
  await assert.rejects(c.request('load',{image:'{}'}));assert.deepEqual(await c.request('inspect'),saved);
  await c.close();c=connection();await c.request('load',{image});assert.deepEqual(await c.request('inspect'),saved);
  const resumed=c.request('resume');await c.request('pause');assert.equal((await resumed).reason,'paused');
  // A second boot creates a new native library environment, not a stale snapshot.
  await c.request('boot');await c.request('execute',{source:': cube dup dup * * ; tx-begin 63 19 db-put assert tx-commit'});
  const persisted=(await c.request('save')).image;await c.close();c=connection();await c.request('load',{image:persisted});
  assert.equal((await c.request('execute',{source:'4 cube . 19 db-get . . cr'})).output,'64 1 63 \n');
  // Seed instrumentation at its boundary; preserve the actual guest state.
  const boundary=JSON.parse((await c.request('save')).image);
  boundary.payload.steps=Number.MAX_SAFE_INTEGER;boundary.payload.blocks=Number.MAX_SAFE_INTEGER;
  boundary.sha256=await sha256(JSON.stringify(boundary.payload));
  await c.request('load',{image:JSON.stringify(boundary)});
  const crossed=await c.request('execute',{source:'3 . cr'});
  assert.equal(crossed.output,'3 \n');assert.equal(crossed.state,'input');
  assert.ok(crossed.executedSteps>0);assert.ok(crossed.executedBlocks>0);
  assert.equal(BigInt(crossed.steps),BigInt(Number.MAX_SAFE_INTEGER)+BigInt(crossed.executedSteps));
  assert.equal(BigInt(crossed.blocks),BigInt(Number.MAX_SAFE_INTEGER)+BigInt(crossed.executedBlocks));
});
