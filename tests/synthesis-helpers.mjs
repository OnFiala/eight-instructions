import assert from 'node:assert/strict';
import {loadLibraries,execute} from '../runtime/system.mjs';
import {kernel,command} from './system-helpers.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';
export {kernel};
export const run=(m,s,options={})=>command(m,s,{fuel:8e14,blocks:8e10,...options});
let image;
export async function district({raw=18,goal=2,duration=1,batch=1}={}){
  if(!image){
    const m=kernel.create();
    run(m,await loadLibraries('synthesis-system.json'));
    image=await encodeImage(m,kernel.programHash);
  }
  const m=await decodeImage(image,{program:kernel.program,programHash:kernel.programHash,create:kernel.create});
  run(m,'workspace-large 32 process-slice!');
  const sources=[
    ['depot.thread','schema# 1 recv if swap 1 = if authorize else drop drop then else drop drop drop then dispatch'],
    ['factory.thread',`schema# 1 recv if swap dup 3 = if drop accept else 1 = if authorize else drop drop then then else drop drop drop then ${batch} request work dispatch`],
    ['van.thread','schema# 1 recv if swap 2 = if claim else drop drop then else drop drop drop then 0 drive service'],
    ['station.thread','schema# 1 recv if swap 3 = if accept else drop drop then else drop drop drop then build'],
  ];
  for(const [id,[name,body]] of sources.entries()){
    const source=`: ${name} ${body} ;`;
    run(m,`${name.length} process-module ${name}\n${source.length} ${id} source-write ${source}\n${id} module-compile`);
  }
  const output=run(m,`1 0 0 process-create industry-add
2 0 1 process-create industry-add
3 0 2 process-create industry-add
4 1 3 process-create industry-add
${raw} 1 3 ef w! ${raw} world-supply !
1 1 9 ef w! 4 1 10 ef w! ${batch} 1 17 ef w!
${goal} 3 20 ef w!
0 1 ${duration} 0 industry-road 1 0 ${duration} 0 industry-road
0 19200 w! 0 19201 w! 20 19202 w! 0 19203 w!
1 world-ready ! industry-account`);
  assert.match(output,new RegExp(`ACCOUNT ${raw} ${raw} 0 0 ${raw} 1`));
  run(m,'1 1 autonomy-module');
  return m;
}
export function field(m,index){return Number(run(m,`${index} s@ .`).trim());}
