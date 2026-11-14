/* 픽셀 학교 투어 — 정보처리실 「타자 속도 재기」
 * 문장·별 기준·안내는 아래에서 고칩니다. 결과 화면과 도장은 games.js가 맡습니다.
 */
(() => {
  /* ---------- 선생님이 고칠 수 있는 데이터 ---------- */
  const PASSAGES = [
    '정보처리실에서는 학생마다 컴퓨터 한 대씩 쓰며 문서 작성과 자료 정리를 연습합니다. 오늘 배운 내용을 친구와 함께 살펴보고, 어려운 부분은 선생님께 물으며 자신의 실력을 차근차근 쌓으며 자격증 실기를 준비해요.',
    '아침에 교실에 들어오면 친구들과 반갑게 인사를 나누고 오늘 시간표를 살펴봅니다. 책상 위를 깨끗하게 정리하고 필요한 책과 공책을 꺼내면 친구들과 서로 도우며 새로운 하루를 기분 좋게 시작할 수 있어요.',
    '문서를 만들 때는 제목을 먼저 쓰고 전하고 싶은 내용을 차근차근 정리합니다. 글씨 크기와 줄 간격을 알맞게 맞춘 뒤 빠진 내용이나 틀린 글자가 없는지 처음부터 끝까지 다시 한번 꼼꼼하게 읽어 보아요.',
    '컴퓨터에 저장한 자료는 알아보기 쉬운 이름을 붙여 폴더에 나누어 보관합니다. 중요한 파일은 다른 곳에도 한 번 더 저장해 두고, 실습을 마치면 다음에 쓸 사람을 생각하며 사용한 자리를 깨끗하게 정리해요.',
    '자격증 공부는 매일 조금씩 꾸준하게 연습하는 것이 중요합니다. 처음에는 낯설고 어려운 문제도 친구와 함께 풀어 보고 잘 모르는 부분을 다시 익히면 하루하루 성장하며 스스로 해내는 기쁨을 느낄 수 있어요.',
    '군산에는 바다를 바라보며 걸을 수 있는 길과 오랜 이야기가 담긴 거리가 있습니다. 우리 고장의 아름다운 모습을 사진으로 남기고 우리가 직접 찾은 이야기를 담아 친구들에게 소개할 안내문을 함께 만들어 보아요.',
    '표에 모은 숫자를 살펴보면 우리 반 친구들이 좋아하는 간식을 한눈에 알 수 있습니다. 자료를 바르게 입력하고 합계와 평균을 구한 뒤 보기 좋은 그래프로 바꾸어 서로의 생각을 나누며 결과를 발표해 보아요.',
    '학교 축제를 준비하며 친구들과 해야 할 일을 나누고 일정표를 만들었습니다. 서로의 생각을 듣고 맡은 일을 하나씩 끝내면서 함께 힘을 모으면 더 즐거운 학교생활을 만들 수 있다는 것을 배워요.'
  ];
  const STAR_RULE = { three: 300, two: 180, accuracyFloor: 90 };
  const GUIDE_TEXT = '문장을 그대로 따라 쳐 보세요. 첫 글자를 치면 시간이 시작돼요.';
  const SUMMARY_TEXT = (accuracy, seconds, count) => `정확도 ${accuracy}% · ${seconds}초 · 글자 ${count}개`;
  let previous = -1;

  /* ---------- 두벌식 타수 (Shift와 줄바꿈은 세지 않음) ---------- */
  function strokesOf(text) {
    const vowels = [9, 10, 11, 14, 15, 16, 19];
    const finals = [3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 18];
    return Array.from(text).reduce((sum, ch) => {
      if (ch === '\n' || ch === '\r') return sum;
      const code = ch.codePointAt(0) - 0xAC00;
      if (code < 0 || code > 11171) return sum + 1;
      const vowel = Math.floor(code / 28) % 21;
      const final = code % 28;
      return sum + 2 + Number(vowels.includes(vowel)) + Number(final > 0) + Number(finals.includes(final));
    }, 0);
  }

  const el = (tag, className, text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };

  function start(container, api) {
    let target = [];
    let value = [];
    let began = null;
    let composing = false;
    let finished = false;
    let interval = 0;
    let commitTimer = 0;
    container.innerHTML = `
      <div class="typing">
        <div class="typing-guide"><span class="typing-monitor" aria-hidden="true"></span><p></p></div>
        <p class="typing-target" id="typing-target" aria-label="따라 칠 문장"></p>
        <textarea class="typing-input" rows="2" aria-label="문장 입력" aria-describedby="typing-target"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done"></textarea>
        <div class="typing-stats" aria-hidden="true"></div>
        <div class="typing-actions">
          <button type="button" class="btn typing-another">다른 문장</button>
          <button type="button" class="btn typing-reset">처음부터</button>
        </div>
      </div>`;
    const $ = selector => container.querySelector(selector);
    const input = $('.typing-input');
    const passage = $('.typing-target');
    const stats = $('.typing-stats');
    $('.typing-guide p').textContent = GUIDE_TEXT;
    const img = document.createElement('img');
    img.alt = ''; img.width = 48; img.height = 48;
    img.addEventListener('error', () => img.replaceWith(el('span', 'typing-emoji', '🖥️')), { once: true });
    img.src = 'img/games/office/monitor.png';
    $('.typing-monitor').append(img);

    function measure() {
      const elapsed = began === null ? 0 : Math.max(0.001, (performance.now() - began) / 1000);
      const confirmed = composing ? value.length - 1 : value.length;
      const correct = target.filter((ch, i) => i < confirmed && ch === value[i]);
      // 진행 중에는 지금까지 친 글자 기준, 끝나면 문장 전체 기준
      const basis = finished ? target.length : Math.max(1, confirmed);
      return { seconds: Math.floor(elapsed), accuracy: Math.round(correct.length / basis * 100),
        // 1초 미만은 1초로 계산해 비정상적으로 큰 타수가 나오지 않게 함
        speed: elapsed ? Math.round(strokesOf(correct.join('')) * 60 / Math.max(1, elapsed)) : 0 };
    }

    function render() {
      const pending = composing ? value.length - 1 : -1;
      Array.from(passage.children).forEach((span, i) => {
        span.className = i === pending ? 'typing-pending' : i < value.length
          ? (value[i] === target[i] ? 'typing-correct' : 'typing-wrong')
          : i === value.length ? 'typing-current' : '';
      });
      const m = measure();
      stats.textContent = `${m.seconds}초 · ${m.speed}타/분 · 정확도 ${m.accuracy}%`;
    }

    function finish() {
      if (finished || composing) return;
      finished = true;
      clearInterval(interval);
      const m = measure();
      let stars = m.speed >= STAR_RULE.three ? 3 : m.speed >= STAR_RULE.two ? 2 : 1;
      if (m.accuracy < STAR_RULE.accuracyFloor) stars = Math.max(1, stars - 1);
      const extra = el('div', 'typing-summary');
      extra.append(el('strong', 'typing-speed', `${m.speed}타/분`));
      extra.append(el('p', 'typing-detail', SUMMARY_TEXT(m.accuracy, m.seconds, target.length)));
      api.done({ stars, hints: 0, extra });
      // 공통 결과 안내 뒤에 타수·정확도까지 함께 읽습니다.
      api.announce(`${extra.textContent}. 별 ${stars}개. 정보처리실 도장 획득!`);
    }

    function judge() {
      if (finished) return;
      render();
      if (!composing && value.length >= target.length) finish();
    }

    function reset(other) {
      clearInterval(interval);
      clearTimeout(commitTimer);
      if (other) {
        const choices = PASSAGES.map((_, i) => i).filter(i => i !== previous);
        previous = choices[Math.floor(Math.random() * choices.length)];
        target = Array.from(PASSAGES[previous]);
        passage.replaceChildren(...target.map(ch => el('span', '', ch)));
      }
      value = []; began = null; composing = false; finished = false;
      input.value = '';
      render();
      input.focus({ preventScroll: true });
    }

    // 키 이름으로 글자를 추측하지 않습니다. 판정 대상은 input에서 읽은 값뿐입니다.
    input.addEventListener('input', e => {
      if (finished) return;
      value = Array.from(input.value);
      composing = composing || e.isComposing;
      if (began === null) {
        began = performance.now();
        interval = setInterval(render, 250);
      }
      judge();
    });
    input.addEventListener('compositionstart', () => { clearTimeout(commitTimer); composing = true; });
    input.addEventListener('compositionend', () => {
      composing = false;
      // 브라우저마다 마지막 input이 조합 종료 앞/뒤에 오므로 저장한 최신 값을 다음 차례에 판정합니다.
      commitTimer = setTimeout(judge, 0);
    });
    input.addEventListener('keydown', e => {
      if (composing || e.isComposing || e.keyCode === 229 || e.key === 'Unidentified') return;
      if (e.key === 'Enter') { e.preventDefault(); finish(); }
    });
    input.addEventListener('beforeinput', e => {
      if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') e.preventDefault();
      if (!composing && !e.isComposing && ['insertLineBreak', 'insertParagraph'].includes(e.inputType)) {
        e.preventDefault(); finish();
      }
    });
    for (const event of ['paste', 'drop']) input.addEventListener(event, e => e.preventDefault());
    $('.typing-another').addEventListener('click', () => reset(true));
    $('.typing-reset').addEventListener('click', () => reset(false));
    reset(true);
    return () => { finished = true; clearInterval(interval); clearTimeout(commitTimer); };
  }

  window.TOUR_GAMES = window.TOUR_GAMES || {};
  window.TOUR_GAMES.typing = {
    title: '타자 속도 재기', button: '⌨️ 타자 속도 재기', room: '정보처리실', naver: 'Typing', maxStars: 3,
    stamp: '정보처리실 도장 획득!',
    message: '군산여상에서는 모든 학과가 1학년부터 워드프로세서·컴퓨터활용능력·ITQ 같은 사무 자격증을 준비해요.', // ※ 학교 확인
    cta: { href: '../index.html#departments', label: '4개 학과 알아보기 →' },
    passages: PASSAGES,
    start
  };
})();
