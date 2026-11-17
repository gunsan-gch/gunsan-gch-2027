/* 현아 선배의 멜로디 따라잡기 — original integer-grid pixel artwork.
 * node tour/tools/make_melody_game_art.mjs [output img/games directory]
 * Shared pixel.mjs pipeline; only opaque or transparent pixels, no fonts,
 * source images, smoothing or gradients. All small art is drawn at 2× scale.
 * The stamp preserves the existing 48×48 stepped gold-and-navy badge family.
 * Metadata is printed to stdout; this script does not modify the manifest.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { PALETTE, canvas, put, rect, box, scale, save } from './pixel.mjs';

const OUT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '../img/games');
const P = { ...PALETTE, ink: '#25344c', navyLight: '#415777',
  hair: '#493841', hairLight: '#72505a', skin: '#ffd5b3', skinShade: '#eeb08d',
  coral: '#df7c81', coralLight: '#f7b2a4', cream: '#fff9eb',
  mint: '#b8ddcf', mintDark: '#6aab99', mintPale: '#e7f1e7',
  gold: '#d89a47', goldLight: '#ffe69a', wood: '#d6ad83', woodDark: '#98766e',
  woodLight: '#f1d7ab', lavender: '#ddd8ed', violet: '#a59abf' };
const records = [];
function output(folder, name, c, description) {
  const dir = join(OUT, folder);
  mkdirSync(dir, { recursive: true });
  save(dir, name, c);
  records.push({ path: `games/${folder}/${name}`, width: c.w, height: c.h,
    description, sha256: createHash('sha256').update(readFileSync(join(dir, name))).digest('hex') });
}
function sparkle(c, x, y, color = P.gold) {
  rect(c, x, y - 2, 1, 5, color); rect(c, x - 2, y, 5, 1, color);
}
function star(c, x, y, fill = P.goldLight, edge = P.gold) {
  const rows = ['....o....','...ooo...','...ofo...','ooooffooo','.offfffo.','..fffff..','..offfo..','.oo...oo.'];
  rows.forEach((r, yy) => [...r].forEach((p, xx) => { if (p !== '.') put(c, x + xx, y + yy, p === 'o' ? edge : fill); }));
  put(c, x + 4, y + 3, P.cream);
}
function note(c, x, y, fill, edge = P.N) {
  // A joined pair of eighth notes, drawn as a single readable silhouette.
  rect(c, x + 4, y, 10, 3, edge); rect(c, x + 4, y + 2, 3, 12, edge);
  rect(c, x + 11, y + 2, 3, 10, edge);
  rect(c, x + 1, y + 11, 6, 4, edge); rect(c, x, y + 12, 6, 2, edge);
  rect(c, x + 8, y + 9, 6, 4, edge); rect(c, x + 7, y + 10, 6, 2, edge);
  rect(c, x + 5, y + 1, 8, 1, fill); rect(c, x + 5, y + 2, 1, 11, fill);
  rect(c, x + 12, y + 2, 1, 9, fill);
  rect(c, x + 2, y + 12, 4, 2, fill); rect(c, x + 1, y + 12, 2, 1, fill);
  rect(c, x + 9, y + 10, 4, 2, fill); rect(c, x + 8, y + 10, 2, 1, fill);
}
function hyuna() {
  const c = canvas(32, 32);
  // Half-up hair with a short braid on her left, away from the baton hand.
  rect(c, 7, 6, 16, 17, P.ink); rect(c, 6, 9, 18, 11, P.ink);
  rect(c, 7, 12, 4, 11, P.hair); rect(c, 20, 12, 3, 11, P.hair);
  for (let y = 17; y < 25; y += 3) {
    rect(c, 5 + (y % 2), y, 4, 3, P.ink); rect(c, 6 + (y % 2), y, 2, 2, P.hairLight);
  }
  rect(c, 6, 25, 3, 2, P.coral); put(c, 7, 27, P.hair);
  // Navy uniform, cream collar and a small mint bow.
  rect(c, 9, 23, 13, 9, P.ink); rect(c, 7, 26, 18, 6, P.ink);
  rect(c, 10, 24, 11, 8, P.N); rect(c, 8, 27, 16, 5, P.N);
  rect(c, 13, 21, 5, 5, P.skinShade); rect(c, 14, 22, 3, 3, P.skin);
  rect(c, 11, 24, 9, 2, P.cream); rect(c, 13, 26, 5, 2, P.cream);
  rect(c, 14, 28, 3, 4, P.cream);
  rect(c, 12, 26, 2, 2, P.mintDark); rect(c, 17, 26, 2, 2, P.mintDark);
  rect(c, 14, 27, 3, 2, P.mint); rect(c, 15, 29, 1, 2, P.mintDark);
  rect(c, 8, 28, 2, 4, P.navyLight); rect(c, 21, 27, 2, 5, P.navyLight);
  put(c, 20, 29, P.goldLight);
  // Soft rounded face with a swept fringe and bright eyes.
  rect(c, 10, 3, 10, 2, P.ink); rect(c, 8, 5, 14, 4, P.ink);
  rect(c, 9, 6, 12, 14, P.skin); rect(c, 10, 19, 10, 3, P.skin);
  rect(c, 12, 22, 6, 1, P.skinShade);
  rect(c, 7, 12, 2, 5, P.skinShade); rect(c, 21, 12, 2, 5, P.skinShade);
  put(c, 8, 13, P.skin); put(c, 21, 13, P.skin);
  rect(c, 10, 4, 10, 2, P.hair); rect(c, 8, 6, 14, 3, P.hair);
  rect(c, 8, 8, 3, 5, P.hair); rect(c, 20, 8, 2, 5, P.hair);
  rect(c, 10, 8, 6, 2, P.hair); rect(c, 11, 10, 3, 1, P.hair);
  rect(c, 16, 8, 3, 1, P.hair); put(c, 10, 11, P.hair);
  rect(c, 10, 5, 5, 1, P.hairLight); rect(c, 9, 6, 2, 1, P.hairLight);
  rect(c, 17, 5, 3, 1, P.hairLight);
  rect(c, 11, 13, 2, 3, P.ink); rect(c, 17, 13, 2, 3, P.ink);
  put(c, 11, 13, P.W); put(c, 17, 13, P.W);
  rect(c, 9, 17, 3, 1, P.coralLight); rect(c, 19, 17, 2, 1, P.coralLight);
  rect(c, 14, 19, 3, 1, '#b85c65'); put(c, 16, 18, '#b85c65');
  // A coral ribbon anchors the half-up braid, clearly unlike other guides.
  rect(c, 5, 10, 3, 3, P.coral); rect(c, 8, 11, 3, 3, P.coral);
  put(c, 6, 10, P.coralLight); put(c, 9, 12, P.coralLight); put(c, 7, 12, P.cream);
  // Raised right hand and a slim diagonal conducting baton.
  rect(c, 24, 23, 4, 5, P.ink); rect(c, 24, 24, 3, 3, P.skin);
  rect(c, 23, 27, 3, 3, P.N); rect(c, 25, 21, 2, 3, P.woodDark);
  for (let i = 0; i < 7; i++) { put(c, 26 + Math.floor(i / 2), 21 - i, P.ink); put(c, 27 + Math.floor(i / 2), 21 - i, P.cream); }
  return scale(c, 2);
}
function stage() {
  const c = canvas(160, 64);
  const wall = '#edf3e9', trim = '#bacfca', shade = '#9fafb4', instrument = '#748399';
  rect(c, 0, 0, 160, 64, wall); rect(c, 0, 0, 160, 3, trim);
  rect(c, 0, 4, 160, 1, P.cream); rect(c, 0, 43, 160, 2, trim);
  rect(c, 0, 45, 160, 19, '#e6d9c4'); rect(c, 0, 46, 160, 1, '#cbbba8');
  // Quiet flat floorboards, leaving the middle clear for the guide sprite.
  rect(c, 0, 55, 160, 1, '#d5c5b1'); rect(c, 0, 63, 160, 1, '#cbbba8');
  [15, 45, 76, 107, 138].forEach(x => rect(c, x, 47, 1, 8, '#d5c5b1'));
  [0, 31, 61, 91, 122, 153].forEach(x => rect(c, x, 56, 1, 7, '#d5c5b1'));
  // Tall side windows with mint curtains and simple garden silhouettes.
  for (const x of [9, 126]) {
    box(c, x, 10, 25, 27, P.cream, trim); rect(c, x + 2, 12, 21, 22, '#d8e9ec');
    rect(c, x + 4, 16, 9, 2, P.cream); rect(c, x + 6, 15, 5, 1, P.cream);
    rect(c, x + 2, 30, 21, 4, '#c6ddd1'); rect(c, x + 5, 28, 7, 5, '#c6ddd1');
    rect(c, x + 16, 26, 5, 8, '#c6ddd1');
    rect(c, x + 12, 11, 1, 24, P.cream); rect(c, x + 1, 23, 23, 1, P.cream);
    rect(c, x - 2, 8, 29, 2, trim); rect(c, x - 2, 10, 4, 21, P.mint);
    rect(c, x + 23, 10, 4, 21, P.mint); rect(c, x - 2, 11, 1, 18, '#a9ccbc');
    rect(c, x + 26, 11, 1, 18, '#a9ccbc'); rect(c, x - 2, 30, 4, 2, '#a9ccbc');
    rect(c, x + 23, 30, 4, 2, '#a9ccbc'); rect(c, x - 1, 36, 27, 2, trim);
  }
  // Small warm ceiling lights, a quiet acoustic-panel band.
  for (const x of [48, 78, 108]) { rect(c, x, 5, 1, 3, trim); rect(c, x - 3, 8, 7, 2, P.cream); }
  for (const x of [44, 54, 104, 114]) { rect(c, x, 17, 5, 16, '#e1e9de'); rect(c, x + 1, 18, 1, 14, '#d5dfd4'); }
  // Upright piano is anchored to the left, with a tiny empty score rest.
  box(c, 6, 35, 36, 17, instrument, shade); rect(c, 8, 36, 32, 2, '#9cacbc');
  rect(c, 10, 33, 28, 2, instrument); box(c, 19, 31, 10, 6, '#edf0e2', shade);
  rect(c, 23, 32, 1, 4, '#c5cfbd');
  box(c, 5, 43, 38, 6, '#e9e9db', shade);
  for (let x = 8; x < 41; x += 3) rect(c, x, 44, 1, 4, '#bac2c4');
  for (const x of [9, 12, 18, 21, 24, 30, 33, 39]) rect(c, x, 44, 1, 2, instrument);
  rect(c, 8, 50, 3, 6, instrument); rect(c, 37, 50, 3, 6, instrument);
  rect(c, 18, 53, 15, 2, shade); rect(c, 19, 55, 2, 3, shade); rect(c, 30, 55, 2, 3, shade);
  // Speaker cabinet, small monitor, and empty music stand at the right.
  box(c, 139, 38, 14, 20, '#8b9caa', shade); rect(c, 141, 40, 10, 16, '#a8b7bc');
  rect(c, 144, 41, 4, 4, '#7f919e'); rect(c, 143, 48, 6, 6, '#7f919e');
  rect(c, 144, 49, 4, 4, '#b3c1c4'); rect(c, 145, 50, 2, 2, '#8b9caa');
  box(c, 114, 35, 14, 9, '#9bafb1', shade); rect(c, 116, 37, 10, 5, '#e3eadf');
  rect(c, 120, 44, 2, 12, shade); rect(c, 115, 56, 12, 1, shade);
  put(c, 114, 57, shade); put(c, 127, 57, shade);
  // The central 64×64 output-pixel placement zone stays low contrast.
  rect(c, 57, 49, 46, 2, '#ded4bf'); rect(c, 59, 51, 42, 1, '#e1d6c1');
  return scale(c, 2);
}
function trophy() {
  const c = canvas(32, 32);
  // Musical sculpture on a mint plinth, with no engraved lettering.
  box(c, 7, 25, 19, 5, P.N, P.ink); rect(c, 9, 26, 15, 2, P.mint);
  rect(c, 12, 22, 9, 3, P.gold); rect(c, 14, 18, 5, 5, P.gold);
  rect(c, 15, 19, 2, 4, P.goldLight); rect(c, 10, 24, 13, 1, P.goldLight);
  note(c, 10, 3, P.goldLight, P.gold);
  rect(c, 15, 4, 7, 1, P.cream); put(c, 12, 15, P.cream); put(c, 19, 13, P.cream);
  sparkle(c, 5, 10, P.mintDark); sparkle(c, 27, 7, P.gold); sparkle(c, 25, 19, P.coral);
  return scale(c, 2);
}
function song(kind) {
  const c = canvas(24, 24);
  if (kind === 'morning') {
    // Sunrise and a mint school satchel: the first tune of the school day.
    rect(c, 9, 2, 6, 1, P.gold); rect(c, 7, 4, 10, 7, P.gold);
    rect(c, 9, 3, 6, 9, P.gold); rect(c, 9, 5, 6, 5, P.goldLight);
    rect(c, 10, 4, 4, 1, P.cream); rect(c, 3, 7, 2, 1, P.gold);
    rect(c, 19, 7, 2, 1, P.gold); put(c, 5, 3, P.gold); put(c, 18, 3, P.gold);
    box(c, 9, 10, 6, 4, P.mint, P.N); rect(c, 10, 11, 4, 2, P.cream);
    box(c, 4, 13, 16, 9, P.mint, P.N); rect(c, 5, 14, 14, 3, '#dceee0');
    rect(c, 5, 17, 14, 1, P.mintDark); box(c, 10, 16, 4, 4, P.goldLight, P.N);
    rect(c, 6, 20, 3, 1, P.mintDark); rect(c, 16, 20, 2, 1, P.mintDark);
  } else if (kind === 'window') {
    box(c, 4, 3, 16, 17, P.woodLight, P.N); rect(c, 6, 5, 12, 13, P.L);
    rect(c, 7, 7, 6, 2, P.cream); rect(c, 9, 6, 3, 1, P.cream);
    rect(c, 6, 15, 12, 3, P.mint); rect(c, 7, 13, 4, 4, P.mint);
    rect(c, 11, 4, 2, 15, P.cream); rect(c, 5, 11, 14, 2, P.cream);
    rect(c, 2, 2, 20, 2, P.N); rect(c, 3, 4, 3, 13, P.mintDark);
    rect(c, 18, 4, 3, 13, P.mintDark); rect(c, 4, 4, 1, 11, P.mint);
    rect(c, 19, 4, 1, 11, P.mint); box(c, 2, 20, 20, 2, P.woodLight, P.N);
  } else if (kind === 'break') {
    // A milk carton and toasted sandwich for a cheerful lunch-break melody.
    box(c, 14, 5, 7, 15, P.cream, P.N); rect(c, 15, 3, 5, 2, P.N);
    rect(c, 15, 4, 5, 3, P.mint); rect(c, 15, 10, 5, 6, P.mint);
    rect(c, 16, 11, 3, 4, '#dceee0'); rect(c, 16, 1, 1, 4, P.coral);
    rect(c, 2, 19, 20, 2, P.N); rect(c, 3, 19, 18, 1, P.L);
    for (let y = 7; y < 18; y++) {
      rect(c, 3, y, y - 5, 1, P.N);
      if (y > 8) rect(c, 4, y, y - 8, 1, P.woodLight);
    }
    rect(c, 4, 15, 8, 1, P.mintDark); rect(c, 4, 16, 9, 1, P.coral);
    put(c, 6, 12, P.cream); put(c, 8, 14, P.cream);
  } else if (kind === 'stars') {
    // A crescent and hanging star, distinct from the trophy's musical shape.
    rect(c, 6, 3, 10, 2, P.N); rect(c, 4, 5, 13, 3, P.N);
    rect(c, 3, 8, 14, 8, P.N); rect(c, 5, 16, 13, 3, P.N);
    rect(c, 7, 19, 10, 2, P.N); rect(c, 5, 7, 5, 9, P.goldLight);
    rect(c, 7, 5, 5, 3, P.goldLight); rect(c, 6, 16, 10, 2, P.goldLight);
    rect(c, 8, 18, 8, 1, P.goldLight); rect(c, 10, 8, 7, 6, P.cream);
    // Transparent cut-out makes a crisp crescent silhouette.
    for (let y = 3; y < 16; y++) for (let x = 10 + (y < 6 ? 2 : 0); x < 19; x++) {
      if (y < 14 || x > 13) { const i = (y * c.w + x) * 4; c.data.fill(0, i, i + 4); }
    }
    star(c, 13, 8, P.mint, P.mintDark); sparkle(c, 20, 3, P.gold); put(c, 3, 20, P.gold);
  } else {
    // A little attic music box under a steep roof with a glowing window.
    for (let y = 3; y < 13; y++) {
      const w = (y - 2) * 2; rect(c, 12 - (y - 2), y, w, 1, P.N);
      if (y > 5) rect(c, 14 - (y - 2), y, w - 4, 1, P.woodDark);
    }
    box(c, 4, 12, 16, 10, P.woodLight, P.N); rect(c, 5, 13, 14, 1, P.cream);
    box(c, 9, 14, 6, 7, P.goldLight, P.N); rect(c, 11, 15, 1, 5, P.cream);
    rect(c, 10, 17, 4, 1, P.cream); box(c, 10, 8, 4, 4, P.mint, P.N);
    rect(c, 6, 18, 2, 1, P.wood); rect(c, 16, 18, 2, 1, P.wood);
    sparkle(c, 20, 5, P.gold); put(c, 3, 7, P.mintDark);
  }
  return scale(c, 2);
}
function stamp() {
  const c = canvas(48, 48);
  rect(c, 13, 3, 22, 42, P.N); rect(c, 7, 7, 34, 34, P.N); rect(c, 3, 13, 42, 22, P.N);
  rect(c, 14, 5, 20, 38, P.gold); rect(c, 9, 9, 30, 30, P.gold); rect(c, 5, 14, 38, 20, P.gold);
  rect(c, 15, 7, 18, 34, P.cream); rect(c, 11, 11, 26, 26, P.cream); rect(c, 7, 15, 34, 18, P.cream);
  rect(c, 14, 6, 19, 1, P.goldLight); rect(c, 6, 15, 1, 17, P.goldLight);
  const emblem = canvas(24, 24); note(emblem, 6, 5, P.mint, P.N);
  const enlarged = scale(emblem, 2);
  for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) {
    const i = (y * 48 + x) * 4;
    if (enlarged.data[i + 3]) c.data.set(enlarged.data.subarray(i, i + 4), i);
  }
  sparkle(c, 12, 13, P.gold); sparkle(c, 36, 34, P.coral);
  return c;
}

output('melody', 'guide-hyuna.png', hyuna(), '코랄 리본과 짧은 옆땋기, 남색 교복에 지휘봉을 든 현아 선배');
output('melody', 'stage.png', stage(), '민트 커튼과 창문, 피아노·스피커가 있는 차분한 음악실 공연 공간');
output('melody', 'trophy.png', trophy(), '민트 받침 위의 금빛 음표 트로피');
const descriptions = { morning: '등굣길 아침 햇살과 민트 책가방', window: '민트 커튼 너머 구름이 보이는 창가', break: '쉬는 시간의 샌드위치와 우유', stars: '별빛을 품은 초승달', attic: '따뜻하게 빛나는 꿈다락 창문' };
for (const kind of Object.keys(descriptions)) output('melody', `song-${kind}.png`, song(kind), descriptions[kind]);
output('stamps', 'melody.png', stamp(), '민트빛 음표가 새겨진 금테 멜로디 완주 도장');
console.log(JSON.stringify(records, null, 2));
