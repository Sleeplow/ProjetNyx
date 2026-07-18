import Phaser from 'phaser';
import type { Combatant } from '../core/Combatant';
import { COLORS } from '../config/constants';

/** Interface tête haute (HUD), fixée à la caméra. */
export class Hud {
  private readonly scene: Phaser.Scene;

  private readonly hpBack: Phaser.GameObjects.Rectangle;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly ultBack: Phaser.GameObjects.Rectangle;
  private readonly ultFill: Phaser.GameObjects.Rectangle;
  private readonly survivors: Phaser.GameObjects.Text;
  private readonly cubes: Phaser.GameObjects.Text;
  private readonly warning: Phaser.GameObjects.Text;
  private readonly vignette: Phaser.GameObjects.Rectangle;
  private readonly announce: Phaser.GameObjects.Text;

  private static readonly HP_W = 280;
  private pulse = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const d = 950;

    this.vignette = scene.add
      .rectangle(0, 0, 10, 10, COLORS.healthLow, 0)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(900);

    this.hpBack = scene.add.rectangle(0, 0, Hud.HP_W, 22, COLORS.healthBack, 0.85).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d).setStrokeStyle(2, 0x000000, 0.6);
    this.hpFill = scene.add.rectangle(0, 0, Hud.HP_W, 22, COLORS.healthGood).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d);
    this.hpText = scene.add.text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d + 1);

    this.ultBack = scene.add.rectangle(0, 0, Hud.HP_W, 12, COLORS.healthBack, 0.85).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d).setStrokeStyle(2, 0x000000, 0.6);
    this.ultFill = scene.add.rectangle(0, 0, 0, 12, COLORS.ultReady).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d);

    this.survivors = scene.add.text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '20px', color: '#f2f2ff', fontStyle: 'bold' }).setOrigin(1, 0).setScrollFactor(0).setDepth(d);
    this.cubes = scene.add.text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#66e0ff', fontStyle: 'bold' }).setOrigin(0, 0).setScrollFactor(0).setDepth(d);

    this.warning = scene.add.text(0, 0, '⚠ HORS ZONE', { fontFamily: 'system-ui, sans-serif', fontSize: '26px', color: '#ff6b5e', fontStyle: 'bold' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(d + 2).setVisible(false);

    this.announce = scene.add.text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '34px', color: '#ffffff', fontStyle: 'bold', align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 3).setAlpha(0);

    this.layout();
    scene.scale.on('resize', this.layout, this);
  }

  private layout(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    this.vignette.setSize(w, h);
    const hx = 24;
    const hy = h - 54;
    this.hpBack.setPosition(hx, hy);
    this.hpFill.setPosition(hx, hy);
    this.hpText.setPosition(hx + 8, hy);
    this.ultBack.setPosition(hx, hy + 22);
    this.ultFill.setPosition(hx, hy + 22);
    this.survivors.setPosition(w - 20, 16);
    this.cubes.setPosition(20, 16);
    this.warning.setPosition(w / 2, 24);
    this.announce.setPosition(w / 2, h / 2 - 40);
  }

  update(player: Combatant, survivorsCount: number, outside: boolean, dtMs: number): void {
    this.pulse += dtMs;

    const ratio = player.alive ? player.healthRatio : 0;
    this.hpFill.width = Hud.HP_W * ratio;
    this.hpFill.fillColor = ratio > 0.35 ? COLORS.healthGood : COLORS.healthLow;
    this.hpText.setText(`${Math.ceil(player.alive ? player.health : 0)} / ${player.maxHealth}`);

    this.ultFill.width = (Hud.HP_W * player.ultCharge) / 100;
    this.ultFill.fillColor = player.ultReady ? COLORS.ultReady : 0x8a7bd8;

    this.survivors.setText(`Survivants : ${survivorsCount}`);
    this.cubes.setText(`◆ ${player.cubes}`);

    const show = outside && player.alive;
    this.warning.setVisible(show);
    this.vignette.setAlpha(show ? 0.12 + 0.06 * Math.abs(Math.sin(this.pulse / 220)) : 0);
  }

  /** Affiche brièvement une annonce au centre. */
  flash(message: string, color = '#ffffff'): void {
    this.announce.setText(message).setColor(color).setAlpha(1).setScale(1.15);
    this.scene.tweens.add({ targets: this.announce, scale: 1, duration: 200, ease: 'Back.out' });
    this.scene.tweens.add({ targets: this.announce, alpha: 0, delay: 1400, duration: 500 });
  }

  destroy(): void {
    this.scene.scale.off('resize', this.layout, this);
  }
}
