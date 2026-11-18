/* Short cues for the two arcade games, using the music room's synthesizer. */
(() => {
  const preference = 'gch-tour-arcade-sound';
  const effects = {
    roll: [330, 440, 660],
    ribbon: [660, 880, 1109],
    bump: [185, 139],
    clear: [523, 659, 784, 1047]
  };
  const chainNotes = [392, 494, 587, 784, 988, 1175];

  function mount(dialog, toggle) {
    const audio = window.TourMelodyAudio?.create();
    if (!audio || !(window.AudioContext || window.webkitAudioContext)) return;
    let enabled = false, ready = false, pending = null, closed = false;
    try { enabled = localStorage.getItem(preference) === '1'; } catch {}
    const listeners = new AbortController();
    const options = {signal: listeners.signal};
    function label() {
      toggle.textContent = enabled ? '효과음 켜짐' : '효과음 꺼짐';
      toggle.setAttribute('aria-pressed', String(enabled));
    }
    function unlock() {
      if (!enabled || ready || pending || closed) return;
      pending = audio.unlock().then(ok => { ready = ok; }).finally(() => { pending = null; });
    }
    function cue(name, depth = 1) {
      if (!enabled || !ready || closed || document.hidden) return;
      if (name === 'merge') {
        const i = Math.min(chainNotes.length, Math.max(1, Math.floor(depth) || 1)) - 1;
        audio.tone(chainNotes[i], .12);
      } else {
        effects[name]?.forEach((note, i) => audio.tone(note, .12, i * .06));
      }
    }
    toggle.addEventListener('click', () => {
      enabled = !enabled;
      audio.setMuted(!enabled);
      try { localStorage.setItem(preference, enabled ? '1' : '0'); } catch {}
      label();
      if (enabled) {
        unlock();
        Promise.resolve(pending).then(() => cue('merge'));
      }
    }, options);
    dialog.addEventListener('pointerdown', unlock, options);
    dialog.addEventListener('keydown', unlock, options);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { ready = false; audio.stop(); }
    }, options);
    toggle.hidden = false;
    label();
    return { cue, dispose() {
      if (closed) return;
      closed = true;
      listeners.abort();
      toggle.hidden = true;
      audio.dispose();
    }};
  }
  window.TourArcadeAudio = { mount };
})();
