/* 픽셀 학교 투어 — 전산회계1실 「매점 계산왕」
 * 물건·대사·규칙은 아래에서 고칩니다. 정확히 끝낸 거래만 장부에 적습니다.
 */
(() => {
  /* ---------- 선생님이 고칠 수 있는 데이터 ---------- */
  const GOODS = [
    { id: 'rice', name: '삼각김밥', price: 1200, emoji: '🍙', image: 'goods-rice.png' },
    { id: 'milk', name: '초코우유', price: 1500, emoji: '🥛', image: 'goods-milk.png' },
    { id: 'noodle', name: '컵라면', price: 1800, emoji: '🍜', image: 'goods-noodle.png' },
    { id: 'bread', name: '소시지빵', price: 2300, emoji: '🌭', image: 'goods-bread.png' },
    { id: 'jelly', name: '젤리', price: 900, emoji: '🍬', image: 'goods-jelly.png' },
    { id: 'water', name: '생수', price: 800, emoji: '💧', image: 'goods-water.png' },
    { id: 'snack', name: '과자', price: 1700, emoji: '🍪', image: 'goods-snack.png' },
    { id: 'ice', name: '아이스크림', price: 1400, emoji: '🍦', image: 'goods-ice.png' },
    { id: 'pen', name: '볼펜', price: 700, emoji: '🖊️', image: 'goods-pen.png' },
    { id: 'sandwich', name: '샌드위치', price: 3200, emoji: '🥪', image: 'goods-sandwich.png' }
  ];
  const CUSTOMER_LINES = [
    '종 치기 3분 전이에요, 빨리요!', '카드는 안 돼요? 현금으로 할게요.',
    '오늘은 내가 쏜다! 내일은 네가 쏴.', '배에서 꼬르륵 합창단이 공연 중이에요.',
    '분명 밥 먹었는데 간식 배는 따로래요.', '친구 몫이에요. 한 입만 먹을 거예요.',
    '수학 시간보다 계산이 빨라지는 마법!', '지갑은 가벼워도 마음은 든든하게!',
    '오늘 급식 맛있었죠? 이건 후식이에요.', '볼펜 사러 왔다가 간식에 포위됐어요.'
  ];
  const THANKS = [
    '감사합니다! 계산 속도 빛보다 빠른데요?', '감사합니다! 내 간식 영웅이에요!',
    '감사합니다! 잔돈까지 완벽, 만점 드립니다.', '감사합니다! 종 치기 전에 살았다!',
    '감사합니다! 내일도 이 계산대로 올게요.'
  ];
  const OOPS = [
    '어? 거스름돈이 달라요!', '제 동전이 아직 출근을 안 했나 봐요.',
    '한 번만 다시 세어 주세요. 간식이 기다려요!', '개이득?! 아니, 다시 세 보세요'
  ];
  const SECONDS = 60;
  const PENALTY_SECONDS = 3;
  const COMBO_BONUS_SECONDS = 1;
  const TIP = 500;
  const BROKEN_CHANCE = 0.2;
  const STAR_RULE = { three: 10, two: 6, slipsPenalty: 4 };
  const RULES = { seconds: SECONDS, penaltySeconds: PENALTY_SECONDS,
    comboBonusSeconds: COMBO_BONUS_SECONDS, tip: TIP, starRule: STAR_RULE };
  const IMG = 'img/games/finance/';
  const number = n => n.toLocaleString('ko-KR');
  const el = (tag, className, text = '') => {
    const node = document.createElement(tag);
    node.className = className; node.textContent = text;
    return node;
  };

  function picture(src, emoji, size) {
    const img = document.createElement('img');
    img.alt = ''; img.width = size; img.height = size;
    img.addEventListener('error', () => img.replaceWith(el('span', 'cashier-emoji', emoji)), { once: true });
    img.src = src;
    return img;
  }

  // 숫자·문자열 시드 모두 지원. 대사 추첨은 거래 순서에 영향을 주지 않습니다.
  function randomSource(seed) {
    if (seed === null || seed === undefined) return Math.random;
    let value = 2166136261;
    for (const ch of String(seed)) value = Math.imul(value ^ ch.charCodeAt(0), 16777619);
    return () => {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function start(container, api) {
    const game = window.TOUR_GAMES.cashier;
    const rules = { ...game.rules, starRule: { ...game.rules.starRule } };
    const random = randomSource(game.seed);
    const state = { phase: 'intro', deadline: 0, served: 0, sales: 0, received: 0, change: 0,
      tips: 0, slips: 0, combo: 0, best: 0, tray: [], customer: null, warned: new Set() };
    let frame = 0, timer = 0, ledgerTimer = 0;
    container.innerHTML = `
      <div class="cashier-intro">
        <div class="cashier-intro-art" aria-hidden="true"></div>
        <h3>점심시간 매점!</h3><p>60초 동안 거스름돈을 정확히 건네요.</p>
        <ul><li>물건값을 더하고, 낸 돈에서 빼요.</li><li>돈 버튼으로 잔돈을 담고 [건네기]를 눌러요.</li>
          <li>실수하면 −3초, 3콤보부터 +1초! 고장 난 계산대를 구하면 팁!</li></ul>
        <button type="button" class="btn btn-primary cashier-start">문 열기</button>
      </div>
      <div class="cashier-game" hidden>
        <div class="cashier-stats"><strong class="cashier-time" aria-hidden="true"></strong>
          <span class="cashier-count"></span><span class="cashier-combo"></span><strong class="cashier-sales"></strong></div>
        <p class="cashier-event" role="status"></p>
        <div class="cashier-counter">
          <div class="cashier-customer"><div class="cashier-person" aria-hidden="true"></div>
            <p class="cashier-line" role="status" aria-atomic="true"></p></div>
          <section class="cashier-receipt" aria-label="손님 영수증"><h3>오늘의 간식 영수증</h3>
            <ul class="cashier-goods"></ul><p class="cashier-total"></p><strong class="cashier-paid"></strong></section>
        </div>
        <div class="cashier-controls">
          <div class="cashier-tray"><div class="cashier-coins" aria-hidden="true"></div><strong class="cashier-tray-total"></strong></div>
          <div class="cashier-money" role="group" aria-label="건넬 돈 담기"></div>
          <div class="cashier-actions"><button type="button" class="btn cashier-undo">↩ 하나 빼기</button>
            <button type="button" class="btn btn-primary cashier-give">건네기</button></div>
          <p class="cashier-feedback" role="status" aria-live="polite" aria-atomic="true"></p>
        </div>
        <p class="cashier-clock-status sr-only" role="status" aria-atomic="true"></p>
      </div>`;
    const $ = selector => container.querySelector(selector);
    const root = $('.cashier-game');
    $('.cashier-intro-art').append(picture(IMG + 'goods-rice.png', '🍙', 64),
      picture(IMG + 'bill-1000.png', '💵', 64), picture(IMG + 'goods-milk.png', '🥛', 64));

    function animate(node, className) {
      if (api.reducedMotion) return;
      node.classList.remove(className); void node.offsetWidth; node.classList.add(className);
    }

    function updateStatus() {
      $('.cashier-count').textContent = `손님 ${state.served}명`;
      $('.cashier-combo').textContent = `🔥 ${state.combo}콤보`;
      $('.cashier-sales').textContent = `매출 ${number(state.sales)}원`;
    }

    function trayTotal() { return state.tray.reduce((sum, value) => sum + value, 0); }

    function updateTray() {
      $('.cashier-tray-total').textContent = `건넬 돈 ${number(trayTotal())}원`;
      $('.cashier-undo').disabled = state.tray.length === 0;
    }

    function clearTray() {
      state.tray = []; $('.cashier-coins').replaceChildren(); updateTray();
    }

    function isOpen() {
      if (state.phase !== 'playing') return false;
      if (performance.now() >= state.deadline) { ledger(); return false; }
      return true;
    }

    function addMoney(value) {
      if (!isOpen() || (value === 5000 && state.served < 6)) return;
      state.tray.push(value);
      const coin = picture(`${IMG}${value >= 1000 ? 'bill' : 'coin'}-${value}.png`, value >= 1000 ? '💵' : '🪙', 40);
      if (!api.reducedMotion) coin.classList.add('cashier-drop');
      $('.cashier-coins').append(coin); updateTray();
      $('.cashier-coins').scrollTop = $('.cashier-coins').scrollHeight;
    }

    function undo() {
      if (!isOpen() || !state.tray.length) return;
      state.tray.pop(); $('.cashier-coins').lastElementChild.remove(); updateTray();
    }

    function makeCustomer() {
      const index = state.served + 1;
      const count = index <= 3 ? 1 : index <= 6 ? 2 : 2 + Math.floor(random() * 2);
      const goods = Array.from({ length: count }, () => GOODS[Math.floor(random() * GOODS.length)]);
      const total = goods.reduce((sum, item) => sum + item.price, 0);
      // 4~6번째도 합계가 5천 원 미만이 되게 골라 1만 원은 7번째부터 등장합니다.
      if (index <= 6 && total >= 5000) return makeCustomer();
      const paid = [1000, 2000, 3000, 5000, 10000].find(value => value > total);
      return { goods, total, paid, broken: index >= 4 && random() < game.brokenChance };
    }

    function nextCustomer() {
      state.customer = makeCustomer(); clearTray();
      const customer = state.customer;
      $('.cashier-person').replaceChildren(picture(`img/games/cafe/customer-${state.served % 3 + 1}.png`, '🧑‍🎓', 128));
      $('.cashier-line').textContent = `${state.served + 1}번째 손님: ${CUSTOMER_LINES[state.served % CUSTOMER_LINES.length]}`;
      $('.cashier-goods').replaceChildren(...customer.goods.map(item => {
        const row = el('li', 'cashier-good');
        row.append(picture(IMG + item.image, item.emoji, 40), el('span', '', item.name), el('strong', '', `${number(item.price)}원`));
        return row;
      }));
      $('.cashier-total').textContent = `합계 ${customer.broken ? '?,???원' : number(customer.total) + '원'}`;
      $('.cashier-paid').textContent = `손님이 낸 돈 ${number(customer.paid)}원`;
      $('.cashier-event').textContent = customer.broken ? '🧮 계산기 고장! 직접 더해 맞히면 팁 +500원!' : '정확한 잔돈으로 간식 시간을 지켜요!';
      $('.cashier-event').classList.toggle('cashier-broken', customer.broken);
      $('.cashier-money button[data-value="5000"]').hidden = state.served < 6;
      $('.cashier-receipt').classList.remove('cashier-shake');
      animate($('.cashier-customer'), 'cashier-arrive');
    }

    function scheduleEnd() {
      clearTimeout(timer);
      timer = setTimeout(ledger, Math.max(0, state.deadline - performance.now()));
    }

    function give() {
      if (!isOpen()) return;
      const customer = state.customer;
      const change = customer.paid - customer.total;
      if (trayTotal() !== change) {
        const reaction = trayTotal() > change ? OOPS[3] : OOPS[state.slips % 3];
        state.slips++; state.combo = 0; state.deadline -= rules.penaltySeconds * 1000;
        $('.cashier-feedback').textContent = `${reaction} −${rules.penaltySeconds}초 · 정정 전표 ${state.slips}장`;
        clearTray(); animate($('.cashier-receipt'), 'cashier-shake'); updateStatus();
        if (!isOpen()) return;
      } else {
        state.served++; state.sales += customer.total; state.received += customer.paid; state.change += change;
        state.combo++; state.best = Math.max(state.best, state.combo);
        if (customer.broken) state.tips += rules.tip;
        const bonus = state.combo >= 3;
        if (bonus) state.deadline += rules.comboBonusSeconds * 1000;
        $('.cashier-feedback').textContent = `${THANKS[(state.served - 1) % THANKS.length]}${bonus ? ` ⏱ +${rules.comboBonusSeconds}초` : ''}${customer.broken ? ` 팁 +${number(rules.tip)}원!` : ''}`;
        updateStatus(); nextCustomer();
      }
      scheduleEnd(); paintTime(performance.now());
    }

    function result() {
      if (state.phase !== 'ledger') return;
      state.phase = 'done'; clearTimeout(ledgerTimer);
      const rule = rules.starRule;
      const base = state.served >= rule.three ? 3 : state.served >= rule.two ? 2 : 1;
      const stars = Math.max(1, base - (state.slips >= rule.slipsPenalty ? 1 : 0));
      const extra = el('div', 'cashier-summary');
      extra.append(el('strong', 'cashier-summary-total', `손님 ${state.served}명 · 매출 ${number(state.sales)}원`),
        el('p', '', `정정 전표 ${state.slips}장 · 최고 ${state.best}콤보 · 팁 ${number(state.tips)}원`));
      api.done({ stars, hints: 0, extra });
    }

    function ledger() {
      if (state.phase !== 'playing') return;
      state.phase = 'ledger'; cancelAnimationFrame(frame); clearTimeout(timer);
      const book = el('section', 'cashier-ledger');
      book.append(el('h3', '', '오늘의 장부'));
      const table = el('table', 'cashier-ledger-table');
      const body = document.createElement('tbody');
      const rows = [['손님 수', `${state.served}명`], ['매출 합계', `${number(state.sales)}원`],
        ['받은 돈 합계', `${number(state.received)}원`], ['내준 거스름돈 합계', `${number(state.change)}원`],
        ['팁', `${number(state.tips)}원`], ['정정 전표', `${state.slips}장`]];
      rows.forEach(([label, value]) => {
        const row = document.createElement('tr');
        const heading = el('th', '', label); heading.scope = 'row';
        row.append(heading, el('td', '', value)); body.append(row);
      });
      table.append(body); book.append(table);
      const note = el('p', 'cashier-ledger-note', state.slips === 0 ? '금고와 장부가 딱 맞아요 ✅'
        : `정정 전표 ${state.slips}장 — 그래도 끝내 맞췄어요`);
      note.setAttribute('role', 'status'); book.append(note);
      book.append(el('p', '', '받은 돈 − 거스름돈 = 매출. 완료한 거래만 기록했고, 팁은 매출과 따로 모아요.'));
      const button = el('button', 'btn btn-primary cashier-result', '결과 보기');
      button.type = 'button'; button.addEventListener('click', result); book.append(button);
      container.replaceChildren(book); container.scrollTop = 0;
      button.focus({ preventScroll: true }); api.announce('영업 끝! 오늘의 장부를 확인해 보세요.');
    }

    function paintTime(now) {
      const left = Math.max(0, (state.deadline - now) / 1000);
      $('.cashier-time').textContent = `${Math.ceil(left)}초`;
      $('.cashier-time').classList.toggle('cashier-urgent', left <= 10);
      for (const threshold of [30, 10]) {
        if (left <= threshold && !state.warned.has(threshold)) {
          state.warned.add(threshold);
          $('.cashier-clock-status').textContent = `남은 시간 ${threshold}초!`;
        }
      }
    }

    function tick(now) {
      if (state.phase !== 'playing') return;
      if (now >= state.deadline) return ledger();
      paintTime(now); frame = requestAnimationFrame(tick);
    }

    function onKey(e) {
      if (state.phase !== 'playing' || !root.contains(document.activeElement)) return;
      if (e.repeat || e.isComposing || e.ctrlKey || e.altKey || e.metaKey || e.target.closest('input, textarea, select, a, [contenteditable="true"]')) return;
      const values = { '1': 1000, '2': 500, '3': 100, '4': 5000 };
      if (!values[e.key] && !['Backspace', 'Enter'].includes(e.key)) return;
      e.preventDefault();
      if (values[e.key]) addMoney(values[e.key]);
      else if (e.key === 'Backspace') undo();
      else give();
    }

    [1000, 500, 100, 5000].forEach((value, i) => {
      const button = el('button', 'cashier-money-button');
      button.type = 'button'; button.dataset.value = value;
      button.append(picture(`${IMG}${value >= 1000 ? 'bill' : 'coin'}-${value}.png`, value >= 1000 ? '💵' : '🪙', 40),
        el('span', '', `${number(value)}원`), el('small', 'cashier-key', `${i + 1} 키`));
      button.addEventListener('click', () => addMoney(value)); $('.cashier-money').append(button);
    });
    $('.cashier-undo').addEventListener('click', undo);
    $('.cashier-give').addEventListener('click', give);
    $('.cashier-start').addEventListener('click', () => {
      $('.cashier-intro').hidden = true; root.hidden = false; state.phase = 'playing';
      state.deadline = performance.now() + rules.seconds * 1000;
      nextCustomer(); updateStatus(); paintTime(performance.now()); scheduleEnd();
      $('.cashier-money-button').focus({ preventScroll: true });
      frame = requestAnimationFrame(tick);
    });
    document.addEventListener('keydown', onKey);
    $('.cashier-start').focus({ preventScroll: true });
    return () => {
      state.phase = 'done'; cancelAnimationFrame(frame); clearTimeout(timer); clearTimeout(ledgerTimer);
      document.removeEventListener('keydown', onKey);
    };
  }

  window.TOUR_GAMES = window.TOUR_GAMES || {};
  window.TOUR_GAMES.cashier = {
    title: '매점 계산왕', button: '🧾 매점 계산왕', room: '전산회계1실', naver: 'Cashier', maxStars: 3,
    stamp: '전산회계1실 도장 획득!',
    message: 'ERP비즈니스과에서는 전표와 장부를 정리하며 돈의 흐름을 맞추는 회계 실무를 배워요.', // ※ 학교 확인
    cta: { href: '../index.html#erp', label: 'ERP비즈니스과 알아보기 →' },
    rules: RULES, seed: null, brokenChance: BROKEN_CHANCE,
    start
  };
})();
