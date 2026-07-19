import Phaser from 'phaser';
import type { InputState } from '../core/types';
import { emptyInput } from '../core/types';
import { Combatant } from '../core/Combatant';
import { Projectile } from '../core/Projectile';
import { PowerCube } from '../core/PowerCube';
import { HazardZone } from '../core/HazardZone';
import { BattleRoyaleMode } from '../modes/battleRoyale';
import { BotController, type BotWorld } from '../ai/BotController';
import { PlayerController } from '../input/PlayerController';
import { Hud } from '../ui/Hud';
import { ARENA_ROYALE } from '../maps/arenaRoyale';
import { resolveChain } from '../shared/game/chain';
import { drawChainBolt } from '../render/fx';
import { ZAREKS, getZarek } from '../zareks/registry';
import { COLORS, POWER_CUBE, PLAYERS_PER_MATCH, BUSH } from '../config/constants';
import { clamp, dist, normalize, resolveCircleRect, pointInRect, circleHitsRect } from '../core/geometry';

const TAU = Math.PI * 2;

/**
 * Scène de jeu principale. Orchestre la simulation : entrées → déplacement →
 * actions → projectiles → zone → morts → rendu. Le mode et les Zareks sont
 * fournis par les données ; ajouter du contenu ne touche pas cette boucle.
 */
export class GameScene extends Phaser.Scene {
  private map = ARENA_ROYALE;
  private mode!: BattleRoyaleMode;
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

  constructor() {
    super('Game');
  }

  create(data: { zarekId?: string; modeId?: string }): void {
    // Réinitialisation complète (la scène est réutilisée entre les parties).
    this.selectedZarekId = data?.zarekId ?? ZAREKS[0].id;
    this.modeId = data?.modeId ?? 'battle-royale';
    this.combatants = [];
    this.projectiles = [];
    this.cubes = [];
    this.hazards = [];
    this.bots = new Map();
    this.handledDead = new Set();
    this.ending = false;
    this.placement = PLAYERS_PER_MATCH;

    const { width, height } = this.map;
    this.cameras.main.setBounds(0, 0, width, height);

    this.drawArena();
    this.mode = new BattleRoyaleMode(this, this.map);
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

    this.hud.flash('BATTLE ROYALE !', '#ffcf33');

    this.events.once('shutdown', () => {
      this.playerController.destroy();
      this.hud.destroy();
      this.mode.destroy();
    });
  }

  // ---------- Construction ----------

  private drawArena(): void {
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

    // Buissons : vert vif + liseré clair.
    for (const b of this.map.bushes) {
      this.add.rectangle(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h, 0x2fae57, 0.9).setStrokeStyle(3, 0x53d97b, 0.9).setDepth(8);
      this.add.rectangle(b.x + b.w / 2, b.y + Math.min(12, b.h * 0.22), b.w - 8, Math.min(12, b.h * 0.24), 0x5fe08d, 0.9).setDepth(8);
    }
    // Obstacles : blocs « pierre » cartoon (face claire + contour épais).
    for (const o of this.map.obstacles) {
      this.add.rectangle(o.x + o.w / 2, o.y + o.h / 2, o.w, o.h, 0x4a4788).setStrokeStyle(4, 0x241f45, 1).setDepth(9);
      this.add.rectangle(o.x + o.w / 2, o.y + Math.min(12, o.h * 0.25), o.w - 8, Math.min(14, o.h * 0.28), 0x6f69b8).setDepth(9);
    }
  }

  private spawnCombatants(): void {
    const { width, height } = this.map;
    const cx = width / 2;
    const cy = height / 2;
    const spawnR = 620;
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

  private isBlocked(x: number, y: number): boolean {
    const margin = 40;
    if (x < margin || y < margin || x > this.map.width - margin || y > this.map.height - margin) return true;
    return this.map.obstacles.some((o) => circleHitsRect(x, y, POWER_CUBE.radius + 12, o));
  }

  // ---------- Boucle ----------

  update(_time: number, delta: number): void {
    const dtMs = Math.min(delta, 50);
    const dtSec = dtMs / 1000;

    this.mode.update(dtMs);

    const world: BotWorld = {
      all: this.combatants,
      cubes: this.cubes.filter((c) => c.alive).map((c) => ({ x: c.x, y: c.y })),
      zoneCenterX: this.mode.centerX,
      zoneCenterY: this.mode.centerY,
      zoneRadius: this.mode.currentRadius,
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
      c.inBush = this.map.bushes.some((b) => pointInRect(c.x, c.y, b));
    }

    this.separateCombatants();

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

    // 6) Dégâts de zone.
    const dps = this.mode.damagePerSecond;
    if (dps > 0) {
      for (const c of this.combatants) {
        if (c.alive && this.mode.isOutside(c.x, c.y)) c.takeDamage(dps * dtSec);
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

    // 7ter) Régénération de vie hors combat (n'a pas tiré ni été touché récemment).
    for (const c of this.combatants) if (c.alive) c.regenerate(dtMs);

    // 8) Morts.
    for (const c of this.combatants) {
      if (!c.alive && !this.handledDead.has(c.id)) {
        this.handledDead.add(c.id);
        this.handleDeath(c);
      }
    }

    // 9) Rendu des combattants (furtivité : un ennemi caché n'est visible que de près).
    for (const c of this.combatants) {
      if (!(c.alive || c.isPlayer)) continue;
      const revealed = c.isPlayer || !c.inBush || dist(c.x, c.y, this.player.x, this.player.y) <= BUSH.revealRange;
      c.syncDisplay(revealed);
    }

    // 10) Caméra (suivi lissé du joueur).
    this.camX = Phaser.Math.Linear(this.camX, this.player.x, 0.1);
    this.camY = Phaser.Math.Linear(this.camY, this.player.y, 0.1);
    this.cameras.main.centerOn(this.camX, this.camY);

    // 11) HUD.
    this.playerController.setUltReady(this.player.ultReady && this.player.alive);
    const survivors = this.combatants.filter((c) => c.alive).length;
    this.hud.update(this.player, survivors, this.mode.isOutside(this.player.x, this.player.y), dtMs);

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
    const dmg = u.damage * c.damageMult;
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
    if (!this.player.alive) {
      this.endGame(false);
    } else if (alive.length === 1 && alive[0] === this.player) {
      this.placement = 1;
      this.endGame(true);
    }
  }

  private endGame(victory: boolean): void {
    this.ending = true;
    this.hud.flash(victory ? 'VICTOIRE ROYALE !' : 'ÉLIMINÉ', victory ? '#ffcf33' : '#ff6b5e');
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

  private hitSpark(x: number, y: number, color: number): void {
    const s = this.add.circle(x, y, 9, color, 0.9).setDepth(24);
    this.tweens.add({ targets: s, scale: 2, alpha: 0, duration: 180, onComplete: () => s.destroy() });
  }

  private deathBurst(x: number, y: number, color: number): void {
    const s = this.add.circle(x, y, 26, color, 0.5).setStrokeStyle(4, color, 1).setDepth(24).setScale(0.6);
    this.tweens.add({ targets: s, scale: 2.6, alpha: 0, duration: 440, ease: 'Cubic.out', onComplete: () => s.destroy() });
  }
}
