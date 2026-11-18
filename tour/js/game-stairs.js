/* 꿈다락까지 올라라! — original school stair challenge. No borrowed game artwork/audio. */
(() => {
  const MINJU = 'img/npcs/portraits/minju.png';
  const IMG = 'img/games/stairs/';
  const R = window.TourStairsRules;
  const BEST_KEY = 'gch-tour-stairs-best';
  const readBest = () => { try { return Math.max(0, Math.min(R.GOAL, Number(localStorage.getItem(BEST_KEY)) || 0)); } catch { return 0; } };
  document.addEventListener('tour:stamps-reset', () => { try { localStorage.removeItem(BEST_KEY); } catch {} });
  function start(container, api) {
    let engine = null, raf = 0, last = 0, ended = false, disposed = false, hopAt = -Infinity;
    let previousStep = 0, best = readBest(), lastFloor = 1;
    const images = {};
    container.innerHTML = `
      <section class="stairs-game" aria-label="꿈다락 계단 도전">
        <div class="stairs-guide"><img src="${MINJU}" width="96" height="96" alt="민주 선배">
          <div><strong>꿈다락 길잡이 · 민주 선배</strong><p class="stairs-message">다음 계단을 보고, 한 칸씩 올라와!</p></div></div>
        <div class="stairs-hud"><span class="stairs-floor">1층 출발</span><strong><span class="stairs-score">0</span><small> / 80계단</small></strong><span class="stairs-best">최고 ${best}계단</span></div>
        <div class="stairs-energy"><progress max="6" value="6" aria-label="남은 시간"></progress><span class="stairs-time">준비됐나요?</span></div>
        <div class="stairs-stage"><canvas width="320" height="320" role="img" aria-label="민주 선배와 꿈다락으로 오르는 계단"></canvas>
          <div class="stairs-overlay"><span class="stairs-kicker">DREAM STAIRS</span><h3>한 칸씩, 꿈다락까지!</h3><p>같은 방향이면 <b>그대로</b><br>길이 꺾이면 <b>방향 바꿔</b> 올라요.</p><div class="stairs-start-actions"><button type="button" class="btn btn-primary stairs-start">실전 시작</button><button type="button" class="btn stairs-practice">6계단 연습</button></div></div>
        </div>
        <p class="stairs-next">오르기 성공 시 시간이 조금 늘어나요.</p>
        <span class="stairs-cue sr-only" role="status" aria-live="polite" aria-atomic="true"></span>
        <div class="stairs-controls"><button type="button" class="stairs-turn" disabled><span>⇄</span><b>방향 바꿔 오르기</b><small>← / A</small></button><button type="button" class="stairs-climb" disabled><span>↗</span><b>그대로 오르기</b><small>→ / D / Space</small></button></div>
        <div class="stairs-footer"><span>도전 ★1 · 40계단 ★2 · 80계단 ★3</span><button type="button" class="btn stairs-pause" disabled>잠깐 쉬기</button></div>
        <p class="stairs-note">게임 속 상상 계단이에요. 실제 학교에서는 천천히 걸어요.</p>
      </section>`;
    const $ = s => container.querySelector(s);
    const canvas = $('canvas'), ctx = canvas.getContext('2d');
    const overlay = $('.stairs-overlay'), turnButton = $('.stairs-turn'), climbButton = $('.stairs-climb');
    const pauseButton = $('.stairs-pause');
    const sprite = new Image(); sprite.src = 'img/walker.png'; sprite.onload = () => { if (!disposed) paint(performance.now()); };
    for (const name of ['tile-step','goal-attic','star-token', ...[1,2,3,4,5].map(i => `floor-${i}`)]) {
      const image = new Image(); images[name] = image;
      image.onload = () => { if (!disposed) paint(performance.now()); }; image.src = IMG + name + '.png' + (name === 'floor-4' || name === 'tile-step' ? '?v=20261118' : '');
    }
    // Same wardrobe renderer and current outfit as the map. A snapshot per attempt avoids changing mid-hop.
    let outfit = {};
    function getOutfit() { try { const saved = JSON.parse(localStorage.getItem('gch-tour-addons-v1') || '{}'); return saved.equip || {}; } catch { return {}; } }
    const dressed = document.createElement('canvas'); dressed.width = 48; dressed.height = 52;
    function drawImage(name, x, y, w, h) {
      const image = images[name];
      if (image?.complete && image.naturalWidth) { ctx.drawImage(image, x, y, w, h); return true; }
      return false;
    }
    function paint(now) {
      if (disposed) return;
      const s = engine?.state || { path: R.makePath(() => .7), steps: 0, facing: 1, phase: 'ready', goal: R.GOAL };
      const floor = R.floor(s.steps);
      ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#edf5eb'; ctx.fillRect(0,0,320,320);
      // Keep both furnished edges at 2×; omit two strips of empty middle wall.
      const backdrop = images[`floor-${floor}`];
      if (backdrop?.complete && backdrop.naturalWidth) {
        ctx.drawImage(backdrop, 0, 0, 64, 160, 0, 0, 128, 320);
        ctx.drawImage(backdrop, 104, 0, 32, 160, 128, 0, 64, 320);
        ctx.drawImage(backdrop, 176, 0, 64, 160, 192, 0, 128, 320);
      }
      const t = api.reducedMotion ? 1 : Math.min(1, (now - hopAt) / 130);
      const moving = t < 1 && s.phase === 'running';
      const visualStep = moving ? previousStep + t : s.steps;
      const end = Math.min(s.goal, s.steps + 8), begin = Math.max(0, s.steps - 3);
      for (let i = end; i >= begin; i--) {
        const x = 160 + s.path[i] * 34, y = Math.round(252 - (i - visualStep) * 28);
        if (y < -30 || y > 340) continue;
        if (!drawImage('tile-step',x-24,y,48,24)) {ctx.fillStyle='#14285a';ctx.fillRect(x-24,y,48,12);ctx.fillStyle='#fff6e6';ctx.fillRect(x-22,y,44,7);}
        if (i === s.steps + 1) {ctx.fillStyle='#d99e29';ctx.fillRect(x-17,y+2,34,2);}
        if (i === s.goal) drawImage('goal-attic',x-32,y-59,64,64);
        else if (i > s.steps && i % 20 === 0) drawImage('star-token',x-8,y-20,16,16);
      }
      const px = Math.round(160 + (moving ? s.path[previousStep]*(1-t) + s.path[s.steps]*t : s.path[s.steps])*34);
      const py = 252 - (moving ? Math.round(Math.sin(t*Math.PI)*9) : 0);
      const frame = moving ? (s.steps%2 ? 0 : 2) : 1;
      if (sprite.complete && sprite.naturalWidth) {
        if (window.TourCostumes) {
          window.TourCostumes.draw(dressed.getContext('2d'),sprite,s.facing===1?'right':'left',frame,outfit);
          ctx.drawImage(dressed,px-48,py-86,96,104);
        } else ctx.drawImage(sprite,frame*32,(s.facing===1?1:3)*40,32,40,px-32,py-62,64,80);
      }
      canvas.setAttribute('aria-label',`${floor}층, ${s.steps}계단. ${s.steps<s.goal ? '다음 계단은 '+(s.path[s.steps+1]>s.path[s.steps]?'오른쪽':'왼쪽')+'입니다.' : '꿈다락 도착!'}`);
    }
    function hud() {
      const s = engine.state;
      $('.stairs-score').textContent = s.steps;
      $('.stairs-floor').textContent = s.practice ? '연습 중' : `${R.floor(s.steps)}층${s.steps===80?' 꿈다락!':''}`;
      $('.stairs-hud small').textContent = ` / ${s.goal}계단`;
      $('.stairs-energy progress').value = s.remaining;
      $('.stairs-time').textContent = s.practice ? '연습은 시간 제한 없어요' : `남은 시간 ${s.remaining.toFixed(1)}초`;
      $('.stairs-energy').classList.toggle('is-low',!s.practice && s.remaining < 2);
    }
    function hint() {
      const s=engine.state;
      if(s.steps>=s.goal) { $('.stairs-next').textContent=s.practice?'연습 성공!':'꿈다락 도착!'; $('.stairs-cue').textContent=$('.stairs-next').textContent; return; }
      const next = Math.sign(s.path[s.steps+1]-s.path[s.steps]);
      const text = next===s.facing ? '그대로 오르기' : '방향 바꿔 오르기';
      $('.stairs-cue').textContent = `${s.steps}계단. 다음은 ${text}.`;
      $('.stairs-next').textContent = s.practice || s.steps<4 ? `다음은 ${text}!` : `바라보는 방향 ${s.facing===1?'→':'←'} · 다음 계단을 잘 봐요`;
      turnButton.classList.toggle('is-hint',s.practice && next!==s.facing);
      climbButton.classList.toggle('is-hint',s.practice && next===s.facing);
    }
    function controls(enabled) {turnButton.disabled=!enabled;climbButton.disabled=!enabled;pauseButton.disabled=!enabled;}
    function begin(practice) {
      cancelAnimationFrame(raf); ended=false; engine=R.create({practice}); engine.begin(); previousStep=0;hopAt=-Infinity;
      outfit=getOutfit(); last=performance.now(); lastFloor=1; overlay.hidden=true; controls(true);
      $('.stairs-message').textContent=practice?'괜찮아, 틀려도 다시 눌러 봐!':'80계단 위 꿈다락에서 기다릴게!';
      $('.stairs-next').classList.remove('is-miss');hud();hint();paint(last);climbButton.focus({preventScroll:true});
      api.announce(practice?'연습 시작. 여섯 계단을 올라요.':'도전 시작. 다음 계단 방향을 보고 올라요.');
      raf=requestAnimationFrame(tick);
    }
    function syncTime(now) { if(!engine)return;engine.advance((now-last)/1000);last=now; }
    function tick(now) {
      if(disposed || !engine || engine.state.phase!=='running') return;
      syncTime(now);hud();paint(now);
      if(engine.state.phase==='finished') {finish();return;}
      raf=requestAnimationFrame(tick);
    }
    function finish() {
      if(ended || disposed)return; ended=true;cancelAnimationFrame(raf);controls(false);
      const s=engine.state;paint(performance.now());
      if(s.practice){
        overlay.hidden=false;overlay.innerHTML='<span class="stairs-kicker">PRACTICE CLEAR</span><h3>연습 성공!</h3><p>이제 꿈다락까지 올라가 볼까?</p><button type="button" class="btn btn-primary stairs-start">실전 시작</button>';
        $('.stairs-start').focus();api.announce('연습 성공. 실전 시작 버튼을 눌러요.');return;
      }
      best=Math.max(best,s.steps);try{localStorage.setItem(BEST_KEY,String(best));}catch{}
      const extra=document.createElement('div');extra.className='stairs-summary';
      const image=document.createElement('img');image.src=s.reason==='goal'?IMG+'goal-attic.png':MINJU;image.width=80;image.height=80;image.alt='';
      const title=document.createElement('h3');title.textContent=s.reason==='goal'?'꿈다락 도착! 민주 선배와 하이파이브!':s.reason==='time'?'잠깐 숨 고르고, 다시 도전!':'앗, 계단은 반대쪽이었어!';
      const score=document.createElement('p');score.textContent=`${s.steps}계단 · ${R.floor(s.steps)}층 / 내 최고 ${best}계단`;
      const tip=document.createElement('p');tip.textContent=s.reason==='goal'?'한 칸씩 쌓은 도전이 여기까지 왔어요.':s.steps<40?'40계단에 도착하면 별 2개!':'80계단 꿈다락에 도착하면 별 3개!';
      extra.append(image,title,score,tip);api.done({stars:R.stars(s.steps),extra});
    }
    function act(turn) {
      if(!engine || engine.state.phase!=='running' || disposed)return;
      const now=performance.now();syncTime(now);
      if(engine.state.phase==='finished'){finish();return;}
      previousStep=engine.state.steps;
      const correct=engine.step(turn);
      if(correct){hopAt=now;$('.stairs-next').classList.remove('is-miss');hint();
        const floor=R.floor(engine.state.steps);
        if(floor!==lastFloor){lastFloor=floor;$('.stairs-message').textContent=['','출발!','2층! 발걸음이 가벼운데?','3층! 벌써 절반이야!','4층! 꿈다락이 가까워!','5층 도착! 잘했어!'][floor];api.announce(`${floor}층, ${engine.state.steps}계단!`);}
      }else if(engine.state.practice){$('.stairs-next').textContent='괜찮아! 다른 버튼을 눌러 봐.';$('.stairs-next').classList.add('is-miss');}
      hud();paint(now);if(engine.state.phase==='finished')finish();
    }
    function pause() {
      if(!engine || engine.state.phase!=='running')return;
      syncTime(performance.now());if(engine.state.phase==='finished'){finish();return;}
      engine.pause();cancelAnimationFrame(raf);controls(false);overlay.hidden=false;
      overlay.innerHTML='<span class="stairs-kicker">TAKE A BREATH</span><h3>잠깐 쉬는 중</h3><p>시간도 함께 멈췄어요.</p><button type="button" class="btn btn-primary stairs-resume">계속 오르기</button>';
      $('.stairs-resume').focus({preventScroll:true});api.announce('일시정지. 계속 오르기를 누르면 다시 시작해요.');
    }
    function resume(){engine.resume();last=performance.now();overlay.hidden=true;controls(true);climbButton.focus({preventScroll:true});raf=requestAnimationFrame(tick);}
    function onClick(e) {
      if(e.target.closest('.stairs-start'))begin(false);
      else if(e.target.closest('.stairs-practice'))begin(true);
      else if(e.target.closest('.stairs-resume'))resume();
      else if(e.target.closest('.stairs-turn'))act(true);
      else if(e.target.closest('.stairs-climb'))act(false);
      else if(e.target.closest('.stairs-pause'))pause();
    }
    function onKey(e) {
      if(e.isComposing || e.target.closest('input,textarea,select,a') || e.target.isContentEditable)return;
      if(e.target.closest('button') && !e.target.closest('.stairs-controls'))return;
      const key=e.key.toLowerCase();
      // Space/Enter retain native activation on the focused button.
      if(key===' ' && e.target.closest('.stairs-controls button'))return;
      if(!['arrowleft','arrowright','a','d',' '].includes(key))return;
      e.preventDefault();e.stopPropagation();if(!e.repeat)act(key==='arrowleft'||key==='a');
    }
    const onHidden=()=>{if(document.hidden)pause();};
    container.addEventListener('click',onClick);container.addEventListener('keydown',onKey);
    document.addEventListener('visibilitychange',onHidden);window.addEventListener('blur',pause);
    paint(performance.now());$('.stairs-start').focus({preventScroll:true});
    return ()=>{disposed=true;cancelAnimationFrame(raf);container.removeEventListener('click',onClick);container.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onHidden);window.removeEventListener('blur',pause);sprite.onload=null;Object.values(images).forEach(im=>im.onload=null);};
  }
  window.TOUR_GAMES.stairs={title:'꿈다락까지 올라라!',button:'↗ 꿈다락까지 올라라!',room:'꿈다락',naver:'Stairs',maxStars:3,stamp:'꿈다락 도장 획득!',message:'꿈다락은 친구들과 쉬고 함께 공부하는 공간이에요.',start};
})();
