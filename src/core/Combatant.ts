import Phaser from 'phaser';
import type { ZarekDef } from './types';
import { COLORS } from '../config/constants';
import { POWER_CUBE, REGEN } from '../config/constants';

/**
 * Un combattant : joueur ou NPC. Contient l'ÉTAT de simulation (position, PV,
 * charge d'ultimate…) et son rendu Phaser (corps « cartoon », yeux, barre de
 * vie, nom).
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

  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly ultGlow: Phaser.GameObjects.Arc;
  private readonly body: Phaser.GameObjects.Arc;
  private readonly barrel: Phaser.GameObjects.Rectangle;
  private readonly highlight: Phaser.GameObjects.Arc;
  private readonly eyeL: Phaser.GameObjects.Arc;
  private readonly eyeR: Phaser.GameObjects.Arc;
  private readonly pupilL: Phaser.GameObjects.Arc;
  private readonly pupilR: Phaser.GameObjects.Arc;
  /** Accessoire d'identité (casque, lunettes, gemme…) qui tourne avec la visée. */
  private readonly accessory: Phaser.GameObjects.Container;
  private readonly hpBack: Phaser.GameObjects.Rectangle;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly cubeText: Phaser.GameObjects.Text;

  /** Suivi de la vie pour déclencher un flash « touché ». */
  private lastHealth: number;
  /** Compte à rebours (en frames) du flash blanc de dégât. */
  private flashTimer = 0;

  private static readonly BAR_W = 60;
  private static readonly EYE_DARK = 0x14102a;

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

    this.scene = scene;
    const r = def.radius;

    // Ombre portée douce : donne du volume et « décolle » le perso du sol.
    this.shadow = scene.add.ellipse(0, r * 0.82, r * 1.95, r * 0.82, 0x000000, 0.22);

    // Halo « ultime prêt » : anneau qui irradie doucement (pulsation, pas
    // stroboscope), affiché quand l'ult est chargé. Visible aussi sur les NPC.
    this.ultGlow = scene.add.circle(0, 0, r + 8, COLORS.ultReady, 0).setStrokeStyle(4, COLORS.ultReady, 0.9).setVisible(false);
    scene.tweens.add({
      targets: this.ultGlow,
      scale: 1.45,
      alpha: 0.15,
      duration: 720,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    // « Canon » : petit indicateur qui pointe dans la direction de visée
    // (derrière le corps, comme une arme qui dépasse).
    this.barrel = scene.add.rectangle(0, 0, r + 14, 7, def.accent).setOrigin(0, 0.5);

    // Corps : contour ÉPAIS (look cartoon). Anneau jaune pour le joueur, couleur
    // d'équipe (bleu/rouge) pour les bots en mode équipe — anneau plus épais alors.
    const strokeColor = isPlayer ? COLORS.playerAccent : teamColor ?? def.accent;
    const strokeWidth = isPlayer ? 7 : teamColor !== undefined ? 6 : 5;
    this.body = scene.add.circle(0, 0, r, def.color).setStrokeStyle(strokeWidth, strokeColor);

    // Reflet brillant en haut à gauche (effet « lustré »).
    this.highlight = scene.add.circle(-r * 0.3, -r * 0.36, r * 0.4, COLORS.white, 0.2);

    // Yeux : le perso « regarde » là où il vise. Très lisible et sympathique.
    this.eyeL = scene.add.circle(0, 0, r * 0.28, COLORS.white, 1).setStrokeStyle(2, Combatant.EYE_DARK, 0.5);
    this.eyeR = scene.add.circle(0, 0, r * 0.28, COLORS.white, 1).setStrokeStyle(2, Combatant.EYE_DARK, 0.5);
    this.pupilL = scene.add.circle(0, 0, r * 0.14, Combatant.EYE_DARK, 1);
    this.pupilR = scene.add.circle(0, 0, r * 0.14, Combatant.EYE_DARK, 1);

    // « Face gear » propre au rôle (identité visuelle par-delà la couleur).
    this.accessory = this.buildAccessory(scene, r);

    this.hpBack = scene.add
      .rectangle(-Combatant.BAR_W / 2, -(r + 22), Combatant.BAR_W, 9, COLORS.healthBack)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x000000, 0.7);
    this.hpFill = scene.add
      .rectangle(-Combatant.BAR_W / 2, -(r + 22), Combatant.BAR_W, 9, COLORS.healthGood)
      .setOrigin(0, 0.5);

    this.cubeText = scene.add
      .text(0, -(r + 36), '', { fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#66e0ff', fontStyle: 'bold' })
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
      this.shadow,
      this.ultGlow,
      this.barrel,
      this.body,
      this.highlight,
      this.eyeL,
      this.eyeR,
      this.pupilL,
      this.pupilR,
      this.accessory,
      this.hpBack,
      this.hpFill,
      this.cubeText,
      label,
    ]);
    // Le joueur est rendu au-dessus des NPC.
    this.container.setDepth(isPlayer ? 20 : 15);
  }

  /**
   * Construit l'accessoire de tête selon le RÔLE (repère lisible : casque =
   * tank, lunettes = tireur, gemme = mage…). Repère local : +x vers l'avant
   * (visée), +y en travers du visage — les « barres » sont donc fines en x.
   */
  private buildAccessory(scene: Phaser.Scene, r: number): Phaser.GameObjects.Container {
    const acc = this.def.accent;
    const DARK = 0x191932;
    const parts: Phaser.GameObjects.GameObject[] = [];
    switch (this.def.role) {
      case 'tank': // casque : large visière sombre + liseré accent
        parts.push(scene.add.rectangle(0, 0, r * 0.3, r * 1.2, DARK).setStrokeStyle(2, acc, 0.9));
        break;
      case 'sharpshooter': // lunettes de visée : barre accent + deux verres
        parts.push(scene.add.rectangle(0, 0, r * 0.22, r * 1.1, acc));
        parts.push(scene.add.circle(0, r * 0.34, r * 0.12, DARK, 0.9));
        parts.push(scene.add.circle(0, -r * 0.34, r * 0.12, DARK, 0.9));
        break;
      case 'mage': // gemme au front (losange accent)
        parts.push(scene.add.rectangle(0, 0, r * 0.44, r * 0.44, acc).setStrokeStyle(2, DARK, 0.8).setRotation(Math.PI / 4));
        break;
      case 'assassin': // bandeau/masque sombre
        parts.push(scene.add.rectangle(0, 0, r * 0.3, r * 1.3, DARK));
        break;
      default: // support & autres : petite croix accent
        parts.push(scene.add.rectangle(0, 0, r * 0.16, r * 0.5, acc));
        parts.push(scene.add.rectangle(0, 0, r * 0.5, r * 0.16, acc));
    }
    return scene.add.container(0, 0, parts);
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

  /** Flash blanc + petit écrasement quand le combattant encaisse un coup. */
  private triggerHitFlash(): void {
    this.body.setFillStyle(COLORS.white);
    this.flashTimer = 6;
    this.scene.tweens.killTweensOf(this.container);
    this.container.setScale(1);
    this.scene.tweens.add({ targets: this.container, scaleX: 1.16, scaleY: 0.84, duration: 80, yoyo: true, ease: 'Quad.out' });
  }

  /**
   * Met à jour l'affichage. `revealedToPlayer` indique si ce combattant est
   * visible du point de vue du joueur (calculé par la scène).
   */
  syncDisplay(revealedToPlayer: boolean): void {
    this.container.setPosition(this.x, this.y);
    this.barrel.setRotation(this.aimAngle);

    // Yeux orientés vers la visée (le perso regarde là où il vise).
    const r = this.def.radius;
    const ax = Math.cos(this.aimAngle);
    const ay = Math.sin(this.aimAngle);
    const px = -ay;
    const py = ax;
    const fwd = r * 0.26;
    const spread = r * 0.4;
    const lx = ax * fwd + px * spread;
    const ly = ay * fwd + py * spread;
    const rx = ax * fwd - px * spread;
    const ry = ay * fwd - py * spread;
    this.eyeL.setPosition(lx, ly);
    this.eyeR.setPosition(rx, ry);
    this.pupilL.setPosition(lx + ax * r * 0.12, ly + ay * r * 0.12);
    this.pupilR.setPosition(rx + ax * r * 0.12, ry + ay * r * 0.12);
    // Accessoire au « front » : posé vers l'avant et tourné dans l'axe de visée.
    this.accessory.setPosition(ax * r * 0.42, ay * r * 0.42).setRotation(this.aimAngle);

    // Flash « touché » (déclenché dès que la vie baisse).
    if (this.health < this.lastHealth) this.triggerHitFlash();
    this.lastHealth = this.health;
    if (this.flashTimer > 0) {
      this.flashTimer -= 1;
      if (this.flashTimer === 0) this.body.setFillStyle(this.def.color);
    }

    this.hpFill.width = Combatant.BAR_W * this.healthRatio;
    this.hpFill.fillColor = this.healthRatio > 0.35 ? COLORS.healthGood : COLORS.healthLow;

    this.cubeText.setText(this.cubes > 0 ? `◆${this.cubes}` : '');
    this.ultGlow.setVisible(this.ultReady && this.alive);

    // Furtivité symétrique : un ennemi dans un buisson est INVISIBLE pour le
    // joueur tant qu'il n'est pas révélé (de près) — comme le joueur l'est pour
    // les bots. Le joueur se voit toujours, juste estompé quand il est caché.
    if (this.isPlayer) {
      this.container.setVisible(true).setAlpha(this.inBush ? 0.55 : 1);
    } else if (this.inBush && !revealedToPlayer) {
      this.container.setVisible(false);
    } else {
      this.container.setVisible(true).setAlpha(this.inBush ? 0.5 : 1);
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
    this.flashTimer = 0;
    this.body.setFillStyle(this.def.color);
    this.scene.tweens.killTweensOf(this.container);
    this.container.setScale(1);
    this.container.setPosition(x, y);
  }

  /** Masque le combattant (pendant l'attente de réapparition). */
  hide(): void {
    this.container.setVisible(false);
  }

  /** Réapparition après élimination : PV pleins, ult remis à zéro, visible. */
  revive(x: number, y: number): void {
    this.alive = true;
    this.ultCharge = 0;
    this.placeAt(x, y, true);
    this.container.setVisible(true).setAlpha(1);
  }

  destroy(): void {
    this.container.destroy();
  }
}
