import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './GameRoom';

/**
 * Serveur temps-réel Projet Nyxt (Colyseus). Destiné à tourner sur une machine
 * toujours allumée (ex. l'iMac). `npm run server` le lance en local.
 *
 * Le client (sur nyxt.sleeplow.ca) s'y connecte en WebSocket. Un salon = une
 * partie ; son id sert de « code » à partager pour jouer avec un ami.
 */
const port = Number(process.env.PORT) || 2567;

/**
 * N'accepte les connexions WebSocket que depuis des origines connues (anti-abus :
 * empêche un autre site d'ouvrir des connexions vers ce serveur depuis un
 * navigateur). Les navigateurs envoient toujours une `Origin` pour un WebSocket.
 *
 * Autorisé : le domaine du jeu (`*.sleeplow.ca`), le développement local
 * (`localhost` / `127.0.0.1`) et le réseau local privé (test LAN). On peut en
 * ajouter via la variable d'env `NYXT_ALLOWED_ORIGINS` (hôtes séparés par des virgules).
 */
function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return false;
  let host: string;
  try {
    host = new URL(origin).hostname;
  } catch {
    return false;
  }
  if (host === 'localhost' || host === '127.0.0.1') return true;
  if (host === 'sleeplow.ca' || host.endsWith('.sleeplow.ca')) return true;
  // Réseaux privés (test sur LAN) : 192.168.*, 10.*, 172.16–31.*
  if (/^192\.168\./.test(host) || /^10\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  const extra = (process.env.NYXT_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return extra.includes(host);
}

const gameServer = new Server({
  transport: new WebSocketTransport({
    // Les messages de jeu sont minuscules (intentions) : 16 Ko borne largement
    // les envois abusifs sans risque de couper une communication légitime.
    maxPayload: 16 * 1024,
    // Filtrage d'origine sur la poignée de main WebSocket.
    verifyClient: (info, next) => next(isAllowedOrigin(info.origin)),
  }),
});

// « nyxt » : le type de salon (create / joinById / joinOrCreate côté client).
// filterBy(mode) : le match rapide ne mélange jamais Brawl Ball et Battle Royale.
gameServer.define('nyxt', GameRoom).filterBy(['mode']);

gameServer
  .listen(port)
  .then(() => console.log(`⚽ Serveur Nyxt en écoute sur ws://localhost:${port}`))
  .catch((err) => {
    console.error('Échec du démarrage du serveur :', err);
    process.exit(1);
  });
