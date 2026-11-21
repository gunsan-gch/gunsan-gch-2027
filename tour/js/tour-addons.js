/* Optional mission and wardrobe. This module never awards or edits a game stamp. */
(() => {
  if (!window.tourAddonHost || !window.TourCostumes || !window.tourGame || !window.TourStarProgress || !document.querySelector('#festival-dialog')) return;
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const KEY='gch-tour-addons-v1';
  const rewards=window.TourCostumes.items;
  const rules=window.TourStarProgress;
  const score=()=>window.tourGame.progress();
  const clean=()=>({wardrobe:rules.emptyWardrobe(),started:false,ribbon:false,bread:false,poster:false,complete:false,equip:{head:null,back:null}});
  function loadState(){
    let s={};try{s=JSON.parse(localStorage.getItem(KEY))||{};}catch{}
    const next={...clean(),started:!!s.started,ribbon:!!s.ribbon,bread:!!s.bread,poster:!!s.poster,complete:!!s.complete,
      wardrobe:rules.wardrobe(s.wardrobe,score(),rewards),
      equip:Object.fromEntries(['head','back'].map(slot=>[slot,rewards.some(r=>r.slot===slot&&r.id===s.equip?.[slot])?s.equip[slot]:null]))};
    if(!(next.ribbon&&next.bread&&next.poster))next.complete=false;
    return next;
  }
  let state=loadState();
  const has=r=>state.wardrobe.unlocked.includes(r.id);
  const host=window.tourAddonHost;
  const sprite=new Image();
  let spriteReady=false;
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{toast('이 브라우저에서는 추가 기능의 진행 기록을 저장할 수 없어요.');return false;}}
  let toastTimer;
  function toast(message){const el=$('#addon-toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,4200)}
  const colors={ink:'#233c50',pink:'#ed7988',darkpink:'#c2546b',cream:'#fff2c9',gold:'#f4ca63',green:'#70ac91',darkgreen:'#367966',blue:'#78b7cc'};
function rect(c,x,y,w,h,color){c.fillStyle=colors[color]||color;c.fillRect(x,y,w,h)}
function art(c,id){c.clearRect(0,0,32,32);const r=(...a)=>rect(c,...a);if(id==='ribbon'){r(4,9,9,13,'ink');r(19,9,9,13,'ink');r(6,11,7,9,'pink');r(19,11,7,9,'pink');r(12,13,8,7,'ink');r(14,14,4,5,'darkpink');r(7,11,3,3,'#ffb6bf');r(22,11,3,3,'#ffb6bf');r(9,22,5,4,'pink');r(18,22,5,4,'pink');}else if(id==='bread'){r(5,11,22,14,'ink');r(8,8,16,3,'ink');r(7,12,18,11,'#ce843e');r(9,10,14,10,'#edb866');r(11,12,3,3,'cream');r(18,12,3,3,'cream');r(7,24,18,3,'cream');}else if(id==='poster'){r(6,4,20,25,'ink');r(8,6,16,21,'cream');r(8,6,16,5,'pink');r(12,14,8,8,'gold');r(15,12,2,12,'gold');r(10,17,12,2,'gold');r(10,25,12,1,'green');}else if(id==='bag'){r(11,4,10,5,'ink');r(13,6,6,3,'cream');r(6,9,20,19,'ink');r(8,11,16,15,'green');r(10,18,12,7,'darkgreen');r(14,13,4,3,'cream');r(11,20,10,1,'cream');}else if(id==='beret'){r(8,7,18,11,'ink');r(4,11,24,9,'ink');r(6,12,20,6,'blue');r(10,9,14,5,'blue');r(19,8,3,9,'gold');r(16,11,9,3,'gold');r(7,20,19,3,'ink');}else if(id==='cape'){r(11,4,10,6,'gold');r(9,10,14,3,'ink');r(7,13,18,7,'ink');r(5,20,22,8,'ink');r(11,12,10,14,'pink');r(8,19,16,7,'pink');r(7,26,18,2,'gold');r(15,14,2,8,'cream');r(12,17,8,2,'cream');}else{r(9,3,14,3,'gold');r(5,6,22,5,'gold');r(3,11,26,11,'gold');r(5,22,22,4,'gold');r(9,26,14,3,'gold');r(14,8,4,15,'ink');r(9,13,14,4,'ink');r(11,19,10,2,'ink');}}
function drawAvatar(c,dir='down',frame=1,equip=state.equip,who='player'){
  const outfit={...equip};if(who==='yuna')outfit.head='ribbon';
  window.TourCostumes.draw(c,sprite,dir,frame,outfit);
}

  // 선배 캐릭터: 플레이어와 같은 32×40 걷기 시트 (tools/make_npc_sheets.py). 시트가 없는 아름 선배는 플레이어 그림에 리본.
  const npcSheets={songhyeon:'img/npcs/sheets/songhyeon.png?v=20261118'};
  const npcImages=Object.fromEntries(Object.entries(npcSheets).map(([id,src])=>{const im=new Image();im.onload=()=>paint();im.src=src;return [id,im];}));
  function drawNpc(c,id){const im=npcImages[id];if(im?.complete&&im.naturalWidth){c.clearRect(0,0,32,40);c.imageSmoothingEnabled=false;c.drawImage(im,32,0,32,40,0,0,32,40);}else if(spriteReady)drawAvatar(c,'down',1,{},id);}
  function paint(root=document){root.querySelectorAll('[data-addon-art]').forEach(c=>art(c.getContext('2d'),c.dataset.addonArt));root.querySelectorAll('[data-addon-npc]').forEach(c=>drawNpc(c.getContext('2d'),c.dataset.addonNpc));}
  const icon=id=>`<canvas width="32" height="32" data-addon-art="${id}" aria-hidden="true"></canvas>`;
  const portrait=id=>`<canvas width="32" height="40" data-addon-npc="${id}" aria-hidden="true"></canvas>`;
  const dialog=$('#festival-dialog'),body=$('#festival-body');
  let view='',opener=null,questTicket=0,previewEquip=null,previewDir='down',closetFilter='all',previewWalking=false,previewTick=0,previewTimer=null,renderCloset=null,lastPose=host.position();
  function stopPreview(){clearInterval(previewTimer);previewTimer=null;renderCloset=null;}
  function close(){stopPreview();dialog.close();view='';previewEquip=null;opener?.focus?.({preventScroll:true});}
  function show(type,title,html,eyebrow='탐험 미션'){stopPreview();host.stop();dialog.classList.toggle('is-wardrobe',type==='wardrobe');view=type;$('#festival-title').textContent=title;$('#festival-eyebrow').textContent=eyebrow;body.innerHTML=html;paint(body);if(!dialog.open){opener=document.activeElement;dialog.showModal();}$('#festival-close').focus({preventScroll:true});}
  $('#festival-close').onclick=close;
  dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()});
  const locations = {
    yuna: { floor: 'outdoor', p: [59, 51], approach: [56, 50], name: '아름 선배', npc: 'yuna' },
    ribbon: { floor: '1', p: [44.3, 22], name: '예술제 리본' },
    poster: { floor: '3', p: [54, 25], approach: [51, 25], name: '송현 선배', npc: 'songhyeon' }
  };
  async function visit(id){close();const p=locations[id];const ticket=++questTicket;const reached=await host.go(p.floor,p.approach||p.p,p.name);if(reached&&ticket===questTicket)talk(id);}
  function points() {
    const stage = $('#scene-stage');
    stage.querySelectorAll('.addon-point').forEach(n => n.remove());
    for (const [id, place] of Object.entries(locations)) {
      if (place.floor !== host.scene()) continue;
      if (id === 'ribbon' && (!state.started || state.ribbon)) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'addon-point' + (place.npc ? '' : ' is-item');
      button.style.left = place.p[0] + '%';
      button.style.top = place.p[1] + '%';
      button.dataset.addonPoint = id;
      button.setAttribute('aria-label', place.name + (place.npc ? ' 만나러 가기' : ' 찾으러 가기'));
      const alert = id === 'poster' ? state.started && !state.poster : !state.complete;
      const figure = place.npc ? portrait(place.npc) : icon(id);
      button.innerHTML = figure + `<span class="addon-npc-name">${place.name}</span>` +
        (alert ? '<span class="addon-alert" aria-hidden="true">!</span>' : '');
      button.onclick = () => visit(id);
      stage.append(button);
    }
    paint(stage);
  }
  const costume=document.createElement('canvas');costume.width=48;costume.height=52;costume.className='addon-outfit-layer';costume.setAttribute('aria-hidden','true');$('#scene-walker').append(costume);
  function paintPlayer(p=lastPose){lastPose=p;const wearing=!!(state.equip.head||state.equip.back);$('#scene-walker').classList.toggle('has-addon-outfit',wearing);costume.hidden=!wearing;if(wearing&&spriteReady)drawAvatar(costume.getContext('2d'),p.facing,p.frame);}
  document.addEventListener('tour:avatar',e=>paintPlayer(e.detail));
  document.addEventListener('tour:scene',()=>points());
  function sync(notify=true){
    const previous=state.wardrobe;
    state.wardrobe=rules.wardrobe(previous,score(),rewards);
    const unlocked=notify?rewards.filter(r=>has(r)&&!previous.unlocked.includes(r.id)):[];
    const title=notify&&state.wardrobe.title&&!previous.title;
    let changed=JSON.stringify(previous)!==JSON.stringify(state.wardrobe);
    for(const r of rewards){if(!has(r)&&state.equip[r.slot]===r.id){state.equip[r.slot]=null;changed=true;}}
    if(state.started&&!state.bread&&window.tourGame.stamps().bakery){state.bread=true;changed=true;}
    if(changed)save();
    window.TourUI.label($('#wardrobe-open'),'closet','내 옷장');window.TourUI.label($('#festival-open'),'mission',state.complete?'미션 완료':state.started?`탐험 미션 ${['ribbon','bread','poster'].filter(k=>state[k]).length}/3`:'탐험 미션');paintPlayer();points();return {items:unlocked,title};
  }
  const supplies = [
    { id: 'ribbon', name: '예술제 리본', where: '1층 · 정보처리실 앞' },
    { id: 'bread', name: '갓 구운 빵', where: '1층 · 조리제빵실' },
    { id: 'poster', name: '초대 포스터', where: '3층 · 송현 선배' }
  ];
  const talkPortrait = id => `<div class="addon-portrait">${portrait(id)}</div>`;
  // 아름 선배 말풍선: 한 줄씩 말하듯이
  const yunaSays = (lines, compact = false) => `
    <div class="senior-card is-talk${compact ? ' is-compact' : ''}">${talkPortrait('yuna')}
      <div><strong>아름 선배 · 예술제 준비부</strong>${lines.map(line => `<p>${line}</p>`).join('')}</div>
    </div>`;
  // 준비물 3칸 (찾을 곳 표시는 미션 시작 전 안내에서만)
  function inventory(showWhere = false) {
    return `<div class="addon-inventory">${supplies.map(item => `
      <div class="addon-supply ${state[item.id] ? 'is-got' : ''}">
        ${icon(item.id)}<span>${item.name}</span>
        ${showWhere && !state[item.id] ? `<small>${item.where}</small>` : ''}
        ${state[item.id] ? '<b class="addon-check" aria-label="수집 완료">✓</b>' : ''}
      </div>`).join('')}</div>`;
  }
  function quest() {
    sync(false);
    if (state.complete) { completeView(); return; }
    if (!state.started) {
      show('quest', '녹원예술제 준비 대작전', `
        ${yunaSays(['앗, 후배님 마침 잘 왔다!', '예술제가 코앞인데 준비물이 하나도 없어ㅠㅠ', '잔디마당으로 와 줄래? 나 거기 있어!'])}
        ${inventory(true)}
        <div class="addon-actions"><button class="btn btn-primary" id="addon-meet">아름 선배 만나기</button></div>`);
      $('#addon-meet').onclick = () => visit('yuna');
      return;
    }
    const ready = state.ribbon && state.bread && state.poster;
    show('quest', '녹원예술제 준비 대작전', `
      ${yunaSays([ready ? '헐 다 모았어?! 잔디마당으로 빨리 와!!'
        : `아직 ${supplies.filter(item => !state[item.id]).length}개 남았어! 천천히 와, 기다릴게~`], true)}
      ${inventory()}
      <ul class="addon-tasks">${supplies.map(item => `
        <li class="${state[item.id] ? 'is-got' : ''}">
          <div class="addon-task-copy"><strong>${item.name}</strong>
            <small>${state[item.id] ? '✓ 준비 완료' : item.where}</small>
          </div>
          ${state[item.id] ? '' : `<button class="btn" data-addon-task="${item.id}">${item.id === 'bread' ? '빵 굽기' : '찾아가기'}</button>`}
        </li>`).join('')}</ul>
      <div class="addon-actions">
        <button class="btn" id="addon-quest-reset">미션 다시하기</button>
        ${state.poster ? pressAction : ''}
        ${ready ? '<button class="btn btn-primary" id="addon-deliver-go">선배에게 전달하기</button>' : ''}
      </div>`);
    $$('[data-addon-task]').forEach(button => button.onclick = () => {
      if (button.dataset.addonTask === 'bread') {
        close();
        host.room('조리제빵실', $('#festival-open'));
      } else visit(button.dataset.addonTask);
    });
    bindPress();
    $('#addon-quest-reset').onclick = resetQuest;
    if (ready) $('#addon-deliver-go').onclick = () => visit('yuna');
  }
  function talk(id) {
    if (id === 'poster') { talkSonghyeon(); return; }
    if (id === 'yuna') {
      if (state.complete) { completeView(); return; }
      if (!state.started) {
        show('talk', '우리 예술제, 같이 준비할래?', `
          ${yunaSays(['안녕! 나 예술제 준비부 아름이야 ㅎㅎ', '리본, 갓 구운 빵, 초대 포스터! 딱 세 개만 같이 챙겨 줄래?',
            '리본은 1층 정보처리실 앞에 두고 왔고', '빵은 조리제빵실에서 빵 굽기 끝내면 생겨!',
            '포스터는 3층 드림스페이스에서 송현이가 그리는 중~ 내가 보냈다고 하면 돼'])}
          ${inventory(true)}
          <div class="addon-actions"><button class="btn btn-primary" id="addon-start">좋아, 같이 준비하자!</button></div>`, '예술제 준비부 · 아름 선배');
        $('#addon-start').onclick = () => { state.started = true; save(); sync(false); quest(); };
        return;
      }
      if (state.ribbon && state.bread && state.poster) {
        show('talk', '준비물을 전부 챙겨 왔네!', `
          ${yunaSays(['헐 대박, 진짜 다 챙겨 왔네?!', '포스터 완전 예쁘다… 송현이 금손 인정', '너 없었으면 진짜 큰일 날 뻔했어ㅠㅠ'])}
          ${inventory()}
          <div class="addon-actions"><button class="btn btn-primary" id="addon-finish">준비물 전달하기</button></div>`, '예술제 준비부 · 아름 선배');
        $('#addon-finish').onclick = () => { state.complete = true; save(); sync(false); completeView(); };
        return;
      }
      quest();
      return;
    }
    if (!state.started) { quest(); return; }
    if (state[id]) { toast('이미 챙긴 준비물이에요.'); return; }
    if (id === 'ribbon') {
      show('collect', '예술제 리본을 찾았어요!', `
        ${inventory()}
        <div class="addon-actions"><button class="btn btn-primary" id="addon-collect">리본을 가방에 넣기</button></div>`);
      $('#addon-collect').onclick = () => collect('ribbon');
    }
  }
  const pressAction = '<button type="button" class="btn" id="addon-press">수빈 선배와 예술제 취재하기</button>';
  function bindPress() {
    const button = $('#addon-press');
    if (!button) return;
    button.onclick = () => {
      dialog.addEventListener('close', () => window.tourGame.practice('press', $('#festival-open')), {once: true});
      close();
    };
  }
  function talkSonghyeon() {
    let title, line, action, next;
    if (!state.started) {
      title = '포스터 색을 고르는 중이야';
      line = '초대 포스터를 그리고 있어. 아름 선배와 같이 준비할래?';
      action = '잔디마당의 아름 선배 만나기';
      next = () => visit('yuna');
    } else if (!state.poster) {
      title = '아름 선배가 보냈구나!';
      line = '포스터 완성! 아름 선배에게 전해 줘.';
      action = '초대 포스터 받기';
      next = () => collect('poster');
    } else if (state.complete) {
      title = '우리 포스터, 잘 보이더라!';
      line = '포스터 잘 붙였어! 이제 수빈이와 예술제 취재하러 갈래?';
      action = '다시 둘러보기';
      next = close;
    } else if (state.ribbon && state.bread) {
      title = '이제 아름 선배에게 가자!';
      line = '준비 완료! 잔디마당의 아름 선배에게 전해 줘.';
      action = '아름 선배에게 전달하러 가기';
      next = () => visit('yuna');
    } else {
      title = '초대 포스터는 네 가방에 있어';
      line = state.ribbon ? '리본도 찾았네. 1층 조리제빵실에서 예술제 빵을 구워 볼래?'
        : state.bread ? '빵 냄새가 좋다! 이제 1층 정보처리실 앞 리본을 찾으면 돼.'
        : '1층에서 리본과 빵을 챙겨 줘!';
      action = '준비물 확인하기';
      next = quest;
    }
    show('talk', title, `<div class="senior-card"><div class="addon-portrait"><img class="songhyeon-portrait" src="img/npcs/portraits/songhyeon.png" width="104" height="104" alt=""></div><div><strong>송현 선배 · 이음 홍보부</strong><p>${line}</p></div></div>
      <div class="addon-actions"><button class="btn btn-primary" id="addon-songhyeon-next">${action}</button>${state.poster ? pressAction : ''}</div>`, '홍보동아리 이음 · 송현 선배');
    $('#addon-songhyeon-next').onclick = next;
    bindPress();
  }
  function collect(id){state[id]=true;save();sync(false);quest();toast('가방에 챙겼어요! 남은 준비물도 찾아보세요.');}
  function completeView() {
    show('complete', '예술제 준비 완료!', `
      ${yunaSays(['이제 너도 우리 준비팀 정식 멤버야 ㅎㅎ', '예술제 날 꼭 놀러 와!'])}
      ${inventory()}
      <div class="addon-actions">
        <button class="btn" id="addon-quest-reset">미션 다시하기</button>${pressAction}
        <button class="btn btn-primary" id="addon-open-closet">내 옷장</button>
      </div>`);
    $('#addon-quest-reset').onclick = resetQuest;
    $('#addon-open-closet').onclick = () => wardrobe();
    bindPress();
  }
  function resetQuest(){show('reset','탐험 미션만 다시 할까요?',`<p>모은 준비물과 예술제 준비 완료 표시를 지워요. 기존 게임의 도장·별 기록과 착용한 소품은 유지돼요.</p><div class="addon-actions"><button class="btn btn-primary" id="addon-reset-no">이어서 하기</button><button class="btn" id="addon-reset-yes">미션 다시 시작</button></div>`);$('#addon-reset-no').onclick=quest;$('#addon-reset-yes').onclick=()=>{const {equip,wardrobe}=state;state=clean();state.equip=equip;state.wardrobe=wardrobe;save();sync(false);quest();};$('#addon-reset-no').focus();}
  function outfitTile(item) {
    const unlocked = has(item), equipped = state.equip[item.slot] === item.id;
    return `<button type="button" class="addon-outfit ${unlocked ? 'is-unlocked' : ''} ${equipped ? 'is-equipped' : ''}"
      data-addon-card="${item.id}" data-addon-equip="${item.id}">
      <span class="addon-item-art">
        <canvas width="48" height="52" data-addon-costume="${item.id}" aria-hidden="true"></canvas>
        ${equipped ? '<span class="addon-item-chip">착용 중</span>' : unlocked ? '' :
          `<span class="addon-item-chip"><i class="addon-lock" aria-hidden="true"></i>★ ${item.at}</span>`}
      </span>
      <span class="addon-item-copy"><strong>${item.name}</strong></span>
    </button>`;
  }
  function wardrobe(keepPreview = false, preset = null) {
    sync(false);
    if (!keepPreview) { previewEquip = { ...state.equip, ...(preset || {}) }; previewWalking = false; }
    if (!previewEquip) previewEquip = { ...state.equip };
    const progress = score(), n = progress.stars, next = rewards.find(item => !has(item));
    const practice = progress.games.filter(game => game.stars < game.maxStars).sort((a, b) => a.stars - b.stars);
    const visible = rewards.filter(item => closetFilter === 'all' ||
      (closetFilter === 'new' ? item.at >= 27 : item.slot === closetFilter));
    show('wardrobe', '내 옷장', `
      <section class="addon-star-progress" aria-label="옷장 해금 진행">
        <div class="addon-star-total"><strong>★ ${n}/${progress.maxStars}</strong>
          <span>옷 ${state.wardrobe.unlocked.length}/${rewards.length}</span>
        </div>
        <progress value="${n}" max="${progress.maxStars || 66}" aria-label="모은 최고 별 ${n}개"></progress>
        <p class="addon-next-reward">${next ? `다음 보상까지 <b>★ ${Math.max(0, next.at - n)}</b>` : '모든 옷을 열었어요!'}</p>
        ${state.wardrobe.title ? `<p class="addon-star-title">칭호 · ${rules.TITLE}</p>` : ''}
      </section>
      ${practice.length ? `
        <details class="addon-practice">
          <summary>별 더 모으기 · ${practice.length}개 게임</summary>
          <ul>${practice.map(game => `
            <li><div><strong>${game.title}</strong><small>${game.floor} · ★ ${game.stars}/${game.maxStars}</small></div>
              <button class="btn" data-addon-practice="${game.id}" aria-label="${game.title} ${game.played ? '다시 도전' : '시작'}">${game.played ? '다시 도전' : '시작'}</button>
            </li>`).join('')}
          </ul>
        </details>` : ''}
      <div class="addon-closet">
        <div class="addon-avatar-preview">
          <div class="addon-fitting-stage">
            <canvas id="addon-avatar" width="48" height="52" aria-label="캐릭터 꾸미기 미리보기"></canvas>
            <span class="addon-fitting-floor"></span>
          </div>
          <div class="addon-preview-controls">
            <div class="addon-turns" aria-label="바라보는 방향">${[['down', '앞'], ['up', '뒤'], ['left', '왼쪽'], ['right', '오른쪽']].map(([direction, label]) => `
              <button type="button" data-addon-turn="${direction}" aria-pressed="${previewDir === direction}">${label}</button>`).join('')}
            </div>
            <button class="btn addon-walk-toggle" id="addon-preview-walk" aria-pressed="${previewWalking}">${previewWalking ? '멈춰 보기' : '걸어 보기'}</button>
            <p id="addon-preview-label" class="addon-preview-label" role="status"></p>
            <p class="addon-equipped-names" id="addon-equipped-names"></p>
            <div class="addon-clear-slots">
              <button type="button" data-addon-clear="head">머리 비우기</button>
              <button type="button" data-addon-clear="back">등 비우기</button>
            </div>
            <button class="btn btn-primary" id="addon-apply-outfit" aria-describedby="addon-apply-help">이 코디로 입기</button>
            <p id="addon-apply-help" class="addon-apply-help"></p>
            <button class="btn" id="addon-show-equipped">현재 착용으로 되돌리기</button>
          </div>
        </div>
        <div class="addon-collection">
          <div class="addon-filters" aria-label="아이템 종류">${[['all', '전체'], ['new', '새 컬렉션'], ['head', '머리'], ['back', '등 소품']].map(([value, label]) => `
            <button type="button" data-addon-filter="${value}" aria-pressed="${closetFilter === value}">${label}</button>`).join('')}
          </div>
          <div class="addon-closet-list">${visible.map(outfitTile).join('')}</div>
        </div>
      </div>
      <div class="addon-actions">
        <button class="btn" id="addon-games">도장판 열기</button>
        <button class="btn" id="addon-back-map">투어로 돌아가기</button>
      </div>`, '나만의 픽셀 코디');
    const outfit=()=>previewEquip||state.equip;
    const renderAvatar=()=>{if(spriteReady)drawAvatar($('#addon-avatar').getContext('2d'),previewDir,previewWalking?[0,1,2,1][previewTick%4]:1,outfit());};
    const paintPreview=()=>{
      renderAvatar();const selected=outfit(),changed=['head','back'].some(slot=>selected[slot]!==state.equip[slot]);
      const locked=rewards.filter(r=>Object.values(selected).includes(r.id)&&!has(r));
      $('#addon-preview-label').textContent = changed ? '미리보는 중' : '현재 착용';
      $('#addon-preview-label').classList.toggle('is-preview',changed);
      $('#addon-equipped-names').textContent=['head','back'].map(slot=>rewards.find(r=>r.id===selected[slot])?.name||({head:'머리 장식 없음',back:'등 소품 없음'})[slot]).join(' + ');
      $('#addon-apply-outfit').hidden = !changed || locked.length > 0;
      $('#addon-show-equipped').hidden = !changed;
      $('#addon-apply-help').textContent = locked.length ? `착용하려면 ★ ${Math.max(...locked.map(r => r.at))}` : '';
      $$('[data-addon-clear]').forEach(button => button.hidden = !selected[button.dataset.addonClear]);
      $$('[data-addon-card]').forEach(card=>card.classList.toggle('is-selected',Object.values(selected).includes(card.dataset.addonCard)));
      $$('[data-addon-equip]').forEach(button => {
        const item = rewards.find(item => item.id === button.dataset.addonEquip);
        const chosen = selected[item.slot] === item.id;
        const label = chosen ? '빼기' : '입어보기';
        const lockedLabel = has(item) ? '' : `, 잠김, 필요 별 ${item.at}개`;
        button.setAttribute('aria-label', item.name + lockedLabel + ', ' + label);
        button.setAttribute('aria-pressed', String(chosen));
      });
    };
    const paintCards=()=>{if(spriteReady)$$('[data-addon-costume]').forEach(c=>{const r=rewards.find(r=>r.id===c.dataset.addonCostume);drawAvatar(c.getContext('2d'),r.slot==='back'?'up':'down',1,{[r.slot]:r.id});});};
    renderCloset=()=>{paintCards();paintPreview();};
    $$('[data-addon-turn]').forEach(b=>b.onclick=()=>{previewDir=b.dataset.addonTurn;$$('[data-addon-turn]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));paintPreview();});
    $$('[data-addon-filter]').forEach(b=>b.onclick=()=>{closetFilter=b.dataset.addonFilter;wardrobe(true);$(`[data-addon-filter="${closetFilter}"]`).focus({preventScroll:true});});
    $$('[data-addon-equip]').forEach(b=>b.onclick=()=>{const r=rewards.find(r=>r.id===b.dataset.addonEquip);previewEquip={...outfit(),[r.slot]:outfit()[r.slot]===r.id?null:r.id};paintPreview();});
    $$('[data-addon-clear]').forEach(b=>b.onclick=()=>{previewEquip={...outfit(),[b.dataset.addonClear]:null};paintPreview();});
    $('#addon-preview-walk').onclick=()=>{previewWalking=!previewWalking;$('#addon-preview-walk').setAttribute('aria-pressed',String(previewWalking));$('#addon-preview-walk').textContent=previewWalking?'■ 멈춰 보기':'▶ 걸어 보기';previewTick=0;paintPreview();};
    $('#addon-show-equipped').onclick=()=>{previewEquip={...state.equip};paintPreview();};
    $('#addon-apply-outfit').onclick=()=>{
      sync(false);const next={...outfit()};
      if(['head','back'].some(slot=>next[slot]&&!rewards.some(r=>r.id===next[slot]&&r.slot===slot&&has(r)))){paintPreview();toast('아직 열리지 않은 아이템이 있어요.');return;}
      const before=state.equip;state.equip=next;
      if(!save()){state.equip=before;paintPreview();return;}
      paintPlayer();close();toast(next.head||next.back?'새 코디를 입었어요! 학교를 둘러볼까요?':'소품을 벗고 기본 모습으로 돌아왔어요.');
    };
    $$('[data-addon-practice]').forEach(b=>b.onclick=()=>{const id=b.dataset.addonPractice;dialog.addEventListener('close',()=>window.tourGame.practice(id,$('#wardrobe-open')),{once:true});close();});
    $('#addon-back-map').onclick=close;
    $('#addon-games').onclick=()=>{dialog.addEventListener('close',()=>window.tourGame.openBoard(),{once:true});close();};
    renderCloset();previewTimer=setInterval(()=>{if(view==='wardrobe'&&dialog.open&&previewWalking){previewTick++;renderAvatar();}},170);
  }
  function showNewRewards({ items: unlocked, title }) {
    const game = $('#game');
    if ((!unlocked.length && !title) || game.querySelector('.addon-unlock-result')) return;
    const panel = document.createElement('section');
    panel.className = 'addon-unlock-result';
    panel.setAttribute('aria-label', '새 꾸미기 보상');
    panel.innerHTML = `
      <div class="addon-reward-copy">
        ${unlocked.length ? `<strong>새 옷 ${unlocked.length}개 열림</strong>` : ''}
        ${title ? `<span title="${rules.TITLE}">칭호 · ${rules.TITLE}</span>` : ''}
      </div>
      <div class="addon-reward-thumbs" aria-hidden="true">${unlocked.slice(0, 3).map(item => `
        <canvas width="48" height="52" data-addon-reward="${item.id}"></canvas>`).join('')}
        ${unlocked.length > 3 ? `<span>+${unlocked.length - 3}</span>` : ''}
      </div>
      <button class="btn" id="addon-reward-try">입어보기</button>`;
    const actions = game.querySelector('.game-result-actions');
    if (actions) actions.after(panel);
    else $('#game-body').append(panel);
    if (spriteReady) panel.querySelectorAll('[data-addon-reward]').forEach(canvas => {
      const item = rewards.find(item => item.id === canvas.dataset.addonReward);
      drawAvatar(canvas.getContext('2d'), item.slot === 'back' ? 'up' : 'down', 1, { [item.slot]: item.id });
    });
    panel.querySelector('#addon-reward-try').onclick = () => {
      const preset = { ...state.equip };
      for (const item of unlocked) preset[item.slot] = item.id;
      game.addEventListener('close', () => {
        closetFilter = 'all';
        wardrobe(false, preset);
        opener = $('#wardrobe-open');
      }, { once: true });
      game.close();
    };
  }
  $('#festival-open').onclick=quest;$('#wardrobe-open').onclick=()=>wardrobe();
  document.addEventListener('tour:game-result',()=>{const game=$('#game');const unlocked=sync();showNewRewards(unlocked);if(state.started&&$('#game-title').textContent===window.TOUR_GAMES.bakery.title&&!game.querySelector('.addon-game-note')){const note=document.createElement('p');note.className='addon-game-note';window.TourUI.label(note,'mission','탐험 미션: 갓 구운 빵을 가방에 챙겼어요.');$('#game-body').append(note);}});
  $('#game').addEventListener('close',()=>sync());
  function resetWardrobe(){state.wardrobe=rules.emptyWardrobe();state.equip={head:null,back:null};previewEquip={...state.equip};save();sync(false);if(view==='wardrobe')wardrobe();}
  document.addEventListener('tour:stamps-reset',resetWardrobe);
  window.addEventListener('storage',e=>{
    if(e.key==='gch-tour-stamps'&&e.newValue===null){resetWardrobe();return;}
    if(e.key===KEY){state=loadState();}
    if(e.key===KEY||e.key==='gch-tour-stamps'){sync(false);if(view==='wardrobe')wardrobe(true);}
  });
  // Persist the migration even if the player never opens the wardrobe.
  save();
  sprite.onload=()=>{spriteReady=true;sync(false);paint();renderCloset?.();};sprite.src='img/walker.png';
})();
