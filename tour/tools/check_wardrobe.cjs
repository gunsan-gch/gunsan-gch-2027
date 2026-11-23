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
vm.runInContext(fs.readFileSync(path.join(tour, 'js/star-progress.js'), 'utf8'), context);
const art = context.window.TourCostumes;
const rules = context.window.TourStarProgress;
const newPacks = ['mailcat', 'baguette', 'easel', 'ledger', 'rainbow', 'bouquet'];
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
// --browser 옵션은 독립 브라우저에서 실제 저장·착용·걷기·초기화 경로를 확인한다.
async function earnLastReward(page) {
  await page.evaluate(() => window.tourGame.open('bookshop'));
  for (let scene = 0; scene < 3; scene++) {
    const cat = page.locator('.bk-peek');
    await cat.scrollIntoViewIfNeeded();
    const box = await cat.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.locator('.bk-next').click();
  }
  await page.locator('[data-addon-reward="bouquet"]').waitFor();
  await page.locator('#addon-reward-try').click();
  await page.getByText('모든 옷을 열었어요!').waitFor();
  assert.match(await page.locator('#addon-equipped-names').innerText(), /풍선 다발/);
  await page.locator('#addon-games').click();
  await page.locator('#stamps-reset').click();
  await page.locator('#stamps-reset-confirm').click();
}
async function checkOldSave(page, key, read) {
  await page.goto(process.env.TOUR_URL || 'http://localhost:8080/tour/');
  await page.evaluate(key => {
    const stamps = Object.fromEntries(window.tourGame.progress().games.map(game =>
      [game.id, {stars:game.id === 'bookshop' ? 2 : 3, at:'2026-11-20'}]));
    localStorage.setItem('gch-tour-stamps', JSON.stringify(stamps));
    localStorage.setItem(key, JSON.stringify({equip:{head:'ribbon',back:'bag'},
      wardrobe:{version:2,unlocked:['ribbon','bag'],title:true}}));
  }, key);
  await page.reload();
  assert.deepEqual((await read()).equip, {head:'ribbon',back:'bag',face:null,trail:null});
  assert.equal((await read()).wardrobe.unlocked.length, 62);
}
async function checkFilters(page) {
  await page.locator('#wardrobe-open').click();
  const filters = page.locator('[data-addon-filter]');
  const boxes = await filters.evaluateAll(els => els.map(el => el.getBoundingClientRect().toJSON()));
  assert.equal(boxes.length, 6);
  assert.equal(new Set(boxes.map(box => box.y)).size, 2);
  assert(boxes.every(box => box.width >= 44 && box.height >= 44 && box.x >= 0 && box.right <= 360));
  await page.locator('[data-addon-filter="new"]').click();
  assert.equal(await page.locator('[data-addon-card]').count(), 26);
  assert.match(await page.locator('.addon-next-reward').innerText(), /★ 1/);
}
async function chooseSet(page) {
  const card = id => page.locator('[data-addon-card="' + id + '"]');
  await card('bouquet').click();
  assert(await page.locator('#addon-apply-outfit').isHidden());
  await page.locator('#addon-show-equipped').click();
  await page.getByText('세트 보기', {exact:true}).click();
  assert.equal(await page.locator('.addon-sets li:visible').count(), 6);
  for (const id of ['planepin','mailcat','postmarks']) await card(id).click();
  assert.match(await page.locator('#addon-set-title').innerText(), /하늘 우체부/);
  for (const id of ['halo','rainbow','blush','bubbles']) await card(id).click();
  assert.match(await page.locator('#addon-set-title').innerText(), /구름 산책가/);
}
async function applyPreview(page, read) {
  await page.locator('#addon-preview-walk').click();
  const preview = page.locator('#addon-avatar');
  // 신발보다 낮은 줄만 비교해서 몸의 걷기 프레임 변화와 구분한다.
  const feet = c => c.getContext('2d').getImageData(0,45,48,7).data.join(',');
  const first = await preview.evaluate(feet);
  await page.waitForFunction(first => {
    const c = document.querySelector('#addon-avatar').getContext('2d');
    return c.getImageData(0,45,48,7).data.join(',') !== first;
  }, first);
  await page.locator('#addon-apply-outfit').click();
  assert.match(await page.locator('#addon-toast').innerText(), /구름 산책가/);
  const equip = {head:'halo',back:'rainbow',face:'blush',trail:'bubbles'};
  assert.deepEqual((await read()).equip, equip);
  await page.reload();
  assert.deepEqual((await read()).equip, equip);
}
async function checkWalking(page) {
  const steps = page.locator('.addon-footprint');
  await page.evaluate(() => { window.tourAddonHost.go('outdoor', [56,50], '산책'); });
  await steps.first().waitFor();
  const mark = await steps.first().elementHandle();
  assert.equal(await mark.evaluate(el => getComputedStyle(el).animationDuration), '1.5s');
  await page.waitForTimeout(700);
  assert(await mark.evaluate(el => el.isConnected), 'the first step should outlast 700 ms');
  assert(await steps.count() <= 10);
  await page.evaluate(() => window.tourAddonHost.stop());
  await steps.first().waitFor({state:'detached'});
  const player = page.locator('.addon-outfit-layer');
  const walkingOff = await player.evaluate(c => c.toDataURL());
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(before => document.querySelector('.addon-outfit-layer').toDataURL() !== before, walkingOff);
  await page.evaluate(() => window.tourAddonHost.go('outdoor', [56,50], '산책'));
  assert.equal(await steps.count(), 0);
}
async function checkBrowser() {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH });
  try {
    const page = await browser.newPage({viewport:{width:360, height:780}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const key = 'gch-tour-addons-v1';
    const read = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
    await checkOldSave(page, key, read);
    await checkFilters(page);
    await chooseSet(page);
    await applyPreview(page, read);
    await checkWalking(page);
    await earnLastReward(page);
    assert.deepEqual((await read()).equip, {head:null,back:null,face:null,trail:null});
    assert.equal((await read()).wardrobe.unlocked.length, 0);
    assert.deepEqual(errors, []);
    console.log('360px 필터·잠금·세트·저장 이관·걷기·동작 줄이기·66별 결과 띠·도장판 초기화 통과');
  } finally {
    await browser.close();
  }
}
(async () => {
  const sprite = await loadImage(path.join(tour, 'img/walker.png'));
  const empty = createCanvas(sprite.width, sprite.height);
  const headIds = [null, ...art.items.filter(x => x.slot === 'head').map(x => x.id)];
  const backIds = [null, ...art.items.filter(x => x.slot === 'back').map(x => x.id)];
  assert.equal(art.items.length, 63);
  assert.equal(new Set(art.items.map(x => x.id)).size, 63);
  assert.deepEqual(Array.from(rules.slots, slot => art.collection.filter(i => i.slot === slot).length), [7,7,6,6]);
  for (const [id, at] of [['planepin',6], ['mailcat',12], ['postmarks',18]]) {
    assert.equal(art.items.find(item => item.id === id).at, at);
  }
  for (const item of art.collection) {
    assert.equal(art.items.filter(i => i.at === item.at).length, 1, item.id + ' 해금 별 중복');
  }
  const old = {version:2, unlocked:['witch','bag'], title:true};
  const upgraded = rules.wardrobe(old, {stars:4, count:2}, art.items);
  assert(upgraded.title && ['witch','bag','blush','petals'].every(id => upgraded.unlocked.includes(id)));
  assert(!upgraded.unlocked.includes('chefhat'));
  assert.deepEqual({...rules.loadEquip({head:'witch',back:'bag'}, art.items)},
    {head:'witch',back:'bag',face:null,trail:null});
  for (const stars of [65, 66]) {
    const wardrobe = rules.wardrobe(old, {stars, count:22}, art.items);
    assert.equal(wardrobe.unlocked.length, stars === 66 ? 63 : 62);
    assert.equal(wardrobe.unlocked.includes('bouquet'), stars === 66);
  }
  for (const set of art.sets) {
    const outfit = {};
    for (const id of set.pieces) {
      const item = art.items.find(i => i.id === id);
      assert(item && !outfit[item.slot]);
      assert(!art.matchingSet(outfit));
      outfit[item.slot] = id;
    }
    assert.equal(art.matchingSet(outfit), set);
  }
  for (const tier of [1,3,5,7,9,11,13,15,17,19,21,24,27,30,33,36,39,42]) {
    const pair = art.items.filter(x => x.at === tier);
    assert.equal(pair.length, tier===3?3:2);
    assert.deepEqual(Array.from(pair, x => x.slot).sort(), tier===3?['back','back','head']:['back','head']);
  }
  let singleRenders = 0;
  let renders = 0, hairChecks = 0, faceChecks = 0;
  for (const [row, direction] of directions.entries()) for (let frame = 0; frame < 3; frame++) {
    const plain = render(sprite, direction, frame, {});
    const guard = createCanvas(64, 72).getContext('2d');
    guard.translate(16,16);
    const native = createCanvas(32, 40).getContext('2d');
    for (const item of art.items) {
      const outfit = {[item.slot]:item.id}, label = [item.id,direction,frame].join('/');
      const pixels = render(sprite, direction, frame, outfit);
      // 사방에 여백을 두어 프레임 아래로 나가는 픽셀도 검출한다.
      guard.clearRect(-16,-16,64,72);
      art.draw(guard, sprite, direction, frame, outfit);
      const padded = guard.getImageData(0,0,64,72).data;
      for (let y = 0; y < 72; y++) for (let x = 0; x < 64; x++) {
        if (x < 16 || x >= 48 || y < 16 || y >= 56) {
          assert.equal(padded[(y*64+x)*4+3], 0, label + ' 원본 프레임 밖');
        }
      }
      art.draw(native, sprite, direction, frame, outfit);
      const compact = native.getImageData(0,0,32,40).data;
      let changed = 0, min = 32, max = -1;
      for (let y = -12; y < 40; y++) for (let x = -8; x < 40; x++) {
        const i = ((y + 12) * 48 + x + 8) * 4;
        if (x < 0 || x >= 32 || y < 0) {
          assert.equal(pixels[i + 3], 0, label + ' 32×40 밖');
          continue;
        }
        const j = (y * 32 + x) * 4;
        for (let k = 0; k < 4; k++) assert.equal(compact[j+k], pixels[i+k], label + ' 잘림');
        if (pixels[i] === plain[i] && pixels[i+1] === plain[i+1] && pixels[i+2] === plain[i+2]) continue;
        changed++;
        if (!plain[i+3]) { min = Math.min(min,x); max = Math.max(max,x); }
        if (item.slot === 'face') {
          assert(plain[i] >= 140, label + ' 머리카락 위에 얼굴 장식');
          const sx = direction === 'left' ? 31-x : x;
          assert(plain[i+3] && y >= 15 && y <= 19 && direction !== 'up', label + ' 얼굴 밖');
          if (direction !== 'down') assert(sx >= 16 && sx <= 22 && y <= 17, label + ' 옆머리');
          else assert(x >= (y === 15 ? 13 : 11) && x <= 22, label + ' 앞머리');
        }
      }
      if (item.slot === 'face' && direction === 'up') assert.equal(changed, 0, label);
      else if (art.collection.includes(item)) assert(changed > 0, label + ' 그림 없음');
      if (art.collection.includes(item) && item.slot === 'back' && direction === 'down') {
        assert(max >= min && Math.abs((min + max) / 2 - 16) <= 1, label + ' 정면 중심');
      }
      singleRenders++;
    }
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
    for (const back of ['balloon', 'wings', 'bag', 'breadbag', 'starbag', 'milkbag', 'umbrella', 'noteballoon', 'planet', 'cloudpack', 'pianobag', 'bookcat', 'racketbag', 'stonebag', 'targetpack', 'trophybag', ...newPacks]) {
      const front = render(empty, 'down', frame, { back });
      const side = render(empty, 'left', frame, { back });
      // Isolate balloon body from its connecting string; other profiles use all rows.
      const start = ['balloon','noteballoon','planet'].includes(back) ? 9 : 0, end = ['balloon','noteballoon','planet'].includes(back) ? 22 : 52;
      assert(widthAt(side, start, end) < widthAt(front, start, end), `${back}: side silhouette is not narrower`);
    }
  }
  let bobChecks=0;
  const carried=['bag','breadbag','starbag','milkbag','bowback','wings','umbrella','cloudpack','pianobag','bookcat','racketbag','stonebag','targetpack','trophybag',...newPacks];
  for(const back of carried)for(const direction of directions){
    const idle=render(empty,direction,1,{back});
    for(const [frame,dy]of [[0,-1],[1,0],[2,1]]){
      const moving=render(empty,direction,frame,{back});
      const tipX=(walking)=>{
        const reach=walking?3:2;
        if(direction==='right')return 8-reach;
        if(direction==='left')return 31-(8-reach);
        return (direction==='down'?23:22)+reach;
      };
      // The tail stays attached to the raised book on all three frames.
      const tipY=27-(direction==='left'||direction==='right'?6:5);
      // Below the strap, every pixel must move exactly one source pixel, with
      // no horizontal drift, scaling or fractional filtering in any direction.
      for(let y=25;y<40;y++)for(let x=0;x<48;x++)for(let k=0;k<4;k++)
        if(!(back==='bookcat'&&y===tipY+dy&&(x===8+tipX(false)||x===8+tipX(true))))
          assert.equal(moving[((y+12)*48+x)*4+k],(idle[((y-dy+12)*48+x)*4+k]??0),`${back}/${direction}/${frame}: vertical bob`);
      if(back==='bookcat'){
        const tip=tipX(dy!==0);
        const i=((tipY+dy+12)*48+tip+8)*4;
        assert.deepEqual(Array.from(moving.slice(i,i+4)),[255,233,163,255], 'ginger tail tip moves one pixel with the stride');
      }
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
  // Bags should end above the shoes and stay centred on the jacket. Side
  // profiles use the same clearance on either side of the 32-pixel sprite.
  const fittedPacks = carried.filter(id => id !== 'wings' && id !== 'bouquet');
  for (const back of fittedPacks) for (const frame of [0,1,2]) {
    for (const direction of ['down','up']) {
      const layer = render(empty, direction, frame, {back});
      const xs = [];
      for (let y = 0; y < 40; y++) for (let x = 0; x < 32; x++) {
        if (!layer[((y+12)*48+x+8)*4+3]) continue;
        xs.push(x);
        assert(y <= 29, back + ': pack overlaps shoes');
      }
      const center = (Math.min(...xs) + Math.max(...xs)) / 2;
      assert(Math.abs(center - (direction === 'down' ? 16 : 15.5)) <= 1, back + ': pack off centre');
    }
    const left = render(empty, 'left', frame, {back});
    const right = render(empty, 'right', frame, {back});
    for (let y=0; y<40; y++) for (let x=0; x<32; x++) {
      const i = ((y+12)*48+x+8)*4+3;
      const j = ((y+12)*48+31-x+8)*4+3;
      assert.equal(left[i], right[j], back + ': side profiles sit at different distances');
    }
  }
  // Beyond the short shoulder strap the depth of each new pack overlaps the
  // actual jacket, even at the extremes of the walk cycle.
  for(const back of ['cloudpack','pianobag','bookcat','racketbag','stonebag','targetpack','trophybag',...newPacks]){
    for(const direction of ['left','right'])for(const frame of [0,1,2]){
      const plain=render(sprite,direction,frame,{}),pack=render(empty,direction,frame,{back});
      let overlap=0;
      for(let y=23;y<=26;y++)for(let x=0;x<32;x++){
        const alpha=((y+12)*48+x+8)*4+3;
        if(plain[alpha]&&pack[alpha])overlap++;
      }
      assert(overlap>=2,`${back}/${direction}/${frame}: bag floats behind jacket`);
    }
  }
  for(let frame=0;frame<3;frame++){
    const plain=render(sprite,'down',frame,{}),pack=render(sprite,'down',frame,{back:'bookcat'});
    for(let y=0;y<40;y++)for(let x=0;x<32;x++){
      const i=((y+12)*48+x+8)*4;
      const shoulder=(x===11||x===20)&&y>=21&&y<=23||(x===12||x===19)&&y===23;
      if(plain[i+3]&&!shoulder)
        assert.deepEqual(pack.slice(i,i+4),plain.slice(i,i+4),'the jacket and face occlude the front-view bag');
    }
  }
  let capeChecks=0;
  for (const back of ['cape', 'starcloak']) for (const direction of directions) {
    const overlays=[0,1,2].map(frame=>render(empty,direction,frame,{back}));
    for (let frame=0;frame<3;frame++) {
      const plain=render(sprite,direction,frame,{}),cape=render(sprite,direction,frame,{back});
      for(let y=0;y<40;y++)for(let x=0;x<32;x++) {
        const i=((y+12)*48+x+8)*4;
        // Cloth must leave head/face and all legs visible; in profile the body
        // occludes the cape, except for the tiny collar fastening at rows 21–22.
        const side=direction==='left'||direction==='right';
        const collar=y>=21&&y<=22&&x>=12&&x<=19;
        if(y<20||y>=30||(side&&plain[i+3]&&!collar))
          for(let k=0;k<4;k++)assert.equal(cape[i+k],plain[i+k],`cape ${direction}/${frame}: body occlusion at ${x},${y}`);
        if(y<(back === 'starcloak' ? 25 : 26))for(let k=0;k<4;k++)assert.equal(overlays[frame][i+k],overlays[1][i+k],`cape ${direction}: shoulder must stay anchored`);
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
  console.log(JSON.stringify({ singleRenders, renders, hairChecks, faceChecks, capeChecks, bobChecks, crownLeaks: 0, edgeClipping: 0, sideProfiles: '22개 × 3프레임', unlocks: '66별 · 63종' }));
  if (process.argv.includes('--browser')) await checkBrowser();
})().catch(error => { console.error(error); process.exitCode = 1; });
