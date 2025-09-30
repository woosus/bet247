// app.js — v1.3.6-fix (single-file drop-in)
// ✅ What it does:
// - Video never crops (object-fit: contain)
// - Monitor aspect matches video (onloadedmetadata)
// - Coupon/Emergency look for many filenames: 한글/영문/대문자/ddd1
// - 0.2s zig-zag: monitor ↔ full-screen overlay until video end
const el=(s,r=document)=>r.querySelector(s), els=(s,r=document)=>Array.from(r.querySelectorAll(s));
const dbg=(m)=>{ const o=el('#dbg'); if(o) o.textContent=m; console.log('[DBG]',m); };

let zigTimer=null;
function setView(v){
  stopZig();
  if(v==='coupon'){ playZigzag(makeSources(['쿠폰신청','coupon','COUPON','Coupon'])); }
  if(v==='emergency'){ playZigzag(makeSources(['긴급쿠폰신청','emergency','EMERGENCY','Emergency'])); }
}
function makeSources(bases){
  const exts=['.mp4','.MP4']; const list=[];
  bases.forEach(b=> exts.forEach(e=> list.push(`./assets/${b}${e}`)));
  list.push('./assets/ddd1.mp4','./assets/DDD1.MP4');
  return list;
}
function stopZig(){ if(zigTimer){clearInterval(zigTimer);zigTimer=null;} const ov=el('#videoOverlay'); if(ov) ov.classList.remove('show'); }
function syncMonitorAspect(video){ const mon=el('#monitor'); if(video?.videoWidth&&video?.videoHeight){ mon.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`; } }

async function playZigzag(srcList, interval=200){
  const A=el('#screenA')||el('#layerA')||el('#screenA'); // support both layouts
  const overlay=el('#videoOverlay')||el('#overlay');
  if(!A){ alert('screenA 영역이 없습니다'); return; }
  stopZig(); A.innerHTML='';
  const video=document.createElement('video');
  Object.assign(video,{playsInline:true,controls:false,muted:true,autoplay:true});
  Object.assign(video.style,{width:'100%',height:'100%',objectFit:'contain',background:'#000'});
  let i=0;
  const tryNext=()=>{
    if(i>=srcList.length){ A.innerHTML='<div style="color:#fff;opacity:.9;padding:12px">영상 파일을 찾지 못했습니다.</div>'; return; }
    const src = srcList[i++] + '?t=' + Date.now(); // cache bust
    video.src=src; dbg('try: '+src);
    let errored=false;
    video.onerror=()=>{ if(!errored){errored=true;dbg('error: '+src);tryNext();} };
    video.onloadedmetadata=()=> syncMonitorAspect(video);
    video.onloadeddata=()=>{
      A.appendChild(video);
      let inMonitor=true;
      if(overlay){
        zigTimer=setInterval(()=>{
          inMonitor=!inMonitor;
          if(inMonitor){ overlay.classList.remove('show'); A.appendChild(video); }
          else { overlay.innerHTML=''; overlay.appendChild(video); overlay.classList.add('show'); }
        }, interval);
      }
      const playNow=()=> video.play().catch(e=>dbg('play blocked: '+(e?.message||'blocked')));
      playNow(); (el('#monitor')||document.body).addEventListener('click', playNow, {once:true});
    };
    video.onended=()=>{ stopZig(); };
  };
  tryNext();
}

// Wire default nav buttons if present
['coupon','emergency'].forEach(id=>{
  const btn = document.querySelector(`[data-view="${id}"], [data-act="${id}"]`);
  if(btn){ btn.addEventListener('click', ()=> setView(id)); }
});

// expose for console
window.__Bet3 = { setView, playZigzag, makeSources };
console.log('app.js v1.3.6-fix loaded');
