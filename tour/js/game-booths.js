/* 학생회 예술제 부스 배치도 */
(() => {
  const pieces = {
    food: { name:'분식', mark:'분', shape:[[0,0],[1,0]] },
    craft: { name:'공예', mark:'공', shape:[[0,0],[0,1],[1,1]] },
    photo: { name:'사진', mark:'사', shape:[[0,0],[1,0],[2,0],[1,1]] }
  };
  const boards = [
    { name:'작은 안뜰', map:['....#','G...S','.....','#....'], pieces:['food','craft'] },
    { name:'동아리 마당', map:['..#..','....S','..#..','G....','...#.'], pieces:['craft','photo','food'] },
    { name:'녹원예술제 본무대', map:['...#..','.#...S','...#..','G.....','..#...'], pieces:['photo','craft','food','craft'] }
  ];
  function offsets(type,turn) {
    let cells = pieces[type].shape;
    for (let i=0;i<turn;i++) {
      const maxY = Math.max(...cells.map(p=>p[1]));
      cells = cells.map(([x,y])=>[maxY-y,x]);
    }
    // Anchor on the first occupied square, even when the bounding box corner is empty.
    cells = cells.slice().sort((a,b)=>a[1]-b[1] || a[0]-b[0]);
    const [ax,ay] = cells[0];
    return cells.map(([x,y])=>[x-ax,y-ay]);
  }
  function cellsFor(b,id,p) {
    return offsets(b.pieces[id],p.turn).map(([dx,dy])=>[p.x+dx,p.y+dy]);
  }
  function route(b,placed) {
    const grid = b.map.map(row=>row.split(''));
    placed.forEach((p,i)=>{ if(p) for(const [x,y] of cellsFor(b,i,p)) grid[y][x]='#'; });
    const y= b.map.findIndex(row=>row.includes('G')), x=b.map[y].indexOf('G');
    const start=y*grid[0].length+x, queue=[start], parent=new Map([[start,null]]), w=grid[0].length;
    for(let i=0;i<queue.length;i++) {
      const here=queue[i], hx=here%w, hy=Math.floor(here/w);
      if(grid[hy][hx]==='S') {
        const path=[];
        for(let k=here;k!==null;k=parent.get(k)) path.push(k);
        return path.reverse();
      }
      for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
        const nx=hx+dx, ny=hy+dy, cell=grid[ny]?.[nx], k=ny*w+nx;
        if(cell && cell!=='#' && !parent.has(k)) {parent.set(k,here); queue.push(k);}
      }
    }
    return [];
  }
  function inspect(b,placed,id,p) {
    const occupied = new Set();
    placed.forEach((other,i)=>{ if(i!==id && other) for(const c of cellsFor(b,i,other)) occupied.add(c.join()); });
    for(const [x,y] of cellsFor(b,id,p)) {
      if(!b.map[y]?.[x]) return '부스가 배치도 밖으로 나가요.';
      if(b.map[y][x]!=='.') return '화단과 입구, 무대는 비워 둬요.';
      if(occupied.has([x,y].join())) return '다른 부스와 자리가 겹쳐요.';
    }
    const next=placed.slice(); next[id]=p;
    return route(b,next).length ? '' : '입구에서 무대로 가는 길이 막혀요.';
  }
  if(typeof module!=='undefined' && module.exports) module.exports={boards,pieces,offsets,inspect,route,cellsFor};
  if(typeof window==='undefined') return;
  const img=(id)=>'<img src="img/games/booths/'+id+'.png" alt="" draggable="false">';
  function start(container,api) {
    const events=new AbortController();
    let level=0, cleared=0, selected=0, turn=0, anchor=null, history=[], placed=[], solved=false, ended=false, focusCell=0;
    const b=()=>boards[level], type=()=>b().pieces[selected];
    const name=i=>pieces[b().pieces[i]].name+(b().pieces.filter(v=>v===b().pieces[i]).length>1 ? ' '+(b().pieces.slice(0,i+1).filter(v=>v===b().pieces[i]).length) : '');
    container.innerHTML='<section class="bo-game"><header class="bo-guide"><img src="img/npcs/portraits/jeongwon.png" alt=""><div><strong>정원 선배</strong><p>입구 → 무대 길 남기기 · 대각선 불가</p></div></header><div class="bo-title"><h3 tabindex="-1"></h3><span></span></div><div class="bo-tray" aria-label="배치할 부스"></div><p class="bo-help"></p><div class="bo-grid" role="group" aria-label="녹원예술제 배치도"></div><p class="bo-key">입구 → 무대 · ▧ 화단</p><p class="bo-status" role="status"></p><div class="bo-actions" role="group" aria-label="부스 배치 도구"><button class="btn" data-act="rotate" aria-label="부스 회전">↻ 회전</button><button class="btn btn-primary" data-act="place">놓기</button><button class="btn" data-act="remove" aria-label="선택 부스 빼기">빼기</button><button class="btn" data-act="undo" aria-label="한 수 뒤로">되돌림</button><button class="btn" data-act="reset" aria-label="이 판 처음부터">초기화</button></div><div class="bo-end"><button class="btn btn-primary" data-act="next">다음 배치도</button><button class="btn btn-primary" data-act="finish"></button></div><small>배치도 한 장 완성 = 별 하나</small></section>';
    const $=s=>container.querySelector(s), act=a=>$('[data-act="'+a+'"]');
    function begin() { selected=0; turn=0; anchor=null; history=[]; placed=b().pieces.map(()=>null); solved=false; focusCell=0; draw('첫 부스를 놓을 기준점을 골라 줘.'); }
    function choose(i) { selected=i; turn=placed[i]?.turn || 0; anchor=placed[i] ? {...placed[i]} : null; draw(placed[i]?'이 부스를 옮길 칸을 고르거나 회전해 봐.':name(i)+' 부스를 놓을 기준점을 골라 줘.'); }
    function draw(message) {
      const board=b(), w=board.map[0].length, candidate=anchor && {...anchor,turn};
      const problem=candidate && inspect(board,placed,selected,candidate);
      const ghost=new Set(candidate && !solved ? cellsFor(board,selected,candidate).map(c=>c.join()) : []);
      const used=new Map();
      placed.forEach((p,i)=>{ if(p) cellsFor(board,i,p).forEach((c,k)=>used.set(c.join(),[i,k])); });
      const path=solved ? route(board,placed) : [];
      $('.bo-title h3').textContent=(level+1)+'. '+board.name;
      $('.bo-title span').textContent='배치 '+placed.filter(Boolean).length+' / '+placed.length;
      $('.bo-tray').innerHTML=board.pieces.map((id,i)=>{
        const coords=offsets(id,i===selected?turn:placed[i]?.turn || 0), min=Math.min(...coords.map(c=>c[0]));
        const shape=coords.map(([x,y],k)=>'<i class="'+(k?'':'bo-origin')+'" style="grid-column:'+(x-min+1)+';grid-row:'+(y+1)+'"></i>').join('');
        return '<button data-piece="'+i+'" class="bo-'+id+'" aria-pressed="'+(selected===i)+'" '+(solved?'disabled':'')+'>'+img(id)+'<span>'+name(i)+(placed[i]?' ✓':'')+'</span><span class="bo-mini" aria-hidden="true">'+shape+'</span></button>';
      }).join('');
      const grid=$('.bo-grid'); grid.style.setProperty('--cols',w);
      grid.innerHTML=board.map.map((row,y)=>Array.from(row,(v,x)=>{
        const key=[x,y].join(), k=y*w+x, occ=used.get(key), preview=ghost.has(key);
        const cls=['bo-cell',v==='#'?'bo-flower':'',occ?'bo-'+board.pieces[occ[0]]:'',preview?(problem?'bo-bad':'bo-ghost'):'',path.includes(k)?'bo-route':''].join(' ');
        const label=v==='#'?'화단':v==='G'?'입구':v==='S'?'무대':occ?name(occ[0])+' 부스':'빈칸';
        const content=v==='#'?'▧':v==='G'?img('gate')+'<small>입구</small>':v==='S'?img('stage')+'<small>무대</small>':occ?(occ[1]===0?img(board.pieces[occ[0]]):pieces[board.pieces[occ[0]]].mark):path.includes(k)?'●':'';
        return '<button class="'+cls+'" data-cell="'+k+'" tabindex="'+(focusCell===k?'0':'-1')+'" aria-label="'+(y+1)+'행 '+(x+1)+'열 '+label+(preview?' 미리보기':'')+'">'+content+(preview?'<b aria-hidden="true">'+(anchor.x===x && anchor.y===y?'•':'')+'</b>':'')+'</button>';
      }).join('')).join('');
      $('.bo-help').textContent=solved ? '초록 점을 따라 입구 → 무대' : '부스 선택 → 빈칸 선택 · 점 = 기준점';
      $('.bo-status').textContent=message || (problem || (candidate?name(selected)+' 배치 가능 · 놓기를 눌러 줘.':'기준점을 골라 줘.'));
      $('.bo-end').hidden=!cleared; $('.bo-actions').hidden=solved; act('place').disabled=!candidate || !!problem; act('remove').disabled=!placed[selected];
      act('undo').disabled=!history.length; act('reset').disabled=!history.length&&!anchor&&!turn;
      act('next').hidden=!solved || level===boards.length-1; act('finish').hidden=!cleared;
      act('finish').textContent='별 '+cleared+'개로 마치기';
    }
    function pickCell(k) {
      if(solved) return;
      const w=b().map[0].length; focusCell=k; anchor={x:k%w,y:Math.floor(k/w)}; draw();
      $('[data-cell="'+k+'"]').focus({preventScroll:true});
    }
    function rotate() {turn=(turn+1)%4; draw();}
    function action(a) {
      if(ended) return;
      if(a==='finish' && cleared) {ended=true; api.done({stars:cleared}); return;}
      if(a==='next' && solved && level<boards.length-1) {level++; begin(); $('.bo-title h3').focus(); return;}
      if(solved) return;
      if(a==='rotate') rotate();
      if(a==='reset') {begin(); return;}
      if(a==='undo' && history.length) {const last=history.pop(); placed=last.placed; choose(last.selected); $('[data-piece="'+selected+'"]').focus({preventScroll:true}); return;}
      if(a==='remove' && placed[selected]) {history.push({placed:placed.slice(),selected}); placed[selected]=null; choose(selected); return;}
      if(a==='place' && anchor) {
        const p={...anchor,turn}; if(inspect(b(),placed,selected,p)) return;
        history.push({placed:placed.slice(),selected}); placed[selected]=p;
        const next=placed.indexOf(null);
        if(next!==-1) {choose(next); $('[data-cell="'+focusCell+'"]').focus({preventScroll:true}); return;}
        solved=true; cleared=level+1; draw('배치 완료! 점선을 따라 입구에서 무대까지 걸어갈 수 있어.'); (level===2?act('finish'):act('next')).focus({preventScroll:true});
      }
    }
    container.addEventListener('click',e=>{
      const button=e.target.closest('button'); if(!button || ended) return;
      if(button.dataset.piece!==undefined && !solved) {choose(+button.dataset.piece); $('[data-piece="'+selected+'"]').focus({preventScroll:true});}
      if(button.dataset.cell!==undefined) pickCell(+button.dataset.cell);
      if(button.dataset.act) action(button.dataset.act);
    },{signal:events.signal});
    container.addEventListener('keydown',e=>{
      if(ended||solved||e.target.dataset.cell===undefined) return;
      const w=b().map[0].length,k=+e.target.dataset.cell, x=k%w,y=Math.floor(k/w);
      const delta={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];
      if(delta) {e.preventDefault(); pickCell(Math.min(b().map.length-1,Math.max(0,y+delta[1]))*w+Math.min(w-1,Math.max(0,x+delta[0])));}
      if(e.key.toLowerCase()==='r') {e.preventDefault(); rotate(); $('[data-cell="'+k+'"]').focus({preventScroll:true});}
    },{signal:events.signal});
    begin(); return ()=>{ended=true; events.abort();};
  }
  window.TOUR_GAMES.booths={title:'부스 자리 좀 잡아줘!',button:'녹원예술제 부스 배치하기',room:'학생회 회의실',naver:'Booths',maxStars:3,stamp:'학생회 회의실 도장 획득!',message:'정원 선배와 함께 모두가 걸어갈 수 있는 예술제 행사장을 설계했어요.',start};
})();
