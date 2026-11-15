/* 픽셀 학교 투어 — 4층 커리어존 「내 취향 찾기」
 * 7문항을 고르면 어울리는 학과를 추천하고, 고른 보기는 이름 없이 횟수만 분석 이벤트로 보냅니다.
 * 문항·답변·학과 활동 문구는 아래에서 고칩니다. 결과 화면과 도장은 games.js가 맡습니다.
 */
(() => {
  /* ---------- 선생님이 고칠 수 있는 데이터 (문항·답변·학과 활동) ---------- */
  // dept: erp·marketing·fintech·cafe = 우리 학교 학과 / null = 우리 학교에 없는 분야(집계용)
  // guide: 없는 분야지만 이 학과로 안내 — 답 카드 링크와 추천 점수에 반영 (집계의 dept는 none 그대로)
  // reply: 고르면 바로 보여 주는 한 줄. 우리 학교에 없는 분야는 "없다"고 잘라 말하지 않고,
  //        "하교 후 시간이 넉넉해 좋아하는 분야를 따로 배울 여유가 있다"는 식으로 돌려 말하며 가까운 학과를 안내
  const DEPT_NAMES = { erp: 'ERP비즈니스과', marketing: 'AI마케팅과', fintech: 'AI핀테크과', cafe: '카페비즈과' };
  const QUESTIONS = [
    { id: 'q1', text: '쉬는 날 뭐 할 때 제일 신나요?', choices: [
      { id: 'video', emoji: '🎬', text: '영상 찍고 편집하기', dept: 'marketing', reply: 'AI마케팅과에서 영상·숏폼 콘텐츠 만들기를 배워요!' },
      { id: 'dessert', emoji: '🧁', text: '빵·디저트 만들기', dept: 'cafe', reply: '카페비즈과에서 제과제빵을 직접 실습해요!' },
      { id: 'beauty', emoji: '💅', text: '네일·메이크업', dept: null, guide: 'marketing', reply: '네일·메이크업은 동아리와 방과후 수업에서! 뷰티 콘텐츠·SNS 홍보는 AI마케팅과에서 배워요.' },
      { id: 'money', emoji: '💰', text: '용돈 불리기(저축·투자)', dept: 'fintech', reply: 'AI핀테크과에서 금융과 투자를 데이터로 배워요!' } ] },
    { id: 'q2', text: '친구들이 나한테 자주 부탁하는 건?', choices: [
      { id: 'slides', emoji: '🖥️', text: '발표 자료 예쁘게 만들기', dept: 'erp', reply: 'ERP비즈니스과에서 문서·보고서 작성을 익혀요!' },
      { id: 'treasurer', emoji: '🧾', text: '돈 계산·모임 총무', dept: 'erp', reply: 'ERP비즈니스과에서 회계와 자료 정리를 배워요!' },
      { id: 'hair', emoji: '💇', text: '머리 손질·화장 해 주기', dept: null, guide: 'marketing', reply: '메이크업·네일은 동아리와 방과후 수업에서! 꾸미는 감각은 AI마케팅과에서 살려요.' },
      { id: 'snack', emoji: '🍪', text: '맛있는 간식 만들어 주기', dept: 'cafe', reply: '카페비즈과에서 음료와 디저트 만들기를 배워요!' } ] },
    { id: 'q3', text: '꿈의 직업과 가장 가까운 건?', choices: [
      { id: 'cafe_owner', emoji: '☕', text: '카페·베이커리 사장', dept: 'cafe', reply: '카페비즈과에서 메뉴 개발부터 매장 운영까지 실습해요!' },
      { id: 'creator', emoji: '📱', text: 'SNS 마케터·크리에이터', dept: 'marketing', reply: 'AI마케팅과에서 SNS 마케팅과 콘텐츠 제작을 배워요!' },
      { id: 'bank', emoji: '🏦', text: '은행·핀테크 회사', dept: 'fintech', reply: 'AI핀테크과에서 금융 데이터와 AI를 배워요!' },
      { id: 'office', emoji: '🏢', text: '회사 사무·경영 지원', dept: 'erp', reply: 'ERP비즈니스과에서 인사·총무·회계 업무를 배워요!' },
      { id: 'beauty_designer', emoji: '✂️', text: '헤어·뷰티 디자이너', dept: null, guide: 'marketing', reply: '뷰티 감각은 동아리와 방과후 수업에서, 뷰티 브랜드 마케팅은 AI마케팅과에서 배워요!' },
      { id: 'nurse', emoji: '🩺', text: '간호·보건', dept: null, reply: '하교 후 시간에 이어 갈 수 있어요. 병원 행정은 ERP비즈니스과와 가까워요.' } ] },
    { id: 'q4', text: '배워 보고 싶은 자격증은?', choices: [
      { id: 'barista', emoji: '🥐', text: '바리스타·제과제빵', dept: 'cafe', reply: '카페비즈과에서 바리스타·제과제빵 자격증을 준비해요!' },
      { id: 'gtq', emoji: '🎨', text: 'GTQ·영상 편집', dept: 'marketing', reply: 'AI마케팅과에서 GTQ·GTQ-AI를 준비해요!' },
      { id: 'erp_cert', emoji: '📊', text: '전산회계·ERP', dept: 'erp', reply: 'ERP비즈니스과에서 전산회계운용사·ERP정보관리사를 준비해요!' },
      { id: 'finance_cert', emoji: '📈', text: '금융·투자 자격증', dept: 'fintech', reply: 'AI핀테크과에서 금융 자격증을 준비해요!' },
      { id: 'hairdresser', emoji: '💈', text: '미용사', dept: null, guide: 'marketing', reply: '네일·메이크업은 동아리와 방과후 수업에서! 뷰티 숍 SNS 마케팅은 AI마케팅과에서 배워요.' },
      { id: 'cook', emoji: '🍳', text: '조리사(한식·양식)', dept: null, reply: '카페비즈과의 제과제빵·음료 실습과 가까워요!' } ] },
    { id: 'q5', text: '수업 시간에 제일 재밌을 것 같은 건?', choices: [
      { id: 'company', emoji: '🏭', text: '가상 회사 운영해 보기', dept: 'erp', reply: 'ERP비즈니스과에서 가상 회사의 매출·재고를 정리해 봐요!' },
      { id: 'ad', emoji: '📣', text: '상품 광고 만들기', dept: 'marketing', reply: 'AI마케팅과에서 군산의 상품을 알리는 카드뉴스를 만들어요!' },
      { id: 'drink', emoji: '🧋', text: '커피·음료 만들기', dept: 'cafe', reply: '카페비즈과에서 음료 만들기와 카페 운영을 실습해요!' },
      { id: 'ai_report', emoji: '🤖', text: 'AI로 보고서 만들기', dept: 'fintech', reply: 'AI핀테크과에서 AI로 금융·회계 보고서를 만들어요!' } ] },
    { id: 'q6', text: '고등학교를 고를 때 나는…', kind: 'commute', choices: [
      { id: 'near', emoji: '🏠', text: '집 근처에서 편하게 다니고 싶어요', dept: null, reply: '군산여상은 기숙사·통학버스 없이 집 근처에서 편하게 다닐 수 있어요!' },
      { id: 'far_ok', emoji: '🚌', text: '배우고 싶은 과가 있으면 멀어도(기숙사·통학버스) 갈래요', dept: null, reply: '멀리 가기 전에, 비슷한 걸 집 근처 군산여상에서 배울 수 있는지 꼭 확인해 보세요.' },
      { id: 'unsure', emoji: '🤔', text: '아직 모르겠어요', dept: null, reply: '괜찮아요. 투어를 돌며 천천히 찾아봐요.' } ] },
    { id: 'q7', text: '다른 학교에 가야만 배울 수 있는 분야 중 끌리는 게 있다면?', kind: 'elsewhere', choices: [
      { id: 'beauty', emoji: '💄', text: '뷰티(헤어·메이크업·네일)', dept: null, guide: 'marketing', reply: '네일·메이크업은 동아리와 방과후 수업에 있어요! 뷰티 마케팅은 AI마케팅과에서 배워요.' },
      { id: 'cooking', emoji: '🍜', text: '조리(한식·양식·중식)', dept: null, reply: '카페비즈과에 제과제빵·음료 실습이 있어요!' },
      { id: 'nursing', emoji: '🏥', text: '간호·보건', dept: null, reply: '하교 후 시간에 이어 갈 수 있어요. 병원 행정은 ERP비즈니스과와 가까워요.' },
      { id: 'game_it', emoji: '🎮', text: '게임·IT 개발', dept: null, reply: 'AI핀테크과·AI마케팅과에서 AI 도구를 많이 써요!' },
      { id: 'none', emoji: '👍', text: '없어요, 상업·경영 쪽이 좋아요', dept: null, reply: '그렇다면 군산여상 4개 학과를 바로 비교해 보세요!' } ] }
  ];
  const DEPT_ACTIVITY = { erp: '가상 회사의 매출·재고를 정리하고 ERP와 엑셀로 보고서 만들기', marketing: '군산의 상품을 알리는 카드뉴스·숏폼을 만들고 홍보 결과 분석하기', fintech: 'AI로 금융·회계 보고서 초안을 만들고 수치가 맞는지 확인하기', cafe: '디저트·음료 메뉴와 원가표를 만들고 SNS 홍보물로 모의 매장 운영하기' };

  const DEPT_EMOJI = { erp: '📊', marketing: '📣', fintech: '📈', cafe: '☕' };
  const DONE_KEY = 'gch-tour-career-done';
  const DEFAULT_CTA = { href: '../index.html#departments', label: '4개 학과 알아보기 →' };

  /* ---------- 도우미 ---------- */
  const el = (tag, className, text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };

  function readRepeat() {
    try { return localStorage.getItem(DONE_KEY) === '1' ? 'yes' : 'no'; }
    catch (e) { return 'no'; }
  }

  function picture(dept) {
    const img = el('img', 'career-picture');
    img.alt = '';
    img.width = 96;
    img.height = 96;
    img.addEventListener('error', () => {
      const fallback = el('span', 'career-picture career-emoji', DEPT_EMOJI[dept]);
      fallback.setAttribute('aria-hidden', 'true');
      img.replaceWith(fallback);
    }, { once: true });
    img.src = 'img/games/departments/' + dept + '.png';
    return img;
  }

  function deptLink(dept) {
    const link = el('a', 'career-link', DEPT_NAMES[dept] + ' 알아보기 ↗');
    link.href = '../index.html#' + dept;
    link.target = '_blank';
    link.rel = 'noopener';
    const track = e => {
      if (e.type === 'auxclick' && e.button !== 1) return;
      tourTrack('tour_game_cta', { game_id: 'career', cta: 'dept_' + dept }, ['TourGame', 'CareerDept']);
    };
    link.addEventListener('click', track);
    link.addEventListener('auxclick', track);
    return link;
  }

  function summary(dept, counts) {
    const box = el('section', 'career-summary');
    if (dept) box.append(picture(dept));
    box.append(el('h3', 'career-title', dept ? '관심사와 연결되는 학과: ' + DEPT_NAMES[dept] : '군산여상 4개 학과를 둘러보세요'));
    if (dept) box.append(el('p', 'career-activity', DEPT_ACTIVITY[dept]));
    box.append(el('p', 'career-count-help', '연결 문항 수 · 선택한 관심사를 학과 활동과 연결했어요.'));
    const bars = el('div', 'career-bars');
    // 막대는 학과(안내 학과 포함)로 이어지는 문항 수를 기준으로 표시합니다 (통학 문항 제외).
    const total = Math.max(1, QUESTIONS.filter(q => q.choices.some(c => c.dept || c.guide)).length);
    Object.keys(DEPT_NAMES).forEach(id => {
      const row = el('div', 'career-bar-row');
      row.setAttribute('role', 'img');
      row.setAttribute('aria-label', DEPT_NAMES[id] + ': 연결 문항 ' + counts[id] + '개');
      const track = el('div', 'career-bar-track');
      const fill = el('div', 'career-bar-fill');
      fill.style.width = (counts[id] / total * 100) + '%';
      track.append(fill);
      row.append(el('span', 'career-bar-label', DEPT_NAMES[id]), track, el('span', 'career-count', counts[id] + '개'));
      bars.append(row);
    });
    box.append(bars);
    return box;
  }

  /* ---------- 게임 ---------- */
  function start(container, api) {
    const repeat = readRepeat();   // 재플레이도 모두 집계하며, 이번 플레이 동안 같은 표시를 씁니다.
    const answers = [];
    let round = 0;
    let locked = false;
    let finished = false;
    window.TOUR_GAMES.career.cta = { ...DEFAULT_CTA };
    container.innerHTML = `
      <div class="career-game">
        <section class="career-intro">
          <h3 class="career-title">내 취향 찾기</h3>
          <p>7문항, 1분이면 끝나요.<br>마음이 끌리는 보기를 골라 보세요.</p>
          <button type="button" class="btn btn-primary career-start">시작</button>
        </section>
        <section class="career-question" aria-live="polite" aria-atomic="true"></section>
        <div class="career-choices" role="group" aria-labelledby="career-question-title" hidden></div>
        <section class="career-reply" role="status" aria-live="polite" aria-atomic="true" hidden></section>
        <button type="button" class="btn btn-primary career-next" hidden>다음 →</button>
      </div>`;
    const $ = selector => container.querySelector(selector);
    const choices = $('.career-choices');
    const reply = $('.career-reply');
    const next = $('.career-next');

    function showQuestion() {
      locked = false;
      const question = QUESTIONS[round];
      const title = el('h3', 'career-title', question.text);
      title.id = 'career-question-title';
      $('.career-question').replaceChildren(el('p', 'career-progress', `${round + 1} / ${QUESTIONS.length}`), title);
      choices.hidden = false;
      choices.replaceChildren();
      question.choices.forEach(choice => {
        const button = el('button', 'career-choice');
        button.type = 'button';
        button.setAttribute('aria-pressed', 'false');
        const emoji = el('span', 'career-choice-emoji', choice.emoji);
        emoji.setAttribute('aria-hidden', 'true');
        button.append(emoji, el('span', 'career-choice-text', choice.text));
        button.addEventListener('click', () => pick(question, choice, button));
        choices.append(button);
      });
      reply.hidden = true;
      reply.replaceChildren();
      next.hidden = true;
      container.scrollTop = 0;
      choices.firstElementChild.focus({ preventScroll: true });
    }

    function pick(question, choice, button) {
      if (locked || finished) return;
      locked = true;
      tourTrack('tour_career_pick', {
        question_id: question.id, choice_id: choice.id, dept: choice.dept || 'none', repeat
      }, ['TourCareer', question.id + '_' + choice.id]);
      answers.push({ question, choice });
      for (const item of choices.children) item.disabled = true;
      button.setAttribute('aria-pressed', 'true');
      const lead = choice.dept || choice.guide;   // 답 카드에서 안내할 학과
      reply.classList.toggle('career-reply-other', !lead && question.kind !== 'commute' && choice.id !== 'none');
      reply.classList.toggle('career-reply-animate', !api.reducedMotion);
      reply.append(el('p', 'career-reply-text', choice.emoji + ' ' + choice.reply));
      if (lead) reply.append(deptLink(lead));
      reply.hidden = false;
      next.hidden = false;
      next.focus();
    }

    function finish() {
      finished = true;
      const counts = Object.fromEntries(Object.keys(DEPT_NAMES).map(id => [id, 0]));
      const leadOf = choice => choice.dept || choice.guide;
      answers.forEach(({ choice }) => { if (leadOf(choice)) counts[leadOf(choice)]++; });
      const highest = Math.max(...Object.values(counts));
      // 동률이면 문항 순서상 먼저 고른 학과. 학과 선택이 없으면 전체 학과를 안내합니다.
      const first = answers.find(({ choice }) => leadOf(choice) && counts[leadOf(choice)] === highest);
      const dept = first ? leadOf(first.choice) : undefined;
      const selected = kind => answers.find(answer => answer.question.kind === kind)?.choice.id || 'none';
      window.TOUR_GAMES.career.cta = dept
        ? { href: '../index.html#' + dept, label: DEPT_NAMES[dept] + ' 알아보기 →' }
        : { ...DEFAULT_CTA };
      tourTrack('tour_career_result', {
        dept: dept || 'none', commute: selected('commute'), elsewhere: selected('elsewhere'), repeat
      }, ['TourCareer', 'Result_' + (dept || 'none')]);
      try { localStorage.setItem(DONE_KEY, '1'); } catch (e) { /* 저장이 막혀도 완료와 재플레이는 그대로 */ }
      api.done({ stars: 3, hints: 0, extra: summary(dept, counts) });
      container.scrollTop = 0;
    }

    $('.career-start').addEventListener('click', () => {
      $('.career-intro').remove();
      showQuestion();
    }, { once: true });
    next.addEventListener('click', () => {
      if (!locked || finished) return;
      if (++round < QUESTIONS.length) showQuestion();
      else finish();
    });
    $('.career-start').focus({ preventScroll: true });
    return () => { finished = true; };
  }

  window.TOUR_GAMES = window.TOUR_GAMES || {};
  window.TOUR_GAMES.career = {
    title: '내 취향 찾기', button: '🧭 내 취향 찾기', room: '커리어존', naver: 'Career', maxStars: 3,
    stamp: '커리어존 도장 획득!',
    message: '기숙사·통학버스 없이 집 근처에서 편하게 다녀요.', // ※ 학교 확인
    cta: { ...DEFAULT_CTA },
    start
  };
})();
