/* =========================================================================
   픽셀 학교 투어 — 카페실습실 「음료 만들기 체험」
   손님 주문에 맞게 컵과 재료를 눌러 담고 [음료 내기]를 누르는 3라운드 게임입니다 (1분 안팎).
   주문·재료·문구는 맨 위 목록만 고치면 됩니다. 창 열기·결과 화면·도장 저장은 games.js가 맡습니다.

   규칙
   - 컵을 맨 먼저 고릅니다. 컵 없이 재료를 누르면 "먼저 컵을 골라요".
   - 재료는 순서 상관없이 구성이 정확히 같으면 정답. 같은 재료를 두 번 누르면 무시.
   - 라운드마다 별 3개로 시작, [레시피 보기]·틀린 음료마다 1개씩 줄고 최소 1개.
   ========================================================================= */

(() => {
  const IMG = 'img/games/cafe/';

  /* ---------- 선생님이 고칠 수 있는 데이터 ---------- */

  // 재료 9개 (3×3 순서대로). cup이 있으면 컵 — 맨 먼저 골라야 하고 하나만 들어갑니다.
  // emoji는 그림(img/games/cafe/<id>.png)을 못 불러올 때 대신 보여 주는 글자입니다.
  const INGREDIENTS = [
    { id: 'cup-ice', name: '투명컵', cup: 'ice', emoji: '🥤' },
    { id: 'cup-mug', name: '머그컵', cup: 'mug', emoji: '☕' },
    { id: 'ice', name: '얼음', emoji: '🧊' },
    { id: 'shot', name: '에스프레소 샷', emoji: '🟫' },
    { id: 'water', name: '물', emoji: '💧' },
    { id: 'milk', name: '우유', emoji: '🥛' },
    { id: 'steamed-milk', name: '스팀우유', emoji: '🫧' },
    { id: 'vanilla', name: '바닐라 시럽', emoji: '🍯' },
    { id: 'strawberry', name: '딸기청', emoji: '🍓' }
  ];

  // 라운드별 주문. recipe는 재료 id 목록 (컵 하나 + 재료들, 순서는 상관없음). customer는 손님 그림 번호
  const ORDERS = [
    { drink: '아이스 아메리카노', customer: 1, who: '학생', say: '아이스 아메리카노 한 잔 주세요!',
      recipe: ['cup-ice', 'ice', 'water', 'shot'] },
    { drink: '따뜻한 카페라떼', customer: 2, who: '선생님', say: '따뜻한 카페라떼 한 잔 부탁해요.',
      recipe: ['cup-mug', 'shot', 'steamed-milk'] },
    { drink: '아이스 바닐라라떼', customer: 3, who: '학부모', say: '아이스 바닐라라떼로 주세요.',
      recipe: ['cup-ice', 'vanilla', 'ice', 'milk', 'shot'] }
  ];

  const STARS_PER_ROUND = 3;   // 라운드 시작 별 수 (힌트·실수마다 1개씩 줄고 최소 1개)
  const STAMP_TEXT = '카페실습실 도장 획득!';
  const RESULT_TEXT = '카페비즈과에서는 음료 만들기와 카페 운영을 직접 실습해요.';   // ※ 학교 확인 후 바뀔 수 있는 문구
  const DEPT_LINK = { href: '../index.html#cafe', label: '카페비즈과 알아보기 →' };   // 학과 소개의 카페비즈과 탭

  /* ---------- 도우미 ---------- */

  const byId = Object.fromEntries(INGREDIENTS.map(item => [item.id, item]));
  const names = ids => ids.map(id => byId[id]?.name || id).join(', ');
  // 받침에 따라 을/를
  const object = word => {
    const code = word.charCodeAt(word.length - 1);
    return code >= 0xAC00 && code <= 0xD7A3 && (code - 0xAC00) % 28 ? `${word}을` : `${word}를`;
  };
  const starText = n => '★'.repeat(n) + '☆'.repeat(Math.max(0, STARS_PER_ROUND - n));

  /* ---------- 게임 ---------- */

  function start(container, api) {
    const state = { round: 0, cup: null, items: [], penalty: 0, hinted: false, locked: false, stars: [], hints: 0 };
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };

    container.innerHTML = `
      <div class="cafe">
        <div class="cafe-top">
          <div class="cafe-customer">
            <img width="128" height="128" alt="">
          </div>
          <div class="cafe-bubble">
            <span class="cafe-who"></span>
            <p class="cafe-order"></p>
            <p class="cafe-recipe" hidden></p>
          </div>
          <div class="cafe-score">
            <span class="cafe-round"></span>
            <span class="cafe-stars" role="img"></span>
          </div>
        </div>
        <div class="cafe-stage">
          <div class="cafe-cup" data-cup="">
            <span class="cafe-cup-hint" aria-hidden="true">컵을 골라요</span>
            <div class="cafe-layers"></div>
          </div>
        </div>
        <p class="cafe-message" role="status" aria-live="polite"></p>
        <div class="cafe-tray" role="group" aria-label="컵과 재료 (누르면 컵에 담겨요)"></div>
        <div class="cafe-actions">
          <button type="button" class="btn cafe-hint-button" aria-pressed="false">💡 레시피 보기</button>
          <button type="button" class="btn cafe-reset">처음부터</button>
          <button type="button" class="btn btn-primary cafe-serve">음료 내기</button>
        </div>
      </div>`;

    const $ = selector => container.querySelector(selector);
    const customerImg = $('.cafe-customer img');
    const customerBox = $('.cafe-customer');
    const whoEl = $('.cafe-who');
    const orderEl = $('.cafe-order');
    const recipeEl = $('.cafe-recipe');
    const roundEl = $('.cafe-round');
    const starsEl = $('.cafe-stars');
    const cupEl = $('.cafe-cup');
    const layersEl = $('.cafe-layers');
    const messageEl = $('.cafe-message');
    const tray = $('.cafe-tray');
    const hintButton = $('.cafe-hint-button');
    const resetButton = $('.cafe-reset');
    const serveButton = $('.cafe-serve');

    // 손님 그림을 못 불러오면 이모지로
    const CUSTOMER_EMOJI = ['🧑‍🎓', '🧑‍🏫', '🧑'];
    customerImg.addEventListener('error', () => {
      customerImg.hidden = true;
      customerBox.dataset.emoji = CUSTOMER_EMOJI[(ORDERS[state.round].customer - 1) % CUSTOMER_EMOJI.length];
    });

    // 재료 버튼 9개
    const buttons = {};
    for (const item of INGREDIENTS) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cafe-ing' + (item.cup ? ' is-cup' : '');
      button.dataset.id = item.id;
      button.setAttribute('aria-pressed', 'false');
      const img = document.createElement('img');
      img.src = IMG + item.id + '.png';
      img.width = 48; img.height = 48;
      img.alt = '';
      img.addEventListener('error', () => {
        const emoji = document.createElement('span');
        emoji.className = 'cafe-ing-emoji';
        emoji.setAttribute('aria-hidden', 'true');
        emoji.textContent = item.emoji;
        img.replaceWith(emoji);
      }, { once: true });
      const label = document.createElement('span');
      label.className = 'cafe-ing-name';
      label.textContent = item.name;
      button.append(img, label);
      button.addEventListener('click', () => pick(item));
      tray.append(button);
      buttons[item.id] = button;
    }

    const say = text => { messageEl.textContent = text; };
    const shake = () => {
      if (api.reducedMotion) return;
      cupEl.classList.remove('is-shake');
      void cupEl.offsetWidth;   // 같은 애니메이션을 다시 시작하기 위해
      cupEl.classList.add('is-shake');
    };

    function updateStars() {
      const left = Math.max(1, STARS_PER_ROUND - state.penalty);
      starsEl.textContent = starText(left);
      starsEl.setAttribute('aria-label', `이번 라운드 별 ${left}개`);
    }

    /** 컵·담긴 재료·버튼 눌림 상태를 화면에 반영. fresh는 방금 넣은 재료(떨어지는 움직임) */
    function render(fresh = null) {
      cupEl.dataset.cup = state.cup ? byId[state.cup].cup : '';
      layersEl.replaceChildren();
      for (const id of state.items) {
        const layer = document.createElement('span');
        layer.className = 'cafe-layer' + (id === fresh && !api.reducedMotion ? ' is-new' : '');
        layer.dataset.ing = id;
        layersEl.append(layer);
      }
      for (const [id, button] of Object.entries(buttons)) {
        button.setAttribute('aria-pressed', String(id === state.cup || state.items.includes(id)));
      }
    }

    function pick(item) {
      if (state.locked) return;
      if (item.cup) {
        if (state.cup === item.id) return say(`${object(item.name)} 이미 골랐어요.`);
        state.cup = item.id;
        render();
        return say(`${object(item.name)} 골랐어요. 이제 재료를 담아요.`);
      }
      if (!state.cup) { shake(); return say('먼저 컵을 골라요.'); }
      if (state.items.includes(item.id)) return say(`${object(item.name)} 이미 넣었어요.`);
      state.items.push(item.id);
      render(item.id);
      say(`${object(item.name)} 넣었어요.`);
    }

    function resetCup() {
      if (state.locked) return;
      state.cup = null;
      state.items = [];
      render();
      say('컵을 비웠어요. 다시 컵부터 골라요.');
    }

    function showHint() {
      if (state.locked) return;
      const order = ORDERS[state.round];
      const recipe = order.recipe.map(id => byId[id].name).join(' + ');
      recipeEl.hidden = false;
      recipeEl.textContent = `레시피: ${recipe}`;
      hintButton.setAttribute('aria-pressed', 'true');
      if (state.hinted) return say(`레시피: ${recipe}`);
      state.hinted = true;
      state.hints++;
      state.penalty++;
      updateStars();
      say(`레시피를 봤어요 (별 1개 감점). ${recipe}`);
    }

    function serve() {
      if (state.locked) { nextRound(); return; }
      if (!state.cup) { shake(); return say('먼저 컵을 골라요.'); }
      const order = ORDERS[state.round];
      const want = new Set(order.recipe);
      const have = new Set([state.cup, ...state.items]);
      const missing = order.recipe.filter(id => !have.has(id));
      const extra = [...have].filter(id => !want.has(id));
      if (!missing.length && !extra.length) return succeed(order);

      state.penalty++;
      updateStars();
      shake();
      const parts = [];
      if (missing.length) parts.push(`빠진 재료: ${names(missing)}`);
      if (extra.length) parts.push(`더 들어간 재료: ${names(extra)}`);
      say(`앗, ${order.drink}가 아니에요. ${parts.join(' · ')}. 고쳐서 다시 내 봐요.`);
    }

    function succeed(order) {
      const stars = Math.max(1, STARS_PER_ROUND - state.penalty);
      state.stars.push(stars);
      state.locked = true;
      customerBox.classList.add('is-happy');
      cupEl.classList.add('is-served');
      whoEl.textContent = `${order.who} 손님`;
      orderEl.textContent = `고마워요! 딱 제가 원하던 ${order.drink}예요.`;
      recipeEl.hidden = true;
      hintButton.disabled = true;
      resetButton.disabled = true;
      const last = state.round === ORDERS.length - 1;
      serveButton.textContent = last ? '결과 보기' : '다음 손님 →';
      serveButton.focus({ preventScroll: true });
      say(`정답! ${order.drink} 완성. 별 ${stars}개를 받았어요.${last ? '' : ' 다음 손님이 기다려요.'}`);
    }

    function nextRound() {
      if (state.round >= ORDERS.length - 1) {
        api.done({ stars: state.stars.reduce((a, b) => a + b, 0), hints: state.hints });
        return;
      }
      state.round++;
      startRound();
    }

    function startRound() {
      const order = ORDERS[state.round];
      Object.assign(state, { cup: null, items: [], penalty: 0, hinted: false, locked: false });
      customerBox.classList.remove('is-happy');
      cupEl.classList.remove('is-served');
      customerImg.hidden = false;
      delete customerBox.dataset.emoji;
      customerImg.src = `${IMG}customer-${order.customer}.png`;
      customerImg.alt = `${order.who} 손님`;
      whoEl.textContent = `${order.who} 손님`;
      orderEl.textContent = order.say;
      recipeEl.hidden = true;
      recipeEl.textContent = '';
      roundEl.textContent = `${state.round + 1} / ${ORDERS.length} 라운드`;
      hintButton.disabled = false;
      hintButton.setAttribute('aria-pressed', 'false');
      resetButton.disabled = false;
      serveButton.textContent = '음료 내기';
      updateStars();
      render();
      say(`${state.round + 1}번째 손님(${order.who}): "${order.say}" 컵부터 골라 주세요.`);
      // 재료 첫 버튼으로 초점 (키보드만으로도 바로 시작)
      later(() => buttons[INGREDIENTS[0].id].focus({ preventScroll: true }), 50);
    }

    hintButton.addEventListener('click', showHint);
    resetButton.addEventListener('click', resetCup);
    serveButton.addEventListener('click', serve);
    startRound();

    return () => timers.forEach(clearTimeout);
  }

  window.TOUR_GAMES = window.TOUR_GAMES || {};
  window.TOUR_GAMES.cafe = {
    title: '음료 만들기 체험',
    button: '☕ 음료 만들기 체험',
    room: '카페실습실',
    naver: 'Cafe',
    maxStars: ORDERS.length * STARS_PER_ROUND,
    stamp: STAMP_TEXT,
    message: RESULT_TEXT,
    cta: DEPT_LINK,
    start
  };
})();
