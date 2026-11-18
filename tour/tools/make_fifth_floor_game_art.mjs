// Fifth-floor tea room and festival miniatures. Optional argument: output games directory.
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canvas, rect, put, box, save } from './pixel.mjs';

const out = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '../img/games');
const ink = '#46383d', wood = '#976b50', cream = '#fff0cb', gold = '#eec273';
const jade = '#6faf9b', light = '#cde7c9', moss = '#49776e', plum = '#965778';
function write(folder, name, c) {
  mkdirSync(join(out, folder), { recursive: true });
  save(join(out, folder), name + '.png', c);
}
function oval(c,x,y,w,h,color) {
  for (let j=0;j<h;j++) for (let i=0;i<w;i++)
    if (((i+.5)/w-.5)**2 + ((j+.5)/h-.5)**2 <= .25) put(c,x+i,y+j,color);
}
function poly(c,points,color) {
  for(let y=0;y<c.h;y++) {
    const hits=[];
    points.forEach(([x,a],i)=>{
      const [z,b]=points[(i+1)%points.length];
      if(y+.5>=Math.min(a,b)&&y+.5<Math.max(a,b)) hits.push(x+(z-x)*(y+.5-a)/(b-a));
    });
    hits.sort((a,b)=>a-b);
    for(let i=0;i<hits.length;i+=2) {
      const x=Math.ceil(hits[i]-.5);
      rect(c,x,y,Math.ceil(hits[i+1]-.5)-x,1,color);
    }
  }
}
function blossom(c,x,y,color) {
  rect(c,x-2,y-1,5,2,color);rect(c,x-1,y-2,2,5,color);put(c,x,y,gold);
}
function room() {
  const c=canvas(320,176);
  rect(c,0,0,320,176,'#dccfb7');
  rect(c,0,0,320,22,'#bbb4a6');
  poly(c,[[0,3],[58,16],[234,16],[262,0],[267,0],[235,18],[57,18],[0,5]],cream);
  rect(c,0,23,320,2,'#f7e8cd');rect(c,0,25,320,2,'#b9aa95');
  // Broad blue classroom windows, half-lowered roller shades and a distant tree line.
  box(c,9,31,143,63,'#d7dfd5','#9a9189');
  for(let j=0;j<4;j++) {
    const x=12+34*j;
    box(c,x,34,33,57,'#a2ced5','#6b827e');
    rect(c,x+1,64,31,20,'#abcac0');
    for(let i=0;i<4;i++) oval(c,x+1+i*6,70+(i+j)%4,11,10,'#86afa2');
    rect(c,x+1,83,31,6,'#c2cdad');rect(c,x+1,57,31,1,'#e5e8d4');
    rect(c,x+8,53,1,34,'#c3dddb');rect(c,x+28,36,2,53,'#e2e9da');
    rect(c,x-1,32,35,15+j%2*4,'#e8e0cd');rect(c,x-1,46+j%2*4,35,2,'#c8beaa');
  }
  rect(c,6,93,149,3,'#b49b82');rect(c,6,93,149,1,cream);
  // Shelves of folded red seat cushions seen in the reference room.
  box(c,161,49,39,48,'#715047',wood);
  for(let j=0;j<4;j++) for(let i=0;i<2;i++) {
    const x=164+i*17,y=53+j*10;
    rect(c,x,y,13,4,'#ad655b');rect(c,x+2,y-1,10,1,'#d38b77');rect(c,x-1,y+6,17,2,'#d5a174');
  }
  box(c,234,35,57,10,'#eee1c4',wood);
  for (let i=0;i<3;i++) {oval(c,246+i*12,38,8,3,'#9fa48b');put(c,247+i*12,37,moss);}
  // Folding screen, with ink-painted stems and flowering branches.
  for(let i=0;i<5;i++) {
    const x=211+i*20,y=55+(i%2)*2;
    box(c,x,y,21,49,'#c9a678',wood);box(c,x+2,y+3,17,38,'#f1dcb3','#dfc198');
    for(let j=0;j<20;j++) {
      const a=x+6+Math.floor(j/5), b=y+34-j;
      put(c,a,b,'#737965');
      if(j%4===0) {rect(c,a-3,b-1,3,1,'#859077');rect(c,a+1,b-2,3,1,'#74917a');}
      if(j%7===2) blossom(c,a-2,b-2,i%2?'#d6a59a':'#ecd1aa');
    }
    rect(c,x+2,y+47,2,4,wood);rect(c,x+17,y+47,2,4,wood);
  }
  rect(c,0,110,320,15,'#c4b6a0');rect(c,0,108,320,3,'#a89986');
  [12,76,143,211,280].forEach(x=>{
    box(c,x,101,27,20,'#e1ceb1','#ab9981');rect(c,x+2,103,23,2,'#f7e9ce');
  });
  poly(c,[[0,125],[320,117],[320,176],[0,176]],'#b39677');
  poly(c,[[0,126],[320,118],[320,173],[0,173]],'#e7d7b7');
  poly(c,[[0,131],[320,123],[320,125],[0,133]],'#f8efda');
  poly(c,[[35,176],[67,125],[84,125],[54,176]],'#c1c9ae');
  poly(c,[[40,176],[71,125],[74,125],[44,176]],'#e1e2c5');
  for(let i=0;i<12;i++){const x=(i*79)%310,y=138+(i*11)%32;rect(c,x,y,5,1,'#decdae');}
  return c;
}
function pot() {
  const c=canvas(58,40);
  oval(c,1,11,23,20,ink);oval(c,3,13,19,16,jade);
  // Punch a hole through the handle before overlapping it with the body.
  for(let y=16;y<26;y++) for(let x=6;x<19;x++)
    if(((x-12)/7)**2+((y-21)/5.5)**2<1)c.data[(y*c.w+x)*4+3]=0;
  const spout=[[36,22],[44,20],[49,15],[51,10],[57,10],[57,14],[53,17],[50,23],[44,29],[37,29]];
  poly(c,spout,ink);poly(c,[[39,23],[46,20],[51,15],[52,12],[56,12],[52,16],[49,22],[44,27],[38,27]],jade);
  rect(c,52,10,5,2,moss);
  oval(c,12,9,33,27,ink);oval(c,14,10,29,24,moss);oval(c,14,11,27,20,jade);
  oval(c,17,16,7,9,'#9fd0b4');rect(c,19,16,3,2,light);
  oval(c,18,8,21,7,ink);oval(c,19,8,19,5,light);oval(c,21,7,15,4,jade);
  oval(c,25,3,7,6,ink);oval(c,26,4,5,4,moss);put(c,27,4,light);
  rect(c,22,34,14,2,ink);rect(c,23,34,12,1,moss);
  blossom(c,32,23,light);rect(c,29,26,3,1,moss);rect(c,34,20,3,1,moss);
  return c;
}
function cup(type) {
  const c=canvas(40,32);
  const body=[jade,'#d8ac81','#abb4cf'][type], highlight=[light,'#f7d7ab','#dfdded'][type];
  const shadow=[moss,'#a56c58','#797591'][type];
  const rim=[3,5,2][type],foot=[12,10,14][type];
  oval(c,foot,24,40-2*foot,6,ink);oval(c,foot+1,25,38-2*foot,4,shadow);
  poly(c,[[rim,7],[40-rim,7],[36,17],[31-type,24],[27,27],[13,27],[9+type,24],[4,17]],ink);
  poly(c,[[rim+2,8],[38-rim,8],[34,17],[29-type,23],[26,25],[14,25],[11+type,23],[6,17]],body);
  oval(c,rim,4,40-rim*2,8,ink);oval(c,rim+1,5,38-rim*2,6,highlight);
  oval(c,rim+3,6,34-rim*2,4,shadow);
  for(let y=8;y<=23;y++) {
    const left=9+Math.floor((y-8)/3);
    for(let x=left;x<40-left;x++) c.data[(y*c.w+x)*4+3]=0;
    put(c,left-2,y,type===1&&y%3===0?shadow:highlight);put(c,41-left,y,shadow);
  }
  if(type===1) {
    // A squared ear and block foot distinguish the amber handled cup.
    box(c,34,10,6,10,shadow,ink);
    for(let y=13;y<17;y++)for(let x=36;x<38;x++) c.data[(y*c.w+x)*4+3]=0;
    rect(c,11,27,18,2,shadow);rect(c,12,29,16,1,ink);
  } else if(type===2) {
    // A short stem and flared foot support the blue porcelain bowl.
    rect(c,16,26,8,3,shadow);rect(c,13,29,14,2,ink);rect(c,14,29,12,1,highlight);
    for(const x of [9,30]) {put(c,x,17,shadow);put(c,x,19,highlight);}
  }
  rect(c,15,25,10,1,highlight);
  return c;
}
function camera(c,x,y) {
  box(c,x,y+2,13,8,'#846679',ink);box(c,x+3,y,5,3,plum,ink);
  oval(c,x+5,y+3,6,6,ink);oval(c,x+6,y+4,4,4,'#a5d1c7');put(c,x+6,y+4,cream);
  rect(c,x+1,y+4,3,1,cream);
}
function booth(kind) {
  const c=canvas(40,36);
  const main={food:'#d58b4e',craft:'#5c9d82',photo:plum}[kind];
  const shine={food:'#ffd18a',craft:'#acd3a3',photo:'#e5acbb'}[kind];
  box(c,5,12,30,21,'#735950',ink);rect(c,7,14,26,10,'#a98067');
  box(c,4,11,3,23,wood,ink);box(c,33,11,3,23,wood,ink);
  poly(c,[[2,11],[8,3],[31,3],[38,10],[38,15],[2,15]],ink);
  for(let i=0;i<5;i++){
    const x=8+i*4.6, a=3+i*6.8;
    poly(c,[[x,4],[x+4.8,4],[a+7,11],[a,11]],i%2?cream:main);
    rect(c,Math.round(a),11,7,3,i%2?shine:main);
  }
  box(c,3,24,34,4,shine,ink);box(c,6,27,28,7,main,ink);
  rect(c,8,29,24,1,shine);rect(c,5,33,4,2,ink);rect(c,31,33,4,2,ink);
  if(kind==='food'){
    for(let i=0;i<3;i++){
      oval(c,9+6*i,19,7,5,'#e6ab5c');rect(c,11+6*i,19,3,1,cream);
      put(c,12+i*6,21,'#ae694d');
    }rect(c,8,23,21,1,cream);
    rect(c,29,18,3,6,'#c56d51');rect(c,29,17,3,1,cream);
  } else if(kind==='craft'){
    for(let i=0;i<3;i++){
      const x=11+i*7;rect(c,x+1,16,1,5,moss);
      blossom(c,x+1,17,['#efa692',gold,'#c3b2d8'][i]);
      rect(c,x-1,21,5,3,['#cb8069',jade,'#d5a36e'][i]);
    }
  } else {
    camera(c,14,14);rect(c,8,16,4,6,cream);rect(c,9,17,2,3,jade);
    rect(c,29,15,3,5,cream);put(c,30,17,plum);
  }
  return c;
}
function stage() {
  const c=canvas(40,36);
  box(c,3,6,34,26,'#555471',ink);
  box(c,2,4,36,5,'#799396',ink);
  for(let x=5;x<35;x+=6){rect(c,x,6,3,1,'#d5d1af');rect(c,x,9,2,2,gold);}
  for(const x of [5,29]) {
    poly(c,[[x,10],[x+6,10],[x+4,18],[x+6,26],[x,26]],'#b66574');
    rect(c,x,10,2,16,'#e99691');rect(c,x,18,5,2,gold);
  }
  // Piano keys and raised microphone distinguish the stage at icon size.
  box(c,11,21,10,4,'#e8decb',ink);rect(c,12,25,1,3,cream);
  rect(c,19,25,1,3,cream);for(const x of [13,16,18])put(c,x,22,ink);
  rect(c,24,16,1,12,'#b7c6c3');rect(c,22,27,5,1,cream);oval(c,23,14,4,4,ink);
  rect(c,24,14,2,2,cream);
  box(c,1,28,38,5,'#aa775c',ink);rect(c,4,30,32,1,gold);
  rect(c,12,33,16,2,wood);return c;
}
function gate() {
  const c=canvas(40,36);
  for(const x of [5,29]) {
    box(c,x,8,6,25,'#ba805d',ink);rect(c,x+1,12,2,19,'#e8b880');
    box(c,x-2,30,10,4,'#84908c',ink);
  }
  poly(c,[[2,10],[6,5],[13,5],[15,2],[25,2],[27,5],[34,5],[38,10],[38,13],[2,13]],ink);
  poly(c,[[4,10],[7,6],[14,6],[16,3],[24,3],[26,6],[33,6],[36,10]],'#658b81');
  rect(c,4,10,32,2,'#aac2a0');blossom(c,20,7,cream);
  for(let i=0;i<5;i++){
    const x=10+i*4,y=13+(i===2?2:1);
    poly(c,[[x,y],[x+4,y],[x+2,y+5]],i%2?gold:'#cc7880');
  }
  return c;
}
function stamp(kind, sprite) {
  const c=canvas(48,48), green=kind==='tea';
  oval(c,1,1,46,46,ink);oval(c,2,2,44,44,green?moss:plum);
  oval(c,4,4,40,40,cream);oval(c,6,6,36,36,green?'#aacbb0':'#e4bbad');
  const w=green?34:31,h=green?24:28,left=green?7:8,top=green?12:9;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const from=4*(Math.floor(y*sprite.h/h)*sprite.w+Math.floor(x*sprite.w/w));
    if(sprite.data[from+3])c.data.set(sprite.data.subarray(from,from+4),4*((top+y)*c.w+left+x));
  }
  blossom(c,24,39,cream);put(c,8,24,cream);put(c,39,24,cream);return c;
}
const kettle=pot(), arch=gate();
write('tea','room',room());write('tea','pot',kettle);
for(let i=0;i<3;i++)write('tea','cup-'+i,cup(i));
for(const kind of ['food','craft','photo'])write('booths',kind,booth(kind));
write('booths','stage',stage());write('booths','gate',arch);
write('stamps','tea',stamp('tea',kettle));write('stamps','booths',stamp('booths',arch));
