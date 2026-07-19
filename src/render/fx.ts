import Phaser from 'phaser';

/**
 * Dessine un éclair en zigzag entre deux points (cœur blanc + halo coloré) qui
 * s'estompe vite. Utilisé par l'attaque/ult « éclair en chaîne », en solo comme
 * en ligne.
 */
export function drawChainBolt(scene: Phaser.Scene, x1: number, y1: number, x2: number, y2: number, color: number, width = 4, depth = 24): void {
  const segs = 6;
  const jitter = 14;
  const pts: { x: number; y: number }[] = [{ x: x1, y: y1 }];
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    pts.push({ x: x1 + (x2 - x1) * t + (Math.random() * 2 - 1) * jitter, y: y1 + (y2 - y1) * t + (Math.random() * 2 - 1) * jitter });
  }
  pts.push({ x: x2, y: y2 });

  const g = scene.add.graphics().setDepth(depth);
  const stroke = (w: number, col: number, a: number) => {
    g.lineStyle(w, col, a);
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.strokePath();
  };
  stroke(width + 9, color, 0.35); // halo large
  stroke(width + 4, color, 0.7); // halo coloré
  stroke(width + 1, 0xffffff, 1); // cœur blanc
  scene.tweens.add({ targets: g, alpha: 0, duration: 240, ease: 'Quad.in', onComplete: () => g.destroy() });
}
