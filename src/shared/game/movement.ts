import type { Rect } from '../../core/types';
import { clamp, normalize, resolveCircleRect } from '../../core/geometry';

/**
 * Un pas de déplacement d'un combattant : normalise l'intention, avance, borne
 * au terrain, résout les collisions avec les murs. PARTAGÉ entre le serveur
 * (autorité) et le client (prédiction locale) pour rester cohérent.
 */
export function stepMovement(
  x: number,
  y: number,
  radius: number,
  moveX: number,
  moveY: number,
  speed: number,
  dtSec: number,
  obstacles: Rect[],
  width: number,
  height: number,
): { x: number; y: number } {
  const mv = normalize(moveX, moveY);
  let nx = x + mv.x * speed * dtSec;
  let ny = y + mv.y * speed * dtSec;
  nx = clamp(nx, radius, width - radius);
  ny = clamp(ny, radius, height - radius);
  for (const ob of obstacles) {
    const res = resolveCircleRect(nx, ny, radius, ob);
    if (res) {
      nx = res.x;
      ny = res.y;
    }
  }
  return { x: clamp(nx, radius, width - radius), y: clamp(ny, radius, height - radius) };
}
