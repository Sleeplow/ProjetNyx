import type { InputState } from '../core/types';
import { PITCH_NYXT } from '../maps/pitchNyxt';
import { clamp, normalize, resolveCircleRect } from '../core/geometry';

/**
 * Simulation d'arène PARTAGÉE (client + serveur), volontairement SANS Phaser :
 * uniquement de la logique et des maths. Le serveur en fait autorité (il la fait
 * tourner et diffuse l'état) ; on pourra plus tard la faire tourner aussi côté
 * client pour de la prédiction. C'est la suite directe de notre couture
 * « net-ready » : la sim consomme des `InputState`, peu importe leur origine.
 *
 * Slice 1 (fondation réseau) : déplacement seul sur le terrain, avec collisions
 * murs et séparation des joueurs. Le combat/la balle viendront ensuite, une fois
 * la boucle réseau validée.
 */
export interface SimPlayer {
  id: string;
  name: string;
  team: number;
  x: number;
  y: number;
  aimAngle: number;
  radius: number;
  moveSpeed: number;
}

const RADIUS = 26;
const SPEED = 300;

export class ArenaSim {
  readonly players = new Map<string, SimPlayer>();
  private readonly inputs = new Map<string, InputState>();
  private readonly map = PITCH_NYXT.map;

  addPlayer(id: string, name: string): SimPlayer {
    // Équilibre les équipes, puis place au prochain emplacement libre de l'équipe.
    const team0 = this.countTeam(0);
    const team1 = this.countTeam(1);
    const team = team0 <= team1 ? 0 : 1;
    const spawns = team === 0 ? PITCH_NYXT.spawnsTeam0 : PITCH_NYXT.spawnsTeam1;
    const sp = spawns[(team === 0 ? team0 : team1) % spawns.length];
    const p: SimPlayer = { id, name, team, x: sp.x, y: sp.y, aimAngle: 0, radius: RADIUS, moveSpeed: SPEED };
    this.players.set(id, p);
    return p;
  }

  removePlayer(id: string): void {
    this.players.delete(id);
    this.inputs.delete(id);
  }

  setInput(id: string, input: InputState): void {
    if (this.players.has(id)) this.inputs.set(id, input);
  }

  private countTeam(team: number): number {
    let n = 0;
    for (const p of this.players.values()) if (p.team === team) n++;
    return n;
  }

  step(dtSec: number): void {
    for (const p of this.players.values()) {
      const inp = this.inputs.get(p.id);
      if (!inp) continue;
      if (inp.aimX !== 0 || inp.aimY !== 0) p.aimAngle = Math.atan2(inp.aimY, inp.aimX);

      const mv = normalize(inp.moveX, inp.moveY);
      let nx = p.x + mv.x * p.moveSpeed * dtSec;
      let ny = p.y + mv.y * p.moveSpeed * dtSec;
      nx = clamp(nx, p.radius, this.map.width - p.radius);
      ny = clamp(ny, p.radius, this.map.height - p.radius);
      for (const ob of this.map.obstacles) {
        const res = resolveCircleRect(nx, ny, p.radius, ob);
        if (res) {
          nx = res.x;
          ny = res.y;
        }
      }
      p.x = clamp(nx, p.radius, this.map.width - p.radius);
      p.y = clamp(ny, p.radius, this.map.height - p.radius);
    }
    this.separate();
  }

  private separate(): void {
    const arr = [...this.players.values()];
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      for (let j = i + 1; j < arr.length; j++) {
        const b = arr[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const minD = a.radius + b.radius;
        if (d > 0 && d < minD) {
          const push = (minD - d) / 2;
          const nx = dx / d;
          const ny = dy / d;
          a.x = clamp(a.x - nx * push, a.radius, this.map.width - a.radius);
          a.y = clamp(a.y - ny * push, a.radius, this.map.height - a.radius);
          b.x = clamp(b.x + nx * push, b.radius, this.map.width - b.radius);
          b.y = clamp(b.y + ny * push, b.radius, this.map.height - b.radius);
        }
      }
    }
  }
}
