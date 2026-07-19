import Phaser from 'phaser';
import type { Room } from 'colyseus.js';
import { PlayerController } from '../input/PlayerController';
import { PITCH_NYXT } from '../maps/pitchNyxt';
import { COLORS } from '../config/constants';
import { TEAM } from '../config/soccer';
import { ZAREKS, ZAREK_BY_ID } from '../zareks/registry';
import type { ZarekDef } from '../core/types';
import { stepMovement } from '../shared/game/movement';
import { clamp, dist } from '../core/geometry';
import { makeButton, type Button } from '../ui/widgets';
import type { MatchSnapshot, SnapPlayer, FxEvent } from '../shared/game/snapshot';

interface Avatar {
  container: Phaser.GameObjects.Container;
  barrel: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  glow: Phaser.GameObjects.Arc;
  zarekId: string;
  team: number;
  isSelf: boolean;
}

const BAR_W = 54;

function zdef(id: string): ZarekDef {
  return ZAREK_BY_ID[id] ?? ZAREKS[0];
}

/**
 * Rendu d'une partie EN LIGNE (Brawl Ball 3v3). Le serveur fait autorité : cette
 * scène envoie les intentions du joueur et affiche l'état reçu. Le joueur local
 * est PRÉDIT (bouge tout de suite, se recale sur le serveur) pour masquer le lag.
 */
export class OnlineGameScene extends Phaser.Scene {
  private room!: Room;
  private zarekId = ZAREKS[0].id;
  private controller!: PlayerController;
  private snap: MatchSnapshot | null = null;

  private avatars = new Map<string, Avatar>();
  private ballGfx!: Phaser.GameObjects.Container;
  private projGfx!: Phaser.GameObjects.Graphics;
  private hazGfx!: Phaser.GameObjects.Graphics;
  private localStub = { x: PITCH_NYXT.centerX, y: PITCH_NYXT.centerY, def: zdef(ZAREKS[0].id) };
  private predX = PITCH_NYXT.centerX;
  private predY = PITCH_NYXT.centerY;
  private camX = 0;
  private camY = 0;

  // HUD
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private hpFill!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private ultFill!: Phaser.GameObjects.Rectangle;
  private bigText!: Phaser.GameObjects.Text;

  // Overlays (salle d'attente / résultat)
  private overlayPhase = '';
  private overlayObjs: Phaser.GameObjects.GameObject[] = [];
  private overlayButtons: Button[] = [];
  private lobbyInfo?: Phaser.GameObjects.Text;
  private lobbyList?: Phaser.GameObjects.Text;

  constructor() {
    super('OnlineGame');
  }

  create(data: { room?: Room; zarekId?: string }): void {
    if (!data?.room) {
      this.scene.start('OnlineMenu');
      return;
    }
    this.room = data.room;
    this.zarekId = data.zarekId ?? ZAREKS[0].id;
    this.localStub.def = zdef(this.zarekId);
    this.snap = null;
    this.avatars = new Map();

    const { width, height } = PITCH_NYXT.map;
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setZoom(1);
    this.drawPitch();

    this.hazGfx = this.add.graphics().setDepth(11);
    this.ballGfx = this.makeBall();
    this.projGfx = this.add.graphics().setDepth(18);

    this.controller = new PlayerController(this);
    this.buildHud();

    this.predX = PITCH_NYXT.centerX;
    this.predY = PITCH_NYXT.centerY;
    this.camX = PITCH_NYXT.centerX;
    this.camY = PITCH_NYXT.centerY;
    this.cameras.main.centerOn(this.camX, this.camY);

    this.room.onMessage('snap', (s: MatchSnapshot) => {
      this.snap = s;
      this.playFx(s.fx);
    });
    this.room.onError((code, message) => this.leave(`Erreur ${code} : ${message ?? ''}`));
    this.room.onLeave(() => this.scene.isActive('OnlineGame') && this.leave());

    this.events.once('shutdown', () => {
      this.controller.destroy();
      this.destroyOverlay();
    });
  }

  update(_time: number, delta: number): void {
    if (!this.room || !this.snap) return;
    const dtMs = Math.min(delta, 50);
    const dtSec = dtMs / 1000;
    const snap = this.snap;
    const meId = this.room.sessionId;
    const me = snap.players.find((p) => p.i === meId);
    const localDef = me ? zdef(me.z) : this.localStub.def;

    // 1) Entrée + prédiction locale (le joueur local bouge tout de suite).
    this.localStub.x = this.predX;
    this.localStub.y = this.predY;
    this.localStub.def = localDef;
    const input = this.controller.getInput(this.localStub as never);

    if (me && me.al && snap.phase === 'playing') {
      let spd = localDef.moveSpeed;
      if (me.carry) spd *= 0.9;
      const moved = stepMovement(this.predX, this.predY, localDef.radius, input.moveX, input.moveY, spd, dtSec, PITCH_NYXT.map.obstacles, PITCH_NYXT.map.width, PITCH_NYXT.map.height);
      this.predX = moved.x;
      this.predY = moved.y;
      // Recalage vers l'autorité serveur : TRÈS doux en mouvement (sinon le retard
      // réseau tire le perso en arrière = effet élastique), plus ferme à l'arrêt.
      const err = dist(this.predX, this.predY, me.x, me.y);
      if (err > 240) {
        this.predX = me.x;
        this.predY = me.y;
      } else {
        const k = input.moveX !== 0 || input.moveY !== 0 ? 0.05 : 0.2;
        this.predX = Phaser.Math.Linear(this.predX, me.x, k);
        this.predY = Phaser.Math.Linear(this.predY, me.y, k);
      }
      this.room.send('input', input);
    } else if (me) {
      this.predX = me.x;
      this.predY = me.y;
    }

    // 2) Avatars.
    const seen = new Set<string>();
    for (const p of snap.players) {
      seen.add(p.i);
      if (!p.al) {
        this.avatars.get(p.i)?.container.setVisible(false);
        continue;
      }
      let av = this.avatars.get(p.i);
      if (!av || av.zarekId !== p.z || av.team !== p.t) {
        av?.container.destroy();
        av = this.spawnAvatar(p, p.i === meId);
      }
      const isSelf = p.i === meId;
      const tx = isSelf ? this.predX : p.x;
      const ty = isSelf ? this.predY : p.y;
      if (isSelf) {
        av.container.setPosition(tx, ty);
      } else {
        av.container.x = Phaser.Math.Linear(av.container.x, tx, 0.35);
        av.container.y = Phaser.Math.Linear(av.container.y, ty, 0.35);
      }
      av.container.setVisible(true);
      av.barrel.setRotation(p.a);
      av.hpFill.width = BAR_W * clamp(p.h / p.hm, 0, 1);
      av.hpFill.fillColor = p.h / p.hm > 0.35 ? COLORS.healthGood : COLORS.healthLow;
      av.glow.setVisible(p.uc >= 100);
    }
    for (const [id, av] of this.avatars) {
      if (!seen.has(id)) {
        av.container.destroy();
        this.avatars.delete(id);
      }
    }

    // 3) Balle, projectiles, zones.
    this.ballGfx.x = Phaser.Math.Linear(this.ballGfx.x, snap.ball.x, 0.5);
    this.ballGfx.y = Phaser.Math.Linear(this.ballGfx.y, snap.ball.y, 0.5);
    this.projGfx.clear();
    for (const p of snap.proj) {
      this.projGfx.fillStyle(p.c, 1).fillCircle(p.x, p.y, p.r);
      this.projGfx.lineStyle(2, 0xffffff, 0.7).strokeCircle(p.x, p.y, p.r);
    }
    this.hazGfx.clear();
    for (const h of snap.haz) {
      this.hazGfx.fillStyle(h.c, 0.18).fillCircle(h.x, h.y, h.r);
      this.hazGfx.lineStyle(3, h.c, 0.7).strokeCircle(h.x, h.y, h.r);
    }

    // 4) Caméra sur le joueur local (prédit).
    const fx = me ? this.predX : PITCH_NYXT.centerX;
    const fy = me ? this.predY : PITCH_NYXT.centerY;
    this.camX = Phaser.Math.Linear(this.camX, fx, 0.12);
    this.camY = Phaser.Math.Linear(this.camY, fy, 0.12);
    this.cameras.main.centerOn(this.camX, this.camY);

    // 5) HUD + overlays.
    this.controller.setUltReady(!!me && me.al && me.uc >= 100 && snap.phase === 'playing');
    this.updateHud(snap, me);
    if (snap.phase !== this.overlayPhase) {
      this.buildOverlay(snap.phase);
      this.overlayPhase = snap.phase;
    }
    this.updateOverlay(snap, me);
  }

  // ---------- Rendu ----------

  private spawnAvatar(p: SnapPlayer, isSelf: boolean): Avatar {
    const def = zdef(p.z);
    const r = def.radius;
    const teamColor = p.t === 0 ? TEAM.colorA : TEAM.colorB;
    const stroke = isSelf ? COLORS.playerAccent : teamColor;
    const glow = this.add.circle(0, 0, r + 8, COLORS.ultReady, 0).setStrokeStyle(4, COLORS.ultReady, 0.9).setVisible(false);
    const barrel = this.add.rectangle(0, 0, r + 16, 8, def.accent).setOrigin(0, 0.5);
    const body = this.add.circle(0, 0, r, def.color).setStrokeStyle(isSelf ? 5 : 4, stroke);
    const hpBack = this.add.rectangle(-BAR_W / 2, -(r + 18), BAR_W, 7, COLORS.healthBack).setOrigin(0, 0.5).setStrokeStyle(1, 0x000000, 0.6);
    const hpFill = this.add.rectangle(-BAR_W / 2, -(r + 18), BAR_W, 7, COLORS.healthGood).setOrigin(0, 0.5);
    const label = this.add
      .text(0, r + 6, isSelf ? `${p.n} (toi)` : p.n, { fontFamily: 'system-ui, sans-serif', fontSize: isSelf ? '14px' : '12px', color: isSelf ? '#ffe066' : '#cfcfe6', fontStyle: isSelf ? 'bold' : 'normal' })
      .setOrigin(0.5, 0);
    const container = this.add.container(p.x, p.y, [glow, barrel, body, hpBack, hpFill, label]).setDepth(isSelf ? 20 : 15);
    const av: Avatar = { container, barrel, hpFill, glow, zarekId: p.z, team: p.t, isSelf };
    this.avatars.set(p.i, av);
    return av;
  }

  private makeBall(): Phaser.GameObjects.Container {
    const r = 20;
    const body = this.add.circle(0, 0, r, COLORS.white).setStrokeStyle(3, 0x1a1a2e, 1);
    const dot = this.add.circle(0, 0, r * 0.34, 0x1a1a2e, 0.9);
    const s1 = this.add.circle(r * 0.55, -r * 0.35, r * 0.2, 0x1a1a2e, 0.7);
    return this.add.container(PITCH_NYXT.centerX, PITCH_NYXT.centerY, [body, dot, s1]).setDepth(14);
  }

  private playFx(fx: FxEvent[]): void {
    for (const f of fx) {
      if (f.k === 'goal') {
        this.cameras.main.shake(260, 0.008);
        for (let i = 0; i < 3; i++) {
          const ring = this.add.circle(f.x, f.y, 40, (f.t ?? 0) === 0 ? TEAM.colorA : TEAM.colorB, 0.15).setStrokeStyle(6, (f.t ?? 0) === 0 ? TEAM.colorA : TEAM.colorB, 0.9).setDepth(26).setScale(0.2);
          this.tweens.add({ targets: ring, scale: 2 + i * 0.6, alpha: 0, duration: 520 + i * 120, ease: 'Cubic.out', onComplete: () => ring.destroy() });
        }
      } else if (f.k === 'ult') {
        const ring = this.add.circle(f.x, f.y, f.r ?? 100, f.c ?? 0xffffff, 0.12).setStrokeStyle(8, f.c ?? 0xffffff, 0.9).setDepth(25).setScale(0.15);
        this.tweens.add({ targets: ring, scale: 1, duration: 320, ease: 'Cubic.out' });
        this.tweens.add({ targets: ring, alpha: 0, duration: 440, ease: 'Quad.in', onComplete: () => ring.destroy() });
      } else if (f.k === 'hit') {
        const s = this.add.circle(f.x, f.y, 9, f.c ?? 0xffffff, 0.9).setDepth(24);
        this.tweens.add({ targets: s, scale: 2, alpha: 0, duration: 180, onComplete: () => s.destroy() });
      } else if (f.k === 'kick') {
        const ring = this.add.circle(f.x, f.y, 26, COLORS.white, 0.1).setStrokeStyle(4, COLORS.white, 0.8).setDepth(23).setScale(0.4);
        this.tweens.add({ targets: ring, scale: 1.2, alpha: 0, duration: 260, ease: 'Cubic.out', onComplete: () => ring.destroy() });
      } else if (f.k === 'death') {
        const s = this.add.circle(f.x, f.y, 26, f.c ?? 0xffffff, 0.5).setStrokeStyle(4, f.c ?? 0xffffff, 1).setDepth(24).setScale(0.6);
        this.tweens.add({ targets: s, scale: 2.6, alpha: 0, duration: 440, ease: 'Cubic.out', onComplete: () => s.destroy() });
      }
    }
  }

  // ---------- HUD ----------

  private buildHud(): void {
    const d = 950;
    this.scoreText = this.add.text(0, 12, '', { fontFamily: 'system-ui, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(d);
    this.timerText = this.add.text(0, 50, '', { fontFamily: 'system-ui, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#d8d8ff' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(d);
    this.add.rectangle(0, 0, 260, 20, COLORS.healthBack, 0.85).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d).setName('hpback').setStrokeStyle(2, 0x000000, 0.6);
    this.hpFill = this.add.rectangle(0, 0, 260, 20, COLORS.healthGood).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d);
    this.hpText = this.add.text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d + 1);
    this.add.rectangle(0, 0, 260, 11, COLORS.healthBack, 0.85).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d).setName('ultback').setStrokeStyle(2, 0x000000, 0.6);
    this.ultFill = this.add.rectangle(0, 0, 0, 11, COLORS.ultReady).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d);
    this.bigText = this.add.text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '52px', fontStyle: 'bold', color: '#ffffff', align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
    this.add.text(20, 16, '‹ Quitter', { fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: '#d8d8ff', fontStyle: 'bold' }).setScrollFactor(0).setDepth(1005).setInteractive({ useHandCursor: true }).on('pointerup', () => this.leave());
    this.layoutHud();
    this.scale.on('resize', this.layoutHud, this);
  }

  private layoutHud(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    this.scoreText.setPosition(w / 2, 12);
    this.timerText.setPosition(w / 2, 50);
    const hx = 24;
    const hy = h - 52;
    (this.children.getByName('hpback') as Phaser.GameObjects.Rectangle)?.setPosition(hx, hy);
    this.hpFill.setPosition(hx, hy);
    this.hpText.setPosition(hx + 8, hy);
    (this.children.getByName('ultback') as Phaser.GameObjects.Rectangle)?.setPosition(hx, hy + 20);
    this.ultFill.setPosition(hx, hy + 20);
    this.bigText.setPosition(w / 2, h / 2 - 60);
  }

  private updateHud(snap: MatchSnapshot, me?: SnapPlayer): void {
    this.scoreText.setText(`${TEAM.labelA}  ${snap.score[0]} — ${snap.score[1]}  ${TEAM.labelB}`);

    if (snap.phase === 'playing') {
      if (snap.sudden) this.timerText.setText('MORT SUBITE').setColor('#ffcf33');
      else {
        const s = Math.ceil(snap.timer / 1000);
        this.timerText.setText(`${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`).setColor(s <= 15 ? '#ff6b5e' : '#d8d8ff');
      }
    } else this.timerText.setText('');

    const ratio = me && me.al ? clamp(me.h / me.hm, 0, 1) : 0;
    this.hpFill.width = 260 * ratio;
    this.hpFill.fillColor = ratio > 0.35 ? COLORS.healthGood : COLORS.healthLow;
    this.hpText.setText(me ? `${Math.ceil(me.al ? me.h : 0)} / ${me.hm}` : '');
    this.ultFill.width = me ? (260 * me.uc) / 100 : 0;
    this.ultFill.fillColor = me && me.uc >= 100 ? COLORS.ultReady : 0x8a7bd8;

    // Grand texte central (compte à rebours / but / réapparition).
    if (snap.phase === 'countdown') {
      this.bigText.setText(`${Math.max(1, Math.ceil(snap.timer / 1000))}`).setColor('#ffcf33').setVisible(true);
    } else if (snap.phase === 'goal') {
      this.bigText.setText('BUT !').setColor('#ffffff').setVisible(true);
    } else if (snap.phase === 'playing' && me && !me.al) {
      this.bigText.setText(`Réapparition dans ${Math.ceil(me.rs / 1000)}…`).setColor('#ff6b5e').setVisible(true);
    } else {
      this.bigText.setVisible(false);
    }
  }

  // ---------- Overlays (salle d'attente / résultat) ----------

  private destroyOverlay(): void {
    for (const b of this.overlayButtons) b.destroy();
    for (const o of this.overlayObjs) o.destroy();
    this.overlayButtons = [];
    this.overlayObjs = [];
    this.lobbyInfo = undefined;
    this.lobbyList = undefined;
  }

  private buildOverlay(phase: string): void {
    this.destroyOverlay();
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;
    const D = 1000;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.overlayObjs.push(o);
      return o;
    };

    if (phase === 'lobby') {
      add(this.add.rectangle(cx, h * 0.42, 520, 300, 0x120f28, 0.92).setStrokeStyle(3, 0x2f8f5a).setScrollFactor(0).setDepth(D));
      add(this.add.text(cx, h * 0.42 - 120, 'SALLE D’ATTENTE', { fontFamily: 'system-ui, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      this.lobbyInfo = add(this.add.text(cx, h * 0.42 - 82, '', { fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: '#ffcf33' }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      add(this.add.text(cx, h * 0.42 - 48, 'Ton équipe :', { fontFamily: 'system-ui, sans-serif', fontSize: '16px', color: '#d8d8ff' }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      this.overlayButtons.push(this.uiButton(cx - 90, h * 0.42 - 12, 150, 46, 'BLEU', 0x2f6fd8, () => this.room.send('team', 0)));
      this.overlayButtons.push(this.uiButton(cx + 90, h * 0.42 - 12, 150, 46, 'ROUGE', 0xc0392b, () => this.room.send('team', 1)));
      this.lobbyList = add(this.add.text(cx, h * 0.42 + 26, '', { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#cfcfe6', align: 'center', lineSpacing: 3 }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(D + 1));
      this.overlayButtons.push(this.uiButton(cx, h * 0.42 + 118, 260, 56, 'DÉMARRER', 0x2f8f5a, () => this.room.send('start')));
    } else if (phase === 'ended') {
      add(this.add.rectangle(cx, h * 0.42, 520, 260, 0x120f28, 0.94).setStrokeStyle(3, 0x6a4dff).setScrollFactor(0).setDepth(D));
      const me = this.snap?.players.find((p) => p.i === this.room.sessionId);
      const winner = this.snap?.winner ?? -1;
      const myTeam = me?.t ?? 0;
      const title = winner < 0 ? 'ÉGALITÉ' : winner === myTeam ? 'VICTOIRE !' : 'DÉFAITE';
      const color = winner < 0 ? '#d8d8ff' : winner === myTeam ? '#ffcf33' : '#ff6b5e';
      add(this.add.text(cx, h * 0.42 - 78, title, { fontFamily: 'system-ui, sans-serif', fontSize: '44px', fontStyle: 'bold', color }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      add(this.add.text(cx, h * 0.42 - 22, `${TEAM.labelA}  ${this.snap?.score[0] ?? 0} — ${this.snap?.score[1] ?? 0}  ${TEAM.labelB}`, { fontFamily: 'system-ui, sans-serif', fontSize: '24px', color: '#d8d8ff' }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      this.overlayButtons.push(this.uiButton(cx - 130, h * 0.42 + 60, 220, 58, 'REVANCHE', 0x2f8f5a, () => this.room.send('rematch')));
      this.overlayButtons.push(this.uiButton(cx + 130, h * 0.42 + 60, 220, 58, 'QUITTER', 0x3a3466, () => this.leave()));
    }
  }

  private uiButton(x: number, y: number, w: number, h: number, label: string, color: number, onClick: () => void): Button {
    const b = makeButton(this, x, y, w, h, label, onClick, color);
    // IMPORTANT : fixer le visuel ET la zone cliquable à l'écran, sinon la zone
    // suit le monde (caméra) et se décale du bouton → impossible à cliquer.
    b.setScrollFactor(0);
    b.container.setDepth(1001);
    return b;
  }

  private updateOverlay(snap: MatchSnapshot, me?: SnapPlayer): void {
    if (snap.phase === 'lobby') {
      if (this.lobbyInfo) this.lobbyInfo.setText(`Départ auto dans ${Math.ceil(snap.timer / 1000)} s  ·  places vides = bots`);
      if (this.lobbyList) {
        const humans = snap.players.filter((p) => !p.bot);
        const line = humans.map((p) => `${p.t === 0 ? '🔵' : '🔴'} ${p.n}${p.i === me?.i ? ' (toi)' : ''}`).join('   ');
        this.lobbyList.setText(humans.length ? line : '(en attente de joueurs)');
      }
    }
  }

  // ---------- Divers ----------

  private leave(message?: string): void {
    try {
      this.room?.leave();
    } catch {
      /* déjà déconnecté */
    }
    if (message) console.warn(message);
    this.scene.start('OnlineMenu', { zarekId: this.zarekId, modeId: 'brawl-ball' });
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
    const drawGoal = (zx: number, zy: number, gh: number, gw: number, color: number) => {
      this.add.rectangle(zx + gw / 2, zy + gh / 2, gw, gh, color, 0.22).setDepth(2);
      this.add.rectangle(zx + gw / 2, zy + gh / 2, gw, gh).setStrokeStyle(5, color, 0.9).setDepth(3);
    };
    const lg = PITCH_NYXT.leftGoal.zone;
    const rg = PITCH_NYXT.rightGoal.zone;
    drawGoal(lg.x, lg.y, lg.h, lg.w, TEAM.colorA);
    drawGoal(rg.x, rg.y, rg.h, rg.w, TEAM.colorB);
    for (const o of PITCH_NYXT.map.obstacles) {
      this.add.rectangle(o.x + o.w / 2, o.y + o.h / 2, o.w, o.h, COLORS.obstacle).setStrokeStyle(2, COLORS.obstacleEdge).setDepth(9);
    }
  }
}
