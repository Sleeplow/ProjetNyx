import type { ZarekDef } from '../core/types';

/**
 * Astrapé — quatrième Zarek, mage FOUDRE (personnification grecque de l'éclair,
 * suivante de Zeus ; colle au panthéon nocturne de Nyx).
 *
 * Attaque : « Éclair en chaîne » — foudroie l'ennemi le plus proche puis rebondit
 * de l'un à l'autre avec des dégâts décroissants. Redoutable quand ça se regroupe.
 * Ultimate : « Surcharge » — un éclair géant arc vers de NOMBREUX ennemis d'un
 * coup, gros dégâts + étourdit (ralentit). Volontairement long à charger.
 */
export const ASTRAPE: ZarekDef = {
  id: 'astrape',
  name: 'Astrapé',
  role: 'mage',
  description:
    'Mage foudre, fragile. Attaque : éclair en chaîne qui rebondit d’ennemi en ennemi (dégâts décroissants). Ultimate : Surcharge — un éclair géant frappe plusieurs ennemis et les étourdit.',
  color: 0xffd23f,
  accent: 0xfff3b0,
  maxHealth: 850,
  moveSpeed: 220,
  radius: 22,
  attack: {
    kind: 'chain',
    label: 'Éclair en chaîne',
    reloadMs: 850,
    count: 1,
    spreadDeg: 0,
    damage: 210,
    range: 360, // portée de la première cible
    speed: 0, // instantané (pas de projectile)
    projRadius: 0,
    chainJumpRange: 230,
    chainMaxJumps: 2, // 1ʳᵉ cible + 2 rebonds = 3 cibles
    chainFalloff: 0.68,
  },
  ultimate: {
    kind: 'chain',
    label: 'Surcharge',
    damage: 520,
    radius: 340, // portée de la première cible de l'ult
    knockback: 200,
    slowMs: 1300,
    slowFactor: 0.5,
    chainJumpRange: 320,
    chainMaxJumps: 5, // jusqu'à 6 cibles
  },
  // Charge d'ult LENTE (ult puissant) — ~0,035 → il faut infliger ~2860 dégâts.
  ultChargePerDamage: 0.035,
};
