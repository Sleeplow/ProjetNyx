import Phaser from 'phaser';
import type { InputState } from '../core/types';
import { emptyInput } from '../core/types';
import { Combatant } from '../core/Combatant';
import { Projectile } from '../core/Projectile';
import { PowerCube } from '../core/PowerCube';
import { BattleRoyaleMode } from '../modes/battleRoyale';
import { BotController, type BotWorld } from '../ai/BotController';
import { PlayerController } from '../input/PlayerController';
import { Hud } from '../ui/Hud';
import { ARENA_ROYALE } from '../maps/arenaRoyale';
import { ZAREKS, getZarek } from '../zareks/registry';
import { COLORS, POWER_CUBE, PLAYERS_PER_MATCH } from '../config/constants';
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
  private playerController!: PlayerController;
  private hud!: Hud;

  private handledDead = new Set<string>();
  private ending = false;
  private placement = PLAYERS_PER_MATCH;
  private selectedZarekId = ZAREKS[0].id;
  private camX = 0;
  private camY = 0;
  private cubeSeed = 24601;

  constructor() {
    super('Game');
  }

  create(data: { zarekId?: string }): void {
    // Réinitialisation complète (la scène est réutilisée entre les parties).
    this.selectedZarekId = data?.zarekId ?? ZAREKS[0].id;
    this.combatants = [];
    this.projectiles = [];
    this.cubes = [];
    this.bots = new Map();
    this.handledDead = new Set();
    this.ending = false;
    this.placement = PLAYERS_PER_MATCH;
    this.cubeSeed = 24601;

    const { width, height } = this.map;
    this.cameras.main.setBounds(0, 0, width, height);

    this.drawArena();
    this.mode = new BattleRoyaleMode(this, this.map);
    this.spawnCombatants();
    this.scatterCubes(POWER_CUBE.initialCount);

    this.playerController = new PlayerController(this);
    this.hud = new Hud(this);

    this.camX = this.player.x;
    this.camY = this.player.y;
    this.cameras.main.centerOn(this.camX, this.camY);
    const applyZoom = () => this.cameras.main.setZoom(Phaser.Math.Clamp(this.scale.height / 1000, 0.6, 1.4));
    applyZoom();
    this.scale.on('resize', applyZoom, this);

    this.hud.flash('BATTLE ROYALE !', '#ffcf33');

    this.events.once('shutdown', () => {
      this.scale.off('resize', applyZoom, this);
      this.playerController.destroy();
      this.hud.destroy();
      this.mode.destroy();
    });
  }

  // ---------- Construction ----------

  private drawArena(): void {
    const { width, height } = this.map;
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.arenaFloor).setDepth(0);

    const grid = this.add.graphics().setDepth(1);
    grid.lineStyle(1, COLORS.arenaGrid, 0.5);
    for (let x = 0; x <= width; x += 80) grid.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 80) grid.lineBetween(0, y, width, y);
    grid.lineStyle(6, 0x3a3466, 1);
    grid.strokeRect(0, 0, width, height);

    for (const b of this.map.bushes) {
      this.add.rectangle(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h, COLORS.bush, 0.85).setStrokeStyle(3, COLORS.bushEdge, 0.9).setDepth(8);
    }
    for (const o of this.map.obstacles) {
      this.add.rectangle(o.x + o.w / 2, o.y + o.h / 2, o.w, o.h, COLORS.obstacle).setStrokeStyle(3, COLORS.obstacleEdge).setDepth(9);
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
        // Les NPC alternent entre les Zareks disponibles (variété).
        const def = ZAREKS[(i - 1) % ZAREKS.length];
        const id = `bot${i}`;
        const bot = new Combatant(this, id, def, false, x, y);
        this.combatants.push(bot);
        this.bots.set(id, new BotController(id));
      }
    }
  }

  private nextRand(): number {
    let x = this.cubeSeed;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.cubeSeed = x >>> 0;
    return this.cubeSeed / 0xffffffff;
  }

  private scatterCubes(count: number): void {
    const { width, height } = this.map;
    const cx = width / 2;
    const cy = height / 2;
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * 30) {
      attempts++;
      const a = this.nextRand() * TAU;
      const r = 180 + this.nextRand() * (0.5 * width - 200);
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
      if (inp.attack && c.reloadTimer <= 0) this.fireAttack(c);
      if (inp.ultimate && c.ultReady) this.fireUlt(c);
    }

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

    // 7bis) Régénération de vie hors combat (n'a pas tiré ni été touché récemment).
    for (const c of this.combatants) if (c.alive) c.regenerate(dtMs);

    // 8) Morts.
    for (const c of this.combatants) {
      if (!c.alive && !this.handledDead.has(c.id)) {
        this.handledDead.add(c.id);
        this.handleDeath(c);
      }
    }

    // 9) Rendu des combattants.
    for (const c of this.combatants) if (c.alive || c.isPlayer) c.syncDisplay();

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
      p.update(dtSec);
      if (p.x < 0 || p.y < 0 || p.x > this.map.width || p.y > this.map.height) {
        p.kill();
        continue;
      }
      for (const ob of this.map.obstacles) {
        if (circleHitsRect(p.x, p.y, p.radius, ob)) {
          p.kill();
          break;
        }
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

  // ---------- Actions ----------

  private fireAttack(c: Combatant): void {
    const a = c.def.attack;
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
    c.reloadTimer = a.reloadMs;
    c.noteAttack();
  }

  private fireUlt(c: Combatant): void {
    const u = c.def.ultimate;
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
    c.consumeUlt();
  }

  // ---------- Mort / fin ----------

  private handleDeath(c: Combatant): void {
    this.deathBurst(c.x, c.y, c.def.color);
    this.dropCubes(c.x, c.y, Math.floor(c.cubes / 2) + 1);
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
      this.scene.start('GameOver', { victory, placement: this.placement, zarekId: this.selectedZarekId });
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
