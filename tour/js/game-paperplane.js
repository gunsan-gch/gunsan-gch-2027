/* 야외 잔디마당 · 종이비행기 어디까지? */
(() => {
  'use strict';
  const WIDTH = 360, HEIGHT = 400, PLANE_Y = 308, SCALE = 6;
  const STEP = 1 / 120, SPEED = 9, FINISH = 288;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const zones = ['정문', '교정 화단', '운동장'];
  const zoneAt = distance => distance < 90 ? 0 : distance < 182 ? 1 : 2;
  const distances = [18,48,78,109,136,165,198,226,254];
  const courses = [
    {wide:[116,100,131,242,114,229,112,122,138], star:[246,271,246,89,263,82,250,281,249], landing:234},
    {wide:[116,100,230,111,243,125,231,261,221], star:[246,271,100,260,99,244,121,78,112], landing:101},
    {wide:[116,100,126,115,239,225,130,105,236], star:[246,271,237,260,100,86,245,267,107], landing:181}
  ];
  let previousCourse = null;
  function chooseCourse() {
    const index = previousCourse === null ? Math.floor(Math.random()*courses.length)
      : (previousCourse+1+Math.floor(Math.random()*(courses.length-1)))%courses.length;
    previousCourse = index;
    return index;
  }
  function flight(power, index=0) {
    const course = courses[index];
    return {marks:distances.map((distance,i) => ({distance,x:course.wide[i],starX:course.star[i],outcome:''}))
      .concat({distance:FINISH,x:course.landing,kind:'landing',outcome:''}),
      x:180, vx:0, wind:0, distance:0, energy:229 + clamp(power,0,100)*.1,
      misses:0, rings:0, precision:0, chain:0, best:0, boost:0, points:0, landing:0, finished:false};
  }
  function landingBonus(offset) { return offset <= 18 ? 30 : offset <= 44 ? 15 : 0; }
  function crossings(f, before, after, x0, x1) {
    for (const m of f.marks) {
      if (m.distance <= before || m.distance > after || m.outcome) continue;
      const x = x0 + (x1-x0)*(m.distance-before)/(after-before);
      if (m.kind === 'landing') {
        f.landing = landingBonus(Math.abs(x-m.x));
        m.outcome = f.landing ? 'hit' : 'miss';
        continue;
      }
      const star = Math.abs(x-m.starX) <= 19;
      if (!star && Math.abs(x-m.x) > 35) {
        m.outcome = 'miss'; f.chain = 0; f.boost = 0; f.misses++;
        if (f.misses === 4) f.energy = Math.min(f.energy,12);
        continue;
      }
      m.outcome = star ? 'star' : 'wide';
      f.misses = 0; f.rings++; f.precision += Number(star); f.chain++;
      f.best = Math.max(f.best,f.chain);
      m.combo = f.chain >= 2;
      m.bonus = (star ? 18 : 8) + (m.combo ? 5 : 0);
      f.points += m.bonus;
      f.energy += 13;
      if (m.combo) f.boost = 1.35;
    }
  }
  function step(f, steer) {
    if (f.finished) return;
    const before = f.distance, x0 = f.x, zone = zoneAt(before);
    const speed = SPEED + (f.boost > 0 ? 4 : 0);
    const dt = Math.min(STEP, f.energy / speed, (FINISH-before)/speed);
    f.wind = zone === 0 ? 0 : zone === 1 ? 7*Math.sin((before-90)/10) : -3;
    f.vx += (clamp(steer,-1,1)*165 + f.wind-f.vx)*Math.min(1,dt*6);
    f.x = clamp(x0+f.vx*dt,24,WIDTH-24);
    f.boost = Math.max(0,f.boost-dt);
    f.energy = Math.max(0, f.energy-speed*dt);
    f.distance = Math.min(FINISH,before+speed*dt);
    if (FINISH-f.distance < 1e-8) f.distance=FINISH;
    crossings(f,before,f.distance,x0,f.x);
    f.finished = f.energy < 1e-8 || f.distance === FINISH;
  }
  function score(f) { return f.points + f.landing; }
  function stars(total) { return total >= 155 ? 3 : total >= 60 ? 2 : 1; }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { flight, chooseCourse, step, crossings, score, stars, landingBonus, STEP };
    return;
  }
  function start(container, api) {
    container.innerHTML = `<section class="pp-game">
      <div class="pp-guide"><img src="img/npcs/portraits/yunhee.png" alt=""><div><strong>윤희 선배</strong><p>고리를 톡 누르거나 좌우로 조종해 봐! 넓은 고리는 8점, 작은 별고리는 18점이야.</p></div></div>
      <div class="pp-hud"><strong class="pp-round"></strong><span class="pp-distance"></span><span class="pp-rings"></span><span class="pp-wind"></span></div>
      <div class="pp-field"><canvas width="360" height="400" tabindex="0" aria-label="잔디마당 비행 코스. 좌우 방향키 또는 드래그로 조종"></canvas><div class="pp-overlay" hidden><strong>잠시 멈춤</strong><button class="pp-resume" type="button">비행 계속하기</button></div></div>
      <div class="pp-energy"><label>남은 활공 거리 <meter min="0" max="350" value="236"></meter></label><span></span></div>
      <div class="pp-deck"><label>던지는 힘 <output></output><input class="pp-power" type="range" min="0" max="100" value="75"></label><button class="pp-launch btn btn-primary" type="button">비행기 날리기</button></div>
      <div class="pp-steering" hidden><button class="pp-left" aria-label="왼쪽으로 조종" type="button">◀ 왼쪽</button><button class="pp-pause" type="button">잠시 멈춤</button><button class="pp-right" aria-label="오른쪽으로 조종" type="button">오른쪽 ▶</button></div>
      <p class="pp-note" role="status"></p><button class="pp-next btn btn-primary" hidden type="button"></button>
      <details><summary>조작법과 별 기준</summary><p>코스에서 위로 길게 쓸어 올릴수록 멀리 날아요. 힘을 고르고 버튼을 눌러도 돼요. 고리를 톡 누르면 그쪽으로 날아요. 좌우로 드래그하거나 방향키·조종 버튼을 길게 눌러도 돼요.</p><p>줄마다 고리 하나를 골라요. 넓은 고리는 8점, 작은 별고리는 18점, 어느 쪽이든 활공 거리 +13m! 두 번째 연속 통과부터 5점과 가속을 얻어요. 네 번 연속 놓치면 잔디에 내려앉아요. 착륙은 중앙 30점, 테두리 15점. 60점부터 별 둘, 155점부터 별 셋이에요.</p></details></section>`;
    const $ = selector => container.querySelector(selector);
    const canvas = $('canvas'), ctx = canvas.getContext('2d'), slider = $('.pp-power');
    const events = new AbortController();
    const on = (target, name, listener) => target.addEventListener(name, listener, {signal:events.signal});
    const images = {};
    const courseIndex = chooseCourse();
    let mode = 'ready', f = flight(75,courseIndex);
    let frame = 0, last = null, carry = 0, pointer = null, goal = null;
    const keys = new Set();
    for (const name of ['course','plane-neutral','plane-left','plane-right','ring','star-ring','schoolyard','garden','playground','landing']) {
      const img = new Image();
      images[name] = img;
      on(img, 'load', draw);
      img.src = 'img/games/paperplane/' + name + '.png';
    }
    function sprite(name, x, y, w, h) {
      const img = images[name];
      if (img?.naturalWidth) ctx.drawImage(img, Math.round(x), Math.round(y), w, h);
    }
    const decorations = ['schoolyard','garden','playground'];
    const briefings = ['넓은 고리와 작은 별고리 중 하나를 골라요.',
      '화단 바람이 방향을 바꿔요. 다음 고리 쪽으로 미리 움직여요.',
      '운동장 끝 288m에 착륙 표적이 있어요. 흰 비행기를 과녁 중앙에 맞춰요.'];
    let shownZone = -1, shownMisses = 0;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    function caption(label,x,y,color='#fff') {
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4;
      ctx.strokeStyle = '#24372d'; ctx.strokeText(label,x,y);
      ctx.fillStyle = color; ctx.fillText(label,x,y);
    }
    function draw() {
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#8fb67a'; ctx.fillRect(0,0,WIDTH,HEIGHT);
      const zone = zoneAt(f.distance);
      const scroll = reduced?.matches ? 0 : Math.round(f.distance*SCALE)%640;
      sprite('course',0,scroll-640,WIDTH,640); sprite('course',0,scroll,WIDTH,640);
      if (mode === 'flying' && (shownZone !== zone || shownMisses !== f.misses)) {
        shownZone = zone; shownMisses = f.misses;
        const guide = f.misses >= 4 ? '잔디에 내려앉아요. 다음엔 넓은 고리를 노려 봐요!'
          : f.misses === 3 ? '한 번 더! 다음 고리를 통과하면 비행을 이어 가요.' : briefings[zone];
        $('.pp-guide p').textContent = guide;
      }
      for (let d = 10; d < FINISH+40; d += 32) {
        const y = PLANE_Y - (d-f.distance)*SCALE;
        if (y < -42 || y > HEIGHT+42) continue;
        const x = (d-10)%64 === 0 ? 0 : WIDTH-42;
        sprite(decorations[zoneAt(d)],x,Math.round(y)-21,42,42);
      }
      for (const m of f.marks) {
        const y = PLANE_Y-(m.distance-f.distance)*SCALE;
        if (y < -60 || y > HEIGHT+60) continue;
        ctx.globalAlpha = m.outcome ? .58 : 1;
        if (m.kind === 'landing') {
          sprite('landing',m.x-54,y-54,108,108); caption('착륙 표적',m.x,y-48);
        } else {
          sprite('ring',m.x-42,y-42,84,84);
          sprite('star-ring',m.starX-25,y-25,50,50);
          if (!m.outcome) { caption('8',m.x,y-34); caption('★18',m.starX,y-23,'#ffefa6'); }
        }
        ctx.globalAlpha=1;
        if (m.outcome && !m.kind) {
          const hitX = m.outcome === 'star' ? m.starX : m.x;
          const label = m.outcome === 'miss' ? '놓침' : (m.combo ? '연속! +' : '+')+m.bonus;
          caption(label,m.outcome === 'miss' ? f.x : hitX,y-30);
        }
      }
      if (f.boost > 0 && !reduced?.matches) {
        ctx.fillStyle='#ffef9a';
        for (const dx of [-9,0,9]) ctx.fillRect(Math.round(f.x+dx),PLANE_Y+21,3,dx ? 15 : 23);
      }
      const bank = f.vx < -30 ? 'left' : f.vx > 30 ? 'right' : 'neutral';
      sprite('plane-'+bank,f.x-24,PLANE_Y-32,48,64);
      $('.pp-round').textContent = (zone+1)+'구간 · '+zones[zone];
      $('.pp-distance').textContent = Math.floor(f.distance)+'m';
      $('.pp-rings').textContent = score(f)+'점';
      $('.pp-wind').textContent = f.boost > 0 ? f.chain+'연속 가속' : f.chain ? f.chain+'연속' : '바람 '+(Math.abs(f.wind)<5 ? '잔잔' : f.wind > 0 ? '→' : '←');
      $('meter').value = f.energy;
      $('.pp-energy span').textContent = Math.ceil(f.energy)+'m';
    }
    function releasePointer() {
      if (pointer) {
        const { target, id } = pointer;
        pointer = null;
        if (target.hasPointerCapture(id)) target.releasePointerCapture(id);
      }
    }
    function clearInputs() {
      releasePointer(); goal = null; keys.clear();
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
        const steer = goal != null ? clamp((goal - f.x)/22, -1, 1) :
          pointer?.direction || Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft'));
        step(f, steer);
        carry -= STEP;
      }
      draw();
      if (f.finished) {
        mode = 'landed';
        stopClock();
        $('.pp-steering').hidden = true;
        $('.pp-note').textContent = summary(f);
        const next = $('.pp-next');
        next.textContent = '도장과 비행 기록 보기';
        next.hidden = false; next.focus({preventScroll:true});
      } else frame = requestAnimationFrame(tick);
    }
    function summary(run) {
      const landing = run.distance < FINISH ? '중간 착지' : run.landing === 30 ? '정중앙 착륙' : run.landing ? '표적 착륙' : '표적 밖 착륙';
      return `${Math.floor(run.distance)}m · ${landing} (+${run.landing}점) · 고리 ${run.rings}/9개 (별고리 ${run.precision}개) · 최고 ${run.best}연속 · 합계 ${score(run)}점`;
    }
    function launch(power) {
      if (mode !== 'ready') return;
      clearInputs(); mode = 'flying'; f = flight(power,courseIndex);
      $('.pp-deck').hidden = true; $('.pp-steering').hidden = false;
      $('.pp-note').textContent = '고리를 톡 누르거나 좌우로 조종해요. 두 번 연속 통과하면 가속!';
      canvas.focus({preventScroll:true}); frame = requestAnimationFrame(tick);
    }
    function ready() {
      mode = 'ready'; f = flight(+slider.value,courseIndex);
      $('output').textContent = slider.value + '%';
      $('.pp-next').hidden = true; $('.pp-deck').hidden = false;
      const best = Number.isSafeInteger(api.bestScore) && api.bestScore >= 0 ? '내 최고 '+api.bestScore+'점 · ' : '';
      $('.pp-note').textContent = best+'위로 쓸어 올리거나 힘을 고른 뒤 비행기를 날려요.';
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
      const total = score(f);
      const extra = document.createElement('section'); extra.className = 'pp-result';
      extra.innerHTML = '<h3>비행 기록</h3><p>' + summary(f) + '</p><p>' + (f.distance < FINISH ? '다음 비행에서는 넓은 고리를 노려 봐요. 하나마다 13m 더 갈 수 있어요.' : f.precision < 9 ? '같은 줄의 작은 별고리는 넓은 고리보다 10점 더 받아요.' : '별고리 아홉 개를 모두 통과했어요!') + '</p>';
      mode = 'done'; api.done({stars:stars(total), points:total, hints:0, extra});
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
      e.preventDefault(); releasePointer(); goal = null; keys.add(e.key);
    });
    on(window,'keyup',e => keys.delete(e.key));
    function capture(e, direction) {
      if (direction && pointer?.target === canvas) releasePointer();
      if (pointer || e.button !== 0 || (mode !== 'flying' && !(mode === 'ready' && e.currentTarget === canvas))) return;
      const target = e.currentTarget;
      goal = null; keys.clear();
      pointer = {id:e.pointerId, target, startX:e.clientX, startY:e.clientY, origin:f.x, direction};
      target.setPointerCapture(e.pointerId); e.preventDefault();
    }
    for (const [target, direction] of [[canvas,0],[$('.pp-left'),-1],[$('.pp-right'),1]]) {
      on(target,'pointerdown',e => capture(e, direction));
      on(target,'pointermove',e => {
        if (mode !== 'flying' || pointer?.id !== e.pointerId || target !== canvas) return;
        const dx = e.clientX-pointer.startX;
        if (Math.abs(dx) > 4) pointer.dragged = true;
        if (pointer.dragged) goal = clamp(pointer.origin+dx*WIDTH/canvas.getBoundingClientRect().width,24,WIDTH-24);
      });
      on(target,'pointerup',e => {
        if (pointer?.id !== e.pointerId || pointer.target !== target) return;
        const rect = canvas.getBoundingClientRect();
        const swipe = (pointer.startY-e.clientY)*HEIGHT/rect.height;
        if (mode === 'flying' && target === canvas) {
          const dx = e.clientX-pointer.startX;
          const x = pointer.dragged || Math.abs(dx)>4 ? pointer.origin+dx*WIDTH/rect.width
            : (e.clientX-rect.left)*WIDTH/rect.width;
          goal = clamp(x,24,WIDTH-24);
        }
        releasePointer();
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
