import type { ZarekDef } from '../core/types';

/**
 * Zephyr — premier Zarek. Tireur agile et aérien (dieu du vent).
 *
 * Attaque de base : « Ondes sonores » — une enceinte portable projette des
 * ondes de musique vers la cible, à moyenne portée.
 * Ultimate : « Break Dance » — Zephyr tourne au sol et libère une onde de choc
 * circulaire qui REPOUSSE les ennemis proches, pour reprendre ses distances et
 * les canarder de loin ensuite (synergie tireur).
 */
export const ZEPHYR: ZarekDef = {
  id: 'zephyr',
  name: 'Zephyr',
  role: 'sharpshooter',
  description: 'Tireur agile. Projette des ondes sonores à moyenne portée. Ultimate : break dance qui repousse, pour reprendre ses distances et sniper.',
  color: 0x4dd6ff,
  accent: 0xeaffff,
  maxHealth: 900,
  moveSpeed: 230,
  radius: 22,
  attack: {
    kind: 'projectile',
    label: 'Ondes sonores',
    reloadMs: 550,
    count: 3,
    spreadDeg: 14,
    damage: 120,
    range: 460,
    speed: 620,
    projRadius: 9,
  },
  ultimate: {
    kind: 'shockwave',
    label: 'Break Dance',
    damage: 300,
    radius: 210,
    knockback: 650,
    slowMs: 0,
    slowFactor: 1,
  },
  ultChargePerDamage: 0.06,
  sprite: {
    dirs: 8,
    yawOffsetDeg: 90, // même bake camera qu'Atlas → même calibration
    spin: -1,
    scale: 0.405,
    footY: 0,
    idle: { key: 'zephyr_idle', cols: 1, frameRate: 1 },
    walk: { key: 'zephyr_walk', cols: 8, frameRate: 10 },
  },
};
