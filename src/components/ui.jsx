import Icon from './Icon.jsx'
import { useApp } from '../store.jsx'
import { PEOPLE } from '../data/people.js'

export const UNIS = {
  SKKU: { name: 'Sungkyunkwan University', short: 'SKKU', ko: '성균관대학교', mark: 'SK', domain: 'skku.edu', color: '#0F5A43', live: true },
  KU: { name: 'Korea University', short: 'KU', ko: '고려대학교', mark: 'KU', color: '#8B0029' },
  Yonsei: { name: 'Yonsei University', short: 'Yonsei', ko: '연세대학교', mark: 'YS', color: '#003876' },
  SNU: { name: 'Seoul National University', short: 'SNU', ko: '서울대학교', mark: 'SN', color: '#1B2A7A' },
  Hanyang: { name: 'Hanyang University', short: 'Hanyang', ko: '한양대학교', mark: 'HY', color: '#0E4A84' },
}

export function Avatar({ id, person, size = 52, showOnline = true }) {
  const p = person || PEOPLE[id]
  if (!p) return null
  const [bg, fg] = p.color
  return (
    <div className="avatar" style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.36) }}>
      {p.initials}
      {showOnline && p.online && <span className="online" role="img" aria-label="Online" />}
    </div>
  )
}

export function MeAvatar({ size = 36 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: 'var(--coral-tint)', color: 'var(--coral-ink)', fontSize: Math.round(size * 0.36) }}>
      ME
    </div>
  )
}

export function UniMark({ uni = 'SKKU', size = 32 }) {
  const u = UNIS[uni]
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: u.color, color: '#fff', fontSize: Math.round(size * 0.36), fontFamily: 'var(--body)' }}
    >
      {u.mark}
    </span>
  )
}

export function TopBar({ title, onBack, right, sub }) {
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

export function LangToggle({ dark }) {
  const { state, setLang } = useApp()
  const next = state.lang === 'en' ? 'ko' : 'en'
  return (
    <button
      onClick={() => setLang(next)}
      aria-label={state.lang === 'en' ? '한국어로 보기' : 'Switch to English'}
      style={{
        height: 44, padding: '0 14px', borderRadius: 22, fontSize: 13, fontWeight: 700, flexShrink: 0,
        border: dark ? '1px solid rgba(255,255,255,.4)' : '1px solid var(--line-2)',
        background: 'transparent', color: dark ? '#fff' : 'var(--ink)',
      }}
    >
      <span style={{ opacity: state.lang === 'en' ? 1 : 0.55 }}>EN</span> · <span style={{ opacity: state.lang === 'ko' ? 1 : 0.55 }}>한국어</span>
    </button>
  )
}

const TABS = [
  { id: 'home', icon: 'home', en: 'Home', ko: '홈' },
  { id: 'find', icon: 'find', en: 'Find', ko: '찾기' },
  { id: 'community', icon: 'community', en: 'Community', ko: '커뮤니티' },
  { id: 'chats', icon: 'chat', en: 'Chat', ko: '채팅' },
  { id: 'guide', icon: 'bot', en: 'Guide', ko: '가이드' },
]

export function TabBar({ current }) {
  const { go, tx, state } = useApp()
  const unread = state.chats.reduce((n, c) => n + (c.unread || 0), 0)
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <button key={t.id} aria-current={current === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
          <Icon name={t.icon} size={24} />
          <span>{tx(t.en, t.ko)}</span>
          {t.id === 'chats' && unread > 0 && <span className="count">{unread}</span>}
        </button>
      ))}
    </nav>
  )
}

export function Toast() {
  const { toast, setToast, L, go } = useApp()
  if (!toast) return null
  return (
    <button
      className="toast"
      style={{ border: 0, textAlign: 'left', width: 'auto' }}
      onClick={() => {
        setToast(null)
        if (toast.person) go('chat', toast.person)
      }}
    >
      {toast.person ? <Avatar id={toast.person} size={36} showOnline={false} /> : <Icon name="check" />}
      <span style={{ flex: 1 }}>{L(toast.text)}</span>
      <Icon name="chevron" size={18} />
    </button>
  )
}

export function Section({ title, action, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2 className="h3">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
