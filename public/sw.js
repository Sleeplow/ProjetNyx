/*
 * Service worker Projet Nyxt (PWA installable + hors-ligne).
 *
 * Stratégie : RÉSEAU D'ABORD. En ligne, on sert toujours la version fraîche (et
 * on la met en cache) ; hors-ligne, on retombe sur le cache.
 *
 * IMPORTANT — nom de cache VERSIONNÉ ET propre à la portée :
 *   - Versionné : incrémenter `VERSION` (v2 → v3…) purge l'ancien cache à
 *     l'activation. C'est LE correctif quand une app installée reste bloquée sur
 *     d'anciens fichiers (écran figé / vide après un déploiement) : le stockage
 *     du mode « standalone » iOS est séparé de Safari et n'est PAS vidé en
 *     supprimant l'icône — seul un changement de version (ou l'effacement des
 *     données de site) le purge.
 *   - Propre à la portée : prod (racine `/`) et QA (`/qa/`) partagent la même
 *     origine ; sans distinction, l'un purgerait le cache de l'autre. On suffixe
 *     donc le nom par la portée pour les isoler.
 */
const VERSION = 'v2';

// Portée du service worker : "/" en prod, "/qa/" en QA.
let SCOPE = '/';
try {
  SCOPE = new URL(self.registration.scope).pathname;
} catch {
  /* self.registration indisponible : on garde "/" */
}

const CACHE = `nyxt::${SCOPE}::${VERSION}`;
const SAME_SCOPE_PREFIX = `nyxt::${SCOPE}::`;
/** Ancien nom de cache (partagé prod/QA, non versionné) — à purger partout. */
const LEGACY_CACHE = 'nyxt-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          // Purge : l'ancien cache partagé + les versions périmées de CETTE portée
          // (jamais le cache courant de l'autre portée).
          .filter((k) => k === LEGACY_CACHE || (k.startsWith(SAME_SCOPE_PREFIX) && k !== CACHE))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  // SÉCURITÉ : on ne met en cache QUE nos propres assets (même origine). Sans ça,
  // une réponse tierce (opaque) ou une erreur pourrait empoisonner le cache et
  // être resservie plus tard — y compris comme page d'accueil hors-ligne.
  const sameOrigin = url.origin === self.location.origin;
  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req);
        // On ne met en cache que les réponses OK de même origine (jamais une 404/500).
        if (sameOrigin && res.ok) {
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        // Repli : la page d'accueil de l'app (pour la navigation hors-ligne).
        if (req.mode === 'navigate') {
          const home = await caches.match('./');
          if (home) return home;
        }
        throw new Error('offline and not cached');
      }
    })(),
  );
});
