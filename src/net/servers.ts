/**
 * Registre des serveurs de jeu sélectionnables.
 *
 * Pour AJOUTER UN SERVEUR : ajoute une entrée `{ id, label, url }` à la liste
 * `SERVERS` ci-dessous. Il apparaît aussitôt dans le sélecteur du menu En ligne.
 *
 * Les URLs ne viennent QUE de cette liste figée : le client ne mémorise que
 * l'`id` du serveur choisi, jamais une URL arbitraire. C'est ce qui évite qu'un
 * lien piégé ou un vieux tunnel mort reste collé dans le navigateur.
 */
export interface GameServer {
  /** Clé stable mémorisée dans le localStorage (jamais une URL). */
  id: string;
  /** Nom affiché dans le sélecteur. */
  label: string;
  /** Adresse WebSocket du serveur (ws:// en local, wss:// en ligne). */
  url: string;
}

/** Liste des serveurs disponibles (le premier « officiel » est le défaut en ligne). */
export const SERVERS: GameServer[] = [
  { id: 'officiel', label: 'Officiel', url: 'wss://gamenyxt.sleeplow.ca' },
  { id: 'local', label: 'Local (dev)', url: 'ws://localhost:2567' },
];

/** Serveur par défaut une fois déployé (QA / prod). */
export const DEFAULT_SERVER_ID = 'officiel';

/** Retrouve un serveur par son id (undefined si l'id est inconnu). */
export function serverById(id: string | null | undefined): GameServer | undefined {
  return SERVERS.find((s) => s.id === id);
}
