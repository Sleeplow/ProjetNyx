import Phaser from 'phaser';
import type { Rect } from '../core/types';
import type { PitchDef } from '../maps/pitchNyxt';
import { TEAM } from '../config/soccer';

const GRASS = 0x2fa84f;
const GRASS_DARK = 0x2a9a48;
const LINE = 0xffffff;

/** Un obstacle stylisé « haie » : base verte foncée, contour épais, liseré clair en haut. */
function drawCartoonBlock(scene: Phaser.Scene, o: Rect): void {
  const bx = o.x + o.w / 2;
  const by = o.y + o.h / 2;
  scene.add.rectangle(bx, by, o.w, o.h, 0x1f7a3d).setStrokeStyle(4, 0x123f22, 1).setDepth(9);
  scene.add.rectangle(bx, o.y + Math.min(12, o.h * 0.25), o.w - 8, Math.min(14, o.h * 0.28), 0x35b45f).setDepth(9);
}

/** Un but teinté équipe : fond léger + filet + cadre épais. */
function drawCartoonGoal(scene: Phaser.Scene, zone: Rect, color: number): void {
  scene.add.rectangle(zone.x + zone.w / 2, zone.y + zone.h / 2, zone.w, zone.h, color, 0.3).setDepth(2);
  const net = scene.add.graphics().setDepth(2);
  net.lineStyle(1.5, 0xffffff, 0.35);
  for (let gx = zone.x + 8; gx < zone.x + zone.w; gx += 12) net.lineBetween(gx, zone.y, gx, zone.y + zone.h);
  for (let gy = zone.y + 8; gy < zone.y + zone.h; gy += 12) net.lineBetween(zone.x, gy, zone.x + zone.w, gy);
  scene.add.rectangle(zone.x + zone.w / 2, zone.y + zone.h / 2, zone.w, zone.h).setStrokeStyle(6, color, 1).setDepth(3);
}

/**
 * Dessine la pelouse « cartoon » (bandes tondues + haies). Avec `soccer` (défaut),
 * ajoute les marquages de foot + les buts. Sans (Battle Royale en ligne), c'est
 * une arène neutre : juste la touche + les haies.
 */
export function drawCartoonPitch(scene: Phaser.Scene, pitch: PitchDef, opts?: { soccer?: boolean }): void {
  const soccer = opts?.soccer ?? true;
  const { width, height } = pitch.map;
  const cx = width / 2;
  const cy = height / 2;

  // Pelouse + bandes tondues (alternance de deux verts).
  scene.add.rectangle(cx, cy, width, height, GRASS).setDepth(0);
  const stripes = scene.add.graphics().setDepth(0);
  const band = 170;
  stripes.fillStyle(GRASS_DARK, 1);
  for (let x = 0; x < width; x += band * 2) stripes.fillRect(x, 0, band, height);

  // Marquages : blanc, épais, façon cartoon.
  const inset = 60;
  const lines = scene.add.graphics().setDepth(2);
  lines.lineStyle(6, LINE, 0.9);
  lines.strokeRect(inset, inset, width - inset * 2, height - inset * 2); // touche (les deux modes)
  if (soccer) {
    lines.lineBetween(cx, inset, cx, height - inset); // ligne médiane
    lines.strokeCircle(cx, cy, 160); // rond central
    lines.fillStyle(LINE, 0.9);
    lines.fillCircle(cx, cy, 10); // point central
    const boxW = 210;
    const boxH = 440;
    lines.strokeRect(inset, cy - boxH / 2, boxW, boxH);
    lines.strokeRect(width - inset - boxW, cy - boxH / 2, boxW, boxH);
    drawCartoonGoal(scene, pitch.leftGoal.zone, TEAM.colorA);
    drawCartoonGoal(scene, pitch.rightGoal.zone, TEAM.colorB);
  }

  // Murs + blocs de couverture (les murs sont inclus dans map.obstacles).
  for (const o of pitch.map.obstacles) drawCartoonBlock(scene, o);
}
