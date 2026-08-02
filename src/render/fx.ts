import Phaser from 'phaser';

/**
 * Éclair en chaîne (attaque et ultime d'Astrapé), solo comme en ligne.
 *
 * Le trait ne file PAS droit sur la cible : il part d'un côté, serpente, se
 * ramifie, puis rejoint sa victime. Trois sources de hasard, tirées à chaque
 * décharge, évitent l'effet mécanique du « même zigzag à chaque tir » :
 *
 *  1. une COURBURE d'ensemble (`bow`) qui fait dévier tout l'éclair d'un côté ;
 *  2. un ZIGZAG perpendiculaire d'amplitude variable — certaines décharges sont
 *     nerveuses et serrées, d'autres larges et molles ;
 *  3. des RAMIFICATIONS qui partent en cul-de-sac et s'éteignent dans le vide —
 *     c'est surtout ça qui fait lire « foudre » plutôt que « trait tordu ».
 *
 * Les deux extrémités restent EXACTES (une enveloppe en sinus annule les
 * décalages aux bouts) : l'éclair part bien du lanceur et touche bien la cible,
 * sinon le joueur ne comprendrait plus qui est frappé.
 */

interface Pt {
  x: number;
  y: number;
}

/** Amplitude maximale du zigzag, en pixels — au-delà l'éclair devient illisible. */
const MAX_JITTER = 42;

export function drawChainBolt(scene: Phaser.Scene, x1: number, y1: number, x2: number, y2: number, color: number, width = 4, depth = 24): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // Perpendiculaire à la trajectoire : les écarts se font SUR LE CÔTÉ, pas au
  // hasard sur les axes de l'écran — un éclair diagonal serpente comme un
  // éclair horizontal.
  const px = -uy;
  const py = ux;

  // Caractère propre à cette décharge.
  const segs = 5 + Math.floor(Math.random() * 5); // 5 à 9 cassures
  const jitter = Math.min(MAX_JITTER, len * (0.06 + Math.random() * 0.13));
  const bow = (Math.random() < 0.5 ? -1 : 1) * len * (0.04 + Math.random() * 0.15);

  const nodes: Pt[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    // Enveloppe nulle aux extrémités, maximale au milieu.
    const env = Math.sin(t * Math.PI);
    const side = bow * env + (Math.random() * 2 - 1) * jitter * env;
    // Léger décalage LE LONG de l'axe aussi : sans lui les cassures restent
    // régulièrement espacées et l'œil retrouve le rythme mécanique.
    const along = i > 0 && i < segs ? (Math.random() * 2 - 1) * (len / segs) * 0.3 : 0;
    nodes.push({
      x: x1 + dx * t + px * side + ux * along,
      y: y1 + dy * t + py * side + uy * along,
    });
  }

  const g = scene.add.graphics().setDepth(depth);
  const stroke = (pts: Pt[], w: number, col: number, a: number): void => {
    g.lineStyle(w, col, a);
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.strokePath();
  };

  // Ramifications : elles s'arrêtent dans le vide, elles ne touchent personne.
  const branchCount = Math.random() < 0.72 ? 1 + Math.floor(Math.random() * 2) : 0;
  for (let b = 0; b < branchCount; b++) {
    const from = nodes[1 + Math.floor(Math.random() * Math.max(1, segs - 1))];
    const bLen = len * (0.1 + Math.random() * 0.2);
    const bAng = Math.atan2(uy, ux) + (Math.random() < 0.5 ? -1 : 1) * (0.45 + Math.random() * 0.85);
    const bSegs = 2 + Math.floor(Math.random() * 2);
    const bPts: Pt[] = [from];
    for (let k = 1; k <= bSegs; k++) {
      const t = k / bSegs;
      bPts.push({
        x: from.x + Math.cos(bAng) * bLen * t + (Math.random() * 2 - 1) * jitter * 0.45,
        y: from.y + Math.sin(bAng) * bLen * t + (Math.random() * 2 - 1) * jitter * 0.45,
      });
    }
    // Plus fines et plus pâles que le trait principal : ce sont des échos.
    stroke(bPts, width * 0.8 + 3, color, 0.28);
    stroke(bPts, Math.max(1, width * 0.5), 0xffffff, 0.7);
  }

  stroke(nodes, width + 9, color, 0.35); // halo large
  stroke(nodes, width + 4, color, 0.7); // halo coloré
  stroke(nodes, width + 1, 0xffffff, 1); // cœur blanc

  // Durée d'extinction elle aussi variable : deux éclairs successifs ne
  // disparaissent pas au même rythme.
  scene.tweens.add({ targets: g, alpha: 0, duration: 200 + Math.random() * 140, ease: 'Quad.in', onComplete: () => g.destroy() });
}
