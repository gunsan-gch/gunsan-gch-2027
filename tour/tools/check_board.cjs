// 실행 전 저장소 루트를 localhost:8080으로 제공합니다. 검사는 독립 브라우저 기록을 사용합니다.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const key = 'gch-tour-addons-v1';
const url = process.env.TOUR_URL || 'http://localhost:8080/tour/';
const point = id => `[data-addon-point="${id}"]`;
const slot = id => `[data-board-slot="${id}"]`;
const read = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
const scores = page => page.evaluate(() => window.tourGame.progress());

async function checkPublicBoard(page) {
  await page.goto(url + '#floor-2');
  await page.locator(point('board')).click();
  await page.getByRole('heading', { name: '군산여상 게시판' }).waitFor();
  assert.equal(await page.locator('.board-slot').count(), 4);
  const data = await page.evaluate(() => window.TourBoardData);
  assert.equal(await page.locator('.board-dates li').count(), data.events.rows.length);
  assert.equal(await page.locator('.board-posters img').count(), data.posters.images.length);
  await page.locator('.board-posters img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  const instagramReady = /^https?:\/\//i.test(data.instagram.url.trim());
  assert.equal(await page.getByText('곧 열려요', { exact: true }).count(), instagramReady ? 0 : 1);
  assert.equal(await page.getByRole('link', { name: '인스타 보러 가기' }).count(), instagramReady ? 1 : 0);
  assert.equal(await page.getByRole('link', { name: '홈페이지에서 보기' }).getAttribute('href'), '../index.html#careers');
  assert.equal(await page.locator('#board-pin').count(), 0);
  assert.equal(await page.locator(point('schedule')).count(), 0);
  await page.locator('#festival-close').click();
  // 게시판 버튼을 누르지 않고 복도에서 벽으로 다시 걸어와도 열립니다.
  await page.evaluate(() => window.tourAddonHost.go('2', [68.6, 37], '복도'));
  await page.evaluate(() => window.tourAddonHost.go('2', [70.6, 32], '벽'));
  await page.getByRole('heading', { name: '군산여상 게시판' }).waitFor();
  await page.locator('#festival-close').click();
  await page.locator('[data-scene="3"]:visible').first().click();
  assert.equal(await page.locator(point('poster') + ' .addon-alert').count(), 0);
  await page.locator(point('poster')).click();
  await page.getByText('포스터 색을 고르는 중이야', { exact: true }).waitFor();
}

async function startFromOldSave(page) {
  await page.evaluate(key => {
    localStorage.setItem('gch-tour-stamps', JSON.stringify({ bakery: { stars: 2, at: '2026-11-14' } }));
    localStorage.setItem(key, JSON.stringify({
      started: true, ribbon: true, bread: true, poster: true, complete: true
    }));
  }, key);
  await page.reload();
  await page.locator(point('poster') + ' .addon-alert').waitFor();
  assert.deepEqual((await read(page)).board, { collected: [], pinned: [] });
  await page.locator(point('poster')).click();
  await page.getByRole('button', { name: '포스터 받고 시작하기' }).click();
  assert.deepEqual((await read(page)).board.collected, ['poster']);
  assert.match(await page.locator('#festival-open').innerText(), /게시판 미션 1\/3/);
  await page.locator('#festival-close').click();
  await page.locator('[data-scene="2"]:visible').first().click();
}

async function collectPapers(page) {
  for (const id of ['career', 'schedule']) {
    await page.locator(point(id)).click();
    await page.getByRole('button', { name: '가방에 넣기' }).click();
    const count = (await read(page)).board.collected.length;
    assert.equal(await page.locator('.board-inventory .is-got').count(), count);
    assert.equal(await page.locator(point(id)).count(), 0);
    await page.locator('#festival-close').click();
  }
  await page.locator(point('board')).click();
  await page.locator('#board-pin').click();
}

async function pinPapers(page) {
  await page.locator('[data-board-sheet="schedule"]').click();
  await page.locator(slot('careers')).click();
  assert.equal(await page.locator('.wrong-slot').count(), 1);
  assert.deepEqual((await read(page)).board.pinned, []);
  await page.locator(slot('events')).click();
  assert.deepEqual((await read(page)).board.pinned, ['schedule']);
  await page.reload();
  await page.locator(point('board')).click();
  await page.locator('#board-pin').click();
  assert.equal(await page.locator('[data-board-sheet]').count(), 2);
  await page.locator(slot('posters')).click();
  await page.locator(slot('careers')).click();
  await page.getByText('칭호 · 게시판 지킴이').waitFor();
  assert.equal(await page.locator('.board-slot.is-pinned').count(), 3);
  assert.match(await page.locator('#festival-open').innerText(), /미션 완료/);
  await page.locator('#festival-close').click();
  await page.reload();
  assert.equal(await page.locator(point('board') + ' img').getAttribute('src'), 'img/board/filled.png');
}

async function resetMissions(page) {
  await page.locator('#festival-open').click();
  await page.locator('#addon-quest-reset').click();
  await page.locator('#addon-reset-yes').click();
  await page.getByRole('heading', { name: '녹원예술제 준비 대작전' }).waitFor();
  const state = await read(page);
  for (const field of ['started', 'complete', 'ribbon', 'bread', 'poster']) assert.equal(state[field], false);
  assert.deepEqual(state.board, { collected: [], pinned: [] });
  assert.equal(await page.locator(point('board') + ' img').getAttribute('src'), 'img/board/empty.png');
}

async function run() {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 920 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await checkPublicBoard(page);
    await startFromOldSave(page);
    const before = await scores(page);
    await collectPapers(page);
    await pinPapers(page);
    await resetMissions(page);
    assert.deepEqual(await scores(page), before);
    assert.deepEqual(errors, []);
    console.log('상시 게시판, 옛 저장본, 송현 미션, 붙이기·이어하기, 칭호, 두 미션 초기화 통과');
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
