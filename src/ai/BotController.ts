import type { Combatant } from '../core/Combatant';
import type { InputState } from '../core/types';
import { emptyInput } from '../core/types';
import { AI, BUSH } from '../config/constants';
import { dist, normalize } from '../core/geometry';

/** Ce dont l'IA a besoin pour décider (fourni par la scène chaque frame). */
export interface BotWorld {
  /** Tous les combattants vivants (self inclus). */
  all: Combatant[];
  /** Cubes de power-up disponibles sur la carte. */
  cubes: { x: number; y: number }[];
  zoneCenterX: number;
  zoneCenterY: number;
  zoneRadius: number;
}

/**
 * Contrôleur d'IA d'un NPC. Comme le contrôleur joueur, il ne fait que produire
 * un `InputState` : la simulation reste identique pour un humain ou un bot
 * (et, demain, pour un joueur distant).
 */
export class BotController {
  private rethink = 0;
  private targetId: string | null = null;
  private wanderX = 0;
  private wanderY = 0;
  private strafeSign = 1;
  private seeded = false;

  // Personnalité tirée au hasard à la création → chaque bot (et chaque manche)
  // joue différemment : certains collent l'adversaire, d'autres gardent leurs
  // distances et fuient plus tôt, et ne convoitent pas les cubes de la même façon.
  private readonly rangeMult: number; // distance de combat préférée (× portée d'attaque)
  private readonly fleeRatio: number; // seuil de PV en dessous duquel il fuit
  private readonly cubeReach: number; // distance max pour se détourner vers un cube

  constructor(_id: string) {
    const cautious = Math.random() < 0.5;
    this.rangeMult = cautious ? 0.62 + Math.random() * 0.33 : 0.4 + Math.random() * 0.22;
    this.fleeRatio = 0.2 + Math.random() * 0.25;
    this.cubeReach = 220 + Math.random() * 320;
    if (Math.random() < 0.5) this.strafeSign = -1;
  }

  private rand(): number {
    return Math.random();
  }

  update(self: Combatant, world: BotWorld, dtMs: number): InputState {
    const input = emptyInput();
    if (!self.alive) return input;

    if (!this.seeded) {
      this.wanderX = world.zoneCenterX;
      this.wanderY = world.zoneCenterY;
      this.seeded = true;
    }

    this.rethink -= dtMs;
    if (this.rethink <= 0) {
      this.rethink = AI.rethinkMs;
      this.chooseTarget(self, world);
      if (this.rand() < 0.3) this.strafeSign *= -1;
      this.pickWander(world);
    }

    const target = this.targetId ? world.all.find((c) => c.id === this.targetId && c.alive) : undefined;

    // 1) Sécurité de zone : si on est hors du cercle sûr, priorité = revenir au centre.
    const dCenter = dist(self.x, self.y, world.zoneCenterX, world.zoneCenterY);
    const safeR = Math.max(60, world.zoneRadius - AI.zoneSafetyMargin);
    const mustRetreat = dCenter > safeR;

    let moveX = 0;
    let moveY = 0;
    let aimX = Math.cos(self.aimAngle);
    let aimY = Math.sin(self.aimAngle);

    if (target) {
      const d = dist(self.x, self.y, target.x, target.y);
      const toT = normalize(target.x - self.x, target.y - self.y);
      if (self.def.attack.kind === 'potion') {
        // Vecteur NON normalisé → la potion atterrit à la distance de la cible.
        aimX = target.x - self.x;
        aimY = target.y - self.y;
      } else {
        aimX = toT.x;
        aimY = toT.y;
      }

      const isTank = self.def.role === 'tank';
      const preferred = self.def.attack.range * this.rangeMult;

      if (self.healthRatio < this.fleeRatio && !self.ultReady) {
        // Fuite : s'éloigner de la cible.
        moveX = -toT.x;
        moveY = -toT.y;
      } else if (d > preferred * 1.1) {
        moveX = toT.x;
        moveY = toT.y;
      } else if (d < preferred * 0.6 && !isTank) {
        moveX = -toT.x;
        moveY = -toT.y;
      } else {
        // Bonne distance : on tourne autour (strafe).
        moveX = -toT.y * this.strafeSign;
        moveY = toT.x * this.strafeSign;
      }

      input.attack = d <= self.def.attack.range;
      input.ultimate = self.ultReady && d <= AI.ultUseRange;
    } else {
      // Pas de cible : ramasser un cube proche, sinon errer.
      const cube = this.nearestCube(self, world);
      const tx = cube ? cube.x : this.wanderX;
      const ty = cube ? cube.y : this.wanderY;
      const to = normalize(tx - self.x, ty - self.y);
      moveX = to.x;
      moveY = to.y;
      aimX = to.x || aimX;
      aimY = to.y || aimY;
    }

    if (mustRetreat) {
      // On force le retour vers le centre (l'aim/tir reste inchangé).
      const toCenter = normalize(world.zoneCenterX - self.x, world.zoneCenterY - self.y);
      moveX = toCenter.x;
      moveY = toCenter.y;
    }

    input.moveX = moveX;
    input.moveY = moveY;
    input.aimX = aimX;
    input.aimY = aimY;
    return input;
  }

  private chooseTarget(self: Combatant, world: BotWorld): void {
    let best: Combatant | null = null;
    let bestD = Infinity;
    for (const c of world.all) {
      if (c === self || !c.alive) continue;
      const d = dist(self.x, self.y, c.x, c.y);
      if (d > AI.visionRange) continue;
      // Un ennemi caché dans un buisson n'est repéré que de près.
      if (c.inBush && d > BUSH.revealRange) continue;
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    this.targetId = best ? best.id : null;
  }

  private pickWander(world: BotWorld): void {
    const angle = this.rand() * Math.PI * 2;
    const r = this.rand() * world.zoneRadius * 0.6;
    this.wanderX = world.zoneCenterX + Math.cos(angle) * r;
    this.wanderY = world.zoneCenterY + Math.sin(angle) * r;
  }

  private nearestCube(self: Combatant, world: BotWorld): { x: number; y: number } | null {
    let best: { x: number; y: number } | null = null;
    let bestD = this.cubeReach; // ne se détourne que pour un cube assez proche
    for (const cube of world.cubes) {
      const d = dist(self.x, self.y, cube.x, cube.y);
      if (d < bestD) {
        bestD = d;
        best = cube;
      }
    }
    return best;
  }
}
