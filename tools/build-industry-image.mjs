// Build a boot-only opaque image by running the actual BF compiler. No jobs,
// routes, production or construction are precomputed. New inputs run live BF.
import {readFile,writeFile} from 'node:fs/promises';
import {loadKernel,loadLibraries,execute} from '../runtime/system.mjs';
import {encodeImage,sha256} from '../dist/images.mjs';
import {atomicWrite} from '../runtime/files.mjs';
const kernel=await loadKernel(),source=await loadLibraries('industry-system.json');
const check=process.argv.includes('--check');
const machine=kernel.create(),start=performance.now();
execute(machine,source+'\n',{fuel:8e14,blocks:1e11});
const output=new TextDecoder().decode(machine.drain());
if(machine.state!=='input'||/!E\d|WS-ERROR/.test(output))throw new Error(`Native boot refused: ${output}\n${JSON.stringify(machine.inspect())}`);
const image=await encodeImage(machine,kernel.programHash);
const receipt={purpose:'An opaque image after BF compiled raw sources and accepted initial map/inventory input. Zero scheduler rounds; no application solution is precomputed.',kernel:kernel.programHash,sourceSha256:await sha256(source),imageSha256:await sha256(image),bootMs:performance.now()-start,output,inspect:machine.inspect()};
if(check){
  const recorded=JSON.parse(await readFile('records/003/initial-image.json','utf8'));
  const actual=await readFile('dist/initial-industry.8i','utf8');
  if(await sha256(actual)!==receipt.imageSha256||['kernel','sourceSha256','imageSha256','output'].some(key=>recorded[key]!==receipt[key]))throw new Error('Initial image does not reproduce from the released BF artifact and raw Thread input');
  console.log(`Initial image PASS: fresh BF boot reproduces ${receipt.imageSha256}; ${receipt.bootMs.toFixed(2)} ms for this check.`);
}else{
await atomicWrite('dist/initial-industry.8i',image);
await writeFile('records/003/initial-image.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));
}
