/*
 * 군산여상 2027학년도 학과·입학 안내 — 화면 구성 스크립트
 * 콘텐츠는 assets/js/site-data.js 에서 수정합니다. 이 파일은 보통 수정할 필요가 없습니다.
 */
(function () {
  "use strict";

  var D = window.SITE_DATA;
  if (!D) return;

  var TZ = (D.briefing && D.briefing.timeZone) || "Asia/Seoul";
  var WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

  /* ---------- 작은 도우미 ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function icon(name, cls) {
    return '<svg class="icon' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }
  function tel(phone) { return "tel:" + String(phone).replace(/[^0-9+]/g, ""); }
  function has(v) { return v !== null && v !== undefined && v !== ""; }
  function extLink(url, label, cls, iconName) {
    return '<a class="' + cls + '" href="' + esc(url) + '" target="_blank" rel="noopener">' +
      (iconName ? icon(iconName) : "") + '<span>' + esc(label) + '</span>' + icon("external", "icon-sm") +
      '<span class="sr-only">(새 창)</span></a>';
  }

  /* ---------- 시간 (Asia/Seoul 기준) ---------- */
  // 확인용: 주소 끝에 ?now=2026-10-16T00:00:00%2B09:00 을 붙이면 그 시각 기준으로 화면을 미리 볼 수 있습니다.
  function getNow() {
    try {
      var p = new URLSearchParams(window.location.search).get("now");
      if (p) {
        var d = new Date(p);
        if (!isNaN(d)) { d.__review = true; return d; }
      }
    } catch (e) { /* 무시 */ }
    return new Date();
  }
  function seoulParts(date) {
    var f = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    });
    var o = {};
    f.formatToParts(date).forEach(function (p) { o[p.type] = p.value; });
    var y = +o.year, m = +o.month, d = +o.day;
    return {
      y: y, m: m, d: d, hh: o.hour, mm: o.minute,
      wd: WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()],
      dayIndex: Math.floor(Date.UTC(y, m - 1, d) / 86400000)
    };
  }
  function fmtDate(date) { var p = seoulParts(date); return p.y + ". " + p.m + ". " + p.d + ".(" + p.wd + ")"; }
  function fmtDateTime(date) { var p = seoulParts(date); return fmtDate(date) + " " + p.hh + ":" + p.mm; }
  function fmtShort(date) { var p = seoulParts(date); return p.m + ". " + p.d + ".(" + p.wd + ") " + p.hh + ":" + p.mm; }
  function fmtIsoDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || "");
    return m ? (+m[1]) + ". " + (+m[2]) + ". " + (+m[3]) + "." : "";
  }

  function fmtKTime(date) {
    // 화면용 시각: "오후 5시 30분"
    var p = seoulParts(date), h = +p.hh, m = +p.mm;
    return (h < 12 ? "오전 " : "오후 ") + (h % 12 || 12) + "시" + (m ? " " + m + "분" : "");
  }
  function fmtKDateTime(date) { return fmtDate(date) + " " + fmtKTime(date); }

  /* ---------- 설명회 상태 계산 ----------
   * off       : 설명회 비활성 또는 시작 시각 없음 → 입학 상담 안내
   * before    : 시작 전 (사전등록 가능 / 마감 / 등록 주소 없음으로 다시 나뉨)
   * ongoing   : 시작 시각이 지났고 아직 지난 행사로 넘어가기 전 (오늘 일정·참여 문의)
   * past      : archiveAt(또는 endAt) 경과, 또는 담당자가 manualStatus "held" 지정
   * cancelled : 담당자가 manualStatus "cancelled" 지정
   * 첫 화면·상단 버튼·모바일 고정바·설명회 영역·FAQ·QR 모두 이 값 하나로 판단합니다. */
  var now = getNow();
  var reviewMode = now.__review === true;
  var B = D.briefing || {};
  var start = B.startAt ? new Date(B.startAt) : null;
  var endAt = B.endAt ? new Date(B.endAt) : null;
  var archiveAt = B.archiveAt ? new Date(B.archiveAt) : null;
  if (!archiveAt && start) {
    // 별도 설정이 없으면 행사 다음 날 00:00(서울)부터 지난 행사로 처리
    var sp = seoulParts(start);
    archiveAt = new Date(Date.UTC(sp.y, sp.m - 1, sp.d + 1, 0, 0) - 9 * 3600000);
  }
  var regCloses = B.registrationClosesAt ? new Date(B.registrationClosesAt) : null;

  var phase = "off";
  if (B.enabled && start && !isNaN(start)) {
    if (B.manualStatus === "cancelled") phase = "cancelled";
    else if (B.manualStatus === "held") phase = "past";
    else if (now >= archiveAt || (endAt && now >= endAt)) phase = "past";
    else if (now >= start) phase = "ongoing";
    else phase = "before";
  }
  var held = B.manualStatus === "held";
  var hasReg = has(B.registrationUrl);
  var regOpen = phase === "before" && hasReg && (!regCloses || now < regCloses);
  var regClosed = phase === "before" && hasReg && !!regCloses && now >= regCloses;
  var dayDiff = start ? seoulParts(start).dayIndex - seoulParts(now).dayIndex : null;
  var dLabel = phase === "before" && dayDiff !== null ? (dayDiff > 0 ? "D-" + dayDiff : "D-DAY") : "";
  var venueShort = (B.venue || "").replace(D.schoolName, "").trim() || B.venue;

  document.documentElement.setAttribute("data-briefing", phase);

  /* ---------- 검색엔진용 구조화 데이터 (구글이 학교·설명회 정보를 이해하도록) ----------
   * 화면에는 보이지 않습니다. 설명회는 시작 전·당일에만 넣고, 지난 뒤·취소 시에는 뺍니다. */
  (function structuredData() {
    var canon = document.querySelector('link[rel="canonical"]');
    var siteUrl = canon ? canon.href : location.href.split(/[?#]/)[0];
    var school = {
      "@type": "HighSchool", "name": D.schoolName, "alternateName": D.schoolShortName,
      "url": D.schoolWebsite, "telephone": D.admissionsPhone,
      "address": { "@type": "PostalAddress", "streetAddress": D.address, "postalCode": D.postalCode, "addressCountry": "KR" }
    };
    var graph = [school];
    if ((phase === "before" || phase === "ongoing") && start) {
      var ev = {
        "@type": "Event", "name": B.title, "startDate": B.startAt,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": { "@type": "Place", "name": B.venue, "address": school.address },
        "description": String(B.intro || "").replace(/\n/g, " "),
        "organizer": { "@type": "HighSchool", "name": D.schoolName, "url": D.schoolWebsite },
        "image": [new URL("assets/img/share/share-briefing.jpg", siteUrl).href],
        "url": siteUrl, "isAccessibleForFree": true
      };
      if (B.endAt) ev.endDate = B.endAt;
      if (hasReg) ev.offers = { "@type": "Offer", "url": B.registrationUrl, "price": 0, "priceCurrency": "KRW", "availability": "https://schema.org/InStock" };
      graph.push(ev);
    }
    var sd = document.createElement("script");
    sd.type = "application/ld+json";
    sd.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.appendChild(sd);
  })();

  /* ---------- 데이터 점검 (개발자 도구 콘솔에 경고) ---------- */
  (function validate() {
    var depts = D.departments || [];
    var c = 0, s = 0;
    depts.forEach(function (d) {
      c += d.classes || 0; s += d.seats || 0;
      if (has(d.specialSeats) && has(d.generalSeats) && d.specialSeats + d.generalSeats !== d.seats) {
        console.warn("[site-data] " + d.name + " 특별+일반전형 인원이 모집인원과 다릅니다.");
      }
    });
    if (c !== D.totalClasses) console.warn("[site-data] 학과별 학급 수 합계(" + c + ")가 totalClasses(" + D.totalClasses + ")와 다릅니다.");
    if (s !== D.totalSeats) console.warn("[site-data] 학과별 모집인원 합계(" + s + ")가 totalSeats(" + D.totalSeats + ")와 다릅니다.");
    if (start && regCloses && regCloses > start) console.warn("[site-data] 사전등록 마감(registrationClosesAt)이 설명회 시작보다 늦습니다.");
    if (start && endAt && endAt <= start) console.warn("[site-data] 설명회 종료(endAt)가 시작보다 빠릅니다.");
    if (start && archiveAt && archiveAt <= start) console.warn("[site-data] archiveAt 이 설명회 시작보다 빠릅니다.");
    if (B.manualStatus && ["held", "cancelled"].indexOf(B.manualStatus) < 0) console.warn("[site-data] manualStatus 는 null, \"held\", \"cancelled\" 중 하나여야 합니다.");
  })();

  /* ---------- 검수 모드 안내 (?now= 사용 시) ---------- */
  if (reviewMode) {
    var rb = $("review-bar");
    rb.hidden = false;
    rb.innerHTML = '<strong>검수 모드</strong> · ' + esc(fmtDateTime(now)) + ' 기준으로 본 화면입니다. ' +
      '<a href="' + esc(location.pathname) + '">실제 화면 보기</a>';
  }

  /* ---------- 단순 값 연결 ---------- */
  var binds = {
    schoolName: D.schoolName, admissionYear: D.admissionYear, deptCount: (D.departments || []).length,
    totalClasses: D.totalClasses, totalSeats: D.totalSeats, seatsPerClass: D.seatsPerClass,
    vision: D.vision, motto: D.motto
  };
  Array.prototype.forEach.call(document.querySelectorAll("[data-bind]"), function (el) {
    var k = el.getAttribute("data-bind");
    if (has(binds[k])) el.textContent = binds[k];
  });

  if (D.badges && D.badges.length) {
    $("hero-badges").innerHTML = D.badges.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("");
  }

  /* ---------- 글로컬특성화고 로고·링크 ---------- */
  var G = D.glocal;
  if (G && has(G.url)) {
    var card;
    if (has(G.logo)) {
      // 로고에 학교 유형 이름이 들어 있으므로 로고 + 짧은 설명으로 구성
      card = '<a class="glocal-link has-logo" href="' + esc(G.url) + '" target="_blank" rel="noopener">' +
        '<span class="glocal-logo"><img src="' + esc(G.logo) + '"' +
          (G.logoWidth ? ' width="' + G.logoWidth + '"' : "") + (G.logoHeight ? ' height="' + G.logoHeight + '"' : "") +
          ' alt="' + esc(G.logoAlt || G.title) + '"></span>' +
        '<span class="glocal-foot"><span class="glocal-sub">' + esc(G.logoCaption || (G.title + " · " + G.subtitle)) + '</span>' +
        '<span class="glocal-more" aria-hidden="true"><span class="glocal-more-text">자세히 보기 </span>' + icon("external", "icon-sm") + '</span></span>' +
        '<span class="sr-only">(새 창)</span></a>';
    } else {
      card = '<a class="glocal-link" href="' + esc(G.url) + '" target="_blank" rel="noopener">' +
        '<span class="glocal-mark" aria-hidden="true">' + icon("spark") + '</span>' +
        '<span class="glocal-text"><strong>' + esc(G.title) + '</strong><small>' + esc(G.subtitle) + '</small></span>' +
        '<span class="glocal-more" aria-hidden="true"><span class="glocal-more-text">자세히 보기 </span>' + icon("external", "icon-sm") + '</span><span class="sr-only">(새 창)</span></a>';
    }
    // 첫 화면: 배지 대신 링크 카드 표시 / 하단: 작은 링크 카드
    $("hero-badges").hidden = true;
    $("glocal-hero").innerHTML = card;
    $("glocal-hero").hidden = false;
    $("glocal-footer").innerHTML = card;
    $("glocal-footer").hidden = false;
  }

  function seatText(d) {
    var t = d.classes + "학급 " + d.seats + "명";
    return t;
  }
  function typeText(d) {
    return has(d.specialSeats) && has(d.generalSeats)
      ? "특별전형 " + d.specialSeats + "명 · 일반전형 " + d.generalSeats + "명" : "";
  }
  function deptIcon(id) {
    return { erp: "company", marketing: "spark", fintech: "bank", cafe: "cafe" }[id] || "spark";
  }

  function deptQuota(d) {
    var tt = typeText(d);
    return d.classes + "학급 " + d.seats + "명 모집" + (tt ? " · " + tt : "");
  }
  /* Meaningful copy breaks; all inserted content is escaped. */
  function copyLines(value) {
    return String(value == null ? "" : value).split("\n").map(function (part) {
      return '<span class="copy-line">' + esc(part) + '</span>';
    }).join("");
  }
  function phoneLinks(cls) {
    var numbers = [D.admissionsPhone, D.admissionsPhoneSecondary].filter(function (n, i, all) {
      return has(n) && all.indexOf(n) === i;
    });
    return '<span class="phone-pair ' + (cls || "") + '">' + numbers.map(function (n, i) {
      return (i ? '<span class="phone-sep" aria-hidden="true">·</span>' : '') +
        '<a class="phone-number" href="' + tel(n) + '">' + esc(n) + '</a>';
    }).join("") + '</span>';
  }
  function certTag(value) {
    var at = value.indexOf("(");
    return at < 0 ? esc(value) : '<span class="cert-name">' + esc(value.slice(0, at)) +
      '</span><wbr><span class="cert-level">' + esc(value.slice(at)) + '</span>';
  }
  function certificates(d) {
    var groups = d.certificateGroups || [{ label: "", items: d.certificates || [] }];
    return (d.certificateLead ? '<p class="cert-lead">' + copyLines(d.certificateLead) + '</p>' : '') +
      groups.map(function (g) {
        return '<div class="cert-group">' + (g.label ? '<h5>' + esc(g.label) + '</h5>' : '') +
          '<ul class="cert-tags">' + g.items.map(function (c) { return '<li>' + certTag(c) + '</li>'; }).join('') + '</ul></div>';
      }).join('');
  }

  function img(im, cls, lazy, alt) {
    return '<img' + (cls ? ' class="' + cls + '"' : "") + ' src="' + esc(im.src) + '" width="' + im.width + '" height="' + im.height +
      '" alt="' + esc(alt != null ? alt : im.alt) + '"' + (lazy ? ' loading="lazy" decoding="async"' : "") + '>';
  }

  /* ---------- 첫 화면 학과 캐릭터 ---------- */
  // 휴대전화에서는 캐릭터 칸이 좁아 이름을 두 줄로 나눔 (ERP / 비즈니스과, 카페 / 비즈과)
  function heroName(name) {
    var m = /^([A-Za-z]+)(.+)$/.exec(name) || [null, name.slice(0, 2), name.slice(2)];
    return '<span class="hn">' + esc(m[1]) + '</span><span class="hn">' + esc(m[2]) + '</span>';
  }
  $("hero-depts").innerHTML = D.departments.map(function (d) {
    return '<li data-dept="' + esc(d.id) + '"><a href="#' + esc(d.id) + '">' + img(d.image) +
      '<span class="hero-dept-name">' + heroName(d.name) + '</span></a></li>';
  }).join("");

  /* ---------- 네 학과 한눈에 보기 (요약 카드) ---------- */
  $("dept-cards").innerHTML = D.departments.map(function (d) {
    return '<article class="dept-card" data-dept="' + esc(d.id) + '">' +
      '<div class="dept-card-img">' + img(d.image, "", true) + '</div>' +
      '<div class="dept-card-body">' +
        '<p class="dept-seats">' + esc(d.classes + "학급 " + d.seats + "명") + '</p>' +
        '<h3 class="dept-card-title"><a href="#' + esc(d.id) + '">' + esc(d.name) + '</a></h3>' +
        '<p class="dept-card-one">' + copyLines(d.easyLine || d.oneLiner) + '</p>' +
        '<ul class="keyword-list" aria-label="핵심 단어">' + d.keywords.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + '</ul>' +
        (d.interest ? '<p class="dept-card-interest"><span>이런 활동을 좋아한다면</span>' + esc(d.interest) + '</p>' : "") +
        '<span class="dept-card-more" aria-hidden="true">자세히 보기 ' + icon("arrow") + '</span>' +
      '</div></article>';
  }).join("");

  /* ---------- 학과별 자세히 보기: 한 번에 한 학과 (탭) ---------- */
  var deptIds = D.departments.map(function (d) { return d.id; });
  var grades = ["1학년", "2학년", "3학년"];
  $("dept-tabs").innerHTML = D.departments.map(function (d, i) {
    return '<button type="button" role="tab" class="dept-tab" id="tab-' + esc(d.id) + '" data-dept="' + esc(d.id) + '" aria-controls="' + esc(d.id) + '"' +
      ' aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' +
      img(d.image, "dept-tab-img", true, "") + '<span>' + esc(d.name) + '</span></button>';
  }).join("");
  $("dept-panels").innerHTML = D.departments.map(function (d, i) {
    return '<div class="dept-panel" role="tabpanel" id="' + esc(d.id) + '" data-dept="' + esc(d.id) + '" aria-labelledby="tab-' + esc(d.id) + '" tabindex="0"' + (i === 0 ? "" : " hidden") + '>' +
      '<div class="panel-head">' + img(d.image, "panel-avatar", true, "") +
        '<div><p class="panel-quota">' + esc(deptQuota(d)) + '</p>' +
        '<h3 class="dept-title">' + esc(d.name) + '</h3></div></div>' +
      '<p class="dept-easy">' + copyLines(d.easyLine || d.oneLiner) + '</p>' +
      (d.highlight ? '<p class="dept-highlight">' + icon("spark") + '<span>' + copyLines(d.highlight) + '</span></p>' : "") +
      '<p class="dept-intro">' + copyLines(d.intro) + '</p>' +
      (d.term ? '<p class="term-box"><strong>용어 풀이</strong>' + copyLines(d.term) + '</p>' : "") +

      '<h4 class="block-title">무엇을 배우나요</h4>' +
      '<ul class="check-list">' + d.learn.map(function (l) { return "<li>" + icon("check") + "<span>" + esc(l) + "</span></li>"; }).join("") + '</ul>' +

      '<div class="activity">' +
        '<p class="activity-head"><strong>수업 활동 예시</strong></p>' +
        '<p>' + copyLines(d.activity) + '</p>' +
      '</div>' +

      '<div class="panel-two">' +
        '<div class="career-summary"><h4 class="block-title">진출 분야</h4>' +
          (d.careerGroups && d.careerGroups.length
            ? d.careerGroups.map(function (g) {
                return '<p class="career-group-label">' + esc(g.label) + '</p><ul>' + g.items.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + '</ul>';
              }).join("")
            : '<ul>' + d.careers.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + '</ul>') +
        '</div>' +
        '<div class="cert-section"><h4 class="block-title">관련 자격·검정</h4>' + certificates(d) +
          '<p class="note">자격·검정 예시입니다. 운영 종목·등급·응시 지원은 학교 계획에 따릅니다.</p></div>' +
      '</div>' +

      '<details class="more-box"><summary>' + icon("chevron", "more-chevron") + '<span>교과목·학년별 수업 보기</span></summary>' +
        '<div class="more-body">' +
          '<p class="note">2027학년도 편성 계획 기준입니다.</p>' +
          '<h4 class="block-title">대표 교과목</h4>' +
          '<ul class="subject-list">' + d.subjects.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>' +
          '<h4 class="block-title">학년별 교육 흐름</h4>' +
          '<ol class="flow">' + d.flow.map(function (f, gi) {
            return '<li><span class="flow-grade">' + grades[gi] + '</span><span class="flow-text">' + esc(f) + '</span></li>';
          }).join("") + '</ol>' +
        '</div></details>' +
    '</div>';
  }).join("");

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function selectDept(id, opt) {
    opt = opt || {};
    if (deptIds.indexOf(id) < 0) return;
    deptIds.forEach(function (k) {
      var on = k === id, tab = $("tab-" + k);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
      var panel = $(k);
      if (on && panel.hidden) { panel.hidden = false; panel.classList.remove("panel-enter"); void panel.offsetWidth; panel.classList.add("panel-enter"); }
      if (!on) panel.hidden = true;
    });
    if (opt.focus) $("tab-" + id).focus();
    if (opt.history === "push" && location.hash !== "#" + id) history.pushState(null, "", "#" + id);
    if (opt.history === "replace" && location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    if (opt.scroll) $("dept-detail").scrollIntoView({ behavior: opt.instant || reduceMotion ? "auto" : "smooth", block: "start" });
  }
  $("dept-tabs").addEventListener("click", function (e) {
    var t = e.target.closest(".dept-tab");
    if (t) selectDept(t.getAttribute("data-dept"), { history: "push" });
  });
  $("dept-tabs").addEventListener("keydown", function (e) {
    var cur = deptIds.indexOf(document.activeElement && document.activeElement.getAttribute("data-dept"));
    if (cur < 0) return;
    var next = { ArrowRight: cur + 1, ArrowDown: cur + 1, ArrowLeft: cur - 1, ArrowUp: cur - 1, Home: 0, End: deptIds.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    next = (next + deptIds.length) % deptIds.length;
    selectDept(deptIds[next], { focus: true, history: "replace" });
  });
  // 페이지 곳곳의 #erp 같은 학과 링크: 해당 학과를 열고 상세 영역으로 이동
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (deptIds.indexOf(id) < 0) return;
    e.preventDefault();
    selectDept(id, { history: "push", scroll: true });
  });
  window.addEventListener("popstate", function () {
    var id = location.hash.slice(1);
    if (deptIds.indexOf(id) >= 0) selectDept(id, { scroll: true });
  });
  window.addEventListener("hashchange", function () {
    var id = location.hash.slice(1);
    if (deptIds.indexOf(id) >= 0) selectDept(id, { scroll: true });
  });

  /* ---------- 교육과 성장 지원 ---------- */
  $("support-lead").innerHTML = copyLines(D.supportLead || "");
  if (!D.supportLead) $("support-lead").remove();
  $("support-cards").innerHTML = (D.support || []).map(function (x) {
    return '<li class="support-card"><span class="support-icon">' + icon(x.icon) + '</span><h3>' + esc(x.title) + '</h3><p>' + copyLines(x.text) + '</p></li>';
  }).join("");
  // 장학금·지원 제도: 학교가 확정·승인해 site-data.js 에 입력한 항목만 표시
  var benefits = (D.benefits || []).filter(function (x) { return x && has(x.title); });
  if (benefits.length) {
    var bg = {};
    benefits.forEach(function (x) { (bg[x.group || "지원"] = bg[x.group || "지원"] || []).push(x); });
    $("benefits").hidden = false;
    $("benefits").innerHTML = '<h3 class="sub-title">장학금·지원 제도</h3>' + Object.keys(bg).map(function (g) {
      return '<h4 class="benefit-group">' + esc(g) + '</h4><ul class="benefit-cards">' + bg[g].map(function (x) {
        var row = function (k, v) { return has(v) ? "<div><dt>" + k + "</dt><dd>" + esc(v) + "</dd></div>" : ""; };
        return '<li class="benefit-card"><h5>' + esc(x.title) + '</h5><dl>' +
          row("대상", x.target) + row("지원 내용", x.content) + row("금액·기간", x.amount) + row("지급 방식", x.method) + row("기준", x.baseYear) +
          '</dl>' + (has(x.url) ? extLink(x.url, "공식 안내", "text-link", null) : "") + '</li>';
      }).join("") + '</ul>';
    }).join("");
  }

  /* ---------- 3년 성장 로드맵 (학년 선택) ---------- */
  var RM = D.roadmap;
  var gradeIds = [];
  if (RM && RM.grades && RM.grades.length) {
    gradeIds = RM.grades.map(function (g) { return g.id; });
    $("roadmap-lead").innerHTML = copyLines(RM.lead || "");
    $("roadmap-note").innerHTML = copyLines(RM.note || "");
    // 한눈에 보기: 학년별 핵심 프로그램 카드 (누르면 아래 학년 탭이 열림)
    $("rm-ov").innerHTML = RM.grades.map(function (g, i) {
      return '<li class="rm-ov-card g-' + (i + 1) + (g.programs.some(function (p) { return p.featured; }) ? ' has-featured' : '') + '">' +
        '<div class="rm-ov-top"><span class="rm-ov-num" aria-hidden="true">' + esc(g.num) + '</span>' +
          '<div><p class="rm-ov-grade">' + esc(g.grade) + ' · ' + esc(g.label) + '</p><h3>' + esc(g.headline) + '</h3></div></div>' +
        '<ul class="rm-ov-list">' + g.programs.map(function (p) {
          return '<li' + (p.featured ? ' class="is-featured"' : '') + '>' + icon(p.icon) + '<span>' + esc(p.title) +
            (p.badge ? ' <em class="rm-ov-badge">' + esc(p.badge.replace(/^운영\s*/, "")) + '</em>' : '') + '</span></li>';
        }).join("") + '</ul>' +
        (g.outcome && g.outcome.length ? '<p class="rm-ov-out"><span>이렇게 성장해요</span>' + g.outcome.map(esc).join(" · ") + '</p>' : '') +
        '<a class="rm-ov-more" href="#' + esc(g.id) + '">' + esc(g.grade) + ' 자세히 보기 ' + icon("arrow") + '</a>' +
      '</li>';
    }).join("");

    // 진로별 준비 흐름 도식: PC는 가로(학년 → 오른쪽), 휴대폰은 세로(위 → 아래)
    var TK = RM.tracks;
    if (TK && TK.lanes && TK.lanes.length) {
      var lanes = TK.lanes, cells = [], sr = [];
      var gName = function (k) { return RM.grades[k] ? RM.grades[k].grade : (k + 1) + "학년"; };
      var put = function (c) { cells.push(c); };
      // 칸 글자: \n 은 줄바꿈, 괄호로 시작하는 줄은 작은 글씨로 (예: "플래닝코칭반\n(공채·공무원 기초)")
      var stepHtml = function (when, text) {
        return '<small class="tk-when">' + esc(when) + '</small><span>' + String(text).split("\n").map(function (l) {
          return /^\(/.test(l) ? '<small class="tk-sub">' + esc(l) + '</small>' : '<span class="tk-line">' + esc(l) + '</span>';
        }).join("") + '</span>';
      };
      // 1학년 칸이 같은 앞쪽 진로들은 한 칸(공통 기초)에서 갈라지는 모양으로 그림
      var m = 1;
      while (m < lanes.length && lanes[m].steps[0] === lanes[0].steps[0]) m++;
      if (m < 2) m = 0;
      // 머리글 (PC)
      [0, 1, 2].forEach(function (k) { put({ cls: "tk-head", dc: (2 + 2 * k) + "", dr: "1", html: esc(gName(k)) }); });
      put({ cls: "tk-head is-goal", dc: "8", dr: "1", html: "졸업 후" });
      var mRow = m ? 8 : 1;
      lanes.forEach(function (ln, i) {
        var dr = (i + 2) + "", inGroup = i < m;
        var mc = inGroup ? (i + 1) + "" : "1 / -1";
        sr.push(ln.label + ": " + ln.steps.map(function (st, k) { return st === ln.steps[k - 1] ? "" : gName(k) + " " + st.replace(/\n/g, " "); })
          .filter(Boolean).join(" → ") + " → 졸업 후 " + [].concat(ln.goal).join(" 또는 ").replace(/\n/g, " "));
        put({ cls: "tk-label lane-" + (i + 1) + (inGroup ? " is-group" : ""), dc: "1", dr: dr, mc: "1 / -1", mr: inGroup ? "" : (mRow++) + "", html: icon(ln.icon) + '<span>' + esc(ln.label) + '</span>' });
        var k = 0, first = true, row = inGroup ? 1 : 0;
        var nextRow = function () { return inGroup ? (row++) + "" : (mRow++) + ""; };
        if (inGroup) {
          if (i === 0) {
            put({ cls: "tk-step tk-shared", dc: "2", dr: "2 / " + (2 + m), mc: "1 / -1", mr: "1", html: stepHtml(gName(0), ln.steps[0]) });
            put({ cls: "tk-fork tk-fork-" + m, dc: "3", dr: "2 / " + (2 + m), mc: "1 / -1", mr: "2", html: "" });
          }
          row = 3; k = 1; first = false;
        }
        while (k < ln.steps.length) {
          var e = k;
          while (e + 1 < ln.steps.length && ln.steps[e + 1] === ln.steps[k]) e++;
          var when = k === e ? gName(k) : gName(k).replace("학년", "") + "·" + gName(e);
          put({ cls: "tk-step lane-" + (i + 1) + (first ? "" : " in"), dc: (2 + 2 * k) + " / " + (3 + 2 * e), dr: dr, mc: mc, mr: nextRow(), html: stepHtml(when, ln.steps[k]) });
          put({ cls: "tk-conn", dc: (3 + 2 * e) + "", dr: dr, mc: mc, mr: nextRow(), html: "" });
          first = false; k = e + 1;
        }
        // 졸업 후 진로가 여러 갈래면 goal 을 ["…", "…"] 목록으로 (칸 안에 나란히 표시)
        var goals = [].concat(ln.goal);
        put({ cls: "tk-goal lane-" + (i + 1) + " in" + (goals.length > 1 ? " is-split" : ""), dc: "8", dr: dr, mc: mc, mr: nextRow(),
          html: '<small class="tk-when">졸업 후</small>' + (goals.length > 1
            ? '<span class="tk-goal-items">' + goals.map(function (g) { return '<span class="tk-goal-item">' + stepHtml("", g).replace('<small class="tk-when"></small>', '') + '</span>'; }).join('<em class="tk-or">또는</em>') + '</span>'
            : icon(ln.icon) + '<span>' + esc(goals[0]) + '</span>') });
      });
      $("rm-tracks").innerHTML =
        '<div class="rm-tracks-head"><p class="tk-kicker">' + icon("users") + '모든 학과</p><h3>' + esc(TK.title || "") + '</h3>' +
          (TK.notice ? '<p class="tk-notice">' + icon("check") + '<span>' + esc(TK.notice) + '</span></p>' : '') +
          (TK.lead ? '<p class="tk-lead">' + copyLines(TK.lead) + '</p>' : '') + '</div>' +
        '<div class="tk-grid tk-m' + m + '" aria-hidden="true">' + cells.map(function (c) {
          return '<div class="' + c.cls + '" style="--dc:' + c.dc + ';--dr:' + c.dr + ';--mc:' + (c.mc || c.dc) + ';--mr:' + (c.mr || "auto") + '">' + c.html + '</div>';
        }).join("") + '</div>' +
        '<ul class="sr-only">' + sr.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul>' +
        (TK.note ? '<p class="note">' + esc(TK.note) + '</p>' : '');
      $("rm-tracks").hidden = false;
    }

    // 카페비즈과 진로 경로: 1~3학년 공통 과정 → 졸업 후 두 방향 (PC 가로, 휴대폰 세로)
    var CP = RM.cafePath;
    if (CP && CP.steps && CP.goals && $("rm-tracks")) {
      var cafeHtml =
        '<div class="tk-plus" aria-hidden="true"><span>＋ 학과 전공교육</span></div>' +
        '<section class="cafe-path" data-dept="cafe" aria-labelledby="cafe-path-title">' +
          '<div class="cp-head">' +
            '<p class="cp-label">' + icon("cafe") + esc(CP.label) + '</p>' +
            '<h4 class="cp-title" id="cafe-path-title">' + esc(CP.title || CP.label) + '</h4>' +
            (CP.desc ? '<p class="cp-desc">' + icon("check") + '<span>' + esc(CP.desc) + '</span></p>' : '') +
            (CP.tagline ? '<p class="cp-tagline">' + esc(CP.tagline) + '</p>' : '') +
            (CP.intro ? '<p class="cp-intro">' + copyLines(CP.intro) + '</p>' : '') +
          '</div>' +
          '<div class="cp-flow">' +
            '<div class="cp-common"><p class="cp-common-label">' + esc(CP.commonLabel || "공통 과정") + '</p>' +
              '<ol class="cp-steps">' + CP.steps.map(function (st) {
                return '<li><small>' + esc(st.grade) + '</small><strong>' + esc(st.title) + '</strong>' + (st.sub ? '<span>' + esc(st.sub) + '</span>' : '') + '</li>';
              }).join("") + '</ol></div>' +
            '<div class="cp-fork" aria-hidden="true"></div>' +
            '<div class="cp-goals"><p class="cp-goals-label">' + esc(CP.goalsLabel || "졸업 후") + '</p>' +
              '<ul class="cp-goal-list">' + CP.goals.map(function (g, k) {
                return (k ? '<li class="cp-or" aria-hidden="true">또는</li>' : '') +
                  '<li class="cp-goal"><p class="cp-goal-title">' + icon(g.icon || "cafe") + '<span>' + esc(g.title) + '</span></p>' +
                  '<ul class="cp-goal-items">' + g.items.map(function (it) { return '<li>' + esc(it) + '</li>'; }).join("") + '</ul></li>';
              }).join("") + '</ul></div>' +
          '</div>' +
          (CP.subjects && CP.subjects.length ? '<div class="cp-foot"><p class="cp-subj-label">' + esc(CP.subjectsLabel || "") + '</p>' +
            '<ul class="cp-subjects">' + CP.subjects.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>' +
            (CP.extra ? '<p class="cp-extra">' + icon("info") + '<span>' + esc(CP.extra) + '</span></p>' : '') + '</div>' : '') +
        '</section>';
      $("rm-tracks").insertAdjacentHTML("beforeend", cafeHtml);
      $("rm-tracks").hidden = false;
    }
    $("rm-tabs").innerHTML = RM.grades.map(function (g, i) {
      return '<button type="button" role="tab" class="rm-tab" id="tab-' + esc(g.id) + '" data-grade="' + esc(g.id) + '" aria-controls="' + esc(g.id) + '"' +
        ' aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' +
        '<span class="rm-num">' + esc(g.num) + '</span><span class="rm-grade">' + esc(g.grade) + '</span><span class="rm-label">' + esc(g.label) + '</span></button>';
    }).join("");
    var pts = function (list) { return list && list.length ? '<ul class="rm-points">' + list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>' : ""; };
    var badge = function (b) { return b ? '<span class="plan-badge">' + esc(b) + '</span>' : ""; };
    $("rm-panels").innerHTML = RM.grades.map(function (g, i) {
      return '<div class="rm-panel" role="tabpanel" id="' + esc(g.id) + '" aria-labelledby="tab-' + esc(g.id) + '" tabindex="0"' + (i === 0 ? "" : " hidden") + '>' +
        '<div class="rm-head">' +
          '<p class="rm-step">' + esc(g.grade) + ' · ' + esc(g.stepKo) + '</p>' +
          '<h3 class="rm-headline">' + esc(g.headline) + '</h3>' +
          '<p class="rm-key">' + copyLines(g.keyLine) + '</p>' +
          '<p class="rm-goal"><strong>학년 목표</strong>' + esc(g.goal) + '</p>' +
        '</div>' +
        '<ul class="rm-cards">' + g.programs.map(function (pg, k) {
          return '<li class="rm-card' + (pg.featured ? " is-featured" : "") + '" style="--i:' + k + '">' +
            '<div class="rm-card-top"><span class="rm-icon">' + icon(pg.icon) + '</span><div><h4>' + esc(pg.title) + badge(pg.badge) +
              (pg.example ? '<span class="example-tag">예시</span>' : "") + '</h4>' +
            '<p class="rm-sub">' + copyLines(pg.sub) + '</p></div></div>' +
            pts(pg.points) +
            (pg.columns ? '<div class="rm-cols">' + pg.columns.map(function (c) {
              return '<div><p class="rm-col-label">' + esc(c.label) + '</p>' + pts(c.points) + '</div>';
            }).join("") + '</div>' : "") +
            (pg.subItems ? '<div class="rm-subitems">' + pg.subItems.map(function (x) {
              return '<div class="rm-subitem"><span class="rm-icon sm">' + icon(x.icon) + '</span><div><p class="rm-subitem-title">' + esc(x.title) + badge(x.badge) + '</p><p>' + esc(x.text) + '</p></div></div>';
            }).join("") + '</div>' : "") +
          '</li>';
        }).join("") + '</ul>' +
        (g.outcome && g.outcome.length ? '<div class="rm-outcome"><p class="rm-outcome-label">' + icon("spark") + '이렇게 성장해요</p><ul>' +
          g.outcome.map(function (x) { return "<li>" + icon("check") + "<span>" + esc(x) + "</span></li>"; }).join("") + '</ul></div>' : "") +
      '</div>';
    }).join("");
  } else {
    $("roadmap").hidden = true;
  }
  function selectGrade(id, opt) {
    opt = opt || {};
    if (gradeIds.indexOf(id) < 0) return;
    gradeIds.forEach(function (k) {
      var on = k === id, tab = $("tab-" + k);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
      var panel = $(k);
      if (on && panel.hidden) { panel.hidden = false; panel.classList.remove("rm-enter"); void panel.offsetWidth; panel.classList.add("rm-enter"); }
      if (!on) panel.hidden = true;
    });
    if (opt.focus) $("tab-" + id).focus();
    if (opt.history === "push" && location.hash !== "#" + id) history.pushState(null, "", "#" + id);
    if (opt.history === "replace" && location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    if (opt.scroll) ($("rm-detail-title") || $("roadmap")).scrollIntoView({ behavior: opt.instant || reduceMotion ? "auto" : "smooth", block: "start" });
  }
  if (gradeIds.length) {
    $("rm-tabs").addEventListener("click", function (e) {
      var t = e.target.closest(".rm-tab");
      if (t) selectGrade(t.getAttribute("data-grade"), { history: "replace" });
    });
    $("rm-tabs").addEventListener("keydown", function (e) {
      var cur = gradeIds.indexOf(document.activeElement && document.activeElement.getAttribute("data-grade"));
      if (cur < 0) return;
      var next = { ArrowRight: cur + 1, ArrowDown: cur + 1, ArrowLeft: cur - 1, ArrowUp: cur - 1, Home: 0, End: gradeIds.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      next = (next + gradeIds.length) % gradeIds.length;
      selectGrade(gradeIds[next], { focus: true, history: "replace" });
    });
    // #grade-2 같은 링크: 해당 학년을 열고 로드맵으로 이동
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href").slice(1);
      if (gradeIds.indexOf(id) < 0) return;
      e.preventDefault();
      selectGrade(id, { history: "push", scroll: true });
    });
    window.addEventListener("popstate", function () {
      var id = location.hash.slice(1);
      if (gradeIds.indexOf(id) >= 0) selectGrade(id, { scroll: true });
    });
  }


  /* ---------- 현 고3: 공무원은 1차 합격, 부사관 인원은 기존 안내 유지 ---------- */
  var senior = D.currentSeniors;
  /* 외부 누리집에서 불러오는 로고는 주소가 바뀌면 깨질 수 있어, 실패하면 대체 표시로 바꿉니다.
   *  data-fallback="icon"   : 분야 아이콘으로 대신 표시 (취업처)
   *  data-fallback="remove" : 로고 칸을 빼고 이름만 표시 (진학 대학)
   *  data-fallback="hide"   : 자리만 두고 숨김 (현 고3 현황) */
  document.addEventListener("error", function (e) {
    var im = e.target;
    if (!im || im.tagName !== "IMG" || !im.hasAttribute("data-fallback")) return;
    var box = im.parentNode, mode = im.getAttribute("data-fallback");
    if (!box) return;
    if (mode === "icon") {
      box.className = "emp-logo is-placeholder";
      box.setAttribute("aria-hidden", "true");
      box.innerHTML = icon(box.getAttribute("data-icon") || "company");
    } else if (mode === "remove") {
      box.parentNode.removeChild(box);
    } else {
      im.hidden = true;
      box.classList.add("logo-unavailable");
    }
  }, true);
  function logoImg(logo, alt, fallback) {
    var remote = /^https?:/.test(logo.src);
    return '<img src="' + esc(logo.src) + '"' +
      (logo.width ? ' width="' + logo.width + '"' : '') + (logo.height ? ' height="' + logo.height + '"' : '') +
      ' alt="' + esc(alt) + '" loading="lazy" decoding="async"' +
      (remote ? ' referrerpolicy="no-referrer"' : '') + ' data-fallback="' + fallback + '">';
  }
  function seniorLogo(item) {
    if (!item.logo || !item.logo.src) return '';
    if (item.logo.layout === "army-aligned") {
      return '<div class="senior-logo army-aligned" role="img" aria-label="대한민국 육군"><span class="army-symbol">' + logoImg(item.logo, "", "hide") + '</span><span class="army-korean">' + logoImg(item.logo, "", "hide") + '</span><span class="army-english">' + logoImg(item.logo, "", "hide") + '</span></div>';
    }
    return '<div class="senior-logo">' + logoImg(item.logo, "", "hide") + '</div>';
  }
  if (senior && $("senior-status")) {
    var exams = senior.exams || (senior.civilService ? [senior.civilService] : []);
    $("senior-status").hidden = false;
    $("senior-status").innerHTML =
      '<div class="senior-status-head"><div><h3 id="senior-status-title">' + esc(senior.title) + '</h3><p class="senior-cohort">' + esc(senior.cohort) + '</p></div>' +
      '<span class="senior-updated">' + esc(fmtIsoDate(senior.updatedAt)) + ' 기준</span></div>' +
      '<div class="senior-grid">' + exams.map(function (ex, index) {
          return '<article class="senior-card is-exam exam-' + (index + 1) + '">' + seniorLogo(ex) + '<h4>' + esc(ex.name) + '</h4>' +
            '<div class="senior-flow"><div class="senior-metric"><strong>' + ex.applied + '<span class="unit">명</span></strong><span>지원</span></div><span class="senior-arrow" aria-hidden="true">→</span>' +
            '<div class="senior-metric is-pass"><strong>' + ex.firstStagePassed + '<span class="unit">명</span></strong><span>1차 합격</span></div></div></article>';
        }).join('') +
        (senior.military || []).map(function(item, index) {
          return '<article class="senior-card ' + (index === 0 ? 'is-army' : 'is-airforce') + '">' + seniorLogo(item) + '<h4>' + esc(item.name) + '</h4><div class="senior-metric"><strong>' + item.count + '<span class="unit">명</span></strong></div></article>';
        }).join('') + '</div>' +
      '<p class="note">' + esc(senior.note) + '</p>';
  }

  /* ---------- 주요 취업 성과 ---------- */
  var EM = D.employment;
  if (EM && EM.categories && EM.categories.length) {
    $("careers-title").textContent = EM.title || "";
    $("careers-lead").innerHTML = copyLines(EM.lead || "");
    $("careers-note").innerHTML = copyLines(EM.note || "");
    $("emp-cats").innerHTML = EM.categories.map(function (c) {
      return '<div class="emp-cat" data-cat="' + esc(c.id) + '"><h3 class="emp-cat-title">' + icon(c.icon) + esc(c.title) + '</h3>' +
        '<ul class="emp-grid">' + c.items.map(function (it) {
          return '<li class="emp-item">' +
            (it.logo ? '<span class="emp-logo" data-icon="' + esc(c.icon) + '">' + logoImg(it.logo, "", "icon") + '</span>' : '<span class="emp-logo is-placeholder" aria-hidden="true">' + icon(c.icon) + '</span>') +
            '<span class="emp-name">' + (it.nameParts ? it.nameParts.map(function (part) { return '<span class="emp-name-chunk">' + esc(part) + '</span>'; }).join('<wbr>') : esc(it.name)) + (it.count > 1 ? ' <b class="emp-count">' + it.count + '명</b>' : "") + '</span></li>';
        }).join("") + '</ul></div>';
    }).join("");
  } else {
    $("careers").hidden = true;
  }
  if (D.publishAwards && D.awards && D.awards.length) {
    $("awards").hidden = false;
    $("awards").innerHTML = '<h3 class="sub-title">대회 성과</h3><ul class="award-list">' + D.awards.map(function (x) {
      return "<li><strong>" + esc(x.title) + "</strong><span>" + esc(x.detail) + "</span></li>";
    }).join("") + "</ul>";
  }

  /* ---------- 대학 진학: 대표 대학명만 표시 ---------- */
  var CO = D.college;
  if (CO) {
    $("college").innerHTML =
      '<div class="college-head">' + icon("study") + '<div><h3 id="college-title">' + esc(CO.title) + '</h3><p>' + copyLines(CO.lead) + '</p></div></div>' +
      (CO.schools && CO.schools.length
        ? '<ul class="college-schools" aria-label="주요 진학 대학">' + CO.schools.map(function (school) {
            var logo = CO.logos && CO.logos[school];
            return '<li>' + (logo && logo.src
              ? '<span class="college-logo' + (logo.variant === "reverse" ? ' college-logo--reverse' : '') + '">' + logoImg(logo, "", "remove") + '</span>'
              : '') + '<strong>' + esc(school) + '</strong></li>';
          }).join("") + '</ul>'
        : '') +
      (CO.note ? '<p class="note">' + esc(CO.note) + '</p>' : "");
  } else {
    $("college").remove();
  }

  /* ---------- 학교생활 사진 ---------- */
  if (D.showSchoolLifePhotos && D.schoolLife && D.schoolLife.length) {
    $("school-life").hidden = false;
    $("photo-grid").innerHTML = D.schoolLife.filter(function (x) { return x.show !== false; }).map(function (x) {
      return '<li><figure><div class="photo-frame"><button type="button" class="zoom-btn" data-zoom="' + esc(x.src) + '" data-caption="' + esc(x.caption) + '" aria-label="' + esc(x.caption) + ' 사진 크게 보기">' + img(x, "", true) + '</button></div>' +
        '<figcaption><strong class="photo-title">' + esc(x.caption) + '</strong></figcaption></figure></li>';
    }).join("");
  }

  /* ---------- 실습환경 ---------- */
  var planned = D.facilitiesStatus !== "completed";
  $("facility-cards").innerHTML = (D.facilities || []).map(function (f) {
    var img = f.image && has(f.image.src);
    return '<li class="facility-card' + (img ? " has-image" : "") + '">' +
      (img
        ? '<figure class="facility-photo"><button type="button" class="zoom-btn" data-zoom="' + esc(f.image.src) + '" data-caption="' + esc(f.name + " · " + (f.imageLabel || "조성 예시 이미지")) + '" aria-label="' + esc(f.name) + ' 이미지 크게 보기"><img src="' + esc(f.image.src) + '"' +
            (f.image.width ? ' width="' + f.image.width + '"' : "") + (f.image.height ? ' height="' + f.image.height + '"' : "") +
            ' alt="' + esc(f.image.alt || f.name + " " + (f.imageLabel || "")) + '" loading="lazy" decoding="async"><span class="zoom-hint" aria-hidden="true">크게 보기</span></button>' +
            '<figcaption class="photo-label">' + esc(f.imageLabel || "조성 예시 이미지") + '</figcaption></figure>'
        : '<div class="facility-visual" aria-hidden="true">' + icon(f.icon) + '</div>') +
      '<span class="status-badge' + (planned ? "" : " done") + '">' + esc(f.status) + '</span>' +
      '<h3>' + esc(f.name) + '</h3>' +
      '<p class="facility-target">' + esc(f.target) + '</p>' +
      '<p>' + copyLines(f.text) + '</p></li>';
  }).join("");
  if (!planned) $("facility-note").remove();

  /* ---------- 입학 안내: 원서접수 기간과 모집인원을 바로 표시 ---------- */
  var fullTable = !!D.publishFullAdmissionTypeTable;
  var sumSpecial = 0, sumGeneral = 0, allTypes = true;
  var rows = D.departments.map(function (d) {
    if (has(d.specialSeats) && has(d.generalSeats)) { sumSpecial += d.specialSeats; sumGeneral += d.generalSeats; }
    else allTypes = false;
    return '<tr><th scope="row"><span class="dot" data-dept="' + esc(d.id) + '"></span>' + esc(d.name) + '</th>' +
      '<td><strong>' + d.seats + '명</strong></td>' +
      (fullTable ? '<td>' + (has(d.specialSeats) ? d.specialSeats + '명' : '확인 중') + '</td><td>' + (has(d.generalSeats) ? d.generalSeats + '명' : '확인 중') + '</td>' : '') + '</tr>';
  }).join('');
  $("seats-table").innerHTML = '<caption class="sr-only">' + esc(D.admissionYear) + '학년도 모집학과와 전형별 인원</caption>' +
    '<colgroup><col class="col-dept"><col class="col-count">' + (fullTable ? '<col class="col-count"><col class="col-count">' : '') + '</colgroup>' +
    '<thead><tr><th scope="col">학과</th><th scope="col">총원</th>' +
    (fullTable ? '<th scope="col"><span>특별</span><span>전형</span></th><th scope="col"><span>일반</span><span>전형</span></th>' : '') + '</tr></thead>' +
    '<tbody>' + rows + '</tbody><tfoot><tr><th scope="row">합계</th><td><strong>' + D.totalSeats + '명</strong></td>' +
    (fullTable ? '<td>' + (allTypes ? sumSpecial + '명' : '확인 중') + '</td><td>' + (allTypes ? sumGeneral + '명' : '확인 중') + '</td>' : '') + '</tr></tfoot>';
  $("seats-note").textContent = D.departments.length + '개 학과 · ' + D.totalClasses + '학급 · 총 ' + D.totalSeats + '명 모집';
  function scheduleDate(value) {
    var parts = String(value).split(/\s+~\s+/);
    var end = parts.length === 2 && parts[1].match(/^(.*?)(\d{1,2}:\d{2})까지$/);
    if (!end) return copyLines(value);
    return '<div class="schedule-date"><span>' + esc(parts[0]) + ' ~</span> <span>' + esc(end[1].trim()) + '</span></div>' +
      '<span class="schedule-deadline">마감일 ' + esc(end[2]) + '까지</span>';
  }
  if (D.publishDetailedAdmissionSchedule && D.admissionSchedule && D.admissionSchedule.length) {
    $("schedule-card").innerHTML = '<h3 class="card-title">원서접수 기간</h3><dl class="schedule-dl">' +
      D.admissionSchedule.map(function (x) { return '<div><dt>' + esc(x.label) + '</dt><dd>' + scheduleDate(x.value) + '</dd></div>'; }).join('') +
      '</dl><p class="note">지원 자격·제출서류·세부 일정은 공식 모집요강을 확인해 주세요.</p>';
  }
  var adm = ['<div class="admission-contact"><h3>' + icon('phone') + '입학 상담</h3>' + phoneLinks() + '</div>'];
  if (has(D.admissionsPageUrl)) adm.push(extLink(D.admissionsPageUrl, '공식 모집요강', 'btn btn-outline btn-block', 'link'));
  if (has(D.admissionsNoticeUrl)) adm.push(extLink(D.admissionsNoticeUrl, '입학 공지사항', 'btn btn-outline btn-block', 'info'));
  if (has(D.admissionsPdfUrl)) adm.push('<a class="btn btn-outline btn-block" href="' + esc(D.admissionsPdfUrl) + '" download target="_blank" rel="noopener">' + icon('download') + '<span>모집요강 내려받기</span></a>');
  $("admissions-actions").innerHTML = adm.join('');

  /* ---------- 입학설명회 ---------- */
  var telBtn = function (label, cls) {
    return '<div class="phone-cta ' + cls + '"><p>' + icon("phone") + esc(label) + '</p>' + phoneLinks() + '</div>';
  };
  var officialBtn = function (cls) {
    return has(D.admissionsPageUrl) ? extLink(D.admissionsPageUrl, "공식 모집요강", cls, "link") : "";
  };
  var sepWarn = '<p class="brief-warn">' + icon("info") + '<span>설명회 사전등록과 <strong>입학원서 접수는 별개</strong>입니다.</span></p>';

  if (phase === "off") {
    $("briefing").hidden = true;
  } else {
    var whenStr = fmtKDateTime(start) + (endAt ? " ~ " + fmtKTime(endAt) : "");
    var info =
      '<dl class="brief-dl">' +
        '<div><dt>' + icon("calendar") + '일시</dt><dd><span class="nowrap">' + esc(fmtDate(start)) + '</span> <strong class="nowrap">' + esc(fmtKTime(start) + (endAt ? " ~ " + fmtKTime(endAt) : "")) + '</strong></dd></div>' +
        '<div><dt>' + icon("pin") + '장소</dt><dd>' + esc(venueShort) + '</dd></div>' +
        '<div><dt>' + icon("users") + '대상</dt><dd>' + esc(B.audience) + '</dd></div>' +
        '<div><dt>' + icon("phone") + '문의</dt><dd>' + phoneLinks() + '</dd></div>' +
      '</dl>';
    var program = '<h3 class="brief-sub">주요 내용</h3><ul class="program-list">' +
      (B.program || []).map(function (x) { return "<li>" + icon("check") + esc(x) + "</li>"; }).join("") + '</ul>';

    var cta;
    if (regOpen) {
      cta = '<h3>입학설명회 사전등록</h3>' +
        '<p>참석할 학생·학부모님은 미리 신청해 주세요.' + (regCloses ? " 사전등록 마감: " + esc(fmtKDateTime(regCloses)) : "") + '</p>' +
        extLink(B.registrationUrl, "입학설명회 사전등록", "btn btn-yellow btn-lg btn-block", "calendar") +
        '<div class="qr-box" id="qr-box" hidden><div id="qr-target"></div><p>휴대전화로 QR을 찍어 신청할 수 있어요.</p></div>' + sepWarn;
    } else if (regClosed) {
      cta = '<h3>사전등록이 마감되었습니다</h3>' +
        '<p>현장 참여 가능 여부는 입학 상담 전화로 문의해 주세요.</p>' +
        telBtn("참여 문의", "btn-yellow btn-lg btn-block") + officialBtn("btn btn-ghost btn-block") + sepWarn;
    } else if (phase === "before") {
      cta = '<h3>설명회 참여 문의</h3>' +
        '<p>신청 방법은 확정 후 안내합니다. 참여 문의는 전화로 연락해 주세요.</p>' +
        telBtn("참여 문의", "btn-yellow btn-lg btn-block") + officialBtn("btn btn-ghost btn-block") + sepWarn;
    } else if (phase === "ongoing") {
      cta = '<h3>오늘 열리는 입학설명회</h3>' +
        '<p>' + esc(fmtKTime(start)) + ', ' + esc(B.venue) + '에서 열립니다. 참여와 관련한 문의는 입학 상담 전화로 연락해 주세요.</p>' +
        telBtn("참여 문의", "btn-yellow btn-lg btn-block") + officialBtn("btn btn-ghost btn-block");
    } else {
      cta = '<h3>입학 상담 안내</h3>' +
        '<p>학과와 입학에 관한 궁금한 점을 물어보세요.</p>' +
        telBtn("입학 상담", "btn-yellow btn-lg btn-block") + officialBtn("btn btn-ghost btn-block");
    }
    cta = '<div class="brief-cta">' + cta + shareButtons("링크 복사", "공유하기") + '</div>';

    var gifts = ((phase === "before" || phase === "ongoing") && B.giftsPublished && has(B.giftsText))
      ? '<div class="gift-box">' + icon("spark") + '<div class="gift-copy"><strong>' + (B.giftsParts && B.giftsParts.length ? B.giftsParts.map(function (part) { return '<span class="gift-part">' + esc(part) + '</span>'; }).join(' ') : esc(B.giftsText)) + '</strong>' + (B.giftsDetail ? '<span class="gift-detail">' + B.giftsDetail.split(' · ').map(function (part, i, all) { return '<span class="gift-part">' + esc(part) + (i < all.length - 1 ? ' ·' : '') + '</span>'; }).join(' ') + '</span>' : '') + '</div></div>' : "";

    var badge = phase === "before" ? (dLabel ? ' <span class="dday">' + esc(dLabel) + '</span>' : "")
      : phase === "ongoing" ? ' <span class="dday">오늘</span>'
      : phase === "past" ? ' <span class="past-badge">지난 설명회 일정</span>'
      : ' <span class="past-badge">변경 안내</span>';
    var lead = (phase === "before" || phase === "ongoing") ? B.intro
      : phase === "past" ? (held
          ? fmtKDateTime(start) + ", " + B.venue + "에서 진행되었습니다. 참석해 주신 학생과 학부모님께 감사드립니다."
          : "지난 설명회 일정입니다. 입학과 관련해 궁금한 점은 입학 상담으로 문의해 주세요.")
      : (B.manualNotice || "입학설명회 일정이 변경되었습니다. 자세한 내용은 입학 상담으로 문의해 주세요.");

    $("briefing-body").innerHTML =
      '<div class="section-head light">' +
        '<p class="eyebrow">' + D.admissionYear + '학년도' + badge + '</p>' +
        '<h2 class="section-title" id="briefing-title">' + esc(phase === 'before' || phase === 'ongoing' ? '입학설명회에 초대합니다' : '입학설명회 안내') + '</h2>' +
        '<p class="section-lead">' + copyLines(lead) + '</p>' + gifts +
      '</div>' +
      '<div class="brief-grid">' +
        '<div class="brief-card' + (phase === "past" || phase === "cancelled" ? " is-past" : "") + '">' + info +
          (phase === "before" || phase === "ongoing" ? program : "") + '</div>' +
        cta +
      '</div>';

    if (regOpen) renderQr();
  }

  function renderQr() {
    var box = $("qr-box"), target = $("qr-target");
    if (!box || !target) return;
    if (has(B.registrationQrImage)) {
      target.innerHTML = '<img src="' + esc(B.registrationQrImage) + '" width="160" height="160" alt="입학설명회 사전등록 QR 코드">';
      box.hidden = false;
      return;
    }
    // 등록 주소로 QR을 자동 생성 (라이브러리를 불러오지 못하면 QR 없이 버튼만 표시)
    var sc = document.createElement("script");
    sc.src = "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js";
    sc.async = true;
    sc.onload = function () {
      try {
        var qr = window.qrcode(0, "M");
        qr.addData(B.registrationUrl);
        qr.make();
        target.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: "입학설명회 사전등록 QR 코드" });
        box.hidden = false;
      } catch (err) { /* QR 생략 */ }
    };
    document.head.appendChild(sc);
  }

  /* ---------- 첫 화면 설명회 카드 (신청 버튼 옆에 날짜·시간·장소) ---------- */
  var hb = $("hero-briefing");
  if (phase === "before" || phase === "ongoing") {
    hb.innerHTML =
      '<div class="hb-info">' +
        '<p class="hb-tag">입학설명회' + (phase === "before" && dLabel ? ' <b>' + esc(dLabel) + '</b>' : "") + (phase === "ongoing" ? " <b>오늘</b>" : "") + '</p>' +
        '<p class="hb-when">' + icon("calendar") + '<span class="hb-datetime"><span>' + esc(fmtDate(start)) + '</span><span>' + esc(fmtKTime(start)) + '</span></span></p>' +
        '<p class="hb-where">' + icon("pin") + '<span>' + esc(venueShort) + '</span></p>' +
      '</div>' +
      '<div class="hb-actions">' +
        (regOpen ? extLink(B.registrationUrl, "사전등록", "btn btn-yellow", "calendar")
          : '<a class="btn btn-yellow" href="' + tel(D.admissionsPhone) + '">' + icon("phone") + '<span>' + "참여 문의" + '</span></a>') +
        '<a class="btn btn-ghost" href="#briefing">자세히</a>' +
      '</div>';
  } else {
    hb.classList.add("is-consult");
    hb.innerHTML =
      '<div class="hb-info"><p class="hb-tag">입학 상담</p>' + phoneLinks() +
        (phase === "past" ? '<p class="hb-where">' + icon("calendar") + '<span>지난 설명회 일정: ' + esc(fmtDate(start)) + '</span></p>' : "") + '</div>' +
      '<div class="hb-actions"><a class="btn btn-yellow" href="' + tel(D.admissionsPhone) + '">' + icon("phone") + '<span>전화 상담</span></a>' +
        '<a class="btn btn-ghost" href="#admissions">입학 안내</a></div>';
  }
  hb.hidden = false;

  /* ---------- 상단 버튼·모바일 고정바 ---------- */
  var headerCta = $("header-cta");
  var mb = '<a class="mb-btn mb-call" href="' + tel(D.admissionsPhone) + '">' + icon("phone") + '<span>입학 상담</span></a>';
  if (regOpen) {
    headerCta.innerHTML = '설명회 사전등록<span class="sr-only">(새 창)</span>';
    headerCta.setAttribute("href", B.registrationUrl);
    headerCta.setAttribute("target", "_blank");
    headerCta.setAttribute("rel", "noopener");
    mb += '<a class="mb-btn mb-main" href="' + esc(B.registrationUrl) + '" target="_blank" rel="noopener">' + icon("calendar") + '<span>설명회 사전등록</span><span class="sr-only">(새 창)</span></a>';
  } else if (phase === "before" || phase === "ongoing") {
    headerCta.textContent = "입학설명회";
    headerCta.setAttribute("href", "#briefing");
    mb += '<a class="mb-btn mb-main" href="#briefing">' + icon("calendar") + '<span>' + (phase === "ongoing" ? "오늘 설명회 안내" : "설명회 안내" + (dLabel ? " " + esc(dLabel) : "")) + '</span></a>';
  } else {
    headerCta.textContent = "입학 상담";
    headerCta.setAttribute("href", tel(D.admissionsPhone));
    mb += '<a class="mb-btn mb-main" href="#admissions">' + icon("info") + '<span>입학 안내</span></a>';
  }
  $("mobile-bar").innerHTML = mb;

  /* ---------- 자주 묻는 질문 ---------- */
  var faqVars = {
    date: start ? fmtKDateTime(start) : "", venue: B.venue || "", year: D.admissionYear
  };
  function fill(t) { return String(t).replace(/\{(\w+)\}/g, function (_, k) { return faqVars[k] != null ? faqVars[k] : ""; }); }
  var faqGroups = [], faqByGroup = {};
  (D.faq || []).forEach(function (f) {
    var a = f.a;
    if (f.briefingDependent) {
      if (phase === "off" || phase === "cancelled") return;
      if (phase === "past") a = f.aAfter;
      if (!has(a)) return;
    }
    var g = f.group || "";
    if (!faqByGroup[g]) { faqByGroup[g] = []; faqGroups.push(g); }
    faqByGroup[g].push('<details class="faq-item"><summary><span class="faq-q">Q</span><span class="faq-text">' + esc(fill(f.q)) + '</span>' + icon("chevron", "faq-chevron") + '</summary>' +
      '<div class="faq-answer"><p>' + copyLines(fill(a)) + '</p></div></details>');
  });
  $("faq-list").innerHTML = faqGroups.map(function (g) {
    return (g ? '<h3 class="faq-group">' + esc(g) + '</h3>' : "") + faqByGroup[g].join("");
  }).join("");

  /* ---------- 찾아오는 길 ---------- */
  var addr = encodeURIComponent(D.address);
  $("contact-grid").innerHTML =
    '<div class="contact-card">' +
      '<h3>' + icon("pin") + '주소</h3>' +
      '<p class="contact-addr">' + esc(D.address) + (has(D.postalCode) ? ' <span class="muted">(우 ' + esc(D.postalCode) + ')</span>' : "") + '</p>' +
      '<div class="btn-row">' +
        extLink("https://map.naver.com/p/search/" + addr, "네이버 지도", "btn btn-outline", "map") +
        extLink("https://map.kakao.com/link/search/" + addr, "카카오맵", "btn btn-outline", "map") +
      '</div>' +
      '<p class="note">지도 앱에서 학교 주소로 검색합니다.</p>' +
    '</div>' +
    '<div class="contact-card">' +
      '<h3>' + icon("phone") + '입학 상담</h3>' + phoneLinks('contact-phones') +
      extLink(D.schoolWebsite, "학교 홈페이지", "btn btn-primary btn-block", "home") +
    '</div>';

  $("footer-share").innerHTML = shareButtons("주소 복사", "공유하기", "btn-ghost btn-sm");

  /* ---------- 하단 ---------- */
  $("footer-info").innerHTML =
    '<span>' + esc(D.address) + (has(D.postalCode) ? " (우 " + esc(D.postalCode) + ")" : "") + '</span>' +
    '<div class="footer-phones"><span>입학 상담</span>' + phoneLinks() + '</div>' +
    '<span><a href="' + esc(D.schoolWebsite) + '" target="_blank" rel="noopener">학교 홈페이지<span class="sr-only">(새 창)</span></a></span>';
  $("footer-meta").textContent = D.admissionYear + "학년도 학과·입학 안내 · 지원 기준은 공식 모집요강을 따릅니다. · 기준일 " + fmtIsoDate(D.contentUpdatedAt);

  /* ---------- 링크 복사·공유 ---------- */
  function shareButtons(copyLabel, shareLabel, cls) {
    cls = cls || "btn-outline";
    return '<div class="share-row">' +
      '<button type="button" class="btn ' + cls + ' js-copy-link">' + icon("copy") + '<span>' + esc(copyLabel) + '</span></button>' +
      '<button type="button" class="btn ' + cls + ' js-share-link" hidden>' + icon("share") + '<span>' + esc(shareLabel) + '</span></button>' +
      '</div>';
  }
  function pageUrl() {
    // ?now= 미리보기 값이나 #위치는 빼고 페이지 주소만 공유
    return /^https?:$/.test(location.protocol) ? location.origin + location.pathname : location.href.split(/[?#]/)[0];
  }
  var toastTimer;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject();
    });
  }
  var shareText = (phase === "before" || phase === "ongoing") && start
    ? D.admissionYear + "학년도 " + D.schoolShortName + " 입학설명회 " + fmtShort(start) + " · 학과·입학 안내"
    : D.schoolName + " " + D.admissionYear + "학년도 학과·입학 안내";
  if (navigator.share) {
    Array.prototype.forEach.call(document.querySelectorAll(".js-share-link"), function (b) { b.hidden = false; });
  }
  document.addEventListener("click", function (e) {
    var copyBtn = e.target.closest(".js-copy-link"), shareBtn = e.target.closest(".js-share-link");
    if (copyBtn) {
      var url = pageUrl();
      copyText(url).then(function () {
        toast("링크를 복사했어요. 카카오톡·문자에 붙여 넣어 보내세요.");
      }, function () {
        window.prompt("아래 주소를 길게 눌러 복사하세요.", url);
      });
    } else if (shareBtn) {
      navigator.share({ title: document.title, text: shareText, url: pageUrl() }).catch(function () { /* 취소 */ });
    }
  });

  /* ---------- 모바일 메뉴 ---------- */
  var toggle = $("menu-toggle"), nav = $("site-nav"), header = $("site-header");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    toggle.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
    header.classList.toggle("menu-open", open);
    document.body.classList.toggle("no-scroll", open);
  }
  toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 1100px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });

  /* ---------- 스크롤 시 상단 그림자 / 학과 바로가기 현재 위치 ---------- */
  var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 움직임: 스크롤하면 부드럽게 나타나기 (움직임 줄이기 설정 시 끔) ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("anim");
    var revealSel = [
      ".section-head", ".about-body", ".vision", ".ai-link", ".points li", ".dept-card", ".dept-tabs", ".rm-ov-card", ".rm-tracks", ".rm-tabs",
      ".emp-cat", ".emp-item", ".college", ".support-card", ".benefit-card", ".photo-grid li", ".facility-card",
      ".table-card", ".info-card", ".btn-stack", ".brief-card", ".brief-cta", ".faq-group", ".faq-item", ".contact-card"
    ].join(",");
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(document.querySelectorAll(revealSel), function (el) {
      if (el.closest(".hero")) return;
      // 같은 줄 형제끼리 조금씩 늦게 (최대 6단계)
      var i = 0, sib = el.previousElementSibling;
      while (sib && i < 6) { if (sib.matches && sib.matches(revealSel)) i++; sib = sib.previousElementSibling; }
      el.style.setProperty("--d", (i * 70) + "ms");
      el.classList.add("reveal");
      revealIO.observe(el);
    });
  }

  /* ---------- 이미지 크게 보기 ---------- */
  var lb = $("lightbox");
  if (lb && typeof lb.showModal === "function") {
    document.addEventListener("click", function (e) {
      var z = e.target.closest(".zoom-btn");
      if (!z) return;
      var im = z.querySelector("img");
      $("lightbox-img").src = z.getAttribute("data-zoom");
      $("lightbox-img").alt = im ? im.alt : "";
      $("lightbox-cap").textContent = z.getAttribute("data-caption") || "";
      lb.showModal();
    });
    $("lightbox-close").addEventListener("click", function () { lb.close(); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  } else {
    // dialog 를 지원하지 않는 오래된 브라우저: 새 창으로 이미지 열기
    document.addEventListener("click", function (e) {
      var z = e.target.closest(".zoom-btn");
      if (z) window.open(z.getAttribute("data-zoom"), "_blank", "noopener");
    });
  }

  /* ---------- 스크롤 진행 막대 · 맨 위로 버튼 ---------- */
  var bar = $("scroll-progress"), toTop = $("to-top");
  var onProgress = function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var r = h > 0 ? Math.min(1, window.scrollY / h) : 0;
    bar.style.transform = "scaleX(" + r + ")";
    toTop.classList.toggle("show", window.scrollY > 900);
  };
  window.addEventListener("scroll", onProgress, { passive: true });
  window.addEventListener("resize", onProgress);
  onProgress();

  // 처음 열 때: #erp 같은 학과 주소면 그 학과를 열고 이동, 다른 #위치면 그 위치로 이동
  // 페이지와 글꼴을 모두 불러온 뒤 위치를 맞춤 (글꼴이 바뀌며 위쪽 높이가 달라져도 정확하게)
  function afterLayout(fn) {
    var run = function () {
      setTimeout(fn, 0);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(fn, 0); });
    };
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run);
  }
  (function initialHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    if (deptIds.indexOf(id) >= 0) {
      selectDept(id, {});
      // 브라우저의 기본 위치 이동이 끝난 뒤, 학과 선택 버튼이 보이도록 영역 맨 위로 맞춤
      var go = function () { selectDept(id, { scroll: true, instant: true }); };
      afterLayout(go);
      return;
    }
    if (gradeIds.indexOf(id) >= 0) {
      selectGrade(id, {});
      var goG = function () { selectGrade(id, { scroll: true, instant: true }); };
      afterLayout(goG);
      return;
    }
    var target = document.getElementById(id);
    if (target) requestAnimationFrame(function () { target.scrollIntoView({ behavior: "instant" }); });
  })();
})();
