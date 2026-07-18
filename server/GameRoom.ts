import { Room, type Client } from 'colyseus';
import { Schema, defineTypes } from '@colyseus/schema';
import { ArenaSim } from '../src/shared/ArenaSim';
import { emptyInput, type InputState } from '../src/core/types';

const TICK_MS = 1000 / 30; // 30 pas/seconde d'autorité serveur

/** État minimal du salon (schéma plat) — les joueurs sont diffusés en snapshots. */
class RoomInfo extends Schema {
  mapId = 'pitch-nyxt';
}
defineTypes(RoomInfo, { mapId: 'string' });

/** Un joueur dans un snapshot réseau (clés courtes pour alléger). */
interface SnapPlayer {
  i: string; // id
  n: string; // pseudo
  t: number; // équipe
  x: number;
  y: number;
  a: number; // angle de visée
}

/**
 * Un salon de jeu. Le serveur fait AUTORITÉ : il fait tourner la simulation
 * partagée à partir des `InputState` reçus et diffuse un snapshot des positions
 * à chaque tick. Chaque salon a un id (= code à partager pour jouer avec un ami).
 */
export class GameRoom extends Room<RoomInfo> {
  maxClients = 10;
  private sim = new ArenaSim();

  onCreate(): void {
    this.setState(new RoomInfo());

    this.onMessage('input', (client, message: InputState) => {
      this.sim.setInput(client.sessionId, sanitize(message));
    });

    this.setSimulationInterval((dt) => this.tick(dt), TICK_MS);
  }

  onJoin(client: Client, options?: { name?: string }): void {
    const name = (options?.name ?? '').trim().slice(0, 16) || 'Joueur';
    this.sim.addPlayer(client.sessionId, name);
    console.log(`[${this.roomId}] join ${name} (${this.clients.length}/${this.maxClients})`);
  }

  onLeave(client: Client): void {
    this.sim.removePlayer(client.sessionId);
    console.log(`[${this.roomId}] leave ${client.sessionId}`);
  }

  private tick(dtMs: number): void {
    try {
      this.sim.step(dtMs / 1000);
      const snap: SnapPlayer[] = [];
      for (const p of this.sim.players.values()) {
        snap.push({ i: p.id, n: p.name, t: p.team, x: Math.round(p.x), y: Math.round(p.y), a: Math.round(p.aimAngle * 100) / 100 });
      }
      this.broadcast('snap', snap);
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
