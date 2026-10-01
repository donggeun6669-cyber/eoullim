// One JSON document in a private Vercel Blob. Writes use the blob's ETag (ifMatch), so two people
// adopting / charging at the same moment can never overwrite each other — the loser just retries.
import { get, put, BlobPreconditionFailedError } from '@vercel/blob'
import { emptyDb, migrate } from './logic.js'

const PATH = process.env.EOULLIM_DB || (process.env.VERCEL_ENV === 'production' ? 'eoullim/db.json' : 'eoullim/db-preview.json')
let cache = null // { etag, db } — reused while the blob is unchanged (HTTP 304)

// Compressed reads return a weak ETag (W/"…"); writes need the plain one.
const strong = (etag) => (etag || '').replace(/^W\//, '')

async function readText(stream) {
  return await new Response(stream).text()
}

export async function load() {
  const r = await get(PATH, { access: 'private', useCache: false, ifNoneMatch: cache?.etag })
  if (!r) return { etag: null, db: emptyDb() }
  if (r.statusCode === 304 && cache) return { etag: cache.etag, db: structuredClone(cache.db) }
  const db = migrate(JSON.parse(await readText(r.stream)))
  cache = { etag: strong(r.blob.etag), db }
  return { etag: cache.etag, db: structuredClone(db) }
}

async function save(db, etag) {
  const body = JSON.stringify(db)
  const opts = { access: 'private', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60 }
  const res = etag ? await put(PATH, body, { ...opts, ifMatch: etag }) : await put(PATH, body, { ...opts, allowOverwrite: false })
  cache = { etag: strong(res.etag), db: JSON.parse(body) }
}

// Run fn(db) and save the result, retrying if someone else saved first.
export async function mutate(fn) {
  for (let i = 0; i < 6; i++) {
    const { etag, db } = await load()
    const result = fn(db)
    try {
      await save(db, etag)
      return { db, result }
    } catch (e) {
      const conflict = e instanceof BlobPreconditionFailedError || /already exists|precondition|conflict/i.test(String(e?.message))
      if (process.env.EOULLIM_DEBUG) console.log('save conflict', i, e?.constructor?.name, e?.message)
      if (!conflict) throw e
      cache = null
      await new Promise((r) => setTimeout(r, 40 + Math.random() * 120))
    }
  }
  throw new Error('busy')
}
