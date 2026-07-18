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

  /**
   * Place la balle devant un porteur (appelé chaque frame par la scène).
   * Placement « balayé » : on avance depuis le porteur et on s'arrête AVANT le
   * premier mur — la balle portée ne peut donc jamais traverser un obstacle
   * (ni servir à marquer au travers).
   */
  attachTo(px: number, py: number, aimAngle: number, carrierRadius: number, obstacles: Rect[]): void {
    const maxD = carrierRadius + this.radius + BALL.carryOffset;
    const dx = Math.cos(aimAngle);
    const dy = Math.sin(aimAngle);
    let placedX = px;
    let placedY = py;
    for (let t = 6; t <= maxD; t += 6) {
      const cx = px + dx * t;
      const cy = py + dy * t;
      if (obstacles.some((o) => circleHitsRect(cx, cy, this.radius, o))) break;
      placedX = cx;
      placedY = cy;
    }
    this.x = placedX;
    this.y = placedY;
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

    // Déplacement SOUS-ÉCHANTILLONNÉ : un tir rapide (~1050 px/s) parcourt ~52 px
    // sur une frame de 50 ms, soit plus qu'un mur (44 px) — un seul pas le ferait
    // « sauter » par-dessus (tunneling). On découpe en pas ≤ 16 px (< épaisseur
    // d'un mur) : la balle chevauche donc toujours l'obstacle et rebondit bien.
    const dist = Math.hypot(this.vx, this.vy) * dtSec;
    const steps = Math.max(1, Math.ceil(dist / (this.radius * 0.8)));
    const sdt = dtSec / steps;
    for (let k = 0; k < steps; k++) {
      this.x += this.vx * sdt;
      this.y += this.vy * sdt;
      for (const ob of obstacles) {
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
      // Bornes extérieures du terrain (le centre peut atteindre les buts).
      this.x = clamp(this.x, this.radius, width - this.radius);
      this.y = clamp(this.y, this.radius, height - this.radius);
    }

    const decay = Math.exp(-BALL.friction * dtSec);
    this.vx *= decay;
    this.vy *= decay;
    if (Math.hypot(this.vx, this.vy) < BALL.stopSpeed) {
      this.vx = 0;
      this.vy = 0;
    }
  }

  syncDisplay(): void {
    this.container.setPosition(this.x, this.y);
  }

  destroy(): void {
    this.container.destroy();
  }
}
