import Icon, { Logo } from '../components/Icon.jsx'
import { Avatar, Coin, KindTag, LangToggle, LevelTag, Loading, Section, TabBar, ExampleTag, ago, won } from '../components/ui.jsx'
import { useApp } from '../store.jsx'
import { INTERESTS, LANGS } from '../i18n.js'

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
        <p className="eyebrow">{tx('For international students without a buddy', '버디가 없는 외국인 유학생을 위해')}</p>
        <h1 className="h1" style={{ fontSize: 34 }}>
          {tx('Ask anything.', '무엇이든 물어보세요.')}
          <br />
          {tx('Someone on campus will answer.', '캠퍼스 누군가가 답해요.')}
        </h1>
        <ul className="welcome-list">
          <li><span>🪙</span>{tx('Put points on a question — the best answer gets them', '질문에 포인트를 걸면, 채택된 답변이 가져가요')}</li>
          <li><span>🇰🇷</span>{tx('Korean managers answer Korea-style questions', '한국식 질문은 한국인 관리자가 답해요')}</li>
          <li><span>🙌</span>{tx('Find people to eat, study and travel with', '밥·스터디·여행 같이 할 사람 찾기')}</li>
          <li><span>🔒</span>{tx('No sign-up. No name, no email, no phone number', '가입 없음. 이름·이메일·전화번호를 받지 않아요')}</li>
        </ul>
      </div>
      <button className="btn white" onClick={() => start().then(() => go('home')).catch(() => {})}>
        {tx('Start — 30 points free', '시작하기 — 30포인트 무료')}
      </button>
      <button className="btn outline-light sm" onClick={() => go('settings')}>
        {tx('I have a recovery code', '복구 코드가 있어요')}
      </button>
      <button className="linkish light" onClick={() => go('about')}>{tx('About this project', '프로젝트 소개')}</button>
    </div>
  )
}

function ProfileCard() {
  const { profile, snap, me, tx, L, go } = useApp()
  if (!snap) {
    return (
      <button className="card profile-card empty-profile" onClick={() => go('profile')}>
        <Avatar snap={null} size={48} />
        <span className="col">
          <b>{tx('Make your profile', '프로필 만들기')} <span className="small">({tx('optional', '선택')})</span></b>
          <span className="small">{tx('Nickname, languages, interests. Saved only on this phone.', '닉네임·언어·관심사. 이 기기에만 저장돼요.')}</span>
        </span>
        <Icon name="chevron" size={18} />
      </button>
    )
  }
  const langs = (profile.langs || []).map((id) => LANGS.find((l) => l[0] === id)?.[1]).filter(Boolean)
  const ints = (profile.interests || []).map((id) => INTERESTS.find((i) => i[0] === id)).filter(Boolean)
  return (
    <button className="card profile-card" onClick={() => go('profile')}>
      <Avatar snap={snap} size={52} />
      <span className="col">
        <span className="row" style={{ gap: 6 }}>
          <b style={{ fontSize: 17 }}>{snap.nick}</b>
          {me && <LevelTag level={me.level} />}
        </span>
        {profile.bio && <span className="small truncate">{profile.bio}</span>}
        <span className="tags" style={{ marginTop: 4 }}>
          {langs.slice(0, 3).map((l) => <span key={l} className="tag gray">{l}</span>)}
          {ints.slice(0, 2).map((i) => <span key={i[0]} className="tag">{L([i[1], i[2]])}</span>)}
        </span>
      </span>
      <Icon name="chevron" size={18} />
    </button>
  )
}

export default function Home() {
  const { data, me, tx, go, L } = useApp()
  if (!data) return <div className="screen"><Loading /><TabBar current="home" /></div>

  const waiting = data.questions
    .filter((q) => q.status === 'open' && !q.mine && !q.hidden)
    .sort((a, b) => b.bounty - a.bounty)
    .slice(0, 3)
  const today = new Date(data.now + 9 * 3600e3).toISOString().slice(0, 10)
  const meetups = data.posts
    .filter((p) => p.meetup && p.meetup.date >= today && p.meetup.joined < p.meetup.cap && !p.hidden)
    .sort((a, b) => a.meetup.date.localeCompare(b.meetup.date))
    .slice(0, 2)
  const adminTodo = me?.admin
    ? data.questions.filter((q) => q.status === 'review' || q.hidden || q.reports > 0 || (q.tag === 'kstyle' && q.status === 'open' && !q.answers.some((a) => a.admin))).length +
      data.posts.filter((p) => p.hidden || p.reports > 0).length
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
            <button className="icon-btn" aria-label={tx('Settings', '설정')} onClick={() => go('settings')}>
              <Icon name="settings" />
            </button>
          </span>
        </div>

        <ProfileCard />

        <button className="hero-card points-hero" onClick={() => go('points')}>
          <span className="col">
            <span className="small light">{tx('My points', '내 포인트')}</span>
            <span className="display" style={{ fontSize: 30 }}>{(me?.points ?? 0).toLocaleString()} P</span>
            <span className="small light">≈ {won(me?.points ?? 0)}</span>
          </span>
          <span className="btn white xs">{tx('Charge', '충전')}</span>
        </button>

        {me?.admin && (
          <button className="card admin-banner" onClick={() => go('admin')}>
            <span style={{ fontSize: 22 }}>🇰🇷</span>
            <span className="col">
              <b>{tx('Manager mode', '관리자 모드')}</b>
              <span className="small">{adminTodo ? tx(`${adminTodo} things need you`, `처리할 일 ${adminTodo}건`) : tx('All clear', '처리할 일 없음')}</span>
            </span>
            <Icon name="chevron" size={18} />
          </button>
        )}

        <div className="shortcuts">
          <button onClick={() => go('ask')}><span>🙋</span>{tx('Ask', '물어보기')}</button>
          <button onClick={() => go('write', 'together')}><span>🙌</span>{tx('Find people', '같이 할 사람')}</button>
          <button onClick={() => go('guide')}><span>📘</span>{tx('Official guide', '공식 안내')}</button>
        </div>

        <Section title={tx('Waiting for an answer', '답을 기다리는 질문')} action={<button className="linkish" onClick={() => go('solve')}>{tx('All', '전체')}</button>}>
          {waiting.length === 0 && <p className="empty">{tx('No open questions right now.', '지금 열린 질문이 없어요.')}</p>}
          <div className="list">
            {waiting.map((q) => (
              <button key={q.id} className="card q-mini" onClick={() => go('q', q.id)}>
                <span className="col">
                  <span className="tags"><KindTag kind={q.kind} />{q.seed && <ExampleTag />}</span>
                  <b className="q-title">{q.title}</b>
                  <span className="small">{q.answers.length ? tx(`${q.answers.length} answers`, `답변 ${q.answers.length}`) : tx('No answers yet', '아직 답변 없음')} · {ago(q.created, data.now, tx)}</span>
                </span>
                <Coin n={q.bounty} />
              </button>
            ))}
          </div>
        </Section>

        <Section title={tx('Join a meetup', '모집 중')} action={<button className="linkish" onClick={() => go('community')}>{tx('All', '전체')}</button>}>
          {meetups.length === 0 && <p className="empty">{tx('No meetups yet — start one!', '아직 모집글이 없어요. 먼저 올려 보세요!')}</p>}
          <div className="list">
            {meetups.map((p) => (
              <button key={p.id} className="card q-mini" onClick={() => go('post', p.id)}>
                <span className="col">
                  <b className="q-title">{p.title}</b>
                  <span className="small">📅 {p.meetup.date} · 📍 {p.meetup.place}</span>
                </span>
                <span className="tag green">👥 {p.meetup.joined}/{p.meetup.cap}</span>
              </button>
            ))}
          </div>
        </Section>

        <button className="linkish muted" style={{ alignSelf: 'center' }} onClick={() => go('about')}>
          {tx('About Eoullim', '어울림 소개')} · {L(['Team 2gether', '2gether 팀'])}
        </button>
      </div>
      <TabBar current="home" />
    </>
  )
}
