import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { music } from '../audio/music';
import { safeInsets } from './layout';

export interface Button {
  container: Phaser.GameObjects.Container;
  setPosition(x: number, y: number): void;
  /** Fixe le facteur de défilement du VISUEL ET de la zone cliquable (doivent rester alignés). */
  setScrollFactor(value: number): void;
  /** Fixe la profondeur du VISUEL ET de la zone cliquable — sinon un autre objet
   * interactif resté à une profondeur plus haute (ex. un voile plein écran)
   * absorbe le clic avant qu'il n'atteigne le bouton (Phaser hit-teste en
   * `topOnly` par défaut, y compris pour des objets invisibles comme la zone). */
  setDepth(value: number): void;
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
    sfx.play('click');
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
    setDepth: (value) => {
      container.setDepth(value);
      zone.setDepth(value);
    },
    destroy: () => {
      container.destroy();
      zone.destroy();
    },
  };
}

/**
 * Petit lien « ‹ Quitter » (texte, coin de l'écran, `scrollFactor` 0) affiché
 * en PLEINE partie (solo comme en ligne). Un tap ouvre une confirmation
 * (voile + Quitter/Annuler) avant d'appeler `onConfirm` — un tap accidentel
 * en plein combat ne doit pas faire abandonner la partie.
 */
export function makeQuitButton(scene: Phaser.Scene, onConfirm: () => void): Phaser.GameObjects.Text {
  const confirm = (): void => {
    const w = scene.scale.width;
    const h = scene.scale.height;
    const dim = scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6).setScrollFactor(0).setDepth(2000).setInteractive();
    const msg = scene.add
      .text(w / 2, h / 2 - 50, 'Abandonner la partie ?', { fontFamily: 'system-ui, sans-serif', fontSize: '26px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2001);
    const close = (): void => {
      dim.destroy();
      msg.destroy();
      yes.destroy();
      no.destroy();
    };
    const yes = makeButton(scene, w / 2 - 90, h / 2 + 30, 160, 52, 'Quitter', () => { close(); onConfirm(); }, 0xc0392b);
    const no = makeButton(scene, w / 2 + 90, h / 2 + 30, 160, 52, 'Annuler', close, 0x3a3466);
    for (const b of [yes, no]) {
      b.setScrollFactor(0);
      b.setDepth(2001);
    }
  };
  return scene.add
    .text(0, 0, '‹ Quitter', { fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: '#d8d8ff', fontStyle: 'bold' })
    .setScrollFactor(0)
    .setDepth(1005)
    .setInteractive({ useHandCursor: true })
    .on('pointerup', confirm);
}

/**
 * Bouton ⚙ (texte, `scrollFactor` 0) qui ouvre l'écran de Configuration EN
 * SURIMPRESSION — `scene.launch` et non `start` : la scène appelante reste
 * vivante, donc on peut régler le son sans quitter une partie en cours.
 * Le caller le positionne.
 */
export function makeSettingsButton(scene: Phaser.Scene): Phaser.GameObjects.Text {
  return scene.add
    .text(0, 0, '⚙', { fontFamily: 'system-ui, sans-serif', fontSize: '24px', color: '#d8d8ff' })
    .setScrollFactor(0)
    .setDepth(1005)
    .setInteractive({ useHandCursor: true })
    .on('pointerup', () => {
      sfx.play('click');
      if (!scene.scene.isActive('Settings')) scene.scene.launch('Settings', { from: scene.scene.key });
    });
}

/** Curseur de réglage (0 → 1) : rail, remplissage, poignée et valeur en %. */
export interface Slider {
  destroy(): void;
}

/**
 * Curseur horizontal réutilisable. La valeur est mise à jour EN CONTINU pendant
 * le glissement (`onChange`) : on entend le volume bouger pendant qu'on règle,
 * ce qui est le seul moyen de régler un son « à l'oreille ».
 *
 * Le suivi du doigt/souris se fait sur la scène entière une fois la poignée
 * saisie (et non sur le rail), sinon sortir un peu du rail en glissant coupe le
 * réglage net.
 */
export function makeSlider(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  initial: number,
  onChange: (value: number) => void,
  color = 0x6a4dff,
): Slider {
  const D = 1600;
  const h = 10;
  let value = Math.min(1, Math.max(0, initial));

  const rail = scene.add.rectangle(x, y, width, h, 0x2a2350, 1).setStrokeStyle(2, 0x5a4a9a, 0.8).setScrollFactor(0).setDepth(D);
  const fill = scene.add.rectangle(x - width / 2, y, width * value, h, color, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 1);
  const knob = scene.add.circle(x - width / 2 + width * value, y, 15, 0xffffff, 1).setStrokeStyle(3, color, 1).setScrollFactor(0).setDepth(D + 2);
  const pct = scene.add
    .text(x + width / 2 + 18, y, `${Math.round(value * 100)}%`, { fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: '#d8d8ff', fontStyle: 'bold' })
    .setOrigin(0, 0.5)
    .setScrollFactor(0)
    .setDepth(D + 1);

  const apply = (v: number): void => {
    value = Math.min(1, Math.max(0, v));
    fill.width = width * value;
    knob.x = x - width / 2 + width * value;
    pct.setText(`${Math.round(value * 100)}%`);
    onChange(value);
  };
  const fromPointer = (px: number): void => apply((px - (x - width / 2)) / width);

  // Zone de saisie généreuse (hauteur d'un doigt) couvrant tout le rail : un tap
  // n'importe où saute à cette valeur, puis on peut glisser.
  const zone = scene.add.zone(x, y, width + 44, 56).setScrollFactor(0).setDepth(D).setInteractive({ useHandCursor: true });
  let dragging = false;

  const onMove = (p: Phaser.Input.Pointer): void => {
    if (dragging) fromPointer(p.x);
  };
  const onUp = (): void => {
    dragging = false;
  };
  zone.on('pointerdown', (p: Phaser.Input.Pointer) => {
    dragging = true;
    fromPointer(p.x);
  });
  scene.input.on('pointermove', onMove);
  scene.input.on('pointerup', onUp);
  scene.input.on('pointerupoutside', onUp);

  return {
    destroy: () => {
      scene.input.off('pointermove', onMove);
      scene.input.off('pointerup', onUp);
      scene.input.off('pointerupoutside', onUp);
      zone.destroy();
      rail.destroy();
      fill.destroy();
      knob.destroy();
      pct.destroy();
    },
  };
}

/**
 * Fond nocturne « Nyxt » ANIMÉ, commun à tous les menus (accueil, sélection de
 * mode / Zarek, en ligne) pour une ambiance cohérente : dégradé violet, étoiles
 * qui scintillent, halos colorés qui dérivent doucement. Volontairement discret
 * (faibles opacités) pour ne pas gêner la lecture des options par-dessus.
 */
export function nightBackground(scene: Phaser.Scene, opts?: { settingsButton?: boolean }): void {
  const w = scene.scale.width;
  const h = scene.scale.height;

  // Ce fond EST le marqueur « écran de menu » : on y accroche donc ce que tous
  // les menus doivent avoir — le thème musical de menu et l'accès ⚙ — plutôt
  // que de le répéter (et de l'oublier) dans chaque scène.
  music.play('menu');
  if (opts?.settingsButton !== false) {
    const i = safeInsets();
    makeSettingsButton(scene).setOrigin(1, 0).setPosition(w - 14 - i.right, 12 + i.top);
  }

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
