import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {district,run,field,kernel} from './synthesis-helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';

test('320 native short-horizon searches generate, compile, reject and reclaim at fixed capacity, across exported pending trials',async()=>{
  let m=await district({raw:18,goal:3});
  const transcript=createHash('sha256');
  const residentBefore=[m.tape[kernel.map.registers.cp],m.tape[kernel.map.registers.dp]];
  for(let cycle=0;cycle<320;cycle++){
    transcript.update(run(m,'1 1 1 search-start autonomy-step'));
    assert.equal(field(m,1),1);
    if(cycle%40===0){
      m=await decodeImage(await encodeImage(m,kernel.programHash),{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
    }
    transcript.update(run(m,'autonomy-step'));
    assert.equal(field(m,1),0);
    assert.equal(field(m,19),0,'one round provides no valid useful-work improvement');
    assert.equal(field(m,2),cycle+1);
    if(cycle%40===39){
      assert.match(run(m,'industry-account'),/18 1/);
      const a=kernel.map.arrays.workspace;
      for(let i=0;i<a.size;i++)for(let bank=1;bank<4;bank++)
        assert.equal(m.tape[a.base+i*a.stride+2+bank*a.bank_stride],0);
      console.log(JSON.stringify({cycles:cycle+1,retainedWorldContexts:1,trialContexts:0,versionCapacity:16,processCapacity:16}));
    }
  }
  assert.deepEqual([m.tape[kernel.map.registers.cp],m.tape[kernel.map.registers.dp]],residentBefore);
  assert.equal(field(m,20),320);
  console.log(JSON.stringify({cycles:320,exportsDuringTrials:8,transcriptSha256:transcript.digest('hex'),residentBefore,kernel:kernel.programHash}));
});
