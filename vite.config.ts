import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/AriaDash-web/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'AriaDash',
        short_name: 'AriaDash',
        description: 'Modern web frontend for aria2 download manager',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/AriaDash-web/',
        start_url: '/AriaDash-web/',
        icons: [
          { src: '/AriaDash-web/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/AriaDash-web/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/AriaDash-web/icons/apple-icon-180.png', sizes: '180x180', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
