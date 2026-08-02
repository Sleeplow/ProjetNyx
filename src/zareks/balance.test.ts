import { describe, it, expect } from 'vitest';
import { ZAREKS, getZarek } from './registry';
import type { ZarekDef } from '../core/types';

/**
 * Garde-fou d'ÉQUILIBRAGE : le temps mis à remplir la jauge d'ultime.
 *
 * Le piège que ces tests verrouillent : `ultChargePerDamage` s'applique aux
 * DÉGÂTS infligés, donc deux Zareks au même coefficient peuvent charger à des
 * rythmes très différents si leurs profils de dégâts diffèrent. Astrapé, qui ne
 * touche qu'une cible sans rebond, mettait ainsi ~10 s là où Zephyr en met ~2,5.
 * On teste donc le TEMPS, la grandeur qui compte pour le joueur — pas le
 * coefficient, qui ne veut rien dire isolément.
 */

/** Dégâts par seconde en frappe continue sur une cible (modèle simple). */
function sustainedDps(def: ZarekDef): number {
  const a = def.attack;
  // Une potion n'inflige rien à l'impact : les dégâts viennent de sa flaque.
  if (a.kind === 'potion') return a.aoeDps ?? 0;
  return (a.count * a.damage) / (a.reloadMs / 1000);
}

/** Secondes de frappe continue pour remplir la jauge (0 → 100). */
function secondsToUlt(def: ZarekDef): number {
  return 100 / (sustainedDps(def) * def.ultChargePerDamage);
}

describe('charge d’ultime', () => {
  it('reste dans une fourchette jouable pour chaque Zarek', () => {
    for (const z of ZAREKS) {
      const t = secondsToUlt(z);
      // Bornes larges : on attrape une dérive grossière, pas un réglage fin.
      expect(t, `${z.name} met ${t.toFixed(1)} s`).toBeGreaterThan(1.5);
      expect(t, `${z.name} met ${t.toFixed(1)} s`).toBeLessThan(12);
    }
  });

  it('Astrapé charge un peu plus lentement que Zephyr et Atlas, sans décrocher', () => {
    const astrape = secondsToUlt(getZarek('astrape'));
    const zephyr = secondsToUlt(getZarek('zephyr'));
    const atlas = secondsToUlt(getZarek('atlas'));

    // Plus long que les deux autres : sa Surcharge touche jusqu'à 4 ennemis.
    expect(astrape).toBeGreaterThan(zephyr);
    expect(astrape).toBeGreaterThan(atlas);
    // …mais « un peu », pas le double du plus lent des deux.
    expect(astrape).toBeLessThan(Math.max(zephyr, atlas) * 1.8);
  });
});
