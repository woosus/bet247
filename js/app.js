// app.js — v1.3.5
const el=(s,r=document)=>r.querySelector(s), els=(s,r=document)=>Array.from(r.querySelectorAll(s));
el('#loc').textContent = location.pathname;
const dbg=(m)=>{ const o=el('#dbg'); if(o) o.textContent=m; console.log('[DBG]',m); };

// nav actions
els('.nav-btn').forEach(b=> b.addEventListener('click', ()=> setView(b.dataset.view)));
function setView(v){
  if(v==='coupon'){playVideoExact(['./assets/쿠폰신청.mp4','./assets/ddd1.mp4']);}
  else if(v==='emergency'){playVideoExact(['./assets/긴급쿠폰신청.mp4','./assets/ddd1.mp4']);}
  else { alert(v+' 화면은 데모에선 생략'); }
}

// ✅ 영상 비율에 맞춰 모니터 aspect-ratio 업데이트 (자르지 않음)
function syncMonitorAspect(video){
  const mon = el('#monitor');
  if(video.videoWidth && video.videoHeight){
    mon.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
  }
}

// ✅ 노크롭 재생 + 메타데이터 로드되면 모니터 비율 동기화
async function playVideoExact(srcList){
  const A=el('#screenA'); const B=el('#screenB');
  A.innerHTML=''; B.innerHTML='';
  const video=document.createElement('video');
  Object.assign(video,{playsInline:true,controls:true,muted:true,autoplay:true});
  video.style.width='100%'; video.style.height='100%'; video.style.objectFit='contain';
  A.appendChild(video);
  let i=0;
  const tryNext=()=>{
    if(i>=srcList.length){ A.innerHTML='<div style="color:#fff;opacity:.85;padding:10px">영상 파일을 찾지 못했습니다.</div>'; return; }
    const src=srcList[i++]; video.src=src; dbg('try: '+src);
    let errored=false;
    video.onerror=()=>{ if(!errored){errored=true; dbg('error: '+src); tryNext();} };
    video.onloadedmetadata=()=>{ dbg('meta ok'); syncMonitorAspect(video); };  // 여기서 모니터 비율 동기화
    video.onloadeddata=()=>{ video.play().catch(e=>dbg('play blocked: '+e?.message)); };
  };
  tryNext();
}
