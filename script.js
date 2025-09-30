
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


// Video playback logic for 쿠폰신청 & 긴급쿠폰신청
function playVideoSequence(videoId, src) {
  const videoEl = document.getElementById(videoId);
  videoEl.src = src;
  videoEl.muted = true;
  videoEl.currentTime = 0;
  videoEl.style.display = "block";
  videoEl.classList.add("monitor-video");

  let step = 0;
  const interval = setInterval(() => {
    if (step % 2 === 0) {
      // monitor mode
      videoEl.classList.add("monitor-video");
      videoEl.style.zIndex = 10000;
    } else {
      // background mode
      videoEl.classList.remove("monitor-video");
      videoEl.style.zIndex = 9999;
    }
    step++;
  }, 200);

  videoEl.play();
  videoEl.onended = () => {
    clearInterval(interval);
    videoEl.style.display = "none";
    videoEl.src = "";
  };
}

// Attach handlers (assuming buttons exist with ids)
document.addEventListener("DOMContentLoaded", () => {
  const couponBtn = document.getElementById("couponBtn");
  const urgentBtn = document.getElementById("urgentBtn");
  if (couponBtn) {
    couponBtn.addEventListener("click", () => {
      playVideoSequence("couponVideo", "assets/쿠폰신청.mp4");
    });
  }
  if (urgentBtn) {
    urgentBtn.addEventListener("click", () => {
      playVideoSequence("urgentVideo", "assets/긴급쿠폰신청.mp4");
    });
  }
});
