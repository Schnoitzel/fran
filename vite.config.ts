import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Fran\u00e7ais',
        short_name: 'Fran\u00e7ais',
        description: 'Pers\u00f6nlicher Franz\u00f6sisch-Lernplan \u2014 30 Minuten pro Tag.',
        theme_color: '#1e3a8a',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/fran/',
        scope: '/fran/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json}'],
      },
    }),
  ],
  base: '/fran/',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
