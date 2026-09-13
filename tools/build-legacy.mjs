#!/usr/bin/env node
// Preserve the released runtime byte-for-byte. Only HTML navigation is relocated
// into /build-001/ and marked historical; the original remains in the Git tag.
import {execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {sha256} from '../dist/images.mjs';
const check=process.argv.includes('--check'),root=new URL('../',import.meta.url);
const commit='6d7c6b0cb7fa73eda0504ef0d2cc10b1429c5dd0';
const files=execFileSync('git',['ls-tree','-r','--name-only',commit,'dist'],{cwd:root}).toString().trim().split('\n');
const receipt={tag:'build-001',commit,relocation:'Runtime, raw sources and assets are verbatim. HTML local asset URLs are relative, GitHub source links target build-001, a historical banner is added, and the CLI recipe explicitly checks out build-001. The original HTML remains in the tag.',files:[]};
for(const path of files) {
  const original=execFileSync('git',['show',`${commit}:${path}`],{cwd:root,maxBuffer:10e6});let content=original;
  if(path==='dist/index.html') {
    const html=original.toString().replace(/(href|src)="\/(?!\/)/g,'$1="./').replaceAll('/blob/main/','/blob/build-001/').replaceAll('/tree/main/','/tree/build-001/').replace('cd eight-instructions\nnode runtime/cli.mjs', 'cd eight-instructions\ngit checkout build-001\nnode runtime/cli.mjs').replace('<body>','<body>\n<div style="padding:12px 24px;background:#d7fa73;color:#10170b;font:13px/1.5 system-ui;text-align:center">Historical Build 001 · original kernel and runtime · <a href="../" style="color:inherit">Return to Build 002 →</a></div>');
    content=Buffer.from(html);
  }
  const dest='dist/build-001/'+path.slice(5),url=new URL(dest,root);
  if(check){if(!content.equals(await readFile(url)))throw new Error(`Legacy archive drift: ${dest}`);}
  else {await mkdir(dirname(url.pathname),{recursive:true});await writeFile(url,content);}
  receipt.files.push({path:dest,originalPath:path,originalSha256:await sha256(original),sha256:await sha256(content),bytes:content.length,verbatim:content.equals(original)});
}
const receiptUrl=new URL('records/002/build-001-archive.json',root),text=JSON.stringify(receipt,null,2)+'\n';
if(check){if(await readFile(receiptUrl,'utf8')!==text)throw new Error('Legacy archive receipt drift');}else await writeFile(receiptUrl,text);
console.log('Build 001 archive: 17 verbatim runtime/assets, one explicitly relocated historical HTML page.');
