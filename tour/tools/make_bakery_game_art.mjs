/* 조리제빵실 픽셀아트 (Node.js, 추가 설치 없음)
 * node tour/tools/make_bakery_game_art.mjs [다른폴더]
 * 투명한 32×32 그림을 네 배 확대합니다. 2026-11-15
 */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETTE, canvas, rect, scale, save } from './pixel.mjs';

const OUT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'img', 'games', 'bakery');
mkdirSync(OUT, { recursive: true });

// 층을 쌓아 둥근 실루엣을 만듭니다. 외곽선은 공통 남색입니다.
function bun(fill, shade, risen = false) {
  const c = canvas(32, 32);
  const top = risen ? 6 : 11;
  const rows = [[11, top, 10, 1], [7, top + 1, 18, 2], [5, top + 3, 22, 3],
    [4, top + 6, 24, 17 - top], [6, 23, 20, 2], [9, 25, 14, 1]];
  for (const [x, y, w, h] of rows) rect(c, x, y, w, h, PALETTE.N);
  rect(c, 11, top + 1, 10, 1, fill);
  rect(c, 8, top + 2, 16, 2, fill);
  rect(c, 6, top + 4, 20, 3, fill);
  rect(c, 5, top + 7, 22, 15 - top, fill);
  rect(c, 7, 22, 18, 2, shade);
  rect(c, 10, 24, 12, 1, shade);
  rect(c, 8, top + 5, 5, 2, PALETTE.E);
  return c;
}

function bread(fill, shade, pale = false) {
  const c = bun(fill, shade, true);
  if (pale) rect(c, 5, 14, 10, 8, PALETTE.M);
  // 식빵 윗면의 칼집 세 개와 아래쪽 구운 껍질입니다.
  for (const x of [10, 16, 22]) {
    rect(c, x, 11, 2, 5, shade);
    rect(c, x - 1, 11, 1, 3, PALETTE.M);
  }
  return c;
}

console.log(`→ ${OUT}`);
save(OUT, 'dough.png', scale(bun(PALETTE.M, '#e6d6bd'), 4));
save(OUT, 'risen.png', scale(bun(PALETTE.M, '#e6d6bd', true), 4));
save(OUT, 'bread-perfect.png', scale(bread('#edb965', '#c48743'), 4));
save(OUT, 'bread-good.png', scale(bread('#f3cf91', '#d6a363'), 4));
save(OUT, 'bread-okay.png', scale(bread('#edb965', '#c48743', true), 4));
save(OUT, 'bread-raw.png', scale(bread('#fffcf2', '#e6d6bd'), 4));
save(OUT, 'bread-burnt.png', scale(bread('#50434b', '#302c38'), 4));
