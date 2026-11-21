/* 화면 틀용 16×16 픽셀 아이콘을 3배로 저장한다. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { canvas, rect, box, scale, png, PALETTE as P } from './pixel.mjs';

const out = fileURLToPath(new URL('../img/ui/', import.meta.url));
mkdirSync(out, { recursive: true });
const drawings = {
  stamp(c) {
    box(c, 5, 1, 6, 7, P.P); box(c, 3, 7, 10, 5, P.L);
    box(c, 1, 11, 14, 4, P.M); rect(c, 3, 13, 10, 1, P.P);
  },
  closet(c) {
    box(c, 5, 2, 6, 12, P.L); box(c, 1, 3, 4, 6, P.L); box(c, 11, 3, 4, 6, P.L);
    rect(c, 6, 2, 4, 2, P.N); rect(c, 7, 6, 2, 6, P.W);
  },
  mission(c) {
    box(c, 2, 3, 12, 12, P.M); rect(c, 5, 5, 1, 8, P.B);
    rect(c, 9, 5, 1, 8, P.B); rect(c, 10, 0, 3, 9, P.N);
    rect(c, 7, 3, 9, 3, P.N); rect(c, 11, 2, 1, 5, P.Y); rect(c, 9, 4, 5, 1, P.Y);
  },
  trophy(c) {
    box(c, 1, 3, 14, 6, P.Y); rect(c, 3, 5, 10, 2, P.W);
    box(c, 4, 1, 8, 9, P.Y); box(c, 6, 9, 4, 4, P.M);
    box(c, 3, 12, 10, 3, P.L); rect(c, 6, 3, 2, 4, P.M);
  },
  camera(c) {
    box(c, 3, 2, 5, 4, P.P); box(c, 1, 5, 14, 9, P.L);
    box(c, 5, 6, 7, 7, P.N); box(c, 7, 8, 3, 3, P.W); rect(c, 2, 7, 2, 2, P.Y);
  },
  box(c) {
    box(c, 1, 3, 14, 12, P.T); rect(c, 2, 7, 12, 2, P.N);
    box(c, 6, 3, 4, 12, P.M); rect(c, 2, 4, 3, 2, P.M);
  },
  receipt(c) {
    box(c, 3, 1, 10, 14, P.M); rect(c, 5, 4, 6, 2, P.P);
    rect(c, 5, 8, 6, 1, P.N); rect(c, 5, 11, 4, 1, P.N);
    rect(c, 5, 14, 2, 1, P.M); rect(c, 9, 14, 2, 1, P.M);
  },
  magnifier(c) {
    box(c, 1, 1, 10, 10, P.L); box(c, 3, 3, 6, 6, P.W);
    box(c, 9, 9, 4, 4, P.P); box(c, 11, 11, 4, 4, P.P);
  }
};
function speaker(c, on) {
  box(c, 1, 5, 5, 6, P.L); box(c, 5, 3, 4, 10, P.L);
  rect(c, 7, 2, 2, 12, P.N);
  if (on) {
    rect(c, 11, 5, 2, 6, P.N); rect(c, 13, 3, 2, 2, P.N); rect(c, 14, 5, 2, 6, P.N); rect(c, 13, 11, 2, 2, P.N);
  } else {
    for (let i = 0; i < 5; i++) { rect(c, 10 + i, 5 + i, 2, 2, P.N); rect(c, 14 - i, 5 + i, 2, 2, P.N); }
  }
}
drawings['speaker-on'] = c => speaker(c, true);
drawings['speaker-off'] = c => speaker(c, false);
const manifestPath = new URL('../img/ASSET-SOURCES.json', import.meta.url);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
for (const [name, draw] of Object.entries(drawings)) {
  const c = canvas(16, 16); draw(c);
  const data = png(scale(c, 3)), output = `ui/${name}.png`;
  writeFileSync(`${out}${name}.png`, data);
  manifest.sources[output] = {
    output, kind: 'ui-pixel-art',
    sha256: createHash('sha256').update(data).digest('hex'),
    description: `공통 화면 아이콘 · ${name} (16×16, 3배)`,
    source: '직접 생성', generator: 'tools/make_ui_icons.mjs'
  };
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
