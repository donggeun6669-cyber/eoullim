import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store.jsx'
import Icon from '../components/Icon.jsx'
import { TabBar } from '../components/ui.jsx'
import { KB, kbById, searchKB } from '../data/bot.js'
import { PROGRAMS, PROGRAM_CATS } from '../data/programs.js'

const RELATED_PROGRAM_CAT = { buddy_programs: 'friends', korean_language_courses: 'korean', counseling_mental_health: 'care', emergency_contacts: 'office' }
const QUICK = ['arc_visa', 'bank_account', 'library', 'course_registration', 'buddy_programs', 'shuttle_bus', 'certificate_issuance', 'emergency_contacts']

const HANGUL = /[\uac00-\ud7a3]/

export function Answer({ entry, compact, lang, clamp }) {
  const { L, tx } = useApp()
  const [more, setMore] = useState(!clamp)
  const pick = (o) => (lang ? o[lang] ?? o.en : L(o))
  return (
    <>
      <span style={more ? undefined : { display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{pick(entry.a)}</span>
      {!more && (
        <button onClick={() => setMore(true)} style={{ border: 0, background: 'none', padding: '4px 0 0', color: 'var(--primary-ink)', fontSize: 13, fontWeight: 700 }}>
          {tx('Read more', '더 보기')}
        </button>
      )}
      {entry.note && (
        <span style={{ display: 'block', marginTop: 8, fontSize: 12, color: 'var(--amber-ink)', background: 'var(--amber-tint)', borderRadius: 8, padding: '4px 8px' }}>
          ⚠ {pick(entry.note)}
        </span>
      )}
      {!compact && (
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {entry.sources.map((s) => (
            <a key={s.url} className="src" href={s.url} target="_blank" rel="noreferrer" style={{ marginTop: 0 }}>
              <Icon name="book" size={13} /> {s.title.length > 42 ? s.title.slice(0, 40) + '…' : s.title}
              {s.page ? ' · ' + s.page : ''} <Icon name="external" size={12} />
            </a>
          ))}
        </span>
      )}
      {compact && <span className="src">{tx('Official SKKU guide', '성균관대 공식 안내')}</span>}
    </>
  )
}

function Bot({ openPrograms }) {
  const { L, tx, go } = useApp()
  const [msgs, setMsgs] = useState([{ from: 'bot', hello: true }])
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const end = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [msgs, thinking])

  const ask = (q, forcedId) => {
    if (!q.trim()) return
    setMsgs((m) => [...m, { from: 'me', text: q }])
    setText('')
    setThinking(true)
    setTimeout(() => {
      const { best, related } = forcedId ? { best: kbById(forcedId), related: [] } : searchKB(q)
      setThinking(false)
      const lang = HANGUL.test(q) ? 'ko' : 'en' // answer in the language of the question
      setMsgs((m) => [...m, best ? { from: 'bot', id: best.id, lang, related: related.map((r) => r.id) } : { from: 'bot', miss: true }])
    }, 650)
  }

  return (
    <>
      <div className="card row" style={{ background: 'var(--skku-tint)', color: 'var(--skku)', fontSize: 13, lineHeight: 1.45 }}>
        <Icon name="shield" size={22} style={{ flexShrink: 0 }} />
        <span>
          <b>{tx('Connected: official SKKU guides', '연결됨: 성균관대 공식 안내')}</b> · {KB.length} {tx('topics', '개 주제')}
          <br />
          {tx('Answers come only from these pages, with the link. If it is not there, a mentor answers.', '이 페이지에 있는 내용만 링크와 함께 답해요. 없으면 멘토에게 연결해요.')}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => {
          if (m.from === 'me')
            return (
              <div key={i} className="bubble-row me">
                <div className="bubble">{m.text}</div>
              </div>
            )
          const entry = m.id && kbById(m.id)
          return (
            <div key={i} className="bubble-row">
              <div className="avatar" style={{ width: 32, height: 32, background: 'var(--primary)', color: '#fff' }}>
                <Icon name="bot" size={18} />
              </div>
              <div className="bubble" style={{ maxWidth: '84%' }}>
                {m.hello &&
                  tx(
                    "Hi! I'm the Eoullim Help Bot. I answer from SKKU's official guides for international students, so you can check every answer. Ask about visa, bank, library, courses and more.",
                    '안녕하세요! 어울림 헬프봇이에요. 성균관대 외국인 학생 공식 안내를 근거로 답하고, 출처 링크를 같이 드려요. 비자, 은행, 도서관, 수강신청 등을 물어보세요.',
                  )}
                {entry && (
                  <>
                    <b style={{ display: 'block', marginBottom: 4 }}>{entry.icon} {entry.topic[m.lang] || L(entry.topic)}</b>
                    <Answer entry={entry} lang={m.lang} clamp />
                    {RELATED_PROGRAM_CAT[entry.id] && (
                      <button className="btn xs soft" style={{ marginTop: 8, display: 'flex' }} onClick={() => openPrograms(RELATED_PROGRAM_CAT[entry.id])}>
                        {tx('See related programs', '관련 프로그램 보기')} →
                      </button>
                    )}
                    {m.related?.length > 0 && (
                      <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                        {m.related.map((r) => (
                          <button key={r} className="tag gray" style={{ border: 0 }} onClick={() => ask(L(kbById(r).q), r)}>
                            {tx('Also: ', '관련: ')}{L(kbById(r).label)}
                          </button>
                        ))}
                      </span>
                    )}
                  </>
                )}
                {m.miss && (
                  <>
                    {tx(
                      "I couldn't find this in the official guides, and I don't guess. A mentor from your university can answer it.",
                      '공식 안내에서 찾지 못했어요. 추측해서 답하지 않아요. 우리 학교 멘토가 답해 줄 수 있어요.',
                    )}
                    <span style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <button className="btn xs" onClick={() => go('request')}>{tx('Ask a mentor', '멘토에게 묻기')}</button>
                      <button className="btn xs line" onClick={() => go('community', 'qa')}>{tx('Post in Q&A', 'Q&A에 올리기')}</button>
                    </span>
                  </>
                )}
              </div>
            </div>
          )
        })}
        {thinking && (
          <div className="bubble-row">
            <div className="avatar" style={{ width: 32, height: 32, background: 'var(--primary)', color: '#fff' }}><Icon name="bot" size={18} /></div>
            <div className="bubble typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={end} />
      </div>

      <div className="field">
        <span className="label">{tx('Try asking', '이렇게 물어보세요')}</span>
        <div className="chips">
          {QUICK.map((id) => {
            const e = kbById(id)
            return (
              <button key={id} className="chip" onClick={() => ask(L(e.q), id)}>
                {e.icon} {L(e.label)}
              </button>
            )
          })}
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(text) }}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 76, zIndex: 4, display: 'flex', gap: 8, background: '#fff', padding: '8px 16px', borderTop: '1px solid var(--line)' }}
      >
        <input
          className="input"
          style={{ height: 48, borderRadius: 24 }}
          placeholder={tx('Ask in English or Korean…', '한국어나 영어로 물어보세요…')}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="send-btn" style={{ width: 48, height: 48, borderRadius: 24 }} disabled={!text.trim()} aria-label={tx('Send', '보내기')}>
          <Icon name="send" size={20} />
        </button>
      </form>
    </>
  )
}

function Programs({ cat, setCat }) {
  const { L, tx } = useApp()
  const [open, setOpen] = useState(null)
  const list = PROGRAMS.filter((p) => cat === 'all' || p.cat === cat)
  return (
    <>
      <p className="sub">
        {tx(
          'Support that already exists at SKKU. Eoullim connects you to it — tap a card for who it is for and how to join.',
          '성균관대에 이미 있는 지원 프로그램이에요. 어울림이 연결해 드려요. 카드를 누르면 대상과 참여 방법이 보여요.',
        )}
      </p>
      <div className="chips scroll">
        {PROGRAM_CATS.map((c) => (
          <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{L(c)}</button>
        ))}
      </div>
      <div className="list">
        {list.map((p) => {
          const isOpen = open === p.id
          return (
            <div key={p.id} className="card white" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => setOpen(isOpen ? null : p.id)} className="row" style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', alignItems: 'flex-start' }} aria-expanded={isOpen}>
                <span className="avatar" style={{ width: 44, height: 44, background: 'var(--skku-tint)', fontSize: 22, fontFamily: 'var(--body)' }}>{p.icon}</span>
                <span className="col">
                  <span className="name" style={{ fontSize: 15 }}>{L(p.name)}</span>
                  <span className="meta">{L(p.org)}</span>
                </span>
                <Icon name="chevron" size={20} style={{ color: 'var(--muted)', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flexShrink: 0, marginTop: 4 }} />
              </button>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{L(p.desc)}</p>
              {isOpen && (
                <>
                  <div className="field">
                    <span className="label">{tx('Who', '대상')}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.5 }}>{L(p.who)}</span>
                  </div>
                  <div className="field">
                    <span className="label">{tx('How to join', '참여 방법')}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.5 }}>{L(p.how)}</span>
                  </div>
                  <div className="field">
                    <span className="label">{tx('Contact', '문의')}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.5 }}>{p.contact}</span>
                  </div>
                </>
              )}
              <a className="link-out" href={p.url} target="_blank" rel="noreferrer">
                {tx('Official page', '공식 페이지')} <Icon name="external" size={16} />
              </a>
            </div>
          )
        })}
      </div>
      <p className="small" style={{ lineHeight: 1.5 }}>
        {tx('Checked on 2026-09-28. Recruitment dates change each semester — always check the official page.', '2026-09-28 확인. 모집 일정은 학기마다 바뀌니 공식 페이지를 꼭 확인하세요.')}
      </p>
    </>
  )
}

export default function Guide({ id }) {
  const { tx } = useApp()
  const [tab, setTab] = useState(id === 'programs' ? 'programs' : 'bot')
  const [cat, setCat] = useState('all')
  const openPrograms = (c) => { setCat(c); setTab('programs') }
  return (
    <>
      <div className="screen with-tabs" style={tab === 'bot' ? { paddingBottom: 160 } : undefined}>
        <div className="topbar">
          <div style={{ flex: 1 }}>
            <div className="title display" style={{ fontSize: 22 }}>{tx('Guide', '가이드')}</div>
            <div className="small">{tx('AI help bot · official SKKU programs', 'AI 헬프봇 · 성균관대 공식 프로그램')}</div>
          </div>
        </div>
        <div className="seg sm">
          <button aria-pressed={tab === 'bot'} onClick={() => setTab('bot')}>{tx('Help Bot', '헬프봇')}</button>
          <button aria-pressed={tab === 'programs'} onClick={() => setTab('programs')}>{tx('Programs', '지원 프로그램')}</button>
        </div>
        {tab === 'bot' ? <Bot openPrograms={openPrograms} /> : <Programs cat={cat} setCat={setCat} />}
      </div>
      <TabBar current="guide" />
    </>
  )
}
