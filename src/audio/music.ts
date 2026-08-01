/**
 * MUSIQUE générée en Web Audio — comme les effets sonores, aucun fichier à
 * télécharger (rien n'alourdit la page, rien à mettre en cache dans le service
 * worker, ça marche hors-ligne).
 *
 * Principe : un petit séquenceur. Un `setInterval` regarde « un peu en avant »
 * (fenêtre de programmation) et planifie les notes des prochaines mesures
 * directement sur l'horloge de l'AudioContext — c'est la seule façon d'avoir un
 * tempo stable (`setTimeout` seul dérive et hoquette dès que la frame rame).
 *
 * Deux thèmes, tous deux en LA mineur (cohérent avec l'ambiance nocturne
 * « Nyxt ») :
 * - `menu` : lent, aéré, nappe + arpège doux qui scintille.
 * - `match` : plus rapide, basse pulsée + batterie synthétique + riff.
 * La bascule entre les deux se fait en fondu, jamais en coupure sèche.
 */

import { sfx } from './sfx';
import { settings } from '../config/settings';

export type MusicTrack = 'menu' | 'match';

/** Fréquences (Hz) des notes utilisées, par nom scientifique. */
const NOTE: Record<string, number> = {
  A1: 55, C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98, A2: 110,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196, A3: 220, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, A5: 880,
};

/** Une note programmée : nom, position dans la boucle (en pas) et durée (pas). */
interface Step {
  note: string;
  at: number;
  dur: number;
  vol?: number;
}

interface TrackDef {
  /** Durée d'un pas (croche) en secondes — pilote le tempo. */
  stepSec: number;
  /** Longueur de la boucle en pas. */
  steps: number;
  /** Nappe / accords tenus (onde douce). */
  pad: Step[];
  /** Arpège ou mélodie (onde claire). */
  lead: Step[];
  /** Ligne de basse. */
  bass: Step[];
  /** Pas où frappe la grosse caisse. */
  kick: number[];
  /** Pas où frappe la caisse claire / charley (bruit filtré). */
  hat: number[];
}

/**
 * Menu — La mineur, lent (≈76 BPM en croches). Progression Am–F–C–G : quatre
 * mesures tenues, avec un arpège qui monte et redescend par-dessus.
 */
const MENU: TrackDef = {
  stepSec: 0.395,
  steps: 32,
  pad: [
    { note: 'A2', at: 0, dur: 8 }, { note: 'C3', at: 0, dur: 8 }, { note: 'E3', at: 0, dur: 8 },
    { note: 'F2', at: 8, dur: 8 }, { note: 'A2', at: 8, dur: 8 }, { note: 'C3', at: 8, dur: 8 },
    { note: 'C3', at: 16, dur: 8 }, { note: 'E3', at: 16, dur: 8 }, { note: 'G3', at: 16, dur: 8 },
    { note: 'G2', at: 24, dur: 8 }, { note: 'B3', at: 24, dur: 8 }, { note: 'D4', at: 24, dur: 8 },
  ],
  lead: [
    { note: 'A4', at: 0, dur: 2 }, { note: 'C5', at: 2, dur: 2 }, { note: 'E5', at: 4, dur: 2 }, { note: 'C5', at: 6, dur: 2 },
    { note: 'F4', at: 8, dur: 2 }, { note: 'A4', at: 10, dur: 2 }, { note: 'C5', at: 12, dur: 2 }, { note: 'A4', at: 14, dur: 2 },
    { note: 'E4', at: 16, dur: 2 }, { note: 'G4', at: 18, dur: 2 }, { note: 'C5', at: 20, dur: 2 }, { note: 'G4', at: 22, dur: 2 },
    { note: 'D4', at: 24, dur: 2 }, { note: 'G4', at: 26, dur: 2 }, { note: 'B4', at: 28, dur: 4 },
  ],
  bass: [
    { note: 'A1', at: 0, dur: 6 }, { note: 'F2', at: 8, dur: 6 },
    { note: 'C2', at: 16, dur: 6 }, { note: 'G2', at: 24, dur: 6 },
  ],
  kick: [],
  hat: [],
};

/**
 * Match — même tonalité mais nerveux (≈132 BPM en croches) : basse pulsée à
 * chaque temps, batterie synthétique et riff court qui tourne. Reste discret
 * (bus musique bas) pour ne pas couvrir les tirs.
 */
const MATCH: TrackDef = {
  stepSec: 0.227,
  steps: 32,
  pad: [
    { note: 'A3', at: 0, dur: 8, vol: 0.5 }, { note: 'E3', at: 0, dur: 8, vol: 0.5 },
    { note: 'F3', at: 8, dur: 8, vol: 0.5 }, { note: 'C3', at: 8, dur: 8, vol: 0.5 },
    { note: 'G3', at: 16, dur: 8, vol: 0.5 }, { note: 'D3', at: 16, dur: 8, vol: 0.5 },
    { note: 'E3', at: 24, dur: 8, vol: 0.5 }, { note: 'B3', at: 24, dur: 8, vol: 0.5 },
  ],
  lead: [
    { note: 'A4', at: 0, dur: 1 }, { note: 'E4', at: 2, dur: 1 }, { note: 'A4', at: 3, dur: 1 }, { note: 'C5', at: 5, dur: 2 },
    { note: 'A4', at: 8, dur: 1 }, { note: 'F4', at: 10, dur: 1 }, { note: 'A4', at: 11, dur: 1 }, { note: 'C5', at: 13, dur: 2 },
    { note: 'B4', at: 16, dur: 1 }, { note: 'G4', at: 18, dur: 1 }, { note: 'D5', at: 19, dur: 1 }, { note: 'B4', at: 21, dur: 2 },
    { note: 'C5', at: 24, dur: 1 }, { note: 'E5', at: 26, dur: 1 }, { note: 'A5', at: 28, dur: 3 },
  ],
  bass: [
    { note: 'A1', at: 0, dur: 2 }, { note: 'A1', at: 4, dur: 2 }, { note: 'A2', at: 6, dur: 1 },
    { note: 'F2', at: 8, dur: 2 }, { note: 'F2', at: 12, dur: 2 }, { note: 'A2', at: 14, dur: 1 },
    { note: 'G2', at: 16, dur: 2 }, { note: 'G2', at: 20, dur: 2 }, { note: 'D2', at: 22, dur: 1 },
    { note: 'E2', at: 24, dur: 2 }, { note: 'E2', at: 28, dur: 2 }, { note: 'E2', at: 30, dur: 1 },
  ],
  kick: [0, 4, 8, 12, 16, 20, 24, 28],
  hat: [2, 6, 10, 14, 18, 22, 26, 30],
};

const TRACKS: Record<MusicTrack, TrackDef> = { menu: MENU, match: MATCH };

/** Fenêtre de programmation : on planifie tout ce qui tombe dans les 0,4 s à venir. */
const LOOKAHEAD_SEC = 0.4;
const TICK_MS = 120;

class MusicEngine {
  private current: MusicTrack | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private gain: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  /** Instant (horloge audio) du prochain pas à programmer. */
  private nextStepTime = 0;
  private step = 0;

  constructor() {
    if (typeof window === 'undefined') return;
    // L'audio ne démarre qu'au premier geste utilisateur : une piste demandée
    // avant (au chargement du menu) est relancée ici dès le déblocage.
    sfx.onUnlock(() => {
      if (this.current && !this.timer) this.play(this.current, { force: true });
    });
    // Volume de musique à 0 = silence : on arrête vraiment le séquenceur (pas
    // juste un gain à zéro) pour ne rien programmer inutilement ; on relance
    // dès que le joueur remonte le curseur.
    settings.onChange((s) => {
      if (s.musicVolume <= 0) this.teardown();
      else if (this.current && !this.timer) this.play(this.current, { force: true });
    });
  }

  /** Piste en cours (null si silence). */
  get track(): MusicTrack | null {
    return this.current;
  }

  /**
   * Lance une piste (fondu d'entrée). Rappeler avec la piste DÉJÀ en cours ne
   * fait rien — les scènes peuvent donc appeler `music.play('match')` à chaque
   * `create()` sans redémarrer la boucle à chaque manche.
   */
  play(track: MusicTrack, opts?: { force?: boolean }): void {
    if (settings.get().musicVolume <= 0) {
      this.current = track; // mémorisé : reprendra si le joueur remonte le volume
      return;
    }
    if (this.current === track && this.timer && !opts?.force) return;
    this.teardown();
    this.current = track;

    const ctx = sfx.audioContext();
    const bus = sfx.musicBus();
    if (!ctx || !bus) return; // audio pas encore débloqué : reprise au prochain appel

    this.gain = ctx.createGain();
    this.gain.gain.setValueAtTime(0, ctx.currentTime);
    this.gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2); // fondu d'entrée
    this.gain.connect(bus);

    this.step = 0;
    this.nextStepTime = ctx.currentTime + 0.08;
    this.schedule();
    this.timer = setInterval(() => this.schedule(), TICK_MS);
  }

  /** Arrête la musique en fondu (0 = coupure immédiate). */
  stop(fadeSec = 0.6): void {
    const ctx = sfx.audioContext();
    const g = this.gain;
    this.current = null;
    if (!ctx || !g || fadeSec <= 0) {
      this.teardown();
      return;
    }
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeSec);
    const stale = this.timer;
    this.timer = null;
    if (stale) clearInterval(stale);
    setTimeout(() => g.disconnect(), fadeSec * 1000 + 100);
    this.gain = null;
  }

  private teardown(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.gain?.disconnect();
    this.gain = null;
  }

  // ---------- Séquenceur ----------

  /** Programme tous les pas qui tombent dans la fenêtre à venir. */
  private schedule(): void {
    const ctx = sfx.audioContext();
    const def = this.current ? TRACKS[this.current] : null;
    if (!ctx || !def || !this.gain) return;
    while (this.nextStepTime < ctx.currentTime + LOOKAHEAD_SEC) {
      this.emitStep(ctx, def, this.step, this.nextStepTime);
      this.step = (this.step + 1) % def.steps;
      this.nextStepTime += def.stepSec;
    }
  }

  /** Joue tout ce qui commence sur ce pas (nappe, mélodie, basse, batterie). */
  private emitStep(ctx: AudioContext, def: TrackDef, step: number, when: number): void {
    for (const n of def.pad) {
      if (n.at === step) this.voice(ctx, NOTE[n.note], when, n.dur * def.stepSec, 'sine', 0.16 * (n.vol ?? 1), 0.5);
    }
    for (const n of def.lead) {
      if (n.at === step) this.voice(ctx, NOTE[n.note], when, n.dur * def.stepSec, 'triangle', 0.1 * (n.vol ?? 1), 0.02);
    }
    for (const n of def.bass) {
      if (n.at === step) this.voice(ctx, NOTE[n.note], when, n.dur * def.stepSec, 'sawtooth', 0.13 * (n.vol ?? 1), 0.02, 420);
    }
    if (def.kick.includes(step)) this.drumKick(ctx, when);
    if (def.hat.includes(step)) this.drumHat(ctx, when);
  }

  /** Une note tenue : oscillateur + filtre passe-bas + enveloppe attaque/chute. */
  private voice(
    ctx: AudioContext,
    freq: number,
    when: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    attack: number,
    cutoff?: number,
  ): void {
    if (!freq || !this.gain) return;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(dur, attack + 0.05));
    if (cutoff) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(cutoff, when);
      osc.connect(f).connect(g).connect(this.gain);
    } else {
      osc.connect(g).connect(this.gain);
    }
    osc.start(when);
    osc.stop(when + dur + 0.08);
  }

  private drumKick(ctx: AudioContext, when: number): void {
    if (!this.gain) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, when);
    osc.frequency.exponentialRampToValueAtTime(45, when + 0.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.34, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
    osc.connect(g).connect(this.gain);
    osc.start(when);
    osc.stop(when + 0.2);
  }

  private drumHat(ctx: AudioContext, when: number): void {
    if (!this.gain) return;
    if (!this.noiseBuf) {
      const len = Math.floor(ctx.sampleRate * 0.2);
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.setValueAtTime(7000, when);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.07, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
    src.connect(f).connect(g).connect(this.gain);
    src.start(when);
    src.stop(when + 0.08);
  }
}

/** Instance unique, partagée par tout le jeu. */
export const music = new MusicEngine();
