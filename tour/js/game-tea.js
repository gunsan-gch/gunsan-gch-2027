/* 예절실 · 손님 세 분께 차 올리기 */
(() => {
  const rounds = [
    { name: '청자잔', guest: '첫 손님', capacity: 80, low: 46, high: 54, rate: 17, unit: 8, scale: 2.5, tea: '#f3be59' },
    { name: '살구빛 잔', guest: '둘째 손님', capacity: 110, low: 72, high: 80, rate: 24, unit: 10, scale: 2.8, tea: '#dca947' },
    { name: '연보라 잔', guest: '셋째 손님', capacity: 140, low: 96, high: 104, rate: 32, unit: 12, scale: 3.15, tea: '#dc9653' }
  ];
  const interior = 'M9 8H31V11H30V14H29V17H28V20H27V23H26V24H14V23H13V20H12V17H11V14H10V11H9Z';
  const art = name => 'img/games/tea/' + name + '.png';
  function start(container, api) {
    const events = new AbortController();
    let stage = 0, amount = 0, phase = 'ready', owner = null, frame = 0, last = 0;
    let tailStart = 0, drops = 0, tailAmount = 0;
    const results = [];
    container.innerHTML = `<section class="tea-game">
      <div class="senior-card"><img src="img/npcs/portraits/juni.png" alt=""><div><strong>준이 선배 · 예절실</strong><p>잔 안의 두 점선 사이에 차가 닿으면 손님께 올려 봐. 주전자를 바로 세워도 몇 방울 더 떨어져!</p></div></div>
      <div class="tea-order"><h3 class="tea-name" tabindex="-1"></h3><span class="tea-round"></span></div>
      <svg class="tea-scene" viewBox="0 0 320 176" aria-hidden="true" focusable="false">
        <defs><clipPath id="tea-interior"><path d="${interior}"/></clipPath></defs>
        <image href="${art('room')}" width="320" height="176"/>
        <ellipse cx="190" cy="151" rx="54" ry="5" fill="#573e2f" opacity=".25"/>
        <g class="tea-vessel"><path d="${interior}" fill="#fffae2" opacity=".93"/>
          <g clip-path="url(#tea-interior)"><rect class="tea-liquid" x="9" width="22" height="24"/>
            <rect class="tea-band" x="9" width="22" fill="#4a7c5c" opacity=".15"/>
            <path class="tea-lines" fill="none" stroke="#274d42" stroke-width=".5" stroke-dasharray="1.4 1"/></g>
          <image class="tea-cup-art" width="40" height="32"/></g>
        <line class="tea-stream" x1="190" y1="62" x2="190" stroke="#f8c866" stroke-width="2.4"/>
        <circle class="tea-drop" cx="190" cy="62" r="1.7" fill="#f2bb52"/>
        <image class="tea-pot" href="${art('pot')}" x="78" y="38" width="116" height="80"/>
      </svg>
      <div class="tea-reading"><span>따른 양 <b class="tea-amount"></b></span><span>목표 <b class="tea-target"></b></span></div>
      <div class="tea-input"><button class="btn tea-hold btn-primary" type="button">꾹 눌러 따르기</button><button class="btn tea-small" type="button"></button></div>
      <p class="tea-tip">누르고 있으면 차가 흘러요. 키보드는 따르기 버튼에서 스페이스바를 눌러요.</p>
      <p class="tea-feedback" role="status"></p>
      <button class="btn tea-serve btn-primary" type="button">손님께 차 올리기</button>
      <small>목표에 맞춘 잔마다 별 하나 · 세 잔을 올리면 기본 별 하나</small></section>`;
    const $ = selector => container.querySelector('.tea-' + selector);
    const hold = $('hold'), small = $('small'), serve = $('serve'), scene = $('scene');
    const on = (el, type, fn) => el.addEventListener(type, fn, { signal: events.signal });
    const round = () => rounds[stage];
    const measured = () => Math.round(amount);
    const level = value => 24 - 16 * value / round().capacity;
    const accurate = () => measured() >= round().low && measured() <= round().high;
    function liquid() {
      $('liquid').setAttribute('y', level(measured()));
      $('amount').textContent = measured() + ' mL';
      $('stream').setAttribute('y2', 150 + (level(measured()) - 28) * round().scale);
    }
    function state(next) {
      phase = next;
      scene.dataset.phase = phase;
      const ready = phase === 'ready';
      const full = measured() >= round().capacity;
      small.setAttribute('aria-disabled', String(!ready || full));
      // Maintain focus and native pointer capture while holding the button.
      hold.setAttribute('aria-disabled', String(!ready || full));
      serve.disabled = !ready || amount <= 0;
    }
    function ready() {
      liquid();
      state('ready');
      const advice = accurate() ? '두 점선 사이야. 손님께 올려 볼까?' :
        measured() < round().low ? '아직 아래 점선 밑이야. 조금 더 따라 봐.' : '위 점선을 넘었어. 이 잔을 손님께 올려 줘.';
      $('feedback').textContent = measured() + ' mL · ' + advice;
    }
    function tick(now) {
      frame = 0;
      if (phase === 'hold') {
        amount = Math.min(round().capacity, amount + Math.max(0, now - last) * round().rate / 1000);
        last = now;
        liquid();
        if (amount >= round().capacity) { release(); return; }
      } else if (phase === 'tail') {
        const elapsed = Math.max(0, now - tailStart);
        const landed = Math.min(3, Math.floor(elapsed / 145));
        amount = Math.min(round().capacity, amount + (landed - drops) * tailAmount / 3);
        drops = landed;
        liquid();
        const end = 150 + (level(measured()) - 28) * round().scale;
        $('drop').setAttribute('cy', 62 + (end - 62) * ((elapsed % 145) / 145) ** 2);
        if (drops === 3) { ready(); return; }
      } else return;
      frame = requestAnimationFrame(tick);
    }
    function begin(input) {
      if (phase !== 'ready' || measured() >= round().capacity) return false;
      owner = input;
      last = performance.now();
      state('hold');
      $('feedback').textContent = '차를 따르는 중이야. 원하는 만큼 차오르면 손을 떼 줘.';
      frame = requestAnimationFrame(tick);
      return true;
    }
    function settle(tail) {
      tailStart = performance.now();
      tailAmount = tail;
      drops = 0;
      $('drop').setAttribute('cy', 62);
      state('tail');
      $('feedback').textContent = '톡, 톡… 마지막 방울이 떨어지고 있어.';
      frame = requestAnimationFrame(tick);
    }
    function release() {
      if (phase !== 'hold') return;
      cancelAnimationFrame(frame);
      amount = Math.min(round().capacity, amount + Math.max(0, performance.now() - last) * round().rate / 1000);
      owner = null;
      settle(round().unit * .5);
    }
    function render() {
      const r = round();
      amount = 0;
      $('name').textContent = r.guest + '의 ' + r.name;
      $('round').textContent = (stage + 1) + ' / 3잔';
      $('target').textContent = r.low + '–' + r.high + ' mL';
      small.textContent = r.unit + ' mL씩 따르기';
      $('cup-art').setAttribute('href', art('cup-' + stage));
      $('vessel').setAttribute('transform', 'translate(' + (190 - 20*r.scale) + ' ' + (150 - 28*r.scale) + ') scale(' + r.scale + ')');
      $('liquid').setAttribute('fill', r.tea);
      $('band').setAttribute('y', level(r.high));
      $('band').setAttribute('height', level(r.low) - level(r.high));
      $('lines').setAttribute('d', 'M9 ' + level(r.low) + 'h22 M9 ' + level(r.high) + 'h22');
      $('feedback').textContent = '빈 잔이야. ' + r.low + ' ~ ' + r.high + ' mL를 따라 줘.';
      liquid();
      state('ready');
      $('name').focus({preventScroll:true});
    }
    on(hold, 'pointerdown', e => {
      if (e.button !== 0 || !e.isPrimary || !begin(e.pointerId)) return;
      e.preventDefault(); hold.focus(); hold.setPointerCapture(e.pointerId);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) on(hold, type, e => {
      if (owner === e.pointerId) release();
    });
    on(hold, 'keydown', e => {
      if (e.code !== 'Space' && e.key !== 'Enter') return;
      e.preventDefault(); if (!e.repeat) begin('key');
    });
    on(hold, 'keyup', e => {
      if (owner === 'key' && (e.code === 'Space' || e.key === 'Enter')) { e.preventDefault(); release(); }
    });
    on(hold, 'blur', release);
    on(window, 'blur', release);
    on(document, 'visibilitychange', () => { if (document.hidden) release(); });
    on(small, 'click', () => {
      if (phase !== 'ready' || measured() >= round().capacity) return;
      amount = Math.min(round().capacity, amount + round().unit - 3);
      liquid(); settle(3);
    });
    on(serve, 'click', () => {
      if (phase !== 'ready' || !amount) return;
      results.push({amount:measured(), good:accurate()});
      if (stage < rounds.length-1) { stage++; render(); return; }
      state('done');
      const extra = document.createElement('div');
      extra.className = 'tea-result';
      const wins = results.filter(result => result.good).length;
      extra.innerHTML = `<h3>세 손님의 찻상이 차려졌어요</h3><p>준이 선배 “${wins === 3 ? '세 잔 모두 딱 알맞네. 이제 우리도 한 잔 할까?' : '마지막 손님까지 정성껏 챙겨 줬구나.'}”</p><ul>${results.map((result,i) => `<li><img src="${art('cup-'+i)}" alt=""><strong>${rounds[i].name}</strong><span>${result.amount} mL</span><small>${result.good ? '목표 달성' : '목표 '+rounds[i].low+'–'+rounds[i].high+' mL'}</small></li>`).join('')}</ul>`;
      api.done({stars:Math.max(1,wins), hints:0, extra});
    });
    render();
    return () => { phase = 'done'; owner = null; cancelAnimationFrame(frame); events.abort(); };
  }
  window.TOUR_GAMES.tea = { title:'찻잔에 봄을 따라요', button:'찻잔에 봄을 따라요', room:'5층 예절실', naver:'Tea', maxStars:3, stamp:'예절실 도장 획득!', message:'손님의 잔을 살피는 작은 마음이 차 한 잔에 담겼어요.', start };
})();
