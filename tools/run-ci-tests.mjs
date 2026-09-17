// Verification orchestration only. Every *.test.mjs belongs to exactly one job;
// production imports none of this file or its reference interpreters.
import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const files=readdirSync(new URL('../tests/',import.meta.url))
  .filter(name=>name.endsWith('.test.mjs')).sort().map(name=>`tests/${name}`);
const groups={
  core:[],
  'literal-modules':['tests/native-reference.test.mjs'],
  'literal-processes':['tests/process-reference.test.mjs'],
  'literal-contexts':['tests/context-reference.test.mjs'],
  synthesis:['tests/synthesis.test.mjs','tests/synthesis-adversarial.test.mjs','tests/district.test.mjs'],
  'synthesis-reclaim':['tests/synthesis-reclaim.test.mjs'],
};
const isolated=new Set(Object.values(groups).flat());
groups.core=files.filter(file=>!isolated.has(file));
const planned=Object.values(groups).flat().sort();
if(new Set(planned).size!==planned.length||JSON.stringify(planned)!==JSON.stringify(files)){
  throw new Error('CI partition must cover every current test file exactly once');
}
const [group,...extra]=process.argv.slice(2);
if(extra.length)throw new Error('Expected one CI suite name or --list');
if(group==='--list')console.log(JSON.stringify({testFiles:files.length,groups},null,2));
else{
  if(!Object.hasOwn(groups,group))throw new Error('Unknown CI suite');
  console.log(JSON.stringify({suite:group,testFiles:groups[group]}));
  const result=spawnSync(process.execPath,['--test',...groups[group]],{cwd:root,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.signal)throw new Error(`Test process terminated by ${result.signal}`);
  process.exitCode=result.status??1;
}
