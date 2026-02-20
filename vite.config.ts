import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'app',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    open: true,
  }
});
