// Eoullim v3 server rules. Pure functions over one JSON document (db).
// v3 (2026-10-01): groups (same country 3–4 + one Korean mentor, free) · paid events (main revenue, fee commission)
// · one Community board where points on a question are optional (secondary revenue).
// No accounts: a device holds a random key; we only ever store a hash of it (pid).
import crypto from 'node:crypto'
import { seedDb } from './seed.js'

export const RULES = {
  WON_PER_POINT: 100, // 100원 = 1P (2026-09-30 동근님)
  STARTER: 30,
  MIN_BOUNTY: 0, // v3: points on a question are optional
  MAX_BOUNTY: 1000,
  NO_ANSWER_REFUND_H: 72,
  REVIEW_AFTER_D: 7,
  REPORT_HIDE: 3,
  ADMIN_POOL_RATE: 0.3,
  PACKS: [10, 30, 50, 100], // points; price = points × 100원
  // groups (free)
  GROUP_CAP: 4, // students per group (+ 1 Korean mentor)
  GROUP_START: 3, // a group "starts" at 3 students
  FRIEND_CAP: 2, // Korean friends per group (besides the mentor) — 2026-10-01 mentoring feedback
  KR_INTERESTS: 3, // countries a Korean student can follow
  MENTOR_MAX: 3, // groups one mentor can look after
  // events (main revenue)
  EVENT_RATE: 0.15, // Eoullim keeps 15% of each fee; 85% is the host's budget to run the event
  CANCEL_FREE_D: 2, // free cancellation until 2 days before
  MAX_FEE: 200000,
}
const HOUR = 3600e3
const LIMITS = { title: 80, body: 1000, comment: 300, nick: 20, place: 60, msg: 500 }
const DAY = 24 * HOUR

export const KINDS = ['know', 'borrow', 'do']
export const TAGS = ['life', 'admin', 'school', 'health', 'housing', 'korean', 'kstyle', 'etc']
export const BOARDS = ['together', 'free', 'l-en', 'l-zh', 'l-vi', 'l-uz', 'l-mn', 'l-ja', 'l-ko']
export const SCHOOLS = ['skku', 'handong', 'cnu', 'other']
export const COUNTRIES = ['ph', 'vn', 'cn', 'jp', 'uz', 'mn', 'mm', 'id', 'th', 'np', 'us', 'fr', 'de', 'other']
export const EVENT_CATS = ['korea', 'country', 'group']
const EVENT_EMOJI = ['🔮', '👻', '👘', '🏯', '🍜', '🎤', '🎨', '🏆', '⚽', '💐', '🕯️', '🍚', '🎉', '🏮', '🥟', '🍲', '✍️', '⛰️']
// Korea time helpers: event dates are written in KST.
const kstDay = (now, plus = 0) => new Date(now + plus * DAY + 9 * HOUR).toISOString().slice(0, 10)
export const eventStart = (e) => Date.parse(`${e.date}T${e.time || '00:00'}:00+09:00`)
// Weeks start on Monday (KST); group missions rotate weekly.
export const weekOf = (now) => Math.floor((now + 9 * HOUR - 4 * DAY) / (7 * DAY))

export class UserError extends Error {
  constructor(code, status = 400) {
    super(code)
    this.code = code
    this.status = status
  }
}
const fail = (code, status) => {
  throw new UserError(code, status)
}

// ---------- identity ----------
const KEY_RE = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/
export function pidOf(key) {
  if (typeof key !== 'string' || !KEY_RE.test(key)) fail('bad_key', 401)
  return crypto.createHash('sha256').update('eoullim:' + key).digest('hex').slice(0, 12)
}
const newId = (p) => p + crypto.randomBytes(5).toString('hex')

// ---------- text guards ----------
const PHONE = /(?:\+?82[-.\s]?)?0?1[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/g
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g
const HANDLE = /((?:카톡|카카오톡|카카오|kakao(?:talk)?|line|wechat|위챗|instagram|insta|인스타|telegram|텔레그램)\s*(?:id|아이디)?\s*[:：]?\s*)@?[\w.-]{3,}/gi

export function maskText(s) {
  let masked = false
  const out = s
    .replace(PHONE, () => ((masked = true), '***'))
    .replace(EMAIL, () => ((masked = true), '***'))
    .replace(HANDLE, (_, label) => ((masked = true), label + '***'))
  return { text: out, masked }
}

const BANNED = [
  /대리\s*출석/, /과제\s*(대행|대신)/, /대신\s*(과제|숙제|시험)/, /시험\s*(답|대신|부정)/, /족보\s*팔/,
  /돈\s*(좀\s*)?빌려/, /(신분증|학생증|외국인\s*등록증|계정)\s*(좀\s*)?빌려/,
  /proxy\s*attendance/i, /(attend|sign\s*in)\s.*for\s*me/i, /do\s*my\s*(homework|assignment|essay)/i,
  /exam\s*answers?/i, /(lend|borrow)\s*(me\s*)?(some\s*)?money/i, /(borrow|lend).*(id\s*card|student\s*card|account)/i,
]
export const isBanned = (s) => BANNED.some((re) => re.test(s))

function clean(s, max, { required = true } = {}) {
  const t = typeof s === 'string' ? s.trim().replace(/\s+\n/g, '\n').slice(0, max) : ''
  if (required && !t) fail('empty')
  return t
}
const AVATARS = ['🐯', '🦊', '🐼', '🐨', '🐧', '🦉', '🐙', '🦋', '🌸', '🍀', '🌙', '⭐']
function cleanSnap(snap, anon) {
  if (anon || !snap || typeof snap !== 'object') return null
  const nick = clean(snap.nick, LIMITS.nick, { required: false })
  if (!nick) return null
  return {
    nick: maskText(nick).text,
    avatar: AVATARS.includes(snap.avatar) ? snap.avatar : '🐯',
    color: Number.isInteger(snap.color) ? Math.max(0, Math.min(7, snap.color)) : 0,
  }
}

// ---------- db helpers ----------
export function emptyDb(now = Date.now()) {
  return seedDb(now)
}
// v2 → v3: add groups, events and payments (and the new example posts) to a live db without touching user data.
export function migrate(db) {
  if ((db.v || 0) >= 3) return migrate4(db)
  const s = seedDb(db.seededAt || Date.now())
  db.groups = db.groups || s.groups
  db.events = db.events || s.events
  db.payments = db.payments || []
  for (const q of s.questions) if (!db.questions.some((x) => x.id === q.id)) db.questions.push(q)
  for (const p of s.posts) if (!db.posts.some((x) => x.id === p.id)) db.posts.push(p)
  db.v = 3
  return migrate4(db)
}
// v3 → v4: Korean friends. Every group gets an empty friends list; the Vietnam example group gets one example friend.
function migrate4(db) {
  if ((db.v || 0) >= 4) return db
  const s = seedDb(db.seededAt || Date.now())
  for (const g of db.groups) {
    g.friends = g.friends || []
    const sg = s.groups.find((x) => x.id === g.id)
    if (sg?.friends?.length && !g.friends.length) {
      g.friends.push(...sg.friends)
      const extra = sg.messages.filter((m) => !g.messages.some((x) => x.id === m.id))
      for (const m of extra) {
        // keep example messages in time order
        const i = g.messages.findIndex((x) => x.seed && x.ageMin != null && x.ageMin < m.ageMin)
        g.messages.splice(i < 0 ? g.messages.length : i, 0, m)
      }
    }
  }
  db.v = 4
  return db
}
function device(db, pid) {
  const d = db.devices[pid]
  if (!d) fail('no_device', 401)
  return d
}
function ledger(db, pid, delta, reason, ref, extra = {}) {
  db.ledger.push({ id: newId('l'), pid, delta, reason, ref, at: Date.now(), ...extra })
  if (db.ledger.length > 8000) db.ledger.splice(0, db.ledger.length - 8000)
}
function move(db, fromPid, toPid, amount, reason, ref) {
  if (fromPid) {
    const d = device(db, fromPid)
    if (d.points < amount) fail('not_enough_points')
    d.points -= amount
    ledger(db, fromPid, -amount, reason, ref)
  }
  if (toPid && db.devices[toPid]) {
    db.devices[toPid].points += amount
    ledger(db, toPid, amount, reason, ref)
  }
}
const findG = (db, id) => (db.groups || []).find((g) => g.id === id) || fail('not_found', 404)
const findE = (db, id) => (db.events || []).find((e) => e.id === id) || fail('not_found', 404)
const inGroup = (g, pid) => g.members.some((m) => m.pid === pid) || (g.friends || []).some((m) => m.pid === pid)
const findMyGroup = (db, pid) => (db.groups || []).find((g) => inGroup(g, pid))
const OFFERS = ['language', 'life', 'hangout']
function sysMsg(g, type, snap) {
  g.messages.push({ id: newId('m'), system: type, snap: snap || null, body: '', created: Date.now() })
}
const findQ = (db, id) => db.questions.find((q) => q.id === id) || fail('not_found', 404)
const findP = (db, id) => db.posts.find((p) => p.id === id) || fail('not_found', 404)
const requireAdmin = (db, pid) => device(db, pid).admin || fail('not_admin', 403)
const adminLog = (db, pid, type, ref) => db.adminLog.push({ pid, type, ref, at: Date.now() })
const liveAnswers = (q) => q.answers.filter((a) => !a.hidden)

// Time rules, applied lazily whenever the db is read. Returns true if anything changed.
export function sweep(db, now = Date.now()) {
  let changed = false
  for (const q of db.questions) {
    // Free questions (0 P) have nothing to refund or decide: they simply stay open.
    if (q.status !== 'open' || q.seed || !q.bounty) continue
    const age = now - q.created
    if (liveAnswers(q).length === 0 && age > RULES.NO_ANSWER_REFUND_H * HOUR) {
      q.status = 'refunded'
      q.closed = now
      q.refundReason = 'auto'
      if (db.devices[q.author]) {
        db.devices[q.author].points += q.bounty
        ledger(db, q.author, q.bounty, 'refund_auto', q.id)
      }
      changed = true
    } else if (liveAnswers(q).length > 0 && age > RULES.REVIEW_AFTER_D * 24 * HOUR) {
      q.status = 'review'
      changed = true
    }
  }
  // Events: if the minimum number of people hasn't joined 2 days before, cancel and refund everyone.
  for (const e of db.events || []) {
    if (e.status !== 'open' || e.seed) continue
    if (now >= eventStart(e) - RULES.CANCEL_FREE_D * DAY && e.joined.length < e.min) {
      e.status = 'cancelled'
      e.cancelReason = 'min'
      refundEvent(db, e)
      changed = true
    }
  }
  return changed
}
function refundEvent(db, e, onlyPid) {
  for (const pay of db.payments) {
    if (pay.eid === e.id && pay.status === 'paid' && (!onlyPid || pay.pid === onlyPid)) {
      pay.status = 'refunded'
      pay.refundedAt = Date.now()
    }
  }
}

function adoptedCounts(db) {
  const m = {}
  for (const q of db.questions) {
    if (q.status !== 'adopted') continue
    const a = q.answers.find((x) => x.id === q.adopted)
    if (a) m[a.author] = (m[a.author] || 0) + 1
  }
  return m
}
export function levelOf(n) {
  if (n >= 20) return 3
  if (n >= 5) return 2
  if (n >= 1) return 1
  return 0
}

// ---------- the public view of the db for one device ----------
export function view(db, pid, now = Date.now()) {
  const me = db.devices[pid]
  const isAdmin = !!me?.admin
  const counts = adoptedCounts(db)
  const lv = (p) => levelOf(counts[p] || 0)
  const canSee = (item) => !item.hidden || isAdmin || item.author === pid
  // Seed (example) items keep a fixed age so the demo board looks the same on any day.
  const at = (item) => (item.seed && item.ageMin != null ? now - item.ageMin * 60e3 : item.created)
  const day = (d) => new Date(now + d * 864e5 + 9 * 3600e3).toISOString().slice(0, 10)

  const questions = db.questions.filter(canSee).map((q) => ({
    id: q.id, kind: q.kind, tag: q.tag, title: q.title, body: q.body, bounty: q.bounty,
    status: q.status, created: at(q), closed: q.closed, adopted: q.adopted, refundReason: q.refundReason,
    hidden: !!q.hidden, seed: !!q.seed, snap: q.snap, level: lv(q.author),
    mine: q.author === pid, reports: isAdmin ? q.reports.length : undefined,
    reported: q.reports.includes(pid),
    answers: q.answers.filter(canSee).map((a) => ({
      id: a.id, body: a.body, created: at(a), snap: a.snap, admin: !!a.admin, thanks: a.thanks,
      hidden: !!a.hidden, seed: !!a.seed, level: lv(a.author), mine: a.author === pid,
      reports: isAdmin ? a.reports.length : undefined, reported: a.reports.includes(pid),
    })),
  }))

  const posts = db.posts.filter(canSee).map((p) => ({
    id: p.id, board: p.board, title: p.title, body: p.body, created: at(p), snap: p.snap, admin: !!p.admin,
    hidden: !!p.hidden, seed: !!p.seed, level: lv(p.author), mine: p.author === pid,
    likes: p.likes.length, liked: p.likes.includes(pid),
    meetup: p.meetup && { ...p.meetup, date: p.meetup.inDays != null ? day(p.meetup.inDays) : p.meetup.date, joined: p.meetup.joined.length, iJoined: p.meetup.joined.includes(pid) },
    reports: isAdmin ? p.reports.length : undefined, reported: p.reports.includes(pid),
    comments: p.comments.filter(canSee).map((c) => ({
      id: c.id, body: c.body, created: at(c), snap: c.snap, admin: !!c.admin, hidden: !!c.hidden,
      seed: !!c.seed, mine: c.author === pid, reports: isAdmin ? c.reports.length : undefined,
      reported: c.reports.includes(pid),
    })),
  }))

  // ----- groups: everyone sees the directory; only members and the mentor see the chat -----
  const groups = db.groups || []
  const groupOfPid = {}
  for (const g of groups) for (const m of [...g.members, ...(g.friends || [])]) groupOfPid[m.pid] = g
  const myGroup = groupOfPid[pid] || null
  const amFriend = !!myGroup && (myGroup.friends || []).some((m) => m.pid === pid)
  // How many Korean students follow each country (real devices + example friends).
  const krFans = {}
  for (const d of Object.values(db.devices)) for (const c of d.kr?.countries || []) krFans[c] = (krFans[c] || 0) + 1
  for (const g of groups) for (const f of g.friends || []) if (f.seed) krFans[g.country] = (krFans[g.country] || 0) + 1
  const gname = (g) => ({ id: g.id, school: g.school, country: g.country, n: g.n })
  const week = weekOf(now)
  const groupDir = groups.map((g) => ({
    ...gname(g), members: g.members.length, mentor: g.mentorSnap || (g.mentor ? {} : null),
    hasMentor: !!g.mentor, mine: g === myGroup, mentoring: g.mentor === pid,
    friends: (g.friends || []).length, friendSeats: RULES.FRIEND_CAP - (g.friends || []).length,
  }))
  const myGroups = groups
    .filter((g) => g === myGroup || (g.mentor && g.mentor === pid))
    .map((g) => ({
      ...gname(g),
      mentoring: g.mentor === pid,
      friend: g === myGroup && amFriend,
      friends: (g.friends || []).map((m) => ({ snap: m.snap, me: m.pid === pid })),
      mentor: g.mentor ? g.mentorSnap || null : null,
      hasMentor: !!g.mentor,
      members: g.members.map((m) => ({ snap: m.snap, me: m.pid === pid, joined: m.seed ? now - (m.ageMin || 0) * 60e3 : m.joined })),
      missionDone: !!g.missions?.[week],
      missionBy: g.missions?.[week]?.snap || null,
      messages: g.messages.slice(-120).map((m) => ({
        id: m.id, body: m.body, snap: m.snap, mentor: !!m.mentor, friend: !!m.friend, system: m.system || null,
        created: at(m), mine: m.author === pid, seed: !!m.seed,
      })),
    }))

  // ----- events -----
  const today = day(0)
  const events = (db.events || []).map((e) => {
    const gs = {}
    for (const j of e.joined) {
      const g = groupOfPid[j.pid]
      if (!g) continue
      gs[g.id] = gs[g.id] || { ...gname(g), count: 0 }
      gs[g.id].count += 1
    }
    return {
      id: e.id, cat: e.cat, country: e.country || null, emoji: e.emoji, title: e.title, body: e.body,
      date: e.date, time: e.time, place: e.place, fee: e.fee, cap: e.cap, min: e.min,
      host: e.hostSnap || null, hostType: e.hostType, mine: e.host === pid, seed: !!e.seed,
      status: e.status === 'open' && e.date < today ? 'done' : e.status, cancelReason: e.cancelReason,
      joined: e.joined.length, iJoined: e.joined.some((j) => j.pid === pid),
      people: e.joined.slice(0, 10).map((j) => j.snap),
      groups: Object.values(gs).sort((a, b) => b.count - a.count),
      myGroupCount: myGroup ? e.joined.filter((j) => groupOfPid[j.pid] === myGroup).length : 0,
      krFans: e.country && e.country !== 'kr' ? krFans[e.country] || 0 : 0,
      start: eventStart(e),
    }
  })

  const out = {
    now,
    week,
    rules: RULES,
    me: me ? { pid, points: me.points, admin: isAdmin, adopted: counts[pid] || 0, level: lv(pid), group: myGroup ? gname(myGroup) : null, kr: me.kr || null, friend: amFriend } : null,
    krFans,
    questions,
    posts,
    groups: groupDir,
    myGroups,
    events,
    payments: (db.payments || []).filter((x) => x.pid === pid).slice(-30).reverse().map((x) => ({ id: x.id, eid: x.eid, won: x.won, status: x.status, at: x.at })),
    ledger: db.ledger.filter((l) => l.pid === pid).slice(-60).reverse(),
  }
  if (isAdmin) out.adminStats = adminStats(db)
  return out
}

// Money, in one place. Events are the main revenue (15% commission); points are the second.
// 30% of Eoullim's revenue goes to the Korean mentors, split by the work they did.
function adminStats(db) {
  const chargedWon = db.ledger.filter((l) => l.reason === 'charge').reduce((s, l) => s + (l.won || 0), 0)
  const paid = (db.payments || []).filter((x) => x.status === 'paid')
  const eventWon = paid.reduce((s, x) => s + x.won, 0)
  const commission = paid.reduce((s, x) => s + x.commission, 0)
  const revenue = commission + chargedWon
  const pool = Math.floor(revenue * RULES.ADMIN_POOL_RATE)
  const work = {}
  for (const e of db.adminLog) work[e.pid] = (work[e.pid] || 0) + 1
  for (const q of db.questions) {
    const a = q.status === 'adopted' && q.answers.find((x) => x.id === q.adopted)
    if (a?.admin && !a.seed) work[a.author] = (work[a.author] || 0) + 1 // example mentors never get paid
  }
  const total = Object.values(work).reduce((s, n) => s + n, 0)
  const admins = Object.entries(work).map(([pid, n]) => ({ pid, work: n, won: total ? Math.floor((pool * n) / total) : 0 }))
  return {
    chargedWon, eventWon, commission, revenue, pool, rate: RULES.ADMIN_POOL_RATE, eventRate: RULES.EVENT_RATE,
    payments: paid.length, admins, totalWork: total,
  }
}

// ---------- actions ----------
export function apply(db, pid, action, p = {}, env = {}) {
  const now = Date.now()
  switch (action) {
    case 'hello': {
      if (!db.devices[pid]) {
        db.devices[pid] = { points: 0, created: now, admin: false }
        move(db, null, pid, RULES.STARTER, 'starter', null)
      }
      return
    }
    case 'ask': {
      const kind = KINDS.includes(p.kind) ? p.kind : fail('bad_kind')
      const tag = TAGS.includes(p.tag) ? p.tag : 'etc'
      const title = clean(p.title, LIMITS.title)
      const body = clean(p.body, LIMITS.body, { required: false })
      if (isBanned(title + ' ' + body)) fail('banned')
      const bounty = Number(p.bounty)
      if (!Number.isInteger(bounty) || bounty < RULES.MIN_BOUNTY || bounty > RULES.MAX_BOUNTY) fail('bad_bounty')
      const q = {
        id: newId('q'), kind, tag, title: maskText(title).text, body: maskText(body).text, bounty,
        author: pid, snap: cleanSnap(p.snap, p.anon), created: now, status: 'open', answers: [], reports: [],
      }
      if (bounty > 0) move(db, pid, null, bounty, 'ask', q.id)
      db.questions.unshift(q)
      return { id: q.id }
    }
    case 'answer': {
      const q = findQ(db, p.qid)
      if (!['open', 'review'].includes(q.status)) fail('closed')
      if (q.author === pid) fail('own_question')
      const body = clean(p.body, LIMITS.body)
      const d = device(db, pid)
      const a = {
        id: newId('a'), body: maskText(body).text, author: pid, snap: cleanSnap(p.snap, p.anon),
        admin: d.admin, created: now, reports: [],
      }
      q.answers.push(a)
      return { id: a.id }
    }
    case 'adopt': {
      const q = findQ(db, p.qid)
      if (q.author !== pid) fail('not_author', 403)
      return adopt(db, q, p.aid, clean(p.thanks, 120, { required: false }))
    }
    case 'raise': {
      const q = findQ(db, p.qid)
      if (q.author !== pid) fail('not_author', 403)
      if (q.status !== 'open') fail('closed')
      const amount = Number(p.amount)
      if (!Number.isInteger(amount) || amount < 1 || q.bounty + amount > RULES.MAX_BOUNTY) fail('bad_bounty')
      move(db, pid, null, amount, 'raise', q.id)
      q.bounty += amount
      return
    }
    case 'delQuestion': {
      const q = findQ(db, p.qid)
      if (q.author !== pid) fail('not_author', 403)
      if (q.status !== 'open') fail('closed')
      if (q.answers.length > 0) fail('has_answers')
      db.questions = db.questions.filter((x) => x !== q)
      if (q.bounty > 0) move(db, null, pid, q.bounty, 'refund_delete', q.id)
      return
    }
    case 'post': {
      const board = BOARDS.includes(p.board) ? p.board : fail('bad_board')
      const title = clean(p.title, LIMITS.title)
      const body = clean(p.body, LIMITS.body, { required: false })
      if (isBanned(title + ' ' + body)) fail('banned')
      let meetup = null
      if (board === 'together') {
        const cap = Number(p.meetup?.cap)
        if (!Number.isInteger(cap) || cap < 2 || cap > 50) fail('bad_cap')
        meetup = {
          date: clean(p.meetup?.date, 16),
          place: maskText(clean(p.meetup?.place, LIMITS.place)).text,
          cap,
          joined: [pid],
        }
      }
      const post = {
        id: newId('p'), board, title: maskText(title).text, body: maskText(body).text, author: pid,
        snap: cleanSnap(p.snap, p.anon), admin: !!device(db, pid).admin, created: now, likes: [], comments: [], reports: [], meetup,
      }
      db.posts.unshift(post)
      return { id: post.id }
    }
    case 'comment': {
      const post = findP(db, p.postId)
      const d = device(db, pid)
      const c = {
        id: newId('c'), body: maskText(clean(p.body, LIMITS.comment)).text, author: pid,
        snap: cleanSnap(p.snap, p.anon), admin: d.admin, created: now, reports: [],
      }
      post.comments.push(c)
      return { id: c.id }
    }
    case 'like': {
      const post = findP(db, p.postId)
      post.likes = post.likes.includes(pid) ? post.likes.filter((x) => x !== pid) : [...post.likes, pid]
      return
    }
    case 'join': {
      const post = findP(db, p.postId)
      const m = post.meetup || fail('not_meetup')
      if (post.author === pid) fail('own_post')
      if (m.joined.includes(pid)) m.joined = m.joined.filter((x) => x !== pid)
      else if (m.joined.length >= m.cap) fail('full')
      else m.joined.push(pid)
      return
    }
    case 'report': {
      const item = locate(db, p)
      if (item.author === pid) fail('own_item')
      if (!item.reports.includes(pid)) item.reports.push(pid)
      if (item.reports.length >= RULES.REPORT_HIDE) item.hidden = true
      return
    }
    case 'charge': {
      const pts = Number(p.points)
      if (!RULES.PACKS.includes(pts)) fail('bad_pack')
      device(db, pid).points += pts
      ledger(db, pid, pts, 'charge', null, { won: pts * RULES.WON_PER_POINT, demo: true })
      return
    }
    case 'adminClaim': {
      if (!env.ADMIN_CODE || p.code !== env.ADMIN_CODE) fail('bad_code', 403)
      device(db, pid).admin = true
      return
    }
    case 'adminLeave': {
      device(db, pid).admin = false
      return
    }
    // ----- admin only -----
    case 'adminAdopt': {
      requireAdmin(db, pid)
      const q = findQ(db, p.qid)
      const r = adopt(db, q, p.aid, '', pid)
      adminLog(db, pid, 'adopt', q.id)
      return r
    }
    case 'adminRefund': {
      requireAdmin(db, pid)
      const q = findQ(db, p.qid)
      if (!['open', 'review'].includes(q.status)) fail('closed')
      q.status = 'refunded'
      q.closed = now
      q.refundReason = 'admin'
      if (q.bounty > 0) move(db, null, q.author, q.bounty, 'refund_admin', q.id)
      adminLog(db, pid, 'refund', q.id)
      return
    }
    case 'adminHide': {
      requireAdmin(db, pid)
      const item = locate(db, p)
      item.hidden = !!p.hidden
      if (!p.hidden) item.reports = []
      adminLog(db, pid, p.hidden ? 'hide' : 'restore', item.id)
      return
    }
    case 'adminAge': {
      // Demo helper: move a question's clock forward so the 72h / 7-day rules can be shown live.
      requireAdmin(db, pid)
      const q = findQ(db, p.qid)
      const hours = Number(p.hours)
      if (![72, 168].includes(hours)) fail('bad_hours')
      q.created -= hours * HOUR + 60e3
      q.aged = true
      return
    }
    // ----- groups (free) -----
    case 'joinGroup': {
      if (findMyGroup(db, pid)) fail('in_group')
      if (device(db, pid).admin) fail('mentor_no_join')
      if (device(db, pid).kr) fail('kr_student')
      const school = SCHOOLS.includes(p.school) ? p.school : fail('bad_school')
      const country = COUNTRIES.includes(p.country) ? p.country : fail('bad_country')
      const same = db.groups.filter((g) => g.school === school && g.country === country).sort((a, b) => a.n - b.n)
      let g = same.find((x) => x.members.length < RULES.GROUP_CAP)
      if (!g) {
        g = { id: newId('g'), school, country, n: (same.at(-1)?.n || 0) + 1, created: now, members: [], mentor: null, mentorSnap: null, messages: [], missions: {} }
        db.groups.push(g)
      }
      const snap = cleanSnap(p.snap)
      g.members.push({ pid, snap, joined: now })
      sysMsg(g, 'join', snap)
      if (g.members.length === RULES.GROUP_START) sysMsg(g, 'start', null)
      return { id: g.id }
    }
    case 'leaveGroup': {
      const g = findMyGroup(db, pid) || fail('no_group')
      const m = [...g.members, ...(g.friends || [])].find((x) => x.pid === pid)
      g.members = g.members.filter((x) => x !== m)
      g.friends = (g.friends || []).filter((x) => x !== m)
      sysMsg(g, 'leave', m.snap)
      return
    }
    // ----- Korean friends (free): Korean students who are interested in a country -----
    // Not 1:1 matching: they join a group from a country they follow, up to 2 per group.
    case 'krSet': {
      const d = device(db, pid)
      if (d.admin) fail('mentor_no_join')
      const countries = [...new Set((Array.isArray(p.countries) ? p.countries : []).filter((c) => COUNTRIES.includes(c) && c !== 'other'))].slice(0, RULES.KR_INTERESTS)
      if (!countries.length) fail('bad_country')
      if (findMyGroup(db, pid) && !findMyGroup(db, pid).friends?.some((m) => m.pid === pid)) fail('in_group') // a foreign student can't switch
      d.kr = { countries, offer: (Array.isArray(p.offer) ? p.offer : []).filter((o) => OFFERS.includes(o)), school: SCHOOLS.includes(p.school) ? p.school : 'skku' }
      return
    }
    case 'krJoin': {
      const d = device(db, pid)
      if (!d.kr) fail('bad_country')
      if (findMyGroup(db, pid)) fail('in_group')
      // A group from my countries (in my order of interest) with a free friend seat; groups that started first.
      let g = null
      for (const c of d.kr.countries) {
        g = db.groups
          // only groups that have students (a group everyone left stays empty until a student joins again)
          .filter((x) => x.school === d.kr.school && x.country === c && x.members.length > 0 && (x.friends || []).length < RULES.FRIEND_CAP)
          .sort((a, b) => b.members.length - a.members.length || a.n - b.n)[0]
        if (g) break
      }
      if (!g) fail('no_seat')
      const snap = cleanSnap(p.snap)
      g.friends = g.friends || []
      g.friends.push({ pid, snap, joined: now })
      sysMsg(g, 'friend', snap)
      return { id: g.id }
    }
    case 'groupMsg': {
      const g = findG(db, p.gid)
      const member = g.members.find((x) => x.pid === pid)
      const friend = (g.friends || []).find((x) => x.pid === pid)
      const isMentor = g.mentor === pid
      if (!member && !friend && !isMentor) fail('not_member', 403)
      const snap = cleanSnap(p.snap)
      if (member && snap) member.snap = snap
      if (friend && snap) friend.snap = snap
      if (isMentor && snap) g.mentorSnap = snap
      g.messages.push({ id: newId('m'), author: pid, snap, mentor: isMentor, friend: !!friend, body: maskText(clean(p.body, LIMITS.msg)).text, created: now })
      if (g.messages.length > 400) g.messages.splice(0, g.messages.length - 400)
      return
    }
    case 'mission': {
      const g = findG(db, p.gid)
      if (!inGroup(g, pid) && g.mentor !== pid) fail('not_member', 403)
      const w = weekOf(now)
      g.missions = g.missions || {}
      if (!g.missions[w]) {
        const snap = cleanSnap(p.snap)
        g.missions[w] = { at: now, snap }
        sysMsg(g, 'mission', snap)
      }
      return
    }
    case 'mentorTake': {
      requireAdmin(db, pid)
      const g = findG(db, p.gid)
      if (g.mentor) fail('has_mentor')
      if (!g.members.length) fail('empty_group')
      if (db.groups.filter((x) => x.mentor === pid).length >= RULES.MENTOR_MAX) fail('mentor_max')
      g.mentor = pid
      g.mentorSnap = cleanSnap(p.snap)
      sysMsg(g, 'mentor', g.mentorSnap)
      adminLog(db, pid, 'mentor', g.id)
      return { id: g.id }
    }
    case 'mentorLeave': {
      const g = findG(db, p.gid)
      if (g.mentor !== pid) fail('not_member', 403)
      g.mentor = null
      sysMsg(g, 'mentorLeft', g.mentorSnap)
      g.mentorSnap = null
      return
    }
    // ----- events (paid, main revenue) -----
    case 'eventCreate': {
      requireAdmin(db, pid) // Korean mentors and the Eoullim team host events
      const cat = EVENT_CATS.includes(p.cat) ? p.cat : fail('bad_cat')
      const country = cat === 'country' ? (COUNTRIES.includes(p.country) || p.country === 'kr' ? p.country : fail('bad_country')) : null
      const date = /^\d{4}-\d{2}-\d{2}$/.test(p.date || '') && p.date >= kstDay(now) ? p.date : fail('bad_date')
      const time = /^\d{2}:\d{2}$/.test(p.time || '') ? p.time : '18:00'
      const fee = Number(p.fee)
      if (!Number.isInteger(fee) || fee < 0 || fee > RULES.MAX_FEE || fee % 100) fail('bad_fee')
      const cap = Number(p.cap)
      const min = Number(p.min)
      if (!Number.isInteger(cap) || cap < 2 || cap > 100 || !Number.isInteger(min) || min < 1 || min > cap) fail('bad_cap')
      const title = clean(p.title, LIMITS.title)
      const body = clean(p.body, LIMITS.body, { required: false })
      if (isBanned(title + ' ' + body)) fail('banned')
      const e = {
        id: newId('e'), cat, country, emoji: EVENT_EMOJI.includes(p.emoji) ? p.emoji : '🎉',
        title: maskText(title).text, body: maskText(body).text, date, time,
        place: maskText(clean(p.place, LIMITS.place)).text, fee, cap, min,
        host: pid, hostSnap: cleanSnap(p.snap), hostType: 'mentor', created: now, status: 'open', joined: [],
      }
      db.events.unshift(e)
      adminLog(db, pid, 'event', e.id)
      return { id: e.id }
    }
    case 'eventJoin': {
      const e = findE(db, p.eid)
      if (e.status !== 'open' || e.date < kstDay(now)) fail('event_closed')
      if (e.joined.some((j) => j.pid === pid)) return
      if (e.joined.length >= e.cap) fail('full')
      if (e.fee > 0) {
        // Demo payment: in the real service a payment company charges the card; we only get the result.
        db.payments.push({ id: newId('pay'), pid, eid: e.id, won: e.fee, commission: Math.round(e.fee * RULES.EVENT_RATE), at: now, status: 'paid', demo: true })
      }
      e.joined.push({ pid, snap: cleanSnap(p.snap), at: now })
      return
    }
    case 'eventLeave': {
      const e = findE(db, p.eid)
      if (!e.joined.some((j) => j.pid === pid)) return
      if (e.status === 'open' && now > eventStart(e) - RULES.CANCEL_FREE_D * DAY) fail('late_cancel')
      e.joined = e.joined.filter((j) => j.pid !== pid)
      refundEvent(db, e, pid)
      return
    }
    case 'eventCancel': {
      const e = findE(db, p.eid)
      if (e.host !== pid) requireAdmin(db, pid)
      if (e.status !== 'open') fail('event_closed')
      e.status = 'cancelled'
      e.cancelReason = 'host'
      refundEvent(db, e)
      adminLog(db, pid, 'eventCancel', e.id)
      return
    }
    default:
      fail('bad_action')
  }
}

function adopt(db, q, aid, thanks, byAdmin) {
  if (!['open', 'review'].includes(q.status)) fail('closed')
  const a = q.answers.find((x) => x.id === aid && !x.hidden) || fail('not_found', 404)
  q.status = 'adopted'
  q.adopted = a.id
  q.closed = Date.now()
  if (byAdmin) q.adoptedBy = 'admin'
  if (thanks) a.thanks = maskText(thanks).text
  if (q.bounty > 0) move(db, null, a.author, q.bounty, 'adopted', q.id)
  return { to: a.author }
}

function locate(db, p) {
  if (p.type === 'q') return findQ(db, p.id)
  if (p.type === 'a') return findQ(db, p.parentId).answers.find((a) => a.id === p.id) || fail('not_found', 404)
  if (p.type === 'p') return findP(db, p.id)
  if (p.type === 'c') return findP(db, p.parentId).comments.find((c) => c.id === p.id) || fail('not_found', 404)
  fail('bad_type')
}
