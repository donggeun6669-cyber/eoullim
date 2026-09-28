import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store.jsx'
import Icon from '../components/Icon.jsx'
import { Avatar, TabBar, TopBar } from '../components/ui.jsx'
import { PEOPLE } from '../data/people.js'

function lastText(chat, L) {
  const m = chat.messages[chat.messages.length - 1]
  if (!m) return ''
  const t = L(m.text)
  if (chat.kind === 'group' && PEOPLE[m.from]) return PEOPLE[m.from].name.split(' ')[0] + ': ' + t
  return t
}

export function Chats() {
  const { go, tx, L, state } = useApp()
  const [tab, setTab] = useState('all')
  const chats = [...state.chats]
    .sort((a, b) => (b.updated || 0) - (a.updated || 0))
    .filter((c) => tab === 'all' || (tab === 'groups' ? c.kind === 'group' : c.kind === 'person'))
  return (
    <>
      <div className="screen with-tabs">
        <div className="topbar"><div className="title display" style={{ fontSize: 22 }}>{tx('Chats', '채팅')}</div></div>
        <div className="seg sm">
          <button aria-pressed={tab === 'all'} onClick={() => setTab('all')}>{tx('All', '전체')}</button>
          <button aria-pressed={tab === 'people'} onClick={() => setTab('people')}>{tx('People', '사람')}</button>
          <button aria-pressed={tab === 'groups'} onClick={() => setTab('groups')}>{tx('Groups', '그룹')}</button>
        </div>

        <div className="list" style={{ gap: 4 }}>
          {tab === 'all' && (
            <button className="person-row" style={{ background: 'var(--primary-tint)' }} onClick={() => go('guide')}>
              <div className="avatar" style={{ width: 52, height: 52, background: 'var(--primary)', color: '#fff' }}><Icon name="bot" size={26} /></div>
              <span className="col">
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span className="name">Eoullim Guide</span><span className="tag">Bot</span></span>
                <span className="meta">{tx('Ask anything about life at SKKU', '성대 생활, 뭐든 물어보세요')}</span>
              </span>
              <span className="time">{tx('Now', '지금')}</span>
            </button>
          )}
          {chats.map((c) => {
            const p = PEOPLE[c.id]
            const last = c.messages[c.messages.length - 1]
            return (
              <button key={c.id} className="person-row" style={{ background: 'transparent' }} onClick={() => go('chat', c.id)}>
                {c.kind === 'group' ? (
                  <div className="avatar" style={{ width: 52, height: 52, background: 'var(--skku-tint)', color: 'var(--skku)' }}><Icon name="users" size={24} /></div>
                ) : (
                  <Avatar id={c.id} />
                )}
                <span className="col">
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className="name truncate">{c.kind === 'group' ? L(c.name) : p.name}</span>
                    {c.request && <span className="tag amber">{tx('Request', '요청')}</span>}
                    {p?.roles.includes('mentor') && <span className="tag">{tx('Mentor', '멘토')}</span>}
                  </span>
                  <span className="meta truncate">{lastText(c, L)}</span>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className="time">{last?.time}</span>
                  {c.unread > 0 && <span className="tabbar-count" style={{ minWidth: 20, height: 20, borderRadius: 10, background: 'var(--coral)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{c.unread}</span>}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <TabBar current="chats" />
    </>
  )
}

export function ChatRoom({ id }) {
  const { go, tx, L, state, sendMessage, markRead, confirmHelp } = useApp()
  const chat = state.chats.find((c) => c.id === id)
  const p = PEOPLE[id]
  const [text, setText] = useState('')
  const [showTr, setShowTr] = useState(true)
  const end = useRef(null)

  useEffect(() => { markRead(id) }, [id, chat?.messages.length]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [chat?.messages.length, chat?.typing])

  if (!chat) return <div className="screen"><TopBar title="" /><div className="empty">{tx('No chat yet.', '채팅이 없어요.')}</div></div>
  const isGroup = chat.kind === 'group'
  const canConfirm = p?.roles.includes('mentor') && chat.messages.some((m) => m.from === 'them')

  const send = (t) => {
    if (!t.trim()) return
    sendMessage(id, t.trim())
    setText('')
  }

  return (
    <>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="topbar">
          <button className="icon-btn ghost" aria-label={tx('Back', '뒤로')} onClick={() => go('chats')}><Icon name="back" /></button>
          {isGroup ? (
            <div className="avatar" style={{ width: 40, height: 40, background: 'var(--skku-tint)', color: 'var(--skku)' }}><Icon name="users" size={20} /></div>
          ) : (
            <button onClick={() => go('person', id)} style={{ border: 0, background: 'none', padding: 0 }}><Avatar id={id} size={40} /></button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="name truncate" style={{ fontSize: 15 }}>{isGroup ? L(chat.name) : p.name}</div>
            <div className="small">
              {isGroup ? tx('Group · 5 members online', '그룹 · 5명 접속 중') : (p.online ? tx('Online', '접속 중') : tx('Offline', '오프라인')) + (p.roles.includes('mentor') ? tx(' · Mentor', ' · 멘토') : '')}
            </div>
          </div>
          {canConfirm && (
            <button className={'btn xs ' + (chat.confirmed ? 'green' : 'amber')} onClick={() => confirmHelp(id)} disabled={chat.confirmed} style={{ opacity: 1 }}>
              {chat.confirmed ? '✓ ' + tx('Confirmed', '확인됨') : tx('Confirm help', '도움 확인')}
            </button>
          )}
        </div>
      </div>

      <div className="screen" style={{ gap: 10, paddingTop: 14 }}>
        <div className="system-note">{tx('Today', '오늘')}</div>
        {chat.messages.map((m, i) => {
          if (m.from === 'system') return <div key={i} className="system-note">{L(m.text)}</div>
          const mine = m.from === 'me'
          const sender = isGroup && !mine ? PEOPLE[m.from] : null
          return (
            <div key={i} className={'bubble-row' + (mine ? ' me' : '')}>
              {!mine && (sender ? <Avatar id={sender.id} size={32} showOnline={false} /> : !isGroup && <Avatar id={id} size={32} showOnline={false} />)}
              <div className="bubble">
                {sender && <b style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>{sender.name}</b>}
                {L(m.text)}
                {showTr && m.tr && <span className="tr"><Icon name="translate" size={12} /> {m.tr}</span>}
              </div>
              <span className="time">{m.time}</span>
            </div>
          )
        })}
        {chat.typing && (
          <div className="bubble-row">
            <Avatar id={id} size={32} showOnline={false} />
            <div className="bubble typing"><span /><span /><span /></div>
          </div>
        )}
        {canConfirm && !chat.confirmed && (
          <div className="card" style={{ background: 'var(--amber-tint)', color: 'var(--amber-ink)', fontSize: 13, lineHeight: 1.45 }}>
            {tx(`After ${p.name.split(' ')[0]} helps you, tap `, `${p.ko || p.name}님이 도와주면 `)}<b>{tx('Confirm help', '도움 확인')}</b>
            {tx(' to give ', '을 눌러 ')}<b>+50 P</b>{tx('.', '를 보내 주세요.')}
          </div>
        )}
        <div ref={end} />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '8px 14px 0', overflowX: 'auto' }}>
        <button className="chip" aria-pressed={showTr} onClick={() => setShowTr(!showTr)} style={{ height: 34, fontSize: 13 }}>
          <Icon name="translate" size={14} /> {tx('Translate', '번역')}
        </button>
        <button className="chip" style={{ height: 34, fontSize: 13 }} onClick={() => send(tx('Can we meet on campus? 캠퍼스에서 만날 수 있을까요?', '캠퍼스에서 만날 수 있을까요?'))}>
          <Icon name="pin" size={14} /> {tx('Meet on campus', '캠퍼스에서 만나기')}
        </button>
        <button className="chip" style={{ height: 34, fontSize: 13 }} onClick={() => go('guide')}>
          <Icon name="bot" size={14} /> {tx('Ask guide', '가이드에 묻기')}
        </button>
      </div>
      <form className="composer" onSubmit={(e) => { e.preventDefault(); send(text) }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={tx('Message…', '메시지 입력…')} aria-label={tx('Message', '메시지')} />
        <button className="send-btn" disabled={!text.trim()} aria-label={tx('Send', '보내기')}><Icon name="send" size={20} /></button>
      </form>
    </>
  )
}
