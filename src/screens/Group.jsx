import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Avatar, Loading, TabBar, Tr, ago, flagOf, markSeen, useGroupName } from '../components/ui.jsx'
import { useApp } from '../store.jsx'
import { COUNTRIES, MISSIONS, REGIONS, TIES, regionOf } from '../i18n.js'

function SystemLine({ m }) {
  const { tx, L } = useApp()
  const who = m.snap?.nick
  const tie = m.extra?.tie && COUNTRIES[m.extra.country] ? ` · ${COUNTRIES[m.extra.country].flag} ${L(COUNTRIES[m.extra.country])} ${L(TIES[m.extra.tie])}` : ''
  const text = {
    join: who ? tx(`${who} joined the group 👋`, `${who}님이 들어왔어요 👋`) : tx('A new member joined 👋', '새 멤버가 들어왔어요 👋'),
    leave: who ? tx(`${who} left the group`, `${who}님이 나갔어요`) : tx('A member left', '멤버 한 명이 나갔어요'),
    start: tx('🎉 Your group has started! Get to know each other.', '🎉 그룹이 시작됐어요! 서로 인사해 보세요.'),
    mission: tx(`✅ This week’s mission is done${who ? ` (${who})` : ''}!`, `✅ 이번 주 미션 완료${who ? ` (${who})` : ''}!`),
    mentor: tx(`🇰🇷 ${who || 'A Korean mentor'} is now your mentor`, `🇰🇷 ${who || '한국인 멘토'}님이 멘토가 됐어요`) + tie,
    joinRegion: who ? tx(`${who} joined from a country group that was still forming 👋`, `${who}님이 들어왔어요 — 나라 조가 아직 모이지 않아 지역 조로 👋`) : tx('A new member joined 👋', '새 멤버가 들어왔어요 👋'),
    movedRegion: tx('This group moved to a regional group to get started.', '이 조는 먼저 시작하려고 지역 조로 옮겼어요.'),
    mentorLeft: tx(`${who || 'A mentor'} stopped mentoring this group.`, `${who || '멘토'}님이 이 그룹 멘토를 그만뒀어요.`),
    friend: tx(`🇰🇷 ${who || 'A Korean mentor'} joined 👋`, `🇰🇷 ${who || '한국인 멘토'}님이 들어왔어요 👋`), // old v4 messages
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
          {me?.mentor && me?.kr && (
            <p className="note card">🇰🇷 {tx('No group in your countries needs a mentor right now. Try “any country” — groups without a mentor come first.', '지금은 관심 나라 그룹에 멘토가 더 필요하지 않아요. 「어디든 괜찮아요」를 고르면 멘토가 없는 조부터 맡을 수 있어요.')}</p>
          )}
          <div className="card group-hero">
            <span style={{ fontSize: 34 }}>👥</span>
            <b className="h2">{tx('Meet your people in Korea', '한국에서 함께할 우리 조')}</b>
            <span className="light-text">{tx('3–4 students from your country + a verified Korean mentor, for the whole semester. Free — always.', '같은 나라 친구 3~4명 + 인증된 한국인 멘토가 한 학기 내내 함께해요. 언제나 무료예요.')}</span>
            {me?.admin ? (
              <button className="btn white sm" onClick={() => go('admin')}>🇰🇷 {tx('Take a group as mentor', '멘토로 그룹 맡기')}</button>
            ) : (
              <button className="btn accent sm" onClick={() => go('setup', me?.mentor ? 'kr' : undefined)}>{me?.mentor ? tx('Find a group to mentor', '맡을 그룹 찾기') : tx('Find my group', '내 그룹 찾기')}</button>
            )}
          </div>
          <ul className="steps">
            <li><b>1</b>{tx('Pick your school and country', '학교와 나라를 고르면')}</li>
            <li><b>2</b>{tx('We put you in a group of 3–4 from the same country', '같은 나라 3~4명 그룹에 자동으로 들어가요')}</li>
            <li><b>3</b>{tx('A verified Korean mentor joins and helps you settle in', '인증된 한국인 멘토가 함께하며 정착을 도와요')}</li>
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
  const countries = g.region || [g.country]
  const groupEvents = data.events.filter((e) => e.status === 'open' && (e.myGroupCount > 0 || countries.includes(e.country))).slice(0, 2)
  const waitDays = data.rules.REGION_WAIT_D
  const daysLeft = g.formingSince ? Math.max(0, Math.ceil(waitDays - (data.now - g.formingSince) / 864e5)) : waitDays
  const joinRegion = async () => {
    if (!window.confirm(tx('Start now in a regional group with students from nearby countries? Your group moves together.', '가까운 나라 친구들과 지역 조로 지금 바로 시작할까요? 우리 조 멤버도 함께 옮겨요.'))) return
    await call('joinRegion').catch(() => {})
  }

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
                  {g.mentoring ? tx('You are a mentor here', '내가 멘토인 그룹') : forming ? tx(`Waiting for members · starts at ${data.rules.GROUP_START}`, `멤버 모으는 중 · ${data.rules.GROUP_START}명이 되면 시작`) : tx('Together this semester', '이번 학기 함께해요')}
                </span>
              </span>
            </span>
            <span className="tag on-dark">{g.members.length}/{cap}</span>
          </div>
          <div className="member-row">
            {g.members.map((m, i) => (
              <span key={i} className="member">
                <Avatar snap={m.snap} size={40} />
                <span>{g.region && m.country ? `${COUNTRIES[m.country]?.flag || ''} ` : ''}{m.me ? tx('Me', '나') : m.snap?.nick || tx('Member', '멤버')}</span>
              </span>
            ))}
            {g.mentors.map((m, i) => (
              <span key={'k' + i} className="member mentor">
                <Avatar snap={m.snap} size={40} />
                <span>{m.me ? tx('Me', '나') : `🇰🇷 ${m.snap?.nick || tx('Mentor', '멘토')}`}</span>
              </span>
            ))}
            {!g.hasMentor && (
              <span className="member mentor">
                <span className="avatar-empty">🇰🇷</span>
                <span>{tx('Mentor soon', '멘토 배정 중')}</span>
              </span>
            )}
          </div>
          {g.mentors.filter((m) => m.tie && COUNTRIES[m.tieCountry]).map((m, i) => (
            <span key={'t' + i} className="light-text tie-line">🇰🇷 {m.me ? tx('Me', '나') : m.snap?.nick} · {COUNTRIES[m.tieCountry].flag} {L(COUNTRIES[m.tieCountry])} {L(TIES[m.tie])}</span>
          ))}
        </div>

        {forming && !g.mentoring && !g.region && (
          <div className="card forming-card">
            <b>⏳ {tx('Waiting for students from your country', '같은 나라 친구를 기다리는 중이에요')}</b>
            <span className="small">
              {tx(
                `If your group is still under ${data.rules.GROUP_START} in ${daysLeft} days, you all move together to a regional group (${REGIONS[regionOf(g.country)].en}) with students from nearby countries.`,
                `${daysLeft}일 안에 ${data.rules.GROUP_START}명이 안 되면, 우리 조 멤버가 함께 가까운 나라 친구들의 지역 조(${REGIONS[regionOf(g.country)].ko})로 옮겨 시작해요.`,
              )}
            </span>
            <button className="btn line xs" onClick={joinRegion}>🌏 {tx('Start now in a regional group', '지금 바로 지역 조로 시작')}</button>
          </div>
        )}

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
