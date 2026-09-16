import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {processes,create,build,command,kernel} from './process-helpers.mjs';

function rawState(m){
  const b=Buffer.alloc(32+m.tape.byteLength);
  [m.inspect().instruction,m.pointer,m.highWater,m.totalSteps].forEach((v,i)=>b.writeBigUInt64LE(BigInt(v),i*8));
  m.tape.forEach((v,i)=>b.writeUInt16LE(v,32+i*2));return b;
}
test('literal BF matches native mailbox wake and a bounded resumed receive turn, including the whole tape',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'8i-process-reference-'));
  try{
    const binary=join(dir,'reference');
    execFileSync('cc',['-O2','-std=c11','-Wall','-Wextra','-Werror',resolve('tools/reference.c'),'-o',binary]);
    const m=await processes();create(m,'mail.thread');
    build(m,0,': mail.thread wait recv if drop drop 0 state! else drop drop drop then ;');
    command(m,'0 process-create drop process-step 1 process-slice!');
    // Actual BF boot is a recorded precondition. Only these two representative
    // native operations are re-executed literally, not a whole industrial run.
    for(const input of ['43 9 1 process-post .','process-step']){
      const initial=join(dir,'initial.bin'),final=join(dir,'final.bin');writeFileSync(initial,rawState(m));
      const before=m.totalSteps,output=command(m,input),start=performance.now();
      // Hosted Linux measured ~350M literal commands/s in the module reference.
      // Keep this exact workload and instruction bound; allow slower hardware.
      const r=spawnSync(binary,[resolve('artifacts/kernel.bf'),String(m.tape.length),'2000000000000',initial,final],{input:input+'\n',encoding:'utf8',timeout:3600000,maxBuffer:2e6});
      assert.equal(r.status,0,r.stderr||r.error?.message);assert.equal(r.stdout,output);
      assert.deepEqual(readFileSync(final),rawState(m));
      assert.deepEqual(JSON.parse(r.stderr),{steps:Number(m.totalSteps),pointer:m.pointer,highWater:m.highWater});
      console.log(JSON.stringify({input,literalInstructions:String(m.totalSteps-before),literalElapsedMs:performance.now()-start,output,wholeTapeEqual:true}));
    }
  }finally{rmSync(dir,{recursive:true,force:true});}
});
