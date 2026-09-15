import test from 'node:test';
import assert from 'node:assert/strict';
import {readIndustry} from '../dist/industry-presentation.mjs';

test('native source text is length framed, never mistaken for errors or city events',()=>{
  const source=': my.thread \\ ignored diagnostic example\n!E3 \nSEND 1 2 3 4 5\n;';
  const text=`SOURCE 6 ${source.length}\n${source}\nVERSION-SOURCE 8 ${source.length}\n${source}\nPARAMETER 6 0 0 1 6 2\n`;
  const result=readIndustry(text);
  assert.equal(result.sources.get(6),source);assert.equal(result.versionSource,source);
  assert.equal(result.nativeError,undefined);assert.deepEqual(result.industryEvents,[]);
  assert.equal(readIndustry(text+'!E3 \n').nativeError,'3');
});
test('bounded process and industrial records reject truncation before UI replacement',()=>{
  for(const text of ['PROCESS 0 1 3\n','ENTITY 0 1 2\n','I-PATH 7 3 1 2\n','TRAVEL 7 1 2\n','INDUSTRY 3 0 1 46\n','PRIVATE 7 0\n'])assert.throws(()=>readIndustry(text),/Incomplete/);
  assert.throws(()=>readIndustry('I-ROAD 0 0 1 2 0 1 1 1 -1\n'),/Invalid/);
  const source=' '.repeat(500)+': a ;';
  assert.equal(readIndustry(`SOURCE 7 ${source.length}\n${source}\n`).sources.get(7),source);
});
