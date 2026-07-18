/** Constantes globales de réglage du jeu. Centralisées ici pour équilibrer facilement. */

/** Palette d'ambiance (thème nocturne « Nyxt »). */
export const COLORS = {
  background: 0x0b0b1a,
  arenaFloor: 0x181832,
  arenaGrid: 0x24244a,
  bush: 0x1f7a3d,
  bushEdge: 0x2fae57,
  obstacle: 0x3a3a5c,
  obstacleEdge: 0x55557f,
  zoneBorder: 0x9b4dff,
  zoneDanger: 0x4a1d7a,
  powerCube: 0x66e0ff,
  poison: 0x86e05a,
  playerAccent: 0xffe066,
  healthGood: 0x46d160,
  healthLow: 0xe0473a,
  healthBack: 0x0e0e1c,
  ultReady: 0xffcf33,
  textLight: 0xf2f2ff,
  white: 0xffffff,
} as const;

/** Nombre de combattants dans une partie de Battle Royale (1 joueur + 4 NPC). */
export const PLAYERS_PER_MATCH = 5;

/** Réglages de la zone qui rétrécit (mode Battle Royale). */
export const ZONE = {
  /** Délai avant le premier rétrécissement (ms). */
  startDelayMs: 8000,
  /** Durée d'un palier de rétrécissement (ms). */
  shrinkStepMs: 12000,
  /** Temps de pause entre deux rétrécissements (ms). */
  restBetweenMs: 5000,
  /** Rayon final de la zone (px) — la zone ne descend jamais en dessous. */
  minRadius: 180,
  /** Dégâts par seconde hors zone (augmente à chaque palier). */
  baseDamagePerSecond: 6,
  damagePerSecondPerStep: 4,
} as const;

/** Réglages des cubes de power-up. */
export const POWER_CUBE = {
  /** Nombre de cubes dispersés au départ. */
  initialCount: 10,
  /** Bonus multiplicatif de PV max et de dégâts par cube (0.10 = +10%). */
  bonusPerCube: 0.1,
  /** Rayon de ramassage (px). */
  pickupRadius: 26,
  /** Rayon visuel du cube (px). */
  radius: 12,
  /** Un cube resté hors de la zone sûre disparaît après ce délai (ms). */
  outsideDespawnMs: 5000,
  /** Délai avant que les cubes « en trop » d'un combattant mort réapparaissent au hasard (ms). */
  respawnDelayMs: 5000,
} as const;

/** Régénération de vie hors combat (comme dans Brawl Stars). */
export const REGEN = {
  /** Délai sans tirer ni subir de dégâts avant que la régén démarre (ms). */
  delayMs: 1500,
  /** Fraction des PV max régénérée par seconde une fois la régén active. */
  percentPerSecond: 0.05,
} as const;

/** Réglages des buissons (cachette). */
export const BUSH = {
  /** Distance en deçà de laquelle un ennemi caché est repéré par l'IA (px). */
  revealRange: 90,
  /** Opacité d'un combattant caché dans un buisson. */
  hiddenAlpha: 0.28,
} as const;

/** Réglages de l'IA des NPC. */
export const AI = {
  /** Portée de détection d'une cible (px). */
  visionRange: 620,
  /** Le bot recharge son ultimate puis l'utilise dès qu'un ennemi est à cette portée (px). */
  ultUseRange: 220,
  /** Sous ce ratio de PV, le bot fuit le combat. */
  fleeHealthRatio: 0.3,
  /** Marge intérieure de la zone visée par le bot pour rester en sécurité (px). */
  zoneSafetyMargin: 70,
  /** Intervalle de re-décision de l'IA (ms) — évite de recalculer chaque frame. */
  rethinkMs: 250,
} as const;
