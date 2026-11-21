// 실행 전 저장소 루트를 localhost:8080으로 제공합니다. 검사는 독립 브라우저 기록을 사용합니다.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const key = 'gch-tour-addons-v1';
const url = process.env.TOUR_URL || 'http://localhost:8080/tour/';
const point = id => `[data-addon-point="${id}"]`;
const slot = id => `[data-board-slot="${id}"]`;
const read = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
const scores = page => page.evaluate(() => window.tourGame.progress());
const menu = ['현미밥', '미역국', '계란찜', '시금치', '배추김치', '배', '우유'];
const feed = {
  updatedAt: '2026-11-20T21:00:00Z',
  months: {
    '2026-11': {
      events: [3, 23, 24, 25, 26, 27].map(day => ({
        date: '2026-11-' + String(day).padStart(2, '0'), name: day + '일 행사'
      })),
      meals: { '2026-11-23': { lunch: menu } }
    },
    '2026-12': { events: [], meals: { '2026-12-01': { lunch: ['보리밥'] } } }
  }
};
const feedRoute = '**/data/school-feed.json';

async function checkFeed(page) {
  await page.getByText('다음 급식: 11/23(월)').waitFor();
  assert.deepEqual(await page.locator('[data-feed-slot="meals"] li').allTextContents(), menu.slice(0, 6));
  assert.deepEqual(await page.locator('.board-dates li').allTextContents(),
    [23, 24, 25, 26].map(day => day + '일 ' + day + '일 행사'));
  // 갱신 날짜 문구는 표시하지 않음
  assert.equal(await page.getByText(/갱신/).count(), 0);
  for (const name of ['홈페이지 학사일정', '이달의 식단']) {
    assert.equal(await page.getByRole('link', { name }).getAttribute('target'), '_blank');
  }
}

async function checkMobile(page) {
  await page.setViewportSize({ width: 360, height: 740 });
  const cards = await page.locator('.board-slot').evaluateAll(elements =>
    elements.map(el => ({ x: el.offsetLeft, width: el.offsetWidth, overflow: el.scrollWidth - el.clientWidth })));
  assert.ok(cards[1].x > cards[0].x && cards[4].width > cards[0].width * 2);
  assert.ok(cards.every(card => card.overflow <= 1));
  assert.ok(await page.locator('.board-grid a').evaluateAll(links =>
    links.every(link => link.getBoundingClientRect().height >= 44)));
  await page.setViewportSize({ width: 1440, height: 920 });
}

async function checkPublicBoard(page) {
  await page.clock.setFixedTime(new Date('2026-11-22T03:00:00Z'));
  await page.route(feedRoute, route => route.fulfill({ json: feed }));
  await page.goto(url + '#floor-2');
  await page.locator(point('board')).click();
  await page.getByRole('heading', { name: '군산여상 게시판' }).waitFor();
  assert.equal(await page.locator('.board-slot').count(), 5);
  const data = await page.evaluate(() => window.TourBoardData);
  await checkFeed(page);
  await checkMobile(page);
  assert.equal(await page.locator('.board-posters img').count(), data.posters.images.length);
  await page.locator('.board-posters img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  // 인스타 계정: 주소 있는 계정은 버튼, 없는 계정은 「곧 열려요」
  const ready = data.instagram.accounts.filter(a => /^https?:\/\//i.test(a.url.trim())).length;
  assert.equal(await page.getByText('곧 열려요', { exact: true }).count(), data.instagram.accounts.length - ready);
  assert.equal(await page.getByRole('link', { name: '인스타 보기' }).count(), ready);
  assert.equal(await page.getByRole('link', { name: '홈페이지에서 보기' }).getAttribute('href'), '../index.html#careers');
  assert.equal(await page.locator('#board-pin').count(), 0);
  assert.equal(await page.locator(point('schedule')).count(), 0);
  await page.locator('#festival-close').click();
  await page.clock.setFixedTime(new Date('2026-11-22T16:00:00Z'));
  // 게시판 버튼을 누르지 않고 복도에서 벽으로 다시 걸어와도 열립니다.
  await page.evaluate(() => window.tourAddonHost.go('2', [68.6, 37], '복도'));
  await page.evaluate(() => window.tourAddonHost.go('2', [70.6, 32], '벽'));
  await page.getByRole('heading', { name: '군산여상 게시판' }).waitFor();
  await page.getByText('오늘 중식: 11/23(월)').waitFor();
  await page.locator('#festival-close').click();
  await page.clock.setFixedTime(new Date('2026-11-30T00:00:00Z'));
  await page.locator(point('board')).click();
  await page.getByText('다음 급식: 12/1(화)').waitFor();
  assert.match(await page.locator('.board-dates li').first().innerText(), /3일 행사/);
  await page.locator('#festival-close').click();
  await page.unroute(feedRoute);
  await page.route(feedRoute, route => route.abort('failed'));
  await page.locator(point('board')).click();
  await page.getByText(data.meals.fallback).waitFor();
  assert.deepEqual(await page.locator('.board-dates li').allTextContents(),
    data.events.rows.map(row => row.join(' ')));
  assert.equal(await page.getByText(/학교 홈페이지 · .* 갱신/).count(), 0);
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
  assert.deepEqual(await page.locator('[data-board-slot]').evaluateAll(buttons =>
    buttons.map(button => button.dataset.boardSlot)), ['events', 'posters', 'careers']);
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
