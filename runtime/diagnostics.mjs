// Diagnostic display only. Source bodies are opaque length-framed bytes; their
// contents must never masquerade as kernel/module error records in CLI status.
export class NativeDiagnostics {
  line='';remaining=0;failed=false;
  feed(text){
    let pos=0;
    while(pos<text.length){
      if(this.remaining){const count=Math.min(this.remaining,text.length-pos);this.remaining-=count;pos+=count;continue;}
      const end=text.indexOf('\n',pos);
      if(end<0){this.line+=text.slice(pos);break;}
      this.line+=text.slice(pos,end);pos=end+1;
      const frame=this.line.match(/^(?:SOURCE \d+|VERSION-SOURCE) (\d+)\s*$/);
      if(frame)this.remaining=Number(frame[1]);else this.inspectLine();
      this.line='';
    }
    return this.failed;
  }
  inspectLine(){this.failed||=/!E\d+ |^WS-ERROR \d+ /m.test(this.line);}
  boundary(){if(!this.remaining){this.inspectLine();this.line='';}return this.failed;}
}
