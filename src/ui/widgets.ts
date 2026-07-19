import Phaser from 'phaser';

export interface Button {
  container: Phaser.GameObjects.Container;
  setPosition(x: number, y: number): void;
  /** Fixe le facteur de défilement du VISUEL ET de la zone cliquable (doivent rester alignés). */
  setScrollFactor(value: number): void;
  destroy(): void;
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
    setScrollFactor: (value) => {
      container.setScrollFactor(value);
      zone.setScrollFactor(value);
    },
    destroy: () => {
      container.destroy();
      zone.destroy();
    },
  };
}

/**
 * Fond nocturne « Nyxt » ANIMÉ, commun à tous les menus (accueil, sélection de
 * mode / Zarek, en ligne) pour une ambiance cohérente : dégradé violet, étoiles
 * qui scintillent, halos colorés qui dérivent doucement. Volontairement discret
 * (faibles opacités) pour ne pas gêner la lecture des options par-dessus.
 */
export function nightBackground(scene: Phaser.Scene): void {
  const w = scene.scale.width;
  const h = scene.scale.height;

  const g = scene.add.graphics().setScrollFactor(0).setDepth(-100);
  g.fillGradientStyle(0x241a5c, 0x241a5c, 0x080610, 0x080610, 1);
  g.fillRect(0, 0, w, h);

  for (let i = 0; i < 52; i++) {
    const star = scene.add
      .circle(Math.random() * w, Math.random() * h * 0.95, Math.random() * 1.8 + 0.6, 0xffffff, Math.random() * 0.5 + 0.3)
      .setScrollFactor(0)
      .setDepth(-95);
    scene.tweens.add({ targets: star, alpha: 0.08, duration: 900 + Math.random() * 1700, yoyo: true, repeat: -1, delay: Math.random() * 1600, ease: 'Sine.inOut' });
  }

  const orbColors = [0x6a4dff, 0x2f8f5a, 0x8a5cff];
  for (let i = 0; i < 3; i++) {
    const ox = w * (0.22 + 0.28 * i);
    const oy = h * (0.32 + 0.22 * (i % 2));
    const orb = scene.add.circle(ox, oy, 150 + i * 40, orbColors[i], 0.09).setScrollFactor(0).setDepth(-92);
    scene.tweens.add({ targets: orb, x: ox + (Math.random() * 120 - 60), y: oy + (Math.random() * 120 - 60), alpha: 0.15, duration: 4200 + i * 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }
}
