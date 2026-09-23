import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    host: true,
    // 本地开发时，把 /api/* 代理到 Express 后端（默认 3001）。
    // 否则前端 5173 直连 /api 会命中 Vite 自己，导致 API 404。
    // 后端端口可用 API_PORT 覆盖，与 server/index.ts 的 PORT 保持一致。
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT || 3001}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 核心框架单独成包，利于浏览器长期缓存
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 拖拽库仅在导演台页面使用，独立分包
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
  },
})
