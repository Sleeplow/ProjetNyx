import Phaser from 'phaser';
import type { Rect } from './types';
import { BALL } from '../config/soccer';
import { COLORS } from '../config/constants';
import { clamp, resolveCircleRect, circleHitsRect, normalize } from './geometry';

/**
 * La balle de foot. État de simulation (position, vitesse, porteur) + rendu.
 *
 * Libre, elle roule avec du frottement et rebondit sur les murs. Portée, elle
 * est placée par la scène juste devant son porteur. On la « shoote » en la
 * relâchant dans la direction visée.
 */
export class Ball {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  readonly radius = BALL.radius;

  /** Id du porteur, ou null si la balle est libre. */
  carrierId: string | null = null;
  /** Personne ne peut ramasser tant que ce délai n'est pas écoulé (ms). */
  graceMs = 0;
  /** Le dernier tireur ne peut pas reprendre tant que ce délai court (ms). */
  kickerLockMs = 0;
  kickerId: string | null = null;

  private readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    const body = scene.add.circle(0, 0, this.radius, COLORS.white).setStrokeStyle(3, 0x1a1a2e, 1);
    const dot = scene.add.circle(0, 0, this.radius * 0.34, 0x1a1a2e, 0.9);
    const spot1 = scene.add.circle(this.radius * 0.55, -this.radius * 0.35, this.radius * 0.2, 0x1a1a2e, 0.75);
    const spot2 = scene.add.circle(-this.radius * 0.55, this.radius * 0.4, this.radius * 0.2, 0x1a1a2e, 0.75);
    this.container = scene.add.container(x, y, [body, dot, spot1, spot2]).setDepth(14);
  }

  get free(): boolean {
    return this.carrierId === null;
  }

  /** Place la balle devant un porteur (appelé chaque frame par la scène). */
  attachTo(px: number, py: number, aimAngle: number, carrierRadius: number): void {
    const d = carrierRadius + this.radius + BALL.carryOffset;
    this.x = px + Math.cos(aimAngle) * d;
    this.y = py + Math.sin(aimAngle) * d;
    this.vx = 0;
    this.vy = 0;
  }

  /** Envoie la balle dans une direction (tir/passe). */
  kick(fromId: string, angle: number, speed: number): void {
    this.carrierId = null;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.graceMs = BALL.grabGraceMs;
    this.kickerLockMs = BALL.kickerLockMs;
    this.kickerId = fromId;
  }

  /** Lâche la balle sur place (porteur éliminé) avec une petite impulsion. */
  drop(dirX: number, dirY: number): void {
    const n = normalize(dirX, dirY);
    this.carrierId = null;
    this.kickerId = null;
    this.vx = n.x * 160;
    this.vy = n.y * 160;
    this.graceMs = BALL.grabGraceMs;
    this.kickerLockMs = 0;
  }

  /** Physique de la balle libre : intégration, frottement, rebonds, bornes. */
  update(dtSec: number, dtMs: number, obstacles: Rect[], width: number, height: number): void {
    if (this.graceMs > 0) this.graceMs = Math.max(0, this.graceMs - dtMs);
    if (this.kickerLockMs > 0) this.kickerLockMs = Math.max(0, this.kickerLockMs - dtMs);
    if (!this.free) return;

    this.x += this.vx * dtSec;
    this.y += this.vy * dtSec;

    const decay = Math.exp(-BALL.friction * dtSec);
    this.vx *= decay;
    this.vy *= decay;
    if (Math.hypot(this.vx, this.vy) < BALL.stopSpeed) {
      this.vx = 0;
      this.vy = 0;
    }

    // Rebonds sur les murs et obstacles.
    for (const ob of obstacles) {
      if (!circleHitsRect(this.x, this.y, this.radius, ob)) continue;
      const res = resolveCircleRect(this.x, this.y, this.radius, ob);
      if (!res) continue;
      const nx = res.x - this.x;
      const ny = res.y - this.y;
      const n = normalize(nx, ny);
      this.x = res.x;
      this.y = res.y;
      const dot = this.vx * n.x + this.vy * n.y;
      if (dot < 0) {
        this.vx -= (1 + BALL.restitution) * dot * n.x;
        this.vy -= (1 + BALL.restitution) * dot * n.y;
      }
    }

    // Bornes extérieures du terrain (le centre peut atteindre les buts).
    this.x = clamp(this.x, this.radius, width - this.radius);
    this.y = clamp(this.y, this.radius, height - this.radius);
  }

  syncDisplay(): void {
    this.container.setPosition(this.x, this.y);
  }

  destroy(): void {
    this.container.destroy();
  }
}
