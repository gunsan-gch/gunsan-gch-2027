/* 픽셀 학교 투어 — 4층 AI 면접실 「AI 면접 도전」
 * AI 면접관의 질문에 가장 좋은 답을 골라 호감도를 올리는 5문항 게임입니다 (1분 안팎).
 * 질문·답·점수는 아래에서 고칩니다. 결과 화면과 도장은 games.js가 맡습니다.
 */
(() => {
  const IMG = 'img/games/interview/';

  /* ---------- 선생님이 고칠 수 있는 데이터 ---------- */
  // grade: best(가장 좋은 답) · mid(무난한 답) · bad(피해야 할 답). tip은 고른 뒤 보여 주는 한 줄
  // first: true 는 늘 첫 질문, last: true 는 늘 마지막 질문. 나머지에서 무작위로 3개를 뽑아 5문항을 만듭니다.
  // 2026-11-26: 세 답이 모두 그럴듯하게 들리도록 고침. 차이는 '구체적인가·질문에 맞는가·남 탓/과장이 없는가'.
  const QUESTIONS = [
    { id: 'enter', first: true, text: '면접실 문 앞! 어떻게 들어갈까요?', answers: [
      { grade: 'best', text: '노크 후 대답을 듣고 들어가 의자 옆에서 인사한다', tip: '대답을 기다리고, 서서 인사한 뒤 앉아요.' },
      { grade: 'mid', text: '노크하고 바로 들어가 앉으면서 인사한다', tip: '앉으면서 하는 인사는 급해 보여요.' },
      { grade: 'bad', text: '긴장을 풀려고 문 앞에서 이어폰으로 노래를 듣다 들어간다', tip: '면접 직전엔 이어폰을 빼고 차례를 기다려요.' } ] },
    { id: 'intro', text: '자기소개를 해 주세요.', answers: [
      { grade: 'best', text: '꼼꼼함이 강점입니다. 1년간 학급 총무로 회비 장부를 맞췄어요.', tip: '강점 + 그걸 보여 주는 경험 하나.' },
      { grade: 'mid', text: '성실하고 책임감 있는 사람입니다. 맡은 일은 끝까지 해요.', tip: '좋은 말이지만 근거 경험이 빠졌어요.' },
      { grade: 'bad', text: '저는 리더십, 성실함, 창의력, 친화력을 모두 갖췄습니다.', tip: '많이 늘어놓으면 하나도 기억에 안 남아요.' } ] },
    { id: 'reason', text: '지원한 이유가 무엇인가요?', answers: [
      { grade: 'best', text: '회계 자격증을 따고 싶어서 실습실과 동아리를 미리 알아봤어요.', tip: '하고 싶은 것 + 알아본 노력.' },
      { grade: 'mid', text: '취업이 잘된다고 들어서 지원했습니다.', tip: '솔직하지만 내가 하고 싶은 게 안 보여요.' },
      { grade: 'bad', text: '다른 학교는 별로라서 여기가 제일 나아 보였어요.', tip: '다른 곳을 깎아내리면 인상이 나빠져요.' } ] },
    { id: 'weakness', text: '본인의 단점은 무엇인가요?', answers: [
      { grade: 'best', text: '덜렁대는 편이라 할 일을 메모장에 적고 하나씩 지워요.', tip: '단점 + 지금 고치는 방법.' },
      { grade: 'mid', text: '너무 완벽하게 하려다 보니 시간이 오래 걸려요.', tip: '단점인 척하는 장점은 면접관이 많이 들어 봤어요.' },
      { grade: 'bad', text: '딱히 큰 단점은 없는 것 같아요. 주변에서도 그렇대요.', tip: '단점이 없다는 답은 믿기 어려워요.' } ] },
    { id: 'conflict', text: '친구와 의견이 다를 때는 어떻게 하나요?', answers: [
      { grade: 'best', text: '각자 이유를 끝까지 듣고, 둘 다 살릴 방법을 같이 찾아요.', tip: '경청 + 함께 정하기가 핵심.' },
      { grade: 'mid', text: '분위기가 나빠지지 않게 보통 제가 양보하는 편이에요.', tip: '배려는 좋지만 내 생각도 말해야 해요.' },
      { grade: 'bad', text: '근거 자료를 보여 주면서 제 의견이 맞다는 걸 설득해요.', tip: '협업은 이기는 게 아니라 맞춰 가는 거예요.' } ] },
    { id: 'future', text: '10년 뒤 어떤 모습일까요?', answers: [
      { grade: 'best', text: '회계 자격증을 차근차근 따서 팀에서 믿고 맡기는 실무자요.', tip: '구체적인 목표와 단계가 좋아요.' },
      { grade: 'mid', text: '어떤 일을 하든 즐겁게 일하는 사람이 되어 있을 거예요.', tip: '좋은 마음이지만 목표가 흐릿해요.' },
      { grade: 'bad', text: '10년 안에 제 회사를 차려서 사장이 되어 있을 거예요.', tip: '큰 꿈도 좋지만 지원한 일과 이어져야 해요.' } ] },
    { id: 'effort', text: '최근에 열심히 해 본 일은?', answers: [
      { grade: 'best', text: '타자 연습을 매일 15분씩 해서 한 달 만에 200타를 넘겼어요.', tip: '숫자가 들어가면 믿음이 가요.' },
      { grade: 'mid', text: '시험 기간에 정말 열심히 공부했어요.', tip: '무엇을 어떻게 했는지가 빠졌어요.' },
      { grade: 'bad', text: '요즘은 쉬고 있지만, 마음먹으면 누구보다 열심히 해요.', tip: '앞으로가 아니라 해 본 일을 물었어요.' } ] },
    { id: 'last', last: true, text: '마지막으로 하고 싶은 말은?', answers: [
      { grade: 'best', text: '오늘 말씀드린 메모 습관처럼, 배운 건 끝까지 챙기겠습니다.', tip: '앞에서 한 이야기로 마무리하면 기억에 남아요.' },
      { grade: 'mid', text: '열심히 하겠습니다. 감사합니다.', tip: '예의 바르지만 기억에 남을 한 마디가 아쉬워요.' },
      { grade: 'bad', text: '혹시 합격하면 언제쯤 연락이 오나요?', tip: '궁금해도 마지막 말은 각오로 채워요.' } ] }
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
    node.className = tag === 'button' ? 'btn ' + className : className;
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
      // 점수: 최종 호감도 × 10 + 최고 콤보 × 50
      api.done({ stars, hints: 0, extra, points: Math.max(0, Math.round(state.score * 10 + state.best * 50)) });
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
    title: 'AI 면접 도전', button: '🤖 AI 면접 도전', room: 'AI 면접실', naver: 'Interview', maxStars: 3, maxPoints: 1250,
    stamp: STAMP_TEXT,
    message: RESULT_TEXT,
    cta: LINK,
    // 수업·확인용: 질문 목록, 순서 고정(pickOrder), 보기 섞기(shuffle), 돌발 질문 확률(rushChance)
    questions: QUESTIONS, pickOrder: null, shuffle: true, rushChance: RUSH.chance,
    start
  };
})();
