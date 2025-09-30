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
function makeSources(bases){ const exts=['.mp4','.MP4']; const list=[]; bases.forEach(b=> exts.forEach(e=> list.push(`./assets/${b}${e}`))); list.push('./assets/ddd1.mp4','./assets/DDD1.MP4'); return list; }
function syncAspect(video){ const mon=el('#monitor'); if(video.videoWidth&&video.videoHeight){ mon.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`; } }

// ▶ 기존 playZigzag 전체를 이 블록으로 교체
async function playZigzag(srcList, interval = 200) {
  stopZig();

  const monitor = el('#monitor');
  const A = el('#layerA');
  const overlay = el('#overlay');

  // A의 기존 내용을 저장해뒀다가 재생 종료 후 복구
  const prevA = A.innerHTML;
  A.innerHTML = '';

  // 모니터가 오버레이보다 위에 오도록 (모니터 모드에서 배경은 검정 유지)
  monitor.style.zIndex = '200';

  // 오버레이는 재생 내내 표시(배경을 항상 검정으로 유지)
  overlay.style.display = 'block';
  overlay.classList.remove('bgVideo');
  overlay.classList.add('mask');   // 모니터 아래에 깔리는 검정 마스크
  overlay.innerHTML = '';

  // 모니터/배경용 비디오 2개를 동시에 로드
  const vMon = document.createElement('video');
  const vBg  = document.createElement('video');
  [vMon, vBg].forEach(v => {
    Object.assign(v, { playsInline: true, muted: true, autoplay: true, controls: false, preload: 'auto' });
    v.setAttribute('playsinline', '');
  });

  // 스타일
  Object.assign(vMon.style, { width: '100%', height: '100%', objectFit: 'contain', background: '#000' });
  Object.assign(vBg.style,  { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'contain', background: '#000' });

  // DOM 배치
  A.appendChild(vMon);
  overlay.appendChild(vBg); // 배경용 비디오는 오버레이 안에 유지

  // 후보 소스 로테이션
  let i = 0;
  const tryNext = () => {
    if (i >= srcList.length) { cleanup(); return; }
    const src = srcList[i++] + '?t=' + Date.now();
    vMon.src = src;
    vBg.src  = src;
  };

  // 자동재생 보정
  let userGestureArmed = false;
  const ensurePlay = () => {
    vMon.play().catch(() => {});
    vBg.play().catch(() => {});
    if (!userGestureArmed) {
      monitor.addEventListener('click', () => { vMon.play().catch(()=>{}); vBg.play().catch(()=>{}); }, { once: true });
      userGestureArmed = true;
    }
  };

  // 비율 동기(모니터 프레임)
  vMon.onloadedmetadata = () => syncAspect(vMon);

  // 둘 다 재생 가능 상태가 되면 토글 시작
  let ready = 0, inMonitor = true, syncTimer = null, toggleTimer = null;

  const begin = () => {
    if (++ready < 2) return;

    // 시작
    ensurePlay();

    // 드리프트 보정(두 영상 시간차 최소화)
    syncTimer = setInterval(() => {
      if (Math.abs(vMon.currentTime - vBg.currentTime) > 0.06) {
        try { vBg.currentTime = vMon.currentTime; } catch(e) {}
      }
    }, 80);

    // 0.2초 간격 토글
    toggleTimer = setInterval(() => {
      inMonitor = !inMonitor;
      if (inMonitor) {
        // **모니터 모드**: 배경은 ‘검정’만, 배경영상 숨김
        overlay.classList.remove('bgVideo');
        overlay.classList.add('mask');   // z-index 낮게, 검정만 유지
        vBg.style.display = 'none';
      } else {
        // **배경 모드**: 오버레이가 앞으로 올라와 전체화면 영상
        overlay.classList.remove('mask');
        overlay.classList.add('bgVideo'); // z-index 크게
        vBg.style.display = 'block';
      }
    }, interval);
  };

  vMon.oncanplay = begin;
  vBg.oncanplay  = begin;

  // 공통 정리
  const cleanup = () => {
    if (syncTimer)  clearInterval(syncTimer);
    if (toggleTimer) cl

}

/* close modals */
els('[data-close]').forEach(btn=> btn.addEventListener('click', ()=> btn.closest('dialog')?.close()));
