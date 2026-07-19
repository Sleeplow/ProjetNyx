import Phaser from 'phaser';

/** Une ligne du classement. */
export interface BoardRow {
  n: string; // nom
  s: number; // score
  b: boolean; // bot ?
}

type StatusFn = (name: string, isBot: boolean) => 'alive' | 'dead' | null;

const BG = 0x140f2e;
const ROW_A = 0x1c1740;
const ROW_B = 0x161232;
const SELF = 0x2a3d6a;

/**
 * Tableau de classement fixé à l'écran (scrollFactor 0). En-tête + lignes
 * zébrées ; `visible` lignes à la fois, le reste par DÉFILEMENT (molette /
 * glisser). Le défilement décale la FENÊTRE de données (pas de masque : robuste
 * même quand la caméra du jeu bouge). Un point 🟢/💀 reflète la manche en cours.
 */
export class LeaderboardTable {
  readonly container: Phaser.GameObjects.Container;
  private readonly bar: Phaser.GameObjects.Rectangle;
  private readonly zone: Phaser.GameObjects.Zone;
  private rowObjs: Phaser.GameObjects.GameObject[] = [];

  private offset = 0;
  private maxOffset = 0;
  private total = 0;
  private dragging = false;
  private dragStartPtr = 0;
  private dragStartOffset = 0;
  private wheelAcc = 0;

  private rows: BoardRow[] = [];
  private myName?: string;
  private statusOf?: StatusFn;
  private lastSig = '';

  private readonly scene: Phaser.Scene;
  private readonly cx: number;
  private readonly topY: number;
  private readonly w: number;
  private readonly rowH: number;
  private readonly visible: number;
  private readonly titleH = 30;
  private readonly headH = 24;

  private readonly onWheel: (p: Phaser.Input.Pointer, over: unknown, dx: number, dy: number) => void;
  private readonly onMove: (p: Phaser.Input.Pointer) => void;
  private readonly onUp: () => void;

  constructor(scene: Phaser.Scene, cx: number, topY: number, w = 380, visibleRows = 5, rowH = 34, depth = 1004) {
    this.scene = scene;
    this.cx = cx;
    this.topY = topY;
    this.w = w;
    this.rowH = rowH;
    this.visible = visibleRows;

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(depth);
    const panelH = this.titleH + this.headH + visibleRows * rowH + 14;
    const frame = scene.add.rectangle(cx, topY + panelH / 2, w + 20, panelH, BG, 0.96).setStrokeStyle(3, 0x6a4dff, 1);
    const title = scene.add.text(cx, topY + 5, '🏆 CLASSEMENT DE LA SESSION', { fontFamily: 'system-ui, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#ffcf33' }).setOrigin(0.5, 0);
    const left = cx - w / 2;
    const hy = topY + this.titleH + this.headH / 2;
    const hName = scene.add.text(left + 12, hy, 'JOUEUR', { fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#8f8bbf', fontStyle: 'bold' }).setOrigin(0, 0.5);
    const hScore = scene.add.text(cx + w / 2 - 12, hy, 'PTS', { fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#8f8bbf', fontStyle: 'bold' }).setOrigin(1, 0.5);
    const sep = scene.add.rectangle(cx, topY + this.titleH + this.headH, w, 2, 0x3a3466, 1);
    this.bar = scene.add.rectangle(cx + w / 2 + 4, this.bodyTop(), 4, 20, 0x6a4dff, 0.9).setOrigin(0.5, 0).setVisible(false);
    this.container.add([frame, title, hName, hScore, sep, this.bar]);

    this.zone = scene.add.zone(cx, this.bodyTop() + (visibleRows * rowH) / 2, w, visibleRows * rowH).setScrollFactor(0).setInteractive();
    this.zone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.dragging = true;
      this.dragStartPtr = p.y;
      this.dragStartOffset = this.offset;
    });

    this.onWheel = (p, _o, _dx, dy) => {
      if (!this.container.visible || this.maxOffset <= 0 || !this.inBounds(p)) return;
      this.wheelAcc += dy;
      while (Math.abs(this.wheelAcc) >= 40) {
        this.setOffset(this.offset + (this.wheelAcc > 0 ? 1 : -1));
        this.wheelAcc -= Math.sign(this.wheelAcc) * 40;
      }
    };
    this.onMove = (p) => {
      if (!this.dragging) return;
      if (!p.isDown) {
        this.dragging = false;
        return;
      }
      this.setOffset(this.dragStartOffset - Math.round((p.y - this.dragStartPtr) / this.rowH));
    };
    this.onUp = () => {
      this.dragging = false;
    };
    scene.input.on('wheel', this.onWheel);
    scene.input.on('pointermove', this.onMove);
    scene.input.on('pointerup', this.onUp);
    scene.input.on('pointerupoutside', this.onUp);
  }

  private bodyTop(): number {
    return this.topY + this.titleH + this.headH + 2;
  }
  private inBounds(p: Phaser.Input.Pointer): boolean {
    const bt = this.bodyTop();
    return Math.abs(p.x - this.cx) <= this.w / 2 + 12 && p.y >= bt && p.y <= bt + this.visible * this.rowH;
  }
  private setOffset(v: number): void {
    const clamped = Phaser.Math.Clamp(v, 0, this.maxOffset);
    if (clamped === this.offset) return;
    this.offset = clamped;
    this.rebuild();
  }

  /** Met à jour les données (appelable chaque frame ; ne reconstruit que si ça change). */
  setData(rows: BoardRow[], myName?: string, statusOf?: StatusFn): void {
    this.rows = rows;
    this.myName = myName;
    this.statusOf = statusOf;
    this.total = rows.length;
    this.maxOffset = Math.max(0, rows.length - this.visible);
    if (this.offset > this.maxOffset) this.offset = this.maxOffset;

    // Signature de la fenêtre affichée : on ne reconstruit que si elle a changé.
    const win = rows.slice(this.offset, this.offset + this.visible);
    const sig = `${this.offset}|${myName ?? ''}|` + win.map((r) => `${r.n}:${r.s}:${r.b ? 1 : 0}:${statusOf ? statusOf(r.n, r.b) : ''}`).join(',');
    if (sig === this.lastSig) return;
    this.lastSig = sig;
    this.rebuild();
  }

  private rebuild(): void {
    for (const o of this.rowObjs) o.destroy();
    this.rowObjs = [];
    const bt = this.bodyTop();
    const left = this.cx - this.w / 2;
    const win = this.rows.slice(this.offset, this.offset + this.visible);
    win.forEach((r, slot) => {
      const rank = this.offset + slot + 1;
      const ry = bt + slot * this.rowH + this.rowH / 2;
      const isSelf = !r.b && this.myName != null && r.n === this.myName;
      const bgColor = isSelf ? SELF : slot % 2 === 0 ? ROW_A : ROW_B;
      const bg = this.scene.add.rectangle(this.cx, ry, this.w, this.rowH - 2, bgColor, isSelf ? 0.95 : 0.82).setScrollFactor(0);
      const rankT = this.scene.add.text(left + 12, ry, `${rank}`, { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: rank <= 3 ? '#ffcf33' : '#cfcfe6', fontStyle: 'bold' }).setOrigin(0, 0.5).setScrollFactor(0);
      const icon = this.scene.add.text(left + 38, ry, r.b ? '🤖' : '👤', { fontFamily: 'system-ui, sans-serif', fontSize: '15px' }).setOrigin(0.5, 0.5).setScrollFactor(0);
      const st = this.statusOf ? this.statusOf(r.n, r.b) : null;
      const dot = st ? this.scene.add.text(left + 56, ry, st === 'alive' ? '🟢' : '💀', { fontFamily: 'system-ui, sans-serif', fontSize: '10px' }).setOrigin(0, 0.5).setScrollFactor(0) : null;
      const name = this.scene.add
        .text(left + (st ? 76 : 58), ry, r.n + (isSelf ? ' (toi)' : ''), { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: isSelf ? '#ffffff' : '#e8e8ff', fontStyle: isSelf ? 'bold' : 'normal' })
        .setOrigin(0, 0.5)
        .setScrollFactor(0);
      const score = this.scene.add.text(this.cx + this.w / 2 - 12, ry, `${r.s}`, { fontFamily: 'system-ui, sans-serif', fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(1, 0.5).setScrollFactor(0);
      const objs = dot ? [bg, rankT, icon, dot, name, score] : [bg, rankT, icon, name, score];
      for (const o of objs) this.container.add(o);
      this.rowObjs.push(...objs);
    });

    // Barre de défilement.
    if (this.maxOffset > 0) {
      const trackH = this.visible * this.rowH;
      const barH = Math.max(20, (trackH * this.visible) / this.total);
      const t = this.offset / this.maxOffset;
      this.bar.setSize(4, barH).setPosition(this.cx + this.w / 2 + 4, bt + t * (trackH - barH)).setVisible(this.container.visible);
    } else {
      this.bar.setVisible(false);
    }
  }

  setVisible(v: boolean): void {
    this.container.setVisible(v);
    this.zone.setActive(v);
    if (!v) this.bar.setVisible(false);
  }

  destroy(): void {
    this.scene.input.off('wheel', this.onWheel);
    this.scene.input.off('pointermove', this.onMove);
    this.scene.input.off('pointerup', this.onUp);
    this.scene.input.off('pointerupoutside', this.onUp);
    for (const o of this.rowObjs) o.destroy();
    this.zone.destroy();
    this.container.destroy();
  }
}
