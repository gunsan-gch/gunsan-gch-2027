/* Optional mission and wardrobe. This module never awards or edits a game stamp. */
(() => {
  if (!window.tourAddonHost || !window.TourCostumes || !window.tourGame || !document.querySelector('#festival-dialog')) return;
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const KEY='gch-tour-addons-v1';
  const rewards=window.TourCostumes.items;
  const clean=()=>({started:false,ribbon:false,bread:false,poster:false,complete:false,equip:{head:null,back:null}});
  let state=clean();
  try{const s=JSON.parse(localStorage.getItem(KEY));if(s){state={...clean(),started:!!s.started,ribbon:!!s.ribbon,bread:!!s.bread,poster:!!s.poster,complete:!!s.complete,equip:Object.fromEntries(['head','back'].map(slot=>[slot,rewards.some(r=>r.slot===slot&&r.id===s.equip?.[slot])?s.equip[slot]:null]))};if(!(state.ribbon&&state.bread&&state.poster))state.complete=false;}}catch{}
  const gameIds=['bakery','typing','cafe','cashier','rain','ai','career','phishing'];
  const host=window.tourAddonHost;
  const sprite=new Image();
  let spriteReady=false;
  const count=()=>gameIds.filter(id=>window.tourGame?.stamps()[id]).length;
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{toast('이 브라우저에서는 추가 기능의 진행 기록을 저장할 수 없어요.');return false;}}
  let toastTimer;
  function toast(message){const el=$('#addon-toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,4200)}
  const colors={ink:'#233c50',pink:'#ed7988',darkpink:'#c2546b',cream:'#fff2c9',gold:'#f4ca63',green:'#70ac91',darkgreen:'#367966',blue:'#78b7cc'};
function rect(c,x,y,w,h,color){c.fillStyle=colors[color]||color;c.fillRect(x,y,w,h)}
function art(c,id){c.clearRect(0,0,32,32);const r=(...a)=>rect(c,...a);if(id==='ribbon'){r(4,9,9,13,'ink');r(19,9,9,13,'ink');r(6,11,7,9,'pink');r(19,11,7,9,'pink');r(12,13,8,7,'ink');r(14,14,4,5,'darkpink');r(7,11,3,3,'#ffb6bf');r(22,11,3,3,'#ffb6bf');r(9,22,5,4,'pink');r(18,22,5,4,'pink');}else if(id==='bread'){r(5,11,22,14,'ink');r(8,8,16,3,'ink');r(7,12,18,11,'#ce843e');r(9,10,14,10,'#edb866');r(11,12,3,3,'cream');r(18,12,3,3,'cream');r(7,24,18,3,'cream');}else if(id==='poster'){r(6,4,20,25,'ink');r(8,6,16,21,'cream');r(8,6,16,5,'pink');r(12,14,8,8,'gold');r(15,12,2,12,'gold');r(10,17,12,2,'gold');r(10,25,12,1,'green');}else if(id==='bag'){r(11,4,10,5,'ink');r(13,6,6,3,'cream');r(6,9,20,19,'ink');r(8,11,16,15,'green');r(10,18,12,7,'darkgreen');r(14,13,4,3,'cream');r(11,20,10,1,'cream');}else if(id==='beret'){r(8,7,18,11,'ink');r(4,11,24,9,'ink');r(6,12,20,6,'blue');r(10,9,14,5,'blue');r(19,8,3,9,'gold');r(16,11,9,3,'gold');r(7,20,19,3,'ink');}else if(id==='cape'){r(11,4,10,6,'gold');r(9,10,14,3,'ink');r(7,13,18,7,'ink');r(5,20,22,8,'ink');r(11,12,10,14,'pink');r(8,19,16,7,'pink');r(7,26,18,2,'gold');r(15,14,2,8,'cream');r(12,17,8,2,'cream');}else{r(9,3,14,3,'gold');r(5,6,22,5,'gold');r(3,11,26,11,'gold');r(5,22,22,4,'gold');r(9,26,14,3,'gold');r(14,8,4,15,'ink');r(9,13,14,4,'ink');r(11,19,10,2,'ink');}}
function drawAvatar(c,dir='down',frame=1,equip=state.equip,who='player'){
  const outfit={...equip};if(who==='yuna')outfit.head='ribbon';if(who==='seoa')outfit.head='beret';
  window.TourCostumes.draw(c,sprite,dir,frame,outfit);
}

  function paint(root=document){root.querySelectorAll('[data-addon-art]').forEach(c=>art(c.getContext('2d'),c.dataset.addonArt));if(spriteReady)root.querySelectorAll('[data-addon-npc]').forEach(c=>drawAvatar(c.getContext('2d'),'down',1,{},c.dataset.addonNpc));}
  const icon=id=>`<canvas width="32" height="32" data-addon-art="${id}" aria-hidden="true"></canvas>`;
  const portrait=id=>`<canvas width="32" height="40" data-addon-npc="${id}" aria-hidden="true"></canvas>`;
  const dialog=$('#festival-dialog'),body=$('#festival-body');
  let view='',opener=null,questTicket=0,previewEquip=null,previewDir='down',closetFilter='all',previewWalking=false,previewTick=0,previewTimer=null,renderCloset=null,lastCount=count(),lastPose=host.position();
  function stopPreview(){clearInterval(previewTimer);previewTimer=null;renderCloset=null;}
  function close(){stopPreview();dialog.close();view='';previewEquip=null;opener?.focus?.({preventScroll:true});}
  function show(type,title,html,eyebrow='탐험 미션'){stopPreview();host.stop();dialog.classList.toggle('is-wardrobe',type==='wardrobe');view=type;$('#festival-title').textContent=title;$('#festival-eyebrow').textContent=eyebrow;body.innerHTML=html;paint(body);if(!dialog.open){opener=document.activeElement;dialog.showModal();}$('#festival-close').focus({preventScroll:true});}
  $('#festival-close').onclick=close;
  dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()});
  const locations={yuna:{floor:'outdoor',p:[59,51],approach:[56,50],name:'아름 선배',npc:'yuna'},ribbon:{floor:'1',p:[44.3,22],name:'축제 리본'},poster:{floor:'3',p:[54,25],approach:[51,25],name:'서아 선배',npc:'seoa'}};
  async function visit(id){close();const p=locations[id];const ticket=++questTicket;const reached=await host.go(p.floor,p.approach||p.p,p.name);if(reached&&ticket===questTicket)talk(id);}
  function points(){const stage=$('#scene-stage');stage.querySelectorAll('.addon-point').forEach(n=>n.remove());for(const[id,p]of Object.entries(locations)){if(p.floor!==host.scene())continue;if(id!=='yuna'&&(!state.started||state[id]))continue;const b=document.createElement('button');b.type='button';b.className='addon-point'+(p.npc?'':' is-item');b.style.left=p.p[0]+'%';b.style.top=p.p[1]+'%';b.dataset.addonPoint=id;b.setAttribute('aria-label',p.name+' 만나러 가기');b.innerHTML=(p.npc?portrait(p.npc):icon(id))+`<span class="addon-npc-name">${p.name}</span>${state.complete&&id==='yuna'?'':'<span class="addon-alert">!</span>'}`;b.onclick=()=>visit(id);stage.append(b)}paint(stage);}
  const costume=document.createElement('canvas');costume.width=48;costume.height=52;costume.className='addon-outfit-layer';costume.setAttribute('aria-hidden','true');$('#scene-walker').append(costume);
  function paintPlayer(p=lastPose){lastPose=p;const wearing=!!(state.equip.head||state.equip.back);$('#scene-walker').classList.toggle('has-addon-outfit',wearing);costume.hidden=!wearing;if(wearing&&spriteReady)drawAvatar(costume.getContext('2d'),p.facing,p.frame);}
  document.addEventListener('tour:avatar',e=>paintPlayer(e.detail));
  document.addEventListener('tour:scene',()=>points());
  function sync(notify=true){let changed=false;const n=count();for(const r of rewards){if(n<r.at&&state.equip[r.slot]===r.id){state.equip[r.slot]=null;changed=true;}}
    if(state.started&&!state.bread&&window.tourGame.stamps().bakery){state.bread=true;changed=true;}
    if(changed)save();
    const unlocked=notify&&n>lastCount?rewards.filter(r=>r.at>lastCount&&r.at<=n):[];
    lastCount=n;$('#wardrobe-open').textContent='👕 내 옷장';$('#festival-open').textContent=state.complete?'✦ 미션 완료':state.started?`✦ 탐험 미션 ${['ribbon','bread','poster'].filter(k=>state[k]).length}/3`:'✦ 탐험 미션';paintPlayer();points();return unlocked;
  }
  function quest(){sync(false);if(state.complete){completeView();return;}
    if(!state.started){show('quest','녹원축제 준비 대작전',`<div class="addon-npc-talk">${portrait('yuna')}<div><h3>학교 한 바퀴, 축제 준비도 같이!</h3><p>잔디마당의 아름 선배가 준비팀을 찾고 있어요. 리본, 빵, 포스터를 챙기며 학교를 둘러볼까요?</p></div></div><div class="addon-inventory">${icon('ribbon')+icon('bread')+icon('poster')}</div><p class="addon-rule">빵은 기존 <b>「n.00초 빵 굽기」</b>를 끝내면 준비돼요. 준비물 수집과 미션 완료는 도장 개수를 늘리지 않아요.</p><div class="addon-actions"><button class="btn btn-primary" id="addon-meet">아름 선배 만나기</button></div>`);$('#addon-meet').onclick=()=>visit('yuna');return;}
    const ready=state.ribbon&&state.bread&&state.poster;
    show('quest','녹원축제 준비 대작전',`<p class="addon-lead">${ready?'준비물을 모두 챙겼어요. 잔디마당의 아름 선배에게 돌아가요!':'준비물을 찾고, 평소처럼 기존 게임도 즐겨 보세요.'}</p><ul class="addon-tasks">${[{id:'ribbon',name:'축제 리본',where:'1층 · 정보처리실 앞'},{id:'bread',name:'갓 구운 빵',where:'1층 · 조리제빵실의 기존 게임 완료'},{id:'poster',name:'초대 포스터',where:'3층 · 드림스페이스 앞 서아 선배'}].map(x=>`<li class="${state[x.id]?'is-got':''}">${icon(x.id)}<div class="addon-task-copy"><strong>${x.name}</strong><small>${state[x.id]?'✓ 가방에 챙겼어요':x.where}</small></div><button class="btn" data-addon-task="${x.id}" ${state[x.id]?'disabled':''}>${state[x.id]?'준비됨':x.id==='bread'?'게임으로':'찾아가기'}</button></li>`).join('')}</ul><p class="addon-small">도장은 기존 8개 게임에서 그대로 모아요. 이 미션에서는 준비물만 챙겨요.</p><div class="addon-actions"><button class="btn" id="addon-quest-reset">미션 다시하기</button>${ready?'<button class="btn btn-primary" id="addon-deliver-go">선배에게 전달하러 가기</button>':''}</div>`);
    $$('[data-addon-task]').forEach(b=>b.onclick=()=>{if(b.dataset.addonTask==='bread'){close();host.room('조리제빵실',$('#festival-open'));}else visit(b.dataset.addonTask)});
    $('#addon-quest-reset').onclick=resetQuest;if(ready)$('#addon-deliver-go').onclick=()=>visit('yuna');
  }
  function talk(id){if(id==='yuna'){
    if(state.complete){completeView();return;}
    if(!state.started){show('talk','우리 축제, 같이 준비할래?',`<div class="addon-npc-talk">${portrait('yuna')}<div><p>리본, 갓 구운 빵, 초대 포스터가 필요해. 학교를 돌아보면서 세 가지를 챙겨 와 줄래?</p><p>리본은 1층 정보처리실 앞에, 포스터는 3층 서아 선배에게 있어. 빵은 조리제빵실의 빵 굽기 게임을 끝내면 준비할 수 있어!</p></div></div><div class="addon-actions"><button class="btn btn-primary" id="addon-start">좋아, 같이 준비하자!</button></div>`,'축제 준비부 · 아름 선배');$('#addon-start').onclick=()=>{state.started=true;save();sync(false);quest();};return;}
    if(state.ribbon&&state.bread&&state.poster){show('talk','와, 준비물을 전부 챙겨 왔네!',`<div class="addon-npc-talk">${portrait('yuna')}<div><p>리본도, 빵도, 포스터도 준비됐어. 네 덕분에 축제 준비를 마칠 수 있겠어!</p><p>우리 준비팀으로 함께해 줘서 고마워.</p></div></div><div class="addon-inventory">${icon('ribbon')+icon('bread')+icon('poster')}</div><div class="addon-actions"><button class="btn btn-primary" id="addon-finish">준비물 전달하기</button></div>`,'축제 준비부 · 아름 선배');$('#addon-finish').onclick=()=>{state.complete=true;save();sync(false);completeView()};return;}
    quest();return;
  }
  if(!state.started){quest();return;}if(state[id]){toast('이미 챙긴 준비물이에요.');return;}
  if(id==='ribbon'){show('collect','축제 리본을 찾았어요!',`<div class="addon-inventory">${icon('ribbon')}</div><p>친구들이 만든 리본이에요. 축제 부스를 알록달록하게 꾸밀 수 있겠어요!</p><div class="addon-actions"><button class="btn btn-primary" id="addon-collect">리본을 가방에 넣기</button></div>`);$('#addon-collect').onclick=()=>collect('ribbon');}
  else{show('collect','초대 포스터가 완성됐어!',`<div class="addon-npc-talk">${portrait('seoa')}<div><p>누구나 편하게 놀러 올 수 있도록 만들었어. 오늘은 네가 우리 축제의 초대 손님이자 준비팀이야!</p><p>아름 선배에게 전해 줄래?</p></div></div><div class="addon-actions"><button class="btn btn-primary" id="addon-collect">초대 포스터 받기</button></div>`,'홍보 준비부 · 서아 선배');$('#addon-collect').onclick=()=>collect('poster');}}
  function collect(id){state[id]=true;save();sync(false);quest();toast('가방에 챙겼어요! 남은 준비물도 찾아보세요.');}
  function completeView(){show('complete','축제 준비 완료!',`<div class="addon-end">${icon('seal')}<h3>녹원축제 준비팀</h3><p>네가 함께해서 더 즐거운 축제!</p></div><p>준비물 3개를 모두 전달했어요. 이제 학교를 더 둘러보거나, 기존 체험 게임에서 도장을 모아 꾸미기 보상을 열어 보세요.</p><p class="addon-rule">현재 기존 게임 도장 <b>${count()} / 8</b>개. 미션 완료로 도장·별 점수는 바뀌지 않아요.</p><div class="addon-actions"><button class="btn" id="addon-quest-reset">미션 다시하기</button><button class="btn btn-primary" id="addon-open-closet">내 옷장</button></div>`);$('#addon-quest-reset').onclick=resetQuest;$('#addon-open-closet').onclick=()=>wardrobe();}
  function resetQuest(){show('reset','탐험 미션만 다시 할까요?',`<p>모은 준비물과 축제 준비 완료 표시를 지워요. 기존 게임의 도장·별 기록과 착용한 소품은 유지돼요.</p><div class="addon-actions"><button class="btn btn-primary" id="addon-reset-no">이어서 하기</button><button class="btn" id="addon-reset-yes">미션 다시 시작</button></div>`);$('#addon-reset-no').onclick=quest;$('#addon-reset-yes').onclick=()=>{const equip=state.equip;state=clean();state.equip=equip;save();sync(false);quest();};$('#addon-reset-no').focus();}
  function wardrobe(keepPreview=false,preset=null){
    sync(false);
    if(!keepPreview){previewEquip={...state.equip,...(preset||{})};previewWalking=false;}
    if(!previewEquip)previewEquip={...state.equip};
    const n=count(),visible=rewards.filter(r=>closetFilter==='all'||r.slot===closetFilter);
    show('wardrobe','내 옷장',`
      <div class="addon-closet-top"><p>새 도장마다 머리 장식 하나, 등 소품 하나가 열려요.</p><span><b>${rewards.filter(r=>n>=r.at).length}</b> / ${rewards.length}종 해금</span></div>
      <div class="addon-unlock-track" aria-label="현재 도장 ${n}개, 도장 1개마다 아이템 2종 해금"><strong>도장 ${n}/8</strong>${[1,2,3,4,5,6,7,8].map(k=>`<span class="${n>=k?'is-open':''}" aria-label="도장 ${k}개: 머리 장식 1종과 등 소품 1종 ${n>=k?'열림':'잠김'}">${n>=k?'✓ ':''}${k}</span>`).join('')}</div>
      <div class="addon-closet"><div class="addon-avatar-preview"><div class="addon-fitting-stage"><span class="addon-fitting-tag">FITTING ROOM</span><canvas id="addon-avatar" width="48" height="52" aria-label="캐릭터 꾸미기 미리보기"></canvas><span class="addon-fitting-floor"></span></div><div class="addon-preview-controls"><div class="addon-turns" aria-label="바라보는 방향">${[['down','앞'],['up','뒤'],['left','왼쪽'],['right','오른쪽']].map(([d,t])=>`<button data-addon-turn="${d}" aria-pressed="${previewDir===d}">${t}</button>`).join('')}</div><button class="btn addon-walk-toggle" id="addon-preview-walk" aria-pressed="${previewWalking}">${previewWalking?'■ 멈춰 보기':'▶ 걸어 보기'}</button><p id="addon-preview-label" class="addon-preview-label" role="status"></p><p class="addon-equipped-names" id="addon-equipped-names"></p><div class="addon-clear-slots"><button type="button" data-addon-clear="head">머리 비우기</button><button type="button" data-addon-clear="back">등 비우기</button></div><button class="btn btn-primary" id="addon-apply-outfit" aria-describedby="addon-apply-help">이 코디로 입기</button><p id="addon-apply-help" class="addon-apply-help"></p><button class="btn" id="addon-show-equipped">현재 착용으로 되돌리기</button></div></div>
      <div class="addon-collection"><div class="addon-filters" aria-label="아이템 종류">${[['all','전체',16],['head','머리',8],['back','등 소품',8]].map(([v,t,k])=>`<button data-addon-filter="${v}" aria-pressed="${closetFilter===v}">${t} <small>${k}</small></button>`).join('')}</div><div class="addon-closet-list">${visible.map(r=>`<article class="addon-outfit ${n>=r.at?'is-unlocked':''}" data-addon-card="${r.id}"><div class="addon-item-art"><canvas width="48" height="52" data-addon-costume="${r.id}" aria-hidden="true"></canvas><span>${state.equip[r.slot]===r.id?'착용 중':n>=r.at?'열림':'도장 '+r.at+'개'}</span></div><div class="addon-item-copy"><small>${r.theme}</small><strong>${r.name}</strong><button class="btn" data-addon-equip="${r.id}"></button></div></article>`).join('')}</div></div></div>
      <p class="addon-small addon-closet-rule">게임을 처음 완료해 새 도장을 얻으면 2종이 열려요. 재도전이나 별 점수 상승으로는 추가 개방되지 않아요. 잠긴 아이템도 미리 볼 수 있어요.</p><div class="addon-actions"><button class="btn" id="addon-games">도장판 열기</button><button class="btn" id="addon-back-map">둘러보기로 돌아가기</button></div>`,'나만의 픽셀 코디 · 16종');
    const outfit=()=>previewEquip||state.equip;
    const renderAvatar=()=>{if(spriteReady)drawAvatar($('#addon-avatar').getContext('2d'),previewDir,previewWalking?[0,1,2,1][previewTick%4]:1,outfit());};
    const paintPreview=()=>{
      renderAvatar();const selected=outfit(),changed=['head','back'].some(slot=>selected[slot]!==state.equip[slot]);
      const locked=rewards.filter(r=>Object.values(selected).includes(r.id)&&count()<r.at);
      $('#addon-preview-label').textContent=changed?'미리보는 중 · 아직 지도에 적용되지 않았어요.':'현재 지도에서 착용한 모습이에요.';
      $('#addon-preview-label').classList.toggle('is-preview',changed);
      $('#addon-equipped-names').textContent=['head','back'].map(slot=>rewards.find(r=>r.id===selected[slot])?.name||({head:'머리 장식 없음',back:'등 소품 없음'})[slot]).join(' + ');
      $('#addon-apply-outfit').disabled=!changed||locked.length>0;
      $('#addon-apply-help').textContent=locked.length?`도장 ${Math.max(...locked.map(r=>r.at))}개를 모으면 이 코디를 입을 수 있어요.`:changed?'버튼을 누르면 입고 지도로 돌아가요.':'아이템을 골라 새 코디를 만들어 보세요.';
      $$('[data-addon-clear]').forEach(b=>b.disabled=!selected[b.dataset.addonClear]);
      $$('[data-addon-card]').forEach(card=>card.classList.toggle('is-selected',Object.values(selected).includes(card.dataset.addonCard)));
      $$('[data-addon-equip]').forEach(b=>{const r=rewards.find(r=>r.id===b.dataset.addonEquip),chosen=selected[r.slot]===r.id;const label=chosen?'빼기':count()<r.at?'미리보기':'입어보기';b.textContent=label;b.setAttribute('aria-label',r.name+' '+label);b.setAttribute('aria-pressed',String(chosen));});
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
      if(['head','back'].some(slot=>next[slot]&&!rewards.some(r=>r.id===next[slot]&&r.slot===slot&&r.at<=count()))){paintPreview();toast('아직 열리지 않은 아이템이 있어요.');return;}
      const before=state.equip;state.equip=next;
      if(!save()){state.equip=before;paintPreview();return;}
      paintPlayer();close();toast(next.head||next.back?'새 코디를 입었어요! 학교를 둘러볼까요?':'소품을 벗고 기본 모습으로 돌아왔어요.');
    };
    $('#addon-back-map').onclick=close;
    $('#addon-games').onclick=()=>{dialog.addEventListener('close',()=>window.tourGame.openBoard(),{once:true});close();};
    renderCloset();previewTimer=setInterval(()=>{if(view==='wardrobe'&&dialog.open&&previewWalking){previewTick++;renderAvatar();}},170);
  }
  function showNewRewards(unlocked){
    const game=$('#game');if(!unlocked.length||game.querySelector('.addon-unlock-result'))return;
    const panel=document.createElement('section');panel.className='addon-unlock-result';panel.setAttribute('aria-label','새로 열린 꾸미기 아이템');
    panel.innerHTML=`<span class="eyebrow">도장 ${count()} / 8 · 새 꾸미기 보상</span><h3>새 아이템 ${unlocked.length}종이 열렸어요!</h3><div class="addon-unlock-pair">${unlocked.map(r=>`<figure><canvas width="48" height="52" data-addon-reward="${r.id}" aria-hidden="true"></canvas><figcaption><small>${r.slot==='head'?'머리 장식':'등 소품'}</small><strong>${r.name}</strong></figcaption></figure>`).join('')}</div><button class="btn btn-primary" id="addon-reward-try">바로 입어보기</button><p>옷장에서 조합해 보고, 마음에 들면 입어요.</p>`;
    const actions=game.querySelector('.game-result-actions');if(actions)actions.before(panel);else $('#game-body').append(panel);
    requestAnimationFrame(()=>{if(game.open&&game.classList.contains('is-result')&&panel.isConnected)panel.scrollIntoView({block:'nearest',behavior:'instant'});});
    if(spriteReady)panel.querySelectorAll('[data-addon-reward]').forEach(c=>{const r=rewards.find(r=>r.id===c.dataset.addonReward);drawAvatar(c.getContext('2d'),r.slot==='back'?'up':'down',1,{[r.slot]:r.id});});
    panel.querySelector('#addon-reward-try').onclick=()=>{
      const preset={...state.equip};for(const r of unlocked)preset[r.slot]=r.id;
      game.addEventListener('close',()=>{closetFilter='all';wardrobe(false,preset);opener=$('#wardrobe-open');},{once:true});
      game.close();
    };
  }
  $('#festival-open').onclick=quest;$('#wardrobe-open').onclick=()=>wardrobe();
  new MutationObserver(()=>{const game=$('#game');if(!game.classList.contains('is-result'))return;const unlocked=sync();showNewRewards(unlocked);if(state.started&&$('#game-title').textContent===window.TOUR_GAMES.bakery.title&&!game.querySelector('.addon-game-note')){const note=document.createElement('p');note.className='addon-game-note';note.textContent='✦ 탐험 미션: 갓 구운 빵을 가방에 챙겼어요.';$('#game-body').append(note);}}).observe($('#game'),{attributes:true,attributeFilter:['class']});
  $('#game').addEventListener('close',()=>sync());
  $('#stamps-reset-confirm').addEventListener('click',()=>{sync(false);if(view==='wardrobe')wardrobe();});
  window.addEventListener('storage',()=>{sync(false);if(view==='wardrobe')wardrobe(true);});
  sprite.onload=()=>{spriteReady=true;sync(false);paint();renderCloset?.();};sprite.src='img/walker.png';
})();
