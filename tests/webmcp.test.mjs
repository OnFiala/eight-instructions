import test from 'node:test';
import assert from 'node:assert/strict';
import {registerExperimentTools} from '../dist/webmcp.mjs';
test('WebMCP has the same source/state routes, validates before effects, and closes registration',async()=>{
  const registered=[],effects=[];
  const close=registerExperimentTools({context:{registerTool:(tool,options)=>registered.push({tool,options})},
    runSource:async source=>{effects.push(source);return {output:'native bytes'};},readState:async()=>({state:'off'})});
  assert.deepEqual(registered.map(r=>r.tool.name),['execute_thread_source','read_machine_state']);
  const [write,read]=registered.map(r=>r.tool);
  for(const input of [null,[],{}, {source:''},{source:4},{source:'x',other:1},{source:'x'.repeat(100001)}])await assert.rejects(write.execute(input));
  for(const input of [null,[],1,{unexpected:1}])await assert.rejects(read.execute(input));
  assert.deepEqual(effects,[]);assert.deepEqual(await read.execute({}),{state:'off'});
  assert.deepEqual(await write.execute({source:'1 2 + .'}),{output:'native bytes'});assert.deepEqual(effects,['1 2 + .']);
  assert.equal(write.annotations.readOnlyHint,false);assert.equal(read.annotations.readOnlyHint,true);
  close();assert.ok(registered.every(r=>r.options.signal.aborted));
});
