import Icon, { Logo } from '../components/Icon.jsx'
import { Avatar, Coin, ExampleTag, KindTag, LangToggle, Loading, Section, TabBar, Tr, ago, flagOf, useGroupName } from '../components/ui.jsx'
import { EventCard } from './Events.jsx'
import { useApp } from '../store.jsx'
import { COUNTRIES, MISSIONS, OFFERS } from '../i18n.js'

export function Welcome() {
  const { start, tx, go } = useApp()
  return (
    <div className="screen dark-screen">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="row" style={{ gap: 8 }}>
          <Logo />
          <span className="display" style={{ fontSize: 20 }}>Eoullim</span>
        </span>
        <LangToggle dark />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
        <p className="eyebrow">{tx('For international students in Korea', '한국에 온 외국인 유학생을 위해')}</p>
        <h1 className="h1" style={{ fontSize: 32 }}>
          {tx('Find your people', '한국에서 함께할')}
          <br />
          {tx('in Korea.', '우리 조를 만나요.')}
        </h1>
        <ul className="welcome-list">
          <li><span>👥</span>{tx('3–4 friends from your country + 1 Korean mentor = your group. Free, all semester.', '같은 나라 친구 3~4명 + 한국인 멘토 1명 = 우리 조. 한 학기 내내, 무료.')}</li>
          <li><span>🇰🇷</span>{tx('Korean students who love your country join as Korean friends', '내 나라에 관심 있는 한국 학생이 「한국 친구」로 함께해요')}</li>
          <li><span>🎉</span>{tx('Events: saju, a ghost-story night walk, holidays from every country', '이벤트: 사주, 신당동 귀신 투어, 나라별 명절')}</li>
          <li><span>💬</span>{tx('Community: quick help and meetups — points optional', '커뮤니티: 가벼운 도움과 모임 — 포인트는 선택')}</li>
          <li><span>🌐</span>{tx('Write in any language. Everyone reads it in theirs.', '어떤 언어로 써도 각자 자기 언어로 읽어요.')}</li>
          <li><span>🔒</span>{tx('No sign-up. No name, email or phone number.', '가입 없음. 이름·이메일·전화번호를 받지 않아요.')}</li>
        </ul>
      </div>
      <button className="btn accent" onClick={() => start().then(() => go('setup')).catch(() => {})}>
        {tx('Start — it’s free', '시작하기 — 무료')}
      </button>
      <button className="btn outline-light sm" onClick={() => go('settings')}>
        {tx('I have a recovery code', '복구 코드가 있어요')}
      </button>
      <button className="linkish light" onClick={() => go('about')}>{tx('About this project', '프로젝트 소개')}</button>
    </div>
  )
}

function GroupCard() {
  const { data, me, tx, L, go } = useApp()
  const gn = useGroupName()
  const g = data.myGroups.find((x) => !x.mentoring) || data.myGroups[0]
  if (!g) {
    return (
      <button className="hero-card group-cta" onClick={() => go(me?.admin ? 'admin' : 'setup')}>
        <span className="light-text">{tx('Your group · free', '우리 조 · 무료')}</span>
        <b className="h2">{me?.admin ? tx('Take a group as a Korean mentor', '한국인 멘토로 그룹 맡기') : tx('Meet your group', '내 그룹 만나기')}</b>
        <span className="light-text">{tx('3–4 students from the same country + 1 Korean mentor, all semester.', '같은 나라 3~4명 + 한국인 멘토 1명, 한 학기 내내.')}</span>
        <span className="btn accent xs" style={{ alignSelf: 'flex-start' }}>{me?.admin ? tx('Mentor page', '멘토 화면') : tx('Find my group', '내 그룹 찾기')} →</span>
      </button>
    )
  }
  const lastMsg = [...g.messages].reverse().find((m) => !m.system)
  const mission = MISSIONS[((data.week % MISSIONS.length) + MISSIONS.length) % MISSIONS.length]
  return (
    <button className="hero-card group-home" onClick={() => go('group')}>
      <span className="row" style={{ justifyContent: 'space-between' }}>
        <span className="row" style={{ gap: 10 }}>
          <span style={{ fontSize: 30 }}>{flagOf(g)}</span>
          <span className="col">
            <span className="light-text">{g.mentoring ? tx('I mentor', '내가 멘토') : g.friend ? tx('I’m a Korean friend', '한국 친구로 함께하는 그룹') : tx('My group', '내 그룹')}</span>
            <b className="h2">{gn(g)}</b>
          </span>
        </span>
        <span className="avatar-stack">
          {g.members.slice(0, 4).map((m, i) => <Avatar key={i} snap={m.snap} size={28} />)}
          {g.friends.map((f, i) => <Avatar key={'f' + i} snap={f.snap} size={28} />)}
          {g.hasMentor && <Avatar snap={g.mentor} size={28} />}
        </span>
      </span>
      {lastMsg && (
        <span className="last-msg">
          <b>{lastMsg.mine ? tx('Me', '나') : lastMsg.snap?.nick || tx('Member', '멤버')}{lastMsg.mentor ? ' 🇰🇷' : ''}</b> <Tr text={lastMsg.body} />
        </span>
      )}
      <span className="mission-line">{g.missionDone ? '✅' : '🎯'} {L(mission)}</span>
    </button>
  )
}

// What a Korean student sees: the countries they follow, how many others follow them, and where they can help.
function KoreanCard() {
  const { data, me, tx, L, go } = useApp()
  const kr = me?.kr
  if (!kr) return null
  const kstyle = data.questions.filter((q) => q.tag === 'kstyle' && q.status === 'open' && !q.mine).length
  return (
    <div className="card kr-card">
      <span className="row" style={{ justifyContent: 'space-between' }}>
        <b>🇰🇷 {tx('Korean student · countries I follow', '한국 학생 · 내가 관심 있는 나라')}</b>
        <button className="linkish" onClick={() => go('setup', 'kr')}>{tx('Change', '바꾸기')}</button>
      </span>
      <div className="tags">
        {kr.countries.map((c) => (
          <span key={c} className="tag gray">{COUNTRIES[c].flag} {L(COUNTRIES[c])} · {tx(`${data.krFans?.[c] || 0} Koreans`, `한국인 ${data.krFans?.[c] || 0}명`)}</span>
        ))}
      </div>
      {kr.offer?.length > 0 && <span className="small">{tx('I can', '함께할 수 있는 것')}: {kr.offer.map((o) => L(OFFERS[o])).join(' · ')}</span>}
      <div className="row" style={{ gap: 8 }}>
        <button className="btn soft xs" onClick={() => go('events')}>🎉 {tx('Their holidays & events', '그 나라 명절·이벤트')}</button>
        <button className="btn line xs" onClick={() => go('community')}>🙋 {tx(`Korea-style questions ${kstyle}`, `한국식 질문 ${kstyle}개`)}</button>
      </div>
    </div>
  )
}

export default function Home() {
  const { data, me, tx, go, snap, L } = useApp()
  if (!data) return <div className="screen"><Loading /><TabBar current="home" /></div>

  const myG = data.myGroups.find((g) => !g.mentoring)
  const likes = me?.kr?.countries || (myG ? [myG.country] : [])
  const events = data.events
    .filter((e) => e.status === 'open' && e.joined < e.cap)
    .sort((a, b) => likes.includes(b.country) - likes.includes(a.country) || a.start - b.start)
    .slice(0, 2)
  const waiting = data.questions
    .filter((q) => q.status === 'open' && !q.mine && !q.hidden)
    .sort((a, b) => b.created - a.created)
    .slice(0, 3)
  const adminTodo = me?.admin
    ? data.questions.filter((q) => q.status === 'review' || q.hidden || q.reports > 0 || (q.tag === 'kstyle' && q.status === 'open' && !q.answers.some((a) => a.admin))).length +
      data.posts.filter((p) => p.hidden || p.reports > 0).length +
      data.groups.filter((g) => !g.hasMentor && g.members > 0).length
    : 0

  return (
    <>
      <div className="screen with-tabs">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="row" style={{ gap: 8 }}>
            <Logo />
            <span className="display" style={{ fontSize: 20 }}>Eoullim</span>
          </span>
          <span className="row" style={{ gap: 6 }}>
            <LangToggle />
            <button className="icon-btn" aria-label={tx('My profile', '내 프로필')} onClick={() => go('profile')}>
              {snap ? <Avatar snap={snap} size={30} /> : <Icon name="users" />}
            </button>
            <button className="icon-btn" aria-label={tx('Settings', '설정')} onClick={() => go('settings')}>
              <Icon name="settings" />
            </button>
          </span>
        </div>

        <GroupCard />
        <KoreanCard />

        {me?.admin && (
          <button className="card admin-banner" onClick={() => go('admin')}>
            <span style={{ fontSize: 22 }}>🇰🇷</span>
            <span className="col">
              <b>{tx('Mentor page', '멘토 화면')}</b>
              <span className="small">{adminTodo ? tx(`${adminTodo} things need you`, `처리할 일 ${adminTodo}건`) : tx('All clear', '처리할 일 없음')}</span>
            </span>
            <Icon name="chevron" size={18} />
          </button>
        )}

        <Section title={tx('Coming up', '다가오는 이벤트')} action={<button className="linkish" onClick={() => go('events')}>{tx('All', '전체')}</button>}>
          <div className="list">
            {events.map((e) => <EventCard key={e.id} e={e} />)}
          </div>
        </Section>

        <Section title={tx('Someone needs help', '도움을 기다려요')} action={<button className="linkish" onClick={() => go('community')}>{tx('Community', '커뮤니티')}</button>}>
          {waiting.length === 0 && <p className="empty">{tx('No open questions right now.', '지금 열린 질문이 없어요.')}</p>}
          <div className="list">
            {waiting.map((q) => (
              <button key={q.id} className="card q-mini" onClick={() => go('q', q.id)}>
                <span className="col">
                  <span className="tags"><KindTag kind={q.kind} />{q.seed && <ExampleTag />}</span>
                  <Tr text={q.title} as="b" className="q-title" />
                  <span className="small">{q.answers.length ? tx(`${q.answers.length} answers`, `답변 ${q.answers.length}`) : tx('No answers yet', '아직 답변 없음')} · {ago(q.created, data.now, tx)}</span>
                </span>
                {q.bounty > 0 && <Coin n={q.bounty} />}
              </button>
            ))}
          </div>
        </Section>

        <div className="shortcuts">
          <button onClick={() => go('ask')}><span>🙋</span>{tx('Ask', '물어보기')}</button>
          <button onClick={() => go('write', 'together')}><span>🙌</span>{tx('Meet up', '같이 할 사람')}</button>
          <button onClick={() => go('guide')}><span>📘</span>{tx('Official guide', '공식 안내')}</button>
        </div>

        <button className="card row-link" onClick={() => go('points')}>
          <span className="coin-dot big">P</span>
          <span className="col">
            <b>{tx(`My points · ${(me?.points ?? 0).toLocaleString()} P`, `내 포인트 · ${(me?.points ?? 0).toLocaleString()} P`)}</b>
            <span className="small">{tx('Optional — put them on a community question for faster answers', '선택 — 커뮤니티 질문에 걸면 답이 더 빨리 와요')}</span>
          </span>
          <Icon name="chevron" size={18} />
        </button>

        <button className="linkish muted" style={{ alignSelf: 'center' }} onClick={() => go('about')}>
          {tx('About Eoullim', '어울림 소개')} · {L(['Team 2gether', '2gether 팀'])}
        </button>
      </div>
      <TabBar current="home" />
    </>
  )
}
