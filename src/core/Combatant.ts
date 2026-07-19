import Phaser from 'phaser';
import type { ZarekDef } from './types';
import { POWER_CUBE, REGEN } from '../config/constants';
import { createAvatarVisual, type AvatarVisual } from '../render/avatarVisual';

/**
 * Un combattant : joueur ou NPC. Contient l'ÉTAT de simulation (position, PV,
 * charge d'ultimate…) ; le rendu « cartoon » est délégué à `AvatarVisual`
 * (partagé avec l'en ligne).
 *
 * L'état est volontairement séparé des périphériques d'entrée : un combattant
 * est mis à jour via un `InputState` fourni de l'extérieur (voir types.ts).
 */
export class Combatant {
  readonly id: string;
  readonly def: ZarekDef;
  readonly isPlayer: boolean;
  /** Équipe (modes en équipe comme le foot) ; 0 par défaut. */
  team = 0;

  x: number;
  y: number;
  aimAngle = 0;
  /** Distance de visée (longueur du vecteur de visée) — sert au lancer de potion. */
  aimDist = 0;

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
  /** Temps écoulé depuis le dernier tir OU dégât subi (ms) — pilote la régén. */
  sinceCombatMs = 0;
  /** Poison actif : durée restante (ms) et dégâts/seconde. Persiste hors de l'aura. */
  poisonMs = 0;
  poisonDps = 0;

  private readonly vis: AvatarVisual;
  /** Suivi de la vie pour déclencher un flash « touché ». */
  private lastHealth: number;

  constructor(
    scene: Phaser.Scene,
    id: string,
    def: ZarekDef,
    isPlayer: boolean,
    x: number,
    y: number,
    teamColor?: number,
  ) {
    this.id = id;
    this.def = def;
    this.isPlayer = isPlayer;
    this.x = x;
    this.y = y;
    this.health = def.maxHealth;
    this.lastHealth = this.health;

    this.vis = createAvatarVisual(scene, def, { isSelf: isPlayer, teamColor, label: isPlayer ? 'TOI' : def.name });
    this.vis.container.setPosition(x, y).setDepth(isPlayer ? 20 : 15);
    this.vis.popIn();
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
    if (amount > 0) this.sinceCombatMs = 0; // subir des dégâts interrompt la régén
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

  applyPoison(ms: number, dps: number): void {
    if (ms <= 0) return;
    this.poisonMs = Math.max(this.poisonMs, ms);
    this.poisonDps = Math.max(this.poisonDps, dps);
  }

  /** Inflige les dégâts de poison de la frame (le poison perdure hors de l'aura). */
  tickPoison(dtMs: number): void {
    if (this.poisonMs <= 0) return;
    this.takeDamage(this.poisonDps * (dtMs / 1000));
    this.poisonMs -= dtMs;
    if (this.poisonMs <= 0) this.poisonDps = 0;
  }

  applyKnockback(dirX: number, dirY: number, force: number): void {
    this.kbX += dirX * force;
    this.kbY += dirY * force;
  }

  /**
   * Ramasse un cube : augmente PV max + dégâts, avec seulement un PETIT soin
   * (pas un remplissage complet). Il faut se régénérer (hors combat) pour
   * combler le reste jusqu'au nouveau max (ex. 1000/1000 + cube → ~1030/1200).
   */
  pickCube(): void {
    const beforeMax = this.maxHealth;
    this.cubes += 1;
    const gained = this.maxHealth - beforeMax;
    this.health = Math.min(this.maxHealth, this.health + gained * 0.35);
  }

  tickTimers(dtMs: number): void {
    if (this.reloadTimer > 0) this.reloadTimer -= dtMs;
    if (this.slowTimer > 0) this.slowTimer -= dtMs;
    this.sinceCombatMs += dtMs;
  }

  /** À appeler quand le combattant tire : ça interrompt la régén. */
  noteAttack(): void {
    this.sinceCombatMs = 0;
  }

  /** Régénère un peu de vie si le combattant est resté hors combat assez longtemps. */
  regenerate(dtMs: number): void {
    if (!this.alive || this.sinceCombatMs < REGEN.delayMs || this.health >= this.maxHealth) return;
    this.health = Math.min(this.maxHealth, this.health + this.maxHealth * REGEN.percentPerSecond * (dtMs / 1000));
  }

  /**
   * Met à jour l'affichage. `revealedToPlayer` indique si ce combattant est
   * visible du point de vue du joueur (calculé par la scène).
   */
  syncDisplay(revealedToPlayer: boolean): void {
    this.vis.container.setPosition(this.x, this.y);
    this.vis.setAim(this.aimAngle);

    // Flash « touché » (déclenché dès que la vie baisse).
    if (this.health < this.lastHealth) this.vis.flashHit();
    this.lastHealth = this.health;

    this.vis.setHealth(this.healthRatio);
    this.vis.setCubes(this.cubes);
    this.vis.setUltReady(this.ultReady && this.alive);

    // Furtivité symétrique : un ennemi dans un buisson est INVISIBLE pour le
    // joueur tant qu'il n'est pas révélé (de près) — comme le joueur l'est pour
    // les bots. Le joueur se voit toujours, juste estompé quand il est caché.
    if (this.isPlayer) {
      this.vis.container.setVisible(true).setAlpha(this.inBush ? 0.55 : 1);
    } else if (this.inBush && !revealedToPlayer) {
      this.vis.container.setVisible(false);
    } else {
      this.vis.container.setVisible(true).setAlpha(this.inBush ? 0.5 : 1);
    }
  }

  /** Replace le combattant (engagement de foot) : soigne et purge les altérations. */
  placeAt(x: number, y: number, fullHeal = true): void {
    this.x = x;
    this.y = y;
    if (fullHeal) this.health = this.maxHealth;
    this.slowTimer = 0;
    this.slowFactor = 1;
    this.poisonMs = 0;
    this.poisonDps = 0;
    this.kbX = 0;
    this.kbY = 0;
    this.reloadTimer = 0;
    this.sinceCombatMs = REGEN.delayMs;
    this.lastHealth = this.health;
    this.vis.reset();
    this.vis.container.setPosition(x, y);
  }

  /** Masque le combattant (pendant l'attente de réapparition). */
  hide(): void {
    this.vis.container.setVisible(false);
  }

  /** Réapparition après élimination : PV pleins, ult remis à zéro, visible. */
  revive(x: number, y: number): void {
    this.alive = true;
    this.ultCharge = 0;
    this.placeAt(x, y, true);
    this.vis.container.setVisible(true).setAlpha(1);
    this.vis.popIn();
  }

  destroy(): void {
    this.vis.destroy();
  }
}
