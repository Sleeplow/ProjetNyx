import type { Rect } from './types';

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function len(x: number, y: number): number {
  return Math.hypot(x, y);
}

/** Normalise un vecteur ; renvoie (0,0) si sa longueur est nulle. */
export function normalize(x: number, y: number): { x: number; y: number } {
  const l = Math.hypot(x, y);
  if (l < 1e-6) return { x: 0, y: 0 };
  return { x: x / l, y: y / l };
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

export function pointInRect(px: number, py: number, r: Rect): boolean {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

/**
 * Résout la collision d'un cercle (cx, cy, radius) contre un rectangle.
 * Renvoie la nouvelle position du centre poussée hors du rectangle, ou `null`
 * s'il n'y a pas de collision.
 */
export function resolveCircleRect(
  cx: number,
  cy: number,
  radius: number,
  r: Rect,
): { x: number; y: number } | null {
  const nearestX = clamp(cx, r.x, r.x + r.w);
  const nearestY = clamp(cy, r.y, r.y + r.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  const d2 = dx * dx + dy * dy;

  if (d2 >= radius * radius) return null;

  if (d2 > 1e-6) {
    const d = Math.sqrt(d2);
    const push = radius - d;
    return { x: cx + (dx / d) * push, y: cy + (dy / d) * push };
  }

  // Centre à l'intérieur du rectangle : pousser sur l'axe de moindre pénétration.
  const left = cx - r.x;
  const right = r.x + r.w - cx;
  const top = cy - r.y;
  const bottom = r.y + r.h - cy;
  const minH = Math.min(left, right);
  const minV = Math.min(top, bottom);
  if (minH < minV) {
    return { x: left < right ? r.x - radius : r.x + r.w + radius, y: cy };
  }
  return { x: cx, y: top < bottom ? r.y - radius : r.y + r.h + radius };
}

/** Collision cercle vs rectangle (booléen simple, sans résolution). */
export function circleHitsRect(cx: number, cy: number, radius: number, r: Rect): boolean {
  const nearestX = clamp(cx, r.x, r.x + r.w);
  const nearestY = clamp(cy, r.y, r.y + r.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < radius * radius;
}
