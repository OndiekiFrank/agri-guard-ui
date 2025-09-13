import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // default import works with Node16

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    fs: { strict: false }
  },
  build: {
    target: 'esnext'
  }
})
