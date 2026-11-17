/* Pure gameplay and integration checks. Does not write game progress. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/stairs-engine.js'),'utf8'),ctx);
const R=ctx.window.TourStairsRules;let checks=0;
function check(v,msg){assert.ok(v,msg);checks++;}
for(let seed=1;seed<=1000;seed++){
 let n=seed;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/2**32;};
 const e=R.create({random}),s=e.state;e.begin();
 check(s.path.length===81&&s.path.every(x=>Math.abs(x)<=3),'path fits the visible columns');
 while(s.steps<80){const d=s.path[s.steps+1]-s.path[s.steps];check(Math.abs(d)===1,'adjacent stair');e.advance(.2);check(e.step(d!==s.facing),'correct action advances');}
 check(s.phase==='finished'&&s.reason==='goal','complete exactly at goal');
 check(!e.step()&&s.steps===80,'terminal input ignored');
}
let e=R.create();check(!e.step(),'ready cannot climb');e.begin();check(!e.step(true)&&e.state.reason==='direction','wrong turn ends run');
e=R.create();e.begin();e.advance(5.9);check(e.state.phase==='running','time boundary before expiry');e.pause();e.advance(90);check(e.state.remaining>.09&&!e.step(),'pause freezes time and input');e.resume();e.advance(.11);check(e.state.reason==='time','resume expires correctly');
e=R.create();e.begin();e.advance(1);e.step(false);check(e.state.remaining===5.5,'correct step replenishes time');
e=R.create({practice:true});e.begin();e.advance(999);check(e.state.remaining===6,'practice has no timer');check(!e.step(true)&&e.state.phase==='running'&&e.state.facing===1,'practice wrong turn is recoverable');
while(e.state.steps<6){const s=e.state;e.step(Math.sign(s.path[s.steps+1]-s.path[s.steps])!==s.facing);}check(e.state.reason==='goal','practice completes without game rewards');
for(const [steps,stars] of [[0,1],[39,1],[40,2],[79,2],[80,3]])check(R.stars(steps)===stars,'star threshold '+steps);
for(const [steps,floor] of [[0,1],[19,1],[20,2],[40,3],[60,4],[80,5]])check(R.floor(steps)===floor,'floor threshold '+steps);
vm.runInContext(fs.readFileSync(path.join(root,'js/tour-data.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/star-progress.js'),'utf8'),ctx);
const rooms=Object.values(ctx.window.TOUR_SCENES).flatMap(s=>s.rooms).filter(r=>r.game);
check(rooms.length>=10&&rooms.filter(r=>r.game==='stairs').length===1,'one dream stairs room among all games');
const progress=ctx.window.TourStarProgress.summarize(Object.fromEntries(rooms.map(r=>[r.game,{stars:3}])),rooms.map(r=>({id:r.game,maxStars:3})));
check(progress.maxStars===rooms.length*3&&progress.stars===rooms.length*3,'every game contributes three best stars');check(ctx.window.TourStarProgress.TITLE_AT===27,'existing title threshold preserved');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
check(html.indexOf('js/stairs-engine.js')<html.indexOf('js/game-stairs.js'),'engine before game');
check(/game: 'stairs'/.test(fs.readFileSync(path.join(root,'js/tour-data.js'),'utf8')),'room entry point');
console.log(JSON.stringify({checks,seededRuns:1000,goal:80,practiceSteps:6,totalGames:rooms.length,maximumStars:progress.maxStars,titleAt:27}));
