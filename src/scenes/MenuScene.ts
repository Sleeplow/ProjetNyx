import Phaser from 'phaser';
import { makeButton, nightBackground } from '../ui/widgets';
import { computeFrame, watchResize, type Frame } from '../ui/layout';
import { createAvatarVisual, type AvatarVisual } from '../render/avatarVisual';
import { ZAREKS } from '../zareks/registry';

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
    const F = computeFrame(this);

    this.mascots = [];
    this.usingMouse = false;
    this.idleX = F.cx;
    this.idleY = F.at(0, 168).y;

    nightBackground(this);
    this.buildMascots(F);

    // Suivi du pointeur : une souris qui survole → on la suit ; en tactile,
    // seul un doigt posé compte (voir update()).
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.wasTouch) this.usingMouse = true;
    });

    // Lune stylisée + halo derrière le titre (thème Nyxt).
    const moon = F.at(0, 158);
    this.add.circle(moon.x, moon.y, F.px(110), 0x6a4dff, 0.12).setDepth(-60);
    this.add.circle(moon.x, moon.y, F.px(90), 0x2a2350, 0.95).setStrokeStyle(3, 0x8a5cff, 0.7).setDepth(-60);
    this.add.circle(moon.x + F.px(34), moon.y - F.px(18), F.px(60), 0x120f28, 1).setDepth(-60);

    // Titre : gros, contour + ombre, entrée qui « tombe » avec un rebond.
    const titlePos = F.at(0, 190);
    const title = this.add
      .text(titlePos.x, titlePos.y, 'PROJET NYXT', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(74), color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);
    title.setStroke('#5a2fd6', Math.max(4, F.px(10)));
    title.setShadow(0, F.px(8), 'rgba(0,0,0,0.5)', F.px(12), true, true);
    title.setY(titlePos.y - F.px(130)).setAlpha(0);
    this.tweens.add({ targets: title, y: titlePos.y, alpha: 1, duration: 700, ease: 'Back.out' });
    this.tweens.add({ targets: title, scale: 1.035, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 800 });

    const tagPos = F.at(0, 250);
    const tag = this.add
      .text(tagPos.x, tagPos.y, 'Battle Royale · Brawl Ball', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(24), color: '#b3a3ff', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: tag, alpha: 1, duration: 600, delay: 500 });

    // Boutons : entrée décalée qui « monte ».
    const soloPos = F.at(0, 350);
    const onlinePos = F.at(0, 442);
    const solo = makeButton(this, soloPos.x, soloPos.y, F.px(300), F.px(72), 'SOLO', () => this.scene.start('ModeSelect', { online: false }));
    const online = makeButton(this, onlinePos.x, onlinePos.y, F.px(300), F.px(72), 'EN LIGNE', () => this.scene.start('ModeSelect', { online: true }), 0x2f8f5a);
    [solo, online].forEach((b, i) => {
      b.container.setAlpha(0).setY(b.container.y + F.px(40));
      this.tweens.add({ targets: b.container, y: `-=${F.px(40)}`, alpha: 1, duration: 500, delay: 720 + i * 130, ease: 'Back.out' });
    });

    const hintPos = F.at(0, 566);
    const hint = this.add
      .text(hintPos.x, hintPos.y, 'Ordi : ZQSD/WASD + souris + clic · E = ultimate   |   Mobile : joysticks tactiles', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: F.font(16),
        color: '#6c6c99',
        align: 'center',
        wordWrap: { width: F.px(940) },
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: hint, alpha: 1, duration: 600, delay: 1000 });

    this.buildVersionTag(w, h, F);

    watchResize(this, () => this.scene.restart());
  }

  /**
   * TOUS les Zareks du registre flottent en arrière-plan et regardent le titre —
   * automatique, donc un nouveau Zarek apparaît sans toucher cet écran. Placés
   * aléatoirement (tirage-rejet) dans les bandes gauche/droite, en évitant la
   * colonne centrale (titre/boutons/indice) et en s'écartant les uns des autres.
   */
  private buildMascots(F: Frame): void {
    const BAND_INNER = 230; // dx design : bord intérieur des bandes (hors colonne UI centrale)
    const BAND_OUTER = 480; // dx design : bord extérieur (reste dans la boîte de design)
    const Y_MIN = 70;
    const Y_MAX = 560;
    const MIN_DIST = 150; // écart mini entre deux mascottes (unités design)
    const MAX_TRIES = 40;

    const placed: { dx: number; dy: number }[] = [];
    const pickSpot = (): { dx: number; dy: number } => {
      let best = { dx: 0, dy: 0 };
      let bestScore = -Infinity;
      for (let i = 0; i < MAX_TRIES; i++) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const dx = side * Phaser.Math.Between(BAND_INNER, BAND_OUTER);
        const dy = Phaser.Math.Between(Y_MIN, Y_MAX);
        const score = placed.length === 0 ? Infinity : Math.min(...placed.map((p) => Phaser.Math.Distance.Between(dx, dy, p.dx, p.dy)));
        if (score >= MIN_DIST) return { dx, dy };
        if (score > bestScore) {
          bestScore = score;
          best = { dx, dy };
        }
      }
      return best; // pas trouvé de place assez isolée : on prend le meilleur essai
    };

    for (const def of ZAREKS) {
      const spot = pickSpot();
      placed.push(spot);
      const p = F.at(spot.dx, spot.dy);
      const scale = 1.1 + Math.random() * 0.25;
      const vis = createAvatarVisual(this, def, { isSelf: false, label: '', decor: true });
      vis.container.setPosition(p.x, p.y).setDepth(-40).setScale(scale * F.s).setAlpha(0);
      const aim = Math.atan2(this.idleY - p.y, this.idleX - p.x); // regarde vers le titre au départ
      vis.setAim(aim);
      this.mascots.push({ vis, aim });
      this.tweens.add({ targets: vis.container, alpha: 1, duration: 700, delay: 250 + Math.random() * 300 });
      this.tweens.add({ targets: vis.container, y: p.y - 16, duration: 1600 + Math.random() * 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
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
  private buildVersionTag(w: number, h: number, F: Frame): void {
    const path = window.location.pathname;
    const host = window.location.hostname;
    const env = path.includes('/qa')
      ? 'QA'
      : host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\./.test(host)
        ? 'DEV'
        : 'PROD';
    const envColor = env === 'QA' ? '#ff8a3d' : env === 'PROD' ? '#46d160' : '#9b8cff';
    this.add
      .text(w - F.insets.right - 12, h - F.insets.bottom - 10, `${env} · ${__BUILD_ID__}`, { fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: envColor })
      .setOrigin(1, 1);
  }
}
