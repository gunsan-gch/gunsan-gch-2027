/* 투어 첫 화면 「AI로 지은 우리 학교」
   3D 모델(img/campus-3d/campus.glb)을 손가락·마우스로 돌려 보고, 「픽셀투어 떠나기」로 투어에 들어갑니다.
   - 모델 교체: 새 .glb를 img/campus-3d/campus.glb 이름으로 덮어쓰고, 아래 MODEL의 ?v= 값만 바꾸면 됩니다.
     첫 장면 각도는 CAMERA_ORBIT(가로각 세로각 거리)로 맞춥니다.
   - 3D 화면 도구는 vendor/model-viewer (첫 화면을 띄울 때만 불러옴, 약 0.9MB). 불러오기 전·실패 시엔 poster.webp 그림이 그대로 보입니다.
   - ?game= · ?room= 링크나 #floor-n 으로 들어오면 첫 화면 없이 바로 투어로 갑니다.
   - 첫 그림(3D 불러오기 전): PC는 img/campus-3d/cover-pc.webp(16:10), 휴대폰(480px 이하)은 cover-mobile.webp(4:3).
     index.html <picture>에 있으며 같은 이름으로 덮어쓰고 ?v= 값만 바꾸면 됩니다.
   - 숨은 고양이 찾기: 3D 모형의 고양이(모델 재질 이름이 'cats'로 시작)를 누르면 CATS의 카드가 열립니다.
     초상화는 img/campus-3d/cats/<id>.webp(정사각형). 찾은 고양이는 이 기기에만 저장(localStorage 'gch-tour-cats', 개인정보 없음).
   - 치즈 인사 영상(img/campus-3d/intro.mp4, 소리 없음)은 「치즈 인사 보기」를 눌렀을 때만 재생합니다. 바꿀 때 INTRO의 ?v= 갱신.
   - 같은 탭에서 한 번 닫으면 새로 고침해도 다시 띄우지 않습니다(sessionStorage). */
(() => {
  'use strict';
  const MODEL = 'img/campus-3d/campus.glb?v=20261126-v7';   // 군산여상_전경_잔디결_v7.glb (고양이 2.5배)
  const INTRO = 'img/campus-3d/intro.mp4?v=20261126-v6';
  const POSTER_PC = 'img/campus-3d/cover-pc.webp?v=20261126-cats';   // 군산여상_치즈의_정문인사_v6.mp4
  // 숨은 고양이 5마리. at = 모델 좌표(미터, 가로 x · 고양이 머리 높이 y · 앞뒤 z). 이름·소개·초상화는 그림이 오면 여기만 바꾸면 됩니다
  const CATS = [
    { id: 'cheese', name: '치즈', where: '잔디마당', line: '정문에서 인사하던 우리 학교 대표 고양이. 잔디마당 햇볕 자리가 제일 좋아요.', at: [-0.7, 3.6, 4] },
    { id: 'roof', name: '옥상 고양이', where: '건물 옥상', line: '높은 곳에서 학교를 내려다보는 걸 좋아해요. 오늘도 순찰 중!', at: [-4.5, 11.4, -5] },
    { id: 'backgate', name: '후문 고양이', where: '후문 계단', line: '후문 돌계단 옆에서 등교하는 학생들을 맞이해요.', at: [22, 4.3, -9.5] },
    { id: 'gym', name: '체육관 고양이', where: '체육관 뒤', line: '체육관 뒤 담장 위에서 낮잠 자는 게 하루 일과예요.', at: [-22.9, 4.1, -16] },
    { id: 'rear', name: '후관 고양이', where: '후관 뒤', line: '후관 뒤 조용한 길을 좋아하는 수줍은 고양이예요.', at: [-2, 3.9, -25] }
  ];
  const CAT_IMG = id => `img/campus-3d/cats/${id}.webp?v=20261126-cats`;
  const CAT_KEY = 'gch-tour-cats';
  const CAMERA_ORBIT = '0deg 58deg 80%';   // 거리 %가 작을수록 모형이 크게 보임
  const SEEN = 'gch-tour-cover-seen';
  // 건물 이름표: 모델 좌표(미터, 가로 x · 높이 y · 앞뒤 z). 모델을 바꾸면 위치를 다시 맞춰야 합니다
  const LABELS = [
    { name: '본관', position: '8m 10.5m -4m' },
    { name: '후관', position: '-2m 9.8m -16.5m' },
    { name: '체육관', position: '-19m 9.8m -5m' },
    { name: '정문', position: '-24.2m 4.6m -3.8m' },
    { name: '후문', position: '23.9m 5.2m -10.6m' }
  ];

  const dialog = document.getElementById('ai-cover');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const params = new URLSearchParams(location.search);
  let seen = false;
  try { seen = sessionStorage.getItem(SEEN) === '1'; } catch (e) { /* 저장 막힘 */ }
  if (params.has('game') || params.has('room') || /^#floor-/.test(location.hash) || seen) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = dialog.querySelector('.cover-stage');

  // 치즈 인사 영상: 버튼을 눌렀을 때만 3D 위에 덮어 재생, 끝나거나 「닫기」로 3D로 돌아옴
  let video = null;
  const cheeseButton = dialog.querySelector('.cover-cheese');
  const endIntro = () => {
    if (!video) return;
    const v = video; video = null;
    stage.classList.remove('is-intro');
    v.classList.add('is-gone');
    setTimeout(() => v.remove(), 450);
    stage.querySelector('.cover-skip')?.remove();
    cheeseButton.disabled = false;
  };
  cheeseButton.addEventListener('click', () => {
    if (video) return;
    closeCard();
    video = document.createElement('video');
    Object.assign(video, { muted: true, playsInline: true, preload: 'auto', className: 'cover-intro', poster: 'img/campus-3d/intro-poster.webp' });
    video.setAttribute('muted', ''); video.setAttribute('playsinline', '');
    video.src = INTRO;
    video.setAttribute('aria-label', '치즈 인사 영상: 고양이 치즈가 정문에서 인사하고 학교 전경으로 넘어가요');
    video.addEventListener('ended', endIntro);
    video.addEventListener('error', endIntro);
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'cover-skip'; close.textContent = '닫기';
    close.addEventListener('click', endIntro);
    stage.classList.add('is-intro');
    stage.append(video, close);
    cheeseButton.disabled = true;
    video.play().catch(endIntro);
    close.focus();
    if (window.tourTrack) window.tourTrack('tour_cover_cheese', {}, ['TourCover', 'Cheese']);
  });

  // 숨은 고양이 찾기
  let found = [];
  try { found = JSON.parse(localStorage.getItem(CAT_KEY) || '[]').filter(id => CATS.some(c => c.id === id)); } catch (e) { found = []; }
  const counter = dialog.querySelector('.cover-cats');
  const showCount = () => { counter.querySelector('b').textContent = found.length; counter.classList.toggle('is-done', found.length === CATS.length); };
  showCount();
  let card = null;
  function closeCard() { card?.remove(); card = null; }
  function openCard(cat, isNew) {
    closeCard();
    const all = found.length === CATS.length;
    card = document.createElement('div');
    card.className = 'cover-card'; card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', `${cat.name} 카드`);
    card.innerHTML =
      '<div class="cover-card-inner">' +
        '<span class="cover-card-photo"><img alt="" width="96" height="96"></span>' +
        '<div class="cover-card-text"><small></small><strong></strong><p></p></div>' +
      '</div>' +
      '<button type="button" class="cover-card-close"></button>';
    const img = card.querySelector('img');
    img.src = CAT_IMG(cat.id); img.alt = `${cat.name} 그림`;
    img.addEventListener('error', () => { img.remove(); card?.querySelector('.cover-card-photo').classList.add('is-empty'); });
    card.querySelector('small').textContent = isNew ? `${found.length}번째 고양이 발견! · ${cat.where}` : `${cat.where} · 이미 찾았어요`;
    card.querySelector('strong').textContent = cat.name;
    card.querySelector('p').textContent = all && isNew ? `${cat.line} 다섯 마리 모두 찾았어요!` : cat.line;
    const btn = card.querySelector('.cover-card-close');
    btn.textContent = all ? '닫기' : `계속 찾기 (${found.length}/${CATS.length})`;
    btn.addEventListener('click', closeCard);
    stage.append(card);
    btn.focus();
  }
  function markFound(viewer, cat) {
    const isNew = !found.includes(cat.id);
    if (isNew) {
      found.push(cat.id);
      try { localStorage.setItem(CAT_KEY, JSON.stringify(found)); } catch (e) { /* 저장 막힘 */ }
      showCount();
      addCatTag(viewer, cat);
      if (window.tourTrack) window.tourTrack('tour_cover_cat', { cat: cat.id, found: found.length }, ['TourCover', 'Cat']);
    }
    openCard(cat, isNew);
  }
  function addCatTag(viewer, cat) {   // 찾은 고양이에만 작은 이름표 (안 찾은 자리는 드러내지 않음)
    const i = LABELS.length + CATS.indexOf(cat);
    if (viewer.querySelector(`[slot="hotspot-${i}"]`)) return;
    const tag = document.createElement('div');
    tag.slot = `hotspot-${i}`; tag.className = 'cover-label cover-label-cat';
    tag.dataset.position = `${cat.at[0]}m ${cat.at[1]}m ${cat.at[2]}m`; tag.dataset.normal = '0m 1m 0m';
    tag.textContent = cat.name;
    viewer.append(tag);
  }
  /** 화면 좌표에 고양이가 있으면 가장 가까운 고양이 */
  function catAt(viewer, x, y) {
    const material = viewer.materialFromPoint?.(x, y);
    if (!material || !/^cats/.test(material.name || '')) return null;
    const hit = viewer.positionAndNormalFromPoint(x, y);
    if (!hit) return null;
    let best = null, bestD = Infinity;
    for (const cat of CATS) {
      const d = Math.hypot(hit.position.x - cat.at[0], hit.position.z - cat.at[2]);
      if (d < bestD) { best = cat; bestD = d; }
    }
    return bestD < 4 ? best : null;
  }

  import('../vendor/model-viewer/model-viewer.min.js').then(() => {
    if (!dialog.open) return;
    const viewer = document.createElement('model-viewer');
    Object.entries({
      src: MODEL, poster: dialog.querySelector('.cover-poster')?.currentSrc || POSTER_PC, alt: 'AI로 지은 우리 학교 3D 모형. 끌어서 돌려 볼 수 있어요.',
      'camera-controls': '', 'touch-action': 'pan-y', 'interaction-prompt': 'none',
      'camera-orbit': CAMERA_ORBIT, 'min-camera-orbit': 'auto 20deg 18%', 'max-camera-orbit': 'auto 80deg 110%',
      'shadow-intensity': '1', exposure: '1.05', 'environment-image': 'neutral',
      'disable-tap': '', loading: 'eager', reveal: 'auto'
    }).forEach(([k, v]) => viewer.setAttribute(k, v));
    if (!reduced) { viewer.setAttribute('auto-rotate', ''); viewer.setAttribute('auto-rotate-delay', '1500'); viewer.setAttribute('rotation-per-second', '12deg'); }
    for (const [i, label] of LABELS.entries()) {
      const tag = document.createElement('div');
      tag.slot = `hotspot-${i}`; tag.className = 'cover-label';
      tag.dataset.position = label.position; tag.dataset.normal = '0m 1m 0m';
      tag.textContent = label.name;
      viewer.append(tag);
    }
    viewer.setAttribute('alt', `AI로 지은 우리 학교 3D 모형. ${LABELS.map(l => l.name).join('·')} 이름표가 있고, 끌어서 돌려 볼 수 있어요.`);
    for (const cat of CATS) if (found.includes(cat.id)) addCatTag(viewer, cat);
    viewer.addEventListener('load', () => { stage.classList.add('is-3d'); counter.hidden = false; }, { once: true });
    viewer.addEventListener('error', () => viewer.remove(), { once: true });
    // 두 번 누르면(더블클릭·더블탭) 그 자리를 가운데로 당겨 확대. 두 손가락·오른쪽 버튼 끌기로 옮기기도 됨
    const reset = dialog.querySelector('.cover-reset');
    let lastTap = 0, lastXY = [0, 0];
    const zoomTo = (x, y) => {
      const hit = viewer.positionAndNormalFromPoint(x, y);
      if (!hit) return;
      viewer.removeAttribute('auto-rotate');
      viewer.cameraTarget = `${hit.position.x}m ${hit.position.y}m ${hit.position.z}m`;
      const orbit = viewer.getCameraOrbit();
      viewer.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad 30%`;
      reset.hidden = false;
    };
    viewer.addEventListener('dblclick', e => { if (!card) zoomTo(e.clientX, e.clientY); });
    let down = null;
    viewer.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    viewer.addEventListener('pointerup', e => {
      // 한 번 누르기(끌지 않음) → 고양이가 있으면 카드
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8 && performance.now() - down.t < 600) {
        const cat = catAt(viewer, e.clientX, e.clientY);
        if (cat) { markFound(viewer, cat); lastTap = 0; down = null; return; }
      }
      down = null;
      if (e.pointerType !== 'touch') return;   // 휴대폰 더블탭 (dblclick이 오지 않는 브라우저 대비)
      const now = performance.now(), near = Math.hypot(e.clientX - lastXY[0], e.clientY - lastXY[1]) < 30;
      if (now - lastTap < 320 && near) { zoomTo(e.clientX, e.clientY); lastTap = 0; } else { lastTap = now; lastXY = [e.clientX, e.clientY]; }
    });
    viewer.addEventListener('camera-change', e => { if (e.detail.source === 'user-interaction') reset.hidden = false; });
    reset.addEventListener('click', () => {
      viewer.cameraTarget = 'auto auto auto'; viewer.cameraOrbit = CAMERA_ORBIT;
      if (!reduced) viewer.setAttribute('auto-rotate', '');
      reset.hidden = true;
    });   // 3D를 못 그리면 그림만 보여 줌
    stage.prepend(viewer);
  }).catch(() => { /* 오래된 브라우저: 그림만 */ });

  dialog.querySelector('.cover-start').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    try { sessionStorage.setItem(SEEN, '1'); } catch (e) { /* 저장 막힘 */ }
    document.body.classList.remove('cover-open');
    endIntro(); closeCard();
    stage.querySelector('model-viewer')?.remove();   // 투어 중에는 3D를 멈춰 배터리 아끼기
    if (window.tourTrack) window.tourTrack('tour_cover_start', {}, ['TourCover', 'Start']);
    document.getElementById('tour-map')?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  });
  document.body.classList.add('cover-open');
  dialog.showModal();
  dialog.querySelector('.cover-start').focus();
})();
