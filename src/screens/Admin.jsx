import { useState } from 'react'
import { Loading, TopBar } from '../components/ui.jsx'
import { QuestionCard } from './Solve.jsx'
import { useApp } from '../store.jsx'

export default function Admin() {
  const { data, me, tx, go } = useApp()
  const [tab, setTab] = useState('decide')
  if (!data) return <div className="screen"><Loading /></div>
  if (!me?.admin) {
    return (
      <div className="screen">
        <TopBar title={tx('Manager', '관리자')} />
        <p className="empty">{tx('Manager mode is off. Enter an invite code in Settings.', '관리자 모드가 꺼져 있어요. 설정에서 초대 코드를 넣으세요.')}</p>
        <button className="btn soft sm" onClick={() => go('settings')}>{tx('Settings', '설정')}</button>
      </div>
    )
  }
  const qs = data.questions
  const queues = {
    decide: qs.filter((q) => q.status === 'review'),
    kstyle: qs.filter((q) => q.tag === 'kstyle' && q.status === 'open' && !q.answers.some((a) => a.admin)),
    unanswered: qs.filter((q) => q.status === 'open' && q.answers.length === 0).sort((a, b) => a.created - b.created),
    reported: [
      ...qs.filter((q) => q.hidden || q.reports > 0 || q.answers.some((a) => a.hidden || a.reports > 0)).map((q) => ({ t: 'q', item: q })),
      ...data.posts.filter((p) => p.hidden || p.reports > 0 || p.comments.some((c) => c.hidden || c.reports > 0)).map((p) => ({ t: 'p', item: p })),
    ],
  }
  const TABS = [
    ['decide', tx('Decide', '결정'), queues.decide.length],
    ['kstyle', tx('Korean-style', '한국식'), queues.kstyle.length],
    ['unanswered', tx('No answer', '무답변'), queues.unanswered.length],
    ['reported', tx('Reports', '신고'), queues.reported.length],
  ]
  const s = data.adminStats
  const mine = s?.admins.find((a) => a.pid === me.pid)

  return (
    <div className="screen">
      <TopBar title={`🇰🇷 ${tx('Manager', '관리자')}`} />

      <div className="card pool-card">
        <b>{tx('Manager revenue pool (demo)', '관리자 수익 풀 (데모)')}</b>
        <div className="row" style={{ gap: 8 }}>
          <div className="stat"><b>₩{s.chargedWon.toLocaleString()}</b><span>{tx('Points sold', '포인트 판매')}</span></div>
          <div className="stat"><b>₩{s.pool.toLocaleString()}</b><span>{tx(`Pool ${s.rate * 100}%`, `풀 ${s.rate * 100}%`)}</span></div>
          <div className="stat"><b>₩{(mine?.won || 0).toLocaleString()}</b><span>{tx('My share', '내 몫')}</span></div>
        </div>
        <span className="small">
          {tx(`Shared by work done: adopted answers, refunds, moderation. My work: ${mine?.work || 0} of ${s.totalWork}. Paid by the operator — not by cashing out points.`, `처리 실적(채택된 답변·환불·게시판 관리)으로 나눠요. 내 실적 ${mine?.work || 0} / 전체 ${s.totalWork}. 포인트 현금화가 아니라 운영자가 따로 지급해요.`)}
        </span>
      </div>

      <div className="seg sm">
        {TABS.map(([id, label, n]) => (
          <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}{n ? ` ${n}` : ''}</button>
        ))}
      </div>
      <p className="small">
        {tab === 'decide' && tx('7 days, no adoption: adopt the most helpful answer for the asker, or refund.', '7일 동안 채택 없음: 가장 도움된 답을 대신 채택하거나 환불하세요.')}
        {tab === 'kstyle' && tx('Questions only a Korean can answer well. Your answer gets a manager badge.', '한국인이라야 잘 답할 수 있는 질문이에요. 답에 관리자 배지가 붙어요.')}
        {tab === 'unanswered' && tx('Oldest first. After 72h with no answer the points go back automatically.', '오래된 순. 72시간 동안 답이 없으면 자동 환불돼요.')}
        {tab === 'reported' && tx('3 reports hide an item automatically until you check it.', '신고 3건이면 확인 전까지 자동으로 가려져요.')}
      </p>

      <div className="list">
        {tab !== 'reported' && queues[tab].length === 0 && <p className="empty">{tx('All clear 🎉', '처리할 일 없음 🎉')}</p>}
        {tab !== 'reported' && queues[tab].map((q) => <QuestionCard key={q.id} q={q} />)}
        {tab === 'reported' && queues.reported.length === 0 && <p className="empty">{tx('No reports 🎉', '신고 없음 🎉')}</p>}
        {tab === 'reported' &&
          queues.reported.map(({ t, item }) => (
            <button key={item.id} className="card q-card" onClick={() => go(t === 'q' ? 'q' : 'post', item.id)}>
              <span className="tags">
                <span className="tag gray">{t === 'q' ? tx('Question', '질문') : tx('Post', '글')}</span>
                {item.hidden && <span className="tag coral">{tx('Hidden', '가려짐')}</span>}
                {item.reports > 0 && <span className="tag amber">🚩 {item.reports}</span>}
              </span>
              <b className="q-title">{item.title}</b>
              <span className="small">{tx('Includes reported answers or comments', '신고된 답변·댓글 포함')}</span>
            </button>
          ))}
      </div>
    </div>
  )
}
