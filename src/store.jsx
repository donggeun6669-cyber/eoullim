import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { PEOPLE, seedChats, seedRequests, seedPosts, seedQuestions, seedActivity, pickMentor, AUTO_REPLIES } from './data/people.js'

const KEY = 'eoullim-demo-v1'
const Ctx = createContext(null)

function initialState() {
  return {
    lang: 'en',
    uni: 'SKKU',
    onboarded: false,
    me: { name: '', role: 'mentee', langs: ['en'], country: '', topics: [], interests: [] },
    points: 1140,
    activity: seedActivity(),
    chats: seedChats(),
    requests: seedRequests(),
    posts: seedPosts(),
    questions: seedQuestions(),
    joinedGroups: [],
    likes: {},
    redeemed: [],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initialState(), ...JSON.parse(raw) }
  } catch {
    /* private mode or blocked storage: fall back to a fresh demo */
  }
  return initialState()
}

const now = () => new Date().toTimeString().slice(0, 5)

// ---------- hash router ----------
function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '')
  const [name, id] = h.split('/')
  return { name: name || '', id: id ? decodeURIComponent(id) : undefined }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(load)
  const [route, setRoute] = useState(parseHash)
  const [toast, setToast] = useState(null)
  const timers = useRef([])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const go = useCallback((name, id, opts = {}) => {
    const h = '#/' + name + (id ? '/' + encodeURIComponent(id) : '')
    if (opts.replace) window.location.replace(h)
    else window.location.hash = h
  }, [])
  const back = useCallback((fallback = 'home') => {
    if (window.history.length > 1) window.history.back()
    else go(fallback)
  }, [go])

  const showToast = useCallback((t) => {
    setToast(t)
    later(() => setToast(null), 3200)
  }, [])

  const tx = useCallback((en, ko) => (state.lang === 'ko' ? ko ?? en : en), [state.lang])
  const L = useCallback((o) => (o == null ? '' : typeof o === 'string' ? o : state.lang === 'ko' ? o.ko ?? o.en : o.en), [state.lang])

  const actions = useMemo(() => {
    const addPoints = (s, delta, label) => ({
      ...s,
      points: s.points + delta,
      activity: [{ id: Date.now() + Math.random(), label, delta, when: 'today' }, ...s.activity],
    })

    const pushMsg = (s, chatId, msg) => ({
      ...s,
      chats: s.chats.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, { time: now(), ...msg }], updated: Date.now() } : c)),
    })

    const ensureChat = (s, personId, extra = {}) => {
      if (s.chats.some((c) => c.id === personId)) return s
      return { ...s, chats: [{ id: personId, kind: 'person', messages: [], unread: 0, updated: Date.now(), ...extra }, ...s.chats] }
    }

    return {
      setLang: (lang) => setState((s) => ({ ...s, lang })),
      setUni: (uni) => setState((s) => ({ ...s, uni })),
      updateMe: (patch) => setState((s) => ({ ...s, me: { ...s.me, ...patch } })),
      finishOnboarding: () =>
        setState((s) => (s.onboarded ? s : addPoints({ ...s, onboarded: true }, 100, { en: 'Welcome bonus', ko: '가입 환영 보너스' }))),

      markRead: (chatId) => setState((s) => ({ ...s, chats: s.chats.map((c) => (c.id === chatId ? { ...c, unread: 0 } : c)) })),

      sendMessage: (chatId, text) => {
        setState((s) => pushMsg(s, chatId, { from: 'me', text }))
        const person = PEOPLE[chatId]
        if (!person) return
        // Demo only: the other person "types" and answers so the flow can be shown live.
        later(() => setState((s) => ({ ...s, chats: s.chats.map((c) => (c.id === chatId ? { ...c, typing: true } : c)) })), 700)
        later(() => {
          setState((s) => {
            const c = s.chats.find((x) => x.id === chatId)
            const n = c?.replies || 0
            const set = person.roles.includes('mentee') ? 'mentee' : person.roles.includes('mentor') ? 'mentor' : 'friend'
            const r = AUTO_REPLIES[set][n % AUTO_REPLIES[set].length]
            const s2 = { ...s, chats: s.chats.map((x) => (x.id === chatId ? { ...x, typing: false, replies: n + 1 } : x)) }
            // mentees write in English (translation to Korean); Korean students write in Korean (translation to English)
            return pushMsg(s2, chatId, set === 'mentee' ? { from: 'them', text: r.en, tr: r.ko } : { from: 'them', text: r.ko, tr: r.en })
          })
        }, 2200)
      },

      startChat: (personId, firstSystem) =>
        setState((s) => {
          let s2 = ensureChat(s, personId)
          if (firstSystem) s2 = pushMsg(s2, personId, { from: 'system', text: firstSystem })
          return s2
        }),

      confirmHelp: (chatId) =>
        setState((s) => {
          const chat = s.chats.find((c) => c.id === chatId)
          if (!chat || chat.confirmed) return s
          const p = PEOPLE[chatId]
          let s2 = { ...s, chats: s.chats.map((c) => (c.id === chatId ? { ...c, confirmed: true } : c)) }
          s2 = {
            ...s2,
            requests: s2.requests.map((r) => (r.mentor === chatId && r.status === 'matched' ? { ...r, status: 'done' } : r)),
          }
          return pushMsg(s2, chatId, {
            from: 'system',
            text: { en: `You confirmed ${p.name}'s help. +50 P went to ${p.name.split(' ')[0]}.`, ko: `${p.ko || p.name}님의 도움을 확인했어요. ${p.ko || p.name}님께 +50 P가 지급됐어요.` },
          })
        }),

      createRequest: ({ topic, text, lang }) => {
        const id = 'r' + Date.now()
        setState((s) => ({ ...s, requests: [{ id, topic, text, lang, status: 'open', created: Date.now() }, ...s.requests] }))
        // Demo matching: after a moment, the best mentor for this topic + language "replies".
        const mentor = pickMentor(topic, lang)
        later(() => {
          setState((s) => {
            let s2 = { ...s, requests: s.requests.map((r) => (r.id === id ? { ...r, status: 'matched', mentor: mentor.id } : r)) }
            s2 = ensureChat(s2, mentor.id)
            s2 = pushMsg(s2, mentor.id, { from: 'system', text: { en: 'Request matched: ' + text.slice(0, 60), ko: '요청이 연결됐어요: ' + text.slice(0, 60) } })
            s2 = pushMsg(s2, mentor.id, {
              from: 'them',
              text: '안녕하세요! 요청 봤어요. 제가 도와드릴게요 🙂',
              tr: 'Hi! I saw your request. I can help you with this 🙂',
            })
            s2 = { ...s2, chats: s2.chats.map((c) => (c.id === mentor.id ? { ...c, unread: (c.unread || 0) + 1, confirmed: false } : c)) }
            return s2
          })
          showToast({ person: mentor.id, text: { en: `${mentor.name} replied to your request`, ko: `${mentor.ko || mentor.name}님이 요청에 답했어요` } })
        }, 3500)
        return id
      },
      cancelRequest: (id) => setState((s) => ({ ...s, requests: s.requests.filter((r) => r.id !== id) })),

      offerHelp: (personId) =>
        setState((s) => {
          let s2 = ensureChat(s, personId)
          const p = PEOPLE[personId]
          s2 = pushMsg(s2, personId, {
            from: 'system',
            text: { en: `You offered to help ${p.name}. You get +50 P when they confirm.`, ko: `${p.name}님께 도움을 제안했어요. 상대가 확인하면 +50 P를 받아요.` },
          })
          return s2
        }),

      addPost: (text) =>
        setState((s) => ({
          ...s,
          posts: [{ id: 'p' + Date.now(), author: 'me', text, likes: 0, comments: 0, when: { en: 'Just now', ko: '방금' } }, ...s.posts],
        })),
      toggleLike: (postId) => setState((s) => ({ ...s, likes: { ...s.likes, [postId]: !s.likes[postId] } })),
      addQuestion: (text, botAnswerId) =>
        setState((s) => ({ ...s, questions: [{ id: 'q' + Date.now(), text, answers: 0, bot: botAnswerId || null, mine: true }, ...s.questions] })),
      toggleGroup: (gid) =>
        setState((s) => ({ ...s, joinedGroups: s.joinedGroups.includes(gid) ? s.joinedGroups.filter((g) => g !== gid) : [...s.joinedGroups, gid] })),

      redeem: (reward) =>
        setState((s) => {
          if (s.points < reward.cost) return s
          return addPoints({ ...s, redeemed: [...s.redeemed, reward.id] }, -reward.cost, { en: 'Redeemed ' + reward.name.en, ko: reward.name.ko + ' 교환' })
        }),

      resetDemo: () => {
        try {
          localStorage.removeItem(KEY)
        } catch {
          /* ignore */
        }
        setState(initialState())
        window.location.hash = '/'
      },
    }
  }, [showToast])

  const value = { state, route, go, back, tx, L, toast, setToast, ...actions }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
