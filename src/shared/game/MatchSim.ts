import type { InputState, ZarekDef } from '../../core/types';
import { emptyInput } from '../../core/types';
import { PITCH_NYXT } from '../../maps/pitchNyxt';
import { BALL, SOCCER } from '../../config/soccer';
import { COLORS, REGEN, ZONE, POWER_CUBE } from '../../config/constants';
import { ZAREKS, ZAREK_BY_ID, getZarek } from '../../zareks/registry';
import { SoccerBot, type SoccerWorld } from '../../ai/SoccerBot';
import { BattleBot, type BattleWorld } from '../../ai/BattleBot';
import { clamp, dist, normalize, resolveCircleRect, circleHitsRect, pointInRect } from '../../core/geometry';

export type OnlineMode = 'brawl-ball' | 'battle-royale';
import { resolveChain } from './chain';
import type { MatchPhase, MatchSnapshot, FxEvent, SnapPlayer } from './snapshot';

const LOBBY_MS = 30000; // compte à rebours de la salle d'attente (bouton Démarrer pour lancer avant)
const KICKOFF_MS = 2200; // gel « 3..2..1 » avant l'engagement
const TEAM_SIZE = SOCCER.teamSize;

const MAP = PITCH_NYXT.map;
const W = MAP.width;
const H = MAP.height;
const OBS = MAP.obstacles;

// Battle Royale en ligne (chacun pour soi).
const BR_PLAYERS = 6;
const BR_MATCH_MS = 180000; // filet de sécurité ; le dernier survivant termine avant
const ZONE_CENTER = { x: W / 2, y: H / 2 };
const ZONE_INIT = Math.hypot(W / 2, H / 2) + 60; // couvre l'arène au départ
const ZONE_MIN = 240;
const BR_SHRINK_MS = 78000; // durée de rétrécissement après le délai initial

/** Cube de power-up au sol (Battle Royale), pur. */
class SimCube {
  alive = true;
  constructor(
    public x: number,
    public y: number,
  ) {}
}

/** Combattant de simulation (pur, sans Phaser). Satisfait aussi `BotView`. */
class SimCombatant {
  aimAngle = 0;
  aimDist = 0;
  health: number;
  alive = true;
  reloadTimer = 0;
  ultCharge = 0;
  slowTimer = 0;
  slowFactor = 1;
  kbX = 0;
  kbY = 0;
  sinceCombatMs = 0;
  poisonMs = 0;
  poisonDps = 0;
  respawnMs = 0;
  /** Cubes de power-up ramassés (Battle Royale ; 0 au foot). */
  cubes = 0;
  /** Éliminé définitivement (Battle Royale : pas de réapparition). */
  eliminated = false;

  constructor(
    public id: string,
    public name: string,
    public team: number,
    public zarekId: string,
    public def: ZarekDef,
    public isBot: boolean,
    public x: number,
    public y: number,
  ) {
    this.health = def.maxHealth;
  }

  get maxHealth(): number {
    return Math.round(this.def.maxHealth * (1 + POWER_CUBE.bonusPerCube * this.cubes));
  }
  get damageMult(): number {
    return 1 + POWER_CUBE.bonusPerCube * this.cubes;
  }
  /** Ramasse un cube : +PV max / +dégâts, petit soin partiel (le reste via régén). */
  pickCube(): void {
    const beforeMax = this.maxHealth;
    this.cubes += 1;
    const gained = this.maxHealth - beforeMax;
    this.health = Math.min(this.maxHealth, this.health + gained * 0.35);
  }
  get speed(): number {
    return this.def.moveSpeed * (this.slowTimer > 0 ? this.slowFactor : 1);
  }
  get healthRatio(): number {
    return Math.max(0, Math.min(1, this.health / this.maxHealth));
  }
  get ultReady(): boolean {
    return this.ultCharge >= 100;
  }

  takeDamage(amount: number): number {
    if (!this.alive) return 0;
    if (amount > 0) this.sinceCombatMs = 0;
    const before = this.health;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) this.alive = false;
    return before - this.health;
  }
  addUltCharge(dmg: number): void {
    this.ultCharge = Math.max(0, Math.min(100, this.ultCharge + dmg * this.def.ultChargePerDamage));
  }
  consumeUlt(): void {
    this.ultCharge = 0;
  }
  applySlow(ms: number, factor: number): void {
    if (ms <= 0) return;
    this.slowTimer = Math.max(this.slowTimer, ms);
    this.slowFactor = factor;
  }
  applyPoison(ms: number, dps: number): void {
    if (ms <= 0) return;
    this.poisonMs = Math.max(this.poisonMs, ms);
    this.poisonDps = Math.max(this.poisonDps, dps);
  }
  tickPoison(dtMs: number): void {
    if (this.poisonMs <= 0) return;
    this.takeDamage(this.poisonDps * (dtMs / 1000));
    this.poisonMs -= dtMs;
    if (this.poisonMs <= 0) this.poisonDps = 0;
  }
  applyKnockback(dx: number, dy: number, force: number): void {
    this.kbX += dx * force;
    this.kbY += dy * force;
  }
  tickTimers(dtMs: number): void {
    if (this.reloadTimer > 0) this.reloadTimer -= dtMs;
    if (this.slowTimer > 0) this.slowTimer -= dtMs;
    this.sinceCombatMs += dtMs;
  }
  noteAttack(): void {
    this.sinceCombatMs = 0;
  }
  regenerate(dtMs: number): void {
    if (!this.alive || this.sinceCombatMs < REGEN.delayMs || this.health >= this.maxHealth) return;
    this.health = Math.min(this.maxHealth, this.health + this.maxHealth * REGEN.percentPerSecond * (dtMs / 1000));
  }
  placeAt(x: number, y: number, fullHeal = true): void {
    this.x = x;
    this.y = y;
    if (fullHeal) this.health = this.maxHealth;
    this.slowTimer = 0;
    this.slowFactor = 1;
    this.poisonMs = 0;
    this.poisonDps = 0;
    this.kbX = 0;
    this.kbY = 0;
    this.reloadTimer = 0;
    this.sinceCombatMs = REGEN.delayMs;
  }
  revive(x: number, y: number): void {
    this.alive = true;
    this.respawnMs = 0;
    this.ultCharge = 0;
    this.placeAt(x, y, true);
  }
}

/** Projectile de simulation (pur). */
class SimProjectile {
  distanceLeft: number;
  alive = true;
  landsInto: { radius: number; durationMs: number; dps: number } | null = null;
  constructor(
    public ownerId: string,
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    public damage: number,
    public radius: number,
    range: number,
    public color: number,
  ) {
    this.distanceLeft = range;
  }
  update(dtSec: number): void {
    const sx = this.vx * dtSec;
    const sy = this.vy * dtSec;
    this.x += sx;
    this.y += sy;
    this.distanceLeft -= Math.hypot(sx, sy);
    if (this.distanceLeft <= 0) this.alive = false;
  }
  kill(): void {
    this.alive = false;
  }
}

/** Zone au sol de simulation (flaque de potion / aura de poison), pure. */
class SimHazard {
  alive = true;
  slowFactor = 1;
  slowMs = 0;
  poisonMs = 0;
  poisonDps = 0;
  chargesUlt = false;
  private life: number;
  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public ownerId: string,
    durationMs: number,
    public dps: number,
    public color: number,
  ) {
    this.life = durationMs;
  }
  update(dtMs: number): void {
    this.life -= dtMs;
    if (this.life <= 0) this.alive = false;
  }
  contains(px: number, py: number, r: number): boolean {
    return dist(px, py, this.x, this.y) <= this.radius + r;
  }
}

/** Balle de simulation (physique pure, portée en avant du porteur, tir/rebond). */
class SimBall {
  vx = 0;
  vy = 0;
  radius = BALL.radius;
  carrierId: string | null = null;
  graceMs = 0;
  kickerLockMs = 0;
  kickerId: string | null = null;
  constructor(public x: number, public y: number) {}

  get free(): boolean {
    return this.carrierId === null;
  }
  attachTo(px: number, py: number, aim: number, carrierRadius: number): void {
    const maxD = carrierRadius + this.radius + BALL.carryOffset;
    const dx = Math.cos(aim);
    const dy = Math.sin(aim);
    let placedX = px;
    let placedY = py;
    for (let t = 6; t <= maxD; t += 6) {
      const cx = px + dx * t;
      const cy = py + dy * t;
      if (OBS.some((o) => circleHitsRect(cx, cy, this.radius, o))) break;
      placedX = cx;
      placedY = cy;
    }
    this.x = placedX;
    this.y = placedY;
    this.vx = 0;
    this.vy = 0;
  }
  kick(fromId: string, angle: number, speed: number): void {
    this.carrierId = null;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.graceMs = BALL.grabGraceMs;
    this.kickerLockMs = BALL.kickerLockMs;
    this.kickerId = fromId;
  }
  drop(dx: number, dy: number): void {
    const n = normalize(dx, dy);
    this.carrierId = null;
    this.kickerId = null;
    this.vx = n.x * 160;
    this.vy = n.y * 160;
    this.graceMs = BALL.grabGraceMs;
    this.kickerLockMs = 0;
  }
  update(dtSec: number, dtMs: number): void {
    if (this.graceMs > 0) this.graceMs = Math.max(0, this.graceMs - dtMs);
    if (this.kickerLockMs > 0) this.kickerLockMs = Math.max(0, this.kickerLockMs - dtMs);
    if (!this.free) return;
    const distTot = Math.hypot(this.vx, this.vy) * dtSec;
    const steps = Math.max(1, Math.ceil(distTot / (this.radius * 0.8)));
    const sdt = dtSec / steps;
    for (let k = 0; k < steps; k++) {
      this.x += this.vx * sdt;
      this.y += this.vy * sdt;
      for (const ob of OBS) {
        if (!circleHitsRect(this.x, this.y, this.radius, ob)) continue;
        const res = resolveCircleRect(this.x, this.y, this.radius, ob);
        if (!res) continue;
        const n = normalize(res.x - this.x, res.y - this.y);
        this.x = res.x;
        this.y = res.y;
        const dot = this.vx * n.x + this.vy * n.y;
        if (dot < 0) {
          this.vx -= (1 + BALL.restitution) * dot * n.x;
          this.vy -= (1 + BALL.restitution) * dot * n.y;
        }
      }
      this.x = clamp(this.x, this.radius, W - this.radius);
      this.y = clamp(this.y, this.radius, H - this.radius);
    }
    const decay = Math.exp(-BALL.friction * dtSec);
    this.vx *= decay;
    this.vy *= decay;
    if (Math.hypot(this.vx, this.vy) < BALL.stopSpeed) {
      this.vx = 0;
      this.vy = 0;
    }
  }
}

function spawnsFor(team: number) {
  return team === 0 ? PITCH_NYXT.spawnsTeam0 : PITCH_NYXT.spawnsTeam1;
}

/**
 * Simulation d'un match Brawl Ball 3v3, AUTORITAIRE et sans rendu. Le serveur la
 * fait tourner à partir des `InputState` reçus et diffuse des snapshots. Gère le
 * cycle salle d'attente → engagement → jeu → but → résultat, avec remplissage et
 * remplacement des bots (les humains prennent la place d'un bot en arrivant).
 */
export class MatchSim {
  private combatants: SimCombatant[] = [];
  private bots = new Map<string, SoccerBot | BattleBot>();
  private inputs = new Map<string, InputState>();
  private ball = new SimBall(PITCH_NYXT.ballStart.x, PITCH_NYXT.ballStart.y);
  private projectiles: SimProjectile[] = [];
  private hazards: SimHazard[] = [];
  private botSeq = 0;

  // Battle Royale
  private teamSeq = 0; // équipe unique par joueur en FFA
  private cubesArr: SimCube[] = [];
  private zoneRadius = ZONE_INIT;
  private zoneElapsed = 0;

  constructor(private mode: OnlineMode = 'brawl-ball') {}

  private get isBR(): boolean {
    return this.mode === 'battle-royale';
  }

  private brSpawn(i: number, n: number): { x: number; y: number } {
    const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
    return { x: ZONE_CENTER.x + Math.cos(a) * W * 0.34, y: ZONE_CENTER.y + Math.sin(a) * H * 0.32 };
  }

  phase: MatchPhase = 'lobby';
  private timer = LOBBY_MS;
  private matchClock: number = SOCCER.matchMs;
  private sudden = false;
  private winner = -1;
  private score: [number, number] = [0, 0];
  private fx: FxEvent[] = [];

  // ---------- Joueurs (join / leave / équipe) ----------

  humanCount(): number {
    return this.combatants.filter((c) => !c.isBot).length;
  }

  private teamHumanCount(team: number): number {
    return this.combatants.filter((c) => !c.isBot && c.team === team).length;
  }

  private pickTeam(preferred: number): number {
    const t = preferred === 1 ? 1 : 0;
    if (this.teamHumanCount(t) < TEAM_SIZE) return t;
    const other = t === 0 ? 1 : 0;
    return this.teamHumanCount(other) < TEAM_SIZE ? other : t;
  }

  addPlayer(id: string, name: string, zarekId: string, preferredTeam: number): void {
    const zid = ZAREK_BY_ID[zarekId] ? zarekId : ZAREKS[0].id;
    const def = getZarek(zid);

    if (this.isBR) {
      if (this.phase === 'lobby') {
        const sp = this.brSpawn(this.combatants.length, BR_PLAYERS);
        this.combatants.push(new SimCombatant(id, name, this.teamSeq++, zid, def, false, sp.x, sp.y));
        return;
      }
      // En cours : prendre la place d'un bot (garde son équipe unique).
      const b = this.combatants.find((c) => c.isBot);
      if (!b) return;
      this.bots.delete(b.id);
      this.inputs.delete(b.id);
      b.id = id;
      b.name = name;
      b.zarekId = zid;
      b.def = def;
      b.isBot = false;
      b.cubes = 0;
      b.alive = true;
      b.eliminated = false;
      b.respawnMs = 0;
      b.ultCharge = 0;
      b.health = b.maxHealth;
      return;
    }

    const team = this.pickTeam(preferredTeam);

    if (this.phase === 'lobby') {
      const sp = spawnsFor(team)[this.combatants.filter((c) => c.team === team).length % TEAM_SIZE];
      this.combatants.push(new SimCombatant(id, name, team, zid, def, false, sp.x, sp.y));
      return;
    }

    // En cours de partie : on prend la place d'un bot (de préférence dans l'équipe voulue).
    const bot = this.combatants.find((c) => c.isBot && c.team === team) ?? this.combatants.find((c) => c.isBot);
    if (!bot) return; // aucun bot à remplacer (que des humains) : ignoré (salon plein côté réseau)
    this.bots.delete(bot.id);
    this.inputs.delete(bot.id);
    this.reassignId(bot, id);
    bot.name = name;
    bot.zarekId = zid;
    bot.def = def;
    bot.isBot = false;
    bot.health = bot.maxHealth;
    bot.alive = true;
    bot.respawnMs = 0;
    bot.ultCharge = 0;
  }

  removePlayer(id: string): void {
    const c = this.combatants.find((k) => k.id === id);
    if (!c) return;
    this.inputs.delete(id);

    if (this.phase === 'lobby' || this.phase === 'ended') {
      this.combatants = this.combatants.filter((k) => k.id !== id);
      if (this.humanCount() === 0) this.resetToLobby();
      return;
    }

    // En cours de partie : la place devient un bot (pour garder l'effectif).
    const botId = `bot${this.botSeq++}`;
    if (this.isBR) {
      c.id = botId;
      c.isBot = true;
      c.name = 'Bot';
      this.bots.set(botId, new BattleBot());
    } else {
      if (this.ball.carrierId === c.id) this.ball.drop(PITCH_NYXT.centerX - c.x, PITCH_NYXT.centerY - c.y);
      this.reassignId(c, botId);
      c.isBot = true;
      c.name = 'Bot';
      this.bots.set(botId, new SoccerBot(spawnsFor(c.team)[0].role));
    }
    if (this.humanCount() === 0) this.resetToLobby();
  }

  /** Change l'id d'un combattant en gardant cohérentes les références de balle. */
  private reassignId(c: SimCombatant, newId: string): void {
    if (this.ball.carrierId === c.id) this.ball.carrierId = newId;
    if (this.ball.kickerId === c.id) this.ball.kickerId = newId;
    c.id = newId;
  }

  chooseTeam(id: string, team: number): void {
    if (this.isBR) return; // pas d'équipes en Battle Royale (chacun pour soi)
    if (this.phase !== 'lobby') return;
    const c = this.combatants.find((k) => k.id === id && !k.isBot);
    if (!c || c.team === team) return;
    if (this.teamHumanCount(team) >= TEAM_SIZE) return; // camp plein → on reste
    c.team = team;
    const sp = spawnsFor(team)[(this.teamHumanCount(team) - 1) % TEAM_SIZE];
    c.placeAt(sp.x, sp.y, true);
  }

  setInput(id: string, input: InputState): void {
    if (this.combatants.some((c) => c.id === id && !c.isBot)) this.inputs.set(id, input);
  }

  requestStart(): void {
    if (this.phase === 'lobby' && this.humanCount() > 0) this.startMatch();
  }

  requestRematch(): void {
    if (this.phase === 'ended') this.resetToLobby();
  }

  // ---------- Cycle de vie ----------

  private resetToLobby(): void {
    this.combatants = this.combatants.filter((c) => !c.isBot);
    this.bots.clear();
    this.projectiles = [];
    this.hazards = [];
    this.ball.carrierId = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.x = PITCH_NYXT.ballStart.x;
    this.ball.y = PITCH_NYXT.ballStart.y;
    this.cubesArr = [];
    this.zoneRadius = ZONE_INIT;
    this.zoneElapsed = 0;
    for (const c of this.combatants) {
      c.cubes = 0;
      c.eliminated = false;
      c.alive = true;
      c.respawnMs = 0;
    }
    this.score = [0, 0];
    this.sudden = false;
    this.winner = -1;
    this.phase = 'lobby';
    this.timer = LOBBY_MS;
  }

  private startMatch(): void {
    if (this.isBR) {
      this.startMatchBR();
      return;
    }
    // Compléter chaque équipe à 3 avec des bots.
    for (const team of [0, 1]) {
      let members = this.combatants.filter((c) => c.team === team).length;
      while (members < TEAM_SIZE) {
        const sp = spawnsFor(team)[members];
        const def = ZAREKS[Math.floor(Math.random() * ZAREKS.length)];
        const id = `bot${this.botSeq++}`;
        this.combatants.push(new SimCombatant(id, 'Bot', team, def.id, def, true, sp.x, sp.y));
        this.bots.set(id, new SoccerBot(sp.role));
        members++;
      }
    }
    this.score = [0, 0];
    this.sudden = false;
    this.winner = -1;
    this.projectiles = [];
    this.hazards = [];
    this.resetPositions(true);
    this.phase = 'countdown';
    this.timer = KICKOFF_MS;
  }

  /** Démarrage d'une Battle Royale : complète à 6 avec des bots, place en cercle,
   *  sème les cubes, arme la zone. */
  private startMatchBR(): void {
    while (this.combatants.length < BR_PLAYERS) {
      const def = ZAREKS[Math.floor(Math.random() * ZAREKS.length)];
      const id = `bot${this.botSeq++}`;
      this.combatants.push(new SimCombatant(id, 'Bot', this.teamSeq++, def.id, def, true, 0, 0));
      this.bots.set(id, new BattleBot());
    }
    const n = this.combatants.length;
    this.combatants.forEach((c, i) => {
      const sp = this.brSpawn(i, n);
      c.cubes = 0;
      c.placeAt(sp.x, sp.y, true);
      c.alive = true;
      c.eliminated = false;
      c.respawnMs = 0;
      c.ultCharge = 0;
    });
    this.spawnCubes();
    this.zoneRadius = ZONE_INIT;
    this.zoneElapsed = 0;
    this.winner = -1;
    this.projectiles = [];
    this.hazards = [];
    this.phase = 'countdown';
    this.timer = KICKOFF_MS;
  }

  private spawnCubes(): void {
    this.cubesArr = [];
    let placed = 0;
    let tries = 0;
    while (placed < POWER_CUBE.initialCount && tries < 300) {
      tries++;
      const x = 120 + Math.random() * (W - 240);
      const y = 120 + Math.random() * (H - 240);
      if (OBS.some((o) => circleHitsRect(x, y, POWER_CUBE.radius + 8, o))) continue;
      this.cubesArr.push(new SimCube(x, y));
      placed++;
    }
  }

  private updateZone(dtMs: number, dtSec: number): void {
    this.zoneElapsed += dtMs;
    const t = clamp((this.zoneElapsed - ZONE.startDelayMs) / BR_SHRINK_MS, 0, 1);
    this.zoneRadius = ZONE_INIT + (ZONE_MIN - ZONE_INIT) * t;
    const dps = ZONE.baseDamagePerSecond + t * 18;
    for (const c of this.combatants) {
      if (!c.alive) continue;
      if (dist(c.x, c.y, ZONE_CENTER.x, ZONE_CENTER.y) > this.zoneRadius) c.takeDamage(dps * dtSec);
    }
  }

  private updateCubes(): void {
    for (const cube of this.cubesArr) {
      if (!cube.alive) continue;
      for (const c of this.combatants) {
        if (!c.alive) continue;
        if (dist(c.x, c.y, cube.x, cube.y) <= POWER_CUBE.pickupRadius + c.def.radius) {
          c.pickCube();
          cube.alive = false;
          break;
        }
      }
    }
  }

  private battleWorld(): BattleWorld {
    return {
      all: this.combatants,
      cubes: this.cubesArr,
      zone: { x: ZONE_CENTER.x, y: ZONE_CENTER.y, r: this.zoneRadius },
      obstacles: OBS,
      width: W,
      height: H,
    };
  }

  /** Fin de BR dès qu'il ne reste qu'un survivant (ou personne = nul). */
  private checkSurvivors(): void {
    if (this.phase !== 'playing') return;
    const alive = this.combatants.filter((c) => c.alive);
    if (alive.length <= 1) this.endMatch(alive.length === 1 ? alive[0].team : -1);
  }

  private resetPositions(resetUlt: boolean): void {
    for (const team of [0, 1]) {
      const members = this.combatants.filter((c) => c.team === team);
      const sp = spawnsFor(team);
      members.forEach((c, i) => {
        c.placeAt(sp[i % sp.length].x, sp[i % sp.length].y, true);
        c.alive = true;
        c.respawnMs = 0;
        if (resetUlt) c.ultCharge = 0;
      });
    }
    this.ball.carrierId = null;
    this.ball.kickerId = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.x = PITCH_NYXT.ballStart.x;
    this.ball.y = PITCH_NYXT.ballStart.y;
  }

  private resetForKickoff(): void {
    this.projectiles = [];
    this.hazards = [];
    this.resetPositions(false);
    this.phase = 'countdown';
    this.timer = KICKOFF_MS;
  }

  private endMatch(winnerTeam: number): void {
    this.winner = winnerTeam;
    this.phase = 'ended';
    this.timer = 0;
  }

  // ---------- Boucle ----------

  step(dtMs: number): void {
    const dtSec = dtMs / 1000;
    this.fx = [];

    switch (this.phase) {
      case 'lobby':
        if (this.humanCount() === 0) {
          this.timer = LOBBY_MS;
        } else {
          this.timer -= dtMs;
          if (this.timer <= 0) this.startMatch();
        }
        break;
      case 'countdown':
        this.timer -= dtMs;
        if (this.timer <= 0) {
          this.phase = 'playing';
          this.matchClock = this.isBR ? BR_MATCH_MS : SOCCER.matchMs;
        }
        break;
      case 'goal':
        this.timer -= dtMs;
        if (this.timer <= 0) this.resetForKickoff();
        break;
      case 'playing':
        if (this.isBR) {
          this.matchClock -= dtMs;
          this.simulate(dtMs, dtSec);
          this.updateZone(dtMs, dtSec);
          this.updateCubes();
          this.checkSurvivors();
          if (this.phase === 'playing' && this.matchClock <= 0) {
            const alive = this.combatants.filter((c) => c.alive);
            this.endMatch(alive.length ? alive[0].team : -1);
          }
        } else {
          this.tickMatchClock(dtMs);
          if (this.phase === 'playing') {
            this.tickRespawns(dtMs);
            this.simulate(dtMs, dtSec);
            this.updateBall(dtSec, dtMs);
          }
        }
        break;
      case 'ended':
        break;
    }
  }

  private tickMatchClock(dtMs: number): void {
    if (this.sudden) return;
    this.matchClock -= dtMs;
    if (this.matchClock > 0) return;
    this.matchClock = 0;
    if (this.score[0] === this.score[1]) this.sudden = true;
    else this.endMatch(this.score[0] > this.score[1] ? 0 : 1);
  }

  private tickRespawns(dtMs: number): void {
    for (const c of this.combatants) {
      if (c.alive || c.respawnMs <= 0) continue;
      c.respawnMs -= dtMs;
      if (c.respawnMs <= 0) {
        const sp = spawnsFor(c.team);
        const idx = this.combatants.filter((k) => k.team === c.team).indexOf(c);
        c.revive(sp[Math.max(0, idx) % sp.length].x, sp[Math.max(0, idx) % sp.length].y);
      }
    }
  }

  private botWorld(): SoccerWorld {
    return {
      all: this.combatants,
      ball: { x: this.ball.x, y: this.ball.y, carrierId: this.ball.carrierId, free: this.ball.free },
      leftGoal: { x: PITCH_NYXT.leftGoal.centerX, y: PITCH_NYXT.leftGoal.centerY },
      rightGoal: { x: PITCH_NYXT.rightGoal.centerX, y: PITCH_NYXT.rightGoal.centerY },
      obstacles: OBS,
      width: W,
      height: H,
      frozen: false,
    };
  }

  private simulate(dtMs: number, dtSec: number): void {
    const world = this.isBR ? null : this.botWorld();
    const bworld = this.isBR ? this.battleWorld() : null;

    // 1) Entrées.
    const inputs = new Map<string, InputState>();
    for (const c of this.combatants) {
      if (!c.alive) continue;
      if (c.isBot) {
        const bot = this.bots.get(c.id)!;
        inputs.set(c.id, this.isBR ? (bot as BattleBot).update(c, bworld!, dtMs) : (bot as SoccerBot).update(c, world!, dtMs));
      } else {
        inputs.set(c.id, this.inputs.get(c.id) ?? emptyInput());
      }
    }

    // 2) Déplacement (porteur ralenti + recul).
    const kbDecay = Math.exp(-9 * dtSec);
    for (const c of this.combatants) {
      if (!c.alive) continue;
      const inp = inputs.get(c.id)!;
      if (inp.aimX !== 0 || inp.aimY !== 0) c.aimAngle = Math.atan2(inp.aimY, inp.aimX);
      c.aimDist = Math.hypot(inp.aimX, inp.aimY);
      const mv = normalize(inp.moveX, inp.moveY);
      let spd = c.speed;
      if (this.ball.carrierId === c.id) spd *= BALL.carrySlowFactor;
      let nx = c.x + mv.x * spd * dtSec + c.kbX * dtSec;
      let ny = c.y + mv.y * spd * dtSec + c.kbY * dtSec;
      c.kbX *= kbDecay;
      c.kbY *= kbDecay;
      nx = clamp(nx, c.def.radius, W - c.def.radius);
      ny = clamp(ny, c.def.radius, H - c.def.radius);
      for (const ob of OBS) {
        const res = resolveCircleRect(nx, ny, c.def.radius, ob);
        if (res) {
          nx = res.x;
          ny = res.y;
        }
      }
      c.x = clamp(nx, c.def.radius, W - c.def.radius);
      c.y = clamp(ny, c.def.radius, H - c.def.radius);
    }
    this.separate();

    // 3) Actions.
    for (const c of this.combatants) {
      if (!c.alive) continue;
      const inp = inputs.get(c.id)!;
      if (this.ball.carrierId === c.id) {
        if (inp.attackReleased) this.kickBall(c);
        if (inp.ultimate && c.ultReady) this.fireUlt(c);
      } else {
        const wants = c.def.attack.kind === 'potion' ? inp.attackReleased : inp.attack;
        if (wants && c.reloadTimer <= 0) this.fireAttack(c);
        if (inp.ultimate && c.ultReady) this.fireUlt(c);
      }
    }

    // 4) Timers, projectiles, zones, poison, régén, morts.
    for (const c of this.combatants) if (c.alive) c.tickTimers(dtMs);
    this.updateProjectiles(dtSec);
    this.updateHazards(dtSec, dtMs);
    for (const c of this.combatants) if (c.alive) c.tickPoison(dtMs);
    for (const c of this.combatants) if (c.alive) c.regenerate(dtMs);
    for (const c of this.combatants) {
      if (c.alive) continue;
      if (this.isBR) {
        if (!c.eliminated) this.handleDeath(c);
      } else if (c.respawnMs <= 0) {
        this.handleDeath(c);
      }
    }
  }

  private separate(): void {
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
          a.x = clamp(a.x - nx * push, a.def.radius, W - a.def.radius);
          a.y = clamp(a.y - ny * push, a.def.radius, H - a.def.radius);
          b.x = clamp(b.x + nx * push, b.def.radius, W - b.def.radius);
          b.y = clamp(b.y + ny * push, b.def.radius, H - b.def.radius);
        }
      }
    }
  }

  // ---------- Balle ----------

  private kickBall(c: SimCombatant): void {
    this.ball.kick(c.id, c.aimAngle, BALL.kickSpeed);
    c.noteAttack();
    this.fx.push({ k: 'kick', x: this.ball.x, y: this.ball.y });
  }

  private updateBall(dtSec: number, dtMs: number): void {
    if (!this.ball.free) {
      const carrier = this.combatants.find((c) => c.id === this.ball.carrierId);
      if (carrier && carrier.alive) this.ball.attachTo(carrier.x, carrier.y, carrier.aimAngle, carrier.def.radius);
      else this.ball.carrierId = null;
    }
    this.ball.update(dtSec, dtMs);

    if (this.ball.free && this.ball.graceMs <= 0) {
      let best: SimCombatant | null = null;
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

    if (pointInRect(this.ball.x, this.ball.y, PITCH_NYXT.leftGoal.zone)) this.onGoal(1);
    else if (pointInRect(this.ball.x, this.ball.y, PITCH_NYXT.rightGoal.zone)) this.onGoal(0);
  }

  private onGoal(team: number): void {
    this.score[team] += 1;
    this.ball.carrierId = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.fx.push({ k: 'goal', x: this.ball.x, y: this.ball.y, t: team });
    if (this.score[team] >= SOCCER.goalsToWin || this.sudden) {
      this.endMatch(team);
      return;
    }
    this.phase = 'goal';
    this.timer = SOCCER.goalCelebrateMs;
  }

  // ---------- Combat ----------

  private teamOf(id: string): number {
    return this.combatants.find((c) => c.id === id)?.team ?? -1;
  }

  private fireAttack(c: SimCombatant): void {
    const a = c.def.attack;
    if (a.kind === 'chain') {
      this.fireChain(c);
      c.reloadTimer = a.reloadMs;
      c.noteAttack();
      return;
    }
    if (a.kind === 'potion') {
      const dx = Math.cos(c.aimAngle);
      const dy = Math.sin(c.aimAngle);
      const range = a.range;
      const throwDist = c.aimDist > 40 ? clamp(c.aimDist, 90, range) : range;
      const muzzle = c.def.radius + 6;
      const p = new SimProjectile(c.id, c.x + dx * muzzle, c.y + dy * muzzle, dx * a.speed, dy * a.speed, 0, a.projRadius, throwDist, c.def.color);
      p.landsInto = { radius: a.aoeRadius ?? 80, durationMs: a.aoeDurationMs ?? 2500, dps: (a.aoeDps ?? 120) * c.damageMult };
      this.projectiles.push(p);
    } else {
      const spread = (a.spreadDeg * Math.PI) / 180;
      const dmg = a.damage * c.damageMult;
      const muzzle = c.def.radius + 6;
      for (let i = 0; i < a.count; i++) {
        const t = a.count === 1 ? 0 : i / (a.count - 1) - 0.5;
        const ang = c.aimAngle + t * spread;
        const dx = Math.cos(ang);
        const dy = Math.sin(ang);
        this.projectiles.push(new SimProjectile(c.id, c.x + dx * muzzle, c.y + dy * muzzle, dx * a.speed, dy * a.speed, dmg, a.projRadius, a.range, c.def.color));
      }
    }
    c.reloadTimer = a.reloadMs;
    c.noteAttack();
  }

  /** Éclair en chaîne (serveur) : dégâts + segments d'éclair diffusés en fx. */
  private fireChain(c: SimCombatant): void {
    const a = c.def.attack;
    const enemies = this.combatants.filter((o) => o.alive && o.team !== c.team);
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
      this.fx.push({ k: 'bolt', x: px, y: py, x2: e.x, y2: e.y, c: c.def.color });
      this.fx.push({ k: 'hit', x: e.x, y: e.y, c: c.def.color });
      px = e.x;
      py = e.y;
      dmg *= a.chainFalloff ?? 0.7;
    }
  }

  /** Surcharge (serveur) : méga-chaîne, gros dégâts + étourdit (ralentit). */
  private fireUltChain(c: SimCombatant): void {
    const u = c.def.ultimate;
    const enemies = this.combatants.filter((o) => o.alive && o.team !== c.team);
    const idx = resolveChain(
      c.x,
      c.y,
      enemies.map((e) => ({ x: e.x, y: e.y, radius: e.def.radius })),
      u.radius,
      u.chainJumpRange ?? 300,
      u.chainMaxJumps ?? 5,
    );
    let dmg = u.damage * c.damageMult;
    this.fx.push({ k: 'ult', x: c.x, y: c.y, r: 90, c: c.def.color });
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
      this.fx.push({ k: 'bolt', x: px, y: py, x2: e.x, y2: e.y, c: c.def.color });
      this.fx.push({ k: 'hit', x: e.x, y: e.y, c: c.def.color });
      px = e.x;
      py = e.y;
      dmg *= u.chainFalloff ?? 1; // −25 % par cible suivante
    }
  }

  private updateProjectiles(dtSec: number): void {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      p.update(dtSec);
      const isPotion = p.landsInto !== null;
      const ownerTeam = this.teamOf(p.ownerId);

      let landed = !p.alive;
      if (p.x < 0 || p.y < 0 || p.x > W || p.y > H) {
        p.kill();
        landed = true;
      } else {
        for (const ob of OBS) {
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
        if (landed) this.spawnPuddle(p);
        continue;
      }

      if (!p.alive) continue;
      for (const c of this.combatants) {
        if (!c.alive || c.team === ownerTeam) continue;
        if (dist(p.x, p.y, c.x, c.y) <= p.radius + c.def.radius) {
          const dealt = c.takeDamage(p.damage);
          const owner = this.combatants.find((o) => o.id === p.ownerId);
          if (owner && owner.alive) owner.addUltCharge(dealt);
          this.fx.push({ k: 'hit', x: p.x, y: p.y, c: c.def.color });
          p.kill();
          break;
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.alive);
  }

  private spawnPuddle(p: SimProjectile): void {
    const info = p.landsInto;
    if (!info) return;
    const h = new SimHazard(p.x, p.y, info.radius, p.ownerId, info.durationMs, info.dps, COLORS.poison);
    h.chargesUlt = true;
    this.hazards.push(h);
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
    this.hazards = this.hazards.filter((h) => h.alive);
  }

  private fireUlt(c: SimCombatant): void {
    const u = c.def.ultimate;
    if (u.kind === 'aura') {
      this.fx.push({ k: 'ult', x: c.x, y: c.y, r: u.radius, c: COLORS.poison });
      const h = new SimHazard(c.x, c.y, u.radius, c.id, u.auraDurationMs ?? 4000, 0, COLORS.poison);
      h.slowFactor = u.slowFactor;
      h.slowMs = u.slowMs;
      h.poisonMs = u.poisonMs ?? 2500;
      h.poisonDps = (u.poisonDps ?? 100) * c.damageMult;
      this.hazards.push(h);
    } else if (u.kind === 'chain') {
      this.fireUltChain(c);
    } else {
      const dmg = u.damage * c.damageMult;
      this.fx.push({ k: 'ult', x: c.x, y: c.y, r: u.radius, c: c.def.color });
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

  private handleDeath(c: SimCombatant): void {
    this.fx.push({ k: 'death', x: c.x, y: c.y, c: c.def.color });
    if (this.isBR) {
      c.eliminated = true; // pas de réapparition en Battle Royale
      return;
    }
    if (this.ball.carrierId === c.id) this.ball.drop(PITCH_NYXT.centerX - c.x, PITCH_NYXT.centerY - c.y);
    c.respawnMs = SOCCER.respawnMs;
  }

  // ---------- Snapshot ----------

  snapshot(): MatchSnapshot {
    const players: SnapPlayer[] = this.combatants.map((c) => ({
      i: c.id,
      n: c.name,
      t: c.team,
      z: c.zarekId,
      x: Math.round(c.x),
      y: Math.round(c.y),
      a: Math.round(c.aimAngle * 100) / 100,
      h: Math.round(c.health),
      hm: c.maxHealth,
      al: c.alive,
      uc: Math.round(c.ultCharge),
      carry: this.ball.carrierId === c.id,
      bot: c.isBot,
      rs: Math.max(0, Math.round(c.respawnMs)),
      cb: c.cubes,
    }));
    const snap: MatchSnapshot = {
      phase: this.phase,
      timer: Math.max(0, Math.round(this.phase === 'playing' ? this.matchClock : this.timer)),
      score: [this.score[0], this.score[1]],
      sudden: this.sudden,
      winner: this.winner,
      players,
      ball: { x: Math.round(this.ball.x), y: Math.round(this.ball.y), carrier: this.ball.carrierId },
      proj: this.projectiles.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y), r: p.radius, c: p.color })),
      haz: this.hazards.map((h) => ({ x: Math.round(h.x), y: Math.round(h.y), r: h.radius, c: h.color })),
      fx: this.fx,
      mode: this.mode,
    };
    if (this.isBR) {
      snap.zone = { x: ZONE_CENTER.x, y: ZONE_CENTER.y, r: Math.round(this.zoneRadius) };
      snap.cubes = this.cubesArr.filter((q) => q.alive).map((q) => ({ x: Math.round(q.x), y: Math.round(q.y), r: POWER_CUBE.radius, c: COLORS.powerCube }));
      snap.alive = this.combatants.filter((c) => c.alive).length;
    }
    return snap;
  }
}
