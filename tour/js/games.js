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
   점수 경쟁 게임은 api.bestScore로 이전 최고점을 읽고, 완료할 때 points에 이번 점수를 전달합니다.
   점수는 클수록 좋은 0 이상의 정수입니다. 단위를 바꾸려면 게임 등록에 scoreUnit: '원' 처럼 적습니다 (없으면 '점').
   최고 점수는 결과 화면과 도장판에 함께 보입니다 (2026-11-26: 내 취향 찾기 빼고 모든 게임에 점수).
   돌려준 함수(cleanup)는 창을 닫을 때 불려 타이머 등을 정리합니다 (없어도 됨).

   공간 데이터(tour-data.js)에 game: 'cafe' 를 적으면 그 공간의 상세 창에 버튼이 생기고,
   tour/index.html?game=cafe 로 들어오면 바로 열립니다.

   지도 위 [도장 n / m] 버튼은 도장판(<dialog id="stamps">)을 엽니다 — 게임이 있는 공간과 모은 도장·별을 보여 주고 바로 도전할 수 있습니다.
   도장은 localStorage 'gch-tour-stamps'에 { cafe: { stars: 2, at: '2026-11-14' } } 꼴로, 최고 별 수만 남깁니다.
   이름·연락처 같은 개인정보는 받지 않고, 서버로 보내는 것도 없습니다.
   ========================================================================= */

window.TOUR_GAMES = window.TOUR_GAMES || {};

/* 장식 아이콘과 소리 버튼의 공통 화면 부품. */
window.TourUI = {
  icon(name) {
    // 게임 표시는 픽셀 그림 대신 🎮 이모지 (사용자 선택)
    const EMOJI = { stamp: '🎮', practice: '📖' };
    if (EMOJI[name]) return Object.assign(document.createElement('span'), { className: 'ui-emoji', textContent: EMOJI[name], ariaHidden: 'true' });
    const img = document.createElement('img');
    img.className = 'ui-icon'; img.src = 'img/ui/' + name + '.png';
    img.width = 20; img.height = 20; img.alt = ''; img.setAttribute('aria-hidden', 'true');
    return img;
  },
  label(node, name, text) { node.replaceChildren(this.icon(name), document.createTextNode(' ' + text)); },
  sound(button, enabled) {
    button.className = 'btn sound-toggle';
    button.replaceChildren(this.icon(enabled ? 'speaker-on' : 'speaker-off'));
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? '효과음 끄기' : '효과음 켜기');
  },
  mountSound(enabled, onClick) {
    const button = document.getElementById('game-sound');
    this.sound(button, enabled); button.hidden = false;
    button.addEventListener('click', onClick);
    return { update: value => this.sound(button, value), dispose() {
      button.removeEventListener('click', onClick); button.hidden = true;
    }};
  }
};

window.tourGame = (() => {
  const GAMES = window.TOUR_GAMES;
  const STAMP_KEY = 'gch-tour-stamps';
  const STAMP_ART = new Set(['bakery', 'typing', 'cafe', 'cashier', 'rain', 'ai', 'career', 'phishing', 'interview', 'stairs', 'melody', 'curling', 'target', 'badminton', 'press', 'logistics', 'reconcile', 'bookshop', 'tea', 'booths', 'goods', 'paperplane', 'art']);
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
  function saveStamp(id, stars, max, points) {
    const stamps = readStamps();
    const previous = stamps[id];
    const previousScore = window.TourStarProgress.pointsOrNull(previous?.bestScore);
    stamps[id] = window.TourStarProgress.stampRecord(previous, stars, max || 3, points, today());
    try { localStorage.setItem(STAMP_KEY, JSON.stringify(stamps)); } catch (e) { /* 저장 못 해도 게임은 계속 */ }
    return { best: stamps[id], previousScore };
  }

  /* ---------- 화면 읽기 프로그램 안내 ---------- */

  let announceTimer = 0;
  function announce(text) {
    status.textContent = '';   // 같은 문장도 다시 읽히도록 비웠다가 넣음
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { status.textContent = text; }, 40);
  }

  /* ---------- 열기 ---------- */

  /** 게임 창 위 「예술제 미션」 한 줄 (js/festival-story.js의 lines) */
  const storyEl = $('#game-story');
  function storyLine(id) {
    if (!storyEl) return;
    const line = window.TOUR_FESTIVAL?.lines?.[id]?.[0];
    storyEl.hidden = !line;
    if (!line) return;
    const tag = document.createElement('b');
    tag.textContent = '예술제 미션';
    storyEl.replaceChildren(tag, ' ' + line);
  }

  function open(id, room = null, from = null) {
    const game = GAMES[id];
    if (!game || dialog.open) return false;
    const roomName = room?.name || game.room || '';
    opener = from;
    current = { id, game, roomName, cleanup: null, finished: false };
    titleEl.textContent = game.title;
    roomEl.textContent = roomName;
    storyLine(id);
    dialog.classList.remove('is-result');
    body.replaceChildren();
    status.textContent = '';
    tourTrack('tour_game_start', { game_id: id, room_name: roomName }, ['TourGame', game.naver + 'Start']);
    dialog.showModal();
    document.body.classList.add('game-open');
    const session = current;
    if (wantsCover(id)) {
      coverSeen.add(id);
      showCover(session, () => launch(session));
    } else {
      launch(session);
    }
    return true;
  }

  // 게임은 세션마다 처음 열 때 그림 한 장(커버)과 「시작하기」로 시작한다. 게임 타이머는 '시작하기'를 누른 뒤에야 돈다.
  // 커버 그림: img/games/covers/<id>.webp (1200×750, 글자 없는 그림). 새 그림을 넣으면 COVER_ART에 id를 더하고 COVER_V를 올리세요.
  // STAMP_COVERS를 true로 바꾸면 그림이 없는 게임도 도장 그림을 크게 보여 주는 커버로 시작합니다 (커버 그림이 다 모이면 켤 예정).
  const COVER_ART = new Set(['phishing', 'press', 'target', 'bakery']);
  const STAMP_COVERS = false;
  const COVER_V = '20261127';
  const coverSeen = new Set();
  const wantsCover = id => !GAMES[id]?.isHub && !coverSeen.has(id) && (STAMP_COVERS || COVER_ART.has(id));
  function showCover(session, go) {
    const { id, game } = session;
    const wrap = document.createElement('div');
    wrap.className = 'game-cover';
    const frame = document.createElement('div');
    frame.className = 'game-cover-art';
    if (COVER_ART.has(id)) {
      const img = new Image(1200, 750);
      img.src = `img/games/covers/${id}.webp?v=${COVER_V}`;
      img.alt = '';
      frame.append(img);
    } else {
      frame.classList.add('is-stamp');
      frame.append(stampArt(id, 'game-cover-seal'));
    }
    // 오늘의 도전 게임이면 커버 위에 목표 한 줄 (js/daily.js)
    const goal = window.TourDaily?.goalFor(id);
    if (goal) {
      const tag = document.createElement('p');
      tag.className = 'game-cover-daily' + (goal.done ? ' is-done' : '');
      tag.textContent = goal.done ? `오늘의 도전 성공 · ${goal.label}` : `오늘의 도전 · ${goal.label}`;
      frame.append(tag);
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary game-cover-start';
    button.textContent = '시작하기';
    button.setAttribute('aria-label', `${game.title} 시작하기`);
    button.addEventListener('click', () => {
      if (session !== current) return;
      body.replaceChildren();
      go();
    }, { once: true });
    wrap.append(frame, button);
    body.replaceChildren(wrap);
    button.focus({ preventScroll: true });
  }

  function launch(session) {
    const { id, game } = session;
    try {
      if (id === 'goods' || id === 'paperplane') {
        session.audio = window.TourArcadeAudio?.mount(dialog, $('#game-sound'));
      }
      session.cleanup = game.start(body, {
        cue: session.audio?.cue,
        bestScore: window.TourStarProgress.pointsOrNull(readStamps()[id]?.bestScore),
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

  function finish(session, { stars = 0, hints = 0, extra = null, points } = {}) {
    if (session !== current || session.finished) return;
    session.finished = true;
    const { id, game } = session;
    const max = game.maxStars || stars;
    tourTrack('tour_game_complete', { game_id: id, stars, hints }, ['TourGame', game.naver + 'Done']);
    const { best, previousScore } = saveStamp(id, stars, max, points);
    renderResult(session, stars, max, best, extra, window.TourStarProgress.pointsOrNull(points), previousScore);
    document.dispatchEvent(new CustomEvent('tour:game-result', { detail: { id, stars, points: window.TourStarProgress.pointsOrNull(points) } }));
  }

  function renderResult(session, stars, max, best, extra, points, previousScore) {
    const { id, game } = session;
    session.audio?.dispose();
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

    // 도장과 기본 동작을 먼저 보여 주고, 게임별 결과 그림은 아래에 둡니다.
    if (points !== null) {
      const record = document.createElement('p');
      record.className = 'game-result-best';
      const unit = game.scoreUnit || '점';
      const n = v => Number(v).toLocaleString('ko-KR');
      record.textContent = previousScore === null
        ? `이번 기록 ${n(points)}${unit} · 다시 하면 최고 기록에 도전할 수 있어요.`
        : points > previousScore
          ? `최고 기록 경신! ${n(points)}${unit} · 지난 기록보다 ${n(points - previousScore)}${unit} 더!`
          : `이번 ${n(points)}${unit} · 내 최고 ${n(best.bestScore)}${unit}${points === previousScore ? ' (같은 기록!)' : ` · ${n(previousScore - points)}${unit} 모자라요`}`;
      if (previousScore !== null && points > previousScore) record.classList.add('is-new');
      box.append(record);
    }
    box.append(starRow, score, stamp, message);
    const storyAfter = window.TOUR_FESTIVAL?.lines?.[id]?.[1];
    const opening = window.TOUR_FESTIVAL && id === window.TOUR_FESTIVAL.finale.id;
    if (storyAfter) {
      const news = document.createElement('p');
      news.className = 'game-story-result' + (opening ? ' is-opening' : '');
      news.textContent = storyAfter + (opening ? ' 현황판에 「예술제 둘러보기」가 열렸어요.' : '');
      box.append(news);
    }
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
    const story = festivalProgress();
    const nextStory = story?.next && story.next.id !== id && GAMES[story.next.id] && story.next.id !== game.nextGame ? story.next : null;
    if (nextStory) {
      const go = document.createElement('button');
      go.type = 'button';
      go.className = 'btn btn-primary';
      go.textContent = '다음 할 일 · ' + GAMES[nextStory.id].title;
      go.addEventListener('click', () => {
        const from = opener;
        tourTrack('tour_story_next', { game_id: id, next_id: nextStory.id }, ['TourStory', 'Next']);
        dialog.addEventListener('close', () => practice(nextStory.id, from), { once: true });
        dialog.close();
      });
      actions.append(go);
    }
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
    if (extra) box.append(extra);
    const count = updateStampCount();
    if (board && count.total) {   // 모은 도장 수 + 도장판으로 가는 버튼
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'btn game-result-board';
      const prep = festivalProgress();
      window.TourUI.label(more, 'stamp', prep && !prep.opened
        ? `예술제 준비 ${prep.got} / ${prep.total} · 현황판 보기`
        : `모은 도장 ${count.got} / ${count.total} · 도장판 보기`);
      more.addEventListener('click', () => {
        dialog.addEventListener('close', openBoard, { once: true });
        dialog.close();
      });
      box.append(more);
    }
    body.append(box);
    body.scrollTop = 0;
    checkAllStamps(count);

    announce(`끝났어요. 별 ${max}개 중 ${stars}개. ${game.stamp || '도장 획득!'} ${game.message || ''}`);
    retry.focus({ preventScroll: true });
  }

  /* ---------- 닫기 (Esc · ✕ · 결과 화면 버튼) — 진행 중에 닫아도 정리만 하고 끝 ---------- */

  $('#game-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    const session = current;
    current = null;
    session?.audio?.dispose();
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
      const story = festivalProgress(stamps);
      // 개막 전에는 본편(예술제 준비)만 세고, 개막 뒤에는 전체 도장을 셉니다.
      if (story && !story.opened) window.TourUI.label(boardButton, 'stamp', `예술제 준비 ${story.got} / ${story.total}`);
      else window.TourUI.label(boardButton, 'stamp', `도장 ${got} / ${rooms.length}`);
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

  function playFromBoardById(id) {
    const item = stampRooms().find(entry => entry.room.game === id);
    if (item) playFromBoard(item);
  }

  /* ---------- 「녹원예술제 D-1」 현황판 (js/festival-story.js가 있을 때) ---------- */

  /** 「내 취향 찾기」에서 추천받은 학과 (erp·marketing·fintech·cafe 중 하나, 없으면 null) */
  function storyPick() {
    try {
      const pick = localStorage.getItem('gch-tour-story-pick');
      return window.TOUR_FESTIVAL?.depts?.[pick] ? pick : null;
    } catch (e) { return null; }
  }

  /** 본편(시작 2 + 학과 핵심 8 + 개막 1) 진행 상황. 이야기 데이터가 없으면 null */
  function festivalProgress(stamps = readStamps()) {
    const story = window.TOUR_FESTIVAL;
    if (!story) return null;
    const pick = storyPick();
    const booths = pick ? [...story.booths].sort((a, b) => (b.dept === pick) - (a.dept === pick)) : story.booths;
    const main = [...story.prologue, ...booths.flatMap(b => b.main), story.finale].filter(s => GAMES[s.id]);
    const extras = [...story.booths.flatMap(b => b.bonus), ...story.life].filter(s => GAMES[s.id]);
    const badges = story.booths.filter(b => b.main.every(s => stamps[s.id])).length;
    const opened = !!stamps[story.finale.id];
    const next = main.find(s => !stamps[s.id]) || null;
    return { main, extras, badges, opened, next, pick, booths,
      got: main.filter(s => stamps[s.id]).length, total: main.length,
      showExtras: opened || extras.some(s => stamps[s.id]) };
  }

  /** 도장판: 최고 점수 한 줄 (점수가 없으면 빈 요소) */
  function bestLine(stamp, game) {
    const line = document.createElement('small');
    line.className = 'stamp-best';
    const best = window.TourStarProgress.pointsOrNull(stamp?.bestScore);
    if (best !== null) line.textContent = `최고 ${best.toLocaleString('ko-KR')}${game.scoreUnit || '점'}`;
    else line.hidden = true;
    return line;
  }

  function stampButton(item, stamps, label, role) {
    const stamp = stamps[item.room.game];
    const max = item.game.maxStars || 3;
    const earned = stamp ? Math.min(stamp.stars, max) : 0;
    const go = document.createElement('button');
    go.type = 'button';
    go.className = 'stamp-item' + (stamp ? ' is-got' : '');
    go.setAttribute('aria-label', `${role ? role + ', ' : ''}${item.room.name} ${item.game.title}, ${stamp ? '도장 획득' : '미획득'}, 별 ${max}개 중 ${earned}개, ${stamp ? '다시 하기' : '도전하기'}`);
    go.addEventListener('click', () => playFromBoard(item));
    const name = document.createElement('strong');
    name.textContent = label;
    const stars = document.createElement('span');
    stars.className = 'stamp-stars';
    stars.setAttribute('aria-hidden', 'true');
    stars.textContent = '★'.repeat(earned) + '☆'.repeat(max - earned);
    go.append(stampArt(item.room.game, 'stamp-seal'), name);
    if (role) {
      const small = document.createElement('small');
      small.className = 'stamp-role';
      small.textContent = role;
      go.append(small);
    }
    go.append(stars, bestLine(stamp, item.game));
    const li = document.createElement('li');
    li.append(go);
    return li;
  }

  function shortRoom(item) {
    if (item.room.games) return item.game.button.replace(/ 도전$/, '');
    return item.room.name.replace('창업동아리 지원센터', '창업동아리').replace('학생회 회의실', '학생회실');
  }

  function renderFestivalBoard(list, rooms, stamps, story) {
    const data = window.TOUR_FESTIVAL;
    const byId = new Map(rooms.map(item => [item.room.game, item]));
    const section = (title, note, className = '') => {
      const group = document.createElement('li');
      group.className = 'stamp-floor ' + className;
      const heading = document.createElement('h3');
      heading.textContent = title;
      group.append(heading);
      if (note) {
        const p = document.createElement('p');
        p.className = 'stamp-note';
        p.textContent = note;
        group.append(p);
      }
      list.append(group);
      return group;
    };
    const grid = (entries, labelOf = shortRoom) => {
      const ul = document.createElement('ul');
      ul.className = 'stamp-grid';
      for (const s of entries) {
        const item = byId.get(s.id);
        if (item) ul.append(stampButton(item, stamps, labelOf(item), s.role));
      }
      return ul;
    };

    // 다음 할 일 한 줄
    const nextBox = section('다음 할 일', '', 'stamp-next');
    const nextItem = story.next && byId.get(story.next.id);
    const nextText = document.createElement('p');
    nextText.className = 'stamp-next-text';
    if (nextItem) {
      nextText.textContent = `${nextItem.floor} ${shortRoom(nextItem)} · ${story.next.role || nextItem.game.title}`;
      const go = document.createElement('button');
      go.type = 'button';
      go.className = 'btn btn-primary';
      go.textContent = '여기로 가기';
      go.addEventListener('click', () => playFromBoard(nextItem));
      nextBox.append(nextText, go);
    } else {
      nextText.textContent = '예술제가 열렸어요! 아래 「예술제 둘러보기」에서 남은 체험도 즐겨 보세요.';
      nextBox.append(nextText);
    }

    const prologue = section('1. 초대장 받기', '내일은 녹원예술제! 일일 도우미로 초대받았어요.');
    prologue.append(grid(data.prologue));
    if (window.TourFestivalInvite) {
      const again = document.createElement('button');
      again.type = 'button';
      again.className = 'stamp-invite-again';
      again.textContent = '초대장 다시 보기';
      again.addEventListener('click', () => {
        board.addEventListener('close', () => window.TourFestivalInvite.open(), { once: true });
        board.close();
      });
      prologue.append(again);
    }

    const boothGroup = section('2. 학과 부스 4곳 준비하기', `미션 두 개를 끝내면 학과 배지가 켜져요 · 배지 ${story.badges} / ${data.booths.length}`);
    const cards = document.createElement('ul');
    cards.className = 'stamp-booths';
    for (const booth of story.booths) {
      const dept = data.depts[booth.dept];
      const done = booth.main.every(s => stamps[s.id]);
      const card = document.createElement('li');
      card.className = 'stamp-booth' + (done ? ' is-done' : '') + (booth.dept === story.pick ? ' is-pick' : '');
      if (booth.dept === story.pick) {
        const tag = document.createElement('span');
        tag.className = 'stamp-pick';
        tag.textContent = '내 추천 부스';
        card.append(tag);
      }
      card.style.setProperty('--dept', dept.color);
      const head = document.createElement('div');
      head.className = 'stamp-booth-head';
      const name = document.createElement('strong');
      name.textContent = dept.name;
      const badge = document.createElement('span');
      badge.className = 'stamp-badge';
      badge.textContent = done ? '배지 획득' : `${booth.main.filter(s => stamps[s.id]).length} / ${booth.main.length}`;
      head.append(name, badge);
      const job = document.createElement('p');
      job.textContent = `${dept.booth} · ${dept.job}`;
      card.append(head, job, grid(booth.main));
      if (done) {
        const link = document.createElement('a');
        link.className = 'stamp-dept-link';
        link.href = dept.href;
        link.textContent = `${dept.name} 알아보기 →`;
        card.append(link);
      }
      cards.append(card);
    }
    boothGroup.append(cards);

    section('3. 개막 준비', story.badges >= 2 || story.opened ? '학생회실에서 네 부스 자리를 정하면 예술제가 열려요.'
      : '부스 2곳 이상 준비한 뒤 도전하면 좋아요.').append(grid([data.finale]));

    if (story.opened && window.TourFestivalEnding) {
      const again = document.createElement('button');
      again.type = 'button';
      again.className = 'stamp-invite-again';
      again.textContent = '개막 장면 다시 보기';
      again.addEventListener('click', () => {
        board.addEventListener('close', () => window.TourFestivalEnding.open(), { once: true });
        board.close();
      });
      list.lastElementChild.append(again);
    }

    if (story.showExtras) {
      const extra = section('예술제 둘러보기', '학과 보너스 미션과 학교생활 체험이에요.', 'stamp-extras');
      const bonus = data.booths.flatMap(b => b.bonus.map(s => ({ ...s, role: `${data.depts[b.dept].name} · ${s.role}` })));
      extra.append(grid(bonus), grid(data.life));
    }
  }

  function renderBoard() {
    const rooms = stampRooms();
    const stamps = readStamps();
    const { got, total } = updateStampCount();
    const list = document.getElementById('stamps-list');
    list.replaceChildren();
    const story = festivalProgress(stamps);
    const floors = new Map();
    // 맨 위: 오늘의 도전(js/daily.js) · 내 칭호(js/title-card.js)
    for (const extra of [window.TourDaily?.boardItem(playFromBoardById), window.TourTitleCard?.boardItem(() => board.close())]) {
      if (extra) list.append(extra);
    }
    if (story) renderFestivalBoard(list, rooms, stamps, story);
    else for (const item of rooms) {
      if (!floors.has(item.floor)) {
        const group = document.createElement('li');
        group.className = 'stamp-floor';
        const heading = document.createElement('h3');
        heading.textContent = item.floor;
        const grid = document.createElement('ul');
        grid.className = 'stamp-grid';
        group.append(heading, grid);
        list.append(group);
        floors.set(item.floor, grid);
      }
      const stamp = stamps[item.room.game];
      const row = document.createElement('li');
      const seal = stampArt(item.room.game, 'stamp-seal');
      const name = document.createElement('strong');
      name.textContent = item.room.name.replace('창업동아리 지원센터', '창업동아리').replace('학생회 회의실', '학생회실');
      // 같은 체육관의 종목은 짧은 이름으로 구분합니다.
      if (item.room.games) name.textContent = item.game.button.replace(/ 도전$/, '');
      const max = item.game.maxStars || 3;
      const earned = stamp ? Math.min(stamp.stars, max) : 0;
      const stars = document.createElement('span');
      stars.className = 'stamp-stars';
      stars.setAttribute('aria-hidden', 'true');
      stars.textContent = '★'.repeat(earned) + '☆'.repeat(max - earned);
      const go = document.createElement('button');
      go.type = 'button';
      go.className = 'stamp-item' + (stamp ? ' is-got' : '');
      go.setAttribute('aria-label', `${item.room.name} ${item.game.title}, ${stamp ? '도장 획득' : '미획득'}, 별 ${max}개 중 ${earned}개, ${stamp ? '다시 하기' : '도전하기'}`);
      go.addEventListener('click', () => playFromBoard(item));
      go.append(seal, name, stars, bestLine(stamp, item.game));
      row.append(go);
      floors.get(item.floor).append(row);
    }
    const complete = total > 0 && got === total;
    const score = progress();
    const summary = document.getElementById('stamps-summary');
    summary.textContent = story && !story.opened
      ? `예술제 준비 ${story.got}/${story.total} · ★ ${score.stars}/${score.maxStars}`
      : `도장 ${got}/${total} · ★ ${score.stars}/${score.maxStars}`;
    let meter = document.getElementById('stamps-progress');
    if (!meter) {
      meter = document.createElement('progress');
      meter.id = 'stamps-progress';
      summary.after(meter);
    }
    const [mGot, mTotal] = story && !story.opened ? [story.got, story.total] : [got, total];
    meter.max = mTotal || 1;
    meter.value = mGot;
    meter.setAttribute('aria-label', `${story && !story.opened ? '예술제 준비' : '도장'} ${mTotal}개 중 ${mGot}개`);
    document.getElementById('stamps-done').hidden = !(complete || story?.opened);
    const reward = document.getElementById('stamps-reward');
    if (reward) reward.hidden = !complete;   // 해 질 무렵 전경: 전체 도장 완주 보상
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
        localStorage.removeItem('gch-tour-story-pick');   // 예술제 추천 부스도 처음부터
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
