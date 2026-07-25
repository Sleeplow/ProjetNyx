import { defineConfig } from 'vitest/config';

/**
 * Tests unitaires (vitest) — environnement Node : on teste la LOGIQUE PURE
 * (géométrie, éclair en chaîne, simulation de match autoritaire), sans Phaser ni
 * DOM. La simulation `MatchSim` tourne déjà côté serveur Node, donc toute sa
 * chaîne d'import est testable ici telle quelle.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
  },
});
