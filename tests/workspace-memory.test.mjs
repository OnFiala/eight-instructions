import test from 'node:test';
import assert from 'node:assert/strict';
import {kernel,command} from './system-helpers.mjs';
import {loadLibraries} from '../runtime/system.mjs';

test('generic key and paged workspace operations execute as BF and reject boundaries',()=>{
  const m=kernel.create();
  assert.equal(command(m,': raw-byte key emit ; raw-byte Z'),'Thread / 8 Instructions\nZ');
  assert.equal(command(m,'123 4095 w! 456 0 w! 789 64 w! 4095 w@ . 0 w@ . 64 w@ .'),'123 456 789 ');
  const size=kernel.map.arrays.workspace.size;
  assert.equal(command(m,`321 ${size-1} w! ${size-1} w@ .`),'321 ');
  for(const s of [`${size} w@`,'1 65535 w!'])assert.match(command(m,s,{allowError:true}),/!E3/);
  assert.equal(command(m,'4095 w@ . 0 w@ .'),'123 456 ');
});
test('boot manifests accept only local raw Thread source paths',async()=>{
  assert.match(await loadLibraries('city-system.json'),/module-create delivery-rule.thread/);
  await assert.rejects(loadLibraries('../system.json'),/Invalid source manifest/);
});
