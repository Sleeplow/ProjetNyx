import Phaser from 'phaser';
import type { Room } from 'colyseus.js';
import { PlayerController } from '../input/PlayerController';
import { PITCH_NYXT } from '../maps/pitchNyxt';
import { COLORS } from '../config/constants';
import { TEAM } from '../config/soccer';

interface Avatar {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Arc;
  targetX: number;
  targetY: number;
  seen: boolean;
}

/** Un joueur reçu dans un snapshot serveur (clés courtes). */
interface SnapPlayer {
  i: string;
  n: string;
  t: number;
  x: number;
  y: number;
  a: number;
}

/**
 * Rendu d'une partie EN LIGNE. Le serveur fait autorité : cette scène envoie les
 * intentions du joueur (`InputState`) et affiche l'état reçu (positions des
 * joueurs), lissé pour rester fluide malgré la latence.
 *
 * Slice 1 (fondation) : déplacement de tout le monde sur le terrain, chacun voit
 * les autres bouger. Combat/balle à venir une fois la boucle réseau validée.
 */
export class OnlineGameScene extends Phaser.Scene {
  private room!: Room;
  private controller!: PlayerController;
  private avatars = new Map<string, Avatar>();
  private snap: SnapPlayer[] = [];
  private localStub = { x: PITCH_NYXT.centerX, y: PITCH_NYXT.centerY, def: { attack: { kind: 'projectile' as const, range: 320 } } };
  private camX = 0;
  private camY = 0;

  constructor() {
    super('OnlineGame');
  }

  create(data: { room?: Room }): void {
    if (!data?.room) {
      this.scene.start('OnlineMenu');
      return;
    }
    this.room = data.room;
    this.avatars = new Map();
    this.snap = [];
    this.room.onMessage('snap', (players: SnapPlayer[]) => {
      this.snap = players;
    });

    const { width, height } = PITCH_NYXT.map;
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setZoom(1);
    this.drawPitch();

    this.controller = new PlayerController(this);

    // Bandeau : code du salon (à partager) + bouton quitter.
    this.add
      .text(this.scale.width / 2, 16, `Salon : ${this.room.roomId}`, { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#ffcf33', fontStyle: 'bold' })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1000);
    this.add
      .text(20, 18, '‹ Quitter', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#d8d8ff', fontStyle: 'bold' })
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.leave());

    this.camX = PITCH_NYXT.centerX;
    this.camY = PITCH_NYXT.centerY;
    this.cameras.main.centerOn(this.camX, this.camY);

    this.room.onError((code, message) => this.leave(`Erreur ${code} : ${message ?? ''}`));
    this.room.onLeave(() => this.scene.isActive('OnlineGame') && this.leave());

    this.events.once('shutdown', () => this.controller.destroy());
  }

  update(_time: number, delta: number): void {
    if (!this.room) return;
    const dtMs = Math.min(delta, 50);

    // 1) Envoi de mon intention (position locale = ma dernière position serveur).
    const me = this.snap.find((p) => p.i === this.room.sessionId);
    if (me) {
      this.localStub.x = me.x;
      this.localStub.y = me.y;
    }
    const input = this.controller.getInput(this.localStub as never);
    this.room.send('input', input);

    // 2) Synchronise les avatars avec le dernier snapshot (création / MAJ / retrait).
    for (const a of this.avatars.values()) a.seen = false;
    for (const p of this.snap) {
      let av = this.avatars.get(p.i);
      if (!av) av = this.spawnAvatar(p.i, p.n, p.t, p.i === this.room.sessionId);
      av.targetX = p.x;
      av.targetY = p.y;
      av.seen = true;
    }
    for (const [id, av] of this.avatars) {
      if (!av.seen) {
        av.container.destroy();
        this.avatars.delete(id);
      }
    }

    // 3) Lissage (interpolation) vers les positions serveur.
    const t = 1 - Math.pow(0.001, dtMs / 1000);
    for (const av of this.avatars.values()) {
      av.container.x = Phaser.Math.Linear(av.container.x, av.targetX, t);
      av.container.y = Phaser.Math.Linear(av.container.y, av.targetY, t);
    }

    // 4) Caméra sur mon avatar.
    const mine = this.avatars.get(this.room.sessionId);
    if (mine) {
      this.camX = Phaser.Math.Linear(this.camX, mine.container.x, 0.1);
      this.camY = Phaser.Math.Linear(this.camY, mine.container.y, 0.1);
      this.cameras.main.centerOn(this.camX, this.camY);
    }
  }

  private spawnAvatar(id: string, name: string, team: number, isSelf: boolean): Avatar {
    const teamColor = team === 0 ? TEAM.colorA : TEAM.colorB;
    const stroke = isSelf ? COLORS.playerAccent : teamColor;
    const body = this.add.circle(0, 0, 26, teamColor).setStrokeStyle(isSelf ? 5 : 4, stroke);
    const label = this.add
      .text(0, 34, isSelf ? `${name} (toi)` : name, { fontFamily: 'system-ui, sans-serif', fontSize: isSelf ? '15px' : '13px', color: isSelf ? '#ffe066' : '#cfcfe6', fontStyle: isSelf ? 'bold' : 'normal' })
      .setOrigin(0.5, 0);
    const container = this.add.container(this.localStub.x, this.localStub.y, [body, label]).setDepth(isSelf ? 20 : 15);
    const av: Avatar = { container, body, targetX: container.x, targetY: container.y, seen: true };
    this.avatars.set(id, av);
    return av;
  }

  private leave(message?: string): void {
    try {
      this.room?.leave();
    } catch {
      /* déjà déconnecté */
    }
    this.scene.start('OnlineMenu');
    if (message) console.warn(message);
  }

  private drawPitch(): void {
    const { width, height } = PITCH_NYXT.map;
    const cx = width / 2;
    const cy = height / 2;
    this.add.rectangle(cx, cy, width, height, COLORS.arenaFloor).setDepth(0);

    const grid = this.add.graphics().setDepth(1);
    grid.lineStyle(1, COLORS.arenaGrid, 0.5);
    for (let x = 0; x <= width; x += 80) grid.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 80) grid.lineBetween(0, y, width, y);

    const lines = this.add.graphics().setDepth(2);
    lines.lineStyle(4, 0x4a4680, 0.7);
    lines.lineBetween(cx, 0, cx, height);
    lines.strokeCircle(cx, cy, 150);

    const drawGoal = (zx: number, h: number, y: number, color: number, w: number) => {
      this.add.rectangle(zx + w / 2, y + h / 2, w, h, color, 0.22).setDepth(2);
      this.add.rectangle(zx + w / 2, y + h / 2, w, h).setStrokeStyle(5, color, 0.9).setDepth(3);
    };
    const lg = PITCH_NYXT.leftGoal.zone;
    const rg = PITCH_NYXT.rightGoal.zone;
    drawGoal(lg.x, lg.h, lg.y, TEAM.colorA, lg.w);
    drawGoal(rg.x, rg.h, rg.y, TEAM.colorB, rg.w);

    for (const o of PITCH_NYXT.map.obstacles) {
      this.add.rectangle(o.x + o.w / 2, o.y + o.h / 2, o.w, o.h, COLORS.obstacle).setStrokeStyle(2, COLORS.obstacleEdge).setDepth(9);
    }
  }
}
