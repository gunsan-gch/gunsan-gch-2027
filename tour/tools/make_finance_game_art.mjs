/* 금융 게임 픽셀아트 — 2026-11-15 (Node.js, 추가 설치 없음)
 * node tour/tools/make_finance_game_art.mjs [다른폴더]
 * 탐정은 32×32를 네 배, 돈은 32×32를 두 배, 물건은 16×16을 네 배 확대합니다.
 * 실제 화폐·상표를 쓰지 않은 숫자 지폐와 동전, 투명 배경입니다.
 */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETTE as P, canvas, put, rect, box, scale, save } from './pixel.mjs';

const OUT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'img', 'games', 'finance');
mkdirSync(OUT, { recursive: true });

function detective() {
  const c = canvas(32, 32);
  // 교복 재킷·흰 셔츠·리본
  box(c, 7, 20, 18, 11, P.A);
  rect(c, 10, 21, 12, 3, P.W); rect(c, 14, 23, 4, 7, P.W);
  rect(c, 12, 23, 3, 2, P.R); rect(c, 17, 23, 3, 2, P.R);
  box(c, 8, 4, 16, 16, '#f8d7b5');
  rect(c, 8, 3, 16, 5, P.N); rect(c, 7, 5, 2, 13, P.N); rect(c, 23, 5, 2, 13, P.N);
  rect(c, 10, 7, 3, 3, P.N); rect(c, 20, 7, 2, 2, P.N);
  rect(c, 11, 12, 2, 3, P.N); rect(c, 19, 12, 2, 3, P.N);
  put(c, 11, 12, P.W); put(c, 19, 12, P.W);
  rect(c, 9, 15, 3, 1, P.P); rect(c, 20, 15, 3, 1, P.P); rect(c, 15, 17, 3, 1, P.R);
  // 둥근 렌즈를 눈 위에 겹치고 손잡이를 대각선으로 내려 쥔 손에 연결합니다.
  for (let i = 0; i < 7; i++) rect(c, 22 + i, 19 + i, 3, 3, P.N);
  for (let i = 1; i < 6; i++) put(c, 23 + i, 20 + i, P.T);
  box(c, 24, 22, 5, 4, '#f8d7b5');
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) {
    const r = Math.hypot(x, y);
    if (r <= 6) put(c, 21 + x, 14 + y, r > 4.8 ? P.N : r > 3.8 ? P.B : P.L);
  }
  rect(c, 20, 13, 3, 4, P.N); put(c, 20, 13, P.W);
  rect(c, 18, 11, 2, 1, P.W); put(c, 17, 12, P.W);
  return c;
}

const DIGITS = {
  0: ['111', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '111'],
  5: ['111', '100', '111', '001', '111']
};

function digits(c, value, y) {
  const text = String(value);
  const left = Math.floor((32 - (text.length * 4 - 1)) / 2);
  [...text].forEach((digit, i) => DIGITS[digit].forEach((row, dy) => {
    [...row].forEach((pixel, dx) => { if (pixel === '1') put(c, left + i * 4 + dx, y + dy, P.N); });
  }));
}

function money(value) {
  const c = canvas(32, 32);
  if (value >= 1000) {
    const fill = value === 10000 ? '#d0e6ce' : value === 5000 ? '#f8ddae' : P.L;
    box(c, 1, 7, 30, 18, fill); box(c, 3, 9, 26, 14, fill);
    rect(c, 5, 11, 22, 1, P.W); digits(c, value, 14);
  } else {
    for (let y = 3; y < 29; y++) for (let x = 3; x < 29; x++) {
      const radius = Math.hypot(x - 15.5, y - 15.5);
      if (radius < 13) put(c, x, y, radius > 11 ? P.N : value === 500 ? '#f8ddae' : '#dde5ee');
    }
    rect(c, 10, 7, 10, 1, P.W); digits(c, value, 14);
  }
  return c;
}

function rice(c) {
  for (let y = 2; y < 14; y++) {
    const half = Math.floor((y - 1) / 2);
    rect(c, 7 - half, y, half * 2 + 2, 1, P.N);
    if (y > 3 && y < 13) rect(c, 8 - half, y, half * 2, 1, P.M);
  }
  box(c, 6, 9, 4, 5, P.G);
}

// 상품의 접힌 포장, 기울어진 선, 둥근 가장자리를 16칸 격자에 직접 찍습니다.
function sprite(c, rows) {
  rows.forEach((row, y) => [...row].forEach((ch, x) => put(c, x, y, P[ch])));
}

function milk(c) {
  sprite(c, [
    '.....NNNNNN.....','.....NMMMMN.....','....NTTTTNNN....','...NTMMMNKTN....',
    '...NNNNNNKKN....','...NKKKKNKTN....','...NKTTKNKTN....','...NTMMTNKTN....',
    '...NTMKTNKTN....','...NTKKMNKTN....','...NKTTKNKTN....','...NKKKKNKTN....',
    '...NTTTTNKKN....','...NNNNNNNNN....'
  ]);
}

function noodle(c) {
  sprite(c, [
    '..........N..N..','.........NT.NT..','........NT.NT...','...NNNNNTNNTNN..',
    '..NTYYTTYYTTTTN.','..NNNNNNNNNNNNN.','...NPRRRRRRPPN..','...NPRYYRRYYRN..',
    '....NRMMYYMRN...','....NRRMMRRRN...','....NPRRRRRPN...','.....NMMMMMN....',
    '.....NTTTTTN....','......NNNNN.....'
  ]);
}

function bread(c) {
  sprite(c, [
    '................','................','..........NNN...','........NNMTTN..',
    '......NNMMTTTTN.','....NNMMTTNNKTN.','...NMMTTNKRYKTN.','..NMTTNKRYRRKTN.',
    '.NMTNKRYRRKTTN..','.NTNKRYRKTTTN...','.NTNRRKTTTNN....','.NTTKTTTNN......',
    '..NTTTNN........','...NNN..........'
  ]);
}

function jelly(c) {
  box(c, 3, 2, 10, 12, P.P); rect(c, 4, 3, 8, 1, P.W);
  box(c, 5, 6, 3, 3, P.Y); box(c, 8, 9, 3, 3, P.L);
}

function water(c) {
  box(c, 5, 1, 6, 3, P.A); box(c, 4, 4, 8, 11, P.L);
  rect(c, 5, 8, 6, 4, P.W); rect(c, 7, 9, 2, 2, P.B); rect(c, 5, 5, 1, 2, P.W);
}

function snack(c) {
  box(c, 2, 2, 12, 12, P.Y); rect(c, 3, 3, 10, 1, P.M); rect(c, 3, 12, 10, 1, P.M);
  box(c, 5, 6, 6, 5, P.T); put(c, 6, 7, P.K); put(c, 9, 9, P.K);
}

function ice(c) {
  box(c, 7, 10, 3, 5, P.T); box(c, 4, 2, 9, 10, P.P);
  rect(c, 6, 3, 2, 6, P.W); rect(c, 5, 9, 7, 2, P.M);
}

function pen(c) {
  sprite(c, [
    '...........NN...','..........NBBN..','.........NBLLBN.','........NBLLNNN.',
    '.......NBLLN.N..','......NBLLN.N...','.....NBLLN......','....NBLLN.......',
    '...NBLLN........','...NNLN.........','..NTTN..........','..NTN...........',
    '.NNN............','.N..............'
  ]);
}

function sandwich(c) {
  for (let y = 2; y < 14; y++) {
    rect(c, 2, y, y, 1, P.N);
    if (y > 3 && y < 13) rect(c, 3, y, y - 2, 1, P.M);
  }
  rect(c, 3, 9, 6, 1, P.G); rect(c, 3, 10, 7, 1, P.R); rect(c, 3, 11, 8, 1, P.Y);
}

console.log(`→ ${OUT}`);
save(OUT, 'detective.png', scale(detective(), 4));
for (const value of [10000, 5000, 1000, 500, 100]) {
  save(OUT, `${value >= 1000 ? 'bill' : 'coin'}-${value}.png`, scale(money(value), 2));
}
for (const draw of [rice, milk, noodle, bread, jelly, water, snack, ice, pen, sandwich]) {
  const c = canvas(16, 16); draw(c); save(OUT, `goods-${draw.name}.png`, scale(c, 4));
}
