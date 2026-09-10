import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compile, Machine} from '../dist/engine.mjs';
import {WasmMachine} from '../dist/wasm-engine.mjs';
const module = new WebAssembly.Module(readFileSync(new URL('../dist/executor.wasm',import.meta.url)));

test('Wasm backend is equivalent to literal BF for 150 deterministic programs',()=>{
  let seed=9931;
  const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  for(let i=0;i<150;i++){
    const src='+'.repeat(rand(90))+'[->'+'+'.repeat(rand(9))+'>'+'+'.repeat(rand(5))+'<<]>>[-<+>]<.,.';
    const a=new Machine(compile(src,{optimize:false}),{cells:64});
    const b=new WasmMachine(compile(src),module,{cells:64});
    for(const m of [a,b]) {m.feed([i],{eof:true});assert.equal(m.run({fuel:1e8}),'halted');}
    assert.deepEqual(a.tape,b.tape);assert.deepEqual(a.output,b.output);
    assert.equal(a.steps,b.steps);assert.equal(a.pointer,b.pointer);assert.equal(a.highWater,b.highWater);
  }
});
test('Wasm agrees on nested loops, positive clear loops, zero loops and boundaries',()=>{
  for(const src of ['-[+]','++[>++[>+<-]<-]','[<+>-]','<','<>','+[<+>-]']){
    const machines=[new Machine(compile(src),{cells:64}),new WasmMachine(compile(src),module,{cells:64})];
    const results=machines.map(m=>{try{return m.run();}catch(e){return e.message;}});
    assert.equal(results[0],results[1]);assert.deepEqual(machines[0].tape,machines[1].tape);
    assert.equal(machines[0].steps,machines[1].steps);
  }
});
test('Wasm pause, streaming input, output caps and work limits',()=>{
  for(const C of [Machine,WasmMachine]){
    const create=(src,options)=>C===Machine?new C(compile(src),options):new C(compile(src),module,options);
    const m=create('+,.,.',{cells:64});assert.equal(m.run(),'input');
    m.feed([72]);assert.equal(m.run(),'input');m.feed([73],{eof:true});assert.equal(m.run(),'halted');
    assert.deepEqual(m.output,[72,73]);
    const loop=create('+[]',{cells:64});assert.equal(loop.run({fuel:73}),'budget');assert.equal(loop.steps,73);
    const out=create('...',{cells:64,maxOutput:2});assert.throws(()=>out.run(),/Output limit/);
  }
});
