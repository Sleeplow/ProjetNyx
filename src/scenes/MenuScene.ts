import Phaser from 'phaser';
import { makeButton, nightBackground } from '../ui/widgets';

/** Écran d'accueil. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    nightBackground(this);
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;

    // Lune stylisée derrière le titre (thème Nyx).
    this.add.circle(cx, h * 0.28, 90, 0x2a2350, 0.9).setStrokeStyle(3, 0x6a4dff, 0.6);
    this.add.circle(cx + 34, h * 0.25, 60, 0x0b0b1a, 1);

    this.add
      .text(cx, h * 0.32, 'PROJET NYX', { fontFamily: 'system-ui, sans-serif', fontSize: '64px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.add
      .text(cx, h * 0.32 + 56, 'Battle Royale · 1 joueur contre 4 NPC', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color: '#9b8cff',
      })
      .setOrigin(0.5);

    makeButton(this, cx, h * 0.6, 300, 76, 'JOUER', () => this.scene.start('Select'));

    this.add
      .text(cx, h - 40, 'Ordi : ZQSD/WASD + souris + clic · E = ultimate   |   Tablette : joysticks tactiles', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: '#6c6c99',
      })
      .setOrigin(0.5);
  }
}
