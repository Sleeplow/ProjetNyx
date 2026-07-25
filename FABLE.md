# FABLE — Audit & feuille de route Projet Nyxt

Journal des analyses menées sur le projet : audit de sécurité / bonnes pratiques,
et pistes de features pour rapprocher le jeu de l'esprit **Brawl Stars** (« version
Dylan »). Ce fichier suit ce qui est **fait**, ce qui **reste à faire**, et les
notes associées.

> Dernière mise à jour : 2026-07-25

**Légende de statut**
- ✅ **Fait** — livré (voir le journal en bas)
- 🔧 **Partiel** — une partie est faite, le reste est noté
- ⏳ **À faire** — pas encore commencé
- 🖥️ **Serveur** — nécessite un accès SSH au serveur de jeu (pas déployable via la page web seule)

---

## 1. Audit de sécurité & bonnes pratiques

**Verdict global :** projet sain pour son type. Le serveur est **autoritaire**
(toute la simulation tourne dans `MatchSim`, le client n'envoie que des
intentions), les entrées client sont bornées (`sanitize()` dans
`server/GameRoom.ts`), aucun secret dans le repo, aucun `innerHTML`/`eval` côté
client, HTTPS/WSS automatique via Caddy.

### 🔴 Priorité haute

#### 1.1 Dépendances vulnérables — ✅ Quasi résolu (13 → 3, PR #21)
`npm audit` est passé de **13 avis à 3** ; les 3 restants (`nanoid`) ne nous
concernent pas (voir plus bas).
- **`esbuild`/`vite` 5** (GHSA-67mh-4wv8-2f99, dev-server) → ✅ **corrigé : Vite 7**
  (+ CI Node 22). Aucun impact runtime.
- **`uuid`, `elliptic`** via `@colyseus/auth` (inutilisé) → ✅ **éliminés** : on
  n'importe plus le méta-paquet `colyseus` mais **`@colyseus/core` directement**
  (retire aussi monitor/playground → bundle serveur plus léger).
- **`colyseus` 0.16 → `nanoid` < 3.3.8** (IDs « prévisibles ») → **laissé en 0.16.**
  Deux raisons : (1) la faille vise les tailles *non entières* ; Colyseus utilise
  une taille fixe → **non exploitable ici** ; (2) surtout, **le bump 0.17 est
  impossible** : il n'existe **aucun client `colyseus.js` compatible 0.17** (le
  dernier, 0.16.22, ne sait pas parler au matchmaking 0.17) — monter le serveur
  en 0.17 casserait le jeu en ligne pour *tous* les clients. À revoir si/quand un
  `colyseus.js` 0.17 est publié.
- ✅ `.github/dependabot.yml` (surveillance hebdo npm + actions).

#### 1.2 CI : token en écriture sur le job qui exécute le code des PR — ✅ Fait
`deploy.yml` déclarait `permissions: contents: write` **au niveau global** : le
job `build` (qui tourne sur les PR et exécute `npm ci` + build) disposait donc
d'un token en écriture.
→ **Fait :** `contents: read` par défaut, `write` réservé aux jobs de déploiement.

#### 1.3 `?server=` — redirection persistante et silencieuse du client — ✅ Fait
Un lien piégé (`…/?server=wss://attaquant`) mémorisait durablement un serveur
hostile dans le `localStorage` (pseudo + trafic de jeu détournés), survivant à la
fermeture de l'onglet.
→ **Fait, puis renforcé :** d'abord validation stricte du schéma (`ws://`/`wss://`)
et purge des valeurs piégées (PR #14) ; ensuite **suppression complète de
`?server=`** au profit d'une liste de serveurs figée dans le code — une adresse
ne peut plus être injectée par un lien (PR #15).

### 🟠 Priorité moyenne

#### 1.4 Serveur de jeu : garde-fous anti-abus — ✅ Fait
La VM Oracle Always Free est petite ; plusieurs manques la rendaient facile à saturer.
- **Limite de salons** : ✅ plafond `MAX_ROOMS = 50` (`ServerError 4002` au-delà) (PR #19).
- **`maxPayload`** : ✅ borné à 16 Ko sur le WebSocket (PR #19).
- **Vérification d'`Origin`** : ✅ poignée de main WS restreinte à `*.sleeplow.ca` /
  `localhost` / LAN, extensible via `NYXT_ALLOWED_ORIGINS` ; opt-in sans-Origin via
  `NYXT_ALLOW_NO_ORIGIN` (PR #19 / #21).
- **Rate-limit** des messages : ✅ backstop `MAX_MSGS_PER_SEC = 240` par client
  (très au-dessus du débit légitime, coupe un flood) (PR #21).

#### 1.5 Salons « privés » pas vraiment privés — ✅ Fait (PR #19)
`client.create('nyxt', …)` créait un salon **public** : un inconnu en « Match
rapide » pouvait atterrir dans le salon créé pour un ami.
→ **Fait :** « Créer un salon » passe `private` → `setPrivate()` dans `onCreate` ;
le code de salon devient le seul moyen d'entrer.

#### 1.6 Divers — 🔧 Partiel
- **Pseudos** : caractères de contrôle acceptés → pollution des logs / de
  l'affichage (pas d'XSS, rendu Phaser). ✅ **Filtré côté client** (PR #14) **et
  côté serveur** (`GameRoom`, PR #19).
- **Service worker** (`public/sw.js`) : mettait en cache **tous** les GET, toutes
  origines, y compris les erreurs (une 404 pouvait devenir la page d'accueil
  hors-ligne). ✅ **Fait :** cache limité au **même-origine + réponses `ok`** (PR #14).
- `tsx` en `dependencies` alors qu'il ne sert qu'en dev → ✅ **déplacé en
  `devDependencies`** (PR #21).
- Bundle `server/nyxt-server.cjs` commité et téléchargé en prod depuis `qa` :
  → ✅ **la CI le rebuild et vérifie qu'il est à jour** (garde-fou anti-« oubli de
  rebuild ») + smoke test qui démarre le serveur et y connecte un client (PR #35).
- Durcissement `systemd` dans `setup-oracle.sh` → ✅ **fait** (`NoNewPrivileges`,
  `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`, `MemoryMax=512M`…) (PR #21 ;
  appliqué au prochain `sudo bash setup.sh`).

---

## 2. Prochaines features — « Brawl Stars version Dylan »

État des lieux : 3 modes (BR Classic, BR Portal, Brawl Ball), 4 Zareks avec
sprites 3D bakés, cubes de puissance, buissons, leaderboard de session, Cover
Flow, PWA. Ordre conseillé : **1 → 2 → 3 → 4**.

### 🔊 Feature 1 — Sons & musique — ⏳ À faire
**Petit effort, effet énorme.** Le jeu est **entièrement muet** — l'écart le plus
flagrant avec Brawl Stars, dont la moitié du feel vient de l'audio.
À ajouter : tirs / impacts / ult par Zarek, but + célébration, compte à rebours
« 3-2-1 », ramassage de cube, victoire/défaite, musique de menu + de match.
Sources CC0 : Kenney Audio, ou sons générés (jsfxr). Trivial avec Phaser
(`this.sound.play`) ; les événements `fx` du snapshot (`hit`, `goal`, `ult`,
`death`…) sont déjà le point d'accroche parfait côté en ligne.

### 🏆 Feature 2 — Trophées & déblocage des Zareks — ⏳ À faire
**La boucle « encore une partie ».** Le socle existe déjà : `SelectScene` a des
emplacements verrouillés, et `MatchSim` calcule déjà des points de classement.
- Trophées par Zarek en `localStorage` (`nyxt.trophies`) : BR = ±trophées selon
  le classement (+8 → −4), Brawl Ball = +8 victoire / +2 nul.
- **Route des trophées** qui déverrouille : Hecate à 40 🏆, Astrape à 120 🏆, puis
  les futurs Zareks ; les cartes verrouillées du Cover Flow affichent la condition.
- Écran de fin : « +6 🏆 » animé, total par Zarek sur sa carte de sélection.

### 💎 Feature 3 — Razzia de gemmes (Gem Grab) — ⏳ À faire
**Le mode emblématique**, presque gratuit vu l'architecture : mode d'équipe 3v3
**avec respawn**, exactement le chemin déjà codé pour Brawl Ball.
- Mine centrale : une gemme toutes les ~5 s (réutiliser `SimCube`).
- Gemmes portées tombent à la mort (éparpillées).
- Première équipe à tenir **10 gemmes** → compte à rebours de 15 s.
- Nouvelle carte symétrique (mine au centre), entrée dans `modes/registry.ts`,
  jouable solo (bots `SoccerBot` → `GemBot`) comme en ligne.

### 👥 Feature 4 — Battle Royale en duo (Duo Showdown) — ⏳ À faire
Variante BR à 3 équipes de 2 : jouer avec un ami contre le reste. Réutilise le
système d'équipes existant (en BR chaque joueur a déjà un `teamSeq` unique → il
suffit d'attribuer le même aux paires).
- Règle Brawl Stars : à la mort, réapparition après 15 s **tant que le coéquipier
  est vivant**.
- Les cubes ramassés profitent au duo.
Rend le jeu en ligne « avec un ami » vraiment fun sans être l'un contre l'autre.

---

## 2 bis. Robustesse réseau

### 🔁 Vérification de version client ↔ serveur (handshake au join) — 🔧 Fait (PR #19)
> **Code livré** (client + serveur). Actif une fois la VM redéployée. Tolérance
> transitoire : les clients sans version (prod pas encore à jour) sont acceptés ;
> à durcir (refuser aussi l'absence de `v`) quand prod aura le client à jour.
**Empêche un client périmé de jouer avec un serveur incompatible.** Un onglet
resté ouvert, un cache tenace ou un déploiement décalé peut faire tourner une
**vieille version** de la page qui parle un protocole différent du serveur
(format des snapshots/inputs, noms de messages, règles) → bugs silencieux.

**Point clé de conception :** comparer une **version de _protocole_**, PAS le
build exact. Sinon chaque déploiement forcerait tous les joueurs à recharger même
sans changement de contrat. On ne bump que quand le format client↔serveur change.

**Mécanique :**
1. `src/shared/version.ts` → `export const PROTOCOL_VERSION = 1`, importée par le
   **client ET le serveur** (même source → toujours d'accord à build égal).
2. **Client** (`NetClient`) : envoie `v: PROTOCOL_VERSION` dans les options de join.
3. **Serveur** (`GameRoom.onAuth`) : compare `options.v` à son `PROTOCOL_VERSION`.
   Différent (ou absent = vieux client) → rejette avec `ServerError(4001, 'VERSION_MISMATCH')`.
4. **Client** : sur ce rejet → message « Nouvelle version — rechargement… » +
   `location.reload()` (le SW réseau-d'abord récupère la version fraîche). Garde-fou
   anti-boucle : un seul reload automatique par session (drapeau `sessionStorage`).

**Quand bumper `PROTOCOL_VERSION` :** dès qu'on touche `snapshot.ts` (format
snapshot), `InputState` (`types.ts`), les noms de messages, ou une règle de match
que les deux côtés doivent partager.

**Découpage :**
- 🌐 **Moitié client** (page web, déployable seule) : constante partagée + envoi
  du `v` + gestion du rejet/reload. Inoffensive tant que le serveur ne vérifie
  pas (le champ `v` est simplement ignoré).
- 🖥️ **Moitié serveur** (nécessite SSH/redeploy) : le contrôle + le rejet dans
  `onAuth`. C'est elle qui fait « le serveur refuse ».
- **Recommandation :** livrer les deux **ensemble** (sur le MacBook), sinon
  l'enforcement reste inactif.

---

## 2 ter. Renforcement back-end — ✅ Fait (PR #32 → #35)

Solidification de la partie invisible (simulation autoritaire + infra), sans
toucher au fun (audio/gameplay gardés pour plus tard).

- **🧪 Filet de tests + typecheck serveur en CI** (PR #32) : vitest (env Node) sur
  la logique pure — géométrie, éclair en chaîne, et la **simulation de match
  complète** (BR de bout en bout, Brawl Ball, lobby, revanche, suspend/reprise).
  Le serveur, non typé-vérifié avant, l'est maintenant (`tsconfig.server.json`).
- **🤖 IA — variété + anti-stalemate + ramassage opportuniste** (PR #33) : les bots
  BR ont des **personnalités** (brawler/sniper/trickster/farmer/coward), tournent
  autour de l'ennemi au lieu de rester figés en miroir, et **dévient pour ramasser
  un cube** qu'ils frôlent en combat. Corrige les deux comportements observés.
- **🔌 Reconnexion** (PR #34) : une déconnexion subie (réseau mobile) garde la
  place ~20 s (`allowReconnection`) ; le client se reconnecte tout seul. Départ
  volontaire = bot immédiat.
- **🩺 Observabilité + smoke test** (PR #35) : sonde `/health` (port interne),
  arrêt gracieux (défaut Colyseus, explicité), et **smoke test en CI** (démarre le
  serveur, connecte un client, vérifie join/snapshot/handshake/health) + garde-fou
  « bundle serveur à jour ».

---

## 3. Journal des changements réalisés

Sauf mention contraire, côté **page web** (flux gh-pages `qa` → `/qa/`). La PR #19
touche aussi le **serveur** (redéploiement VM requis).

### PR #14 — Sécurité (page web) *(fusionnée dans `qa`)*
- Validation de l'URL serveur `?server=` (`ws://`/`wss://`) + purge des valeurs piégées.
- Filtrage des caractères de contrôle dans le pseudo (côté client).
- Service worker : cache limité au même-origine + réponses `ok`.
- CI : permissions au moindre privilège.
- Ajout de `.github/dependabot.yml`.

### PR #15 — Sélecteur de serveur en liste *(fusionnée dans `qa`)*
Corrige le bug vécu : un ancien tunnel (`…lhr.life`) mémorisé écrasait
silencieusement le serveur par défaut → échec de connexion en ligne.
- `src/net/servers.ts` (nouveau) : registre `SERVERS` figé (Officiel, Local) +
  serveurs **perso** mémorisés en local (`nyxt.customServers`), avec validation
  d'URL, dédoublonnage et plafond.
- `src/net/config.ts` : on ne mémorise qu'un **`id`** de serveur ; un id inconnu
  retombe sur le défaut ; l'ancienne clé `nyxt.server` (URL brute) est purgée au
  chargement (migration transparente).
- `src/scenes/OnlineMenuScene.ts` : tap = défile la liste ; boutons **＋ Ajouter**
  / **✕ Retirer** ; `?server=` supprimé.

### PR #16 — `FABLE.md` *(fusionnée dans `qa`)*
Ce fichier de suivi (audit, feuille de route, journal).

### PR #17 — Correctif PWA : cache de service worker versionné *(fusionnée dans `qa`)*
L'app installée sur l'écran d'accueil iPhone restait bloquée sur un écran vide
alors que Safari fonctionnait : le stockage « standalone » est séparé de Safari et
n'est **pas** vidé en supprimant l'icône ; l'ancien service worker gardait en
cache toutes les réponses sous un nom **jamais versionné** → cache empoisonné
jamais purgé.
- `public/sw.js` : nom de cache **versionné** (`v2` → purge auto de l'ancien à
  l'activation) et **propre à la portée** (`/` prod vs `/qa/` QA, pour qu'ils ne
  se purgent plus mutuellement).
- Récupération d'une app déjà cassée : vider Réglages → Safari → Avancé →
  Données de site web ; ensuite la purge devient automatique au lancement en ligne.

### PR #19 — Durcissement serveur *(fusionnée dans `qa`/`main` ; redéploiement VM requis)*
- **Handshake de version** client ↔ serveur : `src/shared/version.ts` (nouveau),
  envoi côté `NetClient`, refus côté `GameRoom.onAuth` (tolérant aux clients sans
  version), rechargement guidé côté `OnlineMenuScene`.
- **Rooms privées** : « Créer un salon » → `setPrivate()`.
- **Garde-fous** : plafond de salons (50), `maxPayload` 16 Ko, vérification d'`Origin`.
- **Sanitize serveur** du pseudo (longueur + caractères de contrôle).

### PR #20 / #30 — Promotions `qa` → `main` *(fusionnées)*
Mises en production successives de tout le travail (#14 → #21, puis suivants).

### PR #21 — Nettoyage des dépendances + fin des garde-fous *(redéploiement VM requis)*
- **Vite 5 → 7** (ferme l'avis esbuild dev-server) + CI **Node 22** + `tsx` en devDeps.
- **`@colyseus/core` direct** au lieu du méta-paquet `colyseus` → retire
  `@colyseus/auth` (elliptic/uuid) et monitor/playground. **`npm audit` : 13 → 3.**
  *(Bump 0.17 abandonné : aucun client `colyseus.js` compatible — cf. §1.1.)*
- **Rate-limit** serveur (240 msg/s/client) ; opt-in `NYXT_ALLOW_NO_ORIGIN`.
- **Durcissement systemd** dans `setup-oracle.sh`.
- Compat client 0.16.22 ↔ serveur (join, synchro d'état, snapshot, handshake)
  **validée localement**.

### PR #32 → #35 — Renforcement back-end *(#33/#34/#35 : redéploiement VM requis)*
Voir §2 ter. Tests + typecheck serveur en CI (#32) ; IA variée + anti-stalemate +
ramassage opportuniste (#33) ; reconnexion des joueurs (#34) ; `/health` + arrêt
gracieux + smoke test CI + garde-fou bundle (#35).

---

## 4. À faire ensuite (résumé)

| # | Sujet | Statut | Note |
|---|---|---|---|
| Sécu | `nanoid` (Colyseus 0.16) | ⚪ Sans objet | non exploitable (ID taille fixe) ; bump 0.17 bloqué (pas de client compatible) |
| Réseau | Durcir le handshake (refuser l'absence de `v`) | ⏳ 🖥️ | une fois les vieux clients prod expirés |
| Feat 1 | Sons & musique | ⏳ | prochain — gros impact, petit effort |
| Feat 2 | Trophées & déblocage Zareks | ⏳ | boucle de rétention |
| Feat 3 | Gem Grab | ⏳ | mode emblématique |
| Feat 4 | Duo Showdown | ⏳ | BR à deux |

**Sécurité ET renforcement back-end : bouclés.** Les seuls items ouverts sont un
durcissement optionnel du handshake et les **features fun** (audio en tête) —
à faire plus tard avec ton fils.
