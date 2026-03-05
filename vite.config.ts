import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // 设置网站 favicon
  favicon: 'public/favicon.ico',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      manifest: {
        name: '业余无线电学习平台',
        short_name: 'Ham Exam',
        description: '专业的业余无线电考试学习平台，提供A、B、C类题库练习、模拟考试和错题本功能',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        icon: 'logo.svg', // 使用public目录下的SVG图标
        icons: [
          {
            src: 'logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  server: {
    port: 3001,
    open: true,
    historyApiFallback: true // 支持客户端路由
  }
})