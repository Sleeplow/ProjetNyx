import Phaser from 'phaser';

/**
 * Joystick virtuel flottant (style Brawl Stars mobile) : la base apparaît là où
 * le doigt se pose, le pouce suit dans un rayon max. Fixé à la caméra.
 */
export class Joystick {
  active = false;
  pointerId = -1;
  vecX = 0;
  vecY = 0;

  private readonly maxRadius: number;
  private baseX = 0;
  private baseY = 0;
  private readonly base: Phaser.GameObjects.Arc;
  private readonly thumb: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, color: number, maxRadius = 72) {
    this.maxRadius = maxRadius;
    this.base = scene.add
      .circle(0, 0, maxRadius, 0xffffff, 0.08)
      .setStrokeStyle(3, color, 0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);
    this.thumb = scene.add
      .circle(0, 0, maxRadius * 0.42, color, 0.35)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false);
  }

  /** Magnitude actuelle du stick (0 → 1). */
  get magnitude(): number {
    return Math.hypot(this.vecX, this.vecY);
  }

  engage(pointerId: number, x: number, y: number): void {
    this.active = true;
    this.pointerId = pointerId;
    this.baseX = x;
    this.baseY = y;
    this.vecX = 0;
    this.vecY = 0;
    this.base.setPosition(x, y).setVisible(true);
    this.thumb.setPosition(x, y).setVisible(true);
  }

  move(x: number, y: number): void {
    if (!this.active) return;
    let dx = x - this.baseX;
    let dy = y - this.baseY;
    const l = Math.hypot(dx, dy);
    if (l > this.maxRadius) {
      dx = (dx / l) * this.maxRadius;
      dy = (dy / l) * this.maxRadius;
    }
    this.thumb.setPosition(this.baseX + dx, this.baseY + dy);
    this.vecX = dx / this.maxRadius;
    this.vecY = dy / this.maxRadius;
  }

  release(): void {
    this.active = false;
    this.pointerId = -1;
    this.vecX = 0;
    this.vecY = 0;
    this.base.setVisible(false);
    this.thumb.setVisible(false);
  }
}
