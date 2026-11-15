/* Original, integer-grid costume artwork. The school's base sprite is unchanged.
   Hats replace the covered crown pixels; hair below the brim remains visible.
   48x52 output adds room for ears/wings without changing the walker hitbox. */
(() => {
  const items = [
    {id:'ribbon',name:'봄날 리본 핀',at:1,slot:'head',theme:'봄 소풍'},
    {id:'breadbag',name:'바게트 소풍백',at:1,slot:'back',theme:'방과 후 피크닉'},
    {id:'flower',name:'데이지 머리핀',at:2,slot:'head',theme:'봄 소풍'},
    {id:'bowback',name:'사르르 리본',at:2,slot:'back',theme:'봄 소풍'},
    {id:'bunny',name:'포근 토끼 모자',at:3,slot:'head',theme:'동물 친구'},
    {id:'bag',name:'민트 미니백',at:3,slot:'back',theme:'방과 후 피크닉'},
    {id:'cat',name:'밤고양이 모자',at:4,slot:'head',theme:'동물 친구'},
    {id:'starbag',name:'반짝 별 가방',at:4,slot:'back',theme:'별빛 산책'},
    {id:'beret',name:'별빛 베레모',at:5,slot:'head',theme:'별빛 산책'},
    {id:'wings',name:'구름 깃털 날개',at:5,slot:'back',theme:'하늘과 바다'},
    {id:'sailor',name:'바다 산책 모자',at:6,slot:'head',theme:'하늘과 바다'},
    {id:'balloon',name:'둥실 별 풍선',at:6,slot:'back',theme:'별빛 산책'},
    {id:'crown',name:'작은 별 왕관',at:7,slot:'head',theme:'축제의 주인공'},
    {id:'cape',name:'축제 리본 망토',at:7,slot:'back',theme:'축제의 주인공'},
    {id:'witch',name:'라일락 마법 모자',at:8,slot:'head',theme:'달빛 마법'},
    {id:'moon',name:'초승달 산책',at:8,slot:'back',theme:'달빛 마법'},
  ];
  const P={ink:'#343c54',cream:'#fff4dc',white:'#fffdf1',rose:'#e78b9b',pink:'#ffc2c7',roseD:'#aa5c7e',
    gold:'#edbd5c',goldD:'#ac794b',yellow:'#ffe9a3',mint:'#8acdbb',mintD:'#508d88',
    blue:'#8cb9cf',blueD:'#4e7f9c',navy:'#53627f',purple:'#b49bd4',purpleD:'#776598',pale:'#dfcff0'};
  function pen(c){return (x,y,w,h,k)=>{c.fillStyle=P[k]||k;c.fillRect(x,y,w,h)}}
  function star(r,x,y,k='gold',light='yellow'){
    r(x+3,y,2,2,k);r(x+2,y+2,4,1,k);r(x,y+3,8,2,k);r(x+1,y+5,6,1,k);r(x+1,y+6,2,2,k);r(x+5,y+6,2,2,k);r(x+3,y+2,2,3,light);
  }
  function bow(r,x,y,large=false){
    if(large){r(x,y+1,6,8,'roseD');r(x+10,y+1,6,8,'roseD');r(x+1,y+2,5,5,'pink');r(x+10,y+2,5,5,'pink');r(x+3,y+8,4,6,'rose');r(x+9,y+8,4,6,'rose');r(x+5,y+3,6,5,'roseD');r(x+6,y+4,4,3,'rose');r(x+1,y+2,2,2,'white');r(x+11,y+2,2,2,'white');}
    else{r(x,y,4,5,'roseD');r(x+7,y,4,5,'roseD');r(x+1,y+1,3,3,'pink');r(x+7,y+1,3,3,'pink');r(x+4,y+1,3,4,'roseD');r(x+5,y+2,1,2,'yellow');r(x+2,y+5,2,3,'rose');r(x+7,y+5,2,3,'rose');}
  }
  // Full-width crown removal prevents old hair escaping a narrower hat. These
  // cut lines are the first row below each brim, in the original 32x40 sprite.
  // Keep them fixed across walking frames: the original crown never bobs.
  const crownCut={
    beret:{down:12,up:12,left:12,right:12},
    bunny:{down:12,up:13,left:12,right:12},
    cat:{down:12,up:13,left:12,right:12},
    sailor:{down:12,up:12,left:12,right:12},
    witch:{down:12,up:12,left:12,right:12},
  };
  const covered=new Set(Object.keys(crownCut));
  function tinyStar(r,x,y){r(x+2,y,1,5,'goldD');r(x,y+2,5,1,'goldD');r(x+1,y+1,3,3,'gold');r(x+2,y+1,1,2,'yellow');}
  function pixelLine(r,x0,y0,x1,y1,color){
    const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;
    let error=dx+dy;
    for(;;){r(x0,y0,1,1,color);if(x0===x1&&y0===y1)break;const twice=2*error;if(twice>=dy){error+=dy;x0+=sx;}if(twice<=dx){error+=dx;y0+=sy;}}
  }
  function head(c,id,dir){
    const r=pen(c),side=dir==='left'||dir==='right',right=dir==='right',rear=dir==='up';
    // Use a true side silhouette, rather than keeping the front decoration on the back.
    if(id==='ribbon'){const x=side?(right?16:5):(rear?5:17);bow(r,x,6);}
    if(id==='flower'){
      const x=side?(right?21:4):(rear?6:20),y=8;
      r(x+2,y-2,3,3,'goldD');r(x-1,y+1,9,3,'goldD');r(x+2,y+4,3,3,'goldD');
      r(x+2,y-1,3,2,'white');r(x,y+1,2,3,'white');r(x+5,y+1,2,3,'white');r(x+2,y+4,3,2,'white');r(x+2,y+1,3,3,'gold');r(x+2,y+2,1,1,'yellow');
      r(x+5,y+6,3,1,'mintD');r(x+6,y+5,2,1,'mint');
    }
    if(id==='beret'){
      const x=side?8:5,w=side?18:22;
      r(16,3,2,1,'ink');r(x+5,4,w-10,1,'ink');r(x+2,5,w-4,1,'ink');
      r(x+1,6,w-2,1,'ink');r(x,7,w,3,'ink');r(x+2,6,w-4,3,'blueD');
      r(x+4,6,w-8,2,'blue');r(x+5,6,4,1,'cream');r(x+1,9,w-2,2,'blueD');
      r(x+1,11,w-2,1,'ink');r(x+2,10,w-4,1,'navy');
      if(!rear)tinyStar(r,side?(right?20:8):21,7);
      else r(x+5,8,3,1,'blue');
    }
    if(id==='bunny'||id==='cat'){
      const cat=id==='cat',outline=cat?'ink':'goldD',fill=cat?'navy':'cream',shine=cat?'blue':'white';
      const x=side?8:6,w=side?18:20;
      const ears=side?[x+3,x+11]:[8,21];
      for(const ex of ears){
        if(cat){r(ex+1,1,1,1,outline);r(ex,2,3,5,outline);r(ex+1,3,1,3,'rose');}
        else{r(ex,-3,3,9,outline);r(ex+1,-2,1,7,'pink');r(ex,5,3,2,fill);}
      }
      r(x+4,5,w-8,1,outline);r(x+1,6,w-2,1,outline);r(x,7,w,5,outline);
      r(x+1,7,w-2,4,fill);r(x+4,6,w-8,1,shine);r(x+2,11,w-4,1,outline);
      r(x,10,2,4,outline);r(x+w-2,10,2,4,outline);r(x+1,11,1,2,fill);r(x+w-2,11,1,2,fill);
      if(!rear){const cx=side?(right?20:12):16;r(cx-3,8,1,1,cat?'yellow':'ink');if(!side)r(cx+2,8,1,1,cat?'yellow':'ink');r(cx,10,1,1,'roseD');}
      else{r(x+1,12,w-2,1,outline);r(15,8,2,1,shine);}
    }
    if(id==='sailor'){
      const x=side?8:6,w=side?18:20;
      r(x+4,4,w-8,1,'ink');r(x+1,5,w-2,1,'ink');r(x,6,w,6,'ink');
      r(x+1,6,w-2,3,'cream');r(x+4,5,w-8,1,'white');r(x+2,6,w-5,1,'white');
      r(x+1,9,w-2,2,'blueD');r(x+2,9,w-4,1,'blue');
      if(!rear){const sx=side?(right?22:11):16;r(sx,7,1,3,'goldD');r(sx-1,8,3,1,'gold');}
      if(rear||side){const bx=right?9:side?23:19;r(bx,11,1,4,'blueD');r(bx+2,12,1,3,'blue');}
    }
    if(id==='crown'){
      const x=side?9:7,w=side?15:18;
      r(x,0,2,8,'goldD');r(x+w-2,0,2,8,'goldD');r(x+Math.floor(w/2)-1,-3,3,11,'goldD');
      r(x+2,3,w-4,5,'goldD');r(x+1,5,w-2,4,'gold');r(x+2,7,w-4,1,'yellow');
      r(x,0,1,2,'yellow');r(x+w-2,0,1,2,'yellow');r(x+Math.floor(w/2),-3,1,4,'yellow');
      r(x+Math.floor(w/2),5,2,2,rear?'cream':'roseD');r(x+3,5,1,1,'white');r(x+w-4,5,1,1,'white');
    }
    if(id==='witch'){
      const tip=side?(right?16:18):17;
      r(tip,-3,5,1,'ink');r(tip-2,-2,5,2,'ink');r(13,0,6,2,'ink');r(12,2,8,3,'ink');r(10,5,12,4,'ink');
      r(tip,-2,3,1,'purple');r(15,0,3,2,'purple');r(14,2,4,3,'purple');r(12,5,8,3,'purple');r(19,5,2,3,'purpleD');
      r(11,8,10,1,'roseD');r(12,8,6,1,'pink');
      const x=side?6:4,w=side?21:24;r(x+2,9,w-4,1,'ink');r(x,10,w,1,'ink');r(x+2,11,w-4,1,'ink');r(x+3,10,w-6,1,'purpleD');
      if(!rear)tinyStar(r,side?(right?20:8):21,6);
    }
  }
  function back(c,id,dir,frame=1){
    const r=pen(c),rear=dir==='up',front=dir==='down',side=!rear&&!front,right=dir==='right',x=side?(right?5:21):10;
    if(id==='cape'){
      if(side){r(x,18,6,3,'roseD');r(x,21,5,5,'rose');r(x-1,26,7,3,'roseD');r(x,27,5,1,'gold');}
      else{r(10,18,12,3,'roseD');r(8,21,16,5,'roseD');r(6,26,20,4,'roseD');r(10,20,12,7,'rose');r(8,25,16,3,'rose');r(7,28,18,1,'gold');r(11,20,2,5,'pink');r(19,21,2,6,'roseD');if(rear){bow(r,11,17);r(15,25,2,2,'yellow');}}
    }
    if(id==='bag'){
      if(side){
        const bx=right?7:21;r(bx,19,4,11,'ink');r(bx+1,20,2,9,'mintD');r(bx+(right?2:1),21,1,6,'mint');
        r(right?11:20,20,1,7,'mintD');r(right?11:19,22,2,1,'cream');r(bx+1,25,2,1,'cream');
      }else{
        r(12,18,6,2,'ink');r(13,19,4,1,'mintD');r(11,20,10,9,'ink');r(12,21,8,7,'mint');
        r(13,24,6,3,'mintD');r(13,24,6,1,'cream');r(13,21,2,1,'white');r(18,27,2,3,'gold');
      }
    }
    if(id==='breadbag'){
      if(side){
        const bx=right?7:21;r(bx,16,3,9,'goldD');r(bx+1,17,1,7,'gold');r(bx+1,19,1,1,'cream');r(bx+1,22,1,1,'cream');
        r(bx-1,24,5,6,'roseD');r(bx,25,3,4,'cream');r(bx+1,25,1,4,'rose');r(right?11:20,21,1,8,'roseD');
      }else{
        r(11,15,4,11,'goldD');r(12,16,2,9,'gold');r(12,18,2,1,'cream');r(12,21,2,1,'cream');
        r(16,17,3,9,'goldD');r(17,18,1,7,'gold');r(17,20,1,1,'cream');
        r(10,23,11,7,'roseD');r(11,24,9,5,'cream');r(13,24,2,5,'rose');r(13,25,1,1,'pink');
      }
    }
    if(id==='starbag'){
      if(side){
        const bx=right?7:21;r(bx+1,19,2,2,'goldD');r(bx,21,4,2,'goldD');r(bx-1,23,6,2,'goldD');r(bx,25,4,4,'goldD');
        r(bx+1,21,1,7,'gold');r(bx+2,23,1,3,'yellow');r(right?11:20,20,1,8,'goldD');
      }else{
        const sx=10;r(sx+4,19,2,3,'goldD');r(sx+3,22,4,1,'goldD');r(sx,23,10,3,'goldD');r(sx+2,26,6,1,'goldD');r(sx+2,27,2,2,'goldD');r(sx+6,27,2,2,'goldD');
        r(sx+4,20,2,5,'yellow');r(sx+2,24,6,2,'gold');r(sx+3,26,1,2,'gold');r(sx+6,26,1,2,'gold');r(sx+3,24,1,1,'ink');r(sx+6,24,1,1,'ink');
      }
    }
    if(id==='bowback'){
      if(side){r(x,18,6,9,'roseD');r(x+1,19,4,6,'pink');r(x+1,25,3,6,'rose');r(x+2,27,3,2,'pink');}
      else{bow(r,7,18,true);r(7,28,4,3,'rose');r(21,28,4,3,'rose');}
    }
    if(id==='wings'){
      if(side){
        // Overlapping folded feathers, with a narrow profile at the shoulder.
        c.save();if(right){c.translate(32,0);c.scale(-1,1);}const q=pen(c);
        [[23,2],[22,3],[21,4],[20,6],[20,7],[21,6],[21,5],[22,4],[22,3],[23,2]].forEach(([xx,w],i)=>q(xx,18+i,w,1,'blueD'));
        q(23,19,1,2,'white');q(22,21,3,2,'cream');q(23,23,3,1,'white');q(22,24,2,2,'cream');q(23,26,1,1,'blue');
        q(20,21,1,4,'goldD');c.restore();
      }else{
        const wing=flip=>{c.save();if(flip){c.translate(32,0);c.scale(-1,1);}const q=pen(c);
          [[0,2],[0,3],[1,4],[1,6],[2,7],[3,7],[4,7],[5,6],[7,4]].forEach(([xx,w],i)=>q(xx,17+i,w,1,'blueD'));
          [[1,1],[1,2],[2,3],[2,5],[3,6],[4,6],[5,5],[7,3]].forEach(([xx,w],i)=>q(xx,18+i,w,1,i%3===0?'white':'cream'));
          q(4,22,2,1,'blue');q(7,24,2,1,'white');c.restore();};
        wing(false);wing(true);if(rear){r(14,23,4,2,'gold');r(15,22,2,3,'yellow');}
      }
    }
    if(id==='balloon'){
      const dy=frame===2?-1:0;
      if(side){
        c.save();if(right){c.translate(32,0);c.scale(-1,1);}const q=pen(c);
        // A five-pixel side face shows the inflated edge, not the full star.
        q(29,dy,1,2,'blueD');q(28,2+dy,3,2,'blueD');q(27,4+dy,5,2,'blueD');q(28,6+dy,3,2,'blueD');q(29,8+dy,1,1,'blueD');
        q(29,2+dy,1,6,'mint');q(28,4+dy,2,2,'cream');q(29,9+dy,2,1,'mintD');
        pixelLine(q,30,10+dy,29,16,'mintD');pixelLine(q,29,16,25,20,'mintD');pixelLine(q,25,20,20,24,'mintD');c.restore();
      }else{
        const bx=rear?-3:26;star(r,bx,dy,'blueD',rear?'mint':'cream');
        r(bx+3,2+dy,2,4,'mint');r(bx+2,3+dy,1,2,rear?'mintD':'white');r(bx+3,8+dy,2,1,'mintD');
        const knot=bx+4,mid=rear?4:28,anchor=rear?12:20;
        pixelLine(r,knot,9+dy,knot,15,'mintD');pixelLine(r,knot,15,mid,20,'mintD');pixelLine(r,mid,20,anchor,24,'mintD');
      }
    }
    if(id==='moon'){
      // Crescent and tiny satellites sit behind the body in every direction.
      const mx=right?-5:25;
      r(mx+3,8,5,2,'goldD');r(mx+1,10,4,2,'goldD');r(mx,12,3,12,'goldD');r(mx+1,24,4,3,'goldD');r(mx+4,27,5,2,'goldD');
      r(mx+3,10,3,2,'yellow');r(mx+1,12,3,10,'gold');r(mx+2,14,1,8,'yellow');r(mx+3,22,2,4,'gold');r(mx+5,25,3,2,'yellow');
      r(mx+5,10,2,2,'cream');r(mx+7,25,2,2,'cream');r(right?26:2,12,1,5,'purple');r(right?24:0,14,5,1,'purple');r(right?23:8,24,2,2,'gold');
    }
  }
  const base=document.createElement('canvas');base.width=32;base.height=40;
  const bc=base.getContext('2d');
  function draw(c,sprite,dir='down',frame=1,equip={}){
    c.clearRect(0,0,c.canvas.width,c.canvas.height);c.imageSmoothingEnabled=false;c.save();
    if(c.canvas.width===48)c.translate(8,12);
    const row={down:0,right:1,up:2,left:3}[dir]??0;
    bc.clearRect(0,0,32,40);bc.imageSmoothingEnabled=false;bc.drawImage(sprite,frame*32,row*40,32,40,0,0,32,40);
    // The top of the original head is stationary in all 12 frames. Never bob
    // a hat independently of it. Clear only the crown, above the visible face.
    const cut=crownCut[equip.head]?.[dir];
    if(cut)bc.clearRect(0,0,32,cut);
    const floating=equip.back==='moon'||equip.back==='balloon';
    if(dir==='down'||floating)back(c,equip.back,dir,frame);
    c.drawImage(base,0,0);
    if(dir!=='down'&&!floating){
      back(c,equip.back,dir,frame);
      // Backpacks and capes sit under the hair, including in side views.
      c.drawImage(base,0,0,32,20,0,0,32,20);
    }
    head(c,equip.head,dir);c.restore();
  }
  window.TourCostumes={items,draw,covered:[...covered],crownCut};
})();
