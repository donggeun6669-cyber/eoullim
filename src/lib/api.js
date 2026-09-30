// Device identity without accounts: a random key lives only in this browser.
// The server stores a one-way hash of it, never the key itself. The key doubles as the recovery code.
const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const KEY = 'eoullim-key'

export function newKey() {
  const b = crypto.getRandomValues(new Uint8Array(12))
  const s = [...b].map((x) => ALPH[x % 32]).join('')
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`
}
export const normalizeKey = (s) => {
  const t = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  return t.length === 12 ? `${t.slice(0, 4)}-${t.slice(4, 8)}-${t.slice(8)}` : null
}

export function getKey() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
export function setKey(k) {
  try {
    localStorage.setItem(KEY, k)
  } catch {
    /* storage blocked: the key lives only in memory for this visit */
  }
  memKey = k
}
let memKey = null
export const currentKey = () => getKey() || memKey

export class ApiError extends Error {
  constructor(code) {
    super(code)
    this.code = code
  }
}

export async function rpc(action, payload = {}, key = currentKey()) {
  let res
  try {
    res = await fetch('/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-device-key': key || '' },
      body: JSON.stringify({ action, ...payload }),
    })
  } catch {
    throw new ApiError('offline')
  }
  const json = await res.json().catch(() => ({ error: 'server' }))
  if (!res.ok) throw new ApiError(json.error || 'server')
  return json
}

// Same patterns the server masks — used to warn before posting.
const PHONE = /(?:\+?82[-.\s]?)?0?1[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/
const HANDLE = /(?:카톡|카카오톡|카카오|kakao(?:talk)?|line|wechat|위챗|instagram|insta|인스타|telegram|텔레그램)\s*(?:id|아이디)?\s*[:：]?\s*@?[\w.-]{3,}/i
export const hasPrivateInfo = (s) => PHONE.test(s) || EMAIL.test(s) || HANDLE.test(s)
