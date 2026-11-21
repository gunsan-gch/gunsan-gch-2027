// node check_portals.cjs [--browser]. Browser checks require Playwright.
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const fs = require('node:fs');
const vm = require('node:vm');

function checkMovement() {
  const ctx = vm.createContext({window: {}});
  for (const file of ['tour-data.js', 'motion.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'), ctx);
  }
  const {TourMotion, TOUR_SCENES, TOUR_PORTALS} = ctx.window;
  const motion = new TourMotion(() => {});
  for (const portal of TOUR_PORTALS) {
    const scene = TOUR_SCENES[portal.from];
    motion.configure(scene, scene.start);
    assert.ok(motion.valid(portal.anchor) && TourMotion.contains(portal.anchor, portal.region), portal.id);
    const [left, top, width, height] = portal.region;
    for (const x of [left, left + width / 2, left + width]) {
      for (const y of [top, top + height / 2, top + height]) {
        const target = motion.mapTarget([x, y], TOUR_PORTALS.filter(p => p.from === portal.from));
        assert.ok(motion.valid(target.p) && TourMotion.contains(target.p, portal.region), portal.id + ' tap');
      }
    }
    const path = motion.route(portal.anchor);
    assert.ok(path.length, portal.id + ' reachable from scene start');
    let prev = [motion.x, motion.y];
    for (const step of path) {
      assert.ok(motion.clear(prev, step), portal.id + ' walkable route');
      prev = step;
    }
    const reverse = TOUR_PORTALS.find(p => p.id === portal.arrival);
    motion.configure(TOUR_SCENES[portal.to], portal.spawn);
    assert.ok(!TourMotion.contains([motion.x, motion.y], reverse.region), portal.id + ' no bounce');
  }
  const exit = TOUR_PORTALS.find(p => p.id === 'lobby-exit');
  const entry = TOUR_PORTALS.find(p => p.id === exit.arrival);
  motion.configure(TOUR_SCENES['1'], entry.spawn);
  assert.ok(!TourMotion.contains(motion.project([63, 91]).p, exit.region), 'ordinary projection misses door');
  for (const point of [[58.4, 93], [63, 92.8], [67.6, 93], [63, 94.1]]) {
    assert.ok(!TourMotion.contains(point, exit.region), 'glass outside walk trigger');
    assert.ok(TourMotion.contains(motion.mapTarget(point, [exit]).p, exit.region), 'glass tap reaches door');
  }
  for (const wall of [[57.5, 92], [58, 93], [68, 93], [63, 94.5]]) {
    assert.deepEqual(motion.mapTarget(wall, [exit]), motion.project(wall), 'adjacent wall uses normal projection');
  }
  motion.hold('down');
  for (let frame = 0; frame < 60 && !TourMotion.contains([motion.x, motion.y], exit.region); frame++) {
    motion.step(1 / 60);
  }
  assert.ok(TourMotion.contains([motion.x, motion.y], exit.region), 'direction controls reach door');
  console.log('Portal routes, floor geometry, reciprocal spawns and directional movement passed.');
}

async function run() {
  const {chromium} = require('playwright');
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH});
  try {
    const page = await browser.newPage({viewport: {width: 1400, height: 1000}, hasTouch: true});
    await page.goto(pathToFileURL(path.join(__dirname, '../index.html')).href + '#outdoor');
    await page.waitForFunction(() => window.tourAddonHost?.scene() === 'outdoor');
    await page.evaluate(() => {
      window.sceneChanges = [];
      document.addEventListener('tour:scene', event => sceneChanges.push(event.detail.id));
      // Keep the complete map visible when the camera follows the avatar.
      document.getElementById('scene-stage').parentElement.scrollIntoView({block: 'center'});
    });

    async function tapMap(x, y, touch = false) {
      const stage = page.locator('#scene-stage');
      const box = await stage.boundingBox();
      const clientX = box.x + box.width * x / 100;
      const clientY = box.y + box.height * y / 100;
      if (touch) await page.touchscreen.tap(clientX, clientY);
      else await page.mouse.click(clientX, clientY);
    }
    async function expectScene(id) {
      await page.waitForFunction(expected => window.tourAddonHost.scene() === expected, id);
      await page.waitForTimeout(150);
      assert.deepEqual(await page.evaluate(() => sceneChanges.splice(0)), [id]);
    }
    async function enterLobby() {
      await tapMap(54.2, 32.2);
      await expectScene('1');
    }
    await enterLobby();
    // A wall tap just outside the left jamb may walk to the nearest floor.
    await tapMap(57.5, 92);
    await page.waitForFunction(() => !window.tourAddonHost.position().moving);
    assert.equal(await page.evaluate(() => window.tourAddonHost.scene()), '1');

    for (const [x, y, touch] of [[63, 91, false], [63, 92.8, false], [58.4, 93, false], [67.6, 93, true]]) {
      await tapMap(x, y, touch);
      await expectScene('outdoor');
      assert.match(await page.locator('#scene-status').innerText(), /잔디마당/);
      await enterLobby();
    }
    await page.locator('#scene-stage').evaluate(stage => stage.parentElement.focus());
    await page.keyboard.down('ArrowDown');
    await expectScene('outdoor');
    await page.keyboard.up('ArrowDown');
    console.log('Central entrance passed desktop, touch, keyboard, adjacent wall and round-trip checks.');
  } finally {
    await browser.close();
  }
}

checkMovement();
if (process.argv.includes('--browser')) run().catch(error => { console.error(error); process.exitCode = 1; });
