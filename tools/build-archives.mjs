// Historical kernels and runtimes remain byte-for-byte from their released commits.
// Only HTML links/banners change for relocation; receipts retain both identities.
import {execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {sha256} from '../dist/images.mjs';
const root=new URL('../',import.meta.url),check=process.argv.includes('--check');
for(const [tag,commit] of [
  ['build-001','6d7c6b0cb7fa73eda0504ef0d2cc10b1429c5dd0'],
  ['build-002','a80087662a66e7d04c1fc77cbce87cf996d60e63'],
]) {
  const paths=execFileSync('git',['ls-tree','-r','--name-only',commit,'dist'],{cwd:root}).toString().trim().split('\n').filter(p=>!/^dist\/build-\d+\//.test(p));
  const receipt={tag,commit,relocation:'Runtime and raw sources are verbatim. HTML assets become relative, source links target the historical tag, old-build links are relocated and an explicit history banner is added.',files:[]};
  for(const path of paths) {
    const original=execFileSync('git',['show',`${commit}:${path}`],{cwd:root,maxBuffer:20e6});let content=original;
    if(path==='dist/index.html') {
      let html=original.toString().replace(/(href|src)="\/(?!\/)/g,'$1="./')
        .replaceAll('/blob/main/',`/blob/${tag}/`).replaceAll('/tree/main/',`/tree/${tag}/`)
        .replaceAll('href="./build-001/', 'href="../build-001/')
        .replace('cd eight-instructions\nnode runtime/cli.mjs',`cd eight-instructions\ngit checkout ${tag}\nnode runtime/cli.mjs`)
        .replace('<body>',`<body>\n<div style="padding:12px 24px;background:#d7fa73;color:#10170b;font:13px/1.5 system-ui;text-align:center">Historical ${tag.replace('build-','Build ')} · original BF kernel and runtime · <a href="../" style="color:inherit">Current build →</a></div>`);
      content=Buffer.from(html);
    }
    const dest=`dist/${tag}/${path.slice(5)}`,url=new URL(dest,root);
    if(check){if(!content.equals(await readFile(url)))throw new Error(`Historical artifact drift: ${dest}`);}
    else{await mkdir(dirname(url.pathname),{recursive:true});await writeFile(url,content);}
    receipt.files.push({path:dest,originalPath:path,originalSha256:await sha256(original),sha256:await sha256(content),bytes:content.length,verbatim:content.equals(original)});
  }
  const url=new URL(`records/003/${tag}-archive.json`,root),text=JSON.stringify(receipt,null,2)+'\n';
  if(check){if(await readFile(url,'utf8')!==text)throw new Error('Historical receipt drift');}else await writeFile(url,text);
  console.log(`${tag}: ${receipt.files.filter(f=>f.verbatim).length} verbatim files; HTML relocation recorded.`);
}
