import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // ส่งทุกคำขอที่ขึ้นต้นด้วย /api ไปที่ backend (พอร์ต 3000)
  server: { proxy: { '/api': 'http://localhost:3000' } },
})