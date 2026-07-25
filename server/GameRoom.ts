import { Room, type Client, ServerError } from 'colyseus';
import { Schema, defineTypes } from '@colyseus/schema';
import { MatchSim, type OnlineMode } from '../src/shared/game/MatchSim';
import { emptyInput, type InputState } from '../src/core/types';
import { PROTOCOL_VERSION } from '../src/shared/version';

const TICK_MS = 1000 / 30; // 30 pas/seconde d'autorité serveur

/** Plafond de salons simultanés (anti-abus : borne la charge de la petite VM). */
const MAX_ROOMS = 50;
let activeRooms = 0;

/** Codes d'erreur renvoyés au client (interprétés côté OnlineMenuScene). */
const ERR_VERSION_MISMATCH = 4001;
const ERR_SERVER_FULL = 4002;

/** État minimal du salon (schéma plat) — le match est diffusé en snapshots. */
class RoomInfo extends Schema {
  mode = 'brawl-ball';
}
defineTypes(RoomInfo, { mode: 'string' });

interface JoinOptions {
  name?: string;
  zarek?: string;
  team?: number;
  mode?: string;
  /** Version de protocole envoyée par le client (voir src/shared/version). */
  v?: number;
  /** Salon privé (créé via « Créer un salon ») : non listé, injoignable au hasard. */
  private?: boolean;
}

/**
 * Un salon de jeu. Le serveur fait AUTORITÉ : il fait tourner la simulation de
 * match (Brawl Ball 3v3) à partir des `InputState` reçus et diffuse un snapshot
 * complet à chaque tick. L'id du salon sert de « code » à partager.
 */
export class GameRoom extends Room<RoomInfo> {
  maxClients = 6; // 6 humains max ; les places vides sont des bots (3v3 ou BR à 6)
  private sim!: MatchSim;

  /**
   * Handshake de version : refuse un client dont la version de protocole diffère.
   * Tolérance transitoire — un client SANS version (d'avant le handshake, ex. la
   * prod pas encore redéployée) est accepté le temps que ça se propage. À durcir
   * (refuser aussi l'absence de `v`) une fois la prod à jour.
   */
  onAuth(_client: Client, options?: JoinOptions): boolean {
    const v = options?.v;
    if (typeof v === 'number' && v !== PROTOCOL_VERSION) {
      throw new ServerError(ERR_VERSION_MISMATCH, 'VERSION_MISMATCH');
    }
    return true;
  }

  async onCreate(options?: JoinOptions): Promise<void> {
    // Anti-abus : borne le nombre de salons simultanés sur la petite VM.
    if (activeRooms >= MAX_ROOMS) throw new ServerError(ERR_SERVER_FULL, 'SERVER_FULL');
    activeRooms++;

    const mode: OnlineMode =
      options?.mode === 'battle-royale' ? 'battle-royale' : options?.mode === 'battle-royale-portal' ? 'battle-royale-portal' : 'brawl-ball';
    this.sim = new MatchSim(mode);
    const info = new RoomInfo();
    info.mode = mode;
    this.setState(info);
    this.setMetadata({ mode });

    // « Créer un salon » → salon privé : le « Match rapide » n'y atterrit jamais,
    // seul le code (id du salon) permet d'entrer.
    if (options?.private) await this.setPrivate(true);

    this.onMessage('input', (client, message: InputState) => this.sim.setInput(client.sessionId, sanitize(message)));
    this.onMessage('team', (client, message: number) => this.sim.chooseTeam(client.sessionId, message === 1 ? 1 : 0));
    this.onMessage('start', () => this.sim.requestStart());
    this.onMessage('rematch', () => this.sim.requestRematch());

    this.setSimulationInterval((dt) => this.tick(dt), TICK_MS);
  }

  onDispose(): void {
    activeRooms = Math.max(0, activeRooms - 1);
  }

  onJoin(client: Client, options?: JoinOptions): void {
    // Sanitize serveur : longueur bornée + retrait des caractères de contrôle
    // (le client filtre déjà, mais le serveur ne fait confiance à personne).
    const name = (options?.name ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 16) || 'Joueur';
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
