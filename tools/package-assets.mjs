import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url),source=new URL('programs/',root),destination=new URL('dist/programs/',root);
await mkdir(destination,{recursive:true});
for(const name of (await readdir(source)).sort()) {
  if(!/^[a-z0-9-]+\.(thread|json)$/.test(name))throw new Error(`Unexpected program asset: ${name}`);
  const contents=await readFile(new URL(name,source)),target=new URL(name,destination);
  if(process.argv.includes('--check')) {
    if(!(await readFile(target)).equals(contents))throw new Error(`Stale raw source asset: ${name}`);
  } else await writeFile(target,contents);
}
console.log('Raw program assets match their canonical sources.');
