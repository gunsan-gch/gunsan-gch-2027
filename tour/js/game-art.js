/* 5층 미술실 · 「물감 섞기 미션」
   목표 색을 보고 물감 방울을 떨어뜨려 같은 색을 만듭니다. 색 3개를 만들면 끝.
   - 색만 보고 고르지 않아도 되도록, 지금 색이 목표와 얼마나 가까운지와 '무엇을 더 넣으면 좋을지'를 글로 함께 알려 줍니다.
   - 한 방울 되돌리기, 처음부터 다시, 조합 힌트(힌트 수는 결과에 기록)를 쓸 수 있습니다.
   - 아래 TARGETS의 recipe(방울 수)만 바꾸면 목표 색이 바뀝니다. 목표 색은 recipe를 섞은 결과로 계산하므로 항상 만들 수 있습니다. */
(() => {
  'use strict';
  const PAINTS = [
    { id: 'r', name: '빨강', ryb: [1, 0, 0] },
    { id: 'y', name: '노랑', ryb: [0, 1, 0] },
    { id: 'b', name: '파랑', ryb: [0, 0, 1] },
    { id: 'w', name: '흰색' }
  ];
  const TARGETS = [
    { name: '교정 단풍잎 주황', recipe: { r: 1, y: 1 } },
    { name: '잔디마당 연두', recipe: { y: 2, b: 1 } },
    { name: '벚꽃 분홍', recipe: { r: 1, w: 2 } },
    { name: '맑은 하늘색', recipe: { b: 1, w: 2 } },
    { name: '포도 보라', recipe: { r: 1, b: 1 } },
    { name: '은행잎 노랑', recipe: { r: 1, y: 3 } }
  ];
  const ROUNDS = 3, MAX_DROPS = 8;

  /* RYB 물감 섞기 → 화면 색(RGB). 정육면체 8꼭짓점 사이를 보간 (Gossett·Chen 방식) */
  const CORNERS = [
    [255, 255, 255], [255, 255, 0], [255, 0, 0], [255, 128, 0],     // 없음, 노랑, 빨강, 빨강+노랑
    [40, 110, 200], [60, 165, 70], [130, 40, 150], [60, 40, 30]      // 파랑, 노랑+파랑, 빨강+파랑, 셋 다
  ];
  function rybToRgb([r, y, b]) {
    return [0, 1, 2].map(i => {
      const c = k => CORNERS[k][i];
      const x0 = c(0) + (c(2) - c(0)) * r, x1 = c(1) + (c(3) - c(1)) * r;
      const x2 = c(4) + (c(6) - c(4)) * r, x3 = c(5) + (c(7) - c(5)) * r;
      const y0 = x0 + (x1 - x0) * y, y1 = x2 + (x3 - x2) * y;
      return y0 + (y1 - y0) * b;
    });
  }
  /** 방울 수 {r,y,b,w} → [R,G,B]. 색 물감은 비율대로 섞고, 흰색은 그만큼 밝게 */
  function mix(counts) {
    const colored = PAINTS.filter(p => p.ryb).reduce((sum, p) => sum + (counts[p.id] || 0), 0);
    const white = counts.w || 0, total = colored + white;
    if (!total) return [255, 255, 255];
    let rgb = [255, 255, 255];
    if (colored) {
      const ryb = [0, 1, 2].map(i => PAINTS.filter(p => p.ryb).reduce((s, p) => s + p.ryb[i] * (counts[p.id] || 0), 0));
      const top = Math.max(...ryb);
      rgb = rybToRgb(ryb.map(v => v / top));
    }
    const t = white / total;
    return rgb.map(v => Math.round(v + (255 - v) * t * 0.85));
  }
  const css = rgb => `rgb(${rgb.join(',')})`;
  /** 두 색이 얼마나 가까운지 0~100 */
  function closeness(a, b) {
    const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    return Math.max(0, Math.round(100 - d / 2.2));
  }
  const share = counts => {
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    return Object.fromEntries(PAINTS.map(p => [p.id, (counts[p.id] || 0) / total]));
  };
  /** 목표와 비교해 가장 부족한 물감을 글로 안내 */
  function advice(counts, recipe) {
    const now = share(counts), goal = share(recipe);
    let need = null, over = null;
    for (const p of PAINTS) {
      const gap = goal[p.id] - now[p.id];
      if (!need || gap > need.gap) need = { p, gap };
      if (!over || gap < over.gap) over = { p, gap };
    }
    if (need.gap < 0.05 && over.gap > -0.05) return '거의 같아요! 「이 색으로 완성」을 눌러 보세요.';
    if (need.gap >= -over.gap) return `${need.p.name}을 조금 더 넣어 보세요.`;
    return `${over.p.name}이 많아요. 다른 물감을 더하거나 한 방울 되돌려 보세요.`;
  }
  const recipeText = recipe => PAINTS.filter(p => recipe[p.id]).map(p => `${p.name} ${recipe[p.id]}방울`).join(' + ');

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function start(container, api) {
    const picks = shuffle(TARGETS).slice(0, ROUNDS);
    const scores = [];
    let round = 0, hints = 0, drops = [], hinted = false;

    container.innerHTML =
      '<section class="art-game">' +
        '<p class="art-intro">목표 색을 보고 물감을 한 방울씩 떨어뜨려 같은 색을 만들어요. 색 3개를 만들면 미션 완료!</p>' +
        '<p class="art-rule">세 색 평균 닮은 정도 · 90% 이상 ★★★ / 70% 이상 ★★ / 그 아래 ★</p>' +
        '<div class="art-board">' +
          '<figure class="art-swatch"><span class="art-chip art-target"></span><figcaption><small>목표</small><b class="art-target-name"></b></figcaption></figure>' +
          '<figure class="art-swatch"><span class="art-chip art-mix"></span><figcaption><small>내 팔레트</small><b class="art-score">0%</b></figcaption></figure>' +
        '</div>' +
        '<p class="art-round"></p>' +
        '<p class="art-drops" aria-live="off"></p>' +
        '<div class="art-paints" role="group" aria-label="물감 넣기"></div>' +
        '<p class="art-advice" role="status"></p>' +
        '<div class="art-actions">' +
          '<button type="button" class="btn art-undo">↶ 한 방울 되돌리기</button>' +
          '<button type="button" class="btn art-clear">처음부터</button>' +
          '<button type="button" class="btn art-hint">조합 힌트</button>' +
          '<button type="button" class="btn btn-primary art-done">이 색으로 완성</button>' +
        '</div>' +
      '</section>';
    const $ = s => container.querySelector(s);
    const paints = $('.art-paints');
    for (const p of PAINTS) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'btn art-paint'; button.dataset.paint = p.id;
      button.innerHTML = `<span class="art-dot art-dot-${p.id}" aria-hidden="true"></span>${p.name}`;
      button.setAttribute('aria-label', `${p.name} 한 방울 넣기`);
      button.addEventListener('click', () => add(p.id));
      paints.append(button);
    }

    const counts = () => drops.reduce((c, id) => (c[id] = (c[id] || 0) + 1, c), {});
    const target = () => picks[round];

    function render(message) {
      const c = counts(), now = mix(c), goal = mix(target().recipe);
      const score = drops.length ? closeness(now, goal) : 0;
      $('.art-mix').style.background = css(now);
      $('.art-score').textContent = drops.length ? `닮은 정도 ${score}%` : '아직 비어 있어요';
      $('.art-drops').textContent = drops.length
        ? `넣은 물감: ${PAINTS.filter(p => c[p.id]).map(p => `${p.name} ${c[p.id]}`).join(', ')} (${drops.length}/${MAX_DROPS}방울)`
        : `넣은 물감 없음 (최대 ${MAX_DROPS}방울)`;
      $('.art-advice').textContent = message || (drops.length ? advice(c, target().recipe) : '아래 물감을 눌러 한 방울씩 넣어 보세요.');
      $('.art-undo').disabled = !drops.length;
      $('.art-clear').disabled = !drops.length;
      $('.art-done').disabled = !drops.length;
      $('.art-hint').disabled = hinted;
      paints.querySelectorAll('button').forEach(b => { b.disabled = drops.length >= MAX_DROPS; });
      return score;
    }

    function openRound() {
      drops = []; hinted = false;
      $('.art-target').style.background = css(mix(target().recipe));
      $('.art-target-name').textContent = target().name;
      $('.art-round').textContent = `색 ${round + 1} / ${ROUNDS}`;
      render();
      api.announce?.(`색 ${round + 1}번째, 목표는 ${target().name}`);
    }

    function add(id) {
      if (drops.length >= MAX_DROPS) return;
      drops.push(id);
      const box = $('.art-mix');
      if (!api.reducedMotion) { box.classList.remove('is-drop'); void box.offsetWidth; box.classList.add('is-drop'); }
      render();
    }
    $('.art-undo').addEventListener('click', () => { drops.pop(); render(); });
    $('.art-clear').addEventListener('click', () => { drops = []; render(); });
    $('.art-hint').addEventListener('click', () => {
      hints++; hinted = true;
      render(`힌트: ${recipeText(target().recipe)} 비율이면 같은 색이 돼요.`);
    });
    $('.art-done').addEventListener('click', () => {
      const score = render();
      scores.push({ name: target().name, score });
      if (++round < ROUNDS) {
        openRound();
        $('.art-advice').textContent = `${scores.at(-1).name} ${score}% 완성! 다음 색으로 가요.`;
        return;
      }
      const average = Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length);
      const extra = document.createElement('ul');
      extra.className = 'art-summary';
      for (const s of scores) {
        const li = document.createElement('li');
        li.textContent = `${s.name} ${s.score}%`;
        extra.append(li);
      }
      const avg = document.createElement('li');
      avg.textContent = `평균 ${average}%${hints ? ` · 힌트 ${hints}번` : ''}`;
      extra.append(avg);
      // 점수: 세 색 닮은 정도(%)의 합 × 10, 힌트 한 번에 50점 감점 (최고 3000점)
      const points = Math.max(0, scores.reduce((sum, s) => sum + s.score, 0) * 10 - hints * 50);
      api.done({ stars: average >= 90 ? 3 : average >= 70 ? 2 : 1, hints, extra, points });
    });

    openRound();
  }

  window.TOUR_GAMES.art = {
    title: '물감 섞기 미션', button: '🎨 물감 섞기 미션', room: '5층 미술실',
    naver: 'Art', maxStars: 3, maxPoints: 3000, stamp: '미술실 도장 획득!',
    message: '색을 섞어 원하는 느낌을 만드는 감각은 광고·상품 디자인에도 쓰여요. AI마케팅과에서 배우는 광고 만들기도 만나 보세요.',
    cta: { href: '../index.html#marketing', label: 'AI마케팅과 알아보기 →' },
    start
  };
})();
