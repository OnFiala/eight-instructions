import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {compile,Machine} from '../dist/engine.mjs';
import {WasmMachine} from '../dist/wasm-engine.mjs';
import {sha256} from '../dist/images.mjs';
const root=new URL('../',import.meta.url);
let loaded;
export async function loadLibraries(manifest='system.json') {
  if(!/^[a-z0-9-]+\.json$/.test(manifest))throw new Error('Invalid source manifest name');
  const boot=JSON.parse(await readFile(new URL('programs/'+manifest,root),'utf8'));
  if(!Array.isArray(boot.libraries)||boot.libraries.length>16||boot.libraries.some(n=>typeof n!=='string'||!/^[a-z0-9-]+\.thread$/.test(n)))throw new Error('Invalid raw source manifest');
  return (await Promise.all(boot.libraries.map(name=>readFile(new URL('programs/'+name,root),'utf8')))).join('\n');
}
export function loadKernel() {
  return loaded??= (async()=>{
    const [archive,mapBytes,wasmBytes,libraries]=await Promise.all([
      readFile(new URL('dist/kernel.bf.gz',root)),readFile(new URL('dist/kernel-map.json',root)),
      readFile(new URL('dist/executor.wasm',root)),loadLibraries(),
    ]);
    const source=gunzipSync(archive,{maxOutputLength:160*1024*1024}).toString('utf8');
    const map=JSON.parse(mapBytes),programHash=await sha256(source);
    if(programHash!==map.sha256)throw new Error('Kernel artifact hash mismatch');
    const program=compile(source),module=new WebAssembly.Module(wasmBytes);
    return {map,program,programHash,libraries,
      create:(cells=map.dialect.tape_cells,backend='wasm')=>{
        if(cells!==map.dialect.tape_cells)throw new Error('Image tape size is incompatible with this kernel');
        return backend==='js'?new Machine(program,{cells}):new WasmMachine(program,module,{cells});
      },
    };
  })();
}
export function execute(m,text,{eof=false,fuel=1e14,blocks=1e10}={}) {
  m.feed(new TextEncoder().encode(text),{eof});
  return m.run({fuel,blocks});
}
