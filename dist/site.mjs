import {Client} from './client.mjs';
import {readPresentation,diagnostics} from './presentation.mjs';
import {CityScene,placeName} from './city-scene.mjs';
import {sha256} from './images.mjs';
import {registerExperimentTools} from './webmcp.mjs';

// UI orchestrates raw input and opaque snapshots. All source, lifetime, routing
// and simulation semantics remain in the guest. No application solver lives here.
const $=id=>document.getElementById(id),encoder=new TextEncoder();
let client,city,workspace,busy=false,running=false,started=false,selectedModule=0,selectedVehicle=0;
let initialImage,comparisonInitialImage,transcriptComplete=true,transcript=[],rawLog='',recentEvents=[],activeSourceSerial,comparisonBundle,identityPromise;
let lastResult,progressAt=0,costEvidence='';
const decisions=new Map();
const scene=new CityScene($('city'),{onSelect:selectVehicle});
scene.ready.catch(error=>notice(`Graphics could not load: ${error.message}`,'error'));
const requestState='city-state workspace-state';
const sourceWrite=(id,source)=>{const length=encoder.encode(source).length;if(length>65535)throw new Error('Source exceeds the 65,535-byte raw input frame. A stored module accepts at most 256 ASCII bytes.');return `${length} ${id} source-write ${source}`;};
const option=(value,text)=>{const o=document.createElement('option');o.value=value;o.textContent=text;return o;};
for(let id=0;id<16;id++)$('job-target').append(option(id,`${id} · ${placeName(id)}`));
$('job-target').value=15;
function notice(text,kind=''){$('notice').textContent=text;$('notice').className=`notice ${kind}`;}
function controls() {
  document.querySelectorAll('.machine-control').forEach(button=>button.disabled=!started||busy);
  $('module-select').disabled=!started||busy;
  $('import').disabled=busy;
  $('run').disabled=!started||busy&&!running;
  $('run').setAttribute('aria-label',running?'Pause city after this logical step':'Run city');
  $('run').querySelector('img').src=`./assets/icons/${running?'pause':'play'}.svg`;
  const module=workspace?.modules.find(m=>m.id===selectedModule);
  $('rollback').disabled=!started||busy||!module?.rollbackSerial;
  $('delete-module').disabled=!started||busy||!module?.alive;
  $('pause-native').disabled=!busy;
  $('resume-native').hidden=lastResult?.state!=='budget';
}
function progress(value) {
  if(performance.now()-progressAt<500)return;progressAt=performance.now();
  $('machine-status').textContent=`BF computing · ${(value.elapsedMs/1000).toFixed(1)} s`;
  if(!started)$('boot-detail').textContent=`Compiling Thread inside BF · ${(value.elapsedMs/1000).toFixed(1)} s elapsed. No city state has been inferred.`;
}
function log(input,result) {
  if(initialImage){transcript.push({input,output:result.output??''});if(result.state!=='input')transcriptComplete=false;}
  rawLog+=`\n> ${input}\n${result.output??''}`;
  $('raw-output').textContent=rawLog.slice(-140000);
}
async function raw(source,{record=true,target=client}={}) {
  const result=await target.request('execute',{source});
  if(record)log(source,result);
  return {...result,rawInput:source};
}
function consume(result,{animate=true}={}) {
  lastResult=result;
  if(result.output) {
    const view=readPresentation(result.output);
    if(view.city){city=view.city;scene.setState(city,{animate});$('city-caption').hidden=false;}
    if(view.workspace)workspace=view.workspace;
    if(view.events.some(e=>e.kind==='COSTS'))costEvidence=view.events.filter(e=>['POLICY','COSTS','EDGE-COST'].includes(e.kind)).map(e=>e.raw).join('\n');
    for(const event of view.events) {
      recentEvents.push(event);if(event.kind==='ROUTE')decisions.set(event.values[2],{event,costEvidence,input:result.rawInput??'(raw native input)',roads:structuredClone(view.city?.roads??city?.roads??[])});
      if(event.kind==='WS-ERROR')notice(`Module unchanged. ${diagnostics[event.values[0]]??`Native error ${event.values[0]}.`}`,'error');
      if(event.kind==='RULE-REJECTED')notice('The rule returned an unusable road score. New departures are paused; existing trips can finish. Edit the rule or undo the change.','error');
    }
    recentEvents=recentEvents.slice(-150);
  }
  if(result.elapsedMs!==undefined)$('execution-time').textContent=`Last native operation: ${(result.elapsedMs/1000).toFixed(2)} s`;
  if(result.cells!==undefined)$('tape-size').textContent=`BF tape: ${result.cells.toLocaleString()} cells`;
  if(result.state==='budget') {running=false;notice('Native execution paused before completion. Resume it before sending another command. The displayed city is the last complete BF frame.','error');}
  render();
}
function selectVehicle(id){selectedVehicle=Number(id);$('vehicle').value=selectedVehicle;scene.select(selectedVehicle);renderCity();}
function renderCity() {
  if(!city)return;
  $('tick').textContent=`STEP ${city.tick}`;
  $('machine-status').textContent=busy?'BF computing…':city.idle?'All current jobs complete':running?'Running · native steps':'Paused · ready for a step';
  const car=city.vehicles.find(v=>v.id===selectedVehicle);
  $('trip').textContent=car?`${placeName(car.node)} → ${placeName(car.goal)}`:'';
  const bridge=city.roads.find(r=>r.from===9&&r.to===10);
  $('bridge').textContent=bridge?.open?'Close Harbor Bridge':'Open Harbor Bridge';
  $('city').setAttribute('aria-label',`Delivery city at logical step ${city.tick}. ${city.vehicles.map(v=>`Van ${v.id+1}: last reached node ${v.node}, destination ${v.goal}, ${v.delivered} deliveries, ${v.edge===null?'stationary':`road ${v.edge}, progress ${v.progress} of ${v.duration}`}`).join('. ')}. Selected van ${selectedVehicle+1}. Its last emitted path: ${car?.path.join(', ')||'none'}.`);
}
function renderWorkspace() {
  if(!workspace)return;
  const current=$('module-select').value;
  $('module-select').replaceChildren(...workspace.modules.filter(m=>m.alive).map(m=>option(m.id,m.name)));
  if(workspace.modules.some(m=>m.alive&&m.id===selectedModule))$('module-select').value=selectedModule;
  else if($('module-select').options.length){selectedModule=Number($('module-select').value);activeSourceSerial=undefined;}
  else $('module-select').append(option(0,'No named modules'));
  const module=workspace.modules.find(m=>m.id===selectedModule),active=workspace.versions.find(v=>v.serial===module?.activeSerial&&v.state===2);
  $('active-version').textContent=active?`v${active.serial}`:'—';
  $('current-explanation').textContent=module?.alive?`Pure road scoring: ${module.inputs} inputs → ${module.outputs} output${module.outputs===1?'':'s'}.`:'No usable module. Create or restore one to compile source.';
  const mem=workspace.memory;$('memory-count').textContent=`${mem.liveVersions} / ${mem.versionCapacity} arenas`;
  const roots=new Set(workspace.modules.filter(m=>m.alive).map(m=>m.activeSerial));
  $('memory-bar').replaceChildren(...workspace.versions.map(v=>{
    const d=document.createElement('div'),status=v.state===0?'free':roots.has(v.serial)?'active':'retained';
    d.className=`memory-arena ${status} ${v.uses>1?'reused':''}`;
    d.title=`Arena ${v.slot}: ${status}; ${v.codeWords} code words; ${v.sourceBytes} source bytes; ${v.pins} pins; ${v.refs} references; ${v.uses} successful allocations.`;
    d.setAttribute('aria-label',d.title);return d;
  }));
  $('memory-bar').setAttribute('aria-label',`${mem.liveVersions} of ${mem.versionCapacity} native module arenas occupied; ${mem.codeWords} of ${mem.codeCapacity} code words; ${mem.sourceBytes} of ${mem.sourceCapacity} version source bytes.`);
  $('memory-reuse').textContent=workspace.versions.some(v=>v.uses>1)?'↻ Arena reused':'Reuse on release';
  $('memory-detail').textContent=`Code ${mem.codeWords}/${mem.codeCapacity} words · version source ${mem.sourceBytes}/${mem.sourceCapacity} B · drafts ${mem.draftBytes}/${mem.draftCapacity} B`;
}
function renderTrace() {
  const stored=recentEvents.findLast(e=>e.kind==='SOURCE-STORED'),published=recentEvents.findLast(e=>e.kind==='MODULE-PUBLISHED'||e.kind==='ROLLBACK'),route=decisions.get(selectedVehicle)?.event;
  const saved=city?.vehicles.find(v=>v.id===selectedVehicle);
  const cards=[stored?['Source stored',`Module ${stored.values[0]} · ${stored.values[1]} bytes`]:['Source in BF','A named, persistent draft'],published?[published.kind==='ROLLBACK'?'Version restored':'Module published',published.raw]:['Ready to compile','The active version remains usable'],route?['Route computed',`v${route.values[5]} · score ${route.values[6]} · step ${route.values[1]}`]:saved?.decision?['Saved decision',`v${saved.decisionVersion} · score ${saved.score} · prior input history not in image`]:['Awaiting a departure','A real route appears after a step']];
  $('trace').replaceChildren(...cards.map(([title,detail],i)=>{const li=document.createElement('li'),number=document.createElement('b'),div=document.createElement('div'),strong=document.createElement('strong'),span=document.createElement('span');number.textContent=i+1;strong.textContent=title;span.textContent=detail;div.append(strong,span);li.append(number,div);return li;}));
  $('trace-mode').textContent='Actual BF output';
}
function render(){renderCity();renderWorkspace();renderTrace();controls();}
async function readActiveSource() {
  const module=workspace?.modules.find(m=>m.id===selectedModule),v=workspace?.versions.find(v=>v.serial===module?.activeSerial&&v.state===2);
  if(!v){$('current-source').textContent='No compiled version';activeSourceSerial=undefined;return;}
  if(activeSourceSerial===v.serial)return;
  const result=await raw(`${v.serial} version-source`),view=readPresentation(result.output);
  $('current-source').textContent=view.versionSource??'Native source unavailable';activeSourceSerial=v.serial;
}
async function refresh({animate=false}={}){consume(await raw(requestState),{animate});await readActiveSource();}
async function action(work,{stop=true}={}) {
  if(busy)return;if(stop)running=false;busy=true;controls();
  try{return await work();}catch(error){running=false;notice(error.message,'error');throw error;}
  finally{busy=false;render();}
}
const bind=(id,handler)=>$(id).addEventListener('click',()=>handler().catch(error=>{notice(error.message,'error');console.error(error);}));
async function boot() {
  if(busy)return;busy=true;started=false;running=false;initialImage=undefined;comparisonInitialImage=undefined;transcriptComplete=true;transcript=[];comparisonBundle=undefined;recentEvents=[];decisions.clear();activeSourceSerial=undefined;controls();
  $('boot-status').hidden=false;$('retry').hidden=true;
  client?.close();client=new Client({onProgress:progress});
  try {
    const result=await client.request('boot',{system:'city-system.json'});log('(boot city-system.json)',result);consume(result);
    if(result.state!=='input'||/!E\d+|WS-ERROR/.test(result.output))throw new Error('The native boot did not complete. Inspect the raw output.');
    await refresh();initialImage=(await client.request('save')).image;comparisonInitialImage=initialImage;
    const first=await raw(`city-step ${requestState}`);consume(first,{animate:false});
    started=true;$('boot-status').hidden=true;
    const map=await fetch('./kernel-map.json').then(r=>r.json());$('tape-size').textContent=`BF tape: ${map.dialect.tape_cells.toLocaleString()} × 16 bits`;
    notice('The first routes were computed inside BF. Edit the source and apply it; the city and moving vans keep their state.');
  }catch(error){$('boot-detail').textContent=error.message;$('retry').hidden=false;notice(error.message,'error');}
  finally{busy=false;render();}
}
async function advance(){consume(await raw(`city-step ${requestState}`));await readActiveSource();}
async function runLoop() {
  if(running){running=false;controls();return;}
  running=true;controls();
  while(running&&started) {
    try{await action(advance,{stop:false});}catch{break;}
    if(city?.idle||lastResult?.state==='budget'){running=false;break;}
    // Wall-clock spacing only. One raw city-step requests one actual guest step.
    await new Promise(resolve=>setTimeout(resolve,680));
  }
  controls();renderCity();
}
bind('run',runLoop);bind('step-city',()=>action(advance));bind('retry',boot);
$('vehicle').addEventListener('change',event=>selectVehicle(event.target.value));
$('module-select').addEventListener('change',()=>action(async()=>{selectedModule=Number($('module-select').value);activeSourceSerial=undefined;await readActiveSource();const r=await raw(`${selectedModule} source-read`);$('module-editor').value=readPresentation(r.output).sources.get(selectedModule)??'';}).catch(()=>{}));
bind('apply',()=>action(async()=>{
  const saved=await raw(sourceWrite(selectedModule,$('module-editor').value));consume(saved);
  if(readPresentation(saved.output).events.some(e=>e.kind==='WS-ERROR')){await refresh();return;}
  if(!readPresentation(saved.output).events.some(e=>e.kind==='SOURCE-STORED'))throw new Error('BF did not acknowledge stored source; compilation was not requested.');
  const result=await raw(`${selectedModule} module-compile`);consume(result);await refresh();
  if(!/WS-ERROR/.test(result.output))notice('New version published. Current road segments retain their original version; new route decisions use the active program.','success');
}));
bind('rollback',()=>action(async()=>{const r=await raw(`${selectedModule} module-rollback`);consume(r);await refresh();if(!/WS-ERROR/.test(r.output))notice('Previous version restored. City data and in-flight road segments are preserved.','success');}));
bind('read-draft',()=>action(async()=>{const r=await raw(`${selectedModule} source-read`);consume(r);const text=readPresentation(r.output).sources.get(selectedModule);if(text!==undefined)$('module-editor').value=text;notice('The editor now contains the draft read from BF memory.');}));
bind('delete-module',()=>action(async()=>{const r=await raw(`${selectedModule} module-delete`);consume(r);await refresh();if(!/WS-ERROR/.test(r.output))notice('Module removed and unreferenced version arenas released by BF.','success');}));
$('create-form').addEventListener('submit',event=>{event.preventDefault();action(async()=>{
  const name=$('new-module').value,r=await raw(`2 1 ${encoder.encode(name).length} module-create ${name}`);consume(r);
  const created=readPresentation(r.output).events.find(e=>e.kind==='MODULE-CREATED');if(created){selectedModule=created.values[0];activeSourceSerial=undefined;$('module-editor').value=`: ${name}\n  +\n;`;}
  await refresh();
}).catch(()=>{});});
bind('bridge',()=>action(async()=>{const open=city.roads.find(r=>r.from===9&&r.to===10)?.open;consume(await raw(`${open?0:1} bridge-state ${requestState}`));notice('Road data changed in BF. This is a separate experiment from changing code.');}));
$('job-form').addEventListener('submit',event=>{event.preventDefault();action(async()=>{consume(await raw(`${Number($('job-target').value)} ${selectedVehicle} city-job ${requestState}`));notice('Destination assigned inside BF. Advance the city to compute the next route.');}).catch(()=>{});});
function download(name,text,type='application/json') {
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
bind('export',()=>action(async()=>{const result=await client.request('save');download(`eight-instructions-002-step-${city?.tick??'paused'}.8i`,result.image);notice('Whole workspace exported. Import the file into a new instance to continue.','success');}));
$('import').addEventListener('change',async event=>{
  const file=event.target.files[0];event.target.value='';if(!file)return;
  await action(async()=>{
    if(file.size>8e6)throw new Error('Machine image is too large.');
    const image=await file.text(),candidate=new Client({onProgress:progress});let accepted=false;
    try {
      const state=await candidate.request('load',{image});
      if(state.state!=='input')throw new Error('This city interface imports images waiting at a complete input boundary. Use the CLI to resume a machine paused inside a native operation.');
      const r=await raw(requestState,{target:candidate,record:false}),view=readPresentation(r.output);
      if(!view.city||!view.workspace)throw new Error('The image is compatible with the kernel but does not contain a readable Build 002 city workspace.');
      const selected=view.workspace.modules.find(m=>m.alive&&m.id===selectedModule)??view.workspace.modules.find(m=>m.alive);
      const active=view.workspace.versions.find(v=>v.state===2&&v.serial===selected?.activeSerial);
      const reads=[];let currentText='No compiled version',draftText='';
      if(active) {
        const source=await raw(`${active.serial} version-source`,{target:candidate,record:false});
        currentText=readPresentation(source.output).versionSource;
        if(source.state!=='input'||currentText===undefined)throw new Error('The active version source could not be read from the image.');
        reads.push(source);
      }
      if(selected) {
        const draft=await raw(`${selected.id} source-read`,{target:candidate,record:false});
        draftText=readPresentation(draft.output).sources.get(selected.id);
        if(draft.state!=='input'||draftText===undefined)throw new Error('The stored draft could not be read from the image.');
        reads.push(draft);
      }
      // Accept only after the candidate produced city, lifetime and source data.
      client.close();client=candidate;accepted=true;selectedModule=selected?.id??0;
      initialImage=image;transcriptComplete=true;transcript=[];rawLog='';recentEvents=[];decisions.clear();activeSourceSerial=active?.serial;comparisonBundle=undefined;
      log(requestState,r);for(const read of reads)log(read.rawInput,read);
      consume(r,{animate:false});$('current-source').textContent=currentText;$('module-editor').value=draftText;
      started=true;$('boot-status').hidden=true;notice('Workspace restored in a fresh machine. Sources, versions and in-flight state came from the image.','success');
    }catch(error){throw new Error(accepted?`Workspace loaded, but the interface could not finish refreshing. ${error.message}`:`Import refused. The current workspace is unchanged. ${error.message}`);}
    finally{if(!accepted)candidate.close();}
  }).catch(()=>{});
});
function inspectDecision() {
  const record=decisions.get(selectedVehicle),event=record?.event,car=city?.vehicles.find(v=>v.id===selectedVehicle);
  if(event) {
    const v=event.values;$('decision-summary').textContent=`Van ${v[2]+1} chose a route from ${placeName(v[3])} to ${placeName(v[4])} at logical step ${v[1]}. Version ${v[5]} produced score ${v[6]}.`;
    const values=[['Input',`source ${v[3]}, destination ${v[4]}, open directed road data at that step`],['Exact version',String(v[5])],['Decision sequence',String(v[0])],['Native path',v.slice(8).join(' → ')],['Current car pin',String(car?.version??0)]];
    $('decision-facts').replaceChildren(...values.flatMap(([title,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=title;dd.textContent=value;return [dt,dd];}));
    $('decision-output').textContent='> '+record.input+'\n'+record.roads.map(r=>`ROAD ${r.id} ${r.from} ${r.to} ${r.duration} ${r.toll} ${r.open?1:0}`).join('\n')+'\n'+record.costEvidence+'\n'+event.raw;
  } else {$('decision-summary').textContent=`No route event has been emitted for this van in the current session. BF saved decision ${car?.decision??0}, version ${car?.decisionVersion??0}, score ${car?.score??0}, path ${car?.path.join(' → ')||'none'}. Its original input history is available only if included in a reproduction transcript.`;$('decision-facts').replaceChildren();$('decision-output').textContent=rawLog.slice(-8000);}
  $('decision-dialog').showModal();
}
bind('inspect-decision',async()=>inspectDecision());bind('close-decision',async()=>$('decision-dialog').close());
$('decision-dialog').addEventListener('click',e=>{if(e.target===$('decision-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
async function identities() {
  return identityPromise??=Promise.all(['kernel.bf.gz','kernel-map.json','executor.wasm','engine.mjs','wasm-engine.mjs','worker.mjs','images.mjs','programs/core.thread','programs/city-state.thread','programs/workspace.thread','programs/city.thread','programs/city-boot.thread','programs/city-system.json'].map(async path=>{
    const r=await fetch(new URL(path,import.meta.url));if(!r.ok)throw new Error(`Cannot identify ${path}`);return [path,await sha256(new Uint8Array(await r.arrayBuffer()))];
  })).then(async pairs=>({kernelSha256:(await fetch('./kernel-map.json').then(r=>r.json())).sha256,artifactSha256:Object.fromEntries(pairs)}));
}
async function bundle(runs,sourceVariants=[],image=initialImage) {
  return {schema:'8i-replay-1',build:'002',...await identities(),initialImage:image,runs,sourceVariants:await Promise.all(sourceVariants.map(async source=>({source,sha256:await sha256(source)}))),instructions:'Checkout the corresponding Build 002 source (see artifactSha256). Run: node tools/replay.mjs bundle.json. The replay loads the opaque initial image in a fresh BF executor and compares every native output byte. Browser and CLI must use identical kernel and runtime artifacts. No API key or hosted service is used.'};
}
bind('compare',()=>action(async()=>{
  if(!comparisonInitialImage)throw new Error('Complete a fresh city start before comparing. This experiment uses the original open-bridge image, independently of any imported workspace.');
  const source=$('module-editor').value,common=Array(3).fill(`city-step ${requestState}`),runs=[],views=[];
  $('compare-status').textContent='Computing two fresh BF machines from the same initial image…';$('comparison').hidden=true;
  for(const [label,setup] of [['Original',[]],['Editor source',[sourceWrite(0,source),'0 module-compile']]]) {
    const worker=new Client({onProgress:value=>$('compare-status').textContent=`Fresh computation: ${label} · ${(value.elapsedMs/1000).toFixed(1)} s in this operation`});
    try {
      await worker.request('load',{image:comparisonInitialImage});const inputs=[...setup,...common],outputs=[],events=[];
      for(const input of inputs){const result=await raw(input,{target:worker,record:false});if(result.state!=='input')throw new Error(`${label} did not finish its native computation.`);outputs.push(result.output);const parsed=readPresentation(result.output);events.push(...parsed.events);if(parsed.events.some(e=>e.kind==='WS-ERROR'||e.kind==='RULE-REJECTED'))throw new Error(`${label} was refused by BF. Repair the source before comparing.`);}
      runs.push({label,inputs,expectedOutputs:outputs});views.push({label,event:events.find(e=>e.kind==='ROUTE'&&e.values[2]===0),city:readPresentation(outputs.at(-1)).city});
    }finally{worker.close();}
  }
  comparisonBundle=await bundle(runs,[source],comparisonInitialImage);
  $('comparison').replaceChildren(...views.map(({label,event,city})=>{const card=document.createElement('div');card.className='compare-card';const title=document.createElement('strong'),p=document.createElement('p'),code=document.createElement('code');title.textContent=`${label} · fresh BF calculation`;p.textContent=event?`Van 1, v${event.values[5]}, score ${event.values[6]}. Same three logical steps. Harbor Bridge ${city.roads.find(r=>r.from===9&&r.to===10)?.open?'open':'closed'}.`:'No route was emitted.';code.textContent=event?event.values.slice(8).join(' → '):'';card.append(title,p,code);return card;}));
  $('comparison').hidden=false;$('compare-status').textContent='Completed. These are recorded results of the two fresh calculations above; subsequent city edits do not alter this comparison.';
}));
bind('reproduction',()=>action(async()=>{
  if(!comparisonBundle&&!transcriptComplete)throw new Error('This session contains a paused native continuation. Export and import a completed workspace to start a new replay transcript, or compute the two-version comparison.');
  const result=comparisonBundle??await bundle([{label:'Current session',inputs:transcript.map(r=>r.input),expectedOutputs:transcript.map(r=>r.output)}]);
  download('eight-instructions-002-reproduction.json',JSON.stringify(result,null,2)+'\n');notice('Reproduction bundle exported with its initial image, input transcript, expected BF output and artifact identities.','success');
}));
bind('inspect-machine',()=>action(async()=>{$('machine-inspection').textContent=JSON.stringify(await client.request('inspect'),null,2)+'\nBF tape is fixed; these counters are not total host process memory.';}));
$('terminal-form').addEventListener('submit',event=>{event.preventDefault();const source=$('terminal-input').value;action(async()=>{consume(await raw(source));if(lastResult.state==='input')await refresh();}).catch(()=>{});});
bind('pause-native',async()=>{running=false;await client.request('pause');notice('Pause requested. Resume the exact native continuation before entering more source.');});
bind('resume-native',()=>action(async()=>{consume(await client.request('resume'));if(lastResult.state==='input')await refresh();}));
const unregister=registerExperimentTools({context:navigator.modelContext,runSource:async source=>{
  if(!started)throw new Error('Start the visible city machine first.');
  if(busy)throw new Error('The visible machine is busy.');
  return action(async()=>{const r=await raw(source);consume(r);if(r.state==='input')await refresh();return r;});
},readState:()=>client?.request('inspect')??{state:'off'},reportError:error=>console.info('Optional WebMCP unavailable:',error.message)});
window.addEventListener('pagehide',()=>{running=false;client?.close();scene.close();unregister();},{once:true});
boot();
