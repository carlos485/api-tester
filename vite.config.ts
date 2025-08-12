import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://uat-loyalty-fps-bus-ms-loyalty-gamification-ws.solucionesdigitalfps.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false // Para certificados SSL inválidos
      }
    }
  }
})