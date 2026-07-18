import Phaser from 'phaser';

/**
 * Scène de démarrage. Le jeu utilise des visuels générés (placeholder), donc
 * aucun asset à précharger pour l'instant — on enchaîne directement sur le menu.
 * (C'est ici qu'on préchargerait sprites/sons quand l'art final arrivera.)
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.scene.start('Menu');
  }
}
