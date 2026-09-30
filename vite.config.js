import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Local dev: serve /api/rpc from the same code Vercel runs, using .env.local
// (BLOB_READ_WRITE_TOKEN, ADMIN_CODE, EOULLIM_DB=eoullim/db-dev.json so tests never touch production data).
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/rpc', async (req, res) => {
        let raw = ''
        for await (const chunk of req) raw += chunk
        const { handle } = await server.ssrLoadModule('/server/handler.js')
        const { status, json } = await handle(JSON.parse(raw || '{}'), req.headers['x-device-key'])
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(json))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return { plugins: [react(), localApi()] }
})
