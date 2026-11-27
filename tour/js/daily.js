/* =========================================================================
   픽셀 학교 투어 — 오늘의 도전
   날마다 게임 하나와 목표를 정해 줍니다. 서버 없이 날짜로만 고르므로, 같은 날 들어온 사람은 모두 같은 게임을 만납니다.
   - 게임 고르기: 2026-01-01부터 지난 날 수 × 7을 게임 수로 나눈 나머지 (게임 수와 7이 서로소면 모든 게임을 한 번씩 돈 뒤 반복).
   - 목표: 그 게임 별이 3개 미만이면 「★3 받기」, 이미 ★3이면 「내 최고 기록 넘기기」. 그날 처음 본 순간의 목표로 고정합니다.
   - 기록은 이 기기의 localStorage 'gch-tour-daily'에만 { day, id, kind, target, done, streak, lastDone } 꼴로 남깁니다 (개인정보 없음).
   - 화면: 지도 위 「오늘의 도전」 버튼, 도장판 맨 위, 게임 커버, 결과 화면 한 줄.
   ========================================================================= */
window.TourDaily = (() => {
  'use strict';
  const KEY = 'gch-tour-daily';
  const SKIP = new Set(['career']);   // 점수가 없는 테스트형 게임은 빼기
  const GAMES = window.TOUR_GAMES || {};

  const two = n => String(n).padStart(2, '0');
  const dayText = d => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
  const today = () => dayText(new Date());
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayText(d); };
  const dayNumber = () => {
    const d = new Date();
    return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 86400000);
  };

  function pool() {
    const games = window.tourGame?.progress()?.games || [];
    return [...new Set(games.map(g => g.id))].filter(id => GAMES[id] && !SKIP.has(id)).sort();
  }

  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      return saved && typeof saved === 'object' ? saved : {};
    } catch (e) { return {}; }
  }
  function write(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 저장 막혀도 오늘 화면은 그대로 */ }
  }

  /** 오늘의 도전 (없으면 만들어서 저장). 게임이 하나도 없으면 null */
  function current() {
    const state = read();
    const day = today();
    if (state.day === day && GAMES[state.id]) return state;
    const ids = pool();
    if (!ids.length) return null;
    const id = ids[(((dayNumber() * 7) % ids.length) + ids.length) % ids.length];
    const record = window.tourGame?.stamps()?.[id];
    const best = window.TourStarProgress.pointsOrNull(record?.bestScore);
    const goal = record && record.stars >= 3 && best !== null
      ? { kind: 'score', target: best + 1 }
      : { kind: 'stars', target: 3 };
    const next = { day, id, ...goal, done: false, streak: state.streak || 0, lastDone: state.lastDone || null };
    write(next);
    return next;
  }

  const n = v => Number(v).toLocaleString('ko-KR');
  function label(state) {
    if (state.kind === 'score') return `내 최고 ${n(state.target - 1)}${GAMES[state.id].scoreUnit || '점'} 넘기기`;
    return `★${state.target} 받기`;
  }
  /** 이어진 날 수 (어제나 오늘 성공했을 때만) */
  function streak(state) {
    return state.lastDone === today() || state.lastDone === yesterday() ? state.streak || 0 : 0;
  }

  /** 게임 커버용: 이 게임이 오늘의 도전이면 { label, done } */
  function goalFor(id) {
    const state = current();
    return state && state.id === id ? { label: label(state), done: !!state.done } : null;
  }

  /* ---------- 결과 화면: 성공 여부 한 줄 ---------- */
  document.addEventListener('tour:game-result', event => {
    const { id, stars = 0, points = null } = event.detail || {};
    const state = current();
    if (!state || state.id !== id) return;
    const met = state.kind === 'score' ? points !== null && points >= state.target : stars >= state.target;
    const firstTime = met && !state.done;
    if (firstTime) {
      state.streak = state.lastDone === yesterday() ? (state.streak || 0) + 1 : state.lastDone === today() ? state.streak : 1;
      state.lastDone = today();
      state.done = true;
      write(state);
      if (window.tourTrack) window.tourTrack('tour_daily_done', { game_id: id, streak: state.streak }, ['TourDaily', 'Done']);
    }
    const box = document.querySelector('#game-body .game-result');
    if (!box) return;
    const line = document.createElement('p');
    line.className = 'game-daily-result' + (state.done ? ' is-done' : '');
    const days = streak(state);
    line.textContent = state.done
      ? (firstTime ? '오늘의 도전 성공!' : '오늘의 도전은 이미 성공했어요') + (days >= 2 ? ` · ${days}일 연속` : '') + ' · 내일 새 도전이 열려요'
      : `오늘의 도전 · ${label(state)}까지 조금만 더!`;
    box.prepend(line);
    updateButton();
  });

  /* ---------- 도장판 맨 위 한 칸 ---------- */
  function boardItem(play) {
    const state = current();
    if (!state) return null;
    const game = GAMES[state.id];
    const item = document.createElement('li');
    item.className = 'stamp-floor stamp-daily' + (state.done ? ' is-done' : '');
    const head = document.createElement('h3');
    head.textContent = '오늘의 도전';
    const text = document.createElement('p');
    text.className = 'stamp-daily-text';
    const name = document.createElement('strong');
    name.textContent = game.title;
    const days = streak(state);
    const line = document.createElement('span');
    line.append(name, ` · ${label(state)}`);
    text.append(line);
    const meta = document.createElement('small');
    meta.textContent = state.done ? `성공!${days >= 2 ? ` ${days}일 연속` : ''} 내일 또 만나요` : days ? `${days}일 연속 도전 중` : '매일 새 게임이 정해져요';
    text.append(meta);
    item.append(head, text);
    const go = document.createElement('button');
    go.type = 'button';
    go.className = state.done ? 'btn' : 'btn btn-primary';
    go.textContent = state.done ? '한 번 더' : '도전하기';
    go.addEventListener('click', () => play(state.id));
    item.append(go);
    return item;
  }

  /* ---------- 지도 위 버튼 ---------- */
  const button = document.getElementById('daily-open');
  function updateButton() {
    if (!button) return;
    const state = current();
    button.hidden = !state;
    if (!state) return;
    button.classList.toggle('is-done', !!state.done);
    const short = GAMES[state.id].button.replace(/^[^\p{L}\p{N}]+\s*/u, '').replace(/ 도전$/, '');
    button.querySelector('.daily-name').textContent = state.done ? '성공!' : short;
    button.setAttribute('aria-label', `오늘의 도전, ${GAMES[state.id].title}, ${label(state)}${state.done ? ', 성공' : ''}`);
  }
  if (button) {
    button.addEventListener('click', () => {
      const state = current();
      if (!state) return;
      if (window.tourTrack) window.tourTrack('tour_daily_open', { game_id: state.id }, ['TourDaily', 'Open']);
      window.tourGame?.practice(state.id, button);
    });
    document.getElementById('game')?.addEventListener('close', updateButton);
    document.addEventListener('tour:stamps-reset', updateButton);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateButton);
    else updateButton();
  }

  return { current, goalFor, boardItem, label };
})();
