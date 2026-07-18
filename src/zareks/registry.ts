import type { ZarekDef } from '../core/types';
import { ZEPHYR } from './zephyr';
import { ATLAS } from './atlas';

/**
 * Registre des Zareks jouables.
 *
 * Pour AJOUTER UN ZAREK : crée un fichier `src/zareks/monZarek.ts` exportant un
 * `ZarekDef`, importe-le ici et ajoute-le à la liste. Rien d'autre à toucher :
 * la sélection, le HUD et le combat le prennent en charge automatiquement.
 */
export const ZAREKS: ZarekDef[] = [ZEPHYR, ATLAS];

/** Ordre des Zareks utilisés pour les NPC (rotation). */
export const ZAREK_BY_ID: Record<string, ZarekDef> = Object.fromEntries(
  ZAREKS.map((z) => [z.id, z]),
);

export function getZarek(id: string): ZarekDef {
  const z = ZAREK_BY_ID[id];
  if (!z) throw new Error(`Zarek inconnu : ${id}`);
  return z;
}
