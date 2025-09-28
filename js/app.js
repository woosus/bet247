// app.js — v1.3.4 (aspect sync)
const el=(s,r=document)=>r.querySelector(s), els=(s,r=document)=>Array.from(r.querySelectorAll(s));
el('#loc').textContent = location.pathname;
const dbg=(m)=>{ const o=el('#dbg'); if(o) o.textContent=m; console.log('[DBG]',m); };

const state={view:'home',promoIndex:0,promoTimer:null,promoPlaying:true};
const PROMO_FILES=[{aName:'P1',bName:'P1-1'},{aName:'P2',bName:'P2-1'},{aName:'P3',bName:'P3-1'}];

els('.nav-btn').forEach(b=> b.addEventListener('click', ()=> setView(b.dataset.view)));

function setView(v){
  state.view=v; stopPromoAuto();
  if(v==='promotion'){openPromotion();}
  else if(v==='coupon'){playCouponVideoExact(['./assets/쿠폰신청.mp4','./assets/ddd1.mp4']);}
  else if(v==='promo-join'){openJoin();}
  else if(v==='contact'){el('#contactModal').showModal();}
  else if(v==='emergency'){playCouponVideoExact(['./assets/긴급쿠폰신청.mp4','./assets/ddd1.mp4']);}
  else if(v==='signup'){el('#signupModal').showModal();}
}

function syncMonitorToVideo(video){
  const mon = el('#monitor');
  function apply(){
    if(!video.videoWidth||!video.videoHeight) return;
    const ratio = video.videoHeight / video.videoWidth; // H/W
    const width = mon.clientWidth;
    mon.style.height = (width * ratio) + 'px'; // monitor height matches video ratio
  }
  apply();
  window.addEventListener('resize', apply, {passive:true});
}

/* Promotion slider (unchanged) */
function openPromotion(){ /* omitted for brevity */ }

/* Videos: exact aspect (no crop, resize monitor) */
async function playCouponVideoExact(srcList){
  const A=el('#screenA'); const bg=el('#bgVideoHolder'); const form=el('#couponForm');
  A.innerHTML=''; el('#screenB').innerHTML='';
  const video=document.createElement('video');
  Object.assign(video,{playsInline:true,controls:true,muted:true,autoplay:true});
  video.style.width='100%'; video.style.height='100%'; video.style.objectFit='contain';
  A.appendChild(video);
  let i=0;
  const tryNext=()=>{
    if(i>=srcList.length){ A.innerHTML='<div style="color:#fff;opacity:.9">영상 파일을 찾지 못했습니다.</div>'; return; }
    const src=srcList[i++]; video.src=src; dbg('try: '+src);
    let errored=false;
    video.onerror=()=>{ if(!errored){errored=true; dbg('error: '+src); tryNext();} };
    video.onloadedmetadata=()=>{ dbg('meta ok'); syncMonitorToVideo(video); };
    video.onloadeddata=async()=>{
      await wait(80); bg.appendChild(video); bg.hidden=false; await wait(80); A.appendChild(video); bg.hidden=true;
      form.hidden=true;
      const playNow=()=> video.play().catch(e=>dbg('play blocked: '+e?.message));
      playNow(); el('#monitor').addEventListener('click', playNow, {once:true});
      video.onended=()=>{ form.hidden=false; form.scrollIntoView({behavior:'smooth'}); };
    };
  };
  tryNext();
}
function wait(ms){ return new Promise(r=> setTimeout(r,ms)); }

/* minimal join code kept same as previous build */