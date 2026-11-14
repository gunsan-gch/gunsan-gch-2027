/* 픽셀 학교 투어 — 조리제빵실 「n.00초 빵 굽기」
 * 목표·별 기준·문구는 아래에서 고칩니다. 결과 화면과 도장은 games.js가 맡습니다.
 */
(() => {
  /* ---------- 선생님이 고칠 수 있는 데이터 ---------- */
  // target은 목표 초, hideAfter는 히든 이벤트가 걸렸을 때 숫자를 가리기 시작하는 초입니다.
  const ROUNDS = [
    { name: '반죽 치대기', target: 5.00, hideAfter: 3.0, tip: '반죽은 딱 알맞게 치대야 쫄깃해요.' },
    { name: '발효', target: 7.00, hideAfter: 4.0, tip: '너무 오래 두면 반죽이 꺼져요.' },
    { name: '굽기', target: 10.00, hideAfter: 5.0, tip: '오븐 앞을 떠나면 빵이 타요!' }
  ];
  // 오차(초)에 맞는 첫 줄을 씁니다. miss는 빠르면 덜 익음, 늦으면 탔어요.
  const GRADES = [
    { within: 0.05, stars: 3, text: '완벽해요!', bread: 'perfect' },
    { within: 0.20, stars: 2, text: '좋아요', bread: 'good' },
    { within: 0.50, stars: 1, text: '아슬아슬', bread: 'okay' },
    { within: Infinity, stars: 1, text: '조금 더 집중!', bread: 'miss' }
  ];
  // 히든 이벤트: 이 확률(0~1)로 그 라운드의 숫자가 hideAfter초부터 가려집니다. 평소에는 끝까지 보임
  const HIDDEN_CHANCE = 0.2;
  const STAMP_TEXT = '조리제빵실 도장 획득!';
  const RESULT_TEXT = '카페비즈과에서는 제과제빵 실습으로 반죽부터 굽기까지 직접 만들어 봐요.'; // ※ 학교 확인
  const DEPT_LINK = { href: '../index.html#cafe', label: '카페비즈과 알아보기 →' };
  const IMG = 'img/games/bakery/';
  const seconds = ms => (ms / 1000).toFixed(2);
  // 터치 기기에는 스페이스바 안내를 붙이지 않음
  const KEY_HINT = matchMedia('(pointer: coarse)').matches ? '' : ' (스페이스바)';
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };

  function start(container, api) {
    const state = { round: 0, phase: 'ready', began: 0, results: [], hidden: false };
    let frame = 0;
    let timer = 0;
    container.innerHTML = `
      <div class="bakery-game">
        <p class="bakery-progress"></p>
        <h3 class="bakery-target"></h3>
        <p class="bakery-tip"></p>
        <div class="bakery-clock">
          <p class="bakery-time" aria-hidden="true">0.00</p>
          <p class="bakery-guide"></p>
        </div>
        <img class="bakery-bread" width="128" height="128" alt="">
        <div class="bakery-feedback" hidden>
          <p class="bakery-error"></p>
          <p class="bakery-grade"></p>
          <p class="bakery-stars" role="img"></p>
        </div>
        <button type="button" class="btn btn-primary bakery-button"></button>
        <p class="bakery-status sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
      </div>`;
    const $ = selector => container.querySelector(selector);
    const root = $('.bakery-game');
    const time = $('.bakery-time');
    const bread = $('.bakery-bread');
    const button = $('.bakery-button');
    const say = text => { $('.bakery-status').textContent = text; };

    function clearClock() {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    }

    function ready() {
      const round = ROUNDS[state.round];
      state.phase = 'ready';
      root.classList.remove('bakery-picked', 'bakery-miss');
      // 히든 이벤트 추첨 (window.TOUR_GAMES.bakery.hiddenChance 로 바꿀 수 있음)
      state.hidden = Math.random() < (window.TOUR_GAMES.bakery.hiddenChance ?? HIDDEN_CHANCE);
      root.classList.toggle('bakery-hidden-event', state.hidden);
      $('.bakery-progress').textContent = `${state.round + 1} / ${ROUNDS.length} · ${round.name}`;
      $('.bakery-target').textContent = `목표 ${round.target.toFixed(2)}초`;
      $('.bakery-tip').textContent = round.tip;
      $('.bakery-guide').textContent = state.hidden
        ? `🎲 히든 이벤트! 중간에 숫자가 가려져요. 감으로 ${round.target.toFixed(2)}초에 멈춰요!`
        : `${round.target.toFixed(2)}초에 딱 맞춰 멈춰요!`;
      $('.bakery-feedback').hidden = true;
      time.textContent = '0.00';
      time.classList.remove('bakery-hidden');
      bread.src = IMG + (state.round === 1 ? 'risen.png' : 'dough.png');
      bread.alt = state.round === 1 ? '부푼 반죽' : '반죽 공';
      button.textContent = '시작' + KEY_HINT;
      button.focus({ preventScroll: true });
      say(`${round.name}. 목표 ${round.target.toFixed(2)}초.${state.hidden ? ' 히든 이벤트: 중간에 숫자가 가려져요.' : ''} 시작 버튼을 눌러요.`);
    }

    function tick() {
      if (state.phase !== 'running') return;
      const now = performance.now();
      const elapsed = now - state.began;
      const round = ROUNDS[state.round];
      if (elapsed >= round.target * 2000) return stop(now);   // 목표의 두 배가 지나면 자동 정지
      const hidden = state.hidden && elapsed >= round.hideAfter * 1000;
      time.textContent = hidden ? '?.??' : seconds(elapsed);
      time.classList.toggle('bakery-hidden', hidden);
      frame = requestAnimationFrame(tick);
    }

    function begin(now) {
      state.phase = 'running';
      state.began = now;
      button.textContent = '지금!' + KEY_HINT;
      say(`${ROUNDS[state.round].name} 시작. ${ROUNDS[state.round].target.toFixed(2)}초에 멈춰요!`);
      frame = requestAnimationFrame(tick);
      // 목표의 두 배(굽기는 20초)가 지나면 자동 정지. 배경 탭에서 rAF가 멈춰도 타이머로 처리합니다.
      timer = setTimeout(() => stop(performance.now()), ROUNDS[state.round].target * 2000);
    }

    function stop(now) {
      if (state.phase !== 'running') return;
      state.phase = 'stopped';
      clearClock();
      const round = ROUNDS[state.round];
      const elapsed = now - state.began;
      const delta = elapsed - round.target * 1000;
      const error = Math.abs(delta);
      // 표시용 반올림으로 판정하지 않습니다. 극미세한 부동소수점 경계 오차만 보정합니다.
      const grade = GRADES.find(row => error <= row.within * 1000 + 1e-7);
      state.results.push({ target: round.target, elapsed, error, stars: grade.stars });
      const miss = grade.bread === 'miss';
      const baked = miss ? (delta < 0 ? 'raw' : 'burnt') : grade.bread;
      const label = miss ? (delta < 0 ? '덜 익음' : '탔어요') : grade.text;
      const difference = error < 1e-7 ? '오차 0.00초 · 정확해요!' : `${seconds(error)}초 ${delta < 0 ? '빨랐어요' : '늦었어요'}`;
      time.textContent = `${seconds(elapsed)}초`;
      time.classList.remove('bakery-hidden');
      $('.bakery-error').textContent = difference;
      $('.bakery-grade').textContent = miss ? `${grade.text} · ${label}` : grade.text;
      $('.bakery-stars').textContent = '★'.repeat(grade.stars) + '☆'.repeat(3 - grade.stars);
      $('.bakery-stars').setAttribute('aria-label', `별 3개 중 ${grade.stars}개`);
      $('.bakery-feedback').hidden = false;
      bread.src = `${IMG}bread-${baked}.png`;
      bread.alt = miss ? label : `${label} · 구운 빵`;
      if (!api.reducedMotion) {
        root.classList.add('bakery-picked');
        root.classList.toggle('bakery-miss', miss);
      }
      button.textContent = state.round === ROUNDS.length - 1 ? '결과 보기' : '다음 단계 →';
      button.focus({ preventScroll: true });
      say(`${round.name} ${seconds(elapsed)}초. ${difference}. ${grade.text} ${miss ? label : ''}. 별 ${grade.stars}개.`);
    }

    function next() {
      if (state.round < ROUNDS.length - 1) {
        state.round++;
        ready();
        return;
      }
      state.phase = 'finished';
      const extra = el('div', 'bakery-summary', '');
      const total = state.results.reduce((sum, result) => sum + result.error, 0);
      extra.append(el('strong', 'bakery-total', `총 오차 ${seconds(total)}초`));
      extra.append(el('p', 'bakery-detail', state.results.map(result =>
        `${result.target.toFixed(2)}→${seconds(result.elapsed)}`).join(' · ')));
      api.done({ stars: state.results.reduce((sum, result) => sum + result.stars, 0), hints: 0, extra });
    }

    function act(now) {
      if (state.phase === 'ready') begin(now);
      else if (state.phase === 'running') stop(now);
      else if (state.phase === 'stopped') next();
    }

    function onKey(e) {
      const now = performance.now();
      if (e.key !== ' ' && e.key !== 'Enter') return;
      if (e.isComposing || e.target.isContentEditable || e.target.closest('input, textarea, select, a')) return;
      // 닫기 등 다른 버튼의 기본 키보드 동작은 가로채지 않습니다.
      if (e.target.closest('button') && e.target !== button) return;
      e.preventDefault();
      if (!e.repeat) act(now);
    }

    function onPointer(e) {
      const now = performance.now();
      if (!e.isPrimary || e.button !== 0) return;
      e.preventDefault();
      button.focus({ preventScroll: true });
      act(now);
    }

    container.addEventListener('keydown', onKey);
    button.addEventListener('pointerdown', onPointer);
    ready();
    return () => {
      state.phase = 'finished';
      clearClock();
      container.removeEventListener('keydown', onKey);
      button.removeEventListener('pointerdown', onPointer);
    };
  }

  window.TOUR_GAMES = window.TOUR_GAMES || {};
  window.TOUR_GAMES.bakery = {
    title: 'n.00초 빵 굽기', button: '🍞 n.00초 빵 굽기', room: '조리제빵실', naver: 'Bakery', maxStars: 9,
    stamp: STAMP_TEXT,
    message: RESULT_TEXT,
    cta: DEPT_LINK,
    hiddenChance: HIDDEN_CHANCE,
    start
  };
})();
