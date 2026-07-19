import Phaser from 'phaser';
import { MODES, type GameModeDef } from '../modes/registry';
import { makeButton, nightBackground } from '../ui/widgets';

/** Modes jouables EN LIGNE pour l'instant (le Battle Royale en ligne viendra ensuite). */
const ONLINE_MODE_IDS = ['brawl-ball'];

/** Sélecteur de mode de jeu (roulette). Commun au solo et à l'en ligne. */
export class ModeSelectScene extends Phaser.Scene {
  private index = 0;
  private online = false;
  private modes: GameModeDef[] = MODES;
  private nameText!: Phaser.GameObjects.Text;
  private taglineText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private counterText!: Phaser.GameObjects.Text;

  constructor() {
    super('ModeSelect');
  }

  create(data: { online?: boolean }): void {
    this.online = !!data?.online;
    this.modes = this.online ? MODES.filter((m) => ONLINE_MODE_IDS.includes(m.id)) : MODES;
    this.index = 0;

    nightBackground(this);
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;

    this.add.text(cx, 64, 'MODE DE JEU', { fontFamily: 'system-ui, sans-serif', fontSize: '40px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add
      .text(cx, 108, this.online ? '🌐 EN LIGNE — choisis un mode' : 'Choisis un mode', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: this.online ? '#46d160' : '#9b8cff', fontStyle: 'bold' })
      .setOrigin(0.5);

    const cardY = h * 0.46;
    this.add.rectangle(cx, cardY, 560, 250, 0x1a1636, 0.95).setStrokeStyle(3, this.online ? 0x2f8f5a : 0x6a4dff);
    this.nameText = this.add.text(cx, cardY - 66, '', { fontFamily: 'system-ui, sans-serif', fontSize: '34px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.taglineText = this.add.text(cx, cardY - 24, '', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#ffcf33', fontStyle: 'bold' }).setOrigin(0.5);
    this.descText = this.add
      .text(cx, cardY + 12, '', { fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: '#d8d8ff', align: 'center', lineSpacing: 5, wordWrap: { width: 480 } })
      .setOrigin(0.5, 0);
    this.counterText = this.add.text(cx, cardY + 100, '', { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#6c6c99' }).setOrigin(0.5);

    this.makeArrow(cx - 330, cardY, '‹', -1);
    this.makeArrow(cx + 330, cardY, '›', 1);

    makeButton(this, cx, h - 90, 320, 66, 'CHOISIR SON ZAREK', () => this.scene.start('Select', { modeId: this.modes[this.index].id, online: this.online }));
    makeButton(this, 96, 48, 150, 46, '‹ Menu', () => this.scene.start('Menu'), 0x3a3466);

    this.refresh();
  }

  private makeArrow(x: number, y: number, glyph: string, dir: number): void {
    const enabled = this.modes.length > 1;
    const t = this.add
      .text(x, y, glyph, { fontFamily: 'system-ui, sans-serif', fontSize: '56px', color: enabled ? '#ffffff' : '#39335c', fontStyle: 'bold' })
      .setOrigin(0.5);
    if (enabled) {
      t.setInteractive({ useHandCursor: true })
        .on('pointerover', () => t.setColor('#ffcf33'))
        .on('pointerout', () => t.setColor('#ffffff'))
        .on('pointerdown', () => {
          this.index = (this.index + dir + this.modes.length) % this.modes.length;
          this.refresh();
        });
    }
  }

  private refresh(): void {
    const m = this.modes[this.index];
    this.nameText.setText(m.name);
    this.taglineText.setText(m.tagline);
    this.descText.setText(m.description);
    this.counterText.setText(`${this.index + 1} / ${this.modes.length}`);
  }
}
