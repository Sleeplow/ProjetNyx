import Phaser from 'phaser';
import { COLORS, POWER_CUBE } from '../config/constants';

/** Un cube de power-up ramassable (bonus de PV max + dégâts). */
export class PowerCube {
  x: number;
  y: number;
  alive = true;
  /** Temps passé hors de la zone sûre (ms) — au-delà du seuil, le cube disparaît. */
  outsideMs = 0;
  private readonly sprite: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    const s = POWER_CUBE.radius * 2;
    this.sprite = scene.add
      .rectangle(x, y, s, s, COLORS.powerCube, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.8)
      .setAngle(45)
      .setDepth(10);
    // Petite pulsation pour attirer l'œil.
    scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  /** À appeler chaque frame où le cube est hors de la zone sûre. */
  tickOutside(dtMs: number): void {
    this.outsideMs += dtMs;
    // Clignotement d'avertissement dans la dernière seconde avant disparition.
    const remaining = POWER_CUBE.outsideDespawnMs - this.outsideMs;
    if (remaining < 1000) {
      this.sprite.setAlpha(0.25 + 0.6 * Math.abs(Math.sin(this.outsideMs / 70)));
    }
  }

  get expiredOutside(): boolean {
    return this.outsideMs >= POWER_CUBE.outsideDespawnMs;
  }

  destroy(): void {
    this.alive = false;
    this.sprite.destroy();
  }
}
