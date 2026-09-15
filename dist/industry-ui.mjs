import {Client} from './client.mjs';
import {IndustryScene} from './industry-scene.mjs';
import {readIndustry,entityName,entityStatus,processLabel,roadName,diagnostics} from './industry-presentation.mjs';
import {sha256} from './images.mjs';
import {registerExperimentTools} from './webmcp.mjs';

// UI owns selection, unsaved drafts and transport. BF owns source editing,
// compilation, participants, scheduling, messages and every world transition.
const $=id=>document.getElementById(id),encoder=new TextEncoder();
let client,activeClient,world,workspace,busy=false,running=false,started=false,nativeState='off';
let selected={kind:'entity',id:3},lastFrame='',rawLog='',events=[],readHandle=null,instance=0;
let initialImage,comparisonBundle,lastElapsed=0,selectionPending=false;
const sources=new Map(),drafts=new Map(),batchDrafts=new Map(),roadDrafts=new Map();
const scene=new IndustryScene($('city'),{onSelect:selectObject});
scene.ready.catch(e=>notice(`An architectural asset could not load: ${e.message}`,'error'));
const stateCommand='industry-state';
function notice(text,kind=''){$('notice').textContent=text;$('notice').className=`notice ${kind}`;}
function checked(view){if(view.nativeError)throw new Error(`The BF kernel refused this input (error ${view.nativeError}).`);const error=view.events.find(e=>e.kind==='WS-ERROR');if(error)throw new Error(diagnostics[error.values[0]]??`Native error ${error.values[0]}.`);}
function sourceWrite(id,source){const length=encoder.encode(source).length;if(length>65535)throw new Error('The raw input frame is too large.');return `${length} ${id} source-write ${source}`;}
function context(){
  const process=selected.kind==='entity'?world?.processes.find(p=>p.handle===selected.id):null;
  const entity=selected.kind==='entity'?world?.entities.find(e=>e.id===selected.id):null;
  const module=workspace?.modules.find(m=>m.id===(selected.kind==='module'?selected.id:process?.module));
  return {process,entity,module,source:sources.get(module?.id),vehicle:world?.vehicles.find(e=>e.id===selected.id),road:selected.kind==='road'?world?.roads.find(r=>r.id===selected.id):null};
}
function progress(value){
  $('machine-status').textContent=`BF computing · ${(value.elapsedMs/1000).toFixed(1)} s`;
  if(!started)$('boot-detail').textContent=`The actual BF machine is working · ${(value.elapsedMs/1000).toFixed(1)} s in this operation.`;
}
function record(input,result){rawLog+=`\n> ${input}\n${result.output??''}`;$('raw-output').textContent=rawLog.slice(-180000);}
async function execute(source,{target=client,recording=true}={}){
  activeClient=target;let r=await target.request('execute',{source}),output=r.output??'',elapsed=r.elapsedMs??0;
  // Continue a finite raw operation across executor budgets. A user-requested
  // pause is never automatically resumed. No guest process is chosen here.
  for(let budget=0;r.state==='budget'&&r.reason==='limit'&&budget<3;budget++){
    r=await target.request('resume');output+=r.output??'';elapsed+=r.elapsedMs??0;
  }
  r={...r,output,elapsedMs:elapsed,input:source};activeClient=null;
  if(recording)record(source,r);
  if(target===client){nativeState=r.state;lastElapsed=elapsed;}
  return r;
}
function consume(r,{animate=true}={}){
  const view=readIndustry(r.output??'');
  if(view.world){world=view.world;lastFrame=r.output;scene.setState(world,{animate});}
  if(view.workspace)workspace=view.workspace;
  for(const event of view.industryEvents)events.push({...event,instance,input:r.input??'',round:view.world?.tick??world?.tick,roads: event.kind==='I-ROUTE'?structuredClone(view.world?.roads??world?.roads??[]):undefined});
  events=events.slice(-1200);
  const error=view.events.find(e=>e.kind==='WS-ERROR');if(error)notice(diagnostics[error.values[0]]??`Native error ${error.values[0]}.`,'error');
  render();return view;
}
function objectOptions(){
  if(!world)return [];
  const values=world.processes.map(p=>{const e=world.entities.find(e=>e.id===p.handle),m=workspace?.modules.find(m=>m.id===p.module);return {value:`entity:${p.handle}`,text:e?entityName(e):m?.name??`Program ${p.handle}`};});
  const unused=(workspace?.modules??[]).filter(m=>m.alive&&!world.processes.some(p=>p.module===m.id));
  return [...values,...unused.map(m=>({value:`module:${m.id}`,text:`Source · ${m.name}`})),...world.roads.filter(r=>r.id%2===0).map(r=>({value:`road:${r.id}`,text:roadName(r)}))];
}
function controls(){
  const c=context(),ready=started&&!busy&&nativeState==='input',hasSource=!!c.source;
  for(const id of ['step','compare','add-loop','add-van','retire','create-program','terminal-send'])$(id).disabled=!ready;
  $('compare').disabled=!ready||!c.module||!hasSource;
  $('retire').disabled=!ready||!c.process;
  $('delete-module').disabled=!ready||!c.module;
  $('start-module').disabled=!ready||!c.module||!c.module.activeSerial;
  $('add-van').disabled=!ready||!c.entity;
  $('run').disabled=!started||(busy&&!running)||nativeState!=='input'&&!running;
  $('run').textContent=running?'Pause':'Run';$('run').setAttribute('aria-label',running?'Pause after this scheduler round':'Run the city');
  $('start').disabled=!ready;$('start').textContent='Begin construction →';
  $('export').disabled=!started||busy;$('import').disabled=busy;
  $('object-picker').disabled=!world;
  $('editor').disabled=!hasSource||!c.module;
  const draft=hasSource?drafts.get(c.module.id):null,dirty=hasSource&&draft!==undefined&&draft!==c.source.stored;
  const parameter=hasSource&&c.source.parameter?.[1]===1&&!dirty;
  for(const id of ['batch','batch-less','batch-more'])$(id).disabled=!ready||!parameter;
  $('apply').disabled=!ready||(!c.road&&(!hasSource||!c.module));
  $('undo').disabled=!ready||!c.module?.rollbackSerial;
  $('pause-process').disabled=!ready||!c.process||c.process.status>=4;
  $('pause-process').hidden=!c.process||c.process.status>=4;
  $('resume-process').hidden=c.process?.status!==4;$('resume-process').disabled=!ready;
  $('repair-process').hidden=![4,5].includes(c.process?.status);$('repair-process').disabled=!ready;
  $('inspect').disabled=!world;
  $('pause-native').disabled=!busy;$('resume-native').hidden=nativeState!=='budget';
  $('bundle').disabled=!comparisonBundle;
  $('cold-compile').disabled=busy;
}
function render(){
  if(world){
    const values=objectOptions(),key=`${selected.kind}:${selected.id}`;
    if($('object-picker').dataset.options!==JSON.stringify(values)){
      $('object-picker').replaceChildren(...values.map(v=>{const option=document.createElement('option');option.value=v.value;option.textContent=v.text;return option;}));
      $('object-picker').dataset.options=JSON.stringify(values);
    }
    $('object-picker').value=key;
    $('round').textContent=`ROUND ${world.tick}`;
    $('production-count').textContent=`${world.productions} native completions`;
    $('delivery-count').textContent=`${world.deliveries} cargo transfers`;
    const sites=world.entities.filter(e=>e.role===4);
    $('construction-count').textContent=sites.map(e=>`${e.consumed}/${e.constructionGoal}`).join(' · ')+' panels';
    $('mission-detail').textContent=sites.map(e=>`${entityName(e)} ${e.consumed}/${e.constructionGoal}`).join(' · ');
    document.querySelector('.mission').classList.toggle('running',world.tick>0);
    if(!busy)$('machine-status').textContent=nativeState==='budget'?'BF paused inside an operation':running?'Live BF computation':`Ready · round ${world.tick}`;
    $('timing').textContent=`Last native operation: ${(lastElapsed/1000).toFixed(2)} s`;
    $('city').setAttribute('aria-label',`Industrial city at native round ${world.tick}. ${world.deliveries} deliveries. ${sites.map(e=>`${entityName(e)} ${e.consumed} of ${e.constructionGoal} panels`).join('. ')}. Use the object menu for keyboard controls.`);
  }
  if(workspace){
    const roots=new Set(workspace.modules.filter(m=>m.alive).map(m=>m.activeSerial));
    $('memory-count').textContent=`${workspace.memory.liveVersions} / ${workspace.memory.versionCapacity}`;
    $('memory-bar').replaceChildren(...workspace.versions.map(v=>{const el=document.createElement('div');el.className=`arena ${v.state===0?'free':roots.has(v.serial)?'active':'retained'} ${v.uses>1?'reused':''}`;el.title=`Arena ${v.slot}: ${v.state===0?'free':`version ${v.serial}`}; ${v.refs} references; ${v.uses} allocations`;el.setAttribute('aria-label',el.title);return el;}));
    $('memory-detail').textContent=`${workspace.memory.codeWords}/${workspace.memory.codeCapacity} code words · ${world?.processes.length??0}/16 process contexts`;
    $('reused').textContent=`${workspace.versions.filter(v=>v.uses>1).length} reused arenas`;
  }
  renderPanel();controls();
}
function renderPanel(){
  const {entity,process,module,source,vehicle,road}=context();
  $('road-controls').hidden=!road;$('inventory').hidden=!entity||entity.role===5;
  $('source-details').hidden=!!road;$('undo').hidden=!!road;$('batch-controls').hidden=!source?.parameter?.[1]||!!road;
  if(road){
    $('object-title').textContent=roadName(road);$('object-state').textContent=road.open?'Open':'Closed';
    $('object-description').textContent='A real road in the BF graph. Its availability is world data.';
    $('work-title').textContent=road.open?(road.signal?'Open for departures':'Waiting for a green signal'):'Closed to new departures';
    $('work-detail').textContent=`${road.occupancy}/${road.capacity} occupied capacity · ${road.duration} logical travel units · toll ${road.toll}.`;
    $('road-open').checked=roadDrafts.get(road.id)??road.open;$('apply').textContent='Apply road change →';return;
  }
  if(!process&&!module)return;
  $('object-title').textContent=entity?entityName(entity):module?.name??`Program ${process?.handle}`;
  $('object-state').textContent=process?processLabel(process):'Source only';
  $('object-description').textContent=entity?.role===2?'Makes one station panel from two raw units. The delivery batch is controlled by its Thread program.':entity?.role===3?'Carries actual material. Orders, route planning and road reservations run inside BF.':entity?.role===4?'Panels delivered by vans become this station, one native construction step at a time.':entity?.role===1?'Owns a finite stock of raw materials and answers factory requests.':entity?.role===5?'A separate program controls access to its bridge.':'An isolated program with private state, a continuation and a bounded mailbox.';
  const sharing=world.processes.filter(p=>p.module===module?.id).length;
  if(sharing>1)$('object-description').textContent+=` This source is shared by ${sharing} participants; edits affect their next invocations.`;
  $('raw-count').textContent=String(entity?.raw??0);$('panel-count').textContent=String(entity?.panels??0);
  $('work-title').textContent=entity?entityStatus(entity,process,vehicle):process?processLabel(process):'No process uses this source';
  $('work-detail').textContent=entity?.role===3?`${entity.cargo} ${entity.cargoKind===2?'panels':entity.cargoKind===1?'raw units':'units of cargo'} · ${process.mail}/4 messages waiting.`:entity?.role===4?`${entity.consumed}/${entity.constructionGoal} panels installed · ${entity.panels} waiting.`:process?`${process.mail}/4 messages waiting · ${process.quanta} execution turns.${process.fault?` Fault ${process.fault}.`:''}${!entity?` Private state: ${(process.private??[]).join(', ')}.`:''}`:'You can edit it or release its unused source and versions below.';
  $('module-name').textContent=module?.name??'—';$('active-version').textContent=`v${module?.activeSerial??'—'}`;
  $('apply').textContent='Apply program →';
  if(source){
    const text=drafts.get(module.id)??source.stored;if($('editor').value!==text)$('editor').value=text;
    $('stored-source').textContent=source.stored;$('active-source').textContent=source.active;
    $('source-state').textContent=text!==source.stored?'Unsaved editor draft':source.stored!==source.active?'Stored in BF · not active':'Stored in BF · matches active version';
    const parameter=source.parameter;
    if(parameter?.[1]){$('batch').min=String(parameter[3]);$('batch').max=String(parameter[4]);$('batch').value=String(batchDrafts.get(module.id)??parameter[2]);}
    $('batch-help').textContent=text!==source.stored?'Your custom draft is preserved. Apply it before using this control.':`Set the program’s batch value to ${batchDrafts.get(module.id)??parameter?.[2]}. BF edits and compiles that one literal; other source stays intact. New invocations use it. Existing orders keep their quantity.`;
  }else{$('editor').value='';$('source-state').textContent='Reading this source from BF…';}
}
async function hydrate(object=selected){
  if(object.kind==='road'||nativeState!=='input')return;
  const input=object.kind==='entity'?`${object.id} industry-inspect`:`${object.id} source-read ${object.id} 3 mf w@ dup if serial-of version-source else drop then ${object.id} module-parameter`;
  const r=await execute(input),view=readIndustry(r.output);checked(view);
  const control=view.control,id=object.kind==='module'?object.id:control?.[1],stored=view.sources.get(id);
  if(id===undefined||stored===undefined)throw new Error('BF did not return this stored source.');
  if(object.kind==='entity'&&view.versionSource===undefined)throw new Error('BF did not return the active source.');
  sources.set(id,{stored,active:view.versionSource??'',parameter:view.parameter,control});
  if(!drafts.has(id))drafts.set(id,stored);readHandle=`${object.kind}:${object.id}`;render();
}
async function flushSelection(){
  while(selected.kind!=='road'&&nativeState==='input'&&(selectionPending||readHandle!==`${selected.kind}:${selected.id}`)){
    selectionPending=false;const object={...selected};await hydrate(object);if(object.id!==selected.id||object.kind!==selected.kind)selectionPending=true;
  }
}
async function refresh({animate=false,source=false}={}){
  const r=await execute(stateCommand);if(r.state!=='input'){consume(r);return;}
  const v=consume(r,{animate});if(!v.world||!v.workspace)throw new Error('The machine did not emit a complete industrial workspace.');
  if((selected.kind==='entity'&&!world.processes.some(p=>p.handle===selected.id))||(selected.kind==='module'&&!workspace.modules.some(m=>m.alive&&m.id===selected.id))){selected={kind:'entity',id:world.processes[0]?.handle??3};scene.selectObject(selected);selectionPending=true;}
  if(source)selectionPending=true;
  await flushSelection();
}
async function action(work,{stop=true}={}){
  if(busy)return;if(stop)running=false;busy=true;controls();
  try{return await work();}catch(e){running=false;notice(e.message,'error');throw e;}
  finally{busy=false;activeClient=null;render();if(selectionPending&&nativeState==='input')action(flushSelection,{stop:false}).catch(()=>{});}
}
function bind(id,fn){$(id).addEventListener('click',()=>Promise.resolve().then(fn).catch(e=>{notice(e.message,'error');console.error(e);}));}
function selectObject(object){
  selected=object;scene.selectObject(object);selectionPending=object.kind!=='road';render();
  if(!busy&&nativeState==='input')action(flushSelection,{stop:false}).catch(()=>{});
}
$('object-picker').addEventListener('change',()=>{const [kind,id]=$('object-picker').value.split(':');selectObject({kind,id:Number(id)});});
$('editor').addEventListener('input',()=>{const c=context();if(c.module){drafts.set(c.module.id,$('editor').value);batchDrafts.delete(c.module.id);renderPanel();controls();}});
$('batch').addEventListener('input',()=>{const c=context();if(c.module)batchDrafts.set(c.module.id,$('batch').value);renderPanel();notice('Batch draft changed. Apply it to ask BF to edit and compile the stored source.');});
for(const [id,delta] of [['batch-less',-1],['batch-more',1]])bind(id,()=>{const c=context();if(!c.module)return;$('batch').value=String(Number($('batch').value)+delta);$('batch').dispatchEvent(new Event('input'));});
$('road-open').addEventListener('change',()=>roadDrafts.set(selected.id,$('road-open').checked));
for(const [id,delta] of [['zoom-in',.12],['zoom-out',-.12]])bind(id,()=>scene.camera(delta));bind('camera-reset',()=>scene.resetCamera());

async function installImage(image,{fresh=false}={}){
  const candidate=new Client({onProgress:progress});let accepted=false;
  try{
    let status=await candidate.request('load',{image});
    for(let n=0;status.state==='budget'&&n<4;n++)status=await candidate.request('resume');
    if(status.state!=='input')throw new Error('The imported continuation has not reached a readable input boundary. The current machine was retained.');
    const frame=await execute(stateCommand,{target:candidate,recording:false}),view=readIndustry(frame.output);checked(view);
    if(frame.state!=='input'||!view.world||!view.workspace)throw new Error('The image does not contain a complete Build 003 industrial workspace.');
    const handle=view.world.processes.find(p=>p.handle===3)?.handle??view.world.processes[0]?.handle;
    const detail=await execute(`${handle} industry-inspect`,{target:candidate,recording:false}),dv=readIndustry(detail.output);checked(dv);
    if(!dv.control||dv.sources.get(dv.control[1])===undefined||dv.versionSource===undefined)throw new Error('The candidate cannot restore its native source editor.');
    client?.close();client=candidate;accepted=true;instance++;events=[];rawLog='';sources.clear();drafts.clear();batchDrafts.clear();roadDrafts.clear();comparisonBundle=null;
    selected={kind:'entity',id:handle};scene.selectObject(selected);nativeState='input';started=true;readHandle=`entity:${handle}`;selectionPending=false;
    const id=dv.control[1],stored=dv.sources.get(id);sources.set(id,{stored,active:dv.versionSource,parameter:dv.parameter,control:dv.control});drafts.set(id,stored);
    initialImage=image;lastElapsed=(frame.elapsedMs??0)+(detail.elapsedMs??0);record(stateCommand,frame);record(`${handle} industry-inspect`,detail);consume(frame,{animate:false});$('boot').hidden=true;
    notice(fresh?'Ready. Begin construction, or select an object to change its program.':'Workspace restored. Sources, messages, stock and unfinished work came from the image. Earlier event history is unavailable.','success');
  }finally{if(!accepted)candidate.close();}
}
async function boot(cold=false){
  await action(async()=>{
    $('boot').hidden=false;
    if(cold){
      const candidate=new Client({onProgress:progress});
      try{activeClient=candidate;let r=await candidate.request('boot',{system:'industry-system.json'}),out=r.output??'';
        for(let n=0;r.state==='budget'&&r.reason==='limit'&&n<4;n++){r=await candidate.request('resume');out+=r.output??'';}
        if(r.state!=='input'||/!E\d|WS-ERROR/.test(out))throw new Error('Native source compilation did not complete.');
        await installImage((await candidate.request('save')).image,{fresh:true});
      }finally{candidate.close();}
    }else{const response=await fetch('./initial-industry.8i');if(!response.ok)throw new Error('The native initial image is unavailable.');await installImage(await response.text(),{fresh:true});}
    const map=await fetch('./kernel-map.json').then(r=>r.json());$('tape').textContent=`BF tape: ${map.dialect.tape_cells.toLocaleString()} × 16 bits`;
  }).catch(e=>{$('boot-detail').textContent=e.message;$('cold-start').hidden=false;});
}
bind('cold-start',()=>boot(true));bind('cold-compile',()=>boot(true));
async function advance(){const r=await execute(`process-step ${stateCommand}`);consume(r);if(r.state!=='input')running=false;await flushSelection();}
async function run(){
  if(running){running=false;controls();return;}
  if(busy||!started)return;running=true;controls();
  while(running&&nativeState==='input'){
    try{await action(advance,{stop:false});}catch{break;}
    await new Promise(resolve=>setTimeout(resolve,30));
  }
  controls();
}
bind('start',run);bind('run',run);bind('step',()=>action(advance));
bind('apply',()=>action(async()=>{
  const c=context();
  if(c.road){const open=roadDrafts.get(c.road.id)??c.road.open;const r=await execute(`${open?1:0} ${c.road.id} industry-open`);checked(consume(r));roadDrafts.delete(c.road.id);await refresh();notice('BF accepted the road change. Vehicles already travelling keep their captured segment.','success');return;}
  const id=c.module.id,text=drafts.get(id)??c.source.stored;
  try{
    if(batchDrafts.has(id)&&text===c.source.stored){const value=String(batchDrafts.get(id));if(!/^\d+$/.test(value))throw new Error('Enter a whole number for the batch size.');const r=await execute(`${value} ${id} parameter!`);checked(consume(r));}
    else{const saved=await execute(sourceWrite(id,text));checked(consume(saved));if(!/SOURCE-STORED/.test(saved.output))throw new Error('BF did not acknowledge stored source.');const compiled=await execute(`${id} module-compile`);checked(consume(compiled));}
    drafts.delete(id);batchDrafts.delete(id);
  }finally{if(nativeState==='input')await refresh({source:true});}
  notice('BF stored, compiled and published the new version. Suspended calls keep their old version; new invocations adopt this one.','success');
}));
bind('undo',()=>action(async()=>{const c=context();checked(consume(await execute(`${c.module.id} module-rollback`)));drafts.delete(c.module.id);batchDrafts.delete(c.module.id);await refresh({source:true});notice('Previous active version restored. Stored draft and active source are shown separately; the world was retained.','success');}));
for(const [id,command] of [['pause-process','process-pause'],['resume-process','process-resume'],['repair-process','industry-repair']])bind(id,()=>action(async()=>{const handle=selected.id;checked(consume(await execute(`${handle} ${command}`)));await refresh({source:true});notice(command==='industry-repair'?'Program continuation repaired. Private state, messages and owned material were retained.':'BF accepted the process state change.','success');}));
bind('retire',()=>action(async()=>{checked(consume(await execute(`${selected.id} industry-retire`)));await refresh({source:true});notice('BF released the unused process context. Its source module remains available.','success');}));
bind('delete-module',()=>action(async()=>{
  const id=context().module.id;checked(consume(await execute(`${id} module-delete`)));
  sources.delete(id);drafts.delete(id);batchDrafts.delete(id);selected={kind:'entity',id:world.processes[0]?.handle??3};scene.selectObject(selected);
  await refresh({source:true});notice('BF released this unused module and reclaimed its unreferenced versions.','success');
}));
bind('start-module',()=>action(async()=>{
  const v=consume(await execute(`${context().module.id} process-create drop`));checked(v);
  const id=v.industryEvents.find(e=>e.kind==='PROCESS-CREATED')?.values[0];
  if(id!==undefined){selected={kind:'entity',id};scene.selectObject(selected);}
  await refresh({source:true});notice('BF created a fresh participant with its own state and mailbox.','success');
}));
bind('add-van',()=>action(async()=>{const node=context().entity.node;checked(consume(await execute(`3 ${node} 3 industry-create`)));await refresh();notice('A new van process was created by BF. Its compatible program is shared; state and mailbox are private.','success');}));
async function createProgram(name,source){
  let v=consume(await execute(`${encoder.encode(name).length} process-module ${name}`));checked(v);const id=v.events.find(e=>e.kind==='MODULE-CREATED')?.values[0];
  if(id===undefined)throw new Error('BF did not allocate a module.');
  let handle;
  try{
    checked(consume(await execute(sourceWrite(id,source))));checked(consume(await execute(`${id} module-compile`)));
    const created=consume(await execute(`${id} process-create drop`));checked(created);handle=created.industryEvents.find(e=>e.kind==='PROCESS-CREATED')?.values[0];
    if(handle===undefined)throw new Error('BF did not acknowledge a new process.');
    selected={kind:'entity',id:handle};scene.selectObject(selected);selectionPending=true;
    await refresh({source:true});return handle;
  }catch(error){
    if(handle===undefined&&nativeState==='input'){
      checked(consume(await execute(`${id} module-delete`)));
      sources.delete(id);drafts.delete(id);batchDrafts.delete(id);await refresh();
    }
    throw error;
  }
}
bind('add-loop',()=>action(async()=>{await createProgram('loop.thread',': loop.thread schema# 1 begin 0 until ;');notice('The looping program is live. Step or run the city to see other programs continue. Pause it, edit its source, then repair its continuation.','success');}));
$('create-form').addEventListener('submit',e=>{e.preventDefault();action(()=>createProgram($('new-name').value,$('new-source').value)).catch(()=>{});});
function download(name,text){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
bind('export',()=>action(async()=>{download(`eight-instructions-003-round-${world?.tick??0}.8i`,(await client.request('save')).image);notice('Whole BF workspace exported. Unsaved editor drafts are not part of the machine; apply them first if you want them in the snapshot.','success');}));
$('import').addEventListener('change',e=>{const file=e.target.files[0];e.target.value='';if(!file)return;action(async()=>{if(file.size>8e6)throw new Error('Image exceeds the input limit.');await installImage(await file.text());}).catch(e=>notice(`Import refused; the usable workspace was retained. ${e.message}`,'error'));});
bind('pause-native',async()=>{running=false;await (activeClient??client)?.request('pause');notice('BF pause requested. Resume this exact continuation before submitting another native action.');});
bind('resume-native',()=>action(async()=>{const r=await client.request('resume');nativeState=r.state;record('(resume exact BF continuation)',r);consume(r);if(r.state==='input')await refresh({source:true});}));
$('terminal-form').addEventListener('submit',e=>{e.preventDefault();action(async()=>{consume(await execute($('terminal-input').value));if(nativeState==='input')await refresh({source:true});}).catch(()=>{});});

bind('inspect',()=>{
  const c=context(),handle=c.process?.handle;
  $('inspect-title').textContent=c.road?roadName(c.road):c.entity?entityName(c.entity):c.module?.name??'Native evidence';
  const related=events.filter(e=>e.instance===instance&&((['I-ROUTE','I-DEPART','I-ARRIVE','LOAD','UNLOAD','BUILD','PRODUCE','PROCESS-FAULT'].includes(e.kind)&&e.values[0]===handle)||(e.kind==='SEND'&&(e.values[1]===handle||e.values[2]===handle))||(e.kind==='RECEIVE'&&e.values[1]===handle)));
  $('inspect-summary').textContent=related.length?'Current-instance events below are actual BF output. Road inputs accompany each recorded route. Saved state is shown separately.':'No event history for this object is available in this instance. The saved native state below is current; prior messages and decisions are not reconstructed.';
  $('inspect-output').textContent=related.slice(-30).map(e=>`> ${e.input}\n${e.roads?e.roads.map(r=>`ROAD ${r.id} ${r.from} ${r.to} ${r.duration} ${r.toll} ${Number(r.open)}`).join('\n')+'\n':''}${e.raw}`).join('\n\n')+'\n\nCURRENT NATIVE FRAME\n'+lastFrame;
  $('inspect-dialog').showModal();
});bind('close-inspect',()=>$('inspect-dialog').close());
async function identities(){
  const paths=['kernel.bf.gz','kernel-map.json','executor.wasm','engine.mjs','wasm-engine.mjs','worker.mjs','images.mjs','programs/industry-system.json','programs/core.thread','programs/workspace.thread','programs/process-state.thread','programs/processes.thread','programs/industry-state.thread','programs/industry.thread','programs/industry-view.thread','programs/industry-boot.thread'];
  const pairs=await Promise.all(paths.map(async path=>{const r=await fetch(new URL(path,import.meta.url));if(!r.ok)throw new Error(`Missing artifact ${path}`);return [path,await sha256(new Uint8Array(await r.arrayBuffer()))];}));
  return {kernelSha256:(await fetch('./kernel-map.json').then(r=>r.json())).sha256,artifactSha256:Object.fromEntries(pairs)};
}
bind('compare',()=>action(async()=>{
  const c=context(),id=c.module.id,count=Number($('compare-rounds').value);
  if(!Number.isInteger(count)||count<1||count>200)throw new Error('Use 1–200 logical rounds.');
  const text=drafts.get(id)??c.source.stored,useParameter=batchDrafts.has(id)&&text===c.source.stored;
  const image=(await client.request('save')).image,runs=[],views=[];comparisonBundle=null;$('comparison-results').replaceChildren();
  for(const [label,setup] of [
    ['Active program',[sourceWrite(id,c.source.active),`${id} module-compile`]],
    ['Your draft',useParameter?[`${batchDrafts.get(id)} ${id} parameter!`]:[sourceWrite(id,text),`${id} module-compile`]],
  ]){
    const worker=new Client({onProgress:v=>$('comparison-status').textContent=`Fresh BF calculation: ${label} · ${(v.elapsedMs/1000).toFixed(1)} s in this operation`});
    try{
      await worker.request('load',{image});const inputs=[...setup,...Array(count).fill('process-step'),stateCommand],expectedOutputs=[];
      for(let i=0;i<inputs.length;i++){const r=await execute(inputs[i],{target:worker,recording:false});if(r.state!=='input')throw new Error('Comparison paused before a complete native result.');checked(readIndustry(r.output));expectedOutputs.push(r.output);$('comparison-status').textContent=`${label}: native input ${i+1}/${inputs.length}`;}
      const v=readIndustry(expectedOutputs.at(-1));views.push({label,world:v.world});runs.push({label,inputs,expectedOutputs});
    }finally{worker.close();}
  }
  comparisonBundle={schema:'8i-replay-1',build:'003',...await identities(),initialImage:image,runs,sourceVariants:[{source:text,sha256:await sha256(text)}],instructions:'Use the corresponding Build003 checkout and identical artifact hashes. Run node tools/replay.mjs bundle.json. The CLI restores this opaque image in fresh BF machines and checks every expected output byte.'};
  $('comparison-results').replaceChildren(...views.map(({label,world:w})=>{const el=document.createElement('div');el.className='compare-card';const title=document.createElement('strong'),p=document.createElement('p');title.textContent=label;p.textContent=`Round ${w.tick}: ${w.deliveries} deliveries; ${w.productions} production completions; station panels ${w.entities.filter(e=>e.role===4).map(e=>`${e.consumed}/${e.constructionGoal}`).join(' and ')}. Native material account ${w.account[4]}/${w.account[0]}.`;el.append(title,p);return el;}));
  $('comparison-status').textContent='Recorded results of fresh BF computations from the same snapshot. This is a logical-state comparison, not a claim of faster execution.';
}));
bind('bundle',()=>download('eight-instructions-003-comparison.json',JSON.stringify(comparisonBundle,null,2)+'\n'));
const unregister=registerExperimentTools({context:navigator.modelContext,runSource:source=>{if(!started||busy)throw new Error('The visible machine is unavailable.');return action(async()=>{const r=await execute(source);consume(r);if(r.state==='input')await refresh({source:true});return r;});},readState:()=>client?.request('inspect')??{state:'off'},reportError:e=>console.info('Optional WebMCP unavailable:',e.message)});
window.addEventListener('pagehide',()=>{running=false;client?.close();scene.close();unregister();},{once:true});
boot();
