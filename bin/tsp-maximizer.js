#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const distDir = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const args = process.argv.slice(2);
const bindAll = args.includes('--host');
const bindHost = bindAll ? '0.0.0.0' : '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  const urlPath = (req.url ?? '/').split('?')[0];
  let filePath = join(distDir, urlPath === '/' ? 'index.html' : urlPath);

  try {
    const s = await stat(filePath);
    if (s.isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    filePath = join(distDir, 'index.html'); // SPA fallback
  }

  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(0, bindHost, () => {
  const addr = server.address();
  const port = typeof addr === 'object' && addr !== null ? addr.port : 0;
  const localUrl = `http://localhost:${port}`;
  const networkUrl = `http://${bindHost}:${port}`;

  const hasDisplay =
    process.platform !== 'linux' ||
    !!(process.env['DISPLAY'] ?? process.env['WAYLAND_DISPLAY']);

  if (bindAll) {
    process.stdout.write(`TSP Maximizer listening on all interfaces.\n`);
    process.stdout.write(`  Local:   ${localUrl}\n`);
    process.stdout.write(`  Network: ${networkUrl}\n`);
    return;
  }

  if (!hasDisplay) {
    process.stdout.write(`TSP Maximizer running at ${localUrl}\n`);
    process.stdout.write(`No display detected — skipping browser open. Use --host to bind to all interfaces.\n`);
    return;
  }

  process.stdout.write(`Opening browser at ${localUrl}...\n`);

  const opener =
    process.platform === 'darwin' ? 'open' :
    process.platform === 'win32'  ? 'cmd' :
    'xdg-open';
  const openerArgs =
    process.platform === 'win32' ? ['/c', 'start', localUrl] : [localUrl];

  execFile(opener, openerArgs, (err) => {
    if (err) process.stderr.write(`Could not open browser: ${err.message}\n`);
  });
});
