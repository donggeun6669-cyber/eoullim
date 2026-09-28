import { KB } from './kb.js'

// Help Bot search. No LLM: we find the official guide entry that best matches the question
// and show it with its source, so every answer can be checked. (Free, and it can't make things up.)
const norm = (s) => s.toLowerCase().replace(/[?!.,()]/g, ' ')

export function searchKB(query) {
  const q = ' ' + norm(query) + ' '
  const scored = KB.map((e) => {
    let score = 0
    for (const k of e.keywords) {
      if (q.includes(k.toLowerCase())) score += k.length >= 4 ? 2 : 1
    }
    if (q.includes(norm(e.label.en).trim()) || q.includes(e.label.ko)) score += 3
    return { e, score }
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
  return { best: scored[0]?.e || null, related: scored.slice(1, 3).map((x) => x.e) }
}

export const kbById = (id) => KB.find((e) => e.id === id)
export { KB }
