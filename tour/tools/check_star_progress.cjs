/* Run with Node; no DOM, browser progress, or site files are modified. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const scope={window:{},document:{createElement:()=>({getContext:()=>({})})}};
vm.createContext(scope);
for(const file of ['star-progress.js','wardrobe-art.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),scope);
const rules=scope.window.TourStarProgress,items=scope.window.TourCostumes.items;
const ids=['bakery','typing','cafe','cashier','rain','ai','career','phishing','interview'];
const entries=ids.map(id=>({id,maxStars:3}));
const score=stamps=>rules.summarize(stamps,entries);
const record=stars=>({stars,at:'2026-11-15'});
let checks=0;function check(condition,message){assert(condition,message);checks++;}
let fresh=rules.emptyWardrobe();
check(rules.wardrobe(fresh,score({}),items).unlocked.length===0,'fresh visitor starts locked');
let stamps={bakery:record(1)},first=rules.wardrobe(fresh,score(stamps),items);
check(first.unlocked.length===2,'first star gives the starter pair');
let same=rules.wardrobe(first,score(stamps),items);
check(JSON.stringify(same)===JSON.stringify(first),'repeating the same record cannot add rewards');
stamps.bakery=record(3);
let improved=rules.wardrobe(first,score(stamps),items);
check(score(stamps).stars===3&&improved.unlocked.length===4,'one stamp improving 1 to 3 unlocks the next pair');
for(let total=0;total<=27;total++){
  const s=Object.fromEntries(ids.map((id,i)=>[id,record(Math.max(0,Math.min(3,total-i*3)))]));
  const w=rules.wardrobe(fresh,score(s),items);
  const expected=[1,3,5,7,9,11,13,15,17,19,21,24].filter(at=>at<=total).length*2;
  check(w.unlocked.length===expected,`boundary at ${total} stars`);
  check(w.title===(total===27),`title boundary at ${total} stars`);
}
for(let count=1;count<=9;count++){
  const s=Object.fromEntries(ids.slice(0,count).map(id=>[id,record(1)]));
  const migrated=rules.wardrobe(undefined,score(s),items);
  const old=items.filter(item=>item.legacyAt&&item.legacyAt<=Math.min(8,count));
  check(old.every(item=>migrated.unlocked.includes(item.id)),`old ${count}-stamp rewards are retained`);
  const reloaded=rules.wardrobe(JSON.parse(JSON.stringify(migrated)),score(s),items);
  check(JSON.stringify(reloaded)===JSON.stringify(migrated),`migration is idempotent at ${count} stamps`);
}
const freshNine=score(Object.fromEntries(ids.map(id=>[id,record(1)])));
check(!rules.wardrobe(fresh,freshNine,items).unlocked.includes('witch'),'new visitors do not get legacy stamp rewards');
let max=rules.wardrobe(fresh,score(Object.fromEntries(ids.map(id=>[id,record(3)]))),items);
check(max.unlocked.length===24&&max.title,'27-star collection complete');
check(rules.wardrobe(max,score({bakery:record(1)}),items).unlocked.length===24,'earned items are permanent until explicit reset');
check(rules.wardrobe(rules.emptyWardrobe(),score({}),items).unlocked.length===0,'explicit reset clears items');
check(!rules.wardrobe(rules.emptyWardrobe(),score({}),items).title,'explicit reset clears title');
check(score({bakery:record(9),typing:record(6),cafe:record(4),foreign:record(100)}).stars===6,'legacy nine-star scores normalize; unknown games do not count');
for(const value of [null,'3',NaN,Infinity,-1])check(rules.normalizeStars(value)===0,'invalid record contributes zero');
check(rules.normalizeStars(999)===3,'numeric records are capped');
check(rules.summarize({bakery:record(3)},[entries[0],entries[0]]).stars===3,'duplicate rooms do not double count');
const malformed=rules.wardrobe({version:2,unlocked:['not-real','ribbon','ribbon'],title:'true'},score({}),items);
check(malformed.unlocked.length===1&&!malformed.title,'stored wardrobe IDs and title are sanitized');
console.log(JSON.stringify({checks,maximumStars:27,items:24,legacyMigration:'all 1–9 stamp counts',replay:'best record only',reset:'items and title cleared'}));
