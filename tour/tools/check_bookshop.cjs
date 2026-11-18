// Run with node tour/tools/check_bookshop.cjs. Drive the registered game with a DOM fixture.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
class Node {
  constructor() {
    this.style = {};
    this.children = [];
    this.nodes = new Map();
    this.listeners = new Map();
    this.scrollLeft = this.scrollTop = 0;
    this.clientWidth = 320;
    this.clientHeight = 176;
  }
  set innerHTML(html) {
    this.html = html;
    this.children = Array.from(html.matchAll(/data-spot="(\d)"/g), m => ({
      dataset: {spot:m[1]}, closest() {return this;}
    }));
  }
  setAttribute(key,value) {this[key] = value;}
  focus() {this.focused = true;}
  querySelector(selector) {
    if (!this.nodes.has(selector)) this.nodes.set(selector,new Node());
    return this.nodes.get(selector);
  }
  addEventListener(name,callback,options) {this.listeners.set(name,{callback,options});}
  fire(name,data={}) {
    const listener=this.listeners.get(name);
    if (listener && !listener.options.signal.aborted) listener.callback(data);
  }
}
const context={window:{TOUR_GAMES:{}},document:{createElement:()=>new Node()},AbortController};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../js/game-bookshop.js'),'utf8'),context);
const game=context.window.TOUR_GAMES.bookshop;
const seen=[new Set(),new Set(),new Set()];
let previous=[];
for(let pass=0;pass<24;pass++){
  const body=new Node(), $=s=>body.querySelector('.bk-'+s);
  const costs=pass%4;
  let result, calls=0;
  const cleanup=game.start(body,{done(v){calls++;result=v;cleanup();}});
  const peek=$('peek'), scene=$('scene'), view=$('viewport'), next=$('next');
  const choices=$('choices');
  peek.getBoundingClientRect=()=>{
    const w=parseFloat(scene.style.width)*3.2, h=w*176/320, sz=w*.05625;
    return {left:w*parseFloat(peek.style.left)/100-view.scrollLeft-sz/2,
      top:h*parseFloat(peek.style.top)/100-view.scrollTop-sz/2,width:sz,height:sz};
  };
  const point=(x,y)=>({clientX:x,clientY:y,isPrimary:true,button:0});
  for(let stage=0;stage<3;stage++){
    const placement=peek.style.left+'/'+peek.style.top;
    assert.notEqual(placement,previous[stage]);
    previous[stage]=placement; seen[stage].add(placement);
    assert.equal($('reset').textContent,'100%');
    assert.equal(choices.children.length,4);
    if(stage<costs){
      $('hint').fire('click'); $('hint').fire('click');
      assert.match($('status').textContent,/절반/);
      assert.equal($('region').hidden,false);
    }
    $('plus').fire('click'); $('plus').fire('click');
    const point=(x,y)=>({clientX:x,clientY:y,isPrimary:true,button:0});
    view.getBoundingClientRect=()=>({left:0,top:0});
    const touch=(left,right)=>({touches:[point(left,65),point(right,65)],preventDefault(){}});
    view.fire('touchstart',touch(80,160));
    view.fire('touchmove',touch(60,180));
    assert.equal($('reset').textContent,'300%');
    view.fire('touchend',{touches:[]});
    scene.fire('click',point(100,100)); assert.equal(next.hidden,true);
    scene.setPointerCapture=()=>{};
    scene.fire('pointerdown',point(150,70));
    const oldScroll=view.scrollLeft;
    scene.fire('pointermove',{...point(110,70),pointerType:'mouse',buttons:1,pointerId:1});
    assert.equal(view.scrollLeft,oldScroll+40);
    scene.fire('click',point(110,70));assert.equal(next.hidden,true);
    view.scrollLeft=100;view.scrollTop=50;
    const rect=peek.getBoundingClientRect(), x=rect.left+rect.width/2,y=rect.top+rect.height/2;
    const goal=point(x,y), miss=point(x+60,y);
    scene.fire('pointerdown',miss); scene.fire('pointermove',goal); scene.fire('click',goal);
    assert.equal(next.hidden,true,'Drag ending at a cat must not collect it');
    scene.fire('pointerdown',goal);scene.fire('pointercancel');scene.fire('click',goal);
    assert.equal(next.hidden,true,'Cancelled pan must not collect it');
    scene.fire('pointerdown',miss);scene.fire('click',miss);assert.equal(next.hidden,true);
    if(pass%2){
      const index=[[19,64,85,35],[22,71,50,86],[18,49,78,84]][stage].indexOf(parseFloat(peek.style.left));
      choices.fire('click',{target:choices.children[(index+1)%4]});assert.equal(next.hidden,true);
      choices.fire('click',{target:choices.children[index]});
    }else{
      const edge=point(x+21,y);scene.fire('pointerdown',edge);scene.fire('click',edge);
    }
    assert.equal(next.hidden,false);assert.equal(next.focused,true);
    assert.equal($('count').textContent,'책갈피 '+(stage+1)+' / 3');
    assert.match($('tray').html,new RegExp('cat-'+stage));
    next.fire('click');
  }
  assert.equal(result.hints,costs);assert.equal(result.stars,Math.max(1,3-costs));
  assert.equal(result.extra.focused,true);assert.equal(body.scrollTop,0);
  assert.equal((result.extra.html.match(/sleep-/g)||[]).length,3);
  next.fire('click');assert.equal(calls,1);
  const scale=scene.style.width;$('plus').fire('click');assert.equal(scene.style.width,scale);
}
assert.ok(seen.every(s=>s.size>=2));
console.log('Bookshop scenes, replay variation, touch hit testing, text choices, hint scoring, zoom and cleanup passed.');
