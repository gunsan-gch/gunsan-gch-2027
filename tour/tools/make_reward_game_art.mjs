/* 도장 8종·학과 배지 4종·완성 음료 3종. 기존 pixel.mjs 팔레트 확장.
 * node tour/tools/make_reward_game_art.mjs [출력 img/games 폴더]
 * 모두 48×48 투명 PNG. 글자·그라데이션·안티앨리어싱 없음.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { PALETTE as P, canvas, put, rect, box, save } from './pixel.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || join(ROOT, 'img/games');
const C = { ...P, gold: '#d29b36', darkGold: '#976331', paleGold: '#ffe4a0', green: '#305b49', rose: '#bd4860' };
function line(c, x, y, xx, yy, color, width = 1) {
  const n = Math.max(Math.abs(xx-x), Math.abs(yy-y));
  for(let i=0;i<=n;i++) rect(c,Math.round(x+(xx-x)*i/(n||1)),Math.round(y+(yy-y)*i/(n||1)),width,width,color);
}
function diamond(c,x,y,r,color) { for(let j=-r;j<=r;j++) rect(c,x-r+Math.abs(j),y+j,2*(r-Math.abs(j))+1,1,color); }
function coin(c,x,y,r=6) {
  for(let j=-r;j<=r;j++) {const a=Math.floor(Math.sqrt(r*r-j*j));rect(c,x-a,y+j,a*2+1,1,C.N);}
  for(let j=-r+1;j<r;j++) {const a=Math.floor(Math.sqrt((r-1)**2-j*j));rect(c,x-a,y+j,a*2+1,1,C.Y);}
  line(c,x-2,y-3,x-2,y+1,C.E); rect(c,x+2,y-1,1,4,C.gold);
}
function medal(fill) {
  const c=canvas(48,48);
  // 계단 모양 메달 테두리도 정수 좌표의 사각 픽셀로 그립니다.
  rect(c,13,3,22,42,C.N);rect(c,7,7,34,34,C.N);rect(c,3,13,42,22,C.N);
  rect(c,14,5,20,38,C.gold);rect(c,9,9,30,30,C.gold);rect(c,5,14,38,20,C.gold);
  rect(c,15,7,18,34,fill);rect(c,11,11,26,26,fill);rect(c,7,15,34,18,fill);
  line(c,14,6,32,6,C.paleGold);line(c,6,15,6,31,C.paleGold);
  diamond(c,39,8,2,C.Y); put(c,39,8,C.W);
  return c;
}
function bread(c) {
  box(c,13,21,23,13,C.gold);box(c,10,16,28,11,C.T);
  rect(c,14,13,20,4,C.N);rect(c,15,14,18,5,C.T);
  rect(c,12,18,24,10,C.T);rect(c,14,28,21,4,C.gold);
  for(const x of [17,23,29]) {line(c,x,18,x-2,23,C.gold,2);put(c,x-1,18,C.M);}
}
function keyboard(c) {
  box(c,9,17,30,18,C.N);rect(c,10,18,28,15,C.A);
  for(let y=20;y<=25;y+=5) for(let x=12;x<36;x+=5) box(c,x,y,4,4,C.E);
  box(c,17,30,15,3,C.E);line(c,23,16,23,11,C.N);line(c,23,11,29,11,C.N);
}
function mug(c) {
  box(c,30,20,9,10,C.E);rect(c,32,22,5,6,C.I);
  box(c,12,19,21,15,C.E);rect(c,14,21,17,3,C.K);rect(c,14,25,17,5,C.P);
  line(c,10,35,35,35,C.N,2);
  for(const x of [18,26]) {line(c,x,15,x-2,13,C.A);line(c,x-2,13,x,10,C.A);}
}
function receipt(c) {
  box(c,14,11,20,26,C.E);rect(c,17,15,14,3,C.P);
  for(const y of [21,26,31]) {rect(c,17,y,8,1,C.A);rect(c,28,y,3,1,C.N);}
  for(const x of [15,21,27]) rect(c,x,36,3,3,C.N);
  coin(c,34,31,6);
}
function rain(c) {
  box(c,10,15,29,10,C.L);box(c,15,11,19,12,C.L);rect(c,12,17,25,6,C.L);
  rect(c,17,13,13,3,C.I);
  for(const [x,y] of [[13,29],[23,32],[33,28]]) {box(c,x-3,y,7,7,C.E);rect(c,x-1,y+2,3,2,C.B);}
}
function megaphone(c) {
  box(c,12,20,11,10,C.E);box(c,20,17,5,16,C.R);box(c,25,14,7,22,C.P);
  rect(c,26,15,4,19,C.R);box(c,14,30,6,7,C.A);
  for(const [y,yy] of [[18,15],[24,24],[30,33]]) line(c,35,y,39,yy,C.gold,2);
}
function compass(c) {
  box(c,12,12,25,25,C.N);box(c,14,14,21,21,C.E);
  diamond(c,24,24,9,C.A);diamond(c,24,24,7,C.L);
  for(let y=16;y<25;y++) rect(c,24-Math.floor((y-16)/3),y,1+2*Math.floor((y-16)/3),1,C.R);
  for(let y=25;y<33;y++) rect(c,24-Math.floor((32-y)/3),y,1+2*Math.floor((32-y)/3),1,C.N);
  put(c,24,24,C.Y);rect(c,23,10,3,2,C.gold);
}
function shield(c) {
  for(let y=12;y<37;y++) {const half=y<26?12:Math.max(1,12-(y-25));rect(c,24-half,y,half*2+1,1,C.N);if(half>1)rect(c,25-half,y,half*2-1,1,C.G);}
  line(c,17,23,22,28,C.E,2);line(c,22,28,31,18,C.E,2);
}
function erp(c) {
  box(c,10,13,27,20,C.N);rect(c,12,15,23,15,C.I);
  for(let x=15;x<34;x+=6) rect(c,x,18,1,10,C.A);
  for(let y=18;y<29;y+=5) rect(c,14,y,20,1,C.A);
  rect(c,15,19,5,4,C.G);rect(c,21,24,5,4,C.Y);
  rect(c,22,33,4,3,C.N);rect(c,17,36,14,2,C.N);
}
function fintech(c) {
  box(c,11,12,20,26,C.N);rect(c,13,14,16,21,C.I);
  line(c,15,29,20,24,C.G,2);line(c,20,24,23,27,C.G,2);line(c,23,27,27,19,C.G,2);
  rect(c,19,36,4,1,C.E);coin(c,33,31,7);diamond(c,36,13,2,C.Y);
}
const stamps={bakery:[bread,C.M],typing:[keyboard,C.L],cafe:[mug,C.P],cashier:[receipt,C.M],rain:[rain,C.I],ai:[megaphone,C.P],career:[compass,C.L],phishing:[shield,'#dcebd9']};
const departments={erp:[erp,C.L],marketing:[megaphone,C.P],fintech:[fintech,'#dcebd9'],cafe:[mug,C.M]};
const generated=[];
function output(folder,name,c,description) {
  const dir=join(OUT,folder);mkdirSync(dir,{recursive:true});save(dir,name+'.png',c);
  generated.push({path:`games/${folder}/${name}.png`,description});
}
for(const [id,[draw,fill]] of Object.entries(stamps)){const c=medal(fill);draw(c);output('stamps',id,c,`게임별 도장 ${id}`);}
for(const [id,[draw,fill]] of Object.entries(departments)){const c=medal(fill);draw(c);output('departments',id,c,`학과 픽셀 배지 ${id}`);}
function coldDrink(latte=false) {
  const c=canvas(48,48);rect(c,25,3,3,28,C.N);rect(c,26,3,1,28,C.R);
  box(c,10,11,28,4,C.N);rect(c,11,12,26,2,C.I);
  for(let y=15;y<41;y++){const inset=Math.floor((y-15)/8);rect(c,12+inset,y,24-inset*2,1,C.N);rect(c,13+inset,y,22-inset*2,1,latte?(y<23?C.K:C.T):C.K);}
  rect(c,16,41,16,2,C.N);rect(c,14,17,2,13,C.W);rect(c,17,34,2,5,C.L);
  for(const [x,y] of [[18,17],[26,19],[21,25]]) {box(c,x,y,6,5,C.L,C.B);rect(c,x+1,y+1,3,1,C.I);}
  if(latte){rect(c,19,33,12,4,C.M);rect(c,20,37,10,2,C.T);}
  return c;
}
function hotDrink() {
  const c=canvas(48,48);box(c,31,19,11,14,C.E);rect(c,34,22,5,8,C.I);
  box(c,10,17,24,21,C.E);rect(c,12,19,20,5,C.T);rect(c,13,25,18,9,C.P);
  rect(c,11,38,22,2,C.N);rect(c,6,41,33,2,C.N);rect(c,10,40,26,1,C.A);
  rect(c,17,21,10,2,C.M);rect(c,20,20,4,4,C.M);
  for(const x of [16,25]) {line(c,x,13,x-2,10,C.A,2);line(c,x-2,10,x,6,C.A,2);}
  return c;
}
output('cafe','drink-americano',coldDrink(),'완성 아이스 아메리카노');
output('cafe','drink-hot-latte',hotDrink(),'완성 따뜻한 카페라떼');
output('cafe','drink-vanilla-latte',coldDrink(true),'완성 아이스 바닐라라떼');
if(!process.argv[2]) {
  const path=join(ROOT,'img/ASSET-SOURCES.json');const doc=JSON.parse(readFileSync(path,'utf8'));
  for(const {path:p,description} of generated) doc.sources[p]={output:p,kind:'game',description:`${description} — make_reward_game_art.mjs, 공통 팔레트의 48×48 투명 픽셀아트 (2026-11-15)`,sha256:createHash('sha256').update(readFileSync(join(ROOT,'img',p))).digest('hex')};
  writeFileSync(path,JSON.stringify(doc,null,2)+'\n');
}
