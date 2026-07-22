import { SERVERS, DEFAULT_SERVER_ID, serverById, type GameServer } from './servers';

/** Clé du serveur choisi (on ne mémorise que l'`id`, jamais une URL brute). */
const STORAGE_KEY = 'nyxt.serverId';
/** Ancienne clé (URL brute) purgée au chargement — voir `currentServer()`. */
const LEGACY_URL_KEY = 'nyxt.server';

/** Serveur par défaut : local en dev, officiel une fois déployé (QA / prod). */
function defaultServer(): GameServer {
  if (import.meta.env.DEV) return serverById('local') ?? SERVERS[0];
  return serverById(DEFAULT_SERVER_ID) ?? SERVERS[0];
}

/**
 * Serveur actuellement sélectionné : l'`id` mémorisé s'il désigne un serveur
 * connu, sinon le défaut.
 *
 * Comme on ne stocke qu'un `id` issu de la liste `SERVERS`, une valeur inconnue
 * (serveur retiré, stockage corrompu) retombe automatiquement sur le défaut :
 * fini le tunnel mort collé dans le navigateur. On en profite pour effacer
 * l'ANCIENNE clé d'URL brute (`nyxt.server`), source de ce bug.
 */
export function currentServer(): GameServer {
  try {
    localStorage.removeItem(LEGACY_URL_KEY); // migration : purge l'ancienne URL brute
    const found = serverById(localStorage.getItem(STORAGE_KEY));
    if (found) return found;
  } catch {
    /* localStorage indisponible */
  }
  return defaultServer();
}

/** URL WebSocket du serveur sélectionné (utilisée par le client réseau). */
export function serverUrl(): string {
  return currentServer().url;
}

/** Mémorise le serveur choisi (par `id` — jamais une URL arbitraire). */
export function selectServer(id: string): GameServer {
  const s = serverById(id) ?? defaultServer();
  try {
    localStorage.setItem(STORAGE_KEY, s.id);
  } catch {
    /* localStorage indisponible */
  }
  return s;
}
