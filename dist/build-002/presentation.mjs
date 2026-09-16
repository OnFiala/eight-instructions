// Decode the BF program's presentation stream. No simulation, routing, source
// compilation, lifetime policy or future state is computed in this module.
const unsigned=/^\d+$/;
const numbers=fields=>fields.map(x=>{
  if(!unsigned.test(x)||Number(x)>65535)throw new Error('Invalid native presentation number');
  return Number(x);
});
export function readPresentation(output) {
  const result={events:[],sources:new Map(),names:new Map()};
  const nodes=[],roads=[],vehicles=[],modules=[],versions=[];
  let cursor=0,cityHeader,workspaceHeader,idle,memory;
  while(cursor<output.length) {
    const end=output.indexOf('\n',cursor);
    if(end<0)break;
    const line=output.slice(cursor,end).replace(/\r$/,'');cursor=end+1;
    if(!line)continue;
    const fields=line.trim().split(/\s+/),kind=fields.shift();
    if(kind==='SOURCE'||kind==='VERSION-SOURCE') {
      const n=numbers(fields),length=n.at(-1);
      if(length>256||cursor+length>output.length)throw new Error('Incomplete native source frame');
      const source=output.slice(cursor,cursor+length);cursor+=length;
      if(output[cursor]==='\n')cursor++;
      if(kind==='SOURCE')result.sources.set(n[0],source);else result.versionSource=source;
      continue;
    }
    if(kind==='NAME') {
      const name=line.match(/^NAME (\d+) (.*)$/);
      if(name)result.names.set(Number(name[1]),name[2]);continue;
    }
    if(!['CITY','NODE','ROAD','VEHICLE','IDLE','WORKSPACE','MODULE','VERSION','MEMORY','POLICY','COSTS','EDGE-COST','ROUTE','DEPART','ARRIVE','DELIVERED','TICK','MODULE-PUBLISHED','MODULE-CREATED','MODULE-DELETED','SOURCE-STORED','ROLLBACK','WS-ERROR','RULE-REJECTED','UNREACHABLE','ROAD-CHANGED','ROAD-UPDATED','JOB'].includes(kind))continue;
    const n=numbers(fields);
    if(kind==='CITY')cityHeader=n;
    else if(kind==='NODE')nodes.push({id:n[0],x:n[1],z:n[2]});
    else if(kind==='ROAD')roads.push({id:n[0],from:n[1],to:n[2],duration:n[3],toll:n[4],open:n[5]===1});
    else if(kind==='VEHICLE') {
      if(n.length!==12+n[9])throw new Error('Incomplete native vehicle path');
      vehicles.push({id:n[0],node:n[1],edge:n[2]?n[2]-1:null,progress:n[3],goal:n[4],delivered:n[5],version:n[6],decision:n[7],score:n[8],duration:n[10],decisionVersion:n[11],path:n.slice(12)});
    } else if(kind==='IDLE')idle=n[0]===1;
    else if(kind==='WORKSPACE')workspaceHeader=n;
    else if(kind==='MODULE')modules.push({id:n[0],alive:n[1]===1,activeSerial:n[2],rollbackSerial:n[3],draftLength:n[4],draftRevision:n[5],inputs:n[6],outputs:n[7]});
    else if(kind==='VERSION')versions.push({slot:n[0],state:n[1],owner:n[2],serial:n[3],refs:n[4],pins:n[5],codeWords:n[6],sourceBytes:n[7],uses:n[8]});
    else if(kind==='MEMORY')memory={versionCapacity:n[0],liveVersions:n[1],codeCapacity:n[2],codeWords:n[3],sourceCapacity:n[4],sourceBytes:n[5],draftCapacity:n[6],draftBytes:n[7]};
    else result.events.push({kind,values:n,raw:line});
  }
  if(cityHeader) {
    if(cityHeader.length!==5||idle===undefined||nodes.length!==16||vehicles.length!==3||roads.length>48)throw new Error('Incomplete native city frame');
    const ids=new Set(nodes.map(n=>n.id));
    if(ids.size!==nodes.length||roads.some(r=>!ids.has(r.from)||!ids.has(r.to)))throw new Error('Invalid native road topology');
    if(vehicles.some(v=>!ids.has(v.node)||!ids.has(v.goal)||v.path.some(id=>!ids.has(id))))throw new Error('Invalid native vehicle node');
    result.city={tick:cityHeader[0],generation:cityHeader[1],sequence:cityHeader[2],rule:cityHeader[3],serial:cityHeader[4],nodes,roads,vehicles,idle};
  }
  if(workspaceHeader) {
    if(modules.length!==4||versions.length!==6||!memory)throw new Error('Incomplete native workspace frame');
    for(const module of modules)module.name=result.names.get(module.id)??'';
    result.workspace={modules,versions,memory,serial:workspaceHeader[4]};
  }
  return result;
}

// Associate displayed evidence in stream order. This never evaluates a cost.
// A restored image can contain a native cache without its earlier event history.
export function routeEvidence(events,previous=null) {
  let latest=previous,pending=null,policies=[];
  const routes=[];
  for(const event of events) {
    const n=event.values;
    if(['ROAD-CHANGED','ROAD-UPDATED','RULE-REJECTED'].includes(event.kind)) {
      latest=null;pending=null;policies=[];
    } else if(event.kind==='POLICY') {
      latest=null;policies.push(event);
    } else if(event.kind==='COSTS') {
      latest=null;
      pending={serial:n[1],expected:n[3],edges:new Set(),lines:[...policies.filter(p=>p.values[1]===n[1]).map(p=>p.raw),event.raw]};
      policies=[];
      if(n[3]===0){latest={serial:n[1],text:pending.lines.join('\n')};pending=null;}
    } else if(event.kind==='EDGE-COST'&&pending) {
      if(pending.edges.has(n[0])||pending.expected>48){pending=null;continue;}
      pending.edges.add(n[0]);pending.lines.push(event.raw);
      if(pending.edges.size===pending.expected){latest={serial:pending.serial,text:pending.lines.join('\n')};pending=null;}
    } else if(event.kind==='ROUTE') {
      routes.push({event,costEvidence:latest?.serial===n[5]?latest.text:''});
    }
  }
  return {latest,routes};
}

export const diagnostics={
  1:'This module does not exist.',2:'No free version arena, or this program exceeds its code capacity.',
  3:'Use a matching module name starting with a lowercase letter; names and tokens are at most 23 bytes.',
  4:'Source must fit 256 ASCII bytes, without NUL.',5:'Use one complete : module-name … ; definition.',
  6:'Unknown word. This module profile supports pure arithmetic, stacks, control flow and other modules.',
  7:'The declared stack effect, a branch or a loop does not match, or the evaluation stack is full.',
  8:'Unmatched or excessively nested control structure.',10:'A live pin or dependent version still needs this module.',
  11:'That version is unavailable or its handle is stale.',12:'The module exhausted its 1,024 instruction evaluation budget.',
  13:'The module tried to divide by zero.',14:'Wait for module evaluation to reach a safe point.',
  15:'The bounded version serial or pin limit has been reached.',
};
