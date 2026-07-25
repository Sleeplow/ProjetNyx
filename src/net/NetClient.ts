import { Client, type Room } from 'colyseus.js';
import { serverUrl } from './config';
import { PROTOCOL_VERSION } from '../shared/version';

/** Options envoyées au serveur en rejoignant un salon. */
export interface JoinOptions {
  name: string;
  zarek: string;
  team?: number;
  /** Mode ('brawl-ball' | 'battle-royale') — sert au filtrage du match rapide. */
  mode?: string;
  /** Version de protocole (injectée par NetClient — voir shared/version). */
  v?: number;
  /** Salon privé (injecté par createRoom) : non listé, non rejoignable au hasard. */
  private?: boolean;
}

/**
 * Fine surcouche autour du client Colyseus. Trois façons d'entrer en partie :
 *  - createRoom  : ouvre un nouveau salon PRIVÉ (on partage son id = code).
 *  - joinRoom    : rejoint un ami via son code de salon.
 *  - quickMatch  : rejoint un salon ouvert au hasard, sinon en crée un.
 *
 * La version de protocole est ajoutée à chaque appel : le serveur refuse un
 * client incompatible (voir GameRoom.onAuth).
 */
export class NetClient {
  private readonly client = new Client(serverUrl());

  /** Options complétées avec la version de protocole. */
  private withVersion(opts: JoinOptions, extra?: Partial<JoinOptions>): JoinOptions {
    return { ...opts, v: PROTOCOL_VERSION, ...extra };
  }

  createRoom(opts: JoinOptions): Promise<Room> {
    // Salon créé pour jouer avec un ami : privé → « Match rapide » n'y atterrit pas.
    return this.client.create('nyxt', this.withVersion(opts, { private: true }));
  }

  joinRoom(code: string, opts: JoinOptions): Promise<Room> {
    return this.client.joinById(code.trim(), this.withVersion(opts));
  }

  quickMatch(opts: JoinOptions): Promise<Room> {
    return this.client.joinOrCreate('nyxt', this.withVersion(opts));
  }
}
