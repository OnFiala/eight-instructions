// Deterministic file packaging only. No guest computation or expected-output generation.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256} from '../dist/images.mjs';
const manifest=JSON.parse(await readFile('programs/industry-system.json','utf8'));
if(!Array.isArray(manifest.libraries)||manifest.libraries.some(n=>!/^[a-z0-9-]+\.thread$/.test(n)))throw new Error('Invalid source manifest');
const paths=['kernel.bf.gz','kernel-map.json','executor.wasm','engine.mjs','wasm-engine.mjs','worker.mjs','images.mjs','programs/industry-system.json',...manifest.libraries.map(n=>'programs/'+n)];
const readme='8 Instructions — Build003 native reproduction\n\nRequires Node.js22+. No npm install, network, backend or API key.\nRun: node tools/replay.mjs dist/reproduction/build-003.json\nThe CLI checks artifact hashes, restores a new BF machine for each branch,\nfeeds the recorded inputs and compares every expected native output byte.\nThe included gzip kernel is actual BF, not host application code.\nExpected output is evidence only. Source and interpreter identities are in the JSON.\n\nInteractive snapshot: node runtime/cli.mjs --load dist/initial-industry.8i\nCold boot: node runtime/cli.mjs --industry --fuel 5e14 --blocks 5e10\n\nOriginal repository: https://github.com/OnFiala/eight-instructions\n';
await mkdir('.local',{recursive:true});
await writeFile('.local/reproduction-README.txt',readme);
const files=['package.json','runtime/system.mjs','runtime/cli.mjs','runtime/files.mjs','runtime/diagnostics.mjs','tools/replay.mjs','dist/initial-industry.8i','dist/reproduction/build-003.json',...paths.map(p=>'dist/'+p),'programs/system.json','programs/industry-system.json'];
// runtime/system loads the historical raw default manifest even for --load.
const defaults=JSON.parse(await readFile('programs/system.json','utf8'));
if(!Array.isArray(defaults.libraries)||defaults.libraries.some(n=>!/^[a-z0-9-]+\.thread$/.test(n)))throw new Error('Invalid default manifest');
files.push(...new Set([...manifest.libraries,...defaults.libraries].map(n=>'programs/'+n)));
execFileSync('python3',['-c',`import sys,zipfile\nwith zipfile.ZipFile(sys.argv[1],'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:\n for p in sys.argv[2:]:\n  name='README.txt' if p=='.local/reproduction-README.txt' else p\n  info=zipfile.ZipInfo(name,date_time=(1980,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED\n  z.writestr(info,open(p,'rb').read())`,'dist/reproduction/build-003.zip','.local/reproduction-README.txt',...new Set(files)]);
console.log(JSON.stringify({bundleSha256:await sha256(await readFile('dist/reproduction/build-003.zip'))}));
