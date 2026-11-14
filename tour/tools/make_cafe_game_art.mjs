/* 카페 게임 픽셀아트 만들기 (Node.js만 있으면 됨, 추가 설치 없음)
 *
 *   node tour/tools/make_cafe_game_art.mjs            # tour/img/games/cafe/ 에 PNG 생성
 *   node tour/tools/make_cafe_game_art.mjs 다른폴더    # 다른 폴더에 생성
 *
 * 만드는 파일: 재료 아이콘 9개(64×64), 손님 3명(128×128), 카운터 배경 counter-bg.png(960×540).
 * 배경은 WebP로 바꿔 counter-bg.webp 로 두고 PNG는 지웁니다 (예: cwebp -q 90 counter-bg.png -o counter-bg.webp,
 * 또는 sharp: node -e "require('sharp')('counter-bg.png').webp({quality:90}).toFile('counter-bg.webp')").
 *
 * 그림체: 밝은 파스텔 + 굵은 남색(#14285a) 외곽선. 작은 칸에 그린 뒤 정수 배로 키워 픽셀이 또렷하게 보입니다.
 * 색이나 모양을 바꾸려면 pixel.mjs의 PALETTE·아래 ICONS(글자 그림)·drawCustomer·drawCounter를 고치세요.
 */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETTE, canvas, put, rect, frame, box, fromRows, scale, save } from './pixel.mjs';

const OUT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'img', 'games', 'cafe');
mkdirSync(OUT, { recursive: true });

/* ---------- 재료 아이콘 9개 (16×16 → ×4 = 64×64) ---------- */

const ICONS = {
  'cup-ice': [
    '.......N........',
    '......NWN.......',
    '......NWN.......',
    '...NNNNWNNNN....',
    '...NLLLWLLLN....',
    '...NLLLWLLLN....',
    '...NLLIWILLN....',
    '...NLIIWIILN....',
    '....NLLWLLN.....',
    '....NLLLLLN.....',
    '....NLLLLLN.....',
    '....NLLLLLN.....',
    '.....NLLLN......',
    '.....NLLLN......',
    '.....NNNNN......',
    '................'
  ],
  'cup-mug': [
    '................',
    '................',
    '...NNNNNNNNN....',
    '...NEEEEEEENNN..',
    '...NEEEEEEEN.NN.',
    '...NEAAAAAEN..N.',
    '...NEAAAAAEN..N.',
    '...NEEEEEEEN..N.',
    '...NEEEEEEEN.NN.',
    '...NEEEEEEENNN..',
    '...NEEEEEEEN....',
    '...NEEEEEEEN....',
    '...NEEEEEEEN....',
    '....NNNNNNN.....',
    '................',
    '................'
  ],
  ice: [
    '................',
    '................',
    '....NNNNNN......',
    '...NIIIIIIN.....',
    '...NIWIIIIN.....',
    '...NIIIIIBN.....',
    '...NIIIIIBN.....',
    '...NIIIBBBN.....',
    '....NNNNNNNNN...',
    '.......NIIIIIN..',
    '.......NIWIIIN..',
    '.......NIIIIBN..',
    '.......NIIIBBN..',
    '.......NIIBBBN..',
    '........NNNNNN..',
    '................'
  ],
  shot: [
    '................',
    '................',
    '................',
    '...NNNNNNNNNN...',
    '...NTTTTTTTTN...',
    '...NKKKKKKKKN...',
    '...NKKKKKKKKN...',
    '...NKKKKKKKKN...',
    '....NKKKKKKN....',
    '....NKKKKKKN....',
    '....NKKKKKKN....',
    '.....NKKKKN.....',
    '.....NKKKKN.....',
    '.....NNNNNN.....',
    '................',
    '................'
  ],
  water: [
    '................',
    '.......N........',
    '......NBN.......',
    '......NBN.......',
    '.....NBBBN......',
    '.....NBBBN......',
    '....NBBBBBN.....',
    '....NBWBBBN.....',
    '...NBBWBBBBN....',
    '...NBBBBBBBN....',
    '...NBBBBBBBN....',
    '...NLBBBBBBN....',
    '....NBBBBBN.....',
    '.....NBBBN......',
    '......NNN.......',
    '................'
  ],
  milk: [
    '................',
    '......NNNN......',
    '.....NWWWWN.....',
    '....NWWWWWWN....',
    '...NNNNNNNNNN...',
    '...NWWWWWWWWN...',
    '...NWBBBBBBWN...',
    '...NWBWWWWBWN...',
    '...NWBWMMWBWN...',
    '...NWBWWWWBWN...',
    '...NWBBBBBBWN...',
    '...NWWWWWWWWN...',
    '...NWWWWWWWWN...',
    '...NWWWWWWWWN...',
    '...NNNNNNNNNN...',
    '................'
  ],
  'steamed-milk': [
    '.....A..A.......',
    '....A..A........',
    '.....A..A.......',
    '................',
    '...NNNNNNNNN....',
    '..NWWWWWWWWWN...',
    '..NMMMMMMMMMN...',
    '...NSSSSSSSNNN..',
    '...NSSSSSSSN.N..',
    '...NSSSSSSSN.N..',
    '...NSSSSSSSN.N..',
    '...NSSSSSSSNN...',
    '...NSSSSSSSN....',
    '....NSSSSSN.....',
    '....NNNNNNN.....',
    '................'
  ],
  vanilla: [
    '......NNNN......',
    '......NDDN......',
    '......NDDN......',
    '.....NNWWNN.....',
    '....NWWWWWWN....',
    '...NYYYYYYYYN...',
    '...NYYYYYYYYN...',
    '...NYWWWWWWYN...',
    '...NYWOOOOWYN...',
    '...NYWWWWWWYN...',
    '...NYYYYYYYYN...',
    '...NYYYYYYYYN...',
    '...NYYYYYYYYN...',
    '....NYYYYYYN....',
    '.....NNNNNN.....',
    '................'
  ],
  strawberry: [
    '................',
    '.....NNNNNN.....',
    '....NRRRRRRN....',
    '....NNNNNNNN....',
    '...NPPPPPPPPN...',
    '...NPPPPPPPPN...',
    '...NPPWWWWPPN...',
    '...NPPWGGWPPN...',
    '...NPPWRRWPPN...',
    '...NPPWRRWPPN...',
    '...NPPWWWWPPN...',
    '...NPPPPPPPPN...',
    '...NPPPPPPPPN...',
    '....NPPPPPPN....',
    '.....NNNNNN.....',
    '................'
  ]
};

/* ---------- 손님 상반신 (32×32 → ×4 = 128×128) ---------- */

const SKIN = '#f9dcc4', BLUSH = '#f6b1b1', MOUTH = '#d4766f', N = PALETTE.N;

/**
 * kind: 'student'(교복 학생) · 'teacher'(선생님) · 'parent'(학부모)
 * 머리 → 얼굴 → 몸통 순으로 그리고, 외곽선은 남색으로 두릅니다.
 */
function drawCustomer(kind) {
  const c = canvas(32, 32);
  const hair = { student: '#6b4a32', teacher: '#3a2a22', parent: '#4e3327' }[kind];
  const coat = { student: '#1d3673', teacher: '#d9c7a3', parent: '#a88ab0' }[kind];

  // 몸통(어깨~가슴). 아래쪽은 그림 끝까지 이어지도록 외곽선을 두르지 않음
  rect(c, 6, 21, 20, 11, coat);
  rect(c, 5, 22, 1, 10, N); rect(c, 26, 22, 1, 10, N);
  rect(c, 6, 21, 1, 1, N); rect(c, 25, 21, 1, 1, N);
  rect(c, 7, 20, 6, 1, N); rect(c, 19, 20, 6, 1, N);
  // 목
  rect(c, 13, 18, 6, 3, SKIN);
  rect(c, 12, 18, 1, 3, N); rect(c, 19, 18, 1, 3, N);
  // 옷깃
  if (kind === 'student') {
    rect(c, 11, 21, 3, 3, '#ffffff'); rect(c, 18, 21, 3, 3, '#ffffff');
    rect(c, 14, 21, 4, 1, '#ffffff');
    rect(c, 15, 22, 2, 5, '#2b5a45');   // 초록 넥타이
    rect(c, 14, 22, 1, 1, N); rect(c, 17, 22, 1, 1, N);
    rect(c, 9, 24, 1, 8, '#2f4a8c'); rect(c, 22, 24, 1, 8, '#2f4a8c');   // 블레이저 선
  } else if (kind === 'teacher') {
    rect(c, 12, 21, 8, 4, '#ffffff');
    rect(c, 15, 21, 2, 8, '#f6f0e3');   // 가디건 단추 줄
    rect(c, 15, 25, 2, 1, N); rect(c, 15, 28, 2, 1, N);
    rect(c, 11, 21, 1, 5, N); rect(c, 20, 21, 1, 5, N);
  } else {
    rect(c, 10, 21, 12, 3, '#fff1c9');   // 목도리
    rect(c, 10, 24, 12, 1, '#e8c98f');
    rect(c, 9, 21, 1, 4, N); rect(c, 22, 21, 1, 4, N);
  }

  // 얼굴
  rect(c, 9, 7, 14, 12, SKIN);
  rect(c, 8, 8, 1, 10, N); rect(c, 23, 8, 1, 10, N);
  rect(c, 9, 18, 1, 1, N); rect(c, 22, 18, 1, 1, N);
  rect(c, 10, 19, 12, 1, N);
  // 눈 (남색 2×3, 흰 점)
  for (const x of [12, 18]) {
    rect(c, x, 12, 2, 3, N);
    put(c, x, 12, '#ffffff');
  }
  // 볼·입
  rect(c, 10, 15, 2, 1, BLUSH); rect(c, 20, 15, 2, 1, BLUSH);
  rect(c, 15, 16, 2, 1, MOUTH);

  // 머리카락
  if (kind === 'student') {           // 단발
    rect(c, 8, 3, 16, 5, hair);
    rect(c, 7, 5, 2, 11, hair); rect(c, 23, 5, 2, 11, hair);
    rect(c, 9, 8, 3, 2, hair); rect(c, 20, 8, 3, 2, hair);   // 앞머리
    rect(c, 8, 2, 16, 1, N); rect(c, 7, 3, 1, 2, N); rect(c, 24, 3, 1, 2, N);
    rect(c, 6, 5, 1, 11, N); rect(c, 25, 5, 1, 11, N);
    rect(c, 7, 16, 2, 1, N); rect(c, 23, 16, 2, 1, N);
  } else if (kind === 'teacher') {    // 묶은 머리 + 안경
    rect(c, 8, 3, 16, 5, hair);
    rect(c, 7, 5, 2, 7, hair); rect(c, 23, 5, 2, 7, hair);
    rect(c, 9, 8, 2, 1, hair); rect(c, 21, 8, 2, 1, hair);
    rect(c, 8, 2, 16, 1, N); rect(c, 7, 3, 1, 2, N); rect(c, 24, 3, 1, 2, N);
    rect(c, 6, 5, 1, 7, N); rect(c, 25, 5, 1, 7, N);
    rect(c, 7, 12, 2, 1, N); rect(c, 23, 12, 2, 1, N);
    box(c, 23, 6, 4, 5, hair);            // 묶은 머리
    frame(c, 11, 11, 4, 5, '#5b6b8f');     // 안경
    frame(c, 17, 11, 4, 5, '#5b6b8f');
    put(c, 15, 13, '#5b6b8f'); put(c, 16, 13, '#5b6b8f');
  } else {                            // 올림머리(쪽)
    rect(c, 8, 4, 16, 4, hair);
    rect(c, 7, 6, 2, 6, hair); rect(c, 23, 6, 2, 6, hair);
    rect(c, 9, 8, 5, 1, hair);
    rect(c, 8, 3, 16, 1, N); rect(c, 7, 4, 1, 2, N); rect(c, 24, 4, 1, 2, N);
    rect(c, 6, 6, 1, 6, N); rect(c, 25, 6, 1, 6, N);
    rect(c, 7, 12, 2, 1, N); rect(c, 23, 12, 2, 1, N);
    box(c, 12, 0, 8, 4, hair);            // 쪽
    rect(c, 14, 1, 2, 1, '#e8c98f');       // 머리핀
  }
  return c;
}

/* ---------- 카페 카운터 배경 (240×135 → ×4 = 960×540) ---------- */

function drawCounter() {
  const c = canvas(240, 135);
  // 벽 (위 파스텔 살구 / 아래 타일)
  rect(c, 0, 0, 240, 135, '#f6e7d2');
  rect(c, 0, 72, 240, 1, '#e4cfb3');
  for (let x = 0; x < 240; x += 12) rect(c, x, 73, 1, 14, '#ecd9bf');
  // 천장 몰딩
  rect(c, 0, 0, 240, 3, '#e4cfb3'); rect(c, 0, 3, 240, 1, N);

  // 카운터 (나무) — 위 면 + 앞면 널빤지
  rect(c, 0, 86, 240, 6, '#e8c08a'); rect(c, 0, 86, 240, 1, N); rect(c, 0, 91, 240, 1, '#b27a3f');
  rect(c, 0, 92, 240, 43, '#d9a066');
  for (let y = 100; y < 135; y += 10) rect(c, 0, y, 240, 1, '#b27a3f');
  for (let x = 0; x < 240; x += 30) rect(c, x + (((x / 30) | 0) % 2) * 15, 92, 1, 43, '#b27a3f');
  rect(c, 0, 92, 240, 1, N);

  // 메뉴판 (가운데 위, 초록 칠판)
  box(c, 92, 9, 56, 34, '#2b5a45');
  frame(c, 93, 10, 54, 32, '#a9743f');
  rect(c, 100, 14, 40, 3, '#fff6d6');                       // 제목 줄
  for (let i = 0; i < 4; i++) {
    rect(c, 100, 20 + i * 5, 22 + (i % 2) * 6, 2, '#e9f0e2');
    rect(c, 132, 20 + i * 5, 8, 2, '#f2c94c');
  }
  // 메뉴판 양옆 작은 전등
  for (const x of [84, 152]) { rect(c, x, 4, 1, 8, N); box(c, x - 3, 12, 7, 5, '#fff1c9'); }

  // 에스프레소 머신 (왼쪽)
  box(c, 16, 46, 54, 40, '#b7c0cb');
  rect(c, 16, 46, 54, 8, '#8f9aa8'); rect(c, 16, 53, 54, 1, N);     // 윗판
  for (let i = 0; i < 4; i++) box(c, 20 + i * 12, 40, 9, 7, '#fffcf2');   // 위에 올린 컵
  box(c, 22, 58, 42, 10, '#dde3ea');                                       // 패널
  rect(c, 26, 61, 10, 4, '#2b5a45'); rect(c, 40, 61, 6, 4, '#e85d75'); rect(c, 50, 61, 10, 4, '#14285a');
  for (const x of [26, 46]) {                                              // 포터필터 2개
    rect(c, x, 72, 12, 3, N); rect(c, x + 4, 75, 4, 8, '#3a2a22'); rect(c, x + 3, 75, 1, 8, N); rect(c, x + 8, 75, 1, 8, N);
    rect(c, x + 2, 83, 8, 3, N);
  }
  rect(c, 66, 56, 2, 16, N); rect(c, 66, 70, 6, 2, N);                    // 스팀 완드
  rect(c, 64, 40, 1, 1, '#aebfe3'); rect(c, 66, 38, 1, 1, '#aebfe3'); rect(c, 68, 36, 1, 1, '#aebfe3');   // 김
  // 그라인더 (머신 왼쪽)
  box(c, 4, 60, 10, 26, '#6f7b8a'); box(c, 3, 50, 12, 11, '#dde3ea'); rect(c, 5, 52, 8, 7, '#5b3a1e');

  // 오른쪽 선반 2단 — 컵·시럽·잼
  for (const y of [28, 52]) { rect(c, 164, y, 64, 3, '#d9a066'); rect(c, 164, y, 64, 1, N); rect(c, 164, y + 3, 64, 1, '#b27a3f'); }
  for (let i = 0; i < 5; i++) box(c, 168 + i * 12, 20, 9, 8, i % 2 ? '#fffcf2' : '#cfe8f7');
  box(c, 168, 40, 7, 12, '#f2c94c'); rect(c, 170, 38, 3, 3, '#6f7b8a');   // 바닐라 시럽
  box(c, 178, 40, 7, 12, '#f7a8b8'); rect(c, 179, 40, 5, 2, '#e85d75');   // 딸기청
  box(c, 188, 42, 9, 10, '#ffffff'); rect(c, 190, 44, 5, 5, '#7fbbe0');   // 우유
  box(c, 200, 38, 11, 14, '#2b5a45'); rect(c, 203, 42, 5, 6, '#fff1c9');  // 원두 통
  box(c, 214, 44, 12, 8, '#fffcf2'); rect(c, 226, 46, 2, 4, N);           // 머그
  // 화분 (선반 오른쪽 끝 위)
  box(c, 222, 20, 8, 8, '#e08a1e');
  rect(c, 221, 15, 3, 4, '#4f9a5b'); rect(c, 225, 13, 3, 6, '#4f9a5b'); rect(c, 229, 16, 2, 3, '#4f9a5b');

  // 카운터 위 소품 (가운데 아래는 컵 자리라 비움: x 95~145)
  box(c, 60, 78, 14, 9, '#fffcf2'); rect(c, 63, 80, 8, 3, '#14285a');     // 냅킨 통
  box(c, 164, 76, 18, 11, '#aebfe3'); rect(c, 168, 79, 10, 5, '#14285a'); // 계산기(포스)
  box(c, 188, 80, 10, 7, '#f2c94c');                                        // 팁 상자
  // 벽 장식: 작은 액자
  box(c, 36, 14, 22, 16, '#fffcf2'); rect(c, 40, 18, 14, 8, '#cfe8f7'); rect(c, 42, 22, 10, 4, '#4f9a5b');
  return c;
}

/* ---------- 실행 ---------- */

console.log(`→ ${OUT}`);
for (const [name, rows] of Object.entries(ICONS)) save(OUT, `${name}.png`, scale(fromRows(rows), 4));
['student', 'teacher', 'parent'].forEach((kind, i) => save(OUT, `customer-${i + 1}.png`, scale(drawCustomer(kind), 4)));
save(OUT, 'counter-bg.png', scale(drawCounter(), 4));
console.log('완료. counter-bg.png 는 WebP(counter-bg.webp)로 바꾼 뒤 PNG를 지우세요 (위 사용법 참고).');
