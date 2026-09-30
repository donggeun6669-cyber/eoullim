import { handle } from '../server/handler.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body
  const { status, json } = await handle(body, req.headers['x-device-key'])
  res.setHeader('Cache-Control', 'no-store')
  res.status(status).json(json)
}
