import { useState } from 'react'
import { Avatar, TopBar } from '../components/ui.jsx'
import { useApp } from '../store.jsx'
import { AVATARS, COLORS, INTERESTS, LANGS, SCHOOLS } from '../i18n.js'

export default function Profile() {
  const { profile, setProfile, tx, L, back, showToast } = useApp()
  const [p, setP] = useState(() => ({ nick: '', avatar: '🐯', color: 0, langs: [], interests: [], campus: '', bio: '', school: 'skku', ...profile }))
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }))
  const toggle = (k, id) => set(k, p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id])

  return (
    <div className="screen">
      <TopBar title={tx('My profile', '내 프로필')} sub={tx('Optional · saved only on this phone', '선택 · 이 기기에만 저장')} />

      <div className="profile-preview">
        <Avatar snap={{ avatar: p.avatar, color: p.color }} size={72} />
        <b style={{ fontSize: 18 }}>{p.nick || tx('Anonymous', '익명')}</b>
      </div>

      <label className="field">
        <span className="label">{tx('Nickname', '닉네임')}</span>
        <input className="input" value={p.nick} maxLength={20} onChange={(e) => set('nick', e.target.value)} placeholder={tx('Not your real name', '실명 말고 별명으로')} />
      </label>

      <div className="field">
        <span className="label">{tx('Avatar', '아바타')}</span>
        <div className="emoji-grid">
          {AVATARS.map((a) => (
            <button key={a} aria-pressed={p.avatar === a} onClick={() => set('avatar', a)} aria-label={a}>{a}</button>
          ))}
        </div>
        <div className="swatches">
          {COLORS.map(([bg], i) => (
            <button key={bg} aria-pressed={p.color === i} style={{ background: bg }} onClick={() => set('color', i)} aria-label={tx(`Color ${i + 1}`, `색 ${i + 1}`)} />
          ))}
        </div>
      </div>

      <div className="field">
        <span className="label">{tx('Languages I use', '쓰는 언어')}</span>
        <div className="chips">
          {LANGS.map(([id, label]) => (
            <button key={id} className="chip" aria-pressed={p.langs.includes(id)} onClick={() => toggle('langs', id)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="label">{tx('Interests', '관심사')}</span>
        <div className="chips">
          {INTERESTS.map(([id, en, ko]) => (
            <button key={id} className="chip" aria-pressed={p.interests.includes(id)} onClick={() => toggle('interests', id)}>{L([en, ko])}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="label">{tx('University', '학교')}</span>
        <div className="chips">
          {Object.entries(SCHOOLS).map(([id, n]) => (
            <button key={id} className="chip" aria-pressed={p.school === id} onClick={() => set('school', id)}>{L(n)}</button>
          ))}
        </div>
        <span className="small">{tx('Shown at the top of every screen, so you always know where you belong.', '모든 화면 위에 보여요 — 내가 어디 소속인지 늘 알 수 있게.')}</span>
      </div>

      <div className="field">
        <span className="label">{tx('Campus', '캠퍼스')}</span>
        <div className="seg sm">
          {[['', tx('Skip', '안 적음')], ['seoul', tx('Seoul (HSS)', '인사캠')], ['suwon', tx('Suwon (NS)', '자과캠')]].map(([id, label]) => (
            <button key={id} aria-pressed={p.campus === id} onClick={() => set('campus', id)}>{label}</button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="label">{tx('One line about you', '한 줄 소개')}</span>
        <input className="input" value={p.bio} maxLength={60} onChange={(e) => set('bio', e.target.value)} placeholder={tx('e.g. Learning Korean! Love hiking', '예: 한국어 공부 중! 등산 좋아해요')} />
      </label>

      <div className="card privacy-note">
        <b>🔒 {tx('What we don’t ask', '묻지 않는 것')}</b>
        <span className="small">
          {tx('No real name, student ID, major, phone or location. Your country is used only to make your group and is never shown on posts.', '실명·학번·학과·전화번호·위치를 묻지 않아요. 나라는 그룹을 만드는 데만 쓰고 글에는 보이지 않아요.')}
        </span>
        <span className="small">{tx('Only your nickname and avatar appear on posts you don’t make anonymous.', '익명이 아닌 글에만 닉네임과 아바타가 보여요.')}</span>
      </div>

      <button className="btn" onClick={() => { setProfile({ ...p, nick: p.nick.trim() }); showToast(tx('Saved on this phone', '이 기기에 저장했어요')); back() }}>
        {tx('Save', '저장')}
      </button>
      {profile && (
        <button className="btn line sm" onClick={() => { setProfile(null); showToast(tx('Profile cleared', '프로필을 지웠어요')); back() }}>
          {tx('Clear my profile', '프로필 지우기')}
        </button>
      )}
    </div>
  )
}
