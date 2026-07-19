import Phaser from 'phaser';
import { ZAREKS } from '../zareks/registry';
import type { ZarekDef } from '../core/types';
import { makeButton, nightBackground } from '../ui/widgets';
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
  private nameText!: Phaser.GameObjects.Text;
  private roleText!: Phaser.GameObjects.Text;
  private abilityText!: Phaser.GameObjects.Text;
  private barFills: Phaser.GameObjects.Rectangle[] = [];
  private barValues: Phaser.GameObjects.Text[] = [];
  private barTrackW = 230;

  constructor() {
    super('Select');
  }

  create(data: { modeId?: string; online?: boolean }): void {
    nightBackground(this);
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;

    this.modeId = data?.modeId ?? MODES[0].id;
    this.online = !!data?.online;
    this.selectedId = ZAREKS[0].id;
    this.cardBorders = new Map();
    this.barFills = [];
    this.barValues = [];
    this.ficheAvatar = undefined;
    const mode = MODES.find((m) => m.id === this.modeId) ?? MODES[0];

    this.add.text(cx, 52, 'CHOISIS TON ZAREK', { fontFamily: 'system-ui, sans-serif', fontSize: '38px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add
      .text(cx, 92, `${this.online ? '🌐 En ligne · ' : ''}Mode : ${mode.name} — ${mode.tagline}`, { fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: this.online ? '#46d160' : '#9b8cff', fontStyle: this.online ? 'bold' : 'normal' })
      .setOrigin(0.5);
    makeButton(this, 92, 44, 140, 44, '‹ Retour', () => this.scene.start('ModeSelect', { online: this.online }), 0x3a3466);

    // Sélecteur compact : petites cartes (rond coloré + nom) + emplacements verrouillés.
    const lockedSlots = 2;
    const total = ZAREKS.length + lockedSlots;
    const cardW = 108;
    const gap = 14;
    const rowW = total * cardW + (total - 1) * gap;
    let x = cx - rowW / 2 + cardW / 2;
    const cardY = 168;
    for (const z of ZAREKS) {
      this.makeCard(x, cardY, cardW, z);
      x += cardW + gap;
    }
    for (let i = 0; i < lockedSlots; i++) {
      this.makeLockedCard(x, cardY, cardW);
      x += cardW + gap;
    }

    this.buildFiche(cx, h);

    if (this.online) {
      makeButton(this, cx, h - 52, 300, 60, 'JOUER EN LIGNE', () => this.scene.start('OnlineMenu', { zarekId: this.selectedId, modeId: this.modeId }), 0x2f8f5a);
    } else {
      const targetScene = this.modeId === 'brawl-ball' ? 'Soccer' : 'Game';
      makeButton(this, cx, h - 52, 280, 60, 'LANCER LA PARTIE', () => this.scene.start(targetScene, { zarekId: this.selectedId, modeId: this.modeId }));
    }

    this.refresh();
    this.events.once('shutdown', () => this.ficheAvatar?.destroy());
  }

  private makeCard(x: number, y: number, cardW: number, z: ZarekDef): void {
    const cardH = 116;
    const bg = this.add.rectangle(x, y, cardW, cardH, 0x1a1636, 0.95).setStrokeStyle(3, 0x3a3466);
    const border = this.add.rectangle(x, y, cardW, cardH).setStrokeStyle(4, 0xffe066, 0).setFillStyle(0, 0);
    this.cardBorders.set(z.id, border);
    this.add.circle(x, y - 22, 26, z.color).setStrokeStyle(3, z.accent);
    this.add.text(x, y + 26, z.name, { fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(x, y + 46, roleLabel(z.role), { fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#9b8cff' }).setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.selectedId = z.id;
      this.refresh();
    });
  }

  private makeLockedCard(x: number, y: number, cardW: number): void {
    const cardH = 116;
    this.add.rectangle(x, y, cardW, cardH, 0x121026, 0.7).setStrokeStyle(3, 0x2a2640);
    this.add.circle(x, y - 22, 26, 0x201d3a).setStrokeStyle(3, 0x2f2b4d);
    this.add.text(x, y - 22, '?', { fontFamily: 'system-ui, sans-serif', fontSize: '28px', color: '#4a4670', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(x, y + 30, 'Bientôt', { fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#4a4670' }).setOrigin(0.5);
  }

  /** Panneau fiche : gros avatar cartoon à gauche, barres de stats à droite. */
  private buildFiche(cx: number, h: number): void {
    const panelY = h * 0.6;
    const panelW = 800;
    const panelH = 320;
    this.add.rectangle(cx, panelY, panelW, panelH, 0x141130, 0.92).setStrokeStyle(3, 0x6a4dff).setDepth(1);

    // Colonne gauche : avatar + nom + rôle + capacités.
    this.ficheAvatarX = cx - panelW / 2 + 150;
    this.ficheAvatarY = panelY - 70;
    this.nameText = this.add.text(this.ficheAvatarX, panelY + 4, '', { fontFamily: 'system-ui, sans-serif', fontSize: '26px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(2);
    this.roleText = this.add.text(this.ficheAvatarX, panelY + 34, '', { fontFamily: 'system-ui, sans-serif', fontSize: '16px', color: '#b3a3ff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(2);
    this.abilityText = this.add
      .text(this.ficheAvatarX, panelY + 62, '', { fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#cfcfe6', align: 'center', lineSpacing: 4, wordWrap: { width: 250 } })
      .setOrigin(0.5, 0)
      .setDepth(2);

    // Colonne droite : barres.
    const labelX = cx - 10;
    const trackX = cx + 90;
    this.barTrackW = 250;
    const startY = panelY - 96;
    const rowH = 44;
    STATS.forEach((s, i) => {
      const rowY = startY + i * rowH;
      this.add.text(labelX, rowY, s.label, { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#d8d8ff', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(2);
      this.add.rectangle(trackX, rowY, this.barTrackW, 16, 0x0e0e1c, 0.9).setOrigin(0, 0.5).setStrokeStyle(2, 0x000000, 0.6).setDepth(2);
      const fill = this.add.rectangle(trackX, rowY, 0, 16, s.color).setOrigin(0, 0.5).setDepth(3);
      const val = this.add.text(trackX + this.barTrackW + 12, rowY, '', { fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(3);
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
    this.ficheAvatar.container.setPosition(this.ficheAvatarX, this.ficheAvatarY).setScale(2.1).setDepth(2);
    this.ficheAvatar.setAim(0.35);

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
