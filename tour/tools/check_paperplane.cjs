'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require.resolve('../js/game-paperplane.js');
const { flight, chooseCourse, barrelRoll, step, crossings, score, stars, landingBonus, STEP } = require(path);
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
  assert(f.finished && seconds >= (route==='idle' ? 10 : 19) && seconds <= (route==='idle' ? 12 : 27));
  return f;
}
for (const [state, speed] of [[{}, 11.7], [{boost:1}, 16.9], [{stagger:1}, 7.15]]) {
  const f = Object.assign(flight(75), state);
  step(f,0);
  assert(Math.abs(f.distance / STEP - speed) < 1e-10);
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
function firstRibbon(x,when) {
  const f=flight(75); f.x=x;
  while (!f.ribbons[0].outcome) {
    if (when !== null && f.distance >= when) {
      assert(barrelRoll(f)); assert(!barrelRoll(f),'rolling cannot be repeated while charging'); when=null;
    }
    step(f,0);
  }
  return f;
}
const safe=firstRibbon(100,null), clipped=firstRibbon(180,8), burst=firstRibbon(180,27);
assert.equal(safe.ribbons[0].outcome,'clear'); assert.equal(safe.stagger,0);
assert.equal(clipped.ribbons[0].outcome,'clip'); assert(clipped.stagger>0);
assert.equal(burst.ribbons[0].outcome,'burst'); assert(burst.boost>0);
assert.equal(score(burst),15); assert.equal(burst.tricks,1);
assert(Math.abs(burst.energy-clipped.energy-10)<.01);
const beforeHit=clipped.distance, beforeBurst=burst.distance;
for(let i=0;i<60;i++) { step(clipped,-1); step(burst,-1); }
assert(clipped.x < 140,'steering still works immediately after clipping');
assert(burst.distance-beforeBurst>clipped.distance-beforeHit+3);
for (const index of variants) {
  const f=flight(100,index);
  while (!f.finished) {
    const ring=f.marks.find(m=>!m.outcome), ribbon=f.ribbons.find(r=>!r.outcome);
    let x=ring.kind ? ring.x : ring.starX;
    if (ribbon && ribbon.distance < ring.distance) {
      // Approach the final ribbon along the edge closest to the landing target.
      x=ring.kind ? ribbon.gap+(ribbon.gap<180 ? 65 : -65) : ribbon.gap<180 ? 255 : 105;
      if (ribbon.distance-f.distance < 4 && f.recharge === 0) barrelRoll(f);
    }
    step(f,(x-f.x)/22);
  }
  assert.equal(f.tricks,4); assert.equal(f.distance,288);
  assert.equal(f.landing,30); assert.equal(stars(score(f)),3);
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
  constructor() { super(); this.value='75'; this.dataset={}; this.hidden=false; this.textContent=''; this.captured = new Set(); }
  focus() {}
  hasPointerCapture(id) { return this.captured.has(id); }
  setPointerCapture(id) { this.captured.add(id); }
  releasePointerCapture(id) { this.captured.delete(id); }
  getBoundingClientRect() { return {left:20,width:180,height:200}; }
  getContext() { return {save(){},translate(){},scale(){},restore(){},fillRect(){},drawImage:(img,x)=>{ if (img.src.includes('/plane-')) this.planeX=x+24; if (img.src.includes('roll-strip')) (this.rollFrames??=new Set()).add(x); },strokeText(){},fillText(){}}; }
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
  let result; const cues=[];
  const close = window.TOUR_GAMES.paperplane.start({querySelector:$}, {bestScore,cue:id=>cues.push(id),done:r => {result=r;}, announce(){}});
  return {$,close,cues,result:()=>result};
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
for (const input of ['touch','space','early','reduced']) {
  window.matchMedia=()=>({matches:input==='reduced'});
  const play=session(), field=play.$('canvas'), button=play.$('.pp-roll');
  emit(play.$('.pp-launch'),'click'); advance(input==='early' ? .75 : 2.25);
  if(input!=='early') assert.match(play.$('.pp-cue').textContent,/지금/);
  if(input==='space') {
    emit(window,'keydown',{key:' ',code:'Space'});
    emit(window,'keydown',{key:' ',code:'Space',repeat:true});
  } else {
    point(button,'pointerdown',0); emit(button,'click',{detail:1});
  }
  advance(input==='early' ? 2.15 : .85);
  assert.deepEqual(play.cues,['roll',input==='early'?'bump':'ribbon']);
  if(input==='reduced') assert.equal(field.rollFrames,undefined);
  else assert.equal(field.rollFrames.size,4);
  assert.match(play.$('.pp-cue').textContent,input==='early' ? /날개 스침/ : /리본 돌파/);
  emit(play.$('.pp-pause'),'click'); advance(2); point(button,'pointerdown',0);
  play.close(); point(button,'pointerdown',0); assert.equal(play.cues.length,2);
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
const replay = session(182);
assert.match(replay.$('.pp-note').textContent,/내 최고 182점/);
assert.equal(replay.$('.pp-round').textContent,'1구간 · 정문');
emit(replay.$('.pp-launch'),'click'); advance(7.5,30);
assert.match(replay.$('.pp-guide p').textContent,/한 번 더/); advance(6,30);
assert.equal(replay.$('.pp-next').hidden,false);
assert.equal(replay.$('.pp-round').textContent,'2구간 · 교정 화단');
emit(replay.$('.pp-next'),'click');
assert.equal(replay.result().stars,1); assert.equal(replay.result().points,0);
assert.match(replay.result().extra.innerHTML,/중간 착지/);
const result=replay.result();
emit(replay.$('.pp-next'),'click'); assert.equal(replay.result(),result);
replay.close();
console.log('paperplane: routes, roll timing, ribbon gaps and collisions, keyboard/touch, reduced motion, scoring and lifecycle passed');
