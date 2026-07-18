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

const gameServer = new Server({
  transport: new WebSocketTransport(),
});

// « nyxt » : le type de salon (create / joinById / joinOrCreate côté client).
gameServer.define('nyxt', GameRoom);

gameServer
  .listen(port)
  .then(() => console.log(`⚽ Serveur Nyxt en écoute sur ws://localhost:${port}`))
  .catch((err) => {
    console.error('Échec du démarrage du serveur :', err);
    process.exit(1);
  });
