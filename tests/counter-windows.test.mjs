import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compile,Machine} from '../dist/engine.mjs';
import {WasmMachine} from '../dist/wasm-engine.mjs';
import {encodeImage,decodeImage,sha256} from '../dist/images.mjs';
const wasm=new WebAssembly.Module(readFileSync(new URL('../dist/executor.wasm',import.meta.url)));
const maximum=Number.MAX_SAFE_INTEGER;
const factories=[
  (source,options)=>new Machine(compile(source,{optimize:false}),options),
  (source,options)=>new Machine(compile(source),options),
  (source,options)=>new WasmMachine(compile(source),wasm,options),
];

test('exact counter windows cross Number precision without changing BF execution',()=>{
  // Seed instrumentation, not tape: this tests a boundary, not a claim to have
  // executed nine quadrillion commands in this test.
  for(const create of factories) {
    const source='++++[->+++<]>.,.',m=create(source,{cells:16}),baseline=create(source,{cells:16});
    m.steps=maximum-2;m.blocks=maximum-2;
    for(const instance of [m,baseline]) {
      assert.equal(instance.run({fuel:1000,blocks:1000}),'input');
      instance.feed([71]);assert.equal(instance.run({fuel:1000,blocks:1000}),'halted');
    }
    assert.deepEqual(m.tape,baseline.tape);assert.deepEqual(m.output,baseline.output);
    assert.equal(m.totalSteps-BigInt(maximum-2),baseline.totalSteps);
    assert.equal(m.totalBlocks-BigInt(maximum-2),baseline.totalBlocks);
    assert.equal(m.pc,baseline.pc);assert.equal(m.pointer,baseline.pointer);
    assert.equal(m.inspect().steps,String(m.totalSteps));
    assert.doesNotThrow(()=>JSON.stringify(m.inspect()));
  }
});

test('zero budgets, repeated fuel pauses and output limits remain exact across rotation',()=>{
  for(const create of factories) {
    const loop=create('+[]',{cells:8});loop.steps=maximum;loop.blocks=maximum;
    assert.equal(loop.run({fuel:0,blocks:0}),'budget');assert.equal(loop.instructionEpoch,0n);
    for(let i=1;i<=4;i++) {
      assert.equal(loop.run({fuel:73,blocks:100}),'budget');
      assert.equal(loop.totalSteps,BigInt(maximum)+BigInt(73*i));
      assert.equal(loop.totalBlocks,loop.totalSteps);
    }
    const out=create('...',{cells:8,maxOutput:2});out.steps=maximum-1;out.blocks=maximum-1;
    assert.throws(()=>out.run({fuel:100,blocks:100}),/Output limit/);
    assert.equal(out.totalSteps,BigInt(maximum)+1n);assert.deepEqual([...out.drain()],[0,0]);
    assert.equal(out.run(),'halted');assert.equal(out.totalSteps,BigInt(maximum)+2n);
    assert.deepEqual(out.output,[0]);
  }
});

test('images preserve exact epochs and reject malformed epochs before creating a candidate',async()=>{
  for(const make of factories) {
    const source='+[],',programHash=await sha256(source),m=make(source,{cells:8});
    m.steps=maximum;m.blocks=maximum;m.run({fuel:13,blocks:20});
    const create=cells=>make(source,{cells}),options={program:m.program,programHash,create};
    const image=await encodeImage(m,programHash),restored=await decodeImage(image,options);
    assert.equal(restored.totalSteps,m.totalSteps);assert.equal(restored.totalBlocks,m.totalBlocks);
    assert.deepEqual(restored.tape,m.tape);assert.equal(restored.pc,m.pc);
    for(const instance of [m,restored])instance.run({fuel:7,blocks:20});
    assert.equal(restored.totalSteps,m.totalSteps);assert.deepEqual(restored.tape,m.tape);
    for(const value of [-1,'-1','1.5','01','1e5','9'.repeat(129),null]) {
      const bad=JSON.parse(image);bad.payload.instructionEpoch=value;
      bad.sha256=await sha256(JSON.stringify(bad.payload));
      await assert.rejects(decodeImage(JSON.stringify(bad),{...options,create:()=>assert.fail('invalid image allocated a machine')}),/epoch/);
    }
  }
});
