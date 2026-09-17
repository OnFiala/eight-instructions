import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {kernel,command} from './system-helpers.mjs';
function rawState(m){
  const b=Buffer.alloc(32+m.tape.byteLength);
  [m.inspect().instruction,m.pointer,m.highWater,m.totalSteps].forEach((v,i)=>b.writeBigUInt64LE(BigInt(v),i*8));
  m.tape.forEach((v,i)=>b.writeUInt16LE(v,32+i*2));return b;
}
test('literal BF executes the released context-copy and context-zero primitives with full-state equality',()=>{
  const dir=mkdtempSync(join(tmpdir(),'8i-context-reference-'));
  try{
    const binary=join(dir,'reference');
    execFileSync('cc',['-O2','-std=c11','-Wall','-Wextra','-Werror',resolve('tools/reference.c'),'-o',binary]);
    const m=kernel.create();
    command(m,'65535 0 ! 213 4095 ! 71 0 w! 61234 24575 w!');
    for(const input of ['0 3 context-copy','3 context-zero']){
      const initial=join(dir,'initial.bin'),final=join(dir,'final.bin');
      writeFileSync(initial,rawState(m));
      const before=m.totalSteps,output=command(m,input),start=performance.now();
      const result=spawnSync(binary,[resolve('artifacts/kernel.bf'),String(m.tape.length),'200000000000',initial,final],{input:input+'\n',encoding:'utf8',timeout:1200000,maxBuffer:2e6});
      assert.equal(result.status,0,result.stderr||result.error?.message);assert.equal(result.stdout,output);
      assert.deepEqual(readFileSync(final),rawState(m));
      console.log(JSON.stringify({input,literalInstructions:String(m.totalSteps-before),literalElapsedMs:performance.now()-start,wholeTapeEqual:true,kernel:kernel.programHash}));
    }
  }finally{rmSync(dir,{recursive:true,force:true});}
});
