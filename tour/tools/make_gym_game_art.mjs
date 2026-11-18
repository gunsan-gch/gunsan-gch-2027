/* 수아 선배의 체육관 3종 경기 — original, integer-grid pixel artwork.
 * node tour/tools/make_gym_game_art.mjs [output img/games directory]
 * Shared pixel.mjs PNG pipeline. No fonts, gradients, external images or
 * intermediate alpha. Backdrops have deliberately quiet playable areas.
 * Metadata is printed to stdout; this generator never edits the manifest.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { PALETTE, canvas, put, rect, box, frame, scale, save } from './pixel.mjs';

const OUT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '../img/games');
const P = { ...PALETTE, ink:'#25344c', cream:'#fff9eb', mint:'#b8ddcf', mintDark:'#6aab99',
  mintPale:'#e7f1e7', coral:'#df7c81', coralLight:'#f7b2a4', wood:'#d6ad83',
  woodLight:'#edcfa3', woodLine:'#c69d78', woodDark:'#98766e', gold:'#d89a47',
  goldLight:'#ffe69a', hair:'#493841', hairLight:'#72505a', skin:'#ffd5b3', skinShade:'#eeb08d' };
const records = [];
function output(folder, name, c, description) {
  const dir = join(OUT, folder); mkdirSync(dir, { recursive:true }); save(dir, name, c);
  records.push({ path:`games/${folder}/${name}`, width:c.w, height:c.h, description,
    sha256:createHash('sha256').update(readFileSync(join(dir,name))).digest('hex') });
}
function disc(c,x,y,r,color) {
  for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++)
    if(dx*dx+dy*dy<=r*r) put(c,x+dx,y+dy,color);
}
function ellipse(c,x,y,rx,ry,color) {
  for(let dy=-ry;dy<=ry;dy++) for(let dx=-rx;dx<=rx;dx++)
    if(dx*dx*ry*ry+dy*dy*rx*rx<=rx*rx*ry*ry) put(c,x+dx,y+dy,color);
}
function paste(c,src,x,y) {
  for(let sy=0;sy<src.h;sy++) for(let sx=0;sx<src.w;sx++) {
    const i=(sy*src.w+sx)*4, xx=x+sx, yy=y+sy;
    if(src.data[i+3] && xx>=0 && yy>=0 && xx<c.w && yy<c.h)
      c.data.set(src.data.subarray(i,i+4),(yy*c.w+xx)*4);
  }
}
function sparkle(c,x,y,color=P.gold) {
  rect(c,x,y-2,1,5,color); rect(c,x-2,y,5,1,color);
}
function wood(c) {
  rect(c,0,0,c.w,c.h,P.woodLight);
  for(let y=0;y<c.h;y+=20) {
    rect(c,0,y,c.w,1,P.woodLine);
    for(let x=(y%40 ? 26:66);x<c.w;x+=80) rect(c,x,y,1,20,P.woodLine);
  }
}
// Glazed clerestory, slatted benches and folded team towels sit outside the lanes.
function windows(c,y,h) {
  rect(c,0,y,c.w,h,'#adbdad');
  for(let x=5;x<c.w;x+=40) {
    box(c,x,y+1,34,h-3,'#a3c8c4','#698989');
    rect(c,x+2,y+2,29,2,'#eaf3df');
    rect(c,x+15,y+2,2,h-5,'#e0ebd7');
    rect(c,x+1,y+h-4,32,1,'#709b9b');
  }
  rect(c,0,y+h-2,c.w,2,'#526b66');
}
function bench(c,x,y) {
  rect(c,x+2,y+2,13,43,'#bd936c');
  for(const dy of [4,31]) rect(c,x-1,y+dy,15,3,'#536266');
  box(c,x,y,12,39,'#cd8c58','#785c50');
  rect(c,x+2,y+1,2,36,'#efbe82'); rect(c,x+6,y+1,1,37,'#a57151');
  rect(c,x-1,y+7,11,9,P.mintPale); rect(c,x-1,y+12,11,2,P.coral);
}
function house(c,x,y,r) {
  disc(c,x,y,r,P.N); disc(c,x,y,r-2,P.mintDark);
  disc(c,x,y,Math.round(r*32/45),P.cream); disc(c,x,y,Math.round(r*20/45),P.coral);
  disc(c,x,y,Math.round(r*.18),P.cream);
}
function target(c,x,y,r) {
  const edge=r<24 ? 1:2;
  disc(c,x,y,r,P.N); disc(c,x,y,r-edge,P.mint);
  disc(c,x,y,Math.floor(r*.76),P.N); disc(c,x,y,Math.floor(r*.76)-edge,P.cream);
  disc(c,x,y,Math.floor(r*.53),P.N); disc(c,x,y,Math.floor(r*.53)-edge,P.coral);
  disc(c,x,y,Math.floor(r*.29),P.N); disc(c,x,y,Math.floor(r*.29)-edge,P.goldLight);
  if(r>=24) disc(c,x,y,Math.max(2,Math.round(r*.08)),P.N);
}
function spriteRows(rows,palette) {
  const c=canvas(rows[0].length,rows.length);
  rows.forEach((row,y)=>Array.from(row).forEach((ch,x)=>put(c,x,y,palette[ch])));
  return c;
}
function stone(color) {
  const palette = { ...P, C:color, H: color === P.coral ? '#ffd0ab' : '#d5fff0' };
  return scale(spriteRows([
    '............','....NNNNN...','...NHHHCNN..','...NN..NCN..',
    '..NNCCCCNNN.','.NHHCCCCCCN.','NCCCCCCCCCCN','NSSSSSSSSSDN',
    'NSSWSWSSDDDN','.NDDDDDDDDN.','..NNNNNNNN..','............'
  ],palette),2);
}
function racket() {
  return scale(spriteRows([
    '......NNNN..','....NNGGGGN.','...NGWWGWGN.','...NWGWGWGWN',
    '..NGWWGWWGWN','..NWGGWGGGWN','..NGWWGWWGN.','..NGGWGWGN..',
    '...NWWWGN...','...NGGNN....','...NNN......','...NDN......',
    '..NCN.......','..NHN.......','.NCN........','.NN.........'
  ],{ ...P,G:'#78bca7',C:P.coral,H:P.coralLight }),2);
}
function shuttle() {
  return spriteRows([
    '................','..NN...NN.......','.NWWN.NWWN.NN...',
    '.NWWNNWWNNNWWN..','..NWWNWWNNWWN...','..NWWNWGNWWN....',
    '...NGNWGNGWN....','...NGNWGNGN.....','....NWWGGGN.....',
    '....NNWWGNN.....','.....NNNNN......','.....NHHHN......',
    '.....NHOON......','......NON.......','.......N........','................'
  ],{...P,G:'#92c6b4',H:'#ffdc93'});
}
function sua() {
  const c=canvas(32,32);
  // Athletic high bun, coral headband and mint zip-up sports jacket.
  rect(c,12,1,8,2,P.ink); rect(c,10,3,12,5,P.ink); rect(c,12,2,8,5,P.hair);
  rect(c,13,2,4,1,P.hairLight); rect(c,11,6,10,2,P.coral);
  rect(c,8,8,16,14,P.ink); rect(c,9,7,14,15,P.hair);
  rect(c,10,11,12,11,P.skin); rect(c,12,22,8,2,P.skinShade);
  rect(c,8,14,2,5,P.skinShade); rect(c,22,14,2,5,P.skinShade);
  rect(c,10,9,12,3,P.hair); rect(c,10,11,3,3,P.hair);
  rect(c,13,11,3,2,P.hair); rect(c,20,11,2,4,P.hair);
  rect(c,10,8,12,1,P.coral); rect(c,11,9,4,1,P.coralLight);
  rect(c,11,15,3,1,P.ink); put(c,11,16,P.ink); rect(c,18,15,3,1,P.ink); put(c,20,16,P.ink);
  rect(c,10,18,3,1,P.coralLight); rect(c,20,18,2,1,P.coralLight);
  rect(c,14,19,4,2,P.ink); rect(c,15,19,2,1,P.cream);
  rect(c,13,23,6,3,P.skin);
  rect(c,8,25,16,7,P.ink); rect(c,6,27,20,5,P.ink);
  rect(c,9,26,14,6,P.mint); rect(c,7,28,18,4,P.mintDark);
  rect(c,10,27,12,5,P.mint); rect(c,13,25,6,2,P.N); rect(c,15,27,2,5,P.N);
  rect(c,16,27,1,5,P.cream); rect(c,7,29,4,1,P.cream); rect(c,21,29,4,1,P.cream);
  rect(c,19,28,2,2,P.coral); put(c,19,28,P.cream);
  // Raised open hand makes her energetic silhouette distinct from other guides.
  rect(c,26,21,4,6,P.ink); rect(c,27,21,1,5,P.skin); rect(c,29,22,1,4,P.skin);
  rect(c,25,24,4,3,P.skin); rect(c,24,27,5,4,P.ink); rect(c,25,27,3,3,P.mint);
  return scale(c,2);
}
function hall() {
  const c=canvas(320,160); wood(c);
  windows(c,0,15);
  rect(c,0,154,320,6,P.woodDark);
  // Left: a clear wooden curling lane and its three rings.
  box(c,14,26,88,110,P.wood,P.cream); house(c,58,53,23);
  rect(c,20,106,76,2,P.cream); rect(c,20,126,76,2,P.cream);
  paste(c,stone(P.coral),45,98); paste(c,stone(P.mintDark),17,131);
  // Center: circular soft target set inside a quiet mint activity zone.
  box(c,116,26,88,110,P.mintPale,P.mintDark); target(c,160,68,35);
  rect(c,128,118,64,2,P.coral); disc(c,150,126,4,P.coral); disc(c,170,126,4,P.mintDark);
  // Right: badminton court, sideline seats and net.
  box(c,218,26,88,110,P.mintDark,P.N); frame(c,224,32,76,98,P.cream);
  frame(c,230,32,64,98,P.cream); rect(c,224,62,76,1,P.cream); rect(c,224,96,76,1,P.cream);
  rect(c,261,32,1,30,P.cream); rect(c,261,96,1,34,P.cream);
  rect(c,220,78,84,2,P.N); rect(c,220,77,84,2,P.cream);
  for(let x=224;x<302;x+=5) rect(c,x,80,1,4,P.cream);
  rect(c,220,77,2,10,P.N); rect(c,302,77,2,10,P.N);
  // Benches, towels and bottle silhouettes stay outside the games.
  for(const x of [26,135,245]) {
    box(c,x,19,36,4,P.woodDark,P.N); rect(c,x+3,23,3,3,P.N); rect(c,x+30,23,3,3,P.N);
    rect(c,x+9,17,10,5,P.cream); rect(c,x+9,19,10,1,P.coral);
  }
  box(c,280,142,6,9,P.mint,P.N); rect(c,281,140,4,2,P.N);
  rect(c,113,32,2,102,P.cream); rect(c,210,32,2,102,P.cream);
  return c;
}
function badmintonCourt() {
  const c=canvas(320,240); wood(c);
  windows(c,0,11); bench(c,8,52); bench(c,299,157);
  box(c,32,14,256,214,'#356e68',P.N); rect(c,36,18,248,206,'#69a79a');
  for(const y of [26,74,130,202]) rect(c,46,y,228,y===74?28:12,'#71ac9d');
  // Main lines are 2px wide. Opponent area y=50, player y=145..205 clear.
  frame(c,46,26,228,190,P.cream); frame(c,47,27,226,188,P.cream);
  rect(c,60,26,2,190,P.cream); rect(c,258,26,2,190,P.cream);
  rect(c,46,74,228,2,P.cream); rect(c,46,130,228,2,P.cream);
  rect(c,159,26,2,48,P.cream); rect(c,159,130,2,86,P.cream);
  rect(c,46,202,228,2,P.cream); rect(c,46,36,228,2,P.cream);
  // The net's top band is centered at y=100, its mesh stays above play area.
  rect(c,35,98,250,4,P.N); rect(c,37,99,246,2,P.cream);
  rect(c,38,103,244,11,'#437772');
  for(let x=40;x<282;x+=6) rect(c,x,103,1,11,P.mintPale);
  rect(c,38,106,244,1,P.mintPale); rect(c,38,111,244,1,P.mintPale);
  box(c,32,96,6,22,P.woodLight,P.N); box(c,282,96,6,22,P.woodLight,P.N);
  rect(c,26,118,18,3,P.woodDark); rect(c,276,118,18,3,P.woodDark);
  return c;
}
function curlingRink() {
  const c=canvas(320,240); wood(c);
  // Warm wood mini-curling lane, boundaries x=34 and x=286.
  windows(c,0,10); bench(c,8,58); bench(c,298,154);
  rect(c,36,12,249,216,'#f6ddb0');
  for(let x=50;x<283;x+=22) rect(c,x,16,1,209,'#eed2a4');
  rect(c,33,12,3,216,P.N); rect(c,285,12,3,216,P.N);
  rect(c,36,12,2,216,P.cream); rect(c,283,12,2,216,P.cream);
  rect(c,38,14,245,2,P.cream); rect(c,38,225,245,2,P.cream);
  house(c,160,64,45);
  rect(c,38,145,245,2,P.coral); rect(c,38,194,245,2,P.cream);
  for(let y=116;y<190;y+=12) rect(c,159,y,2,4,P.cream);
  // Launch alignment mark is beneath the moving stone's starting center.
  rect(c,149,210,23,2,P.N); rect(c,159,201,2,20,P.N);
  rect(c,150,211,21,1,P.cream);
  for(const y of [19,64,109,145,194,223]) { rect(c,29,y,4,2,P.ink); rect(c,288,y,4,2,P.ink); }
  return c;
}
function board() {
  const c=canvas(320,240);
  wood(c);
  rect(c,0,0,320,173,'#dce6d5'); windows(c,0,29);
  for(let x=0;x<320;x+=32) {
    box(c,x,124,32,49,'#80aa9e','#73998e');
    rect(c,x+2,126,28,1,'#99b8a9');
  }
  rect(c,0,172,320,4,'#657d72');
  // The low stand and shadow ground the circular board in the gym.
  ellipse(c,162,227,90,5,'#d3ae87');
  for(const x of [105,207]) {
    box(c,x,183,8,42,'#ae805f','#6c6459');
    box(c,x-7,222,22,5,P.wood,'#6c6459');
  }
  disc(c,161,122,99,'#536d69'); disc(c,160,120,98,'#f6deb2');
  target(c,160,120,96);
  for(const [x,y] of [[160,26],[66,120],[254,120],[160,214]]) {
    disc(c,x,y,2,'#558c82'); put(c,x,y-1,P.mintPale);
  }
  return c;
}
function emblem(kind) {
  const c=canvas(24,24);
  if(kind==='curling') {
    house(c,12,9,8); const s=stone(P.coral); // Compact stone keeps badge edge clear.
    const small=canvas(12,12);
    for(let y=0;y<12;y++) for(let x=0;x<12;x++) { const i=(y*2*s.w+x*2)*4; small.data.set(s.data.subarray(i,i+4),(y*12+x)*4); }
    paste(c,small,6,11);
  } else if(kind==='target') { target(c,12,12,10); }
  else {
    const r=racket(); const small=canvas(12,16);
    for(let y=0;y<16;y++) for(let x=0;x<12;x++) { const i=(y*2*r.w+x*2)*4; small.data.set(r.data.subarray(i,i+4),(y*12+x)*4); }
    paste(c,small,3,6); paste(c,shuttle(),10,1);
  }
  return c;
}
function badge(kind) {
  const c=canvas(48,48);
  rect(c,13,3,22,42,P.N); rect(c,7,7,34,34,P.N); rect(c,3,13,42,22,P.N);
  rect(c,14,5,20,38,P.gold); rect(c,9,9,30,30,P.gold); rect(c,5,14,38,20,P.gold);
  rect(c,15,7,18,34,P.cream); rect(c,11,11,26,26,P.cream); rect(c,7,15,34,18,P.cream);
  rect(c,14,6,19,1,P.goldLight); rect(c,6,15,1,17,P.goldLight);
  // Unscaled emblem intentionally leaves the shared stepped frame visible.
  paste(c,emblem(kind),12,12); sparkle(c,12,12,P.gold); sparkle(c,36,35,P.mintDark);
  return c;
}
function trophy() {
  const c=canvas(32,32);
  box(c,7,26,19,5,P.N,P.ink); rect(c,9,27,15,2,P.mint);
  rect(c,14,19,5,7,P.gold); rect(c,15,20,2,5,P.goldLight);
  rect(c,10,25,13,1,P.goldLight);
  box(c,4,6,6,10,P.gold,P.N); rect(c,6,8,3,5,P.cream);
  box(c,23,6,6,10,P.gold,P.N); rect(c,24,8,3,5,P.cream);
  rect(c,8,4,17,11,P.N); rect(c,9,5,15,10,P.gold); rect(c,10,6,13,8,P.goldLight);
  rect(c,10,15,13,3,P.N); rect(c,11,15,11,3,P.gold); rect(c,13,18,7,2,P.N);
  rect(c,14,18,5,1,P.gold); rect(c,9,4,15,1,P.cream);
  // Three inset medals, one for each completed sport.
  disc(c,12,10,2,P.coral); disc(c,17,10,2,P.N); disc(c,22,10,2,P.mintDark);
  put(c,12,9,P.cream); put(c,17,9,P.cream); put(c,22,9,P.cream);
  sparkle(c,3,21,P.mintDark); sparkle(c,28,21,P.coral); sparkle(c,27,2,P.gold);
  return scale(c,2);
}

output('gym','guide-sua.png',sua(),'산호색 머리띠와 높은 올림머리, 민트 체육복으로 손을 흔드는 수아 선배');
output('gym','gym-hall.png',hall(),'나무 바닥 위 컬링·원형 표적·배드민턴의 세 구역이 있는 체육관');
output('gym','badminton-court.png',badmintonCourt(),'중앙 높이 100의 네트와 넓은 선수 공간이 있는 민트 배드민턴 코트');
output('gym','curling-rink.png',curlingRink(),'중심 160,64 반지름 45의 하우스와 160,210 출발점이 있는 나무 컬링 레인');
output('gym','target-board.png',board(),'체육관 창과 보호 매트 앞, 중심 160,120 반지름 96의 원형 타이밍 보드');
output('gym','racket.png',racket(),'민트 테두리와 산호색 손잡이의 배드민턴 라켓');
output('gym','shuttle.png',shuttle(),'크림색 깃털과 금빛 코르크의 셔틀콕');
output('gym','stone-coral.png',stone(P.coral),'산호색 손잡이와 회색 몸체의 컬링 스톤');
output('gym','stone-mint.png',stone(P.mintDark),'민트색 손잡이와 회색 몸체의 컬링 스톤');
output('gym','trophy.png',trophy(),'세 종목의 메달과 민트 받침을 갖춘 금빛 체육관 완주 트로피');
for(const kind of ['curling','target','badminton']) {
  output('gym',`icon-${kind}.png`,scale(emblem(kind),2),`${kind} 종목 픽셀 아이콘`);
  output('stamps',`${kind}.png`,badge(kind),`${kind} 종목 금테 완주 도장`);
}
console.log(JSON.stringify(records,null,2));
