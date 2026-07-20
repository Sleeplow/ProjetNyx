import Phaser from 'phaser';
import type { InputState, MapDef } from '../core/types';
import { emptyInput } from '../core/types';
import { Combatant } from '../core/Combatant';
import { Projectile } from '../core/Projectile';
import { PowerCube } from '../core/PowerCube';
import { HazardZone } from '../core/HazardZone';
import { BattleRoyaleMode } from '../modes/battleRoyale';
import { BotController, type BotWorld, type DangerStrategy } from '../ai/BotController';
import { PlayerController } from '../input/PlayerController';
import { Hud } from '../ui/Hud';
import { makeButton, type Button } from '../ui/widgets';
import { ARENA_ROYALE } from '../maps/arenaRoyale';
import { PORTAL_ARENA, PORTAL_REGIONS, PORTAL_PAIRS, PORTAL_CFG, NEURO_CFG, PORTAL_SPAWN_RING } from '../maps/portalArena';
import { NeurotoxinField } from '../shared/game/neurotoxin';
import { PortalSystem } from '../shared/game/portals';
import { resolveChain } from '../shared/game/chain';
import { drawChainBolt } from '../render/fx';
import { ZAREKS, getZarek } from '../zareks/registry';
import { ROCK_KEYS, BUSH_KEYS, LAB_CRATE_KEYS, pickPropKey, drawPropAt, drawWallDivider, isInBush } from '../render/props';
import { COLORS, POWER_CUBE, PLAYERS_PER_MATCH, BUSH } from '../config/constants';
import { clamp, dist, normalize, resolveCircleRect, circleHitsRect } from '../core/geometry';

const TAU = Math.PI * 2;

/** Répit d'invincibilité à la sortie d'un portail : le temps de comprendre où on est. */
const TELEPORT_INVULN_MS = 1200;

/**
 * Scène de jeu principale. Orchestre la simulation : entrées → déplacement →
 * actions → projectiles → zone → morts → rendu. Le mode et les Zareks sont
 * fournis par les données ; ajouter du contenu ne touche pas cette boucle.
 */
export class GameScene extends Phaser.Scene {
  private map: MapDef = ARENA_ROYALE;
  private mode!: BattleRoyaleMode;
  // Tableau « Portal » : neurotoxine + portails (au lieu de la zone qui rétrécit).
  private isPortal = false;
  private neuro?: NeurotoxinField;
  private portals?: PortalSystem;
  private gasMainGfx?: Phaser.GameObjects.Graphics;
  private gasRefugeGfx?: Phaser.GameObjects.Graphics;
  private portalGfx?: Phaser.GameObjects.Graphics;
  private fxTime = 0;
  private combatants: Combatant[] = [];
  private player!: Combatant;
  private bots = new Map<string, BotController>();
  private projectiles: Projectile[] = [];
  private cubes: PowerCube[] = [];
  private hazards: HazardZone[] = [];
  private aimReticle!: Phaser.GameObjects.Arc;
  private playerController!: PlayerController;
  private hud!: Hud;

  private handledDead = new Set<string>();
  private ending = false;
  private placement = PLAYERS_PER_MATCH;
  private selectedZarekId = ZAREKS[0].id;
  private modeId = 'battle-royale';
  private camX = 0;
  private camY = 0;

  // Mode spectateur (une fois éliminé) : on suit un survivant, on passe au suivant.
  private spectating = false;
  private spectateTargetId: string | null = null;
  private spectateBanner?: Phaser.GameObjects.Text;
  private spectateButtons: Button[] = [];

  constructor() {
    super('Game');
  }

  create(data: { zarekId?: string; modeId?: string }): void {
    // Réinitialisation complète (la scène est réutilisée entre les parties).
    this.selectedZarekId = data?.zarekId ?? ZAREKS[0].id;
    this.modeId = data?.modeId ?? 'battle-royale';
    this.isPortal = this.modeId === 'battle-royale-portal';
    this.map = this.isPortal ? PORTAL_ARENA : ARENA_ROYALE;
    this.combatants = [];
    this.projectiles = [];
    this.cubes = [];
    this.hazards = [];
    this.bots = new Map();
    this.handledDead = new Set();
    this.ending = false;
    this.placement = PLAYERS_PER_MATCH;
    this.spectating = false;
    this.spectateTargetId = null;
    this.spectateBanner = undefined;
    this.spectateButtons = [];
    this.neuro = undefined;
    this.portals = undefined;
    this.fxTime = 0;

    const { width, height } = this.map;
    this.cameras.main.setBounds(0, 0, width, height);

    this.drawArena();
    if (this.isPortal) {
      this.setupPortalMode();
    } else {
      this.mode = new BattleRoyaleMode(this, this.map);
    }
    this.spawnCombatants();
    this.scatterCubes(POWER_CUBE.initialCount);

    this.playerController = new PlayerController(this);
    this.hud = new Hud(this);
    // Repère de visée (aperçu de la flaque de potion pendant la charge).
    this.aimReticle = this.add.circle(0, 0, 10, COLORS.poison, 0.12).setStrokeStyle(2, COLORS.poison, 0.9).setDepth(13).setVisible(false);

    this.camX = this.player.x;
    this.camY = this.player.y;
    this.cameras.main.centerOn(this.camX, this.camY);
    // Zoom caméra = 1 impératif : un zoom ≠ 1 décale les éléments d'UI
    // (scrollFactor 0 : bouton ULT, joysticks) par rapport aux coordonnées du
    // pointeur, ce qui casse la détection tactile du bouton ULT.
    this.cameras.main.setZoom(1);

    if (this.isPortal) this.hud.setWarningText('☣ NEUROTOXINE');
    this.hud.flash(this.isPortal ? 'CHAMBRE NYXT — NEUROTOXINE !' : 'BATTLE ROYALE !', '#ffcf33');

    this.events.once('shutdown', () => {
      this.playerController.destroy();
      this.hud.destroy();
      this.mode?.destroy();
      this.gasMainGfx?.destroy();
      this.gasRefugeGfx?.destroy();
      this.portalGfx?.destroy();
      for (const b of this.spectateButtons) b.destroy();
    });
  }

  /** Crée la neurotoxine + les portails + les graphismes dédiés (tableau Portal). */
  private setupPortalMode(): void {
    this.neuro = new NeurotoxinField(NEURO_CFG);
    this.portals = new PortalSystem(
      PORTAL_PAIRS,
      { main: PORTAL_REGIONS.main, refuge: PORTAL_REGIONS.refuge },
      PORTAL_CFG,
      (x, y, margin) => !this.isBlocked(x, y) && this.distToObstacles(x, y) > margin,
    );
    // Gaz : deux voiles verts (grande salle / refuge), opacité pilotée par les dégâts.
    this.gasMainGfx = this.add.graphics().setDepth(12);
    this.gasRefugeGfx = this.add.graphics().setDepth(12);
    this.portalGfx = this.add.graphics().setDepth(13);
  }

  /** Distance approx. au bord d'obstacle le plus proche (pour placer les portails au large). */
  private distToObstacles(x: number, y: number): number {
    let best = Infinity;
    for (const o of this.map.obstacles) {
      const nx = clamp(x, o.x, o.x + o.w);
      const ny = clamp(y, o.y, o.y + o.h);
      best = Math.min(best, Math.hypot(x - nx, y - ny));
    }
    return best;
  }

  /** Stratégie de danger fournie à l'IA (Portal) : fuir la neurotoxine par les portails verts. */
  private buildDanger(): DangerStrategy {
    const neuro = this.neuro!;
    const portals = this.portals!;
    const main = PORTAL_REGIONS.main;
    const refuge = PORTAL_REGIONS.refuge;
    return {
      active: neuro.active,
      inDanger: (x, y) => neuro.isDanger(x, y),
      retreat: (x, y) => {
        if (!neuro.active) return null;
        if (neuro.isRefuge(x)) return null; // refuge : rester (ou se battre si gazé)
        if (neuro.mainDps <= 0) return null;
        return portals.nearestGreenTo(x, y, 'main'); // marcher sur un vert → refuge
      },
      wander: (x) => {
        const r = neuro.isRefuge(x) ? refuge : main;
        const m = 100;
        return { x: r.x + m + Math.random() * (r.w - m * 2), y: r.y + m + Math.random() * (r.h - m * 2) };
      },
    };
  }

  /** Dessine le gaz (voiles verts pulsés) + les portails (anneaux colorés animés). */
  private renderPortalFx(): void {
    const neuro = this.neuro!;
    const main = PORTAL_REGIONS.main;
    const refuge = PORTAL_REGIONS.refuge;
    const pulse = 0.85 + 0.15 * Math.sin(this.fxTime / 300);

    const gm = this.gasMainGfx!;
    gm.clear();
    const mainA = Math.min(0.5, neuro.mainDps / 120) * pulse;
    if (mainA > 0.01) {
      gm.fillStyle(COLORS.poison, mainA);
      gm.fillRect(main.x, main.y, main.w, main.h);
    }
    const gr = this.gasRefugeGfx!;
    gr.clear();
    const refA = Math.min(0.5, neuro.refugeDps / 120) * pulse;
    if (refA > 0.01) {
      gr.fillStyle(COLORS.poison, refA);
      gr.fillRect(refuge.x, refuge.y, refuge.w, refuge.h);
    }

    const gp = this.portalGfx!;
    gp.clear();
    const spin = this.portals!.spin;
    for (const ep of this.portals!.endpoints) {
      const rr = 30 + 3 * Math.sin(this.fxTime / 200 + ep.x);
      gp.fillStyle(ep.colorHex, 0.16);
      gp.fillCircle(ep.x, ep.y, rr + 10);
      gp.fillStyle(0x0b0b1a, 0.82);
      gp.fillCircle(ep.x, ep.y, rr - 6);
      gp.lineStyle(6, ep.colorHex, 0.95);
      gp.strokeCircle(ep.x, ep.y, rr);
      gp.lineStyle(2, 0xffffff, 0.75);
      gp.strokeCircle(ep.x, ep.y, rr - 8);
      gp.lineStyle(3, ep.colorHex, 0.9);
      for (let k = 0; k < 3; k++) {
        const a0 = spin * 2 + (k * TAU) / 3;
        gp.beginPath();
        gp.arc(ep.x, ep.y, rr - 12, a0, a0 + 1.15);
        gp.strokePath();
      }
    }

    // Bouclier d'arrivée : anneau pulsé autour des combattants brièvement invincibles.
    for (const c of this.combatants) {
      if (!c.alive || c.invulnMs <= 0) continue;
      const sr = c.def.radius + 12 + 2 * Math.sin(this.fxTime / 90);
      gp.lineStyle(3, 0xd6f6ff, 0.9);
      gp.strokeCircle(c.x, c.y, sr);
      gp.lineStyle(2, 0x9be8ff, 0.5);
      gp.strokeCircle(c.x, c.y, sr + 4);
    }
  }

  // ---------- Construction ----------

  private drawArena(): void {
    if (this.isPortal) this.drawPortalArena();
    else this.drawClassicArena();
  }

  private drawClassicArena(): void {
    const { width, height } = this.map;

    // Sol « damier » cartoon (deux indigos proches → texture douce, plus vive
    // que l'ancien fond plat).
    const BASE = 0x2b2760;
    const TILE = 0x342f76;
    this.add.rectangle(width / 2, height / 2, width, height, BASE).setDepth(0);
    const tiles = this.add.graphics().setDepth(0);
    tiles.fillStyle(TILE, 1);
    const ts = 120;
    for (let ty = 0, ry = 0; ty < height; ty += ts, ry++) {
      for (let tx = 0, rx = 0; tx < width; tx += ts, rx++) {
        if ((rx + ry) % 2 === 0) tiles.fillRect(tx, ty, ts, ts);
      }
    }
    // Bordure épaisse et vive.
    this.add.rectangle(width / 2, height / 2, width, height).setStrokeStyle(10, 0x7a5cff, 1).setDepth(7);

    // Buissons : décor baké (KayKit Forest) — variante stable par position.
    for (const b of this.map.bushes) {
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      drawPropAt(this, cx, cy, pickPropKey(BUSH_KEYS, cx, cy), 8);
    }
    // Obstacles : rochers bakés (KayKit Forest) — variante stable par position.
    for (const o of this.map.obstacles) {
      const cx = o.x + o.w / 2;
      const cy = o.y + o.h / 2;
      drawPropAt(this, cx, cy, pickPropKey(ROCK_KEYS, cx, cy), 9);
    }
  }

  /** Décor du tableau Portal : deux salles « labo », cloison métallique, refuge. */
  private drawPortalArena(): void {
    const { width, height } = this.map;
    const main = PORTAL_REGIONS.main;
    const refuge = PORTAL_REGIONS.refuge;
    const cell = 120;

    // Sol grande salle : panneaux « labo » sombres + grille fine.
    this.add.rectangle(main.x + main.w / 2, main.y + main.h / 2, main.w, main.h, 0x20233f).setDepth(0);
    const g = this.add.graphics().setDepth(0);
    g.lineStyle(2, 0x2f3360, 0.55);
    for (let x = main.x; x <= main.x + main.w; x += cell) g.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += cell) g.lineBetween(main.x, y, main.x + main.w, y);

    // Sol refuge : « salle blanche » plus claire, liseré cyan « sûr ».
    this.add.rectangle(refuge.x + refuge.w / 2, refuge.y + refuge.h / 2, refuge.w, refuge.h, 0x263a44).setDepth(0);
    const rg = this.add.graphics().setDepth(0);
    rg.lineStyle(2, 0x3f5f6e, 0.5);
    for (let x = refuge.x; x <= refuge.x + refuge.w; x += cell) rg.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += cell) rg.lineBetween(refuge.x, y, refuge.x + refuge.w, y);
    this.add.rectangle(refuge.x + refuge.w / 2, refuge.y + refuge.h / 2, refuge.w - 14, refuge.h - 14).setStrokeStyle(4, 0x46e0c0, 0.45).setDepth(1);
    this.add
      .text(refuge.x + refuge.w / 2, 52, '🛡  REFUGE', { fontFamily: 'system-ui, sans-serif', fontSize: '30px', color: '#8ff0dc', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setDepth(1);

    // Bordure globale vive.
    this.add.rectangle(width / 2, height / 2, width, height).setStrokeStyle(10, 0x5a6cff, 1).setDepth(7);

    // Buissons (cachette) — décor baké KayKit Forest, comme l'arène BR classique.
    for (const b of this.map.bushes) {
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      drawPropAt(this, cx, cy, pickPropKey(BUSH_KEYS, cx, cy), 8);
    }

    // Obstacles : la cloison pleine (pleine hauteur) devient un mur en modules
    // bakés (KayKit Dungeon) empilés + liseré de danger ; les autres sont des
    // caisses/tonneaux du labo.
    for (const o of this.map.obstacles) {
      if (o.h >= height - 1) drawWallDivider(this, o, 9);
      else {
        const cx = o.x + o.w / 2;
        const cy = o.y + o.h / 2;
        drawPropAt(this, cx, cy, pickPropKey(LAB_CRATE_KEYS, cx, cy), 9);
      }
    }
  }

  private spawnCombatants(): void {
    const { width, height } = this.map;
    // Portal : tout le monde apparaît dans la grande salle (pas dans le refuge).
    const cx = this.isPortal ? PORTAL_SPAWN_RING.cx : width / 2;
    const cy = this.isPortal ? PORTAL_SPAWN_RING.cy : height / 2;
    const spawnR = this.isPortal ? PORTAL_SPAWN_RING.r : 620;
    for (let i = 0; i < PLAYERS_PER_MATCH; i++) {
      const angle = (i / PLAYERS_PER_MATCH) * TAU - Math.PI / 2;
      const x = cx + Math.cos(angle) * spawnR;
      const y = cy + Math.sin(angle) * spawnR;
      if (i === 0) {
        this.player = new Combatant(this, 'player', getZarek(this.selectedZarekId), true, x, y);
        this.combatants.push(this.player);
      } else {
        // NPC : Zarek tiré au hasard → combinaison différente à chaque manche.
        const def = ZAREKS[Math.floor(Math.random() * ZAREKS.length)];
        const id = `bot${i}`;
        const bot = new Combatant(this, id, def, false, x, y);
        this.combatants.push(bot);
        this.bots.set(id, new BotController(id));
      }
    }
  }

  private scatterCubes(count: number): void {
    if (this.isPortal) {
      this.scatterCubesPortal(count);
      return;
    }
    const { width } = this.map;
    const cx = width / 2;
    const cy = this.map.height / 2;
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * 30) {
      attempts++;
      // Position au hasard (différente à chaque manche), en évitant les obstacles.
      const a = Math.random() * TAU;
      const r = 160 + Math.random() * (0.5 * width - 180);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (this.isBlocked(x, y)) continue;
      this.cubes.push(new PowerCube(this, x, y));
      placed++;
    }
  }

  /** Portal : les cubes n'apparaissent que dans la grande salle (le refuge n'est pas un butin). */
  private scatterCubesPortal(count: number): void {
    const main = PORTAL_REGIONS.main;
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * 30) {
      attempts++;
      const x = main.x + 90 + Math.random() * (main.w - 180);
      const y = main.y + 90 + Math.random() * (main.h - 180);
      if (this.isBlocked(x, y)) continue;
      this.cubes.push(new PowerCube(this, x, y));
      placed++;
    }
  }

  private isBlocked(x: number, y: number): boolean {
    const margin = 40;
    if (x < margin || y < margin || x > this.map.width - margin || y > this.map.height - margin) return true;
    return this.map.obstacles.some((o) => circleHitsRect(x, y, POWER_CUBE.radius + 12, o));
  }

  // ---------- Boucle ----------

  update(_time: number, delta: number): void {
    const dtMs = Math.min(delta, 50);
    const dtSec = dtMs / 1000;

    this.fxTime += dtMs;
    if (this.isPortal) {
      this.neuro!.update(dtMs);
      this.portals!.update(dtMs);
    } else {
      this.mode.update(dtMs);
    }

    const world: BotWorld = {
      all: this.combatants,
      cubes: this.cubes.filter((c) => c.alive).map((c) => ({ x: c.x, y: c.y })),
      zoneCenterX: this.isPortal ? PORTAL_SPAWN_RING.cx : this.mode.centerX,
      zoneCenterY: this.isPortal ? PORTAL_SPAWN_RING.cy : this.mode.centerY,
      zoneRadius: this.isPortal ? 999999 : this.mode.currentRadius,
      danger: this.isPortal ? this.buildDanger() : undefined,
    };

    // 1) Entrées (joueur via contrôleur, NPC via IA — même couture).
    const inputs = new Map<string, InputState>();
    for (const c of this.combatants) {
      if (!c.alive) continue;
      if (c.isPlayer) {
        inputs.set(c.id, this.ending ? emptyInput() : this.playerController.getInput(c));
      } else {
        inputs.set(c.id, this.bots.get(c.id)!.update(c, world, dtMs));
      }
    }

    // 2) Déplacement + visée + buisson.
    const kbDecay = Math.exp(-9 * dtSec);
    for (const c of this.combatants) {
      if (!c.alive) continue;
      const inp = inputs.get(c.id)!;
      c.aimAngle = Math.atan2(inp.aimY, inp.aimX);
      c.aimDist = Math.hypot(inp.aimX, inp.aimY);

      const mv = normalize(inp.moveX, inp.moveY);
      let nx = c.x + mv.x * c.speed * dtSec + c.kbX * dtSec;
      let ny = c.y + mv.y * c.speed * dtSec + c.kbY * dtSec;
      c.kbX *= kbDecay;
      c.kbY *= kbDecay;

      nx = clamp(nx, c.def.radius, this.map.width - c.def.radius);
      ny = clamp(ny, c.def.radius, this.map.height - c.def.radius);
      for (const ob of this.map.obstacles) {
        const res = resolveCircleRect(nx, ny, c.def.radius, ob);
        if (res) {
          nx = res.x;
          ny = res.y;
        }
      }
      c.x = clamp(nx, c.def.radius, this.map.width - c.def.radius);
      c.y = clamp(ny, c.def.radius, this.map.height - c.def.radius);
      c.inBush = this.map.bushes.some((b) => isInBush(c.x, c.y, b));
    }

    this.separateCombatants();

    // 2bis) Portails : un combattant qui marche sur un portail est téléporté.
    //       À l'arrivée : bref répit d'invincibilité + éclat visuel, et pour le
    //       joueur on recale la caméra d'un coup (pas de long pano qui donne
    //       l'impression que « ça fige »).
    if (this.isPortal) {
      for (const c of this.combatants) {
        if (!c.alive) continue;
        if (this.portals!.tryTeleport(c)) {
          c.x = clamp(c.x, c.def.radius, this.map.width - c.def.radius);
          c.y = clamp(c.y, c.def.radius, this.map.height - c.def.radius);
          c.inBush = this.map.bushes.some((b) => isInBush(c.x, c.y, b));
          c.grantInvuln(TELEPORT_INVULN_MS);
          this.teleportBurst(c.x, c.y);
          if (c.isPlayer) {
            this.camX = c.x;
            this.camY = c.y;
          }
        }
      }
    }

    // 3) Actions (attaque / ultimate).
    for (const c of this.combatants) {
      if (!c.alive) continue;
      const inp = inputs.get(c.id)!;
      // Potion : on lance à la RELÂCHE (visée maintenue). Autres : tir continu maintenu.
      const wantsAttack = c.def.attack.kind === 'potion' ? inp.attackReleased : inp.attack;
      if (wantsAttack && c.reloadTimer <= 0) this.fireAttack(c);
      if (inp.ultimate && c.ultReady) this.fireUlt(c);
    }

    // Repère de visée de la potion (aperçu de la zone tant que le joueur charge).
    this.updateAimReticle(inputs.get(this.player.id));

    // 4) Timers.
    for (const c of this.combatants) if (c.alive) c.tickTimers(dtMs);

    // 5) Projectiles.
    this.updateProjectiles(dtSec);

    // 6) Dégâts de zone / neurotoxine (dépend de la position → variable selon le tableau).
    if (this.isPortal) {
      const neuro = this.neuro!;
      for (const c of this.combatants) {
        if (!c.alive) continue;
        const d = neuro.dpsAt(c.x, c.y);
        if (d > 0) c.takeDamage(d * dtSec);
      }
    } else {
      const dps = this.mode.damagePerSecond;
      if (dps > 0) {
        for (const c of this.combatants) {
          if (c.alive && this.mode.isOutside(c.x, c.y)) c.takeDamage(dps * dtSec);
        }
      }
    }

    // 6bis) Zones au sol (flaques de potion / auras de poison) + poison persistant.
    this.updateHazards(dtSec, dtMs);
    for (const c of this.combatants) if (c.alive) c.tickPoison(dtMs);

    // 7) Ramassage de cubes.
    for (const c of this.combatants) {
      if (!c.alive) continue;
      for (const cube of this.cubes) {
        if (cube.alive && dist(c.x, c.y, cube.x, cube.y) <= POWER_CUBE.pickupRadius + c.def.radius) {
          c.pickCube();
          cube.destroy();
        }
      }
    }
    this.cubes = this.cubes.filter((c) => c.alive);

    // 7bis) Cubes restés hors de la zone sûre : ils disparaissent après un délai.
    //       (Portal : les cubes restent dans la grande salle gazée — risque/récompense.)
    if (!this.isPortal) {
      for (const cube of this.cubes) {
        if (this.mode.isOutside(cube.x, cube.y)) cube.tickOutside(dtMs);
      }
      this.cubes = this.cubes.filter((cube) => {
        if (cube.expiredOutside) {
          cube.destroy();
          return false;
        }
        return true;
      });
    }

    // 7ter) Régénération de vie hors combat (n'a pas tiré ni été touché récemment).
    for (const c of this.combatants) if (c.alive) c.regenerate(dtMs);

    // 8) Morts.
    for (const c of this.combatants) {
      if (!c.alive && !this.handledDead.has(c.id)) {
        this.handledDead.add(c.id);
        this.handleDeath(c);
      }
    }

    // 9) Rendu des combattants (furtivité : un ennemi caché n'est visible que de
    //    près). En spectateur, on montre le corps du joueur mort en moins et on
    //    révèle tout le monde (le spectateur voit tout).
    for (const c of this.combatants) {
      if (!c.alive && !(c.isPlayer && !this.spectating)) continue;
      const revealed = this.spectating || c.isPlayer || !c.inBush || dist(c.x, c.y, this.player.x, this.player.y) <= BUSH.revealRange;
      c.syncDisplay(revealed);
    }
    if (this.spectating) this.player.hide();

    // 10) Caméra : suit le joueur, ou le survivant observé en mode spectateur.
    let camTarget: { x: number; y: number } = this.player;
    if (this.spectating) {
      let t = this.combatants.find((c) => c.id === this.spectateTargetId && c.alive);
      if (!t) {
        this.advanceSpectate();
        t = this.combatants.find((c) => c.id === this.spectateTargetId && c.alive);
      }
      if (t) {
        camTarget = t;
        this.spectateBanner?.setText(`👁 Tu observes ${t.def.name}`);
      }
    }
    this.camX = Phaser.Math.Linear(this.camX, camTarget.x, 0.1);
    this.camY = Phaser.Math.Linear(this.camY, camTarget.y, 0.1);
    this.cameras.main.centerOn(this.camX, this.camY);

    // 10bis) Rendu neurotoxine + portails (tableau Portal).
    if (this.isPortal) this.renderPortalFx();

    // 11) HUD.
    this.playerController.setUltReady(this.player.ultReady && this.player.alive);
    const survivors = this.combatants.filter((c) => c.alive).length;
    const danger = this.isPortal ? this.neuro!.isDanger(this.player.x, this.player.y) : this.mode.isOutside(this.player.x, this.player.y);
    this.hud.update(this.player, survivors, danger, dtMs);

    // 12) Fin de partie.
    if (!this.ending) this.checkEnd();
  }

  private separateCombatants(): void {
    for (let i = 0; i < this.combatants.length; i++) {
      const a = this.combatants[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < this.combatants.length; j++) {
        const b = this.combatants[j];
        if (!b.alive) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const minD = a.def.radius + b.def.radius;
        if (d > 0 && d < minD) {
          const push = (minD - d) / 2;
          const nx = dx / d;
          const ny = dy / d;
          a.x = clamp(a.x - nx * push, a.def.radius, this.map.width - a.def.radius);
          a.y = clamp(a.y - ny * push, a.def.radius, this.map.height - a.def.radius);
          b.x = clamp(b.x + nx * push, b.def.radius, this.map.width - b.def.radius);
          b.y = clamp(b.y + ny * push, b.def.radius, this.map.height - b.def.radius);
        }
      }
    }
  }

  private updateProjectiles(dtSec: number): void {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      p.update(dtSec); // peut passer alive=false quand la portée est atteinte
      const isPotion = p.landsInto !== null;

      let landed = !p.alive; // portée épuisée = atterrissage
      if (p.x < 0 || p.y < 0 || p.x > this.map.width || p.y > this.map.height) {
        p.kill();
        landed = true;
      } else {
        for (const ob of this.map.obstacles) {
          if (circleHitsRect(p.x, p.y, p.radius, ob)) {
            p.kill();
            landed = true;
            break;
          }
        }
      }

      if (isPotion) {
        // Si la potion croise un ennemi en vol, elle s'arrête et tombe LÀ.
        if (!landed) {
          for (const c of this.combatants) {
            if (!c.alive || c.id === p.ownerId) continue;
            if (dist(p.x, p.y, c.x, c.y) <= p.radius + c.def.radius) {
              p.kill();
              landed = true;
              break;
            }
          }
        }
        if (landed) this.spawnPotionPuddle(p);
        continue;
      }

      if (!p.alive) continue;
      for (const c of this.combatants) {
        if (!c.alive || c.id === p.ownerId) continue;
        if (dist(p.x, p.y, c.x, c.y) <= p.radius + c.def.radius) {
          const dealt = c.takeDamage(p.damage);
          const owner = this.combatants.find((o) => o.id === p.ownerId);
          if (owner && owner.alive) owner.addUltCharge(dealt);
          this.hitSpark(p.x, p.y, c.def.color);
          p.kill();
          break;
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => {
      if (!p.alive) {
        p.destroy();
        return false;
      }
      return true;
    });
  }

  /** Zones au sol (flaques de potion / auras de poison) : durée de vie + effets. */
  private updateHazards(dtSec: number, dtMs: number): void {
    for (const h of this.hazards) {
      h.update(dtMs);
      if (!h.alive) continue;
      for (const c of this.combatants) {
        if (!c.alive || c.id === h.ownerId) continue;
        if (!h.contains(c.x, c.y, c.def.radius)) continue;
        if (h.dps > 0) {
          const dealt = c.takeDamage(h.dps * dtSec);
          if (h.chargesUlt) {
            const owner = this.combatants.find((o) => o.id === h.ownerId);
            if (owner && owner.alive) owner.addUltCharge(dealt);
          }
        }
        if (h.slowFactor < 1) c.applySlow(h.slowMs, h.slowFactor);
        if (h.poisonMs > 0) c.applyPoison(h.poisonMs, h.poisonDps);
      }
    }
    this.hazards = this.hazards.filter((h) => {
      if (!h.alive) {
        h.destroy();
        return false;
      }
      return true;
    });
  }

  // ---------- Actions ----------

  private fireAttack(c: Combatant): void {
    const a = c.def.attack;
    if (a.kind === 'potion') {
      this.throwPotion(c);
    } else if (a.kind === 'chain') {
      this.fireChain(c);
    } else {
      const spread = Phaser.Math.DegToRad(a.spreadDeg);
      const dmg = a.damage * c.damageMult;
      const muzzle = c.def.radius + 6;
      for (let i = 0; i < a.count; i++) {
        const t = a.count === 1 ? 0 : i / (a.count - 1) - 0.5;
        const ang = c.aimAngle + t * spread;
        const dx = Math.cos(ang);
        const dy = Math.sin(ang);
        this.projectiles.push(
          new Projectile(this, c.id, c.x + dx * muzzle, c.y + dy * muzzle, dx * a.speed, dy * a.speed, dmg, a.projRadius, a.range, c.def.color),
        );
      }
    }
    c.reloadTimer = a.reloadMs;
    c.noteAttack();
  }

  /** Éclair en chaîne : foudroie l'ennemi le plus proche puis rebondit (dégâts décroissants). */
  private fireChain(c: Combatant): void {
    const a = c.def.attack;
    const enemies = this.combatants.filter((o) => o !== c && o.alive);
    const idx = resolveChain(
      c.x,
      c.y,
      enemies.map((e) => ({ x: e.x, y: e.y, radius: e.def.radius })),
      a.range,
      a.chainJumpRange ?? 220,
      a.chainMaxJumps ?? 2,
    );
    let dmg = a.damage * c.damageMult;
    let px = c.x;
    let py = c.y;
    for (const i of idx) {
      const e = enemies[i];
      const dealt = e.takeDamage(dmg);
      c.addUltCharge(dealt);
      drawChainBolt(this, px, py, e.x, e.y, c.def.color);
      this.hitSpark(e.x, e.y, c.def.color);
      px = e.x;
      py = e.y;
      dmg *= a.chainFalloff ?? 0.7;
    }
  }

  /** Surcharge : un éclair géant arc vers de nombreux ennemis, gros dégâts + les étourdit. */
  private fireUltChain(c: Combatant): void {
    const u = c.def.ultimate;
    const enemies = this.combatants.filter((o) => o !== c && o.alive);
    const idx = resolveChain(
      c.x,
      c.y,
      enemies.map((e) => ({ x: e.x, y: e.y, radius: e.def.radius })),
      u.radius,
      u.chainJumpRange ?? 300,
      u.chainMaxJumps ?? 5,
    );
    let dmg = u.damage * c.damageMult;
    let px = c.x;
    let py = c.y;
    for (const i of idx) {
      const e = enemies[i];
      e.takeDamage(dmg);
      const dir = normalize(e.x - c.x, e.y - c.y);
      const kx = dir.x === 0 && dir.y === 0 ? 1 : dir.x;
      const ky = dir.x === 0 && dir.y === 0 ? 0 : dir.y;
      e.applyKnockback(kx, ky, u.knockback);
      e.applySlow(u.slowMs, u.slowFactor);
      drawChainBolt(this, px, py, e.x, e.y, c.def.color, 6);
      this.hitSpark(e.x, e.y, c.def.color);
      px = e.x;
      py = e.y;
      dmg *= u.chainFalloff ?? 1; // −25 % par cible suivante
    }
    this.shockwaveFx(c.x, c.y, 90, c.def.color);
  }

  /** Lance une potion : elle vole vers la visée puis crée une flaque à l'atterrissage. */
  private throwPotion(c: Combatant): void {
    const a = c.def.attack;
    const dx = Math.cos(c.aimAngle);
    const dy = Math.sin(c.aimAngle);
    const throwDist = this.potionThrowDist(c);
    const muzzle = c.def.radius + 6;
    const proj = new Projectile(this, c.id, c.x + dx * muzzle, c.y + dy * muzzle, dx * a.speed, dy * a.speed, 0, a.projRadius, throwDist, c.def.color);
    proj.landsInto = {
      radius: a.aoeRadius ?? 80,
      durationMs: a.aoeDurationMs ?? 2500,
      dps: (a.aoeDps ?? 120) * c.damageMult,
    };
    this.projectiles.push(proj);
  }

  /** Distance de lancer d'une potion : distance visée (souris/IA) sinon portée max. */
  private potionThrowDist(c: Combatant): number {
    const range = c.def.attack.range;
    return c.aimDist > 40 ? clamp(c.aimDist, 90, range) : range;
  }

  /** Point d'atterrissage visé de la potion (sans tenir compte d'un joueur croisé). */
  private potionLanding(c: Combatant): { x: number; y: number } {
    const d = this.potionThrowDist(c);
    return { x: c.x + Math.cos(c.aimAngle) * d, y: c.y + Math.sin(c.aimAngle) * d };
  }

  /** Affiche le repère de visée (aperçu de la flaque) tant que le joueur charge une potion. */
  private updateAimReticle(inp?: InputState): void {
    const p = this.player;
    if (inp && p.alive && p.def.attack.kind === 'potion' && inp.attack) {
      const land = this.potionLanding(p);
      this.aimReticle.setPosition(land.x, land.y).setRadius(p.def.attack.aoeRadius ?? 80).setVisible(true);
    } else {
      this.aimReticle.setVisible(false);
    }
  }

  private spawnPotionPuddle(p: Projectile): void {
    const info = p.landsInto;
    if (!info) return;
    this.hazards.push(
      new HazardZone(this, p.x, p.y, {
        radius: info.radius,
        ownerId: p.ownerId,
        durationMs: info.durationMs,
        color: COLORS.poison,
        dps: info.dps,
        chargesUlt: true,
      }),
    );
  }

  private fireUlt(c: Combatant): void {
    const u = c.def.ultimate;
    if (u.kind === 'aura') {
      this.spawnPoisonAura(c);
    } else if (u.kind === 'chain') {
      this.fireUltChain(c);
    } else {
      const dmg = u.damage * c.damageMult;
      this.shockwaveFx(c.x, c.y, u.radius, c.def.color);
      for (const other of this.combatants) {
        if (other === c || !other.alive) continue;
        if (dist(c.x, c.y, other.x, other.y) <= u.radius + other.def.radius) {
          other.takeDamage(dmg);
          const dir = normalize(other.x - c.x, other.y - c.y);
          const kx = dir.x === 0 && dir.y === 0 ? 1 : dir.x;
          const ky = dir.x === 0 && dir.y === 0 ? 0 : dir.y;
          other.applyKnockback(kx, ky, u.knockback);
          other.applySlow(u.slowMs, u.slowFactor);
        }
      }
    }
    c.consumeUlt();
  }

  /** Dépose une aura de poison persistante à la position du lanceur. */
  private spawnPoisonAura(c: Combatant): void {
    const u = c.def.ultimate;
    this.shockwaveFx(c.x, c.y, u.radius, COLORS.poison);
    this.hazards.push(
      new HazardZone(this, c.x, c.y, {
        radius: u.radius,
        ownerId: c.id,
        durationMs: u.auraDurationMs ?? 4000,
        color: COLORS.poison,
        dps: 0,
        slowFactor: u.slowFactor,
        slowMs: u.slowMs,
        poisonMs: u.poisonMs ?? 2500,
        poisonDps: (u.poisonDps ?? 100) * c.damageMult,
        chargesUlt: false,
      }),
    );
  }

  // ---------- Mort / fin ----------

  private handleDeath(c: Combatant): void {
    this.deathBurst(c.x, c.y, c.def.color);
    // Moitié + 1 des cubes lâchée sur place ; le reste réapparaît au hasard
    // sur la carte (même hors zone) après un court délai.
    const dropped = Math.floor(c.cubes / 2) + 1;
    const remaining = Math.max(0, c.cubes - dropped);
    this.dropCubes(c.x, c.y, dropped);
    if (remaining > 0) {
      this.time.delayedCall(POWER_CUBE.respawnDelayMs, () => this.scatterCubes(remaining));
    }
    if (c.isPlayer) {
      this.placement = this.combatants.filter((o) => o.alive).length + 1;
    } else {
      c.destroy();
    }
  }

  private dropCubes(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU;
      const r = 24 + i * 6;
      const cx = clamp(x + Math.cos(a) * r, 20, this.map.width - 20);
      const cy = clamp(y + Math.sin(a) * r, 20, this.map.height - 20);
      this.cubes.push(new PowerCube(this, cx, cy));
    }
  }

  private checkEnd(): void {
    const alive = this.combatants.filter((c) => c.alive);
    if (this.player.alive) {
      if (alive.length === 1) {
        this.placement = 1;
        this.endGame(true);
      }
      return;
    }
    // Joueur éliminé.
    if (alive.length <= 1) {
      // Un seul survivant (ou aucun) : la partie est finie — surtout PAS de
      // mode spectateur (sinon on crée puis détruit la bannière dans la même
      // frame, et l'update suivante ferait un setText sur un objet détruit).
      this.endGame(false);
      return;
    }
    // Sinon on suit un survivant jusqu'au dénouement (ou jusqu'à ce qu'on quitte).
    if (!this.spectating) this.enterSpectate(alive.length);
  }

  /** Entre en mode spectateur après élimination : suit un survivant, boutons pour changer/quitter. */
  private enterSpectate(othersAlive: number): void {
    this.spectating = true;
    this.placement = othersAlive + 1;
    this.hud.flash('ÉLIMINÉ — mode spectateur', '#ff6b5e');
    this.spectateTargetId = this.combatants.find((c) => c.alive)?.id ?? null;

    const w = this.scale.width;
    const cx = w / 2;
    const by = this.scale.height * 0.16;
    this.spectateBanner = this.add
      .text(cx, by - 30, '', { fontFamily: 'system-ui, sans-serif', fontSize: '20px', color: '#ffcf33', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);
    this.spectateButtons.push(makeButton(this, cx + 95, by + 18, 170, 48, 'Suivant ›', () => this.advanceSpectate()));
    this.spectateButtons.push(makeButton(this, cx - 95, by + 18, 170, 48, 'Quitter', () => this.endGame(false), 0x3a3466));
    // Profondeur élevée : les boutons restent AU-DESSUS du décor (cloison, avatars,
    // éclairs) qui a une profondeur bien plus haute que le défaut (0).
    for (const b of this.spectateButtons) {
      b.setScrollFactor(0);
      b.container.setDepth(1002);
    }
  }

  /** Passe au survivant suivant (ou revient au premier). */
  private advanceSpectate(): void {
    const ids = this.combatants.filter((c) => c.alive).map((c) => c.id);
    if (ids.length === 0) return;
    const i = ids.indexOf(this.spectateTargetId ?? '');
    this.spectateTargetId = ids[(i + 1) % ids.length];
  }

  private endGame(victory: boolean): void {
    if (this.ending) return;
    this.ending = true;
    // Coupe le suivi spectateur AVANT de détruire ses objets : sinon le bloc
    // caméra de l'update suivante ferait un setText sur une bannière détruite
    // (→ crash « drawImage of null », écran figé).
    this.spectating = false;
    for (const b of this.spectateButtons) b.destroy();
    this.spectateButtons = [];
    this.spectateBanner?.destroy();
    this.spectateBanner = undefined;
    this.hud.flash(victory ? 'VICTOIRE ROYALE !' : 'FIN DE LA PARTIE', victory ? '#ffcf33' : '#d8d8ff');
    this.time.delayedCall(1500, () => {
      this.scene.start('GameOver', { victory, mode: 'battle-royale', modeId: this.modeId, placement: this.placement, zarekId: this.selectedZarekId });
    });
  }

  // ---------- Effets visuels ----------

  private shockwaveFx(x: number, y: number, radius: number, color: number): void {
    const ring = this.add.circle(x, y, radius, color, 0.12).setStrokeStyle(8, color, 0.9).setDepth(25).setScale(0.15);
    this.tweens.add({ targets: ring, scale: 1, duration: 320, ease: 'Cubic.out' });
    this.tweens.add({ targets: ring, alpha: 0, duration: 440, ease: 'Quad.in', onComplete: () => ring.destroy() });
  }

  /** Éclat d'arrivée de portail : anneau clair qui s'ouvre à la sortie. */
  private teleportBurst(x: number, y: number): void {
    const ring = this.add.circle(x, y, 46, 0x9be8ff, 0.16).setStrokeStyle(5, 0xd6f6ff, 0.95).setDepth(19).setScale(0.4);
    this.tweens.add({ targets: ring, scale: 1.25, alpha: 0, duration: 380, ease: 'Cubic.out', onComplete: () => ring.destroy() });
  }

  private hitSpark(x: number, y: number, color: number): void {
    const s = this.add.circle(x, y, 9, color, 0.9).setDepth(24);
    this.tweens.add({ targets: s, scale: 2, alpha: 0, duration: 180, onComplete: () => s.destroy() });
  }

  private deathBurst(x: number, y: number, color: number): void {
    const s = this.add.circle(x, y, 26, color, 0.5).setStrokeStyle(4, color, 1).setDepth(24).setScale(0.6);
    this.tweens.add({ targets: s, scale: 2.6, alpha: 0, duration: 440, ease: 'Cubic.out', onComplete: () => s.destroy() });
  }
}
