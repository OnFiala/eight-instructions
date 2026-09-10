import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {compile,Machine} from '../dist/engine.mjs';
import {sha256,encodeImage,decodeImage} from '../dist/images.mjs';
import {atomicWrite} from '../runtime/files.mjs';

test('machine images resume partial input and preserve full uint16 state',async()=>{
  const src=',[->+<]>,.',program=compile(src),programHash=await sha256(src);
  const create=cells=>new Machine(program,{cells});
  const m=create(64);m.feed([217]);assert.equal(m.run(),'input');m.tape[63]=65535;
  const image=await encodeImage(m,programHash);
  const restored=await decodeImage(image,{program,programHash,create});
  assert.equal(restored.tape[1],217);assert.equal(restored.tape[63],65535);
  restored.feed([83]);assert.equal(restored.run(),'halted');assert.deepEqual(restored.output,[83]);
});
test('image corruption, incompatible kernels and invalid machine state are rejected',async()=>{
  const program=compile(','),programHash=await sha256(',');
  const create=cells=>new Machine(program,{cells});const m=create(8);m.run();
  const image=await encodeImage(m,programHash),options={program,programHash,create};
  const altered=JSON.parse(image);altered.payload.pointer=7;
  await assert.rejects(decodeImage(JSON.stringify(altered),options),/integrity/);
  await assert.rejects(decodeImage(image,{...options,programHash:'wrong'}),/different kernel/);
  for(const change of [{pointer:-1},{cells:1e9},{pc:99999},{state:'input',eof:true},{input:[999]},{tape:'!!!!'}]){
    const bad=JSON.parse(image);Object.assign(bad.payload,change);bad.sha256=await sha256(JSON.stringify(bad.payload));
    await assert.rejects(decodeImage(JSON.stringify(bad),options));
  }
});
test('budget images resume without replaying input or output',async()=>{
  const src='++++[>+++<-]>.',program=compile(src,{optimize:false}),programHash=await sha256(src);
  const create=cells=>new Machine(program,{cells});const m=create(32);m.run({fuel:9});
  const n=await decodeImage(await encodeImage(m,programHash),{program,programHash,create});
  assert.equal(n.run(),'halted');assert.deepEqual(n.output,[12]);
  const reference=create(32);reference.run();assert.equal(n.steps,reference.steps);
});
test('OS image replacement is atomic and leaves no temporary files',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'eight-instructions-')),path=join(dir,'disk.8i');
  await atomicWrite(path,'first');await atomicWrite(path,'second');
  assert.equal(await readFile(path,'utf8'),'second');assert.deepEqual(await readdir(dir),['disk.8i']);
  await assert.rejects(atomicWrite(join(dir,'missing','disk.8i'),'data'));
});
