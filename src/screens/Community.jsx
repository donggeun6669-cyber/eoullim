import { useState } from 'react'
import { useApp } from '../store.jsx'
import Icon from '../components/Icon.jsx'
import { Avatar, MeAvatar, TabBar, UNIS } from '../components/ui.jsx'
import { GROUPS, PEOPLE } from '../data/people.js'
import { kbById, searchKB } from '../data/bot.js'

function Post({ post }) {
  const { tx, L, state, toggleLike } = useApp()
  const [tr, setTr] = useState(false)
  const p = PEOPLE[post.author]
  const liked = !!state.likes[post.id]
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="row" style={{ gap: 10 }}>
        {p ? <Avatar id={p.id} size={40} showOnline={false} /> : <MeAvatar size={40} />}
        <span className="col">
          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="name" style={{ fontSize: 15 }}>{p ? p.name : state.me.name || tx('You', '나')}</span>
            {post.badge && <span className="tag gray">{L(post.badge)}</span>}
          </span>
          <span className="small">{L(post.when)}</span>
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>{post.text}</p>
      {post.tr && (
        <button onClick={() => setTr(!tr)} style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', color: 'var(--primary-ink)', fontSize: 13, fontWeight: 700 }}>
          <Icon name="translate" size={14} /> {tr ? tx('Hide translation', '번역 숨기기') : tx('See translation', '번역 보기')}
        </button>
      )}
      {tr && post.tr && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--muted)' }}>{post.tr}</p>}
      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--muted)' }}>
        <button onClick={() => toggleLike(post.id)} style={{ border: 0, background: 'none', padding: 0, display: 'flex', gap: 4, alignItems: 'center', color: liked ? 'var(--coral)' : 'var(--muted)' }} aria-pressed={liked}>
          <Icon name="heart" size={18} /> {post.likes + (liked ? 1 : 0)}
        </button>
        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Icon name="comment" size={18} /> {post.comments}</span>
      </div>
    </div>
  )
}

function Moments() {
  const { tx, state, addPost } = useApp()
  const [text, setText] = useState('')
  return (
    <>
      <form
        className="card white"
        style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 10 }}
        onSubmit={(e) => { e.preventDefault(); if (text.trim()) { addPost(text.trim()); setText('') } }}
      >
        <MeAvatar />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={tx('Share a moment from campus…', '캠퍼스의 순간을 공유해요…')} style={{ flex: 1, border: 0, fontSize: 15, outline: 'none', minWidth: 0 }} />
        <button className="btn xs" disabled={!text.trim()}>{tx('Post', '올리기')}</button>
      </form>
      <div className="list">{state.posts.map((p) => <Post key={p.id} post={p} />)}</div>
    </>
  )
}

function QA() {
  const { tx, L, state, addQuestion, go } = useApp()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(null)
  return (
    <>
      <form
        className="card white"
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          addQuestion(text.trim(), searchKB(text).best?.id)
          setText('')
        }}
      >
        <input className="input" style={{ height: 46 }} value={text} onChange={(e) => setText(e.target.value)} placeholder={tx('Ask the SKKU community…', '성대 커뮤니티에 질문하기…')} />
        <span className="small">{tx('The Help Bot adds an official-guide answer if it finds one. Best human answer gets +20 P.', '헬프봇이 공식 안내에서 찾으면 답을 먼저 달아요. 채택된 답변은 +20 P.')}</span>
        <button className="btn sm" disabled={!text.trim()}>{tx('Ask', '질문하기')}</button>
      </form>
      <div className="list">
        {state.questions.map((q) => {
          const bot = q.bot && kbById(q.bot)
          const isOpen = open === q.id
          return (
            <div key={q.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="name" style={{ fontSize: 15 }}>Q. {q.text}</span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="small">{tx(`${q.answers} ${q.answers === 1 ? 'answer' : 'answers'}`, `답변 ${q.answers}개`)}</span>
                <span className="tag amber">{tx('Best answer +20 P', '채택 +20 P')}</span>
                {q.mine && <span className="tag gray">{tx('Mine', '내 질문')}</span>}
              </span>
              {bot ? (
                <div style={{ background: '#fff', borderRadius: 14, padding: 12, fontSize: 14, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary-ink)' }}>
                    <Icon name="bot" size={16} /> {tx('Guide bot answer', '가이드봇 답변')} · {L(bot.label)}
                  </span>
                  <span style={isOpen ? undefined : { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{L(bot.a)}</span>
                  {isOpen && (
                    <a className="src" href={bot.sources[0].url} target="_blank" rel="noreferrer" style={{ alignSelf: 'flex-start' }}>
                      <Icon name="book" size={13} /> {tx('Source', '출처')}: {bot.sources[0].title.slice(0, 38)}… <Icon name="external" size={12} />
                    </a>
                  )}
                  <button onClick={() => setOpen(isOpen ? null : q.id)} style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', color: 'var(--primary-ink)', fontSize: 13, fontWeight: 700 }}>
                    {isOpen ? tx('Show less', '접기') : tx('Read more', '더 보기')}
                  </button>
                </div>
              ) : (
                q.mine && (
                  <div className="small" style={{ lineHeight: 1.5 }}>
                    {tx('Not in the official guide. Mentors have been notified.', '공식 안내에는 없어요. 멘토들에게 알렸어요.')}{' '}
                    <button onClick={() => go('request')} style={{ border: 0, background: 'none', padding: 0, color: 'var(--primary-ink)', fontWeight: 700, fontSize: 12 }}>
                      {tx('Ask a mentor directly →', '멘토에게 직접 묻기 →')}
                    </button>
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function Groups() {
  const { tx, L, state, toggleGroup } = useApp()
  return (
    <div className="list">
      {GROUPS.map((g) => {
        const joined = state.joinedGroups.includes(g.id)
        return (
          <div key={g.id} className="person-row">
            <div className="avatar" style={{ width: 48, height: 48, background: 'var(--skku-tint)', color: 'var(--skku)' }}><Icon name="users" /></div>
            <span className="col">
              <span className="name" style={{ fontSize: 15 }}>{L(g.name)}</span>
              <span className="meta">{L(g.desc)} · {g.members + (joined ? 1 : 0)}{tx(' members', '명')}</span>
            </span>
            <button className={'btn xs ' + (joined ? 'green' : '')} onClick={() => toggleGroup(g.id)}>
              {joined ? '✓ ' + tx('Joined', '참여 중') : tx('Join', '참여')}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default function Community({ id }) {
  const { tx, state } = useApp()
  const [tab, setTab] = useState(id === 'qa' ? 'qa' : id === 'groups' ? 'groups' : 'moments')
  const u = UNIS[state.uni]
  return (
    <>
      <div className="screen with-tabs">
        <div className="topbar">
          <div style={{ flex: 1 }}>
            <div className="title display" style={{ fontSize: 22 }}>{tx('Community', '커뮤니티')}</div>
            <div className="small">{u.name}</div>
          </div>
          <span className="tag skku">{u.short} {tx('only', '전용')}</span>
        </div>
        <div className="seg sm">
          <button aria-pressed={tab === 'moments'} onClick={() => setTab('moments')}>{tx('Moments', '모먼트')}</button>
          <button aria-pressed={tab === 'qa'} onClick={() => setTab('qa')}>Q&amp;A</button>
          <button aria-pressed={tab === 'groups'} onClick={() => setTab('groups')}>{tx('Groups', '모임')}</button>
        </div>
        {tab === 'moments' && <Moments />}
        {tab === 'qa' && <QA />}
        {tab === 'groups' && <Groups />}
      </div>
      <TabBar current="community" />
    </>
  )
}
