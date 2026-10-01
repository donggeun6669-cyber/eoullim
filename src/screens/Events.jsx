import { useState } from 'react'
import { Avatar, Fab, Loading, TabBar, TopBar, Tr, flagOf, useGroupName } from '../components/ui.jsx'
import { hasPrivateInfo } from '../lib/api.js'
import { useApp } from '../store.jsx'
import { APP_LANGS, COUNTRIES, EVENT_CATS, EVENT_EMOJI } from '../i18n.js'

const wonFmt = (n) => '₩' + Number(n).toLocaleString()

// "Sat, Oct 17" in the app language (the browser formats dates for every language).
export function useDate() {
  const { lang } = useApp()
  const loc = lang === 'tl' ? 'fil' : APP_LANGS.find((l) => l.id === lang)?.g || 'en'
  return (date, time) => {
    const d = new Date(`${date}T${time || '12:00'}:00+09:00`)
    let s
    try {
      s = d.toLocaleDateString(loc, { month: 'short', day: 'numeric', weekday: 'short', timeZone: 'Asia/Seoul' })
    } catch {
      s = date
    }
    return time ? `${s} ${time}` : s
  }
}

function CatTag({ e }) {
  const { L } = useApp()
  const c = EVENT_CATS[e.cat]
  if (e.cat === 'country' && e.country) {
    const k = COUNTRIES[e.country]
    return <span className="tag">{k.flag} {L(k)}</span>
  }
  return <span className="tag">{c.icon} {L(c)}</span>
}

function EventStatus({ e }) {
  const { tx } = useApp()
  if (e.status === 'cancelled') return <span className="tag gray">{e.cancelReason === 'min' ? tx('Cancelled — not enough people, refunded', '최소 인원 미달로 취소 · 환불됨') : tx('Cancelled · refunded', '취소됨 · 환불됨')}</span>
  if (e.status === 'done') return <span className="tag gray">{tx('Ended', '끝남')}</span>
  if (e.joined >= e.cap) return <span className="tag gray">{tx('Full', '마감')}</span>
  return null
}

export function EventCard({ e }) {
  const { go, tx } = useApp()
  const fmt = useDate()
  const closed = e.status !== 'open'
  return (
    <button className={'card event-card' + (closed ? ' closed' : '')} onClick={() => go('event', e.id)}>
      <span className="event-emoji" aria-hidden="true">{e.emoji}</span>
      <span className="col">
        <span className="tags">
          <CatTag e={e} />
          {e.iJoined && <span className="tag solid">✓ {tx('Joined', '신청함')}</span>}
          <EventStatus e={e} />
        </span>
        <Tr text={e.title} as="b" className="q-title" />
        <span className="small">📅 {fmt(e.date, e.time)} · 📍 <Tr text={e.place} /></span>
        <span className="event-foot">
          <b className="fee">{e.fee ? wonFmt(e.fee) : tx('Free', '무료')}</b>
          <span className="small">👥 {e.joined}/{e.cap}{e.myGroupCount > 0 ? ` · ${tx(`${e.myGroupCount} from my group`, `우리 조 ${e.myGroupCount}명`)}` : ''}</span>
        </span>
      </span>
    </button>
  )
}

const FILTERS = [
  { id: 'all', en: 'All', ko: '전체' },
  { id: 'korea', en: '🇰🇷 Only in Korea', ko: '🇰🇷 한국 체험' },
  { id: 'country', en: '🌏 Holidays', ko: '🌏 나라별 명절' },
  { id: 'group', en: '🏆 Group vs group', ko: '🏆 그룹 대항' },
  { id: 'mine', en: 'Joined', ko: '내 신청' },
]

export default function Events() {
  const { data, me, tx, L, go } = useApp()
  const [f, setF] = useState('all')
  if (!data) return <div className="screen"><Loading /><TabBar current="events" /></div>
  const myG = data.myGroups?.find((g) => !g.mentoring)
  // Open events first, soonest first; ended / cancelled ones at the bottom.
  let list = [...data.events].sort((a, b) => (b.status === 'open') - (a.status === 'open') || a.start - b.start)
  if (f === 'mine') list = list.filter((e) => e.iJoined)
  else if (f !== 'all') list = list.filter((e) => e.cat === f)
  const mine = myG && f === 'all' ? list.filter((e) => e.status === 'open' && e.country === myG.country) : []

  return (
    <>
      <div className="screen with-tabs">
        <div>
          <h1 className="h1">{tx('Events', '이벤트')}</h1>
          <p className="sub">{tx('Things you can only do in Korea, holidays from every country, and group-vs-group games. Join with a small fee.', '한국에서만 할 수 있는 체험, 나라별 명절, 그룹 대항전. 참가비를 내고 신청해요.')}</p>
        </div>
        <div className="chips scroll">
          {FILTERS.map((x) => (
            <button key={x.id} className="chip" aria-pressed={f === x.id} onClick={() => setF(x.id)}>{tx(x.en, x.ko)}</button>
          ))}
        </div>
        {mine.length > 0 && (
          <section className="section">
            <h2 className="h3">{flagOf(myG)} {tx(`From ${COUNTRIES[myG.country].en}`, `우리 나라 행사 · ${COUNTRIES[myG.country].ko}`)}</h2>
            <div className="list">{mine.map((e) => <EventCard key={e.id} e={e} />)}</div>
          </section>
        )}
        <div className="list">
          {list.length === 0 && <p className="empty">{tx('No events here yet.', '아직 이벤트가 없어요.')}</p>}
          {list.filter((e) => !mine.includes(e)).map((e) => <EventCard key={e.id} e={e} />)}
        </div>
        <div className="card rules-card">
          <b>{tx('How events work', '이벤트는 이렇게 운영돼요')}</b>
          <ul>
            <li>{tx('Korean mentors and the Eoullim team host. Anyone can join.', '한국인 멘토와 어울림 운영팀이 열고, 누구나 참가해요.')}</li>
            <li>{tx(`The fee pays for the event; Eoullim keeps ${data.rules.EVENT_RATE * 100}% to run the service.`, `참가비는 행사 비용에 쓰이고, 어울림이 운영 수수료 ${data.rules.EVENT_RATE * 100}%를 받아요.`)}</li>
            <li>{tx(`Free cancellation until ${data.rules.CANCEL_FREE_D} days before.`, `행사 ${data.rules.CANCEL_FREE_D}일 전까지 무료 취소.`)}</li>
            <li>{tx('Not enough people 2 days before → cancelled, full refund.', '2일 전까지 최소 인원이 안 모이면 자동 취소·전액 환불.')}</li>
          </ul>
          <span className="small">{L(['Groups are always free. Events are how Eoullim earns.', '그룹은 언제나 무료예요. 어울림은 이벤트로 수익을 내요.'])}</span>
        </div>
      </div>
      {me?.admin && <Fab onClick={() => go('eventNew')} label={tx('Open an event', '이벤트 열기')} />}
      <TabBar current="events" />
    </>
  )
}

export function EventDetail({ id }) {
  const { data, me, tx, call, go, snap, showToast } = useApp()
  const gn = useGroupName()
  const fmt = useDate()
  const [paying, setPaying] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!data) return <div className="screen"><Loading /></div>
  const e = data.events.find((x) => x.id === id)
  if (!e) {
    return (
      <div className="screen">
        <TopBar title="" />
        <p className="empty">{tx('This event was removed.', '없어진 이벤트예요.')}</p>
      </div>
    )
  }
  const rate = data.rules.EVENT_RATE
  const open = e.status === 'open'
  const full = e.joined >= e.cap
  const lateCancel = data.now > e.start - data.rules.CANCEL_FREE_D * 864e5
  const run = async (action, msg) => {
    setBusy(true)
    try {
      await call(action, { eid: e.id, snap })
      showToast(msg)
      setPaying(false)
    } catch {
      /* toast shown */
    }
    setBusy(false)
  }
  const host = e.hostType === 'eoullim' ? { nick: tx('Eoullim team', '어울림 운영팀'), avatar: '🌙', color: 6 } : e.host

  return (
    <div className="screen">
      <TopBar title={tx('Event', '이벤트')} />
      <div className="event-hero">
        <span className="event-emoji big" aria-hidden="true">{e.emoji}</span>
        <div className="tags"><CatTag e={e} /><EventStatus e={e} />{e.seed && <span className="tag gray">{tx('Example', '예시')}</span>}</div>
        <Tr text={e.title} as="h1" className="h2" block />
      </div>
      <div className="byline">
        <Avatar snap={host} size={32} />
        <span className="col">
          <span className="byline-top"><b>{host?.nick || tx('Mentor', '멘토')}</b><span className="tag manager">🇰🇷 {e.hostType === 'eoullim' ? tx('Host', '주최') : tx('Mentor host', '멘토 진행')}</span></span>
        </span>
      </div>

      <div className="card info-list">
        <span>📅 <b>{fmt(e.date, e.time)}</b></span>
        <span>📍 <Tr text={e.place} /></span>
        <span>💳 <b>{e.fee ? wonFmt(e.fee) : tx('Free', '무료')}</b> {e.fee ? <span className="small">· {tx('per person', '1인')}</span> : null}</span>
        <span>👥 {tx(`${e.joined} of ${e.cap} · runs with ${e.min}+`, `${e.cap}명 중 ${e.joined}명 · 최소 ${e.min}명`)}</span>
        <div className="progress-dark"><span style={{ width: `${Math.min(100, (e.joined / e.cap) * 100)}%` }} /></div>
      </div>

      {e.body && <Tr text={e.body} as="p" className="post-body" block />}

      {e.groups.length > 0 && (
        <section className="section">
          <h2 className="h3">{e.cat === 'group' ? tx('Groups taking part', '참가하는 조') : tx('Groups coming', '함께 가는 조')}</h2>
          <div className="tags">
            {e.groups.map((g) => (
              <span key={g.id} className="tag gray">{flagOf(g)} {gn(g)} · {g.count}</span>
            ))}
          </div>
        </section>
      )}
      {e.people.length > 0 && (
        <div className="row" style={{ gap: 0 }}>
          {e.people.map((p, i) => <span key={i} style={{ marginLeft: i ? -8 : 0 }}><Avatar snap={p} size={30} /></span>)}
          {e.joined > e.people.length && <span className="small" style={{ marginLeft: 8 }}>+{e.joined - e.people.length}</span>}
        </div>
      )}

      {open && !e.iJoined && !paying && (
        <button className="btn" disabled={busy || full} onClick={() => (e.fee ? setPaying(true) : run('eventJoin', tx('You’re in! 🎉', '참가 신청했어요! 🎉')))}>
          {full ? tx('Full', '마감') : e.fee ? tx(`Join · pay ${wonFmt(e.fee)}`, `${wonFmt(e.fee)} 결제하고 참가`) : tx('Join for free', '무료로 참가')}
        </button>
      )}
      {paying && (
        <div className="card pay-card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <b>{tx('Payment', '결제')}</b>
            <span className="demo-pill">DEMO</span>
          </div>
          <div className="pay-line"><span><Tr text={e.title} /></span><b>{wonFmt(e.fee)}</b></div>
          <span className="small">{tx(`Includes Eoullim service fee ${rate * 100}% (${wonFmt(Math.round(e.fee * rate))}). Free cancellation until ${data.rules.CANCEL_FREE_D} days before.`, `어울림 운영 수수료 ${rate * 100}%(${wonFmt(Math.round(e.fee * rate))}) 포함. 행사 ${data.rules.CANCEL_FREE_D}일 전까지 무료 취소.`)}</span>
          <span className="small">{tx('Demo: no real payment. In the real service a payment company handles the card.', '데모: 실제로 결제되지 않아요. 실제 서비스에서는 결제대행사가 카드를 처리해요.')}</span>
          <button className="btn" disabled={busy} onClick={() => run('eventJoin', tx('Paid (demo) — see you there! 🎉', '결제 완료 (데모) — 그날 만나요! 🎉'))}>
            {busy ? tx('Paying…', '결제 중…') : tx(`Pay ${wonFmt(e.fee)}`, `${wonFmt(e.fee)} 결제하기`)}
          </button>
          <button className="btn line sm" onClick={() => setPaying(false)}>{tx('Cancel', '취소')}</button>
        </div>
      )}
      {e.iJoined && (
        <div className="card joined-card">
          <b>✓ {tx('You’re going!', '참가 신청 완료!')}</b>
          <span className="small">{tx('Your group chat is a good place to plan together.', '그룹방에서 같이 갈 사람과 약속을 잡아 보세요.')}</span>
          {open && (
            <button
              className="btn line xs"
              disabled={busy || lateCancel}
              onClick={() => window.confirm(tx('Cancel and get a full refund?', '참가를 취소하고 전액 환불받을까요?')) && run('eventLeave', tx('Cancelled · refunded', '취소했어요 · 환불됨'))}
            >
              {lateCancel ? tx('Free cancellation has ended', '무료 취소 기간이 지났어요') : tx('Cancel · full refund', '취소 · 전액 환불')}
            </button>
          )}
        </div>
      )}

      {(e.mine || me?.admin) && !e.seed && (
        <div className="card admin-panel">
          <b>🇰🇷 {tx('Host tools', '진행자 도구')}</b>
          <span className="small">
            {tx(
              `Fees so far ${wonFmt(e.fee * e.joined)} · Eoullim ${rate * 100}% ${wonFmt(Math.round(e.fee * rate) * e.joined)} · host budget ${wonFmt((e.fee - Math.round(e.fee * rate)) * e.joined)}`,
              `지금까지 참가비 ${wonFmt(e.fee * e.joined)} · 어울림 ${rate * 100}% ${wonFmt(Math.round(e.fee * rate) * e.joined)} · 진행 예산 ${wonFmt((e.fee - Math.round(e.fee * rate)) * e.joined)}`,
            )}
          </span>
          {open && (
            <button className="btn line xs" disabled={busy} onClick={() => window.confirm(tx('Cancel this event and refund everyone?', '이벤트를 취소하고 모두에게 환불할까요?')) && run('eventCancel', tx('Event cancelled · everyone refunded', '이벤트 취소 · 전원 환불'))}>
              {tx('Cancel event', '이벤트 취소')}
            </button>
          )}
        </div>
      )}
      <button className="linkish" style={{ alignSelf: 'center' }} onClick={() => go('events')}>{tx('All events', '이벤트 전체 보기')}</button>
    </div>
  )
}

export function EventNew() {
  const { data, me, tx, L, call, go, snap, showToast } = useApp()
  const today = new Date((data?.now || Date.now()) + 9 * 3600e3).toISOString().slice(0, 10)
  const [cat, setCat] = useState('korea')
  const [country, setCountry] = useState('vn')
  const [emoji, setEmoji] = useState('🎉')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [date, setDate] = useState(today)
  const [time, setTime] = useState('18:00')
  const [place, setPlace] = useState('')
  const [fee, setFee] = useState(10000)
  const [cap, setCap] = useState(10)
  const [min, setMin] = useState(4)
  const [busy, setBusy] = useState(false)
  if (!data) return <div className="screen"><Loading /></div>
  if (!me?.admin) {
    return (
      <div className="screen">
        <TopBar title={tx('Open an event', '이벤트 열기')} />
        <p className="empty">{tx('Korean mentors open events. Enter your mentor code in Settings.', '이벤트는 한국인 멘토가 열어요. 설정에서 멘토 코드를 넣어 주세요.')}</p>
      </div>
    )
  }
  const rate = data.rules.EVENT_RATE
  const n = Number(fee)
  const ok = title.trim() && place.trim() && date >= today && Number.isInteger(n) && n >= 0 && n % 100 === 0 && Number(cap) >= 2 && Number(min) >= 1 && Number(min) <= Number(cap)
  const submit = async () => {
    setBusy(true)
    try {
      const r = await call('eventCreate', { cat, country, emoji, title, body, date, time, place, fee: n, cap: Number(cap), min: Number(min), snap })
      showToast(tx('Event opened!', '이벤트를 열었어요!'))
      go('event', r.result.id)
    } catch {
      /* toast shown */
    }
    setBusy(false)
  }
  return (
    <div className="screen">
      <TopBar title={tx('Open an event', '이벤트 열기')} />
      <div className="seg sm">
        {Object.entries(EVENT_CATS).map(([id, c]) => (
          <button key={id} aria-pressed={cat === id} onClick={() => setCat(id)}>{c.icon} {L(c)}</button>
        ))}
      </div>
      <p className="small">
        {cat === 'korea' && tx('Something you can only do in Korea — saju, a ghost-story walk, hanbok, temple stay…', '한국에서만 할 수 있는 것 — 사주, 귀신 골목 투어, 한복, 템플스테이…')}
        {cat === 'country' && tx('A holiday that only one country celebrates. That country’s groups help host.', '그 나라만 챙기는 날. 그 나라 조가 같이 준비해요.')}
        {cat === 'group' && tx('Groups compete together — sports day, quiz night…', '조끼리 겨뤄요 — 체육대회, 퀴즈 나이트…')}
      </p>
      {cat === 'country' && (
        <label className="field">
          <span className="label">{tx('Country', '나라')}</span>
          <select className="select" value={country} onChange={(e) => setCountry(e.target.value)}>
            {Object.entries(COUNTRIES).filter(([id]) => id !== 'other').map(([id, c]) => <option key={id} value={id}>{c.flag} {L(c)}</option>)}
          </select>
        </label>
      )}
      <div className="field">
        <span className="label">{tx('Icon', '아이콘')}</span>
        <div className="emoji-grid">
          {EVENT_EMOJI.map((x) => <button key={x} aria-pressed={emoji === x} onClick={() => setEmoji(x)} aria-label={x}>{x}</button>)}
        </div>
      </div>
      <label className="field">
        <span className="label">{tx('Title', '제목')}</span>
        <input className="input" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder={tx('e.g. Saju reading at a Hongdae café', '예: 홍대 사주 카페 체험')} />
      </label>
      <label className="field">
        <span className="label">{tx('What happens', '무엇을 하나요')}</span>
        <textarea className="textarea" value={body} maxLength={1000} onChange={(e) => setBody(e.target.value)} />
      </label>
      <div className="meetup-fields">
        <label className="field"><span className="label">{tx('Date', '날짜')}</span><input className="input" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="field"><span className="label">{tx('Time', '시간')}</span><input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
        <label className="field" style={{ gridColumn: '1 / -1' }}><span className="label">{tx('Meeting place', '모이는 곳')}</span><input className="input" value={place} maxLength={60} onChange={(e) => setPlace(e.target.value)} placeholder={tx('e.g. Exit 5, Gyeongbokgung Station', '예: 경복궁역 5번 출구')} /></label>
        <label className="field"><span className="label">{tx('Fee (won)', '참가비 (원)')}</span><input className="input" type="number" min={0} step={100} value={fee} onChange={(e) => setFee(e.target.value)} /></label>
        <label className="field"><span className="label">{tx('Max people', '최대 인원')}</span><input className="input" type="number" min={2} max={100} value={cap} onChange={(e) => setCap(e.target.value)} /></label>
        <label className="field"><span className="label">{tx('Min people', '최소 인원')}</span><input className="input" type="number" min={1} value={min} onChange={(e) => setMin(e.target.value)} /></label>
      </div>
      {n > 0 && Number.isInteger(n) && (
        <div className="card">
          <span className="small">{tx('Per person', '1인당')}: {wonFmt(n)} → {tx(`Eoullim ${rate * 100}%`, `어울림 ${rate * 100}%`)} {wonFmt(Math.round(n * rate))} · {tx('your event budget', '진행 예산')} {wonFmt(n - Math.round(n * rate))}</span>
        </div>
      )}
      {hasPrivateInfo(title + ' ' + body + ' ' + place) && <p className="warn">🔒 {tx('Contact info will be hidden as ***.', '연락처는 ***로 가려져요.')}</p>}
      <button className="btn" disabled={busy || !ok} onClick={submit}>{busy ? tx('Opening…', '여는 중…') : tx('Open event', '이벤트 열기')}</button>
    </div>
  )
}
