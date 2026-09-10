import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { compile, Machine } from '../dist/engine.mjs';

test('generated addressed memory and arithmetic execute on the real BF machine', () => {
  const source = execFileSync('python3', ['-c', `
from tools.emitter import BF, Array
b=BF()
i,v,r,a,c,o=[b.cell() for _ in range(6)]
arr=Array(b,512,64,'test')
for n in [0,1,2,17,63,0,63]:
 b.set(i,n); b.set(v,n+77); arr.put(i,v); arr.get(i,r)
 b.at(r); b.raw('.')
for x,y in [(0,0),(0,1),(1,0),(4,4),(4,5),(5,4),(65535,1)]:
 b.set(a,x); b.set(c,y); b.lt(a,c,o); b.at(o); b.raw('.')
 b.eq(a,c,o); b.at(o); b.raw('.')
b.set(a,13);b.set(c,17);b.mul(a,c,o);b.at(o);b.raw('.')
print(b.source())
`], { cwd: new URL('..', import.meta.url), encoding:'utf8' });
  const m = new Machine(compile(source), { cells: 1024 });
  m.feed([], { eof:true }); assert.equal(m.run(), 'halted');
  assert.deepEqual(m.output, [77,78,79,94,140,77,140, 0,1,1,0,0,0,0,1,1,0,0,0,0,0,221]);
  for (let i=0;i<64;i++) for(const lane of [0,1,3]) assert.equal(m.tape[512+i*4+lane], 0);
});
