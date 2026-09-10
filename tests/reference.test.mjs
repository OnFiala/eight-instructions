import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {kernel} from './system-helpers.mjs';
import {execute} from '../runtime/system.mjs';

test('the entire generated kernel agrees with an independent literal C executor',()=>{
  mkdirSync(new URL('../.local/',import.meta.url),{recursive:true});
  const binary=new URL('../.local/reference',import.meta.url).pathname;
  execFileSync('cc',['-O2','-std=c11','-Wall','-Wextra','-Werror',new URL('../tools/reference.c',import.meta.url).pathname,'-o',binary]);
  const source=': square dup * ; 7 square .\n';
  const m=kernel.create();execute(m,source,{eof:true});assert.equal(m.state,'halted');
  const result=spawnSync(binary,[resolve('artifacts/kernel.bf'),String(kernel.map.dialect.tape_cells),'10000000000'],{input:source,encoding:'utf8',timeout:60000});
  assert.equal(result.status,0,result.stderr);
  assert.equal(result.stdout,new TextDecoder().decode(m.drain()));
  assert.deepEqual(JSON.parse(result.stderr),{steps:m.steps,pointer:m.pointer,highWater:m.highWater});
});
