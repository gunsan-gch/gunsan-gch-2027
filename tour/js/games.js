/* =========================================================================
   픽셀 학교 투어 — 체험 게임 틀
   게임 창(<dialog id="game">) 열기·닫기, 공통 결과 화면, 도장 저장(localStorage), 방문 분석 이벤트를 맡습니다.
   게임 본체는 js/game-○○.js 파일에서 아래처럼 등록합니다 (이 파일 다음에 불러옴).

     window.TOUR_GAMES.cafe = {
       title: '음료 만들기 체험',          // 게임 창 제목
       button: '☕ 음료 만들기 체험',      // 공간 상세 창의 버튼 문구
       naver: 'Cafe',                      // 네이버 이벤트 값 앞글자 (영문·숫자만) → CafeStart · CafeDone · CafeDept
       maxStars: 9,                        // 받을 수 있는 최고 별 수
       stamp: '카페실습실 도장 획득!',      // 결과 화면의 도장 문구
       message: '카페비즈과에서는 …',       // 결과 화면 안내 문구
       cta: { href: '../index.html#cafe', label: '카페비즈과 알아보기 →' },   // 결과 화면의 학과 링크
       start(container, api) { … return cleanup; }
     };

   start()는 container 안에 화면을 만들고, 다 끝나면 api.done({ stars, hints })를 부릅니다.
   api.announce(text)는 화면 읽기 프로그램용 안내, api.reducedMotion은 '움직임 줄이기' 설정 여부입니다.
   돌려준 함수(cleanup)는 창을 닫을 때 불려 타이머 등을 정리합니다 (없어도 됨).

   공간 데이터(tour-data.js)에 game: 'cafe' 를 적으면 그 공간의 상세 창에 버튼이 생기고,
   tour/index.html?game=cafe 로 들어오면 바로 열립니다.

   도장은 localStorage 'gch-tour-stamps'에 { cafe: { stars: 7, at: '2026-11-14' } } 꼴로, 최고 별 수만 남깁니다.
   이름·연락처 같은 개인정보는 받지 않고, 서버로 보내는 것도 없습니다.
   ========================================================================= */

window.TOUR_GAMES = window.TOUR_GAMES || {};

window.tourGame = (() => {
  const GAMES = window.TOUR_GAMES;
  const STAMP_KEY = 'gch-tour-stamps';
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
      return stamps && typeof stamps === 'object' ? stamps : {};
    } catch (e) { return {}; }
  }

  /** 최고 별 수만 남김. 돌려주는 값은 저장된(=최고) 기록 */
  function saveStamp(id, stars) {
    const stamps = readStamps();
    const best = stamps[id];
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
        close: () => dialog.close()
      }) || null;
    } catch (e) {
      body.textContent = '게임을 불러오지 못했어요. 창을 닫고 다시 열어 주세요.';
      console.error(e);
    }
    return true;
  }

  /* ---------- 끝: 결과 화면 ---------- */

  function finish(session, { stars = 0, hints = 0 } = {}) {
    if (session !== current || session.finished) return;
    session.finished = true;
    const { id, game } = session;
    const max = game.maxStars || stars;
    tourTrack('tour_game_complete', { game_id: id, stars, hints }, ['TourGame', game.naver + 'Done']);
    const best = saveStamp(id, stars);
    renderResult(session, stars, max, best);
  }

  function renderResult(session, stars, max, best) {
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
    stamp.innerHTML = '<span class="game-stamp-seal" aria-hidden="true">도장</span><strong></strong>';
    stamp.querySelector('strong').textContent = game.stamp || '도장 획득!';

    const message = document.createElement('p');
    message.className = 'game-result-text';
    message.textContent = game.message || '';

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
    body.append(box);

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
    open(wanted, rooms.find(r => r.game === wanted) || null, null);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openFromAddress);
  else openFromAddress();

  return { open, close: () => dialog.close(), stamps: readStamps };
})();
