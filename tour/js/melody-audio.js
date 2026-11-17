/* Soft, original synth keyboard. Audio starts only from a user's action. */
(() => {
  function create() {
    let context = null, bus = null, closed = false, muted = false;
    const voices = new Set();
    function stop() {
      for (const voice of voices) {
        try { voice.osc.stop(); } catch {}
        try { voice.osc.disconnect(); voice.gain.disconnect(); } catch {}
      }
      voices.clear();
    }
    async function unlock() {
      if (closed) return false;
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return false;
        if (!context) {
          context = new Audio(); bus = context.createGain();
          bus.gain.value = muted ? 0 : .22; bus.connect(context.destination);
        }
        if (context.state !== 'running') {
          let timeout;
          try { await Promise.race([context.resume(), new Promise(resolve => { timeout = setTimeout(resolve, 1500); })]); }
          finally { clearTimeout(timeout); }
        }
        return !closed && context.state === 'running';
      } catch { return false; }
    }
    function tone(frequency, duration = .3, delay = 0) {
      if (closed || muted || context?.state !== 'running') return;
      const start = context.currentTime + delay;
      const osc = context.createOscillator(), gain = context.createGain();
      const voice = { osc, gain }; voices.add(voice);
      osc.type = 'triangle'; osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(.8, start + .012);
      gain.gain.exponentialRampToValueAtTime(.12, start + Math.max(.06, duration * .72));
      gain.gain.linearRampToValueAtTime(0, start + duration);
      osc.connect(gain); gain.connect(bus);
      osc.onended = () => { voices.delete(voice); osc.disconnect(); gain.disconnect(); };
      osc.start(start); osc.stop(start + duration + .02);
    }
    function setMuted(value) {
      muted = !!value;
      if (bus) bus.gain.value = muted ? 0 : .22;
      if (muted) stop();
    }
    function dispose() {
      if (closed) return;
      closed = true; stop();
      if (context && context.state !== 'closed') context.close().catch(() => {});
    }
    return { unlock, tone, stop, setMuted, dispose };
  }
  window.TourMelodyAudio = { create };
})();
