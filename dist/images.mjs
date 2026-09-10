import {ENGINE_VERSION} from './engine.mjs';

export async function sha256(data) {
  const bytes=typeof data==='string'?new TextEncoder().encode(data):data;
  const hash=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function base64(bytes) {
  let binary='';
  for(let i=0;i<bytes.length;i+=8192) binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(binary);
}
function unbase64(text) {
  if(typeof text!=='string'||text.length>4e6||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text)) throw new Error('Invalid image tape encoding');
  const binary=atob(text);return Uint8Array.from(binary,c=>c.charCodeAt(0));
}
function integer(n,min,max,name) {
  if(!Number.isSafeInteger(n)||n<min||n>max) throw new Error(`Invalid image ${name}`);
}
function bytes(a,name) {
  if(!Array.isArray(a)||a.length>1048576||a.some(x=>!Number.isInteger(x)||x<0||x>255)) throw new Error(`Invalid image ${name}`);
}
export async function encodeImage(m,programHash) {
  if(!['input','budget','halted'].includes(m.state)) throw new Error('Pause execution before saving an image');
  const data=new Uint8Array(m.tape.length*2),view=new DataView(data.buffer);
  m.tape.forEach((v,i)=>view.setUint16(i*2,v,true));
  const payload={format:'eight-instructions-machine',version:1,engine:ENGINE_VERSION,
    programHash,optimize:m.program.optimize,cells:m.tape.length,tape:base64(data),
    pc:m.pc,pointer:m.pointer,steps:m.steps,blocks:m.blocks,highWater:m.highWater,
    input:m.input.slice(m.inputAt),eof:m.eof,output:m.output,state:m.state};
  return JSON.stringify({payload,sha256:await sha256(JSON.stringify(payload))})+'\n';
}
export async function decodeImage(text,{program,programHash,create}) {
  if(typeof text!=='string'||text.length>8e6) throw new Error('Image exceeds the size limit');
  const envelope=JSON.parse(text),p=envelope.payload;
  if(!p||envelope.sha256!==await sha256(JSON.stringify(p))) throw new Error('Image integrity check failed');
  if(p.format!=='eight-instructions-machine'||p.version!==1||p.engine!==ENGINE_VERSION) throw new Error('Unsupported image format');
  if(p.programHash!==programHash||p.optimize!==program.optimize) throw new Error('Image belongs to a different kernel or execution mode');
  integer(p.cells,1,1000000,'tape size');integer(p.pc,0,program.ops.length,'program counter');
  integer(p.pointer,0,p.cells-1,'pointer');integer(p.highWater,p.pointer,p.cells-1,'high water');
  integer(p.steps,0,Number.MAX_SAFE_INTEGER,'instruction count');integer(p.blocks,0,Number.MAX_SAFE_INTEGER,'block count');
  bytes(p.input,'input');bytes(p.output,'output');
  if(typeof p.eof!=='boolean'||!['input','budget','halted'].includes(p.state)) throw new Error('Invalid image state');
  if(p.state==='halted'&&p.pc!==program.ops.length) throw new Error('Invalid halted image');
  if(p.state==='input'&&(program.ops[p.pc]?.type!==','||p.eof||p.input.length)) throw new Error('Invalid paused image');
  const data=unbase64(p.tape);
  if(data.byteLength!==p.cells*2) throw new Error('Invalid image tape length');
  const m=create(p.cells),view=new DataView(data.buffer);
  for(let i=0;i<p.cells;i++)m.tape[i]=view.getUint16(i*2,true);
  for(const name of ['pc','pointer','steps','blocks','highWater','eof','state'])m[name]=p[name];
  m.input=p.input;m.inputAt=0;m.output=p.output;
  return m;
}
