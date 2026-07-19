import { Room, type Client } from 'colyseus';
import { Schema, defineTypes } from '@colyseus/schema';
import { MatchSim } from '../src/shared/game/MatchSim';
import { emptyInput, type InputState } from '../src/core/types';

const TICK_MS = 1000 / 30; // 30 pas/seconde d'autorité serveur

/** État minimal du salon (schéma plat) — le match est diffusé en snapshots. */
class RoomInfo extends Schema {
  mode = 'brawl-ball';
}
defineTypes(RoomInfo, { mode: 'string' });

interface JoinOptions {
  name?: string;
  zarek?: string;
  team?: number;
}

/**
 * Un salon de jeu. Le serveur fait AUTORITÉ : il fait tourner la simulation de
 * match (Brawl Ball 3v3) à partir des `InputState` reçus et diffuse un snapshot
 * complet à chaque tick. L'id du salon sert de « code » à partager.
 */
export class GameRoom extends Room<RoomInfo> {
  maxClients = 6; // 6 humains max (3v3) ; les places vides sont des bots
  private sim = new MatchSim();

  onCreate(): void {
    this.setState(new RoomInfo());

    this.onMessage('input', (client, message: InputState) => this.sim.setInput(client.sessionId, sanitize(message)));
    this.onMessage('team', (client, message: number) => this.sim.chooseTeam(client.sessionId, message === 1 ? 1 : 0));
    this.onMessage('start', () => this.sim.requestStart());
    this.onMessage('rematch', () => this.sim.requestRematch());

    this.setSimulationInterval((dt) => this.tick(dt), TICK_MS);
  }

  onJoin(client: Client, options?: JoinOptions): void {
    const name = (options?.name ?? '').trim().slice(0, 16) || 'Joueur';
    const zarek = typeof options?.zarek === 'string' ? options.zarek : 'zephyr';
    const team = options?.team === 1 ? 1 : 0;
    this.sim.addPlayer(client.sessionId, name, zarek, team);
    console.log(`[${this.roomId}] join ${name} (${this.clients.length}/${this.maxClients})`);
  }

  onLeave(client: Client): void {
    this.sim.removePlayer(client.sessionId);
    console.log(`[${this.roomId}] leave ${client.sessionId}`);
  }

  private tick(dtMs: number): void {
    try {
      this.sim.step(dtMs);
      this.broadcast('snap', this.sim.snapshot());
    } catch (err) {
      console.error('Erreur de tick :', err);
    }
  }
}

/** Ne fait confiance à aucune entrée client : on borne tout. */
function sanitize(msg: Partial<InputState> | undefined): InputState {
  const inp = emptyInput();
  if (!msg) return inp;
  const num = (v: unknown, min: number, max: number): number => {
    const n = typeof v === 'number' && Number.isFinite(v) ? v : 0;
    return n < min ? min : n > max ? max : n;
  };
  inp.moveX = num(msg.moveX, -1, 1);
  inp.moveY = num(msg.moveY, -1, 1);
  inp.aimX = num(msg.aimX, -100000, 100000);
  inp.aimY = num(msg.aimY, -100000, 100000);
  inp.attack = !!msg.attack;
  inp.attackReleased = !!msg.attackReleased;
  inp.ultimate = !!msg.ultimate;
  return inp;
}
