import { defineConfig } from 'vite';

export default defineConfig({
  // Use project root so Vite can see both /app and /src
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    // Open the game directly in the app folder
    open: '/app/index.html',
  }
});
