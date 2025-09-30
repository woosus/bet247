// app.js — PPT EXACT v2
const el=(s,r=document)=>r.querySelector(s), els=(s,r=document)=>Array.from(r.querySelectorAll(s));
const dbg=(m)=>{ const o=el('#dbg'); if(o) o.textContent=m; console.log('[DBG]', m); };

/* Promotion slider images */
const PROMO=[
  {a:'./assets/p1.png', b:'./assets/p1-1.png'},
  {a:'./assets/p2.png', b:'./assets/p2-1.png'},
  {a:'./assets/p3.png', b:'./assets/p3-1.png'},
];

/* A/B 선호도 표시 (임시 입력 기반) */
function updatePreference(){
  const a = Number(el('#uid').value.length % 100); // demo calc
  const b = Math.max(0, 100 - a);
  el('#prefA').textContent = a + '%';
  el('#prefB').textContent = b + '%';
}

el('#idForm').addEventListener('submit', e=>{ e.preventDefault(); updatePreference(); alert('확인되었습니다.'); });

/* Dock mode switch */
els('input[name="dock"]').forEach(r=> r.addEventListener('change',()=>{
  const dock = el('#dock');
  dock.classList.toggle('compact', el('input[name="dock"][value="compact"]').checked);
}));

/* Buttons */
els('.btn').forEach(b=> b.addEventListener('click', ()=>{
  const act=b.dataset.act;
  if(act==='promo'){ openPromo(); }
  if(act==='coupon'){ playZigzag(makeSources(['쿠폰신청','coupon'])); }
  if(act==='emergency'){ playZigzag(makeSources(['긴급쿠폰신청','emergency'])); }
  if(act==='join'){ openJoin(); }
  if(act==='signup'){ alert('가입하기 플로우는 PPT 14~16페이지 내용을 반영해 커스텀 입력/연동하도록 구성합니다.'); }
}));

function useImage(container, src){
  const img = new Image(); img.src = src; img.onload=()=> container.appendChild(img);
  img.onerror=()=> container.textContent = '이미지 없음: '+src;
}

/* Promo modal */
let promoIndex=0;
function openPromo(){
  const m = el('#promoModal'); const A=el('#promoA'), B=el('#promoB');
  A.innerHTML=''; B.innerHTML='';
  useImage(A, PROMO[promoIndex].a); useImage(B, PROMO[promoIndex].b);
  m.showModal();
  m.addEventListener('close', ()=>{ A.innerHTML=''; B.innerHTML=''; }, {once:true});
}

/* Join modal */
function openJoin(){
  const d = el('#joinModal'); d.showModal();
}
el('#midBar').addEventListener('click', ()=> el('#subBars').classList.toggle('open'));
els('.bar.sub', el('#subBars')).forEach(b=> b.addEventListener('click', ()=>{
  const key=b.dataset.key; const detail=el('#joinDetail');
  const map={
    j1:'형님 가슴아프시죠. 최초/마지막 입금시간 남겨주시면 재입금 즉시 지급되도록 준비합니다.',
    j2:'프리스핀 100% 보너스참여. 겜블 포함 게임은 제외될 수 있습니다.',
    j3:'프리스핀 100% 보너스 당첨. 손실난 금액은 쿠폰으로 준비.',
    j4:'300배 이상 보너스 당첨 축하드립니다. 확인 후 즉시 지급.'
  };
  detail.textContent = map[key] || '선택됨';
}));

/* ====== Video ZigZag (0.2s monitor ↔ full overlay) ====== */
let zigTimer=null;
function stopZig(){ if(zigTimer){ clearInterval(zigTimer); zigTimer=null; } el('#overlay').classList.remove('show'); }

function makeSources(bases){
  // Build robust candidate list: ./assets/<base>.mp4 (Korean/English, lower/upper)
  const list = [];
  const uniq = new Set();
  const push = (s)=>{ if(!uniq.has(s)) { uniq.add(s); list.push(s); } };
  const exts = ['.mp4', '.MP4'];
  const alts = [];
  bases.forEach(b=>{
    alts.push(b, b.toLowerCase(), b.toUpperCase());
  });
  // Add concrete known names
  alts.push('쿠폰신청','긴급쿠폰신청','coupon','emergency');
  for(const a of alts){
    for(const e of exts){
      push(`./assets/${a}${e}`);
    }
  }
  return Array.from(list);
}
function syncAspect(video){ const mon=el('#monitor'); if(video.videoWidth&&video.videoHeight){ mon.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`; } }


async function playZigzag(srcList, interval=200){
  stopZig();
  const A = el('#layerA');
  const overlay = el('#overlay');
  A.innerHTML='';

  // Create two video elements (monitor & overlay) and keep them in sync
  const vMon = document.createElement('video');
  const vBg  = document.createElement('video');
  [vMon, vBg].forEach(v => {
    Object.assign(v, {playsInline:true, muted:true, autoplay:true, controls:false, preload:'auto'});
    v.setAttribute('playsinline','');
  });
  vMon.style.width='100%'; vMon.style.height='100%'; vMon.style.objectFit='contain';
  vBg.style.position='absolute'; vBg.style.inset='0'; vBg.style.width='100%'; vBg.style.height='100%'; vBg.style.objectFit='contain'; vBg.style.background='#000';

  A.appendChild(vMon);
  overlay.innerHTML=''; overlay.appendChild(vBg);

  let i=0;
  const tryNext=()=>{
    if(i>=srcList.length){
      A.textContent='영상 파일을 찾지 못했습니다.';
      overlay.classList.remove('show'); overlay.setAttribute('hidden','');
      return;
    }
    const src = srcList[i++] + '?t='+Date.now();
    vMon.src = src; vBg.src = src;
  };

  let syncTimer=null, toggleTimer=null, inMonitor=true, userGestureDone=false;

  const startPlay = ()=>{
    // Try to play both; some browsers need user gesture for at least one
    const p1 = vMon.play().catch(()=>{});
    const p2 = vBg.play().catch(()=>{});
    Promise.allSettled([p1,p2]).then(()=>{
      if(!userGestureDone){
        // If autoplay was blocked, click on monitor to proceed
        el('#monitor').addEventListener('click', ()=>{
          vMon.play().catch(()=>{});
          vBg.play().catch(()=>{});
        }, {once:true});
        userGestureDone=true;
      }
    });
  };

  vMon.onloadedmetadata = ()=> syncAspect(vMon);
  vBg.onloadedmetadata  = ()=> {/* no-op */};

  vMon.oncanplay = vBg.oncanplay = ()=>{
    // Begin toggling when both ready
    overlay.removeAttribute('hidden');
    overlay.classList.add('show');
    startPlay();
    // Keep currentTime close (drift correction)
    syncTimer = setInterval(()=>{
      if (Math.abs(vMon.currentTime - vBg.currentTime) > 0.08){
        try { vBg.currentTime = vMon.currentTime; } catch(e){}
      }
    }, 80);
    toggleTimer = setInterval(()=>{
      inMonitor = !inMonitor;
      if(inMonitor){
        overlay.classList.remove('show'); overlay.setAttribute('hidden','');
      }else{
        overlay.removeAttribute('hidden'); overlay.classList.add('show');
      }
    }, interval);
  };

  const cleanup = ()=>{
    if(syncTimer) clearInterval(syncTimer);
    if(toggleTimer) clearInterval(toggleTimer);
    overlay.classList.remove('show'); overlay.setAttribute('hidden','');
    [vMon, vBg].forEach(v=>{ v.pause(); v.src=''; });
  };

  vMon.onerror = vBg.onerror = ()=>{ cleanup(); tryNext(); };
  vMon.onended = vBg.onended = ()=> cleanup();

  tryNext();
}

/* close modals */
els('[data-close]').forEach(btn=> btn.addEventListener('click', ()=> btn.closest('dialog')?.close()));
