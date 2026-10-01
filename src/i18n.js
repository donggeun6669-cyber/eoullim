// Labels shared by several screens. Each entry: [English, 한국어].
export const KINDS = {
  know: { icon: '🙋', en: 'Tell me', ko: '알려줄 사람', hint: ['Questions about life, school, Korea', '생활·학교·한국에 대한 질문'] },
  borrow: { icon: '🤝', en: 'Lend me', ko: '빌려줄 사람', hint: ['Borrow something for a short time', '잠깐 물건 빌리기'] },
  do: { icon: '🙏', en: 'Help me do', ko: '해줄 사람', hint: ['Ask someone to do a small task', '작은 일 부탁하기'] },
}
export const TAGS = {
  life: ['Daily life', '생활'],
  admin: ['Visa & offices', '행정·비자'],
  school: ['School', '학교'],
  health: ['Hospital', '병원'],
  housing: ['Housing', '집'],
  korean: ['Korean language', '한국어'],
  kstyle: ['Korean-style question', '한국식 질문'],
  etc: ['Other', '기타'],
}
export const BOARDS = {
  together: { icon: '🙌', en: 'Together', ko: '같이 해요' },
  free: { icon: '💬', en: 'Free talk', ko: '자유' },
  'l-en': { icon: '🌍', en: 'English', ko: 'English' },
  'l-zh': { icon: '🌏', en: '中文', ko: '中文' },
  'l-vi': { icon: '🌏', en: 'Tiếng Việt', ko: 'Tiếng Việt' },
  'l-uz': { icon: '🌏', en: 'O‘zbek', ko: 'O‘zbek' },
  'l-mn': { icon: '🌏', en: 'Монгол', ko: 'Монгол' },
  'l-ja': { icon: '🌏', en: '日本語', ko: '日本語' },
  'l-ko': { icon: '🇰🇷', en: 'Korean practice', ko: '한국어 연습' },
}
export const LOUNGES = ['l-en', 'l-zh', 'l-vi', 'l-uz', 'l-mn', 'l-ja', 'l-ko']
export const LEVELS = [
  { icon: '🌱', en: 'Sprout', ko: '새싹' },
  { icon: '🏡', en: 'Neighbor', ko: '이웃' },
  { icon: '🤝', en: 'Helper', ko: '도우미' },
  { icon: '🏅', en: 'Eoullim Master', ko: '어울림 마스터' },
]
export const STATUS = {
  open: { en: 'Open', ko: '답변 받는 중', cls: '' },
  adopted: { en: 'Solved', ko: '채택 완료', cls: 'green' },
  refunded: { en: 'Refunded', ko: '환불됨', cls: 'gray' },
  review: { en: 'Manager deciding', ko: '관리자 검토 중', cls: 'amber' },
}
export const LEDGER = {
  starter: ['Welcome points', '시작 포인트'],
  ask: ['Put on a question', '질문에 걸음'],
  raise: ['Raised a question', '질문 포인트 올림'],
  adopted: ['Answer adopted', '답변 채택'],
  refund_auto: ['No answer in 72h — refund', '72시간 무답변 환불'],
  refund_admin: ['Refund by manager', '관리자 환불'],
  refund_delete: ['Deleted question — refund', '질문 삭제 환불'],
  charge: ['Charged (demo)', '충전 (데모)'],
}
// v3 — app language (UI + live translation of boards and group chat). Google codes in `g`.
// UI text exists in English and Korean; every other language is machine-translated from English on the fly.
export const APP_LANGS = [
  { id: 'en', label: 'English', g: 'en' },
  { id: 'ko', label: '한국어', g: 'ko' },
  { id: 'zh', label: '中文', g: 'zh-CN' },
  { id: 'vi', label: 'Tiếng Việt', g: 'vi' },
  { id: 'ja', label: '日本語', g: 'ja' },
  { id: 'tl', label: 'Filipino', g: 'tl' },
  { id: 'uz', label: 'O‘zbek', g: 'uz' },
  { id: 'mn', label: 'Монгол', g: 'mn' },
  { id: 'my', label: 'မြန်မာ', g: 'my' },
  { id: 'id', label: 'Bahasa Indonesia', g: 'id' },
  { id: 'th', label: 'ไทย', g: 'th' },
  { id: 'ru', label: 'Русский', g: 'ru' },
  { id: 'es', label: 'Español', g: 'es' },
  { id: 'fr', label: 'Français', g: 'fr' },
  { id: 'de', label: 'Deutsch', g: 'de' },
]
export const SCHOOLS = {
  skku: ['Sungkyunkwan University', '성균관대학교'],
  handong: ['Handong Global University', '한동대학교'],
  cnu: ['Chungnam National University', '충남대학교'],
  other: ['Other university', '다른 대학교'],
}
// Countries for groups. `lang` = the app language we suggest for people from there.
export const COUNTRIES = {
  ph: { flag: '🇵🇭', en: 'Philippines', ko: '필리핀', lang: 'tl' },
  vn: { flag: '🇻🇳', en: 'Vietnam', ko: '베트남', lang: 'vi' },
  cn: { flag: '🇨🇳', en: 'China', ko: '중국', lang: 'zh' },
  jp: { flag: '🇯🇵', en: 'Japan', ko: '일본', lang: 'ja' },
  uz: { flag: '🇺🇿', en: 'Uzbekistan', ko: '우즈베키스탄', lang: 'uz' },
  mn: { flag: '🇲🇳', en: 'Mongolia', ko: '몽골', lang: 'mn' },
  mm: { flag: '🇲🇲', en: 'Myanmar', ko: '미얀마', lang: 'my' },
  id: { flag: '🇮🇩', en: 'Indonesia', ko: '인도네시아', lang: 'id' },
  th: { flag: '🇹🇭', en: 'Thailand', ko: '태국', lang: 'th' },
  np: { flag: '🇳🇵', en: 'Nepal', ko: '네팔', lang: 'en' },
  us: { flag: '🇺🇸', en: 'USA', ko: '미국', lang: 'en' },
  fr: { flag: '🇫🇷', en: 'France', ko: '프랑스', lang: 'fr' },
  de: { flag: '🇩🇪', en: 'Germany', ko: '독일', lang: 'de' },
  other: { flag: '🌍', en: 'Other', ko: '기타', lang: 'en' },
  kr: { flag: '🇰🇷', en: 'Korea', ko: '한국', lang: 'ko' },
}
// "Philippines · Group 2" / "필리핀 2조"
export const groupName = (g, lang) => {
  if (!g) return ''
  const c = COUNTRIES[g.country] || COUNTRIES.other
  return lang === 'ko' ? `${c.ko} ${g.n}조` : `${c.en} · Group ${g.n}`
}
export const EVENT_CATS = {
  korea: { icon: '🇰🇷', en: 'Only in Korea', ko: '한국 체험' },
  country: { icon: '🌏', en: 'Holidays by country', ko: '나라별 명절' },
  group: { icon: '🏆', en: 'Group vs group', ko: '그룹 대항' },
}
export const EVENT_EMOJI = ['🔮', '👻', '👘', '🏯', '🍜', '🎤', '🎨', '🏆', '⚽', '💐', '🕯️', '🍚', '🎉', '🏮', '🥟', '🍲', '✍️', '⛰️']
// One rapport mission per week, the same for every group.
export const MISSIONS = [
  ['Eat a school-cafeteria lunch together and share one photo 🍚', '학식 같이 먹고 사진 한 장 올리기 🍚'],
  ['Each person recommends one song from home 🎵', '서로의 나라 노래 한 곡씩 추천하기 🎵'],
  ['Tell each other one thing that surprised you in Korea 😲', '한국에서 처음 놀랐던 일 하나씩 이야기하기 😲'],
  ['Mentor picks a neighborhood — take a 30-minute walk together 🚶', '멘토가 고른 동네를 30분 같이 걷기 🚶'],
  ['Teach the group one word in your language 🗣️', '내 나라 말 한 단어씩 가르쳐 주기 🗣️'],
  ['Try a Korean snack none of you has eaten 🍡', '아무도 안 먹어 본 한국 간식 같이 먹어 보기 🍡'],
]
export const ERRORS = {
  offline: ['No connection. Try again.', '연결이 안 돼요. 다시 시도해 주세요.'],
  server: ['Something went wrong. Try again.', '문제가 생겼어요. 다시 시도해 주세요.'],
  busy: ['Busy right now. Try again.', '지금 붐벼요. 다시 시도해 주세요.'],
  slow_down: ['Too fast! Wait a minute.', '너무 빨라요! 잠시 뒤에 해 주세요.'],
  not_enough_points: ['Not enough points.', '포인트가 부족해요.'],
  bad_bounty: ['Points must be 1–1,000.', '포인트는 1~1,000 사이예요.'],
  banned: ['This request is not allowed (proxy attendance, homework, money, IDs…).', '허용되지 않는 요청이에요 (대리 출석·과제 대행·돈·신분증 등).'],
  empty: ['Please write something.', '내용을 적어 주세요.'],
  own_question: ['You can’t answer your own question.', '내 질문에는 답할 수 없어요.'],
  own_post: ['This is your own post.', '내가 쓴 글이에요.'],
  own_item: ['You can’t report your own post.', '내 글은 신고할 수 없어요.'],
  has_answers: ['It already has answers, so it can’t be deleted.', '답변이 달려서 지울 수 없어요.'],
  closed: ['This question is already closed.', '이미 끝난 질문이에요.'],
  full: ['This meetup is full.', '모집이 다 찼어요.'],
  bad_code: ['That code doesn’t work.', '코드가 맞지 않아요.'],
  bad_key: ['That recovery code is not valid.', '복구 코드 형식이 맞지 않아요.'],
  no_device: ['This phone is not set up yet.', '이 기기가 아직 등록되지 않았어요.'],
  not_found: ['It was removed.', '삭제된 글이에요.'],
  bad_cap: ['Check the number of people.', '인원을 확인해 주세요.'],
  in_group: ['You are already in a group.', '이미 그룹에 들어가 있어요.'],
  mentor_no_join: ['Mentors take a group from the mentor page.', '멘토는 멘토 화면에서 그룹을 맡아요.'],
  has_mentor: ['This group already has a mentor.', '이미 멘토가 있는 그룹이에요.'],
  mentor_max: ['A mentor can look after up to 3 groups.', '멘토 한 명은 3개 그룹까지 맡을 수 있어요.'],
  not_member: ['Only group members can do this.', '그룹 멤버만 할 수 있어요.'],
  event_closed: ['This event is closed.', '마감된 이벤트예요.'],
  late_cancel: ['Free cancellation ends 2 days before the event.', '행사 2일 전부터는 취소할 수 없어요.'],
  bad_fee: ['Fee must be 0–200,000 won, in 100-won steps.', '참가비는 0~200,000원, 100원 단위예요.'],
  bad_date: ['Pick a date from today on.', '오늘 이후 날짜를 골라 주세요.'],
  not_admin: ['Mentors only.', '멘토만 할 수 있어요.'],
  no_seat: ['No free Korean-friend seat in those countries yet. Your interests are saved.', '그 나라 그룹에 아직 한국 친구 빈자리가 없어요. 관심 나라는 저장했어요.'],
  empty_group: ['This group has no students right now.', '지금 학생이 없는 그룹이에요.'],
  kr_student: ['You started as a Korean student.', '한국 학생으로 시작한 기기예요.'],
}
// Korean friends: what I can offer to students from the countries I follow.
export const OFFERS = {
  language: ['Language exchange', '언어 교환'],
  life: ['Help with life in Korea', '한국 생활 도와주기'],
  hangout: ['Hang out, eat, explore', '같이 놀기·밥·구경'],
}
export const LANGS = [
  ['ko', '한국어'], ['en', 'English'], ['zh', '中文'], ['vi', 'Tiếng Việt'], ['ja', '日本語'],
  ['uz', 'O‘zbek'], ['mn', 'Монгол'], ['fr', 'Français'], ['es', 'Español'], ['de', 'Deutsch'],
]
export const INTERESTS = [
  ['food', 'Korean food', '한식 탐방'], ['cafe', 'Cafes', '카페'], ['kpop', 'K-pop', 'K-pop'], ['travel', 'Travel', '여행'],
  ['sports', 'Sports', '운동'], ['film', 'Film & drama', '영화·드라마'], ['music', 'Music', '음악'], ['games', 'Games', '게임'],
  ['language', 'Language exchange', '언어 교환'], ['study', 'Study', '스터디'], ['photo', 'Photos', '사진'], ['hiking', 'Hiking', '등산'],
]
export const AVATARS = ['🐯', '🦊', '🐼', '🐨', '🐧', '🦉', '🐙', '🦋', '🌸', '🍀', '🌙', '⭐']
// Avatar backgrounds stay inside the 60-30-10 palette: tints of the accent (violet) and the navy.
export const COLORS = [
  ['#EEECFF', '#2B1FB8'], ['#E2DEFF', '#2B1FB8'], ['#D4CEFF', '#2B1FB8'], ['#F4F3FA', '#2B1FB8'],
  ['#E7EAF0', '#0F1B2E'], ['#DCE1EA', '#0F1B2E'], ['#CED5E1', '#0F1B2E'], ['#F1F2F5', '#0F1B2E'],
]
