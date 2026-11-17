/* 수아 선배의 체육관 3종 챌린지 — school-event-inspired, original mini games. */
(() => {
  const IMG = 'img/games/gym/', R = window.TourGymRules;
  const IDS = ['curling', 'target', 'badminton'], KEY = 'gch-tour-gym-best-v1';
  const INFO = {
    curling: { title: '스톤을 굴려라!', sport: '컬링', subtitle: '방향과 힘으로 만드는 한 수', intro: '매번 출발 위치가 달라져! 방향과 힘을 정해 내 스톤 3개를 중심 가까이.', help: '위로 밀고 놓기 · 또는 방향·힘 조절 후 밀기 · 힘은 매번 새로 정해요', rewards: '완주 ★1 · 10점 ★2 · 20점 ★3', practice: '스톤 1개 연습', max: 30 },
    target: { title: '정중앙을 노려라!', sport: '사격', subtitle: '숨 고르고, 지금!', intro: '움직이는 조준점이 중심에 올 때 발사! 기회는 5번이야.', help: '화면 터치 / 발사 버튼 / Space · 8점 이상 연속 명중 +1점', rewards: '완주 ★1 · 28점 ★2 · 44점 ★3', practice: '3발 연습', max: 54 },
    badminton: { title: '랠리! 배드민턴', sport: '배드민턴', subtitle: '받아치고, 스매시!', intro: '바닥 표시로 이동해서 받아쳐! 먼저 5점을 얻으면 승리야.', help: '← → / A D 이동 · Space 치기 · 모바일은 드래그 + 치기', rewards: '완주 ★1 · 3득점 또는 6랠리 ★2 · 승리 ★3', practice: '3번 받아치기 연습', max: 5 }
  };
  function readRecords() {
    try { const value = JSON.parse(localStorage.getItem(KEY) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; }
  }
  function recordValue(id) {
    const v = readRecords()[id];
    return { score: Number.isFinite(v?.score) ? Math.max(0, Math.min(INFO[id].max, v.score)) : 0, rally: Number.isFinite(v?.rally) ? Math.max(0, Math.min(100, v.rally)) : 0 };
  }
  function saveRecord(id, state) {
    const previous = recordValue(id), records = readRecords();
    records[id] = { score: Math.max(previous.score, id === 'badminton' ? state.mine : state.score), rally: Math.max(previous.rally, state.bestRally || 0) };
    try { localStorage.setItem(KEY, JSON.stringify(records)); } catch {}
    return records[id];
  }
  document.addEventListener('tour:stamps-reset', () => { try { localStorage.removeItem(KEY); } catch {} });
  function outfit() { try { return JSON.parse(localStorage.getItem('gch-tour-addons-v1') || '{}').equip || {}; } catch { return {}; } }
  function hub(container, api) {
    const stamps = window.tourGame?.stamps() || {}, count = IDS.filter(id => stamps[id]).length;
    container.innerHTML = `<section class="gym-hub" aria-label="체육관 종목 선택">
      <div class="gym-guide"><img src="${IMG}guide-sua.png" width="56" height="56" alt="수아 선배"><div><strong>수아 선배의 체육관 3종 챌린지</strong><p>우리 체육관 미니게임 대회, 너도 함께해!</p></div></div>
      <div class="gym-panorama"><img src="${IMG}gym-hall.png" width="640" height="320" alt="컬링 스톤, 사격 표적, 배드민턴 코트가 있는 픽셀 체육관"><span>원하는 종목부터 자유롭게!</span></div>
      <div class="gym-events">${IDS.map(id => {
        const info = INFO[id], best = recordValue(id), saved = stamps[id];
        return `<button type="button" class="gym-event" data-sport="${id}"><img src="${IMG}icon-${id}.png" width="48" height="48" alt=""><span><strong>${info.sport}</strong><small>${info.subtitle}</small></span><span class="gym-event-record">${saved ? '★'.repeat(saved.stars) + '☆'.repeat(3 - saved.stars) : '아직 도전 전'}<small>${saved ? (id === 'badminton' ? `최고 ${best.score}득점 · ${best.rally}랠리` : `최고 ${best.score}점`) : '연습부터 시작해도 좋아요'}</small></span></button>`;
      }).join('')}</div>
      <div class="gym-trophy ${count === 3 ? 'is-earned' : ''}"><img src="${IMG}trophy.png" width="56" height="56" alt=""><div><strong>${count === 3 ? '체육관 3종 완주 트로피 획득!' : `3종 완주 트로피 · ${count} / 3`}</strong><p>${count === 3 ? '세 종목 모두 도전했어요. 다음에는 최고 기록에 도전!' : '실전 세 종목을 끝까지 마치면 트로피를 받아요.'}</p></div></div>
      <p class="gym-note">종목별 최고 별 3개씩 · 연습은 기록과 별에 영향을 주지 않아요.</p></section>`;
    function click(e) { const id = e.target.closest('[data-sport]')?.dataset.sport; if (IDS.includes(id)) api.switchGame(id); }
    container.addEventListener('click', click); container.querySelector('[data-sport]').focus({ preventScroll: true });
    return () => container.removeEventListener('click', click);
  }
  function start(kind, container, api) {
    const info = INFO[kind], best = recordValue(kind), images = {}, keys = new Set();
    let engine = null, raf = 0, last = 0, disposed = false, ended = false, lastEvent = -1, drag = null, muted = false, previousX = 160;
    const audio = window.TourMelodyAudio?.create(), equip = outfit();
    container.innerHTML = `<section class="gym-game gym-${kind}" aria-label="${info.sport} 게임">
      <div class="gym-guide"><img src="${IMG}guide-sua.png" width="48" height="48" alt="수아 선배"><div><strong>수아 선배와 ${info.sport}</strong><p>${info.intro}</p></div></div>
      <div class="gym-hud"><strong class="gym-score">준비됐나요?</strong><span class="gym-round">${kind === 'badminton' ? `최고 ${best.score}득점` : `최고 ${best.score}점`}</span></div>
      <div class="gym-field"><canvas width="320" height="240" tabindex="0" role="img" aria-label="${info.sport} 경기장"></canvas><div class="gym-overlay" hidden></div></div>
      <p class="gym-message" role="status" aria-live="polite">${info.subtitle}</p>
      <div class="gym-setup"><button type="button" class="btn btn-primary" data-action="start">실전 시작</button><button type="button" class="btn" data-action="practice">${info.practice}</button></div>
      ${kind === 'curling' ? `<div class="gym-curling-controls"><label>방향 <output class="gym-angle-label">0°</output><input class="gym-angle" type="range" min="-28" max="28" value="0" step="1" aria-label="스톤 방향" disabled></label><label>힘 <output class="gym-power-label">0%</output><input class="gym-power" type="range" min="0" max="100" value="0" step="1" aria-label="스톤 힘" disabled></label></div>` : ''}
      <div class="gym-controls">${kind === 'badminton' ? '<button type="button" data-action="left" aria-label="왼쪽 이동" disabled>◀</button>' : ''}<button type="button" class="gym-main-action" data-action="act" disabled>${kind === 'curling' ? '스톤 밀기' : kind === 'target' ? '발사!' : '받아치기'}</button>${kind === 'badminton' ? '<button type="button" data-action="right" aria-label="오른쪽 이동" disabled>▶</button>' : ''}</div>
      <p class="gym-help">${info.help}</p><div class="gym-tools"><button type="button" class="btn" data-action="hub">종목 선택</button><button type="button" class="btn" data-action="pause" disabled>잠깐 쉬기</button><button type="button" class="btn" data-action="sound" aria-pressed="false">소리 켜짐</button></div>
      <p class="gym-rewards">${info.rewards}</p></section>`;
    const $ = s => container.querySelector(s), field = $('.gym-field'), canvas = $('canvas'), ctx = canvas.getContext('2d'), overlay = $('.gym-overlay');
    const dressed = document.createElement('canvas'); dressed.width = 48; dressed.height = 52;
    const sprite = new Image(); sprite.src = 'img/walker.png'; sprite.onload = () => { if (!disposed) paint(0); };
    for (const name of ['guide-sua', 'curling-rink', 'badminton-court', 'target-board', 'stone-coral', 'stone-mint', 'shuttle', 'racket']) {
      const image = new Image(); images[name] = image; image.onload = () => { if (!disposed) paint(0); }; image.src = IMG + name + '.png';
    }
    function art(name, x, y, w, h) { const im = images[name]; if (im?.complete && im.naturalWidth) { ctx.drawImage(im, Math.round(x), Math.round(y), w, h); return true; } return false; }
    function player(x, y, dir = 'up', frame = 1) {
      if (!sprite.complete || !sprite.naturalWidth) return;
      if (window.TourCostumes) { window.TourCostumes.draw(dressed.getContext('2d'), sprite, dir, frame, equip); ctx.drawImage(dressed, Math.round(x - 24), Math.round(y - 49), 48, 52); }
      else ctx.drawImage(sprite, frame * 32, (dir === 'up' ? 2 : 0) * 40, 32, 40, Math.round(x - 16), Math.round(y - 40), 32, 40);
    }
    function pixelRing(x, y, r, color) {
      ctx.fillStyle = color; x = Math.round(x); y = Math.round(y);
      for (let j = -r - 1; j <= r + 1; j++) for (let i = -r - 1; i <= r + 1; i++) {
        const d = i * i + j * j; if (d >= (r - 1) ** 2 && d <= (r + 1) ** 2) ctx.fillRect(x + i, y + j, 1, 1);
      }
    }
    function paint(now) {
      if (disposed) return;
      ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#e0bb83'; ctx.fillRect(0, 0, 320, 240);
      const s = engine?.state;
      if (kind === 'curling') {
        art('curling-rink', 0, 0, 320, 240);
        for (const stone of s?.stones || []) art('stone-' + stone.owner, stone.x - 12, stone.y - 12, 24, 24);
        if (!s || s.phase === 'aim') {
          const launchX = s?.launchX ?? 100;
          ctx.fillStyle = '#f3d78d'; ctx.fillRect(launchX - 16, 200, 32, 28);
          art('stone-coral', launchX - 12, 202, 24, 24);
          const a = (s?.angle || 0) * Math.PI / 180, power = s?.power || 0;
          if (power > 0) { ctx.fillStyle = '#14285a'; for (let d = 18; d < 35 + power * .6; d += 9) ctx.fillRect(Math.round(launchX + Math.sin(a) * d) - 1, Math.round(210 - Math.cos(a) * d), 3, 3); }
        }
        player(Math.max(48, (s?.launchX ?? 100) - 43), 233, 'up');
      } else if (kind === 'target') {
        ctx.fillStyle = '#e9ead5'; ctx.fillRect(0, 0, 320, 240); ctx.fillStyle = '#b9c4aa'; ctx.fillRect(14, 8, 292, 224);
        art('target-board', 40, 0, 240, 240);
        for (const [i, shot] of (s?.shots || []).entries()) {
          const x = Math.round(shot.x), y = Math.round(shot.y); ctx.fillStyle = '#14285a'; ctx.fillRect(x - 3, y - 3, 7, 7); ctx.fillStyle = '#fff6e6'; ctx.fillRect(x - 1, y - 1, 3, 3);
          if (i === s.shots.length - 1) pixelRing(x, y, 8, '#e85d75');
        }
        if (!s || s.phase === 'aim' || s.phase === 'paused') {
          const p = engine ? engine.position() : { x: 160, y: 120 }, x = Math.round(p.x), y = Math.round(p.y);
          ctx.strokeStyle = '#fffcf2'; ctx.lineWidth = 4; ctx.strokeRect(x - 9, y - 9, 18, 18); ctx.strokeStyle = '#14285a'; ctx.lineWidth = 2; ctx.strokeRect(x - 9, y - 9, 18, 18);
          ctx.fillStyle = '#14285a'; ctx.fillRect(x - 14, y, 9, 2); ctx.fillRect(x + 6, y, 9, 2); ctx.fillRect(x, y - 14, 2, 9); ctx.fillRect(x, y + 6, 2, 9);
        }
        player(23, 232, 'up');
      } else {
        art('badminton-court', 0, 0, 320, 240);
        const px = s?.player || 160, moving = Math.abs(px - previousX) > .1, frame = moving && !api.reducedMotion ? (Math.floor(now / 120) % 4 === 0 ? 0 : Math.floor(now / 120) % 4 === 2 ? 2 : 1) : 1; previousX = px;
        if (s?.phase === 'incoming') { ctx.fillStyle = '#ffe7a1'; ctx.fillRect(Math.round(s.toX) - 17, 188, 34, 4); pixelRing(s.toX, 189, 13, '#fff6e6'); }
        art('guide-sua', (s?.opponent || 160) - 16, 40, 32, 32);
        art('racket', (s?.opponent || 160) + 17, 49, 15, 20);
        player(px, 208, 'up', frame);
        art('racket', px + (s?.swing > 0 ? 18 : 12), s?.swing > 0 ? 160 : 177, 18, 24);
        if (s && ['incoming', 'outgoing'].includes(s.phase)) {
          const p = Math.min(1.12, s.flight / s.duration), incoming = s.phase === 'incoming';
          const x = s.fromX + (s.toX - s.fromX) * Math.min(1, p), y = incoming ? 65 + 123 * p : 188 - 123 * p;
          const arc = Math.sin(Math.min(1, p) * Math.PI) * 28;
          ctx.fillStyle = '#496b64'; ctx.fillRect(Math.round(x) - 4, Math.round(y), 8, 3);
          art('shuttle', x - 8, y - arc - 9, 16, 16);
        }
      }
    }
    function text(selector, value) { const el = $(selector), next = String(value); if (el.textContent !== next) el.textContent = next; }
    function disabled(selector, value) { const el = $(selector); if (el.disabled !== value) el.disabled = value; }
    function hud() {
      if (!engine) return;
      const s = engine.state;
      if ($('.gym-game').dataset.phase !== s.phase) $('.gym-game').dataset.phase = s.phase;
      text('.gym-score', s.practice ? '연습 중' : kind === 'badminton' ? `나 ${s.mine} : ${s.theirs} 수아` : `${s.score}점`);
      text('.gym-round', kind === 'curling' ? `${s.throws} / ${s.limit}개 · ${s.launchX < 130 ? '왼쪽' : s.launchX > 190 ? '오른쪽' : '가운데'} 출발` : kind === 'target' ? `${s.shots.length} / ${s.limit}발${s.combo > 1 ? ` · ${s.combo}연속` : ''}` : s.practice ? `${s.returns} / 3번 성공` : `${s.rally}랠리 · 먼저 5점`);
      const running = !['paused', 'finished'].includes(s.phase);
      disabled('[data-action="act"]', !running || (kind !== 'badminton' && s.phase !== 'aim') || (kind === 'curling' && s.power <= 0));
      disabled('[data-action="pause"]', !running);
      for (const button of container.querySelectorAll('[data-action="left"],[data-action="right"]')) if (button.disabled !== !running) button.disabled = !running;
      if (kind === 'curling') {
        disabled('.gym-angle', s.phase !== 'aim'); disabled('.gym-power', s.phase !== 'aim');
        if (Number($('.gym-angle').value) !== Math.round(s.angle)) $('.gym-angle').value = Math.round(s.angle);
        if (Number($('.gym-power').value) !== Math.round(s.power)) $('.gym-power').value = Math.round(s.power);
        text('.gym-angle-label', `${Math.round(s.angle)}°`); text('.gym-power-label', `${Math.round(s.power)}%`);
        text('[data-action="act"]', s.phase === 'aim' && s.power <= 0 ? '힘을 먼저 정해요' : '스톤 밀기');
        if (s.phase === 'aim' && lastEvent !== s.event) $('.gym-angle').focus({ preventScroll: true });
      }
      if (lastEvent !== s.event) { lastEvent = s.event; $('.gym-message').textContent = s.message; }
      const label = `${info.sport}, ${$('.gym-score').textContent}, ${$('.gym-round').textContent}${kind === 'badminton' && s.phase === 'incoming' ? `, 셔틀콕 도착 위치 ${Math.round(s.toX / 3.2)}퍼센트` : ''}`;
      if (canvas.getAttribute('aria-label') !== label) canvas.setAttribute('aria-label', label);
    }
    function begin(practice) {
      if (disposed) return;
      cancelAnimationFrame(raf); engine = R[kind]({ practice }); ended = false; lastEvent = -1; drag = null; keys.clear();
      $('.gym-setup').hidden = true; overlay.hidden = true; last = performance.now(); audio?.unlock();
      const instructions = practice ? (kind === 'curling' ? '스톤 1개로 방향과 힘을 익혀 봐. 연습은 별을 주지 않아.' : kind === 'target' ? '세 발로 조준 타이밍을 익혀 봐. 연습은 별을 주지 않아.' : '세 번만 받아쳐 봐! 놓쳐도 괜찮아. 연습은 계속할 수 있어.') : info.intro;
      text('.gym-guide p', instructions);
      hud(); paint(last); (kind === 'curling' ? $('.gym-angle') : $('[data-action="act"]')).focus({ preventScroll: true }); raf = requestAnimationFrame(tick);
      api.announce(`${info.sport} ${practice ? '연습' : '실전'} 시작. ${instructions}`);
    }
    function finish() {
      if (ended || disposed) return; ended = true; cancelAnimationFrame(raf); audio?.stop(); keys.clear();
      const s = engine.state; hud(); paint(performance.now());
      if (s.practice) {
        overlay.hidden = false; overlay.innerHTML = `<h3>연습 완료!</h3><p>${kind === 'badminton' ? '세 번 받아쳤어! 이제 수아 선배와 한 판!' : `${s.score}점! 이제 실전에 도전해 볼까?`}</p><button type="button" class="btn btn-primary" data-action="start">실전 시작</button><button type="button" class="btn" data-action="practice">한 번 더 연습</button>`;
        overlay.querySelector('button').focus({ preventScroll: true }); api.announce('연습 완료. 별과 기록은 바뀌지 않았어요.'); return;
      }
      const record = saveRecord(kind, s), extra = document.createElement('div'); extra.className = 'gym-summary';
      const title = kind === 'badminton' ? (s.mine >= 5 ? '승리! 수아 선배와 하이파이브!' : '좋은 경기였어! 다시 한 판?') : kind === 'curling' ? '마지막 스톤까지 도착!' : '다섯 발, 집중력 도전 완료!';
      const score = kind === 'badminton' ? `${s.mine} : ${s.theirs} · 최고 ${s.bestRally}랠리 · 스매시 ${s.smashes}회` : `${s.score}점 · 내 최고 ${record.score}점`;
      const completed = IDS.every(id => id === kind || window.tourGame?.stamps()[id]);
      extra.innerHTML = `<img src="${IMG}${completed ? 'trophy' : 'icon-' + kind}.png" width="80" height="80" alt=""><h3>${title}</h3><p>${score}</p>${kind === 'curling' ? `<p>내 스톤 최종 점수: ${s.stones.filter(v => v.owner === 'coral').map(v => R.curlingPoints(v.x, v.y)).join(' + ')}</p>` : ''}${kind === 'target' ? `<p>명중 점수: ${s.shots.map(v => v.base + (v.bonus ? '+1' : '')).join(' / ')}</p>` : ''}${completed ? '<strong class="gym-complete-note">체육관 3종 완주 트로피 획득!</strong>' : '<p>다른 종목에도 도전해서 3종 완주 트로피를 모아 봐!</p>'}`;
      api.done({ stars: R.stars(kind, s), extra });
    }
    function tick(now) {
      if (disposed || !engine || engine.state.phase === 'paused') return;
      const dt = (now - last) / 1000; last = now;
      // Background/blur events pause explicitly. A slow render frame must not
      // repeatedly stop an otherwise focused game or fast-forward the physics.
      for (let remaining = Math.min(dt, .25); remaining > .000001; remaining -= 1 / 60) engine.advance(Math.min(remaining, 1 / 60));
      hud(); paint(now);
      if (engine.state.phase === 'finished') { finish(); return; }
      raf = requestAnimationFrame(tick);
    }
    function act() {
      if (!engine || disposed || ended) return;
      let accepted = false;
      if (kind === 'curling') accepted = engine.release(); else if (kind === 'target') accepted = engine.shoot(); else accepted = engine.hit();
      if (accepted) audio?.tone(kind === 'target' ? 740 : kind === 'badminton' ? 520 : 330, .09, 0);
      hud(); paint(performance.now()); if (engine.state.phase === 'finished') finish();
    }
    function pause() {
      if (!engine || ended || !engine.pause()) return;
      cancelAnimationFrame(raf); keys.clear(); drag = null; engine.input?.(0); audio?.stop(); hud();
      overlay.hidden = false; overlay.innerHTML = '<h3>잠깐 쉬는 중</h3><p>경기도 함께 멈췄어요.</p><button type="button" class="btn btn-primary" data-action="resume">계속하기</button>';
      overlay.querySelector('button').focus({ preventScroll: true }); api.announce('경기 일시정지. 계속하기를 누르면 이어져요.');
    }
    function resume() {
      if (!engine?.resume()) return; overlay.hidden = true; last = performance.now(); audio?.unlock(); hud();
      api.announce(`${info.sport} 경기를 이어서 시작해요.`);
      (kind === 'curling' ? (engine.state.phase === 'aim' ? $('.gym-angle') : canvas) : $('[data-action="act"]')).focus({ preventScroll: true }); raf = requestAnimationFrame(tick);
    }
    function click(e) {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'start') begin(false); else if (action === 'practice') begin(true); else if (action === 'act') act();
      else if (action === 'pause') pause(); else if (action === 'resume') resume(); else if (action === 'hub') api.switchGame('gym');
      else if (action === 'sound') { muted = !muted; audio?.setMuted(muted); $('[data-action="sound"]').textContent = muted ? '소리 꺼짐' : '소리 켜짐'; $('[data-action="sound"]').setAttribute('aria-pressed', String(muted)); if (!muted) audio?.unlock(); }
      else if ((action === 'left' || action === 'right') && e.detail === 0) engine?.moveTo(engine.state.player + (action === 'left' ? -35 : 35));
    }
    function input() { if (kind === 'curling' && engine) { engine.aim(Number($('.gym-angle').value), Number($('.gym-power').value)); hud(); paint(performance.now()); } }
    function point(e) { const rect = canvas.getBoundingClientRect(); return { x: (e.clientX - rect.left) * 320 / rect.width, y: (e.clientY - rect.top) * 240 / rect.height }; }
    function pointerDown(e) {
      if (e.button !== 0 || !engine || ended || engine.state.phase === 'paused') return;
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (kind === 'badminton' && (action === 'left' || action === 'right')) { e.preventDefault(); e.target.setPointerCapture(e.pointerId); engine.input(action === 'left' ? -1 : 1); return; }
      if (e.target !== canvas) return;
      e.preventDefault(); canvas.focus({ preventScroll: true }); canvas.setPointerCapture(e.pointerId);
      if (kind === 'target') act();
      else if (kind === 'badminton') { drag = { id: e.pointerId }; engine.moveTo(point(e).x); }
      else if (engine.state.phase === 'aim') drag = { id: e.pointerId, start: point(e), moved: false };
    }
    function pointerMove(e) {
      if (!drag || drag.id !== e.pointerId || !engine || engine.state.phase === 'paused') return;
      const p = point(e);
      if (kind === 'badminton') engine.moveTo(p.x);
      else if (kind === 'curling') {
        const dx = p.x - drag.start.x, dy = drag.start.y - p.y;
        drag.moved = dy > 12; if (drag.moved) { engine.aim(Math.atan2(dx, dy) * 180 / Math.PI, dy * .75); hud(); paint(performance.now()); }
      }
    }
    function pointerUp(e) {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (kind === 'badminton' && (action === 'left' || action === 'right')) engine?.input(0);
      if (drag?.id !== e.pointerId) return;
      const release = kind === 'curling' && drag.moved && e.type === 'pointerup'; drag = null; if (release) act();
    }
    function keyboard(e) {
      if (!engine || ended || e.target.closest('input,textarea,select,a') || e.target.isContentEditable) return;
      const key = e.code || e.key, direction = ['ArrowLeft','KeyA','a','A'].includes(key) ? -1 : ['ArrowRight','KeyD','d','D'].includes(key) ? 1 : 0;
      if (kind === 'badminton' && direction) {
        e.preventDefault(); e.stopPropagation(); if (e.type === 'keydown') keys.add(direction); else keys.delete(direction);
        engine.input((keys.has(1) ? 1 : 0) - (keys.has(-1) ? 1 : 0)); return;
      }
      if (e.type !== 'keydown' || !['Space',' ','Enter'].includes(key)) return;
      if (e.repeat) { e.preventDefault(); return; }
      if (e.target.closest('button')) return; // Native button activation remains accessible.
      e.preventDefault(); e.stopPropagation(); act();
    }
    const hidden = () => { if (document.hidden) pause(); };
    container.addEventListener('click', click); container.addEventListener('input', input); container.addEventListener('keydown', keyboard); container.addEventListener('keyup', keyboard);
    container.addEventListener('pointerdown', pointerDown); container.addEventListener('pointermove', pointerMove); container.addEventListener('pointerup', pointerUp); container.addEventListener('pointercancel', pointerUp); container.addEventListener('lostpointercapture', pointerUp);
    document.addEventListener('visibilitychange', hidden); window.addEventListener('blur', pause);
    paint(0); $('[data-action="start"]').focus({ preventScroll: true });
    return () => {
      disposed = true; cancelAnimationFrame(raf); audio?.dispose(); keys.clear(); sprite.onload = null; Object.values(images).forEach(im => im.onload = null);
      container.removeEventListener('click', click); container.removeEventListener('input', input); container.removeEventListener('keydown', keyboard); container.removeEventListener('keyup', keyboard);
      container.removeEventListener('pointerdown', pointerDown); container.removeEventListener('pointermove', pointerMove); container.removeEventListener('pointerup', pointerUp); container.removeEventListener('pointercancel', pointerUp); container.removeEventListener('lostpointercapture', pointerUp);
      document.removeEventListener('visibilitychange', hidden); window.removeEventListener('blur', pause);
    };
  }
  window.TOUR_GAMES.gym = { title: '체육관 3종 챌린지', button: '🏆 체육관 3종 챌린지', room: '체육관', naver: 'Gym', isHub: true, start: hub };
  for (const id of IDS) window.TOUR_GAMES[id] = { title: INFO[id].title, button: INFO[id].sport + ' 도전', room: '체육관', naver: id === 'target' ? 'Target' : id === 'curling' ? 'Curling' : 'Badminton', maxStars: 3, hub: 'gym', stamp: `체육관 ${INFO[id].sport} 도장 획득!`, message: '배드민턴·사격·컬링! 우리 체육관의 미니게임 대회를 즐겨 봐요.', start: (container, api) => start(id, container, api) };
})();
