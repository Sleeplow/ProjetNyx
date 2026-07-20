import Phaser from 'phaser';
import { ZAREKS } from '../zareks/registry';
import type { ZarekDef } from '../core/types';
import { makeButton, nightBackground } from '../ui/widgets';
import { computeFrame, watchResize, type Frame } from '../ui/layout';
import { createAvatarVisual, type AvatarVisual } from '../render/avatarVisual';
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

/** Écran de sélection du Zarek : sélecteur compact + fiche de caractéristiques. */
export class SelectScene extends Phaser.Scene {
  private selectedId = ZAREKS[0].id;
  private modeId = MODES[0].id;
  private online = false;
  private cardBorders = new Map<string, Phaser.GameObjects.Rectangle>();

  // Fiche
  private ficheAvatar?: AvatarVisual;
  private ficheAvatarX = 0;
  private ficheAvatarY = 0;
  private ficheScale = 2.1;
  private nameText!: Phaser.GameObjects.Text;
  private roleText!: Phaser.GameObjects.Text;
  private abilityText!: Phaser.GameObjects.Text;
  private barFills: Phaser.GameObjects.Rectangle[] = [];
  private barValues: Phaser.GameObjects.Text[] = [];
  private barTrackW = 230;

  constructor() {
    super('Select');
  }

  create(data: { modeId?: string; online?: boolean; selectedId?: string }): void {
    nightBackground(this);
    const F = computeFrame(this);

    this.modeId = data?.modeId ?? MODES[0].id;
    this.online = !!data?.online;
    this.selectedId = data?.selectedId ?? ZAREKS[0].id;
    this.cardBorders = new Map();
    this.barFills = [];
    this.barValues = [];
    this.ficheAvatar = undefined;
    const mode = MODES.find((m) => m.id === this.modeId) ?? MODES[0];

    const t = F.at(0, 46);
    this.add.text(t.x, t.y, 'CHOISIS TON ZAREK', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(38), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const sub = F.at(0, 86);
    this.add
      .text(sub.x, sub.y, `${this.online ? '🌐 En ligne · ' : ''}Mode : ${mode.name} — ${mode.tagline}`, { fontFamily: 'system-ui, sans-serif', fontSize: F.font(17), color: this.online ? '#46d160' : '#9b8cff', fontStyle: this.online ? 'bold' : 'normal' })
      .setOrigin(0.5);
    const back = F.at(-432, 40);
    makeButton(this, back.x, back.y, F.px(140), F.px(44), '‹ Retour', () => this.scene.start('ModeSelect', { online: this.online }), 0x3a3466);

    // Sélecteur compact : petites cartes (rond coloré + nom) + emplacements verrouillés.
    const lockedSlots = 2;
    const total = ZAREKS.length + lockedSlots;
    const cardW = 108;
    const gap = 14;
    const rowW = total * cardW + (total - 1) * gap;
    const cardY = 152;
    let dx = -rowW / 2 + cardW / 2;
    for (const z of ZAREKS) {
      const p = F.at(dx, cardY);
      this.makeCard(p.x, p.y, F, z);
      dx += cardW + gap;
    }
    for (let i = 0; i < lockedSlots; i++) {
      const p = F.at(dx, cardY);
      this.makeLockedCard(p.x, p.y, F);
      dx += cardW + gap;
    }

    this.buildFiche(F);

    const play = F.at(0, 560);
    if (this.online) {
      makeButton(this, play.x, play.y, F.px(300), F.px(60), 'JOUER EN LIGNE', () => this.scene.start('OnlineMenu', { zarekId: this.selectedId, modeId: this.modeId }), 0x2f8f5a);
    } else {
      const targetScene = this.modeId === 'brawl-ball' ? 'Soccer' : 'Game';
      makeButton(this, play.x, play.y, F.px(280), F.px(60), 'LANCER LA PARTIE', () => this.scene.start(targetScene, { zarekId: this.selectedId, modeId: this.modeId }));
    }

    this.refresh();
    this.events.once('shutdown', () => this.ficheAvatar?.destroy());
    watchResize(this, () => this.scene.restart({ modeId: this.modeId, online: this.online, selectedId: this.selectedId }));
  }

  private makeCard(x: number, y: number, F: Frame, z: ZarekDef): void {
    const cardW = F.px(108);
    const cardH = F.px(112);
    const bg = this.add.rectangle(x, y, cardW, cardH, 0x1a1636, 0.95).setStrokeStyle(3, 0x3a3466);
    const border = this.add.rectangle(x, y, cardW, cardH).setStrokeStyle(4, 0xffe066, 0).setFillStyle(0, 0);
    this.cardBorders.set(z.id, border);
    this.add.circle(x, y - F.px(24), F.px(24), z.color).setStrokeStyle(3, z.accent);
    this.add.text(x, y + F.px(24), z.name, { fontFamily: 'system-ui, sans-serif', fontSize: F.font(16), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(x, y + F.px(43), roleLabel(z.role), { fontFamily: 'system-ui, sans-serif', fontSize: F.font(12), color: '#9b8cff' }).setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.selectedId = z.id;
      this.refresh();
    });
  }

  private makeLockedCard(x: number, y: number, F: Frame): void {
    const cardW = F.px(108);
    const cardH = F.px(112);
    this.add.rectangle(x, y, cardW, cardH, 0x121026, 0.7).setStrokeStyle(3, 0x2a2640);
    this.add.circle(x, y - F.px(24), F.px(24), 0x201d3a).setStrokeStyle(3, 0x2f2b4d);
    this.add.text(x, y - F.px(24), '?', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(28), color: '#4a4670', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(x, y + F.px(28), 'Bientôt', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(13), color: '#4a4670' }).setOrigin(0.5);
  }

  /** Panneau fiche : gros avatar cartoon à gauche, barres de stats à droite. */
  private buildFiche(F: Frame): void {
    const panel = F.at(0, 365);
    this.add.rectangle(panel.x, panel.y, F.px(820), F.px(300), 0x141130, 0.92).setStrokeStyle(3, 0x6a4dff).setDepth(1);

    // Colonne gauche : avatar + nom + rôle + capacités.
    const avatar = F.at(-260, 320);
    this.ficheAvatarX = avatar.x;
    this.ficheAvatarY = avatar.y;
    this.ficheScale = 1.5 * F.s;
    const nameP = F.at(-260, 369);
    this.nameText = this.add.text(nameP.x, nameP.y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(26), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(2);
    const roleP = F.at(-260, 399);
    this.roleText = this.add.text(roleP.x, roleP.y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(16), color: '#b3a3ff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(2);
    const abilP = F.at(-260, 427);
    this.abilityText = this.add
      .text(abilP.x, abilP.y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(13), color: '#cfcfe6', align: 'center', lineSpacing: 4, wordWrap: { width: F.px(250) } })
      .setOrigin(0.5, 0)
      .setDepth(2);

    // Colonne droite : barres.
    this.barTrackW = F.px(250);
    const rowH = 44;
    STATS.forEach((s, i) => {
      const label = F.at(-10, 269 + i * rowH);
      const track = F.at(90, 269 + i * rowH);
      this.add.text(label.x, label.y, s.label, { fontFamily: 'system-ui, sans-serif', fontSize: F.font(15), color: '#d8d8ff', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(2);
      this.add.rectangle(track.x, track.y, this.barTrackW, F.px(16), 0x0e0e1c, 0.9).setOrigin(0, 0.5).setStrokeStyle(2, 0x000000, 0.6).setDepth(2);
      const fill = this.add.rectangle(track.x, track.y, 0, F.px(16), s.color).setOrigin(0, 0.5).setDepth(3);
      const val = this.add.text(track.x + this.barTrackW + F.px(12), track.y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(14), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(3);
      this.barFills.push(fill);
      this.barValues.push(val);
    });
  }

  private refresh(): void {
    for (const [id, border] of this.cardBorders) {
      border.setStrokeStyle(4, 0xffe066, id === this.selectedId ? 1 : 0);
    }
    const z = ZAREKS.find((k) => k.id === this.selectedId)!;

    // Avatar de la fiche (recréé pour le Zarek courant).
    this.ficheAvatar?.destroy();
    this.ficheAvatar = createAvatarVisual(this, z, { isSelf: false, label: '', decor: true });
    this.ficheAvatar.container.setPosition(this.ficheAvatarX, this.ficheAvatarY).setScale(this.ficheScale).setDepth(2);
    this.ficheAvatar.setAim(Math.PI / 2); // face à la caméra (même convention que « bas » en jeu)

    this.nameText.setText(z.name);
    this.roleText.setText(roleLabel(z.role));
    this.abilityText.setText(`⚔ ${z.attack.label}\n✦ ${z.ultimate.label}`);

    STATS.forEach((s, i) => {
      const { v, t } = s.compute(z);
      const ratio = Phaser.Math.Clamp(v / s.max, 0, 1);
      this.barFills[i].width = this.barTrackW * ratio;
      this.barValues[i].setText(t);
    });
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
