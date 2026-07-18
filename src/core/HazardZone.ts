import Phaser from 'phaser';

export interface HazardOptions {
  radius: number;
  ownerId: string;
  durationMs: number;
  color: number;
  /** Dégâts directs par seconde dans la zone (0 = aucun). */
  dps?: number;
  /** Ralentissement dans la zone (< 1) et durée de rafraîchissement (ms). */
  slowFactor?: number;
  slowMs?: number;
  /** Poison (re)appliqué dans la zone : durée (ms) + dégâts/seconde (persiste hors zone). */
  poisonMs?: number;
  poisonDps?: number;
  /** Les dégâts directs chargent-ils l'ult du propriétaire ? (potion oui, aura non) */
  chargesUlt?: boolean;
}

/**
 * Zone d'effet persistante au sol : flaque de potion (dégâts de zone) ou aura de
 * poison (ralentit + empoisonne). La scène applique les effets aux combattants à
 * l'intérieur ; la zone se dissipe après sa durée de vie.
 */
export class HazardZone {
  x: number;
  y: number;
  readonly radius: number;
  readonly ownerId: string;
  readonly dps: number;
  readonly slowFactor: number;
  readonly slowMs: number;
  readonly poisonMs: number;
  readonly poisonDps: number;
  readonly chargesUlt: boolean;
  remainingMs: number;
  alive = true;

  private readonly sprite: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: HazardOptions) {
    this.x = x;
    this.y = y;
    this.radius = opts.radius;
    this.ownerId = opts.ownerId;
    this.dps = opts.dps ?? 0;
    this.slowFactor = opts.slowFactor ?? 1;
    this.slowMs = opts.slowMs ?? 0;
    this.poisonMs = opts.poisonMs ?? 0;
    this.poisonDps = opts.poisonDps ?? 0;
    this.chargesUlt = opts.chargesUlt ?? false;
    this.remainingMs = opts.durationMs;

    this.sprite = scene.add.circle(x, y, opts.radius, opts.color, 0.24).setStrokeStyle(3, opts.color, 0.75).setDepth(11);
    // Pulsation « toxique » douce.
    scene.tweens.add({
      targets: this.sprite,
      alpha: 0.6,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  update(dtMs: number): void {
    this.remainingMs -= dtMs;
    if (this.remainingMs <= 0) {
      this.alive = false;
      return;
    }
    // Rétrécissement sur la dernière demi-seconde pour signaler la dissipation.
    if (this.remainingMs < 500) {
      this.sprite.setScale(Math.max(0.1, this.remainingMs / 500));
    }
  }

  contains(px: number, py: number, pr: number): boolean {
    return Math.hypot(px - this.x, py - this.y) <= this.radius + pr;
  }

  destroy(): void {
    this.alive = false;
    this.sprite.destroy();
  }
}
