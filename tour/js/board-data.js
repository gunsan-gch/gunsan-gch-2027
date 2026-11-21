// events의 날짜와 행사명을 고치고, 실제 일정이 확정되면 '(예시)'를 지우세요.
// posters에 포스터 그림 경로와 제목을 넣고, careers에는 홈페이지의 기준일과 수치를 함께 옮기세요.
// instagram의 name과 url에 공식 계정명과 주소를 넣으세요. 주소가 비어 있으면 버튼이 숨겨집니다.
window.TourBoardData = {
  title: '군산여상 게시판',
  events: {
    title: '📅 이달의 학교 행사',
    rows: [
      ['5일', '동아리 체험 (예시)'],
      ['14일', '예술제 작품 전시 (예시)'],
      ['23일', '진로 탐색의 날 (예시)']
    ]
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
  instagram: { title: '📷 학교 인스타', name: '군산여상', url: '' }
};
