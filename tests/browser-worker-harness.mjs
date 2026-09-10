// Adapt browser transport only. The production worker, kernel and Wasm are unchanged.
import {parentPort} from 'node:worker_threads';
import {readFile} from 'node:fs/promises';
globalThis.self={postMessage:data=>parentPort.postMessage(data),addEventListener:(type,fn)=>{
  if(type==='message')parentPort.on('message',data=>fn({data}));
}};
globalThis.fetch=async url=>{
  if(url.protocol!=='file:')throw new Error('Tests prohibit external transport');
  try{return new Response(await readFile(url));}catch{return new Response('',{status:404});}
};
await import('../dist/worker.mjs');
