/**
 * Préférences du joueur, persistées en localStorage (`nyxt.settings`).
 *
 * SOCLE VOLONTAIREMENT EXTENSIBLE : pour ajouter un réglage, il suffit de
 * l'ajouter à `Settings` + `DEFAULTS` ; le chargement (fusion avec les défauts),
 * la sauvegarde et la notification des abonnés suivent automatiquement, et
 * l'écran de configuration n'a qu'une ligne à déclarer.
 */

export interface Settings {
  /** Volume de la musique d'ambiance, 0 → 1. */
  musicVolume: number;
  /** Volume des effets sonores, 0 → 1. */
  sfxVolume: number;
}

export const DEFAULTS: Settings = {
  musicVolume: 0.6,
  sfxVolume: 1,
};

const KEY = 'nyxt.settings';
/** Ancienne clé (coupe-son binaire) — migrée puis supprimée au chargement. */
const LEGACY_MUTED_KEY = 'nyxt.muted';

function clamp01(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback;
}

class SettingsStore {
  private values: Settings = { ...DEFAULTS };
  private listeners: ((s: Settings) => void)[] = [];

  constructor() {
    if (typeof window === 'undefined') return; // tests Node : valeurs par défaut
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        this.values = {
          musicVolume: clamp01(parsed.musicVolume, DEFAULTS.musicVolume),
          sfxVolume: clamp01(parsed.sfxVolume, DEFAULTS.sfxVolume),
        };
      } else if (localStorage.getItem(LEGACY_MUTED_KEY) === '1') {
        // Migration : l'ancien bouton 🔇 coupait tout → les deux volumes à zéro.
        this.values = { musicVolume: 0, sfxVolume: 0 };
        this.persist();
      }
      localStorage.removeItem(LEGACY_MUTED_KEY);
    } catch {
      /* localStorage illisible : on reste sur les défauts */
    }
  }

  get(): Readonly<Settings> {
    return this.values;
  }

  /** Modifie un ou plusieurs réglages, persiste et prévient les abonnés. */
  set(patch: Partial<Settings>): void {
    this.values = { ...this.values, ...patch };
    this.persist();
    for (const fn of this.listeners) fn(this.values);
  }

  /** S'abonne aux changements (moteurs audio, écran de configuration…). */
  onChange(fn: (s: Settings) => void): void {
    this.listeners.push(fn);
  }

  /** Remet tous les réglages à leur valeur par défaut. */
  reset(): void {
    this.set({ ...DEFAULTS });
  }

  private persist(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.values));
    } catch {
      /* pas grave : le réglage ne survivra pas au rechargement */
    }
  }
}

/** Instance unique, partagée par tout le jeu. */
export const settings = new SettingsStore();
