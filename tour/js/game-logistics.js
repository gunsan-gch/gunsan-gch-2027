/* 다영 선배와 예술제 물품 세 개를 두 부스에 배달한다. */
(() => {
  const art = 'img/games/logistics/';
  const goods = [
    { id: 'drink', name: '음료' }, { id: 'cup', name: '컵' }, { id: 'bread', name: '빵' }
  ];
  const plans = [
    { name: '중앙 통로', rows: ['A...B', '.#.#.', '..W..', '.#.#.', '.....'], destinations: 'ABA', best: 12 },
    { name: '굽은 통로', rows: ['W.#.A', '.....', '##.#.', 'B..#.', '.....'], destinations: 'AAB', best: 19 },
    { name: '무대 뒤편', rows: ['....A', '.##..', 'W.#..', '...#.', 'B....'], destinations: 'BAA', best: 10 }
  ];
  const directions = {
    up: [-1, 0, '↑', '위로'], left: [0, -1, '←', '왼쪽으로'],
    down: [1, 0, '↓', '아래로'], right: [0, 1, '→', '오른쪽으로']
  };
  const keys = { ArrowUp: 'up', ArrowLeft: 'left', ArrowDown: 'down', ArrowRight: 'right' };
  const station = { W: '창고', A: 'A부스', B: 'B부스', '#': '장비', '.': '통로' };
  const icon = id => '<img src="' + art + id + '.png" alt="" draggable="false">';

  function start(container, api) {
    let plan, map, pos, steps, items, selectedPlan = 0, finished = false;
    const $ = selector => container.querySelector(selector);
    container.innerHTML = `<section class="log-game" aria-label="예술제 물류반">
      <div class="log-guide"><img src="img/npcs/portraits/dayeong.png" alt=""><div><strong>물류반 · 다영 선배</strong><p>창고에서 물품을 눌러 실어 줘! 주문한 부스에 도착하면 물품을 건네줄게.</p></div></div>
      <div class="log-toolbar"><strong>배달 지도</strong><button type="button" class="btn" data-reset>처음부터</button></div>
      <div class="log-plans" role="group" aria-label="배달 지도 선택">${plans.map((p,i) => `<button type="button" class="btn" data-plan="${i}" aria-pressed="${i === 0}">${p.name}</button>`).join('')}</div>
      <div class="log-paper"><div class="log-manifest"><b>부스 주문서</b><span class="log-count"></span></div><div class="log-orders"></div></div>
      <div class="log-map" role="img" tabindex="0"></div>
      <div class="log-controls"><div class="log-pad" aria-label="카트 방향">${Object.entries(directions).map(([key, [, , arrow, label]]) => `<button type="button" class="log-${key}" data-move="${key}" aria-label="${label} 한 칸 이동">${arrow}</button>`).join('')}</div><div class="log-cargo"><strong>카트 <span></span></strong><div class="log-slots"></div></div></div>
      <div class="log-warehouse"><strong>창고 재고</strong><div>${goods.map((g,i) => `<button type="button" data-item="${i}">${icon(g.id)}<b>${g.name}</b><small></small></button>`).join('')}</div></div>
      <p class="log-notice" role="status" aria-live="polite"></p>
      <div class="log-rules" aria-label="별 기준"></div>
    </section>`;
    function reset() {
      plan = plans[selectedPlan];
      plans.forEach((_,i) => $('[data-plan="'+i+'"]').setAttribute('aria-pressed', String(i === selectedPlan)));
      map = plan.rows.join('');
      pos = map.indexOf('W');
      steps = 0;
      items = goods.map(() => 'stock');
      $('.log-map').innerHTML = Array.from(map, (tile,i) => `<div class="log-cell log-tile-${tile === '#' ? 'wall' : tile === '.' ? 'path' : tile}" aria-hidden="true" data-cell="${i}"><span>${tile === '.' ? '' : station[tile]}</span></div>`).join('');
      $('.log-rules').innerHTML = `<span>★★★ ${plan.best}수 이내</span><span>★★ ${plan.best+4}수 이내</span><span>★ 완료</span>`;
      draw('창고에 도착했어. 아래 재고에서 실을 물품을 골라 줘.');
    }
    function draw(note) {
      const onboard = items.filter(x => x === 'cart').length;
      $('.log-count').textContent = `배달 ${items.filter(x => x === 'done').length}/3 · 이동 ${steps}칸`;
      $('.log-orders').innerHTML = ['A','B'].map(booth => `<div><b>${station[booth]}</b> ${goods.map((g,i) => plan.destinations[i] === booth ? `<span class="${items[i] === 'done' ? 'log-delivered' : ''}">${icon(g.id)}${g.name}${items[i] === 'done' ? ' ✓' : ''}</span>` : '').join('')}</div>`).join('');
      $('.log-cargo strong span').textContent = onboard + '/2';
      $('.log-slots').innerHTML = goods.flatMap((g,i) => items[i] === 'cart' ? [`<span role="img" aria-label="${g.name}">${icon(g.id)}</span>`] : []).concat(Array(2-onboard).fill('<span class="log-empty" role="img" aria-label="빈 슬롯"></span>')).join('');
      for (let i = 0; i < goods.length; i++) {
        const button = $('[data-item="'+i+'"]');
        const state = items[i];
        button.disabled = map[pos] !== 'W' || state === 'done' || (state === 'stock' && onboard === 2);
        button.querySelector('small').textContent = state === 'done' ? '배달 완료' : state === 'cart' ? (map[pos] === 'W' ? '내리기' : '카트에 있음') : '재고 1 · 싣기';
      }
      $('.log-map .log-here')?.classList.remove('log-here');
      const cell = $('[data-cell="'+pos+'"]');
      cell.classList.add('log-here');
      const location = `${Math.floor(pos/5)+1}행 ${pos%5+1}열 ${station[map[pos]]}`;
      $('.log-map').setAttribute('aria-label','배달 지도. 카트 '+location+'. '+plan.rows.map((row,i) => (i+1)+'행 '+Array.from(row,t => station[t]).join(', ')).join('. '));
      $('.log-notice').textContent = note || location;
    }
    function move(dir) {
      const [dy,dx] = directions[dir];
      const y = Math.floor(pos/5)+dy, x = pos%5+dx;
      if (y<0 || y>=5 || x<0 || x>=5 || plan.rows[y][x]==='#') {
        $('.log-notice').textContent = '이쪽은 막혀 있어. 다른 방향으로 가 보자!';
        return;
      }
      pos = y*5+x;
      steps++;
      const delivered = [];
      items.forEach((s,i) => {
        if (s === 'cart' && plan.destinations[i] === map[pos]) {
          items[i] = 'done';
          delivered.push(goods[i].name);
        }
      });
      let note = '';
      if (delivered.length) note = station[map[pos]]+'에 '+delivered.join(', ')+' 배달 완료!';
      else if (map[pos] === 'W') note = '창고 도착! 물품을 싣거나 내릴 수 있어.';
      else if ('AB'.includes(map[pos])) note = station[map[pos]]+' 도착. 카트에 이 부스의 남은 주문 물품이 없어.';
      draw(note);
      if (items.every(s => s === 'done')) {
        finished = true;
        const extra = document.createElement('p');
        extra.textContent = `${plan.name} · 세 물품 배달 완료! 이동 ${steps}칸 / 최단 ${plan.best}칸`;
        api.done({stars: steps <= plan.best ? 3 : steps <= plan.best+4 ? 2 : 1, extra});
      }
    }
    function click(e) {
      const b = e.target.closest('button');
      if (!b || b.disabled || finished) return;
      if (b.dataset.plan !== undefined) { selectedPlan = Number(b.dataset.plan); reset(); }
      else if (b.hasAttribute('data-reset')) reset();
      else if (b.dataset.move) move(b.dataset.move);
      else if (b.hasAttribute('data-item')) {
        const i = Number(b.dataset.item);
        items[i] = items[i] === 'stock' ? 'cart' : 'stock';
        draw(goods[i].name+(items[i] === 'cart' ? ' 싣기 완료!' : ' 창고로 돌려놓았어.'));
        $('.log-map').focus({preventScroll:true});
      }
    }
    function key(e) {
      if (finished || e.target.closest('.log-plans') || !Object.hasOwn(keys,e.key)) return;
      e.preventDefault(); e.stopPropagation();
      if (!e.repeat) move(keys[e.key]);
    }
    reset();
    $('.log-map').focus({preventScroll:true});
    container.addEventListener('click',click);
    container.addEventListener('keydown',key);
    return () => { finished = true; container.removeEventListener('click',click); container.removeEventListener('keydown',key); };
  }
  window.TOUR_GAMES.logistics = {title:'딱 맞게 보내줘! 예술제 물류반',button:'📦 예술제 물류반',room:'4층 전산회계2실',nextGame:'reconcile',cta:{href:'../index.html#erp',label:'ERP비즈니스과 알아보기 →'},naver:'Logistics',maxStars:3,stamp:'물류반 도장 획득!',message:'다영 선배와 부스별 주문, 창고 재고, 배달 경로를 함께 관리했어요.',start};
})();
