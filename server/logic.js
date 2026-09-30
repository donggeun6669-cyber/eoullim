// Eoullim v2 server rules. Pure functions over one JSON document (db).
// No accounts: a device holds a random key; we only ever store a hash of it (pid).
import crypto from 'node:crypto'
import { seedDb } from './seed.js'

export const RULES = {
  WON_PER_POINT: 100, // 100원 = 1P (2026-09-30 동근님)
  STARTER: 30,
  MIN_BOUNTY: 1,
  MAX_BOUNTY: 1000,
  NO_ANSWER_REFUND_H: 72,
  REVIEW_AFTER_D: 7,
  REPORT_HIDE: 3,
  ADMIN_POOL_RATE: 0.3,
  PACKS: [10, 30, 50, 100], // points; price = points × 100원
}
const HOUR = 3600e3
const LIMITS = { title: 80, body: 1000, comment: 300, nick: 20, place: 60 }

export const KINDS = ['know', 'borrow', 'do']
export const TAGS = ['life', 'admin', 'school', 'health', 'housing', 'korean', 'kstyle', 'etc']
export const BOARDS = ['together', 'free', 'l-en', 'l-zh', 'l-vi', 'l-uz', 'l-mn', 'l-ja', 'l-ko']

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
const findQ = (db, id) => db.questions.find((q) => q.id === id) || fail('not_found', 404)
const findP = (db, id) => db.posts.find((p) => p.id === id) || fail('not_found', 404)
const requireAdmin = (db, pid) => device(db, pid).admin || fail('not_admin', 403)
const adminLog = (db, pid, type, ref) => db.adminLog.push({ pid, type, ref, at: Date.now() })
const liveAnswers = (q) => q.answers.filter((a) => !a.hidden)

// Time rules, applied lazily whenever the db is read. Returns true if anything changed.
export function sweep(db, now = Date.now()) {
  let changed = false
  for (const q of db.questions) {
    if (q.status !== 'open' || q.seed) continue
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
  return changed
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
    id: p.id, board: p.board, title: p.title, body: p.body, created: at(p), snap: p.snap,
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

  const out = {
    now,
    rules: RULES,
    me: me ? { pid, points: me.points, admin: isAdmin, adopted: counts[pid] || 0, level: lv(pid) } : null,
    questions,
    posts,
    ledger: db.ledger.filter((l) => l.pid === pid).slice(-60).reverse(),
  }
  if (isAdmin) out.adminStats = adminStats(db)
  return out
}

function adminStats(db) {
  const chargedWon = db.ledger.filter((l) => l.reason === 'charge').reduce((s, l) => s + (l.won || 0), 0)
  const pool = Math.floor(chargedWon * RULES.ADMIN_POOL_RATE)
  const work = {}
  for (const e of db.adminLog) work[e.pid] = (work[e.pid] || 0) + 1
  for (const q of db.questions) {
    const a = q.status === 'adopted' && q.answers.find((x) => x.id === q.adopted)
    if (a?.admin) work[a.author] = (work[a.author] || 0) + 1
  }
  const total = Object.values(work).reduce((s, n) => s + n, 0)
  const admins = Object.entries(work).map(([pid, n]) => ({ pid, work: n, won: total ? Math.floor((pool * n) / total) : 0 }))
  return { chargedWon, pool, rate: RULES.ADMIN_POOL_RATE, admins, totalWork: total }
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
      move(db, pid, null, bounty, 'ask', q.id)
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
      move(db, null, pid, q.bounty, 'refund_delete', q.id)
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
        snap: cleanSnap(p.snap, p.anon), created: now, likes: [], comments: [], reports: [], meetup,
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
      move(db, null, q.author, q.bounty, 'refund_admin', q.id)
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
  move(db, null, a.author, q.bounty, 'adopted', q.id)
  return { to: a.author }
}

function locate(db, p) {
  if (p.type === 'q') return findQ(db, p.id)
  if (p.type === 'a') return findQ(db, p.parentId).answers.find((a) => a.id === p.id) || fail('not_found', 404)
  if (p.type === 'p') return findP(db, p.id)
  if (p.type === 'c') return findP(db, p.parentId).comments.find((c) => c.id === p.id) || fail('not_found', 404)
  fail('bad_type')
}
