import wabtFactory from 'wabt';
import { readFile, writeFile } from 'node:fs/promises';
const wabt = await wabtFactory();
const source = await readFile(new URL('../runtime/executor.wat', import.meta.url), 'utf8');
const module = wabt.parseWat('executor.wat', source);
module.resolveNames(); module.validate();
const { buffer } = module.toBinary({ log: false, write_debug_names: false });
const destination = new URL('../dist/executor.wasm', import.meta.url);
if (process.argv.includes('--check')) {
  const actual = await readFile(destination);
  if (!actual.equals(Buffer.from(buffer))) throw new Error('Non-reproducible executor.wasm');
} else await writeFile(destination, buffer);
console.log(`Generic BF executor: ${buffer.length} bytes`);
