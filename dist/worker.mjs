import {compile} from './engine.mjs';
import {WasmMachine} from './wasm-engine.mjs';
import {sha256,encodeImage,decodeImage} from './images.mjs';

// Only raw input, generic execution, machine images and inspection cross this worker.
let assets, machine, active=false, pauseRequested=false;
const bytes=text=>new TextEncoder().encode(text);
async function readAsset(path,type='text') {
  const response=await fetch(new URL(path,import.meta.url));
  if(!response.ok)throw new Error(`Could not load ${path}: HTTP ${response.status}`);
  return type==='bytes'?response.arrayBuffer():type==='json'?response.json():response.text();
}
async function loadAssets() {
  if(assets)return assets;
  const [compressed,map,wasm,boot]=await Promise.all([
    readAsset('kernel.bf.gz','bytes'),readAsset('kernel-map.json','json'),
    readAsset('executor.wasm','bytes'),readAsset('programs/system.json','json'),
  ]);
  const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
  const source=await new Response(stream).text(),programHash=await sha256(source);
  if(programHash!==map.sha256)throw new Error('Kernel integrity check failed');
  const program=compile(source),module=await WebAssembly.compile(wasm);
  const libraries=(await Promise.all(boot.libraries.map(name=>readAsset('programs/'+name)))).join('\n');
  const create=(cells=map.dialect.tape_cells)=>{
    if(cells!==map.dialect.tape_cells)throw new Error('Image tape size is incompatible with this kernel');
    return new WasmMachine(program,module,{cells});
  };
  return assets={program,programHash,map,libraries,create};
}
function inspect() {
  if(!machine)return {state:'off'};
  return machine.inspect();
}
async function run(id,{blockLimit=3e10,fuelLimit=2e14}={}) {
  const started=performance.now(),initialSteps=machine.steps,initialBlocks=machine.blocks;
  let reported=0,reason='complete';
  while(true) {
    const remainingBlocks=blockLimit-(machine.blocks-initialBlocks),remainingFuel=fuelLimit-(machine.steps-initialSteps);
    if(pauseRequested){if(machine.state==='ready')machine.state='budget';reason='paused';break;}
    if(remainingBlocks<=0||remainingFuel<=0){reason='limit';break;}
    const before=machine.blocks;
    try {machine.run({fuel:remainingFuel,blocks:Math.min(2000000,remainingBlocks)});}
    catch(error) {
      if(error.message!=='Output limit exceeded')throw error;
      machine.state='budget';reason='output-limit';break;
    }
    const elapsed=performance.now()-started;
    if(elapsed-reported>=100) {
      self.postMessage({id,progress:{...inspect(),elapsedMs:elapsed,executedSteps:machine.steps-initialSteps}});
      reported=elapsed;
    }
    if(machine.state!=='budget')break;
    if(machine.blocks===before){reason='limit';break;}
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  return {output:new TextDecoder().decode(machine.drain()),...inspect(),reason,elapsedMs:performance.now()-started,
    executedSteps:machine.steps-initialSteps,executedBlocks:machine.blocks-initialBlocks};
}
async function action(message) {
  if(!message||!Number.isSafeInteger(message.id)||typeof message.type!=='string')throw new Error('Invalid worker request');
  const {id,type}=message;
  if(type==='pause'){pauseRequested=true;return inspect();}
  if(type==='inspect') {
    if(!machine)return inspect();
    const start=message.start??0,count=message.count??16;
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(count)||start<0||count<0||count>256||start+count>machine.tape.length)throw new Error('Invalid tape range');
    return {...inspect(),tapeStart:start,tape:[...machine.tape.slice(start,start+count)]};
  }
  if(active)throw new Error('The machine is busy; pause it before another operation');
  active=true;
  if(['boot','execute','resume','step'].includes(type))pauseRequested=false;
  try {
    if(type==='boot') {
      const a=await loadAssets();machine=a.create();
      machine.feed(bytes(message.bare?'':a.libraries));
      return await run(id);
    }
    if(type==='load') {
      if(typeof message.image!=='string'||message.image.length>8e6)throw new Error('Invalid machine image');
      const a=await loadAssets();
      const restored=await decodeImage(message.image,{program:a.program,programHash:a.programHash,create:a.create});
      machine=restored;return inspect();
    }
    if(!machine)throw new Error('Start the machine first');
    if(type==='execute') {
      if(typeof message.source!=='string'||message.source.length>100000)throw new Error('Source must be text of at most 100,000 characters');
      if(machine.state!=='input')throw new Error('This machine is not waiting for source; resume, restart or load an image');
      machine.feed(bytes(message.source+'\n'));return await run(id);
    }
    if(type==='resume') {
      if(machine.state!=='budget')throw new Error('There is no paused computation to resume');
      return await run(id);
    }
    if(type==='step') {
      if(!Number.isSafeInteger(message.blocks)||message.blocks<1||message.blocks>1000000)throw new Error('Step count must be 1–1,000,000 executor blocks');
      return await run(id,{blockLimit:message.blocks});
    }
    if(type==='save')return {image:await encodeImage(machine,assets.programHash),...inspect()};
    throw new Error('Unknown worker operation');
  } finally {active=false;}
}
self.addEventListener('message',event=>{
  action(event.data).then(result=>self.postMessage({id:event.data.id,result}))
    .catch(error=>self.postMessage({id:event.data?.id,error:error.message}));
});
