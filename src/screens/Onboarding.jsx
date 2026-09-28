import { useState } from 'react'
import { useApp } from '../store.jsx'
import Icon, { Logo } from '../components/Icon.jsx'
import { Avatar, LangToggle, TopBar, UNIS, UniMark } from '../components/ui.jsx'
import { INTERESTS, LANGS, PEOPLE, TOPICS } from '../data/people.js'

// ---------- 1 · Welcome ----------
function Bubble({ side, who, children, dark }) {
  const me = side === 'right'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: me ? 'flex-end' : 'flex-start' }}>
      {!me && <Avatar person={who} size={36} showOnline={false} />}
      <div
        style={{
          maxWidth: 230, padding: '10px 14px', fontSize: 15, lineHeight: 1.4,
          borderRadius: me ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: me ? 'var(--primary)' : dark ? 'var(--night-2)' : '#fff',
          color: me || dark ? '#fff' : 'var(--ink)',
        }}
      >
        {children}
      </div>
      {me && <Avatar person={who} size={36} showOnline={false} />}
    </div>
  )
}

export function Welcome() {
  const { go, tx } = useApp()
  const mk = PEOPLE.mk
  const sm = { ...PEOPLE.sm, color: ['#FFE4DD', '#8A2C14'] }
  return (
    <div className="screen" style={{ padding: '20px 24px 28px', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo />
          <span className="display" style={{ fontSize: 22 }}>Eoullim</span>
          <span style={{ fontSize: 13, color: 'var(--night-muted)' }}>어울림</span>
        </div>
        <LangToggle dark />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '22px 0 6px' }}>
        <Bubble who={mk}>{tx('Welcome! Need any help on campus?', '환영해요! 캠퍼스에서 도움 필요해요?')}</Bubble>
        <Bubble side="right" who={sm}>{tx('Where do I apply for my alien registration card?', '외국인등록증은 어디서 신청해요?')}</Bubble>
        <Bubble who={mk} dark>{tx('I can go with you tomorrow. 같이 가요!', '내일 같이 가 줄게요. 같이 가요!')}</Bubble>
        <Bubble side="right" who={sm}>{tx('Thank you so much!', '정말 고마워요!')}</Bubble>
      </div>

      <h1 className="h1" style={{ fontSize: 32, marginTop: 18 }}>
        {tx('Meet your mentors and friends on your campus', '우리 캠퍼스의 멘토와 친구를 만나요')}
      </h1>
      <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.5, color: 'var(--night-text)' }}>
        {tx(
          'Log in with your university account. Mentors are Korean and international students from your own campus, ready to help.',
          '학교 계정으로 로그인하세요. 같은 캠퍼스의 한국인·외국인 학생 멘토가 도와줄 준비가 되어 있어요.',
        )}
      </p>

      <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn" onClick={() => go('uni')}>{tx('Get started', '시작하기')}</button>
        <button className="btn outline-light" onClick={() => go('login')}>{tx('I already have an account', '이미 계정이 있어요')}</button>
        <button
          onClick={() => go('about')}
          style={{ border: 0, background: 'transparent', color: 'var(--night-muted)', fontSize: 13, marginTop: 4, textDecoration: 'underline' }}
        >
          {tx('About this project · 2gether team', '프로젝트 소개 · 2gether 팀')}
        </button>
      </div>
    </div>
  )
}

// ---------- 2 · Choose university ----------
export function ChooseUni() {
  const { go, tx, state, setUni } = useApp()
  const [sel, setSel] = useState(state.uni)
  return (
    <div className="screen">
      <TopBar title="" />
      <h1 className="h1">{tx('Choose your university', '학교를 선택하세요')}</h1>
      <p className="sub">
        {tx(
          'Every university has its own private community and its own guide. You only see students from the one you pick.',
          '학교마다 따로 커뮤니티와 안내가 있어요. 고른 학교 학생들만 보여요.',
        )}
      </p>
      <div className="list">
        {Object.entries(UNIS).map(([k, u]) => (
          <button
            key={k}
            className="option-card"
            aria-pressed={sel === k}
            disabled={!u.live}
            onClick={() => setSel(k)}
            style={{ alignItems: 'center', opacity: u.live ? 1 : 0.55 }}
          >
            <UniMark uni={k} size={40} />
            <span className="col">
              <span className="name" style={{ fontSize: 15 }}>{u.name}</span>
              <span className="meta">{u.ko}</span>
            </span>
            {u.live ? (
              sel === k && <Icon name="check" style={{ color: 'var(--primary)' }} />
            ) : (
              <span className="tag gray">{tx('Coming soon', '준비 중')}</span>
            )}
          </button>
        ))}
      </div>
      <p className="small" style={{ textAlign: 'center' }}>{tx('Not listed? Your university can join Eoullim.', '우리 학교가 없나요? 학교 단위로 참여할 수 있어요.')}</p>
      <div style={{ marginTop: 'auto' }}>
        <button className="btn" onClick={() => { setUni(sel); go('login') }}>
          {tx('Continue with ', '') + UNIS[sel].short + tx('', '로 계속')}
        </button>
      </div>
    </div>
  )
}

// ---------- 3 · University login ----------
export function Login() {
  const { go, tx, state, updateMe } = useApp()
  const u = UNIS[state.uni]
  const [email, setEmail] = useState('')
  const ok = /^[^@\s]+$/.test(email) || email.endsWith('@' + u.domain) || email.endsWith('@g.' + u.domain)
  const next = () => {
    if (!state.me.name && email) updateMe({ name: email.split('@')[0] })
    go(state.onboarded ? 'home' : 'profile')
  }
  return (
    <div className="screen">
      <TopBar title="" />
      <div className="card row" style={{ background: 'var(--skku-tint)' }}>
        <UniMark uni={state.uni} size={40} />
        <span className="col">
          <span className="name" style={{ fontSize: 15 }}>{u.name}</span>
          <span className="meta">{u.ko}</span>
        </span>
        <button className="btn xs line" onClick={() => go('uni')}>{tx('Change', '변경')}</button>
      </div>
      <h1 className="h1">{tx('Log in with your university account', '학교 계정으로 로그인')}</h1>
      <p className="sub">
        {tx(
          "After login you enter your university's community, with its own students, chats and guide.",
          '로그인하면 우리 학교 학생·채팅·안내가 있는 학교 커뮤니티로 들어가요.',
        )}
      </p>
      <label className="field">
        <span className="label">{tx('University email', '학교 이메일')}</span>
        <input className="input" type="text" inputMode="email" autoComplete="off" placeholder={'yourname@' + u.domain} value={email} onChange={(e) => setEmail(e.target.value.trim())} />
      </label>
      <div className="card row" style={{ background: 'var(--amber-tint)', color: 'var(--amber-ink)', fontSize: 13, lineHeight: 1.45 }}>
        <Icon name="info" size={20} />
        <span>{tx('Demo: no real sign-in. We will send a code to your school email in the real service.', '데모: 실제 로그인은 하지 않아요. 실제 서비스에서는 학교 이메일로 인증 코드를 보내요.')}</span>
      </div>
      <button className="btn" disabled={!email || !ok} onClick={next}>{tx('Send verification code', '인증 코드 받기')}</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: 13 }}>
        <div className="divider" style={{ flex: 1 }} />{tx('or', '또는')}<div className="divider" style={{ flex: 1 }} />
      </div>
      <button className="btn line" onClick={next}>
        <Icon name="camera" size={20} /> {tx('Verify with your student ID card', '학생증으로 인증하기')}
      </button>
      <p className="small" style={{ display: 'flex', gap: 6, lineHeight: 1.5 }}>
        <Icon name="shield" size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        {tx(
          "Verified students only. Your data stays inside your university's community and is never shared with other universities.",
          '인증된 학생만 들어올 수 있어요. 내 정보는 우리 학교 커뮤니티 안에만 있고 다른 학교와 공유되지 않아요.',
        )}
      </p>
    </div>
  )
}

// ---------- 4 · Profile setup ----------
const COUNTRIES = ['China', 'Vietnam', 'Japan', 'Mongolia', 'Uzbekistan', 'USA', 'France', 'Germany', 'Spain', 'UK', 'Myanmar', 'Other']

export function ProfileSetup() {
  const { go, tx, state, updateMe } = useApp()
  const me = state.me
  const toggleLang = (id) => updateMe({ langs: me.langs.includes(id) ? me.langs.filter((l) => l !== id) : [...me.langs, id] })
  return (
    <div className="screen">
      <TopBar title="" right={<span className="small" style={{ fontWeight: 700 }}>1 / 2</span>} />
      <h1 className="h1">{tx('Set up your profile', '프로필 만들기')}</h1>

      <div className="row">
        <div className="avatar" style={{ width: 72, height: 72, background: 'var(--surface)', color: 'var(--muted)', border: '2px dashed var(--line-2)' }}>
          <Icon name="camera" size={26} />
        </div>
        <div className="col">
          <span className="name" style={{ fontSize: 15 }}>{tx('Add a real photo', '실제 사진 추가')}</span>
          <span className="meta">{tx('Mentors and mentees trust profiles with a clear face photo.', '얼굴이 잘 보이는 사진이 있으면 더 믿고 연락해요.')}</span>
        </div>
      </div>

      <label className="field">
        <span className="label">{tx('Name or nickname', '이름 또는 닉네임')}</span>
        <input className="input" value={me.name} onChange={(e) => updateMe({ name: e.target.value })} placeholder="Sofia" />
      </label>

      <div className="field">
        <span className="label">{tx('I want to join as', '가입 유형')}</span>
        {[
          { id: 'mentee', t: tx('Mentee', '멘티'), d: tx('Exchange or new international student who needs a hand.', '도움이 필요한 교환학생·신입 유학생') },
          { id: 'mentor', t: tx('Mentor', '멘토'), d: tx('Korean or international student who helps newcomers.', '새로 온 학생을 돕는 한국인·외국인 학생') },
        ].map((o) => (
          <button key={o.id} className="option-card" aria-pressed={me.role === o.id} onClick={() => updateMe({ role: o.id })}>
            <span className="col">
              <span className="name" style={{ fontSize: 15 }}>{o.t}</span>
              <span className="meta">{o.d}</span>
            </span>
            {me.role === o.id && <Icon name="check" style={{ color: 'var(--primary)' }} />}
          </button>
        ))}
      </div>

      <div className="field">
        <span className="label">{tx('Languages I speak', '사용 언어')}</span>
        <div className="chips">
          {LANGS.map((l) => (
            <button key={l.id} className="chip" aria-pressed={me.langs.includes(l.id)} onClick={() => toggleLang(l.id)}>{l.label}</button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="label">{tx('Home country', '출신 국가')}</span>
        <select className="select" value={me.country} onChange={(e) => updateMe({ country: e.target.value })}>
          <option value="">{tx('Select', '선택')}</option>
          {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>

      <button className="btn" style={{ marginTop: 6 }} disabled={!me.langs.length} onClick={() => go('interests')}>{tx('Next', '다음')}</button>
    </div>
  )
}

// ---------- 5 · Help topics + interests ----------
export function Interests() {
  const { go, tx, L, state, updateMe, finishOnboarding } = useApp()
  const me = state.me
  const mentor = me.role === 'mentor'
  const tog = (key, id) => updateMe({ [key]: me[key].includes(id) ? me[key].filter((x) => x !== id) : [...me[key], id] })
  return (
    <div className="screen">
      <TopBar title="" right={<span className="small" style={{ fontWeight: 700 }}>2 / 2</span>} />
      <h1 className="h1">{mentor ? tx('What can you help with?', '무엇을 도와줄 수 있나요?') : tx('What do you need help with?', '어떤 도움이 필요해요?')}</h1>
      <p className="sub">
        {tx(
          'Pick your topics. Mentees are matched with mentors who can help. Mentors see requests on these topics.',
          '주제를 고르세요. 멘티는 도와줄 수 있는 멘토와 연결되고, 멘토는 이 주제의 요청을 받아요.',
        )}
      </p>
      <div className="field">
        <span className="label">{tx('Help topics', '도움 주제')}</span>
        <div className="chips">
          {TOPICS.map((t) => (
            <button key={t.id} className="chip" aria-pressed={me.topics.includes(t.id)} onClick={() => tog('topics', t.id)}>{L(t)}</button>
          ))}
        </div>
      </div>
      <div className="field">
        <span className="label">{tx('Things I enjoy, to make friends', '친구 사귈 때 쓸 관심사')}</span>
        <div className="chips">
          {INTERESTS.map((t) => (
            <button key={t.id} className="chip" aria-pressed={me.interests.includes(t.id)} onClick={() => tog('interests', t.id)}>{L(t)}</button>
          ))}
        </div>
      </div>
      <div className="card" style={{ background: 'var(--amber-tint)', color: 'var(--amber-ink)', fontSize: 14 }}>
        {tx('Finish your profile to get a welcome bonus of ', '프로필을 완성하면 환영 보너스 ')}<b>+100 P</b>{tx('.', '를 받아요.')}
      </div>
      <button
        className="btn"
        disabled={!me.topics.length && !me.interests.length}
        onClick={() => { finishOnboarding(); go('home') }}
      >
        {tx('Finish and enter ', '완료하고 ') + state.uni + tx('', ' 입장')}
      </button>
    </div>
  )
}
