/**
 * Neurotoxine (tension du tableau « Portal »).
 *
 * Remplace la zone qui rétrécit de la Battle Royale classique. La grande salle
 * (« main ») se remplit progressivement de neurotoxine (dégâts croissants) ;
 * la deuxième pièce (« refuge ») reste sûre… jusqu'à la phase finale où elle se
 * remplit à son tour pour forcer le dénouement.
 *
 * Logique pure (aucun Phaser) : réutilisable côté serveur en ligne.
 */

export interface NeuroConfig {
  /** Répit initial sans gaz (ms). */
  graceMs: number;
  /** Dégâts/s de base dans la grande salle dès la fin du répit. */
  mainBaseDps: number;
  /** Dégâts/s ajoutés par seconde écoulée (montée en tension). */
  mainSlope: number;
  /** Temps écoulé (ms) à partir duquel le refuge se remplit aussi. */
  finalMs: number;
  /** Dégâts/s de base dans le refuge une fois la phase finale entamée. */
  refugeBaseDps: number;
  refugeSlope: number;
  /** Frontière : x ≥ refugeMinX ⇒ on est dans le refuge. */
  refugeMinX: number;
}

export type NeuroPhase = 'grace' | 'flooding' | 'final';

export class NeurotoxinField {
  elapsed = 0;

  constructor(private readonly cfg: NeuroConfig) {}

  update(dtMs: number): void {
    this.elapsed += dtMs;
  }

  /** Le gaz a-t-il commencé (grande salle) ? */
  get active(): boolean {
    return this.elapsed >= this.cfg.graceMs;
  }

  get phase(): NeuroPhase {
    if (this.elapsed < this.cfg.graceMs) return 'grace';
    if (this.elapsed < this.cfg.finalMs) return 'flooding';
    return 'final';
  }

  isRefuge(x: number): boolean {
    return x >= this.cfg.refugeMinX;
  }

  /** Dégâts/s actuels dans la grande salle. */
  get mainDps(): number {
    const t = (this.elapsed - this.cfg.graceMs) / 1000;
    if (t <= 0) return 0;
    return this.cfg.mainBaseDps + this.cfg.mainSlope * t;
  }

  /** Dégâts/s actuels dans le refuge (0 tant que la phase finale n'a pas commencé). */
  get refugeDps(): number {
    const t = (this.elapsed - this.cfg.finalMs) / 1000;
    if (t <= 0) return 0;
    return this.cfg.refugeBaseDps + this.cfg.refugeSlope * t;
  }

  /** Dégâts/s subis à une position donnée. */
  dpsAt(x: number, _y: number): number {
    return this.isRefuge(x) ? this.refugeDps : this.mainDps;
  }

  isDanger(x: number, y: number): boolean {
    return this.dpsAt(x, y) > 0;
  }
}
