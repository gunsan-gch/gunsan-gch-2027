/* Meaningful rule/asset/integration and audio lifecycle regression checks. */
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), ctx = { window: {} }; vm.createContext(ctx);
const load = file => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx);
load('js/melody-engine.js'); const R = ctx.window.TourMelodyRules;
let checks = 0; const check = (value, why) => { assert.ok(value, why); checks++; };
check(R.SONGS.length === 5 && new Set(R.SONGS.map(s => s.id)).size === 5, 'five different songs');
check(new Set(R.SONGS.map(s => s.notes.join(','))).size === 5, 'five different melodies');
for (const song of R.SONGS) {
  check(song.notes.length === 8 && song.beats.length === 8, 'complete eight-note motif');
  check(song.notes.every(n => Number.isInteger(n) && n >= 0 && n < 4), 'only the four playable keys');
  const timeline = R.timeline(song);
  check(timeline.notes.length === 8 && timeline.duration > 4 && timeline.duration < 8, 'short audible full melody');
  for (let i = 0; i < 8; i++) {
    const note = timeline.notes[i]; check(note.duration > .1 && note.at + note.duration < (timeline.notes[i+1]?.at ?? timeline.duration), 'separate note onsets and rests');
  }
  const e = R.create(song.id); check(e.press(0) === 'ignored', 'ready input blocked');
  for (let round = 0; round < 5; round++) {
    check(round === 0 ? e.listen() : e.next(), 'start next listening phase');
    check(e.pattern().length === [3,4,5,6,8][round], 'increasing memory length');
    check(e.press(e.pattern()[0]) === 'ignored', 'demonstration cannot consume input');
    check(e.listened(), 'listening transitions to input');
    for (const n of e.pattern()) e.press(n);
    check(e.state.cleared === round + 1, 'one reward checkpoint per completed pattern');
    check(e.press(e.pattern()[0]) === 'ignored', 'input cannot skip next stage or duplicate clear');
  }
  check(e.state.phase === 'finished' && e.state.reason === 'complete' && R.stars(e.state.cleared) === 3, 'all songs can earn three stars');
  check(!e.listen() && !e.next(), 'finished attempt cannot restart in place');
  for (let cleared = 0; cleared < 5; cleared++) {
    const f = R.create(song.id); f.listen(); f.listened();
    for (let k = 0; k < cleared; k++) { for (const n of f.pattern()) f.press(n); f.next(); f.listened(); }
    for (let misses = 0; misses < 3; misses++) {
      check(f.press((f.pattern()[0]+1)%4) === 'miss', 'wrong note consumes one chance');
      check(f.state.lives === 2-misses, 'exactly three chances');
      if (misses < 2) { f.listen(); f.listened(); }
    }
    check(f.state.phase === 'finished' && f.state.cleared === cleared && R.stars(cleared) === (cleared >= 3 ? 2 : 1), 'failure retains completed stages and correct stars');
  }
  const p = R.create(song.id, { practice: true }); p.listen(); p.listened();
  for (let n = 0; n < 30; n++) { p.press(3); p.listen(); p.listened(); }
  check(p.state.lives === 3 && p.state.cleared === 0, 'practice mistakes have no penalty');
  for (const n of p.pattern()) p.press(n);
  check(p.state.practice && p.state.reason === 'complete', 'practice has a separate terminal state');
}
for (const previous of ['', ...R.SONGS.map(s => s.id)]) {
  const seen = new Set();
  for (let i = 0; i < 100; i++) { const song = R.pickSong(previous, () => i/100); seen.add(song.id); check(song.id !== previous, 'no immediately repeated song'); }
  check(seen.size === (previous ? 4 : 5), 'every eligible song can be chosen');
}
const e = R.create('morning'); e.listen(); e.listened(); e.press(0);
check(e.listen() && e.state.entered === 0 && e.state.lives === 3, 'replay clears partial input without penalty');
check(e.pause() && !e.listened() && e.press(0) === 'ignored', 'pause cancels listening and input');
check(e.listen() && e.listened() && e.state.entered === 0, 'resume starts current pattern again');
load('js/tour-data.js'); load('js/star-progress.js');
const rooms = Object.values(ctx.window.TOUR_SCENES).flatMap(s => s.rooms).flatMap(r => (r.games || (r.game ? [r.game] : [])).map(id => ({...r,game:id})));
check(rooms.length >= 11 && rooms.filter(r => r.game === 'melody' && r.name === '음악실').length === 1, 'all games, one music-room entry');
const progress = ctx.window.TourStarProgress.summarize(Object.fromEntries(rooms.map(r => [r.game, {stars:3}])), rooms.map(r => ({id:r.game,maxStars:3})));
check(progress.maxStars === rooms.length * 3 && progress.stars === rooms.length * 3 && ctx.window.TourStarProgress.TITLE_AT === 27, 'all games with existing title threshold');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
check(html.indexOf('js/melody-engine.js') < html.indexOf('js/game-melody.js') && html.indexOf('js/melody-audio.js') < html.indexOf('js/game-melody.js'), 'dependencies load before game');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'img/ASSET-SOURCES.json'),'utf8')).sources;
const art = Object.values(manifest).filter(a => a.generator === 'tools/make_melody_game_art.mjs');
check(art.length === 9,'nine documented new PNGs');
for (const a of art) check(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'img',a.output))).digest('hex') === a.sha256, 'asset matches manifest: '+a.output);
(async () => {
  let created = 0, resumed = 0, closed = 0; const oscillators = [];
  class Gain { constructor(){ this.gain = {value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}}; } connect(){} disconnect(){} }
  class Audio {
    constructor(){created++;this.state='suspended';this.currentTime=10;this.destination={};}
    createGain(){return new Gain();}
    createOscillator(){const o={frequency:{value:0},connect(){},disconnect(){},start(t){this.startAt=t;},stop(t){this.stopAt=t;this.stopped=true;}};oscillators.push(o);return o;}
    async resume(){resumed++;this.state='running';}
    async close(){closed++;this.state='closed';}
  }
  ctx.window.AudioContext=Audio;ctx.setTimeout=setTimeout;ctx.clearTimeout=clearTimeout;load('js/melody-audio.js');
  const audio=ctx.window.TourMelodyAudio.create();
  audio.tone(261);check(created===0&&oscillators.length===0,'no autoplay before user unlock');
  check(await audio.unlock(),'audio resumes');check(created===1&&resumed===1,'one context');
  audio.tone(261,.4,.5);check(oscillators[0].startAt===10.5&&oscillators[0].stopAt===10.92,'sample-accurate scheduling');
  audio.stop();check(oscillators[0].stopped,'stop cancels scheduled tones');
  audio.setMuted(true);audio.tone(293);check(oscillators.length===1,'muted keys stay silent');
  audio.setMuted(false);audio.tone(329);check(oscillators.length===2,'unmuting restores sound');
  audio.dispose();audio.dispose();check(closed===1&&!(await audio.unlock()),'close is idempotent and cannot reopen');
  delete ctx.window.AudioContext;check(!(await ctx.window.TourMelodyAudio.create().unlock()),'unsupported audio degrades gracefully');
  console.log(JSON.stringify({checks,songs:5,allSongsCompletable:true,stages:[3,4,5,6,8],totalGames:rooms.length,maxStars:progress.maxStars,assets:art.length,audioLifecycle:'passed'}));
})().catch(error=>{console.error(error);process.exitCode=1;});
