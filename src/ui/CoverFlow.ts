import Phaser from 'phaser';

/**
 * Carrousel « Cover Flow » (perspective) partagé — sélecteur de mode ET roue de
 * Zarek. La carte centrale est de face et pleine taille ; les voisines
 * s'enfoncent des deux côtés : plus petites, compressées horizontalement (faux
 * pivot 3D, comme le reste du jeu — pas de vraie 3D WebGL), estompées et en
 * profondeur derrière. Changer de sélection fait glisser tout le flux : la carte
 * centrale s'incline et part sur le côté pendant que la voisine se redresse et
 * grossit au centre.
 *
 * Le composant NE construit PAS le contenu des cartes : l'appelant fournit des
 * `Container` (construits à l'échelle design = 1) ; CoverFlow ne fait que les
 * positionner / mettre à l'échelle / animer. La variété (carte de mode vs avatar
 * de Zarek) vit donc entièrement côté scène.
 */
export interface CoverFlowOpts {
  /** Centre écran du flux (px écran). */
  cx: number;
  cy: number;
  /** Échelle du Frame courant (`F.s`) — la carte centrale est à cette échelle. */
  frameScale: number;
  /** Décalage design (px) du 1er voisin, puis pas supplémentaire par cran. */
  gap: number;
  step: number;
  /** Facteur d'échelle appliqué PAR cran d'éloignement (<1). */
  sideScale: number;
  /** Compression `scaleX` des cartes latérales (faux pivot 3D ; <1). */
  squash: number;
  /** Perte d'alpha par cran, bornée par `minAlpha`. */
  alphaStep: number;
  minAlpha: number;
  /** Nombre de voisins visibles de chaque côté du centre. */
  maxVisible: number;
  onChange?: (index: number) => void;
}

export interface CoverFlowCard {
  key: string;
  /** Contenu de la carte, centré sur (0,0), à l'échelle design (1). */
  container: Phaser.GameObjects.Container;
  /** Zone cliquable (px design) pour sélectionner cette carte d'un tap ; option. */
  hit?: { w: number; h: number };
}

export class CoverFlow {
  private readonly scene: Phaser.Scene;
  private readonly opts: CoverFlowOpts;
  private cards: CoverFlowCard[] = [];
  private idx = 0;

  constructor(scene: Phaser.Scene, opts: CoverFlowOpts) {
    this.scene = scene;
    this.opts = opts;
  }

  setCards(cards: CoverFlowCard[], startIndex = 0): void {
    this.cards = cards;
    this.idx = Phaser.Math.Clamp(startIndex, 0, Math.max(0, cards.length - 1));
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (card.hit) {
        const { w, h } = card.hit;
        card.container
          .setSize(w, h)
          .setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains)
          .on('pointerdown', () => this.select(i));
      }
    }
    this.layout(false);
  }

  get index(): number {
    return this.idx;
  }

  get length(): number {
    return this.cards.length;
  }

  next(): void {
    this.select(this.idx + 1);
  }

  prev(): void {
    this.select(this.idx - 1);
  }

  select(i: number, animate = true): void {
    const next = Phaser.Math.Clamp(i, 0, this.cards.length - 1);
    if (next === this.idx && animate) return;
    this.idx = next;
    this.layout(animate);
    this.opts.onChange?.(this.idx);
  }

  private layout(animate: boolean): void {
    const o = this.opts;
    this.cards.forEach((card, i) => {
      const rel = i - this.idx;
      const arel = Math.abs(rel);
      const visible = arel <= o.maxVisible;
      // Les cartes hors-champ se garent juste au-delà du dernier cran visible
      // (pas à des kilomètres) : quand elles reviennent, elles glissent de peu.
      const posRel = Math.min(arel, o.maxVisible + 1);
      const xOff = rel === 0 ? 0 : Math.sign(rel) * (o.gap + (posRel - 1) * o.step);
      const x = o.cx + xOff * o.frameScale;
      const scl = o.frameScale * Math.pow(o.sideScale, arel);
      const sclX = scl * (arel === 0 ? 1 : o.squash);
      const alpha = visible ? Phaser.Math.Clamp(1 - arel * o.alphaStep, o.minAlpha, 1) : 0;
      const c = card.container;
      c.setDepth(100 - arel); // centre au-dessus, voisins dessous
      if (visible) c.setVisible(true);
      if (animate) {
        this.scene.tweens.killTweensOf(c); // ne touche PAS aux tweens des enfants (ex. halo d'ultime)
        this.scene.tweens.add({
          targets: c,
          x,
          y: o.cy,
          scaleX: sclX,
          scaleY: scl,
          alpha,
          duration: 320,
          ease: 'Cubic.out',
          onComplete: () => {
            if (!visible) c.setVisible(false);
          },
        });
      } else {
        c.setPosition(x, o.cy).setScale(sclX, scl).setAlpha(alpha).setVisible(visible);
      }
    });
  }

  destroy(): void {
    for (const card of this.cards) card.container.destroy();
    this.cards = [];
  }
}
