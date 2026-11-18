// Original festival sprites. Run with Node 24, optionally supplying an output directory.
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canvas, rect, put, box, frame, scale, save } from './pixel.mjs';

const out = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '../img/games');
const ink='#293249', cream='#fff2ce', amber='#e8ac55', gold='#ffd879', teal='#419c9b', mint='#a4e1c6', rose='#d96270', pink='#ffa79a', plum='#674764', blue='#536889', skin='#ffcfaa', shade='#e99983';
function output(path,c,k=1) {
  const dir=join(out,dirname(path));
  mkdirSync(dir,{recursive:true});
  save(dir,path.split('/').pop()+'.png',k===1?c:scale(c,k));
}
// Scan-convert polygons on pixel centers.
function poly(c,points,color) {
  for(let y=0;y<c.h;y++){
    const hits=[];
    points.forEach(([x1,y1],i)=>{
      const [x2,y2]=points[(i+1)%points.length], scan=y+.5;
      if(scan>=Math.min(y1,y2)&&scan<Math.max(y1,y2)) hits.push(x1+(x2-x1)*(scan-y1)/(y2-y1));
    });
    hits.sort((a,b)=>a-b);
    for(let i=0;i<hits.length;i+=2){
      const x=Math.ceil(hits[i]-.5);
      rect(c,x,y,Math.ceil(hits[i+1]-.5)-x,1,color);
    }
  }
}
function oval(c,x,y,w,h,color){
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)
    if(((i+.5-w/2)/(w/2))**2+((j+.5-h/2)/(h/2))**2<=1)put(c,x+i,y+j,color);
}
function panel(c,x,y,w,h,color){
  box(c,x,y,w,h,color,ink); rect(c,x+1,y+1,w-2,1,cream);
}
function sparkle(c,x,y,color){rect(c,x,y-2,1,5,color);rect(c,x-2,y,5,1,color);}
function camera(c,x,y){
  box(c,x+3,y,5,3,blue,ink);panel(c,x,y+2,15,9,blue);
  rect(c,x+1,y+4,3,2,gold);oval(c,x+6,y+3,8,7,ink);
  oval(c,x+7,y+4,6,5,teal);rect(c,x+8,y+4,2,2,cream);
}
function ledger(c,x,y){
  panel(c,x,y,12,14,teal);rect(c,x+2,y+2,2,10,mint);
  rect(c,x+5,y+4,5,4,cream);rect(c,x+6,y+5,3,1,amber);
  rect(c,x+2,y+12,9,1,cream);
}
function parcel(c,x,y){
  panel(c,x,y,14,10,amber);rect(c,x+6,y+1,3,5,cream);
  rect(c,x+2,y+7,4,1,plum);rect(c,x+10,y+7,2,1,plum);
}
function portrait(type){
  const c=canvas(40,40), press=type==='press', crew=type==='logistics';
  const hair=press?'#564159':crew?'#77483f':'#393b54', shine=press?'#816279':crew?'#ad7051':'#5f617b';
  if(crew){oval(c,27,8,11,16,ink);oval(c,28,9,9,13,hair);rect(c,28,10,3,3,amber);}
  oval(c,6,2,26,24,ink);oval(c,7,3,24,22,hair);
  if(!crew){rect(c,6,13,26,14,ink);rect(c,7,15,24,10,hair);}
  poly(c,[[2,40],[3,31],[8,26],[15,24],[24,24],[32,27],[37,32],[38,40]],ink);
  poly(c,[[4,40],[5,32],[9,28],[15,26],[24,26],[31,29],[35,33],[36,40]],crew?teal:press?blue:plum);
  rect(c,15,22,8,5,shade);
  poly(c,[[12,26],[16,25],[19,28],[22,25],[26,26],[22,32],[19,30],[16,32]],cream);
  rect(c,18,30,3,6,crew?amber:press?pink:mint);
  oval(c,10,7,19,18,shade);oval(c,11,7,17,17,skin);
  poly(c,[[7,15],[9,7],[13,5],[23,4],[29,9],[29,14],[24,12],[21,8],[20,13],[17,14],[18,10],[15,13],[12,14],[10,18]],hair);
  rect(c,13,6,7,1,shine);rect(c,11,7,4,1,shine);
  for(const x of [14,23]){rect(c,x,15,3,1,ink);rect(c,x+1,16,2,2,ink);put(c,x+1,16,cream);}
  rect(c,12,19,3,1,pink);rect(c,25,19,2,1,pink);rect(c,18,20,4,1,rose);
  if(press){rect(c,8,11,5,2,mint);camera(c,7,27);}
  else if(crew){poly(c,[[6,11],[9,6],[14,4],[25,4],[29,7],[31,11]],rose);rect(c,7,9,23,2,pink);rect(c,20,11,14,2,ink);parcel(c,18,29);}
  else{for(const x of [12,22])frame(c,x,14,7,5,ink);rect(c,19,15,3,1,ink);ledger(c,21,25);}
  const handX=press?7:crew?18:21;
  oval(c,handX-1,33,4,4,shade);rect(c,handX,33,3,2,skin);
  return c;
}
function stamp(type){
 const c=canvas(24,24);
 oval(c,1,1,22,22,ink);oval(c,2,2,20,20,amber);oval(c,3,3,18,18,gold);
 oval(c,4,4,16,16,type==='press'?blue:type==='logistics'?teal:plum);
 if(type==='press')camera(c,5,6);else if(type==='logistics')parcel(c,5,7);else ledger(c,6,5);
 put(c,5,5,cream);put(c,18,18,cream);return c;
}
for(const type of ['press','logistics','reconcile']){
 output(type+'/guide',portrait(type),2); output('stamps/'+type,stamp(type),2);
}
function cargo(type){
 const c=canvas(32,32);
 if(type==='cart'){
  for(const x of [8,24]){oval(c,x-3,24,7,7,ink);oval(c,x-1,26,3,3,blue);}
  box(c,4,21,26,5,teal,ink);box(c,2,5,4,19,mint,ink);
  box(c,1,4,8,4,blue,ink); parcel(c,8,11);box(c,20,14,8,8,rose,ink);rect(c,23,15,2,3,cream);
 }else if(type==='drink'){
  panel(c,11,2,10,5,teal);poly(c,[[11,7],[20,7],[20,9],[24,13],[24,28],[21,30],[10,30],[7,27],[7,13],[11,9]],ink);
  poly(c,[[12,7],[19,7],[19,10],[22,14],[22,27],[20,28],[11,28],[9,26],[9,14],[12,10]],mint);
  rect(c,9,16,13,9,teal);rect(c,11,13,2,6,cream);oval(c,14,18,6,5,gold);put(c,17,17,cream);
 }else if(type==='cup'){
  poly(c,[[4,7],[28,7],[24,29],[8,29]],ink);poly(c,[[6,8],[26,8],[23,27],[10,27]],cream);
  poly(c,[[7,13],[25,13],[24,22],[9,22]],rose);oval(c,13,15,6,5,pink);
  panel(c,3,5,26,5,blue);box(c,6,2,20,4,mint,ink);
 }else{
  oval(c,2,7,28,20,ink);oval(c,3,8,26,17,'#c97c46');oval(c,4,8,23,14,amber);
  for(const x of [8,14,20])poly(c,[[x+2,10],[x+5,10],[x+1,16],[x-1,15]],cream);
  rect(c,8,23,15,1,'#e3974d');
 }
 return c;
}
for(const item of ['cart','drink','cup','bread'])output('logistics/'+item,cargo(item),2);
function finance(type){
 const c=canvas(32,32);
 if(type==='receipt'){
  poly(c,[[6,2],[26,2],[26,30],[22,28],[19,30],[16,28],[13,30],[10,28],[6,30]],ink);
  poly(c,[[8,4],[24,4],[24,27],[22,26],[19,28],[16,26],[13,28],[10,26],[8,27]],cream);
  rect(c,10,6,11,3,teal);for(const y of [12,15,18]){rect(c,10,y,6,1,blue);rect(c,19,y,3,1,blue);}rect(c,10,22,12,2,rose);
 }else{
  poly(c,[[7,3],[24,3],[26,5],[28,25],[25,29],[7,29],[4,25],[5,6]],ink);
  poly(c,[[8,4],[23,4],[25,7],[26,24],[24,26],[8,26],[6,24],[7,7]],blue);
  panel(c,8,7,15,7,teal);rect(c,11,10,8,1,mint);
  for(let j=0;j<3;j++)for(let i=0;i<3;i++)rect(c,9+i*5,16+j*3,3,2,i===2?[rose,gold,mint][j]:cream);
 }
 return c;
}
for(const item of ['receipt','terminal'])output('reconcile/'+item,finance(item),2);
function pennants(c,y,colors){
 for(let i=0;i<16;i++){
  const x=i*15,h=y+Math.round(4*Math.sin(i*Math.PI/15));
  rect(c,x,h,15,1,ink);poly(c,[[x+3,h+1],[x+12,h+1],[x+7,h+7]],colors[i%colors.length]);
 }
}
function boards(c,y,shade,light){
 for(let j=0;y+j*8<120;j++){
  rect(c,0,y+j*8,240,1,shade);
  for(let x=(j%2)*15;x<240;x+=34){rect(c,x,y+j*8,1,8,shade);rect(c,x+4,y+j*8+3,7,1,light);}
 }
}
function gym(){
 const c=canvas(240,120);
 rect(c,0,0,240,120,'#c0dad2');rect(c,0,0,240,10,'#719797');
 for(let x=8;x<240;x+=38){
  box(c,x,17,29,29,'#86bdc3','#567f88');rect(c,x+2,19,25,24,'#bce1dc');
  poly(c,[[x+2,34],[x+15,20],[x+22,20],[x+2,41]],'#d5eee1');
  rect(c,x+13,18,2,27,'#6e9794');rect(c,x+1,31,27,2,'#6e9794');
  rect(c,x-1,46,31,2,'#849e90');
 }
 rect(c,0,54,240,25,'#8ab4a4');rect(c,0,56,240,2,'#9fc8b2');
 for(let x=0;x<240;x+=19)rect(c,x,59,1,19,'#7ca495');
 rect(c,0,78,240,42,'#e6b67e');boards(c,80,'#ce9c6d','#efc38c');
 for(const x of [22,207]){panel(c,x,39,15,11,'#f3e6c6');frame(c,x+4,43,7,5,rose);rect(c,x+4,49,8,2,rose);}
 poly(c,[[25,82],[28,82],[7,120],[3,120]],cream);
 poly(c,[[212,82],[215,82],[237,120],[233,120]],cream);rect(c,8,110,222,2,cream);
 for(const x of [100,139]){rect(c,x,74,2,24,blue);rect(c,x-2,97,6,2,ink);}
 rect(c,101,76,39,2,cream);
 for(let x=103;x<140;x+=4)rect(c,x,78,1,8,'#798887');
 for(const y of [80,84])rect(c,102,y,37,1,'#798887');
 pennants(c,7,[rose,amber,teal]);return c;
}
function bakery(){
 const c=canvas(240,120);rect(c,0,0,240,120,'#f4dfb9');
 for(let x=0;x<240;x+=16)rect(c,x,0,1,72,'#e6cea8');
 for(let x=0;x<240;x+=16){const stripe=(x/16)%2?cream:rose;
  rect(c,x,0,16,9,stripe);oval(c,x,3,16,12,stripe);}
 for(let x=15;x<145;x+=50){
  panel(c,x,23,37,27,'#a4ccbf');rect(c,x+4,26,12,18,'#d4e7cf');rect(c,x+18,24,2,24,'#917868');rect(c,x,48,37,3,'#9a7162');
 }
 for(const x of [5,41,76,113]){
  box(c,x,62,25,4,'#c79270',plum);oval(c,x+2,54,10,8,amber);oval(c,x+11,55,11,7,'#d69859');
  for(const offset of [5,8,15,18])rect(c,x+offset,56,1,3,cream);
 }
 rect(c,0,70,240,23,'#d59378');rect(c,0,68,240,4,'#a3655c');rect(c,0,69,240,1,'#f1b085');
 for(let x=5;x<240;x+=29){frame(c,x,74,25,15,'#b37c68');rect(c,x+9,76,8,1,cream);}
 rect(c,0,93,240,27,'#e7c7a4');
 for(let y=94;y<120;y+=8)for(let x=-12;x<240;x+=24){
  rect(c,x+(y%16?0:12),y,12,7,'#edd1af');}
 box(c,154,48,49,42,blue,ink);rect(c,156,50,45,6,'#8b9a9c');
 for(const x of [159,166,173])oval(c,x,51,3,3,ink);rect(c,187,52,9,2,mint);
 box(c,158,58,40,25,'#74535a',ink);rect(c,162,63,32,16,'#bd7153');
 rect(c,162,76,32,3,amber);rect(c,163,60,30,2,cream);
 for(const x of [167,178]){oval(c,x,68,10,7,'#f5ba68');rect(c,x+3,69,2,2,cream);}
 return c;
}
function music(){
 const c=canvas(240,120);rect(c,0,0,240,120,'#443754');
 for(let x=0;x<240;x+=12){rect(c,x,8,4,76,'#513c59');rect(c,x+4,8,2,76,'#5c415f');}
 for(const [x,col] of [[35,'#64577b'],[111,'#594c6c'],[197,'#436371']]){
  poly(c,[[x,11],[x+5,11],[x+24,84],[x-27,84]],col);
 }
 for(const right of [false,true]){
  for(let i=0;i<5;i++){
   const x=right?240-i*7:i*7;
   poly(c,[[x,0],[x+(right?-14:14),0],[x+(right?-5:5),42-i*5],[x,59-i*5]],i%2?'#995476':'#843f64');
  }
 }
 rect(c,0,81,240,39,'#796478');boards(c,84,'#6a566c','#877286');
 for(const x of [8,216]){
  panel(c,x,53,15,30,'#46445a');oval(c,x+3,57,9,9,ink);oval(c,x+3,68,10,11,ink);oval(c,x+6,71,4,5,'#626077');
 }
 rect(c,0,4,240,4,ink);
 for(const x of [33,109,195]){box(c,x,7,9,6,blue,ink);rect(c,x+2,12,5,2,gold);}
 for(const [x,y] of [[55,29],[80,45],[145,34],[181,49],[101,21]])sparkle(c,x,y,'#bd9eab');
 return c;
}
for(const [name,scene] of [['gym',gym],['bakery',bakery],['music',music]])output('press/'+name,scene());

// Map objects share a low baseline, leaving the upper corners transparent.
function woodenCrate(c,x,y,w,h){
 box(c,x,y,w,h,'#bf8250',ink);
 for(let j=3;j<h-1;j+=3)rect(c,x+1,y+j,w-2,1,'#94634b');
 poly(c,[[x+2,y+h-3],[x+w-5,y+1],[x+w-2,y+1],[x+5,y+h-2]],'#ecc285');
 rect(c,x+1,y+1,w-2,2,'#e1ad72');
 rect(c,x+1,y+h-3,w-2,2,'#d09660');
 for(const dx of [2,w-3]){put(c,x+dx,y+2,ink);put(c,x+dx,y+h-2,ink);}
}
function depot(){
 const c=canvas(48,32);
 box(c,5,4,38,24,'#63535b',ink);
 rect(c,7,6,34,21,'#897362');rect(c,9,7,30,19,'#6c6061');
 for(const [x,w,h] of [[10,10,6],[21,7,8],[29,8,6]]){
  box(c,x,15-h,w,h,amber,ink);rect(c,x+2,16-h,2,2,cream);
 }
 for(const [x,w] of [[9,13],[23,15]])woodenCrate(c,x,18,w,9);
 for(const y of [3,15,27]){
  box(c,3,y,42,3,blue,ink);rect(c,5,y+1,37,1,'#99a7a7');
 }
 for(const x of [5,40]){box(c,x,5,3,26,blue,ink);rect(c,x+1,7,1,20,'#9eada4');}
 return c;
}
function booth(isA){
 const c=canvas(48,32);
 const dark=isA?'#bd753c':'#3e8184', cloth=isA?gold:mint, pale=isA?cream:'#d3efdb';
 for(const x of [7,38])box(c,x,10,3,19,'#bb8a64',ink);
 // A has a pitched striped roof. B has a shallow canopy and a pennant.
 if(isA){
  poly(c,[[2,11],[9,4],[23,1],[39,4],[46,11],[46,14],[2,14]],ink);
  poly(c,[[5,11],[10,5],[23,2],[38,5],[43,11]],cloth);
  for(const x of [12,25])poly(c,[[x+3,5],[x+7,4],[x+5,11],[x,11]],pale);
 }else{
  rect(c,33,0,1,7,ink);poly(c,[[34,0],[43,1],[34,5]],rose);
  poly(c,[[2,11],[7,5],[40,5],[46,11],[46,14],[2,14]],ink);
  poly(c,[[5,11],[8,6],[39,6],[43,11]],cloth);
  rect(c,9,7,29,1,pale);
 }
 for(let i=0;i<7;i++){
  const x=3+i*6;rect(c,x,11,6,3,i%2?cloth:dark);rect(c,x+1,14,4,1,ink);
 }
 if(isA){
  for(const x of [12,22,30]){oval(c,x,16,7,5,'#ba7851');rect(c,x+2,17,3,1,cream);}
 }else{
  for(const x of [13,21,29]){box(c,x,16,5,5,teal,ink);rect(c,x+1,15,3,1,cream);}
 }
 box(c,5,20,38,10,dark,ink);rect(c,6,21,36,2,cream);
 rect(c,9,24,30,4,cloth);rect(c,11,25,26,1,pale);
 for(const x of [6,39])rect(c,x,30,3,1,ink);
 return c;
}
function stackedCrates(){
 const c=canvas(48,32);
 woodenCrate(c,13,2,18,10);woodenCrate(c,16,11,20,10);woodenCrate(c,10,20,28,11);
 return c;
}
for(const [name,art] of [['depot',depot()],['booth-a',booth(true)],['booth-b',booth(false)],['crate',stackedCrates()]])
 output('logistics/'+name,art);
