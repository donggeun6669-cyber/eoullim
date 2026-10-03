import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { TopBar } from '../components/ui.jsx'
import { ApiError, currentKey, normalizeKey } from '../lib/api.js'
import { useApp } from '../store.jsx'
import { APP_LANGS } from '../i18n.js'

export default function Settings() {
  const { tx, lang, setLang, autoTr, setAutoTr, switchDevice, profile, me, started, restore, startOver, call, showToast, errorText, go } = useApp()
  const [reveal, setReveal] = useState(false)
  const [code, setCode] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [busy, setBusy] = useState(false)
  const key = currentKey()

  const doRestore = async () => {
    const k = normalizeKey(code)
    if (!k) return showToast(errorText('bad_key'), 'error')
    setBusy(true)
    try {
      await restore(k)
      showToast(tx('Welcome back! Your points are here.', '돌아왔어요! 포인트를 되찾았어요.'))
      go('home')
    } catch (e) {
      showToast(errorText(e instanceof ApiError && e.code === 'no_device' ? 'bad_key' : e.code), 'error')
    }
    setBusy(false)
  }

  return (
    <div className="screen">
      <TopBar title={tx('Settings', '설정')} />

      <div className="field">
        <span className="label">🌐 {tx('Language', '언어')} · Language</span>
        <div className="lang-grid">
          {APP_LANGS.map((l) => (
            <button key={l.id} className="chip" aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>{l.label}</button>
          ))}
        </div>
        <span className="small">{tx('English and Korean are written by us; other languages are machine-translated.', '영어·한국어는 직접 쓴 글이고, 다른 언어는 기계 번역이에요.')}</span>
      </div>
      <label className="switch-row">
        <span>
          <b>{tx('Translate posts and chat live', '게시판·채팅 실시간 번역')}</b>
          <span className="small">{tx('Posts, comments, events and group chat appear in your language. Tap “show original” anytime.', '글·댓글·이벤트·그룹 채팅이 내 언어로 보여요. 언제든 「원문 보기」를 누를 수 있어요.')}</span>
        </span>
        <input type="checkbox" className="switch" checked={autoTr} onChange={(e) => setAutoTr(e.target.checked)} />
      </label>

      {started && key && (
        <div className="card key-card">
          <b><Icon name="key" size={18} /> {tx('Your recovery code', '내 복구 코드')}</b>
          <span className="small">{tx('There is no account. This code is the only way to get your points back on a new phone. Write it down or take a screenshot. Don’t share it.', '계정이 없어서, 새 기기에서 포인트를 되찾는 방법은 이 코드뿐이에요. 적어 두거나 캡처하세요. 남에게 알려 주지 마세요.')}</span>
          <div className="code-box">{reveal ? key : '••••-••••-••••'}</div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn soft xs" onClick={() => setReveal(!reveal)}>{reveal ? tx('Hide', '숨기기') : tx('Show', '보기')}</button>
            <button className="btn soft xs" onClick={() => navigator.clipboard?.writeText(key).then(() => showToast(tx('Copied', '복사했어요'))).catch(() => setReveal(true))}>
              <Icon name="copy" size={14} /> {tx('Copy', '복사')}
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <b>{tx('Use a recovery code', '복구 코드로 되찾기')}</b>
        <span className="small">{tx('Moved to a new phone or cleared your browser? Enter your code.', '기기를 바꿨거나 브라우저 기록을 지웠나요? 코드를 넣으세요.')}</span>
        <div className="row" style={{ gap: 8, marginTop: 8 }}>
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX-XXXX-XXXX" autoCapitalize="characters" autoComplete="off" />
          <button className="btn xs" disabled={busy || !code.trim()} onClick={doRestore}>{tx('Restore', '되찾기')}</button>
        </div>
        {started && <span className="small">{tx('This replaces the points on this phone. Save the current code first.', '이 기기의 지금 포인트와 바뀌어요. 지금 코드를 먼저 저장하세요.')}</span>}
      </div>

      {started && (
        <div className="card">
          <b>🇰🇷 {tx('Korean mentor', '한국인 멘토')}</b>
          {me?.mentor ? (
            <>
              <span className="small">{me.operator ? tx('Operator team — you can issue verification codes on the mentor page.', '운영팀 — 멘토 화면에서 인증 코드를 발급할 수 있어요.') : me.demoMentor ? tx('Demo mentor (not verified). In the real service a verification code is needed.', '데모 멘토 (인증 전). 실제 서비스에서는 인증 코드가 필요해요.') : tx('Verified Korean mentor ✓', '인증된 한국인 멘토 ✓')}</span>
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                {me.admin && <button className="btn soft xs" onClick={() => go('admin')}>{tx('Open mentor page', '멘토 화면')}</button>}
                <button className="btn line xs" onClick={() => call('adminLeave').then(() => showToast(tx('Mentor mode off', '멘토 모드를 껐어요'))).catch(() => {})}>{tx('Turn off', '끄기')}</button>
              </div>
            </>
          ) : (
            <>
              <span className="small">{tx('Korean mentors are verified: the Eoullim team checks a student ID in person and gives a personal code. It is the only kind of sign-in in Eoullim.', '한국인 멘토는 인증을 받아요. 어울림 운영팀이 학생증을 직접 확인하고 한 사람에게 하나씩 인증 코드를 드려요. 어울림의 유일한 「인증」이에요.')}</span>
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                <input className="input" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder={tx('Verification code', '인증 코드')} autoCapitalize="characters" autoComplete="off" />
                <button
                  className="btn xs"
                  disabled={busy || !adminCode.trim()}
                  onClick={async () => {
                    setBusy(true)
                    try {
                      await call('adminClaim', { code: adminCode.trim().toUpperCase() })
                      showToast(tx('Verified ✓ — mentor mode on 🇰🇷', '인증됐어요 ✓ — 멘토 모드 켜짐 🇰🇷'))
                      setAdminCode('')
                    } catch {
                      /* toast shown */
                    }
                    setBusy(false)
                  }}
                >
                  {tx('Enter', '확인')}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {started && (
        <div className="card">
          <b>🔁 {tx('Demo: switch person', '데모: 다른 사람 화면으로 보기')}</b>
          <span className="small">{tx('Show the international-student view and the Korean-student view on one phone. Both codes stay on this phone.', '한 휴대폰에서 외국인 학생 화면과 한국 학생 화면을 번갈아 보여 줄 때 써요. 두 기기 코드 모두 이 휴대폰에 남아요.')}</span>
          <button
            className="btn soft xs"
            style={{ marginTop: 8 }}
            onClick={async () => {
              const r = await switchDevice().catch(() => null)
              if (r === 'new') go('setup', profile?.who === 'kr' || me?.mentor ? 'intl' : 'kr')
              else if (r) {
                showToast(tx('Switched', '전환했어요'))
                go('home')
              }
            }}
          >
            {(() => {
              let has = false
              try {
                has = !!localStorage.getItem('eoullim-key-other')
              } catch {
                /* ignore */
              }
              return has ? tx('Switch to the other person', '다른 사람 화면으로 전환') : me?.mentor ? tx('Start a second person: international student', '두 번째 사람으로 시작: 외국인 유학생') : tx('Start a second person: Korean mentor', '두 번째 사람으로 시작: 한국인 멘토')
            })()}
          </button>
        </div>
      )}

      {started && (
        <div className="card">
          <b>↺ {tx('Reset — start from the beginning', '초기화 — 처음부터 다시')}</b>
          <span className="small">{tx('For demos: this phone (and the demo’s second person) leaves its group, mentor seat and events (paid ones are refunded), then the first screen opens. Posts stay. Your points stay with the old recovery code.', '데모용: 이 기기(와 데모로 전환한 다른 사람)가 그룹·멘토 자리·이벤트 신청에서 빠지고(결제는 환불) 첫 화면으로 돌아가요. 쓴 글은 남아요. 지금 포인트는 옛 복구 코드에 남아요.')}</span>
          <button
            className="btn line xs"
            style={{ marginTop: 8 }}
            onClick={async () => {
              if (!window.confirm(tx('Reset and go back to the first screen?', '초기화하고 첫 화면으로 돌아갈까요?'))) return
              await startOver()
              showToast(tx('Reset — start again', '초기화했어요 — 처음부터 시작하세요'))
            }}
          >
            {tx('Reset', '초기화')}
          </button>
        </div>
      )}

      <button className="linkish" style={{ alignSelf: 'center' }} onClick={() => go('about')}>{tx('About this project', '프로젝트 소개')}</button>
    </div>
  )
}
