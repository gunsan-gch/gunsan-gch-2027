/* Exercise the registered game's actual click, key, reset and completion callbacks. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const nodes = new Map();
function node(name) {
  if (nodes.has(name)) return nodes.get(name);
  const handlers = new Map();
  const item = name.match(/^\[data-item="(\d+)"\]$/);
  const plan = name.match(/^\[data-plan="(\d+)"\]$/);
  const el = {
    handlers, dataset: item ? {item:item[1]} : plan ? {plan:plan[1]} : {},
    classList: { add(){}, remove(){} },
    querySelector: n => node(name+'/'+n),
    addEventListener: (n,f) => handlers.set(n,f),
    removeEventListener: n => handlers.delete(n),
    hasAttribute: n => n === 'data-reset' && name === '[data-reset]' || n === 'data-item' && !!item,
    closest: () => el, focus(){}, remove(){}, setAttribute(key,value){this[key]=value;}, insertAdjacentHTML(){}
  };
  nodes.set(name,el);
  return el;
}
const root = node('main');
root.querySelector = node;
const env = {window:{TOUR_GAMES:{}},document:{createElement:()=>({})}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/game-logistics.js'),'utf8'),env);
const permutations = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const dirs = [[0,-1,'ArrowUp'],[1,0,'ArrowRight'],[0,1,'ArrowDown'],[-1,0,'ArrowLeft']];
const labels = ['음료','컵','빵'];
for(let plan=0;plan<3;plan++) for(const [extra,stars] of [[0,3],[2,2],[6,1]]) {
  let result;
  const cleanup = env.window.TOUR_GAMES.logistics.start(root,{done:r => {assert.equal(result,undefined);result=r;}});
  const click = target => root.handlers.get('click')({target});
  const key = k => root.handlers.get('keydown')({key:k,target:{closest:()=>null},preventDefault(){},stopPropagation(){}});
  click(node('[data-plan="'+plan+'"]'));
  for(let i=0;i<3;i++) assert.equal(node('[data-plan="'+i+'"]')['aria-pressed'],String(i===plan));
  assert.equal((node('.log-slots').innerHTML.match(/class="log-empty"/g)||[]).length,2);
  const cells = Array.from(node('.log-map').innerHTML.matchAll(/<span>([^<]*)<\/span>/g),m=>m[1]);
  const orders = node('.log-orders').innerHTML.split('</div>').filter(Boolean);
  const destinations = labels.map(label => cells.indexOf(orders.find(s=>s.includes(label)).match(/([AB]부스)/)[1]));
  const warehouse = cells.indexOf('창고');
  const neighbors = p => dirs.flatMap(([dx,dy,k]) => {
    const x=p%5+dx,y=Math.floor(p/5)+dy,n=5*y+x;
    return x>=0 && x<5 && y>=0 && y<5 && cells[n]!=='장비' ? [[n,k]] : [];
  });
  function route(a,b) {
    const queue=[[a,[]]], seen=new Set([a]);
    for(const [p,actions] of queue){
      if(p===b)return actions;
      for(const [n,k] of neighbors(p))if(!seen.has(n)){seen.add(n);queue.push([n,[...actions,k]]);}
    }
    throw Error('disconnected map');
  }
  const candidates=[];
  for(const perm of permutations)for(const split of [1,2]){
    let pos=warehouse;const actions=[];
    const go=n=>{actions.push(...route(pos,n));pos=n;};
    for(const batch of [perm.slice(0,split),perm.slice(split)]){
      go(warehouse);actions.push(...batch);for(const i of batch)go(destinations[i]);
    }
    candidates.push(actions);
  }
  const solution=candidates.sort((a,b)=>a.length-b.length)[0];
  const item=i=>node('[data-item="'+i+'"]');
  click(item(0));click(item(1));assert.equal(item(2).disabled,true);
  click(item(0));assert.equal(item(2).disabled,false);
  click(node('[data-reset]'));assert.equal(node('.log-cargo strong span').textContent,'0/2');
  const away=neighbors(warehouse)[0];
  for(let i=0;i<extra/2;i++){key(away[1]);key(route(away[0],warehouse)[0]);}
  for(const action of solution) {
    if(typeof action==='number'){assert.equal(item(action).disabled,false);click(item(action));}
    else key(action);
  }
  assert.equal(result.stars,stars);
  assert.match(result.extra.textContent,new RegExp('이동 '+(solution.length-3+extra)+'칸 / 최단 '+(solution.length-3)+'칸'));
  cleanup();assert.equal(root.handlers.size,0);
}
console.log('Logistics: all three maps, all nine star outcomes, capacity, unloading, reset and cleanup passed.');
