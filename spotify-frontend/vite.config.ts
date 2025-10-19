import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/users': 'http://localhost:8080',
      '/musics': 'http://localhost:8080',
      '/likes': 'http://localhost:8080'
    }
  }
})

