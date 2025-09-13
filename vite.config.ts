// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // ensures module resolution works with Node16 style
    dedupe: ['react', 'react-dom']
  },
  server: {
    fs: {
      strict: false
    }
  },
  build: {
    target: 'esnext'
  }
})
