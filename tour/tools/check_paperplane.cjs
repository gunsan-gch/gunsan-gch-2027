'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require.resolve('../js/game-paperplane.js');
const { flight, step, crossings, score, stars, landingBonus, STEP } = require(path);
function simulate(round, power, steer, hz = 60) {
  const f = flight(round, power);
  let budget = 0;
  while (!f.finished) {
    budget += 1/hz;
    while (budget + 1e-12 >= STEP) {
      const target = f.marks.find(m => !m.outcome);
      step(f, target && steer ? (target.x-f.x)/22 : 0);
      budget -= STEP;
    }
  }
  return f;
}
const idle = [0,1,2].map(round => simulate(round,100,false));
const skilled = [0,1,2].map(round => simulate(round,0,true));
const sum = group => group.reduce((s, f) => s+score(f), 0);
assert.equal(stars(sum(idle)),1);
assert.equal(stars(sum(skilled)),3);
for (const f of skilled) {
  assert.deepEqual([f.distance,f.rings,f.thermal,f.landing], [220,6,true,30]);
  assert(f.energy <= 4.01);
  assert(f.distance / 10 >= 18 && f.distance / 10 <= 25);
}
assert.equal(Math.round(simulate(0,0,false).distance),182);
assert.equal(Math.round(simulate(0,100,false).distance),210);
assert.deepEqual(simulate(2,72,true,30),simulate(2,72,true,120));
const swept = flight(0,100);
crossings(swept,20,30,50,140);
assert.equal(swept.rings,1);
crossings(swept,20,30,50,140);
assert.equal(swept.rings,1);
assert.deepEqual([0,15,15.1,39,39.1].map(landingBonus),[30,30,15,15,0]);
assert.deepEqual([0,149,150,239,240,336].map(stars),[1,1,2,2,3,3]);

// Drive the registered UI with a deterministic animation clock, including close/reopen.
class Surface extends EventTarget {
  constructor() { super(); this.value='75'; this.hidden=false; this.textContent=''; this.captured = new Set(); }
  focus() {}
  hasPointerCapture(id) { return this.captured.has(id); }
  setPointerCapture(id) { this.captured.add(id); }
  releasePointerCapture(id) { this.captured.delete(id); }
  getBoundingClientRect() { return {width:360,height:400}; }
  getContext() { return {fillRect(){},drawImage(){},strokeText(){},fillText(){}}; }
}
const window = new Surface(), document = new Surface();
window.TOUR_GAMES = {}; document.createElement = () => new Surface();
let seq=0, now=0;
const frames = new Map();
vm.runInNewContext(fs.readFileSync(path,'utf8'), {
  window,document,Image:Surface,AbortController,
  requestAnimationFrame(fn){ frames.set(++seq, fn); return seq; },
  cancelAnimationFrame(id){ frames.delete(id); }
});
function advance(seconds, hz=60) {
  for (let i=0;i<seconds*hz;i++) {
    now += 1000/hz;
    const tasks = [...frames.values()]; frames.clear();
    for (const fn of tasks) fn(now);
  }
}
const emit = (node,type,properties={}) => node.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),properties));
function session() {
  const nodes = new Map();
  const $ = s => { if (!nodes.has(s)) nodes.set(s,new Surface()); return nodes.get(s); };
  let result;
  const close = window.TOUR_GAMES.paperplane.start({querySelector:$}, {done:r => {result=r;}, announce(){}});
  return {$,close,result:()=>result};
}
const first = session();
emit(first.$('.pp-launch'),'click'); advance(1);
emit(first.$('canvas'),'pointerdown',{button:0,pointerId:5,clientX:180,clientY:200});
assert(first.$('canvas').hasPointerCapture(5));
emit(first.$('canvas'),'pointercancel',{pointerId:5}); assert(!first.$('canvas').hasPointerCapture(5));
document.hidden=true; emit(document,'visibilitychange');
const distance = first.$('.pp-distance').textContent;
advance(5); assert.equal(frames.size,0); assert.equal(first.$('.pp-distance').textContent,distance);
emit(first.$('.pp-resume'),'click'); assert.equal(frames.size,0);
document.hidden=false; emit(first.$('.pp-resume'),'click'); advance(1); assert.notEqual(first.$('.pp-distance').textContent,distance);
emit(window,'blur'); assert.equal(frames.size,0); emit(first.$('.pp-resume'),'click');
first.close(); assert.equal(frames.size,0); emit(first.$('.pp-resume'),'click'); assert.equal(frames.size,0);
const replay = session();
for (let round=0; round<3; round++) {
  assert.equal(replay.$('.pp-round').textContent,(round+1)+'차 / 3');
  emit(replay.$('.pp-launch'),'click'); advance(23,30);
  assert.equal(replay.$('.pp-next').hidden,false);
  emit(replay.$('.pp-next'),'click');
}
assert.equal(replay.result().stars,1);
assert.equal((replay.result().extra.innerHTML.match(/착륙/g)||[]).length,3);
replay.close();
console.log('paperplane: swept collisions, three courses, scoring, fixed timestep, and session lifecycle passed');
