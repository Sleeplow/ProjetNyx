import Phaser from 'phaser';
import { MODES, type GameModeDef } from '../modes/registry';
import { makeButton, nightBackground } from '../ui/widgets';
import { computeFrame, watchResize, type Frame } from '../ui/layout';
import { CoverFlow, type CoverFlowCard } from '../ui/CoverFlow';

/** Modes jouables EN LIGNE. */
const ONLINE_MODE_IDS = ['brawl-ball', 'battle-royale', 'battle-royale-portal'];

const CARD_W = 300;
const CARD_H = 220;

/** Sélecteur de mode de jeu — carrousel Cover Flow. Commun au solo et à l'en ligne. */
export class ModeSelectScene extends Phaser.Scene {
  private online = false;
  private modes: GameModeDef[] = MODES;
  private flow!: CoverFlow;
  private descText!: Phaser.GameObjects.Text;
  private counterText!: Phaser.GameObjects.Text;

  constructor() {
    super('ModeSelect');
  }

  create(data: { online?: boolean; index?: number }): void {
    this.online = !!data?.online;
    this.modes = this.online ? MODES.filter((m) => ONLINE_MODE_IDS.includes(m.id)) : MODES;
    const startIndex = Phaser.Math.Clamp(data?.index ?? 0, 0, this.modes.length - 1);

    nightBackground(this);
    const F = computeFrame(this);

    this.add.text(F.cx, F.at(0, 52).y, 'MODE DE JEU', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(40), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add
      .text(F.cx, F.at(0, 96).y, this.online ? '🌐 EN LIGNE — choisis un mode' : 'Choisis un mode', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(17), color: this.online ? '#46d160' : '#9b8cff', fontStyle: 'bold' })
      .setOrigin(0.5);

    // Carrousel.
    const flowY = F.at(0, 248).y;
    this.flow = new CoverFlow(this, {
      cx: F.cx,
      cy: flowY,
      frameScale: F.s,
      gap: 288,
      step: 150,
      sideScale: 0.74,
      squash: 0.52,
      alphaStep: 0.34,
      minAlpha: 0.32,
      maxVisible: 2, // 3 modes → tous visibles d'un coup
      onChange: () => this.refresh(),
    });
    this.flow.setCards(
      this.modes.map((m) => this.buildModeCard(m)),
      startIndex,
    );

    // Panneau description + compteur, sous le flux.
    this.descText = this.add
      .text(F.cx, F.at(0, 388).y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(17), color: '#d8d8ff', align: 'center', lineSpacing: 5, wordWrap: { width: F.px(660) } })
      .setOrigin(0.5, 0);
    this.counterText = this.add.text(F.cx, F.at(0, 476).y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(15), color: '#6c6c99' }).setOrigin(0.5);

    // Flèches (aux bords, au-dessus des cartes).
    this.makeArrow(F.at(-470, 248).x, flowY, '‹', -1, F);
    this.makeArrow(F.at(470, 248).x, flowY, '›', 1, F);

    makeButton(this, F.cx, F.at(0, 536).y, F.px(320), F.px(64), 'CHOISIR SON ZAREK', () => this.scene.start('Select', { modeId: this.modes[this.flow.index].id, online: this.online }));
    makeButton(this, F.at(-412, 44).x, F.at(0, 44).y, F.px(150), F.px(46), '‹ Menu', () => this.scene.start('Menu'), 0x3a3466);

    // Clavier (ordi) : flèches gauche/droite.
    this.input.keyboard?.on('keydown-LEFT', () => this.flow.prev());
    this.input.keyboard?.on('keydown-RIGHT', () => this.flow.next());

    this.refresh();
    this.events.once('shutdown', () => this.flow.destroy());
    watchResize(this, () => this.scene.restart({ online: this.online, index: this.flow.index }));
  }

  private buildModeCard(m: GameModeDef): CoverFlowCard {
    const accent = `#${m.accent.toString(16).padStart(6, '0')}`;
    const glow = this.add.rectangle(0, 0, CARD_W, CARD_H, m.accent, 0.1);
    const bg = this.add.rectangle(0, 0, CARD_W, CARD_H, 0x1a1636, 0.97).setStrokeStyle(4, m.accent);
    const icon = this.add.text(0, -CARD_H / 2 + 52, m.icon, { fontFamily: 'system-ui, sans-serif', fontSize: '56px' }).setOrigin(0.5);
    const name = this.add.text(0, 8, m.name, { fontFamily: 'system-ui, sans-serif', fontSize: '23px', color: '#ffffff', fontStyle: 'bold', align: 'center', wordWrap: { width: CARD_W - 34 } }).setOrigin(0.5);
    const tagline = this.add.text(0, CARD_H / 2 - 34, m.tagline, { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: accent, fontStyle: 'bold', align: 'center', wordWrap: { width: CARD_W - 34 } }).setOrigin(0.5);
    const container = this.add.container(0, 0, [glow, bg, icon, name, tagline]);
    return { key: m.id, container, hit: { w: CARD_W, h: CARD_H } };
  }

  private makeArrow(x: number, y: number, glyph: string, dir: number, F: Frame): void {
    const enabled = this.modes.length > 1;
    const t = this.add
      .text(x, y, glyph, { fontFamily: 'system-ui, sans-serif', fontSize: F.font(56), color: enabled ? '#ffffff' : '#39335c', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setDepth(200);
    if (enabled) {
      // Zone de clic élargie pour le doigt (le glyphe seul est étroit).
      t.setInteractive(new Phaser.Geom.Rectangle(-F.px(30), -F.px(30), t.width + F.px(60), t.height + F.px(60)), Phaser.Geom.Rectangle.Contains);
      t.on('pointerover', () => t.setColor('#ffcf33'))
        .on('pointerout', () => t.setColor('#ffffff'))
        .on('pointerdown', () => (dir < 0 ? this.flow.prev() : this.flow.next()));
    }
  }

  private refresh(): void {
    const m = this.modes[this.flow.index];
    this.descText.setText(m.description);
    this.counterText.setText(`${this.flow.index + 1} / ${this.modes.length}`);
  }
}
