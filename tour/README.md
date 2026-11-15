# 픽셀 학교 투어 (`tour/`)

캐릭터를 움직여 잔디마당 → 현관 → 1~5층을 둘러보는 학교 투어입니다.
학과·입학 안내 페이지(`../index.html`)와 같은 저장소에서 함께 게시되며, 빌드 과정 없이 파일만으로 동작합니다.

- 공개 주소: `https://계정.github.io/저장소명/tour/`
- 바로 열기: `tour/index.html#floor-3` (3층), `tour/index.html#outdoor` (야외)
- 특정 공간 열기: `tour/index.html?room=카페실습실` → 그 층으로 가서 캐릭터가 걸어간 뒤 설명이 열립니다.
  입학 안내 페이지의 실습실 카드 **'학교 투어에서 위치 보기'** 가 이 주소를 씁니다 (`site-data.js`의 `tourRoom`).
- 체험 게임 바로 열기: `tour/index.html?game=cafe` → 1층 카페실습실 「음료 만들기 체험」, `?game=ai` → 3층 AI비즈니스실 「AI 광고 문구 고르기」 창이 바로 열립니다. `?game=typing` → 1층 정보처리실 「타자 속도 재기」, `?game=rain` → 1층 사무자동화실 「타자 소나기」, `?game=bakery` → 1층 조리제빵실 「n.00초 빵 굽기」도 바로 열 수 있습니다.

`tour/index.html?game=career`로 4층 커리어존 「내 취향 찾기」를 바로 열 수 있습니다.
`tour/index.html?game=phishing`로 4층 금융실습실 「피싱 탐정」, `tour/index.html?game=cashier`로 1층 전산회계1실 「매점 계산왕」을 바로 열 수 있습니다.

## 폴더 구성

```
tour/
  index.html               화면 뼈대
  css/tour.css             디자인 (글꼴은 ../assets/fonts 공유)
  js/tour-data.js          ★ 층별 공간 이름·위치·걷는 영역 — 보통 이 파일만 수정
  js/motion.js             캐릭터 이동·길찾기
  js/camera.js             확대·축소·끌어서 이동
  js/labels.js             지도 위 공간 이름표
  js/tour.js               층 전환, 검색, 상세 창, 계단·현관 연결
  js/analytics.js          방문 분석 (GA4·네이버) 이벤트 보내기
  js/games.js              ★ 체험 게임 틀 — 게임 창 열기·닫기, 결과 화면, 도장 저장(localStorage), 분석 이벤트
  js/game-cafe.js          카페실습실 「음료 만들기 체험」 (주문·재료·문구는 파일 맨 위에서 수정)
  js/game-ai.js            AI비즈니스실 「AI 광고 문구 고르기」 (상품·문구·좋아요 수는 파일 맨 위에서 수정)
  js/game-typing.js        정보처리실 「타자 속도 재기」 (문장·별 기준은 파일 맨 위에서 수정)
  js/game-rain.js          사무자동화실 「타자 소나기」 (낱말·아이템·규칙은 파일 맨 위에서 수정)
  js/game-bakery.js        조리제빵실 「n.00초 빵 굽기」 (목표 시간·별 기준은 파일 맨 위에서 수정)
  js/game-career.js        커리어존 「내 취향 찾기」 (7문항·답변·학과 활동은 파일 맨 위에서 수정)
  js/game-phishing.js      금융실습실 「피싱 탐정」 (문자 16통·보상·별 기준은 파일 맨 위에서 수정)
  js/game-cashier.js       전산회계1실 「매점 계산왕」 (물건·손님 대사·규칙은 파일 맨 위에서 수정)
  css/games.css            체험 게임 디자인
  img/                     배경(WebP)·캐릭터 그림, ASSET-SOURCES.json(원본 지문)
  img/games/cafe/          카페 게임 그림 (재료 아이콘·손님·카운터 배경)
  img/games/ai/            AI 광고 게임 그림 (상품 3개·힌트 로봇)
  img/games/office/        타자 게임 그림 (모니터·아이템 4종)
  img/games/bakery/        빵 굽기 게임 그림 (반죽·발효·굽기 결과 7장)
  img/games/finance/       금융 게임 그림 (탐정·지폐·동전·매점 물건 10종)
  tools/update_assets.py   새 원본 그림 중 바뀐 것만 골라 변환하는 도구
  tools/pixel.mjs          게임 픽셀아트 공통 도우미 (색·그리기·PNG 저장)
  tools/make_cafe_game_art.mjs  카페 게임 픽셀아트를 코드로 다시 그리는 도구 (Node.js)
  tools/make_ai_game_art.mjs    AI 광고 게임 픽셀아트 도구 (Node.js)
  tools/make_office_game_art.mjs  타자 게임 픽셀아트 도구 (Node.js)
  tools/make_bakery_game_art.mjs  빵 굽기 게임 픽셀아트 도구 (Node.js)
  tools/make_finance_game_art.mjs  금융 게임 픽셀아트 도구 (Node.js)
```

실습실 조성 예시 사진은 입학 안내 페이지와 같은 `../assets/img/facilities/` 파일을 함께 씁니다.

## 공간 이름 바꾸기·추가하기 — `js/tour-data.js`

공간 하나가 한 줄입니다. 지도 이름표, 아래 공간 카드, 검색, 상세 창이 모두 이 목록 하나를 씁니다.

```js
{ name: '도서실', at: [86.5, 78], w: 20, anchor: [71, 78] },
```

| 항목 | 뜻 |
|---|---|
| `name` | 공간 이름 (2026학년도 학교배치도 기준) |
| `at` | 이름표 위치 `[x, y]` |
| `w` | 이름표 너비 (그림 너비 대비 %) |
| `anchor` | 캐릭터가 걸어가 멈출 복도 위치 — 반드시 걸을 수 있는 영역(`walkAreas`) 안 |
| `status`, `current` | 개편 예정 공간: `status: '개편 예정', current: '현재 이름'` (현재 이름으로도 검색됨) |
| `facility: true` | E/L·화장실·계단 — 카드 대신 '편의시설' 버튼으로 표시 |
| `photo` | 상세 창에 그림 대신 보여 줄 사진 |
| `desc` | 상세 설명 (없으면 기본 문구) |
| `link` | 상세 창 아래 바로가기 버튼 `{ href, label }` — 새 탭으로 열림 (예: 경영실습실 → 수업 실습 페이지) |
| `game` | 체험 게임 id (예: `'cafe'`) — 상세 창에 체험 버튼이 생기고 `?game=cafe`로 바로 열림. 게임은 `js/games.js` 머리 주석대로 `js/game-○○.js`에 등록 |

배치도에는 있지만 그림에 없는 공간은 층의 `omitted` 목록에 적으면 카드 아래에 안내됩니다.

**좌표:** 배경 그림의 왼쪽 위가 `(0, 0)`, 오른쪽 아래가 `(100, 100)`인 백분율입니다. 실측 좌표가 아닙니다.
`walkAreas`·`walkObstacles`·`rect`는 `[왼쪽, 위, 너비, 높이]`입니다.

## 그림 교체 (GPT로 새로 그린 그림 반영)

1. 새 그림은 **기존과 같은 파일 이름**으로 저장합니다. 이름 목록은 `img/ASSET-SOURCES.json`에 있습니다.
   - 배경(`outdoor-lawn.png`, `floor1-structure-v6-20261025.png`, `floor2-structure-v6-20261025.png` …): **가로:세로 2:1**, 1774×887 권장
   - 걷는 캐릭터(`overworld-atlas.png`): 96×160, 칸 32×40, 3열(걸음A·서기·걸음B) × 4행(아래·오른쪽·위·왼쪽)
   - 공유 미리보기 배경(`tour-share-art.png`): 1200×630, 왼쪽 45%는 글자용 남색 여백, 글자 없이
2. 원본 PNG를 한 폴더에 모아 실행합니다 (Python + Pillow 필요).
   ```bash
   python3 tour/tools/update_assets.py 원본폴더 --dry-run   # 무엇이 바뀌었는지 확인만
   python3 tour/tools/update_assets.py 원본폴더             # 바뀐 그림만 WebP로 변환 (공유 그림은 글자 얹어 JPG)
   ```
3. **배경 구도가 바뀌었다면** `tour-data.js`에서 그 층의 `walkAreas`(걷는 영역)·`stairs`·이름표 `at`·`anchor`를 새 그림에 맞게 고쳐야 합니다.
   방이나 복도 위치가 달라지면 캐릭터가 벽을 통과하거나 이름표가 엉뚱한 곳에 놓입니다.

## 링크 공유 미리보기

카카오톡 등에 투어 주소를 보내면 `img/share.jpg`(1200×630)가 썸네일로 뜹니다.
GPT가 그린 배경(`tour-share-art.png`)에 `update_assets.py`가 학교 글꼴로 제목을 얹어 만듭니다.
카카오톡은 https:// 전체 주소의 이미지만 확실히 불러오므로, 공개 주소가 정해지면 `index.html`의
`og:image`를 `https://공개주소/tour/img/share.jpg`로 바꾸고 `og:url`도 추가하세요.

## 방문 분석 — `js/analytics.js`

입학안내 페이지와 같은 GA4(`G-0RCC2LMBNY`)·네이버 애널리틱스를 씁니다. 공개 주소에서만 보내고, 로컬 미리보기는 집계하지 않습니다.
페이지 조회·체류시간은 두 도구가 자동으로 집계하고, 아래 이벤트를 추가로 보냅니다. (검색어·위치·개인정보는 보내지 않음)

| GA4 이벤트 | 매개변수 | 네이버 이벤트 | 언제 |
|---|---|---|---|
| `tour_floor_view` | `floor_name`, `move_method`(floor_button·door·stairs·elevator·room_link) | `TourFloor` (Outdoor·F1~F5) | 다른 층으로 이동 |
| `tour_room_open` | `room_name`, `floor_name` | `TourRoom` (Open) | 공간 설명 창 열림 |
| `tour_expand` | — | `TourExpand` (Open) | 크게 보기 |
| `tour_cta_click` | `cta_location`(header·bottom·footer), `link_section` | `TourCTA` | 입학 안내로 돌아가는 링크 |
| `tour_room_link_click` | `room_name`, `link_url`, `route_status`(class_route·class_route_repeat·none) | — | 공간 설명의 바로가기 링크(예: 경영실습실 → 수업 사이트) |
| `class_route_complete` | `room_name`, `link_url`, `route_steps`, `route_minutes` | — | 같은 방문에서 입학안내 → 투어 → 그 공간을 거쳐 링크를 처음 누름 (방문당 1회) |
| `tour_click` (입학안내 페이지) | `cta_location`(banner·nav·facility) | `TourLink` | 입학안내 → 투어로 넘어감 |
| `tour_game_start` | `game_id`(cafe·ai·typing·rain·bakery·phishing·cashier), `room_name` | `TourGame` (CafeStart·AiStart·TypingStart·RainStart·BakeryStart·PhishingStart·CashierStart) | 체험 게임 시작 |
| `tour_game_complete` | `game_id`, `stars`(별 1~3 — 2026-11-15 이전의 카페·AI·빵 굽기는 9개 만점), `hints`(힌트 사용 수) | `TourGame` (CafeDone·AiDone·TypingDone·RainDone·BakeryDone·PhishingDone·CashierDone) | 체험 게임 끝 (결과 화면) |
| `tour_game_cta` | `game_id`, `cta`(dept) | `TourGame` (CafeDept·AiDept·TypingDept·RainDept·BakeryDept·PhishingDept·CashierDept) | 결과 화면의 학과 소개 링크 클릭 |
| `tour_career_pick` | `question_id`, `choice_id`, `dept`(erp·marketing·fintech·cafe·none), `repeat`(yes·no) | `TourCareer` (`<question_id>_<choice_id>`) | 커리어존에서 보기를 고른 즉시, 문항당 1회 |
| `tour_career_result` | `dept`(erp·marketing·fintech·cafe·none), `commute`(q6 보기 id), `elsewhere`(q7 보기 id), `repeat`(yes·no) | `TourCareer` (`Result_<dept>`) | 커리어존 7문항 완료 |

커리어존도 공통 `tour_game_start`·`tour_game_complete`·`tour_game_cta`를 보냅니다 (`game_id: career`, 네이버 `CareerStart`·`CareerDone`·`CareerDept`).
답 카드의 새 탭 학과 링크는 `tour_game_cta`의 `cta: dept_<학과 id>`, 결과 링크는 기존 틀의 `cta: dept`, `transport_type: beacon`을 씁니다.
같은 브라우저에서 완료한 적이 있으면 `gch-tour-career-done` 값 `1`을 읽어 `repeat: yes`로 표시하며, 재플레이를 막거나 집계에서 빼지 않습니다.
선생님용 보기별 집계 방법·질문 id 표는 [커리어존 집계 안내](../docs/career-zone-results.md)를 보세요. 학과 그림은 `img/games/departments/`의 48×48 픽셀 배지를 2배로 표시합니다. 결과의 연결 문항 수는 학과를 직접 선택한 횟수가 아니라, 안내 학과로 연결된 관심사 문항까지 포함합니다.

`class_route_complete`는 수업 시간 접속을 홍보 분석에서 빼고 보기 위한 표시입니다. 판별 방법과 GA4 탐색 설정은
[`../docs/class-route-exclusion.md`](../docs/class-route-exclusion.md)를 보세요. 코드만으로는 어떤 보고서에서도 자동으로 빠지지 않습니다.

GA4 보고서에서 공간 이름별로 보려면 관리 → 맞춤 정의 → 맞춤 측정기준 만들기에서
`room_name`, `floor_name`, `move_method`, `cta_location`을 **이벤트 범위**로 등록하세요. (등록한 날부터 집계)

## 체험 게임 도장 — `js/games.js`

별은 모든 게임이 최대 3개입니다(여러 라운드 게임은 라운드 평균). 게임이 있는 공간은 지도 이름표와 공간 카드에 🎮 로 표시됩니다.

**도장판(스탬프 투어):** 지도 위 `🎮 도장 n / m` 버튼을 누르면 게임이 있는 공간 목록과 모은 도장·별이 보이고, [도전]을 누르면 그 층으로 옮겨 게임이 바로 열립니다.
공간 데이터에 `game`을 붙이면 목록과 숫자에 자동으로 들어갑니다. 모두 모으면 입학 안내·입학 상담 링크가 나옵니다.
도장판 아래 **도장 초기화 → 모두 초기화**를 누르면 이 브라우저의 모든 도장·최고 별 기록을 지웁니다. 취소하거나 확인 전에 창을 닫으면 기록을 유지하며, 도장이 없으면 버튼을 비활성화합니다. 저장소 접근 실패 시 실패 안내를 표시합니다. 커리어존 재참여 표시와 브라우저당 1회 완료 분석 표시는 초기화하지 않습니다.
분석 이벤트: `tour_stamp_open`(`stamp_count`, `stamp_total` / 네이버 `TourStamp` Open), `tour_stamp_complete`(`stamp_total` / 네이버 `TourStamp` Complete, 브라우저당 한 번 — `gch-tour-stamps-done`).

게임을 끝내면 브라우저 `localStorage`의 `gch-tour-stamps`에 `{ "cafe": { "stars": 2, "at": "2026-11-14" }, "ai": { "stars": 3, "at": "2026-11-14" } }` 꼴로 게임별 최고 별 수만 남깁니다 (도장판에 표시).
이름·연락처 같은 개인정보는 받지 않고 서버로 보내는 것도 없습니다. 저장이 막힌 브라우저에서도 게임은 그대로 됩니다.

## 확인 방법

저장소 폴더에서 `npx http-server . -p 8080` 실행 후 `http://localhost:8080/tour/` 를 엽니다.
(`tour/index.html`을 더블클릭해도 열리지만, 실제 게시 환경과 같게 보려면 서버로 여는 것을 권장합니다.)

- 각 층에서 공간 카드를 몇 개 눌러 캐릭터가 그 공간 앞까지 걸어가는지
- 야외에서 위로 걸어 중앙현관 → 1층, 1층 중앙현관에서 아래로 걸어 → 야외
- 야외 줄무늬 차양 아래 바깥 계단 → 2층, 2층 문서고 왼쪽 바깥 계단을 끝까지 걸어 내려가면 → 야외
- 계단 ↑·↓ 버튼으로 층 이동
- E/L을 누르거나 그 앞에서 Enter → 층 고르기 (1~4층은 E/L 앞, 5층은 주계단 앞에 도착)
- 휴대폰 화면에서 두 손가락 확대·끌어서 이동

## 알려 둘 점

- 그림은 2026학년도 학교배치도를 참고한 일러스트입니다. 실측 도면·실제 출입 경로가 아닙니다.
- 조리제빵실·카페실습실(1층)·AI비즈니스실(3층)은 개편 예정 공간을 상상한 그림입니다.
- 4층 체육관 2층의 코트 바닥은 걸을 수 없게 해 두었고, 5층 옥상은 이용할 수 없는 곳이라 걸어 들어갈 수 없게 막아 두었습니다(그림과 '출입 불가' 이름표만 표시).
- 현재 1~5층 그림의 원본 기준은 `img/ASSET-SOURCES.json`의 `floor1~5-structure-v6-20261025.png` 기록입니다. 이전 1층 v6/v7 합성 설명은 현재 파일의 기준으로 사용하지 않습니다.

## 보상·완성 음료 픽셀 에셋 (2026-11-15)

- 도장 8종: `img/games/stamps/`. 미획득은 회색 그림과 **미획득** 글자, 획득은 원색 그림과 **획득**·별로 구분합니다.
- 학과 배지 4종: `img/games/departments/`. 학과 홍보 일러스트와 별도로 게임에 사용합니다.
- 완성 음료 3종: `img/games/cafe/drink-*.png`. 정답 뒤 표시하고 다음 손님에서 초기화합니다.
- 재생성: `node tour/tools/make_reward_game_art.mjs` (저장소 루트에서). 48×48 RGBA PNG, 알파 0/255, 무손실·정수 좌표. 생성 시 원본 기록의 SHA-256도 갱신합니다.
- 카페: 담긴 재료를 다시 누르면 취소합니다. 힌트 버튼에 `레시피 보기 −★1`을 미리 표시하고, 같은 라운드 재열람에는 추가 감점이 없습니다.
- 실제 사진 미확보 항목은 [실습실 사진 보완 기록](../docs/tour-photo-backlog.md)에 별도로 정리했습니다.


## 탐험 미션과 내 옷장 (2026-11-15)

도장판 옆 **내 옷장**에서 머리 장식과 등 소품을 하나씩 조합합니다. 잠긴 소품도 미리 볼 수 있으며, 해금한 소품을 골라 **이 코디로 입기**를 눌러야 지도에 적용됩니다. 닫기/취소는 미리보기만 버립니다. 네 방향 및 걷기 미리보기를 지원합니다.

기존 8개 게임의 서로 다른 도장마다 머리 1종과 등 1종, 총 16종이 열립니다. 재도전과 별 점수 상승은 추가 해금하지 않습니다. 새 도장 결과창의 **바로 입어보기**는 새 아이템을 옷장에 미리 선택해 주며 자동 착용하지 않습니다.

| 도장 | 머리 장식 | 등 소품 |
| --- | --- | --- |
| 1 | 봄날 리본 핀 | 바게트 소풍백 |
| 2 | 데이지 머리핀 | 사르르 리본 |
| 3 | 포근 토끼 모자 | 민트 미니백 |
| 4 | 밤고양이 모자 | 반짝 별 가방 |
| 5 | 별빛 베레모 | 구름 깃털 날개 |
| 6 | 바다 산책 모자 | 둥실 별 풍선 |
| 7 | 작은 별 왕관 | 축제 리본 망토 |
| 8 | 라일락 마법 모자 | 초승달 산책 |

**탐험 미션**은 잔디마당 유나 선배에게 시작합니다. 1층 리본, 기존 빵 굽기 게임 완료, 3층 서아 선배의 포스터를 모아 전달합니다. 미션은 도장과 별을 추가 지급하지 않습니다.

- 기존 도장: `gch-tour-stamps`를 그대로 읽습니다.
- 추가 기록: `gch-tour-addons-v1`에 미션 진행과 착용 상태만 저장합니다. 브라우저/출처별 기록으로, 다운로드 체험판의 별도 기록은 자동 이전되지 않습니다.
- 도장 초기화: 기존 도장·별 삭제 후 아이템 잠금 및 착용 해제. 미션 기록 유지.
- 미션 다시하기: 준비물과 완료 표시만 삭제. 도장·별과 착용 유지.
- 소품 그림: `js/wardrobe-art.js`의 정수 픽셀 캔버스. 모자가 덮는 머리 윗부분만 가려 기존 헤어라인 돌출을 방지합니다. 기본 캐릭터 이미지와 이동 충돌 크기는 유지합니다.

구성은 `js/tour-addons.js`, `js/wardrobe-art.js`, `css/addons.css`, `index.html`의 진입 버튼/대화상자와 `js/tour.js`의 연결 이벤트입니다. 기존 게임 8종, 이동·카메라·층 데이터는 변경하지 않았습니다. 기능을 제거하려면 이 기능을 병합한 PR 커밋을 revert합니다. 저장된 기존 도장에는 영향을 주지 않습니다.
