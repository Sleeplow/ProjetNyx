import Phaser from 'phaser';

/**
 * Un projectile d'attaque de base. État minimal + un cercle de rendu.
 * La détection de collision est faite par la scène de jeu.
 */
export class Projectile {
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  /** Distance restante avant expiration (px). */
  distanceLeft: number;
  alive = true;

  private readonly sprite: Phaser.GameObjects.Arc;

  constructor(
    scene: Phaser.Scene,
    ownerId: string,
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    radius: number,
    range: number,
    color: number,
  ) {
    this.ownerId = ownerId;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.radius = radius;
    this.distanceLeft = range;
    this.sprite = scene.add.circle(x, y, radius, color).setStrokeStyle(2, 0xffffff, 0.7).setDepth(18);
  }

  update(dtSec: number): void {
    const stepX = this.vx * dtSec;
    const stepY = this.vy * dtSec;
    this.x += stepX;
    this.y += stepY;
    this.distanceLeft -= Math.hypot(stepX, stepY);
    if (this.distanceLeft <= 0) this.alive = false;
    this.sprite.setPosition(this.x, this.y);
  }

  kill(): void {
    this.alive = false;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
