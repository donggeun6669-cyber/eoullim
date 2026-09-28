import { useState } from 'react'
import { useApp } from '../store.jsx'
import Icon from '../components/Icon.jsx'
import { Avatar, TabBar, TopBar } from '../components/ui.jsx'
import { MenteeRow } from './Home.jsx'
import { FRIENDS, INTERESTS, MENTEES, MENTORS, PEOPLE, TOPICS, friendMatch, interest, langLabel, mentorScore, topic } from '../data/people.js'

function MentorCard({ id, topicId }) {
  const { go, L, tx, state } = useApp()
  const p = PEOPLE[id]
  const { why } = mentorScore(p, topicId, state.me.langs)
  const reasons = why.map((w) =>
    w === 'topic' ? tx('knows ', '') + L(topic(topicId)) + tx('', ' 도움 가능')
      : w === 'online' ? tx('online now', '지금 접속 중')
        : tx('speaks ', '') + langLabel(w.split(':')[1]) + tx('', ' 가능'),
  )
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="row">
        <Avatar id={id} />
        <span className="col">
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="name">{p.name}</span>
            <span className="meta">{p.ko}</span>
          </span>
          <span className="meta">{L(p.major)} · {p.kind === 'korean' ? tx('Korean student', '한국 학생') : tx('International student', '외국인 학생')}</span>
        </span>
        <span className="tag">{tx('Mentor', '멘토')}</span>
      </div>
      <div className="tags">{p.topics.map((t) => <span key={t} className="tag">{L(topic(t))}</span>)}</div>
      <div className="meta">{tx('Speaks ', '사용 언어 ')}{p.langs.map(langLabel).join(' · ')}</div>
      {topicId && reasons.length > 0 && <div className="why">✓ {tx('Why this match: ', '추천 이유: ')}{reasons.join(' · ')}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn sm line" onClick={() => go('person', id)}>{tx('View profile', '프로필 보기')}</button>
        <button className="btn sm" onClick={() => go('request')}>{tx('Ask for help', '도움 요청')}</button>
      </div>
    </div>
  )
}

function FriendCard({ p, shared, langs }) {
  const { go, L, tx, startChat } = useApp()
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="row">
        <Avatar id={p.id} />
        <span className="col">
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="name">{p.name}</span>
            <span className="meta">{p.ko}</span>
          </span>
          <span className="meta">{L(p.major)} · {tx('Year', '')} {p.year}{tx('', '학년')}</span>
        </span>
        {shared.length > 0 && <span className="tag green">{tx(`${shared.length} in common`, `${shared.length}개 겹침`)}</span>}
      </div>
      <div className="meta" style={{ lineHeight: 1.45 }}>{L(p.bio)}</div>
      <div className="tags">
        {p.interests.map((i) => <span key={i} className={'tag ' + (shared.includes(i) ? 'green' : 'gray')}>{L(interest(i))}</span>)}
      </div>
      {langs.length > 0 && <div className="meta">{tx('You both speak ', '같이 쓰는 언어: ')}{langs.map(langLabel).join(', ')}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn sm line" onClick={() => go('person', p.id)}>{tx('Profile', '프로필')}</button>
        <button
          className="btn sm"
          onClick={() => {
            startChat(p.id, { en: `You said hi to ${p.name}. Start with something you both like!`, ko: `${p.ko || p.name}님에게 인사했어요. 공통 관심사로 이야기를 시작해 보세요!` })
            go('chat', p.id)
          }}
        >
          {tx('Say hi', '인사하기')} 👋
        </button>
      </div>
    </div>
  )
}

export function Find({ id }) {
  const { tx, L, state } = useApp()
  const [tab, setTab] = useState(id === 'friends' ? 'friends' : id === 'mentees' ? 'mentees' : 'mentors')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [topicId, setTopicId] = useState(null)
  const [interestId, setInterestId] = useState(null)

  const me = state.me
  const mentors = MENTORS.filter((m) => (!onlineOnly || PEOPLE[m].online) && (!topicId || PEOPLE[m].topics.includes(topicId)))
    .sort((a, b) => mentorScore(PEOPLE[b], topicId, me.langs).score - mentorScore(PEOPLE[a], topicId, me.langs).score)
  const friends = FRIENDS.map((f) => ({ p: PEOPLE[f], ...friendMatch(PEOPLE[f], me) }))
    .filter(({ p }) => (!onlineOnly || p.online) && (!interestId || p.interests.includes(interestId)))
    .sort((a, b) => b.score - a.score)
  const mentees = MENTEES.filter((m) => !onlineOnly || PEOPLE[m].online)

  return (
    <>
      <div className="screen with-tabs">
        <div className="topbar">
          <div className="title display" style={{ fontSize: 22 }}>{tx('Find people', '사람 찾기')}</div>
          <span className="tag skku">{state.uni} {tx('only', '전용')}</span>
        </div>
        <div className="seg sm">
          <button aria-pressed={tab === 'mentors'} onClick={() => setTab('mentors')}>{tx('Mentors', '멘토')}</button>
          <button aria-pressed={tab === 'friends'} onClick={() => setTab('friends')}>{tx('Friends', '친구')}</button>
          <button aria-pressed={tab === 'mentees'} onClick={() => setTab('mentees')}>{tx('Mentees', '멘티')}</button>
        </div>

        <div className="chips scroll">
          <button className="chip" aria-pressed={onlineOnly} onClick={() => setOnlineOnly(!onlineOnly)}>● {tx('Online now', '접속 중')}</button>
          {tab === 'mentors' &&
            TOPICS.map((t) => (
              <button key={t.id} className="chip" aria-pressed={topicId === t.id} onClick={() => setTopicId(topicId === t.id ? null : t.id)}>{L(t)}</button>
            ))}
          {tab === 'friends' &&
            INTERESTS.map((t) => (
              <button key={t.id} className="chip" aria-pressed={interestId === t.id} onClick={() => setInterestId(interestId === t.id ? null : t.id)}>{L(t)}</button>
            ))}
        </div>

        {tab === 'friends' && (
          <div className="card row" style={{ background: 'var(--green-tint)', color: 'var(--green-ink)', fontSize: 13, lineHeight: 1.45 }}>
            <Icon name="sparkle" size={20} style={{ flexShrink: 0 }} />
            <span>
              {tx(
                'Korean students who signed up to make friends. Sorted by the interests and languages you share.',
                '친구를 원하는 한국 학생들이에요. 나와 겹치는 관심사·언어 순으로 보여줘요.',
              )}
              {!me.interests.length && tx(' Add interests in your profile for better matches.', ' 프로필에 관심사를 넣으면 더 잘 맞춰져요.')}
            </span>
          </div>
        )}

        <div className="list">
          {tab === 'mentors' && mentors.map((m) => <MentorCard key={m} id={m} topicId={topicId} />)}
          {tab === 'friends' && friends.map((f) => <FriendCard key={f.p.id} {...f} />)}
          {tab === 'mentees' && mentees.map((m) => <MenteeRow key={m} id={m} />)}
          {((tab === 'mentors' && !mentors.length) || (tab === 'friends' && !friends.length) || (tab === 'mentees' && !mentees.length)) && (
            <div className="empty">{tx('Nobody matches these filters yet.', '조건에 맞는 사람이 아직 없어요.')}</div>
          )}
        </div>
      </div>
      <TabBar current="find" />
    </>
  )
}

export function PersonProfile({ id }) {
  const { go, L, tx, state, startChat, offerHelp } = useApp()
  const p = PEOPLE[id]
  if (!p) return <div className="screen"><TopBar title="" /><div className="empty">Not found</div></div>
  const isMentor = p.roles.includes('mentor')
  const isMentee = p.roles.includes('mentee')
  const { shared } = friendMatch(p, state.me)
  const hi = () => {
    startChat(p.id)
    go('chat', p.id)
  }
  return (
    <div className="screen">
      <TopBar title={isMentor ? tx('Mentor profile', '멘토 프로필') : isMentee ? tx('Student', '학생') : tx('Friend profile', '친구 프로필')} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
        <Avatar id={id} size={88} />
        <div>
          <div className="display" style={{ fontSize: 24 }}>{p.name}</div>
          <div className="meta">{[p.ko, p.major && L(p.major) + (p.year ? tx(', Year ', ' ') + p.year + tx('', '학년') : '')].filter(Boolean).join(' · ') || L(p.status)}</div>
        </div>
        <div className="tags" style={{ justifyContent: 'center' }}>
          <span className="tag skku">✓ {state.uni} {tx('verified', '인증')}</span>
          {p.kind === 'korean' && <span className="tag gray">{tx('Korean student', '한국 학생')}</span>}
          {p.kind === 'international' && <span className="tag gray">{tx('International student', '외국인 학생')}</span>}
          {p.kind === 'exchange' && <span className="tag gray">{tx('Exchange student', '교환학생')}</span>}
          {p.online && <span className="tag green">● {tx('Online now', '접속 중')}</span>}
        </div>
      </div>

      {isMentor && (
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="stat"><b>{p.helped}</b><span>{tx('Mentees helped', '도운 멘티')}</span></div>
          <div className="stat"><b>{p.reply}</b><span>{tx('Avg. reply', '평균 답장')}</span></div>
          <div className="stat"><b>{p.rating}</b><span>{tx('Rating', '평점')}</span></div>
        </div>
      )}

      {p.bio && (
        <div className="field">
          <span className="label">{tx('About', '소개')}</span>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>{L(p.bio)}</p>
        </div>
      )}
      <div className="field">
        <span className="label">{tx('Speaks', '사용 언어')}</span>
        <div className="tags">{p.langs.map((l) => <span key={l} className="tag gray">{langLabel(l)}</span>)}</div>
      </div>
      {isMentor && (
        <div className="field">
          <span className="label">{tx('Can help with', '도와줄 수 있는 것')}</span>
          <div className="tags">{p.topics.map((t) => <span key={t} className="tag">{L(topic(t))}</span>)}</div>
        </div>
      )}
      {isMentee && (
        <div className="field">
          <span className="label">{tx('Needs help with', '필요한 도움')}</span>
          <div className="tags">{p.needs.map((t) => <span key={t} className="tag amber">{L(topic(t))}</span>)}</div>
        </div>
      )}
      <div className="field">
        <span className="label">{tx('Enjoys', '관심사')}</span>
        <div className="tags">{p.interests.map((i) => <span key={i} className={'tag ' + (shared.includes(i) ? 'green' : 'gray')}>{L(interest(i))}</span>)}</div>
      </div>

      {isMentor && (
        <div className="card" style={{ background: 'var(--amber-tint)', color: 'var(--amber-ink)', fontSize: 13, lineHeight: 1.45 }}>
          {tx('Mentors earn ', '멘토는 확인된 도움마다 ')}<b>+50 P</b>{tx(' for each confirmed help. Points can be used for campus rewards.', '를 받아요. 포인트는 교내 리워드로 쓸 수 있어요.')}
        </div>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
        {isMentee ? (
          <button className="btn amber" onClick={() => { offerHelp(p.id); go('chat', p.id) }}>{tx('Offer help · +50 P', '도와주기 · +50 P')}</button>
        ) : (
          <>
            <button className="btn line" style={{ flex: 1 }} onClick={hi}><Icon name="chat" size={20} /> {tx('Message', '메시지')}</button>
            {isMentor && <button className="btn" style={{ flex: 1 }} onClick={() => go('request')}>{tx('Ask for help', '도움 요청')}</button>}
          </>
        )}
      </div>
    </div>
  )
}
