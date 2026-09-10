// Generic Brainfuck execution only. No guest language or application knowledge.
export const ENGINE_VERSION = 1;
const COMMANDS = new Set('><+-.,[]');

export function compile(source, { optimize = true } = {}) {
  const code = [...source].filter(c => COMMANDS.has(c)).join('');
  const match = new Map(), stack = [];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '[') stack.push(i);
    if (code[i] === ']') {
      if (!stack.length) throw new SyntaxError(`Unmatched ] at ${i}`);
      const j = stack.pop(); match.set(i, j); match.set(j, i);
    }
  }
  if (stack.length) throw new SyntaxError(`Unmatched [ at ${stack.pop()}`);
  const ops = [], locations = new Map();
  for (let i = 0; i < code.length;) {
    const start = i, c = code[i]; locations.set(i, ops.length);
    if (optimize && (c === '+' || c === '-')) {
      let n = 0;
      while (code[i] === '+' || code[i] === '-') n += code[i++] === '+' ? 1 : -1;
      ops.push({ type: 'add', n, cost: i-start, source: start });
    } else if (optimize && (c === '>' || c === '<')) {
      let n = 0, min = 0, max = 0;
      while (code[i] === '>' || code[i] === '<') {
        n += code[i++] === '>' ? 1 : -1; min = Math.min(min, n); max = Math.max(max, n);
      }
      ops.push({ type: 'move', n, min, max, cost: i-start, source: start });
    } else if (optimize && c === '[') {
      const end = match.get(i), deltas = new Map();
      let p = 0, min = 0, max = 0, valid = true;
      for (let j = i+1; j < end; j++) {
        const x = code[j];
        if (x === '>' || x === '<') {
          p += x === '>' ? 1 : -1; min = Math.min(min, p); max = Math.max(max, p);
        } else if (x === '+' || x === '-') deltas.set(p, (deltas.get(p) || 0) + (x === '+' ? 1 : -1));
        else { valid = false; break; }
      }
      if (valid && p === 0 && Math.abs(deltas.get(0)) === 1) {
        ops.push({ type: 'affine', deltas: [...deltas], direction: deltas.get(0),
          min, max, body: end-i, source: start });
        i = end+1;
      } else { ops.push({ type: '[', targetSource: end+1, source: i, cost: 1 }); i++; }
    } else {
      ops.push({ type: c, targetSource: c === '[' ? match.get(i)+1 : c === ']' ? match.get(i)+1 : undefined,
        source: i, cost: 1 }); i++;
    }
  }
  locations.set(code.length, ops.length);
  for (const op of ops) if (op.targetSource !== undefined) op.target = locations.get(op.targetSource);
  return { ops, sourceLength: code.length, optimize };
}

export class Machine {
  constructor(program, { cells = 160000, maxOutput = 1048576 } = {}) {
    if (!Number.isSafeInteger(cells) || cells < 1 || cells > 1000000) throw new RangeError('Invalid tape size');
    this.program = program; this.tape = new Uint16Array(cells);
    this.pc = 0; this.pointer = 0; this.steps = 0; this.blocks = 0; this.highWater = 0;
    this.input = []; this.inputAt = 0; this.eof = false; this.output = [];
    this.maxOutput = maxOutput; this.state = 'ready';
  }
  feed(bytes, { eof = false } = {}) {
    if (this.eof && bytes.length) throw new Error('Input already closed');
    this.input = this.input.slice(this.inputAt).concat(Array.from(bytes)); this.inputAt = 0;
    if (this.input.some(x => !Number.isInteger(x) || x < 0 || x > 255)) throw new TypeError('Input must be bytes');
    this.eof ||= eof;
    if (this.state === 'input') this.state = 'ready';
  }
  bounds(min, max) {
    if (this.pointer+min < 0 || this.pointer+max >= this.tape.length) throw new RangeError('Tape pointer out of bounds');
    this.highWater = Math.max(this.highWater, this.pointer+max);
  }
  run({ fuel = 1e12, blocks = 1e8 } = {}) {
    const limit = this.steps + fuel, blockLimit = this.blocks + blocks;
    this.state = 'running';
    while (this.pc < this.program.ops.length) {
      const op = this.program.ops[this.pc], t = this.tape, p = this.pointer;
      if (op.type === ',' && this.inputAt >= this.input.length && !this.eof) { this.state = 'input'; return this.state; }
      const iterations = op.type === 'affine' ? (op.direction === -1 ? t[p] : (65536-t[p]) & 65535) : 0;
      const cost = op.type === 'affine' ? 1 + iterations * op.body : op.cost;
      if (this.steps + cost > limit || this.blocks >= blockLimit) { this.state = 'budget'; return this.state; }
      this.steps += cost; this.blocks++;
      switch (op.type) {
        case 'add': t[p] += op.n; break;
        case '+': t[p]++; break;
        case '-': t[p]--; break;
        case 'move': this.bounds(op.min, op.max); this.pointer += op.n; break;
        case '>': this.bounds(0, 1); this.pointer++; break;
        case '<': this.bounds(-1, 0); this.pointer--; break;
        case 'affine':
          if (iterations) { this.bounds(op.min, op.max); for (const [d,n] of op.deltas) t[p+d] += iterations*n; }
          break;
        case '[': if (!t[p]) { this.pc = op.target; continue; } break;
        case ']': if (t[p]) { this.pc = op.target; continue; } break;
        case ',': t[p] = this.inputAt < this.input.length ? this.input[this.inputAt++] : 0; break;
        case '.':
          if (this.output.length >= this.maxOutput) throw new RangeError('Output limit exceeded');
          this.output.push(t[p] & 255); break;
        default: throw new Error('Unknown executor operation');
      }
      this.pc++;
    }
    this.state = 'halted'; return this.state;
  }
  drain() { const result = Uint8Array.from(this.output); this.output = []; return result; }
  inspect() {
    return { state: this.state, instruction: this.program.ops[this.pc]?.source ?? this.program.sourceLength,
      pointer: this.pointer, cell: this.tape[this.pointer], steps: this.steps, blocks: this.blocks,
      tapeBytes: this.tape.byteLength, highWaterCell: this.highWater };
  }
}
