/**
 * Registre des modes de jeu (métadonnées affichées à la sélection).
 *
 * Pour AJOUTER UN MODE : ajoute un `GameModeDef` ici (et sa logique dans un
 * fichier dédié, sur le modèle de `battleRoyale.ts`). Le sélecteur de mode le
 * prend en charge automatiquement.
 */
export interface GameModeDef {
  id: string;
  name: string;
  /** Accroche courte. */
  tagline: string;
  /** Description affichée dans la carte du sélecteur. */
  description: string;
}

export const BATTLE_ROYALE: GameModeDef = {
  id: 'battle-royale',
  name: 'Battle Royale — Classic',
  tagline: 'Dernier survivant',
  description: '1 joueur contre 4 NPC. La zone se referme, ramasse des cubes de power-up et sois le dernier en vie.',
};

export const BATTLE_ROYALE_PORTAL: GameModeDef = {
  id: 'battle-royale-portal',
  name: 'Battle Royale — Portal',
  tagline: 'Portails & neurotoxine',
  description: 'Grande salle envahie par la neurotoxine. Prends un portail VERT pour fuir vers le refuge, exploite les portails itinérants… mais le refuge finit par se remplir aussi.',
};

export const BRAWL_BALL: GameModeDef = {
  id: 'brawl-ball',
  name: 'Brawl Ball',
  tagline: 'Football 3 v 3',
  description: 'Deux équipes de 3. Attrape la balle et marque dans le but adverse. Premier à 2 buts — ou but en or après 2 minutes.',
};

/** Ordre affiché dans le sélecteur (roulette). */
export const MODES: GameModeDef[] = [BATTLE_ROYALE, BATTLE_ROYALE_PORTAL, BRAWL_BALL];
