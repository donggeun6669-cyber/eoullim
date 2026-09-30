import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../store.jsx'
import { COLORS, KINDS, LEVELS, STATUS, TAGS } from '../i18n.js'

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

export function LangToggle({ dark }) {
  const { lang, setLang } = useApp()
  return (
    <button
      className={'lang-toggle' + (dark ? ' dark' : '')}
      onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
      aria-label={lang === 'en' ? '한국어로 보기' : 'Switch to English'}
    >
      <span style={{ opacity: lang === 'en' ? 1 : 0.5 }}>EN</span> · <span style={{ opacity: lang === 'ko' ? 1 : 0.5 }}>한국어</span>
    </button>
  )
}

const TABS = [
  { id: 'home', icon: 'home', en: 'Home', ko: '홈' },
  { id: 'solve', icon: 'hand', en: 'Ask', ko: '해결' },
  { id: 'community', icon: 'community', en: 'Community', ko: '커뮤니티' },
  { id: 'points', icon: 'points', en: 'Points', ko: '포인트' },
]

export function TabBar({ current }) {
  const { go, tx } = useApp()
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <button key={t.id} aria-current={current === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
          <Icon name={t.icon} size={24} />
          <span>{tx(t.en, t.ko)}</span>
        </button>
      ))}
    </nav>
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
          {item.admin && <span className="tag manager">🇰🇷 {tx('Manager', '관리자')}</span>}
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
        if (!window.confirm(tx('Report this to the managers?', '관리자에게 신고할까요?'))) return
        setBusy(true)
        try {
          await call('report', { type, id: item.id, parentId })
          showToast(tx('Reported. A manager will check it.', '신고했어요. 관리자가 확인해요.'))
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
