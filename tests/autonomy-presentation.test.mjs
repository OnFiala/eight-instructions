import test from 'node:test';
import assert from 'node:assert/strict';
import {readAutonomy} from '../dist/autonomy-presentation.mjs';
test('trial module, material and road records cannot become live state or source',()=>{
  const x=readAutonomy('WORLD 0 2\nROUND 8\nWORLD 1 2 5\nMODULE-PUBLISHED 1 9\nBUILD 4 3 3\nROAD-OPEN 0 0\nGENERATED 2 5 1 3\nabc\nTRIAL-RESULT 2 5 0 32 9 0 3 3 0 0\nWORLD 0 2\nMODULE-PUBLISHED 1 8\nSEARCH-DECISION 2 1 5 8 9 8\nSOURCE 1 3\nabc\n');
  assert.doesNotMatch(x.live,/BUILD|ROAD-OPEN|1 9/);
  assert.match(x.live,/MODULE-PUBLISHED 1 8/);
  assert.equal(x.sources[0].source,'abc');assert.equal(x.records[0].world,1);
  assert.equal(x.records[1].world,0);
});
test('source text cannot spoof native WORLD or decision records',()=>{
  const body='WORLD 1\nSEARCH-DECISION 1 1';
  const x=readAutonomy(`SOURCE 1 ${body.length}\n${body}\nROUND 2\n`);
  assert.equal(x.records.length,0);assert.match(x.live,/ROUND 2/);
  assert.throws(()=>readAutonomy('GENERATED 1 5 1 9\na\n'),/Incomplete/);
});
