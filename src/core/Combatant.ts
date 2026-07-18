import Phaser from 'phaser';
import type { ZarekDef } from './types';
import { COLORS } from '../config/constants';
import { POWER_CUBE } from '../config/constants';

/**
 * Un combattant : joueur ou NPC. Contient l'ÉTAT de simulation (position, PV,
 * charge d'ultimate…) et son rendu Phaser (corps, canon, barre de vie, nom).
 *
 * L'état est volontairement séparé des périphériques d'entrée : un combattant
 * est mis à jour via un `InputState` fourni de l'extérieur (voir types.ts).
 */
export class Combatant {
  readonly id: string;
  readonly def: ZarekDef;
  readonly isPlayer: boolean;

  x: number;
  y: number;
  aimAngle = 0;

  health: number;
  cubes = 0;
  alive = true;

  /** Recharge d'attaque restante (ms). */
  reloadTimer = 0;
  /** Charge d'ultimate, 0 → 100. */
  ultCharge = 0;
  /** Ralentissement actif restant (ms) et facteur de vitesse pendant celui-ci. */
  slowTimer = 0;
  slowFactor = 1;
  /** Vitesse de recul (knockback) en cours, décroît avec le temps. */
  kbX = 0;
  kbY = 0;
  /** Vrai si le centre du combattant est dans un buisson (caché). */
  inBush = false;

  private readonly container: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Arc;
  private readonly barrel: Phaser.GameObjects.Rectangle;
  private readonly hpBack: Phaser.GameObjects.Rectangle;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly cubeText: Phaser.GameObjects.Text;

  private static readonly BAR_W = 60;

  constructor(scene: Phaser.Scene, id: string, def: ZarekDef, isPlayer: boolean, x: number, y: number) {
    this.id = id;
    this.def = def;
    this.isPlayer = isPlayer;
    this.x = x;
    this.y = y;
    this.health = def.maxHealth;

    const r = def.radius;
    this.body = scene.add.circle(0, 0, r, def.color).setStrokeStyle(isPlayer ? 5 : 3, isPlayer ? COLORS.playerAccent : def.accent);

    // « Canon » : rectangle qui pointe dans la direction de visée (origine à la base).
    this.barrel = scene.add.rectangle(0, 0, r + 16, 8, def.accent).setOrigin(0, 0.5);

    this.hpBack = scene.add
      .rectangle(-Combatant.BAR_W / 2, -(r + 20), Combatant.BAR_W, 8, COLORS.healthBack)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x000000, 0.6);
    this.hpFill = scene.add
      .rectangle(-Combatant.BAR_W / 2, -(r + 20), Combatant.BAR_W, 8, COLORS.healthGood)
      .setOrigin(0, 0.5);

    this.cubeText = scene.add
      .text(0, -(r + 34), '', { fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#66e0ff', fontStyle: 'bold' })
      .setOrigin(0.5, 1);

    const label = scene.add
      .text(0, r + 6, isPlayer ? 'TOI' : def.name, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: isPlayer ? '15px' : '12px',
        color: isPlayer ? '#ffe066' : '#cfcfe6',
        fontStyle: isPlayer ? 'bold' : 'normal',
      })
      .setOrigin(0.5, 0);

    this.container = scene.add.container(x, y, [
      this.barrel,
      this.body,
      this.hpBack,
      this.hpFill,
      this.cubeText,
      label,
    ]);
    // Le joueur est rendu au-dessus des NPC.
    this.container.setDepth(isPlayer ? 20 : 15);
  }

  get maxHealth(): number {
    return Math.round(this.def.maxHealth * (1 + POWER_CUBE.bonusPerCube * this.cubes));
  }

  get damageMult(): number {
    return 1 + POWER_CUBE.bonusPerCube * this.cubes;
  }

  get speed(): number {
    return this.def.moveSpeed * (this.slowTimer > 0 ? this.slowFactor : 1);
  }

  get healthRatio(): number {
    return Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
  }

  /** Applique des dégâts. Renvoie les dégâts réellement infligés (pour la charge d'ultimate). */
  takeDamage(amount: number): number {
    if (!this.alive) return 0;
    const before = this.health;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) this.alive = false;
    return before - this.health;
  }

  addUltCharge(damageDealt: number): void {
    this.ultCharge = Phaser.Math.Clamp(this.ultCharge + damageDealt * this.def.ultChargePerDamage, 0, 100);
  }

  get ultReady(): boolean {
    return this.ultCharge >= 100;
  }

  consumeUlt(): void {
    this.ultCharge = 0;
  }

  applySlow(ms: number, factor: number): void {
    if (ms <= 0) return;
    this.slowTimer = Math.max(this.slowTimer, ms);
    this.slowFactor = factor;
  }

  applyKnockback(dirX: number, dirY: number, force: number): void {
    this.kbX += dirX * force;
    this.kbY += dirY * force;
  }

  /** Ramasse un cube de power-up : augmente PV max + dégâts, et soigne un peu. */
  pickCube(): void {
    const beforeMax = this.maxHealth;
    this.cubes += 1;
    const gained = this.maxHealth - beforeMax;
    this.health = Math.min(this.maxHealth, this.health + gained + beforeMax * 0.05);
  }

  tickTimers(dtMs: number): void {
    if (this.reloadTimer > 0) this.reloadTimer -= dtMs;
    if (this.slowTimer > 0) this.slowTimer -= dtMs;
  }

  /** Met à jour l'affichage à partir de l'état. */
  syncDisplay(): void {
    this.container.setPosition(this.x, this.y);
    this.barrel.setRotation(this.aimAngle);

    this.hpFill.width = Combatant.BAR_W * this.healthRatio;
    this.hpFill.fillColor = this.healthRatio > 0.35 ? COLORS.healthGood : COLORS.healthLow;

    this.cubeText.setText(this.cubes > 0 ? `◆${this.cubes}` : '');

    // Rendu « caché dans un buisson » : le joueur reste bien visible, les NPC s'estompent.
    const hidden = this.inBush;
    const alpha = hidden ? (this.isPlayer ? 0.6 : 0.28) : 1;
    this.container.setAlpha(alpha);
  }

  destroy(): void {
    this.container.destroy();
  }
}
