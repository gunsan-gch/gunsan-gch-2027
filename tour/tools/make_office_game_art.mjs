/* 사무 자격증 타자 게임 픽셀아트 (Node.js, 추가 설치 없음)
 * node tour/tools/make_office_game_art.mjs [다른폴더]
 * 모니터 32×32, 아이템 16×16을 네 배 확대합니다. 투명 배경, 파스텔과 남색 외곽선.
 */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETTE, canvas, rect, box, fromRows, scale, save } from './pixel.mjs';

const OUT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'img', 'games', 'office');
mkdirSync(OUT, { recursive: true });

function drawMonitor() {
  const c = canvas(32, 32);
  box(c, 3, 3, 26, 19, PALETTE.A);
  box(c, 5, 5, 22, 14, PALETTE.I);
  rect(c, 7, 7, 13, 1, PALETTE.B);
  rect(c, 7, 10, 17, 1, PALETTE.B);
  rect(c, 7, 13, 2, 4, PALETTE.G);
  box(c, 13, 22, 6, 3, PALETTE.S);
  box(c, 10, 24, 12, 2, PALETTE.A);
  box(c, 2, 27, 28, 4, PALETTE.M);
  for (let x = 4; x < 28; x += 3) rect(c, x, 28, 2, 1, PALETTE.A);
  rect(c, 11, 29, 10, 1, PALETTE.A);
  return c;
}

const ICONS = {
  'item-ice': [
    '.......NN.......',
    '....N..NN..N....',
    '...NBN.NN.NBN...',
    '..NIBNNIINNBIN..',
    '...NIBNIINBIN...',
    '....NIBIIBIN....',
    '..NNNNIIIINNNN..',
    'NNIIIIIIIIIIIINN',
    'NNIIIIIIIIIIIINN',
    '..NNNNIIIINNNN..',
    '....NIBIIBIN....',
    '...NIBNIINBIN...',
    '..NIBNNIINNBIN..',
    '...NBN.NN.NBN...',
    '....N..NN..N....',
    '.......NN.......'
  ],
  'item-slow': [
    '......NNNN......',
    '......NYYN......',
    '......NNNN......',
    '....NNNNNNNN....',
    '...NLLLLLLLLN...',
    '..NLWWWWWWWWLN..',
    '.NLWWWWNWWWWWLN.',
    '.NLWWWWNWWWWWLN.',
    '.NLWWWWNNNWWWLN.',
    '.NLWWWWWWWWWWLN.',
    '.NLWWWWWWWWWWLN.',
    '..NLWWWWWWWWLN..',
    '...NLLLLLLLLN...',
    '....NNNNNNNN....',
    '................',
    '................'
  ],
  'item-bomb': [
    '..........Y.....',
    '.........YOY....',
    '........N.Y.....',
    '.......NTN......',
    '......NNNN......',
    '....NNAAAANN....',
    '...NAWWAAAAAN...',
    '..NAWWAAAAAAAN..',
    '..NAWAAAAAAAAN..',
    '..NAAAAAAAAAAN..',
    '..NAAAAAAAAAAN..',
    '...NAAAAAAAAN...',
    '....NNAAAANN....',
    '......NNNN......',
    '................',
    '................'
  ],
  'item-heart': [
    '................',
    '................',
    '..NNNN....NNNN..',
    '.NPPPPN..NPPPPN.',
    'NPWWPPPNNPPPPPPN',
    'NPWPPPPPPPPPPPPN',
    'NPPPPPPPPPPPPPPN',
    'NPPPPPPPPPPPPPPN',
    '.NPPPPPPPPPPPPN.',
    '..NPPPPPPPPPPN..',
    '...NPPPPPPPPN...',
    '....NPPPPPPN....',
    '.....NPPPPN.....',
    '......NPPN......',
    '.......NN.......',
    '................'
  ]
};

console.log(`→ ${OUT}`);
save(OUT, 'monitor.png', scale(drawMonitor(), 4));
for (const [name, rows] of Object.entries(ICONS)) save(OUT, `${name}.png`, scale(fromRows(rows), 4));
