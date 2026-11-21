// 실행: node tour/tools/check_press.cjs
// 간단한 DOM에서 실제 버튼을 누르고, 난수와 시계만 고정한다.
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
    this.classList = { toggle: (name, active) => {
      const names = new Set(this.className.split(' ').filter(Boolean));
      if (active) names.add(name);
      else names.delete(name);
      this.className = [...names].join(' ');
    } };
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
    Object.assign(copy, { className: this.className, style: {...this.style}, src: this.src,
      hidden: this.hidden, 'aria-label': this['aria-label'] });
    if (deep) copy.children = this.children.map(child => child.cloneNode(true));
    return copy;
  }
  getContext() { return { fillRect() {} }; }
  toDataURL() { return 'data:image/png;base64,AA'; }
  focus() { this.focused = true; }
  setAttribute(key, value) { this[key] = value; }
  addEventListener(name, handler, { signal }) {
    this.listeners[name] = () => { if (!signal.aborted) handler(); };
  }
  click() { this.listeners.click(); }
}

const frames = new Map(), timers = new Map();
let frameId = 0, now = 0, rolls = [];
const context = {
  window: { TOUR_GAMES: {} },
  AbortController,
  document: {
    createElement: tag => new Element(tag),
    createTextNode: text => Object.assign(new Element('text'), { textContent: text })
  },
  Math: Object.assign(Object.create(Math), { random: () => rolls.shift() ?? 0.5 }),
  performance: { now: () => now },
  setTimeout(callback) { timers.set(++frameId, callback); return frameId; },
  clearTimeout: id => timers.delete(id),
  cancelAnimationFrame: id => frames.delete(id),
  requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; }
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/game-press.js'), 'utf8'), context);
const game = context.window.TOUR_GAMES.press;

function openGame(manual, random = []) {
  assert.equal(frames.size + timers.size, 0);
  rolls = [...random];
  now = 0;
  const body = new Element('main');
  const find = selector => body.querySelector(selector);
  let result;
  const close = game.start(body, { reducedMotion: manual, done(value) { result = value; close(); } });
  find('.press-start').click();
  assert.equal(find('.press-step').hidden, !manual);
  return { body, find, close, result: () => result };
}

function runCallback(queue) {
  assert.equal(queue.size, 1);
  const [[id, callback]] = queue;
  queue.delete(id);
  callback(now);
}

function tick(ms) {
  now += ms;
  runCallback(frames);
}

function step(game, n) {
  for (let i = 0; i < n; i++) game.find('.press-step').click();
}

function grade(game, label, points) {
  game.find('.press-shoot').click();
  assert.equal(game.find('.press-status').textContent, label + ' · ' + points + '점');
  assert.equal(frames.size, 0);
  assert.equal(game.find('.press-next').hidden, false);
}

function chances(game, dots) {
  assert.equal(game.find('.press-chances').textContent, '기회 ' + dots);
}

function checkCue(game, ready) {
  assert.equal(game.find('.press-view').className.includes('press-ready'), ready);
  assert.match(game.find('.press-status').textContent, ready ? /◎ 지금!/ : /^(▷ 다가와요|↻ 지나갔어요)$/);
}

function snapshot(root) {
  const frame = root.querySelector('.press-frame');
  const subject = frame.querySelector('.press-subject');
  const friend = frame.querySelector('.press-friend');
  return [frame.querySelector('.press-back').src, frame.className, { ...subject.style }, subject.hidden,
    friend.hidden, friend.style.left];
}

// 양쪽 경계값은 포함하고, 경계를 조금만 벗어나도 한 등급 내려간다.
const labels = ['흔들린 사진', '현장 스케치', '생생한 포착', '결정적 순간'];
for (const sign of [-1, 1]) {
  for (const [delta, points] of [[0.04, 3], [0.0401, 2], [0.10, 2], [0.1001, 1], [0.20, 1], [0.2001, 0]]) {
    const game = openGame(false);
    tick(2400 * (0.5 + sign * delta));
    checkCue(game, points === 3);
    grade(game, labels[points], points);
    assert.equal(game.find('.press-frame').className.includes('press-blurred'), points === 0);
    game.close();
  }
}

// 두 모드 모두 세 장을 인화하고 실제 1면 선택과 별 경계(5·6·8·9점)를 확인한다.
for (const manual of [true, false]) {
  for (const [points, stars, lead] of [[[0, 2, 3], 1, 0], [[1, 2, 3], 2, 1], [[3, 2, 3], 2, 2], [[3, 3, 3], 3, 0]]) {
    const game = openGame(manual);
    const shots = [];
    for (const [scene, value] of points.entries()) {
      chances(game, '●●●');
      const clicks = [0, 4, 5, 6][value];
      if (manual) step(game, clicks);
      else tick([2400, 2000, 1600][scene] * clicks / 12);
      checkCue(game, scene === 0 && value === 3);
      grade(game, labels[value], value);
      shots.push(snapshot(game.body));
      game.find('.press-next').click();
    }
    assert.equal(new Set(shots.map(shot => shot[0])).size, 3);
    const choices = game.find('.press-choices').children;
    assert.deepEqual(choices.map(snapshot), shots);
    game.body.scrollTop = 300;
    choices[lead].click();
    const result = game.result();
    assert.equal(result.stars, stars);
    assert.equal(result.hints, 0);
    assert.equal(result.extra.focused, true);
    assert.equal(game.body.scrollTop, 0);
    const figures = result.extra.children.filter(node => node.tag === 'figure');
    assert.deepEqual(figures.map(snapshot), [shots[lead], ...shots.filter((_, i) => i !== lead)]);
  }
}

// 새 기회에서 속도와 피크를 다시 뽑는다. 첫 통과는 0.8배, 두 번째는 약 1.2배 시간이다.
{
  const game = openGame(false, [0, 0, 0.5, 0.5, 0.999, 0.999, 0.5, 0.5]);
  tick(1920 * 0.36);
  checkCue(game, true);
  const targetX = game.find('.press-subject').style.left;
  tick(1920 - now);
  chances(game, '●●○');
  tick(2400 * (0.8 + 0.999 * 0.4) * (0.36 + 0.999 * 0.28));
  assert.ok(Math.abs(parseFloat(game.find('.press-subject').style.left) - parseFloat(targetX)) < 1e-8);
  checkCue(game, false);
  grade(game, '결정적 순간', 3);
  game.close();
}

// 첫 컷을 포함해 기회마다 12컷. 바뀐 피크 바로 양옆은 2점이다.
for (const [clicks, points] of [[7, 2], [8, 3], [9, 2]]) {
  const game = openGame(true, [0.5, 0, 0.5, 0.5, 0.5, 0.999, 0.5, 0.5]);
  step(game, 11);
  chances(game, '●●●');
  assert.equal(game.find('.press-count').textContent, '12 / 12컷');
  step(game, 1);
  chances(game, '●●○');
  assert.equal(game.find('.press-count').textContent, '1 / 12컷');
  step(game, clicks);
  checkCue(game, false);
  grade(game, labels[points], points);
  game.close();
}

// 세 기회를 흘려보내면 빈 현장을 기록하고, 다음 장면이나 편집 화면으로 자동 이동한다.
for (const manual of [false, true]) {
  const game = openGame(manual);
  for (const duration of [2400, 2000, 1600]) {
    for (const dots of ['●●○', '●○○', '○○○']) {
      if (manual) step(game, 12);
      else tick(duration);
      chances(game, dots);
    }
    assert.equal(game.find('.press-status').textContent, '놓친 사진 · 0점');
    assert.equal(game.find('.press-subject').hidden, true);
    assert.equal(frames.size, 0);
    runCallback(timers);
  }
  const choices = game.find('.press-choices').children;
  assert.equal(choices.length, 3);
  choices[2].click();
  assert.equal(game.result().stars, 1);
  assert.match(game.result().extra.querySelector('small').textContent, /놓친 사진/);
}

// 방해꾼의 등장 확률 경계, 화면 밖 판정, 신문에 찍힌 얼굴과 전용 캡션.
for (const [chance, visible] of [[0.1499, true], [0.15, false]]) {
  const game = openGame(true, [0.5, 0.5, 0.5, chance, 0.5]);
  assert.equal(game.find('.press-friend').hidden, true);
  step(game, 6);
  assert.equal(game.find('.press-friend').hidden, !visible);
  grade(game, visible ? '얼굴 대문짝 특종' : '결정적 순간', visible ? 1 : 3);
  for (let scene = 1; scene < 3; scene++) {
    game.find('.press-next').click();
    step(game, 5);
    grade(game, labels[2], 2);
  }
  game.find('.press-next').click();
  game.find('.press-choices button').click();
  assert.equal(game.result().stars, visible ? 1 : 2);
  const front = game.result().extra.querySelector('figure');
  assert.equal(front.querySelector('.press-friend').hidden, !visible);
  assert.equal(front.querySelector('strong').textContent.includes('콧구멍'), visible);
}

// 셔틀콕의 급강하, 오븐 앞 정지, 음표의 방향 전환을 실제 소품 좌표로 확인한다.
{
  const game = openGame(true, [0.5, 0.5, 0, 0.5]);
  const pos = key => parseFloat(game.find('.press-subject').style[key]);
  step(game, 6);
  const netHeight = pos('top');
  step(game, 2);
  assert.ok(pos('top') > netHeight + 12 && pos('left') < 50);
  game.find('.press-shoot').click();
  game.find('.press-next').click();
  step(game, 2);
  const oven = snapshot(game.body);
  step(game, 1);
  assert.deepEqual(snapshot(game.body), oven);
  step(game, 2);
  assert.ok(pos('left') < parseFloat(oven[2].left));
  game.find('.press-shoot').click();
  game.find('.press-next').click();
  step(game, 2);
  const left = pos('left');
  step(game, 2);
  assert.ok(pos('left') < left);
  game.close();
}

// 종료하면 예약된 프레임·자동 이동과 버튼 리스너를 정리한다.
for (const expire of [false, true]) {
  const game = openGame(false);
  if (expire) tick(7200);
  assert.equal(expire ? timers.size : frames.size, 1);
  game.close();
  game.find('.press-start').click();
  assert.equal(frames.size + timers.size, 0);
}
console.log('취재반 통과 · 판정 경계, 속도·궤적, 3회 제한, 12컷, 특종, 편집·별·종료');
