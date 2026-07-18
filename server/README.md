# Serveur temps-réel Projet Nyxt

Petit serveur [Colyseus](https://colyseus.io/) (Node.js) qui héberge les parties
en ligne. Le jeu (client) reste sur `nyxt.sleeplow.ca` ; ce serveur, lui, tourne
sur une machine toujours allumée (l'iMac).

## Prérequis

- **Node.js 18+** (`node -v` pour vérifier). Sur un vieux macOS, installer la
  dernière version LTS compatible depuis nodejs.org.

## Lancer le serveur

Depuis la racine du dépôt :

```bash
npm install      # installe les dépendances (une seule fois)
npm run server   # démarre le serveur sur le port 2567
```

Au démarrage il affiche :

```
⚽ Serveur Nyxt en écoute sur ws://localhost:2567
```

Le serveur redémarre tout seul si on modifie le code (`tsx watch`).

## Comment le client s'y connecte

- **En développement local** (sur la même machine) : le client vise
  automatiquement `ws://localhost:2567`.
- **En réseau local** (l'iMac + un autre appareil à la maison) : builder le
  client avec l'adresse locale de l'iMac, p.ex.
  `VITE_NYXT_SERVER="ws://192.168.1.42:2567" npm run build`
  (remplacer par l'IP locale de l'iMac).
- **Sur Internet** (jouer avec un ami à distance) : il faut rendre le port 2567
  de l'iMac accessible depuis l'extérieur — redirection de port sur la box, ou
  un tunnel (Cloudflare Tunnel / ngrok). Idéalement en **wss://** (chiffré), sinon
  les navigateurs bloquent les WebSocket non sécurisés depuis une page https.
  On configurera ça ensemble une fois l'iMac prêt.

## Ce que fait le serveur

- Il fait **autorité** sur la partie : il reçoit les intentions des joueurs
  (`InputState`), fait tourner la simulation (partagée avec le client, dans
  `src/shared/`) et diffuse l'état (positions) ~30 fois/seconde.
- Un **salon** = une partie. Son id sert de **code** à partager pour jouer avec
  un ami. Le « match rapide » place les joueurs dans un salon ouvert au hasard.
