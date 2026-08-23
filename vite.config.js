import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // relative base: the built site works from any sub-path (GitHub Pages, /docs, S3...)
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // allow the sandbox preview host
    allowedHosts: true,
    hmr: { clientPort: 5173 },
  },
})
