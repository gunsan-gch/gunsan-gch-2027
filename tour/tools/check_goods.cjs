// Run with node tour/tools/check_goods.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {puzzleRound, toss, nudge, puzzleStep, piece, tick, deliver, stock, requested, fee, width, height, step, grace, line, stars} = require('../js/game-goods.js');
const mass = world => world.bodies.reduce((sum, p) => sum + 2 ** p.tier, 0);
const advanceWorld = (world, count) => {
  for (let i = 0; i < count; i++) tick(world, () => {});
};
{
  const world = {bodies: [0,0,0,0].map(t => piece(t, 180, 410)), score: 0};
  tick(world, () => {});
  assert.deepEqual(world.bodies.map(p => p.tier), [1,1]);
  assert.equal(world.score, 4);
  advanceWorld(world, 480);
  assert.equal(world.bodies.length, 1);
  assert.equal(mass(world), 4);
  assert.equal(world.score, 12);
  assert.equal(world.bodies[0].depth, 2);
}
{
  const world = {bodies: [piece(6,100,300), piece(6,112,300)], score: 0};
  advanceWorld(world, 720);
  assert.equal(world.bodies.length, 2);
  assert.equal(world.score, 0);
  for (const p of world.bodies) {
    assert.ok(p.x >= p.r && p.x <= width-p.r);
    assert.equal(p.y, height-p.r);
  }
}
{
  const world = {bodies: [piece(1, 100, 20)], score: 0};
  advanceWorld(world, 20);
  assert.ok(world.bodies[0].y-world.bodies[0].r < line);
  assert.equal(world.danger, 0, 'airborne goods never start the clock');
  // A compressed full box leaves a stable top product crossing the marked line.
  world.bodies = [piece(6,180,366),piece(5,180,249),piece(6,180,132),piece(5,180,53)];
  advanceWorld(world, Math.round((grace-.1)/step));
  assert.ok(world.danger > 1 && world.danger < grace);
  advanceWorld(world, 20);
  assert.ok(world.danger >= grace);
  world.bodies.pop();
  advanceWorld(world, 10);
  assert.equal(world.danger, 0);
}
assert.deepEqual([0,2,31,32,99,100,500].map(stars), [1,1,1,2,2,3,3]);
const source = fs.readFileSync(path.join(__dirname, '../js/game-goods.js'), 'utf8');
class Element {
  constructor() {
    this.nodes = new Map();
    this.events = new Map();
    this.hidden = false;
  }
  querySelector(selector) {
    if (!this.nodes.has(selector)) {
      assert.ok([...this.innerHTML.matchAll(/class="([^"]*)"/g)].some(match => match[1].split(/\s+/).includes(selector.slice(1))));
      this.nodes.set(selector, new Element());
    }
    return this.nodes.get(selector);
  }
  addEventListener(type, callback, options) {
    this.events.set(type, {callback, signal: options?.signal});
  }
  emit(type, detail = {}) {
    const entry = this.events.get(type);
    if (entry && !entry.signal?.aborted) entry.callback({preventDefault() {}, ...detail});
  }
  setAttribute(key, value) { this[key] = value; }
  getContext() {
    this.rotations = [];
    return new Proxy({rotate: angle => this.rotations.push(angle)}, {get: (ctx, key) => ctx[key] ?? (() => {})});
  }
  getBoundingClientRect() { return {left: 10, width: 360}; }
  setPointerCapture(id) { this.pointer = id; }
  focus() { this.focused = true; }
}
function session(fps, store = new Map(), random = () => 0, bestScore, usePuzzle = false, reduceMotion = false) {
  const body = new Element(), document = new Element(), window = new Element();
  window.TOUR_GAMES = {};
  window.matchMedia = () => ({matches:reduceMotion});
  document.createElement = () => new Element();
  let id = 0, time = 0;
  const frames = new Map(), results = [], cues = [];
  const math = Object.create(Math);
  math.random = random;
  vm.runInNewContext(source, {
    window, document, Image: class { complete = true; naturalWidth = 32; }, AbortController, Math: math,
    localStorage: {getItem: key => store.get(key), setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key)},
    requestAnimationFrame(callback) { frames.set(++id, callback); return id; },
    cancelAnimationFrame(handle) { frames.delete(handle); }
  });
  const game = window.TOUR_GAMES.goods;
  assert.equal(game.maxStars, 3);
  let cleanup = game.start(body, {bestScore, cue: (...args) => cues.push([time,...args]), done(result) { results.push(result); cleanup(); }});
  function advance(count) {
    for (let i = 0; i < count; i++) {
      time += 1000 / fps;
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(f => f(time));
    }
  }
  const $ = name => body.querySelector('.goods-' + name);
  if (!usePuzzle) $('free-mode').emit('click');
  return {$, advance, cleanup, results, frames, document, window, cues};
}
for (const puzzle of [true, false]) {
  for (const reduceMotion of [true, false]) {
    const game = session(60, new Map(), undefined, null, puzzle, reduceMotion);
    const {rotations} = game.$('board');
    game.advance(10);
    assert.equal(rotations.length, 0, 'aim and shelves stay upright');
    game.$('drop').emit('click');
    game.advance(14);
    if (reduceMotion) {
      assert.equal(rotations.length, 0);
    } else {
      assert(new Set(rotations).size > 5, 'first drop rotates immediately in either mode');
      assert(Math.abs(rotations.at(-1)-rotations[0]) > 0.5);
    }
    game.advance(180);
    rotations.length = 0;
    game.advance(10);
    assert(new Set(rotations).size <= 1, 'settled pieces and merge products do not keep turning');
    game.cleanup();
  }
}
const key = 'gch-tour-goods-catalogue';
for (const fps of [30,60,120]) {
  const store = new Map([[key, '!!!']]);
  const s = session(fps, store), { $, advance } = s;
  const board = $('board');
  assert.equal($('collect').disabled, true);
  const pt = {button:0, pointerId:8, clientX:190};
  board.emit('pointerdown', pt);
  board.emit('pointercancel', pt);
  board.emit('pointerup', pt);
  assert.equal($('drop').disabled, false);
  board.emit('keydown', {key:'ArrowLeft'});
  $('right').emit('click');
  board.emit('keydown', {key:'Enter', repeat:true});
  assert.equal($('drop').disabled, false);
  board.emit('pointerdown', {...pt, clientX:100});
  board.emit('pointermove', pt);
  board.emit('pointerup', {...pt, pointerId:9});
  assert.equal($('drop').disabled, false);
  board.emit('pointerup', pt);
  assert.equal($('drop').disabled, true);
  $('gallery-open').emit('click');
  assert.equal(s.frames.size, 0);
  assert.equal($('count').textContent, '발견한 굿즈 1 / 7');
  assert.equal($('resume').focused, true);
  advance(fps * 3);
  $('resume').emit('click');
  s.document.hidden = true;
  s.document.emit('visibilitychange');
  assert.equal(s.frames.size, 0);
  advance(fps * 4);
  s.document.hidden = false;
  s.document.emit('visibilitychange');
  assert.equal(s.frames.size, 0);
  $('continue').emit('click');
  s.window.emit('blur');
  board.emit('keydown', {key:'Enter'});
  assert.equal(s.frames.size, 0);
  $('continue').emit('click');
  advance(1);
  assert.equal($('drop').disabled, true, 'hidden time does not move an object');
  advance(fps);
  board.emit('keydown', {key:' '});
  advance(fps*2);
  assert.equal(Number($('score').textContent), 2);
  assert.equal($('ship').disabled, false);
  assert.match($('order-name').textContent, /키링/);
  $('ship').emit('click');
  assert.equal(Number($('score').textContent), 8);
  assert.match($('order-name').textContent, /파우치/);
  $('ship').emit('click');
  assert.equal(Number($('score').textContent), 8, 'cannot sell an absent item twice');
  $('drop').emit('click');
  advance(fps*2);
  assert.equal(Number($('score').textContent), 8, 'sold keyring no longer merges with the next drop');
  assert.deepEqual(JSON.parse(store.get(key)), [0,1]);
  $('collect').emit('click');
  assert.equal(s.results.length, 1);
  assert.equal(s.results[0].stars, 1);
  assert.equal(s.results[0].points, 8);
  assert.match(s.results[0].extra.textContent, /납품 1건/);
  assert.equal(s.frames.size, 0);
  $('collect').emit('click');
  assert.equal(s.results.length, 1);
  const replay = session(fps, store);
  replay.$('gallery-open').emit('click');
  assert.equal(replay.$('count').textContent, '발견한 굿즈 2 / 7');
  replay.$('resume').emit('click');
  replay.cleanup();
  assert.equal(replay.frames.size, 0);
  replay.$('drop').emit('click');
  assert.equal(replay.frames.size, 0);
  replay.document.emit('tour:stamps-reset');
  assert.equal(store.has(key), false);
}
{
  let counter = 0;
  const s = session(60, new Map([[key, '[null,12,1,"2",-1,1]']]), () => counter++ % 2 ? .85 : 0);
  s.$('gallery-open').emit('click');
  assert.equal(s.$('count').textContent, '발견한 굿즈 1 / 7');
  s.$('resume').emit('click');
  for (let i = 0; i < 3; i++) {
    s.$('drop').emit('click');
    s.advance(120);
  }
  assert.equal(Number(s.$('score').textContent), 6, 'keeping the keyring makes a pouch on drop three');
  assert.equal(s.$('ship').disabled, true);
  s.cleanup();
}
// Real controls and mixed tiers. Aim at one of three columns by the current product.
for (const target of [2,32,100]) {
  let seed = 41, drops = 0;
  const s = session(60, new Map(), () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  });
  while (Number(s.$('score').textContent) < target && drops < 60) {
    const label = s.$('drop').textContent.split(' 놓기')[0];
    const lane = ['배지', '아크릴 키링', '파우치'].indexOf(label);
    assert.ok(lane >= 0);
    const pointer = {button:0, pointerId:1, clientX:10 + [58,180,302][lane]};
    s.$('board').emit('pointerdown', pointer);
    s.$('board').emit('pointerup', pointer);
    s.advance(120);
    drops++;
    assert.equal(s.results.length, 0);
  }
  assert.ok(drops < 60, 'three stars within two minutes');
  s.$('collect').emit('click');
  assert.equal(s.results[0].stars, stars(target));
  console.log(target + '-point goal: ' + drops + ' mixed drops, ' + drops*2 + ' simulated seconds.');
}
{
  const base = piece(3, 180, height-34), upper = piece(1, 180, 25);
  const w = {score: 0, bodies: [base, upper]};
  advanceWorld(w, 600);
  assert.ok(Math.abs(upper.x-base.x) > 50, 'mixed tower rolls off a single round support');
  assert.equal(upper.y, height-upper.r);
  const lone = piece(1, 70, 20);
  advanceWorld({score: 0, bodies: [lone]}, 400);
  assert.equal(lone.x, 70, 'empty-floor aim stays exact');
}
{
  const lower = piece(1, 50, 410), higher = piece(1, 250, 235);
  lower.landed = higher.landed = true;
  const w = {score: 0, bodies: [lower, higher], deliveries: 0, turn: 1};
  assert.equal(stock(w), higher);
  assert.equal(deliver(w), higher);
  assert.deepEqual(w.bodies, [lower]);
  assert.equal(requested(w), 2);
  assert.equal(w.score, fee(1));
  assert.equal(deliver(w), null);
  const falling = piece(2, 100, 25);
  w.bodies.push(falling);
  assert.equal(stock(w), null);
}
{
  const store = new Map(), s = session(30, store, () => .99);
  for (let i = 0; i < 40 && !JSON.parse(store.get(key) || '[]').includes(6); i++) {
    s.$('drop').emit('click');
    s.advance(45);
  }
  assert.deepEqual(JSON.parse(store.get(key)), [0,1,2,3,4,5,6]);
  s.$('collect').emit('click');
  assert.match(s.results[0].extra.textContent, /송현 선배 인형/);
}
{
  const old = piece(1, 150, 410), incoming = piece(1, 150, 400);
  Object.assign(old, {crafted: true, turn: 2, depth: 3});
  incoming.turn = 8;
  const w = {score: 0, turn: 8, bodies: [old, incoming]};
  tick(w, (product, points) => {
    assert.equal(product.depth, 1, 'a later drop starts a fresh chain');
    assert.equal(points, 4);
  });
  assert.equal(w.score, 4);
}
{
  // A keyring physically separates two old badges until the player ships it.
  const bottom = piece(0, 180, 416), support = piece(1, 180, 383), top = piece(0, 180, 350);
  support.landed = true;
  Object.assign(top, {crafted: true, turn: 4, depth: 2});
  const w = {bodies: [bottom, support, top], turn: 4, score: 0, deliveries: 0};
  assert.equal(deliver(w), support);
  assert.equal(w.turn, 5);
  const merges = [];
  for (let i = 0; i < 100; i++) tick(w, (product, points) => merges.push([product.turn, product.depth, points]));
  assert.deepEqual(merges, [[5, 1, 2]], 'removing the support starts a fresh chain for old stock');
  assert.equal(w.score, 8);
}
{
  const s = session(60, new Map(), () => 0, 42);
  assert.equal(s.$('best').textContent, '내 최고 42점');
  assert.equal(s.$('best').hidden, false);
  s.cleanup();
}
for (const fps of [30,60,120]) {
  const s = session(fps,new Map(),undefined,null,true);
  const {$,advance} = s;
  function play(x) {
    const pt = {pointerId:1,button:0,clientX:x+10};
    $('board').emit('pointerdown',pt);
    $('board').emit('pointerup',pt);
    advance(fps*5);
  }
  assert.equal($('puzzle-mode')['aria-pressed'],'true');
  const scores = [34,68,136];
  for (const [i, [miss, win]] of [[282,102],[76,267],[110,216]].entries()) {
    play(miss);
    assert.equal($('drop').textContent,'다시 조준');
    assert.equal(Number($('score').textContent),scores[i-1] || 0);
    $('drop').emit('click');
    const history = s.cues.length;
    play(win);
    const landed = s.cues.slice(history);
    assert.deepEqual(landed.map(e=>e.slice(1)),[['merge',1],['merge',2],['merge',3],['clear']]);
    assert.ok(landed[1][0]-landed[0][0]>=275 && landed[2][0]-landed[1][0]>=275);
    assert.equal(Number($('score').textContent),scores[i]);
    assert.equal($('collect').disabled,false);
    $('free-mode').emit('click');
    assert.equal(Number($('score').textContent),0);
    $('puzzle-mode').emit('click');
    assert.equal(Number($('score').textContent),scores[i]);
    $('drop').emit('click');
  }
  assert.equal(s.results.length,1);
  assert.equal(s.results[0].points,136);
  assert.equal(s.results[0].stars,3);
}
{
  const s = session(60,new Map(),undefined,null,true);
  s.$('board').emit('keydown',{key:'Enter'});
  s.advance(240);
  s.$('collect').emit('click');
  assert.equal(s.results.length,1);
  assert.equal(s.results[0].points,34);
  assert.equal(s.results[0].stars,1);
}
{
  const r = puzzleRound(0);
  toss(r);
  while (!r.depth) puzzleStep(r,()=>{});
  const initialX = r.item.x;
  assert.ok(r.pause > .25);
  assert.equal(nudge(r,1),true);
  assert.equal(nudge(r,-1),false);
  while (r.pause > 0) puzzleStep(r,()=>{});
  assert.equal(r.item.x,initialX,'a tap during the merge pause changes velocity only');
  puzzleStep(r,()=>{});
  assert.ok(r.item.x > initialX);
}
for (const input of ['keyboard','touch']) {
  const s = session(60,new Map(),undefined,null,true);
  const {$,advance} = s;
  const board = $('board');
  board.emit('keydown',{key:'Enter'});
  advance(180);
  $('drop').emit('click');
  const position = {button:0,pointerId:1,clientX:240}; // 230 / 360 in board coordinates
  function launch() {
    board.emit('pointerdown',position);
    board.emit('pointerup',position);
  }
  launch();
  advance(300);
  assert.equal($('drop').textContent,'다시 조준');
  assert.equal(Number($('score').textContent),34);
  $('drop').emit('click');
  launch();
  advance(18);
  board.emit('keydown',{key:'ArrowLeft',repeat:true});
  assert.equal($('right').disabled,false);
  if (input === 'keyboard') board.emit('keydown',{key:'ArrowRight',repeat:false});
  else $('right').emit('click');
  assert.equal($('left').disabled,true);
  assert.equal($('drop').textContent,'밀기 사용함');
  board.emit('keydown',{key:'ArrowLeft',repeat:false});
  advance(200);
  assert.equal($('drop').textContent,'다음 진열대');
  assert.equal(Number($('score').textContent),68);
  s.cleanup();
}
console.log('Goods passed: all three puzzles, losses/retries, early banking, mode switching, chain depth and points, early keep/sell choice, delivery stock, physics, overflow, controls, stars, catalogue, suspension and cleanup.');
