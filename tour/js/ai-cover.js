/* 투어 첫 화면 「AI로 지은 우리 학교」
   3D 모델(img/campus-3d/campus.glb)을 손가락·마우스로 돌려 보고, 「픽셀투어 떠나기」로 투어에 들어갑니다.
   - 모델 교체: 새 .glb를 img/campus-3d/campus.glb 이름으로 덮어쓰고, 아래 MODEL의 ?v= 값만 바꾸면 됩니다.
     첫 장면 각도는 CAMERA_ORBIT(가로각 세로각 거리)로 맞춥니다.
   - 3D 화면 도구는 vendor/model-viewer (첫 화면을 띄울 때만 불러옴, 약 0.9MB). 불러오기 전·실패 시엔 poster.webp 그림이 그대로 보입니다.
   - ?game= · ?room= 링크나 #floor-n 으로 들어오면 첫 화면 없이 바로 투어로 갑니다.
   - 시작 영상(img/campus-3d/intro.mp4, 소리 없음 4.5초)이 먼저 나오고, 끝나거나 「건너뛰기」를 누르면 3D 모형이 보입니다.
     영상을 바꾸려면 같은 이름으로 덮어쓰고 INTRO의 ?v= 값을 바꾸세요. 움직임 줄이기 설정이면 영상 없이 바로 3D.
   - 같은 탭에서 한 번 닫으면 새로 고침해도 다시 띄우지 않습니다(sessionStorage). */
(() => {
  'use strict';
  const MODEL = 'img/campus-3d/campus.glb?v=20261126-v7';   // 군산여상_전경_잔디결_v7.glb (고양이 2.5배)
  const INTRO = 'img/campus-3d/intro.mp4?v=20261126-v6';   // 군산여상_치즈의_정문인사_v6.mp4
  const POSTER = 'img/campus-3d/poster.webp?v=20261126-v7';
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

  // 시작 영상: 3D를 불러오는 동안 위에 덮어 재생. 자동 재생이 막히면 바로 3D로
  let video = null;
  const endIntro = () => {
    if (!video) return;
    const v = video; video = null;
    stage.classList.remove('is-intro');
    v.classList.add('is-gone');
    setTimeout(() => v.remove(), 450);
    dialog.querySelector('.cover-skip')?.remove();
  };
  if (!reduced) {
    video = document.createElement('video');
    Object.assign(video, { muted: true, playsInline: true, autoplay: true, preload: 'auto', className: 'cover-intro' });
    video.setAttribute('muted', ''); video.setAttribute('playsinline', '');
    video.poster = 'img/campus-3d/intro-poster.webp';
    video.src = INTRO;
    video.setAttribute('aria-label', '시작 영상: 고양이 치즈가 정문에서 인사하고 학교 전경으로 넘어가요');
    video.addEventListener('ended', endIntro);
    video.addEventListener('error', endIntro);
    const skip = document.createElement('button');
    skip.type = 'button'; skip.className = 'cover-skip'; skip.textContent = '건너뛰기';
    skip.addEventListener('click', () => {
      endIntro();
      if (window.tourTrack) window.tourTrack('tour_cover_intro_skip', {}, ['TourCover', 'IntroSkip']);
    });
    stage.classList.add('is-intro');
    stage.append(video, skip);
  }

  import('../vendor/model-viewer/model-viewer.min.js').then(() => {
    if (!dialog.open) return;
    const viewer = document.createElement('model-viewer');
    Object.entries({
      src: MODEL, poster: POSTER, alt: 'AI로 지은 우리 학교 3D 모형. 끌어서 돌려 볼 수 있어요.',
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
    viewer.addEventListener('load', () => stage.classList.add('is-3d'), { once: true });
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
    viewer.addEventListener('dblclick', e => zoomTo(e.clientX, e.clientY));
    viewer.addEventListener('pointerup', e => {   // 휴대폰 더블탭 (dblclick이 오지 않는 브라우저 대비)
      if (e.pointerType !== 'touch') return;
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
    stage.querySelector('model-viewer')?.remove();   // 투어 중에는 3D를 멈춰 배터리 아끼기
    if (window.tourTrack) window.tourTrack('tour_cover_start', {}, ['TourCover', 'Start']);
    document.getElementById('tour-map')?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  });
  document.body.classList.add('cover-open');
  dialog.showModal();
  dialog.querySelector('.cover-start').focus();
  video?.play().catch(endIntro);
})();
