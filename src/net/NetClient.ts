import { Client, type Room } from 'colyseus.js';
import { serverUrl } from './config';

/** Options envoyées au serveur en rejoignant un salon. */
export interface JoinOptions {
  name: string;
  zarek: string;
  team?: number;
  /** Mode ('brawl-ball' | 'battle-royale') — sert au filtrage du match rapide. */
  mode?: string;
}

/**
 * Fine surcouche autour du client Colyseus. Trois façons d'entrer en partie :
 *  - createRoom  : ouvre un nouveau salon (on partage son id = code).
 *  - joinRoom    : rejoint un ami via son code de salon.
 *  - quickMatch  : rejoint un salon ouvert au hasard, sinon en crée un.
 */
export class NetClient {
  private readonly client = new Client(serverUrl());

  createRoom(opts: JoinOptions): Promise<Room> {
    return this.client.create('nyxt', opts);
  }

  joinRoom(code: string, opts: JoinOptions): Promise<Room> {
    return this.client.joinById(code.trim(), opts);
  }

  quickMatch(opts: JoinOptions): Promise<Room> {
    return this.client.joinOrCreate('nyxt', opts);
  }
}
