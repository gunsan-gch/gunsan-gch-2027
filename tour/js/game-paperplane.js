/* 야외 잔디마당 · 종이비행기 하늘우체국 */
(() => {
  'use strict';
  const WIDTH = 360, HEIGHT = 400, PLANE_Y = 308, SCALE = 6;
  const STEP = 1 / 120, SPEED = 9, FINISH = 288;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const zones = ['정문', '교정 화단', '운동장'];
  const flightSpeedMultiplier = 1.3;
  const zoneAt = distance => distance < 90 ? 0 : distance < 182 ? 1 : 2;
  const distances = [18,48,78,109,136,165,198,226,254];
  const courses = [
    {wide:[116,100,131,242,114,229,112,122,138], star:[246,271,246,89,263,82,250,281,249], landing:234},
    {wide:[116,100,230,111,243,125,231,261,221], star:[246,271,100,260,99,244,121,78,112], landing:101},
    {wide:[116,100,126,115,239,225,130,105,236], star:[246,271,237,260,100,86,245,267,107], landing:181}
  ];
  const ROLL_TIME = .84, ROLL_RECHARGE = 1.65;
  const GAP_HALF = 49;
  const POST_RANGE = 15, THROW_REACH = 8;
  const stops = [
    {name:'재희', portrait:'jaehee', letter:'책방 초대장', color:'#37756c'},
    {name:'현아', portrait:'hyuna', letter:'공연 응원 쪽지', color:'#a24962'},
    {name:'수아', portrait:'sua', letter:'결승 초대장', color:'#4c65a0'}
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
      posts:[58,151,241].map((distance,i) => ({
        distance, x:course.star[[1,4,7][i]], index:i, outcome:''
      })),
      parcel:null, delivered:0, bullseyes:0,
      ribbons:[32,122,213,271].map((distance,i) => ({
        distance, gap:[100,course.wide[4],course.wide[7],course.landing][i], outcome:''
      })),
      roll:0, recharge:0, stagger:0, cueTime:0, cue:'', tricks:0,
      x:180, vx:0, wind:0, distance:0, energy:229 + clamp(power,0,100)*.1,
      misses:0, rings:0, precision:0, chain:0, best:0, boost:0, points:0, landing:0, finished:false};
  }
  // The sight is fixed eight metres ahead. Lateral momentum carries the letter
  // slightly sideways; the drawing and the hit test use the same landing spot.
  function postX(post, distance) {
    return post.x + (post.index ? 14 * Math.sin((distance-post.distance)/7 + post.index) : 0);
  }
  function aimX(f) { return clamp(f.x + f.vx * .12, 12, WIDTH-12); }
  function nextPost(f) { return f.posts.find(post => !post.outcome); }
  function canSend(f, post) {
    return !f.finished && post && !f.parcel && post.distance-f.distance <= POST_RANGE
      && post.distance >= f.distance;
  }
  function sendLetter(f) {
    const post = nextPost(f);
    if (!canSend(f, post)) return false;
    f.parcel = {post, x:f.x, targetX:aimX(f), start:f.distance, end:f.distance+THROW_REACH};
    return true;
  }
  function updateMail(f) {
    const letter = f.parcel;
    if (letter && f.distance >= letter.end) {
      const post = letter.post;
      const dx = Math.abs(letter.targetX - postX(post, letter.end));
      const dy = Math.abs(letter.end - post.distance) * SCALE;
      const perfect = dx <= 13 && dy <= 14;
      const hit = dx <= 32 && dy <= 30;
      post.outcome = perfect ? 'perfect' : hit ? 'hit' : 'miss';
      f.cueTime = 1.2;
      if (hit) {
        f.delivered++;
        if (perfect) f.bullseyes++;
        const bonus = (perfect ? 22 : 12) + (f.delivered === 3 ? 18 : 0);
        f.points += bonus;
        f.energy += 12;
        f.misses = 0;
        f.boost = Math.max(f.boost, perfect ? 2 : 1);
        f.cue = (f.delivered === 3 ? '세 통 배달 완료!' : perfect ? '정중앙! '+stops[post.index].name+' 선배에게 도착' : stops[post.index].name+' 선배에게 도착!') + ' +' + bonus;
      } else {
        f.cue = '빗나갔어! 다음 우편함을 노려 봐';
      }
      f.parcel = null;
    }
    const post = nextPost(f);
    if (post && !f.parcel && post.distance < f.distance) post.outcome = 'passed';
  }
  function barrelRoll(f) {
    if (f.finished || f.recharge > 0) return false;
    f.roll = ROLL_TIME; f.recharge = ROLL_RECHARGE;
    return true;
  }
  function speedOf(f) {
    const speed = f.stagger > 0 ? 5.5 : SPEED + (f.boost > 0 ? 4 : 0);
    return speed * flightSpeedMultiplier;
  }
  function crossRibbons(f,before,after,x0,x1) {
    for (const ribbon of f.ribbons) {
      if (ribbon.outcome || ribbon.distance <= before || ribbon.distance > after) continue;
      const x = x0+(x1-x0)*(ribbon.distance-before)/(after-before);
      f.cueTime = 1.15;
      if (Math.abs(x-ribbon.gap) <= GAP_HALF) {
        ribbon.outcome = 'clear'; f.cue = '틈새 통과!';
      } else if (f.roll > 0) {
        ribbon.outcome = 'burst'; ribbon.breakX=x; f.tricks++; f.points += 15; f.energy += 6;
        f.boost = 1.6; f.cue = '리본 돌파! +15';
      } else {
        ribbon.outcome = 'clip'; f.energy = Math.max(0,f.energy-4);
        f.boost = 0; f.stagger = .82; f.cue = '날개 스침 · 다시 조종!';
      }
    }
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
    const speed = speedOf(f);
    const dt = Math.min(STEP, f.energy / speed, (FINISH-before)/speed);
    f.roll = Math.max(0,f.roll-dt); f.recharge = Math.max(0,f.recharge-dt);
    f.stagger = Math.max(0,f.stagger-dt); f.cueTime = Math.max(0,f.cueTime-dt);
    f.wind = zone === 0 ? 0 : zone === 1 ? 7*Math.sin((before-90)/10) : -3;
    f.vx += (clamp(steer,-1,1)*165 + f.wind-f.vx)*Math.min(1,dt*6);
    f.x = clamp(x0+f.vx*dt,24,WIDTH-24);
    f.boost = Math.max(0,f.boost-dt);
    f.energy = Math.max(0, f.energy-speed*dt);
    f.distance = Math.min(FINISH,before+speed*dt);
    if (FINISH-f.distance < 1e-8) f.distance=FINISH;
    crossRibbons(f,before,f.distance,x0,f.x);
    crossings(f,before,f.distance,x0,f.x);
    updateMail(f);
    if (f.energy < 1e-8) f.energy = 0;
    f.finished = f.energy === 0 || f.distance === FINISH;
  }
  function score(f) { return f.points + f.landing; }
  function stars(total) { return total >= 155 ? 3 : total >= 60 ? 2 : 1; }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { flight, chooseCourse, barrelRoll, step, crossings, score, stars, landingBonus, sendLetter, postX, STEP };
    return;
  }
  function start(container, api) {
    container.innerHTML = `<section class="pp-game">
      <div class="senior-card"><img src="img/npcs/portraits/yunhee.png" alt=""><div><strong>윤희 선배 · 종이비행기</strong><p>오늘은 네가 하늘 우체부야! 흰 조준점에 우편함이 들어오면 편지를 톡 보내 줘.</p></div></div>
      <div class="pp-hud"><strong class="pp-round"></strong><span class="pp-distance"></span><span class="pp-rings"></span><span class="pp-mail-count"></span><span class="pp-wind"></span></div>
      <div class="pp-field"><canvas width="360" height="400" tabindex="0" aria-label="잔디마당 비행 코스. 좌우 방향키 또는 드래그로 조종"></canvas><span class="pp-cue" role="status" hidden></span><div class="pp-overlay" hidden><strong>잠시 멈춤</strong><button class="btn pp-resume btn-primary" type="button">비행 계속하기</button></div></div>
      <div class="pp-energy"><label>남은 활공 거리 <meter min="0" max="350" value="236"></meter></label><span></span></div>
      <div class="pp-deck"><label>던지는 힘 <output></output><input class="pp-power" type="range" min="0" max="100" value="75"></label><button class="pp-launch btn btn-primary" type="button">비행기 날리기</button></div>
      <div class="pp-steering" hidden><button class="btn pp-left" aria-label="왼쪽으로 조종" type="button">◀ 왼쪽</button><button class="btn pp-roll btn-primary" type="button" aria-keyshortcuts="Space">↻ 한 바퀴!</button><button class="btn pp-send" aria-keyshortcuts="E" type="button">✉ 배달</button><button class="btn pp-right" aria-label="오른쪽으로 조종" type="button">오른쪽 ▶</button><button class="btn pp-pause" type="button" aria-label="잠시 멈춤">Ⅱ</button></div>
      <p class="pp-note" role="status"></p><button class="pp-next btn btn-primary" hidden type="button"></button>
      <details><summary>조작법과 별 기준</summary><p>세 우편함마다 편지 한 통을 보낼 수 있어요. 흰 조준점을 우편함에 겹치고 E 키나 배달 버튼을 눌러요. 비행기가 옆으로 움직이면 편지도 그쪽으로 날아가요. 배달은 12점, 정중앙은 22점! 성공하면 활공 거리 12m를 돌려받고 연속 실수가 초기화돼요. 세 통을 모두 배달하면 18점을 더 받아요.</p><p>코스에서 위로 길게 쓸어 올릴수록 멀리 날아요. 힘을 고르고 버튼을 눌러도 돼요. 고리를 톡 누르면 그쪽으로 날아요. 리본이 다가와 ‘지금!’이 뜨면 스페이스나 ‘한 바퀴!’를 눌러 돌파해요. 성공은 15점과 가속, 스치면 4m를 잃지만 바로 조종할 수 있어요. 좌우로 드래그하거나 방향키·조종 버튼을 길게 눌러도 돼요.</p><p>줄마다 고리 하나를 골라요. 넓은 고리는 8점, 작은 별고리는 18점, 어느 쪽이든 활공 거리 +13m! 두 번째 연속 통과부터 5점과 가속을 얻어요. 네 번 연속 놓치면 잔디에 내려앉아요. 착륙은 중앙 30점, 테두리 15점. 60점부터 별 둘, 155점부터 별 셋이에요.</p></details></section>`;
    const $ = selector => container.querySelector(selector);
    const canvas = $('canvas'), ctx = canvas.getContext('2d'), slider = $('.pp-power');
    const events = new AbortController();
    const on = (target, name, listener) => target.addEventListener(name, listener, {signal:events.signal});
    const images = {};
    const courseIndex = chooseCourse();
    let mode = 'ready', f = flight(75,courseIndex);
    let frame = 0, last = null, carry = 0, pointer = null, goal = null;
    const keys = new Set();
    for (const name of ['course','plane-neutral','plane-left','plane-right','ring','star-ring','schoolyard','garden','playground','landing','roll-strip','ribbon']) {
      const img = new Image();
      images[name] = img;
      on(img, 'load', draw);
      img.src = 'img/games/paperplane/' + name + '.png';
    }
    for (const stop of stops) {
      const img = new Image();
      images[stop.portrait] = img;
      on(img, 'load', draw);
      img.src = 'img/npcs/portraits/' + stop.portrait + '.png';
    }
    function sprite(name, x, y, w, h) {
      const img = images[name];
      if (img?.naturalWidth) ctx.drawImage(img, Math.round(x), Math.round(y), w, h);
    }
    const decorations = ['schoolyard','garden','playground'];
    const briefings = ['재희 선배에게 책방 초대장을! 우편함이 흰 조준점 안에 들어오면 배달을 눌러.',
      '현아 선배의 우편함이 움직여! 날개를 기울이면 편지도 옆으로 날아가.',
      '마지막은 수아 선배의 결승 초대장! 배달한 뒤 운동장 과녁에 착륙해.'];
    let shownZone = -1, shownMisses = 0;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    function caption(label,x,y,color='#fff') {
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4;
      ctx.strokeStyle = '#24372d'; ctx.strokeText(label,x,y);
      ctx.fillStyle = color; ctx.fillText(label,x,y);
    }
    function ribbonSegment(left,right,y,kind) {
      const img = images.ribbon;
      for (let x=left; x<right; x+=64) {
        const w = Math.min(64,right-x);
        if (img?.naturalWidth) ctx.drawImage(img,0,0,w,24,Math.round(x),Math.round(y)-12,w,24);
        else { ctx.fillStyle='#b93d5e'; ctx.fillRect(x,y-4,w,8); }
      }
      if (kind === 'clip') { ctx.fillStyle='#fbeac6'; ctx.fillRect(left,y-2,right-left,3); }
    }
    function ribbonArt(r,y) {
      const leftEnd=r.gap-GAP_HALF, rightStart=r.gap+GAP_HALF;
      const breakX = r.breakX;
      if (r.outcome === 'burst') {
        const tear = reduced?.matches ? 30 : Math.min(50,12+(f.distance-r.distance)*7);
        if (breakX < leftEnd) {
          ribbonSegment(0,Math.max(0,breakX-tear),y);
          ribbonSegment(breakX+tear,leftEnd,y);
        } else ribbonSegment(0,leftEnd,y);
        if (breakX > rightStart) {
          ribbonSegment(rightStart,breakX-tear,y);
          ribbonSegment(breakX+tear,WIDTH,y);
        } else ribbonSegment(rightStart,WIDTH,y);
      } else {
        ribbonSegment(0,leftEnd,y,r.outcome); ribbonSegment(rightStart,WIDTH,y,r.outcome);
      }
    }
    let lastCue = '';
    function stuntCue() {
      const ribbon = f.ribbons.find(r=>!r.outcome);
      const eta = ribbon ? (ribbon.distance-f.distance)/speedOf(f) : Infinity;
      const now = eta <= ROLL_TIME-.08;
      const button = $('.pp-roll'), badge = $('.pp-cue');
      button.dataset.state = f.roll > 0 ? 'rolling' : f.recharge > 0 ? 'charging' : now ? 'now' : '';
      const post = nextPost(f);
      const soon = post && !f.parcel && post.distance-f.distance < 30;
      const linedUp = post && Math.abs(post.distance-f.distance-THROW_REACH)*SCALE <= 30
        && Math.abs(aimX(f)-postX(post,f.distance+THROW_REACH)) <= 32;
      const label = mode !== 'flying' ? '' : f.cueTime > 0 ? f.cue
        : f.roll > 0 ? '한 바퀴!' : now ? '지금! ↻' : eta < 2 ? '리본 접근' : canSend(f,post) ? (linedUp ? '✉ 지금 배달!' : '✉ 조준점을 맞춰!') : soon ? stops[post.index].name+' 선배 우편함 접근' : '';
      if (label !== lastCue) {
        badge.textContent=label; badge.hidden=!label; lastCue=label;
      }
    }
    function drawPost(post, y) {
      const x = Math.round(postX(post, f.distance)), top = Math.round(y);
      if (top < -36 || top > HEIGHT+22) return;
      ctx.save(); ctx.translate(x,top);
      ctx.fillStyle='#47394b'; ctx.fillRect(-4,7,8,16); ctx.fillRect(-18,-12,36,26);
      ctx.fillStyle=stops[post.index].color; ctx.fillRect(-15,-10,30,21);
      ctx.fillStyle='#fff2cb'; ctx.fillRect(-10,-3,20,6);
      ctx.fillStyle='#302c42'; ctx.fillRect(-8,-1,16,3);
      ctx.fillStyle=post.outcome === 'perfect' || post.outcome === 'hit' ? '#71e7a8' : '#ffcf58';
      ctx.fillRect(17,-20,3,19); ctx.fillRect(20,-20,9,6);
      ctx.restore();
      sprite(stops[post.index].portrait, x-44, top-19, 27, 27);
      if (!post.outcome) caption(stops[post.index].name+' 선배',x,top-24,'#fff2c6');
    }
    function mailArt() {
      for (const post of f.posts) drawPost(post, PLANE_Y-(post.distance-f.distance)*SCALE);
      const post = nextPost(f);
      const ready = canSend(f,post);
      const button = $('.pp-send');
      button.disabled = !ready;
      button.dataset.ready = ready ? 'yes' : '';
      if (ready) {
        const x=Math.round(aimX(f)), y=PLANE_Y-THROW_REACH*SCALE;
        for (const [color,w] of [['#263849',3],['#fff9e4',1]]) {
          ctx.fillStyle=color;
          for (const dx of [-14,14]) {
            ctx.fillRect(x+dx,y-6,w,12);
            ctx.fillRect(x+(dx<0?-14:8),y-6,7,w);
            ctx.fillRect(x+(dx<0?-14:8),y+5,7,w);
          }
        }
      }
      if (!f.parcel) return;
      const l=f.parcel, t=clamp((f.distance-l.start)/THROW_REACH,0,1);
      const x=Math.round(l.x+(l.targetX-l.x)*t), y=Math.round(PLANE_Y-48*Math.sin(t*Math.PI));
      ctx.fillStyle='#42364b';ctx.fillRect(x-9,y-6,18,12);
      ctx.fillStyle='#fff2d7';ctx.fillRect(x-7,y-4,14,8);
      ctx.fillStyle='#ba5775';ctx.fillRect(x-6,y-3,3,2);ctx.fillRect(x+3,y-3,3,2);ctx.fillRect(x-3,y-1,6,2);
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
        $('.senior-card p').textContent = guide;
      }
      for (let d = 10; d < FINISH+40; d += 32) {
        const y = PLANE_Y - (d-f.distance)*SCALE;
        if (y < -42 || y > HEIGHT+42) continue;
        const x = (d-10)%64 === 0 ? 0 : WIDTH-42;
        sprite(decorations[zoneAt(d)],x,Math.round(y)-21,42,42);
      }
      for (const ribbon of f.ribbons) {
        const y = PLANE_Y-(ribbon.distance-f.distance)*SCALE;
        if (y > -16 && y < HEIGHT+16) ribbonArt(ribbon,y);
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
      mailArt();
      if (f.boost > 0 && !reduced?.matches) {
        ctx.fillStyle='#ffef9a';
        for (const dx of [-9,0,9]) ctx.fillRect(Math.round(f.x+dx),PLANE_Y+21,3,dx ? 15 : 23);
      }
      const bank = f.vx < -30 ? 'left' : f.vx > 30 ? 'right' : 'neutral';
      const strip = images['roll-strip'];
      if (f.roll > 0 && !reduced?.matches && strip?.naturalWidth) {
        const phase = Math.min(7,Math.floor((1-f.roll/ROLL_TIME)*8));
        const frame = [0,1,2,3,3,2,1,0][phase];
        ctx.save(); ctx.translate(Math.round(f.x),PLANE_Y);
        if (phase >= 4) ctx.scale(-1,1);
        ctx.drawImage(strip,frame*48,0,48,64,-24,-32,48,64); ctx.restore();
      } else {
        const tilt = f.stagger > 0 && !reduced?.matches ? (Math.floor(f.stagger*9)%2 ? 'left' : 'right') : bank;
        sprite('plane-'+tilt,f.x-24,PLANE_Y-32,48,64);
      }
      stuntCue();
      $('.pp-round').textContent = (zone+1)+'구간 · '+zones[zone];
      $('.pp-mail-count').textContent = '✉ '+f.delivered+'/3';
      $('.pp-distance').textContent = Math.floor(f.distance)+'m';
      $('.pp-rings').textContent = score(f)+'점';
      $('.pp-wind').textContent = f.boost > 0 ? '가속 중' : f.chain ? f.chain+'연속' : '바람 '+(Math.abs(f.wind)<5 ? '잔잔' : f.wind > 0 ? '→' : '←');
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
        const ribbon = f.ribbons.find(r=>!r.outcome);
        const deliveriesBefore = f.delivered;
        step(f, steer);
        if (f.delivered > deliveriesBefore) api.cue?.('clear');
        if (ribbon?.outcome === 'burst') api.cue?.('ribbon');
        if (ribbon?.outcome === 'clip') api.cue?.('bump');
        carry -= STEP;
      }
      draw();
      if (f.finished) {
        mode = 'landed'; stuntCue();
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
      return `${Math.floor(run.distance)}m · ${landing} (+${run.landing}점) · 고리 ${run.rings}/9개 (별고리 ${run.precision}개) · 리본 돌파 ${run.tricks}회 · 편지 ${run.delivered}/3통 (정중앙 ${run.bullseyes}통) · 최고 ${run.best}연속 · 합계 ${score(run)}점`;
    }
    function launch(power) {
      if (mode !== 'ready') return;
      clearInputs(); mode = 'flying'; f = flight(power,courseIndex);
      $('.pp-deck').hidden = true; $('.pp-steering').hidden = false;
      $('.pp-note').textContent = '방향키·터치로 조종　|　스페이스로 회전　|　E로 편지 배달';
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
      const receipts = f.posts.map(post => {
        const stop = stops[post.index];
        const status = {perfect:'정중앙 도착', hit:'도착', miss:'빗나감'}[post.outcome] || '미배달';
        return '<li><strong>'+stop.name+' 선배</strong> · '+stop.letter+' <b>'+status+'</b></li>';
      });
      extra.innerHTML = '<h3>윤희의 배달 일지</h3><ul>'+receipts.join('')+'</ul><p>'+summary(f)+'</p>';
      mode = 'done'; api.done({stars:stars(total), points:total, hints:0, extra});
    });
    function deliver() {
      if (mode === 'flying' && sendLetter(f)) draw();
    }
    on($('.pp-send'),'click',deliver);
    function stunt() {
      if (mode === 'flying' && barrelRoll(f)) { api.cue?.('roll'); draw(); }
    }
    on($('.pp-roll'),'pointerdown',e => {
      if (e.button === 0) { e.preventDefault(); stunt(); }
    });
    on($('.pp-roll'),'click',e => { if (!e.detail) stunt(); });
    on($('.pp-pause'),'click',pause);
    on(window,'blur',pause);
    on(document,'visibilitychange',() => { if (document.hidden) pause(); });
    on($('.pp-resume'),'click',() => {
      if (mode !== 'paused' || document.hidden) return;
      mode = 'flying'; $('.pp-overlay').hidden = true; canvas.focus({preventScroll:true});
      frame = requestAnimationFrame(tick);
    });
    on(window,'keydown',e => {
      if (mode === 'flying' && e.code === 'KeyE') {
        e.preventDefault(); if (!e.repeat) deliver(); return;
      }
      if (mode === 'flying' && (e.code === 'Space' || e.key === ' ') &&
          (e.target === window || e.target === canvas || e.target === $('.pp-roll') || e.target === document.body)) {
        e.preventDefault(); if (!e.repeat) stunt(); return;
      }
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
    title:'종이비행기 하늘우체국', button:'종이비행기 하늘우체국', room:'야외 잔디마당', naver:'Paperplane',
    maxStars:3, stamp:'잔디마당 비행 도장 획득!', message:'윤희 선배와 함께한 잔디마당 비행을 마쳤어요.', start
  };
})();
