import { describe, it, expect } from 'vitest';
import { clamp, normalize, dist, pointInRect, circleHitsRect, resolveCircleRect } from './geometry';

describe('clamp', () => {
  it('borne dans l’intervalle', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

describe('normalize', () => {
  it('renvoie (0,0) pour un vecteur nul', () => {
    expect(normalize(0, 0)).toEqual({ x: 0, y: 0 });
  });
  it('produit un vecteur unitaire', () => {
    const n = normalize(3, 4);
    expect(Math.hypot(n.x, n.y)).toBeCloseTo(1, 6);
    expect(n.x).toBeCloseTo(0.6, 6);
    expect(n.y).toBeCloseTo(0.8, 6);
  });
});

describe('dist', () => {
  it('distance euclidienne', () => {
    expect(dist(0, 0, 3, 4)).toBe(5);
  });
});

describe('pointInRect', () => {
  const r = { x: 0, y: 0, w: 10, h: 10 };
  it('intérieur / bord / extérieur', () => {
    expect(pointInRect(5, 5, r)).toBe(true);
    expect(pointInRect(0, 0, r)).toBe(true);
    expect(pointInRect(11, 5, r)).toBe(false);
  });
});

describe('circleHitsRect', () => {
  const r = { x: 0, y: 0, w: 10, h: 10 };
  it('détecte le chevauchement', () => {
    expect(circleHitsRect(5, 5, 2, r)).toBe(true); // centre dedans
    expect(circleHitsRect(-1, 5, 2, r)).toBe(true); // frôle le bord gauche
    expect(circleHitsRect(20, 20, 2, r)).toBe(false); // loin
  });
});

describe('resolveCircleRect', () => {
  const r = { x: 0, y: 0, w: 10, h: 10 };
  it('null quand pas de collision', () => {
    expect(resolveCircleRect(20, 20, 2, r)).toBeNull();
  });
  it('repousse un cercle qui chevauche un coin jusqu’au contact (distance = rayon)', () => {
    const res = resolveCircleRect(-1, -1, 3, r);
    expect(res).not.toBeNull();
    // Le centre est poussé le long de la diagonale du coin (0,0) : il reste dans
    // le quadrant extérieur et se retrouve à exactement `rayon` du coin.
    expect(res!.x).toBeLessThan(0);
    expect(res!.y).toBeLessThan(0);
    expect(dist(res!.x, res!.y, 0, 0)).toBeCloseTo(3, 5);
  });
  it('repousse un centre à l’intérieur sur l’axe de moindre pénétration', () => {
    // Centre proche du bord gauche → poussé à gauche (x négatif).
    const res = resolveCircleRect(1, 5, 3, r);
    expect(res).not.toBeNull();
    expect(res!.x).toBeLessThan(0);
    expect(res!.y).toBe(5);
  });
});
