import Phaser from 'phaser';
import type { Combatant } from '../core/Combatant';
import { COLORS } from '../config/constants';
import { TEAM } from '../config/soccer';
import { safeInsets } from './layout';
import { makeQuitButton } from './widgets';

/** HUD du mode Brawl Ball : score + chrono en haut, vie/ult du joueur en bas. */
export class SoccerHud {
  private readonly scene: Phaser.Scene;

  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly timerText: Phaser.GameObjects.Text;
  private readonly hpBack: Phaser.GameObjects.Rectangle;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly ultBack: Phaser.GameObjects.Rectangle;
  private readonly ultFill: Phaser.GameObjects.Rectangle;
  private readonly respawnText: Phaser.GameObjects.Text;
  private readonly announce: Phaser.GameObjects.Text;
  private readonly quit: Phaser.GameObjects.Text;

  private static readonly HP_W = 280;

  constructor(scene: Phaser.Scene, onQuit: () => void) {
    this.scene = scene;
    const d = 950;

    this.quit = makeQuitButton(scene, onQuit);
    this.scoreText = scene.add
      .text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '34px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(d);
    this.timerText = scene.add
      .text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '22px', fontStyle: 'bold', color: '#d8d8ff' })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(d);

    this.hpBack = scene.add.rectangle(0, 0, SoccerHud.HP_W, 22, COLORS.healthBack, 0.85).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d).setStrokeStyle(2, 0x000000, 0.6);
    this.hpFill = scene.add.rectangle(0, 0, SoccerHud.HP_W, 22, COLORS.healthGood).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d);
    this.hpText = scene.add.text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d + 1);
    this.ultBack = scene.add.rectangle(0, 0, SoccerHud.HP_W, 12, COLORS.healthBack, 0.85).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d).setStrokeStyle(2, 0x000000, 0.6);
    this.ultFill = scene.add.rectangle(0, 0, 0, 12, COLORS.ultReady).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d);

    this.respawnText = scene.add
      .text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#ff6b5e' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(d + 2)
      .setVisible(false);

    this.announce = scene.add
      .text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '46px', fontStyle: 'bold', color: '#ffffff', align: 'center' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(d + 3)
      .setAlpha(0);

    this.layout();
    scene.scale.on('resize', this.layout, this);
  }

  private layout(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const i = safeInsets();
    this.scoreText.setPosition(w / 2, 12 + i.top);
    this.timerText.setPosition(w / 2, 54 + i.top);
    this.quit.setPosition(20 + i.left, 16 + i.top);
    const hx = 24 + i.left;
    const hy = h - 54 - i.bottom;
    this.hpBack.setPosition(hx, hy);
    this.hpFill.setPosition(hx, hy);
    this.hpText.setPosition(hx + 8, hy);
    this.ultBack.setPosition(hx, hy + 22);
    this.ultFill.setPosition(hx, hy + 22);
    this.respawnText.setPosition(w / 2, h / 2 + 90);
    this.announce.setPosition(w / 2, h / 2 - 40);
  }

  update(player: Combatant, score: readonly [number, number], remainingMs: number, sudden: boolean, respawnMs: number): void {
    this.scoreText.setText(`${TEAM.labelA}  ${score[0]} — ${score[1]}  ${TEAM.labelB}`);
    this.scoreText.setColor('#ffffff');

    if (sudden) {
      this.timerText.setText('MORT SUBITE').setColor('#ffcf33');
    } else {
      const s = Math.max(0, Math.ceil(remainingMs / 1000));
      const m = Math.floor(s / 60);
      const ss = (s % 60).toString().padStart(2, '0');
      this.timerText.setText(`${m}:${ss}`).setColor(s <= 15 ? '#ff6b5e' : '#d8d8ff');
    }

    const ratio = player.alive ? player.healthRatio : 0;
    this.hpFill.width = SoccerHud.HP_W * ratio;
    this.hpFill.fillColor = ratio > 0.35 ? COLORS.healthGood : COLORS.healthLow;
    this.hpText.setText(`${Math.ceil(player.alive ? player.health : 0)} / ${player.maxHealth}`);
    this.ultFill.width = (SoccerHud.HP_W * player.ultCharge) / 100;
    this.ultFill.fillColor = player.ultReady ? COLORS.ultReady : 0x8a7bd8;

    if (!player.alive) {
      this.respawnText.setText(`Réapparition dans ${Math.ceil(respawnMs / 1000)}…`).setVisible(true);
    } else {
      this.respawnText.setVisible(false);
    }
  }

  flash(message: string, color = '#ffffff'): void {
    this.announce.setText(message).setColor(color).setAlpha(1).setScale(1.2);
    this.scene.tweens.add({ targets: this.announce, scale: 1, duration: 220, ease: 'Back.out' });
    this.scene.tweens.add({ targets: this.announce, alpha: 0, delay: 1200, duration: 500 });
  }

  destroy(): void {
    this.scene.scale.off('resize', this.layout, this);
  }
}
