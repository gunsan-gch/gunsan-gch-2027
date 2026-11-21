/* 실행 중인 로컬 서버에서 22개 게임의 모바일 공통 UI를 확인한다. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const ids = ['cafe', 'ai', 'typing', 'rain', 'bakery', 'career', 'cashier', 'phishing', 'interview', 'stairs', 'melody', 'curling', 'target', 'badminton', 'press', 'logistics', 'reconcile', 'bookshop', 'tea', 'booths', 'goods', 'paperplane'];
const output = process.env.UI_AUDIT_OUT || path.join(require('node:os').tmpdir(), 'tour-ui-audit');
fs.mkdirSync(output, { recursive: true });

async function inspect(page, id, phase) {
  const result = await page.locator('#game').evaluate(root => {
    const visible = node => node.getBoundingClientRect().width && node.getBoundingClientRect().height && getComputedStyle(node).visibility !== 'hidden';
    const controls = [...root.querySelectorAll('button, input[type="range"]')].filter(visible);
    const small = controls.filter(node => { const r = node.getBoundingClientRect(); return r.width < 43.99 || r.height < 43.99; });
    const labels = nodes => nodes.map(node => ({ text: node.textContent.trim(), cls: node.className, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height }));
    const fonts = [...root.querySelectorAll('*')].filter(visible).filter(node => [...node.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(node).fontSize) < 12);
    const navy = getComputedStyle(root).getPropertyValue('--navy').trim();
    const swatch = document.createElement('span'); swatch.style.color = navy; root.append(swatch);
    const primaryColor = getComputedStyle(swatch).color; swatch.remove();
    const wrongColors = controls.filter(node => node.classList.contains('btn') && getComputedStyle(node).backgroundColor !== (node.classList.contains('btn-primary') ? primaryColor : 'rgb(255, 255, 255)') && !node.matches(':hover'));
    return {
      small: labels(small), smallText: labels(fonts),
      fadedEnabled: labels(controls.filter(node => !node.disabled && +getComputedStyle(node).opacity < 1)),
      wrongColors: labels(wrongColors),
      brokenKorean: /\?\?|�/.test(root.innerText),
      overflow: root.querySelector('.game-body').scrollWidth > root.querySelector('.game-body').clientWidth,
      cards: [...root.querySelectorAll('.senior-card')].map(card => ({ portrait: card.querySelector('img')?.getBoundingClientRect().width, name: card.querySelector('strong,b')?.textContent })),
      sound: [...root.querySelectorAll('.sound-toggle')].filter(visible).map(node => ({ pressed: node.getAttribute('aria-pressed'), label: node.getAttribute('aria-label'), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height, inHead: !!node.closest('.game-head') }))
    };
  });
  return { id, phase, ...result };
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
  const results = [], errors = [];
  for (const id of ids) {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push({ id, message: error.message }));
    page.on('console', message => { if (message.type() === 'error' && !message.text().includes('net::ERR_')) errors.push({ id, message: message.text() }); });
    await page.goto(`http://localhost:8080/tour/?game=${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#game[open]');
    if (await page.locator('#game-body').innerText() === '게임을 불러오지 못했어요. 창을 닫고 다시 열어 주세요.') {
      errors.push({ id, message: '게임 시작 실패' }); await page.close(); continue;
    }
    await page.screenshot({ path: path.join(output, id + '.png') });
    results.push(await inspect(page, id, 'open'));
    const starts = { stairs: '.stairs-start', melody: '.melody-practice', curling: '[data-action="start"]', target: '[data-action="start"]', badminton: '[data-action="start"]', press: '.press-start', reconcile: '.reconcile > .btn', paperplane: '.pp-launch' };
    if (starts[id]) {
      await page.locator(starts[id]).click();
      results.push(await inspect(page, id, 'playing'));
      await page.screenshot({ path: path.join(output, id + '-playing.png') });
    }
    const sound = page.locator('.sound-toggle:visible');
    if (await sound.count()) {
      const before = await sound.getAttribute('aria-pressed');
      await sound.click();
      if (before === await sound.getAttribute('aria-pressed')) errors.push({ id, message: '소리 버튼 상태가 바뀌지 않음' });
    }
    console.log(id + ' 확인');
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ results, errors }, null, 2));
  const failed = results.filter(r => r.small.length || r.smallText.length || r.fadedEnabled.length || r.wrongColors.length || r.brokenKorean || r.overflow);
  console.log(JSON.stringify({ games: ids.length, states: results.length, errors, failed, output }, null, 2));
  if (failed.length || errors.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
