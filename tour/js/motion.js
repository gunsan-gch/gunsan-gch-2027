/* =========================================================================
   캐릭터 이동 — 그림 위 백분율 좌표에서 움직입니다.
   - 방향키·방향 버튼: 누르고 있는 동안 천천히 걷기 (walkSpeed)
   - 바닥·공간 클릭: 길을 찾아 빠르게 걷기 (clickSpeed)
   속도는 화면 픽셀이 아니라 지도 좌표 기준이라 확대해도 같은 시간에 도착합니다.
   ========================================================================= */

const WALK_SPEED = 9;
const CLICK_SPEED = 18;
const FOOT_RADIUS = 0.32;   // 발 크기 — 벽에 너무 붙지 않게 하는 여유
const GRID_STEP = 0.7;      // 길찾기 격자 간격
const WALK_CYCLE = [0, 1, 2, 1];

class TourMotion {
  constructor(onPaint) {
    this.onPaint = onPaint;
    this.aspect = 2;          // 그림 가로:세로 비율. y 거리를 가로 기준으로 맞출 때 씁니다.
    this.x = 50;
    this.y = 50;
    this.facing = 'down';
    this.frame = 1;
    this.distance = 0;
    this.queue = [];
    this.held = null;
    this.done = null;
    this.lastTime = 0;
  }

  configure(scene, start) {
    this.cancel();
    this.areas = scene.walkAreas;
    this.blocks = scene.walkObstacles || [];
    this.grid = null;
    [this.x, this.y] = this.project(start).p;
    this.facing = 'down';
    this.frame = 1;
    this.paint(false);
  }

  /* ---------- 기하 계산 ---------- */

  metric(a, b) {
    return Math.hypot(a[0] - b[0], (a[1] - b[1]) / this.aspect);
  }

  footOffsets() {
    const r = FOOT_RADIUS, ry = r * this.aspect;
    return [[0, 0], [-r, -ry], [r, -ry], [-r, ry], [r, ry]];
  }

  static contains(p, rect) {
    return p[0] >= rect[0] && p[0] <= rect[0] + rect[2] && p[1] >= rect[1] && p[1] <= rect[1] + rect[3];
  }

  /** 발 전체가 걸을 수 있는 영역 안에 있고 장애물과 겹치지 않는지 */
  valid(p) {
    return this.footOffsets().every(([dx, dy]) => {
      const q = [p[0] + dx, p[1] + dy];
      return this.areas.some(a => TourMotion.contains(q, a)) && !this.blocks.some(a => TourMotion.contains(q, a));
    });
  }

  /** 선분 a→b가 사각형을 지나는 구간 [시작, 끝] (0~1). 지나지 않으면 null */
  static interval(a, b, rect) {
    let lo = 0, hi = 1;
    for (let axis = 0; axis < 2; axis++) {
      const d = b[axis] - a[axis], min = rect[axis], max = min + rect[axis + 2];
      if (Math.abs(d) < 1e-10) {
        if (a[axis] < min || a[axis] > max) return null;
      } else {
        let u = (min - a[axis]) / d, v = (max - a[axis]) / d;
        if (u > v) [u, v] = [v, u];
        lo = Math.max(lo, u);
        hi = Math.min(hi, v);
        if (lo > hi) return null;
      }
    }
    return [lo, hi];
  }

  /** a에서 b까지 직선으로 걸어갈 수 있는지 */
  clear(a, b) {
    return this.footOffsets().every(([dx, dy]) => {
      const from = [a[0] + dx, a[1] + dy], to = [b[0] + dx, b[1] + dy];
      if (this.blocks.some(rect => TourMotion.interval(from, to, rect))) return false;
      const spans = this.areas.map(rect => TourMotion.interval(from, to, rect)).filter(Boolean).sort((s, t) => s[0] - t[0]);
      let covered = 0;
      for (const [lo, hi] of spans) {
        if (lo > covered + 1e-10) return false;
        covered = Math.max(covered, hi);
      }
      return covered >= 1;
    });
  }

  buildGrid() {
    if (this.grid) return;
    const sy = GRID_STEP * this.aspect;
    const nx = Math.floor(100 / GRID_STEP) + 1, ny = Math.floor(100 / sy) + 1;
    const nodes = new Map();
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const p = [x * GRID_STEP, y * sy];
        if (this.valid(p)) nodes.set(y * nx + x, p);
      }
    }
    this.grid = { nodes, nx };
  }

  closest(p, requireClear = false) {
    this.buildGrid();
    let best = null;
    for (const [id, q] of this.grid.nodes) {
      const d = this.metric(p, q);
      if ((!best || d < best.d) && (!requireClear || this.clear(p, q))) best = { id, p: q, d };
    }
    return best;
  }

  /** 아무 지점이나 가장 가까운 걸을 수 있는 지점으로 옮깁니다. d = 옮긴 거리 */
  project(p) {
    if (this.valid(p)) return { p, d: 0 };
    return this.closest(p) || { p: [this.x, this.y], d: Infinity };
  }

  /** 현재 위치에서 target까지의 경로(꺾이는 지점 목록). 길이 없으면 [] */
  route(target) {
    const start = [this.x, this.y], end = this.project(target).p;
    if (this.clear(start, end)) return [end];
    const from = this.closest(start, true), to = this.closest(end, true);
    if (!from || !to) return [];

    // 격자 위 너비 우선 탐색
    const { nodes, nx } = this.grid;
    const queue = [from.id], prev = new Map([[from.id, null]]);
    for (let i = 0; i < queue.length && !prev.has(to.id); i++) {
      const id = queue[i];
      for (const next of [id - 1, id + 1, id - nx, id + nx]) {
        if (prev.has(next) || !nodes.has(next) || !this.clear(nodes.get(id), nodes.get(next))) continue;
        prev.set(next, id);
        queue.push(next);
      }
    }
    if (!prev.has(to.id)) return [];
    const path = [end];
    for (let id = to.id; id !== null; id = prev.get(id)) path.unshift(nodes.get(id));

    // 직선으로 갈 수 있는 구간은 건너뛰어 경로를 매끈하게
    const smooth = [];
    let at = start, index = 0;
    while (index < path.length) {
      let far = index;
      while (far + 1 < path.length && this.clear(at, path[far + 1])) far++;
      smooth.push(path[far]);
      at = path[far];
      index = far + 1;
    }
    return smooth;
  }

  /** 방향키를 누르고 있을 때 이번에 걸어갈 목표 지점 */
  heldTarget(dir) {
    const v = { left: [-1, 0], right: [1, 0], up: [0, -this.aspect], down: [0, this.aspect] }[dir];
    let p = [this.x, this.y];
    for (let i = 0; i < 40; i++) {
      const next = [p[0] + v[0] * 0.1, p[1] + v[1] * 0.1];
      if (!this.clear(p, next)) break;
      p = next;
    }
    return this.metric(p, [this.x, this.y]) > 1e-5 ? p : null;
  }

  /* ---------- 명령 ---------- */

  /** 길을 찾아 걸어갑니다. 도착하면 true, 길이 없거나 중간에 멈추면 false */
  go(x, y) {
    this.cancel();
    this.queue = this.route([x, y]);
    if (!this.queue.length) return Promise.resolve(false);
    return new Promise(resolve => { this.done = resolve; });
  }

  hold(dir) {
    this.cancel();
    this.held = dir;
    this.facing = dir;
    this.paint(false);
  }

  release() {
    this.held = null;
    this.frame = 1;
    this.paint(false);
  }

  cancel() {
    this.queue = [];
    this.held = null;
    this.frame = 1;
    const done = this.done;
    this.done = null;
    if (done) done(false);
  }

  get moving() {
    return Boolean(this.held || this.queue.length);
  }

  /* ---------- 매 프레임 ---------- */

  step(dt) {
    dt = Math.max(0, Math.min(dt, 0.05));
    let moved = 0;
    if (this.held) {
      const target = this.heldTarget(this.held);
      if (target) moved = this.moveToward(target, WALK_SPEED * dt);
      this.facing = this.held;
    } else {
      let budget = CLICK_SPEED * dt;
      while (budget > 1e-9 && this.queue.length) {
        const target = this.queue[0];
        const dx = target[0] - this.x, dy = target[1] - this.y;
        if (Math.abs(dx) > 1e-5 || Math.abs(dy) > 1e-5) {
          const horizontal = Math.abs(dx) >= Math.abs(dy) / this.aspect;
          this.facing = horizontal ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        }
        const step = this.moveToward(target, budget);
        moved += step;
        budget -= step;
        if (this.metric([this.x, this.y], target) < 1e-6) this.queue.shift();
        else break;
      }
      if (!this.queue.length && this.done) {
        const done = this.done;
        this.done = null;
        done(true);
      }
    }
    this.distance += moved;
    this.frame = moved > 0 ? WALK_CYCLE[Math.floor(this.distance / 1.3) % 4] : 1;
    this.paint(moved > 0);
  }

  moveToward(target, budget) {
    const d = this.metric([this.x, this.y], target);
    if (d < 1e-9) return 0;
    const amount = Math.min(d, budget);
    if (amount === d) [this.x, this.y] = target;
    else {
      this.x += (target[0] - this.x) * amount / d;
      this.y += (target[1] - this.y) * amount / d;
    }
    return amount;
  }

  paint(moving) {
    this.onPaint({ x: this.x, y: this.y, facing: this.facing, frame: this.frame, moving });
  }

  start() {
    const tick = time => {
      if (this.lastTime) this.step((time - this.lastTime) / 1000);
      this.lastTime = time;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

window.TourMotion = TourMotion;
