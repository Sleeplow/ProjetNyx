/**
 * Éléments de décor bakés (rochers, buissons…) via le skill `sprite-bake`
 * (pack KayKit Forest Nature). Contrairement aux Zareks, ce sont des objets
 * STATIQUES : un seul rendu par variante (pas de directions ni d'animation) —
 * la variété visuelle vient du choix du modèle source, pas d'une rotation.
 */
export interface PropDef {
  key: string;
  file: string;
  /** Échelle par défaut (image bakée 256px → taille écran raisonnable). */
  scale: number;
}

export const PROPS: PropDef[] = [
  { key: 'prop_rock1', file: 'rock1.png', scale: 0.5 }, // radius 0.50 — rocher simple
  { key: 'prop_rock2', file: 'rock2.png', scale: 0.85 }, // radius 1.52 — gros bloc rocheux
  { key: 'prop_rock3', file: 'rock3.png', scale: 0.65 }, // radius 0.76 — rocher moyen
  { key: 'prop_bush1', file: 'bush1.png', scale: 0.9 }, // radius 0.21 — petit buisson rond
  { key: 'prop_bush2', file: 'bush2.png', scale: 0.55 }, // radius 1.14 — haie taillée
];

export const ROCK_KEYS = ['prop_rock1', 'prop_rock2', 'prop_rock3'];
export const BUSH_KEYS = ['prop_bush1', 'prop_bush2'];

/** Choix stable (déterministe) d'une variante selon une position — les mêmes
 * coordonnées donnent toujours la même variante (pas de scintillement au
 * redraw), sans dépendre d'un compteur externe. */
export function pickPropKey(keys: string[], x: number, y: number): string {
  const h = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
  return keys[Math.floor(h * keys.length) % keys.length];
}

export function propScale(key: string): number {
  return PROPS.find((p) => p.key === key)?.scale ?? 1;
}
