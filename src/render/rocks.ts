import Phaser from 'phaser';

/**
 * Roches d'Atlas : le projectile n'est plus une bille ronde mais un CAILLOU
 * difforme — anguleux, jamais deux fois le même — qui tourne en vol, éclate en
 * fragments à l'impact et laisse un voile de poussière au sol.
 *
 * Tout est dessiné à la volée (aucun asset), et partagé solo / en ligne.
 */

const TAU = Math.PI * 2;

/** Sommets d'une roche : peu nombreux et irréguliers → silhouette anguleuse. */
const ROCK_FACETS = 9;

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

/**
 * Contour d'une roche, en coordonnées locales (rayon 1). `seed` fixe la forme :
 * même graine → même caillou, graines différentes → cailloux différents.
 */
export function rockPoints(seed: number, radius: number): Phaser.Types.Math.Vector2Like[] {
  const pts: Phaser.Types.Math.Vector2Like[] = [];
  for (let i = 0; i < ROCK_FACETS; i++) {
    const a = (i / ROCK_FACETS) * TAU;
    // Deux sinus déphasés par la graine : rayon irrégulier mais déterministe.
    const wobble = 0.78 + 0.3 * Math.abs(Math.sin(seed * 1.7 + i * 2.3)) + 0.12 * Math.sin(seed * 3.1 + i * 5.1);
    const r = radius * wobble;
    // On décale aussi l'ANGLE : sans ça les sommets restent régulièrement
    // espacés et la silhouette trahit encore le polygone régulier.
    const da = 0.22 * Math.sin(seed * 2.9 + i * 1.9);
    pts.push({ x: Math.cos(a + da) * r, y: Math.sin(a + da) * r });
  }
  return pts;
}

/** Dessine une roche (corps + facette claire + liseré sombre) dans un Graphics. */
function paintRock(g: Phaser.GameObjects.Graphics, pts: Phaser.Types.Math.Vector2Like[], color: number, radius: number): void {
  const dark = mix(color, 0x1a1208, 0.55);
  const light = mix(color, 0xffffff, 0.4);
  g.fillStyle(color, 1);
  g.fillPoints(pts, true);
  g.lineStyle(Math.max(1.5, radius * 0.16), dark, 1);
  g.strokePoints(pts, true, true);
  // Facette éclairée : la moitié haut-gauche des sommets, resserrée vers le
  // centre — suffit à faire lire un volume plutôt qu'une tache plate.
  const facet = pts.slice(0, Math.ceil(ROCK_FACETS / 2)).map((p) => ({ x: p.x * 0.62 - radius * 0.12, y: p.y * 0.62 - radius * 0.14 }));
  g.fillStyle(light, 0.85);
  g.fillPoints(facet, true);
}

/** Une roche en vol : un Graphics qu'on déplace et fait tourner. */
export class RockVisual {
  private readonly g: Phaser.GameObjects.Graphics;
  private readonly spin: number;
  private angle = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, color: number, seed: number, depth = 18) {
    this.g = scene.add.graphics().setDepth(depth);
    paintRock(this.g, rockPoints(seed, radius), color, radius);
    this.g.setPosition(x, y);
    // Sens et vitesse de rotation tirés de la graine : une salve de deux roches
    // ne tourne pas comme un seul bloc.
    this.spin = (seed % 2 === 0 ? 1 : -1) * (2.2 + (seed % 5) * 0.6);
    this.g.setRotation(seed);
  }

  update(x: number, y: number, dtSec: number): void {
    this.angle += this.spin * dtSec;
    this.g.setPosition(x, y).setRotation(this.angle);
  }

  destroy(): void {
    this.g.destroy();
  }
}

/**
 * Éclatement d'une roche : des éclats anguleux partent dans toutes les
 * directions en tournant, plus une bouffée de poussière immédiate.
 */
export function rockShatter(scene: Phaser.Scene, x: number, y: number, radius: number, color: number, depth = 24): void {
  const dark = mix(color, 0x1a1208, 0.4);
  for (let i = 0; i < 7; i++) {
    const seed = i * 3 + Math.floor(x);
    const fr = radius * (0.2 + Math.random() * 0.22);
    const g = scene.add.graphics().setDepth(depth);
    paintRock(g, rockPoints(seed, fr), i % 3 === 0 ? dark : color, fr);
    g.setPosition(x, y);
    const ang = (i / 7) * TAU + Math.random() * 0.8;
    const d = radius * (1.6 + Math.random() * 1.8);
    scene.tweens.add({
      targets: g,
      x: x + Math.cos(ang) * d,
      y: y + Math.sin(ang) * d,
      rotation: (Math.random() - 0.5) * 6,
      alpha: 0,
      scale: 0.3,
      duration: 320 + Math.random() * 220,
      ease: 'Quad.out',
      onComplete: () => g.destroy(),
    });
  }
}

/**
 * Nuage de poussière au sol : quelques bouffées qui gonflent, dérivent puis se
 * dissipent. Volontairement pâle et diffus — il doit se lire comme un voile,
 * pas comme une flaque (à ne pas confondre avec le poison d'Hécate).
 */
export class DustVisual {
  private readonly g: Phaser.GameObjects.Graphics;
  private readonly puffs: { dx: number; dy: number; r: number; drift: number; phase: number }[] = [];
  private readonly color: number;
  private readonly radius: number;
  private timeMs = 0;
  /** Opacité globale, pilotée par la durée de vie restante (voir `setFade`). */
  private fade = 1;

  constructor(scene: Phaser.Scene, private readonly x: number, private readonly y: number, radius: number, color: number, depth: number) {
    this.radius = radius;
    this.color = color;
    this.g = scene.add.graphics().setDepth(depth);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + Math.random() * 0.5;
      const d = Math.sqrt(Math.random()) * 0.62;
      this.puffs.push({
        dx: Math.cos(a) * d,
        dy: Math.sin(a) * d,
        r: 0.3 + Math.random() * 0.26,
        drift: 0.04 + Math.random() * 0.06,
        phase: Math.random() * TAU,
      });
    }
    this.draw();
  }

  update(dtMs: number): void {
    this.timeMs += dtMs;
    this.draw();
  }

  /** 1 = pleine opacité, 0 = dissipé (la zone pilote sa fin de vie). */
  setFade(f: number): void {
    this.fade = Math.max(0, Math.min(1, f));
  }

  private draw(): void {
    const g = this.g;
    g.clear();
    const R = this.radius;
    const light = mix(this.color, 0xffffff, 0.35);
    // Gonflement rapide au début (la roche vient d'éclater), puis stabilisation.
    const swell = Math.min(1, 0.55 + this.timeMs / 420);
    for (const [i, p] of this.puffs.entries()) {
      const t = this.timeMs / 1000;
      const rise = p.drift * t; // la poussière s'étale lentement vers l'extérieur
      const bob = 0.03 * Math.sin(t * 1.8 + p.phase);
      const px = this.x + (p.dx + p.dx * rise) * R;
      const py = this.y + (p.dy + p.dy * rise + bob) * R;
      const pr = p.r * R * swell * (1 + rise * 0.5);
      g.fillStyle(i % 3 === 0 ? light : this.color, 0.46 * this.fade);
      g.fillCircle(px, py, pr);
    }
    // Cœur plus dense, pour que le nuage ait un centre lisible : le joueur doit
    // voir d'un coup d'œil OÙ il va être ralenti.
    g.fillStyle(this.color, 0.34 * this.fade);
    g.fillCircle(this.x, this.y, R * 0.55 * swell);
    // Voile large et très pâle : adoucit le bord, évite l'effet « tas de ronds ».
    g.fillStyle(light, 0.12 * this.fade);
    g.fillCircle(this.x, this.y, R * 0.95 * swell);
  }

  destroy(): void {
    this.g.destroy();
  }
}
