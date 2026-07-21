/*
 * Service worker minimal pour Projet Nyxt (PWA installable + hors-ligne).
 * Stratégie : réseau d'abord, repli sur le cache (les assets sont hashés, donc
 * on met en cache au fil des requêtes — pas besoin de connaître leurs noms).
 */
const CACHE = 'nyxt-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
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
