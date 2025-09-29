
# Header & Banner Dock v1
- 헤더 순서 재배치: 프로모션 · 쿠폰신청 · 프로모션참여 · 긴급쿠폰신청 · 문의 · 가입
- 중앙 모니터 상/하에 A/B 배너 표시 (A: p1~p3, B: p1-1~p3-1)
- 모니터 아래 빨간 Dock(▲ ▼ ◀ ▶): 위/아래 = A/B 포커스, 좌/우 = 이전/다음
- 쿠폰/긴급 영상 페이지에서는 Dock 자동 숨김

## 적용 방법
1) `css/header-and-dock.css` → `/css/`
2) `js/header-and-dock.js` → `/js/`
3) `index.html`의 `</body>` 직전에 추가:
<link rel="stylesheet" href="./css/header-and-dock.css">
<script src="./js/header-and-dock.js"></script>
