import type { Plugin } from 'vite';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const CACHE_NAME = 'as-vita-v1';
const ICON_DIR = join(process.cwd(), 'public/img/appiconset');

const MANIFEST_BASE = {
  name: 'AS Vita - Inscription Supporter',
  short_name: 'AS Vita',
  description: 'Inscription et engagement supporter AS Vita',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  lang: 'fr',
  theme_color: '#2c8a39',
  background_color: '#1c2e1e',
  categories: ['sports', 'lifestyle'],
};

function buildManifestIcons() {
  return readdirSync(ICON_DIR)
    .filter((file) => /^\d+\.png$/.test(file))
    .sort((a, b) => Number(a.replace('.png', '')) - Number(b.replace('.png', '')))
    .flatMap((file) => {
      const size = file.replace('.png', '');
      const icon = {
        src: `/img/appiconset/${file}`,
        sizes: `${size}x${size}`,
        type: 'image/png',
      };

      const entries = [{ ...icon, purpose: 'any' }];
      if (size === '512' || size === '1024') {
        entries.push({ ...icon, purpose: 'maskable' });
      }

      return entries;
    });
}

function buildManifest() {
  return JSON.stringify(
    {
      ...MANIFEST_BASE,
      icons: buildManifestIcons(),
    },
    null,
    2,
  );
}

function collectDistFiles(dir: string, base: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectDistFiles(fullPath, base));
      continue;
    }

    const assetPath = `/${relative(base, fullPath).replace(/\\/g, '/')}`;
    if (assetPath === '/sw.js' || assetPath.endsWith('.map')) {
      continue;
    }

    files.push(assetPath);
  }

  return files;
}

export function asVitaPwaPlugin(): Plugin {
  return {
    name: 'as-vita-pwa',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] === '/manifest.webmanifest') {
          res.setHeader('Content-Type', 'application/manifest+json');
          res.end(buildManifest());
          return;
        }

        next();
      });
    },
    closeBundle() {
      const outDir = join(process.cwd(), 'dist');
      writeFileSync(join(outDir, 'manifest.webmanifest'), buildManifest());

      const precache = collectDistFiles(outDir, outDir);

      const serviceWorker = `const CACHE = ${JSON.stringify(CACHE_NAME)};
const PRECACHE = ${JSON.stringify(precache)};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response.ok && url.origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'));
    }),
  );
});
`;

      writeFileSync(join(outDir, 'sw.js'), serviceWorker);
    },
  };
}
