import test from 'node:test';
import assert from 'node:assert/strict';
import {readPresentation,routeEvidence} from '../dist/presentation.mjs';

test('length-framed stored source cannot masquerade as city or lifecycle output',()=>{
  const source='\\\nCITY 999 1 2 3 4\nMODULE-PUBLISHED 0 99 1 1 0';
  const parsed=readPresentation(`SOURCE 0 ${source.length} \n${source}\nSOURCE-STORED 0 ${source.length} \n`);
  assert.equal(parsed.sources.get(0),source);assert.equal(parsed.city,undefined);
  assert.deepEqual(parsed.events.map(e=>e.kind),['SOURCE-STORED']);
});
test('partial or malformed presentation frames cannot replace a complete city',()=>{
  assert.throws(()=>readPresentation('CITY 1 1 0 0 1\n'),/Incomplete/);
  assert.throws(()=>readPresentation('TICK NaN\n'),/Invalid/);
  assert.throws(()=>readPresentation('SOURCE 0 10\nshort'),/Incomplete/);
});

test('route evidence cannot borrow a different version or a pre-import cost trace',()=>{
  const first=routeEvidence(readPresentation('POLICY 0 1 2 5 7\nCOSTS 0 1 1 1\nEDGE-COST 42 2 5 7\nROUTE 1 1 0 12 15 1 15 0\n').events);
  assert.match(first.routes[0].costEvidence,/EDGE-COST 42 2 5 7/);
  const newRoute=readPresentation('ROUTE 4 4 0 8 15 2 34 0\n').events;
  assert.equal(routeEvidence(newRoute,first.latest).routes[0].costEvidence,'');
  // Import starts a new presentation session even when a serial is reused.
  assert.equal(routeEvidence(readPresentation('ROUTE 1 1 0 12 15 1 15 0\n').events,null).routes[0].costEvidence,'');
});
test('each route captures only the complete cost table preceding it',()=>{
  const parsed=readPresentation('COSTS 0 1 1 1\nEDGE-COST 42 2 5 7\nROUTE 1 1 0 12 15 1 15 0\nCOSTS 1 2 1 1\nEDGE-COST 42 2 5 47\nROUTE 4 4 0 8 15 2 34 0\n');
  const result=routeEvidence(parsed.events);
  assert.match(result.routes[0].costEvidence,/5 7/);assert.doesNotMatch(result.routes[0].costEvidence,/47/);
  assert.match(result.routes[1].costEvidence,/5 47/);assert.doesNotMatch(result.routes[1].costEvidence,/COSTS 0 1/);
  const incomplete=readPresentation('COSTS 2 2 2 2\nEDGE-COST 0 2 0 4\nROUTE 5 5 0 8 15 2 34 0\n');
  assert.equal(routeEvidence(incomplete.events,result.latest).routes[0].costEvidence,'');
  assert.equal(routeEvidence(readPresentation('ROAD-CHANGED 42 0\nROUTE 5 5 0 8 15 2 34 0\n').events,result.latest).routes[0].costEvidence,'');
});
