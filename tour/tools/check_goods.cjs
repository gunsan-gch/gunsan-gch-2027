// Run with node tour/tools/check_goods.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {piece, tick, width, height, step, grace, line, stars} = require('../js/game-goods.js');
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
  assert.equal(world.score, 8);
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
      assert.ok(this.innerHTML.includes('class="' + selector.slice(1) + '"'));
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
  getContext() { return new Proxy({}, {get: () => () => {}}); }
  getBoundingClientRect() { return {left: 10, width: 360}; }
  setPointerCapture(id) { this.pointer = id; }
  focus() { this.focused = true; }
}
function session(fps, store = new Map(), random = () => 0) {
  const body = new Element(), document = new Element(), window = new Element();
  window.TOUR_GAMES = {};
  document.createElement = () => new Element();
  let id = 0, time = 0;
  const frames = new Map(), results = [];
  const math = Object.create(Math);
  math.random = random;
  vm.runInNewContext(source, {
    window, document, Image: class {}, AbortController, Math: math,
    localStorage: {getItem: key => store.get(key), setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key)},
    requestAnimationFrame(callback) { frames.set(++id, callback); return id; },
    cancelAnimationFrame(handle) { frames.delete(handle); }
  });
  const game = window.TOUR_GAMES.goods;
  assert.equal(game.maxStars, 3);
  let cleanup = game.start(body, {done(result) { results.push(result); cleanup(); }});
  function advance(count) {
    for (let i = 0; i < count; i++) {
      time += 1000 / fps;
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(f => f(time));
    }
  }
  const $ = name => body.querySelector('.goods-' + name);
  return {$, advance, cleanup, results, frames, document, window};
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
  const earned = [];
  advance(fps*2);
  for (let count=2; count<=32; count++) {
    assert.equal($('drop').disabled, false);
    earned.push(Number($('score').textContent));
    if (count < 32) { $('drop').emit('click'); advance(fps*2); }
  }
  assert.equal(earned[0], 2);
  assert.equal(earned[14], 64);
  assert.equal(earned[30], 160);
  assert.deepEqual(JSON.parse(store.get(key)), [0,1,2,3,4,5]);
  $('collect').emit('click');
  assert.equal(s.results.length, 1);
  assert.equal(s.results[0].stars, 3);
  assert.match(s.results[0].extra.textContent, /아름 선배 인형/);
  assert.equal(s.frames.size, 0);
  $('collect').emit('click');
  assert.equal(s.results.length, 1);
  const replay = session(fps, store);
  replay.$('gallery-open').emit('click');
  assert.equal(replay.$('count').textContent, '발견한 굿즈 6 / 7');
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
  for (let i=0; i<32 && !s.results.length; i++) {
    s.$('drop').emit('click');
    s.advance(120);
  }
  assert.equal(s.results.length, 1);
  assert.match(s.results[0].extra.textContent, /상자 마감/);
  assert.equal(s.frames.size, 0);
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
  const store = new Map();
  const s = session(30, store);
  for (let i = 0; i < 64; i++) {
    s.$('drop').emit('click');
    s.advance(60);
  }
  assert.deepEqual(JSON.parse(store.get(key)), [0,1,2,3,4,5,6]);
  s.$('collect').emit('click');
  assert.match(s.results[0].extra.textContent, /송현 선배 인형/);
}
console.log('Goods passed: merge mass, final tier, real overflow/grace, 30/60/120 FPS, controls, stars, catalogue recovery, persistence, suspension and replay cleanup.');
