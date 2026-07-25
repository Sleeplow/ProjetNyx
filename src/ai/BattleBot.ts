import { emptyInput, type InputState, type Rect } from '../core/types';

/** Vue structurelle d'un combattant pour l'IA de Battle Royale. */
export interface BattleActor {
  id: string;
  x: number;
  y: number;
  team: number;
  alive: boolean;
  aimAngle: number;
  ultReady: boolean;
  healthRatio: number;
  def: { radius: number; moveSpeed: number; attack: { range: number } };
}

interface CubeView {
  x: number;
  y: number;
  alive: boolean;
}

/**
 * Stratégie de « danger » alternative à la zone (tableau Portal) : l'IA fuit la
 * neurotoxine vers un portail vert / le refuge au lieu de rentrer dans un cercle.
 */
export interface DangerView {
  inDanger: (x: number, y: number) => boolean;
  retreat: (x: number, y: number) => { x: number; y: number } | null;
  wander: (x: number, y: number) => { x: number; y: number };
}

export interface BattleWorld {
  all: BattleActor[];
  cubes: CubeView[];
  zone: { x: number; y: number; r: number };
  obstacles: Rect[];
  width: number;
  height: number;
  /** Portal : remplace la logique de zone par une fuite vers les portails. */
  danger?: DangerView;
}

function norm(x: number, y: number): { x: number; y: number } {
  const d = Math.hypot(x, y);
  return d < 1e-4 ? { x: 0, y: 0 } : { x: x / d, y: y / d };
}

/**
 * Un « caractère » de bot : chaque bot en tire un au hasard à sa création, ce qui
 * donne des comportements VARIÉS et casse l'effet « deux bots identiques figés
 * face à face à se mitrailler » (stalemate en miroir).
 *
 * - `preferredRange` : distance de combat visée, en fraction de la portée d'arme.
 *   Deux bots aux distances préférées différentes ne se stabilisent jamais : l'un
 *   pourchasse, l'autre kite → duel dynamique.
 * - `strafe` : poids du déplacement LATÉRAL (tourner autour de l'ennemi) — même à
 *   la bonne distance, le bot bouge au lieu de rester planté.
 * - `jitter` : bruit de déplacement (organique, rafraîchi périodiquement).
 * - `fleeHp` : seuil de PV sous lequel il prend la fuite.
 * - `cubeGreed` : appétit pour aller chercher un cube de puissance (même en combat).
 */
interface Personality {
  name: string;
  preferredRange: number;
  strafe: number;
  jitter: number;
  fleeHp: number;
  cubeGreed: number;
}

const PERSONALITIES: Personality[] = [
  { name: 'brawler', preferredRange: 0.45, strafe: 0.3, jitter: 0.15, fleeHp: 0.18, cubeGreed: 0.5 },
  { name: 'sniper', preferredRange: 0.9, strafe: 0.6, jitter: 0.2, fleeHp: 0.35, cubeGreed: 0.4 },
  { name: 'trickster', preferredRange: 0.65, strafe: 0.95, jitter: 0.35, fleeHp: 0.28, cubeGreed: 0.5 },
  { name: 'farmer', preferredRange: 0.75, strafe: 0.4, jitter: 0.25, fleeHp: 0.4, cubeGreed: 0.95 },
  { name: 'coward', preferredRange: 0.95, strafe: 0.7, jitter: 0.3, fleeHp: 0.5, cubeGreed: 0.6 },
];

/**
 * IA de Battle Royale (chacun pour soi), pure et sans Phaser. Priorités :
 * rester en sécurité (zone OU refuge via portail vert) > fuir à bas PV en tirant
 * > combattre l'ennemi le plus proche selon sa PERSONNALITÉ (distance préférée +
 * strafe + bruit), en RAMASSANT au passage un cube proche > sinon farmer / rôder.
 */
export class BattleBot {
  /** Caractère du bot (nom exposé pour le debug / les tests). */
  readonly personality: string;
  private readonly p: Personality;
  private readonly strafeSign: number; // +1 ou −1 : tourne dans un sens ou l'autre

  // Point d'errance mémorisé (rafraîchi périodiquement, pas chaque frame).
  private wx = 0;
  private wy = 0;
  private wanderMs = 0;
  private seeded = false;
  // Bruit de déplacement mémorisé (rafraîchi périodiquement pour rester organique).
  private jx = 0;
  private jy = 0;
  private jitterMs = 0;

  constructor(variant = Math.floor(Math.random() * PERSONALITIES.length)) {
    this.p = PERSONALITIES[((variant % PERSONALITIES.length) + PERSONALITIES.length) % PERSONALITIES.length];
    this.personality = this.p.name;
    this.strafeSign = Math.random() < 0.5 ? 1 : -1;
  }

  /** Cube vivant le plus proche + sa distance (Infinity si aucun). */
  private nearestCube(self: BattleActor, world: BattleWorld): { cube: CubeView | null; d: number } {
    let cube: CubeView | null = null;
    let cd = Infinity;
    for (const q of world.cubes) {
      if (!q.alive) continue;
      const d = Math.hypot(q.x - self.x, q.y - self.y);
      if (d < cd) {
        cd = d;
        cube = q;
      }
    }
    return { cube, d: cd };
  }

  update(self: BattleActor, world: BattleWorld, dtMs: number): InputState {
    const inp = emptyInput();
    inp.aimX = Math.cos(self.aimAngle);
    inp.aimY = Math.sin(self.aimAngle);

    // Ennemi le plus proche (autre équipe = tout le monde en FFA).
    let foe: BattleActor | null = null;
    let fd = Infinity;
    for (const o of world.all) {
      if (!o.alive || o.id === self.id || o.team === self.team) continue;
      const d = Math.hypot(o.x - self.x, o.y - self.y);
      if (d < fd) {
        fd = d;
        foe = o;
      }
    }

    const range = self.def.attack.range;
    const lowHp = self.healthRatio < this.p.fleeHp;

    // Bruit de déplacement, rafraîchi ~toutes les 500 ms (évite le twitch).
    this.jitterMs -= dtMs;
    if (this.jitterMs <= 0) {
      const a = Math.random() * Math.PI * 2;
      this.jx = Math.cos(a);
      this.jy = Math.sin(a);
      this.jitterMs = 500;
    }

    // Sécurité : zone qui rétrécit (classic) OU neurotoxine + portails (Portal).
    let outside = false;
    let retreat: { x: number; y: number } | null = null;
    if (world.danger) {
      if (world.danger.inDanger(self.x, self.y)) {
        retreat = world.danger.retreat(self.x, self.y);
        outside = retreat !== null; // « en danger » seulement si on a où fuir
      }
    } else {
      const distZone = Math.hypot(self.x - world.zone.x, self.y - world.zone.y);
      if (distZone > world.zone.r - 50) {
        outside = true;
        retreat = { x: world.zone.x, y: world.zone.y };
      }
    }

    // Point d'errance mémorisé (évite le jitter quand danger.wander() est aléatoire).
    this.wanderMs -= dtMs;
    if (!this.seeded || this.wanderMs <= 0) {
      const w = world.danger ? world.danger.wander(self.x, self.y) : { x: world.zone.x, y: world.zone.y };
      this.wx = w.x;
      this.wy = w.y;
      this.wanderMs = 1000;
      this.seeded = true;
    }

    const move = (dx: number, dy: number): void => {
      const n = norm(dx, dy);
      inp.moveX = n.x;
      inp.moveY = n.y;
    };
    const shootAt = (t: BattleActor): void => {
      inp.aimX = t.x - self.x;
      inp.aimY = t.y - self.y;
      inp.attack = true;
      inp.attackReleased = true; // permet aussi les attaques « relâchées » (potion)
      if (self.ultReady) inp.ultimate = true;
    };

    if (outside && retreat) {
      move(retreat.x - self.x, retreat.y - self.y); // fuir vers la sécurité (le tir reste actif)
      if (foe && fd < range) shootAt(foe);
    } else if (lowHp && foe) {
      // Fuite en tirant : on s'éloigne, avec un peu de latéral pour ne pas être une cible droite.
      const away = norm(self.x - foe.x, self.y - foe.y);
      const perp = { x: -away.y * this.strafeSign, y: away.x * this.strafeSign };
      move(away.x + perp.x * 0.4 + this.jx * this.p.jitter, away.y + perp.y * 0.4 + this.jy * this.p.jitter);
      if (fd < range) shootAt(foe);
    } else if (foe) {
      // Combat selon la personnalité : viser la distance préférée + tourner autour.
      const want = range * this.p.preferredRange;
      const margin = range * 0.12;
      const toFoe = norm(foe.x - self.x, foe.y - self.y);
      let radial = 0;
      if (fd > want + margin) radial = 1; // se rapprocher jusqu'à la distance voulue
      else if (fd < want - margin) radial = -1; // trop près : reculer
      // Strafe : perpendiculaire à l'ennemi, dans le sens propre au bot.
      const perp = { x: -toFoe.y * this.strafeSign, y: toFoe.x * this.strafeSign };
      let mx = toFoe.x * radial + perp.x * this.p.strafe + this.jx * this.p.jitter;
      let my = toFoe.y * radial + perp.y * this.p.strafe + this.jy * this.p.jitter;

      // OPPORTUNISME : un cube tout proche pendant le combat → on dévie pour le
      // ramasser (surtout les personnalités gourmandes). Fini de passer à côté
      // d'un diamant qui donnerait l'avantage sans le prendre. Le tir reste sur l'ennemi.
      const { cube, d: cd } = this.nearestCube(self, world);
      const oppReach = 90 + this.p.cubeGreed * 260; // 90..350 px selon l'appétit
      if (cube && cd < oppReach) {
        const toCube = norm(cube.x - self.x, cube.y - self.y);
        const pull = Math.max(0, 1 - cd / oppReach) * (0.7 + this.p.cubeGreed); // plus proche/gourmand = plus fort
        mx += toCube.x * pull;
        my += toCube.y * pull;
      }
      move(mx, my);
      if (fd < range) shootAt(foe);
    } else {
      // Pas d'ennemi : ramasser un cube (selon l'appétit), sinon rejoindre le point sûr.
      const { cube, d: cd } = this.nearestCube(self, world);
      // Un bot « farmer » va chercher un cube loin ; un « brawler » ne se détourne
      // que pour un cube proche.
      const cubeReach = 120 + this.p.cubeGreed * 700;
      if (cube && cd < cubeReach) {
        move(cube.x - self.x + this.jx * this.p.jitter, cube.y - self.y + this.jy * this.p.jitter);
      } else if (Math.hypot(this.wx - self.x, this.wy - self.y) > 80) {
        move(this.wx - self.x + this.jx * this.p.jitter * 40, this.wy - self.y + this.jy * this.p.jitter * 40);
      } else {
        // Déjà au point sûr : petite ronde aléatoire plutôt que l'immobilité.
        move(this.jx, this.jy);
      }
    }

    return inp;
  }
}
