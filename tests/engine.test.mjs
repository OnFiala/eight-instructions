import test from 'node:test';
import assert from 'node:assert/strict';
import { compile, Machine } from '../dist/engine.mjs';

function run(source, optimize = true, input = []) {
  const m = new Machine(compile(source, { optimize }), { cells: 128 });
  m.feed(input, { eof: true });
  assert.equal(m.run({ fuel: 1e8 }), 'halted'); return m;
}
test('bracket validation', () => {
  for (const s of ['[', ']', '][', '+[[]']) assert.throws(() => compile(s), SyntaxError);
});
test('uint16 wrap, low-byte output, input pause and EOF', () => {
  const m = new Machine(compile('-,.,.'), { cells: 5 });
  assert.equal(m.run(), 'input'); assert.equal(m.tape[0], 65535);
  m.feed([65]); assert.equal(m.run(), 'input'); assert.deepEqual([...m.drain()], [65]);
  m.feed([], { eof: true }); assert.equal(m.run(), 'halted'); assert.deepEqual([...m.drain()], [0]);
});
test('bounds checks retain intermediate pointer motion', () => {
  for (const s of ['<', '<>', '+[<+>-]']) assert.throws(() => run(s), RangeError);
  assert.doesNotThrow(() => run('[<+>-]'));
});
test('resource budget interrupts a divergent program', () => {
  const m = new Machine(compile('+[]')); assert.equal(m.run({ fuel: 500 }), 'budget'); assert.equal(m.steps, 500);
});
test('optimized loops match literal execution, including instruction counts', () => {
  let seed = 713;
  const random = n => { seed = (Math.imul(seed, 1664525)+1013904223) >>> 0; return seed % n; };
  for (let i = 0; i < 100; i++) {
    const n = random(50), a = random(9), b = random(7);
    const s = '+'.repeat(n)+'[->'+'+'.repeat(a)+'>'+'+'.repeat(b)+'<<]>>[-<<+>>]<<.';
    const fast = run(s), slow = run(s, false);
    assert.deepEqual(fast.tape, slow.tape); assert.deepEqual(fast.output, slow.output);
    assert.equal(fast.steps, slow.steps); assert.equal(fast.pointer, slow.pointer);
  }
  for (const s of ['-[+]', '+++[-]', '[-]', '++[>++[>+<-]<-]']) {
    const a = run(s), b = run(s, false); assert.deepEqual(a.tape,b.tape); assert.equal(a.steps,b.steps);
  }
});
