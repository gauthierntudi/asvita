import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { asVitaPwaPlugin } from './vite-plugin-pwa';

const clientDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(clientDir, '..');

function apiHealthPlugin(apiOrigin: string): Plugin {
  return {
    name: 'asvita-api-health-check',
    configureServer() {
      fetch(`${apiOrigin}/api/health`)
        .then((response) => {
          if (!response.ok) {
            console.warn(`[asvita] API health check failed (${response.status}) at ${apiOrigin}`);
            return;
          }

          console.log(`[asvita] API connectée : ${apiOrigin}`);
        })
        .catch(() => {
          console.warn(
            `[asvita] API inaccessible sur ${apiOrigin}. Lancez "npm run dev" à la racine (client + server).`,
          );
        });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, monorepoRoot, '');
  const apiPort = env.PORT || '4000';
  const apiOrigin = `http://127.0.0.1:${apiPort}`;

  return {
    plugins: [react(), asVitaPwaPlugin(), apiHealthPlugin(apiOrigin)],
    envPrefix: ['VITE_', 'PROFIL_', 'PRICE_'],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
