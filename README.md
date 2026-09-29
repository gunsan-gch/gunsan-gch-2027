# 군산여상 2027학년도 학과·입학 안내 페이지

군산여자상업고등학교의 2027학년도 4개 학과(ERP비즈니스과·AI마케팅과·AI핀테크과·카페비즈과)를 소개하고, 입학설명회와 입학 상담으로 안내하는 **한 페이지짜리 정적 웹사이트**입니다.
빌드 과정 없이 HTML·CSS·JavaScript 파일만으로 동작하므로 GitHub Pages에 그대로 올릴 수 있습니다.

## 폴더 구성

```
index.html                  페이지 뼈대 (메뉴·섹션 순서)
sitemap.xml                 검색엔진 사이트맵
.nojekyll                   GitHub Pages가 파일을 그대로 제공하도록 하는 설정 파일
assets/
  js/site-data.js           ★ 콘텐츠 데이터 (학과·인원·설명회·연락처·링크) — 보통 이 파일만 수정
  js/main.js                화면을 그리는 스크립트 (수정할 필요 없음)
  css/style.css             디자인
  img/brand/                교표, 파비콘
  img/departments/          학과 캐릭터 4종 (웹용 WebP로 압축)
  img/facilities/           실습실 조성 예시 이미지 3장 (AI비즈니스실·조리제빵실·카페실습실)
  img/employers/            주요 취업처 로고 (학교 '주요 취업현황' 자료에서 잘라낸 이미지) + 정부 상징
  img/colleges/             진학 대학 로고 (전달받은 이미지 4개: 전북대·군산대·경남대·대전대)
  img/school-life/          기존 학교 활동 사진 4장 (학생 얼굴 흐림 처리, 웹용 WebP)
  fonts/                    제목용 글꼴 + 라이선스 전문
```

제작 지시서, `references/` 참고자료(포스터·현수막 PDF·QR·로고 모음), 파일 목록 JSON은 **저장소에 넣지 않았습니다.** 앞으로도 원본 자료나 내부 문서는 이 폴더에 복사하지 마세요.

## 내 컴퓨터에서 미리 보기

- 가장 간단한 방법: `index.html`을 더블클릭해 브라우저로 엽니다.
- 실제 서버와 같은 환경으로 보려면 (Node.js 설치 필요):
  ```bash
  npx http-server . -p 8080
  ```
  그다음 브라우저에서 `http://localhost:8080` 을 엽니다.

## 콘텐츠 수정 방법 — `assets/js/site-data.js`

학과 설명, 모집인원, 설명회 일시·장소, 전화번호, 링크, FAQ 등은 모두 `assets/js/site-data.js` 한 파일에 있습니다.
GitHub 웹사이트에서 파일을 열고 연필(✏️) 아이콘을 눌러 바로 수정·저장(Commit)할 수 있습니다.

- 따옴표 `"..."` 안의 글자만 바꾸고, 쉼표·괄호는 지우지 마세요.
- **정해지지 않은 값은 `null`로 두세요.** 0명·빈 링크로 바뀌지 않고, 해당 버튼·영역이 숨겨지거나 전화 문의 안내로 대신 표시됩니다.
- 학과별 학급 수·인원의 합이 `totalClasses`/`totalSeats`와 다르면 브라우저 개발자 도구 콘솔에 경고가 나옵니다.

### 자주 바꾸게 될 항목

| 하고 싶은 일 | 수정할 곳 |
|---|---|
| 글로컬특성화고 로고·링크 바꾸기 | `glocal.logo`(현재 `assets/img/brand/glocal-logo.webp`)·`logoWidth`·`logoHeight`, 연결 주소는 `glocal.url` |
| 설명회 사전등록 주소 바꾸기 | `briefing.registrationUrl` (현재 구글 설문지 주소). **주소를 바꾸면 `registrationQrImage`를 `null`로** 바꿔 주세요 → 새 주소로 QR이 자동 생성됩니다 (기존 QR 이미지는 현재 주소 전용) |
| 직접 만든 QR 이미지 쓰기 | 이미지를 `assets/img/briefing/`에 넣고 `briefing.registrationQrImage` 에 경로 입력 |
| 사전등록 마감 시각 지정 | `briefing.registrationClosesAt` (예: `"2026-10-14T18:00:00+09:00"`) |
| 설명회 종료 시각 추가 | `briefing.endAt` |
| 경품 안내 바꾸기·내리기 | `briefing.giftsText`·`giftsParts`(굵은 글씨 두 줄)·`giftsDetail`(작은 글씨, ` · `로 구분) 수정. 내리려면 `giftsPublished: false` |
| 모집요강 파일 다운로드 버튼 | `admissionsPdfUrl` 에 파일 주소 입력 |
| 원서접수 기간 바꾸기 | `admissionSchedule` 의 `value` 수정 (형식: `"2026. 11. 6.(금) ~ 11. 10.(화) 17:00까지"`). 숨기려면 `publishDetailedAdmissionSchedule: false` |
| 입학 상담 전화번호 | `admissionsPhone`(첫 번째, 전화 버튼이 거는 번호)·`admissionsPhoneSecondary`(두 번째). 두 번째가 `null`이면 한 번호만 표시 |
| 전형별 인원 | 각 학과의 `specialSeats`/`generalSeats` 수정. 표에서 전형별 열을 숨기려면 `publishFullAdmissionTypeTable: false` |
| 대회 실적 공개 | 증빙 확인 후 `awards` 입력 + `publishAwards: true` |
| 실습실 조성 예시 이미지 넣기 | 이미지를 `assets/img/facilities/`에 넣고 해당 `facilities[].image`에 `{ src, width, height, alt }` 입력 → 이미지 위에 "조성 예시 이미지" 표시가 자동으로 붙습니다 |
| 실습실 완공 반영 | `facilitiesStatus: "completed"` + 각 `facilities[].status` 문구 수정 |
| 학생 사진 숨기기 | 전체: `showSchoolLifePhotos: false` / 한 장만: 해당 `schoolLife` 항목에 `show: false` |
| 주요 취업처 추가·수정 | `employment.categories` 의 `items` 에 `{ name, count, logo }` 추가 (로고는 `assets/img/employers/`에 넣기). 이름이 길면 `nameParts: ["전북", "신용보증재단"]`처럼 줄바꿈 위치 지정 |
| 진학 대학 바꾸기 | `college.schools` 에 대학명, `college.logos["대학명"]` 에 `{ src, width, height }` (로고는 `assets/img/colleges/`에 넣기) |
| 현 고3 현황 바꾸기 | `currentSeniors` 의 숫자·`updatedAt` 수정. 최종 합격 등 결과가 나오면 `note` 문구도 함께. 내리려면 `currentSeniors: null` |
| 3년 로드맵 프로그램 수정 | `roadmap.grades` 의 학년별 `programs` 수정. 계획 단계 항목은 `badge: "운영 예정"` 처럼 표시 |
| 장학금·지원 제도 카드 | 학교가 대상·금액·기준연도를 **확정·승인한 항목만** `benefits`에 입력 (형식은 파일 안 설명 참고). 비어 있으면 영역이 나타나지 않습니다 |
| 설명회 실제 진행 완료 표시 | 행사 후 `briefing.manualStatus: "held"` → "진행되었습니다" 문구 |
| 설명회 취소·변경 | `briefing.manualStatus: "cancelled"` + `manualNotice` 문구 → 사전등록 버튼이 모두 내려감 (일정만 바뀌면 `startAt`을 고치세요) |
| 다음 해 설명회로 교체 | `admissionYear`, `briefing`의 제목·일시(`startAt`, `archiveAt`)·장소를 한꺼번에 수정 |

### 설명회 상태 자동 전환

시간은 `Asia/Seoul` 기준입니다. 첫 화면 카드·상단 버튼·모바일 고정바·설명회 영역·FAQ·QR이 모두 같은 상태를 따릅니다.

| 상태 | 조건 | 화면 |
|---|---|---|
| 시작 전 | `startAt` 이전 | 사전등록 버튼·QR (마감 시각을 넣었다면 그 시각까지) |
| 사전등록 마감 | `registrationClosesAt` 경과, 시작 전 | "사전등록이 마감되었습니다" + 참여 문의 전화 |
| 행사 당일 시작 후 | `startAt` 경과 ~ `archiveAt` 전 | "오늘 열리는 입학설명회" + 참여 문의 (사전등록 버튼 내림) |
| 지난 일정 | `archiveAt`(기본 10. 16. 00:00) 또는 `endAt` 경과 | "지난 설명회 일정" + 입학 상담 — 실제 개최 확인 후 `manualStatus: "held"`로 바꾸면 "진행되었습니다" |
| 취소·변경 | `manualStatus: "cancelled"` | `manualNotice` 문구 + 입학 상담 |

- 설정이 서로 맞지 않으면(마감이 시작보다 늦음, 종료가 시작보다 빠름 등) 개발자 도구 콘솔에 경고가 나옵니다.
- **미리 확인하기(검수 모드):** 주소 뒤에 `?now=시각`을 붙이면 그 시각 기준 화면이 보이고, 맨 위에 노란 "검수 모드" 안내가 표시됩니다. 복사·공유되는 주소에는 붙지 않습니다.
  - 행사 당일 시작 후: `index.html?now=2026-10-15T18:00:00%2B09:00`
  - 행사 후: `index.html?now=2026-10-16T00:00:00%2B09:00`

### 3년 성장 로드맵

학년 버튼(1학년 탐색 & 기본기 / 2학년 선택 & 집중 / 3학년 실전 & 진출)을 누르면 해당 학년 프로그램이 아래에 펼쳐집니다. `#grade-2`처럼 주소로 바로 열 수 있고, 키보드 ←→로도 바꿀 수 있습니다.
2학년 AI 중점학년·AI 구독 지원·AI 자격증 취득 지원은 **예정** 표시가 붙어 있습니다. 확정되면 `badge` 문구를 바꾸거나 지우세요.

### 취업·진학 현황

- **현 고3 취업·진로 현황:** 지역인재 9급 공무원(지원·1차 합격)과 부사관 인원을 맨 위에 보여 줍니다. 공무원은 1차 합격 기준임을 함께 표시합니다.
- **주요 취업처:** 학교 '주요 취업현황' 자료의 대표 취업처를 4개 분야로 묶어 로고와 함께 보여 줍니다. 졸업생 이름은 넣지 않았고, 2명 이상인 곳만 인원을 표시합니다.
- **주요 진학 대학:** 2022~2026년 졸업생 진학 자료 중 주요 대학 12곳의 이름·로고만 보여 줍니다 (인원·학과는 넣지 않았습니다).
- **외부 로고 주의:** 일부 로고(KB국민은행·KB증권·삼성화재·한화생명, 대학 8곳, 육군·공군)는 파일이 없어 해당 기관 누리집의 이미지를 직접 불러옵니다. 그쪽 주소가 바뀌거나 막히면 취업처는 아이콘으로, 대학은 이름만, 고3 현황은 빈칸으로 자동 대체됩니다. 로고 파일을 받으면 `assets/img/employers/`·`assets/img/colleges/`에 넣고 `src`를 파일 경로로 바꾸는 것을 권장합니다.
- 장학금·지원금의 금액·조건과 과거 제도 안내 내용은 학교 확정 전까지 **공개 보류**라 코드 어디에도 넣지 않았습니다.

## 움직임(애니메이션)

- 스크롤하면 각 영역의 제목·카드가 차례로 떠오르고, 첫 화면 글자·캐릭터가 순서대로 나타납니다. 학과·학년을 바꿀 때와 FAQ를 펼칠 때도 부드럽게 전환됩니다.
- 실습실 조성 예시 이미지는 누르면 크게 볼 수 있습니다 (Esc 또는 ✕로 닫기).
- 위쪽에 스크롤 진행 막대, 오른쪽 아래에 '맨 위로' 버튼이 있습니다.
- 휴대폰·PC에서 **'움직임 줄이기'(동작 줄이기)** 설정을 켠 사용자에게는 움직임이 모두 꺼지고 내용이 바로 보입니다.

## 이미지 교체 방법

1. 새 이미지를 같은 폴더에 넣습니다. 사진은 가로 1000px 안팎, 캐릭터는 640px 안팎으로 줄이면 휴대전화에서 빠르게 열립니다. (WebP·JPG·PNG 모두 가능)
2. `site-data.js`에서 해당 항목의 `src`, `width`, `height`, `alt`(대체텍스트)를 새 파일에 맞게 고칩니다.
3. 교표는 `assets/img/brand/school-crest.webp`를 같은 이름으로 덮어쓰면 됩니다.

사진 사용 원칙: 기존 활동 사진은 "기존 활동"으로 표시되며, 새 실습실(AI비즈니스실·조리제빵실·카페실습실) 사진처럼 쓰지 않습니다. 실습실이 완공되면 실제 사진을 추가하고 문구를 바꿔 주세요.

## GitHub Pages로 게시하기

**공개 주소: https://gunsan-gch.github.io/gunsan-gch-2027/**

- 저장소: `gunsan-gch/gunsan-gch-2027` (공개 저장소, `main` 브랜치 `/ (root)`에서 게시)
- 설정 위치: 저장소 **Settings → Pages → Build and deployment** (Source: Deploy from a branch / Branch: `main` / `/ (root)`)
- 공개 저장소이므로 원본 자료·개인정보·내부 문서는 절대 올리지 마세요.
- **주소를 바꾸지 마세요.** 계정·저장소 이름을 바꾸면 주소가 달라져 인쇄된 QR과 학교 홈페이지 링크가 모두 끊깁니다. 바꿔야 한다면 `index.html`의 `canonical`·`og:url`·`og:image`도 함께 고치고 QR을 새로 만드세요.

모든 경로가 상대 경로라 `https://계정.github.io/저장소명/` 같은 하위 주소에서도 이미지·글꼴·스크립트가 정상 동작합니다. 수정 사항을 커밋하면 1~3분 뒤 자동으로 반영됩니다.

### 공유 미리보기(카카오톡·문자 링크 썸네일)

`assets/img/share/`에 1200×630 공유 이미지 2장이 들어 있습니다.

| 파일 | 쓰는 시기 |
|---|---|
| `share-briefing.jpg` | 설명회 전 (설명회 일시·장소 표시) — 현재 적용 |
| `share-general.jpg` | 설명회가 끝난 뒤 (입학 상담 번호 표시) |

`index.html`의 `<head>`에 공개 주소 기준 전체 주소로 들어가 있습니다 (카카오톡 등은 https:// 전체 주소의 이미지만 확실하게 불러옵니다).
```html
<meta property="og:url" content="https://gunsan-gch.github.io/gunsan-gch-2027/">
<meta property="og:image" content="https://gunsan-gch.github.io/gunsan-gch-2027/assets/img/share/share-briefing.jpg">
```
설명회가 끝나면 `share-briefing.jpg`를 `share-general.jpg`로 바꾸면 됩니다. 카카오톡은 미리보기를 한동안 저장해 두므로, 바로 바뀌지 않으면 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 주소를 넣고 "캐시 초기화"를 누르세요.

### 링크 복사·공유 버튼

입학설명회 안내 카드와 페이지 하단에 **링크 복사** 버튼이 있습니다. 휴대폰에서는 **공유하기** 버튼도 함께 보이며, 누르면 카카오톡·문자 등 휴대폰의 공유 화면이 열립니다. 복사되는 주소에는 `?now=` 미리보기 값이나 `#위치`가 붙지 않습니다.

## 검색 등록 (구글·네이버)

- `sitemap.xml`(사이트맵)과 검색엔진용 구조화 데이터(학교 정보, 설명회 일시·장소)가 들어 있습니다. 구조화 데이터는 `site-data.js`의 설명회 정보로 자동 생성되며, 설명회가 지나면 자동으로 빠집니다.
- **구글:** [Search Console](https://search.google.com/search-console) → 속성 추가 → **URL 접두어** `https://gunsan-gch.github.io/gunsan-gch-2027/` → 소유권 확인 방법 **HTML 태그**의 `<meta name="google-site-verification" ...>` 를 `index.html`의 `<head>` 안(다른 meta 아래)에 붙여 넣고 저장 → 확인 → 왼쪽 **Sitemaps**에 `sitemap.xml` 제출 → 상단 URL 검사에서 주소 입력 후 **색인 생성 요청**
- **네이버:** [서치어드바이저](https://searchadvisor.naver.com) → 웹마스터 도구 → 사이트 등록에 공개 주소 입력 → **HTML 태그**의 `<meta name="naver-site-verification" ...>` 를 같은 방식으로 붙여 넣기 → 확인 → **요청 → 사이트맵 제출**(`https://gunsan-gch.github.io/gunsan-gch-2027/sitemap.xml`) → **요청 → 웹 페이지 수집**에 공개 주소 입력
- 검색 결과에 나오기까지 보통 며칠~몇 주 걸리며, 순위는 보장되지 않습니다. 학교 홈페이지·블로그 등에서 이 주소로 연결되는 링크가 많을수록 빨리 잡힙니다.
- 내용을 크게 고치면 `sitemap.xml`의 `lastmod` 날짜를 바꿔 주세요.

## 학교 홈페이지와 연결하기

GitHub Pages 주소가 생기면 학교 홈페이지(school.jbedu.kr)에서 다음과 같이 연결할 수 있습니다.

- **메인 배너·팝업존·퀵메뉴**에 링크 주소로 등록 (가장 권장). "새 창 열기"로 설정하면 전화·길찾기 버튼이 휴대전화에서 가장 잘 동작합니다.
- **입학 안내 게시판 공지**에 링크와 설명회 안내 이미지를 함께 게시.
- 홈페이지 편집기에서 `iframe` 삽입이 허용된다면 페이지 안에 넣을 수도 있습니다. 이 경우에도 페이지 속 외부 링크(학교 홈페이지·지도)는 새 창으로 열리도록 만들어 두었습니다.
- 현수막·홍보물용 QR은 **실제 공개 주소가 확정된 뒤** 그 주소로 만들어 주세요.

## 글꼴과 라이선스

| 글꼴 | 사용 위치 | 라이선스 | 비고 |
|---|---|---|---|
| 쿠키런체 Black (데브시스터즈) | 첫 화면 큰 제목, 학과명 제목, 설명회 제목 | 무료·상업적 사용 가능. 저작권 안내·라이선스 전문을 포함하면 재배포 가능. 게임 산업군 사용 금지, 글꼴 수정·개작 금지 | 파일을 수정·서브셋하지 않고 배포 형태 그대로 사용. `assets/fonts/LICENSE-CookieRun.txt` 포함, 하단에 출처 표기 |
| 엘리스 DX널리체 Medium·Bold ((주)엘리스) | 본문 전체와 섹션 제목·학과 카드 제목 | SIL Open Font License 1.1 (사용·수정·재배포 가능, 단독 판매 금지) | `assets/fonts/LICENSE-EliceDXNeolli.txt` 포함 |

- 글꼴 파일은 모두 저장소 안(`assets/fonts/`)에 있어 외부 서버 없이 불러옵니다. 불러오지 못하면 기기 기본 한글 글꼴로 표시됩니다.
- 쿠키런·엘리스 DX널리체에는 가운뎃점(·) 글자가 없어 휴대폰마다 다른 기본 글꼴로 대체되며 어색해 보일 수 있습니다. 그래서 엘리스 DX널리체의 가운뎃점 모양을 좁은 폭으로 옮긴 보조 글꼴 `GCHMiddot.woff2`(472바이트, OFL 파생본·이름 변경)를 넣어 모든 기기에서 같은 모양으로 보이게 했습니다.
- 글꼴 파일은 공식 배포 파일을 모아 둔 [fonts-archive](https://github.com/fonts-archive) 미러에서 받았습니다. 공식 배포처(쿠키런: cookierunfont.com, 엘리스: elice.io 브랜드 페이지)의 최신 라이선스가 바뀌었는지 게시 전에 한 번 더 확인해 주세요.
- 쿠키런 딩벳(쿠키런 IP 상징 문자 10자)은 상업적 사용이 금지되어 있어 사용하지 않았습니다.

## 게시 전 확인할 항목 (아직 입력이 필요한 정보)

- [x] 전북글로컬특성화고 로고 (`glocal.logo`) — 적용 완료
- [x] 설명회 사전등록 주소 (`briefing.registrationUrl`) — 구글 설문지 연결, QR 적용 완료
- [ ] 사전등록 마감 시각이 정해지면 `briefing.registrationClosesAt` 입력 (없으면 행사 당일 10. 15. 자정까지 사전등록 버튼이 유지됩니다)
- [ ] 학과개편을 반영한 최종 모집요강 파일 주소 (`admissionsPdfUrl`)
- [x] 원서접수 기간(특별 11. 6.~11. 10., 일반 11. 23.~11. 25.), ERP·AI마케팅 특별/일반 20명·20명 — 확인 완료
- [x] 입학 상담 번호 (063-460-0321 · 063-460-0366) — 확인 완료
- [x] 경품(참석자 전원 핸드크림 세트, 추첨 경품) — 확인 완료. 바뀌면 문구 수정
- [x] 현 고3 현황(9급 지원 4·1차 합격 3, 육군 부사관 4, 공군 부사관 1) — 확인 완료. 최종 결과가 나오면 갱신
- [ ] 외부 누리집에서 불러오는 로고가 공개 주소에서 잘 보이는지 확인 (가능하면 파일로 교체)
- [x] 공개 주소 확정 (https://gunsan-gch.github.io/gunsan-gch-2027/) 및 공유 미리보기 주소 반영
- [ ] 설명회 종료 후 공유 이미지를 `share-general.jpg`로 교체
- [ ] 설명회를 실제로 마친 뒤 `briefing.manualStatus: "held"` 로 변경
- [ ] 장학금·지원 제도: 2027학년도 대상·금액·조건 확정 후 `benefits`에 입력 (가상 합계 금액은 사용하지 않음)
- [x] 주요 진학 대학 12곳 목록 — 확인 완료
- [ ] 주요 취업처 분류(공공기관·공무원 / 금융권 / 주요 기업 / 우수기업·전문직무)가 학교 의견과 맞는지 확인
- [ ] 3년 로드맵 프로그램 명칭·내용과 '예정' 표시 확인 (AI 중점학년·구독·자격증 지원 확정 시 표시 변경)
- [x] 실습실 '2027년 2학기 전 완공 목표' 표기 — 확인 완료

## 이 페이지에 넣지 않은 것

설명회 신청폼·원서접수 기능, 개인정보 저장, 방문자 추적(분석) 스크립트, 로그인·서버 기능은 넣지 않았습니다. 신청은 외부 신청폼 주소로만 연결합니다.
