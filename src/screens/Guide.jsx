import { useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { TopBar } from '../components/ui.jsx'
import { KB, searchKB } from '../data/bot.js'
import { PROGRAMS } from '../data/programs.js'
import { useApp } from '../store.jsx'

function Entry({ e, open, onToggle }) {
  const { L, tx, go } = useApp()
  return (
    <div className="card guide-entry">
      <button className="guide-head" onClick={onToggle} aria-expanded={open}>
        <span style={{ fontSize: 22 }}>{e.icon}</span>
        <b style={{ flex: 1, textAlign: 'left' }}>{L(e.topic)}</b>
        <Icon name="chevron" size={18} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} />
      </button>
      {open && (
        <>
          <p className="kb-answer">{L(e.a)}</p>
          {e.note && <p className="small">⚠️ {L(e.note)}</p>}
          <div className="list" style={{ gap: 4 }}>
            {e.sources.map((s) => (
              <a key={s.url} className="link-out" href={s.url} target="_blank" rel="noreferrer">
                <Icon name="external" size={14} /> {s.title}
              </a>
            ))}
          </div>
          <button className="btn soft xs" onClick={() => go('ask')}>{tx('Still stuck? Ask people', '그래도 모르겠으면 사람에게 물어보기')}</button>
        </>
      )}
    </div>
  )
}

export default function Guide() {
  const { tx, L } = useApp()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const [tab, setTab] = useState('topics')
  const hit = useMemo(() => (q.trim().length >= 2 ? searchKB(q) : null), [q])
  const list = hit ? [hit.best, ...hit.related].filter(Boolean) : KB

  return (
    <div className="screen">
      <TopBar title={tx('Official SKKU guide', '성대 공식 안내')} sub={tx('Free · every answer has its source', '무료 · 모든 답에 출처')} />
      <div className="search">
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx('Search: ARC, insurance, bank, library…', '검색: 외국인등록, 보험, 은행, 도서관…')} aria-label={tx('Search the guide', '안내 검색')} />
      </div>
      {!hit && (
        <div className="seg sm">
          <button aria-pressed={tab === 'topics'} onClick={() => setTab('topics')}>{tx('Topics', '주제')}</button>
          <button aria-pressed={tab === 'programs'} onClick={() => setTab('programs')}>{tx('Support programs', '지원 프로그램')}</button>
        </div>
      )}
      {hit && list.length === 0 && <p className="empty">{tx('Not in the official guide. Ask people instead — we don’t guess.', '공식 안내에 없어요. 추측하지 않고 사람에게 넘겨요.')}</p>}
      {(hit || tab === 'topics') && (
        <div className="list">
          {list.map((e) => (
            <Entry key={e.id} e={e} open={open === e.id || (hit && e === hit.best && open == null)} onToggle={() => setOpen(open === e.id ? '' : e.id)} />
          ))}
        </div>
      )}
      {!hit && tab === 'programs' && (
        <div className="list">
          {PROGRAMS.map((p) => (
            <div key={p.id} className="card guide-entry">
              <div className="row" style={{ gap: 10 }}>
                <span style={{ fontSize: 22 }}>{p.icon}</span>
                <span className="col">
                  <b>{L(p.name)}</b>
                  <span className="small">{L(p.org)}</span>
                </span>
              </div>
              <p className="kb-answer">{L(p.desc)}</p>
              <p className="small"><b>{tx('Who', '대상')}</b> · {L(p.who)}</p>
              <p className="small"><b>{tx('How', '방법')}</b> · {L(p.how)}</p>
              <a className="link-out" href={p.url} target="_blank" rel="noreferrer"><Icon name="external" size={14} /> {tx('Official page', '공식 페이지')}</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
