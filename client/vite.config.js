import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        // Use Docker service name so Vite (inside the container) can reach the server container.
        // The wife's browser only talks to port 5173 — API traffic is proxied server-side.
        target: process.env.VITE_PROXY_TARGET || 'http://server:5000',
        changeOrigin: true,
      },
    },
  },
});
