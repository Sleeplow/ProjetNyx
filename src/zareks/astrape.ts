import type { ZarekDef } from '../core/types';

/**
 * Astrapé — quatrième Zarek, mage FOUDRE (personnification grecque de l'éclair,
 * suivante de Zeus ; colle au panthéon nocturne de Nyx).
 *
 * Attaque : « Éclair » — foudroie UNIQUEMENT l'ennemi le plus proche (dans la
 * portée). Instantané, aucun rebond.
 * Ultimate : « Surcharge » — c'est ELLE qui fait l'éclair en chaîne : rebondit
 * d'ennemi en ennemi (jamais deux fois le même), jusqu'à 4 cibles, portée plus
 * longue, −25 % de dégâts à chaque rebond. Se charge en ~4,5 s de frappe
 * continue — un peu plus long que les autres Zareks, pas davantage.
 */
export const ASTRAPE: ZarekDef = {
  id: 'astrape',
  name: 'Astrapé',
  role: 'mage',
  description:
    'Mage foudre, fragile. Attaque : éclair instantané sur l’ennemi le plus proche. Ultimate : Surcharge — éclair en chaîne qui rebondit jusqu’à 4 ennemis (−25 % par rebond) avec une longue portée.',
  color: 0xffd23f,
  accent: 0xfff3b0,
  maxHealth: 850,
  moveSpeed: 220,
  radius: 22,
  attack: {
    kind: 'chain',
    label: 'Éclair',
    reloadMs: 850,
    count: 1,
    spreadDeg: 0,
    damage: 140, // besoin de ~2 coups de plus qu'avant pour un même total
    range: 360, // portée de la cible
    speed: 0, // instantané (pas de projectile)
    projRadius: 0,
    chainMaxJumps: 0, // touche uniquement le plus proche (aucun rebond)
  },
  ultimate: {
    kind: 'chain',
    label: 'Surcharge',
    damage: 140, // même dégât de base que l'attaque normale
    radius: 440, // portée de la première cible (plus longue que l'attaque)
    knockback: 0,
    slowMs: 900,
    slowFactor: 0.6,
    chainJumpRange: 400, // rebonds longue distance
    chainMaxJumps: 3, // 1ʳᵉ cible + 3 rebonds = jusqu'à 4 cibles
    chainFalloff: 0.75, // −25 % par cible touchée
  },
  /**
   * Charge d'ult calibrée sur le TEMPS, pas sur le coefficient.
   *
   * Le coefficient s'applique aux dégâts infligés : à 0.06 comme les autres,
   * Astrapé mettait ~10 s à remplir sa jauge, contre ~2,5 s pour Zephyr et
   * ~3,3 s pour Atlas — non pas parce qu'elle chargeait « moins vite », mais
   * parce que son attaque ne touche QU'UNE cible sans rebond (~165 dégâts/s
   * contre ~610-655 pour eux). Le coefficient est justement là pour compenser
   * un profil de dégâts atypique.
   *
   * 0.135 → ~4,5 s de frappe continue : dans la même famille que les autres,
   * un peu plus long parce que la Surcharge touche jusqu'à 4 ennemis.
   */
  ultChargePerDamage: 0.135,
  // Voix : claquement d'éclair sec ; vrai coup de tonnerre pour la Surcharge.
  sound: { attack: 'bolt_astrape', ult: 'ult_thunder' },
  sprite: {
    dirs: 8,
    yawOffsetDeg: 90,
    spin: -1,
    scale: 0.405,
    footY: 0,
    idle: { key: 'astrape_idle', cols: 1, frameRate: 1 },
    walk: { key: 'astrape_walk', cols: 8, frameRate: 10 },
  },
};
