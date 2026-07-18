import type { MapDef } from '../core/types';
import { ARENA_ROYALE } from './arenaRoyale';

/**
 * Registre des cartes. Ajouter une carte = l'importer et l'ajouter ici.
 */
export const MAPS: MapDef[] = [ARENA_ROYALE];

export const MAP_BY_ID: Record<string, MapDef> = Object.fromEntries(
  MAPS.map((m) => [m.id, m]),
);
