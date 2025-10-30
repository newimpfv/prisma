import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['prisma.solefacilesrl.com', '.solefacilesrl.com'],
    hmr: {
      // HMR configuration for domain access
      // The client will automatically use wss:// when the page is loaded over https://
      protocol: 'wss',
      host: 'prisma.solefacilesrl.com',
      clientPort: 443
    }
  }
})
