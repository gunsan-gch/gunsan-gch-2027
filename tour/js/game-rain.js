/* 픽셀 학교 투어 — 사무자동화실 「타자 소나기」
 * 낱말·아이템·규칙은 아래에서 고칩니다. 서버로 보내는 정보는 없습니다.
 */
(() => {
  /* ---------- 선생님이 고칠 수 있는 데이터 ---------- */
  const WORDS = [
    '엑셀', '함수', '서식', '차트', '피벗', '한글', '문서', '저장', '인쇄', '복사',
    '붙여넣기', '키보드', '마우스', '데이터', '파일', '폴더', '자격증', '컴활', '워드', '수식',
    '합계', '평균', '정렬', '필터', '머리글', '그래프', '메일', '첨부', '보고서', '결재',
    '달력', '일정', '백업', '암호', '출력', '스캔', '표지', '목차', '글꼴', '단축키'
  ];
  const ITEMS = [
    { word: '얼음', icon: '❄', effect: 'ice', text: '4초 동안 모든 낱말 멈춤' },
    { word: '천천히', icon: '⏱', effect: 'slow', text: '6초 동안 낙하 속도 절반' },
    { word: '폭탄', icon: '💣', effect: 'bomb', text: '화면의 낱말이 모두 터지고 각각 +1점' },
    { word: '하트', icon: '❤', effect: 'heart', text: '생명 +1, 최대 7개' }
  ];
  const RULES = { seconds: 60, lives: 5, maxLives: 7, maxOnScreen: 5, spawnEveryMs: 1600,
    spawnMinMs: 900, speedUpEverySec: 15, speedUpRate: 1.1, itemEvery: 7, fallSeconds: 7 };
  const STAR_RULE = { three: 25, two: 15 };
  const IMG = 'img/games/office/';
  const el = (tag, className, text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };
  const random = list => list[Math.floor(Math.random() * list.length)];

  function picture(item) {
    const img = document.createElement('img');
    img.alt = ''; img.width = 32; img.height = 32;
    img.addEventListener('error', () => img.replaceWith(el('span', 'rain-emoji', item.icon)), { once: true });
    img.src = `${IMG}item-${item.effect}.png`;
    return img;
  }

  function start(container, api) {
    // 수업·검증용 규칙 변경은 다음 시작부터 적용합니다.
    const rules = { ...RULES };
    const state = { active: false, ended: false, score: 0, lives: rules.lives, items: 0,
      spawned: 0, began: 0, elapsed: 0, last: 0, nextSpawn: rules.spawnEveryMs,
      iceUntil: 0, slowUntil: 0, words: [], painted: -Infinity };
    let frame = 0;
    let composing = false;
    let value = '';
    let commitTimer = 0;
    const timers = new Set();
    const later = (fn, ms) => {
      const timer = setTimeout(() => { timers.delete(timer); fn(); }, ms);
      timers.add(timer);
    };
    container.innerHTML = `
      <div class="rain-intro">
        <ul class="rain-rules">
          <li>낱말을 치고 스페이스나 Enter를 눌러요.</li>
          <li>바닥에 닿으면 생명이 하나 줄어요.</li>
          <li>아이템 낱말을 치면 특별한 효과가 생겨요.</li>
        </ul>
        <div class="rain-items"></div>
        <button type="button" class="btn btn-primary rain-start">시작</button>
      </div>
      <div class="rain" hidden>
        <div class="rain-status">
          <span class="rain-time"></span><span class="rain-score"></span>
          <span class="rain-lives" role="img"></span><span class="rain-effects"></span>
        </div>
        <div class="rain-sky" aria-hidden="true"></div>
        <div class="rain-controls">
          <input class="rain-input" type="text" aria-label="낱말 입력" placeholder="낱말을 입력하세요"
            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="send">
          <button type="button" class="btn btn-primary rain-send">보내기</button>
          <button type="button" class="btn rain-stop">그만하기</button>
        </div>
        <p class="rain-message sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
      </div>`;
    const $ = selector => container.querySelector(selector);
    const sky = $('.rain-sky');
    const input = $('.rain-input');
    const lives = $('.rain-lives');
    const say = text => { $('.rain-message').textContent = text; };
    ITEMS.forEach(item => {
      const row = el('div', 'rain-item-guide');
      const text = el('div', 'rain-item-description');
      text.append(el('strong', '', item.word), el('p', '', item.text));
      row.append(picture(item), text);
      $('.rain-items').append(row);
    });

    function shake(node) {
      if (api.reducedMotion) return;
      node.classList.remove('rain-shake');
      void node.offsetWidth;
      node.classList.add('rain-shake');
    }

    function updateStatus() {
      $('.rain-time').textContent = `남은 시간 ${Math.max(0, Math.ceil(rules.seconds - state.elapsed))}초`;
      $('.rain-score').textContent = `점수 ${state.score}`;
      if (lives.childElementCount !== state.lives) {
        lives.replaceChildren(...Array.from({ length: state.lives }, () => el('span', '', '♥')));
      }
      lives.setAttribute('aria-label', `생명 ${state.lives}개`);
      $('.rain-effects').textContent = [
        state.iceUntil > state.elapsed ? `얼음 ${Math.ceil(state.iceUntil - state.elapsed)}초` : '',
        state.slowUntil > state.elapsed ? `천천히 ${Math.ceil(state.slowUntil - state.elapsed)}초` : ''
      ].filter(Boolean).join(' · ');
    }

    function remove(word, burst) {
      state.words = state.words.filter(w => w !== word);
      if (!burst || api.reducedMotion) return word.node.remove();
      word.node.classList.add('rain-burst');
      later(() => word.node.remove(), 250);
    }

    function finish() {
      if (!state.active) return;
      state.active = false; state.ended = true;
      cancelAnimationFrame(frame);
      clearTimeout(commitTimer);
      input.disabled = true;
      $('.rain-send').disabled = true;
      $('.rain-stop').disabled = true;
      const seconds = Math.floor(Math.min(rules.seconds, (performance.now() - state.began) / 1000));
      const stars = state.score >= STAR_RULE.three ? 3 : state.score >= STAR_RULE.two ? 2 : 1;
      const extra = el('div', 'rain-summary');
      extra.append(el('strong', 'rain-total', `맞힌 낱말 ${state.score}개`));
      extra.append(el('p', 'rain-detail', `남은 생명 ${state.lives} · 아이템 ${state.items}개 사용 · ${seconds}초`));
      say('끝났어요. 결과를 확인해 보세요.');
      later(() => api.done({ stars, hints: 0, extra }), 600);
    }

    function applyItem(item) {
      state.items++;
      if (item.effect === 'ice') state.iceUntil = state.elapsed + 4;
      if (item.effect === 'slow') state.slowUntil = state.elapsed + 6;
      if (item.effect === 'heart') state.lives = Math.min(rules.maxLives, state.lives + 1);
      if (item.effect === 'bomb') {
        // 폭탄으로 터진 아이템은 점수만 더하며 연쇄 효과는 발동하지 않습니다.
        state.words.slice().forEach(word => { state.score++; remove(word, true); });
      }
      say(`${item.word}, ${item.text}`);
    }

    function submit() {
      if (!state.active || composing) return;
      const wanted = value.trim();
      value = ''; input.value = '';
      if (!wanted) return;
      const word = state.words.filter(w => w.text === wanted).sort((a, b) => b.y - a.y)[0];
      if (!word) { shake(input); return; }
      remove(word, true);
      state.score++;
      if (word.item) applyItem(word.item);
      updateStatus();
    }

    function judgeInput() {
      if (!state.active || composing) return;
      const exact = state.words.some(w => w.text === value);
      const prefix = state.words.some(w => w.text !== value && w.text.startsWith(value));
      if (/\s$/.test(value) || (exact && !prefix)) submit();
    }

    function spawn() {
      if (state.words.length >= Math.min(5, rules.maxOnScreen)) return;
      const number = state.spawned + 1;
      const item = number % rules.itemEvery === 0 ? ITEMS[(number / rules.itemEvery - 1) % ITEMS.length] : null;
      const available = WORDS.filter(text => !state.words.some(w => w.text === text));
      const text = item ? item.word : random(available);
      if (!text || state.words.some(w => w.text === text)) return;
      const lane = random([0, 1, 2, 3, 4].filter(n => !state.words.some(w => w.lane === n)));
      const node = el('div', 'rain-word' + (item ? ' rain-item' : ''));
      node.dataset.word = text;
      node.dataset.number = number;
      node.style.left = `${lane * 20}%`;
      node.style.top = '0%';
      if (item) node.append(picture(item));
      node.append(el('span', 'rain-word-text', text));
      sky.append(node);
      state.words.push({ text, lane, node, item, y: 0 });
      state.spawned++;
      say(`낱말 ${text}`);
    }

    const speedAt = seconds => rules.speedUpRate ** Math.floor(seconds / rules.speedUpEverySec);

    // 효과가 끝나거나 속도가 바뀌는 경계를 나누어 계산해 프레임 간격과 무관하게 움직입니다.
    function fallBetween(from, to) {
      const cuts = [from, to, state.iceUntil, state.slowUntil];
      for (let t = (Math.floor(from / rules.speedUpEverySec) + 1) * rules.speedUpEverySec;
        t < to; t += rules.speedUpEverySec) cuts.push(t);
      const points = [...new Set(cuts.filter(t => t >= from && t <= to))].sort((a, b) => a - b);
      let distance = 0;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i];
        if (a < state.iceUntil) continue;
        distance += (b - a) * speedAt(a) * (a < state.slowUntil ? 0.5 : 1) / rules.fallSeconds;
      }
      return distance;
    }

    function moveWords(now) {
      const distance = fallBetween(state.last, state.elapsed);
      const paint = !api.reducedMotion || now - state.painted >= 500;
      if (paint) state.painted = now;
      for (const word of state.words.slice()) {
        word.y += distance;
        if (word.y >= 1) {
          remove(word, false);
          state.lives--;
          updateStatus();
          if (lives.lastElementChild) shake(lives.lastElementChild);
          say(`놓쳤어요, 생명 ${state.lives}개`);
          if (state.lives === 0) { finish(); break; }
        } else if (paint) {
          const bottom = Math.max(0, sky.clientHeight - word.node.offsetHeight - 12);
          word.node.style.top = `${word.y * bottom / sky.clientHeight * 100}%`;
        }
      }
    }

    function tick(now) {
      if (!state.active) return;
      state.elapsed = Math.min(rules.seconds, (now - state.began) / 1000);
      moveWords(now);
      state.last = state.elapsed;
      updateStatus();
      if (!state.active) return;
      if (state.elapsed >= rules.seconds) { finish(); return; }
      if (state.elapsed * 1000 >= state.nextSpawn) {
        spawn();
        state.nextSpawn = state.elapsed * 1000 + Math.max(rules.spawnMinMs, rules.spawnEveryMs / speedAt(state.elapsed));
      }
      frame = requestAnimationFrame(tick);
    }

    function begin() {
      if (state.active || state.ended) return;
      $('.rain-intro').hidden = true;
      $('.rain').hidden = false;
      state.active = true;
      state.began = performance.now();
      updateStatus();
      input.focus({ preventScroll: true });
      frame = requestAnimationFrame(tick);
    }

    input.addEventListener('compositionstart', () => { clearTimeout(commitTimer); composing = true; });
    input.addEventListener('compositionend', () => {
      composing = false;
      commitTimer = setTimeout(judgeInput, 0);
    });
    // Android의 229/Unidentified 키 대신 input 값으로만 낱말을 판정합니다.
    input.addEventListener('input', e => {
      value = input.value;
      composing = composing || e.isComposing;
      judgeInput();
    });
    input.addEventListener('keydown', e => {
      if (composing || e.isComposing || e.keyCode === 229 || e.key === 'Unidentified') return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); submit(); }
    });
    $('.rain-send').addEventListener('click', () => { submit(); input.focus({ preventScroll: true }); });
    $('.rain-stop').addEventListener('click', finish);
    $('.rain-start').addEventListener('click', begin);
    $('.rain-start').focus({ preventScroll: true });
    return () => {
      state.active = false; state.ended = true;
      cancelAnimationFrame(frame);
      clearTimeout(commitTimer);
      timers.forEach(clearTimeout);
    };
  }

  window.TOUR_GAMES = window.TOUR_GAMES || {};
  window.TOUR_GAMES.rain = {
    title: '타자 소나기', button: '🌧️ 타자 소나기', room: '사무자동화실', naver: 'Rain', maxStars: 3,
    stamp: '사무자동화실 도장 획득!',
    message: '사무자동화실에서는 문서 작성과 사무 프로그램을 익히며 자격증 실기를 준비해요.', // ※ 학교 확인
    cta: { href: '../index.html#departments', label: '4개 학과 알아보기 →' },
    rules: RULES,
    start
  };
})();
