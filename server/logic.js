// Eoullim v3 server rules. Pure functions over one JSON document (db).
// v3 (2026-10-01): groups (same country 3–4 + one Korean mentor, free) · paid events (main revenue, fee commission)
// · one Community board where points on a question are optional (secondary revenue).
// v5 (2026-10-03 동근님): every Korean student in a group is a verified, paid mentor (no unverified "Korean friend").
// Verification: the operator checks a student ID offline and issues a one-person, one-time code in the app.
// Demo (2026-10-03 동근님 「지금은 데모니까 명시만」): a Korean student can also continue without a code as a
// "demo mentor" — a group seat and chat only, no moderation, refunds, events or money.
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
  GROUP_CAP: 4, // students per group (+ Korean mentors)
  GROUP_START: 3, // a group "starts" at 3 students
  MENTOR_CAP: 1, // verified Korean mentors per group — 2026-10-03 최종 발표자료 「외국인 학생 3~4명, 한국인 1명」
  KR_INTERESTS: 3, // countries a Korean mentor can follow
  MENTOR_MAX: 3, // groups one mentor can look after
  REGION_WAIT_D: 7, // a country group still under GROUP_START after this many days moves to a regional group (2026-10-03)
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
// Regional groups for countries with few students (2026-10-03 동근님: 기다렸다가 지역권 조). Claude's grouping, changeable.
export const REGIONS = {
  'r-ea': ['cn', 'jp'],
  'r-sea': ['ph', 'vn', 'mm', 'id', 'th'],
  'r-sca': ['uz', 'mn', 'np'],
  'r-west': ['us', 'fr', 'de'],
  'r-world': ['other'],
}
export const regionOf = (c) => Object.keys(REGIONS).find((r) => REGIONS[r].includes(c)) || 'r-world'
const isRegion = (c) => String(c).startsWith('r-')
const TIES = ['going', 'been'] // Korean mentor: going on exchange to that country / has been there
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
  if ((db.v || 0) >= 4) return migrate5(db)
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
  return migrate5(db)
}
// v4 → v5: one list of verified Korean mentors per group. The old single mentor stays; example "Korean friends"
// become example mentors; real unverified Korean friends leave their seat (their interests stay saved) — they
// can come back after verification. Devices that used the old shared code are the operator team.
function migrate5(db) {
  if ((db.v || 0) >= 5) return migrate6(db)
  for (const d of Object.values(db.devices)) if (d.admin) d.operator = true
  for (const g of db.groups) {
    if (g.mentors) continue
    const mentors = []
    if (g.mentor) mentors.push({ pid: g.mentor, snap: g.mentorSnap || null, seed: String(g.mentor).startsWith('seed-') || undefined })
    for (const f of g.friends || []) {
      if ((f.seed || db.devices[f.pid]?.admin) && mentors.length < RULES.MENTOR_CAP && !mentors.some((m) => m.pid === f.pid)) mentors.push({ ...f })
      else if (f.seed) g.messages = g.messages.filter((m) => m.author !== f.pid) // example friend with no seat: drop its example lines
      else sysMsg(g, 'leave', f.snap)
    }
    for (const m of g.messages) if (m.friend) {
      m.mentor = true
      delete m.friend
    }
    g.mentors = mentors
    delete g.mentor
    delete g.mentorSnap
    delete g.friends
  }
  db.mentorCodes = db.mentorCodes || []
  db.v = 5
  return migrate6(db)
}
// v5 → v6: one mentor per group. The example mentor leaves Philippines 2 so the demo can show a Korean
// student becoming that group's mentor. Only example (seed) lines change; real members and messages stay.
function migrate6(db) {
  if ((db.v || 0) >= 6) return db
  const g = db.groups.find((x) => x.id === 'gseed02')
  if (g) {
    g.mentors = (g.mentors || []).filter((m) => !m.seed)
    const fresh = seedDb(db.seededAt || Date.now()).groups.find((x) => x.id === 'gseed02')
    const keep = g.messages.filter((m) => !m.seed || m.system)
    const start = keep.filter((m) => m.seed && m.system)
    const rest = keep.filter((m) => !(m.seed && m.system))
    g.messages = [...start, ...fresh.messages.filter((m) => !m.system), ...rest]
  }
  db.v = 6
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
// A student's own group (members only). Mentors look after groups instead (g.mentors).
const inGroup = (g, pid) => g.members.some((m) => m.pid === pid)
const isMentorOf = (g, pid) => (g.mentors || []).some((m) => m.pid === pid)
const findMyGroup = (db, pid) => (db.groups || []).find((g) => inGroup(g, pid))
const mentorCount = (db, pid) => (db.groups || []).filter((g) => isMentorOf(g, pid)).length
// Verification codes: shown once to the operator, stored only as a hash.
const CODE_ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
const codeHash = (c) => crypto.createHash('sha256').update('eoullim-mentor:' + normCode(c)).digest('hex').slice(0, 16)
// Move a whole forming country group into a regional group (they stay together). The country group is left
// empty and is reused when a new student from that country arrives.
function moveToRegion(db, g, now) {
  const region = regionOf(g.country)
  const movers = g.members
  const same = db.groups.filter((x) => x.school === g.school && x.country === region).sort((a, b) => a.n - b.n)
  let r = same.find((x) => x.members.length + movers.length <= RULES.GROUP_CAP)
  if (!r) {
    r = { id: newId('g'), school: g.school, country: region, n: (same.at(-1)?.n || 0) + 1, created: now, members: [], mentors: [], messages: [], missions: {} }
    db.groups.push(r)
  }
  const before = r.members.length
  for (const m of movers) {
    r.members.push({ ...m, joined: now, from: g.id })
    sysMsg(r, 'joinRegion', m.snap)
  }
  if (before < RULES.GROUP_START && r.members.length >= RULES.GROUP_START) sysMsg(r, 'start', null)
  g.members = []
  sysMsg(g, 'movedRegion', null)
  return r
}
function removeMentorSeats(db, pid) {
  for (const g of db.groups) {
    const m = (g.mentors || []).find((x) => x.pid === pid)
    if (!m) continue
    g.mentors = g.mentors.filter((x) => x !== m)
    sysMsg(g, 'mentorLeft', m.snap)
  }
}
const OFFERS = ['language', 'life', 'hangout']
function sysMsg(g, type, snap, extra) {
  g.messages.push({ id: newId('m'), system: type, snap: snap || null, body: '', created: Date.now(), ...(extra ? { extra } : {}) })
}
const findQ = (db, id) => db.questions.find((q) => q.id === id) || fail('not_found', 404)
const findP = (db, id) => db.posts.find((p) => p.id === id) || fail('not_found', 404)
const requireAdmin = (db, pid) => device(db, pid).admin || fail('not_admin', 403)
// Mentor seat in groups: verified mentors and demo mentors (demo = no code yet, no admin powers).
const isMentorDevice = (d) => !!(d?.admin || d?.demoMentor)
const requireMentor = (db, pid) => isMentorDevice(device(db, pid)) || fail('not_admin', 403)
const ANY = 'any' // Korean mentor: "any country — groups that need a mentor first"
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
  // Groups: a country group that is still forming after REGION_WAIT_D days moves into a regional group.
  for (const g of db.groups || []) {
    if (g.seed || isRegion(g.country) || !g.members.length || g.members.length >= RULES.GROUP_START) continue
    if (now - (g.formingSince || g.created || now) > RULES.REGION_WAIT_D * DAY) {
      moveToRegion(db, g, now)
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
  for (const g of groups) for (const m of g.members) groupOfPid[m.pid] = g
  const myGroup = groupOfPid[pid] || null
  // How many verified Korean mentors follow each country (real devices + example mentors).
  const krFans = {}
  for (const d of Object.values(db.devices)) if (isMentorDevice(d)) for (const c of d.kr?.countries || []) if (c !== ANY) krFans[c] = (krFans[c] || 0) + 1
  for (const g of groups) for (const m of g.mentors || []) if (m.seed) krFans[g.country] = (krFans[g.country] || 0) + 1
  const gname = (g) => ({ id: g.id, school: g.school, country: g.country, n: g.n })
  const week = weekOf(now)
  const groupDir = groups.map((g) => ({
    ...gname(g), members: g.members.length, mentors: (g.mentors || []).length,
    hasMentor: (g.mentors || []).length > 0, mine: g === myGroup, mentoring: isMentorOf(g, pid),
    mentorSeats: RULES.MENTOR_CAP - (g.mentors || []).length,
  }))
  const myGroups = groups
    .filter((g) => g === myGroup || isMentorOf(g, pid))
    .map((g) => ({
      ...gname(g),
      mentoring: isMentorOf(g, pid),
      mentors: (g.mentors || []).map((m) => ({ snap: m.snap, me: m.pid === pid, tie: m.tie || null, tieCountry: m.tieCountry || null })),
      region: isRegion(g.country) ? REGIONS[g.country] : null,
      formingSince: g.formingSince || g.created || null,
      hasMentor: (g.mentors || []).length > 0,
      members: g.members.map((m) => ({ snap: m.snap, me: m.pid === pid, country: m.country || (isRegion(g.country) ? null : g.country), joined: m.seed ? now - (m.ageMin || 0) * 60e3 : m.joined })),
      missionDone: !!g.missions?.[week],
      missionBy: g.missions?.[week]?.snap || null,
      messages: g.messages.slice(-120).map((m) => ({
        id: m.id, body: m.body, snap: m.snap, mentor: !!m.mentor, system: m.system || null, extra: m.extra || null,
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
    me: me ? { pid, points: me.points, admin: isAdmin, operator: !!me.operator, verified: isAdmin, mentor: isMentorDevice(me), demoMentor: !!me.demoMentor && !isAdmin, adopted: counts[pid] || 0, level: lv(pid), group: myGroup ? gname(myGroup) : null, country: myGroup ? myGroup.members.find((m) => m.pid === pid)?.country || (isRegion(myGroup.country) ? null : myGroup.country) : null, kr: me.kr || null, mentorGroups: groups.filter((g) => isMentorOf(g, pid)).length } : null,
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
  if (me?.operator) {
    out.mentorCodes = (db.mentorCodes || []).slice().reverse().map((c) => ({
      id: c.id, label: c.label, hint: c.hint, created: c.created, used: !!c.usedBy, usedAt: c.usedAt || null, revoked: !!c.revoked,
    }))
  }
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
    // Verification. The shared ADMIN_CODE is the operator team's code; every Korean mentor gets a personal,
    // one-time code from the operator (after checking a student ID offline). Nothing about the person is stored here.
    case 'adminClaim': {
      const d = device(db, pid)
      if (findMyGroup(db, pid)) fail('in_group') // an international student in a group can't become a mentor
      if (env.ADMIN_CODE && normCode(p.code) === normCode(env.ADMIN_CODE)) {
        d.admin = true
        d.operator = true
        return
      }
      const h = codeHash(p.code)
      const c = (db.mentorCodes || []).find((x) => x.hash === h && !x.revoked)
      if (!c || (c.usedBy && c.usedBy !== pid)) fail('bad_code', 403)
      c.usedBy = pid
      c.usedAt = c.usedAt || now
      d.admin = true
      d.verifiedBy = c.id
      return
    }
    case 'adminLeave': {
      const d = device(db, pid)
      removeMentorSeats(db, pid)
      d.admin = false
      d.operator = false
      d.demoMentor = false
      return
    }
    case 'mentorDemo': {
      const d = device(db, pid)
      if (findMyGroup(db, pid)) fail('in_group')
      d.demoMentor = true
      return
    }
    case 'codeCreate': {
      if (!device(db, pid).operator) fail('not_operator', 403)
      const label = maskText(clean(p.label, 40)).text
      const r = crypto.randomBytes(8)
      const raw = [...r].map((x) => CODE_ALPH[x % 32]).join('')
      const code = `MT-${raw.slice(0, 4)}-${raw.slice(4, 8)}`
      db.mentorCodes = db.mentorCodes || []
      db.mentorCodes.push({ id: newId('mc'), hash: codeHash(code), hint: raw.slice(4, 8), label, created: now, by: pid, usedBy: null, revoked: false })
      adminLog(db, pid, 'code', null)
      return { code }
    }
    case 'codeRevoke': {
      if (!device(db, pid).operator) fail('not_operator', 403)
      const c = (db.mentorCodes || []).find((x) => x.id === p.id) || fail('not_found', 404)
      c.revoked = true
      const d = c.usedBy && db.devices[c.usedBy]
      if (d && d.verifiedBy === c.id) {
        removeMentorSeats(db, c.usedBy)
        d.admin = false
      }
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
      if (isMentorDevice(device(db, pid))) fail('mentor_no_join')
      if (device(db, pid).kr) fail('kr_student')
      const school = SCHOOLS.includes(p.school) ? p.school : fail('bad_school')
      const country = COUNTRIES.includes(p.country) ? p.country : fail('bad_country')
      const same = db.groups.filter((g) => g.school === school && g.country === country).sort((a, b) => a.n - b.n)
      let g = same.find((x) => x.members.length < RULES.GROUP_CAP)
      if (!g) {
        g = { id: newId('g'), school, country, n: (same.at(-1)?.n || 0) + 1, created: now, members: [], mentors: [], messages: [], missions: {} }
        db.groups.push(g)
      }
      const snap = cleanSnap(p.snap)
      if (!g.members.length) g.formingSince = now // an emptied group starts waiting again
      g.members.push({ pid, snap, joined: now, country })
      sysMsg(g, 'join', snap)
      if (g.members.length === RULES.GROUP_START) sysMsg(g, 'start', null)
      return { id: g.id }
    }
    case 'joinRegion': {
      // "Start now with nearby countries": the whole forming group moves together.
      const g = findMyGroup(db, pid) || fail('no_group')
      if (isRegion(g.country) || g.members.length >= RULES.GROUP_START) fail('not_forming')
      const r = moveToRegion(db, g, now)
      return { id: r.id }
    }
    case 'leaveGroup': {
      const g = findMyGroup(db, pid) || fail('no_group')
      const m = g.members.find((x) => x.pid === pid)
      g.members = g.members.filter((x) => x !== m)
      sysMsg(g, 'leave', m.snap)
      return
    }
    // ----- Korean mentors (verified, paid): countries they follow, then a group from those countries -----
    // Not 1:1 matching: a mentor joins a group (one mentor per group, up to 3 groups per mentor).
    case 'krSet': {
      requireMentor(db, pid)
      const d = device(db, pid)
      const countries = [...new Set((Array.isArray(p.countries) ? p.countries : []).filter((c) => c === ANY || (COUNTRIES.includes(c) && c !== 'other')))].slice(0, RULES.KR_INTERESTS)
      if (!countries.length) fail('bad_country')
      d.kr = {
        countries, offer: (Array.isArray(p.offer) ? p.offer : []).filter((o) => OFFERS.includes(o)), school: SCHOOLS.includes(p.school) ? p.school : 'skku',
        tie: TIES.includes(p.tie) ? p.tie : null, // going on exchange to / has been to the first country picked
      }
      return
    }
    case 'krJoin': {
      requireMentor(db, pid)
      const d = device(db, pid)
      if (!d.kr) fail('bad_country')
      if (mentorCount(db, pid) >= RULES.MENTOR_MAX) fail('mentor_max')
      // A group from my countries (in my order of interest) with a free mentor seat: groups without a mentor first,
      // then bigger groups. Only groups that have students (an emptied group waits for a student).
      let g = null
      for (const c of d.kr.countries) {
        g = db.groups
          .filter((x) => x.school === d.kr.school && (c === ANY || x.country === c || REGIONS[x.country]?.includes(c)) && x.members.length > 0 && (x.mentors || []).length < RULES.MENTOR_CAP && !isMentorOf(x, pid))
          .sort((a, b) => (a.mentors || []).length - (b.mentors || []).length || b.members.length - a.members.length || a.n - b.n)[0]
        if (g) break
      }
      if (!g) fail('no_seat')
      const snap = cleanSnap(p.snap)
      // "going on exchange / has been" applies to the first country picked; shown when it matches this group
      const tieCountry = d.kr.tie && d.kr.countries[0] !== ANY && (g.country === d.kr.countries[0] || REGIONS[g.country]?.includes(d.kr.countries[0])) ? d.kr.countries[0] : null
      g.mentors = g.mentors || []
      g.mentors.push({ pid, snap, joined: now, ...(tieCountry ? { tie: d.kr.tie, tieCountry } : {}) })
      sysMsg(g, 'mentor', snap, tieCountry ? { tie: d.kr.tie, country: tieCountry } : null)
      if (d.admin) adminLog(db, pid, 'mentor', g.id) // demo mentors are not paid
      return { id: g.id }
    }
    case 'groupMsg': {
      const g = findG(db, p.gid)
      const member = g.members.find((x) => x.pid === pid)
      const mentor = (g.mentors || []).find((x) => x.pid === pid)
      if (!member && !mentor) fail('not_member', 403)
      const snap = cleanSnap(p.snap)
      if (member && snap) member.snap = snap
      if (mentor && snap) mentor.snap = snap
      g.messages.push({ id: newId('m'), author: pid, snap, mentor: !!mentor, body: maskText(clean(p.body, LIMITS.msg)).text, created: now })
      if (g.messages.length > 400) g.messages.splice(0, g.messages.length - 400)
      return
    }
    case 'mission': {
      const g = findG(db, p.gid)
      if (!inGroup(g, pid) && !isMentorOf(g, pid)) fail('not_member', 403)
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
      requireMentor(db, pid)
      const g = findG(db, p.gid)
      if (isMentorOf(g, pid)) return { id: g.id }
      if ((g.mentors || []).length >= RULES.MENTOR_CAP) fail('has_mentor')
      if (!g.members.length) fail('empty_group')
      if (mentorCount(db, pid) >= RULES.MENTOR_MAX) fail('mentor_max')
      const snap = cleanSnap(p.snap)
      g.mentors = g.mentors || []
      g.mentors.push({ pid, snap, joined: now })
      sysMsg(g, 'mentor', snap)
      if (device(db, pid).admin) adminLog(db, pid, 'mentor', g.id)
      return { id: g.id }
    }
    case 'mentorLeave': {
      const g = findG(db, p.gid)
      const m = (g.mentors || []).find((x) => x.pid === pid) || fail('not_member', 403)
      g.mentors = g.mentors.filter((x) => x !== m)
      sysMsg(g, 'mentorLeft', m.snap)
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
    // Demo reset ("start from the beginning"): free every seat this device holds so the demo groups look
    // like before — student / mentor seats and event sign-ups (paid ones refunded).
    // Posts, answers, points and verification stay with the old code, which can still be restored.
    case 'resetMe': {
      for (const g of db.groups) {
        const m = g.members.find((x) => x.pid === pid)
        if (m) {
          g.members = g.members.filter((x) => x !== m)
          sysMsg(g, 'leave', m.snap)
        }
      }
      removeMentorSeats(db, pid)
      device(db, pid).demoMentor = false
      for (const e of db.events) {
        if (!e.joined.some((j) => j.pid === pid)) continue
        e.joined = e.joined.filter((j) => j.pid !== pid)
        refundEvent(db, e, pid)
      }
      delete device(db, pid).kr
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
