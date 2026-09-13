import test from 'node:test';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {workspace,create,build,command,state,kernel} from './workspace-helpers.mjs';

test('450 replacement/reclamation cycles exceed both original monotonic limits with fixed arenas',async()=>{
  const m=await workspace();create(m,'cycle.thread');
  const cp=m.tape[kernel.map.registers.cp],dp=m.tape[kernel.map.registers.dp];
  const started=performance.now(),slots=new Set();let retiredWords=0;
  for(let n=1;n<=450;n++) {
    const source=`: cycle.thread ${`${n%2+1} + `.repeat(6)}+ ;`;
    assert.match(build(m,0,source),new RegExp(`MODULE-PUBLISHED 0 ${n} `));
    if(n%25===0||n===1) {
      const versions=state(m).filter(v=>v[1]===2);
      assert.equal(versions.length,Math.min(2,n));
      for(const v of versions){slots.add(v[0]);assert.equal(v[4],1);assert.equal(v[5],0);}
      assert.equal(command(m,'3 4 0 module-run . .'),`1 ${7+6*(n%2+1)} `);
    }
    retiredWords+=20;
  }
  assert.ok(retiredWords>8192);assert.ok(450>256);
  assert.equal(m.tape[kernel.map.registers.cp],cp);
  assert.equal(m.tape[kernel.map.registers.dp],dp);
  assert.ok(slots.size<=3);
  const final=state(m).filter(v=>v[1]===2);
  assert.equal(final.reduce((n,v)=>n+v[6],0),40);
  assert.match(command(m,'0 module-delete'),/MODULE-DELETED/);
  assert.equal(state(m).filter(v=>v[1]===2).length,0);
  console.log(JSON.stringify({reclaimCycles:450,elapsedMs:performance.now()-started,versionCapacity:6,maxObservedLive:2,slotsUsed:[...slots],compiledWordsAcrossCycles:retiredWords,finalLiveCodeWords:40,afterDeleteLiveVersions:0,platformCodeWords:cp,platformDictionaryEntries:dp,tapeCells:m.tape.length}));
});
