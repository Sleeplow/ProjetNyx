# FABLE — Audit & feuille de route Projet Nyxt

Journal des analyses menées sur le projet : audit de sécurité / bonnes pratiques,
et pistes de features pour rapprocher le jeu de l'esprit **Brawl Stars** (« version
Dylan »). Ce fichier suit ce qui est **fait**, ce qui **reste à faire**, et les
notes associées.

> Dernière mise à jour : 2026-07-23

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

#### 1.1 Dépendances vulnérables — 🔧 Partiel
`npm audit` : 13 avis (2 faibles, 11 modérés).
- **`colyseus` 0.16 → `nanoid` < 3.3.8** (IDs prévisibles). Pertinent car **l'id
  de salon sert de « code » à partager** : des IDs devinables affaiblissent ce
  mécanisme. → **Correctif : Colyseus 0.17.** ⏳ 🖥️ (rebuild + redeploy serveur)
- **`esbuild`/`vite` 5** (GHSA-67mh-4wv8-2f99) : un site tiers peut interroger le
  serveur de dev et lire les réponses. Aggravé par `server: { host: true }`.
  Impact **dev uniquement**. → **Correctif : Vite 7** (breaking). ⏳
- `uuid`, `elliptic` via `@colyseus/auth` (non utilisé, hors bundle serveur). ⏳
- ✅ **Fait :** `.github/dependabot.yml` ajouté (surveillance hebdo npm + actions)
  — signalera automatiquement ces mises à jour à l'avenir.

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

#### 1.4 Serveur de jeu : garde-fous anti-abus — ⏳ 🖥️
La VM Oracle Always Free est petite ; plusieurs manques la rendent facile à saturer :
- **Pas de limite de salons** : chaque `create`/`joinOrCreate` démarre une
  simulation à 30 Hz → un script peut en créer des milliers.
- **Pas de `maxPayload`** sur `WebSocketTransport` (défaut `ws` : 100 Mo/message).
- **Pas de rate-limit** des messages `input`/`start`/`rematch`, ni de vérification d'`Origin`.
→ Correctifs peu coûteux : `new WebSocketTransport({ maxPayload: 4096 })`, compteur
global de salons (rejet au-delà de ~50), rate-limit IP côté Caddy.

#### 1.5 Salons « privés » pas vraiment privés — ⏳ 🖥️
`client.create('nyxt', …)` crée un salon **public** : un inconnu en « Match
rapide » (`joinOrCreate`) peut atterrir dans le salon créé pour un ami.
→ Correctif : flag `private` + `this.setPrivate()` dans `onCreate` → le code de
salon devient le seul moyen d'entrer.

#### 1.6 Divers — 🔧 Partiel
- **Pseudos** : caractères de contrôle acceptés → pollution des logs / de
  l'affichage (pas d'XSS, rendu Phaser). ✅ **Filtré côté client** (PR #14) ;
  ⏳ 🖥️ reste à filtrer **côté serveur** (`GameRoom`).
- **Service worker** (`public/sw.js`) : mettait en cache **tous** les GET, toutes
  origines, y compris les erreurs (une 404 pouvait devenir la page d'accueil
  hors-ligne). ✅ **Fait :** cache limité au **même-origine + réponses `ok`** (PR #14).
- `tsx` en `dependencies` alors qu'il ne sert qu'en dev → à déplacer en
  `devDependencies` (réduit la surface prod). ⏳ *(non fait : impose une mise à
  jour du lockfile / re-sync `npm ci` ; faible valeur, gardé pour un lot deps).*
- Bundle `server/nyxt-server.cjs` commité et téléchargé en prod depuis `qa` :
  fonctionne, mais un build en CI serait plus traçable. ⏳ 🖥️
- Durcissement `systemd` dans `setup-oracle.sh` (`NoNewPrivileges=true`,
  `ProtectSystem=strict`, `MemoryMax=`). ⏳ 🖥️

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

### 🔁 Vérification de version client ↔ serveur (handshake au join) — ⏳ 🖥️
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

## 3. Journal des changements réalisés

Tous côté **page web** (déployés via le flux gh-pages `qa` → `/qa/`, sans toucher
au serveur de jeu).

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

---

## 4. À faire ensuite (résumé)

| # | Sujet | Statut | Note |
|---|---|---|---|
| Sécu | Colyseus 0.17 (faille `nanoid`) | ⏳ 🖥️ | IDs de salon devinables |
| Sécu | Vite 7 (faille dev-server esbuild) | ⏳ | impact dev seulement |
| Sécu | Garde-fous serveur (`maxPayload`, plafond salons, rate-limit, `Origin`) | ⏳ 🖥️ | anti-abus |
| Sécu | Rooms privées (`setPrivate`) | ⏳ 🖥️ | « Créer un salon » réellement privé |
| Sécu | Sanitize pseudo côté serveur | ⏳ 🖥️ | client déjà filtré |
| Sécu | `tsx` → `devDependencies`, durcissement systemd | ⏳ | hygiène |
| Réseau | Handshake de version client ↔ serveur | ⏳ 🖥️ | client déployable seul ; enforcement = serveur |
| Feat 1 | Sons & musique | ⏳ | prochain — gros impact, petit effort |
| Feat 2 | Trophées & déblocage Zareks | ⏳ | boucle de rétention |
| Feat 3 | Gem Grab | ⏳ | mode emblématique |
| Feat 4 | Duo Showdown | ⏳ | BR à deux |
