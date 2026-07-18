import Phaser from 'phaser';
import { COLORS } from './config/constants';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { ModeSelectScene } from './scenes/ModeSelectScene';
import { SelectScene } from './scenes/SelectScene';
import { GameScene } from './scenes/GameScene';
import { SoccerScene } from './scenes/SoccerScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: COLORS.background,
  // RESIZE : le canvas remplit l'écran (ordi et tablette) et suit les rotations.
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },
  render: {
    antialias: true,
    roundPixels: false,
  },
  scene: [BootScene, MenuScene, ModeSelectScene, SelectScene, GameScene, SoccerScene, GameOverScene],
};

const game = new Phaser.Game(config);

// En développement uniquement : on expose l'instance pour les tests headless
// (pilotage des scènes). Jamais exposé dans le build de production.
if (import.meta.env.DEV) {
  (window as unknown as { __NYXT__: Phaser.Game }).__NYXT__ = game;
}

// Service worker (production uniquement) : app installable (PWA) + hors-ligne.
// Enregistré en relatif → fonctionne à la racine (prod) comme dans /qa/.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
