import type { ZarekDef } from '../core/types';

/**
 * Zephyr — premier Zarek. Tireur agile et aérien (dieu du vent).
 *
 * Attaque de base : « Ondes sonores » — une enceinte portable projette des
 * ondes de musique vers la cible, à moyenne portée.
 * Ultimate : « Break Dance » — Zephyr tourne au sol et libère une onde de choc
 * circulaire qui repousse tous les ennemis proches.
 */
export const ZEPHYR: ZarekDef = {
  id: 'zephyr',
  name: 'Zephyr',
  role: 'sharpshooter',
  description: 'Tireur agile. Projette des ondes sonores à moyenne portée. Ultimate : onde de choc break dance.',
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
    knockback: 520,
    slowMs: 0,
    slowFactor: 1,
  },
  ultChargePerDamage: 0.06,
};
