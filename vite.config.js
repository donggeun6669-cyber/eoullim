import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' so the same build works on GitHub Pages (/eoullim/) and any other host.
export default defineConfig({
  plugins: [react()],
  base: './',
})
