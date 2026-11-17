/* 음악실 — 현아 선배의 멜로디 따라잡기. All five tunes are original short motifs. */
(() => {
  const R = window.TourMelodyRules, IMG = 'img/games/melody/';
  const LAST_KEY = 'gch-tour-melody-last';
  document.addEventListener('tour:stamps-reset', () => { try { sessionStorage.removeItem(LAST_KEY); } catch {} });

  function start(container, api) {
    let previous = '';
    try { previous = sessionStorage.getItem(LAST_KEY) || ''; } catch {}
    const song = R.pickSong(previous);
    const audio = window.TourMelodyAudio.create();
    let engine = R.create(song.id), disposed = false, playback = 0, muted = false;
    let activeNote = -1, activeSlot = -1, audioWarning = false, flashVersion = 0;
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); if (!disposed) fn(); }, ms);
      timers.add(id); return id;
    };
    container.innerHTML = `
      <section class="melody-game" aria-label="현아 선배의 멜로디 따라잡기">
        <div class="melody-song">
          <img src="${IMG}song-${song.id}.png" alt="" width="48" height="48">
          <div><span>현아 선배가 고른 오늘의 곡</span><h3>${song.title}</h3></div>
          <span class="melody-random">5곡 중 랜덤<br><small>${song.mood}</small></span>
        </div>
        <div class="melody-stage" aria-hidden="true">
          <img class="melody-hyuna" src="${IMG}guide-hyuna.png" alt="" width="64" height="64">
          <span class="melody-float-note"></span>
          <canvas class="melody-player" width="48" height="52"></canvas>
          <span class="melody-name">현아 선배</span><span class="melody-player-name">나</span>
        </div>
        <div class="melody-hud"><strong class="melody-round">준비</strong><span class="melody-lives" role="img" aria-label="남은 기회 3번">♥ ♥ ♥</span><button type="button" class="melody-sound" aria-pressed="true">♪ 소리 켜짐</button></div>
        <div class="melody-prompt" tabindex="-1"><strong class="melody-phase">소리와 불빛을 기억해요</strong><p class="melody-hint">선배의 연주를 보고, 같은 순서로 건반을 눌러요.</p></div>
        <div class="melody-sequence" role="group" aria-label="이번 단계 입력 순서"></div>
        <div class="melody-pads" role="group" aria-label="네 가지 건반">
          ${R.NOTES.map((note, i) => `<button type="button" class="melody-pad melody-pad-${i}" data-note="${i}" aria-label="${note.name} 건반, ${note.key} 또는 ${i+1}" disabled><span aria-hidden="true">${i+1}</span><b>${note.name}</b><kbd>${note.key}</kbd></button>`).join('')}
        </div>
        <div class="melody-actions"><button type="button" class="btn btn-primary melody-main">멜로디 듣고 시작</button><button type="button" class="btn melody-practice">3음 연습</button><button type="button" class="btn melody-pause" hidden>잠깐 쉬기</button></div>
        <p class="melody-help">3음 → 4음 → 5음 → 6음 → 8음 · 시간 제한 없어요.</p>
        <p class="melody-rewards">도전 ★1 · 3단계 성공 ★2 · 5단계 성공 ★3</p>
        <p class="melody-audio-warning" hidden>소리를 켜지 못했어요. 건반 불빛으로 계속할 수 있어요.</p>
        <span class="melody-live sr-only" role="status" aria-live="polite" aria-atomic="true"></span>
      </section>`;
    const $ = selector => container.querySelector(selector);
    const pads = [...container.querySelectorAll('.melody-pad')];
    const main = $('.melody-main'), practiceButton = $('.melody-practice'), pauseButton = $('.melody-pause');
    const soundButton = $('.melody-sound'), live = $('.melody-live');
    const player = $('.melody-player'), sprite = new Image();
    let outfit = {};
    try { outfit = JSON.parse(localStorage.getItem('gch-tour-addons-v1') || '{}').equip || {}; } catch {}
    function drawPlayer() {
      if (disposed || !sprite.complete || !sprite.naturalWidth) return;
      const ctx = player.getContext('2d'); ctx.imageSmoothingEnabled = false;
      if (window.TourCostumes) window.TourCostumes.draw(ctx, sprite, 'left', 1, outfit);
      else { ctx.clearRect(0,0,48,52); ctx.drawImage(sprite,32,120,32,40,8,8,32,40); }
    }
    sprite.onload = drawPlayer; sprite.src = 'img/walker.png';
    function say(text) { live.textContent = text; }
    function clearPlayback() {
      playback++; flashVersion++;
      timers.forEach(clearTimeout); timers.clear(); audio.stop();
      activeNote = -1; activeSlot = -1; lights();
    }
    function lights() {
      pads.forEach((pad, i) => pad.classList.toggle('is-lit', i === activeNote));
      $('.melody-float-note').textContent = activeNote >= 0 ? R.NOTES[activeNote].name : '';
      $('.melody-stage').classList.toggle('is-playing', activeNote >= 0 && !api.reducedMotion);
      [...$('.melody-sequence').children].forEach((cell, i) => cell.classList.toggle('is-current', i === activeSlot));
    }
    function slots() {
      const s = engine.state, pattern = engine.pattern();
      const fragment = document.createDocumentFragment();
      pattern.forEach((note, index) => {
        const cell = document.createElement('span');
        const entered = index < s.entered && ['input', 'cleared', 'finished'].includes(s.phase);
        cell.textContent = entered ? R.NOTES[note].name : String(index + 1);
        cell.className = entered ? 'is-entered' : '';
        cell.setAttribute('aria-label', `${index+1}번째 ${entered ? R.NOTES[note].name+' 입력 완료' : '기억할 음'}`);
        fragment.append(cell);
      });
      $('.melody-sequence').replaceChildren(fragment); lights();
    }
    function render() {
      const s = engine.state, length = engine.pattern().length;
      $('.melody-song h3').textContent = s.practice ? '건반 연습' : song.title;
      $('.melody-round').textContent = s.practice ? '연습 · 3음' : `${s.round+1} / 5단계 · ${length}음`;
      $('.melody-lives').textContent = s.practice ? '연습은 자유롭게' : '♥ '.repeat(s.lives).trim() + '♡ '.repeat(3-s.lives).trim();
      $('.melody-lives').setAttribute('aria-label', s.practice ? '연습은 기회 제한 없음' : `남은 기회 ${s.lives}번`);
      pads.forEach(pad => { pad.disabled = s.phase !== 'input'; });
      practiceButton.hidden = s.phase !== 'ready';
      pauseButton.hidden = !['listening','input','retry'].includes(s.phase);
      main.disabled = s.phase === 'listening' || (s.phase === 'finished' && !s.practice);
      const copy = {
        ready: ['소리와 불빛을 기억해요', '선배의 연주를 보고, 같은 순서로 건반을 눌러요.', '멜로디 듣고 시작'],
        listening: ['현아 선배가 연주 중이에요', `${length}개의 음을 기억해요. 연주가 끝나면 내 차례!`, '연주를 들어요…'],
        input: ['이제 내 차례!', `${s.entered} / ${length}음 입력 · 박자는 달라도 괜찮아요.`, '처음부터 다시 듣기'],
        retry: ['괜찮아, 다시 해 보자!', s.practice ? '연습은 틀려도 기회가 줄지 않아요.' : '기회가 1번 줄었어요. 같은 멜로디를 다시 들어요.', '다시 듣고 도전'],
        cleared: [`${s.cleared}단계 성공!`, '한 음씩 기억하는 길이가 길어져요.', '다음 단계 듣기'],
        paused: ['잠깐 쉬는 중', '기회는 그대로예요. 이번 단계를 다시 듣고 이어가요.', '다시 듣고 계속'],
        finished: s.practice ? ['연습 성공!', '이제 5단계 멜로디에 도전해 볼까?', '실전 시작'] :
          [s.reason==='complete'?'5단계 성공!':'이번 도전은 여기까지!', '내 연주 결과를 확인해요.', '결과 확인 중…']
      };
      const [title, hint, label] = copy[s.phase];
      $('.melody-phase').textContent = title; $('.melody-hint').textContent = hint; main.textContent = label;
      $('.melody-audio-warning').hidden = !audioWarning;
      soundButton.textContent = muted ? '♪ 소리 꺼짐' : '♪ 소리 켜짐';
      soundButton.setAttribute('aria-pressed', String(!muted));
      slots();
    }
    async function perform() {
      clearPlayback(); const token = playback;
      render(); $('.melody-prompt').focus({preventScroll:true});
      const audible = muted ? false : await audio.unlock();
      if (disposed || token !== playback || engine.state.phase !== 'listening') return;
      if (!muted && !audible) { audioWarning = true; muted = true; audio.setMuted(true); render(); }
      const s = engine.state;
      const sequence = s.practice ? { notes: [0,1,2], beats: [1,1,1.5], bpm: 96 } : song;
      const track = R.timeline(sequence, engine.pattern().length);
      say(`현아 선배의 연주. ${track.notes.length}개의 음을 기억해요.`);
      track.notes.forEach((event, index) => {
        audio.tone(R.NOTES[event.note].frequency, event.duration, .25 + event.at);
        later(() => {
          activeNote = event.note; activeSlot = index; lights();
          say(`${index+1}번째 ${R.NOTES[event.note].name}`);
        }, 250 + event.at * 1000);
        later(() => { if (activeSlot === index) { activeNote = -1; activeSlot = -1; lights(); } }, 250 + (event.at + event.duration)*1000);
      });
      later(() => {
        if (!engine.listened()) return;
        activeNote = -1; activeSlot = -1; render();
        say(`이제 내 차례. ${engine.pattern().length}개의 음을 순서대로 눌러요.`);
        pads[0].focus({preventScroll:true});
      }, 450 + track.duration * 1000);
    }
    function begin(practice = false) {
      clearPlayback(); engine = R.create(song.id, { practice });
      if (!practice) { try { sessionStorage.setItem(LAST_KEY, song.id); } catch {} }
      engine.listen(); perform();
    }
    function finish() {
      const s = engine.state; clearPlayback();
      if (s.practice) { render(); main.focus({preventScroll:true}); say('연습 성공! 실전 시작 버튼을 눌러요.'); return; }
      const extra = document.createElement('div'); extra.className = 'melody-summary';
      const img = document.createElement('img'); img.src = IMG + (s.reason==='complete'?'trophy':'guide-hyuna') + '.png'; img.width = 96; img.height = 96; img.alt = '';
      const heading = document.createElement('h3'); heading.textContent = s.reason==='complete'?'현아 선배와 멋진 합주 완성!':'좋아, 다음엔 더 길게 기억해 보자!';
      const detail = document.createElement('p'); detail.textContent = `「${song.title}」 · ${s.cleared} / 5단계 성공`;
      const next = document.createElement('p'); next.textContent = '다시 도전하면 다른 멜로디가 나와요.';
      extra.append(img, heading, detail, next);
      api.done({ stars: R.stars(s.cleared), hints: s.replays, extra });
    }
    function press(note) {
      const result = engine.press(note);
      if (result === 'ignored') return;
      audio.tone(R.NOTES[note].frequency, .28);
      activeNote = note; activeSlot = -1; render();
      const flash = ++flashVersion;
      later(() => { if (flash === flashVersion) { activeNote = -1; lights(); } }, 180);
      if (engine.state.phase === 'finished') { later(finish, 340); return; }
      if (result === 'clear' || result === 'miss') {
        say(result === 'clear' ? `${engine.state.cleared}단계 성공! 다음 단계 듣기를 눌러요.` : `다른 음이었어요. ${engine.state.practice?'연습은 기회 제한이 없어요.':`남은 기회 ${engine.state.lives}번.`}`);
        main.focus({preventScroll:true});
      } else say(`${engine.state.entered}번째 ${R.NOTES[note].name}, 맞았어요.`);
    }
    function pause() {
      if (!engine.pause()) return;
      clearPlayback(); render(); say('잠깐 쉬는 중. 이번 단계를 다시 듣고 계속할 수 있어요.');
      main.focus({preventScroll:true});
    }
    function primary() {
      const s = engine.state;
      if (s.phase === 'ready' || (s.practice && s.phase === 'finished')) begin(false);
      else if (s.phase === 'cleared') { if (engine.next()) perform(); }
      else if (engine.listen()) perform();
    }
    async function toggleSound() {
      muted = !muted; audio.setMuted(muted); audioWarning = false;
      render();
      if (engine.state.phase === 'listening') { perform(); return; }
      if (!muted) {
        const token = playback, audible = await audio.unlock();
        if (disposed || token !== playback) return;
        if (!audible) { muted = true; audioWarning = true; audio.setMuted(true); render(); }
      }
    }
    function onClick(e) {
      const pad = e.target.closest('.melody-pad');
      if (pad) press(Number(pad.dataset.note));
      else if (e.target.closest('.melody-main')) primary();
      else if (e.target.closest('.melody-practice')) begin(true);
      else if (e.target.closest('.melody-pause')) pause();
      else if (e.target.closest('.melody-sound')) toggleSound();
    }
    function onKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input,textarea,select,a') || e.target.isContentEditable) return;
      if (e.repeat && (e.key === 'Enter' || e.key === ' ') && e.target.closest('button')) {
        e.preventDefault(); e.stopPropagation(); return;
      }
      const key = e.key.toLowerCase();
      // Physical keys also work with the Korean input mode. Never intercept text fields.
      const physical = ['KeyA','KeyS','KeyD','KeyF'].indexOf(e.code);
      if (e.isComposing && physical < 0) return;
      const i = physical >= 0 ? physical : ['a','s','d','f'].indexOf(key), number = ['1','2','3','4'].indexOf(key);
      if (i < 0 && number < 0) return;
      e.preventDefault(); e.stopPropagation();
      if (!e.repeat) press(i >= 0 ? i : number);
    }
    const onHidden = () => { if (document.hidden) pause(); };
    container.addEventListener('click', onClick); container.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onHidden); window.addEventListener('blur', pause);
    render(); main.focus({preventScroll:true});
    return () => {
      disposed = true; clearPlayback(); audio.dispose(); sprite.onload = null;
      container.removeEventListener('click', onClick); container.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onHidden); window.removeEventListener('blur', pause);
    };
  }
  window.TOUR_GAMES.melody = {
    title: '멜로디 따라잡기', button: '♫ 멜로디 따라잡기', room: '음악실', naver: 'Melody', maxStars: 3,
    stamp: '음악실 도장 획득!', message: '서로의 소리를 듣고 맞추면 멋진 합주가 돼요.', start
  };
})();
