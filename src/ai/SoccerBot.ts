import type { Combatant } from '../core/Combatant';
import type { InputState, Rect } from '../core/types';
import { emptyInput } from '../core/types';
import { AI } from '../config/constants';
import { SOCCER } from '../config/soccer';
import { dist, normalize, circleHitsRect } from '../core/geometry';

/** Ce que l'IA foot doit connaître de la scène, fourni chaque frame. */
export interface SoccerWorld {
  all: Combatant[];
  ball: { x: number; y: number; carrierId: string | null; free: boolean };
  /** Centres des deux buts : [gauche, droite]. */
  leftGoal: { x: number; y: number };
  rightGoal: { x: number; y: number };
  /** Murs et blocs, pour l'évitement d'obstacles. */
  obstacles: Rect[];
  width: number;
  height: number;
  /** Le jeu est en pause (engagement / célébration de but). */
  frozen: boolean;
}

/**
 * IA d'un joueur de foot NPC. Comme les autres contrôleurs, elle ne fait que
 * produire un `InputState`. Elle raisonne « objectif balle » pour le
 * déplacement, tout en gardant le combat (tir sur l'ennemi proche) en parallèle
 * puisque la visée et le déplacement sont indépendants (twin-stick).
 */
export class SoccerBot {
  private rethink = 0;
  private readonly role: 'forward' | 'mid' | 'defender';

  constructor(role: 'forward' | 'mid' | 'defender') {
    this.role = role;
  }

  update(self: Combatant, world: SoccerWorld, dtMs: number): InputState {
    const input = emptyInput();
    if (!self.alive || world.frozen) return input;

    this.rethink -= dtMs;
    if (this.rethink <= 0) this.rethink = AI.rethinkMs;

    const enemyGoal = self.team === 0 ? world.rightGoal : world.leftGoal;
    const ownGoal = self.team === 0 ? world.leftGoal : world.rightGoal;
    const ball = world.ball;
    const iCarry = ball.carrierId === self.id;

    let moveX = 0;
    let moveY = 0;
    let aimX = Math.cos(self.aimAngle);
    let aimY = Math.sin(self.aimAngle);

    if (iCarry) {
      // Je porte la balle : je fonce vers le but adverse et je tire à portée.
      const toGoal = normalize(enemyGoal.x - self.x, enemyGoal.y - self.y);
      moveX = toGoal.x;
      moveY = toGoal.y;
      aimX = toGoal.x;
      aimY = toGoal.y;
      const dGoal = dist(self.x, self.y, enemyGoal.x, enemyGoal.y);
      const pressed = this.nearestEnemy(self, world, 96) !== null;
      if (dGoal <= SOCCER.botShootRange || pressed) {
        // Frappe au but (ou dégagement sous la pression).
        input.attack = true;
        input.attackReleased = true;
      }
    } else {
      const carrier = ball.carrierId ? world.all.find((c) => c.id === ball.carrierId) : undefined;
      const target = this.movementTarget(self, world, ball, carrier, enemyGoal, ownGoal);
      const to = normalize(target.x - self.x, target.y - self.y);
      moveX = to.x;
      moveY = to.y;

      // Combat en parallèle : viser/tirer l'ennemi proche (sauf potion → relâche).
      const foe = this.nearestEnemy(self, world, self.def.attack.range * 1.05);
      if (foe) {
        const d = dist(self.x, self.y, foe.x, foe.y);
        if (self.def.attack.kind === 'potion') {
          aimX = foe.x - self.x;
          aimY = foe.y - self.y;
          input.attackReleased = d <= self.def.attack.range;
          input.attack = input.attackReleased;
        } else {
          const n = normalize(foe.x - self.x, foe.y - self.y);
          aimX = n.x;
          aimY = n.y;
          input.attack = d <= self.def.attack.range;
        }
        input.ultimate = self.ultReady && d <= AI.ultUseRange;
      } else {
        aimX = to.x || aimX;
        aimY = to.y || aimY;
      }
    }

    // Évitement d'obstacles : sans ça, le bot pousse tout droit dans un mur et
    // reste coincé. On dévie le déplacement pour contourner (la visée/tir garde
    // sa direction, indépendante).
    const av = this.avoid(self, moveX, moveY, world.obstacles);
    input.moveX = av.x;
    input.moveY = av.y;
    input.aimX = aimX;
    input.aimY = aimY;
    return input;
  }

  /**
   * Steering par « whiskers » : on sonde devant soi ; si c'est bloqué, on
   * essaie des directions de plus en plus déviées (gauche/droite) et on prend
   * la première dégagée. Le bot longe le mur au lieu de s'y écraser.
   */
  private avoid(self: Combatant, mx: number, my: number, obstacles: Rect[]): { x: number; y: number } {
    if (mx === 0 && my === 0) return { x: 0, y: 0 };
    const base = Math.atan2(my, mx);
    const probe = self.def.radius + 46;
    const offsets = [0, 0.45, -0.45, 0.9, -0.9, 1.4, -1.4, 1.9, -1.9];
    for (const off of offsets) {
      const a = base + off;
      const px = self.x + Math.cos(a) * probe;
      const py = self.y + Math.sin(a) * probe;
      if (!obstacles.some((o) => circleHitsRect(px, py, self.def.radius, o))) {
        return { x: Math.cos(a), y: Math.sin(a) };
      }
    }
    return { x: mx, y: my };
  }

  /** Où se déplacer quand je ne porte pas la balle, selon la situation et mon rôle. */
  private movementTarget(
    self: Combatant,
    world: SoccerWorld,
    ball: SoccerWorld['ball'],
    carrier: Combatant | undefined,
    enemyGoal: { x: number; y: number },
    ownGoal: { x: number; y: number },
  ): { x: number; y: number } {
    if (ball.free) {
      // Le plus proche de mon équipe va à la balle ; les autres se placent.
      if (this.amClosestOnTeam(self, world, ball.x, ball.y)) return { x: ball.x, y: ball.y };
      return this.supportPoint(self, world, ball, enemyGoal, ownGoal);
    }
    if (carrier && carrier.team === self.team) {
      // Un allié porte : on avance pour soutenir / offrir une passe.
      return this.supportPoint(self, world, ball, enemyGoal, ownGoal);
    }
    if (carrier) {
      // Un ennemi porte : on l'intercepte (on se met entre lui et notre but).
      if (this.role === 'defender' || this.amClosestOnTeam(self, world, carrier.x, carrier.y)) {
        return { x: carrier.x, y: carrier.y };
      }
      return this.supportPoint(self, world, ball, enemyGoal, ownGoal);
    }
    return { x: ball.x, y: ball.y };
  }

  /** Point de placement quand on ne va pas directement à la balle. */
  private supportPoint(
    self: Combatant,
    world: SoccerWorld,
    ball: SoccerWorld['ball'],
    enemyGoal: { x: number; y: number },
    ownGoal: { x: number; y: number },
  ): { x: number; y: number } {
    const lane = self.team === 0 ? 1 : -1; // sens de l'attaque (droite/gauche)
    if (this.role === 'defender') {
      // Reste entre la balle et notre but.
      return { x: (ownGoal.x + ball.x) / 2, y: (ownGoal.y + ball.y) / 2 };
    }
    if (this.role === 'forward') {
      // Se poste en pointe, un peu en avant de la balle, décalé.
      const spread = self.id.charCodeAt(self.id.length - 1) % 2 === 0 ? -180 : 180;
      return { x: enemyGoal.x - lane * 220, y: world.height / 2 + spread };
    }
    // Milieu : accompagne la balle en restant légèrement en avant.
    return { x: ball.x + lane * 120, y: ball.y };
  }

  private amClosestOnTeam(self: Combatant, world: SoccerWorld, x: number, y: number): boolean {
    const my = dist(self.x, self.y, x, y);
    for (const c of world.all) {
      if (c.id === self.id || c.team !== self.team || !c.alive) continue;
      const d = dist(c.x, c.y, x, y);
      if (d < my || (d === my && c.id < self.id)) return false;
    }
    return true;
  }

  private nearestEnemy(self: Combatant, world: SoccerWorld, maxRange: number): Combatant | null {
    let best: Combatant | null = null;
    let bestD = maxRange;
    for (const c of world.all) {
      if (c.team === self.team || !c.alive) continue;
      const d = dist(self.x, self.y, c.x, c.y);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best;
  }
}
