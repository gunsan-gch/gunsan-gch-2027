// 게시판의 빈 판과 완성된 판, 예술제 인쇄물을 같은 색으로 그립니다.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { box, canvas, frame, png, put, rect } from './pixel.mjs';

const ink = '#344650', wood = '#925e43', cork = '#d7a570';
const cream = '#fff1cb', mint = '#377f76', rose = '#cb5e66', gold = '#efbf62';
const dir = new URL('../img/board/', import.meta.url);
const manifestFile = new URL('../img/ASSET-SOURCES.json', import.meta.url);
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
mkdirSync(dir, { recursive: true });

function board(filled) {
  const c = canvas(36, 27);
  box(c, 0, 0, 36, 27, wood, ink);
  box(c, 2, 2, 32, 22, cork, '#ad7955');
  rect(c, 1, 1, 33, 1, '#efd09a');
  rect(c, 2, 25, 32, 1, '#c38a59');
  for (let y = 4; y < 22; y += 3) {
    for (let x = 4 + y % 5; x < 32; x += 7) put(c, x, y, '#c18d60');
  }
  for (const [x, y, color] of [[5, 5, mint], [15, 7, rose], [25, 5, gold]]) {
    if (filled) {
      rect(c, x + 1, y + 1, 7, 13, wood);
      rect(c, x, y, 7, 13, cream);
      rect(c, x + 1, y + 4, 5, 3, color);
      rect(c, x + 1, y + 9, 4, 1, wood);
    }
    rect(c, x + 2, y - 1, 3, 3, color);
    put(c, x + 2, y - 1, cream);
  }
  return c;
}

function poster() {
  const c = canvas(48, 60);
  box(c, 0, 0, 48, 60, cream, ink);
  frame(c, 3, 3, 42, 54, wood);
  rect(c, 6, 7, 36, 30, mint);
  // 무대 양옆의 커튼과 가운데 피어난 꽃
  for (let i = 0; i < 5; i++) {
    rect(c, 6 + i * 2, 7, 2, 24 - i * 4, rose);
    rect(c, 40 - i * 2, 7, 2, 24 - i * 4, rose);
  }
  rect(c, 23, 22, 2, 13, cream);
  rect(c, 18, 27, 5, 3, gold);
  for (const [x, y] of [[21, 12], [16, 17], [26, 17], [21, 22]]) {
    rect(c, x, y, 6, 6, '#f2a39a');
  }
  rect(c, 21, 17, 6, 6, gold);
  rect(c, 9, 41, 30, 3, mint);
  rect(c, 14, 47, 20, 2, wood);
  rect(c, 20, 52, 8, 1, rose);
  return c;
}

for (const [name, art, description] of [
  ['empty', board(false), '빈 코르크 게시판'],
  ['filled', board(true), '안내문 세 장을 붙인 게시판'],
  ['festival', poster(), '꽃과 무대 커튼을 그린 녹원예술제 포스터']
]) {
  const bytes = png(art);
  const output = `board/${name}.png`;
  writeFileSync(new URL(name + '.png', dir), bytes);
  manifest.sources[output] = {
    output, kind: 'mission-pixel-art', description,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    source: '직접 생성', generator: 'tools/make_board_art.mjs'
  };
}
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
