/* =========================================================================
   픽셀 학교 투어 — AI비즈니스실 「AI 광고 문구 고르기」
   상품에 어울리는 문구를 고르고 SNS 반응을 보는 3라운드 게임입니다 (1분 안팎).
   상품·문구·좋아요·피드백은 맨 위 목록에서 고칩니다. 결과 화면·도장은 games.js가 맡습니다.
   AI 추천은 미리 정한 힌트이며, 서버 전송 없이 이 브라우저 안에서만 동작합니다.
   ========================================================================= */

(() => {
  const IMG = 'img/games/ai/';

  /* ---------- 선생님이 고칠 수 있는 데이터 ---------- */

  // 후보는 적힌 순서대로 표시. best 3별 · mid 2별 · weak 1별, 힌트는 1별 감점 (최소 1별)
  const PRODUCTS = [
    { name: '흰찰쌀보리 쿠키', desc: '군산 흰찰쌀보리로 구운 담백한 쿠키', emoji: '🍪',
      target: '간식 찾는 10대', channel: '인스타그램', image: 'product-1.png',
      hint: 'AI: 이 문구는 근거 없는 과장이 있어요.',
      choices: [
        { quality: 'weak', text: '세상에서 제일 맛있는 쿠키! 안 먹으면 후회', likes: 60,
          feedback: '근거 없는 과장은 상품에 대한 신뢰를 떨어뜨려요.' },
        { quality: 'best', text: '바삭한 보리향 한 입, 군산에서 구웠어요 🍪 오늘 간식 대신 어때요?', likes: 1200,
          feedback: '보리향이라는 장점을 전하고, 간식 찾는 손님에게 행동을 권했어요.' },
        { quality: 'mid', text: '흰찰쌀보리 함유, 100g, 개별 포장', likes: 360,
          feedback: '틀린 말은 없지만 특징만 나열해서 마음을 움직이지 못했어요.' }
      ] },
    { name: '무선 이어폰', desc: '가볍고 하루 종일 가는 배터리', emoji: '🎧',
      target: '통학하는 학생', channel: '숏폼 영상', image: 'product-2.png',
      hint: 'AI: 이 문구는 통학하는 학생과 대상이 달라요.',
      choices: [
        { quality: 'mid', text: '블루투스 5.3, 배터리 30시간, 5색', likes: 420,
          feedback: '기능만 나열했어요. 통학할 때 어떤 도움이 되는지 말해 보면 좋아요.' },
        { quality: 'weak', text: '회의가 많은 직장인을 위한 프리미엄 이어폰', likes: 80,
          feedback: '통학하는 학생에게 직장인 이야기는 공감을 얻기 어려워요.' },
        { quality: 'best', text: '버스에서 영상 볼 때 끊김 없이, 충전 걱정 없이 하루 종일 🎧 통학 필수템', likes: 1380,
          feedback: '통학 상황에 맞는 장점을 구체적으로 전하고, 필수템으로 권했어요.' }
      ] },
    { name: '보온 텀블러', desc: '12시간 따뜻한 스테인리스 텀블러', emoji: '☕',
      target: '카페 자주 가는 직장인', channel: '온라인 쇼핑몰', image: 'product-3.png',
      hint: 'AI: 영원히 식지 않는다는 말은 과장이에요.',
      choices: [
        { quality: 'best', text: '출근길 커피, 점심까지 따뜻하게 ☕ 일회용 컵 대신 텀블러 할인도 받아요', likes: 1440,
          feedback: '출근길의 장점을 전하고, 카페 손님에게 텀블러 사용을 권했어요.' },
        { quality: 'mid', text: '스테인리스 소재, 500ml, 보온 12시간', likes: 480,
          feedback: '소재와 수치만 있어요. 손님이 누릴 좋은 점도 함께 알려 주세요.' },
        { quality: 'weak', text: '영원히 식지 않는 마법의 텀블러', likes: 40,
          feedback: '실제 보온 시간과 다른 과장은 상품에 대한 신뢰를 떨어뜨려요.' }
      ] }
  ];

  const QUALITY_STARS = { best: 3, mid: 2, weak: 1 };
  const STAMP_TEXT = 'AI비즈니스실 도장 획득!';
  const RESULT_TEXT = 'AI마케팅과에서는 상품을 알리는 콘텐츠를 만들고, 반응 데이터를 보며 마케팅을 배워요.';   // ※ 학교 확인 후 바뀔 수 있는 문구
  const DEPT_LINK = { href: '../index.html#marketing', label: 'AI마케팅과 알아보기 →' };
  const GUIDE_TEXT = '상품과 대상 손님을 보고, 가장 어울리는 광고 문구를 골라요.';
  const HINT_TEXT = 'AI 추천 보기';

  /* ---------- 도우미 ---------- */

  const number = n => n.toLocaleString('ko-KR');
  const starText = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  const el = (tag, className, text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };

  function picture(file, emoji, size) {
    const img = document.createElement('img');
    img.alt = '';
    img.width = size; img.height = size;
    img.addEventListener('error', () => {
      const fallback = el('span', 'ai-emoji', emoji);
      fallback.setAttribute('aria-hidden', 'true');
      img.replaceWith(fallback);
    }, { once: true });
    img.src = IMG + file;
    return img;
  }

  /* ---------- 게임 ---------- */

  function start(container, api) {
    const state = { round: 0, hinted: false, locked: false, stars: 0, hints: 0, likes: 0 };
    let frame = 0;
    let focusFrame = 0;

    container.innerHTML = `
      <div class="ai">
        <p class="ai-progress"></p>
        <section class="ai-product" aria-label="이번 상품"></section>
        <div class="ai-panel">
          <p class="ai-guide"></p>
          <div class="ai-choices" role="group" aria-label="광고 문구 후보"></div>
          <button type="button" class="btn ai-hint" aria-pressed="false"></button>
        </div>
        <section class="ai-reaction" role="status" aria-live="polite" aria-atomic="true" hidden></section>
        <button type="button" class="btn btn-primary ai-next" hidden></button>
      </div>`;

    const $ = selector => container.querySelector(selector);
    const root = $('.ai');
    const progress = $('.ai-progress');
    const productBox = $('.ai-product');
    const choicesBox = $('.ai-choices');
    const hintButton = $('.ai-hint');
    const reaction = $('.ai-reaction');
    const nextButton = $('.ai-next');
    $('.ai-guide').textContent = GUIDE_TEXT;
    hintButton.append(picture('ai-bot.png', '🤖', 32), document.createTextNode(HINT_TEXT));

    // 읽기 프로그램에는 최종값만 안내. 화면의 숫자는 약 1.2초 동안 올립니다.
    function countLikes(node, total) {
      cancelAnimationFrame(frame);
      node.textContent = api.reducedMotion ? number(total) : '0';
      if (api.reducedMotion) return;
      let began = null;
      const tick = now => {
        // 결과 화면도 닫거나 다음으로 넘어가면 움직임을 멈춥니다.
        if (!node.isConnected) return;
        if (began === null) began = now;
        const ratio = Math.min(1, (now - began) / 1200);
        node.textContent = number(Math.round(total * ratio));
        if (ratio < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }

    function likesRow(total, summary = false) {
      const row = el('p', summary ? 'ai-total' : 'ai-likes');
      row.setAttribute('role', 'img');
      row.setAttribute('aria-label', `${summary ? '총 좋아요' : '좋아요'} ${number(total)}`);
      const visual = el('span', 'ai-like-visual');
      visual.setAttribute('aria-hidden', 'true');
      if (summary) visual.append(document.createTextNode('총 좋아요 '));
      const heart = el('span', 'ai-heart', '♥');
      const value = el('span', 'ai-count', '0');
      visual.append(heart, document.createTextNode(' '), value);
      row.append(visual);
      return row;
    }

    function showHint() {
      if (state.locked || state.hinted) return;
      state.hinted = true;
      state.hints++;
      hintButton.setAttribute('aria-pressed', 'true');
      const product = PRODUCTS[state.round];
      const weak = choicesBox.children[product.choices.findIndex(choice => choice.quality === 'weak')];
      weak.classList.add('is-dim');
      weak.append(el('span', 'ai-hint-note', product.hint));
      api.announce(`${product.hint} 이번 라운드는 별 1개 감점, 최소 1개예요.`);
    }

    function pick(choice) {
      if (state.locked) return;
      state.locked = true;
      const product = PRODUCTS[state.round];
      const stars = Math.max(1, QUALITY_STARS[choice.quality] - Number(state.hinted));
      state.stars += stars;
      state.likes += choice.likes;
      for (const button of choicesBox.children) button.disabled = true;
      hintButton.disabled = true;
      root.classList.add('is-picked');

      const post = el('div', 'ai-post');
      post.append(el('p', 'ai-post-head', `${product.channel} · 우리 상품 소식`));
      post.append(picture(product.image, product.emoji, 128));
      post.append(el('p', 'ai-caption', choice.text), likesRow(choice.likes));
      const feedback = el('p', 'ai-feedback', choice.feedback);
      const score = el('p', 'ai-stars', starText(stars));
      score.setAttribute('role', 'img');
      score.setAttribute('aria-label', `이번 라운드 별 ${stars}개`);
      reaction.replaceChildren(post, feedback, score);
      reaction.hidden = false;
      nextButton.textContent = state.round === PRODUCTS.length - 1 ? '결과 보기' : '다음 상품 →';
      nextButton.hidden = false;
      nextButton.focus();
      countLikes(reaction.querySelector('.ai-count'), choice.likes);
    }

    function nextRound() {
      if (!state.locked) return;
      if (state.round < PRODUCTS.length - 1) {
        state.round++;
        startRound();
        return;
      }
      const extra = likesRow(state.likes, true);
      api.done({ stars: state.stars, hints: state.hints, extra });
      // games.js가 결과 요소를 문서에 붙인 다음 집계를 시작합니다.
      countLikes(extra.querySelector('.ai-count'), state.likes);
    }

    function startRound() {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(focusFrame);
      Object.assign(state, { hinted: false, locked: false });
      const product = PRODUCTS[state.round];
      root.classList.remove('is-picked');
      progress.textContent = `${state.round + 1} / ${PRODUCTS.length} 라운드`;
      productBox.replaceChildren(picture(product.image, product.emoji, 128));
      productBox.append(el('h3', 'ai-name', product.name), el('p', 'ai-description', product.desc));
      const tags = el('div', 'ai-tags');
      tags.append(el('span', 'ai-tag', `대상: ${product.target}`), el('span', 'ai-tag', `채널: ${product.channel}`));
      productBox.append(tags);
      choicesBox.replaceChildren();
      product.choices.forEach((choice, i) => {
        const button = el('button', 'ai-choice', `${i + 1}. ${choice.text}`);
        button.type = 'button';
        button.addEventListener('click', () => pick(choice));
        choicesBox.append(button);
      });
      hintButton.disabled = false;
      hintButton.setAttribute('aria-pressed', 'false');
      reaction.hidden = true;
      reaction.replaceChildren();
      nextButton.hidden = true;
      api.announce(`${state.round + 1}번째 상품, ${product.name}. ${GUIDE_TEXT}`);
      // 창이 열린 뒤 첫 후보에 초점. 새 라운드에서는 위쪽으로 스크롤도 돌아갑니다.
      container.scrollTop = 0;
      focusFrame = requestAnimationFrame(() => choicesBox.firstElementChild.focus({ preventScroll: true }));
    }

    hintButton.addEventListener('click', showHint);
    nextButton.addEventListener('click', nextRound);
    startRound();
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(focusFrame); };
  }

  window.TOUR_GAMES = window.TOUR_GAMES || {};
  window.TOUR_GAMES.ai = {
    title: 'AI 광고 문구 고르기',
    button: '📣 광고 문구 고르기 체험',
    room: 'AI비즈니스실',
    naver: 'Ai',
    maxStars: 9,
    stamp: STAMP_TEXT,
    message: RESULT_TEXT,
    cta: DEPT_LINK,
    start
  };
})();
