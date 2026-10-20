/* =========================================================================
   픽셀 학교 투어 — 화면 동작
   장면 전환, 공간 카드·검색·상세 창, 계단·현관 이동, 조작 버튼을 연결합니다.
   공간 이름·좌표는 tour-data.js에서 수정하세요.
   ========================================================================= */

(() => {
  const SCENES = window.TOUR_SCENES;
  const PORTALS = window.TOUR_PORTALS;
  const ORDER = window.TOUR_ORDER;

  const $ = selector => document.querySelector(selector);
  const stage = $('#scene-stage');
  const viewport = $('#scene-scroll');
  const walker = $('#scene-walker');
  const sceneImage = $('#scene-image');
  const statusText = $('#scene-status');
  const dialog = $('#detail');
  const loadStatus = $('#map-load-status');

  /* ---------- 공간 데이터 정리 ---------- */

  const CLASSROOM = /^\d-\d 교실$/;
  for (const [id, scene] of Object.entries(SCENES)) {
    scene.id = id;
    for (const room of scene.rooms) {
      room.scene = id;
      room.status ||= '현재 공간';
      room.rect ||= [Math.max(0, room.at[0] - room.w / 2), Math.max(0, room.at[1] - 7), room.w, 14];
      if (!room.desc && CLASSROOM.test(room.name)) room.desc = `${room.name[0]}학년 학생들이 공부하는 교실입니다.`;
    }
  }
  const allRooms = ORDER.flatMap(id => SCENES[id].rooms);   // 야외 '학교 전경 보기'도 검색·주소로 찾을 수 있게
  const compactText = text => text.replace(/[\s·()]/g, '').toLowerCase();

  /* ---------- 상태 ---------- */

  let scene = null;
  let blockedPortal = null;     // 막 도착한 연결 지점에서 바로 되돌아가지 않도록
  let transitioning = false;
  let nearStairs = null;
  let opener = null;
  let walkRequest = 0;          // 공간으로 걸어가는 중에 다른 명령이 오면 상세 창을 열지 않기 위한 번호

  const say = text => { statusText.textContent = text; };

  const camera = new TourCamera(stage, viewport);
  const motion = new TourMotion(state => {
    walker.style.left = state.x + '%';
    walker.style.top = state.y + '%';
    walker.dataset.facing = state.facing;
    const row = ['down', 'right', 'up', 'left'].indexOf(state.facing);
    walker.style.backgroundPosition = `${state.frame * 50}% ${row * 100 / 3}%`;
    if (!state.moving) return;
    camera.follow(state.x, state.y);
    checkPortals([state.x, state.y]);
    checkStairs([state.x, state.y]);
  });

  /* ---------- 장면 전환 ---------- */

  function switchScene(id, { spawn, arrival = null, quiet = false } = {}) {
    id = String(id);
    if (!SCENES[id]) return;
    motion.cancel();
    pressedKeys.clear();
    walkRequest++;
    scene = SCENES[id];
    blockedPortal = arrival;
    transitioning = false;
    nearStairs = null;
    closeStairMenu(false);

    setImage(scene);
    motion.configure(scene, spawn || scene.start);
    viewport.setAttribute('aria-label', `${scene.name} 픽셀 지도. 지도를 누른 뒤 방향키로 걷거나 공간 이름을 눌러 보세요.`);
    $('#scene-notice-title').textContent = scene.notice.title;
    $('#scene-notice-text').textContent = scene.notice.text;
    $('#current-floor').textContent = `지금은 ${scene.name}`;
    document.querySelectorAll('[data-scene]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.scene === id)));

    renderStairs();
    renderHints();
    renderRoomLabels(stage, scene, (room, el) => openRoom(room, el));
    renderCards();
    camera.apply();
    camera.center(motion.x, motion.y);
    if (!quiet) say(`${scene.name}에 도착했어요. 바닥이나 공간 이름을 누르면 걸어가요.`);
    // 주소 뒤 #floor-3 갱신 (다른 페이지 안에 넣어 보여 줄 때 막혀도 투어는 계속 동작)
    try { history.replaceState(null, '', '#' + (id === 'outdoor' ? 'outdoor' : 'floor-' + id)); } catch (e) { /* 무시 */ }
  }

  function setImage(next) {
    if (sceneImage.getAttribute('src') === next.image) return;
    viewport.setAttribute('aria-busy', 'true');
    loadStatus.hidden = false;
    loadStatus.textContent = '지도를 불러오고 있어요…';
    sceneImage.src = next.image;
    sceneImage.alt = `${next.name} 픽셀 일러스트. 학교배치도를 참고한 그림으로 실제 시설·동선과 다를 수 있습니다.`;
  }
  sceneImage.addEventListener('load', () => {
    viewport.setAttribute('aria-busy', 'false');
    loadStatus.hidden = true;
  });
  sceneImage.addEventListener('error', () => {
    viewport.setAttribute('aria-busy', 'false');
    loadStatus.hidden = false;
    loadStatus.textContent = '지도를 불러오지 못했어요. 페이지를 새로고침해 주세요.';
  });

  /* ---------- 현관(연결 지점) ---------- */

  function checkPortals(point) {
    if (transitioning) return;
    const here = PORTALS.filter(p => p.from === scene.id);
    if (blockedPortal) {
      const arrival = here.find(p => p.id === blockedPortal);
      if (arrival && TourMotion.contains(point, arrival.region)) return;
      blockedPortal = null;
    }
    const portal = here.find(p => TourMotion.contains(point, p.region));
    if (!portal) return;
    transitioning = true;
    queueMicrotask(() => {
      switchScene(portal.to, { spawn: portal.spawn, arrival: portal.arrival, quiet: true });
      say(portal.to === 'outdoor' ? '현관을 나와 잔디마당에 도착했어요.' : '현관으로 들어와 1층에 도착했어요.');
    });
  }

  /* ---------- 계단 ---------- */

  /** 위·아래층에서 같은 key로 이어지는 계단 (없으면 그 방향 버튼을 만들지 않음) */
  function linkedStair(stair, floor) {
    return SCENES[floor]?.stairs?.find(s => s.key === stair.key) || null;
  }

  function renderStairs() {
    stage.querySelectorAll('.stair-controls').forEach(el => el.remove());
    const floor = Number(scene.id);
    for (const stair of scene.stairs || []) {
      const box = document.createElement('div');
      box.className = 'stair-controls';
      box.dataset.stair = stair.key;
      box.style.left = stair.at[0] + '%';
      box.style.top = stair.at[1] + '%';
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', `${scene.name} ${stair.name}`);
      for (const to of [floor + 1, floor - 1]) {
        if (!linkedStair(stair, to)) continue;
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${to > floor ? '↑' : '↓'} ${to}층`;
        button.setAttribute('aria-label', `${stair.name}으로 ${to}층 가기`);
        button.addEventListener('click', () => takeStairs(stair, to));
        box.append(button);
      }
      if (box.children.length) stage.append(box);
    }
  }

  async function takeStairs(stair, to) {
    const from = scene;
    const ticket = ++walkRequest;
    say(`${stair.name}으로 걸어가고 있어요.`);
    const arrived = await motion.go(...stair.anchor);
    if (!arrived || ticket !== walkRequest || scene !== from) return;
    const target = linkedStair(stair, to);
    switchScene(to, { spawn: target.anchor, quiet: true });
    markNearStair(target);
    say(`${target.name}으로 ${to}층에 ${to > Number(from.id) ? '올라왔어요' : '내려왔어요'}. Enter를 누르면 계속 층을 옮길 수 있어요.`);
  }

  /** 계단에서 갈 수 있는 층 목록 (위층 먼저) */
  function stairTargets(stair) {
    const floor = Number(scene.id);
    return [floor + 1, floor - 1].filter(to => linkedStair(stair, to));
  }

  /* 계단 앞에서 Enter·스페이스바: 갈 수 있는 층이 하나면 바로 이동, 둘이면 고르는 창 */
  const stairMenu = document.createElement('div');
  stairMenu.className = 'stair-menu';
  stairMenu.hidden = true;
  stairMenu.setAttribute('role', 'dialog');
  $('#tour-map').append(stairMenu);

  function openStairMenu(stair) {
    const targets = stairTargets(stair);
    if (!targets.length) return;
    if (targets.length === 1) return takeStairs(stair, targets[0]);
    stairMenu.replaceChildren();
    stairMenu.setAttribute('aria-label', `${stair.name}에서 갈 층 고르기`);
    const title = document.createElement('p');
    title.className = 'stair-menu-title';
    title.textContent = `${stair.name} · 어느 층으로 갈까요?`;
    stairMenu.append(title);
    for (const to of targets) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.to = to;
      button.textContent = `${to > Number(scene.id) ? '↑' : '↓'} ${to}층으로 ${to > Number(scene.id) ? '올라가기' : '내려가기'}`;
      button.addEventListener('click', () => { closeStairMenu(); takeStairs(stair, to); });
      stairMenu.append(button);
    }
    const help = document.createElement('p');
    help.className = 'stair-menu-help';
    help.textContent = '↑·↓ 키로 바로 고르기 · Esc 닫기';
    stairMenu.append(help);
    stairMenu.hidden = false;
    stairMenu.querySelector('button').focus({ preventScroll: true });
    say(`${stair.name} 앞이에요. 갈 층을 골라 주세요.`);
  }

  function closeStairMenu(returnFocus = true) {
    if (stairMenu.hidden) return;
    stairMenu.hidden = true;
    if (returnFocus) viewport.focus({ preventScroll: true });
  }

  stairMenu.addEventListener('keydown', e => {
    const buttons = [...stairMenu.querySelectorAll('button')];
    const floor = Number(scene.id);
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeStairMenu(); say(`${nearStairs?.name || '계단'} 앞이에요.`); return; }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      const wanted = buttons.find(b => (Number(b.dataset.to) > floor) === (e.key === 'ArrowUp'));
      wanted?.click();
    }
  });
  stairMenu.addEventListener('focusout', e => {
    if (!stairMenu.contains(e.relatedTarget)) closeStairMenu(false);
  });

  function markNearStair(stair) {
    nearStairs = stair;
    stage.querySelectorAll('.stair-controls').forEach(el => el.classList.toggle('is-near', el.dataset.stair === stair?.key));
  }

  function checkStairs(point) {
    const near = (scene.stairs || []).find(s => motion.metric(point, s.anchor) < 3) || null;
    if (near === nearStairs) return;
    markNearStair(near);
    closeStairMenu(false);
    if (near) say(`${near.name} 앞이에요. Enter·스페이스바나 지도 위 층 버튼으로 다른 층에 갈 수 있어요.`);
  }

  /* ---------- 길 안내 화살표 ---------- */

  function renderHints() {
    stage.querySelectorAll('.route-hint').forEach(el => el.remove());
    const angle = { right: 0, down: 90, left: 180, up: 270 };
    for (const hint of scene.hints || []) {
      const el = document.createElement('span');
      el.className = 'route-hint';
      el.style.left = hint.at[0] + '%';
      el.style.top = hint.at[1] + '%';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = `<svg viewBox="0 0 16 16" style="transform:rotate(${angle[hint.dir]}deg)"><path d="M2 6H8V3H10V5H12V7H14V9H12V11H10V13H8V10H2Z"/></svg>`;
      if (hint.text) {
        const text = document.createElement('small');
        text.textContent = hint.text;
        el.append(text);
      }
      stage.append(el);
    }
  }

  /* ---------- 공간 카드 ---------- */

  function renderCards() {
    const cards = $('#scene-cards');
    const facilities = $('#scene-facilities');
    const omitted = $('#scene-omitted');
    cards.replaceChildren();
    facilities.replaceChildren();

    $('#cards-title').textContent = scene.rooms.length ? `${scene.name} 공간 둘러보기` : '건물 안으로 들어가 보세요';
    $('#cards-lead').textContent = scene.rooms.length
      ? '카드를 누르면 캐릭터가 그 공간 앞까지 걸어가고 설명이 열려요.'
      : '현관으로 걸어 들어가거나 위의 층 버튼을 눌러 보세요.';

    for (const room of scene.rooms) {
      if (room.quiet) continue;   // 설명이 없는 공간은 카드로 만들지 않음
      const button = document.createElement('button');
      button.type = 'button';
      button.addEventListener('click', () => openRoom(room, button));
      if (room.facility) {
        button.className = 'facility-chip';
        button.textContent = room.name;
        facilities.append(button);
        continue;
      }
      const planned = room.status === '개편 예정';
      button.className = 'scene-card' + (planned ? ' is-planned' : '');
      if (planned) {
        const status = document.createElement('span');
        status.className = 'scene-card-status';
        status.textContent = room.status;
        button.append(status);
      }
      const name = document.createElement('strong');
      name.textContent = room.name;
      button.append(name);
      const detail = room.current ? `현재 ${room.current}` : (room.note && room.note !== room.status ? room.note : (room.status !== '현재 공간' && !planned ? room.status : ''));
      if (detail) {
        const sub = document.createElement('small');
        sub.textContent = detail;
        button.append(sub);
      }
      cards.append(button);
    }
    facilities.hidden = !facilities.children.length;
    facilities.setAttribute('aria-label', `${scene.name} 편의시설·기타 공간`);
    omitted.hidden = !scene.omitted?.length;
    omitted.textContent = scene.omitted?.length
      ? `배치도에는 있지만 그림에서는 생략한 공간: ${scene.omitted.join(', ')}`
      : '';
  }

  /* ---------- 공간 상세 ---------- */

  async function openRoom(room, from) {
    opener = from;
    if (room.scene !== scene.id) switchScene(room.scene, { quiet: true });
    const ticket = ++walkRequest;
    say(`${room.name} 앞으로 걸어가고 있어요.`);
    const rect = viewport.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > innerHeight) viewport.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    viewport.focus({ preventScroll: true });

    const arrived = await motion.go(...room.anchor);
    if (ticket !== walkRequest || (!arrived && motion.moving)) return;   // 다른 이동·멈춤으로 취소된 경우
    if (room.quiet) { say(`${room.name} 앞에 도착했어요.`); return; }   // 설명 창 없이 걸어가기만
    say(arrived ? `${room.name} 앞에 도착했어요.` : `${room.name}의 설명을 열었어요.`);
    showDetail(room);
  }

  function showDetail(room) {
    $('#detail-floor').textContent = SCENES[room.scene].name + (room.where ? ` · ${room.where}` : '');
    $('#detail-status').textContent = room.status + (room.current ? ` · 현재 ${room.current}` : '');
    $('#detail-status').classList.toggle('is-planned', room.status === '개편 예정');
    $('#detail-title').textContent = room.name;
    $('#detail-description').textContent = room.desc || '';
    $('#detail-description').hidden = !room.desc;

    const preview = $('#detail-image');
    preview.replaceChildren();
    const img = document.createElement('img');
    dialog.classList.toggle('is-wide', Boolean(room.wide));
    if (room.photo) {
      const real = room.photoKind === 'real';
      preview.className = 'detail-image is-photo';
      img.src = room.photo;
      img.alt = real ? `${room.name} 실제 사진` : `${room.name} 조성 예시 이미지`;
      img.addEventListener('error', () => { preview.textContent = '사진을 준비하고 있어요.'; preview.classList.add('is-missing'); }, { once: true });
    } else {
      preview.className = 'detail-image';
      img.src = SCENES[room.scene].image;
      img.alt = `${room.name} 부분 픽셀 일러스트`;
    }
    preview.append(img);
    dialog.showModal();
    if (!room.photo) fitCrop(img, preview, room.rect);
    $('#close').focus();
  }

  /** 그림에서 rect 부분이 상세 창 그림 칸에 꼭 맞게 들어가도록 확대·위치 조정 */
  function fitCrop(img, box, [x, y, w, h]) {
    const W = box.clientWidth, H = box.clientHeight;
    const imageW = 1000, imageH = imageW / 2;   // 배경 그림 비율 2:1
    const rw = w / 100 * imageW, rh = h / 100 * imageH;
    const scale = Math.min(W / rw, H / rh) * 0.96;
    const left = W / 2 - (x / 100 * imageW + rw / 2) * scale;
    const top = H / 2 - (y / 100 * imageH + rh / 2) * scale;
    // 그림 가장자리 공간이어도 빈 칸이 보이지 않게
    img.style.width = imageW * scale + 'px';
    img.style.left = Math.min(0, Math.max(W - imageW * scale, left)) + 'px';
    img.style.top = Math.min(0, Math.max(H - imageH * scale, top)) + 'px';
  }

  $('#close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    else viewport.focus({ preventScroll: true });
  });

  /* ---------- 지도 클릭으로 걷기 ---------- */

  stage.addEventListener('click', e => {
    if (e.target.closest('button') || performance.now() < camera.suppressClickUntil) return;
    const point = camera.worldAt(e.clientX, e.clientY);
    const near = motion.project(point);
    if (near.d < 2.5) {
      walkRequest++;
      say('걸어가고 있어요.');
      motion.go(...near.p).then(arrived => { if (arrived) say('도착했어요. 공간 이름을 누르면 설명이 열려요.'); });
    } else {
      say('그곳으로는 걸어갈 수 없어요. 복도 바닥을 눌러 보세요.');
    }
  });

  /* ---------- 방향키·방향 버튼 ---------- */

  const KEY_DIRS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
  const pressedKeys = new Set();

  // 지도나 지도 조작 버튼에 초점이 있을 때만 캐릭터를 움직입니다(그 밖에서는 페이지 스크롤).
  const controlsFocused = () => {
    const active = document.activeElement;
    return active && (viewport.contains(active) || active.closest('.direction, .scene-toolbar, .scene-nav, .map-topbar'));
  };

  window.addEventListener('keydown', e => {
    const dir = KEY_DIRS[e.key];
    if (!dir || dialog.open || !stairMenu.hidden || !controlsFocused()) return;
    e.preventDefault();
    if (!pressedKeys.has(e.key) || motion.held !== dir) {
      pressedKeys.add(e.key);
      motion.hold(dir);
    }
  });
  viewport.addEventListener('keydown', e => {
    if ((e.key !== 'Enter' && e.key !== ' ') || e.target !== viewport || e.repeat || dialog.open) return;
    e.preventDefault();   // 스페이스바로 지도가 스크롤되지 않게
    if (nearStairs) openStairMenu(nearStairs);
    else say('계단 앞에서 Enter나 스페이스바를 누르면 다른 층으로 갈 수 있어요.');
  });

  window.addEventListener('keyup', e => {
    if (!KEY_DIRS[e.key]) return;
    pressedKeys.delete(e.key);
    if (KEY_DIRS[e.key] !== motion.held) return;
    const last = [...pressedKeys].pop();
    if (last) motion.hold(KEY_DIRS[last]);
    else motion.release();
  });
  window.addEventListener('blur', () => { pressedKeys.clear(); motion.release(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    motion.cancel();
    motion.lastTime = 0;
  });

  document.querySelectorAll('[data-dir]').forEach(button => {
    const dir = button.dataset.dir;
    button.addEventListener('pointerdown', e => {
      e.preventDefault();
      button.setPointerCapture(e.pointerId);
      motion.hold(dir);
    });
    button.addEventListener('pointerup', () => motion.release());
    button.addEventListener('pointercancel', () => motion.release());
    // 키보드(Enter·Space)로 누르면 한 걸음
    button.addEventListener('click', e => {
      if (e.detail !== 0) return;
      const end = motion.heldTarget(dir);
      motion.facing = dir;
      motion.paint(false);
      if (!end) return;
      const d = motion.metric([motion.x, motion.y], end), scale = Math.min(4, d) / d;
      motion.go(motion.x + (end[0] - motion.x) * scale, motion.y + (end[1] - motion.y) * scale);
    });
  });
  viewport.addEventListener('pointerdown', () => viewport.focus({ preventScroll: true }));

  /* ---------- 상단 도구 ---------- */

  $('#zoom-in').addEventListener('click', () => camera.setZoom(camera.zoom * 1.25));
  $('#zoom-out').addEventListener('click', () => camera.setZoom(camera.zoom / 1.25));
  $('#fit').addEventListener('click', () => camera.setZoom(camera.minZoom()));

  /* ---------- 크게 보기 (지도를 화면 가득) ---------- */

  const mapFrame = $('#tour-map');
  const expandButton = $('#expand');
  function setExpanded(on) {
    if (mapFrame.classList.contains('is-expanded') === on) return;
    mapFrame.classList.toggle('is-expanded', on);
    document.body.classList.toggle('map-expanded', on);
    expandButton.setAttribute('aria-expanded', String(on));
    camera.reset(motion.x, motion.y);
    if (on) viewport.focus({ preventScroll: true });
    else expandButton.focus({ preventScroll: true });
  }
  expandButton.addEventListener('click', () => setExpanded(true));
  $('#collapse').addEventListener('click', () => setExpanded(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !dialog.open && mapFrame.classList.contains('is-expanded')) setExpanded(false);
  });
  // 휴대폰을 돌리면 그 방향에 맞는 배율로 (가로 + 크게 보기 = 층 전체가 한 화면에)
  matchMedia('(orientation: landscape)').addEventListener('change', () => {
    requestAnimationFrame(() => camera.reset(motion.x, motion.y));
  });
  $('#locate-player').addEventListener('click', () => {
    camera.center(motion.x, motion.y);
    viewport.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    viewport.focus({ preventScroll: true });
    say('캐릭터가 있는 곳으로 화면을 옮겼어요.');
  });
  $('#stop-walking').addEventListener('click', () => {
    walkRequest++;
    motion.cancel();
    motion.paint(false);
    pressedKeys.clear();
    viewport.focus({ preventScroll: true });
    say('이동을 멈췄어요.');
  });
  document.querySelectorAll('[data-scene]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.scene === scene.id) camera.center(motion.x, motion.y);
      else switchScene(button.dataset.scene);
    });
  });

  /* ---------- 공간 검색 ---------- */

  const searchInput = $('#space-search');
  const results = $('#search-results');

  function closeResults() {
    results.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
  }

  searchInput.addEventListener('input', () => {
    const q = compactText(searchInput.value.trim());
    results.replaceChildren();
    if (!q) return closeResults();
    results.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
    const found = allRooms.filter(room => compactText(room.name + (room.current || '')).includes(q));
    if (!found.length) {
      const li = document.createElement('li');
      li.className = 'search-empty';
      li.textContent = '일치하는 공간이 없어요. 다른 이름으로 찾아보세요.';
      results.append(li);
      return;
    }
    for (const room of found.slice(0, 12)) {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = '<span class="search-floor"></span><span class="search-name"></span>';
      button.querySelector('.search-floor').textContent = SCENES[room.scene].name;
      button.querySelector('.search-name').textContent = room.name + (room.where ? ` · ${room.where}` : '') + (room.current ? ` (현재 ${room.current})` : '');
      button.addEventListener('click', () => {
        closeResults();
        searchInput.value = '';
        openRoom(room, searchInput);
      });
      li.append(button);
      results.append(li);
    }
  });
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { searchInput.value = ''; closeResults(); }
    if (e.key === 'Enter') { e.preventDefault(); results.querySelector('button')?.click(); }
    if (e.key === 'ArrowDown' && !results.hidden) { e.preventDefault(); results.querySelector('button')?.focus(); }
  });
  results.addEventListener('keydown', e => {
    const buttons = [...results.querySelectorAll('button')];
    const i = buttons.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); buttons[Math.min(i + 1, buttons.length - 1)]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (i <= 0 ? searchInput : buttons[i - 1]).focus(); }
    if (e.key === 'Escape') { closeResults(); searchInput.focus(); }
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.space-search')) closeResults();
  });

  /* ---------- 시작 ---------- */

  // 주소로 바로 열기: #floor-3, #outdoor, ?room=카페실습실
  const params = new URLSearchParams(location.search);
  const hashScene = location.hash.match(/^#(?:floor-)?(outdoor|\d)$/)?.[1];
  const target = params.get('room') && allRooms.find(r => compactText(r.name) === compactText(params.get('room')));
  switchScene(target ? target.scene : (SCENES[hashScene] ? hashScene : 'outdoor'));
  motion.start();
  if (target) openRoom(target, null);

  // 다른 층 그림은 화면이 한가할 때 미리 받아 둡니다.
  const preload = () => ORDER.forEach(id => { new Image().src = SCENES[id].image; });
  if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 4000 });
  else setTimeout(preload, 2500);
})();
