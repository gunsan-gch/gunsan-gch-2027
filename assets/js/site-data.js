/*
 * 군산여상 2027학년도 학과·입학 안내 페이지 — 콘텐츠 데이터
 * ------------------------------------------------------------
 * 학과 정보·인원·설명회·연락처·외부 링크는 모두 이 파일 한 곳에서 수정합니다.
 *  - 글자는 따옴표("...") 안의 내용만 바꾸세요. 문장 안의 \n 은 화면에서 줄이 바뀌는 위치입니다.
 *  - 아직 정해지지 않은 값은 null 로 두세요. null 은 화면에서 0명이나 빈 링크로 바뀌지 않고
 *    해당 버튼·영역이 숨겨지거나 대체 안내(전화 문의 등)로 바뀝니다.
 *  - 수정 후 README.md 의 "수정 후 확인" 절차로 화면을 확인하세요.
 */
window.SITE_DATA = {
  schoolName: "군산여자상업고등학교",
  schoolShortName: "군산여상",
  schoolType: "공립 특성화고등학교",
  admissionYear: 2027,
  contentUpdatedAt: "2026-09-29",
  schoolWebsite: "https://school.jbedu.kr/gunsan-gch/",
  admissionsNoticeUrl: "https://school.jbedu.kr/gunsan-gch/M01070101/index.do",
  admissionsPageUrl: "https://school.jbedu.kr/gunsan-gch/MABAHAI/index.do",

  // 학과개편을 반영한 최종 모집요강 파일 주소가 확정되면 입력하세요. (예: "https://.../2027모집요강.pdf")
  admissionsPdfUrl: null,
  address: "전북특별자치도 군산시 신지길 42-8",
  postalCode: "54103",

  // 입학 상담 전화. 두 번째 번호(admissionsPhoneSecondary)가 있으면 나란히 표시됩니다. 버튼·모바일 고정바의 전화 연결은 첫 번째 번호로 걸립니다.
  admissionsPhone: "063-460-0321",
  admissionsPhoneSecondary: "063-460-0366",
  schoolPhone: "063-460-0321",
  totalClasses: 6,
  totalSeats: 120,
  seatsPerClass: 20,
  vision: "AI로 일하고 데이터로 경영하는 디지털 여성 리더 육성",
  badges: ["전북글로컬특성화고 선정", "AI비즈니스 특화"],

  // 글로컬특성화고 로고·링크 (첫 화면과 하단에 표시, 누르면 새 창으로 url 이동)
  glocal: {
    url: "https://school.jbedu.kr/gunsan-gch/M010402/view/6759334.do?s_idx=2",
    logo: "assets/img/brand/glocal-logo.webp",
    logoWidth: 930,
    logoHeight: 150,
    logoAlt: "전북글로컬특성화고 로고",
    title: "전북글로컬특성화고 선정",
    subtitle: "AI비즈니스 특화",
    logoCaption: "선정 학교 · AI비즈니스 특화"
  },
  motto: "꿈과 희망을 가지고 역사의 새벽을 깨우는 녹원인",

  /* ---------------- 학과 (표시 순서 고정: ERP → AI마케팅 → AI핀테크 → 카페비즈) ----------------
   * 문장 안의 \n 은 화면에서 줄바꿈 위치입니다. */
  departments: [
    {
      id: "erp",
      name: "ERP비즈니스과",
      classes: 2,
      seats: 40,
      specialSeats: 20,
      generalSeats: 20,
      keywords: ["회계", "인사", "물류", "ERP"],
      image: {
        src: "assets/img/departments/erp.webp",
        alt: "ERP비즈니스과 캐릭터",
        width: 640,
        height: 670
      },
      interest: "숫자와 자료로 회사 업무 정리하기",
      easyLine: "회계·인사·물류로\n회사 업무를 배웁니다.",
      oneLiner: "회계·인사·물류를 연결하는 경영지원 실무",
      intro: "회계와 사무의 기본을 익히고,\nERP·엑셀·AI로 회사 업무를 실습합니다.",
      term: "ERP는 회계·인사·생산·물류 정보를\n한곳에서 관리하는 시스템입니다.",
      learn: ["회계자료·전표 정리와 회계 프로그램", "인사·총무·문서 작성", "구매·재고·물류 데이터 관리", "엑셀·AI로 자료 정리와 보고서 작성"],
      subjects: ["회계 원리", "회계 정보 처리 시스템", "기업 자원 통합 관리", "회계 실무", "인사", "물류 관리", "사무 행정", "빅데이터의 이해"],
      flow: ["회계·사무·정보처리 기초", "기업 자원 통합 관리, 인사, 회계 실무", "회계·물류·사무행정 실무, 데이터 관련 학습"],
      activity: "가상 회사의 매출·재고를 정리하고,\nERP와 엑셀로 업무 보고서 만들기",
      certificates: [
        "ERP정보관리사(회계·인사·물류)",
        "전산회계운용사",
        "전산회계 1·2급",
        "유통관리사",
        "컴퓨터활용능력",
        "워드프로세서",
        "ITQ",
        "AI-POT",
        "AICE",
        "한국사능력검정시험"
      ],
      careers: ["기업 회계·경리", "인사·총무", "경영지원", "자재·물류 관리", "ERP 운영 지원"],
      certificateGroups: [
        {
          label: "회계·ERP·유통",
          items: ["ERP정보관리사(회계·인사·물류)", "전산회계운용사", "전산회계 1·2급", "유통관리사"]
        },
        {
          label: "사무·컴퓨터",
          items: ["컴퓨터활용능력", "워드프로세서", "ITQ"]
        },
        {
          label: "AI·진로",
          items: ["AI-POT", "AICE", "한국사능력검정시험"]
        }
      ]
    },
    {
      id: "marketing",
      name: "AI마케팅과",
      classes: 2,
      seats: 40,
      specialSeats: 20,
      generalSeats: 20,
      keywords: ["콘텐츠", "SNS", "온라인 판매"],
      image: {
        src: "assets/img/departments/marketing.webp",
        alt: "AI마케팅과 캐릭터",
        width: 640,
        height: 685
      },
      interest: "이미지·영상·SNS로 상품 알리기",
      easyLine: "AI로 콘텐츠를 만들고,\n마케팅을 배웁니다.",
      oneLiner: "콘텐츠 제작부터 데이터로 보는 마케팅까지",
      intro: "상품의 매력을 전하는 콘텐츠를 만들고,\nSNS·온라인 판매와 홍보 효과 분석을 배웁니다.",
      term: null,
      learn: ["브랜드·고객을 이해하는 마케팅 기초", "이미지·영상·상품 상세페이지 제작", "SNS·온라인 쇼핑몰 운영과 고객관리", "조회수·반응·구매 전환 데이터 분석"],
      subjects: ["마케팅과 광고", "창업 일반", "고객 관리", "전자상거래 실무", "AI마케팅 콘텐츠 제작", "SNS 마케팅", "마케팅 기획", "빅데이터 마케팅 4.0"],
      flow: ["상업·경영·회계·정보처리 기초", "마케팅, 유통, 창업, 고객관리", "AI 콘텐츠, SNS, 전자상거래, 마케팅 기획"],
      activity: "군산의 상품을 알리는 카드뉴스·숏폼을 만들고,\n홍보 결과를 분석하기",
      certificates: [
        "GTQ",
        "GTQ-AI",
        "전자상거래운용사",
        "유통관리사",
        "SMAT(서비스경영자격)",
        "전산회계운용사",
        "컴퓨터활용능력",
        "워드프로세서",
        "ITQ",
        "AI-POT",
        "AICE",
        "한국사능력검정시험"
      ],
      careers: ["디지털 마케팅", "SNS 콘텐츠 제작·운영", "온라인 쇼핑몰 운영", "온라인 MD 업무 지원", "기업 홍보·고객관리"],
      certificateGroups: [
        {
          label: "마케팅·비즈니스",
          items: ["GTQ", "GTQ-AI", "전자상거래운용사", "유통관리사", "SMAT(서비스경영자격)", "전산회계운용사"]
        },
        {
          label: "사무·컴퓨터",
          items: ["컴퓨터활용능력", "워드프로세서", "ITQ"]
        },
        {
          label: "AI·진로",
          items: ["AI-POT", "AICE", "한국사능력검정시험"]
        }
      ]
    },
    {
      id: "fintech",
      name: "AI핀테크과",
      classes: 1,
      seats: 20,
      specialSeats: 16,
      generalSeats: 4,
      keywords: ["금융", "회계", "금융데이터"],
      image: {
        src: "assets/img/departments/fintech.webp",
        alt: "AI핀테크과 캐릭터",
        width: 640,
        height: 640
      },
      interest: "금융·회계와 데이터를 다루기",
      easyLine: "금융·회계에\nAI 활용을 더합니다.",
      oneLiner: "금융·회계와 디지털 금융 실무",
      intro: "은행·증권·보험과 기업 회계를 익히고,\nAI·금융데이터를 활용하는 실무를 배웁니다.",
      term: "핀테크는 금융과 기술을 결합한 서비스입니다.\n모바일 금융서비스가 대표적인 예입니다.",
      learn: [
        "회계·금융·증권·보험의 기초",
        "전표 처리·자금관리·결산 보조",
        "비대면 금융서비스와 데이터 입력·검수",
        "AI로 금융자료 정리와 보고서 작성",
        "개인정보 보호·금융 윤리·결과 검토"
      ],
      subjects: ["회계 실무", "금융 일반", "보험 일반", "핀테크 일반", "증권 실무", "창구 사무", "예산·자금", "인공지능 프라이버시"],
      flow: ["회계·사무·정보처리 기초", "금융·보험·핀테크·증권 기초와 회계 실무", "창구 사무, 예산·자금, 데이터·개인정보 관련 학습"],
      activity: "AI로 금융·회계 보고서 초안을 만들고,\n수치와 설명이 맞는지 확인하기",
      certificates: ["전산회계운용사", "전산회계 1·2급", "ERP정보관리사(회계)", "컴퓨터활용능력", "워드프로세서", "ITQ", "AI-POT", "AICE", "한국사능력검정시험"],
      careers: ["금융기관의 사무·고객서비스 지원", "기업 재무·회계", "세무·회계 사무소", "금융데이터 관리", "핀테크 서비스 운영 지원"],
      certificateGroups: [
        {
          label: "금융·회계",
          items: ["전산회계운용사", "전산회계 1·2급", "ERP정보관리사(회계)"]
        },
        {
          label: "사무·컴퓨터",
          items: ["컴퓨터활용능력", "워드프로세서", "ITQ"]
        },
        {
          label: "AI·진로",
          items: ["AI-POT", "AICE", "한국사능력검정시험"]
        }
      ]
    },
    {
      id: "cafe",
      name: "카페비즈과",
      classes: 1,
      seats: 20,
      specialSeats: 16,
      generalSeats: 4,
      keywords: ["제과제빵", "커피", "경영·마케팅"],
      image: {
        src: "assets/img/departments/cafe.webp",
        alt: "카페비즈과 캐릭터",
        width: 640,
        height: 640
      },
      interest: "빵·커피 만들기와 매장 운영하기",
      easyLine: "제과제빵·커피와\n회계·경영을 배웁니다.",
      highlight: "제과제빵부터 일반 기업까지,\n진로의 폭을 넓힙니다.",
      oneLiner: "제과제빵·커피에 비즈니스 실무를 더하는 학과",
      intro: "빵·디저트·커피를 만드는 기술과\n회계·사무·경영·마케팅을 함께 배웁니다.",
      term: "F&B는 Food & Beverage의 약자로,\n음식과 음료 분야를 뜻합니다.",
      learn: [
        "조리·디저트·제과제빵·커피 실습",
        "식품 위생과 안전",
        "메뉴 기획·원가·재고·매장 운영",
        "POS·키오스크 등 디지털 매장 운영",
        "회계·사무·경영 등 상업 실무",
        "마케팅·고객서비스·SNS 홍보"
      ],
      subjects: ["기초 조리", "디저트 조리", "제과", "바리스타", "제빵", "고급 제과·제빵", "푸드 콘텐츠 마케팅1", "푸드 콘텐츠 마케팅2", "SNS 마케팅"],
      flow: ["기초·디저트 조리, 마케팅, 노동 인권과 산업 안전 보건", "제과, 바리스타", "제빵, 고급 제과·제빵, 푸드 콘텐츠·AI·SNS 마케팅"],
      activity: "디저트·음료 메뉴와 원가표를 만들고,\nSNS 홍보물을 제작해 모의 매장 운영하기",
      certificates: [
        "제과기능사",
        "제빵기능사",
        "바리스타 관련 자격",
        "전산회계운용사",
        "전산회계 1·2급",
        "ERP정보관리사(회계·물류)",
        "컴퓨터활용능력",
        "워드프로세서",
        "ITQ",
        "SMAT(서비스경영자격)",
        "AI-POT",
        "AICE",
        "한국사능력검정시험"
      ],
      careers: ["베이커리·카페", "외식·식품기업", "매장운영 및 서비스 직무", "일반 기업 사무직", "회계·경리"],
      careerGroups: [
        {
          label: "F&B 기업·현장",
          items: ["제과제빵·바리스타", "베이커리·카페·외식·식품기업", "매장 운영·서비스"]
        },
        {
          label: "일반 기업",
          items: ["사무·회계·경리", "경영지원·마케팅·영업지원", "고객서비스"]
        }
      ],
      certificateLead: "제과·제빵 자격과 함께\n회계·사무·AI 자격도 준비합니다.",
      certificateGroups: [
        {
          label: "제과·제빵·커피",
          items: ["제과기능사", "제빵기능사", "바리스타 관련 자격"]
        },
        {
          label: "회계·경영",
          items: ["전산회계운용사", "전산회계 1·2급", "ERP정보관리사(회계·물류)", "SMAT(서비스경영자격)"]
        },
        {
          label: "사무·컴퓨터",
          items: ["컴퓨터활용능력", "워드프로세서", "ITQ"]
        },
        {
          label: "AI·진로",
          items: ["AI-POT", "AICE", "한국사능력검정시험"]
        }
      ]
    }
  ],

  /* ---------------- 입학설명회 ---------------- */
  briefing: {
    enabled: true,
    title: "2027학년도 군산여자상업고등학교 입학설명회",
    startAt: "2026-10-15T17:30:00+09:00",
    // 종료 시각이 정해지면 입력 (예: "2026-10-15T19:00:00+09:00")
    endAt: null,
    // 이 시각부터 '지난 행사'로 표시
    archiveAt: "2026-10-16T00:00:00+09:00",
    // 사전등록 마감 시각이 정해지면 입력
    registrationClosesAt: null,
    timeZone: "Asia/Seoul",
    venue: "군산여자상업고등학교 온누리홀",
    audience: "중학교 3학년 학생 및 학부모님",
    program: ["학교·학과·교육과정 소개", "취업·진학 안내", "방과후·학교생활 안내", "실습환경 소개", "질의응답·개별 상담"],
    intro: "학과와 학교생활을 살펴보고,\n취업·진학의 궁금한 점을 직접 물어보세요.",
    // 사전등록(외부 신청폼) 주소. 입력하면 사전등록 버튼과 QR이 나타납니다.
    registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeAAQJV7yEFIdnb39he4JdEJUzPK96t9ceMVe_t-ltkEqUxHg/viewform",
    // 직접 만든 QR 이미지 경로. 주소를 바꾸면 QR 이미지도 새로 만들거나 null 로 두세요 (null = 주소로 QR 자동 생성).
    registrationQrImage: "assets/img/briefing/registration-qr.png",
    // 경품 안내 표시 (설명회 전·당일에만 보임). 품목·대상이 바뀌면 giftsText·giftsParts·giftsDetail 을 함께 고치세요.
    giftsPublished: true,
    giftsText: "참석자 전원 핸드크림 세트 증정!",
    giftsParts: ["참석자 전원", "핸드크림 세트 증정!"],
    // 담당자가 직접 정하는 상태 (자동 계산보다 우선). null = 날짜로 자동 전환
    // - "held": 행사를 실제로 마친 뒤 → '진행되었습니다' 문구로 표시
    // - "cancelled": 행사 취소 → 사전등록 버튼을 모두 내리고 manualNotice 문구 표시
    manualStatus: null,
    manualNotice: null,
    giftsDetail: "추첨 경품 · 스탠리 텀블러 · 홍삼스틱 · 보조배터리 등"
  },

  /* ---------------- 공개 여부 스위치 ---------------- */
  // 최종 모집요강의 일정과 다르면 admissionSchedule 을 고치거나 false 로 두세요.
  publishDetailedAdmissionSchedule: true,
  admissionSchedule: [
    {
      label: "특별전형 원서접수",
      value: "2026. 11. 6.(금) ~ 11. 10.(화) 17:00까지"
    },
    {
      label: "일반전형 원서접수",
      value: "2026. 11. 23.(월) ~ 11. 25.(수) 17:00까지"
    }
  ],

  // 네 학과의 특별·일반전형 인원 표시 (departments 의 specialSeats·generalSeats)
  publishFullAdmissionTypeTable: true,

  // 대회 실적 증빙 확인 후 true + awards 입력 ({ title, detail })
  publishAwards: false,
  awards: [],

  // 준공 후 "completed"로 바꾸고 facilities의 status 문구를 수정
  facilitiesStatus: "planned",

  // 학생 얼굴은 흐리게 처리한 사진입니다. 공개 동의 범위가 확인되지 않으면 false
  showSchoolLifePhotos: true,

  /* ---------------- 교육·학생 지원 ---------------- */
  supportLead: "자격증부터 취업·진학 상담까지,\n희망 진로에 맞춰 함께 준비합니다.",

  // 장학금·지원 제도 카드 — 학교에서 대상·금액·기준연도를 확정하고 공개를 승인한 항목만 입력하세요.
  // 예: { group: "장학금", title: "", target: "", content: "", amount: "", method: "", baseYear: "", url: "" }
  benefits: [],
  support: [
    {
      icon: "cert",
      title: "자격증·방과후",
      text: "무료 방과후 수업으로\n전공 자격과 실무를 준비합니다."
    },
    {
      icon: "project",
      title: "프로젝트 수업",
      text: "문서·콘텐츠·상품을 만들며\n배운 내용을 실습합니다."
    },
    {
      icon: "job",
      title: "취업 준비",
      text: "기업·직무 탐색부터\n자기소개서·면접까지 돕습니다."
    },
    {
      icon: "study",
      title: "진학·후학습",
      text: "대학 진학과\n취업 후 배움의 길을 안내합니다."
    }
  ],

  /* ---------------- 3년 성장 로드맵 (학년 버튼을 누르면 해당 학년 프로그램 표시) ----------------
   * badge: "예정" 등 운영 예정 표시. 확정되지 않은 지원은 반드시 "예정"으로 두세요. */
  roadmap: {
    lead: "학년을 누르면 주요 프로그램을 볼 수 있어요.",
    note: "2027학년도 운영 방향입니다. 세부 프로그램·일정은 학교 계획에 따라 조정될 수 있으며, 취업·합격을 보장하지 않습니다.",
    grades: [
      {
        id: "grade-1",
        num: "01",
        grade: "1학년",
        step: "EXPLORE",
        stepKo: "탐색",
        label: "탐색·기초",
        headline: "나에게 맞는 진로 찾기",
        keyLine: "아직 진로를 정하지 않아도 괜찮아요.\n특강과 선배의 경험으로 나의 길을 찾아갑니다.",
        goal: "학습 습관과 진로 계획 세우기",
        programs: [
          {
            icon: "compass",
            title: "플래닝코칭반",
            sub: "3년의 학습·진로 계획을 함께 세웁니다.",
            points: ["개인별 학습·진로 목표 설정", "학교생활·자격증 준비 계획", "학습 습관 형성과 목표 점검"]
          },
          {
            icon: "gov",
            title: "공채·공무원 기초",
            sub: "기업 공채와 공무원을 함께 준비합니다.",
            points: ["기업·공공기관·지역인재 9급 진로 탐색", "기초학력·직업기초능력", "문서 이해·문제 해결·기본 상식"]
          },
          {
            icon: "mic",
            title: "진로 탐색 특강",
            sub: "여러 직업을 만나 적성과 흥미를 찾습니다.",
            points: ["기업·금융·공공기관·공무원", "AI·마케팅·회계·경영", "F&B·서비스·진학·후학습"]
          },
          {
            icon: "chat",
            title: "선배와의 대화",
            sub: "선배에게 학교생활과 진로 준비를 듣습니다.",
            points: ["학교생활·자격증 준비 경험", "취업·공무원·진학 준비 과정", "직장생활 이야기"]
          },
          {
            icon: "book",
            title: "전공 기초·학교 적응",
            sub: "새로운 학교생활에 적응하며\n전공의 기본을 익힙니다.",
            points: []
          }
        ],
        outcome: ["나만의 3년 계획", "학습 습관과 전공 기초"]
      },
      {
        id: "grade-2",
        num: "02",
        grade: "2학년",
        step: "FOCUS",
        stepKo: "집중",
        label: "선택·집중",
        headline: "진로를 정하고 집중하기",
        keyLine: "공채반·공무원반과 AI 교육으로\n나에게 필요한 역량을 키웁니다.",
        goal: "진로별 준비와 AI 활용 역량 키우기",
        programs: [
          {
            icon: "robot",
            title: "AI 중점학년",
            badge: "운영 예정",
            featured: true,
            sub: "2학년 한 해, AI를 쓰며 배웁니다.",
            points: ["수업·과제·프로젝트에 AI 활용", "학과별 전공 실무와 연결"],
            subItems: [
              {
                icon: "laptop",
                title: "AI 구독 지원",
                badge: "지원 예정",
                text: "학기 중 ChatGPT 유료 구독"
              },
              {
                icon: "cert",
                title: "AI 자격증",
                badge: "지원 예정",
                text: "AI-POT·AICE 자격 취득"
              }
            ]
          },
          {
            icon: "target",
            title: "공채반·공무원반",
            sub: "희망 진로에 맞는 반에서 집중합니다.",
            columns: [
              {
                label: "공채반",
                points: ["직업기초능력", "기업·직무 이해", "자기소개서·면접 기초", "전공 관련 자격증"]
              },
              {
                label: "공무원반",
                points: ["시험 대비 학습·문제풀이", "학습 계획·진도 관리", "공무원 직무 이해"]
              }
            ]
          },
          {
            icon: "mic",
            title: "진로 맞춤 특강",
            sub: "관심 분야의 직무를 더 깊이 알아봅니다.",
            points: ["금융권·공공기관·공무원", "대기업·중견기업", "회계·세무·마케팅", "AI·디지털 비즈니스·F&B 산업"]
          },
          {
            icon: "project",
            title: "전공 프로젝트",
            sub: "배운 내용을 직접 결과물로 만듭니다.",
            example: true,
            points: ["ERP · 회계·인사·물류 업무", "마케팅 · 콘텐츠·데이터 활용", "핀테크 · 금융·회계·디지털 금융", "카페 · 제과제빵·커피·매장 운영"]
          }
        ],
        outcome: ["진로별 준비 방향", "AI 활용 경험과 실무 역량"]
      },
      {
        id: "grade-3",
        num: "03",
        grade: "3학년",
        step: "READY",
        stepKo: "실전",
        label: "실전·진출",
        headline: "취업·진학을 실전으로",
        keyLine: "실무 수업과 집중 특강으로\n졸업 후 진로를 준비합니다.",
        goal: "지원서·시험·면접 준비하기",
        programs: [
          {
            icon: "job",
            title: "실무 중심 수업",
            sub: "배운 내용을 실제 업무에 적용합니다.",
            points: ["문서 작성·회계·ERP", "데이터 활용·마케팅", "금융업무·F&B 실무", "고객서비스"]
          },
          {
            icon: "doc",
            title: "공채 집중 특강",
            sub: "서류부터 면접까지 실전으로 준비합니다.",
            points: ["채용공고·기업·직무 분석", "자기소개서·취업 서류 점검", "NCS 직업기초능력 문제풀이", "실전형 모의면접"]
          },
          {
            icon: "gov",
            title: "공무원 집중 특강",
            sub: "시험과 면접을 단계별로 준비합니다.",
            points: ["시험 대비·기출 문제풀이", "개인별 학습관리", "면접·지원 과정 준비"]
          },
          {
            icon: "compass",
            title: "개별 진로상담",
            sub: "취업·진학 계획을 구체화합니다.",
            columns: [
              {
                label: "취업 희망",
                points: ["지원기업 탐색·직무 선택", "지원서 작성·면접 준비"]
              },
              {
                label: "진학 희망",
                points: ["대학·학과 탐색", "지원 전략 수립·진학 상담"]
              }
            ]
          },
          {
            icon: "rocket",
            title: "졸업 후 진로 설계",
            sub: "현장 경험과 취업 후 배움도 살펴봅니다.",
            points: ["직무 체험·산업체 연계·현장실습 안내", "재직자 특별전형 등 후학습 경로 안내"]
          }
        ],
        outcome: ["취업·진학 실전 역량", "졸업 후 성장 계획"]
      }
    ]
  },

  /* ---------------- 학교생활 사진 ---------------- */
  schoolLife: [
    {
      src: "assets/img/school-life/itq-classroom.webp",
      width: 1000,
      height: 538,
      alt: "본교에서 진행한 ITQ 자격시험",
      caption: "ITQ자격시험"
    },
    {
      src: "assets/img/school-life/ai-interview-workshop.webp",
      width: 1000,
      height: 750,
      alt: "AI 기반 면접 특강에 참여하는 학생들",
      caption: "AI 기반 면접 특강"
    },
    {
      src: "assets/img/school-life/flea-market.webp",
      width: 1000,
      height: 562,
      alt: "플리마켓에서 상품과 홍보물을 소개하는 학생들",
      caption: "플리마켓 상품 소개"
    },
    {
      src: "assets/img/school-life/baking-club.webp",
      width: 1000,
      height: 1083,
      alt: "제과제빵 동아리에서 쿠키를 만드는 학생들",
      caption: "제과제빵 동아리 활동"
    }
  ],

  /* ---------------- 주요 취업처 (학교 '주요 취업현황' 자료 기준, 졸업생 이름 제외) ----------------
   * logo.src 가 https:// 로 시작하는 항목은 해당 기관 누리집의 이미지를 불러옵니다.
   * 불러오지 못하면 아이콘으로 대신 표시됩니다. 가능하면 assets/img/employers/ 에 파일로 넣어 주세요. */
  employment: {
    title: "선배들의 주요 취업처",
    lead: "공공기관·금융권·기업까지,\n선배들이 진출한 곳을 소개합니다.",
    note: "학교 「주요 취업현황」의 대표 사례와 수록 인원입니다. 학교 전체 졸업생의 기록으로, 개편 학과의 실적이나 취업 보장을 뜻하지 않습니다.",
    categories: [
      {
        id: "public",
        title: "공공기관·공무원",
        icon: "gov",
        items: [
          {
            name: "9급 공무원",
            count: 15,
            logo: {
              src: "assets/img/employers/gov-emblem.webp",
              width: 80,
              height: 84
            }
          },
          {
            name: "한국철도공사",
            count: 4,
            logo: {
              src: "assets/img/employers/korail.webp",
              width: 265,
              height: 117
            }
          },
          {
            name: "국민연금공단",
            count: 4,
            logo: {
              src: "assets/img/employers/nps.webp",
              width: 274,
              height: 101
            }
          },
          {
            name: "한국전력공사",
            count: 2,
            logo: {
              src: "assets/img/employers/kepco.webp",
              width: 175,
              height: 120
            }
          },
          {
            name: "한국수자원공사",
            count: 1,
            logo: {
              src: "assets/img/employers/kwater.webp",
              width: 165,
              height: 120
            }
          },
          {
            name: "근로복지공단",
            count: 1,
            logo: {
              src: "assets/img/employers/comwel.webp",
              width: 168,
              height: 120
            }
          },
          {
            name: "전북신용보증재단",
            count: 2,
            nameParts: ["전북", "신용보증재단"],
            logo: {
              src: "assets/img/employers/jbcredit.webp",
              width: 120,
              height: 120
            }
          }
        ]
      },
      {
        id: "finance",
        title: "금융권",
        icon: "bank",
        items: [
          {
            name: "한국은행",
            count: 1,
            logo: {
              src: "assets/img/employers/bok.webp",
              width: 263,
              height: 93
            }
          },
          {
            name: "NH농협은행",
            count: 3,
            logo: {
              src: "assets/img/employers/nh.webp",
              width: 171,
              height: 120
            }
          },
          {
            name: "메리츠증권",
            count: 1,
            logo: {
              src: "assets/img/employers/meritz.webp",
              width: 217,
              height: 120
            }
          },
          {
            name: "키움증권",
            count: 1,
            logo: {
              src: "assets/img/employers/kiwoom.webp",
              width: 268,
              height: 98
            }
          },
          {
            name: "새마을금고",
            count: 1,
            logo: {
              src: "assets/img/employers/mg.webp",
              width: 140,
              height: 120
            }
          },
          {
            name: "KB국민은행",
            count: 1,
            logo: {
              src: "https://www.kbinsure.co.kr/images/info_event/kbstar_logo.gif",
              width: 240,
              height: 70,
              sourcePage: "https://www.kbinsure.co.kr/CG112000001.ec"
            }
          },
          {
            name: "KB증권",
            count: 1,
            logo: {
              src: "https://www.kbinsure.co.kr/images/info_event/kbsec_logo.gif",
              width: 240,
              height: 70,
              sourcePage: "https://www.kbinsure.co.kr/CG112000001.ec"
            }
          },
          {
            name: "삼성화재",
            count: 1,
            logo: {
              src: "https://www.samsungfire.com/images/samsungfire_brand.png",
              width: 300,
              height: 100,
              sourcePage: "https://www.samsungfire.com/"
            }
          },
          {
            name: "한화생명보험",
            count: 1,
            logo: {
              src: "https://company.hanwhalife.com/asset/images/brand/hanwha_logo_hero.svg",
              width: 168,
              height: 156,
              sourcePage: "https://company.hanwhalife.com/ko/about/brand/ci"
            }
          }
        ]
      },
      {
        id: "major",
        title: "주요 기업",
        icon: "company",
        items: [
          {
            name: "삼성전자",
            count: 5,
            logo: {
              src: "assets/img/employers/samsung.webp",
              width: 315,
              height: 118
            }
          },
          {
            name: "SK하이닉스",
            count: 3,
            logo: {
              src: "assets/img/employers/skhynix.webp",
              width: 214,
              height: 120
            }
          },
          {
            name: "CJ제일제당",
            count: 1,
            logo: {
              src: "assets/img/employers/cj.webp",
              width: 106,
              height: 120
            }
          },
          {
            name: "KGM커머셜",
            count: 3,
            logo: {
              src: "assets/img/employers/kgm.webp",
              width: 314,
              height: 112
            }
          },
          {
            name: "온세미컨덕터",
            count: 5,
            logo: {
              src: "assets/img/employers/onsemi.webp",
              width: 139,
              height: 120
            }
          },
          {
            name: "SFA반도체",
            count: 2,
            logo: {
              src: "assets/img/employers/sfa.webp",
              width: 330,
              height: 77
            }
          },
          {
            name: "휴스틸",
            count: 2,
            logo: {
              src: "assets/img/employers/husteel.webp",
              width: 186,
              height: 120
            }
          },
          {
            name: "하나마이크론",
            count: 1,
            logo: {
              src: "assets/img/employers/hanamicron.webp",
              width: 203,
              height: 120
            }
          },
          {
            name: "삼양화인테크놀로지",
            count: 1,
            nameParts: ["삼양화인", "테크놀로지"],
            logo: {
              src: "assets/img/employers/samyang.webp",
              width: 333,
              height: 65
            }
          }
        ]
      },
      {
        id: "local",
        title: "우수기업·전문직무",
        icon: "spark",
        items: [
          {
            name: "디티에스",
            count: 4,
            logo: {
              src: "assets/img/employers/dts.webp",
              width: 219,
              height: 120
            }
          },
          {
            name: "산우",
            count: 3,
            logo: {
              src: "assets/img/employers/sanwoo.webp",
              width: 235,
              height: 120
            }
          },
          {
            name: "이성당",
            count: 4,
            logo: {
              src: "assets/img/employers/isungdang.webp",
              width: 161,
              height: 120
            }
          },
          {
            name: "대두식품",
            count: 3,
            logo: {
              src: "assets/img/employers/daedu.webp",
              width: 345,
              height: 100
            }
          },
          {
            name: "한성산기",
            count: 2,
            logo: {
              src: "assets/img/employers/hansung.webp",
              width: 338,
              height: 95
            }
          }
        ]
      }
    ]
  },

  /* ---------------- 주요 진학 대학 (대학명·로고만 표시, 인원·학과는 표시하지 않음) ----------------
   * logos 의 src 가 https:// 인 항목은 대학 누리집 이미지를 불러오며, 실패하면 대학명만 보입니다.
   * variant: "reverse" = 흰색 로고라 어두운 바탕에 표시 */
  college: {
    title: "주요 진학 대학",
    lead: "희망 진로에 맞춰 취업과 진학을 준비합니다.",
    note: "2022~2026년 졸업생 진학 자료 중 주요 사례입니다.",
    schools: [
      "건국대학교",
      "전남대학교",
      "전북대학교",
      "군산대학교",
      "목포대학교",
      "조선대학교",
      "원광대학교",
      "용인대학교",
      "부산외국어대학교",
      "경남대학교",
      "대전대학교",
      "전주대학교"
    ],
    logos: {
      "건국대학교": {
        src: "https://www.konkuk.ac.kr/sites/konkuk/images/common/logo-top-color.png",
        sourcePage: "https://www.konkuk.ac.kr/konkuk/2109/subview.do",
        variant: ""
      },
      "전남대학교": {
        src: "https://www.jnu.ac.kr/images/common/logo.png",
        sourcePage: "https://www.jnu.ac.kr/jnumain.aspx",
        variant: ""
      },
      "전북대학교": {
        src: "assets/img/colleges/jbnu.webp",
        width: 480,
        height: 109,
        variant: ""
      },
      "군산대학교": {
        src: "assets/img/colleges/kunsan.webp",
        width: 480,
        height: 112,
        variant: ""
      },
      "목포대학교": {
        src: "https://www.mokpo.ac.kr/sites/www/images/common/logo_c.png",
        sourcePage: "https://www.mokpo.ac.kr/www/index.do",
        variant: ""
      },
      "조선대학교": {
        src: "https://www3.chosun.ac.kr/sites/chosun/images/bs-symbol1.png",
        sourcePage: "https://www3.chosun.ac.kr/chosun/285/subview.do",
        variant: ""
      },
      "원광대학교": {
        src: "https://image.wku.ac.kr/2024/08/원광대학교-백색로고-2.svg",
        sourcePage: "https://www.wku.ac.kr/",
        variant: "reverse"
      },
      "용인대학교": {
        src: "https://www.yongin.ac.kr/css/yonginUser/images/top_logo.png",
        sourcePage: "https://www.yongin.ac.kr/",
        variant: "reverse"
      },
      "부산외국어대학교": {
        src: "https://www.bufs.ac.kr/data/logo/top_logo_c.png?ver=20260929",
        sourcePage: "https://www.bufs.ac.kr/bbs/board.php?bo_table=aboutbufs",
        variant: ""
      },
      "경남대학교": {
        src: "assets/img/colleges/kyungnam.webp",
        width: 240,
        height: 230,
        variant: ""
      },
      "대전대학교": {
        src: "assets/img/colleges/daejeon.webp",
        width: 200,
        height: 207,
        variant: ""
      },
      "전주대학교": {
        src: "https://jj.ac.kr/_res/jj/jj/img/common/img-logo.svg",
        sourcePage: "https://jj.ac.kr/jj/introduction/ui-color.do",
        variant: ""
      }
    }
  },

  /* ---------------- 실습환경 (조성 계획 · 예시 이미지) ---------------- */
  facilities: [
    {
      icon: "ai",
      name: "AI비즈니스실",
      image: {
        src: "assets/img/facilities/ai-business.webp",
        width: 1200,
        height: 900,
        alt: "AI비즈니스실 조성 예시 이미지 - 컴퓨터 실습석과 사무 공간"
      },
      imageLabel: "조성 예시 이미지",
      target: "AI핀테크과·전체 학과",
      text: "회계·데이터·문서 업무를\n디지털 도구로 실습할 공간입니다.",
      status: "2027년 2학기 전 완공 목표"
    },
    {
      icon: "bakery",
      name: "조리제빵실",
      image: {
        src: "assets/img/facilities/bakery-lab.webp",
        width: 1200,
        height: 900,
        alt: "조리제빵실 조성 예시 이미지 - 아일랜드형 실습대와 제빵 설비"
      },
      imageLabel: "조성 예시 이미지",
      target: "카페비즈과",
      text: "조리·제과제빵의 기초부터\n제조 과정까지 익힐 공간입니다.",
      status: "2027년 2학기 전 완공 목표"
    },
    {
      icon: "cafe",
      name: "카페실습실",
      image: {
        src: "assets/img/facilities/cafe-lab.webp",
        width: 1200,
        height: 900,
        alt: "카페실습실 조성 예시 이미지 - 에스프레소 머신이 있는 바와 매장 좌석"
      },
      imageLabel: "조성 예시 이미지",
      target: "카페비즈과",
      text: "커피·음료 제조와\n디지털 매장 운영을 배울 공간입니다.",
      status: "2027년 2학기 전 완공 목표"
    }
  ],

  /* ---------------- 자주 묻는 질문 ----------------
   * {date} {venue} {year} 는 설명회 정보로 자동 치환됩니다.
   * briefingDependent: true 인 질문은 설명회가 끝나면 aAfter 로 바뀌고, aAfter 가 null 이면 숨겨집니다. */
  faq: [
    {
      group: "학과와 수업",
      q: "AI나 코딩이 처음이어도 괜찮나요?",
      a: "전공 기초부터 AI 활용까지 차근차근 배웁니다.\n학과별 수업에서 AI를 업무에 활용하도록 준비하고 있습니다.\n컴퓨터 프로그램 개발보다 AI를 실무에 활용하는 인재 양성에 중점을 둡니다."
    },
    {
      group: "학과와 수업",
      q: "AI 중점학년은 무엇인가요?",
      a: "2학년 한 해 동안 AI를 수업·과제·프로젝트에 활용하는 프로그램입니다.\n학기 중 ChatGPT 구독과 AI-POT·AICE 취득 지원을 추진할 예정입니다."
    },
    {
      group: "학과와 수업",
      q: "ERP비즈니스과와 AI핀테크과의 차이는?",
      a: "ERP비즈니스과는 회계·인사·물류·사무를 폭넓게 배웁니다.\nAI핀테크과는 회계에 금융·증권·보험·디지털 금융을 더해 배웁니다."
    },
    {
      group: "학과와 수업",
      q: "AI마케팅과에서는 무엇을 배우나요?",
      a: "이미지·영상 제작뿐 아니라 마케팅 기획, 고객관리, SNS·온라인 판매를 배웁니다.\n데이터로 홍보 효과를 살펴보는 방법도 익힙니다."
    },
    {
      group: "학과와 수업",
      q: "카페비즈과는 제빵·커피만 배우나요?",
      a: "제과제빵·커피와 회계·사무·경영·마케팅을 함께 배웁니다.\n관련 상업 자격도 준비하며, F&B 기업과 일반 기업으로 진로를 넓힙니다."
    },
    {
      group: "진로와 실적",
      q: "대학 진학도 준비할 수 있나요?",
      a: "네. 희망에 맞춰 취업과 진학을 함께 준비합니다.\n실제로 많은 선배들이 취업뿐 아니라 대학 진학을 선택합니다."
    },
    {
      group: "진로와 실적",
      q: "공채반과 공무원반은 언제 나뉘나요?",
      a: "1학년에는 두 진로의 기초를 함께 준비합니다.\n2학년부터 성적과 희망에 따라 공채반·공무원반으로 나누어 준비합니다."
    },
    {
      group: "진로와 실적",
      q: "취업 후에도 대학에 갈 수 있나요?",
      a: "네. 산업체 재직 경력 3년 이상 등 지원 자격을 갖춘 재직자는\n재직자 특별전형으로 대학 진학에 도전할 수 있습니다.\n세부 지원 자격과 선발 방법은 대학별 해당 연도 모집요강을 확인해 주세요."
    },
    {
      group: "진로와 실적",
      q: "취업·진학 사례는 새 학과의 실적인가요?",
      a: "학교 전체 졸업생의 사례입니다.\n2027학년도 개편 학과의 실적이나 취업·진학 보장을 뜻하지 않습니다."
    },
    {
      group: "지원과 시설",
      q: "장학금·지원금은 모두 같은가요?",
      a: "지원 대상·금액·기간은 사업마다 다릅니다.\n자세한 기준은 입학 상담으로 확인해 주세요."
    },
    {
      group: "지원과 시설",
      q: "방과후 수업은 무료인가요?",
      a: "네. 현재 모든 방과후 수업을 무료로 운영하고 있습니다."
    },
    {
      group: "지원과 시설",
      q: "새 실습실은 언제 사용할 수 있나요?",
      a: "2027년 2학기 시작 전 완공이 목표이며, 일정은 늦춰질 수 있습니다.\n완공 시기에 맞춰 교육과정을 유연하게 편성하고,\n필요한 수업을 빠짐없이 이수할 수 있도록 운영할 예정입니다."
    },
    {
      group: "설명회와 입학",
      q: "입학설명회는 언제, 어디서 하나요?",
      briefingDependent: true,
      a: "{date}\n{venue}에서 중3 학생과 학부모님을 대상으로 안내·상담을 진행합니다.",
      aAfter: "{year}학년도 설명회 일정({date})은 지났습니다.\n입학과 학과에 관한 문의는 전화 상담을 이용해 주세요."
    },
    {
      group: "설명회와 입학",
      q: "설명회 신청이 입학원서 접수인가요?",
      briefingDependent: true,
      a: "아닙니다. 설명회 사전등록은 행사 참여 신청입니다.\n입학원서는 정해진 원서접수 기간에 별도로 제출해야 합니다.",
      aAfter: null
    },
    {
      group: "설명회와 입학",
      q: "지원 기준과 방법은 어디서 보나요?",
      a: "모집인원과 원서접수 기간은 이 페이지의 입학 안내에서 확인할 수 있습니다.\n지원 자격·제출서류는 공식 모집요강이나 전화 상담으로 확인해 주세요."
    }
  ],

  /* ---------------- 현 고3 취업·진로 현황 (취업·진학 영역 맨 위에 표시) ----------------
   * 결과가 바뀌면 숫자와 updatedAt 을 함께 고치세요. 공개하지 않으려면 이 항목 전체를 null 로 두세요. */
  currentSeniors: {
    title: "현 고3 취업·진로 현황",
    cohort: "2026년 고3 · 2027년 졸업예정",
    updatedAt: "2026-09-29",
    civilService: {
      name: "지역인재 9급 공무원",
      applied: 4,
      firstStagePassed: 3,
      logo: {
        src: "assets/img/employers/gov-emblem.webp",
        width: 80,
        height: 84,
        alt: "대한민국 정부 상징",
        sourceNote: "기존 학교 제공 취업자료의 정부 상징 부분"
      }
    },
    military: [
      {
        name: "육군 부사관",
        count: 4,
        logo: {
          src: "https://www.army.mil.kr/sites/army/images/common/logo.png",
          alt: "대한민국 육군",
          sourcePage: "https://www.army.mil.kr/sites/army/index.do"
        }
      },
      {
        name: "공군 부사관",
        count: 1,
        logo: {
          src: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Emblem_of_the_Republic_of_Korea_Air_Force.svg",
          width: 512,
          height: 386,
          alt: "대한민국 공군 상징",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Emblem_of_the_Republic_of_Korea_Air_Force.svg"
        }
      }
    ],
    note: "공무원은 1차 합격 현황으로, 최종 합격 인원이 아닙니다."
  }
};
