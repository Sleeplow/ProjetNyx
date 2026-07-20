import Phaser from 'phaser';
import type { Rect } from '../core/types';

/**
 * Éléments de décor bakés via le skill `sprite-bake` (packs KayKit Forest
 * Nature + Dungeon). Contrairement aux Zareks, ce sont des objets STATIQUES :
 * un seul rendu par variante (pas de directions ni d'animation) — la variété
 * visuelle vient du choix du modèle source, pas d'une rotation.
 */
export interface PropDef {
  key: string;
  file: string;
  /** Échelle par défaut (image bakée 256px → taille écran raisonnable). */
  scale: number;
}

export const PROPS: PropDef[] = [
  { key: 'prop_rock1', file: 'rock1.png', scale: 0.5 }, // radius 0.50 — rocher simple
  { key: 'prop_rock2', file: 'rock2.png', scale: 0.85 }, // radius 1.52 — gros bloc rocheux
  { key: 'prop_rock3', file: 'rock3.png', scale: 0.65 }, // radius 0.76 — rocher moyen
  { key: 'prop_bush1', file: 'bush1.png', scale: 0.9 }, // radius 0.21 — petit buisson rond
  { key: 'prop_bush2', file: 'bush2.png', scale: 0.55 }, // radius 1.14 — haie taillée
  // KayKit Dungeon — décor du labo Portal.
  { key: 'prop_boxsmall', file: 'boxsmall.png', scale: 0.55 }, // radius 0.87 — caisse/conteneur métallique
  { key: 'prop_boxlarge', file: 'boxlarge.png', scale: 0.7 }, // radius 1.30
  { key: 'prop_crates', file: 'crates.png', scale: 0.75 }, // radius 1.87 — pile de caisses
  { key: 'prop_barrel', file: 'barrel.png', scale: 0.6 }, // radius 1.62 — tonneau
  { key: 'prop_wall', file: 'wall.png', scale: 0.89 }, // radius 2.87 — module de cloison (voir wallTileHeight)
];

export const ROCK_KEYS = ['prop_rock1', 'prop_rock2', 'prop_rock3'];
export const BUSH_KEYS = ['prop_bush1', 'prop_bush2'];
export const LAB_CRATE_KEYS = ['prop_boxsmall', 'prop_boxlarge', 'prop_crates', 'prop_barrel'];
export const WALL_KEY = 'prop_wall';
/** Taille source d'un bake (voir `size` dans les jobs sprite-bake) — sert à
 * calculer la hauteur réelle d'un module de cloison une fois mis à l'échelle. */
export const BAKE_SIZE = 256;

/** Choix stable (déterministe) d'une variante selon une position — les mêmes
 * coordonnées donnent toujours la même variante (pas de scintillement au
 * redraw), sans dépendre d'un compteur externe. */
export function pickPropKey(keys: string[], x: number, y: number): string {
  const h = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
  return keys[Math.floor(h * keys.length) % keys.length];
}

export function propScale(key: string): number {
  return PROPS.find((p) => p.key === key)?.scale ?? 1;
}

/** Pose un décor baké au sol avec une ombre douce (pour ne pas « flotter »).
 * Partagé entre le solo (`GameScene`) et l'en ligne (`OnlineGameScene`). */
export function drawPropAt(scene: Phaser.Scene, cx: number, cy: number, key: string, depth: number): void {
  const s = propScale(key);
  scene.add.ellipse(cx, cy + 46 * s, 150 * s, 56 * s, 0x000000, 0.22).setDepth(depth - 1);
  scene.add.image(cx, cy, key).setScale(s).setDepth(depth);
}

/** Cloison pleine hauteur : modules de mur bakés (KayKit Dungeon) empilés,
 * tournés 90° (le modèle source est un segment « large ») + fin liseré de
 * danger en écho au thème neurotoxine. Partagé solo/en ligne. */
export function drawWallDivider(scene: Phaser.Scene, o: Rect, depth: number): void {
  const scale = propScale(WALL_KEY);
  const cx = o.x + o.w / 2;
  // Le module (image carrée) fait BAKE_SIZE de haut affiché une fois tourné à
  // 90°. On arrondit AU-DESSUS le nombre de modules puis on resserre
  // l'espacement pour couvrir toute la hauteur — léger chevauchement plutôt
  // qu'un trou, sans avoir à étirer chaque image (scale simple, uniforme).
  const nominalTile = BAKE_SIZE * scale;
  const count = Math.max(1, Math.ceil(o.h / nominalTile));
  const tile = o.h / count;
  for (let i = 0; i < count; i++) {
    const cy = o.y + tile * (i + 0.5);
    scene.add.image(cx, cy, WALL_KEY).setScale(scale).setAngle(90).setDepth(depth);
  }
  const stripes = scene.add.graphics().setDepth(depth);
  stripes.fillStyle(0xffcf33, 0.45);
  for (let y = 0; y < o.h; y += 90) stripes.fillRect(o.x + 6, o.y + y + 30, o.w - 12, 14);
}
