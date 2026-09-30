import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Loading, TabBar, ago, won } from '../components/ui.jsx'
import { useApp } from '../store.jsx'
import { LEDGER } from '../i18n.js'

export default function Points() {
  const { data, me, tx, L, call, showToast, go } = useApp()
  const [busy, setBusy] = useState(null)
  if (!data) return <div className="screen"><Loading /><TabBar current="points" /></div>

  const charge = async (points) => {
    setBusy(points)
    try {
      await call('charge', { points })
      showToast(tx(`+${points} P (demo — no real payment)`, `+${points}P (데모 — 실제 결제 없음)`))
    } catch {
      /* toast shown */
    }
    setBusy(null)
  }

  return (
    <>
      <div className="screen with-tabs">
        <h1 className="h1">{tx('Points', '포인트')}</h1>
        <div className="hero-card">
          <span className="small light">{tx('My points', '내 포인트')}</span>
          <span className="display" style={{ fontSize: 40 }}>{(me?.points ?? 0).toLocaleString()} P</span>
          <span className="small light">≈ {won(me?.points ?? 0)} · 100{tx(' won = 1 P', '원 = 1P')}</span>
        </div>

        <section className="section">
          <div className="section-head">
            <h2 className="h3">{tx('Charge', '충전하기')}</h2>
            <span className="demo-pill">DEMO</span>
          </div>
          <div className="pack-grid">
            {data.rules.PACKS.map((p) => (
              <button key={p} className="pack" disabled={busy != null} onClick={() => charge(p)}>
                <b>{p} P</b>
                <span>{won(p)}</span>
                {busy === p && <span className="small">…</span>}
              </button>
            ))}
          </div>
          <p className="small note">
            {tx('Demo: no real payment is made. In the real service a payment company handles the card — we never see card numbers.', '데모: 실제로 결제되지 않아요. 실제 서비스에서는 결제대행사가 카드를 처리하고, 우리는 카드 번호를 보지 않아요.')}
          </p>
        </section>

        <div className="card rules-card">
          <b>{tx('How points work', '포인트 규칙')}</b>
          <ul>
            <li>{tx('Put 1–1,000 P on a question. It is held until you adopt an answer.', '질문에 1~1,000P를 걸어요. 채택할 때까지 묶여 있어요.')}</li>
            <li>{tx('The adopted answer gets all of it.', '채택된 답변이 전부 가져가요.')}</li>
            <li>{tx('No answer in 72 hours → automatic full refund.', '72시간 동안 답이 없으면 자동 전액 환불.')}</li>
            <li>{tx('Answers but no adoption for 7 days → a Korean manager decides.', '답은 있는데 7일 동안 채택이 없으면 한국인 관리자가 정해요.')}</li>
            <li>{tx('Points can’t be cashed out or sent directly to others.', '포인트는 현금으로 바꾸거나 남에게 직접 보낼 수 없어요.')}</li>
          </ul>
        </div>

        <button className="card row-link" onClick={() => go('settings')}>
          <Icon name="key" />
          <span className="col">
            <b>{tx('Save your recovery code', '복구 코드 저장하기')}</b>
            <span className="small">{tx('No account means: lose this phone’s data, lose your points — unless you saved the code.', '계정이 없어서, 기기 데이터를 지우면 포인트도 사라져요 — 코드를 저장해 두면 되찾을 수 있어요.')}</span>
          </span>
          <Icon name="chevron" size={18} />
        </button>

        <section className="section">
          <h2 className="h3">{tx('History', '기록')}</h2>
          {data.ledger.length === 0 && <p className="empty">{tx('No history yet.', '아직 기록이 없어요.')}</p>}
          <div className="ledger">
            {data.ledger.map((l) => (
              <button key={l.id} className="ledger-row" onClick={() => l.ref && data.questions.some((q) => q.id === l.ref) && go('q', l.ref)}>
                <span className="col">
                  <b>{L(LEDGER[l.reason] || [l.reason, l.reason])}</b>
                  <span className="small">{ago(l.at, data.now, tx)}{l.won ? ` · ${won(l.delta)}` : ''}</span>
                </span>
                <span className={'delta ' + (l.delta > 0 ? 'plus' : 'minus')}>{l.delta > 0 ? '+' : ''}{l.delta} P</span>
              </button>
            ))}
          </div>
        </section>
      </div>
      <TabBar current="points" />
    </>
  )
}
