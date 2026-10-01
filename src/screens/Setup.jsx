import { useState } from 'react'
import { Avatar, TopBar, flagOf, useGroupName } from '../components/ui.jsx'
import { ApiError } from '../lib/api.js'
import { useApp } from '../store.jsx'
import { APP_LANGS, AVATARS, COUNTRIES, OFFERS, SCHOOLS } from '../i18n.js'

// Start. International student: school → country → group (same country, 3–4 people + a Korean mentor).
// Korean student: school → countries I'm interested in → I join one of those groups as a "Korean friend".
export default function Setup({ id }) {
  const { tx, L, lang, setLang, profile, setProfile, call, go, me, data, showToast, errorText } = useApp()
  const gn = useGroupName()
  const [who, setWho] = useState(id === 'kr' || me?.kr ? 'kr' : id === 'intl' ? 'intl' : profile?.who || '')
  const [school, setSchool] = useState(profile?.school || 'skku')
  const [country, setCountry] = useState('')
  const [likes, setLikes] = useState(me?.kr?.countries || [])
  const [offer, setOffer] = useState(me?.kr?.offer || ['language'])
  const [nick, setNick] = useState(profile?.nick || '')
  const [avatar, setAvatar] = useState(profile?.avatar || AVATARS[0])
  const [langTouched, setLangTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const inGroup = data?.myGroups?.find((g) => !g.mentoring)
  const max = data?.rules?.KR_INTERESTS || 3
  const fans = data?.krFans || {}

  const save = () => setProfile({ color: 0, langs: [], interests: [], bio: '', ...profile, who, school, nick: nick.trim(), avatar })
  const snap = () => (nick.trim() ? { nick: nick.trim(), avatar, color: profile?.color ?? 0 } : null)
  const pickCountry = (c) => {
    setCountry(c)
    if (!langTouched && COUNTRIES[c].lang && lang !== 'ko') setLang(COUNTRIES[c].lang)
  }
  const toggleLike = (c) => setLikes(likes.includes(c) ? likes.filter((x) => x !== c) : likes.length < max ? [...likes, c] : likes)
  const toggleOffer = (o) => setOffer(offer.includes(o) ? offer.filter((x) => x !== o) : [...offer, o])
  const chooseWho = (w) => {
    setWho(w)
    if (w === 'kr' && !langTouched) setLang('ko')
  }

  const join = async () => {
    save()
    setBusy(true)
    try {
      await call('joinGroup', { school, country, snap: snap() })
      showToast(tx('Welcome to your group! Say hi 👋', '그룹에 들어왔어요! 인사해 보세요 👋'))
      go('group')
    } catch {
      /* toast shown */
    }
    setBusy(false)
  }
  const joinKr = async () => {
    save()
    setBusy(true)
    try {
      await call('krSet', { countries: likes, offer, school })
      await call('krJoin', { snap: snap() }, { quiet: true })
      showToast(tx('You joined as a Korean friend! Say hi 👋', '한국 친구로 그룹에 들어왔어요! 인사해 보세요 👋'))
      go('group')
    } catch (e) {
      if (e instanceof ApiError && e.code === 'no_seat') {
        showToast(errorText('no_seat'))
        go('home')
      } else if (e instanceof ApiError) showToast(errorText(e.code), 'error')
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
          <span className="light-text">{inGroup.friend ? tx('You are a Korean friend in this group.', '이 그룹의 한국 친구예요.') : tx('You already have a group.', '이미 그룹이 있어요.')}</span>
        </div>
        <button className="btn" onClick={() => go('group')}>{tx('Open group room', '그룹방 열기')}</button>
      </div>
    )
  }

  // Render helpers (plain functions, not components, so the inputs keep focus while typing).
  const nickField = (n) => (
    <div className="field">
      <span className="label">{n}. {tx('Nickname for your group (optional)', '그룹에서 쓸 닉네임 (선택)')}</span>
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
  )
  const schoolField = () => (
    <div className="field">
      <span className="label">1. {tx('University', '학교')}</span>
      <div className="chips">
        {Object.entries(SCHOOLS).map(([sid, n]) => (
          <button key={sid} className="chip" aria-pressed={school === sid} onClick={() => setSchool(sid)}>{L(n)}</button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="screen">
      <TopBar title={tx('Get started', '시작하기')} onBack={() => go('home')} />
      <div>
        <h1 className="h1">{tx('Who are you?', '어떤 학생이에요?')}</h1>
        <p className="sub">{tx('Eoullim connects international students and Korean students — in groups, not 1:1.', '어울림은 외국인 학생과 한국 학생을 1:1이 아니라 그룹으로 이어요.')}</p>
      </div>
      <div className="kind-grid">
        <button className="option-card" aria-pressed={who === 'intl'} onClick={() => chooseWho('intl')}>
          <span style={{ fontSize: 24 }}>🌏</span>
          <span className="col">
            <b>{tx('International student', '외국인 유학생')}</b>
            <span className="small">{tx('Join a group: 3–4 from your country + a Korean mentor', '같은 나라 3~4명 + 한국인 멘토 그룹에 들어가요')}</span>
          </span>
        </button>
        <button className="option-card" aria-pressed={who === 'kr'} onClick={() => chooseWho('kr')}>
          <span style={{ fontSize: 24 }}>🇰🇷</span>
          <span className="col">
            <b>{tx('Korean student', '한국 학생')}</b>
            <span className="small">{tx('Interested in a country? Join its group as a Korean friend', '관심 있는 나라가 있나요? 그 나라 그룹의 한국 친구가 돼요')}</span>
          </span>
        </button>
      </div>

      {who === 'intl' && (
        <>
          {schoolField()}
          <div className="field">
            <span className="label">2. {tx('Where are you from?', '어느 나라에서 왔어요?')}</span>
            <div className="country-grid">
              {Object.entries(COUNTRIES).filter(([cid]) => cid !== 'kr').map(([cid, c]) => (
                <button key={cid} className="option-card" aria-pressed={country === cid} onClick={() => pickCountry(cid)}>
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
          {nickField(4)}
          {me?.admin ? (
            <p className="note card">🇰🇷 {tx('You are a Korean mentor. Take a group on the mentor page.', '한국인 멘토예요. 멘토 화면에서 그룹을 맡아 주세요.')}</p>
          ) : (
            <button className="btn" disabled={busy || !country} onClick={join}>
              {busy ? tx('Finding your group…', '그룹 찾는 중…') : country ? tx(`Meet my ${COUNTRIES[country].en} group`, `${COUNTRIES[country].ko} 조 만나기`) : tx('Pick your country', '나라를 골라 주세요')}
            </button>
          )}
        </>
      )}

      {who === 'kr' && (
        <>
          {schoolField()}
          <div className="field">
            <span className="label">2. {tx(`Countries you’re interested in (up to ${max})`, `관심 있는 나라 (최대 ${max}개)`)}</span>
            <div className="country-grid">
              {Object.entries(COUNTRIES).filter(([cid]) => cid !== 'kr' && cid !== 'other').map(([cid, c]) => {
                const groups = data?.groups?.filter((g) => g.country === cid && g.school === school && g.members > 0) || []
                const seats = groups.reduce((n, g) => n + Math.max(0, g.friendSeats), 0)
                return (
                  <button key={cid} className="option-card" aria-pressed={likes.includes(cid)} onClick={() => toggleLike(cid)}>
                    <span style={{ fontSize: 22 }}>{c.flag}</span>
                    <b>{L(c)}</b>
                    <span className="small">{groups.length ? tx(`${seats} seats`, `빈자리 ${seats}`) : tx('no group yet', '그룹 없음')}</span>
                  </button>
                )
              })}
            </div>
            <p className="small">{tx('You join one group from these countries (first choice first). Students from all of them see you in their language lounge and holiday events.', '고른 순서대로 빈자리가 있는 그룹 하나에 들어가요. 고른 나라들의 명절 이벤트와 언어 라운지도 추천해 드려요.')}</p>
          </div>
          <div className="field">
            <span className="label">3. {tx('What can you offer?', '무엇을 함께할 수 있나요?')}</span>
            <div className="chips">
              {Object.entries(OFFERS).map(([oid, o]) => (
                <button key={oid} className="chip" aria-pressed={offer.includes(oid)} onClick={() => toggleOffer(oid)}>{L(o)}</button>
              ))}
            </div>
          </div>
          {nickField(4)}
          <div className="card mentor-note">
            <b>🇰🇷 {tx('Korean friend ≠ mentor', '한국 친구 ≠ 멘토')}</b>
            <span className="small">{tx('Friends join for fun and are free. Mentors look after a group, host events and are paid from Eoullim’s revenue — they get an invite code.', '한국 친구는 누구나, 무료로 함께해요. 멘토는 그룹을 책임지고 이벤트를 열며 어울림 수익에서 몫을 받아요 (초대 코드 필요).')}</span>
          </div>
          {me?.admin ? (
            <p className="note card">🇰🇷 {tx('You are already a mentor on this phone.', '이 기기는 이미 멘토예요.')}</p>
          ) : (
            <button className="btn" disabled={busy || !likes.length} onClick={joinKr}>
              {busy ? tx('Finding a group…', '그룹 찾는 중…') : likes.length ? tx('Join as a Korean friend', '한국 친구로 함께하기') : tx('Pick at least one country', '나라를 하나 이상 골라 주세요')}
            </button>
          )}
          {likes.length > 0 && <p className="small">{likes.map((c) => `${COUNTRIES[c].flag} ${tx(`${fans[c] || 0} Korean students follow ${COUNTRIES[c].en}`, `${COUNTRIES[c].ko}에 관심 있는 한국 학생 ${fans[c] || 0}명`)}`).join(' · ')}</p>}
        </>
      )}

      <button className="btn line sm" onClick={() => { save(); go('home') }}>{tx('Later', '나중에 할게요')}</button>
    </div>
  )
}
