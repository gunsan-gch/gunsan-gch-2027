// Original Songhyeon map pose. The dialogue illustration has its own source.
// Run with node tour/tools/make_songhyeon_art.mjs
import { fileURLToPath } from 'node:url';
import { canvas, put, save } from './pixel.mjs';

const out = fileURLToPath(new URL('../img/npcs/', import.meta.url));
const sprite = canvas(32, 40);
const colors = {
  k:'#19141d', n:'#281f29', h:'#382c32', v:'#514044', l:'#695153',
  f:'#806361', t:'#df9c76', s:'#f4bd91', a:'#ffd2a4', e:'#fff0d0',
  b:'#c98572', z:'#181520', j:'#282940', d:'#3d405c', u:'#535772',
  w:'#eee6d7', m:'#21575c', g:'#3d8281', i:'#79a9a2', p:'#9b6767',
  y:'#e8b266', o:'#b97f55', r:'#9b4d58', c:'#e3c9ae'
};
function draw(x,y,rows){
  for(const [dy,row] of rows.entries())for(const [dx,key] of [...row].entries()){
    if(key!=='.')put(sprite,x+dx,y+dy,colors[key]);
  }
}
// Pleated skirt, slightly turned loafers and the short school blazer.
draw(7,22,[
  '......jtttjj.....',
  '....jddwwwddj....',
  '...jddjwmwjddj...',
  '..jddujggwjduj...',
  '..jddjdmwjdjdj...',
  '..jddjjjwjdjuj...',
  '..tasjjjyjjstj...',
  '...tsjdddddjs....',
  '.....jmdmgdmj....',
  '....jgmggmggmj...',
  '....jmgmmgmmgj...',
  '.....ntsn.ntsn...',
  '......as...as....',
  '......cj...cj....',
  '......dj...dj....',
  '.....njj...jjn...',
  '....nnhj...jhkn..'
]);
// Tapered ponytail behind the left ear, with overlapping curled locks.
draw(2,9,[
  '....nnnn..',
  '...nhvvyyn',
  '..nhvlvoyn',
  '..nhlvhhhn',
  '.nhvhhnnn.',
  '.nhvhhn...',
  '.nhlhhn...',
  '.nhvlvhn..',
  '.nhhvlhn..',
  '..nhhlvhn.',
  '..nnhvlhn.',
  '...nhhvhn.',
  '....nhhvh.',
  '.....nhhh.',
  '.......hn.',
  '......nh..'
]);
// Warm near-black fringe, lit from the upper left, and the broad cheek plane.
draw(7,4,[
  '.......nnnnn........',
  '.....nnhhhhhnn......',
  '....nhvvhhhhhhn.....',
  '...nhvllvhvhhhhn....',
  '..nhvlfvvhhhvvhhn...',
  '.nhvvllvhhhvvvhhn...',
  '.nhvlvvhhhvlvhvhhk..',
  '.nhlvhhhvlvlhhhvhn..',
  'nhvvhhvllvhhhnnhhhn.',
  'nhvvhvvvhhhhtsnhhhn.',
  'nhhvhvhhhhtsaashhhn.',
  'nhhvhhnhtssaaaathhn.',
  'nhhhhntsaaaaaaasthn.',
  '.nhhhtsthaaaahtsshn.',
  '.nhhtsstzaaaaztaahn.',
  '..nhsstszaaaazsaatn.',
  '..nhhttbsaasaasbtn..',
  '...nnhstaaaaaaasn...',
  '.....nntssaasstn....',
  '........nttttn......'
]);
draw(6,10,['.oy','oy.','o..']);
// Bent forearm reaches the poster, with fingers wrapped around the tube.
draw(18,28,['.duj...', '.jjtsa.', '..tast.', '...tt..']);
// Ivory poster rolled around a warm shaded core, tied with the club's ribbon.
draw(19,21,[
  '......noo.',
  '.....oecen',
  '.....owecn',
  '....owecn.',
  '....owecn.',
  '...nrrcn..',
  '...nrpyn..',
  '..owecn...',
  '..osatn...',
  '..ntsn....',
  '...nn.....'
]);
save(out, 'songhyeon-map.png', sprite);
