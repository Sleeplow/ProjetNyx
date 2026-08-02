import Phaser from 'phaser';

/**
 * Flaque toxique « organique » dessinée à la main (remplace le rond parfait) :
 * contour irrégulier à lobes qui ondule lentement, bulles visqueuses qui
 * gonflent puis crèvent, reflets brillants et éclaboussures détachées.
 *
 * Partagé par le solo (`HazardZone`) et l'en ligne (`OnlineGameScene`) pour que
 * les deux se ressemblent trait pour trait.
 *
 * Le contour est un cercle déformé par quelques harmoniques (sinus de
 * fréquences différentes) : c'est ce qui donne une silhouette de vraie flaque —
 * bosses et creux inégaux — plutôt qu'une patate régulière. Chaque flaque tire
 * ses harmoniques d'un générateur pseudo-aléatoire SEMÉ PAR SA POSITION : deux
 * flaques ne se ressemblent pas, mais une même flaque garde sa forme d'une
 * frame à l'autre (sinon elle grouillerait).
 */

const TAU = Math.PI * 2;

/**
 * Profondeur d'affichage d'une flaque. Volontairement SOUS le décor posé au sol
 * (ombres de décor 7, buissons 8, rochers/caisses 9) : le poison s'étale par
 * terre, donc une roche plantée dedans le masque là où elle repose — au lieu de
 * la nappe qui recouvrait tout, y compris les obstacles.
 */
export const PUDDLE_DEPTH = 6;
/** Points du contour : assez pour que les lobes soient lisses, pas trop pour le coût. */
const OUTLINE_STEPS = 52;
/**
 * Période de recalcul de la silhouette (ms). Le contour est redessiné à chaque
 * frame (les bulles bougent), mais ses POINTS ne sont recalculés que 20 fois par
 * seconde : l'ondulation est lente et visqueuse, personne ne voit la différence,
 * et on évite quelques centaines de `sin()` + 3 allocations de tableau par
 * flaque et par frame — ça compte sur tablette avec plusieurs flaques.
 */
const WOBBLE_INTERVAL_MS = 50;
/** Décalage d'indice de la tache interne = déphasage angulaire, sans trigo. */
const INNER_PHASE_STEPS = 6;
/** Bulles simultanées au maximum (proportionnel à la taille, plafonné). */
const MAX_BUBBLES = 9;

/** Mélange deux couleurs (t = 0 → `c`, t = 1 → `target`). */
function mix(c: number, target: number, t: number): number {
  const r = (c >> 16) & 0xff;
  const g = (c >> 8) & 0xff;
  const b = c & 0xff;
  const tr = (target >> 16) & 0xff;
  const tg = (target >> 8) & 0xff;
  const tb = target & 0xff;
  return (Math.round(r + (tr - r) * t) << 16) | (Math.round(g + (tg - g) * t) << 8) | Math.round(b + (tb - b) * t);
}

/** Générateur pseudo-aléatoire déterministe (LCG) — même graine → même flaque. */
function makeRng(seed: number): () => number {
  let s = Math.floor(seed) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Harmonic {
  freq: number;
  amp: number;
  phase: number;
  speed: number;
}

interface Bubble {
  /** Position relative au centre (unités de rayon, 0..1). */
  dx: number;
  dy: number;
  r: number; // rayon max (px)
  ageMs: number;
  lifeMs: number;
}

export interface PuddleOptions {
  radius: number;
  color: number;
  depth?: number;
  /** Opacité de base du remplissage (la pulsation joue autour). */
  alpha?: number;
}

export class PuddleVisual {
  readonly x: number;
  readonly y: number;
  private readonly radius: number;
  private readonly baseAlpha: number;
  private readonly g: Phaser.GameObjects.Graphics;

  // Palette dérivée de la couleur de base (rim sombre → reflets clairs).
  private readonly cRim: number;
  private readonly cDeep: number;
  private readonly cBody: number;
  private readonly cLight: number;

  private readonly harmonics: Harmonic[];
  private readonly bubbles: Bubble[] = [];
  /** Éclaboussures détachées autour de la flaque (fixes) : {angle, dist, r}. */
  private readonly droplets: { a: number; d: number; r: number }[] = [];
  /** Tache sombre interne (décalée) qui donne la profondeur du liquide. */
  private readonly innerOffset: { dx: number; dy: number };
  /** Creux plus profonds répartis dans la flaque (relief, pas un aplat). */
  private readonly pockets: { dx: number; dy: number; rx: number; ry: number; rot: number }[] = [];
  private readonly rng: () => number;

  private timeMs = 0;
  private scale = 1;

  // Tampons de points RÉUTILISÉS (jamais réalloués) : contour, ombre portée et
  // tache interne. Les deux derniers se déduisent du premier par une simple
  // homothétie — inutile de refaire la trigonométrie trois fois.
  private readonly outlinePts: Phaser.Types.Math.Vector2Like[] = [];
  private readonly shadowPts: Phaser.Types.Math.Vector2Like[] = [];
  private readonly innerPts: Phaser.Types.Math.Vector2Like[] = [];
  private sinceWobbleMs = Infinity; // force un premier calcul

  constructor(scene: Phaser.Scene, x: number, y: number, opts: PuddleOptions) {
    this.x = x;
    this.y = y;
    this.radius = opts.radius;
    this.baseAlpha = opts.alpha ?? 0.88;

    // Palette contrastée : liseré franchement sombre, corps vif, reflets clairs.
    // Sans cet écart, la flaque « bave » sur le décor au lieu de se détacher.
    const c = opts.color;
    this.cRim = mix(c, 0x0a2a08, 0.62);
    this.cDeep = mix(c, 0x0a2a08, 0.34);
    this.cBody = c;
    this.cLight = mix(c, 0xffffff, 0.55);

    // Graine tirée de la position : forme unique par flaque, stable dans le temps.
    this.rng = makeRng(Math.abs(Math.round(x * 73856093) ^ Math.round(y * 19349663)) + 1);
    const rnd = this.rng;

    // 4 harmoniques : 2 basses (grands lobes) + 2 hautes (petites bosses).
    this.harmonics = [
      { freq: 2 + Math.floor(rnd() * 2), amp: 0.1 + rnd() * 0.05, phase: rnd() * TAU, speed: 0.00035 },
      { freq: 3 + Math.floor(rnd() * 2), amp: 0.07 + rnd() * 0.04, phase: rnd() * TAU, speed: -0.00028 },
      { freq: 5 + Math.floor(rnd() * 3), amp: 0.035 + rnd() * 0.03, phase: rnd() * TAU, speed: 0.00045 },
      { freq: 8 + Math.floor(rnd() * 3), amp: 0.018 + rnd() * 0.02, phase: rnd() * TAU, speed: -0.0006 },
    ];

    this.innerOffset = { dx: (rnd() - 0.5) * 0.22, dy: (rnd() - 0.5) * 0.22 };

    for (let i = 0; i < 3; i++) {
      const a = rnd() * TAU;
      const d = 0.12 + rnd() * 0.3;
      this.pockets.push({
        dx: Math.cos(a) * d,
        dy: Math.sin(a) * d,
        rx: 0.16 + rnd() * 0.16,
        ry: 0.1 + rnd() * 0.12,
        rot: rnd() * TAU,
      });
    }

    // Quelques gouttes projetées autour (comme une éclaboussure qui a giclé).
    const dropCount = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < dropCount; i++) {
      this.droplets.push({
        a: rnd() * TAU,
        d: 1.05 + rnd() * 0.3, // en unités de rayon (juste au-delà du bord)
        r: 0.05 + rnd() * 0.07,
      });
    }

    for (let i = 0; i < OUTLINE_STEPS; i++) {
      this.outlinePts.push({ x: 0, y: 0 });
      this.shadowPts.push({ x: 0, y: 0 });
      this.innerPts.push({ x: 0, y: 0 });
    }

    this.g = scene.add.graphics().setDepth(opts.depth ?? 11);
    this.rebuildShape();
    this.draw();
  }

  /** Fait vivre la flaque : ondulation du contour + cycle des bulles. */
  update(dtMs: number): void {
    this.timeMs += dtMs;

    // Bulles : naissance proportionnelle à la surface, mort en fin de vie.
    const target = Math.min(MAX_BUBBLES, Math.max(3, Math.round(this.radius / 12)));
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.ageMs += dtMs;
      if (b.ageMs >= b.lifeMs) this.bubbles.splice(i, 1);
    }
    // Une bulle à la fois, avec une probabilité par frame : l'apparition reste
    // irrégulière (un liquide qui bout ne fait pas de bulles en cadence).
    if (this.bubbles.length < target && this.rng() < 0.06 + dtMs / 900) {
      this.spawnBubble();
    }

    this.sinceWobbleMs += dtMs;
    if (this.sinceWobbleMs >= WOBBLE_INTERVAL_MS) {
      this.sinceWobbleMs = 0;
      this.rebuildShape();
    }
    this.draw();
  }

  private spawnBubble(): void {
    const rnd = this.rng;
    // Racine carrée du tirage → répartition uniforme sur le disque (sinon les
    // bulles s'agglutinent au centre).
    const dist = Math.sqrt(rnd()) * 0.62;
    const a = rnd() * TAU;
    this.bubbles.push({
      dx: Math.cos(a) * dist,
      dy: Math.sin(a) * dist,
      r: this.radius * (0.09 + rnd() * 0.11),
      ageMs: 0,
      // Visqueux = lent : la bulle met du temps à gonfler et à crever.
      lifeMs: 900 + rnd() * 900,
    });
  }

  /** Rayon du contour à un angle donné (cercle + harmoniques, ondulé dans le temps). */
  private radiusAt(angle: number): number {
    let r = 1;
    for (const h of this.harmonics) {
      r += h.amp * Math.sin(h.freq * angle + h.phase + this.timeMs * h.speed);
    }
    return this.radius * this.scale * r;
  }

  /**
   * Recalcule la silhouette dans les tampons (contour, ombre, tache interne).
   * Appelé au plus toutes les `WOBBLE_INTERVAL_MS`, pas à chaque frame.
   */
  private rebuildShape(): void {
    const R = this.radius * this.scale;
    const ox = this.x + this.innerOffset.dx * R;
    const oy = this.y + this.innerOffset.dy * R;

    for (let i = 0; i < OUTLINE_STEPS; i++) {
      const a = (i / OUTLINE_STEPS) * TAU;
      const r = this.radiusAt(a);
      const dx = Math.cos(a) * r;
      const dy = Math.sin(a) * r;
      const p = this.outlinePts[i];
      p.x = this.x + dx;
      p.y = this.y + dy;
      const s = this.shadowPts[i];
      s.x = this.x + dx * 1.04;
      s.y = this.y + dy * 1.04;
    }
    // Tache interne : même silhouette, réduite, décalée et DÉPHASÉE — le
    // déphasage est un simple décalage d'indice (un cran d'indice = un cran
    // d'angle), donc gratuit.
    for (let i = 0; i < OUTLINE_STEPS; i++) {
      const src = this.outlinePts[(i + INNER_PHASE_STEPS) % OUTLINE_STEPS];
      const t = this.innerPts[i];
      t.x = ox + (src.x - this.x) * 0.66;
      t.y = oy + (src.y - this.y) * 0.66;
    }
  }

  private draw(): void {
    const g = this.g;
    g.clear();

    // Respiration « toxique » douce, comme l'ancienne pulsation.
    const pulse = 0.9 + 0.1 * Math.sin(this.timeMs / 620);
    const a = this.baseAlpha * pulse;
    const R = this.radius * this.scale;

    // 1) Ombre portée : la flaque a de l'épaisseur, elle pose sur le sol.
    g.fillStyle(0x000000, a * 0.22);
    g.fillPoints(this.shadowPts, true);

    // 2) Corps de la flaque + liseré sombre épais (lecture cartoon).
    g.fillStyle(this.cBody, a);
    g.fillPoints(this.outlinePts, true);
    g.lineStyle(Math.max(3, R * 0.075), this.cRim, Math.min(1, a + 0.1));
    g.strokePoints(this.outlinePts, true, true);

    // 3) Tache sombre interne décalée : donne l'épaisseur du liquide.
    g.fillStyle(this.cDeep, a * 0.85);
    g.fillPoints(this.innerPts, true);

    // 3bis) Creux plus profonds : le liquide n'est pas un aplat uniforme.
    //       Ils respirent en décalé, comme une matière qui travaille.
    for (const [i, p] of this.pockets.entries()) {
      const breathe = 1 + 0.08 * Math.sin(this.timeMs / (700 + i * 190) + i);
      g.fillStyle(this.cRim, a * 0.3);
      g.save();
      g.translateCanvas(this.x + p.dx * R, this.y + p.dy * R);
      g.rotateCanvas(p.rot);
      g.fillEllipse(0, 0, p.rx * R * 2 * breathe, p.ry * R * 2 * breathe);
      g.restore();
    }

    // 4) Gouttes projetées autour (avec leur propre liseré).
    for (const d of this.droplets) {
      const dr = d.r * R;
      const dx = this.x + Math.cos(d.a) * d.d * R;
      const dy = this.y + Math.sin(d.a) * d.d * R;
      g.fillStyle(this.cBody, a);
      g.fillCircle(dx, dy, dr);
      g.lineStyle(Math.max(1.5, R * 0.03), this.cRim, Math.min(1, a + 0.2));
      g.strokeCircle(dx, dy, dr);
      g.fillStyle(this.cLight, a * 0.7);
      g.fillCircle(dx - dr * 0.3, dy - dr * 0.35, dr * 0.3);
    }

    // 5) Bulles : gonflent, puis crèvent en anneau qui s'ouvre.
    this.drawBubbles(a, R);

    // 6) Reflets brillants sur le dessus (comme sur du slime).
    g.fillStyle(this.cLight, a * 0.8);
    g.fillEllipse(this.x - R * 0.3, this.y - R * 0.44, R * 0.44, R * 0.2);
    g.fillStyle(this.cLight, a * 0.55);
    g.fillEllipse(this.x + R * 0.36, this.y + R * 0.32, R * 0.26, R * 0.12);
  }

  private drawBubbles(a: number, R: number): void {
    const g = this.g;
    for (const b of this.bubbles) {
      const t = b.ageMs / b.lifeMs;
      const bx = this.x + b.dx * R;
      const by = this.y + b.dy * R;
      if (t < 0.72) {
        // Montée + gonflement (ralenti sur la fin : le liquide épais résiste).
        const grow = Math.pow(t / 0.72, 0.6);
        const br = b.r * this.scale * grow;
        if (br < 1) continue;
        // Dôme bombé : creux sombre dessous, corps, calotte éclairée, reflet.
        // C'est l'empilement clair→sombre qui fait lire une BOULE posée sur le
        // liquide ; un simple disque cerclé passait pour une bulle de savon.
        g.fillStyle(this.cRim, a * 0.85);
        g.fillCircle(bx, by + br * 0.14, br * 1.06);
        g.fillStyle(this.cDeep, a);
        g.fillCircle(bx, by, br);
        g.fillStyle(this.cBody, a * 0.95);
        g.fillCircle(bx - br * 0.1, by - br * 0.16, br * 0.7);
        g.fillStyle(this.cLight, a);
        g.fillCircle(bx - br * 0.3, by - br * 0.34, br * 0.24);
      } else {
        // Éclatement : cratère sombre qui s'ouvre + gerbe claire, puis s'efface.
        const p = (t - 0.72) / 0.28;
        const br = b.r * this.scale;
        const fade = (1 - p) * a;
        g.lineStyle(Math.max(2, br * 0.34 * (1 - p)), this.cRim, fade);
        g.strokeCircle(bx, by, br * (1 + p * 0.75));
        g.lineStyle(Math.max(1, br * 0.16 * (1 - p)), this.cLight, fade * 0.85);
        g.strokeCircle(bx, by, br * (1 + p * 1.15));
      }
    }
  }

  /** Rétrécissement (dissipation de la flaque). */
  setScale(s: number): void {
    this.scale = s;
    // La silhouette dépend de l'échelle : on la recalcule au prochain tour,
    // sinon le rétrécissement final serait saccadé (20 Hz de retard).
    this.sinceWobbleMs = Infinity;
  }

  destroy(): void {
    this.g.destroy();
  }
}
