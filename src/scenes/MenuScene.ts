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

    // Lune stylisée derrière le titre (thème Nyxt).
    this.add.circle(cx, h * 0.28, 90, 0x2a2350, 0.9).setStrokeStyle(3, 0x6a4dff, 0.6);
    this.add.circle(cx + 34, h * 0.25, 60, 0x0b0b1a, 1);

    this.add
      .text(cx, h * 0.32, 'PROJET NYXT', { fontFamily: 'system-ui, sans-serif', fontSize: '64px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.add
      .text(cx, h * 0.32 + 56, 'Battle Royale · Brawl Ball', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color: '#9b8cff',
      })
      .setOrigin(0.5);

    makeButton(this, cx, h * 0.56, 300, 72, 'SOLO', () => this.scene.start('ModeSelect', { online: false }));
    makeButton(this, cx, h * 0.7, 300, 72, 'EN LIGNE', () => this.scene.start('ModeSelect', { online: true }), 0x2f8f5a);

    this.add
      .text(cx, h - 40, 'Ordi : ZQSD/WASD + souris + clic · E = ultimate   |   Tablette : joysticks tactiles', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: '#6c6c99',
      })
      .setOrigin(0.5);

    // Version affichée en bas à droite : environnement (PROD/QA/DEV) + build id.
    const path = window.location.pathname;
    const host = window.location.hostname;
    const env = path.includes('/qa')
      ? 'QA'
      : host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\./.test(host)
        ? 'DEV'
        : 'PROD';
    const envColor = env === 'QA' ? '#ff8a3d' : env === 'PROD' ? '#46d160' : '#9b8cff';
    this.add
      .text(w - 12, h - 10, `${env} · ${__BUILD_ID__}`, { fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: envColor })
      .setOrigin(1, 1);
  }
}
