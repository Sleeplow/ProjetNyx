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
  name: 'Battle Royale',
  tagline: 'Dernier survivant',
  description: '1 joueur contre 4 NPC. La zone se referme, ramasse des cubes de power-up et sois le dernier en vie.',
};

/** Ordre affiché dans le sélecteur (roulette). */
export const MODES: GameModeDef[] = [BATTLE_ROYALE];
