import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {workspace,create,build,command,kernel} from './workspace-helpers.mjs';
function rawState(m) {
  const data=Buffer.alloc(32+m.tape.byteLength);
  [m.inspect().instruction,m.pointer,m.highWater,m.steps].forEach((v,i)=>data.writeBigUInt64LE(BigInt(v),i*8));
  m.tape.forEach((v,i)=>data.writeUInt16LE(v,32+i*2));return data;
}
test('literal BF resumes opaque native workspace state: module evaluation and refused source compilation',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'8i-native-reference-'));
  try {
    const binary=join(directory,'reference');execFileSync('cc',['-O2','-std=c11','-Wall','-Wextra','-Werror',resolve('tools/reference.c'),'-o',binary]);
    const machine=await workspace();create(machine,'probe.thread');assert.match(build(machine,0,': probe.thread 3 * + ;'),/MODULE-PUBLISHED/);
    // Bootstrap is an explicit precondition, not claimed as literally re-executed
    // here. The existing full-kernel reference case still starts from a zero tape.
    for(const input of ['7 5 0 module-run . . cr','2 0 source-write hi\n0 module-compile']) {
      const initial=join(directory,'initial.bin'),final=join(directory,'final.bin');writeFileSync(initial,rawState(machine));
      const before=machine.steps,output=command(machine,input),started=performance.now();
      const result=spawnSync(binary,[resolve('artifacts/kernel.bf'),String(machine.tape.length),'900000000000',initial,final],{input:input+'\n',encoding:'utf8',timeout:1200000,maxBuffer:2e6});
      assert.equal(result.status,0,result.stderr||result.error?.message);assert.equal(result.stdout,output);
      assert.deepEqual(readFileSync(final),rawState(machine));
      assert.deepEqual(JSON.parse(result.stderr),{steps:machine.steps,pointer:machine.pointer,highWater:machine.highWater});
      console.log(JSON.stringify({literalNativeInput:input,literalInstructions:machine.steps-before,literalElapsedMs:performance.now()-started,output,wholeTapeEqual:true}));
    }
  }finally{rmSync(directory,{recursive:true,force:true});}
});
