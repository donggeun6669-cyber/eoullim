import { useApp } from '../store.jsx'
import Icon from '../components/Icon.jsx'
import { MeAvatar, TopBar } from '../components/ui.jsx'
import { REWARDS, interest, langLabel, topic } from '../data/people.js'

const GOAL = 1500

export default function Points() {
  const { go, tx, L, state, redeem, resetDemo } = useApp()
  const left = Math.max(0, GOAL - state.points)
  const me = state.me
  const whenLabel = (w) => (w === 'today' ? tx('Today', '오늘') : w === 'yesterday' ? tx('Yesterday', '어제') : w)
  return (
    <div className="screen">
      <TopBar title={tx('My Points', '내 포인트')} />

      <div className="hero-card">
        <span style={{ fontSize: 13, opacity: 0.9 }}>{tx('Available points', '사용 가능 포인트')}</span>
        <span className="display" style={{ fontSize: 40, lineHeight: 1 }}>
          {state.points.toLocaleString()} <span style={{ fontSize: 20 }}>P</span>
        </span>
        <div className="progress"><span style={{ width: Math.min(100, (state.points / GOAL) * 100) + '%' }} /></div>
        <span style={{ fontSize: 13 }}>
          {left > 0
            ? tx(`${left} P more to unlock the exchange-program bonus`, `교환학생 가산점까지 ${left} P 남았어요`)
            : tx('You can unlock the exchange-program bonus!', '교환학생 가산점을 받을 수 있어요!')}
        </span>
      </div>

      <div className="field">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="h3">{tx('Rewards', '리워드')}</span>
          <span className="demo-pill">{tx('Proposal', '제안')}</span>
        </div>
        <div className="list">
          {REWARDS.map((r) => {
            const done = state.redeemed.includes(r.id)
            const locked = state.points < r.cost
            return (
              <div key={r.id} className="person-row">
                <div className="avatar" style={{ width: 44, height: 44, background: 'var(--amber-tint)', color: 'var(--amber-ink)' }}>
                  <Icon name={locked ? 'lock' : 'gift'} />
                </div>
                <span className="col">
                  <span className="name" style={{ fontSize: 15 }}>{L(r.name)}</span>
                  <span className="meta">{r.cost.toLocaleString()} P · {L(r.note)}</span>
                </span>
                <button className={'btn xs ' + (done ? 'green' : locked ? 'line' : 'amber')} disabled={locked || done} onClick={() => redeem(r)}>
                  {done ? '✓ ' + tx('Redeemed', '교환됨') : locked ? tx('Locked', '잠김') : tx('Redeem', '교환')}
                </button>
              </div>
            )
          })}
        </div>
        <span className="small" style={{ lineHeight: 1.5 }}>
          {tx('Rewards are our proposal. Real rewards would be set together with SKKU.', '리워드는 저희 팀의 제안이에요. 실제 리워드는 학교와 함께 정해야 해요.')}
        </span>
      </div>

      <div className="field">
        <span className="h3">{tx('Recent activity', '최근 활동')}</span>
        <div className="card" style={{ padding: '4px 14px' }}>
          {state.activity.slice(0, 6).map((a, i) => (
            <div key={a.id} className="row" style={{ padding: '12px 0', borderTop: i ? '1px solid var(--line)' : 0 }}>
              <span className="col">
                <span style={{ fontSize: 14, fontWeight: 500 }}>{L(a.label)}</span>
                <span className="small">{whenLabel(a.when)}</span>
              </span>
              <b style={{ color: a.delta > 0 ? 'var(--green)' : 'var(--ink-2)' }}>{a.delta > 0 ? '+' : '−'}{Math.abs(a.delta)} P</b>
            </div>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="h3">{tx('My profile', '내 프로필')}</span>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="row">
            <MeAvatar size={44} />
            <span className="col">
              <span className="name">{me.name || tx('Guest', '게스트')}</span>
              <span className="meta">{me.role === 'mentor' ? tx('Mentor', '멘토') : tx('Mentee', '멘티')}{me.country ? ' · ' + me.country : ''}</span>
            </span>
            <button className="btn xs line" onClick={() => go('profile')}>{tx('Edit', '수정')}</button>
          </div>
          <div className="tags">
            {me.langs.map((l) => <span key={l} className="tag gray">{langLabel(l)}</span>)}
            {me.topics.map((t) => <span key={t} className="tag">{L(topic(t))}</span>)}
            {me.interests.map((i) => <span key={i} className="tag green">{L(interest(i))}</span>)}
          </div>
        </div>
      </div>

      <button onClick={resetDemo} style={{ border: 0, background: 'none', color: 'var(--muted)', fontSize: 13, textDecoration: 'underline', padding: 8 }}>
        {tx('Reset demo data', '데모 데이터 초기화')}
      </button>
    </div>
  )
}
