import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE_PATH ?? '/'

// PR プレビューはすべて同一オリジン（/markdown-editer/ 配下）に配信されるため、
// Service Worker を有効にすると本番用 SW（スコープ /markdown-editer/）がプレビューの
// ナビゲーションを横取りし、本番の画面が表示されてしまう。プレビュービルドでは
// 自己破棄する SW を生成して登録済み SW・キャッシュを掃除し、本番 SW 側では
// プレビューパスをナビゲーションフォールバックの対象外にすることで競合を防ぐ。
const disablePWA = process.env.VITE_DISABLE_PWA === 'true'

const buildDate = new Date().toLocaleString('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export default defineConfig({
  base,
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  plugins: [
    react(),
    VitePWA({
      selfDestroying: disablePWA,
      registerType: 'autoUpdate',
      workbox: {
        // 本番 SW（スコープ /markdown-editer/）が PR プレビュー（/markdown-editer/pr-N/）への
        // ナビゲーションを本番のアプリシェルで肩代わりしないようにする。
        navigateFallbackDenylist: [/^\/markdown-editer\/pr-\d+\//],
      },
      manifest: {
        name: 'Markdown Editor',
        short_name: 'MDEditor',
        description: 'Markdown形式で記事を編集するエディター',
        theme_color: '#eef2ff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: base,
        icons: [
          { src: `${base}pwa-64x64.png`, sizes: '64x64', type: 'image/png' },
          { src: `${base}pwa-192x192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}pwa-512x512.png`, sizes: '512x512', type: 'image/png' },
          {
            src: `${base}maskable-icon-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
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
