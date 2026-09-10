import test from 'node:test';
import assert from 'node:assert/strict';
import { session, output, reg, region, send } from './helpers.mjs';

function expect(source, expected) {
  const m = session(source+' ');
  assert.equal(m.state, 'input', JSON.stringify(m.inspect()));
  assert.equal(output(m), 'Thread / 8 Instructions\n'+expected);
  assert.equal(reg(m,'err'), 0); return m;
}
test('numeric parsing and unsigned arithmetic', () => {
  expect('0 . 65535 . -1 . 9 4 /mod . . 65535 1 + . 0 1 - . 17 13 * .', '0 65535 65535 2 1 0 65535 221 ');
});
test('stack combinators, equality and unsigned comparison', () => {
  expect('3 5 over . swap . . 3 dup = . 0 65535 < . 65535 0 < . 1 0= . 0 0= . depth .', '3 3 5 1 1 0 0 1 0 ');
});
test('native definitions, calls and source compilation', () => {
  expect(': sq dup * ; : sumsq sq swap sq + ; 3 4 sumsq .', '25 ');
});
test('native conditionals and nested branching', () => {
  expect(': choose if 7 else 9 then ; 0 choose . 1 choose . : nest if 1 if 3 else 4 then else 5 then ; 1 nest . 0 nest .', '9 7 3 5 ');
});
test('loops and recursive definitions', () => {
  expect(': down begin dup . 1 - dup 0= until drop ; 4 down : fact dup 2 < if drop 1 else dup 1 - recurse * then ; 6 fact .', '4 3 2 1 720 ');
});
test('native defining words, while/repeat and early return', () => {
  expect('variable n 8 n ! 12 constant dozen : work 0 begin dup n @ < while dup . 1 + repeat drop ; work dozen . : early 5 exit 9 ; early .', '0 1 2 3 4 5 6 7 12 5 ');
});
test('separate bounded heap and persistent regions', () => {
  const m = expect('here . 32 allot here . 55 4095 ! 4095 @ . 89 4095 p! 4095 p@ . 0 @ .', '0 32 55 89 0 ');
  assert.equal(region(m,'heap')[4095],55); assert.equal(region(m,'store')[4095],89);
});
test('comments and partial tokens across interactive input chunks', () => {
  const m=session('12'); assert.equal(output(m),'Thread / 8 Instructions\n');
  assert.equal(send(m,'3 . \\ ignored 999 .\n7 . '),'123 7 ');
});
test('diagnostic recovery and rejected input', () => {
  for (const [src, code] of [['frog',1],['65536',1],['12z',1],['+',2],['1 0 /mod',4],['4096 @',3],['1 65535 p!',3],['0 assert',8],['then',6],[': broken if ;',6]]) {
    const m=session(src+' '); assert.match(output(m),new RegExp('!E'+code+' '));
    assert.equal(m.state,'input'); assert.equal(send(m,'4 5 + . '),'9 ');
  }
});
test('malformed definitions are unpublished and roll back code allocation', () => {
  const m=session(': good 17 ; '), start=reg(m,'cp'); output(m);
  assert.match(send(m,': broken 3 if ; '),/!E6/); assert.equal(reg(m,'cp'),start);
  assert.match(send(m,'broken '),/!E1/); assert.equal(send(m,'good . '),'17 ');
});
test('resource exhaustion: data and return stack protection', () => {
  const m=session('1 '.repeat(257)); assert.match(output(m),/!E2/);
  assert.equal(send(m,'depth . '),'0 ');
  assert.match(send(m,': forever recurse ; forever '),/!E2/);
  assert.equal(send(m,'depth . '),'0 ');
});
test('EOF closes ordinary execution and rejects unfinished compilation', () => {
  const m=session('12 .', {eof:true}); assert.equal(m.state,'halted'); assert.equal(output(m),'Thread / 8 Instructions\n12 ');
  const n=session(': unfinished 7 ', {eof:true}); assert.equal(n.state,'halted'); assert.match(output(n),/!E6/);
});
test('bounded bulk memory handles overlap in both directions',()=>{
  const m=expect('7 0 5 fill 9 5 ! 0 1 6 move 0 @ . 1 @ . 6 @ . 1 0 6 move 5 @ . 44 4095 1 pfill 4095 p@ . 0 4096 0 fill', '7 7 9 9 44 ');
  assert.match(send(m,'0 4095 2 fill '),/!E3/);
  assert.match(send(m,'0 0 65535 move '),/!E3/);
  assert.equal(send(m,'4095 p@ . '),'44 ');
});
test('strings compile natively and dictionary collisions and shadowing remain sound',()=>{
  expect(': ab 12 ; : ba 19 ; : old ab ; : ab 27 ; old . ab . ba . : greet ." Hello world" ; greet ." !"', '12 27 19 Hello world!');
});
