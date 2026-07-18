import Phaser from 'phaser';
import type { InputState } from '../core/types';
import { Combatant } from '../core/Combatant';
import { Projectile } from '../core/Projectile';
import { HazardZone } from '../core/HazardZone';
import { Ball } from '../core/Ball';
import { SoccerBot, type SoccerWorld } from '../ai/SoccerBot';
import { PlayerController } from '../input/PlayerController';
import { SoccerHud } from '../ui/SoccerHud';
import { PITCH_NYXT } from '../maps/pitchNyxt';
import { ZAREKS, getZarek } from '../zareks/registry';
import { COLORS } from '../config/constants';
import { TEAM, BALL, SOCCER } from '../config/soccer';
import { clamp, dist, normalize, resolveCircleRect, pointInRect, circleHitsRect } from '../core/geometry';

type Phase = 'kickoff' | 'play' | 'goal' | 'ended';

/**
 * Mode Brawl Ball : football 3 v 3. Deux équipes, une balle, deux buts.
 * On attrape la balle en la touchant, on la « shoote » en relâchant l'attaque
 * dans la direction visée. Premier à 2 buts, sinon but en or après 2 minutes.
 *
 * Scène autonome (elle ne réutilise pas GameScene, très couplée au Battle
 * Royale) mais bâtie sur les mêmes briques : Combatant, Projectile, joystick.
 */
export class SoccerScene extends Phaser.Scene {
  private readonly pitch = PITCH_NYXT;
  private combatants: Combatant[] = [];
  private player!: Combatant;
  private bots = new Map<string, SoccerBot>();
  private spawns = new Map<string, { x: number; y: number }>();
  private respawning = new Map<string, number>();
  private projectiles: Projectile[] = [];
  private hazards: HazardZone[] = [];
  private ball!: Ball;
  private playerController!: PlayerController;
  private hud!: SoccerHud;

  private aimReticle!: Phaser.GameObjects.Arc;
  private kickGuide!: Phaser.GameObjects.Graphics;

  private selectedZarekId = ZAREKS[0].id;
  private score: [number, number] = [0, 0];
  private phase: Phase = 'kickoff';
  private phaseTimer = 0;
  private matchClockMs: number = SOCCER.matchMs;
  private sudden = false;
  private camX = 0;
  private camY = 0;

  constructor() {
    super('Soccer');
  }

  create(data: { zarekId?: string }): void {
    this.selectedZarekId = data?.zarekId ?? ZAREKS[0].id;
    this.combatants = [];
    this.bots = new Map();
    this.spawns = new Map();
    this.respawning = new Map();
    this.projectiles = [];
    this.hazards = [];
    this.score = [0, 0];
    this.phase = 'kickoff';
    this.phaseTimer = SOCCER.kickoffFreezeMs;
    this.matchClockMs = SOCCER.matchMs;
    this.sudden = false;

    const { width, height } = this.pitch.map;
    this.cameras.main.setBounds(0, 0, width, height);

    this.drawPitch();
    this.spawnTeams();
    this.ball = new Ball(this, this.pitch.ballStart.x, this.pitch.ballStart.y);

    this.playerController = new PlayerController(this);
    this.hud = new SoccerHud(this);
    this.aimReticle = this.add.circle(0, 0, 10, COLORS.poison, 0.12).setStrokeStyle(2, COLORS.poison, 0.9).setDepth(13).setVisible(false);
    this.kickGuide = this.add.graphics().setDepth(13);

    this.camX = this.player.x;
    this.camY = this.player.y;
    this.cameras.main.centerOn(this.camX, this.camY);
    // Zoom = 1 impératif (voir GameScene) : sinon l'UI à scrollFactor 0 (bouton
    // ULT, joysticks) se décale des coordonnées du pointeur en tactile.
    this.cameras.main.setZoom(1);

    this.hud.flash('COUP D’ENVOI', '#ffcf33');

    this.events.once('shutdown', () => {
      this.playerController.destroy();
      this.hud.destroy();
    });
  }

  // ---------- Construction ----------

  private drawPitch(): void {
    const { width, height } = this.pitch.map;
    const cx = width / 2;
    const cy = height / 2;

    this.add.rectangle(cx, cy, width, height, COLORS.arenaFloor).setDepth(0);

    const grid = this.add.graphics().setDepth(1);
    grid.lineStyle(1, COLORS.arenaGrid, 0.5);
    for (let x = 0; x <= width; x += 80) grid.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 80) grid.lineBetween(0, y, width, y);

    // Marquages du terrain (ligne médiane + rond central).
    const lines = this.add.graphics().setDepth(2);
    lines.lineStyle(4, 0x4a4680, 0.7);
    lines.lineBetween(cx, 0, cx, height);
    lines.strokeCircle(cx, cy, 150);
    lines.fillStyle(0x4a4680, 0.7);
    lines.fillCircle(cx, cy, 8);

    // Cadres de but, teintés couleur d'équipe (gauche = équipe 0, droite = équipe 1).
    this.drawGoal(this.pitch.leftGoal.zone.x, this.pitch.leftGoal.zone.y, this.pitch.leftGoal.zone.h, TEAM.colorA);
    this.drawGoal(this.pitch.rightGoal.zone.x, this.pitch.rightGoal.zone.y, this.pitch.rightGoal.zone.h, TEAM.colorB);

    // Murs pleins + blocs de couverture.
    for (const w of this.pitch.walls) {
      this.add.rectangle(w.x + w.w / 2, w.y + w.h / 2, w.w, w.h, COLORS.obstacle).setStrokeStyle(2, COLORS.obstacleEdge).setDepth(9);
    }
    for (const o of this.pitch.map.obstacles) {
      if (this.pitch.walls.includes(o)) continue;
      this.add.rectangle(o.x + o.w / 2, o.y + o.h / 2, o.w, o.h, COLORS.obstacle).setStrokeStyle(3, COLORS.obstacleEdge).setDepth(9);
    }
  }

  private drawGoal(x: number, y: number, h: number, color: number): void {
    const w = this.pitch.leftGoal.zone.w;
    this.add.rectangle(x + w / 2, y + h / 2, w, h, color, 0.22).setDepth(2);
    this.add.rectangle(x + w / 2, y + h / 2, w, h).setStrokeStyle(5, color, 0.9).setDepth(3);
  }

  private spawnTeams(): void {
    const t0 = this.pitch.spawnsTeam0;
    const t1 = this.pitch.spawnsTeam1;

    // Équipe 0 : le joueur (emplacement 0) + 2 alliés bots.
    this.player = new Combatant(this, 'player', getZarek(this.selectedZarekId), true, t0[0].x, t0[0].y);
    this.player.team = 0;
    this.combatants.push(this.player);
    this.spawns.set('player', { x: t0[0].x, y: t0[0].y });

    for (let i = 1; i < t0.length; i++) {
      const id = `ally${i}`;
      const def = ZAREKS[Math.floor(Math.random() * ZAREKS.length)];
      const c = new Combatant(this, id, def, false, t0[i].x, t0[i].y, TEAM.colorA);
      c.team = 0;
      this.combatants.push(c);
      this.bots.set(id, new SoccerBot(t0[i].role));
      this.spawns.set(id, { x: t0[i].x, y: t0[i].y });
    }

    // Équipe 1 : 3 adversaires bots.
    for (let i = 0; i < t1.length; i++) {
      const id = `foe${i}`;
      const def = ZAREKS[Math.floor(Math.random() * ZAREKS.length)];
      const c = new Combatant(this, id, def, false, t1[i].x, t1[i].y, TEAM.colorB);
      c.team = 1;
      this.combatants.push(c);
      this.bots.set(id, new SoccerBot(t1[i].role));
      this.spawns.set(id, { x: t1[i].x, y: t1[i].y });
    }
  }

  // ---------- Boucle ----------

  update(_time: number, delta: number): void {
    const dtMs = Math.min(delta, 50);
    const dtSec = dtMs / 1000;

    this.advancePhase(dtMs);
    const frozen = this.phase !== 'play';

    if (!frozen) {
      this.tickMatchClock(dtMs);
      this.tickRespawns(dtMs);
      this.simulate(dtMs, dtSec);
    }

    // Balle : collée au porteur, sinon physique libre (seulement en jeu).
    if (!this.ball.free) {
      const carrier = this.combatants.find((c) => c.id === this.ball.carrierId);
      if (carrier && carrier.alive) this.ball.attachTo(carrier.x, carrier.y, carrier.aimAngle, carrier.def.radius);
      else this.ball.carrierId = null;
    }
    if (!frozen) {
      this.ball.update(dtSec, dtMs, this.pitch.map.obstacles, this.pitch.map.width, this.pitch.map.height);
      this.tryPickup();
      this.checkGoal();
    }
    this.ball.syncDisplay();

    // Rendu des combattants (pas de furtivité en foot : tout le monde est visible).
    for (const c of this.combatants) {
      if (c.alive) c.syncDisplay(true);
    }
    this.updateKickGuide();

    // Caméra : suit le joueur (ou la balle s'il est éliminé).
    const fx = this.player.alive ? this.player.x : this.ball.x;
    const fy = this.player.alive ? this.player.y : this.ball.y;
    this.camX = Phaser.Math.Linear(this.camX, fx, 0.1);
    this.camY = Phaser.Math.Linear(this.camY, fy, 0.1);
    this.cameras.main.centerOn(this.camX, this.camY);

    this.playerController.setUltReady(this.player.ultReady && this.player.alive);
    this.hud.update(this.player, this.score, this.matchClockMs, this.sudden, this.respawning.get('player') ?? 0);
  }

  /** Machine à états : engagement figé → jeu → célébration de but → engagement. */
  private advancePhase(dtMs: number): void {
    if (this.phase === 'kickoff') {
      this.phaseTimer -= dtMs;
      if (this.phaseTimer <= 0) this.phase = 'play';
    } else if (this.phase === 'goal') {
      this.phaseTimer -= dtMs;
      if (this.phaseTimer <= 0) this.resetForKickoff();
    }
  }

  private tickMatchClock(dtMs: number): void {
    if (this.sudden) return;
    this.matchClockMs -= dtMs;
    if (this.matchClockMs > 0) return;
    this.matchClockMs = 0;
    if (this.score[0] === this.score[1]) {
      this.sudden = true;
      this.hud.flash('MORT SUBITE !', '#ffcf33');
    } else {
      this.endMatch(this.score[0] > this.score[1] ? 0 : 1);
    }
  }

  private tickRespawns(dtMs: number): void {
    for (const [id, ms] of this.respawning) {
      const left = ms - dtMs;
      if (left <= 0) {
        const c = this.combatants.find((k) => k.id === id);
        const sp = this.spawns.get(id);
        if (c && sp) c.revive(sp.x, sp.y);
        this.respawning.delete(id);
      } else {
        this.respawning.set(id, left);
      }
    }
  }

  /** Un tour complet de simulation (uniquement en phase de jeu). */
  private simulate(dtMs: number, dtSec: number): void {
    const world: SoccerWorld = {
      all: this.combatants,
      ball: { x: this.ball.x, y: this.ball.y, carrierId: this.ball.carrierId, free: this.ball.free },
      leftGoal: { x: this.pitch.leftGoal.centerX, y: this.pitch.leftGoal.centerY },
      rightGoal: { x: this.pitch.rightGoal.centerX, y: this.pitch.rightGoal.centerY },
      width: this.pitch.map.width,
      height: this.pitch.map.height,
      frozen: false,
    };

    // 1) Entrées.
    const inputs = new Map<string, InputState>();
    for (const c of this.combatants) {
      if (!c.alive) continue;
      if (c.isPlayer) inputs.set(c.id, this.playerController.getInput(c));
      else inputs.set(c.id, this.bots.get(c.id)!.update(c, world, dtMs));
    }

    // 2) Déplacement (le porteur de balle est un peu ralenti).
    const kbDecay = Math.exp(-9 * dtSec);
    const { width, height } = this.pitch.map;
    for (const c of this.combatants) {
      if (!c.alive) continue;
      const inp = inputs.get(c.id)!;
      c.aimAngle = Math.atan2(inp.aimY, inp.aimX);
      c.aimDist = Math.hypot(inp.aimX, inp.aimY);

      const mv = normalize(inp.moveX, inp.moveY);
      let spd = c.speed;
      if (this.ball.carrierId === c.id) spd *= BALL.carrySlowFactor;
      let nx = c.x + mv.x * spd * dtSec + c.kbX * dtSec;
      let ny = c.y + mv.y * spd * dtSec + c.kbY * dtSec;
      c.kbX *= kbDecay;
      c.kbY *= kbDecay;

      nx = clamp(nx, c.def.radius, width - c.def.radius);
      ny = clamp(ny, c.def.radius, height - c.def.radius);
      for (const ob of this.pitch.map.obstacles) {
        const res = resolveCircleRect(nx, ny, c.def.radius, ob);
        if (res) {
          nx = res.x;
          ny = res.y;
        }
      }
      c.x = clamp(nx, c.def.radius, width - c.def.radius);
      c.y = clamp(ny, c.def.radius, height - c.def.radius);
    }

    this.separateCombatants();

    // 3) Actions : le porteur shoote (relâche), les autres attaquent/ult.
    for (const c of this.combatants) {
      if (!c.alive) continue;
      const inp = inputs.get(c.id)!;
      if (this.ball.carrierId === c.id) {
        if (inp.attackReleased) this.kickBall(c);
        if (inp.ultimate && c.ultReady) this.fireUlt(c);
      } else {
        const wantsAttack = c.def.attack.kind === 'potion' ? inp.attackReleased : inp.attack;
        if (wantsAttack && c.reloadTimer <= 0) this.fireAttack(c);
        if (inp.ultimate && c.ultReady) this.fireUlt(c);
      }
    }

    // Aperçu de visée potion (seulement si le joueur ne porte PAS la balle).
    this.updateAimReticle(inputs.get(this.player.id));

    // 4) Timers, projectiles, zones, poison, régén.
    for (const c of this.combatants) if (c.alive) c.tickTimers(dtMs);
    this.updateProjectiles(dtSec);
    this.updateHazards(dtSec, dtMs);
    for (const c of this.combatants) if (c.alive) c.tickPoison(dtMs);
    for (const c of this.combatants) if (c.alive) c.regenerate(dtMs);

    // 5) Éliminations → réapparition programmée.
    for (const c of this.combatants) {
      if (!c.alive && !this.respawning.has(c.id)) this.handleDeath(c);
    }
  }

  private separateCombatants(): void {
    const { width, height } = this.pitch.map;
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
          a.x = clamp(a.x - nx * push, a.def.radius, width - a.def.radius);
          a.y = clamp(a.y - ny * push, a.def.radius, height - a.def.radius);
          b.x = clamp(b.x + nx * push, b.def.radius, width - b.def.radius);
          b.y = clamp(b.y + ny * push, b.def.radius, height - b.def.radius);
        }
      }
    }
  }

  // ---------- Balle ----------

  private kickBall(c: Combatant): void {
    this.ball.kick(c.id, c.aimAngle, BALL.kickSpeed);
    c.noteAttack();
    this.kickFx(this.ball.x, this.ball.y);
  }

  private tryPickup(): void {
    if (!this.ball.free || this.ball.graceMs > 0) return;
    let best: Combatant | null = null;
    let bestD = Infinity;
    for (const c of this.combatants) {
      if (!c.alive) continue;
      if (c.id === this.ball.kickerId && this.ball.kickerLockMs > 0) continue;
      const d = dist(c.x, c.y, this.ball.x, this.ball.y);
      if (d <= c.def.radius + this.ball.radius + BALL.grabPad && d < bestD) {
        best = c;
        bestD = d;
      }
    }
    if (best) {
      this.ball.carrierId = best.id;
      this.ball.kickerId = null;
    }
  }

  private checkGoal(): void {
    if (pointInRect(this.ball.x, this.ball.y, this.pitch.leftGoal.zone)) this.onGoal(1);
    else if (pointInRect(this.ball.x, this.ball.y, this.pitch.rightGoal.zone)) this.onGoal(0);
  }

  private onGoal(team: number): void {
    this.score[team] += 1;
    const color = team === 0 ? '#3aa0ff' : '#ff5a5a';
    const who = team === 0 ? TEAM.labelA : TEAM.labelB;
    this.ball.carrierId = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.goalFx(this.ball.x, this.ball.y, team === 0 ? TEAM.colorA : TEAM.colorB);
    this.cameras.main.shake(260, 0.008);

    if (this.score[team] >= SOCCER.goalsToWin || this.sudden) {
      this.hud.flash(`BUT ${who} !`, color);
      this.endMatch(team);
      return;
    }
    this.hud.flash(`BUT ${who} !`, color);
    this.phase = 'goal';
    this.phaseTimer = SOCCER.goalCelebrateMs;
  }

  private resetForKickoff(): void {
    for (const c of this.combatants) {
      const sp = this.spawns.get(c.id)!;
      if (c.alive) c.placeAt(sp.x, sp.y, true);
      else c.revive(sp.x, sp.y);
    }
    this.respawning.clear();
    for (const p of this.projectiles) p.destroy();
    this.projectiles = [];
    for (const h of this.hazards) h.destroy();
    this.hazards = [];
    this.ball.carrierId = null;
    this.ball.kickerId = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.graceMs = 0;
    this.ball.kickerLockMs = 0;
    this.ball.x = this.pitch.ballStart.x;
    this.ball.y = this.pitch.ballStart.y;
    this.phase = 'kickoff';
    this.phaseTimer = SOCCER.kickoffFreezeMs;
  }

  private updateKickGuide(): void {
    this.kickGuide.clear();
    if (this.ball.carrierId !== this.player.id || !this.player.alive) return;
    const len = 230;
    const ex = this.player.x + Math.cos(this.player.aimAngle) * len;
    const ey = this.player.y + Math.sin(this.player.aimAngle) * len;
    this.kickGuide.lineStyle(5, COLORS.playerAccent, 0.45);
    this.kickGuide.lineBetween(this.player.x, this.player.y, ex, ey);
    this.kickGuide.fillStyle(COLORS.playerAccent, 0.55);
    this.kickGuide.fillCircle(ex, ey, 12);
  }

  // ---------- Combat (repris des mécaniques Zarek ; tir allié désactivé) ----------

  private teamOf(id: string): number {
    return this.combatants.find((c) => c.id === id)?.team ?? -1;
  }

  private fireAttack(c: Combatant): void {
    const a = c.def.attack;
    if (a.kind === 'potion') {
      this.throwPotion(c);
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

  private throwPotion(c: Combatant): void {
    const a = c.def.attack;
    const dx = Math.cos(c.aimAngle);
    const dy = Math.sin(c.aimAngle);
    const range = a.range;
    const throwDist = c.aimDist > 40 ? clamp(c.aimDist, 90, range) : range;
    const muzzle = c.def.radius + 6;
    const proj = new Projectile(this, c.id, c.x + dx * muzzle, c.y + dy * muzzle, dx * a.speed, dy * a.speed, 0, a.projRadius, throwDist, c.def.color);
    proj.landsInto = { radius: a.aoeRadius ?? 80, durationMs: a.aoeDurationMs ?? 2500, dps: (a.aoeDps ?? 120) * c.damageMult };
    this.projectiles.push(proj);
  }

  private updateAimReticle(inp?: InputState): void {
    const p = this.player;
    const carrying = this.ball.carrierId === p.id;
    if (inp && p.alive && !carrying && p.def.attack.kind === 'potion' && inp.attack) {
      const range = p.def.attack.range;
      const d = p.aimDist > 40 ? clamp(p.aimDist, 90, range) : range;
      const lx = p.x + Math.cos(p.aimAngle) * d;
      const ly = p.y + Math.sin(p.aimAngle) * d;
      this.aimReticle.setPosition(lx, ly).setRadius(p.def.attack.aoeRadius ?? 80).setVisible(true);
    } else {
      this.aimReticle.setVisible(false);
    }
  }

  private updateProjectiles(dtSec: number): void {
    const { width, height } = this.pitch.map;
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      p.update(dtSec);
      const isPotion = p.landsInto !== null;
      const ownerTeam = this.teamOf(p.ownerId);

      let landed = !p.alive;
      if (p.x < 0 || p.y < 0 || p.x > width || p.y > height) {
        p.kill();
        landed = true;
      } else {
        for (const ob of this.pitch.map.obstacles) {
          if (circleHitsRect(p.x, p.y, p.radius, ob)) {
            p.kill();
            landed = true;
            break;
          }
        }
      }

      if (isPotion) {
        if (!landed) {
          for (const c of this.combatants) {
            if (!c.alive || c.team === ownerTeam) continue;
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
        if (!c.alive || c.team === ownerTeam) continue; // pas de tir allié
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

  private spawnPotionPuddle(p: Projectile): void {
    const info = p.landsInto;
    if (!info) return;
    this.hazards.push(
      new HazardZone(this, p.x, p.y, { radius: info.radius, ownerId: p.ownerId, durationMs: info.durationMs, color: COLORS.poison, dps: info.dps, chargesUlt: true }),
    );
  }

  private updateHazards(dtSec: number, dtMs: number): void {
    for (const h of this.hazards) {
      h.update(dtMs);
      if (!h.alive) continue;
      const ownerTeam = this.teamOf(h.ownerId);
      for (const c of this.combatants) {
        if (!c.alive || c.team === ownerTeam) continue;
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

  private fireUlt(c: Combatant): void {
    const u = c.def.ultimate;
    if (u.kind === 'aura') {
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
    } else {
      const dmg = u.damage * c.damageMult;
      this.shockwaveFx(c.x, c.y, u.radius, c.def.color);
      for (const other of this.combatants) {
        if (other === c || !other.alive || other.team === c.team) continue;
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

  // ---------- Mort / fin ----------

  private handleDeath(c: Combatant): void {
    this.deathBurst(c.x, c.y, c.def.color);
    if (this.ball.carrierId === c.id) {
      this.ball.drop(this.pitch.centerX - c.x, this.pitch.centerY - c.y);
    }
    c.hide();
    this.respawning.set(c.id, SOCCER.respawnMs);
  }

  private endMatch(winnerTeam: number): void {
    if (this.phase === 'ended') return;
    this.phase = 'ended';
    const victory = winnerTeam === 0;
    this.hud.flash(victory ? 'VICTOIRE !' : 'DÉFAITE', victory ? '#ffcf33' : '#ff6b5e');
    this.time.delayedCall(1700, () => {
      this.scene.start('GameOver', {
        victory,
        mode: 'brawl-ball',
        score: [this.score[0], this.score[1]],
        zarekId: this.selectedZarekId,
        modeId: 'brawl-ball',
      });
    });
  }

  // ---------- Effets visuels ----------

  private kickFx(x: number, y: number): void {
    const ring = this.add.circle(x, y, 30, COLORS.white, 0.1).setStrokeStyle(4, COLORS.white, 0.8).setDepth(23).setScale(0.4);
    this.tweens.add({ targets: ring, scale: 1.2, alpha: 0, duration: 260, ease: 'Cubic.out', onComplete: () => ring.destroy() });
  }

  private goalFx(x: number, y: number, color: number): void {
    for (let i = 0; i < 3; i++) {
      const ring = this.add.circle(x, y, 40, color, 0.15).setStrokeStyle(6, color, 0.9).setDepth(26).setScale(0.2);
      this.tweens.add({ targets: ring, scale: 2 + i * 0.6, alpha: 0, duration: 520 + i * 120, ease: 'Cubic.out', onComplete: () => ring.destroy() });
    }
  }

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
