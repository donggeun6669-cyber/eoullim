import { apply, pidOf, sweep, view, UserError } from './logic.js'
import { load, mutate } from './store.js'
import { translate } from './translate.js'

const READ_ONLY = new Set(['state', 'check'])
const hits = new Map() // simple per-device limits (per server instance)

function limited(pid, bucket = 'w', max = 30) {
  const now = Date.now()
  const k = bucket + pid
  const list = (hits.get(k) || []).filter((t) => now - t < 60e3)
  list.push(now)
  hits.set(k, list)
  return list.length > max
}

// body: { action, ...payload }  key: device key from the x-device-key header
export async function handle(body, key) {
  try {
    const { action, ...payload } = body || {}
    if (action === 'translate') {
      // No db access: text in, text out. Works before "Start" too (the welcome screen is translated).
      let who = 'anon'
      try {
        who = pidOf(key)
      } catch {
        /* no device yet */
      }
      if (limited(who, 't', who === 'anon' ? 600 : 120)) return { status: 429, json: { error: 'slow_down' } }
      const out = await translate(payload.texts, payload.to, { ui: !!payload.ui })
      if (!out) return { status: 400, json: { error: 'bad_lang' } }
      return { status: 200, json: { out } }
    }
    const pid = pidOf(key)
    if (action === 'check') {
      const { db } = await load()
      return { status: 200, json: { exists: !!db.devices[pid] } }
    }
    if (READ_ONLY.has(action)) {
      let { db } = await load()
      if (sweep(db)) ({ db } = await mutate((d) => sweep(d)))
      return { status: 200, json: view(db, pid) }
    }
    if (limited(pid)) return { status: 429, json: { error: 'slow_down' } }
    const { db, result } = await mutate((d) => {
      sweep(d)
      if (action !== 'hello' && !d.devices[pid]) throw new UserError('no_device', 401)
      const r = apply(d, pid, action, payload, { ADMIN_CODE: process.env.ADMIN_CODE })
      sweep(d) // e.g. the demo clock just moved: apply the time rules right away
      return r
    })
    return { status: 200, json: { ...view(db, pid), result: result ?? null } }
  } catch (e) {
    if (e instanceof UserError) return { status: e.status, json: { error: e.code } }
    console.error(e)
    return { status: 500, json: { error: 'server' } }
  }
}
