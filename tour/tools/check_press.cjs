// Run with: node tour/tools/check_press.cjs
// A small DOM fixture drives the actual game buttons without a browser dependency.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.style = {};
    this.className = '';
    this.classList = { toggle() {} };
    this.listeners = {};
  }
  append(...nodes) { this.children.push(...nodes); }
  set innerHTML(html) {
    this.children = [];
    const stack = [this];
    for (const tag of html.match(/<[^>]+>/g) || []) {
      if (tag.startsWith('</')) { stack.pop(); continue; }
      const node = new Element(tag.match(/^<(\w+)/)[1]);
      node.className = tag.match(/class="([^"]*)"/)?.[1] || '';
      node.hidden = tag.includes(' hidden');
      stack.at(-1).append(node);
      if (!['img', 'input'].includes(node.tag)) stack.push(node);
    }
  }
  descendants() {
    return this.children.flatMap(child => [child, ...child.descendants()]);
  }
  querySelector(selector) {
    let root = this;
    for (const part of selector.split(' ')) {
      root = root.descendants().find(node => part.startsWith('.') ?
        node.className.split(' ').includes(part.slice(1)) : node.tag === part);
    }
    return root;
  }
  cloneNode(deep) {
    const copy = new Element(this.tag);
    Object.assign(copy, { className: this.className, style: {...this.style}, src: this.src });
    if (deep) copy.children = this.children.map(child => child.cloneNode(true));
    return copy;
  }
  getContext() { return { fillRect() {} }; }
  toDataURL() { return 'data:image/png;base64,AA'; }
  focus() {}
  setAttribute(key, value) { this[key] = value; }
  addEventListener(name, handler, { signal }) {
    this.listeners[name] = () => { if (!signal.aborted) handler(); };
  }
  click() { this.listeners.click(); }
}

const frames = new Map();
let frameId = 0;
const context = {
  window: { TOUR_GAMES: {} },
  AbortController,
  document: {
    createElement: tag => new Element(tag),
    createTextNode: text => Object.assign(new Element('text'), { textContent: text })
  },
  performance: { now: () => 0 },
  cancelAnimationFrame: id => frames.delete(id),
  requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; }
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/game-press.js'), 'utf8'), context);
const game = context.window.TOUR_GAMES.press;

function snapshot(root) {
  return {
    background: root.querySelector('.press-back').src,
    pose: {...root.querySelector('.press-subject').style}
  };
}

for (const manual of [true, false]) {
  const firstScenePoses = [];
  for (const [steps, stars] of [[0, 1], [1, 2], [2, 3]]) {
    const body = new Element('main');
    const find = selector => body.querySelector(selector);
    let result;
    const cleanup = game.start(body, { reducedMotion: manual, done(value) { result = value; cleanup(); } });
    find('.press-start').click();
    const shots = [];
    for (let scene = 0; scene < 3; scene++) {
      assert.equal(find('.press-step').hidden, !manual);
      if (manual) {
        for (let i = 0; i < steps; i++) find('.press-step').click();
      } else {
        assert.equal(frames.size, 1);
        const [[id, tick]] = frames;
        frames.delete(id);
        tick(steps * 925);
      }
      if (stars === 3) assert.match(find('.press-status').textContent, /지금/);
      shots.push(snapshot(body));
      find('.press-shoot').click();
      assert.equal(frames.size, 0, 'the shutter freezes the scene');
      find('.press-next').click();
    }
    firstScenePoses.push(shots[0].pose.left);
    assert.equal(new Set(shots.map(shot => shot.background)).size, 3);
    const choices = find('.press-choices').children;
    assert.equal(choices.length, 3);
    const lead = steps;
    choices[lead].click();
    assert.equal(result.stars, stars);
    const printed = result.extra.children.filter(node => node.tag === 'figure').map(snapshot);
    assert.deepEqual(printed, [shots[lead], ...shots.filter((_, index) => index !== lead)],
      'all three shutter positions survive editing, with the chosen photograph first');
  }
  assert.equal(new Set(firstScenePoses).size, 3, 'different shutter times produce different pictures');
}

// Closing the dialog mid-scene cancels the next frame and detaches button listeners.
const body = new Element('main');
const stop = game.start(body, { reducedMotion: false, done: () => assert.fail('closed game published') });
const start = body.querySelector('.press-start');
start.click();
assert.equal(frames.size, 1);
stop();
assert.equal(frames.size, 0);
start.click();
assert.equal(frames.size, 0);
console.log('Press: six editions, all lead photos and star tiers, distinct shutter positions, cleanup passed.');
