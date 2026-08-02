import Phaser from 'phaser';
import type { Rect } from '../core/types';
import { BUSH_KEYS, bushHideRadius, drawPropAt, pickPropKey } from './props';

/**
 * Les buissons d'une carte et leur état « enfumé » : quand une flaque de poison
 * atteint la cachette, le feuillage devient TRANSLUCIDE. Visuellement on voit
 * le poison sous les feuilles ; côté règle, le buisson ne cache plus personne
 * (voir `Combatant.concealed`) — on aperçoit les occupants en transparence,
 * comme quand on est soi-même dedans.
 *
 * Le gaz chasse les gens de leur cachette : c'est ce qui rend le poison utile
 * autrement que pour les dégâts.
 */

/** Opacité du feuillage une fois le buisson enfumé. */
const GASSED_ALPHA = 0.4;
/** Vitesse de fondu entre opaque et translucide (par seconde). */
const FADE_PER_SEC = 3.2;

/** Ce dont a besoin le champ de buissons pour savoir où porte le poison. */
export interface PuddleLike {
  x: number;
  y: number;
  radius: number;
}

interface BushEntry {
  cx: number;
  cy: number;
  /** Rayon où l'on se cache réellement (cf. `bushHideRadius`). */
  hideR: number;
  img: Phaser.GameObjects.Image;
  shadow: Phaser.GameObjects.Ellipse;
  gassed: boolean;
  /** Opacité courante, lissée (pas de clignotement quand une flaque affleure). */
  alpha: number;
}

export class BushField {
  private readonly entries: BushEntry[] = [];

  constructor(scene: Phaser.Scene, bushes: readonly Rect[], depth = 8) {
    for (const b of bushes) {
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const { img, shadow } = drawPropAt(scene, cx, cy, pickPropKey(BUSH_KEYS, cx, cy), depth);
      this.entries.push({ cx, cy, hideR: bushHideRadius(b), img, shadow, gassed: false, alpha: 1 });
    }
  }

  /**
   * Recalcule l'état à partir des flaques actives, puis lisse l'opacité.
   * Un buisson est « enfumé » dès que le poison touche sa zone de camouflage —
   * pas seulement son feuillage extérieur : c'est là que les gens se planquent.
   */
  update(puddles: readonly PuddleLike[], dtMs: number): void {
    const k = Math.min(1, (dtMs / 1000) * FADE_PER_SEC);
    for (const e of this.entries) {
      e.gassed = puddles.some((p) => Math.hypot(p.x - e.cx, p.y - e.cy) <= p.radius + e.hideR);
      const target = e.gassed ? GASSED_ALPHA : 1;
      e.alpha += (target - e.alpha) * k;
      e.img.setAlpha(e.alpha);
      e.shadow.setAlpha(0.22 * e.alpha);
    }
  }

  /** Le buisson qui abrite ce point est-il enfumé ? (faux si aucun buisson ici) */
  isGassed(x: number, y: number): boolean {
    for (const e of this.entries) {
      if (!e.gassed) continue;
      const dx = x - e.cx;
      const dy = y - e.cy;
      if (dx * dx + dy * dy <= e.hideR * e.hideR) return true;
    }
    return false;
  }
}
