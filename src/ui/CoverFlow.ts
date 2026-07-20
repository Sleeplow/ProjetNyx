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
 * Interaction (en plus des flèches câblées par la scène) :
 *  - **tap** sur une carte latérale → elle vient au centre et devient choisie ;
 *  - **glisser** horizontalement (souris/doigt) → défile carte par carte ;
 *  - **molette** → défile d'un cran.
 *
 * Le composant NE construit PAS le contenu des cartes : l'appelant fournit des
 * `Container` (construits à l'échelle design = 1) ; CoverFlow ne fait que les
 * positionner / mettre à l'échelle / animer + gérer les gestes. La variété
 * (carte de mode vs avatar de Zarek) vit donc entièrement côté scène.
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
  /** Zone de tap (px design) — sert à savoir sur quelle carte on a cliqué. */
  hit?: { w: number; h: number };
}

/** Déplacement max (px écran) entre appui et relâché encore considéré comme un tap. */
const TAP_MAX_MOVE = 10;
/** Intervalle mini entre deux crans de molette (ms) — évite les sauts en rafale. */
const WHEEL_THROTTLE_MS = 110;

export class CoverFlow {
  private readonly scene: Phaser.Scene;
  private readonly opts: CoverFlowOpts;
  private cards: CoverFlowCard[] = [];
  private idx = 0;

  // Geste de glissement en cours.
  private dragId = -1;
  private downX = 0;
  private downY = 0;
  private lastX = 0;
  private accumX = 0; // distance glissée depuis le dernier cran
  private wheelLast = 0;

  constructor(scene: Phaser.Scene, opts: CoverFlowOpts) {
    this.scene = scene;
    this.opts = opts;
    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);
    scene.input.on('pointerupoutside', this.onUp, this);
    scene.input.on('wheel', this.onWheel, this);
  }

  setCards(cards: CoverFlowCard[], startIndex = 0): void {
    this.cards = cards;
    this.idx = Phaser.Math.Clamp(startIndex, 0, Math.max(0, cards.length - 1));
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

  // ---------- Gestes ----------

  /** Distance de glissement (px écran) pour avancer d'une carte. */
  private get dragStepPx(): number {
    return Math.max(30, this.opts.gap * this.opts.frameScale * 0.5);
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (this.dragId !== -1) return; // un seul doigt suivi à la fois
    this.dragId = pointer.id;
    this.downX = pointer.x;
    this.downY = pointer.y;
    this.lastX = pointer.x;
    this.accumX = 0;
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.dragId) return;
    this.accumX += pointer.x - this.lastX;
    this.lastX = pointer.x;
    const stepPx = this.dragStepPx;
    // Glisser vers la GAUCHE (accumX négatif) fait venir la carte de droite → next.
    while (this.accumX <= -stepPx) {
      this.next();
      this.accumX += stepPx;
    }
    while (this.accumX >= stepPx) {
      this.prev();
      this.accumX -= stepPx;
    }
  }

  private onUp(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void {
    if (pointer.id !== this.dragId) return;
    this.dragId = -1;
    const disp = Math.hypot(pointer.x - this.downX, pointer.y - this.downY);
    if (disp >= TAP_MAX_MOVE) return; // c'était un glissement, pas un tap
    if (currentlyOver && currentlyOver.length > 0) return; // tap sur une flèche / un bouton → il gère lui-même
    const i = this.cardAt(pointer.x, pointer.y);
    if (i >= 0) this.select(i);
  }

  private onWheel(_pointer: Phaser.Input.Pointer, _over: Phaser.GameObjects.GameObject[], dx: number, dy: number): void {
    const now = this.scene.time.now;
    if (now - this.wheelLast < WHEEL_THROTTLE_MS) return;
    const d = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
    if (Math.abs(d) < 2) return;
    this.wheelLast = now;
    if (d > 0) this.next();
    else this.prev();
  }

  /** Carte (index) sous un point écran ; la plus proche du centre (au-dessus) gagne. -1 si aucune. */
  private cardAt(px: number, py: number): number {
    let best = -1;
    let bestArel = Infinity;
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const c = card.container;
      if (!card.hit || !c.visible || c.alpha < 0.05) continue;
      const halfW = (card.hit.w / 2) * Math.abs(c.scaleX);
      const halfH = (card.hit.h / 2) * Math.abs(c.scaleY);
      if (Math.abs(px - c.x) <= halfW && Math.abs(py - c.y) <= halfH) {
        const arel = Math.abs(i - this.idx);
        if (arel < bestArel) {
          bestArel = arel;
          best = i;
        }
      }
    }
    return best;
  }

  // ---------- Rendu ----------

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
    this.scene.input.off('pointerdown', this.onDown, this);
    this.scene.input.off('pointermove', this.onMove, this);
    this.scene.input.off('pointerup', this.onUp, this);
    this.scene.input.off('pointerupoutside', this.onUp, this);
    this.scene.input.off('wheel', this.onWheel, this);
    for (const card of this.cards) card.container.destroy();
    this.cards = [];
  }
}
