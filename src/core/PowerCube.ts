import Phaser from 'phaser';
import { POWER_CUBE } from '../config/constants';

/** Échelle d'affichage de la gemme bakée (128px) — aussi utilisée par le rendu
 * en ligne (`OnlineGameScene`) pour que solo et en ligne se ressemblent. */
export const GEM_SCALE = 0.5; // +43% (retour utilisateur : trop petit à 0.35)

const SPARKLE_COLOR = '#eafeff';
const GLOW_TEX = 'power_glow';

/** Un point de losange (pointe-large-pointe-large) tourné, pour dessiner un
 * rayon de lens-flare qui s'amincit vers ses deux extrémités. */
function spikePoints(cx: number, cy: number, len: number, width: number, angleRad: number): { x: number; y: number }[] {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  const raw: [number, number][] = [
    [len, 0],
    [0, width],
    [-len, 0],
    [0, -width],
  ];
  return raw.map(([x, y]) => ({ x: cx + x * c - y * s, y: cy + x * s + y * c }));
}

/**
 * Cuit UNE FOIS la texture d'éclat façon « lens flare » : cœur brillant +
 * longs rayons en croix + rayons courts en diagonale (voir référence utilisateur
 * — pas un simple rond flou, une vraie étoile qui rayonne). Réutilisée par
 * toutes les gemmes via une seule Image (pas redessinée à chaque frame).
 */
function ensureGlowTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(GLOW_TEX)) return;
  const size = 160;
  const c = size / 2;
  const g = scene.add.graphics();

  g.fillStyle(0x6fd8ff, 0.55);
  g.fillPoints(spikePoints(c, c, c - 8, 3, 0), true);
  g.fillPoints(spikePoints(c, c, c - 8, 3, Math.PI / 2), true);
  g.fillStyle(0xcdf6ff, 0.8);
  g.fillPoints(spikePoints(c, c, c * 0.52, 2, Math.PI / 4), true);
  g.fillPoints(spikePoints(c, c, c * 0.52, 2, -Math.PI / 4), true);

  g.fillStyle(0x8fe8ff, 0.35);
  g.fillCircle(c, c, c * 0.34);
  g.fillStyle(0xffffff, 0.95);
  g.fillCircle(c, c, c * 0.09);

  g.generateTexture(GLOW_TEX, size, size);
  g.destroy();
}

/**
 * Construit le visuel complet d'une gemme (éclat façon lens-flare qui respire
 * et tourne lentement + gemme qui tourne + étincelles qui clignotent) dans un
 * `Container` — un seul objet à positionner/détruire. Partagé entre le solo
 * (`PowerCube`) et l'en ligne (`OnlineGameScene.renderCubes`) pour que les
 * deux se ressemblent trait pour trait.
 */
export function createPowerGemVisual(scene: Phaser.Scene, x: number, y: number, depth = 10): Phaser.GameObjects.Container {
  ensureGlowTexture(scene);
  // Éclat qui respire (échelle/alpha) et tourne lentement — un rond flou
  // statique ne lit pas comme « lumineux », de vrais rayons qui bougent si.
  const halo = scene.add.image(0, 0, GLOW_TEX).setScale(0.34).setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({ targets: halo, scale: 0.42, alpha: 0.55, duration: 850, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: halo, angle: 360, duration: 5000, repeat: -1, ease: 'Linear' });

  const gem = scene.add.sprite(0, 0, 'power_gem').setScale(GEM_SCALE).play('power_gem_spin');

  // Étincelles : 3 petites étoiles autour de la gemme, qui clignotent en
  // décalé (scintillement) plutôt qu'ensemble (respiration uniforme).
  const sparkles: Phaser.GameObjects.Text[] = [];
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 5;
    const sx = Math.cos(angle) * 20;
    const sy = Math.sin(angle) * 20;
    const spark = scene.add.text(sx, sy, '✦', { fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: SPARKLE_COLOR }).setOrigin(0.5).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: spark, alpha: { from: 0, to: 1 }, scale: { from: 0.3, to: 1.1 }, duration: 260, yoyo: true, repeat: -1, repeatDelay: 900, delay: i * 430, ease: 'Quad.out' });
    sparkles.push(spark);
  }

  const container = scene.add.container(x, y, [halo, gem, ...sparkles]).setDepth(depth);
  // Léger flottement vertical, en plus de la rotation 3D — accroche l'œil.
  scene.tweens.add({ targets: container, y: y - 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return container;
}

/** Un cube de power-up ramassable (bonus de PV max + dégâts). */
export class PowerCube {
  x: number;
  y: number;
  alive = true;
  /** Temps passé hors de la zone sûre (ms) — au-delà du seuil, le cube disparaît. */
  outsideMs = 0;
  private readonly vis: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vis = createPowerGemVisual(scene, x, y);
  }

  /** À appeler chaque frame où le cube est hors de la zone sûre. */
  tickOutside(dtMs: number): void {
    this.outsideMs += dtMs;
    // Clignotement d'avertissement dans la dernière seconde avant disparition.
    const remaining = POWER_CUBE.outsideDespawnMs - this.outsideMs;
    if (remaining < 1000) {
      this.vis.setAlpha(0.25 + 0.6 * Math.abs(Math.sin(this.outsideMs / 70)));
    }
  }

  get expiredOutside(): boolean {
    return this.outsideMs >= POWER_CUBE.outsideDespawnMs;
  }

  destroy(): void {
    this.alive = false;
    this.vis.destroy();
  }
}
