import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    host: true
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
