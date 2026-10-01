// Live translation on the phone side: a cache per language, and a queue that batches what the screen asks for.
// Order: 1) the phone asks Google's free endpoint directly (every phone has its own IP, so limits spread out)
//        2) whatever fails goes to our server (Google from the server, then MyMemory for posts and chat only —
//           menu text never uses MyMemory's small free quota; it just stays in English).
// Screens re-render when new translations arrive (subscribe).
import { rpc } from './api.js'

const caches = {} // g-code → Map(text → { t, src } | null (in flight) | false (failed))
const queue = {} // `${g}|${kind}` → Set(text)
const listeners = new Set()
let timer = null
let googleOffUntil = 0
const LS = (g) => 'eoullim-tr-' + g

function cacheFor(g) {
  if (!caches[g]) {
    let saved = {}
    try {
      saved = JSON.parse(localStorage.getItem(LS(g)) || '{}')
    } catch {
      /* no storage: memory only */
    }
    caches[g] = new Map(Object.entries(saved))
  }
  return caches[g]
}
function persist(g) {
  try {
    const entries = [...cacheFor(g).entries()].filter(([, v]) => v).slice(-3000)
    localStorage.setItem(LS(g), JSON.stringify(Object.fromEntries(entries)))
  } catch {
    /* storage full or blocked: keep it in memory */
  }
}

// kind: 'ui' (menus, buttons) or 'content' (posts, chat, events).
// Returns { t, src } if known, null while it is being fetched, false if it could not be translated.
export function lookup(text, g, kind = 'content') {
  if (!text || !g) return false
  const m = cacheFor(g)
  if (m.has(text)) return m.get(text)
  ;(queue[g + '|' + kind] ||= new Set()).add(text)
  clearTimeout(timer)
  timer = setTimeout(flush, 60)
  return null
}

async function direct(text, g) {
  if (Date.now() < googleOffUntil) throw new Error('cooldown')
  const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${g}&dt=t&q=${encodeURIComponent(text)}`, { signal: AbortSignal.timeout(5000) })
  if (r.status === 429) googleOffUntil = Date.now() + 10 * 60e3
  if (!r.ok) throw new Error('google ' + r.status)
  const j = await r.json()
  return { t: (j[0] || []).map((s) => s[0]).join(''), src: j[2] || '' }
}

async function run(texts, g, kind) {
  const m = cacheFor(g)
  const left = []
  let i = 0
  const worker = async () => {
    while (i < texts.length) {
      const t = texts[i++]
      try {
        m.set(t, await direct(t, g))
      } catch {
        left.push(t)
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker))
  for (let k = 0; k < left.length; k += 40) {
    const chunk = left.slice(k, k + 40)
    try {
      const { out } = await rpc('translate', { to: g, texts: chunk, ui: kind === 'ui' })
      chunk.forEach((t, n) => m.set(t, out[n] || false))
    } catch {
      chunk.forEach((t) => m.set(t, false)) // show the original; not saved, so it retries next visit
    }
  }
  persist(g)
  listeners.forEach((fn) => fn())
}

function flush() {
  for (const key of Object.keys(queue)) {
    const [g, kind] = key.split('|')
    const m = cacheFor(g)
    const texts = [...queue[key]].filter((t) => !m.has(t))
    delete queue[key]
    texts.forEach((t) => m.set(t, null)) // in flight
    if (texts.length) run(texts, g, kind)
  }
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Same language? (zh-CN vs zh, etc.)
export const sameLang = (src, g) => !!src && src.split('-')[0] === g.split('-')[0]
