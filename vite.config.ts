import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    watch: { ignored: ['**/art_sources/**', '**/evidence/**', '**/docs/**'] },
  },
  optimizeDeps: { entries: ['index.html'], include: ['playcanvas'] },
  build: { target: 'es2022' },
});
