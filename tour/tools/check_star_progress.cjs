/* Run with Node; no DOM, browser progress, or site files are modified. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const scope={window:{},document:{createElement:()=>({getContext:()=>({})})}};
vm.createContext(scope);
for(const file of ['star-progress.js','wardrobe-art.js','tour-data.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),scope);
const rules=scope.window.TourStarProgress,items=scope.window.TourCostumes.items;
const ids=[...new Set(Object.values(scope.window.TOUR_SCENES).flatMap(s=>s.rooms).flatMap(r=>r.games||(r.game?[r.game]:[])))];
const entries=ids.map(id=>({id,maxStars:3}));
const score=stamps=>rules.summarize(stamps,entries);
const record=stars=>({stars,at:'2026-11-15'});
let checks=0;function check(condition,message){assert(condition,message);checks++;}
check(ids.length===22&&score({}).maxStars===66,'22 reward games offer 66 stars');
let fresh=rules.emptyWardrobe();
check(rules.wardrobe(fresh,score({}),items).unlocked.length===0,'fresh visitor starts locked');
let stamps={bakery:record(1)},first=rules.wardrobe(fresh,score(stamps),items);
check(first.unlocked.length===2,'first star gives the starter pair');
let same=rules.wardrobe(first,score(stamps),items);
check(JSON.stringify(same)===JSON.stringify(first),'repeating the same record cannot add rewards');
stamps.bakery=record(3);
let improved=rules.wardrobe(first,score(stamps),items);
check(score(stamps).stars===3&&improved.unlocked.length===6,'별 3개에서 기존 다섯 종과 하트 볼터치가 열린다');
for(let total=0;total<=66;total++){
  const s=Object.fromEntries(ids.map((id,i)=>[id,record(Math.max(0,Math.min(3,total-i*3)))]));
  const w=rules.wardrobe(fresh,score(s),items);
  const added = [2,4,8,10,14,16,20,23,26,29,32,35,38,41,44,47,50,53,56,59,62,64,66];
  const expected=added.filter(at => at <= total).length + [1,3,5,7,9,11,13,15,17,19,21,24,27,30,33,36,39,42].filter(at=>at<=total).length*2+(total>=3?1:0);
  check(w.unlocked.length===expected,`boundary at ${total} stars`);
  check(w.title===(total>=27),`title boundary at ${total} stars`);
}
for(let count=1;count<=9;count++){
  const s=Object.fromEntries(ids.slice(0,count).map(id=>[id,record(1)]));
  const migrated=rules.wardrobe(undefined,score(s),items);
  const old=items.filter(item=>item.legacyAt&&item.legacyAt<=Math.min(8,count));
  check(old.every(item=>migrated.unlocked.includes(item.id)),`old ${count}-stamp rewards are retained`);
  const reloaded=rules.wardrobe(JSON.parse(JSON.stringify(migrated)),score(s),items);
  check(JSON.stringify(reloaded)===JSON.stringify(migrated),`migration is idempotent at ${count} stamps`);
}
const freshNine=score(Object.fromEntries(ids.slice(0,9).map(id=>[id,record(1)])));
check(!rules.wardrobe(fresh,freshNine,items).unlocked.includes('witch'),'new visitors do not get legacy stamp rewards');
const originalIds=['bakery','typing','cafe','cashier','rain','melody','curling','target','badminton','ai','career','phishing','interview','stairs'];
const oldStamps=Object.fromEntries(originalIds.map(id=>[id,record(3)]));
const before=score(oldStamps);
check(before.count===14&&before.stars===42&&before.maxStars===66,'all 14 original stamp records survive the expansion');
const oldRewards=rules.wardrobe(fresh,before,items);
check(oldRewards.unlocked.length===51&&oldRewards.title,'previously completed wardrobe remains complete at 42 stars');
for(const [id,floor,name] of [['press','3','드림스페이스'],['logistics','4','전산회계2실'],['reconcile','4','전산회계3실'],['tea','5','예절실'],['booths','5','학생회 회의실'],['goods','1','창업동아리 지원센터'],['paperplane','outdoor','잔디마당']]){
  const room=scope.window.TOUR_SCENES[floor].rooms.find(room=>room.name===name);
  check(room?.game===id,'direct room entry for '+id);
  const after=score({...oldStamps,[id]:record(3)});
  check(after.count===15&&after.stars===45,'independent new stamp for '+id);
}
const lastRelease=Object.fromEntries(ids.filter(id=>!['tea','booths','goods','paperplane'].includes(id)).map(id=>[id,record(3)]));
check(score(lastRelease).count===18&&score(lastRelease).stars===54,'previous 18 stamps and 54 stars survive');
const previous20=Object.fromEntries(ids.filter(id=>!['goods','paperplane'].includes(id)).map(id=>[id,record(3)]));
check(score(previous20).count===20&&score(previous20).stars===60,'previous 20 stamps and 60 stars survive');
let max=rules.wardrobe(fresh,score(Object.fromEntries(ids.map(id=>[id,record(3)]))),items);
check(max.unlocked.length===60&&max.title,'66-star collection complete');
check(rules.wardrobe(max,score({bakery:record(1)}),items).unlocked.length===60,'earned items are permanent until explicit reset');
check(rules.wardrobe(rules.emptyWardrobe(),score({}),items).unlocked.length===0,'explicit reset clears items');
check(!rules.wardrobe(rules.emptyWardrobe(),score({}),items).title,'explicit reset clears title');
check(score({bakery:record(9),typing:record(6),cafe:record(4),foreign:record(100)}).stars===6,'legacy nine-star scores normalize; unknown games do not count');
for(const value of [null,'3',NaN,Infinity,-1])check(rules.normalizeStars(value)===0,'invalid record contributes zero');
check(rules.normalizeStars(999)===3,'numeric records are capped');
const original={stars:3,at:'2026-11-17'};
const scored=rules.stampRecord(original,1,3,8,'2026-11-18');
check(scored.stars===3&&scored.at===original.at&&scored.bestScore===8,'first points record preserves a legacy three-star stamp and date');
check(original.bestScore===undefined,'scoring does not mutate an existing stamp');
check(rules.stampRecord(scored,2,3,7,'2026-11-19').bestScore===8,'a lower run keeps the high score');
check(rules.stampRecord(scored,3,3,36,'2026-11-19').bestScore===36,'higher points count even at the same stars');
const zeros=rules.stampRecord(null,1,3,0,'2026-11-18');
check(zeros.bestScore===0&&zeros.stars===1,'zero is a real score for a completed flight');
const raised=rules.stampRecord(zeros,2,3,65,'2026-11-19');
check(raised.stars===2&&raised.at==='2026-11-19'&&raised.bestScore===65,'improved stars and points are recorded together');
for(const value of [undefined,null,'40',-2,Infinity,1.5]){
  check(rules.stampRecord(raised,1,3,value,'2026-11-20').bestScore===65,'an absent or invalid score preserves the record');
  check(!('bestScore' in rules.stampRecord(null,2,3,value,'2026-11-20')),'games without points keep their existing record format');
}
check(rules.summarize({bakery:record(3)},[entries[0],entries[0]]).stars===3,'duplicate rooms do not double count');
const malformed=rules.wardrobe({version:2,unlocked:['not-real','ribbon','ribbon'],title:'true'},score({}),items);
check(malformed.unlocked.length===1&&!malformed.title,'stored wardrobe IDs and title are sanitized');
const oldCollection={version:2,unlocked:items.filter(i=>i.at<=24&&i.id!=='bookcat'&&!scope.window.TourCostumes.collection.includes(i)).map(i=>i.id),title:true};
const upgraded=rules.wardrobe(oldCollection,{stars:33,count:11},items);
check(upgraded.unlocked.length===42&&oldCollection.unlocked.every(id=>upgraded.unlocked.includes(id))&&upgraded.title,'existing 33-star player keeps old 24 items and gains all eligible items');
check(!rules.wardrobe(oldCollection,{stars:24,count:8},items).unlocked.includes('trailcap'),'new rewards are not granted below threshold');
const lowScore=score({bookshop:record(2)});
check(!rules.wardrobe(fresh,lowScore,items).unlocked.includes('bookcat'),'two bookshop stars leave bookcat locked');
check(rules.wardrobe(fresh,score({bookshop:record(2),bakery:record(1)}),items).unlocked.includes('bookcat'),'another game may complete the three-star requirement');
check(rules.wardrobe(fresh,score({bookshop:record(3)}),items).unlocked.includes('bookcat'),'a first three-star bookshop win unlocks bookcat');
console.log(JSON.stringify({checks,maximumStars:66,items:items.length,legacyMigration:'all 1–9 stamp counts',replay:'best record only',reset:'items and title cleared'}));
