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

  window.TOUR_FESTIVAL = {
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
