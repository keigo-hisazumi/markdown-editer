import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Markdown Editor',
        short_name: 'MDEditor',
        description: 'Markdown形式で記事を編集するエディター',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: base,
        icons: [
          {
            src: `${base}icons/icon-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: `${base}icons/icon-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
