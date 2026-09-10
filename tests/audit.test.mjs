import test from 'node:test';
import assert from 'node:assert/strict';
import {audit,digest} from '../tools/audit.mjs';
test('boundary guard rejects new executable files, changed host code and extra kernel commands',async()=>{
  const sources={'package.json':'{"devDependencies":{}}','dist/engine.mjs':'export const x=1;','artifacts/kernel.bf':'+[.-]\n'};
  const manifest={schemaVersion:1,hostRuntimeDependencies:[],buildDependencies:{},components:[
    {path:'dist/engine.mjs',layer:'executor',reason:'Generic eight-command execution',reviewedSha256:digest(sources['dist/engine.mjs'])},
    {path:'artifacts/kernel.bf',layer:'generated-kernel',reason:'Constrained program'},
  ]};
  const run=(files=Object.keys(sources))=>audit({files,manifest,read:async f=>Buffer.from(sources[f])});
  assert.deepEqual((await run()).errors,[]);
  assert.match((await run([...Object.keys(sources),'hidden.ts'])).errors.join('\n'),/Unclassified/);
  sources['dist/engine.mjs']='eval("escape")';assert.match((await run()).errors.join('\n'),/Host review required/);
  assert.match((await run()).errors.join('\n'),/Dynamic host execution/);
  sources['artifacts/kernel.bf']='+nativeEscape';assert.match((await run()).errors.join('\n'),/extra instruction/);
});
