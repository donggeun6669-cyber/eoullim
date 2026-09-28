import { useState } from 'react'
import { useApp } from '../store.jsx'
import Icon from '../components/Icon.jsx'
import { Avatar, Section, TabBar, UNIS, UniMark } from '../components/ui.jsx'
import { FRIENDS, MENTEES, MENTORS, ONLINE, PEOPLE, friendMatch, interest, langLabel, topic } from '../data/people.js'

export function MentorRow({ id }) {
  const { go, L, tx } = useApp()
  const p = PEOPLE[id]
  return (
    <button className="person-row" onClick={() => go('person', id)}>
      <Avatar id={id} />
      <span className="col">
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="name">{p.name}</span>
          <span className="meta">{p.ko}</span>
        </span>
        <span className="meta truncate">
          {p.kind === 'korean' ? tx('Korean', '한국 학생') : tx('International', '외국인 학생')} · {L(p.major)} · {p.langs.map((l) => l.toUpperCase()).join('·')}
        </span>
        <span className="tags" style={{ flexWrap: 'nowrap', overflow: 'hidden' }}>
          {p.topics.slice(0, 2).map((t) => <span key={t} className="tag">{L(topic(t))}</span>)}
        </span>
      </span>
      <Icon name="chevron" size={20} style={{ color: 'var(--muted)', flexShrink: 0 }} />
    </button>
  )
}

export function MenteeRow({ id }) {
  const { go, L, offerHelp, tx } = useApp()
  const p = PEOPLE[id]
  return (
    <div className="person-row">
      <Avatar id={id} />
      <span className="col">
        <span className="name">{p.name}</span>
        <span className="meta">{L(p.status)}</span>
        <span className="tags">{p.needs.map((t) => <span key={t} className="tag amber">{L(topic(t))}</span>)}</span>
      </span>
      <button
        className="btn amber"
        style={{ width: 76, height: 56, flexDirection: 'column', gap: 0, fontSize: 13, lineHeight: 1.25, padding: 0, flexShrink: 0 }}
        onClick={() => { offerHelp(id); go('chat', id) }}
      >
        <span>{tx('Offer help', '도와주기')}</span>
        <span style={{ fontSize: 12 }}>+50 P</span>
      </button>
    </div>
  )
}

export default function Home() {
  const { go, tx, L, state, setLang } = useApp()
  const [tab, setTab] = useState(state.me.role === 'mentor' ? 'mentee' : 'mentor')
  const u = UNIS[state.uni]
  const openReq = state.requests.filter((r) => r.status !== 'done').length
  const me = state.me.interests.length ? state.me : { ...state.me, interests: ['cafe', 'language', 'food'] }
  const friends = FRIENDS.map((id) => ({ p: PEOPLE[id], ...friendMatch(PEOPLE[id], me) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <>
      <div className="screen with-tabs">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UniMark uni={state.uni} />
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{u.short}</span>
              <span className="small" style={{ whiteSpace: 'nowrap' }}>{tx('Campus community', '캠퍼스 커뮤니티')}</span>
            </span>
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="icon-btn" aria-label={tx('한국어로 보기', 'Switch to English')} onClick={() => setLang(state.lang === 'en' ? 'ko' : 'en')}>
              <Icon name="globe" />
            </button>
            <button className="icon-btn" aria-label={tx('Notifications', '알림')} onClick={() => go('requests')}>
              <Icon name="bell" />
              {openReq > 0 && <span className="dot-badge" />}
            </button>
            <button
              onClick={() => go('points')}
              aria-label={tx('My points', '내 포인트')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, height: 44, padding: '0 12px', whiteSpace: 'nowrap', borderRadius: 22, border: 0, background: 'var(--amber-tint)', color: 'var(--amber-ink)', fontSize: 14, fontWeight: 700 }}
            >
              <Icon name="points" size={20} />
              {state.points.toLocaleString()} P
            </button>
          </div>
        </div>

        <div className="seg">
          <button aria-pressed={tab === 'mentor'} onClick={() => setTab('mentor')}>{tx('Find a mentor', '멘토 찾기')}</button>
          <button aria-pressed={tab === 'mentee'} onClick={() => setTab('mentee')}>{tx('Find a mentee', '멘티 찾기')}</button>
        </div>

        <Section title={tx('Online now', '지금 접속 중')}>
          <div className="chips scroll" style={{ gap: 14 }}>
            {ONLINE.map((id) => (
              <button key={id} onClick={() => go('person', id)} style={{ width: 56, border: 0, background: 'transparent', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <Avatar id={id} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>{PEOPLE[id].name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </Section>

        <div className="hero-card">
          <div>
            <div className="display" style={{ fontSize: 18 }}>{tx('Need help?', '도움이 필요해요?')}</div>
            <div style={{ fontSize: 13, lineHeight: 1.4 }}>{tx('Mentors from your university will reply.', '우리 학교 멘토가 답해 줘요.')}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm white" onClick={() => go('request')}>{tx('Ask for help', '도움 요청')}</button>
            <button className="btn sm outline-light" onClick={() => go('requests')}>{tx('My requests', '내 요청')}</button>
          </div>
        </div>

        {tab === 'mentor' ? (
          <div className="list">{MENTORS.slice(0, 3).map((id) => <MentorRow key={id} id={id} />)}</div>
        ) : (
          <div className="list">{MENTEES.map((id) => <MenteeRow key={id} id={id} />)}</div>
        )}

        <button className="card row" style={{ border: 0, textAlign: 'left', background: 'var(--skku-tint)' }} onClick={() => go('guide')}>
          <span className="avatar" style={{ width: 44, height: 44, background: 'var(--skku)', color: '#fff' }}><Icon name="book" /></span>
          <span className="col">
            <span className="name" style={{ fontSize: 15, color: 'var(--skku)' }}>{tx('Official guide & programs', '공식 안내 · 지원 프로그램')}</span>
            <span className="meta">{tx('Ask the Help Bot or find SKKU support programs', '헬프봇에게 묻거나 학교 지원 프로그램 찾기')}</span>
          </span>
          <Icon name="chevron" size={20} style={{ color: 'var(--skku)' }} />
        </button>

        <Section
          title={tx('Korean friends for you', '추천 한국 친구')}
          action={<button className="link-out" style={{ border: 0, background: 'none' }} onClick={() => go('find', 'friends')}>{tx('See all', '전체 보기')}</button>}
        >
          <div className="chips scroll" style={{ gap: 10 }}>
            {friends.map(({ p, shared, langs }) => (
              <button key={p.id} className="card white" onClick={() => go('person', p.id)} style={{ width: 168, flexShrink: 0, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Avatar id={p.id} size={44} />
                <span>
                  <span className="name" style={{ fontSize: 15 }}>{p.name}</span>
                  <span className="meta" style={{ display: 'block' }}>{L(p.major)}</span>
                </span>
                <span className="tags">
                  {shared.slice(0, 2).map((i) => <span key={i} className="tag green">{L(interest(i))}</span>)}
                  {!shared.length && langs[0] && <span className="tag gray">{langLabel(langs[0])}</span>}
                </span>
              </button>
            ))}
          </div>
        </Section>
      </div>
      <TabBar current="home" />
    </>
  )
}
