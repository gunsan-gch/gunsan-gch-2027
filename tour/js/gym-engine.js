/* Original school gym games. Pure rules, no DOM/storage, fixed-step curling physics. */
(() => {
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
  const random01 = random => clamp(random(), 0, .999999999);
  function lifecycle(state) {
    let previous = null;
    return {
      pause() { if (state.phase === 'paused' || state.phase === 'finished') return false; previous = state.phase; state.phase = 'paused'; return true; },
      resume() { if (state.phase !== 'paused' || !previous) return false; state.phase = previous; previous = null; return true; }
    };
  }
  function curlingPoints(x, y) {
    const d = Math.hypot(x - 160, y - 64);
    return d <= 8 ? 10 : d <= 20 ? 7 : d <= 32 ? 4 : d <= 45 ? 2 : 0;
  }
  function curling({ practice = false, random = Math.random } = {}) {
    const state = { kind: 'curling', phase: 'aim', practice, throws: 0, limit: practice ? 1 : 3,
      angle: 0, power: 60, score: 0, elapsed: 0, stones: [], event: 0, message: '방향과 힘을 정해 스톤을 밀어 봐!' };
    if (!practice) state.stones.push(
      { x: 140 + random01(random) * 12, y: 55 + random01(random) * 10, vx: 0, vy: 0, owner: 'mint' },
      { x: 180 + random01(random) * 10, y: 75 + random01(random) * 10, vx: 0, vy: 0, owner: 'mint' });
    let accumulated = 0, rollingTime = 0;
    const score = () => state.stones.filter(s => s.owner === 'coral').reduce((sum, s) => sum + curlingPoints(s.x, s.y), 0);
    function aim(angle, power) {
      if (state.phase !== 'aim') return false;
      state.angle = clamp(angle, -28, 28); state.power = clamp(power, 20, 100); return true;
    }
    function release() {
      if (state.phase !== 'aim' || state.throws >= state.limit) return false;
      const a = state.angle * Math.PI / 180, v = 95 + state.power * 2.8;
      state.stones.push({ x: 160, y: 214, vx: Math.sin(a) * v, vy: -Math.cos(a) * v, owner: 'coral' });
      state.throws++; state.phase = 'rolling'; state.message = '스톤이 멈출 때까지 기다려 봐!'; state.event++;
      rollingTime = 0; accumulated = 0; return true;
    }
    function step(dt) {
      rollingTime += dt; state.elapsed += dt;
      for (const s of state.stones) {
        s.x += s.vx * dt; s.y += s.vy * dt;
        const friction = Math.exp(-1.8 * dt); s.vx *= friction; s.vy *= friction;
        if (s.x < 42 || s.x > 278) { s.x = clamp(s.x, 42, 278); s.vx *= -.55; }
        if (s.y < 20 || s.y > 224) { s.y = clamp(s.y, 20, 224); s.vy *= -.55; }
        if (Math.hypot(s.vx, s.vy) < 1.6) { s.vx = 0; s.vy = 0; }
      }
      for (let i = 0; i < state.stones.length; i++) for (let j = i + 1; j < state.stones.length; j++) {
        const a = state.stones[i], b = state.stones[j], dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy); if (d >= 17) continue;
        const nx = d > .001 ? dx / d : 1, ny = d > .001 ? dy / d : 0;
        const overlap = (17 - d) / 2 + .01;
        a.x = clamp(a.x - nx * overlap, 42, 278); a.y = clamp(a.y - ny * overlap, 20, 224);
        b.x = clamp(b.x + nx * overlap, 42, 278); b.y = clamp(b.y + ny * overlap, 20, 224);
        const closing = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (closing > 0) { const impulse = closing * .9; a.vx -= impulse * nx; a.vy -= impulse * ny; b.vx += impulse * nx; b.vy += impulse * ny; }
      }
      if (rollingTime > 8 || state.stones.every(s => !s.vx && !s.vy)) {
        state.stones.forEach(s => { s.vx = 0; s.vy = 0; }); state.score = score();
        state.phase = state.throws === state.limit ? 'finished' : 'aim'; state.event++;
        state.message = state.phase === 'finished' ? `내 스톤 최종 합계 ${state.score}점!` : `${state.throws}번째 스톤 도착! 다음 스톤을 밀어 봐.`;
      }
    }
    function advance(seconds) {
      if (state.phase !== 'rolling' || !Number.isFinite(seconds) || seconds <= 0) return;
      accumulated += Math.min(seconds, .25);
      while (accumulated >= 1 / 120 && state.phase === 'rolling') { step(1 / 120); accumulated -= 1 / 120; }
    }
    return { state, aim, release, advance, ...lifecycle(state) };
  }
  function targetPoints(distance) {
    return distance <= 8 ? 10 : distance <= 27 ? 9 : distance <= 50 ? 7 : distance <= 72 ? 5 : distance <= 96 ? 3 : 0;
  }
  function target({ practice = false, random = Math.random } = {}) {
    const state = { kind: 'target', phase: 'aim', practice, shots: [], limit: practice ? 3 : 5, score: 0,
      combo: 0, bestCombo: 0, t: 0, cooldown: 0, offset: random01(random) * Math.PI * 2, event: 0, message: '조준점이 가운데에 올 때 눌러 봐!' };
    function position() {
      const a = state.t * (1.45 + state.shots.length * .12) + state.offset;
      return { x: 160 + Math.sin(a) * 82, y: 120 + Math.sin(a * 2) * 62 };
    }
    function shoot() {
      if (state.phase !== 'aim' || state.shots.length >= state.limit) return false;
      const p = position(), base = targetPoints(Math.hypot(p.x - 160, p.y - 120));
      state.combo = base >= 8 ? state.combo + 1 : 0; state.bestCombo = Math.max(state.bestCombo, state.combo);
      const bonus = state.combo > 1 ? 1 : 0;
      state.shots.push({ ...p, base, bonus }); state.score += base + bonus;
      state.phase = 'cooldown'; state.cooldown = .75; state.event++;
      state.message = base === 10 ? `정중앙! 10점${bonus ? ' + 연속 보너스 1점' : ''}` : `${base}점${bonus ? ' + 연속 보너스 1점' : ''}! 다음 조준도 천천히.`;
      return true;
    }
    function advance(seconds) {
      const dt = clamp(seconds, 0, .1);
      if (state.phase === 'aim') state.t += dt;
      else if (state.phase === 'cooldown') {
        state.cooldown -= dt;
        if (state.cooldown <= 0) { state.phase = state.shots.length === state.limit ? 'finished' : 'aim'; state.offset = random01(random) * Math.PI * 2; state.t = 0; state.event++; }
      }
    }
    return { state, position, shoot, advance, ...lifecycle(state) };
  }
  function badminton({ practice = false, random = Math.random } = {}) {
    const state = { kind: 'badminton', phase: 'serve', practice, player: 160, opponent: 160, aimX: 160,
      mine: 0, theirs: 0, rally: 0, bestRally: 0, returns: 0, smashes: 0, flight: 0, duration: 1.5,
      fromX: 160, toX: 160, serveTime: .9, swing: 0, event: 0, message: '바닥 표시 쪽으로 움직여 셔틀콕을 기다려!' };
    let move = 0, targetX = null, perfect = false;
    function input(direction) { move = state.phase === 'paused' || state.phase === 'finished' ? 0 : clamp(direction, -1, 1); if (move) targetX = null; }
    function moveTo(x) { if (state.phase === 'paused' || state.phase === 'finished') return; targetX = clamp(x, 48, 272); move = 0; }
    function incoming() {
      state.fromX = state.opponent; state.toX = practice ? 100 + random01(random) * 120 : 62 + random01(random) * 196;
      state.aimX = state.toX; state.flight = 0; state.duration = practice ? 1.7 : Math.max(1, 1.55 - state.rally * .06);
      state.phase = 'incoming'; state.event++;
    }
    function point(winner) {
      if (!practice) { if (winner) state.mine++; else state.theirs++; }
      state.rally = 0; state.event++;
      state.message = winner ? '내 점수! 잘 받아쳤어!' : practice ? '괜찮아! 바닥 표시로 이동해서 다시 받아 봐.' : '수아 선배의 득점! 다음 공은 받아 보자.';
      if (state.mine >= 5 || state.theirs >= 5) state.phase = 'finished';
      else { state.phase = 'serve'; state.serveTime = 1.2; }
    }
    function hit() {
      if (state.phase !== 'incoming' || state.swing > 0) return false;
      state.swing = .23;
      const timing = state.flight / state.duration, distance = Math.abs(state.player - state.toX);
      if (timing < .73 || timing > 1.1 || distance > 32) {
        state.message = distance > 32 ? '먼저 바닥 표시 가까이 이동해 봐!' : '조금 더 기다렸다가 쳐 봐!'; state.event++; return false;
      }
      perfect = timing >= .9 && timing <= 1.04 && distance <= 17;
      state.rally++; state.returns++; state.bestRally = Math.max(state.bestRally, state.rally); if (perfect) state.smashes++;
      state.message = perfect ? '스매시! 정확하게 받아쳤어!' : `${state.rally}번 연속 랠리!`; state.event++;
      if (practice && state.returns >= 3) { state.phase = 'finished'; return true; }
      state.fromX = state.player; state.toX = state.player >= 160 ? 65 + random01(random) * 65 : 190 + random01(random) * 65;
      state.flight = 0; state.duration = perfect ? .43 : .7; state.phase = 'outgoing'; return true;
    }
    function advance(seconds) {
      if (state.phase === 'paused' || state.phase === 'finished') return;
      const dt = clamp(seconds, 0, .05);
      const direction = targetX === null ? move : Math.abs(targetX - state.player) < 2 ? 0 : Math.sign(targetX - state.player);
      const step = direction * 205 * dt;
      state.player = clamp(targetX !== null && Math.abs(step) > Math.abs(targetX - state.player) ? targetX : state.player + step, 48, 272);
      state.swing = Math.max(0, state.swing - dt);
      if (state.phase === 'serve') { state.serveTime -= dt; if (state.serveTime <= 0) incoming(); return; }
      state.flight += dt;
      if (state.phase === 'incoming' && state.flight / state.duration > 1.12) { point(false); return; }
      if (state.phase === 'outgoing') {
        const distance = state.toX - state.opponent, reach = 200 * dt;
        state.opponent += clamp(distance, -reach, reach);
        if (state.flight >= state.duration) {
          if (random01(random) < (perfect ? .65 : .16) || state.rally >= 7) point(true); else incoming();
        }
      }
    }
    return { state, input, moveTo, hit, advance, ...lifecycle(state) };
  }
  function stars(kind, state) {
    if (state.practice || state.phase !== 'finished') return 0;
    if (kind === 'curling') return state.score >= 20 ? 3 : state.score >= 10 ? 2 : 1;
    if (kind === 'target') return state.score >= 44 ? 3 : state.score >= 28 ? 2 : 1;
    return state.mine >= 5 ? 3 : state.mine >= 3 || state.bestRally >= 6 ? 2 : 1;
  }
  window.TourGymRules = { curling, target, badminton, curlingPoints, targetPoints, stars };
})();
