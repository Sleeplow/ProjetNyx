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
  const pad = 14;
  const bg = scene.add.rectangle(0, 0, w, h, color, 0.92).setStrokeStyle(3, 0xffffff, 0.55);
  const txt = scene.add
    .text(0, 0, label, { fontFamily: 'system-ui, sans-serif', fontSize: `${Math.round(h * 0.42)}px`, color: '#ffffff', fontStyle: 'bold' })
    .setOrigin(0.5);
  const container = scene.add.container(x, y, [bg, txt]);
  // Zone cliquable FIXE et un peu plus large que le visuel (marge de tolérance).
  // On ne fait AUCUN scale sur le bouton : sinon son bord « bouge » sous le
  // curseur et l'état survol/actif se met à clignoter près du rebord.
  const hitW = w + pad * 2;
  const hitH = h + pad * 2;
  container.setSize(hitW, hitH);
  container.setInteractive({
    hitArea: new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH),
    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    useHandCursor: true,
  });
  const normal = () => bg.setFillStyle(color, 0.92).setStrokeStyle(3, 0xffffff, 0.55);
  const hover = () => bg.setFillStyle(color, 1).setStrokeStyle(3, 0xffffff, 0.9);
  const press = () => bg.setFillStyle(color, 0.78).setStrokeStyle(4, 0xffffff, 1);
  container.on('pointerover', hover);
  container.on('pointerout', normal);
  container.on('pointerdown', press);
  container.on('pointerup', () => {
    hover();
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
