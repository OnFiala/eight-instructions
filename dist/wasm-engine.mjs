import { Machine } from './engine.mjs';

// A faster backend for the same generic operations. Packing never sees guest code.
export class WasmMachine extends Machine {
  constructor(program, module, options = {}) {
    super(program, options);
    const tapeBytes = this.tape.byteLength;
    const base = (tapeBytes+7)&~7;
    const deltaBase = base+program.ops.length*32;
    const deltaCount = program.ops.reduce((n,op) => n+(op.deltas?.length ?? 0), 0);
    const pages = Math.max(1, Math.ceil((deltaBase+deltaCount*8)/65536));
    this.memory = new WebAssembly.Memory({initial:pages, maximum:pages});
    this.tape = new Uint16Array(this.memory.buffer, 0, tapeBytes/2);
    const view = new DataView(this.memory.buffer);
    let delta = deltaBase;
    const kinds = {add:0, move:1, affine:2, '[':3, ']':4, ',':5, '.':6, '+':0, '-':0, '>':1, '<':1};
    for (const [i,op] of program.ops.entries()) {
      const n = op.type === 'affine' ? op.direction : op.n ?? (op.type === '+' || op.type === '>' ? 1 : -1);
      const min = op.min ?? (op.type === '<' ? -1 : 0);
      const max = op.max ?? (op.type === '>' ? 1 : 0);
      const fields = [kinds[op.type],n,op.body ?? op.cost,min,max,op.target ?? 0,delta,op.deltas?.length ?? 0];
      if (fields[0] === undefined) throw new Error('Unsupported generic BF operation');
      fields.forEach((value,j) => view.setInt32(base+i*32+j*4,value,true));
      for (const [offset,factor] of op.deltas ?? []) {
        view.setInt32(delta,offset,true); view.setInt32(delta+4,factor,true); delta+=8;
      }
    }
    this.instance = new WebAssembly.Instance(module, {io:{
      memory:this.memory,
      available:() => Number(this.inputAt < this.input.length || this.eof),
      read:() => this.inputAt < this.input.length ? this.input[this.inputAt++] : 0,
      write:byte => {
        if (this.output.length >= this.maxOutput) return 1;
        this.output.push(byte); return 0;
      },
    }});
    this.instance.exports.configure(this.tape.length,base,program.ops.length);
  }
  run({fuel=1e12,blocks=1e8}={}) {
    this.prepareBudget(fuel,blocks);
    const e=this.instance.exports;
    for (const k of ['pc','pointer','steps','blocks','highWater']) e[k].value=this[k];
    const status=e.run(fuel,blocks);
    for (const k of ['pc','pointer','steps','blocks','highWater']) this[k]=e[k].value;
    this.state=['halted','input','budget','error','error'][status];
    if(status===3) throw new RangeError('Tape pointer out of bounds');
    if(status===4) throw new RangeError('Output limit exceeded');
    return this.state;
  }
  inspect() { return {...super.inspect(), backend:'wasm', executorMemoryBytes:this.memory.buffer.byteLength}; }
}
