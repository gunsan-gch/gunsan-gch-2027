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
  const orders = [1, 2, 1, 3, 2, 4];
  const requested = world => orders[world.deliveries % orders.length];
  const fee = tier => 3 * 2 ** tier;
  function stock(world) {
    // Ship the highest matching item first to free headroom.
    return world.bodies.reduce((best, p) => p.tier === requested(world) && (p.landed || p.crafted)
      && (!best || p.y < best.y) ? p : best, null);
  }
  function deliver(world) {
    const item = stock(world);
    if (!item) return null;
    world.bodies.splice(world.bodies.indexOf(item), 1);
    world.score += fee(item.tier);
    world.deliveries++;
    world.turn++;
    return item;
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
    if (speed < -65 && Math.abs(nx) < 0.20 && Math.abs(ny) > 0.9) {
      // A direct impact on a round top slips to its nearer side.
      const upper = ny > 0 ? a : b, lower = upper === a ? b : a;
      if (!upper.landed) {
        const offset = upper.x - lower.x;
        const direction = Math.abs(offset) > 0.6 ? Math.sign(offset) : (upper.x <= width / 2 ? 1 : -1);
        upper.vx += direction * Math.min(80, -speed * 0.19);
      }
    }
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
            product.crafted = true;
            product.turn = world.turn;
            const priorDepth = p => p.crafted && p.turn === product.turn ? p.depth : 0;
            product.depth = 1 + Math.max(priorDepth(a), priorDepth(b));
            const points = 2 ** product.tier * product.depth;
            world.score += points;
            onMerge(product, points);
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
  // Each paper shelf tears when its displayed item merges. The new item
  // inherits the shelf's sideways push and falls toward the next display.
  const layouts = [
    {title:'계단 진열대', first:0, goal:3, aim:102, hint:'배지 위를 눌러 놓기', shelves:[
      [0,102,147,34], [1,115,233,41], [2,133,337,0], [4,283,302,0]]},
    {title:'갈림길 진열대', first:0, goal:3, aim:180, hint:'에코백까지 이어지는 줄은?', shelves:[
      [0,76,141,22], [1,84,242,0], [0,267,163,-60], [1,243,248,-75], [2,212,347,0]]},
    {title:'엇갈린 진열대', first:1, goal:4, aim:165, hint:'쿠션까지 이어지는 틈을 찾아봐', shelves:[
      [1,66,126,55], [2,89,229,0], [4,72,345,0], [1,216,143,95], [2,255,240,-100], [3,219,350,0],
      [0,166,100,0], [0,317,147,0]]}
  ];
  function puzzleRound(index) {
    const spec = layouts[index];
    return {spec, index, phase:'aim', x:spec.aim, item:null, depth:0, pending:0, age:0, nudge:0, nudgeAt:0,
      pause:0, shelves:spec.shelves.map(([tier,x,y,push]) => ({...piece(tier,x,y), push}))};
  }
  function toss(round) {
    if (round.phase !== 'aim') return;
    round.phase = 'fall';
    round.item = piece(round.spec.first, round.x, radii[round.spec.first]+3);
  }
  function canNudge(round) {
    return round.phase === 'fall' && !round.nudge && round.item.tier < round.spec.goal;
  }
  function nudge(round, direction) {
    if (!canNudge(round) || Math.abs(direction) !== 1) return false;
    round.item.vx = direction * 105;
    round.nudge = direction;
    round.nudgeAt = round.age;
    return true;
  }
  function puzzleStep(round, onMerge) {
    if (round.phase !== 'fall') return;
    round.age += step;
    if (round.age > 4.5) { round.phase = 'miss'; return; }
    if (round.pause > 0) { round.pause -= step; return; }
    const p = round.item;
    if (p.tier === round.spec.goal) { round.phase = 'won'; return; }
    p.vy += 650 * step;
    p.x += p.vx * step;
    p.y += p.vy * step;
    walls(p);
    for (const shelf of round.shelves) {
      const dx = p.x - shelf.x, dy = p.y - shelf.y;
      const d = Math.hypot(dx, dy), reach = p.r + shelf.r;
      if (d > reach) continue;
      if (p.tier === shelf.tier) {
        round.shelves.splice(round.shelves.indexOf(shelf), 1);
        const product = piece(p.tier+1, (p.x+shelf.x)/2, (p.y+shelf.y)/2);
        product.vx = shelf.push + p.vx * .08;
        round.item = product;
        round.depth++;
        round.pending += 2 ** product.tier * round.depth;
        round.pause = .29;
        onMerge(product);
        return;
      }
      const nx = d ? dx/d : 1, ny = d ? dy/d : 0;
      p.x += nx*(reach-d+.1);
      p.y += ny*(reach-d+.1);
      const inward = p.vx*nx + p.vy*ny;
      if (inward < 0) {
        p.vx -= 1.2 * inward * nx;
        p.vy -= 1.2 * inward * ny;
      }
      if (Math.abs(nx) < .35 && ny < 0) p.vx += (dx >= 0 ? 1 : -1) * 18;
    }
    if (p.y >= height-p.r) round.phase = 'miss';
  }
  function readCatalogue() {
    try {
      const saved = JSON.parse(localStorage.getItem(catalogueKey));
      return new Set(Array.isArray(saved) ? saved.filter(t => Number.isInteger(t) && t >= 0 && t < names.length) : []);
    } catch { return new Set(); }
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { piece, tick, deliver, stock, requested, fee, stars, step, grace, line, width, height, puzzleRound, toss, nudge, puzzleStep };
  }
  if (typeof window === 'undefined') return;

  document.addEventListener('tour:stamps-reset', () => {
    try { localStorage.removeItem(catalogueKey); } catch { /* Private browsing. */ }
  });

  function start(container, api) {
    container.innerHTML = `<section class="goods-game">
      <div class="goods-play"><div class="goods-modes"><button class="goods-puzzle-mode" aria-pressed="true">한 수 연쇄</button><button class="goods-free-mode" aria-pressed="false">자유 제작</button></div>
      <div class="goods-brief"><div><small class="goods-chapter"></small><strong class="goods-title"></strong></div><span class="goods-recipe"></span></div><div class="goods-order"><img class="goods-order-art" alt=""><div><small>지영 선배의 주문</small><strong class="goods-order-name"></strong></div><button class="goods-ship" disabled>납품</button></div><div class="goods-hud"><span>점수 <b class="goods-score">0</b></span>
      <small class="goods-best" hidden></small><span class="goods-preview">다음 <img class="goods-next-art" alt=""><strong class="goods-next"></strong></span></div>
      <canvas class="goods-board" width="360" height="430" tabindex="0" aria-label="굿즈 상자. 좌우 방향키로 이동하고 스페이스바나 엔터로 놓아요."></canvas>
      <p class="goods-status" role="status"></p>
      <div class="goods-controls"><button class="goods-left" aria-label="왼쪽으로 이동">◀</button><button class="goods-drop">굿즈 놓기</button><button class="goods-right" aria-label="오른쪽으로 이동">▶</button></div>
      <p class="goods-help">상자 위에서 좌우로 끌다가 손을 떼면 놓아요. 점선 위에 굿즈가 2초간 쌓이면 마감해요.</p>
      <div class="goods-actions"><button class="goods-gallery-open">굿즈 도감</button><button class="goods-collect" disabled>도장 받기</button></div>
      <small class="goods-rules">제작을 마치면 ★ · 32점 ★★ · 100점 ★★★</small></div>
      <div class="goods-pause" hidden><p>잠시 멈췄어요.</p><button class="goods-continue">계속하기</button></div>
      <div class="goods-gallery" hidden><h3>이음 굿즈 도감</h3><p class="goods-count"></p><ol class="goods-list"></ol><button class="goods-resume">상자로 돌아가기</button></div>
      </section>`;
    const $ = name => container.querySelector('.goods-' + name);
    const board = $('board'), ctx = board.getContext('2d');
    if (Number.isSafeInteger(api.bestScore) && api.bestScore >= 0) {
      $('best').textContent = '내 최고 ' + api.bestScore + '점';
      $('best').hidden = false;
    }
    const controls = new AbortController();
    const on = (node, type, listener) => node.addEventListener(type, listener, {signal: controls.signal});
    const sprites = names.map((_, i) => { const img = new Image(); img.src = art(i); return img; });
    const known = readCatalogue();
    const world = {bodies: [], score: 0, danger: 0, deliveries: 0, turn: 0};
    let puzzle = true, round = puzzleRound(0), bank = 0, cleared = 0;
    const recipe = spec => names.slice(spec.first, spec.goal+1).map((name, i) =>
      '<img src="' + art(spec.first+i) + '" alt="' + name + '">').join('<i aria-hidden="true">›</i>');
    const roll = () => Math.floor(Math.random()*3);
    let current = 0, next = 0, x = width/2, highest = -1, cooldown = 0, falling = null;
    let frame = 0, last = null, accumulator = 0, pointer = null, gallery = false, paused = false, ended = false;
    let feedback = '배지 두 개를 같은 자리에 놓아 보세요.';
    let warning = false, receipt = null;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    function mark(p, label) {
      receipt = {label, x: p.x, y: p.y - p.r - 8, time: 1.25};
    }
    function discover(t) {
      if (!puzzle) highest = Math.max(highest, t);
      if (known.has(t)) return;
      known.add(t);
      try {
        for (const tier of readCatalogue()) known.add(tier);
        localStorage.setItem(catalogueKey, JSON.stringify([...known]));
      } catch { /* Storage may be disabled. Keep discoveries for this visit. */ }
    }
    function update() {
      $('free-mode').setAttribute('aria-pressed', String(!puzzle));
      $('puzzle-mode').setAttribute('aria-pressed', String(puzzle));
      $('order').hidden = puzzle;
      $('brief').hidden = !puzzle;
      $('rules').hidden = puzzle;
      $('preview').hidden = puzzle;
      board.setAttribute('data-mode', puzzle ? 'puzzle' : 'free');
      $('collect').textContent = puzzle ? '기록 남기기' : '도장 받기';
      $('help').textContent = puzzle ? '상자를 탭해서 놓기 · 방향키로 조준 후 엔터' : '같은 굿즈 두 개를 붙여요. 주문품은 납품하거나 남겨 둘 수 있어요.';
      const flying = puzzle && round.phase === 'fall';
      $('left').textContent = flying ? '◀ 톡' : '◀';
      $('right').textContent = flying ? '톡 ▶' : '▶';
      $('left').setAttribute('aria-label', flying ? '왼쪽으로 톡 밀기' : '왼쪽으로 이동');
      $('right').setAttribute('aria-label', flying ? '오른쪽으로 톡 밀기' : '오른쪽으로 이동');
      if (puzzle) {
        $('help').textContent = '탭해서 놓기 · 떨어지는 동안 ◀ ▶로 한 번 밀기';
        $('chapter').textContent = '한 수 연쇄  ' + (round.index+1) + ' / ' + layouts.length;
        $('title').textContent = round.spec.title;
        $('recipe').innerHTML = recipe(round.spec);
        $('score').textContent = bank;
        $('collect').disabled = !cleared;
        $('left').disabled = $('right').disabled = round.phase !== 'aim' && !canNudge(round);
        $('drop').textContent = ({aim:names[round.spec.first]+' 놓기',fall:round.nudge ? '밀기 사용함' : '한 번 밀기',miss:'다시 조준',won:cleared === layouts.length ? '기록 남기기' : '다음 진열대'})[round.phase];
        $('drop').disabled = round.phase === 'fall';
        $('status').textContent = ({aim:round.spec.hint,fall:round.depth ? round.depth+'연쇄 · '+names[round.item.tier] : '투하!',miss:round.depth ? round.depth+'연쇄에서 멈췄어. 다른 줄을 노려 봐!' : '합체할 짝을 놓쳤어. 같은 굿즈를 노려 봐!',won:round.depth+'연쇄! '+names[round.spec.goal]+' 완성 · +'+round.pending+'점'})[round.phase];
        return;
      }
      $('left').disabled = $('right').disabled = false;
      const tier = requested(world);
      $('order-art').src = art(tier);
      $('order-name').textContent = names[tier] + ' 1개';
      $('ship').textContent = '납품 +' + fee(tier) + '점';
      $('ship').disabled = !active() || !stock(world);
      $('score').textContent = world.score;
      $('next-art').src = art(next);
      $('next').textContent = names[next];
      $('drop').textContent = names[current] + ' 놓기';
      $('drop').disabled = !ready();
      $('collect').disabled = world.score === 0;
      $('status').textContent = warning ? '마감 임박! 점선 위 굿즈를 합쳐 보세요.' : feedback;
    }
    function active() { return !ended && !gallery && !paused && !document.hidden; }
    function ready() { return active() && (puzzle ? round.phase === 'aim' : cooldown <= 0 && !falling); }
    function move(to) {
      if (puzzle) {
        const r = radii[round.spec.first];
        round.x = clamp(to,r,width-r);
      } else x = clamp(to, radii[current], width-radii[current]);
    }
    function drop() {
      if (!ready()) return;
      if (puzzle) {
        toss(round);
        discover(round.spec.first);
        update();
        board.focus();
        return;
      }
      world.turn++;
      falling = piece(current, x, radii[current]+3);
      world.bodies.push(falling);
      discover(current);
      current = next;
      next = world.turn === 1 ? 1 : roll();
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
    function drawPuzzle() {
      const {spec, shelves, item, phase} = round;
      for (const shelf of shelves) {
        const y = shelf.y + shelf.r, w = shelf.r*2 + 12;
        ctx.fillStyle = '#825843';
        ctx.fillRect(shelf.x-w/2,y,w,6);
        ctx.fillStyle = '#ddb17a';
        ctx.fillRect(shelf.x-w/2,y,w,2);
        ctx.fillStyle = '#825843';
        ctx.beginPath();
        ctx.moveTo(shelf.x-6,y+6); ctx.lineTo(shelf.x+5,y+6); ctx.lineTo(shelf.x-6,y+14); ctx.fill();
        if (shelf.push) {
          const direction = Math.sign(shelf.push);
          ctx.fillStyle = '#fff5d7';
          ctx.beginPath(); ctx.moveTo(shelf.x-3*direction,y);
          ctx.lineTo(shelf.x+4*direction,y+3); ctx.lineTo(shelf.x-3*direction,y+6); ctx.fill();
        }
        drawPiece(shelf.tier,shelf.x,shelf.y);
      }
      if (phase === 'aim') {
        const r = radii[spec.first];
        let stop = height-r;
        for (const shelf of shelves) {
          const dx = round.x-shelf.x, reach = shelf.r+r;
          if (Math.abs(dx)<reach) stop=Math.min(stop,shelf.y-Math.sqrt(reach*reach-dx*dx));
        }
        ctx.strokeStyle = '#487a68'; ctx.lineWidth = 2;
        ctx.setLineDash([4,6]); ctx.beginPath(); ctx.moveTo(round.x,2*r+4); ctx.lineTo(round.x,stop); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(round.x,stop,r,0,2*Math.PI); ctx.stroke();
        drawPiece(spec.first,round.x,r+3);
      } else if (item) {
        if (round.nudge && round.age - round.nudgeAt < .38) {
          ctx.fillStyle='#865025'; ctx.textAlign='center'; ctx.font='bold 15px sans-serif';
          ctx.fillText(round.nudge < 0 ? '◀ 톡!' : '톡! ▶', clamp(item.x,23,width-23),item.y+item.r+17);
          ctx.textAlign='left';
        }
        drawPiece(item.tier,item.x,item.y);
        if (round.depth && (round.pause > 0 || phase === 'won')) {
          const lift = reducedMotion ? 0 : 8*(1-clamp(round.pause/.29,0,1));
          ctx.strokeStyle='#bd7438'; ctx.lineWidth=2;
          ctx.beginPath(); ctx.arc(item.x,item.y,item.r+3+lift,0,2*Math.PI); ctx.stroke();
          ctx.font='bold 14px sans-serif'; ctx.textAlign='center';
          const labelX = clamp(item.x,56,width-56);
          ctx.fillStyle='#295c4b'; ctx.fillRect(labelX-44,item.y-item.r-30,88,23);
          ctx.fillStyle='#fff7dc'; ctx.fillText(round.depth+'연쇄!',labelX,item.y-item.r-13); ctx.textAlign='left';
        }
      }
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;
      if (puzzle) { drawPuzzle(); return; }
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
      const orderItem = stock(world);
      for (const p of world.bodies) {
        if (p === orderItem) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 2, 0, 2*Math.PI);
          ctx.strokeStyle = '#aa651c';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        drawPiece(p.tier, p.x, p.y);
      }
      if (receipt && receipt.time > 0) {
        ctx.font = 'bold 13px sans-serif';
        const w = receipt.label.length * 12 + 12;
        const cx = clamp(receipt.x, w/2 + 2, width - w/2 - 2);
        const lift = reducedMotion ? 0 : (1.25 - receipt.time) * 10;
        const cy = clamp(receipt.y - lift, 20, height - 4);
        ctx.fillStyle = '#355749';
        ctx.fillRect(cx-w/2, cy-16, w, 21);
        ctx.fillStyle = '#fff8dd';
        ctx.textAlign = 'center';
        ctx.fillText(receipt.label, cx, cy);
        ctx.textAlign = 'left';
      }
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
      if (ended || (puzzle ? !cleared : !overflow && !world.score)) return;
      cleanup();
      const extra = document.createElement('p');
      if (puzzle) {
        extra.textContent = '한 수 연쇄 · 진열대 ' + cleared + '개 완성 · ' + bank + '점';
        api.done({stars:cleared, points:bank, extra});
        return;
      }
      extra.textContent = (overflow ? '상자 마감' : '제작 마감') + ' · ' + world.score + '점 · 납품 ' + world.deliveries + '건 · 최고 굿즈 ' + names[highest];
      api.done({stars: stars(world.score), points: world.score, extra});
    }
    function animate(time) {
      frame = 0;
      if (!active()) return;
      accumulator += last === null ? 0 : Math.min((time-last)/1000, 0.1);
      last = time;
      while (accumulator+1e-10 >= step) {
        if (puzzle) {
          const before = round.phase;
          puzzleStep(round, product => {
            discover(product.tier);
            api.cue?.('merge', round.depth);
            update();
          });
          if (round.phase !== before) {
            if (round.phase === 'won') {
              bank += round.pending;
              cleared++;
              api.cue?.('clear');
            }
            update();
          }
          accumulator -= step;
          continue;
        }
        const wasReady = ready(), before = world.score;
        if (receipt) receipt.time -= step;
        tick(world, (p, points) => {
          discover(p.tier);
          api.cue?.('merge', p.depth);
          mark(p, (p.depth > 1 ? p.depth + '연쇄 ' : '합체 ') + '+' + points);
          feedback = (p.depth > 1 ? p.depth + '연쇄! ' : '') + names[p.tier] + ' 완성 +' + points + '점';
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
      update();
      board.focus();
    });
    function steer(direction, repeat) {
      if (!active()) return;
      if (puzzle && round.phase === 'fall') {
        if (!repeat && nudge(round,direction)) {
          update();
          draw();
        }
      } else if (!puzzle || round.phase === 'aim') {
        move((puzzle ? round.x : x) + 18*direction);
      }
    }
    function keyboardSteer(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return false;
      steer(e.key === 'ArrowLeft' ? -1 : 1,e.repeat);
      e.preventDefault();
      return true;
    }
    on(board, 'keydown', e => {
      if (!active() || keyboardSteer(e)) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if (!e.repeat) act();
        e.preventDefault();
      }
    });
    on($('controls'), 'keydown', keyboardSteer);
    on($('left'), 'click', () => steer(-1,false));
    on($('right'), 'click', () => steer(1,false));
    function act() {
      if (!active()) return;
      if (puzzle && ['won','miss'].includes(round.phase)) {
        if (round.phase === 'won' && cleared === layouts.length) { finish(false); return; }
        round = puzzleRound(round.phase === 'won' ? cleared : round.index);
        update();
        draw();
        board.focus();
      } else drop();
    }
    on($('drop'), 'click', act);
    function switchMode(toPuzzle) {
      if (!active() || puzzle === toPuzzle) return;
      puzzle = toPuzzle;
      pointer = null;
      update();
      draw();
    }
    on($('free-mode'), 'click', () => switchMode(false));
    on($('puzzle-mode'), 'click', () => switchMode(true));
    on($('ship'), 'click', () => {
      if (!active()) return;
      if (puzzle) return;
      const sold = deliver(world);
      if (!sold) return;
      mark(sold, '납품 +' + fee(sold.tier));
      feedback = names[sold.tier] + ' 납품! +' + fee(sold.tier) + '점';
      update();
      draw();
    });
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
      update();
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
