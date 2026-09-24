import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vercel deploys to domain root ('/'). If deploying to GitHub Pages subpath, set to repo name.
  base: '/',
});
