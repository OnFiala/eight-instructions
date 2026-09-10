// Shared RPC path for visible controls and WebMCP. It never interprets guest code.
export class Client {
  constructor({onProgress=()=>{},WorkerClass=Worker}={}) {
    this.worker=new WorkerClass(new URL('./worker.mjs',import.meta.url),{type:'module'});
    this.pending=new Map();this.next=1;
    this.worker.addEventListener('message',({data})=>{
      if(data.progress){onProgress(data.progress);return;}
      const waiter=this.pending.get(data.id);if(!waiter)return;
      this.pending.delete(data.id);data.error?waiter.reject(new Error(data.error)):waiter.resolve(data.result);
    });
    this.worker.addEventListener('error',event=>{
      for(const waiter of this.pending.values())waiter.reject(new Error(event.message||'Machine worker failed'));
      this.pending.clear();
    });
  }
  request(type,data={}) {
    const id=this.next++;
    return new Promise((resolve,reject)=>{
      this.pending.set(id,{resolve,reject});this.worker.postMessage({...data,type,id});
    });
  }
  close() {
    this.worker.terminate();
    for(const waiter of this.pending.values())waiter.reject(new Error('Machine closed'));
    this.pending.clear();
  }
}
