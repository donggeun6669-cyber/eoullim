import { useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { searchKB } from '../data/bot.js'
import {
  AnonToggle, Byline, Coin, ExampleTag, Fab, KindTag, Loading, ReportButton, StatusPill, TabBar, TagPill, TopBar, ago, won,
} from '../components/ui.jsx'
import { hasPrivateInfo } from '../lib/api.js'
import { useApp } from '../store.jsx'
import { KINDS, TAGS } from '../i18n.js'

const FILTERS = [
  { id: 'all', en: 'All', ko: '전체' },
  { id: 'open', en: 'Unanswered', ko: '답변 없음' },
  { id: 'top', en: 'Most points', ko: '포인트 높은 순' },
  { id: 'mine', en: 'Mine', ko: '내 질문' },
]

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
        <Coin n={q.bounty} />
      </span>
      <b className="q-title">{q.title}</b>
      <span className="small">
        {q.snap ? q.snap.nick : tx('Anonymous', '익명')} · {ago(q.created, data.now, tx)} ·{' '}
        {q.answers.length ? tx(`${q.answers.length} answers`, `답변 ${q.answers.length}`) : tx('No answers yet', '아직 답변 없음')}
        {q.answers.some((a) => a.admin) && ' · 🇰🇷'}
      </span>
    </button>
  )
}

export default function Solve() {
  const { data, tx, go } = useApp()
  const [filter, setFilter] = useState('all')
  const [kind, setKind] = useState(null)
  if (!data) return <div className="screen"><Loading /><TabBar current="solve" /></div>

  let list = data.questions
  if (kind) list = list.filter((q) => q.kind === kind)
  if (filter === 'open') list = list.filter((q) => q.status === 'open' && q.answers.length === 0)
  if (filter === 'mine') list = list.filter((q) => q.mine)
  if (filter === 'top') list = [...list].filter((q) => q.status === 'open').sort((a, b) => b.bounty - a.bounty)

  return (
    <>
      <div className="screen with-tabs">
        <div>
          <h1 className="h1">{tx('Ask & help', '해결 게시판')}</h1>
          <p className="sub">{tx('Put points on a question. The answer you adopt gets them.', '질문에 포인트를 걸고, 채택한 답변이 포인트를 가져가요.')}</p>
        </div>
        <div className="chips scroll" role="group" aria-label={tx('Type', '종류')}>
          <button className="chip" aria-pressed={!kind} onClick={() => setKind(null)}>{tx('Everything', '모두')}</button>
          {Object.entries(KINDS).map(([id, k]) => (
            <button key={id} className="chip" aria-pressed={kind === id} onClick={() => setKind(kind === id ? null : id)}>
              {k.icon} {tx(k.en, k.ko)}
            </button>
          ))}
        </div>
        <div className="seg sm" role="group">
          {FILTERS.map((f) => (
            <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{tx(f.en, f.ko)}</button>
          ))}
        </div>
        <div className="list">
          {list.length === 0 && <p className="empty">{tx('Nothing here yet.', '아직 없어요.')}</p>}
          {list.map((q) => <QuestionCard key={q.id} q={q} />)}
        </div>
      </div>
      <Fab onClick={() => go('ask')} label={tx('Ask', '물어보기')} />
      <TabBar current="solve" />
    </>
  )
}

// ---------- Ask ----------
export function Ask() {
  const { data, me, tx, L, call, go, snap, showToast } = useApp()
  const [kind, setKind] = useState('know')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState('life')
  const [bounty, setBounty] = useState(10)
  const [anon, setAnon] = useState(true)
  const [dismissKB, setDismissKB] = useState('')
  const [busy, setBusy] = useState(false)

  const kb = useMemo(() => (title.trim().length >= 3 ? searchKB(title + ' ' + body).best : null), [title, body])
  const showKB = kb && dismissKB !== kb.id
  const balance = me?.points ?? 0
  const n = Number(bounty)
  const validBounty = Number.isInteger(n) && n >= 1 && n <= 1000
  const enough = n <= balance
  const priv = hasPrivateInfo(title + ' ' + body)

  if (!data) return <div className="screen"><Loading /></div>

  const submit = async () => {
    setBusy(true)
    try {
      const r = await call('ask', { kind, title, body, tag, bounty: n, anon, snap })
      showToast(tx(`Posted! ${n} P is held until you adopt an answer.`, `올렸어요! ${n}P는 채택할 때까지 묶여 있어요.`))
      go('q', r.result.id)
    } catch {
      /* toast shown */
    }
    setBusy(false)
  }

  return (
    <div className="screen">
      <TopBar title={tx('Ask a question', '질문하기')} />

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
            <button className="btn green xs" onClick={() => { showToast(tx('Great — no points used 🙂', '해결됐네요 — 포인트는 그대로예요 🙂')); go('solve') }}>
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
        {tag === 'kstyle' && <p className="small">🇰🇷 {tx('Korean managers see this first.', '한국인 관리자에게 먼저 보여요.')}</p>}
      </div>

      <div className="field">
        <span className="label">{tx('Points to give', '걸 포인트')}</span>
        <div className="bounty-row">
          <input className="input bounty-input" type="number" min={1} max={1000} inputMode="numeric" value={bounty} onChange={(e) => setBounty(e.target.value)} aria-label={tx('Points', '포인트')} />
          <span className="col">
            <b>{validBounty ? `${n} P ≈ ${won(n)}` : tx('1 – 1,000 P', '1 ~ 1,000 P')}</b>
            <span className="small">{tx(`You have ${balance} P`, `내 포인트 ${balance} P`)}</span>
          </span>
        </div>
        <div className="chips">
          {[1, 5, 10, 30, 50, 100].map((v) => (
            <button key={v} className="chip" aria-pressed={n === v} onClick={() => setBounty(v)}>{v} P</button>
          ))}
        </div>
        <p className="small">{tx('No answer in 72 hours → all points come back automatically.', '72시간 동안 답이 없으면 포인트가 자동으로 전부 돌아와요.')}</p>
        {validBounty && !enough && (
          <button className="btn amber sm" onClick={() => go('points')}>{tx('Not enough points — charge', '포인트가 부족해요 — 충전하기')}</button>
        )}
      </div>

      <AnonToggle anon={anon} setAnon={setAnon} />

      <button className="btn" disabled={busy || !title.trim() || !validBounty || !enough} onClick={submit}>
        {busy ? tx('Posting…', '올리는 중…') : tx(`Post with ${validBounty ? n : '–'} P`, `${validBounty ? n : '–'}P 걸고 올리기`)}
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
      <TopBar title={tx('Question', '질문')} right={<Coin n={q.bounty} size="lg" />} />
      <div className="tags">
        <KindTag kind={q.kind} />
        <TagPill tag={q.tag} />
        <StatusPill q={q} />
        {q.seed && <ExampleTag />}
      </div>
      <h1 className="h2">{q.title}</h1>
      {q.body && <p className="post-body">{q.body}</p>}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Byline item={q} />
        <ReportButton item={q} type="q" />
      </div>

      {q.status === 'open' && !q.seed && (
        <p className="timer">
          ⏱{' '}
          {q.answers.length === 0
            ? tx(`No answer within ${Math.max(0, Math.ceil(72 - h))}h → full refund to the asker.`, `${Math.max(0, Math.ceil(72 - h))}시간 안에 답이 없으면 질문자에게 전액 환불돼요.`)
            : tx(`Pick the best answer. After ${Math.max(0, Math.ceil((168 - h) / 24))} more days a manager decides.`, `가장 도움된 답을 채택해 주세요. ${Math.max(0, Math.ceil((168 - h) / 24))}일 뒤에는 관리자가 정해요.`)}
        </p>
      )}
      {q.status === 'review' && <p className="timer amber">🇰🇷 {tx('7 days passed without adoption — a manager will pick the best answer or refund.', '7일 동안 채택이 없어 관리자가 답을 고르거나 환불해요.')}</p>}
      {q.status === 'refunded' && <p className="timer gray">↩ {q.refundReason === 'auto' ? tx('No answer in 72 hours — points went back to the asker.', '72시간 동안 답이 없어 포인트가 질문자에게 돌아갔어요.') : tx('A manager refunded the points to the asker.', '관리자가 질문자에게 포인트를 환불했어요.')}</p>}

      {q.mine && q.status === 'open' && (
        <div className="card owner-actions">
          <span className="small">{tx('Want faster answers? Add points.', '답이 더 빨리 오게 포인트를 더할 수 있어요.')}</span>
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
                  if (await run('delQuestion', { qid: q.id }, tx('Deleted. Points refunded.', '지웠어요. 포인트가 돌아왔어요.'))) go('solve')
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
              {adopted && <div className="adopted-badge">✓ {tx(`Adopted · +${q.bounty} P`, `채택 · +${q.bounty}P`)}</div>}
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <Byline item={a} size={30} />
                <ReportButton item={a} type="a" parentId={q.id} />
              </div>
              {a.hidden && <span className="tag coral">{tx('Hidden by reports', '신고로 가려짐')}</span>}
              <p className="post-body">{a.body}</p>
              {adopted && a.thanks && <p className="thanks">💬 “{a.thanks}”</p>}
              {q.mine && open && !a.hidden && picking !== a.id && (
                <button className="btn soft sm" onClick={() => setPicking(a.id)}>{tx(`Adopt this answer · give ${q.bounty} P`, `이 답변 채택 · ${q.bounty}P 주기`)}</button>
              )}
              {picking === a.id && (
                <div className="adopt-box">
                  <input className="input" placeholder={tx('Say thanks (optional)', '고마워요 한마디 (선택)')} value={thanks} maxLength={120} onChange={(e) => setThanks(e.target.value)} />
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn sm" disabled={busy} onClick={async () => { if (await run('adopt', { qid: q.id, aid: a.id, thanks }, tx(`Adopted! ${q.bounty} P sent.`, `채택했어요! ${q.bounty}P를 보냈어요.`))) setPicking(null) }}>
                      {tx('Confirm', '채택하기')}
                    </button>
                    <button className="btn line sm" onClick={() => setPicking(null)}>{tx('Cancel', '취소')}</button>
                  </div>
                </div>
              )}
              {me?.admin && open && !a.hidden && !q.mine && (
                <button className="btn amber xs" disabled={busy} onClick={() => window.confirm(tx('Adopt this answer for the asker?', '질문자 대신 이 답을 채택할까요?')) && run('adminAdopt', { qid: q.id, aid: a.id }, tx('Adopted by manager.', '관리자가 채택했어요.'))}>
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
          <b>{me?.admin ? tx('Answer as 🇰🇷 manager', '🇰🇷 관리자로 답하기') : tx(`Answer and earn ${q.bounty} P if adopted`, `답하고 채택되면 ${q.bounty}P 받기`)}</b>
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
          <b>🇰🇷 {tx('Manager tools', '관리자 도구')}</b>
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            {open && <button className="btn amber xs" disabled={busy} onClick={() => window.confirm(tx(`Refund ${q.bounty} P to the asker?`, `질문자에게 ${q.bounty}P를 환불할까요?`)) && run('adminRefund', { qid: q.id }, tx('Refunded.', '환불했어요.'))}>↩ {tx('Refund asker', '질문자 환불')}</button>}
            <button className="btn line xs" disabled={busy} onClick={() => run('adminHide', { type: 'q', id: q.id, hidden: !q.hidden })}>{q.hidden ? tx('Show again', '다시 보이기') : tx('Hide question', '질문 가리기')}</button>
          </div>
          {q.status === 'open' && !q.seed && (
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
