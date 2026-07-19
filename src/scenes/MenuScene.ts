import Phaser from 'phaser';
import { makeButton, nightBackground } from '../ui/widgets';
import { createAvatarVisual, type AvatarVisual } from '../render/avatarVisual';
import { ZAREK_BY_ID, ZAREKS } from '../zareks/registry';

/** Écran d'accueil — animé pour donner le ton dès l'arrivée. */
export class MenuScene extends Phaser.Scene {
  private mascots: { vis: AvatarVisual; aim: number }[] = [];
  /** Vrai dès qu'une souris est détectée (survol) : sinon on est en tactile. */
  private usingMouse = false;
  /** Cible « au repos » que les mascottes regardent (le titre). */
  private idleX = 0;
  private idleY = 0;

  constructor() {
    super('Menu');
  }

  create(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;

    this.mascots = [];
    this.usingMouse = false;
    this.idleX = cx;
    this.idleY = h * 0.34;

    nightBackground(this);
    this.buildMascots(w, h, cx);

    // Suivi du pointeur : une souris qui survole → on la suit ; en tactile,
    // seul un doigt posé compte (voir update()).
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.wasTouch) this.usingMouse = true;
    });

    // Lune stylisée + halo derrière le titre (thème Nyxt).
    this.add.circle(cx, h * 0.28, 110, 0x6a4dff, 0.12).setDepth(-60);
    this.add.circle(cx, h * 0.28, 90, 0x2a2350, 0.95).setStrokeStyle(3, 0x8a5cff, 0.7).setDepth(-60);
    this.add.circle(cx + 34, h * 0.25, 60, 0x120f28, 1).setDepth(-60);

    // Titre : gros, contour + ombre, entrée qui « tombe » avec un rebond.
    const title = this.add
      .text(cx, h * 0.31, 'PROJET NYXT', { fontFamily: 'system-ui, sans-serif', fontSize: '74px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);
    title.setStroke('#5a2fd6', 10);
    title.setShadow(0, 8, 'rgba(0,0,0,0.5)', 12, true, true);
    title.setY(h * 0.31 - 130).setAlpha(0);
    this.tweens.add({ targets: title, y: h * 0.31, alpha: 1, duration: 700, ease: 'Back.out' });
    this.tweens.add({ targets: title, scale: 1.035, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 800 });

    const tag = this.add
      .text(cx, h * 0.31 + 60, 'Battle Royale · Brawl Ball', { fontFamily: 'system-ui, sans-serif', fontSize: '24px', color: '#b3a3ff', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: tag, alpha: 1, duration: 600, delay: 500 });

    // Boutons : entrée décalée qui « monte ».
    const solo = makeButton(this, cx, h * 0.56, 300, 72, 'SOLO', () => this.scene.start('ModeSelect', { online: false }));
    const online = makeButton(this, cx, h * 0.7, 300, 72, 'EN LIGNE', () => this.scene.start('ModeSelect', { online: true }), 0x2f8f5a);
    [solo, online].forEach((b, i) => {
      b.container.setAlpha(0).setY(b.container.y + 40);
      this.tweens.add({ targets: b.container, y: `-=40`, alpha: 1, duration: 500, delay: 720 + i * 130, ease: 'Back.out' });
    });

    const hint = this.add
      .text(cx, h - 40, 'Ordi : ZQSD/WASD + souris + clic · E = ultimate   |   Tablette : joysticks tactiles', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: '#6c6c99',
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: hint, alpha: 1, duration: 600, delay: 1000 });

    this.buildVersionTag(w, h);
  }

  /** Quelques Zareks « cartoon » qui flottent en arrière-plan et regardent le titre. */
  private buildMascots(w: number, h: number, cx: number): void {
    const macs = [
      { id: 'zephyr', x: w * 0.15, y: h * 0.52, s: 1.35 },
      { id: 'atlas', x: w * 0.85, y: h * 0.44, s: 1.15 },
      { id: 'hecate', x: w * 0.83, y: h * 0.8, s: 1.25 },
    ];
    for (const m of macs) {
      const def = ZAREK_BY_ID[m.id] ?? ZAREKS[0];
      const vis = createAvatarVisual(this, def, { isSelf: false, label: '', decor: true });
      vis.container.setPosition(m.x, m.y).setDepth(-40).setScale(m.s).setAlpha(0);
      const aim = Math.atan2(h * 0.34 - m.y, cx - m.x); // regarde vers le titre au départ
      vis.setAim(aim);
      this.mascots.push({ vis, aim });
      this.tweens.add({ targets: vis.container, alpha: 1, duration: 700, delay: 250 });
      this.tweens.add({ targets: vis.container, y: m.y - 16, duration: 1600 + Math.random() * 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
  }

  /** Les yeux suivent le pointeur (souris), ou le doigt (tactile), sinon le titre. */
  update(): void {
    if (this.mascots.length === 0) return;
    const p = this.input.activePointer;
    const follow = this.usingMouse || p.isDown;
    const tx = follow ? p.x : this.idleX;
    const ty = follow ? p.y : this.idleY;
    for (const m of this.mascots) {
      const target = Phaser.Math.Angle.Between(m.vis.container.x, m.vis.container.y, tx, ty);
      m.aim = Phaser.Math.Angle.RotateTo(m.aim, target, 0.12);
      m.vis.setAim(m.aim);
    }
  }

  /** Version affichée en bas à droite : environnement (PROD/QA/DEV) + build id. */
  private buildVersionTag(w: number, h: number): void {
    const path = window.location.pathname;
    const host = window.location.hostname;
    const env = path.includes('/qa')
      ? 'QA'
      : host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\./.test(host)
        ? 'DEV'
        : 'PROD';
    const envColor = env === 'QA' ? '#ff8a3d' : env === 'PROD' ? '#46d160' : '#9b8cff';
    this.add.text(w - 12, h - 10, `${env} · ${__BUILD_ID__}`, { fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: envColor }).setOrigin(1, 1);
  }
}
