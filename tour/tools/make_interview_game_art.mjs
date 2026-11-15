/* AI 면접 게임 픽셀아트 만들기 (Node.js만 있으면 됨, 추가 설치 없음)
 *
 *   node tour/tools/make_interview_game_art.mjs            # tour/img/games/interview/ 에 PNG 생성
 *   node tour/tools/make_interview_game_art.mjs 다른폴더    # 다른 폴더에 생성
 *
 * 면접관 로봇 표정 4장: 32×32 → ×4 = 128×128, 투명 배경.
 *   robot-neutral(기본) · robot-happy(좋은 답) · robot-love(콤보) · robot-error(당황)
 * 밝은 파스텔 + 굵은 남색 외곽선. 공통 색·그리기·저장은 pixel.mjs를 씁니다.
 */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETTE, canvas, put, rect, box, scale, save } from './pixel.mjs';

const OUT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'img', 'games', 'interview');
mkdirSync(OUT, { recursive: true });

const N = PALETTE.N;
const SHELL = '#cfe8f7', SHADE = '#aebfe3', SCREEN = '#1d3673', LIGHT = '#eaf7ff', RED = '#e85d75', PINK = '#f7a8b8';
const LAMP = { neutral: '#f2c94c', happy: '#4f9a5b', love: RED, error: RED };   // 안테나 불빛

/** 한 점을 투명하게 (모서리를 둥글게 깎을 때) */
function clear(c, x, y) {
  c.data[(y * c.w + x) * 4 + 3] = 0;
}
const dots = (c, points, color) => points.forEach(([x, y]) => put(c, x, y, color));

/* ---------- 표정 (얼굴 화면 안쪽: x 9~22, y 9~18) ---------- */
const FACES = {
  neutral(c) {
    rect(c, 11, 11, 2, 3, LIGHT); rect(c, 19, 11, 2, 3, LIGHT);
    rect(c, 13, 16, 6, 1, LIGHT);
  },
  happy(c) {   // ^ ^ 눈 + 웃는 입
    for (const ox of [10, 18]) dots(c, [[ox, 13], [ox + 1, 12], [ox + 2, 11], [ox + 3, 12], [ox + 4, 13]], LIGHT);
    rect(c, 13, 17, 6, 1, LIGHT); dots(c, [[12, 16], [19, 16]], LIGHT);
  },
  love(c) {    // 하트 눈 + 활짝 웃는 입
    for (const ox of [10, 18]) dots(c, [[ox, 11], [ox + 1, 11], [ox + 3, 11], [ox + 4, 11], [ox, 12], [ox + 1, 12], [ox + 2, 12],
      [ox + 3, 12], [ox + 4, 12], [ox + 1, 13], [ox + 2, 13], [ox + 3, 13], [ox + 2, 14]], PINK);
    rect(c, 13, 16, 6, 2, LIGHT); rect(c, 14, 18, 4, 1, LIGHT);
  },
  error(c) {   // X 눈 + 지그재그 입
    for (const ox of [10, 18]) dots(c, [[ox, 11], [ox + 3, 11], [ox + 1, 12], [ox + 2, 12], [ox + 1, 13], [ox + 2, 13], [ox, 14], [ox + 3, 14]], RED);
    dots(c, [[12, 17], [13, 16], [14, 17], [15, 16], [16, 17], [17, 16], [18, 17], [19, 16]], LIGHT);
  }
};

function drawRobot(mood) {
  const c = canvas(32, 32);
  // 안테나
  rect(c, 15, 2, 2, 4, N);
  box(c, 13, 0, 6, 3, LAMP[mood]);
  // 귀
  box(c, 2, 11, 4, 7, SHADE);
  box(c, 26, 11, 4, 7, SHADE);
  // 머리 (모서리를 한 칸씩 깎아 둥글게)
  box(c, 5, 5, 22, 19, SHELL);
  rect(c, 6, 21, 20, 2, SHADE);
  for (const [x, y] of [[5, 5], [26, 5], [5, 23], [26, 23]]) clear(c, x, y);
  dots(c, [[6, 6], [25, 6], [6, 22], [25, 22]], N);
  // 얼굴 화면
  box(c, 8, 8, 16, 12, SCREEN);
  FACES[mood](c);
  // 목 · 어깨 · 넥타이
  rect(c, 14, 24, 4, 2, PALETTE.D);
  rect(c, 13, 24, 1, 2, N); rect(c, 18, 24, 1, 2, N);
  rect(c, 7, 26, 18, 6, SHADE);
  rect(c, 7, 26, 18, 1, N); rect(c, 6, 27, 1, 5, N); rect(c, 25, 27, 1, 5, N);
  rect(c, 13, 27, 6, 1, PALETTE.W);
  rect(c, 15, 27, 2, 4, '#2b5a45');
  return c;
}

console.log(`→ ${OUT}`);
for (const mood of Object.keys(FACES)) save(OUT, `robot-${mood}.png`, scale(drawRobot(mood), 4));
