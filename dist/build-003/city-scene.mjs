// Presentation only: project emitted coordinates, draw emitted roads and paths,
// and interpolate between two already observed vehicle positions. No future
// guest state, route, job, delivery or collision is calculated here.
const assets=['university-block','oldtown-block','depot-block','warehouse-block','harbor-bridge','north-bridge','linden-tree','stone-house','cafe-house','flat-house','fountain'];
const labels={0:'Westgate',1:'North Quay',2:'North Campus',3:'University',4:'North Park',5:'Riverside Market',6:'Midtown',7:'Campus Gate',8:'West Heights',9:'Harbor West',10:'Harbor East',11:'Logistics Hub',12:'DEPOT',13:'Old Town',14:'Riverside South',15:'Central Square'};
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
    d[i+3]=Math.round(a*d[i+3]);
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
    this.s=this.w/124;this.sy=this.s*.58;this.origin={x:this.w*.50,y:Math.max(0,this.h-this.canvas.parentElement.clientHeight)+this.h*.025};
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
    this.tile(-30,20,-4,58,'#1b2928',-1.7);this.tile(-30,20,-4,58,'#465049');
    this.tile(-6,-8,26,75,'#1b2928',-1.7);this.tile(34,-8,78,75,'#1b2928',-1.7);
    this.tile(-6,-8,26,75,'#465049');this.tile(34,-8,78,75,'#465049');
    this.tile(26,-8,34,75,'#12313b',-.2);

    this.tile(26,-3,34,64,'#12313b',-.2);
    // Deterministic paving texture and inset gardens: no decorative road network.
    for(const [xa,xb,za,zb] of [[-30,-4,20,58],[-6,26,-8,75],[34,78,-8,75]]) {
      for(let x=xa;x<xb;x+=.8)for(let z=za;z<zb;z+=.8) {
        const shade=59+((Math.floor(x*2)*13+Math.floor(z*2)*7)%4+4)%4;
        this.tile(x+.025,z+.025,Math.min(x+.77,xb),Math.min(z+.77,zb),`rgb(${shade},${shade+6},${shade+2})`);
      }
    }
    for(const [x,z] of [[4,4],[4,24],[44,4],[44,24]]) {
      this.tile(x-1,z-1,x+13,z+13,'#5c6452',.06);
      this.tile(x-.65,z-.65,x+12.65,z+12.65,'#344c2f',.08);
      this.tile(x+.6,z+.6,x+11.4,z+11.4,'#4d5547',.10);
    }
    // Decorative peripheral plazas have no roadway or simulation role.
    for(const [x,z,k] of [[17,-5,.65],[50,72,.65],[20,70,.72],[40,72,.72]]) {
      this.tile(x-9*k,z-9*k,x+9*k,z+9*k,'#243430',-1.5);
      this.tile(x-9*k,z-9*k,x+9*k,z+9*k,'#667064',-.1);
    }
    for(const [a,b] of [[23,26],[34,37]]) {
      this.tile(a,-3,b,64,'#636b5e');
      for(let z=-3;z<64;z+=1.5)this.line(this.project(a,z),this.project(b,z),'#89907a',this.s*.035);
      for(const x of [a,a+1.5,b])this.line(this.project(x,-3),this.project(x,64),'#8a907b',this.s*.035);
    }
    for(const x of [26,34]) {
      this.line(this.project(x,-3,-.8),this.project(x,64,-.8),'#59666a',this.s*.65);
      this.line(this.project(x,-3),this.project(x,64),'#a49d87',this.s*.7);
      for(let z=-3;z<64;z+=2.2)this.line(this.project(x-.18,z),this.project(x+.18,z),'#d0c3a3',this.s*.07);
      for(let z=5;z<60;z+=10){const p=this.project(x,z),q=this.project(x,z,2.1);this.line(p,q,'#49564d',this.s*.12);c.save();c.shadowColor='#ffcc6f';c.shadowBlur=this.s*1.4;c.fillStyle='#ffdda0';c.beginPath();c.arc(q.x,q.y,this.s*.17,0,Math.PI*2);c.fill();c.restore();}
    }
    for(const [xa,xb,za,zb] of [[-30,-6,20,58],[-6,26,58,75],[34,78,58,75]]) {
      const a=this.project(xa,za),b=this.project(xa,zb),d=this.project(xb,zb);
      const aa=this.project(xa,za,-1.7),bb=this.project(xa,zb,-1.7),dd=this.project(xb,zb,-1.7);
      this.polygon([a,b,bb,aa],'#29332f');this.polygon([b,d,dd,bb],'#353d35');
      this.line(b,d,'#92947d',this.s*.14);this.line(a,b,'#707866',this.s*.1);
    }
    // Water glints are a decorative material, with no simulated movement or state.
    c.globalAlpha=.25;
    for(let i=0;i<36;i++) {
      const x=27+(i*7%6),z=(i*13%60),p=this.project(x,z,-.2);
      this.line(p,{x:p.x+this.s*1.15,y:p.y+this.sy*.65},i%3?'#364c75':'#c3b08a',Math.max(.5,this.s*.06));
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
  }
  drawRoadMarks() {
    if(!this.state)return;const c=this.ctx;
    for(const road of this.state.roads) {
      const a=this.roadPoint(road,.45),b=this.roadPoint(road,.55),angle=Math.atan2(b.y-a.y,b.x-a.x);
      c.save();c.translate(a.x,a.y);c.rotate(angle);c.translate(0,this.s*.8);
      c.beginPath();c.moveTo(-this.s*.25,-this.s*.15);c.lineTo(0,0);c.lineTo(-this.s*.25,this.s*.15);c.strokeStyle=road.open?'#a7aa98':'#fbac72';c.lineWidth=this.s*.1;c.stroke();c.restore();
      if(!road.open){const p=this.roadPoint(road,.28);c.save();c.translate(p.x,p.y);c.rotate(angle);this.line({x:0,y:0},{x:0,y:this.s*1.45},'#ffad73',this.s*.5);c.restore();}
    }
  }
  drawBridges() {
    if(!this.state)return;const seen=new Set(),c=this.ctx;
    for(const road of this.state.roads) {
      if(!this.bridge(road))continue;
      const pair=[road.from,road.to].sort((a,b)=>a-b).join(':');if(seen.has(pair))continue;seen.add(pair);
      const first=this.state.nodes.find(n=>n.id===road.from),second=this.state.nodes.find(n=>n.id===road.to);
      const a=first.x<second.x?this.roadPoint(road,.15):this.roadPoint(road,.85),b=first.x<second.x?this.roadPoint(road,.85):this.roadPoint(road,.15);
      const s=this.sprites.get(road.toll?'harbor-bridge':'north-bridge');if(!s)continue;
      const start={x:s.width*.158,y:s.height*(road.toll?.791:.805)},end={x:s.width*.901,y:s.height*(road.toll?.189:.21)};
      const dx=end.x-start.x,dy=end.y-start.y,scale=Math.hypot(b.x-a.x,b.y-a.y)/Math.hypot(dx,dy);
      c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(b.y-a.y,b.x-a.x)-Math.atan2(dy,dx));c.scale(scale,scale);c.drawImage(s,-start.x,-start.y);c.restore();
    }
  }
  drawRoute() {
    const vehicle=this.state?.vehicles.find(v=>v.id===this.selected);if(!vehicle?.path.length)return;
    const c=this.ctx;c.save();c.lineCap='round';c.lineJoin='round';
    for(let i=1;i<vehicle.path.length;i++) {
      const road=this.state.roads.find(r=>r.from===vehicle.path[i-1]&&r.to===vehicle.path[i]);if(!road)continue;
      c.beginPath();for(let j=0;j<=20;j++){const p=this.roadPoint(road,j/20);j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}
      c.shadowColor=road.open?'#d5fc66':'#eebc77';c.shadowBlur=this.s*1.1;c.strokeStyle='rgba(200,246,92,.35)';c.lineWidth=this.s*1.15;c.stroke();
      c.shadowBlur=0;c.strokeStyle=road.open?'#d4fa75':'#eebc77';c.setLineDash(road.open?[]:[this.s*.7,this.s*.45]);c.lineWidth=this.s*.64;c.stroke();c.setLineDash([]);
      const p=this.roadPoint(road,.60),q=this.roadPoint(road,.62),a=Math.atan2(q.y-p.y,q.x-p.x);
      c.save();c.translate(p.x,p.y);c.rotate(a);c.beginPath();c.moveTo(-this.s*.65,-this.s*.42);c.lineTo(0,0);c.lineTo(-this.s*.65,this.s*.42);c.strokeStyle='#e0ff8d';c.lineWidth=this.s*.26;c.stroke();c.restore();
    }
    c.restore();
  }
  drawHouse(name,x,z,scale=1) {
    const sprite=this.sprites.get(name);if(!sprite)return;
    const p=this.project(x,z),width=this.s*13.5*scale,height=width/sprite.width*sprite.height;
    this.ctx.save();this.ctx.shadowColor='#071007a0';this.ctx.shadowBlur=this.s;this.ctx.shadowOffsetX=this.s*1.2;this.ctx.shadowOffsetY=this.sy*.8;
    this.ctx.drawImage(sprite,p.x-width/2,p.y+this.sy*3*scale-height*.97,width,height);this.ctx.restore();
  }
  drawFountain(x,z) {
    const sprite=this.sprites.get('fountain');if(!sprite)return;
    const p=this.project(x,z),width=this.s*8,height=width/sprite.width*sprite.height;
    this.ctx.drawImage(sprite,p.x-width/2,p.y+this.sy*2-height*.84,width,height);
  }
  drawBuilding(name,x,z,scale=1) {
    const sprite=this.sprites.get(name);if(!sprite)return;
    const width=this.s*35.0*scale,height=width/sprite.width*sprite.height*.91,p=this.project(x,z);
    const anchors={'university-block':.902,'market-block':.912,'depot-block':.866,'homes-block':.893,'warehouse-block':.893,'oldtown-block':.941};
    this.ctx.drawImage(sprite,p.x-width*.5,p.y+this.sy*17*scale-height*anchors[name],width,height);
  }
  drawTree(x,z,scale=1) {
    const sprite=this.sprites.get('linden-tree');if(!sprite)return;
    const p=this.project(x,z),width=this.s*5.8*scale,height=width/sprite.width*sprite.height;
    this.ctx.save();this.ctx.filter='brightness(.80) saturate(1.2) hue-rotate(8deg)';this.ctx.shadowColor='#06120abb';this.ctx.shadowBlur=this.s*.65;this.ctx.shadowOffsetX=this.s*.55;this.ctx.shadowOffsetY=this.s*.38;
    this.ctx.drawImage(sprite,p.x-width/2,p.y-height*.965,width,height);this.ctx.restore();
  }
  drawLamp(x,z) {
    // Fixed street furniture and its pool of light have no guest semantics.
    const c=this.ctx,p=this.project(x,z),top=this.project(x,z,2.8);
    c.save();c.translate(p.x,p.y);c.scale(1,.58);
    const glow=c.createRadialGradient(0,0,0,0,0,this.s*2.4);
    glow.addColorStop(0,'#ffcd6726');glow.addColorStop(1,'#ffcd6700');
    c.fillStyle=glow;c.beginPath();c.arc(0,0,this.s*2.4,0,Math.PI*2);c.fill();c.restore();
    this.line(p,top,'#26312a',this.s*.16);
    this.line(top,{x:top.x+this.s*.65,y:top.y},'#8c8a70',this.s*.12);
    c.save();c.shadowColor='#ffc568';c.shadowBlur=this.s*1.6;c.fillStyle='#ffdda2';
    c.fillRect(top.x+this.s*.42,top.y,this.s*.43,this.s*.15);c.restore();
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
    const width=this.s*7.2,height=width/sprite.width*sprite.height;
    this.ctx.save();this.ctx.shadowColor='rgba(0,0,0,.65)';this.ctx.shadowBlur=this.s*.55;
    this.ctx.translate(point.x,point.y);if(mirror)this.ctx.scale(-1,1);
    this.ctx.drawImage(sprite,-width*.5,-height*.71,width,height);this.ctx.restore();
  }
  drawLabels() {
    if(!this.state)return;
    const c=this.ctx,selected=this.state.vehicles.find(v=>v.id===this.selected);
    const show=new Set(this.w<600?[12]:[12,4,3,7,11,15,8]);if(selected){show.add(selected.node);show.add(selected.goal);}
    for(const node of this.state.nodes) {
      if(!show.has(node.id))continue;
      const p=this.project(node.x,node.z),radius=Math.max(9,this.s*1.65),k=this.w/1050,offset=node.id===12?{x:-74*k,y:-51*k}:node.id===15?{x:-125*k,y:-3*k}:node.id===3?{x:0,y:14}:[4,8].includes(node.id)?{x:-(node.id===8?100:75)*k,y:-32*k}:{x:0,y:-8};
      if(node.id===12||node.id===15)this.line(p,{x:p.x+offset.x,y:p.y+offset.y},'#adc683',1);
      c.save();c.translate(p.x+offset.x,p.y+offset.y);c.shadowColor='#000';c.shadowBlur=8;
      c.beginPath();c.arc(0,0,radius,0,Math.PI*2);c.fillStyle='#151c18';c.fill();c.strokeStyle=selected?.goal===node.id?'#e3ff96':'#c8e476';c.lineWidth=2;c.stroke();
      c.shadowBlur=0;c.font=`650 ${Math.max(12,this.s*1.85)}px InterVariable, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f5f6e9';c.fillText(String(node.id),0,.5);
      c.font=`520 ${Math.max(11,this.s*1.75)}px InterVariable, sans-serif`;
      const alignLeft=this.w<600&&p.x+offset.x>this.w-95;c.textAlign=alignLeft?'right':'left';
      const lines=placeName(node.id).split(' '),labelX=alignLeft?-radius-8:radius+8,labelY=-2;
      if(lines.length>1){c.fillText(lines[0],labelX,labelY-5);c.fillText(lines.slice(1).join(' '),labelX,labelY+12);}else c.fillText(placeName(node.id),labelX,labelY);
      c.restore();
    }
    for(const [from,to,title] of [[1,2,'North Bridge'],[5,6,'Market Bridge'],[9,10,'Harbor Bridge']]) {
      const road=this.state.roads.find(r=>r.from===from&&r.to===to);if(!road)continue;
      const p=this.roadPoint(road,.5);c.save();c.font=`520 ${Math.max(11,this.s*1.65)}px InterVariable, sans-serif`;c.shadowColor='#000';c.shadowBlur=7;c.fillStyle='#f2f2e8';c.fillText(title,p.x+13,p.y+28);
      c.fillStyle=road.open?(road.toll?'#ffcc75':'#d6f77a'):'#ffad73';c.fillText(road.open?(road.toll?`Toll ${road.toll}`:'Free'):'Closed to departures',p.x+13,p.y+46);c.restore();
    }
  }
  draw(now) {
    if(!this.w||!this.h)return;
    cancelAnimationFrame(this.frame);const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.w,this.h);
    this.ground();this.drawRoads();this.drawBridges();this.drawRoute();this.drawRoadMarks();
    const objects=[
      ['oldtown-block',-14,36,1.07],['depot-block',10,50],['university-block',65,23],['warehouse-block',50,50,1.03],
    ].map(([name,x,z,scale=1])=>({depth:z-x+60+9*scale,draw:()=>this.drawBuilding(name,x,z,scale)}));
    const houses=[
      ['flat-house',5,5],['cafe-house',14,13],['cafe-house',5,14,.8],['stone-house',14,5,.72],
      ['flat-house',5,25],['cafe-house',14,26,.92],['stone-house',12,35,.9],
      ['flat-house',45,6,.95],['cafe-house',54,14],
      ['flat-house',45,25,.95],['cafe-house',54,34],['flat-house',54,25,.82],
      ['cafe-house',17,-8],['flat-house',33,-5,1.05],
      ['flat-house',20,71],['cafe-house',40,72],['stone-house',50,73,.85],['cafe-house',-3,31,.85],['flat-house',-3,50,.85],['flat-house',68,48,.95],['stone-house',68,65,.85],['flat-house',5,70,.9],
    ];
    for(const [name,x,z,scale=1] of houses)objects.push({depth:z-x+60+4*scale,draw:()=>this.drawHouse(name,x,z,scale)});
    for(const [x,z] of [[5,15],[45,35],[15,69]])objects.push({depth:z-x+60+2,draw:()=>this.drawFountain(x,z)});
    const trees=[];
    // Fixed ornamental planting never supplies graph edges or guest state.
    for(const [x,z] of [[4,4],[4,24],[44,4],[44,24]])for(const [dx,dz] of [[0,5],[0,9],[7,13],[11,12],[13,8]])trees.push([x+dx,z+dz]);
    for(const z of [3,8,13,25,30,35])trees.push([18,z],[42,z]);
    for(const x of [3,8,13,48,53,57])trees.push([x,57]);
    for(const z of [3,8,13,23,28,33])trees.push([63,z]);
    for(const x of [24,36])for(const z of [6,13,22,29,48,56])trees.push([x,z]);
    for(const x of [8,14,20,38,44,50,56,62,68,74])trees.push([x,-5]);
    for(const z of [64,69,73])trees.push([16,z],[60,z]);
    for(const z of [8,14,20,26,32,38,44,50,56,62])trees.push([75,z],[-4,z]);
    for(const x of [21,28,35,42,49,56])trees.push([x,65]);
    for(const x of [-27,-22,-17,-12,-7])trees.push([x,55]);
    for(const x of [2,8,14,20,38,44,50,56,62,68,74])trees.push([x,73]);
    for(const [x,z] of trees)objects.push({depth:z-x+60,draw:()=>this.drawTree(x,z,.85+((x*7+z*3)%7+7)%7*.035)});
    for(const x of [9,15,21])for(const z of [68,72])objects.push({depth:z-x+60,draw:()=>this.drawTree(x,z,.85)});
    for(const [x,z] of [[-2,4],[-2,24],[-2,44],[18,16],[18,36],[18,56],[42,4],[42,24],[42,44],[58,16],[58,36],[58,56],[8,62],[48,62]])objects.push({depth:z-x+60,draw:()=>this.drawLamp(x,z)});
    const vehicleObjects=[];
    const t=this.motion.matches?1:Math.min(1,(now-this.transition)/650),smooth=t*t*(3-2*t);
    for(const vehicle of this.state?.vehicles??[]) {
      const p=this.vehiclePoint(this.state,vehicle),old=this.previous?.vehicles.find(v=>v.id===vehicle.id);
      if(old&&t<1){const q=this.vehiclePoint(this.previous,old);p.x=q.x+(p.x-q.x)*smooth;p.y=q.y+(p.y-q.y)*smooth;}
      vehicleObjects.push({depth:p.worldZ-p.worldX+60,draw:()=>this.drawVehicle(vehicle,p)});
    }
    objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
    // Vehicles are a legibility overlay at their observed coordinates, above foliage.
    vehicleObjects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());this.drawLabels();
    // Fade the decorative rear edge below the title without moving any guest data.
    c.save();c.globalCompositeOperation='destination-in';const fade=c.createLinearGradient(0,0,0,72);fade.addColorStop(0,'#0000');fade.addColorStop(1,'#000');c.fillStyle=fade;c.fillRect(0,0,this.w,this.h);c.restore();
    if(t<1&&this.previous&&!this.motion.matches)this.frame=requestAnimationFrame(time=>this.draw(time));
  }
  close(){cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();}
}
