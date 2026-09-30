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
const ADMIN = S('Minji · Korean manager', '🐯', 0)

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

  return { v: 2, seededAt: now, devices: {}, questions, posts, ledger: [], adminLog: [] }
}
