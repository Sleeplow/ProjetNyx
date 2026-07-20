import Phaser from 'phaser';
import type { ZarekDef, ZarekSpriteDef } from '../core/types';
import { COLORS } from '../config/constants';

const EYE_DARK = 0x14102a;

/**
 * Rendu « cartoon » d'un combattant, PARTAGÉ entre le solo (`Combatant`) et
 * l'en ligne (`OnlineGameScene`) pour que les deux soient identiques depuis une
 * seule source : ombre, corps à contour épais, reflet, yeux qui suivent la
 * visée, accessoire de tête selon le rôle, barre de vie, halo d'ultime.
 *
 * Deux implémentations derrière la même interface : `createVectorAvatarVisual`
 * (formes Phaser, tous les Zareks par défaut) et `createSpriteAvatarVisual`
 * (sheets baked par le skill `sprite-bake` depuis un modèle 3D — seulement les
 * Zareks avec un `def.sprite`). `createAvatarVisual` choisit automatiquement ;
 * partout ailleurs dans le code ça reste un simple appel unique.
 */
export interface AvatarVisual {
  container: Phaser.GameObjects.Container;
  /** Oriente les yeux + l'accessoire dans l'axe de visée. */
  setAim(angle: number): void;
  /** Barre de vie (ratio 0→1). */
  setHealth(ratio: number): void;
  /** Halo « ultime prêt ». */
  setUltReady(on: boolean): void;
  /** Compteur de cubes (Battle Royale) ; 0 = masqué. */
  setCubes(n: number): void;
  /** Flash blanc + petit écrasement quand le perso encaisse. */
  flashHit(): void;
  /** Apparition « pop » (spawn / réapparition). */
  popIn(): void;
  /** Remet couleur et échelle normales (après un replacement). */
  reset(): void;
  destroy(): void;
}

export interface AvatarOptions {
  isSelf: boolean;
  teamColor?: number;
  label: string;
  barW?: number;
  /** Mode « décor » (menu) : pas de barre de vie ni de nom, juste le personnage. */
  decor?: boolean;
}

export function createAvatarVisual(scene: Phaser.Scene, def: ZarekDef, opts: AvatarOptions): AvatarVisual {
  return def.sprite ? createSpriteAvatarVisual(scene, def, def.sprite, opts) : createVectorAvatarVisual(scene, def, opts);
}

// ==========================================================================
// Rendu vectoriel (défaut)
// ==========================================================================

/** Accessoire de tête selon le rôle (repère local : +x = avant, +y = en travers). */
function buildAccessory(scene: Phaser.Scene, def: ZarekDef, r: number): Phaser.GameObjects.Container {
  const acc = def.accent;
  const DARK = 0x191932;
  const parts: Phaser.GameObjects.GameObject[] = [];
  switch (def.role) {
    case 'tank': // casque : large visière sombre + liseré accent
      parts.push(scene.add.rectangle(0, 0, r * 0.3, r * 1.2, DARK).setStrokeStyle(2, acc, 0.9));
      break;
    case 'sharpshooter': // lunettes de visée : barre accent + deux verres
      parts.push(scene.add.rectangle(0, 0, r * 0.22, r * 1.1, acc));
      parts.push(scene.add.circle(0, r * 0.34, r * 0.12, DARK, 0.9));
      parts.push(scene.add.circle(0, -r * 0.34, r * 0.12, DARK, 0.9));
      break;
    case 'mage': // gemme au front (losange accent)
      parts.push(scene.add.rectangle(0, 0, r * 0.44, r * 0.44, acc).setStrokeStyle(2, DARK, 0.8).setRotation(Math.PI / 4));
      break;
    case 'assassin': // bandeau/masque sombre
      parts.push(scene.add.rectangle(0, 0, r * 0.3, r * 1.3, DARK));
      break;
    default: // support & autres : petite croix accent
      parts.push(scene.add.rectangle(0, 0, r * 0.16, r * 0.5, acc));
      parts.push(scene.add.rectangle(0, 0, r * 0.5, r * 0.16, acc));
  }
  return scene.add.container(0, 0, parts);
}

function createVectorAvatarVisual(scene: Phaser.Scene, def: ZarekDef, opts: AvatarOptions): AvatarVisual {
  const r = def.radius;
  const barW = opts.barW ?? 58;

  const shadow = scene.add.ellipse(0, r * 0.82, r * 1.95, r * 0.82, 0x000000, 0.22);
  const ultGlow = scene.add.circle(0, 0, r + 8, COLORS.ultReady, 0).setStrokeStyle(4, COLORS.ultReady, 0.9).setVisible(false);
  scene.tweens.add({ targets: ultGlow, scale: 1.45, alpha: 0.15, duration: 720, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  const barrel = scene.add.rectangle(0, 0, r + 14, 7, def.accent).setOrigin(0, 0.5);

  const strokeColor = opts.isSelf ? COLORS.playerAccent : opts.teamColor ?? def.accent;
  const strokeWidth = opts.isSelf ? 7 : opts.teamColor !== undefined ? 6 : 5;
  const body = scene.add.circle(0, 0, r, def.color).setStrokeStyle(strokeWidth, strokeColor);
  const highlight = scene.add.circle(-r * 0.3, -r * 0.36, r * 0.4, COLORS.white, 0.2);

  const eyeL = scene.add.circle(0, 0, r * 0.28, COLORS.white, 1).setStrokeStyle(2, EYE_DARK, 0.5);
  const eyeR = scene.add.circle(0, 0, r * 0.28, COLORS.white, 1).setStrokeStyle(2, EYE_DARK, 0.5);
  const pupilL = scene.add.circle(0, 0, r * 0.14, EYE_DARK, 1);
  const pupilR = scene.add.circle(0, 0, r * 0.14, EYE_DARK, 1);
  const accessory = buildAccessory(scene, def, r);

  const decor = !!opts.decor;
  const hpFill = decor ? null : scene.add.rectangle(-barW / 2, -(r + 22), barW, 9, COLORS.healthGood).setOrigin(0, 0.5);
  const cubeText = decor ? null : scene.add.text(0, -(r + 36), '', { fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#66e0ff', fontStyle: 'bold' }).setOrigin(0.5, 1);

  const children: Phaser.GameObjects.GameObject[] = [shadow, ultGlow, barrel, body, highlight, eyeL, eyeR, pupilL, pupilR, accessory];
  if (!decor) {
    const hpBack = scene.add.rectangle(-barW / 2, -(r + 22), barW, 9, COLORS.healthBack).setOrigin(0, 0.5).setStrokeStyle(2, 0x000000, 0.7);
    const label = scene.add
      .text(0, r + 6, opts.label, { fontFamily: 'system-ui, sans-serif', fontSize: opts.isSelf ? '15px' : '12px', color: opts.isSelf ? '#ffe066' : '#cfcfe6', fontStyle: opts.isSelf ? 'bold' : 'normal' })
      .setOrigin(0.5, 0);
    children.push(hpBack, hpFill!, cubeText!, label);
  }

  const container = scene.add.container(0, 0, children);

  return {
    container,
    setAim(angle) {
      barrel.setRotation(angle);
      const ax = Math.cos(angle);
      const ay = Math.sin(angle);
      const px = -ay;
      const py = ax;
      const fwd = r * 0.26;
      const spread = r * 0.4;
      const lx = ax * fwd + px * spread;
      const ly = ay * fwd + py * spread;
      const rx = ax * fwd - px * spread;
      const ry = ay * fwd - py * spread;
      eyeL.setPosition(lx, ly);
      eyeR.setPosition(rx, ry);
      pupilL.setPosition(lx + ax * r * 0.12, ly + ay * r * 0.12);
      pupilR.setPosition(rx + ax * r * 0.12, ry + ay * r * 0.12);
      accessory.setPosition(ax * r * 0.42, ay * r * 0.42).setRotation(angle);
    },
    setHealth(ratio) {
      if (!hpFill) return;
      const cl = Phaser.Math.Clamp(ratio, 0, 1);
      hpFill.width = barW * cl;
      hpFill.fillColor = cl > 0.35 ? COLORS.healthGood : COLORS.healthLow;
    },
    setUltReady(on) {
      ultGlow.setVisible(on);
    },
    setCubes(n) {
      cubeText?.setText(n > 0 ? `◆${n}` : '');
    },
    flashHit() {
      body.setFillStyle(COLORS.white);
      scene.tweens.killTweensOf(container);
      container.setScale(1);
      scene.tweens.add({ targets: container, scaleX: 1.16, scaleY: 0.84, duration: 80, yoyo: true, ease: 'Quad.out' });
      scene.time.delayedCall(90, () => body.setFillStyle(def.color));
    },
    popIn() {
      scene.tweens.killTweensOf(container);
      container.setScale(0.3);
      scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 280, ease: 'Back.out' });
    },
    reset() {
      body.setFillStyle(def.color);
      scene.tweens.killTweensOf(container);
      container.setScale(1);
    },
    destroy() {
      container.destroy();
    },
  };
}

// ==========================================================================
// Rendu sprite (baked 3D→2D, voir `.claude/skills/sprite-bake`)
// ==========================================================================

/** Index de direction (0..dirs-1) le plus proche d'un angle écran (0 = droite, sens horaire). */
function dirIndexFor(angleRad: number, s: ZarekSpriteDef): number {
  const step = (Math.PI * 2) / s.dirs;
  const a = Phaser.Math.Wrap(s.spin * angleRad + Phaser.Math.DegToRad(s.yawOffsetDeg), 0, Math.PI * 2);
  return Math.round(a / step) % s.dirs;
}

/** Enregistre les animations de marche (une par direction) une seule fois par scène+sprite. */
function ensureWalkAnims(scene: Phaser.Scene, s: ZarekSpriteDef): void {
  for (let d = 0; d < s.dirs; d++) {
    const key = `${s.walk.key}_d${d}`;
    if (scene.anims.exists(key)) continue;
    const start = d * s.walk.cols;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(s.walk.key, { start, end: start + s.walk.cols - 1 }),
      frameRate: s.walk.frameRate,
      repeat: -1,
    });
  }
}

function createSpriteAvatarVisual(scene: Phaser.Scene, def: ZarekDef, s: ZarekSpriteDef, opts: AvatarOptions): AvatarVisual {
  const r = def.radius;
  const barW = opts.barW ?? 58;
  ensureWalkAnims(scene, s);

  const shadow = scene.add.ellipse(0, r * 0.82, r * 1.95, r * 0.82, 0x000000, 0.22);
  const ultGlow = scene.add.circle(0, 0, r + 8, COLORS.ultReady, 0).setStrokeStyle(4, COLORS.ultReady, 0.9).setVisible(false);
  scene.tweens.add({ targets: ultGlow, scale: 1.45, alpha: 0.15, duration: 720, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

  const sprite = scene.add.sprite(0, s.footY, s.idle.key, 0).setScale(s.scale);
  const ring = opts.isSelf || opts.teamColor !== undefined ? scene.add.circle(0, r * 0.55, r * 0.85, 0, 0).setStrokeStyle(opts.isSelf ? 4 : 3, opts.isSelf ? COLORS.playerAccent : opts.teamColor!, 0.85) : null;

  const decor = !!opts.decor;
  const hpFill = decor ? null : scene.add.rectangle(-barW / 2, -(r + 22), barW, 9, COLORS.healthGood).setOrigin(0, 0.5);
  const cubeText = decor ? null : scene.add.text(0, -(r + 36), '', { fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#66e0ff', fontStyle: 'bold' }).setOrigin(0.5, 1);

  const children: Phaser.GameObjects.GameObject[] = [shadow, ultGlow, ...(ring ? [ring] : []), sprite];
  if (!decor) {
    const hpBack = scene.add.rectangle(-barW / 2, -(r + 22), barW, 9, COLORS.healthBack).setOrigin(0, 0.5).setStrokeStyle(2, 0x000000, 0.7);
    const label = scene.add
      .text(0, r + 6, opts.label, { fontFamily: 'system-ui, sans-serif', fontSize: opts.isSelf ? '15px' : '12px', color: opts.isSelf ? '#ffe066' : '#cfcfe6', fontStyle: opts.isSelf ? 'bold' : 'normal' })
      .setOrigin(0.5, 0);
    children.push(hpBack, hpFill!, cubeText!, label);
  }

  const container = scene.add.container(0, 0, children);

  // La sheet n'a pas de pose « visée seule » : le corps suit le DÉPLACEMENT
  // (comme un vrai perso 3D qui marche vers où il va), et retombe sur le dernier
  // angle de visée connu à l'arrêt (même intention que les yeux du rendu vectoriel).
  let lastX = NaN;
  let lastY = NaN;
  let facing = 0;
  let curDir = 0;
  let walking = false;

  return {
    container,
    setAim(angle) {
      const x = container.x;
      const y = container.y;
      const dx = Number.isNaN(lastX) ? 0 : x - lastX;
      const dy = Number.isNaN(lastY) ? 0 : y - lastY;
      lastX = x;
      lastY = y;
      const moveDist = Math.hypot(dx, dy);
      const isMoving = moveDist > 0.35; // filtre le bruit d'arrondi/interpolation réseau

      facing = isMoving ? Math.atan2(dy, dx) : angle;
      const dir = dirIndexFor(facing, s);

      if (isMoving) {
        if (!walking || dir !== curDir) sprite.play(`${s.walk.key}_d${dir}`, true);
      } else if (walking || dir !== curDir || sprite.texture.key !== s.idle.key) {
        sprite.stop();
        sprite.setTexture(s.idle.key, dir);
      }
      walking = isMoving;
      curDir = dir;
    },
    setHealth(ratio) {
      if (!hpFill) return;
      const cl = Phaser.Math.Clamp(ratio, 0, 1);
      hpFill.width = barW * cl;
      hpFill.fillColor = cl > 0.35 ? COLORS.healthGood : COLORS.healthLow;
    },
    setUltReady(on) {
      ultGlow.setVisible(on);
    },
    setCubes(n) {
      cubeText?.setText(n > 0 ? `◆${n}` : '');
    },
    flashHit() {
      sprite.setTintFill(0xffffff);
      scene.tweens.killTweensOf(container);
      container.setScale(1);
      scene.tweens.add({ targets: container, scaleX: 1.16, scaleY: 0.84, duration: 80, yoyo: true, ease: 'Quad.out' });
      scene.time.delayedCall(90, () => sprite.clearTint());
    },
    popIn() {
      scene.tweens.killTweensOf(container);
      container.setScale(0.3);
      scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 280, ease: 'Back.out' });
    },
    reset() {
      sprite.clearTint();
      scene.tweens.killTweensOf(container);
      container.setScale(1);
      lastX = NaN;
      lastY = NaN;
    },
    destroy() {
      container.destroy();
    },
  };
}
