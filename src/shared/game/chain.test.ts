import { describe, it, expect } from 'vitest';
import { resolveChain, type ChainNode } from './chain';

const n = (x: number, y: number, radius = 10): ChainNode => ({ x, y, radius });

describe('resolveChain', () => {
  it('aucune cible → aucun impact', () => {
    expect(resolveChain(0, 0, [], 100, 100, 2)).toEqual([]);
  });

  it('foudroie la cible à portée', () => {
    expect(resolveChain(0, 0, [n(50, 0)], 100, 100, 2)).toEqual([0]);
  });

  it('ignore une cible hors de portée', () => {
    expect(resolveChain(0, 0, [n(200, 0)], 100, 100, 2)).toEqual([]);
  });

  it('rebondit vers la plus proche non touchée, dans la limite des sauts', () => {
    // A(50) atteint depuis l’origine ; B(90) atteint depuis A (40 ≤ 60) ;
    // C(300) hors du saut depuis B → chaîne = [A, B].
    const hits = resolveChain(0, 0, [n(50, 0), n(90, 0), n(300, 0)], 100, 60, 2);
    expect(hits).toEqual([0, 1]);
  });

  it('maxJumps=0 ne touche que la première cible', () => {
    expect(resolveChain(0, 0, [n(50, 0), n(90, 0)], 100, 60, 0)).toEqual([0]);
  });

  it('ne touche jamais deux fois la même cible', () => {
    const hits = resolveChain(0, 0, [n(30, 0), n(60, 0), n(90, 0)], 100, 60, 5);
    expect(new Set(hits).size).toBe(hits.length);
  });
});
