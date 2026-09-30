import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ApiError, currentKey, newKey, rpc, setKey } from './lib/api.js'
import { ERRORS } from './i18n.js'

const Ctx = createContext(null)
const LS_PROFILE = 'eoullim-profile'
const LS_LANG = 'eoullim-lang'
const LS_STARTED = 'eoullim-started'

const read = (k, fallback) => {
  try {
    const v = localStorage.getItem(k)
    return v == null ? fallback : JSON.parse(v)
  } catch {
    return fallback
  }
}
const write = (k, v) => {
  try {
    if (v == null) localStorage.removeItem(k)
    else localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* private mode: keep it for this visit only */
  }
}

function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '')
  const [name, id] = h.split('/')
  return { name: name || '', id: id ? decodeURIComponent(id) : undefined }
}

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(() => read(LS_LANG, 'en'))
  const [profile, setProfileState] = useState(() => read(LS_PROFILE, null))
  const [started, setStarted] = useState(() => read(LS_STARTED, false) && !!currentKey())
  const [data, setData] = useState(null)
  const [route, setRoute] = useState(parseHash)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const tx = useCallback((en, ko) => (lang === 'ko' ? ko : en), [lang])
  const L = useCallback((pair) => (typeof pair === 'string' ? pair : Array.isArray(pair) ? (lang === 'ko' ? pair[1] : pair[0]) : pair?.[lang] ?? pair?.en ?? ''), [lang])

  const showToast = useCallback((text, kind = 'ok') => {
    clearTimeout(toastTimer.current)
    setToast({ text, kind })
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const errorText = useCallback((code) => L(ERRORS[code] || ERRORS.server), [L])

  // Every action returns the fresh board, so the screen always shows what the server holds.
  const call = useCallback(
    async (action, payload, { quiet } = {}) => {
      try {
        const json = await rpc(action, payload)
        setData(json)
        return json
      } catch (e) {
        const code = e instanceof ApiError ? e.code : 'server'
        if (!quiet) showToast(errorText(code), 'error')
        throw e
      }
    },
    [showToast, errorText],
  )

  const refresh = useCallback(() => call('state', {}, { quiet: true }).catch(() => {}), [call])

  const start = useCallback(async () => {
    if (!currentKey()) setKey(newKey())
    await call('hello')
    write(LS_STARTED, true)
    setStarted(true)
  }, [call])

  const restore = useCallback(
    async (code) => {
      const { exists } = await rpc('check', {}, code)
      if (!exists) throw new ApiError('no_device')
      setKey(code)
      write(LS_STARTED, true)
      setStarted(true)
      await call('state')
    },
    [call],
  )

  const resetDevice = useCallback(async () => {
    setKey(newKey())
    setData(null)
    await call('hello')
  }, [call])

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Load, then keep the board fresh while the app is open (other people post too).
  useEffect(() => {
    if (!started) return
    call('hello', {}, { quiet: true }).catch(() => {})
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, 8000)
    const onVis = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [started, call, refresh])

  const go = useCallback((name, id) => {
    window.location.hash = '#/' + name + (id ? '/' + encodeURIComponent(id) : '')
  }, [])
  const back = useCallback(
    (fallback = 'home') => {
      if (window.history.length > 1) window.history.back()
      else go(fallback)
    },
    [go],
  )

  const setLang = (l) => {
    setLangState(l)
    write(LS_LANG, l)
  }
  const setProfile = (p) => {
    setProfileState(p)
    write(LS_PROFILE, p)
  }
  // What appears next to my posts: only nickname + avatar, and only if I set a nickname.
  const snap = useMemo(
    () => (profile?.nick ? { nick: profile.nick, avatar: profile.avatar || '🐯', color: profile.color ?? 0 } : null),
    [profile],
  )

  const value = {
    lang, setLang, tx, L, profile, setProfile, snap, started, start, restore, resetDevice,
    data, me: data?.me, call, refresh, route, go, back, toast, showToast, setToast, errorText,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
