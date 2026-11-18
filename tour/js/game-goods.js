// 창업동아리 지원센터 · 지영 선배의 이음 굿즈 합치기
(() => {
  const names = ['배지', '아크릴 키링', '파우치', '에코백', '쿠션', '아름 선배 인형', '송현 선배 인형'];
  const radii = [14, 19, 26, 34, 43, 53, 64];
  const colors = ['#f6d375', '#a5dbd6', '#efb8c9', '#becf91', '#add6ea', '#e9b697', '#d6b4d5'];
  const width = 360, height = 430, line = 67, step = 1 / 120, grace = 2;
  const catalogueKey = 'gch-tour-goods-catalogue';
  const art = tier => 'img/games/goods/goods-' + tier + '.png';
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  const stars = score => score >= 100 ? 3 : score >= 32 ? 2 : 1;

  function piece(tier, x, y) {
    const r = radii[tier];
    return { tier, r, x: clamp(x, r, width-r), y: clamp(y, r, height-r),
      vx: 0, vy: 0, supported: false, landed: false, danger: 0 };
  }
  function walls(p) {
    if (p.x < p.r || p.x > width - p.r) {
      p.x = clamp(p.x, p.r, width - p.r);
      p.vx *= -0.08;
    }
    if (p.y >= height - p.r) {
      p.y = height - p.r;
      p.vy = Math.min(0, p.vy);
      p.supported = true;
    }
    if (p.y < p.r) {
      p.y = p.r;
      p.vy = Math.max(0, p.vy);
    }
  }
  function resolve(a, b, nx, ny, overlap) {
    const share = b.r * b.r / (a.r * a.r + b.r * b.r);
    a.x -= nx * overlap * share;
    a.y -= ny * overlap * share;
    b.x += nx * overlap * (1 - share);
    b.y += ny * overlap * (1 - share);
    const speed = (b.vx-a.vx)*nx + (b.vy-a.vy)*ny;
    if (speed < 0) {
      a.vx += nx * speed * share;
      a.vy += ny * speed * share;
      b.vx -= nx * speed * (1 - share);
      b.vy -= ny * speed * (1 - share);
    }
    if (ny > 0.45) a.supported = true;
    if (ny < -0.45) b.supported = true;
  }
  function tick(world, onMerge) {
    const bodies = world.bodies;
    for (const p of bodies) {
      p.previousY = p.y;
      p.supported = false;
      p.vy += 820 * step;
      p.x += p.vx * step;
      p.y += p.vy * step;
      walls(p);
    }
    // New products enter the next tick. Each ingredient can be consumed only once.
    const used = new Set(), products = [];
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i];
        if (used.has(a)) continue;
        for (let j = i+1; j < bodies.length; j++) {
          const b = bodies[j];
          if (used.has(b)) continue;
          const dx = b.x-a.x, dy = b.y-a.y, reach = a.r+b.r;
          const d2 = dx*dx+dy*dy;
          if (d2 > reach*reach) continue;
          if (a.tier === b.tier && a.tier < names.length-1) {
            used.add(a);
            used.add(b);
            const product = piece(a.tier+1, (a.x+b.x)/2, (a.y+b.y)/2);
            products.push(product);
            world.score += 2 ** product.tier;
            onMerge(product);
            break;
          }
          const distance = Math.sqrt(d2);
          resolve(a, b, distance ? dx/distance : 1, distance ? dy/distance : 0, reach-distance);
        }
      }
      for (const p of bodies) if (!used.has(p)) walls(p);
    }
    if (used.size) world.bodies = bodies.filter(p => !used.has(p)).concat(products);
    world.danger = 0;
    for (const p of world.bodies) {
      if (p.supported) {
        p.landed = true;
        p.vx *= 0.97;
        // Contact corrections carry the load of the stack. Keep its actual fall speed.
        p.vy = Math.min(p.vy, Math.max(0, (p.y-p.previousY) / step));
      }
      const settled = p.supported && Math.abs(p.vy) < 22 && Math.abs(p.vx) < 28;
      p.danger = settled && p.y-p.r < line ? p.danger+step : 0;
      world.danger = Math.max(world.danger, p.danger);
    }
  }
  function readCatalogue() {
    try {
      const saved = JSON.parse(localStorage.getItem(catalogueKey));
      return new Set(Array.isArray(saved) ? saved.filter(t => Number.isInteger(t) && t >= 0 && t < names.length) : []);
    } catch { return new Set(); }
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { piece, tick, stars, step, grace, line, width, height };
  }
  if (typeof window === 'undefined') return;

  document.addEventListener('tour:stamps-reset', () => {
    try { localStorage.removeItem(catalogueKey); } catch { /* Private browsing. */ }
  });

  function start(container, api) {
    container.innerHTML = `<section class="goods-game">
      <div class="goods-guide"><img src="img/npcs/portraits/jiyoung.png" alt=""><div><strong>지영 선배</strong><p>같은 굿즈 두 개를 붙여 봐. 마지막 굿즈는 송현 선배 인형이야!</p></div></div>
      <div class="goods-play"><div class="goods-hud"><span>합치기 점수 <b class="goods-score">0</b></span>
      <span>다음 <img class="goods-next-art" alt=""><strong class="goods-next"></strong></span></div>
      <canvas class="goods-board" width="360" height="430" tabindex="0" aria-label="굿즈 상자. 좌우 방향키로 이동하고 스페이스바나 엔터로 놓아요."></canvas>
      <p class="goods-status" role="status"></p>
      <div class="goods-controls"><button class="goods-left" aria-label="왼쪽으로 이동">◀</button><button class="goods-drop">굿즈 놓기</button><button class="goods-right" aria-label="오른쪽으로 이동">▶</button></div>
      <p class="goods-help">상자 위에서 좌우로 끌다가 손을 떼면 놓아요. 점선 위에 굿즈가 2초간 쌓이면 마감해요.</p>
      <div class="goods-actions"><button class="goods-gallery-open">굿즈 도감</button><button class="goods-collect" disabled>도장 받기</button></div>
      <small>제작을 마치면 ★ · 32점 ★★ · 100점 ★★★</small></div>
      <div class="goods-pause" hidden><p>잠시 멈췄어요.</p><button class="goods-continue">계속하기</button></div>
      <div class="goods-gallery" hidden><h3>이음 굿즈 도감</h3><p class="goods-count"></p><ol class="goods-list"></ol><button class="goods-resume">상자로 돌아가기</button></div>
      </section>`;
    const $ = name => container.querySelector('.goods-' + name);
    const board = $('board'), ctx = board.getContext('2d');
    const controls = new AbortController();
    const on = (node, type, listener) => node.addEventListener(type, listener, {signal: controls.signal});
    const sprites = names.map((_, i) => { const img = new Image(); img.src = art(i); return img; });
    const known = readCatalogue();
    const world = {bodies: [], score: 0, danger: 0};
    const roll = () => Math.floor(Math.random()*3);
    let current = 0, next = 0, x = width/2, highest = -1, cooldown = 0, falling = null;
    let frame = 0, last = null, accumulator = 0, pointer = null, gallery = false, paused = false, ended = false;
    let feedback = '배지 두 개를 같은 자리에 놓아 보세요.';
    let warning = false;
    function discover(t) {
      highest = Math.max(highest, t);
      if (known.has(t)) return;
      known.add(t);
      try {
        for (const tier of readCatalogue()) known.add(tier);
        localStorage.setItem(catalogueKey, JSON.stringify([...known]));
      } catch { /* Storage may be disabled. Keep discoveries for this visit. */ }
    }
    function update() {
      $('score').textContent = world.score;
      $('next-art').src = art(next);
      $('next').textContent = names[next];
      $('drop').textContent = names[current] + ' 놓기';
      $('drop').disabled = !ready();
      $('collect').disabled = world.score === 0;
      $('status').textContent = warning ? '마감 임박! 점선 위 굿즈를 합쳐 보세요.' : feedback;
    }
    function active() { return !ended && !gallery && !paused && !document.hidden; }
    function ready() { return active() && cooldown <= 0 && !falling; }
    function move(to) { x = clamp(to, radii[current], width-radii[current]); }
    function drop() {
      if (!ready()) return;
      falling = piece(current, x, radii[current]+3);
      world.bodies.push(falling);
      discover(current);
      current = next;
      next = roll();
      move(x);
      cooldown = 0.32;
      update();
    }
    function drawPiece(t, px, py) {
      const r = radii[t], img = sprites[t];
      ctx.beginPath();
      ctx.arc(px, py, r-1, 0, 2*Math.PI);
      ctx.fillStyle = colors[t];
      ctx.fill();
      ctx.strokeStyle = '#735640';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (img.complete && img.naturalWidth) ctx.drawImage(img, Math.round(px-r), Math.round(py-r), 2*r, 2*r);
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = warning ? '#a12c39' : '#a76759';
      ctx.beginPath();
      ctx.moveTo(0, line); ctx.lineTo(width, line); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#80463e';
      ctx.fillText('마감선', 6, line-5);
      if (ready()) {
        ctx.fillStyle = '#55746640';
        ctx.fillRect(Math.round(x), radii[current]*2+5, 1, height);
        drawPiece(current, x, radii[current]+3);
      }
      for (const p of world.bodies) drawPiece(p.tier, p.x, p.y);
    }
    function stopFrames() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = null;
      accumulator = 0;
      pointer = null;
    }
    function cleanup() {
      ended = true;
      controls.abort();
      stopFrames();
    }
    function finish(overflow) {
      if (ended || (!overflow && !world.score)) return;
      cleanup();
      const extra = document.createElement('p');
      extra.textContent = (overflow ? '상자 마감' : '제작 마감') + ' · ' + world.score + '점 · 최고 굿즈 ' + names[highest];
      api.done({stars: stars(world.score), extra});
    }
    function animate(time) {
      frame = 0;
      if (!active()) return;
      accumulator += last === null ? 0 : Math.min((time-last)/1000, 0.1);
      last = time;
      while (accumulator+1e-10 >= step) {
        const wasReady = ready(), before = world.score;
        tick(world, p => {
          discover(p.tier);
          feedback = names[p.tier] + ' 완성! +' + 2 ** p.tier + '점';
        });
        cooldown -= step;
        if (falling && (falling.landed || !world.bodies.includes(falling))) falling = null;
        const danger = world.danger > 0;
        if (world.danger >= grace) { finish(true); return; }
        if (wasReady !== ready() || before !== world.score || danger !== warning) {
          warning = danger;
          update();
        }
        accumulator -= step;
      }
      draw();
      frame = requestAnimationFrame(animate);
    }
    function restartFrames() {
      stopFrames();
      if (active()) frame = requestAnimationFrame(animate);
    }
    function aim(event) {
      const rect = board.getBoundingClientRect();
      move((event.clientX-rect.left)*width/rect.width);
    }
    on(board, 'pointerdown', e => {
      if (pointer !== null || e.button !== 0 || !ready()) return;
      pointer = e.pointerId;
      board.setPointerCapture(pointer);
      aim(e);
    });
    on(board, 'pointermove', e => { if (e.pointerId === pointer) aim(e); });
    on(board, 'pointerup', e => {
      if (e.pointerId !== pointer) return;
      pointer = null;
      aim(e);
      drop();
    });
    const cancel = e => { if (e.pointerId === pointer) pointer = null; };
    on(board, 'pointercancel', cancel);
    on(board, 'lostpointercapture', cancel);
    function pause() {
      if (gallery || paused || ended) return;
      paused = true;
      $('play').hidden = true;
      $('pause').hidden = false;
      stopFrames();
    }
    on(window, 'blur', pause);
    on($('continue'), 'click', () => {
      paused = false;
      $('pause').hidden = true;
      $('play').hidden = false;
      restartFrames();
      board.focus();
    });
    on(board, 'keydown', e => {
      if (!active()) return;
      if (e.key === 'ArrowLeft') move(x-18);
      else if (e.key === 'ArrowRight') move(x+18);
      else if (e.key === ' ' || e.key === 'Enter') { if (!e.repeat) drop(); }
      else return;
      e.preventDefault();
    });
    on($('left'), 'click', () => move(x-18));
    on($('right'), 'click', () => move(x+18));
    on($('drop'), 'click', drop);
    on($('collect'), 'click', () => finish(false));
    function showGallery(open) {
      gallery = open;
      $('play').hidden = open;
      $('gallery').hidden = !open;
      if (open) {
        $('count').textContent = '발견한 굿즈 ' + known.size + ' / ' + names.length;
        $('list').innerHTML = names.map((name, i) => known.has(i)
          ? '<li><img src="' + art(i) + '" alt=""><span>' + name + '</span></li>'
          : '<li><b aria-hidden="true">?</b><span>미발견</span></li>').join('');
      }
      restartFrames();
      (open ? $('resume') : $('gallery-open')).focus();
    }
    on($('gallery-open'), 'click', () => showGallery(true));
    on($('resume'), 'click', () => showGallery(false));
    on(document, 'visibilitychange', () => {
      if (document.hidden) pause();
      else restartFrames();
    });
    update();
    draw();
    restartFrames();
    return cleanup;
  }
  window.TOUR_GAMES.goods = {title:'이음 굿즈 합치기', button:'이음 굿즈 합치기', room:'창업동아리 지원센터',
    naver:'Goods', maxStars:3, stamp:'창업동아리 굿즈 제작 도장 획득!',
    message:'창업동아리에서는 아이디어를 제품으로 만들고 사람들에게 소개해요.', start};
})();
