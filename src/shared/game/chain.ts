/** Une cible potentielle d'un éclair en chaîne. */
export interface ChainNode {
  x: number;
  y: number;
  radius: number;
}

/**
 * Résout un éclair en chaîne, PARTAGÉ solo + serveur.
 *
 * Depuis (sx, sy) on foudroie la cible la plus proche dans `firstRange`, puis on
 * rebondit vers la plus proche NON ENCORE touchée dans `jumpRange`, jusqu'à
 * `maxJumps` rebonds. Renvoie les indices des cibles touchées, dans l'ordre.
 */
export function resolveChain(sx: number, sy: number, nodes: ChainNode[], firstRange: number, jumpRange: number, maxJumps: number): number[] {
  const hits: number[] = [];
  const used = new Set<number>();
  let cx = sx;
  let cy = sy;
  let range = firstRange;
  // step 0 = première cible ; steps suivants = rebonds.
  for (let step = 0; step <= maxJumps; step++) {
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < nodes.length; i++) {
      if (used.has(i)) continue;
      const n = nodes[i];
      const d = Math.hypot(n.x - cx, n.y - cy);
      if (d <= range + n.radius && d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best < 0) break;
    used.add(best);
    hits.push(best);
    cx = nodes[best].x;
    cy = nodes[best].y;
    range = jumpRange;
  }
  return hits;
}
