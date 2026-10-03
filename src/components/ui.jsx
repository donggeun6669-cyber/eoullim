import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../store.jsx'
import { APP_LANGS, BOARDS, COLORS, COUNTRIES, KINDS, LEVELS, REGIONS, SCHOOLS, STATUS, TAGS, groupName } from '../i18n.js'

export function TopBar({ title, sub, right, onBack }) {
  const { back, tx } = useApp()
  return (
    <div className="topbar">
      <button className="icon-btn" aria-label={tx('Back', '뒤로')} onClick={onBack || (() => back())}>
        <Icon name="back" />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="title truncate">{title}</div>
        {sub && <div className="small truncate">{sub}</div>}
      </div>
      {right}
    </div>
  )
}

// Language picker: a native select styled as a pill (works the same on every phone).
export function LangToggle({ dark }) {
  const { lang, setLang } = useApp()
  return (
    <label className={'lang-toggle' + (dark ? ' dark' : '')}>
      <Icon name="globe" size={16} />
      <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language / 언어">
        {APP_LANGS.map((l) => (
          <option key={l.id} value={l.id}>{l.label}</option>
        ))}
      </select>
    </label>
  )
}

const TABS = [
  { id: 'home', icon: 'home', en: 'Home', ko: '홈' },
  { id: 'group', icon: 'users', en: 'My group', ko: '내 그룹' },
  { id: 'community', icon: 'community', en: 'Community', ko: '커뮤니티' },
  { id: 'events', icon: 'calendar', en: 'Events', ko: '이벤트' },
  { id: 'points', icon: 'points', en: 'Points', ko: '포인트' },
]
const SEEN = 'eoullim-seen-'
export const markSeen = (gid, ts) => {
  try {
    localStorage.setItem(SEEN + gid, String(ts))
  } catch {
    /* ignore */
  }
}
function unreadCount(data) {
  const g = data?.myGroups?.[0]
  if (!g) return 0
  let seen = 0
  try {
    seen = Number(localStorage.getItem(SEEN + g.id) || 0)
  } catch {
    /* ignore */
  }
  return g.messages.filter((m) => !m.system && !m.mine && m.created > seen).length
}

export function TabBar({ current }) {
  const { go, tx, data } = useApp()
  const unread = current === 'group' ? 0 : unreadCount(data)
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <button key={t.id} aria-current={current === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
          <Icon name={t.icon} size={24} />
          <span>{tx(t.en, t.ko)}</span>
          {t.id === 'group' && unread > 0 && <span className="count">{unread > 9 ? '9+' : unread}</span>}
        </button>
      ))}
    </nav>
  )
}

// "Philippines · Group 2" / "필리핀 2조" — in any app language.
export function useGroupName() {
  const { tx } = useApp()
  return (g) => (g ? tx(groupName(g, 'en'), groupName(g, 'ko')) : '')
}
export const flagOf = (g) => (COUNTRIES[g?.country] || REGIONS[g?.country] || COUNTRIES.other).flag

// Where am I? Shown at the top of every screen: school › board, and my group.
const PLACES = {
  home: ['Home', '홈'],
  community: ['Community board', '커뮤니티 게시판'],
  ask: ['Community board › Ask', '커뮤니티 게시판 › 질문하기'],
  q: ['Community board › Question', '커뮤니티 게시판 › 질문'],
  write: ['Community board › New post', '커뮤니티 게시판 › 글쓰기'],
  new: ['Community board › New post', '커뮤니티 게시판 › 글쓰기'],
  events: ['Event board', '이벤트 게시판'],
  event: ['Event board', '이벤트 게시판'],
  eventNew: ['Event board › Open an event', '이벤트 게시판 › 이벤트 열기'],
  points: ['Points', '포인트'],
  profile: ['My profile', '내 프로필'],
  settings: ['Settings', '설정'],
  admin: ['Mentor page', '멘토 화면'],
  guide: ['Official guide', '공식 안내'],
  solve: ['Community board', '커뮤니티 게시판'],
  setup: ['Getting started', '시작하기'],
}
export function Belong() {
  const { route, school, data, me, L, tx, go } = useApp()
  const gn = useGroupName()
  const name = route.name || 'home'
  const myGroup = data?.myGroups?.find((g) => !g.mentoring)
  const mentoring = data?.myGroups?.filter((g) => g.mentoring) || []
  let place = PLACES[name] || PLACES.home
  if (name === 'group') {
    const g = myGroup || mentoring[0]
    place = g ? [`${groupName(g, 'en')} · group room`, `${groupName(g, 'ko')} 그룹방`] : ['Group room', '그룹방']
  }
  if (name === 'post') {
    const b = BOARDS[data?.posts?.find((p) => p.id === route.id)?.board]
    if (b) place = [`Community board › ${b.en}`, `커뮤니티 게시판 › ${b.ko}`]
  }
  return (
    <div className="belong" role="note" aria-label={tx('Where you are', '지금 있는 곳')}>
      <button className="belong-where" onClick={() => go('profile')}>
        <span aria-hidden="true">🏫</span>
        <span className="truncate">
          {L(SCHOOLS[school] || SCHOOLS.skku)} <span className="belong-sep">›</span> <b>{L(place)}</b>
        </span>
      </button>
      {myGroup ? (
        <button className="belong-group" onClick={() => go('group')}>{flagOf(myGroup)} {gn(myGroup)}</button>
      ) : mentoring.length ? (
        <button className="belong-group" onClick={() => go('group')}>{flagOf(mentoring[0])} {gn(mentoring[0])} · {tx('Mentor', '멘토')}</button>
      ) : me?.mentor ? (
        <button className="belong-group" onClick={() => go('setup', 'kr')}>🇰🇷 {tx('Mentor', '멘토')}{me.kr ? ` · ${me.kr.countries.map((c) => (c === 'any' ? '🌏' : COUNTRIES[c]?.flag)).join('')}` : ''}</button>
      ) : (
        <button className="belong-group ghost" onClick={() => go('setup')}>+ {tx('Find my group', '내 그룹 찾기')}</button>
      )}
    </div>
  )
}

// User content in my language. Shows a small globe when it was translated.
export function Tr({ text, as: As = 'span', className, block }) {
  const { tr, tx } = useApp()
  const [orig, setOrig] = useState(false)
  if (!text) return null
  const r = tr(text)
  if (!block) return <As className={className}>{r.text}{r.translated && <span className="tr-mark" title={tx('Translated', '번역됨')}> 🌐</span>}</As>
  return (
    <>
      <As className={className}>{orig ? r.original : r.text}</As>
      {r.translated && (
        <button className="tr-note" onClick={() => setOrig(!orig)}>
          🌐 {orig ? tx('Show translation', '번역 보기') : tx('Translated · show original', '자동 번역됨 · 원문 보기')}
        </button>
      )}
    </>
  )
}

export function Toast() {
  const { toast, setToast } = useApp()
  if (!toast) return null
  return (
    <button className={'toast' + (toast.kind === 'error' ? ' error' : '')} onClick={() => setToast(null)} role="status">
      <Icon name={toast.kind === 'error' ? 'info' : 'check'} />
      <span style={{ flex: 1 }}>{toast.text}</span>
    </button>
  )
}

export function Section({ title, action, children }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2 className="h3">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Avatar({ snap, size = 36 }) {
  if (!snap) {
    return (
      <span className="avatar" style={{ width: size, height: size, background: 'var(--seg)', color: 'var(--muted)', fontSize: size * 0.42 }} aria-hidden="true">
        ?
      </span>
    )
  }
  const [bg] = COLORS[snap.color ?? 0] || COLORS[0]
  return (
    <span className="avatar" style={{ width: size, height: size, background: bg, fontSize: size * 0.5 }} aria-hidden="true">
      {snap.avatar}
    </span>
  )
}

export function LevelTag({ level }) {
  const { L } = useApp()
  const lv = LEVELS[level || 0]
  return <span className="level" title={L(lv)}>{lv.icon} {L(lv)}</span>
}

// "Minji · 🏡 Neighbor · 3h" — or "Anonymous · 3h"
export function Byline({ item, size = 32, showLevel = true }) {
  const { tx, data } = useApp()
  return (
    <div className="byline">
      <Avatar snap={item.snap} size={size} />
      <span className="col">
        <span className="byline-top">
          <b className="truncate">{item.snap ? item.snap.nick : tx('Anonymous', '익명')}</b>
          {item.admin && <span className="tag manager">🇰🇷 {tx('Mentor', '멘토')}</span>}
          {item.mine && <span className="tag gray">{tx('Me', '나')}</span>}
          {item.seed && <ExampleTag />}
        </span>
        <span className="small">
          {showLevel && item.snap && !item.admin ? <LevelTag level={item.level} /> : null}
          {showLevel && item.snap && !item.admin ? ' · ' : ''}
          {ago(item.created, data?.now, tx)}
        </span>
      </span>
    </div>
  )
}

export function ExampleTag() {
  const { tx } = useApp()
  return <span className="tag example" title={tx('Example post made by the team', '팀이 넣은 예시 글')}>{tx('Example', '예시')}</span>
}

export function ago(ts, now = Date.now(), tx = (e) => e) {
  const m = Math.max(0, Math.floor((now - ts) / 60000))
  if (m < 1) return tx('just now', '방금')
  if (m < 60) return tx(`${m}m ago`, `${m}분 전`)
  const h = Math.floor(m / 60)
  if (h < 24) return tx(`${h}h ago`, `${h}시간 전`)
  const d = Math.floor(h / 24)
  return tx(`${d}d ago`, `${d}일 전`)
}

export function Coin({ n, size = 'md' }) {
  return (
    <span className={'coin ' + size}>
      <span className="coin-dot">P</span>
      {Number(n).toLocaleString()}
    </span>
  )
}

export const won = (points) => '₩' + (points * 100).toLocaleString()

export function KindTag({ kind }) {
  const { L } = useApp()
  const k = KINDS[kind]
  return <span className="tag">{k.icon} {L(k)}</span>
}
export function TagPill({ tag }) {
  const { L } = useApp()
  return <span className={'tag ' + (tag === 'kstyle' ? 'manager' : 'gray')}>{L(TAGS[tag] || TAGS.etc)}</span>
}
export function StatusPill({ q }) {
  const { L, tx } = useApp()
  if (q.hidden) return <span className="tag coral">{tx('Hidden', '가려짐')}</span>
  const s = STATUS[q.status]
  return <span className={'tag ' + s.cls}>{L(s)}</span>
}

export function AnonToggle({ anon, setAnon }) {
  const { snap, tx, go } = useApp()
  if (!snap) {
    return (
      <p className="small note">
        {tx('Posting as Anonymous.', '익명으로 올라가요.')}{' '}
        <button className="linkish" onClick={() => go('profile')}>{tx('Set a nickname', '닉네임 설정하기')}</button>{' '}
        {tx('if you want to show one.', '하면 닉네임으로도 쓸 수 있어요.')}
      </p>
    )
  }
  return (
    <label className="switch-row">
      <span>
        <b>{tx('Post anonymously', '익명으로 올리기')}</b>
        <span className="small">{anon ? tx('Shown as “Anonymous”', '「익명」으로 보여요') : tx(`Shown as “${snap.nick}”`, `「${snap.nick}」로 보여요`)}</span>
      </span>
      <input type="checkbox" className="switch" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
    </label>
  )
}

export function ReportButton({ item, type, parentId }) {
  const { call, tx, showToast } = useApp()
  const [busy, setBusy] = useState(false)
  if (item.mine) return null
  if (item.reported) return <span className="small">{tx('Reported', '신고함')}</span>
  return (
    <button
      className="linkish muted"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm(tx('Report this to the mentors?', '멘토에게 신고할까요?'))) return
        setBusy(true)
        try {
          await call('report', { type, id: item.id, parentId })
          showToast(tx('Reported. A mentor will check it.', '신고했어요. 멘토가 확인해요.'))
        } catch {
          /* toast already shown */
        }
        setBusy(false)
      }}
    >
      {tx('Report', '신고')}
    </button>
  )
}

export function Loading() {
  const { tx } = useApp()
  return <div className="empty">{tx('Loading…', '불러오는 중…')}</div>
}

export function Fab({ onClick, label }) {
  return (
    <button className="fab" onClick={onClick}>
      <Icon name="plus" size={20} /> {label}
    </button>
  )
}
