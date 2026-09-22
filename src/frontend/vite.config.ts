import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
  server: {
    port: 3000,
    // npm run dev 로 띄울 때 /api/ 요청을 이 PC 의 백엔드(uvicorn :8000)로 넘긴다.
    // 운영에서는 nginx 가 같은 일을 한다(nginx.conf).
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
