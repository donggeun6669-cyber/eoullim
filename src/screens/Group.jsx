import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Avatar, Loading, TabBar, Tr, ago, flagOf, markSeen, useGroupName } from '../components/ui.jsx'
import { useApp } from '../store.jsx'
import { COUNTRIES, MISSIONS } from '../i18n.js'

function SystemLine({ m }) {
  const { tx } = useApp()
  const who = m.snap?.nick
  const text = {
    join: who ? tx(`${who} joined the group 👋`, `${who}님이 들어왔어요 👋`) : tx('A new member joined 👋', '새 멤버가 들어왔어요 👋'),
    leave: who ? tx(`${who} left the group`, `${who}님이 나갔어요`) : tx('A member left', '멤버 한 명이 나갔어요'),
    start: tx('🎉 Your group has started! Get to know each other.', '🎉 그룹이 시작됐어요! 서로 인사해 보세요.'),
    mission: tx(`✅ This week’s mission is done${who ? ` (${who})` : ''}!`, `✅ 이번 주 미션 완료${who ? ` (${who})` : ''}!`),
    mentor: tx(`🇰🇷 ${who || 'A Korean mentor'} is now your mentor`, `🇰🇷 ${who || '한국인 멘토'}님이 멘토가 됐어요`),
    mentorLeft: tx('The mentor left. A new mentor will join soon.', '멘토가 바뀌어요. 곧 새 멘토가 와요.'),
  }[m.system]
  return <div className="system-note">{text}</div>
}

function Bubble({ m, now }) {
  const { tx } = useApp()
  if (m.system) return <SystemLine m={m} />
  return (
    <div className={'bubble-row' + (m.mine ? ' me' : '')}>
      {!m.mine && <Avatar snap={m.snap} size={30} />}
      <div className="col" style={{ flex: '0 1 auto', alignItems: m.mine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
        {!m.mine && (
          <span className="bubble-name">
            {m.snap?.nick || tx('Member', '멤버')}
            {m.mentor && <span className="tag manager">🇰🇷 {tx('Mentor', '멘토')}</span>}
          </span>
        )}
        <div className={'bubble' + (m.mentor ? ' mentor' : '')}>
          <Tr text={m.body} block />
        </div>
        <span className="time">{ago(m.created, now, tx)}</span>
      </div>
    </div>
  )
}

export default function Group() {
  const { data, me, tx, L, call, go, snap, refresh, showToast } = useApp()
  const gn = useGroupName()
  const [pick, setPick] = useState(0)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)
  const groups = data?.myGroups || []
  const g = groups[Math.min(pick, groups.length - 1)]
  const last = g?.messages.at(-1)?.created

  // Chat feels live: refresh every 3 seconds while this screen is open.
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === 'visible' && refresh(), 3000)
    return () => clearInterval(t)
  }, [refresh])
  useEffect(() => {
    if (g && last) markSeen(g.id, last)
  }, [g, last])

  if (!data) return <div className="screen"><Loading /><TabBar current="group" /></div>

  if (!g) {
    return (
      <>
        <div className="screen with-tabs">
          <h1 className="h1">{tx('My group', '내 그룹')}</h1>
          <div className="card group-hero">
            <span style={{ fontSize: 34 }}>👥</span>
            <b className="h2">{tx('Meet your people in Korea', '한국에서 함께할 우리 조')}</b>
            <span className="light-text">{tx('3–4 students from your country + 1 Korean mentor, for the whole semester. Free — always.', '같은 나라 친구 3~4명 + 한국인 멘토 1명이 한 학기 내내 함께해요. 언제나 무료예요.')}</span>
            {me?.admin ? (
              <button className="btn white sm" onClick={() => go('admin')}>🇰🇷 {tx('Take a group as mentor', '멘토로 그룹 맡기')}</button>
            ) : (
              <button className="btn accent sm" onClick={() => go('setup')}>{tx('Find my group', '내 그룹 찾기')}</button>
            )}
          </div>
          <ul className="steps">
            <li><b>1</b>{tx('Pick your school and country', '학교와 나라를 고르면')}</li>
            <li><b>2</b>{tx('We put you in a group of 3–4 from the same country', '같은 나라 3~4명 그룹에 자동으로 들어가요')}</li>
            <li><b>3</b>{tx('A Korean mentor joins and helps you settle in', '한국인 멘토가 함께하며 정착을 도와요')}</li>
            <li><b>4</b>{tx('Weekly missions and events with your group', '매주 미션, 그룹으로 이벤트 참가')}</li>
          </ul>
        </div>
        <TabBar current="group" />
      </>
    )
  }

  const week = data.week
  const mission = MISSIONS[((week % MISSIONS.length) + MISSIONS.length) % MISSIONS.length]
  const cap = data.rules.GROUP_CAP
  const forming = g.members.length < data.rules.GROUP_START
  const groupEvents = data.events.filter((e) => e.status === 'open' && (e.myGroupCount > 0 || e.country === g.country)).slice(0, 2)

  const send = async () => {
    if (!text.trim()) return
    setBusy(true)
    try {
      await call('groupMsg', { gid: g.id, body: text, snap })
      setText('')
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50)
    } catch {
      /* toast shown */
    }
    setBusy(false)
  }

  return (
    <>
      <div className="screen with-tabs group-screen">
        {groups.length > 1 && (
          <div className="chips scroll">
            {groups.map((x, i) => (
              <button key={x.id} className="chip" aria-pressed={i === pick} onClick={() => setPick(i)}>{flagOf(x)} {gn(x)}</button>
            ))}
          </div>
        )}

        <div className="card group-hero">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="row" style={{ gap: 10 }}>
              <span style={{ fontSize: 34 }}>{flagOf(g)}</span>
              <span className="col">
                <b className="h2">{gn(g)}</b>
                <span className="light-text">
                  {g.mentoring ? tx('You are the mentor', '내가 멘토인 그룹') : forming ? tx(`Waiting for members · starts at ${data.rules.GROUP_START}`, `멤버 모으는 중 · ${data.rules.GROUP_START}명이 되면 시작`) : tx('Together this semester', '이번 학기 함께해요')}
                </span>
              </span>
            </span>
            <span className="tag on-dark">{g.members.length}/{cap}</span>
          </div>
          <div className="member-row">
            {g.members.map((m, i) => (
              <span key={i} className="member">
                <Avatar snap={m.snap} size={40} />
                <span>{m.me ? tx('Me', '나') : m.snap?.nick || tx('Member', '멤버')}</span>
              </span>
            ))}
            {Array.from({ length: Math.max(0, cap - g.members.length) }, (_, i) => (
              <span key={'e' + i} className="member empty"><span className="avatar-empty">+</span><span>{tx('Open', '빈자리')}</span></span>
            ))}
            <span className="member mentor">
              {g.hasMentor ? <Avatar snap={g.mentor} size={40} /> : <span className="avatar-empty">🇰🇷</span>}
              <span>{g.hasMentor ? `🇰🇷 ${g.mentor?.nick || tx('Mentor', '멘토')}` : tx('Mentor soon', '멘토 배정 중')}</span>
            </span>
          </div>
        </div>

        <div className="card mission-card">
          <span className="small">{tx('This week’s group mission', '이번 주 그룹 미션')}</span>
          <b>{L(mission)}</b>
          {g.missionDone ? (
            <span className="tag">✅ {tx('Done this week', '이번 주 완료')}{g.missionBy?.nick ? ` · ${g.missionBy.nick}` : ''}</span>
          ) : (
            <button className="btn soft xs" onClick={() => call('mission', { gid: g.id, snap }).then(() => showToast(tx('Mission done! 🎉', '미션 완료! 🎉'))).catch(() => {})}>
              ✓ {tx('We did it', '우리 조 완료')}
            </button>
          )}
        </div>

        {groupEvents.length > 0 && (
          <div className="list" style={{ gap: 8 }}>
            {groupEvents.map((e) => (
              <button key={e.id} className="card row-link" onClick={() => go('event', e.id)}>
                <span style={{ fontSize: 22 }}>{e.emoji}</span>
                <span className="col">
                  <Tr text={e.title} as="b" className="truncate" />
                  <span className="small">
                    {e.date} · {e.myGroupCount > 0 ? tx(`${e.myGroupCount} from our group going`, `우리 조 ${e.myGroupCount}명 참가`) : tx(`${COUNTRIES[e.country]?.en || ''} event`, `${COUNTRIES[e.country]?.ko || ''} 행사`)}
                  </span>
                </span>
                <Icon name="chevron" size={18} />
              </button>
            ))}
          </div>
        )}

        <div className="chat">
          {g.messages.map((m) => <Bubble key={m.id} m={m} now={data.now} />)}
          <div ref={endRef} />
        </div>

        <div className="composer sticky">
          <input
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && send()}
            placeholder={tx('Message your group — any language', '그룹에 메시지 — 어떤 언어든 OK')}
            aria-label={tx('Message', '메시지')}
          />
          <button className="send-btn" disabled={busy || !text.trim()} onClick={send} aria-label={tx('Send', '보내기')}>
            <Icon name="send" size={20} />
          </button>
        </div>

        <button
          className="linkish muted"
          style={{ alignSelf: 'center' }}
          onClick={async () => {
            if (!window.confirm(g.mentoring ? tx('Stop mentoring this group?', '이 그룹 멘토를 그만둘까요?') : tx('Leave this group? You can join a new one later.', '그룹에서 나갈까요? 나중에 새 그룹에 들어갈 수 있어요.'))) return
            await call(g.mentoring ? 'mentorLeave' : 'leaveGroup', { gid: g.id }).catch(() => {})
          }}
        >
          {g.mentoring ? tx('Stop mentoring', '멘토 그만두기') : tx('Leave group', '그룹 나가기')}
        </button>
      </div>
      <TabBar current="group" />
    </>
  )
}
