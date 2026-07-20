import Phaser from 'phaser';
import { ZAREKS } from '../zareks/registry';
import { PROPS } from '../render/props';

/**
 * Scène de démarrage. La plupart des visuels sont générés (vectoriel), donc pas
 * grand-chose à précharger — sauf les Zareks passés en rendu sprite (voir le
 * champ `sprite` de `ZarekDef`, produit par le skill `sprite-bake`) et les
 * éléments de décor bakés (`PROPS`) : ces images doivent être en mémoire avant
 * la 1ʳᵉ frame de jeu.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    for (const z of ZAREKS) {
      const s = z.sprite;
      if (!s) continue;
      this.load.spritesheet(s.idle.key, `sprites/${z.id}/idle.png`, { frameWidth: 256, frameHeight: 256 });
      this.load.spritesheet(s.walk.key, `sprites/${z.id}/walk.png`, { frameWidth: 256, frameHeight: 256 });
    }
    for (const p of PROPS) this.load.image(p.key, `props/${p.file}`);
    // Gemme de cube de puissance : sheet de 16 frames (une par angle de
    // rotation), baké en primitive (octaèdre) — jouées en boucle, ça mime un
    // vrai tour sur elle-même en 3D plutôt qu'une simple rotation 2D à plat.
    this.load.spritesheet('power_gem', 'props/powergem.png', { frameWidth: 128, frameHeight: 128 });
  }

  create(): void {
    if (!this.anims.exists('power_gem_spin')) {
      this.anims.create({ key: 'power_gem_spin', frames: this.anims.generateFrameNumbers('power_gem', { start: 0, end: 15 }), frameRate: 14, repeat: -1 });
    }
    this.scene.start('Menu');
  }
}
