import type { ZarekDef } from '../core/types';

/**
 * Atlas — deuxième Zarek, archétype TANK.
 *
 * Beaucoup de PV, lent, mais frappe fort à courte portée.
 * Attaque de base : « Impact » — une salve de projectiles lourds et larges,
 * puissante mais de courte portée.
 * Ultimate : « Séisme » — Atlas frappe le sol : onde de choc qui inflige de
 * gros dégâts, repousse ET ralentit les ennemis proches.
 */
export const ATLAS: ZarekDef = {
  id: 'atlas',
  name: 'Atlas',
  role: 'tank',
  description: 'Tank résistant. Frappe lourde à courte portée. Ultimate : séisme qui repousse et ralentit.',
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
    knockback: 620,
    slowMs: 2500,
    slowFactor: 0.45,
  },
  ultChargePerDamage: 0.5,
};
