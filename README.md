# Projet Nyxt 🌙

Jeu web type **Brawl Stars**, jouable sur **ordinateur et tablette**. Première
version : un tableau en **Battle Royale**, **1 joueur contre 4 NPC**, dernier
survivant gagne.

Construit avec **Phaser 3 + TypeScript + Vite**. Les visuels actuels sont des
**placeholders** (formes/couleurs) : le gameplay est complet, l'art final se
branchera par-dessus sans toucher à la logique.

## Démarrer

```bash
npm install
npm run dev      # serveur de dev → http://localhost:5173
npm run build    # build de production dans dist/
npm run preview  # prévisualiser le build
```

## Contrôles

| | Déplacement | Viser / Tirer | Ultimate |
|---|---|---|---|
| **Ordinateur** | ZQSD / WASD / flèches | souris + clic gauche | `E` ou `Espace` |
| **Tablette** | joystick gauche | joystick droit | bouton `ULT` |

## Contenu actuel

- **2 Zareks** (personnages) :
  - **Zephyr** — tireur agile. Attaque : *ondes sonores* (3 projectiles à
    moyenne portée). Ultimate : *break dance* (onde de choc qui repousse).
  - **Atlas** — tank. Attaque : *impact* (frappe lourde courte portée).
    Ultimate : *séisme* (repousse + ralentit).
- **1 carte** : Arène Nyxt (buissons, obstacles, zone qui rétrécit).
- **1 mode** : Battle Royale (zone qui se referme, buissons pour se cacher,
  cubes de power-up à ramasser, dernier survivant gagne).

## Architecture

Le projet est **piloté par les données** et pensé pour grandir. La boucle de jeu
(`GameScene`) ne connaît ni les Zareks ni les cartes en dur : elle lit des
définitions.

```
src/
├── core/        moteur : types, géométrie, Combattant, Projectile, PowerCube
├── zareks/      1 fichier = 1 Zarek (stats + attaque + ultimate) + registre
├── maps/        1 fichier = 1 carte (taille, buissons, obstacles) + registre
├── modes/       1 fichier = 1 mode de jeu (Battle Royale)
├── ai/          IA des NPC (produit un InputState, comme le joueur)
├── input/       contrôleur joueur (clavier/souris + tactile fusionnés)
├── ui/          HUD, joystick, boutons
├── scenes/      Boot → Menu → Select → Game → GameOver
└── config/      constantes de réglage
```

### Prêt pour le multijoueur en ligne (« net-ready »)

La simulation ne lit **jamais** directement le clavier ou le tactile. Chaque
combattant est mis à jour via un `InputState` (une « intention » : déplacement,
visée, attaque, ultimate). Aujourd'hui cet état vient d'un contrôleur local
(joueur) ou de l'IA (NPC). Demain il pourra venir du **réseau**, sans réécrire
la logique de jeu. C'est la « couture » unique à brancher pour passer au vrai
multijoueur à 5.

## Étendre le jeu

**Ajouter un Zarek** — crée `src/zareks/monZarek.ts` exportant un `ZarekDef`,
puis ajoute-le à `src/zareks/registry.ts`. Il apparaît automatiquement à la
sélection et est jouable (par le joueur comme par les NPC).

**Ajouter une carte** — crée un `MapDef` dans `src/maps/`, ajoute-le au registre.

**Ajouter un mode** — crée une classe dans `src/modes/` sur le modèle de
`BattleRoyaleMode`, et branche-la dans la scène de jeu.

**Nouvel effet d'attaque/ultimate** — ajoute un `kind` dans `core/types.ts` et
son comportement dans `GameScene` (`fireAttack` / `fireUlt`).

## Prochaines pistes

- Art final (sprites animés, sons) à la place des placeholders.
- Nouveaux Zareks (les 3 emplacements verrouillés de la sélection).
- Nouveaux modes (Gem Grab, KO…) et nouvelles cartes.
- Multijoueur en ligne réel (brancher le réseau sur `InputState`).
