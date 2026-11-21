import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

export const source = {
  schedule: 'https://school.jbedu.kr/gunsan-gch/M010401/index.do',
  meal: 'https://school.jbedu.kr/gunsan-gch/M01040402/index.do'
};
const destination = fileURLToPath(new URL('../data/school-feed.json', import.meta.url));
const entities = { amp: '&', nbsp: ' ', lt: '<', gt: '>', quot: '"', apos: "'" };

function requireData(value, message) {
  if (!value) throw new Error(message);
  return value;
}

function plain(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&(amp|nbsp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, (_, entity) => {
    if (entity[0] !== '#') return entities[entity.toLowerCase()];
    return String.fromCodePoint(Number(entity.slice(1).replace(/^x/i, '0x')));
  }).replace(/\s+/g, ' ').trim();
}

function calendar(html) {
  return requireData(html.match(/<table\b[^>]*class=["']tch-sch-tbl["'][^>]*>([\s\S]*?)<\/table>/i),
    '월별 달력 표를 찾을 수 없습니다.')[1];
}

function selectedSchedule(html) {
  const tag = requireData(html.match(/<a\b[^>]*\bclass=["']tch-sel-mon["'][^>]*>/i),
    '선택된 학사일정 월을 찾을 수 없습니다.')[0];
  return calendarLink(tag, source.schedule);
}

function calendarLink(tag, base) {
  const href = requireData(tag.match(/\bhref=["']([^"']+)["']/i), '달력 이동 주소가 없습니다.')[1];
  const url = new URL(plain(href), base);
  requireData(url.origin === new URL(base).origin && url.pathname === new URL('list.do', base).pathname,
    '달력 이동 주소가 변경되었습니다.');
  return url;
}

function checkDate(date, month) {
  const value = new Date(date + 'T00:00:00Z');
  requireData(date.startsWith(month + '-') && Number.isFinite(+value) && value.toISOString().startsWith(date + 'T'),
    '달력 날짜가 대상 월과 일치하지 않습니다.');
  return date;
}

export function parseSchedule(html, month) {
  const params = selectedSchedule(html).searchParams;
  requireData(params.get('y') + '-' + String(params.get('m')).padStart(2, '0') === month,
    '학사일정의 대상 월이 다릅니다.');
  const table = calendar(html);
  const list = requireData(html.match(/<ul\s+class=["']tch-sch-lst["'][^>]*>([\s\S]*?)<\/ul>/i),
    '학사일정 목록 구조가 변경되었습니다.')[1];
  const events = [];
  for (const [, row] of list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const day = requireData(row.match(/<dt>(\d{4}\.\d{2}\.\d{2})<\/dt>/), '행사 날짜가 없습니다.')[1];
    const titles = [...row.matchAll(/<dd\s+class=["']tch-tit["'][^>]*>([\s\S]*?)<\/dd>/gi)];
    requireData(titles.length, '행사명 칸이 없습니다.');
    for (const [, title] of titles) {
      const name = requireData(plain(title).replace(/^-\s*/, ''), '행사명이 비었습니다.');
      events.push({ date: checkDate(day.replaceAll('.', '-'), month), name });
    }
  }
  if (!events.length) {
    requireData(/class=["']tch-d\s/.test(table) && !/\d{4}\.\d{2}\.\d{2}|class=["']abox["']/.test(table),
      '빈 행사 목록을 달력과 대조할 수 없습니다.');
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

const types = { 조식: 'breakfast', 중식: 'lunch', 석식: 'dinner' };

function parseMenu(cell) {
  const meals = {};
  const groups = [...cell.matchAll(/<dt\b[^>]*>\s*([^<]+?)\s*<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi)];
  requireData(groups.length && groups.length === (cell.match(/<dd\b/gi) || []).length,
    '급식 구분이나 메뉴 칸이 없습니다.');
  for (const [, label, items] of groups) {
    const type = requireData(types[label], '급식 구분이 변경되었습니다.');
    const menu = [...items.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(([, item]) =>
      plain(item).replace(/\([\d.\s]+\)|\*/g, '').replace(/\s+/g, ' ').trim());
    requireData(menu.length && menu.every(Boolean) && !meals[type], '급식 메뉴 구조가 변경되었습니다.');
    meals[type] = menu;
  }
  return meals;
}

export function parseMeals(html, month) {
  const table = calendar(html);
  const caption = requireData(table.match(/<caption>\s*이달의식단\s*-\s*(\d{4})년\s*(\d+)월\s*<\/caption>/),
    '식단 달력 제목이 변경되었습니다.');
  requireData(caption[1] + '-' + caption[2].padStart(2, '0') === month, '식단의 대상 월이 다릅니다.');
  const meals = {};
  const cells = [...table.matchAll(/<td\b[^>]*>[\s\S]*?<\/td>/gi)];
  requireData(cells.length && /<span>\s*\d{1,2}\s*<\/span>/.test(table), '식단 달력의 날짜 칸이 없습니다.');
  for (const [cell] of cells) {
    if (!/tch-has|<a\b|<dl\b|<li\b/i.test(cell)) {
      requireData(/^\d{0,2}$/.test(plain(cell)), '식단 칸의 구조가 변경되었습니다.');
      continue;
    }
    const day = requireData(cell.match(/[?&]ymd=(\d{4})(\d{2})(\d{2})["'&]/), '급식 날짜가 없습니다.');
    const date = checkDate(day.slice(1).join('-'), month);
    requireData(!meals[date], '급식 날짜가 중복됩니다.');
    meals[date] = parseMenu(cell);
  }
  return meals;
}

export function targetMonths(now) {
  const date = new Date(now.getTime() + 9 * 3600000);
  const month = date.toISOString().slice(0, 7);
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  return next - date <= 7 * 86400000 ? [month, next.toISOString().slice(0, 7)] : [month];
}

export function nextLinks(pages, month) {
  // 연말에는 현재 링크의 연도도 함께 넘깁니다.
  const schedule = selectedSchedule(pages.schedule);
  const [year, number] = month.split('-');
  schedule.searchParams.set('y', year);
  schedule.searchParams.set('m', String(Number(number)));
  const next = requireData(pages.meal.match(/<a\b[^>]*>\s*다음월\s*<\/a>/i), '다음 달 식단 링크가 없습니다.');
  const meal = calendarLink(next[0], source.meal);
  requireData(meal.searchParams.get('ymd') === year + number + '01', '다음 달 식단 날짜가 다릅니다.');
  return { schedule: schedule.href, meal: meal.href };
}

async function fetchPage(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'gch-tour-feed' }, signal: AbortSignal.timeout(20000) });
  requireData(response.ok, '학교 홈페이지 응답 오류 ' + response.status);
  return response.text();
}

export async function collect(now, get = fetchPage) {
  const months = {};
  let pages;
  for (const month of targetMonths(now)) {
    const links = pages ? nextLinks(pages, month) : source;
    const [schedule, meal] = await Promise.all([get(links.schedule), get(links.meal)]);
    pages = { schedule, meal };
    const events = parseSchedule(schedule, month);
    const meals = parseMeals(meal, month);
    requireData(events.length || Object.keys(meals).length, month + ' 행사와 급식이 모두 비었습니다.');
    months[month] = { events, meals };
  }
  return { updatedAt: now.toISOString(), source, months };
}

export async function saveFeed(feed, path = destination) {
  let previous;
  try {
    previous = JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (previous && Number.isFinite(Date.parse(previous.updatedAt)) &&
      isDeepStrictEqual(previous.source, feed.source) && isDeepStrictEqual(previous.months, feed.months)) return false;
  await mkdir(dirname(path), { recursive: true });
  const temporary = path + '.' + process.pid + '.tmp';
  try {
    await writeFile(temporary, JSON.stringify(feed, null, 2) + '\n', 'utf8');
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const feed = await collect(new Date());
    console.log(await saveFeed(feed) ? '학교 일정·급식을 갱신했습니다.' : '학교 일정·급식에 변경이 없습니다.');
  } catch (error) {
    console.error('학교 일정·급식 갱신 실패. 기존 파일을 유지합니다.', error.cause?.message || error.message);
    process.exitCode = 1;
  }
}
