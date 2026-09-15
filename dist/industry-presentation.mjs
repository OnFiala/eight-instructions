// Decode native frames only. No routing, scheduling, messaging or world updates.
import {readPresentation,diagnostics as oldDiagnostics} from './presentation.mjs';
export const diagnostics={...oldDiagnostics,
  2:'The module/version capacity is full, or this program exceeds its code capacity.',
  4:'Use at most 512 ASCII bytes, without NUL.',
  6:'Unknown or unavailable word in the checked process profile.',
  31:'This process handle is unavailable or belongs to an earlier lifetime.',
  32:'All sixteen process slots are occupied. Retire an unused participant first.',
  33:'This program cannot perform that operation for this kind of object.',
  34:'A value is outside the native range.',35:'That action is not available in this process state.',
  36:'The bounded logical clock or a lifetime counter has reached its limit.',
  37:'This object still owns material, a trip or an unfinished job. Repair or finish it before removal.',
  38:'The stored source has changed or has no editable batch marker. Use the full source editor.',
  39:'The state/message schema is incompatible with this module or the industrial protocol.',
};
export function readIndustry(output) {
  const view=readPresentation(output),rows=[];
  // Raw source bodies are length framed and must not be treated as event lines.
  let pos=0;
  while(pos<output.length) {
    const end=output.indexOf('\n',pos);if(end<0)break;
    const line=output.slice(pos,end).trim();pos=end+1;
    const nativeError=line.match(/^!E(\d+)(?:\s|$)/);if(nativeError)view.nativeError=nativeError[1];
    const [kind,...fields]=line.split(/\s+/);
    if(kind==='SOURCE'||kind==='VERSION-SOURCE'){pos+=Number(fields.at(-1));if(output[pos]==='\n')pos++;continue;}
    if(!/^(INDUSTRY|INDUSTRY-END|I-ROAD|ENTITY|TRAVEL|I-PATH|PROCESSES|PROCESS|PRIVATE|ACCOUNT|CONTROL|PARAMETER|I-ROUTE|I-DEPART|I-ARRIVE|SEND|RECEIVE|ORDER|AUTHORIZE|ASSIGN|LOAD|UNLOAD|PRODUCE|ACK|BUILD|ROUND|ROAD-OPEN|PROCESS-FAULT|PROCESS-CREATED|PROCESS-STOPPED|JOB|NODE)$/.test(kind))continue;
    if(fields.some(x=>!/^\d+$/.test(x)||Number(x)>65535))throw new Error('Invalid native industrial frame');
    rows.push({kind,n:fields.map(Number),raw:line});
  }
  const arities={INDUSTRY:8,'INDUSTRY-END':1,NODE:3,'I-ROAD':9,PROCESS:17,PRIVATE:17,PROCESSES:6,ENTITY:24,TRAVEL:20,ACCOUNT:6,CONTROL:6,PARAMETER:6};
  for(const row of rows){
    if(arities[row.kind]!==undefined&&row.n.length!==arities[row.kind])throw new Error(`Incomplete native ${row.kind} record`);
    if(row.kind==='I-PATH'&&(row.n[1]>16||row.n.length!==2+row.n[1]))throw new Error('Incomplete native path');
  }
  const of=kind=>rows.filter(r=>r.kind===kind),one=kind=>of(kind).at(-1)?.n;
  view.parameter=one('PARAMETER');view.control=one('CONTROL');
  const header=one('INDUSTRY');
  if(header) {
    if(header[0]!==3||one('INDUSTRY-END')?.[0]!==header[1])throw new Error('Incomplete industrial state');
    const nodes=of('NODE').map(({n})=>({id:n[0],x:n[1],z:n[2]}));
    const roads=of('I-ROAD').map(({n})=>({id:n[0],from:n[1],to:n[2],duration:n[3],toll:n[4],open:!!n[5],signal:!!n[6],capacity:n[7],occupancy:n[8]}));
    const processes=of('PROCESS').map(({n})=>({slot:n[0],status:n[1],handle:n[2],module:n[3],root:n[4],version:n[5],pc:n[6],sp:n[7],fp:n[8],timer:n[9],fault:n[10],quanta:n[11],operations:n[12],mail:n[14],private:of('PRIVATE').find(r=>r.n[0]===n[2])?.n.slice(1)??[]}));
    const entities=of('ENTITY').map(({n})=>({slot:n[0],id:n[1],role:n[2],node:n[3],raw:n[4],panels:n[5],cargoKind:n[6],cargo:n[7],goal:n[8],status:n[9],supplier:n[10],destination:n[11],escrow:n[12],productionTime:n[13],consumed:n[14],inbound:n[15],outbound:n[16],capacity:n[17],batch:n[18],priority:n[19],signalEdge:n[20],constructionGoal:n[21],lastWork:n[22],readyJobs:n[23]}));
    const vehicles=entities.filter(e=>e.role===3).map(e=>{
      const n=of('TRAVEL').find(r=>r.n[0]===e.id)?.n,p=of('I-PATH').find(r=>r.n[0]===e.id)?.n;
      if(!n||n.length!==20||!p||p.length!==2+p[1]||p[1]>16)throw new Error('Incomplete native vehicle state');
      return {...e,edge:n[2]?n[2]-1:null,progress:n[3],duration:n[4],routePhase:n[6],weight:n[12],candidateEdge:n[14],waitingFor:n[16],job:n[17],jobPhase:n[18],routeVersion:n[19],path:p.slice(2)};
    });
    const nodeIds=new Set(nodes.map(n=>n.id));
    if(nodes.length!==16||nodeIds.size!==16||roads.length!==header[3]||roads.length>48||entities.length>16||processes.length>16||roads.some(r=>!nodeIds.has(r.from)||!nodeIds.has(r.to)||r.capacity<1||r.occupancy>r.capacity)||entities.some(e=>!nodeIds.has(e.node)||!nodeIds.has(e.goal)||e.role<1||e.role>5)||processes.some(p=>p.status<1||p.status>5||p.mail>4||p.sp>64||p.fp>32||p.private.length!==16))throw new Error('Invalid industrial topology or process frame');
    const account=one('ACCOUNT');if(!account||account.length!==6)throw new Error('Missing native material account');
    view.world={tick:header[1],ready:!!header[2],jobsCreated:header[4],jobsReclaimed:header[5],deliveries:header[6],productions:header[7],nodes,roads,entities,vehicles,processes,account,processSummary:one('PROCESSES'),jobs:of('JOB').map(r=>r.n)};
  }
  view.industryEvents=rows.filter(r=>/^(I-ROUTE|I-DEPART|I-ARRIVE|SEND|RECEIVE|ORDER|AUTHORIZE|ASSIGN|LOAD|UNLOAD|PRODUCE|ACK|BUILD|ROUND|ROAD-OPEN|PROCESS-FAULT|PROCESS-CREATED|PROCESS-STOPPED)$/.test(r.kind)).map(r=>({kind:r.kind,values:r.n,raw:r.raw}));
  return view;
}
const processNames=['Unavailable','Ready','Waiting for a message','Sleeping','Paused','Faulted'];
export const processLabel=p=>processNames[p?.status??0]??'Unknown';
export function entityName(entity) {
  const names={1:'South depot',2:'North depot',3:'Riverside factory',4:'East factory',5:'West station',6:'East station',7:'Van 01',8:'Van 02',9:'Van 03',10:'Van 04',11:'North bridge signal',12:'Harbor bridge signal'};
  return names[entity.id]??`${['Program','Depot','Factory','Van','Station','Signal'][entity.role]??'Program'} ${entity.id}`;
}
export const roadName=road=>road.id>=40?({40:'North Bridge',42:'Harbor Bridge',44:'Market Bridge'}[road.id-road.id%2]??'Bridge'):`Street ${road.from}–${road.to}`;
export function entityStatus(entity,process,vehicle,world) {
  if(process?.status===5)return `Program fault · native code ${process.fault}`;
  if(process?.status===4)return 'Program paused; its state is retained';
  if(entity.role===3) {
    if(entity.status===9){const preferred=world?.entities.find(e=>e.id===vehicle?.waitingFor);return `Yielded to ${preferred?entityName(preferred):'a higher-priority van'}`;}
    if(vehicle?.edge!==null&&vehicle?.edge!==undefined){
      const destination=world?.entities.find(e=>e.node===entity.goal&&[1,2,4].includes(e.role));
      return `Travelling to ${destination?entityName(destination):`junction ${entity.goal}`}`;
    }
    return ['Ready for an assignment','Travelling','Waiting for a green signal','Waiting for road capacity','Waiting for a job slot','No open route','Waiting for stock','Destination storage is full','Receiver mailbox is full'][entity.status]??processLabel(process);
  }
  if(entity.role===2)return entity.escrow?`Making a panel · ${entity.productionTime} work rounds left`:entity.outbound?'Panels await a van':entity.inbound?'Raw materials ordered':'Ready for production';
  if(entity.role===4)return entity.consumed>=entity.constructionGoal?'Construction complete':'Waiting for station panels';
  if(entity.role===1)return 'Supplies raw materials to factories';
  return processLabel(process);
}
