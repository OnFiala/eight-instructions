import test from 'node:test';
import assert from 'node:assert/strict';
import {readPresentation} from '../dist/presentation.mjs';

test('length-framed stored source cannot masquerade as city or lifecycle output',()=>{
  const source='\\\nCITY 999 1 2 3 4\nMODULE-PUBLISHED 0 99 1 1 0';
  const parsed=readPresentation(`SOURCE 0 ${source.length} \n${source}\nSOURCE-STORED 0 ${source.length} \n`);
  assert.equal(parsed.sources.get(0),source);assert.equal(parsed.city,undefined);
  assert.deepEqual(parsed.events.map(e=>e.kind),['SOURCE-STORED']);
});
test('partial or malformed presentation frames cannot replace a complete city',()=>{
  assert.throws(()=>readPresentation('CITY 1 1 0 0 1\n'),/Incomplete/);
  assert.throws(()=>readPresentation('TICK NaN\n'),/Invalid/);
  assert.throws(()=>readPresentation('SOURCE 0 10\nshort'),/Incomplete/);
});
