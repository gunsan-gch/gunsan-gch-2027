/* 녹원예술제 특집호 — 셔터를 누른 순간의 무대와 피사체를 지면에 옮긴다. */
(() => {
  const art = 'img/games/press/';
  const scenes = [
    { id: 'gym', desk: '스포츠', place: '체육관', title: '네트를 넘는 셔틀콕', tip: '셔틀콕이 네트 위에 뜨면 셔터를 눌러 봐!', caption: '코트를 가르는 하얀 셔틀콕', before: '셔틀콕이 날아와요', cue: '네트 바로 위!', after: '셔틀콕이 내려가요' },
    { id: 'bakery', desk: '생활', place: '조리제빵실', title: '오븐에서 갓 나온 빵', tip: '빵이 오븐 앞으로 나오면 따끈한 순간을 담아 봐!', caption: '학교에 퍼지는 고소한 빵 냄새', before: '오븐에서 빵이 나와요', cue: '갓 구운 빵 등장!', after: '빵이 진열대로 향해요' },
    { id: 'music', desk: '문화', place: '음악실', title: '후렴을 여는 첫 음표', tip: '커다란 음표가 무대 한가운데 떠오를 때야!', caption: '무대를 가득 채운 후렴 한 소절', before: '음표가 떠올라요', cue: '후렴의 첫 음표!', after: '음표가 퍼져 나가요' }
  ];
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
        <header class="press-guide"><img src="${art}guide.png" alt=""><div><strong>수빈 선배 · 이음 취재반</strong><p></p></div></header>
        <div class="press-intro"><h3>오늘의 특집호, 네 사진으로!</h3><p>체육관, 조리제빵실, 음악실에서 사진을 한 장씩 찍고 1면에 실을 기사를 골라요.</p>
        <label><input type="checkbox" class="press-slow"> 직접 한 컷씩 넘기기 (움직임 줄이기)</label>
        <button type="button" class="btn btn-primary press-start">취재 시작</button></div>
        <div class="press-job" hidden><div class="press-slug"><b></b><span></span></div><h3></h3>
        <div class="press-view"><div class="press-frame"><img class="press-back" alt=""><img class="press-subject" alt=""></div><i class="press-focus" aria-hidden="true"></i></div>
        <p class="press-status" role="status"></p><div class="press-controls">
        <button type="button" class="btn press-step" hidden>다음 순간</button>
        <button type="button" class="btn btn-primary press-shoot">● 촬영하기</button>
        <button type="button" class="btn btn-primary press-next" hidden></button></div></div>
        <div class="press-edit" hidden><h3>1면에 어떤 사진을 실을까요?</h3><div class="press-choices"></div></div>
      </section>`;
    const $ = s => container.querySelector(s);
    const tip = $('.press-guide p'), still = $('.press-slow'), status = $('.press-status');
    const frame = $('.press-frame'), subject = $('.press-subject'), shoot = $('.press-shoot');
    const next = $('.press-next'), step = $('.press-step');
    const photos = [];
    let index = 0, t = 0, raf = 0, playing = false, manual = false, stepIndex = 0;
    still.checked = api.reducedMotion;
    tip.textContent = '난 취재반 수빈이야. 오늘은 네가 녹원예술제 사진 기자야!';
    function draw(progress) {
      t = progress;
      const x = index === 1 ? 74 - t * 48 : 15 + t * 70;
      const arc = Math.sin(Math.PI * t);
      const y = index === 0 ? 78 - arc * 30 : index === 1 ? 58 + t * 17 : 74 - arc * 32;
      const scale = index === 1 ? 0.6 + t * 0.95 : 0.77 + arc * 0.45;
      const angle = index === 0 ? -67 + t * 137 : index === 2 ? 15 - arc * 24 : 0;
      subject.style.left = x + '%'; subject.style.top = y + '%';
      subject.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scale(${scale})`;
      const scene = scenes[index], ready = Math.abs(t - 0.5) <= 0.17;
      const cue = ready ? '◎ 지금! ' + scene.cue : t < 0.5 ? '▷ ' + scene.before : '↻ ' + scene.after;
      if (status.textContent !== cue) status.textContent = cue;
      $('.press-view').classList.toggle('press-ready', ready);
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
      playing = true; stepIndex = 0; draw(0);
      (manual ? step : shoot).focus();
      const startTime = performance.now();
      function tick(now) {
        if (!playing) return;
        draw(((now - startTime) % 3700) / 3700);
        raf = requestAnimationFrame(tick);
      }
      if (!manual) raf = requestAnimationFrame(tick);
    }
    function photo() {
      if (!playing) return;
      playing = false; cancelAnimationFrame(raf);
      const scene = scenes[index], delta = Math.abs(t - 0.5);
      const points = delta <= 0.17 ? 3 : delta <= 0.32 ? 2 : 1;
      const rating = ['','현장 스케치','생생한 포착','결정적 순간'][points];
      const print = frame.cloneNode(true);
      print.setAttribute('role','img'); print.setAttribute('aria-label', scene.title + ' · ' + rating);
      photos.push({ print, scene, points, rating });
      status.textContent = '✓ 촬영 완료 · ' + rating;
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
        title.textContent = p.scene.caption;
        caption.append(desk,title); story.append(p.print,caption); paper.append(story);
      });
      const total = photos.reduce((sum,p) => sum+p.points,0);
      api.done({ stars: total >= 8 ? 3 : total >= 5 ? 2 : 1, hints: 0, extra: paper });
      paper.focus({ preventScroll: true });
      container.scrollTop = 0;
    }
    on($('.press-start'),'click',() => { manual = still.checked; begin(); });
    on(step,'click',() => { if (playing && manual) draw([0,0.25,0.5,0.75,1][++stepIndex % 5]); });
    on(shoot,'click',photo);
    on(next,'click',() => {
      if (++index < scenes.length) return begin();
      $('.press-job').hidden = true; $('.press-edit').hidden = false;
      tip.textContent = '세 장 모두 잘 받았어! 가장 크게 싣고 싶은 사진을 골라 줘.';
      for (const p of photos) {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.append(p.print.cloneNode(true), document.createTextNode(p.scene.title));
        on(btn,'click',() => publish(p)); $('.press-choices').append(btn);
      }
      $('.press-choices button').focus();
    });
    return () => { playing = false; cancelAnimationFrame(raf); controller.abort(); };
  }
  window.TOUR_GAMES.press = { title: '찰칵! 녹원예술제 취재반', button: '📷 녹원예술제 취재반', room: '드림스페이스',
    naver: 'Press', nextGame: 'logistics', maxStars: 3, stamp: '녹원예술제 취재반 도장 획득!', message: '세 곳의 예술제 소식을 담은 나만의 특집호를 발행했어요.', start };
})();
