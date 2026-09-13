// Presentation only: project emitted coordinates, draw emitted roads and paths,
// and interpolate between two already observed vehicle positions. No future
// guest state, route, job, delivery or collision is calculated here.
const assets=['university-block','market-block','depot-block','homes-block','warehouse-block','oldtown-block'];
const labels={0:'Westgate',1:'North Quay',2:'University',3:'East Market',4:'North Park',5:'Riverside Market',6:'Midtown',7:'East Warehouse',8:'West Heights',9:'Harbor West',10:'Harbor East',11:'Logistics Hub',12:'DEPOT',13:'Old Town',14:'Riverside South',15:'Central Square'};
export const placeName=id=>labels[id]??`Node ${id}`;

async function sprite(name) {
  const image=new Image();image.src=new URL(`./assets/city/${name}.png`,import.meta.url).href;
  await image.decode();
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);
  const pixels=c.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;
  // Chroma compositing of the image generator's explicit magenta matte.
  // This changes presentation pixels only; original source assets stay intact.
  for(let i=0;i<d.length;i+=4) {
    const spill=Math.min(d[i],d[i+2])-d[i+1];
    if(spill<22)continue;
    const a=Math.max(0,1-(spill-22)/115);
    d[i+3]=Math.round(a*255);
    if(a>0){d[i]=Math.max(0,(d[i]-(1-a)*255)/a);d[i+2]=Math.max(0,(d[i+2]-(1-a)*255)/a);d[i+1]=Math.min(255,d[i+1]/a);}
  }
  c.putImageData(pixels,0,0);return canvas;
}
export class CityScene {
  constructor(canvas,{onSelect=()=>{}}={}) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.onSelect=onSelect;
    this.selected=0;this.state=null;this.previous=null;this.transition=0;this.sprites=new Map();
    this.motion=matchMedia('(prefers-reduced-motion: reduce)');
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);
    canvas.addEventListener('click',event=>{
      if(!this.state)return;
      const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
      let closest,dist=35;
      for(const car of this.state.vehicles){const p=this.vehiclePoint(this.state,car),d=Math.hypot(p.x-x,p.y-y);if(d<dist){closest=car.id;dist=d;}}
      if(closest!==undefined)this.onSelect(closest);
    });
    this.ready=Promise.all([...assets,'van-front-right','van-rear-left','van-rear-right'].map(async name=>{
      this.sprites.set(name,await sprite(name));
    })).then(()=>this.draw(performance.now()));
    this.motion.addEventListener('change',()=>this.draw(performance.now()));
  }
  resize() {
    const rect=this.canvas.getBoundingClientRect();this.w=rect.width;this.h=rect.height;
    this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);
    this.s=this.w/96;this.sy=this.s*.53;this.origin={x:this.w*.58,y:Math.max(0,this.h-this.canvas.parentElement.clientHeight)-this.h*.025};
    this.draw(performance.now());
  }
  project(x,z,height=0){return {x:this.origin.x+(x+z-60)*this.s,y:this.origin.y+(z-x+60)*this.sy-height*this.s};}
  setState(state,{animate=true}={}) {
    this.previous=animate&&this.state?.tick===state.tick-1?this.state:null;
    this.state=state;this.transition=performance.now();this.draw(this.transition);
  }
  select(id){this.selected=id;this.draw(performance.now());}
  polygon(points,fill,stroke,width=1) {
    const c=this.ctx;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();
    if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
  }
  tile(x1,z1,x2,z2,color,height=0) {this.polygon([[x1,z1],[x2,z1],[x2,z2],[x1,z2]].map(([x,z])=>this.project(x,z,height)),color);}
  line(a,b,color,width,dash=[]) {
    const c=this.ctx;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([]);
  }
  bridge(road) {
    const a=this.state.nodes.find(n=>n.id===road.from),b=this.state.nodes.find(n=>n.id===road.to);
    return a&&b&&((a.x<=20&&b.x>=40)||(b.x<=20&&a.x>=40));
  }
  roadPoint(road,t) {
    const a=this.state.nodes.find(n=>n.id===road.from),b=this.state.nodes.find(n=>n.id===road.to);
    const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;
    return {...this.project(x,z,this.bridge(road)?Math.sin(t*Math.PI)*1.15:0),worldX:x,worldZ:z};
  }
  roadStroke(road,color,width,dash=[]) {
    const c=this.ctx;c.beginPath();
    for(let i=0;i<=24;i++){const p=this.roadPoint(road,i/24);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}
    c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([]);
  }
  vehiclePoint(state,vehicle) {
    const node=state.nodes.find(n=>n.id===vehicle.node),road=state.roads.find(r=>r.id===vehicle.edge);
    if(!road)return {...this.project(node.x,node.z),worldX:node.x,worldZ:node.z};
    const a=state.nodes.find(n=>n.id===road.from),b=state.nodes.find(n=>n.id===road.to);
    const t=vehicle.progress/vehicle.duration,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;
    const bridge=(a.x<=20&&b.x>=40)||(b.x<=20&&a.x>=40);
    const p=this.project(x,z,bridge?Math.sin(t*Math.PI)*1.15:0);
    // Offset the graphic into the displayed directed lane. This is not collision avoidance.
    const pa=this.project(a.x,a.z),pb=this.project(b.x,b.z),length=Math.hypot(pb.x-pa.x,pb.y-pa.y);
    return {x:p.x-(pb.y-pa.y)/length*this.s*.48,y:p.y+(pb.x-pa.x)/length*this.s*.48,worldX:x,worldZ:z};
  }
  ground() {
    const c=this.ctx;
    this.tile(-2,-2,62,62,'#182529',-1.6);
    this.tile(-2,-2,26,62,'#535448');this.tile(34,-2,62,62,'#535448');
    this.tile(26,-2,34,62,'#12313b',-.2);
    for(const x of [26,34]) {
      this.line(this.project(x,-2,-.8),this.project(x,62,-.8),'#59666a',this.s*.65);
      this.line(this.project(x,-2),this.project(x,62),'#a49d87',this.s*.7);
      for(let z=-1;z<62;z+=2.2)this.line(this.project(x-.18,z),this.project(x+.18,z),'#d0c3a3',this.s*.07);
      for(let z=5;z<60;z+=10){const p=this.project(x,z),q=this.project(x,z,2.1);this.line(p,q,'#49564d',this.s*.12);c.save();c.shadowColor='#ffcc6f';c.shadowBlur=this.s*1.4;c.fillStyle='#ffdda0';c.beginPath();c.arc(q.x,q.y,this.s*.17,0,Math.PI*2);c.fill();c.restore();}
    }
    // Water glints are a decorative material, with no simulated movement or state.
    c.globalAlpha=.25;
    for(let i=0;i<36;i++) {
      const x=27+(i*7%6),z=(i*13%60),p=this.project(x,z,-.2);
      this.line(p,{x:p.x+this.s*1.15,y:p.y+this.sy*.65},i%3?'#376c75':'#c3b08a',Math.max(.5,this.s*.06));
    }
    c.globalAlpha=1;
  }
  drawRoads() {
    if(!this.state)return;
    const c=this.ctx,drawn=new Set();
    for(const road of this.state.roads) {
      const pair=[road.from,road.to].sort((a,b)=>a-b).join(':');if(drawn.has(pair))continue;drawn.add(pair);
      const a=this.roadPoint(road,0),b=this.roadPoint(road,1),isBridge=this.bridge(road);
      this.roadStroke(road,'#151b1a',this.s*4.7);this.roadStroke(road,'#a29c88',this.s*4.25);
      this.roadStroke(road,'#343a38',this.s*3.45);
      if(isBridge) {
        const normal={x:-(b.y-a.y)/Math.hypot(b.x-a.x,b.y-a.y),y:(b.x-a.x)/Math.hypot(b.x-a.x,b.y-a.y)};
        for(const side of [-1,1]) {
          c.beginPath();for(let i=0;i<=20;i++){const p=this.roadPoint(road,i/20),x=p.x+normal.x*this.s*1.78*side,y=p.y+normal.y*this.s*1.78*side-this.s*.4;i?c.lineTo(x,y):c.moveTo(x,y);}
          c.strokeStyle=road.toll?'#a96832':'#9da7a4';c.lineWidth=this.s*.48;c.stroke();
          for(let i=1;i<16;i++){const p=this.roadPoint(road,i/16),q={x:p.x+normal.x*this.s*1.78*side,y:p.y+normal.y*this.s*1.78*side};this.line(q,{x:q.x,y:q.y-this.s*.55},road.toll?'#d59e57':'#c6c9ba',this.s*.13);}
        }
      }
      this.roadStroke(road,'#aaa997',this.s*.1,[this.s*.75,this.s*.55]);
      for(const t of [.11,.89]) {
        const p=this.roadPoint(road,t),dx=(b.x-a.x)/Math.hypot(b.x-a.x,b.y-a.y),dy=(b.y-a.y)/Math.hypot(b.x-a.x,b.y-a.y);
        for(let i=-2;i<=2;i++)this.line({x:p.x-dy*this.s*1.2+dx*i*this.s*.20,y:p.y+dx*this.s*1.2+dy*i*this.s*.20},{x:p.x+dy*this.s*1.2+dx*i*this.s*.20,y:p.y-dx*this.s*1.2+dy*i*this.s*.20},'#c5c3ae',this.s*.105);
      }
    }
    for(const road of this.state.roads) {
      const a=this.roadPoint(road,.45),b=this.roadPoint(road,.55),angle=Math.atan2(b.y-a.y,b.x-a.x);
      c.save();c.translate(a.x,a.y);c.rotate(angle);c.translate(0,this.s*.8);
      c.beginPath();c.moveTo(-this.s*.25,-this.s*.15);c.lineTo(0,0);c.lineTo(-this.s*.25,this.s*.15);c.strokeStyle=road.open?'#a7aa98':'#fbac72';c.lineWidth=this.s*.1;c.stroke();c.restore();
      if(!road.open){const p=this.roadPoint(road,.28);c.save();c.translate(p.x,p.y);c.rotate(angle);this.line({x:0,y:0},{x:0,y:this.s*1.45},'#ffad73',this.s*.5);c.restore();}
    }
  }
  drawRoute() {
    const vehicle=this.state?.vehicles.find(v=>v.id===this.selected);if(!vehicle?.path.length)return;
    const c=this.ctx;c.save();c.lineCap='round';c.lineJoin='round';
    for(let i=1;i<vehicle.path.length;i++) {
      const road=this.state.roads.find(r=>r.from===vehicle.path[i-1]&&r.to===vehicle.path[i]);if(!road)continue;
      c.beginPath();for(let j=0;j<=20;j++){const p=this.roadPoint(road,j/20);j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}
      c.shadowColor='#d5fc66';c.shadowBlur=this.s*1.1;c.strokeStyle='rgba(200,246,92,.35)';c.lineWidth=this.s*1.15;c.stroke();
      c.shadowBlur=0;c.strokeStyle='#d4fa75';c.lineWidth=this.s*.42;c.stroke();
      const p=this.roadPoint(road,.60),q=this.roadPoint(road,.62),a=Math.atan2(q.y-p.y,q.x-p.x);
      c.save();c.translate(p.x,p.y);c.rotate(a);c.beginPath();c.moveTo(-this.s*.65,-this.s*.42);c.lineTo(0,0);c.lineTo(-this.s*.65,this.s*.42);c.strokeStyle='#e0ff8d';c.lineWidth=this.s*.26;c.stroke();c.restore();
    }
    c.restore();
  }
  drawBuilding(name,x,z,scale=1) {
    const sprite=this.sprites.get(name);if(!sprite)return;
    const width=this.s*35.0*scale,height=width/sprite.width*sprite.height*.82,p=this.project(x,z);
    const anchors={'university-block':.902,'market-block':.912,'depot-block':.866,'homes-block':.893,'warehouse-block':.893,'oldtown-block':.941};
    this.ctx.drawImage(sprite,p.x-width*.5,p.y+this.sy*17*scale-height*anchors[name],width,height);
  }
  drawVehicle(vehicle,point) {
    const road=this.state.roads.find(r=>r.id===vehicle.edge);
    let spriteName='van-front-right';
    if(road) {
      const a=this.state.nodes.find(n=>n.id===road.from),b=this.state.nodes.find(n=>n.id===road.to);
      if(b.x>a.x)spriteName='van-rear-right';else if(b.x<a.x)spriteName='van-front-left';
      else if(b.z>a.z)spriteName='van-front-right';else spriteName='van-rear-left';
    }
    const mirror=spriteName==='van-front-left';
    const sprite=this.sprites.get(mirror?'van-front-right':spriteName);if(!sprite)return;
    const width=this.s*6,height=width/sprite.width*sprite.height;
    this.ctx.save();this.ctx.shadowColor='rgba(0,0,0,.65)';this.ctx.shadowBlur=this.s*.55;
    this.ctx.translate(point.x,point.y);if(mirror)this.ctx.scale(-1,1);
    this.ctx.drawImage(sprite,-width*.5,-height*.71,width,height);this.ctx.restore();
  }
  drawLabels() {
    if(!this.state)return;
    const c=this.ctx,selected=this.state.vehicles.find(v=>v.id===this.selected);
    const show=new Set([12,4,2,7,11,15,8]);if(selected){show.add(selected.node);show.add(selected.goal);}
    for(const node of this.state.nodes) {
      if(!show.has(node.id))continue;
      const p=this.project(node.x,node.z),radius=Math.max(9,this.s*1.65),offset=node.id===12?{x:-74,y:-51}:node.id===15?{x:-125,y:-3}:{x:0,y:-8};
      if(node.id===12||node.id===15)this.line(p,{x:p.x+offset.x,y:p.y+offset.y},'#adc683',1);
      c.save();c.translate(p.x+offset.x,p.y+offset.y);c.shadowColor='#000';c.shadowBlur=8;
      c.beginPath();c.arc(0,0,radius,0,Math.PI*2);c.fillStyle='#151c18';c.fill();c.strokeStyle=selected?.goal===node.id?'#e3ff96':'#c8e476';c.lineWidth=2;c.stroke();
      c.shadowBlur=0;c.font=`650 ${Math.max(12,this.s*1.85)}px InterVariable, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f5f6e9';c.fillText(String(node.id),0,.5);
      c.font=`520 ${Math.max(11,this.s*1.55)}px InterVariable, sans-serif`;c.textAlign='left';
      const lines=placeName(node.id).split(' '),labelX=radius+8,labelY=-2;
      if(lines.length>1&&this.w>600){c.fillText(lines[0],labelX,labelY-5);c.fillText(lines.slice(1).join(' '),labelX,labelY+12);}else c.fillText(placeName(node.id),labelX,labelY);
      c.restore();
    }
    for(const [from,to,title] of [[1,2,'North Bridge'],[9,10,'Harbor Bridge']]) {
      const road=this.state.roads.find(r=>r.from===from&&r.to===to);if(!road)continue;
      const p=this.roadPoint(road,.5);c.save();c.font=`520 ${Math.max(11,this.s*1.52)}px InterVariable, sans-serif`;c.shadowColor='#000';c.shadowBlur=7;c.fillStyle='#f2f2e8';c.fillText(title,p.x+13,p.y+28);
      c.fillStyle=road.open?(road.toll?'#ffcc75':'#d6f77a'):'#ffad73';c.fillText(road.open?(road.toll?`Toll ${road.toll}`:'Free'):'Closed to departures',p.x+13,p.y+46);c.restore();
    }
  }
  draw(now) {
    if(!this.w||!this.h)return;
    cancelAnimationFrame(this.frame);const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.w,this.h);
    this.ground();this.drawRoads();this.drawRoute();
    const objects=[
      ['market-block',10,10],['homes-block',10,30],['depot-block',10,50],
      ['university-block',50,10],['oldtown-block',50,30],['warehouse-block',50,50],
    ].map(([name,x,z])=>({depth:z-x+60+9,draw:()=>this.drawBuilding(name,x,z)}));
    const t=this.motion.matches?1:Math.min(1,(now-this.transition)/650),smooth=t*t*(3-2*t);
    for(const vehicle of this.state?.vehicles??[]) {
      const p=this.vehiclePoint(this.state,vehicle),old=this.previous?.vehicles.find(v=>v.id===vehicle.id);
      if(old&&t<1){const q=this.vehiclePoint(this.previous,old);p.x=q.x+(p.x-q.x)*smooth;p.y=q.y+(p.y-q.y)*smooth;}
      objects.push({depth:p.worldZ-p.worldX+60,draw:()=>this.drawVehicle(vehicle,p)});
    }
    objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());this.drawLabels();
    if(t<1&&this.previous&&!this.motion.matches)this.frame=requestAnimationFrame(time=>this.draw(time));
  }
  close(){cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();}
}
