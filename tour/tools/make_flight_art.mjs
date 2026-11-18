// Outdoor flying course and collectible stamps. All artwork is drawn on integer grids.
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canvas, put, rect, box, save, scale } from './pixel.mjs';

const out = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '../img/games');
const navy = '#243850', cream = '#fff4ce', jade = '#369a98', coral = '#db8070';
function write(folder, name, art) {
  mkdirSync(join(out, folder), { recursive: true });
  save(join(out, folder), name + '.png', art);
}
function polygon(c, pts, color) {
  for (let y = 0; y < c.h; y++) {
    const hits = [];
    pts.forEach(([x1,y1], i) => {
      const [x2,y2] = pts[(i+1)%pts.length];
      if (y+.5 >= Math.min(y1,y2) && y+.5 < Math.max(y1,y2))
        hits.push(x1 + (x2-x1)*(y+.5-y1)/(y2-y1));
    });
    hits.sort((a,b) => a-b);
    for (let i=0;i<hits.length;i+=2) {
      const x = Math.ceil(hits[i]-.5);
      rect(c,x,y,Math.ceil(hits[i+1]-.5)-x,1,color);
    }
  }
}
function disc(c,x,y,rx,ry,color) {
  for (let j=-ry;j<=ry;j++) for (let i=-rx;i<=rx;i++)
    if (i*i/(rx*rx)+j*j/(ry*ry)<=1) put(c,x+i,y+j,color);
}
function diamond(c,x,y,s,color) {
  for(let i=-s;i<=s;i++) rect(c,x-Math.max(0,1-Math.abs(i)),y+i,1+2*Math.max(0,1-Math.abs(i)),1,color);
  rect(c,x-s,y,2*s+1,1,color);
}
function random(seed) {
  return n => {seed = (Math.imul(seed,1664525)+1013904223)>>>0; return Math.floor(seed/4294967296*n);};
}
function tree(c,x,y,seed) {
  const next = random(seed);
  disc(c,x+3,y+6,11,8,'#50844e');
  rect(c,x-2,y+3,4,11,'#735c42');
  disc(c,x,y,11,12,'#28594d');
  disc(c,x-1,y-2,9,10,'#418552');
  for (const [dx,dy] of [[-5,0],[3,4],[5,-3],[-2,-6],[-3,2]]) {
    disc(c,x+dx,y+dy,4,4,'#579a4b');
    disc(c,x+dx-1,y+dy-2,3,2,'#79b34b');
    rect(c,x+dx-2,y+dy-3,2,1,'#a2ca59');
  }
  for(let i=0;i<13;i++) {const dx=next(14)-7, dy=next(15)-8;put(c,x+dx,y+dy,'#8bbd53');}
}
function bench(c,x,y) {
  rect(c,x+2,y+2,5,14,'#b49a74');
  for(const yy of [y+2,y+11]) rect(c,x-1,yy,7,2,'#546357');
  box(c,x,y,5,15,'#c38c59','#855f48');
  rect(c,x+1,y+1,1,13,'#e6b779');
}
function course() {
  const c=canvas(180,320), next=random(517);
  rect(c,0,0,180,320,'#98c565');
  // A repeating masonry bond and contrasting verge read as a perimeter walk.
  for(const [left,w] of [[0,17],[163,17]]) {
    rect(c,left,0,w,320,'#d8c5a1');
    for(let y=0;y<320;y+=4) {
      rect(c,left,y,w,1,'#c4ac89');
      for(let x=left+((y%8)?3:0);x<left+w;x+=7) rect(c,x,y+1,1,3,'#c3ac91');
    }
  }
  for(const x of [17,161]) {
    rect(c,x,0,2,320,'#6e9b58');rect(c,x,0,1,320,'#8ead69');
  }
  for(let i=0;i<1500;i++) {
    const x=20+next(140), y=next(320);
    rect(c,x,y,1+next(3),1,['#94c063','#a1ca69','#9dc769'][next(3)]);
  }
  for(let i=0;i<115;i++) {
    const x=21+next(136),y=1+next(317);
    rect(c,x,y,3,1,'#85b55d');put(c,x-1,y-1,'#87b85c');put(c,x+2,y-1,'#86b65b');
    put(c,x+3,y-2,'#abcf72');
  }
  // Small flowering beds along the concrete perimeter, away from the play lane.
  for(const [x,y] of [[19,74],[152,130],[20,228],[151,291]]) {
    box(c,x,y,10,20,'#5c9659','#739761');
    for(let i=0;i<8;i++){const xx=x+2+next(6), yy=y+2+next(16);
      rect(c,xx,yy,2,2,'#80ae65');put(c,xx,yy-1,i%3?'#f2d780':'#ecd4b1');}
  }
  for(const [x,y] of [[4,26],[6,127],[3,185],[4,278],[177,59],[177,169],[175,249]])
    tree(c,x,y,y);
  for(const [x,y] of [[6,87],[166,98],[6,249],[166,209]]) bench(c,x,y);
  // Red-brick school garden walls, with pale coping, gateposts and blue iron rails.
  for(const [x,y] of [[0,49],[173,115],[0,206],[173,274]]) {
    box(c,x,y,7,28,'#ba7961','#905f51');
    for(let j=2;j<27;j+=3){rect(c,x+1,y+j,5,1,'#d29d7d');put(c,x+2+j%3,y+j+1,'#d29d7d');}
    rect(c,x+5,y,2,28,'#e8c8a0');
    for(const yy of [y-2,y+26]) box(c,x-1,yy,9,5,'#e6cba4','#a99075');
  }
  return scale(c,2);
}
function plane(bank=0) {
  const c=canvas(24,32);
  const nose=bank?9:12, left=2, right=bank?20:22, keel=bank?15:12;
  polygon(c,[[nose,2],[right,25],[keel+2,23],[keel,29],[keel-2,23],[left,25]],navy);
  polygon(c,[[nose,5],[keel-2,21],[left+2,23]],cream);
  polygon(c,[[nose,5],[right-2,23],[keel+1,21]],bank?'#91b9b4':'#c0d7c9');
  polygon(c,[[nose,7],[keel-1,21],[keel,26],[keel+1,21]],jade);
  polygon(c,[[nose,6],[keel-3,20],[left+3,22]],'#fffdf0');
  polygon(c,[[right-5,20],[right-2,23],[right-5,22]],jade);
  if(bank>0) for(let y=0;y<c.h;y++) for(let x=0;x<c.w/2;x++) {
    const a=(y*c.w+x)*4,b=(y*c.w+c.w-1-x)*4;
    for(let k=0;k<4;k++) [c.data[a+k],c.data[b+k]]=[c.data[b+k],c.data[a+k]];
  }
  return scale(c,2);
}
function band(c,cx,cy,rx,ry,thick,color) {
  for(let y=-ry;y<=ry;y++) for(let x=-rx;x<=rx;x++) {
    if(x*x/(rx*rx)+y*y/(ry*ry)<=1 && x*x/(rx-thick)**2+y*y/(ry-thick)**2>=1)
      put(c,cx+x,cy+y,color);
  }
}
function ring() {
  const c=canvas(32,32);
  band(c,16,17,14,10,4,'#98633e');band(c,16,16,14,10,3,'#ecc35d');
  band(c,16,15,13,9,1,'#fff1a4');
  diamond(c,5,10,3,cream);diamond(c,27,20,2,cream);
  return scale(c,2);
}
function thermal() {
  const c=canvas(32,32);
  for(let arm=0;arm<3;arm++) for(let i=0;i<=115;i++) {
    const t=i/115, angle=arm*2*Math.PI/3+t*2.9, radius=3+11*t;
    const x=Math.round(15.5+radius*Math.cos(angle)), y=Math.round(15.5+.81*radius*Math.sin(angle));
    rect(c,x,y,2,t>.15&&t<.82?3:2,'#397e83');rect(c,x,y,1+(t>.25&&t<.8),1,t>.76?cream:'#a6eee1');
  }
  diamond(c,16,16,2,cream);
  return scale(c,2);
}
function landing() {
  const c=canvas(48,48);
  band(c,24,25,21,20,4,'#3e725f');band(c,24,24,20,19,4,'#7aa859');
  band(c,24,24,19,18,1,cream);band(c,24,24,12,11,1,'#f8e8ab');
  for(const [x,y,w,h] of [[23,4,3,7],[23,38,3,7],[3,23,7,3],[38,23,7,3]])
    box(c,x,y,w,h,'#f8d184','#826b50');
  diamond(c,24,24,4,cream); put(c,24,24,jade);
  return scale(c,2);
}
function stamps() {
  const c=canvas(24,24);
  for(const [x,y,r,col] of [[9,10,7,coral],[15,15,7,jade]]) {
    disc(c,x,y+1,r,r,navy);disc(c,x,y,r,r,navy);disc(c,x,y,r-1,r-1,'#dcbf89');
    disc(c,x,y,r-2,r-2,col);rect(c,x-3,y-4,3,1,cream);
    if(col===jade) diamond(c,x,y,3,cream);
    else polygon(c,[[x-3,y-1],[x-1,y-2],[x,y-1],[x+2,y-2],[x+3,y],[x,y+3]],cream);
  }
  write('stamps','goods',scale(c,2));
  const f=canvas(24,24);
  polygon(f,[[2,12],[22,3],[16,21],[11,16],[7,19],[7,15]],navy);
  polygon(f,[[4,12],[20,5],[9,14]],cream);
  polygon(f,[[9,15],[19,7],[11,15],[9,17]],jade);
  polygon(f,[[12,15],[21,5],[16,19]],'#bcded3');
  rect(f,2,18,3,1,'#ce9f60');rect(f,1,20,2,1,'#ce9f60');
  write('stamps','paperplane',scale(f,2));
}
for(const [name,art] of [['course',course()],['plane-neutral',plane()],['plane-left',plane(-1)],['plane-right',plane(1)],['ring',ring()],['thermal',thermal()],['landing',landing()]])
  write('paperplane',name,art);
stamps();
