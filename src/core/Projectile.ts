import Phaser from 'phaser';
import { RockVisual } from '../render/rocks';

/**
 * Un projectile d'attaque de base. État minimal + un cercle de rendu.
 * La détection de collision est faite par la scène de jeu.
 */
export class Projectile {
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  /** Couleur du projectile — réutilisée pour les éclats à l'impact. */
  readonly color: number;
  /** Distance restante avant expiration (px). */
  distanceLeft: number;
  alive = true;
  /**
   * Si défini, ce projectile est une potion : il ne touche personne en vol et
   * crée une flaque de dégâts à l'atterrissage (portée atteinte ou obstacle).
   */
  landsInto: { radius: number; durationMs: number; dps: number } | null = null;
  /**
   * Si défini, ce projectile est une ROCHE : elle éclate à l'impact et laisse un
   * nuage de poussière ralentissant (voir `AttackDef.dust*`).
   */
  leavesDust: { radius: number; durationMs: number; slowFactor: number; slowMs: number } | null = null;

  /** Rond classique, OU caillou difforme qui tourne quand `rock` est demandé. */
  private readonly sprite?: Phaser.GameObjects.Arc;
  private readonly rock?: RockVisual;

  constructor(
    scene: Phaser.Scene,
    ownerId: string,
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    radius: number,
    range: number,
    color: number,
    /** Rendu « caillou » (Atlas) plutôt que la bille ronde par défaut. */
    rock = false,
  ) {
    this.ownerId = ownerId;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.radius = radius;
    this.distanceLeft = range;
    this.color = color;
    if (rock) {
      // Graine tirée de la position de départ : deux roches d'une même salve
      // partent de points différents → formes différentes.
      this.rock = new RockVisual(scene, x, y, radius, Math.abs(Math.round(x * 7 + y * 13)) % 97);
    } else {
      this.sprite = scene.add.circle(x, y, radius, color).setStrokeStyle(2, 0xffffff, 0.7).setDepth(18);
    }
  }

  update(dtSec: number): void {
    const stepX = this.vx * dtSec;
    const stepY = this.vy * dtSec;
    this.x += stepX;
    this.y += stepY;
    this.distanceLeft -= Math.hypot(stepX, stepY);
    if (this.distanceLeft <= 0) this.alive = false;
    this.sprite?.setPosition(this.x, this.y);
    this.rock?.update(this.x, this.y, dtSec);
  }

  kill(): void {
    this.alive = false;
  }

  destroy(): void {
    this.sprite?.destroy();
    this.rock?.destroy();
  }
}
