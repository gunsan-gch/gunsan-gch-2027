/* Each ledger has four simulated payments and three corresponding slips. */
(() => {
  const ledgers = [
    { name: '개장 직후', missing: 2, entries: [
      ['10:05', '엽서 공방', 2000], ['10:05', '사진관', 2000],
      ['10:12', '엽서 공방', 2000], ['10:12', '사진관', 3000]
    ] },
    { name: '점심 공연', missing: 0, entries: [
      ['12:20', '책갈피 공방', 1500], ['12:20', '책갈피 공방', 2500],
      ['12:25', '책갈피 공방', 1500], ['12:25', '배지 상점', 1500]
    ] },
    { name: '폐막 준비', missing: 3, entries: [
      ['15:30', '응원봉 상점', 3000], ['15:35', '응원봉 상점', 3000],
      ['15:35', '팔찌 공방', 2000], ['15:35', '팔찌 공방', 3000]
    ] }
  ];
  function shuffle(values) {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  const amount = entry => entry[2].toLocaleString('ko-KR') + '원';
  const describe = entry => [entry[0], entry[1], amount(entry)].join(' · ');
  const art = name => '<img alt="" src="img/games/reconcile/' + name + '.png">';
  function start(container, api) {
    let round = 0, misses = 0;
    container.innerHTML = '<section class="reconcile"><div class="senior-card"><img src="img/npcs/portraits/eunryeong.png" alt="">' +
      '<div><b>은령 선배 · 정산실</b><p>예술제 장부마다 전표가 한 장씩 비었어. 짝을 맞춰 어떤 결제인지 찾아 줄래?</p></div></div>' +
      '<p>모의 결제와 전표에서 시각·부스·금액이 모두 같은 두 장을 고르세요. 장부 3권을 마치면 정산 완료!</p>' +
      '<p class="rc-rule">다시 대조한 횟수 · 0회 ★★★ / 1~2회 ★★ / 3회 이상 ★</p>' +
      '<button class="btn btn-primary" type="button">첫 장부 열기</button></section>';
    const panel = container.firstElementChild;
    panel.querySelector('button').onclick = openLedger;
    function openLedger() {
      const { entries, missing, name } = ledgers[round];
      let selected = null, matched = 0, reported = false;
      panel.innerHTML = '<div class="senior-card is-compact"><img src="img/npcs/portraits/eunryeong.png" alt=""><div><strong>은령 선배 · 정산실</strong><p>같은 두 장을 찾아줘!</p></div></div>' +
        '<h3 tabindex="-1">장부 ' + (round + 1) + ' / 3 · ' + name + '</h3>' +
        '<p class="rc-progress"></p><p class="rc-note" role="status"></p><div class="rc-columns">' +
        '<section><h4>' + art('terminal') + '결제 내역</h4><div class="rc-pay"></div></section>' +
        '<section><h4>' + art('receipt') + '받은 전표</h4><div class="rc-slip"></div></section></div>';
      const progress = panel.querySelector('.rc-progress'), note = panel.querySelector('.rc-note');
      const payments = panel.querySelector('.rc-pay'), slips = panel.querySelector('.rc-slip');
      const update = () => { progress.textContent = '대조 완료 ' + matched + ' / 3쌍'; };
      function pick(tile, index, side) {
        if (reported || tile.disabled) return;
        const entry = entries[index];
        if (matched === 3) {
          reported = true;
          tile.disabled = true;
          tile.querySelector('small').textContent = '누락 확인';
          note.textContent = '누락 전표 확인! ' + describe(entry);
          const next = document.createElement('button');
          next.className = 'btn btn-primary'; next.type = 'button';
          next.textContent = round === 2 ? '정산 결과 보기' : '다음 장부 열기';
          panel.append(next);
          next.focus();
          next.onclick = () => {
            if (++round < ledgers.length) return openLedger();
            const extra = document.createElement('p');
            extra.textContent = '전표 9쌍 대조 · 누락 3건 확인 · 다시 대조 ' + misses + '회';
            api.done({ stars: misses === 0 ? 3 : misses <= 2 ? 2 : 1, extra });
          };
          return;
        }
        if (!selected || selected.side === side) {
          if (selected) selected.tile.setAttribute('aria-pressed', 'false');
          selected = { tile, index, side };
          tile.setAttribute('aria-pressed', 'true');
          note.textContent = side === 'pay' ? '같은 시각·부스·금액의 전표 선택' : '같은 시각·부스·금액의 결제 선택';
          return;
        }
        if (index !== selected.index) {
          misses++;
          const fields = ['시각', '부스', '금액'].filter((_, i) => entry[i] !== entries[selected.index][i]);
          note.textContent = fields.join('·') + ' 불일치 · 첫 카드의 짝을 다시 찾아요.';
          return;
        }
        for (const button of [selected.tile, tile]) {
          button.disabled = true; button.removeAttribute('aria-pressed');
          button.querySelector('small').textContent = '✓ 대조 완료';
        }
        selected = null; matched++; update();
        note.textContent = matched === 3 ? '전표 없는 결제 한 건 선택' : '대조 완료 · 다음 짝 선택';
        payments.querySelector('button:enabled').focus();
      }
      function addTile(index, side) {
        const entry = entries[index], tile = document.createElement('button');
        tile.type = 'button'; tile.className = 'btn rc-tile'; tile.setAttribute('aria-pressed', 'false');
        tile.innerHTML = art(side === 'pay' ? 'terminal' : 'receipt') + '<span>' + entry[0] + '</span><b>' + entry[1] + '</b><strong>' + amount(entry) +
          '</strong><small>' + (side === 'pay' ? '결제' : '전표') + '</small>';
        tile.onclick = () => pick(tile, index, side);
        (side === 'pay' ? payments : slips).append(tile);
      }
      entries.forEach((_, index) => addTile(index, 'pay'));
      shuffle(entries.map((_, i) => i).filter(i => i !== missing)).forEach(i => addTile(i, 'slip'));
      update(); note.textContent = '시각·부스·금액이 같은 두 장 선택';
      panel.querySelector('h3').focus();
    }
  }
  window.TOUR_GAMES.reconcile = {
    title: '사라진 한 건! 예술제 정산실', icon: 'receipt', button: '사라진 한 건! 예술제 정산실',
    room: '4층 전산회계3실', naver: 'Reconcile', maxStars: 3, stamp: '예술제 정산실 도장 획득!',
    message: '결제 내역과 영수증을 대조했어요. AI핀테크과에서 배우는 디지털 금융도 만나 보세요.',
    cta: { href: '../index.html#fintech', label: 'AI핀테크과 알아보기 →' }, start
  };
})();
