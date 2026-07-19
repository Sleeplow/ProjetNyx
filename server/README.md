# Serveur temps-réel Projet Nyxt

Serveur [Colyseus](https://colyseus.io/) (Node.js) qui héberge les parties en
ligne (Brawl Ball 3v3). Le jeu (client) reste sur `nyxt.sleeplow.ca` ; ce
serveur tourne sur une machine toujours allumée (l'iMac).

## Lancer le serveur (recommandé, y compris vieux macOS)

Un **bundle autonome** est fourni : `server/nyxt-server.cjs`. Il contient tout
(Colyseus inclus), donc **aucun `npm install` n'est nécessaire** — juste Node :

```bash
node server/nyxt-server.cjs
```

Au démarrage :

```
⚽ Serveur Nyxt en écoute sur ws://localhost:2567
```

C'est la méthode à privilégier sur les vieux macOS (Catalina…) où les outils de
build modernes (esbuild/tsx) plantent : ici on n'exécute que du JavaScript pur.

### Le garder allumé en arrière-plan

```bash
nohup node server/nyxt-server.cjs < /dev/null > ~/nyxt-server.log 2>&1 &
```

Le port se change avec `PORT=xxxx node server/nyxt-server.cjs`.

## Développement (machines récentes)

`npm run server` lance la version TypeScript avec `tsx` (rechargement auto).
Après une modification du code serveur, régénérer le bundle avant de committer :

```bash
npm run build:server
```

## Exposer le serveur sur Internet

- **Réseau local** : builder le client avec l'IP locale de la machine
  (`VITE_NYXT_SERVER="ws://192.168.x.y:2567" npm run build`), ou entrer l'adresse
  dans le lobby (« Serveur »).
- **Internet** : un tunnel donne une URL publique **wss://** sans toucher à la
  box. Sur un vieux macOS où cloudflared plante, un **tunnel SSH** fonctionne
  (aucun binaire) :
  ```bash
  ssh -o StrictHostKeyChecking=no -R 80:localhost:2567 nokey@localhost.run
  ```
  Il affiche une URL `https://xxxx.lhr.life` → à passer au client en `wss://…`.

## Ce que fait le serveur

Il fait **autorité** sur la partie : il reçoit les intentions (`InputState`),
fait tourner la simulation de match (`src/shared/game/MatchSim.ts`) et diffuse
un snapshot ~30 fois/seconde. Un **salon** = une partie ; son id sert de code à
partager. Les places vides sont comblées par des bots.
