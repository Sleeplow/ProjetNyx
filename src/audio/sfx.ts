/**
 * Effets sonores SYNTHÉTISÉS en Web Audio — aucun fichier audio à télécharger
 * (style jsfxr / rétro-arcade, cohérent avec le rendu cartoon). Chaque son est
 * une petite recette d'oscillateurs + bruit blanc, jouée à la demande.
 *
 * Points clés :
 * - L'AudioContext n'est créé (et « débloqué ») qu'au premier geste utilisateur,
 *   comme l'exigent les navigateurs (autoplay policy), via un écouteur global.
 * - Coupe-son persistant (`nyxt.muted` en localStorage) — voir makeMuteButton.
 * - Anti-spam : un même son ne rejoue pas avant un court délai (les tirs de
 *   8 combattants ne doivent pas devenir une bouillie saturée).
 * - `volumeAt(distance)` : atténuation spatiale simple pour les événements
 *   lointains (un tir à l'autre bout de la carte s'entend à peine).
 */

export type SfxName =
  | 'click' // tap sur un bouton d'interface
  | 'shoot' // tir de base (projectiles)
  | 'bolt' // éclair en chaîne
  | 'potion' // lancer de potion
  | 'splash' // flaque de potion qui s'étale
  | 'hit' // impact sur un combattant
  | 'kick' // frappe de la balle (Brawl Ball)
  | 'ult' // ultime déclenché
  | 'ultready' // jauge d'ultime pleine (joueur local)
  | 'goal' // but marqué
  | 'death' // élimination
  | 'cube' // gemme de puissance ramassée
  | 'countdown' // bip du compte à rebours « 3-2-1 »
  | 'go' // top départ
  | 'whistle' // coup de sifflet (engagement)
  | 'victory' // fin de partie gagnée
  | 'defeat' // fin de partie perdue
  | 'teleport'; // passage de portail

interface PlayOpts {
  /** Volume relatif 0..1 (défaut 1). Multiplié par le volume propre du son. */
  volume?: number;
}

/** Délai minimal entre deux lectures du même son (ms). */
const THROTTLE_MS: Partial<Record<SfxName, number>> = {
  shoot: 70,
  hit: 60,
  bolt: 90,
  death: 120,
  cube: 80,
};
const THROTTLE_DEFAULT_MS = 45;

class SfxEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private lastPlay = new Map<SfxName, number>();
  private mutedFlag = false;

  constructor() {
    // Environnement sans navigateur (tests vitest en Node) : moteur inerte.
    if (typeof window === 'undefined') return;
    try {
      this.mutedFlag = localStorage.getItem('nyxt.muted') === '1';
    } catch {
      /* localStorage indisponible (navigation privée stricte) : son actif */
    }
    // Débloque l'audio au premier geste — indispensable sur iOS/Safari où un
    // contexte créé hors geste reste « suspended » pour toujours.
    const unlock = (): void => {
      this.ensureContext();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  get muted(): boolean {
    return this.mutedFlag;
  }

  setMuted(m: boolean): void {
    this.mutedFlag = m;
    try {
      localStorage.setItem('nyxt.muted', m ? '1' : '0');
    } catch {
      /* pas grave : le réglage ne survivra pas au rechargement */
    }
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
    if (this.mutedFlag || vol <= 0.02) return;
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
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5; // marge anti-saturation quand tout tire en même temps
        this.master.connect(this.ctx.destination);
      } catch {
        return null; // Web Audio indisponible : le jeu reste simplement muet
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
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
  };
}

/** Instance unique, partagée par tout le jeu. */
export const sfx = new SfxEngine();
