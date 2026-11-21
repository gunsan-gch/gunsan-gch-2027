/* 학생회 회의실 · 부스 지도 기억하기 */
(() => {
  const names = { food: '분식', craft: '공예', photo: '사진', stage: '무대' };
  const levels = [
    { size: 4, booths: ['food', 'craft', 'photo'] },
    { size: 4, booths: ['food', 'craft', 'photo', 'stage', 'food'] },
    { size: 5, booths: ['food', 'craft', 'photo', 'stage', 'craft', 'photo'] }
  ];
  const total = levels.reduce((sum, level) => sum + level.booths.length, 0);

  function makeMap({ size, booths }, random = Math.random) {
    const empty = Array.from({ length: size * size }, (_, i) => i);
    const map = Array(empty.length).fill(null);
    for (const type of booths) {
      const [cell] = empty.splice(Math.floor(random() * empty.length), 1);
      map[cell] = type;
    }
    return map;
  }

  // 같은 종류의 부스는 어느 카드를 먼저 놓았든 같은 답이다.
  function grade(map, placed) {
    return map.filter((type, i) => type && type === placed[i]).length;
  }

  function reward(points, usedHint) {
    if (points === total && !usedHint) return 3;
    return points / total >= 0.7 ? 2 : 1;
  }

  const art = type => `<img src="img/games/booths/${type}.png" alt="" draggable="false">`;
  const tag = type => art(type) + `<span>${names[type]}</span>`;

  function start(container, api, random = Math.random) {
    const events = new AbortController();
    const $ = selector => container.querySelector(selector);
    let level = 0, points = 0, usedHint = false, phase = 'intro';
    let map = [], placed = [], selected = null, timer;
    container.innerHTML = `
      <section class="bo-game">
        <header class="senior-card">
          <img src="img/npcs/portraits/jeongwon.png" alt="">
          <div><strong>학생회 · 정원 선배</strong>
            <p class="bo-guide" role="status">배치를 3초 기억하고, 같은 자리에 부스를 놓아요.</p>
          </div>
        </header>
        <div class="bo-intro">
          <div class="bo-samples">${Object.keys(names).map(type => `<div>${tag(type)}</div>`).join('')}</div>
          <button class="btn btn-primary" data-act="start">지도 펼치기</button>
        </div>
        <div class="bo-round" hidden>
          <div class="bo-heading"><h3 tabindex="-1"></h3><span class="bo-count"></span></div>
          <progress class="bo-time" aria-label="남은 기억 시간" hidden></progress>
          <div class="bo-grid" role="group" aria-label="예술제 부스 지도"></div>
          <div class="bo-tray" role="group" aria-label="놓을 부스"></div>
          <div class="bo-actions">
            <button class="btn" data-act="hint">다시 보기 · 1회<small>쓰면 최대 별 2개</small></button>
            <button class="btn btn-primary" data-act="check">확인</button>
            <button class="btn btn-primary" data-act="next" hidden></button>
          </div>
        </div>
      </section>`;
    const grid = $('.bo-grid'), tray = $('.bo-tray'), bar = $('.bo-time');
    const guide = $('.bo-guide'), heading = $('.bo-heading h3'), count = $('.bo-count');
    const action = key => $(`[data-act="${key}"]`);
    const config = () => levels[level];
    const types = () => [...new Set(config().booths)];
    const left = type => config().booths.filter(t => t === type).length - placed.filter(t => t === type).length;

    function cellMarkup(type, i) {
      const { size } = config();
      const wrong = phase === 'review' && placed[i] && placed[i] !== type;
      const correctSpot = phase === 'review' && type && placed[i] !== type;
      const mark = wrong ? '<b class="bo-cross" aria-hidden="true">×</b>' : '';
      const position = `${Math.floor(i / size) + 1}행 ${i % size + 1}열`;
      const label = `${position} ${type ? names[type] : '빈칸'}${wrong ? ' · 오답' : ''}`;
      const content = (type ? tag(type) : '') + mark;
      const classes = `bo-cell ${type ? 'bo-filled' : ''} ${correctSpot ? 'bo-answer' : ''}`;
      if (phase === 'place') {
        return `<button class="${classes}" data-cell="${i}" aria-label="${label}">${content}</button>`;
      }
      return `<div class="${classes}" role="img" aria-label="${label}">${content}</div>`;
    }

    function drawGrid() {
      const visible = phase === 'place' ? placed : map;
      grid.innerHTML = visible.map(cellMarkup).join('');
    }

    function updateCards() {
      for (const button of tray.children) {
        const type = button.dataset.type;
        button.disabled = !left(type);
        button.setAttribute('aria-pressed', String(selected === type));
        button.querySelector('span').textContent = `${names[type]} · ${left(type)}`;
      }
      count.textContent = `배치 ${placed.filter(Boolean).length} / ${config().booths.length}`;
      action('check').disabled = placed.filter(Boolean).length < config().booths.length;
    }

    function showPlacement() {
      phase = 'place';
      bar.hidden = true;
      tray.hidden = false;
      action('check').hidden = false;
      action('hint').hidden = false;
      guide.textContent = '카드를 고르고 칸을 눌러요. 놓은 칸을 누르면 빼요.';
      drawGrid();
      updateCards();
    }

    function reveal(duration) {
      phase = 'remember';
      tray.hidden = true;
      action('check').hidden = true;
      action('hint').hidden = true;
      guide.textContent = '그림과 자리를 함께 기억해요.';
      drawGrid();
      bar.max = bar.value = duration;
      bar.hidden = false;
      const end = performance.now() + duration;
      function tick() {
        const remaining = Math.max(0, end - performance.now());
        bar.value = remaining;
        count.textContent = `${Math.ceil(remaining / 500) / 2}초`;
        if (!remaining) return showPlacement();
        timer = setTimeout(tick, Math.min(remaining, api.reducedMotion ? 500 : 100));
      }
      tick();
    }

    function begin() {
      $('.bo-intro').hidden = true;
      $('.bo-round').hidden = false;
      grid.hidden = false;
      action('next').hidden = true;
      heading.textContent = `${level + 1}단계 · 부스 ${config().booths.length}개`;
      heading.focus();
      map = makeMap(config(), random);
      placed = map.map(() => null);
      selected = types()[0];
      grid.style.setProperty('--cols', config().size);
      tray.innerHTML = types().map(type =>
        `<button class="btn" data-type="${type}">${tag(type)}</button>`).join('');
      reveal(3000);
    }

    function place(i) {
      if (placed[i]) {
        selected = placed[i];
        placed[i] = null;
      } else if (selected && left(selected)) {
        placed[i] = selected;
        if (!left(selected)) selected = types().find(type => left(type)) || null;
      }
      drawGrid();
      updateCards();
      $(`[data-cell="${i}"]`).focus({ preventScroll: true });
    }

    function review() {
      phase = 'review';
      const score = grade(map, placed);
      points += score;
      const perfect = score === config().booths.length;
      count.textContent = `${score} / ${config().booths.length} 정답`;
      guide.textContent = perfect ? '완벽! 전부 기억했어요.' : '×는 틀린 칸, 초록 테두리는 정답 자리예요.';
      tray.hidden = action('hint').hidden = action('check').hidden = true;
      drawGrid();
      action('next').textContent = level === levels.length - 1 ? '도장 받기' : '다음 지도 펼치기';
      action('next').hidden = false;
      action('next').focus({ preventScroll: true });
      timer = setTimeout(() => {
        grid.hidden = true;
        if (!perfect) guide.textContent = `부스 ${score}개의 자리를 기억했어요.`;
      }, 3000);
    }

    function advance() {
      clearTimeout(timer);
      if (level + 1 < levels.length) {
        level++;
        begin();
        return;
      }
      phase = 'done';
      const extra = document.createElement('p');
      extra.className = 'game-result-text';
      extra.textContent = `부스 ${points} / ${total}개 정답` +
        (usedHint ? ' · 다시 보기 사용 (최대 별 2개)' : '');
      api.done({ stars: reward(points, usedHint), hints: 0, points, extra });
    }

    container.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || button.disabled) return;
      const { act, type, cell } = button.dataset;
      if (phase === 'intro' && act === 'start') return begin();
      if (phase === 'review' && act === 'next') return advance();
      if (phase !== 'place') return;
      if (type) {
        selected = type;
        updateCards();
      } else if (cell !== undefined) {
        place(Number(cell));
      } else if (act === 'hint' && !usedHint) {
        usedHint = true;
        button.disabled = true;
        button.textContent = '다시 보기 사용함';
        reveal(1500);
      } else if (act === 'check' && placed.filter(Boolean).length === config().booths.length) {
        review();
      }
    }, { signal: events.signal });

    return () => {
      clearTimeout(timer);
      events.abort();
    };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { levels, makeMap, grade, reward };
  if (typeof window !== 'undefined') window.TOUR_GAMES.booths = {
    title: '부스 자리, 기억나?', button: '부스 지도 기억하기', room: '학생회 회의실',
    naver: 'Booths', maxStars: 3, stamp: '예술제 부스 지도 도장!',
    message: '정원 선배와 녹원예술제 부스 지도를 완성했어요.', start
  };
})();
