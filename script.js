
const btnbar = document.querySelector('.btnbar');
btnbar?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.tri-btn');
  if(!btn) return;
  btn.classList.add('is-active');
  setTimeout(()=>btn.classList.remove('is-active'), 220);
  onAnswer(parseInt(btn.dataset.answer,10));
});
function onAnswer(value){
  console.log('선택 값:', value);
}
const video = document.getElementById('promoVideo');
const fallback = document.getElementById('videoFallback');
const tryBtn = document.getElementById('tryPlay');
async function ensurePlayback(){
  if(!video) return;
  video.muted = true;
  try{
    await video.play();
    fallback?.classList?.add('hidden');
  }catch(err){
    console.warn('자동재생 차단/오류:', err);
    fallback?.classList?.remove('hidden');
  }
}
video?.addEventListener('canplay', ensurePlayback);
video?.addEventListener('error', ()=>{ fallback?.classList?.remove('hidden'); });
tryBtn?.addEventListener('click', async ()=>{ try{ await video.play(); fallback?.classList?.add('hidden'); }catch(e){} });
ensurePlayback();
