/* 목업 HTML 빌드 설정 — 실제 셸을 담은 HTML 한 파일을 만든다. `npm run mockup` 이 쓴다.
   더블클릭(file://)으로 열어야 하므로 모듈 스크립트를 쓰지 않고 iife 로 묶고, 이미지는 data URI 로 넣는다.
   모듈 스크립트는 file:// 에서 CORS 로 차단된다. */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: 'mockup',
  base: './',
  publicDir: '../public',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../dist-mockup',
    emptyOutDir: true,
    assetsInlineLimit: 10_000_000,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'app.js', assetFileNames: 'app.[ext]' },
    },
  },
});
