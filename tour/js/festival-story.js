/*
  「녹원예술제 D-1」 이야기 틀 — 도장판을 '예술제 준비 현황판'으로 보여 주기 위한 데이터

  내일은 녹원예술제! 예비 신입생인 내가 일일 도우미가 되어 네 학과 부스 준비를 돕습니다.
  - 시작(prologue): 초대장 받기 · 어느 부스부터 도울지 고르기
  - 학과 부스(booths): 학과마다 핵심 미션 2개. 둘 다 끝내면 그 학과 배지가 켜짐
  - 개막 준비(finale): 학생회실에서 부스 자리 정하기 → 예술제 개막
  - 예술제 둘러보기(extras): 개막 뒤(또는 이미 해 본 게임이 있으면) 도장판에 나타남.
    지도에서 그 방에 가면 언제든 할 수 있고, 목록에만 처음부터 안 보일 뿐입니다.

  게임 규칙은 바꾸지 않습니다. 결과 화면의 학과 링크(cta)만 아래 학과에 맞춰 정리합니다.
  도장 저장 방식(localStorage 'gch-tour-stamps')은 그대로이며, 이름·연락처 같은 개인정보는 받지 않습니다.
*/
(function () {
  const DEPTS = {
    cafe:      { name: '카페비즈과',     booth: '카페 부스',     job: '음료와 빵을 준비해요',        href: '../index.html#cafe',      color: '#8a4f1d' },
    erp:       { name: 'ERP비즈니스과',  booth: '운영 본부',     job: '계산대와 물류를 맡아요',      href: '../index.html#erp',       color: '#14285a' },
    marketing: { name: 'AI마케팅과',     booth: '홍보 부스',     job: '광고 문구와 포스터를 만들어요', href: '../index.html#marketing', color: '#9b2f5f' },
    fintech:   { name: 'AI핀테크과',     booth: '결제·정산 부스', job: '안전한 결제와 정산을 지켜요',  href: '../index.html#fintech',   color: '#1f5f8b' }
  };

  /* 게임마다 예술제 속 한 줄: [게임 창 위에 뜨는 말, 결과 화면에 덧붙는 말] */
  const LINES = {
    paperplane: ['초대장이 하늘우체국에 도착했대요. 윤희 선배와 편지를 배달하며 몸을 풀어요.', '초대장을 받았어요! 이제 어느 부스부터 도울지 골라 봐요.'],
    career: ['내가 좋아하는 걸 고르면 어울리는 학과 부스를 알려 줘요.', '추천 부스를 확인했어요. 그래도 네 부스 모두 일손이 필요해요!'],
    cafe: ['카페 부스 시음회 준비! 손님 주문대로 음료를 만들어요.', '카페 부스 메뉴 준비 완료!'],
    bakery: ['부스에 낼 빵을 굽는 중이에요. 딱 맞는 시간에 오븐을 멈춰요.', '고소한 빵이 부스 진열대에 올라갔어요.'],
    tea: ['예술제에 오실 귀빈께 차를 대접해요.', '귀빈 맞이 준비 끝!'],
    cashier: ['운영 본부 계산대 연습! 물건값과 거스름돈을 맞춰요.', '계산대가 열릴 준비가 됐어요.'],
    logistics: ['다영 선배와 부스마다 필요한 물품을 배달해요.', '모든 부스에 물품이 도착했어요.'],
    typing: ['예술제 안내문을 빠르고 정확하게 입력해요.', '안내문 입력 끝!'],
    rain: ['쏟아지는 참가자 명단을 놓치지 말고 정리해요.', '참가자 명단 정리 끝!'],
    ai: ['홍보 부스 미션! 손님 마음을 사로잡을 광고 문구를 골라요.', '부스 홍보 문구가 정해졌어요.'],
    art: ['예술제 포스터에 쓸 색을 물감을 섞어 맞춰요.', '포스터 색이 완성됐어요.'],
    press: ['수빈 선배와 예술제 특집호에 실을 장면을 찍어요.', '예술제 특집호를 발행했어요.'],
    goods: ['지영 선배와 부스에서 팔 굿즈를 만들어요.', '굿즈가 진열대에 올라갔어요.'],
    phishing: ['결제·정산 부스 미션! 예술제 결제를 노리는 가짜 문자를 가려내요.', '가짜 문자를 모두 막았어요.'],
    reconcile: ['은령 선배와 부스 매출과 영수증을 맞춰 사라진 한 건을 찾아요.', '부스 장부가 딱 맞았어요.'],
    booths: ['정원 선배와 네 부스 자리를 정하면 예술제가 열려요!', '부스 배치 완료! 녹원예술제가 열렸어요.'],
    curling: ['예술제 체육 부문 미니 대회! 수아 선배와 컬링에 나가요.', '체육 부문 기록을 남겼어요.'],
    target: ['예술제 체육 부문 미니 대회! 수아 선배와 사격에 나가요.', '체육 부문 기록을 남겼어요.'],
    badminton: ['예술제 체육 부문 미니 대회! 수아 선배와 배드민턴에 나가요.', '체육 부문 기록을 남겼어요.'],
    melody: ['현아 선배와 개막 무대 리허설을 해요.', '개막 무대 리허설 성공!'],
    bookshop: ['준비하다 잠깐 쉬어 가요. 재희 선배와 도서실 고양이 책갈피를 찾아요.', '잘 쉬었어요. 다시 예술제 준비하러 가요!'],
    stairs: ['민주 선배와 5층 꿈다락까지 계단으로 올라가요.', '꿈다락에서 예술제 준비로 북적이는 학교가 다 보여요.'],
    interview: ['예술제가 끝나면 선배들은 취업 준비! AI 면접을 미리 체험해요.', '선배들의 면접 준비를 미리 맛봤어요.']
  };

  window.TOUR_FESTIVAL = {
    lines: LINES,
    title: '녹원예술제 D-1',
    depts: DEPTS,
    prologue: [
      { id: 'paperplane', role: '초대장 받기' },
      { id: 'career', role: '어느 부스부터 도울까?' }
    ],
    booths: [
      { dept: 'cafe',      main: [{ id: 'cafe', role: '부스 음료 시음' }, { id: 'bakery', role: '부스에 낼 빵 굽기' }],
                           bonus: [{ id: 'tea', role: '귀빈 차 대접' }] },
      { dept: 'erp',       main: [{ id: 'cashier', role: '계산대 연습' }, { id: 'logistics', role: '부스 물품 배달' }],
                           bonus: [{ id: 'typing', role: '안내문 입력' }, { id: 'rain', role: '참가자 명단 정리' }] },
      { dept: 'marketing', main: [{ id: 'ai', role: '부스 홍보 문구' }, { id: 'art', role: '포스터 색 맞추기' }],
                           bonus: [{ id: 'press', role: '예술제 특집호 취재' }, { id: 'goods', role: '부스 굿즈 만들기' }] },
      { dept: 'fintech',   main: [{ id: 'phishing', role: '가짜 결제 문자 막기' }, { id: 'reconcile', role: '부스 매출 맞추기' }],
                           bonus: [] }
    ],
    finale: { id: 'booths', role: '네 부스 자리 정하고 개막!' },
    life: [
      { id: 'curling' }, { id: 'target' }, { id: 'badminton' },
      { id: 'melody', role: '개막 무대 리허설' }, { id: 'bookshop' }, { id: 'stairs' }, { id: 'interview' }
    ]
  };

  /* 결과 화면의 학과 링크를 학과 부스에 맞춤 (게임 파일은 그대로 두고 여기서 한 번에) */
  const GAMES = window.TOUR_GAMES || {};
  for (const booth of window.TOUR_FESTIVAL.booths) {
    const dept = DEPTS[booth.dept];
    for (const { id } of [...booth.main, ...booth.bonus]) {
      if (!GAMES[id]) continue;
      GAMES[id].dept = booth.dept;
      GAMES[id].cta = { href: dept.href, label: `${dept.name} 알아보기 →` };
    }
  }
})();

/* ---------- 초대장: 첫 화면(AI로 지은 우리 학교)을 닫은 뒤 한 번 보여 줌 ----------
   본 적이 있으면 'gch-tour-invite-seen'에 '1'만 남깁니다(개인정보 없음). 도장판의 「초대장 다시 보기」로 다시 열 수 있어요.
   ?game= · ?room= · #floor-n 바로가기 링크로 들어오면 띄우지 않습니다. */
(function () {
  const SEEN = 'gch-tour-invite-seen';
  const dialog = document.getElementById('story-invite');
  const story = window.TOUR_FESTIVAL;
  if (!dialog || !story || typeof dialog.showModal !== 'function') return;
  const track = (name, naver) => window.tourTrack?.(name, {}, ['TourStory', naver]);

  const booths = dialog.querySelector('.invite-booths');
  for (const booth of story.booths) {
    const dept = story.depts[booth.dept];
    const li = document.createElement('li');
    li.style.setProperty('--dept', dept.color);
    const img = document.createElement('img');
    img.src = `img/games/stamps/${booth.main[0].id}.png?v=20261118`;
    img.alt = ''; img.width = 40; img.height = 40;
    const text = document.createElement('span');
    text.innerHTML = `<strong></strong><small></small>`;
    text.querySelector('strong').textContent = dept.name;
    text.querySelector('small').textContent = dept.job;
    li.append(img, text);
    booths.append(li);
  }

  function open() {
    if (dialog.open || document.querySelector('dialog[open]')) return;
    dialog.showModal();
    dialog.querySelector('.invite-go').focus({ preventScroll: true });
    try { localStorage.setItem(SEEN, '1'); } catch (e) { /* 저장 막힘 */ }
    track('tour_story_invite', 'Invite');
    window.TourFestivalReach?.('invite');
  }
  dialog.querySelector('.invite-go').addEventListener('click', () => {
    dialog.addEventListener('close', () => window.tourGame?.practice(story.prologue[0].id, document.getElementById('stamp-open')), { once: true });
    track('tour_story_first', 'First');
    dialog.close();
  });
  dialog.querySelector('.invite-later').addEventListener('click', () => dialog.close());
  dialog.querySelector('.invite-close').addEventListener('click', () => dialog.close());
  window.TourFestivalInvite = { open };

  const params = new URLSearchParams(location.search);
  if (params.has('game') || params.has('room') || /^#floor-/.test(location.hash)) return;
  let seen = false;
  try { seen = localStorage.getItem(SEEN) === '1'; } catch (e) { seen = true; }
  if (seen) return;
  // 첫 화면(ai-cover.js)은 이 파일보다 늦게 열리므로, 문서가 준비된 뒤에 첫 화면이 열려 있는지 봅니다.
  const later = () => setTimeout(open, 450);   // 지도까지 스크롤한 다음에
  const schedule = () => {
    const cover = document.getElementById('ai-cover');
    if (cover?.open) cover.addEventListener('close', later, { once: true });
    else later();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
})();

/* ---------- 개막 엔딩과 장별 도달 분석 ----------
   - 5층 학생회실 「부스 자리, 기억나?」를 처음 끝내면, 결과 창을 닫을 때 개막 화면을 보여 줍니다.
     현황판의 「개막 장면 다시 보기」로 다시 볼 수 있어요.
   - 장별 도달(초대장 → 첫 미션 → 부스 고르기 → 배지 1·2·3·4개 → 개막)을 브라우저마다 한 번씩만 셉니다.
     보내는 값은 장 이름뿐이고 이름·연락처·기기 식별값은 보내지 않습니다. */
(function () {
  const story = window.TOUR_FESTIVAL;
  const dialog = document.getElementById('story-ending');
  if (!story || !dialog || typeof dialog.showModal !== 'function') return;
  const CH_KEY = 'gch-tour-story-chapters';
  const ORDER = ['invite', 'first_mission', 'booth_pick', 'badge_1', 'badge_2', 'badge_3', 'badge_4', 'opening'];
  const stamps = () => window.tourGame?.stamps() || {};
  const pick = () => { try { return localStorage.getItem('gch-tour-story-pick'); } catch (e) { return null; } };

  function reach(chapter) {
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem(CH_KEY) || '[]'); } catch (e) { seen = []; }
    if (!Array.isArray(seen) || seen.includes(chapter)) return;
    seen.push(chapter);
    try { localStorage.setItem(CH_KEY, JSON.stringify(seen)); } catch (e) { return; }   // 저장 못 하면 중복 집계를 피해 보내지 않음
    window.tourTrack?.('tour_story_chapter', { chapter, chapter_no: ORDER.indexOf(chapter) + 1 }, ['TourStory', 'Ch_' + chapter]);
  }
  window.TourFestivalReach = reach;

  function checkChapters() {
    const s = stamps();
    if (s[story.prologue[0].id]) reach('first_mission');
    if (s[story.prologue[1].id]) reach('booth_pick');
    const badges = story.booths.filter(b => b.main.every(m => s[m.id])).length;
    for (let i = 1; i <= badges; i++) reach('badge_' + i);
    if (s[story.finale.id]) reach('opening');
  }

  function render() {
    const s = stamps();
    const helped = story.booths.filter(b => b.main.some(m => s[m.id]));
    dialog.querySelector('.ending-thanks').textContent = helped.length
      ? `네 덕분에 부스 ${helped.length}곳이 제때 문을 열었어! 오늘 정말 고마웠어. 내년에는 우리 학교 후배로 다시 만나자.`
      : '부스 자리가 다 정해졌어! 이제 부스들을 돌며 예술제를 즐겨 봐. 내년에는 우리 학교 후배로 다시 만나자.';
    const list = dialog.querySelector('.ending-booths');
    list.replaceChildren();
    for (const booth of story.booths) {
      const dept = story.depts[booth.dept];
      const done = booth.main.every(m => s[m.id]);
      const li = document.createElement('li');
      li.style.setProperty('--dept', dept.color);
      li.classList.toggle('is-off', !booth.main.some(m => s[m.id]));
      const img = document.createElement('img');
      img.src = `img/games/stamps/${booth.main[0].id}.png?v=20261118`;
      img.alt = ''; img.width = 40; img.height = 40;
      const text = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = dept.name;
      const small = document.createElement('small');
      small.textContent = done ? '배지 획득 · ' + dept.booth + ' 완료' : booth.main.some(m => s[m.id]) ? dept.booth + ' 조금 도움' : '다음에 들러 줘';
      text.append(name, small);
      li.append(img, text);
      list.append(li);
    }
    const p = pick();
    const dept = story.depts[p];
    const link = dialog.querySelector('.ending-dept');
    dialog.querySelector('.ending-pick').textContent = dept
      ? `처음 추천받은 부스는 ${dept.name}였어요. 이 학과에서 3년 동안 무엇을 배우는지 살펴보세요.`
      : '네 학과에서 3년 동안 무엇을 배우는지 살펴보세요.';
    link.href = dept ? dept.href : '../index.html#departments';
    link.textContent = dept ? `${dept.name} 알아보기 →` : '4개 학과 알아보기 →';
  }

  function open() {
    if (dialog.open || document.querySelector('dialog[open]')) return;
    render();
    dialog.showModal();
    dialog.querySelector('.ending-dept').focus({ preventScroll: true });
    window.tourTrack?.('tour_story_ending', {}, ['TourStory', 'Ending']);
  }
  window.TourFestivalEnding = { open };

  dialog.querySelector('.ending-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.ending-more').addEventListener('click', () => {
    dialog.addEventListener('close', () => window.tourGame?.openBoard(), { once: true });
    dialog.close();
  });
  dialog.querySelector('.ending-dept').addEventListener('click', () => window.tourTrack?.('tour_story_ending_cta', { cta: 'dept', transport_type: 'beacon' }, ['TourStory', 'EndingDept']));

  // 개막 미션을 처음 끝냈을 때만 개막 화면을 자동으로 띄웁니다(본 적 있음 표시만 저장, 도장 초기화 때 지움).
  const SHOWN = 'gch-tour-story-ending-seen';
  const gameDialog = document.getElementById('game');
  document.addEventListener('tour:game-result', e => {
    checkChapters();
    if (e.detail?.id !== story.finale.id) return;
    try {
      if (localStorage.getItem(SHOWN) === '1') return;
      localStorage.setItem(SHOWN, '1');
    } catch (err) { return; }
    gameDialog?.addEventListener('close', () => setTimeout(open, 200), { once: true });
  });
  document.addEventListener('tour:stamps-reset', () => { try { localStorage.removeItem(SHOWN); } catch (e) { /* 무시 */ } });
})();
