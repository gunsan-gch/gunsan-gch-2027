/* 픽셀 학교 투어 — 4층 AI 면접실 「AI 면접 도전」
 * AI 면접관의 질문에 가장 좋은 답을 골라 호감도를 올리는 5문항 게임입니다 (1분 안팎).
 * 질문·답·점수는 아래에서 고칩니다. 결과 화면과 도장은 games.js가 맡습니다.
 */
(() => {
  const IMG = 'img/games/interview/';

  /* ---------- 선생님이 고칠 수 있는 데이터 ---------- */
  // grade: best(가장 좋은 답) · mid(무난한 답) · bad(피해야 할 답). tip은 고른 뒤 보여 주는 한 줄
  // first: true 는 늘 첫 질문, last: true 는 늘 마지막 질문. 나머지에서 무작위로 3개를 뽑아 5문항을 만듭니다.
  const QUESTIONS = [
    { id: 'enter', first: true, text: '면접실 문 앞! 어떻게 들어갈까요?', answers: [
      { grade: 'best', text: '노크하고 밝게 인사한다', tip: '첫인상은 인사에서 시작돼요.' },
      { grade: 'mid', text: '조용히 들어가 바로 앉는다', tip: '인사가 빠지면 아쉬워요.' },
      { grade: 'bad', text: '휴대폰 보면서 들어간다', tip: '휴대폰은 꺼 두는 게 기본!' } ] },
    { id: 'intro', text: '자기소개를 해 주세요.', answers: [
      { grade: 'best', text: '꼼꼼함이 강점입니다. 1년간 학급 총무를 맡았어요.', tip: '강점 + 경험을 함께 말해요.' },
      { grade: 'mid', text: '저는 성실하고 착한 학생입니다.', tip: '근거가 되는 경험이 필요해요.' },
      { grade: 'bad', text: '음… 딱히 소개할 게 없는데요.', tip: '준비한 한 문장이 자신감을 줘요.' } ] },
    { id: 'reason', text: '지원한 이유가 무엇인가요?', answers: [
      { grade: 'best', text: '배우고 싶은 분야라서 미리 알아보고 왔어요.', tip: '관심 + 알아본 노력을 보여 줘요.' },
      { grade: 'mid', text: '집에서 가까워서요.', tip: '솔직하지만 목표도 함께 말해요.' },
      { grade: 'bad', text: '엄마가 가라고 해서요.', tip: '내 생각을 말해야 해요.' } ] },
    { id: 'weakness', text: '본인의 단점은 무엇인가요?', answers: [
      { grade: 'best', text: '덜렁대서 메모하는 습관을 들이고 있어요.', tip: '단점 + 고치는 노력을 말해요.' },
      { grade: 'mid', text: '단점은 딱히 없습니다.', tip: '단점이 없다는 답은 믿기 어려워요.' },
      { grade: 'bad', text: '아침에 못 일어나서 지각을 자주 해요.', tip: '고치려는 노력을 꼭 덧붙여요.' } ] },
    { id: 'conflict', text: '친구와 의견이 다를 때는 어떻게 하나요?', answers: [
      { grade: 'best', text: '끝까지 듣고 서로 좋은 점을 합쳐요.', tip: '경청과 조율이 핵심이에요.' },
      { grade: 'mid', text: '그냥 제가 참아요.', tip: '참기보다 대화로 풀어요.' },
      { grade: 'bad', text: '제 말이 맞을 때까지 설득해요.', tip: '협업은 이기는 게 아니에요.' } ] },
    { id: 'future', text: '10년 뒤 어떤 모습일까요?', answers: [
      { grade: 'best', text: '자격증을 따고 현장에서 인정받는 실무자요.', tip: '구체적인 목표가 좋아요.' },
      { grade: 'mid', text: '잘 모르겠지만 열심히 살고 있을 거예요.', tip: '작은 목표라도 정해 말해요.' },
      { grade: 'bad', text: '로또에 당첨돼서 놀고 있을 거예요.', tip: '유머도 좋지만 계획이 먼저!' } ] },
    { id: 'effort', text: '최근에 열심히 해 본 일은?', answers: [
      { grade: 'best', text: '자격증 시험을 위해 매일 30분씩 연습했어요.', tip: '숫자가 들어가면 믿음이 가요.' },
      { grade: 'mid', text: '게임 레벨을 열심히 올렸어요.', tip: '배운 점을 연결하면 좋아요.' },
      { grade: 'bad', text: '기억이 안 나요.', tip: '작은 경험도 좋은 답이 돼요.' } ] },
    { id: 'last', last: true, text: '마지막으로 하고 싶은 말은?', answers: [
      { grade: 'best', text: '뽑아 주시면 끝까지 책임지고 배우겠습니다.', tip: '마지막은 의지로 마무리!' },
      { grade: 'mid', text: '없습니다.', tip: '마지막 기회를 놓치지 마세요.' },
      { grade: 'bad', text: '언제 끝나요? 배고파요.', tip: '끝까지 집중하는 모습이 중요해요.' } ] }
  ];
  // 면접관 로봇의 한마디 (질문 순서대로 돌아가며 나옴)
  const LINES = {
    best: ['오, 메모했습니다 📝', '합격 회로가 반응합니다 ✨', '인상적이군요!'],
    mid: ['음… 무난하군요.', '조금 더 듣고 싶네요.'],
    bad: ['삐빅— 당황했습니다 💦', '회로가 꼬였습니다 🌀'],
    timeout: '침묵… 시간 초과입니다 ⏰'
  };
  // 호감도(0~100): 시작 점수와 답에 따른 변화. combo는 좋은 답을 2번 이상 이어 갈 때 더하는 점수
  const SCORE = { start: 40, best: 14, mid: 5, bad: -8, timeout: -10, combo: 3 };
  const SECONDS = 10;                             // 질문마다 제한 시간
  const RUSH = { chance: 0.2, seconds: 6 };       // 히든 이벤트 '돌발 질문': 확률·제한 시간 (호감도 변화 2배, 게임당 한 번)
  const STAR_RULE = { three: 90, two: 65 };       // 호감도 90 이상 3★, 65 이상 2★, 그 외 1★
  const GRADE_TEXT = { 3: '최종 합격 🎉', 2: '예비 합격 🙂', 1: '다시 도전 💪' };
  const STAMP_TEXT = 'AI 면접실 도장 획득!';
  const RESULT_TEXT = '면접지도실과 AI 면접실에서 면접을 미리 연습해요.';   // ※ 학교 확인
  const LINK = { href: '../index.html#careers', label: '취업 현황 보기 →' };

  /* ---------- 도우미 ---------- */
  const el = (tag, className, text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };

  function shuffled(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // 첫 질문 + 무작위 3개 + 마지막 질문 (pickOrder를 정하면 그 순서대로)
  function pickQuestions(game) {
    if (game.pickOrder) return game.pickOrder.map(id => game.questions.find(q => q.id === id)).filter(Boolean);
    const middle = shuffled(game.questions.filter(q => !q.first && !q.last)).slice(0, 3);
    return [...game.questions.filter(q => q.first).slice(0, 1), ...middle, ...game.questions.filter(q => q.last).slice(0, 1)];
  }

  // 로봇 그림 (못 불러오면 이모지)
  function robot(mood, size) {
    const img = document.createElement('img');
    img.className = 'interview-robot';
    img.alt = '';
    img.width = size; img.height = size;
    img.addEventListener('error', () => img.replaceWith(el('span', 'interview-robot', '🤖')), { once: true });
    img.src = `${IMG}robot-${mood}.png`;
    return img;
  }

  /* ---------- 게임 ---------- */
  function start(container, api) {
    const game = window.TOUR_GAMES.interview;
    const questions = pickQuestions(game);
    const state = { phase: 'intro', index: 0, score: SCORE.start, combo: 0, best: 0,
      rush: false, rushed: false, deadline: 0, seconds: SECONDS, shown: [] };
    let frame = 0, timer = 0;
    container.innerHTML = `
      <div class="interview-intro">
        <div class="interview-face"></div>
        <h3>AI 면접관을 사로잡아라!</h3>
        <ul><li>질문마다 ${SECONDS}초, 가장 좋은 답 고르기</li><li>호감도 ${STAR_RULE.three} 이상이면 최종 합격</li></ul>
        <button type="button" class="btn btn-primary interview-start">면접 시작</button>
      </div>
      <div class="interview-game" hidden>
        <div class="interview-stats">
          <span class="interview-progress"></span>
          <div class="interview-gauge" role="img"><div class="interview-gauge-fill"></div></div>
          <strong class="interview-score" aria-hidden="true"></strong>
        </div>
        <div class="interview-stage">
          <div class="interview-face"></div>
          <div class="interview-bubble" role="status" aria-live="polite" aria-atomic="true">
            <p class="interview-question"></p>
            <p class="interview-reaction"></p>
          </div>
        </div>
        <p class="interview-event" role="status"></p>
        <div class="interview-timer" aria-hidden="true"><div></div></div>
        <div class="interview-answers" role="group" aria-label="답변 고르기"></div>
        <div class="interview-feedback" role="status" aria-live="polite" aria-atomic="true"></div>
        <button type="button" class="btn btn-primary interview-next" hidden></button>
      </div>`;
    const $ = selector => container.querySelector(selector);
    const root = $('.interview-game');
    const face = root.querySelector('.interview-face');
    const answersBox = $('.interview-answers');
    const bar = $('.interview-timer div');
    const next = $('.interview-next');
    $('.interview-intro .interview-face').append(robot('happy', 96));
    ['neutral', 'happy', 'love', 'error'].forEach(mood => { new Image().src = `${IMG}robot-${mood}.png`; });   // 표정 미리 받아 두기

    function clearClock() {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    }

    function setMood(mood) {
      face.replaceChildren(robot(mood, 96));
      if (api.reducedMotion) return;
      face.classList.remove('interview-pop', 'interview-shake');
      void face.offsetWidth;   // 같은 움직임을 다시 시작하기 위해
      if (mood === 'error') face.classList.add('interview-shake');
      else if (mood !== 'neutral') face.classList.add('interview-pop');
    }

    function paintScore() {
      $('.interview-gauge-fill').style.width = state.score + '%';
      $('.interview-gauge').setAttribute('aria-label', `호감도 ${state.score}`);
      $('.interview-score').textContent = `💗 ${state.score}${state.combo >= 2 ? ` · 🔥 ${state.combo}콤보` : ''}`;
    }

    function finish() {
      state.phase = 'done';
      clearClock();
      const stars = state.score >= STAR_RULE.three ? 3 : state.score >= STAR_RULE.two ? 2 : 1;
      const extra = el('div', 'interview-summary');
      extra.append(robot(stars === 3 ? 'love' : stars === 2 ? 'happy' : 'error', 80),
        el('strong', 'interview-grade', GRADE_TEXT[stars]),
        el('p', 'interview-detail', `호감도 ${state.score} · 최고 ${state.best}콤보`));
      api.done({ stars, hints: 0, extra });
    }

    // answer가 null이면 시간 초과
    function judge(answer, button = null) {
      if (state.phase !== 'asking') return;
      state.phase = 'judged';
      clearClock();
      const grade = answer ? answer.grade : 'timeout';
      state.combo = grade === 'best' ? state.combo + 1 : 0;
      state.best = Math.max(state.best, state.combo);
      const delta = (SCORE[grade] + (grade === 'best' && state.combo >= 2 ? SCORE.combo : 0)) * (state.rush ? 2 : 1);
      state.score = Math.max(0, Math.min(100, state.score + delta));
      paintScore();
      setMood(grade === 'best' ? (state.combo >= 2 ? 'love' : 'happy') : grade === 'mid' ? 'neutral' : 'error');
      $('.interview-reaction').textContent = grade === 'timeout' ? LINES.timeout : LINES[grade][state.index % LINES[grade].length];
      [...answersBox.children].forEach((node, i) => {
        node.disabled = true;
        if (state.shown[i].grade === 'best') node.classList.add('is-best');   // 가장 좋은 답은 늘 표시
      });
      if (button) button.classList.add('is-picked', `is-${grade}`);
      const points = el('strong', delta > 0 ? 'is-plus' : 'is-minus', `호감도 ${delta > 0 ? '+' : ''}${delta}`);
      $('.interview-feedback').replaceChildren(points, el('p', '', answer ? answer.tip : '시간 안에 하나는 골라 봐요.'));
      next.hidden = false;
      next.focus({ preventScroll: true });
    }

    function tick(now) {
      if (state.phase !== 'asking') return;
      const left = Math.max(0, state.deadline - now);
      bar.style.width = `${left / (state.seconds * 1000) * 100}%`;
      bar.classList.toggle('interview-urgent', left <= 3000);
      if (left <= 0) return judge(null);
      frame = requestAnimationFrame(tick);
    }

    function ask() {
      clearClock();
      if (state.index >= questions.length) return finish();
      const question = questions[state.index];
      state.phase = 'asking';
      // 히든 이벤트: 첫 질문이 아닐 때, 게임당 한 번
      state.rush = state.index > 0 && !state.rushed && Math.random() < game.rushChance;
      state.rushed = state.rushed || state.rush;
      state.seconds = state.rush ? RUSH.seconds : SECONDS;
      root.classList.toggle('interview-rush', state.rush);
      $('.interview-progress').textContent = `${state.index + 1} / ${questions.length}`;
      $('.interview-event').textContent = state.rush ? `⚡ 돌발 질문! ${RUSH.seconds}초 · 호감도 2배` : '';
      setMood('neutral');
      $('.interview-question').textContent = question.text;
      $('.interview-reaction').textContent = '';
      state.shown = game.shuffle ? shuffled(question.answers) : [...question.answers];
      answersBox.replaceChildren(...state.shown.map((answer, i) => {
        const button = el('button', 'interview-answer', `${i + 1}. ${answer.text}`);
        button.type = 'button';
        button.addEventListener('click', () => judge(answer, button));
        return button;
      }));
      $('.interview-feedback').replaceChildren();
      next.hidden = true;
      next.textContent = state.index === questions.length - 1 ? '결과 보기' : '다음 질문 →';
      bar.style.width = '100%';
      bar.classList.remove('interview-urgent');
      container.scrollTop = 0;
      paintScore();
      state.deadline = performance.now() + state.seconds * 1000;
      answersBox.firstElementChild.focus({ preventScroll: true });
      frame = requestAnimationFrame(tick);
      timer = setTimeout(() => judge(null), state.seconds * 1000);   // 배경 탭에서 rAF가 멈춰도 시간 초과 처리
    }

    // 숫자 키 1·2·3으로도 답을 고를 수 있음
    function onKey(e) {
      if (state.phase !== 'asking' || e.repeat || e.isComposing || e.ctrlKey || e.altKey || e.metaKey) return;
      if (!root.contains(document.activeElement) || !['1', '2', '3'].includes(e.key)) return;
      e.preventDefault();
      answersBox.children[Number(e.key) - 1]?.click();
    }

    $('.interview-start').addEventListener('click', () => {
      $('.interview-intro').hidden = true;
      root.hidden = false;
      ask();
    });
    next.addEventListener('click', () => {
      if (state.phase !== 'judged') return;
      state.index++;
      ask();
    });
    document.addEventListener('keydown', onKey);
    $('.interview-start').focus({ preventScroll: true });
    return () => {
      state.phase = 'done';
      clearClock();
      document.removeEventListener('keydown', onKey);
    };
  }

  window.TOUR_GAMES = window.TOUR_GAMES || {};
  window.TOUR_GAMES.interview = {
    title: 'AI 면접 도전', button: '🤖 AI 면접 도전', room: 'AI 면접실', naver: 'Interview', maxStars: 3,
    stamp: STAMP_TEXT,
    message: RESULT_TEXT,
    cta: LINK,
    // 수업·확인용: 질문 목록, 순서 고정(pickOrder), 보기 섞기(shuffle), 돌발 질문 확률(rushChance)
    questions: QUESTIONS, pickOrder: null, shuffle: true, rushChance: RUSH.chance,
    start
  };
})();
