import { useState } from 'react'
import { Loading, TopBar, flagOf, useGroupName } from '../components/ui.jsx'
import { QuestionCard } from './Solve.jsx'
import { EventCard } from './Events.jsx'
import { useApp } from '../store.jsx'

const won = (n) => '₩' + Number(n || 0).toLocaleString()

// Korean mentor page: look after groups, host events, help on the community board.
export default function Admin() {
  const { data, me, tx, go, call, snap, showToast } = useApp()
  const gn = useGroupName()
  const [tab, setTab] = useState('groups')
  const [busy, setBusy] = useState(false)
  if (!data) return <div className="screen"><Loading /></div>
  if (!me?.admin) {
    return (
      <div className="screen">
        <TopBar title={tx('Mentor', '멘토')} />
        <p className="empty">{tx('Mentor mode is off. Enter an invite code in Settings.', '멘토 모드가 꺼져 있어요. 설정에서 초대 코드를 넣으세요.')}</p>
        <button className="btn soft sm" onClick={() => go('settings')}>{tx('Settings', '설정')}</button>
      </div>
    )
  }
  const qs = data.questions
  const noMentor = data.groups.filter((g) => !g.hasMentor)
  const mine = data.groups.filter((g) => g.mentoring)
  const myEvents = data.events.filter((e) => e.mine)
  const decide = qs.filter((q) => q.status === 'review')
  const kstyle = qs.filter((q) => q.tag === 'kstyle' && q.status === 'open' && !q.answers.some((a) => a.admin))
  const unanswered = qs.filter((q) => q.status === 'open' && q.answers.length === 0).sort((a, b) => a.created - b.created)
  const reported = [
    ...qs.filter((q) => q.hidden || q.reports > 0 || q.answers.some((a) => a.hidden || a.reports > 0)).map((q) => ({ t: 'q', item: q })),
    ...data.posts.filter((p) => p.hidden || p.reports > 0 || p.comments.some((c) => c.hidden || c.reports > 0)).map((p) => ({ t: 'p', item: p })),
  ]
  const TABS = [
    ['groups', tx('Groups', '그룹'), noMentor.length],
    ['events', tx('Events', '이벤트'), 0],
    ['questions', tx('Questions', '질문'), decide.length + kstyle.length],
    ['reported', tx('Reports', '신고'), reported.length],
  ]
  const s = data.adminStats
  const myShare = s?.admins.find((a) => a.pid === me.pid)

  const take = async (gid) => {
    setBusy(true)
    try {
      await call('mentorTake', { gid, snap })
      showToast(tx('You are now this group’s mentor 🇰🇷', '이 그룹의 멘토가 됐어요 🇰🇷'))
      go('group')
    } catch {
      /* toast shown */
    }
    setBusy(false)
  }

  return (
    <div className="screen">
      <TopBar title={`🇰🇷 ${tx('Mentor page', '멘토 화면')}`} />

      <div className="card pool-card">
        <b>{tx('Revenue (demo)', '수익 구조 (데모)')}</b>
        <div className="stat-grid">
          <div className="stat"><b>{won(s.eventWon)}</b><span>{tx('Event fees', '이벤트 참가비')}</span></div>
          <div className="stat"><b>{won(s.commission)}</b><span>{tx(`Eoullim ${s.eventRate * 100}% · main`, `어울림 수수료 ${s.eventRate * 100}% · 메인`)}</span></div>
          <div className="stat"><b>{won(s.chargedWon)}</b><span>{tx('Points sold · second', '포인트 판매 · 보조')}</span></div>
          <div className="stat"><b>{won(myShare?.won)}</b><span>{tx(`My share of the ${s.rate * 100}% mentor pool`, `멘토 풀 ${s.rate * 100}% 중 내 몫`)}</span></div>
        </div>
        <span className="small">
          {tx(
            `Groups are free. Eoullim earns from event fees (${s.eventRate * 100}%) and points. ${s.rate * 100}% of that goes to mentors by work done (groups, events, answers, moderation). My work: ${myShare?.work || 0} of ${s.totalWork}.`,
            `그룹은 무료. 어울림은 이벤트 수수료(${s.eventRate * 100}%)와 포인트로 벌고, 그중 ${s.rate * 100}%를 멘토가 실적(그룹·이벤트·답변·관리)대로 나눠요. 내 실적 ${myShare?.work || 0} / 전체 ${s.totalWork}.`,
          )}
        </span>
      </div>

      <div className="seg sm">
        {TABS.map(([id, label, n]) => (
          <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}{n ? ` ${n}` : ''}</button>
        ))}
      </div>

      {tab === 'groups' && (
        <>
          <p className="small">{tx(`Each group: 3–4 students from one country + you. Up to ${data.rules.MENTOR_MAX} groups per mentor.`, `그룹마다 같은 나라 학생 3~4명 + 멘토 1명. 멘토 한 명당 ${data.rules.MENTOR_MAX}개 그룹까지.`)}</p>
          {mine.length > 0 && <h2 className="h3">{tx('My groups', '내가 맡은 그룹')}</h2>}
          <div className="list">
            {mine.map((g) => (
              <button key={g.id} className="card row-link" onClick={() => go('group')}>
                <span style={{ fontSize: 24 }}>{flagOf(g)}</span>
                <span className="col"><b>{gn(g)}</b><span className="small">{tx(`${g.members} students`, `학생 ${g.members}명`)}</span></span>
              </button>
            ))}
          </div>
          <h2 className="h3">{tx('Groups waiting for a mentor', '멘토를 기다리는 그룹')}</h2>
          <div className="list">
            {noMentor.length === 0 && <p className="empty">{tx('Every group has a mentor 🎉', '모든 그룹에 멘토가 있어요 🎉')}</p>}
            {noMentor.map((g) => (
              <div key={g.id} className="card row-link">
                <span style={{ fontSize: 24 }}>{flagOf(g)}</span>
                <span className="col"><b>{gn(g)}</b><span className="small">{tx(`${g.members} students`, `학생 ${g.members}명`)}</span></span>
                <button className="btn xs" disabled={busy} onClick={() => take(g.id)}>{tx('Mentor this group', '멘토 맡기')}</button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'events' && (
        <>
          <button className="btn" onClick={() => go('eventNew')}>+ {tx('Open an event', '이벤트 열기')}</button>
          <p className="small">{tx('Ideas: saju or tarot café, Sindang-dong ghost-story walk, hanbok palace walk, a holiday only one country celebrates, group sports day.', '아이디어: 사주·타로 카페, 신당동 귀신 골목 투어, 한복 고궁 산책, 한 나라만 챙기는 명절, 그룹 대항 체육대회.')}</p>
          <h2 className="h3">{tx('Events I host', '내가 연 이벤트')}</h2>
          <div className="list">
            {myEvents.length === 0 && <p className="empty">{tx('None yet.', '아직 없어요.')}</p>}
            {myEvents.map((e) => <EventCard key={e.id} e={e} />)}
          </div>
        </>
      )}

      {tab === 'questions' && (
        <>
          <h2 className="h3">{tx('Decide (7 days, no adoption)', '결정 (7일 미채택)')}</h2>
          <div className="list">
            {decide.length === 0 && <p className="empty">{tx('All clear 🎉', '처리할 일 없음 🎉')}</p>}
            {decide.map((q) => <QuestionCard key={q.id} q={q} />)}
          </div>
          <h2 className="h3">{tx('Korean-style questions', '한국식 질문')}</h2>
          <div className="list">
            {kstyle.length === 0 && <p className="empty">{tx('All clear 🎉', '처리할 일 없음 🎉')}</p>}
            {kstyle.map((q) => <QuestionCard key={q.id} q={q} />)}
          </div>
          <h2 className="h3">{tx('No answer yet', '아직 답 없음')}</h2>
          <div className="list">{unanswered.map((q) => <QuestionCard key={q.id} q={q} />)}</div>
        </>
      )}

      {tab === 'reported' && (
        <div className="list">
          <p className="small">{tx('3 reports hide an item automatically until you check it.', '신고 3건이면 확인 전까지 자동으로 가려져요.')}</p>
          {reported.length === 0 && <p className="empty">{tx('No reports 🎉', '신고 없음 🎉')}</p>}
          {reported.map(({ t, item }) => (
            <button key={item.id} className="card q-card" onClick={() => go(t === 'q' ? 'q' : 'post', item.id)}>
              <span className="tags">
                <span className="tag gray">{t === 'q' ? tx('Question', '질문') : tx('Post', '글')}</span>
                {item.hidden && <span className="tag coral">{tx('Hidden', '가려짐')}</span>}
                {item.reports > 0 && <span className="tag">🚩 {item.reports}</span>}
              </span>
              <b className="q-title">{item.title}</b>
              <span className="small">{tx('Includes reported answers or comments', '신고된 답변·댓글 포함')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
