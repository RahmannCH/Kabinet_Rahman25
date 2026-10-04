import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const publicFiles = ['index.html', '404.html', 'assets', 'css', 'js'];

await rm(output, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
await mkdir(output, { recursive: true });
for (const file of publicFiles) {
  const src = path.join(root, file);
  if (!existsSync(src)) {
    console.warn(`[build] warning: "${file}" not found, skipping`);
    continue;
  }
  await cp(src, path.join(output, file), { recursive: true });
}
console.log('Built static public site.');
