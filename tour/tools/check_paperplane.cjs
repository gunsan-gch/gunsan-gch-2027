'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require.resolve('../js/game-paperplane.js');
const { flight, chooseCourse, step, crossings, score, stars, landingBonus, STEP } = require(path);
function simulate(route, power=75, hz=60, index=0) {
  const f = flight(power,index);
  let budget=0, seconds=0, ticks=0, steer=0;
  while (!f.finished && seconds < 40) {
    budget += 1/hz; seconds += 1/hz;
    while (budget+1e-12 >= STEP) {
      const m = f.marks.find(m => !m.outcome);
      const target = m && (m.kind || route==='wide' ? m.x : m.starX);
      const recover = route === 'recover' && f.distance < 78;
      // Sample real button states at 10 Hz, with the same inertia as mobile and keyboard.
      if (ticks++ % 12 === 0) {
        steer = recover || route==='idle' || Math.abs(target-f.x)<10 ? 0 : Math.sign(target-f.x);
      }
      step(f,steer);
      budget -= STEP;
    }
  }
  assert(f.finished && seconds >= (route==='idle' ? 13 : 25) && seconds <= (route==='idle' ? 15 : 35));
  return f;
}
const variants=[0,1,2];
assert.equal(new Set(variants.map(i=>flight(75,i).marks.at(-1).x)).size,3);
let previous=chooseCourse();
for (let n=0;n<20;n++) {
  const next=chooseCourse(); assert.notEqual(next,previous); previous=next;
}
for (const i of variants) {
  assert.deepEqual(flight(75,i).marks.slice(0,2),flight(75).marks.slice(0,2));
  const idle=simulate('idle',100,60,i), wide=simulate('wide',0,60,i), precision=simulate('star',0,60,i);
  assert.equal(idle.rings,0); assert(idle.distance < 122); assert.equal(stars(score(idle)),1);
  assert.equal(idle.energy,0,'an early landing leaves 0m on the glide meter');
  const recovered=simulate('recover',0,60,i);
  assert.equal(recovered.distance,288); assert.equal(recovered.rings,6);
  for (const run of [wide,precision]) {
    assert.equal(run.rings,9); assert.equal(run.best,9); assert.equal(run.distance,288);
    assert.equal(run.landing,30);
  }
  assert.equal(stars(score(wide)),2); assert.equal(stars(score(precision)),3);
  assert.deepEqual(simulate('star',72,30,i),simulate('star',72,120,i));
}
const swept=flight(0);
function cross(i,offset) {
  const m=swept.marks[i],x=m.x+offset;
  crossings(swept,m.distance-1,m.distance+1,x-10,x+10);
}
cross(0,35); cross(0,0); cross(1,0);
assert.equal(swept.rings,2); assert.equal(swept.points,21); assert(swept.boost>0);
cross(2,36); assert.equal(swept.chain,0); assert.equal(swept.boost,0);
cross(3,0); assert.equal(swept.chain,1); assert.equal(swept.best,2);
assert.deepEqual([0,18,18.1,44,44.1].map(landingBonus),[30,30,15,15,0]);
assert.deepEqual([0,59,60,154,155].map(stars),[1,1,2,2,3]);
// Drive the registered UI with a deterministic animation clock, including close/reopen.
class Surface extends EventTarget {
  constructor() { super(); this.value='75'; this.hidden=false; this.textContent=''; this.captured = new Set(); }
  focus() {}
  hasPointerCapture(id) { return this.captured.has(id); }
  setPointerCapture(id) { this.captured.add(id); }
  releasePointerCapture(id) { this.captured.delete(id); }
  getBoundingClientRect() { return {left:20,width:180,height:200}; }
  getContext() { return {fillRect(){},drawImage:(img,x)=>{ if (img.src.includes('/plane-')) this.planeX=x+24; },strokeText(){},fillText(){}}; }
}
const window = new Surface(), document = new Surface();
window.TOUR_GAMES = {}; document.createElement = () => new Surface();
let seq=0, now=0;
const frames = new Map();
vm.runInNewContext(fs.readFileSync(path,'utf8'), {
  window,document,Image:class extends Surface {naturalWidth=64;},AbortController,
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
function session(bestScore) {
  const nodes = new Map();
  const $ = s => { if (!nodes.has(s)) nodes.set(s,new Surface()); return nodes.get(s); };
  let result;
  const close = window.TOUR_GAMES.paperplane.start({querySelector:$}, {bestScore,done:r => {result=r;}, announce(){}});
  return {$,close,result:()=>result};
}
const controls=session();
const field=controls.$('canvas');
const point=(node,type,x)=>emit(node,type,{button:0,pointerId:8,clientX:x,clientY:80});
emit(controls.$('.pp-launch'),'click'); advance(.1);
point(field,'pointerdown',143); point(field,'pointerup',143);
advance(.1); assert(field.planeX>180 && field.planeX<200);
advance(2); assert(Math.abs(field.planeX-246)<=2); assert.equal(controls.$('.pp-rings').textContent,'18점');
point(field,'pointerdown',120); point(field,'pointermove',90); point(field,'pointerup',90);
advance(1); assert(Math.abs(field.planeX-186)<=3);
point(field,'pointerdown',165); point(field,'pointerup',165);
emit(window,'keydown',{key:'ArrowLeft'}); advance(.5); emit(window,'keyup',{key:'ArrowLeft'});
assert(field.planeX<140);
point(field,'pointerdown',145); point(field,'pointerup',145);
point(controls.$('.pp-left'),'pointerdown',0); advance(.3); point(controls.$('.pp-left'),'pointerup',0);
assert(field.planeX<95);
point(field,'pointerdown',40); point(field,'pointermove',150); point(field,'pointercancel',150);
advance(1); assert(field.planeX<95);
point(field,'pointerdown',160); point(field,'pointerup',160);
emit(controls.$('.pp-pause'),'click'); emit(controls.$('.pp-resume'),'click');
advance(1); assert(field.planeX<95); controls.close();
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
const replay = session(182);
assert.match(replay.$('.pp-note').textContent,/내 최고 182점/);
assert.equal(replay.$('.pp-round').textContent,'1구간 · 정문');
emit(replay.$('.pp-launch'),'click'); advance(9,30);
assert.match(replay.$('.pp-guide p').textContent,/한 번 더/); advance(6,30);
assert.equal(replay.$('.pp-next').hidden,false);
assert.equal(replay.$('.pp-round').textContent,'2구간 · 교정 화단');
emit(replay.$('.pp-next'),'click');
assert.equal(replay.result().stars,1); assert.equal(replay.result().points,0);
assert.match(replay.result().extra.innerHTML,/중간 착지/);
const result=replay.result();
emit(replay.$('.pp-next'),'click'); assert.equal(replay.result(),result);
replay.close();
console.log('paperplane: routes, combo, distance, landing, timing and session lifecycle passed');
