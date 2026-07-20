import type { ZarekDef } from '../core/types';

/**
 * Atlas — deuxième Zarek, archétype TANK.
 *
 * Beaucoup de PV, lent, mais frappe fort à courte portée.
 * Attaque de base : « Impact » — une salve de projectiles lourds et larges,
 * puissante mais de courte portée.
 * Ultimate : « Séisme » — Atlas frappe le sol : onde de choc qui inflige de
 * gros dégâts et RALENTIT fortement les ennemis proches SANS les repousser —
 * il les garde ainsi collés à sa courte portée pour les marteler (synergie tank).
 */
export const ATLAS: ZarekDef = {
  id: 'atlas',
  name: 'Atlas',
  role: 'tank',
  description: 'Tank résistant. Frappe lourde à courte portée. Ultimate : séisme qui ralentit fortement (garde les ennemis à portée).',
  color: 0xff8a3d,
  accent: 0xffd9b3,
  maxHealth: 1800,
  moveSpeed: 175,
  radius: 30,
  attack: {
    kind: 'projectile',
    label: 'Impact',
    reloadMs: 850,
    count: 2,
    spreadDeg: 22,
    damage: 260,
    range: 240,
    speed: 480,
    projRadius: 15,
  },
  ultimate: {
    kind: 'shockwave',
    label: 'Séisme',
    damage: 420,
    radius: 260,
    knockback: 0,
    slowMs: 3000,
    slowFactor: 0.4,
  },
  ultChargePerDamage: 0.05,
  sprite: {
    dirs: 8,
    yawOffsetDeg: 90, // calibré in-game : 0°(droite)→face captée à tort ; décalé pour que bas=face, haut=dos
    spin: -1,
    scale: 0.405, // -10% (retour utilisateur : trop gros à 0.45)
    footY: 0,
    idle: { key: 'atlas_idle', cols: 1, frameRate: 1 },
    walk: { key: 'atlas_walk', cols: 8, frameRate: 10 },
  },
};
