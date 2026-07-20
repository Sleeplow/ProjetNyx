// Tiny static file server rooted at the project, so the bake page can pull
// three.js from node_modules and the .glb models from tools/kaykit-src via
// plain URLs. No transforms (unlike Vite) — the browser gets the raw bytes.
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';

const ROOT = process.argv[2] || process.cwd();
const PORT = Number(process.argv[3] || 5199);

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wasm': 'application/wasm',
};

createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    if (url === '/favicon.ico') {
      res.writeHead(204).end();
      return;
    }
    const path = normalize(join(ROOT, url));
    if (!path.startsWith(ROOT)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(PORT, () => console.log(`serve: http://localhost:${PORT}  root=${ROOT}`));
