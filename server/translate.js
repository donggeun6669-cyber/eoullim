// Live translation for boards and group chat. Free services only — no API key, no billing:
//   1. Google's keyless web endpoint (fast, good quality, but rate-limits busy IPs with HTTP 429)
//   2. MyMemory's free API (fallback; ~5,000 characters/day per IP without an account)
// When Google answers 429 we leave it alone for 10 minutes. A real service would move to a contracted
// translation API (paid → needs 동근님's approval first).
// Example (seed) content ships with saved translations (tr-seed.js, made by scripts/seed-translations.mjs) so the demo never depends on either service.
import seedTr from './tr-seed.js'

const LANGS = new Set(['ko', 'en', 'zh-CN', 'vi', 'ja', 'uz', 'mn', 'tl', 'my', 'id', 'th', 'es', 'fr', 'de', 'ru'])
const cache = new Map() // `${to}\u0000${text}` → { t, src }
for (const [to, m] of Object.entries(seedTr)) for (const [text, v] of Object.entries(m)) cache.set(to + '\u0000' + text, v)
const MAX_TEXTS = 40
const MAX_LEN = 1200
let googleOffUntil = 0

async function google(text, to) {
  const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: 'q=' + encodeURIComponent(text),
    signal: AbortSignal.timeout(6000),
  })
  if (r.status === 429) googleOffUntil = Date.now() + 10 * 60e3
  if (!r.ok) throw new Error('google ' + r.status)
  const j = await r.json()
  return { t: (j[0] || []).map((s) => s[0]).join(''), src: j[2] || '' }
}

// MyMemory takes up to ~500 characters per request: split long text at sentence ends.
function pieces(text, max = 450) {
  if (text.length <= max) return [text]
  const out = []
  let cur = ''
  for (const part of text.split(/(?<=[.!?。！？\n])\s*/)) {
    if ((cur + ' ' + part).length > max && cur) {
      out.push(cur)
      cur = part
    } else cur = cur ? cur + ' ' + part : part
  }
  if (cur) out.push(cur)
  return out.flatMap((p) => (p.length > max ? p.match(new RegExp(`[\\s\\S]{1,${max}}`, 'g')) : [p]))
}
async function mymemory(text, to) {
  let src = ''
  const done = []
  for (const p of pieces(text)) {
    const r = await fetch(`https://api.mymemory.translated.net/get?langpair=autodetect|${to}&q=${encodeURIComponent(p)}`, { signal: AbortSignal.timeout(8000) })
    const j = await r.json()
    if (!r.ok || j.responseStatus != 200 || j.quotaFinished) throw new Error('mymemory ' + (j.responseStatus || r.status))
    src = src || (j.responseData?.detectedLanguage || '').split('-')[0]
    done.push(j.responseData.translatedText)
  }
  return { t: done.join(' '), src }
}

async function one(text, to, ui) {
  const key = to + '\u0000' + text
  if (cache.has(key)) return cache.get(key)
  let out
  if (Date.now() > googleOffUntil) {
    try {
      out = await google(text, to)
    } catch {
      /* fall through to MyMemory */
    }
  }
  // Menu text never spends MyMemory's small daily quota — it can stay in English. Posts and chat can.
  if (!out && !ui) out = await mymemory(text, to)
  if (!out) throw new Error('no translation')
  if (cache.size > 20000) cache.clear()
  cache.set(key, out)
  return out
}

// texts: string[] → [{ t, src } | null] (null = could not translate; the app shows the original)
export async function translate(texts, to, { ui = false } = {}) {
  if (!LANGS.has(to) || !Array.isArray(texts)) return null
  const list = texts.slice(0, MAX_TEXTS).map((s) => String(s || '').slice(0, MAX_LEN))
  const out = new Array(list.length).fill(null)
  let i = 0
  const worker = async () => {
    while (i < list.length) {
      const k = i++
      if (!list[k].trim()) continue
      try {
        out[k] = await one(list[k], to, ui)
      } catch (e) {
        if (process.env.EOULLIM_DEBUG) console.error('translate failed', e?.message)
        out[k] = null
      }
    }
  }
  await Promise.all(Array.from({ length: Date.now() > googleOffUntil ? 6 : 3 }, worker))
  return out
}
