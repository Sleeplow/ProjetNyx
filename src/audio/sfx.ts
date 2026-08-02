/**
 * Effets sonores SYNTHÉTISÉS en Web Audio — aucun fichier audio à télécharger
 * (style jsfxr / rétro-arcade, cohérent avec le rendu cartoon). Chaque son est
 * une petite recette d'oscillateurs + bruit blanc, jouée à la demande.
 *
 * Points clés :
 * - L'AudioContext n'est créé (et « débloqué ») qu'au premier geste utilisateur,
 *   comme l'exigent les navigateurs (autoplay policy), via un écouteur global.
 * - Deux bus séparés : effets et musique, chacun piloté par son propre réglage
 *   de volume persistant (voir `config/settings.ts` et l'écran Configuration).
 * - Anti-spam : un même son ne rejoue pas avant un court délai (les tirs de
 *   8 combattants ne doivent pas devenir une bouillie saturée).
 * - `volumeAt(distance)` : atténuation spatiale simple pour les événements
 *   lointains (un tir à l'autre bout de la carte s'entend à peine).
 */

import type { SfxName } from './names';
import { settings } from '../config/settings';

export type { SfxName };

/** Marge de sécurité des bus (avant application du volume choisi par le joueur). */
const MASTER_HEADROOM = 0.5;
/** La musique reste volontairement SOUS les effets : elle porte l'ambiance. */
const MUSIC_HEADROOM = 0.35;

interface PlayOpts {
  /** Volume relatif 0..1 (défaut 1). Multiplié par le volume propre du son. */
  volume?: number;
}

/** Délai minimal entre deux lectures du même son (ms). */
const THROTTLE_MS: Partial<Record<SfxName, number>> = {
  shoot: 70,
  shoot_wave: 70,
  shoot_heavy: 70,
  rock_break: 60,
  hit: 60,
  bolt: 90,
  bolt_astrape: 90,
  death: 120,
  cube: 80,
};
const THROTTLE_DEFAULT_MS = 45;

class SfxEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private lastPlay = new Map<SfxName, number>();
  /** Abonnés au déblocage de l'audio (1er geste utilisateur) — voir onUnlock. */
  private unlockListeners: (() => void)[] = [];
  private unlocked = false;

  constructor() {
    // Environnement sans navigateur (tests vitest en Node) : moteur inerte.
    if (typeof window === 'undefined') return;
    // Débloque l'audio au premier geste — indispensable sur iOS/Safari où un
    // contexte créé hors geste reste « suspended » pour toujours.
    const unlock = (): void => {
      this.ensureContext();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    // Le volume des effets est un réglage joueur : appliqué au bus à chaud.
    settings.onChange((s) => {
      if (this.master) this.master.gain.value = MASTER_HEADROOM * s.sfxVolume;
    });
  }

  /**
   * S'abonne au déblocage de l'audio (premier geste utilisateur). La MUSIQUE
   * s'en sert : une piste demandée avant le premier clic ne peut pas démarrer,
   * elle est lancée ici dès que le contexte devient actif.
   */
  onUnlock(fn: () => void): void {
    if (this.unlocked) fn();
    else this.unlockListeners.push(fn);
  }

  /**
   * Contexte audio partagé, prêt à l'emploi (créé au premier geste utilisateur).
   * Exposé pour le moteur de MUSIQUE, qui doit programmer ses notes sur la même
   * horloge et passer par le même bus — un second AudioContext serait refusé ou
   * désynchronisé sur mobile.
   */
  audioContext(): AudioContext | null {
    const ctx = this.ensureContext();
    return ctx && ctx.state === 'running' ? ctx : null;
  }

  /** Bus dédié à la musique (volume propre, plus bas que les effets). */
  musicBus(): GainNode | null {
    this.ensureContext();
    return this.musicGain;
  }

  /**
   * Atténuation spatiale : plein volume à moins de 420 px, silence au-delà de
   * ~1500 px (l'écran fait ~1000 px de large — au-delà, c'est du hors-champ).
   */
  volumeAt(distance: number): number {
    if (distance <= 420) return 1;
    return Math.max(0, 1 - (distance - 420) / 1100);
  }

  play(name: SfxName, opts?: PlayOpts): void {
    const vol = opts?.volume ?? 1;
    if (settings.get().sfxVolume <= 0 || vol <= 0.02) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    const now = performance.now();
    const last = this.lastPlay.get(name) ?? -Infinity;
    if (now - last < (THROTTLE_MS[name] ?? THROTTLE_DEFAULT_MS)) return;
    this.lastPlay.set(name, now);

    this.recipes[name](ctx.currentTime, vol);
  }

  // ---------- Contexte ----------

  private ensureContext(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        const s = settings.get();
        // Marge anti-saturation quand tout tire en même temps, × réglage joueur.
        this.master = this.ctx.createGain();
        this.master.gain.value = MASTER_HEADROOM * s.sfxVolume;
        this.master.connect(this.ctx.destination);
        // Bus musique séparé : volontairement discret pour rester SOUS les
        // effets — la musique porte l'ambiance, elle ne masque pas le gameplay.
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = MUSIC_HEADROOM * s.musicVolume;
        this.musicGain.connect(this.ctx.destination);
      } catch {
        return null; // Web Audio indisponible : le jeu reste simplement muet
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.ctx.state === 'running' && !this.unlocked) {
      this.unlocked = true;
      const pending = this.unlockListeners;
      this.unlockListeners = [];
      for (const fn of pending) fn();
    }
    return this.ctx;
  }

  // ---------- Briques de synthèse ----------

  /** Un oscillateur avec glissando de fréquence et enveloppe percussive. */
  private tone(
    t0: number,
    o: { type?: OscillatorType; from: number; to?: number; dur: number; vol: number; delay?: number },
  ): void {
    const ctx = this.ctx!;
    const start = t0 + (o.delay ?? 0);
    const osc = ctx.createOscillator();
    osc.type = o.type ?? 'square';
    osc.frequency.setValueAtTime(o.from, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.to ?? o.from), start + o.dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(o.vol, start + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, start + o.dur);
    osc.connect(g).connect(this.master!);
    osc.start(start);
    osc.stop(start + o.dur + 0.02);
  }

  /** Une bouffée de bruit blanc filtrée (impacts, explosions, splash). */
  private noise(
    t0: number,
    o: { dur: number; vol: number; filter?: BiquadFilterType; from?: number; to?: number; delay?: number },
  ): void {
    const ctx = this.ctx!;
    const start = t0 + (o.delay ?? 0);
    if (!this.noiseBuf) {
      const len = Math.floor(ctx.sampleRate * 0.5);
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = o.filter ?? 'lowpass';
    filter.frequency.setValueAtTime(o.from ?? 1200, start);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, o.to ?? o.from ?? 1200), start + o.dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(o.vol, start + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, start + o.dur);
    src.connect(filter).connect(g).connect(this.master!);
    src.start(start);
    src.stop(start + o.dur + 0.02);
  }

  // ---------- Recettes ----------

  private readonly recipes: Record<SfxName, (t: number, v: number) => void> = {
    click: (t, v) => {
      this.tone(t, { type: 'triangle', from: 620, to: 480, dur: 0.06, vol: 0.25 * v });
    },
    shoot: (t, v) => {
      // Léger désaccord aléatoire : 8 combattants qui tirent ne font pas « la même note ».
      const f = 760 + Math.random() * 160;
      this.tone(t, { type: 'square', from: f, to: 180, dur: 0.11, vol: 0.16 * v });
    },
    bolt: (t, v) => {
      this.tone(t, { type: 'sawtooth', from: 1400, to: 140, dur: 0.16, vol: 0.18 * v });
      this.noise(t, { dur: 0.12, vol: 0.12 * v, filter: 'highpass', from: 2400, to: 900 });
    },
    potion: (t, v) => {
      this.tone(t, { type: 'sine', from: 280, to: 540, dur: 0.16, vol: 0.2 * v });
    },
    splash: (t, v) => {
      this.noise(t, { dur: 0.26, vol: 0.2 * v, from: 1000, to: 220 });
      this.tone(t, { type: 'sine', from: 220, to: 90, dur: 0.2, vol: 0.14 * v });
    },
    hit: (t, v) => {
      this.tone(t, { type: 'square', from: 320, to: 110, dur: 0.07, vol: 0.2 * v });
      this.noise(t, { dur: 0.06, vol: 0.14 * v, filter: 'bandpass', from: 1900 });
    },
    kick: (t, v) => {
      this.tone(t, { type: 'sine', from: 170, to: 55, dur: 0.13, vol: 0.5 * v });
      this.noise(t, { dur: 0.05, vol: 0.12 * v, from: 2600, to: 700 });
    },
    ult: (t, v) => {
      this.tone(t, { type: 'sawtooth', from: 70, to: 340, dur: 0.4, vol: 0.3 * v });
      this.noise(t, { dur: 0.45, vol: 0.22 * v, from: 500, to: 3200 });
      this.tone(t, { type: 'sine', from: 120, to: 40, dur: 0.5, vol: 0.3 * v });
    },
    ultready: (t, v) => {
      this.tone(t, { type: 'triangle', from: 660, dur: 0.09, vol: 0.2 * v });
      this.tone(t, { type: 'triangle', from: 990, dur: 0.14, vol: 0.2 * v, delay: 0.09 });
    },
    goal: (t, v) => {
      // Petite fanfare montante (do–mi–sol–do), assez percutante pour un but.
      const notes = [523, 659, 784, 1046];
      notes.forEach((f, i) => {
        this.tone(t, { type: 'square', from: f, dur: i === notes.length - 1 ? 0.32 : 0.12, vol: 0.18 * v, delay: i * 0.11 });
        this.tone(t, { type: 'triangle', from: f / 2, dur: 0.12, vol: 0.12 * v, delay: i * 0.11 });
      });
      this.noise(t, { dur: 0.3, vol: 0.1 * v, filter: 'highpass', from: 3000, to: 1200 });
    },
    death: (t, v) => {
      this.tone(t, { type: 'sawtooth', from: 420, to: 60, dur: 0.38, vol: 0.22 * v });
      this.noise(t, { dur: 0.3, vol: 0.16 * v, from: 900, to: 120 });
    },
    cube: (t, v) => {
      this.tone(t, { type: 'sine', from: 880, to: 1320, dur: 0.1, vol: 0.2 * v });
      this.tone(t, { type: 'sine', from: 1760, dur: 0.12, vol: 0.12 * v, delay: 0.07 });
    },
    countdown: (t, v) => {
      this.tone(t, { type: 'square', from: 440, dur: 0.09, vol: 0.22 * v });
    },
    go: (t, v) => {
      this.tone(t, { type: 'square', from: 880, dur: 0.2, vol: 0.24 * v });
      this.tone(t, { type: 'square', from: 660, dur: 0.2, vol: 0.16 * v });
    },
    whistle: (t, v) => {
      // Deux brefs coups de sifflet aigus, très « arbitre ».
      this.tone(t, { type: 'triangle', from: 2100, to: 1900, dur: 0.12, vol: 0.2 * v });
      this.tone(t, { type: 'triangle', from: 2100, to: 1800, dur: 0.2, vol: 0.2 * v, delay: 0.16 });
    },
    victory: (t, v) => {
      const notes = [523, 659, 784, 1046, 1318];
      notes.forEach((f, i) => {
        this.tone(t, { type: 'triangle', from: f, dur: i === notes.length - 1 ? 0.45 : 0.16, vol: 0.2 * v, delay: i * 0.14 });
      });
    },
    defeat: (t, v) => {
      const notes = [392, 330, 262, 196];
      notes.forEach((f, i) => {
        this.tone(t, { type: 'sawtooth', from: f, to: f * 0.94, dur: 0.3, vol: 0.14 * v, delay: i * 0.22 });
      });
    },
    teleport: (t, v) => {
      this.tone(t, { type: 'sine', from: 260, to: 1400, dur: 0.22, vol: 0.18 * v });
      this.tone(t, { type: 'triangle', from: 1400, to: 500, dur: 0.16, vol: 0.12 * v, delay: 0.2 });
    },

    // ----- Attaques signature (une voix par Zarek : on reconnaît qui tire) -----

    /** Zephyr — « Ondes sonores » : bip synthétique clair qui descend, très « enceinte ». */
    shoot_wave: (t, v) => {
      const f = 1150 + Math.random() * 120;
      this.tone(t, { type: 'sine', from: f, to: 420, dur: 0.13, vol: 0.16 * v });
      this.tone(t, { type: 'triangle', from: f * 0.5, to: 260, dur: 0.11, vol: 0.1 * v });
    },
    /** Atlas — « Impact » : gros « thump » grave et mat, sans brillance. */
    shoot_heavy: (t, v) => {
      this.tone(t, { type: 'square', from: 220, to: 60, dur: 0.19, vol: 0.26 * v });
      this.noise(t, { dur: 0.14, vol: 0.16 * v, from: 700, to: 130 });
    },
    /** Atlas — roche qui ÉCLATE : craquement sec + gravats qui retombent. */
    rock_break: (t, v) => {
      this.noise(t, { dur: 0.09, vol: 0.2 * v, filter: 'bandpass', from: 1700, to: 700 });
      this.tone(t, { type: 'square', from: 180, to: 70, dur: 0.1, vol: 0.16 * v });
      // Petite traîne granuleuse : les débris qui roulent après le choc.
      this.noise(t, { dur: 0.26, vol: 0.09 * v, from: 900, to: 260, delay: 0.06 });
    },
    /** Hécate — « Potion toxique » : glouglou de fiole qui monte (liquide). */
    potion_hecate: (t, v) => {
      this.tone(t, { type: 'sine', from: 240, to: 660, dur: 0.18, vol: 0.2 * v });
      this.tone(t, { type: 'sine', from: 420, to: 900, dur: 0.1, vol: 0.1 * v, delay: 0.07 });
      this.noise(t, { dur: 0.08, vol: 0.06 * v, filter: 'bandpass', from: 1500 });
    },
    /** Astrapé — « Éclair » : claquement sec et aigu (plus court que la chaîne générique). */
    bolt_astrape: (t, v) => {
      this.tone(t, { type: 'sawtooth', from: 2100, to: 220, dur: 0.13, vol: 0.19 * v });
      this.noise(t, { dur: 0.1, vol: 0.15 * v, filter: 'highpass', from: 3600, to: 1400 });
    },

    // ----- Ultimes signature -----

    /** Zephyr — « Break Dance » : balayage qui monte puis souffle de repoussée. */
    ult_wave: (t, v) => {
      this.tone(t, { type: 'sine', from: 180, to: 1500, dur: 0.34, vol: 0.24 * v });
      this.noise(t, { dur: 0.5, vol: 0.22 * v, filter: 'bandpass', from: 600, to: 2800, delay: 0.28 });
      this.tone(t, { type: 'triangle', from: 700, to: 120, dur: 0.4, vol: 0.18 * v, delay: 0.3 });
    },
    /** Atlas — « Séisme » : grondement très grave + gravats (le sol tremble). */
    ult_quake: (t, v) => {
      this.tone(t, { type: 'sine', from: 90, to: 34, dur: 0.85, vol: 0.42 * v });
      this.tone(t, { type: 'square', from: 130, to: 45, dur: 0.5, vol: 0.16 * v });
      this.noise(t, { dur: 0.8, vol: 0.24 * v, from: 420, to: 80 });
    },
    /** Hécate — « Aura de poison » : sifflement de gaz qui se répand + note trouble. */
    ult_poison: (t, v) => {
      this.noise(t, { dur: 0.9, vol: 0.2 * v, filter: 'bandpass', from: 2600, to: 500 });
      this.tone(t, { type: 'sawtooth', from: 300, to: 150, dur: 0.7, vol: 0.13 * v });
      this.tone(t, { type: 'sine', from: 155, to: 148, dur: 0.8, vol: 0.12 * v }); // battement dissonant
    },
    /** Astrapé — « Surcharge » : coup de tonnerre (craquement sec puis roulement). */
    ult_thunder: (t, v) => {
      this.noise(t, { dur: 0.12, vol: 0.34 * v, filter: 'highpass', from: 5000, to: 2000 });
      this.tone(t, { type: 'sawtooth', from: 2600, to: 90, dur: 0.3, vol: 0.28 * v });
      this.noise(t, { dur: 0.9, vol: 0.24 * v, from: 900, to: 90, delay: 0.1 });
      this.tone(t, { type: 'sine', from: 70, to: 40, dur: 0.7, vol: 0.24 * v, delay: 0.12 });
    },
  };
}

/** Instance unique, partagée par tout le jeu. */
export const sfx = new SfxEngine();
