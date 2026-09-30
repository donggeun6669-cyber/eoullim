import { apply, pidOf, sweep, view, UserError } from './logic.js'
import { load, mutate } from './store.js'

const READ_ONLY = new Set(['state', 'check'])
const hits = new Map() // simple per-device write limit (per server instance)

function limited(pid) {
  const now = Date.now()
  const list = (hits.get(pid) || []).filter((t) => now - t < 60e3)
  list.push(now)
  hits.set(pid, list)
  return list.length > 30
}

// body: { action, ...payload }  key: device key from the x-device-key header
export async function handle(body, key) {
  try {
    const { action, ...payload } = body || {}
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
      sweep(d) // e.g. the demo clock just moved: apply the 72h / 7-day rules right away
      return r
    })
    return { status: 200, json: { ...view(db, pid), result: result ?? null } }
  } catch (e) {
    if (e instanceof UserError) return { status: e.status, json: { error: e.code } }
    console.error(e)
    return { status: 500, json: { error: 'server' } }
  }
}
