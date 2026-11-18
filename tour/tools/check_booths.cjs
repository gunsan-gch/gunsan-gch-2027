const assert = require('node:assert/strict');
const {boards,pieces,offsets,inspect,route,cellsFor} = require('../js/game-booths.js');

// Search with an independent rotation transform, collision map and flood fill.
function orientations(type) {
  let cells=pieces[type].shape;
  const seen=new Map();
  for(let turn=0;turn<4;turn++) {
    cells=cells.slice().sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
    const [ax,ay]=cells[0], shape=cells.map(([x,y])=>[x-ax,y-ay]);
    if(!seen.has(JSON.stringify(shape))) seen.set(JSON.stringify(shape),{turn,shape});
    cells=cells.map(([x,y])=>[-y,x]);
  }
  return [...seen.values()];
}
function walk(map,occupied) {
  const y=map.findIndex(row=>row.includes('G')), start=[map[y].indexOf('G'),y];
  const todo=[start], seen=new Set([String(start)]);
  while(todo.length) {
    const [x,y]=todo.pop();
    if(map[y][x]==='S') return true;
    for(const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
      const key=[nx,ny].join();
      if(!map[ny]?.[nx]||map[ny][nx]==='#'||occupied.has(key)||seen.has(key)) continue;
      seen.add(key); todo.push([nx,ny]);
    }
  }
  return false;
}
function solve(b,id=0,taken=new Set(),moves=[]) {
  if(id===b.pieces.length) return moves;
  for(const {turn,shape} of orientations(b.pieces[id])) {
    for(let y=0;y<b.map.length;y++) for(let x=0;x<b.map[y].length;x++) {
      const points=shape.map(([dx,dy])=>[x+dx,y+dy]);
      if(points.some(([x,y])=>b.map[y]?.[x]!=='.'||taken.has([x,y].join()))) continue;
      const next=new Set([...taken,...points.map(String)]);
      if(!walk(b.map,next)) continue;
      const solved=solve(b,id+1,next,[...moves,{x,y,turn}]); if(solved) return solved;
    }
  }
}
for(const b of boards) {
  const solution=solve(b); assert.ok(solution,b.name);
  const placed=b.pieces.map(()=>null);
  solution.forEach((p,i)=>{assert.equal(inspect(b,placed,i,p),''); placed[i]=p;});
  const path=route(b,placed),w=b.map[0].length;
  assert.ok(path.length>1); assert.equal(b.map[Math.floor(path[0]/w)][path[0]%w],'G');
  assert.equal(b.map[Math.floor(path.at(-1)/w)][path.at(-1)%w],'S');
  const used=new Set(placed.flatMap((p,i)=>cellsFor(b,i,p).map(String)));
  path.forEach((v,i)=>{const x=v%w,y=Math.floor(v/w); assert.ok(!used.has([x,y].join())&&b.map[y][x]!=='#'); if(i) assert.equal(Math.abs(x-path[i-1]%w)+Math.abs(y-Math.floor(path[i-1]/w)),1);});
  console.log(b.name,JSON.stringify(solution));
}
const blocked={x:3,y:1,turn:0};
assert.equal(walk(boards[0].map,new Set(['3,1','3,2','4,2'])),false);
assert.match(inspect(boards[0],[null,null],1,blocked),/길이 막혀/);
assert.match(inspect(boards[0],[{x:0,y:0,turn:0},null],1,{x:0,y:0,turn:0}),/겹쳐/);
assert.ok(offsets('photo',2).some(([x])=>x<0));
assert.match(inspect({map:['....','G..S','....'],pieces:['photo']},[null],0,{x:0,y:0,turn:2}),/밖으로/);

// Drive the registered game callbacks using the same selectors as the UI.
const fs=require('node:fs'), vm=require('node:vm'), path=require('node:path');
const sandbox={window:{TOUR_GAMES:{}},AbortController};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../js/game-booths.js'),'utf8'),sandbox);
for(const target of [1,2,3]) {
  const controls=new Map(), listeners=new Map();
  function control(selector) {
    if(!controls.has(selector)) {
      const field=selector.match(/data-(piece|cell|act)="([^"]+)"/);
      const el={dataset:field?{[field[1]]:field[2]}:{},focus(){},style:{setProperty(){}},closest(){return this;}};
      controls.set(selector,el);
    }
    return controls.get(selector);
  }
  const container={querySelector:control,addEventListener(type,fn,{signal}){
    listeners.set(type,fn); signal.addEventListener('abort',()=>listeners.delete(type));
  }};
  const finished=[];
  const stop=sandbox.window.TOUR_GAMES.booths.start(container,{done:r=>finished.push(r.stars)});
  const button=(field,value)=>control('[data-'+field+'="'+value+'"]');
  const click=(field,value)=>listeners.get('click')({target:button(field,value)});
  const key=(cell,key)=>listeners.get('keydown')({target:button('cell',cell),key,preventDefault(){}});
  assert.equal(button('act','finish').hidden,true);
  click('act','finish'); assert.deepEqual(finished,[]);
  click('cell',0); click('act','place'); click('piece',0); click('act','remove');
  assert.match(control('.bo-title span').textContent,/배치 0/);
  click('act','undo'); assert.match(control('.bo-title span').textContent,/배치 1/);
  key(0,'ArrowRight'); click('act','place'); // Reposition the first booth.
  click('piece',1); click('cell',1); assert.equal(button('act','place').disabled,true);
  click('act','reset'); assert.match(control('.bo-title span').textContent,/배치 0/);
  click('piece',1); click('cell',8); assert.match(control('.bo-status').textContent,/길이 막혀/);
  key(8,'r'); click('act','reset');
  for(let i=0;i<target;i++) {
    const board=boards[i];
    solve(board).forEach(({x,y,turn})=>{
      for(let n=0;n<turn;n++)click('act','rotate');
      click('cell',y*board.map[0].length+x);
      assert.equal(button('act','place').disabled,false);
      click('act','place');
    });
    assert.match(control('.bo-grid').innerHTML,/bo-route/);
    assert.equal(button('act','finish').hidden,false);
    if(i<target-1)click('act','next');
  }
  click('act','finish');click('act','finish');
  assert.deepEqual(finished,[target]); stop(); assert.equal(listeners.size,0);
}
console.log('Unit and game callback checks passed for 1, 2 and 3 stars.');
