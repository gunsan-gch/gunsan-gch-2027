/* =========================================================================
   픽셀 학교 투어 — AI비즈니스실 「AI 광고 문구 고르기」
   상품에 어울리는 문구를 고르고 SNS 반응을 보는 3라운드 게임입니다 (1분 안팎).
   상품·문구·좋아요·피드백은 맨 위 목록에서 고칩니다. 결과 화면·도장은 games.js가 맡습니다.
   AI 추천은 미리 정한 힌트이며, 서버 전송 없이 이 브라우저 안에서만 동작합니다.
   ========================================================================= */

(() => {
  const IMG = 'img/games/ai/';

  /* ---------- 선생님이 고칠 수 있는 데이터 ---------- */

  // 각 손님의 order는 같은 문구 세 개를 반응이 좋은 순서로 가리킵니다.
  const PRODUCTS = [
    { name: '흰찰쌀보리 쿠키', desc: '군산 흰찰쌀보리로 구운 쿠키', emoji: '🍪', image: 'product-1.png',
      ads: ['쉬는 시간, 친구와 쿠키 한 입 나눠요.', '여행 가방에 군산의 보리 향을 담아 가요.', '따뜻한 차 곁에 담백한 보리 쿠키 한 조각.'],
      briefs: [
        { target: '매점에 들른 학생', wish: '종 치기 전에 둘이 같이 먹을 간식을 찾고 있어요.', order: [0,2,1],
          comments: ['친구한테 반씩 나눠 먹자고 해야겠어요.', '간식으로 괜찮겠어요. 차를 마실 시간은 없지만요.', '군산 여행을 온 건 아니어서 그냥 지나쳤어요.'] },
        { target: '군산을 떠나는 여행객', wish: '집에서도 이번 여행을 떠올리고 싶어요.', order: [1,2,0],
          comments: ['군산 보리라니, 집에서 꺼내도 이곳이 생각나겠어요.', '보리 맛은 궁금한데 어디에서 만든 걸까요?', '쉬는 시간 얘기를 보니 학생용 간식 같아요.'] },
        { target: '다과 모임의 주최자', wish: '오늘 우린 차와 함께 곁들일 다과를 골라요.', order: [2,0,1],
          comments: ['찻잔 옆에 놓으면 어울리겠어요.', '함께 나누기 좋겠네요. 차와도 잘 맞을까요?', '여행 선물보다는 오늘 낼 다과가 필요해요.'] }
      ] },
    { name: '무선 이어폰', desc: '선 없이 음악과 음성을 듣는 이어폰', emoji: '🎧', image: 'product-2.png',
      ads: ['창밖 풍경에 오늘의 플레이리스트를 더해요.', '낯선 발음, 내 자리에서 한 번 더 들어요.', '안무 연습할 땐 선 없이 박자를 타요.'],
      briefs: [
        { target: '버스로 통학하는 학생', wish: '창가 자리에 앉아서 좋아하는 노래를 듣고 싶어요.', order: [0,2,1],
          comments: ['버스 창밖을 보며 들을 노래가 벌써 떠올라요.', '박자를 타고 싶긴 한데 버스에선 앉아 가요.', '등굣길만큼은 공부 대신 음악을 듣고 싶어요.'] },
        { target: '듣기 연습을 하는 학생', wish: '도서관에서 외국어 대화를 다시 들어 볼 거예요.', order: [1,0,2],
          comments: ['옆 사람을 방해하지 않고 발음을 다시 들을 수 있겠어요.', '음악 듣는 모습은 떠오르는데 공부할 때는 어떨까요?', '도서관이라 춤을 연습할 자리는 없어요.'] },
        { target: '댄스 동아리원', wish: '팔을 크게 움직이며 혼자 동작을 맞춰 보고 싶어요.', order: [2,0,1],
          comments: ['선이 걸리지 않으니 동작에 집중하겠어요.', '연습곡은 떠오르는데 움직일 때도 편할까요?', '지금 맞춰야 하는 건 발음보다 동작이에요.'] }
      ] },
    { name: '보온 텀블러', desc: '따뜻한 음료를 담는 스테인리스 텀블러', emoji: '☕', image: 'product-3.png',
      ads: ['출근길에 주문한 커피, 내 컵에 받아 가요.', '산길에서 쉬어 갈 때 따뜻한 차 한 모금.', '책장을 넘기다 잠깐, 내 책상 위 찻집.'],
      briefs: [
        { target: '카페에 들른 직장인', wish: '매일 아침 테이크아웃할 때 종이컵이 쌓여요.', order: [0,2,1],
          comments: ['주문할 때 바로 이 컵을 내밀면 되겠네요.', '책상에서 마시긴 해요. 주문할 때도 쓸 수 있을까요?', '등산할 때보다 동네 카페에서 자주 쓸 것 같아요.'] },
        { target: '주말 등산객', wish: '바람 부는 고갯마루에서 몸을 녹이고 싶어요.', order: [1,0,2],
          comments: ['고개를 넘고 나서 마실 따뜻한 차가 떠올라요.', '들고 나가기는 좋겠어요. 산에서 쉴 때는 어떨까요?', '이번 주말에는 책상에서 멀리 떠날 거예요.'] },
        { target: '독서 모임 회원', wish: '소설을 읽다가 자리를 뜨지 않고 차를 마시고 싶어요.', order: [2,1,0],
          comments: ['책 옆에 두면 읽던 대목에서 계속 읽겠어요.', '따뜻한 차는 좋지만 오늘 모임은 실내예요.', '오늘은 커피를 사러 밖에 나갈 생각이 없어요.'] }
      ] }
  ];

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  let productDeck = [];
  let previousProduct;
  function drawProduct() {
    if (!productDeck.length) {
      productDeck = shuffle(PRODUCTS);
      if (productDeck.at(-1) === previousProduct) productDeck.reverse();
    }
    previousProduct = productDeck.pop();
    return previousProduct;
  }

  const LIKES = [1200, 540, 180];
  // 2026-11-26 게임성: 손님마다 제한 시간이 있고, 빨리 고를수록·연속으로 최고 문구를 고를수록 좋아요가 더 붙어요.
  // 별은 지금처럼 고른 문구로만 정해요 (시간은 별에 영향 없음). 점수 = 총 좋아요.
  const SECONDS = 15;          // 손님 한 명당 고르는 시간
  const SPEED_BONUS = 0.5;     // 남은 시간 비율 × 기본 좋아요 × 이 값만큼 더함
  const COMBO_BONUS = 300;     // 최고 문구를 2번 연속부터 한 번에 이만큼 더함
  const STAMP_TEXT = 'AI비즈니스실 도장 획득!';
  const RESULT_TEXT = 'AI마케팅과에서는 콘텐츠를 만들고 반응 데이터를 분석해요.';   // ※ 학교 확인 후 바뀔 수 있는 문구
  const DEPT_LINK = { href: '../index.html#marketing', label: 'AI마케팅과 알아보기 →' };
  const GUIDE_TEXT = '같은 상품, 다른 손님! 손님의 말에 맞춰 광고 한 줄을 골라요.';
  const HINT_TEXT = 'AI 추천 보기 (이번 별 −1)';

  /* ---------- 도우미 ---------- */

  const number = n => n.toLocaleString('ko-KR');
  const starText = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  const el = (tag, className, text = '') => {
    const node = document.createElement(tag);
    node.className = tag === 'button' ? 'btn ' + className : className;
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
    const state = { round: 0, hinted: false, locked: false, stars: 0, hints: 0, likes: 0, combo: 0, deadline: 0 };
    let clock = 0, timeout = 0;
    const product = drawProduct();
    const briefs = shuffle(product.briefs);
    let displayedAds;
    let previousPick;
    let frame = 0;
    let focusFrame = 0;

    container.innerHTML = `
      <div class="ai">
        <p class="ai-progress"></p>
        <section class="ai-product" aria-label="이번 상품"></section>
        <div class="ai-panel">
          <p class="ai-guide"></p>
          <div class="ai-timer" role="timer" aria-label="남은 시간"><span></span><b></b></div>
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
      const brief = briefs[state.round];
      const weak = choicesBox.children[displayedAds.indexOf(brief.order[2])];
      const hint = '이 문구의 상황은 지금 손님의 이야기와 가장 멀어요.';
      weak.classList.add('is-dim');
      weak.append(el('span', 'ai-hint-note', hint));
      api.announce(`${product.ads[brief.order[2]]} ${hint} 이번 별 1개 감점, 최소 1개예요.`);
    }

    function stopClock() { cancelAnimationFrame(clock); clearTimeout(timeout); }
    function runClock() {
      stopClock();
      state.deadline = performance.now() + SECONDS * 1000;
      const box = $('.ai-timer'), bar = $('.ai-timer span'), label = $('.ai-timer b');
      const tick = () => {
        const left = Math.max(0, state.deadline - performance.now());
        bar.style.width = `${(left / (SECONDS * 1000)) * 100}%`;
        label.textContent = `${Math.ceil(left / 1000)}초`;
        box.classList.toggle('is-low', left < 5000);
        if (left > 0 && !state.locked) clock = requestAnimationFrame(tick);
      };
      tick();
      timeout = setTimeout(() => pick(null), SECONDS * 1000);
    }

    function pick(ad) {
      if (state.locked) return;
      state.locked = true;
      stopClock();
      const brief = briefs[state.round];
      const timedOut = ad === null;
      if (timedOut) ad = brief.order[2];   // 시간 초과: 손님이 그냥 지나감 (좋아요 0)
      const rank = brief.order.indexOf(ad);
      const left = Math.max(0, state.deadline - performance.now()) / (SECONDS * 1000);
      state.combo = rank === 0 && !timedOut ? state.combo + 1 : 0;
      const speed = timedOut ? 0 : Math.round(LIKES[rank] * left * SPEED_BONUS);
      const combo = state.combo >= 2 ? COMBO_BONUS * (state.combo - 1) : 0;
      const likes = timedOut ? 0 : LIKES[rank] + speed + combo;
      const stars = Math.max(1, 3 - rank - Number(state.hinted));
      state.stars += stars;
      state.likes += likes;
      for (const button of choicesBox.children) button.disabled = true;
      hintButton.disabled = true;
      root.classList.add('is-picked');

      const post = el('div', 'ai-post');
      post.append(el('p', 'ai-post-head', '모의 SNS · 우리 상품 소식'));
      post.append(picture(product.image, product.emoji, 128));
      post.append(el('p', 'ai-caption', product.ads[ad]), likesRow(likes));
      const feedback = el('p', 'ai-feedback', timedOut ? `⏰ 시간 초과! 손님이 광고를 못 보고 지나갔어요.` : `${brief.target} “${brief.comments[rank]}”`);
      const bonusText = [speed ? `빠른 선택 +${number(speed)}` : '', combo ? `🔥 ${state.combo}연속 최고 문구 +${number(combo)}` : ''].filter(Boolean).join(' · ');
      const score = el('p', 'ai-stars', starText(stars));
      score.setAttribute('role', 'img');
      score.setAttribute('aria-label', `이번 라운드 별 ${stars}개`);
      reaction.replaceChildren(post, feedback, score);
      if (previousPick) {
        const now = LIKES[brief.order.indexOf(previousPick.ad)];
        reaction.append(el('p', 'ai-feedback', `지난 광고 “${product.ads[previousPick.ad]}” · ${previousPick.target} ♥ ${number(previousPick.likes)} → ${brief.target} ♥ ${number(now)}`));
      }
      if (bonusText) reaction.append(el('p', 'ai-bonus', bonusText));
      previousPick = { ad, likes: timedOut ? 0 : LIKES[rank], target: brief.target };   // 비교는 보너스 뺀 기본 좋아요로
      reaction.hidden = false;
      nextButton.textContent = state.round === briefs.length - 1 ? '결과 보기' : '다음 손님 →';
      nextButton.hidden = false;
      nextButton.focus();
      countLikes(reaction.querySelector('.ai-count'), likes);
    }

    function nextRound() {
      if (!state.locked) return;
      if (state.round < briefs.length - 1) {
        state.round++;
        startRound();
        return;
      }
      const extra = likesRow(state.likes, true);
      // 최종 별은 라운드 평균(반올림) — 모든 게임이 최대 3개로 같음
      api.done({ stars: Math.max(1, Math.round(state.stars / briefs.length)), hints: state.hints, extra, points: state.likes });
      // games.js가 결과 요소를 문서에 붙인 다음 집계를 시작합니다.
      countLikes(extra.querySelector('.ai-count'), state.likes);
    }

    function startRound() {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(focusFrame);
      Object.assign(state, { hinted: false, locked: false });
      const brief = briefs[state.round];
      root.classList.remove('is-picked');
      progress.textContent = `${state.round + 1} / ${briefs.length} 라운드`;
      productBox.replaceChildren(picture(product.image, product.emoji, 128));
      productBox.append(el('h3', 'ai-name', product.name), el('p', 'ai-description', product.desc));
      const tags = el('div', 'ai-tags');
      tags.append(el('span', 'ai-tag', brief.target));
      productBox.append(tags, el('p', 'ai-guide', `“${brief.wish}”`));
      choicesBox.replaceChildren();
      displayedAds = shuffle(brief.order);
      displayedAds.forEach((ad, i) => {
        const button = el('button', 'ai-choice', `${i + 1}. ${product.ads[ad]}`);
        button.type = 'button';
        button.addEventListener('click', () => pick(ad));
        choicesBox.append(button);
      });
      hintButton.disabled = false;
      hintButton.setAttribute('aria-pressed', 'false');
      reaction.hidden = true;
      reaction.replaceChildren();
      nextButton.hidden = true;
      api.announce(`${state.round + 1}번째 손님, ${brief.target}. ${product.name}. ${brief.wish} ${GUIDE_TEXT}`);
      // 창이 열린 뒤 첫 후보에 초점. 새 라운드에서는 위쪽으로 스크롤도 돌아갑니다.
      container.scrollTop = 0;
      focusFrame = requestAnimationFrame(() => choicesBox.firstElementChild.focus({ preventScroll: true }));
      runClock();
    }

    hintButton.addEventListener('click', showHint);
    nextButton.addEventListener('click', nextRound);
    startRound();
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(focusFrame); stopClock(); };
  }

  window.TOUR_GAMES = window.TOUR_GAMES || {};
  window.TOUR_GAMES.ai = {
    title: 'AI 광고 문구 고르기',
    button: '📣 광고 문구 고르기 체험',
    room: 'AI비즈니스실',
    naver: 'Ai',
    maxStars: 3,
    scoreUnit: ' 좋아요',
    stamp: STAMP_TEXT,
    message: RESULT_TEXT,
    cta: DEPT_LINK,
    start
  };
})();
