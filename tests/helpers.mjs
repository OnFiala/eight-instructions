import { readFileSync } from 'node:fs';
import { compile, Machine } from '../dist/engine.mjs';
export const source = readFileSync(new URL('../artifacts/kernel.bf', import.meta.url), 'utf8');
export const layout = JSON.parse(readFileSync(new URL('../dist/kernel-map.json', import.meta.url), 'utf8'));
export const compiled = compile(source);
export function session(text = '', { eof = false, fuel = 1e13, blocks = 2e8 } = {}) {
  const m = new Machine(compiled, { cells: layout.dialect.tape_cells });
  m.feed(new TextEncoder().encode(text), { eof });
  m.run({ fuel, blocks }); return m;
}
export const output = m => new TextDecoder().decode(m.drain());
export const reg = (m, name) => m.tape[layout.registers[name]];
export function region(m, name, count = layout.arrays[name].size) {
  const a = layout.arrays[name];
  return Array.from({length:count}, (_, i) => m.tape[a.base+i*a.stride+a.value_lane]);
}
export function send(m, text, options = {}) {
  m.feed(new TextEncoder().encode(text)); m.run({fuel:1e13,blocks:2e8,...options}); return output(m);
}
