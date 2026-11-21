// Run with node tour/tools/check_ai.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Node {
  constructor() {
    this.children = [];
    this.nodes = new Map();
    this.classList = { add() {}, remove() {} };
    this.listeners = {};
  }
  querySelector(selector) {
    if (!this.nodes.has(selector)) this.nodes.set(selector, new Node());
    return this.nodes.get(selector);
  }
  setAttribute(key, value) { this[key] = value; }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  addEventListener(event, fn) { this.listeners[event] = fn; }
  click() { if (!this.disabled) this.listeners.click(); }
  focus() {}
}

const context = {
  window: {},
  document: { createElement: () => new Node(), createTextNode: text => text },
  requestAnimationFrame: () => 1,
  cancelAnimationFrame() {}
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/game-ai.js'), 'utf8'), context);
const best = {
  '매점에 들른 학생': '쉬는 시간', '군산을 떠나는 여행객': '여행 가방', '다과 모임의 주최자': '따뜻한 차',
  '버스로 통학하는 학생': '창밖 풍경', '듣기 연습을 하는 학생': '낯선 발음', '댄스 동아리원': '안무 연습',
  '카페에 들른 직장인': '출근길', '주말 등산객': '산길에서', '독서 모임 회원': '책장을'
};
const campaigns = [];
for (let game = 0; game < 6; game++) {
  const body = new Node();
  const get = id => body.querySelector('.ai-' + id);
  let result;
  const cleanup = context.window.TOUR_GAMES.ai.start(body, {
    reducedMotion: true, announce() {}, done(value) { result = value; }
  });
  const guests = new Set();
  let product, previousAd;
  for (let round = 0; round < 3; round++) {
    const [, title, , tags] = get('product').children;
    if (!round) product = title.textContent;
    assert.equal(title.textContent, product);
    const guest = tags.children[0].textContent;
    guests.add(guest);
    const buttons = get('choices').children;
    const ad = buttons.find(button => button.textContent.includes(best[guest]));
    assert.ok(ad);
    if (game >= 3) {
      get('hint').click();
      get('hint').click();
      assert.equal(get('hint')['aria-pressed'], 'true');
      assert.equal(buttons.filter(b => b.children.length).length, 1);
      assert.equal(ad.children.length, 0);
    }
    ad.click();
    const [, comment, stars, comparison] = get('reaction').children;
    assert.ok(comment.textContent.includes(guest));
    assert.equal(stars['aria-label'], '이번 라운드 별 ' + (game < 3 ? 3 : 2) + '개');
    if (round) {
      assert.ok(comparison.textContent.includes(previousAd));
      assert.match(comparison.textContent, /1,200 → .*♥ (540|180)$/);
    }
    previousAd = ad.textContent.slice(3);
    get('next').click();
  }
  assert.equal(guests.size, 3);
  assert.equal(result.stars, game < 3 ? 3 : 2);
  assert.equal(result.hints, game < 3 ? 0 : 3);
  assert.equal(result.extra['aria-label'], '총 좋아요 3,600');
  assert.notEqual(product, campaigns.at(-1));
  campaigns.push(product);
  cleanup();
}
assert.equal(new Set(campaigns.slice(0, 3)).size, 3);
assert.equal(new Set(campaigns.slice(3)).size, 3);
console.log('AI campaign checks passed.');
