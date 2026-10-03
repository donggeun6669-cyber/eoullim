// ───────────────────────────────────────────────────────────────
// 어울림 홍보 영상 — 바꿔도 되는 값은 전부 여기 있다.
//
// · 문구: 각 장면의 copy (배열 한 칸 = 화면의 한 줄). kicker 는 위의 작은 글씨
// · 장면 길이: start / end (초). 앞 장면의 end = 다음 장면의 start
// · 앱 화면: tools/capture-screens.mjs 로 다시 찍는다 (assets/screens)
// · 소리 시점: audio-cues.json — 장면 시각을 바꾸면 거기도 같이 옮긴다
//
// 검고담임 광고 영상(2026-09-28)과 같은 방식: 50초 · 1920×1080 · 배경음악 + 효과음 · 내레이션 없음.
// 배경음악이 열리는 14.4초에 「우리 조가 폰 밖으로 펼쳐지는」 장면을 맞췄다.
// ───────────────────────────────────────────────────────────────
window.AD_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 30,

  demoUrl: 'https://eoullim-skku.vercel.app',
  demoUrlLabel: 'eoullim-skku.vercel.app',

  scenes: [
    { id: 'problem', label: '문제 제시', start: 0, end: 6,
      copy: ['한국에 온 첫 학기,', '혼자 적응하고 있나요?'] },
    { id: 'intro', label: '어울림 시작', start: 6, end: 14.4,
      kicker: 'QR로 바로 시작',
      copy: ['학교와 나라만 고르면', '우리 조가 생겨요.'] },
    { id: 'group', label: '우리 조', start: 14.4, end: 22.5,
      kicker: '한 학기 내내, 무료',
      copy: ['같은 나라 친구 3~4명', '+ 한국인 멘토 1명.'] },
    { id: 'friend', label: '한국인 멘토 · 번역', start: 22.5, end: 31,
      kicker: '학생증 확인 · 1인 1코드',
      copy: ['관심 있는 한국 학생은', '인증된 멘토로 함께.'] },
    { id: 'events', label: '이벤트', start: 31, end: 41,
      kicker: '사주 카페 · 한복 산책 · 나라별 명절',
      copy: ['우리 조와 함께 가는', '이벤트.'] },
    { id: 'community', label: '커뮤니티', start: 41, end: 45,
      kicker: '질문 · 도움 · 같이 해요',
      copy: ['가벼운 도움은', '커뮤니티에서.'] },
    { id: 'brand', label: '마무리', start: 45, end: 50,
      copy: ['한국에서 함께할', '우리 조를 만나요.'] },
  ],

  // 첫 장면에 떠 있는 질문들 — 유학생이 처음 겪는 일
  worries: ['비자 연장은?', '건강보험?', '같이 밥 먹을 사람', '한국 친구', '은행 계좌', '도서관 커피머신', '수강신청', '명절엔 혼자?'],

  // 우리 조 (필리핀 2조) — 앱의 예시 그룹과 같은 이름. 아바타는 앱과 같은 이모지
  members: [
    { nick: 'Bea', avatar: '🍀', role: '필리핀' },
    { nick: 'Carlo', avatar: '🐧', role: '필리핀' },
    { nick: 'Joy', avatar: '🐯', role: '필리핀 · 나' },
    { nick: '서연', avatar: '🦊', role: '한국인 멘토 · 🇵🇭 교환 예정', mentor: true },
    { nick: '서연', avatar: '🦊', role: '한국인 멘토', friend: true },
  ],
  mission: '한국에서 처음 놀랐던 일 하나씩 이야기하기',

  // 번역 장면 — 실제 앱에서 Joy가 보낸 메시지와, 서연 화면에 보인 자동 번역 그대로
  chat: {
    from: 'Joy',
    original: 'Hi Seoyeon! Salamat! Gusto ko rin kumain ng kimchi stew 😋',
    translated: '안녕하세요 서연님! 감사합니다! 나도 김치찌개 먹고싶다 😋',
  },

  // 이벤트 — 앱 예시 이벤트와 같은 이름·참가비
  events: [
    { icon: '🕯️', tag: '필리핀', title: 'Undas — 필리핀식 가족 저녁', fee: '₩12,000' },
    { icon: '✍️', tag: '한국', title: '한글날 — 한글 캘리그라피', fee: '₩10,000' },
    { icon: '👘', tag: '한국 체험', title: '한복 입고 경복궁 산책', fee: '₩20,000' },
    { icon: '🔮', tag: '한국 체험', title: '사주 카페에서 보는 2027년', fee: '₩18,000' },
  ],

  labels: {
    realScreen: '실제 앱 화면 · 예시 데이터',
    payDemo: '결제는 데모 — 실제로 결제되지 않아요',
    autoTr: '자동 번역',
    original: '원문',
    official: '성대 공식 안내를 먼저 보여 줘요',
    cta: '어울림 둘러보기',
    qrHint: '휴대폰 카메라로 QR을 비춰 보세요',
    facts: ['15개 언어 자동 번역', '그룹은 무료', '인증된 한국인 멘토'],
    team: 'HUSS AI BRIDGE · AI 융합 커뮤니티 · 팀 2gether',
  },
};
