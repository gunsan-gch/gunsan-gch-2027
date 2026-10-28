/* =========================================================================
   수업 사이트 이동 세션 표시 (입학안내 페이지 · 픽셀 학교 투어 공용)

   수업 시간에 학생들이 '입학안내 → 픽셀 투어 → 경영실습실 → 수업 사이트' 순서로
   들어오면 그 방문(GA 세션)을 홍보 분석에서 따로 볼 수 있도록, 마지막 링크를 누를 때
   class_route_complete 이벤트를 한 번 보냅니다. 이 코드는 아무것도 지우거나 추적을
   끄지 않습니다. 세션을 빼는 일은 GA4 탐색의 세그먼트에서 합니다 (README 참고).

   판별 방법
   - 단계: home(입학안내 첫 화면) → tour(투어) → room(링크가 있는 공간 설명 열기) → 링크 클릭
     앞 단계를 거친 뒤에만 다음 단계를 기록하므로 순서가 맞아야 완료됩니다.
   - 같은 방문인지: GA가 정한 세션 번호(gtag 'get' session_id)가 같아야 합니다.
     세션 번호를 아직 못 받았거나 받을 수 없으면 GA 기본 세션 시간과 같은
     '마지막 기록 후 30분 이내'로 판단합니다.
   - 저장 위치: localStorage (같은 주소의 새 탭에서도 이어 보기 위해).
     세션 번호가 달라지거나 30분 넘게 기록이 없거나 하루가 지나면 읽는 즉시 지웁니다.
     그래서 나중에 다시 방문한 기록은 수업 경로로 잘못 분류되지 않습니다.
   - 저장 내용: 단계별 시각, 공간 이름, GA 세션 번호, 전송 여부. 개인정보는 없습니다.
   ========================================================================= */
(function () {
  "use strict";
  var GA_ID = "G-0RCC2LMBNY";
  var KEY = "gch-class-route";
  var IDLE = 30 * 60 * 1000;          // GA4 기본 세션 시간 제한(30분)
  var MAX_AGE = 24 * 60 * 60 * 1000;  // 어떤 경우에도 하루 넘게 남기지 않음
  var STEPS = ["home", "tour", "room"];

  var sid = null;      // GA 세션 번호
  var settled = false; // 세션 번호를 받았거나 기다리기를 끝냈는지
  var waiting = [];

  function settle(v) {
    if (v != null && v !== "") sid = String(v);
    if (settled) return;
    settled = true;
    var list = waiting; waiting = [];
    list.forEach(function (fn) { try { fn(); } catch (e) { /* 분석 오류가 화면을 막지 않도록 */ } });
  }
  try {
    if (typeof window.gtag === "function") window.gtag("get", GA_ID, "session_id", settle);
  } catch (e) { /* gtag가 막혀 있으면 시간 기준으로만 판단 */ }
  setTimeout(function () { settle(null); }, 2000);
  function whenReady(fn) { if (settled) fn(); else waiting.push(fn); }

  function read() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); return s && typeof s === "object" ? s : null; }
    catch (e) { return null; }
  }
  function write(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* 저장 불가: 판별만 생략 */ } }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) { /* 무시 */ } }

  /** 지금 방문과 같은 방문의 기록이면 돌려주고, 아니면 지웁니다. */
  function current(now) {
    var s = read();
    if (!s) return null;
    var same = s.sid && sid ? s.sid === sid : now - s.last < IDLE;
    if (!same || now - s.first > MAX_AGE || now < s.first) { clear(); return null; }
    if (!s.sid && sid) s.sid = sid;
    return s;
  }

  /** 단계 기록: home은 언제나 시작할 수 있고, 나머지는 바로 앞 단계가 있어야 기록됩니다. */
  function mark(step, roomName) {
    whenReady(function () {
      var now = Date.now();
      var i = STEPS.indexOf(step);
      if (i < 0) return;
      var s = current(now) || { v: 1, sid: sid, first: now, last: now, steps: {}, sent: false };
      if (!s.steps[step] && (i === 0 || s.steps[STEPS[i - 1]])) {
        s.steps[step] = now;
        if (step === "room") s.room = roomName || "";
      }
      s.last = now;
      write(s);
    });
  }

  /**
   * 링크를 누를 때 바로 호출 (기다리지 않음 — 이동 전에 판단하기 위해).
   * 같은 방문에서 home → tour → room(같은 공간)을 거쳤으면 { first, minutes }를 돌려줍니다.
   * first는 그 방문에서 처음일 때만 true — 이때만 class_route_complete를 보내 중복을 막습니다.
   * 경로가 아니면 null.
   */
  function complete(roomName) {
    var now = Date.now();
    var s = current(now);
    if (!s) return null;
    s.last = now;
    var done = STEPS.every(function (k) { return s.steps[k]; }) && s.room === roomName;
    var first = done && !s.sent;
    if (first) s.sent = true;
    write(s);
    return done ? { first: first, minutes: Math.max(0, Math.round((now - s.steps.home) / 60000)) } : null;
  }

  window.gchClassRoute = { mark: mark, complete: complete };
})();
