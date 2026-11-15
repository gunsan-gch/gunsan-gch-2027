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
  const covered=new Set(['beret','bunny','cat','sailor','witch']);
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
      const x=side?6:3,w=side?21:26;
      r(16,0,3,2,'ink');r(10,2,14,1,'ink');r(x+3,3,w-5,1,'ink');r(x+1,4,w-2,2,'ink');r(x,6,w,4,'ink');
      r(x+2,5,w-4,4,'blueD');r(x+4,4,w-7,3,'blue');r(x+5,4,7,1,'cream');r(x+1,8,w-2,2,'blueD');
      r(side?7:5,10,side?18:22,2,'ink');r(side?8:6,10,side?16:20,1,'navy');
      if(!rear){const sx=right?18:side?7:20;star(r,sx,4,'goldD','yellow');r(sx+3,7,2,2,'gold');}
      else{r(8,7,2,2,'blue');r(12,5,6,1,'blue');}
    }
    if(id==='bunny'||id==='cat'){
      const cat=id==='cat',outline=cat?'ink':'goldD',fill=cat?'navy':'cream',shine=cat?'blue':'white';
      const x=side?6:4,w=side?21:24;
      if(cat){for(const ex of side?[8,20]:[5,22]){r(ex+2,-3,1,1,outline);r(ex+1,-2,3,2,outline);r(ex,0,5,6,outline);r(ex+1,0,3,4,fill);r(ex+2,1,1,3,'rose');}}
      else{for(const ex of side?[8,19]:[7,20]){r(ex+1,-8,3,1,outline);r(ex,-7,5,12,outline);r(ex+1,-7,3,11,fill);r(ex+2,-5,1,7,'pink');}}
      r(x+4,2,w-8,2,outline);r(x+1,4,w-2,2,outline);r(x,6,w,5,outline);
      r(x+2,5,w-4,5,fill);r(x+5,4,w-10,2,shine);r(x+1,9,3,7,outline);r(x+w-4,9,3,7,outline);
      r(x+2,10,2,5,fill);r(x+w-4,10,2,5,fill);r(x+3,10,w-6,1,outline);
      if(!rear){const cx=side?(right?19:11):16;r(cx-4,7,1,2,cat?'yellow':'ink');r(cx+3,7,1,2,cat?'yellow':'ink');r(cx-1,9,2,1,'roseD');}
      else{r(15,5,2,2,shine);r(16,7,2,1,shine);}
    }
    if(id==='sailor'){
      const x=side?6:4,w=side?21:24;r(x+5,1,w-10,2,'ink');r(x+2,3,w-4,2,'ink');r(x+1,5,w-2,4,'ink');
      r(x+3,4,w-6,4,'cream');r(x+6,3,w-12,2,'white');r(x,9,w,3,'ink');r(x+1,9,w-2,2,'blueD');r(x+2,9,w-4,1,'blue');
      if(!rear){const sx=side?(right?21:9):16;r(sx,5,1,5,'goldD');r(sx-2,7,5,1,'gold');r(sx-2,9,5,1,'gold');}
      if(rear||side){const bx=right?7:side?23:19;r(bx,11,2,5,'blueD');r(bx+2,12,2,5,'blue');}
    }
    if(id==='crown'){
      const x=side?9:7,w=side?15:18;
      r(x,0,2,8,'goldD');r(x+w-2,0,2,8,'goldD');r(x+Math.floor(w/2)-1,-3,3,11,'goldD');
      r(x+2,3,w-4,5,'goldD');r(x+1,5,w-2,4,'gold');r(x+2,7,w-4,1,'yellow');
      r(x,0,1,2,'yellow');r(x+w-2,0,1,2,'yellow');r(x+Math.floor(w/2),-3,1,4,'yellow');
      r(x+Math.floor(w/2),5,2,2,rear?'cream':'roseD');r(x+3,5,1,1,'white');r(x+w-4,5,1,1,'white');
    }
    if(id==='witch'){
      r(17,-8,7,2,'ink');r(14,-6,7,3,'ink');r(12,-3,8,3,'ink');r(10,0,12,4,'ink');r(8,4,16,4,'ink');
      r(17,-7,5,1,'purple');r(15,-5,4,4,'purple');r(13,-2,5,5,'purple');r(11,2,9,5,'purple');r(19,2,2,5,'purpleD');
      r(9,6,14,2,'roseD');r(10,6,12,1,'pink');
      const x=side?4:1,w=side?25:30;r(x+3,8,w-6,1,'ink');r(x,9,w,2,'ink');r(x+2,9,w-4,1,'purpleD');r(x+4,11,w-8,1,'ink');
      if(!rear){const sx=right?18:side?6:19;star(r,sx,3,'goldD','yellow');}
    }
  }
  function back(c,id,dir,frame=1){
    const r=pen(c),rear=dir==='up',front=dir==='down',side=!rear&&!front,right=dir==='right',x=side?(right?5:21):10;
    if(id==='cape'){
      if(side){r(x,18,6,3,'roseD');r(x,21,5,5,'rose');r(x-1,26,7,3,'roseD');r(x,27,5,1,'gold');}
      else{r(10,18,12,3,'roseD');r(8,21,16,5,'roseD');r(6,26,20,4,'roseD');r(10,20,12,7,'rose');r(8,25,16,3,'rose');r(7,28,18,1,'gold');r(11,20,2,5,'pink');r(19,21,2,6,'roseD');if(rear){bow(r,11,17);r(15,25,2,2,'yellow');}}
    }
    if(id==='bag'){
      r(x+2,17,6,3,'ink');r(x+3,18,4,2,'mintD');r(x,20,side?6:12,9,'ink');r(x+1,21,side?4:10,7,'mint');
      r(x+2,24,side?3:8,3,'mintD');r(x+2,24,side?2:8,1,'cream');r(x+2,21,3,2,'white');
      if(!side){r(x+8,26,3,4,'gold');r(x+9,27,1,1,'yellow');}
    }
    if(id==='breadbag'){
      const bx=side?x:11;r(bx+1,13,4,12,'goldD');r(bx+2,14,2,10,'gold');r(bx+2,16,2,1,'cream');r(bx+2,19,2,1,'cream');
      r(bx+5,15,4,10,'goldD');r(bx+6,16,2,8,'gold');r(bx+6,18,2,1,'cream');r(bx+6,21,2,1,'cream');
      r(bx-1,22,side?9:12,8,'roseD');r(bx,23,side?7:10,6,'cream');r(bx+2,23,3,6,'rose');r(bx+3,24,1,2,'pink');
    }
    if(id==='starbag'){
      const sx=side?x-1:9;r(sx+4,17,4,3,'goldD');r(sx+3,20,6,2,'goldD');r(sx,22,12,3,'goldD');r(sx+2,25,8,2,'goldD');r(sx+2,27,3,3,'goldD');r(sx+7,27,3,3,'goldD');
      r(sx+5,18,2,7,'yellow');r(sx+3,22,6,4,'gold');r(sx+1,23,10,1,'gold');r(sx+3,26,2,2,'gold');r(sx+7,26,2,2,'gold');r(sx+4,22,1,2,'ink');r(sx+8,22,1,2,'ink');r(sx+5,25,3,1,'goldD');
    }
    if(id==='bowback'){
      if(side){r(x,18,6,9,'roseD');r(x+1,19,4,6,'pink');r(x+1,25,3,6,'rose');r(x+2,27,3,2,'pink');}
      else{bow(r,7,18,true);r(7,28,4,3,'rose');r(21,28,4,3,'rose');}
    }
    if(id==='wings'){
      const wing=(flip)=>{c.save();if(flip){c.translate(32,0);c.scale(-1,1);}const q=pen(c);
        [[-3,2],[-3,4],[-3,6],[-3,8],[-2,9],[-2,11],[-1,12],[0,13],[1,12],[2,11],[3,9],[5,6],[7,3]].forEach(([x,w],i)=>q(x,14+i,w,1,'blueD'));
        [[-2,2],[-2,4],[-2,6],[-1,7],[-1,9],[0,10],[1,11],[2,10],[3,9],[4,7],[6,4]].forEach(([x,w],i)=>q(x,15+i,w,1,i%3===0?'white':'cream'));
        q(0,19,2,1,'blue');q(2,21,3,1,'blue');q(5,23,3,1,'blue');q(8,24,3,1,'white');c.restore();};
      if(side){c.save();c.translate(right?-3:3,0);wing(!right);c.restore();}else{wing(false);wing(true);}
      if(rear){r(13,23,6,3,'gold');r(15,22,2,5,'yellow');}
    }
    if(id==='balloon'){
      const sx=right?-4:28,dy=frame===2?-1:0;r(sx+2,10+dy,1,8,'mintD');r(sx+1,18+dy,1,5,'mintD');r(sx-1,22+dy,2,1,'mintD');
      star(r,sx-3,-1+dy,'blueD','mint');star(r,sx-2,0+dy,'mintD','cream');r(sx,8+dy,3,2,'mint');r(sx-2,3+dy,2,1,'white');
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
    if(covered.has(equip.head))bc.clearRect(0,0,32,11);
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
  window.TourCostumes={items,draw,covered:[...covered]};
})();
