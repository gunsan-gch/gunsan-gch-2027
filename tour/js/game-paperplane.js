/* 야외 잔디마당 · 종이비행기 어디까지? */
(() => {
  'use strict';
  const WIDTH = 360, HEIGHT = 400, PLANE_Y = 308, SCALE = 9;
  const STEP = 1 / 120, SPEED = 10, FINISH = 220;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const courses = [
    [95, 259, 105, 98, 254, 110, 244, 98],
    [265, 102, 245, 259, 113, 253, 95, 250],
    [110, 275, 89, 111, 244, 96, 265, 112]
  ];
  function flight(round, power) {
    const xs = courses[round];
    const marks = [25, 55, 85, 105, 132, 162, 193, FINISH].map((distance, i) => ({
      distance, x: xs[i], kind: i === 3 ? 'thermal' : i === 7 ? 'landing' : 'ring', outcome: ''
    }));
    return { round, marks, x: 180, vx: 0, wind: 0, distance: 0, energy: 182 + clamp(power, 0, 100) * .28,
      rings: 0, landing: 0, thermal: false, finished: false };
  }
  function landingBonus(offset) {
    return offset <= 15 ? 30 : offset <= 39 ? 15 : 0;
  }
  function crossings(f, before, after, x0, x1) {
    for (const mark of f.marks) {
      if (mark.distance <= before || mark.distance > after || mark.outcome) continue;
      const x = x0 + (x1 - x0) * (mark.distance - before) / (after - before);
      const offset = Math.abs(x - mark.x);
      if (mark.kind === 'landing') {
        f.landing = landingBonus(offset);
        mark.outcome = f.landing ? 'hit' : 'miss';
      } else {
        const hit = offset <= (mark.kind === 'thermal' ? 31 : 25);
        mark.outcome = hit ? 'hit' : 'miss';
        if (hit && mark.kind === 'ring') f.rings++;
        if (hit && mark.kind === 'thermal') {
          f.thermal = true;
          f.energy += 42;
        }
      }
    }
  }
  function step(f, steer) {
    if (f.finished) return;
    const before = f.distance, x0 = f.x;
    const dt = Math.min(STEP, f.energy / SPEED, (FINISH - before) / SPEED);
    f.wind = 18 * Math.sin(before / 14 + 2 * f.round) + 7 * Math.cos(before / 9);
    f.vx += (clamp(steer, -1, 1) * 154 + f.wind - f.vx) * Math.min(1, dt * 4.5);
    f.x = clamp(x0 + f.vx * dt, 24, WIDTH - 24);
    const moved = SPEED * dt;
    f.energy = Math.max(0, f.energy - moved);
    f.distance = Math.min(FINISH, before + moved);
    if (FINISH - f.distance < 1e-8) f.distance = FINISH;
    crossings(f, before, f.distance, x0, f.x);
    f.finished = f.energy < 1e-8 || f.distance === FINISH;
  }
  function score(f) {
    return Math.floor(f.distance / 10) + f.rings * 10 + f.landing;
  }
  function stars(total) { return total >= 240 ? 3 : total >= 150 ? 2 : 1; }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { flight, step, crossings, score, stars, landingBonus, STEP };
    return;
  }
  function start(container, api) {
    container.innerHTML = `<section class="pp-game">
      <div class="pp-guide"><img src="img/npcs/portraits/yunhee.png" alt=""><div><strong>윤희 선배</strong><p>바람을 읽고 금빛 고리를 지나 봐! 소용돌이를 타면 42m 더 날 수 있어.</p></div></div>
      <div class="pp-hud"><strong class="pp-round"></strong><span class="pp-distance"></span><span class="pp-rings"></span><span class="pp-wind"></span></div>
      <div class="pp-field"><canvas width="360" height="400" tabindex="0" aria-label="잔디마당 비행 코스. 좌우 방향키 또는 드래그로 조종"></canvas><div class="pp-overlay" hidden><strong>잠시 멈춤</strong><button class="pp-resume" type="button">비행 계속하기</button></div></div>
      <div class="pp-energy"><label>남은 비행 거리 <meter min="0" max="224" value="203"></meter></label><span></span></div>
      <div class="pp-deck"><label>던지는 힘 <output></output><input class="pp-power" type="range" min="0" max="100" value="75"></label><button class="pp-launch btn btn-primary" type="button">비행기 날리기</button></div>
      <div class="pp-steering" hidden><button class="pp-left" aria-label="왼쪽으로 조종" type="button">◀ 왼쪽</button><button class="pp-pause" type="button">잠시 멈춤</button><button class="pp-right" aria-label="오른쪽으로 조종" type="button">오른쪽 ▶</button></div>
      <p class="pp-note" role="status"></p><button class="pp-next btn btn-primary" hidden type="button"></button>
      <details><summary>조작법과 별 기준</summary><p>코스에서 위로 길게 쓸어 올릴수록 멀리 날아요. 힘을 고르고 버튼을 눌러도 돼요. 비행 중에는 좌우로 드래그하거나 방향키·조종 버튼을 길게 눌러요.</p><p>10m마다 1점, 고리마다 10점. 220m 착륙장의 중앙은 30점, 가장자리는 15점이에요. 세 번의 합계가 150점이면 별 2개, 240점이면 별 3개예요.</p></details></section>`;
    const $ = selector => container.querySelector(selector);
    const canvas = $('canvas'), ctx = canvas.getContext('2d'), slider = $('.pp-power');
    const events = new AbortController();
    const on = (target, name, listener) => target.addEventListener(name, listener, {signal:events.signal});
    const images = {};
    let mode = 'ready', f = flight(0, 75), results = [];
    let frame = 0, last = null, carry = 0, pointer = null;
    const keys = new Set();
    for (const name of ['course','plane-neutral','plane-left','plane-right','ring','thermal','landing']) {
      const img = new Image();
      images[name] = img;
      on(img, 'load', draw);
      img.src = 'img/games/paperplane/' + name + '.png';
    }
    function sprite(name, x, y, w, h) {
      const img = images[name];
      if (img?.naturalWidth) ctx.drawImage(img, Math.round(x), Math.round(y), w, h);
    }
    function draw() {
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#8fb67a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      const scroll = Math.round(f.distance * SCALE) % 640;
      sprite('course', 0, scroll - 640, WIDTH, 640);
      sprite('course', 0, scroll, WIDTH, 640);
      for (const m of f.marks) {
        const y = PLANE_Y - (m.distance - f.distance) * SCALE;
        if (y < -50 || y > HEIGHT + 50) continue;
        const size = m.kind === 'landing' ? 96 : 64;
        ctx.globalAlpha = m.outcome ? .55 : 1;
        sprite(m.kind, m.x-size/2, y-size/2, size, size);
        ctx.globalAlpha = 1;
        if (m.outcome) {
          ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
          const label = m.outcome === 'miss' ? '빗나감' : m.kind === 'ring' ? '+10점' : m.kind === 'thermal' ? '+42m' : '+' + f.landing + '점';
          ctx.strokeStyle = '#24372d'; ctx.lineWidth = 3; ctx.strokeText(label, m.x, y - size/2);
          ctx.fillStyle = '#fff'; ctx.fillText(label, m.x, y-size/2);
        }
      }
      const bank = f.vx < -30 ? 'left' : f.vx > 30 ? 'right' : 'neutral';
      sprite('plane-' + bank, f.x-24, PLANE_Y-32, 48, 64);
      $('.pp-distance').textContent = Math.floor(f.distance) + 'm';
      $('.pp-rings').textContent = '고리 ' + f.rings + '/6';
      $('.pp-wind').textContent = '바람 ' + (Math.abs(f.wind)<5 ? '잔잔' : f.wind > 0 ? '→' : '←');
      $('meter').value = f.energy;
      $('.pp-energy span').textContent = Math.ceil(f.energy) + 'm';
    }
    function clearInputs() {
      keys.clear();
      if (pointer) {
        const { target, id } = pointer;
        pointer = null;
        if (target.hasPointerCapture(id)) target.releasePointerCapture(id);
      }
    }
    function stopClock() {
      cancelAnimationFrame(frame);
      frame = 0; last = null; carry = 0;
      clearInputs();
    }
    function tick(now) {
      if (mode !== 'flying') return;
      if (last !== null) carry += Math.min(.25, (now-last)/1000);
      last = now;
      while (carry + 1e-12 >= STEP && !f.finished) {
        const steer = pointer?.goal != null ? clamp((pointer.goal - f.x)/22, -1, 1) :
          pointer?.direction || Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft'));
        step(f, steer);
        carry -= STEP;
      }
      draw();
      if (f.finished) {
        mode = 'landed';
        stopClock(); results.push(f);
        $('.pp-steering').hidden = true;
        $('.pp-note').textContent = summary(f);
        const next = $('.pp-next');
        next.textContent = results.length === 3 ? '비행 결과 보기' : '다음 비행 준비';
        next.hidden = false; next.focus({preventScroll:true});
      } else frame = requestAnimationFrame(tick);
    }
    function summary(run) {
      return `${run.round+1}차 · ${Math.floor(run.distance)}m(${Math.floor(run.distance/10)}점) · 고리 ${run.rings}개(${run.rings*10}점) · 착륙 ${run.landing}점 · 합계 ${score(run)}점`;
    }
    function launch(power) {
      if (mode !== 'ready') return;
      clearInputs(); mode = 'flying'; f = flight(results.length, power);
      $('.pp-deck').hidden = true; $('.pp-steering').hidden = false;
      $('.pp-note').textContent = '고리 중심에 기체를 맞춰요. 바람이 불면 반대쪽으로 살짝 조종해요.';
      canvas.focus({preventScroll:true}); frame = requestAnimationFrame(tick);
    }
    function ready() {
      mode = 'ready'; f = flight(results.length, +slider.value);
      $('.pp-round').textContent = (results.length+1) + '차 / 3';
      $('output').textContent = slider.value + '%';
      $('.pp-next').hidden = true; $('.pp-deck').hidden = false;
      $('.pp-note').textContent = '위로 쓸어 올리거나 힘을 고른 뒤 비행기를 날려요.';
      draw();
    }
    function pause() {
      clearInputs();
      if (mode !== 'flying') return;
      mode = 'paused'; stopClock(); $('.pp-overlay').hidden = false;
      $('.pp-resume').focus({preventScroll:true});
    }
    on($('.pp-launch'),'click', () => launch(+slider.value));
    on(slider,'input', ready);
    on($('.pp-next'),'click', () => {
      if (mode !== 'landed') return;
      if (results.length < 3) { ready(); $('.pp-launch').focus({preventScroll:true}); return; }
      const total = results.reduce((sum, r) => sum + score(r), 0);
      const extra = document.createElement('section'); extra.className = 'pp-result';
      extra.innerHTML = '<h3>비행 기록 · 총 ' + total + '점</h3>' + results.map(r => '<p>' + summary(r) + '</p>').join('');
      mode = 'done'; api.done({stars:stars(total), hints:0, extra});
    });
    on($('.pp-pause'),'click',pause);
    on(window,'blur',pause);
    on(document,'visibilitychange',() => { if (document.hidden) pause(); });
    on($('.pp-resume'),'click',() => {
      if (mode !== 'paused' || document.hidden) return;
      mode = 'flying'; $('.pp-overlay').hidden = true; canvas.focus({preventScroll:true});
      frame = requestAnimationFrame(tick);
    });
    on(window,'keydown',e => {
      if (mode !== 'flying' || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
      e.preventDefault(); keys.add(e.key);
    });
    on(window,'keyup',e => keys.delete(e.key));
    function capture(e, direction) {
      if (pointer || e.button !== 0 || (mode !== 'flying' && !(mode === 'ready' && e.currentTarget === canvas))) return;
      const target = e.currentTarget;
      pointer = {id:e.pointerId, target, startX:e.clientX, startY:e.clientY, origin:f.x, direction};
      target.setPointerCapture(e.pointerId); e.preventDefault();
    }
    for (const [target, direction] of [[canvas,0],[$('.pp-left'),-1],[$('.pp-right'),1]]) {
      on(target,'pointerdown',e => capture(e, direction));
      on(target,'pointermove',e => {
        if (mode === 'flying' && pointer?.id === e.pointerId && target === canvas)
          pointer.goal = clamp(pointer.origin + (e.clientX-pointer.startX)*WIDTH/canvas.getBoundingClientRect().width, 24, WIDTH-24);
      });
      on(target,'pointerup',e => {
        if (pointer?.id !== e.pointerId) return;
        const swipe = (pointer.startY-e.clientY)*HEIGHT/canvas.getBoundingClientRect().height;
        clearInputs();
        if (mode === 'ready' && swipe >= 24) launch(clamp(swipe/1.6, 0, 100));
      });
      for (const name of ['pointercancel','lostpointercapture']) on(target,name,e => {
        if (pointer?.id === e.pointerId) clearInputs();
      });
    }
    ready();
    return () => { mode = 'closed'; events.abort(); stopClock(); };
  }
  window.TOUR_GAMES.paperplane = {
    title:'종이비행기 어디까지?', button:'종이비행기 어디까지?', room:'야외 잔디마당', naver:'Paperplane',
    maxStars:3, stamp:'잔디마당 비행 도장 획득!', message:'윤희 선배와 함께한 잔디마당 비행을 마쳤어요.', start
  };
})();
