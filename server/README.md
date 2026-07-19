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

## Hébergement durable (recommandé) : adresse fixe `wss://gamenyxt.sleeplow.ca`

Le client vise par défaut **`wss://gamenyxt.sleeplow.ca`** une fois déployé (voir
`src/net/config.ts`). L'idée : une petite machine toujours allumée fait tourner
le serveur, et le sous-domaine `gamenyxt.sleeplow.ca` (géré dans la zone DNS du
domaine) pointe dessus. Plus d'URL au hasard.

### Machine : Oracle Cloud Always Free (Ubuntu, région Montréal)

1. **Compte Oracle Cloud** — au moment de l'inscription, choisir la région
   d'origine **Canada Southeast (Montreal)** (elle ne se change plus après).
2. **Créer une instance** Compute → Ubuntu 22.04, forme *Always Free*
   (`VM.Standard.E2.1.Micro` ou `A1.Flex`), avec IP publique + clé SSH.
3. **Security List** de la machine : ouvrir en entrée **TCP 80 et 443**
   (`0.0.0.0/0`).
4. **DNS** (WHC) : ajouter un enregistrement **A** `gamenyxt` → l'IP publique de la
   machine (même endroit que le `nyxt` vers GitHub Pages).
5. **Installer le serveur** (en SSH sur la machine) :
   ```bash
   curl -fsSL https://raw.githubusercontent.com/Sleeplow/ProjetNyx/qa/server/deploy/setup-oracle.sh -o setup.sh
   sudo bash setup.sh
   ```
   Le script (`server/deploy/setup-oracle.sh`) installe Node + Caddy, ouvre le
   pare-feu interne, télécharge le bundle, crée un service qui redémarre tout
   seul, et **obtient le certificat HTTPS automatiquement** pour le domaine.

Ensuite le jeu se connecte à `wss://gamenyxt.sleeplow.ca` sans rien à configurer.
Mettre le serveur à jour = relancer `sudo bash setup.sh`.

## Tunnel (dépannage / test rapide seulement)

Pour tester vite sans machine dédiée, un tunnel donne une URL publique **wss://**
temporaire. Sur un vieux macOS où cloudflared plante, un **tunnel SSH** marche
(aucun binaire) :
```bash
ssh -o StrictHostKeyChecking=no -R 80:localhost:2567 nokey@localhost.run
```
Il affiche `https://xxxx.lhr.life` → à passer au client en `?server=wss://xxxx.lhr.life`.
⚠️ L'URL **change à chaque reconnexion** — c'est pourquoi l'hébergement durable
ci-dessus est préférable.

Sur le réseau local : entrer `ws://192.168.x.y:2567` dans le lobby (« Serveur »).

## Ce que fait le serveur

Il fait **autorité** sur la partie : il reçoit les intentions (`InputState`),
fait tourner la simulation de match (`src/shared/game/MatchSim.ts`) et diffuse
un snapshot ~30 fois/seconde. Un **salon** = une partie ; son id sert de code à
partager. Les places vides sont comblées par des bots.
