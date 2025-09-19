import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Virtuell Hemodling',
          short_name: 'Hemodling',
          description: 'En dashboard för att övervaka din virtuella odling.',
          theme_color: '#ffffff',
          background_color: '#f0f4f8',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: new RegExp(`^${env.VITE_API_URL}/.*`),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ]
  })
}