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

export interface BattleWorld {
  all: BattleActor[];
  cubes: CubeView[];
  zone: { x: number; y: number; r: number };
  obstacles: Rect[];
  width: number;
  height: number;
}

function norm(x: number, y: number): { x: number; y: number } {
  const d = Math.hypot(x, y);
  return d < 1e-4 ? { x: 0, y: 0 } : { x: x / d, y: y / d };
}

/**
 * IA de Battle Royale (chacun pour soi), pure et sans Phaser. Priorités :
 * rester dans la zone > fuir à bas PV en tirant > traquer l'ennemi le plus
 * proche (approche puis kite) > ramasser un cube s'il n'y a pas d'ennemi.
 */
export class BattleBot {
  update(self: BattleActor, world: BattleWorld, _dtMs: number): InputState {
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

    const cx = world.zone.x;
    const cy = world.zone.y;
    const distZone = Math.hypot(self.x - cx, self.y - cy);
    const outside = distZone > world.zone.r - 50;
    const lowHp = self.healthRatio < 0.3;
    const range = self.def.attack.range;

    const move = (dx: number, dy: number) => {
      const n = norm(dx, dy);
      inp.moveX = n.x;
      inp.moveY = n.y;
    };
    const shootAt = (t: BattleActor) => {
      inp.aimX = t.x - self.x;
      inp.aimY = t.y - self.y;
      inp.attack = true;
      inp.attackReleased = true; // permet aussi les attaques « relâchées » (potion)
      if (self.ultReady) inp.ultimate = true;
    };

    if (outside) {
      move(cx - self.x, cy - self.y); // revenir dans la zone
      if (foe && fd < range) shootAt(foe);
    } else if (lowHp && foe) {
      move(self.x - foe.x, self.y - foe.y); // fuir
      if (fd < range) shootAt(foe);
    } else if (foe) {
      if (fd > range * 0.85) move(foe.x - self.x, foe.y - self.y); // approcher
      else if (fd < range * 0.4) move(self.x - foe.x, self.y - foe.y); // kite
      if (fd < range) shootAt(foe);
    } else {
      // Pas d'ennemi : ramasser le cube le plus proche, sinon rester au centre.
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
      else if (distZone > 80) move(cx - self.x, cy - self.y);
    }

    return inp;
  }
}
