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
  const pad = 22;
  const bg = scene.add.rectangle(0, 0, w, h, color, 0.92).setStrokeStyle(3, 0xffffff, 0.55);
  const txt = scene.add
    .text(0, 0, label, { fontFamily: 'system-ui, sans-serif', fontSize: `${Math.round(h * 0.42)}px`, color: '#ffffff', fontStyle: 'bold' })
    .setOrigin(0.5);
  const container = scene.add.container(x, y, [bg, txt]);

  const normal = () => bg.setFillStyle(color, 0.92).setStrokeStyle(3, 0xffffff, 0.55);
  const hover = () => bg.setFillStyle(color, 1).setStrokeStyle(3, 0xffffff, 0.9);
  const press = () => bg.setFillStyle(color, 0.78).setStrokeStyle(4, 0xffffff, 1);

  // Une ZONE d'interaction dédiée (rectangle invisible un peu plus large que le
  // visuel) porte les entrées. Le hit-test d'un Container interactif s'est révélé
  // peu fiable (des taps hors zone étaient attribués au mauvais bouton) ; une
  // Zone a une taille intrinsèque et un hit-test rectangulaire exact.
  const zone = scene.add.zone(x, y, w + pad * 2, h + pad * 2).setInteractive({ useHandCursor: true });

  // « armed » : le bouton ne se déclenche QUE si l'appui (pointerdown) a commencé
  // DESSUS — le point d'appui fait foi. Glisser hors du bouton annule. Ça évite
  // qu'un bouton voisin capte le relâchement (ex. REJOUER qui menait au menu).
  let armed = false;
  zone.on('pointerover', () => {
    if (!armed) hover();
  });
  zone.on('pointerout', () => {
    armed = false;
    normal();
  });
  zone.on('pointerdown', () => {
    armed = true;
    press();
  });
  zone.on('pointerup', () => {
    if (!armed) return;
    armed = false;
    hover();
    onClick();
  });
  zone.on('pointerupoutside', () => {
    armed = false;
    normal();
  });
  return {
    container,
    setPosition: (nx, ny) => {
      container.setPosition(nx, ny);
      zone.setPosition(nx, ny);
    },
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
