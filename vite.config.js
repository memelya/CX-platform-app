import { defineConfig } from 'vite';

export default defineConfig({
  base: '/CX-platform-/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
});
