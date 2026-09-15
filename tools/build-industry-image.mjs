// Build a boot-only opaque image by running the actual BF compiler. No jobs,
// routes, production or construction are precomputed. New inputs run live BF.
import {readFile,writeFile} from 'node:fs/promises';
import {loadKernel,loadLibraries,execute} from '../runtime/system.mjs';
import {encodeImage,sha256} from '../dist/images.mjs';
import {atomicWrite} from '../runtime/files.mjs';
const kernel=await loadKernel(),source=await loadLibraries('industry-system.json');
const machine=kernel.create(),start=performance.now();
execute(machine,source+'\n',{fuel:8e14,blocks:1e11});
const output=new TextDecoder().decode(machine.drain());
if(machine.state!=='input'||/!E\d|WS-ERROR/.test(output))throw new Error(`Native boot refused: ${output}\n${JSON.stringify(machine.inspect())}`);
const image=await encodeImage(machine,kernel.programHash);
await atomicWrite('dist/initial-industry.8i',image);
const receipt={purpose:'An opaque image after BF compiled raw sources and accepted initial map/inventory input. Zero scheduler rounds; no application solution is precomputed.',kernel:kernel.programHash,sourceSha256:await sha256(source),imageSha256:await sha256(image),bootMs:performance.now()-start,output,inspect:machine.inspect()};
await writeFile('records/003/initial-image.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));
