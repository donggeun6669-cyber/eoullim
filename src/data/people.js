// Demo data. People are fictional; names and cards follow 다미's prototype.

export const TOPICS = [
  { id: 'visa', en: 'Visa and ARC', ko: '비자·외국인등록' },
  { id: 'bank', en: 'Bank and phone', ko: '은행·휴대폰' },
  { id: 'housing', en: 'Housing', ko: '주거·기숙사' },
  { id: 'course', en: 'Course sign-up', ko: '수강신청' },
  { id: 'transport', en: 'Transport', ko: '교통' },
  { id: 'campus', en: 'Campus life', ko: '캠퍼스 생활' },
]
export const topic = (id) => TOPICS.find((t) => t.id === id) || { en: id, ko: id }

export const INTERESTS = [
  { id: 'kpop', en: 'K-pop', ko: 'K-pop' },
  { id: 'food', en: 'Korean food', ko: '한식 탐방' },
  { id: 'cafe', en: 'Cafe hopping', ko: '카페 투어' },
  { id: 'hiking', en: 'Hiking', ko: '등산' },
  { id: 'football', en: 'Football', ko: '축구' },
  { id: 'gaming', en: 'Gaming', ko: '게임' },
  { id: 'film', en: 'Film and drama', ko: '영화·드라마' },
  { id: 'music', en: 'Music', ko: '음악' },
  { id: 'language', en: 'Language exchange', ko: '언어 교환' },
  { id: 'travel', en: 'Travel', ko: '여행' },
  { id: 'photo', en: 'Photography', ko: '사진' },
  { id: 'study', en: 'Study buddy', ko: '스터디' },
]
export const interest = (id) => INTERESTS.find((t) => t.id === id) || { en: id, ko: id }

export const LANGS = [
  { id: 'ko', label: '한국어' },
  { id: 'en', label: 'English' },
  { id: 'zh', label: '中文' },
  { id: 'ja', label: '日本語' },
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'fr', label: 'Français' },
  { id: 'de', label: 'Deutsch' },
  { id: 'es', label: 'Español' },
]
export const langLabel = (id) => (LANGS.find((l) => l.id === id) || { label: id }).label

const C = {
  violet: ['#ECEAFF', '#2B1FB8'],
  teal: ['#D8F1EC', '#0B4A40'],
  amber: ['#FFF1D6', '#6B4300'],
  coral: ['#FFE4DD', '#8A2C14'],
  blue: ['#DCE7F3', '#1E3A5F'],
  green: ['#DDF1E7', '#0A4A2C'],
}

export const PEOPLE = {
  mk: {
    id: 'mk', name: 'Minjun Kim', ko: '김민준', initials: 'MK', color: C.violet, online: true,
    kind: 'korean', roles: ['mentor', 'friend'], major: { en: 'Business', ko: '경영학과' }, year: 3,
    topics: ['visa', 'bank', 'course', 'campus'], langs: ['ko', 'en'], interests: ['football', 'cafe', 'travel', 'language'],
    helped: 18, reply: '~10 min', rating: 4.9,
    bio: {
      en: 'Third-year student. I remember how confusing the first weeks are. I can go with you to the immigration office, help set up a bank account, and show you around campus.',
      ko: '3학년이에요. 처음 몇 주가 얼마나 헷갈리는지 기억해요. 출입국사무소 동행, 은행 계좌 개설, 캠퍼스 안내를 도와드릴 수 있어요.',
    },
  },
  do: {
    id: 'do', name: 'Daniel Osei', ko: '', initials: 'DO', color: C.teal, online: true,
    kind: 'international', roles: ['mentor'], major: { en: 'Electronics', ko: '전자전기공학부' }, year: 4,
    topics: ['course', 'campus', 'transport'], langs: ['en', 'ko', 'fr'], interests: ['gaming', 'football', 'music'],
    helped: 11, reply: '~30 min', rating: 4.8,
    bio: {
      en: 'Came from Ghana four years ago. I know what it is like to be new here — ask me about courses, GLS, and getting between the two campuses.',
      ko: '4년 전 가나에서 왔어요. 처음 온 기분을 잘 알아요. 수강신청, GLS, 두 캠퍼스 오가는 법을 물어보세요.',
    },
  },
  yp: {
    id: 'yp', name: 'Yuna Park', ko: '박유나', initials: 'YP', color: C.coral, online: false,
    kind: 'korean', roles: ['mentor', 'friend'], major: { en: 'Korean Literature', ko: '국어국문학과' }, year: 2,
    topics: ['housing', 'campus', 'bank'], langs: ['ko', 'en', 'ja'], interests: ['food', 'film', 'photo', 'cafe'],
    helped: 7, reply: '~1 hr', rating: 5.0,
    bio: {
      en: 'I live near Hyehwa and know every good cheap restaurant. Happy to help with housing contracts and daily life.',
      ko: '혜화 근처에 살아서 싸고 맛있는 식당은 다 알아요. 자취 계약과 생활 적응을 도와드릴게요.',
    },
  },
  hl: {
    id: 'hl', name: 'Hana Lee', ko: '이하나', initials: 'HL', color: C.green, online: false,
    kind: 'korean', roles: ['mentor', 'friend'], major: { en: 'Chinese Literature', ko: '중어중문학과' }, year: 3,
    topics: ['visa', 'course', 'transport'], langs: ['ko', 'zh', 'en'], interests: ['kpop', 'language', 'travel'],
    helped: 9, reply: '~20 min', rating: 4.9,
    bio: {
      en: 'I speak Chinese, so I often help students from China and Taiwan. Visa paperwork and course sign-up are my specialty.',
      ko: '중국어를 할 수 있어서 중국·대만 학생들을 자주 도와요. 비자 서류와 수강신청이 특기예요.',
    },
  },
  jw: {
    id: 'jw', name: 'Jiwoo Choi', ko: '최지우', initials: 'JC', color: C.blue, online: true,
    kind: 'korean', roles: ['friend'], major: { en: 'Psychology', ko: '심리학과' }, year: 2,
    topics: [], langs: ['ko', 'en'], interests: ['kpop', 'cafe', 'film', 'language'],
    bio: {
      en: 'Looking for a language exchange partner! I want to practice English and I love showing people Seoul cafes.',
      ko: '언어 교환 친구 찾아요! 영어 연습하고 싶고 서울 카페 소개하는 거 좋아해요.',
    },
  },
  sj: {
    id: 'sj', name: 'Seojun Han', ko: '한서준', initials: 'SH', color: C.amber, online: false,
    kind: 'korean', roles: ['friend'], major: { en: 'Mechanical Engineering', ko: '기계공학부' }, year: 3,
    topics: [], langs: ['ko', 'en'], interests: ['hiking', 'football', 'gaming', 'travel'],
    bio: {
      en: 'Weekend hiker. Looking for people to explore Seoul mountains with — come along!',
      ko: '주말마다 등산해요. 서울 산 같이 다닐 사람 찾아요!',
    },
  },
  hy: {
    id: 'hy', name: 'Hayeon Lim', ko: '임하연', initials: 'HY', color: C.violet, online: true,
    kind: 'korean', roles: ['friend'], major: { en: 'Global Economics', ko: '글로벌경제학과' }, year: 1,
    topics: [], langs: ['ko', 'en', 'es'], interests: ['music', 'photo', 'food', 'travel'],
    bio: {
      en: 'Freshman who studied in Madrid for a year. I know how lonely it can be abroad — let us grab tteokbokki.',
      ko: '마드리드에서 1년 살았던 새내기예요. 외국에서 외로운 거 잘 알아요. 떡볶이 먹으러 가요.',
    },
  },
  // mentees (people who need help)
  sm: {
    id: 'sm', name: 'Sofia M.', initials: 'SM', color: C.amber, online: true, kind: 'exchange', roles: ['mentee'],
    status: { en: 'Exchange student · 1 semester', ko: '교환학생 · 1학기' }, needs: ['transport', 'campus'],
    needText: { en: 'Bus card, Library', ko: '교통카드, 도서관' }, langs: ['es', 'en'], interests: ['food', 'photo'],
  },
  lb: {
    id: 'lb', name: 'Lukas B.', initials: 'LB', color: C.blue, online: true, kind: 'exchange', roles: ['mentee'],
    status: { en: 'Exchange student · 1 year', ko: '교환학생 · 1년' }, needs: ['course', 'campus'],
    needText: { en: 'Course sign-up, Food', ko: '수강신청, 식당' }, langs: ['de', 'en'], interests: ['football', 'hiking'],
  },
  at: {
    id: 'at', name: 'Aiko T.', initials: 'AT', color: C.violet, online: false, kind: 'international', roles: ['mentee'],
    status: { en: 'New international student', ko: '신입 외국인 유학생' }, needs: ['visa', 'bank'],
    needText: { en: 'Visa, Bank', ko: '비자, 은행' }, langs: ['ja', 'en'], interests: ['kpop', 'cafe'],
  },
}

export const MENTORS = ['mk', 'do', 'yp', 'hl']
export const MENTEES = ['sm', 'lb', 'at']
export const FRIENDS = ['jw', 'mk', 'hy', 'sj', 'yp', 'hl']
export const ONLINE = ['mk', 'do', 'sm', 'at', 'lb', 'jw', 'hy'].filter((id) => PEOPLE[id].online)

// ---------- matching (rule-based, explainable) ----------
// Mentor score: topic fit first, then a shared language, then being online now.
export function mentorScore(p, topicId, langs = []) {
  let s = 0
  const why = []
  if (topicId && p.topics.includes(topicId)) { s += 3; why.push('topic') }
  const shared = p.langs.filter((l) => langs.includes(l) && l !== 'ko')
  if (shared.length) { s += 2; why.push('lang:' + shared[0]) }
  if (p.online) { s += 1; why.push('online') }
  return { score: s, why }
}

export function pickMentor(topicId, lang) {
  return MENTORS.map((id) => PEOPLE[id])
    .map((p) => ({ p, ...mentorScore(p, topicId, [lang]) }))
    .sort((a, b) => b.score - a.score)[0].p
}

// Friend score: shared interests (each counts) + a shared non-Korean language.
export function friendMatch(p, me) {
  const shared = p.interests.filter((i) => me.interests.includes(i))
  const langs = p.langs.filter((l) => me.langs.includes(l) && l !== 'ko')
  return { shared, langs, score: shared.length * 2 + (langs.length ? 1 : 0) + (p.online ? 0.5 : 0) }
}

// ---------- seeds ----------
export function seedChats() {
  return [
    {
      id: 'mk', kind: 'person', unread: 2, updated: 3, confirmed: false,
      messages: [
        { from: 'system', text: { en: 'Your request · Report my new address (ARC)', ko: '내 요청 · 이사 후 주소 변경 신고 (ARC)' }, time: '10:19' },
        { from: 'me', text: 'Hi Minjun! I moved to a new place. What do I need to do for my ARC?', tr: '안녕하세요 민준 씨! 이사했는데 ARC는 어떻게 해야 하나요?', time: '10:20' },
        { from: 'them', text: '이사 후 14일 이내에 주소 변경 신고를 해야 해요.', tr: 'You must report your change of address within 14 days.', time: '10:22' },
        { from: 'them', text: '하이코리아 사이트에서 온라인으로 할 수 있어요. 같이 해봐요!', tr: 'You can do it online on the HiKorea site. Let us do it together!', time: '10:24' },
      ],
    },
    {
      id: 'g-exchange', kind: 'group', unread: 5, updated: 2,
      name: { en: 'SKKU Exchange 2026-2', ko: 'SKKU 교환학생 2026-2' },
      messages: [
        { from: 'sm', text: 'Anyone free for lunch on Friday?', time: '09:12' },
      ],
    },
    {
      id: 'do', kind: 'person', unread: 0, updated: 1, confirmed: true,
      messages: [
        { from: 'them', text: 'For the shuttle to Suwon, check the timetable in the Help Bot — it links the official page.', time: 'Yesterday' },
        { from: 'me', text: 'Thanks for the tip!', time: 'Yesterday' },
      ],
    },
    {
      id: 'sm', kind: 'person', unread: 0, updated: 0, request: true,
      messages: [
        { from: 'system', text: { en: 'Sofia wants help with a bus card', ko: '소피아가 교통카드 도움을 요청했어요' }, time: 'Mon' },
      ],
    },
  ]
}

export function seedRequests() {
  return [
    { id: 'r1', topic: 'bank', text: 'Open a bank account', status: 'open', lang: 'en' },
    { id: 'r2', topic: 'visa', text: 'Report my new address (ARC)', status: 'matched', mentor: 'mk', lang: 'en' },
    { id: 'r3', topic: 'campus', text: 'Find the library', status: 'done', mentor: 'do', lang: 'en' },
  ]
}

export function seedPosts() {
  return [
    {
      id: 'p1', author: 'sm', badge: { en: 'Exchange', ko: '교환학생' }, when: { en: '20 min ago', ko: '20분 전' }, likes: 12, comments: 5,
      text: 'Tried tteokbokki at the campus cafeteria for the first time. Any tips for spicy food?',
      tr: '캠퍼스 식당에서 처음으로 떡볶이를 먹어봤어요. 매운 음식 팁 있나요?',
    },
    {
      id: 'p2', author: 'yp', badge: { en: 'Korean student', ko: '한국 학생' }, when: { en: '1 hour ago', ko: '1시간 전' }, likes: 24, comments: 9,
      text: '새로 오신 분들, 이번 주에 은행 계좌 개설을 같이 가 드릴 수 있어요. 함께하고 싶으면 댓글 남겨 주세요.',
      tr: 'New students: I can go with you to open a bank account this week. Comment if you want to join.',
    },
  ]
}

export function seedQuestions() {
  return [
    { id: 'q1', text: 'Where can I print my certificate of enrollment?', answers: 2, bot: 'certificate_issuance' },
    { id: 'q2', text: 'Which bus goes to the other campus?', answers: 1, bot: 'shuttle_bus' },
  ]
}

export function seedActivity() {
  return [
    { id: 1, label: { en: 'Helped Sofia with library card', ko: '소피아 도서관 카드 도움' }, delta: 50, when: 'today' },
    { id: 2, label: { en: 'Answered a bus route question', ko: '버스 노선 질문 답변' }, delta: 20, when: 'yesterday' },
    { id: 3, label: { en: 'Redeemed cafe coupon', ko: '카페 쿠폰 교환' }, delta: -300, when: 'Mon' },
  ]
}

export const GROUPS = [
  { id: 'g1', name: { en: 'Newcomer orientation buddies', ko: '신입 오리엔테이션 버디' }, desc: { en: 'Get a buddy for your first weeks', ko: '첫 몇 주를 함께할 버디 구하기' }, members: 42 },
  { id: 'g2', name: { en: 'Newcomer coffee chat', ko: '뉴커머 커피챗' }, desc: { en: 'Meet mentors and other newcomers', ko: '멘토·다른 신입생과 만나기' }, members: 27 },
  { id: 'g3', name: { en: 'Language exchange 한↔EN', ko: '언어교환 한↔EN' }, desc: { en: 'Weekly Korean–English conversation', ko: '매주 한국어–영어 대화' }, members: 58 },
  { id: 'g4', name: { en: 'Study group finder', ko: '스터디 찾기' }, desc: { en: 'Find classmates for your course', ko: '같은 수업 듣는 친구 찾기' }, members: 19 },
]

export const REWARDS = [
  { id: 'bonus', name: { en: 'Exchange-program bonus', ko: '교환학생 선발 가산점' }, note: { en: 'Proposal · to be set with SKKU', ko: '제안 · 학교와 협의 필요' }, cost: 1500 },
  { id: 'meal', name: { en: 'Food voucher', ko: '학식 식권' }, note: { en: 'Campus cafeteria', ko: '교내 식당' }, cost: 500 },
  { id: 'cafe', name: { en: 'Cafe coupon', ko: '카페 쿠폰' }, note: { en: 'Campus cafe', ko: '교내 카페' }, cost: 300 },
]

// Demo replies so the chat can be shown live. Korean original + English translation.
export const AUTO_REPLIES = {
  mentor: [
    { ko: '좋아요! 내일 오후 2시에 국제관 앞에서 만날까요?', en: 'Great! Shall we meet in front of International Hall at 2pm tomorrow?' },
    { ko: '여권이랑 외국인등록증 꼭 챙겨 오세요 😊', en: 'Please bring your passport and ARC 😊' },
    { ko: '혹시 더 궁금한 거 있으면 언제든 물어보세요!', en: 'If you have any other questions, ask me anytime!' },
  ],
  friend: [
    { ko: '안녕하세요! 반가워요 😊 성대 생활은 어때요?', en: 'Hi! Nice to meet you 😊 How is life at SKKU?' },
    { ko: '이번 주에 학교 근처 카페 같이 갈래요?', en: 'Want to go to a cafe near campus this week?' },
    { ko: '좋아요! 한국어도 같이 연습해요 ㅎㅎ', en: 'Nice! Let us practice Korean together too haha' },
  ],
  mentee: [
    { en: 'Thank you so much! When are you free?', ko: '정말 고마워요! 언제 시간 괜찮아요?' },
    { en: 'That would really help. I am at the library now.', ko: '정말 도움이 될 거예요. 지금 도서관에 있어요.' },
    { en: 'See you then! 감사합니다 🙏', ko: '그때 봐요! 감사합니다 🙏' },
  ],
}
