import Phaser from 'phaser';
import { COLORS } from '../config/constants';

export interface Button {
  container: Phaser.GameObjects.Container;
  setPosition(x: number, y: number): void;
}

/** Bouton cliquable réutilisable (fond arrondi + libellé, effet de survol). */
export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  onClick: () => void,
  color = 0x6a4dff,
): Button {
  const bg = scene.add.rectangle(0, 0, w, h, color, 0.9).setStrokeStyle(3, 0xffffff, 0.5);
  const txt = scene.add
    .text(0, 0, label, { fontFamily: 'system-ui, sans-serif', fontSize: `${Math.round(h * 0.42)}px`, color: '#ffffff', fontStyle: 'bold' })
    .setOrigin(0.5);
  const container = scene.add.container(x, y, [bg, txt]);
  container.setSize(w, h);
  container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);
  container.on('pointerover', () => bg.setFillStyle(color, 1).setScale(1.04));
  container.on('pointerout', () => bg.setFillStyle(color, 0.9).setScale(1));
  container.on('pointerdown', () => {
    bg.setScale(0.97);
  });
  container.on('pointerup', () => {
    bg.setScale(1.04);
    onClick();
  });
  return {
    container,
    setPosition: (nx, ny) => container.setPosition(nx, ny),
  };
}

/** Fond dégradé nocturne + quelques « étoiles » pour l'ambiance Nyxt. */
export function nightBackground(scene: Phaser.Scene): void {
  const w = scene.scale.width;
  const h = scene.scale.height;
  scene.add.rectangle(0, 0, w * 2, h * 2, COLORS.background).setOrigin(0.5).setScrollFactor(0).setDepth(-100).setPosition(w / 2, h / 2);
  const stars = scene.add.graphics().setScrollFactor(0).setDepth(-99);
  let seed = 1337;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) % 1000) / 1000;
  };
  for (let i = 0; i < 90; i++) {
    const sx = rand() * w;
    const sy = rand() * h;
    const r = rand() * 1.6 + 0.4;
    stars.fillStyle(0xffffff, rand() * 0.5 + 0.2);
    stars.fillCircle(sx, sy, r);
  }
}
