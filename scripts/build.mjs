import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const publicFiles = ['index.html', '404.html', 'assets', 'css', 'js'];

await rm(output, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
await mkdir(output, { recursive: true });
for (const file of publicFiles) {
  await cp(path.join(root, file), path.join(output, file), { recursive: true });
}
console.log('Built static public site.');
