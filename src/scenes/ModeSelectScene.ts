import Phaser from 'phaser';
import { MODES, type GameModeDef } from '../modes/registry';
import { makeButton, nightBackground } from '../ui/widgets';
import { computeFrame, watchResize, type Frame } from '../ui/layout';

/** Modes jouables EN LIGNE. */
const ONLINE_MODE_IDS = ['brawl-ball', 'battle-royale', 'battle-royale-portal'];

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

  create(data: { online?: boolean; index?: number }): void {
    this.online = !!data?.online;
    this.modes = this.online ? MODES.filter((m) => ONLINE_MODE_IDS.includes(m.id)) : MODES;
    this.index = Phaser.Math.Clamp(data?.index ?? 0, 0, this.modes.length - 1);

    nightBackground(this);
    const F = computeFrame(this);

    this.add.text(F.cx, F.at(0, 52).y, 'MODE DE JEU', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(40), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add
      .text(F.cx, F.at(0, 98).y, this.online ? '🌐 EN LIGNE — choisis un mode' : 'Choisis un mode', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(18), color: this.online ? '#46d160' : '#9b8cff', fontStyle: 'bold' })
      .setOrigin(0.5);

    const card = F.at(0, 300);
    this.add.rectangle(card.x, card.y, F.px(620), F.px(250), 0x1a1636, 0.95).setStrokeStyle(3, this.online ? 0x2f8f5a : 0x6a4dff);
    this.nameText = this.add.text(card.x, F.at(0, 234).y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(34), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.taglineText = this.add.text(card.x, F.at(0, 276).y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(18), color: '#ffcf33', fontStyle: 'bold' }).setOrigin(0.5);
    this.descText = this.add
      .text(card.x, F.at(0, 312).y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(17), color: '#d8d8ff', align: 'center', lineSpacing: 5, wordWrap: { width: F.px(540) } })
      .setOrigin(0.5, 0);
    this.counterText = this.add.text(card.x, F.at(0, 402).y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(15), color: '#6c6c99' }).setOrigin(0.5);

    this.makeArrow(F.at(-340, 300).x, card.y, '‹', -1, F);
    this.makeArrow(F.at(340, 300).x, card.y, '›', 1, F);

    makeButton(this, F.cx, F.at(0, 520).y, F.px(320), F.px(66), 'CHOISIR SON ZAREK', () => this.scene.start('Select', { modeId: this.modes[this.index].id, online: this.online }));
    makeButton(this, F.at(-412, 44).x, F.at(0, 44).y, F.px(150), F.px(46), '‹ Menu', () => this.scene.start('Menu'), 0x3a3466);

    this.refresh();
    watchResize(this, () => this.scene.restart({ online: this.online, index: this.index }));
  }

  private makeArrow(x: number, y: number, glyph: string, dir: number, F: Frame): void {
    const enabled = this.modes.length > 1;
    const t = this.add
      .text(x, y, glyph, { fontFamily: 'system-ui, sans-serif', fontSize: F.font(56), color: enabled ? '#ffffff' : '#39335c', fontStyle: 'bold' })
      .setOrigin(0.5);
    if (enabled) {
      // Zone de clic élargie pour le doigt (le glyphe seul est étroit).
      t.setInteractive(new Phaser.Geom.Rectangle(-F.px(30), -F.px(30), t.width + F.px(60), t.height + F.px(60)), Phaser.Geom.Rectangle.Contains);
      t.on('pointerover', () => t.setColor('#ffcf33'))
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
