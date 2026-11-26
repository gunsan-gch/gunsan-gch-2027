/* 녹원예술제 특집호 — 셔터를 누른 순간의 무대와 피사체를 지면에 옮긴다. */
(() => {
  const art = 'img/games/press/';
  const scenes = [
    { id: 'gym', duration: 2400, desk: '스포츠', place: '체육관', title: '네트 위의 셔틀콕', tip: '틀 안에 쏙 들어올 때 찰칵! 셔틀콕은 가끔 떨어져.', caption: '코트를 가르는 하얀 셔틀콕' },
    { id: 'bakery', duration: 2000, desk: '생활', place: '조리제빵실', title: '오븐에서 갓 나온 빵', tip: '빵이 잠깐 멈칫해. 틀 안에 오면 찰칵!', caption: '학교에 퍼지는 고소한 빵 냄새' },
    { id: 'music', duration: 1600, desk: '문화', place: '음악실', title: '후렴을 여는 첫 음표', tip: '음표가 좌우로 흔들려. 틀에 쏙 들어오면 찰칵!', caption: '무대를 가득 채운 후렴 한 소절' }
  ];
  const steps = 12, passes = 3;
  const subjectWidth = 11; // 사진 너비에 대한 피사체 너비(%)
  const grades = ['흔들린 사진', '현장 스케치', '생생한 포착', '결정적 순간'];

  function newPass(scene, manual) {
    const duration = scene.duration * (0.8 + Math.random() * 0.4);
    const target = 0.36 + Math.random() * 0.28;
    return {
      duration,
      target: manual ? Math.round(target * steps) / steps : target,
      netDrop: scene.id === 'gym' && Math.random() < 0.3,
      friendAt: Math.random() < 0.15 ? 0.2 + Math.random() * 0.6 : null
    };
  }

  function score(distance) {
    // 소수의 뺄셈 오차 때문에 경계에 찍은 사진이 한 등급 떨어지지 않게 한다.
    if (distance <= 0.04 + Number.EPSILON) return 3;
    if (distance <= 0.10 + Number.EPSILON) return 2;
    if (distance <= 0.20 + Number.EPSILON) return 1;
    return 0;
  }

  function pose(id, phase, netDrop) {
    const arc = Math.sin(Math.PI * phase);
    if (id === 'bakery') {
      const slide = Math.max(0, phase - 0.33);
      return [77 - 12 * Math.min(phase, 0.16) - 85 * slide, 61 + slide * 24, 0, 0.65 + slide];
    }
    if (id === 'music') {
      return [15 + 70 * phase + 10 * Math.sin(4 * Math.PI * phase), 74 - 39 * arc, 15 - arc * 24, 0.77 + arc * 0.45];
    }
    if (netDrop && phase >= 0.5) {
      const fall = Math.min(1, (phase - 0.5) * 4);
      return [50 - 5 * fall, 62 + 27 * fall, 8 + 80 * fall, 1.1];
    }
    return [15 + phase * 70, 79 - arc * (netDrop ? 17 : 30), -67 + phase * 137, 0.77 + arc * 0.45];
  }

  function passPose(id, pass, progress, netDrop) {
    const { target } = pass;
    const phase = progress <= target ? 0.5 * progress / target : 0.5 + 0.5 * (progress - target) / (1 - target);
    const [x, y, angle, scale] = pose(id, phase, netDrop);
    // 기회마다 궤적 전체를 옆으로 옮겨 기존 속도와 멈칫하는 시간을 유지한다.
    return [x + (target - 0.5) * 60, y, angle, scale];
  }
  // 색상표와 픽셀 격자로 그린 예술제 소품. 배경과 함께 같은 위치로 복제해 인화한다.
  const sprites = {
    gym: ['   WWW WWW','  WLLWWLLW','   WLLWLW','   WLLLW','    WLLW','    WLLW','     KK','    KYYK','    KYYK','     KK'],
    bakery: ['   W   W','    W W','   W   W','     W','  BBBBBBB',' BGGGCGGGB','BGGCGGCGGGB','BGCGGCGGGGB',' BGGGGGGGB','  BBBBBBB','LLLLLLLLLLLL',' KKKKKKKKKK'],
    music: ['    KKKKKKK','    KPPPPPK','    KKKKKPK','    KPK KPK','    KPK KPK','    KPK KPK','  KKKPKKKPK',' KPPP KPPPK',' KPPPKKPPK','  KKK  KK']
  };
  const colors = { W:'#fffbed', L:'#99cad3', K:'#24283d', Y:'#fac24d', B:'#82472b', G:'#f6b760', C:'#fff0af', P:'#ff8ed8' };
  function sprite(id) {
    const canvas = document.createElement('canvas');
    canvas.width = 12; canvas.height = 12;
    const ctx = canvas.getContext('2d');
    sprites[id].forEach((row,y) => [...row].forEach((pixel,x) => {
      if (colors[pixel]) { ctx.fillStyle = colors[pixel]; ctx.fillRect(x,y,1,1); }
    }));
    return canvas.toDataURL();
  }

  function start(container, api) {
    const controller = new AbortController();
    const on = (node, event, handle) => node.addEventListener(event, handle, { signal: controller.signal });
    container.innerHTML = `
      <section class="press-app">
        <header class="senior-card"><img src="img/npcs/portraits/subin.png" alt=""><div><strong>수빈 선배 · 이음 취재반</strong><p></p></div></header>
        <div class="press-intro"><h3>오늘의 특집호, 네 사진으로!</h3><p>장면마다 기회 3번 · 노림 틀에 쏙 들어오면 찰칵!</p>
        <label><input type="checkbox" class="press-slow"> 한 컷씩 넘기기</label>
        <button type="button" class="btn btn-primary press-start">취재 시작</button></div>
        <div class="press-job" hidden><div class="press-slug"><b></b><span></span></div><h3></h3>
        <div class="press-view"><div class="press-frame"><img class="press-back" alt=""><img class="press-subject" alt=""><img class="press-friend" src="img/npcs/portraits/songhyeon.png" alt="" hidden></div><i class="press-focus" aria-hidden="true"></i></div>
        <div class="press-readout"><span class="press-chances" role="status"></span><span class="press-count"></span></div>
        <p class="press-status" role="status"></p><div class="press-controls">
        <button type="button" class="btn press-step" hidden>다음 순간</button>
        <button type="button" class="btn btn-primary press-shoot"><i aria-hidden="true"></i>촬영하기</button>
        <button type="button" class="btn btn-primary press-next" hidden></button></div></div>
        <div class="press-edit" hidden><h3>1면에 어떤 사진을 실을까요?</h3><div class="press-choices"></div></div>
      </section>`;
    const $ = s => container.querySelector(s);
    const tip = $('.senior-card p'), still = $('.press-slow'), status = $('.press-status');
    const frame = $('.press-frame'), subject = $('.press-subject'), shoot = $('.press-shoot');
    const next = $('.press-next'), step = $('.press-step');
    const photos = [];
    const friend = $('.press-friend'), view = $('.press-view'), count = $('.press-count');
    const chances = $('.press-chances');
    const focus = $('.press-focus');
    subject.style.width = subjectWidth + '%';
    if (api.reducedMotion) focus.style.transition = 'none';
    let index = 0, t = 0, raf = 0, playing = false, manual = false, stepIndex = 0;
    let pass, used = 0, started = 0, advanceTimer = 0;
    still.checked = api.reducedMotion;
    tip.textContent = '난 취재반 수빈이야. 오늘은 네가 녹원예술제 사진 기자야!';
    function draw(progress) {
      t = progress;
      const [x, y, angle, scale] = passPose(scenes[index].id, pass, t, pass.netDrop);
      subject.style.left = x + '%'; subject.style.top = y + '%';
      subject.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scale(${scale})`;
      const offset = t - pass.friendAt;
      friend.hidden = pass.friendAt === null || Math.abs(offset) > 0.12;
      if (!friend.hidden) friend.style.left = (50 + offset * 520) + '%';
      const ready = index === 0 && used === 0 && score(Math.abs(t - pass.target)) === 3;
      const cue = ready ? '◎ 지금!' : t < pass.target + 0.10 ? '▷ 다가와요' : '↻ 지나갔어요';
      if (status.textContent !== cue) status.textContent = cue;
      view.classList.toggle('press-ready', ready);
      if (manual) count.textContent = (stepIndex + 1) + ' / ' + steps + '컷';
    }
    function showChances() {
      chances.textContent = '기회 ' + '●'.repeat(passes - used) + '○'.repeat(used);
      chances.setAttribute('aria-label', '남은 기회 ' + (passes - used) + '번');
    }
    function rollPass() {
      pass = newPass(scenes[index], manual);
      // 셔틀콕이 네트에 걸려도 노림 틀은 정상 궤적에 둔다.
      const [x, y, angle, scale] = passPose(scenes[index].id, pass, pass.target, false);
      const radians = angle * Math.PI / 180;
      const width = subjectWidth * scale * (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians)));
      focus.style.left = x + '%';
      focus.style.top = y + '%';
      focus.style.width = width + '%';
      focus.style.visibility = 'visible';
      stepIndex = 0;
      showChances();
    }
    function endPass() {
      if (++used < passes) {
        rollPass();
      } else {
        showChances();
        subject.hidden = true;
        friend.hidden = true;
        finishPhoto(0, '놓친 사진', '현장 도착! 피사체는 벌써 퇴장');
        advanceTimer = setTimeout(advance, 1200);
      }
    }
    function tick(now) {
      while (playing && now - started >= pass.duration) {
        started += pass.duration;
        endPass();
      }
      if (!playing) return;
      draw((now - started) / pass.duration);
      raf = requestAnimationFrame(tick);
    }
    function begin() {
      const scene = scenes[index];
      tip.textContent = scene.tip;
      $('.press-job').hidden = false; $('.press-intro').hidden = true;
      $('.press-slug b').textContent = scene.desk + '부';
      $('.press-slug span').textContent = scene.place + ' · ' + (index + 1) + ' / 3';
      $('.press-job h3').textContent = scene.title;
      $('.press-back').src = art + scene.id + '.png';
      subject.src = sprite(scene.id);
      step.hidden = !manual; shoot.hidden = false; next.hidden = true;
      subject.hidden = false;
      frame.classList.toggle('press-blurred', false);
      playing = true; used = 0; rollPass(); draw(0);
      (manual ? step : shoot).focus();
      started = performance.now();
      if (!manual) raf = requestAnimationFrame(tick);
    }
    function photo() {
      if (!playing) return;
      if (!friend.hidden) return finishPhoto(1, '얼굴 대문짝 특종', '단독 인터뷰? 친구 콧구멍만 1면에!');
      const distance = Math.abs(t - pass.target);
      const points = score(distance);
      frame.classList.toggle('press-blurred', points === 0);
      finishPhoto(points, grades[points], scenes[index].caption, distance);
    }
    function finishPhoto(points, rating, caption, distance = 1) {
      playing = false; cancelAnimationFrame(raf);
      focus.style.visibility = 'hidden';
      view.classList.toggle('press-ready', false);
      const scene = scenes[index];
      const print = frame.cloneNode(true);
      print.setAttribute('role','img'); print.setAttribute('aria-label', scene.title + ' · ' + rating);
      photos.push({ print, scene, points, rating, caption, distance });
      status.textContent = rating + ' · ' + points + '점';
      step.hidden = true; shoot.hidden = true; next.hidden = false;
      next.textContent = index < 2 ? '다음 취재 장소' : '특집호 편집하기'; next.focus();
    }
    function publish(lead) {
      const paper = document.createElement('article');
      paper.className = 'press-paper';
      paper.tabIndex = -1;
      paper.setAttribute('aria-label', '녹원예술제 신문');
      paper.innerHTML = '<header><span>군산여상 이음 취재반 · 예술제 특별판</span><h3>녹원예술제 신문</h3><p>사진·편집　나도 학교 기자</p></header>';
      [lead,...photos.filter(p => p !== lead)].forEach((p,i) => {
        const story = document.createElement('figure');
        const caption = document.createElement('figcaption');
        const desk = document.createElement('small'), title = document.createElement('strong');
        desk.textContent = (i ? p.scene.desk + '면' : '1면 특종') + ' · ' + p.rating;
        title.textContent = p.caption;
        caption.append(desk,title); story.append(p.print,caption); paper.append(story);
      });
      const total = photos.reduce((sum,p) => sum+p.points,0);
      // 점수: 사진마다 등급 × 200점 + 정중앙에 가까울수록 최대 200점 보너스
      const record = photos.reduce((sum,p) => sum + p.points*200 + Math.max(0, Math.round((0.1 - p.distance) * 2000)), 0);
      api.done({ stars: total === 9 ? 3 : total >= 6 ? 2 : 1, hints: 0, extra: paper, points: record });
      paper.focus({ preventScroll: true });
      container.scrollTop = 0;
    }
    on($('.press-start'),'click',() => { manual = still.checked; begin(); });
    on(step,'click',() => {
      if (!playing || !manual) return;
      if (++stepIndex === steps) endPass();
      if (playing) draw(stepIndex / steps);
    });
    on(shoot,'click',photo);
    function advance() {
      clearTimeout(advanceTimer);
      if (++index < scenes.length) return begin();
      $('.press-job').hidden = true; $('.press-edit').hidden = false;
      tip.textContent = '세 장 모두 잘 받았어! 가장 크게 싣고 싶은 사진을 골라 줘.';
      for (const p of photos) {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'btn'; btn.append(p.print.cloneNode(true), document.createTextNode(p.scene.title));
        on(btn,'click',() => publish(p)); $('.press-choices').append(btn);
      }
      $('.press-choices button').focus();
    }
    on(next, 'click', advance);
    return () => { playing = false; cancelAnimationFrame(raf); clearTimeout(advanceTimer); controller.abort(); };
  }
  window.TOUR_GAMES.press = { title: '찰칵! 녹원예술제 취재반', icon: 'camera', button: '녹원예술제 취재반', room: '드림스페이스',
    naver: 'Press', nextGame: 'logistics', maxStars: 3, stamp: '녹원예술제 취재반 도장 획득!', message: '세 곳의 예술제 소식을 담은 나만의 특집호를 발행했어요.', start };
})();
