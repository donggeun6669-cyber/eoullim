import { useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { searchKB } from '../data/bot.js'
import {
  AnonToggle, Byline, Coin, ExampleTag, KindTag, Loading, ReportButton, StatusPill, TagPill, TopBar, Tr, ago, won,
} from '../components/ui.jsx'
import { hasPrivateInfo } from '../lib/api.js'
import { useApp } from '../store.jsx'
import { KINDS, TAGS } from '../i18n.js'

export function QuestionCard({ q }) {
  const { go, tx, data } = useApp()
  return (
    <button className="card q-card" onClick={() => go('q', q.id)}>
      <span className="q-card-top">
        <span className="tags">
          <KindTag kind={q.kind} />
          <TagPill tag={q.tag} />
          {q.status !== 'open' || q.hidden ? <StatusPill q={q} /> : null}
          {q.seed && <ExampleTag />}
        </span>
        {q.bounty > 0 && <Coin n={q.bounty} />}
      </span>
      <Tr text={q.title} as="b" className="q-title" />
      <span className="small">
        {q.snap ? q.snap.nick : tx('Anonymous', '익명')} · {ago(q.created, data.now, tx)} ·{' '}
        {q.answers.length ? tx(`${q.answers.length} answers`, `답변 ${q.answers.length}`) : tx('No answers yet', '아직 답변 없음')}
        {q.answers.some((a) => a.admin) && ' · 🇰🇷'}
      </span>
    </button>
  )
}

// ---------- Ask ----------
export function Ask() {
  const { data, me, tx, L, call, go, snap, showToast } = useApp()
  const [kind, setKind] = useState('know')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState('life')
  const [bounty, setBounty] = useState(0)
  const [anon, setAnon] = useState(true)
  const [dismissKB, setDismissKB] = useState('')
  const [busy, setBusy] = useState(false)

  const kb = useMemo(() => (title.trim().length >= 3 ? searchKB(title + ' ' + body).best : null), [title, body])
  const showKB = kb && dismissKB !== kb.id
  const balance = me?.points ?? 0
  const n = Number(bounty)
  const validBounty = Number.isInteger(n) && n >= 0 && n <= 1000
  const enough = n <= balance
  const priv = hasPrivateInfo(title + ' ' + body)

  if (!data) return <div className="screen"><Loading /></div>

  const submit = async () => {
    setBusy(true)
    try {
      const r = await call('ask', { kind, title, body, tag, bounty: n, anon, snap })
      showToast(n ? tx(`Posted! ${n} P is held until you adopt an answer.`, `올렸어요! ${n}P는 채택할 때까지 묶여 있어요.`) : tx('Posted!', '올렸어요!'))
      go('q', r.result.id)
    } catch {
      /* toast shown */
    }
    setBusy(false)
  }

  return (
    <div className="screen">
      <TopBar title={tx('Ask or ask for help', '질문·도움 요청')} />

      <div className="field">
        <span className="label">{tx('What do you need?', '무엇이 필요해요?')}</span>
        <div className="kind-grid">
          {Object.entries(KINDS).map(([id, k]) => (
            <button key={id} className="option-card" aria-pressed={kind === id} onClick={() => setKind(id)}>
              <span style={{ fontSize: 22 }}>{k.icon}</span>
              <span className="col">
                <b>{L(k)}</b>
                <span className="small">{L(k.hint)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="label">{tx('Title', '제목')}</span>
        <input
          className="input"
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === 'borrow' ? tx('e.g. Can someone lend me an umbrella?', '예: 우산 빌려줄 사람?') : kind === 'do' ? tx('e.g. Can someone call a clinic for me?', '예: 병원에 전화해 줄 사람?') : tx('e.g. How do I use the library coffee machine?', '예: 도서관 커피머신 어떻게 써요?')}
        />
      </label>

      {showKB && (
        <div className="kb-card" role="note">
          <div className="row" style={{ gap: 8 }}>
            <span className="tag skku">📘 {tx('Official SKKU guide', '성대 공식 안내')}</span>
            <span className="small">{tx('Maybe this answers it — for free', '이걸로 해결될 수도 있어요 (무료)')}</span>
          </div>
          <b>{kb.icon} {L(kb.q)}</b>
          <p className="kb-answer">{L(kb.a)}</p>
          {kb.sources?.[0] && (
            <a className="link-out" href={kb.sources[0].url} target="_blank" rel="noreferrer">
              <Icon name="external" size={14} /> {kb.sources[0].title}
            </a>
          )}
          <div className="row" style={{ gap: 8 }}>
            <button className="btn green xs" onClick={() => { showToast(tx('Great — solved 🙂', '해결됐네요 🙂')); go('community') }}>
              {tx('Solved — don’t post', '해결됐어요')}
            </button>
            <button className="btn line xs" onClick={() => setDismissKB(kb.id)}>{tx('I still need help', '그래도 물어볼래요')}</button>
          </div>
        </div>
      )}

      <label className="field">
        <span className="label">{tx('Details (optional)', '자세한 내용 (선택)')}</span>
        <textarea className="textarea" value={body} maxLength={1000} onChange={(e) => setBody(e.target.value)} placeholder={tx('When, where, what you already tried…', '언제, 어디서, 이미 해 본 것…')} />
      </label>
      {priv && <p className="warn">🔒 {tx('Phone numbers, emails and messenger IDs will be hidden as *** to keep you safe.', '안전을 위해 전화번호·이메일·메신저 ID는 ***로 가려져요.')}</p>}

      <div className="field">
        <span className="label">{tx('Topic', '주제')}</span>
        <div className="chips">
          {Object.entries(TAGS).map(([id, t]) => (
            <button key={id} className="chip" aria-pressed={tag === id} onClick={() => setTag(id)}>{L(t)}</button>
          ))}
        </div>
        {tag === 'kstyle' && <p className="small">🇰🇷 {tx('Korean mentors see this first.', '한국인 멘토에게 먼저 보여요.')}</p>}
      </div>

      <div className="field">
        <span className="label">{tx('Points (optional)', '포인트 걸기 (선택)')}</span>
        <p className="small">{tx('Free questions are welcome. Points get you answers faster — the adopted answer receives them.', '그냥 물어봐도 돼요. 포인트를 걸면 답이 더 빨리 오고, 채택된 답변이 받아요.')}</p>
        <div className="bounty-row">
          <input className="input bounty-input" type="number" min={1} max={1000} inputMode="numeric" value={bounty} onChange={(e) => setBounty(e.target.value)} aria-label={tx('Points', '포인트')} />
          <span className="col">
            <b>{!validBounty ? tx('0 – 1,000 P', '0 ~ 1,000 P') : n ? `${n} P ≈ ${won(n)}` : tx('No points — free question', '포인트 없이 — 무료 질문')}</b>
            <span className="small">{tx(`You have ${balance} P`, `내 포인트 ${balance} P`)}</span>
          </span>
        </div>
        <div className="chips">
          {[0, 5, 10, 30, 50, 100].map((v) => (
            <button key={v} className="chip" aria-pressed={n === v} onClick={() => setBounty(v)}>{v ? `${v} P` : tx('None', '안 걸기')}</button>
          ))}
        </div>
        {n > 0 && <p className="small">{tx('No answer in 72 hours → all points come back automatically.', '72시간 동안 답이 없으면 포인트가 자동으로 전부 돌아와요.')}</p>}
        {validBounty && !enough && (
          <button className="btn amber sm" onClick={() => go('points')}>{tx('Not enough points — charge', '포인트가 부족해요 — 충전하기')}</button>
        )}
      </div>

      <AnonToggle anon={anon} setAnon={setAnon} />

      <button className="btn" disabled={busy || !title.trim() || !validBounty || !enough} onClick={submit}>
        {busy ? tx('Posting…', '올리는 중…') : n > 0 ? tx(`Post with ${n} P`, `${n}P 걸고 올리기`) : tx('Post', '올리기')}
      </button>
    </div>
  )
}

// ---------- Question detail ----------
export function Question({ id }) {
  const { data, me, tx, call, showToast, snap, go } = useApp()
  const [text, setText] = useState('')
  const [anon, setAnon] = useState(true)
  const [busy, setBusy] = useState(false)
  const [thanks, setThanks] = useState('')
  const [picking, setPicking] = useState(null)
  if (!data) return <div className="screen"><Loading /></div>
  const q = data.questions.find((x) => x.id === id)
  if (!q) {
    return (
      <div className="screen">
        <TopBar title="" />
        <p className="empty">{tx('This question was removed.', '삭제된 질문이에요.')}</p>
      </div>
    )
  }
  const open = q.status === 'open' || q.status === 'review'
  const canAnswer = open && !q.mine
  const h = (data.now - q.created) / 3600e3
  const run = async (action, payload, msg) => {
    setBusy(true)
    try {
      await call(action, payload)
      if (msg) showToast(msg)
      return true
    } catch {
      return false
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <TopBar title={tx('Question', '질문')} right={q.bounty > 0 ? <Coin n={q.bounty} size="lg" /> : null} />
      <div className="tags">
        <KindTag kind={q.kind} />
        <TagPill tag={q.tag} />
        <StatusPill q={q} />
        {q.seed && <ExampleTag />}
      </div>
      <Tr text={q.title} as="h1" className="h2" block />
      {q.body && <Tr text={q.body} as="p" className="post-body" />}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Byline item={q} />
        <ReportButton item={q} type="q" />
      </div>

      {q.status === 'open' && !q.seed && q.bounty > 0 && (
        <p className="timer">
          ⏱{' '}
          {q.answers.length === 0
            ? tx(`No answer within ${Math.max(0, Math.ceil(72 - h))}h → full refund to the asker.`, `${Math.max(0, Math.ceil(72 - h))}시간 안에 답이 없으면 질문자에게 전액 환불돼요.`)
            : tx(`Pick the best answer. After ${Math.max(0, Math.ceil((168 - h) / 24))} more days a mentor decides.`, `가장 도움된 답을 채택해 주세요. ${Math.max(0, Math.ceil((168 - h) / 24))}일 뒤에는 멘토가 정해요.`)}
        </p>
      )}
      {q.status === 'review' && <p className="timer amber">🇰🇷 {tx('7 days passed without adoption — a mentor will pick the best answer or refund.', '7일 동안 채택이 없어 멘토가 답을 고르거나 환불해요.')}</p>}
      {q.status === 'refunded' && <p className="timer gray">↩ {q.refundReason === 'auto' ? tx('No answer in 72 hours — points went back to the asker.', '72시간 동안 답이 없어 포인트가 질문자에게 돌아갔어요.') : tx('A mentor refunded the points to the asker.', '멘토가 질문자에게 포인트를 환불했어요.')}</p>}

      {q.mine && q.status === 'open' && (
        <div className="card owner-actions">
          <span className="small">{q.bounty ? tx('Want faster answers? Add points.', '답이 더 빨리 오게 포인트를 더할 수 있어요.') : tx('No answer yet? You can add points (optional).', '답이 안 오면 포인트를 걸 수도 있어요 (선택).')}</span>
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            {[5, 10, 30].map((v) => (
              <button key={v} className="btn soft xs" disabled={busy || q.bounty + v > 1000} onClick={() => run('raise', { qid: q.id, amount: v }, tx(`+${v} P added`, `+${v}P 더했어요`))}>+{v} P</button>
            ))}
            {q.answers.length === 0 && (
              <button
                className="btn line xs"
                disabled={busy}
                onClick={async () => {
                  if (!window.confirm(tx('Delete this question? Your points come back.', '질문을 지울까요? 포인트는 돌아와요.'))) return
                  if (await run('delQuestion', { qid: q.id }, tx('Deleted.', '지웠어요.'))) go('community')
                }}
              >
                <Icon name="trash" size={14} /> {tx('Delete', '삭제')}
              </button>
            )}
          </div>
        </div>
      )}

      <h2 className="h3">{tx(`Answers ${q.answers.length}`, `답변 ${q.answers.length}`)}</h2>
      {q.answers.length === 0 && <p className="empty">{tx('No answers yet. Be the first!', '아직 답변이 없어요. 첫 답을 달아 보세요!')}</p>}
      <div className="list">
        {q.answers.map((a) => {
          const adopted = q.adopted === a.id
          return (
            <div key={a.id} className={'card answer' + (adopted ? ' adopted' : '') + (a.admin ? ' by-admin' : '')}>
              {adopted && <div className="adopted-badge">✓ {q.bounty ? tx(`Adopted · +${q.bounty} P`, `채택 · +${q.bounty}P`) : tx('Adopted', '채택')}</div>}
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <Byline item={a} size={30} />
                <ReportButton item={a} type="a" parentId={q.id} />
              </div>
              {a.hidden && <span className="tag coral">{tx('Hidden by reports', '신고로 가려짐')}</span>}
              <Tr text={a.body} as="p" className="post-body" block />
              {adopted && a.thanks && <p className="thanks">💬 “{a.thanks}”</p>}
              {q.mine && open && !a.hidden && picking !== a.id && (
                <button className="btn soft sm" onClick={() => setPicking(a.id)}>{q.bounty ? tx(`Adopt this answer · give ${q.bounty} P`, `이 답변 채택 · ${q.bounty}P 주기`) : tx('This solved it', '이 답으로 해결됐어요')}</button>
              )}
              {picking === a.id && (
                <div className="adopt-box">
                  <input className="input" placeholder={tx('Say thanks (optional)', '고마워요 한마디 (선택)')} value={thanks} maxLength={120} onChange={(e) => setThanks(e.target.value)} />
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn sm" disabled={busy} onClick={async () => { if (await run('adopt', { qid: q.id, aid: a.id, thanks }, q.bounty ? tx(`Adopted! ${q.bounty} P sent.`, `채택했어요! ${q.bounty}P를 보냈어요.`) : tx('Marked as solved!', '해결로 표시했어요!'))) setPicking(null) }}>
                      {tx('Confirm', '채택하기')}
                    </button>
                    <button className="btn line sm" onClick={() => setPicking(null)}>{tx('Cancel', '취소')}</button>
                  </div>
                </div>
              )}
              {me?.admin && open && !a.hidden && !q.mine && (
                <button className="btn amber xs" disabled={busy} onClick={() => window.confirm(tx('Adopt this answer for the asker?', '질문자 대신 이 답을 채택할까요?')) && run('adminAdopt', { qid: q.id, aid: a.id }, tx('Adopted by mentor.', '멘토가 채택했어요.'))}>
                  🇰🇷 {tx('Adopt for the asker', '대신 채택')}
                </button>
              )}
              {me?.admin && (
                <button className="linkish muted" onClick={() => run('adminHide', { type: 'a', id: a.id, parentId: q.id, hidden: !a.hidden })}>
                  {a.hidden ? tx('Show again', '다시 보이기') : tx('Hide', '가리기')}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {canAnswer && (
        <div className="card white answer-box">
          <b>{me?.admin ? tx('Answer as 🇰🇷 mentor', '🇰🇷 멘토로 답하기') : q.bounty ? tx(`Answer and earn ${q.bounty} P if adopted`, `답하고 채택되면 ${q.bounty}P 받기`) : tx('Help with an answer', '답변으로 도와주기')}</b>
          <textarea className="textarea" value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder={tx('Be kind and specific. No personal contact info.', '친절하고 구체적으로. 개인 연락처는 적지 마세요.')} />
          {hasPrivateInfo(text) && <p className="warn">🔒 {tx('Contact info will be hidden as ***.', '연락처는 ***로 가려져요.')}</p>}
          <AnonToggle anon={anon} setAnon={setAnon} />
          <button className="btn sm" disabled={busy || !text.trim()} onClick={async () => { if (await run('answer', { qid: q.id, body: text, anon, snap }, tx('Answer posted!', '답변을 올렸어요!'))) setText('') }}>
            {tx('Post answer', '답변 올리기')}
          </button>
        </div>
      )}

      {me?.admin && (
        <div className="card admin-panel">
          <b>🇰🇷 {tx('Mentor tools', '멘토 도구')}</b>
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            {open && q.bounty > 0 && <button className="btn amber xs" disabled={busy} onClick={() => window.confirm(tx(`Refund ${q.bounty} P to the asker?`, `질문자에게 ${q.bounty}P를 환불할까요?`)) && run('adminRefund', { qid: q.id }, tx('Refunded.', '환불했어요.'))}>↩ {tx('Refund asker', '질문자 환불')}</button>}
            <button className="btn line xs" disabled={busy} onClick={() => run('adminHide', { type: 'q', id: q.id, hidden: !q.hidden })}>{q.hidden ? tx('Show again', '다시 보이기') : tx('Hide question', '질문 가리기')}</button>
          </div>
          {q.status === 'open' && !q.seed && q.bounty > 0 && (
            <>
              <span className="small">{tx('Demo: fast-forward the clock to show the rules', '데모: 시간을 앞당겨 규칙 보여 주기')}</span>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn line xs" disabled={busy} onClick={() => run('adminAge', { qid: q.id, hours: 72 }, tx('+72 hours', '+72시간'))}>⏩ +72h</button>
                <button className="btn line xs" disabled={busy} onClick={() => run('adminAge', { qid: q.id, hours: 168 }, tx('+7 days', '+7일'))}>⏩ +7d</button>
              </div>
            </>
          )}
          {q.reports > 0 && <span className="small">🚩 {tx(`${q.reports} reports`, `신고 ${q.reports}건`)}</span>}
        </div>
      )}
    </div>
  )
}
