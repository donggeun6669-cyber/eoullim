import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ApiError, currentKey, newKey, rpc, setKey } from './lib/api.js'
import { APP_LANGS, ERRORS } from './i18n.js'
import { lookup, sameLang, subscribe } from './lib/translate.js'

const Ctx = createContext(null)
const LS_PROFILE = 'eoullim-profile'
const LS_LANG = 'eoullim-lang'
const LS_STARTED = 'eoullim-started'
const LS_AUTOTR = 'eoullim-autotr'

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
  const [lang, setLangState] = useState(() => {
    const l = read(LS_LANG, null)
    if (APP_LANGS.some((x) => x.id === l)) return l
    // First visit: follow the phone's language if we support it.
    const nav = (navigator.language || 'en').toLowerCase().split('-')[0]
    const fil = nav === 'fil' ? 'tl' : nav
    return APP_LANGS.some((x) => x.id === fil) ? fil : 'en'
  })
  const [autoTr, setAutoTrState] = useState(() => read(LS_AUTOTR, true))
  const [trv, setTrv] = useState(0) // bumps when translations arrive → screens re-render
  useEffect(() => subscribe(() => setTrv((v) => v + 1)), [])
  const g = APP_LANGS.find((x) => x.id === lang)?.g || 'en'
  const [profile, setProfileState] = useState(() => read(LS_PROFILE, null))
  const [started, setStarted] = useState(() => read(LS_STARTED, false) && !!currentKey())
  const [data, setData] = useState(null)
  const [route, setRoute] = useState(parseHash)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // UI text: written in English + Korean. Other languages: English, machine-translated (cached on the phone).
  const tx = useCallback(
    (en, ko) => {
      if (lang === 'ko') return ko
      if (lang === 'en' || !en) return en
      const hit = lookup(en, g, 'ui')
      return hit ? hit.t : en
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, g, trv],
  )
  const L = useCallback(
    (pair) => (typeof pair === 'string' ? pair : Array.isArray(pair) ? tx(pair[0], pair[1]) : pair ? tx(pair.en ?? '', pair.ko ?? pair.en ?? '') : ''),
    [tx],
  )
  // User content (posts, chat, events): translated into my language when it is written in another one.
  // Returns { text, translated, original }.
  const tr = useCallback(
    (text) => {
      if (!autoTr || !text) return { text, translated: false, original: text }
      const hit = lookup(text, g)
      if (!hit || sameLang(hit.src, g) || hit.t === text) return { text, translated: false, original: text, pending: hit === null }
      return { text: hit.t, translated: true, original: text }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [autoTr, g, trv],
  )

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
  const setAutoTr = (v) => {
    setAutoTrState(v)
    write(LS_AUTOTR, v)
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

  const school = profile?.school || 'skku'
  const myGroup = data?.me?.group || null
  const value = {
    school, myGroup,
    lang, setLang, autoTr, setAutoTr, tr, tx, L, profile, setProfile, snap, started, start, restore, resetDevice,
    data, me: data?.me, call, refresh, route, go, back, toast, showToast, setToast, errorText,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
