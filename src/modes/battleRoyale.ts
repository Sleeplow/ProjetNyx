import Phaser from 'phaser';
import type { MapDef } from '../core/types';
import { COLORS, ZONE } from '../config/constants';
import { dist } from '../core/geometry';

type ZonePhase = 'wait' | 'shrinking' | 'rest' | 'final';

/**
 * Mode Battle Royale : gère la zone qui rétrécit et fournit les infos de zone.
 *
 * Pour AJOUTER UN MODE : créer une classe similaire (ex. Gem Grab, KO) exposant
 * sa propre logique. La scène de jeu appelle `update()` et lit l'état.
 */
export class BattleRoyaleMode {
  readonly centerX: number;
  readonly centerY: number;

  currentRadius: number;
  private readonly initialRadius: number;
  private readonly decrementPerStep: number;

  private phase: ZonePhase = 'wait';
  private phaseTimer = 0;
  private fromRadius: number;
  private toRadius: number;
  private step = 0;
  private pulse = 0;

  private readonly borderGfx: Phaser.GameObjects.Graphics;
  private readonly dangerGfx: Phaser.GameObjects.Graphics;
  private readonly maskShape: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, map: MapDef) {
    this.centerX = map.width / 2;
    this.centerY = map.height / 2;
    this.initialRadius = Math.hypot(map.width, map.height) / 2;
    this.currentRadius = this.initialRadius;
    this.fromRadius = this.initialRadius;
    this.toRadius = this.initialRadius;
    this.decrementPerStep = (this.initialRadius - ZONE.minRadius) / 6;

    // Zone de danger : un voile violet qui couvre toute l'arène, SAUF le cercle
    // sûr — obtenu avec un masque géométrique inversé mis à jour chaque frame.
    this.dangerGfx = scene.add.graphics().setDepth(12);
    this.dangerGfx.fillStyle(COLORS.zoneDanger, 0.42);
    this.dangerGfx.fillRect(-200, -200, map.width + 400, map.height + 400);

    this.maskShape = scene.make.graphics({});
    const mask = this.maskShape.createGeometryMask();
    mask.invertAlpha = true;
    this.dangerGfx.setMask(mask);

    this.borderGfx = scene.add.graphics().setDepth(13);
    this.redrawMask();
    this.redrawBorder();
  }

  /** Dégâts par seconde infligés hors zone (0 tant que la zone n'a pas commencé à se refermer). */
  get damagePerSecond(): number {
    if (this.phase === 'wait') return 0;
    return ZONE.baseDamagePerSecond + this.step * ZONE.damagePerSecondPerStep;
  }

  isOutside(x: number, y: number): boolean {
    return dist(x, y, this.centerX, this.centerY) > this.currentRadius;
  }

  update(dtMs: number): void {
    this.pulse += dtMs;
    switch (this.phase) {
      case 'wait':
        this.phaseTimer += dtMs;
        if (this.phaseTimer >= ZONE.startDelayMs) this.beginShrink();
        break;
      case 'shrinking': {
        this.phaseTimer += dtMs;
        const t = Phaser.Math.Clamp(this.phaseTimer / ZONE.shrinkStepMs, 0, 1);
        this.currentRadius = Phaser.Math.Linear(this.fromRadius, this.toRadius, t);
        this.redrawMask();
        if (t >= 1) {
          this.currentRadius = this.toRadius;
          this.step += 1;
          if (this.currentRadius <= ZONE.minRadius + 1) {
            this.phase = 'final';
          } else {
            this.phase = 'rest';
            this.phaseTimer = 0;
          }
        }
        break;
      }
      case 'rest':
        this.phaseTimer += dtMs;
        if (this.phaseTimer >= ZONE.restBetweenMs) this.beginShrink();
        break;
      case 'final':
        break;
    }
    this.redrawBorder();
  }

  private beginShrink(): void {
    this.phase = 'shrinking';
    this.phaseTimer = 0;
    this.fromRadius = this.currentRadius;
    this.toRadius = Math.max(ZONE.minRadius, this.currentRadius - this.decrementPerStep);
  }

  private redrawMask(): void {
    this.maskShape.clear();
    this.maskShape.fillStyle(0xffffff);
    this.maskShape.fillCircle(this.centerX, this.centerY, this.currentRadius);
  }

  private redrawBorder(): void {
    const glow = 0.55 + 0.35 * Math.sin(this.pulse / 260);
    this.borderGfx.clear();
    this.borderGfx.lineStyle(8, COLORS.zoneBorder, glow);
    this.borderGfx.strokeCircle(this.centerX, this.centerY, this.currentRadius);
    this.borderGfx.lineStyle(2, 0xffffff, glow * 0.5);
    this.borderGfx.strokeCircle(this.centerX, this.centerY, this.currentRadius - 4);
  }

  destroy(): void {
    this.borderGfx.destroy();
    this.dangerGfx.destroy();
    this.maskShape.destroy();
  }
}
