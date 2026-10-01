import { useState } from 'react'
import { Avatar, TopBar, flagOf, useGroupName } from '../components/ui.jsx'
import { useApp } from '../store.jsx'
import { APP_LANGS, AVATARS, COUNTRIES, SCHOOLS } from '../i18n.js'

// Start: school → language → country → we put you in a group (same country, 3–4 people + a Korean mentor).
export default function Setup() {
  const { tx, L, lang, setLang, profile, setProfile, call, go, me, data, showToast } = useApp()
  const gn = useGroupName()
  const [school, setSchool] = useState(profile?.school || 'skku')
  const [country, setCountry] = useState('')
  const [nick, setNick] = useState(profile?.nick || '')
  const [avatar, setAvatar] = useState(profile?.avatar || AVATARS[0])
  const [langTouched, setLangTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const inGroup = data?.myGroups?.find((g) => !g.mentoring)

  const save = () => setProfile({ color: 0, langs: [], interests: [], bio: '', ...profile, school, nick: nick.trim(), avatar })
  const pickCountry = (c) => {
    setCountry(c)
    if (!langTouched && COUNTRIES[c].lang && lang !== 'ko') setLang(COUNTRIES[c].lang)
  }
  const join = async () => {
    save()
    setBusy(true)
    try {
      const snap = nick.trim() ? { nick: nick.trim(), avatar, color: profile?.color ?? 0 } : null
      await call('joinGroup', { school, country, snap })
      showToast(tx('Welcome to your group! Say hi 👋', '그룹에 들어왔어요! 인사해 보세요 👋'))
      go('group')
    } catch {
      /* toast shown */
    }
    setBusy(false)
  }

  if (inGroup) {
    return (
      <div className="screen">
        <TopBar title={tx('My group', '내 그룹')} />
        <div className="card group-hero">
          <span style={{ fontSize: 36 }}>{flagOf(inGroup)}</span>
          <b className="h2">{gn(inGroup)}</b>
          <span className="small light">{tx('You already have a group.', '이미 그룹이 있어요.')}</span>
        </div>
        <button className="btn" onClick={() => go('group')}>{tx('Open group room', '그룹방 열기')}</button>
      </div>
    )
  }

  return (
    <div className="screen">
      <TopBar title={tx('Find my group', '내 그룹 찾기')} onBack={() => go('home')} />
      <div>
        <h1 className="h1">{tx('Your people in Korea', '한국에서 함께할 우리 조')}</h1>
        <p className="sub">{tx('3–4 students from your country + 1 Korean mentor. It stays with you all semester. Free.', '같은 나라 친구 3~4명 + 한국인 멘토 1명. 한 학기 내내 함께해요. 무료예요.')}</p>
      </div>

      <div className="field">
        <span className="label">1. {tx('University', '학교')}</span>
        <div className="chips">
          {Object.entries(SCHOOLS).map(([id, n]) => (
            <button key={id} className="chip" aria-pressed={school === id} onClick={() => setSchool(id)}>{L(n)}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="label">2. {tx('Where are you from?', '어느 나라에서 왔어요?')}</span>
        <div className="country-grid">
          {Object.entries(COUNTRIES).filter(([id]) => id !== 'kr').map(([id, c]) => (
            <button key={id} className="option-card" aria-pressed={country === id} onClick={() => pickCountry(id)}>
              <span style={{ fontSize: 22 }}>{c.flag}</span>
              <b>{L(c)}</b>
            </button>
          ))}
        </div>
        <p className="small">🔒 {tx('Used only to make your group. It is never shown on your posts.', '그룹을 만드는 데만 써요. 내 글에는 보이지 않아요.')}</p>
      </div>

      <label className="field">
        <span className="label">3. {tx('App language', '앱 언어')}</span>
        <select className="select" value={lang} onChange={(e) => { setLang(e.target.value); setLangTouched(true) }}>
          {APP_LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
        <span className="small">🌐 {tx('Posts and group chat are translated into this language automatically.', '게시판과 그룹 채팅이 이 언어로 자동 번역돼요.')}</span>
      </label>

      <div className="field">
        <span className="label">4. {tx('Nickname for your group (optional)', '그룹에서 쓸 닉네임 (선택)')}</span>
        <div className="row" style={{ gap: 10 }}>
          <Avatar snap={{ avatar, color: profile?.color ?? 0 }} size={48} />
          <input className="input" value={nick} maxLength={20} onChange={(e) => setNick(e.target.value)} placeholder={tx('Not your real name', '실명 말고 별명으로')} />
        </div>
        <div className="emoji-grid">
          {AVATARS.map((a) => (
            <button key={a} aria-pressed={avatar === a} onClick={() => setAvatar(a)} aria-label={a}>{a}</button>
          ))}
        </div>
      </div>

      {me?.admin ? (
        <p className="note card">🇰🇷 {tx('You are a Korean mentor. Take a group on the mentor page.', '한국인 멘토예요. 멘토 화면에서 그룹을 맡아 주세요.')}</p>
      ) : (
        <button className="btn" disabled={busy || !country} onClick={join}>
          {busy ? tx('Finding your group…', '그룹 찾는 중…') : country ? tx(`Meet my ${COUNTRIES[country].en} group`, `${COUNTRIES[country].ko} 조 만나기`) : tx('Pick your country', '나라를 골라 주세요')}
        </button>
      )}
      <button className="btn line sm" onClick={() => { save(); go('home') }}>{tx('Later', '나중에 할게요')}</button>
    </div>
  )
}
