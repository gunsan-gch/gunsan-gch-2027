// Original library illustrations. Coordinates use the native 320 × 176 game stage.
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canvas, rect, box, frame, put, save } from './pixel.mjs';
const root = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '../img/games');
const ink='#343443', deep='#4b4050', wood='#b87850', honey='#dfab71', light='#f4d39d', paper='#fff0cb', shadow='#947770', wall='#cfbda5', slate='#637783', sea='#488885', leaf='#81a582', gold='#f5bd65', rose='#d3796a';
const covers=[sea,'#a6575a','#7f7393','#50718b',honey,'#77906b','#e4c39e','#af7d7b'];
let seed=2607;
function next(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);}
function output(path,c){const directory=join(root,dirname(path));mkdirSync(directory,{recursive:true});save(directory,path.split('/').pop()+'.png',c);}
function oval(c,x,y,w,h,color){for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(((i+.5-w/2)/(w/2))**2+((j+.5-h/2)/(h/2))**2<=1)put(c,x+i,y+j,color);}
function poly(c,points,color){for(let y=0;y<c.h;y++){const hits=[];points.forEach(([x,a],i)=>{const [xx,b]=points[(i+1)%points.length];if(y+.5>=Math.min(a,b)&&y+.5<Math.max(a,b))hits.push(x+(xx-x)*(y+.5-a)/(b-a));});hits.sort((a,b)=>a-b);for(let i=0;i<hits.length;i+=2){const start=Math.ceil(hits[i]-.5);rect(c,start,y,Math.ceil(hits[i+1]-.5)-start,1,color);}}}
function line(c,x,y,xx,yy,color){const n=Math.max(Math.abs(xx-x),Math.abs(yy-y));for(let i=0;i<=n;i++)put(c,Math.round(x+(xx-x)*i/n),Math.round(y+(yy-y)*i/n),color);}
function plank(c,x,y,w,h){box(c,x,y,w,h,wood,deep);rect(c,x+1,y+1,w-2,2,light);rect(c,x+2,y+3,w-4,1,honey);for(let i=0;i<w/15;i++)rect(c,x+2+next(w-12),y+h-2,3+next(8),1,honey);}
function spine(c,x,y,w,h,color){box(c,x,y,w,h,color,deep);if(w>4){rect(c,x+1,y+2,1,h-4,light);rect(c,x+2,y+3,w-3,1,paper);}if(h>12){rect(c,x+1,y+h-6,w-2,3,paper);put(c,x+2,y+h-5,slate);if(w>5)rect(c,x+3,y+6,1,Math.min(h-12,5),deep);}}
function books(c,x,base,end,maxHeight){while(x<end-4){const w=Math.min(4+next(5),end-x),h=maxHeight-next(Math.floor(maxHeight*.4));spine(c,x,base-h,w,h,covers[next(covers.length)]);x+=w+next(2);}}
function stack(c,x,y,w,n){for(let j=0;j<n;j++){const offset=next(4);rect(c,x+offset,y-4*j,w,4,deep);rect(c,x+offset+1,y-4*j,w-2,1,covers[(j+2)%8]);rect(c,x+offset+2,y-4*j+1,w-4,2,paper);}}
function openBook(c,x,y,w){const a=Math.floor(w/2);for(const [o,d] of [[0,-1],[a,1]]){poly(c,[[x+o,y],[x+o+a,y+d*2],[x+o+a-2,y+8+d*2],[x+o-3,y+8]],deep);poly(c,[[x+o,y-1],[x+o+a,y+d*2-1],[x+o+a-2,y+6+d*2],[x+o-2,y+6]],paper);for(let k=0;k<2;k++)line(c,x+o+2,y+1+k*2,x+o+a-3,y+1+k*2+d,honey);}}
function lamp(c,x,y,r){rect(c,x,y-32,1,32,slate);oval(c,x-r,y,r*2,r*2,wood);oval(c,x-r+1,y,r*2-2,r*2-2,light);oval(c,x-r+2,y+1,r+1,r+1,paper);}
function room(){const c=canvas(320,176);rect(c,0,0,320,176,wall);rect(c,0,0,320,20,'#ddd2bb');rect(c,0,18,320,5,shadow);rect(c,0,22,320,2,light);for(const x of [30,127,235]){poly(c,[[x,4],[x+29,4],[x+25,7],[x-4,7]],slate);rect(c,x,4,25,2,paper);}rect(c,0,82,320,94,'#c4b7aa');for(let y=89;y<176;y+=14)rect(c,0,y,320,1,'#b5a69e');for(let x=-310;x<510;x+=58)line(c,Math.round(160+(x-160)*34/127),82,x,175,'#b5a69e');return c;}
function windowBay(c,x,y,w,h){box(c,x,y,w,h,slate,deep);rect(c,x+3,y+3,w-6,h-6,'#b0cfca');for(let i=0;i<w-8;i+=8){const height=4+next(10);rect(c,x+3+i,y+h-4-height,Math.min(8,w-6-i),height,'#8aaaa4');}for(let i=2;i<w-6;i+=29){rect(c,x+i,y+2,2,h-4,paper);line(c,x+i+4,y+13,x+i+12,y+5,'#d9e6d7');}rect(c,x+2,y+Math.floor(h/2),w-4,2,slate);}
function smallShelf(c,x,y,w,h){box(c,x,y,w,h,deep,ink);for(let i=1;i<=2;i++){const b=y+Math.floor((h-3)*i/2);books(c,x+3,b,x+w-3,Math.floor(h/2)-4);rect(c,x+1,b,w-2,3,honey);}rect(c,x,y,3,h,wood);rect(c,x+w-3,y,3,h,wood);rect(c,x,y,w,2,light);}
function plant(c,x,y){rect(c,x,y-14,2,15,deep);for(const [dx,dy] of [[-6,-15],[2,-17],[-9,-10],[1,-10]]){oval(c,x+dx,y+dy,9,5,sea);rect(c,x+dx+2,y+dy,4,1,leaf);}poly(c,[[x-5,y],[x+7,y],[x+5,y+8],[x-3,y+8]],rose);rect(c,x-6,y,14,2,light);}
function shelfScene(){const c=room();rect(c,3,13,314,151,deep);rect(c,8,19,304,139,'#64525a');for(const [x,w] of [[10,95],[111,99],[217,92]]){for(const base of [62,103,145]){if(x===111&&base===103){books(c,x+3,base,x+49,29);stack(c,x+60,base-4,35,3);}else if(x===10&&base===145){books(c,x+2,base,x+56,33);stack(c,x+57,base-4,27,4);}else{books(c,x+2,base,x+w-3,base===62?32:31);}}}
// A few front-facing jackets break up the rows of spines.
for(const [x,y,cover,shape] of [[78,36,sea,0],[123,73,rose,1],[260,118,slate,2]]){
  box(c,x,y,18,26,cover,ink);rect(c,x+1,y+1,1,23,light);
  if(shape===0){oval(c,x+9,y+4,5,5,gold);poly(c,[[x+2,y+18],[x+8,y+9],[x+12,y+14],[x+15,y+10],[x+17,y+19]],leaf);}
  if(shape===1){line(c,x+6,y+18,x+12,y+7,paper);oval(c,x+4,y+10,6,4,leaf);oval(c,x+9,y+6,5,4,light);}
  if(shape===2){oval(c,x+5,y+6,9,10,gold);oval(c,x+8,y+4,8,9,slate);put(c,x+13,y+13,paper);}
  rect(c,x+4,y+21,10,1,paper);
}
for(const x of [4,105,210,310]){box(c,x,17,6,144,wood,deep);rect(c,x+1,17,2,144,honey);}for(const y of [14,62,103,145,157])plank(c,2,y,316,y===145?10:6);for(const x of [36,143,248]){box(c,x,64,16,4,honey,wood);rect(c,x+3,65,10,1,paper);}return c;}
function chair(c,x,y){line(c,x+4,y+13,x+1,y+28,deep);line(c,x+17,y+13,x+20,y+28,deep);oval(c,x,y+8,22,10,deep);oval(c,x+1,y+8,20,8,slate);box(c,x,y-7,22,14,'#ddd9c6',slate);rect(c,x+2,y-5,18,6,paper);rect(c,x+8,y+3,7,2,slate);}
function table(c,x,y,w,h){const mid=x+Math.floor(w/2);rect(c,mid-3,y+h-1,6,17,slate);line(c,mid,y+h+14,mid-17,y+h+18,deep);line(c,mid,y+h+14,mid+17,y+h+18,deep);oval(c,x,y+3,w,h,shadow);oval(c,x,y,w,h,'#e9d8b5');oval(c,x+2,y+1,w-4,h-5,'#faeac7');}
function tablesScene(){const c=room();smallShelf(c,2,30,82,52);windowBay(c,88,28,144,44);smallShelf(c,239,27,79,54);for(const x of [26,61,206,253])chair(c,x,89);table(c,1,88,130,27);table(c,183,83,132,28);openBook(c,58,96,27);stack(c,216,96,24,2);plant(c,277,90);chair(c,8,115);chair(c,107,111);chair(c,279,109);chair(c,108,130);chair(c,190,130);table(c,66,126,191,39);openBook(c,145,140,34);stack(c,96,144,24,2);line(c,195,145,205,139,rose);chair(c,219,166);return c;}
function counterScene(){const c=room();windowBay(c,8,28,84,46);smallShelf(c,185,38,130,41);lamp(c,120,12,7);lamp(c,145,18,9);lamp(c,171,12,6);poly(c,[[0,87],[289,87],[320,103],[320,176],[0,176]],wood);poly(c,[[0,89],[285,89],[320,104],[320,111],[0,111]],ink);poly(c,[[0,84],[285,84],[320,100],[320,106],[0,106]],light);rect(c,0,109,320,4,paper);rect(c,0,114,320,5,gold);for(let x=3;x<320;x+=9){rect(c,x,122,2,54,honey);rect(c,x+2,122,1,54,'#a46950');}stack(c,36,99,43,4);box(c,104,54,58,37,slate,ink);box(c,107,56,52,31,'#a4c0bc',deep);poly(c,[[108,57],[135,57],[112,85],[108,85]],'#c6d5c6');rect(c,128,90,9,7,deep);rect(c,118,96,30,3,slate);poly(c,[[155,94],[185,94],[192,101],[152,101]],deep);for(let j=0;j<2;j++)for(let i=0;i<7;i++)rect(c,157+i*4,96+j*2,2,1,wall);box(c,227,85,47,17,sea,deep);rect(c,225,84,50,4,slate);for(let i=230;i<272;i+=6)rect(c,i,91,3,6,'#345963');plant(c,294,87);return c;}
output('bookshop/shelf',shelfScene());output('bookshop/tables',tablesScene());output('bookshop/counter',counterScene());
// Three bookmark cats, drawn pixel by pixel from letter grids.
// O outline · F fur · L light fur · M marking · T tail ring · P inner ear · E eye · W eye light · N nose · Z closed eye
const coats=[
  {O:'#3b2a2c',F:'#e7a05a',L:'#ffe9c4',M:'#b6633a',T:'#b6633a',P:'#f0a39c',E:'#2c2230',W:'#ffffff',N:'#e27c84',Z:'#5c3a30',K:'#f7c58a'},
  {O:'#1b1b26',F:'#43465c',L:'#f6f1e6',M:'#43465c',T:'#2e3044',P:'#e59aa1',E:'#f3c64f',W:'#1b1b26',N:'#e27c84',Z:'#1b1b26',K:'#5a5e78'},
  {O:'#3b2a2c',F:'#fff4e2',L:'#fffbf3',M:'#d98a4e',T:'#3f3a46',P:'#f0a39c',E:'#2c2230',W:'#ffffff',N:'#e27c84',Z:'#5c3a30',K:'#ffffff'}
];
function grid(c,x,y,rows,pal,{under=false}={}){rows.forEach((row,dy)=>[...row].forEach((k,dx)=>{if(k==='.')return;const px=x+dx,py=y+dy;if(under&&c.data[(py*c.w+px)*4+3])return;put(c,px,py,pal[k]);}));}
// Patches: the same outline, with some fur cells recoloured by coat.
function patch(c,pal,cells){for(const [x,y,w,h,k] of cells)for(let j=0;j<h;j++)for(let i=0;i<w;i++){const p=(y+j)*c.w+x+i,d=c.data.slice(p*4,p*4+3);const hx='#'+Buffer.from(d).toString('hex');if(c.data[p*4+3]&&hx===pal.F)put(c,x+i,y+j,pal[k]);}}
const SIT_HEAD=[
  '..OO............OO..',
  '.OFFO..........OFFO.',
  '.OFPFO........OFPFO.',
  '.OFPPFOOOOOOOOFPPFO.',
  'OFFPFFFFMMMFFFFFPFFO',
  'OFFFFFFFFMFFFFFFFFFO',
  'OFFFFFFFFFFFFFFFFFFO',
  'OFFOOWFFFFFFFFOOWFFO',
  'OFFOEEFFFFFFFFOEEFFO',
  'OFFFFFFFFLLFFFFFFFFO',
  'OKKFFFFFLNNLFFFFFKKO',
  '.OLLFFFFLLOLLFFFFLLO',
  '..OOLLLLLOLOLLLLOO..',
  '....OOOOOOOOOOOO....'];
const SIT_BODY=[
  '...OFFFFFFFFFFFFFFO...',
  '..OFFFFFLLLLLLFFFFFO..',
  '.OFFFFLLLLLLLLLLFFFFO.',
  '.OFFFLLLLLLLLLLLLFFFO.',
  'OFFFFLLLLLLLLLLLLFFFFO',
  'OFFFFLLLLLLLLLLLLFFFFO',
  'OFFFFFLLLLLLLLLLFFFFFO',
  'OFFFFFFLLLLLLLLFFFFFFO',
  'OFFFFFFFFFFFFFFFFFFFFO',
  'OFFFOLLLLOFFOLLLLOFFFO',
  '.OOOOLLLLOOOOLLLLOOOO.',
  '.....OOOO....OOOO.....'];
const SIT_TAIL=[
  '..OO..',
  '.OTFO.',
  '.OFTO.',
  '..OFTO',
  '..OTFO',
  '..OFTO',
  '..OTFO',
  '.OFTFO',
  'OFTFO.',
  'FTFO..',
  'FFO...'];
function cat(type,sleep){
  const c=canvas(36,28),pal=coats[type];
  if(sleep)return sleepCat(c,pal,type);
  grid(c,26,9,SIT_TAIL,pal);
  grid(c,7,14,SIT_BODY,pal);
  grid(c,8,1,SIT_HEAD,pal);
  if(type===0)patch(c,pal,[[10,5,2,1,'M'],[24,5,2,1,'M'],[8,16,3,1,'M'],[25,16,3,1,'M'],[8,19,3,1,'M'],[25,19,3,1,'M'],[8,22,4,1,'M'],[24,22,4,1,'M']]);
  if(type===2)patch(c,pal,[[9,1,5,4,'M'],[9,5,3,2,'M'],[22,1,5,3,'T'],[24,4,3,2,'T'],[22,15,5,2,'M'],[23,17,5,2,'M'],[25,19,3,2,'M'],[8,19,2,2,'T'],[8,21,3,2,'T']]);
  return c;
}
const SLEEP=[
  '....OO....OO..........................',
  '...OPFO..OFPO.......OOOOOOOOO.........',
  '...OPFFOOFFPO....OOOFFFFFFFFFOOO......',
  '..OFFFFMMFFFFO.OOFFFFFFFFFFFFFFFOO....',
  '..OFFFFFMFFFFFOFFFFFFFFFFFFFFFFFFFO...',
  '.OFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFO..',
  '.OFZZFFFFFFZZFFFFFFFFFFFFFFFFFFFFFFO..',
  '.OKFFFFLNLFFFKFFFFFFFFFFFFFFFFFFFFFFO.',
  '.OLLFFLLOLLFFLLFFFFFFFFFFFFFFFFFFFFFO.',
  '..OLLLLLLLLLLLOFFFFFFFFFFFFFFFFFFFFFO.',
  '...OOLLLLLLLOOFFFFFFFFFFFFFFFFFFFFFO..',
  '....OTTFTTFTTFTTFTTFTTFTFFFFFFFFFFO...',
  '...OTFTTFTTFTTFTTFTTFTTOOFFFFFFOOO....',
  '....OOOOOOOOOOOOOOOOOOO..OOOOOO.......'];
function sleepCat(c,pal,type){
  grid(c,0,12,SLEEP,pal);
  if(type===0)patch(c,pal,[[19,14,1,3,'M'],[23,13,1,4,'M'],[27,13,1,4,'M'],[31,15,1,3,'M'],[20,19,1,2,'M'],[25,19,1,3,'M'],[30,19,1,2,'M']]);
  if(type===1)patch(c,pal,[]);
  if(type===2)patch(c,pal,[[3,12,4,4,'M'],[20,14,6,3,'M'],[22,17,5,2,'M'],[29,16,4,2,'T'],[30,18,3,3,'T'],[16,18,3,2,'T']]);
  return c;
}
const PEEK_HEAD=[
  '.OO.........OO..',
  'OPFO.......OFPO.',
  'OPPFOOOOOOOFPPO.',
  'OFFFFFMMFFFFFFFO',
  'OFFFFFFMFFFFFFFO',
  'OFOWFFFFFFFOWFFO',
  'OFOEFFFFFFFOEFFO',
  'OKFFFFLNNLFFFFKO',
  'OLLFFFLOOLFFFLLO',
  'OOOOOOOOOOOOOOOO'];
const PEEK_TAIL=[
  '.........OO.....',
  '........OTFO....',
  '........OFTO....',
  '.........OTFO...',
  '.........OFTO...',
  '........OTFTO...',
  '.......OFTFO....',
  '......OTFTO.....',
  '.....OFTFO......',
  '....OTFTO.......',
  '...OFTFO........',
  '..OTFTO.........',
  '.OFTFO..........',
  'OTFTO...........',
  'OFTO............',
  'OOO.............'];
function peek(type){
  const c=canvas(16,16),pal=coats[type];
  if(type===0){grid(c,0,0,PEEK_TAIL,pal);return c;}
  grid(c,0,6,PEEK_HEAD,pal);
  if(type===2)patch(c,pal,[[1,6,5,4,'M'],[10,6,5,3,'T']]);
  return c;
}
for(let type=0;type<3;type++){output('bookshop/cat-'+type,cat(type,false));output('bookshop/sleep-'+type,cat(type,true));output('bookshop/peek-'+type,peek(type));}
function stamp(){const c=canvas(40,40);oval(c,1,1,38,38,ink);oval(c,2,2,36,36,honey);oval(c,4,4,32,32,paper);oval(c,6,6,28,28,sea);const catHead=cat(0,false);for(let y=0;y<15;y++)for(let x=8;x<28;x++){const i=(y*catHead.w+x)*4;if(catHead.data[i+3])put(c,x+2,y+6,'#'+Buffer.from(catHead.data.slice(i,i+3)).toString('hex'));}openBook(c,9,23,24);return c;}
output('stamps/bookshop',stamp());
