import Phaser from 'phaser';
import { COLORS, POWER_CUBE } from '../config/constants';

/** Un cube de power-up ramassable (bonus de PV max + dégâts). */
export class PowerCube {
  x: number;
  y: number;
  alive = true;
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

  destroy(): void {
    this.alive = false;
    this.sprite.destroy();
  }
}
