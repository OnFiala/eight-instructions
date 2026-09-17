#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {createInterface} from 'node:readline/promises';
import {stdin,stdout,stderr} from 'node:process';
import {loadKernel,loadLibraries,execute} from './system.mjs';
import {encodeImage,decodeImage} from '../dist/images.mjs';
import {atomicWrite} from './files.mjs';
import {NativeDiagnostics} from './diagnostics.mjs';

const usage=`8 Instructions — a computing environment on the Brainfuck (BF) programming language.
node runtime/cli.mjs [--bare] [--backend wasm|js] [--run FILE] [--eval SOURCE]
                     [--demo | --city | --industry | --autonomous] [--load IMAGE] [--save IMAGE] [--metrics]
                     [--fuel N] [--blocks N]
With no batch arguments, open an interactive terminal. Default boot compiles the
Thread core library, transactional store and Dispatch from raw source in BF.
--bare boots only the kernel. --load resumes an exact compatible machine image.
--city boots the native source workspace and Living Dispatch; use city-step and
city-state as ordinary native source inputs. --demo runs historical Dispatch.
--industry compiles the raw industrial/process sources inside BF. Use --fuel 5e14
--blocks 5e10 for this larger cold boot, then process-step and industry-state.
For a verified zero-round image, use --load dist/initial-industry.8i instead.
--autonomous compiles the Build 004 world and native synthesis supervisor. Use
--fuel 2e14 --blocks 3e10 for cold boot, then autonomy-step and industry-state.
--save keeps input open and saves an image after the requested execution pauses.
The default work limits are 1e14 BF instructions and 1e10 executor blocks.

Interactive host controls (OS/inspection only):
  /save FILE     atomically save the paused machine image
  /load FILE     replace this session with a validated compatible image
  /inspect       show generic execution counters and current tape cell
  /tape N COUNT  read at most 256 raw tape cells
  /step N        resume at most N generic executor blocks
  /quit          leave the terminal
All other lines go unchanged to Thread. Use 'words' to inspect the dictionary,
'1 trace' and '0 trace' for native instruction traces. /save is a host boundary;
tx-begin, db-put, tx-commit and route are Brainfuck-native operations.
`;

async function main() {
  const args=process.argv.slice(2),config={files:[],evals:[],backend:'wasm',fuel:1e14,blocks:1e10};
  for(let i=0;i<args.length;i++) {
    const arg=args[i];
    if(arg==='--help'||arg==='-h'){stdout.write(usage);return;}
    if(['--bare','--demo','--city','--industry','--autonomous','--metrics'].includes(arg)){config[arg.slice(2)]=true;continue;}
    if(!['--backend','--run','--eval','--load','--save','--fuel','--blocks'].includes(arg)||args[i+1]===undefined)throw new Error(`Invalid argument: ${arg}`);
    const value=args[++i];
    if(arg==='--run')config.files.push(value);
    else if(arg==='--eval')config.evals.push(value);
    else config[arg.slice(2)]=value;
  }
  if(!['wasm','js'].includes(config.backend))throw new Error('Backend must be wasm or js');
  if(config.city&&(config.bare||config.demo))throw new Error('--city cannot be combined with --bare or --demo');
  if(config.industry&&(config.bare||config.demo||config.city))throw new Error('--industry cannot be combined with --bare, --demo or --city');
  if(config.autonomous&&(config.bare||config.demo||config.city||config.industry))throw new Error('--autonomous requires a single boot profile');
  for(const field of ['fuel','blocks']) {
    config[field]=Number(config[field]);
    if(!Number.isSafeInteger(config[field])||config[field]<1)throw new Error(`${field} must be a positive safe integer`);
  }
  const kernel=await loadKernel();
  const create=cells=>kernel.create(cells,config.backend);
  const decode=text=>decodeImage(text,{program:kernel.program,programHash:kernel.programHash,create});
  let m=config.load?await decode(await readFile(config.load,'utf8')):create();
  let sawError=false;
  const diagnostics=new NativeDiagnostics();
  const drain=()=>{
    const out=new TextDecoder().decode(m.drain());stdout.write(out);
    sawError=diagnostics.feed(out);
    if(m.state==='input'||m.state==='halted')sawError=diagnostics.boundary();
  };
  const run=(source,options={})=>{
    const state=execute(m,source,{fuel:config.fuel,blocks:config.blocks,...options});drain();
    return state;
  };
  if(!config.load) {
    run(config.bare?'':config.autonomous?await loadLibraries('autonomous-system.json'):config.industry?await loadLibraries('industry-system.json'):config.city?await loadLibraries('city-system.json'):kernel.libraries);
    if(m.state==='budget')throw new Error('Boot hit the work budget; increase --fuel or --blocks');
    if(sawError)throw new Error('The native library compiler reported an error');
  }
  const batch=config.demo||config.files.length||config.evals.length||!stdin.isTTY;
  if(batch) {
    const files=await Promise.all(config.files.map(file=>readFile(file,'utf8')));
    let source=[...files,...config.evals,config.demo?'sample network 0 11 route':''].join('\n')+'\n';
    if(!stdin.isTTY&&!config.demo&&!config.files.length&&!config.evals.length) {
      const chunks=[];for await(const chunk of stdin)chunks.push(chunk);source=Buffer.concat(chunks).toString('utf8')+'\n';
    }
    run(source,{eof:!config.save});
    if(config.save)await atomicWrite(config.save,await encodeImage(m,kernel.programHash));
    if(config.metrics)stderr.write(JSON.stringify(m.inspect())+'\n');
    if(m.state==='budget'){stderr.write('Work budget reached; execution is incomplete.\n');process.exitCode=2;}
    else if(sawError)process.exitCode=1;
    return;
  }
  stdout.write('Type /help for host controls; words for the native language.\n');
  const terminal=createInterface({input:stdin,output:stdout});
  try {
    while(m.state!=='halted') {
      let line;
      try{line=await terminal.question(m.state==='budget'?'paused> ':'thread> ');}catch{break;}
      if(line==='/quit')break;
      try {
        if(line==='/help')stdout.write(usage);
        else if(line==='/inspect')stdout.write(JSON.stringify(m.inspect(),null,2)+'\n');
        else if(line.startsWith('/save '))await atomicWrite(line.slice(6),await encodeImage(m,kernel.programHash));
        else if(line.startsWith('/load '))m=await decode(await readFile(line.slice(6),'utf8'));
        else if(line.startsWith('/step ')) {
          const blocks=Number(line.slice(6));if(!Number.isSafeInteger(blocks)||blocks<1)throw new Error('Invalid step count');
          m.run({fuel:config.fuel,blocks});drain();
        } else if(line.startsWith('/tape ')) {
          const [start,count]=line.slice(6).trim().split(/\s+/).map(Number);
          if(!Number.isSafeInteger(start)||!Number.isSafeInteger(count)||start<0||count<1||count>256||start+count>m.tape.length)throw new Error('Invalid tape range');
          stdout.write(JSON.stringify([...m.tape.slice(start,start+count)])+'\n');
        } else if(m.state==='budget')stderr.write('Use /step, /save, /load or /quit while execution is paused by its work budget.\n');
        else run(line+'\n');
      }catch(error){stderr.write(error.message+'\n');}
    }
    if(config.save&&m.state!=='ready')await atomicWrite(config.save,await encodeImage(m,kernel.programHash));
  }finally{terminal.close();}
}
main().catch(error=>{stderr.write(`8 Instructions: ${error.message}\n`);process.exitCode=1;});
