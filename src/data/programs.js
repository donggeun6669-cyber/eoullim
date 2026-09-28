// Existing SKKU support programs — the "basic feature" in our application: introduce and connect.
// Collected 2026-09-28 from official SKKU pages. Recruitment dates change each semester, so we link
// to the official page instead of printing dates we cannot keep up to date.

export const PROGRAM_CATS = [
  { id: 'all', en: 'All', ko: '전체' },
  { id: 'friends', en: 'Buddies & friends', ko: '버디·친구' },
  { id: 'office', en: 'Offices', ko: '담당 부서' },
  { id: 'korean', en: 'Korean', ko: '한국어' },
  { id: 'care', en: 'Counseling', ko: '상담' },
]

export const PROGRAMS = [
  {
    id: 'sg_maple', cat: 'friends', icon: '🍁',
    name: { en: 'SG MAPLE Buddy Program', ko: 'SG MAPLE 버디 프로그램' },
    org: { en: 'Office of International Relations (OIR) + HI-Club', ko: '국제처(OIR) + 하이클럽' },
    desc: {
      en: 'The official buddy program. Each Korean buddy is matched with about 4–6 incoming exchange/visiting students in a group, for a semester of campus help and cultural activities.',
      ko: '공식 버디 프로그램이에요. 한국인 버디 1명이 그룹 안에서 교환·방문학생 약 4~6명과 매칭되어 한 학기 동안 학교생활과 문화 활동을 함께해요.',
    },
    who: {
      en: 'Exchange/visiting students are matched automatically — no application. Korean students apply as buddies (documents + interview).',
      ko: '교환·방문학생은 신청 없이 자동 배정돼요. 한국 학생은 버디로 지원해요(서류+면접).',
    },
    how: {
      en: 'Buddies are announced after the welcome orientation. Korean students: watch for the recruitment notice each semester.',
      ko: '웰컴 오리엔테이션 뒤에 버디가 발표돼요. 한국 학생은 매 학기 모집 공고를 확인하세요.',
    },
    contact: 'incoming@skku.edu · +82-2-760-0156',
    url: 'https://www.skku.edu/eng/International/StudySKKU/Introduction.do',
  },
  {
    id: 'hi_club', cat: 'friends', icon: '👋',
    name: { en: 'GSN HI-Club', ko: 'GSN 하이클럽' },
    org: { en: 'Student group supported by OIR', ko: '국제처 지원 학생단체' },
    desc: {
      en: 'Global Student Network Help & Information Club. Co-hosts the exchange-student orientation, runs cultural events and field trips, and manages SG MAPLE.',
      ko: 'Global Student Network Help & Information Club. 교환학생 오리엔테이션을 함께 열고, 문화행사·필드트립을 운영하며, SG MAPLE을 관리해요.',
    },
    who: {
      en: 'Events are for incoming exchange and visiting students on both campuses.',
      ko: '양 캠퍼스의 신입 교환·방문학생 대상 행사예요.',
    },
    how: {
      en: 'Exchange students are invited automatically. Membership recruitment is announced on the club’s own channels.',
      ko: '교환학생은 자동으로 안내받아요. 회원 모집은 동아리 자체 채널에 공지돼요.',
    },
    contact: 'incoming@skku.edu · +82-2-760-0156',
    url: 'https://www.skku.edu/eng/International/StudySKKU/Introduction.do',
  },
  {
    id: 's_link', cat: 'friends', icon: '🔗',
    name: { en: 'S-LINK', ko: 'S-LINK' },
    org: { en: 'Office of International Student Services (OISS)', ko: '외국인유학생지원팀(OISS)' },
    desc: {
      en: 'OISS’s official student group where Korean and international students plan events, run festival booths and make content for international students.',
      ko: 'OISS 공식 학생단체예요. 한국인·외국인 학생이 함께 행사 기획, 축제 부스, 유학생 대상 콘텐츠를 만들어요.',
    },
    who: { en: 'Korean and international SKKU students.', ko: '한국인·외국인 재학생 모두.' },
    how: {
      en: 'Apply with a Google Form + PDF during the recruitment window (check OISS for the current notice).',
      ko: '모집 기간에 구글폼 + PDF 지원서로 지원해요(최신 공고는 OISS에서 확인).',
    },
    contact: 'skkuslink@gmail.com',
    url: 'https://oiss.skku.edu/oiss/s-link.do',
  },
  {
    id: 'global_buddy', cat: 'friends', icon: '🌏',
    name: { en: 'Global Buddy (University College)', ko: '글로벌 버디 (학부대학)' },
    org: { en: 'University College', ko: '학부대학' },
    desc: {
      en: 'A separate buddy program for new international degree-seeking undergraduates: language exchange, study help or cultural exchange, at least 8 meetings a semester.',
      ko: '신입 외국인 학위과정 학부생을 위한 별도 버디 프로그램. 어학교류·학업 가이드·문화교류 중 선택, 학기당 최소 8회 만나요.',
    },
    who: { en: 'Degree-seeking international freshmen (not exchange students).', ko: '외국인 학위과정 신입생 (교환학생 아님).' },
    how: { en: 'Contact University College for the application process.', ko: '지원 절차는 학부대학에 문의하세요.' },
    contact: '+82-2-760-0774',
    url: 'https://hakbu.skku.edu/eng_hakbu/activities/buddy.do',
  },
  {
    id: 'oiss', cat: 'office', icon: '🏛️',
    name: { en: 'International Student Services (OISS)', ko: '외국인유학생지원팀 (OISS)' },
    org: { en: 'SKKU', ko: '성균관대학교' },
    desc: {
      en: 'The office for international students’ daily life: foreigner registration, insurance, housing, visa and study-life counseling.',
      ko: '외국인 학생 생활 전반을 맡는 부서예요. 외국인등록, 보험, 주거, 비자, 학업·생활 상담.',
    },
    who: { en: 'International students.', ko: '외국인 학생.' },
    how: { en: 'Weekdays 9:00–12:00, 13:00–17:00. Call or email.', ko: '평일 9:00–12:00, 13:00–17:00. 전화·이메일.' },
    contact: 'Seoul 02-760-0026~7 · oisshs@skku.edu / Suwon 031-290-5026~8 · oissns@skku.edu',
    url: 'https://oiss.skku.edu/oiss/index.do',
  },
  {
    id: 'oir', cat: 'office', icon: '✈️',
    name: { en: 'Office of International Relations (OIR)', ko: '국제처 (OIR)' },
    org: { en: 'SKKU', ko: '성균관대학교' },
    desc: {
      en: 'Handles exchange and visiting students: admission, orientation (a few days before the semester), and the SG MAPLE buddy program.',
      ko: '교환·방문학생 담당이에요. 입학, 오리엔테이션(개강 며칠 전), SG MAPLE 버디 프로그램.',
    },
    who: { en: 'Exchange and visiting students.', ko: '교환·방문학생.' },
    how: { en: 'Orientation date and venue are shared in each semester’s factsheet.', ko: '오리엔테이션 날짜·장소는 학기별 팩트시트로 안내돼요.' },
    contact: 'incoming@skku.edu · +82-2-760-0156',
    url: 'https://www.skku.edu/eng/International/StudySKKU/Introduction.do',
  },
  {
    id: 'sli', cat: 'korean', icon: '🇰🇷',
    name: { en: 'Sungkyun Language Institute', ko: '성균어학원 (SLI)' },
    org: { en: 'SKKU', ko: '성균관대학교' },
    desc: {
      en: 'Regular and short-term Korean language programs at several levels, on both campuses.',
      ko: '양 캠퍼스에서 여러 등급의 정규·단기 한국어 과정을 운영해요.',
    },
    who: { en: 'Anyone who wants to learn Korean (check admission requirements).', ko: '한국어를 배우려는 누구나 (입학 요건 확인).' },
    how: { en: 'Seoul office: Room 32323, Dasan Hall of Economics. Schedule and fees on the website.', ko: '서울 사무실: 다산경제관 32323호. 일정·비용은 홈페이지에서.' },
    contact: '+82-2-760-1345',
    url: 'https://koreansli.skku.edu/ksli_eng/intro/seoul.do',
  },
  {
    id: 'scc', cat: 'care', icon: '💬',
    name: { en: 'Counseling Center', ko: '학생상담센터' },
    org: { en: 'SKKU', ko: '성균관대학교' },
    desc: {
      en: 'Free individual counseling (50 min a week, up to 10 sessions), plus online and group counseling. International students welcome.',
      ko: '무료 개인상담(주 1회 50분, 최대 10회)과 온라인·집단상담. 외국인 학생도 이용할 수 있어요.',
    },
    who: { en: 'All enrolled students.', ko: '모든 재학생.' },
    how: { en: 'Weekdays 9:00–17:30. Call or visit (Seoul: 1F Dasan Hall of Economics).', ko: '평일 9:00–17:30. 전화 또는 방문 (서울: 다산경제관 1층).' },
    contact: 'Seoul 02-760-1290 · Suwon 031-290-5260',
    url: 'https://www.skku.edu/eng/CampusLife/support/StudentAdvisingCounseling.do',
  },
]
