// Sites transport projection. GitHub retains the complete engineering history.
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,sep} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const destination=resolve(root,process.argv[2]??'.local/site-release');
if(!destination.startsWith(resolve(root,'.local')+sep))throw new Error('Site staging must stay under .local/');
const git=args=>execFileSync('git',args,{cwd:root});
const sourceCommit=git(['rev-parse','--verify','HEAD']).toString().trim();
const files=git(['ls-tree','-r','--name-only',sourceCommit,'--','dist','.openai/hosting.json']).toString().trim().split('\n');
if(!files.includes('dist/index.html')||!files.includes('.openai/hosting.json'))throw new Error('Missing committed Site source');
await mkdir(dirname(destination),{recursive:true});
await mkdir(destination); // Require a fresh directory; never erase a prior projection.
const hashes={};
for(const file of files){
  const data=git(['show',`${sourceCommit}:${file}`]),target=resolve(destination,file);
  await mkdir(dirname(target),{recursive:true});await writeFile(target,data);
  hashes[file]=createHash('sha256').update(data).digest('hex');
}
await writeFile(resolve(destination,'source-provenance.json'),JSON.stringify({schemaVersion:1,
  generatedBy:'tools/stage-site.mjs',canonicalRepository:'https://github.com/OnFiala/eight-instructions',
  canonicalCommit:sourceCommit,files:hashes,
  reason:'Exact committed Site assets only; the full engineering history remains on GitHub.'},null,2)+'\n');
console.log(JSON.stringify({destination,sourceCommit,files:files.length}));
