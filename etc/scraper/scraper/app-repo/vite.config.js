import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 공용 입구 아래 /scraper/ 경로로 서비스 → 빌드된 JS/CSS 주소가 /scraper/assets/... 가 됨
  base: '/scraper/',
  plugins: [react()],
  server: {
    // 로컬 개발(npm run dev) 시 scraper-api 는 dev 환경으로 전달
    proxy: { '/scraper-api': 'http://192.168.45.116:8280' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
