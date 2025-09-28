// app.js — 133 프로젝트 v1.2
const el = (sel, root=document) => root.querySelector(sel);
const els = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const state = {
  view: 'home',
  promoIndex: 0,
  promoTimer: null,
  promoPlaying: true,

  // Signup stages
  signupStage: 'info', // 'info' -> 'congrats' -> 'qa'
  qaStep: 1, // 1..8
  qaAnswers: {}, // {1:[...],2:[...]}
};

// Promotion image pairs: A uses P1..P3, B uses P1-1..P3-1 with auto extension try
const PROMO_FILES = [
  { aName: 'P1', bName: 'P1-1' },
  { aName: 'P2', bName: 'P2-1' },
  { aName: 'P3', bName: 'P3-1' },
];

// QA script (exact wordings from 제공 문서)
const QA = [
  { no:1, title:'선호하시는 게임 :', opts:['1. 스포츠','2. 카지노','3. 슬롯'] },
  { no:2, title:'일주일 평균 이용 횟수 :', opts:['1. 2회','2. 4회이상','3. 6회이상'] },
  { no:3, title:'1회 평균 충전금액 :', opts:['1. 5만원 이상','2. 10만원이상','3. 20만원이상'] },
  { no:4, title:'최근 한달내에서 24시간기준 충전을 가장많이 해본 횟수', opts:['1. 4회이상해봤다','2. 7회이상해봤다','3. 10회이상해봤다.'] },
  { no:5, title:'최근 한달내에서 장크게한 1회충전금액은?', opts:['1. 10만원이상','2. 50만원이상','3. 100만원이상'] },
  { no:6, title:'안전한곳이라고 가정했을때 10만원 입금시 입금보너스로 얼마가 지급된다면 묻지도따지지도않고 일단 충전하고 볼수있다고 생각하는금액은?', opts:['1. 20%이상','2. 30%이상','3. 40%이상','4. 50%이상'] },
  { no:7, title:'입금시 적용되는 통상적인 이벤트는 제외하고 유/무료 재미난 쿠폰 다양한 이벤트등의 소식을 알려드릴까요?', opts:['1. 알려달라','2. 필요없다.','3. 필요할때 내가 알아서 찾아보겠다'] },
  { no:8, title:'형님 진심으로 말씀드리는데 오늘 10만원혹시 입금되시겠습니까? 강요는 절대아니고.. 저의바람이랄까..', opts:['1. 하늘두쪽나도입금한다.','2. 잘 모르겠다.','3. 오늘은 힘들다'] },
];

// Elements
const body = document.body;
const screenA = el('#screenA');
const screenB = el('#screenB');
const promoModal = el('#promoModal');
const joinModal = el('#joinModal');
const contactModal = el('#contactModal');
const signupModal = el('#signupModal');
const bgHolder = el('#bgVideoHolder');
const qaOverlay = el('#qaOverlay');
const qaBodyA = el('#qaBodyA');
const qaBodyB = el('#qaBodyB');
const controlDock = el('#controlDock');

/* Views */
function setView(v){
  state.view = v;
  stopPromoAuto();

  switch(v){
    case 'promotion':
      body.classList.remove('mode-default'); body.classList.add('mode-promo');
      openPromotion();
      break;
    case 'coupon':
      body.classList.remove('mode-promo'); body.classList.add('mode-default');
      playCouponVideo('./assets/쿠폰신청.mp4');
      break;
    case 'promo-join':
      body.classList.remove('mode-promo'); body.classList.add('mode-default');
      openJoin();
      break;
    case 'contact':
      body.classList.remove('mode-promo'); body.classList.add('mode-default');
      openContact();
      break;
    case 'emergency':
      body.classList.remove('mode-promo'); body.classList.add('mode-default');
      playCouponVideo('./assets/긴급쿠폰신청.mp4');
      break;
    case 'signup':
      body.classList.remove('mode-promo'); body.classList.add('mode-default');
      openSignup();
      break;
    default:
      body.classList.remove('mode-promo'); body.classList.add('mode-default');
  }
}
els('.nav-btn').forEach(b=> b.addEventListener('click', ()=> setView(b.dataset.view)));

/* Control dock */
controlDock.querySelector('.left').addEventListener('click', ()=>{ if (!promoModal.open) setView('promotion'); prevPromo(); });
controlDock.querySelector('.right').addEventListener('click', ()=>{ if (!promoModal.open) setView('promotion'); nextPromo(); });
controlDock.querySelector('.up').addEventListener('click', ()=> setView('promotion'));
controlDock.querySelector('.down').addEventListener('click', ()=> setView('coupon'));
controlDock.querySelector('.play').addEventListener('click', ()=>{
  state.promoPlaying = !state.promoPlaying;
  el('.ctrl.play').textContent = state.promoPlaying ? '■' : '▶';
  if (state.promoPlaying) startPromoAuto(); else stopPromoAuto();
});

/* Promotion */
function openPromotion(){ renderPromoSlide(false); promoModal.showModal(); startPromoAuto(); }
promoModal.addEventListener('close', stopPromoAuto);
function startPromoAuto(){ if (state.promoTimer || !state.promoPlaying) return; state.promoTimer = setInterval(nextPromo, 5000); }
function stopPromoAuto(){ if (state.promoTimer){ clearInterval(state.promoTimer); state.promoTimer = null; } }
function prevPromo(){ state.promoIndex = (state.promoIndex - 1 + PROMO_FILES.length) % PROMO_FILES.length; renderPromoSlide(true); }
function nextPromo(){ state.promoIndex = (state.promoIndex + 1) % PROMO_FILES.length; renderPromoSlide(true); }
function renderPromoSlide(manual){
  const s = PROMO_FILES[state.promoIndex];
  const a = el('#promoA'); const b = el('#promoB');
  a.innerHTML = ''; b.innerHTML = '';
  const aCard = makeImageCard('./assets/', s.aName, ['.png','.jpg','.jpeg','.webp']);
  const bCard = makeImageCard('./assets/', s.bName, ['.png','.jpg','.jpeg','.webp']);
  animateCard(aCard, -30); animateCard(bCard, 30);
  a.appendChild(aCard); b.appendChild(bCard);
}
function makeImageCard(basePath, baseName, extList){
  const wrap = document.createElement('div'); wrap.className='promo-card';
  const img = document.createElement('img'); img.alt=baseName;

  // Try both exact, lowercase, uppercase base names with multiple extensions
  const baseCandidates = Array.from(new Set([baseName, baseName.toLowerCase(), baseName.toUpperCase()]));

  let b = 0, e = 0;

  function tryNext(){
    if (b >= baseCandidates.length){
      wrap.textContent = baseName + ' (이미지 없음)';
      wrap.style.padding = '28px'; wrap.style.background = '#eaf2ff';
      return;
    }
    const src = basePath + baseCandidates[b] + extList[e];
    img.src = src;
    img.onerror = ()=>{
      e++;
      if (e >= extList.length){ b++; e = 0; }
      tryNext();
    };
    img.onload = ()=> wrap.appendChild(img);
  }
  tryNext();
  return wrap;
}
function animateCard(card, fromY){
  card.animate([{transform:`translateY(${fromY}%)`, opacity:.0},{transform:'translateY(0)', opacity:1}], {duration:1500, easing:'cubic-bezier(.12,.64,.22,1)'});
}

/* Promo-Join */
function openJoin(){ joinModal.showModal(); el('#joinContent').textContent='좌측에서 항목을 선택하세요.'; }
els('.join-item').forEach(btn=> btn.addEventListener('click', ()=>{
  els('.join-item').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  const txt = btn.textContent + ' 안내가 표시됩니다.';
  const wrap = document.createElement('div'); wrap.style.padding='8px'; wrap.textContent=txt;
  const jc = el('#joinContent'); jc.innerHTML=''; jc.appendChild(wrap);
  wrap.animate([{transform:'scale(.96)', opacity:.0},{transform:'scale(1)', opacity:1}], {duration:350, easing:'ease-out'});
}));

/* Contact */
function openContact(){ contactModal.showModal(); }

/* Coupon/Emergency videos */
async function playCouponVideo(src){
  const video = document.createElement('video');
  video.playsInline = true; video.controls = false; video.muted = false; video.autoplay = true;
  video.style.width = '100%'; video.style.height = '100%'; video.style.objectFit = 'cover';
  video.src = src;
  screenA.innerHTML = ''; screenB.innerHTML = '';
  screenA.appendChild(video); await wait(200);
  el('#bgVideoHolder').appendChild(video); el('#bgVideoHolder').hidden=false; await wait(200);
  screenA.appendChild(video); el('#bgVideoHolder').hidden=true;
  el('#couponForm').hidden = true;
  video.onended = ()=>{ el('#couponForm').hidden=false; el('#couponForm').scrollIntoView({behavior:'smooth'}); };
  video.play().catch(()=>{});
}
el('#couponForm').addEventListener('submit', e=>{ e.preventDefault(); const vid=el('#monitor video'); if (vid){ try{ vid.pause(); }catch(e){} } el('body').classList.add('mode-default'); el('#couponForm').hidden=true; alert('접수되었습니다.'); });
function wait(ms){ return new Promise(r=> setTimeout(r, ms)); }

/* Signup (안내 → 축하 → 쿠폰받기→ QA on monitor) */
function openSignup(){
  state.signupStage = 'info'; state.qaStep = 1; state.qaAnswers = {};
  el('#signupInfo').hidden=false; el('#signupCongrats').hidden=true;
  signupModal.showModal();
  // Buttons
  el('#btnSignupGo').onclick = ()=>{
    state.signupStage = 'congrats';
    el('#signupInfo').hidden=true; el('#signupCongrats').hidden=false;
  };
  el('#btnCouponStart').onclick = ()=>{
    state.signupStage = 'qa';
    signupModal.close();
    startQA();
  };
}

function startQA(){
  // Reset
  state.qaStep = 1; state.qaAnswers = {};
  qaOverlay.hidden = false;
  renderQA(1); // Q1 in A
}

function renderQA(step){
  // Determine target area: odd -> A, even -> B
  const targetBody = (step % 2 === 1) ? qaBodyA : qaBodyB;
  const otherBody  = (step % 2 === 1) ? qaBodyB : qaBodyA;
  const item = QA.find(q=> q.no === step);
  if (!item){ finishQA(); return; }

  // Build question block with checkboxes (4지선다 규칙, but supports 3~4)
  const block = document.createElement('div');
  const h4 = document.createElement('h4'); h4.textContent = step + ' ' + item.title;
  const opts = document.createElement('div'); opts.className='opts';

  item.opts.forEach((opt, idx)=>{
    const id = `qa${step}_${idx}`;
    const lab = document.createElement('label');
    const cb = document.createElement('input'); cb.type='checkbox'; cb.id=id; cb.value=opt;
    cb.addEventListener('change', ()=>{
      // store multi selections
      const arr = state.qaAnswers[step] || [];
      if (cb.checked){ arr.push(opt); } else { const i = arr.indexOf(opt); if (i>=0) arr.splice(i,1); }
      state.qaAnswers[step] = Array.from(new Set(arr));
      // When any selection exists, render next question (once)
      if (state.qaAnswers[step].length > 0 && !QA_DONE.has(step)){
        QA_DONE.add(step);
        renderQA(step+1);
      }
    });
    const sp = document.createElement('span'); sp.textContent = opt;
    lab.appendChild(cb); lab.appendChild(sp);
    opts.appendChild(lab);
  });

  block.appendChild(h4); block.appendChild(opts);

  // If first time on this area, clear then place
  if (targetBody.childElementCount === 0 || step <= 2){
    targetBody.innerHTML = '';
  }
  targetBody.appendChild(block);
  block.animate([{opacity:.0, transform:'translateY(6px)'},{opacity:1, transform:'none'}], {duration:260, easing:'ease-out'});
}

const QA_DONE = new Set();

function finishQA(){
  // After last question selection → final message
  const msg = document.createElement('div');
  msg.innerHTML = `<h4>수고하셨습니다.</h4>
  <p>형님들의 선호도와 스타일에 맞게 최대한 즐거운 시간을 오래 뵐 수 있었으면 좋겠습니다.<br/>
  부자시라면 나이상관없이 형님으로 모시겠습니다.<br/>
  그리고 쿠폰은 작성하셨으면 당일내로 빠르게 지급해드리겠습니다. 감사합니다.</p>`;
  // Put message into B area
  qaBodyB.innerHTML = '';
  qaBodyB.appendChild(msg);
  msg.animate([{opacity:.0, transform:'translateY(6px)'},{opacity:1, transform:'none'}], {duration:300, easing:'ease-out'});
}

/* Dialog close buttons */
els('[data-close]').forEach(btn=> btn.addEventListener('click', ()=> btn.closest('dialog')?.close()));