/**
 * URL du serveur temps-réel. En dev local on tape le serveur local ; en prod on
 * pointera vers la machine hôte (l'iMac), fixée via la variable d'env Vite
 * `VITE_NYXT_SERVER` au build (ex. wss://nyxt-serveur.exemple).
 */
export function serverUrl(): string {
  const configured = import.meta.env.VITE_NYXT_SERVER as string | undefined;
  if (configured) return configured;
  if (typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    return 'ws://localhost:2567';
  }
  // Défaut tant que l'hôte public n'est pas configuré (le mode en ligne
  // affichera alors une erreur de connexion, ce qui est attendu).
  return 'ws://localhost:2567';
}
