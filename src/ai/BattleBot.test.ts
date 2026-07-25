import { describe, it, expect } from 'vitest';
import { BattleBot, type BattleActor, type BattleWorld } from './BattleBot';

const RANGE = 300;

function actor(id: string, x: number, y: number, team: number): BattleActor {
  return {
    id,
    x,
    y,
    team,
    alive: true,
    aimAngle: 0,
    ultReady: false,
    healthRatio: 1,
    def: { radius: 20, moveSpeed: 200, attack: { range: RANGE } },
  };
}

function world(all: BattleActor[], cubes: BattleWorld['cubes'] = []): BattleWorld {
  return { all, cubes, zone: { x: 0, y: 0, r: 100000 }, obstacles: [], width: 2000, height: 2000 };
}

describe('BattleBot', () => {
  it('produit un InputState valide (déplacement borné, fini)', () => {
    const bot = new BattleBot(0);
    const self = actor('s', 0, 0, 0);
    const foe = actor('f', 0.65 * RANGE, 0, 1);
    const inp = bot.update(self, world([self, foe]), 33);
    expect(Number.isFinite(inp.moveX)).toBe(true);
    expect(Number.isFinite(inp.moveY)).toBe(true);
    expect(Math.hypot(inp.moveX, inp.moveY)).toBeLessThanOrEqual(1.0001);
  });

  it('anti-stalemate : face à un ennemi à distance de combat, le bot BOUGE (strafe)', () => {
    // Pour CHAQUE personnalité, un bot planté face à un ennemi à mi-portée doit
    // se déplacer (contourner) au lieu de rester figé à se mitrailler en miroir.
    for (let v = 0; v < 5; v++) {
      const bot = new BattleBot(v);
      const self = actor('s', 0, 0, 0);
      const foe = actor('f', 0.65 * RANGE, 0, 1);
      const inp = bot.update(self, world([self, foe]), 33);
      expect(Math.hypot(inp.moveX, inp.moveY)).toBeGreaterThan(0.2);
    }
  });

  it('tire quand l’ennemi est à portée', () => {
    const bot = new BattleBot(0);
    const self = actor('s', 0, 0, 0);
    const foe = actor('f', 0.5 * RANGE, 0, 1);
    const inp = bot.update(self, world([self, foe]), 33);
    expect(inp.attack).toBe(true);
  });

  it('en combat, dévie pour ramasser un cube proche (personnalité gourmande)', () => {
    // Ennemi à droite (+x), diamant juste au-dessus (+y) et proche : un bot
    // « farmer » doit majoritairement se diriger vers le cube au lieu de garder
    // son cap et de passer à côté de l'avantage.
    let towardCube = 0;
    const N = 30;
    for (let i = 0; i < N; i++) {
      const bot = new BattleBot(3); // farmer (gourmand)
      const self = actor('s', 0, 0, 0);
      const foe = actor('f', 0.65 * RANGE, 0, 1);
      const cube = { x: 0, y: 90, alive: true };
      const inp = bot.update(self, world([self, foe], [cube]), 33);
      if (inp.moveY > 0) towardCube++;
    }
    expect(towardCube).toBeGreaterThan(N / 2);
  });

  it('les bots ont des personnalités variées', () => {
    const names = new Set<string>();
    for (let i = 0; i < 50; i++) names.add(new BattleBot().personality);
    expect(names.size).toBeGreaterThan(1);
  });
});
