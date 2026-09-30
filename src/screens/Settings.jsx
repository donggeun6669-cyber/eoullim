import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { TopBar } from '../components/ui.jsx'
import { ApiError, currentKey, normalizeKey } from '../lib/api.js'
import { useApp } from '../store.jsx'

export default function Settings() {
  const { tx, lang, setLang, me, started, restore, resetDevice, call, showToast, errorText, go } = useApp()
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
        <span className="label">{tx('Language', '언어')}</span>
        <div className="seg sm">
          <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
          <button aria-pressed={lang === 'ko'} onClick={() => setLang('ko')}>한국어</button>
        </div>
      </div>

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
          <b>🇰🇷 {tx('Korean manager', '한국인 관리자')}</b>
          {me?.admin ? (
            <>
              <span className="small">{tx('Manager mode is on for this phone.', '이 기기는 관리자 모드예요.')}</span>
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                <button className="btn soft xs" onClick={() => go('admin')}>{tx('Open manager page', '관리자 화면')}</button>
                <button className="btn line xs" onClick={() => call('adminLeave').then(() => showToast(tx('Manager mode off', '관리자 모드를 껐어요'))).catch(() => {})}>{tx('Turn off', '끄기')}</button>
              </div>
            </>
          ) : (
            <>
              <span className="small">{tx('Managers get an invite code from the operator, offline. It is the only kind of sign-in in Eoullim.', '관리자는 운영자에게 오프라인으로 초대 코드를 받아요. 어울림의 유일한 「인증」이에요.')}</span>
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                <input className="input" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder={tx('Invite code', '초대 코드')} autoCapitalize="characters" autoComplete="off" />
                <button
                  className="btn xs"
                  disabled={busy || !adminCode.trim()}
                  onClick={async () => {
                    setBusy(true)
                    try {
                      await call('adminClaim', { code: adminCode.trim().toUpperCase() })
                      showToast(tx('Manager mode on 🇰🇷', '관리자 모드 켜짐 🇰🇷'))
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
          <b>{tx('Start over on this phone', '이 기기에서 새로 시작')}</b>
          <span className="small">{tx('Makes a new code with 30 new points. Your current points stay with the old code.', '새 코드와 새 30포인트로 시작해요. 지금 포인트는 옛 코드에 남아요.')}</span>
          <button
            className="btn line xs"
            style={{ marginTop: 8 }}
            onClick={async () => {
              if (!window.confirm(tx('Did you save your current recovery code? Without it the points are gone.', '지금 복구 코드를 저장했나요? 없으면 포인트를 되찾을 수 없어요.'))) return
              await resetDevice().catch(() => {})
              showToast(tx('New start — 30 P', '새로 시작 — 30P'))
            }}
          >
            {tx('Start over', '새로 시작')}
          </button>
        </div>
      )}

      <button className="linkish" style={{ alignSelf: 'center' }} onClick={() => go('about')}>{tx('About this project', '프로젝트 소개')}</button>
    </div>
  )
}
