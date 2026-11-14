/* 게임 픽셀아트 공통 도우미 — RGBA 캔버스·정수 확대·PNG 저장 (Node.js, 추가 설치 없음) */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync, crc32 } from 'node:zlib';

/* ---------- 색 ---------- */

export const PALETTE = {
  '.': null,          // 투명
  N: '#14285a',       // 남색 외곽선
  W: '#ffffff',
  L: '#cfe8f7',       // 유리·물 (연파랑)
  B: '#7fbbe0',       // 물 (파랑)
  I: '#eaf7ff',       // 얼음
  K: '#5b3a1e',       // 에스프레소
  T: '#e8c48a',       // 크레마
  M: '#fff6e6',       // 우유
  E: '#fffcf2',       // 머그 (크림)
  A: '#aebfe3',       // 연남색 (머그 띠·김)
  S: '#b7c0cb',       // 스테인리스
  D: '#6f7b8a',       // 진회색
  Y: '#f2c94c',       // 바닐라 (노랑)
  O: '#e08a1e',       // 주황 라벨
  R: '#e85d75',       // 딸기 (빨강)
  P: '#f7a8b8',       // 딸기청 (분홍)
  G: '#4f9a5b'        // 잎 (초록)
};

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

/* ---------- 작은 캔버스 (RGBA) ---------- */

export function canvas(w, h) {
  return { w, h, data: new Uint8Array(w * h * 4) };
}
export function put(c, x, y, color) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h || !color) return;
  const i = (y * c.w + x) * 4;
  const [r, g, b] = hex(color);
  c.data[i] = r; c.data[i + 1] = g; c.data[i + 2] = b; c.data[i + 3] = 255;
}
export function rect(c, x, y, w, h, color) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(c, i, j, color);
}
/** 테두리만 (외곽선용) */
export function frame(c, x, y, w, h, color) {
  rect(c, x, y, w, 1, color); rect(c, x, y + h - 1, w, 1, color);
  rect(c, x, y, 1, h, color); rect(c, x + w - 1, y, 1, h, color);
}
/** 채우고 테두리 — 픽셀 그림의 기본 단위 */
export function box(c, x, y, w, h, fill, line = PALETTE.N) {
  rect(c, x, y, w, h, fill);
  frame(c, x, y, w, h, line);
}
/** 글자 그림(행 배열) → 캔버스 */
export function fromRows(rows) {
  const c = canvas(rows[0].length, rows.length);
  rows.forEach((row, y) => [...row].forEach((ch, x) => put(c, x, y, PALETTE[ch])));
  return c;
}
/** 정수 배로 키우기 (픽셀 또렷하게) */
export function scale(c, k) {
  const out = canvas(c.w * k, c.h * k);
  for (let y = 0; y < out.h; y++) for (let x = 0; x < out.w; x++) {
    const si = ((y / k | 0) * c.w + (x / k | 0)) * 4, di = (y * out.w + x) * 4;
    out.data.set(c.data.subarray(si, si + 4), di);
  }
  return out;
}

/* ---------- PNG 저장 (zlib만 사용) ---------- */

export function png(c) {
  const chunk = (type, body) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(body.length);
    const typed = Buffer.concat([Buffer.from(type, 'ascii'), body]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(typed) >>> 0);
    return Buffer.concat([len, typed, crc]);
  };
  const head = Buffer.alloc(13);
  head.writeUInt32BE(c.w, 0); head.writeUInt32BE(c.h, 4);
  head[8] = 8; head[9] = 6; head[10] = 0; head[11] = 0; head[12] = 0;   // 8비트 RGBA
  const raw = Buffer.alloc((c.w * 4 + 1) * c.h);
  for (let y = 0; y < c.h; y++) {
    raw[y * (c.w * 4 + 1)] = 0;   // 필터 없음
    raw.set(c.data.subarray(y * c.w * 4, (y + 1) * c.w * 4), y * (c.w * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', head), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))
  ]);
}
export function save(out, name, c) {
  writeFileSync(join(out, name), png(c));
  console.log(`  ${name}  ${c.w}×${c.h}`);
}

