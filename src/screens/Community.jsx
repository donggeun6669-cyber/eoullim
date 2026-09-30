import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { AnonToggle, Byline, ExampleTag, Fab, Loading, ReportButton, TabBar, TopBar, ago } from '../components/ui.jsx'
import { hasPrivateInfo } from '../lib/api.js'
import { useApp } from '../store.jsx'
import { BOARDS, LOUNGES } from '../i18n.js'

const SECTIONS = [
  { id: 'together', en: 'Together', ko: '같이 해요' },
  { id: 'free', en: 'Free talk', ko: '자유' },
  { id: 'lounge', en: 'Languages', ko: '언어별' },
  { id: 'hot', en: 'Hot', ko: '인기' },
]

function PostCard({ p }) {
  const { go, tx, L, data } = useApp()
  const b = BOARDS[p.board]
  return (
    <button className="card q-card" onClick={() => go('post', p.id)}>
      <span className="tags">
        <span className="tag gray">{b.icon} {L(b)}</span>
        {p.hidden && <span className="tag coral">{tx('Hidden', '가려짐')}</span>}
        {p.seed && <ExampleTag />}
      </span>
      <b className="q-title">{p.title}</b>
      {p.body && <span className="snippet">{p.body}</span>}
      {p.meetup && (
        <span className="meetup-line">
          <span>📅 {p.meetup.date}</span>
          <span>📍 {p.meetup.place}</span>
          <span className={'tag ' + (p.meetup.joined >= p.meetup.cap ? 'gray' : 'green')}>
            👥 {p.meetup.joined}/{p.meetup.cap} {p.meetup.joined >= p.meetup.cap ? tx('Full', '마감') : ''}
          </span>
        </span>
      )}
      <span className="small">
        {p.snap ? p.snap.nick : tx('Anonymous', '익명')} · {ago(p.created, data.now, tx)} · ♥ {p.likes} · 💬 {p.comments.length}
      </span>
    </button>
  )
}

export default function Community() {
  const { data, tx, L, go, profile } = useApp()
  const [section, setSection] = useState('together')
  const myLounge = LOUNGES.find((l) => profile?.langs?.includes(l.slice(2))) || 'l-en'
  const [lounge, setLounge] = useState(myLounge)
  if (!data) return <div className="screen"><Loading /><TabBar current="community" /></div>

  let list
  if (section === 'hot') list = [...data.posts].filter((p) => p.likes + p.comments.length >= 5).sort((a, b) => b.likes + b.comments.length - (a.likes + a.comments.length))
  else if (section === 'lounge') list = data.posts.filter((p) => p.board === lounge)
  else list = data.posts.filter((p) => p.board === section)

  const writeBoard = section === 'lounge' ? lounge : section === 'hot' ? 'free' : section

  return (
    <>
      <div className="screen with-tabs">
        <div>
          <h1 className="h1">{tx('Community', '커뮤니티')}</h1>
          <p className="sub">{tx('Find people, talk freely — anonymous by default.', '같이 할 사람 찾고, 편하게 이야기해요. 기본은 익명이에요.')}</p>
        </div>
        <div className="seg sm" role="group">
          {SECTIONS.map((s) => (
            <button key={s.id} aria-pressed={section === s.id} onClick={() => setSection(s.id)}>{tx(s.en, s.ko)}</button>
          ))}
        </div>
        {section === 'lounge' && (
          <>
            <div className="chips scroll">
              {LOUNGES.map((l) => (
                <button key={l} className="chip" aria-pressed={lounge === l} onClick={() => setLounge(l)}>{L(BOARDS[l])}</button>
              ))}
            </div>
            <p className="small">{tx('Lounges are by language, not nationality. Koreans who like the language are welcome too.', '라운지는 국적이 아니라 언어로 나눠요. 그 언어에 관심 있는 한국 학생도 환영이에요.')}</p>
          </>
        )}
        <div className="list">
          {list.length === 0 && <p className="empty">{tx('No posts yet — write the first one!', '아직 글이 없어요. 첫 글을 써 보세요!')}</p>}
          {list.map((p) => <PostCard key={p.id} p={p} />)}
        </div>
      </div>
      <Fab onClick={() => go('write', writeBoard)} label={section === 'together' ? tx('Start a meetup', '모집하기') : tx('Write', '글쓰기')} />
      <TabBar current="community" />
    </>
  )
}

export function Write({ id }) {
  const { tx, L, call, go, snap, showToast, data } = useApp()
  const [board, setBoard] = useState(BOARDS[id] ? id : 'free')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const today = new Date((data?.now || Date.now()) + 9 * 3600e3).toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [place, setPlace] = useState('')
  const [cap, setCap] = useState(4)
  const [anon, setAnon] = useState(board !== 'together')
  const [busy, setBusy] = useState(false)
  const together = board === 'together'
  const ok = title.trim() && (!together || (place.trim() && date && cap >= 2 && cap <= 50))

  const submit = async () => {
    setBusy(true)
    try {
      const r = await call('post', { board, title, body, anon, snap, meetup: together ? { date, place, cap: Number(cap) } : undefined })
      showToast(tx('Posted!', '올렸어요!'))
      go('post', r.result.id)
    } catch {
      /* toast shown */
    }
    setBusy(false)
  }

  return (
    <div className="screen">
      <TopBar title={together ? tx('Start a meetup', '모집글 쓰기') : tx('New post', '글쓰기')} />
      <label className="field">
        <span className="label">{tx('Board', '게시판')}</span>
        <select className="select" value={board} onChange={(e) => setBoard(e.target.value)}>
          {Object.entries(BOARDS).map(([k, b]) => (
            <option key={k} value={k}>{b.icon} {L(b)}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="label">{tx('Title', '제목')}</span>
        <input className="input" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder={together ? tx('e.g. Hangang picnic this Saturday', '예: 이번 토요일 한강 피크닉') : tx('What’s on your mind?', '무슨 이야기를 할까요?')} />
      </label>
      {together && (
        <div className="meetup-fields">
          <label className="field">
            <span className="label">{tx('Date', '날짜')}</span>
            <input className="input" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span className="label">{tx('People (incl. you)', '인원 (나 포함)')}</span>
            <input className="input" type="number" min={2} max={50} value={cap} onChange={(e) => setCap(e.target.value)} />
          </label>
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span className="label">{tx('Place — keep it general', '장소 — 대략적으로')}</span>
            <input className="input" value={place} maxLength={60} onChange={(e) => setPlace(e.target.value)} placeholder={tx('e.g. Seoul campus, Hyehwa station', '예: 인사캠, 혜화역')} />
          </label>
        </div>
      )}
      <label className="field">
        <span className="label">{tx('Text (optional)', '내용 (선택)')}</span>
        <textarea className="textarea" value={body} maxLength={1000} onChange={(e) => setBody(e.target.value)} />
      </label>
      {hasPrivateInfo(title + ' ' + body + ' ' + place) && <p className="warn">🔒 {tx('Phone numbers, emails and messenger IDs will be hidden as ***.', '전화번호·이메일·메신저 ID는 ***로 가려져요.')}</p>}
      {together && <p className="small note">🛡️ {tx('Meet in busy public places on campus. Never send money first.', '캠퍼스 안 사람 많은 곳에서 만나세요. 돈을 먼저 보내지 마세요.')}</p>}
      <AnonToggle anon={anon} setAnon={setAnon} />
      <button className="btn" disabled={busy || !ok} onClick={submit}>{busy ? tx('Posting…', '올리는 중…') : tx('Post', '올리기')}</button>
    </div>
  )
}

export function Post({ id }) {
  const { data, me, tx, L, call, snap, showToast } = useApp()
  const [text, setText] = useState('')
  const [anon, setAnon] = useState(true)
  const [busy, setBusy] = useState(false)
  if (!data) return <div className="screen"><Loading /></div>
  const p = data.posts.find((x) => x.id === id)
  if (!p) {
    return (
      <div className="screen">
        <TopBar title="" />
        <p className="empty">{tx('This post was removed.', '삭제된 글이에요.')}</p>
      </div>
    )
  }
  const b = BOARDS[p.board]
  const run = async (action, payload, msg) => {
    setBusy(true)
    try {
      await call(action, payload)
      if (msg) showToast(msg)
      return true
    } catch {
      return false
    } finally {
      setBusy(false)
    }
  }
  const full = p.meetup && p.meetup.joined >= p.meetup.cap

  return (
    <div className="screen">
      <TopBar title={`${b.icon} ${L(b)}`} />
      {p.hidden && <span className="tag coral">{tx('Hidden by reports — only you and managers see it', '신고로 가려짐 — 나와 관리자만 보여요')}</span>}
      <h1 className="h2">{p.title}</h1>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Byline item={p} />
        <ReportButton item={p} type="p" />
      </div>
      {p.body && <p className="post-body">{p.body}</p>}

      {p.meetup && (
        <div className="card meetup-card">
          <div className="meetup-line big">
            <span>📅 {p.meetup.date}</span>
            <span>📍 {p.meetup.place}</span>
          </div>
          <div className="progress-dark"><span style={{ width: `${Math.min(100, (p.meetup.joined / p.meetup.cap) * 100)}%` }} /></div>
          <span className="small">{tx(`${p.meetup.joined} of ${p.meetup.cap} joined`, `${p.meetup.cap}명 중 ${p.meetup.joined}명 참여`)}</span>
          {!p.mine && (
            <button className={'btn sm ' + (p.meetup.iJoined ? 'line' : '')} disabled={busy || (full && !p.meetup.iJoined)} onClick={() => run('join', { postId: p.id }, p.meetup.iJoined ? tx('You left.', '참여를 취소했어요.') : tx('Joined! Say hi in the comments 👋', '참여했어요! 댓글로 인사해 보세요 👋'))}>
              {p.meetup.iJoined ? tx('Leave', '참여 취소') : full ? tx('Full', '마감') : tx('Join 🙌', '참여할래요 🙌')}
            </button>
          )}
          <span className="small">🛡️ {tx('Meet in busy public places. Never send money first.', '사람 많은 곳에서 만나고, 돈을 먼저 보내지 마세요.')}</span>
        </div>
      )}

      <div className="row" style={{ gap: 16 }}>
        <button className={'like-btn' + (p.liked ? ' on' : '')} disabled={busy} onClick={() => run('like', { postId: p.id })} aria-pressed={p.liked}>
          <Icon name="heart" size={18} /> {p.likes}
        </button>
        <span className="small">💬 {p.comments.length}</span>
      </div>

      <div className="list">
        {p.comments.map((c) => (
          <div key={c.id} className={'comment' + (c.admin ? ' by-admin' : '')}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <Byline item={c} size={26} showLevel={false} />
              <ReportButton item={c} type="c" parentId={p.id} />
            </div>
            {c.hidden && <span className="tag coral">{tx('Hidden', '가려짐')}</span>}
            <p className="post-body" style={{ fontSize: 14 }}>{c.body}</p>
            {me?.admin && <button className="linkish muted" onClick={() => run('adminHide', { type: 'c', id: c.id, parentId: p.id, hidden: !c.hidden })}>{c.hidden ? tx('Show again', '다시 보이기') : tx('Hide', '가리기')}</button>}
          </div>
        ))}
      </div>

      <div className="card white answer-box">
        <textarea className="textarea" style={{ minHeight: 70 }} value={text} maxLength={300} onChange={(e) => setText(e.target.value)} placeholder={tx('Write a comment…', '댓글 쓰기…')} />
        <AnonToggle anon={anon} setAnon={setAnon} />
        <button className="btn sm" disabled={busy || !text.trim()} onClick={async () => { if (await run('comment', { postId: p.id, body: text, anon, snap })) setText('') }}>
          {tx('Comment', '댓글 달기')}
        </button>
      </div>

      {me?.admin && (
        <div className="card admin-panel">
          <b>🇰🇷 {tx('Manager tools', '관리자 도구')}</b>
          <button className="btn line xs" disabled={busy} onClick={() => run('adminHide', { type: 'p', id: p.id, hidden: !p.hidden })}>{p.hidden ? tx('Show again', '다시 보이기') : tx('Hide post', '글 가리기')}</button>
          {p.reports > 0 && <span className="small">🚩 {tx(`${p.reports} reports`, `신고 ${p.reports}건`)}</span>}
        </div>
      )}
    </div>
  )
}
