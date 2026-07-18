import type { MapDef, Rect } from '../core/types';
import { PITCH } from '../config/soccer';

/** Un but : sa zone de marque + le centre visé pour tirer. */
export interface Goal {
  zone: Rect;
  centerX: number;
  centerY: number;
}

/** Point d'apparition d'un combattant, avec un rôle qui oriente l'IA. */
export interface SpawnPoint {
  x: number;
  y: number;
  role: 'forward' | 'mid' | 'defender';
}

/**
 * Terrain de foot « Nyxt » (mode Brawl Ball). Construit à partir de PITCH :
 * un rectangle bordé de murs, avec une ouverture (but) au centre de chaque
 * petit côté. L'équipe 0 (joueur) défend la gauche et attaque la droite.
 */
export interface PitchDef {
  map: MapDef;
  /** Murs de contour (inclus dans map.obstacles pour les collisions). */
  walls: Rect[];
  leftGoal: Goal;
  rightGoal: Goal;
  spawnsTeam0: SpawnPoint[];
  spawnsTeam1: SpawnPoint[];
  ballStart: { x: number; y: number };
  centerX: number;
  centerY: number;
}

const W = PITCH.width;
const H = PITCH.height;
const T = PITCH.wallThickness;
const GAP = PITCH.goalWidth;
const gapTop = (H - GAP) / 2;
const gapBottom = (H + GAP) / 2;

const walls: Rect[] = [
  // Haut / bas : murs pleins sur toute la largeur.
  { x: 0, y: 0, w: W, h: T },
  { x: 0, y: H - T, w: W, h: T },
  // Gauche : deux segments laissant l'ouverture du but au milieu.
  { x: 0, y: 0, w: T, h: gapTop },
  { x: 0, y: gapBottom, w: T, h: H - gapBottom },
  // Droite : idem.
  { x: W - T, y: 0, w: T, h: gapTop },
  { x: W - T, y: gapBottom, w: T, h: H - gapBottom },
];

// Blocs de couverture intérieurs, symétriques — jamais au centre exact
// (sinon ils gêneraient l'engagement). Ils cassent les lignes de tir.
const cover: Rect[] = [
  { x: W / 2 - 45, y: H * 0.2, w: 90, h: 90 },
  { x: W / 2 - 45, y: H * 0.8 - 90, w: 90, h: 90 },
  { x: W * 0.3 - 45, y: H / 2 - 45, w: 90, h: 90 },
  { x: W * 0.7 - 45, y: H / 2 - 45, w: 90, h: 90 },
];

const map: MapDef = {
  id: 'pitch-nyxt',
  name: 'Stade Nyxt',
  width: W,
  height: H,
  bushes: [], // foot pur : pas de buissons (pas de furtivité pour rester lisible)
  obstacles: [...walls, ...cover],
};

export const PITCH_NYXT: PitchDef = {
  map,
  walls,
  leftGoal: { zone: { x: 0, y: gapTop, w: T, h: GAP }, centerX: T, centerY: H / 2 },
  rightGoal: { zone: { x: W - T, y: gapTop, w: T, h: GAP }, centerX: W - T, centerY: H / 2 },
  // Équipe 0 (attaque la droite) sur la moitié gauche.
  spawnsTeam0: [
    { x: W * 0.35, y: H * 0.5, role: 'mid' }, // emplacement du joueur (indice 0)
    { x: W * 0.19, y: H * 0.72, role: 'defender' },
    { x: W * 0.3, y: H * 0.26, role: 'forward' },
  ],
  // Équipe 1 (attaque la gauche) sur la moitié droite, en miroir.
  spawnsTeam1: [
    { x: W * 0.65, y: H * 0.5, role: 'mid' },
    { x: W * 0.81, y: H * 0.28, role: 'defender' },
    { x: W * 0.7, y: H * 0.74, role: 'forward' },
  ],
  ballStart: { x: W / 2, y: H / 2 },
  centerX: W / 2,
  centerY: H / 2,
};
