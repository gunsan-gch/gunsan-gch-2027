/* Original four-note melodies and pure memory-game rules. No DOM, audio or storage. */
(() => {
  const NOTES = Object.freeze([
    { name: '도', key: 'A', frequency: 261.625565 },
    { name: '레', key: 'S', frequency: 293.664768 },
    { name: '미', key: 'D', frequency: 329.627557 },
    { name: '솔', key: 'F', frequency: 391.995436 }
  ].map(Object.freeze));
  const SONGS = Object.freeze([
    { id: 'morning', title: '등굣길', mood: '가벼운 발걸음으로', bpm: 106,
      notes: [0, 1, 2, 1, 0, 2, 3, 0], beats: [1, 1, 1, 1, 1, 1, 1, 2] },
    { id: 'window', title: '햇살 창가', mood: '포근하고 느긋하게', bpm: 90,
      notes: [2, 1, 0, 1, 2, 3, 2, 0], beats: [1, 1, 2, 1, 1, 1, 1, 2] },
    { id: 'break', title: '쉬는 시간', mood: '통통 튀는 리듬으로', bpm: 112,
      notes: [0, 0, 3, 2, 1, 1, 2, 0], beats: [.75, .75, 1.5, 1, .75, .75, 1.5, 2] },
    { id: 'stars', title: '별빛 합주', mood: '반짝이는 별처럼', bpm: 92,
      notes: [3, 2, 1, 2, 3, 1, 2, 0], beats: [1, 1, 1, 1, 1, 1, 1, 2] },
    { id: 'attic', title: '꿈다락 산책', mood: '한 칸씩 꿈을 향해', bpm: 100,
      notes: [0, 2, 3, 2, 1, 2, 1, 0], beats: [1, 1, 1, 1, 1, 1, 1, 2] }
  ].map(song => Object.freeze({ ...song, notes: Object.freeze(song.notes), beats: Object.freeze(song.beats) })));
  const LENGTHS = Object.freeze([3, 4, 5, 6, 8]);
  function pickSong(previous = '', random = Math.random) {
    const choices = SONGS.filter(song => song.id !== previous);
    const value = random();
    const index = Math.floor(Math.max(0, Math.min(.999999999, Number.isFinite(value) ? value : 0)) * choices.length);
    return choices[index];
  }
  function timeline(song, length = song.notes.length) {
    let at = 0;
    const notes = song.notes.slice(0, length).map((note, index) => {
      const beat = song.beats[index] * 60 / song.bpm;
      const event = { note, at, duration: beat * .72 };
      at += beat;
      return event;
    });
    return { notes, duration: at };
  }
  function create(songId, { practice = false } = {}) {
    const song = SONGS.find(item => item.id === songId) || SONGS[0];
    const state = { song, practice, round: 0, cleared: 0, entered: 0, lives: 3,
      phase: 'ready', reason: '', replays: 0 };
    const pattern = () => practice ? [0, 1, 2] : song.notes.slice(0, LENGTHS[state.round]);
    function listen() {
      if (!['ready', 'input', 'retry', 'paused'].includes(state.phase)) return false;
      if (state.phase === 'input' || state.phase === 'retry') state.replays++;
      state.phase = 'listening'; state.entered = 0; return true;
    }
    function listened() {
      if (state.phase !== 'listening') return false;
      state.phase = 'input'; return true;
    }
    function press(note) {
      if (state.phase !== 'input' || !Number.isInteger(note) || note < 0 || note >= NOTES.length) return 'ignored';
      if (note !== pattern()[state.entered]) {
        if (!practice) state.lives--;
        state.entered = 0;
        state.phase = state.lives ? 'retry' : 'finished';
        if (!state.lives) state.reason = 'lives';
        return 'miss';
      }
      state.entered++;
      if (state.entered < pattern().length) return 'correct';
      state.cleared++;
      if (practice || state.cleared === LENGTHS.length) {
        state.phase = 'finished'; state.reason = 'complete';
      } else state.phase = 'cleared';
      return 'clear';
    }
    function next() {
      if (state.phase !== 'cleared') return false;
      state.round++; state.entered = 0; state.phase = 'listening'; return true;
    }
    function pause() {
      if (!['listening', 'input', 'retry'].includes(state.phase)) return false;
      state.phase = 'paused'; state.entered = 0; return true;
    }
    return { state, pattern, listen, listened, press, next, pause };
  }
  const stars = cleared => cleared >= LENGTHS.length ? 3 : cleared >= 3 ? 2 : 1;
  window.TourMelodyRules = { NOTES, SONGS, LENGTHS, pickSong, timeline, create, stars };
})();
