/**
 * Types partagés du jeu.
 *
 * Point clé de l'architecture « net-ready » : la simulation ne consomme JAMAIS
 * directement le clavier / la souris / le tactile. Chaque combattant est piloté
 * par un `InputState` (une « intention » produite chaque frame). Aujourd'hui cet
 * état vient d'un contrôleur local ou de l'IA. Demain il pourra venir du réseau,
 * sans toucher à la logique de jeu.
 */

/** Intention de jeu d'un combattant pour une frame. */
export interface InputState {
  /** Direction de déplacement, chaque axe dans [-1, 1]. */
  moveX: number;
  moveY: number;
  /** Direction de visée (vecteur, pas forcément normalisé). */
  aimX: number;
  aimY: number;
  /** Le combattant maintient/veut son attaque de base (tir continu, ou visée d'une potion). */
  attack: boolean;
  /** L'attaque vient d'être RELÂCHÉE cette frame (déclenche le lancer de potion visé). */
  attackReleased: boolean;
  /** Le combattant veut déclencher son ultimate. */
  ultimate: boolean;
}

/** Crée un InputState neutre (aucune action). */
export function emptyInput(): InputState {
  return { moveX: 0, moveY: 0, aimX: 1, aimY: 0, attack: false, attackReleased: false, ultimate: false };
}

/** Rôle d'un Zarek — sert à l'équilibrage et à l'IA. */
export type ZarekRole = 'sharpshooter' | 'tank' | 'assassin' | 'support' | 'mage';

/** Type d'attaque de base. Extensible : ajouter un `kind` = ajouter un comportement. */
export type AttackKind = 'projectile' | 'potion' | 'chain';

/** Définition de l'attaque de base d'un Zarek. */
export interface AttackDef {
  kind: AttackKind;
  label: string;
  /** Temps de recharge entre deux attaques (ms). */
  reloadMs: number;
  /** Nombre de projectiles par tir. */
  count: number;
  /** Dispersion totale du tir (degrés). */
  spreadDeg: number;
  /** Dégâts par projectile (avant bonus de cubes). */
  damage: number;
  /** Portée en pixels. */
  range: number;
  /** Vitesse des projectiles (px/s). */
  speed: number;
  /** Rayon d'un projectile (px). */
  projRadius: number;
  /** (kind 'potion') Rayon de la flaque au sol créée à l'atterrissage (px). */
  aoeRadius?: number;
  /** (kind 'potion') Durée de vie de la flaque avant dissipation (ms). */
  aoeDurationMs?: number;
  /** (kind 'potion') Dégâts par seconde infligés dans la flaque. */
  aoeDps?: number;
  /** (kind 'chain') Portée de rebond vers la cible suivante (px). */
  chainJumpRange?: number;
  /** (kind 'chain') Nombre de REBONDS après la première cible (2 → 3 cibles). */
  chainMaxJumps?: number;
  /** (kind 'chain') Facteur de dégâts appliqué à CHAQUE rebond (0.7 = −30 %). */
  chainFalloff?: number;
}

/** Type d'ultimate. Extensible de la même façon que les attaques. */
export type UltimateKind = 'shockwave' | 'aura' | 'chain';

/** Définition de l'ultimate d'un Zarek. */
export interface UltimateDef {
  kind: UltimateKind;
  label: string;
  /** Dégâts infligés (avant bonus de cubes). */
  damage: number;
  /** Rayon d'effet (px). */
  radius: number;
  /** Force de recul appliquée aux ennemis touchés (px/s). */
  knockback: number;
  /** Durée du ralentissement infligé (ms, 0 = aucun). */
  slowMs: number;
  /** Facteur de vitesse pendant le ralentissement (0.5 = 50% de vitesse). */
  slowFactor: number;
  /** (kind 'aura') Durée de vie de l'aura au sol (ms). */
  auraDurationMs?: number;
  /** (kind 'aura') Durée du poison qui persiste après avoir quitté l'aura (ms). */
  poisonMs?: number;
  /** (kind 'aura') Dégâts par seconde du poison. */
  poisonDps?: number;
  /** (kind 'chain') Portée de rebond de la méga-chaîne (px). */
  chainJumpRange?: number;
  /** (kind 'chain') Nombre de rebonds de la méga-chaîne. */
  chainMaxJumps?: number;
  /** (kind 'chain') Facteur de dégâts appliqué à CHAQUE rebond (0.75 = −25 %). */
  chainFalloff?: number;
}

/** Définition complète d'un Zarek (personnage jouable). Pilotée par les données. */
export interface ZarekDef {
  id: string;
  name: string;
  role: ZarekRole;
  /** Courte description affichée à la sélection. */
  description: string;
  /** Couleur principale (placeholder art). */
  color: number;
  /** Couleur d'accent (contour, indicateur de visée). */
  accent: number;
  /** Points de vie de base. */
  maxHealth: number;
  /** Vitesse de déplacement (px/s). */
  moveSpeed: number;
  /** Rayon du corps (px) — collisions et taille visuelle. */
  radius: number;
  attack: AttackDef;
  ultimate: UltimateDef;
  /**
   * Charge d'ultimate gagnée par point de dégât infligé (%).
   * Ex. 0.06 → il faut infliger ~1670 dégâts pour remplir la jauge (100%),
   * soit plusieurs salves qui touchent — pas une seule.
   */
  ultChargePerDamage: number;
  /** Rendu en sprite 3D→2D (skill `sprite-bake`) au lieu des formes vectorielles. Absent = rendu vectoriel (par défaut). */
  sprite?: ZarekSpriteDef;
}

/** Une sheet baked (voir `.claude/skills/sprite-bake`) : lignes = directions, colonnes = frames. */
export interface SpriteAnimDef {
  /** Clé de l'asset chargé via `this.load.spritesheet` (voir BootScene). */
  key: string;
  cols: number;
  frameRate: number;
}

/** Rendu sprite d'un Zarek : jeu d'animations baked depuis un modèle 3D. */
export interface ZarekSpriteDef {
  /** Nombre de directions (lignes) des sheets — doit être identique pour idle/walk. */
  dirs: number;
  /**
   * Rotation (degrés) à ajouter à l'angle écran avant de choisir la ligne, pour
   * aligner la convention de la sheet (rangée 0 = quelle direction ?) sur l'angle
   * écran du jeu (0 = droite, sens horaire). Calibré à l'œil sur une capture.
   */
  yawOffsetDeg: number;
  /** Sens de rotation de la sheet vs l'angle écran (−1 si les rangées tournent à l'inverse). */
  spin: 1 | -1;
  /** Échelle d'affichage (les frames baked font 256×256 par défaut). */
  scale: number;
  /** Décalage vertical (px) pour poser les pieds au sol comme l'avatar vectoriel. */
  footY: number;
  idle: SpriteAnimDef;
  walk: SpriteAnimDef;
}

/** Rectangle simple (buissons, obstacles). */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Définition d'une carte / tableau. Pilotée par les données. */
export interface MapDef {
  id: string;
  name: string;
  /** Dimensions du terrain (px). */
  width: number;
  height: number;
  /** Zones de buissons (cachette). */
  bushes: Rect[];
  /** Obstacles solides (rochers, caisses) bloquant déplacements et projectiles. */
  obstacles: Rect[];
}
