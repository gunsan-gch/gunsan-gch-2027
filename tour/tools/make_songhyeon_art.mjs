// Original Songhyeon NPC. Run with node tour/tools/make_songhyeon_art.mjs
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { canvas, put, save, scale } from './pixel.mjs';

const out = fileURLToPath(new URL('../img/npcs/', import.meta.url));
mkdirSync(out, { recursive: true });
const colors = {
  n:'#25344c', h:'#573a43', v:'#865854', l:'#b17a64',
  s:'#ffd5b3', t:'#e9a888', p:'#ef9e99', w:'#fff9eb',
  b:'#34496e', d:'#536989', m:'#57a69f', a:'#a5dfcf',
  g:'#f3c769', r:'#c5655d', e:'#f4dca8'
};
function draw(c, x, y, rows) {
  rows.forEach((row, j) => [...row].forEach((key, i) => {
    if (key !== '.') put(c, x + i, y + j, colors[key]);
  }));
}

// A long side ponytail tied high with a small brass cuff.
const hairAndFace = [
  '.......nnnnnn.......',
  '.....nnhvvvvhnn.....',
  '....nhhvllllvvhn....',
  '..nnnhvvvhhhhvvhn...',
  '.nhvgghhhvvhhhvhn...',
  'nhvvgghhvvhhsshhn...',
  'nhvhnhhvvhhsssshhn..',
  'nhvhnhvvhtsssssshn..',
  'nhvhnhhhtsssssnhsn..',
  'nhvhnhhtsnsssssnstn.',
  'nhvhntsssnsssssnstn.',
  'nhvhnntssppssssppn..',
  'nhvh..ntsssssrsssn..',
  'nhhhn..ntssrrsssn...',
  '.nhhn...ntsssssn....',
  '.nhvn....nnttnn.....',
  '..nhvn..............',
  '...nhn..............',
  '....n...............'
];
const uniform = [
  '....nnntttnnn.....',
  '..nnbwwsswwbbnn...',
  '.nbbdwwwwwdbbdn...',
  'nbbddbwmmwbbgdn...',
  'nbbdnbbmmbbbbdn...',
  'nbbdnbbmwbbndbn...',
  '.nttnbbbwbbnttn...',
  '..nnnbbbwbbnnn....',
  '....ndddbddn......',
  '....nbdbdbdbn.....',
  '...nbbdbdbdbn.....',
  '...nnnnnnnnnn.....',
  '....nttn.nttn.....',
  '....nwwn.nwwn.....',
  '....nwwn.nwwn.....',
  '...nbbbn.nbbbn....',
  '..nnnnnn.nnnnnn...'
];
const tube = [
  '..nnnn.', '.naaan.', '.nmmmn.', '.ngggn.', '.namnn.',
  'nammn..', 'nammn..', 'nammn..', 'nammn..', 'ngggn..', '.nnn...'
];
const rolledPoster = [
  '....nnnn', '...newwn', '...nwen.', '..nwwen.', '..nrrn..',
  '.nrrgn..', '.nwen...', 'nwtsn...', 'ntssn...', '.nttn...', '..nn....'
];

const map = canvas(32, 40);
draw(map, 7, 22, uniform);
draw(map, 4, 26, tube);
draw(map, 6, 6, hairAndFace);
draw(map, 20, 20, rolledPoster);
save(out, 'songhyeon-map.png', map);

// The portrait uses its own bust composition so the paper and club pin stay legible.
const portrait = canvas(32, 32);
draw(portrait, 2, 18, [
  '.........nntttnn...........',
  '.......nnwwssswwnn.........',
  '.....nnbbwwwswwwbbnn.......',
  '....nbbdbbwwwwwbbdbbn......',
  '...nbbddbbbwawbbbdgdbn.....',
  '..nbbddnbbbmmmbbgwgdbn....',
  '.nbbddnbbbbmambbbgdbbn....',
  '.nbbdnbbbbbmambbbbbdbn....',
  'nbbddnbbbbbmawbbbbndbn....',
  'nbbdnbbbbbbmwwbbbbndbn....',
  'nbbdnbbbbbbbwwbbbbndbn....',
  'nbbdnbbbbbbbwwbbbbndbn....',
  'nbbdnbbbbbbbwwbbbbndbn....',
  'nnnnnbbbbbbbwwbbbbnnnn....'
]);
draw(portrait, 4, 3, hairAndFace);
draw(portrait, 0, 21, tube);
draw(portrait, 23, 17, rolledPoster);
save(out, 'songhyeon-portrait.png', scale(portrait, 2));
