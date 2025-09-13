import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    resolve: {
        dedupe: ['react', 'react-dom'], // prevents multiple React instances
    },
    server: {
        fs: {
            strict: false, // allows serving files outside root if needed
        },
    },
    build: {
        target: 'esnext', // modern browsers
    },
});
