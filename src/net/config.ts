const STORAGE_KEY = 'nyxt.server';

/** Adresse fixe du serveur de jeu (sous-domaine du domaine, HTTPS/WSS auto via Caddy). */
const DEFAULT_SERVER = 'wss://game.sleeplow.ca';

/**
 * URL du serveur temps-réel, configurable À L'EXÉCUTION (sans re-déployer) :
 *
 *  1. `?server=wss://…` dans l'URL → mémorisé (pratique pour un tunnel dont
 *     l'adresse change, et facile à partager à un ami). `?server=reset` efface.
 *  2. sinon, la dernière valeur mémorisée (localStorage).
 *  3. sinon, la valeur figée au build (`VITE_NYXT_SERVER`).
 *  4. sinon, en build déployé → l'adresse fixe `game.sleeplow.ca` ;
 *     en dev (localhost) → le serveur local.
 */
export function serverUrl(): string {
  if (typeof location !== 'undefined') {
    const q = new URLSearchParams(location.search).get('server');
    if (q) {
      try {
        if (q === 'reset') localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, q);
      } catch {
        /* localStorage indisponible */
      }
    }
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  } catch {
    /* localStorage indisponible */
  }

  const configured = import.meta.env.VITE_NYXT_SERVER as string | undefined;
  if (configured) return configured;

  // En dev (localhost) on vise le serveur local ; une fois déployé (QA/prod),
  // on vise l'adresse fixe du serveur de jeu.
  return import.meta.env.DEV ? 'ws://localhost:2567' : DEFAULT_SERVER;
}
