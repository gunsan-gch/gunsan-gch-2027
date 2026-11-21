const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { levels, makeMap, grade, reward } = require('../js/game-booths.js');

function seeded(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

function checkRules() {
  assert.deepEqual(levels.map(level => level.size), [4, 4, 5]);
  assert.deepEqual(levels.map(level => level.booths.length), [3, 5, 6]);
  let points = 0;
  for (const level of levels) {
    const map = makeMap(level, seeded(19));
    assert.deepEqual(map, makeMap(level, seeded(19)));
    assert.notDeepEqual(map, makeMap(level, seeded(98765)));
    assert.equal(map.length, level.size ** 2);
    assert.deepEqual(map.filter(Boolean).sort(), [...level.booths].sort());
    points += grade(map, map.slice());

    // 빈칸에 옮긴 경우와 서로 다른 두 부스를 맞바꾼 경우를 구별한다.
    const wrong = map.slice();
    const first = wrong.indexOf('food'), second = wrong.indexOf('craft');
    [wrong[first], wrong[second]] = [wrong[second], wrong[first]];
    assert.equal(grade(map, wrong), level.booths.length - 2);
    wrong[wrong.indexOf(null)] = wrong[first];
    wrong[first] = null;
    assert.equal(grade(map, wrong), level.booths.length - 2);
  }
  assert.equal(points, 14);
  assert.equal(reward(points, false), 3);
  assert.equal(reward(points, true), 2);
  assert.equal(reward(10, false), 2);
  assert.equal(reward(9, false), 1);
  assert.equal(reward(0, true), 1);
  console.log('무작위 배치, 중복 부스, 오답 채점, 별 기준 통과');
}

// --browser 옵션은 실제 투어 창에서 터치, 타이머, 결과와 도장 저장까지 검사한다.
async function play(browser, mode, width) {
  const page = await browser.newPage({
    viewport: { width, height: width === 320 ? 568 : 844 }, hasTouch: true,
    reducedMotion: mode === 'hint' ? 'reduce' : 'no-preference'
  });
  try {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = process.env.BOOTHS_URL || pathToFileURL(path.resolve(__dirname, '../index.html')).href + '?game=booths';
    await page.goto(url);
    const action = key => page.locator(`.bo-game [data-act="${key}"]`);
    const cell = i => page.locator(`.bo-grid [data-cell="${i}"]`);
    const card = type => page.locator(`.bo-tray [data-type="${type}"]`);
    await action('start').waitFor();
    await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2030-01-01T00:01:00Z'));
    await action('start').tap();
    for (const [index, level] of levels.entries()) {
      const cells = page.locator('.bo-grid .bo-cell');
      const answer = await cells.evaluateAll(nodes => nodes.map(node =>
        node.querySelector('img')?.src.split('/').pop().split('.')[0] || null));
      assert.equal(answer.length, level.size ** 2);
      assert.deepEqual(answer.filter(Boolean).sort(), [...level.booths].sort());
      await page.clock.fastForward(2999);
      assert.ok(await page.locator('.bo-time').isVisible());
      await page.clock.fastForward(1);
      assert.equal(await page.locator('.bo-grid img').count(), 0);
      assert.ok(await action('check').isDisabled());
      const fits = await page.locator('#game-body').evaluate(body => {
        const buttons = [...body.querySelectorAll('button')].filter(b => b.offsetWidth);
        return body.scrollWidth <= body.clientWidth && buttons.every(b => b.offsetWidth >= 44 && b.offsetHeight >= 44);
      });
      assert.ok(fits, '지도와 버튼이 휴대폰 너비와 터치 크기에 맞아야 한다');

      const first = answer.findIndex(Boolean);
      await card(answer[first]).tap();
      await cell(first).tap();
      await cell(first).tap();
      assert.equal(await page.locator('.bo-grid img').count(), 0);
      if (mode === 'hint' && index === 0) {
        await cell(first).tap();
        await action('hint').tap();
        await page.clock.fastForward(1499);
        assert.equal(await page.locator('.bo-grid img').count(), level.booths.length);
        await page.clock.fastForward(1);
        assert.equal(await page.locator('.bo-grid img').count(), 1);
        await cell(first).tap();
      }
      if (mode === 'hint') assert.ok(await action('hint').isDisabled());

      const empty = answer.flatMap((type, i) => type ? [] : [i]);
      for (const [i, type] of answer.entries()) {
        if (!type) continue;
        await card(type).tap();
        await cell(mode === 'wrong' ? empty.shift() : i).tap();
      }
      await action('check').tap();
      if (mode === 'wrong') {
        assert.equal(await page.locator('.bo-cross').count(), level.booths.length);
        assert.equal(await page.locator('.bo-answer').count(), level.booths.length);
        assert.deepEqual(await cells.allTextContents(), answer.map((type, i) =>
          type ? ({ food: '분식', craft: '공예', photo: '사진', stage: '무대' })[type] :
            empty.includes(i) ? '' : '×'));
      } else {
        assert.match(await page.locator('.bo-guide').innerText(), /완벽!/);
      }
      await page.clock.fastForward(3000);
      assert.ok(await page.locator('.bo-grid').isHidden());
      await action('next').tap();
    }
    const stars = { perfect: 3, hint: 2, wrong: 1 }[mode];
    const points = mode === 'wrong' ? 0 : 14;
    assert.equal(await page.locator('.game-result-score').innerText(), `총 별 ${stars} / 3`);
    assert.match(await page.locator('.game-result').innerText(), new RegExp(`부스 ${points} / 14개 정답`));
    if (mode === 'hint') assert.match(await page.locator('.game-result').innerText(), /다시 보기 사용 \(최대 별 2개\)/);
    const stamp = await page.evaluate(() => JSON.parse(localStorage.getItem('gch-tour-stamps')).booths);
    assert.equal(stamp.stars, stars);
    assert.equal(stamp.bestScore, points);
    assert.deepEqual(errors, []);
    console.log(`${width}px 터치 · ${mode} · 별 ${stars}개 / ${points}점 도장 저장 통과`);
  } finally {
    await page.close();
  }
}

async function checkBrowser() {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  try {
    for (const [mode, width] of [['perfect', 390], ['hint', 320], ['wrong', 360]]) {
      await play(browser, mode, width);
    }
  } finally {
    await browser.close();
  }
}

checkRules();
if (process.argv.includes('--browser')) checkBrowser().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
