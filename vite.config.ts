import { defineConfig } from 'vite';

// Configuration Vite : serveur de dev rapide + build de production.
// `base: './'` garde les chemins relatifs pour un déploiement statique simple
// (GitHub Pages, itch.io, n'importe quel hébergeur de fichiers).
export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  },
});
