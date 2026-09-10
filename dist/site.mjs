import {Client} from './client.mjs';
import {registerExperimentTools} from './webmcp.mjs';

const $=id=>document.getElementById(id);
let client,initialized=false,busy=false,lastState={state:'off'},transcript='',lastGraph;
const number=new Intl.NumberFormat('en-US');
const short=new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2});
const tabs=[...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;$(t.getAttribute('aria-controls')).hidden=!selected;});
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectTab(tab));
  tab.addEventListener('keydown',event=>{
    let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
    if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
    if(next!==undefined){event.preventDefault();selectTab(tabs[next]);tabs[next].focus();}
  });
});
function log(text) {
  transcript=(transcript+text).slice(-64000);
  $('terminal-output').textContent=transcript||'No output yet.';
  $('terminal-output').scrollTop=$('terminal-output').scrollHeight;
}
function error(message) {$('run-error').textContent=message;$('run-error').hidden=false;}
function controls() {
  const waiting=lastState.state==='input';
  document.querySelectorAll('.needs-machine').forEach(button=>button.disabled=busy||!initialized||!waiting);
  for(const id of ['load-sample','run-source'])$(id).disabled=busy||(initialized&&!waiting);
  for(const id of ['inspect','export-image','step'])$(id).disabled=busy||!initialized;
  $('pause').disabled=!busy;$('resume').hidden=lastState.state!=='budget';$('resume').disabled=busy;
  $('import-image').disabled=busy;$('restart').disabled=busy;$('terminal-input').disabled=busy||(initialized&&!waiting);
  $('terminal-form').querySelector('button').disabled=busy||(initialized&&!waiting);
  $('network-canvas').classList.toggle('computing',busy);
}
function showState(state) {
  lastState=state;
  if(state.state==='off'){
    $('execution-time').textContent='Elapsed in this browser: —';
    $('execution-steps').textContent='Brainfuck instructions: —';
    $('execution-memory').textContent='Tape: —';$('debug-state').textContent='Start or import a machine to inspect it.';
  }
  const labels={off:'Machine is off',input:'Ready for input',budget:'Execution paused',halted:'Machine halted',error:'Executor error'};
  $('machine-status').textContent=labels[state.state]??state.state;
  if(state.elapsedMs!==undefined)$('execution-time').textContent=`Elapsed in this browser: ${(state.elapsedMs/1000).toFixed(2)} s`;
  if(state.executedSteps!==undefined)$('execution-steps').textContent=`Brainfuck instructions: ${number.format(state.executedSteps)}`;
  if(state.tapeBytes)$('execution-memory').textContent=`Tape: ${number.format(state.tapeBytes)} bytes`;
  controls();
}
function getClient() {
  return client??=new Client({onProgress:progress=>{
    $('machine-status').textContent=`Running · ${short.format(progress.executedSteps)} Brainfuck instructions`;
    $('execution-time').textContent=`Elapsed in this browser: ${(progress.elapsedMs/1000).toFixed(2)} s`;
  }});
}
async function boot() {
  if(initialized)return;
  $('machine-status').textContent='Loading kernel, then compiling native libraries…';
  const result=await getClient().request('boot');initialized=true;log(result.output);showState(result);
  if(/!E\d+ /.test(result.output??''))throw new Error('Native library compilation failed. Restart the machine; raw output contains the diagnostic.');
  if(result.state!=='input')throw new Error('Boot paused. Resume it before sending a program.');
}
function afterRun(result) {
  log(result.output??'');showState(result);
  if(/!E\d+ /.test(result.output??''))error('The native program reported an error. The raw output includes its diagnostic code; check the language guide or undo an open transaction.');
  if(result.reason==='limit')error('The work limit was reached. This is a paused computation, not a completed result. Resume or export its image.');
  if(result.reason==='output-limit')error('Output reached 1 MiB and execution paused. The console keeps the last 64,000 characters. Resume to continue.');
  if(result.state==='input'&&result.output)renderDispatch(result.output);
}
export async function runSource(source) {
  if(typeof source!=='string'||!source.length||source.length>100000)throw new Error('Enter source text of at most 100,000 characters.');
  if(busy)throw new Error('The machine is already running.');
  busy=true;controls();$('run-error').hidden=true;
  try {
    await boot();
    if(lastState.state!=='input')throw new Error('Resume the paused machine or restart before sending another program.');
    log(`\nthread> ${source}\n`);
    const result=await getClient().request('execute',{source});afterRun(result);
    return {state:result.state,output:result.output.slice(-32000),outputTruncated:result.output.length>32000,
      elapsedMs:result.elapsedMs,brainfuckInstructions:result.executedSteps,tapeBytes:result.tapeBytes};
  } catch(e){error(e.message);throw e;} finally {busy=false;controls();}
}
function bind(id,fn) {$(id).addEventListener('click',()=>Promise.resolve().then(fn).catch(e=>error(e.message)));}
function integer(id,min,max) {
  const value=Number($(id).value);
  if($(id).value.trim()===''||!Number.isSafeInteger(value)||value<min||value>max)throw new Error(`${$(id).closest('label')?.textContent.trim()??id} must be ${min}–${max}.`);
  return value;
}
function query() {
  return `network ${integer('route-from',0,31)} ${integer('route-to',0,31)} route ." RECORDS" cr db-list ." END" cr`;
}
bind('load-sample',()=>runSource('sample '+query()));
$('route-form').addEventListener('submit',event=>{event.preventDefault();Promise.resolve().then(()=>runSource(query())).catch(e=>error(e.message));});
bind('stage-road',()=>runSource(`${integer('road-cost',1,1000)} ${integer('road-from',0,31)} ${integer('road-to',0,31)} stage-road ${query()}`));
bind('remove-road',()=>runSource(`${integer('road-from',0,31)} ${integer('road-to',0,31)} stage-close ${query()}`));
bind('commit',()=>runSource('tx-commit '+query()));bind('undo',()=>runSource('tx-abort '+query()));
bind('run-source',()=>runSource($('source-editor').value));
$('terminal-form').addEventListener('submit',event=>{event.preventDefault();const source=$('terminal-input').value;if(!source.trim())return;$('terminal-input').value='';runSource(source).catch(e=>error(e.message));});
bind('pause',()=>getClient().request('pause'));
bind('resume',async()=>{
  if(busy)return;busy=true;controls();$('run-error').hidden=true;
  try{afterRun(await getClient().request('resume'));}finally{busy=false;controls();}
});
function download(contents,type,name) {
  const url=URL.createObjectURL(new Blob([contents],{type})),a=document.createElement('a');
  a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
bind('download-source',()=>download($('source-editor').value,'text/plain','program.thread'));
bind('export-image',async()=>{const result=await getClient().request('save');download(result.image,'application/json','eight-instructions.8i');log('\n[host] Machine image exported. Keep the downloaded file to resume later.\n');});
$('import-image').addEventListener('change',async()=>{
  const file=$('import-image').files[0];if(!file)return;
  busy=true;controls();$('run-error').hidden=true;
  try{
    if(file.size>8e6)throw new Error('Image exceeds the 8 MB limit');
    const result=await getClient().request('load',{image:await file.text()});initialized=true;lastGraph=undefined;
    clearGraph();log('\n[host] Validated machine image imported. Its own programs and data are now active.\n');showState(result);
  }catch(e){error(e.message);}finally{busy=false;$('import-image').value='';controls();}
});
bind('restart',async()=>{
  if(client)client.close();client=undefined;initialized=false;transcript='';lastGraph=undefined;
  clearGraph();showState({state:'off'});log('[host] Previous local machine discarded. Start a new one or import an image.\n');$('run-error').hidden=true;
});
export async function readState() {
  if(!client||!initialized)return {state:'off'};
  return client.request('inspect',{start:integer('tape-start',0,119990),count:16});
}
bind('inspect',async()=>{$('debug-state').textContent=JSON.stringify(await readState(),null,2);});
bind('step',async()=>{
  busy=true;controls();
  try{afterRun(await getClient().request('step',{blocks:1000}));$('debug-state').textContent=JSON.stringify(await readState(),null,2);}finally{busy=false;controls();}
});
function svg(tag,attributes={},text) {
  const element=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(const [name,value]of Object.entries(attributes))element.setAttribute(name,String(value));
  if(text!==undefined)element.textContent=text;return element;
}
function clearGraph() {
  $('network-svg').replaceChildren();$('network-empty').hidden=false;$('route-cost').textContent='—';
  $('route-path').textContent='Run a Dispatch command to show its current result.';$('network-count').textContent='Awaiting native output';
  $('transaction-state').textContent='Changes stay staged until you commit or undo them.';
}
function renderDispatch(output) {
  const records=/RECORDS\n([\s\S]*?)END\n/.exec(output),nodes=/NODES (\d+)/.exec(output);
  if(!records||!nodes)return;
  const n=Number(nodes[1]);if(n<1||n>32)return;
  const edges=records[1].trim().split('\n').filter(Boolean).map(line=>line.trim().split(/\s+/).map(Number));
  if(edges.some(row=>row.length!==2||!row.every(Number.isSafeInteger)||row[0]<0||row[0]>=1024||row[1]<1||row[1]>1000))return;
  const cost=/COST (\d+)/.exec(output),path=/PATH ([\d ]+)\n/.exec(output);
  const route=path?path[1].trim().split(/\s+/).map(Number):[];
  if(route.some(id=>id<0||id>=n))return;
  const staged=/STAGED (\d+)/.exec(output)?.[1]==='1';
  lastGraph={n,edges,route};
  $('route-cost').textContent=cost?cost[1]:output.includes('UNREACHABLE')?'∞':'—';
  $('route-path').textContent=route.length?route.join(' → '):'No route connects these nodes.';
  $('transaction-state').textContent=staged?'Staged view · Commit keeps these changes. Undo restores the previous roads.':'Committed view · Export an image to preserve it outside this browser.';
  $('network-count').textContent=`${n} nodes / ${edges.length} roads`;
  $('network-empty').hidden=true;drawGraph(lastGraph);
}
function drawGraph({n,edges,route}) {
  // Geometry and highlighting only. Costs, edges and selected path came from BF.
  const root=$('network-svg');root.replaceChildren();
  root.setAttribute('aria-label',`Native network output: ${n} nodes, ${edges.length} directed roads. Path ${route.join(', ')||'unreachable'}.`);
  const defs=svg('defs');
  for(const [id,color]of [['arrow','#68716f'],['path-arrow','#d4fa3e']]){
    const marker=svg('marker',{id,viewBox:'0 0 8 8',refX:7,refY:4,markerWidth:6,markerHeight:6,orient:'auto'});marker.append(svg('path',{d:'M0 0 L8 4 L0 8 Z',fill:color}));defs.append(marker);
  }
  root.append(defs);
  const positions=Array.from({length:n},(_,i)=>({x:320+250*Math.cos(Math.PI+i*2*Math.PI/n),y:220+166*Math.sin(Math.PI+i*2*Math.PI/n)}));
  const selected=new Set(route.slice(1).map((to,i)=>route[i]*32+to));
  const ordered=[...edges].sort((a,b)=>Number(selected.has(a[0]))-Number(selected.has(b[0])));
  for(const [key,weight]of ordered){
    const from=Math.floor(key/32),to=key%32;if(from>=n||to>=n||from===to)continue;
    const a=positions[from],b=positions[to],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length;
    const start={x:a.x+ux*19,y:a.y+uy*19},end={x:b.x-ux*23,y:b.y-uy*23};
    const bend=12+(key%3)*8,cx=(a.x+b.x)/2-uy*bend,cy=(a.y+b.y)/2+ux*bend,hot=selected.has(key);
    root.append(svg('path',{d:`M${start.x},${start.y} Q${cx},${cy} ${end.x},${end.y}`,fill:'none',stroke:hot?'#d4fa3e':'#515a58','stroke-width':hot?3:1.4,'marker-end':`url(#${hot?'path-arrow':'arrow'})`}));
    const x=(start.x+2*cx+end.x)/4,y=(start.y+2*cy+end.y)/4;
    root.append(svg('rect',{x:x-13,y:y-10,width:26,height:19,rx:4,fill:'#171c1b'}));
    root.append(svg('text',{x,y:y+4,'text-anchor':'middle',fill:hot?'#d4fa3e':'#a8b0ac','font-size':12,'font-family':'monospace'},weight));
  }
  positions.forEach((p,i)=>{const hot=route.includes(i);root.append(svg('circle',{cx:p.x,cy:p.y,r:17,fill:hot?'#d4fa3e':'#222926',stroke:hot?'#d4fa3e':'#6a756f','stroke-width':1.5}));root.append(svg('text',{x:p.x,y:p.y+5,'text-anchor':'middle',fill:hot?'#111315':'#eef2ec','font-size':14,'font-family':'monospace','font-weight':700},i));});
}
fetch(new URL('./programs/dispatch.thread',import.meta.url)).then(r=>{if(!r.ok)throw new Error();return r.text();}).then(source=>$('dispatch-source').textContent=source).catch(()=>$('dispatch-source').textContent='Source is available in the public repository.');
fetch(new URL('./history.json',import.meta.url)).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{
  const builds=data.builds??[],current=builds.at(-1);if(!current)return;
  $('proof-tests').textContent=String(current.testsPassed??'—');$('proof-status').textContent=current.status;
  if(current.testedCommit){$('tested-commit-link').href=`https://github.com/OnFiala/eight-instructions/commit/${current.testedCommit}`;$('tested-commit-link').textContent=`Tested commit ${current.testedCommit.slice(0,7)} ↗`;}
  $('history-list').replaceChildren(...builds.map(build=>{
    const item=document.createElement('li'),id=document.createElement('span'),body=document.createElement('div'),title=document.createElement('h3'),description=document.createElement('p'),link=document.createElement('a');
    id.className='history-id';id.textContent='#'+String(build.number).padStart(3,'0');title.textContent=build.title;description.textContent=build.summary;
    link.href=`https://github.com/OnFiala/eight-instructions/tree/main/records/${String(build.number).padStart(3,'0')}`;link.textContent=`${build.status} · Open the record ↗`;link.className='text-link';
    body.append(title,description,link);item.append(id,body);return item;
  }));
}).catch(()=>{$('proof-status').textContent='Evidence unavailable';});
const cleanup=registerExperimentTools({context:document.modelContext,runSource,readState,reportError:e=>console.warn('Optional WebMCP registration failed:',e.message)});
window.addEventListener('pagehide',cleanup,{once:true});
