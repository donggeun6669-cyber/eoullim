import { useState } from 'react'
import { Avatar, TopBar, flagOf, useGroupName } from '../components/ui.jsx'
import { ApiError } from '../lib/api.js'
import { useApp } from '../store.jsx'
import { APP_LANGS, AVATARS, COUNTRIES, OFFERS, SCHOOLS, TIES } from '../i18n.js'

// Start. International student: school → country → group (same country, 3–4 people + a Korean mentor).
// Korean student (v5, 2026-10-03): every Korean student in a group is a verified, paid mentor.
//   verification code (one per person, from the operator) — or, in this demo, continue without one →
//   school → countries I'm interested in (or "any") → I look after one of those groups as a mentor.
export default function Setup({ id }) {
  const { tx, L, lang, setLang, profile, setProfile, call, go, me, data, showToast, errorText } = useApp()
  const gn = useGroupName()
  const [who, setWho] = useState(id === 'kr' || me?.mentor ? 'kr' : id === 'intl' ? 'intl' : profile?.who || '')
  const [school, setSchool] = useState(profile?.school || 'skku')
  const [country, setCountry] = useState('')
  const [likes, setLikes] = useState(me?.kr?.countries || [])
  const [offer, setOffer] = useState(me?.kr?.offer || ['language'])
  const [nick, setNick] = useState(profile?.nick || '')
  const [avatar, setAvatar] = useState(profile?.avatar || AVATARS[0])
  const [langTouched, setLangTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState('')
  const [tie, setTie] = useState(me?.kr?.tie || '')
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
  const verify = async (demo) => {
    setBusy(true)
    try {
      if (demo) await call('mentorDemo')
      else await call('adminClaim', { code: code.trim() })
      showToast(demo ? tx('Demo: continuing without a code', '데모: 인증 코드 없이 계속해요') : tx('Verified ✓ — welcome, mentor 🇰🇷', '인증됐어요 ✓ — 멘토로 환영해요 🇰🇷'))
      setCode('')
    } catch {
      /* toast shown */
    }
    setBusy(false)
  }
  const joinKr = async () => {
    save()
    setBusy(true)
    try {
      await call('krSet', { countries: likes, offer, school, tie })
      await call('krJoin', { snap: snap() }, { quiet: true })
      showToast(tx('You are now this group’s mentor! Say hi 👋', '멘토로 그룹에 들어왔어요! 인사해 보세요 👋'))
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
          <span className="light-text">{tx('You already have a group.', '이미 그룹이 있어요.')}</span>
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
            <b>{tx('Korean student · mentor', '한국 학생 · 한국인 멘토')}</b>
            <span className="small">{tx('Verified, then you look after a group from a country you like — and get paid', '인증을 받고 관심 나라 조를 맡아 관리해요 — 수익 몫을 받아요')}</span>
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
            <p className="small">🌏 {tx(`Few students from your country yet? If your group is under ${data?.rules?.GROUP_START || 3} after ${data?.rules?.REGION_WAIT_D || 7} days, you move together to a regional group with nearby countries.`, `같은 나라 학생이 적어도 괜찮아요. ${data?.rules?.REGION_WAIT_D || 7}일 안에 ${data?.rules?.GROUP_START || 3}명이 안 되면 가까운 나라 친구들의 지역 조로 함께 옮겨 시작해요.`)}</p>
          </div>
          <label className="field">
            <span className="label">3. {tx('App language', '앱 언어')}</span>
            <select className="select" value={lang} onChange={(e) => { setLang(e.target.value); setLangTouched(true) }}>
              {APP_LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <span className="small">🌐 {tx('Posts and group chat are translated into this language automatically.', '게시판과 그룹 채팅이 이 언어로 자동 번역돼요.')}</span>
          </label>
          {nickField(4)}
          {me?.mentor ? (
            <p className="note card">🇰🇷 {tx('This phone is a Korean mentor. Choose “Korean student · mentor” above.', '이 기기는 한국인 멘토예요. 위에서 「한국 학생 · 한국인 멘토」를 골라 주세요.')}</p>
          ) : (
            <button className="btn" disabled={busy || !country} onClick={join}>
              {busy ? tx('Finding your group…', '그룹 찾는 중…') : country ? tx(`Meet my ${COUNTRIES[country].en} group`, `${COUNTRIES[country].ko} 조 만나기`) : tx('Pick your country', '나라를 골라 주세요')}
            </button>
          )}
        </>
      )}

      {who === 'kr' && !me?.mentor && (
        <div className="card verify-card">
          <b>🔒 {tx('A verification code is needed', '인증 코드가 필요해요')}</b>
          <span className="small">{tx('Korean students in a group are mentors: they look after the group and are paid. So the Eoullim team checks your student ID in person and gives you a code — one per person.', '그룹에 들어가는 한국 학생은 멘토예요. 그룹을 관리하고 돈을 받기 때문에, 어울림 운영팀이 학생증을 직접 확인하고 한 사람에게 하나씩 인증 코드를 드려요.')}</span>
          <div className="row" style={{ gap: 8 }}>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="MT-XXXX-XXXX" autoCapitalize="characters" autoComplete="off" />
            <button className="btn xs" disabled={busy || !code.trim()} onClick={() => verify(false)}>{tx('Verify', '인증하기')}</button>
          </div>
          <div className="demo-note">
            <span className="small">🧪 {tx('This is a demo — for now you can continue without a code.', '지금은 데모라서 코드 없이 들어갈 수 있어요.')}</span>
            <button className="btn line xs" disabled={busy} onClick={() => verify(true)}>{tx('Continue as demo (no code)', '데모로 계속 (인증 생략)')}</button>
          </div>
        </div>
      )}

      {who === 'kr' && me?.mentor && (
        <>
          <p className="note card">{me.demoMentor ? `🧪 ${tx('Demo mentor — not verified yet (a real code is needed in the service).', '데모 멘토 — 아직 인증 전이에요 (실제 서비스에서는 인증 코드가 필요해요).')}` : `✓ ${tx('Verified Korean mentor', '인증된 한국인 멘토')}`}</p>
          {schoolField()}
          <div className="field">
            <span className="label">2. {tx(`Countries you’re interested in (up to ${max})`, `관심 있는 나라 (최대 ${max}개)`)}</span>
            <button className="option-card any-card" aria-pressed={likes.includes('any')} onClick={() => toggleLike('any')}>
              <span style={{ fontSize: 22 }}>🌏</span>
              <span className="col">
                <b>{tx('Any country is fine', '어디든 괜찮아요')}</b>
                <span className="small">{tx('Groups without a mentor come first', '멘토가 없는 조부터 맡아요')}</span>
              </span>
            </button>
            <div className="country-grid">
              {Object.entries(COUNTRIES).filter(([cid]) => cid !== 'kr' && cid !== 'other').map(([cid, c]) => {
                const groups = data?.groups?.filter((g) => g.country === cid && g.school === school && g.members > 0) || []
                const waiting = groups.filter((g) => !g.hasMentor).length
                return (
                  <button key={cid} className="option-card" aria-pressed={likes.includes(cid)} onClick={() => toggleLike(cid)}>
                    <span style={{ fontSize: 22 }}>{c.flag}</span>
                    <b>{L(c)}</b>
                    <span className={'small' + (waiting ? ' need' : '')}>{waiting ? tx(`${waiting} need a mentor`, `멘토 필요 ${waiting}`) : groups.length ? tx('has mentors', '멘토 있음') : tx('no group yet', '그룹 없음')}</span>
                  </button>
                )
              })}
            </div>
            <p className="small">{tx(`You look after one group from these countries (first choice first) — or a regional group that includes them. One mentor per group, up to ${data?.rules?.MENTOR_MAX || 3} groups per mentor.`, `고른 순서대로 멘토가 없는 그 나라 조(또는 그 나라가 들어 있는 지역 조) 하나를 맡아요. 조마다 한국인 멘토 1명, 멘토 한 명은 ${data?.rules?.MENTOR_MAX || 3}개 조까지.`)}</p>
          </div>
          {likes[0] && likes[0] !== 'any' && (
            <div className="field">
              <span className="label">{tx(`Any link with ${COUNTRIES[likes[0]].en}? (optional)`, `${COUNTRIES[likes[0]].ko}와 인연이 있나요? (선택)`)}</span>
              <div className="chips">
                {Object.entries(TIES).map(([tid, t]) => (
                  <button key={tid} className="chip" aria-pressed={tie === tid} onClick={() => setTie(tie === tid ? '' : tid)}>{COUNTRIES[likes[0]].flag} {L(COUNTRIES[likes[0]])} {L(t)}</button>
                ))}
              </div>
              <span className="small">✈️ {tx('Going there on exchange? Make friends from that country before you leave — your group sees it.', '교환학생 갈 예정이라면, 가기 전에 그 나라 친구를 먼저 사귈 기회예요. 우리 조에 표시돼요.')}</span>
            </div>
          )}
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
            <b>💰 {tx('Mentors are paid', '멘토는 수익 몫을 받아요')}</b>
            <span className="small">{tx('30% of Eoullim’s revenue (event fees and points) goes to mentors by work done: groups, events, answers, moderation.', '어울림 수익(이벤트 수수료·포인트)의 30%를 멘토가 실적(그룹·이벤트·답변·관리)대로 나눠 받아요.')}{me.demoMentor ? ' ' + tx('Demo mentors are not paid.', '데모 멘토는 받지 않아요.') : ''}</span>
          </div>
          <button className="btn" disabled={busy || !likes.length} onClick={joinKr}>
            {busy ? tx('Finding a group…', '그룹 찾는 중…') : likes.length ? tx('Look after a group as mentor', '멘토로 그룹 맡기') : tx('Pick at least one', '하나 이상 골라 주세요')}
          </button>
          {likes.filter((c) => c !== 'any').length > 0 && <p className="small">{likes.filter((c) => c !== 'any').map((c) => `${COUNTRIES[c].flag} ${tx(`${fans[c] || 0} Korean mentors follow ${COUNTRIES[c].en}`, `${COUNTRIES[c].ko}에 관심 있는 한국인 멘토 ${fans[c] || 0}명`)}`).join(' · ')}</p>}
        </>
      )}

      <button className="btn line sm" onClick={() => { save(); go('home') }}>{tx('Later', '나중에 할게요')}</button>
    </div>
  )
}
