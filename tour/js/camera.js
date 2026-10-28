/* =========================================================================
   지도 카메라 — 확대·축소, 끌어서 이동, 두 손가락 확대, 캐릭터 따라가기
   ========================================================================= */

const MAX_ZOOM = 5;
const MAX_STAGE_WIDTH = 1774 * 2;   // 배경 원본의 2배보다 크게 키우면 흐려집니다
const DRAG_THRESHOLD = 6;     // 이만큼(px) 움직이면 클릭이 아니라 끌기로 봅니다
const COMPACT_STAGE = 900;    // 지도 폭이 이보다 좁으면 이름표를 작은 점으로 바꿉니다

class TourCamera {
  constructor(stage, viewport) {
    this.stage = stage;
    this.viewport = viewport;
    this.pointers = new Map();
    this.suppressClickUntil = 0;
    this.manualUntil = 0;
    this.zoom = this.defaultZoom();

    new ResizeObserver(() => this.resize()).observe(viewport);
    this.resize();

    // Ctrl(⌘)+휠 또는 트랙패드 핀치로 확대. 그냥 휠은 페이지를 스크롤합니다.
    viewport.addEventListener('wheel', e => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      this.setZoom(this.zoom * Math.exp(-e.deltaY * 0.0025), e.clientX, e.clientY);
    }, { passive: false });

    viewport.addEventListener('pointerdown', e => {
      if (e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.dragged = false;
    });
    viewport.addEventListener('pointermove', e => this.onPointerMove(e));
    const end = e => {
      this.pointers.delete(e.pointerId);
      if (this.dragged) this.suppressClickUntil = performance.now() + 300;
      this.viewport.classList.remove('dragging');
    };
    viewport.addEventListener('pointerup', end);
    viewport.addEventListener('pointercancel', end);
    viewport.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') end(e); });
  }

  /** 처음 보이는 배율: PC는 150%, 휴대폰·크게 보기는 그림 세로가 지도 칸에 꽉 차는 배율 */
  defaultZoom() {
    const w = this.viewport.clientWidth;
    const fillHeight = innerWidth <= 760 || this.viewport.closest('.is-expanded');
    if (!w || !fillHeight) return this.clampZoom(1);   // PC 첫 화면 100%
    return this.clampZoom((2 * this.maxHeight()) / w);
  }

  /** 지도 칸이 가질 수 있는 최대 높이 (CSS max-height, 없으면 2:1 비율) */
  maxHeight() {
    const value = parseFloat(getComputedStyle(this.viewport).maxHeight);
    return Number.isFinite(value) ? value : this.viewport.clientWidth / 2;
  }

  /** 가장 작게: 그림 전체가 지도 칸 안에 들어오는 배율 (가로로 눕힌 화면에서는 100%보다 작을 수 있음) */
  minZoom() {
    const w = this.viewport.clientWidth;
    return w ? Math.min(1, (2 * this.maxHeight()) / w) : 1;
  }

  clampZoom(value) {
    return Math.max(this.minZoom(), Math.min(this.maxZoom(), value));
  }

  maxZoom() {
    return Math.max(1, Math.min(MAX_ZOOM, MAX_STAGE_WIDTH / Math.max(1, this.viewport.clientWidth)));
  }

  onPointerMove(e) {
    if (!this.pointers.has(e.pointerId)) return;
    const previous = this.pointers.get(e.pointerId);
    const before = [...this.pointers.values()];
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pointers.size === 2) {
      // 두 손가락: 손가락 사이 거리만큼 확대, 가운데 지점 고정
      const now = [...this.pointers.values()];
      const gap = list => Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
      const mid = list => ({ x: (list[0].x + list[1].x) / 2, y: (list[0].y + list[1].y) / 2 });
      const oldMid = mid(before), newMid = mid(now);
      this.setZoom(this.zoom * gap(now) / Math.max(1, gap(before)), newMid.x, newMid.y, this.worldAt(oldMid.x, oldMid.y));
      this.dragged = true;
    } else if (this.pointers.size === 1) {
      const moved = Math.hypot(e.clientX - this.dragStart.x, e.clientY - this.dragStart.y);
      if (!this.dragged && moved < DRAG_THRESHOLD) return;
      const from = this.dragged ? previous : this.dragStart;
      this.viewport.scrollLeft -= e.clientX - from.x;
      this.viewport.scrollTop -= e.clientY - from.y;
      this.dragged = true;
      this.viewport.classList.add('dragging');
      this.manualUntil = performance.now() + 1500;
    }
    if (this.dragged) this.suppressClickUntil = performance.now() + 300;
  }

  /** 화면 좌표 → 그림 좌표(%) */
  worldAt(clientX, clientY) {
    const r = this.stage.getBoundingClientRect();
    return [(clientX - r.left) / r.width * 100, (clientY - r.top) / r.height * 100];
  }

  setZoom(value, clientX, clientY, anchor) {
    const r = this.viewport.getBoundingClientRect();
    clientX ??= r.left + this.viewport.clientWidth / 2;
    clientY ??= r.top + this.viewport.clientHeight / 2;
    const world = anchor || this.worldAt(clientX, clientY);
    this.zoom = this.clampZoom(value);
    this.apply();
    this.viewport.scrollLeft = world[0] / 100 * this.stage.offsetWidth - (clientX - r.left - this.viewport.clientLeft);
    this.viewport.scrollTop = world[1] / 100 * this.stage.offsetHeight - (clientY - r.top - this.viewport.clientTop);
    this.manualUntil = performance.now() + 600;
  }

  apply() {
    const width = this.viewport.clientWidth * this.zoom;
    this.stage.style.width = width + 'px';
    this.stage.style.setProperty('--stage-w', width + 'px');
    // 지도 칸 높이는 그림 높이를 넘지 않게 — 축소했을 때 아래가 빈 칸으로 남지 않도록
    // 크게 보기에서는 지도 칸을 화면 높이 그대로 두고, 그림이 더 작으면 세로 가운데에
    const expanded = Boolean(this.viewport.closest('.is-expanded'));
    const boxHeight = expanded ? this.maxHeight() : Math.min(width / 2, this.maxHeight());
    this.viewport.style.height = boxHeight + 'px';
    this.stage.style.marginTop = expanded ? Math.max(0, (boxHeight - width / 2) / 2) + 'px' : '';
    const fit = this.zoom <= this.minZoom() + 0.001;
    this.viewport.classList.toggle('fit', fit);
    this.viewport.classList.toggle('compact-labels', width < COMPACT_STAGE);
    const label = document.querySelector('#zoom-value');
    if (label) label.textContent = Math.round(this.zoom * 100) + '%';
    document.querySelectorAll('#fit, [data-map-action="fit"]').forEach(b => b.setAttribute('aria-pressed', String(fit)));
  }

  /** 창 크기가 바뀌어도 보고 있던 곳이 가운데에 오도록 유지 */
  resize() {
    const w = this.viewport.clientWidth, h = this.viewport.clientHeight;
    if (this.lastWidth === w && this.lastHeight === h) return;
    const oldWidth = parseFloat(this.stage.style.width);
    const center = this.lastWidth && oldWidth
      ? [(this.viewport.scrollLeft + this.lastWidth / 2) / oldWidth * 100, (this.viewport.scrollTop + this.lastHeight / 2) / (oldWidth / 2) * 100]
      : null;
    this.lastWidth = w;
    this.lastHeight = h;
    this.zoom = this.clampZoom(this.zoom);
    this.apply();
    if (center) this.center(...center);
  }

  /** 처음 배율로 되돌리고 (x, y)를 가운데에 — 크게 보기 전환, 화면 회전 때 사용 */
  reset(x, y) {
    this.zoom = this.defaultZoom();
    this.apply();
    this.lastWidth = this.viewport.clientWidth;
    this.lastHeight = this.viewport.clientHeight;
    this.center(x, y);
  }

  center(x, y) {
    this.viewport.scrollLeft = x / 100 * this.stage.offsetWidth - this.viewport.clientWidth / 2;
    this.viewport.scrollTop = y / 100 * this.stage.offsetHeight - this.viewport.clientHeight / 2;
  }

  /** 캐릭터가 화면 가장자리에 가까워지면 화면을 따라 움직입니다 */
  follow(x, y) {
    if (performance.now() < this.manualUntil || this.pointers.size) return;
    const v = this.viewport;
    const px = x / 100 * this.stage.offsetWidth, py = y / 100 * this.stage.offsetHeight;
    const marginX = v.clientWidth * 0.28, marginY = v.clientHeight * 0.28;
    v.scrollLeft = Math.max(px - v.clientWidth + marginX, Math.min(v.scrollLeft, px - marginX));
    v.scrollTop = Math.max(py - v.clientHeight + marginY, Math.min(v.scrollTop, py - marginY));
  }
}

window.TourCamera = TourCamera;
