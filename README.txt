
# PPT-EXACT Upgrade v2
- 가입하기: 3단계 위저드 + "쿠폰받기" 클릭 시 중앙 모니터 A/B에 문항을 **한 문제씩 교차** 표출.
  - 1번은 A, 2번은 B, 3번은 A…
  - 각 문항은 **체크박스**로 응답(1개 이상 필수), 다음 클릭 시 다음 문항으로 진행.
  - 응답은 `localStorage.bet33_survey`에 저장(데모).
  - 모든 문항 완료 시 완료 문구 출력 후 "접수되었습니다" 화면.
- 프로모션참여: 중분류 클릭 시 하위 버튼에 **LNB 효과**(slide-in-left / active-indicator / accordion) 적용.

## 적용 방법
1) `css/join-v2.css` → `/css/`
2) `js/join-v2.js` → `/js/`
3) `index.html`의 `</body>` 바로 위에 추가:
<link rel="stylesheet" href="./css/join-v2.css">
<script src="./js/join-v2.js"></script>
