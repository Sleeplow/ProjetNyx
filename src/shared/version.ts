/**
 * Version du PROTOCOLE réseau client ↔ serveur.
 *
 * À INCRÉMENTER UNIQUEMENT quand le contrat entre le client et le serveur change
 * (format des snapshots dans `game/snapshot.ts`, format de `InputState` dans
 * `core/types.ts`, noms des messages Colyseus, ou une règle de match que les deux
 * côtés doivent partager). **Pas** à chaque build : sinon chaque déploiement
 * forcerait tous les joueurs à recharger sans raison.
 *
 * Le client l'envoie au join ; le serveur la vérifie (`GameRoom.onAuth`) et
 * refuse un client dont la version ne correspond pas → le client recharge pour
 * récupérer la version fraîche.
 */
export const PROTOCOL_VERSION = 1;
