// Example content so the boards are not empty on first open. Every item is marked `seed` and the app
// shows an "Example" tag on it. Seed authors are not real devices: they never hold or receive points.
// Seed items keep a fixed age (ageMin) and are exempt from the 72h / 7-day rules, so the demo board
// looks the same on presentation day. Answers only use facts from the official guide (kb.js) or
// general etiquette — nothing about SKKU that we have not checked.

const S = (nick, avatar, color) => ({ nick, avatar, color })
const LIN = S('Linh', '🌸', 1)
const MATEO = S('Mateo', '🦊', 2)
const AZIZ = S('Aziz', '🦉', 3)
const YUKI = S('Yuki', '🌙', 4)
const BAT = S('Bat', '🐧', 5)
const WEI = S('Wei', '🐼', 6)
const ADMIN = S('Minji', '🐯', 0)

let n = 0
const id = (p) => `${p}seed${String(++n).padStart(3, '0')}`

export function seedDb(now = Date.now()) {
  n = 0
  const q = (o) => ({ id: id('q'), reports: [], answers: [], status: 'open', seed: true, author: 'seed-' + o.snap.nick, ...o })
  const a = (o) => ({ id: id('a'), reports: [], seed: true, author: 'seed-' + (o.snap?.nick || 'anon'), ...o })
  const p = (o) => ({ id: id('p'), reports: [], comments: [], likes: [], seed: true, author: 'seed-' + (o.snap?.nick || 'anon'), ...o })
  const c = (o) => ({ id: id('c'), reports: [], seed: true, author: 'seed-' + (o.snap?.nick || 'anon'), ...o })
  const likes = (k) => Array.from({ length: k }, (_, i) => 'seed-like-' + i)

  const addrAnswer = a({
    snap: ADMIN, admin: true, ageMin: 50,
    body: 'You need to report a new address within 14 days — online on HiKorea (www.hikorea.go.kr) or at the immigration office. Late reports can be fined. For general immigration questions you can call 1345. (Source: SKKU OISS — Foreigner Registration)',
    thanks: 'Thank you so much! Done on HiKorea 🙏',
  })

  const questions = [
    q({
      kind: 'do', tag: 'kstyle', bounty: 30, snap: WEI, ageMin: 35,
      title: 'Can someone call a dentist near Hyehwa and book for me? 🦷',
      body: 'My Korean is not good enough for phone calls yet. Any weekday afternoon is fine. I can send you the clinic name here.',
    }),
    q({
      kind: 'borrow', tag: 'life', bounty: 5, snap: MATEO, ageMin: 80,
      title: 'Anyone can lend me an umbrella tomorrow morning? ☔',
      body: 'I have a 9am class at the Seoul campus and forgot mine at home. I will give it back after class!',
      answers: [a({ snap: YUKI, ageMin: 60, body: 'I have a spare one. I can bring it to the main gate at 8:50?' })],
    }),
    q({
      kind: 'know', tag: 'kstyle', bounty: 15, snap: LIN, ageMin: 190,
      title: 'Is it rude to pour my own drink at a dinner with Korean seniors?',
      body: 'My lab is having a dinner on Friday. I don’t want to make a mistake.',
      answers: [
        a({
          snap: ADMIN, admin: true, ageMin: 170,
          body: 'Not a big deal, but people usually pour for each other. When a senior pours for you, hold your glass with two hands. When you drink, it is polite to turn your head slightly away from the seniors. Nobody expects a foreign student to know every rule — asking like this already shows respect 🙂',
        }),
        a({ snap: AZIZ, ageMin: 150, body: 'Same experience here. Just watch what others do and you will be fine!' }),
      ],
    }),
    q({
      kind: 'know', tag: 'admin', bounty: 20, snap: AZIZ, ageMin: 1440, status: 'adopted',
      title: 'I moved to a new room. Do I need to report my address?',
      body: '',
      answers: [addrAnswer],
      adopted: addrAnswer.id,
    }),
    q({
      kind: 'know', tag: 'school', bounty: 10, snap: BAT, ageMin: 240,
      title: 'How do I get a copy of my enrollment certificate in English?',
      body: 'My embassy asks for it. Is there an online way?',
    }),
  ]

  const posts = [
    p({
      board: 'together', snap: YUKI, ageMin: 120, likes: likes(4),
      title: 'Hangang picnic this Saturday 🧺',
      body: 'Chicken + convenience store ramyeon by the river. Beginners in Korean totally welcome, we will speak English and easy Korean.',
      meetup: { inDays: 3, place: 'Yeouido Hangang Park', cap: 6, joined: ['seed-Yuki', 'seed-Linh', 'seed-Mateo'] },
      comments: [c({ snap: LIN, ageMin: 100, body: 'Count me in! I will bring snacks 🍪' })],
    }),
    p({
      board: 'together', snap: LIN, ageMin: 300, likes: likes(2),
      title: 'TOPIK level 3 study group — Tue/Thu evenings',
      body: 'Looking for 3 more people. We solve one past test a week and talk about it.',
      meetup: { inDays: 1, place: 'Seoul campus', cap: 4, joined: ['seed-Linh', 'seed-Bat'] },
    }),
    p({
      board: 'together', snap: MATEO, ageMin: 500, likes: likes(6),
      title: 'Sunday futsal ⚽ need 3 more',
      body: 'All levels. Bring water!',
      meetup: { inDays: 4, place: 'Suwon campus', cap: 10, joined: Array.from({ length: 7 }, (_, i) => 'seed-f' + i) },
    }),
    p({
      board: 'free', snap: null, ageMin: 90, likes: likes(11),
      title: 'Tried sundae-gukbap for the first time today',
      body: 'I was scared of it but it was so good. What should I try next?',
      comments: [
        c({ snap: BAT, ageMin: 80, body: 'Try gamja-tang next! 🥔' }),
        c({ snap: ADMIN, admin: true, ageMin: 70, body: 'Congrats 😄 Next level: add a little salted shrimp (saeujeot) to it.' }),
      ],
    }),
    p({
      board: 'free', snap: null, ageMin: 400, likes: likes(8),
      title: 'Anyone else find the first month the hardest?',
      body: 'No buddy, no friends yet, everything in Korean. It is getting better slowly. Just wanted to say you are not alone.',
      comments: [c({ snap: WEI, ageMin: 350, body: 'Yes!! Month two was much better for me.' })],
    }),
    p({ board: 'l-vi', snap: LIN, ageMin: 200, likes: likes(3), title: 'Có ai học ở Suwon campus không?', body: 'Cuối tuần đi ăn phở cùng nhau nhé 🍜' }),
    p({ board: 'l-zh', snap: WEI, ageMin: 260, likes: likes(2), title: '有没有人周末一起去明洞？', body: '想买点东西，顺便吃饭。' }),
    p({ board: 'l-en', snap: MATEO, ageMin: 330, likes: likes(5), title: 'Where do you all buy groceries?', body: 'Looking for cheap fruit and vegetables near campus.' }),
    p({ board: 'l-uz', snap: AZIZ, ageMin: 600, likes: likes(2), title: 'Salom! Suwon kampusida o‘zbeklar bormi?', body: 'Birga osh qilamiz 🍚' }),
    p({ board: 'l-mn', snap: BAT, ageMin: 700, likes: likes(1), title: 'Сайн байна уу! Монгол оюутнууд байна уу?', body: 'Хамтдаа хоол идэх үү?' }),
    p({ board: 'l-ja', snap: YUKI, ageMin: 800, likes: likes(2), title: 'こんにちは！日本人の留学生いますか？', body: '一緒にカフェ行きましょう ☕' }),
    p({ board: 'l-ko', snap: WEI, ageMin: 150, likes: likes(4), title: '한국어 연습해요 — 오늘 뭐 먹었어요?', body: '저는 김밥 먹었어요! 틀려도 괜찮아요 😊' }),
  ]

  // ----- v3 additions (fixed ids so a live v2 db can take them without clashes) -----
  questions.push({
    id: 'q3seed01', kind: 'know', tag: 'life', bounty: 0, status: 'open', seed: true, reports: [], author: 'seed-Bat', snap: BAT, ageMin: 55,
    title: 'Where can I buy a cheap rice cooker near campus?', body: 'Free question — no points, just curious 🙂',
    answers: [{ id: 'a3seed01', reports: [], seed: true, author: 'seed-Linh', snap: LIN, ageMin: 40, body: 'Daiso has small ones! Or check the used-goods posts in the Free board.' }],
  })
  posts.push(
    {
      id: 'p3seed01', board: 'free', snap: ADMIN, admin: true, ageMin: 30, likes: likes(7), seed: true, reports: [], author: 'seed-Minji',
      title: '시험 기간 다들 힘내요! 학교 근처 조용한 카페 추천 받아요 ☕',
      body: '저는 멘토 민지예요. 다음 주부터 중간고사라서 같이 공부할 곳을 찾고 있어요. 각 나라 친구들은 시험 기간에 뭘 먹는지도 궁금해요!',
      comments: [{ id: 'c3seed01', reports: [], seed: true, author: 'seed-Wei', snap: WEI, ageMin: 20, body: '我们考试的时候喝很多奶茶 🧋 哈哈' }],
    },
    {
      id: 'p3seed02', board: 'together', snap: AZIZ, ageMin: 70, likes: likes(3), seed: true, reports: [], comments: [], author: 'seed-Aziz',
      title: 'Bugun kechqurun badminton o‘ynaymizmi? 🏸',
      body: 'Hech kim bo‘lmasa ham, yangi do‘stlar bilan o‘ynashni xohlayman. Raketka bor!',
      meetup: { inDays: 0, place: 'Seoul campus gym', cap: 4, joined: ['seed-Aziz'] },
    },
  )

  // Groups: same school + same country, 3–4 students + 1 verified Korean mentor. Free.
  const MINJI = ADMIN
  const JIHUN = S('Jihun', '⭐', 4)
  const SEOYEON = S('Seoyeon', '🍀', 2)
  let mn = 0
  const msg = (snap, body, ageMin, mentor = false) => ({ id: `mseed${String(++mn).padStart(3, '0')}`, author: 'seed-' + snap.nick, snap, body, ageMin, mentor, seed: true })
  const mem = (snap, ageMin) => ({ pid: 'seed-' + snap.nick, snap, seed: true, ageMin })
  const g = (id, country, n, members, mentors, messages) => ({
    id, school: 'skku', country, n, seed: true, members, messages, missions: {},
    mentors: mentors.map((snap) => ({ pid: 'seed-' + snap.nick, snap, seed: true })),
  })
  const BEA = S('Bea', '🍀', 5), CARLO = S('Carlo', '🐧', 4), MARIA = S('Maria', '🌸', 1), JOSE = S('Jose', '🦊', 3)
  const ANA = S('Ana', '🦋', 6), PAOLO = S('Paolo', '🐙', 2)
  const HOA = S('Hoa', '🦋', 1), MINH = S('Minh', '🦉', 4), TRANG = S('Trang', '🍀', 5)
  const LEI = S('Lei', '🐨', 3), FANG = S('Fang', '🌙', 0)
  const DIL = S('Dilnoza', '🌸', 6), SARAA = S('Saraa', '🦋', 2), TEMU = S('Temuujin', '🦊', 1)
  const HARU = S('Haruto', '⭐', 3), THANDAR = S('Thandar', '🌸', 0), AUNG = S('Aung', '🦉', 5)

  function PH2_MESSAGES() {
    return [
      { ...msg(BEA, 'Hi everyone! Bea from Manila 🇵🇭 Wednesday lunch at the student union?', 1480), id: 'mseed2v6a' },
      { ...msg(CARLO, 'Pwede ako sa Miyerkules! Sana may Korean mentor na tayo soon 😄', 1460), id: 'mseed2v6b' },
      { ...msg(BEA, 'Excited to meet our 3rd member! 🇵🇭', 300), id: 'mseed2v6c' },
    ]
  }
  const groups = [
    g('gseed01', 'ph', 1, [mem(MARIA, 20000), mem(JOSE, 19000), mem(ANA, 18000), mem(PAOLO, 15000)], [JIHUN], [
      msg(JIHUN, '필리핀 1조 여러분, 이번 주 미션은 「서로의 나라 노래 한 곡씩 추천하기」예요 🎵', 4000, true),
      msg(MARIA, 'Ben&Ben – Maybe The Night! 🇵🇭', 3900),
      msg(JOSE, 'Hindi ko alam ang Korean songs… Jihun, ano ang paborito mo?', 3850),
      msg(JIHUN, '저는 아이유 「밤편지」요! 다음 모임 때 노래방 가요 🎤', 3800, true),
    ]),
    // v6 (2026-10-03): one mentor per group — Philippines 2 waits for its Korean mentor, so the demo can show
    // a new student joining and a Korean student becoming the group's mentor.
    g('gseed02', 'ph', 2, [mem(BEA, 3000), mem(CARLO, 2600)], [], PH2_MESSAGES()),
    g('gseed03', 'vn', 1, [mem(LIN, 25000), mem(HOA, 24000), mem(MINH, 22000), mem(TRANG, 21000)], [SEOYEON], [
      msg(SEOYEON, '베트남 여성의 날 이벤트 열었어요! 이벤트 탭에서 신청해 주세요 💐', 2000, true),
      msg(LIN, 'Ngày 20/10 mình làm bánh mì cùng nhau nhé! 🥖', 1900),
      msg(HOA, 'Hay quá! Mình sẽ mang hoa 🌷', 1850),
    ]),
    g('gseed04', 'cn', 1, [mem(WEI, 16000), mem(LEI, 15000), mem(FANG, 9000)], [JIHUN], [
      msg(WEI, '这周末一起去明洞吗？', 700),
      msg(JIHUN, '좋아요! 토요일 2시에 명동역 6번 출구 어때요?', 650, true),
      msg(FANG, '好的！我第一次去明洞 😆', 640),
    ]),
    g('gseed05', 'uz', 1, [mem(AZIZ, 6000), mem(DIL, 5000)], [], [
      msg(AZIZ, 'Salom! Birinchi uchrashuvni qachon qilamiz?', 900),
      msg(DIL, 'Mentor kelganda boshlaymiz 😊', 880),
    ]),
    g('gseed06', 'mn', 1, [mem(BAT, 14000), mem(SARAA, 13000), mem(TEMU, 12000)], [MINJI], [
      msg(SARAA, 'Энэ долоо хоногт хамтдаа хуушуур хийх үү? 🥟', 800),
      msg(MINJI, '좋아요! 저도 호쇼르 만드는 법 배우고 싶어요 😋', 780, true),
    ]),
    g('gseed07', 'jp', 1, [mem(YUKI, 8000), mem(HARU, 7000)], [], [msg(YUKI, 'はじめまして！よろしくお願いします 🙇', 600)]),
    g('gseed08', 'mm', 1, [mem(THANDAR, 4000), mem(AUNG, 3500)], [SEOYEON], [
      msg(THANDAR, 'မင်္ဂလာပါ! ဒီအပတ် ဘာလုပ်ကြမလဲ?', 500),
      msg(SEOYEON, '이번 주에 같이 한강 가요! 🌊', 480, true),
    ]),
  ]
  for (const gr of groups) gr.messages.unshift({ id: gr.id + 'start', system: 'start', snap: null, body: '', ageMin: gr.messages[0]?.ageMin + 5 || 60, seed: true })

  // Events: the main revenue. Hosted by Korean mentors or the Eoullim team; fee paid on joining.
  const J = (...snaps) => snaps.map((x) => ({ pid: 'seed-' + x.nick, snap: x }))
  const anon = (k) => Array.from({ length: k }, (_, i) => ({ pid: 'seed-guest' + i, snap: null }))
  const TEAM = S('Eoullim', '🌙', 7)
  const ev = (o) => ({ seed: true, status: 'open', hostType: 'mentor', created: now, ...o })
  const events = [
    ev({
      id: 'eseed01', cat: 'country', country: 'kr', emoji: '✍️', date: '2026-10-09', time: '15:00', fee: 10000, cap: 15, min: 5,
      title: '한글날 — 내 이름을 한글 캘리그라피로', place: '인사캠 학생회관 세미나실',
      body: '10월 9일은 한글이 만들어진 것을 기념하는 날이에요. 붓펜으로 내 이름과 좋아하는 한국어 단어를 써서 액자로 가져가요. 재료비 포함.',
      host: 'seed-Minji', hostSnap: MINJI, joined: [...J(MARIA, WEI, YUKI, LEI, HOA), ...anon(3)],
    }),
    ev({
      id: 'eseed02', cat: 'korea', emoji: '👘', date: '2026-10-11', time: '13:00', fee: 20000, cap: 10, min: 4,
      title: '한복 입고 경복궁 산책', place: '경복궁역 5번 출구',
      body: '한복을 입으면 경복궁 입장이 무료예요. 2시간 한복 대여 + 멘토가 사진 찍어 드려요 📸',
      host: 'seed-Jihun', hostSnap: JIHUN, joined: J(ANA, FANG, SARAA, TRANG),
    }),
    ev({
      id: 'eseed03', cat: 'korea', emoji: '🔮', date: '2026-10-17', time: '14:00', fee: 18000, cap: 8, min: 4,
      title: '사주 카페에서 보는 나의 2027년', place: '홍대입구역 근처 사주 카페',
      body: '태어난 날과 시간으로 보는 한국식 운세 「사주」를 체험해요. 멘토가 옆에서 통역해 줘요. 음료 한 잔 포함.',
      host: 'seed-Minji', hostSnap: MINJI, joined: J(MARIA, BEA, LIN, WEI, YUKI),
    }),
    ev({
      id: 'eseed04', cat: 'country', country: 'vn', emoji: '💐', date: '2026-10-20', time: '18:30', fee: 8000, cap: 20, min: 6,
      title: '베트남 여성의 날 — 꽃 선물 & 반미 만들기', place: '인사캠 학생회관',
      body: '10월 20일은 베트남 여성의 날이에요. 베트남 조가 준비하고, 누구나 와서 꽃다발을 만들고 반미를 같이 먹어요.',
      host: 'seed-Seoyeon', hostSnap: SEOYEON, joined: [...J(LIN, HOA, MINH, TRANG), ...anon(2)],
    }),
    ev({
      id: 'eseed05', cat: 'group', emoji: '🏆', date: '2026-10-24', time: '10:00', fee: 7000, cap: 48, min: 16,
      title: '어울림 그룹 대항 가을 체육대회', place: '캠퍼스 운동장 (확정되면 공지)',
      body: '조별로 피구·이어달리기·줄다리기! 1등 조에게 단체 삼겹살 회식권 🥓 참가비는 간식·물·상품에 쓰여요.',
      host: 'seed-Eoullim', hostSnap: TEAM, hostType: 'eoullim',
      joined: J(MARIA, JOSE, ANA, PAOLO, LIN, HOA, MINH, TRANG, WEI, LEI, FANG, BAT, SARAA, TEMU),
    }),
    ev({
      id: 'eseed06', cat: 'korea', emoji: '👻', date: '2026-10-30', time: '19:30', fee: 15000, cap: 12, min: 6,
      title: '신당동 골목 괴담 야간 투어 + 떡볶이', place: '신당역 집결',
      body: '한국 귀신 이야기를 들으며 신당동 골목을 걷고, 마지막엔 신당동 떡볶이 골목에서 다 같이 먹어요 🌶️ 무서운 것 잘 못 봐도 괜찮아요.',
      host: 'seed-Eoullim', hostSnap: TEAM, hostType: 'eoullim', joined: [...J(JOSE, CARLO, MINH, TEMU), ...anon(3)],
    }),
    ev({
      id: 'eseed07', cat: 'country', country: 'ph', emoji: '🕯️', date: '2026-11-01', time: '18:00', fee: 12000, cap: 16, min: 6,
      title: 'Undas — 필리핀식 가족 저녁 (아도보 & 판싯)', place: '캠퍼스 근처 공유주방',
      body: '11월 1일은 필리핀에서 가족이 모여 조상을 기리는 날이에요. 필리핀 조가 아도보와 판싯을 만들어요. 한국 학생도 환영!',
      host: 'seed-Jihun', hostSnap: JIHUN, joined: J(MARIA, JOSE, ANA, PAOLO, BEA, CARLO),
    }),
    ev({
      id: 'eseed08', cat: 'country', country: 'uz', emoji: '🍚', date: '2026-12-08', time: '18:30', fee: 10000, cap: 16, min: 6,
      title: '우즈베키스탄 헌법의 날 — 플롭 같이 만들기', place: '캠퍼스 근처 공유주방',
      body: '12월 8일은 우즈베키스탄 헌법의 날이에요. 큰 냄비에 플롭(쁠롭)을 만들어 다 같이 나눠 먹어요.',
      host: 'seed-Eoullim', hostSnap: TEAM, hostType: 'eoullim', joined: J(AZIZ, DIL),
    }),
  ]

  return { v: 6, seededAt: now, devices: {}, questions, posts, groups, events, payments: [], ledger: [], adminLog: [], mentorCodes: [] }
}
