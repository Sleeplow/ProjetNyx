import Phaser from 'phaser';

/**
 * Aide à la mise en page responsive (téléphone / tablette / ordi).
 *
 * Stratégie : chaque menu est pensé dans une « boîte de design » paysage fixe
 * (DESIGN_W × DESIGN_H). On calcule un facteur d'échelle qui fait tenir cette
 * boîte dans l'écran DISPONIBLE (écran moins les encoches iPhone), et on centre.
 * Les positions sont exprimées en coordonnées de design puis projetées à l'écran
 * via `Frame.at()` — ainsi rien ne se chevauche, quelle que soit la taille.
 *
 * Le jeu est forcé en paysage (voir l'overlay dans index.html), donc la boîte
 * est paysage.
 */

export const DESIGN_W = 1024;
export const DESIGN_H = 600;

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

let probe: HTMLElement | null = null;

/**
 * Marges sûres iPhone (encoche, indicateur d'accueil) via `env(safe-area-inset-*)`.
 * Un `<div>` sonde masqué porte les marges en CSS ; on relit ses valeurs calculées.
 * Sur ordi / Android sans encoche, tout vaut 0. Surcharge de test possible via
 * `window.__NYXT_INSETS__ = {top,right,bottom,left}`.
 */
export function safeInsets(): Insets {
  const override = (window as unknown as { __NYXT_INSETS__?: Insets }).__NYXT_INSETS__;
  if (override) return override;
  if (typeof document === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 };
  if (!probe) {
    probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);';
    document.body.appendChild(probe);
  }
  const cs = getComputedStyle(probe);
  return {
    top: parseFloat(cs.paddingTop) || 0,
    right: parseFloat(cs.paddingRight) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
  };
}

/** Une projection design → écran (échelle uniforme + centrage dans la zone sûre). */
export interface Frame {
  /** Facteur d'échelle appliqué. */
  s: number;
  /** Coin haut-gauche de la boîte de design, en pixels écran. */
  x0: number;
  y0: number;
  /** Centre de la boîte, en pixels écran. */
  cx: number;
  cy: number;
  /** Dimensions de la boîte projetée. */
  w: number;
  h: number;
  insets: Insets;
  /**
   * Projette une position design → position écran.
   * `dx` = décalage HORIZONTAL depuis le centre (px design, négatif = gauche).
   * `dy` = position VERTICALE depuis le haut de la boîte (0 … DESIGN_H).
   */
  at(dx: number, dy: number): { x: number; y: number };
  /** Met une taille (px design) à l'échelle. */
  px(v: number): number;
  /** Renvoie une taille de police CSS mise à l'échelle (min 9px). */
  font(base: number): string;
}

/** Calcule la projection pour la scène courante (à rappeler après un resize). */
export function computeFrame(scene: Phaser.Scene): Frame {
  const insets = safeInsets();
  const availW = Math.max(1, scene.scale.width - insets.left - insets.right);
  const availH = Math.max(1, scene.scale.height - insets.top - insets.bottom);
  // Jamais trop petit ni trop gros : on borne l'échelle.
  const s = Phaser.Math.Clamp(Math.min(availW / DESIGN_W, availH / DESIGN_H), 0.3, 1.4);
  const w = DESIGN_W * s;
  const h = DESIGN_H * s;
  const x0 = insets.left + (availW - w) / 2;
  const y0 = insets.top + (availH - h) / 2;
  return {
    s,
    x0,
    y0,
    w,
    h,
    cx: x0 + w / 2,
    cy: y0 + h / 2,
    insets,
    at: (dx, dy) => ({ x: x0 + w / 2 + dx * s, y: y0 + dy * s }),
    px: (v) => v * s,
    font: (base) => `${Math.max(9, Math.round(base * s))}px`,
  };
}

/**
 * Rappelle `handler` quand l'écran change vraiment de taille (rotation, etc.),
 * en ignorant le petit jitter (barre d'adresse Safari) et en débouncant.
 * Se nettoie tout seul à la fermeture de la scène.
 */
export function watchResize(scene: Phaser.Scene, handler: () => void): void {
  let lastW = scene.scale.width;
  let lastH = scene.scale.height;
  let timer: Phaser.Time.TimerEvent | null = null;
  const onResize = (): void => {
    const w = scene.scale.width;
    const h = scene.scale.height;
    if (Math.abs(w - lastW) < 24 && Math.abs(h - lastH) < 24) return; // ignore le jitter
    lastW = w;
    lastH = h;
    timer?.remove();
    timer = scene.time.delayedCall(120, handler);
  };
  scene.scale.on('resize', onResize);
  scene.events.once('shutdown', () => {
    scene.scale.off('resize', onResize);
    timer?.remove();
  });
}
