import Phaser from 'phaser';
import { POWER_CUBE } from '../config/constants';

/** Échelle d'affichage de la gemme bakée (128px) — aussi utilisée par le rendu
 * en ligne (`OnlineGameScene`) pour que solo et en ligne se ressemblent. */
export const GEM_SCALE = 0.35;

/** Un cube de power-up ramassable (bonus de PV max + dégâts). */
export class PowerCube {
  x: number;
  y: number;
  alive = true;
  /** Temps passé hors de la zone sûre (ms) — au-delà du seuil, le cube disparaît. */
  outsideMs = 0;
  private readonly sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite = scene.add.sprite(x, y, 'power_gem').setScale(GEM_SCALE).setDepth(10).play('power_gem_spin');
    // Léger flottement vertical, en plus de la rotation 3D — accroche l'œil.
    scene.tweens.add({
      targets: this.sprite,
      y: y - 6,
      duration: 900,
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
