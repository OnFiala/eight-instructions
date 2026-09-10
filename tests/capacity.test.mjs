import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,command,word} from './system-helpers.mjs';

test('dictionary capacity refuses publication without corrupting existing words',async()=>{
  const m=await fresh(),remaining=256-word(m,'dp');
  command(m,Array.from({length:remaining},(_,i)=>`: slot${i} ${i} ;`).join(' '));
  assert.equal(word(m,'dp'),256);
  const cp=word(m,'cp');assert.match(command(m,': excess 1 ;',{allowError:true}),/!E5/);
  assert.equal(word(m,'dp'),256);assert.equal(word(m,'cp'),cp);
  assert.equal(command(m,`slot${remaining-1} . 1071 462 swap drop .`),`${remaining-1} 462 `);
});
test('code and nested control exhaustion roll back incomplete definitions',async()=>{
  const m=await fresh(),cp=word(m,'cp'),dp=word(m,'dp');
  assert.match(command(m,': huge '+'0 drop '.repeat(3000)+';',{allowError:true}),/!E5/);
  assert.equal(word(m,'cp'),cp);assert.equal(word(m,'dp'),dp);
  assert.match(command(m,': nested '+'if '.repeat(65),{allowError:true}),/!E6/);
  assert.equal(word(m,'cp'),cp);assert.equal(word(m,'control'),0);
  assert.match(command(m,'huge nested',{allowError:true}),/!E1/);
  assert.equal(command(m,': still-good 7 ; still-good .'),'7 ');
});
test('heap exhaustion and overlong tokens refuse mutation and recover',async()=>{
  const m=await fresh(),remaining=4096-word(m,'here');command(m,`${remaining} allot`);
  assert.equal(command(m,'here .'),'4096 ');
  for(const source of ['1 allot','65535 allot','variable cannot-fit'])assert.match(command(m,source,{allowError:true}),/!E3/);
  assert.equal(command(m,'here .'),'4096 ');
  assert.match(command(m,'x'.repeat(100)+' 9 .',{allowError:true}),/!E1 .*9 /);
  assert.equal(command(m,'6 7 * .'),'42 ');
});
