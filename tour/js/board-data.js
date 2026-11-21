// 매일 06:00(한국 시간) 학교 홈페이지에서 일정·급식을 읽어 data/school-feed.json을 갱신합니다.
// 수동 갱신은 저장소 루트에서 node tour/tools/fetch_school_feed.mjs 를 실행하세요.
// GitHub Actions → 학교 일정·급식 → Run workflow 에서도 갱신할 수 있습니다.
// posters에 포스터 그림 경로와 제목을 넣고, careers에는 홈페이지의 기준일과 수치를 함께 옮기세요.
// instagram.accounts에 계정 이름과 주소를 넣으세요. 주소가 비어 있으면 그 버튼은 숨겨집니다.
window.TourBoardData = {
  title: '군산여상 게시판',
  events: {
    title: '📅 이달의 학교 행사',
    url: 'https://school.jbedu.kr/gunsan-gch/M010401/index.do',
    link: '홈페이지 학사일정',
    rows: [
      ['5일', '동아리 체험 (예시)'],
      ['14일', '예술제 작품 전시 (예시)'],
      ['23일', '진로 탐색의 날 (예시)']
    ]
  },
  meals: {
    title: '🍚 오늘의 급식',
    url: 'https://school.jbedu.kr/gunsan-gch/M01040402/index.do',
    link: '이달의 식단',
    fallback: '학교 홈페이지에서 식단을 확인해 주세요.'
  },
  posters: {
    title: '📌 포스터',
    images: [{ src: 'img/board/festival.png', title: '녹원예술제' }]
  },
  careers: {
    title: '💼 취업·진학 현황',
    date: '2026년 고3 · 2026. 11. 17. 기준',
    rows: [
      '기업 최종 합격 9명',   // 홈페이지 site-data.js currentSeniors.finals 기업 합계(6+3)
      '육군 부사관 최종 합격 4명',
      '공군 부사관 최종 합격 1명',
      '지역인재 9급 공무원 지원 4명 · 1차 합격 3명'
    ],
    url: '../index.html#careers'
  },
  instagram: {
    title: '📷 학교 인스타',
    // 계정을 더하려면 { name, url } 한 줄 추가 (주소의 ?뒤 추적 값은 빼고 넣기)
    accounts: [
      { name: '군산여상 공식', url: 'https://www.instagram.com/gys_official_/' },
      { name: '방송부', url: 'https://www.instagram.com/gysbs.official/' }
    ]
  }
};
