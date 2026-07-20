import type { ZarekDef } from '../core/types';

/**
 * Hécate — troisième Zarek, archétype MAGE / apothicaire (contrôle de terrain).
 *
 * Déesse grecque de la magie, des poisons et de la nuit (colle au thème Nyx).
 * Fragile mais domine par le contrôle de zone.
 * Attaque de base : « Potion toxique » — lance une fiole qui crée une flaque de
 * dégâts au sol, laquelle se dissipe après quelques secondes.
 * Ultimate : « Aura de poison » — dépose une zone qui RALENTIT et EMPOISONNE ;
 * les dégâts continus persistent quelques secondes même après en être sorti.
 */
export const HECATE: ZarekDef = {
  id: 'hecate',
  name: 'Hécate',
  role: 'mage',
  description: 'Mage de contrôle, fragile. Lance des potions qui créent des flaques de dégâts. Ultimate : aura qui ralentit et empoisonne (dégâts persistants).',
  color: 0xb06bff,
  accent: 0xe6ccff,
  maxHealth: 800,
  moveSpeed: 215,
  radius: 22,
  attack: {
    kind: 'potion',
    label: 'Potion toxique',
    reloadMs: 1000,
    count: 1,
    spreadDeg: 0,
    damage: 0,
    range: 340,
    speed: 520,
    projRadius: 11,
    aoeRadius: 90,
    aoeDurationMs: 2500,
    aoeDps: 170,
  },
  ultimate: {
    kind: 'aura',
    label: 'Aura de poison',
    damage: 0,
    radius: 200,
    knockback: 0,
    slowMs: 800,
    slowFactor: 0.55,
    auraDurationMs: 4000,
    poisonMs: 2500,
    poisonDps: 130,
  },
  ultChargePerDamage: 0.06,
  sprite: {
    dirs: 8,
    yawOffsetDeg: 90,
    spin: -1,
    scale: 0.405,
    footY: 0,
    idle: { key: 'hecate_idle', cols: 1, frameRate: 1 },
    walk: { key: 'hecate_walk', cols: 8, frameRate: 10 },
  },
};
