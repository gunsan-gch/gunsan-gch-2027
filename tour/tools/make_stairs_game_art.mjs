/* 꿈다락까지 올라라! — integer-grid school stair game artwork.
 * node tour/tools/make_stairs_game_art.mjs [output img/games directory]
 * Uses the shared pixel.mjs canvas + PNG pipeline. No fonts, external images,
 * smoothing, gradients or translucent pixels; each base pixel scales exactly.
 * Backdrops: 120×80 → 240×160. Portrait/goal: 32×32 → 64×64.
 * Reproducible source metadata is printed; this script never edits the manifest.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { PALETTE, canvas, put, rect, box, scale, save } from './pixel.mjs';

const OUT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '../img/games');
const P = {
  ...PALETTE, ink: '#25344c', hair: '#443640', hairLight: '#69505a',
  skin: '#ffd5b3', skinShade: '#eeb08d', blush: '#f49a9f',
  mint: '#b8ddcf', mintDark: '#6aab99', sage: '#eef5e9',
  wood: '#d6ad83', woodDark: '#98766e', woodLight: '#f1d7ab',
  lavender: '#ddd8ed', violet: '#a59abf', cream: '#fff9eb',
  gold: '#d89a47', goldLight: '#ffe69a', blueShadow: '#7e96b5',
};
const records = [];
function output(folder, name, c, description) {
  const dir = join(OUT, folder);
  mkdirSync(dir, { recursive: true });
  save(dir, name, c);
  records.push({ path: `games/${folder}/${name}`, width: c.w, height: c.h,
    description, sha256: createHash('sha256').update(readFileSync(join(dir, name))).digest('hex') });
}
function star(c, x, y, color = P.Y, outline = P.gold) {
  // Nine-pixel star with deliberately stepped, symmetric edges.
  const rows = ['....o....', '...ooo...', '...ofo...', 'ooooffooo', '.offfffo.', '..fffff..', '..offfo..', '.oo...oo.'];
  rows.forEach((row, yy) => [...row].forEach((a, xx) => {
    if (a !== '.') put(c, x + xx, y + yy, a === 'o' ? outline : color);
  }));
  put(c, x + 4, y + 3, P.cream);
}
function sparkle(c, x, y, color) {
  rect(c, x, y - 2, 1, 5, color); rect(c, x - 2, y, 5, 1, color);
}
function plant(c, x, y, pink = false) {
  rect(c, x + 3, y - 11, 1, 12, P.mintDark);
  rect(c, x, y - 9, 3, 3, P.mintDark); rect(c, x + 4, y - 7, 4, 3, P.mintDark);
  rect(c, x + 1, y - 8, 2, 1, P.mint); rect(c, x + 5, y - 6, 2, 1, P.mint);
  if (pink) { rect(c, x + 2, y - 13, 3, 3, P.P); put(c, x + 3, y - 12, P.cream); }
  box(c, x, y, 8, 5, P.woodLight, P.woodDark);
  rect(c, x + 1, y + 5, 6, 2, P.woodDark); rect(c, x + 1, y + 1, 6, 1, P.cream);
}
function books(c, x, y, colors = [P.mintDark, P.P, P.B]) {
  colors.forEach((color, i) => {
    const height = [10, 13, 11][i % 3];
    box(c, x + i * 4, y - height, 4, height, color, P.woodDark);
    rect(c, x + i * 4 + 1, y - height + 2, 2, 1, P.cream);
  });
}
function window(c, x, y, trim, kind = 0) {
  box(c, x, y, 22, 29, trim, P.woodDark);
  rect(c, x + 2, y + 2, 18, 24, '#d8ecf0');
  // Flat clouds and distant garden silhouettes, confined behind glazing.
  rect(c, x + 4, y + 6, 8, 2, P.cream); rect(c, x + 6, y + 4, 4, 2, P.cream);
  rect(c, x + 14, y + 10, 6, 2, P.cream);
  if (kind === 1) {
    rect(c, x + 2, y + 21, 18, 5, P.mint); rect(c, x + 4, y + 19, 6, 5, P.mint);
    rect(c, x + 14, y + 17, 4, 9, P.mint);
  } else {
    rect(c, x + 2, y + 23, 18, 3, '#c2dddb');
    rect(c, x + 4, y + 21, 5, 5, '#c2dddb'); rect(c, x + 14, y + 20, 4, 6, '#c2dddb');
  }
  rect(c, x + 10, y + 1, 2, 26, trim); rect(c, x + 1, y + 14, 20, 2, trim);
  rect(c, x - 1, y + 28, 24, 2, P.woodDark); rect(c, x - 1, y + 28, 24, 1, P.woodLight);
  put(c, x + 8, y + 17, P.woodDark); put(c, x + 13, y + 17, P.woodDark);
}
function wall(c, fill, stripe, low) {
  rect(c, 0, 0, 120, 80, fill);
  rect(c, 0, 0, 120, 3, stripe); rect(c, 0, 4, 120, 1, P.cream);
  rect(c, 0, 65, 120, 15, low); rect(c, 0, 64, 120, 2, stripe);
  rect(c, 0, 66, 120, 1, P.cream);
  for (let x = 8; x < 120; x += 16) rect(c, x, 68, 1, 12, stripe);
  rect(c, 0, 78, 120, 2, stripe);
}
function shelf(c, x, y, width = 19) {
  box(c, x, y, width, 3, P.woodLight, P.woodDark);
  rect(c, x + 2, y + 3, 2, 3, P.woodDark); rect(c, x + width - 4, y + 3, 2, 3, P.woodDark);
}
function backdrop(floor) {
  const c = canvas(120, 80);
  if (floor === 1) {
    wall(c, '#f3f8ee', '#b8d4c4', '#e0eddf');
    window(c, 7, 14, P.cream, 1); window(c, 92, 14, P.cream, 1);
    plant(c, 13, 56); plant(c, 100, 56, true);
    shelf(c, 7, 63, 20); shelf(c, 94, 63, 20);
    // Rounded light fixtures, no numerals or room plaques.
    rect(c, 55, 7, 10, 1, '#b8d4c4'); rect(c, 57, 8, 6, 3, P.cream);
  } else if (floor === 2) {
    wall(c, '#f2f7fc', '#b5cce1', '#dfebf5');
    window(c, 8, 12, P.cream); window(c, 91, 12, P.cream);
    // Club-room computers and a tiny indoor fern at the far edges.
    box(c, 7, 51, 17, 11, '#aabdd5', P.blueShadow); rect(c, 9, 53, 13, 7, '#d7ecf7');
    rect(c, 10, 54, 5, 1, P.cream); rect(c, 14, 62, 3, 2, P.blueShadow);
    shelf(c, 5, 64, 22); plant(c, 101, 57); shelf(c, 94, 64, 20);
    rect(c, 56, 7, 8, 2, P.cream); rect(c, 57, 9, 6, 1, '#b5cce1');
  } else if (floor === 3) {
    wall(c, '#fff5f1', '#e7c4c3', '#f5e3dd');
    window(c, 7, 14, P.cream); window(c, 92, 14, P.cream);
    // Arts floor: a small still-life canvas, pencil jar, flowerpot.
    box(c, 8, 48, 16, 12, P.cream, P.woodDark);
    rect(c, 10, 56, 12, 2, '#e7c4c3'); rect(c, 14, 52, 4, 5, P.mint);
    rect(c, 13, 51, 6, 2, P.P); put(c, 15, 50, P.P);
    rect(c, 10, 60, 2, 5, P.woodDark); rect(c, 20, 60, 2, 5, P.woodDark);
    plant(c, 101, 55, true); shelf(c, 94, 62, 20);
    rect(c, 57, 7, 6, 3, P.cream);
  } else if (floor === 4) {
    wall(c, '#f6f3fc', '#c6bedc', '#e9e2f2');
    window(c, 8, 12, P.cream); window(c, 91, 12, P.cream);
    // A reading alcove: the globe rests above its own cabinet, clear of the books.
    box(c, 5, 52, 21, 13, P.woodLight, P.woodDark);
    rect(c, 7, 54, 17, 9, '#ad8d81');
    for (const [x, h, color] of [[8, 6, P.mint], [12, 8, P.violet], [16, 5, P.P], [20, 7, P.L]]) {
      rect(c, x, 62 - h, 3, h, color); rect(c, x, 60, 3, 1, P.cream);
    }
    rect(c, 4, 51, 23, 2, P.woodDark);
    rect(c, 10, 49, 11, 2, P.woodDark); rect(c, 14, 45, 3, 4, P.woodDark);
    rect(c, 11, 34, 8, 13, P.blueShadow); rect(c, 8, 37, 14, 7, P.blueShadow);
    rect(c, 10, 36, 10, 9, P.B); rect(c, 12, 35, 6, 11, P.B);
    rect(c, 10, 37, 5, 3, P.mintDark); rect(c, 13, 40, 4, 4, P.mintDark);
    rect(c, 17, 37, 3, 2, P.mint); rect(c, 11, 36, 3, 1, P.cream);
    rect(c, 21, 36, 1, 8, P.gold); rect(c, 18, 44, 3, 2, P.gold);
    books(c, 96, 61, [P.B, P.P, P.violet]); shelf(c, 93, 61, 21);
    sparkle(c, 60, 10, P.violet);
  } else {
    // Attic eaves frame a calm cream center; stars decorate the side rafters.
    wall(c, '#fff7e8', '#d9bea0', '#eee0c8');
    for (let x = 0; x < 38; x += 2) {
      const height = 25 - Math.floor(x / 2);
      rect(c, x, 0, 2, height, P.woodLight); rect(c, x, height, 2, 3, P.woodDark);
      rect(c, 118 - x, 0, 2, height, P.woodLight); rect(c, 118 - x, height, 2, 3, P.woodDark);
    }
    window(c, 8, 31, P.cream); window(c, 91, 31, P.cream);
    rect(c, 0, 7, 120, 3, P.woodDark); rect(c, 0, 7, 120, 1, P.woodLight);
    rect(c, 25, 11, 1, 6, P.woodDark); star(c, 21, 17, P.goldLight, P.gold);
    rect(c, 94, 11, 1, 6, P.woodDark); star(c, 90, 17, P.goldLight, P.gold);
    books(c, 7, 76, [P.mintDark, P.P, P.B]); shelf(c, 4, 76, 24);
    books(c, 97, 76, [P.violet, P.mintDark, P.P]); shelf(c, 94, 76, 23);
  }
  return scale(c, 2);
}

function step() {
  const c = canvas(24, 12);
  // A broad birch tread with a shadow under its lip and twin riveted brackets.
  rect(c, 2, 1, 20, 7, P.N); rect(c, 0, 3, 24, 5, P.N);
  rect(c, 2, 2, 20, 3, P.woodLight); rect(c, 1, 4, 22, 1, P.cream);
  rect(c, 4, 2, 8, 1, P.cream); rect(c, 15, 3, 5, 1, P.wood);
  rect(c, 1, 5, 22, 2, P.wood); rect(c, 2, 6, 20, 1, '#ba8566');
  for (const x of [3, 16]) {
    rect(c, x, 8, 5, 2, P.N); rect(c, x + 1, 10, 3, 1, P.N);
    rect(c, x + 1, 8, 3, 1, P.mintDark); put(c, x + 2, 8, P.cream);
  }
  return scale(c, 2);
}
function minju() {
  const c = canvas(32, 32);
  // Back ponytail and ribbon silhouette.
  rect(c, 23, 8, 5, 15, P.ink); rect(c, 25, 10, 4, 10, P.ink);
  rect(c, 24, 10, 3, 10, P.hair); rect(c, 26, 12, 2, 6, P.hairLight);
  rect(c, 24, 20, 3, 3, P.hair); put(c, 23, 23, P.ink);
  rect(c, 21, 8, 3, 3, P.mintDark); rect(c, 24, 7, 3, 4, P.mintDark);
  rect(c, 22, 8, 2, 2, P.mint); rect(c, 25, 8, 2, 2, P.mint);
  // Navy uniform shoulders, white shirt, teal bow.
  rect(c, 9, 24, 14, 8, P.ink); rect(c, 6, 27, 20, 5, P.ink);
  rect(c, 8, 26, 16, 6, P.N); rect(c, 10, 24, 12, 8, P.N);
  rect(c, 13, 23, 6, 4, P.skinShade); rect(c, 14, 23, 4, 3, P.skin);
  rect(c, 11, 25, 10, 2, P.cream); rect(c, 13, 27, 6, 2, P.cream);
  rect(c, 14, 29, 4, 3, P.cream); put(c, 12, 27, P.L); put(c, 19, 27, P.L);
  rect(c, 13, 27, 2, 2, P.mintDark); rect(c, 17, 27, 2, 2, P.mintDark);
  rect(c, 15, 28, 2, 3, P.mintDark); put(c, 15, 28, P.mint);
  rect(c, 8, 28, 2, 4, '#344c76'); rect(c, 22, 28, 2, 4, '#344c76');
  // Face, ears and swept bangs. Rounded pixel silhouette, friendly gaze.
  rect(c, 10, 4, 12, 2, P.ink); rect(c, 8, 6, 16, 14, P.ink);
  rect(c, 9, 19, 14, 3, P.ink); rect(c, 11, 22, 10, 2, P.ink);
  rect(c, 11, 10, 10, 12, P.skin); rect(c, 10, 12, 12, 8, P.skin);
  rect(c, 7, 14, 3, 5, P.skinShade); rect(c, 22, 14, 3, 5, P.skinShade);
  rect(c, 8, 14, 2, 3, P.skin); rect(c, 22, 14, 2, 3, P.skin);
  rect(c, 12, 22, 8, 1, P.skinShade); rect(c, 13, 22, 6, 1, P.skin);
  rect(c, 10, 6, 12, 6, P.hair); rect(c, 9, 8, 3, 7, P.hair);
  rect(c, 21, 8, 2, 7, P.hair); rect(c, 11, 5, 10, 2, P.hair);
  rect(c, 12, 11, 3, 2, P.hair); rect(c, 15, 10, 2, 2, P.hair);
  rect(c, 17, 9, 2, 2, P.hair); put(c, 12, 13, P.hair); put(c, 10, 15, P.ink);
  rect(c, 11, 7, 5, 1, P.hairLight); rect(c, 10, 8, 2, 2, P.hairLight);
  rect(c, 18, 6, 3, 1, P.hairLight); rect(c, 20, 7, 2, 2, P.hairLight);
  rect(c, 12, 15, 2, 3, P.ink); rect(c, 18, 15, 2, 3, P.ink);
  put(c, 12, 15, P.W); put(c, 18, 15, P.W);
  rect(c, 10, 18, 3, 1, P.blush); rect(c, 20, 18, 2, 1, P.blush);
  rect(c, 15, 20, 3, 1, '#b85c65'); put(c, 17, 19, '#b85c65');
  // A tiny gold school pin, without a logo or writing.
  put(c, 21, 29, P.Y);
  return scale(c, 2);
}
function attic() {
  const c = canvas(32, 32);
  rect(c, 6, 14, 21, 15, P.ink); rect(c, 7, 14, 19, 14, P.woodLight);
  for (let y = 3; y < 16; y++) {
    const half = y - 2; rect(c, 16 - half, y, half * 2, 1, P.ink);
    if (y > 5) rect(c, 18 - half, y, half * 2 - 4, 1, P.woodDark);
  }
  rect(c, 6, 15, 21, 2, P.woodDark);
  box(c, 12, 17, 9, 12, P.cream, P.ink); rect(c, 14, 19, 5, 9, P.mint);
  rect(c, 15, 20, 3, 5, '#dbefe3'); put(c, 18, 25, P.gold);
  box(c, 14, 10, 5, 5, P.L, P.ink); rect(c, 16, 11, 1, 3, P.cream);
  rect(c, 15, 12, 3, 1, P.cream); rect(c, 9, 29, 15, 2, P.ink);
  rect(c, 10, 29, 13, 1, P.woodLight);
  star(c, 0, 3, P.goldLight); sparkle(c, 27, 6, P.gold); sparkle(c, 3, 23, P.mintDark);
  return scale(c, 2);
}
function token() {
  const c = canvas(16, 16);
  const spans = [[], [[7, 8]], [[6, 9]], [[6, 9]], [[5, 10]], [[1, 14]],
    [[2, 13]], [[3, 12]], [[4, 11]], [[4, 11]], [[3, 12]], [[3, 6], [9, 12]], [[2, 4], [11, 13]]];
  const mask = new Set();
  spans.forEach((ranges, y) => ranges.forEach(([left, right]) => {
    for (let x = left; x <= right; x++) mask.add(`${x},${y}`);
  }));
  spans.forEach((ranges, y) => ranges.forEach(([left, right]) => {
    for (let x = left; x <= right; x++) {
      const edge = [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => !mask.has(`${x + dx},${y + dy}`));
      put(c, x, y, edge ? P.gold : P.goldLight);
    }
  }));
  rect(c, 6, 5, 2, 3, P.cream); put(c, 5, 6, P.cream);
  return c;
}
function stamp() {
  const c = canvas(48, 48);
  // Existing stamp family: stepped octagon, double gold rim and navy outline.
  rect(c, 13, 3, 22, 42, P.N); rect(c, 7, 7, 34, 34, P.N); rect(c, 3, 13, 42, 22, P.N);
  rect(c, 14, 5, 20, 38, P.gold); rect(c, 9, 9, 30, 30, P.gold); rect(c, 5, 14, 38, 20, P.gold);
  rect(c, 15, 7, 18, 34, P.cream); rect(c, 11, 11, 26, 26, P.cream); rect(c, 7, 15, 34, 18, P.cream);
  rect(c, 14, 6, 19, 1, P.goldLight); rect(c, 6, 15, 1, 17, P.goldLight);
  // Three solid ascending steps with a star at the destination.
  for (let i = 0; i < 3; i++) {
    const x = 10 + i * 9, y = 30 - i * 7;
    box(c, x, y, 10, 8 + i * 7, P.B, P.N);
    rect(c, x + 1, y + 1, 8, 2, P.cream); rect(c, x + 2, y + 4, 6, 2, P.mint);
  }
  star(c, 29, 7, P.goldLight); sparkle(c, 14, 18, P.mintDark);
  return c;
}

output('stairs', 'tile-step.png', step(), '민트색 금속 받침과 자작나무 디딤판이 있는 계단 타일');
const themes = ['민트빛 화분과 정원 창문', '하늘빛 컴퓨터 교실 장식', '복숭아빛 미술 작품과 꽃', '연보라빛 책과 지구본', '포근한 나무 서까래와 책, 별 모빌'];
for (let i = 1; i <= 5; i++) output('stairs', `floor-${i}.png`, backdrop(i), `${i}층 배경 — ${themes[i - 1]}`);
output('stairs', 'guide-minju.png', minju(), '민트 리본 포니테일과 남색 교복을 입은 민주 선배');
output('stairs', 'goal-attic.png', attic(), '별이 반짝이는 꿈다락 지붕과 민트 문');
output('stairs', 'star-token.png', token(), '작은 금빛 별 토큰');
output('stamps', 'stairs.png', stamp(), '별을 향해 올라가는 세 계단 완주 도장');
console.log(JSON.stringify(records, null, 2));
