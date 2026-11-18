// Exercise the registered game with a minimal in-memory DOM. Run with Node alone.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
  constructor(tag = 'main', className = '') {
    this.tag = tag;
    this.className = className;
    this.children = [];
    this.attributes = new Map();
    this.text = '';
  }
  get firstElementChild() { return this.children[0]; }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this.text = value; this.children = []; }
  set innerHTML(html) {
    this.textContent = '';
    const stack = [this];
    for (const token of html.match(/<[^>]+>|[^<]+/g) || []) {
      const parent = stack.at(-1);
      if (token.startsWith('</')) { stack.pop(); continue; }
      if (!token.startsWith('<')) { parent.text += token; continue; }
      const tag = token.match(/^<(\w+)/)[1];
      const child = new Element(tag, token.match(/class="([^"]+)"/)?.[1] || '');
      parent.append(child);
      if (tag !== 'img') stack.push(child);
    }
  }
  append(child) { this.children.push(child); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  focus() {}
  click() { if (!this.disabled) this.onclick(); }
  querySelectorAll(selector) {
    const visible = this.children.flatMap(child => [child, ...child.querySelectorAll('*')]);
    if (selector === '*') return visible;
    if (selector.startsWith('.')) return visible.filter(child => child.className.split(' ').includes(selector.slice(1)));
    return visible.filter(child => child.tag === selector.split(':')[0] && (!selector.endsWith(':enabled') || !child.disabled));
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0]; }
}

function checkRuns(game) {
  const body = new Element();
  const key = tile => ['span','b','strong'].map(selector => tile.querySelector(selector).textContent).join('/');
  for (const mistakes of [0,1,2,3]) {
    let result;
    game.start(body, { done: value => { result = value; } });
    body.querySelector('button').click();
    for (let round = 0; round < 3; round++) {
      const pays = [...body.querySelector('.rc-pay').querySelectorAll('button')];
      const slips = [...body.querySelector('.rc-slip').querySelectorAll('button')];
      assert(new Set(pays.map(key)).size === 4 && slips.length === 3, 'unique balanced ledger');
      for (const [number, slip] of slips.entries()) {
        const pay = pays.find(tile => key(tile) === key(slip));
        slip.click();
        if (!round && !number) {
          for (let i=0; i<mistakes; i++) pays.find(tile => tile !== pay).click();
        }
        pay.click();
        assert(pay.disabled && slip.disabled, 'matched pair locked');
      }
      const left = pays.filter(tile => !tile.disabled);
      assert(left.length === 1, 'one unverified payment');
      left[0].click();
      assert(body.querySelector('.rc-note').textContent.includes('누락 전표 확인'), 'missing slip reported');
      body.firstElementChild.children.at(-1).click();
    }
    assert(result.stars === (mistakes === 0 ? 3 : mistakes < 3 ? 2 : 1), 'star threshold');
  }
}
const context = { window: { TOUR_GAMES: {} }, document: { createElement: tag => new Element(tag) } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/game-reconcile.js'), 'utf8'), context);
checkRuns(context.window.TOUR_GAMES.reconcile);
console.log('Reconcile: 12 ledgers, retry, missing report, replay and all star thresholds passed.');
