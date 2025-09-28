// app.js — v1.3.1
const el=(s,r=document)=>r.querySelector(s), els=(s,r=document)=>Array.from(r.querySelectorAll(s));
const state={view:'home',promoIndex:0,promoTimer:null,promoPlaying:true};

const PROMO_FILES=[{aName:'P1',bName:'P1-1'},{aName:'P2',bName:'P2-1'},{aName:'P3',bName:'P3-1'}];

els('.nav-btn').forEach(b=> b.addEventListener('click', ()=> setView(b.dataset.view)));

function setView(v){
  state.view=v; stopPromoAuto();
  if(v==='promotion'){openPromotion();}
  else if(v==='coupon'){playCouponVideo('./assets/쿠폰신청.mp4');}
  else if(v==='promo-join'){openJoin();}
  else if(v==='contact'){el('#contactModal').showModal();}
  else if(v==='emergency'){playCouponVideo('./assets/긴급쿠폰신청.mp4');}
  else if(v==='signup'){el('#signupModal').showModal();}
}

const controlDock=el('#controlDock');
controlDock.querySelector('.left').addEventListener('click', ()=>{ if(!el('#promoModal').open) setView('promotion'); prevPromo(); });
controlDock.querySelector('.right').addEventListener('click', ()=>{ if(!el('#promoModal').open) setView('promotion'); nextPromo(); });
controlDock.querySelector('.up').addEventListener('click', ()=> setView('promotion'));
controlDock.querySelector('.down').addEventListener('click', ()=> setView('coupon'));
controlDock.querySelector('.play').addEventListener('click', ()=>{
  state.promoPlaying=!state.promoPlaying;
  el('.ctrl.play').textContent= state.promoPlaying ? '■':'▶';
  if(state.promoPlaying) startPromoAuto(); else stopPromoAuto();
});

/* Promotion slider */
function openPromotion(){ renderPromoSlide(false); el('#promoModal').showModal(); startPromoAuto(); }
function startPromoAuto(){ if(state.promoTimer||!state.promoPlaying) return; state.promoTimer=setInterval(nextPromo,5000); }
function stopPromoAuto(){ if(state.promoTimer){clearInterval(state.promoTimer); state.promoTimer=null;} }
function prevPromo(){ state.promoIndex = (state.promoIndex-1+PROMO_FILES.length)%PROMO_FILES.length; renderPromoSlide(true); }
function nextPromo(){ state.promoIndex = (state.promoIndex+1)%PROMO_FILES.length; renderPromoSlide(true); }
function renderPromoSlide(manual){
  const s=PROMO_FILES[state.promoIndex], a=el('#promoA'), b=el('#promoB'); a.innerHTML=''; b.innerHTML='';
  const aCard=makeImageCard('./assets/', s.aName, ['.png','.jpg','.jpeg','.webp']);
  const bCard=makeImageCard('./assets/', s.bName, ['.png','.jpg','.jpeg','.webp']);
  animateCard(aCard,-30); animateCard(bCard,30); a.appendChild(aCard); b.appendChild(bCard);
}
function makeImageCard(basePath, baseName, extList){
  const wrap=document.createElement('div'); wrap.className='promo-card';
  const img=document.createElement('img'); img.alt=baseName;
  const bases=[baseName, baseName.toLowerCase(), baseName.toUpperCase()];
  let bi=0, ei=0;
  function tryNext(){
    if(bi>=bases.length){ wrap.textContent=baseName+' (이미지 없음)'; wrap.style.padding='28px'; wrap.style.background='#eaf2ff'; return; }
    img.src = basePath + bases[bi] + extList[ei];
    img.onerror=()=>{ ei++; if(ei>=extList.length){bi++; ei=0;} tryNext(); };
    img.onload=()=> wrap.appendChild(img);
  } tryNext(); return wrap;
}
function animateCard(card, fromY){ card.animate([{transform:`translateY(${fromY}%)`,opacity:.0},{transform:'translateY(0)',opacity:1}],{duration:1500,easing:'cubic-bezier(.12,.64,.22,1)'}); }

/* Videos */
async function playCouponVideo(src){
  const video=document.createElement('video'); video.playsInline=true; video.controls=false; video.muted=false; video.autoplay=true;
  video.src=src; const A=el('#screenA'); const bg=el('#bgVideoHolder'); const form=el('#couponForm');
  A.innerHTML=''; el('#screenB').innerHTML=''; A.appendChild(video); await wait(200); bg.appendChild(video); bg.hidden=false; await wait(200); A.appendChild(video); bg.hidden=true;
  form.hidden=true; video.onended=()=>{ form.hidden=false; form.scrollIntoView({behavior:'smooth'}); }; video.play().catch(()=>{});
}
el('#couponForm').addEventListener('submit', e=>{ e.preventDefault(); const vid=el('#monitor video'); if(vid){try{vid.pause();}catch(e){}} el('#couponForm').hidden=true; alert('접수되었습니다.'); });
function wait(ms){ return new Promise(r=> setTimeout(r,ms)); }

/* Join inline */
const joinInline = el('#joinInline');
const joinMid = el('#joinMid');
const joinSubWrap = el('#joinSubWrap');
const joinDetail = el('#joinDetail');
let selectedSub=null;

function openJoin(){ if(joinInline) joinInline.hidden=false; collapseSubs(); joinDetail.innerHTML='<div class="note">좌측에서 카테고리를 선택하세요.</div>'; }
function collapseSubs(keep=null){
  joinSubWrap.classList.remove('open');
  els('.bar.sub', joinSubWrap).forEach(b=>{
    if(keep && b.dataset.sub===keep){ b.style.display='block'; b.classList.add('show'); }
    else { b.style.display='none'; b.classList.remove('show'); }
  });
}
function expandSubs(stagger=true){
  joinSubWrap.classList.add('open');
  const subs=els('.bar.sub', joinSubWrap);
  subs.forEach((b,i)=>{
    if(selectedSub && b.dataset.sub===selectedSub) return;
    b.style.display='block';
    if(stagger){ b.classList.remove('show'); setTimeout(()=>b.classList.add('show'), i*120); }
    else { b.classList.add('show'); }
  });
  if(selectedSub){
    const keep=subs.find(x=> x.dataset.sub===selectedSub);
    if(keep){ keep.style.display='block'; keep.classList.add('show','is-active'); }
  }
}
joinMid.addEventListener('click', ()=>{ if(joinSubWrap.classList.contains('open')) collapseSubs(selectedSub); else expandSubs(true); });
els('.bar.sub', joinSubWrap).forEach(b=> b.addEventListener('click', ()=>{
  els('.bar.sub', joinSubWrap).forEach(x=> x.classList.remove('is-active'));
  b.classList.add('is-active'); selectedSub=b.dataset.sub; collapseSubs(selectedSub); renderJoinDetail(selectedSub);
}));
function renderJoinDetail(key){
  const MAP={
    j1:{title:'30% 즉시 보너스 신청',guide:`형님 가슴아프시죠. 조금은 보탬이 되실겁니다.
최초입금/마지막입금 시간을 남겨주시면 재입금 시 즉시 지급되도록
빳빳한 쿠폰으로 준비하겠습니다.`,fields:[{name:'firstTime',label:'최초입금 시간'},{name:'lastTime',label:'마지막입금 시간'},{name:'contact',label:'연락처'}]},
    j2:{title:'프리스핀 100% 보너스참여',guide:`입금 후 다른 게임을 하지 않으셨다면, 10분 내 원하시는 게임의
프리스핀을 구매하여 진행하세요. (겜블 포함 게임은 제외될 수 있습니다.)`,fields:[{name:'game',label:'게임(게임사/이름)'},{name:'time',label:'구매 시간'},{name:'contact',label:'연락처'}]},
    j3:{title:'프리스핀 100% 보너스당첨',guide:`게임사/게임이름/시간을 남겨주시면 확인 후 손실난 금액을
쿠폰으로 준비해 문자로 드립니다. 조심—쿠폰이 너무 빳빳합니다.`,fields:[{name:'provider',label:'게임사'},{name:'title',label:'게임 이름'},{name:'time',label:'진행 시간'},{name:'contact',label:'연락처'}]},
    j4:{title:'300배 이상 보너스 당첨',guide:`축하드립니다! 당첨 시간과 게임사/게임이름을 남겨주시면
확인 후 즉시 지급합니다.`,fields:[{name:'provider',label:'게임사'},{name:'title',label:'게임 이름'},{name:'winTime',label:'당첨 시간'},{name:'contact',label:'연락처'}]}
  };
  const data=MAP[key]; const wrap=document.createElement('div');
  wrap.innerHTML=`<h4>${data.title}</h4>
  <p class="note">${data.guide.replaceAll('\\n','<br/>')}</p>
  <div class="fields">${data.fields.map(f=>`<label>${f.label}<input name="${f.name}" placeholder="${f.label}"/></label>`).join('')}
    <label>내용(선택)<textarea name="desc" placeholder="상세 내용(선택)"></textarea></label>
  </div>
  <div class="actions"><button class="btn" id="btnApplyJoin">신청</button></div>`;
  joinDetail.innerHTML=''; joinDetail.appendChild(wrap);
  wrap.animate([{opacity:.0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:260,easing:'ease-out'});
  el('#btnApplyJoin').onclick=()=> alert('신청이 접수되었습니다. 확인 후 연락드리겠습니다.');
}

/* close buttons */
els('[data-close]').forEach(btn=> btn.addEventListener('click', ()=> btn.closest('dialog')?.close()));