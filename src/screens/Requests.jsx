import { useMemo, useState } from 'react'
import { useApp } from '../store.jsx'
import Icon from '../components/Icon.jsx'
import { Avatar, TopBar } from '../components/ui.jsx'
import { PEOPLE, TOPICS, topic } from '../data/people.js'
import { searchKB } from '../data/bot.js'
import { Answer } from './Guide.jsx'

const TOPIC_ICON = { visa: '🪪', bank: '🏦', housing: '🏠', course: '📝', transport: '🚌', campus: '🏫' }
// Map request topics to the official-guide entries the bot checks first.
const TOPIC_HINT = { visa: 'arc visa', bank: 'bank account', housing: 'dorm housing', course: 'course registration', transport: 'shuttle bus', campus: 'library student id' }

export function RequestHelp() {
  const { go, tx, L, state, createRequest } = useApp()
  const [t, setT] = useState(state.me.topics[0] || 'visa')
  const [text, setText] = useState('')
  const [lang, setLang] = useState(state.me.langs.includes('zh') ? 'zh' : state.lang === 'ko' ? 'ko' : 'en')
  const [peek, setPeek] = useState(false)
  const hint = useMemo(() => {
    const q = (text.length > 6 ? text : '') + ' ' + TOPIC_HINT[t]
    return searchKB(q).best
  }, [text, t])

  const send = () => {
    createRequest({ topic: t, text: text.trim(), lang })
    go('requests', undefined, { replace: true })
  }

  return (
    <div className="screen">
      <TopBar title={tx('Ask for help', '도움 요청')} />
      <h1 className="h2">{tx('What do you need help with?', '어떤 도움이 필요해요?')}</h1>
      <div className="topic-grid">
        {TOPICS.map((x) => (
          <button key={x.id} className="option-card" aria-pressed={t === x.id} onClick={() => setT(x.id)}>
            <span style={{ fontSize: 20 }}>{TOPIC_ICON[x.id]}</span> {L(x)}
          </button>
        ))}
      </div>

      <label className="field">
        <span className="label">{tx('Tell mentors what you need', '멘토에게 필요한 것을 알려주세요')}</span>
        <textarea
          className="textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={tx('e.g. I moved last week. How do I report my new address?', '예: 지난주에 이사했어요. 새 주소 신고는 어떻게 하나요?')}
        />
      </label>

      {hint && (
        <div className="card" style={{ background: 'var(--skku-tint)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="row" style={{ gap: 8, color: 'var(--skku)' }}>
            <Icon name="sparkle" size={18} />
            <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{tx('The official guide may already answer this', '공식 안내에 답이 있을 수 있어요')}</span>
            <button className="btn xs line" onClick={() => setPeek(!peek)}>{peek ? tx('Hide', '접기') : tx('Read', '보기')}</button>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{hint.icon} {L(hint.topic)}</div>
          {peek && <div style={{ fontSize: 14, lineHeight: 1.5 }}><Answer entry={hint} /></div>}
        </div>
      )}

      <div className="field">
        <span className="label">{tx('Mentor can reply in', '멘토 답변 언어')}</span>
        <div className="chips">
          {[['en', 'English'], ['ko', '한국어'], ['zh', '中文']].map(([id, label]) => (
            <button key={id} className="chip" aria-pressed={lang === id} onClick={() => setLang(id)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ background: 'var(--amber-tint)', color: 'var(--amber-ink)', fontSize: 14 }}>
        {tx('The mentor who helps you earns ', '도와준 멘토는 ')}<b>+50 P</b>{tx('.', '를 받아요.')}
      </div>
      <button className="btn" disabled={text.trim().length < 4} onClick={send}>{tx('Send request', '요청 보내기')}</button>
    </div>
  )
}

export function MyRequests() {
  const { go, tx, L, state, cancelRequest } = useApp()
  const [tab, setTab] = useState(state.requests.some((r) => r.status === 'open') ? 'open' : 'matched')
  const list = state.requests.filter((r) => r.status === tab)
  const count = (s) => state.requests.filter((r) => r.status === s).length
  return (
    <div className="screen">
      <TopBar title={tx('My requests', '내 요청')} />
      <div className="seg sm">
        <button aria-pressed={tab === 'open'} onClick={() => setTab('open')}>{tx('Open', '대기')} {count('open') || ''}</button>
        <button aria-pressed={tab === 'matched'} onClick={() => setTab('matched')}>{tx('Matched', '연결됨')} {count('matched') || ''}</button>
        <button aria-pressed={tab === 'done'} onClick={() => setTab('done')}>{tx('Done', '완료')} {count('done') || ''}</button>
      </div>

      <div className="list">
        {list.map((r) => {
          const m = r.mentor && PEOPLE[r.mentor]
          return (
            <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <div className="col">
                  <span className="name" style={{ fontSize: 15 }}>{r.text}</span>
                  <span className="tags"><span className="tag">{L(topic(r.topic))}</span></span>
                </div>
                <span className={'tag ' + (r.status === 'open' ? 'amber' : r.status === 'matched' ? '' : 'green')}>
                  {r.status === 'open' ? tx('Waiting', '대기 중') : r.status === 'matched' ? tx('Matched', '연결됨') : tx('Done', '완료')}
                </span>
              </div>
              {r.status === 'open' && (
                <>
                  <p className="meta" style={{ margin: 0, lineHeight: 1.45 }}>
                    {tx('Mentors on this topic have been notified. You will get a message when one replies.', '이 주제 멘토들에게 알림이 갔어요. 답하면 메시지로 알려드려요.')}
                  </p>
                  <div className="typing" style={{ paddingLeft: 2 }}><span /><span /><span /></div>
                  <button className="btn xs line" onClick={() => cancelRequest(r.id)}>{tx('Cancel request', '요청 취소')}</button>
                </>
              )}
              {m && (
                <div className="row" style={{ background: '#fff', borderRadius: 14, padding: 10 }}>
                  <Avatar id={m.id} size={40} />
                  <span className="col">
                    <span className="name" style={{ fontSize: 14 }}>{m.name}</span>
                    <span className="meta">
                      {m.kind === 'korean' ? tx('Korean student', '한국 학생') : tx('International student', '외국인 학생')} ·{' '}
                      {r.status === 'done' ? tx('helped you', '도와줬어요') : tx('replied', '답장함')}
                    </span>
                  </span>
                  {r.status === 'matched' && <button className="btn xs" onClick={() => go('chat', m.id)}>{tx('Open chat', '채팅 열기')}</button>}
                </div>
              )}
              {r.status === 'done' && <span className="small">+50 P {tx('was given to your mentor.', '가 멘토에게 지급됐어요.')}</span>}
            </div>
          )
        })}
        {!list.length && <div className="empty">{tx('Nothing here yet.', '아직 없어요.')}</div>}
      </div>

      <div className="card white" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span className="h3" style={{ fontSize: 15 }}>{tx('How it works', '이용 방법')}</span>
        {[
          tx('Post a request', '요청을 올려요'),
          tx('A mentor from your university replies', '우리 학교 멘토가 답해요'),
          tx('Confirm the help. Your mentor earns points', '도움을 확인하면 멘토가 포인트를 받아요'),
        ].map((s, i) => (
          <div key={i} className="row" style={{ gap: 10, fontSize: 14 }}>
            <span className="avatar" style={{ width: 26, height: 26, background: 'var(--primary-tint)', color: 'var(--primary-ink)', fontSize: 13 }}>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>
      <button className="btn" onClick={() => go('request')}>{tx('Ask for help', '도움 요청')}</button>
    </div>
  )
}
