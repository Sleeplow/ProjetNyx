import Phaser from 'phaser';
import { ZAREKS, getZarek } from '../zareks/registry';
import type { ZarekDef } from '../core/types';
import { makeButton, nightBackground, type Button } from '../ui/widgets';
import { computeFrame, watchResize, type Frame } from '../ui/layout';
import { createAvatarVisual, type AvatarVisual } from '../render/avatarVisual';
import { CoverFlow, type CoverFlowCard } from '../ui/CoverFlow';
import { MODES } from '../modes/registry';

/** Une caractéristique affichée en barre (normalisée sur un plafond fixe). */
interface StatSpec {
  label: string;
  color: number;
  max: number;
  compute: (z: ZarekDef) => { v: number; t: string };
}

/** Puissance de frappe « représentative » (unités mélangées mais lisibles). */
function damageScore(z: ZarekDef): number {
  return z.attack.kind === 'potion' ? z.attack.aoeDps ?? 0 : z.attack.damage * z.attack.count;
}

/** Plafonds FIXES (avec marge) → barres comparables, place pour de futurs Zareks. */
const STATS: StatSpec[] = [
  { label: 'PV', color: 0x46d160, max: 3000, compute: (z) => ({ v: z.maxHealth, t: `${z.maxHealth}` }) },
  { label: 'Dégâts', color: 0xff5a5a, max: 600, compute: (z) => ({ v: damageScore(z), t: `${damageScore(z)}` }) },
  { label: 'Portée', color: 0x4dabff, max: 500, compute: (z) => ({ v: z.attack.range, t: `${z.attack.range}` }) },
  { label: 'Cadence', color: 0xffcf33, max: 2, compute: (z) => ({ v: 1000 / z.attack.reloadMs, t: `${(1000 / z.attack.reloadMs).toFixed(1)}/s` }) },
  { label: 'Vitesse', color: 0x46d1c8, max: 320, compute: (z) => ({ v: z.moveSpeed, t: `${z.moveSpeed}` }) },
];

const LOCKED_SLOTS = 2;
const ZCARD_W = 150;
const ZCARD_H = 168;

/** Écran de sélection du Zarek : roue Cover Flow d'avatars + fiche de caractéristiques. */
export class SelectScene extends Phaser.Scene {
  private selectedId = ZAREKS[0].id;
  private modeId = MODES[0].id;
  private online = false;

  private flow!: CoverFlow;
  /** id du Zarek pour chaque carte du flux ; `null` = emplacement verrouillé. */
  private flowIds: (string | null)[] = [];
  private avatars: AvatarVisual[] = [];

  // Fiche
  private nameText!: Phaser.GameObjects.Text;
  private roleText!: Phaser.GameObjects.Text;
  private abilityText!: Phaser.GameObjects.Text;
  private barFills: Phaser.GameObjects.Rectangle[] = [];
  private barValues: Phaser.GameObjects.Text[] = [];
  private barTrackW = 230;
  private playBtn?: Button;
  private playable = true;

  constructor() {
    super('Select');
  }

  create(data: { modeId?: string; online?: boolean; selectedId?: string }): void {
    nightBackground(this);
    const F = computeFrame(this);

    this.modeId = data?.modeId ?? MODES[0].id;
    this.online = !!data?.online;
    this.selectedId = data?.selectedId ?? ZAREKS[0].id;
    this.barFills = [];
    this.barValues = [];
    this.avatars = [];
    const mode = MODES.find((m) => m.id === this.modeId) ?? MODES[0];

    const t = F.at(0, 44);
    this.add.text(t.x, t.y, 'CHOISIS TON ZAREK', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(36), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const sub = F.at(0, 82);
    this.add
      .text(sub.x, sub.y, `${this.online ? '🌐 En ligne · ' : ''}Mode : ${mode.name} — ${mode.tagline}`, { fontFamily: 'system-ui, sans-serif', fontSize: F.font(16), color: this.online ? '#46d160' : '#9b8cff', fontStyle: this.online ? 'bold' : 'normal' })
      .setOrigin(0.5);
    const back = F.at(-432, 40);
    makeButton(this, back.x, back.y, F.px(140), F.px(44), '‹ Retour', () => this.scene.start('ModeSelect', { online: this.online }), 0x3a3466);

    // Roue Cover Flow : un avatar par Zarek + emplacements « bientôt ».
    const flowY = F.at(0, 196).y;
    this.flow = new CoverFlow(this, {
      cx: F.cx,
      cy: flowY,
      frameScale: F.s,
      gap: 152,
      step: 110,
      sideScale: 0.76,
      squash: 0.6,
      alphaStep: 0.3,
      minAlpha: 0.28,
      maxVisible: 3,
      onChange: () => this.onSelect(),
    });
    const cards: CoverFlowCard[] = [];
    this.flowIds = [];
    for (const z of ZAREKS) {
      cards.push(this.buildZarekCard(z));
      this.flowIds.push(z.id);
    }
    for (let i = 0; i < LOCKED_SLOTS; i++) {
      cards.push(this.buildLockedCard(i));
      this.flowIds.push(null);
    }
    const startIndex = Math.max(0, this.flowIds.indexOf(this.selectedId));
    this.flow.setCards(cards, startIndex);

    // Flèches + clavier.
    this.makeArrow(F.at(-462, 196).x, flowY, '‹', -1, F);
    this.makeArrow(F.at(462, 196).x, flowY, '›', 1, F);
    this.input.keyboard?.on('keydown-LEFT', () => this.flow.prev());
    this.input.keyboard?.on('keydown-RIGHT', () => this.flow.next());

    this.buildFiche(F);

    const play = F.at(0, 562);
    if (this.online) {
      this.playBtn = makeButton(this, play.x, play.y, F.px(300), F.px(58), 'JOUER EN LIGNE', () => this.launch(), 0x2f8f5a);
    } else {
      this.playBtn = makeButton(this, play.x, play.y, F.px(280), F.px(58), 'LANCER LA PARTIE', () => this.launch());
    }

    this.onSelect();
    this.events.once('shutdown', () => {
      this.flow.destroy();
      for (const a of this.avatars) a.destroy();
    });
    watchResize(this, () => this.scene.restart({ modeId: this.modeId, online: this.online, selectedId: this.selectedId }));
  }

  /** Carte d'un Zarek : avatar (face caméra) + nom + rôle. */
  private buildZarekCard(z: ZarekDef): CoverFlowCard {
    const avatar = createAvatarVisual(this, z, { isSelf: false, label: '', decor: true });
    avatar.setAim(Math.PI / 2); // face caméra (même convention que « bas » en jeu)
    avatar.container.setPosition(0, -18).setScale(1.05);
    this.avatars.push(avatar);
    const name = this.add.text(0, 44, z.name, { fontFamily: 'system-ui, sans-serif', fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const role = this.add.text(0, 68, roleLabel(z.role), { fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#b3a3ff' }).setOrigin(0.5);
    const container = this.add.container(0, 0, [avatar.container, name, role]);
    return { key: z.id, container, hit: { w: ZCARD_W, h: ZCARD_H } };
  }

  private buildLockedCard(i: number): CoverFlowCard {
    const bg = this.add.rectangle(0, -6, 128, 150, 0x121026, 0.7).setStrokeStyle(3, 0x2a2640);
    const disc = this.add.circle(0, -30, 30, 0x201d3a).setStrokeStyle(3, 0x2f2b4d);
    const q = this.add.text(0, -30, '?', { fontFamily: 'system-ui, sans-serif', fontSize: '34px', color: '#4a4670', fontStyle: 'bold' }).setOrigin(0.5);
    const soon = this.add.text(0, 44, 'Bientôt', { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#4a4670' }).setOrigin(0.5);
    const container = this.add.container(0, 0, [bg, disc, q, soon]);
    return { key: `locked${i}`, container, hit: { w: ZCARD_W, h: ZCARD_H } };
  }

  private makeArrow(x: number, y: number, glyph: string, dir: number, F: Frame): void {
    const t = this.add
      .text(x, y, glyph, { fontFamily: 'system-ui, sans-serif', fontSize: F.font(52), color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setDepth(200);
    t.setInteractive(new Phaser.Geom.Rectangle(-F.px(30), -F.px(30), t.width + F.px(60), t.height + F.px(60)), Phaser.Geom.Rectangle.Contains);
    t.on('pointerover', () => t.setColor('#ffcf33'))
      .on('pointerout', () => t.setColor('#ffffff'))
      .on('pointerdown', () => (dir < 0 ? this.flow.prev() : this.flow.next()));
  }

  /** Panneau fiche : nom + rôle + capacités à gauche, barres de stats à droite. */
  private buildFiche(F: Frame): void {
    const panel = F.at(0, 400);
    this.add.rectangle(panel.x, panel.y, F.px(860), F.px(238), 0x141130, 0.92).setStrokeStyle(3, 0x6a4dff).setDepth(1);

    const nameP = F.at(-262, 320);
    this.nameText = this.add.text(nameP.x, nameP.y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(26), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(2);
    const roleP = F.at(-262, 356);
    this.roleText = this.add.text(roleP.x, roleP.y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(16), color: '#b3a3ff', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(2);
    const abilP = F.at(-262, 392);
    this.abilityText = this.add
      .text(abilP.x, abilP.y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(13), color: '#cfcfe6', align: 'center', lineSpacing: 4, wordWrap: { width: F.px(250) } })
      .setOrigin(0.5, 0)
      .setDepth(2);

    // Colonne droite : barres.
    this.barTrackW = F.px(250);
    const rowH = 40;
    STATS.forEach((s, i) => {
      const label = F.at(-6, 306 + i * rowH);
      const track = F.at(94, 306 + i * rowH);
      this.add.text(label.x, label.y, s.label, { fontFamily: 'system-ui, sans-serif', fontSize: F.font(15), color: '#d8d8ff', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(2);
      this.add.rectangle(track.x, track.y, this.barTrackW, F.px(16), 0x0e0e1c, 0.9).setOrigin(0, 0.5).setStrokeStyle(2, 0x000000, 0.6).setDepth(2);
      const fill = this.add.rectangle(track.x, track.y, 0, F.px(16), s.color).setOrigin(0, 0.5).setDepth(3);
      const val = this.add.text(track.x + this.barTrackW + F.px(12), track.y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(14), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(3);
      this.barFills.push(fill);
      this.barValues.push(val);
    });
  }

  /** Réagit au changement de carte centrale (Zarek jouable ou emplacement verrouillé). */
  private onSelect(): void {
    const id = this.flowIds[this.flow.index];
    if (id) {
      this.selectedId = id;
      this.showZarek(getZarek(id));
      this.setPlayable(true);
    } else {
      this.showLocked();
      this.setPlayable(false);
    }
  }

  private showZarek(z: ZarekDef): void {
    this.nameText.setText(z.name).setColor('#ffffff');
    this.roleText.setText(roleLabel(z.role));
    this.abilityText.setText(`⚔ ${z.attack.label}\n✦ ${z.ultimate.label}`);
    STATS.forEach((s, i) => {
      const { v, t } = s.compute(z);
      const ratio = Phaser.Math.Clamp(v / s.max, 0, 1);
      this.barFills[i].width = this.barTrackW * ratio;
      this.barValues[i].setText(t);
    });
  }

  private showLocked(): void {
    this.nameText.setText('Verrouillé').setColor('#6c6c99');
    this.roleText.setText('');
    this.abilityText.setText('Nouveau Zarek bientôt disponible…');
    STATS.forEach((_, i) => {
      this.barFills[i].width = 0;
      this.barValues[i].setText('—');
    });
  }

  private setPlayable(on: boolean): void {
    this.playable = on;
    this.playBtn?.container.setAlpha(on ? 1 : 0.35);
  }

  private launch(): void {
    if (!this.playable) return;
    if (this.online) {
      this.scene.start('OnlineMenu', { zarekId: this.selectedId, modeId: this.modeId });
    } else {
      const targetScene = this.modeId === 'brawl-ball' ? 'Soccer' : 'Game';
      this.scene.start(targetScene, { zarekId: this.selectedId, modeId: this.modeId });
    }
  }
}

function roleLabel(role: ZarekDef['role']): string {
  switch (role) {
    case 'sharpshooter':
      return 'Tireur';
    case 'tank':
      return 'Tank';
    case 'assassin':
      return 'Assassin';
    case 'support':
      return 'Soutien';
    case 'mage':
      return 'Mage';
  }
}
