import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_FRONTEND_HOST || 'http://localhost',
    port: parseInt(process.env.VITE_FRONTEND_PORT) || 3000,
    proxy:{
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }}
  }
})
