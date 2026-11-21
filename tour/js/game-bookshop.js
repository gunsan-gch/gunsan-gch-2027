/* 도서실 종이 고양이 책갈피 찾기 */
(() => {
  const art = name => 'img/games/bookshop/' + name + '.png?v=20261118c';
  const scenes = [
    { name: '책장', image: 'shelf', cat: '첫째', spots: [
      [19,31,'왼쪽 위 책등','위쪽','제목들이 나란히 선 곳'], [64,56,'가운데 칸의 책 더미','가운데 높이','책들이 낮은 계단처럼 포개진 곳'],
      [85,80,'오른쪽 아래 책꽂이','아래쪽','책이 쓰러지지 않게 받쳐 주는 곳'], [35,79,'아래 칸의 초록 책','아래쪽','풀잎 색 표지']] },
    { name: '열람 테이블', image: 'tables', cat: '둘째', spots: [
      [22,57,'왼쪽 테이블의 펼친 책','가운데 높이','두 쪽을 한꺼번에 읽을 수 있는 곳'], [71,55,'오른쪽 테이블의 책 더미','가운데 높이','표지 위에 또 다른 책이 놓인 곳'],
      [50,83,'앞 테이블의 공책','아래쪽','내가 글을 써 넣는 종이'], [86,31,'오른쪽 창가 책장','위쪽','햇볕이 가장 먼저 닿는 책']] },
    { name: '사서대', image: 'counter', cat: '셋째', spots: [
      [18,56,'왼쪽 반납 책 더미','가운데 높이','다 읽고 돌려준 책'], [49,54,'모니터 받침 옆','가운데 높이','화면을 떠받치는 발'],
      [78,57,'오른쪽 대출 바구니','가운데 높이','빌려 갈 물건을 담는 통'], [84,31,'뒤쪽 낮은 책장','위쪽','사서 선생님 등 뒤의 책']] }
  ];
  let previous = [];
  function drawSpots() {
    const selection = scenes.map(({spots}, i) => {
      const pool = spots.map((_, j) => j).filter(j => j !== previous[i]);
      return pool[Math.floor(Math.random() * pool.length)];
    });
    previous = selection;
    return selection;
  }
  function start(container, api) {
    const picks = drawSpots();
    const events = new AbortController();
    let stage = 0, hints = 0, used = false, found = false, zoom = 1, ended = false;
    let pointer = null, moved = false, originScroll = [0,0], pinch = null;
    container.innerHTML = `<section class="bk-game">
      <div class="senior-card"><img src="img/npcs/portraits/jaehee.png" alt=""><div><strong>재희 선배 · 도서관</strong><p>책 사이로 빼꼼 나온 종이 고양이를 눌러 봐!</p></div></div>
      <div class="bk-heading"><h3 tabindex="-1"></h3><span class="bk-count"></span></div>
      <div class="bk-viewport"><div class="bk-scene" role="img"><img class="bk-back" alt="" draggable="false"><div class="bk-region" hidden></div><img class="bk-peek" alt="" draggable="false"></div></div>
      <div class="bk-tools"><div class="bk-zoom" role="group" aria-label="장면 확대 조절"><i class="bk-loupe" aria-hidden="true"></i><button type="button" class="btn bk-minus" aria-label="장면 축소">−</button><button type="button" class="btn bk-reset" aria-label="원래 크기로">100%</button><button type="button" class="btn bk-plus" aria-label="장면 확대">＋</button></div><button type="button" class="btn bk-hint">힌트</button></div>
      <details class="bk-details"><summary>글 단서로 찾기</summary><p class="bk-clue"></p><div class="bk-choices"></div></details>
      <p class="bk-status" role="status" aria-live="polite"></p><div class="bk-tray" aria-label="모은 고양이 책갈피"></div>
      <button type="button" class="bk-next btn btn-primary" hidden></button>
      <small class="bk-rules">시간 제한 없이 찾아요. 힌트 0회 ★★★ · 1회 ★★ · 2회 이상 ★</small></section>`;
    const $ = s => container.querySelector(s);
    const viewport = $('.bk-viewport'), scene = $('.bk-scene'), peek = $('.bk-peek'), region = $('.bk-region');
    const next = $('.bk-next'), hint = $('.bk-hint');
    const on = (element, type, fn, options = {}) => element.addEventListener(type, fn, {...options,signal:events.signal});
    const spot = () => scenes[stage].spots[picks[stage]];
    function setZoom(value, anchor, origin) {
      const at = anchor || [viewport.clientWidth / 2,viewport.clientHeight / 2];
      const content = origin || [(viewport.scrollLeft+at[0])/zoom,(viewport.scrollTop+at[1])/zoom];
      zoom = Math.max(1, Math.min(3, value));
      scene.style.width = zoom * 100 + '%';
      viewport.scrollLeft = content[0]*zoom-at[0];
      viewport.scrollTop = content[1]*zoom-at[1];
      $('.bk-reset').textContent = Math.round(zoom * 100) + '%';
      $('.bk-minus').disabled = zoom === 1;
      $('.bk-plus').disabled = zoom === 3;
    }
    function renderTray(count) {
      $('.bk-tray').innerHTML = scenes.map((s,i) => `<span class="${i < count ? 'is-filled' : 'is-empty'}">${i < count ? `<img class="${i === count-1 && found ? 'bk-hop' : ''}" src="${art('cat-'+i)}" alt="${s.cat} 고양이">` : `<i aria-label="${s.cat} 책갈피 자리">${i+1}</i>`}</span>`).join('');
      $('.bk-count').textContent = '책갈피 ' + count + ' / 3';
    }
    function render() {
      found = used = false;
      const s = scenes[stage], [x,y,,height,object] = spot();
      $('.bk-heading h3').textContent = (stage+1) + '. ' + s.name;
      $('.bk-back').src = art(s.image);
      scene.setAttribute('aria-label', s.name + ' 풍경. 글 단서로 찾기를 열어 장소를 선택할 수 있어요.');
      peek.src = art('peek-'+stage); peek.style.left = x+'%'; peek.style.top = y+'%'; peek.hidden = false;
      hint.disabled = false; hint.textContent = '힌트 보기'; region.hidden = next.hidden = true;
      $('.bk-clue').textContent = '책갈피의 메모 “내가 숨은 높이는 ' + height + '. 내 옆을 묘사하면? ' + object + '!”';
      $('.bk-choices').innerHTML = s.spots.map((p,i) => `<button class="btn" type="button" data-spot="${i}">${p[2]}</button>`).join('');
      $('.bk-status').textContent = '고양이 귀 찾기 · 두 손가락으로 확대';
      setZoom(1); renderTray(stage); container.scrollTop = 0;
      $('.bk-heading h3').focus({preventScroll:true});
    }
    function guess(correct) {
      if (ended || found) return;
      if (!correct) { $('.bk-status').textContent = '여기에는 없네. 다른 곳을 살펴봐!'; return; }
      found = true; peek.hidden = region.hidden = true; hint.disabled = true;
      for (const b of $('.bk-choices').children) b.disabled = true;
      renderTray(stage+1);
      $('.bk-status').textContent = scenes[stage].cat + ' 고양이 발견! 책갈피 받침에 앉았어.';
      next.textContent = stage===2 ? '세 고양이와 책 덮기' : '다음 장소 · ' + scenes[stage+1].name;
      next.hidden = false; next.focus();
    }
    on($('.bk-choices'),'click', e => {
      const button = e.target.closest('[data-spot]');
      if (button) guess(Number(button.dataset.spot) === picks[stage]);
    });
    on(scene,'pointerdown',e => {
      if (pinch || !e.isPrimary || e.button !== 0) { moved = true; return; }
      pointer = [e.clientX,e.clientY]; moved = false; originScroll = [viewport.scrollLeft,viewport.scrollTop];
    });
    on(scene,'pointermove',e => {
      if (!pointer) return;
      if (Math.hypot(e.clientX-pointer[0],e.clientY-pointer[1]) > 8) moved = true;
      if (moved && zoom > 1 && e.pointerType === 'mouse' && e.buttons === 1) {
        scene.setPointerCapture(e.pointerId);
        viewport.scrollLeft = originScroll[0] + pointer[0] - e.clientX;
        viewport.scrollTop = originScroll[1] + pointer[1] - e.clientY;
      }
    });
    on(scene,'pointercancel',() => { moved = true; pointer = null; });
    on(scene,'click',e => {
      const dragged = moved || !pointer || Math.hypot(e.clientX-pointer[0],e.clientY-pointer[1]) > 8 ||
        Math.hypot(viewport.scrollLeft-originScroll[0],viewport.scrollTop-originScroll[1]) > 4;
      pointer = null;
      if (dragged) return;
      const rect = peek.getBoundingClientRect();
      guess(Math.abs(e.clientX-rect.left-rect.width/2) <= Math.max(22,rect.width/2) &&
        Math.abs(e.clientY-rect.top-rect.height/2) <= Math.max(22,rect.height/2));
    });
    // Native one-finger scrolling remains available. Only a two-finger gesture is claimed.
    function fingers(touches) {
      const [a,b] = touches, bounds = viewport.getBoundingClientRect();
      return { distance:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),
        at:[(a.clientX+b.clientX)/2-bounds.left,(a.clientY+b.clientY)/2-bounds.top] };
    }
    on(viewport,'touchstart',e => {
      if (e.touches.length !== 2) return;
      const {at,distance} = fingers(e.touches);
      pinch = {distance:Math.max(1,distance), zoom, origin:[(viewport.scrollLeft+at[0])/zoom,(viewport.scrollTop+at[1])/zoom]};
      moved = true; pointer = null; e.preventDefault();
    },{passive:false});
    on(viewport,'touchmove',e => {
      if (!pinch || e.touches.length !== 2) return;
      const {at,distance} = fingers(e.touches);
      setZoom(pinch.zoom*distance/pinch.distance,at,pinch.origin);
      e.preventDefault();
    },{passive:false});
    const releasePinch = e => {
      if (pinch && e.touches.length < 2) { pinch = null; moved = true; pointer = null; }
    };
    on(viewport,'touchend',releasePinch);
    on(viewport,'touchcancel',releasePinch);
    on($('.bk-plus'),'click',() => setZoom(zoom+.5));
    on($('.bk-minus'),'click',() => setZoom(zoom-.5));
    on($('.bk-reset'),'click',() => setZoom(1));
    on(hint,'click',() => {
      if (used || found || ended) return;
      used = true; hints++; hint.disabled = true; hint.textContent = '힌트 사용함';
      const [x] = spot(), left = x<50;
      region.style.left = left ? '0%' : '45%'; region.hidden = false;
      $('.bk-status').textContent = '재희의 힌트 · 장면 ' + (left ? '왼쪽' : '오른쪽') + ' 절반을 살펴봐!';
    });
    on(next,'click',() => {
      if (!found || ended) return;
      if (stage < 2) { stage++; render(); return; }
      ended = true;
      const extra = document.createElement('article'); extra.className='bookshop-ending bk-result'; extra.tabIndex = -1; extra.setAttribute('aria-label','책갈피 고양이들의 낮잠');
      extra.innerHTML = `<div class="bk-book" role="img" aria-label="펼친 책 위에 잠든 고양이 세 마리">${scenes.map((_,i)=>`<img src="${art('sleep-'+i)}" alt="">`).join('')}</div><h3>세 친구가 책 위에서 잠들었어!</h3><p>책갈피 3개 · 사용한 힌트 ${hints}회</p>`;
      api.done({stars:Math.max(1,3-hints),hints,extra});
      container.scrollTop = 0; extra.focus({preventScroll:true});
    });
    render();
    return () => { ended = true; events.abort(); };
  }
  window.TOUR_GAMES.bookshop = { title:'책장 속에 누가 숨어 있지?', button:'고양이 책갈피 찾기', room:'도서실', naver:'Bookshop', maxStars:3, stamp:'도서실 도장 획득!', message:'재희 선배와 도서실의 고양이 책갈피를 모두 찾았어요.', start };
})();
