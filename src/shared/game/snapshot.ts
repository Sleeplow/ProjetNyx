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
  winner: number; // -1 sauf en 'ended'
  players: SnapPlayer[];
  ball: { x: number; y: number; carrier: string | null };
  proj: SnapEntity[];
  haz: SnapEntity[];
  fx: FxEvent[];
}
