/* =========================================================================
   픽셀 학교 투어 — 체험 게임 틀
   게임 창(<dialog id="game">) 열기·닫기, 공통 결과 화면, 도장 저장(localStorage), 방문 분석 이벤트를 맡습니다.
   게임 본체는 js/game-○○.js 파일에서 아래처럼 등록합니다 (이 파일 다음에 불러옴).

     window.TOUR_GAMES.cafe = {
       title: '음료 만들기 체험',          // 게임 창 제목
       button: '☕ 음료 만들기 체험',      // 공간 상세 창의 버튼 문구
       naver: 'Cafe',                      // 네이버 이벤트 값 앞글자 (영문·숫자만) → CafeStart · CafeDone · CafeDept
       maxStars: 3,                        // 받을 수 있는 최고 별 수 (모든 게임 3개로 통일)
       stamp: '카페실습실 도장 획득!',      // 결과 화면의 도장 문구
       message: '카페비즈과에서는 …',       // 결과 화면 안내 문구
       cta: { href: '../index.html#cafe', label: '카페비즈과 알아보기 →' },   // 결과 화면의 학과 링크
       start(container, api) { … return cleanup; }
     };

   start()는 container 안에 화면을 만들고, 다 끝나면 api.done({ stars, hints })를 부릅니다.
   api.done({ stars, hints, extra })의 extra는 별 줄 위에 넣을 DOM 요소입니다 (선택).
   api.announce(text)는 화면 읽기 프로그램용 안내, api.reducedMotion은 '움직임 줄이기' 설정 여부입니다.
   돌려준 함수(cleanup)는 창을 닫을 때 불려 타이머 등을 정리합니다 (없어도 됨).

   공간 데이터(tour-data.js)에 game: 'cafe' 를 적으면 그 공간의 상세 창에 버튼이 생기고,
   tour/index.html?game=cafe 로 들어오면 바로 열립니다.

   지도 위 [🎮 도장 n / m] 버튼은 도장판(<dialog id="stamps">)을 엽니다 — 게임이 있는 공간과 모은 도장·별을 보여 주고 바로 도전할 수 있습니다.
   도장은 localStorage 'gch-tour-stamps'에 { cafe: { stars: 2, at: '2026-11-14' } } 꼴로, 최고 별 수만 남깁니다.
   이름·연락처 같은 개인정보는 받지 않고, 서버로 보내는 것도 없습니다.
   ========================================================================= */

window.TOUR_GAMES = window.TOUR_GAMES || {};

window.tourGame = (() => {
  const GAMES = window.TOUR_GAMES;
  const STAMP_KEY = 'gch-tour-stamps';
  const STAMP_ART = new Set(['bakery', 'typing', 'cafe', 'cashier', 'rain', 'ai', 'career', 'phishing', 'interview', 'stairs', 'melody', 'curling', 'target', 'badminton', 'press', 'logistics', 'reconcile', 'bookshop', 'tea', 'booths']);
  function stampArt(id, className) {
    const seal = document.createElement('span');
    seal.className = className;
    seal.setAttribute('aria-hidden', 'true');
    if (!STAMP_ART.has(id)) { seal.textContent = '★'; return seal; }
    const img = document.createElement('img');
    img.width = 48; img.height = 48; img.alt = '';
    img.src = `img/games/stamps/${id}.png?v=20261118`;
    img.addEventListener('error', () => { seal.textContent = '★'; }, { once: true });
    seal.append(img);
    return seal;
  }
  const dialog = document.getElementById('game');
  if (!dialog) return null;

  const $ = selector => dialog.querySelector(selector);
  const titleEl = $('#game-title');
  const roomEl = $('#game-room');
  const body = $('#game-body');
  const status = $('#game-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = null;   // 진행 중인 게임 { id, game, roomName, cleanup, finished }
  let opener = null;    // 게임을 연 버튼·이름표 — 닫을 때 초점을 되돌림

  /* ---------- 도장 저장 (저장이 막힌 브라우저에서도 게임은 그대로) ---------- */

  const today = () => {
    const d = new Date();
    const two = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
  };

  function readStamps() {
    try {
      const stamps = JSON.parse(localStorage.getItem(STAMP_KEY) || '{}');
      if (!stamps || typeof stamps !== 'object' || Array.isArray(stamps)) return {};
      return Object.fromEntries(Object.entries(stamps).filter(([, value]) => value && typeof value === 'object').map(([id, value]) =>
        [id, { ...value, stars: window.TourStarProgress.normalizeStars(value.stars, GAMES[id]?.maxStars || 3) }]));
    } catch (e) { return {}; }
  }

  /** 최고 별 수만 남김. 돌려주는 값은 저장된(=최고) 기록 */
  function saveStamp(id, stars, max) {
    const stamps = readStamps();
    const best = stamps[id];
    stars = window.TourStarProgress.normalizeStars(stars, max || 3);
    if (!best || stars > (best.stars || 0)) stamps[id] = { stars, at: today() };
    try { localStorage.setItem(STAMP_KEY, JSON.stringify(stamps)); } catch (e) { /* 저장 못 해도 게임은 계속 */ }
    return stamps[id];
  }

  /* ---------- 화면 읽기 프로그램 안내 ---------- */

  let announceTimer = 0;
  function announce(text) {
    status.textContent = '';   // 같은 문장도 다시 읽히도록 비웠다가 넣음
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { status.textContent = text; }, 40);
  }

  /* ---------- 열기 ---------- */

  function open(id, room = null, from = null) {
    const game = GAMES[id];
    if (!game || dialog.open) return false;
    const roomName = room?.name || game.room || '';
    opener = from;
    current = { id, game, roomName, cleanup: null, finished: false };
    titleEl.textContent = game.title;
    roomEl.textContent = roomName;
    dialog.classList.remove('is-result');
    body.replaceChildren();
    status.textContent = '';
    tourTrack('tour_game_start', { game_id: id, room_name: roomName }, ['TourGame', game.naver + 'Start']);
    dialog.showModal();
    document.body.classList.add('game-open');
    const session = current;
    try {
      current.cleanup = game.start(body, {
        done: result => finish(session, result),
        announce,
        reducedMotion,
        switchGame: next => switchGame(session, next),
        close: () => dialog.close()
      }) || null;
    } catch (e) {
      body.textContent = '게임을 불러오지 못했어요. 창을 닫고 다시 열어 주세요.';
      console.error(e);
    }
    return true;
  }

  // Switching sports follows the same close/cleanup lifecycle as a replay.
  function switchGame(session, next) {
    if (session !== current || session.transitioning || !GAMES[next]) return false;
    session.transitioning = true;
    const from = opener;
    dialog.addEventListener('close', () => open(next, { name: GAMES[next].room || session.roomName }, from), { once: true });
    dialog.close();
    return true;
  }

  /* ---------- 끝: 결과 화면 ---------- */

  function finish(session, { stars = 0, hints = 0, extra = null } = {}) {
    if (session !== current || session.finished) return;
    session.finished = true;
    const { id, game } = session;
    const max = game.maxStars || stars;
    tourTrack('tour_game_complete', { game_id: id, stars, hints }, ['TourGame', game.naver + 'Done']);
    const best = saveStamp(id, stars, max);
    renderResult(session, stars, max, best, extra);
    document.dispatchEvent(new CustomEvent('tour:game-result', { detail: { id } }));
  }

  function renderResult(session, stars, max, best, extra) {
    const { id, game } = session;
    try { session.cleanup?.(); } catch (e) { /* 정리 중 오류는 무시 */ }
    session.cleanup = null;
    dialog.classList.add('is-result');
    body.replaceChildren();

    const box = document.createElement('div');
    box.className = 'game-result';

    const starRow = document.createElement('p');
    starRow.className = 'game-result-stars';
    starRow.setAttribute('role', 'img');
    starRow.setAttribute('aria-label', `별 ${max}개 중 ${stars}개`);
    starRow.textContent = '★'.repeat(stars) + '☆'.repeat(Math.max(0, max - stars));

    const score = document.createElement('p');
    score.className = 'game-result-score';
    score.textContent = `총 별 ${stars} / ${max}`;

    const stamp = document.createElement('div');
    stamp.className = 'game-stamp';
    stamp.append(stampArt(id, 'game-stamp-seal'), document.createElement('strong'));
    stamp.querySelector('strong').textContent = game.stamp || '도장 획득!';

    const message = document.createElement('p');
    message.className = 'game-result-text';
    message.textContent = game.message || '';

    if (extra) box.append(extra);
    box.append(starRow, score, stamp, message);
    if (best && best.stars > stars) {
      const note = document.createElement('p');
      note.className = 'game-result-best';
      note.textContent = `지금까지 최고 기록은 별 ${best.stars}개예요 (${best.at}).`;
      box.append(note);
    }

    const actions = document.createElement('div');
    actions.className = 'game-result-actions';

    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn';
    retry.textContent = '다시 하기';
    retry.addEventListener('click', () => {
      const from = opener;
      // close 이벤트는 한 박자 뒤에 오므로, 정리가 끝난 다음에 새로 엽니다
      dialog.addEventListener('close', () => open(id, { name: session.roomName }, from), { once: true });
      dialog.close();
    });

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'btn';
    back.textContent = '투어로 돌아가기';
    back.addEventListener('click', () => dialog.close());

    actions.append(retry);
    if (game.nextGame && GAMES[game.nextGame]) {
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn';
      next.textContent = '다음 체험 · ' + GAMES[game.nextGame].title;
      next.addEventListener('click', () => {
        const from = opener;
        dialog.addEventListener('close', () => practice(game.nextGame, from), { once: true });
        dialog.close();
      });
      actions.append(next);
    }
    if (game.hub && GAMES[game.hub]) {
      const choose = document.createElement('button');
      choose.type = 'button'; choose.className = 'btn btn-primary'; choose.textContent = '다른 종목 도전';
      choose.addEventListener('click', () => switchGame(session, game.hub));
      actions.append(choose);
    }
    if (game.cta) {
      const cta = document.createElement('a');
      cta.className = 'btn btn-primary';
      cta.href = game.cta.href;
      cta.textContent = game.cta.label;
      // 같은 탭에서 이동하므로 beacon으로 보내 페이지가 바뀌어도 이벤트가 남게 함
      const trackCta = e => {
        if (e.type === 'auxclick' && e.button !== 1) return;
        tourTrack('tour_game_cta', { game_id: id, cta: 'dept', transport_type: 'beacon' }, ['TourGame', game.naver + 'Dept']);
      };
      cta.addEventListener('click', trackCta);
      cta.addEventListener('auxclick', trackCta);
      actions.append(cta);
    }
    actions.append(back);
    box.append(actions);
    const count = updateStampCount();
    if (board && count.total) {   // 모은 도장 수 + 도장판으로 가는 버튼
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'game-result-board';
      more.textContent = `🎮 모은 도장 ${count.got} / ${count.total} · 도장판 보기`;
      more.addEventListener('click', () => {
        dialog.addEventListener('close', openBoard, { once: true });
        dialog.close();
      });
      box.append(more);
    }
    body.append(box);
    checkAllStamps(count);

    announce(`끝났어요. 별 ${max}개 중 ${stars}개. ${game.stamp || '도장 획득!'} ${game.message || ''}`);
    retry.focus({ preventScroll: true });
  }

  /* ---------- 닫기 (Esc · ✕ · 결과 화면 버튼) — 진행 중에 닫아도 정리만 하고 끝 ---------- */

  $('#game-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    const session = current;
    current = null;
    try { session?.cleanup?.(); } catch (e) { /* 정리 중 오류는 무시 */ }
    body.replaceChildren();
    dialog.classList.remove('is-result');
    document.body.classList.remove('game-open');
    const back = opener?.isConnected ? opener : document.getElementById('scene-scroll');
    opener = null;
    back?.focus({ preventScroll: true });
  });

  /* ---------- 주소로 바로 열기: ?game=cafe (층 이동은 tour.js가 먼저 해 둠) ---------- */

  // 게임 본체(game-○○.js)는 이 파일 뒤에 등록되므로, 모든 스크립트가 실행된 뒤에 엽니다.
  const openFromAddress = () => {
    const wanted = new URLSearchParams(location.search).get('game');
    if (!wanted || !GAMES[wanted]) return;
    const rooms = Object.values(window.TOUR_SCENES || {}).flatMap(scene => scene.rooms || []);
    open(wanted, rooms.find(r => r.game === wanted || r.games?.includes(wanted)) || null, null);
  };
  /* ---------- 도장판 (스탬프 투어): 게임이 있는 공간과 모은 도장을 한눈에 ---------- */

  const board = document.getElementById('stamps');
  const boardButton = document.getElementById('stamp-open');
  const resetButton = document.getElementById('stamps-reset');
  const resetPanel = document.getElementById('stamps-reset-panel');
  const resetStatus = document.getElementById('stamps-reset-status');
  const ALL_DONE_KEY = 'gch-tour-stamps-done';   // 도장을 다 모은 것을 한 번만 집계하기 위한 표시

  /** 게임이 있는 공간 목록 (층 순서) */
  function stampRooms() {
    const scenes = window.TOUR_SCENES || {};
    return (window.TOUR_ORDER || Object.keys(scenes)).flatMap(sceneId => (scenes[sceneId]?.rooms || [])
      .flatMap(room => (room.games || (room.game ? [room.game] : []))
        .filter(id => GAMES[id] && !GAMES[id].isHub)
        .map(id => ({ room: { ...room, game: id }, sceneId, floor: scenes[sceneId].name, game: GAMES[id] }))));
  }

  /** Highest stars across playable rooms; never accumulates repeat attempts. */
  function progress() {
    return window.TourStarProgress.summarize(readStamps(), stampRooms().map(item => ({
      id: item.room.game, title: item.game.title, room: item.room.name,
      sceneId: item.sceneId, floor: item.floor, maxStars: item.game.maxStars || 3
    })));
  }
  function practice(id, opener = boardButton) {
    const item = stampRooms().find(item => item.room.game === id);
    if (!item) return;
    document.querySelector(`.scene-nav [data-scene="${item.sceneId}"][aria-pressed="false"]`)?.click();
    open(id, item.room, opener);
  }

  /** 지도 위 도장 버튼의 숫자를 고치고 { got, total }을 돌려줌 */
  function updateStampCount() {
    const rooms = stampRooms();
    const stamps = readStamps();
    const got = rooms.filter(item => stamps[item.room.game]).length;
    if (boardButton) {
      boardButton.textContent = `🎮 도장 ${got} / ${rooms.length}`;
      boardButton.classList.toggle('is-complete', rooms.length > 0 && got === rooms.length);
    }
    return { got, total: rooms.length };
  }

  /** 도장을 모두 모으면 한 번만 집계 (개인정보 없이 횟수만) */
  function checkAllStamps({ got, total }) {
    if (!total || got < total) return;
    try {
      if (localStorage.getItem(ALL_DONE_KEY) === '1') return;
      localStorage.setItem(ALL_DONE_KEY, '1');
    } catch (e) { return; }
    tourTrack('tour_stamp_complete', { stamp_total: total }, ['TourStamp', 'Complete']);
  }

  /** 도장판에서 고른 공간의 층으로 옮긴 뒤 게임 열기 */
  function playFromBoard(item) {
    board.addEventListener('close', () => {
      document.querySelector(`.scene-nav [data-scene="${item.sceneId}"][aria-pressed="false"]`)?.click();
      open(item.room.game, item.room, boardButton);
    }, { once: true });
    board.close();
  }

  function renderBoard() {
    const rooms = stampRooms();
    const stamps = readStamps();
    const { got, total } = updateStampCount();
    const list = document.getElementById('stamps-list');
    list.replaceChildren();
    for (const item of rooms) {
      const stamp = stamps[item.room.game];
      const row = document.createElement('li');
      row.className = 'stamp-item' + (stamp ? ' is-got' : '');
      const seal = stampArt(item.room.game, 'stamp-seal');
      const info = document.createElement('div');
      info.className = 'stamp-info';
      const name = document.createElement('strong');
      name.textContent = item.room.name;
      const sub = document.createElement('small');
      sub.textContent = `${item.floor} · ${item.game.title}`;
      info.append(name, sub);
      const earned = document.createElement('small');
      earned.className = 'stamp-state';
      earned.textContent = stamp ? '획득' : '미획득';
      info.append(earned);
      if (stamp) {
        const max = item.game.maxStars || 3;
        const stars = document.createElement('span');
        stars.className = 'stamp-stars';
        stars.setAttribute('role', 'img');
        stars.setAttribute('aria-label', `별 ${max}개 중 ${Math.min(stamp.stars, max)}개`);
        stars.textContent = '★'.repeat(Math.min(stamp.stars, max)) + '☆'.repeat(Math.max(0, max - stamp.stars));
        info.append(stars);
      }
      const go = document.createElement('button');
      go.type = 'button';
      go.className = 'btn' + (stamp ? '' : ' btn-primary');
      go.textContent = stamp ? '다시' : '도전';
      go.setAttribute('aria-label', `${item.room.name} ${item.game.title} ${stamp ? '다시 하기' : '도전하기'}`);
      go.addEventListener('click', () => playFromBoard(item));
      row.append(seal, info, go);
      list.append(row);
    }
    const complete = total > 0 && got === total;
    document.getElementById('stamps-summary').textContent = complete
      ? `🎉 도장 ${total}개 완성! 군산여상 탐험 완료`
      : `도장 ${got} / ${total} · 🎮 표시가 있는 공간에서 모아요`;
    const score = progress();
    document.getElementById('stamps-summary').textContent += ` · ★ ${score.stars} / ${score.maxStars}`;
    document.getElementById('stamps-done').hidden = !complete;
    if (resetButton) resetButton.disabled = got === 0;
    return { got, total };
  }

  function closeResetPrompt() {
    if (resetPanel) resetPanel.hidden = true;
    resetButton?.setAttribute('aria-expanded', 'false');
  }

  function openBoard() {
    if (!board || board.open || dialog.open) return;
    closeResetPrompt();
    if (resetStatus) resetStatus.textContent = '';
    const count = renderBoard();
    tourTrack('tour_stamp_open', { stamp_count: count.got, stamp_total: count.total }, ['TourStamp', 'Open']);
    board.showModal();
    document.getElementById('stamps-close').focus({ preventScroll: true });
  }

  if (board && boardButton) {
    boardButton.addEventListener('click', openBoard);
    document.getElementById('stamps-close').addEventListener('click', () => board.close());
    board.addEventListener('close', () => {
      closeResetPrompt();
      if (!dialog.open) boardButton.focus({ preventScroll: true });
    });
    resetButton?.addEventListener('click', () => {
      resetStatus.textContent = '';
      resetPanel.hidden = false;
      resetButton.setAttribute('aria-expanded', 'true');
      document.getElementById('stamps-reset-cancel').focus();
    });
    document.getElementById('stamps-reset-cancel')?.addEventListener('click', () => {
      closeResetPrompt();
      resetButton.focus();
    });
    document.getElementById('stamps-reset-confirm')?.addEventListener('click', () => {
      // 도장·별만 초기화. 커리어존 재참여 표시와 브라우저당 1회 완료 집계는 유지합니다.
      try {
        localStorage.removeItem(STAMP_KEY);
        if (localStorage.getItem(STAMP_KEY) !== null) throw new Error('Stamp reset failed');
      } catch (e) {
        resetStatus.textContent = '기록을 지우지 못했어요. 브라우저 저장 설정을 확인한 뒤 다시 시도해 주세요.';
        return;
      }
      document.dispatchEvent(new CustomEvent('tour:stamps-reset'));
      closeResetPrompt();
      renderBoard();
      resetStatus.textContent = '도장과 별 기록을 모두 초기화했어요. 다시 도전해 보세요!';
      document.getElementById('stamps-close').focus({ preventScroll: true });
    });
    // 게임 창을 닫을 때마다 숫자 맞추기 (도장 저장 뒤)
    dialog.addEventListener('close', updateStampCount);
  }

  const whenReady = () => { updateStampCount(); openFromAddress(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', whenReady);
  else whenReady();

  return { open, close: () => dialog.close(), stamps: readStamps, openBoard, progress, practice };
})();
