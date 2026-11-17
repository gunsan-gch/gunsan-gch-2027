/* Real rule/physics/integration regressions. No browser progress is written. */
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), ctx = { window: {} }; vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx);
load('js/gym-engine.js'); const R = ctx.window.TourGymRules;
let checks = 0; const check = (value, why) => { assert.ok(value, why); checks++; };
const seeded = seed => { let n = seed; return () => ((n = (Math.imul(n, 1664525) + 1013904223) >>> 0) / 2 ** 32); };
const settle = (e, dt = 1 / 60) => { for (let i = 0; i < 2000 && e.state.phase === 'rolling'; i++) e.advance(dt); check(e.state.phase !== 'rolling', 'curling always settles'); };
for (const [d, pts] of [[0,10],[8,10],[8.01,7],[20,7],[20.01,4],[32,4],[32.01,2],[45,2],[45.01,0]]) check(R.curlingPoints(160+d,64) === pts, 'curling ring matches artwork '+d);
for (const [d, pts] of [[0,10],[8,10],[8.1,9],[27,9],[27.1,7],[50,7],[50.1,5],[72,5],[72.1,3],[96,3],[97,0]]) check(R.targetPoints(d) === pts, 'target ring boundary '+d);
for (let seed = 1; seed <= 100; seed++) {
  const e = R.curling({ random: seeded(seed) }), random = seeded(seed + 400);
  for (let n = 0; n < 3; n++) {
    check(e.aim(-28 + 56 * random(), 20 + 80 * random()), 'set shot while aiming');
    check(e.release() && !e.release(), 'only one stone per release');
    check(!e.aim(0,60), 'cannot change a moving shot'); settle(e);
    check(e.state.stones.every(s => [s.x,s.y,s.vx,s.vy].every(Number.isFinite) && s.x >= 42 && s.x <= 278 && s.y >= 20 && s.y <= 224), 'stones remain finite and inside lane');
  }
  check(e.state.phase === 'finished' && e.state.throws === 3 && !e.release(), 'three throws then terminal');
  check(e.state.score >= 0 && e.state.score <= 30, 'only own stones contribute score');
}
const endpoints = [];
for (const fps of [30,60,120]) { const e = R.curling({ practice:true }); e.aim(0,63); e.release(); settle(e,1/fps); endpoints.push(e.state.stones[0].y); check(e.state.score === 10 && R.stars('curling',e.state) === 0,'practice center throw without reward'); }
check(Math.max(...endpoints)-Math.min(...endpoints)<.02,'curling physics is frame-rate independent');
let e=R.curling({random:()=>.5}); const original=e.state.stones.map(s=>({x:s.x,y:s.y})); e.aim(-5,65); e.release();settle(e);
check(e.state.stones.slice(0,2).some((s,i)=>Math.hypot(s.x-original[i].x,s.y-original[i].y)>2),'actual stone collision transfers momentum');
for (const kind of ['curling','target','badminton']) {
  e=R[kind]({random:()=>.2}); if(kind==='curling')e.release();e.advance(.05);check(e.pause(),'pause '+kind);
  const snapshot=JSON.stringify(e.state); for(let k=0;k<200;k++)e.advance(.1);check(JSON.stringify(e.state)===snapshot,'pause freezes state '+kind);
  check(kind==='curling'?!e.release():kind==='target'?!e.shoot():!e.hit(),'pause blocks action '+kind);check(e.resume()&&!e.resume(),'resume once '+kind);
}
e=R.target({random:()=>0});
for(let i=0;i<5;i++){check(e.shoot()&&!e.shoot(),'one target shot per cooldown');for(let n=0;n<8;n++)e.advance(.1);}
check(e.state.phase==='finished'&&e.state.shots.length===5&&e.state.score===54&&e.state.bestCombo===5,'five centers, four bonus points, maximum54');
check(!e.shoot()&&R.stars('target',e.state)===3,'target terminal and reward');
e=R.target({practice:true,random:()=>0});for(let i=0;i<3;i++){e.shoot();for(let n=0;n<8;n++)e.advance(.1);}check(e.state.phase==='finished'&&R.stars('target',e.state)===0,'target practice never rewards');
for(let seed=1;seed<=100;seed++){
  e=R.badminton({random:seeded(seed)});
  for(let frame=0;frame<30000&&e.state.phase!=='finished';frame++){
    e.moveTo(e.state.aimX);e.advance(1/120);
    if(e.state.phase==='incoming'&&e.state.flight/e.state.duration>=.96)e.hit();
  }
  check(e.state.phase==='finished'&&e.state.mine===5,'timely reachable shots win at five, seed '+seed);
  check(e.state.theirs===0&&e.state.smashes>=5&&R.stars('badminton',e.state)===3,'accurate play rewarded');
  check(e.state.player>=48&&e.state.player<=272&&!e.hit(),'court bounds and terminal hit');
}
e=R.badminton({random:()=>.5});for(let frame=0;frame<15000&&e.state.phase!=='finished';frame++)e.advance(1/120);
check(e.state.phase==='finished'&&e.state.theirs===5&&e.state.mine===0&&R.stars('badminton',e.state)===1,'missed shuttles end a real match without deadlock');
e=R.badminton({practice:true,random:()=>.5});for(let frame=0;frame<1500;frame++)e.advance(1/120);check(e.state.theirs===0&&e.state.phase!=='finished','practice misses are recoverable');
for(let frame=0;frame<2000&&e.state.phase!=='finished';frame++){e.moveTo(e.state.aimX);e.advance(1/120);if(e.state.phase==='incoming'&&e.state.flight/e.state.duration>=.96)e.hit();}
check(e.state.returns===3&&R.stars('badminton',e.state)===0,'three-return practice without rewards');
for(const [kind,key,thresholds] of [['curling','score',[[0,1],[9,1],[10,2],[19,2],[20,3],[30,3]]],['target','score',[[0,1],[27,1],[28,2],[43,2],[44,3],[54,3]]],['badminton','mine',[[0,1],[2,1],[3,2],[4,2],[5,3]]]])for(const [v,stars]of thresholds)check(R.stars(kind,{phase:'finished',[key]:v,bestRally:0})===stars,'reward threshold '+kind+v);
check(R.stars('badminton',{phase:'finished',mine:1,bestRally:6})===2,'rally effort can earn second star');
load('js/tour-data.js');load('js/star-progress.js');
const scene=ctx.window.TOUR_SCENES['3'],gym=scene.rooms.find(r=>r.name==='체육관');
check(gym.game==='gym'&&gym.games.join(',')==='curling,target,badminton','one gym hub, three sport entries');
check(JSON.stringify(gym.anchor)==='[16.5,25]'&&JSON.stringify(gym.rect)==='[2,4,14,67]','school map geometry unchanged');
const roomEntries=Object.values(ctx.window.TOUR_SCENES).flatMap(s=>s.rooms).flatMap(r=>(r.games||(r.game?[r.game]:[])).map(id=>({id,maxStars:3})));
check(roomEntries.length===14&&new Set(roomEntries.map(e=>e.id)).size===14,'14 unique reward-bearing games');
const oldStamps=Object.fromEntries(roomEntries.filter(e=>!gym.games.includes(e.id)).map(e=>[e.id,{stars:3}]));
const upgraded=ctx.window.TourStarProgress.summarize(oldStamps,roomEntries);
check(upgraded.stars===33&&upgraded.maxStars===42&&upgraded.count===11,'existing 33 stars preserved, new sports start empty');
// Exercise the actual games.js progress mapper, not a duplicate implementation.
ctx.document={readyState:'loading',addEventListener(){},querySelector(){return null;},getElementById(id){return id==='game'?{querySelector(){return {addEventListener(){}};},addEventListener(){}}:null;}};
ctx.localStorage={getItem:()=>JSON.stringify(oldStamps)};ctx.matchMedia=()=>({matches:false});ctx.window.TOUR_GAMES=Object.fromEntries([...roomEntries.map(e=>[e.id,{maxStars:3}]),['gym',{isHub:true}]]);
load('js/games.js');const actual=ctx.window.tourGame.progress();check(actual.games.length===14&&actual.stars===33&&actual.maxStars===42,'real game framework counts sports and excludes hub');
check(ctx.window.TourStarProgress.TITLE_AT===27,'existing wardrobe title unchanged');
const assets=Object.values(JSON.parse(fs.readFileSync(path.join(root,'img/ASSET-SOURCES.json'),'utf8')).sources).filter(a=>a.generator==='tools/make_gym_game_art.mjs');
check(assets.length===16,'16 original documented assets');for(const a of assets)check(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'img',a.output))).digest('hex')===a.sha256,'asset fingerprint '+a.output);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');check(html.indexOf('gym-engine.js')<html.indexOf('game-gym.js'),'rules loaded before UI');
console.log(JSON.stringify({checks,curlingSeeds:100,badmintonSeeds:100,physicsFps:[30,60,120],games:actual.games.length,maxStars:actual.maxStars,assets:assets.length,oldProgress:'preserved',practice:'no rewards'}));
