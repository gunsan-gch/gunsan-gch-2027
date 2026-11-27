/* =========================================================================
   픽셀 학교 투어 — 완주 칭호와 칭호 포토카드
   도장·별·고양이 도감 기록으로 칭호를 정하고, 완주 포토카드(img/campus-3d/postcards/<id>.jpg) 위에 배지와 칭호를 찍어 저장하게 합니다.
   - 배지 그림: img/titles/badge.svg (GPT 에셋 「별빛 학교 탐험가 칭호배지」, 글자 없음)
   - 열리는 조건: 고양이 도감을 다 채우거나, 도장을 모두 모으면.
   - 기록은 이 기기의 localStorage(도장 'gch-tour-stamps', 고양이 'gch-tour-cats')만 읽습니다. 이름 같은 개인정보는 넣지 않습니다.
   ========================================================================= */
window.TourTitleCard = (() => {
  'use strict';
  const BADGE = 'img/titles/badge.svg?v=20261127';
  const CARDS = [
    { id: 'day', name: '낮', label: '햇살이 머문 교정' },
    { id: 'dusk', name: '노을', label: '노을에 물든 교정' }
  ];
  const CARD_V = '20261126';

  // 위에서부터 먼저 맞는 칭호 하나
  const TITLES = [
    { id: 'master', name: '군산여상 별빛 마스터', when: s => s.allStamps && s.allStars && s.allCats, hint: '' },
    { id: 'loop', name: '군산여상 한 바퀴 완주', when: s => s.allStamps, hint: '모든 게임에서 ★3을 받고 고양이를 모두 찾으면 「별빛 마스터」' },
    { id: 'star', name: '별빛 학교 탐험가', when: s => s.stars >= (window.TourStarProgress?.TITLE_AT || 27), hint: '도장을 모두 모으면 「한 바퀴 완주」' },
    { id: 'cat', name: '교정 고양이 친구', when: s => s.allCats, hint: '별 27개를 모으면 「별빛 학교 탐험가」' }
  ];

  function catsFound() {
    const ids = window.TOUR_CAT_IDS || ['cheese', 'danpung', 'kkamang', 'eunbyeol', 'bora', 'hodu'];
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('gch-tour-cats') || '[]'); } catch (e) { /* 저장 막힘 */ }
    const got = Array.isArray(saved) ? ids.filter(id => saved.includes(id)).length : 0;
    return { got, total: ids.length };
  }

  /** 지금 기록과 칭호 */
  function info() {
    const p = window.tourGame?.progress() || { games: [], stars: 0, maxStars: 0, count: 0 };
    const cats = catsFound();
    const s = {
      stamps: p.count, stampTotal: p.games.length, stars: p.stars, maxStars: p.maxStars, cats: cats.got, catTotal: cats.total,
      allStamps: p.games.length > 0 && p.count === p.games.length,
      allStars: p.maxStars > 0 && p.stars === p.maxStars,
      allCats: cats.got === cats.total
    };
    const index = TITLES.findIndex(t => t.when(s));
    const title = index >= 0 ? TITLES[index] : null;
    return { ...s, unlocked: s.allCats || s.allStamps, title, hint: title ? title.hint : '' };
  }

  const loadImage = src => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  function fontFamily() {
    return getComputedStyle(document.body).fontFamily || 'sans-serif';
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /** 포토카드 한 장에 배지·칭호를 찍은 canvas */
  async function compose(card, state = info()) {
    const [photo, badge] = await Promise.all([
      loadImage(`img/campus-3d/postcards/${card.id}.jpg?v=${CARD_V}`),
      loadImage(BADGE).catch(() => null)
    ]);
    if (document.fonts?.ready) await document.fonts.ready;
    const canvas = document.createElement('canvas');
    canvas.width = photo.naturalWidth || 1080;
    canvas.height = photo.naturalHeight || 1350;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
    if (!state.title) return canvas;

    const k = canvas.width / 1080;
    const font = fontFamily();
    const title = state.title.name;
    const stats = `도장 ${state.stamps}/${state.stampTotal} · ★ ${state.stars}/${state.maxStars} · 고양이 ${state.cats}/${state.catTotal}`;

    // 사진 칸 오른쪽 아래에 배지 + 칭호 알약 (도장 찍듯 살짝 기울임)
    ctx.save();
    ctx.translate(1000 * k, 935 * k);
    ctx.rotate(-0.06);
    ctx.font = `800 ${34 * k}px ${font}`;
    const titleW = ctx.measureText(title).width;
    ctx.font = `600 ${19 * k}px ${font}`;
    const statsW = ctx.measureText(stats).width;
    const pillW = Math.max(titleW, statsW) + 44 * k;
    const pillH = 92 * k;
    const x = -pillW, y = -pillH;
    ctx.shadowColor = 'rgba(20, 28, 50, .28)';
    ctx.shadowBlur = 18 * k;
    ctx.shadowOffsetY = 6 * k;
    ctx.fillStyle = 'rgba(32, 44, 71, .92)';
    roundRect(ctx, x, y, pillW, pillH, 22 * k);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 230, 162, .9)';
    ctx.lineWidth = 2 * k;
    roundRect(ctx, x + 5 * k, y + 5 * k, pillW - 10 * k, pillH - 10 * k, 18 * k);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffe6a2';
    ctx.font = `800 ${34 * k}px ${font}`;
    ctx.fillText(title, x + pillW / 2, y + 47 * k);
    ctx.fillStyle = 'rgba(255, 255, 255, .86)';
    ctx.font = `600 ${19 * k}px ${font}`;
    ctx.fillText(stats, x + pillW / 2, y + 76 * k);
    if (badge) {
      const size = 150 * k;
      ctx.shadowColor = 'rgba(20, 28, 50, .3)';
      ctx.shadowBlur = 12 * k;
      ctx.shadowOffsetY = 4 * k;
      ctx.drawImage(badge, x + pillW / 2 - size / 2, y - size + 22 * k, size, size);
    }
    ctx.restore();
    return canvas;
  }

  const toBlob = canvas => new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));

  /** container 안에 낮·노을 두 장(칭호 찍힘)과 저장 링크를 채움. 실패하면 원래 그림으로 */
  function fill(row) {
    const state = info();
    const urls = [];
    for (const card of CARDS) {
      const link = document.createElement('a');
      link.className = 'cover-postcard';
      link.href = `img/campus-3d/postcards/${card.id}.jpg?v=${CARD_V}`;
      link.download = `gunsan-gch-postcard-${card.id}.jpg`;
      const img = new Image(1080, 1350);
      img.src = `img/campus-3d/postcards/${card.id}.webp?v=${CARD_V}`;
      img.alt = `완주 포토카드, ${card.label}${state.title ? `, 칭호 ${state.title.name}` : ''}`;
      const label = document.createElement('span');
      label.textContent = `${card.name} 버전 저장`;
      link.append(img, label);
      link.addEventListener('click', () => {
        if (window.tourTrack) window.tourTrack('tour_cover_postcard', { card: card.id, title: state.title?.id || 'none' }, ['TourCover', 'Postcard']);
      });
      row.append(link);
      if (state.title) {
        compose(card, state).then(toBlob).then(blob => {
          if (!blob || !link.isConnected) return;
          const url = URL.createObjectURL(blob);
          urls.push(url);
          img.src = url;
          link.href = url;
        }).catch(() => { /* 원래 그림 그대로 */ });
      }
    }
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }

  /* ---------- 투어 안에서 여는 창 (도장판에서) ---------- */
  let dialog = null;
  let release = null;
  function open(from = null) {
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'title-card-dialog';
      dialog.setAttribute('aria-label', '칭호 포토카드');
      dialog.innerHTML = '<div class="title-card-inner"><p class="title-card-head"></p><div class="cover-postcards"></div><p class="title-card-note"></p><div class="title-card-actions"><button type="button" class="btn btn-primary">닫기</button></div></div>';
      dialog.querySelector('button').addEventListener('click', () => dialog.close());
      dialog.addEventListener('close', () => { release?.(); release = null; dialog.querySelector('.cover-postcards').replaceChildren(); from?.focus?.({ preventScroll: true }); });
      document.body.append(dialog);
    }
    const state = info();
    dialog.querySelector('.title-card-head').textContent = state.title ? `내 칭호 · ${state.title.name}` : '완주 포토카드';
    dialog.querySelector('.title-card-note').textContent = (state.hint ? `다음 칭호: ${state.hint}. ` : '') + '휴대폰에서 저장이 안 되면 그림을 길게 눌러 저장해 주세요.';
    release = fill(dialog.querySelector('.cover-postcards'));
    dialog.showModal();
    dialog.querySelector('button').focus({ preventScroll: true });
    if (window.tourTrack) window.tourTrack('tour_title_open', { title: state.title?.id || 'none' }, ['TourTitle', 'Open']);
  }

  /** 도장판 맨 위 한 칸: 내 칭호 (열렸을 때만 포토카드 버튼) */
  function boardItem(closeBoard) {
    const state = info();
    const item = document.createElement('li');
    item.className = 'stamp-floor stamp-title' + (state.unlocked ? ' is-open' : '');
    const head = document.createElement('h3');
    head.textContent = '내 칭호';
    const text = document.createElement('p');
    text.className = 'stamp-daily-text';
    const name = document.createElement('strong');
    name.textContent = state.title ? state.title.name : '아직 없어요';
    const meta = document.createElement('small');
    meta.textContent = state.unlocked
      ? (state.hint ? `다음: ${state.hint}` : '최고 칭호를 받았어요!')
      : `도장을 모두 모으거나 첫 화면 고양이 ${state.catTotal}마리를 찾으면 칭호 포토카드가 열려요 (고양이 ${state.cats}/${state.catTotal})`;
    text.append(name, meta);
    item.append(head, text);
    if (state.unlocked) {
      const go = document.createElement('button');
      go.type = 'button';
      go.className = 'btn';
      go.textContent = '포토카드 받기';
      go.addEventListener('click', () => {
        const from = document.getElementById('stamp-open');
        closeBoard();
        open(from);
      });
      item.append(go);
    }
    return item;
  }

  return { info, compose, fill, open, boardItem, TITLES };
})();
