/* 픽셀 학교 투어 — 금융실습실 「피싱 탐정」
 * 문자·보상은 아래에서 고칩니다. 가상 문자이며 링크는 글자로만 표시합니다.
 */
(() => {
  /* ---------- 선생님이 고칠 수 있는 데이터 ---------- */
  // from(보낸 사람)만 보고 답이 보이지 않게, 수상한 점은 본문에 둡니다. 이름·주소는 모두 가상입니다.
  const MESSAGES = [
    { id: 'mom-gift', from: '엄마 (새 번호)', scam: true, parts: [
      { text: '딸~ 엄마 폰 액정 깨져서 친구 폰이야. ' },
      { text: '급하니까 지금 바로 ', clue: true, why: '급하게 재촉하면 아는 번호로 먼저 확인해요.' },
      { text: '상품권 10만 원 사서 번호 보내줘!', clue: true, why: '가족을 사칭한 상품권 요구는 직접 전화로 확인해요.' }
    ], explain: '새 번호로 온 돈·상품권 부탁은 원래 알던 연락처로 확인해요.' },
    { id: 'parcel-link', from: '구름콩택배 알림', scam: true, parts: [
      { text: '[구름콩택배] 주소 불명으로 반송 예정. ' },
      { text: '내 간식이 돌아간다고?! 확인: ' },
      { text: 'hxxp://parcel-cloudbean.example/abc', clue: true, why: '모르는 링크는 누르지 않고 원래 쓰던 배송 조회로 확인해요.' }
    ], explain: '택배를 핑계로 낯선 링크에 접속하게 하는 문자예요.' },
    { id: 'ticket-fee', from: '별콩밴드 당첨팀', scam: true, parts: [
      { text: '축하해요! 별콩밴드 콘서트 맨 앞자리 당첨! ' },
      { text: '응모한 적 없어도 행운은 오는 법! ' },
      { text: '수수료 3만 원부터 입금하세요.', clue: true, why: '당첨을 핑계로 먼저 돈을 요구하면 의심해요.' }
    ], explain: '신청하지 않은 당첨과 선입금 요구는 수상해요.' },
    { id: 'game-password', from: '젤리행성 운영자', scam: true, parts: [
      { text: '전설의 말랑검 무료 지급! ' },
      { text: '내 캐릭터도 드디어 부자? ' },
      { text: '계정 비밀번호를 답장해 주세요.', clue: true, why: '운영자를 자처해도 비밀번호는 알려 주지 않아요.' }
    ], explain: '무료 아이템으로 유혹해 계정 비밀번호를 빼내려 해요.' },
    { id: 'easy-job', from: '낮잠알바 안내', scam: true, parts: [
      { text: '누워서도 가능한 꿀알바! ' },
      { text: '하루 30분에 월 300만 원 보장! ', clue: true, why: '노력에 비해 지나치게 좋은 조건은 의심해요.' },
      { text: '등록비 5만 원만 먼저 보내세요.', clue: true, why: '일을 시작하기 전에 돈부터 요구하면 멈춰요.' }
    ], explain: '과장된 수입과 선입금 요구가 함께 있는 사기예요.' },
    { id: 'bank-freeze', from: '달토끼금고 안내', scam: true, parts: [
      { text: '[달토끼금고] 계좌 정지 예정! ' },
      { text: '오늘 안에 확인하지 않으면 용돈이 꽁꽁! ' },
      { text: 'hxxp://moon-vault.example/verify 에서 본인 확인', clue: true, why: '문자의 링크 대신 평소 쓰던 금융 앱으로 직접 확인해요.' }
    ], explain: '계좌 정지로 겁을 주며 가짜 확인 페이지로 유도해요.' },
    { id: 'used-payment', from: '중고장터 판매자', scam: true, parts: [
      { text: '찾던 한정판 필통 아직 있어요. ' },
      { text: '우리끼리만 특별 할인! ' },
      { text: '안전결제는 hxxp://safe-pencil.example/pay 로 해요.', clue: true, why: '상대가 보낸 외부 결제 링크는 안전결제가 아닐 수 있어요.' }
    ], explain: '거래 서비스 밖의 낯선 결제 링크는 피해야 해요.' },
    { id: 'survey-id', from: '말랑설문 연구소', scam: true, parts: [
      { text: '최애 간식 투표하고 모바일 교환권 받자! ' },
      { text: '떡볶이파도 초코파도 환영! ' },
      { text: '주민등록번호 전체를 답장해 주세요.', clue: true, why: '간단한 설문에 주민등록번호 전체가 필요하지 않아요.' }
    ], explain: '선물을 미끼로 민감한 개인정보를 요구하고 있어요.' },
    { id: 'safe-account', from: '사이버수사팀', scam: true, parts: [
      { text: '당신의 통장이 사건에 연루됐습니다. ' },
      { text: '비밀 수사라 가족에게 말하면 안 됩니다. ', clue: true, why: '주변에 알리지 말라는 요구는 도움을 막으려는 수법이에요.' },
      { text: '용돈을 안전계좌로 이체하세요.', clue: true, why: '수사기관은 문자로 안전계좌 이체를 요구하지 않아요.' }
    ], explain: '기관을 사칭해 겁을 주고 돈을 옮기게 하는 사기예요.' },
    { id: 'friend-code', from: '친구 (새 번호)', scam: true, parts: [
      { text: '나 폰 바꿨어! 프사는 아직 감자야. ' },
      { text: '지금 로그인이 안 되는데 ' },
      { text: '네 폰으로 온 인증번호 좀 대신 보내 줘.', clue: true, why: '인증번호는 계정 열쇠예요. 친구에게도 보내지 않아요.' }
    ], explain: '친구를 사칭해 인증번호로 계정을 가져가려는 문자예요.' },
    { id: 'mom-dinner', from: '엄마', scam: false, parts: [
      { text: '저녁 뭐 먹을래? ' }, { text: '김치찌개 vs 제육! ' }, { text: '무응답이면 엄마 마음대로 😎' }
    ], explain: '아는 번호의 평범한 대화이고 돈·개인정보·링크 요구가 없어요.', oops: '엄마가 서운해해요 😢 제육은 무죄!' },
    { id: 'teacher-kit', from: '담임 선생님', scam: false, parts: [
      { text: '내일 체육복 챙겨 오세요. ' }, { text: '운동화도 잊지 말고요! ' }, { text: '구두로 달리기는 금지 😊' }
    ], explain: '알고 있는 선생님의 준비물 안내이며 수상한 요구가 없어요.', oops: '체육복은 사기가 아니에요 👟' },
    { id: 'friend-homework', from: '친구', scam: false, parts: [
      { text: '숙제 범위 어디까지야 ㅠㅠ ' }, { text: '분명 적어 뒀는데 ' }, { text: '내 글씨를 내가 못 읽겠어.' }
    ], explain: '아는 친구의 일상 질문이고 비밀번호·인증번호를 묻지 않아요.', oops: '친구의 숙제 구조 요청이었어요 📝' },
    { id: 'class-time', from: '구름연필학원', scam: false, parts: [
      { text: '오늘 수업은 6시로 변경됩니다. ' }, { text: '교재는 그대로 가져오세요. ' }, { text: '간식 먹고 천천히 와요.' }
    ], explain: '다니는 학원의 일정 안내이며 링크나 송금 요구가 없어요.', oops: '수업은 진짜예요. 숙제도 진짜… 📚' },
    { id: 'parcel-door', from: '구름콩택배 기사', scam: false, parts: [
      { text: '주문한 물건 문 앞에 두고 갑니다. ' }, { text: '상자가 살짝 커요. ' }, { text: '문 열 때 발 조심하세요!' }
    ], explain: '기다리던 배송의 완료 안내이며 링크·추가 결제 요구가 없어요.', oops: '문 앞 상자는 억울해요 📦' },
    { id: 'library-book', from: '별책도서관', scam: false, parts: [
      { text: '빌린 책 반납일이 내일이에요. ' }, { text: '책갈피는 챙기셨나요? ' }, { text: '책도 집에 가고 싶대요.' }
    ], explain: '이용한 도서관의 반납 안내이며 돈이나 개인정보 요구가 없어요.', oops: '책이 집에 가고 싶대요 📖' }
  ];
  const START_MONEY = 30000;
  const SECONDS_PER_MESSAGE = 8;
  const RUSH_SECONDS = 4;
  const RUSH_CHANCE = 0.15;
  const REWARD = { scam: 3000, real: 1000, fooled: -8000, doubted: -1000, clue: 2000, combo: 1000 };
  const STAR_RULE = { three: 7, two: 5 };
  const number = n => n.toLocaleString('ko-KR');
  const el = (tag, className, text = '') => {
    const node = document.createElement(tag);
    node.className = tag === 'button' ? 'btn ' + className : className; node.textContent = text;
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

  function pickMessages(game) {
    if (game.pickOrder) return game.pickOrder.map(id =>
      typeof id === 'object' ? id : game.messages.find(message => message.id === id)).filter(Boolean).slice(0, 8);
    return shuffled([
      ...shuffled(game.messages.filter(message => message.scam)).slice(0, 5),
      ...shuffled(game.messages.filter(message => !message.scam)).slice(0, 3)
    ]);
  }

  function start(container, api) {
    const game = window.TOUR_GAMES.phishing;
    const messages = pickMessages(game);
    const state = { phase: 'intro', index: 0, money: START_MONEY, correct: 0, clues: 0,
      combo: 0, best: 0, rush: false, rushed: false, deadline: 0, seconds: 8 };
    let frame = 0, moneyFrame = 0, timer = 0;
    container.innerHTML = `
      <div class="phishing-intro">
        <img class="phishing-detective" src="img/games/finance/detective.png?v=20261118" width="128" height="128" alt="돋보기를 든 교복 탐정">
        <h3>용돈 30,000원을 지켜라!</h3>
        <ul><li>8통의 문자를 8초 안에 진짜 / 사기로 가려요.</li>
          <li>사기를 찾았다면 수상한 단서도 눌러요.</li>
          <li>3콤보부터 보너스! 연속 도착 문자는 4초, 보상 2배!</li></ul>
        <button type="button" class="btn btn-primary phishing-start">수사 시작</button>
      </div>
      <div class="phishing-game" hidden>
        <div class="phishing-stats"><strong class="phishing-wallet" aria-hidden="true"></strong>
          <span class="phishing-progress"></span><span class="phishing-combo"></span></div>
        <section class="phishing-phone" aria-label="받은 문자">
          <div class="phishing-phone-head">문자 <span>● ● ●</span></div>
          <p class="phishing-from"></p><div class="phishing-timer" aria-hidden="true"><div></div></div>
          <p class="phishing-bubble"></p></section>
        <div class="phishing-panel">
          <p class="phishing-event" role="status"></p>
          <button type="button" class="btn phishing-open" hidden>문자 확인 · 4초 시작</button>
          <div class="phishing-choices">
            <button type="button" class="btn phishing-real">👍 진짜 <small class="phishing-key">← / 1</small></button>
            <button type="button" class="btn phishing-scam">🚨 사기 <small class="phishing-key">→ / 2</small></button>
          </div>
          <div class="phishing-feedback" role="status" aria-live="polite" aria-atomic="true"></div>
          <div class="phishing-clues" role="group" aria-label="어디가 수상했을까요?" hidden></div>
          <p class="phishing-clue-result" role="status" aria-atomic="true"></p>
          <button type="button" class="btn btn-primary phishing-next" hidden>다음 문자 →</button>
        </div>
      </div>`;
    const $ = selector => container.querySelector(selector);
    const root = $('.phishing-game');
    const wallet = $('.phishing-wallet');
    const next = $('.phishing-next');
    const bar = $('.phishing-timer div');
    $('.phishing-detective').addEventListener('error', e => {
      e.target.replaceWith(el('span', 'phishing-detective', '🕵️'));
    }, { once: true });

    function clearClock() {
      cancelAnimationFrame(frame); clearTimeout(timer);
    }

    function money(delta) {
      cancelAnimationFrame(moneyFrame);
      const before = state.money;
      state.money += delta;
      wallet.className = 'phishing-wallet' + (state.money <= 0 ? ' phishing-negative' : '');
      if (!api.reducedMotion && delta) wallet.classList.add(delta > 0 ? 'phishing-gain' : 'phishing-loss');
      const began = performance.now();
      const tick = now => {
        const ratio = api.reducedMotion ? 1 : Math.min(1, (now - began) / 400);
        wallet.textContent = `💰 ${number(Math.round(before + delta * ratio))}원`;
        if (ratio < 1) moneyFrame = requestAnimationFrame(tick);
      };
      tick(began);
    }

    function finish() {
      state.phase = 'done'; clearClock();
      const stars = state.correct >= STAR_RULE.three ? 3 : state.correct >= STAR_RULE.two ? 2 : 1;
      const extra = el('div', 'phishing-summary');
      extra.append(el('strong', 'phishing-total', `${state.money < 0 ? '털린' : '지킨'} 용돈 ${number(Math.abs(state.money))}원`),
        el('p', '', `${messages.length}통 중 ${state.correct}통 적중 · 단서 ${state.clues}개 · 최고 ${state.best}콤보`),
        el('p', 'phishing-rank', stars === 3 ? '명탐정' : stars === 2 ? '수사관' : '새내기 탐정'));
      // 점수: 지킨 용돈(원). 털렸으면 0원
      api.done({ stars, hints: 0, extra, points: Math.max(0, state.money) });
    }

    function findClue(part) {
      if (state.phase !== 'clue') return;
      state.phase = 'judged';
      const clues = messages[state.index].parts.filter(piece => piece.clue);
      const bonus = part.clue ? REWARD.clue * (state.rush ? 2 : 1) : 0;
      if (part.clue) { state.clues++; money(bonus); }
      [...$('.phishing-clues').querySelectorAll('button')].forEach((button, i) => {
        button.disabled = true;
        if (messages[state.index].parts[i].clue) button.classList.add('phishing-found');
      });
      $('.phishing-clue-result').textContent = part.clue
        ? `단서 발견! +${number(bonus)}원 · ${part.why}`
        : `보너스는 아쉽게 놓쳤어요. ${clues.map(piece => piece.why).join(' ')}`;
      next.hidden = false; next.focus({ preventScroll: true });
    }

    function showClues(message) {
      state.phase = 'clue';
      const box = $('.phishing-clues');
      box.hidden = false; box.replaceChildren(el('strong', '', '어디가 수상했을까요?'));
      message.parts.forEach(part => {
        const button = el('button', 'phishing-clue', part.text);
        button.type = 'button'; button.addEventListener('click', () => findClue(part)); box.append(button);
      });
      box.querySelector('button').focus({ preventScroll: true });
    }

    function judge(answer, timeout = false) {
      if (state.phase !== 'reading') return;
      if (!timeout && performance.now() >= state.deadline) return judge(null, true);
      state.phase = 'judged'; clearClock();
      const message = messages[state.index];
      const correct = !timeout && answer === message.scam;
      state.combo = correct ? state.combo + 1 : 0;
      state.best = Math.max(state.best, state.combo);
      let delta = 0, text = '';
      if (correct) {
        state.correct++;
        delta = ((message.scam ? REWARD.scam : REWARD.real) + (state.combo >= 3 ? REWARD.combo : 0)) * (state.rush ? 2 : 1);
        text = `${message.scam ? '사기 검거!' : '진짜 문자예요!'} +${number(delta)}원${state.combo >= 3 ? ` · 🔥 ${state.combo}콤보!` : ''}`;
      } else {
        delta = message.scam ? REWARD.fooled : timeout ? 0 : REWARD.doubted;
        text = message.scam ? '앗! 털렸어요 💸' : timeout ? '시간 초과! 이번에는 0원이에요.' : message.oops;
        if (!api.reducedMotion && message.scam) $('.phishing-phone').classList.add('phishing-shake');
      }
      money(delta);
      $('.phishing-combo').textContent = `🔥 ${state.combo}콤보`;
      $('.phishing-choices').hidden = true;
      $('.phishing-feedback').replaceChildren(el('strong', '', text), el('p', '', message.explain));
      if (correct && message.scam) showClues(message);
      else { next.hidden = false; next.focus({ preventScroll: true }); }
    }

    function tick(now) {
      if (state.phase !== 'reading') return;
      const left = Math.max(0, state.deadline - now);
      bar.style.width = `${left / (state.seconds * 1000) * 100}%`;
      bar.classList.toggle('phishing-urgent', left <= 2000);
      if (left <= 0) return judge(null, true);
      frame = requestAnimationFrame(tick);
    }

    function readMessage() {
      if (state.phase !== 'ready') return;
      state.phase = 'reading';
      const message = messages[state.index];
      $('.phishing-open').hidden = true;
      $('.phishing-bubble').textContent = message.parts.map(part => part.text).join('');
      $('.phishing-bubble').classList.toggle('phishing-arrive', !api.reducedMotion);
      $('.phishing-choices').hidden = false;
      state.deadline = performance.now() + state.seconds * 1000;
      api.announce(`띠링! ${message.from}. ${state.seconds}초 안에 진짜 또는 사기를 골라요.`);
      $('.phishing-real').focus({ preventScroll: true });
      frame = requestAnimationFrame(tick);
      timer = setTimeout(() => judge(null, true), state.seconds * 1000);
    }

    function ready() {
      clearClock(); state.phase = 'ready';
      if (state.index >= messages.length) return finish();
      state.rush = !state.rushed && Math.random() < game.rushChance;
      state.rushed = state.rushed || state.rush;
      state.seconds = state.rush ? RUSH_SECONDS : SECONDS_PER_MESSAGE;
      $('.phishing-progress').textContent = `${state.index + 1} / ${messages.length}`;
      $('.phishing-from').textContent = messages[state.index].from;
      $('.phishing-event').textContent = state.rush ? '⚡ 연속 도착! 4초 안에 맞히면 모든 보상 2배!' : '띠링! 용돈 방어 준비 완료.';
      $('.phishing-bubble').textContent = '새 문자가 도착했어요.';
      $('.phishing-bubble').classList.remove('phishing-arrive');
      $('.phishing-phone').classList.remove('phishing-shake');
      $('.phishing-feedback').replaceChildren(); $('.phishing-clue-result').textContent = '';
      $('.phishing-clues').hidden = true; $('.phishing-clues').replaceChildren();
      $('.phishing-choices').hidden = true; next.hidden = true;
      next.textContent = state.index === messages.length - 1 ? '결과 보기' : '다음 문자 →';
      bar.style.width = '100%'; bar.classList.remove('phishing-urgent');
      container.scrollTop = 0;
      $('.phishing-open').hidden = !state.rush;
      if (state.rush) $('.phishing-open').focus({ preventScroll: true });
      else readMessage();
    }

    function onKey(e) {
      if (e.repeat || e.isComposing || e.ctrlKey || e.altKey || e.metaKey || !root.contains(document.activeElement)) return;
      if (!['ArrowLeft', 'ArrowRight', '1', '2'].includes(e.key) || state.phase !== 'reading') return;
      e.preventDefault(); judge(e.key === 'ArrowRight' || e.key === '2');
    }
    $('.phishing-start').addEventListener('click', () => {
      $('.phishing-intro').hidden = true; root.hidden = false;
      money(0); $('.phishing-combo').textContent = '🔥 0콤보'; ready();
    });
    $('.phishing-open').addEventListener('click', readMessage);
    $('.phishing-real').addEventListener('click', () => judge(false));
    $('.phishing-scam').addEventListener('click', () => judge(true));
    next.addEventListener('click', () => { if (state.phase === 'judged') { state.index++; ready(); } });
    document.addEventListener('keydown', onKey);
    $('.phishing-start').focus({ preventScroll: true });
    return () => {
      state.phase = 'done'; clearClock(); cancelAnimationFrame(moneyFrame);
      document.removeEventListener('keydown', onKey);
    };
  }

  window.TOUR_GAMES = window.TOUR_GAMES || {};
  window.TOUR_GAMES.phishing = {
    title: '피싱 탐정', button: '🕵️ 피싱 탐정', room: '금융실습실', naver: 'Phishing', maxStars: 3, scoreUnit: '원',
    stamp: '금융실습실 도장 획득!',
    message: 'AI핀테크과에서는 안전한 금융 생활을 데이터로 배워요.', // ※ 학교 확인
    cta: { href: '../index.html#fintech', label: 'AI핀테크과 알아보기 →' },
    messages: MESSAGES, pickOrder: null, rushChance: RUSH_CHANCE,
    start
  };
})();
