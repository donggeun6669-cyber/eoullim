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
  bad_cap: ['Group size must be 2–50.', '인원은 2~50명이에요.'],
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
export const COLORS = [
  ['#ECEAFF', '#2B1FB8'], ['#FFE4DD', '#8A2C14'], ['#DDF1E7', '#0A4A2C'], ['#FFF1D6', '#6B4300'],
  ['#DCE7F3', '#1E3A5F'], ['#D8F1EC', '#0B4A40'], ['#F3E3F7', '#5B1E6B'], ['#EDEDF2', '#16151F'],
]
