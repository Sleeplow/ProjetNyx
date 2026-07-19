import { emptyInput, type InputState, type Rect } from '../core/types';

/** Vue structurelle d'un combattant pour l'IA de Battle Royale. */
interface BattleActor {
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
 * IA de Battle Royale (chacun pour soi), pure et sans Phaser. Priorités :
 * rester en sécurité (zone OU refuge via portail vert) > fuir à bas PV en tirant
 * > traquer l'ennemi le plus proche (approche puis kite) > ramasser un cube.
 */
export class BattleBot {
  // Point d'errance mémorisé (rafraîchi périodiquement, pas chaque frame).
  private wx = 0;
  private wy = 0;
  private wanderMs = 0;
  private seeded = false;

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
    const lowHp = self.healthRatio < 0.3;

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
      move(self.x - foe.x, self.y - foe.y); // fuir
      if (fd < range) shootAt(foe);
    } else if (foe) {
      if (fd > range * 0.85) move(foe.x - self.x, foe.y - self.y); // approcher
      else if (fd < range * 0.4) move(self.x - foe.x, self.y - foe.y); // kite
      if (fd < range) shootAt(foe);
    } else {
      // Pas d'ennemi : ramasser le cube le plus proche, sinon rejoindre le point sûr.
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
      if (cube) move(cube.x - self.x, cube.y - self.y);
      else if (Math.hypot(this.wx - self.x, this.wy - self.y) > 80) move(this.wx - self.x, this.wy - self.y);
    }

    return inp;
  }
}
