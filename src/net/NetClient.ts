import { Client, type Room } from 'colyseus.js';
import { serverUrl } from './config';

/**
 * Fine surcouche autour du client Colyseus. Trois façons d'entrer en partie :
 *  - createRoom  : ouvre un nouveau salon (on partage son id = code).
 *  - joinRoom    : rejoint un ami via son code de salon.
 *  - quickMatch  : rejoint un salon ouvert au hasard, sinon en crée un.
 */
export class NetClient {
  private readonly client = new Client(serverUrl());

  createRoom(name: string): Promise<Room> {
    return this.client.create('nyxt', { name });
  }

  joinRoom(code: string, name: string): Promise<Room> {
    return this.client.joinById(code.trim(), { name });
  }

  quickMatch(name: string): Promise<Room> {
    return this.client.joinOrCreate('nyxt', { name });
  }
}
