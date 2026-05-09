import { defineConfig } from 'vite';

export default defineConfig({
  base: '/CX-platform-/',
  root: '.',
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  esbuild: { target: 'esnext' },
  plugins: [
    {
      name: 'remove-crossorigin',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html.replace(/crossorigin\s*/g, '');
        },
      },
    },
  ],
});
