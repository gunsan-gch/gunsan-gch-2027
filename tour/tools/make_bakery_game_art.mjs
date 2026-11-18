/* 조리제빵실 32×32 픽셀 원화를 투명한 128×128 PNG로 출력합니다. */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETTE as P, canvas, rect, put, scale, save } from './pixel.mjs';

const OUT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'img', 'games', 'bakery');
mkdirSync(OUT, { recursive: true });

// 첫 줄부터 마지막 줄까지 좌우 경계를 따라 껍질과 밑면을 그립니다.
function loaf(top, spans, palette) {
  const c = canvas(32, 32);
  const [crust, shade, light] = palette;
  spans.forEach(([left, right], row) => {
    const y = top + row;
    for (let x = left; x <= right; x++) {
      const exposed = [spans[row - 1], spans[row + 1]].some(span => !span || x < span[0] || x > span[1]);
      const outline = exposed || x === left || x === right;
      const color = row >= spans.length - 4 || x >= right - 2 ? shade : x <= left + 2 && row < 9 ? light : crust;
      put(c, x, y, outline ? P.N : color);
    }
  });
  return c;
}

const dome = [[11,20],[8,23],[6,25],[5,26],[4,27],[3,28],[3,28],[2,29],[2,29],
  [2,29],[2,29],[2,29],[3,28],[3,28],[4,27],[5,26],[7,24],[10,21]];
const flat = [[12,19],[9,22],[7,24],[5,26],[4,27],[3,28],[3,28],[3,28],[4,27],[6,25],[9,22]];
const slumped = [[9,15],[7,18],[5,23],[4,25],[3,27],[2,28],[2,29],[2,29],
  [3,29],[3,28],[4,27],[5,26],[7,24],[10,21]];

function cut(c, x, y, color, light, length) {
  for (let i = 0; i < length; i++) {
    rect(c, x - i, y + i, 3, 2, color);
    put(c, x - i, y + i, light);
  }
}

function sparkle(c, x, y) {
  rect(c, x, y - 2, 1, 5, '#ad6826');
  rect(c, x - 2, y, 5, 1, '#ad6826');
  put(c, x, y, '#fff1ac');
}

const dough = loaf(15, flat, ['#f3ddba','#d6ac88','#fff2d6']);
cut(dough, 14, 18, '#d7b592', '#fff2d6', 3);
cut(dough, 20, 18, '#d7b592', '#fff2d6', 2);
const risen = loaf(7, dome, ['#fae5bf','#dbb78f','#fff6e4']);
for (const [x,y] of [[12,12],[19,14],[11,18],[23,17]]) {
  rect(risen,x,y,2,1,'#d3a981'); put(risen,x,y-1,'#fff6e4');
}

const perfect = loaf(8, dome, ['#e9a052','#b96238','#ffd38a']);
for (const x of [12,18,24]) cut(perfect, x, 12, '#af5e31', '#ffe1a0', 4);
sparkle(perfect, 4, 7); sparkle(perfect, 27, 5);
const good = loaf(10, dome.slice(0,-4).concat([[4,27],[6,25],[9,22]]), ['#eab875','#be814c','#ffdda2']);
for (const x of [14,22]) cut(good, x, 14, '#bd7f47', '#ffe3b2', 4);
const okay = loaf(12, slumped, ['#dca266','#a66340','#f8cb8c']);
cut(okay,13,15,'#a66340','#ffe2b0',3);
rect(okay,18,18,6,2,'#b47848'); rect(okay,20,17,3,4,'#b47848');
const raw = loaf(15, flat, ['#fff4d8','#d7c2a4','#fffaea']);
cut(raw,16,18,'#d4bea0','#fffaea',2);
const burnt = loaf(12, slumped, ['#72504a','#4e373a','#a36a53']);
for (const [x,y] of [[8,17],[15,15],[20,20],[12,20]]) {
  rect(burnt,x,y,5,2,'#4e373a'); rect(burnt,x+1,y-1,2,4,'#4e373a');
}
for (const [x,y] of [[12,4],[20,6]]) {
  rect(burnt,x,y,2,3,'#8c8393'); rect(burnt,x+1,y+3,2,2,'#8c8393'); put(burnt,x+1,y+5,'#8c8393');
}
for (const [name, art] of Object.entries({dough, risen, 'bread-perfect': perfect, 'bread-good': good,
  'bread-okay': okay, 'bread-raw': raw, 'bread-burnt': burnt})) save(OUT, name + '.png', scale(art, 4));
