import type { ZarekDef } from '../core/types';
import type { SfxName } from './names';
import { ZAREKS } from '../zareks/registry';
import { COLORS } from '../config/constants';

/**
 * Résolution des sons SIGNATURE d'un Zarek, avec repli sur un son générique
 * quand le Zarek n'en déclare pas — ajouter un Zarek sans champ `sound` reste
 * donc parfaitement valide (il sonnera « générique »).
 */

/** Son de l'attaque de base : signature du Zarek, sinon selon le type d'attaque. */
export function attackSfx(def: ZarekDef): SfxName {
  if (def.sound?.attack) return def.sound.attack;
  if (def.attack.kind === 'potion') return 'potion';
  if (def.attack.kind === 'chain') return 'bolt';
  return 'shoot';
}

/** Son de l'ultimate : signature du Zarek, sinon le « boum » générique. */
export function ultSfx(def: ZarekDef): SfxName {
  return def.sound?.ult ?? 'ult';
}

/**
 * EN LIGNE : retrouve le Zarek à partir de la couleur portée par un événement
 * `fx` du snapshot. Le serveur envoie `c: def.color` (unique par Zarek) sur les
 * événements `ult` et `bolt` — c'est donc suffisant pour jouer le bon son
 * signature SANS toucher au protocole réseau (aucun redéploiement de la VM).
 * Exception : l'ultime « aura » envoie la couleur du poison, signature d'Hécate.
 */
export function zarekByFxColor(color: number | undefined): ZarekDef | undefined {
  if (color === undefined) return undefined;
  if (color === COLORS.poison) return ZAREKS.find((z) => z.ultimate.kind === 'aura');
  return ZAREKS.find((z) => z.color === color);
}
