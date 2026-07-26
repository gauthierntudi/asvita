import { cpSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'api');
const clientApi = path.join(root, 'client/api');

if (!existsSync(path.join(apiDir, '_dist'))) {
  throw new Error('Missing api/_dist. Run prepare-vercel-api.mjs first.');
}

rmSync(clientApi, { recursive: true, force: true });
cpSync(apiDir, clientApi, { recursive: true });

console.log(`Synced API for Vercel client root: ${clientApi}`);
