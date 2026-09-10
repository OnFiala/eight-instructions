import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
export const digest=data=>createHash('sha256').update(data).digest('hex');
export async function audit({files,manifest,read}) {
  const errors=[],components=new Map(manifest.components.map(c=>[c.path,c]));
  const code=/\.(mjs|js|cjs|py|c|h|wat|wasm|bf|thread|html|css|svg|sh|ts|tsx|jsx|rs|go|rb|java|swift|cpp|cc|cs)$/;
  const native=[],host=[];
  for(const file of files.filter(f=>code.test(f)||/^(kernel|programs|runtime|dist|tools|tests)\//.test(f))) {
    const c=components.get(file);
    if(!c){errors.push(`Unclassified executable or presentation source: ${file}`);continue;}
    if(!c.reason||!c.layer)errors.push(`Incomplete responsibility: ${file}`);
    const data=await read(file),text=data.toString('utf8');
    if(c.reviewedSha256&&digest(data)!==c.reviewedSha256)errors.push(`Host review required: ${file}`);
    if(c.layer==='native-program')native.push(file);else host.push(file);
    if(c.layer==='executor'||c.layer==='runtime-adapter'||c.layer==='presentation') {
      if(/\beval\s*\(|new\s+Function\s*\(|node:child_process/.test(text))errors.push(`Dynamic host execution: ${file}`);
      for(const match of (file.endsWith('.mjs')?text:'').matchAll(/(?:\bfrom\s+|\bimport\s*\()\s*['"]([^'"]+)['"]/g)) {
        const target=match[1];
        if(target.startsWith('.')) {
          const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),target));
          if(!components.has(resolved)||/^(tools|tests)\//.test(resolved))errors.push(`Unreviewed production import: ${file} -> ${target}`);
        }else if(!target.startsWith('node:'))errors.push(`External production import: ${file} -> ${target}`);
      }
    }
    if(file==='artifacts/kernel.bf'&&!/^[><+\-.,\[\]]+\n?$/.test(text))errors.push('Kernel contains an extra instruction');
  }
  for(const file of components.keys())if(!files.includes(file))errors.push(`Manifest source is missing: ${file}`);
  if(manifest.schemaVersion!==1||manifest.hostRuntimeDependencies.length!==0)errors.push('Unexpected runtime dependency contract');
  const pkg=JSON.parse((await read('package.json')).toString());
  if(Object.keys(pkg.dependencies??{}).length)errors.push('Unreviewed runtime dependency');
  if(JSON.stringify(pkg.devDependencies)!==JSON.stringify(manifest.buildDependencies))errors.push('Build dependency drift');
  for(const [name,c]of components)if(c.layer==='bootstrap-kernel'||c.layer==='bootstrap-tool'){
    const text=(await read(name)).toString();
    if(/programs\/|\.thread|subprocess|\beval\s*\(|\bexec\s*\(/.test(text))errors.push(`Bootstrap may consume guest programs or execute external logic: ${name}`);
  }
  return {errors,classifiedSources:components.size,nativeProgramFiles:native.length};
}
export async function auditRoot(root) {
  const files=[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root}).toString().split('\0').filter(Boolean))].sort();
  const manifest=JSON.parse(await readFile(path.join(root,'boundary.json'),'utf8'));
  return audit({files,manifest,read:file=>readFile(path.join(root,file))});
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const result=await auditRoot(fileURLToPath(new URL('../',import.meta.url)));
  if(result.errors.length){console.error(result.errors.join('\n'));process.exitCode=1;}
  else console.log(`Boundary audit PASS: ${result.classifiedSources} classified sources. Hashes are review gates, not a semantic proof.`);
}
