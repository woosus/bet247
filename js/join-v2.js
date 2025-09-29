
// join-v2.js — 가입 플로우(3단계) + 설문(문항별 순차/중앙 A·B 교차) + 프로모션참여 하위버튼 LNB 효과
(function(){
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

  /* ---------- JOIN MODAL (3-step) ---------- */
  let modal = $('#signupModal');
  if(!modal){
    modal = document.createElement('dialog');
    modal.id = 'signupModal';
    modal.className = 'modal signup-modal';
    modal.innerHTML = `
      <div class="body">
        <button class="close" data-close>×</button>
        <div class="signup-steps" id="steps">
          <div class="panel" data-step="1">
            <h4>비공식 파트너 쿠폰 서비스</h4>
            <div class="grid2">
              <div><label>아이디</label><input class="input" id="sf_id" placeholder="아이디"></div>
              <div><label>연락처</label><input class="input" id="sf_tel" placeholder="연락처"></div>
              <div><label>성함</label><input class="input" id="sf_name" placeholder="성함"></div>
              <div><label>링크</label><div class="note"><a href="https://www.bet33.online/?a=57991" target="_blank">https://www.bet33.online/?a=57991</a></div></div>
            </div>
            <div class="btns"><button class="btnp" data-next="2">다음</button></div>
          </div>
          <div class="panel" data-step="2" hidden>
            <h4>가입을 축하드립니다</h4>
            <div class="hint">
              쿠폰 사용전 게임스타일과 게임 종목의 선호도를 체크해서 쿠폰금액이 입금 없이 사용가능한 1~5만원까지 지급됩니다.
              원치 않으시면 패스하셔도 됩니다.
            </div>
            <div class="btns"><button class="btnp" data-prev="1">이전</button><button class="btnp" id="btnStartSurvey">쿠폰받기</button></div>
          </div>
          <div class="panel okmsg" data-step="4" hidden>
            <h4>접수되었습니다</h4>
            <div class="hint">작성하신 선호도는 저장되었으며, 쿠폰은 빠르게 지급해드립니다.</div>
            <div class="btns"><button class="btnp" data-close>닫기</button></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  function go(n){ $$('.panel[data-step]').forEach(p=> p.hidden = Number(p.dataset.step)!==n); }
  modal.addEventListener('click',(e)=>{ if(e.target.dataset.close!==undefined || e.target.closest('[data-close]')) modal.close(); });
  $$('[data-next]', modal).forEach(b=> b.addEventListener('click', ()=> go(Number(b.dataset.next))));
  $$('[data-prev]', modal).forEach(b=> b.addEventListener('click', ()=> go(Number(b.dataset.prev))));

  const btnSignup = document.querySelector('[data-act="signup"], [data-view="signup"]');
  if(btnSignup){ btnSignup.addEventListener('click', (e)=>{ e.preventDefault(); modal.showModal(); go(1); }); }
  $('#btnStartSurvey', modal)?.addEventListener('click', ()=>{ modal.close(); startSurvey(); });

  /* ---------- SURVEY (문항별 순차, A/B 교차 표출) ---------- */
  const Q = [
    { title:'선호하시는 게임', opts:['스포츠','카지노','슬롯'] },
    { title:'일주일 평균 이용 횟수', opts:['2회','4회 이상','6회 이상'] },
    { title:'1회 평균 충전금액', opts:['5만원 이상','10만원 이상','20만원 이상'] },
    { title:'최근 한달내 24시간 기준 충전을 가장 많이 해본 횟수', opts:['4회 이상','7회 이상','10회 이상'] },
    { title:'최근 한달내 장 크게 한 1회 충전금액', opts:['10만원 이상','50만원 이상','100만원 이상'] },
    { title:'안전한 곳이라면 10만원 입금 시, 입금보너스로 어느 수준이면 바로 충전?', opts:['20% 이상','30% 이상','40% 이상','50% 이상'] },
    { title:'통상 이벤트 제외, 유·무료 재미 쿠폰/다양한 이벤트 소식', opts:['알려달라','필요없다','필요할 때 내가 찾겠다'] },
    { title:'오늘 10만원 입금 가능 여부 (강요 아님)', opts:['하늘이 두 쪽 나도 입금','잘 모르겠다','오늘은 힘들다'] }
  ];
  const finishText = '수고하셨습니다. 형님들의 선호도와 스타일에 맞춰 최대한 즐거운 시간 보내시도록 돕겠습니다. 쿠폰은 작성하셨으면 당일내 빠르게 지급하겠습니다.';

  function renderQuestion(idx, place){
    const host = place==='A' ? (document.getElementById('layerA')||document.getElementById('screenA')) :
                               (document.getElementById('layerB')||document.getElementById('screenB'));
    if(!host) return;
    host.innerHTML = '';
    if(idx>=Q.length){
      const box = document.createElement('div');
      box.className='question';
      box.innerHTML = `<h5>완료</h5><div>${finishText}</div>`;
      host.appendChild(box);
      // 완료 시 2초 후 안내 모달 열기
      setTimeout(()=>{ modal.showModal(); go(4); }, 1200);
      return;
    }
    const q = Q[idx];
    const box = document.createElement('div');
    box.className = 'question';
    const choices = q.opts.map((t,i)=>`<label><input type="checkbox" name="q${idx}" value="${i+1}"><span>${i+1}. ${t}</span></label>`).join('');
    box.innerHTML = `<h5>${idx+1}. ${q.title}</h5><div class="choices">${choices}</div><div class="nextwrap"><button class="btnp next">다음</button></div>`;
    host.appendChild(box);
    box.querySelector('.next').addEventListener('click', ()=>{
      const checked = Array.from(box.querySelectorAll('input[type="checkbox"]:checked')).map(x=>x.value);
      if(checked.length===0){ box.querySelector('.next').textContent='하나 이상 체크해주세요'; setTimeout(()=> box.querySelector('.next').textContent='다음', 900); return; }
      try{
        const data = JSON.parse(localStorage.getItem('bet33_survey')||'{}');
        data['q'+(idx+1)] = checked;
        localStorage.setItem('bet33_survey', JSON.stringify(data));
      }catch(_){}
      // 다음 문항은 반대 영역에 렌더
      renderQuestion(idx+1, place==='A'?'B':'A');
    });
  }
  function startSurvey(){
    try{ localStorage.removeItem('bet33_survey'); }catch(_){}
    // 1번은 A 영역부터
    renderQuestion(0,'A');
  }

  /* ---------- 프로모션참여 하위 버튼: LNB 효과 ---------- */
  // 대상: #joinModal 안의 .bar.sub 요소들이 있다고 가정. 없으면 생성하지 않고 스킵.
  const join = document.getElementById('joinModal');
  if(join){
    const mid = document.getElementById('midBar');
    const wrap = document.getElementById('subBars');
    if(mid && wrap){
      // 스타일 클래스 부여
      wrap.classList.add('join-sub-wrap');
      wrap.querySelectorAll('.bar.sub').forEach(el=>{
        el.classList.add('item');
        el.classList.remove('bar','sub'); // 시각 통일
      });
      wrap.classList.add('join-sub');
      // 토글(아코디언)
      mid.addEventListener('click', ()=> wrap.classList.toggle('is-open'));
      // 액티브 인디케이터
      wrap.querySelectorAll('.item').forEach(it=>{
        it.addEventListener('click', ()=>{
          wrap.querySelectorAll('.item').forEach(x=> x.classList.remove('is-active'));
          it.classList.add('is-active');
        });
      });
    }
  }
})();