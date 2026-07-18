/** Constantes du mode Brawl Ball (football 3 v 3). Centralisées pour équilibrer. */

/** Équipes : couleur d'anneau + libellé (le joueur est en jaune, à part). */
export const TEAM = {
  /** Équipe 0 = celle du joueur (alliés en bleu). */
  colorA: 0x3aa0ff,
  /** Équipe 1 = adversaires (en rouge). */
  colorB: 0xff5a5a,
  labelA: 'BLEU',
  labelB: 'ROUGE',
} as const;

/** Dimensions et géométrie du terrain. */
export const PITCH = {
  width: 1960,
  height: 1180,
  /** Épaisseur des murs de contour (px). */
  wallThickness: 44,
  /** Hauteur de l'ouverture d'un but (px). */
  goalWidth: 360,
  /** Profondeur de la zone de but (px) — un ballon dont le centre y entre = but. */
  goalDepth: 44,
} as const;

/** Réglages de la balle. */
export const BALL = {
  radius: 20,
  /** Décroissance exponentielle de la vitesse par seconde (frottement du sol). */
  friction: 1.6,
  /** Vitesse d'un tir (px/s). */
  kickSpeed: 1050,
  /** Vitesse en dessous de laquelle la balle s'arrête net (px/s). */
  stopSpeed: 6,
  /** Rebond sur les murs (0 = amorti, 1 = parfait). */
  restitution: 0.62,
  /** Espace laissé devant le porteur (px). */
  carryOffset: 8,
  /** Le porteur se déplace un peu moins vite (0.9 = 90%). */
  carrySlowFactor: 0.9,
  /** Personne ne peut ramasser la balle juste après un tir (ms). */
  grabGraceMs: 130,
  /** Le tireur ne peut pas la reprendre pendant ce délai (ms). */
  kickerLockMs: 380,
  /** Tolérance de ramassage en plus des rayons (px). */
  grabPad: 6,
} as const;

/** Règles du match. */
export const SOCCER = {
  /** Combattants par équipe. */
  teamSize: 3,
  /** Délai de réapparition après élimination (ms). */
  respawnMs: 3000,
  /** Durée du temps réglementaire (ms) — 2 minutes. */
  matchMs: 120000,
  /** Nombre de buts pour gagner directement. */
  goalsToWin: 2,
  /** Pause de célébration après un but avant l'engagement (ms). */
  goalCelebrateMs: 1500,
  /** Petit gel au coup d'envoi, le temps de se placer (ms). */
  kickoffFreezeMs: 900,
  /** Portée à laquelle un bot porteur tente sa frappe au but (px). */
  botShootRange: 560,
} as const;
