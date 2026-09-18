import test from 'node:test';
import assert from 'node:assert/strict';
import {ISO,LOT_HALF,ROAD_HALF,sceneScale,footprints,artworkTransform,transformPoint,roadStrip,uniqueRoads,ObservedMotion} from '../dist/industry-geometry.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const project=(x,z)=>({x:x+z,y:(z-x)*ISO});
const unproject=p=>({x:(p.x-p.y/ISO)/2,z:(p.x+p.y/ISO)/2});
test('transient hidden and smaller-than-overlay viewports never create negative canvas radii',()=>{
  for(const [w,h] of [[0,0],[1,1],[390,100],[1487,1058],[390,450]]){
    const s=sceneScale(w,h);assert.ok(Number.isFinite(s)&&s>0);
  }
});

test('all building phases register inside the parcel with vertical walls and clear road corridors',()=>{
  for(const name of Object.keys(footprints)){
    const m=artworkTransform(name,10,30,LOT_HALF,project);
    near(m[2],0); // An image vertical must remain a screen vertical.
    const contacts=footprints[name].map(([x,y])=>unproject(transformPoint(m,x,y)));
    for(const p of contacts){assert.ok(p.x>=3-1e-7&&p.x<=17+1e-7);assert.ok(p.z>=23-1e-7&&p.z<=37+1e-7);}
    // A surrounding native street is 20 units apart, with its whole curb clear.
    assert.ok(Math.max(...contacts.map(p=>p.x))+ROAD_HALF+.28<20);
    near((contacts[0].x+contacts[1].x)/2,10);
    near((contacts[0].z+contacts[1].z)/2,30);
  }
});
const nodes=[{id:0,x:0,z:0},{id:1,x:20,z:0},{id:2,x:20,z:20}];
const roads=[{id:0,from:0,to:1},{id:1,from:1,to:0},{id:2,from:1,to:2},{id:3,from:2,to:1}];
const state=(tick,node,edge=null,progress=0)=>({tick,nodes,roads,vehicles:[{id:3,node,edge,progress,duration:1}]});
test('directed pairs share one street and both strips meet their actual native junction',()=>{
  assert.equal(uniqueRoads({roads}).length,2);
  const a=roadStrip({nodes},roads[0],ROAD_HALF),b=roadStrip({nodes},roads[2],ROAD_HALF);
  assert.deepEqual(a.slice(1,3).map(p=>p[0]),[20,20]);
  assert.deepEqual([b[0][1],b[3][1]],[0,0]);
});
test('a multi-second BF observation produces multi-second bounded motion and retains its arrival bearing',()=>{
  const motion=new ObservedMotion();motion.update(state(0,0,0),{now:0});
  motion.update(state(1,1),{now:1000,elapsedMs:5000});
  const start=motion.sample(3,1000),middle=motion.sample(3,3300),end=motion.sample(3,5600);
  near(start.x,0);near(middle.x,10);near(end.x,20);near(middle.z,0);
  assert.equal(end.facing,'rear-right');assert.equal(motion.active(3300),true);assert.equal(motion.active(5600),false);
  motion.update(state(2,1),{now:5700,elapsedMs:5000});
  assert.equal(motion.sample(3,9000).facing,'rear-right');near(motion.sample(3,9000).x,20);
});
test('repeated observations do not reset motion and a new observed turn does not cut the block',()=>{
  const motion=new ObservedMotion();motion.update(state(0,0,0),{now:0});
  motion.update(state(1,1),{now:1000,elapsedMs:5000});
  motion.update(state(2,1,2),{now:2000,elapsedMs:5000});
  near(motion.sample(3,3300).x,10);
  motion.update(state(3,2),{now:3300,elapsedMs:5000});
  for(let now=3300;now<=7900;now+=100){const p=motion.sample(3,now);assert.ok(Math.abs(p.z)<1e-7||Math.abs(p.x-20)<1e-7);assert.ok(p.x<=20&&p.z<=20);}
  assert.equal(motion.sample(3,7900).facing,'front-right');
});
test('missing ticks, imports and reduced-motion updates snap to observation instead of inventing a route',()=>{
  for(const opts of [{animate:false},{animate:true}]){
    const motion=new ObservedMotion();motion.update(state(0,0,0),{now:0});
    motion.update(state(5,2),{...opts,now:1000,elapsedMs:5000});
    const p=motion.sample(3,1000);near(p.x,20);near(p.z,20);assert.equal(motion.active(1000),false);
  }
});
test('same-round inspection does not interrupt the current observed journey',()=>{
  const motion=new ObservedMotion();motion.update(state(0,0,0),{now:0});
  motion.update(state(1,1),{now:1000,elapsedMs:5000});
  motion.update(state(1,1),{now:2000,elapsedMs:100});
  near(motion.sample(3,3300).x,10);
});
