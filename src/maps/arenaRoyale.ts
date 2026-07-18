import type { MapDef } from '../core/types';

/**
 * Arène Nyx — premier tableau (mode Battle Royale).
 *
 * Terrain carré, symétrique. Des buissons pour se cacher, des obstacles solides
 * pour se couvrir. La zone qui rétrécit (gérée par le mode) se referme vers le
 * centre.
 *
 * Pour AJOUTER UNE CARTE : crée un fichier exportant un `MapDef`, ajoute-le au
 * registre. La disposition (buissons/obstacles/taille) est purement des données.
 */
const SIZE = 1600;

export const ARENA_ROYALE: MapDef = {
  id: 'arena-royale',
  name: 'Arène Nyx',
  width: SIZE,
  height: SIZE,
  bushes: [
    // Quatre bosquets près des coins + une grande cachette centrale.
    { x: 220, y: 220, w: 240, h: 160 },
    { x: SIZE - 460, y: 220, w: 240, h: 160 },
    { x: 220, y: SIZE - 380, w: 240, h: 160 },
    { x: SIZE - 460, y: SIZE - 380, w: 240, h: 160 },
    { x: SIZE / 2 - 150, y: SIZE / 2 - 90, w: 300, h: 180 },
    { x: SIZE / 2 - 90, y: 260, w: 180, h: 120 },
    { x: SIZE / 2 - 90, y: SIZE - 380, w: 180, h: 120 },
  ],
  obstacles: [
    // Blocs de couverture répartis symétriquement.
    { x: 520, y: 520, w: 90, h: 90 },
    { x: SIZE - 610, y: 520, w: 90, h: 90 },
    { x: 520, y: SIZE - 610, w: 90, h: 90 },
    { x: SIZE - 610, y: SIZE - 610, w: 90, h: 90 },
    { x: SIZE / 2 - 45, y: 540, w: 90, h: 90 },
    { x: SIZE / 2 - 45, y: SIZE - 630, w: 90, h: 90 },
    { x: 540, y: SIZE / 2 - 45, w: 90, h: 90 },
    { x: SIZE - 630, y: SIZE / 2 - 45, w: 90, h: 90 },
  ],
};
