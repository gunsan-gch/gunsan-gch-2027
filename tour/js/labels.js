/* =========================================================================
   지도 위 공간 이름표
   - 지도가 넉넉하면 그림 속 공간 위치에 이름을 표시
   - 지도가 작으면(.compact-labels) 이름 대신 작은 점으로 표시 — 점을 누르면 설명이 열립니다
   이름표만 바뀌고 그림·이동 좌표는 바뀌지 않습니다.
   ========================================================================= */

function renderRoomLabels(stage, scene, onSelect) {
  stage.querySelectorAll('.room-label').forEach(el => el.remove());
  for (const room of scene.rooms) {
    // quiet: 이름만 보여 주는 공간 (누를 수 없음 — 누르면 아래 바닥으로 걸어감)
    const el = document.createElement(room.quiet ? 'span' : 'button');
    if (!room.quiet) el.type = 'button';
    el.className = 'room-label';
    if (room.quiet) el.classList.add('is-quiet');
    if (room.overflow) el.classList.add('is-overflow');
    if (room.facility) el.classList.add('is-facility');
    if (room.status === '개편 예정') el.classList.add('is-planned');
    if (room.spot) el.classList.add('is-spot');
    el.style.left = room.at[0] + '%';
    el.style.top = room.at[1] + '%';
    el.style.setProperty('--label-w', room.w + '%');
    if (!room.quiet) {
      el.title = room.name;
      el.setAttribute('aria-label', `${room.name}${room.status ? ` (${room.status})` : ''} 정보 보기`);
    }
    const text = document.createElement('span');
    text.className = 'room-label-text';
    text.textContent = room.name;
    if (room.note) {
      const note = document.createElement('small');
      note.textContent = room.note;
      text.append(note);
    }
    el.append(text);
    if (!room.quiet) el.addEventListener('click', () => onSelect(room, el));
    stage.append(el);
  }
  requestAnimationFrame(fitRoomLabels);
}

/** 이름표 칸보다 긴 단어가 있으면 글씨를 줄여 한 줄에 들어가게 합니다 (줄바꿈은 띄어쓰기에서만) */
function fitRoomLabels() {
  const stage = document.querySelector('#scene-stage');
  if (stage.closest('.compact-labels')) return;
  for (const el of stage.querySelectorAll('.room-label:not(.is-overflow)')) {
    const text = el.querySelector('.room-label-text');
    el.style.fontSize = '';
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (text.scrollWidth > text.clientWidth + 1 && size > 8) {
      size -= 0.5;
      el.style.fontSize = size + 'px';
    }
  }
}

new ResizeObserver(() => requestAnimationFrame(fitRoomLabels)).observe(document.querySelector('#scene-stage'));
