
// header-and-dock.js — header order + A/B banner slider + triangle dock
(function(){
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

  /* ---------- 1) Header order ---------- */
  const order = ['promotion','coupon','promo-join','emergency','contact','signup'];
  const nodes = order.map(v => document.querySelector(`[data-view="${v}"]`)).filter(Boolean);
  if(nodes.length){
    const parent = nodes[0].parentNode;
    nodes.forEach(n => parent.appendChild(n));
  }

  /* ---------- 2) Banner images & dock ---------- */
  const IMG_EXTS = ['.png','.PNG','.jpg','.JPG','.jpeg','.JPEG','.webp','.WEBP'];
  const A_NAMES = ['p1','p2','p3'];
  const B_NAMES = ['p1-1','p2-1','p3-1'];
  let idx = 0, focus = 'A';

  function tryLoad(base, cb){
    let i=0;
    const img = new Image();
    const tryNext = () => {
      if(i >= IMG_EXTS.length){ cb(null); return; }
      const url = `./assets/${base}${IMG_EXTS[i++]}` + '?t=' + Date.now();
      img.onload = () => cb(img);
      img.onerror = tryNext;
      img.src = url;
    };
    tryNext();
  }

  function mountDock(){
    const mon = $('#monitor');
    if(!mon) return;
    let dock = $('#bannerDock');
    if(!dock){
      dock = document.createElement('div');
      dock.id = 'bannerDock';
      dock.innerHTML = `<button class="tri up"    title="위 배너(A)"></button>
                        <button class="tri left"  title="이전"></button>
                        <button class="tri right" title="다음"></button>
                        <button class="tri down"  title="아래 배너(B)"></button>`;
      mon.insertAdjacentElement('afterend', dock);
    }
    dock.classList.add('show');
    dock.querySelector('.up').onclick   = ()=> setFocus('A');
    dock.querySelector('.down').onclick = ()=> setFocus('B');
    dock.querySelector('.left').onclick = ()=> setIndex(idx-1);
    dock.querySelector('.right').onclick= ()=> setIndex(idx+1);
  }

  function setFocus(f){
    focus = f;
    const mon = $('#monitor');
    if(!mon) return;
    mon.classList.remove('focusA','focusB');
    mon.classList.add(f==='A'?'focusA':'focusB');
  }

  function setIndex(n){
    idx = (n + A_NAMES.length) % A_NAMES.length;
    renderAB();
  }

  function renderAB(){
    const Ahost = $('#screenA')||$('#layerA');
    const Bhost = $('#screenB')||$('#layerB');
    if(Ahost){
      Ahost.innerHTML='';
      tryLoad(A_NAMES[idx], (img)=>{
        if(img) Ahost.appendChild(img); else Ahost.textContent='A 배너가 없습니다';
      });
    }
    if(Bhost){
      Bhost.innerHTML='';
      tryLoad(B_NAMES[idx], (img)=>{
        if(img) Bhost.appendChild(img); else Bhost.textContent='B 배너가 없습니다';
      });
    }
  }

  function showDockWhenAppropriate(v){
    const dock = $('#bannerDock');
    if(!dock) return;
    // hide when playing videos
    if(v==='coupon' || v==='emergency'){ dock.style.display='none'; return; }
    dock.style.display='flex';
  }

  // initial mount
  document.addEventListener('DOMContentLoaded', ()=>{
    mountDock();
    setIndex(0);
    setFocus('A');
  });

  // integrate with setView if present
  if (window.__Bet3 && typeof window.__Bet3.setView === 'function'){
    const orig = window.__Bet3.setView;
    window.__Bet3.setView = function(v){
      const r = orig.apply(this, arguments);
      showDockWhenAppropriate(v);
      return r;
    };
  }
  // also listen to header clicks
  document.addEventListener('click', (e)=>{
    const b = e.target.closest('[data-view]');
    if(!b) return;
    showDockWhenAppropriate(b.dataset.view);
  });
})();
