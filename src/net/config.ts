const STORAGE_KEY = 'nyxt.server';

/** Adresse fixe du serveur de jeu (sous-domaine du domaine, HTTPS/WSS auto via Caddy). */
const DEFAULT_SERVER = 'wss://gamenyxt.sleeplow.ca';

/**
 * N'accepte qu'une URL de serveur WebSocket (`ws://` ou `wss://`) bien formée.
 *
 * SÉCURITÉ : sans ce garde-fou, un lien piégé du type
 * `https://nyxt.sleeplow.ca/?server=wss://attaquant.example` détournerait
 * DURABLEMENT le client de la victime (le pseudo et tout le trafic de jeu
 * partiraient vers un serveur hostile), car la valeur est mémorisée dans le
 * localStorage et survit à la fermeture de l'onglet. On rejette donc tout ce
 * qui n'est pas une URL WebSocket valide (y compris `javascript:`, `http:`…).
 */
export function isValidServerUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'ws:' || u.protocol === 'wss:';
  } catch {
    return false;
  }
}

/**
 * URL du serveur temps-réel, configurable À L'EXÉCUTION (sans re-déployer) :
 *
 *  1. `?server=wss://…` dans l'URL → mémorisé (pratique pour un tunnel dont
 *     l'adresse change, et facile à partager à un ami). `?server=reset` efface.
 *     Toute valeur qui n'est pas une URL `ws://`/`wss://` valide est IGNORÉE.
 *  2. sinon, la dernière valeur mémorisée (localStorage), elle aussi validée
 *     (une valeur invalide déjà stockée est purgée).
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
        else if (isValidServerUrl(q)) localStorage.setItem(STORAGE_KEY, q);
        // sinon : schéma non autorisé → valeur ignorée (ne pas mémoriser).
      } catch {
        /* localStorage indisponible */
      }
    }
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidServerUrl(saved)) return saved;
    // Purge une valeur invalide/piégée héritée d'une version antérieure.
    if (saved) localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* localStorage indisponible */
  }

  const configured = import.meta.env.VITE_NYXT_SERVER as string | undefined;
  if (configured) return configured;

  // En dev (localhost) on vise le serveur local ; une fois déployé (QA/prod),
  // on vise l'adresse fixe du serveur de jeu.
  return import.meta.env.DEV ? 'ws://localhost:2567' : DEFAULT_SERVER;
}
