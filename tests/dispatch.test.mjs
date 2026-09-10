import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,command,word} from './system-helpers.mjs';

function route(output) {
  if(output==='UNREACHABLE\n')return {cost:Infinity,path:[]};
  const match=/^COST (\d+) \nPATH ([\d ]+)\n$/.exec(output);
  assert.ok(match,output);return {cost:Number(match[1]),path:match[2].trim().split(/\s+/).map(Number)};
}
function oracle(n,edges,start,end) {
  // Bellman-Ford, deliberately distinct from the guest's Dijkstra implementation.
  const dist=Array(n).fill(Infinity);dist[start]=0;
  for(let round=0;round<n-1;round++)for(const [a,b,w] of edges)dist[b]=Math.min(dist[b],dist[a]+w);
  return dist[end];
}
function checkPath(result,edges,start,end) {
  if(!Number.isFinite(result.cost)){assert.deepEqual(result.path,[]);return;}
  assert.equal(result.path[0],start);assert.equal(result.path.at(-1),end);
  assert.equal(new Set(result.path).size,result.path.length);
  let sum=0;
  for(let i=1;i<result.path.length;i++){
    const edge=edges.find(([a,b])=>a===result.path[i-1]&&b===result.path[i]);assert.ok(edge);sum+=edge[2];
  }
  assert.equal(sum,result.cost);
}
test('Dispatch combines transactions, native compilation and dynamic route changes',async()=>{
  const m=await fresh();command(m,'sample');
  assert.deepEqual(route(command(m,'0 11 route')),{cost:20,path:[0,2,1,7,8,9,10,11]});
  command(m,'tx-begin 100 1 7 road assert');
  assert.deepEqual(route(command(m,'0 11 route')),{cost:21,path:[0,2,4,5,11]});
  command(m,'tx-abort');assert.equal(route(command(m,'0 11 route')).cost,20);
  command(m,'tx-begin 1 7 close-road assert tx-commit');assert.equal(route(command(m,'0 11 route')).cost,21);
  assert.equal(word(m,'sp'),0);
});
test('zero-distance, unreachable nodes and invalid road states',async()=>{
  const m=await fresh();command(m,'sample');
  assert.deepEqual(route(command(m,'5 5 route')),{cost:0,path:[5]});
  assert.deepEqual(route(command(m,'11 0 route')),{cost:Infinity,path:[]});
  for(const src of ['12 1 route','65535 0 route','tx-begin 0 0 1 road','1001 0 1 road','2 0 12 road'])assert.match(command(m,src,{allowError:true}),/!E8/);
  command(m,'tx-abort');assert.equal(route(command(m,'0 11 route')).cost,20);
});
test('maximum-size chain uses all 32 nodes and reconstructs a 31-edge path',async()=>{
  const m=await fresh();
  command(m,'32 nodes ! tx-begin db-clear '+Array.from({length:31},(_,i)=>`1000 ${i} ${i+1} road assert`).join(' ')+' tx-commit');
  assert.deepEqual(route(command(m,'0 31 route')),{cost:31000,path:Array.from({length:32},(_,i)=>i)});
  assert.equal(route(command(m,'31 0 route')).cost,Infinity);
});
test('random weighted networks agree with Bellman-Ford and valid path reconstruction',async()=>{
  let seed=777;
  const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  for(const n of [8,16,24]) {
    const m=await fresh(),map=new Map();
    for(let i=0;i<n-1;i++)map.set(`${i},${i+1}`,[i,i+1,rand(20)+1]);
    for(let i=0;i<n*2;i++){const a=rand(n),b=rand(n);if(a!==b)map.set(`${a},${b}`,[a,b,rand(50)+1]);}
    const edges=[...map.values()];
    command(m,`${n} nodes ! tx-begin db-clear `+edges.map(([a,b,w])=>`${w} ${a} ${b} road assert`).join(' ')+' tx-commit');
    for(const [start,end] of [[0,n-1],[n-1,0],[2,n-2]]) {
      const result=route(command(m,`${start} ${end} route`));
      assert.equal(result.cost,oracle(n,edges,start,end));checkPath(result,edges,start,end);
    }
  }
});
