/**
 * Format d'ÉTAT réseau diffusé par le serveur (autorité) et rendu par le client.
 * Clés courtes pour alléger. Partagé client + serveur (types uniquement).
 */

export type MatchPhase = 'lobby' | 'countdown' | 'playing' | 'goal' | 'ended';

export interface SnapPlayer {
  i: string; // id
  n: string; // pseudo
  t: number; // équipe (0 bleu / 1 rouge)
  z: string; // zarekId
  x: number;
  y: number;
  a: number; // angle de visée
  h: number; // vie
  hm: number; // vie max
  al: boolean; // vivant
  uc: number; // charge d'ultime 0..100
  carry: boolean; // porte la balle
  bot: boolean;
  rs: number; // ms avant réapparition (0 si vivant)
  cb?: number; // cubes de power-up ramassés (Battle Royale)
}

export interface SnapEntity {
  x: number;
  y: number;
  r: number;
  c: number; // couleur
}

/** Effet transitoire à jouer côté client (tir, ultime, but, frappe, éclair…). */
export interface FxEvent {
  k: 'hit' | 'ult' | 'goal' | 'kick' | 'death' | 'bolt';
  x: number;
  y: number;
  r?: number;
  c?: number;
  t?: number; // équipe (pour un but)
  x2?: number; // (kind 'bolt') extrémité de l'éclair
  y2?: number;
}

export interface MatchSnapshot {
  phase: MatchPhase;
  timer: number; // ms pertinents à la phase (compte à rebours / horloge de match)
  score: [number, number];
  sudden: boolean;
  winner: number; // -1 sauf en 'ended' (en BR : équipe/id du survivant)
  players: SnapPlayer[];
  ball: { x: number; y: number; carrier: string | null };
  proj: SnapEntity[];
  haz: SnapEntity[];
  fx: FxEvent[];
  /** Mode de jeu (le client adapte le rendu). Absent = 'brawl-ball' (rétro-compat). */
  mode?: 'brawl-ball' | 'battle-royale' | 'battle-royale-portal';
  /** (Battle Royale) Zone sûre qui rétrécit. */
  zone?: { x: number; y: number; r: number };
  /** (Battle Royale) Cubes de power-up au sol. */
  cubes?: SnapEntity[];
  /** (Battle Royale) Nombre de survivants. */
  alive?: number;
  /** (Portal) Portails : position + couleur (les itinérants bougent). */
  portals?: { x: number; y: number; c: number }[];
  /** (Portal) Intensité de la neurotoxine : m = grande salle, r = refuge (dégâts/s). */
  gas?: { m: number; r: number };
  /** Leaderboard cumulatif de la session (trié serveur, décroissant). */
  board?: { n: string; s: number; b: boolean }[];
}
