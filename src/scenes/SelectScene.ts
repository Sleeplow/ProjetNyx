import Phaser from 'phaser';
import { ZAREKS } from '../zareks/registry';
import type { ZarekDef } from '../core/types';
import { makeButton, nightBackground } from '../ui/widgets';

/** Écran de sélection du Zarek. */
export class SelectScene extends Phaser.Scene {
  private selectedId = ZAREKS[0].id;
  private details!: Phaser.GameObjects.Text;
  private cardBorders: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  constructor() {
    super('Select');
  }

  create(): void {
    nightBackground(this);
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;

    this.add.text(cx, 60, 'CHOISIS TON ZAREK', { fontFamily: 'system-ui, sans-serif', fontSize: '40px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, 104, 'Mode : Battle Royale — dernier survivant', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#9b8cff' }).setOrigin(0.5);

    // Cartes : les Zareks jouables + des emplacements verrouillés (extension future).
    const lockedSlots = 2;
    const total = ZAREKS.length + lockedSlots;
    const cardW = 150;
    const gap = 18;
    const rowW = total * cardW + (total - 1) * gap;
    let x = cx - rowW / 2 + cardW / 2;
    const cardY = h * 0.44;

    for (const z of ZAREKS) {
      this.makeCard(x, cardY, cardW, z);
      x += cardW + gap;
    }
    for (let i = 0; i < lockedSlots; i++) {
      this.makeLockedCard(x, cardY, cardW);
      x += cardW + gap;
    }

    this.details = this.add
      .text(cx, h * 0.6, '', { fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: '#d8d8ff', align: 'center', lineSpacing: 5, wordWrap: { width: Math.min(760, w - 60) } })
      .setOrigin(0.5, 0);

    makeButton(this, cx, h - 58, 280, 62, 'LANCER LA PARTIE', () => this.scene.start('Game', { zarekId: this.selectedId }));

    this.refresh();
  }

  private makeCard(x: number, y: number, cardW: number, z: ZarekDef): void {
    const cardH = 200;
    const bg = this.add.rectangle(x, y, cardW, cardH, 0x1a1636, 0.95).setStrokeStyle(3, 0x3a3466);
    const border = this.add.rectangle(x, y, cardW, cardH).setStrokeStyle(4, 0xffe066, 0).setFillStyle(0, 0);
    this.cardBorders.set(z.id, border);
    this.add.circle(x, y - 30, 34, z.color).setStrokeStyle(3, z.accent);
    this.add.text(x, y + 26, z.name, { fontFamily: 'system-ui, sans-serif', fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(x, y + 54, roleLabel(z.role), { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#9b8cff' }).setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.selectedId = z.id;
      this.refresh();
    });
  }

  private makeLockedCard(x: number, y: number, cardW: number): void {
    const cardH = 200;
    this.add.rectangle(x, y, cardW, cardH, 0x121026, 0.7).setStrokeStyle(3, 0x2a2640);
    this.add.circle(x, y - 30, 34, 0x201d3a).setStrokeStyle(3, 0x2f2b4d);
    this.add.text(x, y - 30, '?', { fontFamily: 'system-ui, sans-serif', fontSize: '34px', color: '#4a4670', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(x, y + 30, 'Bientôt', { fontFamily: 'system-ui, sans-serif', fontSize: '16px', color: '#4a4670' }).setOrigin(0.5);
  }

  private refresh(): void {
    for (const [id, border] of this.cardBorders) {
      border.setStrokeStyle(4, 0xffe066, id === this.selectedId ? 1 : 0);
    }
    const z = ZAREKS.find((k) => k.id === this.selectedId)!;
    this.details.setText(
      `${z.name} — ${roleLabel(z.role)}\n${z.description}\n\n` +
        `PV ${z.maxHealth}   ·   Vitesse ${z.moveSpeed}   ·   ` +
        `Attaque : ${z.attack.label} (${z.attack.damage}×${z.attack.count})   ·   Ultimate : ${z.ultimate.label}`,
    );
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
