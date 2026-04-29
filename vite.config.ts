import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import type { Plugin, ViteDevServer } from 'vite'

const hasDisplay =
  process.platform !== 'linux' ||
  !!(process.env['DISPLAY'] ?? process.env['WAYLAND_DISPLAY']);

const openBrowserPlugin: Plugin = {
  name: 'open-browser-log',
  configureServer(server: ViteDevServer) {
    server.httpServer?.once('listening', () => {
      if (!hasDisplay) {
        process.stdout.write('No display detected — binding to all interfaces (--host) instead of opening a browser.\n');
        return;
      }
      const addr = server.httpServer?.address();
      const port = typeof addr === 'object' && addr !== null ? addr.port : '?';
      process.stdout.write(`Opening browser window at http://localhost:${String(port)}/...\n`);
    });
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), openBrowserPlugin],
  server: {
    port: 0,
    strictPort: false,
    open: hasDisplay,
    host: !hasDisplay,
  },
  test: {
    environment: 'node',
  },
})
