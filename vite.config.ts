import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// Identifiant de build injecté à la compilation : hash de commit court + date.
// Entièrement dérivé de git → aucune version à bumper manuellement ; il suffit
// de regarder l'écran pour savoir exactement quel commit tourne (utile pour
// distinguer prod / QA et confirmer un déploiement).
let sha = 'local';
try {
  sha = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  // Pas de dépôt git disponible (build hors contexte git) → on garde "local".
}
const buildDate = new Date().toISOString().slice(0, 10);
const buildId = `${sha} · ${buildDate}`;

// Configuration Vite : serveur de dev rapide + build de production.
// `base: './'` garde les chemins relatifs pour un déploiement statique simple
// (racine du site pour la prod, sous-dossier /qa/ pour la QA).
export default defineConfig({
  base: './',
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  },
});
