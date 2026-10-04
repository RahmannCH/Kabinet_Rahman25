import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = process.argv.includes('--dist') ? path.join(projectRoot, 'dist') : projectRoot;
const port = Number(process.env.PORT ?? 49173);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
};

createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  } catch {
    response.writeHead(400);
    response.end();
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(`${root}${path.sep}`) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    const notFoundPath = path.join(root, '404.html');
    response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    if (existsSync(notFoundPath)) {
      createReadStream(notFoundPath).pipe(response);
    } else {
      response.end('<h1>404 Not Found</h1>');
    }
    return;
  }

  response.writeHead(200, { 'content-type': mimeTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream' });
  createReadStream(filePath)
    .on('error', () => {
      if (!response.headersSent) response.writeHead(500);
      response.end();
    })
    .pipe(response);
}).listen(port, '127.0.0.1');
