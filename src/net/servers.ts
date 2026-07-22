/**
 * Registre des serveurs de jeu sélectionnables.
 *
 * Deux sources :
 *   1. `SERVERS` — liste FIGÉE dans le code (Officiel, Local). Pour en ajouter un
 *      définitivement : une ligne `{ id, label, url }` ci-dessous.
 *   2. Serveurs PERSO — ajoutés par l'utilisateur au fil de l'eau et mémorisés
 *      dans le navigateur (localStorage). Utile pour brancher un tunnel.
 *
 * Le client ne mémorise que l'`id` du serveur choisi (jamais une URL brute pour
 * les serveurs figés). Un serveur perso est une OPTION de la liste, jamais le
 * défaut silencieux, et n'est ajouté que par une action explicite (jamais via un
 * lien `?server=`). C'est ce qui évite qu'une adresse piégée ou un tunnel mort
 * détourne durablement le jeu.
 */
export interface GameServer {
  /** Clé stable mémorisée dans le localStorage. */
  id: string;
  /** Nom affiché dans le sélecteur. */
  label: string;
  /** Adresse WebSocket du serveur (ws:// en local, wss:// en ligne). */
  url: string;
}

/** Liste des serveurs FIGÉS (le premier « officiel » est le défaut en ligne). */
export const SERVERS: GameServer[] = [
  { id: 'officiel', label: 'Officiel', url: 'wss://gamenyxt.sleeplow.ca' },
  { id: 'local', label: 'Local (dev)', url: 'ws://localhost:2567' },
];

/** Serveur par défaut une fois déployé (QA / prod). */
export const DEFAULT_SERVER_ID = 'officiel';

/** Clé localStorage des serveurs perso ; on en garde au plus quelques-uns. */
const CUSTOM_KEY = 'nyxt.customServers';
const MAX_CUSTOM = 6;

/** Un `id` de serveur perso est préfixé pour ne jamais entrer en collision. */
const CUSTOM_PREFIX = 'custom:';

/** Vrai si `id` désigne un serveur perso (par opposition à un serveur figé). */
export function isCustom(id: string): boolean {
  return id.startsWith(CUSTOM_PREFIX);
}

/** N'accepte qu'une URL WebSocket (`ws://` / `wss://`) bien formée. */
export function isValidServerUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'ws:' || u.protocol === 'wss:';
  } catch {
    return false;
  }
}

/** Libellé lisible dérivé d'une URL (son hôte), à défaut de nom donné. */
function hostLabel(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

interface StoredCustom {
  url: string;
  label?: string;
}

/** Lit la liste brute des serveurs perso (filtrée des entrées invalides). */
function readCustom(): StoredCustom[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr.filter((s): s is StoredCustom => !!s && typeof s.url === 'string' && isValidServerUrl(s.url)).slice(0, MAX_CUSTOM);
  } catch {
    return [];
  }
}

function writeCustom(list: StoredCustom[]): void {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list.slice(0, MAX_CUSTOM)));
  } catch {
    /* localStorage indisponible */
  }
}

/** Serveurs perso, sous forme de `GameServer` sélectionnables. */
export function customServers(): GameServer[] {
  return readCustom().map((s) => ({
    id: CUSTOM_PREFIX + s.url,
    label: s.label?.trim() || hostLabel(s.url),
    url: s.url,
  }));
}

/** Tous les serveurs sélectionnables : liste figée + serveurs perso. */
export function allServers(): GameServer[] {
  return [...SERVERS, ...customServers()];
}

/** Retrouve un serveur (figé ou perso) par son id. */
export function serverById(id: string | null | undefined): GameServer | undefined {
  if (!id) return undefined;
  return allServers().find((s) => s.id === id);
}

/**
 * Ajoute (ou remet en tête) un serveur perso. Renvoie son entrée, ou `null` si
 * l'URL n'est pas une adresse WebSocket valide.
 */
export function addCustomServer(url: string, label?: string): GameServer | null {
  const u = url.trim();
  if (!isValidServerUrl(u)) return null;
  const cleanLabel = label?.trim() || undefined;
  const list = readCustom().filter((s) => s.url !== u);
  list.unshift({ url: u, label: cleanLabel });
  writeCustom(list);
  return { id: CUSTOM_PREFIX + u, label: cleanLabel || hostLabel(u), url: u };
}

/** Retire un serveur perso par id (sans effet sur les serveurs figés). */
export function removeCustomServer(id: string): void {
  if (!isCustom(id)) return;
  const url = id.slice(CUSTOM_PREFIX.length);
  writeCustom(readCustom().filter((s) => s.url !== url));
}
