# 커리어존 「내 취향 찾기」 — 선생님용 선택 집계 안내

4층 커리어존의 7문항 게임은 이름·연락처·학교명이나 자유 입력을 받지 않습니다.
보기를 고른 횟수와 완료 결과만 기존 GA4·네이버 애널리틱스로 보내며, 별도 서버·DB는 없습니다.
문항과 답변은 `tour/js/game-career.js` 맨 위에서 수정합니다. 보기 순서는 적힌 순서 그대로입니다.
학과 활동·자격증·통학 안내 등 문구는 학교 확인 대상입니다. 네일·메이크업 동아리와 방과후 수업 안내는 제공받은 사실을 반영했습니다.

## 1. GA4에서 보는 법

1. **보고서 → 참여도 → 이벤트 → `tour_career_pick`**에서 보기 선택의 전체 횟수를 봅니다.
2. 보기별로 보려면 **관리 → 맞춤 정의 → 맞춤 측정기준 만들기**에서 아래 6개를 각각 **이벤트 범위**로 등록합니다. 이벤트 매개변수 이름은 표와 정확히 같아야 합니다.
3. 맞춤 측정기준은 **등록한 날부터 집계**되며, 등록 이전 기록을 소급해서 채우지 않습니다.
4. **탐색 → 자유 형식**에서 행에 `question_id`·`choice_id`, 값에 **이벤트 수**, 필터에 **이벤트 이름 = `tour_career_pick`**을 넣으면 문항별 보기 선택 횟수를 비교할 수 있습니다.
5. 완료 결과는 **이벤트 이름 = `tour_career_result`**로 따로 보고 `dept`·`commute`·`elsewhere`를 행에 넣습니다. `repeat`를 열에 넣으면 첫 완료 이전 플레이와 완료 이후 재플레이를 나란히 볼 수 있습니다.

| 이벤트 범위 맞춤 측정기준 | 뜻 | 값 |
|---|---|---|
| `question_id` | 질문 id (선택 이벤트) | `q1`~`q7` |
| `choice_id` | 고른 보기 id (선택 이벤트) | 아래 문항별 표 참고 |
| `dept` | 선택한 보기의 학과 / 완료 시 추천 학과 | `erp`, `marketing`, `fintech`, `cafe`, `none` |
| `repeat` | 이번 플레이 시작 전에 이 브라우저에서 완료한 적이 있는지 | `yes`, `no` |
| `commute` | 완료 시 q6 선택 | `near`, `far_ok`, `unsure` |
| `elsewhere` | 완료 시 q7 선택 | `beauty`, `cooking`, `nursing`, `game_it`, `none` |

`erp`는 ERP비즈니스과, `marketing`은 AI마케팅과, `fintech`는 AI핀테크과, `cafe`는 카페비즈과입니다.
선택 이벤트의 `dept: none`은 우리 학교 학과에 직접 해당하지 않는 보기입니다. 통학 문항과 q7의 모든 보기도 여기에 해당합니다.
다만 뷰티 관련 보기 5개(`q1_beauty`, `q2_hair`, `q3_beauty_designer`, `q4_hairdresser`, `q7_beauty`)는 집계에서는 `dept: none`으로 남기되,
화면에서는 AI마케팅과로 안내하고(답 카드 링크) 추천 점수에도 AI마케팅과로 더합니다. 뷰티 수요는 `choice_id`로 따로 볼 수 있습니다.
추천은 학과별 선택 수가 가장 큰 학과이며, 동률이면 문항 순서상 먼저 고른 학과입니다.
모든 학과가 0이면 4개 학과 전체를 안내하고 결과 이벤트는 `dept: none`으로 보냅니다.
현재 q5는 모든 보기가 학과에 연결되므로 0점 결과는 나오지 않지만, 문항 수정에 대비한 예외 처리가 있습니다.

## 2. 네이버 애널리틱스에서 보는 법

**이벤트 분석 → `TourCareer`**에서 라벨별 횟수를 바로 봅니다. GA4와 달리 맞춤 측정기준 등록은 필요 없습니다.

- 보기 선택: `q1_video`, `q4_hairdresser`처럼 **질문 id + 밑줄 + 보기 id**입니다.
- 완료 결과: `Result_erp`, `Result_marketing`, `Result_fintech`, `Result_cafe`입니다. 추천이 없으면 `Result_none`입니다.
- 라벨은 영문·숫자·밑줄만 사용합니다.
- 네이버에는 위 라벨만 보내므로 `repeat`나 완료 결과의 `commute`·`elsewhere`로 나누어 볼 수 없습니다. 통학·다른 분야의 선택 횟수는 `q6_...`·`q7_...` 라벨로 봅니다.

공통 게임 이벤트는 별도로 `TourGame`의 `CareerStart`·`CareerDone`·`CareerDept`에 남습니다.
답 카드의 학과 링크와 결과의 학과 링크는 모두 `CareerDept`이므로 네이버에서는 구분되지 않습니다.

## 3. 읽을 때 주의할 점

- 숫자는 **선택·완료 횟수이지 사람 수가 아닙니다.** 같은 학생이 여러 번 할 수 있고, 한 기기를 여러 학생이 쓸 수도 있습니다. q6·q7만으로 실제 다른 학교 진학 인원이나 이탈 확률을 단정하지 마세요.
- **재플레이도 똑같이 진행하고 모두 집계합니다.** 자동 제외나 차단은 없습니다. GA4의 `repeat`는 구분용 표시입니다.
- 완료 시 브라우저 `localStorage`의 `gch-tour-career-done`에 `1`을 저장합니다. 플레이 시작에 읽은 `repeat`를 그 플레이의 선택·완료 이벤트에 동일하게 사용합니다. 중간에 닫은 첫 플레이는 완료 표시를 남기지 않지만, 이미 고른 보기의 이벤트는 남습니다.
- 저장소 삭제·시크릿 모드·저장 차단·다른 기기에서는 과거 완료를 알 수 없어 `no`가 나올 수 있습니다. 저장이 막혀도 게임은 끝까지 진행됩니다. 개별 답변을 브라우저 저장소에 저장하지 않습니다.
- 광고 차단기 등으로 분석이 막힌 기기는 통계에서 빠집니다. 로컬 주소는 기존 `tourTrack`이 전송하지 않습니다.
- 수업 중 접속을 제외해 비교하는 방법은 [수업 사이트 이동 세션 제외 안내](class-route-exclusion.md)를 참고하세요. 해당 경로 표시가 있는 세션만 GA4 탐색에서 구분할 수 있으며, 모든 수업 접속이 자동 제외되는 것은 아닙니다. 네이버에는 수업 세션 구분이 없습니다.
- 질문별 전체 선택 횟수는 중도 종료 때문에 다를 수 있습니다. `tour_career_pick`의 횟수와 `tour_career_result`의 완료 횟수를 더해 사람 수로 해석하지 마세요.

## 4. 이벤트와 매개변수

| 이벤트 | 매개변수 | 네이버 이름·라벨 | 시점 |
|---|---|---|---|
| `tour_career_pick` | `question_id`, `choice_id`, `dept`, `repeat` | `TourCareer`, `<question_id>_<choice_id>` | 보기 선택 즉시, 문항당 한 번 |
| `tour_career_result` | `dept`, `commute`, `elsewhere`, `repeat` | `TourCareer`, `Result_<dept>` | 마지막 답 카드를 읽고 다음 버튼을 누를 때 |
| `tour_game_start` | `game_id: career`, `room_name: 커리어존` | `TourGame`, `CareerStart` | 기존 틀이 게임 창을 열 때 |
| `tour_game_complete` | `game_id: career`, `stars: 3`, `hints: 0` | `TourGame`, `CareerDone` | 기존 틀이 결과를 표시할 때 |
| `tour_game_cta` (답 카드) | `game_id: career`, `cta: dept_<학과 id>` | `TourGame`, `CareerDept` | 새 탭 학과 링크 클릭 |
| `tour_game_cta` (결과) | `game_id: career`, `cta: dept`, `transport_type: beacon` | `TourGame`, `CareerDept` | 기존 틀의 결과 학과 링크 클릭 |

## 5. 질문·보기 id 표

`dept`가 `none`인 보기는 추천 점수에 더하지 않습니다(뷰티 보기 5개만 AI마케팅과로 더함). q6는 통학 성향, q7은 다른 분야에 대한 관심 집계용입니다.

### q1 — 쉬는 날 뭐 할 때 제일 신나요?

| choice_id | 보기 | dept | 네이버 라벨 |
|---|---|---|---|
| `video` | 영상 찍고 편집하기 | `marketing` | `q1_video` |
| `dessert` | 빵·디저트 만들기 | `cafe` | `q1_dessert` |
| `beauty` | 네일·메이크업 | `none` | `q1_beauty` |
| `money` | 용돈 불리기(저축·투자) | `fintech` | `q1_money` |

### q2 — 친구들이 나한테 자주 부탁하는 건?

| choice_id | 보기 | dept | 네이버 라벨 |
|---|---|---|---|
| `slides` | 발표 자료 예쁘게 만들기 | `erp` | `q2_slides` |
| `treasurer` | 돈 계산·모임 총무 | `erp` | `q2_treasurer` |
| `hair` | 머리 손질·화장 해 주기 | `none` | `q2_hair` |
| `snack` | 맛있는 간식 만들어 주기 | `cafe` | `q2_snack` |

### q3 — 꿈의 직업과 가장 가까운 건?

| choice_id | 보기 | dept | 네이버 라벨 |
|---|---|---|---|
| `cafe_owner` | 카페·베이커리 사장 | `cafe` | `q3_cafe_owner` |
| `creator` | SNS 마케터·크리에이터 | `marketing` | `q3_creator` |
| `bank` | 은행·핀테크 회사 | `fintech` | `q3_bank` |
| `office` | 회사 사무·경영 지원 | `erp` | `q3_office` |
| `beauty_designer` | 헤어·뷰티 디자이너 | `none` | `q3_beauty_designer` |
| `nurse` | 간호·보건 | `none` | `q3_nurse` |

### q4 — 배워 보고 싶은 자격증은?

| choice_id | 보기 | dept | 네이버 라벨 |
|---|---|---|---|
| `barista` | 바리스타·제과제빵 | `cafe` | `q4_barista` |
| `gtq` | GTQ·영상 편집 | `marketing` | `q4_gtq` |
| `erp_cert` | 전산회계·ERP | `erp` | `q4_erp_cert` |
| `finance_cert` | 금융·투자 자격증 | `fintech` | `q4_finance_cert` |
| `hairdresser` | 미용사 | `none` | `q4_hairdresser` |
| `cook` | 조리사(한식·양식) | `none` | `q4_cook` |

### q5 — 수업 시간에 제일 재밌을 것 같은 건?

| choice_id | 보기 | dept | 네이버 라벨 |
|---|---|---|---|
| `company` | 가상 회사 운영해 보기 | `erp` | `q5_company` |
| `ad` | 상품 광고 만들기 | `marketing` | `q5_ad` |
| `drink` | 커피·음료 만들기 | `cafe` | `q5_drink` |
| `ai_report` | AI로 보고서 만들기 | `fintech` | `q5_ai_report` |

### q6 — 고등학교를 고를 때 나는…

| choice_id | 보기 | dept | 네이버 라벨 |
|---|---|---|---|
| `near` | 집 근처에서 편하게 다니고 싶어요 | `none` | `q6_near` |
| `far_ok` | 배우고 싶은 과가 있으면 멀어도(기숙사·통학버스) 갈래요 | `none` | `q6_far_ok` |
| `unsure` | 아직 모르겠어요 | `none` | `q6_unsure` |

### q7 — 다른 학교에 가야만 배울 수 있는 분야 중 끌리는 게 있다면?

| choice_id | 보기 | dept | 네이버 라벨 |
|---|---|---|---|
| `beauty` | 뷰티(헤어·메이크업·네일) | `none` | `q7_beauty` |
| `cooking` | 조리(한식·양식·중식) | `none` | `q7_cooking` |
| `nursing` | 간호·보건 | `none` | `q7_nursing` |
| `game_it` | 게임·IT 개발 | `none` | `q7_game_it` |
| `none` | 없어요, 상업·경영 쪽이 좋아요 | `none` | `q7_none` |
