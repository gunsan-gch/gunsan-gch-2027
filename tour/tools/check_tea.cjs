// Run with node tour/tools/check_tea.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
  constructor() {
    this.nodes = new Map();
    this.events = new Map();
    this.dataset = {};
  }
  querySelector(name) {
    if (!this.nodes.has(name)) {
      assert.ok([...this.innerHTML.matchAll(/class="([^"]*)"/g)].some(match => match[1].split(/\s+/).includes(name.slice(1))), 'missing markup for ' + name);
      this.nodes.set(name, new Element());
    }
    return this.nodes.get(name);
  }
  addEventListener(type, callback, options) { this.events.set(type, { callback, signal:options.signal }); }
  emit(type, detail = {}) {
    const event = this.events.get(type);
    if (event && !event.signal.aborted) event.callback({preventDefault(){}, ...detail});
  }
  setAttribute(key, value) { this[key] = value; }
  setPointerCapture(id) { this.pointer = id; }
  focus() {}
}
const source = fs.readFileSync(path.join(__dirname, '../js/game-tea.js'), 'utf8');
function session() {
  const window = new Element(), document = new Element(), body = new Element();
  const queue = new Map();
  let time = 0, id = 0, result;
  window.TOUR_GAMES = {};
  document.createElement = () => new Element();
  vm.runInNewContext(source, {window, document, AbortController, performance:{now:() => time},
    requestAnimationFrame(fn) { queue.set(++id, fn); return id; }, cancelAnimationFrame(id) { queue.delete(id); }});
  window.TOUR_GAMES.tea.randomTargets = false;   // 2026-11-26: 판마다 바뀌는 목표량을 검사에서는 원래 값으로 고정
  const cleanup = window.TOUR_GAMES.tea.start(body, { done(data) {assert.equal(result, undefined); result = data; cleanup();} });
  function advance(ms) {
    time += ms;
    const callbacks = [...queue.values()];
    queue.clear();
    callbacks.forEach(fn => fn(time));
  }
  const $ = name => body.querySelector('.tea-' + name);
  const volume = () => parseInt($('amount').textContent);
  function pourSmall() { $('small').emit('click'); advance(435); }
  return { $, volume, advance, pourSmall, cleanup, queue, window, get result() {return result;} };
}
for (const wins of [0,1,2,3]) {
  const s = session();
  for (const [round, exact] of [6,8,8].entries()) {
    s.advance(30000);
    assert.equal(s.volume(),0);
    assert.equal(s.$('serve').disabled,true);
    for (let i=0; i < (round < wins ? exact : 1); i++) s.pourSmall();
    s.$('serve').emit('click');
  }
  assert.equal(s.result.stars,Math.max(1,wins));
  assert.equal(s.result.extra.innerHTML.split('목표 달성').length-1,wins);
  assert.equal(s.queue.size,0);
}
{
  const s = session(), hold = s.$('hold');
  const pointer = {button:0,isPrimary:true,pointerId:9};
  hold.emit('pointerdown',pointer); s.advance(1000);
  assert.equal(s.volume(),17);
  hold.emit('pointerup',{pointerId:8}); s.advance(1000);
  assert.equal(s.volume(),34);
  hold.emit('pointercancel',pointer); s.advance(100);
  assert.equal(s.volume(),34);
  s.$('serve').emit('click'); assert.equal(s.$('round').textContent,'1 / 3잔');
  s.advance(45); assert.equal(s.volume(),35);
  s.advance(290); assert.equal(s.volume(),38);
  hold.emit('keydown',{code:'Space'}); hold.emit('keydown',{code:'Space',repeat:true});
  assert.equal(s.queue.size,1); s.advance(350);
  hold.emit('keyup',{code:'Space'}); s.advance(435);
  assert.equal(s.volume(),48);
  assert.match(s.$('feedback').textContent,/두 점선 사이/);
  assert.equal(s.$('liquid').y,24-16*48/80);
  s.$('serve').emit('click'); assert.equal(s.volume(),0);
  hold.emit('pointerdown',pointer); s.advance(10000);
  assert.equal(s.volume(),110); s.advance(435); assert.equal(s.volume(),110);
  s.$('serve').emit('click'); hold.emit('pointerdown',pointer); s.advance(1000);
  s.window.emit('blur'); s.cleanup(); s.advance(1000);
  assert.equal(s.queue.size,0); s.$('small').emit('click'); assert.equal(s.queue.size,0);
}
console.log('Tea: three rounds, 1–3 stars, accessible pours, delayed drops, cancel, overflow and cleanup passed.');
