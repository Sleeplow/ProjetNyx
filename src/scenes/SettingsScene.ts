import Phaser from 'phaser';
import { settings, DEFAULTS, type Settings } from '../config/settings';
import { makeButton, makeSlider, type Slider } from '../ui/widgets';
import { sfx } from '../audio/sfx';

/**
 * Écran de CONFIGURATION, affiché EN SURIMPRESSION (`scene.launch`) au-dessus
 * de la scène courante : on peut donc régler le son depuis un menu comme en
 * pleine partie, sans rien interrompre ni perdre le match en cours.
 *
 * SOCLE POUR LES RÉGLAGES À VENIR : chaque ligne de l'écran est décrite par une
 * entrée de `ROWS`. Pour ajouter un réglage, on ajoute un champ à `Settings`
 * (voir `config/settings.ts`) puis une entrée ici — la mise en page, la
 * persistance et le bouton « Par défaut » suivent tout seuls. `kind` n'a qu'une
 * valeur pour l'instant (`slider`) ; c'est là qu'on branchera les interrupteurs
 * et les listes de choix quand il y en aura.
 */

interface SliderRow {
  kind: 'slider';
  /** Clé du réglage dans `Settings` (doit être un champ numérique 0→1). */
  key: 'musicVolume' | 'sfxVolume';
  label: string;
  hint: string;
  color: number;
  /** Son joué à chaque changement, pour entendre le réglage qu'on manipule. */
  preview?: Parameters<typeof sfx.play>[0];
}

type Row = SliderRow;

const ROWS: Row[] = [
  {
    kind: 'slider',
    key: 'musicVolume',
    label: '🎵  Musique',
    hint: 'Ambiance des menus et des matchs',
    color: 0x6a4dff,
  },
  {
    kind: 'slider',
    key: 'sfxVolume',
    label: '🔊  Effets sonores',
    hint: 'Tirs, impacts, buts, ultimes…',
    color: 0x2f8f5a,
    preview: 'shoot',
  },
];

/**
 * Scènes SOLO mises en pause tant que la configuration est ouverte : sans ça on
 * se fait canarder pendant qu'on règle le volume. En ligne c'est impossible —
 * le serveur fait autorité et le match continue sans nous.
 */
const PAUSABLE = new Set(['Game', 'Soccer']);

export class SettingsScene extends Phaser.Scene {
  private sliders: Slider[] = [];
  private buttons: ReturnType<typeof makeButton>[] = [];
  private objects: Phaser.GameObjects.GameObject[] = [];
  /** Scène qui a ouvert la configuration (mise en pause si elle est en solo). */
  private paused: string | null = null;

  constructor() {
    super('Settings');
  }

  create(data?: { from?: string }): void {
    this.paused = data?.from && PAUSABLE.has(data.from) ? data.from : null;
    if (this.paused) this.scene.pause(this.paused);

    this.build();
    // La scène appelante peut être redimensionnée (rotation du téléphone) :
    // on se reconstruit pour rester centré.
    this.scale.on('resize', this.rebuild, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.rebuild, this);
      if (this.paused) this.scene.resume(this.paused);
      this.teardown();
    });
  }

  private rebuild(): void {
    this.teardown();
    this.build();
  }

  private teardown(): void {
    for (const s of this.sliders) s.destroy();
    for (const b of this.buttons) b.destroy();
    for (const o of this.objects) o.destroy();
    this.sliders = [];
    this.buttons = [];
    this.objects = [];
  }

  private build(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;
    const D = 1500;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.objects.push(o);
      return o;
    };

    // Voile plein écran INTERACTIF : il absorbe les clics pour qu'ils
    // n'atteignent pas la scène du dessous (sinon on tire en réglant le son).
    add(this.add.rectangle(cx, h / 2, w, h, 0x000000, 0.72).setScrollFactor(0).setDepth(D - 1).setInteractive());

    const panelW = Math.min(620, w - 40);
    const panelH = Math.min(150 + ROWS.length * 108, h - 40);
    const top = h / 2 - panelH / 2;
    add(this.add.rectangle(cx, h / 2, panelW, panelH, 0x120f28, 0.97).setStrokeStyle(3, 0x6a4dff, 0.9).setScrollFactor(0).setDepth(D));
    add(
      this.add
        .text(cx, top + 34, 'CONFIGURATION', { fontFamily: 'system-ui, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#ffffff' })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(D + 1),
    );

    const sliderW = Math.min(300, panelW - 210);
    const left = cx - panelW / 2 + 36;
    ROWS.forEach((row, i) => {
      const y = top + 104 + i * 108;
      add(
        this.add
          .text(left, y - 26, row.label, { fontFamily: 'system-ui, sans-serif', fontSize: '20px', color: '#ffffff', fontStyle: 'bold' })
          .setOrigin(0, 0.5)
          .setScrollFactor(0)
          .setDepth(D + 1),
      );
      add(
        this.add
          .text(left, y - 2, row.hint, { fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#8f86c4' })
          .setOrigin(0, 0.5)
          .setScrollFactor(0)
          .setDepth(D + 1),
      );
      this.sliders.push(this.buildSlider(row, left + sliderW / 2, y + 32, sliderW));
    });

    const by = top + panelH - 44;
    this.buttons.push(this.overlayButton(cx - 110, by, 190, 52, 'Par défaut', 0x3a3466, () => this.resetAll()));
    this.buttons.push(this.overlayButton(cx + 110, by, 190, 52, 'Fermer', 0x2f8f5a, () => this.scene.stop()));
  }

  private buildSlider(row: SliderRow, x: number, y: number, width: number): Slider {
    return makeSlider(
      this,
      x,
      y,
      width,
      settings.get()[row.key],
      (v) => {
        settings.set({ [row.key]: v } as Partial<Settings>);
        // Aperçu sonore : on entend immédiatement le niveau qu'on choisit.
        if (row.preview) sfx.play(row.preview);
      },
      row.color,
    );
  }

  /** Remise à zéro : réglages par défaut + reconstruction (curseurs replacés). */
  private resetAll(): void {
    settings.reset();
    this.rebuild();
  }

  private overlayButton(x: number, y: number, w: number, h: number, label: string, color: number, onClick: () => void): ReturnType<typeof makeButton> {
    const b = makeButton(this, x, y, w, h, label, onClick, color);
    b.setScrollFactor(0);
    b.setDepth(1700); // au-dessus du panneau ET du voile (qui est interactif)
    return b;
  }
}

export { DEFAULTS };
