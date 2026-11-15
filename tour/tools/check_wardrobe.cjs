/* Run with Node and @napi-rs/canvas installed (or provided via NODE_PATH).
   No browser storage, game progress, or site files are changed. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const tour = path.resolve(__dirname, '..');
const directions = ['down', 'right', 'up', 'left'];
const context = { window: {}, document: { createElement: () => createCanvas(32, 40) } };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(tour, 'js/wardrobe-art.js'), 'utf8'), context);
const art = context.window.TourCostumes;
function render(sprite, direction, frame, outfit) {
  const canvas = createCanvas(48, 52);
  art.draw(canvas.getContext('2d'), sprite, direction, frame, outfit);
  return canvas.getContext('2d').getImageData(0, 0, 48, 52).data;
}
function widthAt(data, yStart, yEnd) {
  let min = 48, max = -1;
  for (let y = yStart; y < yEnd; y++) for (let x = 0; x < 48; x++) {
    if (data[(y * 48 + x) * 4 + 3]) { min = Math.min(min, x); max = Math.max(max, x); }
  }
  return max - min + 1;
}
(async () => {
  const sprite = await loadImage(path.join(tour, 'img/walker.png'));
  const empty = createCanvas(sprite.width, sprite.height);
  const headIds = [null, ...art.items.filter(x => x.slot === 'head').map(x => x.id)];
  const backIds = [null, ...art.items.filter(x => x.slot === 'back').map(x => x.id)];
  assert.equal(art.items.length, 24);
  assert.equal(new Set(art.items.map(x => x.id)).size, 24);
  for (const tier of [1,3,5,7,9,11,13,15,17,19,21,24]) {
    const pair = art.items.filter(x => x.at === tier);
    assert.equal(pair.length, 2);
    assert.deepEqual(Array.from(pair, x => x.slot).sort(), ['back', 'head']);
  }
  let renders = 0, hairChecks = 0, faceChecks = 0;
  for (const [row, direction] of directions.entries()) for (let frame = 0; frame < 3; frame++) {
    const plain = render(sprite, direction, frame, {});
    for (const head of headIds) for (const back of backIds) {
      const outfit = { head, back }, pixels = render(sprite, direction, frame, outfit);
      const label = `${head}/${back}/${direction}/${frame}`;
      for (let y = 0; y < 52; y++) assert.equal(pixels[y * 48 * 4 + 3] + pixels[(y * 48 + 47) * 4 + 3], 0, `${label}: horizontal clipping`);
      for (let x = 0; x < 48; x++) assert.equal(pixels[x * 4 + 3] + pixels[(51 * 48 + x) * 4 + 3], 0, `${label}: vertical clipping`);
      renders++;
      if (!art.covered.includes(head)) continue;
      // Independent regression region: the original crown occupies rows 0..10.
      // Recolor its full width to magenta. No crown pixel may affect the result,
      // even when a back accessory redraws the hair over the character.
      const marked = createCanvas(sprite.width, sprite.height), mc = marked.getContext('2d');
      mc.drawImage(sprite, 0, 0); mc.fillStyle = '#ff00ff'; mc.fillRect(frame * 32, row * 40, 32, 11);
      assert.deepEqual(render(marked, direction, frame, outfit), pixels, `${label}: original crown leaks through`);
      // Above the brim only the hat/back artwork is allowed, never original hair.
      const overlay = render(empty, direction, frame, outfit);
      const cut = art.crownCut[head][direction];
      for (let y = 0; y < cut; y++) for (let x = 0; x < 32; x++) {
        const i = ((y + 12) * 48 + x + 8) * 4;
        for (let k = 0; k < 4; k++) assert.equal(pixels[i + k], overlay[i + k], `${label}: hair outside brim at ${x},${y}`);
      }
      hairChecks++;
      if (!back) {
        // A smaller hat must not erase the eyes, face, lower hair, or uniform.
        for (let y = 16; y < 40; y++) for (let x = 0; x < 32; x++) {
          const i = ((y + 12) * 48 + x + 8) * 4;
          for (let k = 0; k < 4; k++) assert.equal(pixels[i + k], plain[i + k], `${label}: changed below face line`);
        }
        faceChecks++;
      }
    }
    for (const back of ['balloon', 'wings', 'bag', 'breadbag', 'starbag', 'milkbag', 'umbrella', 'noteballoon', 'planet']) {
      const front = render(empty, 'down', frame, { back });
      const side = render(empty, 'left', frame, { back });
      // Isolate balloon body from its connecting string; other profiles use all rows.
      const start = ['balloon','noteballoon','planet'].includes(back) ? 9 : 0, end = ['balloon','noteballoon','planet'].includes(back) ? 22 : 52;
      assert(widthAt(side, start, end) < widthAt(front, start, end), `${back}: side silhouette is not narrower`);
    }
  }
  let bobChecks=0;
  const carried=['bag','breadbag','starbag','milkbag','bowback','wings','umbrella'];
  for(const back of carried)for(const direction of directions){
    const idle=render(empty,direction,1,{back});
    for(const [frame,dy]of [[0,-1],[1,0],[2,1]]){
      const moving=render(empty,direction,frame,{back});
      // Below the strap, every pixel must move exactly one source pixel, with
      // no horizontal drift, scaling or fractional filtering in any direction.
      for(let y=25;y<40;y++)for(let x=0;x<48;x++)for(let k=0;k<4;k++)
        assert.equal(moving[((y+12)*48+x)*4+k],(idle[((y-dy+12)*48+x)*4+k]??0),`${back}/${direction}/${frame}: vertical bob`);
      if(dy)assert.notDeepEqual(moving,idle,`${back}/${direction}: walking must animate`);
      if(direction!=='down'){
        const [x,y]=direction==='up'?[15,20]:[back==='umbrella'?(direction==='left'?20:11):(direction==='left'?19:12),21];
        const i=((y+12)*48+x+8)*4;
        assert(idle[i+3],`${back}/${direction}: shoulder strap must exist`);
        for(let k=0;k<4;k++)assert.equal(moving[i+k],idle[i+k],`${back}/${direction}: shoulder must stay attached`);
      }
      bobChecks++;
    }
    assert.deepEqual(render(empty,direction,1,{back}),idle,`${back}/${direction}: stopping restores rest pose`);
  }
  let capeChecks=0;
  for (const direction of directions) {
    const overlays=[0,1,2].map(frame=>render(empty,direction,frame,{back:'cape'}));
    for (let frame=0;frame<3;frame++) {
      const plain=render(sprite,direction,frame,{}),cape=render(sprite,direction,frame,{back:'cape'});
      for(let y=0;y<40;y++)for(let x=0;x<32;x++) {
        const i=((y+12)*48+x+8)*4;
        // Cloth must leave head/face and all legs visible; in profile the body
        // occludes the cape, except for the tiny collar fastening at rows 21–22.
        const side=direction==='left'||direction==='right';
        const collar=y>=21&&y<=22&&x>=12&&x<=19;
        if(y<20||y>=30||(side&&plain[i+3]&&!collar))
          for(let k=0;k<4;k++)assert.equal(cape[i+k],plain[i+k],`cape ${direction}/${frame}: body occlusion at ${x},${y}`);
        if(y<26)for(let k=0;k<4;k++)assert.equal(overlays[frame][i+k],overlays[1][i+k],`cape ${direction}: shoulder must stay anchored`);
      }
      capeChecks++;
    }
    assert.notDeepEqual(overlays[0],overlays[1],`cape ${direction}: walking hem frame 0`);
    assert.notDeepEqual(overlays[2],overlays[1],`cape ${direction}: walking hem frame 2`);
  }
  for(let frame=0;frame<3;frame++){
    const left=render(empty,'left',frame,{back:'cape'}),right=render(empty,'right',frame,{back:'cape'});
    for(let y=0;y<52;y++)for(let x=0;x<48;x++)for(let k=0;k<4;k++)
      assert.equal(left[(y*48+x)*4+k],right[(y*48+47-x)*4+k],`cape: symmetric side placement ${frame}`);
  }
  console.log(JSON.stringify({ renders, hairChecks, faceChecks, capeChecks, bobChecks, crownLeaks: 0, edgeClipping: 0, sideProfiles: '9 accessories × 3 frames', unlocks: '24 items at 12 best-star milestones' }));
})().catch(error => { console.error(error); process.exitCode = 1; });
