// Presentation geometry only. Values describe pixels in existing artwork and
// the display of already emitted coordinates; none changes the BF world.
export const ISO = .58;
export const LOT_HALF = 7;
export const ROAD_HALF = 2.35;
export function sceneScale(width,height,zoom=1){
  const top=width<680?112:88,bottom=width<680?123:98;
  return Math.max(.01,Math.min(Math.max(1,width-32)/174,Math.max(1,height-top-bottom)/103))*zoom;
}

// Left, right and front ground corners in each original image, normalized.
// These are ground contacts, not the image bounds or the roof silhouette.
export const footprints = {
  'warehouse-block': [[.017,.553],[.982,.602],[.476,.892]],
  factory: [[.094,.652],[.914,.702],[.527,.863]],
  'site-planned': [[.020,.613],[.961,.613],[.490,.900]],
  'workshop-frame': [[.027,.522],[.964,.696],[.483,.893]],
  'station-complete': [[.050,.651],[.938,.714],[.510,.905]],
  'oldtown-block': [[.029,.648],[.978,.648],[.487,.934]],
};
export function lotLocation(state, entity) {
  const node = state.nodes.find(n => n.id === entity.node);
  return {x:node.x + (node.x < 30 ? -10 : 10), z:node.z - 10};
}
export function artworkName(entity) {
  return entity.role === 1 ? 'warehouse-block' : entity.role === 2 ? 'factory'
    : entity.consumed >= entity.constructionGoal ? 'station-complete'
    : entity.consumed ? 'workshop-frame' : 'site-planned';
}
// Affine registration of three measured ground contacts onto the same parcel.
// Normalized image coordinates make this independent of source resolution.
export function artworkTransform(name, x, z, half, project) {
  const [l,r,f] = footprints[name];
  // Keep architectural verticals vertical. Slight asymmetry in the generated
  // perspective becomes a rectangular footprint, never a leaning building.
  const leftSpan=f[0]-l[0],rightSpan=r[0]-f[0],span=Math.max(leftSpan,rightSpan);
  const hx=half*rightSpan/span,hz=half*leftSpan/span;
  const a = project(x-hx,z-hz), b = project(x+hx,z+hz), c = project(x-hx,z+hz);
  const ux=r[0]-l[0], uy=r[1]-l[1], vx=f[0]-l[0], vy=f[1]-l[1], det=ux*vy-uy*vx;
  const xx=((b.x-a.x)*vy-(c.x-a.x)*uy)/det;
  const xy=((c.x-a.x)*ux-(b.x-a.x)*vx)/det;
  const yx=((b.y-a.y)*vy-(c.y-a.y)*uy)/det;
  const yy=((c.y-a.y)*ux-(b.y-a.y)*vx)/det;
  return [xx,yx,xy,yy,a.x-xx*l[0]-xy*l[1],a.y-yx*l[0]-yy*l[1]];
}
export function transformPoint(m,x,y) {return {x:m[0]*x+m[2]*y+m[4],y:m[1]*x+m[3]*y+m[5]};}
export function uniqueRoads(state) {
  const seen=new Set();
  return state.roads.filter(road=>{const key=[road.from,road.to].sort((a,b)=>a-b).join(':');if(seen.has(key))return false;seen.add(key);return true;});
}
export function roadStrip(state, road, half) {
  const a=state.nodes.find(n=>n.id===road.from),b=state.nodes.find(n=>n.id===road.to);
  const length=Math.hypot(b.x-a.x,b.z-a.z),nx=-(b.z-a.z)/length*half,nz=(b.x-a.x)/length*half;
  return [[a.x+nx,a.z+nz],[b.x+nx,b.z+nz],[b.x-nx,b.z-nz],[a.x-nx,a.z-nz]];
}
const equal=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.z-b.z)<1e-8;
export function observedPosition(state, vehicle) {
  const road=state.roads.find(r=>r.id===vehicle.edge);
  const a=state.nodes.find(n=>n.id===(road?road.from:vehicle.node));
  if(!road)return {x:a.x,z:a.z,node:vehicle.node,edge:null};
  const b=state.nodes.find(n=>n.id===road.to),t=Math.min(1,Math.max(0,vehicle.progress/vehicle.duration));
  return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,node:vehicle.node,edge:road.id};
}
// Locate only the road directly reported by either adjacent observation. This
// deliberately does not search paths, infer missing ticks or predict departure.
function observedRoad(state, old, next) {
  return state.roads.find(r=>r.id===(old.edge??next.edge));
}
function onRoad(state, road, point) {
  if(!road)return false;
  const a=state.nodes.find(n=>n.id===road.from),b=state.nodes.find(n=>n.id===road.to);
  return Math.abs((point.x-a.x)*(b.z-a.z)-(point.z-a.z)*(b.x-a.x))<1e-6
    && point.x>=Math.min(a.x,b.x)&&point.x<=Math.max(a.x,b.x)
    && point.z>=Math.min(a.z,b.z)&&point.z<=Math.max(a.z,b.z);
}
export function poseOnRoad(state, point, road, facing) {
  if(!road)return {...point,height:0,laneX:0,laneZ:0,facing:facing??'front-right'};
  const a=state.nodes.find(n=>n.id===road.from),b=state.nodes.find(n=>n.id===road.to);
  const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),t=((point.x-a.x)*dx+(point.z-a.z)*dz)/(length*length);
  const lane=.8*Math.min(1,Math.max(0,t)*5,Math.max(0,1-t)*5);
  const bridge=(a.x<=20&&b.x>=40)||(b.x<=20&&a.x>=40);
  return {...point,height:bridge?Math.sin(t*Math.PI)*1.15:0,laneX:-dz/length*lane,laneZ:dx/length*lane,
    facing:dx>0?'rear-right':dx<0?'front-left':dz>0?'front-right':'rear-left'};
}
export class ObservedMotion {
  constructor(){this.tracks=new Map();this.state=null;}
  update(state,{animate=true,now=0,elapsedMs=600}={}) {
    const consecutive=animate&&this.state&&(this.state.tick===state.tick-1||this.state.tick===state.tick);
    for(const vehicle of state.vehicles){
      const target=observedPosition(state,vehicle),track=this.tracks.get(vehicle.id);
      const old=this.state?.vehicles.find(v=>v.id===vehicle.id);
      if(!consecutive||!old||!track){this.tracks.set(vehicle.id,{points:[target],roads:[],start:now,duration:0,facing:track?.facing});continue;}
      const previous=observedPosition(this.state,old);
      // Repeated native positions must not restart an unfinished visual journey.
      if(equal(previous,target))continue;
      const road=observedRoad(state,previous,target);
      if(!onRoad(state,road,previous)||!onRoad(state,road,target)){
        this.tracks.set(vehicle.id,{points:[target],roads:[],start:now,duration:0,facing:track.facing});continue;
      }
      const current=this.sample(vehicle.id,now),points=[{x:current.x,z:current.z}],roads=[];
      // Finish any already observed leg before turning; never cut a city block.
      const pending=this.remaining(track,now);
      for(const leg of pending){if(!equal(points.at(-1),leg.point)){points.push(leg.point);roads.push(leg.road);}}
      if(!equal(points.at(-1),target)){points.push(target);roads.push(road.id);}
      this.tracks.set(vehicle.id,{points,roads,start:now,duration:Math.max(350,Math.min(12000,elapsedMs*.92)),facing:current.facing});
    }
    for(const id of this.tracks.keys())if(!state.vehicles.some(v=>v.id===id))this.tracks.delete(id);
    this.state=state;
  }
  legs(track) {
    return track.points.slice(1).map((point,i)=>({point,from:track.points[i],road:track.roads[i],length:Math.hypot(point.x-track.points[i].x,point.z-track.points[i].z)}));
  }
  remaining(track,now) {
    const legs=this.legs(track),total=legs.reduce((n,l)=>n+l.length,0);
    let distance=Math.min(1,Math.max(0,(now-track.start)/track.duration))*total;
    return legs.filter(leg=>{distance-=leg.length;return distance<0;});
  }
  sample(id,now) {
    const track=this.tracks.get(id),legs=this.legs(track);
    if(!legs.length)return poseOnRoad(this.state,track.points[0],this.state.roads.find(r=>r.id===track.points[0].edge),track.facing);
    const total=legs.reduce((n,l)=>n+l.length,0);
    let distance=Math.min(1,Math.max(0,(now-track.start)/track.duration))*total;
    for(let i=0;i<legs.length;i++){
      const leg=legs[i];
      if(distance<=leg.length||i===legs.length-1){
        const t=Math.min(1,distance/leg.length),point={x:leg.from.x+(leg.point.x-leg.from.x)*t,z:leg.from.z+(leg.point.z-leg.from.z)*t};
        return poseOnRoad(this.state,point,this.state.roads.find(r=>r.id===leg.road),track.facing);
      }
      distance-=leg.length;
    }
  }
  active(now){return [...this.tracks.values()].some(t=>t.points.length>1&&now<t.start+t.duration);}
}
