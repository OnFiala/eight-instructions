// Lossless materialization of the released generic BF artifact. No guest input.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const source=gunzipSync(await readFile(new URL('dist/kernel.bf.gz',root)));
const map=JSON.parse(await readFile(new URL('dist/kernel-map.json',root),'utf8'));
if(createHash('sha256').update(source).digest('hex')!==map.sha256||!/^[><+\-.,\[\]]+\n?$/.test(source.toString()))throw Error('Released BF artifact identity or dialect mismatch');
await mkdir(new URL('artifacts/',root),{recursive:true});
await writeFile(new URL('artifacts/kernel.bf',root),source);
console.log(`Materialized ${source.length} literal BF bytes, ${map.sha256}`);
