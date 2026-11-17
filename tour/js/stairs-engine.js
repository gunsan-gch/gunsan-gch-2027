/* Dream stairs: pure rules, independent of rendering, input devices and storage. */
(() => {
  const GOAL = 80, CAPACITY = 6;
  function makePath(random = Math.random, length = GOAL) {
    const path = [0]; let direction = 1, run = 0;
    for (let i = 0; i < length; i++) {
      const x = path[path.length - 1];
      if (i > 1 && (Math.abs(x + direction) > 3 || run >= 4 || (run >= 2 && random() < .38))) {
        direction *= -1; run = 0;
      }
      path.push(x + direction); run++;
    }
    return path;
  }
  function create({ practice = false, random = Math.random } = {}) {
    const goal = practice ? 6 : GOAL;
    const state = { path: practice ? [0,1,2,1,0,1,2] : makePath(random), steps: 0, facing: 1,
      remaining: CAPACITY, phase: 'ready', reason: '', practice, goal };
    function begin() { if (state.phase === 'ready') state.phase = 'running'; }
    function advance(seconds) {
      if (state.phase !== 'running' || practice || !Number.isFinite(seconds) || seconds < 0) return;
      state.remaining = Math.max(0, state.remaining - seconds);
      if (state.remaining <= 0) { state.phase = 'finished'; state.reason = 'time'; }
    }
    function step(turn = false) {
      if (state.phase !== 'running') return false;
      const direction = turn ? -state.facing : state.facing;
      if (direction !== Math.sign(state.path[state.steps + 1] - state.path[state.steps])) {
        if (!practice) { state.phase = 'finished'; state.reason = 'direction'; }
        return false;
      }
      state.facing = direction; state.steps++;
      state.remaining = Math.min(CAPACITY, state.remaining + (state.steps < 20 ? .5 : .38));
      if (state.steps >= goal) { state.phase = 'finished'; state.reason = 'goal'; }
      return true;
    }
    function pause() { if (state.phase === 'running') state.phase = 'paused'; }
    function resume() { if (state.phase === 'paused') state.phase = 'running'; }
    return { state, begin, advance, step, pause, resume };
  }
  const stars = steps => steps >= GOAL ? 3 : steps >= 40 ? 2 : 1;
  const floor = steps => Math.min(5, 1 + Math.floor(steps / 20));
  window.TourStairsRules = { GOAL, CAPACITY, makePath, create, stars, floor };
})();
