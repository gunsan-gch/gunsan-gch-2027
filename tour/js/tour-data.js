/* =========================================================================
   픽셀 학교 투어 — 장면(야외·층) 데이터
   공간 이름을 바꾸거나 추가할 때는 이 파일만 수정하면 됩니다.
   (지도 이름표·공간 카드·검색·상세 창이 모두 이 목록을 사용합니다)

   좌표: 배경 그림의 왼쪽 위가 (0, 0), 오른쪽 아래가 (100, 100)인 백분율입니다.
         실제 건물의 실측 좌표가 아니라 그림 위의 위치입니다.
   - [x, y]                    at(이름표 위치), anchor(캐릭터가 걸어가 멈출 복도 위치), start
   stairs: 건물 안 계단 목록 { key, name, at(층 버튼 위치), anchor(계단 앞 복도) }
           위·아래층에 같은 key의 계단이 있으면 그 층으로 이어집니다 (main 주계단 · west 왼쪽 위 · center 가운데)
   - [왼쪽, 위, 너비, 높이]     walkAreas(걸을 수 있는 영역), walkObstacles(못 지나가는 기둥 등), rect
   공간 항목:
   - name      공간 이름 (2026학년도 학교배치도 기준)
   - w         이름표 너비 (그림 너비 대비 %)
   - status    '개편 예정' 처럼 표시할 상태 (없으면 '현재 공간')
   - current   개편 예정 공간의 현재 이름 (검색에도 쓰입니다)
   - note      이름표 아래 작은 글씨
   - facility  true면 E/L·화장실·계단·창고 같은 편의시설·작은 공간 (아래 공간 카드 대신 작은 버튼으로 표시, 검색은 됩니다)
   - rect      상세 창에 보여 줄 그림 범위 (없으면 이름표 주변을 자동으로 잘라 씁니다)
   - photo     상세 창에 그림 대신 보여 줄 사진 (photoKind: 'real'이면 실제 사진, 없으면 조성 예시 이미지로 안내)
   - wide      true면 상세 창을 넓게 열어 사진 전체를 보여 줌
   - photos    실제 공간 사진 목록 (여러 장이면 ‹ › 버튼·밀기로 넘겨 봄, 상세 창은 넓게 열림)
   - quiet     true면 이름만 표시 (눌러도 설명 창 없음, 공간 카드에서 빠짐, 검색하면 그 앞까지 걸어가기만 함)
   - overflow  true면 칸이 좁아도 글씨를 줄이지 않고 한 줄로 (칸 밖으로 나가도 됨)
   - desc      상세 설명 (없으면 기본 문구)
   - link      상세 창 아래에 띄울 바로가기 버튼 { href, label } (새 탭으로 열림)
   - where     같은 층에 같은 이름이 둘 이상일 때 구분용 위치 (검색 결과·상세 창에 표시)
   - elevator  true면 엘리베이터 — 누르거나 앞에서 Enter를 누르면 갈 층을 고름 (E/L이 없는 위층은 그 층의 elevatorStair 계단에서 나옴)
   - door      야외의 층 입구 이름표 — 누르면 그 입구로 걸어가 건물 안으로 들어감 (값은 화면 읽기용 설명, 카드·검색에서 빠짐)
   ========================================================================= */

const FACILITY_IMG = '../assets/img/facilities/';

window.TOUR_SCENES = {
  outdoor: {
    name: '야외',
    image: 'img/outdoor.webp',
    notice: {
      title: '여기는 잔디마당',
      text: '중앙현관으로 들어가면 1층, 왼쪽 계단으로 올라가면 2층이에요. 「학교 전경 보기」를 누르면 드론으로 찍은 학교 사진도 볼 수 있어요.'
    },
    start: [54.2, 47],
    walkAreas: [[5, 35, 90, 53], [51.5, 31, 5.2, 15], [33.6, 28.5, 3.4, 8]],
    walkObstacles: [[6.8, 38, 2.8, 6], [49, 38, 2.3, 6], [57.2, 38, 2.4, 6], [90.8, 38, 2.6, 6], [7, 75, 4, 8], [88.8, 75, 4, 8]],
    hints: [
      { at: [54.2, 33], dir: 'up', text: '중앙현관' },
      { at: [35.3, 33], dir: 'up', text: '바깥 계단' }
    ],
    rooms: [
      { name: '학교 전경 보기', at: [38, 58], w: 10, anchor: [42.5, 58], status: '실제 사진', note: '드론 사진', photos: ['img/drone.jpg', 'img/drone-2.jpg', 'img/drone-3.jpg', 'img/drone-4.jpg'], spot: true,
        desc: '드론으로 하늘에서 찍은 우리 학교 전경입니다.' },
      { name: '1층', door: '중앙현관으로 1층 들어가기', at: [54.3, 22.5], w: 4, anchor: [54.2, 32.2] },
      { name: '2층', door: '바깥 계단으로 2층 올라가기', at: [35.3, 23], w: 4, anchor: [35.3, 29.4] }
    ]
  },

  1: {
    name: '1층',
    image: 'img/floor1.webp?v=20261025',
    notice: {
      title: '1층 · 실습실과 도서실',
      text: '정보처리실, 전산회계1실, 도서실, 식생활 교육관이 있어요. 조리제빵실과 카페실습실은 새로 꾸밀 공간이에요. 중앙현관으로 나가면 잔디마당이에요.'
    },
    start: [26.4, 22],
    stairs: [
      { key: 'main', name: '주계단', at: [65, 8], anchor: [65, 20] },
      { key: 'west', name: '왼쪽 위 계단', at: [11.4, 5], anchor: [13.3, 18] },
      { key: 'center', name: '가운데 계단', at: [56.5, 65.7], anchor: [56, 72] }
    ],
    walkAreas: [[12.5, 16, 85, 11.5], [2.5, 19, 11, 8.5], [2.5, 69, 72.5, 6.5], [68.2, 16, 6.8, 61], [54.5, 75, 20.3, 16.5]],
    walkObstacles: [[67.9, 62.5, 1.4, 5], [73.7, 62.5, 1.5, 5], [73.7, 85.5, 1.5, 5.5], [53.3, 78, 1.7, 6], [53.3, 86, 1.7, 5]],
    hints: [
      { at: [71.5, 38], dir: 'down', text: '도서실 · 중앙현관' },
      { at: [71.5, 72], dir: 'left', text: '아래쪽 복도' },
      { at: [55, 72], dir: 'right' },
      { at: [63, 90], dir: 'down', text: '야외로 나가기' }
    ],
    rooms: [
      { name: '조리실', quiet: true, at: [7, 15], w: 8, anchor: [7, 23], rect: [2, 4, 9, 14],
        desc: '1층 왼쪽 별도 구역의 조리실입니다. 개편 예정인 조리제빵실과는 다른 공간입니다.' },
      { name: '조리제빵실', at: [26.4, 8.2], w: 20, anchor: [30.4, 22], rect: [14, 2, 24, 13],
        status: '개편 예정', current: '가사실 · 가사준비실', note: '개편 예정', photo: FACILITY_IMG + 'bakery-lab.webp', wide: true,
        desc: '현재 가사실과 가사준비실 두 구역을 합쳐 조리제빵실로 조성할 예정입니다. 2027년 여름방학 중 완공을 목표로 합니다.' },
      { name: '정보처리실', at: [47, 8.2], w: 15, anchor: [44.3, 22],
        photos: ['img/rooms/info-1.jpg', 'img/rooms/info-2.jpg'],
        desc: '학생마다 컴퓨터 한 대씩 쓰며 정보처리와 사무 프로그램을 실습하는 교실입니다.' },
      { name: '동아리실', at: [60.8, 8.2], w: 5.5, anchor: [60.3, 22] },
      { name: '화장실', quiet: true, at: [72, 7.8], w: 6, anchor: [72, 22], facility: true, where: '위쪽 복도' },
      { name: '문서작성실', at: [87, 8.2], w: 20, anchor: [82.7, 22] },
      { name: '카페실습실', at: [35.6, 36.7], w: 14, anchor: [26.5, 24], rect: [25, 28, 20, 16],
        status: '개편 예정', current: '기업자원관리실', note: '개편 예정', photo: FACILITY_IMG + 'cafe-lab.webp', wide: true,
        desc: '현재 기업자원관리실을 카페실습실로 조성할 예정입니다. 2027년 여름방학 중 완공을 목표로 합니다.' },
      { name: '전산회계1실', at: [51.5, 36], w: 11, anchor: [46.2, 24],
        photos: ['img/rooms/acct-1.jpg', 'img/rooms/acct-2.jpg'],
        desc: '학생마다 컴퓨터 한 대씩 쓰며 전산회계 프로그램으로 회계 실무를 익히고 자격증을 준비하는 실습실입니다.' },
      { name: '교육정보부실', at: [61.5, 35.5], w: 5.5, anchor: [62.3, 24], status: '선생님 교무실',
        desc: '교육정보부 선생님들이 근무하는 교무실입니다. 학교 정보화 기기와 교육 정보 업무를 맡고 있어요.' },
      { name: '경비실', quiet: true, at: [77.9, 36.9], w: 5, anchor: [80.3, 24], rect: [75, 29, 7, 15] },
      { name: '사무자동화실', at: [89.4, 36.9], w: 13, anchor: [90.8, 24], rect: [81.5, 29, 16.5, 15] },
      { name: '식생활 교육관', at: [13.5, 47.5], w: 20, anchor: [6, 26], rect: [2, 30, 22, 35],
        photos: ['img/rooms/dining-1.jpg', 'img/rooms/dining-2.jpg', 'img/rooms/dining-3.jpg'],
        desc: '학생들이 함께 점심을 먹는 급식 공간입니다.' },
      { name: '창업동아리 지원센터', at: [6, 84], w: 7, anchor: [6.1, 72] },
      { name: '교장실', quiet: true, at: [32, 84], w: 9, anchor: [31.4, 72] },
      { name: '행정실', quiet: true, at: [46, 84], w: 11, anchor: [45.2, 72] },
      { name: '중앙현관', quiet: true, at: [63, 84], w: 12, anchor: [63, 84] },
      { name: '도서실', at: [86.5, 78], w: 20, anchor: [72.5, 78], rect: [75, 66, 23, 24],
        photos: ['img/rooms/library-1.jpg', 'img/rooms/library-2.jpg', 'img/rooms/library-3.jpg', 'img/rooms/library-4.jpg', 'img/rooms/library-5.jpg'],
        desc: '책을 읽고 모둠 활동도 할 수 있는 학교 도서실 「녹원책방」입니다.' },
      { name: '동아리실(풍물)', at: [93, 91], w: 9, anchor: [70.6, 88] },
      { name: '야외 테라스', at: [45, 53], w: 10, anchor: [69.3, 53], rect: [25, 44, 43, 21],
        desc: '카페실습실 아래쪽의 야외 공간입니다. 오른쪽 복도 쪽 문으로 드나들어요.' },
      { name: '외부 계단', at: [86, 53], w: 9, anchor: [73.5, 53], rect: [74, 45, 24, 18], note: '학교 밖으로 내려가는 계단',
        desc: '경비실 아래쪽, 학교 밖으로 내려가는 바깥 계단입니다. 왼쪽에서 오른쪽으로 내려가며, 가운데 난간으로 두 줄이 나뉘어 있어요.' },
      { name: 'E/L', elevator: true, at: [42.5, 65.7], w: 3, anchor: [42.5, 72], facility: true },
      { name: '화장실', quiet: true, at: [47.6, 65.7], w: 6, anchor: [47.6, 72], facility: true, where: '아래쪽 복도' }
    ]
  },

  2: {
    name: '2층',
    image: 'img/floor2.webp?v=20261025',
    notice: {
      title: '2층 · 교무실과 온누리홀',
      text: '교무실, 취업지원센터, 음악실, 보건실, 온누리홀이 있어요. 문서고 왼쪽 계단으로 내려가면 잔디마당이에요.'
    },
    start: [45, 19],
    stairs: [
      { key: 'main', name: '주계단', at: [64.8, 7], anchor: [64.8, 19] },
      { key: 'west', name: '왼쪽 위 계단', at: [11, 4.5], anchor: [13.6, 17] },
      { key: 'center', name: '가운데 계단', at: [59, 64.8], anchor: [59, 71.5] }
    ],
    walkAreas: [[12.5, 15.5, 78, 7], [12, 15.5, 3.2, 59], [2, 68.9, 68.5, 6.6], [66.3, 15.5, 4.7, 76], [13.4, 74, 8.2, 16],
      [89.15, 2.6, 1.45, 13.5]],   // 마지막: 취업지원센터 오른쪽 짧은 세로 통로 (면접지도실 문 앞)
    walkObstacles: [[65.5, 62, 1.3, 4.6]],
    hints: [
      { at: [68.6, 35], dir: 'down', text: '온누리홀 · 보건실 방향' },
      { at: [68.6, 62], dir: 'up', text: '교무실 · 워크룸 방향' },
      { at: [17.5, 76.5], dir: 'down', text: '바깥 계단 · 야외로' }
    ],
    rooms: [
      { name: '동아리실(밴드)', at: [6, 12], w: 8, anchor: [13.5, 17] },
      { name: '체력단련실', at: [6, 27], w: 8, anchor: [13.5, 32.8] },
      { name: '음악준비실', at: [6, 40], w: 8, anchor: [13.5, 41.2] },
      { name: '음악실', at: [6, 55], w: 8, anchor: [13.5, 49.4] },
      { name: '워크룸1', at: [20, 7], w: 8, anchor: [18.4, 19] },
      { name: '워크룸2', at: [32, 7], w: 8, anchor: [29.9, 19] },
      { name: '워크룸3', at: [44, 7], w: 8, anchor: [41.9, 19] },
      { name: '워크룸4', at: [55, 7], w: 8, anchor: [57.9, 19] },
      { name: '화장실', quiet: true, at: [72.5, 7], w: 6, anchor: [72.5, 19], facility: true, where: '위쪽 복도' },
      { name: '취업지원센터', at: [85, 7], w: 10, anchor: [80.9, 19] },
      { name: '면접지도실', at: [96, 5], w: 4, anchor: [89.85, 8.3], overflow: true },
      { name: '파우더룸', at: [94.6, 20.5], w: 4, anchor: [89.9, 18.3], overflow: true },
      { name: '경영실습실', at: [23.5, 32], w: 9, anchor: [23.5, 19],
        desc: '1-2반 공개수업 「신입사원의 첫 업무 보고」가 열리는 실습실입니다. 아래 버튼으로 수업 실습 페이지를 볼 수 있어요.',
        link: { href: 'https://gunsan-gch.github.io/word-practice/', label: '공개수업 실습 페이지 열기 ↗' } },
      { name: '평가관리실', quiet: true, at: [33.5, 32], w: 4, anchor: [34.5, 19] },
      { name: '교무실', at: [51, 32], w: 14, anchor: [40.6, 19], rect: [36, 24, 30, 16], note: '교무 · 연구 · 교육과정', status: '선생님 교무실',
        desc: '선생님들이 근무하는 교무실입니다. 교무·연구·교육과정 업무를 맡은 선생님들이 수업과 학사 일정을 준비해요.' },
      { name: '직업교육부실', at: [76.5, 32], w: 8, anchor: [77.1, 19], status: '선생님 교무실',
        desc: '직업교육부 선생님들이 근무하는 교무실입니다. 전공 실습과 직업교육 관련 업무를 맡고 있어요.' },
      { name: '취업지원부실', at: [90, 32], w: 12, anchor: [83.1, 19], status: '선생님 교무실',
        desc: '취업지원부 선생님들이 근무하는 교무실입니다. 학생들의 취업 준비와 진로 상담을 돕는 업무를 맡고 있어요.' },
      { name: '화장실', quiet: true, at: [59, 57], w: 5, anchor: [68.6, 57], facility: true, where: '가운데' },
      { name: 'E/L', elevator: true, at: [37, 64], w: 3, anchor: [37, 71], facility: true },
      { name: '발간실', quiet: true, at: [44, 64], w: 5, anchor: [44, 71] },
      { name: '온누리홀', at: [86, 75], w: 16, anchor: [70.2, 70.2], rect: [72, 61, 26, 30] },
      { name: '탈의실', quiet: true, at: [3.8, 84], w: 4, anchor: [5, 71], facility: true },
      { name: '화장실', quiet: true, at: [9.5, 84], w: 3, anchor: [10, 71], facility: true, where: '왼쪽 아래' },
      { name: '문서고', quiet: true, at: [30, 84], w: 7, anchor: [31.4, 71] },
      { name: '원격화상교실', at: [39.5, 84], w: 6, anchor: [37.2, 71] },
      { name: '방송 조작실', at: [47, 84], w: 6, anchor: [43.8, 71] },
      { name: '교육실', at: [54.5, 84], w: 5, anchor: [55, 71] },
      { name: '보건실', at: [61, 84], w: 5, anchor: [61.6, 71] }
    ]
  },

  3: {
    name: '3층',
    image: 'img/floor3.webp?v=20261025',
    notice: {
      title: '3층 · 3학년 교실과 체육관',
      text: '3학년 교실, 과학실험실, 역사관, 체육관이 있어요. 세무실무실습실은 AI비즈니스실로 새로 꾸밀 예정이에요.'
    },
    start: [51, 25],
    stairs: [
      { key: 'main', name: '주계단', at: [66.3, 10], anchor: [66.3, 25] },
      { key: 'west', name: '왼쪽 위 계단', at: [12.7, 6], anchor: [16.3, 23] },
      { key: 'center', name: '가운데 계단', at: [61.5, 66.5], anchor: [61.5, 75.5] }
    ],
    walkAreas: [[15.5, 20.8, 82.5, 9], [67.8, 20.8, 6.6, 52], [74.4, 47.8, 23.6, 7.8], [2, 72, 72.5, 7], [74.4, 73.9, 23.6, 4.7]],
    walkObstacles: [],
    hints: [
      { at: [71, 40], dir: 'down', text: 'AI비즈니스실 · 아래쪽 복도' },
      { at: [71, 66], dir: 'up', text: '위쪽 복도' }
    ],
    rooms: [
      { name: '체육관', at: [8.5, 37], w: 10, anchor: [16.5, 25], rect: [2, 4, 14, 67],
        desc: '3층 체육관입니다.' },
      { name: '과학실험실', at: [25, 13], w: 12, anchor: [21.2, 25],
        photos: ['img/rooms/science-1.jpg', 'img/rooms/science-2.jpg', 'img/rooms/science-3.jpg', 'img/rooms/science-4.jpg'] },
      { name: '과학준비실', quiet: true, at: [36.5, 13], w: 4.5, anchor: [36, 25] },
      { name: '드림스페이스', at: [51, 13], w: 16, anchor: [43.9, 25] },
      { name: '화장실', quiet: true, at: [72.5, 13], w: 6, anchor: [72.5, 25], facility: true, where: '위쪽 복도' },
      { name: '역사관', at: [88, 13], w: 14, anchor: [80.8, 25] },
      { name: '3-1 교실', at: [21.5, 39], w: 8, anchor: [26.5, 25] },
      { name: '3-2 교실', at: [35, 39], w: 8, anchor: [40.6, 25] },
      { name: '3-3 교실', at: [49.5, 39], w: 8, anchor: [45.7, 25] },
      { name: '3-4 교실', at: [80.5, 39], w: 8, anchor: [78.8, 25] },
      { name: '3-5 교실', at: [92.5, 39], w: 8, anchor: [89.8, 25] },
      { name: 'AI비즈니스실', at: [86.5, 65], w: 14, anchor: [79.2, 51.5], rect: [75, 56, 23, 17], status: '개편 예정', current: '세무실무실습실', note: '개편 예정', photo: FACILITY_IMG + 'ai-business.webp', wide: true,
        desc: '현재 3층 세무실무실습실이 AI비즈니스실로 개편될 예정입니다. 2027년 여름방학 중 완공을 목표로 합니다.' },
      { name: 'E/L', elevator: true, at: [38, 66.5], w: 3, anchor: [38, 75.5], facility: true },
      { name: '자기주도학습실(1)', at: [47.5, 66], w: 10, anchor: [47.5, 75.5] },
      { name: '화장실', quiet: true, at: [61, 58], w: 5, anchor: [71, 60], facility: true, where: '가운데' },
      { name: '화장실', quiet: true, at: [4.5, 87], w: 4, anchor: [4.8, 75.5], facility: true, where: '왼쪽 끝' },
      { name: '탈의실', quiet: true, at: [11, 87], w: 5, anchor: [9.6, 75.5], facility: true },
      { name: '화장실', quiet: true, at: [16, 87], w: 3, anchor: [16.3, 75.5], facility: true, where: '탈의실 옆' },
      { name: '체육실', at: [20.5, 87], w: 4.5, anchor: [20.5, 75.5] },
      { name: '통합교육지원 2반', at: [40, 87], w: 8, anchor: [42.9, 75.5] },
      { name: '통합교육지원 1반', at: [50.5, 87], w: 8, anchor: [53.1, 75.5] },
      { name: '3-6 교실', at: [62, 87], w: 8, anchor: [58.1, 75.5] },
      { name: '3학년부실', at: [73.5, 87], w: 7, anchor: [70.5, 75.5], status: '선생님 교무실',
        desc: '3학년 선생님들이 근무하는 교무실입니다. 3학년 교실과 같은 3층에 있어요.' },
      { name: '자기주도학습실(2)', at: [83, 87], w: 9, anchor: [80.6, 75.5] },
      { name: '자기주도학습실(3)', at: [93.5, 87], w: 9, anchor: [90.2, 75.5] }
    ]
  },

  4: {
    name: '4층',
    image: 'img/floor4.webp?v=20261025',
    notice: {
      title: '4층 · 1학년 교실',
      text: '1학년 교실, 전산회계2·3실, 금융실습실, 상담실이 있어요. 왼쪽 체육관 2층에서는 아래 코트가 내려다보여요.'
    },
    start: [45, 24.5],
    stairs: [
      { key: 'main', name: '주계단', at: [67.5, 10], anchor: [67.5, 24.5] },
      { key: 'center', name: '가운데 계단', at: [60.6, 66], anchor: [60.6, 77.5] }
    ],
    walkAreas: [[17.5, 20.8, 81, 7.8], [64.2, 20.8, 7.2, 29.4], [67.5, 50, 3.9, 25], [71.4, 50, 26.6, 5.6], [17.5, 74.6, 80.5, 6.2]],
    walkObstacles: [],
    hints: [
      { at: [67.8, 40], dir: 'down', text: '1-7 · 전산회계실 방향' },
      { at: [69.4, 66], dir: 'up', text: '1-1~1-6 교실 방향' }
    ],
    rooms: [
      { name: '체육관 2층', at: [9, 40], w: 10, anchor: [18.5, 24.5], rect: [2, 3, 15, 76], note: '아래 코트 · 보행 불가',
        desc: '체육관 2층에서 아래 코트를 내려다보는 공간입니다. 코트 바닥은 4층에서 걸을 수 있는 공간이 아닙니다.' },
      { name: '동아리실(춤나래)', at: [20.5, 10], w: 5, anchor: [19.6, 24.5] },
      { name: '커리어존', at: [32, 10], w: 12, anchor: [35.1, 24.5],
        photos: ['img/rooms/career-2.jpg', 'img/rooms/career-3.jpg', 'img/rooms/career-1.jpg'] },
      { name: '금융실습실', at: [48.5, 10], w: 11, anchor: [45.7, 24.5] },
      { name: 'WEE 클래스(상담실)', at: [60, 10], w: 7, anchor: [59.8, 24.5] },
      { name: '화장실', quiet: true, at: [75, 10], w: 7, anchor: [75, 24.5], facility: true, where: '위쪽 복도' },
      { name: '교육복지실', at: [87, 10], w: 10, anchor: [83.8, 24.5],
        photos: ['img/rooms/welfare-1.jpg', 'img/rooms/welfare-2.jpg'],
        desc: '교육복지 프로그램과 상담이 이루어지는 공간입니다.' },
      { name: 'AI 면접실', at: [96.5, 10], w: 4, anchor: [95.2, 24.5] },
      { name: '1-1 교실', at: [23, 38], w: 8, anchor: [27.3, 24.5] },
      { name: '1-2 교실', at: [33.5, 38], w: 8, anchor: [37.7, 24.5] },
      { name: '1-3 교실', at: [44, 38], w: 8, anchor: [48, 24.5] },
      { name: '1-4 교실', at: [55, 38], w: 8, anchor: [58.6, 24.5] },
      { name: '1-5 교실', at: [79, 38], w: 8, anchor: [76.8, 24.5] },
      { name: '1-6 교실', at: [92, 38], w: 8, anchor: [89.1, 24.5] },
      { name: '화장실', quiet: true, at: [60, 55.5], w: 5, anchor: [69.4, 55], facility: true, where: '가운데' },
      { name: 'E/L', elevator: true, at: [35, 66], w: 3, anchor: [35, 77], facility: true },
      { name: '화장실', quiet: true, at: [40.5, 66], w: 4, anchor: [41.4, 77], facility: true, where: 'E/L 옆' },
      { name: '상담실1', at: [45.5, 66], w: 4.5, anchor: [47.3, 77] },
      { name: '상담실2', at: [53.3, 66], w: 4.5, anchor: [50.8, 77] },
      { name: '전산회계3실', at: [81.5, 64], w: 14, anchor: [89.1, 52.8] },
      { name: '여교사 휴게실', at: [94.5, 64], w: 6, anchor: [93.4, 52.8] },
      { name: '1학년부실', at: [39, 89], w: 9, anchor: [35, 77], status: '선생님 교무실',
        desc: '1학년 선생님들이 근무하는 교무실입니다. 1학년 교실과 같은 4층에 있어요.' },
      { name: '전산회계2실', at: [53, 89], w: 11, anchor: [47.8, 77] },
      { name: '인성인권안전부실', at: [66.5, 89], w: 11, anchor: [61.2, 77], status: '선생님 교무실',
        desc: '인성인권안전부 선생님들이 근무하는 교무실입니다. 학생들의 생활 지도와 인성·인권·안전 교육을 맡고 있어요.' },
      { name: '1-7 교실', at: [79, 89], w: 8, anchor: [75.7, 77] },
      { name: '자기주도학습실(4)', at: [91.5, 89], w: 10, anchor: [86.7, 77] }
    ]
  },

  5: {
    name: '5층',
    image: 'img/floor5.webp?v=20261025',
    notice: {
      title: '5층 · 2학년 교실과 꿈다락',
      text: '2학년 교실, 미술실, 꿈다락, 예절실이 있어요. 아래쪽 옥상은 들어갈 수 없어요.'
    },
    start: [50, 24],
    stairs: [
      { key: 'main', name: '주계단', at: [65, 9], anchor: [65, 23.5] }
    ],
    elevatorStair: 'main',   // 엘리베이터는 4층까지 — 5층을 고르면 4층에서 주계단으로 올라온 것으로
    // 세로 통로는 옥상 문 앞까지만 (학생회 회의실 문이 이 통로에 있음). 문 뒤 옥상은 출입 불가라 걷는 영역에서 뺐습니다
    walkAreas: [[14.2, 21.1, 83.2, 7.6], [62.8, 27, 4.7, 27.2]],
    walkObstacles: [],
    hints: [],
    rooms: [
      { name: '미술실', at: [22, 11], w: 16, anchor: [28.2, 24] },
      { name: '2학년부실', at: [36, 11], w: 10, anchor: [39.3, 24], status: '선생님 교무실',
        desc: '2학년 선생님들이 근무하는 교무실입니다. 2학년 교실과 같은 5층에 있어요.' },
      { name: '꿈다락', at: [52, 11], w: 19, anchor: [44.7, 24],
        photos: ['img/rooms/dream-2.jpg', 'img/rooms/dream-3.jpg', 'img/rooms/dream-4.jpg', 'img/rooms/dream-1.jpg'],   // 라운지 → 공부방 → 입구
        desc: '편하게 쉬고 함께 공부할 수 있는 학생 공간입니다. 소파와 테이블이 놓인 넓은 라운지와, 모둠 활동이나 공부를 할 수 있는 작은 공부방이 있어요.' },
      { name: '화장실', quiet: true, at: [74.5, 11], w: 10, anchor: [74.5, 24], facility: true },
      { name: '예절실', at: [89, 11], w: 16, anchor: [82.4, 24],
        photos: ['img/rooms/etiquette-1.jpg', 'img/rooms/etiquette-2.jpg', 'img/rooms/etiquette-3.jpg'],
        desc: '병풍과 다탁이 놓인 전통 예절 공간과 긴 테이블이 함께 있는 교실입니다. 차를 우리고 함께 마시며 생활 예절과 테이블 매너를 배워요.' },
      { name: '2-1 교실', at: [20, 39], w: 10, anchor: [15, 24] },
      { name: '2-2 교실', at: [32, 39], w: 10, anchor: [27.5, 24] },
      { name: '2-3 교실', at: [44.5, 39], w: 10, anchor: [39.5, 24] },
      { name: '2-4 교실', at: [55.5, 39], w: 10, anchor: [51.5, 24] },
      { name: '학생회 회의실', at: [60.5, 39], w: 4, anchor: [63.5, 44] },
      { name: '2-5 교실', at: [77, 39], w: 10, anchor: [71.9, 24] },
      { name: '2-6 교실', at: [91, 39], w: 10, anchor: [84.9, 24] },
      { name: '옥상', quiet: true, at: [56, 75], w: 14, anchor: [65.2, 53], note: '출입 불가',
        desc: '학생이 이용할 수 없는 옥상입니다. 그림으로만 보여 드리며, 투어에서도 들어갈 수 없게 막아 두었어요.' }
    ]
  }
};

/* 장면 사이를 걸어서 오가는 연결 지점.
   from 장면에서 캐릭터가 region 안에 들어가면 to 장면의 spawn 위치로 이동합니다. */
window.TOUR_PORTALS = [
  { id: 'outdoor-entry', from: 'outdoor', to: '1', region: [51.8, 31, 4.6, 2], spawn: [63, 88], arrival: 'lobby-exit',
    message: '중앙현관으로 들어와 1층에 도착했어요.' },
  { id: 'lobby-exit', from: '1', to: 'outdoor', region: [59, 90, 8, 2], spawn: [54.2, 47], arrival: 'outdoor-entry',
    message: '중앙현관을 나와 잔디마당에 도착했어요.' },
  // 바깥 계단: 잔디마당 ↔ 2층 문서고 왼쪽 계단
  { id: 'outdoor-stair', from: 'outdoor', to: '2', region: [33.6, 28.5, 3.4, 1.5], spawn: [17.5, 72], arrival: 'stair-exit',
    message: '바깥 계단으로 올라와 2층에 도착했어요.' },
  // 계단에 들어서면 바로 야외로 (계단 그림 어디를 눌러도 나갈 수 있게)
  { id: 'stair-exit', from: '2', to: 'outdoor', region: [13.4, 76.5, 8.2, 13.5], spawn: [35.3, 33], arrival: 'outdoor-stair',
    message: '바깥 계단으로 내려와 잔디마당에 도착했어요.' }
];

/* 층 선택 버튼과 계단 순서 */
window.TOUR_ORDER = ['outdoor', '1', '2', '3', '4', '5'];
