const assert = require('node:assert/strict');
const { mkdtemp, readFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

// 제공된 11월 HTML에서 파서가 사용하는 부분만 남긴 예문입니다.
function sample(month, next) {
  const [year, number] = month.split('-');
  const day = month + '-03';
  const date = day.replaceAll('-', '');
  const path = '/gunsan-gch/';
  const schedule = `<a class="tch-sel-mon" href="${path}M010401/list.do?y=${year}&amp;m=${Number(number)}">${number}월</a>
    <table class="tch-sch-tbl"><tr><td class="tch-d tue">3</td></tr></table>
    <ul class="tch-sch-lst"><li><dl><dt>${day.replaceAll('-', '.')}</dt>
    <dd class="tch-tit"><div class="tch-tit-wrap">- 학생독립운동기념일</div></dd>
    <dd class="tch-ctnt"></dd></dl></li></ul>`;
  const meal = `<a href="${path}M01040402/list.do?ymd=${next.replace('-', '')}01">다음월</a>
    <table class="tch-sch-tbl"><caption>이달의식단 - ${year}년 ${Number(number)}월</caption>
    <tr><td class="sun"><div><span>1</span></div></td><td class="tue tch-has">
    <div><a href="${path}M01040402/list.do?ymd=${date}"><span>3</span>
    <dl><dt>중식</dt><dd><ul><li>* 친환경발아현미밥</li>
    <li>* 가지&amp;꽈리고추볶음* (5.6.13.18)</li></ul></dd></dl></a></div></td></tr></table>`;
  return { schedule, meal };
}

async function checkSamples(directory, api) {
  const files = ['M010401.html', 'M01040402.html'].map(file => readFile(join(directory, file), 'utf8'));
  const [schedule, meal] = await Promise.all(files);
  const events = api.parseSchedule(schedule, '2026-11');
  const meals = api.parseMeals(meal, '2026-11');
  assert.equal(events.length, 10);
  assert.equal(events[0].name, '학생독립운동기념일');
  assert.equal(Object.keys(meals).length, 19);
  assert.deepEqual(meals['2026-11-02'].lunch.slice(0, 2), ['친환경발아현미밥', '한우맑은뭇국']);
}

async function run() {
  const api = await import('./fetch_school_feed.mjs');
  const before = new Date('2026-11-23T14:59:59Z');
  assert.deepEqual(api.targetMonths(before), ['2026-11']);
  assert.deepEqual(api.targetMonths(new Date(+before + 1000)), ['2026-11', '2026-12']);
  const now = new Date('2026-12-31T00:00:00Z');
  const dec = sample('2026-12', '2027-01');
  const jan = sample('2027-01', '2027-02');
  const links = api.nextLinks(dec, '2027-01');
  assert.equal(links.schedule, api.source.schedule.replace('index.do', 'list.do?y=2027&m=1'));
  assert.equal(links.meal, api.source.meal.replace('index.do', 'list.do?ymd=20270101'));
  const pages = new Map([
    [api.source.schedule, dec.schedule], [api.source.meal, dec.meal],
    [links.schedule, jan.schedule], [links.meal, jan.meal]
  ]);
  const requests = [];
  const feed = await api.collect(now, url => { requests.push(url); return pages.get(url); });
  assert.deepEqual(requests, [...pages.keys()]);
  assert.deepEqual(feed.months['2027-01'].events, [{ date: '2027-01-03', name: '학생독립운동기념일' }]);
  const lunch = ['친환경발아현미밥', '가지&꽈리고추볶음'];
  assert.deepEqual(feed.months['2026-12'].meals['2026-12-03'], { lunch });
  const group = dec.meal.match(/<dl>[\s\S]*?<\/dl>/)[0];
  const three = dec.meal.replace(group, ['조식', '중식', '석식'].map(type => group.replace('중식', type)).join(''));
  assert.deepEqual(api.parseMeals(three, '2026-12')['2026-12-03'], { breakfast: lunch, lunch, dinner: lunch });
  assert.throws(() => api.parseMeals(dec.meal, '2026-11'), /대상 월/);
  assert.throws(() => api.parseMeals(dec.meal.replace('중식', '알 수 없음'), '2026-12'), /급식 구분/);
  assert.throws(() => api.parseSchedule(dec.schedule.replace('tch-tit"', 'unknown"'), '2026-12'), /행사명/);

  const directory = await mkdtemp(join(tmpdir(), 'gch-feed-'));
  const output = join(directory, 'school-feed.json');
  try {
    assert.equal(await api.saveFeed(feed, output), true);
    const original = await readFile(output, 'utf8');
    assert.equal(await api.saveFeed({ ...feed, updatedAt: new Date().toISOString() }, output), false);
    const refresh = async () => api.saveFeed(await api.collect(now, url => pages.get(url)), output);
    pages.set(links.schedule, '<html>점검 중</html>');
    await assert.rejects(refresh, /학사일정/);
    pages.set(links.schedule, jan.schedule.replace(/<li>[\s\S]*?<\/li>/, ''));
    pages.set(links.meal, jan.meal.replace(/<td class="tue tch-has">[\s\S]*?<\/td>/, ''));
    await assert.rejects(refresh, /모두 비었습니다/);
    assert.equal(await readFile(output, 'utf8'), original);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
  if (process.argv[2]) await checkSamples(process.argv[2], api);
  console.log('달력 파싱, 급식 구분, 월말·연말, 중복 요청 방지, 실패·무변경 시 파일 보존 통과');
}

run().catch(error => { console.error(error); process.exitCode = 1; });
