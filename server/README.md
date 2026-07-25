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
5. **Installer le serveur** (en SSH sur la machine, **une seule fois**) :
   ```bash
   curl -fsSL https://raw.githubusercontent.com/Sleeplow/ProjetNyx/main/server/deploy/setup-oracle.sh -o setup.sh
   sudo bash setup.sh
   ```
   Le script (`server/deploy/setup-oracle.sh`) installe Node + Caddy, ouvre le
   pare-feu interne, télécharge le bundle, crée un service qui redémarre tout
   seul, **obtient le certificat HTTPS automatiquement**, et installe la **mise à
   jour automatique**.

Ensuite le jeu se connecte à `wss://gamenyxt.sleeplow.ca` sans rien à configurer.

### Mise à jour AUTOMATIQUE (sans SSH)

`setup-oracle.sh` installe un minuteur systemd (`nyxt-update.timer`) qui, toutes
les ~2 min, **télécharge** le bundle de la branche suivie (`main` par défaut) et
le redéploie **s'il a changé** — avec **rollback automatique** si `/health` ne
répond pas après redémarrage.

- **Déclencheur** : une promotion `qa → main` → la VM se met à jour ~2 min après.
- **Sûr sur repo public** : la VM ne fait que `curl` un fichier précis, elle
  **n'exécute jamais de code de PR** (contrairement à un runner auto-hébergé,
  déconseillé sur repo public).
- Réglages : `BRANCH=…` (branche suivie), `AUTO_UPDATE_MINUTES=0` (désactive),
  `journalctl -t nyxt-update -f` (logs), `systemctl list-timers nyxt-update.timer`.

Mise à jour manuelle si besoin : relancer `sudo bash setup.sh`.

### Mises à jour de la MACHINE (OS / kernel / Node / Caddy)

L'auto-updater ci-dessus ne met à jour que **le jeu**. La **machine** elle-même
(Ubuntu, kernel, OpenSSL, OpenSSH…) est patchée automatiquement par
`unattended-upgrades`, installé par `setup.sh` :

- **Correctifs de sécurité OS** appliqués tout seuls ; **reboot auto à 4 h** si un
  correctif kernel l'exige (le jeu redémarre au boot).
- **Savoir ce qui est en attente** (si tu te connectes) :
  ```bash
  apt list --upgradable              # paquets à mettre à jour
  test -f /var/run/reboot-required && echo "reboot requis"
  cat /var/log/unattended-upgrades/unattended-upgrades.log   # ce qui a été appliqué
  ```
  *(La bannière SSH d'Ubuntu affiche déjà « X updates » et « reboot required ».)*
- **Node & Caddy** (dépôts tiers, hors sécurité Ubuntu) ne montent pas de version
  majeure tout seuls. Pour les rafraîchir dans leur version majeure, une fois de
  temps en temps :
  ```bash
  sudo apt-get update && sudo apt-get install -y --only-upgrade nodejs caddy
  sudo systemctl restart nyxt-server && sudo systemctl reload caddy
  ```

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
