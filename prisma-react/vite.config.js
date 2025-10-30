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
      // Use domain settings only when accessed via domain
      // Otherwise use default settings for localhost
      protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
      host: process.env.VITE_HMR_HOST || undefined,
      clientPort: process.env.VITE_HMR_PORT ? parseInt(process.env.VITE_HMR_PORT) : undefined
    }
  }
})
