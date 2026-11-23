/* 학교 걷기 시트의 32×40 정수 격자에 그린다. 48×52 화면에서는 같은 그림에 여백만 더한다. */
(() => {
  // at is the total best-star threshold. legacyAt preserves pre-star rewards once.
  const items = [
    {id:'ribbon',name:'봄날 리본 핀',at:1,legacyAt:1,slot:'head',theme:'봄 소풍'},
    {id:'breadbag',name:'바게트 소풍백',at:1,legacyAt:1,slot:'back',theme:'방과 후 피크닉'},
    {id:'flower',name:'데이지 머리핀',at:3,legacyAt:2,slot:'head',theme:'봄 소풍'},
    {id:'bowback',name:'사르르 리본',at:3,legacyAt:2,slot:'back',theme:'봄 소풍'},
    {id:'bookcat',name:'책갈피 고양이 가방',at:3,slot:'back',theme:'책방지기'},
    {id:'cherry',name:'체리 머리핀',at:5,slot:'head',theme:'달콤한 소풍'},
    {id:'milkbag',name:'딸기우유 가방',at:5,slot:'back',theme:'달콤한 소풍'},
    {id:'bunny',name:'포근 토끼 모자',at:7,legacyAt:3,slot:'head',theme:'동물 친구'},
    {id:'bag',name:'민트 미니백',at:7,legacyAt:3,slot:'back',theme:'방과 후 피크닉'},
    {id:'cat',name:'밤고양이 모자',at:9,legacyAt:4,slot:'head',theme:'동물 친구'},
    {id:'starbag',name:'반짝 별 가방',at:9,legacyAt:4,slot:'back',theme:'별빛 산책'},
    {id:'frog',name:'작은 개구리 모자',at:11,slot:'head',theme:'비 오는 날'},
    {id:'umbrella',name:'접은 우산',at:11,slot:'back',theme:'비 오는 날'},
    {id:'beret',name:'별빛 베레모',at:13,legacyAt:5,slot:'head',theme:'별빛 산책'},
    {id:'wings',name:'구름 깃털 날개',at:13,legacyAt:5,slot:'back',theme:'하늘과 바다'},
    {id:'sailor',name:'바다 산책 모자',at:15,legacyAt:6,slot:'head',theme:'하늘과 바다'},
    {id:'balloon',name:'둥실 별 풍선',at:15,legacyAt:6,slot:'back',theme:'별빛 산책'},
    {id:'headphones',name:'파스텔 헤드폰',at:17,slot:'head',theme:'음악 시간'},
    {id:'noteballoon',name:'음표 풍선',at:17,slot:'back',theme:'음악 시간'},
    {id:'crown',name:'작은 별 왕관',at:19,legacyAt:7,slot:'head',theme:'예술제의 주인공'},
    {id:'cape',name:'예술제 리본 망토',at:19,legacyAt:7,slot:'back',theme:'예술제의 주인공'},
    {id:'witch',name:'라일락 마법 모자',at:21,legacyAt:8,slot:'head',theme:'달빛 마법'},
    {id:'moon',name:'초승달 산책',at:21,legacyAt:8,slot:'back',theme:'달빛 마법'},
    {id:'helmet',name:'작은 우주 헬멧',at:24,slot:'head',theme:'밤하늘 여행'},
    {id:'planet',name:'토성 풍선',at:24,slot:'back',theme:'밤하늘 여행'},
    {id:'trailcap',name:'꿈다락 탐험모',at:27,slot:'head',theme:'꿈다락 탐험'},
    {id:'cloudpack',name:'구름 등산가방',at:27,slot:'back',theme:'꿈다락 탐험'},
    {id:'melodyband',name:'멜로디 별 머리띠',at:30,slot:'head',theme:'음악 시간'},
    {id:'pianobag',name:'미니 피아노 가방',at:30,slot:'back',theme:'음악 시간'},
    {id:'shuttlepin',name:'셔틀콕 머리핀',at:33,slot:'head',theme:'배드민턴 시간'},
    {id:'racketbag',name:'배드민턴 라켓백',at:33,slot:'back',theme:'배드민턴 시간'},
    {id:'curlingbeanie',name:'컬링 니트모',at:36,slot:'head',theme:'빙판 위 컬링'},
    {id:'stonebag',name:'컬링 스톤 가방',at:36,slot:'back',theme:'빙판 위 컬링'},
    {id:'targetribbon',name:'명중 리본',at:39,slot:'head',theme:'정중앙 도전'},
    {id:'targetpack',name:'과녁 배낭',at:39,slot:'back',theme:'정중앙 도전'},
    {id:'laurel',name:'챔피언 월계관',at:42,slot:'head',theme:'예술제 챔피언'},
    {id:'trophybag',name:'우승 트로피 가방',at:42,slot:'back',theme:'예술제 챔피언'},
  ];
  const collection = [
    {id:'blush', name:'하트 볼터치', at:2, slot:'face', theme:'봄 소풍'},
    {id:'petals', name:'꽃잎', at:4, slot:'trail', theme:'봄 소풍'},
    {id:'planepin', name:'종이날개 머리핀', at:6, slot:'head', theme:'교정 항공우편'},
    {id:'plaster', name:'반창고', at:8, slot:'face', theme:'미술 실습'},
    {id:'puppyears', name:'강아지 귀', at:10, slot:'head', theme:'동물 친구'},
    {id:'mailcat', name:'고양이 편지 가방', at:12, slot:'back', theme:'교정 항공우편'},
    {id:'freckles', name:'주근깨 스티커', at:14, slot:'face', theme:'실습 카페'},
    {id:'baguette', name:'바게트 가방', at:16, slot:'back', theme:'실습 카페'},
    {id:'postmarks', name:'딸기 우표', at:18, slot:'trail', theme:'교정 항공우편'},
    {id:'chefhat', name:'꼬마 요리사 모자', at:20, slot:'head', theme:'실습 카페'},
    {id:'notes', name:'음표', at:23, slot:'trail', theme:'예술제 무대'},
    {id:'starshades', name:'별 안경', at:26, slot:'face', theme:'예술제 무대'},
    {id:'ribbontiara', name:'리본 왕관', at:29, slot:'head', theme:'예술제 무대'},
    {id:'easel', name:'이젤 화판', at:32, slot:'back', theme:'미술 실습'},
    {id:'whiskers', name:'고양이 수염', at:35, slot:'face', theme:'동물 친구'},
    {id:'hearts', name:'하트', at:38, slot:'trail', theme:'동물 친구'},
    {id:'stagephones', name:'헤드셋', at:41, slot:'head', theme:'방송부'},
    {id:'roundspecs', name:'동글 안경', at:44, slot:'face', theme:'공부 시간'},
    {id:'ledger', name:'계산기 가방', at:47, slot:'back', theme:'공부 시간'},
    {id:'gradcap', name:'졸업모', at:50, slot:'head', theme:'공부 시간'},
    {id:'sparkles', name:'반짝이', at:53, slot:'trail', theme:'별빛 산책'},
    {id:'starcloak', name:'별 망토', at:56, slot:'back', theme:'별빛 산책'},
    {id:'halo', name:'천사 링', at:59, slot:'head', theme:'하늘 산책'},
    {id:'rainbow', name:'작은 무지개', at:62, slot:'back', theme:'하늘 산책'},
    {id:'bubbles', name:'비눗방울', at:64, slot:'trail', theme:'하늘 산책'},
    {id:'bouquet', name:'풍선 다발', at:66, slot:'back', theme:'졸업 축제'},
  ];
  items.push(...collection);
  items.sort((a, b) => a.at - b.at);
  const sets = [
    {name:'교정 항공우편', title:'하늘 우체부', pieces:['planepin','mailcat','postmarks']},
    {name:'카페', title:'바리스타 견습생', pieces:['chefhat','baguette','freckles']},
    {name:'예술제', title:'무대 체질', pieces:['ribbontiara','starshades','notes']},
    {name:'공부', title:'도서실 단골', pieces:['gradcap','ledger','roundspecs']},
    {name:'하늘', title:'구름 산책가', pieces:['halo','rainbow','bubbles']},
    {name:'봄 소풍', title:'꽃길 안내원', pieces:['flower','bowback','petals']}
  ];
  function matchingSet(outfit) {
    const worn = Object.values(outfit);
    return sets.find(set => set.pieces.every(id => worn.includes(id)));
  }
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
    frog:{down:12,up:12,left:12,right:12},
    helmet:{down:12,up:12,left:12,right:12},
    trailcap:{down:12,up:12,left:12,right:12},
    curlingbeanie:{down:12,up:12,left:12,right:12},
  };
  for (const id of ['chefhat', 'gradcap']) crownCut[id] = {down:12, up:12, left:12, right:12};
  const covered=new Set(Object.keys(crownCut));
  function tinyStar(r,x,y){r(x+2,y,1,5,'goldD');r(x,y+2,5,1,'goldD');r(x+1,y+1,3,3,'gold');r(x+2,y+1,1,2,'yellow');}
  function pixelLine(r,x0,y0,x1,y1,color){
    const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;
    let error=dx+dy;
    for(;;){r(x0,y0,1,1,color);if(x0===x1&&y0===y1)break;const twice=2*error;if(twice>=dy){error+=dy;x0+=sx;}if(twice<=dx){error+=dx;y0+=sy;}}
  }
  // 도안 한 글자가 원본 시트의 한 픽셀이다. 옆얼굴은 같은 도안을 뒤집는다.
  const swatch = {
    k:'ink', n:'navy', w:'white', c:'cream', y:'yellow', g:'gold', d:'goldD',
    r:'rose', p:'pink', m:'mint', t:'mintD', b:'blue', v:'purple', l:'pale'
  };
  function stamp(r, x, y, rows, mirror = false) {
    rows.forEach((row, dy) => {
      for (let dx = 0; dx < row.length; dx++) {
        const color = swatch[row[dx]];
        if (color) r(mirror ? 31 - x - dx : x + dx, y + dy, 1, 1, color);
      }
    });
  }
  const hats = {
    halo: ['...kkkkkkkk...', '.kkgyyyyyygkk.', 'kyg........gyk', '.kkggggggggkk.', '...kkkkkkkk...'],
    puppyears: ['...kkk.', '..kdygk', '.kdggdk', '.kgdgdk', 'kdgdgdk', 'kdggddk', 'kggddk.', '.kdddk.', '..kkk..'],
    ribbontiara: ['k...kkk...k', 'kg.kprpk.gk', 'kykppyrpkyk', '.kggrprggk.', '.kyyyyyygk.', '..kkkkkkk..'],
    gradcap: ['.......kkk.......', '....kkknnnkkk....', '.kkknnbbbbbnnkkk.', 'knnnnbbbggbnnnnnk',
      '.kkknnnnnnnnnkkk.', '...kkkkknkkkkk...', '....knnnnnnnk....', '....kbnnbbnnk....', '....kkkkkkkkk....'],
    chefhat: ['......kkkkkk......', '..kkkkwwwwwwkkkk..', '.kcwwwcwwwwcwwwck.', 'kwwwwwwwwwwwwwwwck',
      'kwwwwwwwwwwwwwwwck', '.kcwwwcwwwwwcwwck.', '..kkcwwcwwwcwwkk..', '...kwwwwwwwwwck...',
      '...kmmmmmmmmmck...', '...kcttttttttck...', '...kkkkkkkkkkkk...']
  };
  function schoolHead(r, id, dir) {
    const side = dir === 'right' || dir === 'left', left = dir === 'left';
    if (id === 'planepin') {
      stamp(r, side ? 11 : dir === 'up' ? 7 : 16, 5,
        ['........nnn','.....nnnwwn','..nnnwwwbn.','nnwwwbbcn..','.nnbbwwn...','..ncnnn....','..nn..rr...'], left);
    }
    if (id === 'halo') stamp(r, side ? 10 : 9, 0, hats.halo, left);
    if (id === 'puppyears') {
      stamp(r, side ? 10 : 4, 5, hats.puppyears, left);
      if (!side) stamp(r, 4, 5, hats.puppyears, true);
      else stamp(r, 20, 5, ['kkk','kdgk','.kkk'], left);
    }
    if (id === 'ribbontiara') {
      stamp(r, side ? 14 : 10, 2, hats.ribbontiara, left);
      if (dir === 'up') stamp(r, 13, 4, ['prrrp','.gyr.','pr.rp']);
    }
    if (id === 'gradcap') {
      stamp(r, side ? 9 : 7, 3, hats.gradcap, left);
      stamp(r, side ? 12 : 21, 6, ['gg','dg','.d','.g','gyg','ggg'], left);
    }
    if (id === 'chefhat') {
      stamp(r, side ? 8 : 7, 1, hats.chefhat, left);
      if (dir !== 'up') stamp(r, side ? 18 : 16, 9, ['gy','dg'], left);
    }
    if (id === 'stagephones') {
      stamp(r, 7, 3, ['....kkkkkkkkkk....','..kkmmmmmmmmmmkk..','.ktk..........ktk.',
        'ktk............ktk','ktk............ktk'], left);
      const cup = ['.kkk.','knmnk','kmwmk','kmmmk','.ktk.'];
      stamp(r, side ? 12 : 5, 8, cup, left);
      if (!side) stamp(r, 5, 8, cup, true);
      if (dir !== 'up') stamp(r, side ? 14 : 7, 13, ['kn....','.kn...','..kkkk','....mk'], left);
    }
  }
  // 앞머리 경계가 계단 모양이므로 각 줄에서 얼굴이 드러난 구간만 칠한다.
  const faceEdges = {
    down: [
      ['...#.###.#.#', '.#..###..#.#', '.##.###.##..', '.#########..', '..#######...'],
      ['..##.###.#.#', '##.####..#.#', '##.####.##..', '##########..', '.########...'],
      ['..#.###.##.#', '##.####.##.#', '##.####.##..', '##########..', '.########...']
    ],
    side: ['#.##.##', '#.##.##', '..####.']
  };
  function face(c, id, dir, frame) {
    if (!id || dir === 'up') return;
    const side = dir !== 'down', left = dir === 'left', r = pen(c);
    const mask = side ? faceEdges.side : faceEdges.down[frame];
    const start = side ? 16 : 11;
    const pixel = (x, y, w, h, color) => {
      if (mask[y - 15]?.[x - start] === '#') r(left ? 31 - x : x, y, 1, 1, color);
    };
    if (id === 'roundspecs' || id === 'starshades') {
      const round = id === 'roundspecs';
      const lens = round ? ['.nnn.','nb..n','.nnn.'] : ['..g..','gywyg','.gyg.','..g..'];
      stamp(pixel, side ? 18 : 10, 15, lens);
      if (!side) stamp(pixel, 17, 15, lens);
      stamp(pixel, side ? 16 : 15, 16, [round ? 'nn' : 'gg']);
      return;
    }
    const marks = {
      blush: ['r.p','prp','.r.'], freckles: ['d.g','.d.'],
      whiskers: ['nn.','..n','nn.'], plaster: ['tcc','cmt']
    };
    const motif = marks[id];
    if (!motif) return;
    stamp(pixel, side ? 18 : 11, side ? 15 : 17, motif);
    if (!side && id !== 'plaster') stamp(pixel, 11, 17, motif, true);
  }
  const trailArt = {
    postmarks: ['.c.c.','cwdwc','.rrr.','cprwc','.c.c.'],
    petals: ['..pr','.pwp','prp.','.t..'],
    notes: ['.nnn','.nlv','.n..','vv..','nv..'],
    sparkles: ['..g..','.gyg.','gywyg','.gyg.','..g..'],
    hearts: ['.r.r.','rpppr','.rpr.','..r..'],
    bubbles: ['.bbb.','bw.lb','b..mb','.bmb.']
  };
  function trailMark(c, id, x, y) {
    if (trailArt[id]) stamp(pen(c), x, y, trailArt[id]);
  }
  function head(c,id,dir){
    schoolHead(pen(c), id, dir);
    const r=pen(c),side=dir==='left'||dir==='right',right=dir==='right',rear=dir==='up';
    // Use a true side silhouette, rather than keeping the front decoration on the back.
    if(id==='trailcap'){
      const x=side?8:6,w=side?17:20;
      r(x+4,3,w-8,1,'mintD');r(x+2,4,w-4,2,'mintD');r(x+1,6,w-2,4,'mintD');
      r(x+3,5,w-6,4,'mint');r(x+5,4,w-10,1,'cream');r(x+2,9,w-4,2,'goldD');r(x+3,9,w-6,1,'gold');
      // A short turned brim projects only toward the face in profile.
      const bx=side?(right?x+1:x-2):x-1,bw=side?w+1:w+2;
      r(bx,11,bw,1,'mintD');r(bx+1,10,bw-2,1,'mint');
      if(!rear){const ex=side?(right?20:9):20;r(ex,6,3,3,'goldD');r(ex+1,6,1,2,'yellow');r(ex,7,3,1,'yellow');}
      else{r(14,7,4,2,'mintD');r(15,7,2,1,'cream');}
    }
    if(id==='curlingbeanie'){
      const x=side?8:6,w=side?17:20;
      r(x+7,0,4,3,'blueD');r(x+8,0,2,2,'white');r(x+4,3,w-8,1,'blueD');r(x+2,4,w-4,2,'blueD');r(x,6,w,6,'blueD');
      r(x+3,4,w-6,2,'blue');r(x+1,6,w-2,3,'blue');
      for(let i=x+3;i<x+w-2;i+=3){r(i,6,1,1,'cream');r(i+1,7,1,1,'cream');}
      r(x+1,9,w-2,2,'cream');for(let i=x+2;i<x+w-1;i+=3)r(i,10,1,1,'gold');
      if(!rear){const ex=side?(right?20:10):20;r(ex,8,3,3,'roseD');r(ex+1,9,1,1,'pink');}
    }
    if(id==='melodyband'){
      const x=side?9:6,w=side?15:20;
      r(x+3,2,w-6,1,'purpleD');r(x+1,3,2,2,'purpleD');r(x+w-3,3,2,2,'purpleD');r(x,5,1,5,'purple');r(x+w-1,5,1,5,'purple');
      if(rear){r(10,3,12,1,'pale');r(12,4,2,1,'purple');}
      else{const ex=side?(right?20:7):21;tinyStar(r,ex-1,0);r(ex+1,5,1,4,'purpleD');r(ex-1,8,3,2,'purpleD');r(ex,8,1,1,'pink');}
    }
    if(id==='shuttlepin'){
      const x=side?(right?21:5):(rear?6:21);
      // Three separate feather vanes taper into the rose cork.
      r(x-2,3,1,4,'blueD');r(x,2,1,5,'blueD');r(x+2,3,1,4,'blueD');
      r(x-1,3,1,3,'white');r(x+1,3,1,3,'cream');r(x-1,7,3,1,'blueD');
      r(x,8,2,3,'roseD');r(x,8,1,2,'pink');r(x-2,11,5,1,'goldD');
    }
    if(id==='targetribbon'){
      const x=side?(right?21:5):(rear?7:21);
      r(x-3,5,3,5,'roseD');r(x+3,5,3,5,'roseD');r(x-2,6,2,3,'rose');r(x+3,6,2,3,'pink');
      r(x-1,6,4,5,'blueD');r(x,7,2,3,'cream');r(x,8,2,1,'roseD');
      r(x-2,10,2,4,'rose');r(x+3,10,2,4,'rose');r(x-1,13,1,1,'gold');r(x+3,13,1,1,'gold');
    }
    if(id==='laurel'){
      if(side){
        const x=right?12:17;r(x,4,1,7,'goldD');r(x-1,4,3,2,'mintD');r(x-2,6,3,2,'mint');r(x,8,3,2,'mintD');r(x,10,2,2,'gold');r(x-1,5,1,1,'yellow');
      }else{
        for(const flip of [false,true]){c.save();if(flip){c.translate(32,0);c.scale(-1,1);}const q=pen(c);
          pixelLine(q,7,4,12,11,'goldD');q(6,3,2,3,'mintD');q(8,4,3,2,'mint');q(7,7,2,3,'mintD');q(10,7,3,2,'mint');q(10,10,3,2,'mintD');q(8,5,1,1,'yellow');c.restore();}
        if(rear){r(14,10,4,2,'goldD');r(14,12,1,3,'gold');r(17,12,1,3,'gold');}else{r(14,11,4,1,'gold');r(15,10,2,1,'yellow');}
      }
    }
    if(id==='ribbon'){const x=side?(right?16:5):(rear?5:17);bow(r,x,6);}
    if(id==='flower'){
      const x=side?(right?21:4):(rear?6:20),y=8;
      r(x+2,y-2,3,3,'goldD');r(x-1,y+1,9,3,'goldD');r(x+2,y+4,3,3,'goldD');
      r(x+2,y-1,3,2,'white');r(x,y+1,2,3,'white');r(x+5,y+1,2,3,'white');r(x+2,y+4,3,2,'white');r(x+2,y+1,3,3,'gold');r(x+2,y+2,1,1,'yellow');
      r(x+5,y+6,3,1,'mintD');r(x+6,y+5,2,1,'mint');
    }
    if(id==='cherry'){
      const x=side?(right?19:5):(rear?5:18),y=7;
      pixelLine(r,x+4,y-2,x+1,y+3,'mintD');pixelLine(r,x+4,y-2,x+6,y+3,'mintD');
      r(x+4,y-3,4,2,'mint');r(x+1,y+2,3,4,'roseD');r(x,y+3,5,2,'roseD');r(x+1,y+3,2,2,'rose');r(x+1,y+3,1,1,'pink');
      r(x+6,y+3,3,4,'roseD');r(x+5,y+4,5,2,'roseD');r(x+6,y+4,2,2,'rose');r(x+6,y+4,1,1,'pink');
    }
    if(id==='frog'){
      const x=side?8:6,w=side?18:20;
      r(x+2,4,w-4,1,'mintD');r(x,5,w,7,'mintD');r(x+1,6,w-2,5,'mint');r(x+3,5,w-6,1,'mint');r(x+2,10,w-4,1,'cream');
      const eyes=side?[right?x+w-6:x+2]:[x+2,x+w-6];
      for(const ex of eyes){r(ex,2,4,5,'mintD');r(ex+1,3,2,3,'cream');if(!rear)r(ex+(right?2:1),4,1,2,'ink');}
      if(!rear){r(side?(right?21:10):14,9,side?2:4,1,'mintD');r(x+2,8,2,1,'pink');if(!side)r(x+w-4,8,2,1,'pink');}
    }
    if(id==='headphones'){
      const x=side?9:5,w=side?15:22;
      r(x+4,1,w-8,2,'purpleD');r(x+2,3,2,2,'purpleD');r(x+w-4,3,2,2,'purpleD');
      r(x,5,2,6,'purpleD');r(x+w-2,5,2,6,'purpleD');r(x+4,2,w-8,1,'pale');
      const cups=side?[right?10:18]:[4,23];
      for(const ex of cups){r(ex,10,5,7,'purpleD');r(ex+1,11,3,5,'pink');r(ex+2,12,1,3,'cream');}
    }
    if(id==='helmet'){
      const x=side?7:5,w=side?19:22;
      r(x+5,2,w-10,1,'ink');r(x+2,3,w-4,1,'ink');r(x+1,4,w-2,2,'ink');r(x,6,w,6,'ink');
      r(x+3,4,w-6,2,'white');r(x+2,6,w-4,2,'cream');r(x+1,8,w-2,3,rear?'blueD':'navy');
      if(!rear){r(x+3,8,w-6,2,'blue');r(side?(right?x+10:x+3):x+4,8,3,1,'white');}
      else{r(14,6,4,2,'blue');r(15,6,1,1,'white');}
      const ex=side?(right?8:21):x;r(ex,10,3,5,'blueD');r(ex+1,11,1,3,'cream');
      if(!side){r(x+w-3,10,3,5,'blueD');r(x+w-2,11,1,3,'cream');}
      r(side?(right?9:22):7,11,1,1,'rose');
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
        else{r(ex,0,3,6,outline);r(ex+1,1,1,4,'pink');r(ex,5,3,2,fill);}
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
      r(x,0,2,8,'goldD');r(x+w-2,0,2,8,'goldD');r(x+Math.floor(w/2)-1,0,3,8,'goldD');
      r(x+2,3,w-4,5,'goldD');r(x+1,5,w-2,4,'gold');r(x+2,7,w-4,1,'yellow');
      r(x,0,1,2,'yellow');r(x+w-2,0,1,2,'yellow');r(x+Math.floor(w/2),0,1,3,'yellow');
      r(x+Math.floor(w/2),5,2,2,rear?'cream':'roseD');r(x+3,5,1,1,'white');r(x+w-4,5,1,1,'white');
    }
    if(id==='witch'){
      const tip=side?(right?16:18):17;
      r(tip,0,5,1,'ink');r(tip-2,1,5,2,'ink');r(13,2,6,2,'ink');r(12,2,8,3,'ink');r(10,5,12,4,'ink');
      r(tip,1,3,1,'purple');r(15,0,3,2,'purple');r(14,2,4,3,'purple');r(12,5,8,3,'purple');r(19,5,2,3,'purpleD');
      r(11,8,10,1,'roseD');r(12,8,6,1,'pink');
      const x=side?6:4,w=side?21:24;r(x+2,9,w-4,1,'ink');r(x,10,w,1,'ink');r(x+2,11,w-4,1,'ink');r(x+3,10,w-6,1,'purpleD');
      if(!rear)tinyStar(r,side?(right?20:8):21,6);
    }
  }
  const carriedColors={bookcat:'mintD',bag:'mintD',breadbag:'roseD',starbag:'goldD',milkbag:'roseD',bowback:'roseD',wings:'goldD',umbrella:'blueD',cloudpack:'mintD',pianobag:'purpleD',racketbag:'blueD',stonebag:'blueD',targetpack:'roseD',trophybag:'goldD'};
  Object.assign(carriedColors, {
    mailcat:'blueD', baguette:'goldD', easel:'navy', ledger:'mintD', rainbow:'purpleD', bouquet:'blueD'
  });
  // Source-pixel adjustments from the resting jacket. The side view pulls the
  // pack against the back; tall props need more lift to clear the shoes.
  const packFit = {
    bag:       { lift: 2 }, breadbag: { lift: 2 }, milkbag: { lift: 2 },
    starbag:   { lift: 1, center: 1 }, bowback: { lift: 3 },
    bookcat:   { lift: 2, center: -1 }, umbrella: { lift: 3, center: -2 },
    cloudpack: { lift: 3, center: -1 }, pianobag: { lift: 2 },
    racketbag: { lift: 4 }, stonebag: { lift: 2, center: 1 },
    targetpack:{ lift: 3 }, trophybag: { lift: 4, center: 1 },
    mailcat:   { lift: 2 },
    baguette:  { lift: 3 }, easel: { lift: 4 }, ledger: { lift: 4 },
    rainbow:   { lift: 4, sideLift: 1 }
  };
  function back(c,id,dir,frame=1){
    const color=carriedColors[id];
    if(!color){backArt(c,id,dir,frame);return;}
    // Match the existing 0,1,2,1 walk cycle: up one pixel, rest, down one, rest.
    // Only the accessory moves; the body, hair and collision box stay fixed.
    const bob=frame===0?-1:frame===2?1:0;
    const fit = packFit[id];
    const side = dir === 'left' || dir === 'right';
    const lift = (side ? fit?.sideLift : undefined) ?? fit?.lift ?? 0;
    const tuck = dir === 'right' ? 1 : -1;
    const center = (fit?.center || 0) + (dir === 'down' && id !== 'wings' ? 1 : 0);
    const dx = side ? (fit ? tuck : 0) : center;
    c.save();
    c.translate(dx, bob - lift);
    // Use the same side-to-jacket distance on both profiles.
    if (fit && dir === 'left') {
      c.translate(32, 0);
      c.scale(-1, 1);
      backArt(c, id, 'right', frame);
    } else {
      backArt(c, id, dir, frame);
    }
    c.restore();
    // A short strap/root stays on the shoulder while its far end follows the item.
    const r=pen(c);
    if(dir==='up'){
      pixelLine(r,15,20,15,22+bob-lift,color);
      r(14,20,3,1,color);
    }else if(dir==='left'||dir==='right'){
      const right=dir==='right',from=id==='umbrella'?(right?11:20):(right?12:19);
      const to=id==='wings'?(right?11:20):(right?9:22);
      pixelLine(r,from,21,to+dx,22+bob-lift,color);
    }
  }
  // Profiles face right in the pattern and mirror around the sprite centre for left.
  // The inside edge overlaps the jacket, so the bag rests against the body at every step.
  const patternedBags={
    mailcat: {
      profile:[7,19,['..n..n','..npnn','.nbccn','nbccwn','nbcwrn','nbccwn','nbcwbn','nbcwwn','.nbccn','..nnnn']],
      rear:[7,19,['..n...........n..','..npn.......npn..','..nppnnnnnnnppn..',
        '.nbwwwwwwwwwwwbn.','nrbwcwnwwwnwcwbrn','nwwbwwwwpwwwwbwwn','nbwwbbwwwwwbbwwbn',
        'nwwwwwbbrbbwwwwwn','nrwwwwwrprwwwwwrn','nbwwwwwwrwwwwwwbn','.nnnnnnnnnnnnnnn.']]
    },
    // 바게트의 칼집, 이젤 위 풍경, 회계 실습용 숫자판을 각각 작은 옆판에도 남긴다.
    baguette: {
      profile:[6,19,['....kkk','...kgyk','..kggck','.kgcggk','kdyggdk','kdgggdk',
        'kpppppk','krppprk','.krrrk','..kkk']],
      rear:[6,19,['............kkkkk','..........kkgyyygk','........kkgggcgggdk',
        '......kkgggcgcgggdk','....kkgygcgggggdkk.','..kkgygggcgggdkk...',
        '.kgggcgggggdkk.....','kdggcgppppkk.......','kdgggppprrk........',
        '.kdggppprk.........','..kkdrrrk..........','....kkkk...........']]
    },
    easel: {
      profile:[7,18,['...kkk','...kgk','..kkgk','..kwdk','..kcdk','..kmdk','..kbdk',
        '..kmdk','..kgdk','.kkggkk','..kdkk','..kd.k','.kd..k']],
      rear:[7,17,['.......kkk.......','.......kgk.......','..kkkkkkkkkkkkk..',
        '.kdgggggggggggdk.','.kgwwwwwwwwwwwgk.','.kgwyywwwwwbbwgk.','.kgwyywwwwbmbwgk.',
        '.kgwwwwmmbmmmbgk.','.kgwwbmmmtmttmgk.','.kgbmmmmtttttmgk.','.kdgggggggggggdk.',
        'kkkkkkkkkkkkkkkkk','kgggggggggggggggk','.kkdkk.....kkdkk.','..kgk.......kgk..']]
    },
    ledger: {
      profile:[7,20,['..kkkk','.ktmmk','ktwwmk','ktbbmk','ktmmmk','ktcgmk','ktmmmk',
        'ktggmk','ktmmmk','.ktttk','..kkkk']],
      rear:[7,19,['.....kkkkkkk.....','....ktmmmmmtk....','..kkkkkkkkkkkkk..',
        '.ktmmmmmmmmmmmtk.','ktmncccccccccnmtk','ktmnbbbnbnbbbnmtk','ktmnnnnnnnnnnnmtk',
        'ktmmmmmmmmmmmmmtk','ktmccmccmccmggmtk','ktmnnmnnmnnmddmtk','ktmccmccmccmggmtk',
        'ktmnnmnnmnnmddmtk','.ktttttttttttttk.','..kkkkkkkkkkkkk..']]
    },
    rainbow: {
      profile:[6,17,['...kkk','..krpgk','.krgmmk','krgmbvk','krmbv.k','kmbv..k',
        '.kk...k','kwck..k','kwwc..k','.kkk..k']],
      rear:[5,20,['.......kkkkkkk.......','.....kkrrrrrrrkk.....','....krppgggggpprk....',
        '...krpgymmmmmgyprk...','..krpgymbbbbbmgyprk..','.krpgymbvkkkvbmgyprk.',
        '.krgymbvk...kvbmygrk.','krgymbvk.....kvbmygrk','krgmbvk.......kvbmgrk',
        '.kkkvk.........kvkkk.','kwwwck.........kcwwwk','kwwwwck.......kcwwwwk','.kkkkk.........kkkkk.']]
    },
    bouquet: {
      profile:[5,9,['...kkk','..kvwvk','.kkvvvk','krpkkvk','krprkkk','.krkmbk',
        '..kkwmk','...kmtk','...kktk','....kk','....n.','....n.','.....n',
        '.....n','.....nn','......nn','......nn']],
      rear:[0,1,[
        '.............kkkkk', '............kvwllvk', '...........kvlvvvvvk', '...........kvlvvvvvk',
        '...........kvvvvvvvk', '............kvvvvvk', '.............kvvvk', '..............knk',
        '..kkkkk........n........kkkkk', '.krwpppk.......n.......kmwwmmk',
        'krppppprk......n......kmmmbbmmk', 'krppppprk......n......kmmmmttmk',
        'krpppprrk......n......kmmmmttmk', '.krrprrk.......n.......ktmmttk',
        '..krrrk........n........ktttk', '...knk.........n.........knk',
        '....n..........n..........n', '.....nn........n........nn',
        '.......nn......n......nn', '.........nn....n....nn', '...........nn..n..nn',
        '.............nnnnn', '..............prp', '.............prgrp', '.............p...p']]
    },
    bookcat:{
      // Clothbound spine, gilt cover stamp and a folded ginger cat over the page edge.
      colors:{s:'mintD',v:'mint',o:'navy',p:'cream',g:'gold',c:'goldD',f:'yellow',e:'ink'},
      profile:[7,16,['.c.c','.cfc','.cec','.cff','osppso','ovpgso','ovppso','ovppso','ovppso','ovppso','osppso','.oooo']],
      rear:[8,17,['.........c...c','.........cc.cc','.........cfcfc','.........efefe','.sssssssscfffc','ospppppppccgcc','ossssssssssssso','osvvvvvvvvvvvso','osvvgvvggvvvgso','osvvvvggggvvvso','osvvvvvggvvvvso','osvvgvvvvvvvgso','ospppppppppppso','.ooooooooooooo']]},
    racketbag:{
      colors:{o:'navy',b:'blueD',c:'cream',n:'blue',g:'goldD',h:'yellow'},
      profile:[8,18,['..bb','.bcn','bcnnb','bcncb','bnncb','.bncb','.bnb','..bb','..bb','...g','...g','...hg','....g','....g']],
      rear:[10,18,['......bbb','....bbcnnb','...bcncncnb','..bncncncnb','.bcncncncnb','.bncncncnb','.bcncncnb','..bbncbb','...bbbb','...bb','..gg','..hg','.gg','.hg','gg']]},
    stonebag:{
      colors:{o:'navy',b:'blueD',c:'cream',n:'blue',p:'roseD',h:'pink'},
      profile:[7,20,['...ppp','...php','....pp','..bbbb','.bnnnnb','bccccnnb','bnnnnnnb','.bnnnnb','..oooo']],
      rear:[7,20,['.....pppppp','.....phhhpp','.....p...pp','...bbbbbbbbbb','..bnnnnnnnnnnb','.bcccccccnnnnnb','bnnnnnnnnnnnnnnb','bnnnnnnnnnnbbbnb','.bbnnnnnnnnnnbb','...oooooooooo']]},
    targetpack:{
      colors:{o:'roseD',c:'cream',b:'blueD',r:'rose',g:'gold',h:'yellow'},
      profile:[8,20,['...ooo','..occo','.ocbco','.ocbco','ocgbco','ocgbco','.ocbco','.ocbco','..occo','...ooo']],
      rear:[9,19,['....oooooo','..ooccccccoo','.occcbbbbccco','.ocbbrrrrbbco','ocbbrggggrbbco','ocbrgghhggrbco','ocbrgghhggrbco','ocbbrggggrbbco','.ocbbrrrrbbco','.occcbbbbccco','..ooccccccoo','....oooooo']]},
    trophybag:{
      colors:{o:'goldD',g:'gold',h:'yellow',r:'roseD',p:'pink',n:'navy'},
      profile:[7,20,['..ohhho','ooogggoh','o.ohggo','o.ohggo','.ooggo','..oggo','...oo','...og','...og','..oggo','.oggggo','.nnnnno']],
      rear:[8,20,['...ohhhhhho','ooooggggggoooo','o..ohgggggo..o','o..ohgrrggo..o','.o.oggrpggo.o','..oooggggooo','.....oggo','......oo','......og','.....oggo','....ohgggo','...onnnnnno']]}
  };
  function patternedBag(r,id,dir){
    const bag=patternedBags[id],side=dir==='left'||dir==='right';
    const [x,y,rows]=side?bag.profile:bag.rear;
    rows.forEach((row,dy)=>Array.from(row).forEach((mark,dx)=>{
      if(mark!=='.')r(dir==='left'?31-x-dx:x+dx,y+dy,1,1,(bag.colors || swatch)[mark]);
    }));
  }
  function backArt(c,id,dir,frame=1){
    const r=pen(c),rear=dir==='up',front=dir==='down',side=!rear&&!front,right=dir==='right',x=side?(right?5:21):10;
    if(id==='cloudpack'){
      const bx=side?(right?8:19):9,w=side?5:14;
      r(bx+1,18,w-2,2,'mintD');r(bx,20,w,11,'mintD');r(bx+1,20,w-2,10,'mint');
      r(bx,20,w,2,'goldD');r(bx+1,20,w-2,1,'gold');r(bx+1,29,w-2,1,'cream');
      if(side){r(bx+1,24,3,4,'blueD');r(bx+2,25,1,2,'white');}
      else{r(12,23,3,2,'white');r(16,22,3,3,'white');r(11,25,10,3,'blueD');r(12,24,8,3,'white');r(13,26,6,1,'cream');r(8,23,2,5,'blueD');r(23,23,2,5,'blueD');}
    }
    if(id==='pianobag'){
      const bx=side?(right?8:19):9,w=side?5:14;
      r(bx+1,19,w-2,1,'purpleD');r(bx,20,w,10,'ink');r(bx+1,21,w-2,8,'purpleD');
      if(side){r(bx+1,22,2,6,'purple');r(bx+3,22,1,6,'cream');r(bx+1,26,1,1,'gold');}
      else{r(10,21,12,3,'purple');r(10,25,12,4,'cream');for(let k=12;k<22;k+=2)r(k,25,1,3,'ink');r(11,26,1,2,'white');r(19,21,1,2,'gold');r(17,23,3,1,'yellow');}
    }
    if(patternedBags[id])patternedBag(r,id,dir);
    if(id==='bookcat'){
      // The tail curls beyond the cover. Its tip flicks one horizontal pixel per step.
      const edge=side?7:23, outward=side?-1:1;
      const tail=(offset,y,k)=>{
        const tx=edge+outward*offset;
        r(dir==='left'?31-tx:tx,y,1,1,k);
      };
      // 가방을 허리 높이로 올린 만큼 꼬리도 함께 (뒤·앞 3칸, 옆 4칸)
      const lift=side?4:3;
      tail(0,29-lift,'goldD');tail(1,29-lift,'gold');tail(2,28-lift,'gold');
      tail(frame===1?2:3,27-lift,'yellow');
    }
    if(id==='milkbag'){
      if(side){const bx=right?6:22;r(bx+1,17,2,3,'roseD');r(bx,20,5,10,'roseD');r(bx+1,20,3,9,'pink');r(bx+2,22,1,5,'cream');r(right?11:20,20,1,9,'roseD');}
      else{r(12,16,7,2,'roseD');r(11,18,9,2,'roseD');r(10,20,11,10,'roseD');r(12,18,7,2,'pink');r(11,20,9,9,'cream');r(11,20,9,3,'pink');r(14,24,4,3,'rose');r(15,23,2,1,'mintD');r(15,25,1,1,'yellow');r(18,21,2,8,'pink');}
    }
    if(id==='umbrella'){
      // A folded umbrella strapped vertically to the back; narrower in profile.
      const bx=side?(right?7:22):15,w=side?3:5;
      r(bx+1,11,1,4,'ink');r(bx,15,w,3,'blueD');r(bx-1,18,w+2,10,'blueD');
      r(bx,18,w,9,'blue');r(bx+1,16,1,11,'cream');r(bx-1,23,w+2,2,'navy');
      r(bx+1,28,1,4,'goldD');r(bx+2,31,2,1,'goldD');r(bx+3,29,1,2,'goldD');
      if(side)r(right?11:20,21,1,8,'blueD');
    }
    if(id==='noteballoon'||id==='planet'){
      const dy=frame===2?2:3;
      c.save();if((side&&right)||rear){c.translate(32,0);c.scale(-1,1);}c.translate(side ? -2 : -3, 0);
      const q=pen(c);
      let knot=30;
      if(id==='noteballoon'){
        if(side){q(28,-1+dy,3,10,'purpleD');q(29,dy,1,7,'pink');q(27,6+dy,4,3,'purpleD');q(28,7+dy,2,1,'pale');knot=29;}
        else{q(30,-2+dy,2,10,'purpleD');q(31,-2+dy,4,3,'purpleD');q(32,-1+dy,2,1,'pink');q(26,6+dy,6,4,'purpleD');q(27,7+dy,4,2,'pink');q(27,7+dy,1,1,'white');knot=29;}
        q(knot,10+dy,1,1,'purpleD');
      }else{
        const bx=side?27:24,w=side?5:9;
        q(bx+1,-1+dy,w-2,1,'goldD');q(bx,-0+dy,w,7,'goldD');q(bx+1,7+dy,w-2,1,'goldD');
        q(bx+1,dy,w-2,6,'gold');q(bx+1,1+dy,side?1:3,2,'yellow');
        // The ring is elliptical edge-on, with an offset front arc.
        pixelLine(q,bx-1,5+dy,bx+w,1+dy,'purpleD');pixelLine(q,bx-1,6+dy,bx+w+1,2+dy,'pale');
        q(bx-1,5+dy,1,2,'purpleD');q(bx+w+1,1+dy,1,2,'purpleD');knot=bx+Math.floor(w/2);q(knot,8+dy,1,2,'goldD');
      }
      pixelLine(q,knot,11+dy,29,17,'purpleD');pixelLine(q,29,17,25,21,'purpleD');pixelLine(q,25,21,20,24,'purpleD');c.restore();
    }
    if(id==='starcloak'){
      const sway = frame - 1;
      const collar = side ? ['..kkkk','..knbk','..knnk','..kbnk','..knnb'] :
        ['.....kkkkkkk.....','....knngygnnk....','...knbbgygbnnk...','..knnnnngnnnbnk..','..knbnnbbbnnnnk..'];
      const hem = side ? ['..knbnk','..knngk','.kbngyk','.kkkkk'] :
        ['.knbngnnbnngnbnk.','knbngygnbngygnbnk','knbnngnnnnngnnbnk','.kggygggygggyggk.','..kkkkkkkkkkkkk..'];
      const x = side ? 16 : (front ? 8 : 7);
      stamp(r, x, 20, collar, side && right);
      stamp(r, x + sway, 25, hem, side && right);
    }
    if(id==='cape'){
      // Shoulder stays fixed beneath the hair; only the lower cloth sways.
      const sway=frame===0?-1:frame===2?1:0;
      if(side){
        c.save();if(right){c.translate(32,0);c.scale(-1,1);}const q=pen(c);
        q(18,20,4,3,'roseD');q(18,23,5,3,'roseD');
        q(19+sway,26,5,3,'roseD');q(20+sway,29,3,1,'roseD');
        q(19,21,2,4,'rose');q(20,23,2,3,'rose');
        q(20+sway,26,3,2,'rose');q(21+sway,28,2,1,'gold');
        q(19,22,1,3,'pink');c.restore();
      }else{
        r(11,20,10,4,'roseD');r(10,24,12,3,'roseD');
        r(9+sway,27,14,2,'roseD');r(10+sway,29,12,1,'roseD');
        r(12,21,8,3,'rose');r(11,24,10,3,'rose');
        r(10+sway,27,12,2,'rose');r(12,22,1,4,'pink');
        r(18,23,1,4,'roseD');r(11+sway,28,2,1,'gold');r(19+sway,28,2,1,'gold');
        if(rear){r(14,21,4,1,'pink');r(15,24,2,3,'gold');r(14,25,4,1,'gold');r(15,25,1,1,'yellow');}
      }
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
      const dy=frame===2?0:1;
      if(side){
        c.save();if(right){c.translate(32,0);c.scale(-1,1);}const q=pen(c);
        // A five-pixel side face shows the inflated edge, not the full star.
        q(29,dy,1,2,'blueD');q(28,2+dy,3,2,'blueD');q(27,4+dy,5,2,'blueD');q(28,6+dy,3,2,'blueD');q(29,8+dy,1,1,'blueD');
        q(29,2+dy,1,6,'mint');q(28,4+dy,2,2,'cream');q(29,9+dy,2,1,'mintD');
        pixelLine(q,30,10+dy,29,16,'mintD');pixelLine(q,29,16,25,20,'mintD');pixelLine(q,25,20,20,24,'mintD');c.restore();
      }else{
        const bx=rear?0:24;star(r,bx,dy,'blueD',rear?'mint':'cream');
        r(bx+3,2+dy,2,4,'mint');r(bx+2,3+dy,1,2,rear?'mintD':'white');r(bx+3,8+dy,2,1,'mintD');
        const knot=bx+4,mid=rear?4:28,anchor=rear?12:20;
        pixelLine(r,knot,9+dy,knot,15,'mintD');pixelLine(r,knot,15,mid,20,'mintD');pixelLine(r,mid,20,anchor,24,'mintD');
      }
    }
    if(id==='moon'){
      // Crescent and tiny satellites sit behind the body in every direction.
      c.save();
      if (right) { c.translate(32, 0); c.scale(-1, 1); }
      const mx=23;
      r(mx+3,8,5,2,'goldD');r(mx+1,10,4,2,'goldD');r(mx,12,3,12,'goldD');r(mx+1,24,4,3,'goldD');r(mx+4,27,5,2,'goldD');
      r(mx+3,10,3,2,'yellow');r(mx+1,12,3,10,'gold');r(mx+2,14,1,8,'yellow');r(mx+3,22,2,4,'gold');r(mx+5,25,3,2,'yellow');
      r(mx+5,10,2,2,'cream');r(mx+7,25,2,2,'cream');r(2,12,1,5,'purple');r(0,14,5,1,'purple');r(8,24,2,2,'gold');
      c.restore();
    }
  }
  const base=document.createElement('canvas');base.width=32;base.height=40;
  const bc=base.getContext('2d');
  const sampleMarks = [[5,32], [23,34], [9,35]];
  function draw(c,sprite,dir='down',frame=1,equip={},marks=sampleMarks){
    c.clearRect(0,0,c.canvas.width,c.canvas.height);c.imageSmoothingEnabled=false;c.save();
    if(c.canvas.width===48)c.translate(8,12);
    if (equip.trail) {
      for (const [x, y, alpha = 1] of marks) {
        c.globalAlpha = alpha;
        trailMark(c, equip.trail, x, y);
      }
      c.globalAlpha = 1;
    }
    const row={down:0,right:1,up:2,left:3}[dir]??0;
    bc.clearRect(0,0,32,40);bc.imageSmoothingEnabled=false;bc.drawImage(sprite,frame*32,row*40,32,40,0,0,32,40);
    // The top of the original head is stationary in all 12 frames. Never bob
    // a hat independently of it. Clear only the crown, above the visible face.
    const cut=crownCut[equip.head]?.[dir];
    if(cut)bc.clearRect(0,0,32,cut);
    const floating=['moon','balloon','noteballoon','planet'].includes(equip.back);
    const cloak = equip.back === 'starcloak';
    const capeSide=(equip.back==='cape' || cloak)&&(dir==='left'||dir==='right');
    if(dir==='down'||floating||capeSide)back(c,equip.back,dir,frame);
    c.drawImage(base,0,0);
    if(dir!=='down'&&!floating&&!capeSide){
      back(c,equip.back,dir,frame);
      // Backpacks and capes sit under the hair, including in side views.
      c.drawImage(base,0,0,32,20,0,0,32,20);
    }
    // The pack is behind the torso in front view. Two short webbing ends cross
    // the jacket shoulders, leaving its central tie and the face visible.
    if(dir==='down' && (packFit[equip.back] || equip.back === 'bouquet')){
      const r=pen(c),strap=carriedColors[equip.back];
      r(11,21,1,3,strap);r(12,23,1,1,strap);
      r(20,21,1,3,strap);r(19,23,1,1,strap);
    }
    // A small neck fastening joins the cloth to the uniform, below the face.
    if(equip.back==='cape'){const r=pen(c);if(dir==='down'){r(12,21,3,1,'roseD');r(18,21,2,1,'roseD');r(15,22,3,1,'rose');r(16,21,1,2,'gold');}else if(capeSide){r(dir==='left'?18:12,21,2,1,'roseD');r(dir==='left'?18:13,22,1,1,'gold');}}
    if (cloak && dir !== 'up') {
      const x = dir === 'down' ? 15 : dir === 'left' ? 18 : 12;
      stamp(pen(c), x, 21, ['ng','gy']);
    }
    face(c, equip.face, dir, frame);
    head(c,equip.head,dir);c.restore();
  }
  window.TourCostumes = {
    items, collection, sets, matchingSet, trailMark, draw, covered:[...covered], crownCut
  };
})();
