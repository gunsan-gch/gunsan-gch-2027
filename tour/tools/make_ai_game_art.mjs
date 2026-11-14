/* AI 광고 게임 픽셀아트 만들기 (Node.js만 있으면 됨, 추가 설치 없음)
 *
 *   node tour/tools/make_ai_game_art.mjs            # tour/img/games/ai/ 에 PNG 생성
 *   node tour/tools/make_ai_game_art.mjs 다른폴더    # 다른 폴더에 생성
 *
 * 상품 3개는 32×32 → ×4 = 128×128, 로봇은 16×16 → ×4 = 64×64, 투명 배경.
 * 밝은 파스텔 + 굵은 남색 외곽선. 공통 색·그리기·저장은 pixel.mjs를 씁니다.
 */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETTE, canvas, put, rect, box, fromRows, scale, save } from './pixel.mjs';

const OUT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'img', 'games', 'ai');
mkdirSync(OUT, { recursive: true });
const N = PALETTE.N;

/* ---------- 쿠키 봉지 ---------- */

function drawCookies() {
  const c = canvas(32, 32);
  box(c, 6, 3, 20, 26, '#f7a8b8');
  box(c, 5, 2, 22, 4, '#fff6e6');
  box(c, 5, 27, 22, 3, '#fff6e6');
  for (let x = 8; x < 26; x += 4) rect(c, x, 3, 1, 2, '#e8c48a');
  box(c, 8, 8, 16, 16, '#fffcf2');
  // 둥근 쿠키와 보리 알갱이
  rect(c, 12, 11, 8, 1, N); rect(c, 10, 13, 12, 8, N);
  rect(c, 11, 12, 10, 10, N); rect(c, 12, 22, 8, 1, N);
  rect(c, 12, 12, 8, 10, '#e8c48a'); rect(c, 11, 14, 10, 6, '#e8c48a');
  for (const [x, y] of [[13, 14], [17, 13], [19, 17], [15, 18], [12, 19], [17, 21]]) put(c, x, y, '#a8611e');
  rect(c, 11, 9, 10, 1, '#4f9a5b');
  rect(c, 9, 25, 14, 1, '#ffffff');
  return c;
}

/* ---------- 무선 이어폰과 충전 케이스 ---------- */

function drawEarbuds() {
  const c = canvas(32, 32);
  box(c, 5, 14, 22, 14, '#cfe8f7');
  box(c, 6, 10, 20, 7, '#aebfe3');
  rect(c, 8, 12, 16, 3, '#eaf7ff');
  rect(c, 7, 18, 18, 1, '#ffffff');
  rect(c, 14, 23, 4, 1, '#4f9a5b');
  // 두 이어폰: 둥근 머리와 짧은 막대
  for (const x of [9, 19]) {
    box(c, x, 3, 5, 7, '#ffffff');
    box(c, x + 1, 8, 3, 6, '#ffffff');
    rect(c, x + 1, 5, 2, 2, N);
    put(c, x + 2, 11, '#7fbbe0');
  }
  return c;
}

/* ---------- 보온 텀블러 ---------- */

function drawTumbler() {
  const c = canvas(32, 32);
  box(c, 10, 2, 12, 4, '#aebfe3');
  box(c, 8, 5, 16, 4, '#6f7b8a');
  box(c, 9, 8, 14, 20, '#cfe8f7');
  box(c, 10, 27, 12, 3, '#aebfe3');
  rect(c, 11, 10, 2, 15, '#ffffff');
  rect(c, 21, 10, 1, 16, '#7fbbe0');
  box(c, 14, 14, 6, 8, '#fff6e6');
  // 라벨 속 초록 잎
  rect(c, 16, 16, 2, 4, '#4f9a5b');
  put(c, 15, 17, '#4f9a5b'); put(c, 18, 16, '#4f9a5b');
  rect(c, 12, 3, 8, 1, '#ffffff');
  return c;
}

/* ---------- 힌트 로봇 ---------- */

const BOT = [
  '.......NN.......',
  '.......NP.......',
  '.......NN.......',
  '...NNNNNNNNNN...',
  '...NLLLLLLLLN...',
  '.NNNLLLLLLLLNNN.',
  '.NBNLNNLLNNLNBN.',
  '.NBNLNWLLNWLNBN.',
  '.NNNLLLLLLLLNNN.',
  '...NLPLNNLPLN...',
  '...NLLLLLLLLN...',
  '...NNNNNNNNNN...',
  '......NLLN......',
  '....NNNNNNNN....',
  '....NAAAAAAN....',
  '....NNNNNNNN....'
];

/* ---------- 실행 ---------- */

console.log(`→ ${OUT}`);
[drawCookies, drawEarbuds, drawTumbler].forEach((draw, i) => save(OUT, `product-${i + 1}.png`, scale(draw(), 4)));
save(OUT, 'ai-bot.png', scale(fromRows(BOT), 4));
