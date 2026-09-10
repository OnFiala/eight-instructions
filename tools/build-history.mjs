import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const index=JSON.parse(await readFile(new URL('records/index.json',root),'utf8'));
const builds=[];
for(const record of index.builds) {
  const b=JSON.parse(await readFile(new URL(record,root),'utf8'));
  builds.push({number:b.number,title:b.title,status:b.status,summary:b.summary,
    testsPassed:b.verification.testsPassed,testedCommit:b.endingGitCommit});
}
const output=JSON.stringify({schemaVersion:1,builds},null,2)+'\n',target=new URL('dist/history.json',root);
if(process.argv.includes('--check')){
  if(await readFile(target,'utf8')!==output)throw new Error('Stale public history');
}else await writeFile(target,output);
console.log('Public history matches canonical build records.');
