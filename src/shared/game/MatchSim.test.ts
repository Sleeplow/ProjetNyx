import { describe, it, expect } from 'vitest';
import { MatchSim } from './MatchSim';

const DT = 1000 / 30; // même pas que le serveur (30 Hz)

/** Avance la simulation jusqu'à ce que `pred` soit vrai (ou `maxSteps` atteint). */
function stepUntil(sim: MatchSim, pred: (s: MatchSim) => boolean, maxSteps = 30000): number {
  for (let i = 0; i < maxSteps; i++) {
    sim.step(DT);
    if (pred(sim)) return i;
  }
  return -1;
}

describe('MatchSim — salle d’attente', () => {
  it('démarre en lobby, sans humain', () => {
    const sim = new MatchSim('battle-royale');
    expect(sim.phase).toBe('lobby');
    expect(sim.humanCount()).toBe(0);
  });

  it('compte les humains ajoutés', () => {
    const sim = new MatchSim('battle-royale');
    sim.addPlayer('p1', 'Alice', 'zephyr', 0);
    expect(sim.humanCount()).toBe(1);
    expect(sim.phase).toBe('lobby');
  });
});

describe('MatchSim — Battle Royale', () => {
  it('complète à 6, joue, et se termine sur un résultat', () => {
    const sim = new MatchSim('battle-royale');
    sim.addPlayer('p1', 'Alice', 'zephyr', 0);
    sim.requestStart();
    expect(sim.phase).toBe('countdown');

    const snap0 = sim.snapshot();
    expect(snap0.players).toHaveLength(6); // 1 humain + 5 bots
    expect(snap0.mode).toBe('battle-royale');

    const steps = stepUntil(sim, (s) => s.phase === 'ended');
    expect(steps).toBeGreaterThanOrEqual(0); // la manche se termine (zone ou temps)

    const snap = sim.snapshot();
    expect(snap.phase).toBe('ended');
    expect(typeof snap.winner).toBe('number');
    // Le classement cumulatif contient les 6 participants, avec des scores numériques.
    expect(snap.board).toHaveLength(6);
    for (const e of snap.board ?? []) expect(typeof e.s).toBe('number');
  });

  it('expose zone + cubes pendant la manche', () => {
    const sim = new MatchSim('battle-royale');
    sim.addPlayer('p1', 'Alice', 'atlas', 0);
    sim.requestStart();
    stepUntil(sim, (s) => s.phase === 'playing');
    const snap = sim.snapshot();
    expect(snap.zone).toBeDefined();
    expect(Array.isArray(snap.cubes)).toBe(true);
    expect(typeof snap.alive).toBe('number');
  });

  it('la revanche remet en lobby', () => {
    const sim = new MatchSim('battle-royale');
    sim.addPlayer('p1', 'Alice', 'zephyr', 0);
    sim.requestStart();
    stepUntil(sim, (s) => s.phase === 'ended');
    sim.requestRematch();
    expect(sim.phase).toBe('lobby');
  });
});

describe('MatchSim — Brawl Ball', () => {
  it('complète les deux équipes à 3 et atteint le jeu', () => {
    const sim = new MatchSim('brawl-ball');
    sim.addPlayer('p1', 'Bob', 'atlas', 0);
    sim.requestStart();
    expect(sim.phase).toBe('countdown');

    const snap0 = sim.snapshot();
    expect(snap0.players).toHaveLength(6); // 3 v 3
    expect(snap0.mode).toBe('brawl-ball');

    const steps = stepUntil(sim, (s) => s.phase === 'playing');
    expect(steps).toBeGreaterThanOrEqual(0);
    expect(sim.snapshot().ball).toBeDefined();
  });
});
