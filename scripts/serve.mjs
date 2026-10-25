import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, BASE } from './build.mjs';
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/') { res.writeHead(302, { Location: BASE }); res.end(); return; }
    if (!url.pathname.startsWith(BASE)) { res.writeHead(404); res.end('Not found'); return; }
    const relative = decodeURIComponent(url.pathname.slice(BASE.length));
    const file = path.resolve(ROOT, relative + (url.pathname.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(ROOT + path.sep) || !fs.statSync(file).isFile()) throw new Error('Not found');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(ROOT, '404.html')));
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}${BASE}`));
