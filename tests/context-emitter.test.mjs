import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {compile,Machine} from '../dist/engine.mjs';

test('opaque context lanes copy in actual BF, preserve source and clear traversal state',()=>{
  const source=execFileSync('python3',['-c',`
from tools.emitter import BF,Array,PagedArray,copy_bank
b=BF();i,h,l,v,r=[b.cell() for _ in range(5)]
a=Array(b,512,7,'heap',banks=4)
w=PagedArray(b,1024,128,'workspace',banks=4)
for n in range(7):
 b.set(i,n);b.set(v,n+31);a.put(i,v)
for hi,lo in [(0,0),(0,63),(1,0),(1,63)]:
 b.set(h,hi);b.set(l,lo);b.set(v,hi*64+lo+19);w.put(h,l,v)
for region in [a,w]:
 copy_bank(region,0,1);copy_bank(region,1,2);copy_bank(region,2,3)
b.set(i,6);b.set(v,255);a.put(i,v)
b.set(h,1);b.set(l,63);b.set(v,254);w.put(h,l,v)
copy_bank(a,3,0);copy_bank(w,2,0)
for n in range(7):
 b.set(i,n);a.get(i,r);b.at(r);b.raw('.')
for hi,lo in [(0,0),(0,63),(1,0),(1,63)]:
 b.set(h,hi);b.set(l,lo);w.get(h,l,r);b.at(r);b.raw('.')
print(b.source())
`],{cwd:new URL('..',import.meta.url),encoding:'utf8'});
  const program=compile(source),m=new Machine(program,{cells:4200});
  m.feed([],{eof:true}); assert.equal(m.run({fuel:1e10,blocks:1e8}),'halted');
  assert.deepEqual(m.output,[31,32,33,34,35,36,37,19,82,83,146]);
  for(const [base,size,unit] of [[512,7,4],[1024,128,6]]){
    for(let i=0;i<=size;i++)for(let lane=0;lane<unit*4;lane++){
      if(lane%unit!==2)assert.equal(m.tape[base+i*unit*4+lane],0,`dirty ${base}/${i}/${lane}`);
    }
    for(let i=0;i<size;i++)for(let bank=1;bank<4;bank++)
      assert.equal(m.tape[base+i*unit*4+2],m.tape[base+i*unit*4+2+bank*unit]);
  }
  const literal=new Machine(compile(source,{optimize:false}),{cells:4200});
  literal.feed([],{eof:true});
  assert.equal(literal.run({fuel:1e10,blocks:1e9}),'halted');
  assert.deepEqual(literal.tape,m.tape); assert.deepEqual(literal.output,m.output);
  assert.equal(literal.steps,m.steps);
});
