import type { MapDef, Rect } from '../core/types';
import type { PortalPairSpawn, PortalConfig } from '../shared/game/portals';
import type { NeuroConfig } from '../shared/game/neurotoxin';

/**
 * Tableau « Chambre Nyxt » — Battle Royale inspiré de Portal.
 *
 * Deux pièces séparées par une cloison pleine sur toute la hauteur :
 *  - la GRANDE SALLE (main), à gauche, où tout le monde apparaît ;
 *  - le REFUGE (refuge), à droite, accessible UNIQUEMENT par un portail vert.
 *
 * Tension = neurotoxine (voir `neurotoxin.ts`) : la grande salle se remplit de
 * gaz (dégâts croissants), le refuge reste sûr un temps, puis se remplit aussi.
 *
 * Données pures : réutilisables côté serveur pour la version en ligne.
 */

const W = 2160;
const H = 1360;

/** Cloison pleine séparant grande salle et refuge. */
const DIVIDER_X = 1558;
const DIVIDER_W = 44;
const REFUGE_MIN_X = DIVIDER_X + DIVIDER_W / 2; // frontière logique (1580)

const MAIN_RECT: Rect = { x: 0, y: 0, w: DIVIDER_X, h: H };
const REFUGE_RECT: Rect = { x: DIVIDER_X + DIVIDER_W, y: 0, w: W - (DIVIDER_X + DIVIDER_W), h: H };

export const PORTAL_REGIONS = {
  main: MAIN_RECT,
  refuge: REFUGE_RECT,
  refugeMinX: REFUGE_MIN_X,
} as const;

/** Anneau d'apparition des combattants (dans la grande salle). */
export const PORTAL_SPAWN_RING = { cx: 760, cy: H / 2, r: 520 } as const;

export const PORTAL_ARENA: MapDef = {
  id: 'arena-portal',
  name: 'Chambre Nyxt',
  width: W,
  height: H,
  bushes: [
    { x: 640, y: 220, w: 200, h: 120 },
    { x: 640, y: 1010, w: 200, h: 120 },
    { x: 1160, y: 220, w: 220, h: 120 },
    { x: 1150, y: 1010, w: 220, h: 120 },
    { x: 900, y: 560, w: 200, h: 120 },
    // Refuge : un peu de couvert.
    { x: 1680, y: 200, w: 180, h: 120 },
    { x: 1900, y: 1040, w: 180, h: 120 },
  ],
  obstacles: [
    // Cloison pleine (bloque déplacements ET projectiles → refuge vraiment isolé).
    { x: DIVIDER_X, y: 0, w: DIVIDER_W, h: H },
    // Couverture — grande salle.
    { x: 760, y: 600, w: 120, h: 120 },
    { x: 1180, y: 560, w: 96, h: 96 },
    { x: 440, y: 660, w: 96, h: 96 },
    { x: 980, y: 240, w: 96, h: 96 },
    { x: 980, y: 1024, w: 96, h: 96 },
    { x: 180, y: 600, w: 90, h: 190 },
    // Couverture — refuge.
    { x: 1700, y: 560, w: 96, h: 96 },
    { x: 1980, y: 560, w: 96, h: 96 },
  ],
};

/**
 * Paires de portails.
 *  - VERT : fixe, relie grande salle ↔ refuge (3 entrées réparties pour ne
 *    jamais coincer un joueur loin d'une sortie).
 *  - BLEU / ORANGE : itinérantes, dans la grande salle uniquement.
 */
export const PORTAL_PAIRS: PortalPairSpawn[] = [
  { color: 'green', roaming: false, a: { x: 560, y: 360 }, b: { x: 1720, y: 360 }, aRegion: 'main', bRegion: 'refuge' },
  { color: 'green', roaming: false, a: { x: 560, y: 1000 }, b: { x: 2030, y: 1000 }, aRegion: 'main', bRegion: 'refuge' },
  { color: 'green', roaming: false, a: { x: 1340, y: 680 }, b: { x: 1880, y: 680 }, aRegion: 'main', bRegion: 'refuge' },
  { color: 'blue', roaming: true, a: { x: 820, y: 360 }, b: { x: 1220, y: 940 }, aRegion: 'main', bRegion: 'main' },
  { color: 'orange', roaming: true, a: { x: 360, y: 680 }, b: { x: 1300, y: 360 }, aRegion: 'main', bRegion: 'main' },
];

export const PORTAL_CFG: PortalConfig = {
  triggerRadius: 40,
  landingOffset: 72,
  cooldownMs: 750,
  relocateMs: 13000,
};

export const NEURO_CFG: NeuroConfig = {
  graceMs: 9000,
  mainBaseDps: 8,
  mainSlope: 1.6,
  finalMs: 55000,
  refugeBaseDps: 6,
  refugeSlope: 1.4,
  refugeMinX: REFUGE_MIN_X,
};
