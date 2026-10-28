/* =========================================================================
   픽셀 학교 투어 — 방문 분석 (입학안내 페이지와 같은 GA4·네이버 애널리틱스)
   어느 층을 보고 어떤 공간을 열었는지만 보냅니다. 검색어·위치·개인정보는 보내지 않습니다.
   실제 공개 주소에서만 보내고, 로컬 미리보기는 통계에 넣지 않습니다.
   ========================================================================= */

window.tourTrack = (() => {
  const live = location.hostname === 'gunsan-gch.github.io' && location.pathname.startsWith('/gunsan-gch-2027/tour/');
  const PAGE = 'https://gunsan-gch.github.io/gunsan-gch-2027/tour/';

  /**
   * @param {string} name     GA4 이벤트 이름 (예: tour_room_open)
   * @param {object} params   GA4 매개변수 (예: { room_name: '도서실', floor_name: '1층' })
   * @param {string[]} naver  네이버 이벤트 [이름, 값] — 영문·숫자만
   */
  const track = (name, params = {}, naver = null) => {
    if (!live) return;
    // 두 도구를 따로 호출해 하나가 막혀도 다른 쪽과 투어 동작은 그대로
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, { send_to: 'G-0RCC2LMBNY', page_location: PAGE, ...params });
      }
    } catch (e) { /* 분석 오류가 투어를 막지 않도록 */ }
    try {
      if (naver && window.wcs && typeof window.wcs.event === 'function') window.wcs.event(...naver);
    } catch (e) { /* 네이버 분석 오류도 마찬가지 */ }
  };
  track.live = live;   // 수업 경로 판별(class-route.js)도 공개 주소에서만
  return track;
})();
