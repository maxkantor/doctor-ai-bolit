import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion']
  },
  define: {
    // Make domain available at build time
    __DOMAIN__: JSON.stringify(process.env.VITE_DOMAIN || 'doctoraibolit.com'),
    __API_DOMAIN__: JSON.stringify(process.env.VITE_API_DOMAIN || 'api.doctoraibolit.com')
  }
})

