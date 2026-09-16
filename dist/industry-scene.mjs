// Presentation of observed BF state. Camera, materials, labels and sprite placement
// are visual only. All roads, cargo, construction and reservations come from BF.
import {CityScene} from './city-scene.mjs';
import {entityName,roadName} from './industry-presentation.mjs';
export class IndustryScene extends CityScene {
  constructor(canvas,{onSelect=()=>{}}={}) {
    super(canvas);this.onObjectSelect=onSelect;this.object={kind:'entity',id:3};this.hits=[];
    this.zoom=1;this.pan={x:0,y:0};
    const old=this.ready;
    this.ready=Promise.all([old,...['factory','station-foundation','station-frame','station-complete','raw-pallet','panel-pallet'].map(async name=>{
      const image=new Image();image.src=new URL(`./assets/industrial/${name}.png`,import.meta.url).href;await image.decode();this.sprites.set(name,image);
    })]).then(()=>this.draw(performance.now()));
    canvas.addEventListener('pointerdown',e=>{this.drag={x:e.clientX,y:e.clientY,px:this.pan.x,py:this.pan.y,moved:false};canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{
      if(!this.drag)return;const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;
      if(Math.abs(dx)+Math.abs(dy)>5)this.drag.moved=true;
      if(this.drag.moved){this.pan={x:this.drag.px+dx,y:this.drag.py+dy};this.resize();}
    });
    canvas.addEventListener('pointerup',e=>{
      const moved=this.drag?.moved;this.drag=null;if(moved)return;
      const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
      const hit=[...(this.hits??[])].reverse().find(h=>x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h);
      if(hit)this.onObjectSelect(hit.object);
    });
    canvas.addEventListener('pointercancel',()=>{this.drag=null;});
    this.resize();
  }
  resize(){super.resize();this.s=Math.min(this.w/(this.w<950?151:135),(this.h-65)/82)*(this.zoom??1);this.sy=this.s*.58;this.origin={x:this.w*.49+(this.pan?.x??0),y:this.h*(this.w<950?.16:.19)+(this.pan?.y??0)};this.draw(performance.now());}
  camera(delta){this.zoom=Math.min(1.55,Math.max(.72,this.zoom+delta));this.resize();}
  resetCamera(){this.zoom=1;this.pan={x:0,y:0};this.resize();}
  ground(){
    super.ground();
    // Ornamental lawns and paths stay inside building plots. They are not roads,
    // resources or guest objects; every drivable connection is drawn from BF.
    for(const [x,z,w,h] of [[63,42,10,17],[63,22,10,14],[-4,40,7,12],[3,65,12,7],[42,64,14,8],[41,3,15,13]]){
      this.tile(x,z,x+w,z+h,'#717662',.025);
      this.tile(x+.5,z+.5,x+w-.5,z+h-.5,'#37492f',.05);
      this.tile(x+w*.42,z+.5,x+w*.58,z+h-.5,'#8a8770',.06);
      this.tile(x+.5,z+h*.43,x+w-.5,z+h*.57,'#8a8770',.06);
    }
    const c=this.ctx;
    // Static reflected lamplight on the decorative canal surface.
    for(const z of [6,16,26,36,46,56]){
      const p=this.project(28,z,-.3);c.save();c.translate(p.x,p.y);c.scale(1,.58);
      const glow=c.createRadialGradient(0,0,0,0,0,this.s*2.5);glow.addColorStop(0,'#efc98038');glow.addColorStop(1,'#d7b97300');
      c.fillStyle=glow;c.beginPath();c.arc(0,0,this.s*2.5,0,Math.PI*2);c.fill();c.restore();
    }
  }
  drawRoute(){
    const selected=this.selected;
    // Display actual emitted paths, including while a building is selected.
    for(const vehicle of this.state?.vehicles??[]){
      if(!vehicle.path.length||!vehicle.job)continue;
      this.selected=vehicle.id;this.ctx.save();this.ctx.globalAlpha=selected===vehicle.id?1:.55;
      super.drawRoute();this.ctx.restore();
    }
    this.selected=selected;
  }
  selectObject(object){this.object=object;this.selected=object.kind==='entity'?object.id:null;this.draw(performance.now());}
  buildingLocation(e) {
    const n=this.state.nodes.find(n=>n.id===e.node);
    let x=n.x<30?n.x+10:n.x-10,z=n.z===60?n.z-10:n.z+8;
    if(e.role===2&&n.x>=30)z=n.z-10;
    if(e.role===1&&n.z===0){x=n.x+9;z=n.z+11;}
    return {x,z};
  }
  buildingWidth(e){return this.s*(e.role===2?32:30);}
  industrial(e) {
    const c=this.ctx,{x,z}=this.buildingLocation(e),p=this.project(x,z),selected=this.object?.kind==='entity'&&this.object.id===e.id;
    let name=e.role===1?'warehouse-block':e.role===2?'factory':e.consumed>=e.constructionGoal?'station-complete':e.consumed? 'station-frame':'station-foundation';
    const sprite=this.sprites.get(name);if(!sprite)return;
    const width=this.buildingWidth(e),height=width*sprite.height/sprite.width;
    const top=p.y+this.sy*7-height*.90,left=p.x-width*.5;
    if(selected)this.polygon([[x-8,z-8],[x+8,z-8],[x+8,z+8],[x-8,z+8]].map(([a,b])=>this.project(a,b,.1)),null,'#d7fa73',1.8);
    const proc=this.state.processes.find(p=>p.handle===e.id);
    c.save();c.filter='contrast(1.06) saturate(1.04)';
    c.shadowColor=proc?.status===5?'#ff885575':selected?'#d7fa7380':'#06100bcc';c.shadowBlur=this.s*(selected||proc?.status===5?1.8:.7);c.shadowOffsetY=this.sy*.5;
    c.drawImage(sprite,left,top,width,height);c.restore();
    this.hits.push({x:left+width*.12,y:top+height*.18,w:width*.76,h:height*.74,object:{kind:'entity',id:e.id}});
    this.stock(e.raw,'raw-pallet',x-7,z+7);this.stock(e.panels,'panel-pallet',x+2,z+9);
    if(e.escrow||proc?.status===4||proc?.status===5){
      const q=this.project(x+7,z+4,5);c.save();c.shadowColor=proc?.status===5?'#ff8861':proc?.status===4?'#ecbe74':'#dcff96';c.shadowBlur=13;c.fillStyle=c.shadowColor;c.beginPath();c.arc(q.x,q.y,3,0,Math.PI*2);c.fill();c.restore();
    }
  }
  stock(count,name,x,z){
    const sprite=this.sprites.get(name);if(!sprite||!count)return;
    // A visual stack represents up to six native units; the exact count is labelled.
    const stacks=Math.min(4,Math.ceil(count/6));
    for(let i=0;i<stacks;i++){
      const p=this.project(x+(i%2)*2.5,z+Math.floor(i/2)*2.5),w=this.s*4.5;
      this.ctx.drawImage(sprite,p.x-w/2,p.y-w*.72,w,w*sprite.height/sprite.width);
    }
  }
  vehicle(e,p){
    super.drawVehicle(e,p);
    if(e.cargo){
      const asset=this.sprites.get(e.cargoKind===1?'raw-pallet':'panel-pallet'),w=this.s*3;
      if(asset)this.ctx.drawImage(asset,p.x-w*.75,p.y-w*1.35,w,w*asset.height/asset.width);
    }
    this.hits.push({x:p.x-this.s*4,y:p.y-this.s*6,w:this.s*8,h:this.s*7,object:{kind:'entity',id:e.id}});
  }
  badge(text,x,y,color='#d7fa73'){
    const c=this.ctx;c.save();c.font=`600 ${Math.max(10,Math.min(12,this.s*1.6))}px InterVariable, sans-serif`;const w=c.measureText(text).width+14;
    c.fillStyle='#111b18ed';c.strokeStyle='#6c7c6866';c.lineWidth=1;c.beginPath();c.roundRect(x-w/2,y-13,w,23,4);c.fill();c.stroke();c.textAlign='center';c.fillStyle=color;c.fillText(text,x,y+3);c.restore();
  }
  objectLabels(){
    if(!this.state)return;const c=this.ctx;
    for(const e of this.state.entities.filter(e=>[1,2,4].includes(e.role))){
      const loc=this.buildingLocation(e),p=this.project(loc.x,loc.z),selected=this.object?.id===e.id&&this.object.kind==='entity';
      const name=e.role===1?'warehouse-block':e.role===2?'factory':e.consumed>=e.constructionGoal?'station-complete':e.consumed?'station-frame':'station-foundation';
      const sprite=this.sprites.get(name),height=this.buildingWidth(e)*(sprite?sprite.height/sprite.width:1);
      const labelY=Math.max(this.w>=950?90:0,p.y+this.sy*7-height*.75);
      if(this.w<600&&!selected)continue;
      const proc=this.state.processes.find(p=>p.handle===e.id);
      const text=(proc?.status===5?'Fault · ':proc?.status===4?'Paused · ':'')+entityName(e);
      this.badge(text,p.x,labelY,proc?.status===5?'#ffb093':proc?.status===4?'#eac685':selected?'#e4ff92':'#eef0de');
      c.save();c.font='10px ui-monospace,monospace';c.textAlign='center';c.fillStyle='#b8c4b8';c.shadowColor='#000';c.shadowBlur=5;
      if(selected||e.role===4)c.fillText(e.role===4?`${e.consumed} / ${e.constructionGoal} panels built`:`${e.raw} raw · ${e.panels} panels`,p.x,labelY+26);c.restore();
    }
    for(const road of this.state.roads.filter(r=>r.id%2===0)){
      const p=this.roadPoint(road,.5),selected=this.object?.kind==='road'&&this.object.id===road.id;
      this.hits.unshift({x:p.x-22,y:p.y-15,w:44,h:30,object:{kind:'road',id:road.id}});
      if(selected||!road.open||this.bridge(road)&&this.w>=600&&road.toll){this.badge(selected?roadName(road):road.open?`Toll ${road.toll}`:'Closed',p.x,p.y+25,road.open?'#d7fa73':'#ffb79c');}
      if(!road.signal&&road.open){const q=this.roadPoint(road,.17);c.fillStyle='#ffbd74';c.beginPath();c.arc(q.x,q.y,3,0,Math.PI*2);c.fill();}
    }
  }
  draw(now){
    if(!this.w||!this.h)return;cancelAnimationFrame(this.frame);
    const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.w,this.h);this.hits=[];
    this.ground();if(!this.state)return;this.drawRoads();this.drawBridges();this.drawRoute();this.drawRoadMarks();
    const objects=[{depth:119,draw:()=>this.drawBuilding('oldtown-block',-14,36,1.05)}];
    objects.push({depth:49,draw:()=>this.drawFountain(68,57)});
    for(const e of this.state.entities.filter(e=>[1,2,4].includes(e.role))){const p=this.buildingLocation(e);objects.push({depth:p.z-p.x+69,draw:()=>this.industrial(e)});}
    for(const [name,x,z,k] of [['flat-house',-3,9,.75],['stone-house',-4,34,.7],['flat-house',-4,47,.8],['cafe-house',17,-6,.8],['flat-house',35,-6,.9],['cafe-house',45,5,.8],['stone-house',54,5,.75],['flat-house',45,14,.85],['cafe-house',54,14,.8],['cafe-house',67,27,.9],['flat-house',74,34,.85],['stone-house',68,46,.8],['flat-house',70,64,.9],['cafe-house',44,70,.8],['flat-house',22,71,.85],['stone-house',5,71,.8]])objects.push({depth:z-x+63,draw:()=>this.drawHouse(name,x,z,k)});
    const trees=[];
    for(const x of [24,36])for(const z of [5,11,16,25,31,36,45,51,57])trees.push([x,z]);
    for(const x of [-4,74])for(const z of [2,8,14,20,26,32,38,44,50,56,62,68])trees.push([x,z]);
    for(const z of [-5,73])for(const x of [2,8,14,20,38,44,50,56,62,68])trees.push([x,z]);
    for(const [x,z] of [[16,6],[4,14],[16,25],[16,33],[4,44],[17,52],[43,5],[56,6],[44,34],[55,32],[44,45],[56,56],[67,18]])trees.push([x,z]);
    for(const [x,z] of [[64,44],[72,44],[64,49],[72,49],[64,54],[72,54],[66,24],[71,24],[66,34],[71,34],[4,67],[12,67],[4,72],[12,72],[43,68],[55,68]])trees.push([x,z]);
    for(const [x,z] of trees)objects.push({depth:z-x+60,draw:()=>this.drawTree(x,z,.94)});
    for(const [x,z] of [[-2,4],[-2,24],[-2,44],[18,16],[18,36],[18,56],[42,4],[42,24],[42,44],[58,16],[58,36],[58,56],[24,5],[24,15],[24,25],[24,35],[24,45],[24,55],[36,5],[36,15],[36,25],[36,35],[36,45],[36,55]])objects.push({depth:z-x+60,draw:()=>this.drawLamp(x,z)});
    const t=this.motion.matches?1:Math.min(1,(now-this.transition)/600),ease=t*t*(3-2*t);
    const vehicleMarkers=[];
    for(const vehicle of this.state.vehicles){
      const p=this.vehiclePoint(this.state,vehicle),old=this.previous?.vehicles.find(v=>v.id===vehicle.id);
      if(old&&t<1){const q=this.vehiclePoint(this.previous,old);p.x=q.x+(p.x-q.x)*ease;p.y=q.y+(p.y-q.y)*ease;}
      objects.push({depth:p.worldZ-p.worldX+60,draw:()=>this.vehicle(vehicle,p)});
      vehicleMarkers.push({vehicle,p});
    }
    objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
    this.objectLabels();
    // Elevated callouts keep an occluded van discoverable without drawing its
    // body through a building. Stationary peers share a native node; their
    // callouts are spread on screen, never turned into invented road positions.
    for(const {vehicle,p} of vehicleMarkers){
      const peers=vehicleMarkers.filter(v=>v.vehicle.edge===null&&v.vehicle.node===vehicle.node);
      const index=peers.findIndex(v=>v.vehicle.id===vehicle.id),offset=vehicle.edge===null?(index-(peers.length-1)/2)*(this.w<600?72:96):0;
      const y=p.y-42,x=p.x+offset,selected=this.object?.kind==='entity'&&this.object.id===vehicle.id;
      const proc=this.state.processes.find(v=>v.handle===vehicle.id),name=entityName(vehicle);
      const label=name.startsWith('Van ')?name.slice(4):String(vehicle.id);
      const material=this.w<600?(vehicle.cargoKind===1?'R':'P'):(vehicle.cargoKind===1?'raw':'panels');
      const detail=proc?.status===5?'fault':proc?.status===4?'paused':[3,9].includes(vehicle.status)?'queue':vehicle.cargo?`${vehicle.cargo} ${material}`:'';
      this.line(p,{x,y:y+12},'#a8c87766',1);
      this.badge(`${label}${detail?' · '+detail:''}`,x,y,proc?.status===5?'#ffb093':selected?'#e5ff99':'#c9dbb8');
      this.hits.push({x:x-(detail?50:24),y:y-14,w:detail?100:48,h:25,object:{kind:'entity',id:vehicle.id}});
    }
    if(t<1&&this.previous&&!this.motion.matches)this.frame=requestAnimationFrame(time=>this.draw(time));
  }
}
